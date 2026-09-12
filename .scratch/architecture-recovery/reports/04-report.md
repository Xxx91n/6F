# Report: 04 — S5 单人仓判据降权（A-004）

> 票：[issues/04-s5-ownership-single-author.md](../issues/04-s5-ownership-single-author.md) ｜ 决策：[spec.md](../spec.md) §Decision 4.4 ｜ 日期：2026-09-11
> 阻塞状态：Blocked by #05 —— A-005 已于今日闭环（ledger「A-005 结论落盘」明文「解锁 Wave 2 票 #01/#02/#03/#04/#14」），本票解锁后一次闭环。
> 机检证据：`node 04-downweight-check.mjs` → `PASS: buckets contiguous+monotone (4); matrix snapshot in sync (5 S5 cells); B1 saturation OK; 3/3 cases recomputed (identities, override, gates, module share); 3 solo real cases; template schema complete`（exit=0）

## 0. 完成定义对照（逐项）

| 验收项（issue 原文） | 交付 | 证据 |
|---|---|---|
| 分桶必须可量化（不能模糊分） | 4 桶 = 人类 actor 计数的整数区间 1 / 2-5 / 6-11 / 12+，连续无缝覆盖；actor 判定规则全机检（§2） | 守卫脚本校验区间连续性 + offset/coefficient 单调性 → PASS |
| 必须用单人仓真实案例验证 | 3 个真实单人仓（env-manager / anysearch-cli / jiahao），git 实测身份表 + 模块份额，守卫脚本从嵌入证据重算全部派生量 | 守卫重算 3/3 案例一致 → PASS（§5） |
| 交付 1：团队规模分桶定义 | `04-downweight.json` §actor_model + §buckets（§2） | 同上 |
| 交付 2：每桶 S5 阈值降权系数 | threshold_offset 0.50/0.25/0.10/0.00 + weight_coefficient 0.25/0.50/0.75/1.00（§3） | B1 饱和性断言 PASS |
| 交付 3：报告模板「信号不足」标注字段定义 | `s5_signal_assessment` 字段块 14 字段（type/required/enum 全定义，§4） | 字段完备性断言 PASS |
| 交付 4：至少 2 个单人仓真实案例验证 | 3 案例，全部 B1、全部触发信号不足门（§5） | solo cases = 3 ≥ 2 → PASS |

## 1. 背景与约束回顾

- **ADR-0004 约束**：战略 quadrant 第 5 维 = S5 所有权边界匹配（模块分解与所有权分解同构，Conway's Law 工程化）；CONTEXT.md S5 词条明文「单人仓该维信号弱，必须降权并在报告显式标注『信号不足』」；阈值声明为初版参数，预留跨仓校准机制。
- **上游 A-005 矩阵**：S5 行 5 cell 阈值快照已嵌入 `04-downweight.json` 并与 `05-unit-matrix.json` 实时对账（守卫脚本断言同步）；`calibration.buckets` 已含 `team-size`，S5xMICRO-B notes「降权为 advisory」由本票具象化。**本票不改矩阵**——降权在读取侧生效，矩阵归属 #05。
- **D-004 全簇对齐**：S5 权重在象限聚合中剔除后按剩余维度归一化，不产生第二套裁决路径（per ADR-0005 HoF-FA 心智）。

## 2. Deliverable 1 — 团队规模分桶定义（可量化）

**判据：人类 actor 计数（H）**，非 raw git 身份计数。归一化管线：

1. **身份源**：`git log --format='%aN <%aE>'`（mailmap 优先），窗口 365 天、default branch。
2. **分类**：`tool`（GitButler/release-please/renovate 等工具身份）→ `ai_agent`（codex/claude/copilot/bot 名或 `*.local`/`bot@*` 邮箱）→ 其余为 `human`。**tool 与 ai_agent 不计入团队规模**——先例：OpenSSF Scorecard 明文机器人不计分；S5 的问责主体是人类组织，AI 代理劳动的连续性不可由 S5 证据源度量（衔接 A-006）。
3. **别名合并**：同 email 必并；跨 email 别名**默认不并**（保守方向：宁可高估团队规模漏降权，不可错降双人团队的信号）；`.mailmap` 是显式合并通道（三试点仓均无，建议补建）。
4. **结构性单人 override**：H≥2 且 top 人类份额 ≥0.90、其余人类全部 <5%（Bird minor 线；Safeguard.sh「90%/24 月=结构性单人」判据改 365 天窗口）→ 强制 B1、`confidence=upper_bounded`。**别名拆分不能让单人仓逃过降权**。
5. **分桶**：H=1 → B1；2-5 → B2；6-11 → B3；12+ → B4。边界依据：B3 上界 11 ≈ Team Topologies 单团队粒度 5-9 加裕度；B4 超出单团队（Dunbar≈15 语境），所有权信号转向组织粒度。

## 3. Deliverable 2 — 每桶 S5 阈值降权系数

双机制（v1 expert 参数，90 天校准窗口，expires 2026-12-10，与矩阵 provenance 同源）：

| 桶 | H | threshold_offset（阈值右移） | weight_coefficient（聚合降权） | 推导锚点 |
|---|---|---|---|---|
| B1 solo | 1 | +0.50 | ×0.25 | Avelino 2016：46% 项目 TF=1，单作者占比恒 1 无判别力；offset 使全部 ≥0.5 的 v1 比率阈值饱和（≥1.0 严格不可达） |
| B2 duo-small | 2-5 | +0.25 | ×0.50 | 65% 项目 TF≤2 双人掌控仍是常态；Badge Gold bus_factor≥2 恰在此桶可满足 → 右移不饱和 |
| B3 single-team | 6-11 | +0.10 | ×0.75 | Team Topologies 单团队 5-9 粒度，接近原始阈值 |
| B4 org | 12+ | +0.00 | ×1.00 | v1 阈值的研究锚点（Bird 企业仓、Linux 26% 作者比）在此粒度，不偏移 |

**生效语义**：阈值比较前 `value_eff = value + threshold_offset(bucket)`；象限聚合前 `risk_weight × weight_coefficient(bucket)`。与矩阵 5 cell 的绑定关系见 `04-downweight.json` §matrix_binding（快照与 `05-unit-matrix.json` 由守卫脚本对账）。

## 4. Deliverable 3 — 报告模板「信号不足」标注字段定义

字段块 `s5_signal_assessment`（14 字段，完整 type/enum/required 见 `04-downweight.json` §report_template_field）：`status`(sufficient/insufficient)、`bucket_id`(B1-B4)、`human_actor_count`、`actor_count_confidence`(resolved/upper_bounded)、`window{days,from,to}`、`identity_summary{raw_identities,human_actors,ai_agent_actors[],tool_actors[]}`、`ai_commit_share`、`structural_solo{applied,top_actor_share,second_actor_share}`、`downweight{threshold_offset,weight_coefficient}`、`reason_codes`(G1/G2/G3/NONE)、`verdict`(green/yellow/red/insufficient_signal)、`aggregate_renormalization`(drop_s5/none)、`restore_evidence[]`（insufficient 时必填）、`rule_version`。

**信号不足门**（任一为真 → status=insufficient）：
- **G1 no_ownership_artifact**：B1 且（无 CODEOWNERS 或人类 owner≤1）且（无 PR reviewer 元数据或人类 reviewer≤1）——锚点：Scorecard Contributors 小团队豁免条款原文。
- **G2 sample_too_small**：窗口提交 <30（Scorecard 30 commits 窗口先例）。
- **G3 ai_labor_majority**：AI 提交占比 ≥0.50 且 H≤1——单人类+AI 代理劳动的所有权连续性不可由 S5 证据源度量（衔接 A-006 评估框架）。

**回退路径**：verdict=insufficient_signal → 象限聚合剔除 S5 权重按剩余维度归一化（drop_s5）→ 报告按 CONTEXT.md Sufficiency Gate 渲染「信号不足（data doesn't show）」叙述段，不给 verified verdict → 输出 restore_evidence（补 CODEOWNERS 双人类 owner / 双人类 reviewer 记录 / 第二人类 actor ≥5%）。

**与模板簇的关系**：本字段块是**提案**，待 #14（A-014 共享骨架，未闭环）收编为共享模板必含字段；结构与 A-009「陈旧数据标记」字段同族（status+reason+窗口），收编时一并归并。

## 5. Deliverable 4 — 单人仓真实案例验证（3 例，git 实测 2026-09-11）

| 案例 | 身份实测 → 归一化 | 桶推导 | 模块单作者份额 | v1 naive | 降权后 | 触发门 |
|---|---|---|---|---|---|---|
| **env-manager**（472 commits，2026-07-10~09-10） | 6 raw 身份 = 1 人类（Xxx91n，9 commits/1.9%）+ AI bot 家族（Env Manager Bot 448 + env-manager-bot 10 + codex/Codex 4，97.9% 劳动）+ 工具（GitButler 1） | H=1 → **B1 resolved** | 6/6 = 1.00 | 1.0 > 0.5 → 黄（bot 劳动被误当所有权信号） | 阈值饱和 + G1/G3 → **insufficient_signal + drop_s5** | G1+G3 |
| **anysearch-cli**（192 commits，2026-08-18~09-11） | Euiop1 188（97.9%）+ TonPro 4（首日 scaffold，无 bot 证据保守计人类） | H=2 naive B2 → override（top≥0.90，second 2.1%<5%）→ **B1 upper_bounded** | 4/4 = 1.00 | 1.0 > 0.5 → 黄（误报） | G1（无 CODEOWNERS/reviewer）→ **insufficient_signal + drop_s5** | G1 |
| **jiahao**（171 commits，2026-08-22~09-11） | Euiop1 167（97.7%）+ Xxx91n 4（均为 codex PR #1-#4 的 merge 提交；三仓 GitHub remote 属主同为 Xxx91n → 同人疑似未证实，保守不并） | H=2 naive B2 → override → **B1 upper_bounded** | 8/8 = 1.00 | 1.0 > 0.5 → 黄（误报） | G1（reviewer 仅 1 人类）→ **insufficient_signal + drop_s5** | G1 |

**验证结论**：naive v1 阈值在三个真实单人仓全部误报黄；降权规则应用后三例全部正确落入「信号不足」回退，无 verified 误判。守卫脚本从嵌入证据独立重算身份求和、人类计数、override 判定、门触发、模块份额，3/3 一致（PASS 原文见报告头）。

## 6. 调研记录（WORKFLOW §4.2.3）

- **atomcode 深度调研已执行**：`atomcode -p "Quantified code-ownership signals normalized by team size..."`（三引擎 Exa+Tavily+AnySearch + Patchright，24 来源，13 篇全文核读），per ctx_batch_execute concurrency=1。核心发现：**工业界不存在已发表的「按团队规模归一化」所有权系数表**——现有工具全部是绝对阈值 + 情境降权 + 小团队豁免三件套（Badge Gold MUST bus_factor≥2；Scorecard Contributors 需 30 commits 内 ≥3 公司各 ≥5 commits 且明文小项目无法满足；SonarQube 实测 0 个所有权信号）。**本票交付的系数表正是该空位的落地点**，与 ADR-0004「全行业唯一空位=护城河」论证一致。
- **工业对标（≥2）**：① OpenSSF Best Practices Badge + Scorecard（豁免条款 + 机器人不计分 = G1/G3 与身份分类的直接先例）；② Team Topologies（5-9 单团队粒度 = B3 边界；每部分恰一个团队拥有 = S5 同构性判据；Patricia Aas 2025 批评——5-9 源自两披萨规则而非证据——已并列披露）；③ Safeguard.sh 2026 结构性单人判据（override 蓝本）；④ 论文锚点 Avelino 2016（TF 分布）+ Bird 2011（5% minor 线；其 FLOSS 反证 EASE'14 已并列披露，见 §7-5）。
- **推荐方案与落选并列**：采用**双机制（offset+coefficient）+ 三门回退**。落选：纯权重法（阈值不右移，B1 误报黄仍在）；纯饱和法（B2-B3 一刀切无分级）；z-score 分布归一化（无 B2+ 语料，样本不足无法估计桶内分布——校准期再评）。
- **CONTEXT.md 术语对齐**：S5 词条证据源（CODEOWNERS/git blame 作者-模块矩阵/bus factor/PR reviewer 分布）= 门 G1 的证据清单；Sufficiency Gate「data doesn't show」= 回退渲染；Micro-B advisory 语义具象化。

## 7. 信息缺口（不掩盖）

1. **B2-B4 系数无真实仓验证**：三试点仓全为 B1，B2-B4 的 offset/coefficient 是文献锚定推导，非实测校准——90 天窗口内补 B2+ 语料后按 Alves 桶内百分位重校准。
2. **系数整体为 expert v1 推断**：调研明示文献无发表系数；全部锚点为间接支撑。
3. **squash/merge 归因**：jiahao 的 AI 工作以人类别名落地（codex PR merge），author 字段系统性低估 AI 份额——不影响人类计数，影响 G3 灵敏度。
4. **模块粒度为顶层目录（代理测量）**：产品实现用 git blame 文件级矩阵；代理测量已足够证明降权方向，粒度校准归产品阶段。
5. **所有权信号本体效力上限**：Bird 所有权-缺陷正相关在 FLOSS 复现不成立（EASE'14，7 系统过半无显著相关、模块规模主导）——S5 对小仓的诊断价值主张需在试点跑分中再证。
6. **PR reviewer 元数据本地不可得**：需 GitHub API；本票保守缺省为「无证据」→ G1 从严触发。
7. **TonPro 身份未定性**（anysearch-cli 首日 4 提交）：保守计人类，由 override 兜底。

## 8. 阻塞

无。#05 已闭环解锁本票；本票一次闭环。输出供 **A-014**（#14 共享骨架收编 s5_signal_assessment 字段块）与 **A-009**（陈旧标记字段同族归并）复用。

## 9. Lessons 候选（已录 WORKFLOW §4）

1. 「按团队规模归一化所有权信号」无工业先例可抄——用「绝对阈值研究锚点 + 豁免条款 + 结构性单人判据」组合成可机检 v1 参数是可行路径。
2. 单人仓分桶的前置是**身份归一化**（1 人类 + AI bot + 工具混在 raw author 里，env-manager 6 身份实为 3 actor）；直接数 raw author 会把单人仓数成 6 人团队，规则完全失效。
3. 守卫脚本首跑即抓出 3 处舍入不一致（份额 3 位小数 vs 1e-9 容差）——声明「可机检」的工件必须配守卫，且容差语义要与存储精度对齐。

## 10. 引用文件列表

- [issues/04-s5-ownership-single-author.md](../issues/04-s5-ownership-single-author.md) ｜ [handoffs/04-s5-ownership-single-author.md](../handoffs/04-s5-ownership-single-author.md) ｜ [prompts/04-s5-ownership-single-author.md](../prompts/04-s5-ownership-single-author.md)
- [spec.md](../spec.md) §Decision 4.4/4.5 ｜ [decision-ledger.md](../decision-ledger.md) A-004/A-005 ｜ [WORKFLOW.md](../WORKFLOW.md) §4.2 ｜ [README.md](../README.md) Wave 2
- [docs/adr/0004-strategic-quadrant-five-dims.md](../../../docs/adr/0004-strategic-quadrant-five-dims.md) ｜ CONTEXT.md（S5 词条 / Sufficiency Gate）
- [reports/05-unit-matrix.json](05-unit-matrix.json) + [reports/05-report.md](05-report.md)（上游矩阵，S5 行快照对账）
- 本票产物：[reports/04-downweight.json](04-downweight.json) ｜ [reports/04-downweight-check.mjs](04-downweight-check.mjs) ｜ 本报告
## 11. 提交面留痕（2026-09-12 补记）

- **已入库**：本报告 + `04-downweight.json` + `04-downweight-check.mjs` → 分支 `fix/s5-single-author-04`（commit `vpl`）。
- **留工作区（按 W1 先例 docs(A-017)：仅提交自身 section）**：① `decision-ledger.md` 的 A-004 状态行编辑——与 7 个他票窗口的行状态编辑同处一个 hunk，无法按 hunk 拆分；② 「A-004 结论落盘」段 hunk——GitButler 判定其依赖 `ticket-05-unit-matrix` 名下未落库改动，2026-09-12 复查重试仍被拒（`lines 129–153 depends on ticket-05-unit-matrix (vxs)`，纠缠区间较前日扩大，属其他窗口追加）——由所属窗口提交其行编辑时一并清扫；③ WORKFLOW.md lessons 行——该文件系他窗口产出且从未入库，整文件提交会吞并他人工作。
- 上述三处磁盘状态即最新账本（D-6 防蒸发已满足），仅提交面未合拢，不阻塞本票语义闭环。
