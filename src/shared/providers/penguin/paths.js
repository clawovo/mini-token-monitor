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

const fs = require('node:fs');
const os = require('node:os');
const path = require('node:path');

const PENGUIN_DEFAULT_ROOT_SEGMENTS = Object.freeze(['.penguin', 'data']);
// Upstream's dev builds keep their ledger in sibling roots rather than `data` (its
// own docs: 7364 `penguin web` -> ~/.penguin/data, 7368 `pnpm dev:server` ->
// ~/.penguin/dev-data, 7369 `pnpm penguin web` -> ~/.penguin/dev-data-cli).
//
// They are separate installs, not a hierarchy: one machine can hold several, and
// the dev scripts choose one by setting PENGUIN_HOME where we cannot see it. So a
// dev root is only a fallback for the case it actually solves — a machine that has
// only ever run the dev server, where the default root has no database at all.
// When the default root does hold one, that ledger stays authoritative; otherwise
// a machine that also uses the installed app would silently start reporting a
// sandbox's usage, and with both present there is no correct way to pick.
// PENGUIN_HOME / TOKEN_MONITOR_PENGUIN_DB_PATH remain the explicit answer for
// "I run the dev server and I want that one".
const PENGUIN_DEV_ROOT_SEGMENTS = Object.freeze([
  Object.freeze(['.penguin', 'dev-data']),
  Object.freeze(['.penguin', 'dev-data-cli'])
]);
const PENGUIN_DB_FILENAME = 'web.db';

function dbFileExists(fsApi, candidate) {
  try {
    return fsApi.statSync(candidate).isFile();
  } catch (_) {
    return false;
  }
}

// Upstream resolves a relative PENGUIN_HOME against its own cwd. A collector
// process has no meaningful cwd, so like the other adapters only an absolute
// value is honoured — a relative one is ignored rather than resolved against
// wherever the widget happens to have been launched from.
//
// A leading `~` is expanded, because it is how upstream spells these roots in its
// own docs and dev scripts (`PENGUIN_HOME=~/.penguin/dev-data`). Requiring the
// caller to rewrite that to an absolute path would turn a documented value into a
// silently ignored one.
function absoluteEnvPath(value, homeDir) {
  const raw = String(value || '').trim();
  if (!raw) return '';
  if (raw === '~') return homeDir;
  if (raw.startsWith('~/') || raw.startsWith('~\\')) return path.join(homeDir, raw.slice(2));
  return path.isAbsolute(raw) ? raw : '';
}

function resolvePenguinRoot(options = {}) {
  const home = options.homeDir || os.homedir();
  const env = options.env || process.env;
  return absoluteEnvPath(env.PENGUIN_HOME, home) || path.join(home, ...PENGUIN_DEFAULT_ROOT_SEGMENTS);
}

function penguinDataPaths(options = {}) {
  const home = options.homeDir || os.homedir();
  const env = options.env || process.env;
  const fsApi = options.fs || fs;
  const root = resolvePenguinRoot(options);
  const explicit = absoluteEnvPath(env.TOKEN_MONITOR_PENGUIN_DB_PATH, home)
    || absoluteEnvPath(env.PENGUIN_WEB_DB, home);
  // An explicit path is used whether or not it exists: it is an instruction, and
  // silently reading a different ledger than the one named would be worse than
  // reporting nothing.
  if (explicit) return { root, dbPaths: [explicit] };

  const primary = path.join(root, PENGUIN_DB_FILENAME);
  const overriddenRoot = root !== path.join(home, ...PENGUIN_DEFAULT_ROOT_SEGMENTS);
  if (overriddenRoot) return { root, dbPaths: [primary] };

  const candidates = [primary, ...PENGUIN_DEV_ROOT_SEGMENTS.map((segments) => path.join(home, ...segments, PENGUIN_DB_FILENAME))];
  const existing = candidates.filter((candidate) => dbFileExists(fsApi, candidate));
  // Exactly one path, never several: reading two roots would add a sandbox's usage
  // on top of the real ledger instead of choosing between them.
  return { root, dbPaths: [existing[0] || primary] };
}

module.exports = {
  PENGUIN_DB_FILENAME,
  penguinDataPaths,
  resolvePenguinRoot
};
