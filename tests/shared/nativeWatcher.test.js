'use strict';

const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const test = require('node:test');

const { createNativeWatcher } = require('../../src/shared/nativeWatcher');

// node:fs is patched on the module object, which is what the backend calls, so
// these cases never touch the real filesystem and never depend on platform
// event timing.
function withStubbedWatch(run) {
  const original = fs.watch;
  const handles = [];
  fs.watch = (dir, options) => {
    const handlers = new Map();
    const handle = {
      dir,
      options,
      closed: 0,
      on(event, handler) {
        handlers.set(event, handler);
        return handle;
      },
      close() {
        handle.closed += 1;
      },
      emit(event, ...args) {
        handlers.get(event)?.(...args);
      }
    };
    handles.push(handle);
    return handle;
  };
  try {
    return run(handles);
  } finally {
    fs.watch = original;
  }
}

function collect(watcher) {
  const events = [];
  watcher.on('all', (event, filePath) => events.push({ event, filePath }));
  return events;
}

test('every root is watched recursively and natively', () => {
  // The whole point of the backend: one recursive platform watcher per root,
  // instead of chokidar 4's one fs.watch handle per file.
  withStubbedWatch((handles) => {
    createNativeWatcher({ dirs: ['/a', '/b'] });
    assert.equal(handles.length, 2);
    assert.deepEqual(handles.map((handle) => handle.dir), ['/a', '/b']);
    for (const handle of handles) {
      assert.equal(handle.options.recursive, true, 'a non-recursive watch is the chokidar regression');
      assert.equal(handle.options.persistent, true);
    }
  });
});

test('the platform filename is resolved against the root that reported it', () => {
  withStubbedWatch((handles) => {
    const watcher = createNativeWatcher({ dirs: ['/roots/one'] });
    const events = collect(watcher);
    const handle = handles[0];

    handle.emit('change', 'change', path.join('project', 's.jsonl'));
    assert.deepEqual(events.at(-1), { event: 'change', filePath: path.join('/roots/one', 'project', 's.jsonl') });

    // Linux's non-native recursive walker can hand back a fuller path; joining it
    // again would produce a path under the root that never existed.
    handle.emit('change', 'change', '/elsewhere/absolute.jsonl');
    assert.deepEqual(events.at(-1), { event: 'change', filePath: '/elsewhere/absolute.jsonl' });

    // A tree-level notification has no filename. Dropping it would lose the event
    // entirely, so the root stands in — it still attributes to its clients.
    handle.emit('change', 'rename', null);
    assert.deepEqual(events.at(-1), { event: 'rename', filePath: '/roots/one' });
  });
});

test('pruned paths are dropped as events instead of being left unwatched', () => {
  // A tree watcher cannot stop the OS from reporting a path under it, so the same
  // predicate chokidar used to decide what to descend into now decides what to
  // drop. Silence for a pruned path is the guarantee; the mechanism is not.
  withStubbedWatch((handles) => {
    const watcher = createNativeWatcher({
      dirs: ['/roots/one'],
      ignored: (target) => target.includes(`${path.sep}logs${path.sep}`)
    });
    const events = collect(watcher);

    handles[0].emit('change', 'change', path.join('logs', 'gateway.log'));
    assert.equal(events.length, 0);

    handles[0].emit('change', 'change', path.join('state.db'));
    assert.equal(events.length, 1, 'a kept path must still be delivered');
    assert.equal(path.basename(events[0].filePath), 'state.db');
  });
});

test('a root that cannot be watched recursively reports an error instead of failing silently', async () => {
  // Silent decay is the risk in watching without polling: if this error never
  // reaches the owner, no polling fallback is armed and the watch just goes quiet.
  // It also has to arrive after the listener is attached, because both hosts
  // attach theirs after the factory returns.
  const original = fs.watch;
  const failure = new Error('recursive watch is unavailable');
  failure.code = 'ERR_FEATURE_UNAVAILABLE_ON_PLATFORM';
  fs.watch = () => {
    throw failure;
  };
  try {
    const watcher = createNativeWatcher({ dirs: ['/roots/one'] });
    const seen = [];
    watcher.on('error', (error) => seen.push(error));
    await new Promise((resolve) => setImmediate(resolve));
    assert.equal(seen.length, 1);
    assert.equal(seen[0].code, 'ERR_FEATURE_UNAVAILABLE_ON_PLATFORM', 'the code is what selects the polling fallback');
  } finally {
    fs.watch = original;
  }
});

test('ready is not reported when a root failed to attach', async () => {
  const original = fs.watch;
  fs.watch = () => {
    throw Object.assign(new Error('nope'), { code: 'ENOSPC' });
  };
  try {
    const watcher = createNativeWatcher({ dirs: ['/roots/one'] });
    const order = [];
    watcher.on('error', () => order.push('error'));
    watcher.on('ready', () => order.push('ready'));
    await new Promise((resolve) => setImmediate(resolve));
    assert.deepEqual(order, ['error', 'ready'], 'errors first, so a host can suppress readiness');
  } finally {
    fs.watch = original;
  }
});

test('ready arrives asynchronously so a listener attached after construction still sees it', () => {
  return withStubbedWatch(async () => {
    // Both hosts attach their 'ready' handler after the factory returns; emitting
    // it synchronously would be missed and the owner would never record readiness.
    const watcher = createNativeWatcher({ dirs: ['/roots/one'] });
    await new Promise((resolve, reject) => {
      watcher.once('ready', resolve);
      watcher.once('error', reject);
    });
  });
});

test('close stops delivery, is idempotent and does not throw', async () => {
  await withStubbedWatch(async (handles) => {
    const watcher = createNativeWatcher({ dirs: ['/roots/one', '/roots/two'] });
    const events = collect(watcher);
    await watcher.close();
    await watcher.close();
    assert.deepEqual(handles.map((handle) => handle.closed), [1, 1]);
    for (const handle of handles) handle.emit('change', 'change', 'late.jsonl');
    assert.equal(events.length, 0, 'events after close must not reach the owner');
  });
});
