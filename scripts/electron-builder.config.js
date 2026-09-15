'use strict';

const packageJson = require('../package.json');
const { createBuilderConfig } = require('./macos-packaging');
const { resolveElectronVersionOverride } = require('./electron-builder-version');

// electron-builder downloads the framework selected by this top-level option.
// The release workflow sets the override only for the Linux artifact, so macOS
// and Windows continue to use the package.json Electron version.
const electronVersion = resolveElectronVersionOverride();

// package.json asks for a signature so a release cannot ship an unsigned mac
// build by accident. That requirement is only honoured when a certificate was
// actually supplied — electron-builder reads CSC_LINK/CSC_NAME, and the release
// workflow sets them from repository secrets. Someone building a fork (or a
// local dmg) without a Developer ID gets an unsigned installer instead of a
// hard failure.
const macSigningConfigured = Boolean(
  process.env.CSC_LINK
  || process.env.CSC_NAME
  || process.env.TOKEN_MONITOR_MAC_SIGNING === '1'
);

const config = createBuilderConfig({
  baseConfig: {
    ...packageJson.build,
    ...(electronVersion ? { electronVersion } : {})
  }
});

if (config.mac) {
  config.mac = { ...config.mac, forceCodeSigning: macSigningConfigured };
}

module.exports = config;
