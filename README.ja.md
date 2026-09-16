<p align="right">
   <a href="./README.md">EN</a> | <a href="./README.zh-CN.md">简</a> | <a href="./README.zh-TW.md">繁</a> | <a href="./README.ko.md">KO</a> | <strong>JA</strong>
</p>
<div align="center">
    <img src=".github/assets/app.png" alt="Mini Token Monitor logo" width="120">
    <h1>Mini Token Monitor</h1>
</div>

<p align="center">
    <em>すべての AI コーディングツールのリアルタイム使用量と残りの制限を集約するミニ版。</em>
</p>

<div align="center">
    <img src=".github/assets/main-1.png"  width="350"><img src=".github/assets/main-2.png"  width="350">
</div>

## Mini Token Monitor とは

Claude Code、Codex、Cursor、GitHub Copilot、Cherry Studio など 36+ 種類の AI コーディングツールのトークン使用量と AI ツール制限をリアルタイムに表示するメニューバーウィジェットです。リアルタイムのトレンドに対応し、ツール・モデル・セッション・プロジェクト別の内訳も確認できます。

## 対応ツール

Mini Token Monitor はトークン使用量、アカウント制限、セッション詳細をそれぞれ個別にサポートします：

| Logo | ツール | データパス | トークン使用量 | AI ツール制限 | セッション詳細 |
|:---:|------|-----------|:---:|:---:|:---:|
| <img src=".github/assets/tools-icon/claude.png" width="28" alt="Claude Code" /> | Claude Code | `~/.claude/projects/`、`~/.claude/transcripts/` | ✅ | ✅ | ✅ |
| <img src=".github/assets/tools-icon/codex.png" width="28" alt="Codex" /> | Codex | `~/.codex/`（`sessions/`、`archived_sessions/`） | ✅ | ✅ | ✅ |
| <img src=".github/assets/tools-icon/opencode.png" width="28" alt="OpenCode" /> | OpenCode | `~/.local/share/opencode/`（`opencode*.db`、`storage/message/`） | ✅ | ✅ | ✅ |
| <img src=".github/assets/tools-icon/hermes-agent.png" width="28" alt="Hermes Agent" /> | Hermes Agent | `~/.hermes/state.db` | ✅ | — | — |
| <img src=".github/assets/tools-icon/openclaw.png" width="28" alt="OpenClaw" /> | OpenClaw | `~/.openclaw/agents/` | ✅ | — | — |
| <img src=".github/assets/tools-icon/cursor.png" width="28" alt="Cursor" /> | Cursor IDE / Cursor CLI | `~/.config/tokscale/cursor-cache/`（アカウント単位の使用量エクスポート） | ✅ | ✅ | — |
| <img src=".github/assets/tools-icon/antigravity.png" width="28" alt="Antigravity" /> | Antigravity | `~/.gemini/`（`antigravity/`、`antigravity-ide/`、`antigravity-backup/`、`antigravity-cli/conversations/`） | ✅ | ✅ | — |
| <img src=".github/assets/tools-icon/cline.png" width="28" alt="Cline" /> | Cline | VS Code globalStorage tasks（`.../saoudrizwan.claude-dev/tasks/`）、`~/.cline/data/sessions/` | ✅ | — | — |
| <img src=".github/assets/tools-icon/droid.png" width="28" alt="Factory Droid" /> | Factory Droid | `~/.factory/sessions/` | ✅ | — | — |
| <img src=".github/assets/tools-icon/kimi.png" width="28" alt="Kimi" /> | Kimi CLI / Kimi Code / Kimi Work | `~/.kimi/sessions/`、`~/.kimi-code/sessions/`、`<platform-app-data>/kimi-desktop/` | ✅ | ✅ | — |
| <img src=".github/assets/tools-icon/qwen.png" width="28" alt="Qwen" /> | Qwen CLI | `~/.qwen/projects/` | ✅ | — | — |
| <img src=".github/assets/tools-icon/xai.png" width="28" alt="Grok Build" /> | Grok Build | `~/.grok/`（`sessions/`、`logs/unified.jsonl`） | ✅ | ✅ | — |
| <img src=".github/assets/tools-icon/copilot.png" width="28" alt="GitHub Copilot" /> | GitHub Copilot | VS Code `workspaceStorage/*/chatSessions/`、`~/.copilot/`（`otel/`、`data.db`） | ✅ | ✅ | — |
| <img src=".github/assets/tools-icon/pi.png" width="28" alt="Pi" /> | Pi / Oh My Pi | `~/.pi/agent/sessions/`、`~/.omp/agent/sessions/` | ✅ | — | — |
| <img src=".github/assets/tools-icon/zed.png" width="28" alt="Zed" /> | Zed | `~/.local/share/zed/threads/threads.db` | ✅ | ✅ | — |
| <img src=".github/assets/tools-icon/kilo.png" width="28" alt="Kilo" /> | Kilo | `~/.local/share/kilo/kilo.db`；VS Code globalStorage tasks（`.../kilocode.kilo-code/tasks/`）—— 拡張機能ログは Linux とリモート/WSL のみ | ✅ | — | — |
| <img src=".github/assets/tools-icon/commandcode.png" width="28" alt="Command Code" /> | Command Code | `~/.commandcode/projects/**/*.jsonl` | ✅ | ✅ | — |
| <img src=".github/assets/tools-icon/mimo-code.png" width="28" alt="MiMo Code" /> | MiMo Code | `~/.local/share/mimocode/mimocode.db` | ✅ | ✅ | — |
| <img src=".github/assets/tools-icon/zcode.png" width="28" alt="ZCode" /> | ZCode / GLM | `~/.zcode/`（`projects/`、`cli/db/db.sqlite`） | ✅ | ✅ | — |
| <img src=".github/assets/tools-icon/kiro.png" width="28" alt="Kiro" /> | Kiro | `~/.kiro/sessions/cli/`、Kiro IDE globalStorage と `kiro-cli` データベース | ✅ | ✅ | — |
| <img src=".github/assets/tools-icon/codebuddy.png" width="28" alt="CodeBuddy" /> | CodeBuddy | `~/.codebuddy/projects/` と IDE / VS Code 拡張機能ログ | ✅ | — | — |
| <img src=".github/assets/tools-icon/workbuddy.png" width="28" alt="WorkBuddy" /> | WorkBuddy | `~/.workbuddy/projects/`、`~/.workbuddy/workbuddy.db` | ✅ | ✅ | — |
| <img src=".github/assets/tools-icon/proma.png" width="28" alt="Proma" /> | Proma | `~/.proma/agent-sessions/*.jsonl` | ✅ | — | — |
| <img src=".github/assets/tools-icon/qoder.png" width="28" alt="Qoder" /> | Qoder | `<platform-app-data>/QoderCN/SharedClientCache/cache/db/local.db`（中国版のみ） | ✅ | ✅ | — |
| <img src=".github/assets/tools-icon/reasonix.png" width="28" alt="Reasonix" /> | Reasonix | `~/.reasonix/`（`stats/`、`sessions/`、`projects/*/sessions/`） | ✅ | — | — |
| <img src=".github/assets/tools-icon/deepseek.png" width="28" alt="DeepSeek" /> | DeepSeek / DeepSeek Harness | `~/.dsh/sessions/`（`session.jsonl`、`session.jsonl.zstd`） | ✅ | ✅ | ✅ |
| <img src=".github/assets/tools-icon/cherrystudio.png" width="28" alt="Cherry Studio" /> | Cherry Studio | `<platform-app-data>/CherryStudio/`（`Data/Agents/.claude/projects/` V2、`.claude/projects/` legacy） | ✅ | — | — |
| <img src=".github/assets/tools-icon/lmstudio.png" width="28" alt="LM Studio" /> | LM Studio | `~/.lmstudio/server-logs/**/*.log` | ✅ | — | — |
| <img src=".github/assets/tools-icon/unsloth.png" width="28" alt="Unsloth" /> | Unsloth Studio | `~/.unsloth/studio/studio.db` | ✅ | — | — |
| <img src=".github/assets/tools-icon/openrouter.png" width="28" alt="OpenRouter" /> | OpenRouter | OpenRouter API キー（使用量／キー上限を照会。credits へのアクセスが許可されている場合は残高、Management キーが公式ドキュメントで指定） | — | ✅ | — |
| <img src=".github/assets/tools-icon/minimax.png" width="28" alt="Minimax" /> | Minimax | Minimax API キー（Minimax API 経由で Token Plan クォータを照会） | — | ✅ | — |
| <img src=".github/assets/tools-icon/volcengine.png" width="28" alt="Volcengine" /> | Volcengine | Ark API key または Volcengine AK/SK（Volcengine API 経由で Ark Coding Plan / Agent Plan クォータを照会） | — | ✅ | — |
| <img src=".github/assets/tools-icon/ollama.png" width="28" alt="Ollama" /> | Ollama | Ollama Cloud cookie（ollama.com/settings 経由で session／週間使用量を照会） | — | ✅ | — |
| <img src=".github/assets/tools-icon/trae.png" width="28" alt="Trae CN" /> | Trae CN | Trae CN access token（trae.cn 経由で Trae CN／SOLO credits を照会） | — | ✅ | — |
| <img src=".github/assets/tools-icon/alibaba.png" width="28" alt="Alibaba Cloud" /> | Alibaba Cloud | Alibaba Cloud コンソール cookie（Bailian／Model Studio Token Plan クォータ、チーム版・個人版） | — | ✅ | — |
| <img src=".github/assets/tools-icon/thirdparty.gif" width="28" alt="Third-party APIs" /> | サードパーティ API | New API / Sub2API 互換アカウントプリセット（互換 One API フォークを含む）、New API API キープリセット、Custom 残高エンドポイント | — | ✅ | — |

<details>
<summary><strong>注意事項、Custom 残高エンドポイント、環境変数で上書きできるデータパス</strong></summary>

<br>

- 上表は既定のパスです。Mini Token Monitor は Tokscale と同じ環境変数による上書きに従います。`~/.local/share/` 配下のルートは `$XDG_DATA_HOME`、ツール別には `$CODEX_HOME`、`$GROK_HOME`、`$HERMES_HOME`、`$KIMI_CODE_HOME`、`$UNSLOTH_STUDIO_HOME`、`$LM_STUDIO_HOME`、`$DSH_HOME`、`$REASONIX_STATE_HOME`、`$REASONIX_HOME`、および `$CLINE_*` 系です。
- LM Studio の追跡は現在、サーバーログに記録された OpenAI 互換の `/v1/chat/completions` と `/v1/responses` リクエストのみを対象とします。LM Studio 内蔵 Chat UI から開始した会話やネイティブの `/api/v1/chat` リクエストは含まれません。
- Unsloth Studio は `studio.db` から Studio チャットとローカル API の推論使用量を追跡します。ローカル推論の API コストはゼロで、識別可能な従量課金プロバイダーは Tokscale の価格推定を使用します。トレーニングトークンは含まれません。詳細は [Unsloth データソースの注意](docs/providers/unsloth.md) を参照してください。

- Command Code の transcript には実際のトークン数やメッセージ単位のモデル情報が含まれません。トークン使用量は transcript のテキストから推定され、モデル帰属と算出コストは、各リクエスト時に実際に使われたモデルではなく現在構成されているモデルを反映する場合があります。
- Cursor のキャッシュは Cursor のアカウント単位の使用量エクスポートに由来するため、Cursor IDE と Cursor CLI の両方をカバーします。Mini Token Monitor は Cursor デスクトップアプリでサインイン済みのアカウントを自動検出し、設定から手動で追加することもできます。キャッシュは古くなると自動で再同期されますが、終了直後のセッションが Cursor のダッシュボードに反映されるまで数分かかることがあるため、使用量は同期時に更新され、即時ではありません。

- Custom は 1 つの GET 残高エンドポイントから数値の JSON フィールドをマッピングします。OpenAI または Anthropic API との互換性だけでは不十分です。

#### Qoder CN（ローカルアダプター）

Qoder CN のトークン使用量は API ではなく、アプリのローカル SQLite データベースから読み取ります —— 設定 → tools で有効化します（オプトイン、既定ではオフ）。データベースはプラットフォームごとに自動検出されます：macOS `~/Library/Application Support/QoderCN/SharedClientCache/cache/db/local.db`、Windows `%APPDATA%\QoderCN\SharedClientCache\cache\db\local.db`、Linux `~/.config/QoderCN/SharedClientCache/cache/db/local.db` —— `TOKEN_MONITOR_QODER_CN_DB_PATH` で上書きできます。

これは高度なローカル統合です：読み取りには PATH 上の `sqlite3` CLI、または flag なしで `node:sqlite` を使える Node ランタイムが必要です（Node ≥ 23.4。Electron 版では CLI が必要な場合があります）。読み取り失敗はログに記録され、完全なスナップショットが既にある場合はゼロ使用量で上書きせず保持します。コストはマッピングされた各モデルについて models.dev カタログの価格から推定されます。Qoder がデータベーススキーマを変更すると、アダプターが機能しなくなる可能性があります。
</details>

## Mini Token Monitor を使う理由

多くの使用量モニターは、実行しているマシン上でのみ役立ちます。Mini Token Monitor は local-first です。ウィジェットがこのマシンのログを直接読み取り、数秒以内にトークンの変化を表示します。サーバーは不要です。Token Monitor を簡素化したエディションで、メニューバーのエントリは 1 つだけです。任意の `npm run agent` で、自分で運用する hub に使用量を報告できます。

## 機能

### 使用量の追跡

- **リアルタイムトークン追跡** — Claude Code、Codex、Cursor、GitHub Copilot、Antigravity、OpenCode など 29+ 種類の AI ツール、各ターンから数秒以内に UI 更新（全リストは上の表を参照）
- **リアルタイムトークンレート** — 生成速度を `tok/s`、総消費を `tok/min` で表示する任意のライブ表示
- **セッション別詳細** — セッションを開くとプロンプトごとのトークン、各応答のトークン分割・使用ツールまで展開（ローカル transcript/DB を必要時のみ読み込み、同期しない）
- **キャッシュヒット統計** — ツール・モデルをクリックすると入力トークン（キャッシュ hit/miss）、出力トークン、ヒット率の詳細
- **コストと通貨** — トークン数とともにコストを表示。USD、TWD、HKD、CNY に対応し、為替レートは毎日自動更新、設定で手動上書き可能
- **カスタムスキャンパス** — セッションが既定の場所にない場合、ツールごとに追加フォルダーを指定できます
- **WSL 使用量 (Windows)** — 実行中の WSL ディストリビューションにあるファイルベースの使用量を約 5 分ごとに自動検出して合算。OpenCode や Hermes など SQLite ベースのツールでは、[WSL 内のヘッドレスエージェント](docs/wsl-sqlite-setup.md)が必要になる場合があります

### 制限・トレンド・エクスポート

- **AI ツール制限検出** — Claude Code、Codex、Cursor、OpenRouter、サードパーティAPI、GLM、Kimi など 23+ プロバイダーの session/daily/weekly/billing/credits、複数の OpenRouter／サードパーティプロファイル、残高型アカウント（Claude クレジット、DeepSeek のプリペイド残高と使用履歴、サードパーティ残高）
- **複数アカウントと Codex 切り替え** — 1 つのプロバイダーで複数アカウントを追跡し、それぞれの制限を表示。追跡済みの Codex アカウントは、再認証なしでローカルアカウントとしてワンクリック切り替え可能
- **Codex リセット予測** — 任意で有効にできるサードパーティのリセット予測。予測されるリセット時刻、リセットタイプ（Regular / Banked）、前回のリセット時刻を表示
- **削除されたセッション使用量を保持** — 多くのツールは古いセッションを削除します（Claude Code はデフォルトで 30 日後にトランスクリプトを削除）。有効にすると、Mini Token Monitor は観測済みの日別ツール/モデル使用量をローカルにアーカイブし、元ファイルが消えてもヒートマップとトレンドを維持します（下記 [セッションデータの保持期間](#セッションデータの保持期間) を参照）
- **使用トレンド & ダッシュボード** — ホーム画面のアクティビティヒートマップ・トレンドチャート、連続日数・ツール/モデル別累積使用（棒・K 線）専用ダッシュボードウィンドウ
- **固定期間レンジ** — ネイティブの日・月・累計に加えて、今週・過去 7 日・過去 30 日を切り替え可能
- **ステータスビュー**（任意） — Claude、OpenAI、Cursor、DeepSeek のステータスページを手動/定期確認
- **データエクスポート** — ツール非依存の CSV + JSON で手動エクスポートまたはフォルダへの自動書き込み（スプレッドシート、Obsidian、Grafana、スクリプト用）；[docs/export.md](docs/export.md) を参照
- **サブスクリプション記録** — 各 AI アカウントの実際の費用を手動で記録します。プランラベルのツールチップに料金、次回更新日または終了日、利用期間、当月の使用量コストが支払額の何倍かが表示され、定期プランとチャージ履歴のどちらにも対応

### インターフェースと表示

- **内訳ビュー** — ツール、モデル、セッション、プロジェクト、アカウント制限別
- **メニューバー (macOS) / システムトレイ (Windows)** — コスト、トークン、または残量が最も少ないプロバイダー制限 % をアイコン横に表示
- **メニューバーのレイアウト編集** — メニューバーとフローティングバブルは内蔵プリセットのほか、「カスタム…」で自分で組み立て可能。AIツールアイコン、制限バー、パーセント、リセット時間、コスト、トークンレート、カスタムテキストを追加し、ライブプレビューを見ながらドラッグで並べ替え、項目ごとに AIツール・アカウント・制限期間・フォントを指定
- **外観** — テーマ（Obsidian / Porcelain、既定ではシステムに追従）、ツール別カラー、ガラス透明度・ぼかし、透明ウィンドウ、フォントのカスタマイズ
- **ツールリストのカスタマイズ** — 追跡は維持したまま非表示、ピン留め、順序変更
- **Discord Rich Presence** — 本日のトークン・コスト・主要クライアント（オプトイン）

## インストール

[GitHub Releases](https://github.com/clawovo/mini-token-monitor/releases) からダウンロードできます。

- **macOS (Apple Silicon)** — `.dmg`、未署名
- **macOS (Intel)** — x64 `.dmg`、未署名
- **Windows 10/11** — セットアップ版とポータブル版 `.exe`、いずれも[署名済み](docs/code-signing.md)
- **Linux x64** — `.AppImage`

説明：Mac で「壊れているため開けません」と表示される場合の対処法です。ターミナルコマンドで、システムがダウンロードしたアプリに付ける「隔離」属性を削除します。

1. **ターミナルを開く**：「Launchpad」または「アプリケーション」 > 「ユーティリティ」から「ターミナル」を開きます。
2. **コマンドを入力**：以下のコマンドをコピーします。まだ Return は押さないでください：

```text
 sudo xattr -r -d com.apple.quarantine /Applications/Mini\ Token\ Monitor.app
```
3. **実行する**：Return を押し、**ログインパスワード**を入力して（入力中は画面に表示されません）、もう一度 Return を押します。
4. **アプリを開き直す**：コマンドが完了すれば、「Mini Token Monitor」を正常に開けます。

パッケージ版は GitHub Releases を自動で確認します。更新があるとインジケーターが表示され、対応プラットフォームでは 設定 → 一般 からインストールできます。

## アプリデータ

アプリの状態は OS のユーザーデータディレクトリに保存されます —— アプリと一緒にこのフォルダーを削除すれば完全にアンインストールできます。

| プラットフォーム | パス |
|----------|------|
| macOS | `~/Library/Application Support/Token Monitor/` |
| Windows | `%APPDATA%/Token Monitor/` |
| Linux | `~/.config/Token Monitor/` |

## ソースからビルド

独自のインストーラーをビルドするには、**ターゲット** OS 上で Node.js 22.15+ を使用してください（electron-builder は Windows で macOS の `.dmg` をクロスビルドできません。逆も同様です）。

```bash
npm install
npm run dist:mac     # macOS arm64 .dmg           → dist/
npm run dist:mac:x64 # macOS Intel x64 .dmg       → dist/
npm run dist:win     # Windows x64 installer .exe → dist/
npm run dist:linux   # Linux x64 AppImage         → dist/
npm run pack         # 未パッケージの app ディレクトリ（インストーラーなし）、ローカルテスト用
```

出力は `dist/` に置かれます。Windows と Linux はターゲット OS 上で対応する `dist:*` スクリプトを使用してください。macOS のリリースビルドのパッケージングには、ローカルの Developer ID Application 署名 ID が必要です。ローカル開発や未対応プラットフォームでは `npm start` を使用してください。

ランタイムとパッケージングのスクリプトは、4 つの vendored ターゲットで pinned tokscale binary を明示的に保証します。それ以外のソースプラットフォームは npm binary を維持し、対応しないクライアントをフィルタリングします。`npm install`、lint、テストはダウンロードを行いません。

## 動作の仕組み

```text
ローカル（既定、設定不要）
    ウィジェット (Electron) ──▶ tokscale ──▶ ~/.claude、~/.codex、$HERMES_HOME
```

ウィジェットは常にローカルです —— このマシンのログを直接読み取り、hub は不要です。任意の `npm run agent` は、ウィジェットのないマシンで使用量を収集し、自分で運用する hub に報告します。

## セッションデータの保持期間

**削除されたセッション使用量を保持**（設定 → 収集）を有効にすると、Mini Token Monitor は観測済みの日別ツール/モデル使用量をローカルに無期限でアーカイブします —— 元のツールが後でセッションを削除しても、ヒートマップとトレンドは影響を受けません。

<details>
<summary><strong>上級：ソースツール自体の保持期間を延ばす</strong></summary>

<br>

ヒートマップと同期データは 370 日のローリングウィンドウを使用します（古い観測は将来の表示用にローカルに残ります）。**Claude Code はデフォルトで 30 日分のトランスクリプトのみ保持します**（`cleanupPeriodDays`）。アーカイブが作動する前に完全な 1 年分を保つには、期間が過ぎる前に `~/.claude/settings.json` で値を引き上げてください：

```json
{
  "cleanupPeriodDays": 370
}
```

値を大きくすればより長く保持できますが、その分トランスクリプトがディスク上に残り続けます。他のツールの既定値と設定パスは tokscale の [Session Data Retention](https://github.com/junhoyeo/tokscale#session-data-retention) 表を参照してください。

このアーカイブは Mini Token Monitor が観測済みの日のみを対象とします。追跡開始前に削除されたデータは復元できません。

</details>

## 設定

Mini Token Monitor の設定は 2 か所にあります。日常利用に必要なのは前者だけです。

- **ウィジェット (GUI)** — 右下の `⚙` ボタンで開きます。設定は独立したページとして表示され、「ホームに戻る」ボタンでメイン画面に戻れます。セクションは順に：一般（言語、ログイン時に起動、メニューバーとトレイ、アップデート）、メイン画面（ホームモジュールと表示通貨）、外観（テーマとツール別カラー）、収集（追跡ツール、収集間隔、削除されたセッション使用量を保持、データエクスポート）、AI ツール制限（プロバイダー選択、制限、認証情報）、サブスクリプション（アカウントごとの支払い額）。タイトルバーの `⇧` ボタンでウィンドウ動作を切り替えます。
- **Headless agent と hub** — UI なし。プロジェクトルートの `.env`（`.env.example` をコピー）で設定します。優先順位は CLI フラグ → 環境変数 → 既定値。

すべての設定と環境変数の詳細は [設定リファレンス](docs/configuration.md) を参照してください。

## プライバシー

Mini Token Monitor は使用ログをローカルで処理し、プロジェクトのメンテナーに分析データやテレメトリを送信しません。ネットワークアクセスは、文書化された機能またはユーザーが有効にした機能に限られます。アップデート、プロバイダー連携、Discord Rich Presence で使用されるデータについては、[プライバシーポリシー](docs/privacy.md)を参照してください。

## コントリビュート

Issue や PR を歓迎します。プロジェクトの規約、アーキテクチャノート、コマンドリファレンスは [AGENTS.md](AGENTS.md) にあります — コーディングエージェント向けに書かれていますが、コントリビューターガイドとしても使えます。

## 謝辞

- [Token Monitor](https://github.com/Javis603) 。
