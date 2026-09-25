#!/usr/bin/env node
import { runSelftest } from './selftest.js';
import { runDoctor } from './doctor.js';
import { loadManifestMeta } from './manifest.js';
import { repoAdd } from './intake/intake.js';
import { runDemo, listScenarios } from './demo/demo.js';
import { runAudit, isAuditScaleError } from './audit/audit.js';
import { runAuditFile, isAuditFileError } from './audit/file-card.js';
import { projectFacts, projectQuarantine } from './fact/projection.js';
import { isProtocolCrash, crashArtifactFromError, strictQuarantineEnabled, STRICT_QUARANTINE_ENV } from './intake/quarantine.js';
import { isAuditIoError } from './fact/store.js';

// D-111① 退出码契约：0=管线完成（verdict 三档均算跑完）；非零三类=协议崩溃 2/strict 门禁 3/IO 失败 4。
const EXIT_PROTOCOL_CRASH = 2;
const EXIT_STRICT_GATE = 3;
const EXIT_IO_FAILURE = 4;
import { writeFileSync, existsSync, mkdirSync } from 'node:fs';
import { join, resolve } from 'node:path';
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
    } else if (sub === 'quarantine') {
      // quarantine_log 只读投影（#78/D-113②）：mcp facts 同形面收窄——固定列集+LIMIT，不接裸 SQL。
      const args = process.argv.slice(4);
      const known = ['--db', '--run', '--field', '--limit'];
      const opts: { [k: string]: string } = {};
      for (let i = 0; i < args.length; i++) {
        const a = args[i];
        if (known.indexOf(a) < 0) { errExit('MCP-QUAR-ARGS: unknown flag ' + a + '\n', 2); }
        const v = args[i + 1];
        if (v === undefined || v.indexOf('--') === 0) { errExit('MCP-QUAR-ARGS: missing value for ' + a + '\n', 2); }
        opts[a] = v;
        i++;
      }
      opts['--db'] = resolveFactsDb(opts['--db']) || '';
      if (!opts['--db']) { errExit('usage: macro-audit mcp quarantine [--db <path>] [--run <run_id>] [--field <name>] [--limit n]\n', 2); }
      const limRaw = opts['--limit'];
      const lim = limRaw === undefined ? undefined : Number(limRaw);
      if (lim !== undefined && (!Number.isFinite(lim) || lim <= 0)) {
        errExit(JSON.stringify({ error: 'MCP-QUAR-ARGS', message: '--limit must be a positive number' }) + '\n', 2);
      }
      try {
        const rows = await projectQuarantine(opts['--db'], { run_id: opts['--run'], field_name: opts['--field'], limit: lim });
        for (const r of rows) { console.log(JSON.stringify(r)); }
      } catch (e) {
        if (e instanceof ExitSignal) throw e;
        errExit(JSON.stringify({ error: 'MCP-QUAR-ERROR', message: String(e && (e as Error).message || e) }) + '\n', 2);
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
      errExit('usage: macro-audit mcp [facts [--db <path>] [--scale S] [--repo owner/repo] [--subject ref] [--limit n] | quarantine [--db <path>] [--run <run_id>] [--field <name>] [--limit n]]\n', 2);
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
    // #80 步②（D-122/D-126）：audit file=文件卡 lazy 补采唯一写入口（MCP 面永不写）——
    //   同构发射管线仓级重跑产新观测集 append 非覆盖；资格=HEAD 对象库可达；脏工作区零感知。
    //   拦截须在通用位置参数循环之前（file 是子命令不是仓输入）。
    //   usage: macro-audit audit file <path|owner/repo|url> <file> --db <facts.duckdb> [--at <sha>]
    if (args[0] === 'file') {
      const fileArgs = args.slice(1);
      let repoInput: string | undefined;
      let filePath: string | undefined;
      let dbPath: string | undefined;
      let atSha: string | undefined;
      for (let i = 0; i < fileArgs.length; i++) {
        const a = fileArgs[i];
        if (a === '--db') { const v = fileArgs[++i]; if (v === undefined || v.indexOf('--') === 0) { errExit('AUDIT-FILE-ARGS: missing value for --db\n', 2); } dbPath = v; }
        else if (a === '--at') { const v = fileArgs[++i]; if (v === undefined || v.indexOf('--') === 0) { errExit('AUDIT-FILE-ARGS: missing value for --at\n', 2); } atSha = v; }
        else if (a.indexOf('--') === 0) { errExit('AUDIT-FILE-ARGS: unknown flag ' + a + '\n', 2); }
        else if (!repoInput) { repoInput = a; }
        else if (!filePath) { filePath = a; }
        else { errExit('AUDIT-FILE-ARGS: unexpected extra positional ' + a + '\n', 2); }
      }
      if (!repoInput || !filePath) { errExit('usage: macro-audit audit file <path|owner/repo|url> <file> --db <facts.duckdb> [--at <sha>]\n', 2); }
      if (!dbPath) { errExit('AUDIT-FILE-ARGS: --db <facts.duckdb> required（观测集落点——不存在则创建 append-only 库）\n', 2); }
      try {
        // repoInput/filePath/dbPath 经上闸收窄（errExit=never）——循环内赋值致 CFA 不传导，as string 如实标注
        const r = await runAuditFile({ input: repoInput as string, path: filePath as string, db: dbPath as string, at: atSha });
        outExit(JSON.stringify({ card: r.card, backfilled: r.backfilled, emitted: r.emitted, skipped: r.skipped, repo_ref: r.repo_ref, head_sha: r.head_sha }) + '\n', 0);
      } catch (e) {
        if (e instanceof ExitSignal) throw e;
        if (isAuditFileError(e)) { errExit(JSON.stringify({ error: e.code, message: e.message }) + '\n', EXIT_PROTOCOL_CRASH); }
        if (isAuditIoError(e)) { errExit(JSON.stringify({ error: e.code, message: e.message }) + '\n', EXIT_IO_FAILURE); }
        const err = e as { code?: string; message?: string };
        errExit(JSON.stringify({ error: err.code || 'AUDIT-FILE-ERROR', message: err.message || String(e) }) + '\n', EXIT_PROTOCOL_CRASH);
      }
    }
    let input: string | undefined;
    let scale: string | undefined;
    let outDir: string | undefined;
    let asJson = false;
    let refresh = false;
    // D-110④ flag>env>文件 precedence：flag 显式给（--strict-quarantine / --no-strict-quarantine）者胜；
    // 未给→MACRO_AUDIT_STRICT_QUARANTINE=1 兜底（env 只传开关，基线恒读仓内常量）。
    let strictFlag: boolean | undefined = undefined;
    for (let i = 0; i < args.length; i++) {
      const a = args[i];
      if (a === '--scale') { const v = args[++i]; if (v === undefined || v.indexOf('--') === 0) { errExit('AUDIT-ARGS: missing value for --scale\n', 2); } scale = v; }
      else if (a === '--out') { const v = args[++i]; if (v === undefined || v.indexOf('--') === 0) { errExit('AUDIT-ARGS: missing value for --out\n', 2); } outDir = v; }
      else if (a === '--json') { asJson = true; }
      else if (a === '--refresh') { refresh = true; }
      else if (a === '--strict-quarantine') { strictFlag = true; }
      else if (a === '--no-strict-quarantine') { strictFlag = false; }
      else if (a.indexOf('--') === 0) { errExit('AUDIT-ARGS: unknown flag ' + a + '\n', 2); }
      else if (!input) { input = a; }
      else { errExit('AUDIT-ARGS: unexpected extra positional ' + a + '\n', 2); }
    }
    const strictQuarantine = strictQuarantineEnabled(strictFlag, process.env[STRICT_QUARANTINE_ENV]);
    if (!input) { errExit('usage: macro-audit audit <path|owner/repo|url> [--scale <S>] [--out <dir>] [--json] [--refresh] [--strict-quarantine|--no-strict-quarantine] | audit file <path|owner/repo|url> <file> --db <facts.duckdb> [--at <sha>]\n', 2); }
    try {
      // input 经上闸收窄（errExit=never）——循环内赋值致 CFA 不传导收窄，as string 如实标注
      const r = await runAudit({ input: input as string, scale: scale, outDir: outDir, json: asJson, refresh: refresh, strictQuarantine: strictQuarantine });
      if (r.out_dir) {
        outExit(JSON.stringify({
          report_id: r.report_id, receipt_id: r.receipt_id, scale: r.scale,
          stability: r.stability, capabilities: r.capabilities,
          overall_verdict: r.overall_verdict, verdict: r.verdict, intake_quarantine: r.intake_quarantine, degraded_mode: r.degraded_mode,
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
      if (isProtocolCrash(e)) {
        const payload = crashArtifactFromError(e);
        // 崩溃桶工件（D-109①）：落盘 best-effort——工件失败不吞主错；stderr 同载荷结构化输出
        let artifact: string | null = null;
        try {
          const dir = outDir ? resolve(outDir) : resolve(process.cwd());
          if (!existsSync(dir)) { mkdirSync(dir, { recursive: true }); }
          artifact = join(dir, 'macro-audit-crash-' + String(payload.error_code) + '-' + String(Date.now()) + '.json');
          writeFileSync(artifact, JSON.stringify(payload, null, 2) + '\n', 'utf8');
        } catch (_) { artifact = null; }
        // D-111① 退出码三非零类：协议崩溃=2 / strict 门禁崩=3 / IO 失败=4（verdict 永不进 exit code）
        const code = payload.error_code === 'STRICT-QUARANTINE-VIOLATION' ? EXIT_STRICT_GATE : EXIT_PROTOCOL_CRASH;
        errExit(JSON.stringify({ error: payload.error_code, message: (e as Error).message, crash_artifact: artifact, crash_location: payload.crash_location, run_context: payload.run_context, counts: payload.counts }) + '\n', code);
      }
      // D-115③ IO 失败类分流（磁盘满/锁/只读）→ 独立退出类非协议崩溃
      if (isAuditIoError(e)) {
        errExit(JSON.stringify({ error: e.code, message: e.message }) + '\n', EXIT_IO_FAILURE);
      }
      const err = e as { code?: string; message?: string };
      errExit(JSON.stringify({ error: err.code || 'AUDIT-ERROR', message: err.message || String(e) }) + '\n', EXIT_PROTOCOL_CRASH);
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
    console.log('usage: macro-audit <--version|selftest|doctor [--fix]|mcp|repo add <path|owner/repo|url> [--cache <dir>] [--refresh]|audit <path|owner/repo|url> [--scale <S>] [--out <dir>] [--json] [--refresh]|audit file <path|owner/repo|url> <file> --db <facts.duckdb> [--at <sha>]|demo [--scenario <name>] [--out <dir>] [--json] [--keep] [--list]|--help>');
  }
}

main().catch(function (e) {
  // ExitSignal=outExit/errExit 已调度写完即退——吞哨兵，排队写持活到 flush 回调 exit；非哨兵照常崩。
  if (!(e instanceof ExitSignal)) throw e;
});
