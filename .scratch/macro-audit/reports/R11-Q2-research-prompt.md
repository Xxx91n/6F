# R11-Q2 — atomcode 深度调研 prompt（Micro-A preview 铺开票定义 / 层 preview 完成形态）

> 纪律：本仓唯一数据源 = D:\Aworker\6F\.scratch\macro-audit\decision-ledger.md；结论与任何 current 决策冲突时必须显式列出，禁止静默改向。

## 一、背景（本仓现状，调研前必读本地实物）

本仓 D:/Aworker/6F =「宏观+微观工程内容审计产品」单仓（工程+spec）。调研前请用只读方式完整回顾：

- D:\Aworker\6F\.scratch\macro-audit\decision-ledger.md —— 48 条记录中 41 条 current（重点：D-024 两字段纪律；D-026/D-027 用户闸门；D-032 演示双件 DoD（每能力层 happy+failure 演示件为 preview 准入件）；D-033 试点仓指派＋「PR 层试点不得指派无托管 PR 面的仓」硬约束；D-034② 层序 Micro-A 第三；D-038 demo fixture 体系（确定性合成 git 仓，不冒充真实审计）；D-043 判据意图读法；D-047 试点集 {env-manager,jiahao}；D-048 #47 托管平台 API 适配器立案=REST 主路+gh 可选回退+凭据三级探测）。
- D:\Aworker\6F\docs\adr\ 19 篇（重点：0006 共享骨架+scale 切片；0013 三层验收闸门+预声明判据；0017 Preview 分级发布「preview 层自成完整价值单元」；0019 SWMR）。
- D:\Aworker\6F\CONTEXT.md 57 词（重点：Micro-A PR-Level Diff Audit、Shared Skeleton、Scale Slice、Evidence/Sufficiency Gate、Failure Semantics、Demo Fixture、Dual Reporting）。
- 层 preview 先例实物：#38 Macro-C preview（A-043 闭环：全链实跑→报告双件 happy 骨架+披露块／failure ⚠unverified+降级注释→单仓校准结构性限制披露）；#39 Macro-B 三仓 one-shot（A-044：反复接受非跑通如实落数 unsupported 也是有效结果）。
- 试点面实测：D:\Aworker\6F\.scratch\macro-audit\reports\micro-a-preview-pr-surface-audit.md（env-manager 62 PR：dependabot 37+release-please 9 机器形态 74%；jiahao 7 全人全 merged）；37-pilot-measurements 口径（anysearch-cli 托管面=remote-only 无 PR 面）。
- 值守面：registry desk-task15 判据=「≥1 条 Micro-A 真实 PR 报告产出且字段清单满足骨架交集」，trigger_event=micro-a-preview-prep（occurred=false）。

## 二、本次触发问题（轮 11 grill Q2）

#47（适配器）立案后，Micro-A preview 铺开票（拟 #48）如何定义？候选形态：

- (a) 单票铺开：#48=适配器消费侧管道（PR intake→facts→共享骨架 Micro-A 切片渲染）＋双仓试点实跑（env-manager 三形态各≥1：dependabot/release-please/人类；jiahao ≥1 全人基线）＋报告双件（happy=真实试点报告；failure=无托管面仓跑 Micro-A 的诚实拒绝路径，anysearch-cli 可作负例）＋披露三件套（preview 标注/同主确认偏差/「平台声明 Bot 身份」措辞）——一口气闭环 desk-task15＋micro-a-preview-prep 事件；
- (b) 拆两票：#48=管道面（golden 驱动）；#49=试点实跑+报告件+封口；
- (c) 最小探针先行：env-manager 单 PR thin slice，报告件后补。

## 三、调研产出要求

结合工业界成熟落地的心智模型（重点：preview/GA 分级发布的完成定义惯例、developer-tool 报告「层自成完整价值单元」判据、试点选取三形态覆盖判据、failure-path 演示件形态的成熟先例、PR 级审计工具的公开形态），回答：

1. 推荐哪种票面形态（含理由与置信度）；
2. 若 (a)：PR 选取判据的最小充分集（三形态各≥1 是否够？样本量惯例）；failure 演示件最佳形态（无托管面诚实拒绝 vs token 缺席降级 vs 其他）；
3. desk-task15 判据「字段清单满足骨架交集」在本票的落地验证方式（golden？字段断言？）；
4. 与本仓 current 决策的任何冲突点（显式列出）；
5. 风险与诚实披露点。

给出推荐与理由，标注置信度与来源层级。
