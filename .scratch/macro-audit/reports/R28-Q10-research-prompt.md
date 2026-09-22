# R28-Q10 atomcode 调研题面

> 2026-09-22 轮28 grill Q10。数据源纪律：调研须回顾 decision-ledger 全部 current 记录、docs/adr 全部 ADR、CONTEXT.md 全部词条、工业界成熟心智模型（重点）。结果辩证看待；与 current 决策冲突→标 revised 呈报不静默改向。

## 系统背景

工程内容审计产品：DuckDB 单文件 SSOT 只追加、字节级确定性可重放、报告=read model 投影、MCP 只读查询面。三桶计数 clean/normalized/quarantined（D-100②：normalized=+00:00→Z 类可确定性归一化漂移、不打 ⚠ 单独计数防标记疲劳）。quarantine_log 独立表 grain=逐病态字段事件（D-106），恒等式 total=clean+normalized+quarantined 字段实例 grain 且承诺两表 COUNT 差集 SQL 可重放对账（D-107），写入幂等 run_id=traceId+自然键 UNIQUE+recorded_at 可空（D-108）。

## 已就位决策（本题约束）

- D-107：恒等式字段实例 grain＋两表 COUNT 差集可重放对账承诺——但盘点：quarantined 可由 quarantine_log COUNT 重算、total=commit 数可重算、**normalized 无落库面=只能靠报告自报数**（恒等式三项只兑现 2/3）；
- D-100②：normalized 单独计数不打 ⚠（防标记疲劳）——「单独计数」已定，「是否留痕逐事件」未定；
- provenance 债：normalized=报告值与上游 raw bytes 不同（+00:00→Z），字节级确定性产品把「值被改写过」不留痕=改写无出处；
- quarantine_log 表名字面不涵盖 normalized；schema 列含 reason_code（normalized 事件的 reason=归一化规则标识如 normalized_tz_offset？）；
- 基数风险：normalized 可能量大（所有 +00:00 尾巴）——留痕面须评估基数成本。

## 裁决问题

normalized 事件留痕面：

- (a) quarantine_log 加 disposition 列（quarantined|normalized）同表留痕——恒等式三桶全 COUNT...GROUP BY disposition 可重算＋改写有 provenance；表语义扩为「字段级处置事件日志」；
- (b) normalized 不落库——恒等式 normalized 项=报告自报不可库内重算（弱化 D-107 承诺），改写无痕；
- (c) 独立 normalized_log 表——grain 分开最纯但同类事件按处置结果分两张表（Kimball 是事件表+detail 表非按 severity 分表）过度切碎；
- (d) normalized 走 audit_fact metric 行——逐字段事件 grain 混入逐 commit 事实表=重演 D-106 拒绝路径。

## 调研任务

1. 工业界「成功归一化/数据修正」事件的留痕惯例：ETL 数据清洗日志、geocoding/address normalization audit trail、HL7/FHIR 数据转换留痕、数据库 silent truncation 惯例——「值被自动修正」是否记录逐事件还是仅计数；
2. Kimball error event schema 的 detail 表是否涵盖「warning/修正级」事件（非仅错误）；severity 分级在同表还是分表惯例；
3. 恒等式/对账面的「全项可重算」纪律：数据质量产品（GX/dbt/Soda）的覆盖率统计中「自动修正数」是否可重放核验还是仅报告自报；
4. 审计产品的 provenance 纪律：值被确定性改写时「改写事件」留痕的先例（lineage 系统、OpenLineage、dbt source freshness、WORM 审计日志）；
5. 基数考量：高基数 normalized 事件留痕的工业做法（采样/聚合/全量）；
6. 辩证处：每选项找真实反例；(a) 的同表双 disposition 是否破坏 D-106 grain 判据（quarantined 与 normalized 是否同一 grain）；(b) 的「不落库」在审计产品语境是否可辩护（normalized 语义=值仍正确仅格式漂移——「没有错误的正常事件」需要留痕吗）。

输出：推荐选项（可修正变形）＋理由＋对本仓既有决策的冲突核查。
