---
summary: "OpenCode provider notes: the v1/v2 SQLite layouts behind opencode.db, how usage, limits, session metadata and Session Detail read them, and the credential precedence that replaced auth.json in v2."
read_when:
  - Changing or debugging OpenCode usage, limits, session metadata or Session Detail
  - Investigating OpenCode data that is missing after the v2 upgrade
  - Touching providers/opencode/session.js, goApi.js, goLimits.js, credentials.js or dbSchema.js
---

# OpenCode provider

OpenCode 2 kept the data directory and database file name but replaced the SQLite layout, so
every reader has to ask which generation it opened instead of assuming one. The two generations
can coexist on disk (a leftover `auth.json`, a channel database beside the stable one).

| Data plane | Read by | v1 source | v2 source |
| --- | --- | --- | --- |
| Token usage (periods, dashboard, history) | the shared usage collector, through `tokscale` | `opencode.db` | `opencode.db` — the pinned tokscale build already parses v2 |
| Limits | `providers/opencode/limits.js` → `goApi.js` (remote), `goLimits.js` (local ledger) | `auth.json` + `message` | `credential` table + `session_message` |
| Session metadata / titles | collector enrichment, through `session.js` | `session` | `session_v2` |
| Session Detail | `session.js`, on demand | `message` / `part` | `session_message` (content inline) |

## Storage

The data dir is `$XDG_DATA_HOME/opencode` or `~/.local/share/opencode`. `OPENCODE_DB` points the
readers at one exact file; otherwise `discoverDbPaths()` finds `opencode.db` and
`opencode-<channel>.db`, ignoring WAL/SHM/journal side files.

| | v1 | v2 |
| --- | --- | --- |
| Sessions | `session` | `session_v2` |
| Messages | `message` (role and provider in the JSON) | `session_message` (`type` column is the role, provider under `model.providerID`) |
| Message parts | `part` (separate rows) | folded into the message's `content` array |
| Credentials | `auth.json` | `credential` table |

`isV2Database()` in `dbSchema.js` is the single generation test: the presence of
`session_message`. A v2 database is never read through the v1 tables even if a migrated
`message` table is still present, because that would count the same turn twice. A v1 database
is never read through `session_message`, which does not exist there.

## Credentials

`readCredentialDocument()` resolves the credential set, highest precedence first:

1. `TOKEN_MONITOR_OPENCODE_API_KEY` — our own override (`readGoApiKey()` checks it first).
2. `OPENCODE_AUTH_CONTENT` — v1's inline credential set, returned instead of the stored set when
   it parses, not merged with it.
3. The `credential` table of a **v2** database.
4. `auth.json` — including on a v2 machine that kept one through the upgrade. Per provider id the
   table wins; an id only the leftover file knows about still counts.

A v1 database is not authoritative even if a backported migration created `credential` there:
v1 OpenCode still reads `auth.json`, so a key edited in the file must keep winning.

The Go subscription key is stored under the `opencode-go` integration id in both generations (the
`opencode` id is the Zen key, which the Go usage endpoint cannot answer for). The stored value
changed shape, and `credentials.js` normalizes it at the storage boundary:

```
v1 auth.json:            { "opencode-go": { "type": "api", "key": "..." } }
v2 credential.value:     { "type": "key", "key": "..." }
```

Rows are ranked by `active` (a null flag ranks with active) and then `time_updated`, because
`Credential.create` marks a new credential active and flips the previous one off. Oauth entries
are returned unchanged and refused by the Go path, which only sends an API key as a Bearer token.

A signed-in v2 account with an `opencode` oauth row but no `opencode-go` row has no Go API key;
that is a real "not configured", not a lookup failure.

## Session metadata

`session.js` reads titles and timestamps from `session` / `session_v2`, picking the generation
from the same marker. The directory column (`directory`) feeds project attribution. Last activity
is the newest persisted message, not `session.time_updated`, so metadata or background work
cannot make a session look recently used; a message-less session falls back to its creation time.

## Session Detail

Both generations are rewritten into the same `{messages, parts}` shape before `buildEvents()`
totals them, so the two cannot drift:

- v1: role/cost/tokens from the message JSON, text/tool blocks from `part` rows.
- v2: role is the row's `type`; a user prompt is `text` (`metadata.displayText` when `text` is
  empty, e.g. an attachment-only prompt); an assistant turn's `content` contributes only `text`
  and `tool` blocks. Reasoning blocks are not prompts and tool output is not needed.
- `compaction` and other message types are neither prompts nor turns.

Tokens total as `input + output + cacheRead + cacheWrite`, the same way tokscale totals a session.
The DB's stored `tokens.total` adds reasoning on top, so it is not used; reasoning stays
informational, matching Claude/Codex.

## Limits

The remote path needs no setup beyond the credential above. The local Go ledger reads
`providerID = 'opencode-go'` from `$.providerID` (v1) or `$.model.providerID` (v2), restricted to
assistant rows, and sums `$.cost` into the 5h/weekly/monthly windows. It is opt-in
(`opencodeLocalLimitsEnabled`) because the database is device-wide.
