'use strict';

// Reads OpenCode session metadata + per-exchange detail from opencode.db (SQLite).
// This is the only place that reads the DB for *sessions*.
//
// OpenCode v2 renamed the session tables (`session`/`message`/`part` became
// `session_v2`/`session_message`, with message content inline) while keeping the
// same opencode.db file name, so every read below picks the generation from the
// schema it opened instead of assuming v1. A v1 query against a v2 file is not
// "this database is unreadable" — the session would simply lose its detail view
// while tokscale kept counting its tokens.

const { discoverDbPaths } = require('./goLimits');
const { isV2Database, tableColumns } = require('./dbSchema');
const path = require('node:path');

let sqlite = null;
try { sqlite = require('node:sqlite'); } catch (_) { sqlite = null; }

function num(value) {
  const n = Number(value);
  return Number.isFinite(n) ? n : 0;
}

function isoFromMs(ms) {
  const n = Number(ms);
  if (!Number.isFinite(n) || n <= 0) return '';
  return new Date(n).toISOString();
}

function cleanText(text) {
  return String(text || '').replace(/\s+/g, ' ').trim();
}

function resolveSqlite(deps) {
  return deps.sqlite !== undefined ? deps.sqlite : sqlite;
}

function resolvePaths(deps) {
  return deps.dbPaths || discoverDbPaths(deps.env || process.env);
}

function openDb(dbPath, sqliteMod) {
  const db = new sqliteMod.DatabaseSync(dbPath, { readOnly: true });
  db.exec('PRAGMA busy_timeout = 250');
  return db;
}

// ---------------------------------------------------------------------------
// Session metadata (for the list-row timestamps + title)
// ---------------------------------------------------------------------------
function readSessionMeta(sessionIds, deps = {}) {
  const ids = Array.from(sessionIds || []).filter(Boolean).map(String);
  const out = new Map();
  if (ids.length === 0) return out;
  const sqliteMod = resolveSqlite(deps);
  if (!sqliteMod) return out;

  const placeholders = ids.map(() => '?').join(',');
  for (const dbPath of resolvePaths(deps)) {
    let db;
    try {
      db = openDb(dbPath, sqliteMod);
      const v2 = isV2Database(db);
      const sessionTable = v2 ? 'session_v2' : 'session';
      const columns = tableColumns(db, sessionTable);
      if (columns.size === 0) continue;
      const directory = columns.has('directory') ? "COALESCE(directory,'')" : "''";
      const messageColumns = tableColumns(db, v2 ? 'session_message' : 'message');
      const lastMessageBySession = new Map();
      if (messageColumns.has('session_id') && (messageColumns.has('data') || messageColumns.has('time_created'))) {
        const jsonCreated = messageColumns.has('data')
          ? "CASE WHEN json_valid(data) THEN CAST(json_extract(data,'$.time.created') AS INTEGER) END"
          : 'NULL';
        const storedCreated = messageColumns.has('time_created') ? 'time_created' : 'NULL';
        const messageSql = `SELECT session_id AS sessionId,
                                   MAX(CAST(COALESCE(${jsonCreated}, ${storedCreated}) AS INTEGER)) AS lastMessageMs
                            FROM ${v2 ? 'session_message' : 'message'}
                            WHERE session_id IN (${placeholders})
                            GROUP BY session_id`;
        for (const row of db.prepare(messageSql).all(...ids)) {
          lastMessageBySession.set(String(row.sessionId), row.lastMessageMs);
        }
      }
      const sql = `SELECT id, COALESCE(title,'') AS title, ${directory} AS directory, time_created AS created
                   FROM ${sessionTable} WHERE id IN (${placeholders})`;
      for (const r of db.prepare(sql).all(...ids)) {
        const id = String(r.id);
        if (out.has(id)) continue;
        const startedAt = isoFromMs(r.created);
        // session.time_updated can change for metadata/background work. Only a
        // persisted message is real usage activity; a message-less session
        // falls back to its creation time instead of masquerading as recent.
        const lastUsedAt = isoFromMs(lastMessageBySession.get(id)) || startedAt;
        const meta = { startedAt, lastUsedAt, title: String(r.title || '') };
        if (r.directory) meta.projectPath = String(r.directory);
        out.set(id, meta);
      }
    } catch (_) { /* skip unreadable db */ } finally {
      if (db) { try { db.close(); } catch (_) {} }
    }
  }
  return out;
}

function readSessionMetaForHome(sessionIds, home, deps = {}) {
  const env = deps.env || process.env;
  const scopedEnv = {
    ...env,
    OPENCODE_DB: '',
    XDG_DATA_HOME: path.join(home, '.local', 'share'),
    HOME: home,
    USERPROFILE: home
  };
  return readSessionMeta(sessionIds, { ...deps, dbPaths: discoverDbPaths(scopedEnv) });
}

function resolveSessionMetadata(sessionIds, context) {
  const { deps, home, projectIdentity, resolveProjects } = context;
  const readMetadata = deps.readOpencodeMeta || (deps.scopedHome
    ? (ids) => readSessionMetaForHome(ids, home, deps.opencodeDeps)
    : (ids) => readSessionMeta(ids, deps.opencodeDeps));
  const result = new Map();
  for (const [sessionId, meta] of readMetadata(sessionIds)) {
    const startedAt = meta.startedAt || '';
    const lastUsedAt = meta.lastUsedAt || startedAt;
    const identity = resolveProjects ? projectIdentity(meta.projectPath) : {};
    const title = String(meta.title || '').trim();
    if (startedAt || lastUsedAt || identity.projectId || title) {
      result.set(sessionId, { startedAt, lastUsedAt, ...identity, title });
    }
  }
  return result;
}

// ---------------------------------------------------------------------------
// Session detail events (neutral shape consumed by sessionDetail.js)
// ---------------------------------------------------------------------------
const MESSAGES_SQL =
  `SELECT id,
          CAST(COALESCE(json_extract(data,'$.time.created'), time_created) AS INTEGER) AS createdMs,
          json_extract(data,'$.role')             AS role,
          json_extract(data,'$.cost')             AS cost,
          json_extract(data,'$.tokens.input')     AS tInput,
          json_extract(data,'$.tokens.output')    AS tOutput,
          json_extract(data,'$.tokens.reasoning') AS tReasoning,
          json_extract(data,'$.tokens.cache.read')  AS tCacheRead,
          json_extract(data,'$.tokens.cache.write') AS tCacheWrite
   FROM message
   WHERE session_id = ? AND json_valid(data)
   ORDER BY createdMs ASC, id ASC`;

const PARTS_SQL =
  `SELECT message_id AS messageId,
          json_extract(data,'$.type') AS type,
          json_extract(data,'$.text') AS text,
          json_extract(data,'$.tool') AS tool
   FROM part
   WHERE session_id = ? AND json_valid(data)
   ORDER BY time_created ASC, id ASC`;

// v2 keeps role on the row and folds the parts into `content`; a user message's
// prompt is `text` (with `metadata.displayText` as the render the UI shows when
// it differs, e.g. an attachment-only prompt).
//
// The blocks are extracted by SQLite rather than selected as one JSON string per
// message: `content` also holds reasoning text and complete tool output, and a
// long agent session would otherwise copy tens of megabytes into this process
// only to read a block type and a tool name.
const V2_MESSAGES_SQL =
  `SELECT id,
          CAST(COALESCE(json_extract(data,'$.time.created'), time_created) AS INTEGER) AS createdMs,
          type                                       AS role,
          json_extract(data,'$.cost')                AS cost,
          json_extract(data,'$.tokens.input')        AS tInput,
          json_extract(data,'$.tokens.output')       AS tOutput,
          json_extract(data,'$.tokens.reasoning')    AS tReasoning,
          json_extract(data,'$.tokens.cache.read')   AS tCacheRead,
          json_extract(data,'$.tokens.cache.write')  AS tCacheWrite,
          json_extract(data,'$.text')                AS text,
          json_extract(data,'$.metadata.displayText') AS displayText
   FROM session_message
   WHERE session_id = ? AND json_valid(data)
   ORDER BY createdMs ASC, id ASC`;

const V2_PARTS_SQL =
  `SELECT m.id                                        AS messageId,
          json_extract(block.value,'$.type')          AS type,
          json_extract(block.value,'$.text')          AS text,
          json_extract(block.value,'$.name')          AS tool
   FROM session_message AS m, json_each(m.data, '$.content') AS block
   WHERE m.session_id = ? AND m.type = 'assistant' AND json_valid(m.data)
   ORDER BY m.time_created ASC, m.id ASC, block.key ASC`;

function mapTokens(r) {
  const input = num(r.tInput);
  const output = num(r.tOutput);
  const reasoning = num(r.tReasoning);
  const cacheRead = num(r.tCacheRead);
  const cacheWrite = num(r.tCacheWrite);
  // Match how tokscale totals a session: input + output + cacheRead + cacheWrite. OpenCode's
  // stored `tokens.total` ADDS reasoning on top of that, so trusting it over-counts vs the
  // session card. Keep reasoning informational only — same convention as Claude/Codex.
  const total = input + output + cacheRead + cacheWrite;
  return { input, output, cacheRead, cacheWrite, reasoning, total };
}

function buildEvents(messages, parts) {
  const textByMessage = new Map();
  const toolsByMessage = new Map();
  for (const p of parts) {
    if (p.type === 'text' && p.text) {
      if (!textByMessage.has(p.messageId)) textByMessage.set(p.messageId, []);
      textByMessage.get(p.messageId).push(String(p.text));
    } else if (p.type === 'tool' && p.tool) {
      if (!toolsByMessage.has(p.messageId)) toolsByMessage.set(p.messageId, []);
      toolsByMessage.get(p.messageId).push(String(p.tool));
    }
  }

  const events = [];
  let sessionCost = 0;
  for (const m of messages) {
    const timestamp = isoFromMs(m.createdMs);
    if (m.role === 'user') {
      // Each user message is one exchange boundary (even with empty text).
      const text = cleanText((textByMessage.get(m.id) || []).join(' '));
      events.push({ kind: 'prompt', timestamp, text });
    } else if (m.role === 'assistant') {
      const cost = num(m.cost);
      sessionCost += cost;
      const tools = Array.from(new Set(toolsByMessage.get(m.id) || []));
      events.push({ kind: 'turn', timestamp, tokens: mapTokens(m), tools, cost });
    }
  }
  return { events, sessionCost };
}

// v2 rows are rewritten into the same {messages, parts} shape buildEvents already
// understands, so the two generations cannot drift in how they total a turn or
// order an exchange. Only `text` and `tool` blocks become parts: reasoning is
// intentionally not a prompt, and tool output is not needed by Session Detail.
function readV2Messages(db, id) {
  const messages = db.prepare(V2_MESSAGES_SQL).all(id);
  if (messages.length === 0) return null;

  const parts = [];
  for (const row of messages) {
    if (row.role !== 'user') continue;
    const text = String(row.text || row.displayText || '');
    if (text) parts.push({ messageId: row.id, type: 'text', text });
  }
  for (const block of db.prepare(V2_PARTS_SQL).all(id)) {
    if (block.type === 'text' && block.text) {
      parts.push({ messageId: block.messageId, type: 'text', text: String(block.text) });
    } else if (block.type === 'tool' && block.tool) {
      parts.push({ messageId: block.messageId, type: 'tool', tool: String(block.tool) });
    }
  }
  return { messages, parts };
}

function readV1Messages(db, id) {
  const messages = db.prepare(MESSAGES_SQL).all(id);
  if (messages.length === 0) return null;
  return { messages, parts: db.prepare(PARTS_SQL).all(id) };
}

function readSessionEvents(sessionId, deps = {}) {
  const empty = { found: false, events: [], sessionCost: 0 };
  const id = String(sessionId || '');
  if (!id) return empty;
  const sqliteMod = resolveSqlite(deps);
  if (!sqliteMod) return empty;

  for (const dbPath of resolvePaths(deps)) {
    let db;
    try {
      db = openDb(dbPath, sqliteMod);
      const read = isV2Database(db) ? readV2Messages : readV1Messages;
      const rows = read(db, id);
      if (!rows) continue;
      const { events, sessionCost } = buildEvents(rows.messages, rows.parts);
      return { found: true, events, sessionCost };
    } catch (_) { /* skip unreadable db */ } finally {
      if (db) { try { db.close(); } catch (_) {} }
    }
  }
  return empty;
}

module.exports = { readSessionMeta, readSessionMetaForHome, readSessionEvents, resolveSessionMetadata };
