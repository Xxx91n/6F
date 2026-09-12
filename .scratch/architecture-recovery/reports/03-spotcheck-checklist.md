# S4 工具链 · 02 — 人工抽检 Checklist v1

> 票 #03 / A-003。本文件是工具链**阶段 2（人工抽检复核）**的可复用产物。
> 硬规则：**LLM 抽取结果必须经过抽检，不能跳过**；任何下游（S4 评分、A-006 M3、A-005 矩阵 S4 行消费）不得直接消费未经抽检的 assumptions。

## 复核位与独立性要求
- 抽取者与复核者**不得是同一上下文实例**：LLM 抽取窗口 ≠ 复核窗口（独立性是抽检的价值来源）。
- 本仓库现状：无人类常驻复核位，由**独立复核窗口**（全新上下文 agent 实例 + 本 checklist + 只读 ADR 原文）代行人工抽检；每条复核标记记录 reviewer 标识与日期；**仓库所有者保留终审否决权**（分支评审/合并时行使）。
- 复核窗口输入只有三样：本 checklist、待复核的 assumptions（不含抽取方 invalidation 预判之外的自评理由）、ADR 原文。禁止向复核窗口展示抽取过程的自我解释，防止锚定（per InfoQ position bias 防线）。

## 抽样策略
- 语料 ≤30 条假设：**全量复核**（本票 6 案例 × ~4 条即属此类）。
- 语料 >30 条：按 category × signal_type 分层抽样 ≥10% 且 ≥30 条；escalation 项 100% 复核。
- escalation（无条件全查）：requires_human_review=true；falsifiable ≤1；quote_span 无法在原文逐字定位；跨 ADR 引用；generalization=true。

## 每条假设复核步骤（0-3 量表，逐条走）
1. **引文核验**：quote_span 在 ADR 原文中逐字存在、跨度合规 → 否则记 F1（幻觉/伪造引文），直接 0 分。
2. **前提性核验**：是"决策成立依赖的前提"，而非决策本身、背景或被否选项内容（被否选项的*理由前提*除外）→ 否则记 F2（过度抽取），0 分或转入 rejected。
3. **可证伪核验**：invalidation_condition 是否可观察（能说出"看到什么证据即失效"）→ 否则记 F3（不可证伪），≤1 分。
4. **类别核验**：category 五类（business/technical/org/env/qa）是否贴切 → 错标记 F4，扣 1 分。
5. **负向声明漏抽**：原文中的 out-of-scope/被否理由是否被漏抽 → 漏抽记 F5，补抽后作为新条目复核。
6. **跨 ADR 引用核验**：cross_adr_refs 指向的 ADR 是否存在、引用语义是否成立 → 断裂记 F6。

评分：**3** = 完全正确可直接采纳；**2** = 假设正确但 invalidation_condition 需补强；**1** = 方向正确但表述/类别/信号类型有错，修正后采纳；**0** = 拒绝（记录 F 编号 + 理由）。

## 失败模式速查（F1-F6，对齐调研来源）
| 编号 | 失败模式 | 判据 | 调研依据 |
|---|---|---|---|
| F1 | 幻觉假设/伪造引文 | quote_span 非原文逐字 | arXiv:2602.07609 无依据推断 8.7% |
| F2 | 过度抽取 | 把决策/背景/被否选项当前提；同义复述决策 | 2602.07609 语义误解 44.57% |
| F3 | 不可证伪 | invalidation_condition 说不出可观察证据 | Assumption Mapping "testable, precise, discrete" |
| F4 | 类别错标 | category 与内容明显不符 | AADF 四视角定义 |
| F5 | 漏抽负向声明 | 原文有 scope 排除但输出无 scope_guard | S4 空位与负向声明诚实度（CONTEXT.md） |
| F6 | 跨 ADR 引用断裂 | 引用目标不存在或语义不成立 | AADF Tracing 视角 |

## 案例级判定（成功/失败并存 — 硬要求）
- **成功**：≥1 条 3 分假设，且 0 分比例 <50%。
- **部分成功**：有 ≥1 条被采纳，但过半需修正或存在被拒项。
- **失败**：0 条可用（全拒/全幻觉）。
- **失败案例必须原样保留**（初跑输出 + 拒绝理由 + 修复轮记录），不得重跑到"洗白"为止；失败原因回写模板 few-shot 候选池。

## 复核结果回写格式
每条假设追加：
```
review: { reviewer: "<复核位标识>", date: "<ISO 日期>", score: 0-3, verdict: adopt|fix|reject, failure_modes: [F1-F6], fix_note: "<修正内容或空>" }
invalidation_final: { status: CONFIRMED|PARTIAL-DRIFT|DRIFT|INSUFFICIENT-EVIDENCE|EXPIRED, evidence: "<证据引用>", judged_by: "<复核位标识>" }
```

## 反馈闭环
- verdict=fix/reject 的修正结果进入模板 few-shot 候选池，下版模板（prompt_version v2+）评估吸收。
- rubric 本身季度重校准（防 rubric drift，per InfoQ 防线 6）；校准集在真实语料 ≥20 例后按 InfoQ 建议扩到 20-50 例。

---

*版本：v1（2026-09-11，票 #03）。*
