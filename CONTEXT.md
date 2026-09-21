# macro-audit — 工程内容审计

> 本仓库是 **spec-level 完整规划**产物（per ADR-0001 ~ ADR-0007），覆盖 5 scale 工程内容审计。
> grill 决策层（2026-09-11 完成）已封口 7 条决策：5 scale 全覆盖 + 拒绝 MVP 切片 + 边界不含商业 + 战略 quadrant 5 维 S1-S5 + 集成架构 Hub-of-Facts with Federated Adjudication + 报告模板共享骨架 + scale 切片 + 演示 10 路径（5 scale × 关键+失败）。
> 第二轮 grill（2026-09-12 完成）已封口 D-008 ~ D-013：目标用户四类全集 + 场景并集与单一默认模式（C-agent 内嵌 Macro-B 开箱）+ 分发形态 Agent Plugin 五层盒子双 manifest + 输入面本地默认/远程 URL 配置可达；对应 ADR-0008 / ADR-0009。
> 轮 3 grill（2026-09-12 完成）已封口 D-016 ~ D-018：建设主干 = 端到端价值验证闭环先行（阶段 0 使能件 → 阶段 1 于 6F 产出首份带引文+裁决回执真报告 → 阶段 2 缺口回流 → 阶段 3 铺开+分发；ADR-0012）+ 首报三层验收闸门 A→B→C 与预声明判据 2 正对照 + 3 真判据 + 1 负对照（ADR-0013）。
> 轮 4 grill（2026-09-14 完成）已封口 D-020 ~ D-021：上游组件引入方式 = 适配器双轨制 + vendor 逃生舱（ADR-0014；上游经适配器进事实表、raw 语义不出适配层）+ 根 README 组合件五段式（一句话定位 / 三层盒子图+上游清单表 / Runtime View / 所有权表 / 契约声明；readme-crafter-skill 流程落盘）。
> 轮 5 grill（2026-09-15 完成）已封口 D-022 ~ D-028：建设节奏维持 VVL 主干、阶段 2 拆 2a 冻结校准 → 2b CodeLore 单上游探针 + 阶段 1.5 量测审计先行（D-023/D-025；ADR-0015，三问决策树 desk/上游探针/自证探针 D-024）+ TC-2 RED 处置 = OOS 顺序双轨 + 勘误式双读数（D-025）+ #25 前置清单最小拍板与 LRM 挂门绑定（D-026）+ 分发渠道方向 = 纯 Agent Plugins 生态（D-027；ADR-0016）。
> 轮 6/7 grill（2026-09-15 完成）已封口 D-029 ~ D-041：preview 分级发布模型（ADR-0017）＋阶段 3 拍板包与铺开次序＋版本与编年制度化（ADR-0018）＋#41 拆仓内/上架两片＋挂门值守三态化。
> 轮 8 grill（2026-09-16 完成）已封口 D-042 ~ D-047：W14 收口窗口包六项全拍——#41b 授权至提交前＋多写者域意图读法闭环（ADR-0019，SWMR 门面成文）＋desk-task15 重绑勘误＋残余 4 面分流＋回归 CI 迁回 6F＋Micro-A 双试点＋第三槽。
> 轮 11 grill（2026-09-16 完成）已封口 D-048 ~ D-052：#47 托管 API 适配器（REST 主路＋gh 可选回退，ADR-0020）＋#48 Micro-A preview 单票＋#49 经典仓三选＋分发面 A+C 双轨/Apache-2.0（ADR-0021）/插件名 6f@市场 xxx91n；
> 轮 13 grill（2026-09-17 完成）已封口 D-053 ~ D-058：原预设对照清算——叙事双轨＋rubric 三件＋MCP 出 stub（#50 立案）＋Macro-B behavior 象限接入（#51）＋hooks 层④收窄为可选呈现面/声明位（ADR-0008 勘误）＋repomix-gitingest 退役（锁表 retired＋重开触发器）＋原预设余项×4 核销＋Kernel/Agent 职责边界词条收编；
> spec 阶段任务清单见 [.scratch/macro-audit/spec-phase-tasks.md](.scratch/macro-audit/spec-phase-tasks.md)（18 项），决策层 ledger 见 [.scratch/macro-audit/decision-ledger.md](.scratch/macro-audit/decision-ledger.md)。
> 本文件不含实现细节（domain-modeling 规则）；实现决策走 docs/adr/，术语锐利化在本文件 ## Language。

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
单仓全景评审；触发器为周期/手动；数据源为 CodeLore + OpenSSF Scorecard；输出为四象限叙事报告（结构 / 行为 / 供应链 / 战略）。
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
报告缺口检测器——当证据不足以支撑结论时，明确标记 `data doesn't show` 并发起 GapRequest 补查轮（补查回路由宿主 agent 承担=编排面，kernel 只判 insufficient——D-057④）；禁止硬凑结论。
_Avoid_: 自检（无补查轮）、质量门（暗示一票否决）

**Trigger Sequence**:
触发器时序——单 scale 内"何时启动→何时采集→何时叙事→何时裁决→何时报告"的完整时间序列；不同 scale 共享同一套四阶段（采集/叙事/裁决/报告），但触发器不同。 scale 级启动亦受判据约束：Macro-A 启动判据集登记于 registry mw-trigger-c.verify_method（前序层 preview 全上架＋跨仓关联键 ≥2 真实仓验证＋SWMR 启动实测封口＋能力矩阵同票收窄，D-062），判据未齐不算 macro-a-start 事件发生。
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

**Default Mode（默认模式）**:
产品的开箱路径——C 类用户（agent 生态开发者）在 agent 工作流内嵌触发 Macro-B 仓库级四象限评审；其语义 = 一次安装命令 + 首次工具授权（非零交互）；其余模式（Micro-A CI 门禁 / 尽调一次性 / 自用手动触评）全部配置切换可达、不做默认。mode 枚举的取值/默认值/切换面属外部接口配置契约，spec 阶段展开。
_Avoid_: 默认配置（暗示配置文件细节）、新手模式（暗示能力分级）

**Agent Plugin（本产品用法）**:
产品的分发形态——Agent Plugins 1.0.0 标准的五层盒子：plugin.json + skills/ 方法论壳 + mcp.json 只读证据查询面 + 反向域名扩展目录（hooks=可选呈现面/声明位，宿主专属非可移植，现无实物——D-055/ADR-0008 勘误）+ 随分发内核确定性 CLI；双 manifest（标准 + Claude Code 原生）并行发布；内核 CLI 同一二进制四外壳（插件内嵌 / GitHub Action / 自用 CLI / 报告生成器）。
_Avoid_: 插件（太泛，含浏览器插件）、扩展（IDE 语义）

**Receipt（裁决回执）**:
环境外确定性 gate（内核 CLI / CI action）对审计结论出具的可核验回执——携带证据引用与判定结果，可离线复核；报告「行动建议」章节中的 verdict-gate 印记即其在报告层的呈现形态。
_Avoid_: certificate（暗示证书体系）、签名（只覆盖密码学一段）

**Repo Intake（输入面）**:
被审计仓库到达产品的形式裁决——本地路径默认 + 远程 URL 配置可达（clone 至隔离缓存、全深度、禁远程配置执行、凭据复用本地 git 凭据链）；clone 只走 CLI 入口（repo add / 配置文件），kernel MCP 查询面保持只读；浅 clone 显式拒绝并提示。
_Avoid_: 导入（暗示格式转换）、加载（暗示运行时挂载）

**Value Validation Loop（端到端价值验证闭环）**:
本产品的建设主干（ADR-0012）——在真实仓库上跑通「采集→fact→叙事→裁决→报告」全链并产出第一份带引文与裁决回执的真报告，以证伪或证实产品前提；四阶段串行（使能件→首报→缺口回流→铺开+分发）。
_Avoid_: MVP（D-002/ADR-0002 链禁用）、demo 路径（属 D-007 演示层）、tracer bullet（借喻不作正式词）

**Acceptance Gate（三层验收闸门）**:
首报验收协议（ADR-0013）——A 形式达标（骨架+引文+Receipt，smoke 层）→ B 内容非平凡（预声明 kill criterion）→ C 信任裁决（三档裁定回写账本）三层串行；每层回答不同问题（管线通了吗/产出值得读吗/敢据此行动吗）。
_Avoid_: 验收标准（无分层语义）、UAT（缺预声明判据纪律）、质量门（暗示单层一票否决）

**Kill Criterion（预声明判据）**:
B 层判据的组织纪律——跑被测仓之前以确定性规则写下判据并 commit 入库（预注册），含可操作定义+显式阈值+命中方向+未中语义；真判据未命中=「前提未被支持」的合法实验数据，不是失败。
_Avoid_: 通过标准（反向语义）、退出门（缺入库纪律）、阈值（只是其组成要素）

**Positive Control（正对照）**:
B 层判据构造的已知答案样本（2 条，与真判据共享 detector 路径）——只证明管线能响应，不计入价值判定；未中=管线故障（实验无效）；配对负对照（1 条预期 0 命中）守特异性。
_Avoid_: 自检样本（缺对照语义）、基准用例（暗示计入价值判定）、canary（暗示线上探测）

**Self-probe（自证探针）**:
校准三分类之一——未知变量是自家系统在负载/争用下的行为时，既不能由冻结数据 desk 推导、也不能由任何上游工具输出提供，只能等自身系统规模化后实测闭合（如多写者并发争用曲线）；登记时须带「满足判据 + 复审时点」两字段，防止退化为永不复审的死锁项。
_Avoid_: 基准测试（暗示性能测试而非缺口校准）、自测（暗示单元级）、压测（只覆盖性能面）

**Dual Reporting（勘误式双读数）**:
量测方法修订后的披露纪律——原读数不撤回、不覆盖（dated measurement，测量当时为真），修正读数以勘误/并列形态发布并附逐份 delta 表；「判红转判绿」的唯一合法通道 = 原读数记 invalid（附逐份可归属原因）+ 修正读数成为 reportable value 的成对动作。
_Avoid_: 重测覆盖（暗示废除旧读数）、数据迁移（无裁决语义）、洗白（隐含违规）

**Assignable Cause（可归属原因）**:
异常读数得以判 invalid 的唯一凭证——一个有记录的、可具体指认的量测端错误（如 detector 漏认内联格式）；找不到可归属原因时默认接受异常读数为有效并升级全规模调查。源自 FDA OOS 两阶段调查规程（Barr 判例）。
_Avoid_: 误报原因（无留档凭证语义）、flaky（暗示随机性，不可审计）

**LRM Binding（最迟拍板时点绑定）**:
待拍板项的防退化纪律（last responsible moment，Poppendieck）——推迟决策必须同时登记「最迟拍板时点 + 触发事件」：触发后限期内必须拍；事件不来按硬到期日重组改绑一次，再到期升级决策人；超 LRM 的推迟不是推迟，是「决策由默认做出」。
_Avoid_: TODO 提醒（无到期升级语义）、冻结（暗示永不解锁）

**Release Preview（发布预览）**:
产品的分级发布形态——「capability N of 5 · preview」标注 + 0.x 版本语义 + changelog 明示当前覆盖范围；preview 层必须自成完整价值单元（MMP 判据），未上架层只做文字披露 + roadmap 叙事、不交付预览性演示资产；build-scope（5 scale 全规划）与 release-sequence（分层暴露）为正交维度，preview 上架不构成 MVP 切片。
_Avoid_: beta 滥用（无边框语义）、暗示全量能力、GA 姿态（未过逐层漏斗）

**Trigger-gated Closure（触发器封口）**:
基础设施/缺口项的闭合时机纪律——不显式前置、不无限拖延，而是登记一组显式触发事件（如多写者域：Macro-B 进 CI 定时回归 / Macro-C 共用同一 DuckDB / Macro-A 启动），任一触发即实测封口；既非铺开期前置门禁（infrastructure-last），亦非永不复审的死锁项。
_Avoid_: 前置门禁化（阻塞已验证层）、无限延期（value lead time 恶化信号）

**Generalization Gate（泛化闸门）**:
能力层 GA 的准入条件——同主仓试点（校准＋冒烟）不构成泛化证据（dogfooding = generative not evaluative），必须引 ≥1 非自有公开仓完成真实泛化验证；输入路径 = Repo Intake 的 URL opt-in。
_Avoid_: 自审当泛化（确认偏差）、试点成功=跑通（应为反复接受）

**Pilot-surface Audit（试点面审计）**:
试点仓承接能力层角色前的实测核查——核查其数据面是否真能服务被指派层（PR 人/机比、supersede 链完整度、托管面有无）；角色绑定能力层而非仓（capacity / ground-truth 可得性 / 泛化增量三问）。
_Avoid_: 按仓体量指派试点（体量非判据）、假设性指派（未实测即绑定）

**Demo Fixture（演示夹具）**:
由仓内生成器脚本按确定性定义生成的合成 git 仓——demo 入口与 golden 回归的同一输入资产；必须携带合成披露戳，不得冒充真实仓库审计产物；外部样例仓仅文档 opt-in、不可 golden 预期。
_Avoid_: 样例仓进分发体（上游演化漂移击穿可复现）、隐藏合成来源（披露失守）

**Watch Tri-state（值守三态）**:
挂门项登记表的值守状态机——event_bound（触发事件已绑、守卫机检）/ manual_watch（真·条件式判据，显式五要素：标记+责任人+复审时点+验证方法+确认留痕）/ risk_accepted（复审逾期仍未绑上时升级，须记接受人+理由+到期日）；人工盯梢是补偿控制而非缺口关闭，覆盖率 event_bound/total 须显式输出。
_Avoid_: 隐性人工盯（prose 复审非控制）、把谓词做成通用规则引擎

**SWMR Facade（单写者门面）**:

并发写策略成文形态——引擎/存储层只准入单一写者，应用层把并行写请求收敛为串行追加；竞争失败方显式失败（fail-fast）优于隐式重试，完整性不变量（无丢行/乱序/冲突）由准入控制而非引擎层并发写保证；升级阶梯 L0 fail-fast→L1 写队列+单 owner→L2 分库→L3 服务端串行准入引擎，复审信号=锁等待入关键路径。
_Avoid_: 引擎层并行写承诺（DuckDB 单文件非此设计目标）、判据按实现路径撰写（应守护结果属性）
**Hosted API Adapter（托管平台 API 适配器）**：Micro-A 数据面新外部上游（D-048/#47，锁表 kind=remote-api 已登记 github-rest planned 行）；形态=GitHub REST＋env token 主路、gh 已认证态可选回退（非 git-cli 先例延伸）、无认证显式降级；最小契约=PR 枚举（平台声明 Bot 双检）＋元数据＋diff 双通道（本地 git 优先/API 兜底）；raw 上游语义不出边界（ADR-0014/ADR-0020）。

**Plugin/Marketplace 双层命名**：分发面两级名字——plugin name=插件列表/安装名（D-052=`6f`，双 manifest name 字段权威，strict:true 下 plugins[].name 须同值）；marketplace name=市场/货架名（D-052=`xxx91n`，仓根 .claude-plugin/marketplace.json）；安装引用形=<plugin>@<marketplace>=`6f@xxx91n`；内核 CLI/bin/包名 macro-audit 不变（插件名与内核名解耦）。

**Kernel/Agent 职责边界（确定性核 / 概率性编排）**:
本产品分工总则——确定性面归 kernel（事实采集、引文盖章、门禁检查：可重放、可测试、预定路径）；编排与概率性面归宿主 agent（叙事生成、补查回路、触发编排、呈现：模型驱动、路径不预定）。与 Anthropic workflow（predefined code paths）/agent（dynamic direction）区分同构。跨界争议按判例裁：hooks 层＝纯呈现面非裁决点（D-055）；repo 文件面归宿主 agent 原生访问、产品不提供打包上游（D-056）；gap→补查回路归 orchestrator 非 kernel（D-057④）。裁决 band 永不归 agent——band 归 C 层人裁定（ADR-0013/D-026 红线）。
_Avoid_: 微内核（架构模式借喻）、裁判员/运动员（拟人不精确）、确定性内核 vs 概率外壳（非本仓语序）、AI 管线（丢失 kernel 盖章语义）

**Canonical→Derived（双语门面文书关系）**:
双语 README 对非平等副本而是 canonical→derived 关系：英文版（README.md）=canonical 权威源，译文（README.zh-CN.md）=derived 工件——译文可暂时落后但不得假装新鲜（canonicalMarker 首行声明＋{#english-id} 锚点钉回源＋sync 版本戳；D-087/D-088）。同步守卫三分：结构互等（锚点集/code block/链接/badge）=FAIL／版本戳掉队=XFAIL·warn／译文质量=人评审不可机检。
_Avoid_: 平等双写（无权威源必漂移）、双语同步=译文质量机检（机器只管「是否同步过」不管「译得好不好」）

**6F（品牌名 / 六-F 宣言）**:
仓与产品的公开品牌名——D-052 冻结 plugin=`6f`、仓名=`6F`；语义本体=**六句 F 开头宣言**概括最有价值资产（D-092）：Facts〔Hub-of-Facts ADR-0005〕／Federation〔联邦裁定协议 ADR-0005〕／Forensics〔演化考古 Macro-C〕／Five scales〔五尺度 ADR-0001〕／Frankness〔诚实 preview 标注 ADR-0017〕／Fingerprints〔可验 receipts/溯源〕。**双名分层规则**（D-093）：品牌/门面层=`6F`（README/hero/social-card/marketplace displayName）；kernel 技术标识层=`macro-audit`（.mcp.json 服务名/plugin.json skills 路径/engine 内部名/architecture.svg kernel 标签）——内部名故意不同于营销名=纪律非债。
_Avoid_: 门面与 kernel 共用一名（三层三名病灶原型）、macro-audit 当品牌名上门面（R25 正名前状态）、F 词凑数不钉资产（宁缺毋滥判据）
