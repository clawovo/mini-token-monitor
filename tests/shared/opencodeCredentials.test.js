'use strict';

// OpenCode 2 moved its credential set out of `auth.json` and into the
// `credential` table of opencode.db, so these tests cover the source precedence
// and the value shape that replaced `{type:'api',key}` with `{type:'key',key}`.
// The v1 path (auth.json) must keep working unchanged, which is why the
// generation is part of every case here rather than a single happy path.

const assert = require('node:assert/strict');
const test = require('node:test');
const fs = require('node:fs');
const os = require('node:os');
const path = require('node:path');

let sqlite = null;
try { sqlite = require('node:sqlite'); } catch (_) { sqlite = null; }

const { readCredentialDocument, readDatabaseCredentials } = require('../../src/shared/providers/opencode/credentials');
const { readGoApiKey } = require('../../src/shared/providers/opencode/goApi');

const maybe = sqlite ? test : test.skip;

const tmpDirs = [];
test.after(() => {
  for (const dir of tmpDirs) fs.rmSync(dir, { recursive: true, force: true });
});

// Builds a data dir with an optional auth.json and an optional opencode.db. A v2
// database carries `session_message` (the generation marker); a v1 one does not,
// even though a backport migration may still have created `credential` there.
function makeStore({ rows = [], auth = null, v2 = true, db = true } = {}) {
  const dir = fs.mkdtempSync(path.join(os.tmpdir(), 'occreds-'));
  tmpDirs.push(dir);
  const dataDir = path.join(dir, 'opencode');
  fs.mkdirSync(dataDir, { recursive: true });
  if (auth !== null) fs.writeFileSync(path.join(dataDir, 'auth.json'), auth);

  if (db) {
    const file = path.join(dataDir, 'opencode.db');
    const database = new sqlite.DatabaseSync(file);
    if (v2) {
      database.exec('CREATE TABLE session_message (id TEXT PRIMARY KEY, session_id TEXT, type TEXT, time_created INTEGER, time_updated INTEGER, data TEXT)');
    }
    database.exec('CREATE TABLE credential (id TEXT PRIMARY KEY, integration_id TEXT, label TEXT NOT NULL, value TEXT NOT NULL, connector_id TEXT, method_id TEXT, active INTEGER, time_created INTEGER NOT NULL, time_updated INTEGER NOT NULL)');
    const ins = database.prepare(
      'INSERT INTO credential (id, integration_id, label, value, connector_id, method_id, active, time_created, time_updated) VALUES (?,?,?,?,?,?,?,?,?)'
    );
    let i = 0;
    for (const row of rows) {
      const created = row.timeCreated ?? i;
      ins.run(
        row.id || `c${i}`,
        row.integrationId === undefined ? 'opencode-go' : row.integrationId,
        row.label || 'key',
        typeof row.value === 'string' ? row.value : JSON.stringify(row.value),
        null,
        null,
        row.active === undefined ? null : row.active,
        created,
        row.timeUpdated ?? created
      );
      i += 1;
    }
    database.close();
  }

  return { env: { XDG_DATA_HOME: dir }, dir, dataDir };
}

maybe('readGoApiKey reads an OpenCode 2 api key from the credential table', () => {
  const { env } = makeStore({ rows: [{ value: { type: 'key', key: 'db-key' } }] });
  assert.strictEqual(readGoApiKey(env), 'db-key');
});

maybe('database credentials are translated into the v1 auth document shape', () => {
  const { env } = makeStore({ rows: [{ value: { type: 'key', key: 'db-key' } }] });
  const source = readCredentialDocument(env);
  assert.strictEqual(source.source, 'database');
  assert.strictEqual(source.validated, true);
  // Callers validate the union `Auth.all()` decodes, so the v2 `key` type is
  // normalized at the storage boundary instead of leaking into every caller.
  assert.deepStrictEqual(source.document['opencode-go'], { type: 'api', key: 'db-key' });
  // Oauth entries already have the same shape in both generations.
  const oauth = makeStore({ rows: [{ integrationId: 'opencode', value: { type: 'oauth', access: 'tok' } }] });
  assert.deepStrictEqual(readCredentialDocument(oauth.env).document.opencode, { type: 'oauth', access: 'tok' });
});

maybe('readGoApiKey ignores an OpenCode 2 Zen-only credential set', () => {
  const { env } = makeStore({
    rows: [{ integrationId: 'opencode', value: { type: 'key', key: 'zen-key' } }]
  });
  assert.strictEqual(readGoApiKey(env), '');
});

maybe('readGoApiKey refuses an OpenCode 2 oauth entry for the Go integration', () => {
  const { env } = makeStore({ rows: [{ value: { type: 'oauth', access: 'tok' } }] });
  assert.strictEqual(readGoApiKey(env), '');
});

maybe('the credential table wins over a leftover auth.json for the same provider', () => {
  const { env } = makeStore({
    auth: JSON.stringify({ 'opencode-go': { type: 'api', key: 'from-file' } }),
    rows: [{ value: { type: 'key', key: 'from-database' } }]
  });
  assert.strictEqual(readGoApiKey(env), 'from-database');
});

maybe('an auth.json entry only the file knows about still counts after the upgrade to v2', () => {
  const { env } = makeStore({
    auth: JSON.stringify({ 'opencode-go': { type: 'api', key: 'from-file' } }),
    rows: [{ integrationId: 'opencode', value: { type: 'oauth', access: 'tok' } }]
  });
  assert.strictEqual(readGoApiKey(env), 'from-file');
});

maybe('a v1 database credential table is not authoritative while v1 still reads auth.json', () => {
  // v1 OpenCode can carry the backported table without reading it. Honouring the
  // table here would make a key edited in auth.json lose on a v1 machine.
  const { env } = makeStore({
    v2: false,
    auth: JSON.stringify({ 'opencode-go': { type: 'api', key: 'from-file' } }),
    rows: [{ value: { type: 'key', key: 'from-database' } }]
  });
  assert.strictEqual(readDatabaseCredentials(env), null);
  assert.strictEqual(readGoApiKey(env), 'from-file');
});

maybe('readGoApiKey falls back to auth.json without node:sqlite', () => {
  const { env } = makeStore({
    auth: JSON.stringify({ 'opencode-go': { type: 'api', key: 'from-file' } }),
    rows: [{ value: { type: 'key', key: 'from-database' } }]
  });
  assert.strictEqual(readGoApiKey(env, { sqlite: null }), 'from-file');
});

maybe('a v2 database without a credential table still leaves auth.json usable', () => {
  const dir = fs.mkdtempSync(path.join(os.tmpdir(), 'occreds-no-table-'));
  tmpDirs.push(dir);
  const dataDir = path.join(dir, 'opencode');
  fs.mkdirSync(dataDir, { recursive: true });
  fs.writeFileSync(path.join(dataDir, 'auth.json'), JSON.stringify({
    'opencode-go': { type: 'api', key: 'from-file' }
  }));
  const database = new sqlite.DatabaseSync(path.join(dataDir, 'opencode.db'));
  database.exec('CREATE TABLE session_message (id TEXT PRIMARY KEY, session_id TEXT)');
  database.close();

  const env = { XDG_DATA_HOME: dir };
  assert.strictEqual(readGoApiKey(env), 'from-file');
});

// `Credential.create` marks a new credential active and flips the previous one
// off, so status outranks recency. A null `active` predates the column being
// used and must not rank below an explicit `false`.
maybe('an active database credential outranks a newer inactive one', () => {
  const { env } = makeStore({
    rows: [
      { id: 'active', value: { type: 'key', key: 'active-key' }, active: 1, timeUpdated: 10 },
      { id: 'inactive', value: { type: 'key', key: 'inactive-key' }, active: 0, timeUpdated: 99 }
    ]
  });
  assert.strictEqual(readGoApiKey(env), 'active-key');
});

maybe('a null active flag ranks with active and recency decides between them', () => {
  const { env } = makeStore({
    rows: [
      { id: 'null', value: { type: 'key', key: 'null-key' }, active: null, timeUpdated: 99 },
      { id: 'off', value: { type: 'key', key: 'off-key' }, active: 0, timeUpdated: 100 }
    ]
  });
  assert.strictEqual(readGoApiKey(env), 'null-key');
});

maybe('two active credentials resolve to the most recently updated one', () => {
  const { env } = makeStore({
    rows: [
      { id: 'old', value: { type: 'key', key: 'old-key' }, active: 1, timeUpdated: 10 },
      { id: 'new', value: { type: 'key', key: 'new-key' }, active: 1, timeUpdated: 20 }
    ]
  });
  assert.strictEqual(readGoApiKey(env), 'new-key');
});

maybe('a malformed database row is skipped rather than hiding the next credential', () => {
  const { env } = makeStore({
    rows: [
      { id: 'broken', value: '{not json', active: 1, timeUpdated: 99 },
      { id: 'good', value: { type: 'key', key: 'good-key' }, active: 0, timeUpdated: 1 }
    ]
  });
  assert.strictEqual(readGoApiKey(env), 'good-key');
});

maybe('the inline credential set still outranks the OpenCode 2 database', () => {
  const { env } = makeStore({ rows: [{ value: { type: 'key', key: 'from-database' } }] });
  const inline = JSON.stringify({ 'opencode-go': { type: 'api', key: 'from-inline' } });
  assert.strictEqual(readGoApiKey({ ...env, OPENCODE_AUTH_CONTENT: inline }), 'from-inline');
});

maybe('our own override outranks the OpenCode 2 database', () => {
  const { env } = makeStore({ rows: [{ value: { type: 'key', key: 'from-database' } }] });
  assert.strictEqual(
    readGoApiKey({ ...env, TOKEN_MONITOR_OPENCODE_API_KEY: 'from-setting' }),
    'from-setting'
  );
});

maybe('the credential source reports which generation answered', () => {
  const database = makeStore({ rows: [{ value: { type: 'key', key: 'db' } }] });
  assert.strictEqual(readCredentialDocument(database.env).source, 'database');
  const file = makeStore({ auth: JSON.stringify({ 'opencode-go': { type: 'api', key: 'file' } }) });
  assert.strictEqual(readCredentialDocument(file.env).source, 'file');
  const both = makeStore({
    auth: JSON.stringify({ 'opencode-go': { type: 'api', key: 'file' } }),
    rows: [{ integrationId: 'opencode', value: { type: 'oauth', access: 'tok' } }]
  });
  assert.strictEqual(readCredentialDocument(both.env).source, 'database');
});
