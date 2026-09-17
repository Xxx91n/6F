# R13-Q2 调研题面 — 四象限名实落差：structure/behavior/supply-chain 三象限补齐的拉动判据与时点

> 轮 13 grill Q2。提交 atomcode 深度调研。

## 本地回顾义务（先读后答）

先阅读本仓库（D:\Aworker\6F）以下材料再作答：

1. `.scratch/macro-audit/decision-ledger.md` — 全部 status 含 current 的记录（现 47 条）；
2. `docs/adr/` — 全部 21 件 ADR，重点 0001（五尺度）、0004（战略象限五维 S1-S5）、0006（骨架+切片）、0014（上游防腐）、0015（量测有效性优先）、0017（preview 模型）；
3. `CONTEXT.md` — 词面（重点 Strategic Quadrant S1-S5、Hotspot、四象限相关词）；
4. `engine/src/collect/collectors.ts` — 现有采集器实物（adr-structure@v1/v2=S2、positioning@v1=S1、gitlog@v1）；
5. `engine/src/upstream/codelore.ts` — codelore 30 契约面（evolution 12＋S3族 6＋S5族 12）接入形态；
6. `engine/src/demo/demo.ts` — 四象限输出面（strategy native；structure/behavior/supply_chain=not_applicable＋披露）；
7. `.code-tmp/research.md` 与 `.code-tmp/memory.md` — 立项期调研档案（四象限原始定义）；
8. `.scratch/architecture-recovery/BACKLOG.md` — #35（codelore 30 面契约先例）/#39（Macro-B 三仓）/#42（上游队列）票面。

## 待裁定问题

原预设：四象限组合评审=结构／行为／供应链／战略（research.md §1.3/§7.2），CodeLore 的核心卖点=结构×行为融合（hotspot/churn/耦合/知识分布/复杂度）。

现状：Macro-B 已上架采集面仅 strategy 象限（S1 positioning＋S2 adr-structure 自研采集器）；structure/behavior/supply_chain 三象限在报告中一律 not_applicable＋conflict_markers 诚实披露（demo 与 #39/#40 实跑同口径）。codelore 适配器已契约化 ~30 面但全部接往 S3/S5 战略维＋Macro-C 演化主干——原预设里 codelore 本行（structure/behavior 象限饲料）未接。SKILL.md description 宣称「四象限评审（结构/行为/供应链/战略）」与实收面存在名实落差。

候选：

- (a) 立票补齐：codelore 结构×行为面（hotspot/churn/复杂度/耦合）接 structure/behavior 象限，复用 #35 契约模式逐面 golden；supply-chain 维持 Scorecard 排队；
- (b) 并入叙事票（D-053 拟 #50）：rubric＋MCP＋三象限采集面一票全补；
- (c) 维持 stage1：strategy-only＋诚实 not_applicable 披露至 Macro-B GA 判据点，「四象限齐」写成 GA 准入判据；
- (d) 折中：先立票只接 behavior（churn/hotspot——codelore 最强面、面试官视角核心面），structure/supply 续排队；SKILL.md 宣称面同步收窄措辞。

## 调研要求

重点调研工业界成熟落地的心智模型：code-maat/CodeScene 系行为考古（hotspot=churn×complexity）在 AI 审计产品中的接入粒度与象限归位惯例；「四象限组合评审」类产品的象限齐备判据（什么算 quadrant covered）；能力披露/能力矩阵的诚实标注惯例（preview 产品宣称 vs 实收面落差如何处理）；技术债/审计工具中「先战略后结构」vs「先结构后战略」的建设顺序先例与失败模式。

输出：推荐选项＋理由；各候选的已知失败模式；与本仓 current 决策的冲突点排查——若与本仓决策冲突必须点名 D-xxx/ADR-xxxx，不许静默改向。