# 20-research — DuckDB-in-node 绑定选型调研（A-021 / spec.md §R3-D2）

- **调研日期：** 2026-09-13 ｜ **模式：** landscape + comparison ｜ **工具：** atomcode（per WORKFLOW §4.2.3）
- **服务对象：** `6F/engine`（TypeScript ≥ Node 20，ESM）fact table schema v0（事件只追加 + correlation key 前置字段）
- **决策链：** ADR-0012 / R3-D2 · A-007 单写多读 SWMR · A-008 版本演进 · A-010 correlation key

## §0 执行摘要

**绑定唯一推荐 `@duckdb/node-api@1.5.5-r.4`。** 旧绑定 `duckdb` 官方已判 EOL（1.4.x 止步）、`duckdb-async` 随其陪葬、`node-duckdb` 废弃五年。
**只追加语义在 DuckDB 稳定版无引擎级开关**（无触发器、约束不可禁写、`READ_ONLY` 连 INSERT 一起禁），必须以「连接拓扑隔离 + 门面白名单 + 守卫断言」三层应用侧方案落地。

## §1 候选项清单（互斥，四选一）

> `duckdb-wasm`（WASM 端）与 `@duckdb/node-bindings`（Neo 的 C-API 直译层，被 node-api 依赖）不属于「Node 应用绑定」，故排除。

| # | npm 包名 | 维护方 | 最新版本 | 最近发布 | 性质 |
|---|---|---|---|---|---|
| A | `@duckdb/node-api` | DuckDB Labs（官方，`duckdb/duckdb-node-neo`） | 1.5.5-r.4 | 2026-08-11 | 官方新一代 Node API（Neo） |
| B | `duckdb` | DuckDB Labs（官方旧绑定，`duckdb/duckdb-node`） | 1.4.4 | 2026-01-30 | **已 deprecated**，明确不再发布 1.5.x |
| C | `duckdb-async` | MotherDuck（`motherduckdb/duckdb-async`） | 1.4.2 | 2025-11-13 | 社区 Promise 包装层，**依赖 B**，随 B 同步 EOL |
| D | `node-duckdb` | DeepCrawl | 0.0.79 | 2021-12-15 | 绑定 DuckDB 0.2.6 时代源码，**实质废弃** |

## §2 量化对照（2026-09-13 实测 registry / GitHub API）

| 维度 | A: @duckdb/node-api | B: duckdb | C: duckdb-async | D: node-duckdb |
|---|---|---|---|---|
| 安装体积 (unpacked) | 68.2 MiB（API 包 586,386 B + linux-x64 二进制 70,978,117 B） | 58.4 MiB（61,204,393 B） | 58.4 MiB（自身 64,787 B + 依赖 B） | 约 0.47 MB（**需 install 时自编译旧源码，不可比**） |
| 同步+异步双接口 | 是 | 否 | 是 | 否 |
| Prepared statement | 是 | 是 | 是 | 否 |
| Appender 批量写 | 是 | 否 | 否 | 否 |
| 流式/chunk 读 | 是 | 否 | 否 | 是（旧 Stream API） |
| Arrow | 否（Roadmap 未完成） | 是（register_buffer，带 Windows 限制） | 是 | 否 |
| 官方维护 | 是 | 是 | 否 | 否 |
| Stars / 最后 push | 196 / 2026-09-12 | 91 / 2026-01-30 | 156 / 2025-11-13 | — / 2021-12-15 |
| 发布节奏 | 月级 | 已停（止步 1.4.x） | 随 B 同步 EOL | 5 年无发布 |
| deprecated | 否 | **是** | 否（但依赖已 EOL） | **是** |

**关键量化结论：**
1. 体积不是差异项（A 68.2 MiB vs B 58.4 MiB 同量级）；C/D 的「小」是假象。
2. API 面 A 全面领先：双接口 + Appender + Prepared + 流式读取。
3. 维护度 A 唯一活跃：月级发布、2026-09-12 仍在 push。
## §3 唯一推荐与排他理由

**结论：选 A，不选 B/C/D，无「两种都可以」的中间项。**

1. **B 是官方判了死刑的路。** npm README 与 duckdb.org LTS 文档白纸黑字：旧绑定 deprecated，计划只为 DuckDB 1.4.x 系列最后一次发布，不再为 1.5.x 发布。选 B 意味着永久停在 1.4.x，与官方文档指引直接冲突。
2. **C 不是独立候选项。** `dependencies` 固定为 `duckdb 1.4.2`，完整继承 B 的 EOL；其唯一历史价值（给回调式 B 提供 Promise）已被 A 原生消灭（官方 Neo README 明示 no need for separate duckdb-async wrapper）。
3. **D 是技术债陷阱。** 绑定 DuckDB 0.2.6 时代自编译源码，5 年无发布，Node 目标停在 ≥12.17，无法支撑 engine 的 Node 20/22 CI 矩阵。
4. **A 同时满足本票全部验收点。** 版本唯一且官方主推；原生 Promise + 随包分发 `.d.ts`，与 TS 工程无摩擦；Appender 为事实表追加吞吐兜底；SLSA 签名 + OIDC 发布，可配合锁版本使用。
5. **风险提示（不改变结论）：** 2025-09-13 供应链投毒事件波及 `@duckdb/node-api@1.3.3`（已删除、1.3.4 起修复）→ 选型后必须锁精确版本；Neo 的 Arrow API 未完成 → 若未来需要 Arrow 列式直读需重评。

## §4 只追加语义实现：DuckDB 机制边界与守卫方案

### 4.1 引擎侧能力盘点（先划边界，不夸大）

| 机制 | 状态（2026-09，稳定版 ≤1.5） | 对只追加的贡献 |
|---|---|---|
| 约束（CHECK / NOT NULL / PK / UNIQUE / FK） | 支持（`ALTER TABLE ADD CONSTRAINT` 仅部分支持） | 只能约束值域/唯一性，**无法禁止 UPDATE/DELETE** |
| 触发器（TRIGGER） | **稳定版不支持**；草案 PR #21867 为 draft 且未合并 | 当前与可预见未来都无法用作拦截手段 |
| `access_mode = READ_ONLY` | 支持 | 一刀切：连 INSERT 也禁。**适合所有读者连接**，不适合写者 |
| 单进程写锁 / MVCC | 支持（「Appends will never conflict, even on the same table」） | 支撑 A-007 单写多读拓扑 |
| `INSERT OR REPLACE` / `ON CONFLICT DO UPDATE` / `MERGE INTO` / `COPY` | 全部可用 | **它们是只追加的后门，守卫必须一并拦截** |
| 行级安全 / 表级写权限 | 不支持 | 无引擎级「只允许 INSERT」开关 |

### 4.2 三层应用侧方案（本票验收点落点）

1. **连接拓扑层**：唯一写者持 READ_WRITE 连接；所有读者以 READ_ONLY 打开/ATTACH；写者连接绝不外露，engine 只提供 `appendFact()` 与 `queryFacts()`。
2. **门面/校验层**：写入口只接受结构化事件对象，不暴露裸 SQL 写接口；任何 SQL 先过 `classifyStatement()` 白名单（默认拒绝）。
3. **守卫断言层**：落为 `reports/20-fact-schema-check.mjs`（退出码 0 + 显式 PASS/FAIL）。

## §5 工业界对标（≥2 个成熟心智模型）

- **EventStoreDB（Kurrent）**：服务器端强制 append-only，乐观并发靠 `expectedVersion`。**同**：本场景是其单机简化版。**异**：EventStoreDB 把只追加做成服务器语义，DuckDB 是通用 SQL 引擎，没有等价语义 → 守卫是「把 EventStoreDB 语义移植到通用引擎」的补课。
- **Kafka log compaction**：段不可变、只追加，压缩保留每 key 最新值。**同**：都认可事实日志天生只追加；要「最新状态」应另作物化快照而非回改事实行（与 A-008 版本递增同构）。**异**：Kafka 是逻辑层只追加 + 分布式多副本；本场景单文件单进程，逻辑与物理都保持只追加。
- **Confluent Schema Registry**：subject 版本化 + 兼容性类型（默认 BACKWARD）强制。**同**：A-008 版本演进应直接借用其规则表。**异**：SR 是独立服务 + REST；我们更轻，用 DuckDB CHECK 约束 + 应用侧迁移守卫近似。
- **OpenTelemetry Baggage**：跨信号关联键。**同**：本产品已采用其心智，即 `trace_id` / `baggage_id` 前置字段（A-010）。**异**：OTel 有 64 条目 / 8KB 限值与 SDK 传播链，本场景只需在 schema 层固定 32 位 hex 形态。

## §6 来源清单（本轮实际抓取/核验，26 信源）

| # | 来源 | 贡献 |
|---|---|---|
| 1-5 | npm registry JSON（@duckdb/node-api / duckdb / duckdb-async / node-duckdb / @duckdb/node-bindings-linux-x64） | 版本、unpackedSize、依赖、维护人、SLSA provenance |
| 6-8 | GitHub API（duckdb-node-neo / duckdb-node / duckdb-async） | stars、最后 push、open issues、归档状态 |
| 9 | GitHub API `duckdb/duckdb/pulls/21867` | 触发器 PR **draft、closed、merged=false** 一手证据 |
| 10 | `@duckdb/node-api` README（raw.githubusercontent.com） | Appender / prepared / 双接口 / 值类型表 |
| 11-14 | duckdb.org 文档（并发、约束、ATTACH、旧绑定弃用声明） | 引擎能力边界 |
| 15-17 | DuckDB 官方博客（Neo 客户端，2024-12-18） | Neo 架构、Appender 为最高效批量写入 |
| 18 | npmjs.com 页面 | 周下载量对比（~140 万 vs ~2 万量级） |
| 19-22 | Kafka 官方文档、OTel Baggage markdown、EventStoreDB 文档、Confluent SR 文档 | 工业对标一手依据 |
| 23-26 | unpkg `@duckdb/node-api@1.5.5-r.4` 的 package.json / index.d.ts / DuckDBInstance.d.ts / DuckDBConnection.d.ts | **本会话追加核验**：确认 `DuckDBInstance.create(path, options)`、`DuckDBConnection.create(instance)`、`connection.run(sql, values?)` 签名真实存在 |

## §7 信息缺口（Sufficiency Gate，不掩盖）

1. **触发器落地时点不确定**：PR #21867 是 draft 未合并，官方未承诺版本 → 守卫方案按「永久无触发器」设计。
2. **体积均为 registry unpackedSize 元数据**，未实测 npm install 后磁盘占用（本机按 prompt delta 不安装）。
3. **`@duckdb/node-api` 的 Arrow API 完成时间未定**，若未来需要 Arrow 直读需重评。
4. **绑定 API 的实际编译与运行时行为未经本机验证**：本机禁构建（prompt delta 第 3 条），仅通过 unpkg `.d.ts` 静态核验签名；`npm run build` / `smoke` 留待 CI。
5. **多写者演进**：DuckDB 1.5.2+ 的 Quack 远程协议（beta）与 DuckLake 若被采用，只追加守卫的落点会从「进程内连接拓扑」迁移到服务端/目录层。
