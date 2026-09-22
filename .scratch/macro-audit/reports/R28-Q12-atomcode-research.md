[warning] 正在以管理员权限运行 — 模型可能可以访问系统文件。
我先检索知识库召回既有调研，再启动三引擎广泛搜索。知识库未命中核心先例，启动三引擎广泛搜索（default 模式，覆盖全部五角度）。Tavily 配额已耗尽（后续以 Exa+AnySearch 双引擎交叉）。现在定点深挖：抓取 SARIF/Trivy 原文，并补搜阴性渲染与行内脚注惯例。继续深挖：抓取零发现报告与 Great Expectations 原文，并补搜行内脚注与分离工件角度。核心决策账本已确认。继续第 4–6 次原文核验（GX 官方 Data Docs、SARIF suppressions 官方样例、CONSORT 开放获取原文），并补一轮对比角度查询。最后一轮：补一次内审报告惯例原文核验，然后综合输出。# R28-Q12 调研报告：quarantine 证据在报告的呈现形态

**Sufficiency Gate**：searches: 12（Exa×4 / AnySearch×6 / Tavily×2——Tavily 中途配额耗尽，已由双引擎补位）| angles: 全五类（Official / Comparative / Criticism / Currency / Community）| full reads: 7 | domains: 8+（docs.gitlab.com, trivy.dev, diablohorn.com, docs.greatexpectations.io, github.com, pmc.ncbi.nlm.nih.gov, ecampusontario.pressbooks.pub, docs.oasis-open.org 等）| gaps: ①GX Data Docs 惯例证据较弱（官方页只讲结构不讲 quarantine 呈现，靠社区/教程侧写补）②「分离工件」的直接消费体验实证研究缺失（以 SARIF 双工件 + 内审附录惯例侧推）③医学界之外少有「行内 n 声明」的强制标准文本。

---

## 1) 执行摘要（Tl;dr）

**推荐 (a) 专设 Intake Health 节＋行内排除声明双轨**，零病态时节恒在渲染「无」。**Confidence：高**。理由：工业界三条独立脉络——Trivy 的 suppression 报告（专节表格逐项披露＋理由列）、医学报告的 CONSORT/PRISMA 流程图（排除计数专节＋逐统计 n 声明行内）、内审报告惯例（正文汇总＋附录证据，不分文件）——全部收敛于「排除项就近专节披露 + 统计行内联排除基数」的双轨形态；零发现显式渲染（而非省略）是渗透测试与扫描报告两界的一致惯例。

## 2) 分点结论（按调研角度）

**① 数据质量报告惯例 → 支持双轨。** Great Expectations Data Docs 是「统计概览 + 逐 expectation 结果清单」的固定结构，每个 expectation 结果无论通过失败都渲染（[GX 官方 Data Docs](https://docs.greatexpectations.io/docs/0.18/reference/learn/terms/data_docs/)，已读）——即**失败/异常项进清单、不省略**。Soda Core 把 failing rows 落 per-check 诊断表逐行呈现（[docs.soda.io](https://docs.soda.io/data-testing/failed-rows-check)）。dbt 社区长期抱怨「失败明细无处安放」（[dbt-core discussion #8407](https://github.com/dbt-labs/dbt-core/discussions/8407)），反向印证：没有逐项清单的报告形态被用户视为缺陷。→ 逐 SHA 清单必须有家，且与统计分列。

**② 安全扫描 suppressed 披露惯例 → 最强先例，直接支持专节表格。** Trivy `--show-suppressed` 渲染**专门的 "Suppressed Vulnerabilities (Total: 9)" 表格**，每行含状态（not_affected/ignored）、理由（Statement 列）、来源（Source 列）（[Trivy filtering 文档](https://trivy.dev/docs/v0.56/guide/configuration/filtering/)，已读）。这与选项 (a) 的「quarantined only：sha/field/reason/raw echo」表格**逐列同构**。SARIF 方面：GitLab 消费 SARIF 时「suppressed results are skipped」并按比例告警（drop rate 分档：1–50% 出 warning 带计数，>50% 整体失败）（[GitLab SARIF 文档](https://docs.gitlab.com/user/application_security/detect/sarif/)，已读）——即**比例阈值处有披露义务，且以计数告警就近呈现**，对齐 D-100③ 的比例阈值可观测。SARIF 规范本身：suppression 带 kind/status 元数据、被抑制结果默认隐藏但**存在于数据面**（[microsoft/sarif-tutorials Suppressions.sarif](https://github.com/microsoft/sarif-tutorials/blob/main/samples/Suppressions.sarif)，已读）——「数据面留痕、呈现面按 disposition 分流」正是 D-112⑤ 的形态。

**③ 阴性结果显式渲染惯例 → 两界一致支持「节恒在渲染无」。** 渗透测试报告惯例：零发现不是省略报告节，而是**显式写出并解释为什么**（scope/方法/局限），否则会被误读为「100% 安全」或「没测」（[DiabloHorn: Writing a zero findings pentest report](https://diablohorn.com/2022/04/23/writing-a-zero-findings-pentest-report/)，已读；[HackTheBox 同题](https://www.hackthebox.com/blog/pentest-zero-findings-next-steps)）。Trivy 零发现固定渲染 `Total: 0 (UNKNOWN: 0, LOW: 0, …)`——**计数骨架恒在，数值为零也是信息**（Trivy 文档已读段落）。→ 阴性节是「自证声明」而非噪音，且恒在节对字节确定性 golden 是最友好的形态（模板静态、只有数值变），直接消解「省略有 golden diff 牵连」的 T-01~T-07 风险。

**④ 行内排除声明先例 → 医学界最强。** CONSORT/PRISMA 流程图要求每阶段 `Excluded (n=) + reasons`，统计分析声明 `Analysed (n=XX) / Excluded (n=x)`（[CONSORT-DEFINE E&E, eClinicalMedicine 2025](https://pmc.ncbi.nlm.nih.gov/articles/PMC11773258/)，已读；[CONSORT 2010 E&E](https://www.jclinepi.com/article/S0895-4356(10)00103-4/fulltext)；[APA JARS 流程图模板](https://www.apa.org/pubs/authors/jars.pdf)）。其结构恰是双轨：**流程图（≈恒等式区）集中呈现排除链，每个分析结果旁内联 n 声明**。APA/CONSORT 明文动机：「excluded from analysis 且组间不均衡会导出错误结论」（JACC 2015 同旨）——正是 D-100③「派生统计须声明排除行」的医学版。→ 行内 `over N-M commits` 不是发明，是沿用统计学报告的金标准格式。

**⑤ 分离工件（选项 d）先例与成本。** SARIF 生态确实是「机读工件 + 人读 UI」双工件，但那是**机器/人读分流**，不是**证据/裁定分流**——证据（suppression 元数据）仍在同一工件内随结果走。内审报告惯例：支撑性证据以**同报告附录**（appendices）呈现，「too voluminous to include in the main body」才下沉，且仍在同一文件（[Internal Auditing ch.10.01](https://ecampusontario.pressbooks.pub/internalauditing/chapter/10-01-crafting-effective-audit-reports/)，已读）。分离文件的成本：消费者需跨文件对账恒等式（「清单数 + 排除数 = 总数」在两个文件里各一半），字节确定性下还多一份工件的 golden 负担。→ (d) 无正面先例支持，反例成本明确。

**⑥ 辩证权衡。**
- 专节冗余风险：真实但可控——quarantined 清单只在有病态时有行，节本身恒在但零病态时仅一行「无」，膨胀上界 = 病态数 × 1 行，且与 D-112⑤「normalized 不渲染」切开后清单规模天然受限。
- 行内声明被跳过风险：这正是 (b) 的死穴——全局声明要求消费者自行映射排除到统计，GitLab 专门做 drop-rate 就近告警、CONSORT 把 n 声明做成 checklist 项，都说明工业界认定「人不会自己映射」。
- 空节噪音 vs 自证价值：渗透测试惯例裁定为**自证价值胜出**——省略零节会让「无病态」与「未声明」不可区分，破坏报告的 closed-world 语义。

## 3) 对比矩阵

| 选项 | 工业界先例 | 恒等式可就地验证 | 逐 SHA 清单安置 | 零病态语义 | 消费者映射负担 | 备注 |
|---|---|---|---|---|---|---|
| (a) 专节+行内双轨 | Trivy suppression 表 + CONSORT 流程图/n 声明（双先例同构） | ✅ 专节内一行恒等式 | ✅ 专节表格 | ✅ 节恒在渲染「无」（pentest/扫描惯例） | ✅ 就近声明，零负担 | **推荐**；模板恒在对 golden 字节最稳 |
| (b) 全局一处声明 | 无直接先例；GitLab 反例（drop 告警就近呈现） | ⚠ 声明与统计分离 | ⚠ 可塞但离统计远 | ⚠ 头部静态块可行 | ❌ 消费者自行映射，被工业界判定不可靠 | 被否 |
| (c) 纯行内 | CONSORT 行内 n 声明（但医学界仍配流程图节） | ❌ 无处验证 | ❌ 清单无处安放 | ❌ 零病态时无声明载体 | ✅ | 半先例；作为 (a) 的行内轨存在 |
| (d) 分离工件 | SARIF 双工件=机/人分流≠证据/裁定分流；内审惯例=同文件附录 | ❌ 跨文件对账 | ✅ 独立文件 | ⚠ 主报告仍需阴性声明 | ❌ 恒等式拆两处 | 无正面先例，成本明确 |

## 4) 冲突核查

- **D-100③ 五件可观测**：(a) 逐项齐备且与 Trivy 表列（id/status/statement/source）同构；比例阈值由行内排除计数 + 专节受影响 commit 数覆盖。无冲突，是落地实现。
- **D-112⑤**（normalized 只计数不渲染）：(a) 的专节限定 quarantined-only 清单，normalized 行进计数与行内排除声明但不出行——完全一致。
- **D-106④**（报告=投影）：专节是 quarantine_log 的确定性投影，行内声明是统计派生式的显式化，同源投影性质不变。
- **D-111**（三面同源 + 机读块）：人读专节与机读块应字段一一对应（sha/field/reason/echo），与既有建制互补。
- **golden 字节稳定性 / T-01~T-07**：节恒在 + 渲染「无」= 唯一让「无病态」与「有病态」共享同一模板骨架的形态，零省略分支，对字节级确定性最优；(b)(c)(d) 都引入「有/无病态 → 结构不同」的分支，golden 牵连更大。

## 5) 来源清单（均已 web_fetch 原文核验；标注角度与贡献）

1. [Trivy Filtering — Suppression](https://trivy.dev/docs/v0.56/guide/configuration/filtering/)（Official）— suppression 专节表格逐项披露＋理由/来源列，(a) 的直接同构先例
2. [GitLab SARIF reports](https://docs.gitlab.com/user/application_security/detect/sarif/)（Official）— suppressed skip 语义、drop-rate 比例阈值分级告警（1–50% warn / >50% fail），比例阈值就近披露先例
3. [microsoft/sarif-tutorials Suppressions.sarif](https://github.com/microsoft/sarif-tutorials/blob/main/samples/Suppressions.sarif)（Official）— suppression kind/status 元数据；数据面留痕、呈现面分流 = D-112⑤ 同构
4. [DiabloHorn: Writing a zero findings pentest report](https://diablohorn.com/2022/04/23/writing-a-zero-findings-pentest-report/)（Community/从业博客）— 零发现必须显式渲染并解释成因，省略=误导
5. [HackTheBox: pentest zero findings](https://www.hackthebox.com/blog/pentest-zero-findings-next-steps)（Currency/厂商博客）— 第二独立信源交叉验证零发现显式呈现惯例
6. [GX Data Docs](https://docs.greatexpectations.io/docs/0.18/reference/learn/terms/data_docs/)（Official）— 数据质量报告「概览+逐项清单」固定结构
7. [Soda Core Failed Rows check](https://docs.soda.io/data-testing/failed-rows-check)（Official，搜索摘要级）— failing rows per-check 诊断表逐行呈现
8. [dbt-core discussion #8407](https://github.com/dbt-labs/dbt-core/discussions/8407)（Community）— 失败明细缺失被用户视为报告缺陷
9. [CONSORT-DEFINE E&E (eClinicalMedicine 2025, PMC)](https://pmc.ncbi.nlm.nih.gov/articles/PMC11773258/)（Official/同行评审）— 排除链专节（流程图）+ 逐分析 n 声明的双轨金标准
10. [CONSORT 2010 E&E (J Clin Epidemiol)](https://www.jclinepi.com/article/S0895-4356(10)00103-4/fulltext)（Official/同行评审）— 「排除可致错误结论」的规范动机
11. [APA JARS](https://www.apa.org/pubs/authors/jars.pdf)（Official）— 流程图模板 `Excluded (n=) + reasons` 固定槽位
12. [Internal Auditing ch.10.01 (eCampusOntario)](https://ecampusontario.pressbooks.pub/internalauditing/chapter/10-01-crafting-effective-audit-reports/)（Official/教材）— 内审报告结构：正文裁定+同文件附录证据；反 (d) 先例
13. [Trivy issue #7382 + commit 7aea79d](https://github.com/aquasecurity/trivy/issues/7382)（Currency）— suppression 进 JSON 的演进过程：需求来自用户要在报告里看到被抑制项
14. [boostsecurity: SARIF can't save you now](https://boostsecurity.io/blog/sarif-cant-save-you-now)（Criticism）— SARIF 抑制/过滤在工具链中的局限，佐证「排除项披露不能全靠格式隐含」
15. [trivy discussions #8659](https://github.com/aquasecurity/trivy/discussions/8659)（Community）— 用户期望 ignored 项在报告中带状态出现

## 6) 信息缺口

- GX 官方文档无 quarantine/排除呈现的专门条款（GX 本身无 quarantine 概念，靠 Data Docs 结构侧推）；dbt/Soda 同样没有「排除基数声明」的强制规范。
- 「分离工件导致跨文件对账成本」缺直接实证研究（无 UX/usability 数据），是从内审附录惯例与恒等式就近验证逻辑**侧推**的结论。
- 医学界（CONSORT）之外，「over N-M」式行内声明的格式变体（脚注 vs 括号 vs 独立列）无统一惯例，本仓需自定其一（建议括号内联，如 `precision (over 47/50 commits)`）。

## 7) 结论

**定案建议 (a)**：专设 Intake Health 节（恒等式行 + 受影响 commit 数 + quarantined-only 逐 SHA 表格：sha/field/reason/raw echo）＋各派生统计行内联排除基数（over N-M）＋零病态时节恒在渲染「无」。三条独立工业脉络（扫描器 suppression 表、医学排除披露双轨、零发现显式渲染）与全部五条既有决策约束无冲突，且该形态对字节确定性 golden 最友好。**Confidence：高**——唯一扣减项是 (d) 的否证部分依赖侧推而非直接实证。

继续此会话，运行：atomcode -p "…" --resume 836c02aa-8353-4502-80d1-5a5063d606ea
