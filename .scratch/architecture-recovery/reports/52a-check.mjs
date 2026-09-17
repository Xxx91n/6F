// 52a-check.mjs —— #52a checker 仪器标定守卫（D-061）
// 断言面：A=语料存在且版本化（sha 指纹一致＋分层齐全＋双标子集）；B=eval 结果契约（指标全项
//   ＋预声明阈值＋bootstrap CI＋raw agreement 双报）；C=κ 基线三报（intra-rater=天花板替代≥0.6 断言，
//   checker-vs-gold 如实报——对抗面构造预期压低，<floor 须 findings 登记另立修复票）；
//   D=band-leak 检出率＋干净对照假阳；E=只测不修纪律（eval 不改 checker 行为）＋合成限制披露；
//   F=本票新增/改动文件无 BOM。
// 纪律：本脚本跑 52a-checker-eval.mjs 重生成结果后断言（确定性——结果可复跑）；exit 0 + PASS N/N 为绿。
import { readFileSync, existsSync } from 'node:fs';
import { execFileSync } from 'node:child_process';
import { fileURLToPath } from 'node:url';
import { dirname, join } from 'node:path';
import { createHash } from 'node:crypto';

const HERE = dirname(fileURLToPath(import.meta.url));
const NL = '\n';
let pass = 0, fail = 0;
function t(name, ok, detail) { if (ok) { pass++; console.log('PASS ' + name); } else { fail++; console.log('FAIL ' + name + (detail ? ' :: ' + detail : '')); } }
function noBom(p) { const b = readFileSync(p); return !(b[0] === 0xEF && b[1] === 0xBB && b[2] === 0xBF); }

const corpusPath = join(HERE, '52a-checker-eval-corpus.json');
const corpusRaw = readFileSync(corpusPath, 'utf8');
const corpus = JSON.parse(corpusRaw);
const corpusSha = createHash('sha256').update(corpusRaw).digest('hex').slice(0, 16);

// ---------- A. 语料版本化 ----------
t('A1 语料存在＋item 计数落 80-120 票面区间', corpus.items.length + corpus.band_items.length >= 80 && corpus.items.length + corpus.band_items.length <= 120, 'n=' + (corpus.items.length + corpus.band_items.length));
const cats = {};
for (const i of corpus.items) { cats[i.category] = (cats[i.category] || 0) + 1; }
t('A2 checker 判定空间分层齐全（presence 成立/不成立/对抗 FN/对抗 FP/边界/ungrounded/空引文/锚失配）', ['presence-supported', 'presence-missing', 'adversarial-fn-paraphrase', 'adversarial-fp-negation', 'boundary', 'ungrounded', 'empty-excerpt', 'unresolvable-anchor'].every(function (c) { return cats[c] > 0; }), JSON.stringify(cats));
const subset = corpus.items.filter(function (i) { return i.in_subset; });
t('A3 双标子集 50-100 条票面区间＋gold_b 全填', subset.length >= 50 && subset.length <= 100 && subset.every(function (i) { return typeof i.gold_b === 'string'; }), 'subset=' + subset.length);
t('A4 band 面分层：6 模式注入＋干净对照在位', corpus.band_items.filter(function (b) { return b.gold; }).length >= 6 && corpus.band_items.filter(function (b) { return !b.gold; }).length >= 4);
t('A5 语料限制披露块在（synthetic＋intra-rater 口径＋防调参泄漏纪律）', corpus.disclosure.synthetic === true && corpus.disclosure.note.indexOf('intra-rater') >= 0 && corpus.disclosure.note.indexOf('调参泄漏') >= 0);

// ---------- B. eval 重生成＋结果契约 ----------
const evOut = execFileSync('node', [join(HERE, '52a-checker-eval.mjs')], { encoding: 'utf8' });
t('B1 eval 脚本重跑 exit 0＋输出汇总行', /EVAL 52a n=\d+/.test(evOut), evOut.trim().slice(-120));
const res = JSON.parse(readFileSync(join(HERE, '52a-eval-results.json'), 'utf8'));
t('B2 corpus sha 指纹绑定（结果载语料身份，防换集不改名）', res.corpus.sha256_16 === corpusSha, res.corpus.sha256_16 + ' vs ' + corpusSha);
t('B3 预声明阈值面在（kappa_floor=0.6＋只测不修纪律注记）', res.predeclared.kappa_floor === 0.6 && res.predeclared.note.indexOf('另立修复票') >= 0);
t('B4 分类别 TP/FP/TN/FN＋precision/recall/F1 全类在', Object.keys(res.presence.per_category).every(function (c) { const m = res.presence.per_category[c]; return ['tp', 'fp', 'tn', 'fn', 'precision', 'recall', 'f1'].every(function (k) { return k in m; }); }));
t('B5 FP/FN 分型列表在（CiteEval presence≠support 错位面）', Array.isArray(res.presence.fp_typed) && Array.isArray(res.presence.fn_typed));

// ---------- C. κ 基线 ----------
const k = res.kappa;
t('C1 κ 三报：checker-vs-gold 全集＋非对抗子集＋intra-rater 双标', k.checker_vs_gold_all.kappa !== null && k.checker_vs_gold_non_adversarial.kappa !== null && k.intra_rater_subset.kappa !== null);
t('C2 raw agreement 与 bootstrap CI95 双报齐', typeof k.checker_vs_gold_all.raw_agreement === 'number' && Array.isArray(k.checker_vs_gold_all.ci95) && k.checker_vs_gold_all.ci95[0] !== null);
t('C3 intra-rater κ ≥0.6（天花板替代位——标定一致性下限过线）', k.intra_rater_subset.kappa >= 0.6, 'κ=' + k.intra_rater_subset.kappa);
t('C4 checker-vs-gold κ 如实报（若 <floor 必有 kappa-below-floor finding 登记）', k.checker_vs_gold_all.kappa >= 0.6 || res.findings.some(function (f) { return f.kind === 'kappa-below-floor'; }), 'κ=' + k.checker_vs_gold_all.kappa);
t('C5 非对抗子集 κ 高位（presence 判定在其设计域内有效）', k.checker_vs_gold_non_adversarial.kappa >= 0.9, 'κ=' + k.checker_vs_gold_non_adversarial.kappa);

// ---------- D. band-leak ----------
const bl = res.band_leak;
t('D1 band 注入检出率=100%（6 模式全覆盖）', bl.detection_rate === 1, bl.detected + '/' + bl.injected);
t('D2 band κ/raw agreement 双报在', typeof bl.kappa_checker_vs_gold === 'number' && typeof bl.raw_agreement === 'number');
t('D3 干净对照假阳率如实记（0 或有值皆可——verdictless 类词根误伤如实算 FP）', bl.clean_controls > 0 && typeof bl.clean_fp_rate === 'number', 'fp=' + bl.clean_false_positives + '/' + bl.clean_controls);

// ---------- E. 纪律与披露 ----------
t('E1 findings 如实落（对抗面 FP/FN 分型条数在）', res.findings.some(function (f) { return f.kind === 'fp-negation-context'; }) && res.findings.some(function (f) { return f.kind === 'fn-paraphrase'; }));
t('E2 合成限制披露随结果走（limitations 三条在）', res.disclosure.synthetic === true && res.disclosure.limitations.length >= 3);
const evalSrc = readFileSync(join(HERE, '52a-checker-eval.mjs'), 'utf8');
t('E3 只测不修纪律：eval 脚本无 checker 源码写操作（不写 engine/src）', evalSrc.indexOf('writeFileSync') >= 0 && evalSrc.indexOf('engine/src') < 0 && evalSrc.indexOf('src/report') < 0);

// ---------- F. BOM ----------
const nbFiles = ['52a-gen-corpus.mjs', '52a-checker-eval.mjs', '52a-checker-eval-corpus.json', '52a-eval-results.json', '52a-check.mjs'].map(function (f) { return join(HERE, f); });
t('F1 本票新增/改动文件无 BOM', nbFiles.every(function (f) { return !existsSync(f) || noBom(f); }), nbFiles.filter(function (f) { return existsSync(f) && !noBom(f); }).join(','));

console.log('---');
console.log((fail === 0 ? 'PASS' : 'FAIL') + ' ' + pass + '/' + (pass + fail));
process.exit(fail === 0 ? 0 : 1);
