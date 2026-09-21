'use strict';

const assert = require('node:assert/strict');
const path = require('node:path');
const test = require('node:test');

const {
  buildPenguinPeriods,
  collectPenguinRows,
  estimatePenguinRowCost,
  normalizePenguinDbRow,
  penguinUsageSql,
  readPenguinDbRows
} = require('../../src/shared/providers/penguin/usage');
const { penguinDataPaths, resolvePenguinRoot } = require('../../src/shared/providers/penguin/paths');

function row(overrides = {}) {
  return {
    ts: '2026-09-20T02:00:00.000Z',
    project_id: 'proj-a',
    session_id: 'sess-1',
    provider: 'deepseek',
    model_id: 'deepseek-v4-pro',
    cache_read: 100,
    cache_write: 900,
    output: 50,
    total: 1050,
    ...overrides
  };
}

// The naming trap: upstream's `cache_write` is its own `prompt_tokens`, i.e. the
// input that MISSED the cache, while our `cacheWrite` means cache creation. If
// anyone maps the column names across directly, cached and uncached input swap
// and both the hit rate and the cost go wrong silently.
test('penguin cache_write maps to uncached input, never to our cacheWrite', () => {
  const normalized = normalizePenguinDbRow(row());
  assert.equal(normalized.input, 900, 'uncached input comes from cache_write');
  assert.equal(normalized.cacheRead, 100, 'cached input comes from cache_read');
  assert.equal(normalized.cacheWrite, 0, 'penguin has no cache-creation concept');
  assert.equal(normalized.output, 50);
});

test('the mapped parts add back up to the total upstream reports', () => {
  const source = row();
  const normalized = normalizePenguinDbRow(source);
  const rebuilt = normalized.input + normalized.cacheRead + normalized.cacheWrite + normalized.output;
  assert.equal(rebuilt, source.total, 'total = cached + uncached input + output upstream');
});

test('a completed request with no tokens is dropped rather than counted as a request', () => {
  assert.equal(normalizePenguinDbRow(row({ cache_read: 0, cache_write: 0, output: 0, total: 0 })), null);
});

test('a row missing its session or model is dropped', () => {
  assert.equal(normalizePenguinDbRow(row({ session_id: '' })), null);
  assert.equal(normalizePenguinDbRow(row({ model_id: '  ' })), null);
  assert.equal(normalizePenguinDbRow(null), null);
});

test('negative or non-numeric columns are clamped instead of producing negative usage', () => {
  const normalized = normalizePenguinDbRow(row({ cache_read: -5, cache_write: 'abc', output: null }));
  assert.equal(normalized.cacheRead, 0);
  assert.equal(normalized.input, 0);
  assert.equal(normalized.output, 0);
});

test('session ids and project labels stay attributable', () => {
  const normalized = normalizePenguinDbRow(row());
  assert.equal(normalized.sessionId, 'penguin:sess-1');
  assert.equal(normalized.projectLabel, 'proj-a');
  assert.equal(normalized.model, 'deepseek-v4-pro');
  assert.equal(normalized.provider, 'deepseek');
  assert.equal(normalized.messages, 1);
  assert.equal(normalized.createdAt, Date.parse('2026-09-20T02:00:00.000Z'));
});

test('cost prices cached and uncached input at their own rates', () => {
  const pricing = {
    'deepseek-v4-pro': {
      inputCostPerToken: 1e-6,
      outputCostPerToken: 2e-6,
      cacheReadInputTokenCost: 1e-7,
      cacheCreationInputTokenCost: 3e-6
    }
  };
  const normalized = normalizePenguinDbRow(row());
  // 900 uncached * 1e-6 + 50 output * 2e-6 + 100 cached * 1e-7 + 0 creation.
  assert.equal(estimatePenguinRowCost(normalized, pricing), 900e-6 + 100e-6 + 10e-6);
  assert.equal(estimatePenguinRowCost(normalized, {}), null, 'an unpriced model stays cost-unavailable');
});

test('an unknown model does not inherit the price of a similarly named one', () => {
  const normalized = normalizePenguinDbRow(row({ model_id: 'some-private-model' }));
  const pricing = { 'deepseek-v4-pro': { inputCostPerToken: 1e-6 } };
  assert.equal(estimatePenguinRowCost(normalized, pricing), null);
});

test('periods are windowed by local midnight, and only allTime takes undated rows', () => {
  const now = new Date(2026, 8, 20, 12, 0, 0);           // local 2026-09-20 12:00
  const todayMs = new Date(2026, 8, 20, 3, 0, 0).getTime();  // local today
  const monthMs = new Date(2026, 8, 3, 3, 0, 0).getTime();   // local this month, earlier day
  const oldMs = new Date(2026, 6, 3, 3, 0, 0).getTime();     // local July
  const rows = [
    normalizePenguinDbRow(row({ ts: new Date(todayMs).toISOString(), session_id: 'today' })),
    normalizePenguinDbRow(row({ ts: new Date(monthMs).toISOString(), session_id: 'month' })),
    normalizePenguinDbRow(row({ ts: new Date(oldMs).toISOString(), session_id: 'old' }))
  ];
  const periods = buildPenguinPeriods({ now, rows });
  const sessions = (period) => periods[period].entries.map((entry) => entry.sessionId);
  assert.deepEqual(sessions('today'), ['penguin:today']);
  assert.deepEqual(sessions('month').sort(), ['penguin:month', 'penguin:today']);
  assert.deepEqual(sessions('allTime').sort(), ['penguin:month', 'penguin:old', 'penguin:today']);
});

test('every entry is attributed to the penguin client with the tokscale shape', () => {
  const rows = [normalizePenguinDbRow(row())];
  const periods = buildPenguinPeriods({ now: new Date(2026, 8, 20, 12), rows });
  const entry = periods.allTime.entries[0];
  assert.equal(entry.client, 'penguin');
  assert.equal(entry.provider, 'deepseek');
  assert.equal(entry.groupBy, undefined);
  assert.equal(periods.allTime.groupBy, 'client,session,model');
  assert.equal(periods.allTime.totalInput, 900);
  assert.equal(periods.allTime.totalCacheRead, 100);
  assert.equal(periods.allTime.totalCacheWrite, 0);
  assert.equal(periods.allTime.totalOutput, 50);
  assert.equal(periods.allTime.totalMessages, 1);
});

test('the read only selects completed rows and never a negative window', () => {
  const sql = penguinUsageSql(Date.parse('2026-09-20T00:00:00.000Z'));
  assert.match(sql, /WHERE status = 'completed'/);
  assert.match(sql, /ORDER BY ts/);
  // The bound is widened by a day: the windows are local midnights while ts is
  // UTC, so a bound taken from the local midnight would drop rows east of UTC.
  assert.match(sql, /ts >= '2026-09-19T00:00:00\.000Z'/);
  assert.doesNotMatch(penguinUsageSql(undefined), /ts >=/);
});

test('the read falls back to node:sqlite when the sqlite3 CLI is unavailable', async () => {
  const calls = [];
  const rows = await readPenguinDbRows('/tmp/penguin-web.db', {
    execFile: async (bin) => {
      calls.push(bin);
      throw Object.assign(new Error('spawn sqlite3 ENOENT'), { code: 'ENOENT' });
    },
    requireFn: (id) => {
      assert.equal(id, 'node:sqlite');
      return {
        DatabaseSync: class {
          constructor(path, options) {
            calls.push(`open:${path}:${options?.readOnly === true}`);
          }
          prepare() {
            return { iterate: () => [{ session_id: 's', model_id: 'm', cache_read: 1, cache_write: 2, output: 3, total: 6 }] };
          }
          close() {}
        }
      };
    }
  });
  assert.deepEqual(calls[0], 'sqlite3');
  assert.equal(calls[1], 'open:/tmp/penguin-web.db:true', 'the fallback must open read-only');
  assert.equal(rows.length, 1);
});

test('the sqlite3 CLI is asked for a read-only database', async () => {
  let args = null;
  await readPenguinDbRows('/tmp/penguin-web.db', {
    execFile: async (bin, argv) => {
      assert.equal(bin, 'sqlite3');
      args = argv;
      return { stdout: '[]' };
    }
  });
  assert.equal(args[0], '-readonly');
  assert.equal(args[1], '-json');
  assert.equal(args.at(-2), '/tmp/penguin-web.db');
});

test('a machine without penguin-harness reads nothing instead of throwing', async () => {
  const rows = await collectPenguinRows({
    homeDir: '/nonexistent-home',
    env: { PENGUIN_WEB_DB: '/nonexistent-home/web.db' },
    execFile: async () => {
      throw new Error('must not be reached');
    }
  });
  assert.deepEqual(rows, []);
});

test('a dev-only machine is read, while a machine holding both ledgers is not mixed', () => {
  const homeDir = '/Users/x';
  const primary = path.join(homeDir, '.penguin', 'data', 'web.db');
  const devData = path.join(homeDir, '.penguin', 'dev-data', 'web.db');
  const devCli = path.join(homeDir, '.penguin', 'dev-data-cli', 'web.db');
  const withFiles = (...present) => ({
    statSync: (candidate) => {
      if (present.includes(candidate)) return { isFile: () => true };
      throw Object.assign(new Error('ENOENT'), { code: 'ENOENT' });
    }
  });

  // The case this fallback exists for: only the dev server has ever run here.
  assert.deepEqual(penguinDataPaths({ homeDir, env: {}, fs: withFiles(devData) }).dbPaths, [devData]);
  // The dev CLI's root is the second fallback.
  assert.deepEqual(penguinDataPaths({ homeDir, env: {}, fs: withFiles(devCli) }).dbPaths, [devCli]);
  // Both present: the installed app's ledger stays authoritative and exactly one
  // path comes back, so a sandbox is never added on top of the real numbers.
  assert.deepEqual(penguinDataPaths({ homeDir, env: {}, fs: withFiles(primary, devData) }).dbPaths, [primary]);
  // Neither present: unchanged, so "not installed" still reads nothing.
  assert.deepEqual(penguinDataPaths({ homeDir, env: {}, fs: withFiles() }).dbPaths, [primary]);
  // An explicit root opts out of the fallback entirely.
  assert.deepEqual(
    penguinDataPaths({ homeDir, env: { PENGUIN_HOME: path.resolve('/opt/pg') }, fs: withFiles(devData) }).dbPaths,
    [path.join(path.resolve('/opt/pg'), 'web.db')]
  );
  // An explicit file is honoured even when it does not exist: an instruction to
  // read a named ledger must not quietly read a different one.
  assert.deepEqual(
    penguinDataPaths({ homeDir, env: { TOKEN_MONITOR_PENGUIN_DB_PATH: path.resolve('/tmp/w.db') }, fs: withFiles() }).dbPaths,
    [path.resolve('/tmp/w.db')]
  );
});

test('the database path follows upstream: our override, then PENGUIN_WEB_DB, then PENGUIN_HOME, then the default', () => {
  const homeDir = '/Users/x';
  // Built with path.join rather than written as literal POSIX strings: the
  // adapter composes paths the platform way, so a hardcoded expectation would
  // pass on macOS/Linux and fail on Windows for a reason that is not a defect.
  const defaultRoot = path.join(homeDir, '.penguin', 'data');
  assert.equal(penguinDataPaths({ homeDir, env: {} }).dbPaths[0], path.join(defaultRoot, 'web.db'));
  assert.equal(
    penguinDataPaths({ homeDir, env: { PENGUIN_HOME: path.resolve('/opt/pg') } }).dbPaths[0],
    path.join(path.resolve('/opt/pg'), 'web.db')
  );
  assert.equal(
    penguinDataPaths({ homeDir, env: { PENGUIN_WEB_DB: path.resolve('/tmp/w.db') } }).dbPaths[0],
    path.resolve('/tmp/w.db')
  );
  assert.equal(
    penguinDataPaths({
      homeDir,
      env: { PENGUIN_WEB_DB: path.resolve('/tmp/w.db'), TOKEN_MONITOR_PENGUIN_DB_PATH: path.resolve('/tmp/fixture.db') }
    }).dbPaths[0],
    path.resolve('/tmp/fixture.db'),
    'our own override wins so a test can point at a fixture'
  );
  // Upstream resolves a relative PENGUIN_HOME against its own cwd; a collector
  // process has no meaningful cwd, so it is ignored rather than guessed at.
  assert.equal(resolvePenguinRoot({ homeDir, env: { PENGUIN_HOME: 'relative/dir' } }), defaultRoot);
  // Upstream spells these roots with a `~` in its own docs and dev scripts, so a
  // documented value must not be silently ignored for lacking a leading slash.
  assert.equal(
    penguinDataPaths({ homeDir, env: { PENGUIN_HOME: '~/.penguin/dev-data' } }).dbPaths[0],
    path.join(homeDir, '.penguin', 'dev-data', 'web.db')
  );
  assert.equal(
    penguinDataPaths({ homeDir, env: { TOKEN_MONITOR_PENGUIN_DB_PATH: '~/dev/web.db' } }).dbPaths[0],
    path.join(homeDir, 'dev', 'web.db')
  );
  // A Windows drive letter is absolute and must be honoured there. Guarded rather
  // than asserted unconditionally: on POSIX that string is a relative path, so the
  // env is (correctly) ignored and a single expectation cannot cover both.
  if (process.platform === 'win32') {
    const windowsHome = 'C:\\penguin-home';
    assert.equal(
      penguinDataPaths({ homeDir, env: { PENGUIN_HOME: windowsHome } }).dbPaths[0],
      path.join(windowsHome, 'web.db')
    );
  }
});
