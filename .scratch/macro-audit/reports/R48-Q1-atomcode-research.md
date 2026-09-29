# R48-Q1 调研报告 —— CI workflow 静默死亡处置包＋哨兵归位

> atomcode 深调研存档（轮48 Q1）。执行口径：题面内置三引擎＋web_fetch 协议（default 模式）；searches: 7 | angles: Official/Comparative/Criticism/Community/Currency | full reads: 6（含 1 个 404 弃用）。本地实证核验：L144 病态实存（题面与文件一致）；grep 全仓确认 engine 无 yaml/js-yaml 依赖在场。

## 1) 执行摘要（Tl;dr）

**推荐候选 (iii) 修＋双轨，但本地闸取「最小结构闸」形态、且首选路径是用 actionlint（若接受 npx/二进制前置）或手写 pattern 闸（零依赖）＋registry manual_watch 哨兵兜 GitHub 侧失效形态。** Confidence：**高**——本案缺陷恰为纯 YAML 解析层错误（`mapping values are not allowed here`），本地 parse-level 闸可确定性拦截；而 GitHub 侧存在本地不可见的失效形态（60 天不活跃自动停用、调度注册漂移），官方文档一手证实其静默性，故纯机检闸（ii）覆盖不完备，纯人工哨（i/iv）检测时延最差。四候选中 (iii) 是唯一同时拦「再犯同型」与「平台侧漂移」的。

## 2) 分点结论

**① GitHub 对无效 workflow 的处理语义是「静默退化」——官方一手证实**

- 官方 workflow syntax 文档：*“If you omit name, GitHub displays the workflow file path”*——即 workflow name 退化为文件路径本就是 name 缺失/解析失败时的回退形态（docs.github.com，Official）。题面观察到的 `name=.github/workflows/macro-b-regression.yml` 正是解析失败→回退路径名的签名，与社区案例一致：GitHub community discussion #203000（已修复案）实证 *“the trigger is being recognized, but GitHub stops before creating any jobs because the workflow is invalid YAML”*——触发器识别但零 job 生成、无检查显示。
- 第三方故障手册：*“GitHub silently ignores invalid YAML workflows”*（devopsboys.com，已全文核验），并列 actionlint 为 Cause 3 的标准处方。
- 交叉：两独立信源（GitHub 官方社区＋第三方教程）＋题面实证三方一致。**“静默”是平台语义而非偶发。**

**② schedule 触发器另有两条独立的静默死亡通道——本地闸结构性拦不住**

- 官方一手：*“scheduled workflows are automatically disabled when no repository activity has occurred in 60 days”*（docs.github.com，Disabling and enabling a workflow），且 fork 默认停用；修复靠 `gh workflow enable`。
- 社区多案（discussion #200282/#202034）：调度注册可因仓库闲置陈旧化（stale registration）失效，处方为空 commit 强制重注册——这是平台侧问题，YAML 完全合法也会发生。
- **裁决含义**：任何本地文件级闸（含 actionlint）对这两类失效零覆盖。这正是题面 (iii) 中 manual_watch 哨兵兜底的独立价值，不是冗余。

**③ liveness/absence 监控心智模型成熟且惯例化**

- dead man's switch 的软件形态＝heartbeat：*“unless your job actively checks in, you assume it failed... alert about absence, not about an error response”*（crontap.com，2026-09，已全文核验）；其中明确列举适用场景第 4 条即 *“CI or scheduled pipeline heartbeat... You want an alert when the workflow never started, not only when it failed mid-run”*——与本案形态（workflow 从未启动）精确同构。
- 早前入库的 odown 材料给出 switch 失效域外置戒律、窗口实测、触发演练。
- Google SRE Book（Monitoring Distributed Systems）：symptom-based 告警原则支撑「对缺席告警而非对错误响应告警」。

**④ 断言分档惯例**

- pre-commit hooks 目录同时收录 `rhysd/actionlint`（schema 档）与 `adrienverge/yamllint`（parse/风格档）——**分档是建制化惯例，text-level indexOf 不在任何一档**。本案缺陷（未引号标量含 `: `）是 YAML 1.2 语法定义层错误，parse 档即拦，无需 schema 档。
- 题面「本地 YAML 合法≠Actions schema 合法」判断正确，但反向更重要：**本案证明 text-only 连 parse 档都没有**——守卫断言的最低档缺口比 schema 缺口更根本。

**⑤ Node 生态本地校验选项排序（②号特别裁决）**

| 选项 | 代价 | 覆盖边界 |
|---|---|---|
| actionlint（Go 二进制/npx 或 pre-commit） | 需外部二进制前置（brew/scoop/npx 冷启动）；CI 面引入非 Node 依赖 | 最强：YAML＋Actions schema＋表达式类型＋cron 全档；业界事实标准（4.3k★，官方 checks 文档） |
| `yaml` npm 包（eemeli/yaml 或 js-yaml） | 一条依赖；但 grep 实证本仓 engine 无 yaml 依赖在场，引入即动 package 面（D-139 分 commit 纪律适用） | parse 档全覆盖（本案缺陷可拦）；schema 零覆盖 |
| 手写最小结构闸（零依赖） | 无依赖、落入现有 check 脚本形态 | 仅拦已知病态模式（如未引号 name 标量含 `': '`）；对新病态零保证 |

排序结论：**若本仓可接受外部二进制，actionlint 是碾压性最优**（一档顶三档）；若坚持零新依赖，`yaml` 包解析 > 手写 pattern（手写闸只能防「已见过的死法」，且 pattern 本身可被绕过——如标量用 `>` 折叠块写法）。中间路线：手写闸先落、actionlint 登记为 manual_watch 的 T3 工具而非 CI 硬依赖。

**⑥ 修复＋哨兵捆绑 vs 分离；「被信为活的机制实死」是否强制配哨（③号特别裁决）**

- 工业界无「修复必须捆绑哨兵」的强制惯例，但 absence-monitoring 文献（crontap/odown/deadmanssnitch 一类）将「定时机制必须有 heartbeat/absence 监控」视为 cron/管线类工作的默认卫生项，而非可选加强。dead man's switch 的存在理由恰是本案的失败画像：*“The dashboard looks fine because it still shows last week's numbers. Silence is the bug.”*
- 本仓自身惯例不对称判断成立：D-155 manual_watch 五要件建制已在册，finding→哨兵是既有路径；(iv) 只修不哨会留下「同型死亡无建制」缺口。
- 裁定：**本案属「机制型 finding」（D-173 能力面——被信为活的回归机制实为死基建），处置后应惯例性配哨**；但哨兵形态不必是 CI 硬闸（见⑦）。

**⑦ 哨兵归位分档判据（①号特别裁决）——「验证成本×失效频率×检测时延容忍」**

- **机检面（guard 断言）适用**：验证成本低（本地确定性、毫秒级）、失效频率与提交频率耦合（每次 push 都可能再犯）、时延容忍≈0（必须在合入前拦）。→ parse 档 YAML 闸归机检面。
- **人工节律（manual_watch/T3）适用**：验证成本高（需 gh 认证、需跨系统查询 GitHub API）、失效频率低且与提交解耦（60 天停用、平台注册漂移——数月一遇）、时延容忍以天计可接受（T3 窗粒度）。→ liveness 哨（`gh workflow list` name≠path 退化态＋`gh run list` 0s 败迹＋schedule 注册在活性）归 manual_watch。
- 该分档与 odown 戒律同构：switch 必须独立于被监控系统的失效域——CI 内自检拦不住 CI 自身的静默死亡，registry/T3 侧哨兵才是失效域外置。**此判据为推断级综合（由多信源模式归纳），无单一一手组织工程学文献背书。**

## 3) 对比矩阵（四候选）

| 候选 | 拦同型再犯（YAML parse） | 拦平台侧漂移（60天停用/注册漂移） | 依赖/成本 | 备注 |
|---|---|---|---|---|
| (i) 修＋manual_watch 哨 | ❌（T3 才发现，带病可合入） | ✅ | 零新依赖；哨依赖 gh 认证 | 本地真闸缺失 |
| (ii) 修＋guard parse 闸 | ✅（合入前拦） | ❌ | yaml 包引依赖 或 手写闸覆盖弱 | 平台侧失效裸奔 |
| (iii) 修＋双轨 | ✅ | ✅ | 零依赖手写闸（或 yaml 包）＋T3 哨 | 唯一双覆盖；成本=一个 check 增量＋一册项 |
| (iv) 只修不哨 | ❌ | ❌ | 最薄 | 与 D-155 建制及 absence-monitoring 惯例均不对称 |

## 4) 冲突扫描

- **D-046④**：候选全部保留 schedule 定时回归承载件语义，仅修语法——无冲突；且修复直接恢复 D-046④ 承载件的活性。
- **D-175**：(b) 已触发欠账清零第一优先——本调研不改变工作面序，修复/哨兵落盘应排在欠账清零之后入队（不插队）。
- **D-173**：finding 定级能力面成立；处置包与能力面「修基建＋建制防再发」口径一致。
- **D-147**：探测面修语义预声明验证包工序——若哨兵/闸被视为探测面增量，须走预声明验证包；建议处置书里显式声明。
- **D-155**：manual_watch 哨兵（候选 i/iii）须五要件齐备，含补偿控制（本报告⑦的分档判据可作判据引用）与到期复审钩（D-171 事件制双条件：在册 sentinel＋T3 盘查钩，wontfix 恒久类不适用本案——本案是活性监控非 wontfix）。
- **D-139/D-140②**：若选 yaml 包引依赖，动 engine package 面须独立 commit；手写闸零依赖则不触发。yml 修复属语义 commit（非 format/生成物）。
- **D-135**：票面纪律——本报告不代裁定，判据与分档供票面裁量。
- 未发现与任何 current 决策的硬冲突；(iii) 与 (i) 均走已建制先例，(ii) 的依赖引入是唯一触碰 package 面的路径。

## 5) 完整来源清单

| # | 标题 | URL | 角度 | 贡献 |
|---|---|---|---|---|
| 1 | actionlint docs/checks.md（官方） | github.com/rhysd/actionlint/blob/main/docs/checks.md | Official | schema-level 闸检查清单全录；actionlint 生态位一手定义 |
| 2 | Workflow syntax for GitHub Actions（官方） | docs.github.com/en/actions/reference/workflows-and-actions/workflow-syntax | Official | name 缺失→路径回退语义一手 |
| 3 | Disabling and enabling a workflow（官方） | docs.github.com/en/actions/how-tos/manage-workflow-runs/disable-and-enable-workflows | Official | 60 天不活跃自动停用条款一手 |
| 4~6 | GitHub community discussions #203000/#200282/#202034 等 | github.community / github.com/orgs/community/discussions | Community | 无效 YAML 零 job 实证；调度注册漂移与空 commit 重注册处方 |
| 7 | actionlint vs generic YAML linters（Tenki, 2026） | tenki.cloud/blog/lint-github-actions-workflows-actionlint | Comparative | DSL linter vs generic YAML 分档；v1.7.11 时效 |
| 8 | pre-commit hooks 目录 | pre-commit.com/hooks.html | Official | actionlint/yamllint 并列收录=分档建制化 |
| 9 | Dead man's switch for developers（Crontap, 2026-09） | crontap.com/blog/dead-man-switch-explained-for-developers | Official(工具)/Community | absence 监控心智模型；CI pipeline heartbeat 场景 |
| 10 | Dead man's switch monitoring（odown，会话早前已入库） | odown.com/blog/what-is-a-dead-mans-switch-in-monitoring | Community | switch 失效域外置戒律、窗口实测、触发演练 |
| 11 | Google SRE Book: Monitoring Distributed Systems | sre.google/sre-book/monitoring-distributed-systems | Official | symptom-based 告警原则 |
| 12 | yaml (eemeli) / js-yaml npm 页 | npmjs.com/package/yaml 等 | Official | Node 零原生依赖 parse 选项一手 |

## 6) 信息缺口（如实标位）

1. **manual_watch vs guard 分档判据**为多信源归纳的推断级综合，无一手文献直接给出「验证成本×失效频率×时延容忍」三元公式。
2. **actionlint 在本仓的实际接入重量未实测**（npx 冷启动时长、Windows 侧二进制分发、D-139 依赖 commit 纪律的具体形态）——建议处置书里列为验证包实测项。
3. GitHub 官方对 schedule 触发器在无效文件态下「不注册」的**逐字一手条款未取到**（404 一处；60 天停用条款已一手证实，「无效文件→不注册」依赖社区案例＋题面实证推断）。
4. 「被信为活的机制实死→强制配哨」在工业界是惯例而非规范（无 ISO/厂商强制条款）——置信度为惯例级。
