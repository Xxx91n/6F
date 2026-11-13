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

// D-111① 退出码怎么定：0＝分析正常跑完了（判定结论是什么都算跑完）；非零分三类：协议出大错 2 / 卡在严格隔离 3 / 文件读写出错 4。
const EXIT_PROTOCOL_CRASH = 2;
const EXIT_STRICT_GATE = 3;
const EXIT_IO_FAILURE = 4;
import { writeFileSync, existsSync, mkdirSync } from 'node:fs';
import { join, resolve } from 'node:path';
import { serveMcpStdio, setMcpServerConfig, resolveFactsDb } from './mcp-server.js';

// #76 修的（CI run 35515346216）：process.exit() 说停就停，stdout/stderr 管道里还没冲下去的
// 排队写全丢了——Node ≤20 上输出一大（audit --json 那个 ~39KB sidecar）就抢着截断（Node 22+ 自己会冲）。
// 凡是「写完就退」的出口，一律挂在 write 回调上：回调得等 libuv 冲完才响，哪个版本都一样。
// ExitSignal 这个哨兵让 outExit/errExit 真成了 never——调度完写完就 throw，main() 边界把哨兵咽了，
// 排队的写攥着事件循环活到 flush 回调再 exit；落盘语义跟老 process.exit 一个样。
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
    // 跑一下 doctor 探一探（#62/D-059③ runtime-doctor-trigger 就是这条）：三条腿各出结构化结果——
    // 看 duckdb、git 和网络正不正常，出结构化 JSON，错了不藏着。
    // 只有整体坏透了（fail）才退 1；降级但还能用就退 0。
    // 加了 --fix 会主动去修缺掉的 duckdb 底层模块。
    const dr = await runDoctor({ fix: process.argv.indexOf('--fix') >= 0 });
    outExit(JSON.stringify(dr) + '\n', dr.overall === 'fail' ? 1 : 0);
  } else if (cmd === 'mcp') {
    // MCP 查询面（D-053④）：只读的 facts 投影——宿主 agent 写叙事时取数的唯一正路。
    // 只放固定的那几种查询，不让它随口跑 SQL，只读才安全。
    // 光写 mcp 就是 JSON-RPC 2.0 stdio 服务（NDJSON 一行一帧，A3 返工：跟 mcp.json 里注册的名实对上）；
    // mcp facts 是同一条投影的直连 CLI 形态（调试和守卫用，不走握手）。
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
      // db 怎么找，跟服务端一条链（#55/D-059⑥）：--db 参数 → MACRO_AUDIT_FACTS_DB 环境变量 → 还没有就用不了，退 2
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
      // 查隔离日志只读：字段列死，条数有上限，乱写 SQL 不接。
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
      // macro-audit mcp [--db <facts.duckdb>]：--db 就是服务端找库的那个位（#55/D-059⑥，mcp.json 的 args/env 就这么配）。
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
    // 接仓库（默认本地 / owner-repo 先找本地 / URL 得明着给 / D-013）：repo add <path|owner/repo|url> [--cache <dir>] [--refresh]
    // 克隆只有命令行和配置文件进得来；内核那条 MCP 查询面照旧只读。
    // --refresh 是明说要把已有缓存刷一遍，不给就不主动去远端拿新的。
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
    // 核心审计命令（#53/D-060）：audit <path|owner/repo|url> [--scale S] [--out <dir>] [--json] [--refresh]
    // 走的路：参数解析 → 跑分析（跟 demo 共用一条）→ 存 facts.duckdb，出报告。
    // 不给 --out 就直接打到终端；给了就写文件，终端上只出回执 JSON。
    // --scale 默认 Macro-B；还没做的档位就明着抛 SCALE-NOT-IMPLEMENTED，退 2。
    const args = process.argv.slice(3);
    // audit file 子命令：专门补采某一个文件的数据（MCP 那头只看不写，补采都放到这儿做）
    // 拦截得放在通用的位置参数循环前头（file 是子命令，不是仓库输入）。
    // usage: macro-audit audit file <path|owner/repo|url> <file> --db <facts.duckdb> [--at <sha>]
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
      if (!dbPath) { errExit('AUDIT-FILE-ARGS: --db <facts.duckdb> required（保存观测事实的数据库文件路径，不存在则自动新建）\n', 2); }
      try {
        // 参数到这儿的都验过了，下面直接跑真的
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
    // 谁大谁小：命令行参数（--strict-quarantine / --no-strict-quarantine）压过环境变量 MACRO_AUDIT_STRICT_QUARANTINE
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
      // 参数验过了，接着走
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
        // 崩溃桶工件（D-109①）：能落盘就落，落不成也不许把主错盖了；stderr 上再照同样内容打一遍结构化的
        let artifact: string | null = null;
        try {
          const dir = outDir ? resolve(outDir) : resolve(process.cwd());
          if (!existsSync(dir)) { mkdirSync(dir, { recursive: true }); }
          artifact = join(dir, 'macro-audit-crash-' + String(payload.error_code) + '-' + String(Date.now()) + '.json');
          writeFileSync(artifact, JSON.stringify(payload, null, 2) + '\n', 'utf8');
        } catch (_) { artifact = null; }
        // D-111① 三种非零退出：协议崩 2 / strict 这道门崩 3 / IO 挂 4（判定结果永远不掺进退出码）
        const code = payload.error_code === 'STRICT-QUARANTINE-VIOLATION' ? EXIT_STRICT_GATE : EXIT_PROTOCOL_CRASH;
        errExit(JSON.stringify({ error: payload.error_code, message: (e as Error).message, crash_artifact: artifact, crash_location: payload.crash_location, run_context: payload.run_context, counts: payload.counts }) + '\n', code);
      }
      // D-115③ IO 那类毛病（磁盘满、锁住、只读）单独算一类退出，不当协议崩
      if (isAuditIoError(e)) {
        errExit(JSON.stringify({ error: e.code, message: e.message }) + '\n', EXIT_IO_FAILURE);
      }
      const err = e as { code?: string; message?: string };
      errExit(JSON.stringify({ error: err.code || 'AUDIT-ERROR', message: err.message || String(e) }) + '\n', EXIT_PROTOCOL_CRASH);
    }
  } else if (cmd === 'demo') {
    // 演示入口（D-038 / A-050）：demo [--scenario <name>] [--out <dir>] [--json] [--keep] [--list]
    // 临时目录里造个固定的合成 git 仓 → 走接仓库的本地腿 → 过单仓四象限档那条管线 → 出报告（带 CASRAI 披露块）。
    // 跑完就删，不脏仓里状态；合成数据绝不冒充真审计（披露块是硬契约）。
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
  // ExitSignal 就是 outExit/errExit 排好了写完要退——把哨兵咽下去，排队的写攥着活到 flush 回调再 exit；不是哨兵就照常崩。
  if (!(e instanceof ExitSignal)) throw e;
});
