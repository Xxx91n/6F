# R15-Q5 调研题面 — 轮14余项清算（L1 审计件分支处置＋L2 golden/verifier 解耦）

## 上下文（本仓实况，调研须先回顾）
- 产品=宏观+微观工程内容审计 Agent Plugin（ADR-0001~0021；CONTEXT.md 59 词；decision-ledger.md 62 条：56 current/5 revised/1 closed）；
- **必读**：decision-ledger 全部 current 记录（重点 D-038 fixture/真实仓双通道口径、D-041 manual_watch 三态、D-037 golden 护航、D-059⑨ bundle 退役触发器＋duckdb 值守、D-060 audit 票面对照物纪律「39/40 仅仓内 CI 消费不随 tgz 分发」）；ADR-0017/0018；CONTEXT 词条（Demo Fixture/Trigger Sequence/Watch Tri-state）；
- **L1**：轮14审计产物（两份报告＋两个 handoff）在 r14-audit-findings 分支未合 main；handoff（.scratch/macro-audit/handoffs/2026-09-17-r14-loop2-pass-handoff.md）原文双口径候选=「有权窗口起 PR 合入」vs「审计件分支留档口径」；push/合 PR=用户闸门；本仓 .scratch/ 目录=调研与审计档案面（非产品交付面），npm pack 分发视野问题须对照 D-038 双通道口径评估；
- **L2**：守卫重跑（.scratch/architecture-recovery/reports/NN-check.mjs 族）重写 golden 工件致脏树（receipt/trace 锚全换），处置=discard 归位；handoff 判「非阻塞、可考虑立项解耦」；frozen bundle 退役触发器已登记（D-059⑨，锚=Macro-B GA clean-commit baseline 替换）。

## 选项
① L1 分支处置：(a) 起 PR 合 main（须授权窗口，本轮仅登记意向）／(b) 审计件留档分支口径登记（分支=审计档案面不合 main）／(c) 缓挂；
② L2 解耦：(a) 立票排队（BACKLOG 尾部非阻塞）／(b) 登记观察项（manual_watch：脏树复现≥3 次→立票）／(c) 并入 D-059⑨ bundle 退役触发器同项管理。

## 调研问题
1. 审计/调研产物版本化的工业惯例：compliance/audit evidence artifacts 该进 main 还是留档分支/artifact store？「reproducible evidence」与「repo 分发面」分界的成熟做法（SLSA provenance、audit trail 归档惯例）；
2. golden/snapshot 测试工件与 verifier 耦合的工业处置：jest snapshot、goldens、receipt-anchored 工件「rerun 重写致脏」的成熟解法（--update 显式旗标、CI-only 重算、工件出仓到 artifact store、写前 hash 比对只在变更时落盘）；
3. manual_watch 观察项 vs 立票的判据惯例：「问题出现 N 次才立票」的阈值设定有无成熟心智（SRE toil 口径、bug triage frequency thresholds）；
4. 候选组合逐条裁定＋已知失败模式；
5. **冲突排查**：逐条点名与本仓 current 决策有无冲突（重点 D-038 双通道、D-059⑨、manual_watch 词表纪律）；冲突→给 revised 方案。**不许改文件，只给调研报告**。

## 报告结构（严格）
1) 执行摘要：①②各推荐选项＋置信度；2) 分点结论；3) 对比矩阵；4) 落盘要素清单；5) 各候选已知失败模式；6) 与本仓 current 决策冲突排查；7) 完整来源清单；8) 信息缺口。