---
summary: Volcengine explicit credentials and local arkcli Coding/Agent Plan discovery.
read_when: Changing Volcengine credentials, CLI detection, or quota mapping.
---

# Volcengine

Explicit AK/SK configuration queries both plans through the management-plane API. An Ark API key (the plan's 专属 APIKey) authenticates inference only and cannot read either plan's quota: the only probe available to it reports request rate limits for the single endpoint it belongs to, so a refusal falls back to the CLI rather than reporting the key as invalid. With no usable credentials, the enabled provider reads both personal plans from `arkcli auth status --format json` followed by one `arkcli usage plan --product <agent-plan|coding-plan> --format json` per plan.

The authenticated profile is pinned for every quota query. No login command is run, and credentials are never exported or copied into Mini Token Monitor. arkcli owns SSO/STS refresh. A missing executable or logged-out CLI remains unconfigured; a failed or malformed query is unavailable rather than zero quota. The existing limits runtime retains last-good quota on transient failures.

The fallback queries both **personal** plans and reports each subscription the account owns as its own row; team seats are not queried. Agent Plan periods are absolute (5h/weekly/monthly) while Coding Plan periods are percent-only (session/weekly/monthly), so a Coding Plan window never invents a used/limit pair. One plan failing never hides the other, and a `daily` period reported by the backend is not displayable. Positive quota is required to display a window. arkcli can omit `used` and `reset_at` after a window resets: a missing `used` is zero only when `percent` is the number `0`, and an absent reset time stays unknown. Other unknown or malformed amounts, including explicit `null` usage, are not treated as zero.

Account identity hashes the CLI viewer's account/user/region plus the plan product, not profile name or tier, so both plans of one account stay distinct rows while a different account still gets its own identity. The CLI and explicit AK/SK paths are exclusive so two accounts are never silently combined; even incomplete explicit credentials block fallback. The one exception is an Ark API key the endpoint refuses: it cannot answer for quota at all, so the CLI is consulted, and when nothing can answer the CLI's own state is reported instead of blaming a key that is valid for inference.

Discovery is on by default when the Volcengine provider is enabled; no extra arkcli opt-in is required. Mini Token Monitor checks the inherited PATH first, then version-manager roots (nvm `versions/node/*/bin` newest-first, volta, fnm, asdf, pnpm, yarn), then common npm, Homebrew, Bun, and local-bin locations — a GUI-launched app inherits a truncated PATH, so an nvm install is not otherwise reachable. A missing executable is reported separately from a logged-out CLI so the UI can name the step that unblocks it. Set `TOKEN_MONITOR_VOLCENGINE_ARKCLI=0` to disable discovery, or `TOKEN_MONITOR_ARKCLI_COMMAND` to an explicit executable path for another installation.

For a headless deployment, enable `volcengine` in `TOKEN_MONITOR_LIMIT_PROVIDERS`, run the service as the logged-in user, and preserve that user's HOME. No extra polling service is needed.

Subprocesses run without a shell or stdin, with implicit arkcli updates disabled, bounded output and execution time, and cancellation/termination handling. Raw stdout/stderr (especially auth output) must never enter logs or Hub payloads.
