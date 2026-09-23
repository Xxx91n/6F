# R30-Q7 atomcode 深调研报告：Micro-B preview 票面形态（A/B/C/D）

> 运行：2026-09-23（atomcode -p，session 6daccfe4）；题面见 R30-Q7-research-prompt.md。
> 置信度=中高（方法论骨架多源交叉；项目特有语义仅内部先例可比）。引擎实况=Exa/Tavily 限额，AnySearch+web_fetch 定点深挖。

## 1) 执行摘要（Tl;dr）

**推荐候选 B（完整票面单票闭环九项）**。理由：①本项目已有立法先例（R11-Q2 Micro-A 票面）确立「单票闭环=管道+试点实跑+报告工件+披露三件套+failure 件+golden 骨架+能力矩阵同票收窄」，沿用可复用守卫/披露/golden 全套资产；②工业界 preview 惯例（GitHub/Azure/Google 三家条款）一致要求 preview 带**显式能力边界+边界态披露+no-SLA 声明**——A 的「边界件后补」恰好砍掉最不可后补的负例披露；③infra+consumer 分票的 infra-without-consumer 形态=工业界 dark launch 场景，其价值依赖生产流量验证——本产品无独立消费者流量池，基础设施票退化为无验收判据的死票。

## 2) 分点结论

**① infra+consumer 同票 vs 分票→支持同票（B 方向）【中高，两源】**
- Branch by Abstraction（Fowler）：每票基础设施先行票的可验收性=抽象层两侧实现共存对照（Steve Smith 变体：两实现对同一请求返回相同结果）——映射到本票=发射改造验收判据应是「旧 facet_rows 聚合载荷与 per-file 一等事实在对照期产出可对账」，基础设施与验证闭环天然绑一票；
- Stacked diffs（Meta/Google，Pragmatic Engineer）：底层 scaffolding 票可独立合并但须 greener commits（每票小而可验证+可 revert）；D 候选=把发射改造挂 codelore 票后当 stacked diff——可行但两票验收判据语义不重合（churn/hotspot 切片≠per-file 发射），review 负载混装；
- Infra-without-consumer 实证：Fowler/Hodgson feature-toggle 文献——Release Toggles 允许 untested codepath 作为 latent code 上生产可能永不开——A 候选「发射先行边界件后补」=latent 发射路径无消费者倒逼，golden 锁不住语义漂移；
- **分票唯一合法场景**：基础设施可被合成 fixture 独立验收时（本仓 D-038 fixture 体系正好提供）——C 有一半合法性，但需新增「发射改造 fixture 票」判据设计成本+两票间 schema 冻结点显式立法=恰是单票闭环免费获得的东西。

**② 试点对象选型→最小充分集=形态覆盖而非统计样本【高，三源】**
- 试点方法论文献（NIH PMC/ATLAS.ti）：pilot 样本判据=「对目标人群的代表性」非样本量；映射仓池——jiahao（人类密集）/env-manager（历史厚+74% 机器 PR）/anysearch-cli（校准仓薄史）已构成**形态三角**：人类密集/机器密集/新仓薄史；
- pilot 文献警告小样本代表性风险——票面叙事写「试点集」不写「覆盖面」（D-047 口径一致）；
- **单仓（A）丢形态三角至少两角**——golden 锁字段骨架会在第二仓实跑时暴露不适配，而 D-025 纪律禁票内静默改骨架；双仓（B）在票内暴露骨架跨仓适配=「pilot 在正式投入前暴露可行性问题」的 pilot 本义。

**③ 边界件负例覆盖→状态机逐值验收是标准做法，B 的逐类点名正确【高，三源】**
- State transition testing 教科书纪律（ISTQB/Autonoma）：完整状态模型须对每个 state-event 对裁决——invalid 态「是负例测试来源，抓住生产中最具破坏性的状态 bug」；miss 四类+insufficient_history+renamed_to 条件跳转=查询语义状态机的 invalid/边界格，逐类点名实物=transition table 全格覆盖；
- FSM 覆盖判据文献：0-switch（逐迁移）是底线，1-switch（迁移对）更彻底——票面至少锁 0-switch（每个 miss 态≥1 实物件）；**renamed_to 是链式迁移→建议 1-switch 补「miss→renamed_to→跳转后命中/二次 miss」成对件**；
- Failure 态分类全测有先例（#38 happy+failure 双件）——B 升级为「逐类点名」=把枚举完整性从事后守卫前移到票面立法。

**④ benchmark 判据写法→分档阈值+可判定形式【中，三源】**
- Google SRE book：SLI 规范形态=「SLI≤target 明确数值/区间」，明确推荐**分位数非均值**（延迟右偏均值撒谎，ClickHouse 工程文同引）；首查延迟判据写 p95/p99 分档阈值（小仓 p95≤X、厚仓 p95≤Y）；
- 分档符合 SRE「按服务类别选 SLI」纪律：不同仓规模延迟分布本质不同，单一全局阈值要么对小仓过松要么对厚仓不可达；
- pilot 阶段样本小，趋势判据无统计效力；「target/danger 双阈值」形态本仓已有立法先例（r12-wave-a）——沿用双阈值分档不自创新语法；
- 可判定性：判据落成守卫脚本机器裁决（阈值+测量脚本+原始数工件）——#22 判据预登记先例形态。

**⑤ 预览期披露→三巨头条款一致：能力边界+校准范围+无 SLA+可随时变更【高，三源】**
- GitHub Pre-release Terms：「may not operate correctly…may change or discontinue at any time」as-is/no warranties；
- Google Maps launch stages：Preview=「ready for customer testing；not necessarily feature-complete；no SLAs or support」；
- Azure Preview Terms：区分 Preview 与 Early Access 分级；
- 映射披露三件套：capability N of 5·preview 分级标注（ADR-0017 立法+Google 分 stage 独立标注同构）＋「not necessarily feature-complete」等价物=**not_in_preview 清单+校准范围**（试点仓、样本=形态覆盖非统计）＋无 SLA/可变更承诺=0.x 契约期「schema 冻结前判据可勘误」既有版本语义。

## 3) 对比矩阵

| 候选 | 验收可判定性 | 边界覆盖 | 披露 | 风险 | 先例映射 |
|---|---|---|---|---|---|
| A 最小票面 | 中 | 弱：invalid 态裸奔 | 弱 | latent codepath（feature-toggle 实证） | dark launch without traffic |
| **B 完整单票闭环** | 高：九项全落守卫 | 强：transition table 全格 | 强 | 票大需内部拆小步 | branch-by-abstraction+Micro-A 先例 |
| C 拆两票 | 高但契约成本外置 | 取决第二票 | 同 B 可达 | schema 冻结点需另立法+fixture 票判据新设计 | stacked diff 合法但需补立法 |
| D 搭车 | 低：判据不重合 | 弱 | 弱 | review 混装，发射改造成附庸 | stacked diff 滥用 |

## 4) 推荐

**候选 B**，内部以 stacked diff 纪律拆 2-3 个可独立绿小步（发射改造+fixture golden→投影+查询语义→双仓实跑+边界件+披露），但**合并与验收以单票闭环裁决**。退路=C（基础设施票以 D-038 fixture golden 为判据先行）；A 与 D 不推荐（latent code 风险与判据不重合）。

## 5) 来源清单

Fowler Branch By Abstraction／Fowler+Hodgson Feature Toggles（latent codepath）／Pragmatic Engineer Stacked Diffs／stacked-diffs-vs-trunk 反面视角／Autonoma State Transition Testing（30 格表 23 invalid 格）／Google SRE book ch.4 SLO（分位数优于均值）／ClickHouse percentiles-vs-averages／GitHub Pre-release License Terms／Google Maps launch stages／Azure Preview Supplemental Terms／NIH PMC pilot 方法论（代表性非样本量）／ATLAS.ti pilot guide／FSM 覆盖判据 ResearchGate 实验评估；项目内先例：R11-Q2 Micro-A 票面／ADR-0017／D-025/D-038/D-047／#38 守卫／#22 判据预登记／r12-wave-a 双阈值。

## 6) 信息缺口

- infra-without-consumer 定量失败案例未找到一手材料（结论基于 feature-toggle 定性文献）；
- miss 四类态为项目特有语义，外部验证只能覆盖方法论骨架；
- 延迟分档阈值具体数值需实跑测定（#22 判据预登记职责，调研只能定语法不能定数值）。
