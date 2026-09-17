#!/usr/bin/env node
import { runSelftest } from './selftest.js';
import { loadManifestMeta } from './manifest.js';
import { repoAdd } from './intake/intake.js';
import { runDemo, listScenarios } from './demo/demo.js';
import { projectFacts } from './fact/projection.js';
import { serveMcpStdio } from './mcp-server.js';

const cmd = process.argv[2] ?? '--help';

if (cmd === '--version' || cmd === '-v') {
  const m = loadManifestMeta();
  console.log(JSON.stringify({ name: m.name, version: m.version, shells: m.shells }));
} else if (cmd === 'selftest') {
  const r = runSelftest();
  console.log(JSON.stringify(r));
  process.exit(r.ok ? 0 : 1);
} else if (cmd === 'mcp') {
  // MCP 查询面（D-053④）：read-only facts 投影——宿主 agent 叙事面的唯一取数主路。
  // 面收窄：固定 SELECT 形不接裸 SQL；openReader READ_ONLY 实例；projection 列=FactEvent 十三列。
  // 裸 `mcp` = JSON-RPC 2.0 stdio 服务（NDJSON 行帧，A3 返工：与 mcp.json 注册面名实相符）；
  // `mcp facts` = 同投影的直连 CLI 形态（调试/守卫用，不经握手）。
  const sub = process.argv[3];
  if (sub === 'facts') {
    const args = process.argv.slice(4);
    const known = ['--db', '--scale', '--repo', '--subject', '--limit'];
    const opts: { [k: string]: string } = {};
    for (let i = 0; i < args.length; i++) {
      const a = args[i];
      if (known.indexOf(a) < 0) { console.error('MCP-FACTS-ARGS: unknown flag ' + a); process.exit(2); }
      const v = args[i + 1];
      if (v === undefined || v.indexOf('--') === 0) { console.error('MCP-FACTS-ARGS: missing value for ' + a); process.exit(2); }
      opts[a] = v;
      i++;
    }
    if (!opts['--db']) { console.error('usage: macro-audit mcp facts --db <path> [--scale S] [--repo owner/repo] [--subject ref] [--limit n]'); process.exit(2); }
    const limRaw = opts['--limit'];
    const lim = limRaw === undefined ? undefined : Number(limRaw);
    if (lim !== undefined && (!Number.isFinite(lim) || lim <= 0)) {
      console.error(JSON.stringify({ error: 'MCP-FACTS-ARGS', message: '--limit must be a positive number' }));
      process.exit(2);
    }
    projectFacts(opts['--db'], { scale: opts['--scale'], repo_ref: opts['--repo'], subject_ref: opts['--subject'], limit: lim })
      .then(function (rows) { for (const r of rows) { console.log(JSON.stringify(r)); } })
      .catch(function (e) { console.error(JSON.stringify({ error: 'MCP-FACTS-ERROR', message: String(e && (e as Error).message || e) })); process.exit(2); });
  } else if (sub === undefined || sub === '--db') {
    // `macro-audit mcp [--db <facts.duckdb>]`：--db=服务端寻址位（#55/D-059⑥，mcp.json args/env 配置面）。
    let serverDb: string | undefined;
    if (sub === '--db') {
      serverDb = process.argv[4];
      if (!serverDb || serverDb.indexOf('--') === 0) { console.error('usage: macro-audit mcp [--db <facts.duckdb>]'); process.exit(2); }
    }
    setMcpServerConfig({ db: serverDb });
    serveMcpStdio(process.stdin, process.stdout).catch(function (e) {
      console.error(JSON.stringify({ error: 'MCP-SERVE-ERROR', message: String(e && (e as Error).message || e) }));
      process.exit(2);
    });
  } else {
    console.error('usage: macro-audit mcp [facts --db <path> [--scale S] [--repo owner/repo] [--subject ref] [--limit n]]');
    process.exit(2);
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