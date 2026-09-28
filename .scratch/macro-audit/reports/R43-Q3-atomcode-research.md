# R43-Q3 atomcode 调研报告存档——预登记发布闸 vs 外部批评压力

> 题面=`reports/R43-Q3-research-prompt.md`；引擎=Exa+AnySearch 双引擎（Tavily 限流）＋6 次全文精读（sre.google/nasa.gov/fairinstitute/decryptiondigest×2/rampstackco）；angle=Official/Criticism/Comparative/Community/Currency 五类。
> 以下为 ctx_batch_execute 索引输出原文归档（节序按 BM25 命中序，内容未裁剪）。

---

Executed 1 commands (72 lines, 14.0KB). Indexed 8 sections. Searched 5 queries.

## Commands

- atomcode: `atomcode -p "软件产品的公开发布（GA/launch）门槛被外部批评压力拷问时的处置。场景：产品设了预登记四判据的发布闸（类比 KEP-5241 beta→GA 判据化、SRE launch checklist）；一条判据刚转绿，剩余：一条依赖外部方验证（宿主侧实证，我方不可自力）+一条因上游 readiness gate 不满足而合法不可开。外部锐评压『快发布给真实用户』。三候选：(i) 批评压力拉动越闸开工；(ii) 全守不动；(iii) 分层处置——不可开的如实报阻塞+外部依赖项起草 risk-acceptance 档案呈报裁。请调研：预登记发布判据在外部/市场/批评压力下的纪律先例（GA 判据被 pressure override 的失败案例、launch checklist 不可豁免性、design-partner/early-access 判据前置）；依赖外部方验证的 blocker 处置（等实证 vs risk acceptance 文书化——何时起草、谁来批、三要素惯例）；accepted-risk/risk-acceptance 档案的成熟形态与起草时机；…`

## Indexed Sections

- atomcode (2.2KB)
- 调研报告：发布判据在外部批评压力下的处置——推荐分层方案 (iii) (0.1KB)
- 调研报告：发布判据在外部批评压力下的处置——推荐分层方案 (iii) > 1) 执行摘要（Tl;dr） (0.8KB)
- 调研报告：发布判据在外部批评压力下的处置——推荐分层方案 (iii) > 2) 分点结论 (1) (3.9KB)
- 调研报告：发布判据在外部批评压力下的处置——推荐分层方案 (iii) > 2) 分点结论 (2) (1.7KB)
- 调研报告：发布判据在外部批评压力下的处置——推荐分层方案 (iii) > 3) 三候选对比矩阵 (1.0KB)
- 调研报告：发布判据在外部批评压力下的处置——推荐分层方案 (iii) > 4) 完整来源清单 (2.7KB)
- 调研报告：发布判据在外部批评压力下的处置——推荐分层方案 (iii) > 5) 信息缺口 (1.6KB)

## launch criteria

### 调研报告：发布判据在外部批评压力下的处置——推荐分层方案 (iii) > 2) 分点结论 (1)
## 2) 分点结论

**结论一：预登记判据的核心纪律是「判据驱动而非日历/压力驱动」，压力 override 是被点名的头号失败模式。**
- Rampstackco 的 beta→GA 毕业判据规范（239 行完整读）明确列出「The 'tired of the beta' anti-pattern」：判据部分未达标时因「总得发吧」而毕业，其失败机理是「unmet criteria mean the GA launches with known issues that are not yet addressed or acknowledged」→ 信任退化不可逆。解药原文：「**the graduation decision is criteria-driven, not calendar-driven. Calendar pressure can inform whether to ship a smaller scope, but it should not produce graduation despite unmet criteria.**」外部锐评的压力在结构上与日历压力同属「非判据压力」。（Official 角度，已全文读）
- 交叉源：NASA Rogers Commission 报告第五章（nasa.gov 原文）证实 Challenger 的 Flight Readiness Review 存在 launch constraint 被 SRB 项目经理连续六次 waiver、且 Level I/II 决策层完全不知情的情形——「neither the launch constraint, the reason for it, or the six consecutive waivers prior to 51-L were known to Moore or Aldrich」。这判定了 override 本身可以发生，但**静默 override（不留痕、不上报）才是致命缺陷**——这正是方案 (i) 的风险画像。（Official 一手史料，已全文读）

**结论二：SRE launch checklist 的不可豁免性体现在「外部依赖」是正式清单项，不是可协商项。**
- Google SRE Book Appendix E（sre.google 原文）的 Launch Coordination Checklist 中「External dependencies」是独立大类：第三方系统、监控、网络、launch spike、graceful degradation——即宿主侧实证这类外部依赖在业界最强 launch checklist 中本来就是**必须回答的清单行**，不存在「外部方没回复就算过」的默认。（Official，已全文读）
- 交叉源：Unifyca 的 launch 产品文档给出同构表述：「**A website is not Ready to Launch while blocking issues remain. Resolve them, or record an Accepted Risk with a reason, before publishing.**」且强调 accepted risk「does not hide a problem — it documents an informed choice, with a reason and a name attached」。（Community/产品实践角度）

**结论三：外部依赖 blocker 的成熟处置是 risk acceptance 文书化，而非原地等或硬闯；何时起草、谁来批、三要素均有惯例。**
- **何时起草**：当「判据无法在自力范围内转绿」（decryptiondigest 的有效 justification 例举原文包括「a technical constraint the team cannot resolve without a dependency outside their control (a third-party vendor…)」和「pending dependency resolution」）——你的宿主侧实证 blocker 正是教科书情形。「没来得及排优先级」「嫌等麻烦」不是有效理由。
- **谁来批**：两级审批制——有补偿控制、残余风险低的走安全/质量负责人；**无补偿控制、残余风险大的必须上业务负责人（VP/CTO 级）**，且审批人不得是提交人（segregation of duties）。关键引申：**批评者没有审批权**——「外部锐评压快发」在两级制里根本不构成一个审批层级，这直接否决方案 (i)。
- **三要素惯例**（多源收敛）：① 明确的 policy/判据 citation（引到具体判据编号，不可模糊）；② 业务 justification + 补偿控制（verifiable，不是「我们会小心」）；③ **具名 risk acceptor + 固定到期日**（decryptiondigest：五要件含 expiration date，初批最长 90 天；FAIR Institute 创始人 Jack Jones 的定义：「risk acceptance: a formal and documented decision by an appropriate stakeholder not to remediate risk exceeding appetite」——关键词 **formal、documented、appropriate stakeholder**）。到期复审是防「例外永久化」的机检钩子：40% 的组织被审计发现例外过期未复审仍在生效。

### atomcode
# atomcode

$ atomcode -p "软件产品的公开发布（GA/launch）门槛被外部批评压力拷问时的处置。场景：产品设了预登记四判据的发布闸（类比 KEP-5241 beta→GA 判据化、SRE launch checklist）；一条判据刚转绿，剩余：一条依赖外部方验证（宿主侧实证，我方不可自力）+一条因上游 readiness gate 不满足而合法不可开。外部锐评压『快发布给真实用户』。三候选：(i) 批评压力拉动越闸开工；(ii) 全守不动；(iii) 分层处置——不可开的如实报阻塞+外部依赖项起草 risk-acceptance 档案呈报裁。请调研：预登记发布判据在外部/市场/批评压力下的纪律先例（GA 判据被 pressure override 的失败案例、launch checklist 不可豁免性、design-partner/early-access 判据前置）；依赖外部方验证的 blocker 处置（等实证 vs risk acceptance 文书化——何时起草、谁来批、三要素惯例）；accepted-risk/risk-acceptance 档案的成熟形态与起草时机；…

先召回知识库，再开始多引擎检索。知识库已命中高价值前研（R40-Q6 的 KEP-5241/release≠launch 判据化调研、R80-Q2 的 risk-acceptance 五要件调研、R11-Q2 的 beta→GA graduation criteria）。现在按配额补外部先例：压力 override 失败案例、外部依赖 blocker 处置、对外沟通。继续第二阶段定点深挖：抓取 SRE launch checklist、risk-acceptance 流程、压力 override 失败案例（Knight Capital 等）原文。继续补第三个角度：压力 override 的经典失败先例与对外如实报阻塞的沟通先例。补足配额：再抓取 NASA Rogers 报告原文与 risk-acceptance 流程两篇原文。## Sufficiency Gate 自查

searches: 14+ 查询（Exa ×2、AnySearch batch ×2 共 10 条、Tavily ×1 被限流）| angles: Official / Criticism / Comparative / Community / Currency 五类 | full reads: 6（sre.google、nasa.gov、fairinstitute.org、decryptiondigest ×2、github.com/rampstackco）| gaps: Tavily 引擎被限流未能三引擎全覆盖（AnySearch+Exa 双引擎已达成交叉）；SRE 手册章节「Reliable Product Launches at Scale」未逐字读、只读了 Appendix E checklist。

### 调研报告：发布判据在外部批评压力下的处置——推荐分层方案 (iii) > 1) 执行摘要（Tl;dr）
## 1) 执行摘要（Tl;dr）

**推荐方案 (iii) 分层处置**，置信度**高**：预登记判据的全部先例价值就在于「criteria-driven, not calendar-driven」——批评压力与日历压力同构，都是试图用外部情绪替代预定义闸门；而 Challenger 事故的 Rogers Commission 调查结论明确指出，在压力下 override 判据的决策链之所以失败，正是因为决策者「unaware of the continuing opposition of the engineers」且 launch constraint 被连续六次 waiver 而高层不知情——制度化 waiver 文书（risk acceptance 档案）恰是防止这类静默 override 的标准解。不可开的判据如实报阻塞、外部依赖项起草 risk-acceptance 呈报有权限的裁者，是两条独立且都有成熟先例支撑的纪律路径。

## risk acceptance

### 调研报告：发布判据在外部批评压力下的处置——推荐分层方案 (iii) > 4) 完整来源清单
## 4) 完整来源清单

| # | 标题 | URL | 角度 | 日期 | 贡献 |
|---|---|---|---|---|---|
| 1 | Report of the Presidential Commission…Challenger, Ch. V（Rogers Commission） | nasa.gov/history/rogersrep/v1ch5.htm | Official 一手史料 | 1986 | 压力 override + 连续六次静默 waiver 不上报=决策链缺陷的因果认定 |
| 2 | Beta-to-GA graduation criteria（rampstackco） | github.com/rampstackco/claude-skills-pm/…/beta-to-ga-graduation-criteria.md | Official 规范 | 现行 | 判据驱动非日历驱动；tired-of-beta 反模式；honest graduation 三变体；hidden known issues 失败模式 |
| 3 | Google SRE Book, Appendix E: Launch Coordination Checklist | sre.google/sre-book/launch-checklist/ | Official | 2016（2005 原件） | 外部依赖是 launch checklist 正式清单行；外部依赖监控+graceful degradation 必答 |
| 4 | Security Policy Exception Process（decryptiondigest） | decryptiondigest.com/blog/security-policy-exception-process | Official/GRC 指南 | 2026-06-19 | 五要件（citation/justification/补偿控制/具名 acceptor/到期日）；90 天上限；两级审批；外部依赖=有效 justification；40% 过期未复审统计 |
| 5 | Security Risk Acceptance Process: The Template… | decryptiondigest.com/blog/security-risk-acceptance-process | Official/GRC 指南 | 2026-05/06 | 七字段模板；审批权矩阵按残余风险分级；审批人≠提交人；无文书=审计/保险/诉讼三重 liability |
| 6 | Security Exception vs. Risk Acceptance（FAIR Institute, Jack Jones） | fairinstitute.org/blog/security-exception-vs.-risk-acceptance-whats-the-difference | Official/术语权威 | 2019-02-06 | risk acceptance 正式定义：formal + documented + appropriate stakeholder |
| 7 | Website Launch Checklist（Unifyca） | unifyca.com/en/docs/projects/launch/ | Community/产品实践 | 现行 | 「blocking issues remain → resolve or record Accepted Risk with a reason」；accepted risk 带 reviewer+日期可追溯 |
| 8 | Challenger 案 secondary（Michigan STPP case study library） | stpp.fordschool.umich.edu/tap-case-study-library/space-shuttle-challenger-disaster | Criticism/学术教学 | 现行 | launch constraint 被 waiver 的制度化描述（摘要级，佐证 #1） |
| 9 | 知识库历史召回：R80-Q2 risk acceptance 调研（cybersecurity101 到期三型、grcopilot「open-ended = silent policy change」） | 本地 ctx 索引 | 前期调研 | 2026-09 | 到期三型（date/condition/event）与「开放式例外=静默改政策」先判 |
| 10 | 知识库历史召回：D-162 / KEP-5241 调研（本仓库） | 本地 ctx 索引 | 前期调研 | 2026-09-28 | 「唯一合法 GA 判据=beta 反馈全 resolved」判据化模板；risk-acceptance 三要素关闭 blocker 的既有裁先例 |

### atomcode
# atomcode

$ atomcode -p "软件产品的公开发布（GA/launch）门槛被外部批评压力拷问时的处置。场景：产品设了预登记四判据的发布闸（类比 KEP-5241 beta→GA 判据化、SRE launch checklist）；一条判据刚转绿，剩余：一条依赖外部方验证（宿主侧实证，我方不可自力）+一条因上游 readiness gate 不满足而合法不可开。外部锐评压『快发布给真实用户』。三候选：(i) 批评压力拉动越闸开工；(ii) 全守不动；(iii) 分层处置——不可开的如实报阻塞+外部依赖项起草 risk-acceptance 档案呈报裁。请调研：预登记发布判据在外部/市场/批评压力下的纪律先例（GA 判据被 pressure override 的失败案例、launch checklist 不可豁免性、design-partner/early-access 判据前置）；依赖外部方验证的 blocker 处置（等实证 vs risk acceptance 文书化——何时起草、谁来批、三要素惯例）；accepted-risk/risk-acceptance 档案的成熟形态与起草时机；…

先召回知识库，再开始多引擎检索。知识库已命中高价值前研（R40-Q6 的 KEP-5241/release≠launch 判据化调研、R80-Q2 的 risk-acceptance 五要件调研、R11-Q2 的 beta→GA graduation criteria）。现在按配额补外部先例：压力 override 失败案例、外部依赖 blocker 处置、对外沟通。继续第二阶段定点深挖：抓取 SRE launch checklist、risk-acceptance 流程、压力 override 失败案例（Knight Capital 等）原文。继续补第三个角度：压力 override 的经典失败先例与对外如实报阻塞的沟通先例。补足配额：再抓取 NASA Rogers 报告原文与 risk-acceptance 流程两篇原文。## Sufficiency Gate 自查

searches: 14+ 查询（Exa ×2、AnySearch batch ×2 共 10 条、Tavily ×1 被限流）| angles: Official / Criticism / Comparative / Community / Currency 五类 | full reads: 6（sre.google、nasa.gov、fairinstitute.org、decryptiondigest ×2、github.com/rampstackco）| gaps: Tavily 引擎被限流未能三引擎全覆盖（AnySearch+Exa 双引擎已达成交叉）；SRE 手册章节「Reliable Product Launches at Scale」未逐字读、只读了 Appendix E checklist。

### 调研报告：发布判据在外部批评压力下的处置——推荐分层方案 (iii) > 1) 执行摘要（Tl;dr）
## 1) 执行摘要（Tl;dr）

**推荐方案 (iii) 分层处置**，置信度**高**：预登记判据的全部先例价值就在于「criteria-driven, not calendar-driven」——批评压力与日历压力同构，都是试图用外部情绪替代预定义闸门；而 Challenger 事故的 Rogers Commission 调查结论明确指出，在压力下 override 判据的决策链之所以失败，正是因为决策者「unaware of the continuing opposition of the engineers」且 launch constraint 被连续六次 waiver 而高层不知情——制度化 waiver 文书（risk acceptance 档案）恰是防止这类静默 override 的标准解。不可开的判据如实报阻塞、外部依赖项起草 risk-acceptance 呈报有权限的裁者，是两条独立且都有成熟先例支撑的纪律路径。

## gate override

### atomcode
# atomcode

$ atomcode -p "软件产品的公开发布（GA/launch）门槛被外部批评压力拷问时的处置。场景：产品设了预登记四判据的发布闸（类比 KEP-5241 beta→GA 判据化、SRE launch checklist）；一条判据刚转绿，剩余：一条依赖外部方验证（宿主侧实证，我方不可自力）+一条因上游 readiness gate 不满足而合法不可开。外部锐评压『快发布给真实用户』。三候选：(i) 批评压力拉动越闸开工；(ii) 全守不动；(iii) 分层处置——不可开的如实报阻塞+外部依赖项起草 risk-acceptance 档案呈报裁。请调研：预登记发布判据在外部/市场/批评压力下的纪律先例（GA 判据被 pressure override 的失败案例、launch checklist 不可豁免性、design-partner/early-access 判据前置）；依赖外部方验证的 blocker 处置（等实证 vs risk acceptance 文书化——何时起草、谁来批、三要素惯例）；accepted-risk/risk-acceptance 档案的成熟形态与起草时机；…

先召回知识库，再开始多引擎检索。知识库已命中高价值前研（R40-Q6 的 KEP-5241/release≠launch 判据化调研、R80-Q2 的 risk-acceptance 五要件调研、R11-Q2 的 beta→GA graduation criteria）。现在按配额补外部先例：压力 override 失败案例、外部依赖 blocker 处置、对外沟通。继续第二阶段定点深挖：抓取 SRE launch checklist、risk-acceptance 流程、压力 override 失败案例（Knight Capital 等）原文。继续补第三个角度：压力 override 的经典失败先例与对外如实报阻塞的沟通先例。补足配额：再抓取 NASA Rogers 报告原文与 risk-acceptance 流程两篇原文。## Sufficiency Gate 自查

searches: 14+ 查询（Exa ×2、AnySearch batch ×2 共 10 条、Tavily ×1 被限流）| angles: Official / Criticism / Comparative / Community / Currency 五类 | full reads: 6（sre.google、nasa.gov、fairinstitute.org、decryptiondigest ×2、github.com/rampstackco）| gaps: Tavily 引擎被限流未能三引擎全覆盖（AnySearch+Exa 双引擎已达成交叉）；SRE 手册章节「Reliable Product Launches at Scale」未逐字读、只读了 Appendix E checklist。

### 调研报告：发布判据在外部批评压力下的处置——推荐分层方案 (iii) > 5) 信息缺口
## 5) 信息缺口

1. **Tavily 引擎全程限流**，三引擎交叉降级为双引擎 + 一手史料；关键结论均有 ≥2 独立信源，但缺 Tavily 侧独立印证。
2. **软件行业（非航天）的具名「压力 override GA 判据 → 事故」公开 postmortem** 未找到一一对应案例——这类事件极少被写成公开复盘（组织自利），Rampstackco 的反模式分类是替代性证据；Knight Capital 类案例属部署流程失效而非判据 override，不宜硬引。
3. 「如实报阻塞」作为**对外沟通**（对批评者/市场，非对内部 stakeholder）的专门先例，只收敛到 honest graduation patterns 与 status-page/known-issues 实践（Cisco/Microsoft/Broadcom release notes 的 known-issue 惯例为摘要级），缺一篇专门论述对外承认阻塞的权威文——如需可后续定向补搜。

**推荐落地要点**（对应你的三候选）：执行 (iii)；对判据 Y（上游 readiness gate 不满足）如实报阻塞并给出转绿条件与时间线；对判据 X（宿主侧实证）起草 risk-acceptance 档案，五要件齐备（判据引用、justification 注明「我方不可自力的外部依赖」、补偿控制如 shadow 实证/缩小暴露面、具名 acceptor 上裁级、到期日 ≤90 天），呈报给有权限的裁者而非回应批评压力；对外沟通采用 honest-known-limitation 形态：「三绿 + 两项显式阻塞 + RA 呈报中」。
[warning] 正在以管理员权限运行 — 模型可能可以访问系统文件。

继续此会话，运行：atomcode -p "…" --resume f70fbca4-3c35-450f-902a-e057177769b9

### 调研报告：发布判据在外部批评压力下的处置——推荐分层方案 (iii) > 1) 执行摘要（Tl;dr）
## 1) 执行摘要（Tl;dr）

**推荐方案 (iii) 分层处置**，置信度**高**：预登记判据的全部先例价值就在于「criteria-driven, not calendar-driven」——批评压力与日历压力同构，都是试图用外部情绪替代预定义闸门；而 Challenger 事故的 Rogers Commission 调查结论明确指出，在压力下 override 判据的决策链之所以失败，正是因为决策者「unaware of the continuing opposition of the engineers」且 launch constraint 被连续六次 waiver 而高层不知情——制度化 waiver 文书（risk acceptance 档案）恰是防止这类静默 override 的标准解。不可开的判据如实报阻塞、外部依赖项起草 risk-acceptance 呈报有权限的裁者，是两条独立且都有成熟先例支撑的纪律路径。

## 外部依赖

### 调研报告：发布判据在外部批评压力下的处置——推荐分层方案 (iii) > 3) 三候选对比矩阵
## 3) 三候选对比矩阵

| 候选 | 先例支持 | 主要风险 | 防御机制覆盖 |
|---|---|---|---|
| (i) 批评压力拉动越闸 | ❌ 无正面先例；Rogers 报告=压力下 override + 静默 waiver 的反面教材 | hidden known issues→信任不可逆损（rampstackco）；override 留痕缺失 | 无任何机制覆盖，纯赌运气 |
| (ii) 全守不动 | ⚠️ 部分支持（判据纪律成立），但缺时限承诺 = perpetual beta 反模式 | stakeholder 信任退化「the team is not shipping」；批评者叙事反而获得「判据是拖延借口」的口实 | 只覆盖闸门纪律，不覆盖沟通与升级 |
| (iii) 分层处置 | ✅ 双先例收敛：SRE checklist（外部依赖=正式清单行）+ risk acceptance 两级审批五要件 + honest graduation patterns（如实承认未达标） | 需防 RA 档案 rubber-stamp（40% 过期未复审统计）与永久化续期 | 判据纪律 ✅ + waiver 文书化具名 ✅ + 到期复审 ✅ + 如实对外沟通 ✅ |

### atomcode
# atomcode

$ atomcode -p "软件产品的公开发布（GA/launch）门槛被外部批评压力拷问时的处置。场景：产品设了预登记四判据的发布闸（类比 KEP-5241 beta→GA 判据化、SRE launch checklist）；一条判据刚转绿，剩余：一条依赖外部方验证（宿主侧实证，我方不可自力）+一条因上游 readiness gate 不满足而合法不可开。外部锐评压『快发布给真实用户』。三候选：(i) 批评压力拉动越闸开工；(ii) 全守不动；(iii) 分层处置——不可开的如实报阻塞+外部依赖项起草 risk-acceptance 档案呈报裁。请调研：预登记发布判据在外部/市场/批评压力下的纪律先例（GA 判据被 pressure override 的失败案例、launch checklist 不可豁免性、design-partner/early-access 判据前置）；依赖外部方验证的 blocker 处置（等实证 vs risk acceptance 文书化——何时起草、谁来批、三要素惯例）；accepted-risk/risk-acceptance 档案的成熟形态与起草时机；…

先召回知识库，再开始多引擎检索。知识库已命中高价值前研（R40-Q6 的 KEP-5241/release≠launch 判据化调研、R80-Q2 的 risk-acceptance 五要件调研、R11-Q2 的 beta→GA graduation criteria）。现在按配额补外部先例：压力 override 失败案例、外部依赖 blocker 处置、对外沟通。继续第二阶段定点深挖：抓取 SRE launch checklist、risk-acceptance 流程、压力 override 失败案例（Knight Capital 等）原文。继续补第三个角度：压力 override 的经典失败先例与对外如实报阻塞的沟通先例。补足配额：再抓取 NASA Rogers 报告原文与 risk-acceptance 流程两篇原文。## Sufficiency Gate 自查

searches: 14+ 查询（Exa ×2、AnySearch batch ×2 共 10 条、Tavily ×1 被限流）| angles: Official / Criticism / Comparative / Community / Currency 五类 | full reads: 6（sre.google、nasa.gov、fairinstitute.org、decryptiondigest ×2、github.com/rampstackco）| gaps: Tavily 引擎被限流未能三引擎全覆盖（AnySearch+Exa 双引擎已达成交叉）；SRE 手册章节「Reliable Product Launches at Scale」未逐字读、只读了 Appendix E checklist。

### 调研报告：发布判据在外部批评压力下的处置——推荐分层方案 (iii) > 2) 分点结论 (1)
## 2) 分点结论

**结论一：预登记判据的核心纪律是「判据驱动而非日历/压力驱动」，压力 override 是被点名的头号失败模式。**
- Rampstackco 的 beta→GA 毕业判据规范（239 行完整读）明确列出「The 'tired of the beta' anti-pattern」：判据部分未达标时因「总得发吧」而毕业，其失败机理是「unmet criteria mean the GA launches with known issues that are not yet addressed or acknowledged」→ 信任退化不可逆。解药原文：「**the graduation decision is criteria-driven, not calendar-driven. Calendar pressure can inform whether to ship a smaller scope, but it should not produce graduation despite unmet criteria.**」外部锐评的压力在结构上与日历压力同属「非判据压力」。（Official 角度，已全文读）
- 交叉源：NASA Rogers Commission 报告第五章（nasa.gov 原文）证实 Challenger 的 Flight Readiness Review 存在 launch constraint 被 SRB 项目经理连续六次 waiver、且 Level I/II 决策层完全不知情的情形——「neither the launch constraint, the reason for it, or the six consecutive waivers prior to 51-L were known to Moore or Aldrich」。这判定了 override 本身可以发生，但**静默 override（不留痕、不上报）才是致命缺陷**——这正是方案 (i) 的风险画像。（Official 一手史料，已全文读）

**结论二：SRE launch checklist 的不可豁免性体现在「外部依赖」是正式清单项，不是可协商项。**
- Google SRE Book Appendix E（sre.google 原文）的 Launch Coordination Checklist 中「External dependencies」是独立大类：第三方系统、监控、网络、launch spike、graceful degradation——即宿主侧实证这类外部依赖在业界最强 launch checklist 中本来就是**必须回答的清单行**，不存在「外部方没回复就算过」的默认。（Official，已全文读）
- 交叉源：Unifyca 的 launch 产品文档给出同构表述：「**A website is not Ready to Launch while blocking issues remain. Resolve them, or record an Accepted Risk with a reason, before publishing.**」且强调 accepted risk「does not hide a problem — it documents an informed choice, with a reason and a name attached」。（Community/产品实践角度）

**结论三：外部依赖 blocker 的成熟处置是 risk acceptance 文书化，而非原地等或硬闯；何时起草、谁来批、三要素均有惯例。**
- **何时起草**：当「判据无法在自力范围内转绿」（decryptiondigest 的有效 justification 例举原文包括「a technical constraint the team cannot resolve without a dependency outside their control (a third-party vendor…)」和「pending dependency resolution」）——你的宿主侧实证 blocker 正是教科书情形。「没来得及排优先级」「嫌等麻烦」不是有效理由。
- **谁来批**：两级审批制——有补偿控制、残余风险低的走安全/质量负责人；**无补偿控制、残余风险大的必须上业务负责人（VP/CTO 级）**，且审批人不得是提交人（segregation of duties）。关键引申：**批评者没有审批权**——「外部锐评压快发」在两级制里根本不构成一个审批层级，这直接否决方案 (i)。
- **三要素惯例**（多源收敛）：① 明确的 policy/判据 citation（引到具体判据编号，不可模糊）；② 业务 justification + 补偿控制（verifiable，不是「我们会小心」）；③ **具名 risk acceptor + 固定到期日**（decryptiondigest：五要件含 expiration date，初批最长 90 天；FAIR Institute 创始人 Jack Jones 的定义：「risk acceptance: a formal and documented decision by an appropriate stakeholder not to remediate risk exceeding appetite」——关键词 **formal、documented、appropriate stakeholder**）。到期复审是防「例外永久化」的机检钩子：40% 的组织被审计发现例外过期未复审仍在生效。

## readiness

### 调研报告：发布判据在外部批评压力下的处置——推荐分层方案 (iii) > 2) 分点结论 (2)
**结论四：「门不绿但如实报阻塞」有正面先例，且其公信力来自「显式承认未达标」而非「达标」。**
- Rampstackco 规范的「honest graduation patterns」一节给出三种合法变体：graduation with known issues（「We are shipping with X known limitation; documented; will address in [timeline]」）、graduation with extended monitoring、graduation with phased rollout——共性是**显式承认 + 有时限 + 通知支持方**。与之相对的失败模式是「hidden known issues」（客户和支持团队事后才发现，信任不可逆受损）。对你场景：对外沟通的正确形态是「四判据中三绿，判据 X 阻塞于宿主侧实证（我方不可自力），判据 Y 因上游 readiness gate 合法不可开；相应 risk-acceptance 已呈报〔具名裁者〕裁」，这与先例完全同构。
- 「perpetual beta」反面警示：全守不动 (ii) 若无时限承诺，会滑入「永远不毕业」的对偶失败—— stakeholder 信任同样退化（「the team is not shipping」）。所以 (ii) 不完整：**如实报阻塞必须捆绑「什么条件转绿 + 新时间线」的诚实延期承诺**，这才是先例中的完整形态。

**结论五：两源冲突处如实记录**——Rogers Commission 明确认定 Challenger 无人受「外部干预」（总统国情演说传闻被逐条证伪），压力来自内部进度体系而非外部批评者；Rampstackco 的反模式描述的则是团队自生的「tired of beta」压力。两者合起来的启示：**无论压力源是外部批评还是内部节奏，判据闸的防御机制相同——判据预登记 + waiver 文书化具名 + 到期复审**，不依赖「这次压力是假的」这种运气。

### 调研报告：发布判据在外部批评压力下的处置——推荐分层方案 (iii) > 5) 信息缺口
## 5) 信息缺口

1. **Tavily 引擎全程限流**，三引擎交叉降级为双引擎 + 一手史料；关键结论均有 ≥2 独立信源，但缺 Tavily 侧独立印证。
2. **软件行业（非航天）的具名「压力 override GA 判据 → 事故」公开 postmortem** 未找到一一对应案例——这类事件极少被写成公开复盘（组织自利），Rampstackco 的反模式分类是替代性证据；Knight Capital 类案例属部署流程失效而非判据 override，不宜硬引。
3. 「如实报阻塞」作为**对外沟通**（对批评者/市场，非对内部 stakeholder）的专门先例，只收敛到 honest graduation patterns 与 status-page/known-issues 实践（Cisco/Microsoft/Broadcom release notes 的 known-issue 惯例为摘要级），缺一篇专门论述对外承认阻塞的权威文——如需可后续定向补搜。

**推荐落地要点**（对应你的三候选）：执行 (iii)；对判据 Y（上游 readiness gate 不满足）如实报阻塞并给出转绿条件与时间线；对判据 X（宿主侧实证）起草 risk-acceptance 档案，五要件齐备（判据引用、justification 注明「我方不可自力的外部依赖」、补偿控制如 shadow 实证/缩小暴露面、具名 acceptor 上裁级、到期日 ≤90 天），呈报给有权限的裁者而非回应批评压力；对外沟通采用 honest-known-limitation 形态：「三绿 + 两项显式阻塞 + RA 呈报中」。
[warning] 正在以管理员权限运行 — 模型可能可以访问系统文件。

继续此会话，运行：atomcode -p "…" --resume f70fbca4-3c35-450f-902a-e057177769b9

### 调研报告：发布判据在外部批评压力下的处置——推荐分层方案 (iii) > 2) 分点结论 (1)
## 2) 分点结论

**结论一：预登记判据的核心纪律是「判据驱动而非日历/压力驱动」，压力 override 是被点名的头号失败模式。**
- Rampstackco 的 beta→GA 毕业判据规范（239 行完整读）明确列出「The 'tired of the beta' anti-pattern」：判据部分未达标时因「总得发吧」而毕业，其失败机理是「unmet criteria mean the GA launches with known issues that are not yet addressed or acknowledged」→ 信任退化不可逆。解药原文：「**the graduation decision is criteria-driven, not calendar-driven. Calendar pressure can inform whether to ship a smaller scope, but it should not produce graduation despite unmet criteria.**」外部锐评的压力在结构上与日历压力同属「非判据压力」。（Official 角度，已全文读）
- 交叉源：NASA Rogers Commission 报告第五章（nasa.gov 原文）证实 Challenger 的 Flight Readiness Review 存在 launch constraint 被 SRB 项目经理连续六次 waiver、且 Level I/II 决策层完全不知情的情形——「neither the launch constraint, the reason for it, or the six consecutive waivers prior to 51-L were known to Moore or Aldrich」。这判定了 override 本身可以发生，但**静默 override（不留痕、不上报）才是致命缺陷**——这正是方案 (i) 的风险画像。（Official 一手史料，已全文读）

**结论二：SRE launch checklist 的不可豁免性体现在「外部依赖」是正式清单项，不是可协商项。**
- Google SRE Book Appendix E（sre.google 原文）的 Launch Coordination Checklist 中「External dependencies」是独立大类：第三方系统、监控、网络、launch spike、graceful degradation——即宿主侧实证这类外部依赖在业界最强 launch checklist 中本来就是**必须回答的清单行**，不存在「外部方没回复就算过」的默认。（Official，已全文读）
- 交叉源：Unifyca 的 launch 产品文档给出同构表述：「**A website is not Ready to Launch while blocking issues remain. Resolve them, or record an Accepted Risk with a reason, before publishing.**」且强调 accepted risk「does not hide a problem — it documents an informed choice, with a reason and a name attached」。（Community/产品实践角度）

**结论三：外部依赖 blocker 的成熟处置是 risk acceptance 文书化，而非原地等或硬闯；何时起草、谁来批、三要素均有惯例。**
- **何时起草**：当「判据无法在自力范围内转绿」（decryptiondigest 的有效 justification 例举原文包括「a technical constraint the team cannot resolve without a dependency outside their control (a third-party vendor…)」和「pending dependency resolution」）——你的宿主侧实证 blocker 正是教科书情形。「没来得及排优先级」「嫌等麻烦」不是有效理由。
- **谁来批**：两级审批制——有补偿控制、残余风险低的走安全/质量负责人；**无补偿控制、残余风险大的必须上业务负责人（VP/CTO 级）**，且审批人不得是提交人（segregation of duties）。关键引申：**批评者没有审批权**——「外部锐评压快发」在两级制里根本不构成一个审批层级，这直接否决方案 (i)。
- **三要素惯例**（多源收敛）：① 明确的 policy/判据 citation（引到具体判据编号，不可模糊）；② 业务 justification + 补偿控制（verifiable，不是「我们会小心」）；③ **具名 risk acceptor + 固定到期日**（decryptiondigest：五要件含 expiration date，初批最长 90 天；FAIR Institute 创始人 Jack Jones 的定义：「risk acceptance: a formal and documented decision by an appropriate stakeholder not to remediate risk exceeding appetite」——关键词 **formal、documented、appropriate stakeholder**）。到期复审是防「例外永久化」的机检钩子：40% 的组织被审计发现例外过期未复审仍在生效。


> **Tip:** Results are scoped to this batch only. To search across all indexed sources, use `ctx_search(queries: [...])` or call ctx_batch_execute with `query_scope: "global"`.

Searchable terms for follow-up: fairinstitute, criteria-driven, calendar-driven, coordination, decryptiondigest, justification, degradation, appropriate, criticism, institute, perpetual, atomcode, kep-5241, pressure, launches, graceful, blocking, accepted, citation, shipping, 外部依赖项起草, release, capital, unifyca, website, resolve, 过期未复审统计, 我方不可自力, r80-q2, knight, tavily, github, reason, remain, record, policy, formal, 宿主侧实证, 三要素惯例, tired
