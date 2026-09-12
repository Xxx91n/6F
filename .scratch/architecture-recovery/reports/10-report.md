# Report: A-010 — Cross-scale correlation key

- **A-xxx:** A-010
- **Decision:** `spec.md` §Decision 5.4
- **ADR ref:** `docs/adr/0005-hub-of-facts-with-federated-adjudication.md`
- **对应 issue:** `issues/10-cross-scale-correlation-key.md`
- **对应 handoff:** `handoffs/10-cross-scale-correlation-key.md`
- **Report date:** 2026-09-11
- **Verdict:** 在共享 DuckDB fact table 内前置 `trace_id` / `baggage_id` 两个字段，不另起表；`trace_id` 承接 W3C Trace Context / OpenTelemetry SpanContext 的 32 位小写 hex Trace ID，表达一次运行链路；`baggage_id` 承接 W3C Baggage 中的 `baggage_id` 成员，使用 128-bit opaque lower-hex，表达同一审计意图上下文（repo/commit/PR/run）的跨 trace 关联。

---

## 0. 开工复述（per 本票「开工第一句」硬要求）

**Blocked by: None**（can start immediately）——本票无上游阻塞，本窗口直接开工。

**必读清单全部路径 + 阅读状态：**

| # | 路径 | 状态 |
|---|---|---|
| 1 | `.scratch/architecture-recovery/issues/10-cross-scale-correlation-key.md` | 已读全文 |
| 2 | `.scratch/architecture-recovery/handoffs/10-cross-scale-correlation-key.md` | 已读全文 |
| 3 | `.scratch/architecture-recovery/spec.md` §Decision 5.4 | 已读（含 Coverage 对账表） |
| 4 | `.scratch/architecture-recovery/WORKFLOW.md` §4.2（§4.2.1 ~ §4.2.6） | 已读全文 |
| 5 | `.scratch/architecture-recovery/decision-ledger.md` A-010 | 已读（表格行 + 既有 A-005/A-006/A-007 落盘段） |
| 6 | `docs/adr/0005-hub-of-facts-with-federated-adjudication.md` | 已读全文（Status: accepted） |
| 附 | `CONTEXT.md`（相关心智模型术语） | 已读全文 |

> 工具说明：本窗口未暴露 `ctx_*` / `ctx_batch_execute` 工具；按用户 `/goal` 的 fallback，读取与写入使用内置文件工具。通用调研中 atomcode 的 ctx carrier 不可用，因此用官方规范/文档直读替代，并在 §3 标明来源与缺口。

---

## 1. 结论（明文）

### 1.1 选定字段语义

| 字段 | 语义 | 解决的问题 |
|---|---|---|
| `trace_id` | 一次审计运行链路的分布式追踪 ID；同一触发链路下 5 scale 产生的事实共享同一个 trace | 把 Macro-A/Macro-B/Macro-C/Micro-A/Micro-B 在一次同步或近同步运行中串起来 |
| `baggage_id` | 一次审计意图上下文的 opaque ID；在 W3C Baggage 中传播，跨异步 fan-out、重试、补跑时保持稳定 | 当重试或异步任务产生新 trace 时，仍能把同一 repo/commit/PR/run 的事实关联起来 |

设计约束：

1. **字段必须在 fact table schema 内**，不另起 `trace` / `baggage` 辅表；这维持 ADR-0005 的 SSOT，不把同一审计事实复制到第二处。
2. **`trace_id` 与 `baggage_id` 都是事实行的前置观测字段**；5 scale 写入任意 fact 时必须携带。
3. **`trace_id` 管运行链路，`baggage_id` 管审计意图**；二者一起作为跨 scale 关联键，避免把 W3C Baggage 误用成 trace 的替代品。
4. **`baggage_id` 是 opaque ID，不是完整 baggage header**；完整 baggage 可能含 PII/高基数字段，不进入 fact table 前置列。

---

## 2. fact table schema（专属验收第 1 项）

### 2.1 字段定义（类型 / 长度 / 来源）

| 字段 | DuckDB 类型 | 长度 / 格式 | 来源 | 生成规则 | 校验 |
|---|---|---|---|---|---|
| `trace_id` | `CHAR(32)` | 32 个小写 hex 字符，表示 16 bytes Trace ID | OpenTelemetry `SpanContext.traceId`；传播格式为 W3C `traceparent` 中的 `trace-id` | 审计入口创建 root span；下游 scale 从上下文提取；缺失时由入口生成新 trace | `^[0-9a-f]{32}$`，且不得全零 |
| `baggage_id` | `CHAR(32)` | 32 个小写 hex 字符，128-bit opaque ID | W3C `baggage` header 中的 `baggage_id=<id>` 成员；OpenTelemetry Baggage API 读写 | 审计入口若无合法 `baggage_id`，生成 128-bit CSPRNG lower-hex；重试/异步补跑沿用原值 | `^[0-9a-f]{32}$`，且不得全零；禁止 PII / 业务可反推编码 |

设计理由：

- W3C Trace Context 规定 `trace-id = 32HEXDIGLC`，16 bytes，lowercase hex，且全零非法。
- W3C Baggage 允许应用自定义 key/value 随上下文传播，但不定义业务语义；因此本产品只定义一个短、不可反推的 `baggage_id` 成员，而不把完整 baggage 展开到 fact table。
- W3C Baggage 对 64 个成员 / 8192 bytes 以内要求传播；本设计的 `baggage_id` 约 43 bytes（`baggage_id=` + 32 hex + 分隔开销），远低于边界。
- OpenTelemetry Baggage 可能泄露敏感信息且没有内置完整性校验，所以 fact table 前置字段只落 opaque ID，不落 `user.id`、`account.id`、token 等敏感或半敏感值。

### 2.2 DDL（字段在 fact table 内，不另起表）

```sql
CREATE TABLE fact (
  trace_id       CHAR(32)   NOT NULL,
  baggage_id     CHAR(32)   NOT NULL,
  version        BIGINT     NOT NULL,
  schema_version SMALLINT   NOT NULL,
  event_type     VARCHAR    NOT NULL,
  scale_id       VARCHAR    NOT NULL,
  payload        JSON       NOT NULL,
  recorded_at    TIMESTAMP  NOT NULL,

  PRIMARY KEY (version),

  CHECK (regexp_full_match(trace_id, '^[0-9a-f]{32}$')),
  CHECK (trace_id <> '00000000000000000000000000000000'),
  CHECK (regexp_full_match(baggage_id, '^[0-9a-f]{32}$')),
  CHECK (baggage_id <> '00000000000000000000000000000000'),
  CHECK (scale_id IN ('MACRO-A', 'MACRO-B', 'MACRO-C', 'MICRO-A', 'MICRO-B'))
);
```

与 A-007 的关系：A-007 已锁定 `version` 的全局单调水位线；本票只把 `trace_id` / `baggage_id` 从「预留槽位」升级为正式前置字段。`PRIMARY KEY (version)` 不变，`trace_id` / `baggage_id` 作为查询维度建立二级索引或 zone-map 友好排序策略即可。

建议索引：

```sql
CREATE INDEX fact_trace_idx ON fact(trace_id);
CREATE INDEX fact_baggage_idx ON fact(baggage_id);
CREATE INDEX fact_correlation_idx ON fact(baggage_id, trace_id, scale_id);
```

### 2.3 写入不变式

| # | 不变式 | 说明 |
|---|---|---|
| C1 | 任一 fact 行必须有合法 `trace_id` 和 `baggage_id` | 缺一即拒绝写入；入口负责补齐，不让下游 scale 自行猜 |
| C2 | 同一同步审计链路共享同一 `trace_id` | 用于还原一次 run 内的跨 scale 事件顺序 |
| C3 | 同一审计意图共享同一 `baggage_id` | 用于把异步补跑、重试、fan-out 后的新 trace 重新聚合 |
| C4 | `baggage_id` 不承载业务含义 | 不可编码 repo 名、邮箱、用户 ID、token、租户 ID |
| C5 | 完整 baggage 不入 fact table 前置列 | 需要调试时可在 `payload` 的受控 debug 字段记录白名单键，但默认不落 |

---

## 3. OpenTelemetry / 工业界调研摘要

### 3.1 本窗口调研方式

- 目标路径要求 atomcode 深度调研；但本窗口没有 `ctx_batch_execute` / `ctx_execute`，不能按 WORKFLOW §4.2.3 的指定 carrier 调用 atomcode。
- 替代方式：读取官方 W3C / OpenTelemetry 文档作为一手来源，并使用 `agent-reach` 的 web/官方文档路径完成核验。
- 覆盖来源：W3C Trace Context、W3C Baggage、OpenTelemetry Traces、OpenTelemetry Baggage、OpenTelemetry Language APIs & SDKs。

### 3.2 成熟心智模型 / 工具对标（≥2）

| 对标对象 | 成熟做法 | 本票吸收点 |
|---|---|---|
| W3C Trace Context | `traceparent` 标准化传播 `trace-id` / `parent-id` / flags；`trace-id` 为 16 bytes / 32 lower-hex，全零非法 | `trace_id CHAR(32)` 直接对齐规范，作为跨 scale 运行链路主键 |
| W3C Baggage + OpenTelemetry Baggage | 用随上下文传播的 key/value 携带应用自定义上下文；同时警告隐私、大小和完整性风险 | 只传播并落表 `baggage_id` 这个 opaque ID，不把完整 baggage 或 PII 展开 |
| OpenTelemetry SDK 生态 | JS/Python traces 与 metrics 为 Stable；Rust 为 Beta；自动/手动 instrumentation 均可接入 Context Propagation | 默认选择 JS/Python SDK 做 scale wrapper；Rust 只作为 CodeLore 内部可选增强，不作为默认主路径 |
| ADR-0005 HoF-FA | 共享 DuckDB fact table 是 SSOT；5 scale 各自投影 read model；hub 不进数据面 | correlation key 直接在 fact table 行上，read model 只按键投影，不维护第二事实源 |

### 3.3 基线决策回顾

| 决策 | 对 A-010 的约束 |
|---|---|
| ADR-0001 / D-001 | 5 scale 全覆盖；同一 commit/PR 可同时触发多 scale，必须有统一关联键 |
| ADR-0002 / D-002 | spec-level 完整规划，不能只给 Macro-B/Micro-A 做关联；5 scale 都必须可用 |
| ADR-0003 / D-003 | 不进入商业层；`baggage_id` 不得编码客户/租户/商业身份 |
| ADR-0004 / D-004 | S1-S5 证据源跨 README/ADR/git/ownership；correlation key 不参与评分，只连接证据事实 |
| ADR-0005 / D-005 | SSOT + read model；字段必须在 fact table 内，禁止另起跨 scale 关联表 |
| ADR-0006 / D-006 | 共享报告骨架要能引用同一 `baggage_id` 的多 scale 证据集合 |
| ADR-0007 / D-007 | failure path 要能展示同一 `baggage_id` 下哪些 scale 成功、哪些降级 |

---

## 4. OpenTelemetry SDK 集成清单（专属验收第 2 项）

### 4.1 统一传播协议

所有 scale 使用同一传播约定：

| 项 | 选择 |
|---|---|
| Trace propagation | W3C Trace Context（`traceparent` / `tracestate`） |
| Baggage propagation | W3C Baggage（`baggage` header / 等价 carrier） |
| Fact extraction point | 写者进程消费事件前，从当前 context / event envelope 提取 `trace_id` 与 `baggage_id` |
| Subprocess carrier | 对 CLI 子进程使用内部约定环境变量 `TRACEPARENT` / `BAGGAGE` 或 JSON envelope 字段；它们承载 W3C header 字符串，但不是额外事实源 |
| Missing context | 入口生成 root `trace_id` + `baggage_id`；非入口生产者缺失则拒绝写入并报告 producer bug |

### 4.2 每个 scale 的 SDK 选择

| Scale | 默认 SDK | 选择理由 | 采集边界 |
|---|---|---|---|
| Macro-A（跨仓战略） | OpenTelemetry JavaScript / Node.js SDK | 官方 JS traces/metrics 为 Stable；适合跨仓 orchestration、报告生成、CLI/服务包装；与 IDE/Node 生态契合 | orchestration span 覆盖跨仓依赖图、战略 rubric、报告聚合；子任务通过 W3C carrier 传播 |
| Macro-B（仓库级 4 象限） | OpenTelemetry JavaScript / Node.js SDK | Macro-B 聚合 CodeLore、OpenSSF Scorecard、repomix 等外部工具，最适合在 Node wrapper 统一埋点和收敛输出 | 外部 CLI 不强行改造；wrapper 创建 span，捕获 exit code、耗时、产物路径并写 fact |
| Macro-C（演化考古） | OpenTelemetry Python SDK | Python traces/metrics 为 Stable；历史分析、corpus 校准、LLM 抽取/人工复核流水线更贴近 Python 数据处理生态 | Python job 从 envelope 提取 trace/baggage；长任务可用 child spans 标注窗口、样本、模型版本 |
| Micro-A（PR diff） | OpenTelemetry JavaScript / Node.js SDK | PR bot、CI hook、GitHub/GitLab webhook wrapper 与 Node 生态契合；JS SDK stable，易在短生命周期进程内初始化 | 每次 PR/push 入口创建或提取 trace；`baggage_id` 固定为该 PR 审计意图 |
| Micro-B（file level） | OpenTelemetry JavaScript / Node.js SDK | IDE/LSP/本地文件质量卡最可能在 TS/Node extension 或本地 CLI wrapper 内运行；JS Context API 与异步调用链匹配 | 每次 file audit 创建 child span；同一用户动作下多个文件共享 `baggage_id` |

### 4.3 非默认 SDK 边界

| SDK | 状态 / 用法 | 本票判定 |
|---|---|---|
| OpenTelemetry Rust SDK | 官方语言页标注 Rust traces/metrics/logs 为 Beta | 不作为默认 scale SDK；仅当未来要改造 CodeLore/Rust 内核时作为内部增强 |
| OpenTelemetry Go SDK | 官方 Go traces/metrics 为 Stable | OpenSSF Scorecard 是外部工具时不改造；若未来自研 Go collector，再启用 Go SDK |
| Browser JS SDK | JS 支持 Browser，但本产品当前是 spec-level / 本地审计工具 | 仅用于未来 Web UI，不进入当前 5 scale 默认路径 |

结论：**默认主路径 = JS/Node SDK + Python SDK**。这是在当前 spec 仓库没有实现代码、且 5 scale 多由 wrapper/orchestrator/job 承载的前提下，对语言栈契合度最高、稳定性最高的组合。

---

## 5. 跨 scale 查询示例 SQL（专属验收第 3 项）

### 5.1 从某个 PR 的 Micro-A 事实反查同一审计意图的全部 scale 事实

```sql
WITH target AS (
  SELECT trace_id, baggage_id
  FROM fact
  WHERE scale_id = 'MICRO-A'
    AND json_extract_string(payload, '$.pr_number') = '123'
  ORDER BY version DESC
  LIMIT 1
)
SELECT
  f.version,
  f.recorded_at,
  f.scale_id,
  f.event_type,
  json_extract_string(f.payload, '$.verdict') AS verdict,
  f.trace_id,
  f.baggage_id
FROM fact AS f
JOIN target AS t
  ON f.baggage_id = t.baggage_id
ORDER BY f.version;
```

用途：PR 审计报告里展示「这次 PR 触发的 Macro-B / Micro-A / Micro-B 等事实是否一致」。这里主联结用 `baggage_id`，因为异步补跑可能产生新 `trace_id`。

### 5.2 同一 trace 内还原 5 scale 的同步运行链路

```sql
SELECT
  version,
  recorded_at,
  scale_id,
  event_type,
  json_extract_string(payload, '$.artifact_path') AS artifact_path,
  json_extract_string(payload, '$.status') AS status
FROM fact
WHERE trace_id = :trace_id
ORDER BY version;
```

用途：排查一次审计运行中哪个 scale 先产出、哪个 scale 降级、writer 是否按 version 水位稳定写入。

### 5.3 查同一 commit 在 5 scale 中的冲突裁决

```sql
WITH commit_facts AS (
  SELECT
    baggage_id,
    trace_id,
    scale_id,
    event_type,
    version,
    recorded_at,
    json_extract_string(payload, '$.commit_sha') AS commit_sha,
    json_extract_string(payload, '$.verdict') AS verdict,
    json_extract_string(payload, '$.evidence_strength') AS evidence_strength
  FROM fact
  WHERE json_extract_string(payload, '$.commit_sha') = :commit_sha
)
SELECT
  baggage_id,
  count(DISTINCT scale_id) AS scale_count,
  list(DISTINCT scale_id ORDER BY scale_id) AS scales_seen,
  list(verdict ORDER BY version) AS verdicts,
  min(version) AS first_version,
  max(version) AS last_version
FROM commit_facts
GROUP BY baggage_id
HAVING count(DISTINCT scale_id) > 1
ORDER BY last_version DESC;
```

用途：服务 ADR-0005 的冲突可见可审计；当 Macro-B 行为象限与 Micro-A 同文件 verdict 打架时，先用 `baggage_id` 聚合同一 commit 的多 scale fact，再由 adjudication protocol 处理。

### 5.4 failure path：同一审计意图下缺失哪些 scale

```sql
WITH expected(scale_id) AS (
  VALUES ('MACRO-A'), ('MACRO-B'), ('MACRO-C'), ('MICRO-A'), ('MICRO-B')
), seen AS (
  SELECT DISTINCT scale_id
  FROM fact
  WHERE baggage_id = :baggage_id
)
SELECT e.scale_id AS missing_scale
FROM expected AS e
LEFT JOIN seen AS s USING (scale_id)
WHERE s.scale_id IS NULL
ORDER BY e.scale_id;
```

用途：D-007 failure path 报告里生成降级说明：同一 `baggage_id` 下哪些 scale 没有事实产物，不能沉默失败。

---

## 6. 与其他票的关系与边界

| 票 | 关系 | 边界 |
|---|---|---|
| A-007（DuckDB 写入策略） | 已预留 `trace_id` / `baggage_id` 槽位；本票正式定义字段 | 不改变 A-007 的单写多读、`version` 分配和隔离级别 |
| A-008（Schema 版本演进） | 本票 DDL 包含 `schema_version`，但不定义契约注册中心 | schema 不可改、版本订阅规则归 A-008 |
| A-009（Read model staleness） | read model 可用 `baggage_id` 聚合跨 scale 投影，并用 `trace_id` 排查运行链路 | 陈旧读 SLA 与报警条件归 A-009 |
| A-012（Data mesh defense） | `baggage_id` 防「静默断裂」，fact table 内联字段防「重复劳动」 | 失败模式防线与监控指标归 A-012 |
| A-013（Tool alignment） | 本票给出 OTel SDK 初选，供工具对齐矩阵复用 | 更完整的 metrics layer / AsyncAPI / LangGraph 对齐归 A-013 |

---

## 7. 信息缺口（Sufficiency Gate）

1. **atomcode 指定 carrier 不可用**：本窗口没有 `ctx_*` 工具，无法按 WORKFLOW §4.2.3 原样执行 atomcode；已用官方 W3C/OTel 文档直读替代。若后续有 ctx 窗口，应补跑 atomcode 作为二次核验，但不改变当前字段设计的规范来源。
2. **实现语言未真正落地**：仓库当前是 spec-level 文档，没有源码；SDK 清单按 scale 的最可能 runtime / wrapper 形态选择。若 Phase 4 选择不同语言，应保持字段语义不变，只替换 SDK 适配层。
3. **DuckDB `CHAR(n)` 长度约束需实施期实测确认**：本报告用 `CHECK regexp_full_match` 作为真正约束，避免依赖类型长度行为。

---

## 8. 完成定义对照（per WORKFLOW §4.2.5）

### 8.1 专属验收 checklist

- [x] **字段必须在 fact table schema 里（不能另起表）** — §2.2 给出 `CREATE TABLE fact (...)`，`trace_id` / `baggage_id` 为前置列；无任何 `trace` / `baggage` 辅表。
- [x] **OTel 集成要选语言栈契合度最高的 SDK** — §4.2 给出 5 scale SDK 清单：Macro-A/Macro-B/Micro-A/Micro-B 默认 JS/Node SDK，Macro-C 默认 Python SDK；Rust/Go 仅作边界说明。
- [x] **1) trace_id / baggage_id 字段定义（类型 / 长度 / 来源）；2) OpenTelemetry SDK 集成清单（哪些 scale 用哪个 SDK）；3) 跨 scale 查询示例 SQL** — §2.1 字段定义；§4 SDK 清单；§5 四条 SQL。

### 8.2 通用调研要求对照

| 要求 | 状态 | 证据 |
|---|---|---|
| 回顾 baseline 决策（D-001 ~ D-007）+ 当前决策 + 目标仓库现状 | [x] | §3.3 基线决策回顾；§0 必读清单；§7 标注本仓库为 spec-level 文档仓 |
| atomcode 深度调研 | [!] | ctx carrier 不可用；用 W3C/OTel 官方文档直读替代，缺口见 §7.1 |
| 回顾 `docs/adr/` 相关 ADR（ADR-0005） | [x] | §3.3 / §6，且已读 `docs/adr/0005-hub-of-facts-with-federated-adjudication.md` |
| 回顾 `CONTEXT.md` 相关心智模型术语 | [x] | §1 / §3.3 / §6 承接 Cross-Scale Correlation Key、SSOT、Read Model、HoF-FA |
| 对标工业界成熟方案 ≥2 个 | [x] | §3.2：W3C Trace Context、W3C Baggage、OpenTelemetry SDK 生态、ADR-0005 HoF-FA |

### 8.3 阻塞

- **Blocked by: None（已解除）** — 本票无上游阻塞，一次闭环。
- **本票不阻塞他票**；其输出供 A-008/A-009/A-012/A-013 复用。

### 8.4 lessons 候选

1. **Baggage 不应原样落表。** W3C/OTel 文档都提示 baggage 可能携带敏感信息且无内置完整性校验；fact table 只落 `baggage_id`，完整 baggage 只能走白名单 debug 字段。
2. **Trace 与审计意图要分层。** 重试、异步补跑、长任务 fan-out 可能产生新 trace；仅用 `trace_id` 会丢失同一 commit/PR 的跨运行关联，因此必须有稳定 `baggage_id`。
3. **无 ctx 环境下需显式标注调研降级。** WORKFLOW 要求 atomcode 经 ctx carrier；本窗口没有 ctx，应在报告中留下缺口而不是伪称已跑 atomcode。

### 8.5 引用文件列表

**本票读取（必读清单）：**
1. `.scratch/architecture-recovery/issues/10-cross-scale-correlation-key.md`
2. `.scratch/architecture-recovery/handoffs/10-cross-scale-correlation-key.md`
3. `.scratch/architecture-recovery/spec.md`（§Decision 5.4 + Coverage 表）
4. `.scratch/architecture-recovery/WORKFLOW.md`（§4.2.1 ~ §4.2.6）
5. `.scratch/architecture-recovery/decision-ledger.md`（A-010 行）
6. `docs/adr/0005-hub-of-facts-with-federated-adjudication.md`
7. `CONTEXT.md`

**本票产出：**
8. `.scratch/architecture-recovery/reports/10-report.md`
9. `.scratch/architecture-recovery/decision-ledger.md`（追加 `## A-010 结论落盘` 段）
10. `.scratch/architecture-recovery/issues/10-cross-scale-correlation-key.md`（验收勾选）

**外部一手来源：**
11. W3C Trace Context — https://www.w3.org/TR/trace-context/
12. W3C Baggage — https://www.w3.org/TR/baggage/
13. OpenTelemetry Traces — https://opentelemetry.io/docs/concepts/signals/traces/
14. OpenTelemetry Baggage — https://opentelemetry.io/docs/concepts/signals/baggage/
15. OpenTelemetry Language APIs & SDKs — https://opentelemetry.io/docs/languages/

---

## 9. 版本控制（per WORKFLOW §4.2.1）

本报告与本票账本/issue 更新应通过 `but` CLI 提交到本 session 独立分支，不使用任何 git write 命令。实际执行结果见下表（提交后回填）。

| 项 | 值 |
|---|---|
| 分支 | `fix/architecture-recovery-10` |
| 提交 | `qvz` |
| 提交范围 | `reports/10-report.md` + `decision-ledger.md`（A-010 结论段）+ `issues/10-cross-scale-correlation-key.md`（验收勾选），不夹带其他 agent 变更 |
| 决策账本 | `.scratch/architecture-recovery/decision-ledger.md` 追加 `## A-010 结论落盘` 段（per WORKFLOW §4.2.4） |

> **禁止命令遵守情况**：本次不执行 git add / git commit / git push / git checkout / git merge / git rebase / git stash / git cherry-pick。所有版本控制写动作走 `but` CLI。
>
> **未推送声明**：未经用户指示不 push —— 本票止于本地提交，不执行 `but push` / `but pr new`。

---

*Report generated: 2026-09-11 · A-010 · trace_id + baggage_id · W3C Trace Context · W3C Baggage · OpenTelemetry SDK mapping*
