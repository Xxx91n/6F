# R28-Q7 atomcode 调研题面

> 2026-09-22 轮28 grill Q7。数据源纪律：调研须回顾 decision-ledger 全部 current 记录、docs/adr 全部 ADR、CONTEXT.md 全部词条、工业界成熟心智模型（重点）。结果辩证看待；与 current 决策冲突→标 revised 呈报不静默改向。

## 系统背景

工程内容审计产品：DuckDB 单文件、audit_fact=SSOT 只追加、字节级确定性可重放 charter、报告=read model 投影、MCP 只读查询面。违约两级处置（D-100）：协议级违约 fail-fast；字段级病态进 quarantine_log 独立表（D-106，grain=逐病态字段事件，D-108 run_id=traceId+自然键幂等+recorded_at 可空确定性时点）。

## 已就位决策（本题约束）

- D-104③：crash-bucket 建制义务=协议级 fail-fast 现场保留原始字节快照+结构化计数留痕（非仅 error message）——目的=防字段级病态破坏记录定界后伪装协议违约、首个观测实例永久不可归因（触发器立法须可回溯证据）；
- D-103：契约层只产判定+诊断数据，不做 IO——崩溃留痕只能由消费面/进程边界承接；
- D-106 grain 判据入规：不同 grain 不进同一表（quarantine_log 行=逐病态字段事件）；
- D-108：run_id=traceId（内容哈希确定性）；幂等靠自然键 UNIQUE；
- 顺序面：macro-b 先读 headDate 后扫记录流→协议崩溃点在流解析中，headDate 正常时 traceId 仍可算；
- 双消费通道：engine cli.ts 顶层＋39-macro-b-one-shot.mjs 独立脚本（不走 cli.ts）都须覆盖 crash 证据；
- 协议级违约=fail-fast：无报告无 fact 行（与 unsupported 裁定有报告不同）。

## 裁决问题

crash-bucket 承载形态：

- (a) 复用 quarantine_log（field=__protocol__ 哨兵、commit_sha=null、raw_bytes=现场快照）——单查询面但逐运行事件挤进逐字段事件表=grain 纪律自违＋fail-fast 路径多一次 DB 写（写失败=双重故障）；
- (b) 崩溃工件文件（fail-fast 边界 cli.ts 顶层 catch/39 脚本等价位 catch 后落结构化 JSON 工件：error_code/raw_bytes_hex/崩溃位置/run 上下文/计数，再退出）——垂死路径不依赖 DB；CI 收 workflow artifact；逐运行事件=逐文件 grain 自洽；
- (c) DB 独立 crash 表（quarantine_crash_log）——grain 分开仍 DB 内可 SQL，但 fail-fast 路径 DB 写风险同 (a)＋为罕见事件多建表；
- (d) (b)＋事后补库：工件先落盘，下次成功运行回填 crash 表——两全但复杂度翻倍且「下次成功运行」可能永远不来。

## 调研任务

1. 工业界崩溃/致命错误现场的留痕惯例：crash dump/core dump/error artifact vs 入错误表——JVM ErrorReport/HS_ERR 文件、Android tombstone、Sentry crash report、CI failure artifact、ETL pipeline fatal error 留痕面；「垂死路径上的写依赖最小化」原则实证；
2. 数据管线中「框架级失败 vs 记录级失败」的证据分流惯例：Airflow task failure 日志 vs 数据质量 reject 表、Flink/Kafka pipeline 崩溃诊断 vs DLQ——结构性失败走日志/工件、记录级失败走表是否公认分界；
3. 单文件工件 vs DB 行对「罕见致命事件」的可观测性权衡：crash artifact 的 collect/query/retention 惯例（CI artifact、崩溃目录、tombstone dir）；
4. fail-fast 路径上「尽力而为 DB 写」的可靠性评估惯例（double-fault 风险、partial write、事务中崩溃）；
5. 辩证处：每选项找真实反例；(b) 的工件文件在「跨运行结构化对账/计数」上是否真够用（D-104③ 要结构化计数留痕）；(a) 的「单查询面」在 MCP 消费面是否有真实拉动。

输出：推荐选项（可修正变形）＋理由＋对本仓既有决策的冲突核查。
