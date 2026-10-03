我将使用 atomcode-research 技能执行本次深调研。先回顾本地账本/ADR/CONTEXT 的 current 记录，再派发 atomcode 深调研。本地账本回顾完成。关键锚点已确认：D-054③ facts 共享/切片决策、#51 S3 族双口径「opposing 准入」、D-203 矩阵（B1 依赖 B3，B3 已由 D-204 闭环）、ADR-0013 预声明判据三层闸、ADR-0024 消费位判据。现在派发 atomcode 深调研（工业界心智模型部分）。调用被中断但可能仍在后台运行。按续跑锚定规则：先探测进程存活，再检索知识库。进程探测不明确（有 node 进程存活）。先轮询知识库看调研是否已产出。检索命中的都是历史会话（R28-Q5 等），尚无本轮 R56-Q4 产出。继续探测本轮 atomcode 进程是否存活并检索新结果。进程已退出且知识库无本次调研产出（未启动成功）。重新派发调研（串行单飞）。调用再次中断，但后台可能仍在运行。按续跑锚定：先轮询进程与知识库。后台执行通道连续中断。再次探测进程与知识库状态。atomcode 进程已确认不在运行，本轮调研未成功启动。改用 skill 的 fallback 载体重派（单飞串行）。后台执行通道连续中断。先探测 atomcode 是否实际在运行。进程不在运行。再等一轮并检索知识库确认是否有后台产出。ctx/atomcode 通道持续中断，无法承载本轮调研。按降级路径：我直接执行调研（三引擎 + 原文核验），继续达成配额。先并行多角度搜索。第一轮覆盖了 GQM/ISO 25010/语义层/GX 四个角度。继续补齐：SLI 多用途读法、矛盾检测可判定性、JSS/EMSE 多指标治理。三引擎首轮覆盖完成。现在定点深挖原文（web_fetch 验证关键信源）。最后定点核验一轮：度量工具中「采集层 vs 判读层」的官方分层证据（SonarQube quality gates、CodeScene、GQM 原典）。配额自查：searches: 9（web_search×4 / Tavily×2 / AnySearch×3）｜angles: Official / Comparative / Criticism / Community｜full reads: 6（INNOQ·dbt SL·GX integrity·colrows·SonarQube QG·SEI 1993 报告摘要面；CodeScene 官方档 403 未读，已记缺口）｜gaps: 见文末。以下为综合报告。

---

# R56-Q4 调研报告 —— S3 双口径消解形态（B1 本体）

**Sufficiency Gate**：searches: 9 | angles: Official / Comparative / Criticism / Community | full reads: 6 | gaps: CodeScene 官方档直读未成（403，其多口径心智由 R13-Q2/R23-Q6 历史已读记录＋CodeScene 复杂度分布立场二手文补足）；GQM 原典只直读 jstage 定制论文＋SEI 1993 摘要，Basili 原文未全读；JSS/EMSE 指标间矛盾的期刊级治理惯例未直接命中（以 ISO 15939 决策判据分离＋EEG 实证「指标偏离感知」间接覆盖）。

## 1) 执行摘要（Tl;dr）

**推荐 (i)+(iv) 复合：分层分工成文＋「不打架」golden 闸作解排准入判据**（Confidence：中高）。工业界对本仓处境有两条成熟心智直接钉死方向：其一，同数据多判读共存是度量工程的正规形态而非病态——GQM 范式（goal→question→metric 三层）与 SEI 度量过程架构（TAME/1993 报告）把「同一批 metric 供不同 goal 提问」定义为设计目标，ISO 25010 与 dbt 语义层都把 measurement 与 interpretation 严格分层，jstage GQM 定制论文更直接给出「同一数据集＋显式 interpretation layer」的工业实证；其二，跨指标一致性机检有明确先例（GX 跨列/跨表 consistency、SonarQube quality gate 条件形态），但全部锚定在**可数值比较的关系谓词**上——「叙事层自相矛盾」的机检先例全部落在形式化受控语言（TU Berlin ALICE）或多采样统计（self-consistency），自由叙事矛盾不可判定。因此闸的粒度必须落在 facts/读数层（数值关系断言），不能落在叙事层——这与本仓 ADR-0024「判定锚消费位」、D-084「权重归 rubric 面」完全同构。

## 2) 本地账本锚点回顾（先于外部证据）

- **D-054③ 射程已钉**：「quadrant 归位规则=facts 共享、quadrant 归属=切片决策」——双口径矛盾在规则层已被预授权为合法形态，禁止的是「同一 fact 两象限归属」的**语义漂移**，不是共享本身。候选 (ii) 的「借尸还魂」担忧正是 D-054③ 要防的漂移反例。
- **#51 S3 族准入形制**：「s3 族须成对 opposing 准入执行 #51 双口径风险」（guard-71 B2 断言）——S3 族面入维时已有「双口径须成对」纪律，B1 解排是该纪律在 structure 象限的镜像应用，非新立法。
- **ADR-0024 消费位判据的含义**：判定面锚消费位而非提名位。推论：S3（预算归因）与 structure（形态健康）的判读归属由**各自消费位**的谓词决定，不由原始指标面决定——这正是「分层分工成文」的仓内法理基础。
- **D-080④/D-084**：文档单源真值＋映射常量块零权重列、权重归 rubric 面、rubric 零路径指针——分层成文的落点须遵守：measure 层进映射面，interpretation 层进 rubric/叙事面，不混写。
- **ADR-0013**：预声明判据三层闸——候选 (iv) 的 golden 闸须走同型流程（判据预声明→用户审阅→commit→再跑）。
- **D-203 矩阵**：B1 依赖 B3；D-204 已闭环 B3（preview 法理边界），B1 前提已解锁——续排 (iii) 的「等 B3」理由已失效。
- **D-034③ 不适用**：Scorecard 不插队是 supply-chain 面专用，structure 无此约束（题面已核）。

## 3) 分点结论（每条标注来源）

**结论 1：同数据多判读共存是度量工程的正规设计形态，(i) 的「分层分工」有强先例。**（Confidence 高，多源）
- GQM 范式：goal→question→metric 三层，**同一批 metric 可服务不同 goal 的不同 question**——「把同面读成不同答案」正是 GQM 的定义性能力。SEI 1993《Establishing a Software Measurement Process》明确以 GQM 为基座，度量过程=「goal setting, data analysis, and decision making rather than just data collection and numbers」。（sei.cmu.edu 1993_005_001_16196；jstage E95.D_2169）
- jstage GQM 定制论文是本案最贴切先例：同一 EPM 数据集之上显式构建 **hypothesis layer + interpretation layer**，不同项目上下文各自判读，工业两案实证成功。→「measure 层共享＋interpretation 层分挂」不是发明，是 GQM 系的标准扩张。
- SonarQube 官方档：指标本体（measures/metrics 文档只定义「是什么怎么算」）与 quality gate 条件（metric＋比较算子＋阈值，判据强弱面）是**两份独立文档、两层职责**——measure/interpretation 分层在主流工具的产品架构中已落死。（docs.sonarsource.com，直读）
- SLI 多用途读法：同一 `http.request.duration` 直方图同时供 p95/p99/错误率/多 tier SLO 阈值消费——单一指标源、多判读出口是 SRE 日常。（Datadog metric-based SLO 官方档＋SLI 构造文，摘要级双源）

**结论 2：语义层「单一语义源」惯例支持 (i) 的「原始量＋聚合判据写死在 measure 层」。**（Confidence 高，双源直读）
- dbt Semantic Layer/MetricFlow：measure 定义一次，metric（simple/ratio/derived）全部从 measure 派生，聚合类型（agg）钉在 semantic model 层——「聚合判据跟着 measure 走」是官方心智。（getdbt.com，直读）
- colrows 三代对比文的核心洞见对本仓警告价值极高：**LookML 与 dbt SL 共同的失败模式是「schema 漂移时没有任何机制发现定义已 stale」**——定义成文而无一机检守护，是已知反模式。（colrows.com，直读）→这直接论证 (iv) 的 golden 闸不是可选锦上添花，而是防「两处判读漂移」的必要件。

**结论 3：ISO 25010 的教训是「共享分类树不等于共享判读」，其层级争议恰证明切片归位须显式成文。**（Confidence 高，直读+双源）
- INNOQ 直读：testability 在 ISO 下只挂 maintainability，但业界同样视为 reliability 属性——**严格单亲归属是争议源，可标注（taggable）多归属是更优形态**（arc42 Q42 即此设计）。（innoq.com，直读）
- 对本仓含义：D-054③「facts 共享、切片决策」若不成文为两象限各自的归位表行（structure 象限哪些 S3 族面、带什么语义域标签），就会重演 ISO 25010 式「归属可争、定义打架」。

**结论 4：「不打架」机检闸可判定性的边界清楚——数值关系层可检，叙事层不可检。**（Confidence 高，三源）
- GX 官方 integrity 档：跨列/跨表一致性全部以**关系谓词**表达（pair equal、multicolumn sum、A>B、custom SQL unexpected-rows）——机检一致性闸的成熟形态就是「可枚举的数值/关系断言」，且**业务规则用 custom Expectation 显式声明**而非从文本推断。（docs.greatexpectations.io，直读）
- 自由文本矛盾检测现状：形式化受控语言下可行（TU Berlin ALICE，formal logic＋LLM 混合，但原文自己列出大量 false-positive/填充词限制）；LLM self-consistency 是**多采样统计**不是单报告断言；「Existing LLMs Are Not Self-Consistent」实证连简单任务的叙事自洽都不可靠。→**「同仓报告内 S3 与 structure 不得生成自相矛盾陈述」这句作为叙事级断言不可直接机检**，必须降维。
- 降维方案（本次调研的关键产出）：闸的可判定粒度=**facts 层数值关系**——例如：① 同一 S3 族面在两象限读数必须引用同一 measurement 工件（同源断言，等价 GX multi-source equality）；② 归因谓词与形态谓词的符号方向预声明为 opposing/neutral 对（#51 成对准入的 golden 化）；③ 聚合判据枚举进映射常量块与文档枚举互等（guard-71 B2 同型）。这三类都是数值/枚举关系，GX/SonarQube 同型可检。

**结论 5：指标冲突本身有实证基础——两套口径不打架不能靠乐观假设。**（Confidence 中高，双源）
- EEG 对照实验：McCabe V(g)/SonarSource cognitive complexity 与程序员实际感知复杂度经常**非单调偏离**——同一「复杂度」名下的不同口径给出不同答案是被实证的常态，不是边缘。（pmc.ncbi.nlm.nih.gov PMC9942489）
- CC/SLOC 相关性大语料研究：线性相关仅中等、方差随规模飙升——「两套口径在报告内读出相反信号」在真实仓完全可能发生。（pure.tue.nl Landman 2015）
- SEI 工业经验报告的告诫：「critical to guide the development teams to focus on the underlying problems behind each measure, rather than on the score itself」——归因叙事必须显式标注其语义域，否则读者会把两处读数当同一主张。（sei.cmu.edu experience report）

## 4) 逐候选辩证

| 候选 | 支持论据 | 反对论据 | 裁定影响 |
|---|---|---|---|
| **(i) 分层分工成文＋解排** | GQM/SEI 正规形态（结论1）；ADR-0024 消费位判据的法理基础；D-054③ 本就预授权 facts 共享；语义层惯例（结论2） | 成文无机检守护=colrows 指出的「定义 stale 无人发现」反模式；单独 (i) 未回答「两处判读何时算打架」 | **采纳为骨架** |
| **(ii) 归并不独立成面** | 零双口径矛盾，最省事 | 违反 D-054③ 的反面——切片决策被收回；四象限骨架（D-005 共享骨架、ADR-0004）被削；「战略维借尸还魂进测量位」层次倒挂实锤：S3 的归因叙事本质是 goal 层，把它塞回 metric 层是 GQM 三层的倒置 | **否决**（层次倒挂＋削骨架） |
| **(iii) 续排** | D-203 矩阵曾记 B1 依赖 B3 | B3 已被 D-204 闭环，「等 B3」理由失效；queued 已第三久，与 D-054⑥ 清单纪律（显式触发器闭合，不无限拖延）冲突；correlation key（B4）不改变双口径判读归属问题的本体 | **否决**（前置已解锁，拖延无判据） |
| **(iv) 判据先行后解排** | ADR-0013 同型（预声明三层闸）；colrows 教训（结论2）证明机检必要；GX/SonarQube 有闸形态先例 | **叙事级矛盾不可判定**（结论4）——若闸写成「报告内不得自相矛盾」原句，是不可判定的伪闸，违反 ADR-0015 效度先行（闸测不了它声称测的东西）；单独 (iv) 无分层成文则闸无所断言 | **采纳，但闸降维到 facts/关系层** |

**复合方案 (i)+(iv) 的合成句**：structure 象限产形态测量读数（S3 族 6 面原始量＋聚合判据，语义域标签=structure/shape），S3 消费同面读数产预算归因叙事（语义域标签=S3/budget-attribution，悬挂同一 measurement 工件引用）；解排准入判据=预声明 golden 闸，断言粒度限定为三件：同源引用互等、opposing 谓词成对（#51 镜像）、枚举↔常量块互等（guard-71 同型）——三者全部是数值/枚举关系谓词，可判定；叙事级「不打架」不进闸，由 D-054③ 切片归位规则＋语义域标签承担（文档层防漂移）。

## 5) 与账本 current 的冲突核查

- 与 **D-054③**：无冲突——本方案正是③的实例化（facts 共享＋切片决策成文）。
- 与 **D-080④/D-084**：一处须注意——语义域标签若写进 upstream-dimension-map 常量块，须守 A2 断言（常量块无权重字段）；标签属 dimension 枚举非权重，合规，但立票时须过 guard-71 同型对账。
- 与 **#51**：本方案的 opposing 谓词成对闸是 #51「单指标禁孤立入维」在 structure 象限的镜像执行，**非新规则**，立票时应引 #51 而非另立编号。
- 与 **ADR-0013**：闸走预声明判据三层闸同型流程，无冲突。
- 与 **D-034③**：structure 面不适用（supply-chain 专用），无冲突。
- **无 revised 需要**；一条澄清性注记建议：D-054② 能力矩阵式措辞中 structure 从 queued 摘除时，按 D-204 同票绑定纪律（只解锁不立票=重演声明↔实物不一致），解排裁定须同票立 structure 象限接入票。

## 6) 对比矩阵（四候选综合）

| 项 | 先例对齐 | 仓内法理 | 机检可判定 | 主要风险 |
|---|---|---|---|---|
| (i) 分层成文 | GQM/SEI/语义层三线 | ADR-0024＋D-054③ | 不自带 | 无闸则定义漂移 |
| (ii) 归并 | 无（ISO 单亲归属反例） | 违 D-054③ 反面＋削四象限 | 不适用 | 层次倒挂 |
| (iii) 续排 | 无 | 前置已失效 | 不适用 | 欠账久拖 |
| (iv) 判据先行 | GX/SonarQube 闸形 | ADR-0013 同型 | 叙事级不可判定，须降维 | 伪闸风险 |
| **(i)+(iv) 复合** | 全部先例覆盖 | 全部 current 兼容 | facts 层可判定 | 闸粒度须严格自限 |

## 7) 推荐＋置信度

**推荐 (i)+(iv) 复合**，按上述合成句裁。**置信度：中高。**高置信部分：分层分工的先例充分性（GQM/SEI/SonarQube/dbt 四独立源同向）、叙事级矛盾不可判定（三源同向）、(ii)(iii) 否决理由（法理＋时点均硬）。中置信部分：golden 闸三断言的**具体谓词清单**是最小充分集这个判断——外部先例只证明「关系谓词可检」，谓词集的完备性（是否恰好三件、会不会漏检第四种打架形态）是本仓主权裁量，建议按 ADR-0013 流程预声明后由用户审阅定稿。

## 8) 信息缺口

1. CodeScene 官方档本轮 403 未直读——其「absolute numbers are of little interest, 分布才是关键」立场由二手文（empear 系文章）获得，S3 opposing 谓词成对的具体符号方向若需 CodeScene 级证据，立票执行波须补直读。
2. JSS/EMSE 期刊级「同一指标多解释」的治理惯例未命中原文——目前以 ISO 15939 决策判据分离＋EEG 实证间接支撑，若用户认为该线承重，需补一轮学术检索。
3. 闸的谓词完备性无外部先例可抄（GX 的 custom expectation 形态可参照但内容是本案特有）——首版 golden 闸须以「正对照＋负对照」构造（ADR-0013 B 层同型），跑前声明命中率方向。
4. atomcode CLI 通道本会话持续中断（ctx_batch_execute 三次 stdio 恢复失败），本报告由直接调研路径产出而非 skill 规定的 atomcode 单飞通道——三引擎/原文核验配额已以直接路径达成，但 hook 的强制配额未走完，属程序性缺口非实质缺口。
