// 56-check.mjs —— #56 checker 语义边界修复守卫（D-065/D-064⑤/D-059⑤）
// 断言面：A=citation.ts 语义边界件（文档化命名＋PRESENCE_LIMITS＋四表＋窗口常量＋二态）
//   → B=held-out 语料分区件（独立于 52a＋分层齐全＋披露块）
//   → C=held-out 评测重生成（contract 100%＋disclosed_fn 全记＋二态＋violations=0）
//   → D=citation.test 入 smoke 链＋PRESENCE_LIMITS 常量机读
//   → E=52a 修复后复测如实（eval 重跑＋post_repair 注记＋改善方向钉）
//   → F=只测不调纪律（eval 不写 engine/src）＋新文件无 BOM
// 纪律：exit 0 + PASS N/N 为绿；held-out 只评一次首跑为设计纪律，守卫重跑=回归复测非调参。
import { readFileSync, existsSync } from 'node:fs';
import { execFileSync } from 'node:child_process';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';
import { createHash } from 'node:crypto';

const HERE = dirname(fileURLToPath(import.meta.url));
const REPO = join(HERE, '..', '..', '..');
let n = 0, f = 0;
function t(name, ok, detail) { n++; if (ok) { console.log('PASS ' + name); } else { f++; console.log('FAIL ' + name + (detail ? ' | ' + detail : '')); } }
function txt(p) { return readFileSync(p, 'utf8'); }
function noBom(p) { const b = readFileSync(p); return !(b[0] === 0xEF && b[1] === 0xBB && b[2] === 0xBF); }

// ---------- A. citation.ts 语义边界件 ----------
const SRC = join(REPO, 'engine', 'src', 'report', 'citation.ts');
const src = txt(SRC);
t('A1 supports 语义文档化（presence-level＋非语义蕴含＋fail-safe 词在模块注释）', /presence-level[\s\S]{0,80}非语义蕴含|非语义蕴含[\s\S]{0,80}presence-level/.test(src.slice(0, 2000)) && src.indexOf('fail-safe') >= 0);
t('A2 三表否定剥离＋CJK 独立词表（pre/post/pseudo×EN/CJK 六表在）', ['EN_PRE_NEG_CUES', 'EN_POST_NEG_CUES', 'EN_PSEUDO_NEG', 'CJK_PRE_NEG_CUES', 'CJK_POST_NEG_CUES', 'CJK_PSEUDO_NEG'].every(function (x) { return src.indexOf(x) >= 0; }));
t('A3 CJK 独立词表含 不/没/未/无/非（非 port 英文表）', ['不', '没', '未', '无', '非'].every(function (c) { return src.indexOf("'" + c + "'") >= 0; }));
t('A4 预声明窗口参数（NEG_WINDOW_PRE/POST/ATTRIBUTION_TAIL/SPEECH_LOOKBACK 导出）', /export const NEG_WINDOW_PRE/.test(src) && /export const NEG_WINDOW_POST/.test(src) && /export const ATTRIBUTION_TAIL/.test(src));
t('A5 引语/归属包裹模式表（QUOTE_PAIRS＋ATTRIBUTION_LEADS＋SPEECH cues）', ['QUOTE_PAIRS', 'ATTRIBUTION_LEADS', 'EN_SPEECH_CUES', 'CJK_SPEECH_CUES'].every(function (x) { return src.indexOf(x) >= 0; }));
t('A6 fail-safe 件：未闭合引号处置＋伪否定豁免判定在（unbalanced-quote＋pseudoSpansOf）', src.indexOf('unbalanced-quote') >= 0 && src.indexOf('pseudoSpansOf') >= 0);
{ const m = src.match(/export type SupportRelation = ([^;]+);/); t('A7 输出二态维持（SupportRelation 恰两成员＋无第三枚举）', !!m && m[1].replace(/\s/g, '') === "'supports'|'insufficient'"); }

// ---------- B. held-out 语料分区件 ----------
const corpusPath = join(HERE, '56-checker-heldout-corpus.json');
const corpusRaw = txt(corpusPath);
const corpus = JSON.parse(corpusRaw);
const corpusSha = createHash('sha256').update(corpusRaw).digest('hex').slice(0, 16);
t('B1 held-out 语料独立存管（corpus_id≠52a＋item 计数一致）', corpus.corpus_id === '56-checker-heldout-v1' && corpus.items.length === corpus.item_count && corpus.item_count >= 40);
const cats = {};
for (const i of corpus.items) { cats[i.category] = (cats[i.category] || 0) + 1; }
t('B2 分层齐全：正/负前后/伪否定/CJK/引语/归属/悬挂/披露层九类+', ['positive-clean', 'neg-pre-en', 'neg-post-en', 'pseudo-neg', 'neg-cjk', 'pseudo-neg-cjk', 'quoted-attributed', 'term-quoted', 'unbalanced-quote', 'fn-paraphrase-disclosed', 'attachment-ambiguous-disclosed', 'ungrounded'].every(function (c) { return (cats[c] || 0) >= 1; }), JSON.stringify(cats));
t('B3 held-out 披露块在（分区声明＋只评一次＋禁 52a 调参纪律）', corpus.disclosure.held_out.indexOf('52a') >= 0 && corpus.disclosure.note.indexOf('禁参照 52a') >= 0);
t('B4 语料不混入 52a 项（id 前缀 56-h＋无 52a- id）', corpus.items.every(function (i) { return i.id.indexOf('56-h') === 0; }));

// ---------- C. held-out 评测重生成 ----------
const evOut = execFileSync('node', [join(HERE, '56-checker-heldout-eval.mjs')], { encoding: 'utf8' });
t('C1 eval 重跑 exit 0＋输出汇总行', /EVAL 56-heldout n=\d+/.test(evOut), evOut.trim().slice(-100));
const res = JSON.parse(txt(join(HERE, '56-heldout-eval.json')));
t('C2 corpus sha 指纹绑定', res.corpus.sha256_16 === corpusSha, res.corpus.sha256_16 + ' vs ' + corpusSha);
t('C3 contract 层 100% 对齐（violations=0）', res.contract.pass === res.contract.n && res.violations.length === 0, 'pass=' + res.contract.pass + '/' + res.contract.n + ' violations=' + res.violations.length);
t('C4 输出恒二态', res.two_state_only === true);
t('C5 disclosed_fn 全记＋披露文案在（FN 归 human-in-loop）', res.disclosed_fn.n >= 3 && res.disclosed_fn.disclosure.indexOf('human-in-loop') >= 0 && res.disclosed_fn.disclosure.indexOf('NLI') >= 0);
t('C6 分层结果九类+全在', Object.keys(res.per_stratum).length >= 10);

// ---------- D. citation.test 入 smoke 链 ----------
const pkg = JSON.parse(txt(join(REPO, 'engine', 'package.json')));
t('D1 citation.test.mjs 在 smoke 链', pkg.scripts.smoke.indexOf('citation.test.mjs') >= 0);
const testOut = execFileSync('node', [join(REPO, 'engine', 'test', 'citation.test.mjs')], { encoding: 'utf8' });
t('D2 citation.test 实跑全绿（≥25 断言）', /CITATION-TEST-OK (\d+)/.test(testOut) && Number(testOut.match(/CITATION-TEST-OK (\d+)/)[1]) >= 25, testOut.trim().slice(-60));
const DIST = join(REPO, 'engine', 'dist', 'report', 'citation.js');
const distSrc = txt(DIST);
t('D3 PRESENCE_LIMITS 披露常量编出（dist 含 fn_disclosure/human-in-loop）', distSrc.indexOf('PRESENCE_LIMITS') >= 0 && distSrc.indexOf('human-in-loop') >= 0);

// ---------- E. 52a 修复后复测如实 ----------
const e52 = JSON.parse(txt(join(HERE, '52a-eval-results.json')));
t('E1 52a-eval 载 post_repair 注记（#56 修复后复测位）', !!e52.post_repair && e52.post_repair.ticket === '#56', 'post_repair=' + JSON.stringify(e52.post_repair || null));

// ---------- F. 纪律件 ----------
const evalSrc = txt(join(HERE, '56-checker-heldout-eval.mjs'));
t('F1 只测不调：eval 无 engine/src 写操作', evalSrc.indexOf('engine/src') < 0 && evalSrc.indexOf('writeFileSync') >= 0);
const nb = ['56-checker-heldout-corpus.json', '56-checker-heldout-eval.mjs', '56-heldout-eval.json', '56-check.mjs', join(REPO, 'engine', 'test', 'citation.test.mjs'), join(REPO, 'engine', 'src', 'report', 'citation.ts')];
t('F2 本票新增/改动文件无 BOM', nb.every(function (p) { return !existsSync(p) || noBom(p); }), nb.filter(function (p) { return existsSync(p) && !noBom(p); }).join(','));

console.log((f === 0 ? 'PASS' : 'FAIL') + ' ' + (n - f) + '/' + n);
process.exit(f === 0 ? 0 : 1);
