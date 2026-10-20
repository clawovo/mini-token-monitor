'use strict';

// OpenCode's own credential set, resolved across both storage generations.
//
// v1 kept it in `<data>/auth.json` (OpenCode's `Auth.all()`), which is what this
// module used to read. v2 moved the same document into the `credential` table of
// opencode.db and stopped writing auth.json, so on a signed-in v2 machine there
// is no file to read at all — the Go subscription key simply vanished from the
// Limits picker. Both generations key the document by provider id (`opencode-go`
// for a Go subscription key), so callers are unchanged.
//
// Precedence, in order:
//   1. OPENCODE_AUTH_CONTENT — v1's inline credential set, which OpenCode set
//      for workspace children; it replaces the whole set rather than overriding
//      one entry. Kept because v1 installs still use it.
//   2. A v2 database's `credential` table. Only a v2 database is authoritative
//      here: a v1 database can carry a `credential` table through the backport
//      migration, but v1 OpenCode still reads auth.json, so a key edited there
//      must keep winning on a v1 machine.
//   3. auth.json, including on a v2 machine where one was left behind by the
//      upgrade — the table's own entries win per provider id, but an id only the
//      leftover file knows about is still a credential the user configured.
//
// v2 also renamed the API-key value: auth.json said `{ type: 'api', key }`, while
// the table stores `{ type: 'key', key }`. That is normalized below, so callers
// keep validating one document shape.

const fs = require('node:fs');
const path = require('node:path');

const { discoverDbPaths, resolveDataDir } = require('./goLimits');
const { isV2Database } = require('./dbSchema');

let sqlite = null;
try { sqlite = require('node:sqlite'); } catch (_) { sqlite = null; }

// One row per credential; `active` is nullable, so a row that never set it must
// not be ranked below one that explicitly says inactive. Newest wins within a
// rank because re-running a connect flow creates a new row and marks it active.
const CREDENTIALS_SQL = `
  SELECT integration_id AS id, value AS credential
  FROM credential
  WHERE integration_id IS NOT NULL AND integration_id <> ''
  ORDER BY COALESCE(active, 1) DESC, time_updated DESC`;

function authFilePath(env = process.env) {
  return path.join(resolveDataDir(env), 'auth.json');
}

function asDocument(value) {
  return value && typeof value === 'object' && !Array.isArray(value) ? value : null;
}

// v2 stores an API key as `{ type: 'key', key }` (`Credential.Api`), while v1's
// auth.json said `{ type: 'api', key }`. Callers validate against the v1 union
// because that is what `Auth.all()` decodes, so the database's shape is
// translated here rather than teaching every caller about two generations. An
// oauth entry already has the same shape in both and is passed through: the Go
// key path rejects it either way, and a future consumer can still see it.
function toAuthDocumentEntry(value) {
  if (value.type === 'key' && typeof value.key === 'string') {
    return { ...value, type: 'api' };
  }
  return value;
}

function readAuthFile(env) {
  let raw;
  try {
    raw = fs.readFileSync(authFilePath(env), 'utf8');
  } catch (_) {
    return null;
  }
  try {
    return asDocument(JSON.parse(raw));
  } catch (_) {
    return null;
  }
}

// Returns `{ document, entries }` when at least one v2 database was readable,
// or null when none was. Sorted path order is the same order the session
// readers use, and the first database to name a provider id wins, so a
// channel-suffixed database resolves consistently across features.
function readDatabaseCredentials(env, deps = {}) {
  const sqliteMod = deps.sqlite !== undefined ? deps.sqlite : sqlite;
  if (!sqliteMod) return null;
  const paths = deps.dbPaths || discoverDbPaths(env);

  const document = {};
  let entries = 0;
  let foundV2 = false;

  for (const dbPath of paths) {
    let db;
    try {
      db = new sqliteMod.DatabaseSync(dbPath, { readOnly: true });
      db.exec('PRAGMA busy_timeout = 250');
      if (!isV2Database(db)) continue;
      foundV2 = true;

      for (const row of db.prepare(CREDENTIALS_SQL).all()) {
        const id = String(row.id || '');
        if (!id || Object.hasOwn(document, id)) continue;
        let credential;
        try {
          credential = asDocument(JSON.parse(String(row.credential || '')));
        } catch (_) {
          continue;
        }
        if (!credential) continue;
        document[id] = toAuthDocumentEntry(credential);
        entries += 1;
      }
    } catch (_) {
      // A locked or half-migrated database is not a reason to drop a credential
      // that auth.json still holds; the next database (or the file) may answer.
    } finally {
      if (db) { try { db.close(); } catch (_) {} }
    }
  }
  return foundV2 ? { document, entries } : null;
}

// Returns `{ document, validated, source }` or null.
//
// `validated` has the same meaning it had for auth.json alone: the file and the
// table are schema-checked by the caller because OpenCode's own decoder drops
// entries that do not match, while the inline variable is passed through as-is
// (upstream returns it straight from JSON.parse).
function readCredentialDocument(env = process.env, deps = {}) {
  const inline = String(env.OPENCODE_AUTH_CONTENT || '').trim();
  if (inline) {
    try {
      return { document: JSON.parse(inline), validated: false, source: 'environment' };
    } catch (_) {
      // Fall through to disk, as upstream's empty catch does: a mangled
      // variable must degrade to the stored credentials, not to none at all.
    }
  }

  const fromDatabase = readDatabaseCredentials(env, deps);
  const fromFile = readAuthFile(env);
  if (!fromDatabase?.entries && !fromFile) return null;

  return {
    document: { ...(fromFile || {}), ...(fromDatabase?.document || {}) },
    validated: true,
    source: fromDatabase?.entries ? 'database' : 'file'
  };
}

module.exports = {
  authFilePath,
  readCredentialDocument,
  readDatabaseCredentials
};
