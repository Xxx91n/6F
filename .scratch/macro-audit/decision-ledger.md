# Decision Ledger — macro-audit

## 第六轮 Grill（2026-09-15）— #25 拍板包 + 阶段 3 铺开预研裁定

| ID | 原问题 | 确认回答原文 | 规范化需求 | 显式约束 / 负向需求 | 状态 |
|---|---|---|---|---|---|
| D-029 | Q1（轮7）：#25-B1.2 启动器收尾硬要求加黑体强提示（防 W2/W3 V2 重演）——措辞、位置、范围？ | ok（2026-09-15，原话「ok」＝采纳推荐方案：段首位置＋黑体措辞＋31 份 prompts 全量） | 在现存 31 份 prompts/NN-*.md 的「## 收尾」段首插入黑体强提示块，原描述句保留在强提示块之后；措辞逐字＝「**❗ 收尾硬要求——以下动作缺任一项 = 本票未闭环（W2/W3 V2 重演防线）**：① 报告落盘 reports/NN-report.md；② ledger 本票行状态回写 done/deferred；③ WORKFLOW §4 追加 lessons 行；④ commit message 引用守卫结果。」；范围＝现存 31 份 prompts 全量（BACKLOG 原估 18 份已过时）；handoffs 不另加强提示（完成定义已是硬判据清单）；未来新票由 WORKFLOW §4.2.6 模板纪律继承 | 措辞逐字落地（声明类文字 1:1 对齐纪律，禁语义近似改写）；不动 handoffs 完成定义段；grill 期间不动仓——执行时点＝本轮 grill 定稿后的整理环节；整理环节同步把 #25-checklist B1.2 行状态列更新为 decided-now | current |
| D-030 | Q2（轮7）：#25-D1 23-first-report 双件套是否列为发布样例资产＋落位＋防失真机制？ | 采纳（2026-09-15，原话「采纳」＝修正后推荐 ①②③ 全项；基于 atomcode 深调研：落位惯例高置信（Go project-layout 成文 + preflight-scout/claude-config-auditor 交叉验证）、dogfooding 利弊中置信；信息缺口：无大厂官方 style guide 成文论述，结论由开源惯例归纳） | ① 确认 .scratch/architecture-recovery/reports/ 下 23-first-report.{md,json} + 23-first-report-failure.{md,json} 四件列为发布样例资产（happy+failure 双对，覆盖 D-007 Macro-B 两路径）；② 落位仓根 examples/first-report/（复制非移动，.scratch 原件留溯源链），目录带一页 README 声明「6F 自审真实产物、非合成 fixture」＋生成 commit＋日期＋重生成命令（erf/preflight-scout 披露双先例）；③ 防失真本阶段走披露制（报告自带 provenance 三锚 commit pin＋spec 版本＋data fingerprint＋detector 版本戳＋⚠ unverified 段）；样例 golden CI（CI 重渲染 fixture 并 diff、更新走 PR 审查）登记为阶段 3 候选票，与 T7 机检化同批立项 | 禁自动重生成样例直通 main（Jest/Vitest snapshot 纪律：入版本库＋code review）；样例不得被读作「当前读数」——必须披露冻结时点属性（生成 commit＋日期戳）；README/marketplace 引用只能指向 examples/first-report/ 公共路径，不得链 .scratch 工作区路径；冲突核查已执行：与 D-003/D-007/D-021/D-025/D-027 无硬冲突（辩证点记录在案：调研方 canonical＝合成 fixture，本品采纳真实自跑因披露机制已内建；家丑外扬对本品＝自举证）；执行时点＝本轮 grill 定稿后整理环节；整理环节同步把 #25-checklist D1 行状态列更新为 decided-now | current |
| D-031 | Q3（轮7）：#25-P6 最小可发布形态——Macro-B 单 scale 即上架 vs 等更多 scale？ | 采纳（2026-09-15，原话「采纳」＝修正后推荐全项；基于 atomcode 两轮取证：通用惯例轮 9 searches/6 reads/五角度＋内部约束嵌入轮（冲突核对表）；置信高；信息缺口=Agent Plugins preview 标注字段未成文、竞品占位未扫描） | P6＝Macro-B 单层＋Preview 形态即具备上架资格：① 形态=「capability 1 of 5 · preview」＋0.x 版本语义＋changelog 明示当前覆盖范围（Pichler MMP 判据：Macro-B「装完→四象限叙事→证据可溯→降级披露」已是完整价值单元）；② README/marketplace 描述首段披露能力边界，5 scale 作 roadmap 叙事非可用承诺（JetBrains 类比：不得暗示未实现功能）；③ 划界入规：build-scope（5 层全规划，ADR-0001 standing）≠ release-sequence（分层暴露），preview 上架不构成 MVP 切片；④ 其余 4 scale 各走独立 preview→GA 漏斗不打包等齐（Copilot 分级惯例）；⑤ 派生登记：Agent Plugins preview 标注字段查证＋同生态竞品 audit 插件占位扫描＝上架票前置子任务 | 本记录不授权上架动作（D-026/D-027 用户闸门不变）；不得把上架版说成「产品 1.0/完整五档审计」；降级披露机制（⚠ unverified／三层闸门）升级为对外承诺载体，preview 标注诚实是决策本体非装饰；禁止为撑首发临时补齐未验证 scale 的展示面；冲突核查穷尽 24 条 current 无 revised 需求——ADR-0002(superseded)/D-002(revised) 的宽解读风险由本条划界款吸收；执行时点＝grill 定稿后整理环节；整理环节更新 #25-checklist P6 行＝decided-now | current |
| D-032 | Q4（轮7）：#25-D2 上架期演示路径覆盖口径——仅 2/10 or 排期补齐其余 8 条？ | 采纳（2026-09-15，原话「采纳」＝终版推荐全项；基于 atomcode 两轮取证：首轮＋全约束轮 6 searches/6 reads（Snyk／MS Entra／SPFx／Boomi／LaunchNotes／Harness 原文核验）；置信高；缺口=Agent Plugins 生态无同型先例属相邻惯例外推） | ① 上架期演示面=仅 Macro-B happy+failure 2/10 路径（即 D-030 examples/first-report/ 双件），不首发补齐其余 8 路径、不交付未上架层任何预览性演示资产；② 其余 8 路径补齐时点=各层 preview 里程碑的 DoD 准入件（「该层 happy+failure 演示双件」写入每层 preview 票完成定义），不日历独立排期；③ 未上架层仅以文字披露＋roadmap 叙事＋「Not yet in preview」式标注露出（Snyk／MS／Boomi 披露制先例）；④ failure 路径首发即含属超配项（多数 preview 仅 happy path），正向保留 | 禁为未上架层造资产化演示（preview 条款不背书未发布能力，与 0.x 语义直接冲突）；演示资产与能力真实状态不得解耦（防失真纪律）；演示随版本重生成义务沿用市场 listing 规范；D-007 十路径矩阵设计不缩减，本条只定发布时序；冲突核查穷尽 26 条 current 无 revised；执行时点=grill 定稿后整理环节；整理环节更新 #25-checklist D2 行=decided-now | current |
| D-033 | Q5（轮7）：#25-B4.2 与 jiahao / anysearch-cli / env-manager 三试点仓对接的产品方向与优先级？ | OK（2026-09-15，原话「OK」＝采纳推荐全项；基于 atomcode 取证：6 searches/7 全文核验，角色框架高置信、多仓排序法中置信=a16z design-partner 框架迁移；缺口：各仓 PR 人/机比与 supersede 链完整度未实测） | 对接方向=试点仓角色绑定能力层而非仓：① 角色分配=anysearch-cli→Macro-C 校准语料（56 ADR＋supersede 链稀缺素材）／env-manager→Micro-A 唯一合格试点＋泛化验证（唯一托管 PR 面，含 dependabot/release-please 非人类 PR 边缘形态）／jiahao→Micro-B·Macro-B 回归＋下限测试（纯本地仓测「git 健全无托管」下限）／三仓并跑→Macro-A 泛化冒烟（需≥2仓天然最后）；② 时序=Macro-B 已上架层立即对三仓各跑一次 one-shot 泛化验证，jiahao 挂 Macro-B 持续回归（阶段3 CI 票），其余层试点随各 preview 漏斗；③ 前置票=试点面可用性审计脚本（PR 人/机比、supersede 链完整度实测）；④ 拆票=可用性审计→Macro-B 三仓 one-shot→各层试点→回归接入，不立大票 | 结构性限制入规：三仓同主属确认偏差面（dogfooding=generative not evaluative，OCLint 官方口径只给信心不证泛化），试点定位=校准＋冒烟；泛化验证必须引≥1 非自有公开仓（D-013 URL opt-in 首实用户），登记为 Macro-B GA 前置条件；持续回归仅限已上架层；试点成功度量=反复接受非跑通；PR 层试点不得指派无托管 PR 面的仓（capacity 硬约束）；冲突核查 26 条 current 无 revised；执行时点=grill 定稿后整理环节；整理环节更新 #25-checklist B4.2 行=decided-now | current |
| D-034 | Q6（轮7）：阶段 3 铺开次序——第二能力层选型、上游接入次序、任务 7 多写者域封口时机？ | OK（2026-09-15，原话「OK」＝采纳推荐全项；基于 atomcode 取证：6 searches/6 reads，三子问题均 ≥2 独立惯例支撑，置信高；多仓排序/基础设施封口时机为框架迁移中置信） | 阶段 3 串行骨架=扩面→Macro-C→Micro-A→Micro-B→Macro-A：① 首个铺开票=CodeLore 契约面扩开（考古层所需面＋S3/S4/S5 矩阵行拉动，单上游原则不破）；② 层序=Macro-C 第二（复用 Macro-B 行为象限管道＋anysearch-cli 试点面＋CodeLore 同源）→Micro-A 第三（env-manager 试点激活点，需托管平台 API 适配器新外部面）→Micro-B 第四（jiahao 下限＋回归）→Macro-A 最后（≥2 仓并跑）；③ 供应链象限在 Macro-B preview 报告降级为「⚠ 数据未接」，Scorecard/repomix 探针按层需求队列接入不插队；④ 任务 7 多写者域改写为触发器条款：三触发器任一即实测封口——(a) Macro-B 进 CI 定时回归、(b) Macro-C preview 共用同一 DuckDB、(c) Macro-A 启动；⑤ Macro-C preview 报告强制披露「单仓校准（anysearch-cli）」结构性限制 | 禁止 Scorecard 插队只为补齐 preview 供应链象限（降级披露制已立法）；触发器条款不得被读作铺开期前置门禁（infrastructure-last 纪律）亦不得无限拖（value lead time 变差=人为瓶颈信号）；D-024 兼容吸收：三触发器即其两字段纪律的「满足判据」登记；D-033 批一并行修正为错峰（env-manager 随 Micro-A 漏斗顺延）；冲突核查 26 条 current 无 revised；执行时点=grill 定稿后整理环节 | current |
| D-035 | Q7（轮7）：CodeLore 契约面扩开清单——扩开粒度、首批面集、sqlite dump 替代路径处置？ | 走推荐（2026-09-15，原话「走推荐」＝采纳推荐全项；事实底座=codelore analyze --help 实物枚举 56 面，非记忆） | CodeLore 扩开粒度=按「层需求×面族」分批契约：① 首批（Macro-C preview 票内）=演化主干 12 面＋S3 族 6 面＋S5 族 12 面≈30 面，逐面 golden 契约测试钉死（ADR-0014 纪律）；② LLM 面（explain 族）单独成票——env 门控＋成本面，S4 假设抽取前置，独立验收；③ sqlite/parquet 全量 fact-store dump 立为对照评估项——首批仍走逐面契约（契约即文档、golden 可测），dump 若采纳须另立 ADR（适配层语义翻译面变厚）；④ 暂缓面集（Micro 层/备用 ~20 面：function-*、clones/clone-coupling、coupling、hotspots、code-health、centrality、communities、soc、effort-exposure、code-familiarity、delivery-friction/metrics、cycle-origins/cycle-health、unstable-interface、refactoring-targets、authors、top-committers、crossing 等）登记「满足判据+复审时点」=各层 preview 前置（D-024 两字段纪律） | 禁止一次契约全部 56 面（2b 薄切片纪律）；禁止 dump 路径绕过逐面契约直通（raw 语义不出适配层——D-020）；LLM 面不得混入首批（独立 env 门控＋成本验收）；暂缓面集必须挂复审时点不得裸挂；执行时点=grill 定稿后整理环节 | current |
| D-036 | Q8（轮7）：阶段 3 票据包成型——D-029~D-035 派生项归票、编号、挂门依赖、执行次序？ | OK（2026-09-15，原话「OK」＝采纳票据包全项） | 阶段 3 票据包立案（编号续 #32 起，写回 BACKLOG）：#32 B1.2 落地=31 份 prompts 黑体强提示（机械批改，整理环节可做）；#33 T7 挂门机检化=guard 脚本扫所有挂门项「最迟时点/触发事件/复审时点」到期报警（独立小票横切兜底，阶段 3 最优先）；#34 plugin.json 修复=对齐 Agent Plugins 1.0.0 ＋AJV 校验入 guard（独立小票挂上架硬前置链，不并入分发收尾票——修正 handoff 原建议：验证独立、上架票不混工程噪音）；#35 CodeLore 扩面首批≈30 面 golden 契约（Macro-C preview 前置）；#36 LLM 面独立票 env 门控＋成本验收（S4 假设抽取前置）；#37 试点面可用性审计=三仓 PR 人/机比＋supersede 链实测脚本（试点前置）；#38 Macro-C preview=anysearch-cli 校准＋单仓校准披露＋演示双件 DoD（依赖 #35/#36/#37）；#39 Macro-B 三仓 one-shot＋jiahao 回归接入 CI（=多写者触发器 a 激活点）；#40 非自有公开仓泛化验证≥1 仓走 URL opt-in（Macro-B GA 前置）；#41 分发收尾=examples/first-report/＋README 披露页＋preview 标注/0.x 语义/changelog＋listing 资产＋preview 字段查证与竞品扫描＋凭据申请（上架动作仍属用户闸门）；#42 上游队列=Scorecard/repomix 探针＋sqlite dump 对照评估（层需求拉动不插队）。次序：#32/#33 整理环节→#34/#35 并行首票→#36/#37→#38→其余随层序 | 上架动作不授权（D-026/D-027 用户闸门不变）；票据包为立案框架非 spec——各票需求面在整理环节填实；#34 独立 vs handoff「并入分发收尾票」原建议为明示修正点；执行时点=grill 定稿后整理环节 | current |

| D-023 | Q2（轮5）：阶段 2 缺口回流中是否应接入上游组合件？调研推荐路径？ | **采纳γ路径——阶段2拆分=2a冻结校准→2b CodeLore单上游探针**。2a：在首报frozen数据（仅git CLI+DuckDB）上纯spec/文档校准16项缺口中不依赖新上游的部分，标记须上游probe才能闭合的缺口。2b：接入CodeLore一条薄垂直切片（适配器→fact→重跑首报同仓→同一spec版本diff），用diff归因数据源漂移。序列化保证单变量控制。 | 阶段2内部拆分为2a+2b两子步骤，严格序列化；2a冻结校准用现有两条上游数据、不碰代码；2b只接一个上游（CodeLore，覆盖任务1/3/10三项高优缺口），通过适配器+fact+重跑+同spec diff保证单变量归因；Scorecard/repomix仍推到阶段3（strangler fig逐项接入，避免大爆炸）。 | 2a完成前不得启动2b（序列化纪律）；2b必须带provenance锚定（commit pin+spec版本+data fingerprint）；2b适配器必须遵守D-020防腐层纪律（禁放业务规则）；不因2b接入CodeLore而在阶段2追加接入Scorecard或repomix（一条上游探针就够了）；冲突协议：D-022标revised，原记录保留，本记录（D-023）为current取代。 | current |
| D-024 | Q3（轮5）：2a 冻结校准范围如何划分？争议任务 7 如何归类？ | 采纳 γ 路径调研裁定（原话「ok」，2026-09-15；基于 atomcode R5-Q3 深调研，报告 reports/R5-Q3-atomcode-research.md） | 2a 冻结校准范围 = 三问决策树：Q1 未知变量是外部工具输出的形态/语义/规模（无法从 spec 文本或自有数据推导）→ 上游探针轮；Q2 未知变量是自家系统在负载/争用下的行为 → 自证探针（self-probe），属铺开阶段实测、不是上游探针；Q3 未知变量可由 spec 内部契约+冻结首报数据推导 → Desk calibration。经调研核验：三「必等上游」项判定成立（CodeLore explain_file 受 CODELORE_LLM_ 环境门控、Scorecard --format=probe 44 probe 字段形状须实跑固化、repomix --token-count-tree 跨仓差异巨大）；10 项 desk 可校准清单成立。争议任务 7（事实表并发写入策略）裁定 = 按域拆分（非整项 desk 亦非整项推迟）：单写者维度用 228 条冻结实测出 desk 草案并标注置信域；多写者维度登记为自证探针项、铺开阶段实测后封口；原登记前置「CodeLore DuckDB schema 复审」判定为类别错放（缺 Q2 行为证据、给的是 Q1 契约证据），标 stale 并记录纠偏理由。本条新增 self-probe 类目补全 D-023 的 desk/上游二分法，不改 D-023。 | desk 草案必须标注置信域，禁止把单写者实测证据外推到多写者域（DoD 验证域原则 + Iceberg single-writer 生产先例）；所有保留「待 probe」占位的缺口登记时须带「满足判据 + 复审时点」两字段（PMI 失效前置惯例，否则退化为无人复审的死锁项）；2b 仍只接 CodeLore，Scorecard/repomix 探针在阶段 3；本条与 A-007 SWMR 决议无冲突（多写者实测本就是 A-007 明示的 Phase 4 遗留，本条仅正式登记为 self-probe 项）；model-based estimate 只在实测验证过的域内可接受，数据不足时补测或显式降级为「模型估计待实测确认」、禁静默外推 | current |
| D-025 | Q4（轮5）：TC-2 RED（首报真发现 mean_ratio 0.2462 / Status/Date 缺失率 84.62%）处置方向？ | 采纳（2026-09-15，原话「采纳」；基于 atomcode R5-Q4 深调研 FDA OOS 框架呈报，报告 reports/R5-Q4-atomcode-research.md，resume 锚点 dd6c7fec-efce-4c24-8867-eec2ad179053） | 处置 = (c) 顺序双轨 + (d) 勘误式双读数留档 合成，权威框架 = FDA OOS 两阶段调查规程（Barr 判例/2006 指南）。执行序：① 阶段 1.5 = 14 份 ADR 人工真值表（量测审计，**先于任何 v2 实现**——真值表同时是 v2 验收 golden set 与原 RED invalidate 的 assignable-cause 证据；AIAG MSA 惯例：测量系统分析先于用测量数据做过程决策）；② 两条修复线预注册互不为条件——判据 v2 追加（接线 A-002 回退链入 detector，v1 留档，验收 = 与人工真值表一致率）∥ ADR 治理卫生票（验收 = 人工/v2 读数中真实缺失清零），互为引用、互不为完成条件；③ 发布规范 = 勘误式双读数：原 RED 不撤回不覆盖（dated measurement），v2 修正读数以勘误/并列形态发布 + 逐份 delta 表量化量测误差；RED→绿唯一合法通道 = 成对动作「原读数记 invalid（附逐份可归属原因）+ 修正读数成为 reportable value」；④ C 层「信任并行动」裁定的 disposition 按 CAPA reopen 惯例待 Phase 1（量测审计）补毕后再落——不推翻人裁定本身，只补前置调查。 | 伦理判据对称适用：「规则是否先于结果存在且有独立出处」——回退链先于 RED 交付 ⇒ v2 = 修 bug；RED 后发明指标 = HARKing；对偶地未确认量测效度前补齐 ADR 头迁就 detector = teaching to the test（(a) 路径禁区）；delta 中被确认的真实缺失部分不得因任何 detector 改动而消失；重测次数与判定规则事先写死（禁 testing into compliance）；不改写已落盘的 C 裁定原文与时间戳、不改写任何预注册文件（不可变纪律）；TC-2 v1 阈值 0.60 不动，本条只修构件解析；「事后写判据」本身是审计发现项——两线互不条件语句须以预注册措辞入库 | current |
| D-026 | Q5（轮5）：#25 前置清单 25 行拍板范围裁定；例外 2（P5 方向现在拍）与 D-012 商业层条款的冲突处置？ | 采纳（2026-09-15，原话「采纳」＝(A)+绑定表+例外 1+例外 2 冲突处置走甲；基于 atomcode R5-Q5 深调研，报告 reports/R5-Q5-atomcode-research.md，resume 锚点 5ed818fd-2d60-46f8-8396-df6a278f2a6f） | 拍板范围 = (A) 最小拍板 + 2 行现在拍例外 + 全 25 行强制绑定「最迟拍板时点 + 触发事件」决策日志（绑定表见报告 §3，整理环节写入 25-rollout-checklist 拍板状态列）。① 本轮闭合：④组失实行 3 行（B2.2 e-branch-1 不存在 / B3.1 根 README 已闭合 / B5-4 origin 已配置）+ B5-1 栈序+push（R3 收口已按授权执行 8be9db5）——关闭动作走 Fowler superseded 语义三步：改状态不改内容 + 双向指针 + 一行失实理由，禁删除或静默划掉；② 例外 1：B1.1 现在拍（处置范围 = 14 份全量、分支命名沿用票 NN-slug 既有先例，W3/W4 sc/re 形态已示范）——它是 2a 校准的 ground-truth 输入、25 行中唯一晚拍阻塞下游开工项；③ 例外 2 = D-012 边界锐化：市场**方向判定**（Agent Plugins 生态 vs 通用市场 vs 兼摄）= 本仓阶段 3 前置一扇门项（publisher ID 创建后不可改 + 凭据/审核长铅垂期把 LRM 前移，方向层按 70% 置信规则先行）；**商业条款**（定价/开源协议/竞品对比）仍属仓外按 D-003 排除不变；凭据申请在阶段 3 开工门启动；④ P6/D2 禁止单方面提前拍：按 set-based design 登记候选判据集不收窄，阶段 2 双结题（2a diff 合入 + 2b 探针结题）数据收窄；⑤ 防退化兜底入规：每行触发事件后 1 个工作日内必须拍板；事件迟迟不来以「最迟拍板时点」为硬到期日、到期重组改绑一次、再到期升级用户——禁静默滞留（LRM 超期 = 决策由默认做出）。 | 全量拍 (B) 与部分纪律拍 (C) 被调研否决（可逆项提前拍产物被阶段 2 过时化、只制造重做）；未绑触发事件的推迟不成立（退化为债）；P5 方向拍板 ≠ 上架动作授权（上架/推送仍属用户闸门 per D-012 余款）；④组关闭不改写 #25 报告正文只更新状态列；D-012 除末句外全部条款继续有效、由 D-026 承继（登记先于锐化，#25 已将 P5 划入本仓闸门、D-016 阶段 3 明含分发收尾，本轮仅消除登记先后的条款歧义） | current |
| D-027 | Q6（轮5）：P5 市场方向本体选哪个？（D-026 例外 2 的实质拍板，一扇门） | 推荐 (1)（2026-09-15，用户选定「推荐 (1)」） | P5 市场方向 = **纯 Agent Plugins 生态**：主渠道 = Agent Plugins 1.0.0 标准下 marketplace.json 指向 GitHub 仓的自助上架形态 + Claude Code 原生 .claude-plugin 双 manifest 并行（均系 D-012 既定形态），内核 CLI 随仓分发（Source-first per D-021）；npm / VS Code/OpenVSX / JetBrains 等通用市场**现在不进入、不占位、不注册**——四壳能力（GitHub Action / 自用 CLI / 报告生成器）不因此作废，只是其分发渠道上架作为两扇门类追加决策挂到阶段 2 双结题之后按 D-026 绑定表另拍。 | 不注册任何通用市场 publisher 身份/命名空间（避免未核验细节下的一扇门固化）；上架动作本身仍属用户闸门（D-012 余款 + D-026：方向拍板 ≠ 上架授权）；若日后追加通用市场需先补该市场不可逆细节与铅垂期定向调研（R5-Q5 报告 §6 缺口 3 的闭合前置）；README 上游清单/状态列不得因本条虚报可安装（发布未发生，A-030 口径不变） | current |
| D-028 | Q7（轮5）：16-rendering-split 未合并分支如何处置？（R3 收口 backlog ①，收口时因 merge-base NOT-MERGED 依安全纪律保留） | (a) 复核后删除（2026-09-15，用户选定「(a) 复核后删除（推荐）」） | 实物证明：branch tip 与 main 上 16-* 四件 blob 逐字节一致（16-render-split-check.mjs=1d79f4b9 / 16-render-split.json=36305040 / 16-render-split.schema.json=f43fe7e4 / 16-report.md=3e65706e），两笔 A-016 commit（1fff488/81961c2）零 engine 触面、commit message 信息已在报告正文与收口记录保真——分支内容已被完整并入，仅 commit 对象与 ref 残留。处置 = 整理环节执行：① 亲跑 node 16-render-split-check.mjs 复核（预期 16/16 PASS exit 0，轻量断言无构建产物）；② 满足则 $but 删除 gb-local/16-rendering-split 残留引用（unapply/delete）；③ 四 blob 等价证明清单登记进本轮收口记录。 | 守卫复核 FAIL 即中止删除并升级呈报（证据链断裂不许按原计划动手）；删除动作限本分支（不波及其他 unapplied 项）；R3 收口当时的 NOT-MERGED→保留判定不追认为错误（当时只有 commit 层证据，内容层等价证明是本轮新增）；整理环节前不动手（grill 期间不动仓） | current |

### D-027 后续影响（开放跟踪）
- 联动：#25 清单 P5 行拍板状态更新（整理环节）= 「方向已拍：纯 Agent Plugins 生态（D-027）；凭据申请挂阶段 3 开工门」；根 README 快速验证段维持「源码自举」口径无需改（方向与现状一致）。
- 阶段 3 上架票届时范围收窄为：Agent Plugins 生态自助上架 + 双 manifest 提交物（P1 预核对 baseline 衔接）；通用市场渠道如需追加另立票。



### D-026 后续影响（开放跟踪）
- **整理环节执行清单**：① .scratch/architecture-recovery/reports/25-rollout-checklist.md 拍板状态列更新：B2.2/B3.1/B5-4/B5-1 → closed-superseded（各附一行失实/在案理由 + 双向指针）；B1.1 → decided-now（范围+命名已定）；其余行「待用户拍板」改「挂门：<最迟时点>｜触发：<事件>」；② 绑定表全 25 行入本账本决策日志区（报告 §3 转录）；③ 非 VS Code 市场不可逆细节（JetBrains/OpenVSX/npm-OSSRH）未核——若 P5 方向拍向通用市场需补一轮定向调研（报告 §6 缺口 3）。
- **调研者行数偏差如实登记**：R5-Q5 只见 20 具名行、按组规则套门；#25 原件 25 行含 B4.1（取代不立项维持）与 B1.3/B5-3（A-006 维持 deferred）——本仓按原件补挂已在报告 §3 完成，组规则无冲突。
- **backlog expiry 置信度注记**：触发-到期-升级三段机制属 ADR 状态机 + 社区惯例（Pereira 3-6 月保质期）拼装，无单一权威标准（报告 §6 缺口 2），中置信采用。
- **派生待决**：P5 方向本体（选哪个市场）= Q6，属实质选择非时机问题，单独下探。
- 出处：atomcode R5-Q5 深调研（第一轮 600s 超时→探测存活→轮询至自然退出→终稿未入索引→`-c` 续跑纯输出恢复一次成功，全程未杀进程未换题重开；searches 9 / full reads 6 / 五角度 / 三引擎；锚点 5ed818fd-2d60-46f8-8396-df6a278f2a6f）。



### D-025 后续影响（开放跟踪）
- **派生立票清单（to-tickets 阶段编号）**：T-A 阶段 1.5 量测审计票（14 份 ADR 人工真值表 + 逐份 delta 表模板，先于一切 v2 代码）；T-B 判据 v2 票（adr-structure detector 接线 A-002 回退链，验收 = 真值表一致率，冻结数据重跑出并列读数）；T-C ADR 治理卫生票（真实缺失清零，验收独立于 T-B）；三者完成后 C 层 disposition 补记（reopen 闭合）。既有阶段 2 票（2a/2b per D-023/D-024）排其后。
- **先例登记**：阶段 1.5 是本产品「量测效度先行」纪律的首个实例；工业锚 = FDA OOS / TheAuditor（FP 回流规则改进、源码零改动）/ Aker Build（dated measurement 不改写、双读数并列）/ Codacy Verity（dated rule 独立沉淀）。
- **CONTEXT.md 新词候选（grill 退出时评估）**：「勘误式双读数（Dual Reporting）」——方法修订前后读数并列披露、差值即量测误差量化，_Avoid_: 重测覆盖（暗示废除旧读数）、数据迁移；「可归因原因（assignable cause）」——OOS 术语，原读数得以记 invalid 的唯一凭证，_Avoid_: 误报原因（无留档语义）。
- **冲突核对结论（2026-09-15）**：零冲突零 revised——D-017（裁定由人做，本条只补 disposition 前置）/ D-018（阈值不动，只修构件解析，同构 A-023 v2 追加机制）/ D-023+D-024（阶段 1.5 为其前置插入项，方向一致）/ A-026（首报不撤回，双读数与 Receipt 锚定同构）均保持 current。
- 出处：atomcode R5-Q4 深调研（searches 13 / 三引擎 / full reads 6 / 五角度；Lakens 403 以摘要替代、CLSI 未取原文如实登记），首轮 5h 配额中断 → 等重置后 --resume 单变量续跑一次成功（W5 锚点纪律第三次闭合）。


> 防丢账本：本会话 grill 流程中所有被用户确认的实质性结论，每条当场落盘。
> 规则：grill 中不写源码、不改目标；本文件是唯一允许持续写入的项目文件（直到 grill 结束）。
> 进入下一题前必须确认账本已写到最新。

| ID | 原问题 | 确认回答原文 | 规范化需求 | 显式约束 / 负向需求 | 状态 |
|---|---|---|---|---|---|
| D-001 | 在「宏观+微观工程内容审计」里，「宏观审计」和「微观审计」分别对应什么 scope？ | 都要包含，全都要，具体你看研究文件 | 产品必须同时覆盖 5 档 scale：Macro-A 跨仓战略 / Macro-B 仓库级 4 象限 / Macro-C 演化考古 / Micro-A PR diff / Micro-B file。5 档共享证据层（CodeLore+Scorecard）与裁决层（verdict-gate），差异在触发器与报告切片。 | 不做行级 lint（规矩非审计）；不做 PR 评论机器人形态（已明排 CodeRabbit）；不做 runtime observability（与内容审计无关） | current |

### D-001 后续影响（开放跟踪）
- 5 scale 落地后需在 rubric §7 增加"触发器切片"维度，避免 macro-B 评估套到 micro-A 上；
- Macro-A 自研战略 rubric 必须同时支持 5 scale 上下文（不能只评单仓）；
- CodeLore `diff --llm` 默认是 Micro-A 路径；`explain --llm` 默认是 Macro-B 路径——两者不能混用；
- verdict-gate 在 Micro-A 与 Macro-B 都必须工作，但触发器不同（前者 push hook，后者手动/周期）。

| D-002 | MVP 范围 — 先做哪一档 scale？ | 你先不要管先做哪个，把一共这个仓库的本质就是要做哪些：全部都先规划好所有完整的内容 | 本仓库 = 完整规划（spec-level）产物。5 scale（Macro-A / Macro-B / Macro-C / Micro-A / Micro-B）必须在 spec 层同时落地：rubric 全列、架构蓝图全画、跨 scale 集成全映射、报告模板全出。执行阶段的实现优先级排序属于本仓库外的事，不在 grill 范围。 | 禁止"先做 X、Y/Z 之后再说"的 MVP 切片；禁止在 spec 阶段把任意 scale 标"v2 再做"；禁止把跨 scale 集成推到"以后再说" | revised |

### D-002 后续影响（开放跟踪）
- Q3 必须重设：原"目标用户 / 战略 rubric / 与自有项目关系 / 商业形态"四题保留，但 MVP 切片已无意义，"实现优先级"类问题从 todo 中移除；
- rubric 不能仅聚焦单 scale：4 象限（结构/行为/供应链/战略）必须全 scale 覆盖，战略象限的维度清单是 D-002 下最高优先级缺口；
- 跨 scale 集成（数据流 / 报告聚合 / 冲突解决 / 裁决协议共享）必须作为独立规划维度，不允许分散在各 scale 章节里各说各话；
- 演示场景必须覆盖全部 5 scale，禁止"演示只演 Macro-B、Micro-A 之后再接"；
- ADR 候选：D-002 本身满足 ADR 三判据（hard to reverse / surprising without context / real trade-off）—— 等 grill 退出时写为 ADR-0001 "规划范围=5 scale 全 spec、不做 MVP 切片"。

| D-003 | 「全部都先规划好所有完整的内容」的边界 = ? | （用户未答，按 grill 推荐选项落地） | 本仓库完整规划边界 = 产品本体（规格层 / 架构层 / 集成层）+ 使用方法（演示层）。商业层（开源协议/商业模式/竞品定价）明确排除——本仓库是 spec 级规划，不是商业 BP。商业问题在本仓库外另起讨论。 | 禁止在 spec 阶段引入商业模式；禁止"演示只演 Macro-B、Micro-A 之后再接"；规格/架构/集成/演示 四层不允许缺层落地 | current |

### D-003 后续影响（开放跟踪）
- 集成层（跨 scale 数据流 + 裁决协议共享 + 报告聚合 + 冲突解决）作为独立章节写，不分散到 5 scale 各章；
- 演示层（5 scale 用户旅程 + 触发器时序 + 失败语义 + 降级路径）必须全部 5 scale 覆盖；
- 商业问题（开源协议 / 商业模式 / 竞品定价）一律"另起炉灶"，本仓库不接；
- 术语表需补充：触发器时序 / 失败语义 / 降级路径 / 报告聚合 / 冲突解决；
- ADR 候选：与 D-002 同类，grill 退出时合并写为 ADR-0001/0002。

| D-004 | approve atomcode 推荐的 5 维战略 quadrant 吗？ | approve 5 维，S5 改名"所有权边界匹配"（推荐） | 战略 quadrant 装 5 维，每维全 5 scale 覆盖：S1 定位收敛（吸收 #1 定位收敛 + #2 范围蔓延）｜S2 ADR 质量（吸收 #4 ADR + #5 决策可逆性合并）｜S3 门面预算 vs 结构预算（吸收 #3 + #9 抽象成熟度）｜S4 演化方向（吸收 #8 演化 + #10 空位与负向声明）｜S5 所有权边界匹配（原"团队拓扑匹配"改名，吸收 #6，避开 D-003 边界争议）。#7 承诺密度工业界无独立心智模型，降为 S3/S4 过程证据。 | 单人仓 S5 必须降权并在报告显式标注"信号不足"；5 dim 全部禁止仅服务于单一 scale；阈值（黄/红）声明为初版参数、预留校准机制（不锁死） | current |

### D-004 后续影响（开放跟踪）
- ADR 候选：D-004 满足三判据（hard to reverse / surprising without context / real trade-off），grill 退出时写为 ADR-0002「战略 quadrant = 5 维 S1-S5（基于 atomcode 调研）」；
- S1 判据中"定位关键词覆盖率 < 70%"为启发式阈值，需在 spec 中标注"试点校准"——不可直接当 hard rule；
- S2 判据中"事后补写（文档日期 vs 实现 commit 日期差 > 90 天）占比 > 20% 判红"——此条依赖 git blame 与 ADR 头时间戳，需先确认目标仓库是否所有 ADR 都带 YAML 时间戳头；
- S4 判据中"ADR 假设提取"目前 InfoQ 给的是理念清单，无可复用工具；spec 应声明 LLM 辅助抽取 + 人工复核回路；
- 5 维 × 5 scale = 25 个采集单元，每单元都需要证据采集法 + 数据源 + 阈值——这是 D-004 的下游 spec 任务；
- 6 项信息缺口（承诺密度文献空缺 / S1 语义度量 / S5 单人仓判据 / S4 ADR 假设提取 / 阈值跨仓校准 / 未覆盖视角）落进 ledger 信息缺口段，grill 退出前可一并扫一遍；
- 商业层概念（PMI 统计、Conway 三响应、Arcalea 战略漂移）仅作心智模型参照，未进入判据数据源——守住 D-003 边界。

| D-005 | 跨 scale 集成架构 shape = ? | approve C+A 合成（推荐） | 集成架构 = 「中心事实辐射 + 联邦裁决治理」（Hub-of-Facts with Federated Adjudication）：数据底座采 C（共享 DuckDB fact table）+ 治理协议采 A（定义集中、执行分散）。4 子决策：①数据流 = 事件单向写入 + 按需拉取投影；②报告聚合 = 独立语义层（read model），不做 UI 抓取；③冲突解决 = 证据强度优先 + 时间戳兜底 + 冲突可见可审计；④裁决协议共享 = hub 集中版本化、scale 自运行时执行、hub 只做元逻辑（裁决/契约/路由）不经过数据面。 | 5 scale 平权通过"事实层平等 + 协议层统一"实现，不通过拓扑对称；hub 是产品级组件不归任何单一 scale；冲突必须可见可审计（保留全量输出分布）；裁决 hub 不经过数据面（控制面集中、数据面直连） | current |

### D-005 后续影响（开放跟踪）
- ADR 候选：D-005 满足三判据（hard to reverse / surprising without context / real trade-off），grill 退出时合并 D-002/D-005 写为 ADR-0001「规划范围=5 scale 全 spec、不做 MVP 切片 + 集成架构=Hub-of-Facts with Federated Adjudication」；
- DuckDB fact table 是产品级 SSOT，但底层证据源（CodeLore + Scorecard + repomix + git history）写入顺序与版本控制必须明文规定——单写多读还是多写多读待 spec 阶段定；
- 事件单向写入（event sourcing 心智）= 报告可重放，但要求 fact table 写入路径只追加不可改；spec 阶段需明确 Schema 版本演进规则（AsyncAPI 事件契约心智）；
- 独立语义层（read model）= 各 scale 投影可独立优化，但增加存储与一致性维护成本——spec 阶段需明确 read model 失效策略（陈旧读 vs 实时读）；
- 冲突"可见可审计"= 保留各 scale 全量输出分布，不只最终选中项——下游失败时能重建裁决过程，否则调试成本 3-5 倍；
- OpenTelemetry Baggage 跨信号传递上下文——5 scale 分析同一 commit/PR 时用共享 span context/baggage 关联；spec 阶段引入 trace_id/baggage_id 作为 cross-scale correlation key；
- 数据契约（schema/版本）是裁决协议落地的前提——5 scale 共用 DuckDB fact table 的 schema 治理属于集成层 spec 任务，不可分散到各 scale；
- 7 项信息缺口（atomiccode §7 列出）落进 ledger 信息缺口段，grill 退出前扫一遍。

| D-006 | 5 scale 报告模板形态 = ? | C. 共享骨架 + scale 切片（推荐） | 报告模板 = 共享骨架（章节顺序：执行摘要 → 4 象限/裁决 → 证据 → 行动建议）+ scale-specific 切片。骨架在集成层共享（fact table 投影），scale-specific 切片在各 scale 独立投影。与 D-005 read model 心智一致——事实层平等 + 表达层统一骨架、scale 差异在切片层。 | 骨架设计必须兼顾 5 scale（最大公约数）；scale-specific 切片禁止跨 scale 引用（避免互依赖）；证据章节必含 grounded ✓/⚠ 引文校验盖章；行动建议章节必含 verdict-gate 印记（裁决可追溯）；模板不锁定具体措辞、只锁定章节顺序与必备字段 | current |

### D-006 后续影响（开放跟踪）
- ADR 候选：D-006 满足三判据（hard to reverse / surprising without context / real trade-off），grill 退出时合并写为 ADR-0003「报告模板 = 共享骨架 + scale 切片」；
- 共享骨架的"最大公约数"设计需要在 5 scale × 4 象限（结构/行为/供应链/战略）矩阵上找交集——这是 D-006 下 spec 阶段的具体设计任务；
- scale 切片差异最大的应是 Macro-A（跨仓战略对齐叙事）与 Micro-A（PR 行级评审）——前者宏观叙事、后者行级带引文，共享骨架必须都能容纳；
- 行动建议章节须与 D-005 裁决协议对齐——只有通过 verdict-gate 的建议才进报告，否则标 ⚠ unverified；
- 模板渲染层属于产品演示范畴（D-003 演示层），不属于规格层——spec 锁定模板结构与字段、demo 锁定渲染样式；
- grounded ✓/⚠ 引文校验盖章机制可借鉴 CodeLore narrative stamping（research §5.2）作为 Micro-A 行级章节的实证模板。

| D-007 | 演示场景设计方法 = ? | B. 关键路径 + 失败路径（推荐） | 演示场景 = 每 scale 一条关键路径（happy path）+ 一条失败路径（failure path），共 10 条路径（5 scale × 2）。每条路径四要素：触发条件 / 步骤序列 / 成功/失败语义 / 报告产物。失败路径与 D-002 失败语义要求直接对接（显式降级而非沉默失败）。10 路径共用 D-005 Hub-of-Facts 但每 scale 自运行时执行——与集成架构一致。 | 5 scale 全覆盖（禁止"演示只演 Macro-B、Micro-A 之后再接"）；10 路径必须各自独立可演；失败路径必须显式标注降级而非崩溃；每条路径最终产物必须可演示（报告渲染出来）；10 路径产物格式须与 D-006 共享骨架对齐 | current |

### D-007 后续影响（开放跟踪）
- ADR 候选：D-007 满足三判据（hard to reverse / surprising without context / real trade-off），grill 退出时合并 D-006/D-007 写为 ADR-0004「报告模板=共享骨架+scale 切片 / 演示=10 路径（5 scale × 2）」；
- 10 路径中"失败路径"是 D-007 关键创新点——把失败语义强制嵌入演示，避免产品发布后才补失败处理；spec 阶段需为每个失败路径明文规定：触发条件、降级模式、报告产物形态、是否触发 verdict-gate；
- "happy path 与 failure path 共享报告模板"——D-006 共享骨架在两条路径下都必须能容纳，failure path 的报告产物不可与 happy path 形态分离（否则用户无法对比）；
- 10 路径与 D-001 5 scale 的对应关系在 spec 阶段需逐一敲定：每 scale 触发什么典型场景（例 Macro-A=多仓战略对齐评审、Micro-A=PR 行级评审），happy path 验证 scale 本身正常、failure path 验证 scale 的降级与裁决可追溯性；
- 10 路径演示的成本/价值权衡——10 条独立可演路径维护成本不低，spec 阶段需评估是否全部要"真可点"演示或部分只需"文档可读"；
- grill 退出后，转入 spec 阶段：rubric S1-S5 全文 / 25 采集单元（5 dim × 5 scale）/ 集成层 schema / 报告模板最大公约数 / 10 演示路径——D-004~D-006 信息缺口段共 16 项需 spec 阶段扫。


## Grill 退出记录（2026-09-11）

- 决策条数：D-001 ~ D-007 共 7 条全部 current，无 stale/revised/deferred；
- ADR 落地：7 条 ADR 已写入 docs/adr/ 目录（ADR-0001 ~ ADR-0007），每条满足 ADR 三判据；
- spec 阶段任务：spec-phase-tasks.md 含 18 项信息缺口，按依赖关系组织；
- CONTEXT.md 38 术语 + 38 `_Avoid_` 已落表，intro 段已更新；
- 与 baseline 对齐：D-001 ~ D-007 与 memory+research 五轮调研 baseline 无冲突，2 次 atomcode-research 调研已分别验证；
- 8 项 grill 硬要求（决策账本 / 不写源码 / 不换目标 / 一题一答 / 防丢账本 / 退出前自评 / 不自宣结束 / 必须问是否可以定稿）全部满足。
## 覆盖率自评（退出 grill 前必填）
- 已覆盖：术语表 17 词 + D-001/D-002/D-003/D-004 共 4 条决策 + 战略 quadrant 5 维 S1-S5
- 未覆盖 / 仍开放：见上文「仍开放」清单
- 信息缺口：6 项 D-004 标注项已记入，spec 阶段扫一遍

**当前进度（动态）**：7 / 7 条决策落地，覆盖率 100%（决策层）；规格层（D-004 S1-S5 rubric 全文 / D-006 共享骨架 / D-007 10 路径明细）尚未展开，spec 阶段执行。18 项信息缺口已记入。

## 信息缺口与下一题方向

**已封口**：
- D-001 ✅ 5 scale scope 边界（Macro-A/B/C + Micro-A/B）
- D-002 ✅ MVP 切片被拒，要求 spec-level 完整规划
- D-003 ✅ 规划边界 = 产品本体（规格/架构/集成）+ 使用方法（演示）
- D-004 ✅ 战略 quadrant = 5 维 S1-S5（S5 改名"所有权边界匹配"）
- D-005 ✅ 集成架构 = Hub-of-Facts with Federated Adjudication（C+A 合成）
- D-006 ✅ 报告模板 = 共享骨架 + scale 切片
- D-007 ✅ 演示场景 = 10 路径（5 scale × 关键+失败）

**D-004 信息缺口（不阻塞 grill，进 spec 时扫一遍）**：
1. #7 承诺密度工业界无独立心智模型，已降为 S3/S4 过程证据——若 spec 需独立维度则自建判据（无外部锚）
2. S1 定位收敛的语义度量（embedding/关键词法）无行业标准工具，70% 阈值为启发式
3. S5 在单人/小团队仓库的判据效力——Conway 默认团队规模 ≥ 12 人，小仓库需降权
4. S4 的 ADR 假设提取自动化——InfoQ 仅为理念文，需 LLM 抽取+人工复核回路
5. 阈值跨仓校准——所有黄/红线目前由工业界统计 + 本地三项目锚点推导，未大样本验证
6. 未覆盖视角：AI-agent 生成代码对 ADR 质量的冲击（bool.dev AP8 只点到"别让 AI 替你做权衡"）

**D-005 信息缺口（atomcode §7，spec 阶段扫一遍）**：
7. fact table 单写多读 vs 多写多读——不同 scale 写入证据时的并发与版本控制策略
8. Schema 版本演进规则——D-005 事件单向写入要求 schema 不可改，演进路径需明文（AsyncAPI 事件契约心智）
9. read model 失效策略——陈旧读（事件已写、投影未更新）的容忍度与触发条件
10. cross-scale correlation key——OpenTelemetry Baggage 实际落地需引入 trace_id/baggage_id 字段，schema 设计前置
11. LangGraph supervisor 适配——5 scale 协调层是否直接用 supervisor（参考 10 号信源）还是自研 hub
12. data mesh 失败模式对 C 方案的逆推——A 的失败模式（无人拥有 in-between / 静默断裂 / 重复劳动）需提前设计防线
13. 工具对齐状态——metrics layer / OpenTelemetry baggage / AsyncAPI 等参考实现成熟度与本仓库语言栈的契合度（TS vs Rust vs Python）

**D-006 信息缺口（spec 阶段扫一遍）**：
14. 共享骨架的"最大公约数"具体设计——5 scale × 4 象限矩阵上的交集字段清单
15. scale 切片差异的具体边界——尤其 Macro-A（跨仓叙事）vs Micro-A（PR 行级）的表达边界
16. 渲染样式与模板结构的切分——spec 锁定结构、demo 锁定样式（避免 spec 越界到 UI）

**D-007 信息缺口（spec 阶段扫一遍）**：
17. 10 路径中"可点演示"vs"文档可读"的成本/价值权衡
18. failure path 的 verdict-gate 触发条件与报告产物形态——每个失败路径都需明文规定

**grill 退出候选清单**：
- 决策层：D-001 ~ D-007 共 7 条已封口
- 规格层：D-004 S1-S5 rubric 判据全文 / D-006 共享骨架最大公约数 / D-007 10 路径明细 尚未展开
- 信息缺口：18 项散落 ledger，spec 阶段扫

**退出前必走**：报账本条目数 + 覆盖率自评 → 问"是否可以定稿"
- Q7：演示场景覆盖 5 scale 的用户旅程
- 退出 grill：覆盖自评 + 是否定稿
- Q6：5 scale 的报告模板形态
- Q7：演示场景覆盖 5 scale 的用户旅程
- 退出 grill：覆盖自评 + 是否定稿



---

## 第二轮 Grill（2026-09-12）— 方向：补完产品定义

| ID | 原问题 | 确认回答原文 | 规范化需求 | 显式约束 / 负向需求 | 状态 |
|---|---|---|---|---|---|
| D-008 | 「进一步建设」的主干方向是哪个？（A 补完产品定义 / B 走向工程实现 / C 清理 BACKLOG / D 自有资产对接） | A | 本轮 grill 主干 = 补完产品定义：目标用户 × 使用场景 × 与外部世界接口（谁来用、何时用、用完拿走什么）。本仓继续扮演 spec-level 规划仓角色，不修订 ADR-0002（no MVP slice）与 ADR-0003（商业层排除）。 | 本轮不做工程实现选型（B 挂起）；不清理 BACKLOG 卫生票 B1/B2/B3（C 挂起）；不定义 jiahao/anysearch-cli/env-manager 对接关系（D 挂起）——三者待产品定义补完后统一重估 | revised |

### D-008 后续影响（开放跟踪）
- 本轮设计树顺序：目标用户 → 使用场景 → 外部接口；目标用户定义必须能反向解释「为什么需要 5 scale 全量」——为 ADR-0001 补上用户面佐证；
- B 方向（工程实现）若日后启动，须显式修订 ADR-0002 或另起工程仓（BACKLOG B4.1 已预告此岔口）；
- C 方向 BACKLOG B1.1/B1.2/B1.3、B2.x、B3.x 继续挂起，立票决策推迟到本轮 grill 退出后；
- D 方向（自有资产对接）在本轮只允许以「目标用户之一是否是自己」的形式出现，不进入集成细节。
| D-009 | 目标用户：这个产品做给谁？（A 技术决策者 / B 工程团队 / C agent 生态开发者 / D 自用优先） | A-D全都用 | 目标用户 = 四类全集，无排除：A 技术决策者（CTO/架构师/尽调人）＋ B 工程团队（TL/平台组/质量负责人）＋ C agent 生态开发者（claude code/codex 用户，装 plugin 进 agent 工作流）＋ D 自用（本人 + jiahao/anysearch-cli/env-manager 三自有仓）。 | 禁止收窄为单一用户类；不做时序切片与用户间优先级排序（与 D-002 拒绝 MVP 切片同风格）；「四类各自何时开始被真实服务」属实现排期，不在本轮 | current |

### D-009 后续影响（开放跟踪）
- 四类用户的「使用时刻」不同质（尽调一次性触发 vs 团队 CI 周期门禁 vs agent 工作流内嵌 vs 手动自评）——使用场景题必须按并集组织，场景清单 ≥ 4 组，禁止压成单一旅程；
- 四类用户对交付形态拉动不同：A 要叙事报告可读性（面向非作者）/ B 要 CI 门禁可靠性与低误报 / C 要 plugin 分发与 MCP 接口稳定 / D 要本地可复现——外部接口题列并集而非公约数；
- D（自用）仍是唯一能提供即时真实反馈回路的用户类——战略 rubric 判据调优以 D 为校准锚，但 D 不再是「唯一首要用户」；
- 与 ADR-0002 兼容性：四类全集是 spec-level 声明，实现优先级排序仍属仓外，不冲突；与 D-008「B 方向挂起」一致。
| D-010 | 使用场景的组织方式？（A 用户×时刻并集 / B 统一评审事件 / C 触发器优先矩阵） | A，刚好我们选中一个最佳适合大众默认模式，有需要其他模式自己设置配置就行了 | 使用场景 = 用户 × 时刻并集组织（四类用户各列场景清单，允许重叠，不强制统一旅程）；叠加默认模式规则：四类用户×时刻组合中选定**一个**「最适合大众」的组合作为产品默认形态（开箱即走的路径），其余场景/模式全部通过配置切换到达（opt-in）。 | 默认模式必须单一（不许多默认并存）；非默认模式必须配置可达，禁止把非默认场景降为二等或砍掉；默认模式的具体选定（哪类用户×哪个时刻）是 spec 必须明文写出的独立决策（见 Q4）；场景并集完整保留，默认化只改变开箱姿态不删减覆盖 | current |

### D-010 后续影响（开放跟踪）
- Q4 = 默认模式选定（哪类用户 × 哪个时刻 × 哪个 scale 组合为开箱形态）；
- 「默认 + 配置切换」隐含一个模式枚举与配置项：spec 层需定义模式枚举（mode）、取值集合、默认值——这进入外部接口题的输入面；
- 场景清单仍按并集全列；触发器类型（手动/周期/事件 hook/agent 调用）作为每条场景的属性标注，C 方案 20 单元矩阵可作 spec 阶段索引视图自动生成；
- 校验点：默认模式必须与分发渠道形态一致（Agent Plugin marketplace 为分发主渠道 per research §7.4）——默认体验若需要 CI/hook 配置才能跑通，则与一键安装渠道自相矛盾。
| D-011 | 默认模式选定：哪类用户 × 哪个时刻 × 哪个 scale 为开箱路径？（A C-agent×工作流内嵌×Macro-B / B 团队×CI×Micro-A / C 自用×手动×Macro-B / D 尽调×一次性×Macro-B/C） | A | 默认模式 = C 类用户（agent 生态开发者）在 agent 工作流内嵌时刻触发的 Macro-B 仓库级四象限评审：装完 plugin 后「说一句评审这个仓库」即可拿到四象限叙事报告，开箱路径零配置（不需要 CI / hook / 团队准备）。 | 默认模式单一且必须与分发渠道同形（marketplace 一键装 → 零配置首跑）；Micro-A CI 门禁 / 尽调一次性 / 自用手动触评全部降级为配置可达模式、不做默认；D（自用三仓）保留为 rubric 校准锚但与默认体验解耦；默认模式只声明开箱路径，不禁用或删减其余场景（D-010 场景并集完整保留） | current |

### D-011 后续影响（开放跟踪）
- 默认模式锁定后，分发形态必须与默认体验同形（Agent Plugin 五层盒子 per research §7.4）——该项研究结论从未进过决策账本，Q5 询问是否封口；
- 术语候选：Default Mode（默认模式）将成为 CONTEXT.md 新词，待 grill 退出时随本轮术语批量更新；
- spec 任务预告：模式枚举（mode 配置项）取值集合 + 默认值 + 配置切换面，需在 spec 阶段展开为外部接口输入面的一部分；
- 风险登记：默认体验绑死「agent 会话内发起」——若某分发宿主不支持 plugin 形态，该宿主上默认模式不可达（宿主支持矩阵属实现期调研，spec 层只声明前提）。
| D-012 | 分发/交付形态：A Agent Plugin 五层盒子 / B 纯 skill 包 / C 独立完整 CLI / D SaaS？ | 接受（atomcode 调研推荐 A 附三修正，呈报后批准） | 分发形态 = Agent Plugin 五层盒子（Agent Plugins 1.0.0 标准）：plugin.json + skills/ 方法论壳（SKILL.md + 战略 rubric references）+ mcp.json（kernel MCP 只读证据查询面，stdio 指向 DuckDB 事实表）+ 反向域名扩展目录（hooks 触发/呈现面）+ 随分发核心确定性 CLI（编排证据管线 + 联邦裁决 + 产出报告；同一二进制四外壳：插件内嵌 / GitHub Action / 自用 CLI / 报告生成器）。三修正：①双 manifest——标准 plugin.json 与 Claude Code 原生 .claude-plugin/plugin.json 并行发布，构建脚本从单一元数据源生成防漂移（Anthropic 不在 Agent Plugins TSC 名单，Claude Code 对标准仅部分兼容，issue #88906）；②hooks 只做触发/呈现（PostToolUse/Stop 呈现 receipt、注入证据就绪上下文），裁决一律环境外执行（内核 CLI / CI gate），hooks 永不作裁决执行点（190 项 hook 失效 + issue #21460 + SoundGate 三源实证）；③skill 壳只读隔离——rubric 与证据读取放壳内，判定/写库/出报告只能内核 CLI 执行，skill 仅允许调只读 MCP 查询面（Skill-Inject 实证注入攻击 80% 成功率）；随分发附 provenance 纪律（license + CHANGELOG + 签名收据）。 | 「零配置」精确语义 = 一次 install 命令 + 首次 MCP 工具授权（非零交互）——D-011 保持 current，本条承载其精确化；禁止把裁决逻辑放进 hook；禁止 skill 壳持有写权限或执行管线；禁止只发单 manifest（Claude Code 默认用户群会丢失）；SaaS 形态继续排除（D-003）；插件市场上架选择属商业层，按 D-003 另行决策 | revised（2026-09-15 仅末句「插件市场上架选择属商业层按 D-003 另行决策」被 D-026 边界锐化；五层盒子/双 manifest/hooks 只触发不裁决/skill 壳只读隔离/provenance 纪律及其余全部条款仍有效，由 D-026 承继） |

### D-012 后续影响（开放跟踪）
- ADR 候选：D-012 满足三判据（难反转——工程围绕盒子形态展开；无上下文会困惑——为什么不是纯 CLI/纯 skill；真实取舍——四候选显式对比），grill 退出时写 ADR-0008「分发形态 = Agent Plugin 五层盒子（双 manifest）」；
- spec 任务预告：plugin.json / mcp.json 字段契约、mode 枚举与默认值、内核 CLI 四外壳命令面、receipt 协议字段、provenance manifest 内容清单；
- CONTEXT.md 新词候选：Agent Plugin / Default Mode（默认模式）/ Receipt（裁决回执）——退出时统一评估是否入表；
- 调研证据快照：三引擎 10 查询、13 次原文抓取、8 域名、关键结论均 ≥2 独立信源；检索标签 atomcode-q5-delivery-form 可复现（ctx_search source 过滤）。

### D-012 信息缺口（spec 阶段扫）
1. Agent Plugins 1.1.0 working draft 未细读——若 hooks 标准化，扩展目录策略需复评；
2. 国内 agent 生态（Qwen/Kimi 等）对 Agent Plugins / Agent Skills 标准支持度未知——若 C 类用户含国内开发者需补调研；
3. MCP 2026-07-28 大修订细节（stateless remote transport / deprecate Sampling）仅单源——kernel MCP 若走 streamable-http 需重读规范正文；
4. Skill-Inject 论文（arXiv 2602.20156）仅摘要级——威胁模型细化需读全文；
5. Claude Code 完整兼容 Agent Plugins 1.0.0 时间表未官宣——跟踪 issue #88906，落地后原生壳可退役为纯扩展目录。
| D-013 | 目标仓输入面：A 仅本地路径 / B 本地路径默认+远程 URL 配置可达 / C 远程托管拉取？ | 接受（atomcode 调研推荐 B 附五细则，呈报后批准） | 输入面 = 本地路径为默认 + 远程 URL 配置可达。输入裁决顺序：显式本地路径 → owner/repo 形态本地优先消歧（./ 前缀强制本地）→ 显式 URL（https/git@）才 clone 到本地隔离缓存，此后全部走同一本地管线（URL 在输入面之后不复存在）。五细则：①凭据复用——clone 用本地 git 凭据链（SSH agent / credential helper / PAT 即用即清），不新建凭据存储；②不可信输入纪律——隔离缓存目录、禁远程配置执行（默认不信任被审仓的 hooks/config）、不写回用户工作区、评审后可清理；③远程一律全深度 clone（fetch-depth 0）+ 校验 .git 完整性，浅 clone 显式拒绝——这是「面向 git 记录健全的项目」的输入面落地；④入口收敛——clone 只走随分发 CLI（repo add）与配置文件，不暴露为 kernel MCP 工具，MCP 保持严格只读查询面（GitHub Copilot code review MCP 强制 readOnlyHint 的同构口径）；⑤授权清单含「远程 clone + 网络 + 本地 git 凭据使用」为一个授权事件（细化 D-011/D-012 的授权语义）。 | 禁止远程托管式拉取（等同 SaaS 输入形态，违反 D-003 商业层排除）；禁止把 clone 暴露为 MCP 工具；禁止新建凭据存储体系；浅 clone 输入必须拒绝并提示（git 记录不健全的仓不属本产品的承诺面）；D-011 / D-012 保持 current，本条承载其授权清单与只读边界的精确化，无 D 被推翻 | current |

### D-013 后续影响（开放跟踪）
- ADR 候选：输入面裁决满足三判据（难反转——输入契约定后全部管线围绕本地路径假设；会困惑——为什么不做远程托管；真实取舍——A/B/C 三案对比），grill 退出时写 ADR-0009「输入面 = 本地路径默认 + 远程 URL 配置可达（五细则）」；
- spec 任务预告：repo add 命令面、clone 缓存目录布局、消歧规则实现、授权事件清单字段、快照 zip 输入（尽调场景，视同本地路径）的等价地位声明；
- 调研证据：工业界事实标准 = 本地 checkout 后扫描（SonarQube 强制 full clone / Semgrep CI checkout→scan / TruffleHog clone-to-tmp）；B 的成熟原型 = repomix --remote / gitingest URL / TruffleHog 临时目录范式；C 形态实证 = GitHub App 托管拉取（CodeRabbit/Greptile），与 D-003 冲突被排除；检索标签 atomcode-q6-input-surface 可复现。

### D-013 信息缺口（spec 阶段扫）
1. git bundle 专门文档未读——尽调快照打包传输场景待 spec 评估是否支持为输入形态；
2. 超大仓 / monorepo 规模策略未展开——clone 体量上限与超时阈值 spec 待定；
3. Agent Plugins 规范整页未抓取（本轮只读 Google 博客与 issue）——发布前需通读正文；
4. 尽调社区一手正文（r/startups 帖）被拦未读——尽调输入面结论对应子项置信度为中。


---

## 第三轮（2026-09-12）— R2-Q7 调研呈报：spec 与工程实现边界（A+B 组合）

> 触发：子 Agent 验收标准（编译/打包/启动测活/每平台 test 闭环）预设了可构建的软件交付物，与 ADR-0002「spec-level 规划、实现属仓外」边界冲突；用户倾向 A+B 组合。
> 调研：atomcode 深度调研（检索标签 R2-Q7-engineering-boundary），报告 .scratch/macro-audit/reports/R2-Q7-atomcode-research.md。
> 冲突协议执行：D-002、D-008 已标 revised（原记录保留）；D-014 曾于 2026-09-12 经用户批准 → current，后经用户更正架构 → revised（由 D-015 承载；ADR-0010 → ADR-0011）。

| ID | 原问题 | 确认回答原文 | 规范化需求 | 显式约束 / 负向需求 | 状态 |
|---|---|---|---|---|---|
| D-014 | A+B 组合（完成 R2 spec 契约 + 进入工程实现）如何落地？ | 用户：「我偏向A+B的组合」（未拍板，待调研呈报后裁定）；atomcode R2-Q7 调研推荐：supersede ADR-0002（新 ADR-0010）+ 另起工程仓 + R2-01~05 先封口 + 工程仓 walking skeleton 验收。 | ① 写新 ADR supersede ADR-0002，确立「spec 仓角色正式化 + 工程实现迁移至独立工程仓」；② 另起工程仓承接实现（polyrepo 判据：几乎不共享代码 / spec 与实现变更节奏不同 / CI 与访问控制需隔离）；③ R2-01~05 先封口（尤其 R2-04 Agent Plugin 契约群 = 工程实现的对象），再启工程；④ 工程仓验收 = walking skeleton + smoke→sanity→regression 分层 + CI matrix（Windows/macOS/Linux × 运行时）+ liveness probe。 | 禁止 in-place 改 ADR-0002（ADR 不可变，只能 supersede；Fowler+AWS 双源）；禁止把工程实现源码落进本 spec 仓；本期验收止于「可构建/可打包/可测活/可签名」，上架/分发仍归仓外（D-003 不变）；双 manifest 单一元数据源生成无直接先例，须显式标注为自研范围。 | revised（2026-09-12 用户更正架构；由 D-015 承载） |

### D-014 后续影响（开放跟踪）
- 冲突清单（报告 §4）：C1=D-002/ADR-0002；C2=D-008（最关键，须裁定是否激活 B4.1 岔口）；C3=R2 时序；C4=D-003 商业边界；C5=D-012 五层盒子（无实质冲突）。
- 用户拍板后动作：若批准，写 ADR-0010（supersede ADR-0002）+ 建工程仓 + 按 R2-01~05 顺序封口 spec；若不批准，回退 D-002/D-008 为 current 并记录否决理由。
- 调研信息缺口 8 项（报告 §6）：Agent Plugins 规范全文未通读、1.1.0 draft、DuckDB Node 双线选型、SEA/Bun+原生模块组合、双 manifest 生成无先例、spec↔工程仓契约衔接机制、MCP 2026-07-28 修订、国内 agent 生态支持度。
- 证据：atomcode R2-Q7 报告（11 次原文 / 10+ 域名 / 三引擎交叉验证）。
- （2026-09-12 追记）D-014 后经用户更正架构 → revised；「另起工程仓」被 D-015 / ADR-0011 取代。


---

## 第四轮（2026-09-12）— 架构更正：单仓 + 子目录 + but 分支

> 触发：用户 2026-09-12 更正——「将 6F-impl 合并到 6F；分开是错误的；正确架构 = 6F 为默认项目文件夹、其余内容在子目录、but 管理不同分支（非独立仓 / 工作树）」。
> 处置：D-014 标 revised（其「另起工程仓」被更正）；新记 D-015；ADR-0011 supersede ADR-0010。

| ID | 原问题 | 确认回答原文 | 规范化需求 | 显式约束 / 负向需求 | 状态 |
|---|---|---|---|---|---|
| D-015 | 工程实现的仓形态？（单仓+子目录 vs 另起工程仓） | 用户：「将 6F-impl 合并到 6F 中，分开是错误的，正确的架构是 6F 为默认项目文件夹，其余内容在子目录，同时 but 管理不同分支，而不是隔离以工作树」 | 单仓：D:/Aworker/6F 为唯一 git 仓；实现内容入子目录 6F/engine/；并行隔离用 but 分支（非独立仓 / 非 git worktree）；6F-impl 已删除并迁入。 | 禁止另起独立工程仓；禁止用 git worktree 隔离；禁止把实现散落在仓根（必须子目录）；ADR-0010「另起工程仓」被 supersede。 | current |

### D-015 后续影响（开放跟踪）
- ADR-0011（supersede ADR-0010）已落盘 docs/adr/0011-single-repo-subdir-but-branches.md；ADR-0010 标 superseded。
- 工程内容新路径：6F/engine/（迁后 build/smoke 6/6 PASS）；6F-impl 已删除。
- 后续 VCS 均在 6F 单仓的 but 分支上操作；CI path filter 限于 engine/**。

## 第五轮（2026-09-12）— grill 轮 3：进一步建设主干方向

> 触发：轮 3 Q1（A 工程纵深 / B spec 深化 / C 端到端价值验证闭环 / D 分发生态）经用户指示提交 atomcode 深调研；调研无冲突 current 决策；用户拍板接受呈报。

| ID | 原问题 | 确认回答原文 | 规范化需求 | 显式约束 / 负向需求 | 状态 |
|---|---|---|---|---|---|
| D-016 | 轮 3「进一步建设」的主干方向选哪个？ | 接受（对呈报 D-016 草拟记录；该草拟基于 atomcode R3-Q1 深调研，五类心智模型交叉一致） | 主干 = C 端到端价值验证闭环，串行四阶段：阶段 0 = push + CI 实跑 + DuckDB fact table schema v0（事件只追加 + cross-scale correlation key）+ 确定性采集器（git log / ADR 结构扫描）；阶段 1 = Macro-B 单仓 happy path 于 6F 自身，S2 ADR 质量 + S1 定位收敛起手，跑通 采集→fact→叙事→裁决→报告，产出第一份带引文 + 裁决回执（Receipt）的真报告，同路径顺带覆盖一条失败路径（降级 + ⚠ unverified）；阶段 2 = 用实测锚回流清扫 16 项信息缺口；阶段 3 = A 铺开其余采集器/scale + D 上架收尾。 | 阶段 0~3 必须串行（唯一可并行 = 阶段 0 内 CI 实跑）；禁止 C 与完整 A 并行（稀释「最薄」）；禁止 B 与 C 并行（desk 校准 vs 实测锚双源冲突）；第一采集器为确定性采集、不接 LLM；真报告载体 =「报告生成器」CLI 外壳（五层盒子既有壳，不引入新分发形态）；顺手更正 spec-phase-tasks.md 残留失效句（「R2 全部完成前不启动工程实现」随 ADR-0002 supersede 链失效） | current |

### D-016 后续影响（开放跟踪）
- 性质声明：本决策是**实现级 tracer bullet**，不是产品级 MVP 切片——5 scale 规格完整度不变（与 revised D-002 / ADR-0002→0010→0011 supersede 链不冲突，atomcode 已逐条核对 11 条封口决策无静默改向）。
- 与 D-005 对接：fact table schema v0 是 HoF-FA 首次真实落地，schema 必须含 correlation key 字段（衔接缺口 #10；事件只追加、版本化演进规则沿用 D-005/CONTEXT 既定语义）。
- 与 D-007 对接：阶段 1 一举落地 10 演示路径中的 Macro-B happy path + 一条 failure path；其余 8 条顺延。
- 与 D-012 对接：真报告走「报告生成器」外壳；五层盒子其余壳不动、不引入新形态。
- 与 D-013 对接：6F 为本地路径输入，零授权事件 = 最薄输入。
- RAT 口径：本决策的证伪点 =「S1/S2 阈值在 6F 真实数据上能否产出非平凡结论」+「带引文与裁决回执的报告能否被信任并驱动行动」——验收口径需用户另行裁定（下一个 grill 问题）。
- 信息缺口消化顺序反转：16 项缺口从「工程前清零」改为「阶段 2 实测锚回流清扫」。
- 出处：atomcode R3-Q1 调研已落盘 .scratch/macro-audit/reports/R3-Q1-atomcode-research.md（15 源 / 14 抓取 / 12 域名）。
| D-017 | 「第一份真报告」（阶段 1 产物）的验收口径？（A 形式达标 / B 内容非平凡 / C 信任裁决） | 我偏向于A+C（提交调研前）；调研呈报后：接受（A→B→C 三层串行闸门 + 无 revised 处理） | 验收 = A→B→C 三层串行闸门：A 形式达标（共享骨架齐全 + 每条结论可回查引文 + Receipt 存在），为 smoke 层；B 内容非平凡，重定义为 RAT 预声明 kill criterion——跑 6F 之前以确定性规则写下判据并 commit 入库（候选：S2 命中真实 supersede 链异常 / ADR 状态与仓库文件现实不一致 / S1 给出可核验推理链；S1/S2 至少一维命中），未命中 = 合法实验数据（产品前提被证伪）而非失败，须回写账本；C 信任裁决四条款：① 裁定三档（信任并行动 / 不信任 / 需修订重判）且裁定依据在看报告前写死入库（防 HARKing）；② 引入构建链路外读者或对抗性清单（逐条排查「哪些结论可能是先验套话」）；③ C 裁定必须显式锚定 B 的产物（回答「非平凡判定是否可信、可行动」）；④ 裁定原文 + 时间戳回写决策账本。 | 禁止 A+C 跳过 B（三条独立工业证据链汇聚：no-finding 陷阱 / eval gaming 无 golden set / Goodhart 定律）；禁止 C 脱离 B 产物做纯结构裁定；禁止跑后补写判据（HARKing）；B 判据必须确定性、不接 LLM（与 D-016 一致） | current |

### D-017 后续影响（开放跟踪）
- 三处强化登记（**非 revised**，经用户拍板同意以本条目细化承载）：① D-006 引文校验盖章升级为「引文→结论支持关系」校验——引文齐全但撑不住结论的报告标 unsupported；② D-001 verdict-gate 以 C 层信任裁决为其外部校准锚，防裁决层退化为「自动化的形式达标」；③ D-011 下的 C 层验收判据须显式覆盖 agent 可消费性（引文可解析、裁决结构可编程引用），闭合「人裁定 vs agent 消费」视角错位。
- 阶段 1 执行次序锁定：先写 B 判据（确定性规则）→ commit 入库 → 再跑 6F 全链；atomcode 可提供 B 判据预声明草案（resume 4c4ba50a-a259-470d-8774-09d4877d9a23）。
- B 层设计要旨：「未命中」是实验的第一份合法产出（RAT/HDD 心智），严禁把未命中等同失败压回炉重跑。
- 出处：atomcode R3-Q2 深调研（置信度高；9 次三引擎查询 / 8 条全文核验 / 7 独立域名），落盘 .scratch/macro-audit/reports/R3-Q2-atomcode-research.md。
| D-018 | B 层判据（kill criterion）的构造方式？（A 全已知异常 / B 全真判据 / C 正对照+真判据混合） | 接受（对呈报 D-018 草拟记录；基于 atomcode R3-Q3 深调研呈报） | B 层 = C 构，配比 2 正对照 + 3 真判据 + 1 负对照（调研新增建议）：正对照 2 条须与真判据共享 detector 路径（同一族确定性采集器），职责仅证「管线能响应」，**不计入价值判定**；真判据 3 条承载证伪，每条预注册「可操作定义 + 显式阈值 + 命中方向 + 未中语义」，阈值跑前写死、跑后禁调（ISO 13528 纪律：判据独立于被测结果事前设定）；负对照 1 条（取预期 0 命中的已知干净片段）作特异性守卫，命中走事前约定的复核路径、不自动定罪。kill criterion 三级措辞：前置·管线健康闸（正对照 2/2 必须命中，否则实验无效、不修读数）→ 主·前提证伪闸（真判据全空且正对照 2/2 命中 =「前提未被支持」合法实验数据，回写账本、触发前提复审）→ 反向红条（真判据命中但正对照未全中 = 结果不可信、按管线故障处理）。 | 禁止正对照计入价值判定（mutation testing / KAT / 实验室 QC 三重先例）；正对照与真判据数据隔离使用、不可混报（Ferrer golden rule）；「未命中=合法数据」仅适用于真判据，正对照未中=管线故障（对 D-017 语义的细化，非改向）；负对照命中不自动定罪 | current |

### D-018 后续影响（开放跟踪）
- 五线证据汇聚（临床 ICH E10 assay sensitivity / ISO 13528 能力验证 / OWASP Benchmark+NIST Juliet / mutation testing / NIST CAVP KAT），置信高；调研确认「无单一综述断言混合=标准」，结论以多领域汇聚形态成立。
- 真判据 3 条的候选草案（阈值待用户测定后入库）示例：S2a 事后补写检测（ADR 文档时间戳与首 commit 间隔 >90 天占比）、S2b 五件套结构完整度、S1 定位关键词实测覆盖率；正对照首候选 = spec-phase-tasks.md 残留句 vs ADR-0002 supersede 链。
- 负对照的「已知干净」本身可能错——命中后走复核路径（信息缺口存档），不自动定罪。
- 阶段 1 执行序更新：先起草 B 层判据预声明文档（三级措辞 + 2+3+1 判据表）→ 用户审阅 → commit 入库 → 再跑 6F；atomcode 可提供草案（resume 3a3d4bf5-3d4f-4ac4-9d83-b69aea3bbfba）。
- 出处：atomcode R3-Q3 深调研（15 次三引擎查询 / 13 篇全文核验 / 9 域名），落盘 .scratch/macro-audit/reports/R3-Q3-atomcode-research.md。

| D-019 | 轮 4 Q1：下一阶段主干议题与节奏？（A 上游组合件策略为主干+根 README 组合件结构阐述 / B 只补 README 可见性 / C 复议 ADR-0012 节奏） | 更加偏向于继续按照之前心智模型的计划走，但 Q1 整个提交 atomcode 深度调研（原话全文见规范化需求①，2026-09-13） | ① 原回答原文：「按照你这么说的话，那我更加偏向于继续按照之前心智模型的计划走，但是还是将当前问题 Q1 整个提交 atomcode 深度调研，调研时必须回顾：decision-ledger 中全部 current 记录、docs/adr 与 CONTEXT.md 现有条目、工业界成熟落地的心智模型（重点），给出推荐与理由。若调研结论与账本中任何 current 决策冲突：禁止静默改向——把对应 D-xxx 标记为 revised（保留原记录），生成新的 D-xxx 记录呈报给我，等我拍板后才继续下探。」② 主干议题 = 上游组合件策略（上游引入方式 + 护城河/黏合剂边界 + 根 README 组合件结构阐述为其自然产物）；③ ADR-0012 节奏不复议——按既有四阶段计划走，组合件接入对应阶段 2/3（A-028/A-030，票 #24/#25）；④ 调研回顾范围 = 两本账本全部 current 记录 + docs/adr 13 篇 + CONTEXT.md 46 词条 + 工业界成熟落地心智模型（重点），输出推荐与理由 | 冲突协议：调研结论与任何 current 决策冲突时禁止静默改向——对应 D-xxx 标 revised（保留原记录）、生成新 D-xxx 呈报、等用户拍板后才继续下探；grill 期间不动源码；push 前必停 | current（倾向已确认；atomcode 调研中，最终拍板待回报）**→ closed（2026-09-14 用户拍板「采纳」，派生 D-020）** |

### D-019 后续影响（开放跟踪）
- 调研落盘：.scratch/macro-audit/reports/R4-Q1-atomcode-research.md（atomcode 单问串行，timeout 600000，-p 只放问题本体）。
- 冲突候选清单（调研回报后逐条核对，命中即走 revised 协议）：D-012/ADR-0008（分发五层盒子）、D-016/ADR-0012（四阶段节奏）、ADR-0005（HoF-FA）、ADR-0009（输入面 clone-to-local）、D-015/ADR-0011（单仓子目录）、A-021/A-022（fact schema v0 与确定性采集器实现决策）。
- 最终拍板前不基于调研结论下探新问题；拍板后在本块追加拍板结果或派生 D-020。
- 2026-09-14 拍板结果：**采纳**（派生 D-020，D-019 闭环）。

| D-020 | D-020 拍板：上游组件引入方式 = 双轨制 + 逃生舱？（基于 atomcode R4-Q1 深调研呈报，报告落盘 reports/R4-Q1-atomcode-research.md） | 采纳（2026-09-14，原话：「采纳」） | 上游引入方式定版双轨制 + 逃生舱：①主线 = 适配器 + 外部 CLI/库，逐上游锁定版本 + golden 输出契约测试——进程/容器边界为天然防腐层（工业先例：super-linter 容器捆绑、hashicorp/go-plugin subprocess+RPC、Terraform plugin protocol 版本化契约）；②库形态上游走包管理器 + lockfile hash pinning，不为统一强推全部 CLI 化（kusari 三档 pinning 判据 branch/tag/hash）；③vendor 源码进仓仅两种情况逃生：具体上游需离线/气隙分发、或上游废弃且无替代，启用时必须带 UPSTREAM 清单 + patches/ 目录纪律。README 组合件阐述范本 = arc42 三视图一页化 + Backstage 所有权分割 + super-linter 上游清单表（README 蓝图另立 Q2 拍板） | 禁止 vendor 活跃迭代的大依赖树上游（一手数据：vendored C 库中位年龄 3 年+、SCA 扫描失明、SBOM 无法出具）；适配层禁放业务规则（Microsoft ACL 判据）；上游 raw 语义不出适配层；本条为阶段 2/3 补位决策，不修订 D-012/D-016/ADR-0005 | current |

### D-020 后续影响（开放跟踪）
- 冲突核对结论（2026-09-13）：零冲突、零 revised——与 D-012/D-015/D-016/D-017/D-018、ADR-0005/0008/0009/0011/0012/0013、A-021/A-022 全部一致；ACL 判据强化 ADR-0005（事实表 schema = 唯一允许上游语义落地的边界）。
- 调研召回偏差记录：调研④所称「D-00X 复用 Receipt Gate / agent-completion-gate」无账本出处（全仓 grep 无 agent-completion-gate 字样；Receipt Gate 仅 Micro-A 数据源词条）——不采纳为事实；其合并措辞与 A-026 自研双锚 Receipt 交付一致。
- 派生待决：Q2 根 README 五段式蓝图；运行时解析策略（容器捆绑 vs 二进制发现，前置 = 读 Agent Plugins 1.0.0 plugin schema 原文）；上游清单表含「已接入/规划中」状态列（已接入：DuckDB/git；规划中：CodeLore、OpenSSF Scorecard、repomix/gitingest——以账本/spec 为准）。
- 实施落点：阶段 2/3（A-028/A-030，票 #24/#25）；grill 定稿前不落盘 README、不动源码。

| D-021 | Q2：根 README 组合件结构 = 调研五段式蓝图（新建仓根 README.md）？ | 采纳 A（2026-09-14，原话：「采纳A+ [$readme-crafter-skill]」） | 仓根新建 README.md，五段式：①一句话定位（证据采集大部分来自上游，裁决/schema/回执是我们的）；②三层盒子图（对应五层插件）+ 上游清单表（组件名｜形态｜引入方式｜锁定策略｜状态）；③Runtime View Mermaid 数据流（仓库输入→采集器→事实表→裁决→回执→报告，每箭头标注谁产出/谁消费/以什么契约）；④所有权表（Backstage 式：是我们的 vs 借来的）；⑤契约声明（上游经适配器进事实表，raw 语义不出适配层；上游换实现，事实表 schema 不动）。裁量四点：位置=仓根新建；定位=薄地图（架构细节外链 docs/，构建命令留 engine/README.md 不重复）；上游清单表带已接入/规划中状态列（已接入：DuckDB、git；规划中：CodeLore、OpenSSF Scorecard、repomix/gitingest）；落盘时机=本轮 grill 定稿后的整理环节一次写入。写作工具 = readme-crafter-skill（SKILL.md 已全文读入） | 上游清单表不得虚报进度（规划中不得写成已接入）；不暗示已发布（npm 包/插件上架未发生，A-030 deferred）；禁止发明社会证明与装饰性徽章（license=UNLICENSED 不放 license 徽章）；语言中文（与仓内文档一致）；grill 定稿前不动盘 | current |

### D-021 后续影响（开放跟踪）
- readme-crafter-skill 兼容性核对（2026-09-14）：与五段式零冲突——skill 定位「README=front page 不是全文档」对应薄地图裁量；「Monorepo: root README as navigation hub」正对 6F 形态；Mermaid 原生渲染支撑段③；evidence model（unverified 不写）支撑状态列如实标注。skill 分类落位：项目类型=Monorepo Hub / Agent or AI Tool，分发姿态=Source-first，受众=Evaluator+Power User 为主（AI Agent 次要），气质=Developer Utility；skill Phase 3 interview 已由 grill Q1/Q2 等价完成，Phase 4 plan 已由五段式拍板等价完成。
- 写入执行清单（定稿后整理环节）：skill Phase 1 SCAN（事实采集，仓根现状+engine 元数据+CI）→ Phase 5 GENERATE（按五段式逐段，命令/路径对实物核验）→ Phase 6 VERIFY（quality-checklist 11 项 + repo-integrity hard-compare）→ 产出 3-5 条后续建议清单（如 CI 徽章、hero 图）。
- 6F 特殊纪律：license=UNLICENSED（engine/package.json）→ 不放 license 徽章；发布态未发生 → 不暗示可安装；CI 徽章（engine-ci.yml 实跑在案）作建议不作默认。
- 定稿后配套（按 domain-modeling 惯例）：D-020 具 ADR 三条件（难逆/无上下文会困惑/真实取舍）→ 起草 ADR-0014；D-021 属文档结构不立 ADR；CONTEXT.md intro 追加轮 4 一行。

### D-024 后续影响（开放跟踪）
- **整理环节执行清单（定稿后写入 spec-phase-tasks.md，grill 期间不动该文件）**：① 任务 7 前置「CodeLore DuckDB schema 复审」改注为 ~~stale~~ + 纠偏理由（类别错放：Q2 行为证据 ≠ Q1 契约证据）+ 新前置（单写者域 = 首报 228 条冻结实测，2a 可出带置信域草案；多写者域 = self-probe 项，复审时点 = 阶段 3 铺开多采集器后）；② 任务 1/3 前置改注「探针时点 = 2b（CodeLore）」；③ 任务 5 内部 S3/S4/S5 行注「占位待探针（探针时点 = 2b / 阶段 3）」；④ 所有保留待-probe 占位的缺口登记补两字段：满足判据 + 复审时点。
- **CONTEXT.md 新词候选（grill 退出时评估）**：「自证探针（self-probe）」——自家系统在负载/争用下行为的实测校准类目，与上游探针（外部工具形态/语义/规模）和 desk calibration（契约+冻结数据推导）三分类互斥完备。_Avoid_: 基准测试（暗示性能测试而非缺口校准）、自测（暗示单元级）。
- 冲突核对结论（2026-09-15）：零冲突零 revised——D-023 的 desk/上游二分法被本条补全为三分类（self-probe 显式命名），方向一致不推翻；A-007 SWMR 决议不受影响（多写者实测本就是其明示遗留）。
- 出处：atomcode R5-Q3 深调研（8+ 检索 / 三引擎 / 8 篇原文 / 8+ 域名 / 五角度；PMI 源 403 经 pmessentials 交叉），落盘 .scratch/macro-audit/reports/R5-Q3-atomcode-research.md（resume 锚点未捕获，全文可经 ctx_search 检索词找回）。

## 轮 4 收口对账（2026-09-14）

> 数据源纪律：本节由账本自身枚举生成（17 条 current）；去向列引用的文件均经实物核验存在（ADR-0001~0013、spec.md ## Implementation Decisions 与 R2-01~05 节、spec-phase-tasks.md 任务 1~18 / R2 / R3 表、根 README.md、docs/adr/0014、handoffs/next-round.md）。

| D-xxx | 状态 | 去向（spec 条目 / 计划表条目号 / 整理产物） |
|---|---|---|
| D-001 | current | spec 条目：ADR-0001 + CONTEXT.md「Macro Audit / Micro Audit / Scale」词条；判据细节 → spec.md Decision 4.5 + 计划表任务 1~5 |
| D-003 | current | spec 条目：ADR-0003（规划边界 = 产品本体 + 使用方法，商业层排除） |
| D-004 | current | spec 条目：ADR-0004 + spec.md Decision 4.1~4.6；计划表条目：任务 1~6 |
| D-005 | current | spec 条目：ADR-0005 + spec.md Decision 5.1~5.7；计划表条目：任务 7~13；阶段 0 部分已实现（R3-02，A-021） |
| D-006 | current | spec 条目：ADR-0006；计划表条目：任务 14~16 |
| D-007 | current | spec 条目：ADR-0007；计划表条目：任务 17~18；Macro-B happy+failure path 已由 R3-05 首报覆盖（A-026） |
| D-009 | current | 计划表条目：R2-01 → spec.md「R2-01 目标用户四类全集」（已封口） |
| D-010 | current | 计划表条目：R2-02 → spec.md「R2-02 使用场景并集 + mode 枚举」（明注覆盖 D-010） |
| D-011 | current | 计划表条目：R2-03 → spec.md「R2-03 默认模式开箱路径契约」+ CONTEXT.md「Default Mode」词条 |
| D-012 | current | 计划表条目：R2-04 → spec.md「R2-04 Agent Plugin 契约群」+ spec 条目 ADR-0008 + CONTEXT.md「Agent Plugin / Receipt」词条 |
| D-013 | current | 计划表条目：R2-05 → spec.md「R2-05 输入面契约」+ spec 条目 ADR-0009 + CONTEXT.md「Repo Intake」词条 |
| D-015 | current | spec 条目：ADR-0011（单仓 + 子目录 + but 分支）+ 实体落地 engine/ |
| D-016 | current | spec 条目：ADR-0012；计划表条目：R3-01~03/05（已闭环，A-019~A-027 implemented）+ R3-06/R3-07 = 票 #24/#25（backlog，A-028/A-030 deferred） |
| D-017 | current | spec 条目：ADR-0013；计划表条目：R3-04/R3-05（已实现：预注册文档 + 首报 A→B→C，C 裁定 supported） |
| D-018 | current | spec 条目：ADR-0013；计划表条目：R3-04（22-criteria-pre-registration.md，2+3+1 判据入库，A-023~A-025） |
| D-020 | current | spec 条目：docs/adr/0014（本轮起草落盘）；实施落点 = 阶段 2/3 → 票 #24/#25（backlog） |
| D-021 | current | 本轮整理产物：根 README.md（五段式，readme-crafter-skill 流程）+ handoffs/next-round.md（下轮任务书） |

**无去向记录清单：空** —— 17/17 current 全部有去向。非 current 处理：D-002/D-008/D-014 = revised（原记录保留；D-014 由 D-015 承载、D-008 内容由 R2-01~05 承接）；D-019 = closed（拍板采纳派生 D-020）。


| D-022 | Q1（轮5）：源码推进的阻塞面是什么？阶段2/3按什么节奏推进？ | **A — 维持 VVL 既定节奏**：先拍板 #25 checklist，然后按 R3-06→R3-07 串行推进（先缺口回流，再铺开）。不跳过阶段 2 直接铺开到阶段 3（那会回到 D-002 禁 MVP 切片的老路）。 | 阶段 2/3 继续遵循 ADR-0012 四阶段串行模型：阶段 2（R3-06 缺口回流）必须在阶段 3（R3-07 铺开+分发）之前完成；#25 checklist 中待拍板项构成阶段 2 启动闸门，需用户逐项裁定后再立票开工。 | 禁止跳过阶段 2 直接铺开其余 scale（违反 D-002 禁 MVP 切片精神）；禁止在缺口未回流前接入新上游组合件（先看清全貌再动手）；阶段 2 开工前须用户拍板 #25 checklist 中至少 B1/B3/B4 类立票项的范围与优先级。 | revised |

## 轮 5 收口对账（2026-09-15）

> 数据源纪律：本节由账本自身枚举生成（程序化：28 条 = 22 current / 5 revised / 1 closed）；去向列引用的文件均经实物核验存在（本轮整理环节新产物：docs/adr/0015、0016；spec-phase-tasks.md 第五轮 R4 节；25-rollout-checklist.md 拍板状态列；CONTEXT.md 轮 5 intro + 4 新词 46→50；README.md 数字同步；reports/R5-Q3/Q4/Q5-atomcode-research.md）。
> 轮 4 收口对账表（17 行）仍有效，本轮只覆盖 D-022 起的增量与 D-012 状态变更；旧行去向不重复。

| D-xxx | 状态 | 去向（spec 条目 / 计划表条目号 / 整理产物） |
|---|---|---|
| D-022 | revised | 原「禁止缺口未回流前接上游」被 D-023 序列化控制取代（原记录保留） |
| D-023 | current | spec 条目：docs/adr/0015 §Decision-2；计划表条目：spec-phase-tasks.md R4 节（R4-01~05） |
| D-024 | current | spec 条目：docs/adr/0015 §Decision-1；计划表条目：任务 1/3/5/7 注记纠偏（任务 7 前置标 stale、按域拆分）；CONTEXT.md「Self-probe（自证探针）」 |
| D-025 | current | spec 条目：docs/adr/0015 §Decision-3；计划表条目：R4-01（量测审计）/ R4-02（v2）/ R4-03（治理）+ C 层 disposition 补记项；CONTEXT.md「Dual Reporting」/「Assignable Cause」 |
| D-026 | current | 整理产物：25-rollout-checklist.md 拍板状态列 24 行 + §8 注记（superseded 三步关闭 B2.2/B3.1/B5-4 + closed B5-1）；绑定表权威文本 = reports/R5-Q5-atomcode-research.md §3；CONTEXT.md「LRM Binding」 |
| D-027 | current | spec 条目：docs/adr/0016；25-rollout-checklist.md P5 行「方向已拍」；README 上游清单/发布口径不变 |
| D-028 | current | **本轮整理环节已执行完毕**：16 守卫亲跑 16/16 PASS（exit 0，soft-warn 1 = spec.md「布局」属设计层）→ git update-ref -d 删 gb-local/16-rendering-split 残留 ref（but branch delete 对 remote 类无机制，循 R3 收口先例例外）→ 等价证明：四件 blob 逐字节一致（check=1d79f4b9 / json=36305040 / schema=f43fe7e4 / report=3e65706e）+ 1fff488 与 main 树差空；三 main（main/origin/main/gb-local/main）均 8be9db5，but branch list 清零 |
| D-012 | revised | 仅末句商业条款被 D-026 锐化（去向：ADR-0016 渠道方向 + D-027）；五层盒子余款去向不变（ADR-0008 / spec R2-04 / CONTEXT 词条，见轮 4 对账表） |

**无去向记录清单：空** —— 22/22 current 全部有去向（16 条沿轮 4 表 + 6 条本表；revised/closed 按原记录保留规则处理）。

### 轮 5 整理环节执行记录（2026-09-15）

- 对账闸通过 → 依次落盘：spec-phase-tasks.md（5 行注记 + R4 节）→ 25-rollout-checklist.md（24 行状态列 + §8 注记）→ ADR-0015/0016 → CONTEXT.md（intro + 4 词 = 50）→ README.md（4 处数字）→ D-028 清理执行 → 本节 → handoffs/next-round.md。
- 全部写入经 node.js（默认执行环境），每文件写后回读验证（无 BOM / 关键片段存在断言）；未触 engine/**，无构建产物。
- 冲突协议全程零静默改向：本轮 2 次 revised（D-022、D-012）均先呈报后落盘、原记录保留。

## 轮 6 收口对账（2026-09-15）

> 数据源纪律：本节由账本自身枚举生成（36 条 = 30 current / 5 revised＝D-002/008/012/014/022 / 1 closed＝D-019）；去向列引用文件均经实物核验（本轮新产物：docs/adr/0017；CONTEXT.md 4 新词 50→54；25-rollout-checklist.md 5 行状态列＋§8 注记；BACKLOG.md 阶段 3 票据包 #32~#43；spec-phase-tasks.md 第六轮 R5 节；WORKFLOW §4.2.6 第 6 条；prompts/ 31 份黑体块；handoffs/next-round.md）。
> 轮 4/5 对账表仍有效，本表只覆盖 D-029 起增量；本轮零 revised、零状态变更。

| D-xxx | 状态 | 去向（spec 条目 / 计划表条目号 / 整理产物） |
|---|---|---|
| D-029 | current | 计划表条目：BACKLOG #32（已执行：31 份 prompts「## 收尾」段首黑体块，逐字措辞落地）＋25-checklist B1.2 行→decided-now＋WORKFLOW §4.2.6 第 6 条模板继承 |
| D-030 | current | 计划表条目：BACKLOG #41（examples/first-report/ 复制＋披露 README）＋#43（golden CI 候选票）＋25-checklist D1 行→decided-now |
| D-031 | current | spec 条目：docs/adr/0017（preview 发布模型＋build-scope/release-sequence 划界）；计划表条目：BACKLOG #41；25-checklist P6 行→decided-now |
| D-032 | current | spec 条目：docs/adr/0017 §Decision-4（披露非演示）；计划表条目：BACKLOG #41＋各层 preview DoD（#38 等票完成定义）；25-checklist D2 行→decided-now |
| D-033 | current | 计划表条目：BACKLOG #37（可用性审计）/#39（三仓 one-shot＋jiahao 回归）/#40（非自有仓 GA 前置）；25-checklist B4.2 行→decided-now |
| D-034 | current | spec-phase-tasks.md 第六轮 R5 节（阶段 3 串行骨架）；BACKLOG 次序注记；三触发器→#33 机检输入、#39＝触发器 (a) 激活点 |
| D-035 | current | 计划表条目：BACKLOG #35（首批 ~30 面）/#36（LLM 面独立票）/#42（dump 对照评估＋上游队列）；spec-phase-tasks.md 暂缓面集两字段注记 |
| D-036 | current | 整理产物：BACKLOG.md #32~#43 立案＋spec-phase-tasks.md R5 节＋本节对账 |

**无去向记录清单：空** —— 8/8 增量 current 全部有去向（22 条旧 current 沿轮 4/5 对账表不变）。

### 轮 6 整理环节执行记录（2026-09-15）

- 对账闸通过 → 依次落盘：prompts 31 份黑体块（#32 执行）→ 25-checklist 5 行＋§8 注记 → WORKFLOW §4.2.6-6 → README/spec.md ADR 计数同步 → ADR-0017 → CONTEXT.md 4 词 → BACKLOG #32~#43 → spec-phase-tasks R5 节 → 本节 → handoffs/next-round.md → but commit。
- 全部写入经 node.js（默认执行环境），写后回读断言；未触 engine/**，无构建产物。
- 冲突协议全程零静默改向：本轮 0 revised；#43 系 D-030③ 登记候选票，并入票据包尾（编号续 D-036 包体自然延伸）。
- D-030 落位动作归票 #41（D-036 归票为最新裁定）；D-030 约束款「执行时点＝整理环节」解读为「整理环节起的票据生命周期」，实物复制在 #41 执行窗口完成——两点张力如实登记，不静默调和。
