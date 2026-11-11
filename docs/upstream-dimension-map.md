# 上游到维度的映射表（D-078）

- **版本**：v1.0 定下来——改它要走 PR 评审（同 #50 quadrant-rubric 的做法），改动要评审并在决定记录里留痕。
- **决定**：D-078（2026-09-18 采纳 (c) 先设计、后再实施）＋轮 23 定稿链 D-080~D-084（暂挂两边→用 event_bound 锚，Bot→S5 最终决定，位置→docs/ 单独定，LFX 权重→不加列，交给 rubric 那边按判据定）；把这张表并进来，是后面「接数据工单」（COLLECTOR_DESCRIPTORS 注册＋Macro-B 按表取数）的前置（「并进来」=本地定下来，不是 push/merge——D-080② 勘误在案）。
- **复审**：last_reviewed 2026-10-25 ／ next_review 2026-11-24（D-024 两字段规则；接数据工单一开就复审，谁先到算谁；登记日用 UTC 日——见 docs/versioning.md §4）。本轮逐行复审结论见 §⑤。

## ① 定位和边界

- **`dimension: null` = 隔离墙故意留白，不是故障**（适配层不放业务语义）。映射=业务语义，只能写在本文档和判定面；中间层的 descriptor 保留 `dimension: null`，注释指向本表，代码不改。
- **战略五维（S1–S5）不动**：新信号并进已有的维度，不扩维；没有维度可放的事实=永久排除。
- **映射行怎么写（D-078④）**：每个维度单独列**进入条件**（准入条件；LFX 式，不是全局开关——同一个信号按维度进出，比如 bot 身份在 S4 排除、在 S5 计入）；不许变成 1:1 查表；允许一个事实→(维度, 进入条件) 多值（暂挂两边的行等接数据工单落地时按采集到的数据定，不提前二选一）。
- **分工（本表 vs quadrant-rubric，D-083）**：本表管的是内核怎么接数据（接数据工单要注册 COLLECTOR_DESCRIPTORS＋Macro-B 按表取数＋NN-check 的确定性判据从这里来），**不给宿主 agent 讲故事用、不随 tgz 分发**；叙事证据怎么组织看 `engine/skills/macro-audit/references/quadrant-rubric.md`（D-053）。两个文件各管一摊，不互相抄。

## ② github-rest 映射（adapter=`github-rest-adapter@v1`）

| fact_type | 意思 | dimension | 进入条件 | 备注 |
|---|---|---|---|---|
| `github_rest.pr_summary` | PR 列表行 | S4 | 无 | 交付流事实的底子 |
| `github_rest.pr_metadata`（merge lead time 部分） | 合并前置时长 | S4 | **仅人类 PR（只算人类 PR）**（CHAOSS 规则：bot 提交不算进交付节奏） | Bot 判据=平台声明的 Bot 身份（`user.type=="Bot"`／login `[bot]` 后缀），不自己建启发式 |
| `github_rest.pr_metadata`（Bot 占比部分） | bot 参与密度 | S5（最终决定，D-082） | **措辞固定为「平台声明的 Bot 身份」**（user.type=="Bot"／login [bot] 后缀双检） | S4 备选已排除：快照窗口占比是状态量，不是趋势量（演化归属只给纵向派生 fact，§④ 快照判据）；以后要是派生 bot 占比的纵向趋势 fact（时间序列），它归 S4 还是 S5 到时候再定 |
| `github_rest.pr_metadata`（review 覆盖部分） | review 覆盖 | **pending(event_bound)**——候选是 S5 ↔ S4 两边，**无偏好序（没有偏好顺序）**（D-081） | 挂起锚=registry `github-rest-review-coverage-dimension` | 触发=`pulls.reviews` 移出 `GITHUB_REST_PLANNED_SURFACES`（这块面激活、fact 真产出）那天，接数据工单落地时按采集到的数据定（D-078④）；这块面还是 planned（D-048；GitHub REST 中间层），YAGNI 不破 |
| `github_rest.pr_diff` | diff 两条通道 | Micro-A 消费 | 不直接采进 Macro-B | #48 Micro-A preview 的硬前提=#47 消费侧 |
| `github_rest.rate_limit`／`rate_limited`／`api_error`／`schema_drift`／`resolution`／`run`／`preflight` | 运行状态和遥测 | **永久排除**出 S 维 | —— | rate_limit 明确永久排除（D-078③）；`preflight`=为了防漏先多列（现在没有生产者，先按安全方向列出来——R23 审计勘误：BACKLOG #72 原文写「六类」是票面说法，实现含本项共七类）；同类的运行信号同样处理，防止噪声混进判定 |

## ③ codelore 映射（adapter=`codelore-adapter@v1`）

| 分析项组 | analysis 枚举 | dimension | 进入条件 | 备注 |
|---|---|---|---|---|
| 演化主干 12 | revisions / abs-churn / entity-churn / author-churn / hotspot-velocity / code-age / stale-code / architecture-trend / health-trend / lead-time / release-cadence / messages | S4 | 无 | 演化和交付节奏这一组 |
| s3 族 6 | god-classes / architecture-metrics / dependency-cycles / modularity-violations / instability / architecture-roles | S3 | **#51 两个说法冲突的风险：必须成对 opposing 指标** | 结构这一组 |
| s5 族 12 | ownership / entity-ownership / bus-factor / main-dev / main-dev-by-revs / main-dev-by-deletions / knowledge-islands / communication / coordination-needs / team-composition / marginal-owner-risk / pair-programming | S5 | 无 | 组织和知识分布这一组 |
| explain 族 9 | explain-repo / explain-brief / explain-adr / explain-query / explain-resolve / explain-execute / explain-dryrun / llm-narrative / capability-check（LLM 门控面，`env_family=CODELORE_LLM_*`） | S4 | env 门控不变（没设=不产这一面，不是降级，也不是缺失） | #36 单独票面 |
| behavior 族 | hotspots / coupling / function-hotspots | ——（behavior 象限的一部分，不是 S 维） | Macro-B behavior QuadrantEntry 消费 | D-054③：fact.quadrant=collector 声明的域，归哪个象限由消费它的那一部分决定 |
| 暂时不接的分析项组 | function-coupling / clone-coupling / sarif / effort-exposure / delivery-* 族 | ——（没采集就不映射） | registry `codelore-deferred-faces` manual_watch 激活后再定归属 | D-035④ |

## ④ 进入条件的通用规则

- **进入列不是全局开关**：同一个信号按维度进出（bot 身份在 S4 排除、在 S5 计入——和 LFX 分类规则一个道理）。
- **「平台声明的 Bot 身份」措辞固定**：只以 GitHub API `user.type=="Bot"`／login `[bot]` 后缀为准；不许自己从 commit message/email 猜（CHAOSS 提醒过 bot 污染）。
- **快照不承载演化宣称（D-082③ 通用判据）**：窗口快照统计量（cross-sectional snapshot=状态量/prevalence）不承载 S4 的演化方向宣称；演化归属必须用纵向派生 fact（时间序列）来承载——任何快照 fact 想申请 S4 归属，都要引用本条并拿出纵向派生 fact 的实物。
- **权重不进映射表（D-084）**：本表只管一件事：一条 fact 该往哪个维度走、进门要满足什么条件，不管「进了维度算多重」——权重和强弱的意思归 quadrant-rubric 的判据和判定档，由人定（C 层由人定 / D-026 红线同 D-053 判据渗路由面先例）。LFX 先例：权重只存在 Health Score 汇总里（v2=40/35/25），分类和映射表没有权重列。
- **暂挂两边=中间状态，不是最终状态（D-081④）**：同一个 fact 的不同部分可以各有进入条件（多值合法）；同一个部分同时喂两个维度=重复计数，禁止。暂挂两边的行用 event_bound 挂起锚（registry 事件锚；成员对不对由 72-check C1/C2 检查，引用对不对看 registry `meta.reference_resolution`），到对应接数据工单落地时按采集后的数据定，不提前二选一。
- **永久排除行**：运行状态和遥测事实永远不进判定输入。

## ⑤ 复审和开工

- **复审时点**：next_review 见文首「复审」字段（唯一的日期来源，本行不写死字面值，防止对不上），或者接数据工单一开就触发，谁先到算谁。
- **#43 2026-10-25 逐行复审结论=v1.0 定稿版本零改动**：codelore 四组枚举（演化主干 12／s3 族 6／s5 族 12／explain 族 9）⇔ 判定面常量逐行核对通过（71-check 16/16，含 B7 反向无幽灵映射）；github-rest §② 9 类 fact⇔常量通过（72-check 16/16，含 C1 `pulls.reviews` 仍在 PLANNED_SURFACES⇔review 覆盖行仍 pending）；暂时不接的分析项组那一行仍是 deferred 不映射（registry `codelore-deferred-faces` status=pending，71-check B6）；descriptor `dimension: null` 双保留没被改写（44-check A14/A15）。接数据工单（#71/#72 后续批2）没开=「开票触发」没发生，本轮按到期复查过目，映射行和进入列零改动；本文档复审日期和 `engine/src/audit/upstream-dimension-map.ts` 常量同源（71-check A1 对不上就失败）。
- **接数据工单**（后续实施轮，D-080③ 两张配套的票）：批1=codelore 注册＋Macro-B 按表取数＋「映射常量和表逐行核对」检查脚本（#71）；批2=github-rest opt-in 注册＋消费（#72，没 token 的环境**明确报告 skipped，不算通过**）——以本表 v1.0 本地定下来为两张票之间的前置条件。
- **怎么读这份表（D-080②）**：文档是唯一来源＋判定面映射常量配置块（运行时输入，本表的派生物）＋NN-check 逐行核对检查脚本，防止对不上；descriptor `dimension: null` 双保留。
- **待定项处理（D-078⑤ 待定项全清）**：位置和 quadrant-rubric 要不要合并→**已处理**（D-083 docs/ 单独定）／Bot 占比 S5 vs S4 备选→**已处理**（D-082 S5 最终决定＋定下来）／LFX 权重列补读→**已处理**（D-084 本表没有权重列——权重和强弱属于判据（quadrant-rubric＋C 层人定），不归本表管；LFX 原文印证：权重只在 Health Score 汇总里（v2=40/35/25），分类页没有权重列）／#47 九类事实原文复核→**已完成**（轮 23 开票前就核对过：github-rest 实产 9 类 fact，本表 §② 全覆盖）／GitHub REST 中间层契约全文复读→**已完成**（轮 23 开票前就核对过：最小契约=PR 枚举+元数据+diff 两条通道，review/comment 面仍 planned）。
- **暂挂行的定期检查**（不是待定项）：review 覆盖行 pending(event_bound)=registry `github-rest-review-coverage-dimension`（D-081，触发=`pulls.reviews` 移出 PLANNED_SURFACES）。
- **接数据工单开票时继续问**：Bot 占比宣称强度=只在 S5 辅助说明里带「只算平台声明的 Bot」措辞（进 quadrant 判据与否随接数据工单定，D-082 待定——Nesbitt 提醒 AI-agent 经 PAT 会失真，不要自己建启发式）／权重意思在 rubric 层立项，挂「quadrant-rubric 初版参数起草」触发（D-084④，立项时带一句 LFX v2「人气≠健康」的启示）。
