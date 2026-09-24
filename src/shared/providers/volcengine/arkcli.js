'use strict';

const { spawn } = require('node:child_process');
const fs = require('node:fs');
const path = require('node:path');
const { normalizeLimitProvider } = require('../../limits/core');
const {
  envValue,
  pathApiForPlatform,
  pathDelimiterForPlatform,
  uniqueStrings
} = require('../../limits/providerHelpers');
const { hashKey } = require('../../hashKey');
const { abortError } = require('../../probeDeadline');
const { createSubprocessTermination } = require('../../subprocessTermination');

// A period label the backend reports but that carries no displayable window is
// simply absent from this table, which is how `daily` is dropped.
const WINDOWS = {
  '5h': ['session', '5-hour', 300],
  session: ['session', '5-hour', 300],
  daily: ['daily', 'Daily', 1440],
  weekly: ['weekly', 'Weekly', 10080],
  monthly: ['billing', 'Monthly', 43200]
};

// Both plans are independent subscriptions that normally sit on one account, so
// each is queried on its own and reported as its own row. Coding Plan is
// percent-only: the backend returns no absolute amounts for it, so its windows
// must not invent a used/limit pair — while Agent Plan keeps its absolute
// amounts and stays strict about a window that omits them.
const PLAN_PRODUCTS = Object.freeze([
  { id: 'agent-plan', label: 'Agent Plan', mode: 'absolute' },
  { id: 'coding-plan', label: 'Coding Plan', mode: 'percent' }
]);

// The CLI reports an unsubscribed bucket as an explicit hint rather than as a
// failure, which is the normal answer for an account that only owns one plan.
const NOT_SUBSCRIBED_ERROR = 'not subscribed';

function probeError(status = 'unavailable', code = '') {
  return Object.assign(new Error('arkcli quota probe failed'), { status, code });
}

// A GUI-launched app inherits a truncated PATH, so version-manager installs are
// resolved explicitly. These are the common Node install roots that are NOT on
// the inherited PATH of a Dock/Finder-launched process.
function versionManagerBinDirs(env, platform, pathApi) {
  const home = envValue(env, 'HOME') || envValue(env, 'USERPROFILE') || '';
  const appData = envValue(env, 'APPDATA') || '';
  const localAppData = envValue(env, 'LOCALAPPDATA') || '';
  if (platform === 'win32') {
    return uniqueStrings([
      envValue(env, 'NVM_SYMLINK'),
      envValue(env, 'NVM_HOME'),
      appData && pathApi.join(appData, 'nvm'),
      localAppData && pathApi.join(localAppData, 'Volta'),
      localAppData && pathApi.join(localAppData, 'fnm_multishells'),
      home && pathApi.join(home, '.volta', 'bin'),
      home && pathApi.join(home, '.asdf', 'shims')
    ].filter(Boolean));
  }
  return uniqueStrings([
    home && pathApi.join(home, '.volta', 'bin'),
    home && pathApi.join(home, '.asdf', 'shims'),
    home && pathApi.join(home, '.fnm', 'aliases', 'default', 'bin'),
    home && pathApi.join(home, 'Library', 'Application Support', 'fnm', 'aliases', 'default', 'bin'),
    home && pathApi.join(home, '.local', 'share', 'pnpm'),
    home && pathApi.join(home, 'Library', 'pnpm'),
    home && pathApi.join(home, '.yarn', 'bin')
  ].filter(Boolean));
}

// nvm keeps one directory per installed Node version. Newest first, so a stale
// older toolchain can never win over the one the user actually upgraded to.
function compareNodeDirNames(a, b) {
  const parts = (name) => String(name)
    .replace(/^v/, '')
    .split('-')[0]
    .split('.')
    .map((value) => Number.parseInt(value, 10) || 0);
  const left = parts(a);
  const right = parts(b);
  for (let index = 0; index < Math.max(left.length, right.length); index += 1) {
    const delta = (right[index] || 0) - (left[index] || 0);
    if (delta) return delta;
  }
  return String(b).localeCompare(String(a));
}

function nvmBinDirs(env, pathApi) {
  const home = envValue(env, 'HOME') || envValue(env, 'USERPROFILE') || '';
  if (!home) return [];
  const root = pathApi.join(home, '.nvm', 'versions', 'node');
  let names;
  try {
    names = fs.readdirSync(root);
  } catch {
    return [];
  }
  return names
    .filter((name) => /^v?\d+\.\d+\.\d+/.test(name))
    .sort(compareNodeDirNames)
    .map((name) => pathApi.join(root, name, 'bin'));
}

// npm's launcher uses execFileSync and does not forward cancellation. Prefer
// its installed native executable, also avoiding .cmd shell shims on Windows.
function resolveArkcliCommand(env, platform = process.platform, arch = process.arch) {
  const command = env.TOKEN_MONITOR_ARKCLI_COMMAND || 'arkcli';
  const pathApi = pathApiForPlatform(platform);
  const suffixes = platform === 'win32' ? ['', '.exe', '.cmd'] : [''];
  const paths = command.includes('/') || command.includes('\\')
    ? [command]
    : uniqueStrings([
      ...String(envValue(env, 'PATH') || '')
        .split(pathDelimiterForPlatform(platform))
        .filter(Boolean),
      ...versionManagerBinDirs(env, platform, pathApi),
      ...nvmBinDirs(env, pathApi),
      ...(platform === 'win32'
        ? [
          envValue(env, 'APPDATA') && pathApi.join(envValue(env, 'APPDATA'), 'npm'),
          envValue(env, 'LOCALAPPDATA') && pathApi.join(envValue(env, 'LOCALAPPDATA'), 'npm'),
          envValue(env, 'LOCALAPPDATA') && pathApi.join(envValue(env, 'LOCALAPPDATA'), 'pnpm'),
          envValue(env, 'USERPROFILE') && pathApi.join(envValue(env, 'USERPROFILE'), '.npm-global')
        ]
        : [
          '/opt/homebrew/bin',
          '/usr/local/bin',
          '/usr/bin',
          '/bin',
          env.HOME && path.join(env.HOME, '.npm-global', 'bin'),
          env.HOME && path.join(env.HOME, '.bun', 'bin'),
          env.HOME && path.join(env.HOME, '.local', 'bin')
        ])
    ]).flatMap((dir) => suffixes.map((suffix) => pathApi.join(dir, command + suffix)));
  const targetPlatform = { win32: 'windows', darwin: 'darwin', linux: 'linux' }[platform];
  const targetArch = { x64: 'amd64', arm64: 'arm64' }[arch];
  for (const candidate of paths) {
    try {
      const real = fs.realpathSync(candidate);
      const roots = [pathApi.resolve(pathApi.dirname(real), '..'),
        pathApi.join(pathApi.dirname(candidate), 'node_modules', '@volcengine', 'ark-cli')];
      for (const root of uniqueStrings(roots)) {
        if (pathApi.basename(root) !== 'ark-cli') continue;
        const binary = pathApi.join(root, 'bin', `arkcli-${targetPlatform}-${targetArch}${platform === 'win32' ? '.exe' : ''}`);
        if (fs.existsSync(binary)) return binary;
      }
      if (!/\.(cmd|bat)$/i.test(real)) return real;
    } catch { /* Try the next PATH entry. */ }
  }
  return command;
}

// Never log stdout/stderr: auth status may contain identity and credential data.
// Wait for close after cancellation, including escalation for a stuck child.
function runArkcli(args, deps = {}) {
  const env = deps.env || process.env;
  const signal = deps.signal;
  if (signal?.aborted) return Promise.reject(abortError(signal));
  return new Promise((resolve, reject) => {
    let output = '';
    let bytes = 0;
    let failure;
    let settled = false;
    let timer;
    let termination;
    const finish = (error, value) => {
      if (settled) return;
      settled = true;
      clearTimeout(timer);
      signal?.removeEventListener('abort', onAbort);
      if (error) reject(error); else resolve(value);
    };
    const cancel = (error) => {
      failure ||= error;
      termination.request();
    };
    const onAbort = () => cancel(abortError(signal));
    let child;
    try {
      child = (deps.spawn || spawn)(resolveArkcliCommand(env), args, {
        shell: false,
        windowsHide: true,
        stdio: ['ignore', 'pipe', 'ignore'],
        env: { ...env, ARKCLI_NO_UPDATE_NOTIFIER: '1', ARKCLI_CALLER_TYPE: 'ai_agent',
          ARKCLI_CALLER_NAME: 'token-monitor', ARKCLI_SKILL_NAME: 'arkcli-usage' }
      });
    } catch (error) {
      // A missing executable is a different problem from a rejected credential:
      // the user has to install arkcli, not re-authenticate, so it is reported
      // with its own code instead of collapsing into a bare "not configured".
      finish(error.code === 'ENOENT' ? probeError('notConfigured', 'arkcliMissing') : probeError());
      return;
    }
    termination = createSubprocessTermination(child, {
      onUnconfirmed: () => finish(failure || probeError())
    });
    // `usage plan` probes subscriptions and then queries usage over the network,
    // so the bound matches the HTTP deadline rather than the few seconds a purely
    // local command would need.
    timer = setTimeout(() => cancel(probeError()), deps.arkcliTimeoutMs || 12000);
    signal?.addEventListener('abort', onAbort, { once: true });
    if (signal?.aborted) onAbort();
    child.on('error', (error) => {
      failure ||= error.code === 'ENOENT'
        ? probeError('notConfigured', 'arkcliMissing')
        : probeError();
    });
    child.stdout.setEncoding('utf8');
    child.stdout.on('data', (chunk) => {
      bytes += Buffer.byteLength(chunk);
      if (bytes > 1024 * 1024) return cancel(probeError());
      output += chunk.toString('utf8');
    });
    child.stdout.on('error', () => cancel(probeError()));
    child.on('close', (code) => {
      termination.confirmClosed();
      if (failure || code !== 0) return finish(failure || probeError());
      try { finish(null, JSON.parse(output)); } catch { finish(probeError()); }
    });
  });
}

function clampPercent(value) {
  return Math.max(0, Math.min(100, value));
}

// One CLI period becomes one window. Agent Plan reports absolute amounts; Coding
// Plan reports only a percentage, and a window that never carried an absolute
// total must not have one fabricated for it.
function arkcliPeriodWindow(period, percentOnly = false) {
  const [kind, title, windowMinutes] = WINDOWS[period?.label] || [];
  if (!kind) return null;
  const reset = typeof period.reset_at === 'string' ? Date.parse(period.reset_at) : NaN;
  const resetsAt = Number.isFinite(reset) ? new Date(reset).toISOString() : null;
  if (percentOnly) {
    // Percent-only (Coding Plan). Anything that is not a finite percentage in
    // range is malformed rather than zero. The upper end is clamped instead of
    // rejected, matching how an absolute window derives its own percentage.
    if (typeof period.percent !== 'number' || !Number.isFinite(period.percent) || period.percent < 0) {
      throw probeError();
    }
    const usedPercent = clampPercent(period.percent);
    return { kind, label: title, windowMinutes, usedPercent,
      remainingPercent: clampPercent(100 - usedPercent), resetsAt, showMeter: true };
  }
  const { total } = period;
  // arkcli omits used after a window resets; only explicit 0% proves zero.
  const used = period.used === undefined && period.percent === 0 ? 0 : period.used;
  if (typeof total !== 'number' || !Number.isFinite(total) || total < 0) throw probeError();
  if (total === 0) return null;
  if (typeof used !== 'number' || !Number.isFinite(used) || used < 0) throw probeError();
  return { kind, label: title, windowMinutes, used, limit: total,
    remaining: Math.max(0, total - used), usedPercent: Math.min(100, used / total * 100),
    resetsAt, showMeter: true };
}

function parseArkcliPlan(body, updatedAt, productId = PLAN_PRODUCTS[0].id) {
  const viewer = body?.viewer;
  if (!viewer?.account_id || !Array.isArray(body?.items)) throw probeError();
  const item = body.items.find((entry) => entry?.product === productId);
  if (!item || typeof item.subscribed !== 'boolean') throw probeError();
  if (item.error && item.error !== NOT_SUBSCRIBED_ERROR) throw probeError();
  if (!item.subscribed || item.error === NOT_SUBSCRIBED_ERROR) return null;
  if (!Array.isArray(item.periods)) throw probeError();
  const plan = PLAN_PRODUCTS.find((entry) => entry.id === productId);
  const percentOnly = plan?.mode === 'percent';
  const windows = item.periods.map((period) => arkcliPeriodWindow(period, percentOnly)).filter(Boolean);
  if (!windows.length) throw probeError();
  return normalizeLimitProvider({
    provider: 'volcengine', source: 'cli', status: 'ok', updatedAt,
    // Derived from the key that actually answered, so both plans of one account
    // keep distinct rows while a different account still gets its own identity.
    accountKey: hashKey('volcengine', 'arkcli', viewer.account_id, viewer.user_id || '', viewer.region || '', productId),
    accountLabel: plan ? plan.label : productId,
    planLabel: typeof item.tier === 'string' ? item.tier : '',
    region: viewer.region, windows
  });
}

async function fetchArkcliLimits(deps, updatedAt) {
  const run = deps.runArkcli || ((args) => runArkcli(args, deps));
  const status = (value, actionRequired) => normalizeLimitProvider({
    provider: 'volcengine', source: 'cli', status: value, updatedAt, windows: [],
    ...(actionRequired ? { actionRequired } : {})
  });
  let auth;
  try {
    auth = await run(['auth', 'status', '--format', 'json']);
  } catch (error) {
    if (deps.signal?.aborted) throw abortError(deps.signal);
    if (error.code === 'arkcliMissing') return [status('notConfigured', 'arkcliNotInstalled')];
    return [status(error.status === 'notConfigured' ? 'notConfigured' : 'unavailable')];
  }
  if (typeof auth?.logged_in !== 'boolean') return [status('unavailable')];
  if (!auth.logged_in || !['sso', 'sts', 'aksk'].includes(auth.auth_method)) {
    return [status('notConfigured', 'arkcliNotSignedIn')];
  }
  const profile = auth.active_profile?.name;
  const results = await Promise.allSettled(PLAN_PRODUCTS.map(async ({ id }) => {
    const args = ['usage', 'plan', '--product', id, '--format', 'json'];
    if (profile) args.push('--profile', profile);
    return parseArkcliPlan(await run(args), updatedAt, id);
  }));
  // One bucket failing must not hide another: an account that owns a single plan
  // is the normal case, and each plan answers independently.
  const rows = results.filter((entry) => entry.status === 'fulfilled' && entry.value)
    .map((entry) => entry.value);
  if (rows.length) return rows;
  return [status(results.some((entry) => entry.status === 'rejected') ? 'unavailable' : 'notConfigured')];
}

module.exports = {
  NOT_SUBSCRIBED_ERROR,
  PLAN_PRODUCTS,
  WINDOWS,
  arkcliPeriodWindow,
  fetchArkcliLimits,
  nvmBinDirs,
  parseArkcliPlan,
  runArkcli,
  resolveArkcliCommand,
  versionManagerBinDirs
};
