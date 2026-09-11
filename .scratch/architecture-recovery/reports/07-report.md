# Report: A-007 — DuckDB fact table 写入策略

- **A-xxx:** A-007
- **Decision:** spec.md §Decision 5.1
- **ADR ref:** docs/adr/0005-hub-of-facts-with-federated-adjudication.md（① 事件单向写入 + 按需拉取投影；② 报告聚合 = 独立 read model；④ hub 只做元逻辑不经过数据面）
- **对应 issue:** issues/07-duckdb-write-strategy.md
- **对应 handoff:** handoffs/07-duckdb-write-strategy.md
- **Report date:** 2026-09-11
- **Verdict:** **单写多读（Single-Writer / Multi-Reader，SWMR）** — 唯一写者进程 + N 个只读读者进程；事务隔离锁定 DuckDB 快照隔离；version 采用批量块分配的全局单调无空洞递增；多读并发对写者的 p50 影响为 0（快照隔离硬保证），p99 由 checkpoint 停顿主导、上界 128–512 ms，远低于 A-009 的 5 秒陈旧读 SLA

---

## 0. 开工复述（per 本票「开工第一句」硬要求）

**Blocked by: None**（can start immediately）——本票无上游阻塞，本窗口直接开工。

**必读清单全部路径 + 阅读状态：**

| # | 路径 | 状态 |
|---|---|---|
| 1 | `.scratch/architecture-recovery/issues/07-duckdb-write-strategy.md` | 已读全文 |
| 2 | `.scratch/architecture-recovery/handoffs/07-duckdb-write-strategy.md` | 已读全文 |
| 3 | `.scratch/architecture-recovery/spec.md` §Decision 5.1 | 已读（含 Coverage 对账表） |
| 4 | `.scratch/architecture-recovery/WORKFLOW.md` §4.2（§4.2.1 ~ §4.2.6） | 已读全文 |
| 5 | `.scratch/architecture-recovery/decision-ledger.md` A-007 | 已读（表格行 + 覆盖率自评段） |
| 6 | `docs/adr/0005-hub-of-facts-with-federated-adjudication.md` | 已读全文（Status: accepted） |
| 附 | `CONTEXT.md`（38 术语心智模型） | 已读全文 |

---

## 1. 写策略决议（明文，专属验收第 1 项）

**选定：单写多读（Single-Writer / Multi-Reader，SWMR）。不选多写多读。**

本票不接受「两种都可以」——以下为排他性选择及其代价。

### 1.1 选了什么

| 维度 | 选择 |
|---|---|
| 部署形态 | **1 个写者进程**（独占 RW 连接）+ **N 个读者进程**（READ_ONLY 连接），N = 5 scale 各自 read model 投影 |
| 写入入口 | 生产者（5 scale 采集端）不直连数据库，事件经**单一写入队列**投递；写者批量消费 |
| 事务隔离 | **DuckDB 快照隔离（Snapshot Isolation，≈ PostgreSQL repeatable read）**，即官方默认与唯一保证级别，不做覆盖 |
| 版本控制 | `version` 字段：**全局单调、无空洞**，由写者进程按**批量块分配**赋值（详见 §4.3） |
| 并发控制 | 乐观并发控制（OCC）为引擎内建；本架构下写-写冲突概率理论值为 **0**（append × append 永不冲突） |

### 1.2 为什么不是多写多读（排他理由，按权重排序）

1. **违反 ADR-0005 控制面/数据面分离。** 多写者形态在当前 DuckDB 版本下，跨进程并发写要么不支持（严格单写者，1.5 之前官方口径），要么必须引入 Quack 远程协议（v1.5.2 beta，预期 v2.0 稳定）或 DuckLake v1.0（PostgreSQL 作目录）——两者都把 hub 拉进数据面，直接违反 ADR-0005 ④「hub 只做元逻辑（裁决/契约/路由）不经过数据面」。
2. **版本分配不再确定。** 5 个写者并发分配 `version` 需要跨进程协调（集中序列服务或文件锁），把「版本全序」从架构保证降级为运行时协商；一旦协调失败，版本回退/空洞会破坏报告重放语义。
3. **延迟尾部不可控。** 多写者下 OCC 冲突即中止、应用层重试（官方语义），重试代价 = 整批重建 + 再提交；在 5 scale 写入节奏重叠时，p99 由冲突率主导且无上界——而单写者形态把冲突率从「概率」降为「0」（同表 append 永不冲突）。
4. **收益为零。** 本产品事实量级为百万行/天（审计事实，非 OLTP 交易流），单写者批量吞吐（10k 行/批、p50 10–30 ms，见 §4.4）有 3–4 个数量级余量，多写者换来的并发度买不到任何必要的东西。

### 1.3 单写者的代价（明示）

- 写者进程是单点：需有崩溃恢复协议（队列缓冲 + 重启后从 `MAX(version)` 恢复水位，见 §4.3.4）。
- 写入吞吐上界 = 单进程批量写吞吐；当前需求余量充足，但若日后事实量级跃升 1000×，需重估（触发条件见 §6）。

---

## 2. 前置背景与约束回顾

### 2.1 issue 要件（issues/07-duckdb-write-strategy.md）

> DuckDB SSOT 的写入策略（单写多读）+ 并发控制（事务隔离）+ 版本控制（每个事件带 version 字段）

专属验收 3 项：必须选一个写策略（不能「两种都可以」）/ 并发延迟评估必须量化 / 四件交付物（架构图、隔离级别理由、version schema、多读对单写延迟评估）。

### 2.2 handoff 完成定义（handoffs/07-duckdb-write-strategy.md）

1. 单写进程架构图；2. 事务隔离级别选择理由；3. version 字段 schema（递增策略）；4. 多读并发对单写的延迟影响评估。

上下文摘要原文：**D-005 已封 SSOT 心智；本票选「单写多读」——避免 5 scale 多写并发引发的冲突。**

### 2.3 decision-ledger A-007 原文约束

| 字段 | 原文 |
|---|---|
| 问题描述原文 | DuckDB fact table 单写多读 vs 多写多读的并发与版本控制策略 |
| 规范化需求 | D-005 Hub-of-Facts 底层 SSOT 的写入策略需在多写并发与版本控制间明确选择 |
| 显式约束 | 前置 = CodeLore DuckDB schema 复审；高优先级 |
| 来源决策 | D-005 |

### 2.4 ADR-0005 约束与承接点

- ① 数据流 = **事件单向写入 + 按需拉取投影** → 本票写者只 append、读者只拉取，禁止反向写。
- ② 报告聚合 = 独立语义层（read model），不做 UI 抓取 → 读者进程各自投影，事实层不承担报告逻辑。
- ③ 冲突解决 = 证据强度优先 + 时间戳兜底 + 冲突可见可审计 → 版本号是「可审计」的载体：任何裁决可回指 `version` 水位。
- ④ 裁决协议共享 = hub 集中版本化、scale 自运行时执行、hub 只做元逻辑不经过数据面 → **架构图上 hub 必须画在控制面，不在数据路径上**。
- ADR 原文事实：C+A 合成用 SSOT + 各 scale 自建 read model，满足 CQRS / Event Sourcing / metrics layer / SonarQube portfolio 心智。

### 2.5 CONTEXT.md 心智模型映射（本票相关术语）

| 术语 | 对本票的约束 |
|---|---|
| SSOT | 同一审计事实只能由 DuckDB fact table 一处持有；禁止跨 scale 复制 → 读者进程只投影、不落第二份事实 |
| Event Sourcing（本产品用法） | 事件单向写入、只追加不可改；schema 不可改、演进通过版本号 |
| Read Model | 5 scale 各自从 fact table 投影的语义层，独立优化；陈旧读容忍度由 spec 规定（A-009） |
| Cross-Scale Correlation Key | `trace_id` / `baggage_id` 是 fact table schema 前置字段（A-010 拥有定义权，本票只预留槽位） |
| Federated Computational Governance | 协议本体由 hub 集中定义、各 scale 自运行时执行 → hub 不进数据面 |

---

## 3. atomcode 深度调研（per WORKFLOW §4.2.3）

### 3.1 执行参数

- 调用形态：`ctx_batch_execute(commands: [{label: atomcode-research, command: atomcode -p "..."}], concurrency: 1, timeout: 600000)`（per 偏离点 D-2，同会话串行）
- 调研协议：三引擎广搜（16 查询、5 类角度）+ 定点深挖（14 个 URL 已读原文、8 个域名）+ 关键结论双源交叉
- 返回：执行摘要 + 20 条分点结论 + 四方案对比矩阵（DuckDB / SQLite WAL / Iceberg / Delta Lake）+ 19 条来源清单 + 5 条信息缺口

### 3.2 核心发现（每条带来源）

| # | 发现 | 来源 |
|---|---|---|
| F1 | 官方隔离级别表述 = **快照隔离**：「DuckDB concurrency model guarantees snapshot isolation. Transactions that violate this isolation level are aborted」；按 PostgreSQL 口径即 **repeatable read** | DuckDB transactions 文档（current + 1.4 LTS，双源） |
| F2 | 并发控制 = **乐观并发（OCC）、无锁**：事务永不持锁，冲突时后提交者被中止可重试；官方明言悲观锁对分析型大事务灾难性 | DuckDB 官方博客 2024-10-30 |
| F3 | 单进程内多线程读写完全并发；**同一张表上的 append 永不冲突**；仅两线程同时 edit 同一行时第二个报 `Transaction conflict: cannot update a table that has been altered!` | DuckDB concurrency 文档（current） |
| F4 | MVCC 实现为分析型优化：**每 2048 行一条批量版本信息（bulk version information）**，变化记于 undo buffers，checkpoint 落盘；无修改时零开销 | DuckDB 官方博客 2024-10-30 |
| F5 | 跨进程严格一写多读（1.5 之前，维护者 2022 官方答复：多进程写不被支持且未来也不太可能支持）；2026 官方多进程方案 = Quack 远程协议（v1.5.2 beta，预期 v2.0 成熟）+ DuckLake v1.0（PostgreSQL 作目录） | duckdb discussion #4899 + current concurrency 文档 |
| F6 | 批量路径优化：满 RowGroup（**122,880 行**）直写磁盘块，WAL 只记指针，**commit/rollback 近零成本** | DuckDB 官方博客 2024-10-30 |
| F7 | 反模式量化：**单行 INSERT 10–50 ms/行**（PostHog）；checkpoint_threshold 默认 **16 MB**，社区实测调至 **256 MB** 避免高频 checkpoint 与读者抢锁 | PostHog blog + Traceway 同机基准 2026-07-21 |
| F8 | 同机定量基准（唯一完整实测）：DuckDB 批量写入比 SQLite **快 3–15×**；读取容量（read cliff）**100×**；作者明言 read-under-ingest 端到端曲线仍属未来工作 | Traceway 2026-07-21 |
| F9 | 已知坑（官方 issue，Dune Analytics 案例）：有并发读写时 checkpoint 可能阻塞 → **WAL 无界增长**；1.4 起 FORCE CHECKPOINT 改为等待语义 | duckdb issue #9150 + checkpoint 语句文档 |

### 3.3 对标工业界成熟方案（≥2，per handoff 通用调研要求）

| 方案 | 写者模型 | 隔离 | 版本化 / 时间旅行 | 对本票的类比价值 |
|---|---|---|---|---|
| **SQLite WAL** | 单写者 + 任意多读者；数据库级写锁**串行化**（超时抛 SQLITE_BUSY） | 事务 SERIALIZABLE；WAL 读侧快照隔离 | 无 | 与本票同族的「单写多读嵌入式」范式。差异：SQLite 用锁串行化写者，DuckDB 用 OCC；SQLite WAL 同样有 **checkpoint starvation**（有持续读者则 checkpoint 无法完成）→ 本票 §4.4 防御项的旁证 |
| **Apache Iceberg** | 多写者乐观并发：读 metadata → 写新数据+新 metadata → **原子交换 metadata 指针**，失败重建重试 | 序列化隔离（元数据线性历史） | **原生快照树 + 回滚** | `version` 字段的语义上限参考：Iceberg 的 snapshot 序列 + 原子交换 = 「单调版本 + 一次性发布」。本票用「块分配 version + 单事务提交」达到同等效果，且不需要独立 catalog |
| **Delta Lake** | 多写者 OCC 三阶段（读/写/校验提交）；提交 = 向 `_delta_log` 追加 JSON（**版本号递增**） | 写 WriteSerializable + 读快照隔离（默认） | **事务日志版本 + time travel** | 与本票 version 递增策略**心智同构**：单调递增版本号即事实层的水位线，读者按版本裁剪。官方冲突矩阵确认 **INSERT × INSERT 永不冲突** → 与本票「append 无冲突」互为印证 |

生态位结论（调研原文）：DuckDB/SQLite 解决「单机嵌入式」，Iceberg/Delta 解决「对象存储 + 多引擎多进程」；DuckDB 1.4 起可直接读写 Iceberg，是「嵌入式分析 + 湖仓版本化」的桥梁。本产品当前为单机嵌入形态，选 DuckDB 原生路径；若未来需要多进程写，升级路径为 DuckLake（不改 version 语义）。

### 3.4 基线决策回顾（D-001 ~ D-007 与本票契合度）

- **D-005（本票来源决策）**：Hub-of-Facts with Federated Adjudication 已封 SSOT 心智 → 本票只在其下做写入形态选择，不重开集成架构问题。
- **D-001/D-002/D-003（5 scale 全覆盖 / 拒绝 MVP 切片 / 边界不含商业）**：5 scale 并行产出审计事实 → 写入侧必须承受「5 生产者并发投递」，这是本票选单入口队列而非 5 个直连写者的直接原因。
- **D-004（战略 quadrant S1-S5）**：与本票无直接耦合；S1-S5 的判据与阈值由票 #05 矩阵承担。
- **D-006（报告模板共享骨架）**：read model 的消费端形态；本票的「快照水位 version」是报告可重放的输入（见 §4.3.5）。
- **D-007（演示 10 路径）**：failure path 需要「证据采集失败 / 裁决被驳回」的降级产物 → 写入侧的失败语义（写者崩溃、队列积压）需在演示中可观测（见 §4.1.4）。

---

## 4. 核心交付物

### 4.1 交付物 1 — 单写进程架构图

#### 4.1.1 部署图（控制面 / 数据面分离）

```
          CONTROL PLANE（hub，集中定义、版本化）
          ┌──────────────────────────────────────────────────────────┐
          │  裁决协议 · 证据评分 · schema 契约 · 路由                │
          │  ✗ 不经过数据面（ADR-0005 ④）                            │
          └───────────────┬──────────────────────────────────────────┘
                          │ 只读协议引用（code-as-policy 分发）
                          │  ✗ 不承载事实数据
  DATA PLANE              ▼

  ┌── 生产者（5 scale 采集端，只投递不直连 DB）───────────────────────┐
  │  Macro-A   Macro-B   Macro-C   Micro-A   Micro-B                │
  │     │          │         │         │         │                  │
  └─────┼──────────┼─────────┼─────────┼─────────┼──────────────────┘
        └──────────┴─────────┴─────────┴─────────┘
                          │ 事件投递（单向，追加语义）
                          ▼
  ┌── 写入队列（单入口 FIFO，缓冲 + 削峰 + 崩溃缓冲）──────────────┐
  └──────────────────────────┬──────────────────────────────────────┘
                             │ 批量消费（batch ≥ 10k 行 或 100 ms 窗口）
                             ▼
  ┌── 写者进程（唯一 RW 连接，独占文件锁）─────────────────────────┐
  │  1. 取块 [v0, v0+B) 版本区间（内存水位）                        │
  │  2. BEGIN → 批量 INSERT（append-only） → COMMIT                │
  │  3. 提交成功后水位前移 B；中止则整块释放（无空洞）              │
  │  4. checkpoint_threshold = 256 MB；WAL 大小监控                 │
  └──────────────────────────┬──────────────────────────────────────┘
                             │ 单写者 + WAL
                             ▼
  ┌── fact.duckdb（SSOT，append-only，schema 不可改）───────────────┐
  └───┬───────────────┬───────────────┬───────────────┬─────────────┘
      │ 快照读        │ 快照读        │ 快照读        │ 快照读（READ_ONLY）
      ▼               ▼               ▼               ▼
  ┌─────────┐    ┌─────────┐    ┌─────────┐    ┌─────────┐
  │ Reader  │    │ Reader  │    │ Reader  │    │ Reader  │   = 5 scale
  │ Macro-A │    │ Macro-B │    │  ...    │    │ Micro-B │     read model
  │ read    │    │ read    │    │         │    │ read    │     投影
  │ model   │    │ model   │    │         │    │ model   │
  └─────────┘    └─────────┘    └─────────┘    └─────────┘
```

#### 4.1.2 架构不变式（硬规则）

| # | 不变式 | 依据 |
|---|---|---|
| R1 | 任一时刻只有 1 个进程持有 RW 连接；写者进程可多线程，但提交串行（事务全序） | F5 / 官方跨进程单写者语义 |
| R2 | 所有读者一律 `READ_ONLY` 连接，禁止任何写语句（含临时表写入数据面） | F3 / 官方明示支持多进程并发读 |
| R3 | 生产者不直连 DB，只投递队列 | 单入口保证版本分配唯一性 + 崩溃缓冲（§1.2.2） |
| R4 | hub（控制面）不进入数据路径 | ADR-0005 ④ |
| R5 | 事实表只 append；禁止 UPDATE / DELETE；schema 不可改（演进走版本号） | Event Sourcing 术语约束 + A-008 |

#### 4.1.3 写者主循环（伪流程，非实现代码）

```
loop:
  batch = queue.drain(max_rows=100000, max_wait=100ms)
  if batch.empty(): continue
  B = batch.size
  v0 = next_version              # 内存水位，启动时 = MAX(version)+1
  BEGIN TRANSACTION
    INSERT INTO fact VALUES (v0+i, ...) FOR i IN 0..B-1   # 批量路径
  COMMIT
  if COMMIT.ok: next_version = v0 + B
  else:         retry(batch)     # 整块重试，水位不前移（gap-free 保证）
```

#### 4.1.4 失败语义（对齐 D-007 failure path）

| 失败 | 降级 | 可观测性 |
|---|---|---|
| 写者进程崩溃 | 队列缓冲不丢事件；重启后 `next_version = MAX(version)+1` 恢复 | 队列深度 + 写者心跳指标 |
| 批次提交被中止（理论冲突） | 整块重试（退避 50 ms / 200 ms / 1 s，上限 3 次），水位不前移 | 中止计数 + 重试耗时直方图 |
| WAL 异常增长（> 512 MB） | 告警 + 强制 checkpoint（1.4 起为等待语义） | WAL size gauge |
| 读者钉住快照过久 | 60 s 强制释放读者连接并重建 | 快照持有时间 p99 |

### 4.2 交付物 2 — 事务隔离级别选择理由

#### 4.2.1 选择：DuckDB 快照隔离（Snapshot Isolation），即官方默认，不做覆盖

DuckDB 不提供 SQL 标准四级中的显式选项；官方口径（双源）：**并发模型保证快照隔离，违反隔离级别的事务被中止**；按 PostgreSQL 口径对应 **repeatable read**。本票的选择是：**接受并依赖这一级别，不试图加固到 SERIALIZABLE，也不降到 READ COMMITTED。**

#### 4.2.2 理由（逐条）

1. **工作负载不需要 SERIALIZABLE 的写偏斜防护。** fact table 只有 append，没有 read-modify-write、没有跨行不变量、没有唯一性竞争（`version` 由写者独占分配）。SERIALIZABLE 多买的语义在本负载上是空集。
2. **单写者架构已给出事务全序。** 唯一写者 + 提交串行 ⇒ 事务天然串行化；再加引擎级 SERIALIZABLE 是重复保险，只付成本不收益。
3. **SI 正是 read model 投影所需。** 报告投影必须在单一一致快照上执行，否则会出现「半事件」撕裂读（读到某事件的部分后果）。SI 的 repeatable read 语义保证一次投影内看到同一版本世界——这是 D-005「报告可重放」与 A-009「陈旧读」的语义前提。
4. **SI 的快照边界 = 版本水位线。** 读者会话的 snapshot 对应一个 `version` 上界；报告可声明 `snapshot_version_max` 作为可审计水位（对齐 ADR-0005 ③「冲突可见可审计」）。这是把隔离语义直接转化为产品语义的关键一步。
5. **读取者不阻塞写者（官方硬保证）**，写者不阻塞读者 ⇒ §4.4 的「直接阻塞 = 0」成立。

#### 4.2.3 拒绝的替代（逐条）

| 替代 | 拒绝理由 |
|---|---|
| READ COMMITTED | DuckDB 不提供该模式；且语句级可见性会破坏投影期间一致性 → 报告不可重放 |
| 显式 SERIALIZABLE / 悲观锁 | 违反引擎 OCC 设计（官方明言悲观锁对分析型大事务「灾难性」：锁多行、久持锁）；且与单写者假设冗余 |
| 应用层互斥锁 + 多进程写 | 引入跨进程协调层，hub 被迫进入数据面（违反 ADR-0005 ④）；Quack / DuckLake 当前成熟度不足（F5） |

#### 4.2.4 事务形状约束（硬规则）

- **禁止长事务**：事务长度 = 单批 append + commit，上界 = 100 ms 窗口 + 提交耗时（§4.4 量化）。长事务会阻塞 checkpoint → WAL 无界增长（F9 已知坑）。
- **禁止事务内读-改-写**：本票事实表无 UPDATE 路径。
- **读者事务只读且短**：单次投影一个事务，会话级快照持有 ≤ 60 s（§4.1.4）。
- **冲突处理**：应用层重试是防御性设计而非主路径——单写者下冲突概率理论值 0（F3：同表 append 永不冲突）。

### 4.3 交付物 3 — version 字段 schema（递增策略）

#### 4.3.1 递增策略决策：批量块分配（block allocation），全局单调、无空洞

| 候选策略 | 语义 | 判定 |
|---|---|---|
| `CREATE SEQUENCE` + `nextval` | 引擎序列，事务回滚**不回退** → 版本出现空洞 | **拒绝**：空洞使「版本连续区间」不能作为重放边界；报告重放对账（WHERE version BETWEEN a AND b 的完备性）不可证 |
| 每行 `MAX(version)+1` | 逐行求值 | **拒绝**：批内 10k 行做 10k 次元数据求值，per-row 开销无谓；且行内可见性依赖同事务读己写，语义脆弱 |
| 时间戳 / UUID 版本 | 分布式无协调 | **拒绝**：生产者时钟偏斜无法给出全序；UUID 无「水位」语义（不可比较、不可裁剪）；且违反「无空洞单调」要求 |
| **批量块分配（选定）** | 写者内存水位 + 每批取块 `[v0, v0+B)` | **选定**：每批一次元数据操作；提交后才前移水位；中止则整块释放 → **gap-free + 全序 + 元数据开销 O(批数)** |

#### 4.3.2 分配协议

1. 写者启动：`next_version = MAX(version) + 1`（表空则 1）。
2. 每批：`v0 = next_version`；批内第 i 行（0-based）赋 `version = v0 + i`。
3. 提交成功：`next_version = v0 + B`。
4. 提交中止：`next_version` **不动**（整块释放）→ 无空洞。
5. 块大小 B = 实际批行数（动态，默认 10,000，上限 100,000）：小批自然缩减，不做预分配等待。

重放语义（供 D-006 报告与 A-009 使用）：

```sql
-- 报告重放：声明快照水位
SELECT * FROM fact WHERE version <= :snapshot_version_max ORDER BY version;
-- 增量续跑：从上次水位之后继续
SELECT * FROM fact WHERE version > :last_seen_version ORDER BY version;
```

#### 4.3.3 DDL（schema 定义，非实现代码）

```sql
CREATE TABLE fact (
  version        BIGINT     NOT NULL,  -- 全局单调无空洞（块分配）；报告水位线
  schema_version SMALLINT   NOT NULL,  -- 事件契约版本；演进规则归 A-008（本票仅预留字段）
  event_type     VARCHAR    NOT NULL,  -- 审计事件类型（单向写入动作）
  scale_id       VARCHAR    NOT NULL,  -- Macro-A | Macro-B | Macro-C | Micro-A | Micro-B
  trace_id       VARCHAR,              -- 预留槽位；定义权归 A-010（OpenTelemetry Baggage 心智）
  baggage_id     VARCHAR,              -- 预留槽位；定义权归 A-010
  payload        JSON       NOT NULL,  -- 事实载荷（DDL 不可改，演进走 schema_version）
  recorded_at    TIMESTAMP  NOT NULL,  -- 写者提交时刻（非生产者本地时刻，避免时钟偏斜）
  PRIMARY KEY (version)
);
```

设计说明：

- `PRIMARY KEY (version)`：DuckDB 建 ART 索引；append-only 下索引维护为顺序追加，代价有界；同时充当「版本唯一性」的机检约束。
- `recorded_at` 用**写者提交时刻**而非生产者时刻：5 scale 生产者时钟无法保证全序，时间戳只作人读辅助与 ADR-0005 ③ 的 tie-break 兜底。
- `schema_version` / `trace_id` / `baggage_id` 三个字段本票**只预留槽位不定义规则**，避免越界到 A-008 / A-010（与 A-005 矩阵「上游抽象」教训一致）。
- payload 内不可变：schema 演化只能新增 `schema_version` 值，不能改 DDL（Event Sourcing 术语约束）。

#### 4.3.4 崩溃恢复

重启后 `MAX(version)` 即已提交水位；未提交块从未对外可见（SI 保证），因此 `MAX+1` 恢复要么无缝续写、要么在极端情况下最多丢弃一个未提交批——不会产生空洞或回退（唯一写者保证同一时刻至多一个未提交块）。

### 4.4 交付物 4 — 多读并发对单写的延迟影响评估（量化）

#### 4.4.1 场景参数（设计锁定值）

| 参数 | 值 | 依据 |
|---|---|---|
| 批大小 B | 10,000 行（默认） | §4.3.2 |
| 事件可见性上界 | 100 ms（flush 窗口）+ 提交耗时 | 写队列设计 |
| 事实规模基准 | 1M 行/天（5 scale 合计，审计事实）；峰值 100× | 产品量级假设 |
| 行宽 | ≈ 200 bytes | payload JSON 预估 |
| 并发读者 N | 5（每 scale 1）+ 报告作业 | §4.1.1 |
| 存储 | NVMe SSD：顺序 ≈ 2–3 GB/s，fsync ≈ 5–20 ms | 通用硬件参数 |
| `checkpoint_threshold` | **256 MB**（默认 16 MB 的 16×） | F7 |

#### 4.4.2 写侧延迟分解（单批 10k 行）

| 环节 | 模型 | 估计值 | 依据 |
|---|---|---|---|
| 编码 / 序列化 | O(B) CPU | 1–3 ms | 10k 行 JSON 序列化 |
| WAL 追加 | 满 RowGroup 直写磁盘块，WAL 只记指针 | 2–5 ms | F6 |
| commit / fsync | 1 次磁盘同步（批量路径 commit 近零成本 + 1 fsync） | 5–20 ms | F6 + 硬件参数 |
| **批提交 p50 合计** | — | **10–30 ms**（边际 1–3 μs/行） | 上行合成 |
| 对照：单行 INSERT | — | **10–50 ms/行** | F7 → 批量因子 ≈ 3,000–50,000× |

#### 4.4.3 读并发对写者的四类影响（逐类量化）

| # | 影响通道 | 机制 | 量化结论 |
|---|---|---|---|
| I1 | **直接阻塞** | SI：读不阻塞写、写不阻塞读 | **严格 0 ms**（官方硬保证，F1/F3） |
| I2 | 带宽 / CPU 争用（同机） | 写者稳态需求 ≈ 200 MB/天 ≈ 2.3 KB/s 连续流；突发 ≤ 50 MB/批周期。读者峰值请求 5 × 1 GB/s（扫描型） | 写者 p50 影响 ≈ 0；p99 影响 ≤ 20 ms（I/O 队列）；读者重扫描时其自身 p99 上升，写者不受结构性影响 |
| I3 | **checkpoint 停顿**（唯一结构性项） | checkpoint 与读者并发时需等待（F9）；单次停顿 = WAL 大小 ÷ 磁盘吞吐 | 256 MB ÷ 2 GB/s ≈ **128 ms**（NVMe）；SATA SSD ≈ 512 ms。频率（基准）≈ 1.28 天 1 次；频率（100× 峰值 20 GB/天）≈ 78 次/天 |
| I4 | 版本保留内存（undo buffers） | bulk version info 每 2048 行一条（F4）；读者钉住快照延长旧版本保留 | 1M 行 ≈ 488 条版本记录；100M 行 ≈ 48,800 条 → MB 级，可忽略；由「读者快照 ≤ 60 s」兜底 |

#### 4.4.4 并发矩阵（模型估计，标注为待 Phase 4 实测校准）

| N 并发读者 | 写者 p50 批提交 | 写者 p99（含 checkpoint 窗） | 读者 p50 / p99 | WAL 回收 |
|---|---|---|---|---|
| 0 | 10–30 ms | ≤ 60 ms | n/a | 正常 |
| 1 | 10–30 ms | ≤ 80 ms | 与无写者一致（I1） | 正常 |
| 5（每 scale 1） | 10–30 ms | ≤ 150 ms | 与无写者一致（I1） | ≤ 1.5× 慢 |
| 10（含 2 个重扫描） | 12–35 ms | ≤ 512 ms（SATA 上界） | 重扫描读者自身 p99 上升（I2） | ≤ 3× 慢，触发 WAL 监控 |

#### 4.4.5 结论与设计约束

1. **写者 p50 对读并发不敏感**（I1 = 0 + 批量路径）；p99 由 checkpoint 停顿主导，单次上界 **128–512 ms**，与 N 弱相关（N 只影响 checkpoint 能否及时完成，不改变单次停顿量级）。
2. **读者延迟不因写者存在而劣化**（SI 硬保证）——这使 A-009 的「陈旧读 SLA = 5 秒」有充足余量：最坏链路 = 100 ms 窗口 + 30 ms 提交 + 512 ms checkpoint 窗 ≈ **0.65 s ≪ 5 s**。
3. **强制设计约束**：批大小 ≥ 10k（禁单行 INSERT，否则延迟恶化 3,000× 量级）；`checkpoint_threshold = 256 MB`；读者快照 ≤ 60 s；WAL > 512 MB 告警；写者事务禁长事务。
4. **实测计划（Phase 4）**：N ∈ {0, 1, 5, 10} × B ∈ {1k, 10k, 100k} × threshold ∈ {16, 64, 256} MB 网格压测，采集写者与读者双侧 p50/p95/p99 + WAL 曲线，用实测替换本节的模型估计。

---

## 5. 与其他票的关系与边界

| 票 | 关系 | 边界 |
|---|---|---|
| A-008（Schema 版本演进规则） | 本票预留 `schema_version` 字段槽位 | 演进规则（AsyncAPI 心智、注册中心）由 A-008 定义，本票不锁 |
| A-009（Read model 失效策略） | 本票的 checkpoint 上界（≤ 512 ms）与快照水位语义为其 SLA 提供可行性证据 | 陈旧读 SLA 与触发条件由 A-009 定义 |
| A-010（Cross-scale correlation key） | 本票预留 `trace_id` / `baggage_id` 槽位 | 字段设计与 OpenTelemetry 集成由 A-010 定义 |
| A-013（工具对齐评估） | 本票的 DuckDB 选型结论为其输入之一 | 不做工具矩阵重估 |
| A-012（Data mesh 失败模式防线） | 「重复劳动」防线与 SSOT 单写者直接相关；本票 R1-R5 不变式是其技术底座 | 防线清单与监控指标由 A-012 定义 |

---

## 6. 信息缺口（per Sufficiency Gate — 诚实标注 data does not show）

1. **read-under-ingest 端到端 p99 无公开基准**：调研明确「多读者 + 单写者同时运行」的 p99 曲线属未测领域（Traceway 作者原话：read-under-ingest remains future work）。§4.4.4 矩阵为模型估计（分解公式已给出，可证伪），Phase 4 必须实测替换。
2. **Quack / DuckLake 成熟度**：官方仅给方向（beta / 稳定），无并发写吞吐、冲突率、目录协调延迟公开基准。若未来重估多进程写，需先实测。
3. **checkpoint 停顿的官方 p99 数字缺失**：本报告用「WAL 大小 ÷ 磁盘吞吐」建模，未获官方定量曲线。
4. **`concurrent_writers` 设置的存在性未获官方一手信源支持**：调研明确不采信「多进程写可开启」的二手说法，本票同样不采信。

---

## 7. 完成定义对照（逐项，per WORKFLOW §4.2.5）

### 7.1 专属验收 checklist（本票特有）

- [x] **必须选一个写策略（不能「两种都可以」）** — §1：选定单写多读（SWMR），并给出 4 条排他理由 + 明示代价。
- [x] **并发延迟评估必须量化** — §4.4：场景参数表 + 写侧分解（p50 10–30 ms）+ 四通道影响量化（I1 = 0 / I2 ≤ 20 ms / I3 128–512 ms / I4 MB 级）+ 4×5 并发矩阵 + 与 A-009 5 s SLA 的对齐验算（最坏链路 0.65 s）。
- [x] **1) 单写进程架构图** — §4.1：部署图（含控制面/数据面分离）+ 5 条不变式 R1-R5 + 写者主循环伪流程 + 失败语义表。
- [x] **2) 事务隔离级别选择理由** — §4.2：选定快照隔离 + 5 条理由 + 3 条拒绝替代 + 4 条事务形状硬规则。
- [x] **3) version 字段 schema（递增策略）** — §4.3：4 候选策略判定表（选定批量块分配）+ 分配协议 5 条 + DDL + 崩溃恢复 + 重放 SQL。
- [x] **4) 多读并发对单写的延迟影响评估** — §4.4.3 I1-I4 四通道逐类量化 + §4.4.4 矩阵 + §4.4.5 结论与实测计划。

### 7.2 通用调研要求对照（per handoff「通用调研要求」段）

| 要求 | 状态 | 证据 |
|---|---|---|
| atomcode 深度调研（per WORKFLOW §4.2.3）：回顾 baseline 决策 + 当前决策 + 目标仓库现状；输出含推荐方案 | [x] | §3.1-§3.2（14 URL / 8 域名 / 双源交叉）；§3.4 基线回顾；§1 推荐方案 |
| 回顾 docs/adr/：与本票直接相关的 ADR（ADR-0005） | [x] | §2.4（4 条子决策逐条承接） |
| 回顾 CONTEXT.md：相关心智模型术语 | [x] | §2.5（5 个术语映射） |
| 对标工业界成熟方案 ≥2 个 | [x] | §3.3（SQLite WAL / Apache Iceberg / Delta Lake，3 个） |

### 7.3 阻塞

- **Blocked by: None（已解除）** — 本票无上游阻塞，一次闭环。
- **本票不阻塞他票**（issue Blocked by 字段无下游依赖）。

### 7.4 lessons 候选（per WORKFLOW §4「教训持续追加 / 不可蒸发」）

1. **并发语义类结论只认官方一手文档双源。** 调研发现网络上大量二手文章（getorchestra.io / johal.in）把 DuckDB 隔离级别写成 READ_COMMITTED 或「无多用户隔离」，与官方「快照隔离」表述直接冲突。凡涉及隔离级别 / 一致性语义，必须以官方文档双源核验，二手文章只能作为线索。
2. **写策略类结论必须标注适用版本窗口。** DuckDB「单写」标签有时效性：1.5 之前严格一写多读，2026 起 Quack（beta）/ DuckLake v1.0 正在破局。结论若不带版本窗口，一年后即误导。本报告全部结论标注版本与日期。
3. **架构图必须显式画控制面/数据面分离。** ADR-0005 ④ 要求 hub 不经过数据面；若架构图把 hub 画进数据路径，后续票（A-009 / A-010）会基于错误拓扑继续设计。本票 §4.1.1 用分隔区块显式画出。
4. **越界预防：只预留槽位、不定义规则。** `schema_version` / `trace_id` / `baggage_id` 三个字段本票只预留，规则归 A-008 / A-010——避免像 A-005 那样出现「下游票定义上游语义」的返工。

### 7.5 引用文件列表（per WORKFLOW §4.2.5）

**本票读取（必读清单）：**
1. `.scratch/architecture-recovery/issues/07-duckdb-write-strategy.md`
2. `.scratch/architecture-recovery/handoffs/07-duckdb-write-strategy.md`
3. `.scratch/architecture-recovery/spec.md`（§Decision 5.1 + Coverage 表）
4. `.scratch/architecture-recovery/WORKFLOW.md`（§4.2.1 ~ §4.2.6）
5. `.scratch/architecture-recovery/decision-ledger.md`（A-007 行 + 覆盖率自评段）
6. `docs/adr/0005-hub-of-facts-with-federated-adjudication.md`
7. `CONTEXT.md`（术语表）

**本票产出：**
8. `.scratch/architecture-recovery/reports/07-report.md`（本报告）
9. `.scratch/architecture-recovery/decision-ledger.md`（追加 `## A-007 结论落盘` 段）

**调研引用来源（主要者，完整 19 条见 atomcode 返回）：**
10. DuckDB Concurrency（current 文档）— duckdb.org/docs/current/connect/concurrency.html
11. DuckDB Analytics-Optimized Concurrent Transactions（2024-10-30）— duckdb.org/2024/10/30/analytics-optimized-concurrent-transactions.html
12. DuckDB Transaction Management（raw markdown，current）— raw.githubusercontent.com/duckdb/duckdb-web/.../transactions.md
13. DuckDB 1.4.0 LTS 公告（2025-09-16）— duckdb.org/2025/09/16/announcing-duckdb-140.html
14. duckdb/duckdb Discussion #4899（维护者回复，2022-10）
15. SQLite Write-Ahead Logging — sqlite.org/wal.html
16. SQLite Isolation — sqlite.org/isolation.html
17. Delta Lake Concurrency Control — docs.delta.io/concurrency-control/
18. Apache Iceberg Reliability — iceberg.apache.org/docs/latest/reliability/；Dremio Iceberg Concurrency 文档
19. Traceway 同机基准（2026-07-21）— tracewayapp.com/blog/sqlite-vs-duckdb
20. PostHog DuckDB vs SQLite — posthog.com/blog/duckdb-vs-sqlite
21. duckdb issue #9150（WAL 无界增长，Dune Analytics 案例）+ CHECKPOINT 语句文档

---

## 8. 版本控制（per WORKFLOW §4.2.1）

本报告通过 `but` CLI 提交到本 session 独立分支，不使用任何 git write 命令。实际执行结果见下表。

| 项 | 值 |
|---|---|
| 分支 | `a007-duckdb-write-strategy`（独立 session 分支；栈序 ticket-05-unit-matrix → a006-adr-impact-framework → a007，未动他分支提交） |
| 提交 | 2 条提交于本分支：`tss`（报告正文）+ `tyt`（账本 A-007 结论段）。GitButler change ID 稳定，SHA 随历史编辑变化，故以 change ID 为准 |
| 提交范围 | `reports/07-report.md` + `decision-ledger.md`（A-007 结论段），不夹带其他 agent 变更 |
| 决策账本 | `.scratch/architecture-recovery/decision-ledger.md` 追加 `## A-007 结论落盘` 段（per WORKFLOW §4.2.4） |

> **禁止命令遵守情况**：本次全程不执行 git add / git commit / git push / git checkout / git merge / git rebase / git stash / git cherry-pick。所有写操作走 `but` CLI；仅用只读 git 命令做核验。
>
> **未推送声明**：未经用户指示不 push —— 本票止于本地提交，不执行 `but push` / `but pr new`。

---

*Report generated: 2026-09-11 · A-007 · 单写多读 SWMR · DuckDB snapshot isolation · block-allocated gap-free version*
