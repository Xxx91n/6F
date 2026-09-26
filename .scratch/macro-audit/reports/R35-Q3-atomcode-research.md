# R35-Q3 atomcode 调研报告存档

> 调研执行：atomcode -p（题面=R35-Q3-research-prompt.md）｜searches 5（web_search×1+tavily×2+anysearch×2）｜angles Official+Comparative+Criticism+Community｜full reads 6（rfc-editor.org/firefox-source-docs/learn.microsoft.com/lists.bugzilla.org/2026.ijcai.org/oss-vulnerability-guide）＋知识库召回 2 批（R22-Q1/R6-28）＋本地实况核验｜置信高。resume handle: 5760ebd2-43d1-4332-9911-42fa5bb59708

## 1) 执行摘要（TL;DR）

推荐 (a)：勘误登记＋D-142 补第四档「快照不属实（可核实且证伪）→显式驳回不进裁定链（去向表照登）」。Confidence：高——工业界五独立领域收敛同一模式：「查清了且指控不成立」是有名分、显式驳回、但必须留痕可回溯的封闭处置态，与「无法核实」（悬置态）严格分档。D-142 三档恰好缺这一档，本案不是个案而是分类学缺口；(b) 依赖自觉与 D-142 立法动机矛盾；(c) 机制面无翻案空间但与摄入规程补档正交。

## 2) 分点结论

**① 本案实况核验**：stale-assertions.json entries=[]（0/10），meta 节完整记叙 2026-09-18 饱和→D-073 三向分拣→2026-09-22 六条批摘＋两条单摘清零全程。锐评「cap 已填满 10 条」描述已终结的 9-18 时点——读 meta 历史叙述未核 entries 实况，快照时点即失实，可核实且证伪。压力阀全链路按 D-071④ 设计工作无失效。

**② 工业 triage 分类学中证伪态=有名封闭态且与无法核实严格分档**：Bugzilla INVALID=「指控本身不成立」与 WORKSFORME（无法复现）、WONTFIX（属实不修）三态正交；Firefox GitHub labels、Eclipse Bugzilla HOWTO、Azure Boards（Cannot Reproduce/As Designed 分列）交叉一致。本案对应 INVALID 核心语义。关键反例警示（Sivonen Bugzilla dev list 2010）：INVALID 语义常被误用——「指控属实但按 spec 是预期行为」该 WONTFIX 而非 INVALID，导致报告方把 INVALID 误读为人身定性——第四档必须带明文判词附核实依据（entries=0/10 实况）防混用病。

**③ 标准勘误世界：Rejected 是显式状态但记录不删**：RFC Editor errata 状态机 Reported→Verified/Rejected/HFDU，Rejected＝「erratum 本身错误或冗余」本命语义；官方指引要求「check rejected errata——被驳回仍可检索」；W3C 惯例（R6-28 已核）「不删条目，证伪时追加新条交叉引用」。证伪驳回＋留痕可回溯解法=独立状态＋append-only 记录，对应「不进裁定链≠不登记」（D-076④ 去向表照登）同构无需发明。

**④ CVD 世界：善意误报显式驳回＋解释义务**：OpenSSF 维护者指南「Not everything reported as a vulnerability is a vulnerability」——working as intended 裁定=关闭＋向报告方解释裁定理由。证伪驳回含对报告方回溯说明义务。Raymond Chen 案例（2019）反面补证：驳回也须留痕，「reject 静默不留痕」制造信任事故。

**⑤ 审计与同行评审：事实性错误以书面文书形态回应不进实质裁定**：ISA 450 区分事实性错报（factual misstatement——little room for negotiation 直接记录）与判断性错报（需讨论）；EAC 管理信函先例=异议逐条书面 reply 载入同一文书留档；PCAOB AS 2805 未更正错报随函附清单。IJCAI 2026 rebuttal FAQ：author response 合法用途=「point out factual errors in the reviews」——事实错误回应是独立文书类型（更正非辩驳）=逐条指出错误＋核实依据。本案收口节勘误行正对应。

**⑥ 三候选裁断**：(a) 推荐——D-142 三档在四格矩阵（事实性×现行性）中确实留空（查清+证伪），工业五域均设名分，补档成本低；(b) 否决——「按常识办」=依赖自觉，且 D-142②「pending 不升格第四守态」禁令针对 Watch Tri-state 封闭性，「快照不属实」是摄入分诊态非 registry 守护态，加档不破封闭——(b) 隐含顾虑可精确排除；(c) 机制实史证压力阀按设计工作，无翻案面，登记即可。

## 3) 对比矩阵：工业「指控不成立」处置态与本仓候选档位

| 体系 | 证伪态名分 | 与「无法核实」分档 | 留痕义务 | 对应本仓落点 |
|---|---|---|---|---|
| Bugzilla/Firefox | INVALID | 与 WORKSFORME 分列 | RESOLVED 记录永久可查 | 第四档「快照不属实」 |
| IETF errata | Rejected（erratum 本身错误） | 与 Reported（未核实）分列 | rejected 仍可检索（append-only） | 去向表照登＋勘误行 |
| OpenSSF CVD | working as intended→close | 与无法复现→final note 可重开分列 | 关闭须附解释＋公开披露 | 驳回附核实依据 |
| 审计 ISA 450/580 | 事实性错报书面记录 | 与判断性错报分列 | 逐条载入底稿/管理信函 | 收口节勘误行 |
| 同行评审 IJCAI | rebuttal case 2「指出事实错误」 | 与回应提问分列 | 逐条书面进评审档案 | 勘误行文法（D-139① 同款） |
| 本仓 D-142（现状） | 缺位——靠自觉拦截 | 「无法核实→pending」已有 | 去向表（D-076④） | 候选 (a) 补档 |

## 4) 与账本 current 决策的冲突核查

| 决策 | 核查结论 |
|---|---|
| **D-142（三档分诊）** | **唯一实质交点，且属「扩展非翻案」**：三档枚举在四格矩阵中缺「查清+证伪」格。补档须走显式修订——**D-142 标 revised 并呈报新决策（D-146：摄入四档制）**，禁止静默改向；AGENTS.md 摄入行扩半句属 D-142① 行文原位扩展。注意与 D-142②「pending 不升格第四守态」边界：新档是摄入分诊态非 registry/Watch Tri-state 态，不破该禁令——新决策条文须显式写明防误读。 |
| D-071/D-073/D-074 | 无冲突。机制实史=条款内行为；(c) 不翻 D-073 仅登记。 |
| D-075（受理三要素） | 无冲突。「快照不属实」不进裁定链=不触发三要素受理，与第一档同型。 |
| D-076（去向表/全留痕） | 无冲突且被强化：显式不立案不减留痕义务，与 IETF Rejected 仍可检索同构。 |
| D-139（correction 文法） | 无冲突：勘误行沿用 D-143①/D-139① 同款文法（correction 非 corrective action）。 |
| D-041/D-094/D-102① | 无冲突。批摘追认挂 T3 照旧。 |
| D-129（收口注记先例） | 无冲突：第四档表述落 CONTEXT「评审快照分诊」词条括注＋AGENTS.md 半句，同一轻规约文法。 |

**推荐新决策条文要点（D-146 拟稿）**：① AGENTS.md 摄入行扩「可核实且证伪→标『快照不属实』附核实依据，显式驳回不进裁定链（去向表照登）」；② CONTEXT 词条三档→四档同步；③ registry 90-review-intake-mistriage-recurrence 触发器语义覆盖面含第四档误分诊；④ 显式声明「快照不属实」=摄入分诊封闭处置态非 Watch Tri-state 第四守态（防 D-142② 边界被误读为已破）。

## 5) 完整来源清单

rfc-editor.org/series/rfc-errata＋/how-to-verify（Rejected=redundant or incorrect、可检索、三键验证流程，页面 2026-05-09 更新）；wiki.ietf.org/group/iab/IAB_Errata_Process（Rejected 第二语义=应走新 RFC）；firefox-source-docs.mozilla.org bug-mgmt/processes/labels.html（invalid/worksforme/wontfix 定义原文）；lists.bugzilla.org developers 2010-12 Sivonen（INVALID 语义误用实证——名分须带判词）；learn.microsoft.com azure boards manage-bugs（Cannot Reproduce/As Designed 独立 resolve 态）；oss-vulnerability-guide.openssf.org maintainer-guide（CVD working as intended→close＋解释义务原文）；devblogs.microsoft.com/oldnewthing 2019-03-14（误报驳回须留痕反面案例）；mia.org.my ISA 580（代表函文书形态）；pcaobus.org AS 2805（未更正错报随函附清单）；accaglobal ISA 450（factual misstatement 无协商余地直接记录）；2026.ijcai.org authors-reponse-faq（rebuttal case 2=指出事实错误独立文书）；wiki.eclipse.org Bugzilla HOWTO（INVALID=bogus/WORKSFORME 对照）；知识库 R22-Q1/R6-28 召回。

## 6) 信息缺口

1. 期刊级 rebuttal 对事实错误文书规范未取一手原文（paywall），以 IJCAI 公开 FAQ 替代；
2. GitHub 官方 triage 文档未单独深读，closed-state reason 分类以 Firefox/Eclipse/Azure 三源交叉覆盖；
3. 「向评审方反馈其误读」回溯告知义务（OpenSSF 解释义务对应）在锐评渠道单向时落地形态留待触发器场景裁定。
