# MA-AUDIT-6F-MACRO-B — Macro-B 首报（6F@5f6a23bbc4e2）
> RECEIPT RCP-b13eb7e7dedaa764 chain=b13eb7e7dedaa764bcd0a73067448954 content=a11ee50535e1ecaa facts=608 adjudications=10 issued_at=2026-09-24T20:27:49+08:00 commit=5f6a23bbc4e233bf321bb46fcff6d93a8ce87cb3 tree=d0d45ffef59f
>
> 骨架 1.2.0（章顺序锁定，ADR-0006）· 裁定协议 ADR-0013-C/v1 · 生成于 2026-09-24T20:27:49+08:00
> - stability: preview · capabilities: macro-b
>
> 披露块（preview 标注诚实 = 决策本体，ADR-0017；机器可读字段见侧车 preview_disclosure）
> - capability: capability 1 of 5 · preview
> - calibration_scope: 6F Macro-B audit（audit 一等命令面；scale=Macro-B 已上架）
> - structural_limitations: one-shot 快照审计：本报告裁定=对 snapshot_fetched_at=null 时点快照的实测——快照时点如实披露；采集面=strategy（S1+S2）＋behavior（codelore 行为三面）；structure/supply_chain 象限 not_applicable（supply-chain: ⚠ unverified——Scorecard 未接入，D-034③）；反复接受非跑通（D-033）：TC 三档裁定 supported/unsupported/insufficient 如实落数，one-shot 校准+冒烟不构成泛化证据
> - not_in_preview: Micro-A / Micro-B / Macro-C / Macro-A

## C1 执行摘要

- report_id: MA-AUDIT-6F-MACRO-B
- schema_version: 1.2.0
- scale: Macro-B
- subject_ref: 6F@5f6a23bbc4e2
- generated_at: 2026-09-24T20:27:49+08:00
- correlation_key: trace_id=7449788047899d4f7b143d47a59aa7ba baggage_id=7449788047899d4f7b143d47a59aa7ba
- overall_verdict: supported
- confidence: 0.6
- headline: 6F Macro-B audit（capability 1 of 5 · preview）：263 commits / ADR 23 份 / facts 608——TC-1 NOT_RED（n=23）、TC-2 NOT_RED（mean=1.0000）、TC-3 GREEN（0.7000）＋behavior supported→ 综合裁定 supported（三档如实落数）。
- degraded_mode: false
- stale_data_marker: fresh（SLA 86400s / 实测延迟 0s）
- read_model_version: 1.2.0 · fact_watermark_version: 1
- top_findings: EV-AUDIT-6F-01, EV-AUDIT-6F-03, EV-AUDIT-6F-04
- fact_ids: 608 条（清单见侧车 JSON）

## C2 四象限与裁决

### strategy（applicability=native）
- verdict: supported · score: n/a · confidence: 0.6
- dimensions: S1, S2
- slice_fields: {"s1_keyword_coverage_ratio":0.7,"s2_five_piece_mean_ratio":1,"adr_count":23,"lag_judgeable_n":23,"intent_docs":3}
- conflict_markers: (none)
- verdict_gate: ADR-0013-C/v1 / supported / evidence_flag=false / decided_at=2026-09-24T20:27:49+08:00 / audit_ref=engine/src/audit/audit.ts

### behavior（applicability=native）
- verdict: supported · score: n/a · confidence: 0.6
- dimensions: 
- slice_fields: {"faces":["hotspots","coupling","function-hotspots"],"face_row_counts":{"hotspots":70,"coupling":45,"function_hotspots":31},"hotspot_top":["engine/dist/cli.js(revs=18,score=8.43)","engine/src/cli.ts(revs=14,score=8.00)",".scratch/architecture-recovery/reports/33-check.mjs(revs=11,score=4.75)"],"coupling_pairs":45,"min_revs":5,"sample_met":true,"deferred_faces":["function-coupling(--target)"],"quadrant_assignment":"slice-decision（facts 共享 quadrant=strategic/codelore 族 provenance 不改写；象限归属=报告切片决策 D-054③）"}
- conflict_markers: (none)
- verdict_gate: ADR-0013-C/v1 / supported / evidence_flag=true / decided_at=2026-09-24T20:27:49+08:00 / audit_ref=engine/src/audit/audit.ts

### structure（applicability=not_applicable）
- verdict: insufficient · score: n/a · confidence: 0
- dimensions: 
- slice_fields: {}
- conflict_markers: out-of-scope-stage1
- verdict_gate: ADR-0013-C/v1 / insufficient / evidence_flag=false / decided_at=2026-09-24T20:27:49+08:00 / audit_ref=engine/src/audit/audit.ts

### supply_chain（applicability=not_applicable）
- verdict: insufficient · score: n/a · confidence: 0
- dimensions: 
- slice_fields: {}
- conflict_markers: data-not-connected
- verdict_gate: ADR-0013-C/v1 / insufficient / evidence_flag=false / decided_at=2026-09-24T20:27:49+08:00 / audit_ref=engine/src/audit/audit.ts

#### 结构化裁决块（agent 可消费）
- protocol_version: ADR-0013-C/v1
- overall: supported · decided_at: 2026-09-24T20:27:49+08:00
- PC-1: supported | basis=B1 | facts=8deaffc6-603c-196e-00f0-880432c0da06,b6b919de-b9d7-1ae6-9b1d-4ec3a95e67eb | evidence=EV-AUDIT-6F-01 | adr-structure 与 positioning 两族均产出非空事实，golden ADR 五件套 5/5 且 supersede 链命中（6F run 内管线活性正对照）
- PC-2: supported | basis=B1 | facts=95d26e10-1039-916c-9e7f-8860543e31c2 | evidence=EV-AUDIT-6F-01 | gitlog 族检出事后补写 delta_days = 255
- TC-1: supported | basis=B2 | facts=83df2a65-3939-eb68-d9bf-83f9dff00ba3,4ad168fb-8dc9-841a-174f-50e57c330b18,80dd2e46-d0db-b5da-8004-b4fdc849d5f1,ecc30a67-1f52-42ba-1754-daf36827b720,4deb7c4f-86dc-f223-eaf7-6dd70dd689bc,d12d4236-da62-ec7a-5b82-729e0c5c6f37,16416e9f-be9c-a575-5f25-a4fc2eb44a83,b2e1c76e-83e5-d5b3-7099-0215f0c1081d,13608207-3088-094f-b9f7-5ac563aaef7d,20947b4f-acd8-a8ff-309c-a93012aba0cf,0e0415c7-22d2-0a47-3f9c-581f0d3ea858,b4b09300-63a8-4e9b-7465-2209126441b8,fa469ad6-c874-8fe4-8b6d-f61f084253fa,501c29eb-a1fb-7a4c-fe84-4dc92b8943c7,d084d398-f8c8-3a63-d749-8f4bde49992c,c4ab7750-f63b-47f9-a4fe-8bb6c555c765,09d9333e-4e99-3ade-ca7b-4cce58e83b20,3fa734dc-a4d7-d0c2-58bc-0cccd46d737e,816b9447-d488-6e3b-de9c-5a1fab2930fe,6207ecdd-0413-e255-999a-504eb0d48939,5b5786ef-ce26-41b9-a950-90cc91ef57a1,4d246d90-bf40-654f-7e61-14cb53bb55f9,159eddaf-0149-46e7-38aa-83eadd55a268 | evidence=EV-AUDIT-6F-02 | 6F ADR 事后补写：可判定数 23（门槛 5），>90d 占比 0.0000，判 NOT_RED（派生统计 over 263 commits；quarantined 日期 commit 排除 0）
- TC-2: supported | basis=B2 | facts=723effc8-91f8-e204-0c26-5796e79bfeb9,ca9afa0b-92d1-a7e7-128f-043ed7cec27d,6a002e1a-77d0-54ee-a52c-7298c505dd51,5e493595-b5ba-cd86-235b-a7b2626a91ee,373e5c66-bfd5-8195-9d79-637c26abb435,b9f9a251-fa17-f37e-2b0b-a40a0112d9d6,88f7e42d-cc17-46d8-39aa-f55adbdbe698,9135a143-6a7f-3f34-e234-0650d18a70f5,f17f7d0a-a392-1c8c-b7cc-0d6eaed00857,37d9786e-63e0-5850-0386-1683df590654,9fb9abb7-aeb3-85b3-116f-02b943f02d5b,a6e71938-65ae-3693-681c-33ad1466a7c2,08fa962f-4c51-b839-0f79-d91dcc9fbb74,f707ab5f-164d-722d-dc4f-4cb33d36fbc0,1ff1418e-7670-8ec2-16b2-1341476393a9,be0f8139-4fe0-6dc5-8338-63d1056d1804,9f0c9abc-d108-3733-b4ed-35ff03f6c55f,68664239-6d4a-65d7-c1d6-fa5c9c3c3483,473d7bc5-04c4-e70c-e42f-de20b6090df3,adafa398-b418-6bc3-d84d-f332de5b93f0,c1dd637d-f736-8cd5-7ac4-01f85d7a97c5,65e0798d-31e6-6907-1400-071c8aec0e4b,e929326d-f6c3-bb38-df98-ac7cda5f9a44 | evidence=EV-AUDIT-6F-03 | 6F ADR 五件套：mean_ratio 1.0000（门槛 0.6），字段缺失率超线=false，判 NOT_RED
- TC-3: supported | basis=B2 | facts=497fbe37-4148-acaa-4826-f492a7e76376,c51a94c4-e7ee-5154-a02a-bab658842620,8378556d-d50f-b35d-dd70-aae0a75aaf1e | evidence=EV-AUDIT-6F-04 | 6F 定位覆盖：意图面 3 件最低 ratio 0.7000（AGENTS.md），判 GREEN
- NC-1: supported | basis=B4 | facts=c3df5f8a-e4fb-a4ab-5e09-79f3db3173d7 | evidence=EV-AUDIT-6F-05 | 负对照选材 6F/README.md 五件套 0 命中、supersede 0 命中（特异性成立）
- BHV-PC-1: supported | basis=B1 | facts=8d880f3d-adb0-8bff-df56-4bd506deffb6,ae355980-748e-c6e1-9828-32b3ab8478fb,14d99e43-ddea-f765-612c-ff4985a30aff | evidence=EV-AUDIT-6F-01 | 行为三面 per-file 重算齐备性（file_facet_row 三面各 >0 行，errFacts=0，聚合↔per-file 对账 match=true）
- BHV-TC-1: supported | basis=B1 | facts=8d880f3d-adb0-8bff-df56-4bd506deffb6 | evidence=EV-AUDIT-6F-01 | 低样本判据：hotspots min(revisions)>=5（实测 min=5）
- BHV-TC-2: supported | basis=B1 | facts=ae355980-748e-c6e1-9828-32b3ab8478fb | evidence=EV-AUDIT-6F-01 | coupling shared>=2&degree>0 占比=1.000（阈值 0.5）
- BHV-NC-1: supported | basis=B1 | facts=(none) | evidence=(none) | function-coupling（--target 参数面）暂缓如实登记——deferred_faces 写入切片字段
- human_adjudication: pending（裁定仍由人做，见 B5）

## C3 证据

### EV-AUDIT-6F-01 — audit-measurements.json @ L14
- claim: 本次实测：6F Macro-B audit 采集事实数
- grounded: true · collected_at: 2026-09-24T20:27:49+08:00
- reproduce_cmd: macro-audit audit D:/Aworker/6F --out D:/Aworker/6F/.scratch/macro-audit/audits/r32/e2e-audit
- 引文原文: "fact_count": 608,

### EV-AUDIT-6F-02 — audit-measurements.json @ L69
- claim: 本次实测：6F TC-1 ADR 事后补写判据裁定（NOT_RED）
- grounded: true · collected_at: 2026-09-24T20:27:49+08:00
- reproduce_cmd: macro-audit audit D:/Aworker/6F --out D:/Aworker/6F/.scratch/macro-audit/audits/r32/e2e-audit
- 引文原文: "verdict": "NOT_RED",

### EV-AUDIT-6F-03 — audit-measurements.json @ L78
- claim: 本次实测：6F TC-2 五件套完整度 mean_ratio
- grounded: true · collected_at: 2026-09-24T20:27:49+08:00
- reproduce_cmd: macro-audit audit D:/Aworker/6F --out D:/Aworker/6F/.scratch/macro-audit/audits/r32/e2e-audit
- 引文原文: "mean_ratio_4": "1.0000",

### EV-AUDIT-6F-04 — audit-measurements.json @ L123
- claim: 本次实测：6F TC-3 定位覆盖率最低值
- grounded: true · collected_at: 2026-09-24T20:27:49+08:00
- reproduce_cmd: macro-audit audit D:/Aworker/6F --out D:/Aworker/6F/.scratch/macro-audit/audits/r32/e2e-audit
- 引文原文: "lowest_ratio_4": "0.7000",

### EV-AUDIT-6F-05 — audit-measurements.json @ L134
- claim: 本次实测：6F NC-1 负对照选材五件套命中数（预期 0）
- grounded: true · collected_at: 2026-09-24T20:27:49+08:00
- reproduce_cmd: macro-audit audit D:/Aworker/6F --out D:/Aworker/6F/.scratch/macro-audit/audits/r32/e2e-audit
- 引文原文: "five_piece_present": 0,

### EV-AUDIT-6F-06 — docs/adr/0001-five-scale-scope.md @ L1
- claim: 6F ADR 语料锚：docs/adr/0001-five-scale-scope.md 实物存在（语料 23 份）
- grounded: true · collected_at: 2026-09-24T20:27:49+08:00
- reproduce_cmd: macro-audit audit D:/Aworker/6F --out D:/Aworker/6F/.scratch/macro-audit/audits/r32/e2e-audit
- 引文原文: # 5 scale scope（宏观+微观=5 audit scales）

### EV-AUDIT-6F-07 — audit-measurements.json @ L21
- claim: 快照时点披露：6F intake snapshot_fetched_at=null（cache_hit=false refreshed=false；不自动 pull，--refresh 显式 opt-in）
- grounded: true · collected_at: 2026-09-24T20:27:49+08:00
- reproduce_cmd: macro-audit audit D:/Aworker/6F --out D:/Aworker/6F/.scratch/macro-audit/audits/r32/e2e-audit
- 引文原文: "snapshot_fetched_at": null,

#### 引文→结论支持关系校验
- CL-AUDIT-6F-01 -> EV-AUDIT-6F-01: supports（matched=fact_count missing=）全部支撑锚在引文原文中逐字命中（语境剥离后 presence-level 成立——非语义蕴含）
- CL-AUDIT-6F-02 -> EV-AUDIT-6F-02: supports（matched=verdict missing=）全部支撑锚在引文原文中逐字命中（语境剥离后 presence-level 成立——非语义蕴含）
- CL-AUDIT-6F-03 -> EV-AUDIT-6F-03: supports（matched=mean_ratio_4 missing=）全部支撑锚在引文原文中逐字命中（语境剥离后 presence-level 成立——非语义蕴含）
- CL-AUDIT-6F-04 -> EV-AUDIT-6F-04: supports（matched=lowest_ratio_4 missing=）全部支撑锚在引文原文中逐字命中（语境剥离后 presence-level 成立——非语义蕴含）
- CL-AUDIT-6F-05 -> EV-AUDIT-6F-05: supports（matched=five_piece_present missing=）全部支撑锚在引文原文中逐字命中（语境剥离后 presence-level 成立——非语义蕴含）
- CL-AUDIT-6F-06 -> EV-AUDIT-6F-07: supports（matched=snapshot_fetched_at missing=）全部支撑锚在引文原文中逐字命中（语境剥离后 presence-level 成立——非语义蕴含）

## C4 行动建议

### R-AUDIT-6F-1 [P2] 将本 run facts.duckdb 经 mcp.json MACRO_AUDIT_FACTS_DB 注册给宿主 agent——叙事段由宿主经 MCP facts 只读面生成（D-053 双轨）
- rationale: audit 命令=kernel 面一等公民入口；叙事职责不外携，宿主 agent 经 facts 投影消费
- expected_impact: 事实层→叙事层通道闭环 · effort: S
- verdict_gate_stamp: ADR-0013-C/v1 / supported
- evidence_refs: EV-AUDIT-6F-07
- degraded_note: (none)

### R-AUDIT-6F-2 [P2] 快照为本次 fetch/本地观测时点
- rationale: 快照时点披露已落（snapshot_fetched_at）；缓存命中与刷新区分如实
- expected_impact: staleness 风险如实披露 · effort: S
- verdict_gate_stamp: ADR-0013-C/v1 / supported
- evidence_refs: EV-AUDIT-6F-07
- degraded_note: (none)


## Intake Health

- 契约：ADR-0022 违约两级处置——协议级违约 fail-fast（崩溃桶工件），字段级病态=quarantine 桶隔离（判定/处置硬分界）
- field head_date: total=1 clean=1 normalized=0 quarantined=0（恒等式=PASS）
- field committer_date: total=263 clean=263 normalized=0 quarantined=0（恒等式=PASS）
- affected_commits（quarantined 去重）: 0
- quarantine_log.recorded_at（写入时点列）: 2026-09-24T20:27:49+08:00
- 派生统计排除声明：日期派生指标 over 263 commits（quarantined 排除 0；quarantined 日期 commit 禁入 first_commit/adr_lag 派生）
- 阈值纪律：单字段 quarantined/total > 0.001 → run 级裁定升级 unsupported；escalation=none
- quarantined rows: 无（摄入无病态=阴性自证）

