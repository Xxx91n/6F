# R28-Q1 atomcode 调研题面（存档）

> 2026-09-22 轮28 grill Q1。执行面=atomcode -p（ctx_batch_execute 串行）。

## 调研问题（verbatim 发出）

「数据摄入契约层的违约分类语义归属」：一个工程内容审计工具（审计 git 仓历史，要求全链字节级确定性、报告可重放）已对上游输出建立「违约两级处置」模型——协议级违约（列结构/分隔符/记录定界坏=所有行同病）fail-fast，字段级病态（记录定界成功但单字段值语义非法且无确定性恢复目标）进 quarantine 隔离桶（字段置 null+malformed 印记+三桶分离计数 clean/normalized/quarantined+报告头覆盖率恒等式）。模型已定，现在要裁的是「三态判定」这个分类语义的架构归属。现状：契约边界层有一个 normalize 函数一身三任（归一化+协议级形状断言+字段值断言，不符即抛异常）；消费面有三：引擎探针主路径、一个有意保留的平行对照回归脚本（import 同一 normalize 函数保「与引擎同口径」纪律）、未来的其他上游适配器（如 codelore/REST API）。选项：(a) 契约边界层导出三态分类器——字段级不再 throw、协议级仍 throw，全部消费面继承同一分类器；(b) 契约层保持抛异常不动，各消费面 catch 后自行归因分流进 quarantine 桶；(c) 契约层拆成「协议级形状断言」+「纯归一化」两函数，字段级判定语义下放给各消费面自行实现。请调研：①数据摄入/消息管线中「记录级病态数据判定」住哪层的成熟心智模型——dead-letter/quarantine 分流判定通常由 ingestion framework/connector 层还是 consumer 层承担，理由；②parse-dont-validate 与 validation-at-the-boundary 学派在多消费面共享同一解析器时对「判定结果共享 vs 各自重判」的立场；③异常即控制流 vs 显式结果类型（三态返回值/diagnostics 收集器）在字段级病态分类场景的取舍惯例——主流 parser/validator 的错误报告面形态（返回 diagnostics 列表 vs throw first-error）；④对本题给出建制推荐与理由。辩证看待：指出牵强处与反例（分类器住契约层会否使其膨胀为策略层/消费面失去病态感知粒度；catch 分流是否在某些框架里反而是惯例）。