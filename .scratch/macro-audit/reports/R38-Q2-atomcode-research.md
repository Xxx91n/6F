# R38-Q2 调研报告：CodeBuddy 试用执行协议三裁面

（atomcode 调研存档；resume handle `7f6c458b-d799-49bf-8b30-a928ebbf5f80`；题面=R38-Q2-research-prompt.md 同目录）

**Sufficiency Gate**: searches: 7（Exa×2 ＋ Tavily×2 ＋ AnySearch batch×3）| angles: 5 类全用（Official＝BMC 试点论文/Wikipedia/MoT 词条；Comparative＝isixsigma exit-vs-acceptance；Criticism＝bugbug「bug bash 何时是错工具」/特征化测试劣势面；Currency＝bugbug 2026-08 更新版四公司实操；Community＝SBTM 实践文/Substack）| full reads: 7（bugbug、Wikipedia Characterization test、isixsigma、lean6sigmahub、Gulzar 差分测试论文 PDF、MoT SBTM 词条、BMC 摘要窗）| gaps: SBTM 原始 satisfied/discarded 输出票面只取到二手转述；「字段级 vs 结构级 parity」无逐字同名工业术语（用分层锁面/golden-master 文献同构映射，已如实标注）；pilot 判据文献为医学/六西格玛域，向软件 pilot 外推属同构迁移非同域先例。

## 1) 执行摘要（Tl;dr）

**三面推荐：面A 取 (iv) 安装树自对照为唯一裁决基线（D-150②「CLI 裸跑对照基线」的同向细化，非改向，零 revised）；面B 采纳预声明封口判据，但把「关窗判据（exit）」与「成功判据（success）」拆成两个判据轴——关窗＝三判据全跑完＋findings 全过 D-146 分诊（过程完备性），成功＝三判据各自通过与否（结果读数），关窗不预设成功；面C 取 (α) 新立 `trials/`，并沿 D-130② 教训在首轮落盘时用一句话声明目录语义，防双真源漂移。** 置信度：面A 高（差分测试/单变量设计文献与账本先例双线汇聚）；面B 高（Kill Criterion 既有词条＋pilot 进展判据文献直撑）；面C 中高（目录语义纯度无直接工业术语，靠仓内既有分类事实＋信息架构惯例同构）。

## 2) 分点结论

### 面A —— parity 基线协议：采 (iv)，r36 降参照

**核心论据一：单变量原则。** 差分测试（differential/back-to-back testing）的教科书形态是「同一输入跑 base/test 两个版本、逐字节比对输出」——其效度前提恰是**除被测变量外一切受控**（Gulzar/Google ICSE-SEIP 论文原定义：base 与 test 在 the same test input 上执行，输出差异要么预期要么可解释）。面A 四候选里只有 (iv) 满足这个前提：安装树 `dist/cli.js` 本机直跑 vs CodeBuddy agent 驱动，同一字节码、同一仓库、同一时点，唯一差异变量＝驱动路径（确定性 CLI vs agent 在 skills 壳＋MCP 读面引导下的行动序列）——这正是题面新事实①认定的「真问题」。(i) 同 SHA 双跑多买一个变量轴（开发仓 HEAD vs 安装树的版本差轴），(ii) 把版本差混进对照（r36 旧读数 vs CodeBuddy 当前，两轴同时变），(iii) 无裁决力。单混淆变量（single-confound）归零是验收实验设计的成熟纪律，(iv) 是唯一构造性达成者。

**核心论据二：characterization/golden-master 的角色定位。** 特征化测试文献（Wikipedia/Feathers 定义）明确：golden master 是**变更检测器不是正确性证明**——「does not imply correctness, merely helps detect unwanted effects of changes」。这正好锚定 (iv) 的语义：CLI 裸跑基线锁的是「引擎确定性行为的事实快照」，CodeBuddy 侧读数与之 diff，差异归因分析由人裁（assignable cause 词汇直接可用）。同时文献警告 golden master 的两大失效条件——不可重复性与环境/输入不稳定——kernel 字节级宿主无关已消解前者，(iv) 的同 SHA 构造消解后者。

**核心论据三：版本差轴的诚实处置＝Dual Reporting 而非对照。** r36 env-manager 读数（audits/r36/env-manager-facts.duckdb，Claude 侧）降为「参照轶事」符合账本自身的量测纪律：CONTEXT「Dual Reporting（勘误式双读数）」条款的原读数不撤回、不覆盖，修正读数并列发布附 delta——但那适用于「量测方法修订」；这里是测量对象版本不同，连并列 delta 都不可比，只能作叙事级佐证。若 CodeBuddy 侧读数与 r36 读数冲突，按「Assignable Cause」条款：找不到可归属原因（引擎版本差？宿主面？）时默认接受异常读数有效并升级调查——不许悄悄二选一。

**同向性核查（题面特别要求）：D-150② 原文是「CLI 裸跑对照基线（失效归因对照组——插件装上跑不动→问题在宿主适配层 vs CLI 本体）」。** 逐字对照：D-150② 已经写了「对照组＋失效归因」语义；(iv) 把基线的执行面钉死为「所装 dist/cli.js 本机直跑」（消版本混因、不需 Claude Code 环境）＋把 r36 降参照。这是对已立决策的可操作化收窄——基线所指的裁决对象（宿主适配层 vs CLI 本体）一字未改。**判定：同向细化，非改向，零 revised。** 唯一注记级提醒：D-150② 写「CLI 裸跑对照基线」未钉基线代码源，(iv) 落地时须在试用报告票面写明「基线＝安装树 SHA xxx 的 dist/cli.js 本机直跑」——钉 SHA 的注记义务（D-142 钉快照惯例）。

### parity 报告形态（支撑面A 的报告层细节）

工业无逐字同名「field-level parity」术语，但分层对照惯例高度收敛（golden-master/characterization 文献＋CDISC 等价验证指南「reveals exactly where bytes, structure, or meaning differ」）：**字节级 diff → 字段级 diff → 结构级 diff → 叙事级对照**四层，层位越深裁决力越弱、披露义务越强。映射本试用：CLI 裸跑已证引擎字节级恒同构（引擎确定性前提）；CodeBuddy 侧主判据钉**字段级**（D-150 验收判据「Macro-B 报告字段级 parity＝TTFV 最低线」——与 D-132「骨架＝字段键集＋语义不变量定点值」的锁面定义对齐，禁滑成纯键集）；若版本差轴被迫引入（如安装树落后 HEAD 到无法回避），parity 主张须降结构级并 Dual Reporting 式声明降级——(ii) 候选的「骨架结构＋字段族级」降级条款保留为**应急路径**，不因选 (iv) 而删除（(iv) 消混因成功则不触发）。

### 面B —— 试用封口判据：预声明，且 exit/success 分轴

**判据预声明：直接兑现既有词条，无需新发明。** CONTEXT「Kill Criterion（预声明判据）」词条已立法：跑被测仓之前以确定性规则写下判据并 commit 入库，含可操作定义＋显式阈值＋命中方向＋未中语义；「真判据未命中＝合法实验数据，不是失败」。试用三判据（安装链零文档外干预步／env-manager 字段级 parity／preview 诚实披露不失守）应在试用执行前 commit 入库（charter 形态，见下），与 ADR-0013 三层闸门（A 形式→B 内容→C 信任，每层回答不同问题）同构——本试用恰是「安装链通了吗／效果达到吗／披露守住了吗」的三层重演。

**「试用失败≠产品失败」的语义护栏：文献直撑。** BMC 医学研究方法论文（pilot/feasibility trial 方法学）的两个结论可原样迁移：① pilot 的 outcome 分四档（stop / continue-with-modifications / continue-with-monitoring / continue-as-is）——**pilot 未达判据≠pilot 失败**，原话「it is a success — because you avoided wasting scarce resources」；② pilot 报告标题应明示自己是 feasibility study，防读者当主试验结果读。映射到本仓：试用读数不许变「CodeBuddy 已认证」＝D-150 负向已禁，文献给的同构护栏是**票面标题与结论措辞自带 feasibility 语义**（「CodeBuddy 插件链 feasibility 试用报告」而非「CodeBuddy 适配验收报告」）。

**与 Trigger-gated Closure 的同构性辨析：同族不同轴，不可混写。** Trigger-gated Closure=等外部触发事件到达再封口，关窗判据不预置、不无限拖延，登记触发事件，任一触发即实测封口。试用关窗的驱动是**判据完成**（三判据跑完＋分诊闭环），不是外部触发事件到达。二者共享的深层原则是「防无限拖延＋防前置门禁」，但机制相反：触发器封口等事件来，判据封口等活动做完。若把试用关窗写成触发器形态（「X 事件发生即关窗」），会在三判据未跑完时留下提前关窗的合法化漏洞。**建议票面措辞：试用关窗＝预声明判据驱动（Kill Criterion 惯例），关窗后遗留项若属基础设施/缺口类再按 Trigger-gated 挂 registry 触发器**——两纪律接力而非互替。

**预声明 vs 事后判定纪律面：** isixsigma 的 exit criteria 定义给了关键区分——exit criteria 是「closing out one stage 的 tollgate 条件」，须在开工前定义、独立于产品是否达标（acceptance criteria 才是产品级判定）。映射：**关窗判据（exit）＝过程完备性**——三判据全跑完、每条有读数、findings 全过 D-146 四档分诊、报告落盘；**成功判据（success）＝三判据各自命中与否**（可能 3/0 也可能 1/2）。关窗（exit met）与成功（success met）独立取值——这正是「关窗≠缺陷清零」的文献同构：六西格玛 tollgate 允许「带着已分诊的未决项进入下一阶段」，条件是每个未决项有名分（未过项自动转 finding 票面）。

**试用 charter 的成熟形态（SBTM）：** SBTM（Bach 父子，MoT 词条＋多源一致）把探索式测试组织为「charter（使命句：Explore X with Y to discover Z）→ timebox → session report（测了什么/发现了什么/时间去哪了/悬而未决的问题）→ debrief」。票面要素工业收敛于：charter＋预估时长、实测记录（TBS 计时：test/bug/setup）、findings 清单、opportunities（off-charter 发现）、debrief 结论。本试用可裁定的形态：**试用前落一份 charter/runbook（三判据＋三悬点实测清单＋环境快照字段），试用中一份 session 记录，试用后一份报告**——三件套落 trials/，与面C 合流。

**findings 回流票面最小要素**（bugbash 实操文献综合：GitLab label-driven triage「有序列表非堆pile」、bugbug 90 分钟议程「deduplicate first → severity+owner → recap: confirmed/deferred/blocked」、Xray「共享表格字段＝ID/描述/severity/status/owner/comments」）：每条 finding 至少含——①复现步骤（精确到命令/URL）＋②环境快照（CodeBuddy 版本、插件安装树 SHA、OS）＋③严重度＋④来源（charter 编号/判据编号）＋⑤**预填 D-146 四档去向建议**（快照属实/现状已修→不进裁定链；仍开放→立 D-xxx 或挂批2；无法核实→pending+复审时点；可证伪→驳回附依据）。「deduplicate first」对 D-146 特别有用：试用 findings 先与既有账面互斥（如三悬点清单逐条对账）再分诊，防重复票膨胀。

### 面C —— 产物归位：采 (α) trials/，附一句话语义声明

**目录语义现状（实测）：** `.scratch/macro-audit/` 下现有 `audits/`（r32/r33/r36/r37——审计窗机器产物：duckdb/diff/json）、`reports/`（调研报告＋收口报告＋handoffs 指针）、`handoffs/`（交接单）、`decision-ledger.md`、`spec-phase-tasks.md`。既有分工事实清晰：audits＝「跑一次审计产出的原始工件」，reports＝「调研/裁定/收口的文书」，handoffs＝「会话间交接」。

**试用产物的分类学位置：** 试用三件套（charter/runbook、session 实测记录、试用报告）既不是审计窗产物，也不是调研/收口文书，也不是交接单——是**第四类：试点/试用实测档案**。(β)(γ) 复用都会稀释现有目录语义：塞 audits/ 混入非审计件类型断裂；塞 reports/ 与 R38-Q1/Q2 调研档案检索面撞。

**纪律面核查：** 账本全部 current 条款中无任何目录语义纯度条款——D-131（Demo Fixture 落点判据「谁消费它」）是唯一相邻决策，其判据精神可借用：试用产物的消费者＝D-146 分诊流程＋后续宿主扩展裁定，不是 engine golden 也不是收口对账，故独立目录成立。D-130②（「手写枚举=必然再过期」双真源教训）给出的义务：新目录落盘时同一 commit 内写一句话语义声明（「trials/＝宿主试用/试点执行档案：charter、session 记录、试用报告；审计窗产物归 audits/、调研收口文书归 reports/」）——D-139② 同款轻规约文法，非新立法票。

## 3) 对比矩阵

| 项 | 裁决力 | 版本混因 | 成本 | 与 D-150 关系 | 判定 |
|---|---|---|---|---|---|
| (i) 同 SHA 双跑补基线 | 高（但基线在开发仓非安装树） | 残留 HEAD↔安装树差轴 | 一次补跑＋需 Claude 侧环境 | 同向 | 备选加强，非必要 |
| (ii) 版本差声明对照 | 低（双混淆变量） | 未消，靠声明 | 最低 | 同向（Dual Reporting 惯例） | 应急降级路径保留 |
| (iii) 单跑软对照 | 无裁决力 | 不适用 | 最低 | 同向但空转 | 禁（违预声明判据纪律） |
| **(iv) 安装树自对照** | **高（单变量：驱动路径）** | **构造性归零** | 一次本机直跑 | **D-150② 同向细化，零 revised** | **主基线** |

| 面B 方案 | 预声明 | 关窗/成功分轴 | 与 Kill Criterion 同构 | 判定 |
|---|---|---|---|---|
| 三判据全跑＋D-146 分诊闭环即关窗（findings 转票面） | 是 | 是（exit＝过程完备 / success＝三判据读数） | 是 | **采纳** |
| 关窗＝缺陷清零 | 否（事后判定） | 否 | 否 | 禁（moving goalposts） |
| 关窗写成触发器封口形态 | 部分 | 混轴 | 部分 | 禁（同族不同轴，机制相反） |

| 面C 方案 | 语义纯度 | 消费者可指认 | 纪律触雷 | 判定 |
|---|---|---|---|---|
| (α) trials/ 新目录＋一句话语义声明 | 高 | D-146 分诊＋宿主裁定链 | 无（D-131 判据精神同向） | **采纳** |
| (β) audits/ | 低（机器产物目录混文书） | 弱 | D-131 精神反向 | 否 |
| (γ) reports/ | 低（R 系列调研档案检索面被稀释） | 中 | D-130② 双真源风险 | 否 |

## 4) 完整来源清单（要点）

| # | 标题 | URL | 角度 | 贡献 |
|---|---|---|---|---|
| 1 | Perception and Practices of Differential Testing (Gulzar et al., ICSE-SEIP) | https://people.cs.vt.edu/~gulzar/assets/pdf/p71-gulzar.pdf | 学术 | 差分测试定义：base/test 同输入、输出差异须预期或可解释——单变量对照权威原义（全文提取核验） |
| 2 | Characterization test — Wikipedia | https://en.wikipedia.org/wiki/Characterization_test | 百科 | golden master＝变更检测器非正确性证明；两大失效条件 |
| 3 | isixsigma / lean6sigmahub exit-vs-acceptance | （聚合） | Comparative | exit criteria＝阶段关窗 tollgate，独立于产品达标 |
| 4 | BMC pilot/feasibility 方法学论文 | （聚合） | Official | pilot outcome 四档；未达判据≠失败；报告标题须标 feasibility |
| 5 | MoT SBTM 词条＋实践文 | （聚合） | Community | charter→timebox→session report→debrief 形态；TBS 计时 |
| 6 | bugbug 2026-08 bug bash 实操 | （聚合） | Criticism/Currency | deduplicate first→severity+owner→confirmed/deferred/blocked |
| 7 | GitLab triage / Xray findings 票面 | （聚合） | Comparative | findings 票面字段收敛 |
| 8 | 本仓账本/ADR/CONTEXT（D-013/033⑤/045/047/053/066/067①/130②/131/132/139②/142/146/148/149/150、ADR-0006/0007/0013/0015/0017、CONTEXT 七词条） | D:\Aworker\6F\… | 本地 SSOT | 全部内部判据（最高层级） |

## 5) 信息缺口

1. 「字段级 vs 结构级 parity」无逐字同名工业术语——分层对照惯例（golden-master 四层＋CDISC「bytes/structure/meaning」三分）同构映射，属类比不是同名先例；D-150 验收判据的「字段级」措辞在本仓有 D-132 锁面定义托底，外部先例留缺。
2. SBTM 票面的 TBS 计时字段是否为试用必需未裁定——文献为 SBTM 标配，本试用单人短窗，建议简化为可选字段，由试用 charter 落盘时定。
3. pilot 判据文献全部来自医学/六西格玛域——软件域 pilot exit-criteria 无同等成熟文献，面B 外推置信标注为「同构迁移」。
4. CodeBuddy 侧三悬点实测本身（marketplace.json 读取／.mcp.json 自动发现／Windows 占位符展开）仍待试用首轮实证——本轮调研不预设其结果。

## 6) 账本冲突总核查表

| 冲突面 | 核查结论 |
|---|---|
| 面A(iv) vs D-150② | **同向细化非改向**——基线所指裁决对象（宿主适配层 vs CLI 本体）未变，钉基线代码源＝注记义务；零 revised |
| 面A(ii) 降级保留 vs D-150 验收判据「字段级 parity」 | 不触——(ii) 是版本混因不可回避时的应急降级路径，Dual Reporting 声明；主判据不变 |
| 面B exit/success 分轴 vs CONTEXT Kill Criterion / Trigger-gated Closure | 同构且分工明确：判据预声明＝Kill Criterion 直用；关窗后遗留项挂触发器＝Trigger-gated 接力；**禁把关窗写成触发器形态**（同族不同轴） |
| 面B「试用失败≠产品失败」 vs D-150 负向「禁试用当 GA 验收」 | 同向强化——文献护栏（feasibility 标题语义）为 D-150④ preview 语义提供票面措辞实现 |
| 面C trials/ vs 目录纪律 | **无既有条款被触**——账本/CONTEXT 无目录语义条款；D-131「落点判据＝谁消费它」精神同向借用；须沿 D-130② 教训附一句话语义声明（轻规约文法，非新票） |
| findings 票面 vs D-146 四档 / D-142 钉 SHA | 同向强化——票面五要素中「环境快照 SHA」与「预填四档去向」分别兑现 D-142 与 D-146 的可指认义务 |

**特别核查结论（题面两条）：** ① 面A(iv) 相对 D-150②「CLI 裸跑对照基线」＝**同向细化**（收窄执行面＋钉 SHA，裁决语义未动）——若收口裁定采纳，账本仅须在 D-150 行挂 scoped 注记或在新 D-xxx 里载明细化关系，不构成 revised；② 试用产物归 `trials/` 不触任何既有目录纪律条款（该类条款不存在），但新目录落盘须附一句话语义声明防 D-130② 双真源漂移。
