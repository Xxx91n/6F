# R28-Q5 atomcode 调研题面

> 2026-09-22 轮28 grill Q5。数据源纪律：调研须回顾 decision-ledger 全部 current 记录、docs/adr 全部 ADR、CONTEXT.md 全部词条、工业界成熟心智模型（重点）。结果辩证看待；与 current 决策冲突→标 revised 呈报不静默改向。

## 系统背景

工程内容审计产品（Agent Plugin 形态）：DuckDB 单文件 fact 表=SSOT、只追加、schema 演进走版本号、报告=read model 投影、字节级确定性可重放、MCP 只读查询面。git log 采集链路已建违约两级处置（D-100）：协议级违约 fail-fast；字段级病态进 quarantine（字段置 null+malformed 印记+reason code）。

## 已就位决策（本题约束）

- D-100③：报告头覆盖率恒等式 `total=clean+normalized+quarantined`（未定义 total 计量对象）；「单字段 quarantine 比例超阈→升级该仓 unsupported」；派生统计须声明排除行；
- D-103：契约层三态分类器（clean/normalized/quarantined），判定+诊断数据归契约层、计数归消费面；
- D-104：本轮仅 %cI 接线，机制可泛化（新判据=新分类器条目+回归用例）；兜底码 UNCLASSIFIED_FIELD_ANOMALY；reason code 对齐 git fsck msg-id；
- D-105：headDate 锚字段基数 1，病态→阈值升级 unsupported（巧合收敛声明入规）；
- D-106：quarantine_log 独立表 grain=逐病态字段事件（一行=一 commit 一字段病态）；恒等式=两表 COUNT 差集 SQL 对账可重放。

## 裁决问题

恒等式与阈值的计量 grain：

- (a) 字段实例 grain＋逐字段恒等式（total_%cI=clean+normalized+quarantined 每接线字段一条；commit 级受影响数仅作报告呈现派生量；阈值分母=该字段观测实例总数）；
- (b) commit grain（分母=commit 数，一 commit 任字段病态计 1；未来多字段时与 quarantine_log 行数对不上账）；
- (c) 双 grain 并报（字段级恒等式＋commit 级汇总同进报告头；双口径漂移风险）。

现状只 %cI 一字段接线故两 grain 数值相等、分歧不可见；第二字段接线即分叉（一 commit 的 %cI+%an 双病态=2 行 log vs 1 病态 commit）。

## 调研任务

1. 工业界数据质量/DQ 度量与 quarantine 计数的计量 grain 惯例：逐字段/逐列/逐行/逐记录哪种为主？（dbt test 结果计数、Great Expectations validation result、DuckDB reject_errors 计数、Databricks expectations 计数粒度、Kimball error event 计数、数据质量 KPI 文献如 completeness/validity 率的分母定义）；
2. 「逐字段恒等式 vs 逐记录恒等式」在多字段病态场景的对账/可重放后果；
3. 阈值（quarantine ratio）分母定义的工业惯例：per-column failure rate vs per-row failure rate（dbt/GE/Databricks 阈值语法实测）；
4. 「受影响实体数」（distinct commit 受影响）与「字段病态数」双指标并存的呈现惯例——报告层怎么摆不漂；
5. 辩证处：每选项找真实反例；(a) 看似被 D-106 log grain 锁定——检查这是否真是推论还是可争议点。

输出：推荐选项（可修正变形）＋理由＋对本仓既有决策的冲突核查。
