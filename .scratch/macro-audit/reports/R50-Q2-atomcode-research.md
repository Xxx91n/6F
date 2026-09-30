# R50-Q2 调研报告：工单声称态 vs 代码现实的开工对表惯例

> 存档说明：atomcode CLI（ctx_batch_execute label=atomcode-r50q2）2026-09-30 干净返回。过程如实登记——子代理先召知识库与本地账本 current 记录取证，再三引擎外部调研（web_search×2/tavily×2/anysearch batch×5+search×1）＋8 篇全文核验；只读调研模式未写文件；报告尾注「继续此会话 atomcode -p … --resume 2dbada96-…」为会话续锚标识。题面存档见 reports/R50-Q2-research-prompt.md。

**Sufficiency Gate** — searches: 9（web_search×2 / tavily×2 / anysearch batch×5+search×1）| angles: Official（Wikipedia/FAA、IBM Maximo、Stack Overflow）、Comparative（OCC vs 锁、DoR 赞反两方）、Criticism（DoR 危险论、OCC 碰撞处置）、Currency（2026 年新文：Kanban Tool 2026-08、ByteByteGo 2026-07、newly.app 2026-06）、Community（调试纪律 SKILL、博客/Leader 文）| full reads: 8（mountaingoatsoftware / jimmybogard / bytebytego / wikipedia-preflight / newly.app / tavily_extract×3：kanbantool、architecture-weekly、jonathanklein）| gaps: ProofGate（AI 代码 claim-vs-reality 闸门）仓库 404 未读成原文，仅用搜索摘要佐证；inventory reconciliation（盘点对账）未找到软件工单域直接文献，用 work-order 状态机 + OCC 近似覆盖；「git log 实证核实」这一具体命令形态属本仓特有，工业界对应物为「against the artifact, not the ticket」原则。

## 1) 执行摘要（Tl;dr）

**推荐 (i)+(ii) 双侧立法，置信度：高。** 开工前对单据声称态与实物现实做核验，是跨航空（preflight checklist）、运维工单（CMMS 状态机）、分布式系统（OCC 读-验证-写）、敏捷（DoR guidelines）、调试纪律（reproduce first）五域共同收敛的轻量惯例——形态普遍就是 checklist 一行而非重流程，故「开工对表」一条 git log 核验行完全在业界正常形态之内。且 (i) 与 (ii) 在业界分工上是公认互补两侧：源头修（换代时核对）降低发生率，闸侧兜底（开工时核对）覆盖源头修挡不住的时序缝——本轮事件恰恰属于源头修失效的窗口（书生成后 LOOP 落地），印证只有闸侧能兜住。(iii) 不立规与跨域证据相悖：航空业的教训是 98% 的航班带着不完整检查起飞才酿祸（Gulfstream IV，NTSB）——「本轮被接住」恰说明该纪律尚未成为建制而是依赖自发细心，Normal­ization-of-Deviance 机理支持入闸。

## 2) 分点结论

### 结论 1：开工前「声称态 vs 实物」核验是五域共同惯例，且形态就是 checklist 一行（支撑 ① 裁决）

| 域 | 惯例 | 证据 |
|---|---|---|
| 航空 | preflight checklist：起飞前逐项核实实物状态，FAR 121 明文要求「不依赖记忆」 | Wikipedia《Preflight checklist》（已读原文） |
| 运维/CMMS | 工单状态=固定状态机+每次变更加时间戳；Maximo 阻断非法跳转（如 In progress 不可直接 Closed）——状态断言必须由可核验迁移支撑 | newly.app《work-order-app》（已读原文，引 IBM Maximo） |
| 分布式系统 | OCC 三段：读快照→改→**验证快照未变才提交**；Delta Lake「read the latest table version→write→validate at commit」 | Jimmy Bogard 2017（已读原文）、Databricks 官方博客 |
| 调试纪律 | 「reproduce first」：修任何 bug 前先实证缺陷存在——"If you can't reproduce it, you can't fix it"；先复现再改=对「bug 声称存在」的开工对表 | debugging SKILL.md / agent_docs（已读搜索原文摘录） |
| 敏捷 | DoR=「bouncer」进门前核验（验收标准齐、依赖闭合）——但成熟意见强调**用 guideline 不用硬 gate** | Mountain Goat Software（已读原文） |

**裁决①：一行 git log 对表不是过度建制**——业界同型惯例全部是 checklist 级而非流程级；唯一需防的是把它写成 100% 完成式硬门（见结论 3）。

### 结论 2：任务书=读快照、施工=写、对表=提交前重验——OCC 同构在业界是标准心智（支撑 (i) 的理论根基）

- Jimmy Bogard：OCC 四步 Begin(记时间戳)→Modify→Validate(检查时间戳是否已变)→Commit/Rollback。**任务书生成时点=Begin，开工时 git log 核验=Validate，照书施工=Commit**。跳过 Validate 直接 Commit 在 DB 语义下就是 lost update——对应本仓即重复实施/双重修复污染 commit 史。
- Databricks/Delta Lake 官方：并发写同表一律 read-validate-commit，冲突时 retry（重读最新版本再裁剪义务）——对应「发现已落地→登记差异行并按剩余义务裁剪」而非阻断。
- 佐证（同型事故）：VLDB 论文明确 stale read 会导致 validation 必败——快照越旧、冲突概率越高；本仓任务书跨轮更旧，对表必要性更强。

### 结论 3：失真发现后的义务形态惯例=登记+重验后裁剪，而非阻断回填（支撑 ② 裁决）

- OCC 冲突处置三选项（Bogard 原文）：retry（重读后重做）、error out（带信息上抛）、locking（最不受欢迎）。业界主流=**retry with fresh read**——对应本仓即「登记差异行→按剩余义务裁剪→继续施工」，而非回炉任务书阻断开工。
- CMMS 侧：状态断言失真靠**时间戳化状态史**留痕（newly.app/Maximo）——对应本仓「差异行登记进账本/编年」而非静默改书。
- 局部反例（两源平衡）：Mountain Goat Software 警告 DoR 硬 gate 化会滑向 stage-gate waterfall——因此对表应写成 guideline 式核实义务+差异登记，而不是「失真即禁止开工等书更新」（后者才是过度建制）。

### 结论 4：源头修 vs 闸侧兜底——业界分工公认两侧都要（支撑 ③ 裁决）

- 源头侧先例：敏捷 backlog refinement/grooming=**持续**在源头刷新条目状态（Hyperdrive/Plane 博客）；「refactor 前基线测试全绿才动手」「先复现再修」都是源头核验。但源头刷新有已知盲区：**refinement 是事件性的，卡片状态滞后到开工时刻无法被源头修消除**——Kanban Tool 2026-08（已读原文）："the board must reflect reality, not wishful thinking"；板-现实脱节被列为 Kanban 核心风险。
- 闸侧先例：aviation checklist 之所以存在，正因「起飞前一刻核验实物」不能被「起飞前一日检查过」替代——Gulfstream IV 事故 NTSB 发现该机组 175 次起飞中 98% 检查不完整（习惯化豁免）；FAR 121(b) 要求程序设计成「不依赖记忆」。同构：换代时核对（源头）不能替代开工时核对（闸），因为换代后世界继续动——本轮 R50 正是此类。
- ProofGate（AI 代码域，搜索摘要佐证，原文 404）：作者声称与 diff 现实不符时按可结构验证事实阻断——「trust but verify gate」在 AI 施工域正在成为新惯例，与本仓「执行批=AI agent」语境直接同构。

### 结论 5：照书施工在工单失真时的归责/后果（支撑 ④，证据中等）

- 调试纪律域：「Fixed the bug」类声称必须以可验证证据（回归测试红转绿）背书，无证据的照单施工被视为无效——同构：照书实施的「未实施」义务若书已失真，其 commit 无真实语义增量，即污染。
- CMMS 侧：audit 失败最常见原因不是缺字段而是「状态字段是自由文本」——不可核验的声称态本身就是缺陷。照书施工的归责在业界倾向「核实义务在执行者/闸」而非「归责于书的作者」——因书是时点快照，时序缝不可避免；这与本仓 D-170③「欠账三要素」（具名 owner＋时点锚＋复验方式）中「时点锚」精神一致：声称态必须带时点锚，开工者对时点锚之后的漂移负核实义务。
- bytebytego/architecture-weekly（均已读原文）：at-least-once 语义下**重复是常态不是异常**，防重的义务放在消费端（执行端）而非生产端（出题端）——同构：防重复实施义务放开工闸，不放任务书作者。

## 3) 对比矩阵（三候选）

| 候选 | 业界同型 | 强 | 弱 | 裁决 |
|---|---|---|---|---|
| (i) 入闸开工对表 | aviation preflight / OCC validate / DoR bouncer / reproduce-first | 五域收敛的惯例形态=一行 checklist；建制兜底不依赖自发细心；成本≈一条 git 命令 | 若写成硬 gate（失真即阻断回炉）则滑向 stage-gate——须写成 guideline 式核实+差异登记 | **采纳** |
| (ii) 换代模板自检 | backlog refinement / refactor 前基线核验 | 从源头降发生率；与「书=读快照」的快照新鲜度治理一致 | 只管换代时点，挡不住换代后时序缝（本轮实证）；Kanban 域证明源头刷新必留盲区 | **采纳（辅助）** |
| (iii) 不立规 | NTSB 98% 不完整检查=纪律未建制化的自然态 | 零新规；本轮已零害 | 依赖执行者自发 diligence；Normalization-of-Deviance——每次侥幸通过都训练团队无视该步骤（Gulfstream IV 教训） | **否决** |

## 4) 冲突扫描（对账本 current 记录）

- **D-170（执行窗义务三要素）**：不冲突且被补强——D-170③ 要求欠账带「时点锚+复验方式」，开工对表正是「时点锚」的消费端执行义务（锚之后漂移由开工者核实）。建议立法时显式引用 D-170③ 作为判据锚。
- **D-177（预声明）/ D-181（勘误通道）**：不冲突——开工发现失真→登记差异行，形态上与 D-181 勘误节同构（描述＋发现时点＋指针）；可考虑差异行走既有勘误/账本通道而非新通道，避免建制重复。
- **D-175（等待期工作序）**：不冲突——对表是开工动作，属于任何工作面序的前置，不改变 (b)→(d)→(c)→(a) 排序。
- **D-148③（规程生效时点）**：新规自落盘 commit 起生效、落盘批自身豁免——立法落盘时照此办理即可。
- **D-144（账行↔编年随行）**：差异行登记若入账本，须走随行核对——无冲突，收口工序已覆盖。
- **D-139/D-140②（commit 纪律）**：对表发现的「已落地」若导致跳过实施，不产生 bundle/semantic commit 压力；若对表本身有留痕产物，归 docs 轮。
- **handoff 任务书建制本身**：不冲突——(ii) 的换代自检即对建制的内修，(i) 是对建制的外闸，均不动三件套结构。
- 唯一需要立法时点名的张力：Mountain Goat 式「DoR 危险论」——建议把 (i) 定位为**核实义务+差异登记**（guideline），明文禁「失真即阻断开工」，规避 stage-gate 化。

## 5) 推荐+理由+置信度

**推荐 (i)+(ii) 双侧，(iii) 否决。置信度：高**（五域独立收敛 + 本轮实证事件同构 + 反方论点已识别并有规避路径）。

理由归纳：
1. 开工对表是跨域公认惯例，形态恰为 checklist 一行——成本论证与业界一致，非过度建制。
2. 本轮事件形态（书生成后世界动）是源头修在原理上挡不住的窗口，只有闸侧能兜——OCC 的 Validate 步必须贴着 Commit，不能贴着 Read。
3. 失真处置业界主流=重验后裁剪（retry with fresh read）+差异留痕，与本仓候选 (i) 的义务形态一字不差。
4. (iii) 的「小概率+已被接住」论证正是航空域被实证否决的侥幸模式（98% 不完整检查没出事→出了事）。

**缺口（如实标位）**：① inventory reconciliation（盘点对账）文献只覆盖到 work-order 状态机近似，未找到「文件记录 vs 实物状态对账」在软件工单域的直接一手文献；② ProofGate 仓库 404，AI-claim-vs-reality 闸门结论仅有搜索摘要单源支撑；③ 「对表发现的失真行走账本勘误通道还是新登记面」属本仓建制内部裁量，外部证据不裁，建议立法时一并钉死以免第二个个案再议。

## 6) 完整来源清单

| # | 标题 | URL | 角度 | 日期 | 贡献 |
|---|---|---|---|---|---|
| 1 | Preflight checklist — Wikipedia | https://en.wikipedia.org/wiki/Preflight_checklist | Official | 持续更新（2026-07 注） | checklist 惯例起源（B-17 1935）、FAR 121 法规要求、98% 不完整检查 NTSB 数据 |
| 2 | Work Order App fields — Newly | https://newly.app/build/work-order-app | Official/实践 | 2026-06 | Maximo 状态机、时间戳化状态史、状态自由文本=审计失败首因 |
| 3 | Dealing With OCC Collisions — Jimmy Bogard | https://www.jimmybogard.com/dealing-with-optimistic-concurrency-control-collisions/ | Comparative | 2017-05 | OCC 四步、冲突三处置（retry/error/lock）——闸侧义务形态的直接同构 |
| 4 | Concurrency Control — Databricks 官方博客 | https://www.databricks.com/blog/concurrency-control | Official | 持续 | read-validate-commit 工业实现（Delta Lake） |
| 5 | Definition of Ready Is Dangerous — Mountain Goat Software | https://www.mountaingoatsoftware.com/agile/the-dangers-of-a-definition-of-ready | Criticism | 2023-06 更新 | DoR 硬 gate 化=stage-gate 风险——对 (i) 的立法形态约束（guideline 非 gate） |
| 6 | Backlog grooming best practices — Plane | https://plane.so/blog/backlog-grooming-best-practices-for-agile-teams | Comparative | 2025-2026 | 源头侧刷新惯例=持续 refinement，DoR 轻量定义 |
| 7 | Is Your "Done" Column Lying? — Kanban Tool | https://kanbanantool.com/blog/rethinking-what-done-means（实取 kanbantool.com 同文） | Currency/Criticism | 2026-08 | 卡片状态滞后现实=Kanban 核心风险，源头修盲区实证 |
| 8 | Idempotency & Delivery Semantics — ByteByteGo | https://blog.bytebytego.com/p/a-detailed-guide-to-idempotency-delivery | Official/教育 | 2026-07 | at-least-once 下重复是常态、防重义务在接收端 |
| 9 | Deduplication in Distributed Systems — Architecture Weekly | https://www.architecture-weekly.com/p/deduplication-in-distributed-systems | Community/深度 | 2024-11 | 防重复处理惯例：查当前状态后再应用——对表=查当前状态的直接先例 |
| 10 | Trust, but verify — Jonathan Klein | https://www.jonathanklein.net/2023/03/trust-but-verify.html | Community | 2023-03 | 「声称态须核验」的组织心智 |
| 11 | debugging SKILL.md（claude-resources） | https://github.com/deandum/claude-resources/blob/master/skills/core/debugging/SKILL.md | Community | 近期 | reproduce-first 纪律、证据标准——开工对表的调试域同构 |
| 12 | agent_docs/debugging.md（claude-code-kit） | https://github.com/tansuasici/claude-code-kit/blob/main/agent_docs/debugging.md | Community | 近期 | 「Never guess-fix without reproducing first」两源交叉 |
| 13 | ProofGate（GitHub，404 未读成原文——仅摘要佐证） | https://github.com/aevryone/proofgate | Currency | 2026? | AI 代码 claim-vs-reality merge gate——**缺口：单源** |
| 14 | OCC 优化 — VLDB'12 | http://www.vldb.org/pvldb/vol12/p169-ding.pdf | Official/学术 | 2019 | stale read→validation 必败的机理证明 |
| 15 | Backlog grooming vs sprint planning — Adobe | https://business.adobe.com/blog/basics/backlog-grooming-sprint-planning | Comparative | 持续 | refinement=持续维护，佐证结论 4 |
