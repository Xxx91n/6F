# R23-Q3 atomcode 调研报告——review 覆盖切片 S5↔S4 双挂行的收口形态

> 题面：D:\Aworker\6F\.scratch\macro-audit\reports\R23-Q3-research-prompt.md
> 运行：2026-09-19 · atomcode 串行单发 · 三引擎多角度 · 先例原文核验（Pact pending pacts／SonarQube 规则未挂载／CHAOSS metric 双性）· gaps：SonarQube software-qualities 原文页未逐字（重定向，二手转引兜底）、CHAOSS 分类演化史未查全、D-080 账本原文经知识库索引读未逐字

## 0) 执行摘要（Tl;dr）

**推荐 (d) 形式化挂起＝事件锚绑定的 pending/event_bound 态**（Confidence：高——本仓 D-078④ 原文、33-gate-registry 机制、codelore 暂缓面集先例三重内部支持，Pact pending pacts＋SonarQube 规则未挂载两个外部先例同构）。关键事实链已锁定：pulls.reviews 在 GITHUB_REST_PLANNED_SURFACES（engine/src/upstream/github-rest.ts:30），ADR-0020 最小契约不含 review 面，该 fact 尚无数据形状——现在裁 S4 或 S5 都是给无数据之面立法。而映射表第 11 行自己写着「双挂行在接线票落地时按采集数据裁定，不预先二选一」：**现行文已是「挂起」，缺的只是把 prose 挂起升级为 D-035 合规的事件锚挂起**。

## 1) 逐候选裁定

| 候选 | 裁定 | 理由 |
|---|---|---|
| (a) 现裁 S4（交付流，同 merge lead time 族） | **否决** | 直接违 D-078④「双挂行在接线票落地时按采集数据裁定，不预先二选一」——账本 current 原文，现裁即推翻自己 24h 前的裁决。且 LFX 虽把 review 时长放 Development 类，CHAOSS 同一 metric 显式双性，数据缺席下单裁 S4 是锚定偏差不是裁定 |
| (b) 现裁 S5（协作所有权，同 Bot 占比族） | **否决** | 同上违 D-078④。Bot 占比→S5 有「平台声明 Bot 身份」措辞锁撑腰，review 覆盖没有等价判据锁——它量的是流程严谨度（S4 向）也是评审者参与/多样性（S5 向），先验二选一更站不住 |
| (c) 双挂转正，同 fact 永喂两维 | **否决** | D-078④ 允许的是 fact→**(dimension,准入条件) 多值**——同一 fact 不同切片各有准入列；本案双挂是**同一切片**同时喂两维，属双计数泄漏，与「切片决策防双象限漂移」（#51/D-054）直接冲突。D-078④ 把双挂定性为**中间态**（落地时裁定）不是终态 |
| **(d) 形式化挂起＝事件锚绑定（推荐）** | **采纳** | ① fact 无数据形状，「待采后裁定」是唯一诚实读数；② D-035「不得裸挂」要求绑锚——pulls.reviews 移出 GITHUB_REST_PLANNED_SURFACES 是纯代码面机检事件（grep 导出常量即可），比日历锚更硬；③ 本仓已有同型先例：codelore 暂缓面集行=「registry codelore-deferred-faces 激活后再归位」（映射表 33 行），(d) 只是把 github-rest 侧同类行补齐同款机制；④ 外部先例 Pact pending pacts：新契约「验证不 gate 构建，provider 实现后 graduates out of pending」——pending 态是工业正型不是债务 |
| (e) 整行 declare out of bounds 移出表 | **否决** | Shape Up OoB 适用于「不可读/无需求」的悬项（LFX 权重列场景）；review 面是 plausible 的未来采集面（ADR-0020 已 planned 登记），OoB 后一旦激活面还须重开裁决，纯增加往返。OoB 留给真正无需求项 |

## 2) 工业先例（均已读原文）

- Pact pending pacts：新契约「验证不 gate 构建，provider 实现后 graduates out of pending」——pending 态是工业正型不是债务（docs.pact.io）
- SonarQube：rule 未挂 quality=合法态（software-qualities 页，二手转引——fetch 重定向首页）
- CHAOSS：同一 review metric 显式双性（Evolving/Code Development 与 Community 双 focus area 证据）
- LFX：review 时长放 Development 类（分类归属先例但非单维锚）
- 本仓同型先例：映射表 33 行 codelore 暂缓面集=「registry codelore-deferred-faces 激活后再归位」——github-rest 侧补同款机制

## 3) 落地形态（(d) 实施）

**3.1 映射表 v1.0 行文**（仅改 dimension 列措辞＋备注）：

| github_rest.pr_metadata（review 覆盖切片） | review 覆盖 | **pending(event_bound)**——候选对 S5↔S4，无偏好序 | 挂起锚=registry github-rest-review-coverage-dimension；触发事件=pulls.reviews 移出 GITHUB_REST_PLANNED_SURFACES（面激活、fact 实产）之日，接线票落地按采集数据裁定（D-078④） | 面仍 planned（D-048/ADR-0020），YAGNI 不破 |

要点：候选对保留但**注记「无偏好序」**——现表 S5 写在前，不注记则读者会锚定 S5 为默认。

**3.2 33-gate-registry 草案**（events 节＋items 节各加一员，形态完全对齐现有 event_bound 项如 mw-trigger-c）：

- events 增补 github-rest-reviews-active{occurred:false,note:D-048/ADR-0020 review 面 planned，pulls.reviews 移出 GITHUB_REST_PLANNED_SURFACES 导出常量之日=事件发生；机检=33-check 对导出常量成员断言}
- items 增补 github-rest-review-coverage-dimension{family:upstream-dimension-map；trigger_event:github-rest-reviews-active；trigger:pulls.reviews 移出 PLANNED（review 面 fact 实产）；deadline:无硬到期纯事件驱动（次锚=映射表 next_review 2026-10-18 复审照常过目）；review_at:接线票立项时按采集数据裁定；status:pending；watch:event_bound；verify_method:33-check 事件成员断言＋接线票立项审计清点：映射行 pending→decided 为该票票间依赖}

**3.3 机检形态**：33-check 现有事件扫描已覆盖「occurred=true 而 item 未裁定→升级」语义；新增断言仅一条——GITHUB_REST_PLANNED_SURFACES.includes('pulls.reviews')===false 与 events[github-rest-reviews-active].occurred===false **一致**（常量改了而事件没翻=守卫红，防文档-代码漂移）。44-check A14「上游文件无 S1-S5 字样」不受影响：锚落 registry＋文档面，代码零改动。

**3.4 账本留痕**：本裁定记 D-081（或 D-078 注记，若 grill 判为行形制补齐而非新裁决）一句话：「review 覆盖双挂行由 prose 待裁升级为 event_bound 挂起，锚=github-rest-reviews-active，登记 33-gate-registry；S4/S5 现裁与否决理由存档」。v1.0 定稿同步更新 last_reviewed/next_review（D-024 两字段不动）。

## 4) 失败模式

| 失败模式 | 治理 |
|---|---|
| 「无偏好序」不注记→读者锚定 S5 为默认 | 行注记「候选对 S5↔S4 无偏好序」 |
| PLANNED 常量移除而事件未翻→锚失灵 | 33-check 一致性断言（常量成员↔事件 occurred 一致性） |
| pending 行被误读为「已裁定 S5」 | dimension 列写 pending(event_bound) 非 S5；备注引 D-078④ |
| 事件绑定条目成为永久坟场 | 次锚=映射表 next_review 2026-10-18 照常过目（D-024） |

## 5) 冲突核查（逐条 D-xxx）

| 决策 | 核查结论 |
|---|---|
| **D-078④（行形制）** | **合**：事件绑的是 registry 登记位（文档/决策面），映射表行仍保有 fact_type/语义/候选对/准入/备注五列，不退化为 1:1 查表；双挂行本身即 D-078④ 允许的中间态，(d) 只是给它补上 D-035 要求的锚。候选 (a)(b) 反而违 D-078④「不预先二选一」原文 |
| **D-035（不得裸挂）** | **合且是被满足**：prose「双挂待采后裁定」才是裸挂；(d) 的 event_bound 锚（代码面机检事件）比 manual_watch 更强，正是 D-035④ 暂缓面集的既定治理形态 |
| **D-041（值守三态）** | 合：event_bound=默认态，触发已绑、守卫机检；不需要 manual_watch（触发非条件式判据），无 risk_accepted 暴露面 |
| **D-048 / ADR-0020** | 不动：review 面 maintained planned，不新增采集、不改最小契约；事件锚只观测 PLANNED_SURFACES 成员变化，零代码改动 |
| **D-047 / D-054** | 一致：归属裁定延后到有采集数据的切片时点，与「行为面 QuadrantEntry 归位」先例同构 |
| **D-024** | 合：v1.0 定稿即一次复审，next_review 2026-10-18 作为 pending 项的次级日历锚照常 |
| **D-080** | 合：本行裁定属于 v1.0 定稿 grill 的题内欠账（R23-Q2 报告 §4.1 已列「决策面 grill 单项拍板、账本留痕」），落账即收口 |
| **ADR-0004** | 合：pending 不是新维度，是既有 S1-S5 框架内的延迟归属 |

零 revised。

## 6) 信息缺口

1. SonarQube software-qualities 原文页未逐字核验（fetch 重定向到 docs 首页）——「rule 未挂 quality=合法态」的官方措辞是二手转引，若需逐字引用需补一次定点抓取；
2. CHAOSS 把 review 类指标同时归过 Evolving/Code Development 与 Community 多个 focus area 的历史分类变迁未查全（当前 KB 页只给了双性证据）；
3. D-080 账本原文仅经知识库索引读，未开 decision-ledger.md 逐字核对。

## 7) 建议追问（grill 现场三问）

1. **同款锚化是否外溢**：Bot 占比「S4 备选挂追问留票」（19 行）是否同轮一并事件锚化（同型裸挂风险，锚=同一 github-rest-reviews-active 即可，Bot 占比 fact 已实产、只差数据足够性判据）？
2. **机检落位**：PLANNED_SURFACES↔registry 事件一致性断言落 33-check（事件扫描天然所在）还是 44-check（上游文件守卫所在）？我方倾向 33-check——它已有 event 扫描语义，44-check 只管「无 S1-S5 字样」渗入。
3. **账本形态**：本裁定记新 D-081 还是 D-078 注记？R23-Q2 报告 §6 对 D-078⑤ 的判据（「裁决主体不变=注记」）可直接复用：D-078 裁决主体（骨架/形制/排期）不变，本条是形制的机制补齐，默认建议**注记**；若 grill 认为事件锚化构成形制语义升级，则开 D-081。

## 完整来源清单

| 标题 | URL | 角度 | 贡献 |
|---|---|---|---|
| Pact pending pacts | https://docs.pact.io/pact_nirvana/step_4 | Official | pending 态不 gate 构建，provider 实现后 graduate——pending 是工业正型 |
| SonarQube software-qualities | https://docs.sonarsource.com/sonarqube-server/ | Official(二手) | rule 未挂 quality=合法态（fetch 重定向，转引兜底） |
| CHAOSS metrics | https://chaoss.community/kbtopic/evolution-project/ | Official | 同一 review metric 双 focus area 归属双性 |
| LFX Insights categories | https://insights.lfx.linuxfoundation.org/ | Official | review 时长归 Development 类 |
| 本地账本/实物 | decision-ledger.md、upstream-dimension-map.md、github-rest.ts、audit.ts、33-gate-registry.json | 本地证据 | D-078④ 原文、双挂行、PLANNED_SURFACES 成员、象限消费实况、event_bound 形制 |
