'use strict';

const os = require('node:os');
const { clientsCsvForSetting } = require('../shared/clientTracking');
const { projectClientHealth, projectHubDevices } = require('../shared/diagnosticReport');
const { resolveLocale } = require('./renderer/i18n');

function diagnosticAgeSeconds(value, nowMs = Date.now()) {
  const timestamp = Date.parse(String(value || ''));
  if (!Number.isFinite(timestamp)) return null;
  return Math.max(0, Math.round((nowMs - timestamp) / 1000));
}

function recordFreshnessMs(record) {
  return [record?.receivedAt, record?.updatedAt]
    .map((value) => Date.parse(String(value || '')))
    .filter(Number.isFinite)
    .reduce((latest, timestamp) => Math.max(latest, timestamp), null);
}

function selectLocalDeviceRecord(options = {}) {
  const deviceId = String(options.deviceId || '').trim();
  if (!deviceId) return null;
  const rawHubRecord = (Array.isArray(options.latestHubStats?.devices) ? options.latestHubStats.devices : [])
    .find((device) => device?.deviceId === deviceId) || null;
  const displayHubRecord = (Array.isArray(options.latestStats?.devices) ? options.latestStats.devices : [])
    .find((device) => device?.deviceId === deviceId) || null;
  if (options.externalAgentActive === true) return rawHubRecord;

  const candidates = [options.lastCollectedDevice, options.localDevice, displayHubRecord, rawHubRecord]
    .filter((device) => device?.deviceId === deviceId);
  let selected = null;
  let selectedAt = null;
  for (const candidate of candidates) {
    const candidateAt = recordFreshnessMs(candidate);
    if (!selected || (candidateAt !== null && (selectedAt === null || candidateAt > selectedAt))) {
      selected = candidate;
      selectedAt = candidateAt;
    }
  }
  return selected;
}

function diagnosticOsInfo(device, platform = process.platform, osRelease = os.release()) {
  const name = String(device?.osName || '').trim() || (
    platform === 'darwin' ? 'macOS' : platform === 'win32' ? 'Windows' : platform
  );
  const version = String(device?.osVersion || '').trim() || osRelease;
  return { name, version };
}

function diagnosticTokscaleInfo(getTokscaleStatus) {
  try {
    const status = getTokscaleStatus?.() || {};
    return {
      version: status.current?.version || status.bundled?.version || 'unknown',
      source: status.current?.source || (status.bundled ? 'bundled' : 'unknown')
    };
  } catch (_) {
    return { version: 'unknown', source: 'unknown' };
  }
}

function createDiagnosticSnapshotBuilder(options = {}) {
  const getSettings = options.getSettings || (() => ({}));
  const getMode = options.getMode || (() => 'idle');
  const getExternalAgentActive = options.getExternalAgentActive || (() => false);
  const getDeviceRuntime = options.getDeviceRuntime || (() => null);
  const getLocalRecord = options.getLocalRecord || (() => null);
  const getTokscaleStatus = options.getTokscaleStatus || (() => null);
  const getConfiguration = options.getConfiguration || (() => ({}));
  const getJournalSnapshot = options.getJournalSnapshot || (() => ({}));
  const getArchiveState = options.getArchiveState || (() => ({}));
  const getAppVersion = options.getAppVersion || (() => 'unknown');
  const getDefaultDeviceId = options.getDefaultDeviceId || (() => 'unknown');
  const canRefreshUsageRuntime = options.canRefreshUsageRuntime || (() => false);
  const getAppState = options.getAppState || (() => ({ packaged: false, preferredLanguages: ['en'], locale: 'en' }));
  const getProcessVersions = options.getProcessVersions || (() => process.versions);
  const getPlatform = options.getPlatform || (() => process.platform);
  const getArchitecture = options.getArchitecture || (() => process.arch);
  const getUptimeSeconds = options.getUptimeSeconds || (() => Math.round(process.uptime()));
  const getOsRelease = options.getOsRelease || (() => os.release());
  const getNowMs = options.getNowMs || (() => Date.now());

  function diagnosticRuntimeInfo() {
    const externalAgentActive = Boolean(getExternalAgentActive());
    const runtimeHandle = getDeviceRuntime();
    const runtimeDiagnostics = runtimeHandle?.getDiagnostics?.() || {};
    const usageDiagnostics = runtimeDiagnostics.usage || null;
    const limitsDiagnostics = runtimeDiagnostics.limits || null;
    const usageOwner = externalAgentActive
      ? 'external-agent'
      : usageDiagnostics && canRefreshUsageRuntime(getMode(), () => false)
        ? 'electron-widget'
        : 'none';
    const limitsOwner = limitsDiagnostics ? 'electron-widget' : 'none';
    const usageCompleteness = externalAgentActive
      ? 'partial-external-owner'
      : usageDiagnostics
        ? 'full'
        : 'partial-no-runtime';
    const limitsCompleteness = limitsDiagnostics ? 'full' : 'partial-no-runtime';
    // No embedded hub and no remote stream: the widget is local-only.
    const hubRuntime = {
      hubKind: 'none',
      hubSoftwareVersion: 'not-applicable',
      hubSoftwareVersionSource: 'not-applicable',
      hubTarget: 'none',
      hubTransport: 'none',
      streamState: 'not-applicable',
      hubStatsCacheAgeSeconds: 'not-applicable'
    };
    return {
      externalAgentActive,
      runtimeDiagnostics,
      usageDiagnostics,
      limitsDiagnostics,
      usageOwner,
      limitsOwner,
      usageCompleteness,
      limitsCompleteness,
      hubStatsCacheMatchesMode: true,
      hubRuntime,
      topology: {
        hubMode: 'local',
        hubTarget: 'none',
        hubTransport: 'none',
        externalAgentAlive: externalAgentActive,
        usageOwner,
        limitsOwner,
        streamState: 'not-applicable',
        lastStreamFailureCode: 'none',
        embeddedHubRunning: false,
        hubStatsCacheAgeSeconds: 'not-applicable'
      }
    };
  }

  function build(generatedAt = new Date()) {
    const settings = getSettings() || {};
    const nowMs = getNowMs();
    const runtime = diagnosticRuntimeInfo();
    const localRecord = getLocalRecord();
    const platform = getPlatform();
    const osInfo = diagnosticOsInfo(localRecord, platform, getOsRelease());
    const trackedClients = localRecord?.trackedClients
      || clientsCsvForSetting(settings.clients).split(',').filter(Boolean);
    const clientDevice = localRecord || { trackedClients };
    const clients = projectClientHealth(localRecord?.clientHealth || null, clientDevice);
    const usageObservationAt = runtime.usageOwner === 'external-agent'
      ? localRecord?.receivedAt || localRecord?.updatedAt || clients.observedAt
      : runtime.usageDiagnostics?.lastTickSuccessAt || clients.observedAt;
    const syncIntervalMs = Number(localRecord?.syncUploadIntervalMs);
    const usageStaleAfterMs = Math.max(10 * 60 * 1000, Number.isFinite(syncIntervalMs) ? syncIntervalMs * 2 : 0);
    const localRecordAgeSeconds = diagnosticAgeSeconds(localRecord?.receivedAt || localRecord?.updatedAt, nowMs);
    const hubDevices = projectHubDevices(null, {
      summaryAvailable: false,
      summarySource: 'not-applicable',
      localDeviceId: settings.deviceId || getDefaultDeviceId(),
      nowMs
    });
    const tokScale = diagnosticTokscaleInfo(getTokscaleStatus);
    const archive = getArchiveState() || {};
    const reportJournal = getJournalSnapshot() || {};
    const reportCompleteness = runtime.usageCompleteness === 'full' && runtime.limitsCompleteness === 'full'
      ? 'full'
      : runtime.usageCompleteness === 'partial-external-owner'
        ? 'partial-external-owner'
        : 'partial-no-runtime';
    const versions = getProcessVersions() || {};
    const appState = getAppState() || {};
    const preferredLanguages = Array.isArray(appState.preferredLanguages) && appState.preferredLanguages.length > 0
      ? appState.preferredLanguages
      : [appState.locale || 'en'];
    return {
      report: {
        generatedAt: generatedAt instanceof Date ? generatedAt.toISOString() : new Date(generatedAt).toISOString(),
        timezone: Intl.DateTimeFormat().resolvedOptions().timeZone || 'unknown',
        reportCompleteness,
        usageCompleteness: runtime.usageCompleteness,
        limitsCompleteness: runtime.limitsCompleteness,
        journalScope: 'electron-widget',
        journalStartedAt: reportJournal.startedAt,
        journalOmittedCount: 0
      },
      environment: {
        appVersion: getAppVersion(),
        electronVersion: versions.electron,
        nodeVersion: versions.node,
        chromiumVersion: versions.chrome,
        tokscaleVersion: tokScale.version,
        tokscaleSource: tokScale.source,
        packaged: appState.packaged === true,
        platform,
        osName: osInfo.name,
        osVersion: osInfo.version,
        architecture: getArchitecture(),
        languageSetting: settings.language || 'auto',
        resolvedLocale: resolveLocale(settings.language || 'auto', preferredLanguages),
        appUptimeSeconds: getUptimeSeconds()
      },
      configuration: getConfiguration(),
      topology: runtime.topology,
      hub: {
        runtime: runtime.hubRuntime,
        devices: hubDevices
      },
      usage: {
        usageOwner: runtime.usageOwner,
        localUsageRuntimePresent: Boolean(getDeviceRuntime() && runtime.usageDiagnostics),
        usageRefreshAllowed: runtime.usageOwner === 'electron-widget',
        usageCompleteness: runtime.usageCompleteness,
        usageJournalAvailable: runtime.usageOwner === 'electron-widget' && Boolean(runtime.usageDiagnostics),
        localRecordAgeSeconds,
        usageObservationAgeSeconds: diagnosticAgeSeconds(usageObservationAt, nowMs),
        usageStaleAfterSeconds: Math.round(usageStaleAfterMs / 1000),
        limitsOwner: runtime.limitsOwner,
        limitsCompleteness: runtime.limitsCompleteness
      },
      collector: {
        ...(runtime.usageDiagnostics || { state: 'unavailable' }),
        detailsAvailable: !runtime.externalAgentActive && Boolean(runtime.usageDiagnostics)
      },
      clients,
      limits: runtime.limitsDiagnostics || { enabled: false, active: 0, maxConcurrency: null, queued: 0, providers: [] },
      journal: reportJournal,
      workload: {
        sessionArchiveEnabled: archive.enabled !== false,
        sessionArchivePresent: archive.loaded === true,
        sessionArchiveSessionCount: archive.sessionCount ?? null,
        sessionArchiveCountSource: archive.countSource || (archive.enabled === false ? 'not-enabled' : 'not-loaded'),
        lastSessionArchiveUpdateDurationMs: archive.lastUpdate?.durationMs ?? null,
        lastSessionArchiveUpdateAt: archive.lastUpdate?.at ?? null,
        lastSessionArchiveFailureCode: archive.lastUpdate?.failureCode ?? null,
        lastCollectorTickDurationMs: runtime.usageDiagnostics?.lastTickDurationMs ?? null,
        lastCollectorTickScope: runtime.usageDiagnostics?.lastTickScope || null,
        lastHistoryScanDurationMs: runtime.usageDiagnostics?.lastHistoryScanDurationMs ?? null
      },
      storage: {
        settingsReadable: Boolean(settings),
        settingsWritable: null,
        archiveReadable: null,
        archiveWritable: null
      }
    };
  }

  return { build, diagnosticRuntimeInfo };
}

module.exports = {
  createDiagnosticSnapshotBuilder,
  diagnosticAgeSeconds,
  diagnosticOsInfo,
  diagnosticTokscaleInfo,
  selectLocalDeviceRecord
};
