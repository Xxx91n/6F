# 51 — Macro-B behavior 象限接入判据（预声明，跑后禁调）

日期：2026-09-16　票面：BACKLOG #51 / D-054　主体仓：Xxx91n/env-manager（本地真仓）

## 面集（实物 schema 已跑确认——51-behavior-schema.json 留痕）

- `hotspots`：{path, revisions, cognitive, cognitive_health, hotspot_score, mi, mi_rank, ai_pct, hotspot_score_anchored}
- `coupling`：{entity_a, entity_b, shared, revs_a, revs_b, average_revs, degree, fisher_p}
- `function-hotspots`：{path, function(name@lines), revs, cognitive, cognitive_health, function_hotspot_score}
- 暂缓：`function-coupling`（需 --target <path>，按实体逐个跑非全仓扫描形——登记 deferred，不进切片）

## 判据

| ID | 类型 | 判据 | band |
|---|---|---|---|
| PC-1 | positive_control | 行为三面（hotspots/coupling/function-hotspots）各产出 codelore.facet_rows 事实且 row_count>0；任一面缺/error→insufficient | supported ⇔ 三面事实齐备 |
| TC-1 | true_criterion | 低样本判据：hotspots 全部行 revisions ≥ TC1_MIN_N=5（对齐 codelore --min-revs 默认 5＋ADR-0015 量测有效性预声明阈值惯例）；存在 revisions<5 行→insufficient 并披露低样本 | supported ⇔ min(revisions)≥5 |
| TC-2 | true_criterion | change-coupling 证据面有效：coupling 行 shared≥2 且 degree>0 占比≥50%（coupling 表非空且多数行为真耦合对） | supported ⇔ 占比≥0.5 |
| NC-1 | negative_control | 未接面如实标注：报告 slice_fields.deferred_faces 必含 function-coupling（--target 参数面暂缓）；不得把未接面写成已评估 | supported ⇔ deferred 标注在 |

## quadrant 归位规则（D-054③）

fact.quadrant=collector 声明域（codelore 族 provenance=strategic，维度面 provenance 字段不改写）；报告象限归属=切片决策——本票 QuadrantEntry.quadrant=behavior 消费 codelore 行为面事实即归位，同一批 facts 可被 Macro-C 演化主干并发消费不构成双归属冲突（归属在报告层不在 fact 层）。

## 能力矩阵措辞（同票绑定收窄）

strategy: active（S1+S2 采集面已上架）· behavior: preview（本票 churn/hotspot/coupling 切片）· structure: queued（与 S3 族双口径风险暂缓——两套复杂度口径在报告内自相矛盾的失败模式）· supply-chain: queued（D-034③ Scorecard 不插队）。
