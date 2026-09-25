# R32-Q3 atomcode 调研报告（2026-09-25 归档）

题面：D-123⑤「显式态仅静态指标」读法裁——失败态 kernel facet_rows 该载什么（维持现状读法 / 严格读法投影收口＋suppressed_facets / 全载＋degraded 标记）。
调研形式：atomcode -p（ctx_batch_execute 串行；Tavily 超限改 Exa+AnySearch 双引擎），仓内 current 记录+ADR+CONTEXT 已回顾，工业源 10 件（官方 6/社区 2/批评 1/RFC 1），置信高。

## 执行摘要

推荐 **(b) 投影收口版**：事实层一字不删，收口只发生在文件卡 read-model 投影——失败态下历史派生族 facet 不进卡面，卡带 `suppressed_facets` 显式标记，D-123⑤ 挂 scoped 澄清注记。这不是「删数据」，是把 D-126 已立法的「合法空值」贯彻到卡面。

## 一、本地取证：账本与 ADR 原文判读

### 1. 争议焦点的文义证据（D-123① vs D-123⑤ 自洽性）

- D-123①：kernel 数据层=已契约实体面逐字段直投（**hotspots 行 revisions/cognitive_health/hotspot_score/mi_rank/ai_pct＋entity-churn/entity-ownership/coupling/code-age 族**）＋citation 锚。
- D-123⑤：new_file/insufficient_history=显式态**仅静态指标（无 churn/age/ownership）**。
- 关键事实：**⑤括号点名排除的 churn/age/ownership，恰恰是①枚举的 kernel 直投面**，且 hotspots 行 revisions/hotspot_score 同样是历史派生值。若采读法 (a)（kernel 直投本体即静态指标、括号只是描述数据局面），⑤将自我消解——一条说「无 ownership」，另一条说 ownership 面逐字段直投，两处不可能同时为真。**文义上唯一自洽的读法=⑤是失败态特别条款，对①的一般直投规则构成 lex specialis 收窄**。
- 读法 (a) 唯一成立路径=把「静态指标」重定义为「kernel 已算出的任何数」，但与实测冲突：new_file 的 revisions=1、退化 hotspot_score 不是静态指标——静态指标（文件大小/语言/复杂度类）不依赖 git 历史深度；hotspot_score 是 churn×health 的历史派生积，revisions=1 时是统计退化值而非测量值。

### 2. 与 D-126③ 的体系冲突（现行实现最硬矛盾点）

D-126③ miss 四类：**not_applicable（合法空值非 miss——new_file/binary/generated 沿用 D-123⑤）**。账本已把 new_file 的历史派生指标归类为**合法空值**（GraphQL semantic-nullability 意义上「语义上就该为 null」的位置），而非「有值但退化」。现行卡面直投退化 hotspot_score=把 D-126 已判为合法空值的位置填上伪值——**与现行 current 决策的实质冲突，不是解释空间**。

### 3. D-124 已为 (b) 铺好机制

D-124：facet_rows 已降 raw 证据位、不进卡查询主路径；卡=facts.duckdb read-model 投影（D-122①）。投影层按状态选择性呈现不违反 append-only——原始证据全量保留在库里，收口只作用于卡面。(b) 的「滤除」若严格限定在卡投影层，与 D-124/D-122/D-126 全兼容；只有把「滤除」误解为删事实才与 Hub-of-Facts charter 冲突。

### 4. D-095 枚举纪律的落点

失败态收窄后的「留在卡面的静态指标集」应按 D-095 声明为 closed 枚举（成员级双向差集对账），`suppressed_facets` 则是对 closed 全集的差集披露——收窄集与抑制集都必须是声明过的常量集，不能逐卡临场裁量。同 ADR-0023「指标集=closed 契约物」既有立场。

### 5. D-122 披露四件、D-125 血缘、D-096 无新增约束。

## 二、工业界心智模型

1. **SonarQube**：new code 指标=**缺位，不造假值**——community 官方人员确认「无 period 数据→new 指标缺位非零值」；process-steps 档新文件/rename 显式分类规则、永不退化值。
2. **CodeScene**：历史深度是**一等配置参数**——分析周期按指标族分开配置=历史派生族区别对待先例；augmented-analysis 档=显式抑制呈现＋后台继续分析（suppress≠删数据）。
3. **UX/API 判据**：partial/degraded 是一等状态——GraphQL Semantic Nullability RFC 三态区分（无值/空/错空）＋partial success 正典；june.kim「Show what you have, flag what's missing」；crouton-kit 状态规范=degraded 值误读为真数据=反模式。
4. **审计合规判例**：PCAOB AU 508 公允呈现义务——退化值无披露=误导性呈现→保留/否定意见；IBM Storage Insights APAR=退化值误读实例。

## 三、三候选对比矩阵

| 项 | (a) 维持现状 | (b) 严格收口＋suppressed_facets | (c) 全载＋degraded 标记 |
|---|---|---|---|
| D-123⑤ 括号文义 | ✗（括号点名族仍在卡面=条款自我消解） | ✓ | △（括号语义被 degraded 改写） |
| D-126③ not_applicable=合法空值 | ✗（伪值填合法空位） | ✓（合法空值=不呈现披露为抑制） | △（空值被填成带标记的值） |
| Hub-of-Facts append-only | ✓ | ✓（仅投影层收口，raw 全留——D-124 已铺路） | ✓ |
| 审计公允呈现（PCAOB） | ✗（退化值无披露=误导风险） | ✓（缺失即披露） | △（有标记仍呈现退化数值） |
| 宿主叙事风险（零指标值纪律） | ✗（叙事可引用退化 hotspot_score） | ✓（无值可引，citation 校验天然拦截） | ✗（degraded 值仍可被引用，需另立「禁引用 degraded 值」新规则=契约膨胀） |
| 实现复杂度 | 最低 | 中（投影过滤+标记+closed 集对账） | 中（标记传播+叙事层新禁令） |
| 工业先例对齐 | 无（零产品在无历史时渲染退化 hotspot） | SonarQube 缺位＋CodeScene 显式抑制＋监控产品显式空态 | GraphQL partial success，但需自创「degraded 值可呈现」先例（检索未见） |

## 四、推荐（逐条）

1. **收口位置=文件卡 read-model 投影，非事实层**——raw evidence 全量保留，失败态仅收敛「哪些 facet 进卡面」（与 D-122 卡=投影、D-124 facet_rows 不进卡主路径同构）。
2. **收口面=closed 枚举**：失败态保留的静态指标集与 `suppressed_facets` 集都按 D-095 声明 closed＋lint 成员级对账；`suppressed_facets` 每项带抑制原因码（与 D-126③ miss 四类复用同一词表——new_file/insufficient_history 归 not_applicable 族）。
3. **derived 层维持现行 suppressed_by 留痕**（现行本就对），failure 态下 percentile/top_n 无分位母体必须随收口一并抑制——现行已做，保留。
4. **D-123⑤ 挂 scoped 澄清注记**（不 revised）：明示「仅静态指标」限定 kernel 卡面枚举（收窄 entity-churn/entity-ownership/code-age/hotspots 历史派生族），事实层直投不受影响——legislatively 封死两轮读法分歧，防下次审计窗再开同一问题。

**(c) 否决核心理由**：零指标值纪律下宿主叙事只能引用 kernel 已算的数——degraded 标记后的退化值仍是「kernel 已算的数」，叙事引用它完全合法，于是卡会说出「该新文件 hotspot_score=X（degraded）」这种接近 PCAOB inadequate disclosure 的呈现。要堵住它就得再立「禁引用 degraded 值」新禁令=为绕开一个括号而膨胀契约。(b) 用「无值可引」让既有 citation 校验自然生效，零新规则。

**冲突清单（显式）**：(b) 与所有 current 决策零冲突；**现行实现（读法 a）与 D-123⑤ 括号原文、D-126③ not_applicable 分类存在实质冲突**——审计窗分歧根源即在此，scoped 注记应把这两处引用写进去。

## 五、完整来源清单

| 标题 | URL | 角度 | 贡献 |
|---|---|---|---|
| SonarQube metrics-definition（2026.2 官方） | docs.sonarsource.com/sonarqube-server/2026.2/user-guide/code-metrics/metrics-definition.md | Official | overall/new code 双域、new_ 指标独立命名 |
| SonarSource 社区：Measures API returns no new code metrics | community.sonarsource.com/t/measures-api-returns-no-new-code-metrics/138336 | Community | 无 period 数据→new 指标缺位非零值（官方人员确认） |
| SonarQube process-steps（2026.1） | docs.sonarsource.com/sonarqube-server/2026.1/discovering/analysis-overview/process-steps | Official | 新文件/rename 显式分类规则、永不退化值 |
| CodeScene Project Configuration（3.6.11/7.5.12 双版本） | docs.enterprise.codescene.io/versions/3.6.11/configuration/projects.html | Official | 分析周期按指标族分开配置=历史派生族区别对待先例 |
| CodeScene augmented-analysis | codescene.io/docs/guides/technical/augmented-analysis.html | Official | 显式抑制呈现＋后台继续分析=suppress≠删数据 |
| GraphQL Semantic Nullability RFC | rfcs.graphql.org/rfcs/SemanticNullability/ | Official | 三态区分（无值/空/错空）＋partial success 正典 |
| 状态完备性设计（june.kim） | june.kim/state-complete | Community | 「Show what you have, flag what's missing」 |
| crouton-kit 状态设计规范 | github.com/CaptainCrouton89/crouton-kit commit 4a44127 | Community | degraded 值误读为真数据=反模式 |
| PCAOB AU 508 审计报告准则 | pcaobus.org/…/AU508 | Official | 公允呈现义务；披露不足→保留/否定意见 |
| IBM Storage Insights IT40400 等 | ibm.com/support/pages/apar/IT40400 | Criticism | 退化值误读实例 |

## 六、信息缺口

- CodeScene 对单个 new file 在 UI 上的逐帧呈现无公开截图级文档（产品未文档化此粒度）。
- Tavily 引擎超额未用（Exa+AnySearch 双引擎已交叉）。
