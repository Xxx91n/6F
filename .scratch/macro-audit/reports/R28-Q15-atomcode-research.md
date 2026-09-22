[warning] 正在以管理员权限运行 — 模型可能可以访问系统文件。
开始调研：先召回知识库，再按五角度三引擎广泛搜索。知识库已命中 R28-Q6/Q7 相关先例；Tavily 配额耗尽，改用 web_search + anysearch 继续多角度检索。继续补角度（取证 snaplen/WORM、RabbitMQ DLX 截断）并开始定点抓取原文核验。继续定点抓取：tcpdump 手册、RabbitMQ DLX、以及 WORM/取证截断惯例与 DuckDB BLOB 存储文档。补充最后一组定点验证：DuckDB 官方 BLOB 文档与 limits 页原文。# R28-Q15 调研报告：病态字段值 raw_bytes 的存储边界

**Sufficiency Gate**：searches: 8（web_search×6 + anysearch×1 + 知识库召回×1）| angles: Official（DuckDB 官方文档、RabbitMQ 官方档、tcpdump man、MySQL 官方档、BSI TR-03125）、Criticism（DuckDB GitHub discussion #23275 OOM 案例、SQLite 论坛）、Community（docs.rs kastellan、Instaclustr 博客、StackOverflow/ServerFault、Medium）、Comparative（SQLite vs 文件系统 BLOB 实测）| full reads: 7（kastellan docs.rs、Instaclustr KIP-1034、sqlite.org/fasterthanfs、tcpdump.1.html、rabbitmq.com/docs/dlx、DuckDB blob.html、DuckDB limits）| gaps: pcap 取证界对「截断+hash」组合的正式标准文本未获一手（NIST SP 800-86 类，未深挖）；WORM 一手标准（BSI PDF）仅读到导言部分。

---

## 1) 执行摘要（Tl;dr）

**推荐 (b′)：有界截断＋指纹三件套（truncated flag ＋ original_length ＋ sha256(full)），阈值设为安全控制而非资源参数（建议 64 KiB–1 MiB 区间，按本仓 quarantined 事件低频特征定标）。** Confidence：**中高**——工业界 DLQ/审计/取证三个领域的惯例高度一致地支持「截断可接受、但必须带指纹三件套」；但本仓 D-104③ 的「完整现场」义务使纯 (b) 有张力，需以「指纹可验＋超界本身即 quarantine 事件＋必要时经 D-109 工件路径补全量」来闭合，而非无条件全量入库 (a)。

关键转折证据：**DuckDB 官方明确不推荐在库内存超大对象**（blob 文档原话），且社区实测 DuckDB 向量化扫描对大 BLOB 的峰值内存 = `2048 × avg_blob_size`（10 MB BLOB 单向量即 20 GB 峰值）——**(a) 在 DuckDB 载体上不是「证据完整性 vs 成本」的软权衡，而是可被对抗输入直接打爆内存的硬风险**，这使「输入格式自带上界」论证失效。

## 2) 分点结论（按角度组织）

### ① DLQ/错误表存储惯例——全量 payload 是主流，但前提是「字节天然有界」

- **Kafka（KIP-1034 / Kafka 4.2 Streams DLQ）**：官方契约是 DLQ record 的 key/value = **源 consumer record 的原始字节**（"this is what you need for replay and forensic comparison"），元数据放 headers（`__streams.errors.*`：exception/message/stacktrace/topic/partition/offset）。KIP 明确承认 **metadata-only DLQ 行**的存在场景——当平台已不再持有完整源字节时。来源：Instaclustr 博客（已读全文）＋搜索交叉。
- **RabbitMQ DLX**：死信消息**原样 republish**（含原 routing key），无截断概念；但配套的 `maxlength` 策略用 **drop-head / reject-publish** 整条丢弃来控量——即 RabbitMQ 的哲学是「要么全量、要么整条不收」，从不做部分截断。来源：rabbitmq.com/docs/dlx（已读）。
- **kastellan-db（Rust 审计库，docs.rs，已读全文）——与本问最同构的先例**：审计 log 的 tool-call payload 上限 4 KiB，超限即替换为 `{_truncated, sha256, len}` **指纹信封**；原话："The fingerprint lets two truncated rows be compared for equality without storing the bytes themselves; the length tells an operator how much was elided." 且标记键是**wire contract**（读写双方共享单一谓词 `is_truncation_envelope` 防漂移）。理由陈述与本仓呈现面逻辑（D-114）同构："operators tail the audit log to see who did what, not to recover request bodies."
- **MySQL 审计日志**：官方档承认 "Long values may be truncated"，但**只截不指纹**——是 (c) 类反例，说明纯截断在业界确实存在但通常被视为缺陷场景（文档仅提示，未提供完整性补救）。
- **Kimball error event / DuckDB store_rejects**：知识库召回 R28-Q7 先例已覆盖——错误事件与 fact 分表、错误路径只带结构化计数，不在崩溃/错误路径内联写全量。

**小结**：DLQ 领域「全量」主流的前提是 broker 自身的 `max_message_size`（Kafka 默认 1 MB）已在**入口**挡住了超大消息——DLQ 收到的字节天然有界。这提示本仓：界应该设在**采集/摄入边界**，存储面跟随界即可，不必在 quarantine_log 里重复承担无界输入。

### ② 取证/审计界的截断惯例——截断合法，但必须有「截断显式标记」

- **pcap snaplen（tcpdump man，已读）**：截断是**一等公民**且有标准化标记——被截断的包在输出中显式记为 `[|proto]`，且 man page 明示代价："taking smaller snapshots will discard data from protocols above the transport layer, which loses information that may be important"（**取证界承认截断丢证据，靠标记而非靠全量来保诚信**）。默认 snaplen 262144 字节——即业界默认「截到足够大」而非「截到很小」。
- **BSI TR-03125 / RFC 4998 ERS（WORM 长期存证）**：证据保存的标准做法是**对完整原文做 hash 树＋时间戳**，原文本身进 WORM 存储——即「hash 证完整性、原文本体不能缺席」；未找到任何「截断体+hash」被接受为完整证据保存的标准先例。这是 (b) 的真实代价所在：**指纹证明「曾有这些字节」，但换不回「这些字节本身」**。
- **数字取证链保管惯例**（搜索结果中的取证工作流文）：ingestion 时 per-file SHA-256＋RFC 3161 时间戳＋immutable storage——对象是**完整 bitstream**，hash 是完整性验证器不是替代品。

### ③ 截断标记惯例——「三件套」是收敛解

跨领域汇总，截断事件的标准标记集合恰好三件：
| 标记 | kastellan | pcap | Kafka KIP-1034 |
|---|---|---|---|
| truncated flag | `_truncated` 键 | `\|proto]` 字样 | metadata-only 行（隐式） |
| original length | `len` | caplen vs origlen（pcap 格式内建两长度字段） | — |
| hash 指纹 | `sha256` | —（文件级外挂 hash） | — |

pcap 文件格式本身每包存 caplen+origlen 双长度（截断可检测），kastellan 补上 sha256——三者合起来是业界最完整的形态。**纯截断无指纹（c）没有任何一条领域惯例支持。**

### ④ 对抗性输入角度——「自带上界」论证的漏洞实证

- 安全规则文献（sota-code-security ingestion 规则，搜索已核）明确把尺寸上限列为**安全控制**："The cheapest attack on an ingester is volume and amplification. Bound everything. **Size caps at every layer**: max request body, max field length, max file size"；且点名 quarantine/DLQ 本身要带 provenance、**压缩比上限（>100:1 拒绝）**要按实际解压字节计量——zip 炸弹 42 KB→PB 级。
- 「git commit 对象自带上界」的漏洞：(i) git 对象**可以很大**（法律上合法的巨型 blob 可达 GB 级）；(ii) 对象在 git 内部 zlib 压缩，采集器读入的是**解压后**字节，压缩比攻击面同 zip 炸弹逻辑；(iii) 上界=对象大小意味着攻击者可以**构造**一个 500 MB 对象让单条 quarantine 行放大 500 MB——DuckDB 场景下叠加向量扫描放大（见⑤）。
- 结论：**尺寸上限应作为安全控制进入 reason_code 词表**（超限=独立的 quarantine 理由），而非仅在存储面默默截断。

### ⑤ 存储成本实证——DuckDB 大 BLOB 的实际阈值比直觉低得多

- **DuckDB 官方 blob 文档（已读）**：BLOB 上限 4 GB，但 "typically it is **not recommended** to store very large objects within the database system. In many situations it is better to store the large file on the file system, and store the path… in a VARCHAR field." ——官方自己推荐的就是 (d) 变体（文件+指针），但那是为「大文件常态」场景；本仓病态值是**低频异常**，不构成常态。
- **DuckDB discussion #23275（社区，Criticism 角度，关键实证）**：向量化引擎固定 2048 行/向量，扫含大 BLOB 的表时峰值内存 ≈ `2048 × avg_blob_size`——**10 MB BLOB × 2048 = 单个 scan vector 20 GB 峰值内存**，且 checkpoint/WAL replay 同路径，`memory_limit` 拦不住直接 FatalException。这是对 (a) 最硬的技术反对：**不需要磁盘爆，一次 `SELECT` 就能被对抗性大字段值打 OOM**。quarantine_log 是 MCP 只读开放面（R28-Q4），攻击者可通过触发 quarantine＋诱导扫描实现存储放大→内存 DoS 链。
- SQLite 侧：overflow page 机制使大行可用（fasterthanfs 实测 10 KB blob 比文件系统更快更省），但>1 GB blob 需手工分块，行越大页利用率越差——SQLite 对 (a) 宽容度更高，但本仓主库是 DuckDB。

### ⑥ 辩证：(a) vs (b) 及冲突核查

- **(a) 的对抗放大风险**（实）：DuckDB 向量扫描 OOM 链（④⑤）＋「自带上界」的构造性漏洞（④）。D-109 协议级崩溃工件裁全量 raw_bytes_hex 是**正确的非对称**：崩溃工件是逐事件落文件、不进向量扫描面、天然低频；quarantine_log 是 SQL 可查询表（MCP 开放），两者载体不同，**同哲学不成立=同边界**。
- **(b) 的证据截断代价**（实）：WORM/取证标准不接受「截断体+hash」为完整证据保存（②）。但 D-104③ 的「防首个观测实例永久不可归因」义务的**核心是可归因可验证**，不是字节本身躺在表里——sha256(full)+original_length 使任何后续争议可对着**源 commit 对象**（本仓审计对象本来就是 git 可寻址的！）重算验证。这是本仓独有的兜底：**病态字节永远可以从 commit_sha 指向的 git 对象重放取得**，表内截断不造成证据永久丢失——这是 Kafka DLQ 做不到的（Kafka 源 topic 会过期）。
- **(c)**：无任何惯例支持，且违反可归因义务，排除。
- **(d)**：R28-Q7 已辩证否定内联写库裂开证据面；且 (d) 的「超界部分落文件」在本仓等价于「把完整对象从 git 重放」——既然 git 本身就是那个旁路工件库，(d) 是给已有机制重复造轮子，排除。
- **D-114 冲突核查**：呈现面字节回显截断已定——存储面 (b′) 与之**分层一致**（存 N 字节≤呈现 M 字节的嵌套关系，或两者独立阈值均可，建议同一常量源防漂移，参照 kastellan 把 marker 谓词放 producer 旁的防漂移做法）。
- **D-106/D-112 冲突核查**：quarantine_log 逐字段事件 grain 不变，raw_bytes 列语义变为「≤阈值字节＋指纹三件套」，reason_code 增补超限枚举——无 grain 变化。

## 3) 推荐（最终）

**(b′) 有界截断＋指纹三件套**，具体形态：
1. `raw_bytes` 存前 N 字节（N 建议 64 KiB，理由：pcap 默认 snaplen 256 KB 量级提示「截到足够大」哲学，而本仓呈现面/信封典型字段值远小于此；64 KiB 单向量最坏 128 MB 内存，安全）；
2. 伴随列/信封：`is_truncated`（或复用 reason_code 枚举 `oversize`）、`original_length`、`sha256_full`；
3. **N 是安全控制**：超 N 的输入本身构成 quarantine 事件（reason_code 记超限），并在审计报告中单列计数——对抗性放大被转化为**可观测的审计信号**而非静默存储；
4. 完整现场兜底 = `commit_sha` 指向的 git 对象可重放（本仓域特有，Kafka 域不具备），写进决策理由以闭合 D-104③；
5. 截断标记谓词单点定义（kastellan 的 wire-contract 模式），与 D-114 呈现面共享常量源。

## 4) 来源清单

| # | 标题 | URL | 角度 | 日期 | 贡献 |
|---|---|---|---|---|---|
| 1 | kastellan-db audit module (docs.rs) | https://docs.rs/kastellan_db/latest/kastellan_db/audit/index.html | Official/先例 | 2026-07-19 | 截断+指纹信封完整实现与理由（最同构先例） |
| 2 | Instaclustr: Kafka KIP-1034 DLQ | https://www.instaclustr.com/blog/how-to-handle-bad-messages-safely-in-kafka-streams-with-kip-1034-dead-letter-queues/ | Official 解读 | 2026-06-01 | DLQ 存原始字节契约＋metadata-only 例外 |
| 3 | RabbitMQ Dead Letter Exchanges | https://www.rabbitmq.com/docs/dlx | Official | 4.3 | DLX 原样 republish、无截断概念 |
| 4 | RabbitMQ Queue Length Limit | https://www.rabbitmq.com/docs/4.2/maxlength | Official | 4.2 | 整条丢弃 vs 部分截断的哲学对立 |
| 5 | tcpdump(1) man page | https://www.tcpdump.org/manpages/tcpdump.1.html | Official | 2026-07-31 | snaplen 截断标记 `[|proto]`＋默认 262144 |
| 6 | DuckDB Blob Type | https://duckdb.org/docs/lts/sql/data_types/blob.html | Official | 1.4 LTS | 官方不推荐库内存超大对象 |
| 7 | DuckDB Limits | https://www.duckdb.org/docs/lts/operations_manual/limits | Official | 1.4 LTS | BLOB 4 GB 硬上限 |
| 8 | DuckDB discussion #23275（大 BLOB 向量扫描 OOM） | https://github.com/duckdb/duckdb/discussions/23275 | Criticism/Community | 近期 | 2048×blob_size 峰值内存实证——反 (a) 关键证据 |
| 9 | SQLite 35% Faster Than The Filesystem | https://www.sqlite.org/fasterthanfs.html | Comparative/Official | 2017/更新 2025 | 10 KB 级 blob 库内存储反而更优 |
| 10 | MySQL Audit Log File Format | https://dev.mysql.com/doc/refman/9.7/en/audit-log-component-file-formats.html | Official | 9.7 | 纯截断（无指纹）存在但为缺陷场景 |
| 11 | sota-code-security untrusted-data-ingestion 规则 | https://github.com/martinholovsky/sota-skills/blob/main/skills/sota-code-security/rules/09-untrusted-data-ingestion.md | Community/规范 | — | 尺寸上限=安全控制、quarantine 带 provenance、压缩比攻击 |
| 12 | BSI TR-03125 (TR-ESOR/ERS) | https://www.bsi.bund.de/.../BSI_TR_03125_TR-ESOR-ERS_V1_2_EN.pdf | Official | 1.2 | WORM 存证=完整原文+hash 树，截断体不被接受 |
| 13 | 知识库召回：R28-Q7/R28-Q4 先例（Wer/WER 论文、DLQ 摄入时点、quarantine_log 立项） | 本地 ctx | — | 2026-09-22 | (d) 否定先例、崩溃工件全量的非对称理由 |

## 5) 信息缺口

- pcap 格式规范（caplen/origlen 双长度字段）未抓一手原文（pcapng spec），是从 tcpdump man 推断＋搜索结果佐证；
- NIST SP 800-86 等「取证截断」正式标准文本未读，②中取证惯例主要靠 BSI＋社区工作流交叉；
- DuckDB #23275 讨论截至读取时官方是否已提供 adaptive vector size 修复未核实（若已修复，⑤的 OOM 论据减弱但存储放大论据仍成立）；
- 64 KiB 阈值是量级推断（pcap 默认/4 KiB 先例/呈现面需求折中），缺本仓自有 quarantined 字段值的实际尺寸分布数据——**建议在定标前先跑一次现有 corpus 的字段值长度直方图**。

继续此会话，运行：atomcode -p "…" --resume f6c4a5a2-4766-4b6f-a054-8253dd06f3af
