#!/usr/bin/env node
// 01-spotcheck.mjs -- 人工抽检（manual spot-check）+ 域内校准 (A-001)
// 输入: 01-align.json   输出: 01-spotcheck.json
// 标签口径（逐条人工判读 top3 交付证据）:
//   delivered = 交付证据实质支持该意图声明
//   drift     = 部分回响 / 单位自身为 README 断句碎片（非完整声明）
//   absent    = 无交付证据对应（营销式口号）
import fs from 'node:fs';
const REPORTS = 'D:/Aworker/6F/.scratch/architecture-recovery/reports';
const align = JSON.parse(fs.readFileSync(REPORTS + '/01-align.json', 'utf8'));

const LABELS = {
  'env-manager#S1': { label: 'delivered', why: '仓名与定位标签一致（弱信号，见 title 注记）' },
  'env-manager#S2': { label: 'absent',    why: '营销口号 Adapts seamlessly to every environment；top3 均为泛化 build/refactor 提交，无交付对应' },
  'env-manager#S3': { label: 'delivered', why: 'top1=feat(secrets) Phase6-7 sops+Azure KV；top3 全部为 secrets provider 系列提交' },
  'env-manager#S4': { label: 'delivered', why: 'feat(license,cli) ... PATH health + PATH entry add-path 测试提交' },
  'env-manager#S5': { label: 'delivered', why: 'feat(gui): add Tauri + TypeScript + Svelte GUI foundation' },
  'jiahao#S1':      { label: 'delivered', why: 'pkg name 精确匹配（弱信号）' },
  'jiahao#S2':      { label: 'delivered', why: 'ADR-0044 falsification evidence / ADR-0057 skip-honesty gate 即反假完成机制' },
  'jiahao#S3':      { label: 'delivered', why: 'docs(adr-0032) generator surface rules + feat(hooks) verdict-gate generator profile advisory mode' },
  'jiahao#S4':      { label: 'delivered', why: 'docs: verifier deployment discipline + ADR-0035 verifier audit fix' },
  'jiahao#S5':      { label: 'drift',     why: '单位自身为 README 硬换行断句碎片（非完整声明）；部分回响 generator profile advisory' },
  'anysearch-cli#S1': { label: 'delivered', why: 'pkg name 精确匹配（弱信号）' },
  'anysearch-cli#S2': { label: 'delivered', why: 'feat: G009 Retroaererd Engine - fanout + RRF + sufficiency gate；path packages/kernel' },
  'anysearch-cli#S3': { label: 'delivered', why: 'path packages/retriever + feat: G008 AnySearch provider adapter' },
  'anysearch-cli#S4': { label: 'delivered', why: 'path apps/mcp + feat: G018 tool completion (search_web/recall_memory/research_web)' },
  'anysearch-cli#S5': { label: 'delivered', why: 'path apps/cli + feat(G010) CLI composition root - 8 commands' },
};

const pos = [];
const neg = [];
const rows = [];
for (const [mid, M] of Object.entries(align.models)) {
  const r = [];
  for (const repo of Object.keys(align.sampled)) {
    for (const x of M.per_repo[repo].rows) {
      const L = LABELS[x.sid];
      const rec = { model: mid, sid: x.sid, score: x.max, label: L.label, why: L.why };
      r.push(rec);
      if (L.label === 'delivered') pos.push({ model: mid, score: x.max }); else neg.push({ model: mid, score: x.max });
    }
  }
  rows.push({ model: mid, records: r });
}

function sweep(p, n) {
  const out = [];
  for (let th = 20; th <= 95; th += 5) {
    const t = th / 100;
    const tp = p.filter((s) => s >= t).length;
    const fp = n.filter((s) => s >= t).length;
    const fn = p.length - tp;
    const tn = n.length - fp;
    const prec = tp + fp ? tp / (tp + fp) : 0;
    const rec = tp + fn ? tp / (tp + fn) : 0;
    const f1 = prec + rec ? (2 * prec * rec) / (prec + rec) : 0;
    out.push({ theta: +t.toFixed(2), tp, fp, tn, fn, precision: +prec.toFixed(4), recall: +rec.toFixed(4), f1: +f1.toFixed(4) });
  }
  return out;
}

const perModel = {};
for (const mid of Object.keys(align.models)) {
  const p = pos.filter((x) => x.model === mid).map((x) => x.score);
  const n = neg.filter((x) => x.model === mid).map((x) => x.score);
  const sw = sweep(p, n);
  perModel[mid] = {
    n_pos: p.length, n_neg: n.length,
    pos_mean: +(p.reduce((a, b) => a + b, 0) / p.length).toFixed(4),
    neg_mean: +(n.reduce((a, b) => a + b, 0) / n.length).toFixed(4),
    sweep: sw,
    at_0_70: sw.find((s) => s.theta === 0.7),
    best_f1: sw.reduce((a, b) => (b.f1 > a.f1 ? b : a), sw[0]),
  };
}

// 排除 title 单位后的仓库均值（title 与 pkg name 精确匹配 → 平凡高分）
const titleExcluded = {};
for (const [mid, M] of Object.entries(align.models)) {
  const o = {};
  for (const repo of Object.keys(align.sampled)) {
    const rs = M.per_repo[repo].rows.filter((x) => !x.sid.endsWith('#S1'));
    o[repo] = +(rs.reduce((a, b) => a + b.max, 0) / rs.length).toFixed(4);
  }
  titleExcluded[mid] = o;
}

const result = {
  generated_at: new Date().toISOString(),
  protocol: 'manual spot-check: 5 sampled intent units per repo x 3 repos = 15 units; label by reading top-3 delivery evidence (MiniLM + bge-small); delivered=13, absent=1, drift=1',
  labels: LABELS,
  per_model: perModel,
  per_repo_mean_excluding_title: titleExcluded,
  rows,
};
fs.writeFileSync(REPORTS + '/01-spotcheck.json', JSON.stringify(result, null, 2), { encoding: 'utf8' });
for (const [mid, v] of Object.entries(perModel)) {
  console.log(mid + ': n_pos=' + v.n_pos + ' n_neg=' + v.n_neg + ' pos_mean=' + v.pos_mean + ' neg_mean=' + v.neg_mean + ' @0.70=' + JSON.stringify(v.at_0_70) + ' bestF1=' + JSON.stringify(v.best_f1));
}
console.log('title-excluded repo means: ' + JSON.stringify(titleExcluded));
console.log('wrote 01-spotcheck.json (' + fs.statSync(REPORTS + '/01-spotcheck.json').size + ' bytes)');
