# R28-Q19 深调研题面：quarantine 引擎设计完备性审计——工业界关切清单 vs 本仓 18 决策覆盖图

## 本仓背景

审计产品（上游 git 数据→append-only audit_fact SSOT＋quarantine_log→确定性报告）。本轮为 quarantine 引擎（病态上游数据处理）完成 18 条设计决策，现做封口前完备性审计。**任务=找漏面**：工业界成熟 quarantine/DLQ/错误数据处理引擎的关切清单里，哪些维度本仓尚未裁？

## 已裁决策清单（覆盖图，供逐条核对）

1. 分类归属：契约层确定性判据、无 I/O（D-103/D-104）；
2. 两级划分：协议级 fail-fast／字段级 quarantine；
3. 存储：独立事件表 quarantine_log（逐字段事件 grain）＋disposition 列（quarantined|normalized）；
4. 计量：字段实例 grain 恒等式 total=clean+normalized+quarantined；
5. 运行时：run_id=traceId 幂等（自然键 UNIQUE+INSERT OR IGNORE）、recorded_at 可空确定性时点；
6. 写路径：逐 commit 事务（fact+quarantine 同事务）、写失败 fail-fast 归入 IO 失败类；
7. 协议级崩溃：工件文件（结构化 JSON 含 raw_bytes_hex+run_context+counts）；
8. 门禁：仓级 accepted_reason_codes 基线（strict 模式 fail-closed）、棘轮条款；
9. verdict/exit：三态 verdict 三面投影、exit code 两档（执行轴 vs 审计轴分离）、CI default-deny 三查；
10. 治理：known-gaps 产品册＋registry 触发器册双册互链、词表 open-ended 最小种子；
11. 呈现：Intake Health 专节恒在渲染＋行内排除声明＋normalized 只计数；
12. 验证：恒等式双层对账（引擎内断言+独立 check 脚本 SoD）、39/40 parity 处置感知矩阵、双层 fixture（合成+真仓回灌）；
13. 证据：raw_bytes 有界截断+指纹三件套、git 重放兜底可归因。

## 调研任务

以「找漏」为目标取证工业界关切清单：① DLQ/quarantine 成熟实现的完整关切面——Kafka Connect error handling、AWS DLQ redrive、Azure/Flink/Kimball ETL quarantine 的 feature checklist 有哪些本仓未覆盖维度（如：TTL/保留期？重放/重处理机制？配额？告警集成？访问控制？PII/敏感数据处理？）；② 审计/合规产品对 quarantine 数据的保留与处置惯例（retention、redrive-after-fix、purge 政策）；③ 「病态数据重放」面——上游修复后 quarantined 数据是否/如何回流（reprocessing/replay 是本仓未裁维度吗？本仓定位=只读审计非修正管线，此维度是否本就无意义？）；④ 运维关切面——quarantine_log 的容量管理/归档/压缩、monitoring 指标、runbook 惯例；⑤ 安全关切面——病态数据本身的毒性（恶意构造字节进库后的二次风险——读侧注入？）、MCP 只读面的访问控制惯例；⑥ 评估：漏面清单分级=「本仓必须裁」/「明示不适用并记录理由」/「impl 级参数」。输出=漏面清单分级+各面工业惯例+结论（是否可封口）、冲突核查、来源清单、信息缺口、置信度。
