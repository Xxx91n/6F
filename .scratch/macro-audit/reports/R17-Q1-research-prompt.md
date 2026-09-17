# R17-Q1 调研题面 — 轮16审计发现 F1-F15 处置框架

## 上下文（本仓实况，调研须先回顾）
- 产品=宏观+微观工程内容审计 Agent Plugin（ADR-0001~0021；CONTEXT.md 60 词；decision-ledger.md 63 条：57 current/3 revised/3 承继吸收）；
- **必读**：decision-ledger 全部 current 记录（重点 D-037 golden 护航、D-053 叙事双轨、D-058 Kernel/Agent 边界、D-059 锐评九点、D-060 audit 票面、D-061 #52 拆票、D-062 Macro-A DoR、D-063 留档分支）；ADR-0009④/0013/0015/0017③；CONTEXT 词条（Failure Semantics/Trigger Sequence/Evidence Gate/Sufficiency Gate）；
- 轮16实施已闭环：#54 %cI 修复／#53 audit 一等命令／#55 P1 批票／#52a checker-eval 全部落地，九守卫全绿；审计报告=D:\Aworker\6F\.scratch\macro-audit\reports\2026-09-17-r16-audit-report.md（PASS 附条件）；
- F1-F15 实物：F1 audit.ts:24 SCALE_LAYER_ORDER 串='Micro-A→Micro-B→Macro-B→Macro-C→Macro-A（ADR-0017③ 层序）'，ADR-0017③ 原文='Macro-C→Micro-A→Micro-B→Macro-A'（乱序＋已上架层入漏斗＋误归因）；F2 audit 回执字段集 vs demo 回执（重合约 9 字段 receipt_id/head_sha/fact_count 等，差集=域差异）；F3 中段函数组已共享、两端装配样板各~100 行；F4 intra-rater κ=1.000 构造性退化（已披露）；F5 无 held-out 分区；F6 分层枚举缺矛盾/中立；F7 --out 五工件超票面；F8 新守卫无 noBom；F9 --scale 吞 token；F10 pc1AdrFacts[0] 无空值守卫；F11 evidence_threshold_met=verdict==='RED' 语义混用；F12 ADR-0009④ 枚举未含 audit<url>；F13 demo.ts 死码+Middle Man；F14 --refresh 超签名；F15 mcp facts 调试腿硬要 --db。

## 拟定处置（请辩证检验）
修 5（F1/F8/F9/F10/F15 小修复票）；勘误 7（F2/F3/F6/F7/F14 票面＋F12 ADR 行＋F4 注记）；吸收（F5→#56 票面）；缓（F13 观察项）。

## 调研问题
1. 「票面/spec 字面 vs 实现精神」偏离的成熟处置框架：spec-drift 治理中「勘误 spec」vs「返工实现」的判据惯例（ADR errata、living spec、spec-as-contract 心智）；何时字面偏离应改 spec 而非改码？
2. 失败路径崩溃 vs 诚实拒绝的审计纪律：CLI/审计工具在边界崩溃面（空数组访问 TypeError）与结构化 insufficient 判定的工业惯例（fail-closed vs graceful degradation）；
3. 回执/receipt 字段集「同源」纪律的成熟心智：API contract 中 response envelope 复用 vs per-command 字段集的惯例（JSON:API/Command 模式/event envelope）；「禁另造」应解释为「命名词同源」还是「字段集同一」？
4. 语义混用字段（evidence_threshold_met 挂错判定源）的处置：改名 vs 改判定式的惯例与兼容成本；
5. 候选 (a) 全表/(b) 改判/(c) 另裁逐条检验＋已知失败模式；
6. **冲突排查**：逐条点名与本仓 current 决策有无冲突（重点 D-060②③④①、D-061、ADR-0009④、Failure Semantics 词条）；若需 revised——给出方案。**不许改文件，只给调研报告**。

## 报告结构（严格）
1) 执行摘要：推荐＋置信度；2) F1-F15 逐点裁定表（收/勘误/吸收/缓＋理由）；3) 处置框架分点结论；4) 修复票要素清单；5) 各候选已知失败模式；6) 与本仓 current 决策冲突排查；7) 完整来源清单；8) 信息缺口。