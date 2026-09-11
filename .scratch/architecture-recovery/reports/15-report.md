# Report 15 — Scale 切片差异边界（A-015）

> 票：issues/15-scale-slice-boundaries.md · 启动器：prompts/15-scale-slice-boundaries.md · 决策：spec.md §Decision 6.2 · ledger：A-015 · ADR：docs/adr/0006-shared-skeleton-scale-slice.md
> Blocked by: #14 —— 已闭环（2026-09-12）。产物：本报告 + `15-slice-boundaries.json`（数据）+ `15-slice-boundaries.schema.json`（形式化 schema）+ `15-slice-check.mjs`（机检守卫）+ `15-atomcode-research.md`（调研原文）+ `15-research-prompt.md`（调研 prompt）。

## 开工复述（per 启动器「开工第一句」）

- **Blocked by: #14**（共享骨架，A-014）— 状态 closed，2026-09-12 闭环，产物 `reports/14-report.md` + `14-skeleton-fields.json` + `14-skeleton.schema.json` + `14-skeleton-check.mjs`（8 项全 PASS）。本票阻塞已解除。
- **必读清单（全部已读）**：`issues/15-scale-slice-boundaries.md`、`handoffs/15-scale-slice-boundaries.md`、`spec.md` §Decision 6.2、`WORKFLOW.md` §4.2（4.2.1 版本控制 / 4.2.2 文件写入 / 4.2.3 调研 / 4.2.4 决策账本 / 4.2.5 报告）、`decision-ledger.md` A-015、`docs/adr/0006-shared-skeleton-scale-slice.md`。
- **另读**：`docs/adr/0001`（5 scale 定义与触发器）、`docs/adr/0005`（事实唯一）、`reports/14-report.md` 全文（45 骨架字段 + 64 交集字段）、`CONTEXT.md`（38 术语，Trigger Sequence / Scale Slice / Evidence Gate / Degraded Demonstration）。
- **版本控制**：全程遵循 WORKFLOW §4.2.1 —— 所有分支与提交走 `but` CLI，本会话独立分支，禁用 `git add / commit / push / checkout / merge / rebase / stash / cherry-pick`。

## 完成定义清单（逐项）

- [x] **每切片 ≥5 列描述** — 机检 A1：`5 slices, min populated columns per slice = 7 (>=5)`。实际共 8 列，其中 5 列为 spec §Decision 6.2 强制（触发器 / 输入 / 输出粒度 / 引文密度 / verdict-gate 印记位置），另 3 列为本票扩展（时间跨度 / 降级形态 / 切片命名空间）。
- [x] **必须显式列出 Macro-A 与 Micro-A 的边界差异** — 机检 A3：`extreme case dims = 10 (>=5), all macro_a != micro_a = true, machine_checkable = true`。10 个维度全部两端取值互斥，另有可机检边界断言（Deliverable 2）。
- [x] **三项交付齐备** — 1) 5 scale 切片差异表（Deliverable 1）；2) Macro-A vs Micro-A 极端差异案例（Deliverable 2）；3) 切片字段与骨架共享字段不冲突（Deliverable 3，机检 A4 冲突数 = 0、A5 跨 scale 复用 = 0）。

**机检证据**：`node 15-slice-check.mjs` → `PASS: 13/13 assertions — 5 slices x 8 columns, 10 extreme dims, 64 slice fields, 0 collisions, 0 cross-scale reuse`，退出码 0。
**形式化证据**：`15-slice-boundaries.json` 对 `15-slice-boundaries.schema.json`（JSON Schema 2020-12）经 ajv 校验 `valid = true`。

## Deliverable 1 — 5 scale 切片差异表（8 列 ≥ 5 列要求）

### 表 1-0 列定义（8 列）

| 列 | 是否 spec 强制 | 锁定依据 | 工业对标 | 先例性质 |
|---|---|---|---|---|
| 触发器 | 是（§6.2） | CONTEXT.md Trigger Sequence / ADR-0001 | IEEE 829 suspension / resumption criteria | 有直接先例（文档族层级）/ 字段级类比 |
| 输入 | 是（§6.2） | ADR-0001 数据源 / ADR-0005 证据层 | IEEE 829 Level Test Plan scope / approach；SSDF 四元素 | 有直接先例 |
| 输出粒度 | 是（§6.2） | ADR-0001 / CONTEXT.md Macro vs Micro Audit | SARIF result 行级对象 vs arc42 12 节叙事 | 组合式创新（两端各有直接先例） |
| 引文密度 | 是（§6.2） | CONTEXT.md Evidence Gate / ADR-0006 grounded | SARIF physicalLocation.region；GitHub properties.precision | 有直接先例 |
| verdict-gate 印记位置 | 是（§6.2） | ADR-0006 三印记 / A-014 C2 C3 C4 | SARIF kind × level 双轴；GitHub 告警→PR check | 有直接先例 |
| 时间跨度 | 本票扩展 | A-015 | IEEE 829 完整性级别；SARIF baselineState 跨 run | 有直接先例（baselineState）/ 类比（时间窗） |
| 降级形态 | 本票扩展 | A-018 / CONTEXT.md Failure Semantics | GitHub 容量上限截断；SARIF baselineState 状态标记 | 有直接先例 |
| 切片命名空间 | 本票扩展 | A-015 + ADR-0006 禁止跨 scale 引用 | OTel 保留前缀与前缀借用禁令；JSON Schema 组合闭包 | 有直接先例 |

### 表 1-1 spec §Decision 6.2 强制 5 列

| scale | 触发器 | 输入 | 输出粒度 | 引文密度 | verdict-gate 印记位置 |
|---|---|---|---|---|---|
| **Macro-A** 跨仓战略 | 季度周期 / 手动（组合变更或季度复盘） | 自研战略 rubric（S1-S5 跨仓口径）、跨仓依赖图、portfolio 聚合 read model、Scorecard 跨仓聚合 | 跨仓叙事报告（portfolio 级，不出行级；需行/模块证据须下钻 Macro-B / Micro-A） | ≥3 条/结论 · repo@sha（仓级） | C2 `verdict_gate`（组合级；strategy native，余三象限 projected）+ C4 `verdict_gate_stamp` |
| **Macro-B** 仓库级 4 象限 | 周期（默认 30d）/ 手动 | CodeLore 仓库事实、Scorecard、repomix、docs/adr 全量结构扫描（S2） | 四象限叙事报告（module / file 级；5 档中唯一四象限全 native） | ≥2 条/结论 · module / file 级 | C2 `verdict_gate`（四象限全 native）+ C4 `verdict_gate_stamp` |
| **Macro-C** 演化考古 | 手动 或 版本发布节点（tag / release） | CodeLore 历史分析、corpus 校准、ADR supersede 链与假设段、Scorecard 时间序列 | 演化对比报告（时间窗 delta；禁止以单点值充当演化结论） | ≥2 条/结论 · commit sha / 时间窗 | C2 `verdict_gate`（趋势裁决；strategy native，余 projected） |
| **Micro-A** PR diff | 每次 push / PR hook（事件驱动，同步进 CI） | CodeLore `diff --llm`、Receipt Gate、PR 元数据、manifest 扫描 | 行级带引文评审（file:line；每条结论必须可点回具体 diff 行） | ≥1 条/结论 · file:line（行级强制） | C2 `verdict_gate`（行级裁决）+ C3 `grounded`（每条证据盖章）+ C4 `verdict_gate_stamp` |
| **Micro-B** 文件级 | 单文件查看 / LSP 调用（按需，非周期） | CodeLore file facts、局部叙事、manifest 扫描（仅命中时） | 单文件质量卡（file 级，行级可选；advisory 形态） | ≥1 条/结论 · file 级（行级可选） | **不进入裁决路径**：C2 `decision` 恒 insufficient、`verdict` 恒 null；C4 `verdict_gate_stamp` 恒 unverified 并必带标记 |

### 表 1-2 本票扩展 3 列

| scale | 时间跨度 | 降级形态（A-018） | 切片命名空间 | 切片字段数 | 阻断 |
|---|---|---|---|---|---|
| Macro-A | 90d 滚动窗口 | FP-1：缺仓 → GapRequest 补查轮，产物仍为完整 4 章 | `quadrants[].slice_fields` | 13 | 否 |
| Macro-B | 30d 滚动窗口 | FP-2（Demo v1 文档可读） | `quadrants[].slice_fields` | 14 | 否 |
| Macro-C | 12m 对比窗口（基期 vs 现期） | FP-3（Demo v1 文档可读） | `quadrants[].slice_fields` | 12 | 否 |
| Micro-A | 单次提交（单 commit / 单 PR） | FP-4：happy 3/3 带引文 vs failure 0/3，共享骨架不变 | `quadrants[].slice_fields` | 13 | **是（可阻断 PR 合并）** |
| Micro-B | 单文件快照（当前工作树状态） | FP-5（Demo v1 文档可读） | `quadrants[].slice_fields` | 12 | 否 |

> 切片字段数由机检 A10 与 A-014 的 20 格数据逐一对账（13 / 14 / 12 / 13 / 12 = 64 项，60 唯一）。

## Deliverable 2 — Macro-A vs Micro-A 极端差异案例

**同一个事实、同一 correlation_key、同一 4 章骨架，在两端被投影为完全不同的表达形态**——这是 5 档粒度谱的两个端点。

**共享事实**：commit `a1b2c3d4e5f60718293a4b5c6d7e8f9012345678` / PR #1234 / `repo-x@sha` / portfolio-P（N=7 仓）；关联键为 A-010 的 trace_id / baggage_id（32 字符）。

| # | 维度 | Macro-A（跨仓叙事） | Micro-A（行级评审） |
|---|---|---|---|
| 1 | 审计对象主体 | portfolio 组合（7 个仓） | 单次 PR diff（3 files / 47 LOC） |
| 2 | 输出粒度 | 跨仓叙事段，结论聚合到组合级 | 行级评审条目，定位到 file:line |
| 3 | 引文定位精度 | repo@sha（仓级） | file:line（行级，强制） |
| 4 | 引文密度 | 每条结论 ≥3 条证据 | 每条结论 ≥1 条且必须为行级 |
| 5 | 裁决进入方式 | 组合级裁决（strategy native），不阻断任何提交 | 行级裁决，可阻断 PR 合并 |
| 6 | 时间跨度 | 90d 滚动窗口 | 单次提交 |
| 7 | 触发器 | 季度周期 / 手动 | 每次 push / PR hook |
| 8 | 降级形态 | FP-1：缺仓 → GapRequest 补查轮，产物仍为完整 4 章 | FP-4：引文采集 0/3，证据章非空但 grounded=unverified |
| 9 | 典型证据条量级 | 数十条（跨仓聚合） | 个位数（单 diff） |
| 10 | 关联方式 | 写入同一 correlation_key，可被 Micro-A 记录对齐回溯 | 写入同一 correlation_key，可被 Macro-A 组合视图上卷 |

**可机检边界断言（per 调研 §四·问题 2）**：当且仅当满足「输出粒度 = 叙事 ∧ 引文定位精度 ≤ 仓级 ∧ 裁决锚点在组合/执行摘要级」时判为 Macro-A 形态；满足「输出粒度 = 行级 ∧ 引文定位精度 ≥ 行级 ∧ PR 门禁 = true」时判为 Micro-A 形态。本票以 A-014 已有字段落地为 `output_granularity` 语义 + `citation_density.locator_precision` + `blocking` 三元组，不新增字段。

**无直接先例项（必须显式声明）**：单一 schema 内同时声明上述两组约束并允许中间 3 档连续过渡（Macro-B / Macro-C / Micro-B），在 SARIF（只有行级端）、arc42（只有叙事端）、IEEE 829（文档族而非字段谱）中**均无先例**，属本票的组合式设计；风险点在中间 3 档的字段组合是否存在空档（见信息缺口）。

## Deliverable 3 — 切片字段与骨架共享字段的冲突契约

**裁定原则**：骨架字段占据根命名空间（无前缀，是契约）；切片字段以 `quadrants[].slice_fields` 嵌套为命名空间载体；两者不得同名、不得跨 scale 复用、不得借用彼此前缀。

| 规则 | 名称 | 内容 | 机检 |
|---|---|---|---|
| R1 | 嵌套隔离 | 切片字段只能出现在 `quadrants[].slice_fields` 命名空间内，不得提升到骨架顶层字段集合 | A1 / A4 |
| R2 | 同名禁止 | 切片字段名集合（60 唯一）与骨架字段名集合（44 唯一）交集必须为空 | A4 |
| R3 | 跨 scale 隔离 | 任意两个不同 scale 的切片字段名集合交集必须为空（ADR-0006 禁止跨 scale 引用） | A5 |
| R4 | 事实唯一 | 同 scale 内跨象限复用同一 metric 时必须带 `origin` 引用，禁止复制定义（ADR-0005） | A6 |
| R5 | 印记白名单 | verdict-gate 印记位置只能取自 A-014 锁定的三印记：C2 `verdict_gate` / C3 `grounded` / C4 `verdict_gate_stamp` | A7 |
| R6 | 无占位符 | 描述性载荷不得含占位词 | A9 |
| R7 | 前缀借用禁令 | 切片字段不得借用骨架字段名作为自己的前缀（OTel 语义约定命名规范模式）；当前以嵌套为命名空间载体，故**不引入** `scale_<s>.` 前缀，以免与 A-014 已锁定的 60 个切片字段名冲突 | A4 / A5 |

**当前冲突检测结果（对 A-014 真实数据实跑）**：切片 vs 骨架同名冲突 **0**；跨 scale 复用 **0**；缺 origin 的切片字段 **0**。

**已知同 scale 内跨象限复用（合法，只引用不复制）**：

| 字段 | scale | 象限 | origin | 处置 |
|---|---|---|---|---|
| `duplicate_abstraction_clusters` | Macro-A | structure + strategy | A-005 / ADR-0001 | 只引用不复制 |
| `single_impl_abstraction_ratio` | Macro-B | structure + strategy | A-005 | 只引用不复制 |
| `dependency_violation_ratio` | Macro-B | structure + strategy | A-005 | 只引用不复制 |
| `file_loc` | Micro-B | structure + strategy | CodeLore file facts | 只引用不复制 |

**为什么不采用 OTel 式 `scale_<s>.` 前缀**：调研推荐「无前缀共享骨架 + 带前缀切片字段」为首选组合，但 A-014 已锁定 60 个切片字段名且全部无前缀；引入前缀会与已锁字段集冲突并破坏 31 处 `A-005` 字段级引用。因此本票采用**嵌套命名空间**实现等价隔离（R1 + R7），并把 OTel 的「前缀借用禁令」作为独立规则保留——一旦某字段被提升出 `slice_fields` 即视为违规。

## 调研摘要（atomcode 深度调研，per WORKFLOW §4.2.3）

**carrier**：atomcode 无头模式，2026-09-12，13 查询 / 4 角度（Official / Criticism / Community / Currency）/ 10 次全文核验 / 9 个独立域名；关键结论均 ≥2 独立信源交叉验证。Confidence：高。

| 对标对象 | 固定什么（共享契约） | 自由什么（扩展/切片） | 对本票印证 | 先例性质 |
|---|---|---|---|---|
| **SARIF 2.1.0**（OASIS，Errata01 2023-08） | `result.message` 唯一 required；`kind` × `level` 双轴正交；`physicalLocation.region`（startLine/startColumn）定位模型 | `properties` 扩展袋（§3.8）承载工具私有字段 | 直接支撑引文密度、印记位置、命名空间扩展点 | **有直接先例** |
| **GitHub code scanning SARIF 摄取** | 支持字段**白名单**（白名单外被忽略）；`level` 只认 note/warning/error；PR 展示条件（告警所有行必须在 diff 内） | 工具可上传任意合法 SARIF | 支撑「裁决进入方式 = PR 门禁 + 行级约束」与降级截断 | **有直接先例** |
| **IEEE 829-2008**（已被 ISO/IEC/IEEE 29119 取代） | 文档形式与大纲（Master Test Plan / Level Test Plan / Level Test Report 族）；完整性级别决定文档广度与深度 | 不规定必须产出哪些文档、不绑方法论 | 支撑 trigger / input 两列与「文档深度随级别变」 | **有直接先例**（字段级类比） |
| **OpenTelemetry 语义约定命名规范** | 点分命名空间；`otel.*` 保留前缀须规范批准；名称复用禁止、改名须弃用 | 公司级用反向域名前缀；**不允许借已有规范命名空间当自己的前缀** | 支撑 R7 前缀借用禁令 | **有直接先例** |
| **JSON Schema 2020-12** | `properties` / `required` 声明契约字段；`unevaluatedProperties:false` 在组合根做闭包 | 默认开放世界；`patternProperties` 前缀白名单 | 支撑「基础 schema + 扩展 schema + 组合根闭合」 | **有直接先例** |
| **NIST SSDF SP 800-218** | 每条 practice 固定四元素：Practice / Task / Example / Reference | 采用哪些 practice 与投入可裁剪 | 支撑切片字段 = 固定骨架 + 证据引用 | 先例（结构）/ 类比（内容） |
| **Trail of Bits 报告解剖** | 8 部分固定骨架；每 finding 必带 exploit scenario 与定位 | severity × difficulty 独立打分（双轴正交） | 支撑执行摘要级聚合裁决与证据密度 | **有直接先例** |
| **arc42** | 12 节固定结构，每节有明确目的 | 每节内容可裁剪（tailorable） | 叙事端（Macro-A）输出形态类比 | **类比**（仅输出形态） |
| **SARIF Can't Save You Now（批评）** | — | — | 共享格式 ≠ 免处理；「SARIF 是总线不是仪表盘」= 联邦裁决层存在理由 | 批判性佐证（非先例） |

**调研结论**：① 5 类差异字段（trigger / input / output / citation / verdict-gate）有充分工业界直接先例，本票设计非自创；② 极端差异可用 4 个可机检维度刻画，并各有 SARIF / GitHub 直接对应物；③ 命名空间隔离有 4 种成熟做法（OTel 保留前缀 / 反向域名 / SARIF properties 袋 / JSON Schema 组合闭包），本票采用「嵌套命名空间 + 前缀借用禁令 + 消费端白名单」组合；④ **未发现**「单一格式横跨 5 档连续谱」的成品先例，属组合式创新。

**采纳**：SARIF kind × level 双轴心智（本票以 A-014 `applicability` 状态轴 + `blocking` 门禁轴落地，不新增 `verdict_gate.severity` 分桶）；OTel 前缀借用禁令（R7）；GitHub 消费端白名单（白名单外字段不投影而非报错）。

**推迟**：`verdict_gate.severity` 严重度分桶（社区对 CVSS 桶边界存在真实分歧，本票不代裁，留给后续票并须独立成文记录分桶依据）；SARIF 2.2 的 `precision` 原生字段（2.2 未发布 OASIS 标准稿，本票用 `citation_density.locator_precision` 自建，待 2.2 发布后迁移）；中间 3 档字段组合空档验证。

## 信息缺口（Sufficiency Gate）

- **OpenSSF Scorecard JSON v2 一手 schema 未获取**（github 429 / ossf.github.io 404），其 check 字段细节仅靠 Sonar 与 Marketplace 摘要佐证 —— 影响供应链象限在 Micro 粒度的信号强度判据。
- **IEEE 829-2008 正文为付费墙**，引用止于文档族层级与完整性级别原则，未下钻到字段级大纲。
- **SARIF 2.2 规范正文未整读**（`precision` / `security-severity` 提案已进入编辑修订但未发布）。
- **中间 3 档（Macro-B / Macro-C / Micro-B）的字段组合是否存在空档未做样例验证** —— 本票只锁「两端 + 5 档列定义」，未对中间档构造真实报告实例；这与 #14 遗留的「projected 格字段无真实仓验证」是同一缺口，需试点语料。
- **切片字段的取值语义未锁**：本票锁列定义与命名空间，未锁单位、精度与容差（引自 A-005 的字段除外，其阈值语义沿用 A-005）。

## 阻塞

- **无**。Blocked by #14 已闭环（A-014 done）。
- 本票解锁下游：**A-016**（渲染样式与模板结构切分——消费本票 Deliverable 1 的「spec 锁结构不锁措辞」边界与 Deliverable 3 的命名空间契约）。

## lessons 候选

1. **占位词守卫必须限定作用域**：首版 `15-slice-check.mjs` 把「占位」作为占位词扫描整个 JSON，结果被 `namespace_contract.rules` 中 R6 规则文本（`占位词禁止`）自身命中，产生 1 条误报导致 12/13 FAIL。修复方式是只扫描述性载荷（`difference_columns / slices / extreme_case`），把规则文本排除。**教训**：「禁止 X」类守卫在扫描「描述禁止 X 的规则」时必然自指，守卫的作用域必须与语义层次对齐，不能图省事扫全文。
2. **命名空间隔离选型必须回头看已锁契约**：调研给出 4 种成熟做法并推荐 OTel 式 `scale_<s>.` 前缀，但 A-014 已锁定 60 个无前缀切片字段名与 31 处 `A-005` 字段级引用——照搬推荐会与已锁契约冲突。改以 `quadrants[].slice_fields` 嵌套实现等价隔离，并把 OTel 的「前缀借用禁令」作为独立规则保留。**教训**：调研结论是输入不是结论，采纳前必须先与已锁契约做一次冲突对账。
3. **ESM 不吃 NODE_PATH**：本窗口装了 ajv 后 `import ... from 'ajv/dist/2020.js'` 报 `ERR_MODULE_NOT_FOUND`（NODE_PATH 只对 CJS 生效），改用 `file:///` 绝对路径才通过。守卫脚本因此保持零依赖可复现，schema 校验作为一次性证据单独跑。**教训**：一次性校验依赖不要写进常驻守卫，否则守卫的可复现性依赖本机 node_modules。

## 引用文件列表

- 必读：`issues/15-scale-slice-boundaries.md`、`handoffs/15-scale-slice-boundaries.md`、`prompts/15-scale-slice-boundaries.md`、`spec.md` §Decision 6.2、`WORKFLOW.md` §4.2、`decision-ledger.md` A-015、`docs/adr/0006-shared-skeleton-scale-slice.md`
- 另参照：`docs/adr/0001-five-scale-scope.md`、`docs/adr/0005-hub-of-facts-with-federated-adjudication.md`、`CONTEXT.md`（Trigger Sequence / Scale Slice / Evidence Gate / Failure Semantics / Degraded Demonstration / Micro Audit / Macro Audit）
- 上游依赖：`reports/14-report.md`、`reports/14-skeleton-fields.json`（45 骨架字段 + 20 格 64 交集字段）、`reports/14-skeleton.schema.json`、`reports/14-skeleton-check.mjs`、`reports/05-unit-matrix.json`
- 本票产物：`reports/15-report.md`（本文件）、`reports/15-slice-boundaries.json`、`reports/15-slice-boundaries.schema.json`、`reports/15-slice-check.mjs`、`reports/15-research-prompt.md`、`reports/15-atomcode-research.md`
- 调研一手来源：SARIF v2.1.0 https://sarif.info/ ｜ SARIF result 属性表 https://sarif.info/Result/ ｜ OTel 语义约定命名规范 https://opentelemetry.io/docs/specs/semconv/general/naming/ ｜ Trail of Bits 报告解剖 https://trailofbits.com/anatomy-of-a-report/ ｜ GitHub code scanning SARIF 支持 https://docs.github.com/en/code-security/reference/code-scanning/sarif-files/sarif-support ｜ IEEE 829-2008 https://standards.ieee.org/ieee/829/3787/ ｜ NIST SSDF SP 800-218 https://csrc.nist.gov/projects/ssdf ｜ arc42 https://arc42.org/overview/ ｜ SARIF 批评 https://boostsecurity.io/blog/sarif-cant-save-you-now
