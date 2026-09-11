# Decision Ledger — architecture-recovery

> 本 ledger 收录架构报告（macro-audit spec-phase-tasks.md）的每个摩擦点/候选项，每条以 A-NNN 编号。
> 每条含：ID / 问题描述原文 / 规范化需求 / 显式约束 / 状态。
> spec 中每条必须声明覆盖哪些 A-xxx；无去向记录清单非空时不得立票。

| ID | 问题描述原文 | 规范化需求 | 显式约束 | 来源决策 |
|---|---|---|---|---|
| A-001 | S1 定位收敛的语义度量方法：定位关键词覆盖率启发式 70% 阈值的校准流程与试点仓库清单 | 定位收敛语义对齐方法（embedding/关键词）需工业界试点校准，阈值不能锁定 70% 为 hard rule | 前置 = CodeLore explain_file 集成测试；高优先级 | D-004 |
| A-002 | S2 ADR 质量"事后补写（文档日期 vs 实现 commit 日期差 > 90 天）> 20% 判红"——目标仓库 ADR YAML 时间戳头一致性核查 | 目标仓库所有 ADR 必须带 YAML 时间戳头，否则 S2 阈值不可执行 | 前置 = 目标仓库样板确认；中优先级 | D-004 |
| A-003 | S4 演化方向的 ADR 假设提取工具链：LLM 辅助抽取 + 人工复核回路（InfoQ 仅为理念文，需自建） | 自建 ADR 假设提取工具链（LLM 抽取 + 人工复核），不可只引 InfoQ 理念文 | 前置 = LLM API 选定；高优先级 | D-004 |
| A-004 | S5 所有权边界匹配在单人仓的判据降权规则：单作者模块占比 vs 团队规模归一化曲线 | 单人仓/小团队场景下 S5 信号弱，必须按团队规模归一化降权 | 前置 = 工业界小团队分布数据；中优先级 | D-004 |
| A-005 | 5 维 × 5 scale = 25 个采集单元的具体判据 + 数据源 + 阈值矩阵 | S1-S5 每维在 5 scale 下的判据/数据源/阈值全矩阵化 | 前置 = D-004 ADR 锁定（已锁）；高优先级；是 001/002/003/004 的上游 | D-004 |
| A-006 | AI-agent 生成代码对 ADR 质量冲击的评估（bool.dev AP8 未展开） | AI 生成代码时代 ADR 质量的长期演化评估 | 前置 = 待 AI 代码生成主流化；低优先级；可推迟 | D-004 |
| A-007 | DuckDB fact table 单写多读 vs 多写多读的并发与版本控制策略 | D-005 Hub-of-Facts 底层 SSOT 的写入策略需在多写并发与版本控制间明确选择 | 前置 = CodeLore DuckDB schema 复审；高优先级 | D-005 |
| A-008 | Schema 版本演进规则（AsyncAPI 事件契约心智，schema 不可改、版本号演进） | D-005 事件单向写入要求 schema 不可改、版本号演进（AsyncAPI 风格） | 前置 = AsyncAPI 工具链选定；高优先级；被 A-009 阻塞 | D-005 |
| A-009 | Read model 失效策略：陈旧读容忍度（事件已写、投影未更新）的 SLA 与触发条件 | D-005 read model 陈旧读的 SLA 与触发条件 | 前置 = D-006 报告模板敲定（依赖 A-014）；中优先级；被 A-008 阻塞 | D-005 |
| A-010 | Cross-scale correlation key（trace_id / baggage_id）字段设计与 OpenTelemetry Baggage 集成 | D-005 跨 scale 观测性字段；fact table schema 前置字段 | 前置 = OpenTelemetry SDK 语言栈选定；高优先级 | D-005 |
| A-011 | LangGraph supervisor 与本仓库 hub 协调层的契合度评估（adopt vs 自研） | D-005 hub 实现路径决策（adopt LangGraph supervisor vs 自研） | 前置 = 本仓库语言栈确定；中优先级 | D-005 |
| A-012 | Data mesh 三大失败模式（无人拥有 in-between / 静默断裂 / 重复劳动）对本仓库的逆推防线设计 | D-005 集成层稳健性：预先设计防线防 data mesh 失败模式 | 前置 = ADR-0005 锁定（已锁）；中优先级 | D-005 |
| A-013 | 工具对齐：metrics layer / OpenTelemetry baggage / AsyncAPI / LangGraph 等参考实现与本仓库语言栈契合度评估 | D-005 实现期风险评估（工具栈契合度） | 前置 = 语言栈（TS / Rust / Python）确定；中优先级 | D-005 |
| A-014 | 共享骨架"最大公约数"具体设计：5 scale × 4 象限矩阵上的交集字段清单 | D-006 报告模板骨架：5 scale × 4 象限矩阵上的共享字段 | 前置 = ADR-0006 锁定（已锁）；高优先级；阻塞 A-015/A-016 | D-006 |
| A-015 | Scale 切片差异的具体边界：尤其 Macro-A（跨仓叙事）vs Micro-A（PR 行级）的表达边界 | D-006 报告模板差异度：每个 scale 切片的专属字段与边界 | 前置 = 真实仓库试点；高优先级；被 A-014 阻塞；阻塞 A-016 | D-006 |
| A-016 | 渲染样式与模板结构的切分：spec 锁定结构与字段、demo 锁定渲染样式（避免 spec 越界到 UI） | D-006 演示层：spec 不锁样式、demo 才锁样式 | 前置 = ADR-0006 + ADR-0007 锁定（已锁）；中优先级；被 A-014 + A-015 阻塞 | D-006 |
| A-017 | 10 路径中"可点演示"vs"文档可读"的成本/价值权衡 | D-007 演示层实施预算：每条路径的"真可点 vs 文档可读"决策 | 前置 = ADR-0007 锁定（已锁）；中优先级；阻塞 A-018 | D-007 |
| A-018 | Failure path 的 verdict-gate 触发条件 + 报告产物形态：每条 failure path 明文规定触发、降级、产物 | D-007 失败路径可演示：10 条 failure path 每条明文规定 verdict-gate / 降级 / 报告产物 | 前置 = ADR-0005 + ADR-0006 锁定（已锁）；高优先级；被 A-017 阻塞 | D-007 |

## A-005 结论落盘（2026-09-11，票 #05 闭环）

- 交付：25 格采集单元矩阵（行 S1-S5 × 列 5 scale）全填无占位，机检 PASS（`reports/05-matrix-check.mjs`）。
- 产物：`reports/05-unit-matrix.json` + `reports/05-unit-matrix.schema.json`（JSON Schema 2020-12）+ `reports/05-report.md`。
- 单元格结构 = OpenSSF Scorecard check + SonarQube (metric,operator,value) 阈值三元组 + provenance 初版参数声明；全部阈值 origin=expert/v1，90 天校准窗口（expires 2026-12-10）。
- 跨仓校准：三档（静态 Alves 百分位 / 相对过滤 Marinescu / 动态 EMA+σ 基线）+ 分桶（language/tech-stack/architecture-role/team-size）+ 试点语料 env-manager/jiahao/anysearch-cli。
- 上游对齐：是 Decision 4.1-4.4 的上游抽象，单维决策映射见 report §3.5；解锁 Wave 2 票 #01/#02/#03/#04/#14。

## 覆盖率自评（退出对账闸前必填）
- 已覆盖：spec.md 中 18 条 Implementation Decision 全部覆盖 A-001 ~ A-018（per Coverage 表）
- 无去向记录：**0**（清单非空时禁止立票 — 当前为空，立票放行）
- 立票情况：18 张 issue + 18 份 handoff + 18 份 prompt + 4 波次 README 全部生成

## 信息缺口与下一题方向
- (动态追加)

## A-006 结论落盘（2026-09-11，票 #06 闭环）

- **决议：推迟（DEFER）**——per spec.md §Decision 4.6「推迟：低优先级；spec 阶段交付评估框架（指标定义 + 取样方法），实际评估待 AI 代码生成主流化」。本票交付框架，**不做实际评估**。
- 交付：评估框架三段（`reports/06-report.md`）——(1) 指标清单 M1 决策一致性 C_est / M2 可逆性 RI / M3 上下文漂移 St+KV（3 核心）+ M4 ADR 密度（补充），全部含机检公式/数据源/检测器/阈值；(2) 取样方法（P0/P1/P2 仓库池 + 排除规则、365 天 default 分支窗口、min 5 ADR / 30 提交、检测流水线配置 schema + 四条 prompt 硬规则）；(3) 推迟触发条件（T1-T8 八条机检矩阵 + 明确不评估清单 + 三级回升路径）。
- 关键约束承接：阈值声明为**初版参数**，复用 ADR-0004 预留的跨仓校准机制，不另起一套；与 A-005 已落盘的 90 天校准窗口同源。
- 上游对齐：本票是 D-004 / S2 ADR Quality 的**时间导数**（S2 评「ADR 现在好不好」，本票评「AI 生成代码是否让 ADR 体系随时间劣化」），主战场在 Macro-C（演化考古）scale。
- **L0 基线（推迟态常驻产物）**：本仓库当前 7 条 ADR（0001-0007）、2 个提交、0 个 AI 归属 trailer——T1/T6/T7/T8 全部未越线，且 min_commit_count / min_adr_count 双重不达标，**L1 取样在物理上不可执行**；推迟是机检必然结果而非主观偏好。
- 依赖关系：与 A-002（ADR 时间戳头）共享证据基础（M3 的 St 需要时间戳）；与 A-003（LLM 抽取工具链）应复用而非另建；与 A-009 的「陈旧」概念**不合并**（A-009 管管道延迟，本票管决策与代码语义错位）。
- 调研依据：atomcode 三引擎 14 查询 / 12 次抓取 / 22 来源；核心证据 = arXiv 2602.07609（一致性检测精度基准）、arXiv 2603.28592（AI 债 22.7% 存活率）、GitClear 2026（重复块 +81%）、SonarQube agentic AI gate、OpenSSF Scorecard。
- 阻塞：无（Blocked by: None），本票一次闭环。

## A-007 结论落盘（2026-09-11，票 #07 闭环）

- **决议：单写多读（Single-Writer / Multi-Reader，SWMR）**——per spec.md §Decision 5.1「决策点：单写多读 vs 多写多读；选前者（SSOT + 集中写入进程）」。**不接受多写多读**，排他理由 4 条（违反 ADR-0005 ④ 控制面/数据面分离 / 版本分配失去确定性 / OCC 冲突重试使 p99 无上界 / 吞吐收益为零，量级余量 3–4 个数量级）。
- **事务隔离：DuckDB 快照隔离（Snapshot Isolation，≈ PostgreSQL repeatable read）**，即官方唯一保证级别，不做覆盖。理由：append-only 负载不需要写偏斜防护；单写者已给出事务全序；SI 的快照正是一次一致 read model 投影所需（报告可重放）；快照边界天然对应 `version` 水位线（对齐 ADR-0005 ③ 可审计）。拒绝 READ COMMITTED（引擎不提供 + 破坏投影一致性）、显式 SERIALIZABLE/悲观锁（与 OCC 设计对抗且冗余）、应用层互斥锁多写（把 hub 拉进数据面）。
- **version schema：批量块分配（block allocation），全局单调、无空洞。** 写者内存水位 `next_version`，每批取块 `[v0, v0+B)`，提交成功才前移、中止则整块释放（gap-free）；启动时 `next_version = MAX(version)+1` 即崩溃恢复点。DDL：`version BIGINT PK` + `schema_version SMALLINT` + `trace_id`/`baggage_id` 预留槽位 + `payload JSON` + `recorded_at`（写者提交时刻）。拒绝 SEQUENCE（回滚产生空洞）、逐行 MAX+1（批内 10k 次元数据求值）、时间戳/UUID（无全序或无水位语义）。
- **并发延迟量化（模型估计，Phase 4 待实测校准）**：写者批提交 p50 **10–30 ms**（10k 行/批，边际 1–3 μs/行）；四通道影响——I1 直接阻塞 **严格 0**（SI 硬保证，读不阻塞写）；I2 同机带宽争用 p99 ≤ 20 ms；I3 checkpoint 停顿 **128 ms（NVMe）/ 512 ms（SATA）**，基准频率 1.28 天 1 次、100× 峰值 78 次/天；I4 版本保留内存 MB 级。并发矩阵：N=0 → p99 ≤ 60 ms；N=5 → ≤ 150 ms；N=10 → ≤ 512 ms。
- **与 A-009 对齐**：最坏陈旧读链路 = 100 ms 窗口 + 30 ms 提交 + 512 ms checkpoint ≈ **0.65 s ≪ 5 s SLA**——本票为 A-009 的 SLA 提供了可行性上界证据。
- **强制设计约束（硬规则）**：批大小 ≥ 10k 行（禁单行 INSERT，延迟差 3,000× 量级）；`checkpoint_threshold = 256 MB`（默认 16 MB 的 16×）；读者快照持有 ≤ 60 s；WAL > 512 MB 告警；写者禁长事务。
- **字段槽位边界**：`schema_version` 归 A-008、`trace_id`/`baggage_id` 归 A-010——本票只预留槽位不定规则，避免下游定义上游的返工。
- **上游对齐**：本票是 ADR-0005 ① 事件单向写入 + ③ 冲突可审计 + ④ hub 不进数据面 的写入侧落地；证据链 = atomcode 三引擎 16 查询 / 14 URL 已读 / 8 域名 / 关键结论双源，对标 SQLite WAL、Apache Iceberg、Delta Lake 三个工业界方案。
- **信息缺口（不掩盖）**：read-under-ingest 端到端 p99 无公开基准（本报告为分解模型估计，公式可证伪，Phase 4 须实测替换）；Quack / DuckLake 无公开性能基准；checkpoint 停顿官方无 p99 曲线。
- **阻塞**：无（Blocked by: None），本票一次闭环；不阻塞他票。

## A-010 结论落盘（2026-09-11，票 #10 闭环）

- **决议：fact table 内联双关联键**——在共享 DuckDB `fact` 表中前置 `trace_id` / `baggage_id`，不另起 `trace` / `baggage` 辅表，保持 ADR-0005 的 SSOT 与 read model 心智。
- **字段定义**：`trace_id CHAR(32) NOT NULL`，来源为 OpenTelemetry `SpanContext.traceId` / W3C `traceparent` 的 16 bytes Trace ID，必须为 32 位小写 hex 且不得全零；`baggage_id CHAR(32) NOT NULL`，来源为 W3C `baggage` 中的 `baggage_id=<opaque-id>` 成员，由审计入口生成 128-bit CSPRNG lower-hex，必须为 32 位小写 hex、不得全零、不得含 PII 或业务可反推编码。
- **语义分工**：`trace_id` 关联一次同步运行链路；`baggage_id` 关联同一 repo/commit/PR/run 的审计意图，覆盖异步 fan-out、重试和补跑导致的新 trace。
- **OTel SDK 清单**：Macro-A/Macro-B/Micro-A/Micro-B 默认 OpenTelemetry JavaScript / Node.js SDK（官方 traces/metrics stable，契合 orchestration、PR hook、IDE/LSP wrapper）；Macro-C 默认 OpenTelemetry Python SDK（官方 traces/metrics stable，契合历史分析、corpus 校准、LLM 抽取流水线）；Rust SDK 仍为 Beta，仅作未来 CodeLore 内核增强，不作为默认主路径；Go SDK 仅在未来自研 Go collector 时启用。
- **交付**：`reports/10-report.md` 含 DDL、字段校验约束、写入不变式、SDK 映射表、4 条跨 scale SQL（按 PR 反查全部 scale、按 trace 还原运行链路、按 commit 查冲突裁决、failure path 查缺失 scale）。
- **调研依据**：W3C Trace Context、W3C Baggage、OpenTelemetry Traces/Baggage/Language SDK 官方文档；本窗口无 `ctx_*` 工具，atomcode 指定 carrier 不可用，报告已按缺口明示并以官方一手文档直读替代。
- **阻塞**：无（Blocked by: None），本票一次闭环；输出供 A-008/A-009/A-012/A-013 复用。

## A-012 结论落盘（2026-09-11，票 #12 闭环）

- **决议：三条事件触发防线**——在 ADR-0005 HoF-FA / SSOT 前提下，不采 Data Mesh 自治副本模式；吸收其失败教训，设计 `Ownership Edge Gate`、`Contract + Lineage Canary Gate`、`Fact Claim + Reuse Gate` 三条防线，分别覆盖无人拥有 in-between、静默断裂、重复劳动。
- **触发条件**：每条防线均以新增/变更 edge、`handoff_ready` 后 ack SLA、read model 发布 checkpoint、lineage event 缺失、fact claim/materialization 等事件或窗口阈值触发；明确禁止只写“持续监控”。
- **量化指标**：报告定义 15 个指标，包括 `owner_missing_count`、`orphan_handoff_count`、`handoff_ack_latency_p95_seconds`、`expectation_success_percent`、`critical_unexpected_count`、`lineage_gap_count`、`read_model_lag_seconds`、`duplicate_materialization_count_24h`、`duplicate_job_seconds_ratio`、`ssot_bypass_count` 等，均含阈值。
- **降级路径**：统一状态机 `normal -> warning -> quarantined -> degraded -> restored`；owner/contract/lineage/claim/metric 任一防线自身失效时，报告降级为 `⚠ unverified` / `data doesn't show`，只保留可审计事实，不给 verified verdict。
- **交付**：`reports/12-report.md` 含三条防线的机制 + 触发条件 + 处置流程、指标清单、防线失效降级路径、完成定义对照、引用文件列表。
- **调研依据**：本窗口无 `ctx_*` 工具，atomcode 指定 carrier 不可用，报告已按缺口明示；以 Data Mesh Principles、OpenLineage、Great Expectations、Google SRE Monitoring 官方/一手文档直读补足工业对标。
- **阻塞**：无（Blocked by: None），本票一次闭环；输出供 A-008/A-009/A-013 复用。

## A-013 结论落盘（2026-09-11，票 #13 闭环）

- **决议：工具分层采用**——`OpenTelemetry Baggage` 采用但仅限 opaque `baggage_id`；`AsyncAPI` 采用为事件契约 / schema 版本治理规范；`metrics layer` 只采用心智并自研轻量 `metric_catalog`，不默认引入 dbt Semantic Layer；`LangGraph` 替代/暂不默认采用，仅作 Python 侧实验 harness 或 A-011 候选。
- **评估矩阵**：`reports/13-report.md` 使用 8 个维度评估四类工具：语言栈契合度、HoF-FA 心智一致性、契约/版本治理价值、观测/关联价值、运行时重量、隐私与安全风险、成熟度与生态、与既有票边界。
- **关键边界**：metrics 不得成为第二事实源；Baggage 不得承载 PII/权限/可信身份；AsyncAPI 定义契约但不定义 broker/runtime；LangGraph checkpoint 不得替代 DuckDB fact table 的审计事实。
- **交付**：`reports/13-report.md` 含工具 × 维度矩阵、每个工具的采用/替代/自研决策、推荐集成组合、完成定义对照、引用文件列表。
- **调研依据**：本窗口无 `ctx_*` 工具，atomcode 指定 carrier 不可用，报告已按缺口明示；以 dbt Semantic Layer、OpenTelemetry Baggage、AsyncAPI Specification、LangGraph Overview 官方文档直读补足工业对标。
- **阻塞**：无（Blocked by: None），本票一次闭环；输出供 A-008/A-009/A-011 复用。
