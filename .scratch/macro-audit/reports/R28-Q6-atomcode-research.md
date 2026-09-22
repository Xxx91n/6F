# R28-Q6 atomcode 调研存档（ctx_batch_execute 输出整理）

> 2026-09-22 轮28 grill Q6：「quarantine_log 写入语义」——run 身份、幂等重放、recorded_at 时点。
> 题面存档：R28-Q6-research-prompt.md。执行：atomcode -p 串行单发（94 行/14.6KB/12 索引节）。
> Sufficiency Gate：Airflow 官方档+dagrun.py 源码+#62126 issue、Fivetran、Data Vidhya、Factor House（Spring Kafka DLT 头原文）、AutoMQ event-time 长文、dbt store_failures 官方、Software Patterns Lexicon（null temporal+bitemporal）、XTDB/Confluent 检索交叉。

## 1) 执行摘要

**推荐 (a) 为基底＋两点修正变形：① 「同仓态重跑=no-op」落成显式自然键约束（commit_sha＋field＋reason_code＋run_id 的 UNIQUE/INSERT OR IGNORE），不仅靠写入方纪律；② recorded_at 必须可空且 NULL 语义在列级注释＋报告投影中固化为「valid time 不可得」，报告/MCP 投影面把 NULL 渲染为显式文案，杜绝被误读为「开放式有效」或漏检。** Confidence：高——run 身份与幂等两条 ≥3 独立信源交叉；唯一中置信点=null-sentinel 之争（风格选择非对错）。

## 2) 分点结论

**① 确定性可重放系统中运行身份必须由内容/逻辑位派生，禁墙钟——(a) 成立 (d) 出局。** Airflow（工业编排器事实标准）：run_id=generate_run_id(run_type, logical_date, run_after) 从数据区间（logical date）派生非执行墙钟＋UniqueConstraint(dag_id, run_id)——「运行身份=逻辑身份」天然幂等（同 logical date 重跑命中同 run_id）；Airflow #62126 专 issue 记录 run_id 不稳定如何丢失审计数据=(d) 现实代价实证。Fivetran：无可声明主键时「impute a primary key by hashing the contents of the entire row」——内容哈希作身份是数据管线幂等标准兜底，与 traceId=sha256(ctxLabel|headSha|headDate) 同构。

**② 双时间戳分工成立——observed_at=valid time、recorded_at=transaction time 角色；但 transaction time 的存在不豁免确定性。** Bitemporal 惯例（Software Patterns Lexicon＋XTDB）：valid time=事实真实世界时点、transaction time=记录进系统时点。quarantine_log 里 recorded_at 扮演 transaction-time 角色（管线观测时点）——D-105 禁的是 observed_at（valid time）借用 ingest 墙钟，recorded_at 是另一时间轴；**但其取值仍须确定性**——唯一可用的确定性管线观测时点=headDate（=该 run 的 observed_at 值），锚病态路径无可填值→NULL。

**③ valid time 不可得时惯例：NULL（带文档化解释）优于 sentinel 假日期。** Software Patterns Lexicon《Handling Null Temporal Values》原文：两正统路径=Default Interpretation（NULL 带角色化解释）与 Explicit Replacement（区间外 sentinel 如 9999-12-31）——关键细分：sentinel 正当用途=「开放式/无限期」（需 range query 正确排除），本场景是「未知」非「无限期」——审计 SSOT 填假日期=伪造证据。反例警示：NULL 会被误读（漏检 recorded_at<X、误读为开放式）——只能靠列级约束＋投影面显式渲染消除=修正②来源。COBOL 缺测 sentinel（LOW-VALUES/全 9 日期）存在于 range-safe 需求场景；本仓对账恒等式=两表 COUNT 差集（等值计数非 range 谓词）NULL 无妨碍。

**④ DLQ/错误事件时点实证：业界记的是「结构性身份」不是墙钟。** Spring Kafka DLT 诊断头=kafka_dlt-original-topic/partition/offset/exception-message/exception-fqcn——无一条摄入墙钟；错误事件身份与可追溯性靠「源位置+异常结构」。at-least-once 下 DLT 重复条目是已知现实，靠 enable.idempotence 供给侧抑制——DLQ 生态自己也在向幂等去重收敛。dbt store_failures 每次运行覆盖——错误明细表在重跑覆盖契约下不需时点列；本仓 append-only 故必须靠自然键去重补齐这层=修正①依据。AutoMQ event-time 三分法：ingestion time 正当角色=运维度量非事件语义——支持 recorded_at 保留为操作面可空列但永不进确定性投影/对账恒等式。

**⑤ (b)「摄入时点诚实论」辩证——在流式 DLQ 域确是主流但在本仓域是主流之外的例外。** Kafka broker 默认打 LogAppendTime/CreateTime 墙钟，流式 DLQ 携摄入时刻是常态（Factor House/AutoMQ/Confluent 一致）；但这些系统幂等契约=at-least-once＋下游去重非「同输入两跑字节级一致」。本仓 charter 承诺字节级确定性可重放，墙钟列使库文件本身两跑不同字节——诚实的是墙钟、破产的是 charter。判据=幂等契约类型（overwrite/at-least-once vs 字节级可重放）非抽象「诚实」。

## 3) 对比矩阵

| 项 | run 身份确定性 | 幂等语义 | 锚病态行为 | 与本仓纪律相容性 | 判定 |
|---|---|---|---|---|---|
| (a) run_id=traceId＋recorded_at 可空 | 内容哈希（Airflow logical-date 同构） | 自然键去重=no-op | recorded_at NULL=时点不可得自证 | 全对齐 D-105/106/107 | 推荐（加两修正） |
| (b) recorded_at=ingested_at 墙钟 | run 身份仍可确定性 | 同输入两跑不同行幂等破产 | 有值但语义为摄取时刻 | 需报告面显式排除=永久税；违 G6 先例 | 否决（流式域诚实论如实登记） |
| (c) 无 recorded_at 列 | ✓ | ✓ | 时点经 run_id→traceId 反查，锚病态无值可查 | 最少字段但失去 bitemporal transaction-time 轴 | 备选（信息损失换极简非必要） |
| (d) run_id=单调序号/时间戳 | run 身份非确定性 | 对不出同一逻辑运行 | — | 违确定性回放 charter；Airflow #62126 反例 | 否决 |

## 4) 冲突核查

| 决策 | 结果 |
|---|---|
| D-105（observed_at 红线） | 无冲突。recorded_at 独立 transaction-time 轴不回灌 observed_at；锚病态 NULL=不借用任何墙钟的极致形态 |
| D-106（recorded_at 取值未裁） | 填补空位非改向：recorded_at=管线观测时点（确定性值源=headDate）、可空、NULL 仅锚病态路径、永不进确定性投影/对账恒等式 |
| D-107（字段实例 grain 恒等式） | COUNT 差集对账不受 NULL 影响；自然键 UNIQUE 与恒等式兼容互为加强 |
| traceId 哈希约定 | 直接复用；锚病态哈希 raw bytes 保持 |
| macro-b 读序 | run_id=traceId 使 quarantine 行在读取前已可定位运行 |
| G6 回放先例（no clock fields） | (a) 一致；(b)(d) 违——本裁决最强仓内本地证据 |

## 5) 来源清单

Airflow Dag Runs 官方档＋dagrun.py 源码（generate_run_id/UniqueConstraint）＋issue #62126；Fivetran 官方（内容哈希主键兜底）；Data Vidhya；Factor House（Spring Kafka DLT 头原文）；AutoMQ event-time 三分法长文；dbt store_failures 官方档；Software Patterns Lexicon（Handling Null Temporal Values＋bitemporal-modeling）；XTDB/Confluent 检索级交叉。

## 6) 信息缺口

null-vs-sentinel 属风格选择（中置信点）非对错级；DuckDB reject_errors 是否有 run 标识列未本轮重核（R28-Q4 索引可回查）；「同输入两跑字节级一致」域的专门文献稀少，论证主要经 Airflow/Fivetran/dbt 先例类比。
