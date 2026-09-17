// 52a-checker-eval.mjs —— #52a checker 仪器标定评测（D-061；合成语料跑 checker，产 eval JSON）
// 被测件=dist 的 checkAllCitations（presence 判定）+ scanBandViolations（band 红线机检）。
// 指标面：分类别 TP/FP/TN/FN＋precision/recall/F1（supports 类）＋FP/FN 分型（CiteEval：presence≠support）；
//   band-leak 检出率（每模式＋总体＋干净对照假阳率）；κ 基线三报——checker-vs-gold κ（全集＋非对抗子集）
//   ＋intra-rater κ（gold vs gold_b 双标子集=human-human 天花板替代位，单人二轮口径如实披露）
//   ＋raw agreement＋bootstrap CI（2000 resample，种子 PRNG 确定性）。
// 纪律：本脚本只测不改——checker 阈值零触碰（防调参泄漏）；暴露缺陷如实入 findings，另立修复票。
import { readFileSync, writeFileSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath, pathToFileURL } from 'node:url';
import { createHash } from 'node:crypto';

const HERE = dirname(fileURLToPath(import.meta.url));
const REPO = join(HERE, '..', '..', '..');
const DIST = join(REPO, 'engine', 'dist');
const C = await import(pathToFileURL(join(DIST, 'report', 'citation.js')).href);
const N = await import(pathToFileURL(join(DIST, 'report', 'narrative.js')).href);

const corpusRaw = readFileSync(join(HERE, '52a-checker-eval-corpus.json'), 'utf8');
const corpus = JSON.parse(corpusRaw);
const corpusSha = createHash('sha256').update(corpusRaw).digest('hex').slice(0, 16);

// ---- presence 判定跑批 ----
const checks = C.checkAllCitations(corpus.items.map(function (i) { return i.claim; }), corpus.items.map(function (i) { return i.evidence; }));
const byClaim = {};
for (const c of checks) { byClaim[c.claim_id] = c; }

function confusion(rows) {
  let tp = 0, fp = 0, tn = 0, fn = 0;
  for (const r of rows) {
    const pred = r.pred === 'supports';
    const gold = r.gold === 'supports';
    if (pred && gold) tp++; else if (pred && !gold) fp++; else if (!pred && gold) fn++; else tn++;
  }
  return { tp: tp, fp: fp, tn: tn, fn: fn };
}
function metrics(c) {
  const prec = c.tp + c.fp ? c.tp / (c.tp + c.fp) : null;
  const rec = c.tp + c.fn ? c.tp / (c.tp + c.fn) : null;
  const f1 = (prec !== null && rec !== null && prec + rec > 0) ? 2 * prec * rec / (prec + rec) : null;
  return { precision: prec, recall: rec, f1: f1, n: c.tp + c.fp + c.tn + c.fn };
}
function kappa(pairs) {
  const cats = ['supports', 'insufficient'];
  const n = pairs.length;
  if (n === 0) { return { kappa: null, po: null, pe: null }; }
  let agree = 0;
  const mA = { supports: 0, insufficient: 0 };
  const mB = { supports: 0, insufficient: 0 };
  for (const p of pairs) { if (p[0] === p[1]) agree++; mA[p[0]]++; mB[p[1]]++; }
  const po = agree / n;
  const pe = (mA.supports * mB.supports + mA.insufficient * mB.insufficient) / (n * n);
  return { kappa: pe === 1 ? (po === 1 ? 1 : null) : (po - pe) / (1 - pe), po: po, pe: pe };
}
// 确定性 bootstrap（mulberry32 种子 PRNG，2000 重抽样，2.5/97.5 分位）
function mulberry32(a) { return function () { a |= 0; a = a + 0x6D2B79F5 | 0; let t = Math.imul(a ^ a >>> 15, 1 | a); t = t + Math.imul(t ^ t >>> 7, 61 | t) ^ t; return ((t ^ t >>> 14) >>> 0) / 4294967296; }; }
function bootstrapKappaCI(pairs, seed, iters) {
  const rnd = mulberry32(seed);
  const ks = [];
  for (let i = 0; i < iters; i++) {
    const samp = [];
    for (let j = 0; j < pairs.length; j++) { samp.push(pairs[Math.floor(rnd() * pairs.length)]); }
    const k = kappa(samp).kappa;
    if (k !== null && !isNaN(k)) { ks.push(k); }
  }
  ks.sort(function (a, b) { return a - b; });
  if (ks.length === 0) { return { ci95: [null, null], resamples: 0 }; }
  return { ci95: [ks[Math.floor(ks.length * 0.025)], ks[Math.floor(ks.length * 0.975)]], resamples: ks.length };
}

const rows = corpus.items.map(function (i) { return { id: i.id, category: i.category, gold: i.gold, gold_b: i.gold_b, pred: byClaim[i.claim.claim_id].support, subset: i.in_subset, note: i.note }; });

const categories = {};
for (const r of rows) { (categories[r.category] = categories[r.category] || []).push(r); }
const perCategory = {};
for (const cat of Object.keys(categories).sort()) {
  const c = confusion(categories[cat]);
  perCategory[cat] = Object.assign({}, c, metrics(c));
}
const overall = confusion(rows);
const nonAdv = rows.filter(function (r) { return r.category.indexOf('adversarial') < 0; });
const overallNonAdv = confusion(nonAdv);

// FP/FN 分型（CiteEval：presence≠support 的错位面）
const fps = rows.filter(function (r) { return r.pred === 'supports' && r.gold === 'insufficient'; });
const fns = rows.filter(function (r) { return r.pred === 'insufficient' && r.gold === 'supports'; });

// ---- κ 基线 ----
const pairsAll = rows.map(function (r) { return [r.gold, r.pred]; });
const pairsNonAdv = nonAdv.map(function (r) { return [r.gold, r.pred]; });
const subsetRows = rows.filter(function (r) { return r.subset; });
const pairsRater = subsetRows.map(function (r) { return [r.gold, r.gold_b]; });
const kAll = kappa(pairsAll);
const kNonAdv = kappa(pairsNonAdv);
const kRater = kappa(pairsRater);
const ciAll = bootstrapKappaCI(pairsAll, 52, 2000);
const ciRater = bootstrapKappaCI(pairsRater, 52, 2000);

// ---- band-leak 检出率 ----
const bandRows = corpus.band_items.map(function (b) {
  const hits = N.scanBandViolations(b.text);
  return { id: b.id, expected_pattern: b.pattern, gold: b.gold, gold_b: b.gold_b, detected: hits.length > 0, hits: hits };
});
const bandLeak = bandRows.filter(function (r) { return r.gold; });
const bandClean = bandRows.filter(function (r) { return !r.gold; });
const bandDetect = bandLeak.filter(function (r) { return r.detected; }).length;
const bandFP = bandClean.filter(function (r) { return r.detected; }).length;
const bandPairs = bandRows.map(function (r) { return [r.gold ? 'leak' : 'clean', r.detected ? 'leak' : 'clean']; });
const kBand = kappa(bandPairs);
const bandRaterPairs = bandRows.filter(function (r) { return r.gold_b !== undefined; }).map(function (r) { return [(r.gold ? 'leak' : 'clean'), (r.gold_b ? 'leak' : 'clean')]; });
const kBandRater = kappa(bandRaterPairs);

const results = {
  eval_id: '52a-checker-eval',
  generated_at: '2026-04-10T10:00:00Z',
  corpus: { id: corpus.corpus_id, sha256_16: corpusSha, items: corpus.items.length, band_items: corpus.band_items.length },
  instrument: { name: 'checkCitationSupport/scanBandViolations', version: 'engine@0.1.0', note: 'presence 判定机检——无语义层（NLI 未接），presence≠support 区分面即本集对抗分层' },
  predeclared: { kappa_floor: 0.6, note: 'D-061 预声明：checker-人 κ≥0.6 起；intra-rater κ=天花板替代位；κ<floor 或对抗面 FP/FN 高企=如实入 findings 另立修复票（评测票与修复票分离）' },
  post_repair: { ticket: '#56', decision: 'D-065', note: '#56 修复后复测——checker 已接确定性语境剥离（三表否定窗＋引语/归属包裹＋fail-safe）；FP 类应改善，FN 类（改写/同义语义在场）按设计披露归 human-in-loop 维持' },
  presence: {
    overall: Object.assign({}, overall, metrics(overall)),
    per_category: perCategory,
    fp_typed: fps.map(function (r) { return { id: r.id, category: r.category, note: r.note }; }),
    fn_typed: fns.map(function (r) { return { id: r.id, category: r.category, note: r.note }; })
  },
  kappa: {
    checker_vs_gold_all: { kappa: kAll.kappa, raw_agreement: kAll.po, pe: kAll.pe, ci95: ciAll.ci95, n: pairsAll.length },
    checker_vs_gold_non_adversarial: { kappa: kNonAdv.kappa, raw_agreement: kNonAdv.po, pe: kNonAdv.pe, n: pairsNonAdv.length },
    intra_rater_subset: { kappa: kRater.kappa, raw_agreement: kRater.po, pe: kRater.pe, ci95: ciRater.ci95, n: pairsRater.length, note: '单人二轮独立标注口径——inter-rater 天花板在合成语料退化为构造确定性，此值=标定一致性下限参考' }
  },
  band_leak: {
    injected: bandLeak.length, detected: bandDetect, detection_rate: bandLeak.length ? bandDetect / bandLeak.length : null,
    clean_controls: bandClean.length, clean_false_positives: bandFP, clean_fp_rate: bandClean.length ? bandFP / bandClean.length : null,
    kappa_checker_vs_gold: kBand.kappa, raw_agreement: kBand.po,
    kappa_intra_rater: kBandRater.kappa, raw_agreement_intra: kBandRater.po,
    disagreements: bandRows.filter(function (r) { return r.detected !== r.gold; }).map(function (r) { return { id: r.id, expected: r.gold, detected: r.detected, hits: r.hits }; })
  },
  findings: [],
  disclosure: corpus.disclosure
};

// findings 如实落（评测票只测不修）
if (kAll.kappa !== null && kAll.kappa < 0.6) {
  results.findings.push({ kind: 'kappa-below-floor', value: kAll.kappa, floor: 0.6, detail: '全集 checker-vs-gold κ 低于预声明地板——对抗面（E 改写 FN / F 否定 FP）为构造预期失配；非对抗子集 κ=' + (kNonAdv.kappa === null ? 'null' : kNonAdv.kappa.toFixed(3)) + ' 另行报告；缺陷面另立修复票，本票只标定' });
}
if (fps.length > 0) { results.findings.push({ kind: 'fp-negation-context', count: fps.length, detail: 'presence 命中但语境否定/引语包裹→checker 误判 supports；FP=' + fps.length + ' 条（构造对抗面）' }); }
if (fns.length > 0) { results.findings.push({ kind: 'fn-paraphrase', count: fns.length, detail: '语义在场但字面锚缺席→checker 漏判；FN=' + fns.length + ' 条（构造对抗面）' }); }
if (bandFP > 0) { results.findings.push({ kind: 'band-clean-fp', count: bandFP, detail: '干净对照被 band 模式误命中——verdict 词根前缀误伤面（verdictless 等）' }); }

writeFileSync(join(HERE, '52a-eval-results.json'), JSON.stringify(results, null, 2) + '\n', 'utf8');
console.log('EVAL 52a n=' + rows.length + ' overall=' + JSON.stringify(overall) + ' kAll=' + kAll.kappa.toFixed(3) + ' kNonAdv=' + kNonAdv.kappa.toFixed(3) + ' kRater=' + kRater.kappa.toFixed(3) + ' band=' + bandDetect + '/' + bandLeak.length + ' fp=' + fps.length + ' fn=' + fns.length);
