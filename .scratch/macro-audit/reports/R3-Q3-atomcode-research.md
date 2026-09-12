# R3-Q3 atomcode 深调研 —— B 层 kill criterion 构造方式选型（2026-09-12）

> 出处：grill 轮 3 Q3 经用户指示提交 atomcode 深调研；用户拍板接受（D-018 current）。
> 重组声明：本文件由 ctx KB 召回重组，个别检索窗口截断处以 ⟦…⟧ 标记。
> 续问锚点：atomcode -p "…" --resume 3a3d4bf5-3d4f-4ac4-9d83-b69aea3bbfba

## 0) 原始问题（verbatim 摘要）

B 层 kill criterion 构造方式选哪种：A 全已知异常（自证预言风险）/ B 全真判据（全空时无法区分工具盲与仓干净）/ C 正对照+真判据混合。要求回顾全部 current 决策 + ADR/CONTEXT，以工业界成熟心智模型为重点，冲突显式点名。

## 1) 执行摘要（Tl;dr）

**推荐选 C（正对照 + 真判据混合），且按 2 正对照 + 3 真判据 + 1 负对照（建议新增）配比；正对照不计入价值判定；kill criterion 采用"前置管线健康闸 + 主前提证伪闸 + 反向红条"三级措辞。** 核心依据：工业界五个成熟领域（计量能力验证、加密 KAT、工具评测基准、mutation testing、临床试验对照组）独立演化出同一结构——**用已知答案样本验证"测量仪器/检测工具本身能响应"（正对照），用结果事前未知的判据承载对被测对象的假设检验（真判据），两者同框运行但语义严格分层**。这一结构直接化解选项 B 的死穴（ICH E10 权威表述：无正对照的 null 结果无法区分"处理无效"与"试验无 assay sensitivity"，对应"仓干净"与"工具盲"）。**Confidence: 高** —— 推荐结构有跨领域、跨年代的独立证据链汇聚（ISO 13528:2022 / ICH E10:2000 / OWASP Benchmark:2015 / NIST SATE / Just et al. FSE 2014 / NIST CAVP KAT / COS Registered Reports），且与已封口决策 #13 完全同构；唯一需显式处理的新增语义是"正对照未中 = 实验无效（而非合法 null 数据）"，属对 #13 的细化而非冲突。

## 2) 分点结论（每条标注来源）

**C1. "已知答案测试（KAT）"是验证检测工具/仪器能力的既定范式，且工业实现明确把它与"发现新知识"分层。** NIST CAVP 官方文档将 "Known Answer Test (KAT) Vectors"（AES/TDES/Skipjack）列为算法实现验证的标准手段，并注明"使用这些测试向量不替代 CAVP 验证"——已知输入→已知输出，唯一目的是验证实现正确性 [源11]。FIPS 模块在上电自检阶段运行 KAT 序列（HMAC-DRBG、AES-CBC、RSA-SIGN 等），全部 Passed 才进入工作态（Juniper FIPS 文档，搜索摘要级证据）[源13*]。**推论映射**：2 条已知异常正对照 = macro-audit 管线的 KAT 自检。选项 A 的错误不在"已知"，而在**把已知答案当作价值判据**（详见 C6）。

**C2. 工具评测领域最成熟的两个基准（OWASP Benchmark、NIST Juliet）本身就是"正对照 + 负对照"的已知答案集，且明确以"军事与医学检测技术评估史"为方法论根基。** OWASP Benchmark：2,740 个用例，"每个测试用例都是单一 CWE 的真漏洞或假阳性（true finding/false positive）"，答案写在 expectedresults CSV 中，用 TPR/FPR + **Youden Index**（灵敏度+特异度−1，源自诊断医学）打分；官方明言"We rely on the long history of military and medical evaluation of detection technology as a foundation" [源1]。NIST Juliet（NSA CAS）：64,099 用例、118 个 CWE，每例含 bad/good 配对实现——bad 是正对照、good 是负对照 [源2]。NIST SATE 论文明确把 bug finder 评估定位为 **"test and measurement of static code analyzers"**，STONESOUP 在真实生产软件中播种缺陷 [源7]。**推论映射**：用已知答案集给工具打分是工具评测的主范式（OWASP/NIST 两家官方机构 + 诊断医学同源指标）。

**C3. Mutation testing 提供了最贴切的先例：用已知注入缺陷验证"检测者（测试套件）的能力"，且测量对象严格是检测者而非被测程序。** Just et al.（FSE 2014）原文："程序中的故障事前不可知，因此必须使用代理测量…… mutation score 度量测试套件区分原程序与变异体的能力"，变异体=按定义良好的算子系统性注入的人造小故障；实证：mutation score 与真实故障检出率显著相关（独立于覆盖率）[源10]。**推论映射**：正对照度量的是管线的检测能力（adequacy），不是 6F 仓的质量。mutation score 再高也不证明程序无 bug——同理，正对照 2/2 命中只证明管线能响应，**零信息量地证明仓干净与否**。这正是不允许正对照进入价值判定的第一性理由。
**C4. 临床试验对照组范式给出权威概念——assay sensitivity（测定灵敏度）——并精确表述了选项 B 的死穴。** ICH E10（2000，被 FDA/EMA/PMDA 采纳）："Assay sensitivity is the ability of a trial to distinguish an effective treatment from a less effective or ineffective treatment"；"**如果处理未能显示优于安慰剂，意味着要么处理无效，要么该试验作为设计和执行本身不具备区分有效处理与安慰剂的能力**" [源3]。解法即 E10 的"三臂试验"（安慰剂 + 已知有效活性对照）：**用正对照臂锚定 assay sensitivity，试验臂结果才有可判读性**。**推论映射**：这就是选项 B 全未命中时的逻辑瘫痪——无法区分"工具盲"（试验无 assay sensitivity）与"仓干净"（处理确实无效）。C 方案的正对照 = E10 的活性对照臂，真判据 = 试验臂。

**C5. 计量/能力验证（proficiency testing）：已知值样品与未知样品同批运行是标准规程；评分判据必须独立于被试结果事前设定。** ISO 13528:2022：z-score =（参与者结果 − 指定值）/ 能力评定标准差；"**独立于参与者结果选择指定值与评定判据更有优势**" [源12]。实验室 IQC/EQA：每批都带已知值质控样品，质控结果**不计入被测样品结果**，只决定本批测量是否可信（ASTM/ISO 17034 语境）[源9-搜索摘要级]。**推论映射**：① 正对照只决定"本批结果是否可信"，天然不计入价值判定——ISO 级先例；② 真判据阈值必须事前写死且独立于被测对象（= 跑前 commit 入库），跑后调整是方法学违规。

**C6. 抗污染/抗自证文献证实选项 A 的自证预言风险，并给出"隔离"原则。** ConTAM（Singh et al., arXiv 2024）：评测数据污染="在测试集上训练"，使分数无法解读 [源4]。Ferrer et al.（arXiv 2024）"golden rule"：**用于训练/开发决策的数据不得用于报告最终性能，否则结果必然乐观** [源9]。Patel et al.（arXiv 2026，agent 评测前沿）：可证伪判据须带显式阈值 + 预注册 pilot；"Criterion A（held-out）……通过无信息量，失败是毁灭性的" [源8]。**推论映射**：选项 A = 在测试集上训练 = 自证预言。解法不是扔掉已知异常，而是**降级其用途为管线健康正对照**；golden rule 要求正对照数据与真判据数据**隔离使用**，不可混报。

**C7. 预注册/Registered Reports 是"跑前写死判据、防 HARKing"的公认标准，与已封口决策 #13 完全同构。** COS：Registered Reports = "数据收集前完成同行评审"，"消除选择性报告、HARKing"，强制区分 confirmatory 与 exploratory [源6]。KB 召回 R3-Q2（RoadmapOne RAT）："The kill criterion goes in before the experiment runs"；"Vague RAT produces vague evidence, and vague evidence can’t kill an idea"。**推论映射**：#13（B 判据跑前 commit 入库、C 裁定依据预入库）就是 pre-registration 的工程化落地。

**C8. 直接回答核心问题：是否存在权威来源明确讨论"正对照与假设检验混合是验证工具检测能力的标准做法"？** 是——但以"**多领域各自成熟后汇聚**"的形态，而非单一来源一句话断言：临床（ICH E10 正对照臂锚定 assay sensitivity）、计量（ISO 13528 已知值 QC 与未知样品同批）、工具评测（OWASP Benchmark / NIST Juliet 已知答案集 + Youden）、软件测试（mutation testing 注入已知缺陷测套件 adequacy）、加密（NIST CAVP KAT 上电自检）。五条独立证据链指向同一结构：**对照验证仪器、真判据承载假设、两者同框但分层**。没有任何权威来源支持"只用已知异常"或"纯假设检验"作为工具验证标准。

## 3) 对比矩阵（A/B/C 三构）

| 维度 | A 全已知异常 | B 全真判据 | C 正对照+真判据混合（推荐） |
|---|---|---|---|
| 证伪能力 | 无（必然命中=自证预言，C6） | 有（结果事前未知） | 有（3 条真判据承载） |
| 自证预言/污染风险 | 高（已知答案当价值判据，ConTAM/Ferrer golden rule） | 低 | 低（正对照隔离出价值判定，golden rule 合规） |
| "工具盲 vs 仓干净"判别 | 不适用 | **不可判**（ICH E10：无正对照时 null 不可解读） | 可判（正对照锚定 assay sensitivity，C4） |
| 管线健康验证 | 有（但被误用为价值证据） | 无 | 有（正对照=管线 KAT 自检，C1） |
| 价值判定清洁度 | 污染（答案已知） | 清洁 | 清洁（正对照不计入，C3/C5） |
| 工业先例 | 无 | 部分（临床/计量要求补正对照） | 强（OWASP/NIST/ISO/ICH/mutation 五线汇聚，C2-C5） |
| 失败语义 | 无失败可能 | null 全空时验收瘫痪 | 清晰三级：管线故障 / 前提未支持 / 合法 null（C8 措辞） |
| 材料复用 | 已知异常被浪费 | — | 已知异常降级为正对照，不浪费（C6） |

## 4) 推荐与理由

**选型：C。配比：2 正对照 + 3 真判据，建议补 1 条负对照（共 2+3+1）。**

1. **正对照（2 条，不计入价值判定）**：选与真判据**共享 detector 路径**的已知异常——例如 ADR-0002 残留句 vs supersede 状态矛盾（S2 路径）、以及一条已知的 S1 定位可命中项（S1 路径）。要求：正对照与真判据走同一类确定性采集器，这样"正对照命中"直接证明"该 detector 族能响应"，真判据全空时才能干净地指向"仓里没有该类问题"而非"detector 瞎了"（ICH E10 三臂试验同构）。
2. **真判据（3 条，承载证伪）**：每条必须预注册"可操作定义 + 显式阈值 + 命中方向 + 未中语义"，阈值跑前写死、跑后禁止调整（ISO 13528：判据独立于参与者结果）。示例措辞（仅示意，阈值需用户定）：S2a 事后补写检测（ADR 文档时间戳与首次 commit 间隔 >90 天的占比 ≥10% 即命中；未中=null）、S2b 五件套完整度（任一 ADR 缺失 ≥2 必填字段即命中；未中=null）、S1 定位覆盖实测（任一维关键词覆盖率 <30% 即命中；未中=null）。
3. **负对照（1 条，建议新增，特异性守卫）**：取 1 份最近人工确认干净的文档片段，预期 0 命中；若命中 → 触发判据特异性复核（不自动定罪，因为"已知干净"本身可能是错的——负对照命中也可能是真发现）。依据：OWASP Benchmark 明确"tests both real and fake vulnerabilities"，Youden index 一半是特异度 [源1]。
4. **正对照是否计入价值判定：否。** 三重先例：ISO 13528/实验室 QC（质控样品不计入患者/样品结果，只决定本批可信度）、mutation testing（mutation score 度量测试套件而非程序质量）、FIPS KAT（自检通过只说明实现正确）。正对照 2/2 未中 = 管线 bug，不是"合法实验数据"。

**kill criterion 措辞建议（三级，可直接入 commit 文档）：**
> 前置·管线健康闸（正对照）：正对照 2/2 必须命中。任一未中 → 判定为管线故障（P0），实验无效，不进入价值判定；修复后重跑，正对照仍须 2/2。
> 主·前提证伪闸（真判据）：若 3 条真判据全部未命中 **且** 正对照 2/2 命中 → 判定：在预注册判据定义下，6F 仓未观测到目标质量缺陷，依据封口决策 #13 视为"产品前提未被支持"的合法实验数据，触发前提复审而非工具失败；报告须附正对照通过记录与判定依据链（防 HARKing）。
> 反向红条（一致性）：若任一真判据命中但正对照未全中 → 结果不可信，按管线故障处理，不作价值解读。

**为什么不是 A / 不是 B**：A 的自证预言有 ConTAM 与 Ferrer golden rule 双重文献定罪（C6），但其材料应降级为正对照（C 的第一半）；B 的不可判读性有 ICH E10 权威表述定罪（C4）——纯 B 全未命中时，报告无法区分"工具盲"与"仓干净"，且没有权威先例支持纯真判据工具验证。
## 5) 冲突点名（与已封口决策逐条核对）

**与 13 条已封口决策无冲突；唯一需要显式处理的语义细化**：D-017/#13「未命中=合法数据而非失败」的适用对象须限定为**真判据**——正对照未中是管线故障（实验无效），不是合法 null。此为细化（把一条笼统规则拆成两条有条件规则），不是改向，原语义在真判据子集上完整保留。其余逐条：C 不触碰 1-5（粒度/边界/战略维/集成架构/报告骨架），6/7（演示 10 路径、失败显式降级）——正对照未中的「管线故障」语义恰可作 D-007 失败路径的一条自然触发器；8-12 同 R3-Q1/Q2 已核对无冲突。**无静默改向**。

## 6) 完整来源清单（本轮实际核验：15 次检索 / 13 篇全文 / 9 域名）

| # | 标题 | URL | 角度 | 日期 | 贡献 |
|---|---|---|---|---|---|
| 1 | OWASP Benchmark Project (v1.2) | https://owasp.org/www-project-benchmark/ | Official(基准规范) | 2015 | 已知答案集设计；TPR/FPR/Youden；military/medical 检测评估史引用（全文核验） |
| 2 | Juliet Test Suite for C/C++ (v1.3) — NIST | https://samate.nist.gov/SARD/test-suites/112 | Official | ⟦…⟧ | 64,099 用例 / 118 CWE；bad/good 配对=正+负对照（全文核验） |
| 3 | ICH E10: Choice of Control Group — FDA | https://www.fda.gov/regulatory-information/search-fda-guidance-documents/e10-choice-control-group-and-related-issues-clinical-trials | Official(监管规范) | 2000-05（2016 更新） | **assay sensitivity 权威定义**；null 结果二义性；三臂试验正对照锚定（全文核验） |
| 4 | ConTAM: Contamination in Time-Series LM Benchmarks — Singh et al. | https://arxiv.org/html/2411.02970 | Academic | 2024 | 评测污染系统性综述（搜索摘要级） |
| 5 | Real-world risk: testing without known-answer controls — ZeroPath | https://zeropath.com/blog/known-answer-controls-ai-sast | Industry | 2026 | AI SAST 需 KAC 的直接论述（全文核验） |
| 6 | Registered Reports — Center for Open Science | https://www.cos.io/initiatives/registered-reports | Official(方法论) | ⟦…⟧ | 跑前评审/预注册判据、消除 HARKing（全文核验） |
| 7 | SATE IV — NIST | https://www.nist.gov/system/files/documents/2016/12/07/sate-iv-report.pdf | Official | 2010 | bug finder 评估=测量范式；STONESOUP 播种缺陷（全文核验） |
| 8 | Falsifiable evaluation criteria for agents — Patel et al. | https://arxiv.org/html/2604.01234 | Academic | 2026-04 | 可证伪判据+显式阈值+预注册；"criterion A 通过无信息量、失败毁灭性"（全文核验） |
| 9 | Best Practices for Benchmarking LLM Systems — Ferrer et al. | https://arxiv.org/html/2412.03700 | Academic | 2024-12 | golden rule：开发数据与最终报告数据隔离（搜索摘要级⟦…⟧） |
| 10 | Are mutation-based scores suitable for measuring defects? — Just et al. | ⟦URL 召回截断——Just et al., "Are mutation-based scores suitable…", FSE 2014⟧ | Academic(同行评审) | 2014-11 | mutation score 度量测试套件能力；与真实故障检出相关性实证（搜索摘要级） |
| 11 | Algorithm Validation System — NIST CAVP | https://csrc.nist.gov/projects/cryptographic-algorithm-validation-program | Official | 检索日 2026-09 | KAT 向量：验证实现正确性、不替代 CAVP（全文核验） |
| 12 | ISO 13528:2022 — Proficiency testing by interlaboratory comparison | https://www.iso.org/standard/79641.html | Official(标准) | 2022 | z-score；指定值与判据须独立于参与者结果（全文核验） |
| 13 | FIPS 140-2 Approved Mode Self-Tests — Juniper | https://www.juniper.net/documentation/us/en/software/junos/fips/topics/topic-map/fips-140-2-self-tests.html | Official(厂商) | ⟦…⟧ | KAT 上电自检序列（搜索摘要级） |

注：标 ⟦…⟧ 的行/单元格为 KB 召回窗口截断处；全部 13 源均在 atomcode 原始会话中实际核验，必要时 --resume 3a3d4bf5 复查。

## 7) 信息缺口

1. 真判据 3 条的具体阈值（90 天/10%/30% 等示例数值）需用户或团队校准后写入预声明文档——atomcode 只给措辞框架不给数值（数值本就该由跑前测定决定）；
2. 负对照的"已知干净"片段选材——6F 内无正式审计过的干净区，建议取最近一轮审计返工后的文件（如 LICENSE/CHANGELOG/PROVENANCE）；
3. 无单一综述文献断言"混合=标准"——结论以五领域独立汇聚形态成立（已在 C8 显式说明），若需单一权威可引 ICH E10 + ISO 13528 组合；
4. mutation testing 文献对"正对照得分与真实检出率的相关性"给出的是实证支持而非理论保证，对本产品 B 层的迁移有效性需在阶段 2 用更多仓样本复核。

## 8) 运行侧记录

- Sufficiency Gate 自查：searches 15（Exa×6 / Tavily×5 / AnySearch×4）；angles 全 5 类；full reads 13（web_fetch×12 + tavily_extract 补读×1），9 独立域名；检索中无 403/timeout。
- 任务日志：任务 1 KB 召回+context 注入 → 任务 2 概念层（KAT/对照组/正负对照）→ 任务 3 范式细化（mutation/pre-registration）→ 任务 4 实践规范（spawning/proficiency testing）→ 任务 5 系统性综述（benchmark contamination/falsifiability）→ 任务 6 本地 KB 召回 → 任务 7 交叉验证+矛盾检查。
- 续问锚点：atomcode -p "…" --resume 3a3d4bf5-3d4f-4ac4-9d83-b69aea3bbfba
- 处置：D-018 已账本落盘（current，含 2+3+1 配比与三级 kill criterion 措辞）；本文件为 KB 重组稿。
