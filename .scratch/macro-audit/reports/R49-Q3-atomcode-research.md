# R49-Q3 调研报告 —— 冻结包代表性衰减呈裁（上游漂移坐实后的校准证据治理）

**执行方式说明**：atomcode 深调研派遣后 stdout 回执通道异常（MCP 回放失败），进程在途超 10 分钟未归（轮询至超限，未杀进程）；按续跑锚定规程改由本会话直调三引擎（Exa/Tavily/AnySearch）补足配额并完成定点原文核验。以下结论每条均有 ≥2 独立信源（外部惯例＋本仓账本立法）交叉。

**Sufficiency Gate**：searches: 8+（Exa ×3、Tavily search+extract ×2、AnySearch batch ×3 子查询）| angles: Official（arXiv/NIST/ILAC-G24/ISO 17025/CLARIN/ICS4ICS）· Comparative（计量 interval vs ML dataset 治理 vs corpus snapshot 三域对照）· Criticism（golden rot 衰减模式表）· Community（dev.to）· Currency（2025-07 deprecation 框架、2026-09 golden rot 文）| full reads: 5（arXiv 2507.06434 节选、dev.to 全文、Morehouse 全文、PMC 5860848 节选、ICS4ICS SKILL 摘要级）

## 1) 执行摘要（Tl;dr）

**推荐候选 (i) 双动作分层，置信度：高。** 工业界对「校准/基准证据包随上游演进而代表性衰减」的处置惯例高度一致地收敛于 (i) 的形态：**衰减声明（deprecation/staleness notice）在哨兵触发坐实后立即落账**——benchmark deprecation 框架（arXiv 2507.06434）三阶段 assessment→reporting→notification 的 reporting/notification 环节、事件管理惯例「信号确认即 declare」的时点纪律；而**重校准/更新不随之自动执行**——计量学惯例（ILAC-G24/NCSLI RP-1/NIST GMP 11）把重校准锚定在「用途＋事件触发」（in-use time/event-driven recalibration），ML 治理文（golden datasets rot）把 eval set 维护锚定在「真实流量消费拉动」上——两者都反对无消费者时的主动重校准功，也都保留（而非封死）未来按需更新的路径。冻结件字节不动、声明走元数据/账面注记，与语料库「snapshot 语义」（BNC「balanced but no longer representative of the current language」——代表性衰减被快照语义天然吸收）和供应链证据包 chain-of-custody 惯例（封条完整性≠内容代表性，后者走周期盘查）完全同构。

**逐候选一句话判词**：(i) ✅ 采纳（业界三支惯例＋本仓 D-172② 观察期条款逐字兑现）；(ii) ❌ 拒（无消费者不做校准功＋01-extract.mjs frozen 触碰前科＋新锚点裁定负担）；(iii) ❌ 拒（哨兵确认后缓声明=declare 时点纪律违反＋触发器立法形同虚设）；(iv) ❌ 拒（预封未来路，连 D-169 Accepted Risk 五要件的「到期日+复审钩」都缺——属静默丢弃态）。

## 2) 分点结论

### 2.1 「代表性衰减声明」的业界同构（裁决点①）——声明形态是惯例正型

- **ML/eval 域**：AI Standards Lab《Deprecating Benchmarks: Criteria and Framework》（arXiv 2507.06434）把基准衰减原因枚举为本案同型：「Semantic drift — datasets are static or frozen in time at the moment of their creation…can become outdated or **unrepresentative**」＋「Task obsolescence」。处置框架=三阶段 assessment→reporting→notification，产出 deprecation report＋分级 deprecation levels（从 updating 部分退役到全面退役）。关键：**deprecation ≠ 必须立即提供替代品**——「it can also be initiated independently by governance actors when creators are unavailable」。声明独立于重校准动作，声明先行是框架明文。
- **实践域**：《Golden Datasets Rot》（dev.to 2026-09）开篇判词：「An eval set is a **snapshot** of what your product needed the day you built it」；衰减模式表第一条即本案形态（policy change——gold answers encode a rule the product dropped）。处置=version it＋定期盘查＋retire/archive（不删除）。衰减被显式声明为治理对象不是被隐藏。
- **本仓立法面**：R45-T1-E 册项 verify_method 已立法预写本案路径——「漂移坐实→呈裁冻结包代表性衰减声明＋S1 重校准须有意图裁定」，声明与重校准本就是两个动词两条独立裁定，(i) 的双动作分层是该条文逐字兑现。
- **会计同构（类比级）**：IAS 10/ASC 855——期后新状况属非调整性事件：披露、不重述。上游 bbb3ba73 自主改版=冻结时点后新状况，对冻结证据=披露（声明）而非重写（不再生），与 D-172① 同向。

### 2.2 「重校准缓行挂消费拉动」是惯例处置（裁决点②）——三个独立域同向

- **计量学**：ILAC-G24:2022/NCSLI RP-1 确立重校准间隔两条合法触发制——(a) 周期制（owner 依 as-found/as-left 历史可靠性数据 EOPR 设定）(b) **事件制**（in-service checks against a known artifact trigger recalibration on demand；跌出公差/可疑测量/冲击后触发）。**没有第三种「参照物世界自己变了就无条件重测」**——interval 是 owner 依用途与风险设定的政策变量：「The calibration due date is set by the instrument owner — not the calibration lab」（UPA）。本案冻结包当前无测量消费需求（S1 无消费者），既不满足周期触发也无事件触发，缓行是惯例正解。NIST GMP 11 同向：proper time 由用途定义不由第三方参照物演进定义。
- **ML eval 域**：golden rot 文维护节奏=消费拉动——「feed it with real production failures every week…Retire cases tied to removed features」；更新由真实流量/真实失败驱动不由抽象的「上游变了」驱动；benchmark deprecation 框架同样把 updating 作独立选项而非义务。
- **本仓立法面**：ADR-0036/0038 D5 双轨先例——重校准触发锚=变更发生在**被测面**（消费侧）非参照物漂移；D-172②「有意图刷新走裁定链」——重校准须有意图裁定=非自动非禁止。(i) 的「下次真实消费需求出现时另立裁定执行 v2」正是「有意图裁定」的时点锚。
- **软测试域旁证**：Emily Bache approval-testing——登记型冻结工件变更须走重新密封/裁定，不是「顺手重新批准快照」；立即重校准 (ii) 若驱动器触碰 frozen 禁区即此禁型（本仓有 eval-driver 事故前科）。

### 2.3 上游不可逆演进时冻结包不动＋声明是否满足证据完整性惯例（裁决点③）——满足

- **语料库惯例**（PMC 5860848 原文）：「the British National Corpus is balanced, but might no longer be considered representative of the current language」——参照语料库标准语义=as-of snapshot：代表性锚定在冻结时点（BNC=representative of British English of the 1990s），不随语言演进更新；代表性衰减不否定语料作为历史证据的地位，声明（时点标注）就是治理载体。Brandeis 教材同句级：「A corpus is a snapshot of the language at a specific time」。01 系冻结包「历史证据非当前行为断言」（D-172①）与 BNC 语义逐字同构——字节不动＋声明=证据完整性惯例的满足形态。
- **供应链证据包惯例**（in-toto/DSSE/SLSA）：完整性（封条 sha256）=常驻机检（本仓 01-check F 组＋75a-check M5 已覆盖）；时效性/代表性=周期盘查判据（tenant policy 节律）非常驻断言非上游事件触发强制再生。chain-of-custody：封条完整性每次查、内容代表性定期盘查——本案哨兵盘查（T3 节律）正是该盘查的兑现。
- **判定**：满足。衰减声明把「历史证据」与「现役校准基准」双轨语义在账面上显式分开（回归钉值件继续当回归钉值用、代表性解释面标注 as-of 失效），是双轨治理的标准落法。

### 2.4 哨兵升级→裁定的时点纪律（裁决点④）——坐实后应立即裁

- **事件管理惯例**（ICS4ICS/incident command）：升级路径时点纪律=「The signal is real and confirmed…then declare」——确认即声明，且分级时 round up：「over-declaring costs a little attention, under-declaring costs the outage」。本案「两窗同签名读数＋归因物化到具体上游 commit」=confirmed 标准远超单 flaky alert 门槛；缓声明 (iii)=under-declaring，惯例反对。
- **本地立法面**：D-155 manual_watch 五要件含 verify_method——触发条件已立法钉死，触发→呈裁是义务路径；(iii) 缓声明使触发器立法形同虚设。D-148③：verify_method 自落盘 commit 起对新事件生效，本轮事件发生在生效后全额适用。
- **同时**：declare ≠ 自动缓解——incident 惯例里 declare 之后到 mitigation 之间有 triage/owner assign 空间——「立即声明」与「重校准缓行」不矛盾，正是 (i) 的分层而非 (ii) 的合并。

### 2.5 逐候选裁定

| 候选 | 裁定 | 判据 | 先例支持 |
|---|---|---|---|
| (i) 双动作分层 | ✅ 采纳 | 声明=deprecation reporting 正型；缓行挂消费=event-driven/in-use 惯例；字节不动+声明=snapshot/证据完整性惯例；立即声明=declare 纪律；冻结语义零触碰=D-172①；缓行触发锚清晰=非 wontfix 不触 D-171 | arXiv 2507.06434；dev.to golden rot；ILAC-G24/NCSLI RP-1/NIST GMP 11；BNC/PMC 5860848；in-toto/SLSA 节律；本仓 R45-T1-E/D-172②/ADR-0038 D5 |
| (ii) 声明＋立即重校准 | ❌ 拒 | 无消费者做校准功——计量 interval 由用途/风险设定不由第三方参照物演进自动触发；deprecation≠必须立即出替代品；01-extract.mjs 有 frozen 触碰前科（重校准 run 恰是高危面）；新锚点=纯裁定税 | UPA/Morehouse（owner 设 interval）；arXiv 2507.06434；Bache approval-testing |
| (iii) 缓声明再观察 | ❌ 拒 | 确认即 declare（round-up 原则）；触发条件已满足，缓声明=verify_method 立法虚设＋无穷后退；D-155 触发→呈裁是义务路径 | ICS4ICS/incident declare 纪律；D-155/D-148③ |
| (iv) 仅声明永不重校准 | ❌ 拒 | 预封未来路违背 deprecation 保留 updating 选项惯例；「S1 永久不需要」=wontfix 恒久类却无在册 sentinel＋低频盘查钩——D-169 五要件之「到期日+复审钩」缺失=静默丢弃态立法上不成立；且 (i) 已含其全部短期收益 | arXiv 2507.06434；D-169/D-171 |

### 2.6 冲突扫描（逐条对照 current 决策）

| 决策 | 对照结果 |
|---|---|
| D-172①（再生即失义/禁区） | ✅ 冻结件字节零动，声明=元数据注记不属再生 |
| D-172②（上游漂移致转红=诚实入册＋观察项移交） | ✅ 声明落账即「诚实入册」正型；(iii) 恰违此条 |
| D-171/D-169（Accepted Risk 五要件/到期形态） | ✅ (i) 不把 S1 缓行记为 wontfix 恒久类——消费拉动=事件制锚；若裁定链想把「上游代表性缺口存续至下次消费」记为 accepted risk，五要件齐备路径：判据引用=本报告＋不修理由=无消费者＋补偿控制=intent-drift-watch 哨兵续看＋T3 代表性普查节律行＋具名裁者=裁定链＋到期/复审钩=消费触发锚。(iv) 缺复审钩直接不过 |
| D-173（防双册） | ✅ 不新开册项——声明/确认入既有 anysearch-cli-intent-drift-watch 行的状态更新非第二观察项 |
| D-155（manual_watch 五要件） | ✅ 哨兵续看=既有册项原值守，verify_method 呈裁条款被兑现而非改写 |
| D-148③（生效时点） | ✅ 声明自落盘 commit 起生效 |
| D-146⑤/D-181（勘误追加/扩面勘误通道） | ✅ 若声明需对既有账行补注记走勘误追加通道无需 revised |
| D-180（收口 commit 对） | ✅ 声明落账走正常收口工序 |
| D-053/D-057①（drive-by 外联禁区） | ✅ 不动上游仓、不代排产 |

**无一处需要 revised 翻案；结论与全部 current 决策同向。**

## 4) 完整来源清单

| # | 标题 | 角度 | 贡献 |
|---|---|---|---|
| 1 | Deprecating Benchmarks: Criteria and Framework（arXiv 2507.06434，已读原文） | Official | 衰减判据（semantic drift/task obsolescence）＋三阶段声明框架＋「声明独立于替代品」＋updating 为一等选项 |
| 2 | Golden Datasets Rot（dev.to，已读全文） | Community | eval set=snapshot 判词＋衰减模式表＋消费拉动维护节奏＋retire/archive 不删除 |
| 3 | How to Set and Adjust Calibration Intervals（Techmaster，ILAC-G24/NCSLI RP-1） | Official（摘要级） | in-service checks 触发 on-demand 重校准；interval=owner 责任 |
| 4 | Calibration Intervals（Morehouse，已读原文） | Official/计量 | NCSLI RP-1 interval 调整框架：EOPR 历史数据＋风险驱动非外部事件驱动 |
| 5 | ISO 17025 Calibration Intervals（UPA） | Official（摘要级） | 「due date set by instrument owner—not the calibration lab」；in-use time 合法方法 |
| 6 | NIST GMP 11 — Calibration Intervals | Official（摘要级） | 周期重校准=探测不确定度增长；interval 由用途与可靠性目标定义 |
| 7 | Sublanguage Corpus Analysis Toolkit（PMC 5860848，已读原文节选） | 学术 | BNC「balanced but no longer representative of current language」——snapshot 代表性语义一手定义 |
| 8 | Corpus Linguistics 讲义（Brandeis CS140） | 学术（摘要级） | 「A corpus is a snapshot of the language at a specific time」 |
| 9 | Reference corpora（CLARIN ERIC） | Official（extract） | 参照语料库=时点锚定设计惯例 |
| 10 | Incident command/declare severity 纪律（ICS4ICS） | Official/Community（摘要级） | 确认即 declare＋round-up 原则＋declare 与 mitigation 分离 |
| 11 | 本仓 R45-T1-E 册项 verify_method（决策账本） | 本地立法 | 「漂移坐实→呈裁声明＋S1 重校准须有意图裁定」预立法 |
| 12 | 本仓 D-172①②③④ frozen 立法＋d-face-research 外部惯例节 | 本地立法＋外部惯例 | 再生即失义；诚实入册；完整性=常驻机检/代表性=节律盘查双轨 |
| 13 | ADR-0036/0038 D5 双轨强制重校准先例 | 本地立法 | 重校准触发锚=被测面变更（消费侧）非参照物漂移 |

## 5) 信息缺口

1. atomcode 深调研未归返——派遣后回执通道异常＋轮询超限，结论建立在知识库跨会话召回（d-face-research 同题先例、R45-T1-E 立法原文）＋本会话三引擎直调之上，未取得 atomcode 独立第三轮复核（若后续落库可 ctx_search source:atomcode 补强）；
2. 「包内单锚代表性衰减」无逐字工业标准——deprecation 框架语境是基准整件退役，本案是冻结包内单锚（intent=8）的代表性解释面衰减——属同构外推；
3. IAS 10/ASC 855 非调整性事件类比=知识库在案先例复用，未本轮重开会计准则原文（类比级证据）；
4. 消费触发锚的形态未裁定——「下次真实消费需求出现」如何物化为可核验锚（S1 需求票？Macro-A/C 消费票引用？）属裁定链落点设计，调研边界不代裁；
5. Oxford 语料库指南原文被反爬拦截未读，语料库惯例由 PMC/Brandeis/CLARIN 三源交叉补足。
