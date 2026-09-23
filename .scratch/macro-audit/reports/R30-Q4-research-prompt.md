# R30-Q4 深调研题面：文件级事实的 grain 处置——per-file 一等 subject vs 聚合载荷投影切片

## 本仓背景

产品=宏观+微观工程内容审计（git 记录健全的项目）。SSOT=DuckDB audit_fact 表（append-only，fact_id=collectorId+subjectRef+metric+valueJson+observedAt 哈希派生，subject_ref VARCHAR(512) 任意粒度）。已定（勿推翻）：文件质量卡=read-model 投影、预采集+CLI-only lazy 补采、MCP 永不写、披露四件（head_sha/advisory:true/逐指标 SSOT 可复现来源/prefetch-vs-backfill）、卡契约=kernel 数据层+确定性派生层（priority_band/percentile_rank/top_n_flag 带 derivation）+宿主叙事层。

现状实态：codelore 适配器对实体级面（hotspots 逐 path 行/entity-churn/entity-ownership/coupling/code-age）产出 facet_rows 聚合事实——subject_ref=面名（如 'hotspots'），value_json=全仓逐 path 行数组。Macro-B behavior 象限消费面读此聚合形态。

## 未裁分叉（本问）

文件级事实的存储 grain：① 卡投影时按 path 过滤聚合载荷（零 schema 改动，但文件不成一等 subject，逐指标 provenance=面级 fact_ref+行定位符）；② 采集时逐 path 发射 subject_ref=<file> 一等事实，facet_rows 转 raw 证据层（Canonical→Derived 分层，与 quarantine raw_bytes 同型）；③ 双写并存（聚合+per-file 都是一等事实，消费面须裁权威形态——双计数风险）；④ lazy 升格（首查命中才把行升格为 per-file 事实，写回只能走 CLI）。

## 调研任务

取证工业界成熟心智模型：① 实体级指标的存储粒度惯例——SonarQube measures 表/CodeScene knowledge map/Sourcegraph SCIP 符号索引/Kiuwan/CAST 的 per-file/per-entity 指标是逐实体行存储还是聚合载荷+查询切片？物化视图 vs 行存储的选择判据（OLAP 文献：detail-level fact vs aggregate table 的星型模型惯例）；② 「raw 记录+规范化事实」分层先例——ETL staging/normalized 双层、immutable raw zone（data lake bronze/silver 惯例）与审计产品的原始证据保留惯例；③ 双表征/双写的治理教训——同一数据两形态并存的一致性惯例（CQRS 读写分离、single source of truth 边界）；④ 查询时切片 vs 预物化的判据——什么条件下查询时对聚合载荷做行过滤是合理的（数据量阈值/查询频率/索引需求）；⑤ subject 一等化的价值——per-entity 主键使能的下游能力（per-entity 查询/跨尺度关联/历史追踪）。输出=推荐+各候选评估+理由+冲突核查+来源清单+信息缺口+置信度。
