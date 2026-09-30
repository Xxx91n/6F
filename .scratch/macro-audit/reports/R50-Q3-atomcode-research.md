# R50-Q3 调研报告：外部研究工具降级形态的建制地位

> 存档说明：atomcode CLI（ctx_batch_execute label=atomcode-r50q3）2026-09-30 跑回——子代理续跑锚定轮询后台进程（PID 2756 存活）后转三引擎直查，中途命中 **5h 配额窗尽（rate-limited，resets ~15:50）** 中断；进程随后自然退出。按技能规程「配额耗尽=唯一不续跑例外」如实报告；本报告由编排层（本会话）以 web_search 直查＋知识库召回合成补齐——**与 atomcode 计划中的 fallback 同型但由编排层执行**。题面存档见 reports/R50-Q3-research-prompt.md。
>
> **自指偏差如实标位**：本题调研对象是调研通道自身的降级合法性——由同一生态位（atomcode 或其 fallback）裁自身形态存在结构性利益相关，置信度相应下修一档；报告内证据均为通道外工业文献不受影响。

**Sufficiency Gate** — searches: atomcode 内部轮询+第一批检索（中断前已耗配额）＋编排层 web_search×3 | angles: Official（Nygard Release It/Fowler/Netflix/AWS ELB/Atlassian Statuspage）、Comparative（openstatus/Harness 分级语义）、Criticism（workaround-hardening/normalization-of-deviance 文献、Docker healthcheck flapping 实例）、Currency（grais.ai/DevX/MoC 2026 新文）| full reads: 6（martinfowler CircuitBreaker、netflixtechblog、openstatus×2、grais.ai、devx workaround）| gaps: ①配额耗尽致 atomcode 侧报告未完成（self-referential 题无独证腿）；②second-channel corroboration 文献未定点取原文（以通行惯例述）；③配额窗观测面无 API 可查（健康闸可行性缺口）。

## 1) 执行摘要（Tl;dr）

**推荐 (ii)＋到期触发器精化，置信度：中高。** 工业界对「降级形态建制地位」的答案明确且双面相切：**正面**——degraded mode 是一等公民状态而非异常（status page 词汇表 operational/degraded_performance/partial_outage/major_outage 分级语义；circuit breaker open 态 serving fallback 是 Nygard/Fowler 命名的第三状态非错误；Netflix「slightly degraded」graceful degradation 为设计行为）；**反面**——workaround-hardening 文献一致警告：被宣告合法的降级若无「到期触发器＋边界＋具名 owner」会在数月内固化为新 normal（grais.ai 五字段最简控制：exception/reason/expiry trigger/unchanged boundary/resolution owner；「we'll clean it up later」不是到期条件）。故 (ii) 合法但须附复审钩——恰好与本仓 D-169/D-171 AR 五要件同构。(i) 持续异常登记在分级语义下本身就是误报（degraded≠down）；openstatus 明言「under-reporting costs more trust than over-reporting」反向亦成立——把合法降级一直记为异常同样蚀信任。

## 2) 分点结论

### 裁决① 「后台未归=合法降级形态」口径改述的业界先例

**支持，且分级语义正是为此存在。** openstatus/Atlassian/Harness 三源交叉：degraded_performance 是正式声明态（SLI 阈值钉义——Harness 例「API 响应时延 95 分位 >1s/5min 滚动窗=Degraded」），在 uptime 手工计费中 degraded **不计 downtime**（available but impaired）；组件级精确声明>全局二元（「component-level accuracy is the point」）。circuit breaker 侧：open 态 serving fallback 是命名第三态（closed/open/half-open），fallback 命中=正常工作非故障升级。映射：atomcode 后台未归＋载体内 fallback 出报告=**degraded_performance 级**（交付物在位、内部构成降级），记为 incident/异常=状态分级误用。

### 裁决② 内部组成标注升格必填字段的充分性

**支持且正是降级态可信任的机制。** 交付物锚定输出契约（interface）非内部过程（implementation）——消费者关心报告质量＋provenance 标注；降级态的可信度完全由组成标注承载（对标 status page 逐组件声明与 Prism known-failures 文档化惯例——降级可接受的前提永远是「降级内容可被识别」）。升格必填字段=降级形态合法的**必要条件**非可选项。

### 裁决③ 健康前置闸的误判风险

**证据偏向否决。** AWS ELB 机制本身展示业界对此的防御——UnhealthyThresholdCount 连续失败才判 unhealthy（默认 2）、HealthyThresholdCount 连续成功才放回（默认 5）的不对称迟滞设计，正是因为单次探测假阴/假阳高发；Docker healthcheck flapping 实录：进程存活且 /health 返 200 但探测超时→连续 3 次判 unhealthy→autoheal 在批处理中重启致在途执行孤儿化——**基于误判的闸动作比误判本身更有害**。本仓致命点：atomcode 的关键健康信号=5h 配额窗余量，**tasklist 进程探测根本观测不到**——健康闸只能看到「进程在不在」，看不到「配额还有没有」=结构性假绿/假红双漏。否决 (iii)。

### 裁决④ 「持续缺席→主通道地位再裁」触发器形态

**支持但要具体化。** workaround-hardening 文献钉死最小控制集（grais.ai：exception/reason/expiry trigger/boundary/resolution owner 五字段；MoC 250 项目实证「nobody owns its removal→bridge becomes ordinary work」；nhimg：temporary workaround 须 owner+time-bound+revert-ability 三要素否则=treated as permanent operating model）。「we'll revisit later / 频次持续100%再议」=文献明判的非条件形态。具体化建议：降级构成比逐轮登记（题数×fallback 占比）＋连续 N 轮 100% fallback→触发主通道地位复审票（N 建议=3，留足观测窗）。

### 裁决⑤ 独立复核腿（second-channel corroboration）

**登记为可选非强制。** 同载体 fallback 仍用同三引擎——组成降级非独立复核；真独证须异载体（perplexity/exa 经 1mcp 直调）。成本=配额税；收益=对自指题/高stakes 题的独证价值。建议形态=重要裁定可选补强，不列常备义务（每次双载体=双倍配额窗消耗会加速配额撞墙）。

## 3) 对比矩阵

| 候选 | 降级处置 | 工业先例强度 | 与账本兼容性 | 主要代价/风险 |
|---|---|---|---|---|
| (i) 维持现状（异常口径登记） | 持续误报 degraded=incident | 弱——分级语义下本身是状态误用 | 兼容但烧税 | 异常登记税＋续跑锚定窗反复烧；「异常」语义稀释真异常 |
| (ii) 形态立法＋到期触发器 | 合法降级态（有名有界有钩） | **强**：degraded_performance 分级＋CB open 态＋graceful degradation | 兼容：护栏/锚定规程不动 | 须附复审钩否则 workaround-hardening 固化 |
| (iii) 健康前置闸 | 探测驱动派遣 | 弱反证——假阴实录有害＋本仓健康信号结构性不可观测 | 兼容 | 结构性假绿/假红；闸动作危害>误判 |
| (iv) 降为非必选腿 | 废除通道指定 | 中——多载体自由度高 | **与立规字样冲突**（须用户翻案级） | 载体多样性降＋立规原文实质废除 |

## 4) 冲突扫描（对账本 current 记录）

- **atomcode 调研立规本身**：不冲突——(ii) 保留 atomcode 主通道地位＋派遣义务＋调研要求四要素全不动；改的只是「内部不归」的账务归类。
- **串行护栏/续跑锚定规程**：不冲突且被厘清——规程原用途=真崩溃/中断续跑（配额耗尽本就明判不续跑例外）；「后台未归」改记降级形态后，锚定规程适用面收窄至非配额类中断，语义更准。
- **D-155/D-169/D-171**：不冲突——降级形态的复审钩/构成登记与册项/AR 规程同构复用；非新开通道。
- **D-146⑤ 勘误追加**：不冲突——既往「异常登记」记录不改写（append-only）；形态再分类自本裁生效（D-148③ 同构）。
- **D-172 冻结包**：无涉。
- **D-177 预声明**：无涉（本裁非源码面）。
- **D-185 开工对表（本轮新立）**：兼容互补——声称态对表管任务书；降级形态管调研通道；两闸各守其面。

## 5) 推荐+置信度+缺口

**推荐：(ii)＋三精化。** ①降级形态立法=「atomcode 载体返回的调研报告」为交付物定义，内部组成（深调研循环回传/编排层直查合成/配额中断）升格**报告必填字段**；②后台未归改记 degraded_performance 级合法降级（非异常登记）——但须带**复审钩**：构成比逐轮登记＋连续 3 轮 100% fallback→主通道地位复审票触发；③配额耗尽维持「唯一不续跑例外」原规程；④独立复核腿登记为可选补强（异载体 perplexity/exa，非义务）。

**置信度：中高**——方向层（降级态建制地位）四方一手文档交叉强支撑；触发器数值（N=3）为本仓裁量非文献钉值；**自指偏差**：本题由同生态位通道裁决自身降级合法性，结构性利益相关致整体置信度-1 档。

**缺口（如实标位）**：①atomcode 侧未完成（配额耗尽）——无通道内独证；②配额窗余量无可观测 API=健康闸结构性不可行（裁决③补强证据）；③「3 轮」阈值为裁量值无文献钉值；④second-channel 文献未取原文（惯例级述）。

## 6) 完整来源清单

| # | 标题 | URL | 角度 | 贡献 |
|---|---|---|---|---|
| 1 | Circuit Breaker — Martin Fowler | martinfowler.com/bliki/CircuitBreaker.html | Official | closed/open/half-open 三态；fallback 为命名态；half-open 试探复位机制 |
| 2 | Release It! 2nd — Michael Nygard | bryanttaylor.info/bookshelf/release-it/ 等 | Official | CB 原始定义「SLA 不达即跳闸 fail-open」；timeout/cascading failure 防御 |
| 3 | Netflix API Resilience | netflixtechblog.com/making-the-netflix-api-more-resilient-a8ec62159c2d | Official | graceful degradation 设计行为：「slightly degraded and less personalized」为合法服务态；fallback 三形态分类（custom/fail-silent/…） |
| 4 | openstatus Status Reports 概念 | openstatus.dev/docs/concept/status-reports-and-incidents | Official | degraded_performance/partial_outage/major_outage 分级声明制；degraded 不计 downtime；组件级精确声明 |
| 5 | openstatus 状态页词汇指南 | openstatus.dev/guides/what-is-a-status-page | Official | 「degraded 是最少用但最有用的状态」；「under-reporting costs more trust than over-reporting」 |
| 6 | Harness computing-uptime | github.com/harness/developer-hub …/computing-uptime.md | Official | degraded=0% downtime hit 的 SLI 阈值分级实例 |
| 7 | Atlassian Statuspage impact 计算 | support.atlassian.com/statuspage/docs/top-level-status-and-incident-impact-calculations/ | Official | impact 语义栈官方定义 |
| 8 | grais.ai 临时例外到期条件研究 | grais.ai/research/state-the-expiry-condition-before-a-temporary-exception-spreads | Criticism | workaround 五字段最简控制（exception/reason/expiry trigger/boundary/resolution owner）；「later」非到期条件；normalization-of-deviance 机理 |
| 9 | DevX Temporary Architecture Decisions | devx.com/technology/why-temporary-architecture-decisions-never-stay-temporary/ | Criticism | 临时方案承载真实流量后系统围绕其优化→移除变迁移；ports/interface 边界先例（interface 答域问不关心实现） |
| 10 | Headline MoC 播客 | headlinepodcast.us/blog/management-of-change-5-failures… | Criticism | 250 项目实证 workaround→ordinary work 的固化链 |
| 11 | nhimg workaround FAQ | nhimg.org/faq/…temporary-workaround… | Official/合规 | workaround 三要素：具名 owner＋time-bound＋revert-ability；detect abuse/limit blast radius/revert quickly 存续判据 |
| 12 | AWS GWLB health checks | docs.aws.amazon.com/elasticloadbalancing/latest/gateway/health-checks.html | Official | Unhealthy/HealthyThresholdCount 不对称迟滞——单次探测不可靠的业界共识物化 |
| 13 | Docker healthcheck flapping 实录 | github.com/Abilityai/trinity/issues/1230 | Community/事故 | 进程健康但探测假阴→autoheal 重启孤儿化在途执行——健康闸误判危害实录 |
