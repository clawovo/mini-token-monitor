# English

## What's changed

<!-- app-update-notes:en:start -->
### Added
- **Penguin Harness usage:** Reads token usage from a locally installed [Penguin Harness](https://github.com/Prism-Shadow/penguin-harness) (`web.db`). Off by default — enable it under **Settings → Collection**. If you run the dev build, point `PENGUIN_HOME` at its data root. (#118772c)

### Improved
- **Much lower power consumption:** The file watcher now uses the operating system's recursive notifications instead of one handle per file, and the dashboard only repaints when something it shows has actually changed. Measured on a machine with a large local history, the main process's idle CPU fell from roughly 8% to well under 1%, and its open file descriptors from about 2,900 to about 130. (#b8b8251, #cb43c78)
<!-- app-update-notes:en:end -->

## Download

- **macOS Apple Silicon** — [Mini-Token-Monitor-0.1.2-arm64.dmg](https://github.com/clawovo/mini-token-monitor/releases/download/v0.1.2/Mini-Token-Monitor-0.1.2-arm64.dmg)
- **macOS Intel** — [Mini-Token-Monitor-0.1.2-x64.dmg](https://github.com/clawovo/mini-token-monitor/releases/download/v0.1.2/Mini-Token-Monitor-0.1.2-x64.dmg)
- **Windows Installer** — [Mini-Token-Monitor-Setup-0.1.2.exe](https://github.com/clawovo/mini-token-monitor/releases/download/v0.1.2/Mini-Token-Monitor-Setup-0.1.2.exe) (recommended)
- **Windows Portable** — [Mini-Token-Monitor-0.1.2.exe](https://github.com/clawovo/mini-token-monitor/releases/download/v0.1.2/Mini-Token-Monitor-0.1.2.exe) (no install required)
- **Linux x64** — [Mini-Token-Monitor-0.1.2.AppImage](https://github.com/clawovo/mini-token-monitor/releases/download/v0.1.2/Mini-Token-Monitor-0.1.2.AppImage)

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
- **Penguin Harness 用量采集：** 可读取本机安装的 [Penguin Harness](https://github.com/Prism-Shadow/penguin-harness) 的 Token 用量（`web.db`）。默认关闭，可在**“设置”→“采集”**中开启。若你跑的是 dev 版本，可用 `PENGUIN_HOME` 指向它的数据目录。（#118772c）

### 改进
- **大幅降低耗电：** 文件监听改用系统原生的递归通知，不再为每个文件单独挂一个句柄；仪表盘也只在真正显示的内容发生变化时才重绘。在一台本地历史很大的机器上实测，主进程空闲 CPU 从约 8% 降到远低于 1%，打开的文件描述符从约 2900 降到约 130。（#b8b8251、#cb43c78）
<!-- app-update-notes:zh:end -->

## 下载

- **macOS Apple Silicon** — [Mini-Token-Monitor-0.1.2-arm64.dmg](https://github.com/clawovo/mini-token-monitor/releases/download/v0.1.2/Mini-Token-Monitor-0.1.2-arm64.dmg)
- **macOS Intel** — [Mini-Token-Monitor-0.1.2-x64.dmg](https://github.com/clawovo/mini-token-monitor/releases/download/v0.1.2/Mini-Token-Monitor-0.1.2-x64.dmg)
- **Windows 安装版** — [Mini-Token-Monitor-Setup-0.1.2.exe](https://github.com/clawovo/mini-token-monitor/releases/download/v0.1.2/Mini-Token-Monitor-Setup-0.1.2.exe)（推荐）
- **Windows 便携版** — [Mini-Token-Monitor-0.1.2.exe](https://github.com/clawovo/mini-token-monitor/releases/download/v0.1.2/Mini-Token-Monitor-0.1.2.exe)（免安装）
- **Linux x64** — [Mini-Token-Monitor-0.1.2.AppImage](https://github.com/clawovo/mini-token-monitor/releases/download/v0.1.2/Mini-Token-Monitor-0.1.2.AppImage)

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
<summary><strong>Full Changelog:</strong> <a href="https://github.com/clawovo/mini-token-monitor/compare/v0.1.1...v0.1.2">v0.1.1...v0.1.2</a></summary>

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
- **Penguin Harness 用量採集：** 可讀取本機安裝的 [Penguin Harness](https://github.com/Prism-Shadow/penguin-harness) 的 Token 用量（`web.db`）。預設關閉，可在**「設定」→「採集」**中開啟。若你跑的是 dev 版本，可用 `PENGUIN_HOME` 指向它的資料目錄。（#118772c）

### 改進
- **大幅降低耗電：** 檔案監聽改用系統原生的遞迴通知，不再為每個檔案單獨掛一個句柄；儀表板也只在真正顯示的內容改變時才重繪。在一台本機歷史很大的機器上實測，主程序閒置 CPU 從約 8% 降到遠低於 1%，開啟的檔案描述符從約 2900 降到約 130。（#b8b8251、#cb43c78）
<!-- app-update-notes:zh-TW:end -->

## 下載

- **macOS Apple Silicon** — [Mini-Token-Monitor-0.1.2-arm64.dmg](https://github.com/clawovo/mini-token-monitor/releases/download/v0.1.2/Mini-Token-Monitor-0.1.2-arm64.dmg)
- **macOS Intel** — [Mini-Token-Monitor-0.1.2-x64.dmg](https://github.com/clawovo/mini-token-monitor/releases/download/v0.1.2/Mini-Token-Monitor-0.1.2-x64.dmg)
- **Windows 安裝版** — [Mini-Token-Monitor-Setup-0.1.2.exe](https://github.com/clawovo/mini-token-monitor/releases/download/v0.1.2/Mini-Token-Monitor-Setup-0.1.2.exe)（推薦）
- **Windows 便攜版** — [Mini-Token-Monitor-0.1.2.exe](https://github.com/clawovo/mini-token-monitor/releases/download/v0.1.2/Mini-Token-Monitor-0.1.2.exe)（免安裝）
- **Linux x64** — [Mini-Token-Monitor-0.1.2.AppImage](https://github.com/clawovo/mini-token-monitor/releases/download/v0.1.2/Mini-Token-Monitor-0.1.2.AppImage)

</details>

<details>
<summary><strong>한국어</strong></summary>

## 한국어

## 업데이트 내용

<!-- app-update-notes:ko:start -->
### 추가
- **Penguin Harness 사용량 수집:** 이 컴퓨터에 설치된 [Penguin Harness](https://github.com/Prism-Shadow/penguin-harness)의 토큰 사용량(`web.db`)을 읽습니다. 기본은 꺼짐이며 **설정 → 수집**에서 켭니다. dev 빌드를 쓰는 경우 `PENGUIN_HOME`으로 데이터 루트를 지정하세요. (#118772c)

### 개선
- **전력 소모 대폭 감소:** 파일 감시가 파일마다 핸들을 여는 대신 운영체제의 재귀 알림을 사용하고, 대시보드도 실제로 표시되는 내용이 바뀔 때만 다시 그립니다. 로컬 기록이 많은 컴퓨터에서 측정했을 때 기본 프로세스의 유휴 CPU가 약 8%에서 1% 미만으로, 열린 파일 디스크립터가 약 2900개에서 약 130개로 줄었습니다. (#b8b8251, #cb43c78)
<!-- app-update-notes:ko:end -->

## 다운로드

- **macOS Apple Silicon** — [Mini-Token-Monitor-0.1.2-arm64.dmg](https://github.com/clawovo/mini-token-monitor/releases/download/v0.1.2/Mini-Token-Monitor-0.1.2-arm64.dmg)
- **macOS Intel** — [Mini-Token-Monitor-0.1.2-x64.dmg](https://github.com/clawovo/mini-token-monitor/releases/download/v0.1.2/Mini-Token-Monitor-0.1.2-x64.dmg)
- **Windows 설치 버전** — [Mini-Token-Monitor-Setup-0.1.2.exe](https://github.com/clawovo/mini-token-monitor/releases/download/v0.1.2/Mini-Token-Monitor-Setup-0.1.2.exe) (권장)
- **Windows 포터블 버전** — [Mini-Token-Monitor-0.1.2.exe](https://github.com/clawovo/mini-token-monitor/releases/download/v0.1.2/Mini-Token-Monitor-0.1.2.exe) (설치 필요 없음)
- **Linux x64** — [Mini-Token-Monitor-0.1.2.AppImage](https://github.com/clawovo/mini-token-monitor/releases/download/v0.1.2/Mini-Token-Monitor-0.1.2.AppImage)

</details>

<details>
<summary><strong>日本語</strong></summary>

## 日本語

## 更新内容

<!-- app-update-notes:ja:start -->
### 追加
- **Penguin Harness の使用量収集:** このコンピューターにインストールされた [Penguin Harness](https://github.com/Prism-Shadow/penguin-harness) のトークン使用量（`web.db`）を読み取ります。既定ではオフで、**設定 → 収集** で有効にします。dev ビルドを使っている場合は `PENGUIN_HOME` でデータルートを指定します。（#118772c）

### 改善
- **消費電力を大幅に削減:** ファイル監視がファイルごとにハンドルを開く方式をやめ、OS 標準の再帰通知を使うようになりました。ダッシュボードも実際に表示内容が変わったときだけ再描画します。ローカル履歴が大きいマシンでの実測で、メインプロセスの待機時 CPU が約 8% から 1% 未満に、開いているファイルディスクリプタが約 2900 から約 130 に減りました。（#b8b8251、#cb43c78）
<!-- app-update-notes:ja:end -->

## ダウンロード

- **macOS Apple Silicon** — [Mini-Token-Monitor-0.1.2-arm64.dmg](https://github.com/clawovo/mini-token-monitor/releases/download/v0.1.2/Mini-Token-Monitor-0.1.2-arm64.dmg)
- **macOS Intel** — [Mini-Token-Monitor-0.1.2-x64.dmg](https://github.com/clawovo/mini-token-monitor/releases/download/v0.1.2/Mini-Token-Monitor-0.1.2-x64.dmg)
- **Windows インストーラー** — [Mini-Token-Monitor-Setup-0.1.2.exe](https://github.com/clawovo/mini-token-monitor/releases/download/v0.1.2/Mini-Token-Monitor-Setup-0.1.2.exe)（推奨）
- **Windows ポータブル版** — [Mini-Token-Monitor-0.1.2.exe](https://github.com/clawovo/mini-token-monitor/releases/download/v0.1.2/Mini-Token-Monitor-0.1.2.exe)（インストール不要）
- **Linux x64** — [Mini-Token-Monitor-0.1.2.AppImage](https://github.com/clawovo/mini-token-monitor/releases/download/v0.1.2/Mini-Token-Monitor-0.1.2.AppImage)

</details>

</details>
