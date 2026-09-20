# R23-Q4 atomcode 深调研——Bot 占比行终裁：S5 定稿还是改挂 S4

**调研日期**：2026-09-19｜**题面**：reports/R23-Q4-research-prompt.md｜**置信度**：高（Sufficiency Gate 达标：searches 8／angles 全五类／full reads 7 原文：CHAOSS Bot Activity、LFX Development、Nesbitt 2026 批评文、CHAOSS Evolution WG 多页、SurveyCTO 方法论页、CHAOSS Viability、GitHub wg-evolution 源文件；关键结论 ≥2 独立信源交叉）

---

## 1) 执行摘要（Tl;dr）

**推荐 (a)：终裁 S5，移除「S4 备选挂追问留票」尾巴，备注封边「S4 归属仅限未来纵向趋势派生 fact」。**

理由链四条，每条都有双源支撑：
① Bot 占比 fact 已实产（per-PR user.type==Bot＋[bot] 双检，ADR-0020 契约内），有数据形状可裁——与 D-081「无数据形状→事件锚化」判据形成正面对比，正是「有形状即可裁」场景；
②「S4 备选可再裁」是同型裸挂尾巴（无事件锚、无自然触发事件的 prose 挂起），直接踩 D-035「不得裸挂」，且 D-081 刚立同型处置先例；
③ 工业先例一致：CHAOSS Bot Activity 官方归 Community/贡献者侧语境（“human contributions valued and recognized”），LFX 显式把 bot actions 排除出 Development 以外所有类——快照式 bot 参与密度在两大工业框架里都不是演化/交付信号；
④ 方法论上窗口快照占比（cross-sectional snapshot）属「prevalence/状态量」而非「trend 量」（SurveyCTO：snapshot “won't capture the dynamics of change”；CHAOSS Evolution WG 全部 trend 类 metric 均定义在「over time 派生」上）——演化归属需要纵向派生 fact，那是不同的 fact。

## 2) 逐候选裁定

| 候选 | 裁定 | 理由 |
|---|---|---|
| **(a) 终裁 S5＋移除备选尾巴＋封边备注** | ✅ **采纳（推荐）** | ① fact 已实产有形状可裁；② S5=所有权边界匹配成立（人机构成=ownership/boundary-fit 信号集）；CHAOSS Bot Activity=区分人机贡献、社区构成透明度语境；LFX bot actions 排除出 Development 类=非交付节奏信号；③ 备选尾巴=裸挂违 D-035（D-081 同型先例：立完判据立刻自己违=非法态）；④ 封边备注把「未来纵向趋势 fact」通道显式写死防回潮（D-025 双读数精神） |
| (b) 改裁 S4 | ❌ **否决** | 核心缺陷：窗口快照占比≠趋势量。SurveyCTO 方法论页 snapshot “won't capture the dynamics of change”；CHAOSS Evolution WG 全部 trend 类 metric 绑「over time 派生」（Change Request Acceptance Ratio trajectory、Practitioner Guide trend-over-time、Bot Activity filters「ratio over time / average over time」）——工业模型里「演化读数」由时间序列派生承担，不由窗口占比承担。把状态量当演化量=维度错配；未来纵向趋势 fact=新 fact 新裁定 |
| (c) 双挂 | ❌ **排除** | D-081④/D-054 判据：同一切片喂两维=双计数泄漏。且实际后果=S4 侧重复计入无增量信息（merge lead time 已排除 bot）；LFX「bot actions excluded from all other categories」正是防跨类重复计入的治理规则 |
| (d) 事件锚化（照搬 D-081） | ❌ **不适用** | D-081 (d) 适用「fact 无数据形状」情形；本案 fact 已实产，挂起=把可裁之案强制成悬案纯增往返；裸挂尾巴的正确处置是**移除**（裁决完备则尾巴失去存在理由），非造一个不存在的触发事件 |
| (e) 他径 | ❌ **均否决** | 双挂转正=(c)；OoB=已采集信号不适用（Shape Up OoB 只适用无需求悬项）；继续挂=违 D-035 且 D-080 已裁六项欠账归决策面 grill，不裁即失职 |

## 3) 工业先例（带 URL，均已读原文）

- **CHAOSS Bot Activity 官方页**（chaoss.community/kb/metric-bot-activity）：metric 语境=区分人机贡献、社区构成透明度（"human contributions valued and recognized"）；全部 filters 为「ratio over time / average over time」——演化读数由时间序列派生承担；
- **LFX Insights Development 分类纪律页**（docs.linuxfoundation.org/lfx/insights）：「bot actions excluded from all other categories」——bot 信号有独立归类纪律且**不被计为 Development 交付节奏信号**；
- **Nesbitt 2026 批评文**（Nesbitt RFC/blog）：AI coding-agent 经 PAT 作人类速度提交时 Bot 占比失真为「高人类参与」——S5 读数本身有测边界，须带「仅计平台声明 Bot」披露措辞（措辞锁已覆盖，勿自建启发式）；
- **CHAOSS Evolution WG**（Change Request Acceptance Ratio 等）：全部 trend 读法绑「over time 派生」；Practitioner Guide 的 trend-over-time 纪律；
- **SurveyCTO 方法论页**：cross-sectional snapshot 量 prevalence 不量 change（“won't capture the dynamics of change”）；
- **CHAOSS Viability 模型页**＋**GitHub wg-evolution 源文件**：快照/趋势分层先例。

## 4) 落地形态

### 4.1 映射表 Bot 行终裁措辞（19 行替换）

```
| `github_rest.pr_metadata`（Bot 占比切片） | bot 参与密度 | S5（终裁） | **措辞锁「平台声明的 Bot 身份」**（user.type=="Bot"／login [bot] 后缀双检） | S4 备选已收：快照窗口占比是状态量非趋势量（D-081 判据：演化归属仅限纵向派生 fact）；若未来派生 bot 占比纵向趋势 fact（时间序列），其 S4 归属届时另裁 |
```

### 4.2 账本 D-082 行（新增一条，非 revised D-078）

裁决主体 D-078 骨架/形制/排期不变，仅 Bot 行 dimension 列终裁＋尾巴移除，按 D-080② 勘误注记先例。

### 4.3 追问留票清单同步

映射表 §⑤ 第 2 项「Bot 占比 S5 vs S4 备选下轮再裁」删除或改为「已收：D-082」。

## 5) 失败模式

1. **「快照当趋势」回潮**：未来会话见 bot 占比随窗口移动误读为演化信号申请改挂 S4——封边备注＋D-082④ 通用判据双保险；防线=改挂申请必须出示纵向派生 fact 实物；
2. **Bot 检测边界失真**（Nesbitt 警示）：coding-agent 经 PAT 作人类速度提交时 Bot 占比失真——S5 读数有测边界；强宣称须带 CHAOSS 式「仅计平台声明 Bot」披露措辞（措辞锁已覆盖，勿自建启发式补救）；
3. **封边被读成「S4 永禁」**：封边只针对本切片的快照量；新派生 trend fact 的 S4 通道开放——措辞里「届时另裁」四字不可省；
4. **过度裁定外溢**：本裁定不构成对 S1-S5 维定义、ADR-0004 五维结构、其他行准入条件的任何改动——D-078 骨架不动防「顺手收窄」。

## 6) 冲突核查（逐条 D-xxx）

| 账本条 | 核查结果 |
|---|---|
| **D-078 原文** | **不构成实质收窄，但需注记**。D-078④「双挂行…不预先二选一」适用对象是双挂行（review 行）；Bot 行=「已裁 S5＋备选尾巴」形态，本裁定收的是尾巴不是改判 dimension。但 D-078⑤ 追问留票清单有「Bot 占比 S5 vs S4 备选下轮再裁」一项，移除该项属清单项收口——需在 D-082 写明「D-078 裁决主体不变，仅⑤清单项收口注记」（D-080② 先例句式，非 revised） |
| D-081 | ✅ 一致且互证：D-081「无数据形状→事件锚化」；本案对照面「有数据形状→现裁」，判据体系闭合 |
| D-080 | ✅ 一致：定稿六项欠账归决策面——本裁定履行其中「Bot 定维」一项 |
| D-048 | ✅ 一致：双检判据原样保留进终裁行措辞，未动契约 |
| D-035 | ✅ 修复而非违反：移除的恰是违 D-035 的裸挂尾巴 |
| D-047 | ✅ 一致：github-rest 试点第三槽前置不变 |
| D-054 | ✅ 一致：facts 共享归属=切片决策——本案「切片内终裁」非「同切片双维」 |

## 7) 信息缺口

1. CHAOSS Bot Activity 的 focus area 官方归属（Contributor vs Evolution WG）未从 KB 分类树逐字核验——语境＋LFX 排除规则双向推；需逐字引用须补定点抓取；
2. LFX Community/Contributors 类的 bot 处置原文未读——单向排除句已读，Community 类是否显式收纳 bot 未验；
3. CHAOSS review 类 metric 分类变迁史未查全（R23-Q3 同缺口，本裁定不依赖）；
4. 2026 CHAOSS catalogue 对 AI-agent 时代 metric 修订动向（除 Nesbitt RFC 外）无官方 roadmap 证据。

## 8) 建议追问（供 grill 现场三问）

1. **D-082 vs D-078 注记之争**：独立成条（快照/趋势判据要被后续行援引，独立条目可引用性更强——倾向）vs 并进 D-078 注记；
2. **通用判据外溢确认**：D-082④「快照不承载演化宣称」是否升格为映射表 §④ 准入通用纪律（codelore 侧 hotspot-velocity 等 trend 面之外的未来快照 fact 同受约束）；
3. **Nesbitt 警示的披露落位**：Bot 占比在 Macro-B 报告宣称强度——仅作 S5 辅助披露（带「仅计平台声明 Bot」措辞，倾向）还是允许进 quadrant 判据——接线票落地时随 D-048 措辞锁一并落。
