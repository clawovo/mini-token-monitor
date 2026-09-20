'use strict';

// Every other watcher test stubs the watch backend, which means none of them can
// tell whether native file events actually arrive on the platform running them.
// That gap is the whole risk in watching without polling: the failure mode is
// not a crash but silence, and silence looks exactly like an idle machine.
//
// So this file drives the real backend (createWatchBackend, the same factory both
// production hosts call) against the real filesystem with the real pruning
// matcher, and asserts that a write produces an event. CI runs the suite on
// ubuntu-latest, windows-latest and macos-latest, so this is the check that keeps
// native events honest on the two platforms the maintainer cannot test by hand.
//
// It asserts delivery, never latency. A shared CI runner is far too noisy for a
// timing assertion, and a flaky test in this position would get muted, which
// costs exactly the coverage it exists to provide.

const test = require('node:test');
const assert = require('node:assert');
const fs = require('node:fs');
const os = require('node:os');
const path = require('node:path');
const { createWatchBackend } = require('../../src/shared/nativeWatcher');

const { watchIgnoreMatcher } = require('../../src/shared/collector');
const { installSourceEnvGuard } = require('../helpers/sourceEnv');

installSourceEnvGuard(test);

// The native backend emits as soon as the platform reports a change (the old
// chokidar path held one back for awaitWriteFinish's 500 ms first), so the floor
// here is scheduling noise rather than a deliberate delay. The bound is generous
// on purpose: this asserts that events arrive at all, so the only thing a tighter
// bound buys is a faster failure on a starved runner, at the cost of failing for
// a reason that has nothing to do with the watcher.
const EVENT_TIMEOUT_MS = 45 * 1000;

// Why the writes below are retried rather than done once after `ready`.
//
// The platform's native stream and this process attaching to it are not the same
// instant, and a file created in between is reported by neither. That event is
// lost for good, while any later write to the same path arrives normally.
//
// Measured on darwin with the repro that found this (against the previous
// chokidar backend, whose `ready` meant "initial scan finished"): writing once
// immediately after `ready` lost the event in 0/120 runs single-process, but 27%
// of runs with eight watcher processes in parallel — which is what `node --test`
// does to this file. Every failure had the same shape: no first event, and a
// second write to the same path delivered ~610 ms later. That is the ~15% CI flake.
//
// Re-touching until an event lands does not weaken anything. A watcher that is
// genuinely not delivering never produces an event however many times the file
// is written; only the unobservable scan/stream boundary is retried away. It
// also makes the pruning assertion below stronger, because by the time it runs
// the stream is proven live rather than assumed live.
const TOUCH_INTERVAL_MS = 1500;

// Retrying an individual write is not enough on its own: a watcher that never
// attached, or a directory the tree watcher did not pick up, produces no event
// however many times the file is written. So prove the stream is delivering with
// a throwaway file first, and only then let the test do what it came to do.
//
// `liveDir` must be a path the watcher is not pruning — for a test that passes
// an `ignored` matcher, the sentinel goes in a directory that matcher keeps.
async function awaitWatcherLive(watcher, liveDir) {
  const sentinel = path.join(liveDir, '.tm-watch-live');
  const seen = new Promise((resolve) => {
    watcher.on('all', (_event, filePath) => {
      if (path.basename(filePath) === '.tm-watch-live') resolve();
    });
  });
  try {
    await writeUntilObserved(sentinel, 'live\n', seen, 'the liveness sentinel');
  } finally {
    fs.rmSync(sentinel, { force: true });
  }
}

async function writeUntilObserved(filePath, contents, observed, label) {
  const deadline = Date.now() + EVENT_TIMEOUT_MS;
  let firstWrite = true;
  while (Date.now() < deadline) {
    if (firstWrite) {
      fs.writeFileSync(filePath, contents);
      firstWrite = false;
    } else {
      fs.appendFileSync(filePath, contents);
    }
    const landed = await Promise.race([
      observed.then(() => true),
      new Promise((resolve) => setTimeout(() => resolve(false), TOUCH_INTERVAL_MS).unref())
    ]);
    if (landed) return;
  }
  throw new Error(`no native file event for ${label} within ${EVENT_TIMEOUT_MS}ms on ${process.platform}`);
}

// os.tmpdir() is an 8.3 short path on the Windows CI runner
// (C:\Users\RUNNER~1\...), and handing one to fs.watch aborts the process
// inside libuv rather than raising anything catchable. Production never watches
// tmp, and canonicalWatchPath() guards the roots it does watch, so canonicalise
// here for the same reason: to exercise native events, not that libuv bug.
function withTmpDir() {
  return fs.mkdtempSync(path.join(fs.realpathSync.native(os.tmpdir()), 'tm-watch-'));
}

function samePath(left, right) {
  return Boolean(left) && path.resolve(left) === path.resolve(right);
}

// `act` receives a helper that writes the target file and keeps re-touching it
// until its event is observed, so callers never depend on the scan/stream gap.
async function watchAndCollect(dir, act) {
  const events = [];
  // This file is the only one that drives a real watcher rather than a stub, so it
  // is the standing check that the native backend actually delivers events.
  const watcher = createWatchBackend({ dirs: [dir], usePolling: false, ignored: null });
  assert.strictEqual(watcher.kind, 'native-recursive', 'this suite must exercise the native backend');

  function waitForEvent(predicate, description) {
    return new Promise((resolve, reject) => {
      let timer = null;
      const cleanup = () => {
        if (timer) clearTimeout(timer);
        watcher.off('all', onAll);
        watcher.off('error', onError);
      };
      const onAll = (event, filePath) => {
        const entry = { event, filePath };
        events.push(entry);
        if (!predicate(event, filePath)) return;
        cleanup();
        resolve(entry);
      };
      const onError = (error) => {
        cleanup();
        reject(error);
      };
      timer = setTimeout(() => {
        cleanup();
        reject(new Error(`no ${description} within ${EVENT_TIMEOUT_MS}ms on ${process.platform}`));
      }, EVENT_TIMEOUT_MS);
      timer.unref();
      watcher.on('all', onAll);
      watcher.on('error', onError);
    });
  }

  try {
    await new Promise((resolve, reject) => {
      watcher.once('ready', resolve);
      watcher.once('error', reject);
    });
    await awaitWatcherLive(watcher, dir);
    const observedFor = (filePath) => new Promise((resolve) => {
      watcher.on('all', (event, seenPath) => {
        if (path.resolve(seenPath) === path.resolve(filePath)) resolve();
      });
    });
    watcher.on('all', (event, filePath) => events.push({ event, filePath }));
    await act({
      writeAndAwait: async (filePath, contents) => {
        await writeUntilObserved(filePath, contents, observedFor(filePath), path.basename(filePath));
      },
      waitForEvent
    });
  } finally {
    await watcher.close();
  }
  return events;
}

test('native file events reach a watcher on this platform', async () => {
  const dir = withTmpDir();
  try {
    const events = await watchAndCollect(dir, async ({ writeAndAwait }) => {
      await writeAndAwait(path.join(dir, 'session.jsonl'), '{"tokens":1}\n');
    });
    assert.ok(
      events.some((entry) => path.basename(entry.filePath) === 'session.jsonl'),
      `expected an event for session.jsonl, got ${JSON.stringify(events)}`
    );
  } finally {
    fs.rmSync(dir, { recursive: true, force: true });
  }
});

test('native file events reach a subdirectory created after the watch started', async () => {
  // The realistic hot path, and the one a per-directory backend can miss:
  // clients write into a fresh project directory (~/.claude/projects/<new>/)
  // that did not exist when the watcher was built. A tree watcher covers it from
  // the root, but only if the platform keeps reporting paths under the new
  // directory — which is what this asserts.
  //
  // The event NAME is deliberately not asserted. The platform's own flags do not
  // map onto chokidar's vocabulary (measured on darwin: a modification of a
  // just-created file arrives as `rename`, not `change`), and the collector reads
  // the name only as a diagnostic label while attributing clients by path.
  const dir = withTmpDir();
  try {
    const projectDir = path.join(dir, 'a-new-project');
    const sessionPath = path.join(projectDir, 'session.jsonl');
    const events = await watchAndCollect(dir, async ({ waitForEvent }) => {
      const projectEvent = waitForEvent(
        (_event, filePath) => samePath(filePath, projectDir),
        'an event for the new project directory'
      );
      const sessionEvent = waitForEvent(
        (_event, filePath) => samePath(filePath, sessionPath),
        'an event for session.jsonl inside the new directory'
      );
      fs.mkdirSync(projectDir);
      fs.writeFileSync(sessionPath, '{"tokens":1}\n');
      await projectEvent;
      await sessionEvent;

      // The stream is still following the new directory, not just announcing it.
      const appendedEvent = waitForEvent(
        (_event, filePath) => samePath(filePath, sessionPath),
        'an event after appending inside the new directory'
      );
      fs.appendFileSync(sessionPath, '{"tokens":2}\n');
      await appendedEvent;
    });
    assert.ok(
      events.some((entry) => path.basename(entry.filePath) === 'session.jsonl'),
      `expected an event inside the new directory, got ${JSON.stringify(events)}`
    );
  } finally {
    fs.rmSync(dir, { recursive: true, force: true });
  }
});

test('native watcher applies bounded pruning without hiding an overlapping recursive source', async () => {
  const dir = withTmpDir();
  const opencodeRoot = path.join(dir, '.local', 'share', 'opencode');
  const codexRoot = path.join(opencodeRoot, 'sessions');
  const unrelatedRoot = path.join(opencodeRoot, 'log');
  const relevantFile = path.join(codexRoot, 'session.jsonl');
  const unrelatedFile = path.join(unrelatedRoot, 'runtime.log');
  const originalHomedir = os.homedir;
  const previousCodexHome = process.env.CODEX_HOME;
  let watcher;
  os.homedir = () => dir;
  try {
    fs.mkdirSync(codexRoot, { recursive: true });
    fs.mkdirSync(unrelatedRoot, { recursive: true });
    process.env.CODEX_HOME = opencodeRoot;
    const ignored = watchIgnoreMatcher('opencode,codex');
    watcher = createWatchBackend({
      dirs: [opencodeRoot, codexRoot],
      usePolling: false,
      ignored
    });
    await new Promise((resolve, reject) => {
      watcher.once('ready', resolve);
      watcher.once('error', reject);
    });

    // codexRoot, not opencodeRoot: the sentinel has to land where this matcher
    // is not pruning, or proving liveness would need the very delivery it is
    // trying to establish.
    await awaitWatcherLive(watcher, codexRoot);

    const events = [];
    const normalizePath = (filePath) => {
      const resolved = path.resolve(filePath);
      return process.platform === 'win32' ? resolved.toLowerCase() : resolved;
    };
    const relevantEvent = new Promise((resolve, reject) => {
      const onEvent = (event, filePath) => {
        events.push({ event, filePath });
        if (normalizePath(filePath) === normalizePath(relevantFile)) {
          resolve();
        }
      };
      watcher.on('all', onEvent);
      watcher.once('error', reject);
    });
    // Establishes that this watcher is delivering before anything is concluded
    // from the absence of an event below.
    await writeUntilObserved(relevantFile, '{"tokens":1}\n', relevantEvent, 'the recursive source');

    // The stream is live now, so silence here is pruning rather than the
    // scan/stream gap. Two touches spaced past awaitWriteFinish's window: one
    // write plus a fixed sleep could still be sitting in that window.
    fs.writeFileSync(unrelatedFile, 'noise\n');
    await new Promise((resolve) => setTimeout(resolve, TOUCH_INTERVAL_MS));
    fs.appendFileSync(unrelatedFile, 'more noise\n');
    await new Promise((resolve) => setTimeout(resolve, TOUCH_INTERVAL_MS));
    assert.ok(
      events.some((entry) => normalizePath(entry.filePath) === normalizePath(relevantFile)),
      `expected an event for ${relevantFile}, got ${JSON.stringify(events)}`
    );
    assert.equal(
      events.some((entry) => normalizePath(entry.filePath) === normalizePath(unrelatedFile)),
      false,
      `unexpected event for pruned path ${unrelatedFile}: ${JSON.stringify(events)}`
    );
  } finally {
    if (watcher) await watcher.close();
    os.homedir = originalHomedir;
    if (previousCodexHome === undefined) delete process.env.CODEX_HOME;
    else process.env.CODEX_HOME = previousCodexHome;
    fs.rmSync(dir, { recursive: true, force: true });
  }
});
