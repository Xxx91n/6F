# R28-Q13 深调研题面：quarantine 事件写库失败的管线语义（fail-fast vs 降级工件 vs 缓冲批写）

## 本仓背景

审计面产品：上游 git 数据→audit_fact SSOT＋quarantine_log 逐字段事件表（D-106/D-112，disposition=quarantined|normalized）。字节级确定性 charter；报告=投影（D-106④）；恒等式 total=clean+normalized+quarantined 三项全须库内可重算（D-107/D-112）；幂等=run_id(traceId)+自然键 UNIQUE+INSERT OR IGNORE（D-108）；非零退出枚举=协议崩溃/IO 失败/strict 门禁崩（D-111）；协议级崩溃证据=工件文件（D-109）。

## 未裁问题

**管线活着但 quarantine_log INSERT 失败**（磁盘满/锁/约束违例/IO 错）时的语义：

- **(a) fail-fast**：insert 失败→硬崩非零（归入既有 IO 失败类）＋幂等重跑自愈。论据：审计产品不能产出「声称落库而实际没落」的报告；恒等式不破；字段级事件单证据面；
- **(b) 降级工件+继续**：失败事件落工件文件、报告标 degraded。论据：可用性优先；但恒等式库内重算破产＋字段级事件出现第二证据通道；
- **(c) 内存缓冲+运行末单事务批写**：全有或全无原子性；但大仓内存压力＋运行中零可见性＋失败发现推迟到末尾；
- **(d) 逐 commit 事务**（fact+quarantine 同事务）：commit 内原子跨 commit 不原子。

## 调研任务

工业界成熟心智模型取证：① ETL/审计管线对「审计日志/错误表写失败」的惯例——审计 sink 失败时主流是 fail-stop 还是 degrade？（合规审计语境「audit trail write failure」处理惯例，如数据库 audit 写失败即 abort 的先例）；② DLQ 写失败的惯例——Kafka/MQ 生态 DLQ 落盘失败时生产者行为（fail vs drop vs buffer）；③ append-only/合规日志的 write-failure 语义（WORM/合规存储惯例）；④ checkpoint/事务边界惯例——ETL 逐行写 vs 事务批写 vs checkpoint 节拍的失败恢复语义与幂等重跑关系；⑤ 「幂等重跑使 fail-fast 廉价」这一论断的先例与反例（rerun-from-scratch vs resume 的成本证据）；⑥ 辩证：(b) 的 degraded 报告在合规语境是否可接受、(a) 的可用性代价、审计完整性 vs 可用性的业界权衡表述。输出=按角度组织、结论=推荐+理由、冲突核查=对 D-106/D-107/D-108/D-109/D-111/D-112、来源清单、信息缺口、置信度。
