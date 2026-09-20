# R23-Q2 atomcode 调研报告——upstream 接线票立项时机与「PR 合入」依赖语义

> 题面：D:\Aworker\6F\.scratch\macro-audit\reports\R23-Q2-research-prompt.md
> 运行：2026-09-19 · atomcode 串行单发 · 6 searches（web_search×3[Official/Criticism/Comparative]＋tavily×2＋anysearch×1[Community/Currency]）· full reads 6（Gerrit 官方设计文档流程、Ryan Madden/Google 设计文档、Fowler Strangler Fig×2 引擎、Cohesive 死锁知识页、Augmentcode spec-as-source）· gaps：LFX 权重公式原文未读通（站点握手失败，搜索摘要双引擎印证兜底）、Basecamp 章节 URL 404（以 PDF 全文搜索片段代替）

## 1) 执行摘要（Tl;dr）

**推荐 (b)+(e) 复合**：本下轮**决策面 grill 一次性裁定六项欠账、把映射表升版 v1.0「定稿」，随后立纯工程接线票**（分两批：批1 codelore 本地先行、批2 github-rest opt-in 后至）；D-078⑤ 的「PR 合入」**勘误式重释义为注记**——依赖本意是「映射定稿先于接线」，push/merge 是分发闸门动作、与本地定稿语义可解耦，不应让用户闸门把依赖条件变成永假死锁。Confidence：**高**——依赖语义判断基于本地账本原文＋两阶段门双源先例；六项全拍的工作量判断置信中（未逐项估时）。

## 2) 逐候选裁定

| 候选 | 裁定 | 理由 |
|---|---|---|
| (a) 票内首任务=定稿六项混票 | **否**（改良形态见下） | 混票把决策面动作（评审/裁定）塞进实施票 DoD，产生不可验证的 DoD——「六项已裁」不是可 diff 的工程验收物；且混票正是 R22-Q6 失败模式表里「设计票变僵尸（立了不裁）」的变体：票开→首任务被 grill 拖住→票悬置。Google 模型里 doc approval 与 implementation 是两道独立的门，不在同一张票里。 |
| (b) 本轮 grill 裁定稿面后立纯工程票 | **✓ 采纳（主）** | 最贴 Shape Up 分工：rabbit holes（六项欠账）属 shaping 阶段，pitch 就该解决，不带进 build（Shape Up 官方 PDF："Address risks and rabbit holes…amend, cut out, or specify details before writing the pitch"）。串行纪律已满足、返工轮全消化，六项不与实施带宽争——与 R22-Q6 冲突核查表结论一致。 |
| (c) 字面等 push+PR 真合入 | **✗ 否决** | 典型永假死锁：等待条件只能由被同一闸门结构（blocked dependency structure）禁止的动作满足——Cohesive 死锁定义「waiting on conditions that can be satisfied only by members of the same blocked dependency structure」（cohesive.sh）。用户闸门（全栈零 push）不因接线票存在而解除，依赖条件永假→票永立不起来。 |
| (d) 缓挂先消化 D-079+judgement+真机验收 | **✗ 作为裁定否决；作为排期顺序允许** | 串行前提已满足，缓挂的唯一收益是决策面轻量化，代价是 upstream 线全停——而接线面准备（codelore 批）零凭据依赖、可立即动工，没有理由挂。D-079 等可在同一轮 grill 里并行消化，不必互斥。 |
| (e) codelore 先行 github-rest 后至分批 | **✓ 采纳（次，作为 (b) 的接线票内部分批形态）** | 与 (b) 不互斥。D-035 逐面 YAGNI 粒度纪律直接支持；Fowler Strangler Fig：「begins with small additions…move bits of behavior gradually」——codelore 是天然第一 seam（本地二进制、无凭据、ADR-0009 默认输入面），github-rest 带 token+网络 opt-in 闸门，天然第二 seam。 |

**净推荐：(b) 为主干 + (e) 为接线票内部分批骨架。**

## 3) 工业先例（带 URL，均已打开原文）

| 先例 | 来源 | 对本案的支持 |
|---|---|---|
| **两阶段门：design doc approval ≠ code merge** | Gerrit 官方 dev-design-docs.txt（https://gerrit.googlesource.com/gerrit/+/851f2a6e8f60203f79d3808c930e0ed06ee18886/Documentation/dev-design-docs.txt）——「once a conclusion is approved and submitted the implementation may start immediately」，conclusion 变更须 ≥10 天评审窗；Ryan Madden（Google 经历）Design Docs（https://ryanmadden.net/things-i-learned-at-google-design-docs/）——「Approval: colleagues listed as reviewers…a form of multi-party approval gating changes」，与 code review 是**两套独立流程**。 | 映射表定稿（评审六项）是 approval 门；接线票是 implementation 门。两门解耦，定稿不需要 push+merge 才算数——doc status 从 draft 改 final 即定稿。 |
| **条件永假死锁识别与解锁** | Cohesive Systems Deadlock（https://cohesive.sh/library/knowledge/cohesive-system-model/operational-concerns/deadlock-and-livelock）——解锁手段=「prevention can rule out at least one condition」：改依赖定义、取消等待、或重构 wait-for 图。本案把「合入」重释义为「定稿」即从 wait-for 图上删除永假边。 | (c) 的死锁诊断与解锁方式 |
| **shaping→pitch→build 分解** | Shape Up 官方 PDF（https://basecamp.com/shapeup/shape-up.pdf）——rabbit holes 在 shaping 消化，「declare out of bounds」「cut back」后才写 pitch 进 build 周期。 | 六项欠账归决策面 grill 而非实施票 |
| **评审欠账归决策面会议 vs 实施票 DoD** | Gerrit/Ryan Madden 同上：评审是 doc 流程的动作，产出「plan of record」；DoD 是 Acceptance Criteria（工程可验证物）。 | 六项不进票 DoD |
| **分批接入（seam 逐个替换）** | Fowler Strangler Fig（https://martinfowler.com/bliki/StranglerFigApplication.html）——「small additions…move bits of behavior from legacy into new code base」；transitional 成本被渐进收益覆盖。 | (e) codelore→github-rest 分批 |
| **doc-as-source vs generated 单源真值** | Augmentcode Spec as Source of Truth（https://www.augmentcode.com/guides/spec-as-source-of-truth-rebuildable-codebase）——spec 是决策（decisions vs requirements）的持久载体，代码/常量是派生物；派生物与 spec 漂移要靠验证抓。 | 映射表=单源真值，裁决面常量=派生物，NN-check 守卫断言抓漂移。 |

## 4) 落地形态

### 4.1 六项欠账归属（全部归决策面 grill，不进实施票 DoD）

| 欠账项 | 归属 | 裁定方式 |
|---|---|---|
| review 覆盖 S5↔S4 双挂 | 决策面 grill | 单项拍板，账本留痕（并入 D-078 注记或新 D-xxx） |
| Bot 占比 S5 vs S4 | 决策面 grill | 同上；沿用「平台声明 Bot 身份」措辞纪律 |
| 落点 vs quadrant-rubric 并面 | 决策面 grill | D-047/#51「facts 共享、归属=切片决策」同构，复用该先例 |
| LFX 权重列 | 决策面 grill | 补读 LFX 原文后裁；若公式细节仍不可得，按 D-035 暂缓面挂 next_review，不得裸挂 |
| #47 九类事实复核（明记立票前） | **立票 gate**——grill 完成后、立票动作前 | 以 47-report 原文对账映射表 github-rest ② 节 |
| ADR-0020 复读 | 决策面 grill 开场 | 逐字读 docs/adr/0020 全文，确认「消费映射居中」轨 |

六项全拍后：映射表 v0.1→**v1.0 定稿**（last_reviewed 更新＋D-078⑤ 注记），同步触发 next_review（2026-10-18）照常挂。

### 4.2 接线票骨架（纯工程票，分批不捆绑）

- **票名**：upstream 接线——codelore 批（批1）／github-rest 批（批2）为两张 sibling 票或一票两 scope（建议两张，D-035 粒度）。
- **票间依赖（重释义后）**：依赖 = upstream-dimension-map v1.0 定稿（六项欠账全拍＋账本留痕），**不含** push/merge 动作。字面「PR 合入」以注记勘误，原意「映射定稿先于接线」不变。
- **批1 codelore**：COLLECTOR_DESCRIPTORS 消费面注册＋Macro-B 报告归位＋NN-check 守卫（「适配层无 S1-S5 字样」已有，新增「映射常量与表一致」断言）＋golden 断言面。
- **批2 github-rest**：opt-in 闸门显式（ADR-0009/00011 纪律），token 环境变量、无 token 时 graceful skip；九类事实按映射表 ② 节归位。
- **DoD（工程可验证）**：守卫脚本 exit 0＋golden 对账＋批1/批2 各自验收报告；**不含**任何「表已合入」类条件。

### 4.3 裁决面消费机制形态（本轮裁定）

**读表/配置/硬编码三形态裁定**：取「**文档面单源真值＋裁决面映射常量（配置块）＋守卫断言对账**」混合形态：

1. docs/upstream-dimension-map.md 是唯一真值（业务语义所在地，spec-as-source 先例）；
2. 裁决面（Macro-B 消费侧）落一份**映射常量/配置块**（非运行时读 md——运行时解析 md 脆弱且引入文件 IO 依赖）；
3. NN-check 加守卫：**常量与表逐行对账**（表改而常量不改→FAIL），防 spec/派生物 drift；
4. dimension:null 在两个 descriptor **永久保留**（防腐留白，注释已指回映射表），消费只发生在裁决面，适配层零业务语义——ADR-0014 不动。

## 5) 失败模式与治理

| 失败模式 | 治理 |
|---|---|
| 六项混进实施票→DoD 不可验证→僵尸票 | 六项硬性归 grill；立票前检查「六项全拍」为 gate 而非 DoD |
| 「合入」重释义被未来会话重新字面化→死锁复发 | 账本注记用 D-025 勘误式双读数句式，写死「合入=本地定稿，非 push/merge」 |
| 映射常量与表 drift | NN-check 逐行对账断言（批1 交付物） |
| github-rest 批在无 token 环境假成功 | graceful skip 必须**显式报告** skipped 状态，不算 PASS |
| LFX 权重列悬而不决 | 挂 next_review＋不得裸挂纪律（D-035 同款） |

## 6) 冲突核查（逐条 D-xxx）

| 决策 | 核查结论 |
|---|---|
| **D-078⑤** | **重释义属「注记＋勘误」，非 revised**：D-078 的裁决主体（(c) 设计先行、实施排后、映射落裁决面）全部不变；变的仅是⑤里「PR 合入」一词绑错了动作层级（把分发闸门动作误绑进本地语义）——正是本仓 ADR-0008 勘误先例/D-025 双读数句式的适用场景。若 grill 现场认为语义漂移过大（「合入」原文明确指 merge），则升格 revised 并开 D-080；默认建议注记。 |
| D-015 串行 | 不冲突：串行约束量测有效性链，映射定稿与接线不产测量值；且串行前提已满足。 |
| D-020 双轨/ADR-0014 | 支持：映射常量落裁决面，适配层 dimension:null 保留。 |
| D-048/ADR-0020 | 不冲突：映射消费只用已采面（PR 枚举/元数据），review/comment 仍 planned。 |
| D-047/D-054 | 一致：落点并面裁定直接复用「facts 共享、归属=切片决策」。 |
| D-035 YAGNI | 支持：两批分票正是其粒度纪律；LFX 权重悬项走其「不得裸挂」暂缓面。 |
| D-011/ADR-0009 | 不冲突：批2 opt-in 显式化，映射不改变输入形态。 |
| D-024 | 不冲突：v1.0 定稿即一次复审，last_reviewed/next_review 两字段照常。 |
| D-079 | 不冲突：D-079 与本案同轮 grill 并行消化，均占决策面不占实施带宽。 |

## 7) 信息缺口

1. **LFX health-score 权重聚合公式原文**：官网握手失败未读通；若 grill 需要裁「权重列」，须先用 Patchright 浏览器或镜像补读原文。
2. **D-078⑤ 原文里「合入」的立法记录**：账本只存了采纳文本，无当时的意图注释；注记 vs revised 的最终选择建议 grill 现场确认（我方默认注记）。
3. **六项的拍板工作量**：未逐项估时，若单轮 grill 消化不下，优先级建议 #47 复核＋ADR-0020 复读先行（它们是立票 gate），其余四项可挂一档。
4. 用户闸门（push）的解除时点未知——本裁定已设计为**不依赖** push 的形态，但若未来 push 解禁，「注记」是否升格为真 merge 流程可再议。

## 8) 建议追问（grill 现场三问）

1. D-078⑤ 重释义：**注记**还是开 D-080 revised？（我方默认注记）
2. 批1/批2 是两张 sibling 票还是一票两 scope？（我方默认两张）
3. LFX 权重列若本轮原文仍读不通，是挂 next_review 还是把权重列整列从表里声明 out of bounds？（Shape Up「declare out of bounds」先例支持后者，更干净）

## 完整来源清单

| 标题 | URL | 角度 | 贡献 |
|---|---|---|---|
| Gerrit Design Docs（官方） | https://gerrit.googlesource.com/gerrit/+/851f2a6e8f60203f79d3808c930e0ed06ee18886/Documentation/dev-design-docs.txt | Official | 两阶段门：conclusion 批准即可开工，评审窗独立于实现 |
| Things I Learned at Google: Design Docs | https://ryanmadden.net/things-i-learned-at-google-design-docs/ | Official/Community | doc approval=multi-party gate，与 code review 分离；draft→final 即定稿 |
| Strangler Fig Application | https://martinfowler.com/bliki/StranglerFigApplication.html | Comparative | 分批 seam 接入，双引擎（Exa+AnySearch）交叉验证 |
| Deadlock and Livelock | https://cohesive.sh/library/knowledge/cohesive-system-model/operational-concerns/deadlock-and-livelock | Criticism | 永假条件=blocked dependency structure；解锁=删永假边 |
| Spec as Source of Truth | https://www.augmentcode.com/guides/spec-as-source-of-truth-rebuildable-codebase | Currency(2026-04) | doc-as-source＋派生物验证抓 drift |
| Shape Up（官方 PDF） | https://basecamp.com/shapeup/shape-up.pdf | Comparative | rabbit holes 归 shaping，不进 build；declare out of bounds |
| Tavily 死锁检索集 | https://en.wikipedia.org/wiki/Deadlock_(computer_science) 等 | Criticism | 死锁四条件交叉印证（摘要级，辅助） |
| 本地账本/实物 | D:\Aworker\6F\.scratch\macro-audit\decision-ledger.md、docs\upstream-dimension-map.md、engine\src\{codelore,github-rest,macro-b,collectors}.ts、BACKLOG #47 | 本地证据 | D-078⑤ 原文、映射表 v0.1 结构、dimension:null 留白实况、消费面现状 |
