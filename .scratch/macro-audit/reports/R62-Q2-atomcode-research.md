# R62-Q2 裁定呈报：A-3 账本节标题唯一性守卫立法（归属＋断言范围）

> 载体=atomcode -p（题面存档 R62-Q2-atomcode-prompt.md）｜形态=**真回传**（Indexed 8 sections）｜题面=R62-Q2 A-3 守卫立法。
> Sufficiency Gate：searches: 6（Exa 2 / Tavily 2 / AnySearch 2）| angles: Official＋Comparative＋Criticism＋Community | full reads: 3（MD024 官方 doc @jsDelivr 全文、GitLab cli 配置、SO/PyMarkdown 片段）| 本地一手：decision-ledger.md 全量解析（1985 行、主表 D-001~D-211、174 条 current 主表行）、24 件 ADR＋CONTEXT.md 批量索引回顾、跨会话知识库召回（t36/g6-publish 同族守卫先例）。

## 一、执行摘要（TL;DR）

**推荐 (i) 修正形态**：41a-check 承载「`##` 全局唯一＋`###` 同父 `##` 节内唯一」双层断言，macro-audit＋architecture-recovery 双账本同扫，落地即绿、零豁免；**修正点仅一处**——立法落盘时同步按 ADR-0013 补交预声明正负对照材料（正对照=重放 R57 P1-2 整块复制切片诱导红；负对照=现行账本全绿），并在 75a-census 派生再基线＋guard-meta 自声明（tier+protected_surface）走完既有流程。**置信度：高**（归属语义、断言范围参数化、成本倒挂三面均有仓内 current 决策＋ADR＋工业先例双源交叉支撑）。

## 二、裁定依据（四锚）

| 锚 | 引用 | 支撑点 |
|---|---|---|
| 账本 D-xxx | D-007/D7b（双账指针闭环＋账行增量无编年认领即红——41a 已是账本结构不变量 owner，本断言是同族扩展非跨界）；D-159②（新断言随既有件内增须 guard-meta tier+protected_surface 强制自声明）；D-140④（守卫成员进出走生命周期登记——为单一断言开第 66 件成本倒挂的直接依据）；D-196~D-201（R57~R61 对账链，P1-2 事故返修语境） | 归属与流程 |
| ADR-NNNN | **ADR-0013**（三层闸门＋预声明判据：正对照 2/2＋真判据预注册＋负对照特异性守卫，阈值跑前写死跑后禁调）；ADR-0019（SWMR 单写者门面：账本=结构化事实域，其不变量归账本门面守卫，非通用文档扫描面）；ADR-0024（探测器判定面锚消费位——「整块复制」的缺陷面在账本结构层，判定应锚该层 owner） | 流程与归属法理 |
| CONTEXT 词条 | 41a 词条（「#41a 分发收尾·仓内文档面守卫」含账本结构不变量断言族 D6/D7/D7b/F 节——账本对账正主）；84-check 词条（指针纪律守卫，账本仅为其 809 文档扫描面之一） | 归属实证 |
| 工业先例 | **markdownlint MD024 官方文档**（已读原文：`siblings_only` 参数默认 `false`=全局唯一；`true`=仅同父同级唯一；rationale=标题锚生成冲突）＋ GitLab 官方 cli 仓 `.markdownlint-cli2.yaml` 实战配置（`no-duplicate-heading: siblings_only: true`——大规模仓选「同父同级」层以兼容 changelog 类复用标题）；mutation testing 惯例（新断言须有 mutation-kill/RED 证据：agentops skill「a test that stays green through its own mutation is the immortal test failure mode」、Credda「regression test must FAIL before patch」）；lint 治理先例（Aspect Build rules_lint：降低新增检查摩擦但按语言/面聚类而非每规则开新件；GitHub Well-Architected rulesets：保护面继承+按域定制） | 断言范围与治理 |

**MD024 参数语义精确映射**：MD024 默认（全局）对应裁定题 (ii) 的「`##` 全局唯一 only」；`siblings_only: true` 对应 (i) 的「`###` 同父唯一」。工业界在**结构化编年账本类文档**（changelog＝与 decision-ledger 同构：轮次节内嵌复用小标题）的标准做法恰是 **siblings_only**——与本仓实测「`###` 内嵌轮次限定语天然唯一、跨轮字面冲突 0 件」吻合，故 `###` 层选 siblings-only 形态不是过度立法，而是该文档类型的标准参数化。同时保留 `##` 全局唯一（MD024 默认层）堵「整块复制」在节层的第一现场。

## 三、逐选项点评

| 选项 | 裁定 | 一句理由 |
|---|---|---|
| (i) 41a＋双层＋双账本 | **采纳（修正：补 ADR-0013 预声明正负对照件随立法落盘）** | 归属正主＋同机理缺陷族全覆盖＋双账本边际成本≈0＋现状违例 0 落地即绿——但「断言写好即绿」不等于免预声明，须按 mutation-kill 惯例附正对照诱导红证据，防「immortal test」。 |
| (ii) 41a＋`##` 全局 only＋macro-audit only | **部分采纳** | 作为 MD024 默认层的最小形成立法合理，但主动放弃 `###` siblings 层与 A-ledger 是「只堵已发生缺陷」而非「覆盖同机理缺陷族」——P1-2 的机理（整块复制）在 `###` 子节双份中同样显形，且 A-ledger 是 D7b 编年键覆盖集已认领的账本面；留盲区违背新增断言最小**充分**范围判据。可作为 (i) 的实现子集直接并入，不单独立法。 |
| (iii) 84-check 承载 | **驳回** | 84-check 是指针纪律守卫（短码/幻觉 SHA/孪生桶/可达性 WARN 面），账本仅为其 809 文档扫描面之一——判定面锚错层，违反 ADR-0024 消费位锚定法理与 41a 词条已确立的账本不变量 owner 语义。 |
| (iv) 独立第 66 件 check | **驳回** | 单一断言开新件触发全套成员进出生命周期（D-140④＋75a census 再基线＋registry 登记），成本与断言面收益倒挂；lint 治理先例（rules_lint/GitHub rulesets）均按保护面聚类扩展既有件，不为单规则开新门。 |

## 四、与 current 决策冲突检查

- **无静默改向冲突**。(i) 与 D-007/D7b/D-159②/D-140④、ADR-0013/0019/0024 均为**顺承扩展**，非改向。
- **需显式注记的一处语义澄清**（非冲突）：R57 返修报告曾建议「落 41a-check＝账本面对账 owner」，R58 审计 §6 建议立法——本裁与两者一致；但 R61 handoff 将归属留 grill，本裁正式收口为：**账本结构不变量（含节标题唯一性）owner=41a-check，84-check 不新增账本专属断言**。建议本轮 D-21x 记录行加注记：「84-check 对 decision-ledger 的文档面扫描（短码/模糊语等）维持不变，不因本裁收窄」——防止 (i) 被误读为把账本整体从 84 扫描面移出。

## 五、置信度自评：高（约 0.85）

- 高置信面：归属（41a 四项在案证据链完整）、`(iv)/(iii)` 驳回（成本与语义锚定均有硬依据）、MD024 siblings 参数语义（官方原文已读）。
- 中置信面：`###` 层「同父唯一 vs 全局唯一」的选择依赖「轮次限定语长期保持内嵌」这一写作惯例的持续性——若未来 `###` 标题去限定语化，siblings-only 会漏检跨轮重名；可用「负对照例里加入同字面跨轮 `###` 变体」在预声明件中显式声明该边界。

## 六、信息缺口清单

1. **guard-meta 的 tier 枚举**未逐字核读（D-159② 的 tier 取值域仅由检索片段反推）——落盘时以 guard-meta 现行 schema 为准。
2. **architecture-recovery 账本守卫现状**：其是否已有独立结构守卫件未逐一核实（若已有，(i) 应改为「在两账本各自正主件内增断言」而非全部压入 41a）。
3. 30+ 件 reports/ 引用 check 的**取值消费 vs 结构守卫**边界仅按票面描述采信，未逐件审计——不影响本裁但影响 census 再基线精度。
4. MD024 在**锚生成失效**（rationale 层）之外是否有大型账本文档的额外反例，未做穷举——现存证据（GitLab cli、Stack Overflow、PyMarkdown 同语义实现）已双源支撑，风险低。

