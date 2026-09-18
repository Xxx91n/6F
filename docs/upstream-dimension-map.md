# upstream → dimension 映射表（D-078）

- **版本**：v0.1 设计稿——版本化走 PR 评审（同 #50 quadrant-rubric 先例），改动须经评审＋决策账本留痕。
- **裁决**：D-078（2026-09-18 采纳 (c) 设计先行、实施排后）；骨架=D-078③ 已裁；本表合入=后续「接线票」（COLLECTOR_DESCRIPTORS 注册＋Macro-B 消费归位）的票间依赖。
- **复审**：last_reviewed 2026-09-18 ／ next_review 2026-10-18（D-024 两字段纪律；接线票立票触发先到者亦复审）。

## ① 定位与边界

- **`dimension: null` = 防腐层故意留白非故障**（ADR-0014：适配层禁业务语义）。映射=业务语义，只能落本文档面＋裁决面消费；适配器 descriptor 保留 `dimension: null`＋注释指针本表，代码面不改。
- **ADR-0004 五维（S1–S5）不动**：facet enrichment 入既有维不扩维；无维可容事实=永久排除。
- **映射行形制（D-078④）**：逐 dimension **准入条件**列（LFX 式非全局开关——同一信号按维出入，如 bot 身份在 S4 准入排除、S5 准入计入）；禁 1:1 退化查表；允 fact→(dimension,准入) 多值（双挂行在接线票落地时按采集数据裁定，不预先二选一）。

## ② github-rest 映射（adapter=`github-rest-adapter@v1`）

| fact_type | 语义 | dimension | 准入条件 | 备注 |
|---|---|---|---|---|
| `github_rest.pr_summary` | PR 列表行 | S4 | 无准入 | 交付流事实底座 |
| `github_rest.pr_metadata`（merge lead time 切片） | 合并前置时长 | S4 | **仅人类 PR**（CHAOSS 纪律：bot 提交不计入交付节奏） | Bot 判据=平台声明的 Bot 身份（`user.type=="Bot"`／login `[bot]` 后缀），不自建启发式 |
| `github_rest.pr_metadata`（Bot 占比切片） | bot 参与密度 | S5 | **措辞锁「平台声明的 Bot 身份」** | S4 备选挂追问留票，下轮可再裁 |
| `github_rest.pr_metadata`（review 覆盖切片） | review 覆盖 | S5 ↔ S4 | **双挂待采后裁定** | 面仍 planned（`pulls.reviews` 在 `GITHUB_REST_PLANNED_SURFACES`），YAGNI 不破 |
| `github_rest.pr_diff` | diff 双通道 | Micro-A 消费 | 不直采 Macro-B | #48 Micro-A preview 硬前置=#47 消费侧 |
| `github_rest.rate_limit`／`rate_limited`／`api_error`／`schema_drift`／`resolution`／`run` | 遥测/运行态面 | **永久排除**出 S 维 | —— | rate_limit 明示永久排除（D-078③）；同族遥测信号同处置，防噪声渗入裁决 |

## ③ codelore 映射（adapter=`codelore-adapter@v1`）

| 面集 | analysis 枚举 | dimension | 准入条件 | 备注 |
|---|---|---|---|---|
| 演化主干 12 | revisions / abs-churn / entity-churn / author-churn / hotspot-velocity / code-age / stale-code / architecture-trend / health-trend / lead-time / release-cadence / messages | S4 | 无准入 | 演化与交付节奏面 |
| s3 族 6 | god-classes / architecture-metrics / dependency-cycles / modularity-violations / instability / architecture-roles | S3 | **#51 双口径风险：须成对 opposing 指标** | 结构面 |
| s5 族 12 | ownership / entity-ownership / bus-factor / main-dev / main-dev-by-revs / main-dev-by-deletions / knowledge-islands / communication / coordination-needs / team-composition / marginal-owner-risk / pair-programming | S5 | 无准入 | 组织与知识分布面 |
| explain 族 | （LLM 门控面，`env_family=CODELORE_LLM_*`） | S4 | env 门控不变（未设=不产面，非降级非缺失） | #36 独立票面 |
| behavior 族 | hotspots / coupling / function-hotspots | ——（behavior 象限切片，非 S 维） | Macro-B behavior QuadrantEntry 消费归位 | D-054③：fact.quadrant=collector 声明域，象限归属=切片决策 |
| 暂缓面集 | function-coupling / clone-coupling / sarif / effort-exposure / delivery-* 族 | ——（未采集不映射） | registry `codelore-deferred-faces` manual_watch 激活后再归位 | D-035④ |

## ④ 准入条件通用纪律

- **准入列非全局开关**：同一信号可按维出入（bot 身份在 S4 准入排除、S5 准入计入——LFX 分类纪律同构）。
- **「平台声明的 Bot 身份」措辞锁**：仅以 GitHub API `user.type=="Bot"`／login `[bot]` 后缀为准；禁止自建 commit-message/email 启发式（CHAOSS bot 污染警示）。
- **双挂行**（S5↔S4）在接线票落地时按采集后数据裁定，不预先二选一。
- **永久排除行**：遥测/运行态事实永不进裁决输入。

## ⑤ 复审与接线

- **复审时点**：next_review 2026-10-18，或接线票立票触发先到者。
- **接线票**（后续实施轮）：COLLECTOR_DESCRIPTORS 注册 dimension 消费面＋Macro-B 报告归位消费——以本表 PR 合入为票间依赖。
- **追问留票**（D-078 登记）：落点 vs quadrant-rubric 并面／Bot 占比 S5 vs S4 备选下轮再裁／LFX 权重列补读／#47 九类事实原文复核（接线票立票前）／ADR-0020 全文复读。
