# R13-Q5 调研题面 — 原预设余项清算（四个小项逐条处置）

> 轮 13 grill Q5。提交 atomcode 深度调研。

## 本地回顾义务（先读后答）

先阅读本仓库（D:\Aworker\6F）以下材料再作答：

1. `.scratch/macro-audit/decision-ledger.md` — 全部 status 含 current 的记录（本轮已新增 D-053~D-056）；
2. `docs/adr/` — 全部 21 件 ADR，重点 0001（五尺度）、0005（HoF-FA）、0013（三层验收）、0014（上游防腐）、0016（纯 Agent Plugins 分发）；
3. `CONTEXT.md` — Sufficiency Gate／Trigger-gated Closure／Macro-A/Micro-B 词条；
4. `.code-tmp/research.md` §6（codelore issue 草稿）／§7.2 BOM#6（anysearch-cli kernel 迁移）／§4（κ 校准飞轮、GapRequest reround）；
5. `engine/src/report/generate.ts` — checkAllCitations／evidence_threshold_met 实物面；
6. `.scratch/architecture-recovery/reports/33-gate-registry.json` — 值守/触发器登记实物面；
7. `engine/src/upstream/codelore.ts` — explain --llm 面实物。

## 待裁定问题（四小项，逐项给裁定）

**① §6 codelore issue 外联草稿**：research.md §6 草拟了一份给 codelore 作者的 issue（索取其叙事层 --llm 质量数据），未发。D-053 后我方叙事面=宿主 agent 生成＋自研 citation 盖章；codelore explain --llm 仅是 env 门控的可选 advisory 面。候选：(a) 销项（登记理由：对我方决策面无拉动；codelore 叙事面日后升级为重要输入再发）／(b) 照发（用户侧外联动作）／(c) 暂缓挂 manual_watch。

**② 叙事质量评测面时点**：原预设可选自研项（SWR-Bench 式／grounded stamp 准确率／κ 校准飞轮）。D-053 落地后叙事层才有被评测对象。候选：(a) 登记暂缓面（manual_watch：#50 落地、叙事实物出现后另立票）／(b) 随 #50 内嵌／(c) 永不评。

**③ anysearch-cli kernel 迁移封口**：原预设 BOM#6=迁移 anysearch-cli 编排语义。现状=语义已吸收（sufficiency/gap/claim 归因→裁决协议＋checkAllCitations＋evidence_threshold_met），代码零迁移（自研 TS 已超前移植成本）。候选：(a) 确认封口（登记「语义吸收≠代码迁移」正式核销 BOM#6）／(b) 仍要求代码级迁移。

**④ sufficiency 补查回路归属**：原预设 GapRequest reround=报告缺口检测→自动补查轮。实物核验：kernel 只有 evidence_threshold_met 判定，无自动补查回路。候选：(a) 归宿主 agent（rubric/strategy-questions.md 写「证据不足→经 MCP 补查」程序，kernel 只判 insufficient）／(b) kernel 建自动 reround 回路／(c) 暂缓。

## 调研要求

重点调研工业界成熟落地的心智模型：上游开源项目的 issue 外联时机惯例（何时该发何时销项）；LLM-as-judge/叙事质量评测面在 agentic 管线中的立票时点（先物后尺还是先尺后物——SWE-bench/RAGAS/DeepEval 等评测框架的使用模式）；「语义吸收≠代码迁移」的架构治理先例（strangler fig/防腐层下何时放弃移植）；agentic 审计管线中 gap-detection→re-query 回路归属 agent 还是 kernel 的工业先例（DeepResearch/Deep-Research-Framework 的重检索回路、agentic RAG 的 query rewriting 归属）。

输出：四小项各给推荐＋理由；各候选的已知失败模式；与本仓 current 决策的冲突点排查——若冲突必须点名 D-xxx/ADR-xxxx，不许静默改向。