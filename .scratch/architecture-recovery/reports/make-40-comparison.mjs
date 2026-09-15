// make-40-comparison.mjs — 组装 40-external-comparison.json（外部仓 vs 三仓基线对照；一次性生成器）
import { readFileSync, writeFileSync, existsSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import { dirname, join } from 'node:path';

const HERE = dirname(fileURLToPath(import.meta.url));
const BASES = ['env-manager', 'anysearch-cli', 'jiahao'];
const rows = [];

for (const b of BASES) {
  const p = join(HERE, '39-macro-b-' + b + '-measurements.json');
  const m = JSON.parse(readFileSync(p, 'utf8'));
  const sum = JSON.parse(readFileSync(join(HERE, '39-macro-b-measurements.json'), 'utf8'));
  const t = sum.targets.find(x => x.repo === b);
  rows.push({
    repo: b, kind: 'internal-dogfooding', url_optin: false,
    head_sha: m.head_sha, commit_count: m.commit_count, adr_count: m.adr_count,
    intent_docs: m.intent_docs, fact_count: m.fact_count,
    tc1: { verdict: m.tc1.verdict, judgeable_n: m.tc1.judgeable_n, ratio_4: m.tc1.ratio_4 },
    tc2: { verdict: m.tc2.verdict, mean_ratio_4: m.tc2.mean_ratio_4, missing_ratio_4: m.tc2.missing_ratio_4, cond_a: m.tc2.cond_a, cond_b: m.tc2.cond_b },
    tc3: { verdict: m.tc3.verdict, lowest_ratio_4: m.tc3.lowest_ratio_4 },
    nc1: { pass: m.nc1.pass, path: m.nc1.path },
    overall: t.verdicts.overall, receipt: t.receipt
  });
}

const extMeas = JSON.parse(readFileSync(join(HERE, '40-out', '40-macro-b-gsd-core-measurements.json'), 'utf8'));
const extSum = JSON.parse(readFileSync(join(HERE, '40-out', '40-macro-b-measurements.json'), 'utf8'));
const extT = extSum.targets.find(x => x.repo === 'gsd-core');
rows.push({
  repo: 'gsd-core', kind: 'external-url-optin', url_optin: true,
  url: 'https://github.com/open-gsd/gsd-core.git',
  head_sha: extMeas.head_sha, commit_count: extMeas.commit_count, adr_count: extMeas.adr_count,
  intent_docs: extMeas.intent_docs, fact_count: extMeas.fact_count,
  tc1: { verdict: extMeas.tc1.verdict, judgeable_n: extMeas.tc1.judgeable_n, ratio_4: extMeas.tc1.ratio_4 },
  tc2: { verdict: extMeas.tc2.verdict, mean_ratio_4: extMeas.tc2.mean_ratio_4, missing_ratio_4: extMeas.tc2.missing_ratio_4, cond_a: extMeas.tc2.cond_a, cond_b: extMeas.tc2.cond_b },
  tc3: { verdict: extMeas.tc3.verdict, lowest_ratio_4: extMeas.tc3.lowest_ratio_4 },
  nc1: { pass: extMeas.nc1.pass, path: extMeas.nc1.path },
  overall: extT.verdicts.overall, receipt: extT.receipt
});

const ext = rows[3];
const comparison = {
  ticket: 40,
  a_xxx: 'A-045',
  generated_at: new Date().toISOString(),
  scale: 'Macro-B',
  probe_internal: 'reports/39-macro-b-one-shot.mjs（三仓基线，#39 / A-044）',
  probe_external: 'reports/40-macro-b-one-shot.mjs（外部仓，=39 同构复用，管线/判据/阈值零改动）',
  intake_path: 'engine/dist/cli.js repo add <url> --cache reports/40-clone-cache（URL opt-in → 隔离缓存 → 全深度 → 浅拒 → 禁远程配置执行 → 本地管线）',
  dogfooding_boundary: 'env-manager/anysearch-cli/jiahao 三仓与产品同主——dogfooding = generative not evaluative（D-033），其数据仅作校准基线，不构成泛化证据；gsd-core 为首条独立泛化证据',
  targets: rows,
  observations: [
    '事实量：外部仓 1424 条（92 ADR / 5887 commits），位于基线区间（276~1101）之上——管线在更大语料面上不失真',
    'TC-1：外部仓 judgeable_n=92 ≥ min_n=5（基线 2/13/33）——TC-1 可判定且 NOT_RED（事后补写占比 0.0000）；desk-task2 满足判据达成',
    'TC-2：外部仓 RED，但驱动面不同——mean_ratio_4=0.7478 高于基线 anysearch-cli（0.7385 缺失率背景）；cond_a=false，cond_b 由 Status 缺失率 0.9783 触发；而 Context/Decision/Consequences 缺失率仅 0.163/0.076/0.044——RED 主成分为 v2 回退链未覆盖「- **Field:**」dash+加粗头部形态导致的 Status 漏认（可归属原因候选），非五件套真实缺失',
    'TC-3：外部仓 GREEN（最低 0.8000，CONTEXT.md 1.0000 / README.md 0.8000）——定位采集面对外部意图文档直接可用',
    'PC-1/PC-2/NC-1 正/负对照在外部仓全部 PASS——管线健康与特异性在外部输入下保持',
    '综合裁定 unsupported（TC-2 RED 传播）——与 anysearch-cli 同为 unsupported 但归因不同：anysearch-cli 为 Status 头真实缺失率 0.7385，gsd-core 为 dash+加粗形态漏认——跨仓对照揭示「同一 RED 不同可归属原因」须入 lessons'
  ],
  fallback_leg_note: 'v2 四腿（dash→inline→inline-iso→git）：gsd-core Status 行形态「- **Status:** Accepted」先被 dash 正则挡下（^-\\s*field:）再被 inline 拒绝（行首非字段名），四腿均漏认——v2 冻结于 27-prereg，缺口如实记录待 v3 腿预注册'
};

writeFileSync(join(HERE, '40-external-comparison.json'), JSON.stringify(comparison, null, 2) + '\n', 'utf8');
console.log('written 40-external-comparison.json; rows=' + rows.length + '; ext=' + JSON.stringify({ facts: ext.fact_count, overall: ext.overall, tc2: ext.tc2.verdict }));
