# MA-23-6F-FIRST-REPORT-degraded — Macro-B 首报（6F@fc00d458e215cc9a7a26af81626dec8712622821）
> RECEIPT RCP-1f603ed7b3032f0a chain=1f603ed7b3032f0af92e05a4152def62 content=abbdbb901a374b7b facts=0 adjudications=6 issued_at=2026-09-13T14:31:09+08:00 commit=fc00d458e215cc9a7a26af81626dec8712622821 tree=6f405cfc2ce5 ⚠ unverified
>
> 骨架 1.1.0（章顺序锁定，ADR-0006）· 裁定协议 ADR-0013-C/v1 · 生成于 2026-09-13T14:31:09+08:00
>
> 降级产出：FP-2 Macro-B failure：docs/adr 采集域返回空事实（采集缺口，data doesn't show），主前提不可裁定并发 GapRequest ⚠ unverified

## C1 执行摘要

- report_id: MA-23-6F-FIRST-REPORT-degraded
- schema_version: 1.1.0
- scale: Macro-B
- subject_ref: 6F@fc00d458e215cc9a7a26af81626dec8712622821
- generated_at: 2026-09-13T14:31:09+08:00
- correlation_key: trace_id=6cb1035d33437cf94e987c26b0e77b5b baggage_id=8b8feb7ab1958bbb7a9b090d6248c599
- overall_verdict: insufficient
- confidence: 0
- headline: 6F 首报：主前提「ADR 具备可机器核验的决策记录结构」在 TC-2 被证伪（mean_ratio 0.2462 < 0.60，Status/Date 缺失率 84.62%）；TC-1 因可判定数 2 < 门槛 5 判 INCONCLUSIVE；TC-3 判 AMBER；综合裁定 unsupported。
- degraded_mode: true
- stale_data_marker: unknown（SLA 5s / 实测延迟 0s）
- read_model_version: 1.1.0 · fact_watermark_version: 1
- top_findings: EV-006, EV-007, EV-008
- fact_ids: 0 条（清单见侧车 JSON）

## C2 四象限与裁决

### strategy（applicability=native）
- verdict: insufficient · score: n/a · confidence: 0
- dimensions: S1, S2
- slice_fields: {"s1_keyword_coverage_ratio":0.6,"s2_five_piece_mean_ratio":0.2462}
- conflict_markers: degraded
- verdict_gate: ADR-0013-C/v1 / insufficient / threshold_met=false / decided_at=2026-09-13T14:31:09+08:00 / audit_ref=.scratch/architecture-recovery/reports/22-c-adjudication-basis.md

### structure（applicability=not_applicable）
- verdict: insufficient · score: n/a · confidence: 0
- dimensions: 
- slice_fields: {}
- conflict_markers: out-of-scope-R3-01, degraded
- verdict_gate: ADR-0013-C/v1 / insufficient / threshold_met=false / decided_at=2026-09-13T14:31:09+08:00 / audit_ref=.scratch/architecture-recovery/reports/22-c-adjudication-basis.md

### behavior（applicability=not_applicable）
- verdict: insufficient · score: n/a · confidence: 0
- dimensions: 
- slice_fields: {}
- conflict_markers: out-of-scope-R3-01, degraded
- verdict_gate: ADR-0013-C/v1 / insufficient / threshold_met=false / decided_at=2026-09-13T14:31:09+08:00 / audit_ref=.scratch/architecture-recovery/reports/22-c-adjudication-basis.md

### supply_chain（applicability=not_applicable）
- verdict: insufficient · score: n/a · confidence: 0
- dimensions: 
- slice_fields: {}
- conflict_markers: out-of-scope-R3-01, degraded
- verdict_gate: ADR-0013-C/v1 / insufficient / threshold_met=false / decided_at=2026-09-13T14:31:09+08:00 / audit_ref=.scratch/architecture-recovery/reports/22-c-adjudication-basis.md

#### 结构化裁决块（agent 可消费）
- protocol_version: ADR-0013-C/v1
- overall: insufficient · decided_at: 2026-09-13T14:31:09+08:00
- PC-1: insufficient | basis=B1+B4 | facts=(none) | evidence=(none) | 降级：FP-2 Macro-B failure：docs/adr 采集域返回空事实（采集缺口，data doesn't show），主前提不可裁定并发 GapRequest
- PC-2: insufficient | basis=B1+B4 | facts=(none) | evidence=(none) | 降级：FP-2 Macro-B failure：docs/adr 采集域返回空事实（采集缺口，data doesn't show），主前提不可裁定并发 GapRequest
- TC-1: insufficient | basis=B1+B4 | facts=(none) | evidence=(none) | 降级：FP-2 Macro-B failure：docs/adr 采集域返回空事实（采集缺口，data doesn't show），主前提不可裁定并发 GapRequest
- TC-2: insufficient | basis=B1+B4 | facts=(none) | evidence=(none) | 降级：FP-2 Macro-B failure：docs/adr 采集域返回空事实（采集缺口，data doesn't show），主前提不可裁定并发 GapRequest
- TC-3: insufficient | basis=B1+B4 | facts=(none) | evidence=(none) | 降级：FP-2 Macro-B failure：docs/adr 采集域返回空事实（采集缺口，data doesn't show），主前提不可裁定并发 GapRequest
- NC-1: insufficient | basis=B1+B4 | facts=(none) | evidence=(none) | 降级：FP-2 Macro-B failure：docs/adr 采集域返回空事实（采集缺口，data doesn't show），主前提不可裁定并发 GapRequest
- human_adjudication: pending（裁定仍由人做，见 B5）

## C3 证据

### EV-001 — .scratch/architecture-recovery/reports/22-criteria-pre-registration.md @ L100
- claim: 预声明（跑前写死）：TC-2 mean_ratio = 0.2462，判 RED
- grounded: false · collected_at: 2026-09-13T14:31:09+08:00
- reproduce_cmd: (absent: FP-2 Macro-B failure：docs/adr 采集域返回空事实（采集缺口，data doesn't show），主前提不可裁定并发 GapRequest)
- 引文原文: （缺失 —— ⚠ unverified）

### EV-002 — .scratch/architecture-recovery/reports/22-criteria-pre-registration.md @ L67
- claim: 预声明：TC-1 可判定数 2 < 门槛 5，判 INCONCLUSIVE
- grounded: false · collected_at: 2026-09-13T14:31:09+08:00
- reproduce_cmd: (absent: FP-2 Macro-B failure：docs/adr 采集域返回空事实（采集缺口，data doesn't show），主前提不可裁定并发 GapRequest)
- 引文原文: （缺失 —— ⚠ unverified）

### EV-003 — .scratch/architecture-recovery/reports/22-criteria-pre-registration.md @ L126
- claim: 预声明：TC-3 最低 ratio = 0.6000，判 AMBER
- grounded: false · collected_at: 2026-09-13T14:31:09+08:00
- reproduce_cmd: (absent: FP-2 Macro-B failure：docs/adr 采集域返回空事实（采集缺口，data doesn't show），主前提不可裁定并发 GapRequest)
- 引文原文: （缺失 —— ⚠ unverified）

### EV-004 — docs/adr/0012-value-validation-loop-first.md @ L14
- claim: ADR-0012：阶段 1 = 6F 自身 Macro-B happy path 出首报
- grounded: false · collected_at: 2026-09-13T14:31:09+08:00
- reproduce_cmd: (absent: FP-2 Macro-B failure：docs/adr 采集域返回空事实（采集缺口，data doesn't show），主前提不可裁定并发 GapRequest)
- 引文原文: （缺失 —— ⚠ unverified）

### EV-005 — docs/adr/0013-three-layer-acceptance-gates.md @ L14
- claim: ADR-0013：首报验收 = A→B→C 三层串行闸门
- grounded: false · collected_at: 2026-09-13T14:31:09+08:00
- reproduce_cmd: (absent: FP-2 Macro-B failure：docs/adr 采集域返回空事实（采集缺口，data doesn't show），主前提不可裁定并发 GapRequest)
- 引文原文: （缺失 —— ⚠ unverified）

### EV-006 — .scratch/architecture-recovery/reports/23-measurements.json @ L19
- claim: 本次实测：TC-2 mean_ratio（4 位小数）
- grounded: false · collected_at: 2026-09-13T14:31:09+08:00
- reproduce_cmd: (absent: FP-2 Macro-B failure：docs/adr 采集域返回空事实（采集缺口，data doesn't show），主前提不可裁定并发 GapRequest)
- 引文原文: （缺失 —— ⚠ unverified）

### EV-007 — .scratch/architecture-recovery/reports/23-measurements.json @ L7
- claim: 本次实测：TC-1 可判定数
- grounded: false · collected_at: 2026-09-13T14:31:09+08:00
- reproduce_cmd: (absent: FP-2 Macro-B failure：docs/adr 采集域返回空事实（采集缺口，data doesn't show），主前提不可裁定并发 GapRequest)
- 引文原文: （缺失 —— ⚠ unverified）

### EV-008 — .scratch/architecture-recovery/reports/23-measurements.json @ L77
- claim: 本次实测：TC-3 最低覆盖率（4 位小数）
- grounded: false · collected_at: 2026-09-13T14:31:09+08:00
- reproduce_cmd: (absent: FP-2 Macro-B failure：docs/adr 采集域返回空事实（采集缺口，data doesn't show），主前提不可裁定并发 GapRequest)
- 引文原文: （缺失 —— ⚠ unverified）

### EV-009 — .scratch/architecture-recovery/reports/23-measurements.json @ L88
- claim: 本次实测：NC-1 负对照选材五件套命中数（预期 0）
- grounded: false · collected_at: 2026-09-13T14:31:09+08:00
- reproduce_cmd: (absent: FP-2 Macro-B failure：docs/adr 采集域返回空事实（采集缺口，data doesn't show），主前提不可裁定并发 GapRequest)
- 引文原文: （缺失 —— ⚠ unverified）

### EV-010 — .scratch/architecture-recovery/reports/23-measurements.json @ L99
- claim: 本次实测：PC-1 正对照 golden ADR 的 supersede 链命中
- grounded: false · collected_at: 2026-09-13T14:31:09+08:00
- reproduce_cmd: (absent: FP-2 Macro-B failure：docs/adr 采集域返回空事实（采集缺口，data doesn't show），主前提不可裁定并发 GapRequest)
- 引文原文: （缺失 —— ⚠ unverified）

### EV-011 — .scratch/architecture-recovery/reports/23-measurements.json @ L106
- claim: 本次实测：PC-2 正对照事后补写 ADR 的 delta_days
- grounded: false · collected_at: 2026-09-13T14:31:09+08:00
- reproduce_cmd: (absent: FP-2 Macro-B failure：docs/adr 采集域返回空事实（采集缺口，data doesn't show），主前提不可裁定并发 GapRequest)
- 引文原文: （缺失 —— ⚠ unverified）

#### 引文→结论支持关系校验
- CL-001 -> EV-006: insufficient（matched= missing=mean_ratio_4|0.2462）引文未落地（grounded=false 或 excerpt 为空）——有引文不等于支撑结论
- CL-002 -> EV-007: insufficient（matched= missing=judgeable_n|2）引文未落地（grounded=false 或 excerpt 为空）——有引文不等于支撑结论
- CL-003 -> EV-008: insufficient（matched= missing=lowest_ratio_4|0.6000）引文未落地（grounded=false 或 excerpt 为空）——有引文不等于支撑结论
- CL-004 -> EV-001: insufficient（matched= missing=0.2462）引文未落地（grounded=false 或 excerpt 为空）——有引文不等于支撑结论
- CL-005 -> EV-002: insufficient（matched= missing=INCONCLUSIVE|可判定数）引文未落地（grounded=false 或 excerpt 为空）——有引文不等于支撑结论
- CL-006 -> EV-003: insufficient（matched= missing=AMBER|0.6000）引文未落地（grounded=false 或 excerpt 为空）——有引文不等于支撑结论
- CL-007 -> EV-004: insufficient（matched= missing=阶段 1 = Macro-B）引文未落地（grounded=false 或 excerpt 为空）——有引文不等于支撑结论
- CL-008 -> EV-005: insufficient（matched= missing=A→B→C）引文未落地（grounded=false 或 excerpt 为空）——有引文不等于支撑结论
- CL-009 -> EV-009: insufficient（matched= missing=five_piece_present|0）引文未落地（grounded=false 或 excerpt 为空）——有引文不等于支撑结论
- CL-010 -> EV-010: insufficient（matched= missing=golden_supersede_hit_s|true）引文未落地（grounded=false 或 excerpt 为空）——有引文不等于支撑结论
- CL-011 -> EV-011: insufficient（matched= missing=delta_days_s|255）引文未落地（grounded=false 或 excerpt 为空）——有引文不等于支撑结论

## C4 行动建议

### R-23-1 [P0] 为 docs/adr 全集 13 份补 Status/Date YAML 头，使 S2 事后补写判据可执行
- rationale: TC-1 可判定数 2 < 门槛 5，根因是 11/13 ADR 无 Date 头（缺失率 84.62%）
- expected_impact: TC-1 由 INCONCLUSIVE 转为可判定，S2 阈值获得 assay sensitivity · effort: S
- verdict_gate_stamp: insufficient ⚠ unverified
- evidence_refs: EV-002, EV-006, EV-007
- degraded_note: 降级产出：FP-2 Macro-B failure：docs/adr 采集域返回空事实（采集缺口，data doesn't show），主前提不可裁定并发 GapRequest ⚠ unverified

### R-23-2 [P1] 把 ADR 中文结构标记口径登记为 v2 追加（新开账本条目 + v1 留档），不在首报后静默重判
- rationale: adr-structure@v1 只识别英文标记，6F 的 ADR-0001~0007 以 H1 + 自由正文书写；这是口径事实不是误报，改口径属改向
- expected_impact: 消除 TC-2 RED 的口径歧义，保留 v1 结果可比性 · effort: M
- verdict_gate_stamp: insufficient ⚠ unverified
- evidence_refs: EV-001, EV-006
- degraded_note: 降级产出：FP-2 Macro-B failure：docs/adr 采集域返回空事实（采集缺口，data doesn't show），主前提不可裁定并发 GapRequest ⚠ unverified

### R-23-3 [P2] 把 23-first-report.json 侧车作为 Agent Plugin 的裁决块契约候选，落 R3-D7 分发前置清单
- rationale: A-027 要求裁决块结构化、引文锚可解析；侧车已含 verdict 枚举 + evidence_id/source/locator 三元组
- expected_impact: 下游 agent 可直接消费裁决而不必解析 md · effort: S
- verdict_gate_stamp: insufficient ⚠ unverified
- evidence_refs: EV-005
- degraded_note: 降级产出：FP-2 Macro-B failure：docs/adr 采集域返回空事实（采集缺口，data doesn't show），主前提不可裁定并发 GapRequest ⚠ unverified


