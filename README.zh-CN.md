<p align="right">
   <a href="./README.md">EN</a> | <strong>简</strong> | <a href="./README.zh-TW.md">繁</a> | <a href="./README.ko.md">KO</a> | <a href="./README.ja.md">JA</a>
</p>
<div align="center">
    <img src=".github/assets/app.png" alt="Mini Token Monitor logo" width="120">
    <h1>Mini Token Monitor</h1>
</div>

<p align="center">
    <em>聚合每个 AI 编程工具的实时用量和剩余额度的 Mini 版本。</em>
</p>

<div align="center">
    <img src=".github/assets/main-1.png"  width="350"><img src=".github/assets/main-2.png"  width="350">
</div>

## Mini Token Monitor 是什么？

一款菜单栏小部件，实时显示 Claude Code、Codex、Cursor、GitHub Copilot、Cherry Studio 等 36+ 种 AI 编程工具的 Token 用量与 AI 工具额度，具备实时趋势功能，并支持按工具、模型、session 或项目分项显示。

## 支持的工具

Mini Token Monitor 对 Token 用量、账户额度和 session 明细分别支持：

| Logo | 工具 | 数据路径 | Token 用量 | AI 工具额度 | session 明细 |
|:---:|------|-----------|:---:|:---:|:---:|
| <img src=".github/assets/tools-icon/claude.png" width="28" alt="Claude Code" /> | Claude Code | `~/.claude/projects/`、`~/.claude/transcripts/` | ✅ | ✅ | ✅ |
| <img src=".github/assets/tools-icon/codex.png" width="28" alt="Codex" /> | Codex | `~/.codex/`（`sessions/`、`archived_sessions/`） | ✅ | ✅ | ✅ |
| <img src=".github/assets/tools-icon/opencode.png" width="28" alt="OpenCode" /> | OpenCode | `~/.local/share/opencode/`（`opencode*.db`、`storage/message/`） | ✅ | ✅ | ✅ |
| <img src=".github/assets/tools-icon/hermes-agent.png" width="28" alt="Hermes Agent" /> | Hermes Agent | `~/.hermes/state.db` | ✅ | — | — |
| <img src=".github/assets/tools-icon/openclaw.png" width="28" alt="OpenClaw" /> | OpenClaw | `~/.openclaw/agents/` | ✅ | — | — |
| <img src=".github/assets/tools-icon/cursor.png" width="28" alt="Cursor" /> | Cursor IDE / Cursor CLI | `~/.config/tokscale/cursor-cache/`（账号层级用量导出） | ✅ | ✅ | — |
| <img src=".github/assets/tools-icon/antigravity.png" width="28" alt="Antigravity" /> | Antigravity | `~/.gemini/`（`antigravity/`、`antigravity-ide/`、`antigravity-backup/`、`antigravity-cli/conversations/`） | ✅ | ✅ | — |
| <img src=".github/assets/tools-icon/cline.png" width="28" alt="Cline" /> | Cline | VS Code globalStorage tasks（`.../saoudrizwan.claude-dev/tasks/`）、`~/.cline/data/sessions/` | ✅ | — | — |
| <img src=".github/assets/tools-icon/droid.png" width="28" alt="Factory Droid" /> | Factory Droid | `~/.factory/sessions/` | ✅ | — | — |
| <img src=".github/assets/tools-icon/kimi.png" width="28" alt="Kimi" /> | Kimi CLI / Kimi Code / Kimi Work | `~/.kimi/sessions/`、`~/.kimi-code/sessions/`、`<platform-app-data>/kimi-desktop/` | ✅ | ✅ | — |
| <img src=".github/assets/tools-icon/qwen.png" width="28" alt="Qwen" /> | Qwen CLI | `~/.qwen/projects/` | ✅ | — | — |
| <img src=".github/assets/tools-icon/xai.png" width="28" alt="Grok Build" /> | Grok Build | `~/.grok/`（`sessions/`、`logs/unified.jsonl`） | ✅ | ✅ | — |
| <img src=".github/assets/tools-icon/copilot.png" width="28" alt="GitHub Copilot" /> | GitHub Copilot | VS Code `workspaceStorage/*/chatSessions/`、`~/.copilot/`（`otel/`、`data.db`） | ✅ | ✅ | — |
| <img src=".github/assets/tools-icon/pi.png" width="28" alt="Pi" /> | Pi / Oh My Pi | `~/.pi/agent/sessions/`、`~/.omp/agent/sessions/` | ✅ | — | — |
| <img src=".github/assets/tools-icon/zed.png" width="28" alt="Zed" /> | Zed | `~/.local/share/zed/threads/threads.db` | ✅ | ✅ | — |
| <img src=".github/assets/tools-icon/kilo.png" width="28" alt="Kilo" /> | Kilo | `~/.local/share/kilo/kilo.db`；VS Code globalStorage tasks（`.../kilocode.kilo-code/tasks/`）—— 扩展记录仅限 Linux 与远程/WSL | ✅ | — | — |
| <img src=".github/assets/tools-icon/commandcode.png" width="28" alt="Command Code" /> | Command Code | `~/.commandcode/projects/**/*.jsonl` | ✅ | ✅ | — |
| <img src=".github/assets/tools-icon/mimo-code.png" width="28" alt="MiMo Code" /> | MiMo Code | `~/.local/share/mimocode/mimocode.db` | ✅ | ✅ | — |
| <img src=".github/assets/tools-icon/zcode.png" width="28" alt="ZCode" /> | ZCode / GLM | `~/.zcode/`（`projects/`、`cli/db/db.sqlite`） | ✅ | ✅ | — |
| <img src=".github/assets/tools-icon/kiro.png" width="28" alt="Kiro" /> | Kiro | `~/.kiro/sessions/cli/`、Kiro IDE globalStorage 与 `kiro-cli` 数据库 | ✅ | ✅ | — |
| <img src=".github/assets/tools-icon/codebuddy.png" width="28" alt="CodeBuddy" /> | CodeBuddy | `~/.codebuddy/projects/` 与 IDE / VS Code 扩展日志 | ✅ | — | — |
| <img src=".github/assets/tools-icon/workbuddy.png" width="28" alt="WorkBuddy" /> | WorkBuddy | `~/.workbuddy/projects/`、`~/.workbuddy/workbuddy.db` | ✅ | ✅ | — |
| <img src=".github/assets/tools-icon/proma.png" width="28" alt="Proma" /> | Proma | `~/.proma/agent-sessions/*.jsonl` | ✅ | — | — |
| <img src=".github/assets/tools-icon/qoder.png" width="28" alt="Qoder" /> | Qoder | `<platform-app-data>/QoderCN/SharedClientCache/cache/db/local.db`（仅限中国版） | ✅ | ✅ | — |
| <img src=".github/assets/tools-icon/reasonix.png" width="28" alt="Reasonix" /> | Reasonix | `~/.reasonix/`（`stats/`、`sessions/`、`projects/*/sessions/`） | ✅ | — | — |
| <img src=".github/assets/tools-icon/deepseek.png" width="28" alt="DeepSeek" /> | DeepSeek / DeepSeek Harness | `~/.dsh/sessions/`（`session.jsonl`、`session.jsonl.zstd`） | ✅ | ✅ | ✅ |
| <img src=".github/assets/tools-icon/cherrystudio.png" width="28" alt="Cherry Studio" /> | Cherry Studio | `<platform-app-data>/CherryStudio/`（`Data/Agents/.claude/projects/` V2、`.claude/projects/` legacy） | ✅ | — | — |
| <img src=".github/assets/tools-icon/lmstudio.png" width="28" alt="LM Studio" /> | LM Studio | `~/.lmstudio/server-logs/**/*.log` | ✅ | — | — |
| <img src=".github/assets/tools-icon/unsloth.png" width="28" alt="Unsloth" /> | Unsloth Studio | `~/.unsloth/studio/studio.db` | ✅ | — | — |
| <img src=".github/assets/tools-icon/openrouter.png" width="28" alt="OpenRouter" /> | OpenRouter | OpenRouter API 密钥（查询用量／密钥上限；获授权访问 credits 时显示余额，官方文档指定 Management 密钥） | — | ✅ | — |
| <img src=".github/assets/tools-icon/minimax.png" width="28" alt="Minimax" /> | Minimax | Minimax API 密钥（通过 Minimax API 查询 Token Plan 额度） | — | ✅ | — |
| <img src=".github/assets/tools-icon/volcengine.png" width="28" alt="Volcengine" /> | Volcengine | Ark API key 或火山引擎 AK/SK（通过火山引擎 API 查询火山方舟 Coding Plan / Agent Plan 额度） | — | ✅ | — |
| <img src=".github/assets/tools-icon/ollama.png" width="28" alt="Ollama" /> | Ollama | Ollama Cloud cookie（通过 ollama.com/settings 查询 session／每周用量） | — | ✅ | — |
| <img src=".github/assets/tools-icon/trae.png" width="28" alt="Trae CN" /> | Trae CN | Trae CN access token（通过 trae.cn 查询 Trae CN／SOLO credits） | — | ✅ | — |
| <img src=".github/assets/tools-icon/alibaba.png" width="28" alt="Alibaba Cloud" /> | Alibaba Cloud | 阿里云控制台 cookie（百炼／Model Studio Token Plan 额度，团队版与个人版） | — | ✅ | — |
| <img src=".github/assets/tools-icon/thirdparty.gif" width="28" alt="第三方 API" /> | 第三方 API | New API / Sub2API 兼容账号预设方案（包括兼容的 One API 分支）、New API 密钥预设方案与自定义余额端点 | — | ✅ | — |

<details>
<summary><strong>注意事项、Custom 余额端点，以及用环境变量覆盖的数据路径</strong></summary>

<br>

- 上表为默认路径。Mini Token Monitor 与 Tokscale 遵循相同的环境变量覆盖：`~/.local/share/` 下的路径跟随 `$XDG_DATA_HOME`，各工具另有 `$CODEX_HOME`、`$GROK_HOME`、`$HERMES_HOME`、`$KIMI_CODE_HOME`、`$UNSLOTH_STUDIO_HOME`、`$LM_STUDIO_HOME`、`$DSH_HOME`、`$REASONIX_STATE_HOME`、`$REASONIX_HOME` 以及 `$CLINE_*` 系列。
- LM Studio 追踪目前仅涵盖服务器日志中记录的 OpenAI 兼容 `/v1/chat/completions` 和 `/v1/responses` 请求。通过 LM Studio 内置 Chat 界面发起的对话，以及原生 `/api/v1/chat` 请求均不包括在内。
- Unsloth Studio 从 `studio.db` 追踪 Studio 对话与本地 API 的推理用量。本地推理的 API 费用为零；可识别的按量计费供应商使用 Tokscale 的价格估算。不包括训练 Token。详见 [Unsloth 数据来源说明](docs/providers/unsloth.md)。

- Command Code transcript 不包含实际 Token 数或每条消息的模型信息。Token 用量根据 transcript 文本估算；模型归属与推算成本可能反映当前配置的模型，而不是每次请求当时实际使用的模型。
- Cursor 缓存来自 Cursor 的账号层级用量导出，因此同时涵盖 Cursor IDE 和 Cursor CLI。Mini Token Monitor 会自动检测 Cursor 桌面版已登录的账号，也可在设置中手动新增。缓存过期时会自动重新同步，但刚完成的 session 可能需要几分钟才会出现在 Cursor 控制台，因此用量会在同步后更新，而非即时显示。

- Custom 会从一个 GET 余额端点映射数值 JSON 字段；仅兼容 OpenAI 或 Anthropic API 并不足够。

#### Qoder CN（本地适配器）

Qoder CN 的 Token 用量来自应用本地 SQLite 数据库，而非 API —— 在 Settings → tools 中启用（可选，默认关闭）。数据库路径按平台自动探测：macOS `~/Library/Application Support/QoderCN/SharedClientCache/cache/db/local.db`、Windows `%APPDATA%\QoderCN\SharedClientCache\cache\db\local.db`、Linux `~/.config/QoderCN/SharedClientCache/cache/db/local.db` —— 可用 `TOKEN_MONITOR_QODER_CN_DB_PATH` 覆盖。

这是高级本地集成：读取需要 PATH 上的 `sqlite3` CLI，或内置无需 flag 即可用 `node:sqlite` 的 Node 运行时（Node ≥ 23.4；Electron 组件可能需要 CLI）。读取失败会写入日志；若已有完整快照，采集器会保留它而不是用零用量覆盖。成本按每个映射模型在 models.dev 目录中的价格估算；Qoder 若改变数据库 schema，适配器可能失效。
</details>

## 为什么用 Mini Token Monitor？

大多数用量监控工具只在它运行的那台机器上有用。Mini Token Monitor 是 local-first 的：小部件直接读取本机的日志，几秒内就显示 Token 变化，完全不需要服务器。它是 Token Monitor 的精简版本，调整了部分细节，只保留一个菜单栏入口；可选的 `npm run agent` 能把用量上报到你自己搭建的 hub。

## 功能特性

### 用量追踪

- **实时 Token 追踪**：Claude Code、Codex、Cursor、GitHub Copilot、Antigravity、OpenCode 等 29+ 种 AI 工具，每轮对话后 UI 在数秒内刷新（完整列表见上方表格）
- **实时 Token 速率**：可选显示的实时读数，以 `tok/s` 显示生成速度或以 `tok/min` 显示总消耗
- **单个 session 明细**：点进某个 session，可看每条提问的 Token 消耗，并展开查看每次回复的 Token 拆分与用到的工具（打开时才实时读取本机 transcript 或数据库，绝不同步）
- **缓存命中统计**：点击任何工具或模型，展开查看输入 Token（缓存命中与未命中）、输出 Token 的详细分类及命中率百分比
- **成本与币别**：Token 数量旁附带成本；可用 USD、TWD、HKD 或 CNY 显示，汇率每日自动更新，也可在设置中手动覆写
- **自定义扫描路径**：session 不在默认位置时，可为个别工具加入额外的文件夹
- **WSL 用量（Windows）**：运行中 WSL 发行版里的文件型用量会自动识别，约每 5 分钟并入总量；OpenCode、Hermes 等 SQLite 来源可能需要按照[指南](docs/wsl-sqlite-setup.zh-CN.md)在 WSL 内运行 headless agent

### 额度、趋势与导出

- **AI 工具额度检测**：涵盖 Claude Code、Codex、Cursor、OpenRouter、第三方 API、GLM、Kimi 等 23+ 家提供方的 session、每日、每周、账单与 credits 窗口，支持多个 OpenRouter／第三方 profile，以及余额型账户（Claude credits、DeepSeek 预付余额与消费历史、第三方余额）
- **多账号与 Codex 账号切换**：同一提供方可追踪多个账号、各自显示额度；已加入追踪的 Codex 账号还能一键切换为本机使用账号，免重新登录授权
- **Codex 重置预测**：可选开启的第三方重置预测，显示预计重置时间、重置类型（Regular 或 Banked）与上次重置时间
- **保留已删除会话用量**：许多工具会定期清除旧 session（Claude Code 默认清 30 天前的 transcript），一删就再也算不到。开启后，Mini Token Monitor 会在本地不设期限地归档已观测到的每日工具／模型用量，让热力图与趋势即使在来源文件被清掉后仍然完整（详见下方[〈会话数据保留期〉](#会话数据保留期)）
- **使用趋势与仪表板**：主页的活跃热力图与趋势图，加上独立的仪表板窗口，提供连续天数，按工具／按模型堆叠的历史（柱状图与 K 线两种视图）
- **固定时间范围**：除了原本的日、月、总计，还可以切换本周、近 7 天与近 30 天
- **可选的状态视图**：追踪 Claude、OpenAI、Cursor 与 DeepSeek status 页，支持手动或定时重新检查
- **数据导出**：把使用数据导出成与工具无关的 CSV + JSON，可手动或自动写入文件夹，接电子表格、Obsidian、Grafana 或自写脚本；详见 [docs/export.md](docs/export.md)
- **订阅资料**：手动记录每个 AI 账号的实际费用；方案标签的 tooltip 会显示费用、下次续费或到期日、已订阅时间，以及本月用量成本相对订阅费的回本倍数，定期方案与储值记录均适用

### 界面与呈现

- **分组视图**：可按工具、模型、session、项目或账户额度分组查看用量
- **菜单栏（macOS）与系统托盘（Windows）弹出窗口**：图标旁可显示成本、token 数，或最接近用完的提供方剩余额度百分比
- **菜单栏排版自定义**：菜单栏与悬浮小窗的显示内容可以直接挑内置版式，也可以选“自定义…”自己排——加入 AI 工具图标、额度条、百分比、重置时间、成本、Token 速率或自定义文字等项目，拖动排序并实时预览，每个项目还能各自指定 AI 工具、账号、额度周期与字体
- **外观控制**：界面主题切换（黑曜／瓷白，默认跟随系统）、各工具厂商色、玻璃透明度、模糊度、完全透明窗口、自定义字体
- **工具列表自定义**：可隐藏、置顶和拖曳排序主列表中的工具，不影响实际追踪
- **Discord Rich Presence**：将今日 Token、花费与主要工具广播到你的 Discord 个人资料（需手动开启）

## 安装

可从 [GitHub Releases](https://github.com/clawovo/mini-token-monitor/releases) 下载。

- **macOS（Apple Silicon）** — `.dmg`，未签名
- **macOS（Intel）** — x64 `.dmg`，未签名
- **Windows 10/11** — 安装版和便携版 `.exe`，均[已签名](docs/code-signing.md)
- **Linux x64** — `.AppImage`

说明：Mac安装提示提示“已损坏，无法打开”的解决方法，通过终端命令移除系统给下载的应用添加的“隔离”标记。

1. **打开终端**：在“启动台”或“应用程序” > “实用工具”里找到并打开“终端”。
2. **输入命令**：复制以下命令，**注意末尾有一个空格**，先不要按回车：

```text
 sudo xattr -r -d com.apple.quarantine /Applications/Mini\ Token\ Monitor.app
```
3. **执行命令**：按回车键，然后输入你的**开机密码**（输入时屏幕上不会显示字符），再按回车确认。
4. **重新打开应用**：命令执行完毕后，就可以正常打开“Mini Token Monitor”了。

打包版会自动检查 GitHub Releases。有新版本时，界面会显示更新提示；受支持的平台也可在 设置 → 常规 中安装更新。

## App 数据

App 状态保存在系统的用户数据目录——卸载时一并删除该目录即可完整移除。

| 平台 | 路径 |
|------|------|
| macOS | `~/Library/Application Support/Token Monitor/` |
| Windows | `%APPDATA%/Token Monitor/` |
| Linux | `~/.config/Token Monitor/` |

## 从源码构建

如需自己从源码打包安装包，请在**对应的**操作系统上使用 Node.js 22.15+（electron-builder 无法在 Windows 上交叉构建 macOS 的 `.dmg`，反之亦然）。

```bash
npm install
npm run dist:mac     # macOS arm64 .dmg → dist/
npm run dist:mac:x64 # macOS Intel x64 .dmg → dist/
npm run dist:win     # Windows x64 安装包 .exe → dist/
npm run dist:linux   # Linux x64 AppImage → dist/
npm run pack         # 未打包的 app 目录（无安装包），方便本机快速测试
```

产物会放在 `dist/`。Windows 和 Linux 请在对应系统上使用上面的 `dist:*` 脚本。如果要打包 macOS 发布版，需要本机有 Developer ID Application 签名身份；本地开发或未列出的平台请用 `npm start` 运行。

运行和打包脚本会在四个 vendored 目标上明确确保使用 pinned tokscale binary。其他源码平台会保留 npm binary，并过滤它不支持的 clients；`npm install`、lint 和测试不会下载它。

## 工作原理

```text
本地（默认，免配置）
    小部件 (Electron) ──▶ tokscale ──▶ ~/.claude、~/.codex、$HERMES_HOME
```

小部件始终是本地模式——直接读取本机日志，不需要 hub。可选的 `npm run agent` 会在没有小部件的机器上采集用量，并上报到你自己搭建的 hub。

## 会话数据保留期

开启**保留已删除会话用量**（设置 → 采集）后，Mini Token Monitor 会在本地不设期限地归档已观测到的每日工具／模型用量——即使来源工具日后清掉 session，热力图与趋势也不受影响。

<details>
<summary><strong>进阶：延长来源工具本身的保留期</strong></summary>

<br>

热力图与同步数据采用 370 天的滚动窗口（更早的观测数据仍保留在本地供日后查看）。**Claude Code 默认只保留 30 天的 transcript**（`cleanupPeriodDays`）；若想在归档启用前就保住完整的滚动年份，请在时限过去之前于 `~/.claude/settings.json` 调高：

```json
{
  "cleanupPeriodDays": 370
}
```

设更大能留更多，代价是 transcript 会按你设定的期限一直留在磁盘上。其他工具的默认值与配置文件路径，请见 tokscale 的 [Session Data Retention](https://github.com/junhoyeo/tokscale#session-data-retention) 表。

这份归档只涵盖 Mini Token Monitor 已观测过的日期；在它开始追踪之前就被删除的数据无法找回。

</details>

## 设置

设置分两处，日常使用只需要前者：

- **小部件（GUI）**——点右下角的 `⚙` 打开；设置以独立页面呈现，可用「返回主页」回到主界面。分区依次为：常规（语言、登录启动、菜单栏与托盘、更新）、主画面（首页模块与显示币别）、外观（主题与厂商色）、采集（追踪的工具、采集频率、保留已删除会话用量、数据导出）、AI 工具额度（提供方选择、额度与凭据）、订阅资料（每个账号实际付多少）。标题栏的 `⇧` 按钮可循环切换窗口行为。
- **无头代理与 hub**——没有 UI，用项目根目录的 `.env` 配置（从 `.env.example` 复制）；优先级为 CLI 参数 → 环境变量 → 内置默认。

每一项设置与所有环境变量的完整说明，请见[设置参考文档](docs/configuration.md)。

## 隐私

Mini Token Monitor 在本地处理使用日志，不会向项目维护者发送分析或遥测数据。网络访问仅用于文档所述或由用户启用的功能；更新、提供方集成、Discord Rich Presence 所使用的数据，请参阅[隐私政策](docs/privacy.md)。

## 参与贡献

欢迎提交 Issue 和 PR。项目规范、架构说明和命令参考都在 [AGENTS.md](AGENTS.md) 中——它是为编码代理编写的，但同样可以作为贡献者指南。

## 致谢

- [Token Monitor](https://github.com/Javis603) 提供完整版的Token Monitor。

