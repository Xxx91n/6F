# R32-Q3 调研题面（atomcode）

仓库 D:\Aworker\6F 是 spec-level 工程内容审计产品（五尺度审计，Hub-of-Facts append-only 事实表 + DuckDB 存储 + Micro-B 文件级审计卡三层契约）。

## 问题

Micro-B 文件质量卡三层契约（D-123）：kernel 数据层=已契约实体面逐字段直投（hotspots 行 revisions/cognitive_health/hotspot_score/mi_rank/ai_pct＋entity-churn/entity-ownership/coupling/code-age 族）＋citation 锚；derived 派生层=确定性可复算值（priority_band/percentile_rank/top_n_flag 带规则版本）；宿主叙事层=解释建议归宿主 agent。失败三态立法原文（D-123⑤）：「new_file/insufficient_history=显式态仅静态指标（无 churn/age/ownership）／binary/generated=card_type:not_applicable」。

争议：现行实现=失败态仅抑制 derived 层（suppressed_by 留痕），kernel facet_rows 全量直投（含 hotspots 等历史派生行——new_file 实测 revisions=1、hotspot_score 退化值）。审计窗指出读法分歧：「仅静态指标」的「仅」是限定词（kernel 也收窄、历史派生族应抑制）还是修饰语（kernel 直投本体即静态指标、抑制面=derived 判语层）？

候选处置：
(a) 维持现状读法——kernel=raw 事实直投即静态指标，抑制面=derived 层，括号「无 churn/age/ownership」仅描述数据局面；
(b) 严格读法——失败态 kernel facet_rows 滤除历史派生族（entity-churn/entity-ownership/code-age/hotspots/coupling 枚举面收口），只留不依赖历史深度的行，卡面带 suppressed_facets 显式标记，D-123⑤ 挂 scoped 澄清注记；
(c) 折中——kernel 全载但失败态行打 degraded/insufficient 标记不裁呈现。

## 调研要求

1. 回顾 D:\Aworker\6F\.scratch\macro-audit\decision-ledger.md 全部 current 记录（重点 D-123 三层卡契约立法、D-125 subject/血缘、D-126 查询语义 miss 四类、D-122 披露四件、D-095/D-096 枚举 open/closed 建制）、docs/adr/ 全部 ADR（重点 0023-micro-b）、CONTEXT.md 全部词条；
2. 工业界成熟落地的心智模型（重点）：read-model 投影在数据不足/降级态的呈现惯例（SonarQube/CodeScene/SonarCloud 对 new file/insufficient history 的 UI 处置）、「显式空态 vs 退化数据展示」的 UX/API 设计判据、faceted search/dashboard 的 suppression vs annotation 之争、审计/合规语境下「呈现退化指标」的风险判例；
3. 给出推荐与理由，显式指出与账本任一 current 决策的冲突点（若有——冲突则该 D-xxx 需标 revised 并呈报新决策，禁止静默改向）。
