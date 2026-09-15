'use strict';

const assert = require('node:assert/strict');
const test = require('node:test');

const {
  createDiagnosticSnapshotBuilder,
  selectLocalDeviceRecord
} = require('../../src/electron/diagnosticSnapshot');

function createBuilder(overrides = {}) {
  const nowMs = Date.parse('2026-08-06T10:00:00.000Z');
  const localRecord = {
    deviceId: 'local-device',
    agentVersion: '0.41.0',
    agentRuntime: 'electron-widget',
    platform: 'darwin-arm64',
    osName: 'macOS',
    osVersion: '15.1.1',
    receivedAt: new Date(nowMs - 8000).toISOString(),
    updatedAt: new Date(nowMs - 8000).toISOString(),
    syncUploadIntervalMs: 0,
    trackedClients: ['codex'],
    clientHealth: {
      observedAt: new Date(nowMs - 5000).toISOString(),
      clients: {
        codex: {
          overall: 'healthy',
          source: { state: 'detected', detectedCount: 1, checkedCount: 1, checks: [] },
          collection: {
            state: 'ok',
            lastAttemptAt: new Date(nowMs - 6000).toISOString(),
            lastSuccessAt: new Date(nowMs - 5000).toISOString()
          },
          data: { lastActivityDay: '2026-08-06' },
          diagnostics: []
        }
      }
    },
    today: { clients: { codex: 12 } },
    month: { clients: { codex: 34 } },
    allTime: { clients: { codex: 56 } }
  };
  const cachedHubStats = {
    staleAfterMs: 600000,
    devices: [
      localRecord,
      {
        deviceId: 'remote-device',
        agentVersion: '0.40.0',
        agentRuntime: 'headless-agent',
        platform: 'win32-x64',
        osName: 'Windows',
        osVersion: '11.0.26100',
        receivedAt: new Date(nowMs - 42000).toISOString(),
        stale: false
      }
    ]
  };
  let hubGetStatsCalls = 0;
  const builder = createDiagnosticSnapshotBuilder({
    getSettings: () => ({ hubMode: 'host', deviceId: 'local-device', clients: 'codex', language: 'zh-TW' }),
    getMode: () => 'host',
    getEffectiveHubConfig: () => ({ url: 'http://127.0.0.1:17321' }),
    getExternalAgentActive: () => false,
    getDeviceRuntime: () => ({
      getDiagnostics: () => ({
        usage: {
          state: 'idle',
          intervalMs: 300000,
          lastTickSuccessAt: new Date(nowMs - 5000).toISOString(),
          lastTickDurationMs: 120
        },
        limits: { enabled: true, providers: [] }
      })
    }),
    getEmbeddedHub: () => ({ hub: { getStats: () => { hubGetStatsCalls += 1; throw new Error('must use cache'); } } }),
    getStreamState: () => ({ connected: true, failure: null }),
    getLatestHubStats: () => cachedHubStats,
    getLatestHubStatsReceivedAt: () => new Date(nowMs - 4000).toISOString(),
    getLatestHubStatsSource: () => 'host',
    getLatestHubStatsGeneration: () => 7,
    getLatestHubStatsIdentity: () => 'host|http://127.0.0.1:17321',
    getHubModeGeneration: () => 7,
    getCurrentHubStatsIdentity: () => 'host|http://127.0.0.1:17321',
    getLocalRecord: () => localRecord,
    getTokscaleStatus: () => ({ current: { version: '4.10.0', source: 'bundled' } }),
    getConfiguration: () => ({ configurationSource: 'effective-normalized', allTimeSince: '2024-01-01' }),
    getJournalSnapshot: () => ({ startedAt: '2026-08-06T09:00:00.000Z', events: [] }),
    getArchiveState: () => ({ enabled: true, loaded: false, countSource: 'not-loaded' }),
    getAppVersion: () => '0.41.0',
    getDefaultDeviceId: () => 'local-device',
    canRefreshUsageRuntime: () => true,
    getAppState: () => ({ packaged: true, preferredLanguages: ['zh-TW'], locale: 'zh-TW' }),
    getProcessVersions: () => ({ electron: '43.0.0', node: '22.13.0', chrome: '134.0.0' }),
    getPlatform: () => 'darwin',
    getArchitecture: () => 'arm64',
    getUptimeSeconds: () => 600,
    getOsRelease: () => '25.1.0',
    getNowMs: () => nowMs,
    ...overrides
  });
  return { builder, getHubGetStatsCalls: () => hubGetStatsCalls };
}

test('external-agent freshness uses the received local record, not the widget tick', () => {
  const nowMs = Date.parse('2026-08-06T10:00:00.000Z');
  const snapshot = createBuilder({
    getExternalAgentActive: () => true,
    getDeviceRuntime: () => ({
      getDiagnostics: () => ({
        usage: { lastTickSuccessAt: new Date(nowMs - 1000).toISOString() },
        limits: { enabled: true, providers: [] }
      })
    }),
    getLocalRecord: () => ({
      deviceId: 'local-device',
      receivedAt: new Date(nowMs - 3600 * 1000).toISOString(),
      updatedAt: new Date(nowMs - 3600 * 1000).toISOString(),
      trackedClients: ['codex'],
      clientHealth: { observedAt: new Date(nowMs - 3600 * 1000).toISOString(), clients: {} }
    })
  }).builder.build(new Date(nowMs));

  assert.equal(snapshot.usage.usageOwner, 'external-agent');
  assert.equal(snapshot.usage.usageObservationAgeSeconds, 3600);
});

test('external-agent record selection prefers the raw Hub record over a composed widget record', () => {
  const widgetRecord = {
    deviceId: 'local-device',
    agentRuntime: 'electron-widget',
    receivedAt: '2026-08-06T08:00:00.000Z'
  };
  const agentRecord = {
    deviceId: 'local-device',
    agentRuntime: 'headless-agent',
    receivedAt: '2026-08-06T09:59:00.000Z'
  };

  assert.equal(selectLocalDeviceRecord({
    deviceId: 'local-device',
    externalAgentActive: true,
    lastCollectedDevice: widgetRecord,
    latestHubStats: { devices: [agentRecord] },
    latestStats: { devices: [widgetRecord] }
  }), agentRecord);
});

