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

| D-002 | MVP 范围 — 先做哪一档 scale？ | 你先不要管先做哪个，把一共这个仓库的本质就是要做哪些：全部都先规划好所有完整的内容 | 本仓库 = 完整规划（spec-level）产物。5 scale（Macro-A / Macro-B / Macro-C / Micro-A / Micro-B）必须在 spec 层同时落地：rubric 全列、架构蓝图全画、跨 scale 集成全映射、报告模板全出。执行阶段的实现优先级排序属于本仓库外的事，不在 grill 范围。 | 禁止"先做 X、Y/Z 之后再说"的 MVP 切片；禁止在 spec 阶段把任意 scale 标"v2 再做"；禁止把跨 scale 集成推到"以后再说" | revised |

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



---

## 第二轮 Grill（2026-09-12）— 方向：补完产品定义

| ID | 原问题 | 确认回答原文 | 规范化需求 | 显式约束 / 负向需求 | 状态 |
|---|---|---|---|---|---|
| D-008 | 「进一步建设」的主干方向是哪个？（A 补完产品定义 / B 走向工程实现 / C 清理 BACKLOG / D 自有资产对接） | A | 本轮 grill 主干 = 补完产品定义：目标用户 × 使用场景 × 与外部世界接口（谁来用、何时用、用完拿走什么）。本仓继续扮演 spec-level 规划仓角色，不修订 ADR-0002（no MVP slice）与 ADR-0003（商业层排除）。 | 本轮不做工程实现选型（B 挂起）；不清理 BACKLOG 卫生票 B1/B2/B3（C 挂起）；不定义 jiahao/anysearch-cli/env-manager 对接关系（D 挂起）——三者待产品定义补完后统一重估 | revised |

### D-008 后续影响（开放跟踪）
- 本轮设计树顺序：目标用户 → 使用场景 → 外部接口；目标用户定义必须能反向解释「为什么需要 5 scale 全量」——为 ADR-0001 补上用户面佐证；
- B 方向（工程实现）若日后启动，须显式修订 ADR-0002 或另起工程仓（BACKLOG B4.1 已预告此岔口）；
- C 方向 BACKLOG B1.1/B1.2/B1.3、B2.x、B3.x 继续挂起，立票决策推迟到本轮 grill 退出后；
- D 方向（自有资产对接）在本轮只允许以「目标用户之一是否是自己」的形式出现，不进入集成细节。
| D-009 | 目标用户：这个产品做给谁？（A 技术决策者 / B 工程团队 / C agent 生态开发者 / D 自用优先） | A-D全都用 | 目标用户 = 四类全集，无排除：A 技术决策者（CTO/架构师/尽调人）＋ B 工程团队（TL/平台组/质量负责人）＋ C agent 生态开发者（claude code/codex 用户，装 plugin 进 agent 工作流）＋ D 自用（本人 + jiahao/anysearch-cli/env-manager 三自有仓）。 | 禁止收窄为单一用户类；不做时序切片与用户间优先级排序（与 D-002 拒绝 MVP 切片同风格）；「四类各自何时开始被真实服务」属实现排期，不在本轮 | current |

### D-009 后续影响（开放跟踪）
- 四类用户的「使用时刻」不同质（尽调一次性触发 vs 团队 CI 周期门禁 vs agent 工作流内嵌 vs 手动自评）——使用场景题必须按并集组织，场景清单 ≥ 4 组，禁止压成单一旅程；
- 四类用户对交付形态拉动不同：A 要叙事报告可读性（面向非作者）/ B 要 CI 门禁可靠性与低误报 / C 要 plugin 分发与 MCP 接口稳定 / D 要本地可复现——外部接口题列并集而非公约数；
- D（自用）仍是唯一能提供即时真实反馈回路的用户类——战略 rubric 判据调优以 D 为校准锚，但 D 不再是「唯一首要用户」；
- 与 ADR-0002 兼容性：四类全集是 spec-level 声明，实现优先级排序仍属仓外，不冲突；与 D-008「B 方向挂起」一致。
| D-010 | 使用场景的组织方式？（A 用户×时刻并集 / B 统一评审事件 / C 触发器优先矩阵） | A，刚好我们选中一个最佳适合大众默认模式，有需要其他模式自己设置配置就行了 | 使用场景 = 用户 × 时刻并集组织（四类用户各列场景清单，允许重叠，不强制统一旅程）；叠加默认模式规则：四类用户×时刻组合中选定**一个**「最适合大众」的组合作为产品默认形态（开箱即走的路径），其余场景/模式全部通过配置切换到达（opt-in）。 | 默认模式必须单一（不许多默认并存）；非默认模式必须配置可达，禁止把非默认场景降为二等或砍掉；默认模式的具体选定（哪类用户×哪个时刻）是 spec 必须明文写出的独立决策（见 Q4）；场景并集完整保留，默认化只改变开箱姿态不删减覆盖 | current |

### D-010 后续影响（开放跟踪）
- Q4 = 默认模式选定（哪类用户 × 哪个时刻 × 哪个 scale 组合为开箱形态）；
- 「默认 + 配置切换」隐含一个模式枚举与配置项：spec 层需定义模式枚举（mode）、取值集合、默认值——这进入外部接口题的输入面；
- 场景清单仍按并集全列；触发器类型（手动/周期/事件 hook/agent 调用）作为每条场景的属性标注，C 方案 20 单元矩阵可作 spec 阶段索引视图自动生成；
- 校验点：默认模式必须与分发渠道形态一致（Agent Plugin marketplace 为分发主渠道 per research §7.4）——默认体验若需要 CI/hook 配置才能跑通，则与一键安装渠道自相矛盾。
| D-011 | 默认模式选定：哪类用户 × 哪个时刻 × 哪个 scale 为开箱路径？（A C-agent×工作流内嵌×Macro-B / B 团队×CI×Micro-A / C 自用×手动×Macro-B / D 尽调×一次性×Macro-B/C） | A | 默认模式 = C 类用户（agent 生态开发者）在 agent 工作流内嵌时刻触发的 Macro-B 仓库级四象限评审：装完 plugin 后「说一句评审这个仓库」即可拿到四象限叙事报告，开箱路径零配置（不需要 CI / hook / 团队准备）。 | 默认模式单一且必须与分发渠道同形（marketplace 一键装 → 零配置首跑）；Micro-A CI 门禁 / 尽调一次性 / 自用手动触评全部降级为配置可达模式、不做默认；D（自用三仓）保留为 rubric 校准锚但与默认体验解耦；默认模式只声明开箱路径，不禁用或删减其余场景（D-010 场景并集完整保留） | current |

### D-011 后续影响（开放跟踪）
- 默认模式锁定后，分发形态必须与默认体验同形（Agent Plugin 五层盒子 per research §7.4）——该项研究结论从未进过决策账本，Q5 询问是否封口；
- 术语候选：Default Mode（默认模式）将成为 CONTEXT.md 新词，待 grill 退出时随本轮术语批量更新；
- spec 任务预告：模式枚举（mode 配置项）取值集合 + 默认值 + 配置切换面，需在 spec 阶段展开为外部接口输入面的一部分；
- 风险登记：默认体验绑死「agent 会话内发起」——若某分发宿主不支持 plugin 形态，该宿主上默认模式不可达（宿主支持矩阵属实现期调研，spec 层只声明前提）。
| D-012 | 分发/交付形态：A Agent Plugin 五层盒子 / B 纯 skill 包 / C 独立完整 CLI / D SaaS？ | 接受（atomcode 调研推荐 A 附三修正，呈报后批准） | 分发形态 = Agent Plugin 五层盒子（Agent Plugins 1.0.0 标准）：plugin.json + skills/ 方法论壳（SKILL.md + 战略 rubric references）+ mcp.json（kernel MCP 只读证据查询面，stdio 指向 DuckDB 事实表）+ 反向域名扩展目录（hooks 触发/呈现面）+ 随分发核心确定性 CLI（编排证据管线 + 联邦裁决 + 产出报告；同一二进制四外壳：插件内嵌 / GitHub Action / 自用 CLI / 报告生成器）。三修正：①双 manifest——标准 plugin.json 与 Claude Code 原生 .claude-plugin/plugin.json 并行发布，构建脚本从单一元数据源生成防漂移（Anthropic 不在 Agent Plugins TSC 名单，Claude Code 对标准仅部分兼容，issue #88906）；②hooks 只做触发/呈现（PostToolUse/Stop 呈现 receipt、注入证据就绪上下文），裁决一律环境外执行（内核 CLI / CI gate），hooks 永不作裁决执行点（190 项 hook 失效 + issue #21460 + SoundGate 三源实证）；③skill 壳只读隔离——rubric 与证据读取放壳内，判定/写库/出报告只能内核 CLI 执行，skill 仅允许调只读 MCP 查询面（Skill-Inject 实证注入攻击 80% 成功率）；随分发附 provenance 纪律（license + CHANGELOG + 签名收据）。 | 「零配置」精确语义 = 一次 install 命令 + 首次 MCP 工具授权（非零交互）——D-011 保持 current，本条承载其精确化；禁止把裁决逻辑放进 hook；禁止 skill 壳持有写权限或执行管线；禁止只发单 manifest（Claude Code 默认用户群会丢失）；SaaS 形态继续排除（D-003）；插件市场上架选择属商业层，按 D-003 另行决策 | current |

### D-012 后续影响（开放跟踪）
- ADR 候选：D-012 满足三判据（难反转——工程围绕盒子形态展开；无上下文会困惑——为什么不是纯 CLI/纯 skill；真实取舍——四候选显式对比），grill 退出时写 ADR-0008「分发形态 = Agent Plugin 五层盒子（双 manifest）」；
- spec 任务预告：plugin.json / mcp.json 字段契约、mode 枚举与默认值、内核 CLI 四外壳命令面、receipt 协议字段、provenance manifest 内容清单；
- CONTEXT.md 新词候选：Agent Plugin / Default Mode（默认模式）/ Receipt（裁决回执）——退出时统一评估是否入表；
- 调研证据快照：三引擎 10 查询、13 次原文抓取、8 域名、关键结论均 ≥2 独立信源；检索标签 atomcode-q5-delivery-form 可复现（ctx_search source 过滤）。

### D-012 信息缺口（spec 阶段扫）
1. Agent Plugins 1.1.0 working draft 未细读——若 hooks 标准化，扩展目录策略需复评；
2. 国内 agent 生态（Qwen/Kimi 等）对 Agent Plugins / Agent Skills 标准支持度未知——若 C 类用户含国内开发者需补调研；
3. MCP 2026-07-28 大修订细节（stateless remote transport / deprecate Sampling）仅单源——kernel MCP 若走 streamable-http 需重读规范正文；
4. Skill-Inject 论文（arXiv 2602.20156）仅摘要级——威胁模型细化需读全文；
5. Claude Code 完整兼容 Agent Plugins 1.0.0 时间表未官宣——跟踪 issue #88906，落地后原生壳可退役为纯扩展目录。
| D-013 | 目标仓输入面：A 仅本地路径 / B 本地路径默认+远程 URL 配置可达 / C 远程托管拉取？ | 接受（atomcode 调研推荐 B 附五细则，呈报后批准） | 输入面 = 本地路径为默认 + 远程 URL 配置可达。输入裁决顺序：显式本地路径 → owner/repo 形态本地优先消歧（./ 前缀强制本地）→ 显式 URL（https/git@）才 clone 到本地隔离缓存，此后全部走同一本地管线（URL 在输入面之后不复存在）。五细则：①凭据复用——clone 用本地 git 凭据链（SSH agent / credential helper / PAT 即用即清），不新建凭据存储；②不可信输入纪律——隔离缓存目录、禁远程配置执行（默认不信任被审仓的 hooks/config）、不写回用户工作区、评审后可清理；③远程一律全深度 clone（fetch-depth 0）+ 校验 .git 完整性，浅 clone 显式拒绝——这是「面向 git 记录健全的项目」的输入面落地；④入口收敛——clone 只走随分发 CLI（repo add）与配置文件，不暴露为 kernel MCP 工具，MCP 保持严格只读查询面（GitHub Copilot code review MCP 强制 readOnlyHint 的同构口径）；⑤授权清单含「远程 clone + 网络 + 本地 git 凭据使用」为一个授权事件（细化 D-011/D-012 的授权语义）。 | 禁止远程托管式拉取（等同 SaaS 输入形态，违反 D-003 商业层排除）；禁止把 clone 暴露为 MCP 工具；禁止新建凭据存储体系；浅 clone 输入必须拒绝并提示（git 记录不健全的仓不属本产品的承诺面）；D-011 / D-012 保持 current，本条承载其授权清单与只读边界的精确化，无 D 被推翻 | current |

### D-013 后续影响（开放跟踪）
- ADR 候选：输入面裁决满足三判据（难反转——输入契约定后全部管线围绕本地路径假设；会困惑——为什么不做远程托管；真实取舍——A/B/C 三案对比），grill 退出时写 ADR-0009「输入面 = 本地路径默认 + 远程 URL 配置可达（五细则）」；
- spec 任务预告：repo add 命令面、clone 缓存目录布局、消歧规则实现、授权事件清单字段、快照 zip 输入（尽调场景，视同本地路径）的等价地位声明；
- 调研证据：工业界事实标准 = 本地 checkout 后扫描（SonarQube 强制 full clone / Semgrep CI checkout→scan / TruffleHog clone-to-tmp）；B 的成熟原型 = repomix --remote / gitingest URL / TruffleHog 临时目录范式；C 形态实证 = GitHub App 托管拉取（CodeRabbit/Greptile），与 D-003 冲突被排除；检索标签 atomcode-q6-input-surface 可复现。

### D-013 信息缺口（spec 阶段扫）
1. git bundle 专门文档未读——尽调快照打包传输场景待 spec 评估是否支持为输入形态；
2. 超大仓 / monorepo 规模策略未展开——clone 体量上限与超时阈值 spec 待定；
3. Agent Plugins 规范整页未抓取（本轮只读 Google 博客与 issue）——发布前需通读正文；
4. 尽调社区一手正文（r/startups 帖）被拦未读——尽调输入面结论对应子项置信度为中。


---

## 第三轮（2026-09-12）— R2-Q7 调研呈报：spec 与工程实现边界（A+B 组合）

> 触发：子 Agent 验收标准（编译/打包/启动测活/每平台 test 闭环）预设了可构建的软件交付物，与 ADR-0002「spec-level 规划、实现属仓外」边界冲突；用户倾向 A+B 组合。
> 调研：atomcode 深度调研（检索标签 R2-Q7-engineering-boundary），报告 .scratch/macro-audit/reports/R2-Q7-atomcode-research.md。
> 冲突协议执行：D-002、D-008 已标 revised（原记录保留）；D-014 曾于 2026-09-12 经用户批准 → current，后经用户更正架构 → revised（由 D-015 承载；ADR-0010 → ADR-0011）。

| ID | 原问题 | 确认回答原文 | 规范化需求 | 显式约束 / 负向需求 | 状态 |
|---|---|---|---|---|---|
| D-014 | A+B 组合（完成 R2 spec 契约 + 进入工程实现）如何落地？ | 用户：「我偏向A+B的组合」（未拍板，待调研呈报后裁定）；atomcode R2-Q7 调研推荐：supersede ADR-0002（新 ADR-0010）+ 另起工程仓 + R2-01~05 先封口 + 工程仓 walking skeleton 验收。 | ① 写新 ADR supersede ADR-0002，确立「spec 仓角色正式化 + 工程实现迁移至独立工程仓」；② 另起工程仓承接实现（polyrepo 判据：几乎不共享代码 / spec 与实现变更节奏不同 / CI 与访问控制需隔离）；③ R2-01~05 先封口（尤其 R2-04 Agent Plugin 契约群 = 工程实现的对象），再启工程；④ 工程仓验收 = walking skeleton + smoke→sanity→regression 分层 + CI matrix（Windows/macOS/Linux × 运行时）+ liveness probe。 | 禁止 in-place 改 ADR-0002（ADR 不可变，只能 supersede；Fowler+AWS 双源）；禁止把工程实现源码落进本 spec 仓；本期验收止于「可构建/可打包/可测活/可签名」，上架/分发仍归仓外（D-003 不变）；双 manifest 单一元数据源生成无直接先例，须显式标注为自研范围。 | revised（2026-09-12 用户更正架构；由 D-015 承载） |

### D-014 后续影响（开放跟踪）
- 冲突清单（报告 §4）：C1=D-002/ADR-0002；C2=D-008（最关键，须裁定是否激活 B4.1 岔口）；C3=R2 时序；C4=D-003 商业边界；C5=D-012 五层盒子（无实质冲突）。
- 用户拍板后动作：若批准，写 ADR-0010（supersede ADR-0002）+ 建工程仓 + 按 R2-01~05 顺序封口 spec；若不批准，回退 D-002/D-008 为 current 并记录否决理由。
- 调研信息缺口 8 项（报告 §6）：Agent Plugins 规范全文未通读、1.1.0 draft、DuckDB Node 双线选型、SEA/Bun+原生模块组合、双 manifest 生成无先例、spec↔工程仓契约衔接机制、MCP 2026-07-28 修订、国内 agent 生态支持度。
- 证据：atomcode R2-Q7 报告（11 次原文 / 10+ 域名 / 三引擎交叉验证）。
- （2026-09-12 追记）D-014 后经用户更正架构 → revised；「另起工程仓」被 D-015 / ADR-0011 取代。


---

## 第四轮（2026-09-12）— 架构更正：单仓 + 子目录 + but 分支

> 触发：用户 2026-09-12 更正——「将 6F-impl 合并到 6F；分开是错误的；正确架构 = 6F 为默认项目文件夹、其余内容在子目录、but 管理不同分支（非独立仓 / 工作树）」。
> 处置：D-014 标 revised（其「另起工程仓」被更正）；新记 D-015；ADR-0011 supersede ADR-0010。

| ID | 原问题 | 确认回答原文 | 规范化需求 | 显式约束 / 负向需求 | 状态 |
|---|---|---|---|---|---|
| D-015 | 工程实现的仓形态？（单仓+子目录 vs 另起工程仓） | 用户：「将 6F-impl 合并到 6F 中，分开是错误的，正确的架构是 6F 为默认项目文件夹，其余内容在子目录，同时 but 管理不同分支，而不是隔离以工作树」 | 单仓：D:/Aworker/6F 为唯一 git 仓；实现内容入子目录 6F/engine/；并行隔离用 but 分支（非独立仓 / 非 git worktree）；6F-impl 已删除并迁入。 | 禁止另起独立工程仓；禁止用 git worktree 隔离；禁止把实现散落在仓根（必须子目录）；ADR-0010「另起工程仓」被 supersede。 | current |

### D-015 后续影响（开放跟踪）
- ADR-0011（supersede ADR-0010）已落盘 docs/adr/0011-single-repo-subdir-but-branches.md；ADR-0010 标 superseded。
- 工程内容新路径：6F/engine/（迁后 build/smoke 6/6 PASS）；6F-impl 已删除。
- 后续 VCS 均在 6F 单仓的 but 分支上操作；CI path filter 限于 engine/**。
