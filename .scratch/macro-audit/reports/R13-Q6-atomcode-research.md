# R13-Q6 atomcode 深度调研报告 — Kernel/Agent 职责边界要不要总则化

> 调研题面：D:\Aworker\6F\.scratch\macro-audit\reports\R13-Q6-research-prompt.md
> 时点 2026-09-16；通道 ctx_batch_execute（label=atomcode-r13q6，FTS 已索引）。
> Sufficiency Gate：searches 9｜angles 五类全｜full reads 6（Anthropic/LangGraph/OWASP-Medium/SeniorExecutive/Spotify/ozimmer）｜gaps：DSPy/K2 judge 仅搜索级。
> 冲突协议结果：**零 revised——(a) CONTEXT 词条收编，不开 ADR-0022**。

## §1 执行摘要

推荐 (a)：CONTEXT 收编新词「Kernel/Agent 职责边界」带判例指针，不立 ADR-0022（置信高）。
理由三句：① 工业界该原则成熟形态恰是一句话心智模型（Anthropic workflow/agent 一句区分、「LLM proposes, deterministic core disposes」、sandwich architecture）——词面落点与原则信息密度匹配；② 升 ADR 门槛=有一个**新**决策含取舍与备选（Fowler/ozimmer/Spotify 三源一致），本原则是对 ADR-0005/0008/0013＋三条判例的既有裁决之命名——无新决策无新取舍，立 ADR-0022 会产出 ozimmer 点名的「零价值 ADR」；③ 完全不立则通不过 Spotify backfill 判据（有真问题？是。有已收敛的解？是。已文书化？否→写下来）——三条判例本轮靠题面才被点破同构，正是「未文书化的隐性标准」教科书案例。

## §2 分点结论（要点）

- Anthropic Building Effective Agents 的 workflow（predefined code paths）/agent（dynamic direction）一句区分=该原则最成熟表述；
- LangGraph deterministic guardrails、K2 LLM-Judge 三职责分离（搜索级）同构「deterministic core disposes」；
- 判例链→成文总则时机判据（Spotify backfill）：真问题存在＋解已收敛＋未文书化=该写；
- ADR 收编门槛（Fowler/ozimmer）：单决策含取舍与备选才配 ADR——归纳命名不配；
- glossary vs ADR 分工惯例：词表承载「会重复引用的概念命名」，ADR 承载「难反转的取舍」。

## §3 对比矩阵

| 项 | (a) CONTEXT 词条 | (b) 不立 | (c) ADR-0022 |
|---|---|---|---|
| 落点 | CONTEXT.md 新词条＋判例指针 | 无（判例链隐式） | docs/adr/0022 |
| 与现有面关系 | 引用 ADR-0005/0008/0013＋D-055/056/057 零改写 | 同左不成文 | 复述 0005/0008 语义重叠 |
| 工业先例 | Anthropic 一句区分式心智模型 | Spotify backfill 判据不满足 | Fowler/ozimmer 门槛不满足 |
| 失败模式 | 词条僵化、与 ADR 勘误漂移 | 重复裁决成本线性涨、原则靠题面才被看见 | 零价值 ADR、supersede 噪音 |
| 新维护者迁移成本 | 读词条＋三条 D 即可 | 须重读三条 D 自行归纳 | 交叉对照负担最重 |

## §4 各候选已知失败模式

- (a)：词条若写死细则会与 ADR 勘误漂移——缓解=词条只写总则＋判例指针不写细则，随轮次新增判例追加指针；
- (b)：每来新面重开同款争论，成本线性涨；原则只能被题面点破=隐性标准；
- (c)：ozimmer「零价值 ADR」——无新决策无新取舍纯复述；后续若被 supersede 又添噪音。

## §5 词条措辞建议（采纳 (a) 时）

> **Kernel/Agent 职责边界（确定性核 / 概率性编排）**：本产品分工总则——确定性面归 kernel（事实采集、引文盖章、门禁检查：可重放、可测试、预定路径）；编排与概率性面归宿主 agent（叙事生成、补查回路、触发编排、呈现：模型驱动、路径不预定）。与 Anthropic workflow（predefined code paths）/agent（dynamic direction）区分同构。跨界争议按判例裁：hooks 层＝纯呈现面非裁决点（D-055）；repo 文件面归宿主 agent 原生访问、产品不提供打包上游（D-056）；gap→补查回路归 orchestrator 非 kernel（D-057④）。裁决 band 永不归 agent——band 归 C 层人裁定（ADR-0013/D-026 红线）。
> _Avoid_: 微内核（架构模式借喻）、裁判员/运动员（拟人不精确）、确定性内核 vs 概率外壳（非本仓语序）、AI 管线（丢失 kernel 盖章语义）

设计要点：判定标准用「可重放/可测试 vs 模型驱动」可操作判据（源自 Anthropic「workflow 可重放、agent 不可」），非抽象形容词；显式携带 ADR-0013 band 红线防 D-053 违规回潮。

## §6 冲突排查（逐条点名）

D-053✅（词条=其红线段原则化命名）／D-055✅（引用收窄后语义，注意成对落盘纪律）／D-056✅（采纳其结论语）／D-057④✅（判例指针之一）／ADR-0005✅（词条引用不覆盖）／ADR-0008✅（按 D-055 勘误后层④释义引用，不得复活「hooks 触发面」旧表述）／ADR-0013✅（band 红线显式写入词条，加固非冲突）／ADR-0014✅／D-045✅ 无涉。结论：零冲突，不开 ADR-0022。

## §7 信息缺口

- DSPy/K2 judge 三职责分离仅搜索级证据（结论未单独依赖）；
- 「判例→总则」判据多源自工程博客惯例非标准文献——与 ADR 治理三源交叉后置信仍高。

**一句话裁定**：(a)——CONTEXT 收编「Kernel/Agent 职责边界」词条（总则＋判例指针＋band 红线），不开 ADR-0022；词条随轮次新增判例追加指针。
