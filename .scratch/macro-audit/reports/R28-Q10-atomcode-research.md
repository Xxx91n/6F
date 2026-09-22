# R28-Q10 atomcode 调研存档（ctx_batch_execute 输出整理）

> 2026-09-22 轮28 grill Q10：「normalized 事件留痕面」——quarantine_log 加 disposition 列 vs 不落库 vs 独立表 vs fact metric 行。
> 题面存档：R28-Q10-research-prompt.md。执行：atomcode -p 串行单发（94 行/13.0KB/8 索引节）。
> Sufficiency Gate：Kimball 官方、Databricks DQX 官方、OpenLineage spec、FHIR Provenance spec、SQL Server implicit conversion 多源、Algolytics 反例、sysdesign.wiki 审计日志——每关键结论多源交叉，置信高（Tavily 超限由 Exa+AnySearch 承担）。

## 1) 执行摘要

**推荐 (a)：quarantine_log 加 disposition 列（quarantined|normalized），表语义扩为「字段级处置事件日志」，恒等式三桶全部 COUNT...GROUP BY disposition 库内可重算。** Confidence 高。判据：Kimball error event schema 与 Databricks DQX 两独立权威先例都把「错误级」与「警告级」放同一张表、severity/disposition 作列值而非分表判据；SQL Server silent conversion 工业话语一致把「静默改写不暴露」定为反模式；本仓审计产品定位下 (b) 的「值仍正确所以不留痕」不可辩护——恒等式已被 D-107 承诺为可重放对账，normalized 自报数是 2/3 兑现的已知债务，(a) 是唯一同时偿清 provenance 债与恒等式债的选项。

## 2) 分点结论

**① severity/disposition 分级=同表＋列值，不按严重度分表（零反例）。** Kimball error event schema 一套事件表+detail 表无按 severity 分表先例——screen 探测到的事件无论处置如何都进同 schema；Databricks DQX output/quarantine 表同构均带 _errors/_warnings 两数组列，checks 表 criticality 列取值 error|warn=severity 是列值；OpenLineage DataQualityAssertions spec 原文：severity 与 success 显式正交，「success:false+severity:warn」组合必须保留在 lineage 元数据——探测到问题与处置后果是独立维度=disposition 列语义。(c) 形态零先例。

**② 「值被自动修正」留痕：审计语境逐事件，运维遥测语境可聚合。** SQL Server implicit conversion 多源一致：静默转换是要被检测暴露的问题非可接受状态（沉默=债暴露=对）；FHIR Provenance spec：覆盖「transforming, modifying」活动——值被确定性改写属必须留 provenance 类别；审计日志判据=全量捕获 append-only，采样属 metrics/tracing 不适用审计日志——normalized 量再大也是审计面，全量落库是审计惯例，DuckDB 列存行成本支持。

**③ 对账面「全项可重算」纪律。** DQX summary metrics：metric 每 run 一行 long format 落表且与行级 _errors/_warnings 经 run_id 关联可 join 对账——汇总数与逐事件明细同库共存，计数项靠明细表聚合重算自报数只做对账基准；OpenLineage column lineage facet：字段级转换逐 field 逐 transformation 记录。反例：Algolytics 地址标准化逐字段修正事件不留独立日志靠输入输出对照——非审计产品里真实存在，但本仓本身就是审计工具、差异化价值恰是「每个数可回溯」，采纳客户侧弱惯例=自毁卖点。

**④ grain 判据检验：quarantined 与 normalized 同 grain。** 两事件形状完全相同：同 commit、同字段、同 raw bytes、同规则触发（都是 classifyGitIsoField 产出的 {status,value,reason_code,raw}）——差别仅 status 取值；同一事件形状=同一 grain，disposition=事件上的退化维度（degenerate dimension）加列不换 grain。**(b) 在本仓不可辩护**：(i) 字节级确定性承诺下 +00:00→Z 改写不留痕则该改写与上游篡改在证据面不可区分；(ii) D-107 已承诺恒等式可重放对账、normalized 不落库=该项永不可库内重算=承诺从签字日起是空头支票。(d) 再否定：commit grain 表混逐字段事件=D-106 已拒路径重演。

**⑤ 表名与 schema 演进。** quarantine_log 字面不再涵盖新语义——倾向保留表名＋文档层重定义语义为「字段级处置事件日志（field disposition event log）」（改名破坏已有对账 SQL 兼容性，等下个 schema 版本跃迁再议）；normalized 行 reason_code 用受控词表新增归一化规则标识（如 normalized_tz_offset）；raw_bytes_hex 天然承载「改写前值」provenance 债就地偿清。

## 3) 冲突核查

| 决策 | 结果 |
|---|---|
| D-107 恒等式+两表 COUNT 对账 | 升级非冲突：normalized 项从报告自报升级为库内重算 2/3→3/3；对账 SQL 变 GROUP BY disposition 或维持差集过滤均可重放 |
| D-100② normalized 不打 ⚠ | 不冲突但需消费面约束：存储层加列不动展示决策；报告投影层写明 disposition=normalized 行在逐 SHA 清单人读面不渲染为 quarantine 警示仅计数——展示规则非存储修订 |
| D-106 grain=逐病态字段事件 | 不冲突：disposition 是事件属性列不改 grain；三态分类器保证两类事件同形状 |
| D-108 写入幂等 | 不冲突需扩展：normalized 行继承同款幂等键，自然键中加入 disposition 维度避免与同字段 quarantined 事件撞键 |

**零 revised**——(a) 在 D-107 框架内偿清已登记债务，方向与既有 current 决策同向。

## 5) 来源清单

Kimball Techniques Error Event Schemas（单一 schema+detail grain=每事件每列，severity 非分表判据）；Databricks DQX Table Schemas（_errors/_warnings 同行、criticality 列值化、summary metrics 可 join 对账）；OpenLineage DataQualityAssertions facet（severity×success 正交必须保留）＋column lineage（逐字段 transformation）；FHIR Provenance spec（transforming/modifying 一等留痕对象）；SQL Server implicit conversion 批评多源（沉默=债）；sysdesign.wiki 审计日志设计（全量捕获 vs 采样是遥测）；Algolytics 地址标准化（反例：非审计产品逐字段不留痕）。

## 6) 信息缺口

Elysiate 原文反爬拦截（搜索摘要旁证）；Tavily 配额耗尽双引擎+直读原文承担交叉；geocoding 商用厂商逐字段修正日志 schema 无公开一手档（Algolytics 单源置信中）；DuckDB upsert 幂等沿用 D-108 设计未本轮重核。
