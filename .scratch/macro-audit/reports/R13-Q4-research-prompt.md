# R13-Q4 调研题面 — repomix/gitingest 打包层去留：预设件 vs 现架构需求重估

> 轮 13 grill Q4。提交 atomcode 深度调研。

## 本地回顾义务（先读后答）

先阅读本仓库（D:\Aworker\6F）以下材料再作答：

1. `.scratch/macro-audit/decision-ledger.md` — 全部 status 含 current 的记录（现 49 条，本轮已新增 D-053/D-054/D-055）；
2. `docs/adr/` — 全部 21 件 ADR，重点 0014（上游防腐/逐面契约）、0016（分发=纯 Agent Plugins 生态）、0018（版本编年纪律+锁表制度）；
3. `CONTEXT.md` — 词面；
4. `engine/upstream-lock.yaml` — repomix-gitingest planned 行（cli-or-pip，拉动票=#42 上游队列）及锁表纪律注释；
5. `engine/src/upstream/github-rest.ts`＋`engine/src/upstream/codelore.ts` — 现有上游适配形态参照；
6. `.code-tmp/research.md` §7.2/§7.3 — 打包层原预设语义（全仓+历史打包喂大上下文 LLM 叙事层）；
7. `.scratch/architecture-recovery/BACKLOG.md` #42 行 — 上游队列探针现状。

## 待裁定问题

原预设：打包层=repomix/gitingest，用途=「全仓+历史打包成 LLM 友好文本喂叙事层」。

架构演进（本轮已裁定 D-053）：叙事面=宿主 agent 经 MCP 读 facts＋直读 repo 文件面；且 ADR-0016 立法「分发=纯 Agent Plugins 生态」——本产品消费端按定义恒为 agent 宿主，「无 agent 面、需打包 repo 文本喂外部 LLM」场景在架构上结构性缺席。

候选：

- (a) 退役：锁表行 planned→retired（retired 行不删、provenance 可反查）；理由=原用途被「宿主 agent 恒在」抽空；
- (b) 保留 planned＋拉动判据写死：如「Macro-A 跨仓打包／审计证据导出场景出现再拉」；
- (c) 立票接入：无拉动需求；
- (d) 改用途再留：转「审计证据打包导出」面——新用途须另立需求票据。

## 调研要求

重点调研工业界成熟落地的心智模型：repomix/gitingest 类产品在「agentic 审计/评审管线」中的真实用法分布（喂 LLM vs 喂 CI vs 证据打包）；「宿主 agent 恒在」前提下打包层的存续先例；上游依赖/组件的退役（deprecation/retirement）治理惯例——何时退役优于保留期权；「审计证据导出包」作为独立需求面的先例（报告附件/外发证据包形态）。

输出：推荐选项＋理由；各候选的已知失败模式；与本仓 current 决策的冲突点排查——若冲突必须点名 D-xxx/ADR-xxxx，不许静默改向。