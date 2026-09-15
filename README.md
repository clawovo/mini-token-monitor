<p align="right">
   <strong>EN</strong> | <a href="./README.zh-CN.md">简</a> | <a href="./README.zh-TW.md">繁</a> | <a href="./README.ko.md">KO</a> | <a href="./README.ja.md">JA</a>
</p>
<div align="center">
    <img src=".github/assets/app.png" alt="Mini Token Monitor logo" width="120">
    <h1>Mini Token Monitor</h1>
</div>

<p align="center">
    <em>The mini edition that aggregates live usage and remaining limits for every AI coding tool.</em>
</p>

<div align="center">
    <img src=".github/assets/main-1.png"  width="350"><img src=".github/assets/main-2.png"  width="350">
</div>

## What is Mini Token Monitor?

A menu-bar widget that shows live token usage and AI Tool Limits across 36+ AI coding tools — Claude Code, Codex, Cursor, GitHub Copilot, Cherry Studio, and more — with real-time trends and breakdowns by tool, model, session, or project.

## Supported Tools

Mini Token Monitor supports token usage, account-limit checks, and session details separately:

| Logo | Tool | Data path | Token Usage | AI Tool Limits | Session Details |
|:---:|------|-----------|:---:|:---:|:---:|
| <img src=".github/assets/tools-icon/claude.png" width="28" alt="Claude Code" /> | Claude Code | `~/.claude/projects/`, `~/.claude/transcripts/` | ✅ | ✅ | ✅ |
| <img src=".github/assets/tools-icon/codex.png" width="28" alt="Codex" /> | Codex | `~/.codex/` (`sessions/`, `archived_sessions/`) | ✅ | ✅ | ✅ |
| <img src=".github/assets/tools-icon/opencode.png" width="28" alt="OpenCode" /> | OpenCode | `~/.local/share/opencode/` (`opencode*.db`, `storage/message/`) | ✅ | ✅ | ✅ |
| <img src=".github/assets/tools-icon/hermes-agent.png" width="28" alt="Hermes Agent" /> | Hermes Agent | `~/.hermes/state.db` | ✅ | — | — |
| <img src=".github/assets/tools-icon/openclaw.png" width="28" alt="OpenClaw" /> | OpenClaw | `~/.openclaw/agents/` | ✅ | — | — |
| <img src=".github/assets/tools-icon/cursor.png" width="28" alt="Cursor" /> | Cursor IDE / Cursor CLI | `~/.config/tokscale/cursor-cache/` (account-level usage export) | ✅ | ✅ | — |
| <img src=".github/assets/tools-icon/antigravity.png" width="28" alt="Antigravity" /> | Antigravity | `~/.gemini/` (`antigravity/`, `antigravity-ide/`, `antigravity-backup/`, `antigravity-cli/conversations/`) | ✅ | ✅ | — |
| <img src=".github/assets/tools-icon/cline.png" width="28" alt="Cline" /> | Cline | VS Code globalStorage tasks (`.../saoudrizwan.claude-dev/tasks/`), `~/.cline/data/sessions/` | ✅ | — | — |
| <img src=".github/assets/tools-icon/droid.png" width="28" alt="Factory Droid" /> | Factory Droid | `~/.factory/sessions/` | ✅ | — | — |
| <img src=".github/assets/tools-icon/kimi.png" width="28" alt="Kimi" /> | Kimi CLI / Kimi Code / Kimi Work | `~/.kimi/sessions/`, `~/.kimi-code/sessions/`, `<platform-app-data>/kimi-desktop/` | ✅ | ✅ | — |
| <img src=".github/assets/tools-icon/qwen.png" width="28" alt="Qwen" /> | Qwen CLI | `~/.qwen/projects/` | ✅ | — | — |
| <img src=".github/assets/tools-icon/xai.png" width="28" alt="Grok Build" /> | Grok Build | `~/.grok/` (`sessions/`, `logs/unified.jsonl`) | ✅ | ✅ | — |
| <img src=".github/assets/tools-icon/copilot.png" width="28" alt="GitHub Copilot" /> | GitHub Copilot | VS Code `workspaceStorage/*/chatSessions/`, `~/.copilot/` (`otel/`, `data.db`) | ✅ | ✅ | — |
| <img src=".github/assets/tools-icon/pi.png" width="28" alt="Pi" /> | Pi / Oh My Pi | `~/.pi/agent/sessions/`, `~/.omp/agent/sessions/` | ✅ | — | — |
| <img src=".github/assets/tools-icon/zed.png" width="28" alt="Zed" /> | Zed | `~/.local/share/zed/threads/threads.db` | ✅ | ✅ | — |
| <img src=".github/assets/tools-icon/kilo.png" width="28" alt="Kilo" /> | Kilo | `~/.local/share/kilo/kilo.db`; VS Code globalStorage tasks (`.../kilocode.kilo-code/tasks/`) — extension logs on Linux & remote/WSL only | ✅ | — | — |
| <img src=".github/assets/tools-icon/commandcode.png" width="28" alt="Command Code" /> | Command Code | `~/.commandcode/projects/**/*.jsonl` | ✅ | ✅ | — |
| <img src=".github/assets/tools-icon/mimo-code.png" width="28" alt="MiMo Code" /> | MiMo Code | `~/.local/share/mimocode/mimocode.db` | ✅ | ✅ | — |
| <img src=".github/assets/tools-icon/zcode.png" width="28" alt="ZCode" /> | ZCode / GLM | `~/.zcode/` (`projects/`, `cli/db/db.sqlite`) | ✅ | ✅ | — |
| <img src=".github/assets/tools-icon/kiro.png" width="28" alt="Kiro" /> | Kiro | `~/.kiro/sessions/cli/`, Kiro IDE globalStorage & `kiro-cli` DB | ✅ | ✅ | — |
| <img src=".github/assets/tools-icon/codebuddy.png" width="28" alt="CodeBuddy" /> | CodeBuddy | `~/.codebuddy/projects/` + IDE / VS Code extension logs | ✅ | — | — |
| <img src=".github/assets/tools-icon/workbuddy.png" width="28" alt="WorkBuddy" /> | WorkBuddy | `~/.workbuddy/projects/`, `~/.workbuddy/workbuddy.db` | ✅ | ✅ | — |
| <img src=".github/assets/tools-icon/proma.png" width="28" alt="Proma" /> | Proma | `~/.proma/agent-sessions/*.jsonl` | ✅ | — | — |
| <img src=".github/assets/tools-icon/qoder.png" width="28" alt="Qoder" /> | Qoder | `<platform-app-data>/QoderCN/SharedClientCache/cache/db/local.db` (CN only) | ✅ | ✅ | — |
| <img src=".github/assets/tools-icon/reasonix.png" width="28" alt="Reasonix" /> | Reasonix | `~/.reasonix/` (`stats/`, `sessions/`, `projects/*/sessions/`) | ✅ | — | — |
| <img src=".github/assets/tools-icon/deepseek.png" width="28" alt="DeepSeek" /> | DeepSeek / DeepSeek Harness | `~/.dsh/sessions/` (`session.jsonl`, `session.jsonl.zstd`) | ✅ | ✅ | ✅ |
| <img src=".github/assets/tools-icon/cherrystudio.png" width="28" alt="Cherry Studio" /> | Cherry Studio | `<platform-app-data>/CherryStudio/` (`Data/Agents/.claude/projects/` V2, `.claude/projects/` legacy) | ✅ | — | — |
| <img src=".github/assets/tools-icon/lmstudio.png" width="28" alt="LM Studio" /> | LM Studio | `~/.lmstudio/server-logs/**/*.log` | ✅ | — | — |
| <img src=".github/assets/tools-icon/unsloth.png" width="28" alt="Unsloth" /> | Unsloth Studio | `~/.unsloth/studio/studio.db` | ✅ | — | — |
| <img src=".github/assets/tools-icon/openrouter.png" width="28" alt="OpenRouter" /> | OpenRouter | OpenRouter API key (usage/key limit; balance when credits access is authorized, documented for Management keys) | — | ✅ | — |
| <img src=".github/assets/tools-icon/minimax.png" width="28" alt="Minimax" /> | Minimax | Minimax API key (Token Plan quota via Minimax API) | — | ✅ | — |
| <img src=".github/assets/tools-icon/volcengine.png" width="28" alt="Volcengine" /> | Volcengine | Ark API key or Volcengine AK/SK (Ark Coding Plan & Agent Plan quota via Volcengine API) | — | ✅ | — |
| <img src=".github/assets/tools-icon/ollama.png" width="28" alt="Ollama" /> | Ollama | Ollama Cloud cookie (session/weekly usage via ollama.com/settings) | — | ✅ | — |
| <img src=".github/assets/tools-icon/trae.png" width="28" alt="Trae CN" /> | Trae CN | Trae CN access token (Trae CN / SOLO credits via trae.cn) | — | ✅ | — |
| <img src=".github/assets/tools-icon/alibaba.png" width="28" alt="Alibaba Cloud" /> | Alibaba Cloud | Alibaba Cloud console cookie (Bailian / Model Studio Token Plan quota, Team & Personal) | — | ✅ | — |
| <img src=".github/assets/tools-icon/thirdparty.gif" width="28" alt="Third-party APIs" /> | Third-party APIs | New API / Sub2API-compatible account presets (including compatible One API forks), a New API API-key preset, and a Custom balance endpoint | — | ✅ | — |

<details>
<summary><strong>Notes, Custom balance endpoints, and data paths overridden by environment variables</strong></summary>

<br>

- Paths above are the defaults. Mini Token Monitor follows the same environment overrides Tokscale does — `$XDG_DATA_HOME` for the `~/.local/share/` roots, and per-tool variables such as `$CODEX_HOME`, `$GROK_HOME`, `$HERMES_HOME`, `$KIMI_CODE_HOME`, `$UNSLOTH_STUDIO_HOME`, `$LM_STUDIO_HOME`, `$DSH_HOME`, `$REASONIX_STATE_HOME`, `$REASONIX_HOME` and the `$CLINE_*` family.
- LM Studio tracking currently covers OpenAI-compatible `/v1/chat/completions` and `/v1/responses` requests recorded in server logs. Conversations started from LM Studio's built-in Chat UI and native `/api/v1/chat` requests are not included.
- Unsloth Studio tracks inference usage from `studio.db`: Studio chats and its local API. Local inference has zero API cost; recognized metered providers use Tokscale's price estimates. Training tokens are not included. See [Unsloth source notes](docs/providers/unsloth.md).

- Command Code transcripts do not contain actual token counts or per-message model metadata. Token usage is estimated from transcript text, while model attribution and derived cost may reflect the currently configured model rather than the model historically used for each request.
- The Cursor cache comes from Cursor's account-level usage export, so it covers Cursor IDE and Cursor CLI alike. Mini Token Monitor automatically detects accounts signed in through the Cursor desktop app and also supports adding accounts manually in Settings. The cache re-syncs automatically when stale, but newly finished sessions can take a few minutes to reach Cursor's dashboard, so usage updates on sync rather than instantly.

- Custom maps numeric JSON fields from one GET balance endpoint; OpenAI or Anthropic compatibility alone is not enough.

#### Qoder CN (local adapter)

Qoder CN token usage is read from the app's local SQLite database, not an API — enable it in Settings → tools (opt-in, off by default). The database is auto-detected per platform: macOS `~/Library/Application Support/QoderCN/SharedClientCache/cache/db/local.db`, Windows `%APPDATA%\QoderCN\SharedClientCache\cache\db\local.db`, Linux `~/.config/QoderCN/SharedClientCache/cache/db/local.db` — overridable with `TOKEN_MONITOR_QODER_CN_DB_PATH`.

This is an advanced local integration: reading needs a `sqlite3` CLI on PATH or a Node runtime with unflagged `node:sqlite` (Node ≥ 23.4; the Electron widget may need the CLI). Read failures are logged, and an existing complete snapshot is retained instead of being replaced with zero usage. Costs are estimated from the models.dev catalog for each mapped model; the adapter may break if Qoder changes its database schema.
</details>

## Why Mini Token Monitor?

Most usage monitors are useful only on the machine they run on. Mini Token Monitor is local-first: the widget reads this machine's logs directly and shows token changes within seconds, with no server required. It is the trimmed edition of Token Monitor with a single menu-bar entry; the optional `npm run agent` can report usage to a hub you run yourself.

## Features

### Tracking usage

- **Live token tracking** — Claude Code, Codex, Cursor, GitHub Copilot, Antigravity, OpenCode, and 29+ AI tools, with the UI updating within seconds of each turn (full list in the table above)
- **Live token rate** — an optional live readout of generation speed in `tok/s` or total burn in `tok/min`
- **Per-session detail** — open a session to see tokens per prompt, expandable to each reply's exact token split and tools used (read on-demand from local transcripts or databases, never synced)
- **Cache hit statistics** — click any tool or model to expand a detailed breakdown of input tokens (cache hit vs miss), output tokens, and hit-rate percentages
- **Cost & currency** — cost alongside token counts, shown in USD, TWD, HKD, or CNY; exchange rates auto-update daily and can be manually overridden in Settings
- **Custom scan paths** — point a tool at extra session folders when yours live outside the defaults
- **WSL usage (Windows)** — file-based usage from a running WSL distro is detected automatically and merged about every 5 minutes; SQLite-backed tools such as OpenCode and Hermes may require a [headless agent inside WSL](docs/wsl-sqlite-setup.md)

### Limits, trends & export

- **AI Tool Limits detection** — provider-specific session, daily, weekly, billing, and credits windows for Claude Code, Codex, Cursor, OpenRouter, third-party APIs, GLM, Kimi, and 23+ providers, including multiple OpenRouter/third-party profiles and balance-style accounts (Claude credits, DeepSeek prepaid balance and spend history, third-party balances)
- **Multiple accounts & Codex switching** — track several accounts per provider, each with its own limits; a tracked Codex account can be switched as the active local account in one click, without re-authenticating
- **Codex reset forecast** — an optional third-party forecast below Codex limits, showing the expected reset time, the reset type (Regular or Banked), and when the window last reset
- **Preserve deleted session usage** — many tools prune old sessions (Claude Code drops transcripts after 30 days by default), losing that history. When enabled, Mini Token Monitor archives observed daily tool/model usage locally so the heatmap and trends survive even after the source files are gone (see [Session data retention](#session-data-retention) below)
- **Usage Trends & Dashboard** — a home-screen activity heatmap and trend chart, plus a dedicated dashboard window with streaks and stacked per-tool/per-model history (bar and K-line views)
- **Fixed usage ranges** — switch between This week, Last 7 days, and Last 30 days alongside the native day, month, and total periods
- **Optional Status view** — Claude, OpenAI, Cursor, and DeepSeek status pages, with manual or interval re-checks
- **Data export** — export usage as tool-agnostic CSV + JSON, manually or auto-written to a folder, for spreadsheets, Obsidian, Grafana, or scripts; see [docs/export.md](docs/export.md)
- **Subscription records** — record by hand what each AI account actually costs; the plan label's tooltip then reports the price, the next renewal or end date, time subscribed, and the month's usage cost as a multiple of what the plan costs, for recurring plans and top-up ledgers alike

### Interface & surfaces

- **Breakdown views** — grouped by tool, model, session, project, or account limits
- **Menu bar (macOS) and system tray (Windows) popover** — live cost, tokens, or the closest-to-empty provider limit % next to the icon
- **Menu bar layout composer** — the menu bar and the floating bubble can use a built-in preset or a layout you build yourself: pick "Custom…" to add AI tool icons, quota bars, percentages, reset times, cost, the live token rate, or custom text, drag to reorder against a live preview, and give each item its own AI tool, account, quota window, and typeface
- **Appearance controls** — interface theme (Obsidian / Porcelain, following the system by default), per-tool vendor colours, glass opacity, blur, transparent window mode, and custom fonts
- **Customizable tool list** — hide, pin, and reorder tools in the main dashboard without changing what gets tracked
- **Discord Rich Presence** — broadcast today's tokens, cost, and top client (opt-in)

## Installation

Download from [GitHub Releases](https://github.com/clawovo/mini-token-monitor/releases).

- **macOS (Apple Silicon)** — `.dmg`, unsigned
- **macOS (Intel)** — x64 `.dmg`, unsigned
- **Windows 10/11** — setup and portable `.exe`, [code-signed](docs/code-signing.md)
- **Linux x64** — `.AppImage`

Packaged builds check GitHub Releases automatically. When an update is available, the app shows an update indicator; supported platforms can also install from Settings → General.

## App data

App state lives in the OS user-data dir — delete it along with the app to fully uninstall.

| Platform | Path |
|----------|------|
| macOS | `~/Library/Application Support/Token Monitor/` |
| Windows | `%APPDATA%/Token Monitor/` |
| Linux | `~/.config/Token Monitor/` |

## Build from source

To build your own installer, use Node.js 22.15+ on the **target** OS (electron-builder can't cross-build a macOS `.dmg` on Windows, or vice-versa).

```bash
npm install
npm run dist:mac     # macOS arm64 .dmg           → dist/
npm run dist:mac:x64 # macOS Intel x64 .dmg       → dist/
npm run dist:win     # Windows x64 installer .exe → dist/
npm run dist:linux   # Linux x64 AppImage         → dist/
npm run pack         # unpacked app dir (no installer), for quick local testing
```

Output lands in `dist/`. Windows and Linux use the matching `dist:*` script above on the target OS. Packaging the macOS release build requires a local Developer ID Application signing identity; use `npm start` for local development or unsupported platforms.

Runtime and packaging scripts explicitly ensure the pinned tokscale binary on the four vendored targets. Other source platforms keep the npm binary and filter clients it does not support; `npm install`, lint, and tests do not download it.

## How it works

```text
Local (default, no setup)
    widget (Electron) ──▶ tokscale ──▶ ~/.claude, ~/.codex, $HERMES_HOME
```

The widget is always local — it reads this machine's logs directly and needs no hub. The optional `npm run agent` collects usage on a machine without a widget and reports it to a hub you run yourself.

## Session data retention

With **Preserve deleted session usage** enabled (Settings → Collection), Mini Token Monitor archives observed daily tool/model usage locally with no time limit — so even after a source tool prunes its own sessions, the heatmap and trends are unaffected.

<details>
<summary><strong>Advanced: extend the source tool's own retention</strong></summary>

<br>

The heatmap and sync payload use a rolling 370-day window (older observations remain available locally for future views). **Claude Code keeps only 30 days of transcripts by default** (`cleanupPeriodDays`); to keep the full rolling year before the archive kicks in, raise it in `~/.claude/settings.json` before the window passes:

```json
{
  "cleanupPeriodDays": 370
}
```

A larger value keeps more, at the cost of transcripts living on disk for as long as you set. tokscale's [Session Data Retention](https://github.com/junhoyeo/tokscale#session-data-retention) table covers the other tools' defaults and config paths.

This archive only covers days Mini Token Monitor has already observed; data deleted before it started tracking cannot be recovered.

</details>

## Settings

There are two places to configure Mini Token Monitor; day-to-day use only needs the first:

- **Widget (GUI)** — click the `⚙` button in the bottom-right corner. Settings opens as its own page, with a Back to Home button to return to the dashboard. Sections, in order: General (language, launch at login, menu bar & tray, updates), Main (Home modules and display currency), Appearance (theme and vendor colours), Collection (tracked tools, collection cadence, Preserve deleted session usage, data export), AI Tool Limits (provider selection, limits, and credentials), and Subscriptions (what you pay per account). The `⇧` button in the title bar cycles the window behavior.
- **Headless agent & hub** — no UI; configured with a `.env` file at the project root (copy from `.env.example`), precedence CLI flag → env var → built-in default.

See the [configuration reference](docs/configuration.md) for every setting and all environment variables.

## Privacy

Mini Token Monitor processes usage logs locally and sends no analytics or telemetry to the project maintainer. Network access occurs only for documented or user-enabled features. See the [privacy policy](docs/privacy.md) for the data used by updates, provider integrations, and Discord Rich Presence.

## Contributing

Issues and PRs are welcome. Project conventions, architecture notes, and the command reference live in [AGENTS.md](AGENTS.md) — written for coding agents, but it doubles as the contributor guide.

## Acknowledgments

- [Token Monitor](https://github.com/Javis603) 。

## License

[MIT](LICENSE) © [@Javis](https://github.com/Javis603)
