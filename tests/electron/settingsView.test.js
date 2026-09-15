'use strict';

const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const test = require('node:test');

const rendererDir = path.join(__dirname, '..', '..', 'src', 'electron', 'renderer');
const html = fs.readFileSync(path.join(rendererDir, 'index.html'), 'utf8');
const app = fs.readFileSync(path.join(rendererDir, 'app.js'), 'utf8');
const css = fs.readFileSync(path.join(rendererDir, 'styles.css'), 'utf8');

test('settings opens as a distinct page with a Back to Home button in the footer', () => {
  assert.match(html, /<section id="settingsPanel" class="settings-panel hidden">/);
  // The back affordance lives in the footer's bottom-left slot, replacing the
  // view menu there while Settings is open.
  const footer = html.match(/<footer class="footer">[\s\S]*?<\/footer>/)?.[0] || '';
  assert.match(footer, /<button id="settingsBackButton" type="button" class="back-home-button settings-back-button"/);
  assert.match(footer, /id="settingsBackButton"[\s\S]*?<div id="viewSwitcher"/);
  assert.doesNotMatch(html, /settings-back-row/);
  assert.match(app, /els\.settingsBackButton\?\.addEventListener\('click'/);
});

test('the settings Back to Home button closes Settings and returns home', () => {
  const handler = app.match(/els\.settingsBackButton\?\.addEventListener\('click', \(event\) => \{[\s\S]*?\n\}\);/)?.[0] || '';
  assert.ok(handler, 'settings back handler exists');
  assert.match(handler, /els\.settingsPanel\?\.classList\.add\('hidden'\)/);
  assert.match(handler, /els\.shell\.classList\.remove\('settings-open'\)/);
  assert.match(handler, /renderBreakdownChange\('home'\)/);
});

test('the shared Back to Home button also returns home from an open Settings page', () => {
  const handler = app.match(/els\.backHomeButton\?\.addEventListener\('click', \(event\) => \{[\s\S]*?\n\}\);/)?.[0] || '';
  assert.ok(handler, 'back home handler exists');
  assert.match(handler, /if \(isSettingsPanelOpen\(\)\) \{[\s\S]*?els\.settingsPanel\?\.classList\.add\('hidden'\)[\s\S]*?renderBreakdownChange\('home'\)/);
});

test('the settings back row carries the localized Back to Home label', () => {
  assert.match(
    html,
    /id="settingsBackButton"[\s\S]*?data-i18n-title="views\.backHome"[\s\S]*?data-i18n-aria-label="views\.backHome"/
  );
  const i18n = fs.readFileSync(path.join(rendererDir, 'i18n.js'), 'utf8');
  assert.match(i18n, /'views\.backHome': 'Back to Home'/);
});

test('settings is a whole-page view that hides every main surface', () => {
  // When settings is open, only the settings panel fills the window — no total
  // panel, view back row, breakdown, or per-view panels remain visible.
  assert.match(css, /\.shell\.settings-open \.total-panel,/);
  assert.match(css, /\.shell\.settings-open \.home-panel,/);
  assert.match(css, /\.shell\.settings-open \.trends-panel,/);
  assert.match(css, /\.shell\.settings-open \.fixed-period-message \{\n\s*display: none;/);
  assert.match(css, /\.shell\.settings-open \.settings-panel \{\n\s*flex: 1 1 auto;\n\s*max-height: none;\n\}/);
});

test('the footer swaps its view menu for Back to Home on the settings page', () => {
  assert.match(css, /\.settings-back-button \{\n\s*display: none;/);
  assert.match(css, /\.shell\.settings-open \.settings-back-button \{ display: inline-flex; \}/);
  assert.match(css, /\.shell\.settings-open #viewSwitcher \{ display: none; \}/);
});

test('opening Settings expands the General section by default', () => {
  const toggle = app.match(/els\.settingsButton\.addEventListener\('click', \(event\) => \{[\s\S]*?\n\}\);/)?.[0] || '';
  assert.ok(toggle, 'settings button handler exists');
  assert.match(toggle, /setSettingsSectionExpanded\('general', true\);/);
  assert.match(app, /function openSettingsPanel\(\{ expandGeneral = false \} = \{\}\)[\s\S]*?if \(expandGeneral\) setSettingsSectionExpanded\('general', true\);/);
  assert.match(app, /window\.tokenMonitor\.onOpenSettings\?\.\(\(\) => openSettingsPanel\(\{ expandGeneral: true \}\)\)/);
});