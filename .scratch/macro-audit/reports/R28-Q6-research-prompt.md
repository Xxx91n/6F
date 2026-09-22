# R28-Q6 atomcode 调研题面

> 2026-09-22 轮28 grill Q6。数据源纪律：调研须回顾 decision-ledger 全部 current 记录、docs/adr 全部 ADR、CONTEXT.md 全部词条、工业界成熟心智模型（重点）。结果辩证看待；与 current 决策冲突→标 revised 呈报不静默改向。

## 系统背景

工程内容审计产品：DuckDB 单文件、audit_fact=SSOT 只追加、字节级确定性可重放 charter、报告=read model 投影、MCP 只读查询面。已建违约两级处置（D-100）＋契约层三态分类器（D-103）＋仅 %cI 接线（D-104）＋锚字段 unsupported 路径（D-105）＋独立 quarantine_log 表（D-106）＋字段实例 grain 恒等式（D-107）。

## 已就位决策（本题约束）

- D-105：observed_at 永不退化 ingested_at、永不借用他人 commit 时间（可重放性红线）；锚病态→unsupported 裁定但管线仍产报告/receipt/机读结果；
- D-106：quarantine_log 列含 run_id＋recorded_at（取值语义未裁）；恒等式=两表 COUNT 差集 SQL 对账可重放；
- D-107：字段实例 grain 恒等式；受影响 commit 数=COUNT(DISTINCT commit_sha) 呈现行；
- traceId=sha256(ctxLabel|headSha|headDate) 确定性哈希（锚病态时可哈希 raw bytes）；
- audit_fact.observed_at NOT NULL——锚病态时无任何合法值可填→该仓 audit_fact 零行；
- 顺序：macro-b 先读 headDate 后扫记录流——锚病态可能只有一行 anchor quarantine 记录。

## 裁决问题

quarantine_log 写入语义三件套：

- (a) run_id=traceId＋recorded_at=observed_at 可空（锚病态该行 null=「时点不可得」自证；自然键幂等去重同仓态重跑=no-op；跨 run 对账按 run_id 过滤）；
- (b) recorded_at=ingested_at 摄入墙钟（事件确发生在摄取时刻语义诚实，但非确定性入表、报告投影须显式排除、同输入两跑产不同行幂等破产）；
- (c) 无 recorded_at 列（时点经 run_id→traceId 反查；最少字段但锚病态时连可推导时点都没有）；
- (d) run_id=单调序号/时间戳（追加语义清晰但 run 身份非确定性=同输入两跑对不出同一逻辑运行）。

## 调研任务

1. 工业界错误事件/拒绝记录表的 run 身份与幂等惯例：DuckDB reject_errors/dbt audit schema/Kafka DLQ/Flink side-output/Spark badRecords 的「运行标识」用什么（job id/批次号/内容哈希）；重跑幂等语义（append vs dedupe vs overwrite 分区）；
2. 事件溯源/事实表惯例中「事件发生时刻 vs 记录时刻」双时间戳分工（bitemporal: valid time vs transaction time）；当 valid time 不可得时的惯例（null/unknown sentinel/留空）；
3. 确定性可重放系统中诊断/日志表的时间戳纪律：非确定性列是否允许存在、是否禁入投影面；
4. 「摄取事件」语义建模：错误事件的时点应记「数据时点」还是「处理时点」——DLQ/错误事件表的 created_at 惯例实证；
5. 辩证处：每选项找真实反例；(a) 的「null=时点不可得自证」是否有先例（COBOL/工业界缺测值 sentinel 惯例）；(b) 的「摄入时点诚实论」在错误事件域是否其实才是主流。

输出：推荐选项（可修正变形）＋理由＋对本仓既有决策的冲突核查。
