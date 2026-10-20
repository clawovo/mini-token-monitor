# English

## What's changed

<!-- app-update-notes:en:start -->
### Added
- **OpenCode 2 support:** Limits, Session Detail, and the local Go ledger now read OpenCode 2's `opencode.db`. Credentials come from its new `credential` table, with `auth.json` kept as a fallback for older installs. (#1f2ae96)
<!-- app-update-notes:en:end -->

## Download

- **macOS Apple Silicon** — [Mini-Token-Monitor-0.1.4-arm64.dmg](https://github.com/clawovo/mini-token-monitor/releases/download/v0.1.4/Mini-Token-Monitor-0.1.4-arm64.dmg)
- **macOS Intel** — [Mini-Token-Monitor-0.1.4-x64.dmg](https://github.com/clawovo/mini-token-monitor/releases/download/v0.1.4/Mini-Token-Monitor-0.1.4-x64.dmg)
- **Windows Installer** — [Mini-Token-Monitor-Setup-0.1.4.exe](https://github.com/clawovo/mini-token-monitor/releases/download/v0.1.4/Mini-Token-Monitor-Setup-0.1.4.exe) (recommended)
- **Windows Portable** — [Mini-Token-Monitor-0.1.4.exe](https://github.com/clawovo/mini-token-monitor/releases/download/v0.1.4/Mini-Token-Monitor-0.1.4.exe) (no install required)
- **Linux x64** — [Mini-Token-Monitor-0.1.4.AppImage](https://github.com/clawovo/mini-token-monitor/releases/download/v0.1.4/Mini-Token-Monitor-0.1.4.AppImage)

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
- **支持 OpenCode 2：** 限额、会话详情和本地 Go 用量现在从 OpenCode 2 的 `opencode.db` 读取。凭据改从新的 `credential` 表读取，并保留 `auth.json` 作为旧版安装的回退。（#1f2ae96）
<!-- app-update-notes:zh:end -->

## 下载

- **macOS Apple Silicon** — [Mini-Token-Monitor-0.1.4-arm64.dmg](https://github.com/clawovo/mini-token-monitor/releases/download/v0.1.4/Mini-Token-Monitor-0.1.4-arm64.dmg)
- **macOS Intel** — [Mini-Token-Monitor-0.1.4-x64.dmg](https://github.com/clawovo/mini-token-monitor/releases/download/v0.1.4/Mini-Token-Monitor-0.1.4-x64.dmg)
- **Windows 安装版** — [Mini-Token-Monitor-Setup-0.1.4.exe](https://github.com/clawovo/mini-token-monitor/releases/download/v0.1.4/Mini-Token-Monitor-Setup-0.1.4.exe)（推荐）
- **Windows 便携版** — [Mini-Token-Monitor-0.1.4.exe](https://github.com/clawovo/mini-token-monitor/releases/download/v0.1.4/Mini-Token-Monitor-0.1.4.exe)（免安装）
- **Linux x64** — [Mini-Token-Monitor-0.1.4.AppImage](https://github.com/clawovo/mini-token-monitor/releases/download/v0.1.4/Mini-Token-Monitor-0.1.4.AppImage)

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
<summary><strong>Full Changelog:</strong> <a href="https://github.com/clawovo/mini-token-monitor/compare/v0.1.3...v0.1.4">v0.1.3...v0.1.4</a></summary>

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
- **支援 OpenCode 2：** 限額、工作階段詳情與本機 Go 用量現在從 OpenCode 2 的 `opencode.db` 讀取。憑證改從新的 `credential` 表讀取，並保留 `auth.json` 作為舊版安裝的備援。（#1f2ae96）
<!-- app-update-notes:zh-TW:end -->

## 下載

- **macOS Apple Silicon** — [Mini-Token-Monitor-0.1.4-arm64.dmg](https://github.com/clawovo/mini-token-monitor/releases/download/v0.1.4/Mini-Token-Monitor-0.1.4-arm64.dmg)
- **macOS Intel** — [Mini-Token-Monitor-0.1.4-x64.dmg](https://github.com/clawovo/mini-token-monitor/releases/download/v0.1.4/Mini-Token-Monitor-0.1.4-x64.dmg)
- **Windows 安裝版** — [Mini-Token-Monitor-Setup-0.1.4.exe](https://github.com/clawovo/mini-token-monitor/releases/download/v0.1.4/Mini-Token-Monitor-Setup-0.1.4.exe)（推薦）
- **Windows 便攜版** — [Mini-Token-Monitor-0.1.4.exe](https://github.com/clawovo/mini-token-monitor/releases/download/v0.1.4/Mini-Token-Monitor-0.1.4.exe)（免安裝）
- **Linux x64** — [Mini-Token-Monitor-0.1.4.AppImage](https://github.com/clawovo/mini-token-monitor/releases/download/v0.1.4/Mini-Token-Monitor-0.1.4.AppImage)

</details>

<details>
<summary><strong>한국어</strong></summary>

## 한국어

## 업데이트 내용

<!-- app-update-notes:ko:start -->
### 추가
- **OpenCode 2 지원:** 사용량 한도, 세션 상세, 로컬 Go 사용량을 이제 OpenCode 2의 `opencode.db`에서 읽습니다. 자격 증명은 새 `credential` 테이블에서 읽고, 이전 설치를 위해 `auth.json`을 대체 경로로 유지합니다. (#1f2ae96)
<!-- app-update-notes:ko:end -->

## 다운로드

- **macOS Apple Silicon** — [Mini-Token-Monitor-0.1.4-arm64.dmg](https://github.com/clawovo/mini-token-monitor/releases/download/v0.1.4/Mini-Token-Monitor-0.1.4-arm64.dmg)
- **macOS Intel** — [Mini-Token-Monitor-0.1.4-x64.dmg](https://github.com/clawovo/mini-token-monitor/releases/download/v0.1.4/Mini-Token-Monitor-0.1.4-x64.dmg)
- **Windows 설치 버전** — [Mini-Token-Monitor-Setup-0.1.4.exe](https://github.com/clawovo/mini-token-monitor/releases/download/v0.1.4/Mini-Token-Monitor-Setup-0.1.4.exe) (권장)
- **Windows 포터블 버전** — [Mini-Token-Monitor-0.1.4.exe](https://github.com/clawovo/mini-token-monitor/releases/download/v0.1.4/Mini-Token-Monitor-0.1.4.exe) (설치 필요 없음)
- **Linux x64** — [Mini-Token-Monitor-0.1.4.AppImage](https://github.com/clawovo/mini-token-monitor/releases/download/v0.1.4/Mini-Token-Monitor-0.1.4.AppImage)

</details>

<details>
<summary><strong>日本語</strong></summary>

## 日本語

## 更新内容

<!-- app-update-notes:ja:start -->
### 追加
- **OpenCode 2 対応:** 利用上限、セッション詳細、ローカル Go 使用量を OpenCode 2 の `opencode.db` から読み取るようになりました。認証情報は新しい `credential` テーブルから読み取り、旧バージョンのインストール向けに `auth.json` をフォールバックとして残します。（#1f2ae96）
<!-- app-update-notes:ja:end -->

## ダウンロード

- **macOS Apple Silicon** — [Mini-Token-Monitor-0.1.4-arm64.dmg](https://github.com/clawovo/mini-token-monitor/releases/download/v0.1.4/Mini-Token-Monitor-0.1.4-arm64.dmg)
- **macOS Intel** — [Mini-Token-Monitor-0.1.4-x64.dmg](https://github.com/clawovo/mini-token-monitor/releases/download/v0.1.4/Mini-Token-Monitor-0.1.4-x64.dmg)
- **Windows インストーラー** — [Mini-Token-Monitor-Setup-0.1.4.exe](https://github.com/clawovo/mini-token-monitor/releases/download/v0.1.4/Mini-Token-Monitor-Setup-0.1.4.exe)（推奨）
- **Windows ポータブル版** — [Mini-Token-Monitor-0.1.4.exe](https://github.com/clawovo/mini-token-monitor/releases/download/v0.1.4/Mini-Token-Monitor-0.1.4.exe)（インストール不要）
- **Linux x64** — [Mini-Token-Monitor-0.1.4.AppImage](https://github.com/clawovo/mini-token-monitor/releases/download/v0.1.4/Mini-Token-Monitor-0.1.4.AppImage)

</details>

</details>
