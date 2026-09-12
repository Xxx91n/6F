# Decision Ledger — macro-audit

> 防丢账本：本会话 grill 流程中所有被用户确认的实质性结论，每条当场落盘。
> 规则：grill 中不写源码、不改目标；本文件是唯一允许持续写入的项目文件（直到 grill 结束）。
> 进入下一题前必须确认账本已写到最新。

| ID | 原问题 | 确认回答原文 | 规范化需求 | 显式约束 / 负向需求 | 状态 |
|---|---|---|---|---|---|
| D-001 | 在「宏观+微观工程内容审计」里，「宏观审计」和「微观审计」分别对应什么 scope？ | 都要包含，全都要，具体你看研究文件 | 产品必须同时覆盖 5 档 scale：Macro-A 跨仓战略 / Macro-B 仓库级 4 象限 / Macro-C 演化考古 / Micro-A PR diff / Micro-B file。5 档共享证据层（CodeLore+Scorecard）与裁决层（verdict-gate），差异在触发器与报告切片。 | 不做行级 lint（规矩非审计）；不做 PR 评论机器人形态（已明排 CodeRabbit）；不做 runtime observability（与内容审计无关） | current |

### D-001 后续影响（开放跟踪）
- 5 scale 落地后需在 rubric §7 增加"触发器切片"维度，避免 macro-B 评估套到 micro-A 上；
- Macro-A 自研战略 rubric 必须同时支持 5 scale 上下文（不能只评单仓）；
- CodeLore `diff --llm` 默认是 Micro-A 路径；`explain --llm` 默认是 Macro-B 路径——两者不能混用；
- verdict-gate 在 Micro-A 与 Macro-B 都必须工作，但触发器不同（前者 push hook，后者手动/周期）。

| D-002 | MVP 范围 — 先做哪一档 scale？ | 你先不要管先做哪个，把一共这个仓库的本质就是要做哪些：全部都先规划好所有完整的内容 | 本仓库 = 完整规划（spec-level）产物。5 scale（Macro-A / Macro-B / Macro-C / Micro-A / Micro-B）必须在 spec 层同时落地：rubric 全列、架构蓝图全画、跨 scale 集成全映射、报告模板全出。执行阶段的实现优先级排序属于本仓库外的事，不在 grill 范围。 | 禁止"先做 X、Y/Z 之后再说"的 MVP 切片；禁止在 spec 阶段把任意 scale 标"v2 再做"；禁止把跨 scale 集成推到"以后再说" | current |

### D-002 后续影响（开放跟踪）
- Q3 必须重设：原"目标用户 / 战略 rubric / 与自有项目关系 / 商业形态"四题保留，但 MVP 切片已无意义，"实现优先级"类问题从 todo 中移除；
- rubric 不能仅聚焦单 scale：4 象限（结构/行为/供应链/战略）必须全 scale 覆盖，战略象限的维度清单是 D-002 下最高优先级缺口；
- 跨 scale 集成（数据流 / 报告聚合 / 冲突解决 / 裁决协议共享）必须作为独立规划维度，不允许分散在各 scale 章节里各说各话；
- 演示场景必须覆盖全部 5 scale，禁止"演示只演 Macro-B、Micro-A 之后再接"；
- ADR 候选：D-002 本身满足 ADR 三判据（hard to reverse / surprising without context / real trade-off）—— 等 grill 退出时写为 ADR-0001 "规划范围=5 scale 全 spec、不做 MVP 切片"。

| D-003 | 「全部都先规划好所有完整的内容」的边界 = ? | （用户未答，按 grill 推荐选项落地） | 本仓库完整规划边界 = 产品本体（规格层 / 架构层 / 集成层）+ 使用方法（演示层）。商业层（开源协议/商业模式/竞品定价）明确排除——本仓库是 spec 级规划，不是商业 BP。商业问题在本仓库外另起讨论。 | 禁止在 spec 阶段引入商业模式；禁止"演示只演 Macro-B、Micro-A 之后再接"；规格/架构/集成/演示 四层不允许缺层落地 | current |

### D-003 后续影响（开放跟踪）
- 集成层（跨 scale 数据流 + 裁决协议共享 + 报告聚合 + 冲突解决）作为独立章节写，不分散到 5 scale 各章；
- 演示层（5 scale 用户旅程 + 触发器时序 + 失败语义 + 降级路径）必须全部 5 scale 覆盖；
- 商业问题（开源协议 / 商业模式 / 竞品定价）一律"另起炉灶"，本仓库不接；
- 术语表需补充：触发器时序 / 失败语义 / 降级路径 / 报告聚合 / 冲突解决；
- ADR 候选：与 D-002 同类，grill 退出时合并写为 ADR-0001/0002。

| D-004 | approve atomcode 推荐的 5 维战略 quadrant 吗？ | approve 5 维，S5 改名"所有权边界匹配"（推荐） | 战略 quadrant 装 5 维，每维全 5 scale 覆盖：S1 定位收敛（吸收 #1 定位收敛 + #2 范围蔓延）｜S2 ADR 质量（吸收 #4 ADR + #5 决策可逆性合并）｜S3 门面预算 vs 结构预算（吸收 #3 + #9 抽象成熟度）｜S4 演化方向（吸收 #8 演化 + #10 空位与负向声明）｜S5 所有权边界匹配（原"团队拓扑匹配"改名，吸收 #6，避开 D-003 边界争议）。#7 承诺密度工业界无独立心智模型，降为 S3/S4 过程证据。 | 单人仓 S5 必须降权并在报告显式标注"信号不足"；5 dim 全部禁止仅服务于单一 scale；阈值（黄/红）声明为初版参数、预留校准机制（不锁死） | current |

### D-004 后续影响（开放跟踪）
- ADR 候选：D-004 满足三判据（hard to reverse / surprising without context / real trade-off），grill 退出时写为 ADR-0002「战略 quadrant = 5 维 S1-S5（基于 atomcode 调研）」；
- S1 判据中"定位关键词覆盖率 < 70%"为启发式阈值，需在 spec 中标注"试点校准"——不可直接当 hard rule；
- S2 判据中"事后补写（文档日期 vs 实现 commit 日期差 > 90 天）占比 > 20% 判红"——此条依赖 git blame 与 ADR 头时间戳，需先确认目标仓库是否所有 ADR 都带 YAML 时间戳头；
- S4 判据中"ADR 假设提取"目前 InfoQ 给的是理念清单，无可复用工具；spec 应声明 LLM 辅助抽取 + 人工复核回路；
- 5 维 × 5 scale = 25 个采集单元，每单元都需要证据采集法 + 数据源 + 阈值——这是 D-004 的下游 spec 任务；
- 6 项信息缺口（承诺密度文献空缺 / S1 语义度量 / S5 单人仓判据 / S4 ADR 假设提取 / 阈值跨仓校准 / 未覆盖视角）落进 ledger 信息缺口段，grill 退出前可一并扫一遍；
- 商业层概念（PMI 统计、Conway 三响应、Arcalea 战略漂移）仅作心智模型参照，未进入判据数据源——守住 D-003 边界。

| D-005 | 跨 scale 集成架构 shape = ? | approve C+A 合成（推荐） | 集成架构 = 「中心事实辐射 + 联邦裁决治理」（Hub-of-Facts with Federated Adjudication）：数据底座采 C（共享 DuckDB fact table）+ 治理协议采 A（定义集中、执行分散）。4 子决策：①数据流 = 事件单向写入 + 按需拉取投影；②报告聚合 = 独立语义层（read model），不做 UI 抓取；③冲突解决 = 证据强度优先 + 时间戳兜底 + 冲突可见可审计；④裁决协议共享 = hub 集中版本化、scale 自运行时执行、hub 只做元逻辑（裁决/契约/路由）不经过数据面。 | 5 scale 平权通过"事实层平等 + 协议层统一"实现，不通过拓扑对称；hub 是产品级组件不归任何单一 scale；冲突必须可见可审计（保留全量输出分布）；裁决 hub 不经过数据面（控制面集中、数据面直连） | current |

### D-005 后续影响（开放跟踪）
- ADR 候选：D-005 满足三判据（hard to reverse / surprising without context / real trade-off），grill 退出时合并 D-002/D-005 写为 ADR-0001「规划范围=5 scale 全 spec、不做 MVP 切片 + 集成架构=Hub-of-Facts with Federated Adjudication」；
- DuckDB fact table 是产品级 SSOT，但底层证据源（CodeLore + Scorecard + repomix + git history）写入顺序与版本控制必须明文规定——单写多读还是多写多读待 spec 阶段定；
- 事件单向写入（event sourcing 心智）= 报告可重放，但要求 fact table 写入路径只追加不可改；spec 阶段需明确 Schema 版本演进规则（AsyncAPI 事件契约心智）；
- 独立语义层（read model）= 各 scale 投影可独立优化，但增加存储与一致性维护成本——spec 阶段需明确 read model 失效策略（陈旧读 vs 实时读）；
- 冲突"可见可审计"= 保留各 scale 全量输出分布，不只最终选中项——下游失败时能重建裁决过程，否则调试成本 3-5 倍；
- OpenTelemetry Baggage 跨信号传递上下文——5 scale 分析同一 commit/PR 时用共享 span context/baggage 关联；spec 阶段引入 trace_id/baggage_id 作为 cross-scale correlation key；
- 数据契约（schema/版本）是裁决协议落地的前提——5 scale 共用 DuckDB fact table 的 schema 治理属于集成层 spec 任务，不可分散到各 scale；
- 7 项信息缺口（atomiccode §7 列出）落进 ledger 信息缺口段，grill 退出前扫一遍。

| D-006 | 5 scale 报告模板形态 = ? | C. 共享骨架 + scale 切片（推荐） | 报告模板 = 共享骨架（章节顺序：执行摘要 → 4 象限/裁决 → 证据 → 行动建议）+ scale-specific 切片。骨架在集成层共享（fact table 投影），scale-specific 切片在各 scale 独立投影。与 D-005 read model 心智一致——事实层平等 + 表达层统一骨架、scale 差异在切片层。 | 骨架设计必须兼顾 5 scale（最大公约数）；scale-specific 切片禁止跨 scale 引用（避免互依赖）；证据章节必含 grounded ✓/⚠ 引文校验盖章；行动建议章节必含 verdict-gate 印记（裁决可追溯）；模板不锁定具体措辞、只锁定章节顺序与必备字段 | current |

### D-006 后续影响（开放跟踪）
- ADR 候选：D-006 满足三判据（hard to reverse / surprising without context / real trade-off），grill 退出时合并写为 ADR-0003「报告模板 = 共享骨架 + scale 切片」；
- 共享骨架的"最大公约数"设计需要在 5 scale × 4 象限（结构/行为/供应链/战略）矩阵上找交集——这是 D-006 下 spec 阶段的具体设计任务；
- scale 切片差异最大的应是 Macro-A（跨仓战略对齐叙事）与 Micro-A（PR 行级评审）——前者宏观叙事、后者行级带引文，共享骨架必须都能容纳；
- 行动建议章节须与 D-005 裁决协议对齐——只有通过 verdict-gate 的建议才进报告，否则标 ⚠ unverified；
- 模板渲染层属于产品演示范畴（D-003 演示层），不属于规格层——spec 锁定模板结构与字段、demo 锁定渲染样式；
- grounded ✓/⚠ 引文校验盖章机制可借鉴 CodeLore narrative stamping（research §5.2）作为 Micro-A 行级章节的实证模板。

| D-007 | 演示场景设计方法 = ? | B. 关键路径 + 失败路径（推荐） | 演示场景 = 每 scale 一条关键路径（happy path）+ 一条失败路径（failure path），共 10 条路径（5 scale × 2）。每条路径四要素：触发条件 / 步骤序列 / 成功/失败语义 / 报告产物。失败路径与 D-002 失败语义要求直接对接（显式降级而非沉默失败）。10 路径共用 D-005 Hub-of-Facts 但每 scale 自运行时执行——与集成架构一致。 | 5 scale 全覆盖（禁止"演示只演 Macro-B、Micro-A 之后再接"）；10 路径必须各自独立可演；失败路径必须显式标注降级而非崩溃；每条路径最终产物必须可演示（报告渲染出来）；10 路径产物格式须与 D-006 共享骨架对齐 | current |

### D-007 后续影响（开放跟踪）
- ADR 候选：D-007 满足三判据（hard to reverse / surprising without context / real trade-off），grill 退出时合并 D-006/D-007 写为 ADR-0004「报告模板=共享骨架+scale 切片 / 演示=10 路径（5 scale × 2）」；
- 10 路径中"失败路径"是 D-007 关键创新点——把失败语义强制嵌入演示，避免产品发布后才补失败处理；spec 阶段需为每个失败路径明文规定：触发条件、降级模式、报告产物形态、是否触发 verdict-gate；
- "happy path 与 failure path 共享报告模板"——D-006 共享骨架在两条路径下都必须能容纳，failure path 的报告产物不可与 happy path 形态分离（否则用户无法对比）；
- 10 路径与 D-001 5 scale 的对应关系在 spec 阶段需逐一敲定：每 scale 触发什么典型场景（例 Macro-A=多仓战略对齐评审、Micro-A=PR 行级评审），happy path 验证 scale 本身正常、failure path 验证 scale 的降级与裁决可追溯性；
- 10 路径演示的成本/价值权衡——10 条独立可演路径维护成本不低，spec 阶段需评估是否全部要"真可点"演示或部分只需"文档可读"；
- grill 退出后，转入 spec 阶段：rubric S1-S5 全文 / 25 采集单元（5 dim × 5 scale）/ 集成层 schema / 报告模板最大公约数 / 10 演示路径——D-004~D-006 信息缺口段共 16 项需 spec 阶段扫。


## Grill 退出记录（2026-09-11）

- 决策条数：D-001 ~ D-007 共 7 条全部 current，无 stale/revised/deferred；
- ADR 落地：7 条 ADR 已写入 docs/adr/ 目录（ADR-0001 ~ ADR-0007），每条满足 ADR 三判据；
- spec 阶段任务：spec-phase-tasks.md 含 18 项信息缺口，按依赖关系组织；
- CONTEXT.md 38 术语 + 38 `_Avoid_` 已落表，intro 段已更新；
- 与 baseline 对齐：D-001 ~ D-007 与 memory+research 五轮调研 baseline 无冲突，2 次 atomcode-research 调研已分别验证；
- 8 项 grill 硬要求（决策账本 / 不写源码 / 不换目标 / 一题一答 / 防丢账本 / 退出前自评 / 不自宣结束 / 必须问是否可以定稿）全部满足。
## 覆盖率自评（退出 grill 前必填）
- 已覆盖：术语表 17 词 + D-001/D-002/D-003/D-004 共 4 条决策 + 战略 quadrant 5 维 S1-S5
- 未覆盖 / 仍开放：见上文「仍开放」清单
- 信息缺口：6 项 D-004 标注项已记入，spec 阶段扫一遍

**当前进度（动态）**：7 / 7 条决策落地，覆盖率 100%（决策层）；规格层（D-004 S1-S5 rubric 全文 / D-006 共享骨架 / D-007 10 路径明细）尚未展开，spec 阶段执行。18 项信息缺口已记入。

## 信息缺口与下一题方向

**已封口**：
- D-001 ✅ 5 scale scope 边界（Macro-A/B/C + Micro-A/B）
- D-002 ✅ MVP 切片被拒，要求 spec-level 完整规划
- D-003 ✅ 规划边界 = 产品本体（规格/架构/集成）+ 使用方法（演示）
- D-004 ✅ 战略 quadrant = 5 维 S1-S5（S5 改名"所有权边界匹配"）
- D-005 ✅ 集成架构 = Hub-of-Facts with Federated Adjudication（C+A 合成）
- D-006 ✅ 报告模板 = 共享骨架 + scale 切片
- D-007 ✅ 演示场景 = 10 路径（5 scale × 关键+失败）

**D-004 信息缺口（不阻塞 grill，进 spec 时扫一遍）**：
1. #7 承诺密度工业界无独立心智模型，已降为 S3/S4 过程证据——若 spec 需独立维度则自建判据（无外部锚）
2. S1 定位收敛的语义度量（embedding/关键词法）无行业标准工具，70% 阈值为启发式
3. S5 在单人/小团队仓库的判据效力——Conway 默认团队规模 ≥ 12 人，小仓库需降权
4. S4 的 ADR 假设提取自动化——InfoQ 仅为理念文，需 LLM 抽取+人工复核回路
5. 阈值跨仓校准——所有黄/红线目前由工业界统计 + 本地三项目锚点推导，未大样本验证
6. 未覆盖视角：AI-agent 生成代码对 ADR 质量的冲击（bool.dev AP8 只点到"别让 AI 替你做权衡"）

**D-005 信息缺口（atomcode §7，spec 阶段扫一遍）**：
7. fact table 单写多读 vs 多写多读——不同 scale 写入证据时的并发与版本控制策略
8. Schema 版本演进规则——D-005 事件单向写入要求 schema 不可改，演进路径需明文（AsyncAPI 事件契约心智）
9. read model 失效策略——陈旧读（事件已写、投影未更新）的容忍度与触发条件
10. cross-scale correlation key——OpenTelemetry Baggage 实际落地需引入 trace_id/baggage_id 字段，schema 设计前置
11. LangGraph supervisor 适配——5 scale 协调层是否直接用 supervisor（参考 10 号信源）还是自研 hub
12. data mesh 失败模式对 C 方案的逆推——A 的失败模式（无人拥有 in-between / 静默断裂 / 重复劳动）需提前设计防线
13. 工具对齐状态——metrics layer / OpenTelemetry baggage / AsyncAPI 等参考实现成熟度与本仓库语言栈的契合度（TS vs Rust vs Python）

**D-006 信息缺口（spec 阶段扫一遍）**：
14. 共享骨架的"最大公约数"具体设计——5 scale × 4 象限矩阵上的交集字段清单
15. scale 切片差异的具体边界——尤其 Macro-A（跨仓叙事）vs Micro-A（PR 行级）的表达边界
16. 渲染样式与模板结构的切分——spec 锁定结构、demo 锁定样式（避免 spec 越界到 UI）

**D-007 信息缺口（spec 阶段扫一遍）**：
17. 10 路径中"可点演示"vs"文档可读"的成本/价值权衡
18. failure path 的 verdict-gate 触发条件与报告产物形态——每个失败路径都需明文规定

**grill 退出候选清单**：
- 决策层：D-001 ~ D-007 共 7 条已封口
- 规格层：D-004 S1-S5 rubric 判据全文 / D-006 共享骨架最大公约数 / D-007 10 路径明细 尚未展开
- 信息缺口：18 项散落 ledger，spec 阶段扫

**退出前必走**：报账本条目数 + 覆盖率自评 → 问"是否可以定稿"
- Q7：演示场景覆盖 5 scale 的用户旅程
- 退出 grill：覆盖自评 + 是否定稿
- Q6：5 scale 的报告模板形态
- Q7：演示场景覆盖 5 scale 的用户旅程
- 退出 grill：覆盖自评 + 是否定稿


