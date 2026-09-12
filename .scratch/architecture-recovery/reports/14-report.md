# Report 14 — 报告模板共享骨架（A-014）

> 票：issues/14-shared-skeleton-design.md · 启动器：prompts/14-shared-skeleton-design.md · 决策：spec.md §Decision 6.1 · ledger：A-014 · ADR：docs/adr/0006-shared-skeleton-scale-slice.md
> Blocked by: #05 —— 已闭环。产物：本报告 + `14-skeleton-fields.json`（数据）+ `14-skeleton.schema.json`（形式化 schema）+ `14-skeleton-check.mjs`（机检）。

## 完成定义清单（逐项）

- [x] **章顺序必须严格锁定（不能“约 4 章”）** — 机检证据：`node 14-skeleton-check.mjs` → `PASS: 4 chapters order-locked, 45 fields typed/required/described, 20/20 cells, 64 slice fields, 31 xrefs to A-005, no placeholders`。锁定为 **C1 执行摘要 → C2 四象限与裁决 → C3 证据 → C4 行动建议**，ordinal 1..4 连续无重复，章节名序列亦进机检（改序即 FAIL）。
- [x] **字段必含清单每字段类型 / 必填 / 说明** — 45 个骨架字段 + 64 个交集字段；骨架字段含 `name / type / required / description`，交集字段另含 `origin`。机检覆盖四属性非空、`required` 为布尔、占位词检测。
- [x] **三项交付齐备** — 1) 章顺序锁定（Deliverable 1）；2) 5 scale × 4 象限矩阵交集字段表（Deliverable 2）；3) 不锁措辞的范围说明（Deliverable 3）。

## Deliverable 1 — 章顺序锁定（章节列表 + 必填字段）

章集合与章顺序**严格锁定**：共 4 章，不得增删、重排，不得用“约 4 章”等模糊表述。下表逐章列出必含字段（类型 / 必填 / 说明）。

### C1 执行摘要（ordinal 1，locked）

_一屏给出审计对象、粒度、综合裁决与置信度；读者只读本章即可知道结论_

| 字段 | 类型 | 必填 | 说明 |
|---|---|---|---|
| `report_id` | string | 必填 | 报告唯一标识，写入 fact table，作为跨 scale 聚合主键之一 |
| `schema_version` | string(semver) | 必填 | 本骨架契约版本，与 14-skeleton.schema.json 对齐 |
| `scale` | enum[MACRO-A|MACRO-B|MACRO-C|MICRO-A|MICRO-B] | 必填 | 审计粒度档位（ADR-0001 五档） |
| `subject_ref` | string | 必填 | 审计对象定位符：repo@sha / PR# / 文件路径:行 |
| `generated_at` | string(date-time) | 必填 | 报告生成时刻，ISO 8601 UTC |
| `correlation_key` | string(32) | 必填 | trace_id/baggage_id（A-010），用于跨 scale 关联同一 commit/PR 的审计记录 |
| `overall_verdict` | enum[pass|warn|fail|insufficient] | 必填 | 综合裁决；insufficient 表示信号不足（对齐 S5 单人仓降权门语义） |
| `confidence` | number(0-1) | 必填 | 裁决置信度；低于协议阈值时 overall_verdict 必须为 insufficient |
| `headline` | string | 必填 | 一句话结论（措辞不锁，长度上限 200 字符） |
| `top_findings` | array[string] | 必填 | 指向 C3 证据条目的 evidence_id，至少 1 项 |
| `degraded_mode` | boolean | 必填 | 是否处于降级产出；true 时走 A-018 failure path 语义并必带降级说明 |

### C2 四象限与裁决（ordinal 2，locked）

_按 structure → behavior → supply_chain → strategy 固定顺序给出四象限结论与 verdict-gate 印记_

| 字段 | 类型 | 必填 | 说明 |
|---|---|---|---|
| `quadrants` | array[QuadrantBlock](4) | 必填 | 恰好 4 项，顺序锁定：structure → behavior → supply_chain → strategy |
| `quadrant` | enum[structure|behavior|supply_chain|strategy] | 必填 | 象限标识（ADR-0001 四象限） |
| `applicability` | enum[native|projected|not_applicable] | 必填 | 该象限在本 scale 的适用形态；native=原生有效，projected=由其他 scale 投影/聚合推得，not_applicable=无信号 |
| `verdict` | enum[pass|warn|fail|insufficient]|null | 必填 | 象限裁决；applicability=not_applicable 时必须为 null |
| `score` | number|null | 必填 | 象限评分；为 null 时必须配合 verdict=insufficient |
| `confidence` | number|null | 必填 | 象限置信度 |
| `dimensions` | array[DimensionRef] | 必填 | 关联维度引用；strategy 象限为 S1-S5（指向 #05 25 格矩阵），其余象限可空数组 |
| `slice_fields` | object | 必填 | 该 (scale, quadrant) 交集字段实例，键集由本文件 cells 表严格锁定 |
| `verdict_gate.protocol_version` | string | 必填 | Adjudication Protocol 版本（code-as-policy，ADR-0005） |
| `verdict_gate.decision` | enum[accepted|rejected|overridden|insufficient] | 必填 | 裁决结果 |
| `verdict_gate.evidence_threshold_met` | boolean | 必填 | 是否达到证据门槛 |
| `verdict_gate.decided_at` | string(date-time) | 必填 | 裁决时刻 |
| `verdict_gate.override_reason` | string|null | 必填 | 非 overridden 时必须为 null |
| `verdict_gate.audit_ref` | string | 必填 | 审计日志指针，保证裁决可追溯 |
| `conflict_markers` | array[ConflictMarker] | 必填 | 跨 scale 冲突标记（无冲突时为空数组，字段本身不可缺省） |

### C3 证据（ordinal 3，locked）

_承载全部被引用的证据条目，每条必带 grounded 引文校验盖章与可重放定位_

| 字段 | 类型 | 必填 | 说明 |
|---|---|---|---|
| `evidence_items` | array[EvidenceItem](>=1) | 必填 | 证据条目，至少 1 项 |
| `evidence_id` | string | 必填 | 证据唯一标识，供 C1 top_findings 与 C4 evidence_refs 引用 |
| `source` | enum[codelore|openssf_scorecard|git|adr_scan|repomix|manual] | 必填 | 证据来源 |
| `locator` | string | 必填 | 定位符：file:line / commit sha / scorecard check 名 |
| `claim` | string | 必填 | 该证据支撑的断言 |
| `grounded` | enum[verified|unverified] | 必填 | 引文校验盖章（ADR-0006 的 ✓/⚠ 语义）：verified=已校验，unverified=未校验 |
| `collected_at` | string(date-time) | 必填 | 证据采集时刻 |
| `reproduce_cmd` | string|null | 必填 | 可重放命令；为 null 时 reproduce_absent_reason 必填 |
| `reproduce_absent_reason` | string|null | 可选 | 条件必填：仅当 reproduce_cmd 为 null 时必填 |

### C4 行动建议（ordinal 4，locked）

_给出可行动建议，每条必带 verdict-gate 印记；未通过裁决的建议必须显式标 unverified_

| 字段 | 类型 | 必填 | 说明 |
|---|---|---|---|
| `recommendations` | array[Recommendation] | 必填 | 建议条目 |
| `rec_id` | string | 必填 | 建议唯一标识 |
| `priority` | enum[P0|P1|P2] | 必填 | 优先级 |
| `action` | string | 必填 | 建议动作 |
| `rationale` | string | 必填 | 理由，须可追溯到 C3 证据 |
| `expected_impact` | string | 必填 | 预期影响 |
| `effort` | enum[S|M|L] | 必填 | 工作量档位 |
| `verdict_gate_stamp` | enum[adjudicated|unverified] | 必填 | 裁决印记（ADR-0006）：仅 adjudicated 条目进入正式报告；unverified 必须带 ⚠ 标记 |
| `evidence_refs` | array[string] | 必填 | 指向 C3 evidence_id，至少 1 项 |
| `degraded_note` | string|null | 可选 | 降级说明；failure path 产出时必填（A-018） |

## Deliverable 2 — 5 scale × 4 象限矩阵交集字段表

**交集的定义**：某格 (scale, quadrant) 的交集字段 = 骨架共享字段（C2 每象限必含 `quadrant / applicability / verdict / score / confidence / dimensions / slice_fields / verdict_gate.* / conflict_markers`）∩ 该格特有 `slice_fields`。共享字段见 Deliverable 1 的 C2 表；下表列出每格的**特有交集字段**。

**关键设计判断：20 格不等价。** ADR-0001 明示“四象限模型（结构/行为/供应链/战略）只在 Macro-B 内有效”，而 CONTEXT.md 战略象限术语明示“覆盖全部 5 scale，每 scale 一份叙事化战略报告”。二者存在张力，本票不掩盖：引入 `applicability` 枚举（`native` 原生 / `projected` 投影 / `not_applicable` 无信号）显式承载差异，而非把 20 格写成等价。当前分布：native 10 格、projected 10 格、not_applicable 0 格。 该张力并非本票新发现——票 #03 的假设失效检测已将其记为 **AS-0001-03 = PARTIAL-DRIFT**（ADR-0001「四象限只在 Macro-B」vs ADR-0004 战略象限跨 5 scale 的未明文豁免），处置为「交 verdict-gate 裁决，本票不代裁」。本票立场一致：`applicability` 只提供**契约层载体**承载该差异、**不做裁决**；native / projected 的划分依据是 ADR-0001 原文与 CONTEXT.md 战略象限术语，最终豁免与否仍归 verdict-gate（per A-005 Adjudication Protocol）。

### 象限 Q：结构（`quadrant=structure`，5 格）

| scale | 适用性 | 交集字段（类型 / 必填） | 格级来源 |
|---|---|---|---|
| Macro-A 跨仓战略 | projected 投影 | `cross_repo_dependency_edges`（integer / 必填）<br>`shared_lib_utilization`（number / 必填）<br>`duplicate_abstraction_clusters`（integer / 必填） | ADR-0001 |
| Macro-B 仓库级 4 象限 | native 原生 | `dependency_violation_ratio`（number / 必填）<br>`single_impl_abstraction_ratio`（number / 必填）<br>`god_object_density`（number / 必填）<br>`module_count`（integer / 必填） | ADR-0001 |
| Macro-C 演化考古 | projected 投影 | `boundary_erosion_trend`（number / 必填）<br>`module_churn_ratio`（number / 必填）<br>`abstraction_impl_ratio`（number / 必填） | CodeLore 历史分析 |
| Micro-A PR diff | projected 投影 | `files_touched`（integer / 必填）<br>`diff_structure_delta`（integer / 必填）<br>`new_god_object_delta_loc`（integer / 必填） | CodeLore diff --llm |
| Micro-B 文件级 | native 原生 | `file_loc`（integer / 必填）<br>`file_cohesion`（number / 必填）<br>`god_object_flag`（boolean / 必填） | CodeLore file facts |

### 象限 Q：行为（`quadrant=behavior`，5 格）

| scale | 适用性 | 交集字段（类型 / 必填） | 格级来源 |
|---|---|---|---|
| Macro-A 跨仓战略 | projected 投影 | `cross_repo_activity_gini`（number / 必填）<br>`repo_churn_ratio`（number / 必填） | CodeLore 跨仓聚合 |
| Macro-B 仓库级 4 象限 | native 原生 | `hotspot_rank`（array[HotspotEntry] / 必填）<br>`churn_complexity_correlation`（number / 必填） | CodeLore hotspot |
| Macro-C 演化考古 | projected 投影 | `hotspot_drift_delta`（number / 必填）<br>`churn_trend_12m`（number / 必填） | CodeLore 历史分析 |
| Micro-A PR diff | projected 投影 | `pr_churn_loc`（integer / 必填）<br>`pr_review_latency_hours`（number / 必填） | git + PR 元数据 |
| Micro-B 文件级 | native 原生 | `file_commit_frequency`（integer / 必填）<br>`file_change_coupling`（number / 必填） | CodeLore file facts + git |

### 象限 Q：供应链（`quadrant=supply_chain`，5 格）

| scale | 适用性 | 交集字段（类型 / 必填） | 格级来源 |
|---|---|---|---|
| Macro-A 跨仓战略 | projected 投影 | `scorecard_mean`（number / 必填）<br>`scorecard_min`（number / 必填）<br>`critical_check_fail_ratio`（number / 必填） | OpenSSF Scorecard 聚合 |
| Macro-B 仓库级 4 象限 | native 原生 | `scorecard_score`（number / 必填）<br>`scorecard_checks`（array[CheckEntry] / 必填）<br>`critical_check_fail`（boolean / 必填） | OpenSSF Scorecard |
| Macro-C 演化考古 | projected 投影 | `scorecard_delta_12m`（number / 必填）<br>`check_regression_count`（integer / 必填） | OpenSSF Scorecard 时间序列 |
| Micro-A PR diff | projected 投影 | `manifest_changed`（boolean / 必填）<br>`new_dependencies`（integer / 必填）<br>`license_risk_flag`（boolean / 必填） | PR diff + manifest 扫描 |
| Micro-B 文件级 | projected 投影 | `manifest_file`（boolean / 必填）<br>`declared_dep_count`（integer / 必填） | manifest 扫描 |

### 象限 Q：战略（`quadrant=strategy`，5 格）

| scale | 适用性 | 交集字段（类型 / 必填） | 格级来源 |
|---|---|---|---|
| Macro-A 跨仓战略 | native 原生 | `portfolio_convergence_mean`（number / 必填）<br>`adr_structure_completeness_mean`（number / 必填）<br>`duplicate_abstraction_clusters`（integer / 必填）<br>`reverse_dependency_edges`（integer / 必填）<br>`ownership_overlap_ratio`（number / 必填） | A-005 矩阵 |
| Macro-B 仓库级 4 象限 | native 原生 | `positioning_keyword_coverage`（number / 必填）<br>`adr_element_completeness`（number / 必填）<br>`single_impl_abstraction_ratio`（number / 必填）<br>`dependency_violation_ratio`（number / 必填）<br>`bus_factor_lt2_loc_ratio`（number / 必填） | A-005 矩阵 |
| Macro-C 演化考古 | native 原生 | `coverage_delta_12m_pp`（number / 必填）<br>`adr_lag_median_days`（number / 必填）<br>`abstraction_ratio_rising_quarters`（integer / 必填）<br>`stale_assumption_ratio`（number / 必填）<br>`ownership_lagging_modules_ratio`（number / 必填） | A-005 矩阵 |
| Micro-A PR diff | native 原生 | `pr_positioning_relevance`（number / 必填）<br>`adr_pr_binding_missing_ratio`（number / 必填）<br>`new_single_impl_abstractions`（integer / 必填）<br>`direction_violations_per_pr`（integer / 必填）<br>`unapproved_boundary_cross_ratio`（number / 必填） | A-005 矩阵 |
| Micro-B 文件级 | native 原生 | `module_belonging_score`（number / 必填）<br>`adr_missing_sections`（integer / 必填）<br>`file_loc`（integer / 必填）<br>`vacancy_occupation_suspect`（integer / 必填）<br>`single_author_file_ratio`（number / 必填） | A-005 矩阵 |

**事实唯一约束（ADR-0005）**：跨象限复用同一 metric 时只引用不复制，禁止重复落库。本表已出现 31 处对 A-005 矩阵的字段级引用（形如 `A-005:reports/05-unit-matrix.json#<cellId>`），由守卫脚本逐条解析校验 metric 名真实存在。
## Deliverable 3 — 不锁措辞的范围说明

裁定原则一句话：**spec 层锁「有什么、什么类型、要不要、盖什么章」，不锁「怎么说、长什么样」。**

### 锁定（spec 层，不可协商）

| 锁定的对象 | 说明 |
|---|---|
| 章集合与章顺序 | 4 章 C1→C2→C3→C4，ordinal 1..4，章节名序列 |
| 字段名集合与拼写 | 骨架 45 字段 + 交集 64 字段，拼写与 JSON 严格一致 |
| 字段类型与枚举域 | 如 `overall_verdict` ∈ pass|warn|fail|insufficient；`grounded` ∈ verified|unverified |
| 必填性 | `required` 布尔；含条件必填（如 `reproduce_cmd` 为 null 时 `reproduce_absent_reason` 必填） |
| 三个印记位置 | C2 `verdict_gate`（裁决印记）、C3 `grounded`（引文校验 ✓/⚠）、C4 `verdict_gate_stamp`（未裁决不得进正式报告） |
| 象限内顺序 | structure → behavior → supply_chain → strategy（`quadrants` 数组长度 4、顺序敏感） |
| `applicability` 枚举语义 | native / projected / not_applicable，且 not_applicable 时 verdict 必须为 null |
| 每格交集字段键集 | `slice_fields` 的 name 集合由本契约锁定，不得改名 |

### 不锁（留给 demo / 实施层，per ADR-0006 与 A-016）

| 不锁的对象 | 说明 |
|---|---|
| 措辞与句式 | `headline` / `claim` / `action` / `rationale` 等文本字段的**内容**完全自由 |
| 篇幅与字数 | 唯一例外：`headline` ≤ 200 字符，属类型约束而非措辞约束 |
| 渲染样式 | CSS / HTML / 字体 / 颜色 / 图标 / 缩进 —— spec 锁结构不锁样式 |
| 呈现形态 | 表格 vs 段落 vs 折叠面板 vs 卡片，由渲染层自选 |
| 评分刻度呈现 | 内部统一 0-1，展示层可换算为 0-100 或字母等级 |
| 章节内子标题与图表形式 | 各 scale 切片自行决定 |
| 语言 | 中/英/双语均允许，不影响字段契约 |
| 条目排序 | 除象限顺序外，章内条目排序自由 |

## 调研摘要（atomcode 深度调研，per WORKFLOW §4.2.3）

| 对标对象 | 固定的是什么 | 自由的是什么 | 对本票的印证 |
|---|---|---|---|
| **arc42** | 12 章固定顺序（Intro/Goals→Constraints→Context→Solution Strategy→视图→Crosscutting→Decisions→Quality→Risks→Glossary）；skeleton 版只含标题+必备表 | 官方自述 “tailorable to your specific needs”，每章 tips 为建议非强制 | 直接印证「锁章顺序 + 不锁措辞」是成熟做法 |
| **IEEE 829-2008** | 8 类测试文档，每类 “shall have the following structure” 且 “sections shall be ordered in the specified sequence” | 明确 “does not call for specific testing methodologies”，不指定方法论 | 把章顺序锁定写进标准条款的先例 |
| **IEEE 829 Master/Level 层级** | Master Test Plan/Report = 跨层级共享骨架；Level Test Plan/Report = 粒度文档；两级均锁节序 | 各 Level 内容裁剪自由 | **最接近「共享骨架 + 粒度切片」的先例** |
| **Trail of Bits / OpenZeppelin 审计报告** | ToB 8 段固定：Cover→Executive Summary→Codebase maturity→Findings→Exploit scenario→修复→Appendices；100% 报告必含 | 措辞、样式、篇幅（64pp 为典型值非规定） | 与本报告 C1→C3→C4 形态同构 |
| **SARIF 2.1.0（OASIS）** | JSON Schema（顶层 required: version, runs）+ 规范性 SHALL/SHOULD/MAY + 9 条 Conformance Clauses + `$schema`/`version` 自描述 | 工具实现自由 | **机器可校验报告字段契约的最接近者**，本票 schema 采用其「schema + 自描述版本」形态 |
| **OpenSSF Scorecard JSON v2** | 顶层 required: date, repo, scorecard, score, checks, metadata；每 check required: details, score, reason, name, documentation | 消费方渲染自由 | 单用途实例；本票参照其 check 三元组心智 |
| **Google Design Doc** | 结构（Context/scope→Goals & non-goals→Design→Alternatives→Cross-cutting）被公认有用 | 官方定性为 informal，无强制模板 | 反例：过松，不适合审计产物 |

**调研结论**：①「锁章顺序 + 不锁措辞」有标准级先例，本票设计非自创；②机器可校验字段契约选 SARIF 形态（schema + 规范条款 + 自描述版本），JSON Schema 是其底层机制而非报告契约本身；③**未发现**「多粒度报告共享骨架 + 粒度切片」的成品先例，最接近的是 IEEE 829 的 Master/Level 文档层级；OWASP SAMM 与 CMMI 是成熟度评分网格而非报告模板，**已否决为直接先例**。

## 信息缺口（Sufficiency Gate）

- **projected 格的字段无真实仓验证**：20 格中 10 个 projected 格（结构 3、行为 3、供应链 4）的字段为 `A-014 expert/v1` 推断，未跑试点语料；仅战略象限 5 格（25 个 metric）由 A-005 矩阵锁定。
- **投影算法未定义**：本票只锁「每格有哪些字段」，不定义 projected 格如何从 native 格推得（聚合口径、时间对齐、冲突取主）—— 该语义属 A-015 scale 切片差异边界。
- **供应链象限在 Micro 粒度的信号强度未验证**：Scorecard 是仓库级信号，Micro-A/Micro-B 两格仅在 manifest 命中时有效，否则 `verdict` 应为 `insufficient`；该降级判据待试点确认。
- **取值语义未锁**：本票锁字段名与类型，未锁单位、精度与容差（引自 A-005 的 31 处字段除外，其阈值语义沿用 A-005）。

## 阻塞

- **无**（Blocked by #05 已闭环，A-005 矩阵 25/25 机检 PASS）。
- 本票解锁下游：**A-015**（scale 切片差异边界——消费本票的 `applicability` 与 projected 语义）、**A-016**（渲染样式与模板结构切分——消费 Deliverable 3 的锁定/不锁边界）。

## lessons 候选

1. **W2 #02 的正则转义教训在本票重演一次**：首版 `14-skeleton-check.mjs` 写入 `/...|???//`，问号未转义导致 `SyntaxError: Nothing to repeat`，脚本直接跑不起来。修复采用程序化 `split/join` 字面替换 + 改用字符类 `[?][?][?]` 彻底规避反斜杠。**建议固化为默认做法**：写 `.mjs` 一律走 `ctx_execute` 程序化写入，正则字面量优先用字符类而非转义序列；写完立即实跑一次，不要等收尾。
2. **20 格不等价必须显式化**：ADR-0001 明示「四象限只在 Macro-B 内有效」，而 CONTEXT.md 战略象限术语明示「覆盖全部 5 scale」。二者张力若不处理，会把 20 格写成等价表而埋下实施期返工。本票引入 `applicability` 枚举承载差异（native 10 / projected 10 / n-a 0）。**教训**：当两份已锁文档（ADR 与 CONTEXT）对同一网格给出不同覆盖范围时，契约层必须显式建模差异，而不能用「统一字段清单」掩盖。

## 引用文件列表

- 必读：`issues/14-shared-skeleton-design.md`、`handoffs/14-shared-skeleton-design.md`、`spec.md §Decision 6.1`、`WORKFLOW.md §4.2`、`decision-ledger.md A-014`、`docs/adr/0006-shared-skeleton-scale-slice.md`
- 另参照：`docs/adr/0001-five-scale-scope.md`、`docs/adr/0004-strategic-quadrant-five-dims.md`、`docs/adr/0005-hub-of-facts-with-federated-adjudication.md`、`CONTEXT.md`（战略象限 S1-S5 / Hotspot / 报告模板 / Scale Slice / 行动建议等术语）
- 上游依赖：`reports/05-unit-matrix.json`、`reports/05-unit-matrix.schema.json`、`reports/05-matrix-check.mjs`、`reports/05-report.md`
- 本票产物：`reports/14-report.md`（本文件）、`reports/14-skeleton-fields.json`、`reports/14-skeleton.schema.json`、`reports/14-skeleton-check.mjs`
- 调研一手来源：arc42 https://arc42.org/overview/ ｜ IEEE 829-2008 https://standards.ieee.org/standard/829-2008.html ｜ SARIF 2.1.0 https://docs.oasis-open.org/sarif/sarif/v2.1.0/sarif-v2.1.0.html ｜ Scorecard json.v2.schema https://github.com/ossf/scorecard/blob/v3.0.0/pkg/json.v2.schema ｜ Trail of Bits 报告解剖 https://trailofbits.com/anatomy-of-a-report/ ｜ NIST SSDF https://csrc.nist.gov/projects/ssdf
