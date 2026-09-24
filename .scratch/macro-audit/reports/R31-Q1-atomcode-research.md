# R31-Q1 调研报告：「观测仪器方言」是否应计入「审计对象字段病态」

> atomcode 深调研存档（R31 轮，题面=R31-Q1-research-prompt.md）。检索：web_search×5+anysearch×4+ctx_search×1（Tavily 额度耗尽由 Exa+AnySearch 补位）；原文深读 7 篇；8 独立域名；关键结论 ≥2 独立信源。

## 1) 执行摘要（Tl;dr）

**推荐候选 (a)：真缺陷=范畴误置。** `+00:00` vs `Z` 是采集工具（git 格式化器）的版本方言——同一 commit 对象在 git 自身存储中只有 epoch 秒+数字偏移，`Z` 后缀纯粹是格式化器的呈现选择（git 2.45 官方 RelNotes 原文证实：「iso-strict has been tweaked to show a time in the Zulu timezone with "Z" suffix, instead of "+00:00"」）。这一区分在可复现构建、OTel、ACL 三个领域均有成熟先例支持：**工具版本属于必须钉死的环境/仪器元数据，不属于主体测量值**。修复方向=防腐边界层先行方言归一（进 intake 契约层之前的适配层），分类器只见规范流；`normalized_tz_offset` reason code 的立法例（D-100②）须 scoped revised——`+00:00→Z` 类不再入字段病态计数。**置信度：高**——三领域独立先例同向，且与仓内「上游适配层+防腐边界（raw 上游语义不出边界）」已定原则同构，无推翻任何已定决策。

## 2) 分点结论

**① DQ 工具的「方言 vs 病理」区分（支持 (a)）**
- Great Expectations / dbt tests / Soda / Monte Carlo 的三失配面分层（data contract / quality rule / anomaly detector）中，「上游 enum 静默翻转、分布漂移」这类**值异常**才进质量判定；连接器/schema 层的形状与编码适配被显式归入 contract/adapter 层，不进字段级质量统计（Steven's Knowledge 数据质量分层矩阵原文）。GX 的哲学是「规则失败=数据坏了才失败」，等价拼写差异不在异常定义内（TextQL GX wiki：expectations 是显式清单，fail/pass 确定性）。
- 数据质量行业对 canonical-equivalent input 的通行语义：语义等价形（Unicode canonical equivalence——「same appearance and meaning…may be substituted for each other」）在比较/归一化层被吸收，**不计入异常**。数据质量统计数的是「违反不变量」，不是「发生了归一化改写」。

**② 防腐边界层职责先例（强支持 (a)）**
- Azure Architecture Center ACL pattern 原文：「This layer translates communication between the two systems…The anti-corruption layer contains all the logic necessary to translate between the two systems」——上游的一切表达差异由边界翻译层吸收，核心模型不见外部拼写。oneuptime 同文：「The translator should absorb all differences」。
- milan jovanovic（DDD 实现）：「The translation belongs at the integration boundary, so an ERP status code never becomes a condition scattered through your domain model」——与本仓「raw 上游语义不出边界」完全同构。git 2.45 的 %cI 拼写变化正是典型的「上游 wire spelling 漂移」，其吸收职责按 ACL 惯例归上游适配层。

**③ 可复现构建 / golden 跨环境惯例（强支持 (a)，同时解释 (b) 的诱惑所在）**
- reproducible-builds.org 原文给出关键判据：「different versions of a compiler will produce different output and so usage of a specific compiler version is mandated as part of the build environment」——即行业解法不是把工具版本漂移当主体输出差异，而是钉死环境：工具版本是 build environment 的一部分。「Drawing the line」原则：把哪些因素算进环境是显式决策，钉死后同输入同输出恢复成立。
- 映射到本案：git 版本=采集环境的组成部分。两条行业惯例修复路径：(i) 钉死采集 git 版本（环境契约），或 (ii) 边界层归一使分类器输出与 git 版本解耦——后者更优，因为它同时恢复「quarantine 引擎是输入的确定性函数」这一账本已立性质，而 (i) 只是把缺陷藏进环境门槛。**「same repo audited on different tool versions → different report」在字节级确定性立身之本的产品里应视为产品级缺陷**——reproducible-builds.org 明说 grep/sed 这类「简单工具」可放宽为「any recent Unix-like system」，但那是工具作者的选择；本产品把字节级确定性定为立身之本，标准由产品自己立。

**④ 遥测/观测性先例（支持 (a) 的范畴切分）**
- OTel 官方文档原文：「a Resource describes the entity producing telemetry, instrumentation scope describes the instrumenting library, and measurement attributes describe an individual measurement」——仪器元数据（采集器是谁、什么版本）与主体测量值是建模层面强制分离的三类属性，且 Resource 属性「recorded on every data point…remain reliably queryable」即环境元数据是独立披露面，不是测量值的一部分。
- 审计/合规映射：collector version / tool dialect 应作为独立披露面（如报告的环境元数据节：git 版本、采集时间、引擎版本），而非混进 Intake Health 的主体字段病态统计。这与 (a) 的修复方向完全兼容，且给 (c) 的「诚实披露」直觉一个更好的落点——诚实披露环境，但披露在环境面，不是把环境噪声倒进病理桶。

**⑤ 规范化计数语义——「改写发生了」如何诚实计数（解决张力）**
- RFC 3339 原文：`time-zone = "Z" / time-numoffset`——二者是同一语义值的两种合法拼写（「A suffix which, when applied to a time, denotes a UTC offset of 00:00」）。即 +00:00→Z 是 canonical-equivalent 改写，语义零损失——这正是它区别于 %an 输出 " INDIA"（commit 对象内真值病态）的规范学根据：前者连「值」都没变，变的是仪器的呈现层。
- 张力解法先例：Unicode 世界对「canonical equivalence」与「值异常」从不混在一个桶（NFC/NFD 只吸收等价形，非法序列另计）；DQ 三层矩阵中「发生了适配」与「违反不变量」分属 contract 层与 quality rule 层两个轴。对应到本仓：**双轴解法=「病理计数」（Intake Health，只数主体自载异常）与「方言归一计数/环境元数据披露」（边界层或报告环境节）分列**。honest-record 意图不丢：方言吸收事件仍可留痕（quarantine_log 台账已有 disposition 机制可承载，或边界层自身的归一日志），但不进 Intake Health、不进字节比对面、不打任何印记。

**⑥ git 事实核验（缺陷实证面）**
- git 2.45.0 官方 RelNotes 原文（已读）：「The output format for dates "iso-strict" has been tweaked to show a time in the Zulu timezone with "Z" suffix, instead of "+00:00"」——列于 UI/Workflows & Features 下，且其源头 commit（69e2bee1a3，Beat Bolli, 2024-03-13）commit message 自认：「Changing an established output format which might be depended on by scripts is always problematic, but here we choose to adhere more closely to the published standard」——git 上游自己承认这是可能破坏下游脚本的格式化器变更，且明确变更点在 show_date() 的格式化函数而非对象存储：commit 对象内只存 epoch+数字偏移，Z 与 +00:00 都是其呈现投影。100% 证实「差异产自观测仪器，非对象内容」。

## 3) 候选评估矩阵

| 候选 | 范畴切分正确性 | 确定性恢复 | 与已定架构（D-100/D-103~107）相容性 | 成本/副作用 | 评级 |
|---|---|---|---|---|---|
| **(a) 范畴误置：边界层归一方言，分类器只见规范流** | ✅ 工具方言归仪器面（OTel 三分、RFC 3339 等价形、ACL 吸收职责三源同向） | ✅ 输出与 git 版本彻底解耦，golden 跨宿主成立 | ✅ 与「raw 上游语义不出边界」同构；normalized 桶语义收窄（+00:00→Z 移出），恒等式机制不动，仅 reason code 词表 scoped revised | 中：需在适配层加一步确定性归一；D-100② 须立法修订 | **推荐** |
| (b) 病灶在 golden/环境面：统计移出比对面或 golden 分版 | ⚠️ 承认症状但保留范畴混淆：病态统计语义本身仍被环境污染 | ⚠️ 症状修：字节比对通过了，但 Intake Health 数字仍随宿主漂移，库内重算的「同一 commit 三桶归属」不稳定 | ⚠️ 分类语义不动则 normalized 桶的立法意图继续被环境噪声稀释 | 低：改比对面/加环境分版 golden，但留两份 golden=承认报告非确定 | 否决（症状修） |
| (c) 非缺陷：输入变输出随之=诚实披露 | ❌ 把「采集环境的仪器属性」错置为「审计对象的输入属性」——OTel 已把二者建模为强制分离的不同类别 | ❌ 同仓库→同报告的立身之本被打破，golden 永久 FAIL 于旧宿主 | ⚠️ 表面零改动，实则让 quarantine 引擎的「输入确定性函数」性质的「输入」定义泄露了环境变量 | 最低，但以产品级缺陷为代价 | 否决 |

## 4) 推荐修复方向（给 D 系列立法的落点）

[检索限流未取回本节逐字原文；按执行摘要+矩阵同义凝练：修复=防腐边界层先行方言归一（进 intake 契约层前的适配层），分类器只见规范流；D-100② normalized 立法例 scoped revised——+00:00→Z 类移出字段病态计数；reason code 词表随 scoped revised 处置；方言吸收事件留痕于边界层/环境披露面，不进 Intake Health 与字节比对面。]

## 5) 完整来源清单

| # | 标题 | URL | 角度 | 日期 | 贡献 |
|---|---|---|---|---|---|
| 1 | Git v2.45 Release Notes（官方原文） | https://raw.githubusercontent.com/git/git/master/Documentation/RelNotes/2.45.0.adoc | Official | 2024-02 | 证实 iso-strict Z 变更列入 2.45，官方一手 |
| 2 | git commit 69e2bee1a3（date.c 变更，多镜像摘要+官方 message） | https://git.mirrors.nektro.net/git/commit/69e2bee1a3ba2f9367d55992f401e6365be100ea | Official | 2024-03-13 | 证实变更在 show_date() 格式化层；git 维护者自认「可能破坏依赖脚本」 |
| 3 | git-log 文档（%cI 定义、raw 格式=对象内真实存储） | https://git-scm.com/docs/git-log/2.45.0 | Official | 2024 | commit 对象只存 epoch+数字偏移，%cI 是投影 |
| 4 | RFC 3339 原文 | https://greenbytes.de/tech/webdav/rfc3339.html | Official | 2002-07 | Z 与 +00:00=同一 UTC 偏移的两种合法拼写，等价形 |
| 5 | Azure Architecture Center — Anti-Corruption Layer pattern | https://learn.microsoft.com/en-us/azure/architecture/patterns/anti-corruption-layer | Official | — | 「layer contains all the logic necessary to translate」=方言吸收职责归边界 |
| 6 | Anti-Corruption Layer in DDD（Milan Jovanović） | https://milanjovanovic.tech/blog/anti-corruption-layer-ddd | Comparative | 2026-09-22 | 「translation belongs at the integration boundary」实现级佐证 |
| 7 | Reproducible Builds — Deterministic build systems | https://reproducible-builds.org/docs/deterministic-build-systems/ | Official | — | 工具版本属 build environment 须钉死；「同输入同输出」的环境定义 |
| 8 | OpenTelemetry Metrics 概念文档 | https://opentelemetry.io/docs/concepts/signals/metrics/ | Official | — | Resource/仪器/测量三分建模；环境元数据独立且随每数据点披露 |
| 9 | Unicode equivalence（Wikipedia） | https://en.wikipedia.org/wiki/Unicode_equivalence | Official-ish | — | canonical equivalence=「may be substituted」；等价形吸收不入异常 |
| 10 | Data Quality 分层矩阵（Steven's Knowledge） | https://stevenzg.com/software-development/data-engineering/data-quality | Comparative | — | contract/quality-rule/anomaly 三层各自捕捉面；值异常才进质量判定 |
| 11 | Great Expectations 综述（TextQL wiki） | https://textql.com/wiki/great-expectations | Community | — | GX 异常定义=违反显式期望；等价拼写不在内 |
| 12 | ISO 8601 Z vs +00:00（Stack Overflow） | https://stackoverflow.com/questions/35856437/ | Community | 2016 | 社区共识：Z 与 +00:00 冗余不可并存=语义等价 |

**交叉验证计数**：「Z 变更产自格式化器版本方言」←信源 1/2/3；「方言吸收归边界层」←5/6/10；「工具版本属环境须钉死」←7/8；「等价形不计异常」←4/9/12。每条关键结论 ≥2 独立信源。

## 6) 信息缺口

- git 官方测试套件对不同版本 git 二进制的 fixture 策略：未找到直接文档（git 测试的是单版本行为），由可复现构建惯例替代支撑。
- DQ 工具（Deequ/Informatica）对「连接器归一化 vs 值异常」的官方明文分类：dbt/GX/Soda 侧已从分层矩阵间接证实，Deequ/Informatica 官方文档未直接命中。
- 审计/合规产品是否把 collector version 作为独立披露面的一手规范：以 OTel Resource 惯例类比支撑，未找到审计行业直接条款。
- Tavily 引擎因配额耗尽缺席，三引擎要求实际以 Exa+AnySearch 双引擎达成。