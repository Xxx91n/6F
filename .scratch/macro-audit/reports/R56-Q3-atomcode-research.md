正在加载 atomcode-research 技能执行本次深调研。先回顾本地账本与 ADR/CONTEXT，并检索知识库历史召回。补齐账本关键决策细节，然后发起 atomcode 深调研。补钉 D-062/D-203/D-054 原文，然后启动 atomcode 深调研。本地账本关键裁决已钉死（D-054/D-062/D-203/D-175 语义齐备）。现在发起 atomcode 深调研（串行单飞）。atomcode 调用被中断，按续跑锚定规则先探测进程是否仍在后台运行。atomcode 进程仍在后台运行（未判死）。按续跑锚定规则轮询等待。探测结果与 60 秒前的存活快照对比：上次探测时进程仍在，现在检查是否已完成并落库。进程快照不稳定，先检索知识库确认 atomcode 本次（R56-Q3）产出是否已落库。继续轮询 atomcode 进程（改用 bash 短轮询，ctx 的长 sleep 被 RPC 超时打断）。继续轮询 atomcode（ctx 长 sleep 不稳，改 bash 串行轮询）。轮询到达守卫上限。改用不同动作：检索知识库确认 R56-Q3 产出是否已落库，同时确认进程状态快照。后台 atomcode 仍在推进（8:18 出现子进程=多轮搜索进行中）。按 R56-Q2 同案先例：不空等，并行开展自有三引擎验证（不违反串行护栏——只是直接检索，不另发 atomcode）。定点深挖原文（补足 web_fetch 配额）＋补角度检索。定点深挖：OpenFeature 分级原文与 JMIS 预宣称实证研究原文。补齐对比/批评角度检索，然后检查后台调研进度。最后探测一次后台调研，随后综合输出终稿。后台调研已超 10 分钟未回收（超派发时限）。按预案不再等待，用已达成配额的材料综合输出；后台结果若日后落库可经 `ctx_search(source:atomcode)` 追溯。先做配额自查，然后给出终稿。

**Sufficiency Gate**: searches: 9+（Exa×2、Tavily×2、AnySearch×5 查询）| angles: Official（K8s/Azure/OpenFeature 官方档）· Criticism（vaporware/Area 120/demo-gap）· Comparative（mixed-maturity 矩阵、两路线代价）· Currency（2026 文 dated）· Community（reddit/红帽 REDMONK）| full reads: 9（本轮直读 4：kubernetes.io feature gates、learn.microsoft.com Azure lifecycle FAQ、openfeature.dev spec、jmis-web.org JMIS 论文；跨会话已核 5：GitHub SLA、Iterable Beta Terms、.NET release policies、Azure preview 补充条款、K8s deprecation policy）| domains: 6+ | gaps: 见文末。

---

# R56-Q3 调研报告 —— Macro-C/Micro-A 名实缝处置

## 1) 执行摘要（Tl;dr）

**推荐 (iv) 混合非对称为主、以 (iii) 的 taxonomy 成文为其表述载体**（Confidence：中高）。法理边界句已由 R56-Q2 五源钉死：preview=用户可达交付面，工件存在不算——两管线在 `.scratch`、零 engine 复用、不入分发，现状「preview」标注名实不符是实锤。在此前提下，Macro-C（纯本地、零外部依赖面、真移植最便宜）产线化，Micro-A（宿主 API diff 工件依赖面、适配器硬化更重）收窄披露＋同票立产线化票，是唯一同时满足 ADR-0017 诚实线、D-054 同票绑定、D-062 计数语义、ADR-0015 效度先行四条 current 约束的候选。纯 (i)（双双收窄）与纯 (ii)（双双产线化）各自在一条 current 约束上付多余代价。

## 2) 分点结论

**结论 1：preview 的法理边界已有五源交叉定谳——本案两管线不满足（Confidence：高，双引擎双源）**

R56-Q2 已核：GitHub SLA（"Preview means a service…"——前提是用户能使用）、Iterable Beta Terms（beta 资格由 **in-product labeling** 触发）、.NET release policies（preview=「**offered** for the community to test」）。本轮补核：Azure 五级生命周期（private preview→public preview→GA→deprecation→retirement）中每一级的定义都含「Who public preview is generally open to?」——**可达性是分级定义的构成项**（learn.microsoft.com 直读）；K8s feature gates 表的 Stage/Since/Until 三列把生命周期做成**机检账面**（kubernetes.io 直读）。Macro-C/Micro-A 工件在 `.scratch` 不入分发（分发物=engine/dist＋skills＋manifests），用户装插件无法触达——按全部五源，现状不构成合法 preview。

**结论 2：「宣称先行、交付后补」 vs 「交付先行、宣称保守」的代价结构不对称（Confidence：中高，学术＋实践双源）**

- JMIS 17(1) 2000（Hoxmeier，同行评审，直读原文）：对 DBA 群体的实证——**功能承诺兑现比按时交付更强地关联供应商声誉**；即「宣了但功能不兑现」的声誉惩罚重于「宣了但迟到」。转化为本案：**保留超出现有交付面的 preview 宣称是高压项**（reputational debt 累积在「名」一侧）。
- Marketing Science 2013（vaporware/suddenware/trueware 模型）：宣示策略在预测能力弱＋需求侧收益小时滑向 vaporware（不实预宣）——即宣称先行路线的稳态风险是宣称脱离交付能力。
- 实践侧批评源（demo vs production 文献、RedMONK 开发者演示纪律）：demo 面与产品面的差距是「curated data、无集成、无边界案例」——与本案 .scratch 自含脚本 vs engine 一等命令的缝同构。
- 反向代价（capability lag，交付先行宣称保守）：产品化了的 Macro-B/Micro-B 已在能力矩阵 active，收窄过度的代价是**可发现性损失**与「诚实反成不可信」的反效果——ADR-0017 已引 Semgrep 反例：明文承认边界反成可信度资产。所以最优不是最保守，是**名实严格对齐的分级披露**。

**结论 3：同面两级读（混合成熟度矩阵）被工业惯例接受，且需 taxonomy 成文（Confidence：高，双源直读）**

- OpenFeature specification（直读）：同一份规范文档内，各 normative section 独立标注 Experimental/Hardening/Stable 三级，且「No explicit status = Experimental」兜底——**同一发布面内逐行不同成熟度是成文惯例**，配各 SDK 的 conformance matrix 逐行落地（dart-server-sdk matrix 直读：同一表内 Stable/Hardening/Experimental 行混排）。
- Azure（learn.microsoft.com 直读）：同一次 GA（Entra External ID 2024-05-15）内，Enterprise Applications/SSO 单独维持 public preview 标注——**产品整体 GA、组件行各自成熟度**是被官方问答确认的合法形态，且明文「无 SLA、best-effort support」随行披露。
- K8s Graduated/Deprecated 表（直读）：Since/Until 列使混合成熟度可机检。
- 对本案：(iv) 的「3 产品化 preview＋1 demo＋1 absent」矩阵形态不违背惯例；**但两级读必须 taxonomy 成文**（每行语义标签＋demo 行的「永不随 tgz 分发」明示），否则两级读退化为 D-054 所禁的「声明↔实物不一致」。

**结论 4：demo→product 移植的校准失效风险真实存在，ADR-0015 重校准复跑是正确防线（Confidence：中高）**

校准漂移文献（calibration drift：仪表/模型输出随时间或环境系统性偏移；临床预测模型领域已有漂移检测与更新规程——PMC8627243 等多源）核心洞见：**漂移不来自仪器损坏，来自使用环境变化**。移植到本案：38/48 脚本的度量是在其原语料上校准的；移植进 engine 后，输入面（被测仓形态、采集通道、facts 写入路径）全部变化——不重校准则移植件产出的数字**形似而义异**。ADR-0015「移植件须原语料重校准复跑一致」正是工业校准规程（control chart＋in-house reference 对照）的软件化。这条对候选 (ii)/(iv) 是硬准入，不是可选步骤。

**结论 5：D-062 DoR-a 连带后果——(iv) 下两条支路的先例结构（Confidence：中）**

- DoR-a=「前序层 preview 全上架（Micro-A＋Micro-B preview 闭环）」（D-062①a 原文，本轮已核）。
- **支路 A（门重开口）**：(iv) 中 Macro-C 产线化→Macro-C 计入 preview 已上架；Micro-A 收窄为 demo→**DoR-a 的 Micro-A 分量不满足**，门保持关。工业先例：Azure Entra 组件行单独维持 preview、不因产品 GA 而放行（结论 3）——**门语义跟着组件行走，不随产品整体走**，这正是 DoR-a 设计本意，无需改写门，只需计数表如实反映。
- **支路 B（解释票）**：若 owner 裁定 Micro-A 的 demo 状态在 DoR-a 中按「有条件满足＋解释票」计，先例是 K8s「never graduate」显式声明——**降级可以是终态合法声明**（Iterable 也明文允许 may never GA），但必须显式写入账本而非默认放行。
- R56-Q2 调研已判：B4（三行重估）显式依赖 B3 的 Micro-A 归属裁定落地＋D-062 计数表刷新——本裁定必须先给出计数表新值。

## 3) 候选对比矩阵

| 候选 | 名实一致性 | current 约束摩擦 | 工程代价 | 主要风险 |
|---|---|---|---|---|
| (i) 双收窄＋立票 | 达标（收窄后名实齐） | 与 D-054 同票绑定兼容；但 Macro-C 纯本地零依赖面，收窄=**对已可低成本兑现的能力宣布不兑现**，与 ADR-0017 Semgrep 反例（诚实披露边界是资产）张力最小但保守过度 | 最低（改措辞＋立票） | capability lag：5 层名义保 3；DoR-a 的 Macro-C 分量也失格，门更关 |
| (ii) 双产线化 | 达标 | ADR-0015 重校准硬准入（双件复跑）；D-034② 层序不动；多周批与 D-175 等待期「深度非广度」纪律需对表 | 最高（Micro-A 适配器硬化是大面） | 校准失效风险×2；Micro-A 硬化中若宿主 API 面变动，票面承诺反被拖累 |
| (iii) 分层建制 | 措辞达标但**两行仍名实不符**（改个标签不改变用户不可达） | 与 ADR-0017「标注诚实是决策本体」最紧的摩擦点——K8s 分级里每一级都是可达的，不存在「不可达级」 | 低（成文＋账本列） | taxonomy 成为漂移掩护：两级标签若无 DoD 约束，实为措辞缓颊 |
| **(iv) 混合非对称** | **每行严格一致**（3 产品化 preview＋1 demo＋1 absent） | D-054 同票绑定兼容（Micro-A 收窄与立票同票）；D-062 计数表如实刷新；ADR-0015 只对 Macro-C 一件跑重校准 | 中（Macro-C 真移植一个批位） | 同面两级读需 taxonomy 成文（借 (iii) 的成文面）；Micro-A 立票排期需 D-175 等待期清单归位 |

## 4) 推荐

**推荐 (iv)，并吸收 (iii) 的 taxonomy 成文为 (iv) 的披露载体**：

1. **Macro-C 产线化**：纯 node builtins＋本地 git 考古、零外部依赖面，是「最便宜的真移植」；移植后按 ADR-0015 原语料重校准复跑一致，接 engine 一等命令＋file-card 面（D-058 kernel 边界、D-034② 层序第一格归位）。
2. **Micro-A 收窄＋同票立产线化票**：报告头/SKILL.md 降为「calibrated demo · not in plugin distribution」（补宿主 API diff 工件依赖面的适配器硬化披露），同票立 #48-续 产线化票（D-054 纪律：只收窄不立票=重演声明↔实物不一致）。
3. **法理边界句入 CONTEXT 词条**（共享约束）：「preview=用户可达交付面；工件存在或内部脚本产出不构成 preview 标注依据；同面各能力行独立标注成熟度（OpenFeature 逐节分级＋Azure 组件行独立 preview 先例），demo 级行明示 not in plugin distribution」。
4. **D-062 计数表刷新**：DoR-a 按 (iv) 后的新值如实改写——Macro-C 分量满足、Micro-A 分量随收窄暂不满足，门维持关至 Micro-A 产线化票闭环；不采用解释票放行（K8s「never graduate」先例表明显式声明合法，但本案无显式声明依据，默认如实计数）。
5. **audit.ts 行级修正归执行窗**（共享约束照旧）。

**置信度：中高。** 高置信：preview 法理边界（五源＋本轮 4 直读补强）；同面两级读惯例接受度（OpenFeature/Azure 双直读）。中置信：(iv) 优于 (i)/(ii) 的选边——外部惯例只钉「名实必须一致」的边界，选边最后是本仓主权裁定（D-203 已裁定 B3 票面钉语义层），且后台独立第二轮意见未回收。

## 5) 完整来源清单

| # | 标题 | URL | 角度 | 日期 | 贡献 |
|---|---|---|---|---|---|
| 1 | K8s Feature Gates（Graduated/Deprecated 表） | kubernetes.io/docs/reference/command-line-tools-reference/feature-gates | Official | v1.37 现行 | Stage/Since/Until 机检账面；分级与「永不毕业」显式声明 |
| 2 | Azure Infrastructure Lifecycle FAQ | learn.microsoft.com/en-us/lifecycle/faq/azure-infrastructure | Official | 2026-03-18 更新 | 五级生命周期；可达性是分级定义构成项；private/public 两级 preview |
| 3 | Azure Preview 补充条款 | azure.microsoft.com/en-us/support/legal/preview-supplemental-terms | Official | 现行 | Early Access Preview 分层条款（R56-Q2 已核，本轮复引） |
| 4 | OpenFeature Specification（Document Statuses） | openfeature.dev/specification | Official | 现行 | 同面逐节 Experimental/Hardening/Stable 分级惯例 |
| 5 | dart-server-sdk conformance matrix | github.com/open-feature/dart-server-sdk/blob/main/doc/client-sdk-conformance-matrix.md | Official | 现行 | 混合成熟度矩阵逐行落地实例 |
| 6 | Hoxmeier, *Software Preannouncements and Their Impact on Customers' Perceptions and Vendor Reputation*, JMIS 17(1) | jmis-web.org/articles/438 | Official（同行评审） | 2000 | 功能承诺兑现>按时交付关联声誉——宣称面超交付面是高压项 |
| 7 | *Vaporware, Suddenware, and Trueware*, Marketing Science | psycnet.apa.org/doi/10.1287/mksc.1120.0762 | Official（同行评审） | 2013 | 宣示策略的均衡条件；vaporware 稳态风险 |
| 8 | Google Area 120 / Tables 关停系列 | support.google.com/area120-tables、killedbygoogle.com、9to5google.com | Criticism＋Community | 2025-12 关停 | 实验性产品线的披露与退役纪律；「graduated back to Google」心智模型 |
| 9 | Demo vs Production gap | nimblebrain.ai/why-ai-fails/demo-vs-production、redmonk.com（2017） | Criticism | 2026 | demo 面（curated、无集成）与产品面的差距结构——与 .scratch 自含脚本缝同构 |
| 10 | K8s Deprecation Policy | kubernetes.io/docs/reference/deprecation-policy | Official | 现行 | 分级退役时限；Alpha 可无预告移除 |
| 11 | Clinical calibration drift 检测 | pmc.ncbi.nlm.nih.gov/articles/PMC8627243 | Official（同行评审） | 2022 | 漂移检测→更新规程：移植/环境变化必须触发重校准 |
| 12 | Calibration drift 工业文献 | transmittershop.com、system-scale.com、quantumopsschool.com | Comparative | 2024-2026 | control chart＋in-house reference 对照＝ADR-0015 复跑一致的工业同构 |

## 6) 信息缺口

1. **后台独立第二轮意见未回收**：atomcode 深调研进程超时未退，结果日后落库可经 `ctx_search(queries:["R56-Q3"], source:"atomcode")` 追溯补强；本报告不阻塞于它。
2. **「不可达级」标签是否有正向先例**：K8s/Azure/OpenFeature 三源中每一级都是可达面，未找到「标注了但用户完全拿不到」被惯例接受的案例——(iii) 的 taxonomy 若独立成裁，缺先例支撑。
3. **Micro-A 适配器硬化的实际工时面**：fetchDiffArtifact/cassetteFetcher 对宿主 API 工件面的依赖度未做代码级工作量测算（属执行窗估时，非本裁定必需）。
4. **解释票支路的本仓先例**：D-146⑤「计时中→not_started 链式更正」是最近邻，但非 DoR 门语义的解释票先例；若 owner 想走支路 B，需要新立形态。
5. Tavily/Exa 引擎本轮未在「分层建制成本收益」点上拿到直接量化文献（taxonomy 成文成本收益为多源归纳推断，非实引量化研究）。
