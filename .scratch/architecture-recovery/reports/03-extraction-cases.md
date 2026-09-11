# S4 工具链 · 03 — ADR 假设抽取案例（6 ADR · 25 假设 · 成功与失败并存）

> 票 #03 / A-003 / spec.md §Decision 4.3。阶段 0 预处理：docs/adr/ 全部 7 条 status: accepted，本票选样 6 条（0006 交付物被 AS-0007-02 经 cross_refs 覆盖，其负向声明由复核位补抽，见 §补抽）。
> **选样理由（不挑好做的）**：0001（跨 ADR 引用 + 张力面）、0002（全仓最短最密、归纳链最长 = 难点样本）、0003（负向声明密集）、0004（falsifiable=1 心智声明雷区 + 定时失效点）、0005（最长的技术排他论证）、0007（跨票依赖 A-017/A-018）。
> **few-shot 未污染声明**：prompt 模板的 few-shot 用合成样例（AS-9001/9002），非本仓库 ADR，6 个案例均为模板 v1 的干净实测。
> **复核位声明**：抽取位 = 本主窗口 LLM；复核位 = 独立全新上下文 agent 实例（agent_90cb5c4c），按 [03-spotcheck-checklist.md](03-spotcheck-checklist.md) 代行人工抽检（本仓库无人类常驻复核位，仓库所有者保留终审否决权）。抽样 = 全量 25/25（≤30 条规则）。复核位独立读 ADR 原文逐字核验引文，未接触抽取方自评理由。
> **案例级判定（复核位定）**：success ×3（0001/0003/0007），partial ×3（0002/0004/0005），case-level failure ×0。失败以条目级失败模式并存记录：F2×2、F3×2、F4×1、生成残渣 1 处（AS-0005-01"Đây"）、修复轮 2 次、rejected 4 条——全部原样保留未洗白。

## 汇总

| ADR | 假设数 | escalation | rejected | 修复轮 | adopt/fix | 案例判定 |
|---|---|---|---|---|---|---|
| 0001 | 4 | 2 | 1 | 1 | 3/1 | success |
| 0002 | 3 | 1 | 1 | 1 | 2/1 | partial |
| 0003 | 4 | 2 | 0 | 0 | 3/1 | success |
| 0004 | 5 | 1 | 0 | 0 | 2/3 | partial |
| 0005 | 5 | 2 | 1 | 1 | 2/3 | partial |
| 0007 | 4 | 1 | 1 | 1 | 2/2 | success |

## 案例 0001 — five-scale-scope　判定：**success**

- 源文件：`docs/adr/0001-*`（status: accepted）
- 复核位案例理由：4/4 引文逐字命中、前提全部成立；AS-0001-03 检出真实张力信号（战略象限已跨 scale 运行）属假设监测生效而非抽取错误；仅 AS-0001-02 的 invalidation 观察面需机检化补强。
- 修复轮记录：初跑 1 轮内完成：规则 1 自检把'差异在触发器与报告切片'转入 rejected（决策内容非前提）。
- rejected（保留不删）：
  - `差异在触发器与报告切片` → is_decision_itself

```json
{
 "adr_id": "0001",
 "assumptions": [
  {
   "id": "AS-0001-01",
   "quote_span": "用户明确要求\"都要包含、全都要\"",
   "statement": "We believe that 用户要求全 5 scale 覆盖的意图持续有效",
   "category": "business",
   "falsifiable": 3,
   "importance": "high",
   "evidence_level": "strong",
   "signal_type": "process",
   "invalidation_condition": "若用户在后续决策中明确收窄 scale 覆盖范围，本假设失效，ADR-0001 需进入 supersede 评估",
   "valid_until": "unknown",
   "requires_human_review": false,
   "review": {
    "reviewer": "independent-window/agent_90cb5c4c (全新上下文复核位)",
    "date": "2026-09-11",
    "score": 3,
    "verdict": "adopt",
    "failure_modes": [],
    "fix_note": "无需修正"
   },
   "invalidation_final": {
    "status": "CONFIRMED",
    "evidence": "CONTEXT.md(仓库根)封口'5 scale 全覆盖'；spec.md 18 项全量展开无任何 scale 收窄；05-unit-matrix.json 行 S1-S5 × 5 scale 全列在案",
    "judged_by": "independent-window/agent_90cb5c4c"
   }
  },
  {
   "id": "AS-0001-02",
   "quote_span": "5 scale 共享同一证据层（CodeLore + OpenSSF Scorecard）",
   "statement": "We believe that 全部 5 scale 共享同一证据层与裁决层",
   "category": "technical",
   "falsifiable": 2,
   "importance": "high",
   "evidence_level": "none",
   "signal_type": "dep",
   "invalidation_condition": "若任一 scale 引入私有证据层或证据层更换，共享前提失效",
   "valid_until": "unknown",
   "requires_human_review": false,
   "review": {
    "reviewer": "independent-window/agent_90cb5c4c (全新上下文复核位)",
    "date": "2026-09-11",
    "score": 2,
    "verdict": "fix",
    "failure_modes": [],
    "fix_note": "invalidation 补强为可机检面：指向 05-unit-matrix.json 各格 datasource 字段与 CONTEXT.md Scale 术语，出现 per-scale 私有数据源即失效；evidence_level 应为 strong（CONTEXT.md 与 A-005 矩阵双重在案）"
   },
   "invalidation_final": {
    "status": "CONFIRMED",
    "evidence": "CONTEXT.md Scale 术语'各 scale 共享同一套证据层（CodeLore + OpenSSF Scorecard）与裁决层（verdict-gate）'；05-unit-matrix.json 25 格数据源无 per-scale 私有证据层分化",
    "judged_by": "independent-window/agent_90cb5c4c"
   }
  },
  {
   "id": "AS-0001-03",
   "quote_span": "四象限模型（结构/行为/供应链/战略）只在 Macro-B 内有效",
   "statement": "We believe that 四象限审计模型只在 Macro-B scale 内使用",
   "category": "technical",
   "falsifiable": 2,
   "importance": "high",
   "evidence_level": "weak",
   "signal_type": "process",
   "invalidation_condition": "若出现四象限跨 scale 复用或非 Macro-B 报告引入四象限语义，本假设面临张力",
   "valid_until": "unknown",
   "requires_human_review": true,
   "review": {
    "reviewer": "independent-window/agent_90cb5c4c (全新上下文复核位)",
    "date": "2026-09-11",
    "score": 3,
    "verdict": "adopt",
    "failure_modes": [],
    "fix_note": "无需修正；张力信号已实际触发，见 invalidation_final"
   },
   "invalidation_final": {
    "status": "PARTIAL-DRIFT",
    "evidence": "ADR-0004'每维全 5 scale 覆盖'+CONTEXT.md Strategic Quadrant'覆盖全部 5 scale'+05-unit-matrix.json 25 格机检落盘——战略象限语义已跨 scale 运行，与 ADR-0001'四象限只在 Macro-B 内有效'形成未在 ADR 层明文豁免的张力",
    "judged_by": "independent-window/agent_90cb5c4c"
   }
  },
  {
   "id": "AS-0001-04",
   "quote_span": "5 scale 之间为粒度分层关系而非业务域关系",
   "statement": "We believe that 5 scale 间是粒度分层关系，不是自治业务域",
   "category": "technical",
   "falsifiable": 3,
   "importance": "high",
   "evidence_level": "weak",
   "signal_type": "dep",
   "invalidation_condition": "若任一 scale 拥有独立事实源或独立业务目标，分层关系前提失效",
   "valid_until": "unknown",
   "requires_human_review": true,
   "cross_adr_refs": [
    "ADR-0005"
   ],
   "review": {
    "reviewer": "independent-window/agent_90cb5c4c (全新上下文复核位)",
    "date": "2026-09-11",
    "score": 3,
    "verdict": "adopt",
    "failure_modes": [],
    "fix_note": "无需修正；cross_refs=[ADR-0005] 核验成立"
   },
   "invalidation_final": {
    "status": "CONFIRMED",
    "evidence": "ADR-0005 共享 DuckDB fact table SSOT 落地；ledger A-007 'done — 单写多读 SWMR'；无任何 scale 拥有独立事实源/独立业务目标的设计",
    "judged_by": "independent-window/agent_90cb5c4c"
   }
  }
 ]
}
```

## 案例 0002 — no-mvp-slice　判定：**partial**

- 源文件：`docs/adr/0002-*`（status: accepted）
- 复核位案例理由：AS-0002-02 将'切片缺失拖死产品定义'过度翻译为'单案例证明全量规划能避免漂移'（F2）且'产品定义漂移'无可观察操作化（F3）；其余 2 条满分。本票的难点样本（最短、引语最密、归纳链最长）。
- 修复轮记录：初跑曾把'5 scale 全部 spec 级同时落地'列为假设（决策本身的复述，F2 型）；规则 1 自检 + 修复轮 1 次后转入 rejected。修复轮记录保留，不重跑洗白（per checklist 失败案例保留要求）。
- rejected（保留不删）：
  - `5 scale 全部 spec 级同时落地` → is_decision_itself

```json
{
 "adr_id": "0002",
 "assumptions": [
  {
   "id": "AS-0002-01",
   "quote_span": "用户在 grill 中明确拒绝 MVP 框架",
   "statement": "We believe that 用户拒绝 MVP 切片、要求全量 spec 规划的意图持续有效",
   "category": "business",
   "falsifiable": 3,
   "importance": "high",
   "evidence_level": "strong",
   "signal_type": "process",
   "invalidation_condition": "若用户在执行阶段主动要求按 MVP 切片交付，本前提失效，ADR-0002 需 supersede",
   "valid_until": "unknown",
   "requires_human_review": false,
   "review": {
    "reviewer": "independent-window/agent_90cb5c4c (全新上下文复核位)",
    "date": "2026-09-11",
    "score": 3,
    "verdict": "adopt",
    "failure_modes": [],
    "fix_note": "无需修正"
   },
   "invalidation_final": {
    "status": "CONFIRMED",
    "evidence": "CONTEXT.md 封口'拒绝 MVP 切片'；spec.md 18 项全量展开无 MVP 切片迹象；7 条 ADR 均 accepted 无 supersede",
    "judged_by": "independent-window/agent_90cb5c4c"
   }
  },
  {
   "id": "AS-0002-02",
   "quote_span": "anysearch-cli \"工程过度精良、产品定义未收敛\" 的教训",
   "statement": "We believe that anysearch-cli 单案例证明\"先全量规划后实现\"能避免产品定义漂移",
   "category": "org",
   "falsifiable": 1,
   "importance": "medium",
   "evidence_level": "weak",
   "signal_type": "process",
   "invalidation_condition": "若出现反例（全量规划仓库同样产品定义漂移）或教训被重新归因，本归纳失效",
   "valid_until": "unknown",
   "requires_human_review": true,
   "generalization": true,
   "review": {
    "reviewer": "independent-window/agent_90cb5c4c (全新上下文复核位)",
    "date": "2026-09-11",
    "score": 1,
    "verdict": "fix",
    "failure_modes": [
     "F2",
     "F3"
    ],
    "fix_note": "过度抽取+不可证伪：原文只说'教训说明切片缺失会拖死产品定义'，被硬化为'单案例证明…能避免漂移'——'证明''能避免'为原文不支持的强主张；'产品定义漂移'无可观察操作化。建议改为'anysearch-cli 单案例归纳：切片缺失会拖死产品定义（非证明全量规划必然避免漂移）'"
   },
   "invalidation_final": {
    "status": "CONFIRMED",
    "evidence": "ADR-0002 理由原文在案；ledger/spec/CONTEXT 无该教训的重归因或反例登记（2026-09-11）；归纳未经第二案例检验",
    "judged_by": "independent-window/agent_90cb5c4c"
   }
  },
  {
   "id": "AS-0002-03",
   "quote_span": "执行阶段的实现优先级排序属于本仓库外的工作，不在 grill/spec 范围",
   "statement": "We believe that 本仓库边界不含执行阶段优先级排序",
   "category": "org",
   "falsifiable": 3,
   "importance": "medium",
   "evidence_level": "strong",
   "signal_type": "process",
   "invalidation_condition": "若出现要求在本仓库内产出执行排序的决策，边界被突破",
   "valid_until": "unknown",
   "requires_human_review": false,
   "scope_guard": true,
   "review": {
    "reviewer": "independent-window/agent_90cb5c4c (全新上下文复核位)",
    "date": "2026-09-11",
    "score": 3,
    "verdict": "adopt",
    "failure_modes": [],
    "fix_note": "无需修正"
   },
   "invalidation_final": {
    "status": "CONFIRMED",
    "evidence": "spec.md §Out of Scope'不写任何实现代码'；18 张 issue 均为 spec/规划票，无执行排序产出",
    "judged_by": "independent-window/agent_90cb5c4c"
   }
  }
 ]
}
```

## 案例 0003 — boundary-product-and-usage　判定：**success**

- 源文件：`docs/adr/0003-*`（status: accepted）
- 复核位案例理由：4/4 引文逐字命中；AS-0003-01/0003-04 两条 scope_guard 已机检复核（商业层字段 0 出现、PMI/Arcalea 0 出现）；仅 AS-0003-02 invalidation 范围需泛化。确定性优先示范案例。
- 修复轮记录：一次通过（repair_rounds=0）。

```json
{
 "adr_id": "0003",
 "assumptions": [
  {
   "id": "AS-0003-01",
   "quote_span": "商业层（开源协议、商业模式、竞品定价、市场份额等）一律\"另起炉灶\"",
   "statement": "We believe that 商业层数据源在本仓库判据中占比保持为 0",
   "category": "business",
   "falsifiable": 3,
   "importance": "high",
   "evidence_level": "none",
   "signal_type": "process",
   "invalidation_condition": "若任何判据数据源/rubric 出现商业层字段，边界突破，本假设失效",
   "valid_until": "unknown",
   "requires_human_review": false,
   "scope_guard": true,
   "review": {
    "reviewer": "independent-window/agent_90cb5c4c (全新上下文复核位)",
    "date": "2026-09-11",
    "score": 3,
    "verdict": "adopt",
    "failure_modes": [],
    "fix_note": "无需修正；evidence_level=none 应为 strong（可机检且已机检为零）"
   },
   "invalidation_final": {
    "status": "CONFIRMED",
    "evidence": "机检 05-unit-matrix.json（2026-09-11）：'商业'=0、'开源协议'=0、'竞品'=0、'市场份额'=0；spec.md §Out of Scope'不引入商业层（D-003 已封口）'",
    "judged_by": "independent-window/agent_90cb5c4c"
   }
  },
  {
   "id": "AS-0003-02",
   "quote_span": "用户在 grill 中未答但按推荐选项落地",
   "statement": "We believe that 推荐选项可代理用户意图（边界决策的合法性前提）",
   "category": "business",
   "falsifiable": 2,
   "importance": "high",
   "evidence_level": "weak",
   "signal_type": "process",
   "invalidation_condition": "若用户对\"商业层排除\"边界提出异议或撤销推荐授权，本假设失效",
   "valid_until": "unknown",
   "requires_human_review": true,
   "review": {
    "reviewer": "independent-window/agent_90cb5c4c (全新上下文复核位)",
    "date": "2026-09-11",
    "score": 2,
    "verdict": "fix",
    "failure_modes": [],
    "fix_note": "invalidation 仅覆盖'商业层排除'单点，应泛化为：任何按推荐选项代理落地的 grill 决策（D-001~D-007 任一条）被用户异议/撤销授权时本前提削弱，并指定观察面（ledger 与 issues 中的用户否决记录）"
   },
   "invalidation_final": {
    "status": "CONFIRMED",
    "evidence": "CONTEXT.md'已封口 7 条决策'；ledger A-001~A-018 及 issues/handoffs 无任何用户异议或授权撤销记录",
    "judged_by": "independent-window/agent_90cb5c4c"
   }
  },
  {
   "id": "AS-0003-03",
   "quote_span": "S5 必须从\"团队拓扑匹配\"改名为\"所有权边界匹配\"",
   "statement": "We believe that S5 维度以\"所有权边界\"命名且不引入组织图数据源",
   "category": "org",
   "falsifiable": 3,
   "importance": "medium",
   "evidence_level": "strong",
   "signal_type": "process",
   "invalidation_condition": "若 S5 恢复\"团队拓扑\"命名并引入组织图数据源，改名前提失效",
   "valid_until": "unknown",
   "requires_human_review": true,
   "cross_adr_refs": [
    "ADR-0004"
   ],
   "review": {
    "reviewer": "independent-window/agent_90cb5c4c (全新上下文复核位)",
    "date": "2026-09-11",
    "score": 3,
    "verdict": "adopt",
    "failure_modes": [],
    "fix_note": "无需修正；cross_refs=[ADR-0004] 成立"
   },
   "invalidation_final": {
    "status": "CONFIRMED",
    "evidence": "ADR-0004 S5 命名'所有权边界匹配'；CONTEXT.md S5 术语 _Avoid_:'团队拓扑'；05-unit-matrix.json '团队拓扑'=0",
    "judged_by": "independent-window/agent_90cb5c4c"
   }
  },
  {
   "id": "AS-0003-04",
   "quote_span": "S1 借用的 PMI 蔓延统计与 S4 借用的 Arcalea 战略漂移定义仅作心智模型参照，未进入判据数据源",
   "statement": "We believe that PMI/Arcalea 仅作心智参照，不进判据数据源",
   "category": "technical",
   "falsifiable": 3,
   "importance": "medium",
   "evidence_level": "strong",
   "signal_type": "process",
   "invalidation_condition": "若 05-unit-matrix.json 的 S1/S4 数据源清单出现 PMI 或 Arcalea，边界突破（确定性规则可查）",
   "valid_until": "unknown",
   "requires_human_review": false,
   "scope_guard": true,
   "review": {
    "reviewer": "independent-window/agent_90cb5c4c (全新上下文复核位)",
    "date": "2026-09-11",
    "score": 3,
    "verdict": "adopt",
    "failure_modes": [],
    "fix_note": "无需修正；确定性机检规则复核通过"
   },
   "invalidation_final": {
    "status": "CONFIRMED",
    "evidence": "机检 05-unit-matrix.json（2026-09-11）：'PMI'=0、'Arcalea'=0，S1/S4 数据源清单未含二者",
    "judged_by": "independent-window/agent_90cb5c4c"
   }
  }
 ]
}
```

## 案例 0004 — strategic-quadrant-five-dims　判定：**partial**

- 源文件：`docs/adr/0004-*`（status: accepted）
- 复核位案例理由：AS-0004-03 将用户心智硬化为市场事实（F2/F3）、AS-0004-05 类别 org 不贴切（F4）；AS-0004-01/0004-02 满分且与 A-005 落盘完全对齐。含本票最近的定时失效点（valid_until=2026-12-10）。
- 修复轮记录：一次通过（repair_rounds=0）。

```json
{
 "adr_id": "0004",
 "assumptions": [
  {
   "id": "AS-0004-01",
   "quote_span": "每维全 5 scale 覆盖",
   "statement": "We believe that S1-S5 每维在全部 5 scale 都有判据",
   "category": "technical",
   "falsifiable": 3,
   "importance": "high",
   "evidence_level": "strong",
   "signal_type": "metric",
   "invalidation_condition": "若任一维度在任一 scale 无判据（矩阵空格），本假设失效（可机检 25 格）",
   "valid_until": "unknown",
   "requires_human_review": false,
   "review": {
    "reviewer": "independent-window/agent_90cb5c4c (全新上下文复核位)",
    "date": "2026-09-11",
    "score": 3,
    "verdict": "adopt",
    "failure_modes": [],
    "fix_note": "无需修正"
   },
   "invalidation_final": {
    "status": "CONFIRMED",
    "evidence": "ledger A-005 'done — 守卫脚本 PASS（25/25 cells, schema-valid）'；05-unit-matrix.json 全填无占位，25 处'2026-12-10'",
    "judged_by": "independent-window/agent_90cb5c4c"
   }
  },
  {
   "id": "AS-0004-02",
   "quote_span": "阈值（黄/红）声明为初版参数，预留跨仓校准机制",
   "statement": "We believe that 黄/红阈值是初版参数，须在校准窗口内跨仓校准",
   "category": "technical",
   "falsifiable": 3,
   "importance": "high",
   "evidence_level": "strong",
   "signal_type": "process",
   "invalidation_condition": "若校准窗口到期仍未跨仓校准，初版参数假设过期（EXPIRED）",
   "valid_until": "2026-12-10",
   "requires_human_review": false,
   "review": {
    "reviewer": "independent-window/agent_90cb5c4c (全新上下文复核位)",
    "date": "2026-09-11",
    "score": 3,
    "verdict": "adopt",
    "failure_modes": [],
    "fix_note": "无需修正；'须在校准窗口内'的期限来自 A-005 落盘而非 ADR-0004 原文，属合理下游落地，出处已注明"
   },
   "invalidation_final": {
    "status": "CONFIRMED",
    "evidence": "ledger A-005 落盘'90 天校准窗口（expires 2026-12-10）'+跨仓校准三档；今日在窗口内；逾期未校准即转 EXPIRED",
    "judged_by": "independent-window/agent_90cb5c4c"
   }
  },
  {
   "id": "AS-0004-03",
   "quote_span": "\"全行业唯一空位 = 我们的护城河\"心智落地点",
   "statement": "We believe that 5 维配置处于全行业唯一空位（护城河）",
   "category": "business",
   "falsifiable": 1,
   "importance": "medium",
   "evidence_level": "weak",
   "signal_type": "metric",
   "invalidation_condition": "若竞品交付同构 5 维战略评估，唯一空位假设失效",
   "valid_until": "unknown",
   "requires_human_review": true,
   "generalization": true,
   "review": {
    "reviewer": "independent-window/agent_90cb5c4c (全新上下文复核位)",
    "date": "2026-09-11",
    "score": 1,
    "verdict": "fix",
    "failure_modes": [
     "F2",
     "F3"
    ],
    "fix_note": "用户心智被硬化为市场事实：原文是'用户 memory §11 的心智落地点'，statement 改为'用户心智认为 5 维配置是行业空位（护城河），未经市场验证'；signal_type 应从 metric 改 process；'全行业唯一'仅可被单一竞品反证，补竞品扫描观察面"
   },
   "invalidation_final": {
    "status": "INSUFFICIENT-EVIDENCE",
    "evidence": "仓库内无竞品格局/市场扫描 artifact；atomcode-research 2026-09 为方法论调研而非竞品对比，无法确认或否认'全行业唯一'",
    "judged_by": "independent-window/agent_90cb5c4c"
   }
  },
  {
   "id": "AS-0004-04",
   "quote_span": "#7 承诺密度工业界无独立心智模型，已降为 S3/S4 过程证据",
   "statement": "We believe that 承诺密度无独立心智模型，只能作过程证据",
   "category": "technical",
   "falsifiable": 2,
   "importance": "low",
   "evidence_level": "strong",
   "signal_type": "process",
   "invalidation_condition": "若工业界出现承诺密度独立心智模型/工具，降级前提失效，需重评",
   "valid_until": "unknown",
   "requires_human_review": false,
   "scope_guard": true,
   "review": {
    "reviewer": "independent-window/agent_90cb5c4c (全新上下文复核位)",
    "date": "2026-09-11",
    "score": 2,
    "verdict": "fix",
    "failure_modes": [],
    "fix_note": "'只能作过程证据'较原文'已降为 S3/S4 过程证据'多了排他永久性，软化为'已降为过程证据；除非工业界出现独立心智模型/工具，维持该定位'"
   },
   "invalidation_final": {
    "status": "CONFIRMED",
    "evidence": "05-unit-matrix.json '承诺密度'=0（未进数据源）；ADR-0004 原文在案；仓库调研 artifact 无承诺密度独立心智模型新证据",
    "judged_by": "independent-window/agent_90cb5c4c"
   }
  },
  {
   "id": "AS-0004-05",
   "quote_span": "三引擎 Exa+Tavily+AnySearch + Patchright + 11 原文验证",
   "statement": "We believe that 5 维配置的方法论可信度依赖 2026-09 三引擎调研的证据强度",
   "category": "org",
   "falsifiable": 2,
   "importance": "medium",
   "evidence_level": "strong",
   "signal_type": "process",
   "invalidation_condition": "若调研原文被证伪或引用失实，决策依据动摇",
   "valid_until": "unknown",
   "requires_human_review": false,
   "review": {
    "reviewer": "independent-window/agent_90cb5c4c (全新上下文复核位)",
    "date": "2026-09-11",
    "score": 2,
    "verdict": "fix",
    "failure_modes": [
     "F4"
    ],
    "fix_note": "category=org 不贴切，调研证据强度属证据可核验性，应为 qa；invalidation 需补可操作复核物——11 原文清单应先落盘否则'引用失实'不可独立复核"
   },
   "invalidation_final": {
    "status": "INSUFFICIENT-EVIDENCE",
    "evidence": "ADR-0004 是 11 原文验证的唯一记录，ledger/spec 均无对应来源清单 artifact，无法独立复核引用是否失实；亦无证伪信号",
    "judged_by": "independent-window/agent_90cb5c4c"
   }
  }
 ]
}
```

## 案例 0005 — hub-of-facts-with-federated-adjudication　判定：**partial**

- 源文件：`docs/adr/0005-*`（status: accepted）
- 复核位案例理由：AS-0005-01 statement 含生成残渣 token'Đây'（表述损坏，修正后可用）；AS-0005-03 '必然复现'语气硬化且反事实不可直接验证；AS-0005-02/0005-04 满分。本票唯一出现输出损坏的案例——残渣被复核位捕获，验证了抽检回路价值。
- 修复轮记录：初跑 1 轮内完成：'数据底座采 C + 治理协议采 A'为选型决策复述，规则 1 自检转入 rejected。
- rejected（保留不删）：
  - `数据底座采 C（共享 DuckDB fact table）+ 治理协议采 A` → is_decision_itself

```json
{
 "adr_id": "0005",
 "assumptions": [
  {
   "id": "AS-0005-01",
   "quote_span": "5 scale 是同一审计事实的不同粒度而非独立业务域",
   "statement": "We believe that 5 scale 是同一审计事实的不同粒度而非独立业务域（联邦模式不适用 Đây 是排他理由的核心前提）",
   "category": "technical",
   "falsifiable": 3,
   "importance": "high",
   "evidence_level": "weak",
   "signal_type": "dep",
   "invalidation_condition": "若任一 scale 建立自治事实源或独立业务目标，联邦前提成立，ADR-0005 需重评",
   "valid_until": "unknown",
   "requires_human_review": true,
   "cross_adr_refs": [
    "ADR-0001"
   ],
   "review": {
    "reviewer": "independent-window/agent_90cb5c4c (全新上下文复核位)",
    "date": "2026-09-11",
    "score": 1,
    "verdict": "fix",
    "failure_modes": [],
    "fix_note": "statement 含生成残渣 token：'…联邦模式不适用 Đây 是排他理由的核心前提'中'Đây'为乱码，整句重写为'5 scale 是同一审计事实的不同粒度而非独立业务域——此为联邦模式被排除的核心理由前提'。语义方向与原文一致，修正后采纳"
   },
   "invalidation_final": {
    "status": "CONFIRMED",
    "evidence": "ADR-0005 SSOT+共享 fact table 在案；ledger A-007 单写多读决议；A-012 以三条防线对冲 data mesh 失败而非引入自治事实源；cross_refs=[ADR-0001] 成立",
    "judged_by": "independent-window/agent_90cb5c4c"
   }
  },
  {
   "id": "AS-0005-02",
   "quote_span": "事件单向写入 + 按需拉取投影",
   "statement": "We believe that fact table 单向写入（SWMR）、投影按需拉取",
   "category": "technical",
   "falsifiable": 3,
   "importance": "high",
   "evidence_level": "strong",
   "signal_type": "metric",
   "invalidation_condition": "若出现多进程并发写 fact table 的硬需求，SWMR 前提失效（A-007 重评）",
   "valid_until": "unknown",
   "requires_human_review": false,
   "review": {
    "reviewer": "independent-window/agent_90cb5c4c (全新上下文复核位)",
    "date": "2026-09-11",
    "score": 3,
    "verdict": "adopt",
    "failure_modes": [],
    "fix_note": "无需修正；statement 将 ADR 前提与 A-007 落盘（SWMR）合并，与仓库事实一致"
   },
   "invalidation_final": {
    "status": "CONFIRMED",
    "evidence": "ledger A-007 'done — 单写多读 SWMR 决议（明文 + 排他理由 4 条）'；spec.md §Decision 5.1 '选前者（SSOT + 集中写入进程）'",
    "judged_by": "independent-window/agent_90cb5c4c"
   }
  },
  {
   "id": "AS-0005-03",
   "quote_span": "A 联邦模式在 5 scale 间会复现 data mesh 三大失败",
   "statement": "We believe that 联邦治理在 5 scale 场景必然复现三大失败（无人拥有/静默断裂/重复劳动）",
   "category": "technical",
   "falsifiable": 2,
   "importance": "high",
   "evidence_level": "none",
   "signal_type": "process",
   "invalidation_condition": "若有界实验或业界实践显示三大失败在同类场景可控，排他理由削弱，需重评选项",
   "valid_until": "unknown",
   "requires_human_review": true,
   "rejected_option_premise": true,
   "review": {
    "reviewer": "independent-window/agent_90cb5c4c (全新上下文复核位)",
    "date": "2026-09-11",
    "score": 2,
    "verdict": "fix",
    "failure_modes": [],
    "fix_note": "'必然复现'较原文'会复现'语气硬化，去除'必然'；该前提是对未实施反事实的预测，invalidation 应指明观察物（A-012 防线指标长期为零=削弱间接信号；有界联邦实验=直接信号）"
   },
   "invalidation_final": {
    "status": "INSUFFICIENT-EVIDENCE",
    "evidence": "反事实预测无有界实验可验；ledger A-012 三条防线属对冲设计而非验证结果；仓库无'三大失败可控'的业界实践证据",
    "judged_by": "independent-window/agent_90cb5c4c"
   }
  },
  {
   "id": "AS-0005-04",
   "quote_span": "hub 只做元逻辑（裁决/契约/路由）不经过数据面",
   "statement": "We believe that hub 不承载数据面流量",
   "category": "technical",
   "falsifiable": 3,
   "importance": "medium",
   "evidence_level": "none",
   "signal_type": "metric",
   "invalidation_condition": "若 hub 实现开始中转数据面流量，元逻辑边界突破",
   "valid_until": "unknown",
   "requires_human_review": false,
   "review": {
    "reviewer": "independent-window/agent_90cb5c4c (全新上下文复核位)",
    "date": "2026-09-11",
    "score": 3,
    "verdict": "adopt",
    "failure_modes": [],
    "fix_note": "无需修正；evidence_level=none 偏低——CONTEXT.md HoF-FA 术语与 A-011 硬不变量双重重申，上调为 strong"
   },
   "invalidation_final": {
    "status": "CONFIRMED",
    "evidence": "CONTEXT.md HoF-FA'hub 只承载元逻辑…不经过数据面'；ledger A-011 'hub 无自有持久状态'；A-007 明文拒绝'把 hub 拉进数据面'",
    "judged_by": "independent-window/agent_90cb5c4c"
   }
  },
  {
   "id": "AS-0005-05",
   "quote_span": "SSOT + 各 scale 自建 read model",
   "statement": "We believe that SSOT+自建 read model 能满足 5 scale 的报告聚合需求",
   "category": "technical",
   "falsifiable": 2,
   "importance": "medium",
   "evidence_level": "none",
   "signal_type": "metric",
   "invalidation_condition": "若 read model 投影延迟常态超 SLA 或语义层无法覆盖 scale 差异，合成方案前提动摇",
   "valid_until": "unknown",
   "requires_human_review": false,
   "review": {
    "reviewer": "independent-window/agent_90cb5c4c (全新上下文复核位)",
    "date": "2026-09-11",
    "score": 2,
    "verdict": "fix",
    "failure_modes": [],
    "fix_note": "invalidation 补具体观察信号：spec.md §Decision 5.3 默认 SLA 5 秒 + ledger A-007 最坏陈旧读链路 ≈0.65s ≪ 5s——将'投影延迟 > 5s SLA 报警（A-009 触发条件）'写为失效观察点"
   },
   "invalidation_final": {
    "status": "CONFIRMED",
    "evidence": "ledger A-007 '最坏陈旧读链路 ≈ 0.65 s ≪ 5 s SLA'；spec.md §Decision 5.3 默认 5 秒 SLA；A-009 未闭环但无反证",
    "judged_by": "independent-window/agent_90cb5c4c"
   }
  }
 ]
}
```

## 案例 0007 — ten-demo-paths　判定：**success**

- 源文件：`docs/adr/0007-*`（status: accepted）
- 复核位案例理由：4/4 引文逐字命中、cross_refs=[ADR-0006] 成立；AS-0007-01 的'5 条以下'阈值与 A-017 可点规则需去混淆、AS-0007-04 证据等级需上调，均为补强级而非错误级。
- 修复轮记录：初跑 1 轮内完成：'四要素'清单为决策内容，规则 1 自检转入 rejected。
- rejected（保留不删）：
  - `每条路径四要素：触发条件 / 步骤序列 / 成功/失败语义 / 报告产物` → is_decision_itself

```json
{
 "adr_id": "0007",
 "assumptions": [
  {
   "id": "AS-0007-01",
   "quote_span": "用户在 grill 中批准 10 路径法",
   "statement": "We believe that 用户批准的 10 路径演示框架持续有效",
   "category": "business",
   "falsifiable": 3,
   "importance": "high",
   "evidence_level": "strong",
   "signal_type": "process",
   "invalidation_condition": "若用户削减演示预算或路径数（砍到 5 条以下），批准前提失效",
   "valid_until": "unknown",
   "requires_human_review": false,
   "review": {
    "reviewer": "independent-window/agent_90cb5c4c (全新上下文复核位)",
    "date": "2026-09-11",
    "score": 2,
    "verdict": "fix",
    "failure_modes": [],
    "fix_note": "invalidation 中'砍到 5 条以下'与 A-017 的'≥5 路径可点'规则混淆——改写为'总路径数 <10 或任一 scale 的 happy/failure 缺席'为失效信号"
   },
   "invalidation_final": {
    "status": "CONFIRMED",
    "evidence": "ledger A-017 结论落盘：10 路径决策表（6 可点/4 文档）；10 路径框架未被削减",
    "judged_by": "independent-window/agent_90cb5c4c"
   }
  },
  {
   "id": "AS-0007-02",
   "quote_span": "二者必须共享同一报告模板（ADR-0006）以允许用户对比",
   "statement": "We believe that happy 与 failure path 必须共享报告模板以支持对比",
   "category": "technical",
   "falsifiable": 2,
   "importance": "medium",
   "evidence_level": "weak",
   "signal_type": "process",
   "invalidation_condition": "若 failure path 报告产物与 happy path 形态分叉无法对比，共享前提失效（关联 A-018 验收）",
   "valid_until": "unknown",
   "requires_human_review": true,
   "cross_adr_refs": [
    "ADR-0006"
   ],
   "review": {
    "reviewer": "independent-window/agent_90cb5c4c (全新上下文复核位)",
    "date": "2026-09-11",
    "score": 3,
    "verdict": "adopt",
    "failure_modes": [],
    "fix_note": "无需修正；cross_refs=[ADR-0006] 成立"
   },
   "invalidation_final": {
    "status": "CONFIRMED",
    "evidence": "ADR-0006 骨架在案；CONTEXT.md Degraded Demonstration'不允许 failure path 产物与 happy path 形态分离'；A-018 未闭环——验收证据未产生，当前无违反信号",
    "judged_by": "independent-window/agent_90cb5c4c"
   }
  },
  {
   "id": "AS-0007-03",
   "quote_span": "5 scale 全覆盖禁止\"演示只演 Macro-B、Micro-A 之后再接\"",
   "statement": "We believe that 演示不得缺席任何 scale",
   "category": "business",
   "falsifiable": 3,
   "importance": "medium",
   "evidence_level": "strong",
   "signal_type": "process",
   "invalidation_condition": "若演示计划出现任何 scale 缺席，全覆盖前提失效",
   "valid_until": "unknown",
   "requires_human_review": false,
   "scope_guard": true,
   "review": {
    "reviewer": "independent-window/agent_90cb5c4c (全新上下文复核位)",
    "date": "2026-09-11",
    "score": 3,
    "verdict": "adopt",
    "failure_modes": [],
    "fix_note": "无需修正"
   },
   "invalidation_final": {
    "status": "CONFIRMED",
    "evidence": "ledger A-017 决策表覆盖 5 scale × happy+failure 无缺席；4 条 failure 仅降为文档形态而非剔除",
    "judged_by": "independent-window/agent_90cb5c4c"
   }
  },
  {
   "id": "AS-0007-04",
   "quote_span": "失败路径与失败语义要求直接对接（显式降级而非沉默失败）",
   "statement": "We believe that 每条 failure path 都必须有显式降级语义，不允许沉默失败",
   "category": "technical",
   "falsifiable": 2,
   "importance": "high",
   "evidence_level": "none",
   "signal_type": "incident",
   "invalidation_condition": "若 failure path 演示出现无 verdict-gate 印记的静默失败，前提被违反",
   "valid_until": "unknown",
   "requires_human_review": false,
   "review": {
    "reviewer": "independent-window/agent_90cb5c4c (全新上下文复核位)",
    "date": "2026-09-11",
    "score": 2,
    "verdict": "fix",
    "failure_modes": [],
    "fix_note": "evidence_level=none 偏低：CONTEXT.md Failure Semantics 明文'每个 scale 都明写降级而非沉默失败'，上调为 strong 并纳入机检面（A-018 产物逐条核对 verdict-gate 印记）"
   },
   "invalidation_final": {
    "status": "CONFIRMED",
    "evidence": "CONTEXT.md Failure Semantics 与 Degraded Demonstration 双重在案；A-018 未闭环，验收载体待其交付",
    "judged_by": "independent-window/agent_90cb5c4c"
   }
  }
 ]
}
```

## 补抽（复核位 F5 漏抽发现 → 追加负向声明假设）

| ADR | 补抽假设（scope_guard） |
|---|---|
| 0001 | 跨 scale 必须独立定义审计粒度——Macro-B 四象限的粒度定义不得跨 scale 复用（F5 漏抽补抽；与 AS-0001-03 张力直接相关） |
| 0005 | 报告聚合不做 UI 抓取——报告数据只能经独立语义层（read model）投影获得（F5 漏抽补抽；ADR-0005 子决策②） |
| 0006 | 报告 scale 切片禁止跨 scale 引用；模板只锁章节顺序与必备字段、不锁措辞（F5 漏抽补抽；ADR-0006 两条负向声明） |

## 假设失效判定汇总（复核位终判）

| ID | 终判 | 一句话证据 |
|---|---|---|
| AS-0001-01 | CONFIRMED | CONTEXT.md(仓库根)封口'5 scale 全覆盖'；spec.md 18 项全量展开无任何 scale 收窄；05-unit-matrix.json 行 S1-S5 ×  |
| AS-0001-02 | CONFIRMED | CONTEXT.md Scale 术语'各 scale 共享同一套证据层（CodeLore + OpenSSF Scorecard）与裁决层（verdict-gate）'；05-u |
| AS-0001-03 | PARTIAL-DRIFT | ADR-0004'每维全 5 scale 覆盖'+CONTEXT.md Strategic Quadrant'覆盖全部 5 scale'+05-unit-matrix.json 2 |
| AS-0001-04 | CONFIRMED | ADR-0005 共享 DuckDB fact table SSOT 落地；ledger A-007 'done — 单写多读 SWMR'；无任何 scale 拥有独立事实源/独立 |
| AS-0002-01 | CONFIRMED | CONTEXT.md 封口'拒绝 MVP 切片'；spec.md 18 项全量展开无 MVP 切片迹象；7 条 ADR 均 accepted 无 supersede |
| AS-0002-02 | CONFIRMED | ADR-0002 理由原文在案；ledger/spec/CONTEXT 无该教训的重归因或反例登记（2026-09-11）；归纳未经第二案例检验 |
| AS-0002-03 | CONFIRMED | spec.md §Out of Scope'不写任何实现代码'；18 张 issue 均为 spec/规划票，无执行排序产出 |
| AS-0003-01 | CONFIRMED | 机检 05-unit-matrix.json（2026-09-11）：'商业'=0、'开源协议'=0、'竞品'=0、'市场份额'=0；spec.md §Out of Scope'不 |
| AS-0003-02 | CONFIRMED | CONTEXT.md'已封口 7 条决策'；ledger A-001~A-018 及 issues/handoffs 无任何用户异议或授权撤销记录 |
| AS-0003-03 | CONFIRMED | ADR-0004 S5 命名'所有权边界匹配'；CONTEXT.md S5 术语 _Avoid_:'团队拓扑'；05-unit-matrix.json '团队拓扑'=0 |
| AS-0003-04 | CONFIRMED | 机检 05-unit-matrix.json（2026-09-11）：'PMI'=0、'Arcalea'=0，S1/S4 数据源清单未含二者 |
| AS-0004-01 | CONFIRMED | ledger A-005 'done — 守卫脚本 PASS（25/25 cells, schema-valid）'；05-unit-matrix.json 全填无占位，25 处' |
| AS-0004-02 | CONFIRMED | ledger A-005 落盘'90 天校准窗口（expires 2026-12-10）'+跨仓校准三档；今日在窗口内；逾期未校准即转 EXPIRED |
| AS-0004-03 | INSUFFICIENT-EVIDENCE | 仓库内无竞品格局/市场扫描 artifact；atomcode-research 2026-09 为方法论调研而非竞品对比，无法确认或否认'全行业唯一' |
| AS-0004-04 | CONFIRMED | 05-unit-matrix.json '承诺密度'=0（未进数据源）；ADR-0004 原文在案；仓库调研 artifact 无承诺密度独立心智模型新证据 |
| AS-0004-05 | INSUFFICIENT-EVIDENCE | ADR-0004 是 11 原文验证的唯一记录，ledger/spec 均无对应来源清单 artifact，无法独立复核引用是否失实；亦无证伪信号 |
| AS-0005-01 | CONFIRMED | ADR-0005 SSOT+共享 fact table 在案；ledger A-007 单写多读决议；A-012 以三条防线对冲 data mesh 失败而非引入自治事实源；cro |
| AS-0005-02 | CONFIRMED | ledger A-007 'done — 单写多读 SWMR 决议（明文 + 排他理由 4 条）'；spec.md §Decision 5.1 '选前者（SSOT + 集中写入进程 |
| AS-0005-03 | INSUFFICIENT-EVIDENCE | 反事实预测无有界实验可验；ledger A-012 三条防线属对冲设计而非验证结果；仓库无'三大失败可控'的业界实践证据 |
| AS-0005-04 | CONFIRMED | CONTEXT.md HoF-FA'hub 只承载元逻辑…不经过数据面'；ledger A-011 'hub 无自有持久状态'；A-007 明文拒绝'把 hub 拉进数据面' |
| AS-0005-05 | CONFIRMED | ledger A-007 '最坏陈旧读链路 ≈ 0.65 s ≪ 5 s SLA'；spec.md §Decision 5.3 默认 5 秒 SLA；A-009 未闭环但无反证 |
| AS-0007-01 | CONFIRMED | ledger A-017 结论落盘：10 路径决策表（6 可点/4 文档）；10 路径框架未被削减 |
| AS-0007-02 | CONFIRMED | ADR-0006 骨架在案；CONTEXT.md Degraded Demonstration'不允许 failure path 产物与 happy path 形态分离'；A-01 |
| AS-0007-03 | CONFIRMED | ledger A-017 决策表覆盖 5 scale × happy+failure 无缺席；4 条 failure 仅降为文档形态而非剔除 |
| AS-0007-04 | CONFIRMED | CONTEXT.md Failure Semantics 与 Degraded Demonstration 双重在案；A-018 未闭环，验收载体待其交付 |

> PARTIAL-DRIFT ×1（AS-0001-03 战略象限跨 scale 张力——本票最重要的监测产出，建议登记进 S4 drift 报告）；INSUFFICIENT-EVIDENCE ×3（AS-0004-03/0004-05/0005-03——竞品格局无 artifact、11 原文清单未落盘、反事实无实验）；EXPIRED ×0（最近定时点 AS-0004-02 于 2026-12-10）；DRIFT ×0。

## 失败模式与分歧分析（复核位 vs 抽取位）

1. **F2 过度抽取/语气硬化**（×2）：AS-0002-02 把 n=1 教训硬化为"证明能避免"；AS-0004-03 把用户心智硬化为市场事实。规则：抽取时保留原文的认识论强度（"教训/心智/判断"≠"证明/事实"）。
2. **F3 不可证伪残留**（×2）：与 F2 同源——硬化后的主张失去可观察信号。fix 路径已给出操作化定义。
3. **F4 类别错标**（×1）：AS-0004-05 调研证据强度应为 qa（可核验性）而非 org。
4. **生成残渣**（×1）：AS-0005-01 statement 混入非中文 token"Đây"——抽取位自身未察觉，复核位字节级核验捕获。**这是"LLM 抽取不能只信 LLM"（A-003 硬约束）的直接实证。**
5. **系统性 evidence_level 低估**：AS-0001-02/0003-01/0005-04/0007-04 在 CONTEXT.md/ledger 已有强证据仍标 none/weak——抽取位只看 ADR 单文，复核位有全仓视角。改进方向：阶段 0 预处理把 CONTEXT.md 术语表与 ledger 状态喂给抽取位。
6. **抽取位-复核位分歧**：抽取位预判 0001=partial（张力），复核位终判 success（张力=监测生效非抽取错误）；抽取位预判 0002=failure 倾向，复核位终判 partial。分歧已按双模型分歧机制记录，终判采复核位。

---

*抽取：2026-09-11 主窗口（GLM-5.3-Flash，prompt v1，温度 0 语义）；复核：2026-09-11 独立窗口 agent_90cb5c4c。引文核验 25/25 逐字命中（F1=0）。*