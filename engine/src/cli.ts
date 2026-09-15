#!/usr/bin/env node
import { runSelftest } from './selftest.js';
import { loadManifestMeta } from './manifest.js';
import { repoAdd } from './intake/intake.js';

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
} else if (cmd === 'repo') {
  // Repo Intake（ADR-0009 / D-013）：repo add <path|owner/repo|url> [--cache <dir>]
  // clone 仅经 CLI/配置文件入口可达；kernel MCP 查询面保持只读。
  const sub = process.argv[3];
  if (sub !== 'add' || !process.argv[4]) {
    console.error('usage: macro-audit repo add <path|owner/repo|url> [--cache <dir>]');
    process.exit(2);
  }
  const input = process.argv[4];
  const ci = process.argv.indexOf('--cache');
  const cacheRoot = ci > 0 ? process.argv[ci + 1] : undefined;
  try {
    const r = repoAdd(input, { cacheRoot: cacheRoot });
    console.log(JSON.stringify(r));
  } catch (e) {
    const err = e as { code?: string; message?: string };
    console.error(JSON.stringify({ error: err.code || 'INTAKE-ERROR', message: err.message || String(e) }));
    process.exit(2);
  }
} else {
  console.log('macro-audit kernel CLI (walking skeleton)');
  console.log('usage: macro-audit <--version|selftest|mcp|repo add <path|owner/repo|url> [--cache <dir>]|--help>');
}