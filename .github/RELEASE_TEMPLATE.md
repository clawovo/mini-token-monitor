# English

## What's changed

<!-- app-update-notes:en:start -->
### Added
- **Coding Plan quota from the CLI:** Reads the Coding Plan alongside the Agent Plan when neither is reachable through an access key, so a CLI-only setup now shows both subscriptions. (#a01a79b)
- **arkcli install guide:** The Volcengine settings link to the official arkcli installation page, because a plan's dedicated API key cannot read quota. (#ec95b4d)

### Fixed
- **Ark plan quota with a version-managed CLI:** Finds arkcli installed under nvm, volta, fnm, asdf, pnpm or yarn. A window opened from the Dock or Finder inherits a shortened search path that excluded those locations, so the quota never appeared. (#a01a79b)
- **Plan API keys reported as invalid:** A plan's dedicated API key (ark-...) authenticates inference only, yet it was probed against the Coding Plan endpoint and its refusal was shown as invalid credentials. It now falls back to the signed-in arkcli, and says whether arkcli is missing or signed out when neither can answer. (#a01a79b)
<!-- app-update-notes:en:end -->

## Download

- **macOS Apple Silicon** — [Mini-Token-Monitor-0.1.3-arm64.dmg](https://github.com/clawovo/mini-token-monitor/releases/download/v0.1.3/Mini-Token-Monitor-0.1.3-arm64.dmg)
- **macOS Intel** — [Mini-Token-Monitor-0.1.3-x64.dmg](https://github.com/clawovo/mini-token-monitor/releases/download/v0.1.3/Mini-Token-Monitor-0.1.3-x64.dmg)
- **Windows Installer** — [Mini-Token-Monitor-Setup-0.1.3.exe](https://github.com/clawovo/mini-token-monitor/releases/download/v0.1.3/Mini-Token-Monitor-Setup-0.1.3.exe) (recommended)
- **Windows Portable** — [Mini-Token-Monitor-0.1.3.exe](https://github.com/clawovo/mini-token-monitor/releases/download/v0.1.3/Mini-Token-Monitor-0.1.3.exe) (no install required)
- **Linux x64** — [Mini-Token-Monitor-0.1.3.AppImage](https://github.com/clawovo/mini-token-monitor/releases/download/v0.1.3/Mini-Token-Monitor-0.1.3.AppImage)

<details>
<summary><strong>First launch and other notes</strong></summary>

### First launch

**macOS:** the app is Developer ID-signed and notarized by Apple. Open the `.dmg`, then drag Mini Token Monitor to Applications.

**Windows:** both executables are signed ([how to verify](https://github.com/clawovo/mini-token-monitor/blob/main/docs/code-signing.md#verify-a-download)).

**Linux:** mark the AppImage executable, then run it:

```bash
chmod +x "Mini Token Monitor"*.AppImage
./"Mini Token Monitor"*.AppImage
```

### Other notes

Other platforms are not pre-built — run from source per the [README](https://github.com/clawovo/mini-token-monitor#readme). The macOS `.zip` is the same app repackaged; ignore it unless you specifically need it.

### tokscale dependency

Tokscale is bundled with this app. See **Settings → Tokscale** for the exact version
and the option to download a newer version directly from npm. Tokscale is MIT,
open-source: https://github.com/junhoyeo/tokscale

</details>

---

# 中文

## 更新内容

<!-- app-update-notes:zh:start -->
### 新增
- **通过 CLI 读取 Coding Plan 额度：** 没有 access key 时，除 Agent Plan 外也会读取 Coding Plan，只用 arkcli 的配置现在两个套餐都能显示。（#a01a79b）
- **arkcli 安装说明：** Volcengine 设置中新增官方 arkcli 安装页链接 —— 套餐专属 APIKey 无法查询额度。（#ec95b4d）

### 修复
- **版本管理器安装的 arkcli 读不到额度：** 现在可以发现通过 nvm、volta、fnm、asdf、pnpm、yarn 安装的 arkcli。从 Dock 或访达启动的窗口继承的是被截断的搜索路径，不包含这些位置，导致额度一直不显示。（#a01a79b）
- **套餐 APIKey 被误报为凭证无效：** 套餐专属 APIKey（ark-…）只用于推理鉴权，之前却被拿去请求 Coding Plan 接口，被拒后显示为“凭证无效”。现在会回退到已登录的 arkcli；两者都不可用时，会说明是未安装还是未登录。（#a01a79b）
<!-- app-update-notes:zh:end -->

## 下载

- **macOS Apple Silicon** — [Mini-Token-Monitor-0.1.3-arm64.dmg](https://github.com/clawovo/mini-token-monitor/releases/download/v0.1.3/Mini-Token-Monitor-0.1.3-arm64.dmg)
- **macOS Intel** — [Mini-Token-Monitor-0.1.3-x64.dmg](https://github.com/clawovo/mini-token-monitor/releases/download/v0.1.3/Mini-Token-Monitor-0.1.3-x64.dmg)
- **Windows 安装版** — [Mini-Token-Monitor-Setup-0.1.3.exe](https://github.com/clawovo/mini-token-monitor/releases/download/v0.1.3/Mini-Token-Monitor-Setup-0.1.3.exe)（推荐）
- **Windows 便携版** — [Mini-Token-Monitor-0.1.3.exe](https://github.com/clawovo/mini-token-monitor/releases/download/v0.1.3/Mini-Token-Monitor-0.1.3.exe)（免安装）
- **Linux x64** — [Mini-Token-Monitor-0.1.3.AppImage](https://github.com/clawovo/mini-token-monitor/releases/download/v0.1.3/Mini-Token-Monitor-0.1.3.AppImage)

<details>
<summary><strong>首次启动与其他说明</strong></summary>

### 首次启动

**macOS：** 应用已使用 Developer ID 签名并通过 Apple 公证。打开 `.dmg`，然后把 Mini Token Monitor 拖到 Applications。

**Windows：** 两个可执行文件均已签名（[查看验证方法](https://github.com/clawovo/mini-token-monitor/blob/main/docs/code-signing.md#verify-a-download)）。

**Linux：** 先给 AppImage 执行权限，然后运行：

```bash
chmod +x "Mini Token Monitor"*.AppImage
./"Mini Token Monitor"*.AppImage
```

### 其他说明

其他平台暂不提供预构建版本，请参考 [README](https://github.com/clawovo/mini-token-monitor#readme) 从源码运行。macOS 的 `.zip` 只是同一个 app 的重新打包版本，除非你明确需要，否则可以忽略。

### tokscale 依赖

Tokscale 已随应用内置。你可以在 **设置 → Tokscale** 查看确切版本，
也可以直接从 npm 下载更新版本。Tokscale 是 MIT 开源项目：
https://github.com/junhoyeo/tokscale

</details>

---

<details>
<summary><strong>Full Changelog:</strong> <a href="https://github.com/clawovo/mini-token-monitor/compare/v0.1.2...v0.1.3">v0.1.2...v0.1.3</a></summary>

<!-- github-generated-release-notes -->

</details>

<details>
<summary>繁體中文 · 한국어 · 日本語</summary>

<details>
<summary><strong>繁體中文</strong></summary>

## 繁體中文

## 更新內容

<!-- app-update-notes:zh-TW:start -->
### 新增
- **透過 CLI 讀取 Coding Plan 額度：** 沒有 access key 時，除 Agent Plan 外也會讀取 Coding Plan，只用 arkcli 的設定現在兩個套餐都能顯示。（#a01a79b）
- **arkcli 安裝說明：** Volcengine 設定新增官方 arkcli 安裝頁連結 —— 套餐專屬 APIKey 無法查詢額度。（#ec95b4d）

### 修復
- **版本管理器安裝的 arkcli 讀不到額度：** 現在可以發現透過 nvm、volta、fnm、asdf、pnpm、yarn 安裝的 arkcli。從 Dock 或 Finder 啟動的視窗繼承的是被截斷的搜尋路徑，不包含這些位置，導致額度一直不顯示。（#a01a79b）
- **套餐 APIKey 被誤報為憑證無效：** 套餐專屬 APIKey（ark-…）只用於推理驗證，之前卻被拿去請求 Coding Plan 介面，被拒後顯示為「憑證無效」。現在會回退到已登入的 arkcli；兩者都不可用時，會說明是未安裝還是未登入。（#a01a79b）
<!-- app-update-notes:zh-TW:end -->

## 下載

- **macOS Apple Silicon** — [Mini-Token-Monitor-0.1.3-arm64.dmg](https://github.com/clawovo/mini-token-monitor/releases/download/v0.1.3/Mini-Token-Monitor-0.1.3-arm64.dmg)
- **macOS Intel** — [Mini-Token-Monitor-0.1.3-x64.dmg](https://github.com/clawovo/mini-token-monitor/releases/download/v0.1.3/Mini-Token-Monitor-0.1.3-x64.dmg)
- **Windows 安裝版** — [Mini-Token-Monitor-Setup-0.1.3.exe](https://github.com/clawovo/mini-token-monitor/releases/download/v0.1.3/Mini-Token-Monitor-Setup-0.1.3.exe)（推薦）
- **Windows 便攜版** — [Mini-Token-Monitor-0.1.3.exe](https://github.com/clawovo/mini-token-monitor/releases/download/v0.1.3/Mini-Token-Monitor-0.1.3.exe)（免安裝）
- **Linux x64** — [Mini-Token-Monitor-0.1.3.AppImage](https://github.com/clawovo/mini-token-monitor/releases/download/v0.1.3/Mini-Token-Monitor-0.1.3.AppImage)

</details>

<details>
<summary><strong>한국어</strong></summary>

## 한국어

## 업데이트 내용

<!-- app-update-notes:ko:start -->
### 추가
- **CLI에서 Coding Plan 할당량 읽기:** access key가 없을 때 Agent Plan과 함께 Coding Plan도 읽어, arkcli만 설정한 환경에서도 두 플랜이 모두 표시됩니다. (#a01a79b)
- **arkcli 설치 안내:** Volcengine 설정에 공식 arkcli 설치 페이지 링크를 추가했습니다. 플랜 전용 APIKey로는 할당량을 조회할 수 없습니다. (#ec95b4d)

### 수정
- **버전 관리자로 설치한 arkcli를 찾지 못하던 문제:** nvm, volta, fnm, asdf, pnpm, yarn으로 설치한 arkcli를 찾습니다. Dock이나 Finder에서 실행한 창은 축소된 검색 경로를 물려받아 이런 위치가 빠져 있었고, 그래서 할당량이 표시되지 않았습니다. (#a01a79b)
- **플랜 APIKey가 잘못된 자격 증명으로 표시되던 문제:** 플랜 전용 APIKey(ark-…)는 추론 인증용인데도 Coding Plan 엔드포인트로 요청되어, 거부되면 "자격 증명이 잘못됨"으로 표시되었습니다. 이제 로그인된 arkcli로 넘어가고, 둘 다 응답하지 못하면 미설치인지 로그아웃 상태인지 알려줍니다. (#a01a79b)
<!-- app-update-notes:ko:end -->

## 다운로드

- **macOS Apple Silicon** — [Mini-Token-Monitor-0.1.3-arm64.dmg](https://github.com/clawovo/mini-token-monitor/releases/download/v0.1.3/Mini-Token-Monitor-0.1.3-arm64.dmg)
- **macOS Intel** — [Mini-Token-Monitor-0.1.3-x64.dmg](https://github.com/clawovo/mini-token-monitor/releases/download/v0.1.3/Mini-Token-Monitor-0.1.3-x64.dmg)
- **Windows 설치 버전** — [Mini-Token-Monitor-Setup-0.1.3.exe](https://github.com/clawovo/mini-token-monitor/releases/download/v0.1.3/Mini-Token-Monitor-Setup-0.1.3.exe) (권장)
- **Windows 포터블 버전** — [Mini-Token-Monitor-0.1.3.exe](https://github.com/clawovo/mini-token-monitor/releases/download/v0.1.3/Mini-Token-Monitor-0.1.3.exe) (설치 필요 없음)
- **Linux x64** — [Mini-Token-Monitor-0.1.3.AppImage](https://github.com/clawovo/mini-token-monitor/releases/download/v0.1.3/Mini-Token-Monitor-0.1.3.AppImage)

</details>

<details>
<summary><strong>日本語</strong></summary>

## 日本語

## 更新内容

<!-- app-update-notes:ja:start -->
### 追加
- **CLI からの Coding Plan 割り当て読み取り:** access key がない場合に Agent Plan とあわせて Coding Plan も読み取るため、arkcli だけの構成でも両方のプランが表示されます。（#a01a79b）
- **arkcli のインストール手順:** Volcengine 設定に公式 arkcli インストールページへのリンクを追加しました。プラン専用 APIKey では割り当てを確認できません。（#ec95b4d）

### 修正
- **バージョン管理ツールで入れた arkcli が見つからない問題:** nvm、volta、fnm、asdf、pnpm、yarn でインストールした arkcli を検出します。Dock や Finder から起動したウィンドウは短縮された検索パスを引き継ぐため、これらの場所が含まれず、割り当てが表示されませんでした。（#a01a79b）
- **プラン APIKey が「認証情報が無効」と誤表示される問題:** プラン専用 APIKey（ark-…）は推論認証用ですが Coding Plan エンドポイントへ問い合わせられ、拒否されると「認証情報が無効」と表示されていました。現在はログイン済みの arkcli にフォールバックし、どちらも応答しない場合は未インストールか未ログインかを示します。（#a01a79b）
<!-- app-update-notes:ja:end -->

## ダウンロード

- **macOS Apple Silicon** — [Mini-Token-Monitor-0.1.3-arm64.dmg](https://github.com/clawovo/mini-token-monitor/releases/download/v0.1.3/Mini-Token-Monitor-0.1.3-arm64.dmg)
- **macOS Intel** — [Mini-Token-Monitor-0.1.3-x64.dmg](https://github.com/clawovo/mini-token-monitor/releases/download/v0.1.3/Mini-Token-Monitor-0.1.3-x64.dmg)
- **Windows インストーラー** — [Mini-Token-Monitor-Setup-0.1.3.exe](https://github.com/clawovo/mini-token-monitor/releases/download/v0.1.3/Mini-Token-Monitor-Setup-0.1.3.exe)（推奨）
- **Windows ポータブル版** — [Mini-Token-Monitor-0.1.3.exe](https://github.com/clawovo/mini-token-monitor/releases/download/v0.1.3/Mini-Token-Monitor-0.1.3.exe)（インストール不要）
- **Linux x64** — [Mini-Token-Monitor-0.1.3.AppImage](https://github.com/clawovo/mini-token-monitor/releases/download/v0.1.3/Mini-Token-Monitor-0.1.3.AppImage)

</details>

</details>
