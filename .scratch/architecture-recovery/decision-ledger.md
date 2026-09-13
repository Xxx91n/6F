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
| A-019 | 阶段 0 任务「push + CI 实跑（远端与时机须用户授权）」——当前仓无 push 动作、engine-ci.yml 未实跑（「否则 C 的所有验证跑在未 push 分支上，GitButler 分支隔离形同虚设」） | push 到用户指定远端并触发 engine-ci.yml 实跑，取得首个绿/红 CI 证据 | push 属外部副作用：远端与时机必须用户明示；未授权不得推 | D-016 | done — 票 #19 闭环（2026-09-13）：R3 栈（grill ac03dda → 19 0f111c4 → 20 654db79）经 `but config push-remote origin` + `but push` 推达 origin（4 commits / 3 branches）；engine-ci 首跑 **绿** run 34736927344（6/6 job，head 20-fact-schema-v0@654db79，2026-09-13T04:02:09Z→04:02:53Z） |
| A-020 | engine-ci.yml 的平台/触发矩阵范围未在 R3 决策中明文（「CI 实跑」是唯一可并行项，但矩阵未定义） | CI 矩阵平台范围明文化（最小可证集）并随首跑验证 | 不扩矩阵范围（稀释禁令）；矩阵变更须记录进报告 | D-016 | done — 票 #19 闭环：矩阵「最小可证集」一档（3 OS × Node 20/22 = 6 cells）随首跑 run 34736927344 验证 6/6 绿；未扩平台（稀释禁令） |
| A-021 | 「最小 DuckDB fact table schema v0：事件只追加 + correlation key 字段…（正是 D-005 缺口 #10 的前置落地）」——v0 字段级清单与 DuckDB-TS 绑定选型未定（上轮 A-007/008/010 已给策略决议：SWMR/版本号/correlation key） | schema v0 字段清单（含 correlation key 前置字段）+ DuckDB-in-node 绑定选型落文并实现 | 沿用 A-007 单写多读、A-008 版本演进、A-010 correlation key 决议，不重开；只追加不改写（事件单向） | D-016 | done — 票 #20 闭环：绑定唯一 @duckdb/node-api@1.5.5-r.4（4 候选量化对照 + 排他理由，无骑墙）；audit_fact 16 列 + schema_registry 5 列（correlation key 前置、schema_version FK 在 DDL 冻结前声明）；只追加守卫 reports/20-fact-schema-check.mjs 28/28 PASS（退出码 0）；沿用 A-007/A-008/A-010 不重开 |
| A-022 | 「确定性采集器（git log / docs/adr 结构扫描；不接 LLM）」——采集器具体清单与判据绑定路径未定（「正对照 2 条须与真判据共享 detector 路径（同一族确定性采集器）」） | 采集器清单（S2 ADR 结构扫描 + S1 定位素材 + git log）落文并实现，输出形状绑定 schema v0 | 不接 LLM；正对照与真判据必须同族 detector；输出只追加写 fact table | D-016/D-018 | done — 票 #21 闭环：三族采集器 adr-structure@v1 / positioning@v1 / gitlog@v1 落地于 engine/src/collect/collectors.ts；映射表先落文（reports/21-collector-map.md + 21-collectors.json）；DETECTOR_BINDING 落「判据 → 采集器族」映射（2 正对照 + 3 真判据 + 1 负对照；PC-1 跨族驱动 adr-structure + positioning、PC-2 驱动 gitlog × adr-structure，解 D-018 数量不匹配冲突 C-21-1，2+3+1 配比未改）；不接 LLM 已机检（源码零网络 / 零模型 API / 零子进程 / 零 fs / 无 Date.now 与 Math.random，守卫 N1-N6）；守卫 reports/21-collectors-check.mjs 43/43 PASS（退出码 0），#20 守卫回归 28/28 PASS；阈值全 null 留给票 22（A-023 纪律） |
| A-023 | 「真判据 3 条的具体阈值（90 天/10%/30% 等示例数值）需用户或团队校准后写入预声明文档——atomcode 只给措辞框架不给数值（数值本就该由跑前测定决定）」 | 3 条真判据（候选：S2a 事后补写占比 / S2b 五件套完整度 / S1 定位关键词覆盖率）阈值在跑 6F 前测定并写入预声明文档 | 阈值跑前写死、跑后禁调（ISO 13528 纪律）；判据确定性、不接 LLM | D-018 | done — 票 #22 闭环：3 条真判据阈值由 6F 只读实测测定并写入预声明文档（TC-1 可判定数 2 < 门槛 5 → INCONCLUSIVE；TC-2 mean_ratio 0.2462 + Status/Date 缺失率 84.62% → RED；TC-3 最低 ratio 0.6000 → AMBER）；数字与测定方法同段落盘，跑后禁调，改数须 v2 追加且 v1 留档 |
| A-024 | 「负对照的"已知干净"片段选材——6F 内无正式审计过的干净区，建议取最近一轮审计返工后的文件（如 LICENSE/CHANGELOG/PROVENANCE）」 | 负对照片段选定 + 预期 0 命中声明 + 命中后的复核路径写进预声明文档 | 命中走复核不自动定罪（「已知干净」本身可能错） | D-018 | done — 票 #22 闭环：负对照选材 engine/src/fact/schema.ts（票 20 返工产物、纯契约代码、不在 TC-2 扫描作用域、非采集器源码），备份选材 .gitattributes；预期 0 命中三条件 N-a/N-b/N-c + 命中后 4 步复核路径（先疑选材 → 判族误报 P1 → 换选材 → 强制留痕）齐备 |
| A-025 | 「跑 6F 之前以确定性规则写下判据并 commit 入库」+「C 层裁定依据在看报告前写死入库（防 HARKing）」——预声明文档的存放路径、文件形式、commit 时机未定 | 预声明文档（三级 kill criterion 措辞 + 2+3+1 判据表）+ C 层裁定依据预入库文件落位并 commit；时机先于首报 | commit 先于跑 6F（HARKing 禁令）；文档须用户审阅后才 commit | D-017/D-018 | done — 票 #22 闭环：预声明文档 reports/22-criteria-pre-registration.md + C 层裁定依据预入库 reports/22-c-adjudication-basis.md 落位，并按闸门顺序（成稿 → 用户审阅 → commit）commit 至独立分支 22-b-criteria-prereg；commit 先于票 23 首报，HARKing 禁令成立 |
| A-026 | 「产出第一份带引文 + 裁决回执（Receipt）的真报告」「真报告载体 =「报告生成器」CLI 外壳」——报告文件格式、输出位置、共享骨架字段 v0 渲染范围未定 | 首报格式（md 主产物 + 引文可回查 + Receipt 印记）与输出路径定版并实现于「报告生成器」外壳 | 骨架章节顺序按 D-006（执行摘要→四象限/裁决→证据→行动建议）；不引入新分发形态；引文→结论支持关系校验（D-017 强化项） | D-016/D-017 | done — 票 #23 闭环（2026-09-13）：首报 `reports/23-first-report.md`（md 主产物）+ `23-first-report.json`（agent 侧车）落位；骨架 4 章顺序锁定（C1 执行摘要→C2 四象限与裁决→C3 证据→C4 行动建议）与 14-skeleton-fields.json 逐项对齐（16/15/9/10 字段）；11 条证据全部具备 evidence_id + source + locator 三元组（守卫 A6 逐字回查 0 失配）；引文→结论支持关系校验 11/11 supports；Receipt `RCP-9d20125ad0976c86`（双锚：commit `fc00d45` + tree `6f405cfc…`，含 content_digest 与 gate_ref `7395495`，228 条事实）；失败路径 `23-first-report-failure.md` / `.json` 与 happy 同骨架并带 ⚠ unverified；守卫 `reports/23-first-report-check.mjs` 36/36 PASS（退出码 0） |
| A-027 | 「agent 工作流内嵌场景下"信任并行动"的操作化定义…建议在 C 判据设计时显式定义」（报告作为 agent 输入的机器可消费性：引文可解析、裁决可编程引用） | C 层验收判据显式覆盖 agent 可消费性（结构化裁决块 + 可解析引文锚） | 人裁定 vs agent 消费双视角不得合并成一个判据；C 裁定仍由人做 | D-017/D-011 | done — 票 #23 闭环（2026-09-13）：C 层判据显式覆盖 agent 可消费性 —— 结构化裁决块（6 条目 PC-1/PC-2/TC-1/TC-2/TC-3/NC-1，逐条带 basis_refs + anchored_fact_ids + anchored_evidence_ids）+ 可解析引文锚（evidence_id + source + locator）落 `reports/23-first-report.json`，machine_contract.verdict_enum = supported / unsupported / insufficient；人裁定与 agent 消费双视角未合并（守卫 C5 断言 human.status = pending）；规则推导综合裁定 = unsupported（TC-2 RED 主导）。**C 裁定原文 + 时间戳仍待用户产出后回写本行**（启动器 delta 第 4 条），本窗口只交付规则推导结果与待填槽位 |
| A-028 | 「审计/审查类产品"第一份真报告"的专项先例…建议在阶段 1 执行时对同类（CodeScene 行为分析、GitClear）补一轮定向调研」+「mutation…对本产品 B 层的迁移有效性需在阶段 2 用更多仓样本复核」 | 阶段 2 用首报实测锚补 CodeScene/GitClear 定向调研 + B 层迁移有效性多仓复核 | 定向调研只作校准输入不阻塞首报；多仓复核在阶段 2（阶段 1 只跑 6F） | D-016/D-018 | current |
| A-029 | 「无单一综述文献断言"混合=标准"——结论以五领域独立汇聚形态成立…若需单一权威可引 ICH E10 + ISO 13528 组合」 | 预声明文档的引用策略定版：以 ICH E10 + ISO 13528 为权威锚、五领域汇聚为佐证 | 禁止虚构单一综述来源；引用须可回查 | D-018 | done — 票 #22 闭环：引用策略定版 —— 权威锚 = ICH E10 §1.5 Assay Sensitivity / §1.3.4 Active (Positive) Concurrent Control + ISO 13528:2022 §9 / §9.4 z scores，逐条给出处与可回查 URL；五领域汇聚仅作佐证；「禁止虚构单一综述来源」已写入预声明文档 §6 明令禁止段 |
| A-030 | T6「铺开其余采集器/scale + 分发收尾（plugin 上架、BACKLOG 卫生）」——分发收尾前置未清点（BACKLOG B1/B2/B3 立票决定在用户手中、plugin 上架条件、演示资产范围） | 分发收尾前置清单（BACKLOG 立票/上架条件/演示资产）清点落文，逐项待用户拍板 | B4.1 已被 D-015 取代不再立项；用户逐项拍板后才动 | D-016 | current |

> **A-019 / A-020 deferred 注记（2026-09-13）**：闸门授权已获（用户原话「origin/main 立即执行」）。勘察后原「engine-ci.yml 未实跑」表述失实——该 workflow 实已实跑并全绿（run 34690925491 / main@66e4433 / 2026-09-12T11:23:23Z / 6-6 job）；CI 仅由 paths engine/** 触发，而 R3 规划基线全在 .scratch/，故推基线不触发 CI；唯一 engine/** 变更属并行票据 20 在飞 WIP；but push-remote=gb-local 亦不达 GitHub。用户裁定「暂挂，等 #20 完成」。恢复条件见 reports/19-report.md §9。

> **A-019 / A-020 闭环注记（2026-09-13）**：暂挂解除（用户「20落地，可以继续」）。执行链：①栈重排——20 由「独立（基 main）」改栈于 19 之上（`but move 20-fact-schema-v0 --above 19-push-ci-activation`），消除 `but move 19` 引入的 rebase 冲突（表现为 WORKFLOW.md / decision-ledger.md 同点追加）；②`but config push-remote origin`（原 gb-local 为本地裸库，不达 GitHub）；③`but push` 推 4 commits / 3 branches（grill-r3-wrapup ac03dda / 19-push-ci-activation 0f111c4 / 20-fact-schema-v0 654db79）；④engine-ci 首跑 run 34736927344 **全绿 6/6**（ubuntu/macos/windows × Node 20/22，2026-09-13T04:02:09Z→04:02:53Z）。过程教训见 reports/19-report.md §6（L-19-f/g）。
