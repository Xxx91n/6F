# macro-audit — 工程内容审计

> 本仓库是 **spec-level 完整规划**产物（per ADR-0001 ~ ADR-0007），覆盖 5 scale 工程内容审计。
> grill 决策层（2026-09-11 完成）已封口 7 条决策：5 scale 全覆盖 + 拒绝 MVP 切片 + 边界不含商业 + 战略 quadrant 5 维 S1-S5 + 集成架构 Hub-of-Facts with Federated Adjudication + 报告模板共享骨架 + scale 切片 + 演示 10 路径（5 scale × 关键+失败）。
> spec 阶段任务清单见 [.scratch/macro-audit/spec-phase-tasks.md](.scratch/macro-audit/spec-phase-tasks.md)（18 项），决策层 ledger 见 [.scratch/macro-audit/decision-ledger.md](.scratch/macro-audit/decision-ledger.md)。
> 本文件不含实现细节（domain-modeling 规则）；实现决策走 docs/adr/，术语锐利化在本文件 ## Language。

## Language

## Language

**Audit**:
对工程产物（代码/历史/供应链/战略）做带证据引文与可驳回裁决的结构化判定；其输出必须可追溯到具体文件、commit 或度量值。
_Avoid_: 审查（暗示人流程）、评估（暗示打分制）、扫描（暗示无判断自动跑）

**Macro Audit**:
跨仓库到仓库级的审计视角，关注架构、过程、定位与技术债的整体健康度；其判定输出是叙事化报告而非行级评论。
_Avoid_: 整仓评审（易与 micro PR 评审混淆）、仓库体检（隐含"扫一遍"）

**Micro Audit**:
仓库内单文件或单次提交粒度的审计视角，关注代码质量、diff 风险与可驳回裁决；其判定输出是行级带引文评审或单文件质量卡。
_Avoid_: 行级 lint（属规矩非审计）、PR 评论机器人（已明排 CodeRabbit 形态）

**Scale**:
本产品对审计粒度的层级划分，共 5 档（Macro-A / Macro-B / Macro-C / Micro-A / Micro-B）；各 scale 共享同一套证据层（CodeLore + OpenSSF Scorecard）与裁决层（verdict-gate），差异在触发器与报告切片。
_Avoid_: tier（与商业订阅 tier 混淆）、level（与日志 level 混淆）

**Macro-A (Cross-Repo Strategic Audit)**:
多仓组合的战略对齐审视；触发器为季度/手动；数据源为自研战略 rubric + 跨仓依赖图；输出为战略叙事报告。
_Avoid_: portfolio review（带财务意味，本产品不评财务）

**Macro-B (Repo-Level 4-Quadrant Audit)**:
单仓全景评审；触发器为周期/手动；数据源为 CodeLore + OpenSSF Scorecard + repomix；输出为四象限叙事报告（结构 / 行为 / 供应链 / 战略）。
_Avoid_: 全仓扫描（隐含自动触发）、仓库快照（与 Macro-C 混淆）

**Macro-C (Evolution Archaeology Audit)**:
单仓时间维度的演化审视；触发器为手动或版本发布节点；数据源为 CodeLore 历史分析 + corpus 校准；输出为演化对比报告。
_Avoid_: hotspot 报告（属行为象限切片）、技术债追踪（与债务管理工具混淆）

**Micro-A (PR-Level Diff Audit)**:
单次提交/PR 粒度的审计；触发器为每次 push 或 hook；数据源为 CodeLore `diff --llm` + Receipt Gate；输出为行级带引文评审 + verdict-gate。
_Avoid_: AI 代码评审（缺 verdict-gate = 概率性评论，不是审计）

**Micro-B (File-Level Audit)**:
单文件粒度的审计；触发器为单文件查看或 LSP 调用；数据源为 CodeLore file facts + 局部叙事；输出为文件质量卡（advisory，不进入裁决路径）。
_Avoid_: lint 报告、code review（人类流程，非工具审计）

**Evidence Gate**:
完成声明必须可核验的确定性门禁；任何"完成"或"通过"必须附证据（行号、commit、SARIF 行），否则判定为 `⚠ contains uncited claims` 或 gate 拒绝。
_Avoid_: review（人流程）、approval（暗示终态通过）

**Sufficiency Gate**:
报告缺口检测器——当证据不足以支撑结论时，明确标记 `data doesn't show` 并发起 GapRequest 补查轮；禁止硬凑结论。
_Avoid_: 自检（无补查轮）、质量门（暗示一票否决）

**Trigger Sequence**:
触发器时序——单 scale 内"何时启动→何时采集→何时叙事→何时裁决→何时报告"的完整时间序列；不同 scale 共享同一套四阶段（采集/叙事/裁决/报告），但触发器不同。
_Avoid_: 工作流（太泛）、pipeline（暗示数据流而非时序）

**Failure Semantics**:
失败语义——当证据采集失败、叙事超时、裁决被驳回、报告渲染异常时，每个 scale 的降级路径与状态可观测性要求；本术语要求每个 scale 都明写降级而非沉默失败。
_Avoid_: 错误处理（暗示 try/catch）、fallback（暗示简单替换）

**Report Aggregation**:
报告聚合——多 scale 输出合并为统一视图时的规则（时间对齐 / 证据去重 / 冲突标记 / 主裁决来源）；属集成层核心机制。
_Avoid_: 合并（隐含去细节）、汇总（隐含无判断）

**Conflict Resolution**:
冲突解决——当 Macro-B 的"行为象限"结论与 Micro-A 的"同文件 verdict"打架时的仲裁规则；不允许 scale 之间各自为政。
_Avoid_: 一致性检查（无仲裁）、冲突检测（只发现不解决）

**Adjudication Protocol**:
裁决协议——5 scale 共享的 verdict-gate 配置（证据门槛 / 申诉通道 / override 策略 / 审计日志）；属集成层共享机制，避免各 scale 自行定义裁决语义。
_Avoid_: 治理流程（暗示人为）、gate 配置（太技术缺语义）

**Hotspot (CodeLore 行为象限术语)**:
git 考古中的"变更频率 × 复杂度"乘积——本产品对 CodeLore 的 hotspot 概念直接复用，不自创等价术语。
_Avoid_: 风险点（隐含主观）、技术债（更宽泛）

**Strategic Quadrant**:
本产品的 4 象限之一（结构 / 行为 / 供应链 / **战略**），评「产品在往哪去、值不值得」；其判定输出是叙事化战略诊断（定位收敛、ADR 治理、门面/结构预算、演化方向、所有权边界），区别于行为象限的 hotspot 排序。覆盖全部 5 scale，每 scale 一份叙事化战略报告。
_Avoid_: 战略报告（暗示一次性产出）、愿景（暗示主观意图而非证据判定）

**S1 Positioning Convergence（定位收敛）**:
战略 quadrant 第 1 维——产品/仓库的「意图声明」（README 一句话定位、roadmap、epic 目标）与「实际交付内容」（功能面、PR 主题、issue 分流）之间的收敛度；判据包括定位关键词覆盖率与漂移起点检测；证据源=README/docs/roadmap/CHANGELOG/git log/issue+label/PR 标题。
_Avoid_: 定位分析（暗示主观）、愿景对齐（暗示政治意味）

**S2 ADR Quality（ADR 质量）**:
战略 quadrant 第 2 维——架构决策记录是否为「真决策」（有 Context 张力 / Considered Options / 正负 Consequences / immutable+supersede 链 / 决策当时写而非事后补），并含决策可逆性（confidence + 门类型 one-way vs two-way + 回滚路径）；证据源=docs/adr/ 全量结构扫描 + git log --follow + TODO/FIXME 密度对照。
_Avoid_: ADR 治理（暗示流程而非质量）、决策审计（暗示审计人而非审计工具）

**S3 Facade-vs-Structure Budget（门面预算 vs 结构预算）**:
战略 quadrant 第 3 维——维护预算花在「门面」（God Object / 巨类 / 单实现抽象 / 范式通胀）还是「结构」（边界清晰 / 内聚 / 适度抽象）；证据源=CodeLore 上帝对象分析 + 抽象利用率 + shearing layers 识别。
_Avoid_: 技术债（更宽泛含行为/供应链债务）、过度工程（单方向贬义）

**S4 Evolution Direction（演化方向）**:
战略 quadrant 第 4 维——系统是否沿着声明的方向演化，还是漂移/侵蚀；主战场在 Macro-C（ADR 假设提取 → 假设失效检测）；含空位与负向声明（YAGNI 注释 / 被否选项 / out-of-scope 记录）的诚实度；证据源=docs/adr/ 假设段 + 依赖方向违规趋势 + ADR supersede 链。
_Avoid_: 技术趋势（暗示外部驱动）、技术雷达（暗示外部评估而非自评）

**S5 Ownership Boundary Fit（所有权边界匹配）**:
战略 quadrant 第 5 维——模块分解与所有权分解（git author 矩阵 / CODEOWNERS / AGENTS.md）是否同构；Conway's Law 工程化版本；证据源=CODEOWNERS + git blame 作者-模块矩阵 + bus factor + PR reviewer 分布；单人仓该维信号弱，必须降权并在报告显式标注"信号不足"。
_Avoid_: 团队拓扑（暗示 HR/组织图）、Conway 反演（暗示主动组织设计而非观测匹配）

**Integration Shape**:
本产品跨 scale 集成架构的形态决策——5 scale 之间的关系模式。已封口：Hub-of-Facts with Federated Adjudication（中心事实辐射 + 联邦裁决治理）。
_Avoid_: 架构模式（太泛）、拓扑（暗示物理而非逻辑）

**Hub-of-Facts with Federated Adjudication (HoF-FA)**:
本产品集成架构命名。数据底座 = 共享 DuckDB fact table（C 中心辐射）；治理协议 = 定义集中、执行分散（A 联邦治理）；hub 只承载元逻辑（裁决/契约/路由），不经过数据面（控制面集中、数据面直连）。
_Avoid_: 联邦架构（暗示业务域自治）、星型（暗示事实与引擎混淆）、数据网格（暗示分域自治）

**Single Source of Truth (SSOT)**:
集成层数据底座原则——同一审计事实只能由 DuckDB fact table 一处持有；5 scale 共享读、可独立投影、禁止跨 scale 复制同一份事实到各自存储（否则复现 data mesh 三大失败）。
_Avoid_: 主数据（master data，暗示 MDM 治理流程）、权威源（暗示权力结构）

**Event Sourcing (本产品用法)**:
集成层数据流模式——事件单向写入 fact table，只追加不可改；5 scale 按需拉取投影；报告可重放；schema 不可改、演进通过版本号（AsyncAPI 事件契约心智）。
_Avoid_: 事件溯源（与 DDD ES 同名，但本用法不要求领域事件完备性）、审计日志（暗示只读不写）

**Read Model**:
集成层报告聚合模式——5 scale 各自从 fact table 投影的语义层，独立优化、不做 UI 抓取；陈旧读容忍度与触发条件由 spec 阶段规定。
_Avoid_: 物化视图（数据库概念，缺语义）、派生数据（无独立生命）

**Federated Computational Governance (本产品用法)**:
集成层裁决协议模式——协议本体（证据评分 / tie-break / 升级规则 / schema 契约）由 hub 集中定义、版本化、code-as-policy；各 scale 在自运行时执行协议；冲突由 hub 裁决服务承载；scale 间通过共享协议而非中心调用协作。
_Avoid_: 联邦治理（暗示业务域自治）、分布式治理（暗示无中心）

**Cross-Scale Correlation Key**:
集成层观测性基础——5 scale 分析同一 commit/PR 时通过共享 trace_id / baggage_id 关联审计记录；OpenTelemetry Baggage 心智；spec 阶段需作为 fact table schema 前置字段设计。
_Avoid_: correlation id（缺多信号语义）、request id（仅 HTTP 语义）

**Report Template (本产品用法)**:
本产品 5 scale 审计报告的呈现形态——共享骨架 + scale-specific 切片；骨架章节顺序 = 执行摘要 → 4 象限/裁决 → 证据 → 行动建议；scale 切片在各 scale 独立投影，禁止跨 scale 引用。
_Avoid_: 模板（暗示可填空）、报告格式（缺语义层级）

**Shared Skeleton**:
报告模板的共享章节顺序——执行摘要 → 4 象限/裁决 → 证据 → 行动建议；与 5 scale × 4 象限矩阵的"最大公约数"对齐；属集成层共享组件，与 D-005 read model 心智一致。
_Avoid_: 通用模板（缺语义）、章节框架（缺裁决与证据章节定位）

**Scale Slice**:
报告模板的 scale-specific 章节——5 scale 各投影独立的 scale-specific 内容（如 Macro-A 跨仓战略对齐叙事、Micro-A 行级带引文评审）；属各 scale 独立设计，禁止跨 scale 引用（避免互依赖）。
_Avoid_: scale 章节（缺内容语义）、scale 视图（暗示多视图而非多切片）

**Actionable Recommendation (本产品用法)**:
报告模板的最后一章——必须含 verdict-gate 印记（只有通过裁决的建议才进报告，否则标 ⚠ unverified）；与 D-005 Adjudication Protocol 直接对齐；属裁决可追溯性的关键载体。
_Avoid_: 行动建议（缺裁决印记）、TODO 列表（缺证据与裁决）

**Demonstration Scenario**:
本产品演示层的颗粒度决策——5 scale × 每 scale 一条关键路径 + 一条失败路径 = 共 10 条演示路径（已封口：10 路径法）；与 D-006 共享骨架对齐，每条路径产物格式一致。
_Avoid_: demo（缺语义）、用例（缺路径概念）

**Happy Path (本产品演示用法)**:
演示场景的成功路径——验证 scale 本身正常工作时的触发条件 / 步骤序列 / 报告产物；与 D-007 失败路径配对；属 D-003 演示层必含。
_Avoid_: 主路径（缺对比）、正常路径（缺与失败对照）

**Failure Path (本产品演示用法)**:
演示场景的失败路径——验证 scale 在证据采集失败 / 叙事超时 / 裁决被驳回 / 报告渲染异常时的降级模式 / verdict-gate 触发 / 报告产物；与 D-002 失败语义要求直接对接（显式降级而非沉默失败）；属 D-007 关键创新点。
_Avoid_: 错误用例（缺降级语义）、异常路径（暗示崩溃）

**Degraded Demonstration**:
演示层的失败路径产物——failure path 的报告产物与 happy path 共享 D-006 骨架但必含 ⚠ unverified 标记 / 降级注释 / verdict-gate 拒绝印记；不允许 failure path 产物与 happy path 形态分离（否则用户无法对比裁决可追溯性）。
_Avoid_: 错误报告（缺降级语义）、降级模式（缺演示产物维度）
