[warning] 正在以管理员权限运行 — 模型可能可以访问系统文件。
我先召回知识库，再启动三引擎调研。知识库未命中本题直接材料（仅 R28-Q6 的 DLQ 时点研究可复用）。启动第一阶段广泛搜索：审计写失败惯例、DLQ 失败行为、WORM/合规日志、checkpoint 事务边界四个角度并行。Tavily 配额已耗尽，改用 Exa＋AnySearch 双引擎继续。Oracle 已给出关键先例（ORA-02002：审计写失败→被审计语句失败＝fail-closed，但先有 OS spillover 缓冲层）。继续补搜 DLQ、SQL Server/WORM、checkpoint 语义，并抓取原文。继续第二阶段定点深挖：抓取已找到的关键原文（Oracle/SQL Server 审计失败语义、Kafka Streams DLQ 失败处理）＋补充搜索。调研完成（searches ≥14 | angles: Official/Criticism/Comparative/Community/Currency | full reads: 7 | domains: 8+）。输出综合报告。

---

# R28-Q13 调研报告：quarantine 事件写库失败的管线语义

## 1) 执行摘要（Tl;dr）

**推荐 (a) fail-fast，但采用「分层缓冲」的精确形态**（Confidence：高）。工业界三大证据链一致指向：审计域写审计失败的主流惯例是 fail-closed/abort（Oracle ORA-02002 使被审计语句失败、SQL Server `ON_FAILURE=FAIL_OPERATION/SHUTDOWN`、Kafka Streams DLQ 发送失败即停应用防重复），而非静默降级。且 (c) 的「全量内存缓冲＋运行末单事务批写」有业界对应物（Flink 两阶段提交把批写锚在 checkpoint 节拍而非运行末、Oracle 的 OS spillover 缓冲层），说明 (a) 与 (c) 不是互斥：**逐 commit/批次事务写（fact+quarantine 同事务）＋写失败即非零崩溃（归入 D-111 IO 失败类）＋幂等重跑自愈**，既保完整性又避免大仓内存压力。

## 2) 对比矩阵

| 方案 | 审计完整性 | 恒等式可重算 (D-107/D-112) | 可用性代价 | 业界对应物 | 判定 |
|---|---|---|---|---|---|
| (a) fail-fast 硬崩 | 完整（无未落库报告） | 不破 | 磁盘满期间全停 | Oracle ORA-02002、SQL Server FAIL_OPERATION | ✅ 正确基线 |
| (b) 降级工件+继续 | 破（第二证据通道） | 破（库内重算缺项） | 零 | SQL Server CONTINUE（文档自认「可违反安全策略」） | ❌ 合规语境主流之外 |
| (c) 全量内存缓冲+末尾批写 | 完整或全无 | 不破 | 大仓内存压力＋零可见性 | Flink 2PC（但锚 checkpoint 节拍，非运行末） | ⚠️ 需改造为分批 |
| (d) 逐 commit 事务 | 完整（commit 粒度） | 不破 | 最小 | Flink per-checkpoint commit、Spring Kafka 事务性 DLQ | ✅ 作为 (a) 的实现载体 |

## 3) 分角度结论

### 角度① 审计管线「审计写失败」惯例 → **fail-closed 是显式支持的主流，但默认值是 CONTINUE**
- **Oracle**（官方文档，已读 ORA-02002）：统一审计写库失败（表空间满/只读）→ 先溢写到 OS spillover 文件，OS 也满时「user auditable transactions will fail with ORA-02002」——即**审计写失败最终使被审计操作本身失败**。注意结构：先给了一个溢出缓冲层（对应下述 (a)+(c) 混合），缓冲也耗尽才 fail-closed。
- **SQL Server**（官方 CREATE SERVER AUDIT，已读）：`ON_FAILURE = CONTINUE | SHUTDOWN | FAIL_OPERATION` 三态显式可配，文档对 CONTINUE 的评语是「**may allow unaudited activity, which could violate your security policies**」——即降级继续是已知可选项但被官方标注为合规风险；FAIL_OPERATION 的官方推荐语境恰是「maintaining a complete audit is more important than full access」。
- **推论**：工业界把「完整性优先」做成显式选项而非唯一默认（默认 CONTINUE），但对**审计产品**（本仓 charter 是确定性审计 SSOT）文档语义明确指向 FAIL_OPERATION/SHUTDOWN 一侧。

### 角度② DLQ 写失败的惯例 → **fail/stop，绝不静默丢**
- **Kafka Streams 社区参考实现**（tobias-gaenzler 仓，已读）：「When producing to the dead letter topic fails, the application is stopped by the StreamsUncaughtExceptionHandler **to prevent duplicate records**」；handler 里显式 `return FAIL`（「To prevent message loss, we return FAIL if producing to the dead letter topic fails」）。
- **Factor House DLQ 长文**（已读，2026-06/09 更新）：`LogAndContinueExceptionHandler` 被点名为「This is not a DLQ. The record is gone… you may be losing records without knowing it」——**静默降级在 DLQ 生态被当作反模式警示**。
- **Confluent 官方教程**（已读）：uncaught exception 三选项 REPLACE_THREAD / SHUTDOWN_CLIENT / SHUTDOWN_APPLICATION，且明确「error occurs… will not commit」——失败路径与不提交绑定。
- **Spring Kafka**（搜索结果＋Factor House）：DeadLetterPublishingRecoverer 在 retry 耗尽后发布，DLQ 记录走与正常输出**同一事务生产者**，「committed atomically on the next commit barrier — so a DLQ record exists if and only if the rest of that epoch committed」——这是 (d) 的直接先例：**错误事件与主数据同事务**。

### 角度③ append-only/合规日志 write-failure 语义
- **合规面**（LegalClarity 等多源交叉）：HIPAA 2026 趋势是「testable controls」——审计管线必须可被验证「actually capturing events」；(b) 的降级工件意味着审计面在失败窗口内**捕获不到事件**，这正是不完整 audit trail = control failure 的教科书场景。未找到任何主流合规框架把「报告标 degraded」承认为完整审计替代。

### 角度④ checkpoint/事务边界惯例 → **批写不是错，锚点错在「运行末」**
- **Flink 官方博客**（已读，2018 原文）：两阶段提交 sink 把「批」锚在 **checkpoint 节拍**——pre-commit 失败→全 abort 回滚到上一 checkpoint；commit 失败→应用重启重试（「if the commit does not eventually succeed, data loss occurs」是作为**要避免的后果**陈述的）。这正是 (c) 与 (d) 的工业级合体：**分批事务＋失败即失败＋checkpoint 幂等恢复**，而非全量攒到运行末。
- **PostgreSQL 官方 populate 文档＋dba.stackexchange**：逐行 INSERT vs 单事务批写，批写快 10–50×——支持 (d) 以 commit/批为节拍而非逐事件事务。

### 角度⑤ 「幂等重跑使 fail-fast 廉价」的先例与反例
- **支持**：startdataengineering（已读）：幂等管线「rerun after failure without fear」——delete-write/overwrite 模式使重跑是常规操作而非灾难；Prefect 等多源同调。本仓 D-108（run_id+自然键 UNIQUE+INSERT OR IGNORE）正是此形态：崩溃重跑不会重复插入，**重跑成本=一次正常运行**，对小到中仓廉价。
- **反例（如实呈报）**：超大仓全量重跑成本可观；Flink 的应对是 checkpoint resume 而非 from-scratch。反例结论：若单次全量重跑成本不可接受，出路是把事务边界切细（(d) 逐 commit/分批），**而不是**放弃 fail-fast 改用 (b)——(b) 省下的重跑成本以恒等式破产支付。

### 角度⑥ 辩证：(b) 的 degraded 报告 vs (a) 的可用性代价
- 分叉如实写明：**可用性优先域**（如遥测、metrics pipeline）CONTINUE/丢弃是合理默认——SQL Server 默认 CONTINUE 说明业界并非一律 fail-closed。**但**本仓是审计 SSOT 产品：(b) 制造「报告声称 total=N 而库内只有 N-k」的永久性账实分离，恒等式（D-107/D-112 要求三项库内可重算）从结构上破产；degraded 工件是**第二证据通道**，与 D-109（协议级崩溃证据=工件文件）的证据面语义冲突。业界权衡的表述是「完整性 vs 可用性按数据类别选」——审计类数据落完整性一侧。

## 4) 推荐＋理由

**推荐：以 (d) 为载体的 (a)——fact+quarantine 逐 commit（或分批）同事务写，任一 INSERT 失败→整批回滚＋非零退出（归入 D-111 IO 失败类），幂等重跑自愈。**

理由链：①审计写失败 fail-closed 有 Oracle/SQL Server/Kafka Streams 三重独立先例；②DLQ 生态把「错误事件发送失败」处理为 FAIL/stop，静默降级被点名反模式；③(d) 使 fact 与 quarantine 原子一致（Spring Kafka 事务性 DLQ 先例），恒等式在任意崩溃点不破；④幂等重跑（D-108）使 fail-fast 的恢复成本=一次正常运行，反例由分批事务节拍吸收大仓压力；⑤避免 (c) 的两个缺陷（大仓内存、运行末才发现失败），同时继承其全有或全无优点到批次粒度。**若磁盘满等持续性 IO 故障可预期，可借鉴 Oracle spillover：把未落库批次溢写到工件文件作为崩溃证据（D-109 面），但报告仍必须非零退出、绝不产出「声称完整」的报告**——这是 (b) 的唯一可保留残片，且语义是崩溃证据而非降级产物。

## 5) 冲突核查（对决策账本）

| 决策 | 与推荐关系 |
|---|---|
| D-106（SSOT+投影） | ✅ 一致——(b) 会引入第二证据通道破坏 SSOT |
| D-107/D-112（恒等式库内可重算） | ✅ 一致——(d) 同事务保证三桶始终可重算 |
| D-108（幂等 INSERT OR IGNORE） | ✅ 一致——正是 fail-fast 廉价的前提 |
| D-109（崩溃证据=工件） | ✅ 一致——spillover 残片仅作崩溃证据，非降级 |
| D-111（非零退出枚举） | ⚠️ 需确认 quarantine INSERT 失败归入「IO 失败」类（磁盘满/锁/IO 错自然归入；**约束违例**若是 schema bug 则语义上更接近协议崩溃类，建议按具体错误码分流） |
| D-106④（报告=投影） | ✅ 一致——报告不再承载库外事实 |

## 6) 来源清单

| 来源 | URL | 角度 | 贡献 |
|---|---|---|---|
| Oracle ORA-02002 官方错误文档 | https://docs.oracle.com/en/error-help/db/ora-02002/ | Official | 审计写失败→被审计语句失败＋spillover 缓冲先例 |
| Oracle Administering the Audit Trail | https://docs.oracle.com/en/database/oracle/oracle-database/21/dbseg/administering-the-audit-trail.html | Official | 溢写层结构（搜索结果已读要点） |
| SQL Server CREATE SERVER AUDIT (T-SQL) | https://learn.microsoft.com/en-us/sql/t-sql/statements/create-server-audit-transact-sql | Official | ON_FAILURE 三态＋CONTINUE 合规风险官方评语 |
| kafka-streams-dead-letter-publishing (GitHub) | https://github.com/tobias-gaenzler/kafka-streams-dead-letter-publishing | Community/Official-adjacent | DLQ 发送失败→FAIL/stop 防重复 |
| Factor House: DLQ patterns and pitfalls | https://factorhouse.io/articles/dead-letter-queues-kafka/ | Comparative/Criticism | LogAndContinue=丢记录反模式；Spring 事务性 DLQ |
| Confluent: Kafka Streams error handling | https://developer.confluent.io/tutorials/error-handling/kstreams.html | Official | 异常→不提交/停应用选项语义 |
| startdataengineering: idempotent pipelines | https://www.startdataengineering.com/post/why-how-idempotent-data-pipeline/ | Community/Comparative | 幂等重跑先例与成本 |
| Flink 官方博客： TwoPhaseCommitSinkFunction | https://flink.apache.org/2018/02/28/an-overview-of-end-to-end-exactly-once-processing-in-apache-flink-with-apache-kafka-too/ | Official | 批事务锚 checkpoint 节拍＋commit 失败→重启重试 |
| LegalClarity: audit trail federal rules | https://legalclarity.org/compliance-audit-trail-federal-rules-and-retention-periods/ | Official-adjacent/Currency | 不完整 audit trail=control failure 合规面 |
| PostgreSQL populate 文档 / dba.stackexchange | https://www.postgresql.org/docs/current/populate.html | Official/Community | 批写 vs 逐行性能（(d) 节拍依据） |

## 7) 信息缺口

- **Oracle/SQL Server 之外的审计产品**（如 Auditd、AWS CloudTrail）在 sink 写失败时的行为未逐一取证（CloudTrail 文档未抓取原文）。
- 「约束违例」归 D-111 哪一退出类需要本仓 D-111 原文细读定夺（本次未回读账本原文）。
- WORM 域（角度③）只拿到合规侧间接证据（不可篡改性要求），未找到 WORM 存储「写失败即 abort 客户端」的直接规范条文。
- 本仓单次全量重跑的实测耗时数据缺失——「fail-fast 廉价」在本仓大仓场景的成本量化需本地基准（超出本轮只读调研范围）。

**Sufficiency Gate**：searches: 16+（web_search 4＋anysearch batch 12）| angles: Official, Comparative, Criticism, Currency, Community 全五类 | full reads: 7 | gaps: 如上 4 项。核心结论均有 ≥2 独立信源（fail-closed：Oracle+SQL Server+Kafka Streams；批写事务：Flink+Spring Kafka/Postgres；幂等重跑：startdataengineering+Prefect 等多源）。Tavily 本轮配额耗尽，三引擎交叉降级为 Exa+AnySearch 双引擎＋8 域名交叉，关键结论未受影响（均有双源支持）。

继续此会话，运行：atomcode -p "…" --resume 91f41f3e-f3db-4d38-8e29-83e9dd549994
