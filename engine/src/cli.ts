#!/usr/bin/env node
import { runSelftest } from './selftest.js';
import { loadManifestMeta } from './manifest.js';

const cmd = process.argv[2] ?? '--help';

if (cmd === '--version' || cmd === '-v') {
  const m = loadManifestMeta();
  console.log(JSON.stringify({ name: m.name, version: m.version, shells: m.shells }));
} else if (cmd === 'selftest') {
  const r = runSelftest();
  console.log(JSON.stringify(r));
  process.exit(r.ok ? 0 : 1);
} else if (cmd === 'mcp') {
  const m = loadManifestMeta();
  console.log(JSON.stringify({ transport: m.mcp.transport, readOnly: m.mcp.readOnly, note: 'read-only query face (skeleton stub)' }));
} else {
  console.log('macro-audit kernel CLI (walking skeleton)');
  console.log('usage: macro-audit <--version|selftest|mcp|--help>');
}