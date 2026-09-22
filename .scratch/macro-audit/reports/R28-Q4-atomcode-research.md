# R28-Q4 atomcode 调研存档（ctx_batch_execute 输出整理）

> 2026-09-22 轮28 grill Q4：「quarantine 隔离记录的存储承载形态」——主 fact 表 metric 行 vs 独立 quarantine 表 vs 仅报告层 vs 双写。
> 题面存档：R28-Q4-research-prompt.md。执行：atomcode -p 串行单发。
> Sufficiency Gate：searches 5（web×3+anysearch×1+tavily×1 限额后 extract 补位）| angles：Official/Comparative/Criticism/Community | full reads 6+（dbt store_failures、Databricks expectation-patterns、Kimball error event、DuckDB CSV overview、Elysiate quarantine 长文等）。

## 1) 执行摘要（Tl;dr）

**推荐 (b) 独立 quarantine 表，配报告投影（≈(b)+(c) 组合，不是 (d) 的「双写」）。** 理由一句话：隔离记录的 grain（逐错误事件，含原始字节回显、reason code）与审计 fact 的 grain（逐 commit 事实）不同构——这是 Kimball error event schema 五十年成熟惯例的核心判据；且本仓 CHECK 闭集（quadrant 四值）和恒等式对账都会被混入的 meta 行悄悄腐蚀。Confidence：高——Kimball、Databricks、dbt、DuckDB 四家独立先例同向，且本仓已有 reject_errors 同构直觉。

## 2) 分点结论

**① DLQ/数据质量生态惯例：隔离记录独立存储是主流，「主表打标」是小规模便利路径，「仅日志」普遍视为反模式。**
- DuckDB read_csv 官方 store_rejects+独立 reject_errors 表：错误行不进主表、落独立 schema 的 rejects 表带完整原始行与错误列——与 (b) 完全同构（官方档已读）；
- Databricks Lakeflow quarantine 模式=is_quarantined 布尔列+PARTITION BY 物理分流——「同一逻辑数据集、物理分区隔离」，适用前提=错误行与正常行同 grain 同 schema（本场景 raw_bytes/value_json 不同构故不适用）；
- Kafka DLQ=独立 topic 带原始 payload+错误头；对单文件 DuckDB 底座「独立表」=DLQ 批式等价物（Elysiate：durable table rather than a broker DLQ——entries survive/carry structured errors/reportable with ordinary SQL）；
- dbt store_failures：失败行存独立 schema（{{schema}}_dbt_test__audit）独立表按测试名建表，明确定位为临时审计工件——判据：失败明细是排查工件不是业务事实。

**② 管线健康元数据与审计事实混表 vs 分表：分表为默认，混表仅在元数据是 fact 行同 grain 属性行时成立。**
- Kimball error event schema（官方 techniques 页原文）：数据质量错误事件记专门 error event fact table（grain=单次错误事件）+error event detail（grain=每列），「available only in the ETL back room」——权威判据=错误事件 grain≠业务 fact grain 故不进主 fact；
- Kimball audit dimension（SO 高票交叉）：与 fact 行同 grain 的少量列（load timestamp）可进 fact 表；跨行重复批次级元数据外键到独立 audit 维表——判据=grain 与基数；
- **对本仓 meta-fact 先例的辩证**：上游解析状态以 metric 行落 fact 表严格说已引入 grain 漂移（metric 行 grain=一次管线健康观测非一个 commit 事实）；当初成立因那些 metric 本身是战略面审计对象（strategic 象限有语义正当性）。quarantine 明细不同：携带原始字节回显=排查证据非可加性度量；变长 raw bytes 塞 value_json 拉宽主表、污染 metric 语义（所有 WHERE metric=... 查询要开始排除 quarantine 行）。

**③ 报告呈现层与持久层分工判据：明细进 DB 当且仅当需被 SQL 查询/对账/跨报告复用；报告只放投影。** 需求面「逐 SHA 清单+恒等式可对账+MCP 可达」三条全指向 DB；dbt 失败明细放 DB（audit schema）而非仅 run_results.json 同判据。**结论：持久层=独立 quarantine 表；报告节=对该表的投影**（非 (d) 双写——双写=两持久化面各写一份；投影=read model 与「报告从 fact 投影」纪律一致无冗余写入）。

**④ 建制推荐与落地形态**：

```
独立表 quarantine_log（同库不同表，跟随版本号演进）：
  commit_sha        -- 关联主 fact（被隔离 commit 的正常 fact 照旧落主表）
  field             -- 被排除的派生面（date 等）
  raw_bytes_hex     -- 原始字段字节回显（审计证据）
  reason_code       -- 受控词表（枚举/CHECK）
  collector, run_id -- 采集器与运行批次（对账键）
  recorded_at
主 fact 表不动：不新增 metric，不加 quadrant 枚举值。
报告头覆盖率恒等式 total=clean+normalized+quarantined 改由 SQL 联查两表对账。
MCP 查询面开放 quarantine_log 只读查询。
报告节 = SELECT ... FROM quarantine_log 的投影。
```

关键语义收益：被隔离 commit 的正常 fact（sha/paths/subjects）已在主表，quarantine_log 用 sha 外键关联即可，无需把隔离信息复制进 fact 行——恰好满足「被隔离 commit 仍产正常 fact」约束，三桶计数变两表 COUNT 差集天然可对账。

## 3) 对比矩阵

| 项 | grain 一致性 | 主表语义纯度 | MCP/SQL 可达 | 恒等式对账 | 演化路径 | 适用边界 |
|---|---|---|---|---|---|---|
| (a) metric fact 行混主表 | ✗（错误事件≠commit 事实） | 被 raw bytes/reason 污染，查询需排除 | ✓ | ✓ 但要 GROUP BY 排除杂行 | 每类隔离都要新 metric，metric 词表膨胀 | 隔离信息本身是分析对象且无 raw payload 时（meta-fact 先例正属此类） |
| (b) 独立 quarantine 表 | ✓ 独立 schema 独立 grain | ✓ 零污染 | ✓ | ✓ 纯 SQL 差集对账 | 加列走版本号不碰主表 | 错误行与正常行不同构、或需保留原始字节（DuckDB reject_errors/dbt audit/Kimball 均此路径） |
| (c) 仅报告/侧车 | — | ✓ | ✗ MCP 不可达 | ✗ 只能解析 JSON | 无库内演化问题 | 一次性诊断、无跨消费面复用需求 |
| (d) 双写 | 部分 | 污染同 (a) | ✓ | 双写引入一致性问题，违背报告=投影纪律 | 两处 schema 同步 | 无明显优势场景（Databricks is_quarantined 分区是同数据集物理分流不是双写，勿混淆） |
| **(b)+报告投影（推荐）** | ✓ | ✓ | ✓ | ✓ | ✓ | 本题需求面全覆盖 |

## 4) 牵强处与反例（辩证）

- **meta-fact 先例是否污染了 fact 表语义纯度？——是的，且应承认。** metric 行 grain 是「管线观测」非「commit 事实」，当初落 strategic 是务实次优解（避免建第二张表的运维成本）。本次不应以「沿先例」为由扩大污染面：先例正当性来自「管线状态=战略审计对象」，quarantine 明细正当性来自「排查证据」——两者语义不同。诚实处理：先例保留（不追溯重构），但明确 quarantine 走独立表，并在账本记下 grain 判据防未来继续「沿先例」滑坡；
- **反例——独立表何时杀鸡用牛刀？** 若隔离面永远单字段且量级极小（个位数/年），独立表+版本化 schema 建制成本确实超一个 metric 行。但反证：需求面已明确 MCP 可达+字节回显+恒等式对账三条 (c) 不满足 (a) 勉强；且「仅 date」是当前状态，schema 演进承诺意味未来字段会变——届时从 metric 行迁 raw bytes 到独立表比现在建表更痛。Databricks is_quarantined 分区不打独立表的适用前提=错误行与正常行完全同 schema（本场景不同构故不适用）；
- **独立表在多消费面下的对账优势是真优势**：三桶计数从「报告头自报数字」变「两表 COUNT 的可重放 SQL」——与字节级确定性可重放纪律同构：报告数字可由任何人从库重算而非信任报告生成器。

## 5) 完整来源清单

DuckDB CSV overview + reading_faulty_csv_files（Official，store_rejects/reject_errors 一等公民）；Databricks expectation-patterns（Official，is_quarantined 分区模式适用前提=同 grain 同 schema）；dbt store_failures 官方档（独立 audit schema）；Kimball error event schema 官方 techniques 页（error event fact table grain 判据）；Elysiate quarantine 长文（durable table>broker DLQ 论证）；StackOverflow Kimball audit dimension 高票答案（grain/基数判据交叉）；Kafka DLQ 生态（Confluent/Conduktor/factorhouse 检索级）。

## 6) 信息缺口

Tavily 引擎当日限额耗尽（仅 1 次成功 extract）；Kafka DLQ 细节未深读原文仅作生态对照；ISA/审计准则对「元数据与事实分库」无直接条文，分表判据由 Kimball/dbt 惯例支撑。
