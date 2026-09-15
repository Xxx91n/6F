// make-40-script.mjs — 由 39-macro-b-one-shot.mjs 生成 40-macro-b-one-shot.mjs（一次性生成器，产物即证据）
import { readFileSync, writeFileSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import { dirname, join } from 'node:path';

const HERE = dirname(fileURLToPath(import.meta.url));
const SRC = join(HERE, '39-macro-b-one-shot.mjs');
const DST = join(HERE, '40-macro-b-one-shot.mjs');
let s = readFileSync(SRC, 'utf8');
function rep(a, b) {
  if (s.indexOf(a) < 0) { throw new Error('REP-MISS: ' + a.slice(0, 60)); }
  s = s.replace(a, b);
}

// 1. header（前 9 行整段替换）
const hdr = s.split('\n').slice(0, 9).join('\n');
const newHdr = [
  '// 40-macro-b-one-shot.mjs — Macro-B（已上架层）外部公开仓 URL opt-in 泛化验证（#40 / A-045 / R5-09 / spec §R5-D9）',
  '// 复用说明：本文件 = 39-macro-b-one-shot.mjs 同构复用——采集/裁决/报告管线与预声明阈值零改动；',
  '//   差异仅：默认目标=外部仓 clone 缓存、产物命名 40-*、披露块 calibration_scope=外部仓、条目 id 前缀 40-。',
  '// 用法：',
  '//   node 40-macro-b-one-shot.mjs                                          # 默认外部仓（open-gsd/gsd-core @ 40-clone-cache）',
  '//   node 40-macro-b-one-shot.mjs --repo gsd-core --root <abs> --out <dir>   # 显式单仓形态',
  '// 链 = URL opt-in intake（engine intake repo add：隔离缓存+全深度+浅拒+禁远程配置执行）',
  '//   → 采集（gitlog + adr-structure@v2 + positioning）→ fact（40-*-facts.jsonl + 共享 40-audit-facts.duckdb）',
  '//   → 裁决（PC-1/PC-2 正对照 + TC-1/2/3 真判据 + NC-1 负对照，阈值=22-criteria-pre-registration.md）→ 报告。',
  '// 纪律：被测仓只读（git 只读子命令 + 文件读，绝不写）；唯一写动作 = --out 目录 40-* 工件。'
].join('\n');
s = s.replace(hdr, newHdr);

// 2. imports + DEFAULT_REPOS
rep("import { execFileSync } from 'node:child_process';",
    "import { execFileSync } from 'node:child_process';\nimport { createHash } from 'node:crypto';");
rep(/const DEFAULT_REPOS = \[[\s\S]*?\];/.exec(s)[0],
    "const EXT_URL = 'https://github.com/open-gsd/gsd-core.git';\n" +
    "const EXT_CACHE_KEY = createHash('sha256').update(EXT_URL).digest('hex').slice(0, 16);\n" +
    "const DEFAULT_REPOS = [\n" +
    "  { repo: 'gsd-core', root: join(HERE, '40-clone-cache', 'repos', EXT_CACHE_KEY) }\n" +
    "];");

// 3. artifact naming 39→40（先做，避免后续 id 替换重复命中）
s = s.split('39-macro-b-').join('40-macro-b-');
s = s.split('39-audit-facts.duckdb').join('40-audit-facts.duckdb');

// 4. id prefixes / runId / fixture names / log prefix / audit_ref
s = s.split('EV-39-').join('EV-40-');
s = s.split('CL-39-').join('CL-40-');
s = s.split('R-39-').join('R-40-');
s = s.split('MA-39-').join('MA-40-');
s = s.split("runId: 'r39-'").join("runId: 'r40-'");
s = s.split('fixtures/39-').join('fixtures/40-');
s = s.split("'[39] '").join("'[40] '");

// 5. EV-07 ledger anchor → D-033 外部仓条款
rep("addEvidence('EV-40-' + R + '-07', '.scratch/macro-audit/decision-ledger.md', 'Macro-B 已上架层立即对三仓各跑一次 one-shot', 'D-033②：Macro-B 已上架层对三仓各跑一次 one-shot 泛化验证；jiahao 挂持续回归', 'git -C ' + REPO + ' show HEAD:.scratch/macro-audit/decision-ledger.md', REPO);",
    "addEvidence('EV-40-' + R + '-07', '.scratch/macro-audit/decision-ledger.md', '非自有公开仓', 'D-033：泛化验证必须引 ≥1 非自有公开仓（D-013 URL opt-in 首实用户）= Macro-B GA 前置条件', 'git -C ' + REPO + ' show HEAD:.scratch/macro-audit/decision-ledger.md', REPO);");
rep("addClaim('CL-40-' + R + '-06', 'EV-40-' + R + '-07', ['Macro-B 已上架层立即对三仓各跑一次 one-shot']);",
    "addClaim('CL-40-' + R + '-06', 'EV-40-' + R + '-07', ['非自有公开仓']);");

// 6. recommendations → #40 适配
const recs = /const recommendations = \[[\s\S]*?\];\n/.exec(s)[0];
const newRecs = "const recommendations = [\n" +
"    { rec_id: 'R-40-' + R + '-1', priority: 'P1', action: 'adr-structure v2 回退链补「- **Field:**」（dash+加粗）头部腿——本仓 Status 缺失读数主要为 detector 漏认（可归属原因候选），v3 腿须先预注册判据再改 detector（27-prereg 纪律，v2 禁改）', rationale: 'gsd-core 92 份 ADR 头部统一为 dash+加粗形态，v2 四腿（dash/inline/inline-iso/git）未覆盖 → Status 缺失率主成分为漏认；外部仓泛化暴露的首个覆盖缺口', expected_impact: 'TC-2 字段缺失读数区分「真缺失 vs 漏认」，跨仓可比性恢复', effort: 'M', verdict_gate_stamp: G.ADJUDICATION_PROTOCOL_VERSION + ' / ' + strategyBand, evidence_refs: ['EV-40-' + R + '-03'], degraded_note: null },\n" +
"    { rec_id: 'R-40-' + R + '-2', priority: 'P2', action: 'first-external-repo 事件 occurred 落账：desk-task2 判据达成（TC-1 judgeable≥min_n 5）→ triggered-bound；desk-task15 判据属 Micro-A（未上架层）→ 值守通道呈报', rationale: 'URL opt-in 首实用户落地（D-013），registry 绑定项按登记处置不静默', expected_impact: 'Macro-B GA 前置条件达成；挂门值守状态机推进', effort: 'S', verdict_gate_stamp: G.ADJUDICATION_PROTOCOL_VERSION + ' / ' + strategyBand, evidence_refs: ['EV-40-' + R + '-07'], degraded_note: null }\n" +
"  ];\n";
s = s.replace(recs, newRecs);

// 7. preview_disclosure → 外部仓校准面
const pd = /preview_disclosure: \{[\s\S]*?not_in_preview: \[[^\]]*\]\s*\n\s*\},/.exec(s)[0];
const newPd = "preview_disclosure: {\n" +
"      capability_label: 'capability 1 of 5 · preview',\n" +
"      calibration_scope: '外部公开仓 URL opt-in 泛化验证（open-gsd/gsd-core，非自有公开仓——D-013 首实用户）',\n" +
"      structural_limitations: [\n" +
"        '单仓泛化证据：本报告为首个非自有仓 one-shot（n=1）——满足 D-033「≥1 外部仓」下限，不构成外部仓形态全覆盖',\n" +
"        'structure/behavior/supply_chain 象限 not_applicable：Macro-B 已上架采集面仅 strategy（S1+S2）；供应链象限 ⚠ 数据未接（D-034③）',\n" +
"        'TC-2 读数含 detector 漏认成分：gsd-core ADR 头部为「- **Field:**」（dash+加粗混排）形态，v2 回退链未覆盖——Status 缺失读数主要为漏认而非真实缺失（可归属原因候选，待 v3 腿预注册）',\n" +
"        'one-shot 度量 = 反复接受非跑通：TC 三档裁定（supported/unsupported/insufficient）如实落数，不为跑通而跑通'\n" +
"      ],\n" +
"      not_in_preview: ['Micro-A', 'Micro-B', 'Macro-A']\n" +
"    },";
s = s.replace(pd, newPd);

// 8. summary 元数据
rep("probe: '40-macro-b-one-shot.mjs',", "probe: '40-macro-b-one-shot.mjs',"); // 已由命名替换命中，存在性断言
rep('ticket: 39,', 'ticket: 40,');
rep("a_xxx: 'A-044'", "a_xxx: 'A-045'");
rep('三仓 Macro-B 事实同一 audit_fact 表、同一 appendFact 写路径（单写者串行追加）；供 mw self-probe 与后续层对照',
    '外部仓 Macro-B 事实同一 audit_fact 表、同一 appendFact 写路径（单写者串行追加）；与 #39 三仓基线同路径，供泛化对照');

writeFileSync(DST, s, 'utf8');
const back = readFileSync(DST, 'utf8');
const residual = (s.match(/39-macro-b|39-audit-facts|EV-39-|CL-39-|R-39-|MA-39-|r39-|\[39\]/g) || []).length;
console.log('written ' + DST + ' ' + back.length + ' bytes; BOM=' + (back.charCodeAt(0) === 0xFEFF) + '; residual-39-refs=' + residual);
