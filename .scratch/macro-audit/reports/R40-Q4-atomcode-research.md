# R40-Q4 atomcode 调研报告存档（守卫退役机制；atomcode -p 同题；Sufficiency：7 searches 本轮+前序 7 存档/4 angles/3+13 full reads；Tavily 配额降双引擎）

# R40-Q4 调研报告：60 件守卫退役机制的工业界心智模型

**sufficiency gate**: searches: 7（Exa×2 + AnySearch×4查询 + 本轮前序会话 7 查询存档） | angles: Official / Comparative / Criticism / Community | full reads: 本轮 3 篇（Sensenmann、SMURF、qaskills characterization）＋前序会话已读 13 源存档（含 LMAX、understandlegacycode、ModernizeSpec、SWE-book ch11/14 等） | gaps: SMURF 论文原版（Hilton et al. 主要是 Google TotT 通俗版已读）；Facebook 公开「test retirement policy」专文不存在（以 ACH/SWE-book 间接证据替代）

## 1) 执行摘要（Tl;dr）

**推荐 (i)：面消亡判据＋manifest 'retired' 类。** Confidence：**高**。它对应的成熟心智模型是业界两条已验证主线的合成：①**「守护面消亡驱动退役」**（Google Sensenmann 的 SCC 判据——测试与被守护代码同命运；strangler-fig 治理的「消费面承接完成=退役合法时点」；golden-master 治理的「更强更窄契约建立后退休 golden master」）；②**「移出运行集≠删除，留档可考古」**（pytest testlist 与仓内容分离同步、protobuf reserved / GraphQL @deprecated 的 deprecated-not-deleted 语义——本仓 CONTEXT「Migration Provenance」词条已原样内嵌此词汇表）。(iii) 的「零 FAIL∧稳定 N 窗」判据撞 R23 恒真纪律（零 FAIL≠无用），且被 Meta ACH 突变测试实证直接证伪（纯覆盖率/通过史判据会丢弃 571 件中 277 件有价值的测试）。(ii) 不立机制会重演 repomix 先例的「处置未建制化」缺口。

## 2) 分点结论

**结论 1：候选 (i) 的两个组件各自有强工业先例，合成无先例冲突。**（来源：Sensenmann 官方博文＋qaskills＋catapult.cx〔前序会话已读〕）
- **判据面**：Google Sensenmann 的核心不是「测试是否还绿」而是「守护对象是否已死」——用构建图分析+Tarjan SCC 找死代码，测试随其守护的库/代码一同删除（每周 1000+ 删除 CL，已删近 5% C++）。qaskills 2026-08 给出 golden-master 专用退役出口：「Retire redundant golden masters after stronger, narrower contracts exist. The exit criterion is not 'the old code has tests.'」——即**退役理由=守护职能被更强机制吸收**，正是题面「被上层机制吸收」的表述。strangler-fig 治理（catapult.cx）同向：「without clear ownership and retirement criteria, façades/adapters become permanent technical debt」——不立显式判据，退役永远挂账。
- **处置面**：pytest 官方讨论 #13213 实证「运行清单与文件本体分离」是标准机制（testlist 不同步是被承认并建制化处理的常态）；GraphQL `@deprecated(reason)`、protobuf `reserved` 是 deprecated-not-deleted 的 schema 级先例——本仓 CONTEXT「Migration Provenance」词条已原生收录这组词汇（retire 出口=账本内 tombstone 留痕，promote 才物理删除）。(i) 的「移出运行集＋manifest retired 类留档」与仓内既有词汇表同构，非外来移植。

**结论 2：候选 (iii) 被仓内纪律和工业实证双重证伪。**（来源：Meta ACH 论文〔AnySearch 检索面〕＋D-076③/D-079＋Sensenmann）
- 仓内：R23/D-079 已立法恒真二值判据——「零 FAIL 历史」恰是恒真守卫的特征而非有用性特征；39-F2 先例（引用物消亡腿）证明零信号守卫需要的是普查探测而非退役推定。
- 工业：Meta ACH 突变测试部署论文实证——若按「覆盖/通过史」单一充分性判据，571 件被保留测试中 277 件本应被丢弃；突变评分反而证明它们有杀伤价值。**通过历史是价值的弱代理**，与 R23 恒真纪律完全同构。Sensenmann 补充另一面：死代码（含死测试）滞留确有真实成本（构建/攻击面/认知负载）——所以成本诉求合法，但**成本判据必须挂在「面消亡」这个客观事件上，不能挂在「没失败过」这个弱信号上**。

**结论 3：候选 (ii) 不是零成本选项。**（来源：catapult.cx＋SWE-book ch14＋repomix 先例）
- SWE-book ch14：「Without clear ownership, a test rots」——Google 的解法是结构化 owner 注记＋自动化，不是逐案裁定。逐案裁定链在 60 件规模下每次退役都烧一轮 grill 带宽，且 repomix 先例已实证「退役发生时无建制=处置形态临时发明、不可复制」。
- 但 (ii) 的合理内核（首件退役走裁定链立先例）可吸收进 (i) 的提案通道——(i) 本来就规定 T3 审计窗逐件呈报，首件自然形成先例。

**结论 4：「断言量超工程源码」锐评的工业对照不支持「断言裁军」。**（来源：Fowler TestCoverage〔前序会话已读〕＋LMAX＋SWE-book）
- LMAX（2023）：「覆盖率的第一用途是识别该删的东西」——即测试集治理的对象是**失效/恒真件**，不是体量。Fowler：覆盖率数字本身无叙事价值，虚增与虚减都不是裁军理由。R37 实证（12 件静默红全过 D-094 门、11 改断言＋1 入册、零退役）恰好证明该仓守卫面的病根是「钉住对象合法演化」，是断言维护问题而非存量问题——与业界「suite bloat 治理=逐件 triage 而非批量归档」结论一致。T3 读数 8 件技术债全=卫生债非体量债，同向。

**结论 5：(i) 的「protected_surface+tier 自声明」是 D-159 的自然延伸，且是机检可行性的关键。**（来源：SWE-book ch14 owner 注记＋D-149④＋D-159）
- SWE-book 明言「It is possible to build automation around test owners if this information is recorded in a structured way」——per-test 结构化注记是 Google 已验证的机检路径。(i) 要求每件守卫声明 protected_surface+tier，使「面消亡」从人工判断变为机检条件（引用物存在性 grep——恰是 D-079 恒真普查已在建的同型探测器，可复用）。

## 3) 候选对比矩阵

| 项 | 工业先例强度 | 与仓内 current D-xxx 自洽性 | 残余风险 | 判定 |
|---|---|---|---|---|
| **(i) 面消亡判据＋manifest retired 类＋tier 自声明** | 高：Sensenmann SCC 同命运判据／golden-master 退出口令／strangler 消费面承接／deprecated-not-deleted 四方交叉 | 高：retire-tombstone=CONTEXT Migration Provenance 既有词汇；机检=D-079 探测器复用；enum 扩容=D-037/D-048 版本化先例 | manifest schema 需扩展（走既有版本化通道）；D-094 三分类需划界注记（退役针对绿件、正交于红件三分类） | **推荐** |
| (ii) 不立机制，个案裁定 | 低：SWE-book 明言无结构化治理则 rot；catapult：无显式判据=永久挂账 | 中：形式上零冲突，但 repomix 先例证明个案式处置已失败一次 | 每件退役烧裁定链带宽；处置形态不可复制 | 否（其「首件走裁定链」内核已被 (i) 吸收） |
| (iii) 零 FAIL∧稳定 N 窗退役 | 低：Meta ACH 实证通过史判据丢弃 277/571 有价值测试；无一家采用纯通过史退役 | **冲突**：直接撞 R23/D-076③/D-079 恒真纪律（零 FAIL=恒真特征非无用特征）；D-144 税保留教义反向（两次真漏录证明弱信号判据的代价） | 把恒真守卫合法退役＝拆掉警报器来消灭警报 | 否 |

## 4) 与 current D-xxx 冲突清单（修订协议呈报面）

- **零 revised 候选。** 逐条核查：
  - **D-149**（manifest/era-scoped/静默红）：(i) 是其④「成员进出生命周期」的完成件——D-149 只立了入列（guard-baseline-upgrade-trigger），(i) 补出列。manifest 增 'retired' 处置类=枚举扩容，沿 D-037/D-048 版本化先例，非改向。
  - **D-094**（静默红三分类：修真坏/改断言/入册带锚）：**需划界注记**——三分类处置的是「红守卫」，(i) 处置的是「绿守卫但其守护面消亡」，输入正交。建议按 D-079 先例（成对落盘划界注记）随 (i) 落盘补一行。
  - **D-144**（税保留/裁军驳回）：正支持——(i) 保留全部断言存量，只提供面消亡时的合法出口，与「残余只裁 era-scoped 退役机制扩展」的入门条件逐字吻合。
  - **R23/D-076③/D-079**（恒真纪律）：(i) 的机检判据「protected_surface 引用物缺席」与恒真探测共用同一探测器（引用物存在性 grep），二者合流——一份普查产出两个处置通道（VACUOUS 候选 / retired 候选）。
  - **D-159**（tier 自声明）：(i) 将 tier 从「运行环境声明」扩展为「protected_surface+tier 双字段」。这是 schema 扩展非语义改向，但**须显式呈报**为 D-159 的扩展而非静默改写。
  - **D-102**（可杀性）：正支持——retired 类本身是对「不可杀守卫永久滞留」的出口设计。
  - **D-157**（C2 入门条件）：(i) 的 T3 提案通道即 C2 的审计窗通道，无新增门。

## 5) 完整来源清单

| 标题 | URL | 角度 | 日期 | 贡献 |
|---|---|---|---|---|
| Sensenmann: Code Deletion at Scale | https://testing.googleblog.com/2023/04/sensenmann-code-deletion-at-scale.html | Official | 2023-04-28 | 面消亡判据的最强先例：SCC 图分析、测试与库同命运、死代码滞留成本 |
| SMURF: Beyond the Test Pyramid | https://testing.googleblog.com/2024/10/smurf-beyond-test-pyramid.html | Official | 2024-10-15 | Maintainability 权重证据：维护成本是 SMURF 五维之一，非唯一定夺维 |
| Test Strategy Legacy Code Characterization | https://qaskills.sh/blog/test-strategy-legacy-code-characterization | Comparative | 2026-08-08 | golden master 退役出口判据原文：「更强更窄契约建立后退休」 |
| Software Engineering at Google ch14 | https://abseil.io/resources/swe-book/html/ch14.html | Official | — | 结构化 owner 注记=机检前提；「无 owner 则 rot」 |
| pytest #13213（testlist 同步） | https://github.com/pytest-dev/pytest/discussions/13213 | Community | — | 运行集与文件本体分离的机制先例 |
| Coverage can only show you what to delete (LMAX) | https://technology.lmax.com/posts/coverage-can-only-show-you-what-to-delete/ | Community | 2023-05-01 | 测试集治理对象=失效件非体量（前序会话已读原文） |
| catapult.cx strangler-fig 治理 | （前序会话 batch:atomcode-r13q5 已读） | Comparative | — | 「无显式退役判据→永久技术债」原文引证 |
| Meta ACH 突变测试部署（arXiv） | https://arxiv.org（AnySearch 检索面，ACH/Mutation-as-RAG 论文） | Official | — | 通过史/覆盖判据丢弃 277/571 有价值测试的实证 |
| Rotten green tests / RTj（arXiv 检索面） | https://arxiv.org | Official | — | 恒真族的正确处置=静态/动态探测重构，非退役 |
| Fowler: TestCoverage | https://martinfowler.com/bliki/TestCoverage.html | Criticism | 2012-04-17 | 覆盖率/体量数字无叙事价值（前序会话已读） |
| 本仓 CONTEXT.md「Migration Provenance / Case Tombstone」 | D:\Aworker\6F\CONTEXT.md | 本地 | — | retire≠delete 词汇表已内建（protobuf reserved/GraphQL @deprecated 同构） |
| 本仓 decision-ledger D-079/D-094/D-144/D-149/D-159 | D:\Aworker\6F\.scratch\macro-audit\decision-ledger.md | 本地 | 2026-09 | 冲突核查基线 |

## 6) 信息缺口

1. Facebook/Meta 无公开「test retirement policy」专文——其退役治理只能从 SWE-book 与 ACH 论文间接推断（已标注）。
2. SMURF 原论文（非 TotT 版）未直接读，维护成本模型权重证据以 TotT 官方版＋ACH 实证交叉替代。
3. 「retired 类留档后何时可物理删除」的二次出口（retire→delete 的最终时点）工业界无统一答案——Sensenmann 直接物理删除但 Google 有全量构建图兜底，本仓无同型设施，建议 retired 类终态化（不设二次出口）呈报时明示此为设计选择。

