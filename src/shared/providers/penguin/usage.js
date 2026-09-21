'use strict';

// penguin-harness (`penguin`) usage, read straight from its own SQLite ledger.
//
// tokscale does not parse this client, so it is a `locallyParsed` one: excluded
// from the tokscale `--client` list and read here instead, then merged into the
// periods with mergePeriods() exactly like the Qoder CN and Proma adapters.
//
// Upstream table (packages/server/src/db/schema.ts, `usage_records`) is already
// one row per model request, which is why this adapter is much smaller than the
// Qoder CN one: no JSON blobs to unpack and no schema probing.
//
// THE NAMING TRAP — read this before touching normalizePenguinDbRow.
// Upstream's own conversion (packages/core/src/llm/generative-model.ts,
// usageToTokenCounts) defines its four columns as:
//   cache_read  = cached_tokens                     input served from cache
//   cache_write = prompt_tokens                     input that MISSED the cache
//   output      = thoughts_tokens + response_tokens
//   total       = cache_read + cache_write + output
// So their `cache_write` is our `input`, NOT our `cacheWrite`: penguin has no
// cache-creation concept, and copying the column names across would swap cached
// input for uncached input and silently corrupt both the cache-hit rate and the
// cost (the two are priced differently).

const { execFile } = require('node:child_process');
const fs = require('node:fs');
const { promisify } = require('node:util');

const execFileAsync = promisify(execFile);
const { customPricingPath } = require('../../tokscaleConfig');
const { penguinDataPaths } = require('./paths');

const PENGUIN_CLIENT_ID = 'penguin';
const PENGUIN_READ_MAX_BYTES = 50 * 1024 * 1024;
const PENGUIN_READ_MAX_ROWS = 100_000;
const PENGUIN_PRICING_CACHE_TTL_MS = 5 * 60 * 1000;
const PENGUIN_PRICING_LOOKUP_TIMEOUT_MS = 15_000;
const PENGUIN_SQLITE_TIMEOUT_MS = 30_000;

// Only `completed` rows carry tokens. A failed request is stored as a 0-token row
// with its status so upstream can compute a success rate; counting them here
// would add nothing but would inflate the request count.
const PENGUIN_USAGE_COLUMNS = `
SELECT ts, project_id, session_id, provider, model_id,
       cache_read, cache_write, output, total
FROM usage_records
WHERE status = 'completed'`;

// `ts` is UTC ISO while the period windows are local-midnight boundaries, so the
// SQL bound is widened by a day and only used to keep the read small — the
// authoritative window filter is the numeric one in buildPenguinPeriods. A bound
// computed from the local midnight directly would drop rows for every user east
// of UTC.
function penguinUsageSql(sinceMs) {
  if (!Number.isFinite(sinceMs)) return `${PENGUIN_USAGE_COLUMNS}\nORDER BY ts`;
  const widened = new Date(sinceMs - 24 * 60 * 60 * 1000).toISOString();
  return `${PENGUIN_USAGE_COLUMNS}\n  AND ts >= '${widened}'\nORDER BY ts`;
}

const penguinPricingCache = new Map();

function positiveInt(value, fallback) {
  const numeric = Number(value);
  return Number.isFinite(numeric) && numeric > 0 ? Math.floor(numeric) : fallback;
}

function numericOrNull(value) {
  const numeric = Number(value);
  return Number.isFinite(numeric) ? numeric : null;
}

function dbFileExists(dbPath) {
  try {
    return fs.statSync(dbPath).isFile();
  } catch (_) {
    return false;
  }
}

// Translate one upstream row into the shape the rest of the collector speaks.
// The four numbers below are the whole point of this file; see the naming trap
// at the top before changing them.
function normalizePenguinDbRow(row) {
  if (!row || typeof row !== 'object') return null;
  const cacheRead = Math.max(0, numericOrNull(row.cache_read) ?? 0);
  const uncachedInput = Math.max(0, numericOrNull(row.cache_write) ?? 0);
  const output = Math.max(0, numericOrNull(row.output) ?? 0);
  const total = Math.max(0, numericOrNull(row.total) ?? 0);
  if (total === 0 && cacheRead === 0 && uncachedInput === 0 && output === 0) return null;

  const sessionId = String(row.session_id || '').trim();
  if (!sessionId) return null;
  const ts = String(row.ts || '').trim();
  const createdAt = Date.parse(ts);
  const model = String(row.model_id || '').trim();
  if (!model) return null;

  return {
    sessionId: `${PENGUIN_CLIENT_ID}:${sessionId}`,
    messageId: `${PENGUIN_CLIENT_ID}:${sessionId}:${ts}:${model}`,
    model,
    provider: String(row.provider || '').trim(),
    projectLabel: String(row.project_id || '').trim(),
    input: uncachedInput,
    output,
    cacheRead,
    cacheWrite: 0,
    createdAt: Number.isFinite(createdAt) ? createdAt : 0,
    messages: 1
  };
}

function estimatePenguinRowCost(row, pricingByModel) {
  const modelId = String(row?.model || '').trim().toLowerCase();
  const pricing = pricingByModel?.[modelId];
  if (!pricing || typeof pricing !== 'object') return null;
  const components = [
    [row.input, pricing.inputCostPerToken],
    [row.output, pricing.outputCostPerToken],
    [row.cacheRead, pricing.cacheReadInputTokenCost],
    [row.cacheWrite, pricing.cacheCreationInputTokenCost]
  ];
  let cost = 0;
  for (const [tokens, unitCost] of components) {
    if (!tokens) continue;
    if (!Number.isFinite(Number(unitCost)) || Number(unitCost) < 0) return null;
    cost += tokens * Number(unitCost);
  }
  return cost;
}

function penguinPricingRevision() {
  try {
    return fs.statSync(customPricingPath()).mtimeMs;
  } catch (_) {
    return 0;
  }
}

function normalizePenguinPricing(value) {
  if (!value || typeof value !== 'object') return null;
  const fields = [
    'inputCostPerToken',
    'outputCostPerToken',
    'cacheReadInputTokenCost',
    'cacheCreationInputTokenCost'
  ];
  const pricing = {};
  let any = false;
  for (const field of fields) {
    const rate = value[field];
    if (rate === undefined || rate === null) continue;
    const numeric = Number(rate);
    if (!Number.isFinite(numeric) || numeric < 0) continue;
    pricing[field] = numeric;
    any = true;
  }
  return any ? pricing : null;
}

// Cost is not stored upstream — it is derived at query time from whatever
// pricing is current, which is exactly what we do. An unknown model stays
// cost-unavailable rather than inheriting an unrelated catalog entry.
async function resolvePenguinPricing(rows, options = {}) {
  const lookup = options.lookupModelPricing;
  if (typeof lookup !== 'function') return {};
  const revision = options.pricingRevision ?? penguinPricingRevision();
  const nowMs = options.nowMs ?? Date.now();
  const commandTimeoutMs = options.commandTimeoutMs || PENGUIN_PRICING_LOOKUP_TIMEOUT_MS;
  const pricingByModel = {};
  const modelIds = [...new Set((Array.isArray(rows) ? rows : [])
    .map((row) => String(row?.model || '').trim().toLowerCase())
    .filter(Boolean))];
  for (const modelId of modelIds) {
    const cached = penguinPricingCache.get(modelId);
    if (cached && cached.revision === revision && nowMs - cached.at < PENGUIN_PRICING_CACHE_TTL_MS) {
      if (cached.pricing) pricingByModel[modelId] = cached.pricing;
      continue;
    }
    let pricing = null;
    try {
      pricing = normalizePenguinPricing(await lookup(modelId, commandTimeoutMs));
    } catch (_) {
      // Unknown model, offline lookup or a custom channel: leave it unpriced.
    }
    penguinPricingCache.set(modelId, { at: nowMs, revision, pricing });
    if (pricing) pricingByModel[modelId] = pricing;
  }
  return pricingByModel;
}

function readNodeSqlite(dbPath, sql, { maxRows, requireFn = require }) {
  const { DatabaseSync } = requireFn('node:sqlite');
  const database = new DatabaseSync(dbPath, { readOnly: true });
  try {
    const statement = database.prepare(sql);
    const rows = [];
    for (const row of statement.iterate()) {
      rows.push(row);
      if (rows.length >= maxRows) break;
    }
    return rows;
  } finally {
    try {
      database.close();
    } catch (_) {
      // A close failure must not mask the read result.
    }
  }
}

// Read-only, always: the penguin server may be running and holding the same
// database. The CLI is tried first because it is the path that works inside an
// Electron main process, where `node:sqlite` may need a flag; the fallback keeps
// it working on a plain Node runtime.
async function readPenguinDbRows(dbPath, options = {}) {
  const run = options.execFile || execFileAsync;
  const requireFn = options.requireFn || require;
  const maxReadBytes = positiveInt(options.maxReadBytes, PENGUIN_READ_MAX_BYTES);
  const maxReadRows = positiveInt(options.maxReadRows, PENGUIN_READ_MAX_ROWS);
  const sql = options.sql || penguinUsageSql(options.sinceMs);
  try {
    const result = await run('sqlite3', ['-readonly', '-json', '-cmd', '.timeout 3000', dbPath, sql], {
      encoding: 'utf8',
      maxBuffer: maxReadBytes,
      timeout: options.timeoutMs || PENGUIN_SQLITE_TIMEOUT_MS,
      windowsHide: true
    });
    const stdout = String(result?.stdout || '').trim();
    const parsed = JSON.parse(stdout || '[]');
    const rows = Array.isArray(parsed) ? parsed : [];
    return rows.slice(0, maxReadRows);
  } catch (cliError) {
    try {
      return readNodeSqlite(dbPath, sql, { maxRows: maxReadRows, requireFn });
    } catch (nodeError) {
      nodeError.cause = cliError;
      throw nodeError;
    }
  }
}

async function collectPenguinRows(options = {}) {
  const paths = penguinDataPaths(options);
  const rows = [];
  for (const dbPath of paths.dbPaths) {
    if (!dbFileExists(dbPath)) continue;
    const read = await readPenguinDbRows(dbPath, options);
    for (const row of read) {
      const normalized = normalizePenguinDbRow(row);
      if (normalized) rows.push(normalized);
    }
  }
  rows.sort((a, b) => a.createdAt - b.createdAt);
  return rows;
}

// Groups by (session, model) and windows by local midnight, emitting the same
// JSON shape tokscale produces so mergePeriods() can fold it in unchanged.
function buildTokscaleJson(startMs, rows, pricingByModel, includeUndated = false) {
  const grouped = new Map();
  for (const row of rows) {
    if (startMs && (row.createdAt ? row.createdAt < startMs : !includeUndated)) continue;
    const key = `${row.sessionId}\0${row.model}`;
    if (!grouped.has(key)) {
      grouped.set(key, {
        ...row, input: 0, output: 0, cacheRead: 0, cacheWrite: 0,
        messages: 0, startedAt: 0, lastUsedAt: 0, cost: 0
      });
    }
    const group = grouped.get(key);
    group.input += row.input;
    group.output += row.output;
    group.cacheRead += row.cacheRead;
    group.cacheWrite += row.cacheWrite;
    group.messages += row.messages;
    const cost = estimatePenguinRowCost(row, pricingByModel);
    group.cost += cost === null ? 0 : cost;
    if (row.createdAt && (!group.startedAt || row.createdAt < group.startedAt)) group.startedAt = row.createdAt;
    if (row.createdAt > group.lastUsedAt) group.lastUsedAt = row.createdAt;
  }

  const entries = [...grouped.values()].map((row) => ({
    client: PENGUIN_CLIENT_ID,
    mergedClients: null,
    sessionId: row.sessionId,
    model: row.model,
    provider: row.provider || PENGUIN_CLIENT_ID,
    input: row.input,
    output: row.output,
    cacheRead: row.cacheRead,
    cacheWrite: row.cacheWrite,
    reasoning: 0,
    messageCount: row.messages,
    cost: row.cost,
    startedAt: row.startedAt ? new Date(row.startedAt).toISOString() : '',
    lastUsedAt: row.lastUsedAt ? new Date(row.lastUsedAt).toISOString() : '',
    projectLabel: row.projectLabel || '',
    performance: null
  }));
  const sum = (key) => entries.reduce((total, row) => total + row[key], 0);
  return {
    groupBy: 'client,session,model',
    entries,
    totalInput: sum('input'),
    totalOutput: sum('output'),
    totalCacheRead: sum('cacheRead'),
    totalCacheWrite: sum('cacheWrite'),
    totalMessages: sum('messageCount'),
    totalCost: sum('cost'),
    processingTimeMs: 0
  };
}

function buildPenguinPeriods(options = {}) {
  const now = options.now ? new Date(options.now) : new Date();
  const rows = Array.isArray(options.rows) ? options.rows : [];
  const pricingByModel = options.pricingByModel;
  const todayStart = new Date(now.getFullYear(), now.getMonth(), now.getDate()).getTime();
  const monthStart = new Date(now.getFullYear(), now.getMonth(), 1).getTime();
  return {
    today: buildTokscaleJson(todayStart, rows, pricingByModel),
    month: buildTokscaleJson(monthStart, rows, pricingByModel),
    allTime: buildTokscaleJson(0, rows, pricingByModel, true)
  };
}

function resetPenguinCaches() {
  penguinPricingCache.clear();
}

module.exports = {
  PENGUIN_CLIENT_ID,
  buildPenguinPeriods,
  buildTokscaleJson,
  collectPenguinRows,
  estimatePenguinRowCost,
  normalizePenguinDbRow,
  normalizePenguinPricing,
  penguinDataPaths,
  penguinPricingRevision,
  penguinUsageSql,
  readPenguinDbRows,
  resetPenguinCaches,
  resolvePenguinPricing
};
