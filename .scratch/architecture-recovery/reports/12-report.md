# Report: A-012 — Data mesh 失败模式防线设计

- **A-xxx:** A-012
- **Decision:** `spec.md` §Decision 5.6
- **ADR ref:** `docs/adr/0005-hub-of-facts-with-federated-adjudication.md`
- **对应 issue:** `issues/12-data-mesh-defense.md`
- **对应 handoff:** `handoffs/12-data-mesh-defense.md`
- **Report date:** 2026-09-11
- **Verdict:** 在 ADR-0005 的 HoF-FA / SSOT 前提下，Data Mesh 三大失败不靠“持续监控”兜底，而用三条有明确触发条件的防线阻断：`Ownership Edge Gate` 防无人拥有的 in-between，`Contract + Lineage Canary Gate` 防静默断裂，`Fact Claim + Reuse Gate` 防重复劳动。所有防线产物进入 fact table / read model，并在报告中以 `⚠ unverified` 或 `degraded` 明示。

---

## 0. 开工复述（per 本票「开工第一句」硬要求）

**Blocked by: None**（can start immediately）——本票无上游阻塞，本窗口直接开工。

**必读清单全部路径 + 阅读状态：**

| # | 路径 | 状态 |
|---|---|---|
| 1 | `.scratch/architecture-recovery/issues/12-data-mesh-defense.md` | 已读全文 |
| 2 | `.scratch/architecture-recovery/handoffs/12-data-mesh-defense.md` | 已读全文 |
| 3 | `.scratch/architecture-recovery/spec.md` §Decision 5.6 | 已读（含 Coverage 对账表） |
| 4 | `.scratch/architecture-recovery/WORKFLOW.md` §4.2（§4.2.1 ~ §4.2.6） | 已读全文 |
| 5 | `.scratch/architecture-recovery/decision-ledger.md` A-012 | 已读（A-012 行 + 已闭环 A-005/A-006/A-007/A-010 段） |
| 6 | `docs/adr/0005-hub-of-facts-with-federated-adjudication.md` | 已读全文（Status: accepted） |
| 附 | `CONTEXT.md`（相关心智模型术语） | 已读全文 |
| 附 | `docs/adr/0001-*.md` ~ `docs/adr/0007-*.md` | 已读，用于 D-001 ~ D-007 基线回顾 |

> 工具说明：本窗口未暴露 `ctx_*` / `ctx_batch_execute`，无法按 WORKFLOW §4.2.3 的指定 carrier 运行 atomcode；已按用户 `/goal` 的 fallback 完成内置文件读取，并用 agent-reach/web 官方文档直读补足工业对标。该降级记录在 §7。

---

## 1. 设计边界与基线承接

### 1.1 本票只设计防线，不重开 ADR-0005

ADR-0005 已接受：5 scale 不是独立业务域，而是同一审计事实的不同粒度；因此本仓库不采用 Data Mesh 的“领域自治数据副本”作为主架构，而采用 **Hub-of-Facts with Federated Adjudication**：

- 数据底座：共享 DuckDB `fact` table，SSOT，事件单向写入，按需投影。
- 治理协议：hub 集中定义、版本化；5 scale 在各自 runtime 执行。
- hub 边界：只做元逻辑（裁决 / 契约 / 路由），不经过数据面。

本票的防线目标是：借 Data Mesh 失败教训，给 HoF-FA 增加预防性 guardrail，而不是把系统改回 data mesh。

### 1.2 D-001 ~ D-007 基线回顾

| 基线 | 对 A-012 的约束 |
|---|---|
| ADR-0001 / D-001：5 scale 全覆盖 | 防线必须覆盖 Macro-A / Macro-B / Macro-C / Micro-A / Micro-B，不能只覆盖 Macro-B / Micro-A。 |
| ADR-0002 / D-002：No MVP slice | 防线不允许“先做部分 scale”；所有触发条件必须对 5 scale 有定义。 |
| ADR-0003 / D-003：边界不含商业 | owner 指工程责任 owner，不引入客户、销售、市场或商业域 owner。 |
| ADR-0004 / D-004：S1-S5 战略维 | 防线指标可服务 S5 所有权边界匹配，但不重写 S1-S5 判据。 |
| ADR-0005 / D-005：HoF-FA | 防线必须以 SSOT + federated adjudication 为前提；不允许跨 scale 私建事实副本。 |
| ADR-0006 / D-006：共享骨架 + scale 切片 | 降级产物必须进入统一报告骨架，并用 scale-specific 切片解释影响。 |
| ADR-0007 / D-007：10 路径 | 每条防线失败都要能成为 failure path：有触发、降级、verdict-gate 印记、报告产物。 |

### 1.3 与已闭环票的接口

| 已闭环票 | 本票复用点 |
|---|---|
| A-007 DuckDB 写入策略 | 复用单写多读、`version` 水位、append-only fact table、WAL / 队列 / 快照指标。 |
| A-010 Cross-scale correlation key | 复用 `trace_id` 连接一次运行链路，`baggage_id` 连接同一审计意图；用于断裂与重复检测。 |

---

## 2. 工业对标摘要

| 对标对象 | 成熟做法 | 本票吸收点 |
|---|---|---|
| Data Mesh 原则（Martin Fowler / Zhamak Dehghani） | domain ownership、data as a product、self-serve platform、federated computational governance；失败常见于只有分权、没有 owner / 全局标准 / 自动化治理。 | 不采“自治数据副本”，但吸收“产品必须有 owner、SLO、质量指标、全局互操作标准”。 |
| OpenLineage | 用 `Job` / `Run` / `Dataset` / `Event` / `Facet` 描述运行时 lineage；Facet 可挂 ownership、schema、quality、环境。 | 防 in-between owner：把 scale handoff 表达成 edge，并要求每条 edge 有 owner facet 与 ack。 |
| Great Expectations | Expectation / Expectation Suite / Checkpoint / Validation Result；输出 `success_percent`、`unexpected_count`、`unexpected_percent`、severity。 | 防静默断裂：把 schema、枚举、完整性、分布漂移变成质量门禁和量化指标。 |
| Google SRE Monitoring | 告警应基于可操作、可量化、用户可见或即将用户可见的症状；四黄金信号：Latency / Traffic / Errors / Saturation。 | 指标只进入 Dashboard 不等于防线；本票每条告警都必须有触发条件、处置动作、恢复条件。 |

---

## 3. 三大失败模式防线

### 3.1 防线一：`Ownership Edge Gate` — 防“无人拥有 in-between”

**失败定义：** 两个 scale / job / read model 之间存在事实交接边，但没有明确责任人、没有 ack SLA、没有升级路径；问题发生在边界中间，生产方说已产出，消费方说没收到，hub 只看到缺口。

#### 机制

1. 在控制面维护 `handoff_edge` 清单，粒度不是“表 owner”，而是 **edge owner**：
   - `edge_id`：如 `macro-b.fact-produced -> report-aggregation.read-model`。
   - `producer_scale` / `consumer_scale`。
   - `producer_owner` / `consumer_owner` / `bridge_owner`。
   - `contract_id` / `schema_version`。
   - `ack_sla_seconds`（默认 300s；Micro-A 可 60s）。
   - `escalation_owner`。
2. 每次生产者写入 fact 时，必须同步写入 `handoff_ready` 事件；消费者成功投影后写入 `handoff_ack` 事件。
3. hub 只裁决 edge 元数据完整性和 ack SLA，不代替任一 scale 处理数据。

#### 触发条件（非持续监控）

| 触发 | 量化条件 | 严重度 |
|---|---:|---|
| Owner 缺失 | 新增或变更 `handoff_edge` 时，`producer_owner` / `consumer_owner` / `bridge_owner` 任一为空，或不在允许 owner registry 中 | critical |
| Ack 超时 | `handoff_ready.version = v` 后，`ack_sla_seconds` 内没有同一 `edge_id + baggage_id + schema_version` 的 `handoff_ack` | critical |
| 责任冲突 | 同一 `edge_id` 在 24h 内出现 ≥2 个不同 `bridge_owner` 且无 supersede 记录 | warning |
| 边界异常集中 | 最近 7 天 `orphan_handoff_count / handoff_ready_count > 1%`，且样本数 ≥100 | warning |

#### 处置流程

1. critical owner 缺失：拒绝发布/合并该 edge 契约，生成 `GapRequest(owner_missing)`，报告对应 scale 标 `⚠ unverified`。
2. critical ack 超时：冻结该 `baggage_id` 的跨 scale 聚合，不生成“全量通过”结论；自动路由给 `bridge_owner`，同时抄送 producer / consumer owner。
3. warning 责任冲突：创建 ticket 由 `escalation_owner` 在 2 个工作日内裁决唯一 owner；裁决前沿用旧 owner，但报告标注 owner ambiguity。
4. 解除条件：同一 edge 连续 7 天 `orphan_handoff_count = 0`，且全部 critical GapRequest closed。

#### 防线失效时降级路径

若 owner registry 自身不可用或 owner 无法确认：

- 降级为 **hub quarantine**：只保留 fact，不进入跨 scale report aggregation。
- 报告输出 `degraded: ownership_unresolved`，并列出受影响 `edge_id` / `baggage_id` / `version` 范围。
- verdict-gate 不允许给出“通过”建议，只能输出 `data doesn't show`。

---

### 3.2 防线二：`Contract + Lineage Canary Gate` — 防“静默断裂”

**失败定义：** 上游 schema、语义、枚举、字段分布或 lineage 关系改变，下游仍能运行但结论已错；没有显式错误，报告悄悄变坏。

#### 机制

1. 每个 fact event 绑定不可变 `schema_version` 和 `contract_id`；契约含字段存在性、枚举集合、必填字段、payload JSON shape、关键业务不变量。
2. 每个 scale 写入 `lineage_event`：`job_id`、`run_id`、input fact version range、output fact version range、`trace_id`、`baggage_id`。
3. 每个 read model 发布前执行 `Contract Checkpoint`：
   - schema compatibility check。
   - required field completeness check。
   - enum drift check。
   - row-count / event-count canary。
   - lineage completeness check。
4. Checkpoint 结果以 fact 形式写回，供报告骨架展示，不只存在日志中。

#### 触发条件（非持续监控）

| 触发 | 量化条件 | 严重度 |
|---|---:|---|
| 契约 critical 失败 | 任一 critical expectation 失败，或 `critical_unexpected_count > 0` | critical |
| 契约通过率过低 | `expectation_success_percent < 99.5%`，窗口 = 最近 1 个 read model 发布批次 | critical |
| 必填字段缺失 | `missing_percent(trace_id) > 0` 或 `missing_percent(baggage_id) > 0` 或 `missing_percent(schema_version) > 0` | critical |
| Lineage 断裂 | 存在 output fact，但缺少对应 `lineage_event.run_id`；或 input version range 与 output version range 不连续 | critical |
| Canary 突变 | 同一 scale / event_type 的批次事件数相对 7 日同小时中位数偏离 > 3σ，且最小样本 ≥30 批 | warning |
| Read model 陈旧转断裂 | `read_model_lag_seconds > 5s` 持续 3 个发布周期，且最新 fact 版本已写入 | critical |

#### 处置流程

1. critical 失败：阻断该 read model 发布；保持上一版已验证 read model；本次报告切片标 `⚠ unverified(contract_failed)`。
2. lineage 断裂：按 `trace_id` 查询 run 链，定位第一个缺失 `lineage_event` 的 job；路由给该 job owner 与 edge `bridge_owner`。
3. warning canary：允许发布但在报告证据章插入 `quality_warning`；连续 3 次 warning 升级为 critical。
4. 解除条件：同一契约版本连续 3 个发布批次 `expectation_success_percent >= 99.5%`，且 `lineage_gap_count = 0`。

#### 防线失效时降级路径

若契约检查器或 lineage collector 自身不可用：

- 发布链路进入 **fail-closed for verdict / fail-open for evidence**：事实可继续写入，但不可形成 verified verdict。
- 报告使用上一版 verified read model，并标注 `degraded: contract_or_lineage_checker_unavailable`。
- 若无上一版 verified read model，则输出空结论 + GapRequest，不硬凑叙事。

---

### 3.3 防线三：`Fact Claim + Reuse Gate` — 防“重复劳动”

**失败定义：** 多个 scale 或 job 为同一 repo/commit/PR/run 重复采集同一证据、重复跑同一 expensive analysis、重复维护同一事实副本，最终事实不一致且成本膨胀。

#### 机制

1. 所有事实采集前先申请 `fact_claim`，以 `claim_key = hash(repo_id, commit_sha, scale_id, evidence_kind, source_path, tool_version, schema_version)` 唯一标识。
2. claim 状态：`claimed` → `materialized` → `reused` / `superseded` / `expired`。
3. 写者进程只接受：
   - 首个 `claim_key` 的 materialization；或
   - 带 `supersedes_claim_id` 的版本化重算。
4. read model 默认复用已 materialized 的 fact，通过 `baggage_id` / `version` 投影，不允许 scale 私建第二事实源。

#### 触发条件（非持续监控）

| 触发 | 量化条件 | 严重度 |
|---|---:|---|
| 重复 claim | 同一 `claim_key` 在 claim TTL（默认 24h）内出现第 2 个 `claimed` | warning |
| 重复 materialization | 同一 `claim_key` 出现第 2 个 `materialized`，且无 `supersedes_claim_id` | critical |
| 证据 hash 重复 | 不同 `scale_id` 写入相同 `evidence_hash` 且 `evidence_kind` 相同，24h 内重复率 `duplicate_evidence_hash_rate > 5%`，样本 ≥100 | warning |
| 重算成本过高 | 单日 `duplicate_job_seconds / total_job_seconds > 10%` | critical |
| SSOT 旁路 | 发现 read model 从非 fact table / 非声明 cache 读取审计事实 | critical |

#### 处置流程

1. warning 重复 claim：后到者改为 `reuse_wait`，等待首个 claim materialized；若超 TTL，交给 `bridge_owner` 裁决是否接管。
2. critical 重复 materialization：拒绝第 2 份 fact 写入；生成 `duplicate_fact_violation`，报告列出冲突 `claim_id` 与 `version`。
3. duplicate job cost 超阈值：把最高成本的重复 `evidence_kind` 列为优化 ticket，要求改为共享投影或共享 tool output。
4. SSOT 旁路：阻断该 scale 的 verified verdict；旁路数据只能作为 debug artifact，不进入报告证据章。
5. 解除条件：连续 7 天 `duplicate_materialization_count = 0` 且 `duplicate_job_seconds / total_job_seconds <= 2%`。

#### 防线失效时降级路径

若 claim registry 自身不可用：

- 进入 **single-writer safe mode**：只允许写者基于 `claim_key` 做本地去重，禁止并发重算优化。
- 高成本 job 改为缓存只读；无法证明唯一性的 evidence 标 `⚠ duplicate-risk`。
- 对报告建议章执行 verdict-gate 降级：重复证据不得提升 evidence strength，只能作为同源旁证。

---

## 4. 监控指标清单（全部可量化）

| 指标 | 公式 / 采集点 | 触发阈值 | 归属防线 |
|---|---|---:|---|
| `owner_missing_count` | 新增/变更 edge 中 owner 空值数 | `> 0` | Ownership Edge Gate |
| `orphan_handoff_count` | `handoff_ready` 后 SLA 内无 `handoff_ack` 的 edge 数 | `> 0` critical；7 日率 `> 1%` warning | Ownership Edge Gate |
| `handoff_ack_latency_p95_seconds` | ready 到 ack 的 p95 延迟 | `> ack_sla_seconds` | Ownership Edge Gate |
| `owner_conflict_count_24h` | 同一 edge 24h 内不同 bridge owner 个数 - 1 | `>= 1` warning；`>= 2` critical | Ownership Edge Gate |
| `expectation_success_percent` | successful expectations / evaluated expectations × 100 | `< 99.5%` critical | Contract + Lineage Canary Gate |
| `critical_unexpected_count` | critical expectation 的 unexpected_count 合计 | `> 0` | Contract + Lineage Canary Gate |
| `required_field_missing_percent` | 必填字段 missing_count / element_count × 100 | `> 0%` | Contract + Lineage Canary Gate |
| `lineage_gap_count` | 缺失 run/job/dataset 关联的 output fact 数 | `> 0` | Contract + Lineage Canary Gate |
| `canary_event_count_zscore_abs` | 当前批次事件数 vs 7 日同小时中位数的 robust z-score | `> 3` 且样本 ≥30 | Contract + Lineage Canary Gate |
| `read_model_lag_seconds` | `max(fact.version recorded_at)` 到 read model latest version 的时间差 | `> 5s` 连续 3 周期 | Contract + Lineage Canary Gate |
| `duplicate_claim_count_24h` | 同一 `claim_key` 的重复 claimed 次数 | `> 0` | Fact Claim + Reuse Gate |
| `duplicate_materialization_count_24h` | 同一 `claim_key` 的重复 materialized 次数（无 supersede） | `> 0` | Fact Claim + Reuse Gate |
| `duplicate_evidence_hash_rate` | duplicate evidence hash count / total evidence facts | `> 5%` 且样本 ≥100 | Fact Claim + Reuse Gate |
| `duplicate_job_seconds_ratio` | duplicate_job_seconds / total_job_seconds | `> 10%` critical；`> 2%` 持续优化 | Fact Claim + Reuse Gate |
| `ssot_bypass_count` | read model 从非 fact / 非声明 cache 读取事实次数 | `> 0` | Fact Claim + Reuse Gate |

---

## 5. 防线联动与降级总规则

### 5.1 统一状态机

```text
normal
  -> warning(metric threshold)
  -> quarantined(critical violation)
  -> degraded(report can render but cannot verified verdict)
  -> restored(clear conditions satisfied)
```

### 5.2 统一处置优先级

1. **证据安全优先**：宁可输出 `data doesn't show`，不输出无证据的通过结论。
2. **SSOT 优先**：任何旁路数据、重复事实、未声明缓存都不得进入 verified evidence。
3. **最小降级**：只隔离受影响 `edge_id` / `baggage_id` / `scale_id`，不全局停机。
4. **可审计优先**：所有 override 必须写入 `override_event`，含 `override_id`、owner、reason、expires_at、影响 version range。

### 5.3 防线自身失效时的共同降级

| 防线自身失败 | 共同降级 |
|---|---|
| owner registry 不可用 | 冻结新增 edge；既有 edge 只读；跨 scale 聚合标 `ownership_registry_unavailable`。 |
| contract checker 不可用 | fail-closed for verdict：报告可渲染 evidence，但行动建议不得标 verified。 |
| lineage collector 不可用 | 使用 `trace_id` / `baggage_id` 做弱关联；报告标 `lineage_unverified`。 |
| claim registry 不可用 | 写者本地去重 + 禁止 expensive job 并发重算；重复风险标注。 |
| metric pipeline 不可用 | 不提升结论等级；只能输出 last-known-good + GapRequest。 |

---

## 6. 与其他票的关系与边界

| 票 | 关系 | 边界 |
|---|---|---|
| A-007 | `Fact Claim + Reuse Gate` 依赖单写者和 `version` 水位保证唯一写入。 | 不改变 A-007 的写策略、隔离级别、批量版本分配。 |
| A-008 | `Contract + Lineage Canary Gate` 使用 `schema_version` / `contract_id`。 | schema 演进、注册中心、消费者订阅规则由 A-008 定义。 |
| A-009 | read model 陈旧指标进入静默断裂触发条件。 | 陈旧读 SLA 的完整策略仍归 A-009。 |
| A-010 | 三条防线均使用 `trace_id` / `baggage_id` 定位受影响运行和审计意图。 | 不重新定义字段格式和 OTel SDK 清单。 |
| A-013 | 工具对齐可复用本票指标与对标对象。 | 不做 metrics layer / AsyncAPI / LangGraph 的最终工具选型。 |

---

## 7. 信息缺口（Sufficiency Gate）

1. **atomcode 指定 carrier 不可用**：本窗口无 `ctx_*` / `ctx_batch_execute`，不能按 WORKFLOW §4.2.3 原样执行 atomcode；已在报告中降级标注，并以官方文档直读补充工业对标。
2. **真实阈值需 Phase 4 校准**：本票阈值为 v1 设计参数；`99.5%`、`1%`、`5%`、`10%` 等应在实现期基于试点仓库与历史窗口校准。
3. **owner registry 载体未定**：本票定义 owner 必填和 ack 机制，不指定 CODEOWNERS / YAML / DB table 的实现形态，避免越界到实施票。
4. **DataHub / OpenMetadata data contract 页面抓取未命中**：本次未采入为证据，不影响采用 Great Expectations 的质量门禁心智。

---

## 8. 完成定义对照（per WORKFLOW §4.2.5）

### 8.1 专属验收 checklist

- [x] **每条防线必须有触发条件（不能“持续监控”）** — §3.1 / §3.2 / §3.3 均有触发表，且每项含量化条件。
- [x] **监控指标必须可量化** — §4 给出 15 个指标，全部有公式或采集点与阈值。
- [x] **1) 三大失败每条一条防线（机制 + 触发条件 + 处置流程）；2) 监控指标清单；3) 防线失效的降级路径** — §3 三条防线分别含机制/触发/处置/降级；§4 指标清单；§5 总降级规则。

### 8.2 通用调研要求对照

| 要求 | 状态 | 证据 |
|---|---|---|
| 回顾 baseline 决策（D-001 ~ D-007）+ 当前决策 + 目标仓库现状 | [x] | §0 必读、§1.2 基线回顾、§1.3 已闭环票接口。 |
| atomcode 深度调研 | [!] | ctx carrier 不可用；缺口见 §7.1；未伪称已跑 atomcode。 |
| 回顾 `docs/adr/` 相关 ADR（ADR-0005） | [x] | §1.1 / §1.2 / §6。 |
| 回顾 `CONTEXT.md` 相关心智模型术语 | [x] | §1.1、§3、§5 使用 HoF-FA / SSOT / Read Model / Failure Semantics / Adjudication Protocol。 |
| 对标工业界成熟方案 ≥2 个 | [x] | §2：Data Mesh、OpenLineage、Great Expectations、Google SRE Monitoring。 |

### 8.3 阻塞

- **Blocked by: None（已解除）** — 本票无上游阻塞，一次闭环。
- **本票不阻塞他票**；输出供 A-008/A-009/A-013 复用。

### 8.4 lessons 候选

1. **防线必须写成事件触发，不写成“持续监控”。** 本票所有防线都以新增/变更 edge、read model 发布批次、fact 写入、claim 申请等事件或窗口阈值触发，避免不可执行的泛监控口号。
2. **Owner 不能只挂在资产上，还要挂在 edge 上。** in-between 失败发生在交接边；只写 dataset owner 无法定位 bridge owner。
3. **静默断裂要同时查契约和 lineage。** 只有 schema check 会漏掉“运行链路缺失但数据表还能读”的断裂；只有 lineage 会漏掉“字段语义漂移但作业成功”的断裂。
4. **重复事实不能提高证据强度。** 同源重复 evidence 应标为 duplicate-risk，而不是当成独立证据增强 verdict。

### 8.5 引用文件列表

**本票读取（必读清单）：**
1. `.scratch/architecture-recovery/issues/12-data-mesh-defense.md`
2. `.scratch/architecture-recovery/handoffs/12-data-mesh-defense.md`
3. `.scratch/architecture-recovery/spec.md`（§Decision 5.6 + Coverage 表）
4. `.scratch/architecture-recovery/WORKFLOW.md`（§4.2.1 ~ §4.2.6）
5. `.scratch/architecture-recovery/decision-ledger.md`（A-012 行）
6. `docs/adr/0005-hub-of-facts-with-federated-adjudication.md`
7. `CONTEXT.md`
8. `docs/adr/0001-*.md` ~ `docs/adr/0007-*.md`

**本票产出：**
9. `.scratch/architecture-recovery/reports/12-report.md`
10. `.scratch/architecture-recovery/decision-ledger.md`（追加 `## A-012 结论落盘` 段）
11. `.scratch/architecture-recovery/issues/12-data-mesh-defense.md`（验收勾选）

**外部对标来源：**
12. Data Mesh Principles and Logical Architecture — https://martinfowler.com/articles/data-mesh-principles.html
13. OpenLineage Docs — https://openlineage.io/docs/
14. Great Expectations Docs — https://docs.greatexpectations.io/docs/core/introduction/try_gx/
15. Google SRE Book, Monitoring Distributed Systems — https://sre.google/sre-book/monitoring-distributed-systems/

---

## 9. 版本控制（per WORKFLOW §4.2.1）

本报告与本票账本/issue 更新应通过 `but` CLI 提交到本 session 独立分支，不使用任何 git write 命令。实际执行结果见下表（提交后回填）。

| 项 | 值 |
|---|---|
| 分支 | `fix/architecture-recovery-12`（已堆叠在 `a007-duckdb-write-strategy` 之上，承接 ledger 依赖，不动他人分支提交） |
| 提交 | `utm` |
| 提交范围 | `reports/12-report.md` + `decision-ledger.md`（A-012 结论段）+ `issues/12-data-mesh-defense.md`（验收勾选） |
| 决策账本 | `.scratch/architecture-recovery/decision-ledger.md` 追加 `## A-012 结论落盘` 段（per WORKFLOW §4.2.4） |

> **禁止命令遵守情况**：本次不执行 git add / git commit / git push / git checkout / git merge / git rebase / git stash / git cherry-pick。所有版本控制写动作走 `but` CLI。
>
> **未推送声明**：未经用户指示不 push —— 本票止于本地提交，不执行 `but push` / `but pr new`。

---

*Report generated: 2026-09-11 · A-012 · data mesh defense · ownership edge gate · contract lineage canary · fact claim reuse gate*
