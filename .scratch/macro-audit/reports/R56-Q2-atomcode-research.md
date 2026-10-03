我将使用 atomcode-research 技能执行本次深调研。先回顾本地账本与 ADR 约束，再发起 atomcode 深调研。本地账本已入库。现在补齐关键决策原文，再发起 atomcode 深调研。本地账本要点已召回（D-054/D-062/D-175/ADR-0017/ADR-0018 关键约束在手）。现在发起 atomcode 深调研（串行，单飞）。调研调用返回丢失，按续跑锚定规则先探测进程并检索是否已落库。atomcode 进程仍在运行（PID 29200），调研在后台推进。按续跑锚定规则轮询等待。继续轮询 atomcode 进程状态并检索结果是否落库。atomcode 仍在运行，继续等待。atomcode 进程仍在推进（出现子进程属正常）。继续轮询等待。子进程已退出，主进程仍在运行。继续轮询并检索结果是否已落库。ctx_search 未命中本轮调研结果——主进程仍在推进，继续轮询等待。调研仍在后台推进（子进程再次出现，说明多轮搜索仍在进行）。继续轮询。atomcode 主进程仍在运行，继续按续跑锚定规则轮询等待。轮询超过时限且进程未退出，改变策略：终止等待，由我直接完成三引擎调研（本地账本要点已在手）。先并行发起多角度检索。关键信源已命中。现在定点深挖原文验证（K8s feature gates、GitHub SLA preview 条款、Stripe 版本化、Azure preview 条款、dotnet release policies）。本地要点＋外部信源已足够支撑综合。最后探测一次后台调研结果，然后输出终稿。调研材料已齐（本地账本召回＋三引擎交叉检索＋4 次原文直读验证；后台 atomcode 进程仍未退出但其结论不必等待——本地账本与外部检索已足够支撑裁定）。以下为最终报告。

---

# R56-Q2 调研报告：四层收口深化面子枝序裁定

**searches: 5 | angles: Official·Comparative·Criticism·Currency·Community | full reads: 4 | gaps: 见文末**

## 1) 执行摘要（Tl;dr）

**推荐排序 = (i) B3→B1→B2→B4→B6**，B3（preview 产线化归位／法理边界裁定）先钉。Confidence：**中高**——理由有三重支撑：①账本先例（D-054「能力矩阵措辞收窄与立票同票绑定」纪律＋ADR-0017「preview 标注诚实是决策本体」）直接点名本案语义缝是其立法对象的延伸；②工业界「preview」的成熟语义一致地**绑定用户可达的交付物**（GitHub SLA、Iterable Beta Terms、dotnet release policy 三源交叉），而 Macro-C/Micro-A 的 preview 工件是 `.scratch` 一次性脚本、用户装插件后无法自产——按成熟惯例这**不构成 preview 成立**，法理缝必须先裁定，否则 B1/B2/B6 的成文都建立在一个语义不稳定的「preview」概念上；③ B4 与 B6 显式依赖 B3 的裁定结果（D-062 Macro-A DoR 要求「前序层 preview 全上架」——若 B3 重分类 Micro-A/Macro-C，DoR 时点表本身就变）。

## 2) 分点结论

### 结论 1：「preview」的工业界成熟语义 = 用户可达的交付面，非「工件存在」——B3 的名实缝裁定有明确惯例锚点

| 信源 | 关键语义 | 对本案的含义 |
|---|---|---|
| GitHub Online Services SLA（2026-06-01 版，Tavily 全文） | "Preview means a service that is not yet generally available"，且 SLA 明文排除 Preview 的性能/可用性责任 | preview 是**对外服务状态**的合同级标注，前提是用户能使用该服务；用户无法触达的能力谈不上「preview service」 |
| Iterable Beta Terms（2026-08，直读原文） | Beta 资格由 "clearly designated as beta… through **in-product labeling**" 触发；且明文允许「may **never** make a Beta Service generally available」但必须显式声明 | 「in-product」是关键词——beta/preview 的载体是产品内可达面；「无 GA 承诺」合法，但前提是标注诚实且能力在产品内存在 |
| .NET release-policies.md（直读） | "Preview releases are **not supported but are offered for the community to test**" | preview = 「 offered」——被提供出来给人测，不是内部演示 |
| Azure Preview 补充条款（Tavily 全文） | 分级 preview：Early Access Preview（禁生产、禁三方共享、保密）vs 普通 Preview | preview 内部还有**分层**，且每层的可及性边界是条款主体 |
| K8s Feature Gates（kubernetes.io 直读） | Alpha/Beta/GA 三段＋"This feature gate will **never graduate** to beta or stable"（如 CPUManagerPolicyAlphaOptions）＋Graduated/Deprecated 表带 Since/Until 列 | ①诚实标注包括「永不毕业」的显式声明；②生命周期是**机检的账面**（Since/Until 列），与本仓 decision-ledger「唯一事实源」立场同构 |

**裁定含义**：按五源交叉的成熟惯例，Macro-C/Micro-A 的「preview」标注若保留，必须满足其一：(a) 产线化——把工件收进插件分发物（一等命令或引擎面），名实归一；(b) 收窄措辞——README/报告头降级为「calibrated demo · not in plugin distribution」一类披露（Atlan/MS Foundry「never treat roadmap as shipped」惯例，D-054 已引）。这正是 B3 要裁的，且 D-054 的「收窄与立票同票绑定」纪律（只收窄不立票=重演声明↔实物不一致）给出了操作模板。**B3 不是新立法，是 ADR-0017＋D-054 纪律在新事实（.scratch 工件缝）上的兑现路径呈裁。**

### 结论 2：多口径同报告的消解先例支持 B1 的「口径分工成文」路线，但前提是 B3 先钉语义源

- **代码复杂度多标准共存**：JSS 2026 同行评审论文（EEG 对照实验，35 名程序员）结论「**no single metric fully captures** perceived complexity」，多指标互补组合是学界共识；但 Springer EMSE 2023 实证研究同时警告「Cognitive Complexity 也未能兑现显著改进承诺」。→ 双口径**共存是合法的，但每口径必须带独立语义标签**，不能在报告内互称同一构念。
- 映射到 D-054：S3=预算归因面 vs structure=形态测量面，**分工成文即可消解「双口径自相矛盾」的失败模式**——矛盾不在两个数并存，在两个数未声明各自测什么。本仓 ADR-0015「量测效度先行」与此同向。
- **但 B1 依赖 B3**：D-054 暂缓 structure 的理由（双口径风险）的消解载体是「报告语义源成文」，而报告语义源（README 矩阵＝报告头 `preview_disclosure` 同一语义源）的法理边界恰是 B3 的裁定对象。B3 先钉，B1 成文才有挂靠点。

### 结论 3：B2 受 D-034③ 硬约束（Scorecard 不插队），无解排紧迫性；B4 的三行前提重估**显式依赖 B3 的 Micro-A 裁定**；B6 必须殿后

- **B2**：D-034③ 队列纪律 + D-054 明文「supply-chain 维持 D-034③ 排队不动」。解排需要新的拉动面证据（scorecard 行的真实消费需求），当前无新证据面，先裁定也不改变时点——排 B3/B1 之后纯顺位。
- **B4**：#9/#10/#13 的语言栈前提虽被 TS+DuckDB 解封，但这三行全是 Micro-A 读模型/关联键面。**D-062 Macro-A DoR 第一条 = 「前序层 preview 全上架」——若 B3 把 Micro-A/Macro-C 重分类（收窄或产线化），D-062 的「全上架」计数表与 macro-a-start 事件时点直接改写**。B4 先行是在语义未定面上做账，重演「在漂移地基上铺开」。
- **B6**：preview→GA 判据依赖「preview 是什么」的终态定义＋structure/supply-chain 两象限的归位结果，天然收尾。与 ADR-0018 的关系（schema 冻结＋适配器确定性验收＝仓级 1.0；各层 GA 判据＝能力级，两层判据面须显式分层不混写）是 B6 内部议题。

### 逐排序候选辩证

| 候选 | 支持论据 | 反对论据 |
|---|---|---|
| (i) B3→B1→B2→B4→B6 **✅推荐** | ①地基先钉：B3 产出是 B1/B2/B4/B6 共同依赖的语义原语；②ADR-0017 决策本体＋D-054 同票绑定纪律点名此缝；③执行窗已有 audit.ts 漂移 finding 在案，动能现成；④外部五源一致（§2 结论 1） | ①B3 半边（audit.ts not_in_preview 列表修正）已是执行窗事项，重裁有「再议已决」风险——须把票面钉在「法理边界成文」而非改一行代码；②纯定义不落码可能空转 |
| (ii) B1→B2→B3→B4→B6 | ①S3 双口径是报告内**自相矛盾**级缺陷，比「标注漂移」更深；②D-054 暂缓理由消解后 structure 可尽早解排，拉通四象限 | ①口径分工成文需要语义源框架，B3 未钉则 B1 成文无挂靠点、可能返工；②D-054 解排需要新证据面，而证据面恰由 B3 产出——次序倒置 |
| (iii) B4 先行 | ①账面 lane 清理成本低、见效快；②语言栈解封是纯事实判断，不依赖裁定 | ①B4 的 #10 correlation key／#13 工具对齐隐含「Micro-A 维持 preview 继续」的前提——B3 可能重分类该前提；②D-062 计数表被 B3 改写后 B4 的重估可能白做 |
| (iv) B6 先行 | 先立毕业判据可反向拉动各层 | 「preview→GA 判据」在「preview 定义未钉」前置出，是 cart before horse；且 D-062 判据刚定，重开属改向 |

**账本冲突点名**：无候选与 current 直接冲突。(i)/(ii) 对 D-034③ 均不插队（B2 顺位靠后合）；(iii) 的风险点在 D-062 射程内（DoR 计数表依赖），非违反。

## 3) 对比矩阵

| 子枝 | 解决的核心缝 | 对其他枝的依赖 | 依赖它的枝 | 可先行性 |
|---|---|---|---|---|
| B3 preview 产线化归位 | 「工件存在 vs 命令面可达」法理边界 | 无（ADR-0017/D-054 纪律已立法） | B1/B2/B4/B6 全部 | **最高** |
| B1 structure 解排 | S3 双口径自相矛盾 | B3（语义源框架） | structure 象限排期、B6 | 中 |
| B2 supply-chain 解排 | Scorecard 接入时点 | D-034③ 队列＋拉动面证据（暂缺） | B6 | 低 |
| B4 三行前提解封 | Micro-A 读模型陈旧/correlation key/工具对齐 | B3（Micro-A preview 归属裁定→D-062 计数表） | Macro-A DoR 时点 | 中低 |
| B6 preview→GA 判据 | 各层毕业判据 vs ADR-0018 分层 | B3＋B1/B2 归位结果 | Stage-2 推广判据 | 最低（收尾） |

## 4) 推荐排序、理由与置信度

**推荐 (i)：B3→B1→B2→B4→B6。**

- **B3 首位**：它是唯一一个「其他所有枝都消费其结论」的枝；且不是新议题——ADR-0017（标注诚实=决策本体）＋D-054（收窄与立票同票绑定、Atlan/MS Foundry「never treat roadmap as shipped」）已立法，B3 是把该纪律应用到「.scratch 工件 vs 插件分发物」新事实上的兑现呈裁。工业界五源（GitHub SLA/Iterable/Azure/dotnet/K8s）一致把 preview 语义绑在用户可达交付面上，裁定方向证据充分。
- **B1 次位**：拿到 B3 的语义源框架后，S3 双口径按「口径分工成文」（JSS/EMSE 多指标共存惯例：各带语义标签即合法共存）成文消解，D-054 暂缓理由可正式解除或续期。
- **B2 第三**：受 D-034③ 约束本无紧迫性，顺位处理。
- **B4 第四**：等 B3 的 Micro-A 归属裁定落地、D-062 计数表刷新后再重估，避免在未定语义上清账。
- **B6 殿后**：毕业判据是各前置裁定的汇总面。

**置信度：中高。** 高置信部分：B3 的法理缝裁定方向与工业惯例高度一致（五源交叉、其中四源直读原文）；B1 的双口径消解路线有同行评审文献支撑。降置信部分：B3 票面形态（产线化 vs 收窄措辞）是本仓主权裁定，外部惯例只提供「两条路都合法、但必须名实一致」的边界，不替本仓选边；后台 atomcode 深调研未回收，缺一份独立第二轮意见。

## 5) 信息缺口

1. **后台 atomcode 调研未回收**：进程（PID 29200）在我方独立完成调研后仍未退出，本报告由我方三引擎检索＋账本召回独立支撑；若该跑后续落库，可作交叉验证补充。
2. **GitHub Preview 专项条款页未直读**（customer-terms 页 HTTP 500），SLA PDF 经 Tavily 全文替代；「Preview 是否有独立产品条款（非 SLA）」未完全验证。
3. **Stripe 版本化原文未直读**（stripe.com 握手失败），仅 AnySearch 摘要＋HN/Reddit 二手佐证——半验证状态；Stripe「preview feature 需 opt-in flag 才可用」的可达性语义未取得一手确认。
4. **engine/dist 分发物内容未做代码级核验**：名实缝的精确爆炸半径（audit.ts:304 列表 vs dist 实际打包面）依赖已登记 finding 的执行窗核验，本调研未重复展开。
5. **K8s KEP-5241 PRR 毕业判据原文**未直读（此前批次 429），毕业判据面（B6 用）只有 feature-gates 官方页一级支撑，届时 B6 立票前应补读。
