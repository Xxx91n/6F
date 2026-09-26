# R36-Q2 调研题面（atomcode）

仓库 D:AworkerF 是 spec-level 工程内容审计产品。守卫体系=.scratch/architecture-recovery/reports/ 下 58 件 NN-check.mjs 自研断言脚本（单件实测 ~100ms-45s，全量扫 ~179s）。R35 收口立 D-144①「收口工序前置核对」含「收口前跑守卫组」一行，但「守卫组」无定义、无统一 runner、无枚举集——且全量实测发现 58 件中 13 件此刻静默红（冻龄面钉「冻结零改动」26/28/30、任务书措辞钉 25、词表/枚举漂移 35/20、外部语料 ADR 计数漂移 37/38、内部锚漂移 54、模块断链 23 quarantine.js ERR_MODULE_NOT_FOUND、超时 45、41a-D7 编年随行钉系 grill 中途合法红）。静默红成分谱恰是 T3（#75批1）「字面钉普查」的首次全量画像。

## 问题

「收口前跑守卫组」界定裁——现状下该行按字面不可执行（跑了判不过/挑跑=选择歧义复辟税源）。候选：
(a) 收口面枚举集——守卫组=「钉收口产出面且常态绿」明示清单（41a 编年账本族＋33 registry＋任务书钉族等文档钉面精排，全绿判据），13 红件挂 T3 普查不挡收口；
(b) 全量＋manifest 终态——等 T3 普查产出 known-red manifest，守卫组=58 件全跑＋红集⊆manifest 判据，语义最干净但收口规程空窗至 T3 落地；
(c) 两阶段——今采 (a) 止血＋T3 普查落地后升格 (b)，代价=枚举清单维护到升格日；
(d) 触碰面最小集——「跑本轮触碰面所钉守卫」，承诺最小但每轮重开选择歧义。

## 调研要求

1. 回顾 D:AworkerF.scratchmacro-auditdecision-ledger.md 全部 current 记录（重点 D-144①~④ 复绿税双层组合、D-071④/D-073 XFAIL cap+sealed+分拣建制、D-139 独立 commit 纪律、D-135 票面纪律、D-070 随触碰顺带、D-146 四档摄入分诊、D-148 Accepted-Risk 三要素与 grandfather 生效时点规约、守卫断言/棘轮/字面钉相关条款），docs/adr/（0013 三层验收、0018 编年纪律、0022 Quarantine），CONTEXT.md（Watch Tri-state、评审快照分诊、Trigger-gated Closure）；
2. 工业界成熟落地的心智模型（重点）：大型 monorepo/成熟项目中「全量测试 vs 影响域测试选择」（affected/test-selection vs run-all 的成本权衡与先例——Bazel affected-targets/Nx affected/Turbo repo 心智模型）、quarantine/expected-failure 机制的成熟形态（known-failure manifest/flaky-test quarantine 清单——Chromium/Mozilla/大型 OSS 的 XFAIL 管理惯例）、pre-merge gate 的子集界定惯例（pre-commit fast checks vs CI full suite 分层）、断言fleet 冻龄腐烂（stale/brittle assertion 自然衰亡）的处置先例、守卫静默红的「无牙化」风险文献；
3. 给出推荐与理由，显式指出与账本任一 current 决策的冲突点（若有——冲突则该 D-xxx 需标 revised 并呈报新决策，禁止静默改向）。
