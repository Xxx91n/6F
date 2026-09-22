# R28-Q15 深调研题面：病态字段值 raw_bytes 的存储边界（全量 vs 有界截断+指纹）

## 本仓背景

审计面产品：quarantine_log 逐字段事件表存 commit_sha/field/raw_bytes/reason_code/run_id（D-106/D-112）；字节级确定性 charter；证据完整=为立法触发器保留完整现场（D-104③）；协议级崩溃工件已裁全量 raw_bytes_hex 快照（D-109）；呈现面字节回显截断已定（D-114）。本问=**存储面**：raw_bytes 列全量入库还是有界截断。

事实约束：字段值上界=所在 git commit 对象大小（采集器已整体读入内存），无真无界风险；病态值可被构造很大（对抗性输入场景）。

## 选项

- **(a) 全量存储**：界=输入对象自带边界；证据完整性优先；与 D-109 全量快照同哲学；
- **(b) 有界截断＋指纹**：存前 N 字节＋original_length＋sha256(full)，完整性可验但尾部证据不可得；
- **(c) 纯截断无指纹**；
- **(d) 阈值溢写**：超界部分落工件文件＋表内指针（证据面裂开）。

## 调研任务

工业界成熟心智模型取证：① DLQ/错误表对 payload 的存储惯例——Kafka DLQ/RabbitMQ DLX/SQL Server error table/Kimball error event 存全量 payload 还是截断？截断时是否带 hash/长度指纹？② 取证/审计界的证据截断惯例（forensic capture 的截断与 hash 指纹先例——pcap snaplen、日志采样截断、WORM 存储）；③ 安全审计产品先例——payload 截断如何标记（truncated flag、original_size、hash 三件套惯例）；④ 对抗性输入角度——超大字段值作为 DoS/存储放大向量的工业界处理（尺寸上限是否被当作安全控制而非仅资源考量）；⑤ 存储成本实证——BLOB 列大行对 SQLite/DuckDB 类存储的实际影响阈值；⑥ 辩证：(a) 的对抗放大风险 vs (b) 的证据截断代价；「输入格式自带上界」论证的漏洞（git 对象可以很大/被压缩/被构造）。输出=按角度组织、结论=推荐+理由、冲突核查=对 D-104③/D-106/D-109/D-112/D-114、来源清单、信息缺口、置信度。
