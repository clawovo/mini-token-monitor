'use strict';

// Where penguin-harness keeps its token ledger.
//
// Upstream owns the DB: a SQLite file it calls web.db under its data root, and
// it resolves that path itself as
//   PENGUIN_WEB_DB                     -> that exact file
//   else <root>/web.db
// where <root> is `--root`, then PENGUIN_HOME, then ~/.penguin/data
// (packages/cli/src/commands/server-status.ts and root-option.ts). We mirror the
// same order so an operator who moved the install with PENGUIN_HOME does not have
// to configure us separately.
//
// TOKEN_MONITOR_PENGUIN_DB_PATH is our own override and wins, matching the other
// local adapters — without it a test (or a user with an unusual layout) cannot
// point the reader at a fixture, because PENGUIN_WEB_DB would also move the
// running app's own database.
//
// Upstream resolves a relative PENGUIN_HOME against its own cwd. A collector
// process has no meaningful cwd, so like the other adapters only an absolute
// value is honoured — a relative one is ignored rather than resolved against
// wherever the widget happens to have been launched from.

const os = require('node:os');
const path = require('node:path');

const PENGUIN_DEFAULT_ROOT_SEGMENTS = Object.freeze(['.penguin', 'data']);
const PENGUIN_DB_FILENAME = 'web.db';

function absoluteEnvPath(value) {
  const raw = String(value || '').trim();
  return raw && path.isAbsolute(raw) ? raw : '';
}

function resolvePenguinRoot(options = {}) {
  const home = options.homeDir || os.homedir();
  const env = options.env || process.env;
  return absoluteEnvPath(env.PENGUIN_HOME) || path.join(home, ...PENGUIN_DEFAULT_ROOT_SEGMENTS);
}

function penguinDataPaths(options = {}) {
  const env = options.env || process.env;
  const root = resolvePenguinRoot(options);
  const explicit = absoluteEnvPath(env.TOKEN_MONITOR_PENGUIN_DB_PATH)
    || absoluteEnvPath(env.PENGUIN_WEB_DB);
  return {
    root,
    dbPaths: explicit ? [explicit] : [path.join(root, PENGUIN_DB_FILENAME)]
  };
}

module.exports = {
  PENGUIN_DB_FILENAME,
  penguinDataPaths,
  resolvePenguinRoot
};
