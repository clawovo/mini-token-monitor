'use strict';

// This app is menu-bar only: the tray is always present and the Dock icon is
// never shown on macOS. The toggle trio is fixed on and not user-configurable,
// so every call site that reads these collapses to the same always-on values
// regardless of what a hand-edited settings.json contains.
function normalizeTrayModeSettings(_settings = {}) {
  return { showTrayIcon: true, trayMode: true, hideAppIcon: true };
}

// Windows counterpart of the accessory policy above. Electron exposes
// skipTaskbar on Windows and macOS only, so Linux has no way to express this
// setting at all and the renderer does not offer it there.
function skipTaskbarForSettings(_settings = {}) {
  return true;
}

function shouldCreateTray(_settings = {}) {
  return true;
}

function trayToggleAction(_settings = {}) {
  return 'togglePopover';
}

// macOS has no per-window taskbar entry, so hiding the Dock icon is expressed
// as the accessory activation policy (app.dock.hide()) instead of
// setSkipTaskbar(). This app is always accessory.
function macActivationPolicyMode(_settings = {}, _state = {}) {
  return 'accessory';
}

function mainWindowCloseAction(_settings = {}, _state = {}) {
  return 'hidePopover';
}

module.exports = {
  macActivationPolicyMode,
  mainWindowCloseAction,
  normalizeTrayModeSettings,
  shouldCreateTray,
  skipTaskbarForSettings,
  trayToggleAction
};
