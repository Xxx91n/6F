# Report: A-011 — LangGraph supervisor 适配评估

> 票：[issues/11-langgraph-eval.md](../issues/11-langgraph-eval.md) ｜ 决策锚：spec.md §Decision 5.5 ｜ ADR 锚：[docs/adr/0005-hub-of-facts-with-federated-adjudication.md](../../docs/adr/0005-hub-of-facts-with-federated-adjudication.md)
> 日期：2026-09-11 ｜ 报告结构参照 reports/07-report.md ｜ 版本控制 per WORKFLOW §4.2.1

## 0. 开工复述（per 本票「开工第一句」硬要求）

- **Blocked by: None（无阻塞，可立即开工）**。
- 必读清单（开工前已全部读毕）：
  1. `.scratch/architecture-recovery/issues/11-langgraph-eval.md`
  2. `.scratch/architecture-recovery/handoffs/11-langgraph-eval.md`
  3. `.scratch/architecture-recovery/spec.md` §Decision 5.5
  4. `.scratch/architecture-recovery/WORKFLOW.md` §4.2（含 §4.2.1 版本控制 / §4.2.3 调研 / §4.2.4 决策账本 / §4.2.5 报告）
  5. `.scratch/architecture-recovery/decision-ledger.md` A-011
  6. `docs/adr/0005-hub-of-facts-with-federated-adjudication.md`

## 1. 决议（明文，专属验收第 1 项）

**决策 = 自研（手写薄协调层）；不 adopt LangGraph supervisor；不混合。**

- hub 协调层 = 自研确定性薄层：「事实入 → 纯函数裁决 → 事件出」，幂等靠事实键（cross-scale correlation key，A-010 槽位），遥测靠结构化日志。事实状态的唯一持有者 = DuckDB fact table（A-007 不变量），**hub 无自有持久状态**。
- 混合方案（自研骨架 + LangGraph 局部嵌入，如用 StateGraph 表达 hub 内部路由）一并排除：LangGraph 的状态模型是侵入式的（checkpointer 在每个 super-step 边界落第二份执行状态），只要嵌入就产生与 fact table 的对账面，违反 D-005 SSOT——「混合」在本场景退化为「带全部成本的 adopt」。
- **重评触发器（明文，任一成立即重开本决策，per 调研判据 [S5 评论区][S3][S2]）**：
  - **T1**：hub 裁决/路由出现 LLM 非确定性推理步骤（当前 ADR-0005 ③ 裁决规则 = 证据强度优先 + 时间戳兜底，纯确定性）→ 重评 LangGraph（配 LangSmith）；
  - **T2**：出现跨天人工裁决或需精确一次的跨服务副作用 → 重评 Temporal（durable execution）；
  - **T3**：出现批量回填/调度/血缘一等需求 → 重评 Dagster。
  - 即使触发，DuckDB fact table 仍是唯一领域 SSOT——LangGraph checkpointer 与 Temporal Event History 都只是执行状态，领域事件必须留在框架之外（厂商与社区共识，见 §3.2 发现 7）。

## 2. 前置背景与约束回顾

### 2.1 issue 要件（issues/11-langgraph-eval.md）

- What to build：adopt vs 自研 hub 协调层的决策矩阵（语言契合度 / 学习曲线 / 与 D-005 SSOT 心智冲突面）。
- 验收 3 项：明确决策；决策矩阵 ≥5 维度；LangGraph 能力清单 + 契合度评分（≥5 维度）+ 决策理由。

### 2.2 handoff 完成定义（handoffs/11-langgraph-eval.md）

- 交付决策矩阵，不直接采纳（= 本票只产决策与证据链，不落实现代码）。
- 通用调研要求：atomcode 深度调研（回顾 D-001 ~ D-007 / spec §X.Y / 目标仓库现状，输出含推荐方案）+ 回顾 ADR-0005 + CONTEXT.md 心智术语 + 对标 ≥2 工业界成熟心智模型/工具/论文。

### 2.3 decision-ledger A-011 原文约束

- 「LangGraph supervisor 与本仓库 hub 协调层的契合度评估（adopt vs 自研）」；规范化需求 = D-005 hub 实现路径决策；显式约束 = **前置「本仓库语言栈确定」、中优先级**。
- **前置缺口如实声明**：语言栈在本仓库 spec 中尚未锁定（TS / Rust / Python 三候选未拍板，spec.md 无对应 Decision）。本票处理方式：决策按「三栈稳健性」评估——自研薄层在 Python / TS / Rust 均可行，结论对栈选择不敏感；LangGraph 侧 Python / TS 双栈均成熟，不构成排除或采纳的硬理由（见 §4.2 维度 4）。该前置缺口列入 §6 信息缺口，不掩盖。

### 2.4 ADR-0005 约束与承接点

- hub 只承载元逻辑（裁决 / 契约 / 路由），不经过数据面（控制面集中、数据面直连）。
- 4 子决策承接：① 事件单向写入 + 按需拉取投影（hub 编排的是拉/推信号，不做数据搬运）；③ 冲突解决 = 证据强度优先 + 时间戳兜底 + 冲突可见可审计（确定性规则，无 LLM）；④ 裁决协议 hub 集中版本化、scale 自运行时执行。
- 推论：hub 是**确定性控制面**；LangGraph supervisor 的核心价值域是**LLM 子 agent 的图控流**——两者语义错位是本票结论的根因（见 §3.2 发现 8）。

### 2.5 CONTEXT.md 心智模型映射（本票相关术语）

- HoF-FA（hub 只做元逻辑，不经过数据面）、SSOT（同一审计事实只能由 fact table 一处持有；_Avoid_ 事实被第二处持有）、Event Sourcing（事件单向写入）、Read Model（各 scale 自建投影）、Adjudication Protocol（裁决协议集中版本化）、Failure Semantics（显式降级而非沉默失败）。
- LangGraph 的框架持有状态模型（checkpointer / Store）与 SSOT 的 _Avoid_ 面直接相关：引入即产生事实/状态第二持有处。

## 3. atomcode 深度调研（per WORKFLOW §4.2.3）

### 3.1 执行参数

- 两次串行 run（同会话串行、共享配额；首轮 ctx_batch_execute 600 s 超时后按 atomcode-research「续跑锚定」处理：探测进程→检索找回，两次 run 均已完整落盘并索引，未重跑、未杀进程）：
  - **run 1「LangGraph capabilities and status」**：官方一手（1.0 公告 / GitHub releases / PyPI / npm registry / Graph API / Persistence / Checkpointers / Interrupts / Streaming / subagents 迁移指南）+ 批评面（dev.to 三次重写实践、HN item 43459535、CSA 安全报告、Reddit 摘要级）+ 采用面（Klarna / Lyft / Uber / LinkedIn）。
  - **run 2「LangGraph vs SSOT hub fit and alternatives」**：Sufficiency Gate = searches 12（web_search 5 / Tavily 4 / AnySearch 3）、angles 5/5（Official / Comparative / Criticism / Currency / Community）、full reads 10；来源含 Temporal 官方文档与博客、LangChain 官方对比页、Fowler 事件溯源、Temporal 社区 CQRS 帖、Inngest 队列机制解剖、yeos.ai 移除实践。
- 两份来源清单（编号 S1-S24 / S1-S10）已随 stdout 落盘 context-mode 索引（source 前缀 `batch:atomcode LangGraph`），本报告引用只注编号与出处名。

### 3.2 核心发现（每条带来源）

1. **版本与许可（官方一手，双源核验）**：Python `langgraph` 1.2.11（PyPI 2026-08-11）、JS/TS `@langchain/langgraph` 1.4.14（npm registry 2026-09），均 MIT；v1.0 GA 2025-10-22，官方承诺 2.0 前无破坏性变更；Python ≥3.10 / Node ≥18；月级补丁 + 季度级次版本节奏；仓库 41.5k stars。[PyPI / npm registry / GitHub releases / langchain.com 1.0 公告]
2. **能力核心栈 1.x 稳定**：StateGraph（节点 / 条件边 / super-step 并行 / 子图 / recursion_limit 防环）、Command 路由、Functional API（@entrypoint / @task）并存；持久化双轨（Checkpointer 线程级 + Store 跨线程）；checkpointer 后端 InMemory / Sqlite / Postgres + conformance 一致性测试套件；durability 三模式 exit / async / sync（v1.1 引入）；2026 新特性 DeltaChannel（beta）、event streaming v3、逐节点执行控制。[docs.langchain.com Graph API / Persistence / Checkpointers / Streaming]
3. **supervisor 模式官方转向**：`langgraph-supervisor` 包（create_supervisor / create_handoff_tool）官方文档明示**不再积极维护**，提供逐条迁移指南指向 subagents 模式（create_agent + 工具包装子代理，isolated / fork 两种上下文模式）；supervisor 状态假设 = worker 默认无状态、主代理持全部会话记忆、子代理结果回流主代理且只看最终输出；静态子代理发现是已文档化限制。[docs.langchain.com migrate/langgraph-supervisor / subagents]
4. **采用面（厂商叙事，未独立审计）**：官方称 90M 月下载，Uber / LinkedIn / Klarna / Replit / Elastic 生产使用；Klarna 85M 用户解决时长 -80%、Lyft 开发周期 6 个月→2 周。[langchain.com 1.0 公告 / PyPI]
5. **批评面（从业者）**：状态模型静默失败（OOM 半写恢复出混入两个 checkpoint 的线程）、reducer 陷阱、checkpoint 损坏、学习曲线约 10-14 天（CrewAI 2-3 天 / OpenAI Agents SDK 5-7 天）、vendor lock-in 批评（HN「最后我们选了 Pydantic AI」）、文档滞后、LLM 非确定性导致测试复现难、每步 token 开销（Reddit 8 框架实测，snippet 级未全文核验）。[dev.to 三次重写 / HN 43459535 / Composio 对比 / AY Automate]
6. **安全面（2025-2026 高危）**：CSA 报告汇总 4 项——CVE-2025-64439（langgraph-checkpoint JsonPlusSerializer 反序列化 RCE）、CVE-2025-67644（checkpoint-sqlite SQL 注入 CVSS 7.3）、CVE-2025-68664（langchain-core 序列化注入 CVSS 9.3）、CVE-2026-34070（load_prompt 路径穿越）；另有 CVE-2026-28277（msgpack 不安全反序列化，checkpoint 存储被定为完整性敏感）；原话「企业 agent 部署中 checkpoint 存储积累敏感会话状态，使这些漏洞尤其严重」。伴生工程问题：默认 durability="async" 内存泄漏（官方 issue #7094）、长工具调用 ~180 s 云端静默重放 2-3x（#7417）、大线程复制 12+ 分钟。[labs.cloudsecurityalliance.org / GitHub issues]
7. **checkpointer 与外部事件溯源 SSOT：正交不冲突，但重复且重复即净损失**：checkpointer 是 super-step 执行快照（thread_id 主键），不是领域事件日志（Fowler 定义）；官方自划线「checkpointers are not where you store durable facts」；引入即第二状态库，需与事实表对账（社区漂移痛点：「checkpointers save the state, but they don't manage the transaction across your Vector DB」）。Temporal 侧同构结论：Event History 是执行日志（51,200 事件 / execution 硬上限），社区共识领域事件必须留在框架外（Kafka / 自有 SSOT）。[docs.langchain.com persistence / Fowler / Temporal docs / community.temporal.io / Reddit S17]
8. **对确定性 router/adjudicator 的增量 ≈ 0、成本 ≈ 全部**：不需要 time travel（事实表可重放）、token 级追踪、reducer 并发合并；图抽象换来「调试的不是函数而是执行图」（yeos.ai 用数月后整体移除，替换为组合组件 + 显式管线 + 结构化遥测）；图框架引入判据（动态分支数 / 可恢复性 / 重试语义 / 状态转换作为一等事件）本 hub 全不满足；LangChain 官方对比页自己把「orchestrate deterministic distributed system workflows」划给 Temporal 而非 LangGraph。[dev.to S5 / langchain.com S3]
9. **替代方案定位**：Temporal = 确定性分布式工作流领地（幂等派生裁决用不上 durable execution，跨天 HITL / saga 才有价值）；Airflow / Dagster / Prefect = 数据管线调度器（事件驱动实时 hub 形状不符，批量回填 / 血缘需求出现时 Dagster 是既定选项）；CrewAI / AutoGen = LLM 会话框架（AutoGen 已并入 Microsoft Agent Framework），与确定性裁决无关；手写 asyncio/TS + MQ worker = 唯一不产生第二状态库的方案（Inngest：workflow engine 本质是队列 + 状态 + memoization，状态已在外部 SSOT 且步骤幂等时队列 worker 是原生形态）。[Temporal docs S6 / futurepicker S19 / Inngest S9]
10. **厂商互撕如实记录**：LangGraph 官方页与 Temporal 官方页互相攻击对方边界（2 MB payload 上限 vs checkpointer 非持久执行），双方均为自利叙事、未找独立第三方实测背书；但在「确定性路由不需要图框架」这一点上两者无分歧。[S2 / S3]

### 3.3 对标工业界成熟方案（≥2，per handoff 通用调研要求）

1. **Temporal（durable execution 心智模型）**：Event History = append-only 执行日志、Continue-As-New 续命；官方与社区共识「内部事件溯源 ≠ 领域事件溯源」。对本票 = 即使换 durable runtime，SSOT 边界结论不变；T2 触发时的既定选项。
2. **yeos.ai「Why We Removed LangGraph From Our AI Platform」（实践对标）**：企业平台要的是可预测执行 / 可观测 / 审计，不是图执行；替换物 = 组合式小组件 + 显式管线 + 结构化遥测——与自研形态逐字吻合；其评论区的图框架引入判据被本票采纳为 T1 前提。
3. **Inngest「workflow engine = 队列 + 状态 + memoization」（机制对标）**：状态已在外部 SSOT 且步骤幂等时，队列 worker 是原生形态，引擎替你管状态是负资产。
4. **LangGraph 官方 supervisor→subagents 迁移指南（上游对标）**：官方自己把 supervisor 从预置包降级为模式文档，证实「预置 supervisor 包」不是长期稳定面。

### 3.4 基线决策回顾（D-001 ~ D-007 与本票契合度）

- **D-001（5 scale 平权）**：hub 协调层必须对 5 scale 无偏好。LangGraph supervisor 主代理/子代理层级天然非对称（中心化控制是其设计目标）；自研路由按 fact 键分发，无结构倾斜。不冲突，但支撑自研。
- **D-002（spec-level 完整规划，禁 MVP 切片）**：本票产出完整决策矩阵而非「先试再定」；「采纳官方弃维护的入口包」与完整规划的升级路径要求相抵。
- **D-003（边界 = 产品本体 + 演示，排除商业层）**：LangGraph Platform / LangSmith Deployment 的商业定价不进入判据；仅开源 MIT 库本身进入评估。
- **D-005（本票所属集群，ADR-0005 已锁）**：见 §2.4。冲突检查结论：自研与 ADR-0005 全部 4 子决策对齐；adopt 在 ①③④ 三处产生张力（状态重复、裁决确定性、hub 元逻辑边界）。
- **D-006 / D-007（报告模板 / 演示路径）**：hub 自研层的事件出站即报告聚合触发信号；10 演示路径中的 failure path 降级语义由自研层的显式 Failure Semantics 承载，LangGraph 的静默失败案例（发现 5）与「显式降级」术语相抵。不受本票反向影响。

## 4. 核心交付物

### 4.1 交付物 1 — LangGraph 能力清单（2026-09，官方文档逐页核验）

| 能力域 | 内容（版本锚定） | 对本仓库 hub 的相关性 |
|---|---|---|
| 图执行引擎 | StateGraph：节点 / 条件边 / super-step 并行 / 子图嵌套 / recursion_limit 防环；Command 路由；Functional API（@entrypoint / @task）并存，官方提供选型页 | 路由表达力冗余（hub 调度是线性 + 少量分支） |
| 状态与 reducer | 类型化 state（Pydantic / dataclass / MessagesState）；add_messages / operator.add reducer | reducer 为并发写合并设计；hub 裁决为纯函数，用不上 |
| 持久化 | Checkpointer（InMemory / Sqlite / Postgres，conformance 套件）+ Store 双轨；durability exit / async / sync；DeltaChannel（beta） | **直接与 SSOT 冲突面相关**：第二份执行状态库 |
| HITL | 动态 interrupt(value) / Command(resume) / 静态断点 interrupt_before/after | 当前裁决无跨天人工环节（T2 未触发） |
| 流式 | event streaming v3：messages / values / subgraphs / output 类型化投影 | token 级投影对确定性 hub 无意义 |
| 多 agent | supervisor / subagents（isolated / fork）/ handoffs / Send；**langgraph-supervisor 包官方弃维护** | supervisor 价值域 = LLM 子 agent 图控流，本仓库 5 scale 是确定性 worker |
| 平台与观测 | LangGraph Platform→LangSmith Deployment（2025-10 更名，Agent Server 运行时）；LangSmith tracing / eval | 商业层（D-003 排除）；自托管观测用结构化日志 + OTel（A-010） |
| 版本与许可 | Python 1.2.11 / TS 1.4.14；MIT；Python ≥3.10 / Node ≥18；v1.0 GA 2025-10-22，2.0 前无破坏承诺 | 许可与支持面无障碍；不构成采纳理由 |

### 4.2 交付物 2 — 与本仓库心智模型的契合度评分（6 维，5 分制：5=完全契合，1=根本冲突）

| # | 维度（锚点） | 评分 | 依据 |
|---|---|---|---|
| 1 | SSOT 状态模型契合（D-005 / CONTEXT「SSOT」_Avoid_ 面） | **1/5** | checkpointer = 第二份执行状态库，需与 fact table 对账；官方自划线 durable facts 不进 checkpointer，而本仓库全部审计事实要求唯一持有 |
| 2 | 控制面/数据面分离契合（ADR-0005 ④ hub 元逻辑不进数据面） | **2/5** | 框架把状态 / 执行 / 持久化内嵌为 framework-owned state；hub 元逻辑要求零自有持久状态，框架执行模型侵入元逻辑边界 |
| 3 | 确定性 / 可审计性契合（ADR-0005 ③ / Failure Semantics「显式降级」） | **2/5** | 为 LLM 非确定性设计（time travel / token 流式 / 概率重试）；checkpoint 损坏与静默失败实践案例与「冲突可见可审计」相抵 |
| 4 | 语言 / 生态契合（A-011 前置语言栈未定） | **4/5** | Python / TS 双栈成熟、MIT，与三候选栈中两栈兼容；Node ≥18 / Python ≥3.10 均 mainstream；不构成障碍也无锁定收益 |
| 5 | 学习曲线与维护成本（单仓 spec + 多 agent 并行开发心智） | **2/5** | 上手 10-14 天（对比显式管线即读即懂）；采纳入口包 = 官方弃维护路径的迁移成本；DSL/图抽象 onboarding 高 |
| 6 | 演进可插拔性（T1-T3 重评触发器成本） | **3/5** | LLM 化时 LangGraph 是强候选；但状态模型侵入式，事后引入的迁移面大于自研时预留接口再引入 |

**总评：均分 2.33/5，低于采纳线；最低分恰在本仓库宪法级约束（SSOT）上。**

### 4.3 交付物 3 — 决策矩阵（7 维，≥5 达标）

| 维度 | adopt LangGraph supervisor | 自研薄协调层 | 混合（自研骨架 + LangGraph 局部） |
|---|---|---|---|
| 1. 与 D-005 SSOT 冲突面 | **高冲突**：checkpointer 第二状态库 + 对账面 | **零**：事实表即唯一状态 | 高：嵌入即产生状态面 |
| 2. 与 ADR-0005 ④ hub 元逻辑边界 | 中低：框架执行模型侵入 hub | **最高**：hub 退化为纯函数 + 事件出站 | 中：图节点边界与元逻辑边界重叠需人为隔离 |
| 3. 确定性路由表达（5 scale 调度） | 过度抽象：为 LLM 分支设计，线性调度反受其累 | **最高**：普通代码 | 过度（同 adopt，面缩小） |
| 4. 学习曲线 / 维护成本 | 高：10-14 天 + 官方 supervisor 包弃维护 | **低**：无 DSL，结构化日志即遥测 | 高：两套心智并存 |
| 5. 语言栈耦合（前置未定） | 中：双栈可用但依赖线深（checkpoint 后端 / sdk 版本线） | **低**：三候选栈均可行 | 中 |
| 6. 演进可插拔（T1 LLM 化） | 中：已就位但难拆 | 中：可预留接口，触发时再引入 | **低**：两套并存最难拆 |
| 7. 安全暴露面 | 高：checkpoint 反序列化 RCE 等 4 CVE + async 泄漏 issue + 云端静默重放 | 低：攻击面 = 自有代码 | 高 |
| **计** | 1 优 / 6 劣 | **5 优 / 2 中 / 0 劣** | 0 优 / 2 中 / 5 劣 |

### 4.4 决策理由（按权重排序，排他式）

1. **SSOT 是宪法级约束**（ADR-0005 / D-005 / CONTEXT _Avoid_）：任何第二状态库直接违反；LangGraph 不用 checkpointer 等于不用 LangGraph——其编排价值与检查点 / 恢复绑定，弃用后剩余价值（图 DSL）对线性调度是负资产。
2. **语义错位**：supervisor 模式官方适用边界 = 多 LLM 域、多工具、集中控制的 agent 编排；本仓库 5 scale worker 是「拉事实、推事件」的确定性服务。LangChain 自己的对比页把确定性分布式工作流划给 Temporal。
3. **官方 supervisor 包弃维护**：采纳官方明示「不再积极维护」的入口包，违反 D-002 完整规划的升级路径要求。
4. **安全面叠加**：审计产品自身成为 CVE-2025-64439 类 checkpoint 反序列化 RCE 的暴露面，与 ADR-0005 ③ 可审计要求负相关。
5. **语言栈前置未满足**：栈未定时 adopt 框架会把栈决策偷跑成框架决策（Python / TS 双栈绑定 checkpoint 后端与 sdk 版本线）；自研保持三栈开放，把耦合推迟到栈拍板之后。

### 4.5 自研的代价（明示，不掩盖）

- **放弃现成能力**：检查点恢复 / HITL 中断 / 流式 / 图可视化——T1/T2 触发时需自建或后引入（触发器已明文）。
- **自担工程质量**：幂等、重试、降级语义（Failure Semantics 显式化）全部自写自测，无 conformance 套件背书。
- **协作心智成本**：新成员需读自研层约定（由 ADR + CONTEXT 术语承载），社区文档红利为零。
- **边界纪律风险**：自研层可能长出隐性状态——需以「hub 无自有持久状态」为硬不变量写入评审 checklist，并移交 A-012 防线设计。

## 5. 与其他票的关系与边界

- **A-013（工具对齐，Decision 5.7）**：LangGraph 是 A-013 矩阵评估对象之一；本票结论（不 adopt + T1-T3 触发器）直接供 A-013 复用，避免重复调研。
- **A-007（写入策略）**：单写者进程独立于协调层；本票决策不改变 A-007 不变量（hub 本就不写 fact table）。
- **A-008 / A-009 / A-010**：hub 的契约路由消费 schema 版本（A-008）、陈旧读 SLA（A-009）、correlation key 槽位（A-010）——本票只消费不定义。
- **A-012（data mesh 防线）**：「hub 无自有持久状态」硬不变量 + 裁决协议集中版本化 = ADR-0005 ④ 的自研侧落地，移交 A-012 作防线候选。
- **边界（本票不做）**：实现语言选择（栈决策另有归属）；LangSmith / LangGraph Platform 商业评估（D-003 排除）；任何实现代码。

## 6. 信息缺口（per Sufficiency Gate — 诚实标注 data does not show）

1. **语言栈未锁定**（spec 无决策；A-010 / A-011 / A-013 共同前置）——本票以三栈稳健性处理，但「栈 × 框架」耦合细则无法在栈拍板前落地。
2. **DuckDB 事实表 + 编排框架共存的一手实践缺失**：双 run 均未找到同台案例；「重复 / 对账」结论基于框架侧证据与社区经验外推（框架侧证据本身为双源以上，但外推有不确定性）。
3. **hub 裁决 LLM 化的长期可能性未在 spec 明文排除**（ADR-0005 ③ 规则是确定性的，但产品演化可能引入语义层 LLM 辅助）——已转译为 T1 触发器而非阻塞。
4. **摘要级证据**：Reddit 8 框架 token 实测、Airflow / Dagster / Prefect 对比细节、CrewAI / AutoGen 综述未全文核验；对结论权重低（均不支撑 adopt）。
5. **Klarna / Lyft 数字为厂商叙事**，未独立审计；仅作采用面背景，不进入判据。

## 7. 完成定义对照（逐项，per WORKFLOW §4.2.5）

### 7.1 专属验收 checklist（本票特有）

- [x] 必须给出明确决策（adopt / 自研 / 混合）→ **自研**，见 §1（含不混合的排他理由与 T1-T3 重评触发器）。
- [x] 决策矩阵 ≥5 维度 → **7 维三列矩阵**，见 §4.3。
- [x] 1) LangGraph 能力清单 → §4.1（8 能力域，版本锚定）；2) 契合度评分 ≥5 维度 → §4.2（6 维，5 分制）；3) adopt / 自研决策 + 理由 → §1 + §4.4（5 条排他理由）。

### 7.2 通用调研要求对照（per handoff「通用调研要求」段）

- [x] atomcode 深度调研：双 run（能力现状 + SSOT 契合 / 替代方案），参数与 Sufficiency Gate 见 §3.1；回顾 baseline D-001 ~ D-007 见 §3.4；spec §5.5 与仓库现状见 §2。
- [x] 回顾 docs/adr/：ADR-0005 逐条承接见 §2.4。
- [x] 回顾 CONTEXT.md：本票相关术语映射见 §2.5。
- [x] 对标工业界成熟方案 ≥2：4 个（Temporal / yeos.ai 移除实践 / Inngest / 官方迁移指南），见 §3.3。

### 7.3 阻塞（per WORKFLOW §4.2.5）

- 无（Blocked by: None），本票一次闭环；不阻塞他票。
- 前置缺口（语言栈未定）已在 §2.3 / §6 诚实登记，不构成本票阻塞（决策对三栈稳健）。

### 7.4 lessons 候选（per WORKFLOW §4「教训持续追加 / 不可蒸发」）

- 官方弃维护的预置包是决策矩阵的一票否决信号（langgraph-supervisor 案例）：采纳入口包之前先查其维护状态，而不是查框架本身。
- 框架评估先问「它要替我管什么状态」——答案为零才是零成本；SSOT 仓库的框架准入判据可复用于 A-013 全部候选。
- ctx_batch_execute 600 s 超时 ≠ 调研失败：按 atomcode-research「续跑锚定」（探测进程 → 检索找回）避免重跑；本票两次 run 均完整落盘。
- 多 agent 并行工作区：落盘前重读目标文件防覆盖（本票会话内实测 decision-ledger.md 字节数两次变化）。

### 7.5 引用文件列表（per WORKFLOW §4.2.5）

- 必读清单 6 项（§0）。
- spec.md D-005 cluster 全节（Decision 5.1-5.7）；`.scratch/macro-audit/decision-ledger.md`（D-001 ~ D-003 原文）。
- 结构参照：reports/06-report.md、reports/07-report.md。
- 调研原始材料：context-mode 索引（source 前缀 `batch:atomcode LangGraph capabilities and status` / `batch:atomcode LangGraph vs SSOT hub fit and alternatives`），含 S1-S24 / S1-S10 来源清单（官方 docs.langchain.com、PyPI、npm registry、GitHub releases；厂商 temporal.io、langchain.com；社区 dev.to、HN、CSA、community.temporal.io、Inngest、yeos.ai）。

## 8. 版本控制（per WORKFLOW §4.2.1）

- 全部版本控制操作走 `but` CLI（禁止 git write 命令）；本票独立分支 `a-011-langgraph-eval`，不动他人分支；不 push（用户未要求）。
- 本票提交物：`reports/11-report.md`（本文件）+ `decision-ledger.md`（A-011 决策记录追加）+ `issues/11-langgraph-eval.md`（状态闭环 + 验收勾选）。
