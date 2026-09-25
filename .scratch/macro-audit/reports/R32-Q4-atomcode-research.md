# R32-Q4 调研报告：rename 缝合缺席的处置裁定

atomcode 调研回毕（resume 句柄 aa9d844d-d970-467b-b9ce-8ea9100a23be）。来源 12 项：git-log 官方文档、Vajna --follow 补丁、SonarSource file-renaming 官方示例、SonarQube 社区 #111221、libgit2 #2916、git renameLimit PR #1044、CodeScene 配置文档 7.4.6、event-driven.io 投影指南、MS Sentinel 双轨归一、visual-paradigm 垂直切片、mattpocock to-tickets、SO --follow 佐证。置信度：高。Tavily 额度耗尽由 AnySearch 补位。

## 1) 执行摘要（Tl;dr）

**推荐 (a)——归口 #80 步③票面显式扩枚举，缝合实现与 renamed_to 1-switch 验证同票**。置信度：**高**。理由三条主线：① D-125 立法原文已把缝合定为投影层职责、ADR-0023 已入档，缝合不是新决策而是**已立法未认领的执行缺口**（F10 孤儿），按票据纪律其归宿是认领而非另立新法；② D-136 刚裁定失败态投影抑制，使 insufficient_history 判定的正确性**结构性依赖缝合**——选 (c) defer 意味着步③双仓试点带着已知错误的失败态分类跑，正面违反 D-135③「先跑后修=试点带缺陷跑」的既有负向禁令；③ 工业惯例（垂直切片、测试随行为、SonarQube 在投影层做 rename 连续性）一致支持缝合与边界件同票。零账本冲突——**无任何 current 决策需标 revised**。

## 2) 分点结论

**结论 1：git 生态的一手证据支持「血缘检测是启发式、缝合必须在消费侧做」的架构。**
- git 官方文档明确 `--follow` "works only for a single file"，`log.follow` 配置项历史上长期标注 "does not work well on non-linear history"（git-log 文档，2026-06 仍有效的限制段）。多跳链式改名（A→B→C）在 `--follow` 下需逐跳手动重入（Sourcetree 社区做法：「多次 rename 需跳到 rename commit 重复操作」）。
- 2025 年 git 社区补丁（Miklos Vajna，public-inbox）证实 `--follow` 在非线性历史上语义不良的根因是路径状态单变量（"last write wins"），修复需引入 per-commit path map——即**链式/分支改名需要显式的图遍历，不是单路径 follow 能覆盖的**。这直接支撑票面里「多跳链/环检测」必须作为显式验证子项，不能假设检测器免费给出。
- libgit2 issue #2916（官方回复）：55% 相似度区间「exceptionally unreliable」，默认阈值 60%；"Git does not store rename information in commits... clients rederive rename information"——**git 本体不存改名事实、消费时重推导**。D-125 的 file_renamed 一等事实+detector_version 入载荷正是对此的改进（把重推导结果固化为可复算事实），与 git 语义兼容而非冲突。

**结论 2：SonarQube 的失败先例恰好就是「缝合缺席→失败态误判」——D-136 牵连被工业案例实锤。**
- SonarSource 官方训练示例（sonar-training-examples/file-renaming）：SonarQube 6.7+ 在 rename+微改后 "0 new issues, existing issues kept their history"——即 **SonarQube 在分析/投影层做 rename 连续性缝合，使旧名事实计入新名卡**，这正是 D-125③ 缝合职责=投影层的先例（D-125 调研已引，本轮原文复核确认）。
- 反面：SonarQube 社区 thread（2024-03，#111221）及关联 thread（#188100、#24575、#8189）记录了分支分析把 renamed file 识别为 new file → coverage 被稀释 → quality gate 误报的**持续多年已知缺陷**。这就是「缝合缺席→新名卡历史表观过浅→误入失败/新码口径」的工业实证，与 D-136 牵连分析逐字同构。**含义：缝合不是锦上添花的查询便利，是失败态分类正确性的前置件**——这直接否定 (c)。

**结论 3：identity resolution 的工程惯例支持「事实层身份恒定、读模型沿链缝合」，且缝合逻辑放投影层（查询/投影时）而非摄入时是本案正解。**
- event-driven.io 投影指南（Oskar Dudycz）：事件=事实、投影=对事实集的解释；read model 可重建、投影逻辑确定性可重放。本案血缘链缝合=典型投影逻辑：facts（file_renamed 链）append-only 不动，卡面投影沿链回溯并入旧名 era 事实——与 D-125③、D-136①（收口位置=投影层）完全同构。
- Microsoft Sentinel 官方采用 query-time + ingest-time **双轨混合**：查询时归一保留原始形态、摄入时归一换性能。本案对应：rename 检测在采集时做（摄入侧，D-125② 一等事实），缝合在投影侧做（查询时沿链解析）——检测与缝合分居两侧恰是双轨惯例的标准形态，无需改立法。
- 环检测/多跳解析：图类 identity resolution（客户 360 领域 "keys, graphs, and stitching" 惯例）普遍做法是沿边遍历+环截断+显式披露解析依据——票面子项「多跳链/环检测/观测集内解析」与业界做法一致。

**结论 4：票据粒度判据支持 (a) 同票，(b) 的担忧用批内子项结构吸收。**
- 垂直切片惯例（INVEST、tracer bullet、Linear 票据纪律）：1 issue = 1 可演示/可验证的完整行为切片，**测试随实现同票**；水平切片（单层逻辑无消费面）是反模式。缝合与 renamed_to 跳转是同一条血缘链的两个消费方向——步③已含 renamed_to 1-switch 成对边界件，缝合是同一边界件族的反向腿，拆出去=把一个行为的两半切成两张票，bisect 粒度反而变差（血缘边界件回归时两票都可能背锅）。
- D-133/D-135 分票先例的判据是**性质不重合**（缺陷修 vs 实跑验证；卫生组 vs 契约符合性）。缝合与步③边界件性质重合（同为血缘行为验证），不满足拆票判据。
- (b) 唯一站得住的点=缝合实现复杂度可能超预算（多跳/环/跨观测集解析是实打实的图逻辑）。处置：把这三项写成步③票面的**批内子项清单**（D-135① 同款结构，任一子项可独立验收），若实施中发现体量确实超步③承载，届时凭实测再裁分票——这是登记过的 deferred 决策路径，不是现在预拆。

**结论 5：冲突核查——零 revised。**
- D-125：缝合本就是其③款立法内容，(a) 是认领非改向。✔
- D-126：miss 四类+renamed_to 条件跳转语义不变，缝合是跳转的对称面，不触碰跳转纪律（逐请求重验证保留）。✔
- D-123/D-136：三层卡契约与失败态投影抑制均以缝合存在为隐含前提，(a) 补齐前提。✔
- D-133/D-135：同票判据已核（结论 4）。✔
- 唯一登记义务：#80 步②票面枚举未认领缝合这一事实需在账本落一行显式注记（F10 孤儿归口记录，D-135 式票面化登记），**不是 revised**——无决策文本被推翻，只是执行缺口补认领。

## 3) 处置对比矩阵

| 项 | 立法一致性 | 对 D-136 牵连的处置 | 票据粒度 | 备注 |
|---|---|---|---|---|
| (a) 步③票面扩枚举 | 高——认领 D-125 既有立法，零改向 | 缝合随步③落地，试点前失败态分类正确 | 垂直切片，测试随行为，bisect 粒度最佳 | 多跳/环/跨观测集写成批内子项；体量超载时凭实测再裁分票 |
| (b) 独立票 #84 | 中——需解释为何立法在案的执行缺口另开新票 | 排序在步③前可保试点正确，但多一道排队 | 水平切片风险——缝合脱离 renamed_to 成对边界件单飞，两票共享回归面 | 仅当 (a) 实施中实测超载时升级为 (b) |
| (c) preview 外 defer | 低——与 D-125③ 立法冲突（立法在案不执行=静默改向） | 步③试点带已知错误失败态分类跑，违 D-135③ | 最省但欠账滚存 | 拒；若用户明示砍范围须显式 revised D-125 |

## 4) 完整来源清单

| 标题 | URL | 角度 | 贡献 |
|---|---|---|---|
| git-log 官方文档（2.55.0） | https://git-scm.com/docs/git-log | Official | --follow 单文件限制一手确认 |
| [PATCH v2] log: improve --follow (Vajna) | https://public-inbox.org/git/aipTOsH8LKTSwglj@collabora.com/ | Official/Criticism | 非线性历史+多跳改名的语义缺陷根因 |
| SonarSource file-renaming 官方示例 | https://github.com/SonarSource/sonar-training-examples/blob/master/file-renaming/README.md | Official | 投影层缝合使 rename 后 0 new issues、历史保留 |
| SonarQube 社区 #111221 rename→new file | https://community.sonarsource.com/t/detect-file-rename-as-old-code-in-branch-analysis/111221 | Criticism | 缝合缺席→失败态/新码误判的工业实证 |
| libgit2 rename 误判 issue（55% 不可靠） | （搜索结果全文内嵌，gitgitgadget/libgit2 issue #2916 链） | Criticism | 阈值敏感+rename 是启发式+消费侧重推导 |
| git rename/copy limits PR #1044 | https://github.com/git/git/pull/1044 | Official | renameLimit/检测跳过警告机制 |
| CodeScene 项目配置文档 7.4.6 | https://docs.enterprise.codescene.io/latest/configuration/projects.html | Official | 历史深度一等配置、滑动窗口、显式抑制 |
| Projections & Read Models (Dudycz) | https://event-driven.io/en/projections_and_read_models_in_event_driven_architecture/ | Official | 投影=事实的解释、可重建、确定性 |
| MS Sentinel ingest/query-time 归一 | https://learn.microsoft.com/en-us/azure/sentinel/normalization-ingest-time | Official | 双轨归一惯例（检测摄入侧+缝合查询侧） |
| Vertical vs Horizontal Slice | https://www.visual-paradigm.com/scrum/user-story-splitting-vertical-slice-vs-horizontal-slice/ | Community | 垂直切片判据 |
| tracer bullet 票据切分 SKILL.md | https://github.com/mattpocock/skills/blob/main/skills/engineering/to-tickets/SKILL.md | Community | 测试随实现同票、bisect 友好切片 |
| SO: --follow beyond renames | https://stackoverflow.com/questions/64454637/git-log-follow-not-working-to-show-history-beyond-renames | Community | --follow 单文件限制社区佐证 |

## 5) 信息缺口

- CodeScene 对 rename 链的具体处理无独立文档页（其文件视图基于仓级分析，rename 连续性实现细节未公开）——以「历史深度一等配置」侧面佐证，不影响结论。
- 「跨观测集解析」（新旧观测集并存时缝合沿哪个观测集的血缘链走）工业界无直接同构先例——这是本案特有设计点（XTDB 式 bitemporal + 图缝合组合），票面子项需自行定义：建议语义=沿查询时点所在观测集及其祖先观测集的血缘事实解析（at:sha pin 语义已由 D-126⑤ 双引用层纪律覆盖，缝合沿用同一引用层规则即可）。

**建议呈报裁定**：(a)，附两条执行注记——①账本落 F10 归口注记（步②枚举未认领缝合的显式登记）；②多跳/环/跨观测集三项写成批内子项，体量实测超载时升级 (b) 的升级路径预先登记。
