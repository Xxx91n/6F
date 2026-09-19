# R23-Q3 atomcode 调研题面——review 覆盖行裁定：为未采集的 fact 定维度是裁定还是形式化挂起

## 问题

本仓 upstream→dimension 映射表（docs/upstream-dimension-map.md v0.1→v1.0 定稿流程中，D-078/D-080 已裁骨架与接线机制）有一行：

| github_rest.pr_metadata（review 覆盖切片） | review 覆盖 | S5 ↔ S4 | **双挂待采后裁定** |

关键事实：

- **该 fact 尚不存在**：pulls.reviews 面在 GITHUB_REST_PLANNED_SURFACES（ADR-0020 最小契约=PR 枚举+元数据+diff 双通道，review/comment 面明确 planned 不入最小集）——现在裁定维度归属=给看不见的数据形状立法；
- 维度语义（CONTEXT.md）：S4=Evolution Direction 演化方向（交付流趋势/节奏/方向），S5=Ownership Boundary Fit 所有权边界匹配（人机/协作归属与声明边界拟合）。review 覆盖（merged PR 中有 review 的比例）两可归属：作交付流程健康信号偏 S4，作协作/所有权实践证据偏 S5——但全是纸上推演无数据形状可验；
- D-035 纪律「不得裸挂」：挂起必须绑事件锚不能无锚漂浮；pulls.reviews 从 PLANNED→active 是代码面机检事件可作锚；
- 本仓事件绑定先例：registry event_bound 形制（owner/事件/验证方法/复审时点/确认留痕五要素）＋D-041 值守三态＋映射表行本身允 fact→(dimension,准入条件) 多值（D-078④）。

问题：这行怎么裁才算 v1.0 定稿？

## 候选

(a) 现在裁 S4：review 覆盖=交付流程信号与 merge lead time 同族；
(b) 现在裁 S5：review=协作/所有权实践证据与 Bot 占比同族；
(c) 双挂转正：同一 fact 永久喂两维（D-047/D-054「facts 共享、归属=切片决策」先例）；
(d) 形式化挂起：行改「面激活事件绑裁定——锚=pulls.reviews 移出 PLANNED_SURFACES 日」，事件绑定 pending 作定稿态；
(e) 他径（如：整行 declare out of bounds 移出表，面激活时再入表）。

## 必回顾（硬要求）

1. 决策账本全部 current 记录：D:\Aworker\6F\.scratch\macro-audit\decision-ledger.md（D-001~D-080：重点 **D-078** 映射行形制+双挂行原文／**D-080** 定稿流程+接线两批／**D-035** 不得裸挂+YAGNI／**D-047/D-054** facts 共享归属=切片决策／**D-041** 值守三态／**D-024** 复审两字段／**D-048** ADR-0020 最小契约 review=planned）；
2. ADR：D:\Aworker\6F\docs\adr\0001-0021（重点 0020 最小契约边界／0004 五维语义／0014 防腐界）；
3. CONTEXT.md：D:\Aworker\6F\CONTEXT.md（S4 Evolution Direction／S5 Ownership Boundary Fit 词条原文／Trigger Sequence／Evidence Gate）；
4. 实物：docs\upstream-dimension-map.md v0.1 全文＋engine\src\upstream\github-rest.ts（GITHUB_REST_PLANNED_SURFACES 枚举+pr_metadata 切片产出实况）＋engine\src\audit\macro-b.ts+audit.ts（裁决面 quadrant 消费实况）＋.scratch\architecture-recovery\reports\33-gate-registry.json（event_bound 五要素形制）；
5. **工业界成熟心智模型（重点）**：schema/registry 中「pending/unmapped 状态」的显式建模先例（CHAOSS metric→category 未分配态、SonarQube rule 未挂 quality 态、Pact provider state pending、OpenAPI/AsyncAPI extension 预留位语义）、「为未实现的 feature 预留枚举值」的设计纪律（YAGNI vs forward-compat 枚举的判例）、event-driven 决策绑定的成熟形态（feature flag activation trigger、API deprecation sunset 条件、SLO review cadence 事件锚）、code review/PR review 覆盖率指标的维度归属先例（CHAOSS/LFX/DORA 把 review coverage 归 evolution/delivery 还是 community/ownership 类）、「双挂 multi-mapping」在维度模型里的合法性与先例（metric 同时喂两个 category 是否被工业模型允许）；
6. 给出推荐与理由＋失败模式＋落地形态（若挂起：事件锚的机检形态+registry 条目草案；若裁定：归属维度+准入条件措辞）；
7. 显式核查与本仓 current 决策的冲突面（特别：D-078 行形制是否要求每行必须有定数维度——事件绑行是否合形制；D-035 裸挂禁令下事件绑是否算合规挂起）。

## 交付

返回结构化 Markdown：①结论（推荐+一句话）；②逐候选裁定；③工业先例证据（带 URL）；④落地形态设计；⑤失败模式与治理；⑥与本仓决策冲突核查表（逐条 D-xxx）；⑦信息缺口；⑧建议追问。
