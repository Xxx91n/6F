// 守卫：23 首报全链与三层闸门（A-026 / A-027 / spec §R3-D5 / ADR-0013）
// 用法：node engine/test/contracts/23-first-report-check.mjs
// 约定：零三方依赖；骨架读 engine/dist/report/generate.js，判据绑定读 engine/src/collect/collectors.ts（Node 类型剥离）；退出码 0 = PASS。
// 分工（#37 / ADR-0027）：断言面对象＝仓内冻结产物，本守卫不重渲染——重渲染的逐字节 diff 归 golden-ci，两者不重叠。

import { readFileSync, existsSync } from 'node:fs';
import { execFileSync } from 'node:child_process';
import { need, groupProbe, gitObjectNeedOk } from './_lib/env-contract.mjs';
import { fileURLToPath, pathToFileURL } from 'node:url';
import { dirname, join } from 'node:path';
// guard-meta（D-159②/D-160③ 自声明——未声明=红）
const TIER = 'portable';
// D-214① consumption_forms（多形态消费方——R-anchor 组级 need git-object:）：dev-full=完整克隆全断言面；ci-shallow=CI 浅克隆（冻结对象借仓内 bundle 临时仓零写入物化，主仓零写）。
const CONSUMPTION_FORMS = ['dev-full', 'ci-shallow'];
const PROTECTED_SURFACE = '守卫：23 首报全链与三层闸门（A-026 / A-027 / spec §R3-D5 / ADR-0013）';


const HERE = dirname(fileURLToPath(import.meta.url));
const REPO = join(HERE, '..', '..', '..');
// R37/#75批1：generate.ts 采用 NodeNext .js specifier（import '../intake/quarantine.js'）——Node 类型剥离不做 .js→.ts 映射
// → 改导 engine/dist 编译面（同一契约出口 REPORT_SKELETON/skeletonOf 等；dist 陈旧由 check-dist/rebuild-diff 另守）。
const GENERATE_JS = join(REPO, 'engine', 'dist', 'report', 'generate.js');
const G = await import(pathToFileURL(GENERATE_JS).href);

const PRE_REG = join(REPO, 'engine', 'test', 'fixtures', 'contracts', '22-criteria-pre-registration.md');
const C_BASIS = join(REPO, 'engine', 'test', 'fixtures', 'contracts', '22-c-adjudication-basis.md');
// 账本载体 = #40 归档进仓的两份退役决策账本（只读档案）。原载体 .scratch/gov-audit/ 不在仓里、
// 却可能在开发机上残留——CI 与 dev 因此对不上。承重判据见下方 P1。
const ARCHIVE_LEDGERS = ['architecture-recovery-ledger.md', 'macro-audit-ledger.md']
  .map(function (f) { return join(REPO, 'docs', 'archive', 'decisions', f); });
const SKELETON_JSON = join(REPO, 'engine', 'test', 'fixtures', 'contracts', '14-skeleton-fields.json');

const results = [];
function check(id, pass, detail) { results.push([id, !!pass, String(detail)]); }

const gates = JSON.parse(readFileSync(join(REPO,'engine','test','fixtures','contracts','23-gates.json'), 'utf8'));
const mdHappy = readFileSync(join(REPO,'engine','test','fixtures','contracts','23-first-report.md'), 'utf8');
const mdFail = readFileSync(join(REPO,'engine','test','fixtures','contracts','23-first-report-failure.md'), 'utf8');
const carHappy = JSON.parse(readFileSync(join(REPO,'engine','test','fixtures','contracts','23-first-report.json'), 'utf8'));
const carFail = JSON.parse(readFileSync(join(REPO,'engine','test','fixtures','contracts','23-first-report-failure.json'), 'utf8'));
const skeletonContract = JSON.parse(readFileSync(SKELETON_JSON, 'utf8'));
const preRegText = readFileSync(PRE_REG, 'utf8');
const cBasisText = readFileSync(C_BASIS, 'utf8');
const ledgerText = ARCHIVE_LEDGERS.filter(function (p) { return existsSync(p); })
  .map(function (p) { return readFileSync(p, 'utf8'); }).join('\n');

// ---------- 开跑前三查（启动器 delta 第 1 条：任一缺 = 停票） ----------
const ciIds = gates.preflight.t19_ci_run_ids;
const report19 = existsSync(join(REPO,'engine','test','fixtures','contracts','19-report.md')) ? readFileSync(join(REPO,'engine','test','fixtures','contracts','19-report.md'), 'utf8') : '';
// 落点判定只做一次，断言与 detail 共用同一判定——归档账本必须真承重（≥1 个 run 见于账本）。
// 只判文件在不在是不够的：账本被截断或清空时，19-report.md 单腿仍能把 P1 顶绿＝原死载体静默回落的复现。
const ciLand = (Array.isArray(ciIds) ? ciIds : []).map(function (r) {
  return { run: r, ledger: ledgerText.indexOf(r) >= 0, report: report19.indexOf(r) >= 0 };
});
function ciStamp(l) {
  if (l.ledger) { return l.run + '@archive-ledger'; }
  if (l.report) { return l.run + '@19-report'; }
  return l.run + '@MISSING';
}
const ledgerBearing = ciLand.some(function (l) { return l.ledger; });
const ciArchived = ciLand.length > 0 && ledgerBearing
  && ciLand.every(function (l) { return l.ledger || l.report; });
check('P1', ciArchived, '票 19 CI 证据在档（双载体＝docs/archive/decisions 归档账本＋19-report.md）：'
  + ciLand.map(ciStamp).join(' ') + (ledgerBearing ? '' : '｜归档账本零命中＝载体又死了'));
// P2 diff-filter=AM：只认内容建立提交，排除退役删除提交（治理庭后语义保持）
let preregCommit = '';
try {
  preregCommit = execFileSync('git', ['log', '--diff-filter=AM', '--format=%H', '-1', '--', '.scratch/architecture-recovery/reports/22-criteria-pre-registration.md'], { cwd: REPO, encoding: 'utf8' }).trim();
} catch (e) { preregCommit = ''; }
// R37 返工 F1（D-094(b) 短 SHA 字面钉脆性）：%h auto-abbrev 随对象库 7→8 跳变——钉钉=commit 存在性（%H 前缀等值）非显示宽度
check('P2', preregCommit.length > 0 && preregCommit.startsWith(gates.preflight.t22_prereg_commit), '票 22 预声明已 commit：' + preregCommit + '（预期 ' + gates.preflight.t22_prereg_commit + '）');
// 认段落形制（表首列的行标签 `| Bn |`），不认标签的任意子串——正文顺带提到 B3 不算该段存在
const cBasisMissing = ['B1', 'B2', 'B3', 'B4', 'B5'].filter(function (s) {
  return !new RegExp('^\\|\\s*' + s + '\\s*\\|', 'm').test(cBasisText);
});
check('P3', existsSync(C_BASIS) && cBasisMissing.length === 0, 'C 层裁定依据预入库文件可指认：22-c-adjudication-basis.md 五段齐备（要求 B1-B5）' + (cBasisMissing.length ? '，缺 ' + cBasisMissing.join(', ') : ''));

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
  const abs = join(REPO, e.source.replace(/^\.scratch\/architecture-recovery\/reports\//, 'engine/test/fixtures/contracts/'));
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
const pc1Idx = ids.indexOf('PC-1');
const pc2Idx = ids.indexOf('PC-2');
// 两枚正对照都必须真在条目里且先于首个真判据——取 max 会让缺席的那枚（indexOf=-1）被另一枚掩护掉
const lastPc = Math.max(pc1Idx, pc2Idx);
check('B2', pc1Idx >= 0 && pc2Idx >= 0 && firstTc >= 0 && lastPc < firstTc, '执行顺序不可倒（两枚 PC 均须索引 >=0 且 < firstTC）：PC-1 索引 ' + pc1Idx + '、PC-2 索引 ' + pc2Idx + '、firstTC 索引 ' + firstTc);
// ---------- B3 三臂（tracker #76）：字面 ↔ 统计重算 ↔ 裁决重导 ----------
// 规则成文权威 = 22-criteria-pre-registration.md §3.1（TC-1）/§3.2（TC-2）/§3.3（TC-3），跑前写死；
// 本处只按那三节重算，不复述判据正文。阈值字面由 B4 与预声明逐项对账，故这里直接取冻结件里的 threshold 块。
// 边界表兼作「判别臂非恒真」自证，并把 #76 票面三条矛盾喂进同一条重导——注入后仍判绿即本条判红。
function r4(x) { return Number(x).toFixed(4); }

// §3.1：可判定数 < 门槛 ⇒ INCONCLUSIVE；否则 lag_ratio 严格大于 ratio_red 判 RED
function deriveTc1(t) {
  const ratio = t.judgeable_n === 0 ? 0 : t.backfill_n / t.judgeable_n;
  return {
    ratio_4: r4(ratio),
    verdict: t.judgeable_n < t.threshold.min_n ? 'INCONCLUSIVE' : (ratio > t.threshold.ratio_red ? 'RED' : 'NOT_RED')
  };
}
function consistentTc1(t) {
  const d = deriveTc1(t);
  return d.ratio_4 === t.ratio_4 && d.verdict === t.verdict;
}

// §3.2：两条独立判红臂任一命中即 RED；mean_ratio 与逐字段缺失率同源于缺失计数——
// 采集器 ratio = 现件数/5 ⇒ Σ ratio = 5·total − Σ 缺失 ⇒ mean = (5·total − Σ 缺失)/(5·total)
function deriveTc2(t) {
  const fields = C.ADR_FIVE_PIECE.slice().sort();
  const keys = Object.keys(t.missing_counts).sort();
  const ratio = {};
  let sumMissing = 0;
  for (const k of keys) {
    ratio[k] = t.total === 0 ? 0 : t.missing_counts[k] / t.total;
    sumMissing = sumMissing + t.missing_counts[k];
  }
  const mean = t.total === 0 ? 0 : (fields.length * t.total - sumMissing) / (fields.length * t.total);
  const cond_a = mean < t.threshold.mean_red;
  const cond_b = keys.some(function (k) { return ratio[k] > t.threshold.field_missing_red; });
  return {
    fieldSetOk: keys.join(',') === fields.join(','),
    ratio: ratio,
    mean_4: r4(mean),
    cond_a: cond_a,
    cond_b: cond_b,
    verdict: (cond_a || cond_b) ? 'RED' : 'NOT_RED'
  };
}
function consistentTc2(t) {
  const d = deriveTc2(t);
  const countKeys = Object.keys(t.missing_counts).sort().join(',');
  const ratioKeys = Object.keys(t.missing_ratio_4).sort();
  return d.fieldSetOk
    && ratioKeys.join(',') === countKeys
    && ratioKeys.every(function (k) { return Number(t.missing_ratio_4[k]).toFixed(4) === r4(d.ratio[k]); })
    && d.mean_4 === t.mean_ratio_4
    && d.cond_a === t.cond_a && d.cond_b === t.cond_b
    && d.verdict === t.verdict;
}

// §3.3：每源 ratio = hit/keywords，取最低一条（严格小于才换，与生成器同口径），再按 red/green 两档分带
function tc3Band(t, r) { return r < t.threshold.red ? 'RED' : (r < t.threshold.green ? 'AMBER' : 'GREEN'); }
function deriveTc3(t) {
  const per = t.per_source.map(function (s) {
    return { path: s.path, ratio: s.keywords === 0 ? 0 : s.hit / s.keywords };
  });
  let lowest = null;
  for (const p of per) { if (lowest === null || p.ratio < lowest.ratio) { lowest = p; } }
  return {
    per: per,
    lowest_ratio_4: lowest === null ? null : r4(lowest.ratio),
    lowest_paths: lowest === null ? [] : per.filter(function (p) { return p.ratio === lowest.ratio; }).map(function (p) { return p.path; }),
    verdict: lowest === null ? 'NO_SOURCE' : tc3Band(t, lowest.ratio)
  };
}
function consistentTc3(t) {
  const d = deriveTc3(t);
  return t.per_source.length > 0
    && d.per.every(function (p, i) { return p.path === t.per_source[i].path && r4(p.ratio) === t.per_source[i].ratio_4; })
    && d.lowest_ratio_4 === t.lowest_ratio_4
    && d.lowest_paths.indexOf(t.lowest_path) >= 0
    && d.verdict === t.verdict;
}

function badCases(cases) {
  return cases.filter(function (c) { return !c[1]; }).map(function (c) { return c[0]; });
}

const tc1 = gates.B.tc1;
const tc2 = gates.B.tc2;
const tc3 = gates.B.tc3;
const minN = tc1.threshold.min_n;
const t2keys = Object.keys(tc2.missing_counts);
function tc2Counts(each) {
  const c = {};
  for (const k of t2keys) { c[k] = each; }
  return c;
}
function tc2CountsOnlyFirst(n) {
  const c = tc2Counts(0);
  c[t2keys[0]] = n;
  return c;
}

const tc1Cases = [
  ['字面 INCONCLUSIVE', tc1.verdict === 'INCONCLUSIVE'],
  ['记录自洽（ratio＋裁决重导）', consistentTc1(tc1)],
  ['门槛下判 INCONCLUSIVE', deriveTc1(Object.assign({}, tc1, { judgeable_n: minN - 1, backfill_n: 0 })).verdict === 'INCONCLUSIVE'],
  ['达门槛不判 INCONCLUSIVE', deriveTc1(Object.assign({}, tc1, { judgeable_n: minN, backfill_n: 0 })).verdict !== 'INCONCLUSIVE'],
  ['达门槛且超 ratio_red 判 RED', deriveTc1(Object.assign({}, tc1, { judgeable_n: minN, backfill_n: minN })).verdict === 'RED'],
  ['#76 注入 judgeable_n=999 必否', !consistentTc1(Object.assign({}, tc1, { judgeable_n: 999 }))]
];
const tc2Cases = [
  ['字面 RED', tc2.verdict === 'RED'],
  ['记录自洽（缺失率＋mean＋cond_a/b＋裁决全重算）', consistentTc2(tc2)],
  ['两臂皆未中判 NOT_RED', deriveTc2(Object.assign({}, tc2, { total: 10, missing_counts: tc2Counts(0) })).verdict === 'NOT_RED'],
  ['仅 (a) 命中判 RED', (function () { const d = deriveTc2(Object.assign({}, tc2, { total: 10, missing_counts: tc2Counts(5) })); return d.verdict === 'RED' && d.cond_a && !d.cond_b; })()],
  ['仅 (b) 命中判 RED', (function () { const d = deriveTc2(Object.assign({}, tc2, { total: 10, missing_counts: tc2CountsOnlyFirst(6) })); return d.verdict === 'RED' && !d.cond_a && d.cond_b; })()],
  ['#76 注入 mean_ratio_4=0.9 必否', !consistentTc2(Object.assign({}, tc2, { mean_ratio_4: '0.9' }))],
  ['#76 注入须连缺失计数一起改才成立', (function () {
    // 票面「mean 0.9 而裁决仍 RED」单改统计量即自洽破口；若两臂真被同时改绿，裁决字面 RED 必须判否
    const flipped = Object.assign({}, tc2, { mean_ratio_4: '0.9000', cond_a: false, missing_ratio_4: (function () {
      const m = {}; for (const k of t2keys) { m[k] = 0.5; } return m;
    })() });
    return !consistentTc2(flipped);
  })()]
];
const tc3Cases = [
  ['字面 AMBER', tc3.verdict === 'AMBER'],
  ['记录自洽（逐源 ratio＋最低值＋路径＋分带）', consistentTc3(tc3)],
  ['三档边界 RED/AMBER/GREEN', tc3Band(tc3, tc3.threshold.red - 0.01) === 'RED'
    && tc3Band(tc3, tc3.threshold.red) === 'AMBER'
    && tc3Band(tc3, tc3.threshold.green - 0.01) === 'AMBER'
    && tc3Band(tc3, tc3.threshold.green) === 'GREEN'],
  ['取最低不取首条', (function () {
    const src = [{ path: 'low', hit: 4, keywords: 10 }, { path: 'high', hit: 9, keywords: 10 }];
    const d1 = deriveTc3(Object.assign({}, tc3, { per_source: src, lowest_path: 'low', lowest_ratio_4: '0.4000', verdict: 'RED' }));
    const d2 = deriveTc3(Object.assign({}, tc3, { per_source: src.slice().reverse(), lowest_path: 'low', lowest_ratio_4: '0.4000', verdict: 'RED' }));
    return d1.verdict === 'RED' && d2.lowest_ratio_4 === '0.4000' && d2.lowest_paths.indexOf('low') >= 0;
  })()],
  ['#76 注入 lowest_ratio_4=0.99 必否', !consistentTc3(Object.assign({}, tc3, { lowest_ratio_4: '0.9900' }))],
  ['注入真把两源抬到 0.99 则裁决必须不再是 AMBER', (function () {
    const raised = Object.assign({}, tc3, { per_source: tc3.per_source.map(function (s) { return { path: s.path, hit: s.keywords, keywords: s.keywords }; }),
      lowest_ratio_4: '1.0000', lowest_path: tc3.per_source[0].path, verdict: 'AMBER' });
    return !consistentTc3(raised);
  })()]
];

const tc1Bad = badCases(tc1Cases);
const tc2Bad = badCases(tc2Cases);
const tc3Bad = badCases(tc3Cases);
check('B3-TC1', tc1Bad.length === 0, 'TC-1 判 ' + tc1.verdict + '（可判定数 ' + tc1.judgeable_n + ' < 门槛 ' + minN
  + '，ratio ' + tc1.backfill_n + '/' + tc1.judgeable_n + '=' + deriveTc1(tc1).ratio_4 + '＝记录 ' + tc1.ratio_4
  + '；重算与边界表 ' + (tc1Cases.length - tc1Bad.length) + '/' + tc1Cases.length + (tc1Bad.length ? ' 失配：' + tc1Bad.join('、') : '') + '）');
check('B3-TC2', tc2Bad.length === 0, 'TC-2 判 ' + tc2.verdict + '（mean 重算 ' + deriveTc2(tc2).mean_4 + '＝记录 ' + tc2.mean_ratio_4
  + ' < ' + tc2.threshold.mean_red + '，cond_a/b 重算 ' + deriveTc2(tc2).cond_a + '/' + deriveTc2(tc2).cond_b + '＝记录 ' + tc2.cond_a + '/' + tc2.cond_b
  + '；重算与边界表 ' + (tc2Cases.length - tc2Bad.length) + '/' + tc2Cases.length + (tc2Bad.length ? ' 失配：' + tc2Bad.join('、') : '') + '）');
check('B3-TC3', tc3Bad.length === 0, 'TC-3 判 ' + tc3.verdict + '（最低重算 ' + deriveTc3(tc3).lowest_ratio_4 + '＝记录 ' + tc3.lowest_ratio_4
  + ' @' + tc3.lowest_path + '，分带 [' + tc3.threshold.red + ',' + tc3.threshold.green + ')＝AMBER'
  + '；重算与边界表 ' + (tc3Cases.length - tc3Bad.length) + '/' + tc3Cases.length + (tc3Bad.length ? ' 失配：' + tc3Bad.join('、') : '') + '）');
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
// `supported` 是 `unsupported` 的子串——裸 indexOf 会让第一档永真（有 unsupported 就必过）。认整词，前后非字母才算该档定义在场。
const cBandsMissing = bands.filter(function (b) { return !new RegExp('(^|[^A-Za-z])' + b + '($|[^A-Za-z])').test(cBasisText); });
check('C1', cBandsMissing.length === 0, '裁定依据预入库文件含三档定义（看报告前已存在）' + (cBandsMissing.length ? '，缺 ' + cBandsMissing.join(', ') : ''));
check('C2', bands.indexOf(carHappy.overall_verdict) >= 0, '综合裁定 ' + carHappy.overall_verdict + ' 属三档之一');
const unanchored = carHappy.adjudication.entries.filter(function (e) { return !e.criterion_id || (e.anchored_fact_ids.length === 0 && e.anchored_evidence_ids.length === 0); });
check('C3', unanchored.length === 0, '裁定条目逐条锚定 B 产物（' + carHappy.adjudication.entries.length + ' 条，无锚 ' + unanchored.length + ' 条）');
check('C4', Array.isArray(carHappy.machine_contract.verdict_enum) && carHappy.machine_contract.verdict_enum.join(',') === bands.join(',') && carHappy.adjudication.entries.length >= 6 && typeof carHappy.receipt.chain_hash === 'string', 'agent 可消费性：结构化裁决块 + verdict 枚举三档 + 引文锚可解析（B5/A-027）');
check('C5', carHappy.adjudication.human && carHappy.adjudication.human.status === 'pending', '人裁定槽位保留（status=pending，裁定仍由人做）');
check('C6', carFail.degraded_mode === true && mdFail.indexOf(G.UNVERIFIED_MARK) >= 0 && carHappy.degraded_mode === false, '失败路径产物：显式降级 + ' + G.UNVERIFIED_MARK + ' 印记，happy 未降级');

// ---------- Receipt 加固断言（调研报告 §2.1 / §6.2：单 commit 锚不足） ----------
const rc = carHappy.receipt;
// 注：产物是对「生成时刻」锚定的，故断言「锚可解析为真实对象」而非「等于当前 HEAD」——
// 后者在提交后必然失效，会把正确的不变量写成假 FAIL（本票首次收口即踩到）。
function gitType(rev) {
  try { return execFileSync('git', ['cat-file', '-t', rev], { cwd: REPO, encoding: 'utf8' }).trim(); }
  catch (e) { return ''; }
}
// git-object 前置（D-163②）：receipt 锚 fc00d458/6f405cfc 幽灵对象非分支祖先 clone 不携带——
// 缺席借仓内 bundle 临时仓零写入物化；R2/R4 纯 JSON 断言零需不连坐
const GO23 = groupProbe('23-first-report-check', 'R-anchor', [need('git-object:' + rc.commit_anchor, gitObjectNeedOk(REPO, rc.commit_anchor, join(REPO, 'engine', 'test', 'fixtures', 'frozen', '23-frozen-' + rc.commit_anchor.slice(0, 8) + '.bundle')))]);
if (GO23) check('R1', typeof rc.tree_anchor === 'string' && rc.tree_anchor.length === 40 && gitType(rc.tree_anchor) === 'tree' && gitType(rc.commit_anchor) === 'commit', '双锚可解析：tree ' + rc.tree_anchor.slice(0, 12) + ' 为真实 tree 对象，commit ' + rc.commit_anchor.slice(0, 7) + ' 为真实 commit 对象');
check('R2', rc.content_digest && rc.content_digest.algo === 'sha256' && rc.content_digest.value.length === 64 && rc.content_digest.canonicalization === G.CONTENT_DIGEST_CANONICALIZATION, '内容摘要显式声明算法与规范化规则（' + rc.content_digest.canonicalization + '）');
const gr = rc.gate_ref;
let preregAncestor = false;
try {
  if (GO23) { execFileSync('git', ['merge-base', '--is-ancestor', gr.prereg_commit, rc.commit_anchor], { cwd: REPO, encoding: 'utf8' }); preregAncestor = true; }
} catch (e) { preregAncestor = false; }
if (GO23) check('R3', !!gr && gr.prereg_commit.length > 0 && gr.criterion_ids.join(',') === 'PC-1,PC-2,TC-1,TC-2,TC-3,NC-1' && preregAncestor, 'gate_ref 指向预声明闸门且其 commit 拓扑先于首报锚（闸门先于被裁定对象）');
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
