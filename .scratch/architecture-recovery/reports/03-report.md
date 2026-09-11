# Report #03 — S4 ADR 假设提取工具链（A-003 闭环报告）

## §0 开工复述（per 用户开工第一句硬要求）

> 本票 = 03 — S4 ADR 假设提取工具链（A-003，spec.md §Decision 4.3）。**Blocked by: #05**（已解除：ledger A-005 结论落盘"解锁 Wave 2 票 #01/#02/#03/#04/#14"，本窗口开工时复核该落盘存在）。必读清单全部读全：`issues/03-s4-adr-assumption-extraction.md`、`handoffs/03-s4-adr-assumption-extraction.md`、`spec.md §Decision 4.3`、`WORKFLOW.md §4.2`（含 §4.2.1 版本控制：全部版本控制走 but CLI / 独立分支 / commit 带 A-NNN）、`decision-ledger.md A-003`、`docs/adr/0004-*.md`。版本控制遵循 WORKFLOW §4.2.1（but CLI，独立分支）；通用调研要求遵循 handoff（atomcode 深度调研 + 回顾 docs/adr + CONTEXT.md + ≥2 工业对标）；报告收口本文件。

## §1 完成定义对照（逐项，per handoff 完成定义 = issue 专属验收）

| # | 完成定义项 | 状态 | 证据 |
|---|---|---|---|
| 1 | LLM 抽取 prompt 模板（带 few-shot） | **DONE** | [03-extraction-prompt.md](03-extraction-prompt.md)：System Prompt 8 条抽取规则 + JSON Schema v1（15 字段含 quote_span 强制原文锚点 / requires_human_review 路由字段）+ 2 个合成 few-shot 示例（标准抽取 + 边界情况） |
| 2 | 人工抽检 checklist | **DONE** | [03-spotcheck-checklist.md](03-spotcheck-checklist.md)：6 步复核步骤 + 0-3 量表 + 抽样策略（≤30 全量 / >30 分层 ≥10%）+ escalation 全查规则 + F1-F6 失败模式速查 + 回写格式 + 反馈闭环 |
| 3 | ≥5 个 ADR 完整抽取案例（抽取结果 + 人工复核标记 + 假设失效判定） | **DONE（超额：6 案例）** | [03-extraction-cases.md](03-extraction-cases.md)：ADR-0001/0002/0003/0004/0005/0007 共 **25 条假设**，每条含抽取 JSON + 复核位标记（score/verdict/failure_modes/fix_note）+ 失效终判（status/evidence/judged_by）；引文核验 25/25 逐字命中 |
| 4 | 工具链 reusable 程度说明 | **DONE** | [03-reusability.md](03-reusability.md)：组件×层级矩阵（L0/L1/L2）+ 与 A-005 矩阵 S4 行 / A-002 / A-006 / A-018 / D-006 的集成点 + 5 条已知限制 + 迁移成本估计（<1 agent-day） |

### 检查点对照（issue 专属 delta）
- **LLM 抽取结果必须经过人工抽检（不能跳过）**：**已执行，未跳过**——独立复核窗口（全新上下文 agent 实例 agent_90cb5c4c）按 checklist 对 25/25 条全量抽检（≤30 条全量规则），与抽取位（本主窗口）上下文隔离、未接触抽取方自评理由；本仓库无人类常驻复核位，独立窗口代行 + 用户终审否决权保留（见 checklist §复核位声明）。回路价值有实证：复核位捕获抽取位自察不到的生成残渣 token（AS-0005-01 "Đây"）与 4 处语气硬化/类别错标。
- **失败案例与成功案例并存（不要只挑好做的）**：success ×3（0001/0003/0007）+ partial ×3（0002/0004/0005），case-level failure ×0；失败以条目级并存且原样保留：F2×2、F3×2、F4×1、生成残渣×1、修复轮×2、rejected×4——无重跑洗白（per checklist"失败案例必须原样保留"）。选样含全仓最短最密难点样本 0002 与心智声明雷区 0004。
- **spec §Decision 4.3 附加：LLM 抽取 + 人工复核回路（不能只信 LLM）**：见上；回路为工具链阶段 2 硬规则并实际运行。
- **spec §Decision 4.3 附加：假设失效集对照表模板（vs InfoQ ADR Drift Monitor 理念清单）**：[03-extraction-prompt.md](03-extraction-prompt.md) §对照表——10 行理念映射（监控对象 / 4-part anatomy / 假设表示 / 失效判定 / 人工回路 / 6 失败模式 / 确定性优先 / 固化规则 / 不阻断 / 理念文缺口），每行标注采纳/改造/不采纳+理由。

## §2 阻塞

无。Blocked by #05 已解除（ledger A-005 落盘 + reports/05-matrix-check.mjs PASS 在案）。本票未发现新的上游阻塞；产出的 GapRequest 见 §6（均为后续动作，不阻塞本票闭环）。

## §3 atomcode 深度调研段（per WORKFLOW §4.2.3，carrier 真实执行）

- **carrier**：atomcode 5.0.9 (52ca5e6)，ctx_batch_execute 串行单调用（concurrency=1, timeout=600s），三引擎（Exa+Tavily+AnySearch）+ 原文精读，输出已索引（17 sections）。**无 carrier 缺口**（对比：票 #17 曾 carrier 不可用，本票 carrier 可用并真实执行）。
- **baseline 决策回顾（D-001~D-007）**：本票只服务 D-004 战略 quadrant（S4 演化方向维），与 D-005 集成层无耦合（drift 报告走 D-006 报告模板）；不触碰 D-001（5 scale）/D-002（无 MVP）/D-003（边界）——抽取案例证实三者的 scope_guard 假设当前全部 CONFIRMED。
- **当前决策（spec §Decision 4.3）落点**：InfoQ ADR Drift Monitor 实为《Agentic Fitness Functions》（infoq.com, 2026-08-17）第五节第 3 例，非独立文章——原文确认其"不可直接复用"（无 prompt/无 schema/无抽样率/无完整实现），与 A-003"InfoQ 仅为理念文，需自建"的登记完全吻合。
- **目标仓库现状**：7 条 ADR 均 accepted；05-unit-matrix.json S4 行已有判据/数据源/阈值（本工具链输出按 reusability §集成点回填该行）；17 commits；A-002 已扫 169 ADR（本仓 7 条的元数据可用其清单交叉验证）。
- **调研关键结论（已采纳进工具链）**：4 阶段流水线（预处理 accepted-only → schema 约束抽取 → 人工抽检 → 周期失效比对）；few-shot 2-3 示例（LangExtract）；quote_span 强制原文锚点对抗幻觉（2602.07609：无依据推断 8.7%）；requires_human_review 路由字段（collinwilkins 生产模式）；抽样 5-10% 基线（Braintrust/label-your-data）；valid_until 时间戳（FPF：23% 决策两月内过期、86% 仅事故中发现）；确定性优先（InfoQ"确定性门禁仍是门禁"）。
- **调研报告全文**：见 ctx 知识库索引（atomcode ADR assumption extraction research，17 sections，含 20 条来源 URL 清单）。

## §4 工业对标（≥2 要求，实际 5 个）

| 对标 | 借鉴 | 落点 |
|---|---|---|
| **Assumption Mapping**（Bland/Strategyzer 2020，产品发现） | importance × evidence 2×2 优先级、"testable, precise, discrete" 假设书写、致命假设先测 | importance/evidence_level 字段 + 不可证伪改写规则 |
| **AADF / Yang 2018 / Kruchten 2006**（架构假设管理学术线） | 假设五类（business/technical/org/env/qa）、假设=无证据当作真、假设↔决策追踪 | category 枚举 + cross_adr_refs 字段 |
| **FPF**（arXiv:2601.21116，2026-01） | valid_until 时间戳 + 证据衰减跟踪（23%/86% 实证） | valid_until 字段 + EXPIRED 判定（AS-0004-02 已挂 2026-12-10 定时点） |
| **LLM 检测 ADR 违规实证**（arXiv:2602.07609，2026-02，980 ADR） | LLM 判定边界（83.38% 一致率；语义误解 44.57%）→ 人工必须留回路 | 双模型分歧升级设计 + 抽检不可跳过依据 |
| **InfoQ ADR Drift Monitor**（2026-08） | 周期比对 + evidence contract + 结构化裁决 + 升级规则 | 阶段 3 骨架 + 10 行对照表（见模板文件） |

## §5 交付物清单

| 文件 | 内容 |
|---|---|
| [03-extraction-prompt.md](03-extraction-prompt.md) | 阶段 1：prompt 模板 v1（few-shot 合成样例）+ JSON Schema v1 + 假设失效集对照表模板（vs InfoQ）+ A-005 矩阵 S4 行对齐 |
| [03-spotcheck-checklist.md](03-spotcheck-checklist.md) | 阶段 2：人工抽检 checklist v1（独立性/抽样/6 步/F1-F6/案例判定/回写/闭环） |
| [03-extraction-cases.md](03-extraction-cases.md) | 6 ADR × 25 假设完整案例：抽取结果 + 复核标记 + 失效终判 + 补抽 3 条 + 分歧与失败模式分析 |
| [03-reusability.md](03-reusability.md) | 阶段 3 + 复用边界：组件×层级矩阵 + 集成点 + 已知限制 |
| [03-report.md](03-report.md) | 本文件 |

## §6 Sufficiency Gate 信息缺口（data doesn't show / GapRequest）

1. **AS-0001-03 PARTIAL-DRIFT 待裁决**：ADR-0001"四象限只在 Macro-B 内有效" vs ADR-0004/CONTEXT.md"战略 quadrant 每 scale 一份"存在未明文豁免的张力（矩阵 25 格在案）。→ **GapRequest：交首脑复核/verdict-gate 裁决**（本票不代裁——对照表第 9 行：失效判定不自动改 ADR status）。这是 S4 drift 报告的第一个真实案例。
2. **11 原文清单 artifact 未落盘**：ADR-0004 引用的调研来源无仓库内清单 → AS-0004-05 无法独立复核引用是否失实（INSUFFICIENT-EVIDENCE）。→ GapRequest：落盘调研来源清单文件。
3. **竞品格局无扫描 artifact**：AS-0004-03"全行业唯一空位"无法确认或否认（INSUFFICIENT-EVIDENCE）。→ GapRequest：Macro-A 战略叙事票可接竞品扫描观察面。
4. **抽样率无行业标准**：5-10%/全量阈值为初版参数（实践区间来源 Braintrust/label-your-data），按 A-005 校准机制 90 天窗口重校。
5. **双模型分歧机制未实测**：本票单模型运行，机制标记待启用（reusability §已知限制 2）。
6. **本票不能证明**：工具链在真实代码仓（incident/cost/ownership 证据域在案）的表现——spec-level 仓证据面偏窄（reusability §已知限制 1）。

## §7 lessons 候选（per WORKFLOW §4.2.5；已同步 1 行至 WORKFLOW §4）

1. **抽检回路价值首获实证**：独立复核位捕获抽取位自察不到的生成残渣（"Đây"）与 F2 语气硬化——"LLM 抽取不能只信 LLM"（A-003 硬约束）从流程口号变成 measured 事实。statement 类自由文本字段必须过独立上下文复核。
2. **合成 few-shot 保测试集干净**：模板 few-shot 用合成样例（非仓库 ADR）→ 6 个真实案例全部是模板的干净实测，无考题泄漏。模板类票通用做法。
3. **抽取位应喂全仓证据**：evidence_level 系统性低估（4 条在 CONTEXT.md/ledger 有强证据仍标 none/weak）——根因是抽取位只见 ADR 单文；阶段 0 预处理应把 CONTEXT.md 术语表 + ledger 状态喂给抽取位，可减少复核修正量。
4. **确定性优先实测成立**：AS-0003-04 失效信号是 grep 可测（PMI/Arcalea 在矩阵中 0 次出现），机检直接 CONFIRMED——"能 grep 的不进 LLM"应成为 S4 检测的默认分流。
5. **PARTIAL-DRIFT 首案**：工具链首跑即抓到 ADR-0001↔ADR-0004 张力，S4 假设监测有效性的第一个正例；张力裁决留给 verdict-gate，不自动改 status。

## §8 引用文件列表

**必读清单（全读）**：issues/03-s4-adr-assumption-extraction.md · handoffs/03-s4-adr-assumption-extraction.md · spec.md（§Decision 4.3 + 全文）· WORKFLOW.md（§4.2 全节 + §4 Lessons）· decision-ledger.md（A-003 + A-005/A-017 等）· docs/adr/0004-strategic-quadrant-five-dims.md
**抽取语料**：docs/adr/0001/0002/0003/0005/0007（+0006 经 cross_refs 覆盖）
**证据文件**：CONTEXT.md（仓库根）· reports/05-unit-matrix.json（机检 Arcalea/PMI/团队拓扑/承诺密度=0）· reports/05-report.md · decision-ledger.md（A-002/A-004/A-007/A-017 落盘）
**外部来源**：InfoQ Agentic Fitness Functions（2026-08-17）· Strategyzer Assumption Mapping（2020-08-04）· arXiv:2601.21116（FPF）· arXiv:2602.07609（LLM ADR 违规检测）· arXiv:2501.10868（JSONSchemaBench）· LangExtract prompt 文档 · Braintrust HITL · AADF（Yang/Liang JSS 2017）· Kruchten 2006 · ATAM（SEI）——完整 URL 清单见 atomcode 调研索引
**产出**：§5 交付物 5 文件 + 收尾回写（decision-ledger.md A-003 行+结论段 · WORKFLOW.md §4 1 行 · issues/03 状态）
**提交面处置（per 票 #04 先例）**：本票自有文件（reports/03-* ×5 + issues/03）已提交分支 `ticket-03-s4-assumption-toolchain`；decision-ledger.md / WORKFLOW.md 的闭环行与其他窗口（#01/#04/#14）的未提交编辑交织于同一 hunk（依赖 vxs 谱系 + 并发 W2/W3 编辑），无法按 hunk 干净隔离——保留在 zz 暂存区（磁盘已落盘），交首脑窗口统一收口，不代提交他人工作。

---
*票 #03 / A-003 · 2026-09-11 · 抽取位=主窗口（GLM-5.3-Flash）· 复核位=独立窗口 agent_90cb5c4c · 版本控制=but 独立分支（WORKFLOW §4.2.1）*
