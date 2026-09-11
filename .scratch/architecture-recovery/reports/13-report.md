# Report: A-013 — 工具对齐评估

- **A-xxx:** A-013
- **Decision:** `spec.md` §Decision 5.7
- **ADR ref:** `docs/adr/0005-hub-of-facts-with-federated-adjudication.md`
- **对应 issue:** `issues/13-tool-alignment.md`
- **对应 handoff:** `handoffs/13-tool-alignment.md`
- **Report date:** 2026-09-11
- **Verdict:** 四类参考工具不应等权“全量采用”。本仓库默认采用 `OpenTelemetry Baggage`（限 `baggage_id` 传播）与 `AsyncAPI`（事件契约/版本注册）；`metrics layer` 只采用心智并自研轻量指标目录，不引入 dbt Semantic Layer；`LangGraph` 不作为 HoF hub 默认 runtime，仅保留为 Python 侧可选实验/评估 harness。

---

## 0. 开工复述（per 本票「开工第一句」硬要求）

**Blocked by: None**（can start immediately）——本票无上游阻塞，本窗口直接开工。

**必读清单全部路径 + 阅读状态：**

| # | 路径 | 状态 |
|---|---|---|
| 1 | `.scratch/architecture-recovery/issues/13-tool-alignment.md` | 已读全文 |
| 2 | `.scratch/architecture-recovery/handoffs/13-tool-alignment.md` | 已读全文 |
| 3 | `.scratch/architecture-recovery/spec.md` §Decision 5.7 | 已读 |
| 4 | `.scratch/architecture-recovery/WORKFLOW.md` §4.2 | 已读（沿用本窗口前序全文读取） |
| 5 | `.scratch/architecture-recovery/decision-ledger.md` A-013 | 已读 |
| 6 | `docs/adr/0005-hub-of-facts-with-federated-adjudication.md` | 已读全文 |
| 附 | `CONTEXT.md` 相关术语 | 已读：HoF-FA / SSOT / Event Sourcing / Read Model / Federated Computational Governance / Cross-Scale Correlation Key |

> 工具说明：本窗口未暴露 `ctx_*` / `ctx_batch_execute`，无法按 WORKFLOW §4.2.3 的指定 carrier 运行 atomcode；已用 agent-reach/web 官方文档直读替代，并在 §7 标明缺口。

---

## 1. 评估维度

本票使用 8 个维度，满足“评估维度 ≥4 个”的专属验收。

| 维度 | 问题 | 判定标准 |
|---|---|---|
| V1 语言栈契合度 | 是否契合本仓库默认 TS / Python / Rust 分工 | JS/Node 与 Python 优先；Rust 仅内部增强；商业 SaaS 依赖扣分 |
| V2 HoF-FA 心智一致性 | 是否强化 SSOT + read model + federated adjudication | 不复制事实、不让 hub 进数据面、不把 5 scale 当业务域 |
| V3 契约/版本治理价值 | 是否能表达不可变 schema、事件契约、消费者订阅或版本注册 | 能直接服务 A-008 / A-009 / A-012 加分 |
| V4 观测/关联价值 | 是否支持 trace / baggage / lineage / metric 关联 | 能落入 fact table 前置字段或事件回写加分 |
| V5 运行时重量 | 是否引入重平台、云账号、外部服务、长期守护进程 | 越轻越适合 spec-level / 本地工具链 |
| V6 隐私与安全风险 | 是否会传播敏感信息或扩大信任边界 | 需要 allowlist / 出口过滤 / 不信任外部输入 |
| V7 成熟度与生态 | 是否有标准化文档、SDK、解析器、工具生态 | 开放标准优先，单厂商平台次之 |
| V8 与既有票边界 | 是否越界替代 A-007/A-008/A-010/A-011/A-012 | 复用既有结论，不重开已封口决策 |

---

## 2. 工具 × 评估维度契合度矩阵

评分：`High` = 直接采用；`Medium` = 限定采用/适配；`Low` = 不默认采用；`Risk` = 需硬约束。

| 工具 / 心智 | V1 语言栈 | V2 HoF-FA | V3 契约治理 | V4 观测关联 | V5 运行重量 | V6 安全隐私 | V7 成熟生态 | V8 边界 | 总评 |
|---|---|---|---|---|---|---|---|---|---|
| metrics layer（以 dbt Semantic Layer / MetricFlow 为代表） | Medium：dbt 生态强，但本仓库不是 dbt 项目 | Medium：统一指标口径契合 read model，但不可替代 fact SSOT | Medium：适合指标定义，不适合事件 schema 主契约 | Medium：指标一致性有用，trace/lineage 非核心 | Risk：dbt Platform Starter/Enterprise 依赖偏重 | Medium：权限能力有价值，但账号/凭据边界重 | High：成熟指标层心智 | High：不重开 A-007/A-009 | **自研轻量替代** |
| OpenTelemetry Baggage | High：JS/Python stable，A-010 已选 | High：只传播 `baggage_id`，不复制事实 | Low：不是 schema 契约工具 | High：跨 trace / retry / async fan-out 关联核心 | High：SDK 轻，传播标准成熟 | Risk：会随 HTTP header 扩散、无内建完整性 | High：CNCF/OTel 标准生态 | High：承接 A-010，不扩权 | **采用（受限）** |
| AsyncAPI | High：语言无关 YAML/JSON，适合 TS/Python/Rust 消费 | High：契约集中定义，各 scale runtime 执行 | High：message / channel / schema / operation / binding 正中 A-008 | Medium：correlationId 可对齐 trace/baggage，但非遥测系统 | High：规范文件轻，可离线校验 | Medium：需避免把 secrets 写入 server/security 示例 | High：开放标准 + parser/codegen/doc 生态 | High：服务 A-008，不替代 OTel | **采用** |
| LangGraph | Medium：Python 强，TS 页面未作为本次证据；本仓库多 scale 以 JS/Python wrapper 预期 | Medium：可做 orchestration，但状态存储可能旁路 SSOT | Low：不是事件契约/schema 工具 | Medium：streaming/tracing 有价值，但需 LangSmith 才完整 | Risk：引入 agent runtime / checkpoint / store，偏重 | Medium：human-in-loop 有价值，但工具执行面扩大 | Medium：LangChain 生态成熟但快速演化 | Risk：易越界替代 A-011 hub 协调层 | **替代/暂不默认采用** |

---

## 3. 每个工具的决策

### 3.1 metrics layer — **自研轻量替代**

**决策：不采用 dbt Semantic Layer / MetricFlow 作为默认工具；采用 metrics layer 心智，自研最小 `metric_catalog`。**

理由：

1. dbt Semantic Layer 强依赖 dbt project、dbt models、dbt Platform Starter/Enterprise 账号；本仓库当前是 spec-level 审计工具规划，不是数据团队 dbt 仓库。
2. HoF-FA 的事实层已经由 DuckDB `fact` table 承担；指标层只应定义 read model 的指标口径，不应成为第二事实源。
3. 本仓库所需指标更接近 guardrail / SLI：如 `read_model_lag_seconds`、`lineage_gap_count`、`duplicate_job_seconds_ratio`，不需要完整 BI semantic layer。

最小替代设计：

| 字段 | 含义 |
|---|---|
| `metric_id` | 如 `read_model_lag_seconds` |
| `owner` | 指标责任人 |
| `definition_sql` | 从 fact/read model 计算的 SQL，不直接扫外部事实源 |
| `unit` | seconds / count / percent / ratio |
| `window` | 5m / 1h / 24h / 7d |
| `threshold` | warning / critical 阈值 |
| `source_fact_types` | 依赖哪些 fact event |
| `report_binding` | 进入哪个报告骨架字段 |

边界：未来若某试点仓库已天然使用 dbt，可提供 dbt adapter，但不是默认主路径。

### 3.2 OpenTelemetry Baggage — **采用（受限）**

**决策：采用 OTel Baggage 作为跨 scale 审计意图传播机制，但只允许一个 opaque `baggage_id` 成员进入 fact table。**

采用规则：

1. 只允许 `baggage_id=<32 lower-hex>`；禁止用户 ID、邮箱、repo 私密名、token、租户 ID 等敏感或可反推字段。
2. 不信任外部传入 Baggage：入口必须校验格式；外部来源可覆盖为新 `baggage_id`。
3. Baggage 不自动成为 trace / metric / log 属性；wrapper 必须显式 allowlist 映射。
4. 对外部第三方请求执行出口过滤，默认剥离 baggage header。

理由：A-010 已锁定 `trace_id` / `baggage_id` 字段；OTel Baggage 正好解决重试、异步 fan-out、补跑导致新 trace 时的审计意图关联。

### 3.3 AsyncAPI — **采用**

**决策：采用 AsyncAPI 作为事件契约与 schema 版本治理的规范格式；不把它误用为运行时 broker 或拓扑强制器。**

采用范围：

1. `channels` 表示 fact event topic / logical stream。
2. `messages` 表示审计事件类型，如 `fact.recorded`、`handoff.ready`、`handoff.ack`、`contract.validation_result`、`claim.materialized`。
3. `payload schema` 表达不可变事件 schema；演进通过 `schema_version` / 新 message 版本，而不是就地修改。
4. `correlationId` 对齐 `trace_id` 或 `baggage_id`，但字段格式仍以 A-010 为准。
5. `components` / `$ref` / `x-*` 扩展用于复用与内部元数据。

理由：AsyncAPI 是语言无关开放规范，可被 TS/Python/Rust 解析；契合 ADR-0005 的“协议集中定义、scale runtime 执行”，并直接服务 A-008。

### 3.4 LangGraph — **替代 / 暂不默认采用**

**决策：不把 LangGraph 作为 HoF hub 默认协调层；保留为 Python 侧实验 harness 或未来 A-011 的候选之一。默认路线是自研确定性轻量 orchestrator + 明确事件契约。**

拒绝默认采用的原因：

1. 本次官方页面证据主要是 Python；本仓库预期是 TS / Python / Rust 混合，HoF hub 不应被 Python agent runtime 锁死。
2. LangGraph 的 persistence / checkpoint / stores 若直接保存业务状态，容易形成 fact table 之外的第二状态源，需额外约束才能不冲突 SSOT。
3. 本仓库 hub 只应做元逻辑（裁决 / 契约 / 路由），不应把 multi-agent 工作流本身变成数据面。
4. A-011 已单独承载 LangGraph supervisor 适配评估；本票不提前替 A-011 作最终 hub 架构决策。

允许使用的窄边界：

- Macro-C Python 历史分析 / LLM 假设抽取流水线的本地实验 harness。
- 人工复核流程 prototype。
- 不把 LangGraph checkpoint 当作审计事实源；所有可审计结果必须写回 fact table。

---

## 4. 推荐集成组合

```text
                 CONTROL PLANE
  AsyncAPI contracts + lightweight metric_catalog + adjudication policy
                         │
                         │ versioned definitions
                         ▼
                  SCALE RUNTIMES
  JS/Node wrappers ─ OTel trace/baggage ─ Python jobs ─ Rust internals
                         │
                         │ append-only events
                         ▼
                 DuckDB fact table (SSOT)
                         │
                         │ projections
                         ▼
        read models + report shared skeleton + metric checks
```

推荐组合：

| 层 | 默认选择 |
|---|---|
| 事件契约 | AsyncAPI |
| 跨运行关联 | OpenTelemetry Trace Context + Baggage（仅 `baggage_id`） |
| 指标定义 | 自研 lightweight `metric_catalog`，SQL over fact/read model |
| Agent/workflow 编排 | 自研确定性 orchestrator；LangGraph 仅实验/可选 |

---

## 5. 与其他票的关系与边界

| 票 | 关系 | 边界 |
|---|---|---|
| A-007 | metrics / contracts / baggage 的产物最终都落在单写 DuckDB fact table。 | 不改变 SWMR、version、snapshot isolation。 |
| A-008 | AsyncAPI 是 schema 演进规则的推荐规范载体。 | A-008 负责注册中心、版本订阅、兼容性规则。 |
| A-009 | metrics catalog 提供 read model lag / staleness 指标定义。 | A-009 负责陈旧读 SLA 的完整处置策略。 |
| A-010 | OTel Baggage 采用结论必须遵守 A-010 的 `baggage_id` 字段定义。 | 不重新定义 trace_id / baggage_id。 |
| A-011 | LangGraph 本票只给工具契合度结论：不默认采用。 | A-011 可进一步做 supervisor 深评，但不得绕过 SSOT。 |
| A-012 | 本票指标与 AsyncAPI/OTel/metrics 决策支撑三条防线。 | 防线机制仍归 A-012。 |

---

## 6. 信息缺口（Sufficiency Gate）

1. **atomcode 指定 carrier 不可用**：本窗口无 `ctx_*` / `ctx_batch_execute`，不能按 WORKFLOW §4.2.3 原样执行 atomcode；已用官方文档直读替代。
2. **metrics layer 以 dbt Semantic Layer 代表，不等于全行业穷举**：若后续明确要选具体 metrics 工具，可补评 Cube、MetricFlow standalone、Lightdash 等。
3. **LangGraph TS 支持未纳入本次证据**：本次读取的是 Python overview；因此只给“暂不默认采用”，不作“永不采用”。
4. **仓库仍是 spec-level**：没有真实 TS/Python/Rust 代码，语言栈契合度按已封口规划和相邻票结论判断。

---

## 7. 完成定义对照（per WORKFLOW §4.2.5）

### 7.1 专属验收 checklist

- [x] **评估维度 ≥4 个** — §1 定义 8 个维度。
- [x] **每个工具必须给决策** — §3 分别给出 metrics layer / OTel Baggage / AsyncAPI / LangGraph 的“自研轻量替代 / 采用 / 采用 / 替代暂不默认采用”。
- [x] **1) 工具 × 评估维度的契合度矩阵；2) 每个工具的“采用 / 替代 / 自研”决策** — §2 为矩阵；§3 为逐工具决策。

### 7.2 通用调研要求对照

| 要求 | 状态 | 证据 |
|---|---|---|
| 回顾 baseline 决策（D-001 ~ D-007）+ 当前决策 + 目标仓库现状 | [x] | §0 / §1 / §5。 |
| atomcode 深度调研 | [!] | ctx carrier 不可用；缺口见 §6.1；未伪称已跑。 |
| 回顾 `docs/adr/` 相关 ADR（ADR-0005） | [x] | §0 / §4 / §5。 |
| 回顾 `CONTEXT.md` 相关心智模型术语 | [x] | §0 / §4，承接 HoF-FA、SSOT、Event Sourcing、Read Model、Cross-Scale Correlation Key。 |
| 对标工业界成熟方案 ≥2 个 | [x] | §2 / §3：dbt Semantic Layer、OpenTelemetry Baggage、AsyncAPI、LangGraph。 |

### 7.3 阻塞

- **Blocked by: None（已解除）** — 本票无上游阻塞，一次闭环。
- **本票不阻塞他票**；输出供 A-008/A-009/A-011 复用。

### 7.4 lessons 候选

1. **工具名不是采用结论。** `metrics layer` 是心智而非必须引入 dbt Semantic Layer；先看 HoF-FA 需要哪一层能力。
2. **传播工具不能承载可信身份。** OTel Baggage 适合传播 `baggage_id`，不适合存放 PII、权限或安全决策依据。
3. **契约工具与运行时工具要分离。** AsyncAPI 定义事件契约，不定义实际 broker / queue / runtime 架构。
4. **Agent runtime 不应制造第二状态源。** LangGraph 若使用，checkpoint 只能是执行恢复状态；审计事实仍必须回写 fact table。

### 7.5 引用文件列表

**本票读取（必读清单）：**
1. `.scratch/architecture-recovery/issues/13-tool-alignment.md`
2. `.scratch/architecture-recovery/handoffs/13-tool-alignment.md`
3. `.scratch/architecture-recovery/spec.md`（§Decision 5.7）
4. `.scratch/architecture-recovery/WORKFLOW.md`（§4.2）
5. `.scratch/architecture-recovery/decision-ledger.md`（A-013 行）
6. `docs/adr/0005-hub-of-facts-with-federated-adjudication.md`
7. `CONTEXT.md`

**本票产出：**
8. `.scratch/architecture-recovery/reports/13-report.md`
9. `.scratch/architecture-recovery/decision-ledger.md`（追加 `## A-013 结论落盘` 段）
10. `.scratch/architecture-recovery/issues/13-tool-alignment.md`（验收勾选）

**外部对标来源：**
11. dbt Semantic Layer — https://docs.getdbt.com/docs/use-dbt-semantic-layer/dbt-sl
12. OpenTelemetry Baggage — https://opentelemetry.io/docs/concepts/signals/baggage/
13. AsyncAPI Specification — https://www.asyncapi.com/docs/reference/specification/latest
14. LangGraph Overview — https://docs.langchain.com/oss/python/langgraph/overview

---

## 8. 版本控制（per WORKFLOW §4.2.1）

本报告与本票账本/issue 更新应通过 `but` CLI 提交到本 session 独立分支，不使用任何 git write 命令。实际执行结果见下表（提交后回填）。

| 项 | 值 |
|---|---|
| 分支 | `fix/architecture-recovery-13`（堆叠在 `fix/architecture-recovery-12` 之上，承接 ledger 依赖，不动他人分支提交） |
| 提交 | `szs` |
| 提交范围 | `reports/13-report.md` + `decision-ledger.md`（A-013 结论段）+ `issues/13-tool-alignment.md`（验收勾选） |
| 决策账本 | `.scratch/architecture-recovery/decision-ledger.md` 追加 `## A-013 结论落盘` 段（per WORKFLOW §4.2.4） |

> **禁止命令遵守情况**：本次不执行 git add / git commit / git push / git checkout / git merge / git rebase / git stash / git cherry-pick。所有版本控制写动作走 `but` CLI。
>
> **未推送声明**：未经用户指示不 push —— 本票止于本地提交，不执行 `but push` / `but pr new`。

---

*Report generated: 2026-09-11 · A-013 · tool alignment · metrics layer · OpenTelemetry Baggage · AsyncAPI · LangGraph*
