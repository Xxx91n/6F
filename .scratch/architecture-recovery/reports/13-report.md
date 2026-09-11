# Report: A-013 — 工具对齐评估

- **A-xxx:** A-013
- **Decision:** spec.md §Decision 5.7
- **ADR ref:** docs/adr/0005-hub-of-facts-with-federated-adjudication.md（② 独立 read model / ④ hub 只做元逻辑不经过数据面；Event Sourcing / CQRS / metrics layer 心智）
- **对应 issue:** issues/13-tool-alignment.md
- **对应 handoff:** handoffs/13-tool-alignment.md
- **Report date:** 2026-09-11
- **Verdict（一句话）：** 四参考工具定型——**metrics layer = 自研薄语义层（不部署 MetricFlow/Cube/Malloy 任一完整平台，Malloy 的 compile-to-SQL 作心智对标）**；**OpenTelemetry Baggage = 采用（限定为跨 scale 关联键传输载体，显式搬运进 fact table，不作持久化机制）**；**AsyncAPI = 采用规范心智 + 受限采用工具链（parser-js 校验 + Modelina 类型生成；registry 自研版本表；npm 依赖锁版本，防 2026-07 类供应链攻击）**；**LangGraph = 采用但划界（只进 Macro-C 的 LLM 抽取编排面，不进 hub 元逻辑面；supervisor adopt-vs-自研的 hub 决策权归 A-011，本票矩阵为其提供契合度证据）**。

---

## 0. 开工复述（per 本票「开工第一句」硬要求）

**Blocked by: None**（can start immediately）——本票无上游阻塞，本窗口直接开工。

**必读清单全部路径 + 阅读状态：**

| # | 路径 | 状态 |
|---|---|---|
| 1 | `.scratch/architecture-recovery/issues/13-tool-alignment.md` | 已读全文 |
| 2 | `.scratch/architecture-recovery/handoffs/13-tool-alignment.md` | 已读全文 |
| 3 | `.scratch/architecture-recovery/spec.md` §Decision 5.7（含 D-005 Cluster 全段） | 已读 |
| 4 | `.scratch/architecture-recovery/WORKFLOW.md` §4.2（§4.2.1 ~ §4.2.6） | 已读全文 |
| 5 | `.scratch/architecture-recovery/decision-ledger.md` A-013（表格行 + A-010 结论段前置承接） | 已读 |
| 6 | `docs/adr/0005-hub-of-facts-with-federated-adjudication.md` | 已读全文（Status: accepted） |
| 附 | `CONTEXT.md`（38 术语心智模型） | 已读全文 |

---

## 1. 本票定位与边界

D-005 集成层（spec §5.1–5.7）引用了一组**参考实现工具**：metrics layer、OpenTelemetry Baggage、AsyncAPI、LangGraph。它们的共同问题不是「能不能用」，而是**与本仓库语言栈 + DuckDB/SSOT 数据底座的契合度**——错误采用会把 hub 拖进数据面、把事实复制进第二存储、或引入与 5 scale 静态审计负载不匹配的服务形态。

| 相邻票 | 本票边界 |
|---|---|
| A-010（correlation key，已闭环） | 其 OTel SDK 清单（JS/Node 主、Python 次、Rust Beta）是本票矩阵的语言栈基线；本票评估 baggage 机制整体契合度，不重开字段设计 |
| A-011（LangGraph supervisor，未开工） | hub 协调层 adopt-vs-自研的**决策权归 A-011**；本票只交付「LangGraph × 语言栈契合度」矩阵行 + 采用面/禁用面划界，作为 A-011 输入 |
| A-008（schema 版本演进，未开工） | AsyncAPI 的事件契约**规则定义权归 A-008**；本票评估 AsyncAPI 工具链可行性与采用面 |
| A-009（read model 失效） | metrics layer 的落点 = read model 投影层；本票决定「用不用外部平台实现它」，SLA 语义归 A-009 |

**目标仓库现状**（per handoff 通用调研要求）：`D:/Aworker/6F` 当前为 **spec-level 规划仓库**——根目录只有 CONTEXT.md、docs/adr/（7 条 ADR）、.scratch/（18 票工作区），无任何实现代码。语言栈由决策层锁定为 **TypeScript/Node.js + Python 主力、Rust 内核增强（Beta 档）**（per A-010 SDK 清单 + ledger A-013「前置 = 语言栈（TS / Rust / Python）确定」）。因此本票的「契合度」评估对象是**规划中的实现栈**，不是存量代码。

---

## 2. 评估维度定义（专属验收第 1 项：≥4 维 → 本票 5 维）

| 维 | 名称 | 判据 | 权重理由 |
|---|---|---|---|
| **M1** | 语言栈覆盖与 API 稳定性 | TS/Node、Python、Rust 三栈官方支持档位（stable/beta/experimental）+ API 冻结状态 | ledger A-013 的字面评估对象 |
| **M2** | DuckDB 底座集成成本 | 与 fact table（A-007 单写多读 SWMR）的读写路径远近；是否引入第二存储/常驻服务 | SSOT 是本产品的第一架构不变式 |
| **M3** | 与 D-005/ADR-0005 心智相容度 | 控制面/数据面分离、事件单向写入、read model 投影、联邦治理 | 违反即结构性冲突，不是成本问题 |
| **M4** | 2026 成熟度与维护信号 | 许可证史、治理主体、下载量/采用率、安全事件 | 实现期风险的直接来源（ledger A-013「实现期风险评估」） |
| **M5** | 学习曲线与采用成本 | 团队上量周期、与现有心智模型的抽象错配度 | 影响 Phase 实施排期 |

打分 **5=完全契合 · 4=契合有小计 · 3=可用有代价 · 2=错配需改造 · 1=结构性冲突**。

---

## 3. 主交付物 1 —— 工具 × 评估维度契合度矩阵

### 3.1 metrics layer（三类候选 + 类别判定）

| 候选 | M1 语言栈 | M2 DuckDB 集成 | M3 心智相容 | M4 成熟度 | M5 学习/采用成本 | 依据（来源编号见 §5） |
|---|---|---|---|---|---|---|
| **dbt Semantic Layer / MetricFlow** | 4：Python 一等公民；JS 只有 REST/GraphQL 消费 API；无 Rust | 3：自带 DuckDB SQL renderer + dbt-duckdb，但要求引入 Python 引擎 + dbt 项目结构 | 3：「一次定义多引擎消费」与 SSOT 相容；但 SL 动态消费 API 绑 dbt Cloud 付费计划，与「hub 只做元逻辑」冲突（付费 SaaS 成为控制面外部件） | 4：MetricFlow 2025-12 Apache 2.0 开源（AGPL→BSL→Apache 史）；OSI 联盟背书；spec v2.0 随 dbt 1.12 稳定中（GA 未见 release notes，S-缺口1） | 2：要吞下整个 dbt 项目组织法（models/metrics YAML/manifest），本产品无 transform 层需求 |
| **Cube** | 4：JS/TS 核心（模型即 JS）——与 TS 主栈契合度最高；Python 仅消费侧；无 Rust | 3：DuckDB/MotherDuck 官方一级数据源（CUBEJS_DB_TYPE=duckdb）；但本质是**常驻 Node 服务 + 预聚合缓存层** | 3：语义层独立于 UI 与 read model 心智一致；但引入第二持久化层（cube 存储），与「同一事实只由 fact table 一处持有」（SSOT）需显式划界 | 5：MIT、2018 起生产验证、多 API（SQL/REST/GraphQL/MDX）、采用率 12% | 3：JS 建模门槛低，但多运维一个服务进程 |
| **Malloy** | 3：JS/TS 编译器核心；Python 非一等公民；无 Rust | 5：**最轻嵌入**——compile-to-SQL、无服务依赖、`duckdb.table(...)` 一等语法，直接在批处理脚本里对 fact 表编译投影 | 4：纯编译语言 + 可选 Publisher 服务，hub 不进数据面；但语义模型无跨仓治理机制，需自补 | 2：无命名生产采用者；2025/2026 第三方评测仍标 experimental（README 自称已改，S-缺口4）；采用度小众 | 3：新查询 DSL 的学习成本；但心智与我们「read model 投影」最近 |
| **类别判定：metrics layer 要不要外部平台** | — | — | — | — | — |
| **→ 自研薄语义层（选定）** | 5：读模型投影 SQL views + 指标 JSON 定义（复用 A-005 的 (metric,operator,value) 三元组），TS/Python 原生，零新增语言栈 | 5：就在 DuckDB 内，与 SWMR 读路径同进程/同快照，无第二存储 | 5：即 ADR-0005 ②「独立语义层 read model」的字面实现 | 4：无外部维护面；心智对标 LookML/Fowler Semantic Layer | 4：投影逻辑本就每 scale 必写，指标层只是其上的 view 约定 | 结论：三平台分别命中「过重（MetricFlow）/多进程+多存储（Cube）/成熟度档（Malloy）」，均不匹配静态审计事实 + 5 scale 独立投影的负载 |

### 3.2 OpenTelemetry Baggage

| 维 | 分 | 依据 |
|---|---|---|
| M1 语言栈 | 5 | JS Traces/Metrics **Stable**、Python **Stable**（Logs 均 Development，不影响）；**Baggage API/SDK 双 stable**（spec 状态页 2025-10：「now completely stable」）；Rust 三信号全 Beta（BaggagePropagator 已存在）。与 A-010 SDK 清单完全一致 |
| M2 DuckDB 集成 | 4 | baggage 本身不查数据（无 OTLP/Collector 组件）；其进 fact 表的唯一正路 = 入口显式读出 → 写属性/事实列，**A-010 已把 trace_id/baggage_id 内联双键落地**——契合路径已铺好 |
| M3 心智相容 | 5 | W3C baggage 传播 = CONTEXT.md「Cross-Scale Correlation Key」的定义心智；无状态传输载体，天然不碰数据面 |
| M4 成熟度 | 4 | spec stable + W3C CR Snapshot（2024-05）双源；⚠ 2026-05 CVE-2026-45292（Java ≤1.61.0 无界内存解析，1.62.0 起强制 64 条目/8KB）；跨语言限值执行不齐（Python/JS/Rust 是否同样强制未逐一实证，S-缺口2） |
| M5 成本 | 5 | 仅 propagator + BaggageSpanProcessor 显式搬运，无服务无存储 |

**判定：采用（限定）**——只作关联键传输载体；三条使用红线见 §4.2。

### 3.3 AsyncAPI

| 维 | 分 | 依据 |
|---|---|---|
| M1 语言栈 | 4 | TS 是工具链主力（parser-js / CLI / Studio 官方）；Python 侧靠社区（asyncapi-python、FastStream）且**无官方 Python parser**；Rust 无 |
| M2 DuckDB 集成 | 4 | 契约层与数据面正交，不与 fact table 竞争；payload schema 校验可做成写入前门禁（A-007 写者入口） |
| M3 心智相容 | 5 | spec §5.2 明文「AsyncAPI 事件契约心智：schema 不可改、版本号演进、消费者按版本订阅」——规范层就是 D-005 Event Sourcing 的契约表达 |
| M4 成熟度 | 3 | 规范层 OK（3.1.0，2026-01-31，无破坏变更）；但 **3.0→3.1 间隔两年近乎停滞**、第三方工具常滞后只支持 2.6.0、**无官方版本管理协议/registry**（契约目录靠拼装 Apicurio/Confluent，深度 $ref 解析受限）；**2026-07-14 generator 系 + spec-json-schemas 供应链攻击**（Miasma RAT，合法 OIDC provenance，当天撤包） |
| M5 成本 | 3 | 只用 spec+校验≈零成本；完整「registry+代码生成流水线」拼装成本高且生态碎片化 |

**判定：采用规范心智 + 受限采用工具链**（registry 自研版本表，npm 锁 exact 版本 + provenance 校验）。

### 3.4 LangGraph

| 维 | 分 | 依据 |
|---|---|---|
| M1 语言栈 | 5 | **唯一双栈一等公民**：Python 与 JS/TS 同步 1.0 GA（2025-10），主要功能对等（StateGraph/checkpointer/interrupt/流式/subgraphs/Store）；TS 侧另有 Zod 运行时校验、边缘运行时优势；Rust 无（Go 重写 langgraph-core 进行中） |
| M2 DuckDB 集成 | 2 | 官方 checkpointer 矩阵 = MemorySaver/SQLite/Postgres/MongoDB/Redis——**无 DuckDB 后端**；接 SSOT 需自写 checkpointer 适配（thread_id 限 255 字符、checkpoint 无界增长是实坑） |
| M3 心智相容 | 3 | 官方定位即「有状态图编排」，与 hub「只做元逻辑（裁决/契约/路由）」部分重叠；但其**线程状态/Store 自成第二状态存储**，若进 hub 元逻辑面即与 SSOT 冲突；社区批评「别把它当 Spring Boot」 |
| M4 成熟度 | 4 | 框架与平台层成熟（PyPI 月下载 ~3700 万 vs npm ~600 万）；⚠ 官方对比文为营销资产（「Temporal 无 HITL/流式路径」被独立信源反驳为可组合）；2026 初无原生 MCP/A2A；商业锁客倾向（LangSmith/Studio/Agent Fleet） |
| M5 成本 | 3 | 学习曲线陡（独立评测 2-4 周，图心智对顺序代码团队不直觉）；作纯确定性编排要剥离 LLM 中心假设 |

**判定：采用 + 划界**——进 Macro-C LLM 抽取/叙事编排面（Python 栈原生契合），**不进 hub 元逻辑面**；
> **版本关系（per WORKFLOW §4.2.1 — 不动他人提交）**：并行窗口分支 `fix/architecture-recovery-13`（提交 szs）已完成本票初版闭环——8 维矩阵 + 四工具决策，并在其 §0/§7 诚实披露「本窗口无 ctx_*，atomcode 调研缺口」。本报告为其**二次闭环精化**，落在其栈之上：① 补齐 §4.2.3 两轮串行 atomcode 深度调研；② 精化其 LangGraph 论据一（其自述「TS 页面未作为本次证据」——调研证实 LangGraph Python 与 JS/TS 双栈 1.0 GA（2025-10）主要功能对等，故其「暂不默认采用」的核心理由收敛为 SSOT 第二状态源 + hub 边界越权，而非语言覆盖缺失）；③ 精化其 metrics layer 行（其仅评 dbt SL——补充 Cube / Malloy 两候选后「自研轻量」结论更强）；④ AsyncAPI 在其「采用」上追加供应链攻击（2026-07-14）与 registry 缺位两条硬约束。四工具最终决策与其语义一致（自研轻量 / 采用受限 / 采用 / 不进 hub），无数值冲突。hub supervisor 的 adopt-vs-自研终裁归 A-011，本票矩阵行即其 M2=2 / M3=3 冲突面证据。

---

## 4. 主交付物 2 —— 每工具「采用 / 替代 / 自研」决策（专属验收第 2 项）

### 4.1 决策总表

| 工具（spec §5.7 点名） | 决策 | 采用面 | 替代/自研面 | 重评触发条件 |
|---|---|---|---|---|
| **metrics layer** | **自研**（薄语义层） | Malloy 的 compile-to-SQL **心智**（不作依赖） | 指标定义 = JSON（复用 A-005 三元组）；消费 = DuckDB read model 视图；**不部署** MetricFlow/Cube/Malloy 任一 | 出现「跨仓指标服务化 / BI 嵌入 / 多租户」需求 → 重评 Cube（M1/M4 最高的现成平台） |
| **OpenTelemetry Baggage** | **采用** | W3CBaggagePropagator 注入/提取 + BaggageSpanProcessor 显式搬运 + 32-hex 极小 payload 进 `baggage_id`（A-010 已锁） | 持久化机制 = fact table 内联双键（不用 baggage 留痕，它无 OTLP/存储组件） | 无（stable 档位；Rust 侧随 SDK 转 stable 再启用） |
| **AsyncAPI** | **采用（规范）+ 受限（工具链）** | 3.1.0 文档格式作事件契约载体；parser-js/`asyncapi validate` 进 CI；Modelina 生成 TS/Py 类型 | **registry = 自研**：fact DB 内 `schema_registry` 版本表（active 指针 + 弃用标记），不拼装 Apicurio/Confluent；npm 全链 exact-version + provenance 校验 | dbt OSI 式「官方 registry 协议」或 Confluent 深度兼容落地 → 重评外购 registry |
| **LangGraph** | **采用（划界）** | Macro-C 的 LLM 叙事/抽取流水线编排（Python 栈、interrupt=verdict-gate 人审门禁模式、SQLite/Postgres checkpointer 用于流水线内短记忆） | hub 协调层**不自建在 LangGraph 上**（A-011 终裁）；其 checkpointer 不接 DuckDB SSOT（无官方后端，M2=2） | A-011 若裁定 adopt LangGraph 作 supervisor → 本票划界作废并重开冲突面评估 |

### 4.2 Baggage 三条使用红线（M4 风险的反制）

1. **payload 极小化**：只放 32 位 hex 的 `baggage_id`（A-010 决议），远离 64 条目/8KB 限值；超限截断的非确定行为（MUST NOT 传播部分成员 + 丢弃顺序未指定）对本设计恒不触发。
2. **不入敏感信息**：自动 instrumentation 会把 baggage 带进几乎所有出站请求（信任边界泄露面）——红线：任何 PII/业务可反推编码不得进 baggage（A-010 字段约束已含此条，工具层重申）。
3. **显式落表**：baggage 不自动进 telemetry——每 scale 入口挂 BaggageSpanProcessor 或在采集器显式读 context 写事实列；Java ≤1.61.0 的 CVE 提醒**所有 propagator 依赖锁到修复版起**。

### 4.3 决策的一致性自检

- 与 A-007（SWMR）：metrics 自研层是读侧视图，零新增写者 ✅
- 与 A-010（双关联键 + SDK 清单）：baggage=采用、Rust=Beta 不参与主路径，两票口径同源 ✅
- 与 ADR-0005 ④（hub 不进数据面）：拒绝 Cube 常驻服务进 hub、拒绝 LangGraph 状态层进 hub ✅
- 与 spec §5.2（AsyncAPI 契约心智）：保留其规范层表达力，砍掉其生态缺口（registry）改自研 ✅

---

## 5. atomcode 深度调研（per WORKFLOW §4.2.3）

### 5.1 执行参数

两轮**串行**调研（同会话共享配额，禁并发）：`ctx_batch_execute(concurrency: 1, timeout: 600000)`。

| 轮 | 问题 | 返回 |
|---|---|---|
| R1 | OpenTelemetry Baggage × metrics layer 三工具（MetricFlow/Cube/Malloy）2026 成熟度对比 | 11 节索引 / 20+ 条分点结论 / 对比矩阵 / 19 条来源清单 / 7 条信息缺口；置信高（每结论 ≥2 独立信源） |
| R2 | AsyncAPI 工具链 × LangGraph 2026 成熟度对比（规范演进/代码生成/registry；Py-TS 对等/checkpointer/通用编排边界） | 10 节索引 / 9 组分点结论 / 对比矩阵 / A1-A10 + L1-L10 双组来源清单 / 5 条信息缺口 |

关键来源（编号 = 调研报告内 S/A/L 清单）：OTel spec 状态页（Baggage 双 stable）、W3C Baggage CR、OTel JS/Python/Rust 官方语言页、GitHub Advisory GHSA-rcgg-9c38-7xpx（CVE-2026-45292）、MotherDuck MetricFlow cookbook（DuckDB renderer）、Cube DuckDB 数据源文档、malloydata/malloy 仓库、querio/contextawareanalytics 2026 语义层对比、asyncapi.com 3.1.0 发布说明 + 工具页、StepSecurity 供应链攻击取证、crewship Py/TS 对等对比、langchain.com 官方 v0.2/persistence 文档、Nirmitee 独立评测、Reddit/HN 社区信号。

### 5.2 对标工业界成熟方案（≥2，per handoff——本节给 4 个）

| 对标 | 心智模型 | 对本票的验证/警示 |
|---|---|---|
| **Looker LookML / Martin Fowler Semantic Layer** | 指标语义层 = 建模语言 + 编译到 SQL，独立于 UI 与存储 | 验证「自研薄语义层」路线正确——语义层的本质是**定义与投影**，不必是**服务**（采用率 LookML 28% 居首，恰是「定义即代码」形态） |
| **Temporal / durable execution** | 通用编排 = 事件溯源 + 确定性重放，与 LLM 非确定性正交 | 警示 LangGraph 进 hub：独立评测（Nirmitee 2026-05）把确定性/审计评为 Temporal 最强——本产品的 hub 恰是「确定性路由 + 审计」负载，不需要 agent 抽象 |
| **Confluent Schema Registry / Apicurio** | 事件契约的版本协商（subject/version/compatibility mode）是**注册中心**问题，不是 spec 格式问题 | 验证 AsyncAPI 的缺口在 registry 层——我们的 schema_version 自研版本表就是最小注册中心（active 指针 + 兼容位），对标其 wire 语义而非其部署形态 |
| **W3C Trace Context 生态（Dapper 谱系）** | 关联键走「极小 opaque id + 显式持久化」，跨信任边界不带语义 | 验证 baggage 三条红线与 A-010 双键设计的工业先例一致性 |

### 5.3 基线决策回顾（D-001 ~ D-007 与本票契合度）

- **D-001/D-002/D-003**（5 scale 全覆盖 / 拒 MVP / 不含商业）：矩阵按 scale×工具双维读——Cube 服务化、dbt Cloud 付费、LangGraph 商业平台三者都被 D-003「边界不含商业」进一步降权。
- **D-004**（战略 quadrant S1-S5）：无直接耦合；metrics 自研层的 (metric,operator,value) 契约直接复用 A-005 已锁单元矩阵。
- **D-005**（本票来源决策）：判定权重全压在 M2/M3（SSOT/控制面）——MetricFlow、Cube、LangGraph-hub 三者的扣分点全在数据面/第二存储，即 ADR-0005 的反模式清单。
- **D-006**（共享骨架）：read model 投影 = 自研 metrics 层的消费端，无新决策。
- **D-007**（10 演示路径）：baggage/AsyncAPI 的失败语义演示位（header 超限、契约版本不匹配）已在 §4.2 红线与 A-010 校验约束中给出可演示钩子。

---

## 6. 信息缺口（per Sufficiency Gate — data does not show）

1. **dbt Fusion/Core 1.12 spec v2.0 GA 状态**未获 release notes 实证（只检索到预告）——若 MetricFlow 重评，先查。
2. **Python/JS/Rust 的 W3CBaggagePropagator 是否同 Java/Go 强制 64/8192**未逐源码核验；本票以「payload 极小化」红线消解该风险，不依赖它。
3. **Rust OTel SDK 转 stable 的 ETA** 官方无时间表——Rust 增强路径触发条件因此只能是「事件」不是「日期」。
4. **Malloy experimental 标签**存在自我定位 vs 外部感知分歧，无权威裁定——本票只借其心智不借其依赖，风险已隔离。
5. **asyncapi-python / Modelina 的 3.x 生成质量**未做源码级实测——采用面若扩到生成器需先做 spike。
6. **LangGraph 非 LLM 纯确定性编排**缺独立量化评测；现有批评来自博客/营销文——A-011 决策若倾向 adopt，应补一次 5 天原型（已写入账本 A-011 行「前置 = 语言栈确定」之后的实证项）。
7. **npm 生态对 @asyncapi/specs 6.11.2 恶意版的存量清理**未知——锁版本策略按「≥3.3.0 generator / 6.11.1 specs 白名单版本」执行即可免疫。

## 7. 完成定义对照（per WORKFLOW §4.2.5）

### 7.1 专属验收 checklist

- [x] **评估维度 ≥4 个** — §2 定义 5 维（M1-M5），含判据与权重理由。
- [x] **每个工具必须给决策** — §4.1 决策总表：metrics layer=自研 / OTel Baggage=采用 / AsyncAPI=采用+受限 / LangGraph=采用+划界，各带采用面、替代/自研面、重评触发条件。
- [x] **1) 工具 × 评估维度契合度矩阵** — §3 全矩阵：metrics layer 三候选逐维打分 + 类别判定行，baggage/AsyncAPI/LangGraph 逐维打分，每格带调研来源依据。
- [x] **2) 每个工具的「采用 / 替代 / 自研」决策** — §4.1 + §4.2 使用红线 + §4.3 与 A-007/A-010/ADR-0005/spec §5.2 的一致性自检。

### 7.2 通用调研要求对照（per handoff）

| 要求 | 状态 | 证据 |
|---|---|---|
| atomcode 深度调研（§4.2.3）：baseline D-001~D-007 + 当前决策 + 仓库现状 + 推荐方案 | [x] | §5.1 两轮串行；§5.3 基线回顾；§1 仓库现状；§4 推荐方案 |
| 回顾 docs/adr/（ADR-0005） | [x] | 头部 ADR ref + §4.3（② ④ 两子决策逐条对账） |
| 回顾 CONTEXT.md 心智术语 | [x] | §3 各 M3 格（Cross-Scale Correlation Key / Event Sourcing / Read Model / SSOT / Federated Governance） |
| 对标工业界成熟方案 ≥2 | [x] | §5.2 四组（LookML/Fowler、Temporal、Confluent/Apicurio、W3C/Dapper） |

### 7.3 阻塞

- **Blocked by: None — 已闭环。** 本票不阻塞他票；对 A-011/A-008 输出为输入而非依赖。

### 7.4 lessons 候选（per WORKFLOW §4 教训追加）

1. **「语言栈契合」是二维问题：SDK 档位 × 集成形态。** OTel Baggage 语言支持满分但「无持久化组件」；LangGraph 语言对等满分但「无 DuckDB checkpointer」——矩阵把 M1 与 M2 分开打，才能暴露「语言契合 ≠ 架构契合」。
2. **供应链事件要进矩阵分值。** AsyncAPI 的 2026-07 generator 投毒把 M4 从 4 压到 3，并直接改变了采用面（npm exact-version 进决策）——成熟度维度必须吸收安全事件流，不是只看 star/下载。
3. **「采用」必须配「采用面/禁用面/重评触发」三件套。** 本票四个决策没有一个裸「采用」——否则 A-011 会在 LangGraph 的 hub 适用边界上重开整票评估。
4. **规划仓库的契合度评估对象是决策锁定的目标栈。** 先找 ledger 前置行（A-013 前置=语言栈确定→A-010 SDK 清单），别对着空目录找 package.json。

### 7.5 引用文件列表

**本票读取（必读清单）：**
1. `.scratch/architecture-recovery/issues/13-tool-alignment.md`
2. `.scratch/architecture-recovery/handoffs/13-tool-alignment.md`
3. `.scratch/architecture-recovery/spec.md`（§Decision 5.7 + D-005 Cluster 全段）
4. `.scratch/architecture-recovery/WORKFLOW.md`（§4.2.1–§4.2.6）
5. `.scratch/architecture-recovery/decision-ledger.md`（A-013 行 + A-010 结论段）
6. `docs/adr/0005-hub-of-facts-with-federated-adjudication.md`
7. `CONTEXT.md`（术语表）
8. `.scratch/architecture-recovery/reports/10-report.md` 口径经账本段承接（未全文复读，见 §7.4 教训 4 前置链）
9. `.scratch/architecture-recovery/reports/07-report.md`（结构范式 + R1-R5 不变式对账）

9b. 并行初版（只读参照，未被修改）：提交 szs 内 `reports/13-report.md` 与 `decision-ledger.md` A-013 段（git cat-file 直读核验）

**本票产出：**
10. `.scratch/architecture-recovery/reports/13-report.md`（本报告）
11. `.scratch/architecture-recovery/decision-ledger.md`（追加 `## A-013 结论落盘` 段）

**调研来源（两轮完整清单见 atomcode 报告 S1-S22 / A1-A10 / L1-L10）：** OpenTelemetry Specification Status、W3C Baggage CR、OTel JS/Python/Rust 语言页、GHSA-rcgg-9c38-7xpx（CVE-2026-45292）、dbt-labs/metricflow、MotherDuck MetricFlow cookbook、Cube DuckDB 数据源文档、malloydata/malloy、querio/contextawareanalytics 语义层对比、getbruin 2026 工具榜、asyncapi.com 3.1.0 发布说明与工具页、StepSecurity 攻击取证、Crewship Py/TS 对等、langchain.com persistence 与 v0.2 公告、Nirmitee 编排评测。

---

## 8. 与其他票的关系

| 票 | 关系 |
|---|---|
| A-008（schema 版本演进） | 承接：AsyncAPI=契约格式采用 + registry=自研版本表——A-008 直接引用 §4.1 该行作工具前提 |
| A-010（关联键，已闭环） | 前置承接：SDK 清单与双键设计 = 本票 M1/M2 基线；§4.2 红线是其字段约束的工具层重申 |
| A-011（LangGraph supervisor） | 输出输入：§3.4 矩阵行（M2=2/M3=3）+ §4.1 划界 = A-011 决策矩阵的「语言契合/SSOT 冲突面」两维预填 |
| A-012（data mesh 防线） | 输出输入：拒绝第二存储（Cube 缓存、LangGraph 状态层）即「重复劳动」防线的工具层兑现 |
| A-009（read model 失效） | 承接：自研 metrics 层寄生于 read model 视图，SLA/陈旧标记归 A-009 |

---

## 9. 版本控制（per WORKFLOW §4.2.1）

本票全部写操作走 `but` CLI，提交至独立 session 分支；不使用任何 git write 命令（add / commit / push / checkout / merge / rebase / stash / cherry-pick 全程未执行），仅用只读 `git cat-file` 核验他人提交内容。不 push、不建 PR（未经用户指示）。

| 项 | 值 |
|---|---|
| 分支 | `a013-tool-alignment`（GitButler 提示的依赖恢复路径：栈于 `fix/architecture-recovery-13` 之上，未动该分支及任何他人分支提交） |
| 提交 | `pwz`（报告正文，二次闭环版）+ `uou`（账本「A-013 二次闭环落盘」精化段）。change ID 稳定，SHA 随历史编辑变化，故以 change ID 为准 |
| 提交范围 | 仅 `reports/13-report.md` + `decision-ledger.md` 两处；并行初版提交 szs 保持原样未修改 |
| 账本 | 初版 A-013 段（szs）+ 本窗口精化段并存，精化段显式声明「不推翻、补调研、改论据」（per WORKFLOW §4.2.4） |
