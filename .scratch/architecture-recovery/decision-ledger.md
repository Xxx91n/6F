# Decision Ledger — architecture-recovery

> 本 ledger 收录架构报告（macro-audit spec-phase-tasks.md）的每个摩擦点/候选项，每条以 A-NNN 编号。
> 每条含：ID / 问题描述原文 / 规范化需求 / 显式约束 / 状态。
> spec 中每条必须声明覆盖哪些 A-xxx；无去向记录清单非空时不得立票。

| ID | 问题描述原文 | 规范化需求 | 显式约束 | 来源决策 |
|---|---|---|---|---|
| A-001 | S1 定位收敛的语义度量方法：定位关键词覆盖率启发式 70% 阈值的校准流程与试点仓库清单 | 定位收敛语义对齐方法（embedding/关键词）需工业界试点校准，阈值不能锁定 70% 为 hard rule | 前置 = CodeLore explain_file 集成测试；高优先级 | D-004 | done — W2 守卫脚本 PASS（75 assertions / 3 真实仓 / 3 embedding 候选 / 70% 跨仓校准） | implemented (W2 #01 done, 守卫 PASS 75 assertions) |
| A-002 | S2 ADR 质量"事后补写（文档日期 vs 实现 commit 日期差 > 90 天）> 20% 判红"——目标仓库 ADR YAML 时间戳头一致性核查 | 目标仓库所有 ADR 必须带 YAML 时间戳头，否则 S2 阈值不可执行 | 前置 = 目标仓库样板确认；中优先级 | D-004 | done — W2 3 真实仓扫描（env-manager 14 ADR / jiahao 58 / anysearch-cli 57）+ 头一致性核查 + git blame 回退精度验证 | implemented (W2 #02 done, 3 仓扫描完成) |
| A-003 | S4 演化方向的 ADR 假设提取工具链：LLM 辅助抽取 + 人工复核回路（InfoQ 仅为理念文，需自建） | 自建 ADR 假设提取工具链（LLM 抽取 + 人工复核），不可只引 InfoQ 理念文 | 前置 = LLM API 选定；高优先级 | D-004 | done — W2 工具链四件套交付 + 独立复核位 25/25 全量抽检（引文 25/25 逐字命中、0 reject） | implemented (W2 #03 done, LLM 抽取工具链 25/25 抽检) |
| A-004 | S5 所有权边界匹配在单人仓的判据降权规则：单作者模块占比 vs 团队规模归一化曲线 | 单人仓/小团队场景下 S5 信号弱，必须按团队规模归一化降权 | 前置 = 工业界小团队分布数据；中优先级 | D-004 | done — W2 分桶/降权系数/信号不足门机检 PASS（3/3 真实案例） | implemented (W2 #04 done, 4 分桶 / 3/3 真实案例) |
| A-005 | 5 维 × 5 scale = 25 个采集单元的具体判据 + 数据源 + 阈值矩阵 | S1-S5 每维在 5 scale 下的判据/数据源/阈值全矩阵化 | 前置 = D-004 ADR 锁定（已锁）；高优先级；是 001/002/003/004 的上游 | D-004 | done — W1 守卫脚本 PASS（25/25 cells, schema-valid） | implemented (W1 #05 done, matrix-check.mjs PASS 25/25) |
| A-006 | AI-agent 生成代码对 ADR 质量冲击的评估（bool.dev AP8 未展开） | AI 生成代码时代 ADR 质量的长期演化评估 | 前置 = 待 AI 代码生成主流化；低优先级；可推迟 | D-004 | deferred — W1 评估框架交付，前置触发：AI 代码生成主流化 | deferred (W1 #06 done evaluation framework, 触发条件: AI 代码生成主流化 — per Decision 4.6) |
| A-007 | DuckDB fact table 单写多读 vs 多写多读的并发与版本控制策略 | D-005 Hub-of-Facts 底层 SSOT 的写入策略需在多写并发与版本控制间明确选择 | 前置 = CodeLore DuckDB schema 复审；高优先级 | D-005 | done — W1 单写多读 SWMR 决议（明文 + 排他理由 4 条） | implemented (W1 #07 done, SWMR 决议 + ADR-0005 一致性论证) |
| A-008 | Schema 版本演进规则（AsyncAPI 事件契约心智，schema 不可改、版本号演进） | D-005 事件单向写入要求 schema 不可改、版本号演进（AsyncAPI 风格） | 前置 = AsyncAPI 工具链选定；高优先级；被 A-009 阻塞 | D-005 | done — W2 #08 注册中心/版本语义/订阅机制/变更事件闭环（reports/08-report.md） | implemented (W2 #08 done, hybrid registry + 3 change events) |
| A-009 | Read model 失效策略：陈旧读容忍度（事件已写、投影未更新）的 SLA 与触发条件 | D-005 read model 陈旧读的 SLA 与触发条件 | 前置 = D-006 报告模板敲定（依赖 A-014）；中优先级；被 A-008 阻塞 | D-005 | done — W3 #09 守卫脚本 PASS（15 checks：SLA numeric + D-006 字段对齐 + 报警量化 + 状态机 5/5） | implemented (W3 #09 done, stale-check.mjs PASS 15 checks) |
| A-010 | Cross-scale correlation key（trace_id / baggage_id）字段设计与 OpenTelemetry Baggage 集成 | D-005 跨 scale 观测性字段；fact table schema 前置字段 | 前置 = OpenTelemetry SDK 语言栈选定；高优先级 | D-005 | done — W1 fact table schema（trace_id/baggage_id CHAR(32), W3C/OTel 对齐） | implemented (W1 #10 done, W3C/OTel 标准对齐) |
| A-011 | LangGraph supervisor 与本仓库 hub 协调层的契合度评估（adopt vs 自研） | D-005 hub 实现路径决策（adopt LangGraph supervisor vs 自研） | 前置 = 本仓库语言栈确定；中优先级 | D-005 | done — W1 自研薄协调层决议（T1/T2 重评触发器明文） | implemented (W1 #11 done, 自研薄协调层 + T1/T2 触发器) |
| A-012 | Data mesh 三大失败模式（无人拥有 in-between / 静默断裂 / 重复劳动）对本仓库的逆推防线设计 | D-005 集成层稳健性：预先设计防线防 data mesh 失败模式 | 前置 = ADR-0005 锁定（已锁）；中优先级 | D-005 | done — W1 防线一 Ownership Edge Gate（机制+触发+处置+量化） | implemented (W1 #12 done, Ownership Edge Gate 防线一) |
| A-013 | 工具对齐：metrics layer / OpenTelemetry baggage / AsyncAPI / LangGraph 等参考实现与本仓库语言栈契合度评估 | D-005 实现期风险评估（工具栈契合度） | 前置 = 语言栈（TS / Rust / Python）确定；中优先级 | D-005 | done — W1 工具×5 维度契合度矩阵 + 每工具采用/替代/自研决策 | implemented (W1 #13 done, 工具×5 维度矩阵 + 决策) |
| A-014 | 共享骨架"最大公约数"具体设计：5 scale × 4 象限矩阵上的交集字段清单 | D-006 报告模板骨架：5 scale × 4 象限矩阵上的共享字段 | 前置 = ADR-0006 锁定（已锁）；高优先级；阻塞 A-015/A-016 | D-006 | done — W2 14-skeleton-check.mjs PASS（4 章 + 45 字段 + 20 单元 + 64 切片字段 + 31 xref to A-005） | implemented (W2 #14 done, skeleton-check.mjs PASS 4 章/45 字段/20 单元) |
| A-015 | Scale 切片差异的具体边界：尤其 Macro-A（跨仓叙事）vs Micro-A（PR 行级）的表达边界 | D-006 报告模板差异度：每个 scale 切片的专属字段与边界 | 前置 = 真实仓库试点；高优先级；被 A-014 阻塞；阻塞 A-016 | D-006 | done — W3 15-slice-check.mjs PASS 13/13（退出码 0：5 切片 x 8 列、10 极端差异维、0 冲突、0 跨 scale 复用）；15-slice-boundaries.json 对 schema 2020-12 经 ajv 校验 valid=true | implemented (W3 #15 done, slice-check.mjs PASS 13/13) |
| A-016 | 渲染样式与模板结构的切分：spec 锁定结构与字段、demo 锁定渲染样式（避免 spec 越界到 UI） | D-006 演示层：spec 不锁样式、demo 才锁样式 | 前置 = ADR-0006 + ADR-0007 锁定（已锁）；中优先级；被 A-014 + A-015 阻塞（均已 done） | D-006 | done — W4 16-render-split-check.mjs PASS 16/16（退出码 0：spec 唯一 109 名 ⊊ demo 137 名、spec∩style=0、越界硬禁扫描 3 个 spec 侧契约文件 0 命中、骨架 50 / 切片 60 上游计数对齐）；16-render-split.json 对 JSON Schema 2020-12 经 ajv 校验 valid=true；三清单 = spec 字段 110 项 / demo 样式 28 个 ui: token / 越界 18 类（17 硬禁 + 1 软警告） | implemented (W4 #16 done, render-split-check.mjs PASS 16/16) |
| A-017 | 10 路径中"可点演示"vs"文档可读"的成本/价值权衡 | D-007 演示层实施预算：每条路径的"真可点 vs 文档可读"决策 | 前置 = ADR-0007 锁定（已锁）；中优先级；阻塞 A-018 | D-007 | done — W1 10 路径决策表（6 可点 / 4 文档 ≥ 5 要求） | implemented (W1 #17 done, 10 路径决策表 6 可点/4 文档) |
| A-018 | Failure path 的 verdict-gate 触发条件 + 报告产物形态：每条 failure path 明文规定触发、降级、产物 | D-007 失败路径可演示：10 条 failure path 每条明文规定 verdict-gate / 降级 / 报告产物 | 前置 = ADR-0005 + ADR-0006 锁定（已锁）；高优先级；被 A-017 阻塞 | D-007  done — W2 5 条 failure path 明文表（每条 4 要素齐全 + 显式 happy path 对比）；FP-4 / Micro-A failure 实跑 9/9 守卫断言 PASS | implemented (W2 #18 done, failure-demo.mjs PASS 9/9) |

## A-017 结论落盘（2026-09-11，票 #17 闭环）

- **决议：6 条可点、4 条文档**——10 路径中 5 个 scale 的 happy path 全部可点，额外选择 `Micro-A failure` 可点；`Macro-A failure`、`Macro-B failure`、`Macro-C failure`、`Micro-B failure` 为文档可读，交由 A-018 明文触发/降级/报告产物，不在 v1 预算内真实点击复现。
- **量化规则**：Demo v1 clickable 总预算上限 21 agent-days；单条 clickable 成本上限 5 agent-days；happy path 只要单条成本 ≤5 必选；failure path 需 `RiskImpact >= 4` 且 `FailureROI = (RiskImpact + GateClarity + FixtureSimplicity) / CostDays >= 5.0`。
- **10 路径决策表**：`reports/17-report.md` §2 给出路径名 / 可点 or 文档 / 理由 / 估计成本；可点路径成本合计 18.5 agent-days，文档路径成本合计 6.5 agent-days。
- **至少 5 路径可点论证**：`reports/17-report.md` §3 论证 5 条 happy path 是 ADR-0001/0002/0007 的最小完整性证明，并用 failure ROI 选中 `Micro-A failure` 作为最高价值失败演示。
- **调研依据**：本窗口无 `ctx_*` / `ctx_batch_execute`，atomcode 指定 carrier 不可用；报告以 ISTQB risk-based testing、Cucumber BDD living documentation、OpenTelemetry Demo、Google SRE Monitoring 官方/一手文档直读补足工业对标，并明示 carrier 缺口。
- **阻塞**：无（Blocked by: None），本票一次闭环；解锁 A-018。

## A-018 结论落盘（2026-09-11，票 #18 闭环）

- **决议：5 条 failure path 全部明文，每条 4 要素齐全**——FP-1 Macro-A failure、FP-2 Macro-B failure、FP-3 Macro-C failure、FP-4 Micro-A failure、FP-5 Micro-B failure；每条明文规定触发条件（含可机检表达式）/ 降级模式（含禁止项）/ verdict-gate 拒绝印记 / 报告产物形态。
- **骨架不变式（本票核心约束）**：任何降级下 ADR-0006 四章标题（执行摘要 → 4 象限 / 裁决 → 证据 → 行动建议）必须逐字存在（yield=1）；降级只改每章 `integrity: {coverage, verdict, render}` 与印记，不改章节结构。依据 ADR-0006 + Fox & Brewer harvest/yield + OTel Demo 同构 span。已做成本票机检断言 A3 / A7。
- **印记词表锁定**：`⚠ data doesn't show: <source_id>` / `⚠ contains uncited claims` / `⚠ gap request: <target>` / `⚠ verdict rejected: <reason_code>` / `⚠ rendering degraded: <section_id>` / `⚠ unverified`；禁止自由发挥（断言 A6）。
- **两类印记分族不得混用**：`data doesn't show` + `gap request` = 采集/证据缺口（不进裁决）；`verdict rejected` + `unverified` = 已进裁决并被驳回。混用会让用户无法区分「没查到」与「查到了但不采信」。
- **演示：FP-4 / Micro-A failure 已跑通**——同一 PR fixture（happy 3/3 带引文 vs failure 0/3 带引文，采集结果同源）经四阶段管线执行，`node 18-failure-demo.mjs` 返回 `EXIT=0`，**9/9 守卫断言 PASS**。
- **产物**：`reports/18-failure-paths.json`、`reports/18-demo-fixture.json`、`reports/18-failure-demo.mjs`、`reports/18-demo-output.md` / `.json`、`reports/18-report.md`。
- **调研依据**：atomcode 5.0.9 经 `ctx_batch_execute(concurrency=1, timeout=600000)` 串行调用（12 次三引擎查询 + 7 次原文核验 + 8+ 域名）；六项工业对标 = Google SRE 错误预算 / OTel Demo flagd / Fox-Brewer Harvest-Yield / Circuit Breaker-Bulkhead / NIST SI-11-AI RMF-ISO 15489 / CodeRabbit 驳回实证 + EY 幻觉风险白皮书。
- **阻塞**：无（#17 已闭环并解锁本票），本票一次闭环。
- **并发写入事件（诚实记录）**：本票首次落盘后，本文件被并行窗口以自持副本覆盖（字节 38,204 → 37,987，行数 152 → 174），A-018 行状态与结论块一度丢失；本票已在**当前最新版**上重新落盘并回读复核。此为共享 append-only 文件在多窗口并行下的**后写覆盖**风险（与 `reports/08-report.md` 记录的教训同源）。
## A-005 结论落盘（2026-09-11，票 #05 闭环）

- 交付：25 格采集单元矩阵（行 S1-S5 × 列 5 scale）全填无占位，机检 PASS（`reports/05-matrix-check.mjs`）。
- 产物：`reports/05-unit-matrix.json` + `reports/05-unit-matrix.schema.json`（JSON Schema 2020-12）+ `reports/05-report.md`。
- 单元格结构 = OpenSSF Scorecard check + SonarQube (metric,operator,value) 阈值三元组 + provenance 初版参数声明；全部阈值 origin=expert/v1，90 天校准窗口（expires 2026-12-10）。
- 跨仓校准：三档（静态 Alves 百分位 / 相对过滤 Marinescu / 动态 EMA+σ 基线）+ 分桶（language/tech-stack/architecture-role/team-size）+ 试点语料 env-manager/jiahao/anysearch-cli。
- 上游对齐：是 Decision 4.1-4.4 的上游抽象，单维决策映射见 report §3.5；解锁 Wave 2 票 #01/#02/#03/#04/#14。


## 账本结算（2026-09-12 整轮收口）

| 类别 | 计数 | 列表 |
|---|---|---|
| **implemented** | 17 | A-001/2/3/4/5/7/8/9/10/11/12/13/14/15/16/17/18 |
| **deferred** | 1 | A-006 (per Decision 4.6) |
| **stale** | 0 | （全部 18 条均已闭环，无 stale）|

**总结**：本轮决策层全部 18 条 A-xxx 已结算（17 implemented + 1 deferred），无 stale；闭环率 100%。

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

## A-011 结论落盘（2026-09-11，票 #11 闭环）

- **决议：自研手写薄协调层，不 adopt LangGraph supervisor，不混合**——hub = 「事实入 → 纯函数裁决 → 事件出」，幂等靠事实键（A-010 trace_id/baggage_id 槽位），hub 无自有持久状态；**重评触发器三件套**：T1 裁决/路由出现 LLM 非确定性推理 → 重评 LangGraph；T2 跨天人工裁决/精确一次跨服务副作用 → 重评 Temporal；T3 批量回填/调度/血缘一等需求 → 重评 Dagster。任一触发时 DuckDB fact table 仍是唯一领域 SSOT。
- **决策矩阵 7 维**（reports/11-report.md §4.3）：adopt 在 SSOT 冲突面（checkpointer 第二状态库）、hub 元逻辑边界、学习曲线（10-14 天 + langgraph-supervisor 包官方弃维护）、安全暴露面（checkpoint 反序列化 RCE CVE-2025-64439 等 4 CVE）、语言栈耦合 5 维全劣；自研 5 优 2 中 0 劣；混合 0 优 2 中 5 劣（嵌入即产生状态对账面，退化为带全部成本的 adopt）。
- **契合度评分 6 维均分 2.33/5**（§4.2）：最低分恰在本仓库宪法级约束——SSOT 状态模型契合 1/5、控制面/数据面分离 2/5、确定性/可审计性 2/5；语言/生态契合 4/5 不构成障碍也无锁定收益。
- **排他理由 5 条**（§4.4）：SSOT 宪法级约束（不用 checkpointer 等于不用 LangGraph）；语义错位（supervisor 价值域 = LLM 子 agent 图控流，5 scale worker 是确定性服务）；官方 supervisor 包弃维护（违反 D-002 升级路径）；安全面叠加；语言栈前置未满足（adopt 会把栈决策偷跑成框架决策，自研保持 TS/Rust/Python 三栈开放）。
- **与 A-013 互证**：A-013 已结论「LangGraph 替代/暂不默认采用，仅作 Python 侧实验 harness 或 A-011 候选」——本票将该候选路径正式关闭（T1 触发器除外），LangGraph checkpoint 不得替代 DuckDB fact table 审计事实的边界继续有效。
- **自研代价（明示）**：放弃现成检查点/HITL/流式/图可视化（T1-T3 触发时再引入或自建）；幂等/重试/降级自写自测；「hub 无自有持久状态」作为硬不变量移交 A-012 评审 checklist。
- **调研依据**：atomcode 双 run 串行深度调研（per WORKFLOW §4.2.3）：run 1 LangGraph 能力现状（PyPI 1.2.11 / npm 1.4.14 / MIT / v1.0 GA 2025-10-22，官方文档逐页核验 + CSA 安全报告 + HN/dev.to 批评面）；run 2 SSOT 契合与替代方案（searches 12 / angles 5/5 / full reads 10，Temporal/Fowler/Inngest/yeos.ai 十篇原文）；对标工业界 4 方案（Temporal durable execution / yeos.ai 移除实践 / Inngest 队列机制 / 官方 supervisor→subagents 迁移指南）。
- **信息缺口（不掩盖）**：语言栈未锁定（A-010/A-011/A-013 共同前置，本票以三栈稳健性处理）；DuckDB+编排框架共存无一手实践案例（结论基于框架侧双源证据外推）；Klarna/Lyft 数字为厂商叙事未独立审计。
- **阻塞**：无（Blocked by: None），本票一次闭环；不阻塞他票。

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

## A-013 二次闭环落盘（2026-09-11，本窗口精化段 — 与上行初版段并存，初版段不动）

- **定位**：初版段（并行窗口，提交 szs）在无 `ctx_*` 条件下完成 8 维矩阵与四工具决策并按 §7 自曝 atomcode 调研缺口。本段为其精化闭环：补齐 WORKFLOW §4.2.3 两轮串行 atomcode 深度调研，并在其结论上做证据级修正——**四工具决策方向与初版一致（metrics layer 自研轻量 / Baggage 采用受限 / AsyncAPI 采用 / LangGraph 不进 hub），无冲突推翻**。
- **修正 1（LangGraph）**：初版「暂不默认采用」的首条理由是「官方证据主要 Python、TS 未取证」——调研实证 Python 与 JS/TS 双栈 1.0 GA（2025-10）、主要功能全对等（StateGraph/checkpointer/interrupt/流式/subgraphs），该理由**撤销**；维持不默认采用的理由收敛为：checkpointer 无 DuckDB 后端（官方矩阵 MemorySaver/SQLite/Postgres/MongoDB/Redis）、其线程状态若存业务事实即违反 SSOT、hub 决策权归 A-011。窄采用面与初版一致：Macro-C LLM 流水线本地 harness；本段新增量化边界：学习曲线 2-4 周（独立评测）、checkpoint 无界增长与 thread_id 255 字符上限为实坑、官方「vs Temporal」文为营销信源需降权、其状态持久化若启用必须经 A-007 单写者队列。
- **修正 2（metrics layer 候选集）**：初版仅评 dbt SL/MetricFlow——本段扩展 Cube（JS 核心契合 TS 主栈、DuckDB 一级数据源、但常驻服务 + 第二缓存层，M3/M5 降）与 Malloy（compile-to-SQL 最轻嵌入、原生 duckdb.table、但无命名生产采用者），结论「自研轻量 metric_catalog」在三候选对比下更稳；指标目录字段初版表（metric_id/owner/definition_sql/unit/window/threshold/source_fact_types/report_binding）保留为采纳设计。
- **补充 3（AsyncAPI）**：采用结论一致；追加硬约束——规范层 3.0→3.1 间隔两年、第三方工具常滞后至只支持 2.6.0（进 3.x 前须验证生成器）、**无官方 registry/版本管理协议**（契约版本注册走 A-008 自研 schema_registry 版本表）、**2026-07-14 generator 系 + spec-json-schemas 供应链攻击**（npm exact-version + provenance 校验，白名单 generator ≥3.3.0 / specs 6.11.1）。
- **补充 4（Baggage）**：受限采用一致；W3C 64 条目/8KB 限值 + CVE-2026-45292（Java ≤1.61.0，1.62.0 修复）入红线；「Rust 三信号全 Beta、JS/Python Traces/Metrics Stable」与 A-010 SDK 清单双源互证一致。
- **交付**：`reports/13-report.md`（二次闭环版：M1-M5 五维矩阵 + 每工具采用/替代/自研决策 + 采用面/禁用面/重评触发三件套 + 工业对标 4 组 + §5 atomcode 调研记录；报告头含与初版 szs 的版本关系声明）。
- **调研依据**：atomcode R1（OTel Baggage × MetricFlow/Cube/Malloy，19 来源双源交叉）+ R2（AsyncAPI × LangGraph，A1-A10/L1-L10），ctx_batch_execute concurrency=1 timeout=600000 串行两轮，per §4.2.3。
- **阻塞**：无；本票经「初版 + 本段精化」双提交完整闭环，输出供 A-008/A-009/A-011/A-012 复用。


## A-004 结论落盘（2026-09-11，票 #04 闭环）

- **决议：团队规模分桶降权双机制 + 三门回退**——分桶 B1(1) / B2(2-5) / B3(6-11) / B4(12+) 按人类 actor 计数（身份归一化：tool/AI agent 不计入团队规模、同 email 必并、跨 email 默认不并、structural-solo override top≥90% 且其余 <5% 强制 B1 upper_bounded）；每桶 threshold_offset +0.50 / +0.25 / +0.10 / +0.00（生效 value_eff = value + offset）+ weight_coefficient ×0.25 / ×0.50 / ×0.75 / ×1.00（乘入 risk_weight）。
- **信号不足门**：G1 无所有权工件（B1 且无 CODEOWNERS/双人类 owner 且无双人类 reviewer）/ G2 窗口样本 <30 commits / G3 AI 劳动占比 ≥50% 且 H≤1；任一触发 → verdict=insufficient_signal，象限聚合剔除 S5 并归一化（drop_s5），报告按 Sufficiency Gate 渲染「data doesn't show」并输出 restore_evidence。
- **机检交付**：reports/04-downweight.json（规则集 + s5_signal_assessment 14 字段块 + 3 案例证据）+ reports/04-downweight-check.mjs（桶连续性/单调性、05 矩阵快照对账、B1 饱和、逐案例重算）→ PASS（exit=0）。
- **真实案例验证（3/3）**：env-manager（1 人类 + AI 劳动 97.9% → G1+G3）/ anysearch-cli（override B1 upper_bounded → G1）/ jiahao（override → G1）——naive v1 阈值三例全误报黄，降权后全部正确落入 insufficient_signal。
- **调研依据**：atomcode 三引擎 24 来源 / 13 全文核读（per §4.2.3）；证实工业界无已发表团队规模归一化系数（OpenSSF Badge/Scorecard = 绝对阈值 + 小团队豁免；Team Topologies = 5-9 粒度原则；Safeguard.sh = 结构性单人判据；Avelino 2016 = TF 分布锚点），本票系数表即落该空位。
- **信息缺口**：B2-B4 系数无真实仓验证（三试点全 B1，90 天窗口内补语料按 Alves 桶内百分位重校准）；系数整体为 expert v1 推断；squash/merge 归因低估 AI 份额。
- **阻塞**：无（Blocked by #05 已闭环）；输出供 A-014（字段块收编共享骨架）与 A-009（陈旧标记同族）复用。

## A-002 结论落盘（2026-09-11，票 #02 闭环）

- **决议：交付可复用扫描器 + git 首提交回退方案 + 精度证据（n=108），阈值本身不动**——per spec.md §Decision 4.2「交付目标仓库 ADR YAML 时间戳头一致性核查清单 + 缺失头时的回退方案」+「阈值'事后补写 > 90 天 > 20% 判红'作为初版参数，预留跨仓校准」。本票只解决前置基础设施（让 S2 阈值在真实仓库上能跑），不修改阈值。
- **工业界 YAML 头采纳率 < 1%**——本仓库 6F（7/7 无头）+ env-manager（13/14 无完整头）+ jiahao（57/57 无头）+ anysearch-cli（56/56 无头）+ log4brains（14/14 无头，Nygard 内联）+ madr-sample（21/21 无决策 schema，Jekyll nav frontmatter）= 168/169 无完整 YAML 头。与 atomcode 引用的 IEEE Access MSR（~50% 仓 1-5 ADR，主流 Nygard）+ ICSA 2026（63% 直接 accepted）方向一致——**S2 阈值如不提供回退方案，在真实仓库 99% 场景下不可计算**。
- **回退链落地**（per mcp-adr-analysis-server ADR-011 + log4brains README + how2.sh 三源共识）：YAML frontmatter date → 内联 Nygard date → 内联中文 date（未来扩展）→ git first-commit date → filesystem mtime（最后手段）。scripts: `reports/02-adr-header-scan.mjs`（扫描器）+ `reports/02-adr-fallback.mjs`（回退器），纯 ESM Node.js 无依赖。
- **精度首次系统化测量**（n=108 真实样本）：median abs delta = 0d（决策与写文件同一 commit），63% 完美一致，73% ≤ 7d，2.1% > 90d（仅看 3 个完整 history 本地仓，剥离浅克隆污染）。**本票确认无任何公开 precision/recall 基准**——atomcode 调研 16 searches / 9 full reads 全部空白，本数据是初版基线。
- **浅克隆污染量化**：log4brains + madr-sample 用 `--depth 1` 克隆，10 个最大 backdated 全部是 shallow pack 边界（delta 1505-2997d），**log4brains README 的 `fetch-depth: 0` 要求是硬约束**——本票剥离后真实回退精度回归到 73% ≤ 7d 的纯净估计。
- **S2 阈值在 3 个完整 history 本地仓的初测**：2.1% backdated > 90d，远低于 §Decision 4.2 的 20% 红线，**本批本地仓判绿**。S2xMACRO-B 单元格判据/数据源现可机检。
- **本批本地仓发现的边界 case**：6F 当前 7/7 ADR 在 `zz [uncommitted]` 未 commit 状态——git 回退全部返回 null。**S2 阈值在 commit 前不可计算**——给其他 agent 提示：W2 票 commit 后立即可跑扫描器。
- **S2xMACRO-C 单元格落地**：per reports/05-report.md Deliverable 1 notes 承诺"时间戳头缺失时回退 git log 首次出现日（per Decision 4.2 回退方案）"——本票正式落地此承诺。
- **跨仓校准池扩展**：n=108 数据进入 A-005 25 矩阵的 S2xMACRO-C 校准池（per reports/05-report.md Deliverable 3 跨仓校准机制 + pilot_corpus）。
- **上游对齐**：本票是 §Decision 4.2 的基础设施层落地，与 S2xMACRO-B / S2xMACRO-C 两个单元格数据源对接，承接 A-005 25 矩阵的 90 天校准窗口。
- **调研依据**：atomcode R1（ADR 头格式生态）searches 16（Exa×8 + Tavily×3 + AnySearch×5）/ full reads 9 / domains 6 / 5 angles 全覆盖；核心证据 = MADR 4.0 + Nygard/adr-tools + IEEE Access MSR + ICSA 2026 + ECSA 2026 + log4brains + mcp-adr-analysis-server。
- **阻塞**：无（Blocked by #05 已解除），本票一次闭环；输出供 S2xMACRO-B / S2xMACRO-C 复用。

## A-003 结论落盘（2026-09-11，票 #03 闭环）

- 交付：S4 ADR 假设提取工具链 v1 四件套——① 抽取 prompt 模板（System Prompt 8 规则 + JSON Schema v1 + 合成 few-shot）；② 人工抽检 checklist（6 步 + 0-3 量表 + F1-F6 失败模式 + 抽样/escalation 规则）；③ 6 ADR × 25 假设完整抽取案例（独立复核位全量抽检：引文 25/25 逐字命中、0 reject、13 adopt / 12 fix）；④ 可复用程度说明（方法层 L0-L1 可复用 / 参数层 L2 本地化，迁移成本 <1 agent-day）。产物：reports/03-extraction-prompt.md + 03-spotcheck-checklist.md + 03-extraction-cases.md + 03-reusability.md + 03-report.md。
- spec §4.3 附加交付：假设失效集对照表模板（vs InfoQ ADR Drift Monitor 10 行理念映射，采纳/改造/不采纳逐行注明）；LLM+人工复核回路为硬规则且实际运行——回路实证：复核位捕获抽取位自察不到的生成残渣 token（AS-0005-01 "Đây"）与 4 处 F2/F4 语气硬化/类别错标，"不能只信 LLM"从口号变 measured。
- 失效判定：CONFIRMED 21 / PARTIAL-DRIFT 1（AS-0001-03：ADR-0001"四象限只在 Macro-B"vs ADR-0004 战略象限跨 5 scale 的未明文豁免张力 → **交 verdict-gate 裁决，本票不代裁**）/ INSUFFICIENT-EVIDENCE 3 / EXPIRED 0（最近定时点 AS-0004-02 = 2026-12-10 校准窗口到期）。
- 成功与失败并存：success 案例 ×3（0001/0003/0007）+ partial ×3（0002/0004/0005）；条目级失败原样保留（F2×2/F3×2/F4×1/残渣×1/修复轮×2/rejected×4），未重跑洗白。
- 调研：atomcode 5.0.9 真实执行（三引擎 + 原文精读，无 carrier 缺口）；对标 5 个（Assumption Mapping / AADF·Yang2018·Kruchten2006 / FPF arXiv:2601.21116 / arXiv:2602.07609 / InfoQ 2026-08-17）。
- 上游对齐：工具链输出按 falsifiable/quote_span/signal_type 填入 A-005 矩阵 S4 行（reusability §集成点）；90 天校准窗口与 A-005 同源；与 A-006 共享 assumptions 基线（复用不另建，per A-006 落盘）。
- 阻塞：无；A-018 闭环后应回跑本工具链核对 verdict-gate 印记机检面（AS-0007-02/0007-04 验收载体）。

## A-008 结论落盘（2026-09-12，票 #08 闭环）

- **决议：混合式注册中心 + 单调序号版本语义 + BACKWARD_TRANSITIVE 订阅 + 三变更事件**——① 注册中心 = git 内 AsyncAPI 契约层（source of truth，PR + CI 机检）+ 与 fact table 同库的 DuckDB 元数据表 `schema_registry`（版本解析 + FK 引用完整性 + 审计）+ 消费层 schema-on-read；**明确不建 HTTP 服务**（单写者使并发注册仲裁价值归零，且第二存储违反 SSOT 心智）；API 形状照抄 Confluent 四操作语义（register / get-by-id / list / check-compat），以内部函数 + 只读视图形态存在，未来多写者时可无缝切 Apicurio（ccompat v7/v8）。② 版本号语义 = `schema_version` 为从 1 起单调递增 SMALLINT 序号（**不装 SemVer**，SchemaVer 论证 SemVer 面向代码依赖方而 schema 关心历史数据可读性）；主/次/补丁映射为 SchemaVer 的 MODEL / REVISION / ADDITION，作为变更评审语言写入 `schema_registry.change_class`，破坏性大版本进契约文档名（`fact.v1`→`fact.v2`）；序号是位置索引、`schema_digest`（SHA-256）是内容寻址标识，防「版本号撒谎」。③ 消费者订阅 = 写侧闸门 BACKWARD_TRANSITIVE（保证新消费者读全部历史 + 可 rewind），读侧按版本区间声明 + 逐事件 `schema_version` 分派解析（schema-on-read）；未知版本默认跳过 + 计数 + 告警，关键消费者阻断进 DLQ，并利用 JSON payload 可无损暂存特性先入库后补解析；expand-contract 四步（兼容门禁→注册→写入切换→消费迁移→弃用）含 I1–I9 不变式，弃用窗口 ≥1 发布周期。④ 变更事件契约 = `SchemaVersionRegistered` / `SchemaVersionRejected`（409 Incompatible + verbose messages[]）/ `SchemaVersionDeprecated`，CloudEvents 信封写回 `schema_change_log` 审计表，接入 A-012 的 Contract/Lineage Canary Gate；硬规则：关闭 auto-registration，注册只在 hub 侧显式发生（ADR-0005 ④）。
- **对 #07 DDL 的唯一增量**：`fact.schema_version` 加 `REFERENCES schema_registry(version)` FK——DuckDB 官方明说 `ALTER TABLE ... ADD CONSTRAINT` 仅部分支持，**DDL 冻结后无法补**，必须在建表时声明；且 `schema_registry` 必须先于 `fact` 创建。降级方案 = 写者进程内引用检查 + 机检对账 SQL（reports/08-report.md §4.1.6）。
- **交付**：`reports/08-report.md`（已提交 commit nqu @ branch a008-schema-versioning）含注册中心三层架构与 DDL、四操作 API 形状表、版本号语义映射表、订阅机制（写侧策略 + 读侧区间 + 未知版本三策略 + expand-contract 四步与 I1–I9）、三变更事件契约、7 方案工业对标矩阵、11 条反例、完成定义对照、引用文件列表。
- **调研依据**：atomcode 两轮串行深度调研（per WORKFLOW §4.2.3，ctx_batch_execute concurrency=1 timeout=600000）：R1 工业界 schema 版本演进方案（三引擎；Confluent / Apicurio / AsyncAPI / JSON Schema $id / AWS Glue / Iceberg / Delta Lake / Event Sourcing 七方案 + 11 反例）；R2 DuckDB 落地与供应链风险（DuckDB FK 强制执行 / 核心无 JSON Schema draft 校验 / expand-contract / 未知版本三策略 / AsyncAPI 3.1 registry 生态 / 2026-07-14 供应链攻击）。
- **信息缺口（不掩盖）**：DuckDB 核心无 JSON Schema draft 校验函数（社区扩展 json_schema 实验性，draft 校验改放写者进程 + CI）；无完全同构公开先例（expand-contract 不变式为合成推断，中-高置信）；DuckDB FK 写入开销无公开基准；Microcks 对 AsyncAPI 3.1.0 显式支持声明 data does not show；Apicurio 版本口径冲突（3.3.x 支持 3.1.0，Red Hat 3.1 build 仅到 3.0.0）。
- **并发写入事件（诚实记录）**：本票首次落盘后，本文件被另一并行窗口以自持副本覆盖（mtime 00:40，字节 35335→33626），A-008 行状态与块一度丢失；本票已在**当前最新版**上重新落盘（此为该共享文件的已知并发写风险，per 用户「与其他分支并行修复」）。
- **阻塞**：无（Blocked by #07 已闭环）；本票一次闭环，输出供 A-009 / A-014 / A-018 复用。

## A-015 结论落盘（2026-09-12，票 #15 闭环）

- **决议：5 档切片的差异边界 = 8 列契约**——spec §Decision 6.2 强制 5 列（触发器 / 输入 / 输出粒度 / 引文密度 / verdict-gate 印记位置）+ 本票扩展 3 列（时间跨度 / 降级形态 / 切片命名空间）；每切片至少 7 列有值（机检 A1 要求 ≥5）。
- **Macro-A vs Micro-A 极端差异**：10 个维度两端取值全部互斥——输出粒度（跨仓叙事 vs 行级 file:line）、引文精度（repo@sha vs file:line）、引文密度（≥3 vs ≥1 且必须行级）、裁决进入方式（组合级不阻断 vs 行级可阻断 PR 合并）、时间跨度（90d 窗口 vs 单次提交）、触发器（季度/手动 vs push hook）、降级形态（FP-1 GapRequest 补查 vs FP-4 引文 0/3）、典型证据量级、关联方式（同一 correlation_key 双向对齐）、审计对象主体。
- **命名空间冲突契约 R1-R7**：切片字段只能挂 `quadrants[].slice_fields`；与骨架 44 个字段名交集 = 0；跨 scale 交集 = 0；同 scale 跨象限复用必须带 origin（4 处已知复用，只引用不复制）。**不引入 `scale_<s>.` 前缀**（会与 A-014 已锁定的 60 个切片字段名冲突），改用嵌套命名空间 + OTel 前缀借用禁令 R7。
- **调研依据**：atomcode 深度调研 13 查询 / 4 角度 / 10 次全文核验 / 9 独立域名；SARIF 2.1.0、GitHub code scanning、IEEE 829、OTel naming、JSON Schema 2020-12、NIST SSDF、Trail of Bits 均为有直接先例；**「单一 schema 横跨 5 档连续谱」无先例，属组合式创新**，风险点在中间 3 档。
- **推迟**：`verdict_gate.severity` 严重度分桶（社区对 CVSS 桶边界存在真实分歧，本票不代裁）；SARIF 2.2 `precision` 原生字段（2.2 未发布，待发布后迁移）；中间 3 档字段组合空档的样例验证。
- **阻塞**：无（Blocked by #14 已闭环），解锁 A-016。

## A-009 结论落盘（2026-09-12，票 #09 闭环）

- **决议：陈旧读 SLA 默认 5 秒（数字）+ 两级阈值 warn=5s / error=15s + 连续 3 周期去抖 / 6 周期迟滞清除 + 报告层 stale_data_marker 四态枚举**——per spec.md §Decision 5.3「陈旧读容忍度 SLA（默认 5 秒）+ 触发条件（投影延迟 > SLA 时报警）+ 与 D-006 报告模板的『陈旧数据标记』字段对齐」。
- **SLA 可行性上界（承接 A-007）**：最坏陈旧读链路 = 100ms 窗口 + 30ms 提交 + 512ms checkpoint ≈ 0.65s ≪ 5s（余量 7.69x）；工业锚点区间 DynamoDB 1s ～ CockroachDB follower read 4.2s ～ Marten staleThreshold 30s。
- **per-scale SLA（全数字）**：MICRO-A 2/2/6、MICRO-B 5/5/15、MACRO-B 15/15/45、MACRO-C 60/60/180、MACRO-A 300/300/900（sla/warn/error）；调优指南 G1-G5 每条含数字依据（p95 分位 / 成本倍率 2.5 / 90 天校准窗口）。
- **报警触发逻辑（5 条，全量化）**：T1 lag>5s 连续 3 周期 → warn；T2 lag>15s 连续 3 周期 → stale；T3 趋势（60s 内单调非减且增量>5s）→ warn；T4 投影停滞（read_model_version 30s 不变且水位递增）→ stale；T5 探测失败 → unknown（fail-closed）。清除阈值 6 > 触发阈值 3（非对称迟滞）。
- **与 A-012 对齐（策略 owner 声明）**：A-012 §4 的 read_model_lag_seconds「>5s 持续 3 周期 → critical」与本票 T1/T2 的 warn_consecutive_periods=3 逐值一致；本票为该指标完整策略 owner，A-012 仅消费触发语义（A-012 §6 已声明）。
- **报告模板「陈旧数据标记」字段（与 D-006 对齐）**：对 D-006 骨架做**版本化追加扩展**（ADDITION，1.0.0 → 1.1.0），C1 执行摘要新增 5 字段——stale_data_marker（enum[fresh|warn|stale|unknown]）、staleness_sla_seconds、read_model_lag_seconds、read_model_version、fact_watermark_version；逐字复用 D-006 既有字段名 5 个（generated_at / degraded_mode / collected_at / grounded / verdict_gate_stamp）；ADR-0006 四章结构不变（yield=1）。
- **DuckDB 落地探测**：fact 水位 MAX(version)/MAX(recorded_at)；read model 版本取自控制表 control.read_model_state.last_processed_version（DuckDB 核心无物化视图/时间旅行，roadmap discussion #3638 未落地，必须自建水位）。
- **交付**：reports/09-report.md、reports/09-stale-marker-fields.json（10402 bytes）、reports/09-stale-check.mjs（**PASS 15 checks，EXIT=0**）、reports/14-skeleton-fields.json（追加扩展）。
- **调研依据**：atomcode 5.0.9 两轮串行（per WORKFLOW §4.2.3，ctx_batch_execute concurrency=1 timeout=600000）：R1 工业界 staleness SLA（22 searches / 25 full reads / 18 来源）；R2 DuckDB 探测 + 契约层字段惯例（13 原文核验 / 三引擎交叉）。六项工业对标 = dbt freshness / Prometheus for: / Marten healthchecks / DataHub freshness assertion / OpenLineage TestRunFacet / Google SRE burn-rate。
- **信息缺口（不掩盖）**：per-scale SLA 为 expert/v1 推断（无真实仓试点，90 天校准窗口 expires 2026-12-10）；探测 SQL 未在本机 DuckDB 实机执行；DuckDB 核心 MV 无版本承诺。
- **并发写入事件（诚实记录）**：本文件为多窗口共享 append-only 文件，已知后写覆盖风险（与 A-008 / A-018 记录的教训同源）；本票在**当前最新版**上追加并回读复核。
- **阻塞**：无（Blocked by #08 已闭环）；本票一次闭环，输出供 A-015 / A-016 复用。

---

## R3 执行轮摩擦点登记（2026-09-12，任务书 T1~T6 → A-019 ~ A-030）

> 来源：macro-audit/reports/R3-Q1/Q2/Q3-atomcode-research.md 信息缺口与候选段 + macro-audit/decision-ledger.md D-016~D-018 后续影响 + handoffs/next-round.md T1~T6。
> 编号续接 A-001~A-018（上轮已闭环，被 18 票×3 工件+reports 引用）；/goal 原文「A-001 起」按续编号执行——覆写既有编号属破坏性动作，未经用户明示不做。
> 本轮登记状态一律 current；票闭环后按上轮模式回写 done/deferred + implemented 注记。

| ID | 问题描述原文 | 规范化需求 | 显式约束 | 来源决策 | 状态 |
|---|---|---|---|---|---|
| A-019 | 阶段 0 任务「push + CI 实跑（远端与时机须用户授权）」——当前仓无 push 动作、engine-ci.yml 未实跑（「否则 C 的所有验证跑在未 push 分支上，GitButler 分支隔离形同虚设」） | push 到用户指定远端并触发 engine-ci.yml 实跑，取得首个绿/红 CI 证据 | push 属外部副作用：远端与时机必须用户明示；未授权不得推 | D-016 | done — 票 #19 闭环（2026-09-13）：R3 栈（grill ac03dda → 19 0f111c4 → 20 654db79）经 `but config push-remote origin` + `but push` 推达 origin（4 commits / 3 branches）；engine-ci 首跑 **绿** run 34736927344（6/6 job，head 20-fact-schema-v0@654db79，2026-09-13T04:02:09Z→04:02:53Z）  **→ implemented（收口结算 2026-09-13）** |
| A-020 | engine-ci.yml 的平台/触发矩阵范围未在 R3 决策中明文（「CI 实跑」是唯一可并行项，但矩阵未定义） | CI 矩阵平台范围明文化（最小可证集）并随首跑验证 | 不扩矩阵范围（稀释禁令）；矩阵变更须记录进报告 | D-016 | done — 票 #19 闭环：矩阵「最小可证集」一档（3 OS × Node 20/22 = 6 cells）随首跑 run 34736927344 验证 6/6 绿；未扩平台（稀释禁令）  **→ implemented（收口结算 2026-09-13）** |
| A-021 | 「最小 DuckDB fact table schema v0：事件只追加 + correlation key 字段…（正是 D-005 缺口 #10 的前置落地）」——v0 字段级清单与 DuckDB-TS 绑定选型未定（上轮 A-007/008/010 已给策略决议：SWMR/版本号/correlation key） | schema v0 字段清单（含 correlation key 前置字段）+ DuckDB-in-node 绑定选型落文并实现 | 沿用 A-007 单写多读、A-008 版本演进、A-010 correlation key 决议，不重开；只追加不改写（事件单向） | D-016 | done — 票 #20 闭环：绑定唯一 @duckdb/node-api@1.5.5-r.4（4 候选量化对照 + 排他理由，无骑墙）；audit_fact 16 列 + schema_registry 5 列（correlation key 前置、schema_version FK 在 DDL 冻结前声明）；只追加守卫 reports/20-fact-schema-check.mjs 28/28 PASS（退出码 0）；沿用 A-007/A-008/A-010 不重开  **→ implemented（收口结算 2026-09-13）** |
| A-022 | 「确定性采集器（git log / docs/adr 结构扫描；不接 LLM）」——采集器具体清单与判据绑定路径未定（「正对照 2 条须与真判据共享 detector 路径（同一族确定性采集器）」） | 采集器清单（S2 ADR 结构扫描 + S1 定位素材 + git log）落文并实现，输出形状绑定 schema v0 | 不接 LLM；正对照与真判据必须同族 detector；输出只追加写 fact table | D-016/D-018 | done — 票 #21 闭环：三族采集器 adr-structure@v1 / positioning@v1 / gitlog@v1 落地于 engine/src/collect/collectors.ts；映射表先落文（reports/21-collector-map.md + 21-collectors.json）；DETECTOR_BINDING 落「判据 → 采集器族」映射（2 正对照 + 3 真判据 + 1 负对照；PC-1 跨族驱动 adr-structure + positioning、PC-2 驱动 gitlog × adr-structure，解 D-018 数量不匹配冲突 C-21-1，2+3+1 配比未改）；不接 LLM 已机检（源码零网络 / 零模型 API / 零子进程 / 零 fs / 无 Date.now 与 Math.random，守卫 N1-N6）；守卫 reports/21-collectors-check.mjs 43/43 PASS（退出码 0），#20 守卫回归 28/28 PASS；阈值全 null 留给票 22（A-023 纪律） **→ implemented（收口结算 2026-09-13）** |
| A-023 | 「真判据 3 条的具体阈值（90 天/10%/30% 等示例数值）需用户或团队校准后写入预声明文档——atomcode 只给措辞框架不给数值（数值本就该由跑前测定决定）」 | 3 条真判据（候选：S2a 事后补写占比 / S2b 五件套完整度 / S1 定位关键词覆盖率）阈值在跑 6F 前测定并写入预声明文档 | 阈值跑前写死、跑后禁调（ISO 13528 纪律）；判据确定性、不接 LLM | D-018 | done — 票 #22 闭环：3 条真判据阈值由 6F 只读实测测定并写入预声明文档（TC-1 可判定数 2 < 门槛 5 → INCONCLUSIVE；TC-2 mean_ratio 0.2462 + Status/Date 缺失率 84.62% → RED；TC-3 最低 ratio 0.6000 → AMBER）；数字与测定方法同段落盘，跑后禁调，改数须 v2 追加且 v1 留档 **→ implemented（收口结算 2026-09-13）** |
| A-024 | 「负对照的"已知干净"片段选材——6F 内无正式审计过的干净区，建议取最近一轮审计返工后的文件（如 LICENSE/CHANGELOG/PROVENANCE）」 | 负对照片段选定 + 预期 0 命中声明 + 命中后的复核路径写进预声明文档 | 命中走复核不自动定罪（「已知干净」本身可能错） | D-018 | done — 票 #22 闭环：负对照选材 engine/src/fact/schema.ts（票 20 返工产物、纯契约代码、不在 TC-2 扫描作用域、非采集器源码），备份选材 .gitattributes；预期 0 命中三条件 N-a/N-b/N-c + 命中后 4 步复核路径（先疑选材 → 判族误报 P1 → 换选材 → 强制留痕）齐备 **→ implemented（收口结算 2026-09-13）** |
| A-025 | 「跑 6F 之前以确定性规则写下判据并 commit 入库」+「C 层裁定依据在看报告前写死入库（防 HARKing）」——预声明文档的存放路径、文件形式、commit 时机未定 | 预声明文档（三级 kill criterion 措辞 + 2+3+1 判据表）+ C 层裁定依据预入库文件落位并 commit；时机先于首报 | commit 先于跑 6F（HARKing 禁令）；文档须用户审阅后才 commit | D-017/D-018 | done — 票 #22 闭环：预声明文档 reports/22-criteria-pre-registration.md + C 层裁定依据预入库 reports/22-c-adjudication-basis.md 落位，并按闸门顺序（成稿 → 用户审阅 → commit）commit 至独立分支 22-b-criteria-prereg；commit 先于票 23 首报，HARKing 禁令成立 **→ implemented（收口结算 2026-09-13）** |
| A-026 | 「产出第一份带引文 + 裁决回执（Receipt）的真报告」「真报告载体 =「报告生成器」CLI 外壳」——报告文件格式、输出位置、共享骨架字段 v0 渲染范围未定 | 首报格式（md 主产物 + 引文可回查 + Receipt 印记）与输出路径定版并实现于「报告生成器」外壳 | 骨架章节顺序按 D-006（执行摘要→四象限/裁决→证据→行动建议）；不引入新分发形态；引文→结论支持关系校验（D-017 强化项） | D-016/D-017 | done — 票 #23 闭环（2026-09-13）：首报 `reports/23-first-report.md`（md 主产物）+ `23-first-report.json`（agent 侧车）落位；骨架 4 章顺序锁定（C1 执行摘要→C2 四象限与裁决→C3 证据→C4 行动建议）与 14-skeleton-fields.json 逐项对齐（16/15/9/10 字段）；11 条证据全部具备 evidence_id + source + locator 三元组（守卫 A6 逐字回查 0 失配）；引文→结论支持关系校验 11/11 supports；Receipt `RCP-9d20125ad0976c86`（双锚：commit `fc00d45` + tree `6f405cfc…`，含 content_digest 与 gate_ref `7395495`，228 条事实）；失败路径 `23-first-report-failure.md` / `.json` 与 happy 同骨架并带 ⚠ unverified；守卫 `reports/23-first-report-check.mjs` 36/36 PASS（退出码 0） **→ implemented（收口结算 2026-09-13）** |
| A-027 | 「agent 工作流内嵌场景下"信任并行动"的操作化定义…建议在 C 判据设计时显式定义」（报告作为 agent 输入的机器可消费性：引文可解析、裁决可编程引用） | C 层验收判据显式覆盖 agent 可消费性（结构化裁决块 + 可解析引文锚） | 人裁定 vs agent 消费双视角不得合并成一个判据；C 裁定仍由人做 | D-017/D-011 | done — 票 #23 闭环（2026-09-13）：C 层判据显式覆盖 agent 可消费性 —— 结构化裁决块（6 条目 PC-1/PC-2/TC-1/TC-2/TC-3/NC-1，逐条带 basis_refs + anchored_fact_ids + anchored_evidence_ids）+ 可解析引文锚（evidence_id + source + locator）落 `reports/23-first-report.json`，machine_contract.verdict_enum = supported / unsupported / insufficient；人裁定与 agent 消费双视角未合并（守卫 C5 断言 human.status = pending）；规则推导综合裁定 = unsupported（TC-2 RED 主导）。**C 裁定原文 + 时间戳仍待用户产出后回写本行**（启动器 delta 第 4 条），本窗口只交付规则推导结果与待填槽位 **→ implemented（收口结算 2026-09-13）** |
| A-028 | 「审计/审查类产品"第一份真报告"的专项先例…建议在阶段 1 执行时对同类（CodeScene 行为分析、GitClear）补一轮定向调研」+「mutation…对本产品 B 层的迁移有效性需在阶段 2 用更多仓样本复核」 | 阶段 2 用首报实测锚补 CodeScene/GitClear 定向调研 + B 层迁移有效性多仓复核 | 定向调研只作校准输入不阻塞首报；多仓复核在阶段 2（阶段 1 只跑 6F） | D-016/D-018 | done — 票 #24 闭环（2026-09-14）：atomcode 两轮串行调研落盘（reports/24-atomcode-research.md：轮1 首报先例 15 源 / 轮2 B 层多仓迁移 13 源 + 复核计划 v1 §4.1–4.4）；校准输入映射清单 reports/24-calibration-map.md（16 项 active 缺口登记表 + CI-01~04 四条映射仅指向既有编号、12 项无输入如实标注）；守卫 reports/24-check.mjs PASS（退出码 0）；调研只作校准输入，未改写首报判定、未新造缺口  **→ implemented（2026-09-14）** |
| A-029 | 「无单一综述文献断言"混合=标准"——结论以五领域独立汇聚形态成立…若需单一权威可引 ICH E10 + ISO 13528 组合」 | 预声明文档的引用策略定版：以 ICH E10 + ISO 13528 为权威锚、五领域汇聚为佐证 | 禁止虚构单一综述来源；引用须可回查 | D-018 | done — 票 #22 闭环：引用策略定版 —— 权威锚 = ICH E10 §1.5 Assay Sensitivity / §1.3.4 Active (Positive) Concurrent Control + ISO 13528:2022 §9 / §9.4 z scores，逐条给出处与可回查 URL；五领域汇聚仅作佐证；「禁止虚构单一综述来源」已写入预声明文档 §6 明令禁止段 **→ implemented（收口结算 2026-09-13）** |
| A-030 | T6「铺开其余采集器/scale + 分发收尾（plugin 上架、BACKLOG 卫生）」——分发收尾前置未清点（BACKLOG B1/B2/B3 立票决定在用户手中、plugin 上架条件、演示资产范围） | 分发收尾前置清单（BACKLOG 立票/上架条件/演示资产）清点落文，逐项待用户拍板 | B4.1 已被 D-015 取代不再立项；用户逐项拍板后才动 | D-016 | done — 票 #25 闭环（2026-09-14）：前置清单 `reports/25-rollout-checklist.md` 落盘（§0 实测快照 + B1/B2/B3/B4/B5 + 上架条件 P1~P6 + 演示资产 D1~D5 共 25 行，动作项全标「待用户拍板」、B4.1 已被 D-015 取代一行带过不展开）；atomcode 单轮调研 `reports/25-atomcode-research.md`（四层上架闸门 + 演示资产双路径法则 + DoR/DEEP/PRR 三件套，13 源，与全部 current 决策零冲突、一处适用性边界如实标注）；清点实测抓出 3 处 BACKLOG 过期前提（e-branch-1 不存在 / 根 README 已按 D-021 落盘 / origin 已配置）；守卫 `reports/25-check.mjs` PASS（退出码 0）；零上架/push/立票动作 **→ implemented（2026-09-14）** |

> **A-019 / A-020 deferred 注记（2026-09-13）**：闸门授权已获（用户原话「origin/main 立即执行」）。勘察后原「engine-ci.yml 未实跑」表述失实——该 workflow 实已实跑并全绿（run 34690925491 / main@66e4433 / 2026-09-12T11:23:23Z / 6-6 job）；CI 仅由 paths engine/** 触发，而 R3 规划基线全在 .scratch/，故推基线不触发 CI；唯一 engine/** 变更属并行票据 20 在飞 WIP；but push-remote=gb-local 亦不达 GitHub。用户裁定「暂挂，等 #20 完成」。恢复条件见 reports/19-report.md §9。

> **A-019 / A-020 闭环注记（2026-09-13）**：暂挂解除（用户「20落地，可以继续」）。执行链：①栈重排——20 由「独立（基 main）」改栈于 19 之上（`but move 20-fact-schema-v0 --above 19-push-ci-activation`），消除 `but move 19` 引入的 rebase 冲突（表现为 WORKFLOW.md / decision-ledger.md 同点追加）；②`but config push-remote origin`（原 gb-local 为本地裸库，不达 GitHub）；③`but push` 推 4 commits / 3 branches（grill-r3-wrapup ac03dda / 19-push-ci-activation 0f111c4 / 20-fact-schema-v0 654db79）；④engine-ci 首跑 run 34736927344 **全绿 6/6**（ubuntu/macos/windows × Node 20/22，2026-09-13T04:02:09Z→04:02:53Z）。过程教训见 reports/19-report.md §6（L-19-f/g）。

## C 层人裁定落盘（2026-09-13，票 #23 首报）

> 载体：reports/23-gates.json `C.human` 槽位（status=pending, adjudicator=user）→ 本节为回写；D-017 C 条款④「裁定原文+时间戳回写决策账本」由此闭合。

| 项 | 内容 |
|---|---|
| 裁定对象 | 首报 MA-23-6F-FIRST-REPORT（RCP-9d20125ad0976c86，6F@fc00d458…，tree 6f405cfc…） |
| 用户裁定原文（逐字） | supported 。 |
| 时间戳 | 2026-09-13T10:49:04.195Z（用户回传时刻，主脑落盘） |
| 规则推导（参照） | unsupported（TC-2 RED 主导，per 22-c-adjudication-basis B2） |
| 张力记录 | 人裁定 supported 与规则推导 unsupported 不一致——per B5「裁定仍由人做」，人裁定为最终档位；与预注册依据 B2 的字面偏离如实记录于此，不改写任何预注册文件 |

### disposition 补记（2026-09-15，票 #29 / A-034，CAPA reopen）

> reopen 惯例：本节为原裁定（上表，2026-09-13 落盘）的追加处置记录——原文与时间戳不改写；reopen 事由 = R4 量测效度审计（#26 真值表 / #27 判据 v2 / #28 治理卫生）补交前置调查。

**成对动作**（per D-025 勘误式双读数）：
- 原读数保留不撤：TC-2 v1 = 0.2462 RED（dated measurement，detector adr-structure@v1，6F@fc00d458 批次，observed 2026-09-13T14:31:09+08:00）——其中 Status/Date 字段缺失归因经 #26 逐格分解判定为**量测误差**（AC-26-1 解析器仅认 dash 前缀 ×11 格、AC-26-2 A-002 回退链未接线 ×5 格），该部分字段归因标 invalid；
- 修正读数成为 reportable value：TC-2 v2 = 0.5846 RED（adr-structure@v2，同冻结集单次重跑，golden set 对照 65/65 ALL-AGREE）——真实缺失收窄为 Context/Decision/Consequences 三节 ×9 份（missing_ratio 各 0.6923），该 33 格已由 #28 在当前工作树清零（冻结集读数仍按冻结口径发布）。

**disposition**：人裁定 supported 维持不变（CAPA reopen 性质 = 补做前置调查，不推翻人裁定）；规则推导参照值经修正读数复核仍落在 unsupported（RED 方向成立：cond_a 0.5846<0.60、cond_b 三节 0.6923>0.50），原张力记录结论维持——但张力现明确落在**真实缺失**上而非量测伪影，归因表述以本节为准。

证据链：reports/26-truth-table.json（真值 + 逐格 delta + AC-26-1~5 登记）→ reports/27-dual-readings.json（v1/v2 并列读数）→ reports/28-check.mjs（治理清零 113/113）；账本锚 = A-031/A-032/A-033 done。

## R3 收口结算（2026-09-14，整轮收口）

- **结算口径**：A-001~A-030 共 30 条 → **implemented ×29 / deferred ×1（A-006）/ stale ×0**。
- **A-006 维持 deferred 理由**：注册前提「AI 代码生成主流化」未触发；W1 已交付评估框架；属长期演化评估、无过期前提 → 不标 stale。
- **本轮（W5/W6）新增 implemented**：A-028（票 #24）、A-030（票 #25）——标记由执行窗口写入、首脑复核核实（守卫 34/34×2 首脑实跑、commit 范围核对、分支落位核对）。
- **收口硬验收（2026-09-14 复跑）**：gen/build 0 错、smoke 6/6、selftest ok=true（四壳/默认模式唯一/MCP 只读/Receipt 5 字段）、pack 29 文件——复现 2026-09-13 基线；六守卫回归 28+43+19+36+34+34 全 PASS exit 0；构建产物已清除、树干净。
- **交叉核对**：reports ↔ README 状态表 7/7 一致（零矛盾）；三层一致性（CONTEXT.md / docs/adr 0001~0014 / 代码现状）0 findings。
- **摘要沉淀**：docs/decisions/2026-09-14-r3-execution-closeout.md（A-028/A-030 + 7/7 闭环 + 收口证据）。
- **归档**：本账本随 .scratch 目录归档；R3 执行轮（票 #19~#25，波次 W1~W6）至此收口。
## R4 执行轮登记（2026-09-15，轮 6 任务书 T1~T6 → A-031 ~ A-036）

> 来源：.scratch/macro-audit/handoffs/next-round.md（轮 6 常驻任务书）+ spec-phase-tasks.md 第五轮 R4 节 + docs/adr/0015 + macro-audit 账本 D-023~D-025（+D-017/D-020 派生）。
> 编号续接 A-001~A-030（R3 已结算 implemented×29 / deferred×1）；本轮登记状态一律 current；票闭环后按既有模式回写 done/deferred + implemented 注记。
> 波次序列化（per 任务书，严格执行）：#26 → (#27 ∥ #28) → #29 → #30 → #31；唯一并行对 = #27/#28 且验收互不引用为完成条件。

| ID | 问题描述原文 | 规范化需求 | 显式约束 | 来源决策 | 状态 |
|---|---|---|---|---|---|
| A-031 | R4-01 阶段 1.5 量测审计：「14 份 ADR 人工真值表 + 逐份 delta 表模板（区分 detector 漏认 vs 真实缺失；产物 = R4-02 验收 golden set + 原 RED 的 invalid 逐份可归属原因；先于一切 v2 代码，纯文档零构建）」 | 14 份 ADR（首报冻结时点 docs/adr/ 全集）逐份人工读数表 + 逐份 delta 表模板落文；每份标五件套字段读数与 Nygard 内联格式识别 | 先于一切 v2 代码（AIAG MSA：测量系统分析先于用数据做过程决策）；纯文档零构建；真值表同时是 golden set 与 assignable-cause 证据 | D-025 | done → implemented（2026-09-15） |
| A-032 | R4-02 判据 v2 追加：「adr-structure detector 接线 A-002 回退链（v1 留档；验收 = 与人工真值表一致率；冻结数据重跑 → 并列读数 + 勘误披露，重测次数与判定规则事先写死）」 | adr-structure detector 接线 A-002 回退链（YAML 头 → 内联 Nygard → git 首提交）；冻结首报数据重跑出并列读数 + 逐份 delta 勘误 | v1 代码与 v1 阈值 0.60 留档禁改；验收 = 与真值表一致率；重测次数与判定规则事先写死（禁 testing into compliance）；构建/测试走 CI | D-025 | done → implemented（2026-09-15） |
| A-033 | R4-03 ADR 治理卫生票：「6F 真实五件套缺失清零（验收 = R4-01 人工读数中真实缺失项清零；与 R4-02 互为引用、互不为完成条件）」 | 6F 自身 ADR 五件套真实缺失清零（准入范围仅以 R4-01 真实缺失分解为准）；补记注明勘误性质 | 验收独立于 R4-02——两票互为引用、互不为完成条件；不得因 detector 改动而令真实缺失消失（D-025 伦理判据） | D-025 | done → implemented（2026-09-15） |
| A-034 | T4 C 层 disposition 补记：「T1~T3 结题后按 reopen 惯例补记 disposition（architecture-recovery 账本 C 裁定节追加，不改写原文与时间戳）；勘误式双读数发布（原 RED 不撤回 + 成对动作说明）」 | 账本 C 裁定节追加 disposition 段落（CAPA reopen：补前置调查不推翻人裁定）；勘误式双读数发布物落文 | 不改写已入库 C 裁定原文与时间戳（不可变纪律）；原 RED 不撤回不覆盖；成对动作 = 原读数记 invalid + 修正读数成为 reportable value | D-025 / D-017 | done → implemented（2026-09-15） |
| A-035 | R4-04 阶段 2a 冻结校准：「10 项 desk 清单（任务 2/4/8/9/10/11/12/13/14/15/16 + 任务 5 已锚行 + 任务 7 单写者域草案）；草案全部标注置信域（单写者证据禁外推多写者）；待探针占位带『满足判据+复审时点』」 | 冻结首报数据上 10 项 desk 校准草案落文；每项标置信域；待探针占位按两字段纪律登记 | 不改冻结数据、不接新上游；单写者域证据禁外推多写者域；前置 = R4-02 入库 | D-023 / D-024 | done → implemented（2026-09-15） |
| A-036 | R4-05 阶段 2b CodeLore 单上游探针：「前置 = 运行时解析策略判定（容器捆绑 vs 二进制发现）+ 读 Agent Plugins 1.0.0 plugin schema 原文（P1 预核对 baseline 顺手做）；适配器 + 锁版本 + golden 契约测试；重跑 6F 首报同仓 + 同 spec 版本 diff；provenance 锚定」 | CodeLore 薄垂直切片（适配器 → fact → 重跑首报 diff）；锁版本 + golden 契约测试；产物 = 数据源漂移报告 + 任务 1/3 实测锚 + README 上游清单 CodeLore 行状态更新 | 适配层禁业务规则（ADR-0014 微软 ACL 判据）；唯一新增上游 = CodeLore（Scorecard/repomix 推阶段 3）；provenance = commit pin + spec 版本 + data fingerprint；前置 = R4-04 结题（序列化纪律） | D-023 / D-024 / D-020 派生 | done → implemented（2026-09-15） |

## R5 执行轮登记（2026-09-15，轮 7 任务书 T0~T11 → A-037 ~ A-048）

> 来源：.scratch/macro-audit/handoffs/next-round.md（轮 7 常驻任务书）+ spec-phase-tasks.md 第六轮 R5 节 + BACKLOG.md 阶段 3 票据包 #32~#43 + macro-audit 账本 D-029~D-036（+D-012/D-013/D-023/D-024/D-026/D-027 派生）。
> 编号续接 A-001~A-036（任务书原文「A-031 起」系过期口径——A-031~A-036 已被 R4 票 #26~#31 占用，按「账本=唯一数据源」纪律续至 A-037）；除 A-037 外登记状态一律 current；票闭环后按既有模式回写 done/deferred + implemented 注记。
> 次序（per D-036/任务书）：#33 最优先 → #34/#35 并行首票 → #36/#37 → #38 → 其余随层序（扩面→Macro-C→Micro-A→Micro-B→Macro-A）；#42 触发器拉动不插队；上架动作属用户闸门（D-026/D-027）。

| ID | 问题描述原文 | 规范化需求 | 显式约束 | 来源决策 | 状态 |
|---|---|---|---|---|---|
| A-037 | R5-01 / BACKLOG #32：「B1.2 落地——31 份 prompts『## 收尾』段首黑体硬要求块（措辞、位置、范围已定，防 W2/W3 V2 重演）」 | 31 份 prompts/NN-*.md「## 收尾」段首黑体强提示块插入；措辞逐字 = macro-audit 账本 D-029；handoffs 不另加；25-checklist B1.2 行状态列更新 | 措辞逐字落地（声明类文字 1:1 对齐纪律）；范围 = 现存 31 份全量；不动 handoffs 完成定义段 | D-029 | done → implemented（轮 6 整理环节已执行 2026-09-15：31/31 份段首块落位、逐字措辞与 D-029 一致、25-checklist B1.2 → decided-now；闭环 commit = r6-closeout-docs `mqn`） |
| A-038 | R5-02 / BACKLOG #33：「T7 挂门机检化——guard 脚本统一扫描全部挂门项三字段（最迟拍板时点 / 触发事件 / 复审时点）到期报警」 | 挂门项机读登记表 + 守卫脚本：四族输入（25-checklist 挂门行 / 账本两字段登记项 / CodeLore 暂缓面集复审时点 / 多写者三触发器）逐项三字段齐备 + 源文档挂门行↔登记表对账 + 到期/触发判定报警 | 绑定表权威文本 = ../macro-audit/reports/R5-Q5-atomcode-research.md §3；值守规则 = 触发已发生未拍 1 个工作日升级、硬到期未触发重组改绑一次、再到期升级用户；横切兜底票、阶段 3 最优先 | D-026 / D-034 / D-024 | done → implemented（2026-09-15） |
| A-039 | R5-03 / BACKLOG #34：「plugin.json 对齐 Agent Plugins 1.0.0——$schema const / schemaVersion / skills·mcp·extensions 形态 + AJV 校验入 guard」 | engine/plugin.json 逐字段对齐 1.0.0 官方 schema（修 manifest.meta.json / gen-manifests.mjs 元数据源而非仅改产物）；ajv 一次性校验留证 + 常驻守卫零依赖结构断言 | 上架硬前置链第一环；本票只做合规不做上架；一次性校验依赖不进常驻守卫（#15 教训） | D-036 / D-012 余款 | done → implemented（2026-09-15） |
| A-040 | R5-04 / BACKLOG #35：「CodeLore 契约面扩开首批 ≈30 面（演化主干 12＋S3 族 6＋S5 族 12），逐面 golden 契约测试」 | 首批 30 面逐面适配器输出 + golden cassette + 契约测试；面名以 `codelore analyze --help` 实物枚举为准；暂缓面集两字段登记核对（衔接 #33 输入③） | ADR-0014：适配层禁业务规则、raw 语义不出适配层；禁止一次契约全部 56 面；LLM 面不混入（#36 独立票）；Macro-C preview 前置 | D-035 / D-034 | done → implemented（2026-09-15） |
| A-041 | R5-05 / BACKLOG #36：「CodeLore LLM 面（explain 族）env 门控＋成本验收——S4 ADR 假设抽取前置」 | explain 族 env 门控（CODELORE_LLM_*）＋成本验收面落文并实现；门控关 = 显式降级披露不静默失败；独立验收 | 独立票不混入 #35；测试不真调 LLM（golden cassette）；S4 假设抽取前置 | D-035 | done — W9 36-check PASS 20/20（实物枚举：analyze 枚举 explain-*=0，LLM 面=explain --llm/diff --llm/mcp explain_file；env 五变量契约+门控判读矩阵；llm_cost 计量+call_cap+超限降级；契约测试 25/25 两形态；npm test 全绿） | implemented (W9 #36 done, 36-check PASS 20/20 + codelore-llm.test 25/25) |
| A-042 | R5-06 / BACKLOG #37：「试点面可用性审计——三仓 PR 人/机比＋supersede 链完整度实测脚本」 | env-manager / anysearch-cli / jiahao 三仓只读实测：PR 人/机比（含非人类 PR 边缘形态）、ADR supersede 链完整度、托管面有无；产出 层×仓 capacity 矩阵 | Pilot-surface Audit 三问（capacity / ground-truth 可得性 / 泛化增量）；只读扫描不写被测仓；结果决定 #38/#39 试点指派 | D-033 | done → implemented（2026-09-16）：37-probe.mjs 只读实测三仓（git 只读命令白名单，零写被测仓）→ 37-pilot-measurements.json；PR 人/机比=env-manager 10(h6/b1/g3 含 dependabot+release-please 边缘形态)/anysearch-cli 0（下限）/jiahao 6(全人)；ADR 链=14(0边·下限)/65(3 supersede 边全解析+回链)/69(68 引用边+2 item 级 supersede)；托管面=env 全配/jiahao 有(ci.yml+6PR)/anysearch remote-only；层×仓 capacity 矩阵 + Pilot 三问落 37-report.md §4.2/4.3；D-033 对照 2 一致 2 出入如实呈报（jiahao「纯本地无托管」被 6 PR 证伪、env「唯一 PR 面」证伪——建议呈报收口裁决不自行改 D-033）；37-check.mjs PASS 40/40 exit 0 |
| A-043 | R5-07 / BACKLOG #38：「Macro-C preview——anysearch-cli 校准（56 ADR＋supersede 链）＋单仓校准披露＋happy+failure 演示双件 DoD」 | Macro-C preview 层跑通：anysearch-cli 为校准语料；报告强制披露「单仓校准（anysearch-cli）」结构性限制；完成定义含该层 happy+failure 演示双件（D-032 DoD 准入件） | 第二能力层；前置 #35/#36/#37；披露非演示纪律（D-032）；preview 标注诚实（ADR-0017） | D-034 / D-032 / D-033 | done → implemented（2026-09-16）：38-macro-c-preview.mjs 全链实跑（采集 adr-structure@v2×65 + gitlog×65 + codelore 30/30 面 + llm_gated×3 + supersede 复测 8 边零断链零缺回链↔37 存档一致）→ 1012 facts（jsonl + 共享 38-audit-facts.duckdb：Macro-B 228 回放 + Macro-C 1012，触发器 b 成立 → mw-trigger-b 登记 trigger-fired + event occurred，ALARM 值守）→ 报告双件（happy 骨架+披露块 / failure ⚠ unverified+降级注释+verdict-gate 印记）；generate.ts 新增 preview_disclosure 契约面（D-037② 首实现）+ store.ts 实跑缺陷修复（fact_seq 序列 + registry 种子）；overall=insufficient 诚实部分裁定（TC-MC-3 llm_gated）；38-check.mjs PASS 36/36；npm test 全绿（REPORT-PREVIEW 5/5 入 smoke）；anysearch-cli 零写入 |
| A-044 | R5-08 / BACKLOG #39：「Macro-B 三仓 one-shot＋jiahao 持续回归接入 CI——接入即触发多写者 self-probe 实测封口（D-034④a）」 | Macro-B 对 env-manager/anysearch-cli/jiahao 各跑一次 one-shot 泛化验证；jiahao 持续回归接入 CI；接入动作 = 多写者触发器 (a) 激活点 → 衔接 #33 guard 实测封口任务 7 多写者域 | 泛化验证 ≠ 跑通（反复接受）；回归仅限已上架层；触发器激活即实测封口（Trigger-gated Closure）；前置 #37 | D-033 / D-034 / D-024 | done → implemented（2026-09-16）：39-macro-b-one-shot.mjs 三仓全链实跑（adr-structure@v2+positioning+gitlog，阈值=22 预声明）→ env-manager 276 facts supported（RCP-b1106d4112171be9）/ anysearch-cli 1041 facts **unsupported**（TC-2 RED：Status 缺失率 0.7385>0.50，RCP-b87bc53eb457a9fc）/ jiahao 1101 facts supported（RCP-4d1b294f6e2b0a07）——反复接受非跑通如实落数；共享事实库 39-audit-facts.duckdb 3 repo_ref×Macro-B=2418 行零 dedup；jiahao 仓 .github/workflows/macro-b-regression.yml（schedule 周一定时+workflow_dispatch，无 push/PR，已上架层限定）commit 84077dab @ r9-39-macro-b-regression → mw-regression-ci occurred + mw-trigger-a trigger-fired（ALARM 值守）；self-probe 实测封口：同进程二写拒/跨进程并行 1 胜 3 lock_denied/串行 2/2/持锁期读写皆拒/66 行零 dup → desk-task7→triggered-bound+self-probe-executed（并发策略维持 SWMR 门面）；新发现：store.ts 锁属 instance 非 connection（conn.closeSync 不放锁，收口窗口呈报项）；39-check PASS 守卫全绿；npm test 全绿（SMOKE 6/6+COLLECTORS 14/14+ADAPTER 7/7+BATCH1 41/41+LLM 25/25+REPORT-PREVIEW 5/5）；三仓只读零写入 |
| A-045 | R5-09 / BACKLOG #40：「非自有公开仓泛化验证 ≥1——URL opt-in（D-013）首实用户跑通 Macro-B」 | ≥1 非自有公开仓经 URL opt-in 路径跑通 Macro-B；结果回写泛化证据 | Macro-B GA 前置条件；输入路径 = Repo Intake URL opt-in；同主仓试点不构成泛化证据（dogfooding 结构性限制已入规） | D-033 / D-013 | done → implemented（2026-09-16）：open-gsd/gsd-core 选定（非自有/92 ADR/5887 commits，40-target-selection.json）；engine intake 落地（src/intake/intake.ts + cli repo add + test/intake.test.mjs 31 断言入 smoke）——URL opt-in 实跑 clone 至 40-clone-cache/repos/f0b1eba9471ef4de（隔离/全深度 5887c/浅拒位/禁远程配置执行 hooksPath=noop+ext.allow=never/凭据复用本地链）；40-macro-b-one-shot.mjs（=39 同构复用管线零改）→ 1424 facts，PC/NC 全 PASS、TC-1 NOT_RED(n=92)/TC-2 RED(cond_b：Status dash+加粗形态漏认率 0.9783，mean=0.7478)/TC-3 GREEN(0.8000) → **unsupported**（RCP-d4f119c5a2cac629）如实落数；对照表 40-external-comparison.json 区分「anysearch-cli 真缺失 vs gsd-core 漏认」双归因；registry first-external-repo→occurred + desk-task2→triggered-bound（judgeable=92≥5）+ desk-task15 pending→ALARM（判据属 Micro-A 未上架层）；33-check 8/8；npm test 全链绿（INTAKE 31/31 入链）+ package 33f + selftest 5/5；40-check PASS；目标仓零写入 |
| A-046 | R5-10 / BACKLOG #41：「分发收尾——examples/first-report/＋披露 README／preview 标注·0.x 语义·changelog／listing 资产／preview 字段查证＋竞品扫描／凭据申请」 | 五子项：① examples/first-report/ 复制四件＋披露 README（6F 自审真实产物声明＋生成 commit＋日期＋重生成命令）；② README/marketplace 首段能力边界＋「capability 1 of 5 · preview」标注＋0.x 语义＋changelog；③ listing 资产（未上架层「Not yet in preview」披露块＋roadmap 链接）；④ Agent Plugins preview 字段查证＋竞品占位扫描（前置子任务）；⑤ 凭据申请（D-026③ 阶段 3 开工门已触发） | 上架动作本身停用户闸门；前置 #34；README/marketplace 引用只能指向 examples/first-report/ 公共路径不得链 .scratch；禁为未上架层造资产化演示 | D-030 / D-031 / D-032 / D-026 / D-027 | current |
| A-047 | R5-11 / BACKLOG #42：「上游队列值守——Scorecard/repomix 探针按层需求拉动不插队；CodeLore sqlite/parquet dump 对照评估」 | Scorecard/repomix 探针按层需求拉动接入（不插队）；CodeLore sqlite/parquet 全量 fact-store dump 对照评估落文；Macro-B preview 供应链象限维持「⚠ 数据未接」披露 | dump 若采纳须另立 ADR（适配层语义翻译面变厚）；禁止 Scorecard 插队只为补齐 preview 供应链象限；触发器纪律 | D-023 / D-034 / D-035 | done → implemented（2026-09-16）：42-probe.mjs 只读枚举 dump 面形态（sqlite=full fact-store dump 需 --output／parquet 仅 3 面／内部 schema_v8 不在 codelore schema 公开面／sqlite 内嵌 provenance 表／DuckDB 1.10505.0／format 行↔#35 存档 drift=none）→ reports/42-dump-comparison.md 三轴对照落文（轴①契约字段覆盖 0/30 层级错位 dump=ingest 原料 vs 契约=分析产出；轴②16 项上游语义须复刻入防腐层=结构性违反 ADR-0014；轴③golden 只能钉内部 schema_v8 非契约面降级）＋atomcode 调研五先例（K8s etcd/Terraform state/GitLab internal/GH Archive/CodeQL SARIF，6+搜 6 原文核验）；**呈报=维持逐面契约路径不采纳为事实输入面**，锁表 codelore-sqlite-dump 行注记更新＋evaluating 不翻（呈报不代拍，采纳门=ADR+pin+golden 回归不焊死），dump 合法域=诊断调研原料不进 verdict 输入；registry 新增 upstream-probes-scorecard-repomix（pending+manual_watch 五要素+触发条件字段，层需求拉动不插队）33-check 8/8 无回归；供应链象限披露核查 39×3+38×2 实物断言全中（⚠ 数据未接+not_applicable+data-not-connected）；42-check.mjs PASS 43/43 exit 0；engine 源码零改动 npm test 全链绿 |
| A-048 | R5-12 / BACKLOG #43：「样例 golden CI——CI 重渲染 fixture 并 diff，不一致即 fail，更新走 PR 审查」 | CI 对 examples/first-report/ 样例资产重渲染并 diff，不一致 fail；样例更新走 PR 审查 | 禁自动重生成直通 main（snapshot 纪律：入版本库＋code review）；与 #33 同批立项；执行在 #41 样例落位后 | D-030 | done → implemented（2026-09-16）：.github/workflows/golden-ci.yml 落地 golden job（单平台 ubuntu-latest+Node24——确定性为逐字节契约非平台行为，理由注释在档）：腿① engine/fixtures/golden 经 npm install/gen/build+gen-demo-golden.mjs 重渲染→porcelain+git diff 非空即 fail；腿② examples/first-report 经仓内 23-frozen-fc00d458.bundle（904B，前置 200b344 在 main）unbundle 物化冻结 commit→git worktree→按生成时点状态补 e39468c 版 23-first-report.mjs/generate.ts 与等签名 overlay README（原脏文件已失，top-20 签名经 23-facts.jsonl intent_count 复原）→逐字跑 README 所录 `node .scratch/architecture-recovery/reports/23-first-report.mjs`→四件 cmp 逐字节 diff 非零即 fail+差异摘要入日志；禁自动回写（permissions contents:read、零 commit/push/writeback action，更新路径只走 PR 审查——workflow 注释+examples README 专节明文）；本机实跑正误两态（四件+侧工件全逐字节一致 receipt=RCP-9d20125ad0976c86↔披露值；篡改一件必检出）＋engine 重渲染 porcelain 零漂移；43-check.mjs PASS 28/28；npm test 全链绿不回归 |

## R6 执行轮登记（2026-09-16，轮 8 任务书 T4/T5/T6/T7/T15 → A-049 ~ A-053）

> 来源：.scratch/macro-audit/handoffs/next-round.md（轮 8 常驻任务书）+ spec-phase-tasks.md R6-01~R6-05 行 + BACKLOG.md 阶段 3 票据包 #44/#45/#41a/#41b/#33-ext + macro-audit 账本 D-037~D-041（+D-013/D-030~D-032 派生）。
> 编号续接 A-037~A-048（R5 段）。开工纪律 per D-040：DoR（依赖闭合）=开工闸门，波次仅作协调/验收装置。

| ID | 问题描述原文 | 规范化需求 | 显式约束 | 来源决策 | 状态 |
|---|---|---|---|---|---|
| A-049 | R6-01 / BACKLOG #44：「版本与上游锁定制度化——engine/upstream-lock.yaml 种子行＋docs/versioning.md 衔接＋README §3 上游表状态列绑锁表＋守卫族（版本断言/锁表新鲜度/三处标注同源/编年指针校验，advisory→enforce 两段式）」 | upstream-lock.yaml 种子行（codelore active exact-version+--version 契约／scorecard+repomix planned／sqlite-dump evaluating）；README §3 状态列绑锁表为机读权威；守卫族四件套 advisory→enforce | 禁 range/浮动 tag/latest；锁定表先于依赖存在；更新走手动窗口＋golden 回归；P0 首发 tag 硬前置 | D-037 / D-039 | done → implemented（2026-09-16）：engine/upstream-lock.yaml 落盘（lock_version=1＋六行——codelore=active exact-version 0.28.0＋--version pin 契约/adapter=codelore.ts；duckdb-node-api=active package-lock 精确锁定 1.5.5-r.4；git-cli=active 随宿主环境·输出解析为契约；openssf-scorecard·repomix-gitingest=planned；codelore-sqlite-dump=evaluating＋risk_note；九字段契约逐行齐备；表头纪律注记=唯一机读权威/锁定先于依赖/retired 不删/禁 range·浮动 tag·latest/手动窗口+golden 回归）＋README §3 状态列括注枚举值＋唯一权威注记与状态映射声明＋engine/CHANGELOG Unreleased 条目引 lock（D-037⑥）＋package.json files+=upstream-lock.yaml（provenance 锚随 tgz 54f/76.1kB）；补 duckdb/git-cli 两行使 README 五行全可反查（绑定完整性扩展如实登记）；守卫 reports/44-check.mjs 56 断言两段式——ENFORCE 段本票已 enforce（锁表结构/种子行/枚举/禁 range、版本断言实跑 codelore --version 三方同值 binary↔锁表↔CODELORE_PINNED_VERSION、mtime/日期断言、README 绑定、三处 preview 标注同源 README 边界节↔generate.ts↔examples README 共享 token＋文档↔产物印记绑定 capability 1 of 5↔golden/capability 2 of 5↔#38 实物、编年指针 ADR 区间存在+superseded 如实计/M-xxx 单调/双账互指），ADVISORY 段=锁表新鲜度逾期+binary 缺席 WARN 报警转 enforce 挂首发 tag 手动窗口（D-037④）；首跑抓出 M-001 漏计 ADR-0010 superseded 已补全（0002/0010 双枚如实计）；44-check PASS 56/56 WARN 0；npm test 全链绿不回归＋package＋selftest 5/5；engine 源码零改动；票档三件套按 41a 模板补立 |
| A-050 | R6-02 / BACKLOG #45：「演示入口——fixture 生成器＋fixtures/definitions 三场景（happy-path/degraded-supply/degraded-incomplete）＋fixtures/golden/＋demo --scenario 命令＋CASRAI 式机器可读披露块」 | 生成器输出确定性 git 仓（merge/多分支/tag，临时目录生成跑完即弃）；definitions 三场景名逐字；golden 预期报告形态；demo [--scenario] 默认 happy-path；披露块复用 preview_disclosure 同一字段契约（D-037② 统一契约面） | 合成数据不冒充真实审计（披露块=硬契约非脚注）；失败路径一等演示可确定性触发（degraded-supply=D-034④ 演示化）；demo 走同一 Repo Intake 本地路径不设新输入面（D-013）；#43 golden CI 消费同一 definitions | D-038 / D-013 / D-034 | done → implemented（2026-09-16）：engine/src/demo/{fixture-generator,demo}.ts 落地（pin author/committer/date → 逐字节确定性 SHA，merge/多分支/tag 全要素）＋cli `demo [--scenario|--out|--json|--keep|--list]`；fixtures/definitions×3（synthetic 硬标+failure.trigger 确定性）＋fixtures/golden×3 场景（4 件/场景+manifest.json，逐字节 diff 契约）＋scripts/gen-demo-golden.mjs；CASRAI 披露块四印记逐字机读（fixture: synthetic (generated by fixture-generator@1.0.0)／not an audit of any real repository／capability 1 of 5 · preview／supply-chain: ⚠ unverified）复用 preview_disclosure 字段零扩展；demo 走 repoAdd 本地腿（intake_kind=local）；实跑 happy-path supported / 双降级 insufficient+degraded ⚠ unverified；demo.test 38 断言入 smoke；npm test 全链绿＋package 53f＋selftest 5/5；45-check PASS；upstream/ 零改动（ADR-0014） |
| A-051 | R6-03 / BACKLOG #41a：「分发收尾·仓内文档面——examples/first-report/ 复制四件＋披露 README／README 能力边界＋preview 标注＋0.x 语义＋「Try on a real repository」节／仓根编年首条落盘」 | examples/first-report/ 四件＋披露 README；README 边界文案以冻结决策为唯一事实源；仓根 CHANGELOG 首条（M-xxx 键，区间实物读出） | 就绪即做 filler 不占关键路径；扩面变更走文案 update 子项；受 #44 指针守卫覆盖；不链 .scratch | D-030 / D-031 / D-032 / D-038 / D-039 / D-040 | done → implemented（2026-09-16）：examples/first-report/ 四件复制落位（与 .scratch 原件逐字节 sha256 一致、原件留溯源链）＋披露 README 四要素齐（真实产物声明/commit fc00d458/2026-09-13T14:31:09+08:00/23-first-report.mjs 重生成命令＋冻结时点＋failure=degradeReport 演示性质＋preview_disclosure 时点差如实注）；README 首段 NOTE+专节边界矩阵（Macro-B=capability 1 of 5 · preview／Macro-C=capability 2 of 5 · preview／Micro-A·Micro-B·Macro-A=Not yet in preview）＋build-scope≠release-sequence＋0.x 语义＋「Try on a real repository」节（gsd-core opt-in 链接＋外部内容随上游变化标注＋repo add=intake 面不虚构 audit 命令）——文案逐条回溯 ADR-0016/0017/0018+D-030~032/D-038~040 零发明；仓根 CHANGELOG.md 首条 ## [M-001] - 2026-09-15 落盘（五字段行，ADR-0001~0018/A-001~A-053/D-001~D-041 区间写时实物读出）；engine/CHANGELOG.md 反向指针闭环（W4 悬空清零）；41a-check PASS；npm test 不回归；上架动作未执行（用户闸门） |
| A-052 | R6-04 / BACKLOG #41b：「分发收尾·上架面——listing 资产＋marketplace 字段查证（preview 字段＋版本元数据 schema 缺口＋竞品扫描）＋凭据申请」 | listing 资产＋marketplace 字段查证＋凭据申请 | blocked-by 用户闸门明示＋listing-submission——不排程不入波次不占 WIP；不得传导「凭据申请在推进」的授权暗示 | D-031 / D-037 / D-026 / D-027 | current |
| A-053 | R6-05 / BACKLOG #33 扩展子项：「挂门守卫扩展——registry watch 三态 schema 齐备化（manual_watch 五要素）＋守卫扫复审逾期/确认缺失＋逾期转 risk_accepted 候选＋event_bound/total 覆盖率输出＋确认留痕」 | registry watch 三态 schema 齐备；manual_watch 五要素（标记/责任人/复审时点/验证方法/确认留痕）；守卫扩展＋覆盖率指标＋确认留痕（判据版本/判定人/理由/时间戳） | manual_watch 是过渡态非终点；逾期转 risk_accepted 候选报警；prose 复审不构成补偿控制 | D-041 | done → implemented（2026-09-16）：registry 齐备化落地——manual_watch 7 项五要素 3/5→5/5（owner=收口窗口指派＋登记位/review_event 机读锚=stage3-close·micro-a-preview-prep〔新事件登记〕·双锚/verify_method=33-check E 段＋各项判据清点/confirmations 归一），meta 落文 watch_schema 三态契约＋confirmation_schema 留痕契约（at/by/criterion_version/reason 四必备）；守卫并入 33-check.mjs（裁定：单一挂门守卫不分立）——D 组 7 断言（三态枚举/五要素/risk_accepted 三要素/事件引用 fail-closed 堵 W6/event_bound 锚/留痕结构/BOM）＋E 组 manual_watch 扫描（复审逾期→ALARM＋RISK-ACCEPTED-CANDIDATE 候选名单不自动翻转 status、确认缺失→WARN 缺口显式可见）＋COVERAGE event_bound 23/30 输出；红证两态实跑（悬空引用→FAIL exit 1、micro-a-preview-prep occurred→4 项候选名单 status 零翻转）；PASS 16/16 exit 0（3 ALARM/12 WARN 值守如实）；npm test 全链绿＋package 54f＋selftest 5/5 不回归，engine 源码零改动；票档三件套按 41a 模板补立 |

## R7 执行轮登记（2026-09-16，轮 9 常驻任务书 next-round.md T1/T2/T3 → A-054）

> 来源：.scratch/macro-audit/handoffs/next-round.md（轮 9 常驻任务书）+ BACKLOG.md #46 + macro-audit 账本 D-046（+D-013/D-033 派生）。

| ID | 问题描述原文 | 规范化需求 | 显式约束 | 来源决策 | 状态 |
|---|---|---|---|---|---|
| A-054 | R7-05 / BACKLOG #46：「回归 CI 迁回 6F 自有 CI：6F workflow 加 macro-b 回归 job（URL opt-in clone 公开仓 → Macro-B one-shot → 工件留档；schedule+workflow_dispatch）＋ jiahao 仓 macro-b-regression.yml 单文件撤除（其余内容零触碰）＋经典公开仓候选清单呈报」 | 6F .github/workflows/macro-b-regression.yml（resolve job→fromJSON matrix；URL opt-in；intake 隔离三件；one-shot；工件断言+留档）＋jiahao 单文件删除提交（diff 断言恰 1 文件 D）＋经典仓候选短名单呈报（呈报非定案） | mw-trigger-a 语义不变（「Macro-B 进 CI 定时回归」在 6F 侧成立）；公仓 clone 零 token；jiahao 仅作审计对象不承载我方资产；经典仓候选=语言族×git 健全度×规模短名单呈用户定；6F/jiahao push 各需用户点头 | D-046 / D-013 / D-033 | done → implemented（2026-09-16）：6F workflow 落位——cron 17 3 * * 1（沿用 #39 节拍）+workflow_dispatch（repo_url/repo_name 输入）；resolve job 产 fromJSON matrix（默认集=jiahao，T3 候选待用户选定追加）；https-only 闸门+intake 隔离三件（hooksPath=noop/ext.allow=never/浅拒断言）；engine npm ci+gen+build→clone→39-macro-b-one-shot→verify→upload-artifact if:always()；permissions contents:read、无 token、无跨仓 checkout；jiahao 侧 2755bf35 恰 1 文件 D（轮 10 审计勘误：该提交已在 origin/main——jiahao 为独立在开发项目，push 面不属本仓管理域，登记事实不追认归因）；本地实证 46-out 六件（jiahao 265c/69ADR/1101f/supported/RCP-a435e3bf5b9d6b46）；T3 候选呈报 46-classic-repo-candidates.md（首选 git/git・django/django・spring-boot，备选 curl/flask/kafka）；**轮 10 返修**：npm ci 惯例对齐／matrix→run 全量 env 间接引用堵 $() 注入＋clone 腿 https 闸门 defense-in-depth／verify test -s+receipt_id RCP 格式强断言／node 24 对齐 golden-ci／one-shot 头注残留改 6F／收口回写族补齐（本行+BACKLOG✅+lessons+票档三件套）；46-check.mjs PASS 30/30 exit 0；npm test 全链绿＋package 54f＋selftest 5/5；6F push 仍待用户授权 |

## R8 执行轮登记（2026-09-16，轮 12 常驻任务书 next-round.md T1 → A-055）

> 来源：.scratch/macro-audit/handoffs/next-round.md（轮 12 常驻任务书 T1）+ BACKLOG.md #47 + macro-audit 账本 D-048＋ADR-0020。

| ID | 问题描述原文 | 规范化需求 | 显式约束 | 来源决策 | 状态 |
|---|---|---|---|---|---|
| A-055 | R8-01 / BACKLOG #47：「托管平台 API 适配器：GitHub REST 主路（env token）＋gh 已认证态可选回退＋无认证降级；最小契约=PR 枚举（平台 Bot 双检）＋元数据＋diff 双通道（本地 git 优先/API 兜底）；限流 x-ratelimit+Retry-After；凭据三级探测不建存储；golden cassette（认证/无认证降级/限流耗尽/schema 漂移/平台 Bot）」 | engine/src/upstream/github-rest.ts（690 行）：resolveGithubCredential 三级探测＋realHttpFetcher（X-GitHub-Api-Version pin）＋createGithubRestClient 有界退避＋parsePrSummary/Detail schema 校验＋resolvePrDiff 双通道＋collectGithubPrFacts 九类事实发射＋parseGithubRepoRef 非 github 显式拒；test/fixtures/github-rest/ cassette×5（real×2/derived×2/synthetic×1 如实标注）；test/github-rest.test.mjs 51 断言入 smoke | REST 主路非 gh 依赖（gh=best-effort 只读借读）；无认证=显式降级非失败；raw 响应不出适配层（ADR-0014）；凭据即用即清零存储零泄漏；primary 耗尽即停不硬重试；review/comment=planned 不入最小集；措辞=平台声明的 Bot 身份；私仓=token 必需披露 | D-048 / ADR-0020 | done → implemented（2026-09-16）：真机录制 env-manager 62-PR（gh 借读 token 即用即清未入带）；GITHUB-REST 55/55＋npm test 全链绿＋package 56f/90.9kB＋selftest 5/5＋真网活探（strategy=gh-token 真实命中 api.github.com，remaining 4988→4986 运行日志落事实，token 零泄漏断言在测）；锁表 github-rest→active（version=2022-11-28/pin_type=api-version/adapter 回填）；47-check.mjs 守卫落盘；README §3+CHANGELOG+BACKLOG+WORKFLOW lessons 回写；47 票档三件套+47-report 六段式+日报窗口节；**r12exec-audit 返修**（复审打回四修全落：cassette source 勘误/diff 兜底收窄至 spec/callLog retried+error_kind 真值+rate_limited 归类/行数勘误+死代码×3；test 55/55、47-check 40 断言）  |

## R9 执行轮登记（2026-09-16，轮 14 常驻任务书 next-round.md T1/T2/T3/T4/T5 → A-056~A-060）

> 来源：.scratch/macro-audit/handoffs/next-round.md（轮 14 常驻任务书 T1/T2）+ BACKLOG.md #48/#49/#50/#51/#41b + macro-audit 账本 D-049/D-050/D-053/D-057④/D-054（+D-033/D-044/D-047/D-026 派生）。

| ID | 问题描述原文 | 规范化需求 | 显式约束 | 来源决策 | 状态 |
|---|---|---|---|---|---|
| A-056 | R8-02 / BACKLOG #48：「Micro-A preview 单票铺开：适配器消费侧管道（PR intake→facts→共享骨架 Micro-A 切片）＋双仓实跑＋报告双件＋披露三件套；验收序列=① golden 管道 PASS→② env-manager 三形态（dependabot/release-please/人类各1）→③ jiahao 全人基线→④ failure 件（anysearch-cli 无托管面诚实拒绝）→⑤ 披露→⑥ desk-task15 核验＋micro-a-preview-prep 事件闭环」 | reports/48-micro-a-preview.mjs（601 行）：collectTarget（github-rest-adapter@v1 PR 枚举+元数据+diff 双通道）→事实 JSONL+48-audit-facts.duckdb→预声明判据裁决（48-micro-a-criteria.md：PC-1/TC-1~4/NC-1）→buildReport 骨架 1.1.0 共享四章＋MICRO_A_SLICE_FIELDS 导出契约；golden=cassette 回放断言面；gateProbe=TC-4 托管面资格闸；buildRefusalReport=无托管面显式拒绝件 | PR 集=恰 4 条已 merged 票面写死实例不给通用公式；subject_ref=PR 级（owner/repo#N）；判据=证据完整性/资格闸/选择性非 PR 质量裁决（行级语义评审归 #50）；披露=capability 3 of 5 · preview＋同主确认偏差＋平台声明的 Bot 身份措辞＋走主路/回退标注；anysearch-cli 票面前提漂移如实登记（票写时无托管面=#37 实测 pr=0，本票复核 merged≥1→failure 演示主体改取真负例 goose-duck-agent merged=0）；凭据即用即清不入工件；被测仓只读 | D-049 / D-047 / D-033 / D-044 | done → implemented（2026-09-16）：golden 管道 PASS 14/14（cassette 回放零网络，骨架交集机械断言+拒绝腿+token 不入 fact）；真跑四件全 supported（env64 release-please/local-git、env55 dependabot/api 兜底、env51 人类/local-git、jia6 人类/local-git——两通道如实标注）；goose-duck-agent 拒绝件 unsupported（merged=0→intake 显式拒绝＋前置条件）；anysearch-cli 漂移登记（gate merged=6≥1→eligible，前提漂移载披露）；registry micro-a-preview-prep occurred 翻转＋desk-task15 判 decided＋绑定项三项复审留痕；40-check F4/44-check E8 漂移对齐；README capability 3 of 5 · preview 上架；npm test 全链绿＋package+selftest＋33/42/44/46/47/48-check 全 PASS；48-check.mjs 守卫落盘 |
| A-057 | R9-01 / BACKLOG #50：「叙事双轨落地：skills/macro-audit/references/ 三件＋宿主 agent 叙事→kernel checkAllCitations 盖章链路（grounded/⚠ uncited＋失败明细 token↔evidence）＋MCP facts 只读投影出 stub＋degraded 模板叙事兜底＋叙事记 model id」 | engine/src/report/narrative.ts（sealNarrative 三态＋BAND_PATTERNS 六模机检＋model_id 必录）＋generate.ts 叙事段接入（C2 叙事段渲染+侧车+degradeReport 模板注入）＋fact/projection.ts+cli mcp facts（固定 SELECT/READ_ONLY/参数绑定）＋references 三件+SKILL.md 加载条件节＋test/narrative.test.mjs 25 断言 | band 红线=叙事段仅 citation 盖章面禁携带裁决 band（机检非纪律）；SKILL.md<500 行；references 写明加载条件；rubric 版本化走 PR 评审；叙事不经 CodeLore 适配层（ADR-0014）；模板叙事永居 degraded 位；R2-Q7 #4/#5 随票闭环 | D-053 / D-057④ / ADR-0013 / D-026 | done → implemented（2026-09-16）：narrative.test 25/25（三态真值表+band 违规明细+模板兜底+mcp facts e2e 跨进程 SWMR+SKILL/references 契约+golden 快照）；npm test 全链绿；registry narrative-surface-landed occurred＋narrative-eval-surface→triggered-bound＋#52 评测票立案；50-check.mjs 守卫落盘 |
| A-058 | R9-02 / BACKLOG #51：「Macro-B behavior 象限接入：codelore 行为面（churn/hotspot/change-coupling）逐面 golden 契约接 Macro-B behavior 象限（复用 #35 模式）＋behavior 切片＋能力矩阵措辞收窄＋quadrant 归位规则＋低样本披露 TC1_MIN_N=5＋D-035 勘误注记」 | CODELORE_BEHAVIOR_FACETS（hotspots/coupling/function-hotspots，group=behavior）＋51-macro-b-behavior.mjs（实物跑→判据→报告）＋51-behavior-criteria.md 预声明 PC-1/TC-1/TC-2/NC-1＋README/SKILL.md 能力矩阵收窄＋registry deferred 面集留痕＋51-check.mjs | 先实物跑 codelore analyze 确认 schema 再写判据（D-054⑥）；quadrant 归位=facts 共享＋切片决策（fact.quadrant=provenance 不改写）；TC1_MIN_N=5 对齐 codelore --min-revs 默认＋ADR-0015 量测有效性；function-coupling（--target 面）暂缓如实登记；能力矩阵=只收窄不立票防声明↔实物不一致 | D-054 / D-035④勘误 / ADR-0014 / ADR-0015 | done → implemented（2026-09-16）：env-manager 实跑 116 hotspots+241 coupling+41 function-hotspots，判据全 supported，51-check PASS，registry 留痕 |
| A-059 | R9-03 / BACKLOG #49：「回归 matrix 经典仓接入：git/git＋django/django＋spring-projects/spring-boot 三语言族各一 leg 入 macro-b-regression resolve job JSON；dispatch 首跑实测克隆耗时，超预算（20min）按备选表换（curl/flask/kafka）」 | .github/workflows/macro-b-regression.yml DEFAULT JSON 四 leg（jiahao+三首选一仓一行）＋备选表注释入 workflow＋本地克隆预算实测工件 49-clone-budget.json＋49-check.mjs＋票档三件 | 只读克隆审计 license 无传染（GPLv2 不从严）；TC-1/TC-2 落 INCONCLUSIVE 仍属有效回归信号；clone 外部仓守 intake 隔离（hooksPath=noop/ext.allow=never）；三仓仅进 Macro-B 回归面不进 Micro-A 试点；dispatch 首跑属 push 后动作停用户闸门（T6/T7 不触碰）——本票交付=legs 接入+预算实测预检+守卫，实跑 dispatch 待 push 授权 | D-050 / D-046③ | done → implemented（2026-09-16）：DEFAULT JSON 4 leg 语法解析过＋本地克隆预算实测＋49-check PASS |
| A-060 | R9-03 邻接 / BACKLOG #41b：「listing 资产核对留痕——三 manifest 字段值对账 D-052＋license 全链对账 D-051＋capability 口径对账 README 单一事实源＋凭据清单闸门复核」 | 核对抓获两处陈旧漂移并同票修复：① description.md 残留 UNLICENSED 阻塞语（D-051 已拍 Apache-2.0）＋capability 1-2 of 5 旧口径（#48 后实=1-3 of 5）；② marketplace.json description 仍写 capability 2 of 5、checklist §E 同漂移——三文件同步 README 口径＋41b-check.mjs 守卫＋票档三件 | listing 资产核对=对账非新造：三 manifest（plugin×2+marketplace）字段值逐键对 D-052 原文、license 五处同值、capability 数字以 README 为唯一事实源；提交点击/push/路径 B 仍用户闸门不触碰；license 段陈旧语修复属 D-051 落定后必然后果非新决策 | D-051 / D-052 / D-042 | done → implemented（2026-09-17）：漂移修复＋41b-check PASS |
