#!/usr/bin/env node
import { runSelftest } from './selftest.js';
import { loadManifestMeta } from './manifest.js';
import { repoAdd } from './intake/intake.js';
import { runDemo, listScenarios } from './demo/demo.js';
import { projectFacts } from './fact/projection.js';

const cmd = process.argv[2] ?? '--help';

if (cmd === '--version' || cmd === '-v') {
  const m = loadManifestMeta();
  console.log(JSON.stringify({ name: m.name, version: m.version, shells: m.shells }));
} else if (cmd === 'selftest') {
  const r = runSelftest();
  console.log(JSON.stringify(r));
  process.exit(r.ok ? 0 : 1);
} else if (cmd === 'mcp') {
  // MCP 查询面（D-053④）：read-only facts 投影 stub——宿主 agent 叙事面的唯一取数主路。
  // 面收窄：固定 SELECT 形不接裸 SQL；openReader READ_ONLY 实例；projection 列=FactEvent 十三列。
  const m = loadManifestMeta();
  const sub = process.argv[3];
  if (sub === 'facts') {
    const args = process.argv.slice(4);
    const opt = (n: string) => { const i = args.indexOf(n); return i >= 0 ? args[i + 1] : undefined; };
    const db = opt('--db');
    if (!db) { console.error('usage: macro-audit mcp facts --db <path> [--scale S] [--repo owner/repo] [--subject ref] [--limit n]'); process.exit(2); }
    const lim = opt('--limit');
    projectFacts(db, { scale: opt('--scale'), repo_ref: opt('--repo'), subject_ref: opt('--subject'), limit: lim ? Number(lim) : undefined })
      .then(function (rows) { for (const r of rows) { console.log(JSON.stringify(r)); } })
      .catch(function (e) { console.error(JSON.stringify({ error: 'MCP-FACTS-ERROR', message: String(e && (e as Error).message || e) })); process.exit(2); });
  } else {
    console.log(JSON.stringify({ transport: m.mcp.transport, readOnly: m.mcp.readOnly, ops: ['facts'], usage: 'macro-audit mcp facts --db <path> [--scale S] [--repo owner/repo] [--subject ref] [--limit n]', note: 'read-only facts projection stub (D-053④)' }));
  }
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
} else if (cmd === 'demo') {
  // 演示入口（D-038 / A-050）：demo [--scenario <name>] [--out <dir>] [--json] [--keep] [--list]
  // 临时目录生成确定性合成 git 仓 → Repo Intake 本地腿 → Macro-B 管线 → 报告（CASRAI 披露块）。
  // 跑完即弃不污染仓内状态；合成数据不冒充真实审计（披露块=硬契约）。
  const args = process.argv.slice(3);
  let scenario = 'happy-path';
  let outDir: string | undefined;
  let asJson = false;
  let keep = false;
  let list = false;
  for (let i = 0; i < args.length; i++) {
    if (args[i] === '--scenario') { scenario = args[++i]; }
    else if (args[i] === '--out') { outDir = args[++i]; }
    else if (args[i] === '--json') { asJson = true; }
    else if (args[i] === '--keep') { keep = true; }
    else if (args[i] === '--list') { list = true; }
  }
  if (list) {
    console.log(JSON.stringify(listScenarios()));
    process.exit(0);
  }
  try {
    const r = runDemo({ scenario: scenario, outDir: outDir, keepTemp: keep });
    if (outDir) {
      console.log(JSON.stringify({
        scenario: r.scenario, synthetic: r.synthetic, verdict: r.verdict,
        degraded_mode: r.degraded_mode, degraded_reason: r.degraded_reason,
        receipt_id: r.receipt_id, head_sha: r.head_sha, commit_count: r.commit_count,
        adr_count: r.adr_count, fact_count: r.fact_count, intake_kind: r.intake_kind,
        temp_discarded: r.temp_discarded, out_dir: r.out_dir, artifacts: r.artifacts
      }));
    } else {
      process.stdout.write(asJson ? r.sidecar_json : r.report_markdown);
    }
    process.exit(0);
  } catch (e) {
    const err = e as { code?: string; message?: string };
    console.error(JSON.stringify({ error: err.code || 'DEMO-ERROR', message: err.message || String(e) }));
    process.exit(2);
  }
} else {
  console.log('macro-audit kernel CLI (walking skeleton)');
  console.log('usage: macro-audit <--version|selftest|mcp|repo add <path|owner/repo|url> [--cache <dir>]|demo [--scenario <name>] [--out <dir>] [--json] [--keep] [--list]|--help>');
}