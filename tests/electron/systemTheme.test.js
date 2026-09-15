'use strict';

const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const test = require('node:test');

const rendererDir = path.join(__dirname, '..', '..', 'src', 'electron', 'renderer');
const app = fs.readFileSync(path.join(rendererDir, 'app.js'), 'utf8');
const i18n = fs.readFileSync(path.join(rendererDir, 'i18n.js'), 'utf8');
const themePresets = fs.readFileSync(path.join(rendererDir, 'themePresets.js'), 'utf8');

test('the default interface theme is System, resolved from the OS appearance', () => {
  // Empty overrides == System, so the theme follows the OS until the user picks
  // an explicit preset or edits a colour.
  assert.match(app, /function themeFollowsSystem\(\) \{\s*return Object\.keys\(currentThemeOverrides\(\)\)\.length === 0;\s*\}/);
  assert.match(
    app,
    /function effectiveThemeOverrides\(\) \{\s*return themeFollowsSystem\(\)\s*\?\s*themePresetsApi\.systemThemeOverrides\(state\.systemDarkUi === true\)\s*:\s*currentThemeOverrides\(\);\s*\}/
  );
  assert.match(themePresets, /SYSTEM_THEME_ID = 'system'/);
  assert.match(themePresets, /SYSTEM_DARK_THEME_ID = 'obsidian'/);
  assert.match(themePresets, /SYSTEM_LIGHT_THEME_ID = 'porcelain'/);
});

test('picking System clears overrides; the other presets store their palette', () => {
  const body = app.match(/async function selectThemePreset\(presetId\) \{[\s\S]*?\n\}/)?.[0] || '';
  assert.ok(body, 'selectThemePreset exists');
  assert.match(body, /presetId === themePresetsApi\.SYSTEM_THEME_ID \? \{\} : themePresetsApi\.presetOverrides\(presetId\)/);
});

test('applying stored colours resolves the System palette first', () => {
  const body = app.match(/async function commitThemeColors\(overrides\) \{[\s\S]*?\n\}/)?.[0] || '';
  assert.ok(body, 'commitThemeColors exists');
  assert.match(body, /applyThemeColors\(effectiveThemeOverrides\(\)\)/);
  assert.match(app, /if \(settings && 'themeColors' in settings\) applyThemeColors\(effectiveThemeOverrides\(\)\);/);
});

test('an OS appearance flip re-resolves the System theme', () => {
  assert.match(
    app,
    /if \(state\.settings && themeFollowsSystem\(\)\) \{\s*applyThemeColors\(effectiveThemeOverrides\(\)\);\s*buildAppearanceColorControls\(\);\s*\}/
  );
});

test('every locale labels the system preset and no longer ships a default preset', () => {
  assert.equal((i18n.match(/'settings\.appearance\.preset\.system':/g) || []).length, 5);
  assert.doesNotMatch(i18n, /settings\.appearance\.preset\.default/);
});