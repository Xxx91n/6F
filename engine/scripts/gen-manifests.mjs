import { readFileSync, writeFileSync, mkdirSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';

const root = join(dirname(fileURLToPath(import.meta.url)), '..');
const meta = JSON.parse(readFileSync(join(root, 'manifest.meta.json'), 'utf8'));

function write(rel, obj) {
  const full = join(root, rel);
  mkdirSync(dirname(full), { recursive: true });
  writeFileSync(full, JSON.stringify(obj, null, 2), { encoding: 'utf8' });
}

const standardPlugin = {
  schemaVersion: '1.0.0',
  name: meta.name,
  version: meta.version,
  description: meta.description,
  skills: meta.skills,
  mcp: 'mcp.json',
  extensions: meta.extensions
};
const claudePlugin = {
  name: meta.claudePlugin.name,
  version: meta.claudePlugin.version,
  description: meta.description,
  skills: meta.skills,
  mcp: 'mcp.json'
};
const mcpJson = {
  mcpServers: {
    'macro-audit-kernel': {
      transport: meta.mcp.transport,
      readOnly: meta.mcp.readOnly,
      command: 'macro-audit',
      args: ['mcp']
    }
  }
};

write('plugin.json', standardPlugin);
write(join('.claude-plugin', 'plugin.json'), claudePlugin);
write('mcp.json', mcpJson);

const p1 = JSON.parse(readFileSync(join(root, 'plugin.json'), 'utf8'));
const p2 = JSON.parse(readFileSync(join(root, '.claude-plugin', 'plugin.json'), 'utf8'));
const p3 = JSON.parse(readFileSync(join(root, 'mcp.json'), 'utf8'));
const checks = [
  ['plugin.json name==meta', p1.name === meta.name],
  ['claude plugin name==meta.claudePlugin.name', p2.name === meta.claudePlugin.name],
  ['versions aligned', p1.version === p2.version && p1.version === meta.version],
  ['skills aligned', JSON.stringify(p1.skills) === JSON.stringify(p2.skills)],
  ['mcp readOnly', p3.mcpServers['macro-audit-kernel'].readOnly === true]
];
let ok = true;
for (const c of checks) {
  console.log((c[1] ? 'PASS ' : 'FAIL ') + c[0]);
  if (!c[1]) ok = false;
}
console.log(ok ? 'GEN-OK' : 'GEN-FAIL');
process.exit(ok ? 0 : 1);