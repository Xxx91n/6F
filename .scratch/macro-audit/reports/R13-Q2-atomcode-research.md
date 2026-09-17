# R13-Q2 atomcode 深度调研报告 — 三象限补齐的拉动判据与时点

> 调研题面：D:\Aworker\6F\.scratch\macro-audit\reports\R13-Q2-research-prompt.md
> 时点 2026-09-16；通道 ctx_batch_execute（label=atomcode-r13q2，FTS 已索引）；atomcode 会话锚 dd914190-2b6e-4b0c-ad15-e728a2edb3d9。
> 冲突协议结果：**无实质冲突（(d) 属 D-035④ 登记框架内的预期激活动作）＋1 处强制勘误注记（D-035 消费侧扩展）＋多点边界确认**。

## §1 执行摘要

**推荐 (d) 折中：立票只接 behavior 象限（churn/hotspot/change-coupling——codelore 纯 git 零外部输入最强面），structure/supply-chain 续排队，SKILL.md 宣称面同步收窄措辞。** Confidence 高——hotspot=churn×complexity 被三独立信源交叉验证为「技术债优先级业界标准第一入口」，且数据源（git 历史）我方 100% 已具备。(a) 全补稀释 GA 判据焦点并提前付 structure 面 golden 契约成本；(c) 不消除 SKILL.md 名实落差这一诚实性债（D-031 决策本体）；(b) 违 2b 薄切片纪律且 supply-chain 部分与 D-034③ 正面冲突。

## §2 分点结论

**结论 1（高置信，≥4 源）**：hotspot=churn×complexity 是行为象限成熟心智模型，CodeScene 系定位为「优先级入口」非「又一指标」——「Low code health in a development hotspot is expensive. Prioritize improvements here」；Tornhill（SE Radio 554）：静态分析「can identify bad code, but can never tell you the impact……you end up with a long list of 5,000 critical issues」；churn×complexity 四象限矩阵已是独立通用方法（understandlegacycode）。对本案含义：behavior 接入=报告从「strategy 单腿」升「strategy×behavior 双腿」=research.md §1.3「结构×行为融合」最小可辩护形态；churn/hotspot/coupling 全只依赖 git，与已契约化演化主干 12 面同族，边际成本全案最低。

**结论 2（高置信）**：「quadrant covered」工业判据=「有可核验证据域」非「宣称覆盖」；披露惯例有成熟模板可抄——Atlan Feature Maturity Matrix（GA/Public preview/Private preview/Roadmap/Deprecated 五态＋scope notes＋as-of 日期＋「Never treat a preview or roadmap row as shipped」）；Intended 三态（Implemented/Partial/Roadmap＋Promise boundary 红线）；MS Foundry GA/Preview 逐能力标注。

**结论 3（中高置信）**：「先战略后结构」本仓非孤例——与业界「先行为后结构」共识可调和，真正该先动的是行为面。静态结构面不能独立驱动优先级；「先接结构」会把报告推向 CodeScene 明示要避免的「noise without priority」。本仓先战略有独立理由（rubric=唯一真护城河，S1/S2 已实跑）；调研发现的失败模式=**战略叙事缺行为证据支撑时退化成纸面推断**（hotspot 的说服力=把「复杂」锚在「常改」上）。structure 续排队是对的：与 S3 门面预算维（codelore S3 族 6 面已契约）部分重叠，重复接会出现两套复杂度口径=(a) 的隐藏失败模式。供应链面任何候选都不应动（D-034③ 立法＋#42 已裁定）。

## §3 候选对比矩阵（节选）

| 项 | 名实落差消解 | 与本仓纪律兼容 | 成本 | 判定 |
|---|---|---|---|---|
| (a) 全补 | 快但引入双口径风险 | structure 与 S3 重叠；supply 违 D-034③ | 高（双 golden 批次） | ✗ |
| (b) 并入 #50 | — | 违 D-033 薄切片＋D-053 票面已封口 | 高（大票） | ✗ |
| (c) 维持 stage1 | 不消解（宣称债存续） | 违 D-031 精神 | 0 但积压 | ✗ |
| (d) 折中 behavior | 消解宣称落差＋实质补面 | 全兼容＋D-035④ 预期激活 | 低（git-only 面同族） | **✓** |

## §4 各候选已知失败模式

- **(a)**：①structure 与 S3 族双复杂度口径并存→报告内部自相矛盾（「5000 items」清单形态在我方以「结构象限清单 vs 战略 S3 叙事」复现）；②golden 契约成本提前支付但 GA 判据不要求——D-040 已矫正过的「波次当开工闸门」镜像反模式；③违 #42 刚闭合的「不插队」裁定。
- **(b)**：①D-053 票面已捆 5 项欠账，再塞采集面=大票（D-033 拆票纪律反例）；②叙事主路未通前采集面扩容无法被叙事消费→产出积压；③rubric 文书化与采集面接线是两类验收（文书评审 vs golden 契约），混票必致验收序列含糊。
- **(c)**：①上架后外部用户按 Atlan「Never treat roadmap as shipped」判 overclaim——自家 description 违反自家 D-031 披露纪律；②「四象限齐写进 GA 判据」只答「何时算齐」不答「宣称何时诚实」；③行为面悬置期间 codelore 最强面在 Macro-B 持续缺席，而竞争面（CodeScene MCP Server 2026 已上线）向 agent 编排层渗透。
- **(d)**：①behavior 面接入后若 hotspots/coupling 与 Macro-C 演化主干（S3/S5 消费侧）重复消费→须防「同一 fact 两个 quadrant 归属」语义漂移——票面写死 quadrant 字段归位规则（facts 共享、quadrant 归属=切片决策）；②churn/hotspot 在小仓（jiahao 型低 commit）信度不足→须带最小样本量披露（对齐 TC1_MIN_N=5 预声明阈值惯例）；③SKILL.md 收窄若只做一半（宣称收窄但票不立）重演「声明↔实物不一致」——收窄与立票必须同票绑定。

## §5 与本仓 current 决策冲突点排查（点名制）

- **D-034③**：supply 不插队——(a)(b) 冲突，(d) 维持，无冲突。
- **D-035④**：暂缓面集登记「满足判据+复审时点」——**本问题正是该登记的复审时点触发**：(d)=behavior 族暂缓面激活裁决，属登记框架内预期动作非改向；**但 (d) 将 behavior 面消费侧指向 Macro-B 象限，而 D-035① 把首批 30 面用途锚在「Macro-C preview＋S3/S5」——立票时须对 D-035 做一行勘误注记（faces 消费侧扩展，契约本体不变），不许静默改向**。
- **D-034①**：层序「扩面→Macro-C→Micro-A→…」——(d) 的 behavior 接线属「扩面」范畴延续非层序重排；需注明它是 Macro-B 象限消费（D-034 未预判，属增量非冲突）。
- **D-053（拟 #50）**：票面五件套已封口——(b) 改票面即冲突；(d) 不动 #50。
- **D-031**：宣称 4 实收 1 的现状与其精神冲突——(d) 的 SKILL.md 收窄是直接落实，补强非冲突。
- **ADR-0017／D-037②**：报告头 capabilities:["macro-b"]＋stability preview 机制现成，behavior 接入后同步升级措辞即可。
- **ADR-0014**：behavior 接线走 codelore 适配器逐面 golden（#35 同款），raw 语义不出适配层。
- **ADR-0015**：churn/hotspot 低 commit 仓效度边界须预声明（D-045 SZZ 噪声披露同款），票面写最小样本量判据。
- **ADR-0004／ADR-0006**：不动战略五维语义，仅新增 quadrant=behavior 切片，骨架交集按 D-049⑤ 机械导出。

## §6 完整来源清单

| # | 标题 | URL | 角度 | 贡献 |
|---|---|---|---|---|
| 1 | CodeScene Hotspots 官方文档 | codescene.io/docs/guides/technical/hotspots.html | Official | hotspot×code health 优先级模型；change coupling 双向解释 |
| 2 | CodeScene Architectural Analyses | codescene.dfds.cloud/docs/guides/architectural/architectural-analyses.html | Official | 架构级 hotspot/coupling/knowledge distribution 上卷惯例 |
| 3 | SE Radio 554: Tornhill on Behavioral Code Analysis | se-radio.net/2023/03/episode-554-… | Official/Community | 「静态分析给不出 impact」权威论证；行为先于结构方法论根基 |
| 4 | Focus refactoring with Hotspots | understandlegacycode.com/blog/focus-refactoring-with-hotspots-analysis | Community | churn×complexity 四象限矩阵独立普及实现 |
| 5 | Atlan Feature Maturity Matrix | docs.atlan.com/get-started/references/feature-maturity-matrix | Official | 五态能力矩阵＋「never treat roadmap as shipped」 |
| 6 | Intended Capability Truth Matrix | intended.so/developers/docs/reference/post-120day-programs | Official | Implemented/Partial/Roadmap＋Promise boundary 红线 |
| 7 | Tech Debt Tools Comparison | technicaldebtcost.com/technical-debt-tools-comparison | Comparative | layer-versus-layer；CodeScene=优先级层 |
| 8 | CodeScene vs SonarQube 对比组 | g2.com/compare/codescene-vs-sonarqube 等 | Comparative | 「6x more accurate」系厂商自报 directional |
| 9 | Technical Debt as Crime Scene | refactoring.fm/p/technical-debt-as-crime-scene-with | Community | 行为考古主流化时效信号（搜索级） |
| 10 | MS Foundry feature readiness | Microsoft Learn | Official | GA/Preview 逐能力标注惯例 |
| 11 | 本地：research.md／decision-ledger／demo.ts／CONTEXT.md | D:/Aworker/6F | 本仓 | 预设定义、current 底座、实收面实证 |

## §7 信息缺口

1. codelore 0.28.0 hotspots/coupling 面实际输出 schema 未实物跑核验（只读不执行二进制）——立票前先跑一次 `codelore analyze` 实物确认面输出形态再写 golden；
2. Agent Plugins 生态内无四象限审计同型插件可对标「quadrant covered」判据——结论由 SaaS 能力矩阵惯例外推，置信中；
3. behavior 面在共享事实库中与 Macro-C 演化主干的 quadrant 归位规则需票内定夺，本调研未给终案。

**一句话裁定**：立票 (d)——behavior 象限（churn/hotspot/coupling，#35 逐面 golden 模式）＋SKILL.md 宣称面同步收窄（strategy: active · behavior: preview · structure/supply-chain: queued）；supply-chain 维持 D-034③ 不动；structure 续排队并显式登记「与 S3 族双口径风险」为暂缓理由；立票时对 D-035 做消费侧扩展勘误注记。
