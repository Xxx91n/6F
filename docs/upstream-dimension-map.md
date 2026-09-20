# upstream → dimension 映射表（D-078）

- **版本**：v1.0 定稿——版本化走 PR 评审（同 #50 quadrant-rubric 先例），改动须经评审＋决策账本留痕。
- **裁决**：D-078（2026-09-18 采纳 (c) 设计先行、实施排后）＋轮 23 定稿链 D-080~D-084（双挂→event_bound 锚化／Bot→S5 终裁／落点→docs/ 独立终裁／LFX 权重→不加列移交 rubric 判据面）；本表合入=后续「接线票」（COLLECTOR_DESCRIPTORS 注册＋Macro-B 消费归位）的票间依赖（「合入」=本地定稿，非 push/merge——D-080② 勘误注记在案）。
- **复审**：last_reviewed 2026-09-19 ／ next_review 2026-10-19（D-024 两字段纪律；接线票立票触发先到者亦复审）。

## ① 定位与边界

- **`dimension: null` = 防腐层故意留白非故障**（ADR-0014：适配层禁业务语义）。映射=业务语义，只能落本文档面＋裁决面消费；适配器 descriptor 保留 `dimension: null`＋注释指针本表，代码面不改。
- **ADR-0004 五维（S1–S5）不动**：facet enrichment 入既有维不扩维；无维可容事实=永久排除。
- **映射行形制（D-078④）**：逐 dimension **准入条件**列（LFX 式非全局开关——同一信号按维出入，如 bot 身份在 S4 准入排除、S5 准入计入）；禁 1:1 退化查表；允 fact→(dimension,准入) 多值（双挂行在接线票落地时按采集数据裁定，不预先二选一）。
- **职责边界（本表 vs quadrant-rubric，D-083）**：本表=kernel 接线契约（接线票 COLLECTOR_DESCRIPTORS 注册＋Macro-B 归位＋NN-check 守卫的确定性判据源），**不供宿主 agent 叙事消费、不随 tgz 分发**；叙事证据组织口径见 `engine/skills/macro-audit/references/quadrant-rubric.md`（D-053）。两文件各持一职、互不并写。

## ② github-rest 映射（adapter=`github-rest-adapter@v1`）

| fact_type | 语义 | dimension | 准入条件 | 备注 |
|---|---|---|---|---|
| `github_rest.pr_summary` | PR 列表行 | S4 | 无准入 | 交付流事实底座 |
| `github_rest.pr_metadata`（merge lead time 切片） | 合并前置时长 | S4 | **仅人类 PR**（CHAOSS 纪律：bot 提交不计入交付节奏） | Bot 判据=平台声明的 Bot 身份（`user.type=="Bot"`／login `[bot]` 后缀），不自建启发式 |
| `github_rest.pr_metadata`（Bot 占比切片） | bot 参与密度 | S5（终裁，D-082） | **措辞锁「平台声明的 Bot 身份」**（user.type=="Bot"／login [bot] 后缀双检） | S4 备选已收：快照窗口占比是状态量非趋势量（演化归属仅限纵向派生 fact，§④ 快照判据）；若未来派生 bot 占比纵向趋势 fact（时间序列），其 S4 归属届时另裁 |
| `github_rest.pr_metadata`（review 覆盖切片） | review 覆盖 | **pending(event_bound)**——候选对 S5 ↔ S4 **无偏好序**（D-081） | 挂起锚=registry `github-rest-review-coverage-dimension` | 触发=`pulls.reviews` 移出 `GITHUB_REST_PLANNED_SURFACES`（面激活、fact 实产）之日，接线票落地按采集数据裁定（D-078④）；面仍 planned（D-048/ADR-0020），YAGNI 不破 |
| `github_rest.pr_diff` | diff 双通道 | Micro-A 消费 | 不直采 Macro-B | #48 Micro-A preview 硬前置=#47 消费侧 |
| `github_rest.rate_limit`／`rate_limited`／`api_error`／`schema_drift`／`resolution`／`run`／`preflight` | 遥测/运行态面 | **永久排除**出 S 维 | —— | rate_limit 明示永久排除（D-078③）；`preflight`=防御性超枚举（当前无生产者，排除向 fail-safe 预列——R23 审计勘误：BACKLOG #72 原文「六类」为票面口径，实现含本项共七类）；同族遥测信号同处置，防噪声渗入裁决 |

## ③ codelore 映射（adapter=`codelore-adapter@v1`）

| 面集 | analysis 枚举 | dimension | 准入条件 | 备注 |
|---|---|---|---|---|
| 演化主干 12 | revisions / abs-churn / entity-churn / author-churn / hotspot-velocity / code-age / stale-code / architecture-trend / health-trend / lead-time / release-cadence / messages | S4 | 无准入 | 演化与交付节奏面 |
| s3 族 6 | god-classes / architecture-metrics / dependency-cycles / modularity-violations / instability / architecture-roles | S3 | **#51 双口径风险：须成对 opposing 指标** | 结构面 |
| s5 族 12 | ownership / entity-ownership / bus-factor / main-dev / main-dev-by-revs / main-dev-by-deletions / knowledge-islands / communication / coordination-needs / team-composition / marginal-owner-risk / pair-programming | S5 | 无准入 | 组织与知识分布面 |
| explain 族 9 | explain-repo / explain-brief / explain-adr / explain-query / explain-resolve / explain-execute / explain-dryrun / llm-narrative / capability-check（LLM 门控面，`env_family=CODELORE_LLM_*`） | S4 | env 门控不变（未设=不产面，非降级非缺失） | #36 独立票面 |
| behavior 族 | hotspots / coupling / function-hotspots | ——（behavior 象限切片，非 S 维） | Macro-B behavior QuadrantEntry 消费归位 | D-054③：fact.quadrant=collector 声明域，象限归属=切片决策 |
| 暂缓面集 | function-coupling / clone-coupling / sarif / effort-exposure / delivery-* 族 | ——（未采集不映射） | registry `codelore-deferred-faces` manual_watch 激活后再归位 | D-035④ |

## ④ 准入条件通用纪律

- **准入列非全局开关**：同一信号可按维出入（bot 身份在 S4 准入排除、S5 准入计入——LFX 分类纪律同构）。
- **「平台声明的 Bot 身份」措辞锁**：仅以 GitHub API `user.type=="Bot"`／login `[bot]` 后缀为准；禁止自建 commit-message/email 启发式（CHAOSS bot 污染警示）。
- **快照不承载演化宣称（D-082③ 通用判据）**：窗口快照统计量（cross-sectional snapshot=状态量/prevalence）不承载 S4 演化方向宣称；演化归属须以纵向派生 fact（时间序列）为载体——任何快照 fact 申请 S4 归属须援引本条并出示纵向派生 fact 实物。
- **权重不进映射表（D-084）**：本表是接线路由契约（fact→哪维+准入），不管「进维算多重」——权重/强弱语义归 quadrant-rubric 判据面与 band 人裁（ADR-0013/D-026 红线同 D-053 判据渗路由面先例）。LFX 先例：权重仅存 Health Score 聚合面（v2=40/35/25），分类/映射页零权重列。
- **双挂=中间态非终态（D-081④）**：同一 fact 不同切片可各有准入（多值合法）；同一切片同时喂两维=双计数泄漏禁行。双挂行以 event_bound 挂起锚化（registry 事件锚＋33-check 一致性断言），在对应接线票落地时按采集后数据裁定，不预先二选一。
- **永久排除行**：遥测/运行态事实永不进裁决输入。

## ⑤ 复审与接线

- **复审时点**：next_review 2026-10-19，或接线票立票触发先到者。
- **接线票**（后续实施轮，D-080③ 两张 sibling 票）：批1=codelore 注册＋Macro-B 归位＋「映射常量与表逐行对账」守卫（#71）；批2=github-rest opt-in 注册＋消费（#72，无 token 环境**显式报告 skipped 不算 PASS**）——以本表 v1.0 本地定稿为票间依赖。
- **消费机制（D-080②）**：文档单源真值＋裁决面映射常量配置块（运行时输入，本表派生物）＋NN-check 逐行对账守卫防 drift；descriptor `dimension: null` 双保留。
- **留票销项**（D-078⑤ 追问留票全销）：落点 vs quadrant-rubric 并面→**已销**（D-083 docs/ 独立终裁）／Bot 占比 S5 vs S4 备选→**已销**（D-082 S5 终裁＋封边）／LFX 权重列补读→**已销**（D-084 本表无权重列——权重/强度语义属判据面（quadrant-rubric＋C 层人裁），不属接线路由契约；LFX 原文印证：权重仅存 Health Score 聚合面（v2=40/35/25），分类页零权重列）／#47 九类事实原文复核→**已毕**（轮 23 立票 gate：github-rest 实产 9 类 fact 本表 §② 全覆盖）／ADR-0020 全文复读→**已毕**（轮 23 立票 gate：最小契约=PR 枚举+元数据+diff 双通道，review/comment 面仍 planned）。
- **挂起行值守**（非销项）：review 覆盖行 pending(event_bound)=registry `github-rest-review-coverage-dimension`（D-081，触发=`pulls.reviews` 移出 PLANNED_SURFACES）。
- **接线票随票追问**：Bot 占比宣称强度=仅 S5 辅助披露带「仅计平台声明 Bot」措辞（进 quadrant 判据与否随接线票裁，D-082 留票——Nesbitt 警示 AI-agent 经 PAT 失真，勿自建启发式）／权重语义 rubric 层立案挂「quadrant-rubric 初版参数起草」触发（D-084④，立案时带 LFX v2「人气≠健康」启示一句）。
