# R28-Q3 atomcode 调研存档（ctx_batch_execute 输出整理）

> 2026-09-22 轮28 grill Q3：「锚点字段病态的处置层级」——headDate（单值观测锚：observed_at/traceId/decided_at 全吃它，NOT NULL 崩全表）病态时 fail-fast vs quarantine vs unsupported vs 回退编造。
> 题面存档：R28-Q3-research-prompt.md。执行：atomcode -p 串行单发。
> Sufficiency Gate：searches 13（AnySearch 三批主力；Exa/Tavily 额度耗尽 402）| angles：Official/Comparative/Criticism/Currency | full reads 7（Flink time docs/Confluent event-time/Databricks expectations/PCAOB AS 3105/HiveMQ Health API/OneUptime poison message/ICAEW；ICAEW PDF 二进制未计读）。

## 1) 执行摘要（Tl;dr）

**推荐 (c) 为主、(a) 为边界兜底的复合裁定，拒绝 (b) 与 (d)**（Confidence：中高——行业惯例三源以上交叉支持，但「基数 1 锚字段」无直接先例，属类比推理落地）。核心依据：审计业 disclaimer of opinion 是一份报告而非沉默（PCAOB AS 3105：取证不能→产出「不发表意见」显式报告）；流处理业对源时间戳不可信有成熟先例但明确反对混用 event-time 与 ingestion-time（Confluent：混用破坏原始时间线，只有事件时间支撑历史重放=本工具字节级可重放命门，故 (b) 必拒）；Databricks fail 动作=更新失败留错误工件非进程消失。(c) 不是新机制=现有阈值升级在锚字段上的自然延伸——但须配独立信号区分「数据病态」与「工具连 HEAD 都读不了的基建故障」。

## 2) 分点结论

### ① 锚点元数据病态 vs per-record 字段病态：行业区别对待的方式是「作用域放大」非「特权化」

- Per-record 病态→quarantine/drop 是行业标准（Databricks expectations 三档 warn/drop/fail＋隔离表模式；GE unexpected_list 报告式失败；DLQ 诊断信封 failure_class/first_seen_at）；
- 锚点/全局元数据病态→作用域放大到影响范围：DLQ 理论（依赖级故障与单条病态必须分组，「依赖中断让所有合法消息一起失败」——headDate=「一条字段病态=全 fact 行 observed_at 连带不可判定」的依赖级故障，天然落整仓级裁定非单条桶）；健康检查语义（HiveMQ：UNKNOWN/DEGRADED/DOWN 显式分立，UNKNOWN=200=被声明的状态非异常）；审计准则（PCAOB AS 3105：范围受限按重要性分 qualified=局部限定 vs disclaimer=全局不发表意见——headDate 波及全部 fact 行=pervasive→disclaimer=unsupported 裁定，非 qualified=单字段印记）。
- **结论**：行业无「锚字段直接 fail-fast」惯例；惯例=按辐射范围升级裁定层级，「锚点不可得」是显式命名状态非崩溃。

### ② 「unsupported/N/A 裁定」vs「硬崩」：裁定式产出是更高级形态

对照表：disclaimer of opinion=显式不发表意见报告+原因段（整份报表，对应 (c)）｜qualified opinion=限定意见（局部项目，对应现行字段级 quarantine）｜Databricks expect_or_fail=更新原子回滚+错误工件（单表更新，对应 (a) 温和版）｜DLQ+诊断信封（单条消息=现行 quarantine）｜UNKNOWN/DEGRADED 健康态=200+显式状态字段（组件=(c) 运行时形态）｜503 DOWN=拒绝流量=(a)。硬崩唯一正确场合=契约/协议层违约；数据值病态三家框架全选「产出+标记」非「消失」。ISA/PCAOB 体系：取证不能必须产出 disclaimer 报告（withdraw 仅法律许可时补充），非离场不留言。(c) 产出=绿（管线绿）与红（裁定红）的正交声明，不是掩败。

### ③ observed_at 语义纪律：event-time vs processing-time 之争在本场景的映射——(b) 违反、(d) 伪造、schema 双列设计本来就对

- Confluent 官方：「不能信任事件源提供可靠时间戳时 ingestion-time 是首选替代」——看似支持 (b)，但前提被锁死「if it is not feasible to fix the root cause」；headDate 病态是可诊断根因非不可修复的源不可信；
- Flink 官方：event-time 价值=「重放历史数据得到一致确定结果」，processing-time 不提供确定性。observed_at 退化为 ingested_at=同一 commit 两次运行产出不同时间戳→traceId 哈希变→全报告不可重放=摧毁 charter 属性，不止「时点语义改变」；
- 本仓 schema（A-007/R3-D3）已做出正确隔离：observed_at（采集器给定可重放）与 ingested_at（写者权威 DEFAULT current_timestamp 防伪造）双列并存——摄取时点只能顶摄取时点位，永不冒名观测时点；
- (d) 最差=用别人 commit 时间冒充本次观测时点=编造证据（fabrication），审计纪律里比 disclaimer 严重得多；且 traceId 哈希输入被无关时间戳污染破坏可追溯性。直接排除。

### ④ 建制推荐（裁定层级自上而下）

1. **协议层（保留 fail-fast）**：git log -1 本身执行失败（仓非 git/HEAD 悬空/git 二进制缺失/权限错误）=「工具连仓都无法枚举」基建级故障走 contract error 硬崩——裁定主体（仓身份/HEAD 引用）不可得时无该仓裁定可言。**本层只覆盖「读不到 HEAD」不覆盖「读到了但值畸形」**；
2. **值病态层（(c) 经既有机制）**：headDate 作为普通受裁字段进校验；%cI 不匹配 ISO-8601→置 null+malformed 印记+专用 reason code（建议 anchor_head_date_malformed 类与其他字段病态码区分）；基数 1→病态率 100%→既有比例阈值升级自动触发→该仓 unsupported 裁定报告。管线跑通/工件齐备/裁定落数/绿——与现行三级体系完全同构，不引入新机制只确认锚字段不享有豁免；
3. **防掩盖信号（(c) 的必要配套）**：DLQ 纪律「DLQ is not a successful sink—alert on newly visible DLQ messages」移植：unsupported 裁定率=独立聚合指标；报告 exit code 可为 0（管线绿）但必须携带机读 verdict:unsupported+reason class 供上游聚合器告警；reason code 中 anchor_* 类单列——「连观测锚点都病态」与「某字段偶发畸形」可疑度不同级（后者可能是数据噪声，前者高度暗示攻击性构造 commit 或工具 bug）。

**对反方观点的辩证回应**：
- 「(a) 更符合 fail-fast 精神？」部分成立：fail-fast 正确作用点=第 1 层（读不到）与校验器契约（校验器自己 throw≠整管线崩），非把值病态也硬崩。Databricks expect_or_fail 适用场景=「病态记录不可接受时阻断下游污染」——本架构 quarantine+裁定已阻止污染落数，硬崩=重复保险且丢失报告工件，还带来审计工具最忌讳的「不可重放的失败」（下次跑可能通过或崩别处）违反确定性 charter；
- 「(c) 掩盖基建故障？」裸用 (c) 成立——故第 3 层不可省：审计准则同样要求 disclaimer 报告必须披露范围受限原因（AS 3105 .05），理由码=防掩盖制度设计非装饰。另若病态 commit 恰是 HEAD 且人为构造，(c) 让管线继续跑完其他仓是对的（一个坏 commit 不应瘫痪全网审计=DLQ 隔离解除阻塞价值，代价=该仓无数据需报告显式声明）；
- **牵强处声明**：disclaimer 类比的不精确处——审计 pervasive 判断是主观裁量按影响面，阈值规则是机械的（基数 1→100%→必触发）；机械规则在 headDate 上恰好给出与裁量相同结果=巧合非同构——换一个基数 3 的准锚字段阈值机制可能给出与审计直觉不同的答案。此边界值得账本记一笔。

## 3) 完整来源清单

| 标题 | URL | 角度 | 贡献 |
|---|---|---|---|
| Timely Stream Processing — Apache Flink 官方文档 | nightlies.apache.org/flink/flink-docs-stable/docs/concepts/time/ | Official | event-time 保证重放确定性；processing-time 非确定→攻 (b) 主证据 |
| Event-Time Processing — Confluent Patterns | developer.confluent.io/patterns/stream-processing/event-time-processing/ | Official | event/ingestion/processing 三分；源不可信才退 ingestion-time 且以不可修根因为前提 |
| Manage data quality with pipeline expectations — Databricks | docs.databricks.com/aws/en/ldp/expectations | Official | warn/drop/fail 三档+quarantine 模式；fail 留错误工件非静默 |
| AS 3105: Departures from Unqualified Opinions — PCAOB | pcaobus.org/oversight/standards/auditing-standards/details/AS3105 | Official | qualified vs disclaimer 裁量标准；pervasive→disclaimer；原因必须披露 |
| Understanding audit reports — ICAEW | icaew.com/technical/audit-and-assurance/audit/reporting-and-completion/understanding-audit-reports | Official | disclaimer 定义交叉验证（证据不足且 pervasive） |
| Health API — HiveMQ | docs.hivemq.com/hivemq/latest/user-guide/health-api.html | Official | UNKNOWN/DEGRADED/DOWN 显式分立；UNKNOWN=200=(c) 运行时语义 |
| Stop Poison Messages with Bounded Retries and a DLQ — OneUptime | oneuptime.com/blog/post/2026-08-14-poison-message-dead-letter-backoff/view | Criticism | 毒消息 vs 依赖故障分组；诊断信封字段；DLQ 非成功终点须告警→防掩盖信号依据 |
| Fail Fast or Quarantine? — Towards Data Engineering | medium.com/towards-data-engineering | Comparative | 二模式对比（摘要级未全文） |
| DLT data quality — waitingforcode | waitingforcode.com/databricks/data-quality-databricks-delta-live-tables/read | Criticism | 批 DLT 原生无隔离库→quarantine 是自建高级实践（摘要级） |
| ISA 705 (Revised) — IRBA 原文 PDF | irba.co.za/upload/ISA-705-Revised.pdf | Official | 单一要素取证不能也可致 disclaimer（摘要级 PDF 未全读） |

## 4) 信息缺口

① git/git 仓「 INDIA」病态 commit 一手 issue 未定位（AnySearch 失焦）；② ISA 705 条文原文仅 PDF/摘要间接确认；③ Great Expectations 整批 validate 失败时「产出失败报告 vs 硬崩」行为细节未读一手文档。
