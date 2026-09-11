# Report 09 — Read model 失效策略（A-009）

> 票：issues/09-read-model-staleness.md · 启动器：prompts/09-read-model-staleness.md · 决策：spec.md §Decision 5.3 · ledger：A-009 · ADR：docs/adr/0005-*.md、docs/adr/0006-*.md
> Blocked by: #08 —— 已闭环。产物：本报告 + reports/09-stale-marker-fields.json（数据）+ reports/09-stale-check.mjs（守卫）+ reports/14-skeleton-fields.json（版本化追加 1.0.0 → 1.1.0）

## 0. 开工复述（per 本票「开工第一句」硬要求）

**Blocked by: #08**（A-008 Schema 版本演进规则 —— 已闭环，reports/08-report.md）

**必读清单全部路径 + 阅读状态：**

| # | 路径 | 状态 |
|---|---|---|
| 1 | .scratch/architecture-recovery/issues/09-read-model-staleness.md | 已读全文 |
| 2 | .scratch/architecture-recovery/handoffs/09-read-model-staleness.md | 已读全文 |
| 3 | .scratch/architecture-recovery/spec.md §Decision 5.3 | 已读（含 Coverage 对账表） |
| 4 | .scratch/architecture-recovery/WORKFLOW.md §4.2（§4.2.1 ~ §4.2.6） | 已读全文 |
| 5 | .scratch/architecture-recovery/decision-ledger.md A-009 | 已读（A-009 行 + 已闭环 A-005/A-006/A-007/A-008/A-010 ~ A-014/A-017/A-018 段） |
| 6 | docs/adr/0005-hub-of-facts-with-federated-adjudication.md | 已读全文（Status: accepted） |
| 7 | docs/adr/0006-shared-skeleton-scale-slice.md | 已读全文（Status: accepted） |
| 附 | CONTEXT.md（Read Model / Failure Semantics / Adjudication Protocol / Sufficiency Gate 等术语） | 已读全文 |
| 附 | reports/07-report.md（A-007）、reports/08-report.md（A-008）、reports/12-report.md（A-012）、reports/14-report.md + 14-skeleton-fields.json（A-014） | 已读关键段 |

> 工具说明：本窗口已暴露 ctx_* 工具集，atomcode 5.0.9 按 WORKFLOW §4.2.3 指定 carrier 两轮串行执行（无 carrier 缺口）。

## 1. 设计边界与基线承接

### 1.1 本票在决策链中的位置

A-009 = spec.md §Decision 5.3「Read model 失效策略」，覆盖 ledger A-009。ADR-0005 已接受「报告聚合 = 独立语义层（read model），不做 UI 抓取」；read model 与 fact table 之间存在投影延迟，本票定义该延迟的容忍度（SLA）、报警触发与报告层标记字段。

### 1.2 D-001 ~ D-007 基线回顾（本票约束）

| 基线 | 对本票的约束 |
|---|---|
| ADR-0001 / D-001：5 scale 全覆盖 | SLA 必须对 5 scale 各有定义，不得只覆盖 Macro-B/Micro-A |
| ADR-0002 / D-002：No MVP slice | 不得先做部分 scale |
| ADR-0003 / D-003：边界不含商业 | SLA 只服务工程审计，不引入业务/商业 SLA |
| ADR-0004 / D-004：S1-S5 | 陈旧标记不重写 S1-S5 判据 |
| ADR-0005 / D-005：HoF-FA | 陈旧度必须在 SSOT + 事件单向写入前提下度量（fact 水位 vs 投影版本） |
| ADR-0006 / D-006：共享骨架 + 切片 | 陈旧标记必须进入统一骨架；四章结构不可变（本票仅 C1 追加字段） |
| ADR-0007 / D-007：10 路径 | stale/unknown 必须能成为 failure path（A-018 语义） |

### 1.3 与已闭环票的接口

| 票 | 复用/边界 |
|---|---|
| A-007（#07） | 复用单写多读 + version 批量块分配（全局单调无空洞）→ MAX(version) 即天然水位；A-007 §4.4 给出最坏链路 0.65s 作为 SLA 可行性上界 |
| A-008（#08） | SLA 常量与字段扩展走 A-008 版本演进语义（ADDITION / REVISION） |
| A-010（#10） | 复用 trace_id/baggage_id 定位受影响运行 |
| A-012（#12） | A-012 §4 已定义 metric read_model_lag_seconds 与「>5s 持续 3 周期 → critical」；A-012 §6 明示「陈旧读 SLA 的完整策略仍归 A-009」→ 本票为该 metric 的策略 owner |
| A-014（#14） | 本票对 D-006 骨架做版本化追加扩展（1.0.0 → 1.1.0，ADDITION），四章结构不变 |
| A-018（#18） | stale/unknown 走 A-018 failure path 印记词表（unverified / data doesn't show） |

## 2. 工业对标摘要（atomcode 两轮串行深度调研，per WORKFLOW §4.2.3）

### 2.1 调研执行

| 轮次 | 主题 | 规模 |
|---|---|---|
| R1 | 工业界 read model / 物化视图 / CQRS 投影的陈旧读容忍度（staleness SLA / data freshness SLO）与报警惯例 | 22 searches（Exa 13 + Tavily 4 + AnySearch 5）/ 25 full reads / 18 来源清单 / 五角度（Official/Community/Criticism/Currency/Comparative）全覆盖 |
| R2 | DuckDB 陈旧度探测落地 + 数据新鲜度契约层「陈旧标记」字段惯例 | 13 原文核验 / 三引擎交叉 / 7 域名 |

调用方式：ctx_batch_execute(concurrency=1, timeout=600000)，同会话串行（per §4.2.3）。

### 2.2 关键数值锚点（官方来源）

| 系统 | 默认阈值/机制 | 出处 |
|---|---|---|
| DynamoDB | eventual consistent reads「usually reach consistency within a second」 | AWS docs HowItWorks.ReadConsistency |
| CockroachDB follower read | follower_read_timestamp() = statement_timestamp() - 4.2s | docs.cockroachlabs.com as-of-system-time |
| Marten | maxEventLag 默认 100 事件；staleThreshold 默认 30s；maxSameLagTime（同一滞后保持 N 秒才判坏） | martendb.io healthchecks |
| dbt source freshness | 无默认值；示例 warn_after 12h / error_after 24h；两级阈值；探测 SQL = max(loaded_at) vs now | docs.getdbt.com freshness |
| TimescaleDB | schedule_interval 默认 24h；refresh_lag 默认 = 2 x bucket_width | tigerdata.com refresh-policies |
| Confluent Cloud | 「Alert when lag exceeds a defined number of records or grows continuously for a sustained period」；emitter 默认关、采样 60000ms | docs.confluent.io monitor-lag |
| Prometheus | for: pending→firing（连续 N 次评估）；keep_firing_for: 防 flapping | prometheus.io alerting_rules |
| Sensu | occurrences == N 连续触发 | docs.sensu.io filters |
| Google SRE Workbook | burn-rate 多窗多烧尽率：2%/1h→14.4→page；5%/6h→6→page；10%/3d→1→ticket | sre.google/workbook/alerting-on-slos |

### 2.3 契约层「陈旧标记」字段惯例（官方字段名/枚举）

| 系统 | 字段名 | 枚举 |
|---|---|---|
| dbt sources.json | status（artifacts 页）/ state（命令页示例） | pass / warn / error（+ runtime error） |
| OpenLineage | DataQualityAssertionsDatasetFacet.assertion（含 freshness）/ TestRunFacet.status + severity | status: pass/fail/skip；severity: error/warn（正交） |
| DataHub | upsertDatasetFreshnessAssertionMonitor(...)；AssertionResultType | INIT / SUCCESS / FAILURE / ERROR |
| Great Expectations | ExpectColumnMaxToBeBetween / MinToBeBetween | success: true/false（布尔，无三级） |
| OpenTelemetry | 无官方 semconv；提案 data.staleness.*（Development，未采纳） | — |

### 2.4 对标结论（≥2 成熟方案）

1. 「默认值 + 两级阈值（warn/error）」是工业事实标准：dbt 用 warn_after/error_after，OpenLineage 用 status x severity 正交，DataHub 用三级结果 —— 本票取 warn/stale 两级 + unknown 降级态。
2. 「连续 N 周期 + 非对称迟滞」是告警去抖共识：Prometheus for:/keep_firing_for:、Sensu occurrences、Marten maxSameLagTime —— 本票取 warnN=errN=3 / clearN=6。
3. 「趋势告警」优于绝对阈值：Confluent 官方建议 monitor lag trends, not absolute values —— 本票 T3 为趋势触发。
4. DuckDB 核心无物化视图/时间旅行（roadmap 未落地），read model 版本对齐必须自建水位控制表（control.read_model_state.last_processed_version）—— 与 A-007 单写者语义一致。

## 3. 交付物

### 交付物 1 — SLA 默认值 + 调优指南

**默认 SLA = 5 秒（数字，非「尽快」）**。

- 可行性上界：A-007 最坏陈旧读链路 = 100ms 窗口 + 30ms 提交 + 512ms checkpoint ≈ **0.65s ≪ 5s**（余量 7.69x）。
- 两级阈值：warn = 5s（= SLA），error = 15s（= 3 x SLA），对齐 dbt warn/error 两级。
- 工业锚点区间：DynamoDB 1s ～ CockroachDB 4.2s ～ Marten 30s；5s 落在交互式与批处理之间。

**per-scale SLA（全数字）**：

| scale | 触发器 | sla_seconds | warn | error |
|---|---|---:|---:|---:|
| MICRO-A | 每次 push 或 hook | 2 | 2 | 6 |
| MICRO-B | 单文件查看或 LSP 调用 | 5 | 5 | 15 |
| MACRO-B | 周期或手动 | 15 | 15 | 45 |
| MACRO-C | 手动或版本发布节点 | 60 | 60 | 180 |
| MACRO-A | 季度或手动 | 300 | 300 | 900 |

**调优指南（G1-G5，每条含数字依据）**：

| id | 规则 | 数字依据 |
|---|---|---|
| G1 | 按触发器交互性定档 | sla_seconds ∈ {2,5,15,60,300} |
| G2 | 用 p95 而非 p50 定 SLA | percentile = 95 |
| G3 | 成本杠杆：收紧一档刷新频率约 x2.5；优先用 error budget | refresh_freq_multiplier ≈ 2.5 |
| G4 | 校准窗口 90 天（与 A-005 同源） | calibration_window_days = 90 |
| G5 | SLA 变更走 A-008 版本演进 | change_class ∈ {REVISION, MODEL} |

### 交付物 2 — 报警触发逻辑

**评估周期**：5s。**状态机**：fresh → warn → stale；unknown 为探测失败降级态。

| id | level | 条件 | 去抖 | 工业依据 |
|---|---|---|---|---|
| T1 | warn | lag > 5s | 连续 3 周期 | Prometheus for: / Sensu occurrences |
| T2 | stale | lag > 15s | 连续 3 周期 | dbt warn/error 两级 |
| T3 | warn | lag 在 60s 内单调非减且总增量 > 5s | 趋势窗口内 | Confluent「grows continuously for a sustained period」 |
| T4 | stale | read_model_version 在 30s 内不变 且 fact_watermark_version 递增 | 30s | Marten staleThreshold 30s |
| T5 | unknown | 探测 SQL 报错或返回空 | 立即（fail-closed） | A-012 防线失效降级 |

**清除（迟滞）**：连续 6 周期 lag ≤ 5s 才回 fresh（清除阈值 6 > 触发阈值 3，非对称，对齐 Prometheus keep_firing_for）。

**与 A-012 对齐**：A-012 §4 的 read_model_lag_seconds「> 5s 持续 3 周期 → critical」与本票 T1/T2 的 warn_consecutive_periods = 3 逐值一致；本票为该指标的完整策略 owner。

### 交付物 3 — 报告模板「陈旧数据标记」字段定义（与 D-006 对齐）

**对齐方式：版本化追加扩展（ADDITION）**，D-006 骨架 1.0.0 → 1.1.0，四章结构逐字不变（yield=1）。

**C1 执行摘要新增 5 字段**（与既有 11 字段并列，追加于数组末尾）：

| 字段 | 类型 | 必填 | 说明 |
|---|---|---|---|
| stale_data_marker | enum[fresh|warn|stale|unknown] | 必填 | 陈旧数据标记本体 |
| staleness_sla_seconds | number | 必填 | 本次生效 SLA（数字，秒） |
| read_model_lag_seconds | number | 必填 | 实测投影延迟（与 A-012 metric 同名） |
| read_model_version | integer | 必填 | read model 已投影到的 fact 版本 |
| fact_watermark_version | integer | 必填 | fact 表最新水位版本 |

**逐字复用 D-006 既有字段名（5 个）**：generated_at（C1，评估基准时刻）、degraded_mode（C1，stale/unknown 时置 true）、collected_at（C3，证据采集时刻）、grounded（C3，陈旧证据置 unverified）、verdict_gate_stamp（C4，受影响建议置 unverified）。

**语义映射**：

| marker | degraded_mode | C3 grounded | C4 verdict_gate_stamp | alert |
|---|---|---|---|---|
| fresh | false | 不受影响 | 不受影响 | none |
| warn | false | 可 unverified | 不受影响 | warn |
| stale | 必须 true | 必须 unverified | 必须 unverified | error |
| unknown | 必须 true | 必须 unverified | 必须 unverified | error（fail-closed） |

**探测 SQL（DuckDB 落地）**：
- fact 水位：SELECT MAX(version) AS fact_watermark_version, MAX(recorded_at) AS fact_watermark_at FROM fact;
- read model 版本：SELECT last_processed_version FROM control.read_model_state WHERE read_model_id = ?;
- lag：SELECT date_diff('second', (SELECT MAX(recorded_at) FROM fact), current_timestamp) AS read_model_lag_seconds;

## 4. 可机检证据

| 工件 | 结果 |
|---|---|
| reports/09-stale-check.mjs | **PASS（15 checks，EXIT=0）** —— SLA numeric / per-scale numeric / 可行性上界 < SLA / 调优指南含数字依据 / 报警量化 / A-012 对齐 / 5 字段逐字登记入 D-006 / 5 字段名逐字复用 / 四态语义映射 / 枚举域一致 / 版本化扩展声明 / ADR-0006 不变式 / 状态机 5/5 场景 / 探测 SQL |
| reports/14-skeleton-check.mjs | **无回归 PASS**（50 fields / 20 cells / 64 slice fields / 31 xrefs）—— 追加扩展未破坏 D-006 契约 |
| reports/09-stale-marker-fields.json | 10402 bytes / 284 行 / 重解析 OK |

## 5. 信息缺口（Sufficiency Gate）

1. per-scale SLA 数值为 expert/v1 推断（对齐 A-005 的 90 天校准窗口，expires 2026-12-10）；无真实仓试点数据。
2. 探测 SQL 未在本机 DuckDB 实机执行（语法依据官方文档）；date_diff 的精确签名建议 Phase 4 实机验证。
3. DuckDB 核心物化视图无版本承诺（discussion #3638 未结论）；本票不依赖核心 MV 能力，采用自建水位控制表。
4. D-006 骨架的 projected 格（10 格）本身无真实仓验证（A-014 缺口延续），本票新增字段为全 scale 共享，不加剧该缺口。
5. A-012 的 read_model_lag_seconds 与本票同名同义，但两票各自定义了阈值上下文；本票已声明为策略 owner，A-012 消费触发语义，无冲突。

## 6. 完成定义对照（per WORKFLOW §4.2.5）

### 6.1 专属验收 checklist

- [x] **SLA 必须是数字（不能「尽快」）** —— default_sla_seconds = 5（number）；守卫 sla-numeric PASS；per-scale 5 档全数字。
- [x] **字段定义必须与 D-006 报告模板字段名一致** —— 5 个新字段逐字登记入 14-skeleton-fields.json C1（守卫 marker-registered-in-D006 PASS）；5 个既有字段名逐字复用（守卫 reuse-D006-names PASS）；枚举域两侧一致（守卫 marker-enum PASS）。
- [x] **1) SLA 默认值 + 调优指南；2) 报警触发逻辑；3) 报告模板「陈旧数据标记」字段定义（与 D-006 对齐）** —— §3 交付物 1/2/3 齐备。

### 6.2 通用调研要求对照

| 要求 | 状态 | 证据 |
|---|---|---|
| 回顾 baseline（D-001 ~ D-007）+ 当前决策 + 目标仓库现状 | [x] | §0、§1.2、§1.3 |
| atomcode 深度调研（两轮串行） | [x] | §2.1：R1 22 searches/25 reads；R2 13 原文核验 |
| 回顾 docs/adr/ 相关 ADR（ADR-0005, ADR-0006） | [x] | §1.2、§1.3、§3 交付物 3 |
| 回顾 CONTEXT.md 心智模型术语 | [x] | Read Model / Failure Semantics / Adjudication Protocol / Sufficiency Gate |
| 对标工业界成熟方案 ≥2 | [x] | §2.4：dbt / Prometheus / Marten / DataHub / OpenLineage / Confluent / SRE |

### 6.3 阻塞

- **Blocked by: #08（已闭环）** —— 一次闭环。
- 本票解锁下游：**A-015**（scale 切片差异 —— 消费本票的陈旧标记字段）、**A-016**（渲染切分 —— 陈旧标记的渲染属样式层）。

## 7. lessons 候选

1. **反斜杠双层转义（JSON → 模板字面量）会静默吞掉正则转义**：本票首版 09-stale-check.mjs 中正则经 JSON 与模板字面量两层解转义后退化，直接 SyntaxError。规避法 = 彻底不用反斜杠（改用 fileURLToPath + String.fromCharCode(10)）。这是 W2 #02 教训的第二次重演，建议固化为默认做法：ctx_execute 写 .mjs 一律零反斜杠，写完立即 node --check + 实跑。
2. **对已闭环契约的扩展必须走「版本化追加」而非就地改写**：D-006 骨架 45 字段已锁定且 additionalProperties:false；本票以 ADDITION（1.0.0 → 1.1.0）追加 5 字段，四章结构与既有字段全部不动，原守卫脚本无回归。教训：跨票扩展他人契约时，先跑原守卫证明无回归，再声明变更类别（ADDITION/REVISION/MODEL）。
3. **同一 metric 在多票出现时，必须显式声明策略 owner**：read_model_lag_seconds 同时出现在 A-012（防线触发）与本票（SLA 策略）；若不声明 owner 会产生「两份阈值语义」。本票在工件内显式写入 alignment_with_A_012 并机检。

## 8. 引用文件列表

**本票读取（必读清单）**：
1. .scratch/architecture-recovery/issues/09-read-model-staleness.md
2. .scratch/architecture-recovery/handoffs/09-read-model-staleness.md
3. .scratch/architecture-recovery/spec.md（§Decision 5.3 + Coverage 表）
4. .scratch/architecture-recovery/WORKFLOW.md（§4.2.1 ~ §4.2.6）
5. .scratch/architecture-recovery/decision-ledger.md（A-009 行）
6. docs/adr/0005-hub-of-facts-with-federated-adjudication.md
7. docs/adr/0006-shared-skeleton-scale-slice.md

**本票产出**：
8. .scratch/architecture-recovery/reports/09-report.md（本文件）
9. .scratch/architecture-recovery/reports/09-stale-marker-fields.json
10. .scratch/architecture-recovery/reports/09-stale-check.mjs
11. .scratch/architecture-recovery/reports/14-skeleton-fields.json（版本化追加 1.0.0 → 1.1.0）
12. .scratch/architecture-recovery/decision-ledger.md（追加 A-009 结论落盘段 + A-009 状态 done）
13. .scratch/architecture-recovery/WORKFLOW.md（§4 Lessons 追加）
14. .scratch/architecture-recovery/issues/09-read-model-staleness.md（验收勾选）

**外部对标来源（官方一手）**：
15. dbt freshness — https://docs.getdbt.com/reference/resource-properties/freshness
16. Prometheus alerting rules — https://prometheus.io/docs/prometheus/latest/configuration/alerting_rules/
17. Marten async daemon healthchecks — https://martendb.io/events/projections/healthchecks.html
18. DataHub freshness assertions — https://docs.datahub.com/docs/managed-datahub/observe/freshness-assertions
19. OpenLineage Test Run Facet — https://openlineage.io/docs/spec/facets/run-facets/test_run/
20. Confluent Cloud consumer lag — https://docs.confluent.io/cloud/current/monitoring/monitor-lag.html
21. Google SRE Workbook Ch5 — https://sre.google/workbook/alerting-on-slos/
22. CockroachDB follower reads — https://docs.cockroachlabs.com/docs/stable/follower-reads
23. DuckDB Transactions — https://duckdb.org/docs/lts/sql/statements/transactions
24. AWS DynamoDB Read Consistency — https://docs.aws.amazon.com/amazondynamodb/latest/developerguide/HowItWorks.ReadConsistency.html
25. TimescaleDB refresh policies — https://tigerdata.com/docs/build/continuous-aggregates/refresh-policies/

## 9. 版本控制（per WORKFLOW §4.2.1）

| 项 | 值 |
|---|---|
| 分支 | fix/architecture-recovery-09 |
| 提交 | （提交后回填） |
| 提交范围 | reports/09-report.md + reports/09-stale-marker-fields.json + reports/09-stale-check.mjs + reports/14-skeleton-fields.json + decision-ledger.md + WORKFLOW.md + issues/09-read-model-staleness.md |

> 禁止命令遵守情况：不执行 git add / git commit / git push / git checkout / git merge / git rebase / git stash / git cherry-pick；所有版本控制写动作走 but CLI。
> 未推送声明：未经用户指示不 push —— 本票止于本地提交。

---

*Report generated: 2026-09-12 · A-009 · read model staleness · SLA 5s · 3-period debounce · stale_data_marker*
