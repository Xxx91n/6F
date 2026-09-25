# R32-Q6 调研报告：四项过程违规（V1–V4）处置裁

atomcode 调研回毕。Sufficiency Gate：searches 9（Exa 2 + AnySearch 7；Tavily 配额超限缺席）| angles 五类全覆 | full reads 6（Black 官方档·SWE at Google ch22·PMC7924728 对照实验·nixpkgs #347586·ISO 9001 10.2·gitattributes+EditorConfig+Prettier 合流文）。置信度：高。

## 1) 执行摘要（Tl;dr）

**推荐 (b)：登记＋立轻规约**——V1–V4 如实入账本收口节（V1 载「不可回退」，定性与 D-138「不可证≠撤回、披露即收口」同构），另在 AGENTS.md 补一行显式负向规约「格式化-only／机械变更禁搭车语义提交，须独立 format commit 先行」；守卫化 (c) 不立即做，按本仓 trigger-gated 纪律登记一个 deferred 触发器，复发再升级。**与账本全部 current 决策零冲突、零 revised**——(b) 的轻规约形态恰是 D-133「禁各拆一票／禁不立票随手改」与 D-135「禁卫生组升格独立票」两条负向约束的交集解；(c) 立即做则与 D-135 冲突须标 revised（守卫票面开销超违规复发概率）。

## 2) 分点结论

**C1. 「format-only 与语义变更分离」是工业界高度收敛的成熟惯例，且对本仓有精确同构先例**（来源：NixOS/nixpkgs #347586 原文、Reddit r/Frontend Prettier 引入贴、Black 官方档、Linux kernel SubmittingPatches 引述、softwareengineering.stackexchange）。收敛要点有四：① 格式化必须独立 commit/PR（nixpkgs「nixfmt 应与任何实质变更分开提交，确保 breaking change 不与 formatting 复合」；Reddit「first PR with prettier, then PR with your code change — it is important not to mix both for reviews」）；② Linux kernel 官方「Separate each logical change into a separate patch」为源头纪律；③ 大规模 reformat 单独一票后登记 `.git-blame-ignore-revs`（Black 官方档原文核验：reformat 一切、单一大 commit、40 字符 SHA 入 ignore-revs 文件，GitHub/GitLab 原生支持）；④ 例外已存在——nixpkgs 自身承认「小范围 NO-OP 格式化可搭车（本 PR 内文件的顺手格式化）」，说明该规约的正确形态是**负向行而非绝对禁令**：禁的是「全文件重缩进级噪声搭车」，不禁被触碰文件内的顺手整理。→ 支撑 V1 定性：33-gate-registry 1459 行全重缩进 + 语义 +1 搭车，正落在工业共识的禁区内；V4 丢尾行同族（见 C3）。

**C2. 搭车提交的代价有实证级证据，不只审美**（来源：PMC7924728 原文核验——di Biase et al. PeerJ CS 2019 对照实验 n=28；Microsoft Research Bosu 2015 摘要；Baum et al. 2019 转引）。对照实验结论：变更分解显著减少错误报 issue（false positives）、提升评审者 context-seeking；论文结论文本原话「**commits belonging to different concepts should be separated, adopting this as a best practice**」。Baum/Schneider/Bacchelli 2019：小变更评审效力显著更高。对本仓意味着：V1 的 1459 行全变 diff 直接把审计窗的「逐行可审」变成「语义深比对才能自证清白」——本次四违规的审计成本本身就是证据。→ 支持立规约 (b) 而非仅登记 (a)：同一失败模式有复发土壤（Agent 落栈场景天然易产生全文件重缩进），无规约则下轮审计大概率重演。

**C3. 尾行/格式卫生的成熟解在守卫面而非纪律面，但本仓不必立即守卫化**（来源：joepkockelkorn.com 原文核验、editorconfig.org、本仓知识库 ctx 召回的 pre-commit-hooks 先例）。工业惯例是三层兜底：`.gitattributes`（EOL 归一）→ `.editorconfig`（`insert_final_newline=true` + `trim_trailing_whitespace`）→ pre-commit hook（`end-of-file-fixer`）→ CI 最终闸（hook 可被 `--no-verify` 绕过）。**与本仓的差异**：本仓违规源是 Agent 落栈写文件丢尾行（V1/V4 同族），不是人手编辑器差异——AGENTS.md 已有「写后回读断言、禁 BOM」约定，丢尾行是该约定的自然扩展点（把「禁 BOM」扩为「禁 BOM＋保尾行」属既有约定面锐化，不立新规）。→ 支持 (b) 里把 V4 的更正挂 AGENTS.md 既有行扩展，另立 (c) 守卫票。

**C4. 「审计呈报违规→更正→收口」在合规语境有标准三段式，本仓 V1–V4 的处置已天然符合**（来源：ISO 9001 clause 10.2 原文核验、ISO 14001 NC/CA 页摘要）。ISO 9001 10.2 的成熟流程 = nonconformity 记录 → **correction**（消除已发现的不符合，即时更正）→ corrective action（对根因防复发，按风险分级决定做不做）→ 留档。关键判据：**correction 是义务，corrective action 按风险裁**——「决策 to apply or not apply corrective action should be made…based on the level of risk」。映射到本案：V2/V3/V4 已更正 = correction 完成；V1 不可回退 = correction 不可行、剩披露义务（深比对清白证据入账本即是）；根因（Agent 落栈格式化搭车）是否需要 corrective action（立规约）= 风险裁断，而 C1+C2 的工业惯例与复发概率支持「裁要做」。ISO 另强调分析「不找责任人、找组织性弱点」——与「语义差集已证清白、只定性过程违规」的口径一致。→ 支持 (b)（登记即 ISO 的 correction+留档；轻规约即 low-cost corrective action）；否决 (d)（只登记不追认=correction 留档不完整，违反诚实披露与 ISO 留档义务）。

**C5. 大规模机械变更的工业形态是「独立先行票＋自动化工具＋blame 修复」，非「搭车」也非「绝对禁止」**（来源：abseil.io SWE at Google ch22 原文核验、Sourcegraph large-scale-code-changes、Black 官方档）。Google LSC 章：「LSC 大多近零功能影响—— widespread textual updates」，靠自动化工具生成、独立审、可整体回滚。Black 引入指南把「一次性全仓 reformat 单 commit + ignore-revs 登记」作为**推荐路径**而非禁忌——即工业界不反对格式化大 diff 本身，反对的是**与语义混装**。→ 对候选的裁决意义：(c) 的「JSON 语义等价但字节大差检测」在工业界的对应物是 ignore-revs 登记 + formatter idempotency 检查，而非通用 diff 噪声断言；本仓单 Agent 落栈场景规模小，轻规约成本-收益优于守卫。

## 3) 候选对比矩阵

| 项 | 语义差集清白 | 过程层复发防护 | 成本/票面开销 | 与账本相容性 | 备注 |
|---|---|---|---|---|---|
| (a) 登记追认即止 | ✓ 入账本 | ✗ 无 | 最低 | 全相容 | ISO 语境只做了 correction，缺防复发件 |
| **(b) 登记＋轻规约（推荐）** | ✓ | ✓ 一行负向规约＋AGENTS.md 尾行扩展 | 一行文字，不立票 | 全相容；正合 D-133/D-135 负向约束形态 | V1 载不可回退＋（可选）.git-blame-ignore-revs 登记 |
| (c) 立即守卫化 | ✓ | 最强 | 新守卫脚本＋票面＋维护 | **与 D-135「禁卫生组升格独立票」张力**——立即做须标 revised | 降级形态：deferred 触发器（复发即升级），同 D-138 先例 |
| (d) 只登记不追认 | 部分 | ✗ | 低 | 与 ADR-0018 诚实编年纪律相悖 | 拒——correction 已完成却不留档，自相矛盾 |

## 4) 推荐落点（(b) 的三件套）

1. **账本收口节**：V1–V4 四行如实入 R32 收口——V1 载「栈已 land 上游不可回退（改写历史禁区，合 ADR-0018 单调纪律）＋深比对证 events 纯增无删改/items 54=54/meta 同」；V2/V3/V4 载更正完成。定性全按「过程违规、语义清白」二分，对齐 ISO correction/corrective action 分层。
2. **AGENTS.md 负向行**：「格式化-only／机械重缩进变更禁搭车语义提交——须独立 format commit 先行（大范围 reformat 登记进 .git-blame-ignore-revs）；文件写入回读断言扩为『禁 BOM＋保尾行』」。一行规约、不立票、不设守卫，恰好落在本仓既有「负向行」文法（D-133⑤/D-135 同款）。
3. **deferred 触发器（可选，照 D-138 `81-first-non-z-dialect-host` 先例）**：`89-format-piggyback-recurrence`——trigger=再发生一次格式化搭车语义提交 → 升级为 (c) 守卫（diff 语义等价但字节大差检测，WARN 级，对齐 D-068「对内 WARN」分层）。把 (c) 从「现在做」改为「条件触发」，既守 D-135 票面纪律又留升级路径。

## 5) 与账本冲突点核对（显式声明）

- **零 revised**：逐条核过 D-018（版本编年——V1 不可回退处置与其单调纪律一致，且「不回退发旧线补丁」精神支持向前更正而非回滚）、D-130/D-131/D-133（票面粒度与仓务批——(b) 不立新票，负向行非票面件）、D-135（修批票——V2/V3/V4 已更正，无需进 #83；若尚有未落地面则按 D-135 卫生组末节归入，禁升格）、D-138（登记＋条件触发器先例——推荐第 3 件即其同构复制）。
- **唯一张力已显式化**：(c) 若**立即**执行，与 D-135 负向约束「禁卫生组升格独立票」冲突——按规约该 D-135 须标 revised 并呈报；本推荐以 deferred 触发器规避冲突，不做静默改向。
- CONTEXT.md 无冲突词条；「Instrument Dialect」词条（工具产生的等价拼写差异归边界层吸收、不进锁面对比）在本案的反向印证：33-gate-registry 的重缩进**不是**仪器方言（是落栈侧卫生事故），不得误引该词条豁免。

## 6) 完整来源清单

| # | 标题 | URL | 角度 | 贡献 |
|---|---|---|---|---|
| 1 | Black 官方档 · Introducing Black（26.5.1） | https://black.readthedocs.io/en/stable/guides/introducing_black_to_your_project.html | Official | reformat 单独大 commit + .git-blame-ignore-revs 官方流程（原文核验） |
| 2 | SWE at Google ch22 Large-Scale Changes | https://abseil.io/resources/swe-book/html/ch22.html | Official | LSC=机械变更独立票、近零功能影响、工具生成（原文核验） |
| 3 | di Biase et al. 2019 PeerJ CS（PMC7924728） | https://pmc.ncbi.nlm.nih.gov/articles/PMC7924728/ | Official/实证 | 变更分解减少误报，「不同概念的 commit 应分离」结论文本（原文核验） |
| 4 | NixOS/nixpkgs #347586 commit separation 指南讨论 | https://github.com/NixOS/nixpkgs/issues/347586 | Comparative | nixfmt 分票纪律 + NO-OP 例外 + revert/bisect 理由（原文核验） |
| 5 | ISO 9001 10.2 Nonconformity & Corrective Action | https://www.iso9001help.co.uk/10.2-Nonconformity-and-Corrective-Action.html | Official | correction vs corrective action 二分、按风险裁、留档义务（原文核验） |
| 6 | Combining gitattributes, EditorConfig and Prettier | https://joepkockelkorn.com/blog/combining-gitattributes-editorconfig-and-prettier | Community/实践 | insert_final_newline + CI 终闸三层兜底（原文核验） |
| 7 | jeffreyfreeman.me Writing High Quality Commits | https://jeffreyfreeman.me/blog/writing-high-quality-well-scoped-commits/ | Community | Linux kernel「每逻辑变更一 patch」源头引述 + git add -p 救济 |
| 8 | softwareengineering.stackexchange 引入 formatter | https://softwareengineering.stackexchange.com/questions/430757 | Community | 「formatting must not be mixed, ever」+ 先行 PR 惯例 |
| 9 | Reddit r/Frontend Prettier 引入 | https://www.reddit.com/r/Frontend/comments/1709a99/ | Community | 两 PR 先行惯例 + 不混评审理由 |
| 10 | Microsoft Research Bosu 2015 Useful Code Reviews | https://www.microsoft.com/en-us/research/publication/characteristics-of-useful-code-reviews-an-empirical-study-at-microsoft/ | Official | 评审有效性因素（摘要级，未全文） |
| 11 | Sourcegraph large-scale code changes | https://sourcegraph.com/blog/large-scale-code-changes | Currency(2026) | LSC 工业流程现状佐证（摘要级） |
| 12 | editorconfig.org | https://editorconfig.org/ | Official | 尾行/EOL 属性权威定义 |
| 13 | ISO 14001 NC/CA 摘要页 | https://www.ecesis.net/ISO-14001/Nonconformity.aspx | Official | 不合/纠正/纠正措施三段式佐证 |

## 7) 信息缺口

- PCAOB/IIA 侧「ratification」专门术语一手文献未取到（以 ISO 9001 10.2 correction/corrective action 二分替代，足用）；
- diff 噪声评审实证缺 2026 年最新文献（PMC 2019 对照实验 + Microsoft Bosu 2015 双源已够判据级）；
- Tavily 配额超限缺席本轮（Exa+AnySearch 双引擎承担交叉验证，关键结论均双源以上）。
