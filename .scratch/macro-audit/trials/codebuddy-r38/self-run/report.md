# MA-AUDIT-6F-MACRO-B — Macro-B 首报（6F@35c0a39bfe04）
> RECEIPT RCP-5a08958b6d5b290f chain=5a08958b6d5b290fc91c354ab1d57923 content=9642c3b59fb2ed46 facts=797 adjudications=10 issued_at=2026-09-27T15:40:17+08:00 commit=35c0a39bfe040141cf50addb4acbe6ea1528dd63 tree=f006572a596b
>
> 骨架 1.2.0（章顺序锁定，ADR-0006）· 裁定协议 ADR-0013-C/v1 · 生成于 2026-09-27T15:40:17+08:00
> - stability: preview · capabilities: macro-b
>
> 披露块（preview 标注诚实 = 决策本体，ADR-0017；机器可读字段见侧车 preview_disclosure）
> - capability: capability 1 of 5 · preview
> - calibration_scope: 6F Macro-B audit（audit 一等命令面；scale=Macro-B 已上架）
> - structural_limitations: one-shot 快照审计：本报告裁定=对 snapshot_fetched_at=null 时点快照的实测——快照时点如实披露；采集面=strategy（S1+S2）＋behavior（codelore 行为三面）；structure/supply_chain 象限 not_applicable（supply-chain: ⚠ unverified——Scorecard 未接入，D-034③）；反复接受非跑通（D-033）：TC 三档裁定 supported/unsupported/insufficient 如实落数，one-shot 校准+冒烟不构成泛化证据
> - not_in_preview: Micro-A / Macro-C / Macro-A

## C1 执行摘要

- report_id: MA-AUDIT-6F-MACRO-B
- schema_version: 1.2.0
- scale: Macro-B
- subject_ref: 6F@35c0a39bfe04
- generated_at: 2026-09-27T15:40:17+08:00
- correlation_key: trace_id=f222e73d5db5c3cbcde3e54fa0020f69 baggage_id=f222e73d5db5c3cbcde3e54fa0020f69
- overall_verdict: supported
- confidence: 0.6
- headline: 6F Macro-B audit（capability 1 of 5 · preview）：306 commits / ADR 23 份 / facts 797——TC-1 NOT_RED（n=23）、TC-2 NOT_RED（mean=1.0000）、TC-3 GREEN（0.7500）＋behavior supported→ 综合裁定 supported（三档如实落数）。
- degraded_mode: false
- stale_data_marker: fresh（SLA 86400s / 实测延迟 0s）
- read_model_version: 1.2.0 · fact_watermark_version: 1
- top_findings: EV-AUDIT-6F-01, EV-AUDIT-6F-03, EV-AUDIT-6F-04
- fact_ids: 797 条（清单见侧车 JSON）

## C2 四象限与裁决

### strategy（applicability=native）
- verdict: supported · score: n/a · confidence: 0.6
- dimensions: S1, S2
- slice_fields: {"s1_keyword_coverage_ratio":0.75,"s2_five_piece_mean_ratio":1,"adr_count":23,"lag_judgeable_n":23,"intent_docs":3}
- conflict_markers: (none)
- verdict_gate: ADR-0013-C/v1 / supported / evidence_flag=false / decided_at=2026-09-27T15:40:17+08:00 / audit_ref=engine/src/audit/audit.ts

### behavior（applicability=native）
- verdict: supported · score: n/a · confidence: 0.6
- dimensions: 
- slice_fields: {"faces":["hotspots","coupling","function-hotspots"],"face_row_counts":{"hotspots":83,"coupling":131,"function_hotspots":35},"hotspot_top":["engine/dist/cli.js(revs=23,score=8.67)","engine/src/cli.ts(revs=15,score=7.95)",".scratch/architecture-recovery/reports/33-check.mjs(revs=11,score=4.02)"],"coupling_pairs":131,"min_revs":5,"sample_met":true,"deferred_faces":["function-coupling(--target)"],"quadrant_assignment":"slice-decision（facts 共享 quadrant=strategic/codelore 族 provenance 不改写；象限归属=报告切片决策 D-054③）"}
- conflict_markers: (none)
- verdict_gate: ADR-0013-C/v1 / supported / evidence_flag=true / decided_at=2026-09-27T15:40:17+08:00 / audit_ref=engine/src/audit/audit.ts

### structure（applicability=not_applicable）
- verdict: insufficient · score: n/a · confidence: 0
- dimensions: 
- slice_fields: {}
- conflict_markers: out-of-scope-stage1
- verdict_gate: ADR-0013-C/v1 / insufficient / evidence_flag=false / decided_at=2026-09-27T15:40:17+08:00 / audit_ref=engine/src/audit/audit.ts

### supply_chain（applicability=not_applicable）
- verdict: insufficient · score: n/a · confidence: 0
- dimensions: 
- slice_fields: {}
- conflict_markers: data-not-connected
- verdict_gate: ADR-0013-C/v1 / insufficient / evidence_flag=false / decided_at=2026-09-27T15:40:17+08:00 / audit_ref=engine/src/audit/audit.ts

#### 结构化裁决块（agent 可消费）
- protocol_version: ADR-0013-C/v1
- overall: supported · decided_at: 2026-09-27T15:40:17+08:00
- PC-1: supported | basis=B1 | facts=495cffc0-1a01-15ca-c697-082c834b2d70,d160b8b6-182c-ff39-4a53-f01ee2c86d86 | evidence=EV-AUDIT-6F-01 | adr-structure 与 positioning 两族均产出非空事实，golden ADR 五件套 5/5 且 supersede 链命中（6F run 内管线活性正对照）
- PC-2: supported | basis=B1 | facts=87c7ab47-6cc7-4ef0-8974-b57bba846570 | evidence=EV-AUDIT-6F-01 | gitlog 族检出事后补写 delta_days = 255
- TC-1: supported | basis=B2 | facts=f44a496a-ea38-946a-541f-95b394fe14b8,3b703a8b-b7f0-0bfd-35a0-9bac0f853aca,cf848724-f97a-ad23-ff3f-b103adaa9602,973051b1-e2ae-6e65-5acd-3eb5f6353720,ba928c1b-abcf-eee5-9289-525a1470502c,fffc5280-98a5-88ff-003b-9c21f0e12c85,7096cfae-bb98-8c0b-2cdb-5302357537c2,ef075e4a-f1ce-02be-0be6-173949590cde,c8cb92ea-a191-6e77-d5b2-56410463150d,7abbd5b9-71e5-61c1-8f2b-06e4d5679701,b0d4b58b-551d-a2f4-9954-09e16577a35d,20eef7d4-ff07-d6b7-cf3f-80006d462f92,173109df-3de3-af39-f058-ff3561158ee4,4985a949-be47-34ec-2b44-063854f1dc3d,b526fbdf-2488-20a6-357f-e8a0c2da953a,95f98717-c37c-e3c4-2e64-a966820536bb,6c082ec1-4623-fd49-3894-61366bd397b8,9a345edd-6cdd-18c9-f294-b320f616a26f,1cf5b486-2a0d-c23e-2327-d439be5b46cc,cd8c5ff8-fe15-faef-5c26-4927b5aad2b7,4e2dfdcf-76c6-6f35-2a88-6010fd536195,8e077b60-0275-e40e-3b49-89028f98d975,a1717158-7610-7a4e-8485-49df54d45774 | evidence=EV-AUDIT-6F-02 | 6F ADR 事后补写：可判定数 23（门槛 5），>90d 占比 0.0000，判 NOT_RED（派生统计 over 306 commits；quarantined 日期 commit 排除 0）
- TC-2: supported | basis=B2 | facts=87332873-f85b-43ed-7073-f1cf1896a7b0,c9d135dd-8383-12dd-a60b-593aa9153580,fc9dd2e7-8c48-fd18-880e-f23cc21a16d5,0f23b913-6360-af48-b4df-84c962948989,9a173a25-ed0d-92a5-8075-0d2af649c1e3,16dea260-0730-016a-6d8f-2926a5aba637,e2a09d6f-1473-a76b-e1ad-bf9a9d604f7d,42771836-6621-2fc6-f16a-e1de230fa9dc,7177c023-2162-c405-65bb-e6a479ff60b3,eb5f018e-84b7-be51-cf76-b3253e986c32,892763bf-48e9-0a60-2b99-68dc8882a634,b9c38658-e26a-7aaa-14bd-3140dc749404,6c0d8eab-15b3-57b2-2ec8-3aaa1fdd4f2c,997e0d07-3665-f114-048e-8adb934c3457,1361a2b0-04b2-f229-78d3-8f764d958e2a,e5ae1b8c-95d0-0f81-ba90-ff0a99caeeff,bddb8cfe-c5e5-0b81-cda1-3274e67ec4df,a5cdf8b9-a2be-ef79-44be-47d6ad5d6625,33e3cb87-4b45-eefd-9e1d-0e93cf9d4391,2fddf02b-55de-d4d1-ad2c-926341b37a0a,93f4187e-98cd-8f04-5099-76044bbe83dd,daf7d222-efb7-6716-dbc9-387b6e17ec72,eafc8700-2aaa-ee57-0f75-2ebbfbb7c90f | evidence=EV-AUDIT-6F-03 | 6F ADR 五件套：mean_ratio 1.0000（门槛 0.6），字段缺失率超线=false，判 NOT_RED
- TC-3: supported | basis=B2 | facts=7562e78a-2e17-bc16-4d55-4ce3b62f015f,e2860c6f-a569-236e-d18c-9e629c777526,29498c42-533d-9463-f7aa-4ae12b9e16aa | evidence=EV-AUDIT-6F-04 | 6F 定位覆盖：意图面 3 件最低 ratio 0.7500（README.md），判 GREEN
- NC-1: supported | basis=B4 | facts=a36fec28-1b1f-dd30-3a7f-b5d0a8c043a1 | evidence=EV-AUDIT-6F-05 | 负对照选材 6F/README.md 五件套 0 命中、supersede 0 命中（特异性成立）
- BHV-PC-1: supported | basis=B1 | facts=54ae67da-92e7-380a-4b47-506fee9e1a21,72da1101-f159-de43-27d9-11f820f6273a,81f6cb03-e87e-d117-d8b1-384c5c8e8d95 | evidence=EV-AUDIT-6F-01 | 行为三面 per-file 重算齐备性（file_facet_row 三面各 >0 行，errFacts=0，聚合↔per-file 对账 match=true）
- BHV-TC-1: supported | basis=B1 | facts=54ae67da-92e7-380a-4b47-506fee9e1a21 | evidence=EV-AUDIT-6F-01 | 低样本判据：hotspots min(revisions)>=5（实测 min=5）
- BHV-TC-2: supported | basis=B1 | facts=72da1101-f159-de43-27d9-11f820f6273a | evidence=EV-AUDIT-6F-01 | coupling shared>=2&degree>0 占比=1.000（阈值 0.5）
- BHV-NC-1: supported | basis=B1 | facts=(none) | evidence=(none) | function-coupling（--target 参数面）暂缓如实登记——deferred_faces 写入切片字段
- human_adjudication: pending（裁定仍由人做，见 B5）

## C3 证据

### EV-AUDIT-6F-01 — audit-measurements.json @ L14
- claim: 本次实测：6F Macro-B audit 采集事实数
- grounded: true · collected_at: 2026-09-27T15:40:17+08:00
- reproduce_cmd: macro-audit audit d:/Aworker/6F --out d:/Aworker/6F/.scratch/macro-audit/trials/codebuddy-r38/self-run
- 引文原文: "fact_count": 797,

### EV-AUDIT-6F-02 — audit-measurements.json @ L69
- claim: 本次实测：6F TC-1 ADR 事后补写判据裁定（NOT_RED）
- grounded: true · collected_at: 2026-09-27T15:40:17+08:00
- reproduce_cmd: macro-audit audit d:/Aworker/6F --out d:/Aworker/6F/.scratch/macro-audit/trials/codebuddy-r38/self-run
- 引文原文: "verdict": "NOT_RED",

### EV-AUDIT-6F-03 — audit-measurements.json @ L78
- claim: 本次实测：6F TC-2 五件套完整度 mean_ratio
- grounded: true · collected_at: 2026-09-27T15:40:17+08:00
- reproduce_cmd: macro-audit audit d:/Aworker/6F --out d:/Aworker/6F/.scratch/macro-audit/trials/codebuddy-r38/self-run
- 引文原文: "mean_ratio_4": "1.0000",

### EV-AUDIT-6F-04 — audit-measurements.json @ L123
- claim: 本次实测：6F TC-3 定位覆盖率最低值
- grounded: true · collected_at: 2026-09-27T15:40:17+08:00
- reproduce_cmd: macro-audit audit d:/Aworker/6F --out d:/Aworker/6F/.scratch/macro-audit/trials/codebuddy-r38/self-run
- 引文原文: "lowest_ratio_4": "0.7500",

### EV-AUDIT-6F-05 — audit-measurements.json @ L134
- claim: 本次实测：6F NC-1 负对照选材五件套命中数（预期 0）
- grounded: true · collected_at: 2026-09-27T15:40:17+08:00
- reproduce_cmd: macro-audit audit d:/Aworker/6F --out d:/Aworker/6F/.scratch/macro-audit/trials/codebuddy-r38/self-run
- 引文原文: "five_piece_present": 0,

### EV-AUDIT-6F-06 — docs/adr/0001-five-scale-scope.md @ L1
- claim: 6F ADR 语料锚：docs/adr/0001-five-scale-scope.md 实物存在（语料 23 份）
- grounded: true · collected_at: 2026-09-27T15:40:17+08:00
- reproduce_cmd: macro-audit audit d:/Aworker/6F --out d:/Aworker/6F/.scratch/macro-audit/trials/codebuddy-r38/self-run
- 引文原文: # 5 scale scope（宏观+微观=5 audit scales）

### EV-AUDIT-6F-07 — audit-measurements.json @ L21
- claim: 快照时点披露：6F intake snapshot_fetched_at=null（cache_hit=false refreshed=false；不自动 pull，--refresh 显式 opt-in）
- grounded: true · collected_at: 2026-09-27T15:40:17+08:00
- reproduce_cmd: macro-audit audit d:/Aworker/6F --out d:/Aworker/6F/.scratch/macro-audit/trials/codebuddy-r38/self-run
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
- field committer_date: total=306 clean=306 normalized=0 quarantined=0（恒等式=PASS）
- affected_commits（quarantined 去重）: 0
- quarantine_log.recorded_at（写入时点列）: 2026-09-27T15:40:17+08:00
- 派生统计排除声明：日期派生指标 over 306 commits（quarantined 排除 0；quarantined 日期 commit 禁入 first_commit/adr_lag 派生）
- 阈值纪律：单字段 quarantined/total > 0.001 → run 级裁定升级 unsupported；escalation=none
- quarantined rows: 无（摄入无病态=阴性自证）

