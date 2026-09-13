# 24 — atomcode 深度调研（carrier 状态与落位说明）

> 本节为落位说明；atomcode 成稿正文在下方分隔线之后，未作改写。综合段（心智模型映射 / 冲突点名 / 校准输入建议）为 agent 综合，已显式标注。

| 项 | 值 |
|---|---|
| 提示词留档 | `reports/24-atomcode-prompt.md` |
| 成稿路径 | 本文件（正文 = 两轮 atomcode 深研模式输出，2026-09-14） |
| carrier | atomcode 5.0.9 真实执行 ×2 串行（ctx_batch_execute concurrency=1，共享配额；无 carrier 缺口、无 resume） |
| 轮 1 | 审计/审查类产品「第一份真报告」先例 —— searches 13+（web_search×2 / Tavily×3 / AnySearch×8），原文读 9 次（8 web_fetch + 1 tavily_extract），15 源，Sufficiency Gate 自查通过 |
| 轮 2 | B 层 kill criterion 多仓迁移有效性 —— searches 6（Exa×3 / Tavily×2 / AnySearch×1），全文读 8 次（含 Just 2014 / Papadakis 2018 / ISO 13528 三篇 PDF 深读），13 源；另有 ctx 知识库命中前轮已核验材料（ICH E10 全文 / NIST Juliet / pitest / Stryker / Google mutation 两文）直接复用 |
| 调研模式 | default ×2（完整配额） |
| 本地接地 | 已读 D-016/017/018（macro-audit 账本 L248/L259/L266 current）、ADR-0012/0013、spec.md §R3-D6、CONTEXT.md 相关术语（Value Validation Loop / Acceptance Gate / Kill Criterion / Positive Control / Receipt）、票 23 首报产物（23-first-report.md/.json、23-gates.json、23-report.md §4 缺口段）、macro-audit 2026-09-12-report.md §12（16 项缺口登记表） |
| 边界声明 | 调研结论只作「校准输入」：不阻塞首报、不改写首报任何判定（A-028 显式约束 / spec §R3-D6）；校准输入映射只指向既有 16 项缺口编号（见 `reports/24-calibration-map.md`），未新造缺口 |

---

# 轮 1 · 代码审计类产品「第一份真报告」的工业先例调研（atomcode 成稿）

> 调研对象：票 24（A-028 / spec §R3-D6）—— R3-Q1 §7 登记的定向调研原文：「审计/审查类产品第一份真报告的专项先例（如 CodeScene/Structure101 早期史）未检索到高信源，建议在阶段 1 执行时对同类（CodeScene 行为分析、GitClear）补一轮定向调研」
> Sufficiency Gate：searches 13+（web_search×2、Tavily×3、AnySearch×8条）｜ angles: Official / Comparative / Community / Currency ｜ full reads: 8 次 web_fetch + 1 次 tavily_extract

## 1) 执行摘要（Tl;dr）

四个产品的「第一份真报告」都遵循同一个模式：**报告本身不是卖点，报告背后的校准数据才是卖点**。CodeScene 的首报以书 + 书中真实案例仓库的 hotspot/Code Health 可视化形态出现（Confidence 高，两源）；GitClear 拒绝在指标通过内部 3 年研发「嗅探测试」前向客户展示，首报的可信度完全押在 Diff Delta 与 Completed Story Points 的相关性上（Confidence 高）；Structure101 用大客户名单（Expedia、Credit Suisse 等）+ DSM 依赖矩阵作为早期可信度凭证（Confidence 中高，主要靠 InfoQ 一手采访）；Sonar 则靠开源 dogfooding + 社区下载量证明报告不是空话，首个付费客户是其最著名的可信度轶事（Confidence 高，官方一手回忆录 + Wikipedia 交叉）。**「阈值重校准」在四家中都存在，但证据强度不同：CodeScene 最显式（300 个代码库基线 + JSON 权重文件），GitClear/Sonar 隐式（版本迭代 + 用户反馈），Structure101 证据最薄。**

## 2) 分点结论

### CodeScene（公司 2015 年成立，工具 2016 年发布）

**首报形态**：不是独立「报告产品」，而是《Your Code as a Crime Scene》(2013) /《Software Design X-Rays》(2018) 两本书中嵌入的真实仓库案例——书中案例用 CodeScene 免费版可视化，是 Wikipedia 明确记载的事实【Wikipedia CodeScene】。首报的核心口径是两个判据：**hotspot（复杂度 × 变更频率的交集）**和 **Code Health（1-10 分，25+ 因子聚合）**。

**可信度机制**：
- Adam Tornhill 自述「自 2015 年以来分析了约 300 个代码库（多为 500k–1M LoC）」——报告判据的权重直接来自这批服务的基线数据【codescene.com/blog/3-code-health-kpis】；
- 「我们基于过往分析过的数百个代码库，看到了反复出现的、与维护成本相关的模式，于是教会工具自动检测这些模式（code biomarkers）」——这是把咨询经验回流进产品判据的显式表述【codescene.com/blog/code-biomarkers】；
- 终极可信度锚点是同行评审论文 **Code Red（Tornhill & Borg, 2022, arXiv:2203.04374，发表于 International Conference on Technical Debt 2022）**：39 个专有生产代码库、30,737 个文件，量化出「低质量代码缺陷多 15 倍 / 修复时间长 124% / 周期时间最大值高 9 倍」【arxiv.org/abs/2203.04374 已读原文摘要】。

**回流校准机制**（三个显式回路，全部有文档出处）：
1. **阈值重校准**：官方文档明说「Code Health 规则是对真实世界代码库校准的（calibrated against real-world codebases）」，且暴露两级用户控制——函数级 `@codescene(disable:...)` 源码注释指令 + 仓库内 `.codescene/code-health-rules.json` 权重文件（可把某条规则权重调到 0.5 或 0.0）【codescene.io/docs/guides/technical/code-health.html 已读原文】；
2. **透明度反滥用回路**：指令使用本身会在虚拟 code review 里生成非阻塞警告（「directives fly under the radar – transparency is key」），防止用户借「误报」通道静默关闭真问题——这本质上是一个**误报率上报回路**的自律机制；
3. **KPI 形态演化**：2021 年从单一 Code Health 分数演化为三 KPI（Hotspot Code Health / Average Code Health / Worst Performer），理由是「单一 KPI 无法刻画大型代码库」——这是实测数据反推判据增删的直接证据【codescene.com/blog/3-code-health-kpis】。

### GitClear（公司背景 Alloy/Bonanza 2008 年起，产品 2019 年毕业 beta）

**首报形态**：直到 Diff Delta 通过内部「嗅探测试」才见客户——About 页原话：「**花了 3 年全职内部研发，才让 Diff Delta 达到可以拿给客户看的程度（2019 年）**」，并自嘲对手是「sharp-looking graphs backed by half-baked data sources」【gitclear.com/about 已读原文】。首报的可信度口径非常明确：「我们证明了 Diff Delta 与 Completed Story Points 的相关性比任何其他 git 指标都强」——即拿客户自己的项目管理数据当外部真值。

**可信度机制**：
- 指标本身按七类代码操作分类（新增/删除/移动/更新/字符串替换/复制粘贴/no-op），有公开的 Diff Delta 文档定义口径【gitclear S3 PDF，tavily 已读；arc.dev 二手转述交叉】；
- 每条差异可下钻：「我们从零重写了整个 diff viewer，让开发者自己核实 Diff Delta 的每个细节是怎么加出来的」——**可下钻性就是验收机制**【gitclear.com/about】；
- 纵向研究报告的样本量声明：「截至 2025 年 1 月，已分析并分类约 10 亿行代码（2020 年起），其中 2.11 亿行为有效变更」【gitclear-public S3 的 AI Copilot Code Quality 2025 PDF】。

**回流校准机制**：Diff Delta 是**活指标**——官方帮助中心有专文「When and why does Diff Delta change after being calculated?」(Bill Harding 署名)，说明因子会随数据回流重算；此外官方明确给出**样本量门槛的自我审查**（基准研究中关于 Diff Delta–收入相关性的段落：「tl;dr 在我们有 10 个样本点之前别太当真」）——罕见地公开承认自己数据的置信边界【gitclear S3 PDF 已读】。历史上指标从「Line Impact」改名为 Diff Delta，也是判据重定义的实锤。

### Structure101（Headway Software，1999 年底成立，v2 于 2006-10 报道）

**首报形态**：交互式依赖图 + DSM（Dependency Structure Matrix）+ 架构 transformed view + 构建期快照对比；违规计数本身即可验收（agileblogs 2011 示例）。

**可信度机制**：点名大客户（Expedia / Credit Suisse / 军方等）+ 客户画像数据作早期可信度凭证；证据主要靠 InfoQ 2006-10-10 对 Chedgey 的一手采访【infoq.com/news/structure101-v2】。

**回流校准机制**：隐式——多年分阶段发布；无公开的阈值重校准/误报回路记录。证据强度四家最薄。

### Sonar / SonarQube（开源项目 2007 年起，公司 2008-11-13 注册）

**首报形态**：不是报告而是**质量仪表盘**——七轴（潜在 bug、编码规则、测试、重复、注释、架构/设计、复杂度），初期是聚合既有 OSS 工具（Checkstyle/PMD 等）+ 两个自有特性：**单一配置驱动多工具 + 数据库存历史信息**【Olivier Gaudin 官方 17 周年回忆录 2025-11-13，原文已读；Security Boulevard 同文转载交叉；Packt《Sonar Code Quality Testing Essentials》交叉】。

**可信度机制**：
- **Dogfooding + 开源社区**：「我们每天用自己的产品解决自己的需求……release early, release often，靠社区反馈驱动」【官方回忆录一手】；
- **社区采用量**：2010 年开源项目月均下载超 2000 次【Wikipedia Sonar (company)】；
- **最著名的首单轶事**：第一个付费功能（Developer Cockpit）上线一周就卖给一家财富 500 强——而他们根本不知道对方已在用 Sonar，发票编号故意写成 F0000242 冒充不是第一个客户。这是「报告/仪表盘先行被真实使用、付费验收滞后」的极端案例【官方回忆录】。

**回流校准机制**：Gaudin 明说初期依赖外部工具后发现「数据的质量和深度是关键，不能依赖外部工具」，于是自研分析器直到拥有全栈（符号执行、语义分析、数据流分析）——这是**判据增删的根本动因来自实测质量不满**的直接表述。后续的量化锚点：InfoQ 2012 报道 Sonar 3.0 引入商业版 + Developer Cockpit；如今官网宣称误报率 3.2% 作为可信度口径【sonarsource.com 搜索摘要，未全文核验，标注为二手】。质量门(Quality Gate)机制实质是「把验收标准交还给用户定义」，Sonar 只保证测量的一致性。

## 3) 对比矩阵

| 项 | 首报公开形态 | 首报可信度口径 | 数据回流/重校准机制 | 证据强度 |
|---|---|---|---|---|
| **CodeScene** | 书中真实仓库案例（书 + 工具互证），hotspot + Code Health(1-10, 25+ 因子) | 约 300 个咨询代码库基线；后加同行评审论文 Code Red(2022, 39 个代码库) | 显式：JSON 权重文件 + 源码指令（用户可关/降权规则，但指令自身会被警告上报）+ 三 KPI 演化 | 高（论文一手 + 官方文档一手） |
| **GitClear** | 拒绝提前亮相：3 年内部研发后才见客户（2019 毕业 beta）；七类代码操作分类的 Diff Delta | 与客户 Story Points 的相关性验证 + 可下钻 diff viewer 让用户自查 + 10 亿行语料声明 | 显式：指标算后可随因子回流重算（官方专文）；公开承认样本量置信边界（「10 个样本点之前别当真」） | 高（官方一手，含自我审查表述） |
| **Structure101** | 交互式依赖图 + DSM + 架构 transformed view + 构建期快照对比 | 点名大客户（Expedia/Credit Suisse/军方等）+ 客户画像数据；违规计数本身可验收 | 隐式：多年分阶段发布；无公开的阈值重校准/误报回路记录 | 中（仅 InfoQ 一手采访，二手示例补位） |
| **Sonar** | 质量仪表盘（七轴），聚合 OSS 工具 + 历史数据库 | 开源 dogfooding + 月下载量(2010 年 2000+) + 「用了就扔掉自研轮子」的社区口碑 | 判据增删动因：外部工具数据质量不足 → 全栈自研；质量门交还用户定义；今以 3.2% 误报率为口径 | 高（官方一手回忆录 + Wikipedia/Packt 交叉；3.2% 数字为搜索摘要二手） |

## 4) 完整来源清单

| # | 标题 | URL | 抓取角度 | 日期 | 贡献 |
|---|---|---|---|---|---|
| 1 | Code Health and Biomarkers for Software (Adam Tornhill) | codescene.com/blog/code-biomarkers | Official | 2020-01-02 | biomarkers 定义、Code Health 1-10 口径、「数百个代码库经验回流进工具」原话 |
| 2 | Code Health 文档 | codescene.io/docs/guides/technical/code-health.html | Official | 长期文档 | 校准声明、@codescene 指令、JSON 权重文件、透明度警告回路、三 KPI |
| 3 | Three Code Health KPIs (Tornhill) | codescene.com/blog/3-code-health-kpis | Official | 2021-08-16 | 「约 300 个代码库」基线数字；KPI 判据增删的演化记录 |
| 4 | Code Red 论文页 | arxiv.org/abs/2203.04374 | Official(学术) | 2022-03-08 | 39 代码库 / 30,737 文件 / 15× 缺陷 / 124% 修复时间 / 9× 周期时间 |
| 5 | CodeScene - Wikipedia | en.wikipedia.org/wiki/CodeScene | Official(二手) | — | 2016 年发布；书中案例用免费版做可视化 |
| 6 | GitClear About | gitclear.com/about | Official | — | 3 年研发后才见客户(2019)；diff viewer 自查机制；Story Points 相关性口径 |
| 7 | Diff Delta Benchmark Research (PDF) | gitclear-public.s3.us-west-2.amazonaws.com/Diff+Delta+Benchmark+Research.pdf | Official | 2023-02-02 | 基准研究形态；「10 个样本点之前别太当真」的自我审查 |
| 8 | GitClear AI Copilot Code Quality 2025 (PDF) | gitclear-public S3 | Official | 2025-01 | 10 亿行语料声明、七类代码操作定义、2020 年起分类 |
| 9 | Structure101 v2 (Floyd Marinescu 采访 Chedgey) | infoq.com/news/structure101-v2 | Community(一手采访) | 2006-10-10 | 首报形态(DSM/transformed view/快照对比)、大客户名单、Headway 建于 1999 底 |
| 10 | Using Structure101 (博客) | agileblogs.wordpress.com | Community | 2011-09-25 | 违规计数作为报告形态的实例 |
| 11 | Sonar 17 周年回忆录 (Olivier Gaudin) | sonarsource.com/blog/sonars-17-year-anniversary | Official | 2025-11-13 | 首报形态(七轴仪表盘)、dogfooding、首个付费客户 F0000242 轶事、全栈自研动因 |
| 12 | Sonar (company) - Wikipedia | en.wikipedia.org/wiki/Sonar_(company) | Official(二手) | — | 2008 成立、2010 月下载 2000+，交叉验证回忆录 |
| 13 | Sonar Quality Dashboard 3.0 (InfoQ) | infoq.com（经搜索摘要定位） | Community | 2012-05-30 | 商业版与 Developer Cockpit 的时间点（引用未全文读，作时间锚点） |
| 14 | Sonar 17 周年转载 | securityboulevard.com/2025/11/... | Official(转载) | 2025-11-13 | 回忆录全文交叉验证 |
| 15 | arc.dev 对 GitClear 报告的转述 | arc.dev/talent-blog/impact-of-ai-on-code | Community | — | 七类代码操作定义的二手交叉验证 |

## 5) 信息缺口（仍不知道什么）

1. **Structure101 2006 年之前（v1 时期）的首报形态**没有找到一手材料——InfoQ 的 v2 报道是最早的可回查英文报道，更早的只有 Headway 自述「建于 1999 年底」。如需更早，可能要翻 2003-2005 年的 JavaOne 材料或 archive.org。
2. **GitClear 首个付费客户是谁**：About 页没有讲 Sonar 式的首单故事；Diff Delta 与 Story Points 的「相关性验证」原始研究页（Diff Delta™ correlation research）存在但本轮未展开抓取。
3. **Sonar 早期质量门阈值（如 SQALE 技术债比率）的标定数据**：SQALE 方法论（2010 年前后）有独立文档，但本轮未深挖，其阈值重校准的公开记录未找到。
4. **三家（非 CodeScene）都没有公开的「误报率上报回路」工程化设计**——CodeScene 的指令警告是唯一接近的机制；Sonar 的 3.2% 误报率是结果声明而非回路文档。**「误报率上报」作为产品机制，在这批先例中基本是空白**——这本身可能就是对标调研中值得记录的结论：先例证明的是「校准数据基线 + 可下钻 + 论文背书」三板斧，而非误报上报基础设施。

**Confidence 总评**：高（每条关键结论均有 ≥2 个独立信源或一手官方原文支持；Structure101 早期史为中等置信）。

---

# 轮 2 · 多仓迁移下「正对照 + 预声明 kill criterion」验收闸门的有效性复核（atomcode 成稿）

> 调研对象：票 24（A-028 / spec §R3-D6）—— R3-Q3 §7 缺口 4 原文：「mutation testing 文献对正对照得分与真实检出率的相关性给出的是实证支持而非理论保证，对本产品 B 层的迁移有效性需在阶段 2 用更多仓样本复核」
> Sufficiency Gate：searches 6（Exa 3 + Tavily 2 + AnySearch 1）｜ angles: Official / Comparative / Criticism / Currency / Community 五类全覆盖 ｜ full reads: 8（含 2 篇 PDF 深读）＋ ctx 知识库前轮已核验材料复用

## 1) 执行摘要（Tl;dr）

**这套闸门迁移到多仓是站得住的，但四个方法论领域都给出了同一个关键警告：正对照命中是「本批结果可判读」的必要条件而非充分条件，且判据（判读阈值、对照集）本身会随仓与工具的漂移而失效，必须版本化并预设追加触发条件。** Just et al. 2014 及后续复制链的证据强度为「中等且有条件」：突变分数与真实缺陷检出确实存在独立于覆盖率的正相关（高置信），但 Papadakis 2018 证明该相关大部分由测试套件规模混杂驱动，控制规模后只剩弱-中等相关——因此正对照只能锚定仪器灵敏度，不能把 mutation score 当作真实缺陷检出率的充分统计量（高置信，多源汇聚）。**Confidence：总体高**——四条方法论线（mutation 文献、ISO 13528、ICH E10、OWASP Benchmark）独立汇聚到同一设计结论；唯「证据强度」的定量结论因复制异质性标为中。

## 2) 分点结论（每条标注来源）

**E1. 正对照（KAT）的角色是「验证仪器」而非「检验假设」——四个领域完全一致，且都明确要求正对照与真判据分离记分。**
- NIST CAVP 将 Known Answer Test 向量列为实现验证标准手段，且注明其「不替代完整验证」（知识库前轮已核验 NIST CSRC）；
- ISO 13528：每批能力验证都带已知值质控样品，质控结果不计入被测样品结果，只决定本批是否可信（ISO 13528 全文镜像，全文深读 ✓）；
- ICH E10 §1.5：assay sensitivity 由已知有效活性对照臂锚定，缺正对照臂时「无效」不可判读——无法区分「药无效」与「试验无灵敏度」（知识库前轮核验 E10 原文）；
- 映射到多仓：**正对照批未命中 ⇒ 本批全仓结果作废（仪器失效），而不是「仓干净」**。这是多仓迁移中最容易丢掉的语义——单仓时人肉能分辨，多仓自动化流水线会把「全绿」误读为「全干净」。

**E2. mutation 文献的证据链：正相关成立但被规模混杂污染，复制研究异质性大——「有效但非充分」是文献收敛点。**
- Just et al. FSE 2014（摘要页全文已读 + PDF 深读）：357 个开发者修复的真实缺陷、5 个项目、32.1 万行代码、230,000+ 突变体；结论——突变检出与真实缺陷检出存在**独立于代码覆盖率的统计显著正相关**，且强于语句覆盖率与真实缺陷检出的相关；耦合效应覆盖 73% 的真实缺陷；**17% 的真实缺陷不与任何突变体耦合**（这部分上 mutation 结果不可外推），10% 需要新的/更强的突变算子。
- Papadakis et al. TSE 2018（PDF 深读）：正文原文——「突变分数与真实缺陷检出的相关显著但**比文献报告的弱得多**；控制测试套件规模后所有相关都退化为弱或最好中等」；`mutants seem to be relatively unreliable substitutes of real faults`——但最高分段测试套件的缺陷检出仍有显著提升，即突变分数可提供有价值信号。
- 复制异质性：Andrews et al. ICSE 2005 结论为突变体接近真实缺陷（且与人工播种缺陷不同）；Namin & Kakarla 复制同一 Space 对象得出弱相关、换 Java 类则相关强（此复制分歧直接记录在 Just 2014 PDF 相关工作节，已读 ✓）。
- 最新 ISSTA 2026 复制研究（arXiv:2607.22880 全文已读）：相关性**高度依赖场景**——回归式场景（代码假定无 bug）下 mutation score 有信号；被测代码本身可能有 bug 的场景下 mutation 分析「不适用」。
- **对闸门的含义**：正对照（种子缺陷/突变体）命中的证据效力是「中-强、有条件」——它足以做仪器自检与门禁下限，但「真判据全未命中」不能反推「测试套件质量合格」，只能说「未超出门禁下限」。

**E3. ISO 13528 的多站点复核模型直接给出多仓迁移的三个硬规则。**（全文镜像深读 + Shapypro z-score 解读实践，双源）
- **规则一（判据独立性）**：指定值与评定判据应尽可能**独立于参与者结果**事前设定——「总体而言，独立于参与者结果选择指定值与评定判据更有优势」。映射：复核判据在跑批之前 commit 入库、版本锁定，跑后调整即方法学违规。
- **规则二（可比性）**：z-score 评定带 |z|<2 满意 / 2≤|z|≤3 可疑 / >3 不满意；当指定值本身来自参与者结果的鲁棒统计时，分数与个体结果**相关**（原文 §9.5.1 明确警告）。映射：若各仓基线由自身历史数据算出，仓间分数不可直接横向比较；跨仓比较必须经过共享对照集的标准化。
- **规则三（判据适配）**：评定标准差 σ_pt 应反映预期的「实验室间」变异，且按「特定最终用途」选取。映射：不同仓族（语言/框架/测试成熟度）的通过阈值不应共用一个数，应按仓族分层设定。

**E4. ICH E10 给出「全未命中」情形的唯一可判读解法：三臂结构。** 正对照臂（已知有效）+ 安慰剂/负对照 + 试验臂（真判据）。缺正对照臂时 null 结果不可判读——这正是 B 层判据（前轮知识库已核验 E10 全文）在多仓下必须逐批重跑而非一次性验证的原因：**assay sensitivity 是批次属性，不是系统属性**。

**E5. OWASP Benchmark 的跨工具/跨版本经验给出了判据迁移的三种已知失效模式——这是多仓迁移最直接可借鉴的前车之鉴。**（官方页全文已读 + Matthias Rohr 批评文全文已读，双源交叉）
- **失效模式 A：判据版本混用**。v1.1（21,041 用例）与 v1.2（2,740 用例）差异巨大，但官方结果图上工具分数「有对 v1.1 跑的、有对 v1.2 跑的」，横向对比失效。映射：**复核结果只在同一判据版本内可比，判据版本号必须随每次跑批记录**。
- **失效模式 B：对照集公开导致判据调参（gaming）**。FindBugs Security Plugin 分数从 v1.4.0 的 11.65% 涨到 v1.4.6 的 39.1%——作者直接对着公开基准调工具；`Being good at the Benchmark does not necessarily mean vulnerability detection in actual web apps improved`。映射：**对照集若长期不变且完全公开（在仓内可读），管线会被针对性规避（如在模式匹配处加注释绕过审计规则）**——需要部分私有/轮换的对照样本。
- **失效模式 C：判据覆盖面与真实分布脱节**。官方自认：仅 11 个 CWE、纯 Java servlet、无框架（Spring/Hibernate）、无认证/访问控制/业务逻辑类缺陷——100 分也只覆盖一个基线。映射：正对照集必须按各仓真实缺陷形态（历史缺陷库）抽样构造，而非通用缺陷模式；否则正对照命中 ≠ 该仓缺陷形态下仪器有效。
- 官方给出的评分判据本身值得复用：TPR/FPR + **Youden Index**（灵敏度+特异度−1，源自诊断医学），显式排除「全报」与「全不报」两个平凡解（官方页已读 ✓）。

**E6. 工业界已有的多仓/基线基础设施可复用其语义。** Stryker 的 baseline 机制（`with-baseline`：分支无基线时 fallback 到目标分支基线，再无则全量跑并保存为新基线——官方配置文档，知识库前轮已核验）本质上是「逐仓基线 + 缺失时全量校准」的工程实现；pitest 作者反对事后分数门、主张前置使用的论点（知识库前轮核验）与 ISO 13528 判据事前独立原则同构。

## 3) 对比矩阵：四个领域的判据有效性复核机制

| 领域 | 正对照形态 | 判据事前独立性机制 | 多站点/多样本可比化手段 | 已知失效模式 |
|---|---|---|---|---|
| Mutation testing（Just 2014 系） | 突变体=种子缺陷；73% 真实缺陷有耦合突变体 | 正对照在测试套件写好后注入，先于门禁判定 | 无内建——相关强度依赖单仓数据，跨仓外推无文献背书 | 17% 缺陷不可表示；规模混杂（Papadakis 2018）；场景依赖（ISSTA 2026） |
| ISO 13528 能力验证 | 已知值质控样品，每批同跑、不计入被测结果 | 指定值与 σ_pt 事前按最终用途选定，独立于参与者结果 | z-score 标准化到共享指定值；指定值不确定度大时用 z′/En 分数 | 指定值来自参与者结果时分数与个体相关（§9.5.1 自警） |
| ICH E10 临床试验 | 已知有效活性对照臂 | 正对照臂写入试验方案（预注册） | 多中心统一方案+统一对照臂 | 无正对照臂 → null 不可判读（assay sensitivity 缺失） |
| OWASP Benchmark | expectedresults CSV：每例标注真/假漏洞 | 答案表与评分器随版本发布并固定 | Youden Index 统一评分；官方 scorecard 跨工具生成 | 版本混用（v1.1 vs v1.2）；公开对照集被调参；覆盖面与真实分布脱节 |

## 4) 可执行的多仓复核计划设计要点

### 4.1 仓样本选择规则（分层抽样，ISO 13528 + OWASP 混合模型）

1. **锚定仓（canary，固定每批必跑）**：选 2-3 个带历史已确认缺陷的仓（缺陷修复 commit 即 ground truth，等价 Defects4J 的做法——Just 2014 的数据集正是这么构造的）。它们承担 E10 意义上的「活性对照臂」：正对照从这些仓的真实历史缺陷抽样构造，**不从通用缺陷模式库生成**（规避失效模式 C）。
2. **负对照样本**：从已确认干净片段构造（Juliet bad/good 配对模式，知识库前轮核验 NIST SARD）。注意前轮调研已识别的缺口：负对照命中不能自动定罪——可能是真发现，须走人工复核路径而非门禁失败。
3. **试验仓（抽样规则）**：按仓族（语言 × 框架 × 测试成熟度）分层；每族内按变更频率/风险排序取 TOP-N + 随机补样。**新增仓首次必全量校准跑**（对应 Stryker 「无基线则全量并保存新基线」语义），之后进 diff-only 抽样（Google TSE 2021 模式，知识库前轮核验）。
4. **部分私有对照**：正对照集中至少一个子集不与被审计代码同仓公开（可放独立仓库/CI secret 注入），防失效模式 B（针对公开对照集的规避）。轮换周期建议随判据版本联动（见 4.4）。

### 4.2 复核判据（三级，全部跑前 commit 入库、版本锁定）

| 级别 | 判据 | 通过条件 | 语义 |
|---|---|---|---|
| L1 仪器自检 | 正对照全命中 | 锚定仓种子缺陷 100% 触发审计路径（或预声明 ≥N/全部下限） | 不通过 ⇒ **本批所有仓结果无效**，修管线后重跑 |
| L2 负对照 | 干净片段零误报 | 0 命中（或预声明容忍带内） | 命中 ⇒ 进人工裁决队列，**不自动定罪** |
| L3 真判据 | 各仓族门禁 | 试验仓命中数 ≥ 该仓族预声明下限 | 仅在 L1+L2 通过的批次里，未命中才是可行动发现 |

跨仓可比化（ISO 13528 规则二）：若需横向比较各仓命中强度，用共享对照集上的标准化分数（仓得分相对对照集基线的 z 形分数），**不用各仓自有 mutation score 直接比**——Papadakis 2018 的规模混杂教训在此表现为「测试套件大的仓天然分数高」。

### 4.3 命中/未中语义（E10 三臂 → 三种判定输出）

- **正对照未命中 = 仪器失效**：本批所有仓的「未发现」一律不可判读（可能是仓干净，也可能是审计盲），输出为管线 ERROR 而非 PASS。这是多仓迁移最容易自动化的错误——单仓时代人肉兜底，多仓全自动流水线必须显式编码。
- **负对照命中 = 待裁决**：预声明裁决规则（例如：负对照命中且定位指向真实代码路径 ⇒ 按真发现处理并回溯对照构造是否出错）。
- **真判据未命中（在 L1/L2 通过的批次内）= 唯一可行动的发现**；真判据命中**不计入**价值判断（KAT 分离原则：正对照只验证仪器）。
- 每次跑批记录：判据版本号 + 对照集版本号 + 工具版本号（OWASP 失效模式 A 的直接对策）。

### 4.4 判据版本追加的触发条件（何时 vN → vN+1）

1. **算子/规则覆盖缺口**：真判据漏报经根因分析追溯到审计规则缺失（对应 Just 2014 的「10% 缺陷需要新算子、17% 不可耦合」），且该缺陷形态在 ≥2 个仓出现 ⇒ 追加规则条目，版本 +1。
2. **锚定仓对照衰减**：锚定仓历史缺陷被重构/删除/依赖变化导致正对照失效 ⇒ 重新抽样对照集，版本 +1（对照集与判据版本绑定发布，禁止混用——OWASP 失效模式 A）。
3. **仓族形态迁移**：某仓族引入新框架/语言/范式（OWASP 失效模式 C：通用 servlet 对照对 Spring 无效），现有正对照不再代表该族缺陷形态 ⇒ 为该族追加专属对照。
4. **gaming 证据**：对照集分数持续上升而真实发现率持平/下降（FindBugs 11.65%→39.1% 的形态）⇒ 轮换对照集 + 启用私有对照子集。
5. **复制证据更新**：突变体-真实缺陷相关性的新文献结论（如 ISSTA 2026 的场景依赖性）直接否定当前判据的前提假设 ⇒ 重新评审判据，此为最罕见的触发。
6. **禁止事项**：跑批结束后为让本批通过而调整判据阈值 = ISO 13528 语境下的方法学违规；只能追加版本并对历史批次做双判据重放，不得追溯修改。

## 5) 完整来源清单（本轮真实核验）

| # | 标题 | URL | 角度 | 日期 | 抓取深度 | 贡献 |
|---|---|---|---|---|---|---|
| 1 | Just et al. — Are Mutants a Valid Substitute for Real Faults? | https://homes.cs.washington.edu/~rjust/publ/mutants_real_faults_fse_2014.pdf | Official | FSE 2014 | PDF 深读（Tavily extract） | 357 真实缺陷/73% 耦合/17% 不可表示/独立于覆盖率的显著正相关；复制异质性（Namin & Kakarla）记录于相关工作节 |
| 2 | 同上摘要页（Ernst 出版页） | https://homes.cs.washington.edu/~mernst/pubs/mutation-effectiveness-fse2014-abstract.html | Official | 2014 | 全文已读 | 摘要级确认实验规模与结论 |
| 3 | Papadakis et al. — Are Mutation Scores Correlated with Real Fault Detection? | https://coinse.github.io/publications/pdfs/Papadakis2018hi.pdf | Criticism | TSE 2018 | PDF 深读 | 控制套件规模后相关退化为弱-中等；`relatively unreliable substitutes` 结论原文 |
| 4 | Zhao, Zhou & Cohen — LLM 测试生成的覆盖/突变相关性可复制性研究 | https://ar5iv.labs.arxiv.org/html/2607.22880 | Currency | ISSTA 2026（2026-06-25 收稿） | 全文已读 | 相关性场景依赖：回归场景有效、buggy-code 场景 mutation 不适用 |
| 5 | Matthias Rohr — OWASP Benchmark 的关键发现与局限 | https://matthiasrohr.de/2019/10/06/ast-tool-evaluation-key-findings-and-limitations-of-owasp-benchmark-project/ | Criticism | 2019-10（2021-09 更新） | 全文已读 | 三种失效模式：版本混用、公开对照集被调参（FindBugs 11.65%→39.1%）、覆盖面脱节 |
| 6 | OWASP Benchmark Project 官方页 | https://owasp.org/www-project-benchmark/ | Official | 2015 起/v1.2 维护中 | 全文已读 | expectedresults CSV 机制、TPR/FPR+Youden 评分哲学、v1.1/v1.2 用例数对照表、Python 版现状 |
| 7 | ISO 13528 全文镜像（proficiency testing by interlaboratory comparison） | https://www.mwa.co.th/wp-content/uploads/2023/01/proficiency-testing-by-interlaboratory-comparison.pdf | Official | 2015 版（2022 为现行版） | PDF 深读 | §7-8 判据独立性原文、§9.5.1 z′ 分数与「分数和参与者结果相关」的自警告 |
| 8 | Shapypro — ISO 13528 z-score 解读实践 | https://shapypro.com/z-score-proficiency-testing-iso-13528/ | Official（PT 供应商） | 2025-06-12 | 全文已读 | \|z\|<2/2-3/>3 评定带、不满意结果的根因分析与 CAPA 流程（交叉验证 #7） |
| 9 | Gay & Salahirad — How Closely are Common Mutation Operators Coupled to Real Faults? | https://research.chalmers.se/en/publication/536348 | Comparative | ICST 2023 | 摘要级（未全文） | 逐算子耦合率：9.92% 强耦合突变体、51% 缺陷有 ≥1 强耦合突变体 |
| 10 | ICH E10 — Choice of Control Group | https://database.ich.org/sites/default/files/E10_Guideline.pdf | Official | 2000-07 | 知识库前轮全文核验 | §1.5 assay sensitivity、三臂结构、null 不可判读 |
| 11 | NIST SARD · Juliet | https://samate.nist.gov/SARD/test-suites/112 | Official | 2017-10 | 知识库前轮核验 | bad/good 配对=正负对照构造范式 |
| 12 | Practical Mutation Testing at Scale: A view from Google | https://arxiv.org/html/2102.11378v2 | Official | TSE 2021 | 知识库前轮核验 | diff-only mutation + 抑制启发式；多仓规模化的工业先例 |
| 13 | Stryker.NET Configuration（baseline/fallback 语义） | https://stryker-mutator.io/docs/stryker-net/configuration | Official | 维护中 | 知识库前轮核验 | 多分支基线缺失→全量校准→存新基线的工程语义 |

三引擎覆盖：Exa（#1/2/5/6/9 发现）+ Tavily（#1/3/7/12/13 PDF 提取与检索）+ AnySearch（#7/8 发现）；#1、#6、#7 均获得 ≥2 引擎或 ≥2 独立信源支持。

## 6) 信息缺口（开放问题）

1. **ISO/IEC 17043 的 PT 方案设计 Annex B 未深读**：多站点能力验证的方案级设计（轮次安排、样本均匀性检验）只能以 ISO 13528 侧写，17043 本体条款未引证。
2. **OWASP 官方对「工具调参基准」的正式回应未见**：批评（#5）是单方观点，官方立场只有 v1.2 维护说明，未见针对 gaming 的对抗性设计文档。
3. **突变体相关性证据对「审计管线正对照」的外推强度无直接文献**：文献研究的是「测试套件 × 突变体」，本闸门是「审计工具 × 种子缺陷」——结构同构但检测器类型不同，相关强度结论的外推属于推断（已在 4.2 中用「下限门禁而非质量度量」的做法对冲）。
4. **锚定仓的「历史缺陷→可触发审计路径」转换率无先验数据**：Just 2014 的 73% 耦合率是测试套件语境，审计语境下正对照构造成功率需要 pilot 实测——建议首个判据版本 (v1) 附带一次预注册 pilot 记录该数字，作为 v2 的校准依据。

---

# 综合段（agent 综合，非 atomcode 原文）

## A. 心智模型/类比映射（≥2，实给 6）

| # | 类比（成熟心智模型/工具/论文） | 支撑本票哪个设计决策 |
|---|---|---|
| 1 | **CodeScene Code Health 校准三回路**（300 仓基线 + code-health-rules.json 权重文件 + 指令透明度警告） | 支撑「判据回流校准必须显式化」：阶段 2 的 16 项缺口清扫以实测锚为校准数据源（对应 CodeScene 咨询基线），判据调整走版本追加（对应 JSON 权重文件），反滥用需留痕（对应指令警告回路） |
| 2 | **GitClear 「嗅探测试」+ 可下钻 diff viewer + 样本量自我审查** | 支撑首报可信度口径：「每条结论可回查引文 + 可下钻到原始证据」即 GitClear 的 drill-down 验收机制同构；「10 个样本点之前别当真」对应本票「单仓 n=13 ADR 结论不可外推」的置信边界自声明 |
| 3 | **Just et al. FSE 2014 + Papadakis TSE 2018 复制链**（mutants-vs-real-faults） | 直接回答 R3-Q3 §7 缺口 4：正对照↔真判据相关性为「中-强、有条件」实证支持而非理论保证——支撑 D-018 把正对照限定为「管线健康闸、不计入价值判定」的分离记分设计，并给出多仓复核的必要性 |
| 4 | **ICH E10 三臂结构 + ISO 13528 判据事前独立性** | 支撑 ADR-0013 B 层构造（2 正对照+3 真判据+1 负对照）与「阈值跑前写死、跑后禁调」纪律；E10 的 assay-sensitivity-is-batch-property 直接给出多仓复核「每批必跑正对照」的规则 |
| 5 | **OWASP Benchmark 三失效模式 + Youden Index** | 支撑多仓复核计划的防漂移设计：判据/对照集/工具三版本随批记录、对照集部分私有轮换、按仓真实缺陷形态抽样构造正对照 |
| 6 | **Stryker baseline / Google diff-only mutation at scale / NIST Juliet bad-good 配对** | 支撑多仓复核计划的工程语义：新仓首跑全量校准→后续 diff-only；负对照干净片段配对构造 |

## B. 与 current 决策的显式冲突点名

- **无改向冲突**：两轮调研结论与 D-016（四阶段串行、阶段 2 回流清扫）、D-017（三层闸门）、D-018（2+3+1 构造、分离记分、未中=合法数据仅限真判据）方向一致，无 revised。
- **张力点名 1（证据强度边界，非冲突）**：D-018 隐含假设「正对照命中 ⇒ 管线对真判据同样有响应能力」。mutation 复制链（Papadakis 2018 规模混杂、ISSTA 2026 场景依赖）把此外推强度限定为「中-强、有条件」；调研报告 §6 缺口 3 明示文献对象是「测试套件×突变体」而本闸门是「审计工具×种子缺陷」，结构同构但检测器不同。**处置**：多仓复核计划以「下限门禁而非质量度量」对冲（E2/§4.2），不改 D-018 措辞。
- **张力点名 2（先例空白，非冲突）**：审计产品先例中「误报率上报回路」基本空白（r1 §5-4）——本仓 D-006/D-018 已含的「负对照命中走复核路径」设计反而领先先例；该观察只作校准输入记录，不构成对 current 决策的修改建议。

## C. 校准输入建议（→ reports/24-calibration-map.md）

调研结论按启动器 delta 只写「校准输入」段落：每条校准输入指向既有 16 项缺口编号之一（无指向的新观察留在上文信息缺口段，不升格为缺口条目）。逐条映射见 `reports/24-calibration-map.md`；首报判定（TC-1 INCONCLUSIVE / TC-2 RED / TC-3 AMBER / PC 2/2 / NC-1 零命中 / C 层人裁定 supported）一律不改写。

## D. Sufficiency Gate 自查（两轮合并）

- searches：r1 = 13+（web_search×2 / Tavily×3 / AnySearch×8）；r2 = 6（Exa×3 / Tavily×2 / AnySearch×1）+ ctx 知识库前轮已核验复用
- angles：Official / Comparative / Criticism / Currency / Community 五类全覆盖（r2 显式）
- full reads：r1 = 9 次原文读；r2 = 8 次（含 3 篇 PDF 深读）
- 来源总数：15 + 13 = 28 源，全部带 URL 可回查
- gaps：r1 §5 四项 + r2 §6 四项如实明示，未硬凑
