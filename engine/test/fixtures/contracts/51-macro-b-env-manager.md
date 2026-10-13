# MA-51-ENVMANAGER-BEHAVIOR — Macro-B 首报（Xxx91n/env-manager）
> RECEIPT RCP-a3090cc34ef50406 chain=a3090cc34ef504067e69f1dde247f935 content=f342a55dcc384ecb facts=4 adjudications=4 issued_at=2026-09-16T23:50:07.554Z commit=unanchored tree=unanchored
>
> 骨架 1.1.0（章顺序锁定，ADR-0006）· 裁定协议 ADR-0013-C/v1 · 生成于 2026-09-16T23:50:06.764Z
>
> 披露块（preview 标注诚实 = 决策本体，ADR-0017；机器可读字段见侧车 preview_disclosure）
> - capability: capability 1 of 5 · preview
> - calibration_scope: 单仓校准（Xxx91n/env-manager，codelore 0.28.0 实跑）；behavior 切片=preview 位
> - structural_limitations: 行为面仅 churn/hotspot/coupling 三族（function-coupling --target 参数面暂缓）；同主试点仓校准非泛化证据（dogfooding=generative not evaluative，D-033）；strategy/structure/supply-chain 本票不裁（归位=切片决策，各象限判据独立）
> - not_in_preview: function-coupling / structure 象限 / supply-chain 象限 / Micro-B / Macro-A

## C1 执行摘要

- report_id: MA-51-ENVMANAGER-BEHAVIOR
- schema_version: 1.1.0
- scale: Macro-B
- subject_ref: Xxx91n/env-manager
- generated_at: 2026-09-16T23:50:06.764Z
- correlation_key: trace_id=51be51be51be51be51be51be51be51be baggage_id=211505f9ea95d3eb94170cda0d77183d
- overall_verdict: supported
- confidence: 0.6
- headline: Macro-B behavior 象限接入：codelore churn/hotspot/coupling 切片（hotspot_top=scripts/build.mjs(revs=17,score=6.78)）
- degraded_mode: false
- stale_data_marker: fresh（SLA 86400s / 实测延迟 0s）
- read_model_version: 1.1.0 · fact_watermark_version: 4
- top_findings: scripts/build.mjs(revs=17,score=6.78), frontend/src-tauri/src/main.rs(revs=69,score=4.41), frontend/src/lib/i18n.ts(revs=13,score=1.48), coupling_pairs=241
- fact_ids: 4 条（清单见侧车 JSON）

## C2 四象限与裁决

### behavior（applicability=native）
- verdict: supported · score: n/a · confidence: 0.6
- dimensions: 
- slice_fields: {"faces":["hotspots","coupling","function-hotspots"],"face_row_counts":{"hotspots":116,"coupling":241,"function_hotspots":41},"hotspot_top":["scripts/build.mjs(revs=17,score=6.78)","frontend/src-tauri/src/main.rs(revs=69,score=4.41)","frontend/src/lib/i18n.ts(revs=13,score=1.48)"],"coupling_pairs":241,"min_revs":5,"sample_met":true,"deferred_faces":["function-coupling(--target)"],"quadrant_assignment":"slice-decision（facts 共享 quadrant=strategic/codelore 族 provenance 不改写；象限归属=报告切片决策 D-054③）"}
- conflict_markers: (none)
- verdict_gate: ADR-0013-C/v1 / supported / threshold_met=true / decided_at=2026-09-16T23:50:07.554Z / audit_ref=51-behavior-criteria.md

### strategy（applicability=not_applicable）
- verdict: insufficient · score: n/a · confidence: 0
- dimensions: 
- slice_fields: {}
- conflict_markers: (none)
- verdict_gate: ADR-0013-C/v1 / insufficient / threshold_met=false / decided_at=2026-09-16T23:50:07.554Z / audit_ref=51-behavior-criteria.md

### structure（applicability=not_applicable）
- verdict: insufficient · score: n/a · confidence: 0
- dimensions: 
- slice_fields: {}
- conflict_markers: (none)
- verdict_gate: ADR-0013-C/v1 / insufficient / threshold_met=false / decided_at=2026-09-16T23:50:07.554Z / audit_ref=51-behavior-criteria.md

### supply_chain（applicability=not_applicable）
- verdict: insufficient · score: n/a · confidence: 0
- dimensions: 
- slice_fields: {}
- conflict_markers: (none)
- verdict_gate: ADR-0013-C/v1 / insufficient / threshold_met=false / decided_at=2026-09-16T23:50:07.554Z / audit_ref=51-behavior-criteria.md

#### 结构化裁决块（agent 可消费）
- protocol_version: ADR-0013-C/v1
- overall: supported · decided_at: 2026-09-16T23:50:07.554Z
- PC-1: supported | basis=B1+B4 | facts=d32ae7ca-600c-7f90-d9c4-d5577b4e8881,133915a8-cd1a-005b-6856-f73cfffa570d,203abe7e-e972-7b65-f554-66b4e64e3cee | evidence=(none) | 行为三面 facet_rows 齐备性（hotspots/coupling/function-hotspots 各 row_count>0，errFacts=0）
- TC-1: supported | basis=B1 | facts=d32ae7ca-600c-7f90-d9c4-d5577b4e8881 | evidence=EV-B-HOTSPOTS | 低样本判据：hotspots min(revisions)>=5（实测 min=5）
- TC-2: supported | basis=B1 | facts=133915a8-cd1a-005b-6856-f73cfffa570d | evidence=EV-B-COUPLING | coupling shared>=2&degree>0 占比=1.000（阈值 0.5）
- NC-1: supported | basis=B1 | facts=(none) | evidence=(none) | function-coupling（--target 参数面）暂缓如实登记——deferred_faces 写入切片字段
- human_adjudication: pending（裁定仍由人做，见 B5）

## C3 证据

### EV-B-HOTSPOTS — codelore analyze hotspots @ 51-behavior-schema.json#hotspots
- claim: hotspots 面列集＋revisions 全行>=5
- grounded: true · collected_at: 2026-09-16T23:50:06.764Z
- reproduce_cmd: codelore analyze --analysis hotspots --format json --repo <env-manager>
- 引文原文: columns: path,revisions,cognitive,cognitive_health,hotspot_score,mi,mi_rank,ai_pct,hotspot_score_anchored

### EV-B-COUPLING — codelore analyze coupling @ 51-behavior-schema.json#coupling
- claim: coupling 面列集＋shared/degree 有效
- grounded: true · collected_at: 2026-09-16T23:50:06.764Z
- reproduce_cmd: codelore analyze --analysis coupling --format json --repo <env-manager>
- 引文原文: columns: entity_a,entity_b,shared,revs_a,revs_b,average_revs,degree,fisher_p

### EV-B-FHOTSPOTS — codelore analyze function-hotspots @ 51-behavior-schema.json#function-hotspots
- claim: function-hotspots 面列集
- grounded: true · collected_at: 2026-09-16T23:50:06.764Z
- reproduce_cmd: codelore analyze --analysis function-hotspots --format json --repo <env-manager>
- 引文原文: columns: path,function,revs,cognitive,cognitive_health,function_hotspot_score

#### 引文→结论支持关系校验
- C-EV-B-HOTSPOTS -> EV-B-HOTSPOTS: supports（matched=hotspot_score|revisions missing=）全部支撑锚在引文原文中逐字命中
- C-EV-B-COUPLING -> EV-B-COUPLING: supports（matched=entity_a|entity_b|degree|fisher_p missing=）全部支撑锚在引文原文中逐字命中
- C-EV-B-FHOTSPOTS -> EV-B-FHOTSPOTS: supports（matched=function|function_hotspot_score missing=）全部支撑锚在引文原文中逐字命中

## C4 行动建议

### R-51-1 [P2] behavior 象限 preview 位维持：churn/hotspot/coupling 三面接 codelore（min_revs=5 阈值惯例）
- rationale: behavior 切片已落（native 象限）——低样本仓信度披露靠 TC-1 判据守住
- expected_impact: Macro-B 四象限名实落差收窄为 strategy+behavior 双 active · effort: 本票已付
- verdict_gate_stamp: supported
- evidence_refs: EV-B-HOTSPOTS, EV-B-COUPLING
- degraded_note: (none)

