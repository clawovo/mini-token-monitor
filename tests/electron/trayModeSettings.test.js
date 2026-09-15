'use strict';

const assert = require('node:assert/strict');
const test = require('node:test');

const {
  macActivationPolicyMode,
  mainWindowCloseAction,
  normalizeTrayModeSettings,
  shouldCreateTray,
  skipTaskbarForSettings,
  trayToggleAction
} = require('../../src/electron/trayModeSettings');

test('the app is always menu-bar only, regardless of stored settings', () => {
  assert.deepEqual(normalizeTrayModeSettings({}), {
    showTrayIcon: true,
    trayMode: true,
    hideAppIcon: true
  });
  assert.deepEqual(normalizeTrayModeSettings({ showTrayIcon: false, trayMode: false, hideAppIcon: false }), {
    showTrayIcon: true,
    trayMode: true,
    hideAppIcon: true
  });
});

test('the tray icon is always created', () => {
  assert.equal(shouldCreateTray({}), true);
  assert.equal(shouldCreateTray({ showTrayIcon: false }), true);
});

test('the tray icon always toggles the popover', () => {
  assert.equal(trayToggleAction({}), 'togglePopover');
});

test('uses accessory activation on macOS from the menu bar only', () => {
  assert.equal(macActivationPolicyMode({}, { mainWindowVisible: true }), 'accessory');
  assert.equal(macActivationPolicyMode({}, { mainWindowVisible: false }), 'accessory');
});

test('always skips the taskbar entry so no Dock/taskbar icon shows', () => {
  assert.equal(skipTaskbarForSettings({}), true);
});

test('maps main-window close to hiding the popover', () => {
  assert.equal(mainWindowCloseAction({}, { platform: 'darwin' }), 'hidePopover');
  assert.equal(mainWindowCloseAction({}, { platform: 'win32' }), 'hidePopover');
});