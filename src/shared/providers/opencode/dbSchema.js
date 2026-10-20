'use strict';

// OpenCode's SQLite layout changed in v2, and both generations are still found
// in the wild (a v2 install keeps the same opencode.db file name), so every
// reader asks which generation it is holding instead of letting a query throw.
// A missing table is not an error: a v1 file has no `session_message`, a v2 file
// has no `message`, and the caller must not treat "this is the other generation"
// as "this database is unreadable" — that is how a whole client disappears.
//
//   v1: `session` / `message` / `part`
//       role and provider live in the message JSON, parts are separate rows.
//   v2: `session_v2` / `session_message`
//       the role is the row's `type`, provider moved under `model.providerID`,
//       and message content (text/tool blocks) is inline in the message JSON.
//       `credential` replaces auth.json.

function tableNames(db) {
  const rows = db.prepare("SELECT name FROM sqlite_master WHERE type = 'table'").all();
  const names = new Set();
  for (const row of rows) names.add(String(row.name));
  return names;
}

function hasTable(db, name) {
  return tableNames(db).has(name);
}

// The v2 marker. Chosen over `session_v2` because it is the table every message
// reader needs; a v2 database always creates it, even before the first session.
function isV2Database(db) {
  return hasTable(db, 'session_message');
}

function tableColumns(db, name) {
  const rows = db.prepare(`PRAGMA table_info(${name})`).all();
  const columns = new Set();
  for (const row of rows) columns.add(String(row.name));
  return columns;
}

module.exports = { tableNames, hasTable, isV2Database, tableColumns };
