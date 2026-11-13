// 56-checker-heldout-eval.mjs —— #56 修完之后，拿留出来的那批语料第一次跑评测（D-064⑤ F5＋D-065；跟 52a 调准用的语料分开存，不能混）
// 测的是 dist 里的 checkAllCitations（判有没有说到点上，顺带剥掉语境）。
// 规矩：契约这一层（positive/negation/pseudo/quoted/unbalanced/ungrounded）gold 是 checker 契约里的真值，
//   要求 100% 对得上；
//   披露这一层（fn-paraphrase / attachment-ambiguous）gold 按人的理解是真 supports，checker 如实判 insufficient
//   → 记成 disclosed_fn（这属于「只说提到了、没说到点上」这种语义召回缺口，交给人来看，不算契约违规）。
// 纪律：只测不调——这个脚本不改 checker；不许参照 52a 那批语料的标签来调参；留出来的这批只评一次，就是第一次跑。
import { readFileSync, writeFileSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath, pathToFileURL } from 'node:url';
import { createHash } from 'node:crypto';
import { deterministicRunAt } from './_lib/env-contract.mjs'; // D-179① 种子化原语

const HERE = dirname(fileURLToPath(import.meta.url));
const REPO = join(HERE, '..', '..', '..');
const C = await import(pathToFileURL(join(REPO, 'engine', 'dist', 'report', 'citation.js')).href);

const corpusRaw = readFileSync(join(REPO,'engine','test','fixtures','contracts','56-checker-heldout-corpus.json'), 'utf8');
const corpus = JSON.parse(corpusRaw);
const corpusSha = createHash('sha256').update(corpusRaw).digest('hex').slice(0, 16);

const DISCLOSED = new Set(['fn-paraphrase-disclosed', 'attachment-ambiguous-disclosed']);
const checks = C.checkAllCitations(corpus.items.map(function (i) { return i.claim; }), corpus.items.map(function (i) { return i.evidence; }));
const byClaim = {};
for (const c of checks) { byClaim[c.claim_id] = c; }

const twoState = checks.every(function (c) { return c.support === 'supports' || c.support === 'insufficient'; });
const perStratum = {};
const violations = [];
const disclosedFn = [];
let contractN = 0, contractPass = 0;
for (const it of corpus.items) {
  const pred = byClaim[it.claim.claim_id].support;
  const cat = it.category;
  if (!perStratum[cat]) { perStratum[cat] = { n: 0, correct: 0, disclosed: 0, ids: [] }; }
  perStratum[cat].n++;
  perStratum[cat].ids.push(it.id);
  if (DISCLOSED.has(cat)) {
    // 披露层：gold=supports 人类语义真值；checker presence-level 应判 insufficient 并记 disclosed_fn
    if (pred === 'insufficient') { perStratum[cat].disclosed++; disclosedFn.push({ id: it.id, note: it.note }); }
    else { violations.push({ id: it.id, category: cat, gold: it.gold, pred: pred, detail: '披露层应判 insufficient 却判 supports——presence 边界失守（改写/歧义被升级为 supports）' }); }
  } else {
    contractN++;
    if (pred === it.gold) { contractPass++; perStratum[cat].correct++; }
    else { violations.push({ id: it.id, category: cat, gold: it.gold, pred: pred, flags: byClaim[it.claim.claim_id].context_flags }); }
  }
}

const results = {
  eval_id: '56-heldout-eval-v1',
  run_at: deterministicRunAt(),
  corpus: { corpus_id: corpus.corpus_id, sha256_16: corpusSha, item_count: corpus.item_count },
  predeclared: {
    note: 'D-064⑤/D-065：held-out 分区存管＋修复后首跑复测＋禁参照 52a 标签调参；contract 层 100% 对齐、披露层全记 disclosed_fn、输出恒为二态',
    contract_floor: 1.0
  },
  two_state_only: twoState,
  contract: { n: contractN, pass: contractPass, rate: contractN ? contractPass / contractN : null },
  disclosed_fn: { n: disclosedFn.length, items: disclosedFn, disclosure: 'presence-level 判定不修写语义在场者——语义召回缺口归 human-in-loop 复核（D-053④），kernel 禁 NLI/概率模型（D-058）' },
  per_stratum: perStratum,
  violations: violations,
  context_flag_coverage: { items_with_flags: checks.filter(function (c) { return c.context_flags.length > 0; }).length, total: checks.length },
};
writeFileSync(join(REPO,'engine','test','fixtures','contracts','56-heldout-eval.json'), JSON.stringify(results, null, 1) + '\n', 'utf8');
console.log('EVAL 56-heldout n=' + corpus.item_count + ' contract=' + contractPass + '/' + contractN + ' disclosed_fn=' + disclosedFn.length + ' two_state=' + twoState + ' violations=' + violations.length);
if (violations.length > 0) { for (const v of violations) { console.log('  VIOLATION ' + v.id + ' ' + v.category + ' gold=' + v.gold + ' pred=' + v.pred); } }
