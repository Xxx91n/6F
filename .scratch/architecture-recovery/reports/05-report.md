# Report 05 — 25 采集单元矩阵（A-005）

> 票：issues/05-25-unit-matrix.md · 启动器：prompts/05-25-unit-matrix.md · 决策：spec.md §Decision 4.5 · ledger：A-005 · ADR-0004
> Blocked by: None — 已完成闭环。产物：本报告 + `05-unit-matrix.json`（数据）+ `05-unit-matrix.schema.json`（形式化 schema）+ `05-matrix-check.mjs`（机检）。

## 完成定义清单（逐项）

- [x] **矩阵 25 格全填（无"待定"）** — 机检证据：`node 05-matrix-check.mjs` → `PASS: 25/25 cells, schema-valid, full S1-S5 x 5-scale coverage, no placeholders`（校验 JSON Schema 合规 + dimension×scale 全笛卡尔积覆盖 + id 唯一 + 判据/数据源/阈值非空非占位）
- [x] **schema 形式化（可机检）** — 标准 JSON Schema draft 2020-12（`05-unit-matrix.schema.json`），另附机检脚本覆盖 JSON Schema 无法表达的覆盖性不变量（25 格笛卡尔积完备、id 唯一、占位词检测）
- [x] **三项交付物** — 1) 25 单元矩阵表（下文 Deliverable 1，行=5 维 S1-S5，列=5 scale，单元格=判据/数据源/阈值）；2) 矩阵 schema 定义（Deliverable 2，字段/类型/必填项）；3) 跨仓校准机制说明（Deliverable 3，单一仓库→多仓分布扩展路径）

## Deliverable 1 — 25 单元矩阵表

行 = 5 维（S1-S5，per ADR-0004），列 = 5 scale（per ADR-0001）。阈值均为**初版 v1 参数**（`provenance.origin=expert`，90 天校准窗口，见 Deliverable 3）。黄/红条件采用 SonarQube 门禁三元组语义 `(metric, operator, value)`，可机检；判据文字中的叠加定性条件（如"且无合并计划"）记于单元格 notes。

### S1 定位收敛

| scale | 判据 | 数据源 | 阈值·黄 | 阈值·红 |
|---|---|---|---|---|
| MACRO-A（跨仓战略） | 跨仓组合战略对齐：各仓定位声明与组合叙事 embedding 收敛度、跨仓依赖方向与声明分工一致性 | 各仓 README/roadmap、跨仓依赖图、组合战略声明 | `portfolio_convergence_mean < 0.75` | `portfolio_convergence_mean < 0.6` |
| MACRO-B（仓库级 4 象限） | README 一句话定位/roadmap 与实际交付（PR 标题、issue 分流、CHANGELOG）的关键词+embedding 覆盖率与漂移起点检测 | README/docs/roadmap、CHANGELOG、git log、issue+label、PR 标题 | `positioning_keyword_coverage < 0.7` | `positioning_keyword_coverage < 0.5` |
| MACRO-C（演化考古） | 定位覆盖度 rolling window 时间序列与漂移起点（连续下滑趋势）检测 | git log、CHANGELOG、roadmap 归档 | `coverage_delta_12m_pp < -10` | `coverage_delta_12m_pp < -25` |
| MICRO-A（PR diff） | PR 标题/描述与声明定位的语义相关度（off-topic 检测） | PR 标题/描述、定位关键词表、embedding 服务 | `pr_positioning_relevance < 0.5` | `pr_positioning_relevance < 0.3` |
| MICRO-B（file level） | 文件/模块归属定位声明功能面（孤儿模块检测） | 文件路径/模块地图、定位关键词表 | `module_belonging_score < 0.4` | `module_belonging_score < 0.2` |

### S2 ADR 质量

| scale | 判据 | 数据源 | 阈值·黄 | 阈值·红 |
|---|---|---|---|---|
| MACRO-A（跨仓战略） | 跨仓 ADR 治理一致性：关键决策 ADR 覆盖率、模板一致性、supersede 链健康度 | 各仓 docs/adr/ 全量结构扫描、跨仓共享决策清单 | `adr_structure_completeness_mean < 0.6` | `adr_structure_completeness_mean < 0.4` |
| MACRO-B（仓库级 4 象限） | ADR 真决策五要素（Context 张力/Considered Options/正负 Consequences/immutable+supersede 链/决策当时写）+ YAML 时间戳头一致性 | docs/adr/ 全量结构扫描、git log --follow | `adr_element_completeness < 0.8` | `adr_backdated_gt90d_ratio > 0.2` |
| MACRO-C（演化考古） | ADR 撰写时点与决策发生时点的滞后分布 + TODO/FIXME 密度对照 | git log --follow、ADR 头时间戳、TODO/FIXME 扫描 | `adr_lag_median_days > 30` | `adr_lag_median_days > 90` |
| MICRO-A（PR diff） | 架构级变更 PR 与 ADR 创建/更新的绑定率（decision-PR binding） | CodeLore diff --llm 架构变更分类、ADR 文件变更 | `adr_pr_binding_missing_ratio > 0.2` | `adr_pr_binding_missing_ratio > 0.4` |
| MICRO-B（file level） | 单个 ADR 文件模板结构完备性（必填 section 与 Status 齐备） | 单 ADR markdown 结构解析 | `adr_missing_sections > 0` | `adr_missing_sections > 1` |

### S3 门面预算 vs 结构预算

| scale | 判据 | 数据源 | 阈值·黄 | 阈值·红 |
|---|---|---|---|---|
| MACRO-A（跨仓战略） | 跨仓重复抽象簇与门面投入对比（同型抽象跨仓计数、共享库利用率） | 各仓 CodeLore 抽象清单、跨仓依赖图 | `duplicate_abstraction_clusters > 2` | `duplicate_abstraction_clusters > 4` |
| MACRO-B（仓库级 4 象限） | God Object/巨类/单实现抽象/范式通胀密度 vs 结构投入（边界清晰/内聚/适度抽象） | CodeLore 上帝对象分析、抽象利用率、shearing layers 识别 | `single_impl_abstraction_ratio > 0.3` | `single_impl_abstraction_ratio > 0.5` |
| MACRO-C（演化考古） | 抽象通胀趋势：新增抽象/新增实现比值的时间序列 | CodeLore 历史分析 | `abstraction_ratio_rising_quarters > 1` | `abstraction_impl_ratio > 1.5` |
| MICRO-A（PR diff） | PR 是否新引入 God Object/单实现抽象/范式通胀（diff 级） | CodeLore diff --llm | `new_single_impl_abstractions > 0` | `new_god_object_delta_loc > 200` |
| MICRO-B（file level） | 文件级内聚与门面度：巨类/高 LOC/低内聚文件质量卡（advisory 输出） | CodeLore file facts | `file_loc > 500` | `file_loc > 1000` |

### S4 演化方向

| scale | 判据 | 数据源 | 阈值·黄 | 阈值·红 |
|---|---|---|---|---|
| MACRO-A（跨仓战略） | 跨仓演化方向与组合战略一致性：依赖方向 vs 声明分层 | 跨仓依赖图、各仓 roadmap/ADR 分层声明 | `reverse_dependency_edges > 0` | `cross_repo_circular_dependencies > 0` |
| MACRO-B（仓库级 4 象限） | 依赖方向违规模块占比 + ADR supersede 链活跃度 | CodeLore 依赖分析、docs/adr supersede 链 | `dependency_violation_ratio > 0.05` | `dependency_violation_ratio > 0.15` |
| MACRO-C（演化考古） | ADR 假设提取→假设失效检测（主战场；LLM 抽取+人工复核回路）+ 空位与负向声明诚实度 | docs/adr 假设段、代码事实对照、ADR supersede 链 | `stale_assumption_ratio > 0.1` | `stale_assumption_ratio > 0.25` |
| MICRO-A（PR diff） | PR 是否违反声明的演化方向（依赖方向违规/进入冻结区/负向声明违反） | CodeLore diff --llm、ADR 负向声明清单 | `direction_violations_per_pr > 0` | `direction_violations_per_pr > 1` |
| MICRO-B（file level） | 文件是否占据 ADR 声明的空位/out-of-scope 区域（负向声明诚实度） | 文件路径、out-of-scope/空位声明清单 | `vacancy_occupation_suspect > 0` | `vacancy_occupation_confirmed > 0` |

### S5 所有权边界匹配

| scale | 判据 | 数据源 | 阈值·黄 | 阈值·红 |
|---|---|---|---|---|
| MACRO-A（跨仓战略） | 跨仓所有权拓扑与组合分工同构性（同团队多仓职责重叠检测） | 各仓 CODEOWNERS、跨仓 commit 作者矩阵 | `ownership_overlap_ratio > 0.3` | `ownership_mismatch_with_circular_deps > 0` |
| MACRO-B（仓库级 4 象限） | 模块分解与所有权分解（git author 矩阵/CODEOWNERS/AGENTS.md）同构性 + bus factor | CODEOWNERS、git blame 作者-模块矩阵、PR reviewer 分布 | `bus_factor_lt2_loc_ratio > 0.2` | `bus_factor_lt2_loc_ratio > 0.4` |
| MACRO-C（演化考古） | 所有权漂移与模块演化的同步性（边界变更是否跟随演化） | CODEOWNERS 历史、模块演化时间线 | `ownership_lagging_modules_ratio > 0.3` | `ownership_lagging_modules_ratio > 0.5` |
| MICRO-A（PR diff） | PR author/reviewer 是否跨越 ownership 边界（CODEOWNERS 审批覆盖率） | PR 元数据、CODEOWNERS | `unapproved_boundary_cross_ratio > 0.1` | `unapproved_boundary_cross_ratio > 0.3` |
| MICRO-B（file level） | 文件维护者集中度（bus factor=1 文件占比），按团队规模分桶降权 | git blame、作者统计、团队规模信号 | `single_author_file_ratio > 0.5` | `single_author_core_file_ratio > 0.75` |


### 单元格附注（notes）

- `S1xMACRO-A`：红级叠加条件：任意两仓定位声明直接冲突
- `S1xMACRO-B`：70% 为初版 expert 参数非 hard rule（per Decision 4.1）；embedding 选型+关键词 fallback+人工抽检
- `S1xMICRO-A`：红级叠加条件：30 天内同主题 off-topic 达 5 个
- `S1xMICRO-B`：advisory，不进入裁决路径；红级叠加条件：无 out-of-scope 声明
- `S2xMACRO-B`：红阈值=事后补写>90 天占比>20%（per Decision 4.2 初版参数）
- `S2xMACRO-C`：时间戳头缺失时回退 git log 首次出现日（per Decision 4.2 回退方案）
- `S2xMICRO-B`：advisory，进入文件质量卡
- `S3xMACRO-A`：红级叠加条件：无合并计划
- `S3xMACRO-C`：红级要求比值连续 3 季度>1.5
- `S3xMICRO-A`：黄级要求且无 justification 说明
- `S3xMICRO-B`：advisory；红级叠加条件：内聚 <0.3
- `S4xMACRO-C`：红级叠加条件：核心假设失效且无 supersede（per Decision 4.3）
- `S4xMICRO-A`：黄级要求无豁免标注
- `S4xMICRO-B`：advisory；红级叠加条件：无 supersede
- `S5xMICRO-B`：单人仓该维信号弱：降权为 advisory 并显式标注「信号不足」（per Decision 4.4）

## Deliverable 2 — 矩阵 schema 定义（字段 / 类型 / 必填项）

顶层对象（`additionalProperties: false`）：

| 字段 | 类型 | 必填 | 约束 |
|---|---|---|---|
| `schema_version` | string | ✅ | `const "1.0.0"`；单元格结构不兼容演进时递增 |
| `dimensions` | array\<enum\> | ✅ | 恰 5 项，enum `S1..S5` |
| `scales` | array\<enum\> | ✅ | 恰 5 项，enum `MACRO-A/MACRO-B/MACRO-C/MICRO-A/MICRO-B` |
| `cells` | array\<cell\> | ✅ | 恰 25 项（minItems=maxItems=25） |
| `calibration` | object | ✅ | 见下 |

cell 对象（必填项 10 个）：

| 字段 | 类型 | 必填 | 约束 |
|---|---|---|---|
| `id` | string | ✅ | pattern `^S[1-5]x(MACRO|MICRO)-[AB]$`（含 `S?xMACRO-C`），全局唯一 |
| `dimension` | enum | ✅ | `S1..S5` |
| `scale` | enum | ✅ | 5 scale 之一 |
| `criterion` | string | ✅ | 判据定义，minLength 20，禁占位词 |
| `data_source` | array\<string\> | ✅ | ≥1 项，每项非空 |
| `threshold.yellow` / `threshold.red` | thresholdCondition | ✅ | 各为三元组 `{metric, operator, value}`；`metric` pattern `^[a-z][a-z0-9_]*$`；`operator` enum `< <= > >= ==`；`value` number |
| `scoring` | enum | ✅ | `ratio/percent/count/index` |
| `risk_weight` | integer | ✅ | 1-3（聚合分按风险加权，per Scorecard） |
| `machine_checkable` | boolean | ✅ | 判定器可全自动为 true；含人工复核回路的仍 true 但 notes 说明 |
| `provenance` | object | ✅ | `{origin: expert|percentile|benchmark|dynamic, version: ^v[0-9]+$, calibrated_date, expires_at, sample_size?, bucket?}` — 阈值"初版参数"声明机制 |
| `notes` | string | — | 叠加定性条件、advisory/降权说明 |

calibration 对象（必填 5 项）：`strategy`(string)、`tiers`(array≥3：`{name, method}`)、`buckets`(array\<string\>)、`recalibration_interval_days`(integer≥1)、`pilot_corpus`(array\<string\>)。

机检方式：`node 05-matrix-check.mjs`（内置 JSON Schema 2020-12 子集校验器 + 覆盖性不变量）；schema 文件本身是标准 JSON Schema，可直接接 ajv 等第三方校验器。

## Deliverable 3 — 跨仓校准机制（单一仓库 → 多仓分布）

### 3.1 阈值的"初版参数"声明

全部 25 格阈值 `provenance = {origin: expert, version: v1, calibrated_date: 2026-09-11, expires_at: 2026-12-10, sample_size: 0}`：显式声明为专家初版、90 天有效、未经语料校准。`expires_at` 过期即触发重校准，禁止无期限使用未校准阈值（对标 SIG 年度重校准 + SonarQube 默认门禁随版本调整）。

### 3.2 三档校准机制（tiers）

- **static-baseline** — Alves 百分位法：以试点语料的 LOC 加权 70/80/90 百分位生成黄/红边界，要求尊重分布、可复现、可溯源
- **relative-filter** — 大系统与跨仓场景用百分位而非绝对值判级（Marinescu Rule 3），避免结构性差异误判（CBO=16 在 Controllers 分布仅 0.35 百分位的教训）
- **dynamic-baseline** — Macro-C/持续观测场景用 EMA+相对 σ 容差带动态基线，仅从 green merged build 提升基线，防 moving-target

### 3.3 分桶归一化（buckets）

跨仓不可比问题用分桶解决：`language, tech-stack, architecture-role, team-size`。新仓库先归桶再判级；桶内维护各自的 metric 分布（p50/p75/p90），黄/红线默认取桶内百分位（Alves 法 70/80/90）。S5 的"单人仓降权"即 team-size 桶的特例（per Decision 4.4）。

### 3.4 扩展路径（试点 → 多仓）

1. **试点语料**：`env-manager, jiahao, anysearch-cli`（ADR-0004 用户三项目评审档案）先跑 25 格采集，得到 metric 实测分布；
2. **桶内重校准**：按 3.2 三档机制把 v1 expert 阈值替换为 percentile/benchmark/dynamic 来源的 v2 阈值，`sample_size` 与 `bucket` 落盘；
3. **新仓接入**：归桶 → 用该桶 v2 阈值判级 → 桶样本 <N（冷启动）时回退 v1 expert 阈值并标注 `data doesn't show`（Sufficiency Gate）；
4. **漂移监控**：AI 生成代码占比上升时（GitClear 2025：copy/paste 8.3%→12.3%、重构占比 25%→<10%），对 duplication/churn/refactoring-share 类 metric 单独分桶或引入修正因子（Sonar "agentic AI" 门禁先例），防止阈值被动漂移；
5. **Goodhart 防线**：counter-metric 成对（如 S3 单实现抽象率 vs shearing layers 识别）、单一 metric 不决定奖惩、校准节奏固定（90 天窗口 + 年度全量重校准）。

### 3.5 与上游单维决策的一致性（4.1-4.4 可填入矩阵对应行）

- Decision 4.1（S1 语义度量，70% 非 hard rule）→ `S1xMACRO-B` 黄线 0.70 + notes 声明；
- Decision 4.2（事后补写 >90 天 >20% 判红）→ `S2xMACRO-B` 红线 `adr_backdated_gt90d_ratio > 0.2`；
- Decision 4.3（LLM 抽取+人工复核）→ `S4xMACRO-C` 判据 + notes；
- Decision 4.4（单人仓降权+信号不足标注）→ `S5xMICRO-B` notes + 3.3 team-size 桶。

## 调研摘要（per WORKFLOW §4.2.3 / handoff 通用调研要求）

- **baseline 决策回顾**：D-001~D-007（ADR-0001~0007）已读；本矩阵锚定 ADR-0001（5 scale 定义与共享证据/裁决层）与 ADR-0004（S1-S5 定义、"阈值声明为初版参数、预留跨仓校准机制"原文约束）。
- **atomcode 深度调研**（session 22ab58d4，Exa×15+Tavily×4+AnySearch×6，12 篇原文核验）核心结论：行业不存在现成"维度×范围"整体矩阵标准，但构件均有成熟先例，可拼装——单元格结构抄 OpenSSF Scorecard check 定义；阈值校准抄 SIG/Alves 百分位法；schema 抄 SonarQube 门禁三元组 + OSCAL/PromQL/Sloth 声明式 YAML；QMPP 确认为非软件度量标准，不采用。Confidence：框架映射=高，具体阈值数值=中（公开语料有选择偏差，须按自身语料校准——这正是 Deliverable 3 的存在理由）。
- **工业界对标（≥2）**：① OpenSSF Scorecard（check=风险级+计分准则+数据源+分级计分+按风险加权聚合）；② SonarQube quality gate（(metric, operator, error_value) 三元组 + 新旧代码分离 + fudge factor）；③ SIG/Alves 代码质量基准（LOC 加权 70/80/90 百分位 + 年度重校准）；④ Marinescu 分位阈值法（Rule 3：大系统用百分位；CBO=16 误判 65% 的教训）；⑤ CMMI（过程域×成熟度网格先例）与 ISO/IEC 25010（特征×子特征分解）；⑥ SPACE 框架与 DORA（多维成对指标防 Goodhart）；⑦ GitClear 2025 + Cotroneo et al. 2025（AI 代码漂移证据链）。
- **CONTEXT.md 术语对齐**：判据/数据源沿用 S1-S5 词条的"证据源"字段；Micro-B 单元格标 advisory（不进入裁决路径，per Micro-B 词条）；冷启动回退用 `data doesn't show`（Sufficiency Gate 词条）。

## 阻塞

无。Blocked by: None；执行中未遇阻塞（唯一环境事项见 lessons 第 2 条）。

## lessons 候选

1. 机检占位词表必须与领域词表分离：S2 判据中的合法数据源术语 "TODO/FIXME" 被占位检测误报，检测词表收窄为 `待定|TBD|待补充|placeholder` 后通过。
2. 本工作区开工时无 git 仓库，WORKFLOW §4.2.1 的 but 版本控制无法直接执行，先 `but setup --init` 初始化（含 Initial empty commit）并补 `.gitattributes`（eol=lf）后才提交。建议 WORKFLOW 启动前置检查加入"仓库存在性"一项。
3. atomcode 长报告 stdout 截断（正文丢失只剩执行摘要），需 `-c` 续跑 + ctx_search 找回；调研启动词应要求"分节输出、单节 ≤2KB"。

## 引用文件列表

- 必读：`issues/05-25-unit-matrix.md`、`handoffs/05-25-unit-matrix.md`、`spec.md §Decision 4.5`、`WORKFLOW.md §4.2`、`decision-ledger.md A-005`、`docs/adr/0004-strategic-quadrant-five-dims.md`（另参照 `docs/adr/0001`、`CONTEXT.md`）
- 本票产物：`reports/05-report.md`（本文件）、`reports/05-unit-matrix.json`、`reports/05-unit-matrix.schema.json`、`reports/05-matrix-check.mjs`
- 下游消费方（Wave 2）：#01/#02/#03/#04/#14 —— 单维决策按 §3.5 映射填入矩阵对应行

