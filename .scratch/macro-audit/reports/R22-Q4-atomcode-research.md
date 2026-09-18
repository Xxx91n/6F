# R22-Q4 调研报告——锐评残余四奇观处置（立场性批评对已决已实装决策的复审受理面）

- 调研工具：atomcode-research（resume id: ce10d8cc-bff6-472e-b6c2-913907d45a27）
- 题面：D:\Aworker\6F\.scratch\macro-audit\reports\R22-Q4-research-prompt.md
- 置信：中高（多源交叉：Postel 三源／dist 两源／ADR 纪律两源／SDB 独立源）

## ① 结论（推荐 + 一句话）

**推荐 (b)：全数维持 + 事件绑定复审触发器**（登记动作为「立场批评不受理重裁、受理登记观察」的混合形态）。

一句话：**四项批评全部是纯立场/审美输入、零新增实证，按本仓 D-063（有实证即裁决）与 D-075（revised 的受理边界=立场批评＋实证双要素）的既有先例，都不满足重裁受理条件；但锐评的历史命中率（D-072「夺舍」批评最终触发 revised）证明立场批评不能当噪音丢弃——正确处置是逐项挂「可机检可证伪」的复审触发器入 33-gate-registry，让未来的实证自己敲门。**

外部证据：techlead.education ADR Guide 明言「If the context has changed, great — write a new ADR that supersedes the old one. If not, the decision stands」，并把「re-litigating settled decisions」列为 ADR 首要防病；同时要求「Maintain a quarterly review of all active ADRs」——维持裁决与常态复审机制不矛盾，后者正是 (b) 的形态。

## ② 逐候选裁定

| 候选 | 裁定 | 理由 |
|---|---|---|
| (a) 全数受理逐条重裁 | ❌ 拒 | 违 D-063 反面（无实证不重裁）与 D-075 先例（D-072 revised 受理=立场＋实证＋工业先例交叉三要素齐备才动）。本轮四项无一携带新实证。重裁触发 ADR 治理对偶错误：把 ADR 当可随时重审的草稿，决策纪律崩塌。 |
| (b) 全数维持＋事件绑定触发器 | ✅ **采纳** | 与 Nygard/MADR status 演化模型兼容：current 决策不重写不复审，只登记「context-change 监测点」；与本仓既有形制（event_bound 三态、D-069 已挂 cue-table-second-consumer）零新增概念税。 |
| (c) 挑最强项部分受理 | ❌ 拒 | 「最强项」筛选本身是立场对立场——四项答辩各有硬对价（golden 逐字节确定性／OWASP 分级非安全面／Kernel 边界／javascript-action 官方先例），挑哪项受理没有可证伪筛选判据，退化为主观裁量。 |
| (d) 不受理不登记 | ❌ 拒 | 丢掉锐评的历史信息价值（D-072 先例证明立场批评可携带真颗粒），违反 Dual Reporting／对账惯例：输入面事件不留痕即无法在未来实证出现时回溯「谁在何时质疑过什么」。 |

**补充裁定**：(b) 的落地动作不是新票，是 registry 增量——四枚 event_bound 触发器行＋账本一行登记「R22-Q4 立场批评维持、触发器挂账」，与既有收口动作同批执行，无独立立票成本。

## ③ 工业先例证据（带 URL，均已读原文）

| 主题 | 结论 | 信源 |
|---|---|---|
| ADR revisit 纪律 | 「decision stands until context changes」；supersede 不改写；regular review 捕捉 context 漂移；「prevents re-litigating settled decisions」直接支持 (b) | techlead.education ADR Guide（已读全文，2025-03）https://techlead.education/guides/architecture-decision-records-guide.html |
| Nygard status 模型 | Status: accepted→deprecated/superseded 演化是标准生命周期，无「因外部评论重开 accepted」一档 | rskuipers.com decision-making 讲稿 https://talks.rskuipers.com/decision-making-for-developers/40-minutes.html |
| Postel 法则现代争议 | 「分布式无对抗环境不存在」——现代共识倾向 fail-fast at boundary；ardalis「virtuous intolerance」正是 fail-closed 正当性论述 | https://ardalis.com/postels-law-robustness-principle/（已读全文）；https://lawsofsoftwareengineering.com/laws/postels-law；CACM Allman《The Robustness Principle Reconsidered》（403，摘要+HN 43669968 交叉） |
| 边界契约校验 vs 语义容忍 | Pact 官方：exact/loose matching 应逐字段决策——「consumer 端 unit test 层用 exact matching 最合适，因为期望与实际同源」；恰好证明 golden 逐字节比对（同源比对）用 strict 是正确的匹配层级选择，锐评「语义对比」主张反而错配 | https://docs.pact.io/consumer（已读全文，2025-05） |
| 正则/启发式 vs parser | semgrep 作者本人在 HN 阐明定位分层（security vs development 工具分轨）；NVIDIA NeMo PR#30 实例：静态检查器无法成为 containment boundary 时，官方处置是改文档声明 guardrails-not-boundary 而非换 parser——与 #55「注释载明 OWASP 分级」完全同构 | https://news.ycombinator.com/item?id=38594457；https://github.com/NVIDIA-NeMo/labs-OO-Agents/pull/30 |
| deterministic core + probabilistic edge | arXiv 2605.20173 提出 stochastic-deterministic boundary (SDB)：确定性 verifier+commit 承载可复现性，LLM 留在边界外；audit 21 失败复盘 81% 修复在加固边界——直接支撑 D-069 排除 NLI 入 Kernel 裁定方向 | https://arxiv.org/html/2605.20173 |
| dist 入仓 | javascript-action 生态：GitHub runner 不装 node_modules，官方两选项=commit node_modules 或 commit bundle；社区共识「commit artifact 是该生态既定代价」＋rebuild-diff 自动守卫是标配解法 | https://cardinalby.github.io/blog/post/github-actions/js-action-packing-and-releasing/（已读全文）；https://www.damirscorner.com/blog/posts/20250214-ImplementingPrivateJavaScriptGitHubAction.html |

## ④ 落地形态设计：四枚触发器（33-gate-registry 五要素形制）

参照既有 registry 条目（duckdb-wasm-persistence-fixed：id/occurred/note 描述触发语义/关联决策锚）＋manual_watch 五要素。四枚全部 event_bound（默认态，各带机检或可判定事件锚）：

| 触发器 id | 事件定义（可判定口径） | 判定者/验证方法 | 过期兜底 |
|---|---|---|---|
| git-iso-contract-violated | GITCLI-OUTPUT-CONTRACT 在真实采集路径（非契约测试自证）命中 ≥1 次且根因=git 上游输出形状漂移（非本仓数据损坏） | 守卫日志计数器；verify=复现该 commit+git 版本的原始 %cI 输出留档 | 挂 upstream-lock git-cli 行；git ≥2.45 全量铺开后（契约测试 11 断言连续 2 窗口零 WARN）转 manual_watch |
| sql-strip-escape-observed | stripSqlLiterals 后黑名单在真实 SQL 面漏判致错误放行/误拒 ≥1 例实证；或该门面角色升级为安全边界（设计文档宣称面变更） | 逃逸案例须含最小复现 SQL＋正确判定；角色变更以 docs/CONTEXT 宣称面 diff 为准 | 角色不变则事件无自然到期——改挂「禁止条件」值守：任何文档/票面将该函数表述为 security boundary 即 FAIL（grep 级机检断言，挂 34-check 链） |
| cue-table-extraction-trigger | **已存在**（D-069 挂账：第二消费者出现或 held-out 系统性误判） | 既有 event_bound 定义原样 | 已有；本轮零新增，仅登记引用不重建 |
| dist-in-repo-superseded | D-038 npm publish 激活（发布渠道决策翻转）；或 pack 体积过阈（bundle >2× 源码体积或安装报体积故障实证）；或官方 javascript-action 惯例反转（GitHub 官方文档弃 dist-in-repo 指引） | D-038 决策状态变更即触发（判定者=账本）；体积阈值机检（build-bundle 后 stat 断言可挂 rebuild-diff 同链）；惯例反转以 docs.github.com actions 原文 diff 为锚 | 与 D-072⑥(a) duckdb-vendored-presigned 共享 upstream 探测面；一年无任何子事件发生转 manual_watch 一次复述后继续挂 |

**防「安慰剂」设计要点**：每枚触发器可证伪性来自三选一——①计数可机检（git-ISO：守卫本来就 throw，命中必然留痕零额外观测成本）；②禁止条件值守化（SQL：不是等逃逸发生，而是把「不得宣称安全边界」变成 grep 级机检断言违规即红——把不可判定事件转译为可判定事件的标准手法，NeMo PR#30 文档化先例同构）；③锚定既有决策状态机（dist：绑定 D-038 翻转与 upstream-lock，事件由其他决策演化自动携带）。只有「SQL 逃逸实证」本质观察等待型，故加②双保险避免成为唯一安慰剂。

## ⑤ 失败模式与治理

1. **触发器通胀**：每轮锐评都挂 4 枚，registry 膨胀成挂账坟场。治理：同主题同事件只许一个 id（cue-table 复用既有项即示范）；新增触发器须过 D-041 五要素税制（有 owner/事件/验证方法才许入）。
2. **触发器永真化**（写法沦为「如果有问题再复审」）：判定口径必须「事件发生/不发生」二值，禁止程度副词（「显著恶化」「明显不足」无锚即拒）。dist 体积阈值给了具体数（2×）仍偏软——落地时以实测 baseline 定死数值。
3. **维持≠背书固化**：风险是团队把「维持」读成「永久免检」。治理：账本登记行明写「维持=当前证据面下不重裁，非免检声明；四触发器见 registry」，防止下轮审计读成僵化证据。
4. **锐评者激励**：全数维持+挂账的处置若不向锐评方反馈颗粒去向，锐评渠道会枯竭。治理：登记行须逐条写明「该批评的观察价值被吸收进哪枚触发器」。

## ⑥ 与本仓 current 决策冲突核查表（逐条）

| 决策 | 冲突面 | 裁定 |
|---|---|---|
| D-063（有实证即裁决） | 无实证的立场批评要不要重裁 | 不冲突，被援引——正因无实证，不裁决才合规 |
| D-075（revised 受理边界先例） | 本轮是否构成 revised 条件 | 不构成——D-075 受理=立场＋实证＋工业先例交叉三要素；本轮缺后两者。恰是 D-075 划定了本轮不受理的边界 |
| D-059①（git-ISO 契约） | 锐评「epoch/语义对比」主张 | 不冲突且被加固：Pact 分层匹配证据表明同源 golden 比对层用 strict matching 是正确层级选择；fail-closed 是 D-068 本意行为 |
| #55／OWASP 分级注释（SQL 门面） | 「该上正规 parser」 | 不冲突：作用面=应用侧启发式守卫非安全边界，NeMo 先例（文档声明 guardrails-not-boundary）支持现形态；新增「禁宣称安全边界」机检是增强非修订 |
| D-069（词表 Kernel 边界） | 「手搓专家系统」 | 不冲突：SDB 文献（arXiv 2605.20173）独立支撑确定性 verifier/概率组件边界划分；cue-table-extraction-trigger 本就挂在 D-069——复审通道已存在，锐评未给出触发其成立的新事实 |
| D-067/D-038（dist 入仓／npm deferred） | 「制品库化」 | 不冲突：git-clone 无构建步分发是该决策本体；javascript-action 官方惯例已核验仍为 dist-in-repo（双源）；锐评未给替代方案，触发器绑定 D-038 翻转即处置「惯例反转」可能 |
| ADR-0014/0015/0019 | 触发器形制是否腐蚀防腐边界/量测效度/SWMR | 不冲突——触发器全是 event_bound 外挂观测，不改 0014 适配器契约本体、不引入量测面改写、不触碰 SWMR |
| CONTEXT Trigger-gated Closure | (b) 的机制合法性 | 完全同向：触发器挂账正是 Trigger-gated Closure 标准执行形态（D-059③ runtime-doctor-trigger 已有兑现先例） |

## ⑦ 信息缺口

1. cacm.acm.org Allman 原文 403 未读全文——Postel 现代争议以 ardalis/lawsofsoftwareengineering/HN 三源交叉，置信中高；
2. AnySearch 对「review trigger 可证伪写法」未命中硬文献——四枚触发器判定口径系按 registry 既有形制＋机检可行性设计；pre-mortem 文献只提供方法学背书；
3. dist 体积阈值（2×）是拍脑袋数，落地时应以当前 153.6KB bundle 实测定锚；
4. git ≥2.45「全量铺开」无外部可观测事件——git-iso 触发器过期兜底只能依赖本仓契约测试窗口计数，属内部锚。

## ⑧ 建议追问

1. 四枚触发器是否需要在本轮 grill 就拍板判定口径数值（尤其 dist 体积阈值），还是留到落地票再定死？——前者防安慰剂，后者少一次返工。
2. 「禁宣称安全边界」的 grep 机检要不要真挂进 34-check 链（四枚中唯一可立即机检化的），还是先挂 manual_watch 观察一个窗口？
3. 锐评方反馈闭环：维持+挂账的处置结果要不要按 Dual Reporting 惯例回写一份对锐评六项的逐条去向表（含已处置两项），作为锐评渠道的维护动作？
