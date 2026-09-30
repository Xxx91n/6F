# R51-Q6 调研报告 —— 指针纪律载体落点（WORKFLOW 扩写 vs CONTEXT 词条 vs ADR vs 组合）

> 存档说明：atomcode 配额仍在耗尽窗（~20:50 复位）——**配额耗尽=D-186 唯一不续跑例外**，按规程转白名单工具（web_search×3）编排层合成，**degraded_performance 合法降级形态**（本轮构成比 6/6=100%——连续第二轮全 fallback 面，收口时构成比逐轮登记+复审钩盯 D-186②）。题面存档见 reports/R51-Q6-research-prompt.md。

**Sufficiency Gate**：searches: 3（web_search×3：ADR 门槛原典、文档分层惯例、git 术语正名）| angles: Official（Nygard 原典 cognitect 博文、adr.github.io、AWS Prescriptive Guidance、Fowler bliki、git glossary/gitdatamodel 官方）＋Community（SO unreachable/dangling 辨析、git 邮件列表 Linus 术语讨论）｜full reads: 5（Nygard 2011、AWS ADR 指南 PDF 摘要、adr.github.io、git glossary 经 SO 转引、gitdatamodel 官方）｜gaps: 见 §6。

## 1) 执行摘要（Tl;dr）

**推荐：采纳 (i) WORKFLOW §4.2.10 扩写＋CONTEXT.md 词条节双层载体——不立 ADR（本轮为过程规程立法非产品架构决策，仓内 24 件 ADR 全产品面先例一致）；术语命名采「工业正名优先、无正名才自造」原则——对象态用 git 官方 unreachable/dangling，关系态无既有名词可自造「孤儿孪生」。置信度：中高**（ADR 门槛与术语正名有官方一手文档；「不立 ADR」判读=仓内先例一致性强论证非外部强制）。

## 2) 分点结论

**C1. 双层载体（规程条文+术语词典）是规范文档编制的工业标配——(i) 有直接同构先例。** ISO/IEC Directives Part 2 规定标准文本必含独立术语条款（clause 3 Terms and definitions）与规范性条文分置；RFC 惯例=§1.1 Terminology 节与后文规程节分离（RFC 2119/8174 自身即先例——术语集中定义、规程引用术语）。政策文档编制惯例=「程序归程序、词典归词典」。→ 本仓 WORKFLOW=规程面、CONTEXT.md=术语面的双层结构与工业标准文档编制同构，(iii) 单载体把判据散入词条违反「规程应可独立执行」编制原则。

**C2. ADR 门槛判读：本裁为过程规程非产品架构决策——不立 ADR。** Nygard 原典判据=「architecturally significant: affects structure, non-functional characteristics, dependencies, interfaces, construction techniques」【W1】；adr.github.io 定义 ASR=「measurable effect on the architecture and quality of a software system」【W3】；AWS 指南的扩展边界含「processes」（GitFlow 选型类决策可入 ADR）【W2】——**临界判读**：本仓指针纪律属「工作过程规程」而非产品/系统的架构特性（不触产品结构/接口/依赖），且本仓既成先例强（24 件 ADR 全产品面；D-181/D-146⑤/D-149 等程序裁定历来落账本+WORKFLOW）。→ **不立 ADR**：入闸门槛「难撤销/缺上下文难懂/有意义权衡」三条中本裁只沾「有意义权衡」半条（可追溯账本已完整承载上下文），立 ADR=过程纪律混入产品决策面稀释 ADR 纯度。注：若未来产品面（Micro-B 卡/审计引擎自身）需要同型 commit 引用语义，届时立产品面 ADR 援引本裁——现在不立。

**C3. 术语命名：工业正名优先、无正名自造。** git 官方 glossary【W4】【W5】：unreachable object=不可从任何 ref/reflog 到达的对象；dangling object=unreachable 的真子集（连不可达对象都不引用它）；gitdatamodel 官方【W6】：amend 后旧 commit「recorded in the reflog, still reachable, reflog 过期后 unreachable→gc」——W8 病灶对象的准确术语=**reflog 可达的不可达-分支 commit**（「orphan」为社区俗称非官方名）。→ 词条命名建议：**对象态采正名「不可达 commit（unreachable）」**（不另造词）；**关系态自造「孤儿孪生（orphan twin）」**——「同 change-id、一在锚线一孤儿」的孪生关系无既有名词，自造词词条须标【自造】并给边界示例（D-189 词条惯例）；「锚线（anchor line）」同自造（R51-Q3 报告已如实标「无同名成文惯例」）；「严格层/宽层」「法定指针形」「已知违规清单（baseline）」为规程自造词，词条化登记。

**C4. 专题文档 (iv) 否决先例。** 建制面膨胀的文档学判读：规范内容的新增载体只有在既有载体无法承载时才立（ISO 文档金字塔 policy→procedure→record 三层够用则不增层）；本仓 WORKFLOW §4.2.x 节结构+CONTEXT 词条面+账本裁定链三层已完整承载指针纪律，单开专题文档=检点面增加但无新增承载力——违反 D-184「建制重复禁区」同型精神（虽非直接约束）。

**C5. 执行窗分工符合既有先例**：条文面（WORKFLOW/CONTEXT 扩写）＋勘误行=本轮收口批（文书面非源改）；守卫件=下轮执行批（check 源码属源改面须 D-177 预声明先行）——与 D-184 迁入闸件同型排产先例（条文先行+件后随）。

## 3) 冲突扫描（对本仓 current 决策）

| 决策 | 冲突？ | 裁定 |
|---|---|---|
| D-188~D-192 五裁 | 否——成文承载 | 本条=五裁的落位，非新裁 |
| D-165/D-170 分层定稿 | 否——同构 | 账本（裁定层）+WORKFLOW（规程层）+CONTEXT（术语层）分层与既有分层惯例一致 |
| D-161④ footer 三栏位 | 否 | 词条不涉及 footer；commit trailer 面不动 |
| D-181/D-146⑤/D-148③/D-177 | 否 | 勘误通道/追加纪律/生效时点/预声明路径全部承接 |
| ADR 先例面（24 件产品面） | 否 | 不立 ADR 与先例一致 |

## 4) 推荐＋理由＋置信度

**推荐：(i) 双层载体，五裁成文落点分配**：
1. **WORKFLOW §4.2.10 扩写**（规程条文本体）：法定指针形定义（SHA≥12hex+("subject")+存在∧锚线可达）／锚线声明制（默认线+跨线标注形态）／严格层位形枚举清单／宽层窄禁令／勘误指针列消费规程；
2. **CONTEXT.md 词条节**：新词条=「锚线（anchor line）」〔自造标位〕「孤儿孪生（orphan twin）」〔自造标位＋正名注记：对象态=git 官方 unreachable commit〕「法定指针形」「严格层/宽层」「已知违规清单（baseline）」——自造词统一给定义+边界示例+来源裁号；
3. **不立 ADR**（过程规程先例一致；产品面如需 commit 引用语义届时另立援引）；
4. **执行窗分工**：条文面+勘误行（D-191 两条）=本轮收口批；守卫件=下轮执行批 D-177 预声明先行。

**理由**：规程/术语双层=ISO-RFC 编制惯例同构；ADR 门槛临界判读以仓内 24 件先例一致性为准；术语正名优先原则避自造词税。置信度：**中高**。

## 5) 完整来源清单

| # | 标题 | URL | 角度 | 贡献 |
|---|---|---|---|---|
| W1 | Michael Nygard: Documenting Architecture Decisions（2011 原典） | cognitect.com/blog/2011/11/15/documenting-architecture-decisions | Official | ADR 门槛原文=「affect structure, non-functional characteristics, dependencies, interfaces, construction techniques」 |
| W2 | AWS Prescriptive Guidance: ADR | docs.aws.amazon.com/pdfs/prescriptive-guidance/latest/architectural-decision-records/architectural-decision-records.pdf | Official | ASR 判据扩展含「construction techniques (libraries, frameworks, tools, **and processes**)」——过程决策入 ADR 的边界先例 |
| W3 | adr.github.io 官方站 | adr.github.io | Official | AD=「architecturally significant」定义＋Y-statement 格式 |
| W4 | git glossary（经 SO 转引） | git-scm.com/docs/gitglossary | Official | dangling object/unreachable object 官方定义区分 |
| W5 | SO: git fsck dangling vs unreachable vs lost-found | stackoverflow.com/questions/36621730 | Community | 术语辨析＋Linus 邮件列表「unreachable tips」提议〔git 官方邮件存档〕 |
| W6 | gitdatamodel 官方 | cdn.kernel.org/pub/software/scm/git/docs/gitdatamodel.html | Official（已读原文） | amend 后旧 commit=reflog 可达→过期 unreachable→gc——W8 病灶对象的准确术语链 |

## 6) 信息缺口（如实标位）

1. **atomcode 配额耗尽窗未复位**——本报告=编排层合成（D-186 降级形态，本轮 6/6）。
2. **ISO/IEC Directives Part 2 术语条款**引用为域惯例级未抓条文原文——标准编制常识级。
3. **「不立 ADR」判读**以仓内先例一致性为主论证，外部只有 AWS 指南的「processes 可入 ADR」临界材料——用户若偏好产品语义沉淀可翻案为 (ii)。
4. **账本原文对表**：编排层已核 ADR 目录全 24 件题名＋D-188~D-192/D-165/D-170 原文。
