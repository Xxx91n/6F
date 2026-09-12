# R3-Q2 atomcode 深调研 —— 「第一份真报告」验收口径（2026-09-12）

> 出处：grill 轮 3 Q2 经用户指示提交 atomcode 深调研（用户原倾向 A+C 跳过 B，调研呈报后被否，用户拍板三层闸门）。
> 重组声明：本文件由 ctx KB 召回重组，个别检索窗口截断处以 ⟦…⟧ 标记。
> 续问锚点：atomcode -p "…" --resume 4c4ba50a-a259-470d-8774-09d4877d9a23

## 0) 给调研的原始背景（verbatim 摘要）

macro-audit 阶段 1 产物「第一份真报告」的验收口径应定哪级：A 形式达标 / B 内容非平凡 / C 信任裁决；用户倾向 A+C 跳过 B。要求回顾全部 current 决策 + ADR/CONTEXT，以工业界成熟心智模型为重点，冲突显式点名。

## 1) 执行摘要（Tl;dr）

**推荐：不要采用 "A+C 跳过 B"。正确形态是 A→B→C 三层闸门串行，其中 B 不可跳过、但 B 的"未命中"应被定义为本实验的合法成功产出（kill criterion 预声明，RAT/HDD 心智），而非失败。** 用户担心的"形式达标放过先验套话"不是假设性风险，而是工业界反复实证过的真实失败模式——no-finding 报告判读陷阱（审计行业）、eval gaming（LLM/agent evals）、Goodhart 定律（度量目标化）三条独立证据链全部指向同一结论：**结构/形式通过 ≠ 内容有价值，且把形式当验收目标会系统性优化出"结构完美、内容空洞"的产出**。C 层的"产品所有者扮演外部读者通读裁定"自身带有 dogfooding 自我偏差（confirmation bias + expert blind spot + bias blind spot），若不改造，C 只是把 A 的自我验收换了一层更精致的马甲。B 恰恰是 A 与 C 之间唯一的客观锚点——它用预声明的非平凡判定把"报告值得读"变成可证伪命题。**Confidence：高**（三条独立工业证据链 + 心理学偏差文献交叉一致；残余不确定仅在 B 判据在 6F 真实数据上的具体命中形态，这正是本实验该回答的问题）。

## 2) 分点结论（每条标注来源；冲突明写）

**C1. RAT 的正统教义：kill criterion 必须在实验开始前预声明，且模糊判据产生模糊证据。** RoadmapOne RAT 五步法（2026-04，全文核验）：⟦前段截断⟧… "…shown W, we kill this idea. The kill criterion goes in before the experiment runs"；"Vague RAT produces vague evidence, and vague evidence can’t kill an idea." —— **推论：把验收定为 A（形式达标）等价于一个"杀死不了任何东西"的 RAT 判据。A 层判据（骨架齐全+引文可回查+Receipt 存在）对任何一份报告（哪怕全是先验套话）都必然通过，因此它没有任何证伪能力**。[源1]

**C2. 可证伪性在工程验收中的落地形式 = pre-registration（预注册）**。congruentsys HDD（2026-02，全文核验）：假设+阈值必须在收集数据前 commit 到 git，"You can’t move the goalposts. You said 15%. Either you hit it or you didn’t"；未经预注册的结果无法排除 HARKing（结果已知后倒推假设）；"A hypothesis that fails tells you something. A hypothesis you never test tells you nothing." 失败≠bug，是数据。[源2] —— **推论：如果只做 A+C，C 的"信任裁定"若在报告生成后才定义裁定标准，就是 HARKing。C 的裁定三档及其判定依据必须在看报告前写死并入库。**

**C3. 验收分层存在清晰权责边界：smoke/sanity 的通过不构成 acceptance 的通过，行业共识的结构性事实。** betterqa（2026-02）分层表：Smoke=Go/No-Go（"值得继续测"）、Sanity=Pass/Fail（"修复没破坏相关功能"）、Acceptance=Accept/Reject（"满足业务需求，可投产"），并明确 "Developers test technical functionality, not business value"——**形式验收 = smoke 层，价值验收 = acceptance 层，权责不同不可顶替**。[源3][源4]

**C4. no-finding 报告的判读陷阱是本次决策最直接的前车之鉴——"零发现/全通过"在审计行业本身被当作红旗**。LinkedIn 执业审计师（CPA/CISSP/CISA）原话："when I see a SOC 2 report with NO findings - zero - I often wonder how rigorous the control testing was. Was an audit really performed or was this just a ‘check the box’ exercise"（含一审计师因客户"用工具后 0 findings"失单又回归的故事）。[源5] 独立佐证：OWASP 静态分析条目明示⟦…⟧（见源6）。

**C5. LLM/agent evals 的教训：结构/基准通过而真实任务失败是系统性现象（eval gaming），防御 = 从未参与调优的 holdout golden set**。theLLMs（2026-05，全文核验）：Goodhart 直接适用——"If a benchmark is the score that drives release decisions, the model will be optimised toward that benchmark, not toward the task"；三机制：benchmark contamination、fine-tune overfitting、prompt engineering to the eval；防御 = 人工手写 50-100 条真实用户场景 golden set，"If benchmark scores climb but the holdout set stays flat — or gets worse — you are looking at eval gaming"。confident-ai 同向："agents can pass evals while still failing in production if your dataset never captures real failures"。[源9][源10] —— **推论：A 是 benchmark，B 是 golden set。跳过 B = 只有 benchmark 没有 holdout。**

**C6. 审计/尽调行业对"报告合格性"的共识：合格 ≠ 结构齐全，而是 findings/opinion 本身可辩护**。sphereinc TDD 指南（2026-07）：TDD/code audit 存在的理由恰是 "financial and legal review no longer catch what matters"，价值="evidence-based, built on direct access to code"；IIA GAIS Domain V（经 Sphere 转述）要求报告含 findings/conclusions/opinion 为交付核心⟦…⟧。[源11] ┆ **C7. Goodhart 定律在工程领域的实证**：Splunk（告警数目标化→优化数字而非威胁，"measure becomes target"）[源12]；CodePulse（LOC 指标→verbose code + 抗拒重构）[源13]。┆ **C8. dogfooding 验收自我偏差**：Kromatic《The Real Startup Book》dogfooding 条目（全文核验）：**"generative not evaluative"**——dogfooding 只可用于生成式探索，不可用于评估性验收；确认偏差 + 专家盲点；不能委托 AI agent 代读。[源14] 心理学基底：bias blind spot（人对自己偏差盲）[源15]⟦…⟧。

**C9. 上一轮 KB 复用（R3-Q1）已核实：6F 是自家仓库、S2 ADR supersede 链存在真实历史（ADR-0002→0010→0011，且曾发现 .scratch 残留与 supersede 链打架的实例）**。[KB] —— **推论：B 判据在 6F 上"极可能可命中"；B 不是高不可攀的负担，而是成本近零（确定性采集器）、收益极高（golden set）的锚点。**
## 3) 对比矩阵：A/B/C 三层验收口径

| 维度 | A 形式达标 | B 内容非平凡 | C 信任裁决 |
|---|---|---|---|
| 本质 | 结构/存在性检查 | 可证伪的内容判定 | 人类信任裁决 |
| 回答的问题 | 管线通了吗？ | 产出值得读吗？ | 我敢据此行动吗？ |
| 可证伪性 | 无（任何报告都通过） | 有（预声明判据） | 弱（取决于裁定者） |
| 对应工业概念 | Smoke 层 / no-finding 报告 | Golden holdout set / RAT kill criterion | Acceptance/UAT / dogfooding evaluative 误用 |
| 已知陷阱 | Goodhart、eval gaming、假信心（C4/C5/C7） | 判据未预声明则退化为 A | 自我偏差（bias blind spot、确认偏差）C8 |
| 与封口决策 5 的关系 | 骨架+引文+Receipt（已封口） | 引文→结论支持关系校验（需显式强化） | 建议必带裁决回执（已封口，但回执≠裁定质量） |
| 谁在判 | 规则/确定性校验 | 预声明判据+确定性采集器 | 产品所有者（外部读者视角） |
| 成本 | 低 | 低（确定性采集器不接 LLM） | 中（剧本+对抗性清单） |

## 4) 完整来源清单（本轮实际核验，9 条全文 + 6 条强摘要）

| # | 标题 | URL | 角度 | 日期 | 贡献 |
|---|---|---|---|---|---|
| 1 | Riskiest Assumption Test (RAT) — RoadmapOne | https://roadmap.one/blog/posts/blog44-4-riskiest-assumption-test/ | Official(一手梳理) | 2026-04-14 | RAT 五步法；kill criterion 预声明；"vague evidence can’t kill an idea"；MVP vs RAT 对比矩阵（全文核验） |
| 2 | Hypothesis-Driven Development — Congruent Systems | https://congruentsys.com/hypothesis-driven-development/ | Official(一手实践) | 2026-02-27 | HDD pre-registration；git hash 作仲裁；refuted hypothesis=数据；HARKing 定义（全文核验） |
| 3 | Smoke vs sanity vs acceptance testing — BetterQA | https://betterqa.co/smoke-testing-sanity-acceptance-testing-qa-guide/ | Comparative | 2026-02-05 | 三层验收权责表；形式验收≠价值验收；smoke 误当 regression 反模式（摘要+原文要点） |
| 4 | Smoke/Sanity/Retest/Regression — AskTester | https://asktester.com⟦…⟧ | Comparative | ⟦…⟧ | 四层测试权责交叉核验（摘要⟦…⟧） |
| 5 | LinkedIn 执业审计师帖（SOC 2 零发现红旗） | ⟦未召回 URL⟧ | Criticism | ⟦…⟧ | "zero findings" 报告=红旗；"check the box" 审计案例（摘要，含同行点赞的从业者评论） |
| 6 | OWASP Static Code Analysis | https://owasp.org/www-community/controls/Static_Code_Analysis | Official | 检索日 2026-09 | SAST 只是 analyst 辅助；false negatives 大量存在；"工具非自动找漏洞机器"（全文核验，跳转 community.owasp.org） |
| 7 | Why do SAST tools create false confidence? — NHIMG | https://nhimg.org/faq/why-do-static-application-security-tools-create-so-much-false-confidence/ | Criticism | 2026-08-18 | "What is left unverified?"替代"Did the scan pass?"；clean scan≠secure；NIST/OWASP 框架对齐（web_fetch 403 → Tavily extract 补读成功） |
| 8 | Compliance vs Security: What Passing an Audit Misses — SecurityScorecard | https://securityscorecard.com/blog/compliance-vs-security-what-passing-an-audit-misses/ | Criticism | 2026-06-12 | 通过审计≠安全；快照 vs 连续；35.5% breach 涉第三方（全文核验） |
| 9 | Eval gaming: models optimise for the test — theLLMs | https://thellms.dev/run/eval-gaming-when-models-optimise-for-the-test-rather-than-the-task/ | Criticism | 2026-05-28 | eval gaming 三机制；golden holdout set 为第一防线；benchmark delta vs golden delta 对照（全文核验） |
| 10 | LLM Agent Evaluation Complete Guide — Confident AI | https://www.confident-ai.com/blog/llm-agent-evaluation-complete-guide | Currency | 2026 | "pass evals while failing in production"；trajectory 评估（摘要） |
| 11 | Technical Due Diligence & Code Audit Guide — Sphere | https://www.sphereinc.com/guides/technical-due-diligence-and-code-audit-guide | Official(行业) | 2026-07-31 | TDD/code audit 价值=evidence-based 独立审查；IIA GAIS Domain V 报告要素；执行摘要五问（摘要） |
| 12 | Goodhart’s Law — Splunk | https://www.splunk.com/en_us/blog/learn/goodharts-law.html | Official | 检索日 2026-09 | 告警数目标化→优化数字而非威胁；"measure becomes target"（摘要） |
| 13 | Goodhart’s Law in Software — CodePulse | https://codepulsehq.com/guides/goodharts-law-engineering-metrics | Community | 检索日 2026-09 | LOC 指标→verbose code+抗拒重构；工程领域游戏化实证（摘要） |
| 14 | Dogfooding — The Real Startup Book (Kromatic) | https://kromatic.com/real-startup-book/3-generative-product-research/dogfooding/ | Official(方法论文档) | 检索日 2026-09 | **"generative not evaluative"**；确认偏差+专家盲点；不能委托 AI agent（全文核验） |
| 15 | Bias Blind Spot — Scie⟦…nceBeta⟧ | ⟦URL 截断⟧ | Official(心理文献) | ⟦…⟧ | 人对自身偏差不自知的元偏差（bias blind spot）——裁定者自我偏差的学理基底⟦…⟧ |

另：本地核实与 KB 复用——R3-Q1 调研全部 16 源、ADR-0002→0010→0011 supersede 链、CONTEXT.md 术语层、decision-ledger 现状、spec-phase-tasks.md 缺口清单。
## 5) 信息缺口

1. **IIA GAIS 官方原文未直接抓取**（仅经 Sphere 转述 Domain V 要求）——不影响结论方向，因 C6 的核心论据（findings/opinion 是核心交付物）已被 OWASP/NHIMG/SecurityScorecard 独立佐证；
2. **"零发现报告"红旗的直接从业者实证仅 LinkedIn 帖**（非正式出版物）——但已被 NHIMG/OWASP/SecurityScorecard 三条独立工业源从机制层面佐证；
3. **B 判据在 6F 真实数据上的命中形态未知**——这是本实验自身的可证伪点（正是 RAT 要测的假设），不是调研缺口；已知 6F 有真实 supersede 链历史（ADR-0002→0010→0011），命中概率不低（C9）；
4. **agent 工作流内嵌场景下"信任并行动"的操作化定义**（封口决策 8：默认用户是 C 类 agent 用户）——报告作为 agent 输入如何被"消费"，本调研只能从 confident-ai 的 trajectory 评估侧证，建议在 C 判据设计时显式定义。

## 6) 明确推荐与冲突点名

### 推荐：A → B → C 三层串行闸门，B 不可跳过，但 B 以 RAT 预声明判据组织

- **A 层（阶段 1 技术闸门，保留）**：共享骨架齐全 + 每条结论可回查引文 + Receipt 存在。smoke 层，成本最低、自动化最彻底。
- **B 层（本次实验的 kill criterion，不可跳过，重定义为预声明判定）**：跑 6F 之前以确定性规则写下"非平凡判定"判据并 commit 入库（如：S2 命中真实 supersede 链异常 / ADR 状态与仓库文件现实不一致 / S1 定位收敛给出可核验推理链；S1/S2 至少一维命中）。**关键转译：未命中不是实验失败**——按 RAT/HDD 心智，未命中 = 产品前提（"报告能产出非平凡判定"）被证伪或判据需修正，这本身就是本实验要产出的第一份数据，写回决策账本。B 成本近零（确定性采集器不接 LLM，C9 论证 6F 大概率可命中），把"报告值得读"从口号变成可证伪命题。
- **C 层（最终闸门，保留但改造）**：① 裁定三档（信任并行动/不信任/需修订重判）+ 裁定依据必须在看报告前写死入库（防 HARKing，C2）；② **引入构建链路外读者或对抗性清单**（"哪些结论可能是先验套话？"逐条过），对抗确认偏差/专家盲点/bias blind spot（C8）；③ **C 的裁定必须显式以 B 的产物为锚点**——回答"非平凡判定是否可信、可行动"，C 依赖 B，不能只看结构；④ 裁定原文+时间戳回写决策账本（保留用户原设计）。

**为什么不采纳"A+C 跳过 B"**：A+C 恰好构成 C4/C5/C7 三条证据链共同指认的陷阱完美形态——A 保证"长得像合格报告"，C 提供"看似有人背书"，中间没有任何机制检验内容是否非平凡。行业类比：B 之于 A+C = smoke 之于 acceptance（C3）、golden set 之于 benchmark（C5）、findings 之于 report 骨架（C6）。C 的裁定者是产品所有者本人，是最典型的 dogfooding evaluative 误用场景；不经 B 的预声明判据锚定，C 只是"自我确认循环"的高级版本。成本不对称：B 几乎不增成本，跳过它丢掉的却是实验全部的可证伪性。

### 冲突点名（与已封口决策逐条核对）

1. **【显式点名 · 需强化非改向】封口决策 5（D-006 报告骨架引文校验）**：若"引文校验盖章"停在"存在/可回查"（A 层），恰落 C4 假信心陷阱——"引文齐全的先验套话"会通过盖章。必须升级为**引文→结论支持关系校验**（引文不支撑结论则标 unsupported），属 B 层确定性可检查项，是强化非改向。Receipt 存在≠裁定有实质，回执质量由 C 层锚定。
2. **【显式点名 · 需定义操作化】封口决策 1（D-001 verdict-gate）**：verdict-gate 是产品内自动裁决层，C 层是人类信任闸门——不把 C 定义为 verdict-gate 输出的外部校准锚，verdict-gate 会退化为"自动化的形式达标"（Goodhart，C7）。建议 C 的裁定对象 = verdict-gate 产出的裁决本身。
3. **【显式点名 · 视角错位】封口决策 8（D-011 默认模式=agent 用户）**：产品默认消费者是 agent，省级裁定者是"扮演外部技术决策者的人"——信任裁决的受体与验收者非同类实体。C 判据须显式覆盖"报告作为 agent 输入是否可行动"（机器可消费性：引文可解析、裁决可编程引用），否则"人信任"与"agent 消费"脱节。
4. 其余封口决策（2/3/4/6/7/9/10/11/12）与本推荐无冲突；B 落在 D-005 correlation key 与 D-004 S1/S2 起手范围，C 落在 D-006 回执链路，A 即 D-006 骨架。**无静默改向**。
5. **继承 R3-Q1 已核实状态**：ADR-0002 supersede 链（→0010→0011）下"先做 Macro-B 一条路径"不违规；且 6F 的 S2 判定可复用该 supersede 链一致性检查作为 B 判据第一候选命中锚点（C9）。

## 7) 一句话总结

A 证明管线通，C 提供人背书，B 是唯一能证明"这份报告不是先验套话"的客观锚——B 不可跳过，但 B 的失败应被定义为合法实验结果（kill criterion 预声明），这既是 RAT/HDD 的正统教义，也是把"第一份真报告"变成真正可证伪实验的唯一路径。

## 8) 运行侧记录

- Sufficiency Gate 自查：searches 9 次三引擎（Exa×5 / Tavily×3 / AnySearch×1 + Tavily extract 补读 1）；angles 全 5 类；full reads 8 条全文（6 web_fetch + 1 个 403→Tavily extract + 1 OWASP 跳转），7 独立域名。
- 任务日志：KB 召回（复用 R3-Q1）→ 阶段 1 广搜（3 引擎 × 8 主题）→ 阶段 2 定点核验 6 原文（含 nhimg 403 补读、OWASP 双源交叉）。
- 续问锚点：atomcode -p "…" --resume 4c4ba50a-a259-470d-8774-09d4877d9a23
- 处置：D-017 已账本落盘（current）；原子输出先入 ctx KB，本文件为重组稿（截断接缝以 ⟦…⟧ 标记）。
