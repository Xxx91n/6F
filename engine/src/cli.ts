#!/usr/bin/env node
import { runSelftest } from './selftest.js';
import { runDoctor } from './doctor.js';
import { loadManifestMeta } from './manifest.js';
import { repoAdd } from './intake/intake.js';
import { runDemo, listScenarios } from './demo/demo.js';
import { runAudit, isAuditScaleError } from './audit/audit.js';
import { projectFacts } from './fact/projection.js';
import { serveMcpStdio, setMcpServerConfig, resolveFactsDb } from './mcp-server.js';

// #76 修复（CI run 35515346216）：process.exit() 立即终止进程，丢弃 stdout/stderr 管道中未冲刷的
// 排队写——Node ≤20 上大输出（audit --json ~39KB sidecar）竞态截断（Node 22+ 自带 exit 冲刷）。
// 所有「写完即退」出口一律走 write 回调门控：回调在 libuv flush 完成后触发，版本无关确定语义。
// ExitSignal 哨兵让 outExit/errExit 名副其实 never——写完调度后 throw，main() 边界吞哨兵，
// 排队写持活事件循环直到 flush 回调触发 exit；同步落盘语义与旧 process.exit 一致。
class ExitSignal extends Error { constructor(readonly code: number) { super('exit:' + code); } }
const outExit = (text: string, code: number): never => { process.stdout.write(text, function () { process.exit(code); }); throw new ExitSignal(code); };
const errExit = (text: string, code: number): never => { process.stderr.write(text, function () { process.exit(code); }); throw new ExitSignal(code); };

async function main(): Promise<void> {
  const cmd = process.argv[2] ?? '--help';

  if (cmd === '--version' || cmd === '-v') {
    const m = loadManifestMeta();
    console.log(JSON.stringify({ name: m.name, version: m.version, shells: m.shells }));
  } else if (cmd === 'selftest') {
    const r = runSelftest();
    outExit(JSON.stringify(r) + '\n', r.ok ? 0 : 1);
  } else if (cmd === 'doctor') {
    // 运行时 doctor 探测（#62/D-059③ runtime-doctor-trigger 兑现）：三腿 probe 结构化输出——
    // duckdb 可开库（经自愈链）／git 可用／上游连通性；selftest 对账本职不扩容，doctor 独立探测面。
    // exit 1 仅 overall=fail（degraded=有文档化回落路径 exit 0）；输出=结构化 JSON 非静默。
    // D-075③：doctor --fix=自愈唯一显式主路——duckdb 腿 DUCKDB-UNAVAILABLE 命中时显式补拉＋重开库验载。
    const dr = await runDoctor({ fix: process.argv.indexOf('--fix') >= 0 });
    outExit(JSON.stringify(dr) + '\n', dr.overall === 'fail' ? 1 : 0);
  } else if (cmd === 'mcp') {
    // MCP 查询面（D-053④）：read-only facts 投影——宿主 agent 叙事面的唯一取数主路。
    // 面收窄：固定 SELECT 形不接裸 SQL；openReader READ_ONLY 实例；projection 列=FactEvent 十三列。
    // 裸 mcp = JSON-RPC 2.0 stdio 服务（NDJSON 行帧，A3 返工：与 mcp.json 注册面名实相符）；
    // mcp facts = 同投影的直连 CLI 形态（调试/守卫用，不经握手）。
    const sub = process.argv[3];
    if (sub === 'facts') {
      const args = process.argv.slice(4);
      const known = ['--db', '--scale', '--repo', '--subject', '--limit'];
      const opts: { [k: string]: string } = {};
      for (let i = 0; i < args.length; i++) {
        const a = args[i];
        if (known.indexOf(a) < 0) { errExit('MCP-FACTS-ARGS: unknown flag ' + a + '\n', 2); }
        const v = args[i + 1];
        if (v === undefined || v.indexOf('--') === 0) { errExit('MCP-FACTS-ARGS: missing value for ' + a + '\n', 2); }
        opts[a] = v;
        i++;
      }
      // db 寻址与服务端同链（#55/D-059⑥）：--db argv → MACRO_AUDIT_FACTS_DB env → 仍缺则 usage exit 2
      opts['--db'] = resolveFactsDb(opts['--db']) || '';
      if (!opts['--db']) { errExit('usage: macro-audit mcp facts [--db <path>] [--scale S] [--repo owner/repo] [--subject ref] [--limit n]\n', 2); }
      const limRaw = opts['--limit'];
      const lim = limRaw === undefined ? undefined : Number(limRaw);
      if (lim !== undefined && (!Number.isFinite(lim) || lim <= 0)) {
        errExit(JSON.stringify({ error: 'MCP-FACTS-ARGS', message: '--limit must be a positive number' }) + '\n', 2);
      }
      try {
        const rows = await projectFacts(opts['--db'], { scale: opts['--scale'], repo_ref: opts['--repo'], subject_ref: opts['--subject'], limit: lim });
        for (const r of rows) { console.log(JSON.stringify(r)); }
      } catch (e) {
        if (e instanceof ExitSignal) throw e;
        errExit(JSON.stringify({ error: 'MCP-FACTS-ERROR', message: String(e && (e as Error).message || e) }) + '\n', 2);
      }
    } else if (sub === undefined || sub === '--db') {
      // macro-audit mcp [--db <facts.duckdb>]：--db=服务端寻址位（#55/D-059⑥，mcp.json args/env 配置面）。
      let serverDb: string | undefined;
      if (sub === '--db') {
        serverDb = process.argv[4];
        if (!serverDb || serverDb.indexOf('--') === 0) { errExit('usage: macro-audit mcp [--db <facts.duckdb>]\n', 2); }
      }
      setMcpServerConfig({ db: serverDb });
      try {
        await serveMcpStdio(process.stdin, process.stdout);
      } catch (e) {
        if (e instanceof ExitSignal) throw e;
        errExit(JSON.stringify({ error: 'MCP-SERVE-ERROR', message: String(e && (e as Error).message || e) }) + '\n', 2);
      }
    } else {
      errExit('usage: macro-audit mcp [facts [--db <path>] [--scale S] [--repo owner/repo] [--subject ref] [--limit n]]\n', 2);
    }
  } else if (cmd === 'repo') {
    // Repo Intake（ADR-0009 / D-013）：repo add <path|owner/repo|url> [--cache <dir>] [--refresh]
    // clone 仅经 CLI/配置文件入口可达；kernel MCP 查询面保持只读。
    // --refresh=显式刷新 opt-in（#55/D-059⑦）：仅 url 面缓存命中时 fetch --prune＋复位 origin/HEAD；绝不自动 pull。
    const sub = process.argv[3];
    if (sub !== 'add' || !process.argv[4]) {
      errExit('usage: macro-audit repo add <path|owner/repo|url> [--cache <dir>] [--refresh]\n', 2);
    }
    const input = process.argv[4];
    const ci = process.argv.indexOf('--cache');
    const cacheRoot = ci > 0 ? process.argv[ci + 1] : undefined;
    const refresh = process.argv.indexOf('--refresh') > 0;
    try {
      const r = repoAdd(input, { cacheRoot: cacheRoot, refresh: refresh });
      console.log(JSON.stringify(r));
    } catch (e) {
      if (e instanceof ExitSignal) throw e;
      const err = e as { code?: string; message?: string };
      errExit(JSON.stringify({ error: err.code || 'INTAKE-ERROR', message: err.message || String(e) }) + '\n', 2);
    }
  } else if (cmd === 'audit') {
    // audit 一等命令（#53/D-060）：audit <path|owner/repo|url> [--scale S] [--out <dir>] [--json] [--refresh]
    // 链=repoAdd 输入裁决 → audit/macro-b.ts 共享管线（与 demo 同消费）→ facts.duckdb＋骨架报告。
    // 省略 --out 时报告 md 走 stdout；--out 双写后 stdout 打印回执 JSON（demo 回执契约字段集）。
    // --scale 缺省 Macro-B；未实装层不假装——SCALE-NOT-IMPLEMENTED 结构化拒绝 exit 2。
    const args = process.argv.slice(3);
    let input: string | undefined;
    let scale: string | undefined;
    let outDir: string | undefined;
    let asJson = false;
    let refresh = false;
    for (let i = 0; i < args.length; i++) {
      const a = args[i];
      if (a === '--scale') { const v = args[++i]; if (v === undefined || v.indexOf('--') === 0) { errExit('AUDIT-ARGS: missing value for --scale\n', 2); } scale = v; }
      else if (a === '--out') { const v = args[++i]; if (v === undefined || v.indexOf('--') === 0) { errExit('AUDIT-ARGS: missing value for --out\n', 2); } outDir = v; }
      else if (a === '--json') { asJson = true; }
      else if (a === '--refresh') { refresh = true; }
      else if (a.indexOf('--') === 0) { errExit('AUDIT-ARGS: unknown flag ' + a + '\n', 2); }
      else if (!input) { input = a; }
      else { errExit('AUDIT-ARGS: unexpected extra positional ' + a + '\n', 2); }
    }
    if (!input) { errExit('usage: macro-audit audit <path|owner/repo|url> [--scale <S>] [--out <dir>] [--json] [--refresh]\n', 2); }
    try {
      // input 经上闸收窄（errExit=never）——循环内赋值致 CFA 不传导收窄，as string 如实标注
      const r = await runAudit({ input: input as string, scale: scale, outDir: outDir, json: asJson, refresh: refresh });
      if (r.out_dir) {
        outExit(JSON.stringify({
          report_id: r.report_id, receipt_id: r.receipt_id, scale: r.scale,
          stability: r.stability, capabilities: r.capabilities,
          overall_verdict: r.overall_verdict, degraded_mode: r.degraded_mode,
          head_sha: r.head_sha, tree_sha: r.tree_sha, commit_count: r.commit_count,
          adr_count: r.adr_count, fact_count: r.fact_count, repo_name: r.repo_name,
          intake: { kind: r.intake_kind, snapshot_fetched_at: r.snapshot_fetched_at, cache_hit: r.cache_hit, refreshed: r.refreshed },
          codelore: r.codelore, out_dir: r.out_dir, artifacts: r.artifacts
        }) + '\n', 0);
      } else {
        outExit(asJson ? r.sidecar_json : r.report_markdown, 0);
      }
    } catch (e) {
      if (e instanceof ExitSignal) throw e;
      if (isAuditScaleError(e)) {
        errExit(JSON.stringify({ error: e.code, message: e.message, implemented: e.implemented, requested: e.requested, layer_order: e.layer_order }) + '\n', 2);
      }
      const err = e as { code?: string; message?: string };
      errExit(JSON.stringify({ error: err.code || 'AUDIT-ERROR', message: err.message || String(e) }) + '\n', 2);
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
      outExit(JSON.stringify(listScenarios()) + '\n', 0);
    }
    try {
      const r = runDemo({ scenario: scenario, outDir: outDir, keepTemp: keep });
      if (outDir) {
        outExit(JSON.stringify({
          scenario: r.scenario, synthetic: r.synthetic, verdict: r.verdict,
          degraded_mode: r.degraded_mode, degraded_reason: r.degraded_reason,
          receipt_id: r.receipt_id, head_sha: r.head_sha, commit_count: r.commit_count,
          adr_count: r.adr_count, fact_count: r.fact_count, intake_kind: r.intake_kind,
          temp_discarded: r.temp_discarded, out_dir: r.out_dir, artifacts: r.artifacts
        }) + '\n', 0);
      } else {
        outExit(asJson ? r.sidecar_json : r.report_markdown, 0);
      }
    } catch (e) {
      if (e instanceof ExitSignal) throw e;
      const err = e as { code?: string; message?: string };
      errExit(JSON.stringify({ error: err.code || 'DEMO-ERROR', message: err.message || String(e) }) + '\n', 2);
    }
  } else {
    console.log('macro-audit kernel CLI (walking skeleton)');
    console.log('usage: macro-audit <--version|selftest|doctor [--fix]|mcp|repo add <path|owner/repo|url> [--cache <dir>] [--refresh]|audit <path|owner/repo|url> [--scale <S>] [--out <dir>] [--json] [--refresh]|demo [--scenario <name>] [--out <dir>] [--json] [--keep] [--list]|--help>');
  }
}

main().catch(function (e) {
  // ExitSignal=outExit/errExit 已调度写完即退——吞哨兵，排队写持活到 flush 回调 exit；非哨兵照常崩。
  if (!(e instanceof ExitSignal)) throw e;
});
