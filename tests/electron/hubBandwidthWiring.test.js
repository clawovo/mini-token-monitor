'use strict';

const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const test = require('node:test');

const root = path.resolve(__dirname, '../..');
const agentSource = fs.readFileSync(path.join(root, 'src/agent/agent.js'), 'utf8');

test('official producers request the optional minimal ingest response', () => {
  assert.match(agentSource, /\[HUB_RESPONSE_HEADER\]: HUB_RESPONSE_MINIMAL/);
});