# R11-Q2 atomcode 深度调研报告 — Micro-A preview 铺开票（拟 #48）票面形态定义

> 调研题面：D:\Aworker\6F\.scratch\macro-audit\reports\R11-Q2-research-prompt.md
> 时点 2026-09-16；通道 ctx_batch_execute（label=atomcode-r11q2，FTS 已索引）；atomcode 会话锚 90259bb9-a22b-4b94-bce8-38978106d762。
> Sufficiency Gate：11 查询 × 5 角度／6 次原文核验（外部+本地双源交叉）。冲突协议结果：**无实质冲突，3 处边界确认＋1 处前置依赖声明**。

## §1 执行摘要（Tl;dr）

**推荐 (a) 单票铺开**——#48 一票闭环「适配器消费侧管道 + 双仓三形态试点实跑 + 报告双件 + 披露三件套」，直接对齐 ADR-0017「preview 层自成完整价值单元」与本仓 #38/#39 双先例口径。置信度：**高**（本地三层决策链 D-032/D-033/D-047/D-048 + ADR-0017/0013 内部一致；外部惯例两源以上交叉支持）。但建议在 (a) 内内嵌一个**结构化验收顺序**：管道 golden 驱动段先 PASS、再跑真实 PR，避免「试点失败时管道与试点责任不清」——这是对 (b) 拆票合理内核的吸收，而非改向。

## §2 分点结论

### ① 票面形态：推荐 (a)，置信度高

**本地证据（最高来源层级：本仓 current 决策）：**

- D-032 演示双件 DoD：每能力层 happy+failure 演示件是 **preview 准入件**——failure 件不是可选补充，而是完成定义的组成部分。拆票 (b) 会把准入件推后一票，等于管道票自身不满足 D-032 完成口径；
- ADR-0013 三层验收闸门 + 预声明判据：判据事前写死、验收时点在层闭环处——单票把「管道→实跑→报告」作为同一判据组验收最贴合；
- A-043（#38 Macro-C preview）与 A-044（#39 Macro-B one-shot）双先例：**每一层 preview 都是一口气闭环的完整价值单元**，反复接受非跑通如实落 unsupported 也是有效结果——这正是 (a) 的形态先例；(b)/(c) 在本仓无先例；
- D-043 判据意图读法 + desk-task15 重绑记录（D-044）：判据 = Micro-A 真实 PR 报告产出——票面必须含真实实跑才能触发事件闭环，(c) 探针报告件后补会导致 trigger_event 再次空转；
- D-034② 层序：Micro-A 第三，前面两层已跑通模式，风险边际低，无需 (c) 探针式降险。

**外部惯例（两源以上交叉）：**

- rampstackco beta→GA 毕业判据原文：毕业是 **criteria-driven 不是 calendar-driven**，判据必须事前定义且**一次验收**，拆开验收会产生「hidden known issues」反模式——「管道票先收口、试点票后补」正是「毕业时点与判据验收时点分离」的失败形态；
- 试点设计惯例（fabrico.io + gurusoftware.com）：试点五要素（frozen baseline / fixed duration / defined artifacts / attribution / exit question）中 **artifacts 必须事先点名**、「三结果皆有用：跑通→继续、数字不支持→诚实停、无法回答→也是信息」——与 A-044「如实落数 unsupported 也是有效结果」同构；
- CodeRabbit/Greptile 等 PR 审计工具公开形态：**每 PR 一份自包含报告**（summary 分组 + inline 标注 + walkthrough），报告即产品价值单元。

**对 (b) 的裁定**：合理内核用**票内验收顺序**吸收：验收序列写死 ① golden 契约驱动管道 PASS → ② env-manager 三形态实跑 → ③ jiahao 全人基线 → ④ failure 件（anysearch-cli 诚实拒绝）→ ⑤ 披露三件套 → ⑥ desk-task15 判据核验 + 事件闭环。不拆票。

**对 (c) 的裁定**：显式否决。探针报告件后补违反 D-032（failure 件是准入件非后补件），且 desk-task15 fired 记录已因错配转过审计痕迹——再来一次空转事件会二次污染账本。

### ② PR 选取判据最小充分集与 failure 件形态（置信度：中高）

- **最小充分集 = 4 条 PR，形态覆盖判据优先于样本量**：env-manager ×3（dependabot 形态 1 条 + release-please 形态 1 条 + 人类 PR 1 条）；jiahao ×1（人类 PR，全人全 merged 基线，兼作无机器人混淆对照）。
- 理由：工业试点惯例是**形态/象限覆盖压倒数量**（fabrico.io：「8-15 assets across 2-3 failure modes；先求覆盖类属再谈样本量」；gurusoftware：diversity aligned to personas 优先于 statistical significance）。本场景分布已知（74% 机器形态+7 全人已 merge），选代表性形态样本即可，无需随机抽样。
- 每形态 ≥1 是**必要非充分**——加两条选取硬判据：① PR 已 merged（有终态可回溯验证）；② diff 规模适中（非 trivial 单行、非巨型重写），保证骨架字段非全空非爆表。票面以具体 PR 实例写死而非通用公式。
- **failure 演示件最佳形态：无托管面诚实拒绝（anysearch-cli 负例）**：D-033 硬约束**逆用**=最诚实 failure 演示——跑 anysearch-cli（remote-only 无 PR 面）→ 管道在 intake 阶段显式拒绝 → 报告落「unsupported: 无托管 PR 面」+原因+前置条件（复刻 A-044 先例）。
- **token 缺席降级=Degraded Demonstration 非 failure 路径**：D-048 凭据三级探测下 token 缺席触发 gh 回退或显式降级披露，属 happy/degraded 通道分支——区别写进票面判据避免混测；token 缺席降级路径降为 golden cassette 测试（不真跑，占 failure 件次级位）。
- 外部佐证（speakeasy/Google tech-writing）：错误信息须「clear, concise, actionable」——拒绝报告含「为什么不可审+需要什么才可审」。

### ③ desk-task15「字段清单满足骨架交集」落地验证（置信度：中高）

落地方式 = **字段断言脚本化**（延续 #33 guard 模式，本仓先例 A-038）：

- 从 ADR-0006 共享骨架 + Micro-A scale 切片**机械导出字段清单**（禁止手抄清单漂移）；
- happy 件真实报告正向断言：报告字段集合 ⊇（骨架公共字段 ∪ Micro-A 切片特有字段），逐字段存在性+类型检查；
- failure 件反向断言：产出物含 unsupported/显式拒绝语义+披露块字段齐备（对齐 D-024/A-043 口径）；
- 断言结果进 NN-check.mjs（exit 0 + PASS/FAIL），复用既有验证链不新增机制；
- **不建议** golden 全文比对：真实 PR 报告内容随 PR 变化，golden 只锁字段骨架不锁内容值；内容级 golden 属后续 GA 收口。

### ④ 与本仓 current 决策的冲突点（显式列出）

**无实质冲突**，三处边界确认点（票面文字显式声明防事后争议）：

1. D-033 原判已被 #37 实测证伪并由 D-047 改判——#48 票面引用 D-047 口径，**不得**回引 D-033 原文；
2. D-038 demo fixture 与 #48 真实实跑的关系：happy 件是**真实审计产物**（D-030 provenance 披露制先例），fixture 仅用于管道 golden 段——票面写明两通道各自口径，防「真实报告被误标 fixture」或反向失真；
3. D-025 勘误式双读数：实跑发现骨架字段与真实 PR 数据不适配（字段全空/爆表）时**不得**在 #48 内静默改骨架——走 D-025 勘误双读数登记，骨架改动另立决策。

一处潜在张力（非冲突）：#47 未落地，#48 票面须显式声明前置依赖，避免并行抢工。

### ⑤ 风险与诚实披露点

- **机器形态语义风险（最高）**：env-manager 74% 机器 PR——防**反向失真**：不能把机器 PR 审计结果暗示为人类代码质量结论；
- **同主确认偏差**：试点仓与本产品同主——披露须在 happy 件报告头部醒目位置而非脚注；
- **preview 标注纪律**：对齐 D-031「capability N of M · preview」+0.x 语义+首段能力边界披露；GitHub Terms（2026-04-27 版）明示 Preview「AS-IS/WITH ALL FAULTS/可随时变更终止」——本产品 preview 披露参考该语言强度避免过度承诺；
- **试点可泛化性有限**：2 仓 4 PR 是形态覆盖非统计样本——票面 roadmap 叙事可写「试点集」不得写「覆盖面」；
- **token/凭据链风险**：D-048 凭据三级探测未实测前 #48 实跑可能暴露凭据面缺口——预案：gh 回退走通也算管道 PASS，但如实披露走主路还是回退。

## §3 对比矩阵（三候选票面）

| 维度 | (a) 单票铺开（推荐） | (b) 拆两票 | (c) 最小探针 |
|---|---|---|---|
| D-032 双件 DoD | 满足（双件同票） | 管道票缺 failure 件违约 | 报告件后补违约 |
| desk-task15 事件闭环 | 同票满足 | 推后 | 再空转风险（有前科） |
| 先例契合 | #38/#39 同款 | 本仓无先例 | 本仓无先例 |
| 责任分离 | 票内验收顺序吸收 | 票面分离 | — |
| 风险边际 | 低（前两层已跑通模式） | 中（衔接成本） | 低但未交付价值单元 |

## §4 来源与缺口

- 外部源（11 查询×5 角度，6 原文核验）：rampstackco beta→GA 毕业判据原文；fabrico.io 试点五要素；gurusoftware 试点规划；CodeRabbit/Greptile 公开报告形态；GitHub Terms 2026-04-27 preview 条款；speakeasy/Google tech-writing 错误信息惯例；cli.github.com gh_pr_list 手册。关键结论均 ≥2 独立信源或本地决策链多环支撑。
- 缺口：① Agent Plugins 生态无「层级 preview 票面」完全同型先例（三邻域外推，与 D-031/D-032 缺口注记同款非新增）；② GitHub preview headers 毕业原文已 404 改由 changelog 佐证；③ PR 级「diff 规模适中」无定量阈值先例——票面以具体 PR 实例写死。
