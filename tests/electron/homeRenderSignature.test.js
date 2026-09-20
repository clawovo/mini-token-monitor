'use strict';

const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const test = require('node:test');

const rendererDir = path.join(__dirname, '..', '..', 'src', 'electron', 'renderer');

function read(name) {
  return fs.readFileSync(path.join(rendererDir, name), 'utf8');
}

function homeRenderSignatureBody(app) {
  return app.match(/function homeRenderSignature\(moduleIds, period\) \{[\s\S]*?\n\}/)?.[0] || '';
}

function renderHomeBody(app) {
  return app.match(/function renderHome\(options = \{\}\) \{[\s\S]*?\n\}/)?.[0] || '';
}

// Every input a Home module renders from has to be in the fingerprint, or a
// periodic refresh reuses a node holding a stale value. Each entry below is one
// such input; losing one is a user-visible bug, so the list is pinned.
test('Home render fingerprint covers every input the Home modules render from', () => {
  const body = homeRenderSignatureBody(read('app.js'));
  assert.ok(body, 'homeRenderSignature not found in app.js');

  const required = [
    // Which modules exist, in order — covers the module preference and the hidden set.
    ['module ids', /moduleIds/],
    // View state: switching period or breakdown must repaint even with identical data.
    ['period', /state\.period\b/],
    ['breakdown', /state\.breakdown\b/],
    ['detail sort', /state\.detailSort/],
    ['tool search', /state\.toolSearchQuery/],
    ['limit provider search', /state\.limitProviderSearchQuery/],
    ['open session', /state\.openSession\?\.id/],
    // Transient flags that change what a module draws.
    ['history loading flag', /state\.trendsActivating/],
    ['system dark ui', /state\.systemDarkUi/],
    ['period motion', /state\.periodMotionActive/],
    // A dashboard-history load replaces the heatmap and trend line.
    ['history revision', /state\.homeHistoryRevision/],
    ['history loaded signature', /state\.homeHistoryLoadedSignature/],
    // Data slices.
    ['stats updatedAt', /stats\.updatedAt/],
    ['selected period', /\bperiod\b/],
    ['history preview', /stats\.historyPreview/],
    ['devices', /stats\.devices/],
    ['limits', /stats\.limits/],
    // Formatting inputs.
    ['locale', /currentLocale\(\)/],
    ['currency', /currentCurrency\(\)/],
    ['currency rates', /settings\.currencyRatesEffective/],
    ['theme colours', /settings\.themeColors/],
    ['vendor colours', /settings\.vendorColors/],
    ['tool icons', /toolIconsEnabled\(settings\.showToolIcons\)/],
    ['compact units', /settings\.compactTokenUnits/],
    ['heatmap metric', /settings\.heatmapMetric/],
    ['model ranking metric', /settings\.modelRankingMetric/],
    ['active days window', /settings\.homeActiveDaysWindow/],
    ['home limit display', /settings\.showHomeLimitBars/],
    ['home limit provider names', /settings\.showHomeLimitProviderNames/],
    ['home limit provider order', /settings\.homeLimitProviderOrder/],
    ['hidden home limit providers', /settings\.hiddenHomeLimitProviders/],
    ['home limit account count', /settings\.homeLimitAccountCount/],
    ['history enabled', /settings\.historyEnabled/],
    ['home module order', /settings\.homeModuleOrder/],
    ['tracked clients', /settings\.clients/]
  ];

  for (const [label, pattern] of required) {
    assert.match(body, pattern, `homeRenderSignature is missing the ${label} input`);
  }
});

test('Only the scheduled stats refresh may reuse an unchanged Home panel', () => {
  const app = read('app.js');
  const body = renderHomeBody(app);
  assert.ok(body, 'renderHome not found in app.js');

  // The reuse has to be opt-in, and the opt-in has to be the periodic path only.
  assert.match(body, /options\.reuseUnchanged === true && signature === state\.homePanelSignature/);
  assert.match(app, /function render\(options = \{\}\) \{/);
  assert.match(app, /renderHome\(options\)/);
  assert.match(app, /render\(\{ reuseUnchangedHome: true \}\)/);
  assert.equal(
    (app.match(/reuseUnchangedHome: true/g) || []).length,
    1,
    'only renderStatsUpdate may opt into Home reuse'
  );

  // Interaction-driven renders call render() with no options, so they always repaint.
  const bare = app.match(/[^.\w]render\(\);/g) || [];
  assert.ok(bare.length > 0, 'expected interaction render() call sites');
});

test('Home reuse keeps the activity scroller alive when it does reuse', () => {
  const body = renderHomeBody(read('app.js'));
  // Reusing the node must skip the tooltip/observer teardown, and rebuilding must
  // still perform it — otherwise the ResizeObserver is dropped without a replacement.
  const guardIndex = body.indexOf('reuseUnchanged === true');
  const teardownIndex = body.indexOf('state.homeActivityResizeObserver?.disconnect()');
  assert.ok(guardIndex >= 0 && teardownIndex >= 0);
  assert.ok(guardIndex < teardownIndex, 'the reuse guard must precede the scroller teardown');
  assert.match(body, /hideHomeActivityTooltip\(\{ preserveHover: true \}\)/);
});

test('Home reuse resets its fingerprint when the panel has no modules', () => {
  const body = renderHomeBody(read('app.js'));
  const emptyIndex = body.indexOf("state.homePanelSignature = '';");
  const guardIndex = body.indexOf('reuseUnchanged === true');
  assert.ok(emptyIndex >= 0 && guardIndex >= 0);
  assert.ok(emptyIndex < guardIndex, 'the empty-module branch must clear the signature before the guard');
});

test('Dashboard history loads bump the revision the fingerprint watches', () => {
  const app = read('app.js');
  assert.match(app, /state\.homeHistory = fetchedHistory;\s*\n\s*state\.homeHistoryRevision \+= 1;/);
  assert.equal(
    (app.match(/state\.homeHistory = /g) || []).length,
    1,
    'every assignment to state.homeHistory must bump state.homeHistoryRevision'
  );
});
