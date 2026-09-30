# R49-Q2 调研报告 —— 冻结声明件内扩面的合规通道立法

**程序说明**：atomcode CLI 调用与三次续跑均被中断（输出仅终端控制序列；历史会话显示 5h 配额窗耗尽）。按技能 fallback 由编排层直调三引擎联网核验＋知识库高价值先验（atomcode-q6 临床偏差双层结构、waven-q2 ISO/IEC 17025 errata、API errata 系列）综合成报。归档=ctx_batch_execute 索引节原文重组；「1) 执行摘要」「2) 分点结论(2)」「7) 信息缺口」三节未逐字召回——实质内容已由分点结论/推荐/冲突扫描承载，如实标注。

## 2) 分点结论

**结论 1：deviation 与 amendment 的分界 = 可预见性，不是大小——这正是本仓「扩面天然不可能预先声明」张力的行业解法。**
FDA 2024 草案指南（adopting ICH E3 定义）将偏差二分为 unintentional（执行后才发现，最常见，事后按期限登记，如 10 个工作日）与 intentional/planned（须 sponsor/FDA/IRB **事前批准**后方可实施）。临床行业没有要求「发现即停一切」，要求的是 **as-they-occur 记录**（Fraser Health 跟踪日志惯例：append-only、带类型编码）＋重要偏差汇总进最终报告（CSR）＋非重要偏差保留在 validated repository 备查——即「运行时 append-only 账本 + 汇总进不可变注册体」双层（FDA 指南原文 + Fraser Health + PLOS RR 三源交叉）。**对应裁决①：先勘误后变更不是绝对强约束**——它是 planned change 的强约束；对执行中发现的 deviation，行业标准是「诚实的、带真实时点的事后登记，且登记期限有硬约束」。候选 (i) 的「同 commit 不可分割时勘误紧随其后且如实标 post-hoc」恰好就是临床模型，方向正确。

**结论 2：registered report 惯例——事后披露是合法通道，混入协议层才是重罪。**
PLOS/Henderson 2022《Ten simple rules for writing a Registered Report》明文：任何变更「must be recorded and transparently reported in the Stage 2 manuscript **as a deviation** from the approved protocol」。即 Stage 2 成稿（≈变更 commit）内含 deviation 披露是可接受的——但它**不被算进协议（protocol）本身**，正因为 Stage 2 无法自证时序优先。OSF 注册体公开后不可改，唯一合法槽位是 append 型 update。**对应裁决②**：Stage 2 内嵌披露 ≈ commit-body 声明——行业定位是「透明的自述性 contemporaneous 记录」，审计学上弱于外部时间锚定的声明物化面，但强于事后追述；它证明透明而非证明时序，故只能作为从证据。

**结论 3：RFC errata 机制给出了「机械 vs 语义」分级的可操作判据先例——「符合原意」测试（裁决③的关键）。**
RFC 原文发布后永不改写，勘误以独立编号追加，分 technical/editorial 两级。IESG 处理声明（2021）给出分级判据：拼写语法 → 直接 Verified（≈机械档）；技术性修正但「resolution **in line with the original intent**」→ Verified；而「把协议运行方式改成与批准时共识不同」的变更 → **从勘误通道驳回**，必须走新 RFC（≈重立声明/amendment）。这直接回应了候选 (iii) 的「判据歧义成新裁面」担忧：判据不是「实现层 vs 规格层」这种模糊二分，而是**「实落物是否改变了冻结声明所钉住的东西（判据、锚语义、被验证的行为面）」**——即被验证的命题是否变了。技术/编辑分类同样出现在 W3C errata（Substantive/Editorial 编号追加、逆时序排列）与 API 标准独立编号 Errata 系列中，三源同构。

**结论 4：变更管理的 change-order 时点纪律——实施前补票是常态铁律，实施后补票是「构造性变更」例外救济，证据负担更重且有时限惩罚。**
AIA/FAR 体系：承包商无书面 change order 不得施工（默认强约束）；已实施后才认账的走 constructive change doctrine——承包商须举证增做工作、政府原因、CO 参与和**及时通知**四要件，漏掉通知时限即丧失索赔（ConsensusDocs「Snooze you lose」）。**对应裁决①（补强）**：行业默认确是「先票后工」，事后补票存在但被明确定位为例外路径＋证据强度降级＋期限硬约束。这支持 (i) 的主通道设计，同时印证「post-hoc 晚声明」不能无限期——需要紧跟时限。

## 3) 对比矩阵（四候选 × 工业对标）

（索引节存在——正文未逐字召回；结论已并入分点结论与推荐。）

## 4) 冲突扫描（对 current 决策）

- **D-177（预声明验证包）**：结论为**延伸而非修订**——勘误通道把 D-177 的「声明物化先于变更→时序可证」内核扩展到扩面段；但 (i) 的「同 commit 不可分割时勘误紧随其后」构成对 D-177 严格时序的**显式例外条款**（仅限执行中发现、无法预声明的扩面段，且强制 post-hoc 时点标注），须在立法文中显式声明为例外而非默示松动。D-177 主干（已声明面的时序义务）零触碰。
- **D-146⑤（勘误链式追加不改写）**：直接同构，(i) 即其规格件场景的应用，无冲突。
- **D-148③（生效时点不溯既往）**：新规程自落盘 commit 起生效、落盘轮豁免——R49-F2 首例即处于「立法定形与首例处置同轮」形态，与 grandfather 模式同构，无冲突；建议首例按新通道处置并在账行钉「首例即定形」。
- **D-139/D-140②（分 commit 纪律）**：勘误 commit 承载声明语义，属语义 commit，禁搭车 bundle/format——一致。
- **D-144①④（账行↔编年随行）**：每次勘误追加产生账行增量，随行核对义务照常适用——一致，且勘误节自带发现时点字段正好服务编年随行。
- **D-147（scoped revised 形态）**：勘误通道只覆盖**点状扩面**；若某冻结声明需要成片改写，仍走 D-147 的 scoped revised 重冻结，两通道并存分层，无冲突。

## 5) 推荐 + 理由 + 置信度

**推荐：候选 (i) 为基底立法，吸收 (iii) 的分级并以 IESG「符合原意」测试钉判据；commit-body（ii）明确为补充证据、单独不充分；（iv）否决。** 具体形态：

1. **声明文件设 append-only 勘误节**（链式、不改写原文，同构 RFC errata + D-146⑤），每条含：扩面描述、发现时点（pre-commit / post-hoc 如实标）、与变更 commit 的指针。
2. **时点义务二分（按可预见性而非按大小）**：扩面在变更 commit 前已被识别 → 勘误 commit 先行（强时序，D-177 主干延伸）；执行中才发现 → 变更后**立即**（建议钉一个紧随时限，同构 constructive change 的 notice deadline / 临床 10 工作日）落勘误，post-hoc 时点如实标注。诚实晚声明合法，伪装早声明为顶格违规（PCAOB/临床双域口径）。
3. **强度分级判据 = 「实落物是否改变冻结声明所钉住的被验证命题」**（IESG in-line-with-original-intent 测试）：载体漂移、纯实现层名实缝 → 可走 commit-body + 勘误索引批注（轻档）；断言增项、锚语义变更 → 必须独立勘误 commit（重档）。首例三处：①载体漂移=轻档，②A5 增项=重档（新增被验证命题），③锚语义变更=重档——注意 ②③ 在 IESG 测试下其实清晰，本仓担心的「两处分类存疑」用外部判据后可裁。
4. **commit-body 永远可写、但永远只是从证据**——立法文中显式钉「body 声明不满足 D-177 证据强度」。

**置信度：高**（方向与主通道形态——四域交叉一致、判据有直接先例）；**中**（紧随时限的具体天数、轻档是否允许批量化登记——行业只给了「及时」原则，具体值是本仓自裁量）。

## 6) 完整来源清单

| # | 来源 | URL | 角度 | 日期 | 贡献 |
|---|---|---|---|---|---|
| 1 | RFC Editor: Errata in RFCs | https://www.rfc-editor.org/series/rfc-errata/ | Official | 2026-05-09 | 原文永不改写、errata 独立追加、Verified/Rejected/HFDU 状态机 |
| 2 | IESG Processing of RFC Errata | https://datatracker.ietf.org/doc/statement-iesg-iesg-processing-of-rfc-errata-for-the-ietf-stream-20210507/ | Official | 2021-05-07 | **「符合原意」分级判据**：语义偏离共识的变更驳回出勘误通道须走新 RFC |
| 3 | FDA: Protocol Deviations for Clinical Investigations (draft) | https://www.fda.gov/media/184745/download | Official | 2024-12 | deviation/amendment 二分、important 分层汇总进 CSR |
| 4 | WCG: Protocol Deviations Explained | https://www.wcgclinical.com/insights/protocol-deviations-explained-understanding-the-fdas-draft-guidance | Official(解读) | 2025 | intentional=事前批准 vs unintentional=事后期限登记的对照表（全文已读） |
| 5 | Ropes & Gray: FDA Draft Guidance 解读 | https://www.ropesgray.com/en/insights/alerts/2025/01/clinical-trial-protocol-deviations-a-new-fda-draft-guidance-to-ring-in-the-new-year | Official(律所) | 2025-01-06 | 分级响应义务：important 须培训识别、non-important 留存备查 |
| 6 | Henderson et al., Ten simple rules for a Registered Report (PMC) | https://pmc.ncbi.nlm.nih.gov/articles/PMC9612468 | Official(同行评审) | 2022 | 变更必须以 deviation 名义在 Stage 2 透明披露——commit-body 对应物 |
| 7 | PLOS Handling Registered Reports | https://genweb.plos.org/RR/EditorResources_ONERegisteredReports.pdf | Official | — | 两阶段结构中 protocol 不可改、deviation 走报告层 |
| 8 | PCAOB AS 1215 Audit Documentation（正文+附录 A+新规解读三件） | https://pcaobus.org/oversight/standards/auditing-standards/details/AS1215_Appendix_A 等三件 | Official+Currency | 2024-2026 | 报告后可增不可删、增补须记 who/when/why、14 天收紧意图=压倒签空间 |
| 9 | Public Contracting Institute: Constructive Changes | https://publiccontractinginstitute.com/wp-content/uploads/The-Professors-Forum-Constructive-Changes-copy.pdf | Official(法律) | — | 事后补票四要件（含 notice）与证据负担 |
| 10 | ConsensusDocs: Notice and Timing Enforcement | https://www.consensusdocs.org/news/snooze-you-lose-enforcement-of-notice-and-timing-provisions/ | Community(行业组织) | 2024-10-14 | 事后补票的时限惩罚（"Snooze you lose"） |
| 11 | ISA 210（agreeing terms of engagement） | https://pasai.squarespace.com/s/isa-210.pdf | Official | — | 条款变更须双方同意并记录于新 engagement letter（PDF 未读通，摘要级） |
| 12 | ISO/IEC 17025 §7.8.8.1 勘误 FAQ（European Accreditation）＋ API Errata 系列 | https://european-accreditation.org/sp_accordion_faqs/45-2-question-on-amendments-to-test-reports-iso-iec-17025-clause-7-8-8-1/ ；https://www.api.org/products-and-services/standards/addenda-and-errata | Official | 2025-10 / — | 检测报告勘误须标识+理由；标准体系独立编号 errata 不改正文（ctx 先前索引） |
| 13 | FDA 指南偏差双层结构＋Fraser Health as-they-occur 日志 | （FDA 184745 同上；studylib Fraser Health log） | Official+Community | — | append-only 账本→不可变注册体汇总的双层心智模型（ctx 先前索引） |

## 7) 信息缺口

- atomcode CLI 三次续跑均失败（输出仅终端控制序列；历史会话示 5h 配额窗耗尽）——独立 CLI 调研腿缺席，本报告由编排层三引擎直搜＋知识库先验综合；
- 「紧随时限」具体天数、轻档批量登记边界：行业只给「及时」原则（ConsensusDocs notice deadline / 临床 10 工作日类比），具体值属本仓自裁量；
- ISA 210 PDF 二进制未读通（摘要级）；FDA 指南页一度 404 经镜像补足。
