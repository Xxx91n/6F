// LOOP F4：MCP miss cli_guidance 逐字可跑验证（repo_path 代入 → 实跑无 PATH-NOT-FOUND）
const { spawnSync } = require('child_process');
const { mkdtempSync, writeFileSync, readFileSync } = require('fs');
const { tmpdir } = require('os');
const { join } = require('path');

const ENG = 'D:/Aworker/6F/engine';
const REPO = 'D:/Aworker/6F';
const DB = join(mkdtempSync(join(tmpdir(), 'loop-mcp-')), 'facts.duckdb');

// 先用 CLI 建库（audit . 迷你版太贵——直接 audit file 一张卡入库）
let r = spawnSync('node', [ENG + '/dist/cli.js', 'audit', 'file', REPO, 'engine/src/cli.ts', '--db', DB], { encoding: 'utf8', timeout: 120000 });
console.log('seed audit file: exit=' + r.status + ' ' + (r.stdout || '').slice(0, 90).replace(/\n/g, ' '));
if (r.status !== 0) { console.log('STDERR ' + (r.stderr || '').slice(0, 300)); process.exit(1); }

// MCP stdio：file_card miss（不存在的 subject）+ repo_path → 看 cli_guidance
const req = [
  { jsonrpc: '2.0', id: 0, method: 'initialize', params: { protocolVersion: '2024-11-05', capabilities: {}, clientInfo: { name: 'loop', version: '0' } } },
  { jsonrpc: '2.0', method: 'notifications/initialized' },
  { jsonrpc: '2.0', id: 1, method: 'tools/call', params: { name: 'file_card', arguments: { repo: '6F', path: 'engine/src/never-collected-loop.ts', repo_path: REPO, db: DB } } }
];
const input = req.map(m => JSON.stringify(m)).join('\n') + '\n';
r = spawnSync('node', [ENG + '/dist/cli.js', 'mcp', '--db', DB], { input, encoding: 'utf8', timeout: 60000 });
const lines = (r.stdout || '').split('\n').filter(Boolean);
const resp = lines.map(l => { try { return JSON.parse(l); } catch { return null; } }).find(m => m && m.id === 1);
const txt = resp && resp.result && resp.result.content && resp.result.content[0] && resp.result.content[0].text;
const card = txt ? JSON.parse(txt) : null;
console.log('F4 miss state=' + (card && card.miss && card.miss.state) + ' isError=' + (resp && resp.result && resp.result.isError));
const g = card && card.miss && card.miss.cli_guidance;
console.log('F4 guidance=' + g);
// 逐字执行指引（macro-audit → node dist/cli.js）
const cmd = String(g || '').replace(/^macro-audit /, '');
const args = cmd.match(/"[^"]*"|\S+/g).map(s => s.replace(/^"|"$/g, ''));
r = spawnSync('node', [ENG + '/dist/cli.js', ...args], { encoding: 'utf8', timeout: 120000 });
const out = (r.stdout || '') + (r.stderr || '');
console.log('F4 exec exit=' + r.status + ' PATH-NOT-FOUND=' + /PATH-NOT-FOUND/.test(out));
console.log('F4 exec out head: ' + out.slice(0, 160).replace(/\n/g, ' | '));
