#!/usr/bin/env node
// 01-align.mjs -- S1 定位收敛：语义对齐 + 阈值校准 + 词法 fallback (A-001)
// 输入: 01-corpora.json   输出: 01-align.json
import fs from 'node:fs';
import path from 'node:path';

const REPORTS = 'D:/Aworker/6F/.scratch/architecture-recovery/reports';
const CORP = path.join(REPORTS, '01-corpora.json');
const OUT = path.join(REPORTS, '01-align.json');
const HF_ENTRY = 'file:///C:/Users/Administrator/.workbuddy-ai/binaries/node/workspace/node_modules/@huggingface/transformers/dist/transformers.node.mjs';

const MODELS = [
  { id: 'minilm-l6-v2',     hf: 'Xenova/all-MiniLM-L6-v2',      qp: null,  note: 'EN generic 6-layer' },
  { id: 'bge-small-en-v15', hf: 'Xenova/bge-small-en-v1.5',     qp: null,  note: 'EN retrieval-optimized' },
  { id: 'me5-small',        hf: 'Xenova/multilingual-e5-small', qp: 'e5',  note: 'multilingual' },
];

const corpus = JSON.parse(fs.readFileSync(CORP, 'utf8'));
const repoIds = Object.keys(corpus.repos);

function sample5(arr) {
  if (arr.length <= 5) return arr.slice();
  const out = [];
  for (let i = 0; i < 5; i++) out.push(arr[Math.round((i * (arr.length - 1)) / 4)]);
  return [...new Set(out)];
}

const sampled = {};
for (const id of repoIds) {
  const readmeUnits = corpus.repos[id].intent.filter((u) => u.source.startsWith('readme:'));
  sampled[id] = sample5(readmeUnits).map((u, k) => ({ sid: id + '#S' + (k + 1), text: u.text, source: u.source }));
}

// ---------------- lexical (model-free) baseline ----------------
const STOP = new Set('a an the and or but if then else for of to in on at by with from as is are was were be been being this that these those it its into over under out up down not no nor so such than too very can will just don should now we you they he she i me my our your their them us also more most other some any each both few many much own same'.split(' '));
const tok = (s) => String(s).toLowerCase().replace(/[^a-z0-9\u4e00-\u9fff]+/g, ' ').split(' ').filter((w) => w.length > 2 && !STOP.has(w));

function buildIdf(docs) {
  const df = new Map();
  for (const d of docs) for (const t of new Set(tok(d))) df.set(t, (df.get(t) || 0) + 1);
  const idf = new Map();
  const N = docs.length;
  for (const [t, c] of df) idf.set(t, Math.log((N + 1) / (c + 1)) + 1);
  return idf;
}
function tfidf(text, idf) {
  const tf = new Map();
  for (const t of tok(text)) tf.set(t, (tf.get(t) || 0) + 1);
  const v = new Map();
  let norm = 0;
  for (const [t, c] of tf) { const w = (1 + Math.log(c)) * (idf.get(t) || 1); v.set(t, w); norm += w * w; }
  norm = Math.sqrt(norm) || 1;
  for (const [t, w] of v) v.set(t, w / norm);
  return v;
}
function sparseCos(a, b) {
  let s = 0;
  const [small, big] = a.size < b.size ? [a, b] : [b, a];
  for (const [t, w] of small) { const o = big.get(t); if (o) s += w * o; }
  return s;
}
function kwCoverage(intentText, vocab) {
  const ts = [...new Set(tok(intentText))];
  if (!ts.length) return 0;
  let hit = 0;
  for (const t of ts) if (vocab.has(t)) hit++;
  return hit / ts.length;
}

const lexical = {};
for (const id of repoIds) {
  const del = corpus.repos[id].delivery.units;
  const delTexts = del.map((u) => u.text);
  const idf = buildIdf(delTexts);
  const dvecs = delTexts.map((t) => tfidf(t, idf));
  const vocab = new Set();
  for (const t of delTexts) for (const w of tok(t)) vocab.add(w);
  const rows = [];
  for (const s of sampled[id]) {
    const q = tfidf(s.text, idf);
    let best = -1, bi = -1;
    for (let j = 0; j < dvecs.length; j++) { const c = sparseCos(q, dvecs[j]); if (c > best) { best = c; bi = j; } }
    rows.push({ sid: s.sid, lex_cos_max: +best.toFixed(4), keyword_coverage: +kwCoverage(s.text, vocab).toFixed(4), top1: delTexts[bi] ? delTexts[bi].slice(0, 140) : '' });
  }
  lexical[id] = {
    n_delivery: delTexts.length,
    vocab_size: vocab.size,
    rows,
    mean_lex_cos: +(rows.reduce((a, b) => a + b.lex_cos_max, 0) / rows.length).toFixed(4),
    mean_kw: +(rows.reduce((a, b) => a + b.keyword_coverage, 0) / rows.length).toFixed(4),
  };
}

// ---------------- neural embeddings ----------------
const HF = await import(HF_ENTRY);
const { pipeline, env } = HF;
env.cacheDir = 'C:/Users/Administrator/.workbuddy-ai/binaries/node/workspace/.hf-cache';
env.allowLocalModels = false;

async function encodeAll(extractor, texts, chunk) {
  const vecs = [];
  for (let i = 0; i < texts.length; i += chunk) {
    const out = await extractor(texts.slice(i, i + chunk), { pooling: 'mean', normalize: true });
    const d = out.dims[out.dims.length - 1];
    const n = out.dims[0];
    for (let r = 0; r < n; r++) vecs.push(Array.from(out.data.slice(r * d, (r + 1) * d)));
  }
  return vecs;
}
const cos = (a, b) => { let s = 0; for (let i = 0; i < a.length; i++) s += a[i] * b[i]; return s; };
function maxCos(vec, mat) {
  let best = -2, bi = -1;
  for (let j = 0; j < mat.length; j++) { const s = cos(vec, mat[j]); if (s > best) { best = s; bi = j; } }
  return { score: best, idx: bi };
}
const mean = (a) => a.reduce((x, y) => x + y, 0) / a.length;

function calibrate(pos, neg) {
  const rows = [];
  for (let th = 5; th <= 95; th += 5) {
    const t = th / 100;
    const tp = pos.filter((s) => s >= t).length;
    const fp = neg.filter((s) => s >= t).length;
    const fn = pos.length - tp;
    const tn = neg.length - fp;
    const prec = tp + fp ? tp / (tp + fp) : 0;
    const rec = tp + fn ? tp / (tp + fn) : 0;
    const f1 = prec + rec ? (2 * prec * rec) / (prec + rec) : 0;
    rows.push({ theta: +t.toFixed(2), tp, fp, tn, fn, precision: +prec.toFixed(4), recall: +rec.toFixed(4), f1: +f1.toFixed(4), tpr: +(tp / pos.length).toFixed(4), fpr: +(fp / neg.length).toFixed(4) });
  }
  const bestF1 = rows.reduce((a, b) => (b.f1 > a.f1 ? b : a), rows[0]);
  const bestJ = rows.reduce((a, b) => (b.tpr - b.fpr > a.tpr - a.fpr ? b : a), rows[0]);
  const at70 = rows.find((r) => r.theta === 0.7) || null;
  return { n_pos: pos.length, n_neg: neg.length, sweep: rows, best_f1: bestF1, best_youden: bestJ, at_0_70: at70 };
}

const models = {};
for (const M of MODELS) {
  const t0 = Date.now();
  const extractor = await pipeline('feature-extraction', M.hf, { dtype: 'q8' });
  const loadMs = Date.now() - t0;
  const pre = (texts, kind) => (M.qp === 'e5' ? texts.map((t) => (kind === 'query' ? 'query: ' : 'passage: ') + t) : texts);

  const delVecs = {};
  const intentVecs = {};
  for (const id of repoIds) {
    delVecs[id] = await encodeAll(extractor, pre(corpus.repos[id].delivery.units.map((u) => u.text), 'passage'), 64);
    intentVecs[id] = await encodeAll(extractor, pre(sampled[id].map((s) => s.text), 'query'), 32);
  }

  const perRepo = {};
  const positives = [];
  const negatives = [];
  for (const id of repoIds) {
    const del = corpus.repos[id].delivery.units;
    const rows = [];
    for (let i = 0; i < sampled[id].length; i++) {
      const all = delVecs[id].map((dv, j) => ({ j, s: cos(intentVecs[id][i], dv) }));
      all.sort((a, b) => b.s - a.s);
      rows.push({
        sid: sampled[id][i].sid,
        text: sampled[id][i].text,
        source: sampled[id][i].source,
        max: +all[0].s.toFixed(4),
        top3: all.slice(0, 3).map((x) => ({ score: +x.s.toFixed(4), kind: del[x.j].kind, unit: del[x.j].text.slice(0, 150) })),
      });
      positives.push(all[0].s);
    }
    perRepo[id] = { n_delivery: delVecs[id].length, rows, mean: +(rows.reduce((a, b) => a + b.max, 0) / rows.length).toFixed(4) };
  }
  for (const a of repoIds) {
    for (const b of repoIds) {
      if (a === b) continue;
      for (let i = 0; i < intentVecs[a].length; i++) negatives.push(maxCos(intentVecs[a][i], delVecs[b]).score);
    }
  }

  const drift = {};
  for (const id of repoIds) {
    const wv = [];
    for (const w of corpus.repos[id].delivery.windows) {
      const vecs = await encodeAll(extractor, pre(w.subjects, 'passage'), 64);
      const per = [];
      for (let i = 0; i < intentVecs[id].length; i++) per.push(maxCos(intentVecs[id][i], vecs).score);
      wv.push({ label: w.label, from: w.from, to: w.to, n: w.n, align: +(per.reduce((a, b) => a + b, 0) / per.length).toFixed(4) });
    }
    drift[id] = wv;
  }

  models[M.id] = {
    hf: M.hf, note: M.note, load_ms: loadMs,
    per_repo: perRepo, drift,
    pos_mean: +mean(positives).toFixed(4), neg_mean: +mean(negatives).toFixed(4),
    calibration: calibrate(positives, negatives),
  };
  console.log(M.id + ': load=' + loadMs + 'ms pos_mean=' + models[M.id].pos_mean + ' neg_mean=' + models[M.id].neg_mean + ' bestF1@' + models[M.id].calibration.best_f1.theta + '=' + models[M.id].calibration.best_f1.f1);
}

const result = { generated_at: new Date().toISOString(), corpora: CORP, sampled, lexical, models };
fs.writeFileSync(OUT, JSON.stringify(result, null, 2), { encoding: 'utf8' });
console.log('wrote ' + OUT + ' (' + fs.statSync(OUT).size + ' bytes)');
