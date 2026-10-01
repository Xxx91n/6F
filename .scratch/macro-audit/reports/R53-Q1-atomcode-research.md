# R53-Q1 调研报告 —— 哨兵值守条目处置裁定（退役 vs 降级常规自检 vs 散文表维持）

> 题面：`R53-Q1-research-prompt.md`｜派遣：atomcode `-p`（ctx_batch_execute 串行，600s）｜回传：Indexed 13 sections 成功
> **组成字段（D-186）**：atomcode CLI 本体回传成功；但报告自登记其内部「载体三次派发均未回传」，正文由编排层三引擎直查完成——按 D-186 计 `degraded_performance`（内部载体降级），轮 53 构成比暂记 1/1。

**Sufficiency Gate**：searches: 10+（Exa×2、Tavily×2、AnySearch×2、ctx_search 召回×5 批）| angles: 4 类（Official / Criticism / Comparative / Currency）| full reads: 6（eslint.org 规则弃用政策原文、ESLint 2023 弃用公告原文、OneUptime 告警评审流程全文、safeguard.sh 安全回归测试全文、Prometheus watchdog 三源、本仓账本 D-160/D-164/D-169/D-175/D-183 原文行）| gaps: relvy.ai 与 Reddit 原文抓取失败（runbook 腐化仅得搜索摘要+快照引文，已换源补强）；atomcode 载体未回传（已如实登记）。

## 1) 执行摘要（Tl;dr）

**推荐候选 (ii) 降级常规自检＋registry 注册锚定（Confidence：高）**。工业界三个成熟域（lint 规则弃用、SRE 告警治理、安全回归测试）在「病灶根治但守护面存续」时的一致惯例是：**不退役、降级维护强度、但必须保留机读锚与 owner**——ESLint 弃用规则「可无限期使用但不再投入」且元数据带 `deprecatedSince`/`availableUntil`（机读锚）；OneUptime 告警评审把「无 owner 的孤儿告警」列为必须先补注册再谈处置的反模式；安全回归测试的行业标准判词是「写一个失败的测试，**永远保留**」。三候选中 (i) 直接违 D-160⑥（面未消亡即退役＝以病灶根治冒充面消亡，与 Meta ACH 通过史判据丢失 277/571 有价值测试是同型错误）；(iii) 维持散文表是无机读锚的治理黑洞——工业先例（phantom monitoring、orphan alerts、runbook rot）全部指向腐化结局。

## 2) 分点结论

### ① ESLint 弃用政策：「降级不摘除＋机读元数据」的正典形态【来源：eslint.org/docs/latest/use/rule-deprecation 原文 + eslint.org/blog/2023/10 原文 + eslint#8635】

- 官方政策逐字：「Rules will never be removed unless（有替代核心规则）或（存在功能等价插件规则）」——即**退役判据=替代物存在（同命运判据），不是「不再触发」「通过史良好」**。
- 弃用后「团队不再做任何工作（bug fix/增强/文档更新）」，但「你可以无限期继续使用」——这正是**降级为低频盘查**的工业形态：投入归零、守护能力保留。
- 关键构造：新元数据格式要求 `deprecated`（可含 `DeprecatedInfo`）、`replacedBy`、`deprecatedSince`、`availableUntil`——**弃用状态本身必须机读可查**，不是散文里写一句。弃用的 formatting rules「deprecated as of v8.53.0, will not be removed until at least v10」——弃用与摘除之间留整个大版本周期的盘查窗。
- 对照本题：stripComments 守护面是活跃共用函数（=「插件存在等价规则」不成立、替代物不存在），按 ESLint 判据根本够不上退役门槛；而当前「仅账本散文一行、无 verify_method/无 owner」恰是官方政策所禁止的「弃用而不标记」状态。

### ② SRE 告警治理：降频盘查合法，无锚值守非法【来源：oneuptime.com alert-review-process 全文 + sensu.io + firehydrant.com + Prometheus watchdog 三源】

- OneUptime 告警评审正典流程：每个告警过 **keep / fix / deprecate 三向裁决**，deprecate 须「with evidence」且「schedule removals」——退役是显式有据动作，不是默认态。评审会议固定议程含「Address orphaned alerts / Update stale runbooks」与「Deprecation Decisions」两节。
- **Orphaned alerts 反模式**：「Every alert needs a clear owner. Orphaned alerts become noise」——无 owner 是评审第一优先处置项，处置方向是**补 owner/补 runbook**，不是任其漂着。本题哨兵现状（无 owner、无 verify_method、无机读锚）正是该反模式的条目级实例。
- **Alert fatigue 与 coverage 权衡**：Sensu/FireHydrant 一致口径——疲劳治理靠**降频/调阈/降噪**（refine thresholds、classification、降低触发密度），从不靠「摘除仍有覆盖价值的守卫」。静默通过史不作退役判据的正面先例：OneUptime effectiveness 评分里「No fires = not a problem」**加满分**（actionability=25），即工业模型显式承认「没响≠没用」。
- **Prometheus Watchdog（dead man's switch）**（dev.to/irinobservability、promlabs training、paul's programming notes 三源交叉）：成熟监控栈为「哨兵自身失效」专设 always-firing 心跳，**「沉默即故障」是设计语义**——本题散文表值守正是反向形态：从不检查哨兵是否还活着、读数是否还登记。Watchdog 惯例支持 (ii) 的 verify_method 条款（每审计窗跑 check-kit-regex-check.mjs 读数登记=心跳检查）。
- 值守节律降级有先例：OneUptime 推荐月度 full review + 周度 15 分钟 noise check 的两级节律——「逐窗亲跑→低频盘查」的降级方向与之一致。

### ③ 安全回归测试：根治后「测试永远保留」是显式行业惯例【来源：safeguard.sh security-regression-testing 全文 + NIST CSF ID.IM-1 / CIS v8 7.1 引用 + 前序 R49-Q3 Sourcegraph 引文】

- 逐字判词：「when you fix a security bug, write a test that fails against the unfixed code and passes against the fix, **then keep that test forever**」——病灶根治不但不是退役理由，反而是**固化为永久回归断言**的触发事件。
- 根治后复发向量被点名三类：refactor 回退守卫、merge 静默丢修复、依赖漂移重引入——「A reintroduced vulnerability is uniquely dangerous precisely because **everyone believes it is handled**」。本题病灶=regex 解析盲区，守护面 stripComments 仍活跃，「新增 JS 语法形态时病态可复发」正是「refactor/演化重引入」同型向量。
- Scanner-native 形态：「maintain a baseline of resolved findings and fail when a previously resolved finding reappears——**often more urgent, because it means a control you thought you had is gone**」——已根治 finding 的复发被工业界视为比新 finding 更紧急的信号，前提是基线（=注册面）机读存在。散文表一行连「曾被根治」都无法机读断言。
- NIST CSF 2.0 ID.IM-1（recurring vulnerabilities → lessons learned become **durable preventive controls**）与 CIS v8 7.1 提供框架级背书。

### ④ 未注册/无机读锚值守的失效先例【来源：sensu.io、oneuptime.com、前序知识库 R22-Q4、relvy.ai 摘要、sherlocks.ai 摘要】

- **Runbook rot**：relvy.ai（2026-02）「stale runbook 腐化是常态，stale automation 更糟因为会执行错误动作」；sherlocks.ai 惯例「every runbook has one owner, if the owner leaves the runbook is deleted——Runbooks decay, systems change, alerts change」。社区共识（r/sre 摘要）：**能存活的 runbook 是绑定在 alert 定义上的 runbook——alert 变则 runbook 变**；脱离机读锚单独存放的散文清单无一例外腐化。本题「账本散文一行」就是脱锚清单，已挂三窗无人认领=腐化进行中的实证。
- **Phantom monitoring / shadow SLO**：OneUptime 把「Stale/Orphaned」列为告警噪声四分桶之一（15%），处置=补注册或 deprecate 二选一，无第三态。本仓自身先例（知识库 R22-Q4）同向：「维持≠免检——登记行须明写触发器，防止读成永久免检」。**散文表维持（iii）在本仓自己的治理先例里也找不到合法形态**。
- 「守护面消亡才退役」vs「静默通过史」的对比已有本仓前序调研钉死：D-160 调研里 **Meta ACH 按通过史判据退役测试，事后复盘发现丢掉 277/571 个有价值测试**（Sensenmann 同命运判据才是正解）；Google SRE 惯例同样把「long-firing/no-fire」告警交评审而非静默豁免。

### ⑤ 冲突扫描（对照账本 current）

| 决策 | (i) 摘除 | (ii) 降级＋注册 | (iii) 散文表维持 |
|---|---|---|---|
| D-160⑥ 退役判据=守护面消亡（Sensenmann 同命运） | **冲突**：面存续即退役=通过史冒充消亡（Meta ACH 同型） | 合：面存续故不退役 | 不触（未走退役） |
| D-160② 逐件经 T3 窗裁定 | 程序可走但结论无据 | 合：T3 窗呈裁降级＋注册 | 不触 |
| D-164-b 未注册触发器不算锚定 | — | **合**：补注册即纠正 R52 实证的零命中 | **冲突**：维持无锚状态=已判明的非法形态续命 |
| D-169/D-171 finding 处置五要件 | 摘除后 fixture/golden 等补偿控制承载面断裂 | 合：五要素齐备（review_event/trigger/verify_method/bound_to/owner 承载） | **冲突**：三要素缺失=finding 静默丢弃形态 |
| D-175 等待期工作面序（(b) 欠账清零→(d) 深度维护→(c) 预备→(a) 值守仅底线） | — | 合：注册属欠账清零面，优先级最高 | 冲突：三窗拖延=值守面欠账未清 |
| D-177 预声明验证包/D-181 勘误通道 | — | 合：verify_method 为预声明式（每窗跑既有 check 读数） | 不触 |
| D-183 RA 自我指涉（FN 静默高危） | 风险：摘除后该面 FN 复发无哨兵=静默 | 合：哨兵留存即防 FN 静默 | **冲突**：无锚即无 FN 检测能力 |

无候选与账本「零冲突」除 (ii) 外；(ii) 与全部六族 current 决策同向。

## 3) 对比矩阵

| 项 | (i) 摘除退役 | (ii) 降级＋注册锚定 | (iii) 维持散文表 |
|---|---|---|---|
| D-160⑥ 合规 | ✗ 违（面存续即退） | ✓ 合 | △ 未触但回避处置 |
| 机读锚/五要素 | ✗（75a M3 断言转红，_retired/ 实物不存在） | ✓（registry manual_watch 五要素齐备） | ✗（R52 实证零命中已判非法） |
| 病灶复发防护（FN 静默） | ✗ 无哨兵 | ✓ 每窗跑 check 读数（Watchdog 同构） | ✗ 无检测能力 |
| 值守成本 | 最低但能力归零 | 低（逐窗亲跑→低频盘查，OneUptime 月度/周度同构） | 名义最低，实际三窗拖延=债务复利 |
| 工业先例 | 面存续即摘除：**无先例**（Meta ACH 反例实证有害） | ESLint deprecated＋availableUntil；SAST resolved-finding baseline；回归测试永久保留 | orphan alerts/runbook rot：先例全部是**反例** |
| 撤销成本 | 高（摘除后复活须重建） | 低（registry 条目可随面消亡再走 D-160 退役链） | 低但沉淀为腐化面 |

## 4) 推荐＋理由＋置信度

**推荐 (ii)：降级常规自检＋registry manual_watch 注册锚定（Confidence：高，~0.85）**。

核心理由三条：
1. **三域惯例收敛同向**：lint（ESLint 弃用=降投入不摘除+机读元数据）、SRE（keep/fix/deprecate 三向裁决，无 owner 先补注册）、安全回归（根治后测试永久保留）——「病灶根治但面存续」在三个成熟域里的答案一致：降级维护强度、保留机读锚，退役只留给面消亡。
2. **(ii) 相对 (iii) 的边际收益显著为正且成本极低**：登记一个五要素 registry 条目＋每窗跑一次既有 check-kit-regex-check.mjs 读数（Watchdog 心跳语义），换来的是「FN 静默高危」（D-183 调研：false negatives are silent and carry the higher risk）的检测能力与 R52 实证的注册缺口闭合；(iii) 的唯一「收益」是不动手续，而其代价已实证——三窗无人认领。
3. **(ii) 为未来真退役保留合法出口**：当 stripComments 面真的消亡（函数移除/被吸收/被更强契约取代），registry 条目的 verify_method 触发面会自然暴露，届时走 D-160⑥ 逐件 T3 裁定即可——降级态是退役链的前置站而非终点（ESLint `availableUntil` 同构）。

**登记建议**（供裁定引用）：trigger=事件驱动「stripComments 新增 JS 语法形态/签名变更」非日历；verify_method=每 T3 审计窗跑 check-kit-regex-check.mjs 读数登记（心跳）；bound_to=D-184②④/D-192；值守节律=逐窗亲跑降为低频盘查，条目注明「维持≠免检」（R22-Q4 先例措辞）。

**最强反驳自查**：「降级后低频盘查也会被遗忘，与散文表殊途同归」——有分量，但 registry 条目有机读锚与 verify_method，T3 窗普查（guard-baseline 机制）可枚举到它，而散文表连枚举都不可能；差异=可审计与不可审计之别，非完美与不完美之别。

## 5) 信息缺口

- relvy.ai《State of On-Call Runbook Automation 2026》与 Reddit r/sre 原文抓取失败（JS 渲染），runbook 腐化结论依赖搜索摘要+OneUptime/sherlocks 交叉，未取得一手全文。
- Prometheus 告警官方「alert 生命周期文档」未取到单独页面（alert lifecycle 无正式 spec 文档），以 watchdog 三源+OneUptime 评审流程拼合，属邻近模型合成，标位如实。
- atomcode 载体三次派发均未回传（进程未存活、知识库无落盘），本报告由编排层三引擎直查完成；与前序 R49-Q2「atomcode 三次续跑失败后 fallback 综合」同型，建议按该先例如实登记。

## 6) 完整来源清单

| # | 来源 | URL | 类型 | 用途 |
|---|---|---|---|---|
| 1 | ESLint rule deprecation policy | eslint.org/docs/latest/use/rule-deprecation | Official | 「never removed unless」判据原文（已读全文） |
| 2 | Deprecation of formatting rules（官方公告 2023-10） | eslint.org/blog/2023/10/deprecating-formatting-rules | Official/Currency | 弃用至摘除留 ≥2 个大版本盘查窗（已读全文） |
| 3 | Update documentation around deprecation policy | github.com/eslint/eslint/issues/8635 | Community | 「删除 vs 弃用」权衡官方讨论 |
| 4 | How to Create Alert Review Process | oneuptime.com/blog/post/2026-01-30-alert-review-process | Official | keep/fix/deprecate 三向裁决+orphan alerts 反模式+「no fires=加分」（已读全文） |
| 5 | Alert Fatigue in SRE and DevOps | sensu.io/blog/alert-fatigue-in-sre-and-devops | Criticism | 疲劳治理=降频调阈非摘守卫 |
| 6 | Alert Fatigue in SRE | firehydrant.com/blog/alert-fatigue | Criticism | 二源交叉验证⑤ |
| 7 | A Dead Man's Switch for Your Monitoring Stack | dev.to/irinobservability + training.promlabs.com + paulsprogrammingnotes.com | Official/Community | 沉默即故障语义、心跳盘查构造（三源交叉） |
| 8 | Security Regression Testing: Keep Fixes Fixed (2026) | safeguard.sh/resources/blog/security-regression-testing | Official/Currency | 「keep that test forever」+resolved-finding 复发更紧急判词+NIST/CIS 框架（已读全文） |
| 9 | The State of On-Call Runbook Automation 2026 | relvy.ai（摘要级，原文抓取失败） | Currency | runbook rot 惯例（摘要） |
| 10 | Writing Runbooks Your On-Call Team Will Actually Use | sherlocks.ai（摘要级） | Community | owner 离任即删+「runbooks decay」惯例（摘要） |
| 11 | 本仓 D-160/D-164/D-169/D-175/D-183 账本行 | .scratch/macro-audit/decision-ledger.md | Local | 冲突扫描判据（原文行已核） |
| 12 | 知识库召回：R40-Q4（Sensenmann/Meta ACH 反例）、R22-Q4（维持≠免检）、R49-Q3（event-driven 重校准） | 本地 ctx KB | Local | 前序调研先例 |
