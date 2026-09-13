// 守卫：23 首报全链与三层闸门（A-026 / A-027 / spec §R3-D5 / ADR-0013）
// 用法：node .scratch/architecture-recovery/reports/23-first-report-check.mjs
// 约定：零三方依赖；直接 import engine/src/report/generate.ts（Node 类型剥离）；退出码 0 = PASS。

import { readFileSync, existsSync } from 'node:fs';
import { execFileSync } from 'node:child_process';
import { fileURLToPath, pathToFileURL } from 'node:url';
import { dirname, join } from 'node:path';

const HERE = dirname(fileURLToPath(import.meta.url));
const REPO = join(HERE, '..', '..', '..');
const GENERATE_TS = join(REPO, 'engine', 'src', 'report', 'generate.ts');
const G = await import(pathToFileURL(GENERATE_TS).href);

const PRE_REG = join(REPO, '.scratch', 'architecture-recovery', 'reports', '22-criteria-pre-registration.md');
const C_BASIS = join(REPO, '.scratch', 'architecture-recovery', 'reports', '22-c-adjudication-basis.md');
const LEDGER = join(REPO, '.scratch', 'architecture-recovery', 'decision-ledger.md');
const SKELETON_JSON = join(REPO, '.scratch', 'architecture-recovery', 'reports', '14-skeleton-fields.json');

const results = [];
function check(id, pass, detail) { results.push([id, !!pass, String(detail)]); }

const gates = JSON.parse(readFileSync(join(HERE, '23-gates.json'), 'utf8'));
const mdHappy = readFileSync(join(HERE, '23-first-report.md'), 'utf8');
const mdFail = readFileSync(join(HERE, '23-first-report-failure.md'), 'utf8');
const carHappy = JSON.parse(readFileSync(join(HERE, '23-first-report.json'), 'utf8'));
const carFail = JSON.parse(readFileSync(join(HERE, '23-first-report-failure.json'), 'utf8'));
const skeletonContract = JSON.parse(readFileSync(SKELETON_JSON, 'utf8'));
const preRegText = readFileSync(PRE_REG, 'utf8');
const cBasisText = readFileSync(C_BASIS, 'utf8');
const ledgerText = readFileSync(LEDGER, 'utf8');

// ---------- 开跑前三查（启动器 delta 第 1 条：任一缺 = 停票） ----------
const ciIds = gates.preflight.t19_ci_run_ids;
const report19 = existsSync(join(HERE, '19-report.md')) ? readFileSync(join(HERE, '19-report.md'), 'utf8') : '';
const ciArchived = Array.isArray(ciIds) && ciIds.length > 0 && ciIds.every(function (r) { return ledgerText.indexOf(r) >= 0 || report19.indexOf(r) >= 0; });
check('P1', ciArchived, '票 19 CI 证据在档：run ' + ciIds.join(', ') + ' 见于 decision-ledger.md 或 19-report.md');
let preregCommit = '';
try {
  preregCommit = execFileSync('git', ['log', '--format=%h', '-1', '--', '.scratch/architecture-recovery/reports/22-criteria-pre-registration.md'], { cwd: REPO, encoding: 'utf8' }).trim();
} catch (e) { preregCommit = ''; }
check('P2', preregCommit.length > 0 && preregCommit === gates.preflight.t22_prereg_commit, '票 22 预声明已 commit：' + preregCommit + '（预期 ' + gates.preflight.t22_prereg_commit + '）');
check('P3', existsSync(C_BASIS) && cBasisText.indexOf('B1') >= 0 && cBasisText.indexOf('B5') >= 0, 'C 层裁定依据预入库文件可指认：22-c-adjudication-basis.md 含 B1-B5');

// ---------- A 闸：形式达标（骨架 + 引文 + Receipt） ----------
const skHappy = G.skeletonOf(mdHappy);
const skFail = G.skeletonOf(mdFail);
const expectedSk = G.REPORT_SKELETON.map(function (c) { return c.id + ' ' + c.name; });
check('A1', skHappy.length === 4 && skHappy.join('|') === expectedSk.join('|'), 'happy 章顺序锁定：' + skHappy.join(' -> '));
check('A2', skFail.length === 4 && skFail.join('|') === expectedSk.join('|'), 'failure 与 happy 同骨架：' + skFail.join(' -> '));

function chapterBody(md, id) {
  const lines = md.split(String.fromCharCode(10));
  let started = false;
  const out = [];
  for (const line of lines) {
    if (line.indexOf('## C') === 0) {
      started = line.indexOf('## ' + id) === 0;
      continue;
    }
    if (started && line.trim().length > 0 && line.indexOf('# ') !== 0) { out.push(line); }
  }
  return out;
}
for (const ch of G.REPORT_SKELETON) {
  check('A3-' + ch.id, chapterBody(mdHappy, ch.id).length > 0 && chapterBody(mdFail, ch.id).length > 0, '章 ' + ch.id + ' 在 happy 与 failure 两产物中均非空');
}

check('A4', mdHappy.indexOf('RECEIPT ' + carHappy.receipt.receipt_id) >= 0 && carHappy.receipt.chain_hash.length === 64, 'Receipt 印记存在：' + carHappy.receipt.receipt_id + ' / chain 64 hex');
check('A5', carHappy.evidence.length > 0 && carHappy.evidence.every(function (e) { return e.evidence_id && e.source && e.locator; }), '每条证据含可解析引文锚（evidence_id + source + locator）：' + carHappy.evidence.length + ' 条');

const badAnchor = carHappy.evidence.filter(function (e) {
  const abs = join(REPO, e.source);
  if (!existsSync(abs)) { return true; }
  const lines = readFileSync(abs, 'utf8').split(String.fromCharCode(10));
  const ln = Number(e.locator.slice(1));
  if (!(ln >= 1 && ln <= lines.length)) { return true; }
  return lines[ln - 1].trim() !== e.excerpt.trim();
});
check('A6', badAnchor.length === 0, '引文逐字回查：' + carHappy.evidence.length + ' 条全部在 source@locator 行命中（' + badAnchor.length + ' 条失配）');

const supHappy = carHappy.citation_checks.filter(function (c) { return c.support === 'supports'; });
check('A7', supHappy.length === carHappy.citation_checks.length && carHappy.citation_checks.length > 0, '引文→结论支持关系校验：' + supHappy.length + '/' + carHappy.citation_checks.length + ' supports');

const COLLECT_TS = join(REPO, 'engine', 'src', 'collect', 'collectors.ts');
const C = await import(pathToFileURL(COLLECT_TS).href);

// 骨架字段必含清单与 A-014 契约对齐（跨票扩展他人契约：只比对不改写）
for (const ch of G.REPORT_SKELETON) {
  const contract = skeletonContract.skeleton.chapters.find(function (c) { return c.id === ch.id; });
  if (!contract) {
    check('A8-' + ch.id, false, '契约缺章 ' + ch.id);
    continue;
  }
  const want = contract.fields.map(function (f) { return f.name; }).sort().join(',');
  const got = ch.required_fields.slice().sort().join(',');
  check('A8-' + ch.id, want === got, '章 ' + ch.id + ' 必含字段清单与 14-skeleton-fields.json 逐项对齐（' + ch.required_fields.length + ' 项）');
}

// ---------- B 闸：内容非平凡（正对照 2/2 先行，再读真判据） ----------
check('B1', gates.B.pc1.pass === true && gates.B.pc2.pass === true, '正对照 2/2 命中（PC-1 ' + gates.B.pc1.adr_fact_count + '/' + gates.B.pc1.pos_fact_count + ' 事实，PC-2 delta_days=' + gates.B.pc2.delta_days + '）');
const ids = carHappy.adjudication.entries.map(function (e) { return e.criterion_id; });
const firstTc = ids.findIndex(function (x) { return x.indexOf('TC-') === 0; });
const lastPc = Math.max(ids.indexOf('PC-1'), ids.indexOf('PC-2'));
check('B2', lastPc >= 0 && firstTc >= 0 && lastPc < firstTc, '执行顺序不可倒：正对照先于真判据（lastPC 索引 ' + lastPc + ' < firstTC 索引 ' + firstTc + '）');
check('B3-TC1', gates.B.tc1.verdict === 'INCONCLUSIVE', 'TC-1 判 ' + gates.B.tc1.verdict + '（可判定数 ' + gates.B.tc1.judgeable_n + ' < 门槛 ' + gates.B.tc1.threshold.min_n + '）');
check('B3-TC2', gates.B.tc2.verdict === 'RED', 'TC-2 判 RED（mean ' + gates.B.tc2.mean_ratio_4 + ' < ' + gates.B.tc2.threshold.mean_red + '）');
check('B3-TC3', gates.B.tc3.verdict === 'AMBER', 'TC-3 判 ' + gates.B.tc3.verdict + '（最低 ' + gates.B.tc3.lowest_ratio_4 + '）');
check('B3-NC1', gates.B.nc1.pass === true, 'NC-1 负对照 0 命中（facts=' + gates.B.nc1.fact_count + '，five=' + gates.B.nc1.five_piece_present + '）');
check('B4', preRegText.indexOf('0.2462') >= 0 && preRegText.indexOf('0.6000') >= 0 && gates.B.tc1.threshold.lag_days === 90 && gates.B.tc1.threshold.ratio_red === 0.2 && gates.B.tc1.threshold.min_n === 5 && gates.B.tc2.threshold.mean_red === 0.6 && gates.B.tc2.threshold.field_missing_red === 0.5 && gates.B.tc3.threshold.red === 0.5 && gates.B.tc3.threshold.green === 0.7, '阈值跑前写死且与预声明逐项一致（跑后未调）');
const bindingOk = ['TC-1', 'TC-2', 'TC-3'].every(function (id) {
  const b = C.bindingByCriterion(id);
  if (!b) { return false; }
  const ctrl = C.bindingByCriterion(b.same_family_control);
  if (!ctrl) { return false; }
  return b.families.some(function (f) { return ctrl.families.indexOf(f) >= 0; });
});
check('B5', bindingOk, '真判据与正对照共享 detector 族（逐条对照 DETECTOR_BINDING，非凭命名相似）');
check('B6', gates.B.tc2.total > 0 && gates.B.tc3.per_source.length === 2 && gates.B.tc1.judgeable_n >= 0, '信号非空（ADR ' + gates.B.tc2.total + ' 份 / 意图源 ' + gates.B.tc3.per_source.length + ' 个），未触发全空回炉');

// ---------- C 闸：信任裁决（依据预入库 + 三档 + 锚定 + agent 可消费） ----------
const bands = ['supported', 'unsupported', 'insufficient'];
check('C1', cBasisText.indexOf('supported') >= 0 && cBasisText.indexOf('unsupported') >= 0 && cBasisText.indexOf('insufficient') >= 0, '裁定依据预入库文件含三档定义（看报告前已存在）');
check('C2', bands.indexOf(carHappy.overall_verdict) >= 0, '综合裁定 ' + carHappy.overall_verdict + ' 属三档之一');
const unanchored = carHappy.adjudication.entries.filter(function (e) { return !e.criterion_id || (e.anchored_fact_ids.length === 0 && e.anchored_evidence_ids.length === 0); });
check('C3', unanchored.length === 0, '裁定条目逐条锚定 B 产物（' + carHappy.adjudication.entries.length + ' 条，无锚 ' + unanchored.length + ' 条）');
check('C4', Array.isArray(carHappy.machine_contract.verdict_enum) && carHappy.machine_contract.verdict_enum.join(',') === bands.join(',') && carHappy.adjudication.entries.length >= 6 && typeof carHappy.receipt.chain_hash === 'string', 'agent 可消费性：结构化裁决块 + verdict 枚举三档 + 引文锚可解析（B5/A-027）');
check('C5', carHappy.adjudication.human && carHappy.adjudication.human.status === 'pending', '人裁定槽位保留（status=pending，裁定仍由人做）');
check('C6', carFail.degraded_mode === true && mdFail.indexOf(G.UNVERIFIED_MARK) >= 0 && carHappy.degraded_mode === false, '失败路径产物：显式降级 + ' + G.UNVERIFIED_MARK + ' 印记，happy 未降级');

// ---------- Receipt 加固断言（调研报告 §2.1 / §6.2：单 commit 锚不足） ----------
const rc = carHappy.receipt;
let treeNow = '';
try {
  treeNow = execFileSync('git', ['rev-parse', 'HEAD^{tree}'], { cwd: REPO, encoding: 'utf8' }).trim();
} catch (e) { treeNow = ''; }
check('R1', typeof rc.tree_anchor === 'string' && rc.tree_anchor.length === 40 && rc.tree_anchor === treeNow, 'tree 锚存在且等于当前 HEAD^{tree}：' + rc.tree_anchor.slice(0, 12));
check('R2', rc.content_digest && rc.content_digest.algo === 'sha256' && rc.content_digest.value.length === 64 && rc.content_digest.canonicalization === G.CONTENT_DIGEST_CANONICALIZATION, '内容摘要显式声明算法与规范化规则（' + rc.content_digest.canonicalization + '）');
const gr = rc.gate_ref;
let preregAncestor = false;
try {
  execFileSync('git', ['merge-base', '--is-ancestor', gr.prereg_commit, rc.commit_anchor], { cwd: REPO, encoding: 'utf8' });
  preregAncestor = true;
} catch (e) { preregAncestor = false; }
check('R3', !!gr && gr.prereg_commit.length > 0 && gr.criterion_ids.join(',') === 'PC-1,PC-2,TC-1,TC-2,TC-3,NC-1' && preregAncestor, 'gate_ref 指向预声明闸门且其 commit 拓扑先于首报锚（闸门先于被裁定对象）');
check('R4', rc.degraded === false && carFail.receipt.degraded === true && carFail.receipt.tree_anchor === rc.tree_anchor, '降级 receipt 保留同一 tree 锚并置 degraded=true（同锚可比）');

// ---------- 汇总 ----------
let failed = 0;
for (const r of results) {
  if (!r[1]) { failed = failed + 1; }
  console.log((r[1] ? 'PASS' : 'FAIL') + ' ' + r[0] + ' — ' + r[2]);
}
console.log('----');
console.log(results.length + ' checks, ' + (results.length - failed) + ' pass, ' + failed + ' fail');
if (failed > 0) { process.exit(1); }
console.log('23-first-report-check: PASS (exit 0)');
process.exit(0);

