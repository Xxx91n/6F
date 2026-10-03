我将使用 atomcode-research 技能执行本调研。我先读本地账本/ADR/CONTEXT 的相关词条，再发起 atomcode 深调研。ctx_batch_execute 返回未知状态，我改用本地只读工具直接核账本与 ADR。bash 被只读模式拦截，改用只读工具。先补齐 D-034 与 ADR/CONTEXT 词条，然后发起 atomcode 深调研。读 ADR-0014/0013/0015 关键条款，随后发起 atomcode 深调研。ctx_batch_execute 两次都返回未确认状态，atomcode 进程可能仍在后台跑。先轮询检索确认是否已落库。知识库召回了此前 R56 相关调研（B2 受 D-034③ 约束的裁定脉络）。现在确认本轮新发起的 atomcode 调研是否已产出结果。我需要确认刚才发起的 atomcode 调研进程状态（两次 ctx_batch_execute 均返回未确认，可能仍在后台运行）。atomcode 进程（PID 32236）仍在跑，本轮调研在途。等待并轮询检索结果。继续轮询：探测进程状态并检索结果是否落库。进程已退出，检索本轮调研落库结果。进程已退出但尚未检索到 R56-Q5 报告本体，再定向检索本轮关键词。ctx_search 未见本轮 R56-Q5 报告落库（只召回历史 R56-Q2），进程已退出且无产出——按续跑锚定规则用 `-c` 续跑。atomcode 续跑已发起（返回未确认，进程应在后台）。开始轮询等待。进程已退出，检索续跑结果是否落库。续跑仍未检索到报告。换更宽的关键词检索本轮产出（可能索引标签不同）。R5-Q5 先例显示终稿常需多次 `-c` 续跑恢复。再次续跑并在等待后探测。atomcode 三次运行均未落库产出（进程退出但检索无果，续跑锚定已尝试两次）。按题面「研究专精模式」协议降级为直接三引擎调研——现在开始第一阶段广泛搜索（五角度）。继续第一阶段补搜（时效+批评角度：deps.dev/OSV 限流、scorecard API 现状、周扫缺口）。第一阶段搜索完成（三引擎、五角度覆盖）。进入第二阶段定点深挖——打开关键原文核验。继续第二阶段定点深挖：抓取 scorecard 官方 README（raw）、scorecard.dev 官网、Reddit 社区评价与 arXiv 实证论文。第二阶段继续：补齐 OSV API 限流官方档、arXiv 实证论文、社区批评原文。补一轮批评/时效角度（scorecard API 已知问题与 2025-2026 现状），然后综合输出。**Sufficiency Gate 自查**：searches: 8（Exa×3 / Tavily×2 / AnySearch×3；角度=Official×3、Comparative×2、Criticism×2、Currency×1、Community×1）| full reads: 8（scorecard README raw、scorecard.dev、deps.dev API v3、OSV API 官方档、scorecard-action README、issues #2124/#4627 原文、arXiv 2508.03856、Reddit/trifecta 提取）| 域名： github.com、scorecard.dev、api.securityscorecards.dev、docs.deps.dev、google.github.io、arxiv.org、openssf.org、endorlabs.com、reddit.com、blog.thestateofme.com（≥10）| **缺口**见文末。
**过程注记**：atomcode 深调研按技能规程三次派发（含两次 `-c` 续跑锚定）均未落库产出，已按降级路径以白名单内三引擎直研完成，配额达成。

---

# R56-Q5 调研报告 —— supply-chain 象限解排：时点与源选择

## 1) 执行摘要（Tl;dr）

**推荐 (iii) 续排 + 预声明源判据**：本轮不解排（D-034③ 队列纪律自指成立、无新拉动面证据，R56-Q2 调研已裁「解排需要新的拉动面证据，当前无新证据面」），但**预声明触发后的源选择判据 = API-first 主线（scorecard.dev REST）+ Go binary 双轨逃生舱（ADR-0014 形态天然合规）**。**置信度：中高**——高置信部分：接入面成熟度对比（官方档+学术+issue 实证三源同向）、(iv) 否决（CONTEXT 词条硬约束）；中置信部分：时点判据本身（「需求拉动 vs 覆盖驱动」无单一权威文献，为多先例拼装，属本仓主权裁量）。

## 2) 分点结论

**结论 1：scorecard.dev REST API 是成熟但「预计算快照」面，不是实时查询面**【Official：README raw + scorecard-action + api.securityscorecards.dev swagger】
- 数据=周扫预计算结果，CDN（Fastly）缓存；**周扫因成本永久省略 `CI-Tests`/`Contributors`/`Dependency-Update-Tool` 三个 check**（官方 README 明文；arXiv 2208.03412 独立佐证：三 check 因 GitHub 限流成为周扫瓶颈被移除）→ API 读数 ≈ 20 check 中的 15-17 面。
- **覆盖门槛双轨**：仓库须满足其一——①自己跑 Action 且 `publish_results: true`（OIDC 验证后发布）；②落入周扫的 ~120 万关键仓集（arXiv 2208.03412 实证：当时 npm 仅 760k/947k、PyPI 仅 10k/211k 有分——**非头部仓 API 查不到是结构性常态**）。
- API 本身无 auth（CDN 直读），数据许可 CDLA Permissive 2.0；**无官方 SLA**，陈旧数据只能开 issue。
- 被测仓若是私有仓或低星仓，API-first 直接 miss——这对审计工具是致命覆盖缺口：**审计对象仓 ≠ 头部 OSS 仓**。

**结论 2：Go binary 子进程 = 唯一全 check、全仓可测面，代价是体积+token+已知质量瑕疵**【Official + Criticism】
- CLI 可测任意仓（含私有/低星），全 20 check（周扫省的 3 个可跑），需 `GITHUB_AUTH_TOKEN`（PAT public_repo 或 GitHub App 提额）——与 github-rest 适配器既有 auth 面同构。
- 已知瑕疵（实证）：**#2124——限流/internal error 时 exit code 仍为 0**（脚本/管线不能信任退出码，须解析 JSON reason 字段=适配层 golden 断言必须覆盖的坑）；#4627——`scorecard serve` 模式三年无人用、details 字段为 null 的老 bug（2025-05 由 #4665 修复）——佐证**官方至今没有可自部署的实时 HTTP 服务面**，社区用户（issue #4627 楼中）自述需求「批量自动化评分」只能自建 binary 服务。
- 体积/供应链代价：Go 单二进制 + 容器镜像（ghcr.io/ossf/scorecard）双形态，无运行时依赖树；ADR-0014 判据下属「CLI 形态上游走适配器」主线，非 vendor。

**结论 3：GitHub Action 制品消费 = 仅适用自有仓，对审计第三方仓不适用**【Official：scorecard-action README】
- Action 要求「own the repository or have admin rights」（scorecard.dev 官网明文）——**本产品审计的是外部仓，此面结构性不可用**；其价值仅在 `publish_results: true` 给 API 喂数据这一环。

**结论 4：deps.dev / OSV 是低门槛补充源，deps.dev 内嵌 scorecard 分数是隐藏捷径**【Official：deps.dev API v3 + OSV API 官方档】
- OSV API：官方明文「Currently there are no limits on the API」，HTTP/1.1 响应 32MiB 上限，批量 endpoint 推荐——manifest 级漏洞事实接入成本极低。
- deps.dev API：免费无 auth（未文档化限流），聚合 npm/PyPI/Maven/Cargo/Go/NuGet/RubyGems 全量数据，**且聚合数据里就含 OpenSSF Scorecard 分数**（官方档 Associated data 一节）——即候选 (ii) 的轻源路径可以零适配器新增外部依赖拿到部分 scorecard 读数（仅限 deps.dev 覆盖的包生态仓，非任意 git 仓）。
- 但 OSV/deps.dev 均**只答「包版本→漏洞」事实，不答「仓库姿态」**：空响应≠安全（官方明文 advisory lag 结构性存在）。

**结论 5：MVP check 集共识 = 高风险面优先，学术实证给出低垂果清单**【Official scorecard.dev checks 表 + arXiv 2508.03856】
- 官方 20 check 按风险分级：Critical 1（Dangerous-Workflow）、High 7（Binary-Artifacts/Branch-Protection/Code-Review/Token-Permissions/Signed-Releases/Vulnerabilities/Dependency-Update-Tool）、Medium 6、Low 6。
- 学术实证（3,248 仓，GI SKILL 2025）：**平均分仅 3.5/10，Signed-Releases 与 Branch-Protection 是最低实施率面**——若按「区分度×高风险」选 MVP 面，共识最小集为：Dangerous-Workflow、Token-Permissions、Pinned-Dependencies、Binary-Artifacts、Branch-Protection、Code-Review、Signed-Releases（7 面，全部在 API 周扫覆盖内）。
- SLSA/SBOM 生态定位（社区综合）：SBOM=「里面有什么」、SLSA=「构建可证」、Scorecard=「厨房卫生评级」（trifecta 三件套分工）——Scorecard 是三者中**唯一无需被审方配合即可消费的**（读周扫数据或自跑 binary），这支持其作为 supply-chain 象限主源。

**结论 6：时点判据——「需求拉动」是本仓已立法纪律，业界无反向权威先例**【账本内证 + D-034③ 语义核查】
- **D-034③ 原文核查**：「Scorecard/repomix 探针按层需求队列接入不插队」——其触发语义是**「层需求队列」拉动**，负向行明写「禁止 Scorecard 插队只为补齐 preview 供应链象限」。supply-chain 象限自身是「层需求位」，但 D-034③ 的「层需求」指**消费侧需求**（下游 scale/用户场景对读数的真实消费），不是象限空位的自指需求——排队自指**不成立**：象限空位只是队列的存在理由，解排仍需消费证据。
- CONTEXT「Trigger-gated Closure」词条（243 行）：不前置、不无限拖，登记显式触发事件——与 R56-Q2 已裁「解排需要新的拉动面证据（scorecard 行的真实消费需求），当前无新证据面」完全同向。
- 现状披露面（not_applicable + `data-not-connected` conflict marker）是诚实披露正常运作，无伪报风险——续排不产生名实债务。
- B6（GA 判据面）预定统一议 supply-chain 归位——续排至 B6 前置触发即可，与枝序 B3→B1→B2→B4→B6 中 B2 天然后位一致。

## 3) 对比矩阵

| 项 | 候选 (i) 本轮立票 API-first | 候选 (ii) 降源轻接 | 候选 (iii) 续排+预声明源判据 | 候选 (iv) 语义重定义 |
|---|---|---|---|---|
| 账本合规 | ❌ 与 D-034③「不插队」+D-054「supply-chain 维持排队不动」硬冲突（**显式点名 D-034③/D-054**） | ⚠ 无明文冲突但 D-054② 能力矩阵措辞须再改（queued→partial） | ✅ D-034③/D-054/CONTEXT Trigger-gated 全对齐 | ❌ 违 CONTEXT Macro-B 词条（数据源=CodeLore+Scorecard）+须重立词条 |
| 读数质量 | 周扫快照，缺 3 check；非头部仓 miss | 漏洞事实≠姿态度量，语义变窄须披露 partial | — | 依赖形态降级，GMQ 层次弱化 |
| 工程成本 | 高（绿地适配器+descriptor+collector+golden+quarantine 全套） | 中（deps.dev 已含部分 scorecard 分，可省 scorecard 适配器但仍需新适配器） | 零（本轮） | 低（但重立法成本） |
| 单点依赖风险 | API 无 SLA+CDN 缓存；binary 双轨可兜 | deps.dev 无文档化限流、非合同承诺 | 无 | 无 |
| 需求拉动证据 | 无 | 无 | 承认无，挂触发器 | 无 |

## 4) 推荐＋理由＋置信度

**推荐：(iii) 续排，同票预声明源选择判据**（解排触发时按 ADR-0013 预声明流程执行）：

1. **时点=续排**：D-034③ 是 current 硬约束且其负向行精确预判了本候选 (i) 的形态（「禁止插队只为补齐 preview 象限」）；无新消费证据下解排即插队。挂触发器建议：**B6 议程前置 OR Macro-B 报告出现用户/下游对 supply-chain 行的真实查询消费**（Trigger-gated Closure 双事件形态）。
2. **源判据=预声明 API-first 主线 + binary 双轨逃生舱**：符合 ADR-0014 双轨制原文形态（外部服务/CLI 适配+golden 契约，vendor 仅气隙/废弃两情形）。API-first 的已知缺口**预声明即可管理**：缺 3 check（披露面写明）+ 非头部仓 miss（**这是对审计产品的决定性缺口**——被审仓查无分时自动降级 binary 面，双轨不是冗余是必需）。binary 已知坑 #2124（exit 0 吞错）须写入 golden 断言。
3. **(ii) 降源否决**：deps.dev 内嵌 scorecard 分虽是捷径，但它只覆盖包生态关联仓，语义与「仓库供应链姿态」错位，且 partial 披露面 + D-054② 措辞再改的成本不比直接 Scorecard 低；OSV/manifest 级漏洞事实**可作为未接入阶段的知识储备登记**，但不应作为象限语义的替代品。
4. **(iv) 否决**：CONTEXT Macro-B 词条钉死数据源=CodeLore+OpenSSF Scorecard，重定义=重立法+四象限骨架削弱（GQM 层次），且 D-054③「facts 共享、quadrant 归属=切片决策」已封死「用现有 facts 改挂象限」的路——git churn/lockfile facts 若要消费，应走既有归属规则而非改象限语义。

**置信度：中高**。高置信：接入面事实（官方档三源交叉）、(i)(iv) 否决（账本/CONTEXT 硬约束）。中置信：时点判据与触发器设计——「需求拉动 vs 覆盖驱动」无业界单一权威文献（详见缺口 ②），最终属本仓主权裁量，建议按 ADR-0013 预声明后用户定稿。

## 5) 完整来源清单

| 标题 | URL | 角度 | 日期 | 贡献 |
|---|---|---|---|---|
| OpenSSF Scorecard README（raw 全文） | github.com/ossf/scorecard/blob/main/README.md | Official | 当前 | REST API 周扫缺 3 check、CDN 缓存、publish_results 门槛、binary auth 面 |
| Scorecard 官网 | scorecard.dev | Official | 当前 | 20 check 全表+风险分级、Action 需 admin 权限 |
| Scorecard API swagger | api.securityscorecards.dev | Official | 当前 | API 面实际只有 GET result/badge + POST publish 三端点 |
| scorecard-action README | github.com/ossf/scorecard-action | Official | 当前 | OIDC 发布机制、API 数据完整性规则 |
| deps.dev API v3 官方档（全文） | docs.deps.dev/api/v3/ | Official | 当前 | 覆盖例外、聚合源含 Scorecard、免费无 auth |
| OSV API 官方档 | google.github.io/osv.dev/api/ | Official | 当前 | 「currently no limits」、32MiB、batch endpoint |
| Issue #2124（exit code 0 吞错） | github.com/ossf/scorecard/issues/2124 | Criticism | — | binary/管线不可信退出码，golden 断言必须覆盖 |
| Issue #4627（serve 模式烂尾→#4665 修复） | github.com/ossf/scorecard/issues/4627 | Criticism/Community | 2025-05 | 无官方自部署实时服务；批量评分需求真实存在 |
| arXiv 2508.03856 | arxiv.org/abs/2508.03856 | Official/学术 | 2025-08 | 3248 仓均分 3.5/10、signed-releases/branch-protection 低实施率 |
| arXiv 2208.03412 | arxiv.org/pdf/2208.03412 | Official/学术 | 2022 | 周扫缺 3 check 的根因（GitHub 限流）+早期覆盖缺口数据 |
| Endor Labs API 发布文 | endorlabs.com/learn/introducing-the-openssf-scorecard-api | Community | 2022-09 | API 定位=依赖策略自动化 |
| Trifecta 博文 | blog.thestateofme.com/2024/07/22/... | Community | 2024-07 | SBOM/SLSA/Scorecard 三件套分工心智模型 |
| Reddit r/opensource 讨论 | reddit.com/r/opensource/comments/1v32l75 | Community | 2025 | 采用度平淡信号（badge 未见广泛展示） |
| 本地账本/ADR | D-034③/D-054/D-203-205、ADR-0013/0014/0015、CONTEXT:51/58/243 | 本仓内证 | current | 队列语义、触发器纪律、双轨制形态、preview 法理 |

## 6) 信息缺口

1. **scorecard.dev API 的硬限流数字**：官方未文档化 API 侧配额（仅 GitHub token 限流影响 binary 面）；CDN 层有无隐性限流未实证——接入时须实测。
2. **「需求拉动 vs 覆盖驱动」象限补齐次序**：未找到直接一手文献；本报告由 D-034③ 立法意图 + Trigger-gated Closure 先例 + R56-Q2 裁定拼装，属中置信。
3. **deps.dev scorecard 分数的刷新时点与覆盖匹配度**（对非包仓的 miss 率）未实测。
4. **binary 在 Windows 侧的分发形态与体积实测**（ghcr 镜像 vs 独立 exe 对本仓分发面 ADR-0016 的影响）未展开。
5. **OSV「无限制」政策的稳定性**：官方措辞为「currently」，无 SLA；高批量接入前的压力测试缺口。
