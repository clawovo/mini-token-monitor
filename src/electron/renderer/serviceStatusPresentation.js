'use strict';

(function exposeServiceStatusPresentation(root, factory) {
  const api = factory();
  if (typeof module === 'object' && module.exports) module.exports = api;
  if (root) root.TokenMonitorServiceStatusPresentation = api;
})(typeof window !== 'undefined' ? window : null, function createServiceStatusPresentationApi() {
  // Split the affected component names into a short visible slice plus an
  // overflow count, so the meta line can show e.g. "Claude Code, API +2" while
  // the full list stays available (and the data is real text for a11y).
  function affectedComponentNames(componentIssues, limit = 2) {
    const names = (Array.isArray(componentIssues) ? componentIssues : [])
      .map((issue) => String(issue?.name || '').trim())
      .filter(Boolean);
    const max = Number.isFinite(limit) && limit > 0 ? Math.floor(limit) : names.length;
    return {
      all: names,
      visible: names.slice(0, max),
      overflow: Math.max(0, names.length - max)
    };
  }

  // The card's second line leads with the active incident's name when there is
  // one — it's far more useful (and what the official page headlines) than the
  // generic "Partially Degraded Service", which the status pill already conveys.
  // Falls back to the overall status description when no incident is active.
  function statusHeadline(provider) {
    const incident = String(provider?.incidentTitle || '').trim();
    if (incident) return incident;
    return String(provider?.description || '').trim();
  }

  function agoBucket(ms) {
    const total = Math.max(0, Math.floor((Number(ms) || 0) / 1000));
    if (total < 60) return { unit: 'seconds', value: total };
    if (total < 3600) return { unit: 'minutes', value: Math.floor(total / 60) };
    return { unit: 'hours', value: Math.floor(total / 3600) };
  }

  return { affectedComponentNames, agoBucket, statusHeadline };
});
