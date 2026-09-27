# R40-Q6 atomcode 调研报告存档（外部用户暴露梯度；atomcode -p 同题；Sufficiency：10 searches/5 angles/6 full reads；Tavily 限流降 Exa+AnySearch 双引擎）

# R40-Q6 调研报告：外部用户暴露梯度（被动挂牌→定向邀请→公开推广）的工业界心智模型对标

## 1) 执行摘要（Tl;dr）

候选 **(i) 梯度定型＋转窗判据预声明** 与成熟产品/开源发布的工业心智模型**高度同构且无任何已核实先例支持跳级**：被动挂牌（marketplace listing＋preview 标注）对应业界通行的 "release ≠ launch" 二分（PostHog handbook 把 release 与 launch 明确拆为两件事、两责任方）；定向邀请试用对应 design-partner/pilot 程序的判据预声明惯例（success criteria agreed **before** the work starts——Tracsio/SZL 类模板逐字同构）；公开推广的转窗判据化最强先例是 Kubernetes KEP-5241「"The only valid GA criteria are 'all issues and gaps identified as feedback during beta are resolved'"」与 Google SRE launch readiness checklist——这与候选 (i) 判据④「试点 findings 消化率（全部过摄入分诊无 pending）」**逐字同义**。**Confidence：高**——三个候选段的每一段都有 ≥2 个独立一手信源交叉支持；唯一中置信段是「0.x 版本＋preview 标签」惯例（MS 官方一手 + PostHog open-beta 条款两源，但 agent-plugin 生态本身标注惯例未成文，与 ADR-0017 D-031⑤ 既判一致）。

## 2) 分点结论（工业界支持度，按候选）

### 候选 (i)：梯度定型＋转窗判据预声明 —— 工业界支持度：**高（三段各有独立先例链）**

**Stage-0 被动挂牌＝现状追认**：
- PostHog handbook 明文二分：*"A **release** is when a product becomes available to existing users… A **launch** gets a product in front of people who've never heard of us"*，且明确 release 由产品侧负责、launch 由 marketing 侧负责——「已 release 未 launch」是一等状态，不是需要遮掩的中间态。
- 反例面（批评角度）：GTM Labs 指出 dev-tool 的被动发现面（GitHub）本身已是最大评估面（Octoverse 2024：518M 公开仓），被动挂牌≠无人评估——但评估失败的代价是「quietly dies」而非信任账户受损；Reddit 66-failed-launches 帖的教训是「被动沉默比 buggy 上线更致命」，不过该教训适用于**有 launch 意图**的项目，本案 ADR-0012 价值闭环优先、launch 未列程，不构成压力。
- 判定：Stage-0 追认**零外联、零新增不可逆锚点**，与 D-051（公开仓转公开系他方动作+license 换文自洽化）、ADR-0016（不进入通用市场、不占位）完全同向，属追认非新姿态。

**Stage-1 定向邀请试用＝charter 协议复用**：
- Design-partner 惯例的核心正是判据预声明：Tracsio（2026-04 更新）——success criteria 与六要素（target/problem/scope/timeline/commitments/**success criteria**）须在第一次 kickoff 之前写定；Allston Labs 模板同构（written agreement + 结构化反馈 + end-of-term conversion conversation）。
- SZL Holdings 内部 ops 文档给出三段梯度表的完整同构实例：Internal alpha → **Design partner beta（up to 3 partners, exit criteria=每人 Day-14 review 完成）** → Limited GA（named accounts only）→ GA，且明文纪律 *"No beta surface is shown without honest status"*（demo 必须披露 demo-mode 数据）——与本案「preview 标注诚实=决策本体」（ADR-0017）逐字同义。
- 本仓侧映射：D-150~D-152 charter 三件套（Kill Criterion 预声明＋exit/success 双轴＋not-run 如实记录＋安装树自对照）正是该惯例的工程化强化版——工业界 design-partner 程序通常只有口头/written agreement 级判据，本案带 SBTM charter＋摄入分诊四态（D-142/D-146）回流的纪律**严于**业界常态，无对齐缺口。
- 首个 pilot（CodeBuddy，GAP-HOST-01 产出）已实证该协议可跑通并产真发现——pilot 逐案复用属已验证路径，非新设。

**Stage-2 公开推广＝判据化转窗**：
- 最强先例 KEP-5241（kubernetes.dev 一手，v1.34 stable）：GA promotion 判据必须包含「beta 期反馈识别的全部 issues and gaps resolved」＋「GA 前 e2e 至少两周无 flake 窗口」＋PRR（production readiness review）完成并批准。映射本案：判据④（试点 findings 全过摄入分诊）=「beta 反馈全部 resolved」同构；判据②（fresh clone 不红海）=conformance/e2e 可达性判据同构（外人 clone 即本仓的「conformance 面」）。
- Google SRE engagement model（sre.google 一手）：launch 前置 production readiness checklist，逐服务列出 domain-specific 检查项——「launch checklist 判据化」是 SRE 届成熟模板。
- GitLab rollout 指南：增量放量、**不在代码部署前 enable**、rollout issue 模板化——「推广前先修可达性再放量」的次序先例。
- 判据③（宿主盲区 disposition）对应 KEP 的「known gaps 须处置后方可 GA」条款；判据①（capability 5/5 漏斗完成）对应 ADR-0017 既定逐层 preview→GA 漏斗的终态——**四条判据每条都有独立工业先例支撑，无一凭空**。

### 候选 (ii)：立即主动推广（不预声明直接外联）—— 工业界支持度：**低，反向证据强**

- GTM Labs（DevTools 专精 PMM，2026-05 更新）：launch 前置**三件套**（working quickstart 的 docs landing、技术博文、可跑的 GitHub sample）＋8 周排程，其中 pre-launch 两周专用于修 docs/quickstart bug——「launch artifacts are the product evaluation surface」。本案现状：fresh clone 红海（env-contract 修复在执行窗）＝quickstart 不可跑＝launch 三件套第一件**当前不合格**。
- KEP-5241 反向条款直译：*"Enabling incomplete features in production by default is irresponsible"*——在已知缺口（Macro-A 未上、宿主盲区在册、clone 红海）未处置前扩大暴露面，工业判例视为不负责任。
- PostHog open-beta 条款即使开 beta 也要求同 GA 流程走 release 先行——「先修再推」的次序不因 beta 标签豁免。
- 唯一支持面：Reddit 实战帖（「ship before it's ready」67th-launch 案例）——但该案例对象是消费级 app、无信任账户/审计可信度约束；本案是审计型工具，ADR-0017 已裁「首发误读风险高、信任账户不可逆」，该先例不迁移。

### 候选 (iii)：收敛冻结（下架/收窄公开面）—— 工业界支持度：**低，且与仓内既裁正撞**

- 无先例支持「公开挂牌后主动下架收窄」作为常态运营动作；PostHog/VS Code 惯例中 preview 标签本身就是**收窄承诺而不收窄暴露**的正解（MS 官方：preview label *"explicitly communicates what to expect… helps them understand it may not be feature complete"*——标签即暴露面管理工具）。
- 撞 D-051（license 换文与公开仓事实已自洽化）与 ADR-0017（preview 标注诚实=决策本体——下架等于承认标注策略失败，且 Semgrep 反例已裁「不主动框定边界会被评测者代框」，反向同理：有诚实标注再撤标=自伤可信度资产）。
- 判据②修复在执行窗（D-159），冻结会把「过渡期体验差」变成「终态承诺差」。

## 3) 对比矩阵

| 项 | 工业界先例强度 | 与仓内既有裁决自洽性 | 信任账户风险 | 残余风险 | 备注 |
|---|---|---|---|---|---|
| **(i) 梯度＋判据预声明** | **高**：release≠launch（PostHog）/design-partner 判据前置（Tracsio、SZL）/GA 判据化（KEP-5241、SRE checklist）三链齐 | **高**：Stage-0=D-051 追认；Stage-1=D-150~152 charter 复用；Stage-2 判据四条=ADR-0017 漏斗终态+D-159 修复+GAP-HOST-01 处置+摄入分诊消化 | 低（每段暴露面增量由判据门控） | 判据④「无 pending」须防与 D-146⑤ 勘误轮次化冲突（pending 是快照态非终态，措辞见下） | **推荐** |
| (ii) 立即推广 | 低（KEP-5241/SRE/GTM 三方反向） | 低：撞 D-159 修复窗、撞 ADR-0017 信任账户裁定 | 高：外人 clone 红海+盲区在册时扩大外联=误读放大 | launch 三件套当前不合格 | 否 |
| (iii) 收敛冻结 | 低（无先例；preview 标签=正解） | 低：撞 D-051/ADR-0017/D-159 | 中（撤标自伤可信度） | 账本黑洞化、等于撤销 preview 诚实标注策略 | 否 |

## 4) 与 current D-xxx 的冲突清单（显式，修订协议呈报义务）

| 决策 | 核查结论 |
|---|---|
| **D-150~D-152（charter 三裁）** | **无冲突，是被复用**。候选 (i) Stage-1 明文「charter 协议复用」＝D-151① 协议逐案重跑非改向；需按 D-150⑤ 排程义务在新裁条文中写明「Stage-1 各 pilot 排程仍归批2 试用先行序，不因 Stage 梯度立法而重排」。 |
| **D-142/D-146（摄入四态）** | **措辞级注意点一处**：判据④写「全部过摄入分诊**无 pending**」——D-142② 已裁「pending 不升格第四守态」，且 D-146 框架下 pending 是快照态非处置终态。建议判据④措辞改为「试点 findings 全部过摄入分诊四态**封闭处置**（含 accepted-risk 三要素齐备），无未分诊残留」——避免「无 pending」被未来误读为禁止 pending 中间态。这是**行文精确化非翻案**，登记去向即可。 |
| **ADR-0017 / D-031~D-034** | **无冲突，是其终态兑现**：判据①（capability 5/5）即 ADR-0017 漏斗的 GA 终点；Stage-0 追认与 D-031「capability N of M · preview」标注语义一致。唯一注记：ADR-0017 Consequences 尾条「Agent Plugins 生态 preview 标注字段未成文」本次调研再证（AnySearch 检索 agent-plugin 生态无逐字标注惯例命中，VS Code 生态 Preview 标签先例可作类比参照但非同生态成文规范）——该悬置条款维持。 |
| **D-159（env-contract 刚裁）** | **无冲突，判据②是其完成态**：判据②「fresh clone 不红海」= D-159 分层契约落地的验收读数，非新裁面。需在新裁条文中显式回指 D-159 的 tier 判据为判据②的操作性定义（防双裁）。 |
| **D-157（锐评射程）** | 无冲突：候选 (i) 三段均为新裁面（姿态梯度与转窗判据此前无 current D 覆盖——D-150~152 裁的是「怎么试用」非「怎么暴露」），属 D-157 射程外新立，不触核销链。 |
| **D-148（accepted-risk 三要素）** | 无冲突且被引用：判据③「IDE 面实证或 accepted-risk 关闭」中 accepted-risk 分支直接援引 D-148 三要素（不修理由＋补偿控制＋复评触发条件）——条文写明「按 D-148 三要素齐备」即可。 |
| **GAP-HOST-01 台账（D-155）** | 无冲突：判据③的处置出口（verified 或 accepted-risk）即 manual_watch 条目的合法关闭路径，去向表照登。 |
| **D-051** | 无冲突：Stage-0 追认以 D-051 两段拍板（(a) 轨 listing＋license 自洽化）为事实底座，条文回指。 |

**呈报结论**：候选 (i) 无一实质翻案冲突；两处行文级注意点（判据④措辞防 pending 误读、判据②回指 D-159）按 D-146⑤ 勘误/scoping 惯例随裁登记即可，不构成 revised。

## 5) 推荐与理由

**推荐 (i)**，理由三条：

1. **每一段都有独立工业先例链，且先例强度递增**：Stage-0 是 release≠launch 的通行二分（PostHog 一手）；Stage-1 的判据预声明是 design-partner 惯例核心（Tracsio/Allston/SZL 三源同构），且本仓 charter 协议经首个 pilot 实证可跑；Stage-2 的判据化转窗有 KEP-5241 这个最强公开判据模板——「beta 反馈全 resolved 才准 GA」与判据④逐字同义。候选 (i) 不是发明新模型，是把三个成熟惯例按本案账本文法组装。
2. **与 (ii)/(iii) 相比是唯一零信任账户风险选项**：审计型工具的信任账户不可逆（ADR-0017 既裁），(ii) 在 fresh clone 红海未修复时扩大外联直接放大误读面，(iii) 撤标自伤。工业界对「已挂牌未推广」窗口的标准处理正是本案方案：标签诚实＋邀请制试点＋判据化转窗。
3. **判据包四条全部可机检/可台账核**：①漏斗完成=ADR-0017 票面状态、②fresh clone=守卫组读数、③盲区处置=GAP 台账+D-148、④findings 消化=摄入分诊去向表——与 D-149 守卫升格后的判据文化同构，转窗判据本身可入 registry manual_watch 锚（同 D-155 形态）。

## 6) Sufficiency Gate

`searches: 10（web_search 6 + anysearch 4） | angles: Official / Comparative / Criticism / Currency / Community 五类全覆盖 | full reads: 6（kubernetes.dev KEP-5241、MS devblog preview label、gtm-labs launch playbook、posthog handbook marketing、tracsio design-partner、gitlab docs feature-flag controls） | gaps: ①Tavily 引擎全程限流未参与（配额以 Exa+AnySearch 双引擎满足，交叉验证靠多域名一手源补足）②PostHog feature-previews 原页 403（以 handbook/marketing 原文替代，其 release/launch 二分与 open-beta 条款已一手核验）③Linear/Vercel 早期社区先例未取得一手逐字文档（design-partner 惯例已由 Tracsio/Allston/SZL 三源覆盖，缺口不影响结论）④agent-plugin 生态 preview 标注惯例确认未成文——与 ADR-0017 D-031⑤ 悬置既判一致，维持悬置。`

## 7) 完整来源清单

| 来源 | URL | 角度 | 贡献 |
|---|---|---|---|
| KEP-5241 Beta Feature Gate Promotion Requirements（kubernetes.dev，v1.34 stable） | https://www.kubernetes.dev/resources/keps/5241/ | Official | 转窗判据化最强模板：「唯一合法 GA 判据=beta 反馈全 resolved」＋PRR＋两周无 flake 窗——判据②③④同构 |
| PostHog Handbook – How marketing works（一手原文） | https://posthog.com/handbook/growth/marketing | Official | release≠launch 二分＋open-beta 条款（beta 标签不豁免 GA 流程）——Stage-0 追认＋「先修再推」次序先例 |
| New Preview label for VS extensions（MS DevBlogs, 2018-12-07） | https://devblogs.microsoft.com/visualstudio/new-preview-label-for-visual-studio-extensions-2/ | Official | preview 标签=暴露面管理工具而非暴露面收缩；0.x 版本宜配 preview 标——Stage-0 标注惯例一手 |
| How to Launch a Developer Tool（GTM Labs, 2026-05 更新） | https://gtm-labs.co/how-to-launch-a-developer-tool | Comparative/Criticism | launch 三件套前置＋「artifacts=评估面」——候选 (ii) 反向证据 |
| How to Structure a Design Partner Offer（Tracsio, 2026-04-24） | https://www.tracsio.com/articles/design-partner-offer-b2b-saas | Official | design-partner 判据须在 kickoff 前写定＋六要素表——Stage-1 charter 同构 |
| Design Partner Motion（Allston Labs, 2026-06） | https://allstonlabs.com/library/design-partners/setup | Official（对比模板） | written agreement＋end-of-term conversion——Stage-1 结构化先例第二源 |
| SZL Holdings internal-beta-ops.md | https://github.com/szl-holdings/platform/blob/main/ops/scale/internal-beta-ops.md | Community/实例 | 三段梯度表完整同构实例＋「no beta surface without honest status」 |
| GitLab Feature Flag Controls（docs.gitlab.com 一手） | https://docs.gitlab.com/development/feature_flags/controls/ | Official | 增量放量＋部署前不 enable——「先修可达性再放量」次序先例 |
| Evolving SRE Engagement Model（sre.google 一手） | https://sre.google/sre-book/evolving-sre-engagement-model/ | Official | launch readiness checklist 判据化模板 |
| 66 failed launches 帖（Reddit r/SideProject, 2026-02） | https://www.reddit.com/r/SideProject/comments/1rg7da1/ | Community（信号非权威） | 「被动沉默」反例——已注明不迁移（消费级 app、无信任账户约束） |

## 8) 信息缺口（开放问题）

1. **Agent Plugins 生态自身**是否会出现成文 preview 标注规范——ADR-0017 D-031⑤ 悬置条款持续有效，建议 Stage-2 判据①执行时重查一次。
2. 判据④「消化率」是否需要**时间窗**（如「全部封闭处置且此后 N 天无新增 finding 回流」）——KEP-5241 有「两周无 flake 窗」先例，本案是否引入观察窗属裁定面新参数，留 grill 临裁。
3. Stage-1「逐案 pilot」的邀请对象选择标准（charter 判据之外的宿主资格面）账本无 current 覆盖——若 Stage-1 立法，建议同轮裁「宿主资格判据」或显式声明逐案拍（用户闸门），避免临场扩射程。

