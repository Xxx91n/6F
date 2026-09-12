# S4 工具链 · 01 — LLM 假设抽取 Prompt 模板 v1（带 few-shot）

> 票 #03 / A-003 / spec.md §Decision 4.3。本文件是工具链**阶段 1（LLM 抽取）**的可复用产物。
> 阶段 0（预处理：只取 status: accepted 的 ADR）与阶段 2（人工抽检）见 [03-spotcheck-checklist.md](03-spotcheck-checklist.md)；
> 阶段 3（周期性失效检测）与可复用边界见 [03-reusability.md](03-reusability.md)。
> 借鉴来源：InfoQ Agentic Fitness Functions「ADR Drift Monitor」专节（evidence contract / structured verdict）、Assumption Mapping（Bland/Strategyzer，importance × evidence 两轴）、AADF/Yang 2018（假设五类）、FPF arXiv:2601.21116（valid_until）、arXiv:2602.07609（LLM 判定边界 → 双模型分歧升级）、LangExtract（few-shot 2-3 示例）、collinwilkins（requires_human_review 路由字段）。

## 使用方式
- 输入：单份 ADR 全文（markdown，MADR/Nygard 模板均可）+ 元数据（adr_id / status / date）
- 输出：符合下方 JSON Schema 的严格 JSON（模型需支持 JSON schema 约束输出，strict 模式；校验失败把 ValidationError 回喂修复，最多 2 轮；温度 0）
- 可选强化：双模型独立抽取，diff 出分歧项 → 分歧项 requires_human_review=true（per arXiv:2602.07609 多模型管线）

## System Prompt（可直接复制）

你是 ADR 假设抽取器。输入是一份架构决策记录（ADR），你的唯一任务是：抽取「该决策成立所依赖的前提（assumptions）」，输出严格 JSON，不做任何评价或建议。

抽取规则：
1. 只抽前提，不抽决策本身、不抽背景陈述。被否选项的「否决理由中蕴含的前提」要抽（记 rejected_option_premise=true）。
2. 每条假设必须带 quote_span：从 ADR 原文逐字复制、跨度 ≤50 字的引用。原文中找不到依据的推测一律禁止输出。
3. 负向声明是一等公民：ADR 中的 out-of-scope 排除、"不做 X"、"仅作参照不进判据"类语句抽为 scope_guard 类假设（它们失效 = 边界被突破，同样需要监控）。
4. 不可证伪表述（如"保持高质量"）不得原样输出：能改写为可观察信号的改写后输出（rewritten=true，并给出改写依据 quote_span）；无法改写的放入 rejected 并给 reject_reason。
5. category 五类（AADF/Yang 2018）：business（用户意图/市场）/ technical（技术前提）/ org（组织/流程）/ env（环境/外部依赖）/ qa（质量属性）。
6. 每条假设必须给：falsifiable 自评 0-3（3=有明确可观察失效信号；0=不可证伪）、importance（失效后是否动摇本决策：high/medium/low）、evidence_level（none/weak/strong：决策文本中是否已有支撑证据）、signal_type（metric/incident/cost/dep/ownership/process 五种证据域，对齐 InfoQ drift monitor）、invalidation_condition（"若看到 X 则本假设失效"一句）、valid_until（ISO 日期或 "unknown"）。
7. requires_human_review=true 的触发条件：falsifiable ≤ 1；quote_span 跨度模糊或需要跨句拼接；假设引用了其他 ADR（跨 ADR 引用）；从原文到假设的推断链超过 1 步；generalization=true（从单案例归纳的因果断言）。
8. 输出只能是 JSON，无任何解释文字。

## User Prompt 模板

```
ADR_ID: {{adr_id}}
ADR_STATUS: {{status}}
ADR_DATE: {{date}}
TODAY: {{today}}

ADR 全文：
{{adr_text}}

请输出符合 schema 的 JSON。
```

## 输出 JSON Schema v1

```json
{
  "type": "object",
  "required": ["adr_id", "assumptions", "rejected"],
  "properties": {
    "adr_id": { "type": "string" },
    "assumptions": {
      "type": "array",
      "items": {
        "type": "object",
        "required": ["id", "quote_span", "statement", "category", "falsifiable", "importance", "evidence_level", "signal_type", "invalidation_condition", "valid_until", "requires_human_review"],
        "properties": {
          "id": { "type": "string", "pattern": "^AS-[0-9]{4}-[0-9]{2}$" },
          "quote_span": { "type": "string", "maxLength": 120 },
          "statement": { "type": "string" },
          "category": { "enum": ["business", "technical", "org", "env", "qa"] },
          "falsifiable": { "type": "integer", "minimum": 0, "maximum": 3 },
          "importance": { "enum": ["high", "medium", "low"] },
          "evidence_level": { "enum": ["none", "weak", "strong"] },
          "signal_type": { "enum": ["metric", "incident", "cost", "dep", "ownership", "process"] },
          "invalidation_condition": { "type": "string" },
          "valid_until": { "type": "string" },
          "requires_human_review": { "type": "boolean" },
          "scope_guard": { "type": "boolean" },
          "rejected_option_premise": { "type": "boolean" },
          "generalization": { "type": "boolean" },
          "rewritten": { "type": "boolean" },
          "cross_adr_refs": { "type": "array", "items": { "type": "string" } }
        }
      }
    },
    "rejected": {
      "type": "array",
      "items": {
        "type": "object",
        "required": ["quote_span", "reason"],
        "properties": {
          "quote_span": { "type": "string" },
          "reason": { "enum": ["unfalsifiable", "is_decision_itself", "background_not_premise", "no_textual_basis"] }
        }
      }
    },
    "extraction_meta": {
      "type": "object",
      "properties": {
        "model": { "type": "string" },
        "prompt_version": { "type": "string" },
        "repair_rounds": { "type": "integer" },
        "schema_valid": { "type": "boolean" }
      }
    }
  }
}
```

## Few-shot 示例（合成样例，非本仓库 ADR —— 保证 6 个真实抽取案例未被模板污染）

### 示例 1：标准抽取

输入（合成 ADR）：

```
ADR_ID: 9001  STATUS: accepted  DATE: 2026-06-01
# 选择 DuckDB 作为事实底座
我们选择 DuckDB 存储跨 scale 审计事实，因为当前数据量低于 100GB 且团队只有 2 名数据工程师，
不需要分布式数据库的运维成本。曾考虑 ClickHouse，但其集群运维对 2 人团队过重。
```

期望输出：

```json
{
  "adr_id": "9001",
  "assumptions": [
    {"id": "AS-9001-01", "quote_span": "当前数据量低于 100GB", "statement": "We believe that 审计事实数据总量将保持在 100GB 以内", "category": "technical", "falsifiable": 3, "importance": "high", "evidence_level": "weak", "signal_type": "metric", "invalidation_condition": "若 fact table 体积或日增量预测显示将超 100GB，本假设失效，需重评 ADR-9001", "valid_until": "unknown", "requires_human_review": false, "scope_guard": false, "rejected_option_premise": false, "generalization": false, "rewritten": false, "cross_adr_refs": []},
    {"id": "AS-9001-02", "quote_span": "团队只有 2 名数据工程师", "statement": "We believe that 数据工程团队规模维持在 2 人（不设专职 DBA/平台组）", "category": "org", "falsifiable": 3, "importance": "high", "evidence_level": "strong", "signal_type": "ownership", "invalidation_condition": "若数据工程岗位编制变化（扩到有专职运维分组），单机选型的运维成本前提失效", "valid_until": "unknown", "requires_human_review": false, "scope_guard": false, "rejected_option_premise": false, "generalization": false, "rewritten": false, "cross_adr_refs": []}
  ],
  "rejected": [
    {"quote_span": "不需要分布式数据库的运维成本", "reason": "is_decision_itself"}
  ],
  "extraction_meta": {"model": "{{model}}", "prompt_version": "v1", "repair_rounds": 0, "schema_valid": true}
}
```

### 示例 2：边界情况（负向声明 + 不可证伪改写 + 拒绝项 + 被否选项前提）

输入（合成 ADR）：

```
ADR_ID: 9002  STATUS: accepted  DATE: 2026-07-10
# 竞品分析不进入评分
本产品坚持审计中立：竞品功能对比仅作心智参照，绝不进入判据数据源，避免评分被商业立场污染。
保持行业领先的评分质量是我们的追求。
曾考虑直接引入 Gartner 象限数据，被否：该数据按付费客户立场裁剪，与中立冲突。
```

期望输出：

```json
{
  "adr_id": "9002",
  "assumptions": [
    {"id": "AS-9002-01", "quote_span": "竞品功能对比仅作心智参照，绝不进入判据数据源", "statement": "We believe that 竞品数据在判据数据源中的占比保持为 0", "category": "business", "falsifiable": 3, "importance": "high", "evidence_level": "none", "signal_type": "process", "invalidation_condition": "若任一 rubric 的数据源清单出现竞品数据集，边界被突破，本假设失效", "valid_until": "unknown", "requires_human_review": false, "scope_guard": true, "rejected_option_premise": false, "generalization": false, "rewritten": false, "cross_adr_refs": []},
    {"id": "AS-9002-02", "quote_span": "保持行业领先的评分质量是我们的追求", "statement": "We believe that 产品评分质量处于行业第一梯队（改写：评分在第三方对测中进入前 25%）", "category": "qa", "falsifiable": 1, "importance": "medium", "evidence_level": "none", "signal_type": "metric", "invalidation_condition": "若存在公开对测且评分稳定低于第 75 百分位，本假设失效", "valid_until": "unknown", "requires_human_review": true, "scope_guard": false, "rejected_option_premise": false, "generalization": false, "rewritten": true, "cross_adr_refs": []},
    {"id": "AS-9002-03", "quote_span": "该数据按付费客户立场裁剪，与中立冲突", "statement": "We believe that Gartner 象限数据的裁剪立场与审计中立要求不兼容", "category": "business", "falsifiable": 2, "importance": "low", "evidence_level": "none", "signal_type": "process", "invalidation_condition": "若 Gartner 公开可复核的中立数据集且授权允许，被否选项需重评", "valid_until": "unknown", "requires_human_review": false, "scope_guard": false, "rejected_option_premise": true, "generalization": false, "rewritten": false, "cross_adr_refs": []}
  ],
  "rejected": [],
  "extraction_meta": {"model": "{{model}}", "prompt_version": "v1", "repair_rounds": 0, "schema_valid": true}
}
```

## 假设失效集对照表模板（vs InfoQ ADR Drift Monitor 理念清单）

> spec.md §Decision 4.3 要求交付本对照表。用法：每行把 InfoQ 理念条目映射到本工具链对应物；「处置」列只允许 采纳 / 改造 / 不采纳 + 一句理由。新工具链版本发布时必须重跑本表。

| # | InfoQ ADR Drift Monitor 理念条目 | 本工具链对应物 | 处置 + 理由 |
|---|---|---|---|
| 1 | 监控对象 = ADR 假设 vs 现实证据（指标/事故/成本/依赖/部署/所有权） | 阶段 3 周期比对，signal_type 枚举与其六证据域对齐 | 采纳（枚举直接复用） |
| 2 | 4-part anatomy：intent / evidence contract / agentic judge / structured verdict | intent=S4 演化方向判据；evidence contract=signal_type 指向的证据域；judge=抽取+复核回路；verdict=CONFIRMED/PARTIAL-DRIFT/DRIFT/INSUFFICIENT-EVIDENCE/EXPIRED | 采纳（verdict 词表借自 codearbiter 分级） |
| 3 | 假设为自然语言、由 agent 从 ADR 提取 | quote_span 强制原文锚点（比 InfoQ 更强：对抗幻觉） | 改造（加证据锚点） |
| 4 | 失效判定 = evidence-bound，不做 oracle 断言 | invalidation_condition 必填 + 假设失效判定必须引用证据，无证据标 INSUFFICIENT-EVIDENCE | 采纳 |
| 5 | 人工回路：校准集 20-50 例 / 低置信升级 / rubric 走评审 / 重复发现固化 | 阶段 2 抽检 checklist：全量(≤30 条)或分层 ≥10%；escalation 100%；复核修正回流 few-shot 候选池 | 采纳（校准集规模留待真实语料 ≥20 例时启用） |
| 6 | 6 失败模式表（position/verbosity/self-enhancement bias、non-determinism、prompt injection、rubric drift） | checklist F1-F6 失败模式速查 + prompt_version 版本化 + 温度 0 | 改造（LLM 抽取场景下 bias 表裁剪为 F1-F6） |
| 7 | 确定性门禁优先，agent 只补判断密集环节 | 确定性失效信号（如"数据源清单是否含 X"）先走 grep/机检，agent 只处理语义假设 | 采纳（见 reusability §集成点） |
| 8 | 重复发现固化为确定性规则 | 复核修正项季度评审后可固化为机检（如 ADR-0003 的 Arcalea/PMI 数据源检查） | 采纳 |
| 9 | agentic 检查不阻断构建，只提示复核 | 假设失效判定不自动改 ADR status，只产出 drift 报告 + verdict-gate 印记 | 采纳（与 ADR-0006 verdict-gate 可追溯一致） |
| 10 | 无提示词、无 schema、无抽样率（理念文） | 本模板补齐：System Prompt + JSON Schema + 抽样率 + few-shot | 不采纳处即本工具链的存在理由（A-003：InfoQ 仅为理念文，需自建） |

## 与 A-005 矩阵 S4 行的对齐（per spec §Decision 4.5：单维决策必须能填入矩阵对应行）

- 判据定义 → assumptions 的 falsifiable/importance 分级 + invalidation_condition
- 数据源 → quote_span（ADR 原文）+ signal_type（五证据域）
- 阈值初版 → falsifiable ≥2 采纳、=1 升级复核、=0 拒绝；抽样率 ≤30 条全量 / 否则 ≥10%
- 跨仓校准机制 → valid_until + 90 天校准窗口（沿用 A-005 落盘的 expires 2026-12-10 参数）

---

*版本：v1（2026-09-11，票 #03）。修改本模板必须递增 prompt_version 并在 03-report.md 记录变更原因。*
