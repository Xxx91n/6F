// audit.test.mjs —— #53 `macro-audit audit` 一等命令端到端断言（D-060 八要素）
// 覆盖：签名/exit 2 诚实拒绝/--out 双通道/回执契约/报告头 stability+capabilities/
//   快照时点披露/codelore 行为面诚实（解析与否两态如实）/audit 不携叙事职责。
// 被测仓=临时合成 git 仓（docs/adr + CONTEXT.md + package.json 负对照），跑完即弃。
import { execFileSync, spawnSync } from 'node:child_process';
import { mkdtempSync, mkdirSync, writeFileSync, existsSync, readFileSync, rmSync } from 'node:fs';
import { join, dirname } from 'node:path';
import { tmpdir } from 'node:os';
import { fileURLToPath, pathToFileURL } from 'node:url';

const HERE = dirname(fileURLToPath(import.meta.url));
const CLI = join(HERE, '..', 'dist', 'cli.js');
const NL = '\n';

let pass = 0, fail = 0;
function t(name, ok, detail) { if (ok) { pass++; console.log('PASS ' + name); } else { fail++; console.log('FAIL ' + name + (detail ? ' :: ' + detail : '')); } }

// ---- 合成被测仓（8 commits：ADR 一份五件套齐 + 非 ADR 文件，git env 钉时戳） ----
const tmp = mkdtempSync(join(tmpdir(), 'audit-test-'));
const REPO = join(tmp, 'tgt');
mkdirSync(join(REPO, 'docs', 'adr'), { recursive: true });
function sh(args, cwd) { execFileSync('git', args, { cwd: cwd, encoding: 'utf8', env: Object.assign({}, process.env, { GIT_AUTHOR_DATE: '2026-04-10T10:00:00Z', GIT_COMMITTER_DATE: '2026-04-10T10:00:00Z' }) }); }
sh(['init'], REPO); sh(['config', 'user.email', 'a@b.c'], REPO); sh(['config', 'user.name', 'audit-test'], REPO); sh(['config', 'commit.gpgsign', 'false'], REPO);
writeFileSync(join(REPO, 'CONTEXT.md'), '# audit test repo\nmacro audit positioning determinism traceability provenance receipt\n', 'utf8');
writeFileSync(join(REPO, 'package.json'), '{"name":"tgt","private":true}\n', 'utf8');
sh(['add', '-A'], REPO); sh(['commit', '-m', 'init'], REPO);
writeFileSync(join(REPO, 'docs', 'adr', '001-decision.md'), ['# ADR-001', '', '- Status: accepted', '- Date: 2026-04-10', '- Deciders: test', '- Ledger: D-001', '', '## Context', 'x.', '', '## Decision', 'y.', '', '## Consequences', 'z; supersedes ADR-000.'].join(NL), 'utf8');
sh(['add', '-A'], REPO); sh(['commit', '-m', 'add adr'], REPO);

const OUT = join(tmp, 'out');

// ---------- S 签名/拒绝面 ----------
let r0 = spawnSync('node', [CLI, 'audit'], { encoding: 'utf8' });
t('S1 缺 input → usage + exit 非 0', r0.status !== 0 && r0.stderr.indexOf('usage: macro-audit audit') >= 0, 'status=' + r0.status);
let r1 = spawnSync('node', [CLI, 'audit', REPO, '--scale', 'Macro-C'], { encoding: 'utf8' });
t('S2 --scale Macro-C → exit 2 诚实拒绝（不假装能跑）', r1.status === 2, 'status=' + r1.status + ' stderr=' + r1.stderr.slice(0, 120));
let sj = null;
try { sj = JSON.parse(r1.stderr); } catch (e) { }
t('S3 拒绝载体=结构化 JSON error=SCALE-NOT-IMPLEMENTED', !!sj && sj.error === 'SCALE-NOT-IMPLEMENTED', r1.stderr.slice(0, 160));
t('S4 implemented=[Macro-B]＋requested=Macro-C＋layer_order 在', !!sj && Array.isArray(sj.implemented) && sj.implemented[0] === 'Macro-B' && sj.requested === 'Macro-C' && typeof sj.layer_order === 'string');
t('S5 layer_order=ADR-0017③ 原文层序（Macro-C→Micro-A→Micro-B→Macro-A 起首，Macro-B 已上架不入剩余漏斗）', !!sj && sj.layer_order.indexOf('Macro-C→Micro-A→Micro-B→Macro-A') === 0, sj && sj.layer_order);

// ---------- R 实跑面（--out 双通道） ----------
let r2 = spawnSync('node', [CLI, 'audit', REPO, '--out', OUT], { encoding: 'utf8', timeout: 120000 });
t('R1 audit --out exit 0', r2.status === 0, 'status=' + r2.status + ' err=' + (r2.stderr || '').slice(0, 200));
let rec = null;
try { rec = JSON.parse(r2.stdout); } catch (e) { }
t('R2 stdout=回执 JSON（receipt_id RCP- 形）', !!rec && /^RCP-[0-9a-f]{16}$/.test(rec.receipt_id || ''), (r2.stdout || '').slice(0, 160));
if (rec) {
  t('R3 回执契约字段集：report_id/scale/stability/capabilities/overall_verdict/head_sha/fact_count/out_dir/artifacts', ['report_id', 'scale', 'stability', 'capabilities', 'overall_verdict', 'head_sha', 'commit_count', 'adr_count', 'fact_count', 'out_dir', 'artifacts'].every(function (k) { return rec[k] !== undefined; }));
  t('R4 scale=Macro-B + stability=preview + capabilities=[macro-b]', rec.scale === 'Macro-B' && rec.stability === 'preview' && JSON.stringify(rec.capabilities) === JSON.stringify(['macro-b']));
  t('R5 intake 披露：kind=local + snapshot_fetched_at=null + cache_hit=false + refreshed=false', rec.intake && rec.intake.kind === 'local' && rec.intake.snapshot_fetched_at === null && rec.intake.cache_hit === false && rec.intake.refreshed === false);
  t('R6 codelore 面如实登记（resolved 布尔 + pinned 布尔；缺席不静默）', rec.codelore && typeof rec.codelore.resolved === 'boolean' && typeof rec.codelore.pinned === 'boolean');
}
const ART = ['report.md', 'report.json', 'audit-facts.jsonl', 'audit-measurements.json', 'facts.duckdb'];
t('R7 --out 五工件齐备', ART.every(function (f) { return existsSync(join(OUT, f)); }), ART.filter(function (f) { return !existsSync(join(OUT, f)); }).join(','));
const md = existsSync(join(OUT, 'report.md')) ? readFileSync(join(OUT, 'report.md'), 'utf8') : '';
t('R8 报告头含 stability: preview + capabilities: macro-b（D-060⑦ 机读面）', md.indexOf('stability: preview') >= 0 && md.indexOf('capabilities: macro-b') >= 0);
t('R9 披露块 capability 1 of 5 · preview 在', md.indexOf('capability 1 of 5 · preview') >= 0);
t('R10 快照时点披露行在（snapshot_fetched_at 进披露块）', md.indexOf('snapshot_fetched_at') >= 0);
const side = existsSync(join(OUT, 'report.json')) ? JSON.parse(readFileSync(join(OUT, 'report.json'), 'utf8')) : null;
t('R11 sidecar stability/capabilities 字段落机读面', !!side && side.stability === 'preview' && JSON.stringify(side.capabilities) === JSON.stringify(['macro-b']));
t('R12 侧车四象限齐备（strategy 原生 + behavior 依 codelore 两态如实）', !!side && side.quadrants.length === 4 && side.quadrants[0].quadrant === 'strategy' && ['native', 'not_applicable'].indexOf(side.quadrants[1].applicability) >= 0);
const meas = existsSync(join(OUT, 'audit-measurements.json')) ? JSON.parse(readFileSync(join(OUT, 'audit-measurements.json'), 'utf8')) : null;
t('R13 measurements.intake 快照披露三件（snapshot_fetched_at/cache_hit/refreshed）', !!meas && meas.intake && 'snapshot_fetched_at' in meas.intake && 'cache_hit' in meas.intake && 'refreshed' in meas.intake);
const factsLines = existsSync(join(OUT, 'audit-facts.jsonl')) ? readFileSync(join(OUT, 'audit-facts.jsonl'), 'utf8').trim().split(NL) : [];
t('R14 facts.jsonl 行数>0 且每行可解析 fact 十三列', factsLines.length > 0 && factsLines.every(function (l) { const f = JSON.parse(l); return !!f.fact_id && !!f.metric && !!f.trace_id; }), 'n=' + factsLines.length);

// ---------- D facts.duckdb 可读（同一 appendFact 追加路径产物） ----------
const STORE = await import(pathToFileURL(join(HERE, '..', 'dist', 'fact', 'store.js')).href);
const conn = await STORE.openReader(join(OUT, 'facts.duckdb'));
const reader = await conn.run('SELECT COUNT(*) AS n FROM audit_fact');
const cnt = Number((await reader.getRows())[0][0]);
conn.closeSync();
t('D1 facts.duckdb 可读 + audit_fact 行数>0', cnt > 0, 'n=' + cnt);

// ---------- J --json 报告面 ----------
let r3 = spawnSync('node', [CLI, 'audit', REPO, '--json'], { encoding: 'utf8', timeout: 120000 });
let js3 = null;
try { js3 = JSON.parse(r3.stdout); } catch (e) { }
t('J1 省略 --out + --json → stdout=sidecar JSON 可解析', r3.status === 0 && !!js3 && !!js3.report_id);
t('J2 sidecar 头部三件套（stability/capabilities/schema_version）', !!js3 && js3.stability === 'preview' && JSON.stringify(js3.capabilities) === JSON.stringify(['macro-b']) && js3.schema_version === '1.2.0');

// ---------- M 无 --out 默认报告面 ----------
let r4 = spawnSync('node', [CLI, 'audit', REPO], { encoding: 'utf8', timeout: 120000 });
t('M1 省略 --out → stdout=报告 markdown', r4.status === 0 && r4.stdout.indexOf('# MA-AUDIT-') >= 0 && r4.stdout.indexOf('RECEIPT RCP-') >= 0);

// ---------- N 不携叙事职责（kernel 面如实） ----------
t('N1 报告无宿主叙事段（narrative_sections 空或 sealed 模板兜底，D-053 不外携）', !!side && (side.narrative_sections.length === 0 || side.narrative_sections.every(function (s) { return s.author === 'kernel-template' || s.author === 'host'; })));

// ---------- E 错误面 ----------
let r5 = spawnSync('node', [CLI, 'audit', join(tmp, 'nonexistent-path-xyz')], { encoding: 'utf8' });
t('E1 不存在路径 → 非 0 + 结构化错误 JSON', r5.status !== 0 && /error/.test(r5.stderr) && /INTAKE-|PATH-NOT-FOUND|AUDIT-ERROR/.test(r5.stderr), (r5.stderr || '').slice(0, 120));
let r6 = spawnSync('node', [CLI, 'audit', REPO, '--scale', '--json'], { encoding: 'utf8' });
t('E2 --scale 吞旗拒收：--scale --json → exit 2 + AUDIT-ARGS missing value', r6.status === 2 && r6.stderr.indexOf('AUDIT-ARGS') >= 0, 'status=' + r6.status + ' err=' + (r6.stderr || '').slice(0, 120));

rmSync(tmp, { recursive: true, force: true });
console.log('---');
console.log((fail === 0 ? 'PASS' : 'FAIL') + ' AUDIT ' + pass + '/' + (pass + fail));
process.exit(fail === 0 ? 0 : 1);
