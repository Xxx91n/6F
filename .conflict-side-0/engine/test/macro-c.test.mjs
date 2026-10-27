// macro-c.test.mjs —— #84 Macro-C 一等面端到端断言（D-204②④ 产线化）
// 覆盖：CLI 实跑（audit --scale Macro-C）/回执契约/报告头+披露块/四象限形态/supersede 链扫描单元
//   （whole/item/self-quote/unresolved/defer 五态）/facts.duckdb 同位写入/LLM 门控诚实披露。
// 被测仓=临时合成 git 仓（被审计仓的 ADR 目录 supersede 对 + package.json 负对照），跑完即弃。
import { execFileSync, spawnSync } from 'node:child_process';
import { mkdtempSync, mkdirSync, writeFileSync, existsSync, readFileSync, rmSync } from 'node:fs';
import { join, dirname } from 'node:path';
import { tmpdir } from 'node:os';
import { fileURLToPath, pathToFileURL } from 'node:url';

const HERE = dirname(fileURLToPath(import.meta.url));
const CLI = join(HERE, '..', 'dist', 'cli.js');
const NL = String.fromCharCode(10);

let pass = 0, fail = 0;
function t(name, ok, detail) { if (ok) { pass++; console.log('PASS ' + name); } else { fail++; console.log('FAIL ' + name + (detail ? ' :: ' + detail : '')); } }

// ---- 合成被测仓（git env 钉时戳；被审计仓 ADR 目录：两条互相 supersede 的 ADR + 一条断链 ADR + package.json 负对照） ----
const tmp = mkdtempSync(join(tmpdir(), 'macro-c-test-'));
const REPO = join(tmp, 'tgt');
mkdirSync(join(REPO, 'docs', 'adr'), { recursive: true });
function sh(args, cwd) { execFileSync('git', args, { cwd: cwd, encoding: 'utf8', env: Object.assign({}, process.env, { GIT_AUTHOR_DATE: '2026-04-10T10:00:00Z', GIT_COMMITTER_DATE: '2026-04-10T10:00:00Z' }) }); }
sh(['init'], REPO); sh(['config', 'user.email', 'a@b.c'], REPO); sh(['config', 'user.name', 'macro-c-test'], REPO); sh(['config', 'commit.gpgsign', 'false'], REPO);
writeFileSync(join(REPO, 'CONTEXT.md'), '# macro-c test repo' + NL, 'utf8');
writeFileSync(join(REPO, 'package.json'), JSON.stringify({ name: 'tgt', private: true }) + NL, 'utf8');
sh(['add', '-A'], REPO); sh(['commit', '-m', 'init'], REPO);
const ADR2 = ['# ADR-002', '', '- Status: accepted', '- Date: 2026-04-10', '- Deciders: test', '- Ledger: D-002', '', '## Context', 'base.', '', '## Decision', 'do.', '', '## Consequences', 'done; mentions ADR-001.'].join(NL);
const ADR1 = ['# ADR-001', '', '- Status: superseded by ADR-002', '- Date: 2026-04-10', '', '## Context', 'old.', '', '## Decision', 'was.', '', '## Consequences', 'replaced.'].join(NL);
const ADR3 = ['# ADR-003', '', '- Date: 2026-04-10', '', '## Context', 'c.', '', '## Decision', 'supersedes ADR-999 (does not exist).', '', '## Consequences', 'x.'].join(NL);
writeFileSync(join(REPO, 'docs', 'adr', '002-two.md'), ADR2, 'utf8');
sh(['add', '-A'], REPO); sh(['commit', '-m', 'adr2'], REPO);
writeFileSync(join(REPO, 'docs', 'adr', '001-one.md'), ADR1, 'utf8');
writeFileSync(join(REPO, 'docs', 'adr', '003-three.md'), ADR3, 'utf8');
sh(['add', '-A'], REPO); sh(['commit', '-m', 'adr1+3'], REPO);
const OUT = join(tmp, 'out');

// ---------- S CLI 实跑（--scale Macro-C 一等面） ----------
const r1 = spawnSync('node', [CLI, 'audit', REPO, '--scale', 'Macro-C', '--out', OUT], { encoding: 'utf8', timeout: 180000 });
t('S1 audit --scale Macro-C --out exit 0（产线化命令面）', r1.status === 0, 'status=' + r1.status + ' err=' + (r1.stderr || '').slice(0, 240));
let rec = null;
try { rec = JSON.parse(r1.stdout); } catch (e) { }
t('S2 回执=JSON receipt_id RCP- 形', !!rec && /^RCP-[0-9a-f]{16}$/.test(rec.receipt_id || ''), (r1.stdout || '').slice(0, 200));
if (rec) {
  t('S3 回执 scale=Macro-C + capabilities=[macro-c] + report_id 以 -MACRO-C 收尾', rec.scale === 'Macro-C' && JSON.stringify(rec.capabilities) === JSON.stringify(['macro-c']) && /-MACRO-C$/.test(rec.report_id || ''), rec.report_id);
  t('S4 回执契约字段集（与 Macro-B audit 同族）', ['report_id', 'stability', 'overall_verdict', 'head_sha', 'commit_count', 'adr_count', 'fact_count', 'out_dir', 'artifacts'].every(function (k) { return rec[k] !== undefined; }));
  t('S5 adr_count=3（语料清点如实）', rec.adr_count === 3, String(rec.adr_count));
}
const ART = ['report.md', 'report.json', 'audit-facts.jsonl', 'audit-measurements.json', 'facts.duckdb'];
t('S6 --out 五工件齐备（Macro-B 同族 artifacts 契约）', ART.every(function (f) { return existsSync(join(OUT, f)); }), ART.filter(function (f) { return !existsSync(join(OUT, f)); }).join(','));

// ---------- R 报告面 ----------
const md = existsSync(join(OUT, 'report.md')) ? readFileSync(join(OUT, 'report.md'), 'utf8') : '';
t('R1 报告头 stability: preview + capabilities: macro-c', md.indexOf('stability: preview') >= 0 && md.indexOf('capabilities: macro-c') >= 0);
t('R2 披露块 capability 2 of 5 · preview 在（38 同款标注）', md.indexOf('capability 2 of 5 · preview') >= 0);
const side = existsSync(join(OUT, 'report.json')) ? JSON.parse(readFileSync(join(OUT, 'report.json'), 'utf8')) : null;
t('R3 侧车 not_in_preview=[Macro-A]（D-204 裁后状态机——Micro-A 产线化 #85②）', !!side && JSON.stringify(side.preview_disclosure.not_in_preview) === JSON.stringify(['Macro-A']), JSON.stringify(side && side.preview_disclosure && side.preview_disclosure.not_in_preview));
t('R4 侧车六判据齐（PC-MC-1/2 + TC-MC-1/2/3 + NC-MC-1）', !!side && ['PC-MC-1', 'PC-MC-2', 'TC-MC-1', 'TC-MC-2', 'TC-MC-3', 'NC-MC-1'].every(function (c) { return side.adjudication.entries.some(function (e) { return e.criterion_id === c; }); }));
t('R5 象限四件：strategy native / structure+behavior derived / supply_chain not_applicable', !!side && side.quadrants.length === 4 && side.quadrants[0].applicability === 'native' && side.quadrants[1].applicability === 'derived' && side.quadrants[2].applicability === 'derived' && side.quadrants[3].applicability === 'not_applicable', JSON.stringify(side && side.quadrants && side.quadrants.map(function (q) { return q.quadrant + ':' + q.applicability; })));
t('R6 structure 象限 slice_fields 六键=S3 族常量集（D-205 单一源）', !!side && JSON.stringify(Object.keys(side.quadrants[1].slice_fields).sort()) === JSON.stringify(['architecture-metrics', 'architecture-roles', 'dependency-cycles', 'god-classes', 'instability', 'modularity-violations']), JSON.stringify(side && Object.keys(side.quadrants[1].slice_fields)));
t('R7 supply_chain 象限 ⚠ 数据未接（D-034③ 维持）', !!side && side.quadrants[3].verdict_gate.override_reason.indexOf('数据未接') >= 0);
const meas = existsSync(join(OUT, 'audit-measurements.json')) ? JSON.parse(readFileSync(join(OUT, 'audit-measurements.json'), 'utf8')) : null;
t('R8 measurements.supersede_chain：item-level=1 + self-quote=0 + unresolved=1（ADR-003→999）', !!meas && meas.supersede_chain.item_level_supersessions >= 1 && meas.supersede_chain.unresolved_refs.length === 1, JSON.stringify(meas && { e: meas.supersede_chain.edge_count, u: meas.supersede_chain.unresolved_refs.length }));
t('R9 measurements.llm_gate 门控态在（configured 布尔——不伪造不真调）', !!meas && meas.llm_gate && typeof meas.llm_gate.configured === 'boolean');
t('R10 measurements.pipeline 移植溯源在（source+recalibration）', !!meas && !!meas.pipeline && String(meas.pipeline.source).indexOf('38-macro-c-preview.mjs') >= 0 && String(meas.pipeline.recalibration).indexOf('85-check') >= 0);
// R11/R12 溯源串可解析（#29／ADR-0027：报告溯源串改指仓内 contract fixtures 与归档索引）——
//   gate_ref 两路径与 pipeline.source 首段路径必须是本仓现行文件；已退役 .scratch 回潮即红。
const SELF = join(HERE, '..', '..');
const gr = side && (side.gate_ref || (side.receipt && side.receipt.gate_ref));
// 空串／缺字段必须判红：`join(SELF, '')` 会命中仓库根，existsSync 会把缺锚放行成通过
const grPath = function (s) { const p = String(s || '').split(' ')[0]; return p === '' ? null : p; };
const gateRefOk = function (g) {
  if (!g) return false;
  const a = grPath(g.criteria_path), b = grPath(g.basis_path);
  return !!a && !!b && !/\.scratch/.test(String(g.criteria_path) + String(g.basis_path))
    && existsSync(join(SELF, a)) && existsSync(join(SELF, b));
};
t('R11 gate_ref 溯源串可解析（criteria/basis 均仓内现行文件，零 .scratch；缺字段即红）', gateRefOk(gr), JSON.stringify(gr));
// 负对照喂的是**接线后的判定函数**（不是 helper）：缺 criteria_path／空串／已退役 .scratch 三态必须判红
// 反例必须**只差一个维度**：basis 用真实存在的锚，否则「路径不存在」会把断言替死（删掉被测断言仍绿）
const EXIST_ANCHOR = 'engine/test/fixtures/contracts/48-micro-a-criteria.md';
const SCRATCHY = './.scratch/../' + EXIST_ANCHOR;   // 字符串含 .scratch，归一化后仍指向该存在文件
t('R11-P 负对照：缺字段／空串／.scratch 三态各只差一维即判红（删任一断言此条即红）',
  gateRefOk({ criteria_path: EXIST_ANCHOR, basis_path: EXIST_ANCHOR }) === true      // 正对照：两锚干净时放行
  && gateRefOk(null) === false
  && gateRefOk({ basis_path: EXIST_ANCHOR }) === false                               // 仅缺 criteria_path
  && gateRefOk({ criteria_path: '', basis_path: EXIST_ANCHOR }) === false             // 仅 criteria 为空串
  && existsSync(join(SELF, SCRATCHY))                                                // 该路径真实可解析
  && gateRefOk({ criteria_path: SCRATCHY, basis_path: EXIST_ANCHOR }) === false       // 仅因 .scratch 判红
  && grPath(EXIST_ANCHOR + ' D-1') === EXIST_ANCHOR);
const pipeSrc = String((meas && meas.pipeline && meas.pipeline.source) || '');
const PIPE_CARRIERS = ['engine/test/fixtures/contracts/38-macro-c-preview-report.json', 'docs/archive/decisions/ticket-index.md'];
t('R12 pipeline.source 两类载体具名齐备且现行可解析、零 .scratch（R10 只查历史脚本名，拦不住回潮）',
  pipeSrc.indexOf('.scratch') < 0 && PIPE_CARRIERS.every(function (p) { return pipeSrc.indexOf(p) >= 0 && existsSync(join(SELF, p)); })
  && (pipeSrc.match(/(?:engine|docs)\/[A-Za-z0-9_./-]+/g) || []).every(function (p) { return existsSync(join(SELF, p)); }),
  pipeSrc.slice(0, 150));
// commit 是裸字面量，路径腿看不见——索引换钉而报告串不动会绿着过期，故与归档索引 #38 行逐字对账
const idxTxt = existsSync(join(SELF, PIPE_CARRIERS[1])) ? readFileSync(join(SELF, PIPE_CARRIERS[1]), 'utf8') : '';
const idxCommit = (idxTxt.match(/^\| #38 \| `([0-9a-f]{7,40})`/m) || [])[1] || '';
const namedCommit = function (label) { const m = pipeSrc.match(new RegExp(label + ' commit ([0-9a-f]{7,40})')); return m ? m[1] : ''; };
const lineageIdx = namedCommit('记号首次出现'), lineageScript = namedCommit('脚本引入');
// 「脚本引入」不许凭「与索引值不同」就放行（`0000000` 也算不同），也不许拿 `%h` 字面量跨环境比相等——
// 本仓 D-094(b) 已实证 `%h` auto-abbrev 随对象库在 7↔8 跳变（23-first-report-check 的 R37 返修注记，
// 本条曾被它在 CI 上打红 12 腿：git 给 `04adb24`、串里写 `04adb24d`）。故预言机取 `%H` 全值。
let scriptTruth = '';
try { scriptTruth = execFileSync('git', ['log', '--all', '--diff-filter=A', '--format=%H', '-1', '--', '.scratch/architecture-recovery/reports/38-macro-c-preview.mjs'], { cwd: SELF, encoding: 'utf8' }).trim(); } catch (e) { scriptTruth = ''; }
// 两侧都先解析成完整 commit 再比——前缀等值本身有洞：`84f571a60` 以 `84f571a6` 开头，
// 却指向不存在的 commit（真值起于 `84f571a6d`）。`rev-parse --verify <v>^{commit}` 同时解决
// 三件事：宽度无关（7 字/8 字/40 位解析到同一对象）、编造不可解析、对调可比出。
const resolveCommit = function (v) {
  if (v === '') { return ''; }
  try { return execFileSync('git', ['rev-parse', '--verify', '-q', v + '^{commit}'], { cwd: SELF, encoding: 'utf8' }).trim(); } catch (e) { return ''; }
};
const truthFull = resolveCommit(scriptTruth);
const idxFull = resolveCommit(idxCommit), lineageIdxFull = resolveCommit(lineageIdx);
const scriptFull = resolveCommit(lineageScript);
let shallowHist = 'unknown';
try { shallowHist = execFileSync('git', ['rev-parse', '--is-shallow-repository'], { cwd: SELF, encoding: 'utf8' }).trim(); } catch (e) { shallowHist = 'unknown'; }
t('R13 血缘两枚 commit 各归其名——两侧均解析为完整 commit 后比全值：索引腿＝#38 行对象，脚本腿＝git 新增该脚本的对象（不可解析、对调、指错真值皆红；宽度差不红）',
  idxFull !== '' && lineageIdxFull === idxFull && scriptFull !== '' && truthFull !== '' && scriptFull === truthFull && scriptFull !== idxFull,
  JSON.stringify({ index: idxCommit, script: lineageScript, idxFull: idxFull.slice(0, 12), scriptFull: scriptFull.slice(0, 12), truthFull: truthFull.slice(0, 12), shallow: shallowHist }));

// ---------- U supersede 链扫描单元（五态确定性） ----------
const MC = await import(pathToFileURL(join(HERE, '..', 'dist', 'audit', 'macro-c.js')).href);
const docs = [
  { path: 'docs/adr/001-a.md', text: ADR1.replace('superseded by ADR-002', 'supersedes ADR-002') },
  { path: 'docs/adr/002-b.md', text: ADR2 },
  { path: 'docs/adr/003-c.md', text: ADR3 },
  { path: 'docs/adr/004-d.md', text: '# ADR-004' + NL + NL + 'ADR-004 is self-referenced here.' + NL + '- Status: superseded by ADR-004' + NL }
];
const adrs = MC.scanSupersedeAdrs(docs);
const chain = MC.buildSupersedeChain(adrs, false);
t('U1 自指 status 行 reclassify=whole 0/self-quote 1（38 §4 同序——自指改类先于计数）', chain.whole_adr_supersessions === 0 && chain.self_quote_artifacts === 1, JSON.stringify({ w: chain.whole_adr_supersessions, s: chain.self_quote_artifacts }));
t('U2 item-level=1 + unresolved=1（ADR-001→002 成对 + ADR-003→999 断链）', chain.item_level_supersessions === 1 && chain.unresolved_refs.length === 1, JSON.stringify({ i: chain.item_level_supersessions, u: chain.unresolved_refs.length }));
t('U3 self-quote-artifact 检出（ADR-004 自指边转类）', chain.self_quote_artifacts >= 1, JSON.stringify(chain.self_quote_artifacts));
t('U4 back_reference 成对（001→002 回链=mentions 命中）', (function () { const m = JSON.stringify(chain); return m.indexOf('missing_backrefs') >= 0; })());
t('U5 defer-ref resolved=false（registry 缺席）', chain.defer_ref_edges === 0 || JSON.stringify(chain).indexOf('defer-ref') >= 0);

// ---------- D facts.duckdb 同位写入 ----------
const STORE = await import(pathToFileURL(join(HERE, '..', 'dist', 'fact', 'store.js')).href);
const conn = await STORE.openReader(join(OUT, 'facts.duckdb'));
const rows = await (await conn.run('SELECT scale, COUNT(*) FROM audit_fact GROUP BY scale')).getRows();
STORE.closeDuckdb(conn);
t('D1 facts.duckdb 可读 + scale=Macro-C 行>0（同位 appendFact 产物）', rows.some(function (r) { return String(r[0]) === 'Macro-C' && Number(r[1]) > 0; }), rows.map(function (r) { return String(r[0]) + '=' + String(r[1]); }).join(','));

// ---------- J --json 报告面 ----------
const r2 = spawnSync('node', [CLI, 'audit', REPO, '--scale', 'Macro-C', '--json'], { encoding: 'utf8', timeout: 180000 });
let js2 = null;
try { js2 = JSON.parse(r2.stdout); } catch (e) { }
t('J1 --json stdout=sidecar 可解析 + schema_version 1.2.0', r2.status === 0 && !!js2 && js2.schema_version === '1.2.0', 'status=' + r2.status);

try { rmSync(tmp, { recursive: true, force: true }); } catch (e) { }
console.log('---');
console.log(fail === 0 ? 'MACRO-C-TEST-OK ' + pass + '/' + (pass + fail) : 'MACRO-C-TEST-FAIL ' + fail + '/' + (pass + fail));
process.exit(fail === 0 ? 0 : 1);
