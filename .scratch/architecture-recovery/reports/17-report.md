# Report: A-017 — 10 路径成本 / 价值权衡

- **A-xxx:** A-017
- **Decision:** `spec.md` §Decision 7.1
- **ADR ref:** `docs/adr/0007-ten-demo-paths.md`
- **对应 issue:** `issues/17-path-cost-value.md`
- **对应 handoff:** `handoffs/17-path-cost-value.md`
- **Report date:** 2026-09-11
- **Verdict:** 10 条路径中 **6 条做“可点演示”**、4 条做“文档可读”。量化规则为：5 个 scale 的 happy path 只要单条 clickable 成本 ≤ 5 agent-days 必选；failure path 只有在 `RiskImpact >= 4` 且 `FailureROI = (RiskImpact + GateClarity + FixtureSimplicity) / CostDays >= 5.0` 时升级为可点。按此规则选中 5 条 happy path + `Micro-A failure`，总 clickable 预算 **18.5 agent-days**。

---

## 0. 开工复述（per 本票「开工第一句」硬要求）

**Blocked by: None**（can start immediately）——本票无上游阻塞，本窗口直接开工。

**必读清单全部路径 + 阅读状态：**

| # | 路径 | 状态 |
|---|---|---|
| 1 | `.scratch/architecture-recovery/issues/17-path-cost-value.md` | 已读全文 |
| 2 | `.scratch/architecture-recovery/handoffs/17-path-cost-value.md` | 已读全文 |
| 3 | `.scratch/architecture-recovery/spec.md` §Decision 7.1 | 已读 |
| 4 | `.scratch/architecture-recovery/WORKFLOW.md` §4.2 | 已读（§4.2.1 版本控制、§4.2.2 文件写入、§4.2.3 调研、§4.2.4 决策账本、§4.2.5 报告） |
| 5 | `.scratch/architecture-recovery/decision-ledger.md` A-017 | 已读 |
| 6 | `docs/adr/0007-ten-demo-paths.md` | 已读全文（Status: accepted） |
| 附 | `CONTEXT.md` 相关术语 | 已读：Scale / Happy Path / Failure Path / Degraded Demonstration / Verdict Gate / Report Template |

> 工具说明：本窗口未暴露 `ctx_*` / `ctx_batch_execute`，无法按 WORKFLOW §4.2.3 的指定 carrier 运行 atomcode；已按用户 `/goal` fallback 完成内置文件读取。外部对标改用官方文档直读；`agent-reach` Exa 后端未配置（`mcporter` 返回 unknown MCP server），未把其失败伪装为 atomcode 调研。

---

## 1. 量化决策规则（不能“看情况”）

### 1.1 固定预算与选择阈值

- Demo v1 clickable 总预算上限：**21 agent-days**。
- 单条 clickable 成本上限：**5 agent-days**；超过即降为文档，除非另开专项票。
- 5 个 scale 的 happy path 是 ADR-0001 / ADR-0002 / ADR-0007 的最小完整性证明：只要单条成本 ≤ 5 agent-days，**必须可点**。
- Failure path 采用增量选择，不平均铺开；只有满足以下两个条件才可点：
  - `RiskImpact >= 4`
  - `FailureROI = (RiskImpact + GateClarity + FixtureSimplicity) / CostDays >= 5.0`

评分含义：

| 指标 | 取值 | 含义 |
|---|---:|---|
| `RiskImpact` | 1-5 | 失败对用户理解裁决可信度的影响 |
| `GateClarity` | 1-5 | 是否能明确展示 evidence / sufficiency / verdict gate 的拒绝印记 |
| `FixtureSimplicity` | 1-5 | 是否能用小 fixture 稳定复现，不依赖外部系统 |
| `CostDays` | 数值 | agent-days，含 fixture、脚本、最小 UI/CLI 可点入口、报告产物 |

### 1.2 工业对标摘要

| 对标对象 | 本票吸收点 |
|---|---|
| ISTQB risk-based testing | 有限预算应按风险与价值排序，优先覆盖高价值 / 高影响路径，而不是平均覆盖所有路径。 |
| Cucumber / BDD living documentation | 未做 clickable 的路径必须仍能以业务可读、声明式、具体例子的文档形式存在，避免退化为 UI 操作脚本。 |
| OpenTelemetry Demo | 可点演示应围绕可运行服务、可观测信号和预设故障场景；不是所有故障都要真实复杂系统复现。 |
| Google SRE Monitoring | failure path 应优先选择用户可见、可操作、低噪声的症状；不把内部“看起来异常”当演示主路径。 |

---

## 2. 10 路径决策表

| # | 路径名 | 可点 or 文档 | 理由 | 估计成本 |
|---:|---|---|---|---:|
| 1 | Macro-A happy：跨仓战略对齐审计 | **可点** | 5 scale 全覆盖的最高层入口；用 2-3 个 fixture repo 展示 S1-S5 战略叙事和统一报告骨架，证明产品不是单仓扫描器。 | 3.5 agent-days |
| 2 | Macro-A failure：跨仓证据不足 / portfolio 缺事实 | **文档** | failure 语义重要，但可点会依赖多仓缺失矩阵与补查轮；A-018 需要明文触发/降级即可，v1 不必真实复现所有跨仓缺口。 | 1.5 agent-days |
| 3 | Macro-B happy：单仓 4 象限审计 | **可点** | 核心销售/解释路径；复用 CodeLore + OpenSSF + S1-S5 矩阵，能展示共享骨架与四象限裁决。 | 4.0 agent-days |
| 4 | Macro-B failure：仓库级证据门拒绝 / 引文缺失 | **文档** | 与 Micro-A failure 同属 verdict/evidence 拒绝语义，增量价值低于成本；用文档规定报告中 `⚠ contains uncited claims` 即可。 | 2.5 agent-days |
| 5 | Macro-C happy：演化考古 / ADR drift 审计 | **可点** | 5 scale 中唯一时间维度；用固定 git/ADR fixture 展示“现在好不好”之外的演化方向，补齐战略 quadrant 的 S4 主战场。 | 4.5 agent-days |
| 6 | Macro-C failure：历史或 ADR 时间戳不足 | **文档** | 失败条件依赖真实历史质量；可点 fixture 容易变成造假历史。文档明示 `data doesn't show`、补查请求和报告形态更稳。 | 1.5 agent-days |
| 7 | Micro-A happy：PR diff 行级审计 + verdict-gate | **可点** | 用户最容易理解的即时价值；可用单个 PR fixture 展示行级引文、Receipt Gate、verdict-gate 印记。 | 3.0 agent-days |
| 8 | Micro-A failure：PR 结论无引文被 verdict-gate 拒绝 | **可点** | failure 最高 ROI：风险影响 5、gate 清晰度 5、fixture 简单度 5、成本 2.0，`FailureROI = 7.5`；最小成本展示“不是概率性评论机器人”。 | 2.0 agent-days |
| 9 | Micro-B happy：单文件质量卡 | **可点** | 最便宜的 scale 入口；能作为 IDE/LSP 场景快速演示 file facts、局部叙事和 advisory 输出。 | 1.5 agent-days |
| 10 | Micro-B failure：文件过大 / 解析失败 / 局部证据不足 | **文档** | 风险影响低（advisory，不进入主裁决路径）；即使 fixture 简单，也不应挤占 failure 演示预算。 | 1.0 agent-days |

**汇总：**

| 类别 | 路径数 | 成本合计 |
|---|---:|---:|
| 可点演示 | 6 | 18.5 agent-days |
| 文档可读 | 4 | 6.5 agent-days |
| 10 路径全量定义 | 10 | 25.0 agent-days |

---

## 3. 至少 5 条路径选“可点”的论证

### 3.1 为什么 5 条 happy path 必须可点

ADR-0007 要求 5 scale 每 scale 一条 happy path + 一条 failure path；ADR-0001/0002 又要求 5 scale 全覆盖、禁止 MVP slice。因此 v1 clickable 的最低完整性不是“挑最容易的 5 条”，而是：

1. `Macro-A happy` 可点：证明跨仓战略审计存在，不把产品缩成单仓工具。
2. `Macro-B happy` 可点：证明 4 象限报告是核心载体。
3. `Macro-C happy` 可点：证明时间维度/演化考古存在，不把 S4 降成静态检查。
4. `Micro-A happy` 可点：证明 PR diff 行级审计与 verdict-gate 可落地。
5. `Micro-B happy` 可点：证明单文件 IDE/LSP 场景可落地，且成本最低。

这 5 条 happy path 成本合计 **16.5 agent-days**，低于 21 agent-days 上限，且每条单独成本均 ≤ 5 agent-days；按规则必须全部可点。

### 3.2 为什么额外选择 `Micro-A failure` 可点

`Micro-A failure` 是唯一同时满足 failure path 硬阈值、且不与更低成本/更高用户可见路径重复的路径：

| Failure path | RiskImpact | GateClarity | FixtureSimplicity | CostDays | FailureROI | 结论 |
|---|---:|---:|---:|---:|---:|---|
| Macro-A failure | 3 | 4 | 2 | 1.5 | 6.0 | 文档：RiskImpact < 4 |
| Macro-B failure | 4 | 5 | 3 | 2.5 | 4.8 | 文档：未达到 FailureROI >= 5.0，保留给 A-018 明文 |
| Macro-C failure | 3 | 4 | 2 | 1.5 | 6.0 | 文档：RiskImpact < 4 |
| **Micro-A failure** | **5** | **5** | **5** | **2.0** | **7.5** | **可点** |
| Micro-B failure | 2 | 3 | 4 | 1.0 | 9.0 | 文档：RiskImpact < 4 |

`Macro-B failure` 的 `RiskImpact = 4` 但 `FailureROI = 4.8`，未过 `>= 5.0` 硬阈值；且它与 `Micro-A failure` 都展示 evidence/verdict 拒绝。tie-break 规则是：同一 gate 语义只保留 **成本更低、反馈更即时、用户可见性更高** 的路径可点；因此选 `Micro-A failure`。

### 3.3 文档路径不是“以后再说”

4 条文档路径必须在 A-018 中继续明文：触发条件 / 降级模式 / verdict-gate 拒绝印记 / 报告产物形态。本文档只决定它们 v1 不做真实点击复现；不取消 failure semantics，也不允许报告沉默失败。

---

## 4. 完成定义清单逐项

| 完成定义 | 状态 | 证据 |
|---|---|---|
| 决策必须可量化（不能“看情况”） | [x] | §1 给出预算、阈值、公式；§2 每条路径给出成本。 |
| 至少 5 路径选“可点”以确保演示完整性 | [x] | §2 选中 6 条；§3 解释 5 happy + 1 failure。 |
| 10 路径决策表（路径名 / 可点 or 文档 / 理由 / 估计成本） | [x] | §2 10 行表格。 |
| 至少 5 路径选“可点”的论证 | [x] | §3.1 / §3.2。 |

---

## 5. 阻塞

- Blocked by: **None**。
- 下游：A-018 可直接承接本报告 §2 的“文档路径”与 `Micro-A failure` 可点决策，继续展开 5 条 failure path 的触发、降级、verdict-gate 印记、报告产物。

---

## 6. Lessons 候选

- `ctx_*` / `ctx_batch_execute` 未暴露时，启动器的“ctx 优先”必须按用户 `/goal` fallback 处理：内置读取/写入可完成目标，但报告必须显式标明 carrier 缺口。
- `agent-reach` Exa 后端未配置时，不应把搜索失败当作调研成功；应改读官方一手文档并在报告中记录缺口。

---

## 7. 引用文件列表

### 仓库内

- `.scratch/architecture-recovery/issues/17-path-cost-value.md`
- `.scratch/architecture-recovery/handoffs/17-path-cost-value.md`
- `.scratch/architecture-recovery/spec.md` §Decision 7.1
- `.scratch/architecture-recovery/WORKFLOW.md` §4.2
- `.scratch/architecture-recovery/decision-ledger.md` A-017
- `docs/adr/0001-five-scale-scope.md`
- `docs/adr/0002-no-mvp-slice.md`
- `docs/adr/0003-boundary-product-and-usage.md`
- `docs/adr/0004-strategic-quadrant-five-dims.md`
- `docs/adr/0005-hub-of-facts-with-federated-adjudication.md`
- `docs/adr/0006-shared-skeleton-scale-slice.md`
- `docs/adr/0007-ten-demo-paths.md`
- `CONTEXT.md`

### 外部官方/一手文档直读

- ISTQB Glossary — Risk-based testing: `https://glossary.istqb.org/en_US/term/risk-based-testing`
- Cucumber Documentation — Writing better Gherkin: `https://cucumber.io/docs/bdd/better-gherkin/`
- OpenTelemetry Demo Docs: `https://opentelemetry.io/docs/demo/`
- Google SRE Book — Monitoring Distributed Systems: `https://sre.google/sre-book/monitoring-distributed-systems/`
