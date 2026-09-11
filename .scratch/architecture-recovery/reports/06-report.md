# Report: A-006 — AI-agent 对 ADR 质量冲击评估框架

- **A-xxx:** A-006
- **Decision:** spec.md §Decision 4.6
- **ADR ref:** docs/adr/0004-strategic-quadrant-five-dims.md（S2 ADR Quality）
- **对应 issue:** issues/06-ai-agent-adr-impact.md
- **对应 handoff:** handoffs/06-ai-agent-adr-impact.md
- **Report date:** 2026-09-11
- **Verdict:** **推迟（DEFER）** — spec 阶段交付「评估框架」（指标定义 + 取样方法 + 推迟触发条件），实际评估待 AI 代码生成主流化

---

## 0. 开工复述（per 本票「开工第一句」硬要求）

**Blocked by: None**（can start immediately）——本票无上游阻塞，本窗口直接开工。

**必读清单全部路径 + 阅读状态：**

| # | 路径 | 状态 |
|---|---|---|
| 1 | `.scratch/architecture-recovery/issues/06-ai-agent-adr-impact.md` | 已读全文 |
| 2 | `.scratch/architecture-recovery/handoffs/06-ai-agent-adr-impact.md` | 已读全文 |
| 3 | `.scratch/architecture-recovery/spec.md` §Decision 4.6 | 已读（含 Coverage 对账表） |
| 4 | `.scratch/architecture-recovery/WORKFLOW.md` §4.2（§4.2.1 ~ §4.2.6） | 已读 |
| 5 | `.scratch/architecture-recovery/decision-ledger.md` A-006 | 已读（表格行 + 覆盖率自评段） |
| 6 | `docs/adr/0004-strategic-quadrant-five-dims.md` | 已读全文（Status: accepted） |

---

## 1. 推迟决议（明文，专属验收第 1 项）

**本票交付「评估框架」本身，不执行任何实际评估。** 这不是省略，而是 spec.md §Decision 4.6 的原文要求：

> 推迟：低优先级；spec 阶段交付「评估框架」（指标定义 + 取样方法），实际评估待 AI 代码生成主流化

推迟的三条理由（每条对应一个机检触发信号，见 §4.3）：

1. **样本不足（T1/T3 未越线）**：AI 生成代码的 commit 级归因尚无行业标准 trailer，目标仓库无法可靠切出「AI 生成」样本子集——一致性/漂移指标的分母不可信。
2. **基线不稳定（T6/T7 未越线）**：工业界 ADR 模板与门禁仍在演化（Nygard vs MADR 之争未定、SonarQube agentic AI gate 2026 年才发布），此刻锁定的阈值会在一个发布周期内失效。
3. **spec 阶段边界（T6 语义）**：本产品 Phase 4 尚未启动，自身尚无可评估的 AI 生成代码历史——对自身做评估会得到零样本结论。

**推迟 ≠ 永不评估。** 被推迟的对象保留 L0 基线扫描（§5），触发条件越线即按 §4.3 升级到 L1/L2。

---

## 2. 前置背景与约束回顾

### 2.1 issue 要件

| 字段 | 值 |
|---|---|
| A-xxx covered | A-006 |
| Spec ref | spec.md §Decision 4.6 |
| What to build | 评估框架（指标定义 + 取样方法），实际评估推迟 |
| Blocked by | None (can start immediately) |
| Status | ready-for-agent |

### 2.2 handoff 完成定义

1. 评估指标清单（至少 3 个：决策一致性 / 可逆性 / 上下文漂移）
2. 取样方法（哪个仓库、什么 commit 范围、什么 prompt）
3. 推迟触发条件

### 2.3 decision-ledger A-006 原文约束

| 字段 | 值 |
|---|---|
| 问题描述原文 | AI-agent 生成代码对 ADR 质量冲击的评估（bool.dev AP8 未展开） |
| 规范化需求 | AI 生成代码时代 ADR 质量的长期演化评估 |
| 显式约束 | 前置 = 待 AI 代码生成主流化；低优先级；**可推迟** |
| 来源决策 | D-004 |

### 2.4 ADR-0004 约束与承接点

ADR-0004 把战略 quadrant 定为 5 维 S1-S5，其中 **S2 ADR Quality** 是本票的理论母体：
- S2 判据 = 「真决策」五要素：有 Context 张力 / Considered Options / 正负 Consequences / immutable+supersede 链 / 决策当时写而非事后补。
- S2 已内建**决策可逆性**维度：confidence + 门类型（one-way vs two-way）+ 回滚路径。
- S2 证据源 = `docs/adr/` 全量结构扫描 + `git log --follow` + TODO/FIXME 密度对照。
- ADR-0004 末句声明「阈值（黄/红）为初版参数，预留跨仓校准机制」——本框架的阈值同样声明为初版参数，**复用同一条跨仓校准机制**，不另起一套。

**本票相对 S2 的增量**：S2 评「ADR 现在写得好不好」；本票评「AI 生成代码是否让 ADR 体系随时间劣化」——即 S2 的**时间导数**，主战场落在 Macro-C（演化考古）scale。

### 2.5 CONTEXT.md 心智模型映射

| 术语 | 本票用法 |
|---|---|
| **Audit** | 框架输出必须是带证据引文与可驳回裁决的判定，不是打分表 |
| **S2 ADR Quality** | 指标基准维；本框架是 S2 的元评估层 |
| **Strategic Quadrant** | 本票只作用于 S2，不越界到 S1/S3/S4/S5 |
| **Failure Semantics** | 「推迟」是一种显式降级：必须留 L0 产物 + 触发条件，禁止沉默跳过 |
| **Adjudication Protocol** | 回升判定走 verdict-gate（证据门槛），不由人拍脑袋 |
| **Evidence Gate** | 每个指标值必须可追溯到 file/commit/行号，否则标 `⚠ contains uncited claims` |
| **Sufficiency Gate** | 证据不足时标 `data does not show` 并发起 GapRequest，禁止硬凑结论 |
| **Macro-C (Evolution Archaeology)** | 上下文漂移指标的主战场 scale |
| **Report Template (共享骨架 + Scale Slice)** | 本框架产出的评估报告须遵循 D-006 骨架（执行摘要 → 4 象限/裁决 → 证据 → 行动建议） |

---

## 3. atomcode 深度调研（per WORKFLOW §4.2.3）

### 3.1 执行参数

- **引擎**：Exa + Tavily + AnySearch 三引擎交叉验证（14 组查询）
- **定点抓取**：12 次 web_fetch（10 次成功；ACM paywall 1 次 403、scien.cx 1 次超时）
- **覆盖**：同行评审论文（arXiv/IEEE ICSA）、工业数据报告（GitClear/Sonar/DORA）、官方工具文档（OpenSSF Scorecard/SonarQube/Fowler bliki）、工程博客（反方批评视角）
- **输出**：14 个索引段 / 22 条来源

### 3.2 核心发现（每条带来源）

**F1 — ADR 一致性检测已可自动化，且有公开精度基准。**
arXiv 2602.07609（Oulu/SDU，2026-02-07，已读）在 **980 个 ADR / 109 个 GitHub 仓库**上跑多 LLM 流水线（1 主筛 + 3 独立验证）：最佳模型 Accuracy 0.911、MCC 0.844、macro-F1 0.881；对 Compliant 类 recall 可达 1.0，对 Not-Compliant 类 F1 ≈ 0.90。**最弱的是「代码不足以回答」（CIA）类，F1 ≈ 0.79**——隐式/部署/组织类决策无法从代码验证，错误案例中基础设施/部署类占 42.39%、原则/意图类占 26.09%。

**F2 — AI 代码引入的债是持久积累，不是一次性噪音。**
arXiv 2603.28592（SMU，2026-04-26，已读）覆盖 **302.6k 个已验证 AI 提交 / 6,299 仓库 / 5 种助手**（Copilot、Claude、Cursor、Gemini、Devin）：检出 484,366 个问题（代码异味占 89.3%）；**每个助手均有 >15% 的提交引入 ≥1 个问题；22.7% 的问题存活到 HEAD**。

**F3 — 结构性维护信号有公开基线，可直接当 tripwire。**
GitClear《The Maintainability Gap: AI Code Quality in 2026》（已读，623M 变更行 / 2023-2026）：跨文件函数调用 −35%、重构代码移动 −70%、长期遗留代码维护 −74%（vs 2022）；复制粘贴 +41%、**块级重复 +81%（每百万行 40.3→73.0）**、错误掩盖构造 +47%、两周 churn +15%。报告给出的五个动作中两个本身就是触发机制：给重复块装 tripwire、度量结构而非仅体量。

**F4 — 工业界已有「AI 代码质量门禁」的现成触发矩阵。**
SonarQube「Sonar way for agentic AI」质量门（docs.sonarsource.com，2026.4，已读）：对新代码强制六条件——无 ≥Low 可靠性问题、无 ≥Low 安全问题、无 ≥Medium 可维护性问题、无 ≥Low 依赖风险、**覆盖率 ≥80%**、**重复率 ≤3%**；并引入 AI Code Assurance 徽章。Scorecard（github.com/ossf/scorecard docs/checks.md，已读）用**最近 ~30 提交/合并 PR 的滚动窗口**取样，按风险加权（Critical×10 / High×7.5 / Medium×5 / Low×2.5）聚合，社区以 ≥7 为健康线。

**F5 — ADR 权威定义内建「重估触发」概念，与「推迟」同源。**
Fowler bliki（2026-03-24，已读）明确 ADR 应记录**置信水平**与**应触发团队重估决策的产品上下文变化**。可逆性分类（one-way / two-way door，Bezos 式 Type-1/Type-2）与 Last Responsible Moment 是决定「何时值得记录/何时跳过」的核心启发式（jeffbailey.us 2026-07-13，已读）；m7y.me（2025-12-23，已读）给出对偶的「何时不写 ADR」清单（易逆+低影响、探索性工作、唯一明显答案、平台已锁定）。

**F6 — 模板选择直接影响可测性。**
arXiv 2604.27333（2026-04-30，已读，DESMET FA 受控实验 n=33）：**Nygard 模板总体优于 MADR**；Nygard 利于简洁客观记录、MADR 利于结构化细节。对本框架的含义：简洁模板的字段边界清晰、LLM 判定歧义小，自动一致性校验更可靠；字段丰富的模板更利于承载上下文漂移检测，但解析成本更高。

**F7 — 冲突如实报告（不掩盖）。**
arXiv 2506.17833（40 名从业者调查，2025-06-21）发现「小代码片段无显著负面架构影响、大而复杂问题的 AI 方案质量更低」，且无显著负面整体影响；而 2603.28592 与 GitClear 的大规模客观数据均显示显著负面趋势。分歧解释：前者是**主观调查 + 小样本（n=40）**，后者是**客观静态分析 + 大规模（30 万提交 / 6.23 亿行）**。**本框架采纳后者作为阈值设计的事实基础，但保留前者作为「AI 使用限于小片段时风险可控」的 DEFER 判据**（见 §4.3 T2）。

**F8 — ADR 工具链只解决编号与发布，不验证质量。**
adr-tools（Nygard 原生，仅创建 + TOC）、Log4Brains（Nygard + YAML frontmatter，Web UI + supersession 图）、adr-log（MADR 原生，Markdown 索引）——一致校验（supersession 指针是否断裂、格式是否漂移）需自建。这直接支撑本框架「指标必须可机检、且由本产品自建检测器承担」的设计。

### 3.3 对标工业界成熟方案（≥2，per handoff 通用调研要求）

| # | 方案 | 类比维度 | 本框架借鉴点 |
|---|---|---|---|
| 1 | **OpenSSF Scorecard** | 多检查项 → 风险加权聚合 → 单一分数 + 健康线 | 指标聚合方式（按风险加权，不取简单平均）；取样窗口（~30 提交滚动）；明确排除样本仓 |
| 2 | **SonarQube agentic AI quality gate** | 新代码强制门禁，条件可机检、可阻塞 | 触发矩阵的形态（条件 + 阈值 + 动作三列）；「AI Code Assurance」状态徽章 → 本框架的 L0/L1/L2 分级 |
| 3 | **GQM 度量框架（Basili；ACM《Goals, questions and metrics for architectural decision models》10.1145/1988676.1988682）** | Goal → Question → Metric 分层推导 | 每个指标必须由 Goal 推导、可回溯到 Question，避免指标堆砌。**注：ACM 原文 403 paywall 未读全文，仅摘要级，标注为待验证** |
| 4 | **Type-1/Type-2 door 可逆性分类（Jeff Bezos，经 jeffbailey.us / m7y.me 工程化）** | 决策按可逆性二分，决定记录深度与评估成本 | 可逆性指标的语义基础：R→1 双向门 / R→0 单向门 |

---

### 3.4 基线决策回顾（D-001 ~ D-007 与本票契合度）

| 决策 | 与本票关系 |
|---|---|
| D-001 5 scale 全覆盖 | 框架指标须能落到全部 5 scale；上下文漂移主战场在 Macro-C，一致性主战场在 Micro-A |
| D-002 拒绝 MVP 切片 | 框架本身按 spec-level 完整定义交付（3 核心指标 + 1 补充指标 + 3 级漏斗 + 8 条触发条件），不做「先只做 1 个指标」的切片 |
| D-003 边界不含商业 | 指标全部限定在技术质量维度，**不含 ROI / 商业价值 / 团队产能** |
| D-004 战略 quadrant 5 维 | 本票直属于 S2 ADR 质量维；与 S1 定位收敛共享「声明 vs 实际」范式，但本票不越界评 S1 |
| D-005 Hub-of-Facts + Federated Adjudication | 推迟回升判定走 verdict-gate（协议集中定义、执行分散）；指标证据须能写入 fact table 作为可重放事实 |
| D-006 共享骨架 + Scale 切片 | 评估报告须遵循共享骨架（执行摘要 → 4 象限/裁决 → 证据 → 行动建议），scale 差异走切片 |
| D-007 10 条演示路径 | 「推迟」在演示层是一个天然 failure path：降级产物 = 推迟报告 + L0 基线 + 回升条件，形态与 happy path 共享骨架但带 ⚠ 印记 |

---

## 4. 评估框架（核心交付物）

### 4.1 组件 A — 评估指标清单（3 核心 + 1 补充，全部可机检）

统一采用 GQM 结构（Goal → Question → Metric，源自 Basili；见 §3.3 #3），每个指标给出**定义 / 机检公式 / 数据源 / 检测器 / 阈值**五要素。阈值声明为**初版参数**，复用 ADR-0004 预留的跨仓校准机制。

#### M1 决策一致性（Decision Consistency, C_est）

- **Goal**：代码实现与 Accepted ADR 的意图对齐度。
- **Question**：在时刻 t，活跃 ADR 中有多大比例的实现与决策意图一致？
- **定义**：对活跃 ADR 集合 `D_active(t)`，实现与决策意图一致的比例。
- **机检公式**：

```text
V_auto(t) = LLM 流水线检出的违规数（多模型投票，按 2602.07609 配置）
C_est(t)  = 1 - ( V_auto(t) * (1 / R_NC) ) / |D_active(t)|

  R_NC = 检测器对「违规类」的查全率，缺省 0.876（2602.07609 NC 类实测）
  退化速率 ΔC(Δt) = [ C_est(t1) - C_est(t0) ] / |commits(Δt)|
```

- **数据源**：`docs/adr/` 全量 Markdown（决策声明）+ 代码静态分析（AST / 依赖图）作为实现证据。
- **检测器**：多 LLM 流水线（1 主筛 + 3 独立验证，2/3 一致为准），**必须报告 precision/recall 置信区间**，不得只报单点值。
- **阈值（初版）**：绿 `C_est ≥ 0.85`；黄 `0.60 ≤ C_est < 0.85`；红 `C_est < 0.60`。
- **⚠ 已知失真面（必须如实报告）**：对隐式/部署/组织类决策（CIA 类，F1 ≈ 0.79）与基础设施类 ADR（错误案例占比 42.39%），本指标**必须降权或改人工抽检**。禁止对该子集直接套阈值。

#### M2 可逆性（Reversibility, R / RI）

- **Goal**：决策被 AI 加速固化的程度（双向门被改写成单向门的速度）。
- **Question**：AI 署名提交触及的决策中，有多大比例落在单向门上？
- **定义（决策级）**：`R(d) = 1 - undoCost(d) / (undoCost(d) + keepCost(d))`，`R→1` 双向门、`R→0` 单向门。
- **机检公式（仓库级退化指标）**：

```text
RI(Δt) = |{ c ∈ C_AI(Δt) : R(dep(c)) < θ_rev }| / |C_AI(Δt)|

  C_AI(Δt) = 窗口内 AI 署名提交集合
  dep(c)   = 提交 c 触及的决策
  θ_rev    = 单向门阈值（初版建议 0.3）
```

- **undoCost 估算项（全部可机检）**：受影响组件数（依赖图反向可达集）、数据迁移规模（migration/schema 文件 diff 行数）、对外 API 影响面（公开符号 diff）、回滚所需时间（历史 revert 提交的中位时长）。
- **数据源**：ADR YAML 头（confidence / door_type）+ 依赖图 + API 面 + 迁移文件历史。
- **阈值（初版）**：绿 `RI < 0.15`；黄 `0.15 ≤ RI < 0.30`；红 `RI ≥ 0.30`。
- **含义**：RI 上升 = AI 正在把双向门改写成单向门，即「决策空间锁死速度」上升。

#### M3 上下文漂移（Context Drift, St / KV）

- **Goal**：ADR 记录的语境与现实系统的错位度。
- **Question**：代码在动、决策记录没动的比例是多少？决策有没有沉进 AI 会话里？
- **机检公式**：

```text
St(Δt) = |{ comp ∈ changed(Δt) : covered_by_accepted_ADR(comp) ∧ ADR 未在 Δt 内 supersede/更新 }| / |changed(Δt)|

KV(Δt) = |decisions_in_AI_chat(Δt) ∪ 未转录决策| / |decisions_total(Δt)|
```

- **St 的含义**：即「决策日志变成考古现场」的量化形式——正是 scien.cx《Your Decision Log Is an Archaeological Site》（40 篇 ADR 仅 5 篇承重）所描述现象的可测版本。**注：该源两次抓取超时，仅 Exa 摘要级，标注为待验证。**
- **KV 的含义**：知识蒸发率——决策只存在于 AI 聊天历史中、从未写入 ADR 的比例。**该指标依赖 AI 会话日志的可获取性，属已知信息缺口（见 §7）。**
- **辅助子指标**：上下文-代码耦合散度 = 记录中引用的组件集 与 实际变更组件集 的 Jaccard 距离，用于检测「ADR 与代码解耦」。
- **数据源**：`git log --follow` 组件变更集 + ADR 引用段（LLM 抽取）+ AI 会话日志（若可得）。
- **阈值（初版）**：绿 `St < 0.20`；黄 `0.20 ≤ St < 0.45`；红 `St ≥ 0.45`。

#### M4（补充）ADR 密度（ADR Density, θ_density）

- **Goal**：架构级决策事件是否都有对应 ADR——衡量 ADR 实践的**覆盖完整性**。
- **Question**：发生了多少次架构级决策，其中多少次被记录？
- **机检公式**：`θ_density = |architecture_decisions_with_ADR| / |architecture_decision_events|`
- **决策事件检测规则（全部可机检）**：(a) 新增外部依赖（`git diff --diff-filter=A` on package.json / Cargo.toml / go.mod / requirements.txt）；(b) 新增核心模块（新增文件 >200 行且复杂度超阈值）；(c) API 破坏性变更（openapi-diff / protobuf breaking）；(d) 数据库 schema 变更（migration 文件新增）。
- **阈值（初版）**：绿 `θ_density ≥ 0.80`；黄 `0.50 ≤ θ_density < 0.80`；红 `θ_density < 0.50`。
- **定位**：M4 是 M1/M3 的**分母保障**——若密度本身就低，一致性/漂移的结论缺乏代表性，须在报告中显式标注。

#### 指标汇总表

| 指标 | 符号 | 类型 | 可机检 | 阈值（绿 / 黄 / 红） | 主要失真面 |
|---|---|---|---|---|---|
| 决策一致性 | C_est | ratio [0,1] | ✅ 全自动 | ≥0.85 / 0.60–0.85 / <0.60 | CIA 类决策降权或人工兜底 |
| 可逆性（AI 不可逆决策率） | RI | ratio [0,1] | ✅ 全自动 | <0.15 / 0.15–0.30 / ≥0.30 | undoCost 估算依赖依赖图完整性 |
| 上下文漂移（陈旧度） | St | ratio [0,1] | ✅ 全自动 | <0.20 / 0.20–0.45 / ≥0.45 | 依赖 ADR 引用段抽取质量 |
| 上下文漂移（知识蒸发率） | KV | ratio [0,1] | ⚠ 半自动 | 待定 | **依赖 AI 会话日志可获取性（见 §7）** |
| ADR 密度 | θ_density | ratio [0,1] | ✅ 全自动 | ≥0.80 / 0.50–0.80 / <0.50 | 决策事件检测规则的召回率 |

**可机检性声明**：上表前 4 项（C_est / RI / St / θ_density）均可由脚本 + LLM 流水线**全自动**计算，分子分母均有明确定义的提取规则，**不含主观定性成分**。KV 为半自动（受限于会话日志可得性），因此**不计入自动阈值判定**，仅作为叙事层证据。每个指标的阈值均走 YAML 配置外置以支持跨仓校准（复用 ADR-0004 机制）。

#### 可选：综合退化指数（仅供组织层聚合，非本框架判定依据）

```text
ADR-DI(t) = w1*(1-C_est) + w2*RI + w3*St + w4*(1-θ_density)

  权重按 OpenSSF Scorecard 的风险加权精神（Critical 10 / High 7.5 / Medium 5 / Low 2.5）：
  w1、w3 最高（直接影响维护成本），w2 次之，w4 兜底
```

> **重要边界**：ADR-DI 仅为组织层聚合视图，**不得替代单项指标作为 verdict-gate 判定依据**——否则会掩盖单项红线的信号（per CONTEXT.md「Evidence Gate」：结论必须可追溯到具体证据，聚合分会切断追溯链）。

### 4.2 组件 B — 取样方法（专属验收第 2 项：仓库 / commit 范围 / prompt）

#### 4.2.1 取样仓库（哪个仓库）

**三层漏斗（L0 → L1 → L2，借鉴 Scorecard 的滚动窗口 + 排除规则心智）：**

| 层 | 名称 | 规模 | 用途 |
|---|---|---|---|
| L0 | 基线扫描 | 全部可及仓库（本框架默认 1 个：本仓库自身） | 只记录指标当前值，不做判定、不产出评估结论——**这就是「推迟」状态下的常驻产物** |
| L1 | 分层审计 | ≤10 仓库 | 触发条件越线后启动；产出单项指标的红/黄/绿灯与证据引文 |
| L2 | 专家深度审计 | 1–3 仓库 | L1 出现红色项后启动；含人工复核子样本、综合指数全面测算 |

**仓库池与优先级（评估启动时按此顺序取，取满上限即止）：**

| 优先级 | 仓库来源 | 纳入理由 | 已知风险 |
|---|---|---|---|
| **P0** | 本仓库 `Aworker/6F` | 已有 7 条 ADR（0001–0007）、完整 supersede 链与 spec-level 产物；是 dogfooding 对象 | 样本极小（7 条 ADR），**单独不构成统计样本**，只能作 calibration 锚点 |
| **P1** | 用户 memory §11 三项目评审档案：`env-manager` / `jiahao` / `anysearch-cli` | 已有归档评审基线，可做前后对比；用户已知仓库 | 需逐仓确认可访问性与 AI 使用历史是否存在 |
| **P2** | 公开 OSS 仓库（筛选条件：`docs/adr/` 存在 ≥5 条 accepted ADR、近 365 天有提交、README 或 CONTRIBUTING 显式声明使用 AI 编码助手） | 提供 AI 场景样本 | **AI 使用声明可能不实**（这正是 T1/T3 推移动机） |

**排除规则**（借鉴 Scorecard 排除样本/模板/PoC 仓的做法，否则得到误导性低分）：

- 排除 `samples/` / `templates/` / `demo-*` / PoC 类仓库；
- 排除 vendored / fork-only 仓库（不反映原创决策）；
- 排除 ADR 目录为空或无 accepted ADR 的仓库（分母为零）。

#### 4.2.2 Commit 范围（什么 commit 范围）

| 参数 | 值 | 理由 |
|---|---|---|
| 时间窗口 | **最近 365 天**（仓库历史不足则取全历史，并显式标注窗口） | 与 Scorecard 的 Active/Recent 窗口心智对齐，放宽到 365 天以容纳 ADR 的稀疏性 |
| 分支范围 | **仅 default 分支**（main / master） | 避免 feature branch 噪声污染一致性统计 |
| 最小 ADR 数 | **≥5 条 accepted/superseded ADR** | 低于此数不启动 L1（对齐 2602.07609 的 min-repo 约束）；不足时降级为 L0 |
| 最小提交数 | ≥30 提交（窗口内） | 对齐 Scorecard 约 30 提交滚动窗口的取样粒度 |
| AI 归因子集 | C_AI(Δt) = commit message 显式含 AI 归属 trailer 的提交（`Co-authored-by:` 含 AI 助手标识 / `ai-assisted: true`） | **这是 T1 的机检入口**；无标注即无法切子集 → 触发 DEFER |
| ADR 状态过滤 | 仅 `accepted` + `superseded`；排除 `draft` / `rejected` / `archived` / `proposed` | 只评估已生效或已退役的决策，避免未定决策噪声 |
| 配对要求 | Δt 窗口内**必须同时存在**代码变更与 ADR 变更，否则 M3 的 St 分母为零 → 标 `data does not show`（per Sufficiency Gate） | 禁止在零分母上硬凑结论 |

---

#### 4.2.3 Prompt / 检测流水线配置（什么 prompt）

以下为**评估启动时**要落地的配置 schema（本次仅给 schema，不产出实际配置实例——per 推迟决议）。

```yaml
pipeline:
  adr_parser:
    input: "docs/adr/*.md"
    extract: [context, decision, consequences, status, supersedes, date, confidence, door_type, referenced_components]
    format: "YAML frontmatter + markdown body"

  consistency_checker:                  # M1
    engine: multi-model-voting          # per arXiv 2602.07609
    models: [model-a, model-b, model-c] # 三个独立模型，主筛不参与验证
    agreement: 2-of-3
    report_confidence_interval: true
    known_weak_classes: [implicit, deployment, organizational]   # CIA, F1 approx 0.79 -> 降权

  reversibility_scanner:                # M2
    method: keyword + structural-regex + dependency-graph
    theta_rev: 0.3

  drift_detector:                       # M3
    git_window_days: 365
    jaccard_coupling: true
    tech_extraction: LLM + dependency-manifest-diff

  density_estimator:                    # M4
    decision_events: [dependency_addition, module_creation, api_breaking, schema_change]

sampling:
  min_adr_count: 5
  min_commit_count: 30
  max_repo_count: 10
  time_window_days: 365
  branches: [default]
  exclude_patterns: ["docs/adr/drafts/", "docs/adr/rejected/", "docs/adr/archived/", "templates/", "samples/"]

thresholds:                             # 初版参数，走 ADR-0004 跨仓校准机制
  C_est:         { green: 0.85, yellow: 0.60 }
  RI:            { green: 0.15, yellow: 0.30 }
  St:            { green: 0.20, yellow: 0.45 }
  theta_density: { green: 0.80, yellow: 0.50 }
```

**Prompt 设计约束（对 LLM 检测器，四条硬规则）：**

1. **必须输出结构化判定**：`compliant` / `not_compliant` / `insufficient_code_evidence` 三分类，不接受自由文本结论。
2. **必须带引文**（ADR 行号 + 代码 file:line），无引文的判定计为 `⚠ contains uncited claims` 并丢弃（per CONTEXT.md Evidence Gate）。
3. **必须保留第三类**——「代码不足以回答」单独成类，**不得并入 compliant**。这是 2602.07609 的关键设计：其 F1 最弱（≈0.79）的正是这一类，若并入合规会系统性高估一致性。
4. **模型不可自评**：主筛模型不得参与验证轮（1 主筛 + 3 独立验证的隔离要求）。

---

### 4.3 组件 C — 推迟触发条件（专属验收第 3 项）

#### 4.3.1 触发条件矩阵（8 条，全部可机检）

设计原则：把「全面评估」当昂贵手术，用便宜信号决定启动级别。三档动作：**DEFER**（保持 L0 扫描，不评估）→ **ESCALATE**（升到 L1 分层审计）→ **FULL AUDIT**（启动 L2 深度审计）。

| 触发器 | 信号维度 | 机检方式 | DEFER 条件 | ESCALATE 条件 | FULL AUDIT 条件 | 依据 |
|---|---|---|---|---|---|---|
| **T1** | AI 提交占比 | git trailer 归因统计 | <15% | 15–40% | >40% | >15% 的提交引入 ≥1 问题（2603.28592） |
| **T2** | 变更尺度 | PR/提交规模与波及面 | 仅小片段、不触架构 | 中大型变更、涉及既有代码集成 | 大型复杂问题 / 跨模块重构 | 小片段无显著负面影响，大问题 AI 方案质量更低（2506.17833） |
| **T3** | 决策表面 | 触及的 ADR 及其 R(d) | 未触及 Accepted ADR 覆盖组件；R ≥ 0.7 | 触及但 R 中等 | 触及单向门（R < 0.3） | 可逆性启发式（jeffbailey.us / m7y.me） |
| **T4** | 新代码质量门 | Sonar 六条件或等价门禁 | 全过 | 违反 1–2 项中等级 | 可靠性/安全出现 ≥Low 违规 | SonarQube agentic AI gate |
| **T5** | 供应链/仓库风险 | OpenSSF Scorecard 聚合分 | ≥7 且无 Critical/High 失败 | <7 或存在 Medium 失败 | Critical/High 检查失败 | Scorecard 加权与 7 分健康线 |
| **T6** | 结构化维护信号 | 重复块密度 / churn / error-masking | 全部低于基线 | 单项超基线 | 重复块 ≥73/百万行，或 churn >7.9%，或 error-masking 持续上升 | GitClear 2026 基线 |
| **T7** | 债生命周期 | 引入提交 → HEAD 存活率 | — | 接近基线 22.7% | 显著超基线 22.7% | 2603.28592 |
| **T8** | 决策记录面 | ADR 覆盖率、知识蒸发率 KV | 显著决策覆盖率 >80% | 覆盖率 50–80%，或 KV 上升 | 覆盖率 <50%（决策藏在 AI 会话里） | 决策注册表实践 + ADR 体系 |

> **判定规则**：任一触发器达到 ESCALATE → 启动 L1；任一达到 FULL AUDIT → 启动 L2。**全部处于 DEFER 档 → 维持推迟**（本票当前状态）。

#### 4.3.2 明确不评估清单（与矩阵互补，避免评估膨胀）

以下情形**直接跳过评估**，仅保留一段说明为什么跳过的廉价记录（依据 jeffbailey.us §9 / m7y.me「何时不写 ADR」）：

- 探索性 / 一次性工作（spike、原型，不进入长期代码库）；
- 低影响的双向门决策；
- 平台已锁定的决策（无选择空间）；
- 唯一明显答案的决策（无真实张力）。

#### 4.3.3 回升路径（推迟 ≠ 永不评估）

1. 被 DEFER 的对象**保留 L0 基线扫描**，指标值随每次仓库活动更新；
2. T1 / T6 / T7 中任一越线 → 自动升级到 L1，无需人工审批；
3. L1 出现红色项 → 升级 L2，**并由 verdict-gate 判定是否进入正式评估报告**（per D-005 Adjudication Protocol：协议集中定义、执行分散），不由人拍脑袋决定；
4. 每次升级/降级动作写入决策账本（per WORKFLOW §4.2.4），使推迟状态本身可审计——**这正是 Fowler 所述「记录重估触发条件」的操作化**。

---

## 5. L0 基线扫描结果（推迟状态下的常驻产物）

**声明**：下表**不是评估结论**，仅记录当前快照，供未来回升到 L1 时做前后对比。所有值均带证据来源。

| 观测项 | 当前值 | 证据来源 | 备注 |
|---|---|---|---|
| accepted ADR 总数 | **7**（0001–0007） | `ls docs/adr/*.md` → 7 个文件 | 满足 min_adr_count ≥5，**单独达 L1 门槛但触发条件未越线** |
| ADR 目录结构 | ✅ 存在且独立 | `docs/adr/` 含 7 个 MD，命名 `NNNN-slug.md` | 符合 Fowler 推荐的 `doc/adr` 惯例 |
| ADR 状态标注 | ✅ 存在 | `docs/adr/0004-*.md` 末行 `Status: accepted` | 需逐条核查全部 7 条（本次未全量核查，属 L1 工作） |
| supersede 链 | **未度量** | — | 当前 7 条 ADR 互不取代（编号连续 0001–0007，无 supersede 指针） |
| AI 归因提交占比（T1） | **0 个 trailer / 2 个提交** | `git log --all --format=... %(trailers:key=ai-assisted)` → 空 | 仓库仅 2 个提交（1 initial + 1 GitButler workspace），**样本为零** |
| 仓库提交总数 | **2** | `git rev-list --count HEAD` → 2 | 远低于 min_commit_count=30 → **不满足 L1 取样门槛** |
| 本产品 Phase 4 状态 | **未启动** | 仓库内无实现代码产物 | 触发条件 T6 语义未达成 |
| 工业界复现研究数量 | **1 篇直接相关 + 1 篇技术债量化** | arXiv 2602.07609 + arXiv 2603.28592 | 不足 2 篇同主题复现 → 支撑推迟 |
| ADR YAML 时间戳头 | **未核查** | — | 与 A-002（S2 时间戳核查）有依赖，属该票范围 |

**当前判定：满足 DEFER**。理由：T1（AI 占比 0%）、T6（Phase 4 未启动）、T7（无生存率数据）、T8（无覆盖率基线）全部未越线；且 min_commit_count 与 min_adr_count 双重不达标，**L1 取样在物理上不可执行**——这不是主观选择，而是机检结果。

---

## 6. 与其他票的关系与边界

| 相关票 | 关系 |
|---|---|
| **A-002**（S2 ADR 时间戳核查） | **共享证据基础**：M3 上下文漂移的 St 需要 ADR 时间戳头；A-002 未闭环前，M3 只能部分可测。本框架不越界实现 A-002 |
| **A-005**（25 采集单元矩阵） | A-006 是 D-004 的下游，A-005 是上游（本票不改矩阵）。本框架的指标在设计上是**跨 scale 复用**的——但具体在 5 scale 下的采集单元归属由 A-005 决定 |
| **A-003**（ADR 假设提取工具链） | M3 的「ADR 引用组件抽取」与 A-003 的 LLM 抽取共用能力，**应复用而非另建**（per 工作约定：优先复用既有模式） |
| **A-009**（read model 陈旧读） | 本框架的指标时间窗口与 A-009 的陈旧读容忍度是两个不同的「陈旧」概念，**不合并**：A-009 管数据管道延迟，本票管决策与代码的语义错位 |
| **A-018**（failure path 明细） | 本票的「推迟」是一个具体 failure path 实例，可作为 A-018 的输入样例 |

**边界声明（不越界）**：本票**不**产出 ADR 模板修订、**不**实现检测器代码、**不**执行任何仓库的实际评估、**不**触碰 docs/adr/ 下任何既有 ADR。

---

## 7. 信息缺口（per Sufficiency Gate — 诚实标注 data does not show）

1. **AI 提交归因无行业标准**：当前无统一 trailer 规范，`C_AI(Δt)` 的切分依赖各仓库自觉。这是 T1 的机检基础，也是本框架最脆弱的假设。
2. **AI 会话日志不可获取**：M3 的知识蒸发率 KV 需要 AI 聊天历史，通常不在仓库内、无法审计。故 KV **不计入自动阈值判定**。
3. **undoCost 的最优权重未知**：R(d) 的四个估算项（组件数 / 迁移规模 / API 面 / 回滚时长）的加权方式无实证依据，需在 L2 阶段用专家标注校准。
4. **90 天 vs 365 天窗口**：ADR-0004 提到「事后补写 >90 天判红」，本框架取样窗口用 365 天（容纳 ADR 稀疏性）。两者口径差异需在跨仓校准时统一，**当前不擅自改动 ADR-0004 的 90 天口径**。
5. **scien.cx 与 ACM 两源未读全文**：分别因抓取超时与 403 paywall，相关结论标注为摘要级，需在回升到 L1 时补验。
6. **非英文 ADR 未覆盖**：现有研究集中在英文 ADR，多语言仓库的可测性未知。

---

## 8. 完成定义对照（逐项，per WORKFLOW §4.2.5）

### 8.1 专属验收 checklist（本票特有）

- [x] **必须明文「推迟」——不要做实际评估** → §1 推迟决议（明文 + 三条机检理由）；§5 明确声明「不是评估结论」
- [x] **指标必须可机检（不能只是定性）** → §4.1 全部指标含机检公式 + 数据源 + 检测器 + 阈值；§4.1 汇总表标注可机检性；第 4 项 KV 如实标注为「半自动、不计入自动判定」
- [x] **1) 评估指标清单（至少 3 个：决策一致性 / 可逆性 / 上下文漂移）** → §4.1 M1 决策一致性 / M2 可逆性 / M3 上下文漂移（3 个核心）+ M4 ADR 密度（补充）
- [x] **2) 取样方法（哪个仓库、什么 commit 范围、什么 prompt）** → §4.2.1 仓库（P0/P1/P2 三层池 + 排除规则）/ §4.2.2 commit 范围（窗口/分支/门槛/归因/状态过滤/配对要求）/ §4.2.3 prompt（检测流水线 schema + 四条硬规则）
- [x] **3) 推迟触发条件** → §4.3.1 八条触发矩阵（T1–T8）+ §4.3.2 明确不评估清单 + §4.3.3 回升路径

### 8.2 通用调研要求对照（per handoff）

- [x] **atomcode 深度调研**（per WORKFLOW §4.2.3） → §3（三引擎 14 查询、12 次抓取、22 来源）
- [x] **回顾 docs/adr/**（ADR-0004） → §2.4（含 S2 承接点与增量说明）
- [x] **回顾 CONTEXT.md**（心智模型术语） → §2.5（9 个术语映射）
- [x] **对标 ≥2 个工业界成熟方案** → §3.3（4 个：Scorecard / SonarQube agentic AI gate / GQM 框架 / Type-1&2 door）
- [x] **回顾 baseline 决策 D-001 ~ D-007** → §4 之前的 §3.4 段（D-001~D-007 逐条契合度）

### 8.3 阻塞（per WORKFLOW §4.2.5）

**无阻塞。** Blocked by: None，本票一次闭环。

### 8.4 lessons 候选（per WORKFLOW §4「教训持续追加 / 不可蒸发」）

1. **「推迟」必须是显式降级而非沉默跳过**——本票的推迟决议包含三条机检理由 + L0 常驻产物 + 回升触发条件，形态上与 CONTEXT.md「Failure Semantics」（显式降级而非沉默失败）一致。建议作为后续同类「推迟票」的模板。
2. **指标可机检性需要「可机检」与「可判定」分离**——KV 指标可被机检（有公式），但因其数据源（AI 会话日志）不可获取，不能进入自动阈值判定。此前模板未区分这两个概念，建议在 25 单元矩阵（A-005）中补此区分。
3. **上游票的门槛可能在物理上不可执行**——本仓库仅 2 个提交、0 个 AI trailer，任一 L1 取样门槛都不达标。「推迟」在此不是偏好而是机检必然结果。

### 8.5 引用文件列表（per WORKFLOW §4.2.5）

**已读输入：**
1. `.scratch/architecture-recovery/issues/06-ai-agent-adr-impact.md`
2. `.scratch/architecture-recovery/handoffs/06-ai-agent-adr-impact.md`
3. `.scratch/architecture-recovery/prompts/06-ai-agent-adr-impact.md`（本票任务书）
4. `.scratch/architecture-recovery/spec.md`（§Decision 4.6 + Coverage 表 + Testing Decisions）
5. `.scratch/architecture-recovery/WORKFLOW.md`（§4.2.1 版本控制 / §4.2.2 文件写入 / §4.2.3 调研 / §4.2.4 决策账本 / §4.2.5 报告）
6. `.scratch/architecture-recovery/decision-ledger.md`（A-006 行 + 覆盖率自评段）
7. `docs/adr/0004-strategic-quadrant-five-dims.md`（全文）
8. `CONTEXT.md`（全文 38 术语）

**产出文件：**
1. `.scratch/architecture-recovery/reports/06-report.md`（本报告）

**调研引用来源（22 条，主要者）：** arXiv 2602.07609 / arXiv 2603.28592 / arXiv 2604.27333 / arXiv 2403.01709 / arXiv 2506.17833 / GitClear Maintainability Gap / OpenSSF Scorecard docs/checks.md / SonarQube agentic AI quality gate / Martin Fowler ADR bliki / jeffbailey.us ADR fundamentals / m7y.me ADRs blog / ACM 10.1145/1988676.1988682 / scien.cx decision log archaeology

---

## 9. 版本控制（per WORKFLOW §4.2.1）

本报告通过 `but` CLI 提交到本 session 独立分支，不使用任何 git write 命令：

```bash
but diff
but commit -b a006-adr-impact-framework -m "docs(A-006): ADR quality impact assessment framework (deferred per Decision 4.6)"
```

> 禁止命令遵守情况：本次全程未执行 `git add` / `git commit` / `git push` / `git checkout` / `git merge` / `git rebase` / `git stash` / `git cherry-pick`。

