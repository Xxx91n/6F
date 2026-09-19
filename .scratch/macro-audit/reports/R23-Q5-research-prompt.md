# R23-Q5 atomcode 调研题面——映射表落点：docs/ 独立文档 vs 并入 quadrant-rubric

## 问题

本仓 upstream→dimension 映射表（docs/upstream-dimension-map.md v0.1→v1.0 定稿流程，D-078/D-080/D-081/D-082 已裁骨架/接线/review 行/Bot 行）的追问留票项「落点 vs quadrant-rubric 并面」待裁。

两文件实物：

- **quadrant-rubric.md**（engine/skills/macro-audit/references/，21 行 v0.1）：D-053② 落地件——「宿主 agent 为战略象限写叙事段时加载」的 skill references；定位=spec.md §D-004＋CONTEXT S1-S5 词条的**文书化投影**（不新增判据语义、不设新阈值）；红线=「只供叙事组织证据；判据数值不得出现在叙事段 band 断言里」（band 归 C 层人裁定 ADR-0013/D-026）；加载条件=仅战略象限叙事段；内容=「判什么／证据源／初版参数／回退」速查＋叙事组织规则；
- **upstream-dimension-map.md**（docs/，46 行 v0.1）：D-078 落地件——upstream fact→(dimension，准入条件） **接线契约**；消费者=kernel 接线票（COLLECTOR_DESCRIPTORS 注册＋Macro-B 消费归位）＋NN-check 对账守卫；版本化走 PR 评审；含准入条件列（LFX 式逐维出入）、永久排除列、event_bound pending 行。

关键层级事实：五层盒（ADR-0008）层③=skill 壳方法论（agent 概率性消费），层①=kernel 确定性 CLI（裁决消费）；D-058 Kernel/Agent 职责边界总则=确定性归 kernel／概率性编排归 agent；D-012③ skill 壳只读隔离（壳内文件给 agent 读的方法论投影，kernel 依赖壳内=隔离方向反转）。

问题：映射表保持 docs/ 独立（＋双向指针）还是并入/移入 rubric 面？

## 候选

(a) 保持 docs/ 独立＋双向指针终裁：映射表头注明职责边界（判据语义本体=spec/CONTEXT；叙事组织投影=rubric；本表=接线契约）；rubric 加一行指针；
(b) 并入 rubric（references/ 内新段）：维度语义单文件化——但层③变裁决输入面／agent 叙事加载接线判据／kernel 依赖壳内文件三边界破；
(c) 移入 references/ 独立文件：kernel 依赖 agent 资源目录，分发面把接线契约当 skill 资产打包方向反；
(d) 拆两份：叙事投影进 rubric＋接线契约留 docs/——同一内容双写双漂 NN-check 守两处；
(e) 他径。

## 必回顾（硬要求）

1. 决策账本全部 current：D:\Aworker\6F\.scratch\macro-audit\decision-ledger.md（重点 **D-053** rubric 三件落地+红线「叙事不得携带裁决 band」／**D-058** Kernel/Agent 职责边界总则／**D-012** skill 壳只读隔离（revised 但五层盒条款由 D-026 承继）／**D-080** 消费机制=文档单源真值+映射常量+对账守卫／**D-078** 映射表落点原文／**D-054/D-047** 切片归属）；
2. ADR：D:\Aworker\6F\docs\adr\0001-0021（0008 五层盒／0013 三层验收 band 归 C 层／0014 防腐界）；
3. CONTEXT.md：D:\Aworker\6F\CONTEXT.md（Kernel/Agent 职责边界词条／Strategic Quadrant）；
4. 实物：engine\skills\macro-audit\references\quadrant-rubric.md 全文＋docs\upstream-dimension-map.md 全文＋engine\skills\macro-audit\SKILL.md 加载条件段；
5. **工业界成熟心智模型（重点）**：单源真值文档分层放置先例（spec/contract doc vs runtime/agent-facing reference 分层的成熟模型——如 OpenAPI contract 与 consumer guide 分置、ADR 与 runbook 分置、Kubernetes API conventions vs kubectl docs）；「契约文件放决策层、投影/速查放消费层」的成熟做法；单一职责文档原则（一文一职 vs 合并漂移风险）；Anthropic skill references 官方最佳实践对「给 agent 读的参考文件放什么不放什么」的指引（references 加载条件纪律）；semantic contract 被概率消费面读取的注入/污染风险先例；文档归属的 Conway 映射（谁消费谁持有）；
6. 给出推荐与理由＋失败模式＋落地形态（双向指针具体措辞草案）；
7. 显式核查与本仓 current 决策冲突面（D-053 红线／D-058 总则／D-012③ 隔离）。

## 交付

结构化 Markdown：①结论；②逐候选裁定；③工业先例证据（带 URL）；④落地形态设计（双向指针措辞草案）；⑤失败模式与治理；⑥冲突核查逐条 D-xxx；⑦信息缺口；⑧建议追问。
