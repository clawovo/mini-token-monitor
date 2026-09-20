'use strict';

// Native recursive file watcher.
//
// chokidar 4 removed its optional `fsevents` dependency, so on macOS it no longer
// uses the platform's tree watcher and instead opens one fs.watch handle per
// *file*. Measured on a real client tree (12 roots, ~25k files): ~25,000 open
// descriptors and 51-58% of a core with almost no event traffic — attachment
// alone was the cost. Node's own recursive fs.watch uses the platform mechanism
// instead — FSEvents on macOS, ReadDirectoryChangesW on Windows, and a directory
// walk over inotify on Linux (supported since Node 19.1) — which measured 0.0%
// CPU and 13 descriptors on the same tree.
//
// This is a deliberately small chokidar-shaped adapter: `.on('all'|'error'|
// 'ready')`, `.once(...)` and `.close()`. Everything else stays where it was —
// roots, pruning policy, client attribution, debouncing and every tick decision
// belong to the owner, which is why the event NAME is passed through unmapped:
// the owner only uses it as a diagnostic label (`watch:<event>:<file>`).
//
// Pruning moves from "never recurse into an ignored directory" to "drop the
// event": a tree watcher cannot stop the OS from reporting a path under it, so
// the same predicate is applied per event. It is a path test, not a stat.

const fs = require('node:fs');
const path = require('node:path');

function createNativeWatcher(config = {}) {
  const dirs = Array.isArray(config.dirs) ? config.dirs : [];
  const ignored = typeof config.ignored === 'function' ? config.ignored : null;
  const listeners = new Map();
  const handles = [];
  let closed = false;

  function on(name, listener) {
    if (typeof listener !== 'function') return;
    const list = listeners.get(name) || [];
    list.push(listener);
    listeners.set(name, list);
  }

  function once(name, listener) {
    const wrapped = (...args) => {
      const list = listeners.get(name);
      if (list) {
        const index = list.indexOf(wrapped);
        if (index >= 0) list.splice(index, 1);
      }
      listener(...args);
    };
    on(name, wrapped);
  }

  function off(name, listener) {
    const list = listeners.get(name);
    if (!list) return;
    const index = list.indexOf(listener);
    if (index >= 0) list.splice(index, 1);
  }

  function emit(name, ...args) {
    const list = listeners.get(name);
    if (!list || list.length === 0) return;
    for (const listener of [...list]) {
      try {
        listener(...args);
      } catch (_) {
        // A throwing listener must not take down the watcher or hide later events.
      }
    }
  }

  function deliver(dir, eventType, filename) {
    if (closed) return;
    // A null filename is a tree-level notification. Fall back to the root rather
    // than dropping it: the owner attributes paths, and the root is still a
    // usable answer (it maps to every client watched under it).
    const target = !filename
      ? dir
      : (path.isAbsolute(filename) ? filename : path.join(dir, String(filename)));
    if (ignored && ignored(target)) return;
    // The platform's event type is passed through unmapped, because it does not
    // carry what chokidar's vocabulary would claim. Measured on darwin: a plain
    // modification of a file that was just created is reported as `rename`, not
    // `change`, so classifying by existence would label an append as a creation.
    // The owner reads the name only as a diagnostic label and attributes by path,
    // so truthful-and-redundant beats precise-looking-and-wrong.
    emit('all', eventType, target);
  }

  const attachFailures = [];
  for (const dir of dirs) {
    let handle;
    try {
      handle = fs.watch(dir, { persistent: true, recursive: true });
    } catch (error) {
      // Includes ERR_FEATURE_UNAVAILABLE_ON_PLATFORM on a platform without
      // recursive support; the owner turns that into the polling fallback.
      attachFailures.push(error);
      continue;
    }
    handle.on('error', (error) => emit('error', error));
    handle.on('change', (eventType, filename) => deliver(dir, eventType, filename));
    handles.push(handle);
  }

  setImmediate(() => {
    if (closed) return;
    // A failure while attaching is reported here, not inline. Both hosts attach
    // their listeners after the factory returns, so an error emitted during
    // construction would reach nobody — no polling fallback would be armed and
    // the watch would decay to silence, which is the failure mode this backend
    // has to be loudest about. Errors come before `ready` so a host that treats
    // "saw an error" as "not ready" suppresses the readiness report.
    for (const error of attachFailures) emit('error', error);
    emit('ready');
  });

  function close() {
    if (closed) return Promise.resolve();
    closed = true;
    for (const handle of handles) {
      try {
        handle.close();
      } catch (_) {
        // Teardown must not throw; the owner is already moving on.
      }
    }
    handles.length = 0;
    listeners.clear();
    return Promise.resolve();
  }

  return { kind: 'native-recursive', on, once, off, close };
}

// Backend selection, kept here so both hosts (in-process and worker) share one
// answer. The polling path deliberately stays on chokidar: it only runs as the
// descriptor-exhaustion fallback, it is the implementation that is already proven
// for that case, and it is where chokidar's own tested polling lives.
//
// `ignored` and `pollingOptions` are passed in rather than imported so this module
// never reaches back into the collector — the collector requires the watch host,
// and a cycle here would hand either side a half-built module.
function createWatchBackend(config = {}) {
  const dirs = Array.isArray(config.dirs) ? config.dirs : [];
  if (config.usePolling === true) {
    const chokidar = require('chokidar');
    return chokidar.watch(dirs, config.pollingOptions || {});
  }
  return createNativeWatcher({ dirs, ignored: config.ignored });
}

module.exports = { createNativeWatcher, createWatchBackend };
