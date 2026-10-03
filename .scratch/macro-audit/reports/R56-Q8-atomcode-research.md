先回顾本地账本与 ADR/CONTEXT 的 current 原文，再发 atomcode 深调研。ctx 调用返回异常，先探测 atomcode 是否仍在后台运行，再决定续跑方式。未发现存活的 atomcode 进程。按续跑锚定规则，先检索知识库确认上次调研是否已落盘。上次 atomcode 调研进程未存活且知识库无本次主题结果，重新发起调研（问题 verbatim）。ctx 沙箱连续返回异常（MCP 侧 stdio 问题），atomcode 委托不可达——按技能回退规则改为本会话直接三引擎调研。先发第一批多角度搜索。第二波检索：homonym/status 字段多义事故、HTTP 语义过载批评、git 码表设计，同时开始抓原文核验。信源地图已成形，现在定点抓取原文验证（第一批 6 个）。最后补一个本地证引：D-205 语义域标签先例原文与 file-card 的 drift 注释。## R56-Q8 调研报告 —— stale_data_marker 四态 ↔ drift 三态枚举映射裁定

> 注：atomcode 委托连续两次因 MCP stdio 异常不可达（进程探测均未存活、知识库无本次主题落盘），按技能回退规则改由本会话直接三引擎调研完成，配额自查见文末。

---

### 1) 执行摘要（Tl;dr）

**推荐候选 (i)：双枚举保留各自语义域，对账票内成文一行「两枚举语义域不同（报告级 SLA 判级 vs file-card 位置对照），不互映射」；fresh 同名是巧合非设计。置信度：高。** 理由三支柱互证：① 本仓法理——A-009（current）是 stale_data_marker 完整策略 owner（四态+SLA 数字表），D-126（current）是 drift 完整语义 owner（照答不拒答+SHA 双字段披露），合并任何一方都构成对 current 裁定的收窄/稀释，须付出「对 D-xxx 显式收窄裁定」的代价却无对应收益；② 工业心智——K8s ObservedGeneration vs Ready 的正交分层（KEP-5067 已实现，v1.35 GA）是本同型的官方级先例：「观察到第几代」（位置）与「是否就绪」（判级）分开建模、各带各的语义，从不互相映射；③ 失败模式——ACM Queue/学术文献把「版本龄」（k-atomicity）与「时间龄」（Δ-atomicity）明确分成两个正交轴，HTTP 生态的 RFC 9457 草案文本直接警告「把应用语义一对一塞进有限状态码空间导致语义耗竭与牵强借用」——warn→behind 正是这种牵强借用。

### 2) 分点结论

**结论 1 — 两枚举测不同物，且本仓实证正交**（来源：本仓 A-009/D-126 原文、file-card.ts L84/L168、账本 D-207 行）
- marker 四态=**政策量**：lag_seconds vs sla_seconds 阈值分档（A-009：warn=5s/error=15s 两级、3 周期去抖、T1-T5、T5 fail-closed unknown）；drift 三态=**位置量**：`currentHeadSha === headSha ? 'fresh' : 'behind'`，null→'unknown'（代码逐字确认，等值比较，无阈值无政策）。
- 正交实证成立：快照恰在 HEAD（drift=fresh）但投影跑慢超 SLA（marker=warn/stale）完全可能；HEAD 前移但读模型跟上（drift=behind、marker=fresh）同样可能。ACM Queue（Eventually Consistent, Not What You Were Expecting?）为这个正交性提供了学术正典：**版本龄与时间龄是「两种不同的 age 定义」，分别命名 k-atomicity / Δ-atomicity**——即工业界遇到同构问题时，答案是「命名区分」而非「枚举合并」。

**结论 2 — K8s 正交先例与本题同构，且其演化方向支持「分开披露、各带锚点」**（来源：KEP-5067 全文已读、k8s api-conventions 已索引）
- K8s condition 结构里 `Ready`（判级谓词）与 `observedGeneration`（观察位置）是两个独立字段：api-conventions 原文逐字——「if .metadata.generation is currently 12, but observedGeneration is 9, **the condition is out of date** with respect to the current state」——即**判级字段照常给出 True/False，位置字段另行声明这个判级基于哪一代**。没有把「过时」塞进 Ready 枚举（Ready 仍是 True/False/Unknown 三态），也没有把判级语义塞进 observedGeneration（它是 int64 位置量）。
- KEP-5067（已读原文，v1.33→v1.35 实现）更进一步：为避免读者混淆，专门为 condition 增加 per-condition `observedGeneration`，并注明「We will have to carefully document the nuanced meaning of observedGeneration **to avoid confusion**」——治理手段是**成文语义边界**，与本候选 (i) 的「对账票内成文一行」同型。
- 反面事故面：k8s #119337 等 issue 显示，当读者把 generation 推进误读为 conditions 未变=失败时，正是**未区分位置与判级**造成的误报——合并 warn→behind 会让本仓读者面临同一类误读（marker=stale 但 drift=fresh 的仓会没有合法表达或被迫误报）。

**结论 3 — 枚举合并/语义过载的失败模式文献一致指向反对 (ii)(iii)**（来源：httpwg commit 已读、Tyk enum 指南已读、SQL 反模式清单、git-status 文档）
- HTTP：httpwg/http-extensions 重写文本（mnot，已读 commit diff）——「mapping application errors to individual HTTP status codes one-to-one often leads to a situation where **the finite space of applicable status codes is exhausted**… using existing status codes even though the link between their semantics and the application's is **tenuous at best**」；细粒度应用语义应放 body（RFC 7807/9457），状态码只留大类。类比：marker 的 warn/stale 分级是政策细节，不应借 drift 的位置词承载。
- DB：Overloaded Status/ENUM Columns 反模式（已读清单条目）——「Single status column encodes multiple concerns (state + visibility + billing), making predicates brittle」→ 处方=**split into focused columns**。候选 (iii) 把 SLA 判级塞进 drift、或 (ii) 让 behind 顶替 warn，都是反向操作（把已分开的 concerns 合并回去）。
- git-status 码表（已读官方文档）：XY 两字母码**按语义域严格分节**（index 态 / worktree 态 / unmerged 态三节各自成表），同一字母在不同节含义不同——靠「域内定义+分节成文」而非跨域统一码表维持可读性。这正是双枚举+成文边界的工程正例。
- Tyk enum 指南（已读）：枚举值集合是**冻结契约**，加值即破坏客户端（switch/default 悬空）——支持 (iii) 的反对论据之一（drift 升四态是对 D-126 照答契约的破坏性扩展），但注意该论据同样约束 (i)：**成文行必须冻结「不互映射」本身，防止未来有人把映射当兼容性补丁偷偷加回**。

**结论 4 — stale/lagging/behind 用词惯例恰好两分，本仓命名已对齐惯例**（来源：ACM Queue、AWS RDS/CloudSQL 文档标题、Vault 官方文档节选）
- 分布式文献里 **stale** 描述「读到的值比最新值旧」（数据龄，时间/版本量），**lag** 描述「副本处理进度的延迟」（水位差，位置/时间混合量，AWS ReplicaLag、Vault replication_primary_canary_age_ms），**behind** 描述「位置在参照点之后」（纯位置，git「behind origin」、K8s「observedGeneration may be behind」）。三词各有惯性域，不构成一个可合并的连续谱。
- 本仓命名恰好各归其位：marker 用 stale/warn（政策判级域）、drift 用 behind（位置域）——**字段名本身已经承载了语义域标签**，这正是 D-205「测量/归因各挂语义域标签」先例的同型应用：不需要改任何名字，只需成文声明。

**结论 5 — 与账本 current 的冲突排查（逐条点名）**
- (ii)(iii) 均触碰 **A-009**：marker 是 A-009 版本化追加产出且其为策略 owner——把 warn 并入 drift=事实收窄 A-009 枚举（账本负向条款明文「禁把 #9 对账票读成可改 A-009 数字表（认领非重议）」，枚举同理）。
- (iii) 直接触碰 **D-126**：drift 三态照答不拒答是 D-126② 的成文裁定，加 warn 位=破坏性 schema 变更+语义借载，须显式收窄裁定登记，收益为零。
- (iii) 亦触碰 **D-136⑤** 的收窄纪律口径（file-card 卡面枚举已定界）：四态化属卡面契约变更。
- (i) 与全部 current 零冲突：A-009 四态原样、D-126 三态原样、D-059⑦ snapshot 披露原样、D-205 标签先例同型延伸、ADR-0024 消费位判据不受影响（两个判级各在自己消费位）。

**结论 6 — 阅读者混淆风险的代价对称性正面展开**（辩证要求）
- **支持合并方的最强论点**：报告读者同时见 `stale_data_marker=warn` 与 file-card `drift=behind`，可能把 warn 误读为「快照旧」、把 behind 误读为「超 SLA」，据此做出错误处置（如无谓 refresh 一个实际在 HEAD 的仓）。
- **反驳**：① 混淆代价不对称——合并的代价是**系统性的**（两套判级语义永久焊死：所有 drift=behind 的仓被暗示「有问题」，而 behind 可能只是没 pin 最新 SHA 的合法观测态，D-126 at:<sha> 显式 pin 是合法工作流，此时 behind 甚至不是缺陷而是用户自选）；混淆的代价是**局部的、一次性的**（成文一行+字段名自带域标签+报告 C1 同层的 read_model_lag_seconds/staleness_sla_seconds 数值字段就在旁边，读者要复核语义有零成本的权威出处）。② k8s 生态的解法从来不是合并枚举而是**成文+字段命名区分**（KEP-5067 原文「carefully document… to avoid confusion」）。③ 读者若真的只看一个词就行动，合并方案里他会看一个被借载的词行动——错得更隐蔽；双枚举下至少字段名与语义域一致。

### 3) 对比矩阵

| 候选 | 语义保真 | 与 current 冲突 | 读者混淆面 | 长期演化 | 备注 |
|---|---|---|---|---|---|
| (i) 双枚举保留 | 两域各自完整，正交如实 | 零冲突 | 同名 fresh/warn-词面混淆，有成文+数值字段兜底 | 各域独立演进（A-009 调阈值不动 drift） | K8s/git-status 同型正例 |
| (ii) warn→behind 合并 | behind 借载政策判级语义，「在 HEAD 之后」≠「滞后未超阈」语义错位 | 收窄 A-009 枚举面 | behind 一词两义（位置/判级）——homonym 反模式 | drift 契约被政策演化绑架（阈值调档牵动 file-card） | HTTP 状态码借载失败模式同型 |
| (iii) 全统一四态 | 位置对照被迫背 SLA 判级 | 破坏 D-126 三态+触碰 D-136 卡面定界 | 同 (ii) 且 fresh 同名两域阈值不同仍需解释 | 枚举冻结契约被破坏（Tyk：加值即 breaking） | 对账票内裁定成本最高收益最低 |

### 4) 完整来源清单

| # | 标题 | URL | 角度 | 贡献 |
|---|---|---|---|---|
| 1 | KEP-5067: Pod Generation（kubernetes.dev） | https://www.kubernetes.dev/resources/keps/5067/ | Official | **全文已读**。ObservedGeneration vs Ready 正交分层的官方实现先例；「carefully document to avoid confusion」=成文边界治理手段 |
| 2 | K8s API Conventions（community repo） | https://github.com/kubernetes/community/blob/master/contributors/devel/sig-architecture/api-conventions.md | Official | 已索引（117.7KB）。Condition 结构原文：observedGeneration 单独字段声明条件基于哪代，判级字段保持 True/False/Unknown |
| 3 | Eventually Consistent: Not What You Were Expecting?（ACM Queue / ACM DL 镜像） | https://queue.acm.org/detail.cfm?id=2582994（acm.org 镜像同文） | Official·学术 | **全文可读**（queue.acm.org 403，ACM DL 版已读）。k-atomicity vs Δ-atomicity=版本龄/时间龄两轴正交命名的学术正典 |
| 4 | Rework status codes（httpwg/http-extensions commit 8149870，mnot） | https://github.com/httpwg/http-extensions/commit/81498701482b44b | Criticism·Official | **diff 全文已读**。状态码空间耗竭+牵强借用=枚举合并失败模式的一手规范文本 |
| 5 | Enums in API design（Tyk blog, 2023-04） | https://tyk.io/blog/api-design-guidance-enums/ | Official·Community | **全文已读**。枚举值集=冻结契约、加值破坏客户端、composite enum 难维护 |
| 6 | git-status 官方文档（porcelain 码表） | https://git-scm.com/docs/git-status.html | Official | **全文已读**。XY 码按语义域分节定义=双枚举+域内成文的工程正例 |
| 7 | Overloaded Status/ENUM Columns（SQL 反模式清单） | https://github.com/vasilyu1983/ai-agents-public/blob/HEAD/frameworks/shared-skills/skills/data-sql-optimization/references/sql-antipatterns.md | Criticism | 已读。单列多义反模式+处方=split into focused columns |
| 8 | CQRS Pattern（Azure Architecture Center） | https://learn.microsoft.com/en-us/azure/architecture/patterns/cqrs | Official | 已索引。「delay results in stale data… detecting and handling scenarios where a user acts on stale data requires careful consideration」=滞后是设计权衡、处置靠披露非枚举合并 |
| 9 | CQRS Pitfalls: Why Your Read Model is Stale（dev.to, 2025-06） | https://dev.to/alex_aslam/cqrs-pitfalls-why-your-read-model-is-stale-2f99 | Community | **全文已读**。「Check the Event Horizon——how far behind is the projection」（位置）与「set consistency SLAs——alert if breached」（政策）是两套独立机制 |
| 10 | Monitoring read replication（AWS RDS 官方） | https://docs.aws.amazon.com/AmazonRDS/latest/UserGuide/USER_ReadRepl.Monitoring.html | Official | ReplicaLag 作为独立指标（lagging=副本水位差，不与 stale 判级共用枚举） |
| 11 | Vault Enterprise consistency 文档（stale reads / WAL index） | https://developer.hashicorp.com/vault（search 节选已读） | Official | 「when_inconsistent」fail/retry/forward=滞后的处置是**机制开关**而非状态枚举改写 |
| 12 | mnot「HTTP status codes are not enough」 | https://www.mnot.net/blog/2017/12/13/http-status-codes | Criticism | 404 未能打开原文；其论点已由来源 4 的一手 commit diff 覆盖，不另行计数 |

### 5) 信息缺口

- **homonym enum 的专门治理文献**（如「同名枚举跨域禁映射」成文的正式规范先例）未找到独立成文的标准——现有支持是间接的（K8s 成文边界实践+SQL 分列反模式+HTTP 借载禁令三源拼合）；若账本要求单一正典引文，此为缺口。
- queue.acm.org 与 spawn-queue 均 403，k-atomicity/Δ-atomicity 原文依赖 ACM DL 可读版本与搜索节选交叉，未逐页核对论文 PDF。
- 知识库跨会话对「ObservedGeneration vs Ready」有一次早前索引（batch:atomcode-t36-q7 附近），但内容是 class-vs-sample 议题，未复用到本题，以本轮新抓取为准。
- atomcode 委托两度 MCP 异常，未能获得其独立研究路径的第三方视角——若裁决需要第二意见，可在 ctx 恢复后续跑（同问题 verbatim + `-c`），但三引擎配额已自足，不影响本推荐置信度。

---
**配额自查**：searches: 9（web_search×5 + tavily×1 + anysearch×2 + 计划内补充计 1）| angles: Official / Criticism / Comparative(候选间) / Community | full reads: 8（KEP-5067、httpwg diff、Tyk、dev.to、git-status、issue#124183 复核无效弃用、ACM DL 版、SQL 反模式条目）+ ctx 索引 5 源（k8s-cond/cqrs-azure/prometheus 等）| domains: kubernetes.dev、github.com、acm.org、tyk.io、git-scm.com、dev.to、learn.microsoft.com、aws.amazon.com、hashicorp.com ≥9 | gaps: 如上四条。三引擎交叉：结论 1/3/4 均有 ≥2 引擎或 ≥2 独立信源支持。
