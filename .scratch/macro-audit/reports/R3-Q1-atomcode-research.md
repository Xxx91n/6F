# R3-Q1 atomcode 深调研 —— macro-audit 下一步主干方向（2026-09-12）

> 出处：grill 轮 3 Q1 经用户指示提交 atomcode 深调研；本文件由 ctx 知识库索引召回重组。
> 重组声明：个别检索窗口截断处以 ⟦…⟧ 标记；来源清单原标注 15 条、表内实际 16 行（含 #16），按原样保留并加注。
> 续问锚点：atomcode -p "…" --resume 5e1815a6-6824-4d24-93c4-8112d4ac5b65

## 0) 原始问题（verbatim）

macro-audit（宏观+微观工程内容审计产品，面向 git 记录健全的项目）下一步建设主干方向选哪个：A 工程纵深 / B spec 深化 / C 端到端价值验证闭环 / D 分发生态就绪。要求：回顾全部 current 账本决策 + ADR/CONTEXT 条目；以工业界成熟落地心智模型为重点；给出推荐与理由；与封口决策冲突须显式点名。

## 1) 执行摘要（Tl;dr）

**推荐：以 C（端到端价值验证闭环）为主干，把 A 压缩为 C 的必要使能件（最小 fact schema + 第一个采集器），B 降级为 C 的下游回流（用真报告实测校准 16 项缺口），D 中唯一不可延后的"push + CI 实跑"提前到阶段 0，其余推后。** 工业界五类成熟心智模型（walking skeleton 之后的"垂直增肌"、tracer bullet/vertical slice、Lean Startup 的 RAT、Sonar/Semgrep/CodeQL/Sourcegraph 四家早期建设顺序、审计类产品的 dogfooding 先例）全部指向同一方向：**骨架验收之后的主干不是铺层、不是 desk 深化、不是上架卫生，而是把一条最薄的端到端路径在真实数据上跑通、产出第一份能证伪/证实产品前提的产物。** 对 macro-audit 而言，这份产物 = 6F 自身仓库上的 Macro-B 第一份带引文与裁决回执的真报告。**Confidence：中-高** —— 五类独立心智模型交叉一致且与 11 条封口决策逐条核对无冲突；残余不确定性在"S1/S2 阈值在 6F 真实数据上能否产出非平凡结论"（这正是 C 自身的可证伪点，而非调研不确定性）。

## 2) 分点结论（每条标来源）

**① walking skeleton 之后的业界共识 = 保持骨架行走、垂直增肌，不是横向铺层。**
O’Reilly《97 Things Every Software Architect Should Know》中 Monson-Haefel 直接给出后续动作："Once the skeleton is in place… bulk it up with full body workouts. This means implement incrementally, adding **end-to-end** functionality. The goal is to keep the system running, all the while growing the skeleton"（检索核验；oreilly.com）；Matt Blodgett 进一步把该模式下沉到 user story 级：vertical slice 先打通各层通信，再增肌（mattblodgett.com，已抓全文）。反面教材是 aihero.dev 点名的"outrunning your headlights"：把各层横着铺完才第一次串起来，连接串、列类型错误这类假设全在黑暗里验证（aihero.dev 2026-01，已抓全文）。**映射**：选项 A 若作为"主干"整体推进，正是横向铺层；只有"能支撑一条竖切的最小 A"才符合该心智。

**② tracer bullet / vertical slice = 最薄端到端切片贯穿所有层、尽早反馈。**
Pragmatic Programmer 的 tracer bullet 定义经多源复述：tinnedfruit（"Build the smallest possible grain of functionality, and create the beginnings of all the major architectural and infrastructure components⟦…⟧to get that tiny bit of functionality into production, with an automated end-to-end test"）、aihero.dev（"a small, end-to-end slice of functionality that touches all the layers of your system at once… build one tiny vertical slice, test it immediately, get feedback, move to the next slice"）、monday.com 2025/2026（"A vertical slice is a complete piece of functionality that cuts through every layer… one complete sandwich at a time, and each sandwich is ready to eat right away"；周期缩短约 40% 说法，后两者已抓全文）。**映射**：选项 C 的"采集→fact→叙事→裁决→报告"就是一次教科书式 tracer bullet；它同时是 10 条演示路径（封口决策 6）中 Macro-B happy path 的原型。

**③ RAT / Lean Startup：先测"错了就会杀死产品"的假设，最小实验，且 MVP 一词已被系统性滥用。**
Rik Higham 2016《The MVP is dead. Long live the RAT.》（HackerNoon，已抓全文，一手源头）："It’s not a product. It’s a way of testing whether you’ve found a problem worth solving… identify your Riskiest Assumption and Test it"；引 Eric Ries "Probably much more minimum than you think"，引 Tom Chi（Google X）"Maximising the rate of learning by minimising the time to try things"。Strategyzer 的 Assumptions Mapping（David J. Bland，2020-08-04，已抓全文）给出选择判据："which hypothesis, if proven wrong will cause our business idea to fail" + 2×2 证据轴 × 重要轴，**优先测右上象限（重要 × 零证据）**。注：检索中出现过两处作者名不一致（designorate 摘要写作 Rik Ingram，nextmovetheory 与 HackerNoon 原文均为 Rik Higham）——以已抓的 HackerNoon 原文为准，此为源间冲突如实记录。**映射**：macro-audit 的 riskiest assumption 不是"MCP SDK 能不能接"（可行性假设证据已充分：walking skeleton 验收 6/6 通过、五层盒子已落地），而是**价值假设**——"一份带引文与可驳回裁决的 Macro-B 报告，技术决策者是否信任并行动？"以及**使能假设**——"S1 定位收敛 70% 阈值、S2 ADR 90 天判红等 desk 推演参数，在真实仓库上能否产出非平凡结论？"。选项 B 恰是在零证据的假设上继续 desk 细化参数——RAT 原则最反对的动作。
**④ devtools/静态分析四家先例：早期都是"单点窄能力 + 自家 dogfood + 开源/社区反馈"，不是广度铺开。**
- **SonarQube**（官方 17 周年博客，Olivier Gaudin，2025-11-13，已抓全文）："What started as a free and open source tool to solve our own problem… we were building a product for developers, and we were using it every day for our own needs (in other words, dogfooding it)… release early, release often"；早期只有两个特性——"a single configuration to drive multiple tools and a database to store historical information"；被同行看到后"they would drop those efforts and use Sonar instead"。二手聚合信源（businessmodelcanvastemplate.com 2026-03-15）交叉印证成立时间线。
- **Semgrep**（Wikipedia，已抓全文 + Contrary Research + 官方 about 页检索核验）：2017 r2c 起步，2019 从 Facebook 内部工具 sgrep（pfff 库）fork，2020 更名；**先做窄引擎**（Community Edition 至今以"单文件/单函数分析保速度"为设计取舍）；Dogfooding 制度化（deepwiki.com/semgrep 文档，已抓全文：CI 每次 PR 差分扫描 + 每日全扫 + pre-commit 钩子 + --error/--strict 阻断合并）——自家代码库 = 第一个真实语料与第一个用户。
- **CodeQL/Semmle**（Wikipedia Semmle，已抓全文 + codeql.github.com 论文检索核验）：牛津 Datalog/CodeQuest 学术研究 → SemmleCode → LGTM 平台对真实代码库持续扫描 → 2019 被 GitHub 收购、2020 开源。先窄后宽、先真实数据后生态。
- **Sourcegraph**（Wikipedia，已抓全文）：2013 只做 Code Search 单一产品、客户自托管（Uber/Dropbox/Lyft），2023 才上 Cody、2025 才拆 Amp。
- **共同模式**：没有一家是"先把 5 个 scale 的广度铺完再验证"；都是"一条最薄真实路径 + 自己的代码/真实仓库做第一个用户"。**映射**：macro-audit 的最薄真实路径 = Macro-B 单仓单维度；第一个真实仓库 = 6F 自身（git 记录健全、有 ADR-0001~0011 活样本与 supersede 链、有真实演化历史——恰好是 S1/S2/S4 的天然试验田）。

**⑤ spec-first vs code-first 的实证边界：契约面 spec-first 成立，但阈值/判据类参数落在"code-first 优先"区间。**
同行评审论文（Control, Navigation and Communication Systems 期刊 2020，经 Tavily extract 补读原文）给出 Design First 在速度/velocity 上的优势证据；api-portal.io 2026-05-04（已抓全文）给出更精确的边界："When isn’t it worth switching to spec-first? For throwaway prototypes, internal APIs with a single consumer, GraphQL-first stacks, and very small teams without dedicated API design"；并警告无校验层的 spec 数月内即漂移。**映射**：封口契约面（plugin.json/mcp.json/receipt 协议字段——有 agent 生态多消费者）继续 spec-first 正确；但 16 项缺口里的 S1 语义度量、S2 阈值、S5 降权曲线属于"无消费者评审阶段、参数性质"的条目——desk 深化低效，实测校准优先。这也与 KB 内 AsyncAPI code-first/schema-first 先例（james-carr.org 2026-01）结论同构：取决于是否多消费者。

**⑥ "先做出一份真报告"式的 dogfooding 在审计/审查产品中有直接先例，且方法论有明确的"必须叠加外部反馈"警告。**
正例：Sonar（自家产品每天当第一用户）、Semgrep（自家代码库持续被自己扫描，deepwiki 全文）、以及本工作区 KB 已索引的 CodeLore 项目（审计工具自身 dogfood：ingest-sarif + finding-hotspot-overlap MCP 工具，KB 命中）；Coding Horror 给出极限例（SawStop 发明人把自己的手指伸进自己的产品刀片——"nothing exudes confidence like software developers willing to stick their own extremities into the spinning blades of software they’ve written"，已抓全文）。反例/边界：Justin Hunter《Dogfooding Your Own Product Isn’t Enough》（dev.to 2019，已抓全文）点名三大盲点——代码熟悉度/设计熟悉度/把边角当边角，**必须叠加真实早期用户反馈**。**映射**：C 的产物形态本身必须按"可给外部技术决策者看"设计（引文可核验、裁决可驳回——恰是封口决策 5 的共享骨架 + verdict-gate），以对冲纯自用 dogfood 的盲点。

**⑦ devtools 失败模式（批评角度）：dev.to《Why Most Developer Startups Fail Before Launch》（2026-01，已抓全文）——"every single one of them says the same thing: that scrappy, imperfect first version taught them more about their customers than months of planning would have"；Addy Osmani《The 80% Problem in Agentic Coding》（检索核验）——agent 时代"planning phase expanded; the coding phase compressed"。**映射**：选项 A（接 SDK 铺骨架）与 B（spec 深化）都易滑入"用工程/文档进展替代价值验证"的舒适区——正是这些文章点名的失败模式；D（上架卫生）在前提未证实前 = 把卫生当进展。

## 3) 对比矩阵（A/B/C/D）

| 选项 | 核心心智模型 | 主要风险 | 对 16 项缺口的校准贡献 | 能否证伪/证实产品前提 | 与封口决策的张力 | 建议 |
|---|---|---|---|---|---|---|
| **A 工程纵深** | 横向铺层（反 tracer bullet） | 无价值锚的基建；"outrunning headlights"（aihero） | 弱：schema 演进/并发可部分落地，但阈值/S1 度量无锚 | 不能 | 无直接冲突，但会侵蚀 C 的"最薄"属性 | 压缩为 C 的使能件（A′） |
| **B spec 深化** | 规划即进步（反 RAT） | 无实测锚 desk 校准 → 返工；与 ADR-0011 current 现实脱节 | 名义全清、实测全无 | 不能 | 见 §5 冲突点名 | 降级为 C 的下游回流 |
| **C 端到端闭环** | tracer bullet + RAT + dogfooding | 若选错维度/仓库则白做（用 6F 自身对冲） | 强：阈值（任务1/2/4）、S1 语义度量、correlation key（任务10）、schema 演进（任务8）、scale 切片差异（任务15）实测锚 | 能：价值假设 + 使能假设同时被测 | 无（注意 ADR-0002 supersede 链，见 §5） | **主攻** |
| **D 分发就绪** | 卫生当进展 | 前提未证实先铺渠道 | 无 | 不能 | 无 | 拆出 CI 实跑提前到阶段 0，其余推后 |
## 4) 推荐组合路线：次序与稀释风险

- **阶段 0（半天～1 天，C 的前置使能件）**：① push + 让已配好的 engine-ci.yml 实跑（把 D 里唯一不可延后的一项收掉——否则 C 的所有验证跑在未 push 分支上，GitButler 分支隔离形同虚设，封口决策 11 失效）；② 最小 DuckDB fact table schema v0：事件只追加 + **correlation key 字段**（封口决策 4 + 术语表"作为 fact table schema 前置字段设计"的直接落地）；③ 第一个采集器：**先确定性采集**（git log / docs/adr/ 结构扫描），不接 LLM API——第一份报告的叙事可以先规则化，LLM 叙事后置，保持最薄。
- **阶段 1（主攻）**：Macro-B 单仓单维度 happy path 全链——建议从 **S2 ADR 质量 + S1 定位收敛**起手（6F 自身有 ADR-0001~0011 完整链 + supersede + 决策 ledger，证据最足、最不依赖 LLM、且天然是 S2 判据的活样本），跑通 采集→fact→叙事→裁决→报告，产出**第一份带引文、带 verdict-gate 印记的真报告**（载体 = 封口决策 9 的"报告生成器"CLI 外壳，是五层盒子里最不需要 UI 的形态）。这份报告同时完成两件事：证伪/证实价值假设；为 §2③ 的使能假设提供实测锚。失败路径（采集失败→降级报告 + ⚠ unverified 标记）可同路径验证，成本增量小（封口决策 6/7 顺带落地一条）。
- **阶段 2（B 回流）**：用阶段 1 的锚回头清扫 16 项缺口——顺序从"先深化再实现"反转为"先实测再深化"。
- **阶段 3（A 铺开 + D）**：前提证实后才逐块补全其余采集器/其余 scale；上架前需要真报告作为演示资产（10 路径的 happy path #1 就是阶段 1 产物），D 最后。
- **稀释风险（显式）**：C 与完整 A 并行 = 资源分流且破坏"最薄"属性（为接 MCP SDK 引入认证/授权复杂度会让第一份报告迟迟出不来）；B 与 C 并行 = desk 校准与实测锚打架，产生双源冲突式返工。故阶段 0~3 必须串行；唯一可并行的是阶段 0 里的 CI 实跑。

## 5) 冲突点名（与封口决策逐条核对）

**无直接冲突；但有 1 处必须显式点名的封口链状态**：

1. **ADR-0002「拒绝 MVP 切片」已被 supersede——本调研已核实 supersede 链**：docs/adr/0002 Status: "superseded by ADR-0010"；ADR-0010 又被 ADR-0011 更正（本仓实际文件核实）。因此"先做 Macro-B 一条路径"在决策层**不违规**：C 不是产品级切片（5 scale 规格仍是完整规划、spec 仓完整度不变），而是**实现级 tracer bullet**（Pragmatic Programmer 心智，与 ADR-0010/0011 确立的"walking skeleton 验收"同一谱系）。但 .scratch/macro-audit/spec-phase-tasks.md 第 70 行残留"R2 全部完成前不启动工程实现（ADR-0002 边界不变）"已随 supersede 失效——**选 C 时应顺手更正该残留表述**，避免 spec 仓自己的 S2 判据（检查 supersede 链一致性）与工程现实打架。
2. 其余 10 条封口决策与 C 的关系：决策 1（5 档粒度共享证据/裁决层）→ C 只实现 spine 第一条，其余 scale 复用同一条 spine（决策 4 的 read model 投影），不破坏覆盖承诺；决策 3（S1-S5）→ C 从 S2/S1 起手正落在封口维内；决策 4（Hub-of-Facts）→ C 的 fact schema v0 必须含 correlation key，C 是它的第一次真实落地；决策 5（报告骨架+引文校验+裁决回执）→ 恰是 C 的验收标准；决策 6/7（10 演示路径+显式降级）→ 阶段 1 顺带产出 happy path + 一条失败路径；决策 8（默认模式=Macro-B）→ C 选 Macro-B 与默认路径同构（最薄路径 = 默认路径）；决策 9（五层盒子）→ C 用"报告生成器"外壳承载，不动分发形态；决策 10（输入面本地默认）→ 6F 是本地路径、零授权事件，最薄；决策 11（单仓 engine/ + GitButler）→ 阶段 0 的 push/CI 实跑正好激活分支隔离。**无静默改向**。

## 6) 完整来源清单（原标注 15 条，表内 16 行，均为本轮实际抓取/提取）

| # | 标题 | URL | 角度 | 日期 | 贡献 |
|---|---|---|---|---|---|
| 1 | Walking skeletons and tracer bullets | tinnedfruit.com/list/20180815 | Community | 2018-08-15 | tracer bullet：最小端到端切片 + 生产特性前置（抓全文） |
| 2 | Tracer Bullets: Keeping AI Slop Under Control | aihero.dev/tracer-bullets | Currency | 2026-01-22 | 反横向铺层、outrunning headlights；agent 时代 tracer bullet（抓全文） |
| 3 | Start with a Walking Skeleton | mattblodgett.com/2020/09/start-with-walking-skeleton.html | Community | 2020-09-28 | walking skeleton 定义（Cockburn/GOOS）+ 每 user story 先 mini-pipeline 再增肌（抓全文） |
| 4 | How assumptions mapping can focus your teams on running experiments that matter | strategyzer.com/library/how-assumptions-mapping-can-focus-your-teams-on-running-experiments-that-matter | Official | 2020-08-04 | 2×2 证据×重要、右上象限=RAT、"We believe that"格式（抓全文） |
| 5 | The MVP is dead. Long live the RAT. | hackernoon.com/the-mvp-is-dead-long-live-the-rat-233d5d16ab02 | Official(一手) | 2016-09-27 | RAT 命名起源、MVP 滥用、Ries/Tom Chi 引语（抓全文） |
| 6 | Seventeen years later, code quality is more relevant than ever | sonarsource.com/blog/sonars-17-year-anniversary/ | Official | 2025-11-13 | Sonar 起源：解自己问题的 OSS + 每日 dogfood + release-early + 早期两特性（抓全文） |
| 7 | Semgrep (Wikipedia) | en.wikipedia.org/wiki/Semgrep | Official | 检索日 2026-09 | sgrep/pfff 谱系、r2c 2017、2020 更名、单文件窄引擎取舍（抓全文） |
| 8 | Semmle (Wikipedia) | en.wikipedia.org/wiki/Semmle | Official | 检索日 2026-09 | CodeQuest/Datalog → SemmleCode → LGTM → 2019 GitHub 收购（抓全文） |
| 9 | Sourcegraph (Wikipedia) | en.wikipedia.org/wiki/Sourcegraph | Official | 检索日 2026-09 | 2013 单一 Code Search 起步、早期客户 Uber/Dropbox/Lyft、后扩 Cody/Amp（抓全文） |
| 10 | The Ultimate Dogfooding Story | blog.codinghorror.com/the-ultimate-dogfooding-story/ | Community | 2009-01-27 | dogfooding 谱系（Microsoft/Alpo）+ SawStop 极限例（抓全文） |
| 11 | Spec-First API Development | api-portal.io/en/resources/articles/spec-first-api-development | Currency | 2026-05-04 | spec-first 收益与"不值得切换"的精确边界、漂移警告（抓全文） |
| 12 | Comparison of Code First and Design First Approaches⟦…作者字段未召回⟧ | journals.nupp.edu.ua/sunz/en/article/view/2013 | Official(同行评审) | 2020-11-25 | Design First 在 velocity 上的实证优势（web_fetch 超时→Tavily extract 补读成功） |
| 13 | Semgrep Dogfooding (DeepWiki) | deepwiki.com/semgrep/semgrep⟦…尾段截断⟧ | Community | 检索日 2026-09 | Dogfood 架构：PR 差分/每日全扫/pre-commit/CI 阻断（抓全文） |
| 14 | Why Most Developer Startups Fail Before Launch | dev.to/thebitforge/why-most-developer-startups-fail-before-launch-the-brutal-truths-nobody-tells-you-1848 | Criticism | 2026-01-18 | devtools 失败=无验证构建；scrappy first version > months of planning（抓全文） |
| 15 | Dogfooding Your Own Product Isn’t Enough | dev.to/polluterofminds/dogfooding-your-own-product-isn-t-enough-2gb9 | Criticism | 2019-08-29 | dogfooding 三大盲点，必须叠加早期用户反馈（抓全文） |
| 16 | Vertical slice explained for 2026 | monday.com/blog/rnd/vertical-slice/ | Currency | 2025-11-20 | vertical slice 定义、1–4 周节奏、~40% 周期缩短（抓全文） |

另：本地核实（read_file）——docs/adr/0002（superseded 状态）、0010（supersede 0002）、0011（supersede 0010，current）、CONTEXT.md 术语层（correlation key / Hub-of-Facts / 默认模式等 11 条封口决策）、.scratch/macro-audit/spec-phase-tasks.md（18 项缺口清单，其中任务 15 前置明写"真实仓库试点"——即 C）；KB 召回（ctx_search）——既往 ADR 假设提取调研（Strategyzer/Bland）、CodeLore 项目 dogfood 工具、AsyncAPI code-first vs schema-first 结论。
## 7) 信息缺口

- clutch.co 的 RAT vs MVP 对比页 403 未读（已用 HackerNoon 原文 + Strategyzer + ModelThinkers 检索摘要补位）；
- nupp 论文作者名与精确发表日期字段缺失（仅有 2020-11-25 检索标），结论只取其"Design First 速度优势"方向性证据；
- "Sonar 早期两特性（单配置+历史库）"仅官方博客一手信源，二手聚合（businessmodelcanvastemplate）未抓全文；
- 公开文献中不存在 S1 70% / S2 90 天类**阈值校准数据**——这本身是推荐 C 的理由：该数据只能由 C 的真报告产出；
- 审计/审查类产品"第一份真报告"的**专项**先例（如 CodeScene/Structure101 早期史）未检索到高信源，以 Sonar/Semgrep dogfood + KB 内 CodeLore 近邻先例替代，建议在阶段 1 执行时对同类（CodeScene 行为分析、GitClear）补一轮定向调研；
- 检索中出现"Rik Ingram / Rik Higham"作者名不一致，以已抓 HackerNoon 原文（Rik Higham）为准，其余未深究。

**一句话决策**：先把 6F 自己喂进 Macro-B 的 spine，跑出第一份带引文与裁决回执的真报告——它同时是产品前提的证伪实验、16 项缺口的第一批实测锚、以及 10 条演示路径的 1/10；A、B、D 都排在它后面。

## 8) 运行侧记录

- Sufficiency Gate：searches 14（Exa×6 / Tavily×4 / AnySearch×3 + Tavily extract 重试×1）；angles 全 5 类（Official/Comparative/Criticism/Community/Currency）；full reads 15（web_fetch×14 + tavily_extract×1，12 个独立域名；clutch.co 403 未计入）。
- 任务日志（atomcode 自述）：任务 1 KB 召回+ADR 链核实 → 任务 2 tracer bullet/vertical slice → 任务 3 RAT → 任务 4 四家产品早期史 → 任务 5 spec-first + dogfooding → 任务 6 定点深挖 6 篇原文（14 抓取成功）→ 任务 7 交叉验证 + 2025/2026 vertical slice 时效源。
- 续问锚点：atomcode -p "…" --resume 5e1815a6-6824-4d24-93c4-8112d4ac5b65
- 落盘处置：原子输出先入 ctx KB，本文件为重组稿（截断接缝见文首声明）；决策处置见 decision-ledger.md D-016（current）。
