# R28-Q5 atomcode 调研存档（ctx_batch_execute 输出整理）

> 2026-09-22 轮28 grill Q5：「覆盖率恒等式与阈值的计量 grain」——字段实例 vs commit vs 双 grain 并报。
> 题面存档：R28-Q5-research-prompt.md。执行：atomcode -p 串行单发（90 行/13.8KB/9 索引节）。
> Sufficiency Gate：三引擎首轮（Tavily 超限→Exa+AnySearch 补位）＋定点深挖 GX 官方 result_format/Databricks expectations+event logs/dbt severity/Kimball 原档＋本地 grep D-100 原文核对。

## 1) 执行摘要

**推荐 (a) 字段实例 grain＋逐字段恒等式，阈值分母=该字段观测实例总数；commit 级受影响实体数仅作报告头派生呈现量（≈(c) 的呈现但不承载对账义务）。** Confidence：高——Kimball error event schema、Great Expectations、Databricks expectations、dbt test 四家独立先例在计数 grain 上同向（全部按判据实例/字段计数），且与 D-106 quarantine_log 逐病态字段事件 grain 天然对账。**与本仓既有决策零冲突，无需 revised**；但需一条澄清性注记（非改向）：D-100③ 恒等式的 total 计量对象显式定义为「每接线字段一条恒等式」，属把未定义项补齐非推翻。

## 2) 对比矩阵

| 方案 | 恒等式形态 | 阈值分母 | 与 quarantine_log 对账 | 多字段分叉风险 | 工业先例对齐 |
|---|---|---|---|---|---|
| (a) 字段实例 grain | 每接线字段一条 total_%cI=clean+norm+quar | 该字段观测实例总数 | 逐字段 COUNT 直接对账 | 无 | Kimball error detail（grain=每列）、GX unexpected_count、Databricks per-expectation failed_records |
| (b) commit grain | 一条 commit 级恒等式 | commit 数 | 与 log 行数对不上（1 commit 双字段病态=2 行 log vs 1 病态 commit） | 第二字段接线即漂移 | 无先例按此计数 |
| (c) 双 grain 并报对账 | 字段级＋commit 级都进对账义务 | 双分母 | 双口径须互证 | 漂移风险制度化 | Databricks 双指标并存但不互为恒等式 |

## 3) 分点结论

**① 工业界计数 grain：判据实例 grain（逐字段/逐 expectation/逐 column）为主流，逐记录仅用于「记录整体处置」场景。** Kimball error event schema 两层=error event fact table（grain=单次错误事件）＋error event detail fact table（grain=每列）——字段级病态计数最细 grain=每列每事件，quarantine_log 一行=一 commit 一字段病态正是 Kimball detail 层 grain；GX unexpected_count=该列意外值总数（排除 NULL）、unexpected_percent 分母=element_count（该列元素总数）、unexpected_percent_nonmissing 换分母显式变体；Databricks event logs 结构=per-expectation passed_records/failed_records。

**③ 阈值分母惯例：per-column/per-expectation failure rate 是主形态；per-row 是「整体处置」语义。** GX mostly+unexpected_percent 全以列元素总数为分母；Databricks 社区 quarantine 模式以单 expectation 失败率判断分流（分母=流经记录数）；dbt 无比例阈值用绝对失败数（error_if: "1000"）——侧面说明比例阈值必须在明确分母上定义，dbt 回避比例正因失败单元跨测试异构；Informatica：字段规则→字段实例百分比、记录规则→记录百分比——分母跟作用面走是跨厂商共识。

**④ 双指标并存呈现惯例：主指标=计数单元，实体数=辅助聚合，不互设恒等式。** Databricks UI 同展 per-expectation failed_records 与 dropped_records 各司其职从不要求相等；GX Data Docs 展示 unexpected_count＋partial_unexpected_index_list（受影响实体以索引/清单形态呈现不参与计数恒等式）。映射本仓：报告头主指标=逐字段三桶计数（承载恒等式与阈值）＋「受影响 commit 数（distinct commit_sha）」独立呈现行（清单导向服务逐 SHA 人读面）；两者 SQL 均可从 quarantine_log 重放导出无双口径对账义务。

**⑤ 辩证处：(a) 被 D-106 锁定是强推论但非循环论证，且 (a) 有独立于 D-106 的正当性。** 为 (b) 辩护的论点：commit 是审计事实单元、覆盖率业务语义=多大比例 commit 被污染、现况两 grain 数值相等故 (a) 优势纯属预防性。反驳：① D-100③ 阈值条款原文「单字段 quarantine 比例超阈」字面已锚定字段——(b) 反而要改写 D-100 字面；② D-105 已实操依赖「基数 1 字段病态率=100%→阈值触发」——该推理只在字段实例分母下成立，**(b) 会静默破坏 D-105 已采纳机制**；③ 工业先例无一按「受影响记录数」做字段规则计数。(c) 的反例：双口径并报本身无害（Databricks 实践）但危险在「并报」滑向「并账」——报告头同现两个 quarantined 数字而无主从声明则恒等式可重放对账义务歧义化；修正形态=双指标可并存呈现但对账义务与阈值只挂字段级。(a) 真实弱点（诚实披露）：恒等式条数随接线字段数线性增长报告头从一行变 N 行——缓解=N 现状=1、增长受 D-104「新判据=新分类器条目」节流、受影响 commit 数单行汇总垫底。

## 4) 与本仓既有决策的冲突核查

| 决策 | 核查结果 |
|---|---|
| D-100③（恒等式＋单字段比例阈值） | 兼容且被补齐：total 计量对象未定义→显式化「每接线字段一条」；阈值字面已暗含字段分母。零冲突 |
| D-103（判定归契约层计数归消费面） | 兼容：逐字段恒等式计数与对账全在消费面/报告层 |
| D-104（机制可泛化） | 兼容且强化：新字段接线→新增一条字段恒等式＋一个阈值，泛化天然延展无分叉 |
| D-105（基数 1 病态率=100% 触发升级） | (a) 是其成立前提：(b) 的 commit 分母会使推理失效。选 (a) 是对 D-105 的保护 |
| D-106（quarantine_log 逐字段事件 grain＋两表 COUNT 差集对账） | 直接推论：字段实例恒等式下才可平凡 COUNT 对账；(b) 需 COUNT(DISTINCT) 弱化 D-106③ 可重放声明 |

## 5) 完整来源清单

| 来源 | 角度 | 贡献 |
|---|---|---|
| Kimball Techniques Error Event Schemas | Official | detail 层 grain=每列，字段级计数权威判据 |
| GX 0.18 Result Format 官方档 | Official | unexpected_count/percent 分母=列元素总数 |
| GX Issue #10778 | Community | unexpected_count 排除 NULL 官方澄清 |
| dbt severity/error_if/warn_if 官方档 | Official | 阈值=失败行数比较无比例语法；回避比例的原因 |
| Databricks LDP Expectations 官方档 | Official | per-expectation 计量、warn/drop/fail 语义 |
| Databricks LDP Event Logs 官方档 | Official | passed_records/failed_records per-expectation 结构一手证据 |
| Informatica DQ Metrics 白皮书 | Official | 分母跟随规则作用面（记录规则→记录、字段规则→字段实例） |
| DQ Dimensions 工程参考（borghei/Claude-Skills） | Community | per-field 阈值惯例、行级完整性与列级空值率显式区分 |
| Databricks quarantine 社区讨论 | Community | 双指标并存不互证的实践佐证 |

## 6) 信息缺口

1. DuckDB store_rejects/reject_errors 计数粒度官方档本轮未重开——R28-Q4 已读记录确认其为逐错误行计数与本推荐同向，如需引文回查可复用索引；
2. DAMA DMBOK/ISO 8000 对 completeness 分母的原文定义未直接命中（paywall/正版书籍），以 Informatica 白皮书＋工程实践文档交叉替代；若后续轮次需更强学术锚可定向补 DMBOK 第 3/11 章。
