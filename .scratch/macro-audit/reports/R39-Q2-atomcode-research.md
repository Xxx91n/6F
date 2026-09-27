# R39-Q2 批2-β 三面裁定调研报告

> atomcode 调研归档（resume handle：db75e511-8e42-4883-b569-32bcbbac1285）。题面=R39-Q2-research-prompt.md；run 于 2026-09-27。

**Sufficiency Gate**：searches: 7（Exa×2 · Tavily×4 · AnySearch×1）| angles: 5 类全用（Official: GitHub CodeQL docs/ESLint docs/ADR 官方仓；Comparative: eslint-seatbelt vs baseline 族、mutation 视角对比；Criticism: 恒真断言反模式/test-smells；Currency: Notion 2025 棘轮文、2024 CodeQL changelog；Community: Reddit/HN/SE.SO）| full reads: 6（eslint-seatbelt README 全文、GitHub code-scanning alerts 文档、dismiss-alerts README 全文、Notion 棘轮博客全文、ruff#1149、ESLint configure rules 文档）| gaps: ADR「单决策含取舍」无逐字工业术语，以 Nygard/ADR 官方仓/Microsoft 三源类目判据合成，已标注外推。

## 1) 执行摘要（TL;DR）

- **面A**：推荐 (i) 最小修法＋ADR-0024 单件同收——「文本提及即豁免」改「剥后源码 strip 消费位」是探测器判定语义的难逆转变更，命中 Nygard「影响后续工作/难逆转」ADR 门槛；置信高（先例闭环：CodeQL codeql[rule-id] 抑制注释「只作用于紧邻下一行、绝不扩散」＋ESLint disable 注释逐行定位，全是「消费位精确锚定」先例）。
- **面B**：推荐 (iii) dry-run→delta 全量 D-094 分诊→转 enforcing——与 CodeQL baseline-ratchet / eslint-seatbelt / mutmut-ratchet 的「新违例硬门＋存量容忍棘轮」统治性形态同构且兼容；置信高。一步全开 (i) 会把数十级新检出一次性砸进门禁制造噪声洪峰，违背棘轮「只减不增」的渐进收紧纪律；两级启用 (ii) 徒增一次裁定而无收益。
- **面C**：推荐 (ii) 摘死项＋S1 改写为可达性自检——恒真断言在 mutation testing 视角下是零杀敌力的 test-smell（tautological test，Autonoma/ploeh/testsmells.org 三源一致），但直接摘除丢掉豁免面漂移保护；改写为「SCAN_EXEMPT ⊆ walked 枚举面」不变式后自身仍须防字面钉，须过面A修好后的剥后消费位扫描＋D-094③ 归因注记。置信中高（(iii) 册外锚把自检面外移，与「册内可达性自检」先例不合）。
- **ADR 颗粒度**：ADR-0024 单收①②两变更合规——两者同属「探测器判定语义硬化」一族，②的新检出注册通道复用既有 D-094 门非新决策；但面C③摘除项不进 ADR（处置类非架构决策）。置信高。

## 2) 分点结论（五个专项问题逐一）

### ① linter/scanner 收紧扩面的 baseline-onboarding 惯例：一次性冻结 vs 分级启用 vs 直接 enforcing

结论：直接 enforcing + committed baseline（存量容忍、新违例硬门）是统治性形态；dry-run/报告态只是其 onboarding 波次，非独立终态。

- CodeQL baseline-ratchet（GitHub 官方 ADR 先例，本仓 D-153 已引）：rollout 时只对新出现的 alert 硬门，存量告警以 baseline 容忍，--deny-unused-baseline 型棘爪保证「已还清的债不删=红」——基线只减不增。【github.blog changelog 2024-07-10；github.com/astral-sh#1149 ruff 社区同型诉求】
- eslint-seatbelt（Notion 内部工具开源版，2025 博客全文已核）：「starts loose, but can only get tighter」——新规则直接以 error 模式启用（明确指出 warning 模式毫无意义），存量错误记入 ratchet 文件冻结，修复自动收紧、新增即 CI 红：「we only allow lint rules to report as errors... every ESLint warning and error people see is actionable」。【notion.com blog 2025-03-03；github.com/justjake/eslint-seatbelt README】
- Android Lint baseline 官方文档：「baseline snapshot lets you start using lint to fail the build without having to go back and address all existing issues first」——同样是「直接 fail-build＋存量入册」一步到位。【developer.android.com/studio/write/lint】
- 本仓先例（R28-Q8 报告，知识库在案）：detekt（create/check 双任务）、gitleaks（--baseline-path 只报新 issues exit 1）、mypy-baseline（sync/filter 分离）——同一形态在四工具独立收敛。

对三候选的裁定：候选 (i)「一步全开 enforcing」缺 baseline 缓冲、数十级新检出一次砸门=反惯例；候选 (ii)「分级启用两波」在 baseline 形态下没有意义——baseline 本身就是「新门全开＋存量分级消化」，多加一波徒增一次裁定链往返；候选 (iii) 是 (i)+(baseline) 的合法先导波次，但须限时转 enforcing 并显式声明转窗，否则 dry-run 长期化重演 Notion 批评的「warning 被无视」病。故 (iii)，但只作过渡波。

### ② suppression 判据从「文本提及」改「消费位」先例

结论：工业先例全部锚定消费位（抑制注释与其作用的代码行精确相邻），没有任何主流工具接受「文件里提到过规则名即豁免」。

- CodeQL AlertSuppression.ql（dismiss-alerts README 全文核验）：codeql[rule-id] 注释只作用于紧邻下一行，官方 Tip 明言「a single codeql[rule-id] comment does not spread over a whole block of code — it applies to the next line only」；lgtm[rule-id] 限同一行。范围控制精确到行，注释出现在文件其他位置零效力。
- ESLint disable 注释（官方 Configure Rules 文档全文核验）：eslint-disable-next-line / eslint-disable-line 均为行级锚定；官方同时警告「Disabling rules inline should be restricted and used only in situations with a clear and valid reason」——抑制本身须附理由，无理由提及即豁免更不可能成立。
- Biome 强制豁免附理由分档（D-153 已引）：豁免须显式理由注记，非匿名提及。
- 判据哲学一致：抑制是「此处此规则已知可容忍」的局部声明，不是「此文件与规则有过一面之缘」的全局豁免。本题现状「注释提及 stripComments 即豁免整文件扫描」正是全局豁免反模式，实测 comment-only 逃逸=0 件只说明未爆，不说明免疫。

### ③ 恒真断言：删除 vs 改写不变式（mutation testing 视角）

结论：mutation testing 视角下删除不是首选，改写为可杀（killable）不变式断言是判据正解。判据＝该断言是否对任何变异可失败：

- 恒真断言=零杀敌力：Autonoma 五形态分析＋ploeh《Tautological assertion》全文级（「It can never fail」）＋testsmells.org（assert(true) 恒过=Sensitive Equality 同族 smell）＋randycoulman.com tautological-tests——四源一致：断言两侧同源/断言自带被测词 ⇒ 结构上不可能失败 ⇒ mutation score 贡献为零。
- S1 现状：「普查豁免面枚举在册」断言文本自带被搜词（'75a-check.mjs'/'guard-all-run.mjs'）=自指恒真——任何实现漂移都不红，是标准 tautological assertion。但删除丢掉的是「豁免面曾有意登记」这一定位锚——D-094③ 又禁止静默摘除，故纯摘除 (i) 需归因注记兜底，可行但保守。
- 改写判据（mutation 视角）：新断言「SCAN_EXEMPT ⊆ walked 枚举面」对任何一侧集合的变异都可失败（摘除枚举项→红；豁免集膨胀越界→红）——符合「killable assertion」标准。这正是本仓 75a-C2「零悬空条目」的镜像不变式，语义自洽。
- 候选 (iii)「挂 register meta 册外锚」：把自检面移出被扫树。反对：可达性自检的工业先例（eslint-seatbelt CI 冻结校验、gitleaks --deny-unused-baseline、CodeQL --deny-unused-baseline 棘爪）全部把「基线/豁免集与真实扫描面的一致性」作为门禁运行内自检，册外锚恰是弱化。故 (ii)。

### ④ 检测器豁免集可达性自检先例

结论：先例全部落在「门禁自身运行时对豁免集做枚举面一致性校验」，无一例外：

1. gitleaks --deny-unused-baseline：基线里已还清的条目存在=失败（豁免集不得含不可达项）——这正是 SCAN_EXEMPT 死项 guard-all-run.mjs 的同型病，先例把死项当红而非当死代码容忍。
2. eslint-seatbelt CI 冻结校验（SEATBELT_FROZEN=1）：ratchet 文件计数与实跑计数逐文件比对，不一致即红——豁免/容忍集与真实枚举面恒等校验。
3. CodeQL baseline 棘爪（--deny-unused-baseline 同名，D-153/R28-Q8 双轮已引）。
4. Betterer smaller 约束：基线计数单调下降，膨胀即红。

四源同构：豁免集不是静态配置文本，是门禁不变式的一等校验对象。故面C 的 S1 改写（⊆ 校验）有工业惯例直接背书，且死项摘除=把 gitleaks 先例的「死项即红」语义从「永久容忍死项」升级为「发现即摘」——符合棘轮只减不增。

### ⑤ ADR 单文档收一族同域变更的颗粒度先例

结论：「one ADR = one decision」的「决策」单位是取舍论证，不是变更条目数；同域、共享同一取舍的变更可单收，取舍不同则拆。

- ADR 官方仓（architecture-decision-record GitHub）：「Specific: Each ADR should be about one AD, not multiple ADs」；同时「it's relatively common for one ADR to make a big overarching choice, which in turn creates needs for more smaller decisions」——大决策与派生小决策可同链，但每个 ADR 主体只承载一个取舍。
- IBM Watson Discovery 经验报告（Agile Alliance 全文）：点名反模式「A single ADR would have multiple intertwined decisions bundled into a single record making it difficult to read」——纠缠多决策单收是被点名的失败形态。
- Microsoft Well-Architected ADR 指南：多阶段拆多条；决策变更写新 ADR supersede 而非改旧。
- 本仓惯例（D-153② 已裁定框架）：unstrippedScanHit 消费位变更「难逆转须立 ADR-0024」；multi-hit 扩面「与①同 ADR 或同批第二裁决」——D-153 本身已预授权两案同 ADR 选项。

特别核查「单决策含取舍」门槛：面A（豁免判据=提名位→消费位）与面B（探测面扩 .includes/.test＋walk 补面）共享同一个取舍论证——「探测器判定面以消费位/消费形态为准，抑以字面提名位为准」，且面B 的裁决核心（新检出走 D-094 三分类门注册）复用既有决策非新取舍。故两者单收 ADR-0024 合门槛。但面C③（SCAN_EXEMPT 死项+S1 摘除）是处置类动作非架构取舍——照 D-153②③ 原判走「打包裁＋D-094③ 归因注记」账本承载，不进 ADR（ozimmer 零价值判据反面：硬塞 ADR 反稀释 0024 的取舍可读性）。

## 3) 对比矩阵

| 裁定面 | 候选 | 工业先例支持 | 主要风险 | 推荐 |
|---|---|---|---|---|
| A unstrippedScanHit | (i) 改测剥后源码＋ADR-0024 | CodeQL 抑制注释逐行锚定；ESLint 行级 disable；Biome 理由制 | 短期新检出小批需 D-094 分诊 | ✅ (i) |
| | (ii) 加调用位位置序约束 | 无先例（位置序约束属自造） | 语义更复杂、难复用 | ❌ |
| | (iii) ADR 分拆两件 | Watson 报告反模式（同域纠缠拆分过度） | 冲突 D-153「同 ADR」预授权，徒增 ADR 噪声 | ❌ |
| B multi-hit 扩面 | (i) 一步全开 | 反先例（Notion：error 直接开但须 baseline 缓冲存量） | 数十级新检出砸门噪声洪峰 | ❌ |
| | (ii) 分级两波 | 无先例；baseline 本身即分级 | 多一次裁定链往返无收益 | ❌ |
| | (iii) dry-run→delta→enforcing | CodeQL baseline／eslint-seatbelt CI 冻结／Android Lint baseline 同构 | dry-run 拖期化（须显式转窗） | ✅ (iii) |
| C 死项+S1 | (i) 纯摘除+注记 | 合 D-094③ 但丢可达性保护 | gitleaks 先例把「死项在册」当红态 | 可行但保守 |
| | (ii) 摘死项+S1⊆改写 | gitleaks/eslint-seatbelt/Betterer 可达性自检三源 | 无显著 | ✅ (ii) |
| | (iii) 册外锚 | 无先例（工业自检全在门禁运行内） | 自检面弱化、越界失控 | ❌ |

## 4) 特别核查三问

**Q1 扩面批注册与棘轮基线「只减不增」语义兼容否？——兼容，且互补。** 棘轮语义作用于基线文件（已容忍违例数单调下降），扩面新增检出走的是注册通道（D-094 三分类：修／入册 legit-drift／豁免注记），是基线重生成事件而非基线膨胀。CodeQL 先例精确对应：探测器升级后 baseline 重算（new-alerts-only 门不变），存量按注册分诊消化后棘轮继续只减不增。唯一注意点（eslint-seatbelt 教训）：delta 分诊须在转 enforcing 同批完成，若 dry-run 与 enforcing 之间代码继续漂移，须以转窗当日实跑为准重算 delta，禁用过期 dry-run 差值。

**Q2 S1 改写后自身防字面钉须过哪道面？——过三道。** 改写文本必然含 'SCAN_EXEMPT' 字面（自检语义内在），按新规则须：① 过面A修好后的 75a 扫描（剥后源码消费位判定——S1 的 SCAN_EXEMPT 引用是真实消费位非注释提及，会命中）；② 命中后须 D-094③ 归因注记（照 75a-C4 已有的 existence-assert 族先例标注层位）；③ 入 register 归因册（348 条→349 条，C1 计数联动刷新）。这正是改动自洽的验证：改写后的 S1 应当是第一个被新豁免判据正确处理的样本——建议作为面A修法的正对照 fixture。

**Q3 ADR-0024 单收①②合「单决策含取舍」门槛？——合。** 判据链：ADR 官方仓「one AD」单位＝取舍论证单元；①②共享同一取舍（判定面锚消费位/消费形态 vs 字面提名位）；②的新检出处理复用 D-094 既有决策无新取舍；Watson 反模式限制的是「互不纠缠的多决策捆绑」，①②非纠缠而是同根派生。面C 处置类不入 ADR（如上⑤）。与 D-153② 预授权「与①同 ADR」直接一致，零冲突。

## 5) 与本仓 current 记录 / docs/adr / CONTEXT.md 的冲突点核查（显式列表）

| # | 核查面 | 结论 |
|---|---|---|
| 1 | D-153②（2026-09-27 current） | 零冲突，直接授权：①「改扫剥后源码 strip 消费位＋立 ADR-0024」=本报告面A推荐 (i) 原判；②「与①同 ADR 或同批第二裁决」=本报告 ADR-0024 单收①②；③「摘除须先 D-094③ 归因注记禁静默删，打包裁」=面C (ii) 前置合规；②「新检出按 D-094 三分类门注册，D-110 棘轮反向适用不触发基线收缩」=Q1 兼容性已预判。本报告为 (iii) dry-run 细化提供工业背书，属同向细化非改向（D-150 同族判例）。 |
| 2 | D-094 三分类门 | 零冲突。面B delta 分诊、面C③ 摘除归因均复用既有门；报告未提出与三分类相异的处置通道。 |
| 3 | 75a S1 自身（「PASS S1 普查豁免面枚举在册」） | 冲突点：S1 现行文本是恒真断言（自指），且其中 '75a-check.mjs' 在豁免集内合法、'guard-all-run.mjs' 在枚举面外不可达——S1「PASS」反而证明它没在测任何东西（若它真校验 ⊆ 关系，guard-all-run 项应红）。这是面C (ii) 的直接证据。 |
| 4 | r37 审计 Standards 轴（已裁「打回窄返工」） | 零冲突：SCAN_EXEMPT 不可达项＋S1 恒真＋multi-hit 逃逸＋unstrippedScanHit 豁免盲区四项均已在该轮判定入批2-β，本报告逐项承接无改向。 |
| 5 | D-102 无牙族 | 零冲突：S1 恒真=D-102 无牙族同型（D-153②已点名「Autonoma 恒真反模式/D-102 同型」），摘除前归因注记义务沿 D-102 闭环先例。 |
| 6 | docs/adr/0022（Quarantine 引擎） | 零冲突：ADR-0022 是探测器硬化先例载体，0024 与其同族不同域（上游输入病态 vs 仓内守卫探测语义），无需 supersede。 |
| 7 | CONTEXT.md | 零新增词条义务面；若面C (ii) 落地，「豁免集可达性自检」可作 CONTEXT 词条候选（非必需，随裁面走）。 |
| 8 | D-150⑤（批3 时点不预裁） | 零冲突：本报告不触碰批3（76 件点级锚改造）排产。 |
| 9 | 潜在张力点（非冲突，须显式留痕）：dry-run (iii) 的「转窗」若不显式声明时限，与 D-153「逐项落盘」的推进节奏可能拖期——建议转窗条件预声明（delta 分诊完成即转），沿 D-152 判据预声明纪律。 |

## 6) 最终推荐汇总（逐面一行）

- 面A → (i)：改测剥后源码 strip 消费位＋ADR-0024 单收①②（候选 (ii) 位置序约束无先例，(iii) 分拆违 D-153 预授权并制造 ADR 噪声）。
- 面B → (iii)：dry-run→delta 全量 D-094 分诊→转 enforcing，转窗条件预声明（delta 分诊完成即转，禁 dry-run 长期化）；.scratch/macro-audit walk 补面零新检出纯封洞随批。
- 面C → (ii)：摘除 guard-all-run 死项＋S1 改写「SCAN_EXEMPT ⊆ walked 枚举面」可达性自检；改写后 S1 自身过剥后消费位扫描＋D-094③ 归因注记入册（作面A修法正对照）；不挂册外锚。
- ADR：0024 收①②不收③；③走账本打包裁＋归因注记。

## 7) 完整来源清单

| # | 标题 | URL | 角度 | 日期 | 贡献 |
|---|---|---|---|---|---|
| 1 | Notion's ratcheting system using custom ESLint rules | notion.com/blog/how-we-evolved-our-code-notions-ratcheting-system-using-custom-eslint-rules | Official+Currency | 2025-03-03 | 棘轮四组件全形态；「warning 模式无意义→只允许 error+baseline」直接裁决面B (i)/(iii) |
| 2 | eslint-seatbelt README（全文） | github.com/justjake/eslint-seatbelt | Official+Comparative | 持续更新 | 「starts loose, only get tighter」；新规则 error 模式直入；SEATBELT_FROZEN 冻结校验 |
| 3 | GitHub code-scanning alerts / CodeQL baseline | github.blog changelog 2024-07-10 + docs | Official | 2024-07-10 | baseline 三件套；--deny-unused-baseline 棘爪 |
| 4 | dismiss-alerts README（CodeQL AlertSuppression） | github.com/advanced-security/dismiss-alerts | Official | — | codeql[rule-id] 只作用紧邻下一行；lgtm[rule-id] 限同一行 |
| 5 | ESLint Configure Rules 官方文档 | eslint.org docs | Official | — | eslint-disable-next-line/line 行级锚定；inline disable 须附理由 |
| 6 | ruff#1149 baseline 诉求 | github.com/astral-sh/ruff/issues/1149 | Community | — | 社区同型诉求佐证 |
| 7 | Android Lint baseline 官方文档 | developer.android.com/studio/write/lint | Official | — | 「fail build 不回填存量」一步到位先例 |
| 8 | Autonoma Useless Unit Tests 五形态 | getautonoma.com | Criticism | 2026-06 | 恒真断言五形态＋mutation 手工检验 |
| 9 | ploeh Tautological assertion / testsmells.org / randycoulman | 各源 | Criticism | — | 「It can never fail」判据 |
| 10 | ADR 官方仓 / Fowler / Microsoft Well-Architected | adr.github.io / martinfowler.com / learn.microsoft.com | Official | — | one-ADR-one-取舍判据；supersede 链 |
| 11 | IBM Watson Discovery ADR 经验报告 | Agile Alliance | Comparative | — | 「多决策纠缠单收」点名反模式 |
| 12 | 本仓知识库：R28-Q8 报告（detekt/gitleaks/mypy-baseline） | ctx 召回 | Official（本仓系） | — | 四工具独立收敛同形态 |

## 8) 信息缺口

- 「suppression 判据从提及改消费位」无逐字同名工业术语（是形态同构而非直接判例名）——报告已按形态论证，不冒称直接先例。
- dry-run→enforcing 的「限时转窗」时长无标准数值惯例（先例都是隐式即刻转）——转窗条件建议预声明而非抄外部数字。
- AnySearch 引擎本轮仅 1 查（结果与 Exa/Tavily 高度重叠：ruff#1149、Android Lint baseline 均双引擎覆盖），第三引擎独立增量有限，已如实标注。
