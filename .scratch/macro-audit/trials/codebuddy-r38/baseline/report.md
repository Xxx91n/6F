# MA-AUDIT-ENVMANAGER-MACRO-B — Macro-B 首报（env-manager@9eb8f24be508）
> RECEIPT RCP-47282fc519f562ec chain=47282fc519f562eca4335551d2dce6a0 content=51db8c2aa07abf09 facts=960 adjudications=10 issued_at=2026-09-15T01:58:42+08:00 commit=9eb8f24be508750f299e920d816ba9079771a3f1 tree=9e0d831f23c1
>
> 骨架 1.2.0（章顺序锁定，ADR-0006）· 裁定协议 ADR-0013-C/v1 · 生成于 2026-09-15T01:58:42+08:00
> - stability: preview · capabilities: macro-b
>
> 披露块（preview 标注诚实 = 决策本体，ADR-0017；机器可读字段见侧车 preview_disclosure）
> - capability: capability 1 of 5 · preview
> - calibration_scope: env-manager Macro-B audit（audit 一等命令面；scale=Macro-B 已上架）
> - structural_limitations: one-shot 快照审计：本报告裁定=对 snapshot_fetched_at=null 时点快照的实测——快照时点如实披露；采集面=strategy（S1+S2）＋behavior（codelore 行为三面）；structure/supply_chain 象限 not_applicable（supply-chain: ⚠ unverified——Scorecard 未接入，D-034③）；反复接受非跑通（D-033）：TC 三档裁定 supported/unsupported/insufficient 如实落数，one-shot 校准+冒烟不构成泛化证据
> - not_in_preview: Micro-A / Macro-C / Macro-A

## C1 执行摘要

- report_id: MA-AUDIT-ENVMANAGER-MACRO-B
- schema_version: 1.2.0
- scale: Macro-B
- subject_ref: env-manager@9eb8f24be508
- generated_at: 2026-09-15T01:58:42+08:00
- correlation_key: trace_id=80f38f01a5e92893d48ee8ba27ecc939 baggage_id=80f38f01a5e92893d48ee8ba27ecc939
- overall_verdict: supported
- confidence: 0.6
- headline: env-manager Macro-B audit（capability 1 of 5 · preview）：496 commits / ADR 14 份 / facts 960——TC-1 NOT_RED（n=14）、TC-2 NOT_RED（mean=0.7571）、TC-3 GREEN（0.8500）＋behavior supported→ 综合裁定 supported（三档如实落数）。
- degraded_mode: false
- stale_data_marker: fresh（SLA 86400s / 实测延迟 0s）
- read_model_version: 1.2.0 · fact_watermark_version: 1
- top_findings: EV-AUDIT-ENVMANAGER-01, EV-AUDIT-ENVMANAGER-03, EV-AUDIT-ENVMANAGER-04
- fact_ids: 960 条（清单见侧车 JSON）

## C2 四象限与裁决

### strategy（applicability=native）
- verdict: supported · score: n/a · confidence: 0.6
- dimensions: S1, S2
- slice_fields: {"s1_keyword_coverage_ratio":0.85,"s2_five_piece_mean_ratio":0.7571,"adr_count":14,"lag_judgeable_n":14,"intent_docs":3}
- conflict_markers: (none)
- verdict_gate: ADR-0013-C/v1 / supported / evidence_flag=false / decided_at=2026-09-15T01:58:42+08:00 / audit_ref=engine/src/audit/audit.ts

### behavior（applicability=native）
- verdict: supported · score: n/a · confidence: 0.6
- dimensions: 
- slice_fields: {"faces":["hotspots","coupling","function-hotspots"],"face_row_counts":{"hotspots":116,"coupling":241,"function_hotspots":41},"hotspot_top":["scripts/build.mjs(revs=17,score=6.78)","frontend/src-tauri/src/main.rs(revs=69,score=4.41)","frontend/src/lib/i18n.ts(revs=13,score=1.48)"],"coupling_pairs":241,"min_revs":5,"sample_met":true,"deferred_faces":["function-coupling(--target)"],"quadrant_assignment":"slice-decision（facts 共享 quadrant=strategic/codelore 族 provenance 不改写；象限归属=报告切片决策 D-054③）"}
- conflict_markers: (none)
- verdict_gate: ADR-0013-C/v1 / supported / evidence_flag=true / decided_at=2026-09-15T01:58:42+08:00 / audit_ref=engine/src/audit/audit.ts

### structure（applicability=not_applicable）
- verdict: insufficient · score: n/a · confidence: 0
- dimensions: 
- slice_fields: {}
- conflict_markers: out-of-scope-stage1
- verdict_gate: ADR-0013-C/v1 / insufficient / evidence_flag=false / decided_at=2026-09-15T01:58:42+08:00 / audit_ref=engine/src/audit/audit.ts

### supply_chain（applicability=not_applicable）
- verdict: insufficient · score: n/a · confidence: 0
- dimensions: 
- slice_fields: {}
- conflict_markers: data-not-connected
- verdict_gate: ADR-0013-C/v1 / insufficient / evidence_flag=false / decided_at=2026-09-15T01:58:42+08:00 / audit_ref=engine/src/audit/audit.ts

#### 结构化裁决块（agent 可消费）
- protocol_version: ADR-0013-C/v1
- overall: supported · decided_at: 2026-09-15T01:58:42+08:00
- PC-1: supported | basis=B1 | facts=1e8757f5-b9d7-d143-b3f6-2b132e58d347,65009556-be9e-2f87-5dd7-7c77d42ee5c1 | evidence=EV-AUDIT-ENVMANAGER-01 | adr-structure 与 positioning 两族均产出非空事实，golden ADR 五件套 5/5 且 supersede 链命中（env-manager run 内管线活性正对照）
- PC-2: supported | basis=B1 | facts=279871b1-3187-5331-e2a4-5fa7e96b245f | evidence=EV-AUDIT-ENVMANAGER-01 | gitlog 族检出事后补写 delta_days = 255
- TC-1: supported | basis=B2 | facts=7a4f37be-8753-60b1-f7e6-b39749b58824,414c3137-6073-652a-c533-23b81c31ae9c,3fd1fb9c-287c-7dba-5330-2ebdcc00bf31,65a7f5b2-c239-0569-2d83-7c6217db1d93,c550a14a-309e-b87a-bc03-c13b5cca3b71,025af7a6-5ef8-9a26-2bfe-8a8b1aebb331,9013a2e0-21ed-a145-d10e-1867cbe8eb8f,8c1d0846-1410-ec62-5288-a59b7276d7b4,851c1567-7817-8b3d-0c3f-9de8934c4f64,841050f2-7e64-b92b-b384-851f07fb90e0,4ced4ce9-bcf0-a917-3e44-9b91379acd9b,bd515e27-2f8f-a442-cc98-0dc156d399c7,03156ba4-ce35-e7df-ed71-f1782a14f3e2,614c7366-29ee-de23-c005-50c952e129e2 | evidence=EV-AUDIT-ENVMANAGER-02 | env-manager ADR 事后补写：可判定数 14（门槛 5），>90d 占比 0.0000，判 NOT_RED（派生统计 over 496 commits；quarantined 日期 commit 排除 0）
- TC-2: supported | basis=B2 | facts=3bfad907-16bb-777c-6ba0-f7a995accf2b,cdf70c6a-5efa-42d2-52df-340a5a73f90b,b9a38962-0b8a-b397-100d-cea1dde5a74b,296942da-f5df-b8a4-0542-79e9613fbf01,63789d47-34a5-9eab-e3bb-6383d5872d25,c75e43ff-7ef2-75f4-2542-23051f7a4984,b432e43f-a123-e1c6-b03b-a0da400b7cbf,b92d7c93-9e3b-bcc7-0c4c-eb526d551854,48e12705-6725-9d77-ce1e-d7546de0860e,fbc2d909-15eb-56dd-a064-c484e2488d72,145ced00-3e57-5a46-d6e3-7190a281fad4,58356a45-7c3f-8fb4-c6fe-0ec03b0d4f08,6cb9aa9a-d2da-d06d-404a-81a57e09813e,b2706573-3d15-439b-c13b-232f94abc6d2 | evidence=EV-AUDIT-ENVMANAGER-03 | env-manager ADR 五件套：mean_ratio 0.7571（门槛 0.6），字段缺失率超线=false，判 NOT_RED
- TC-3: supported | basis=B2 | facts=51deebe1-5616-31c8-1d83-bdb8da804b2e,e7d44726-5696-b8fd-db47-6806ff61cdda,c773e106-21bf-74b9-189a-b290a1de2ffb | evidence=EV-AUDIT-ENVMANAGER-04 | env-manager 定位覆盖：意图面 3 件最低 ratio 0.8500（README.md），判 GREEN
- NC-1: supported | basis=B4 | facts=ab9d8259-a125-a34a-3211-2cc79697e001 | evidence=EV-AUDIT-ENVMANAGER-05 | 负对照选材 env-manager/package.json 五件套 0 命中、supersede 0 命中（特异性成立）
- BHV-PC-1: supported | basis=B1 | facts=2148f0ce-3bc4-2aa8-6467-69dbb73c65c0,646caec9-97b9-9cfc-faa7-62138687247b,4a2a5396-ddbb-2806-37ef-754ab0ebd9e2 | evidence=EV-AUDIT-ENVMANAGER-01 | 行为三面 per-file 重算齐备性（file_facet_row 三面各 >0 行，errFacts=0，聚合↔per-file 对账 match=true）
- BHV-TC-1: supported | basis=B1 | facts=2148f0ce-3bc4-2aa8-6467-69dbb73c65c0 | evidence=EV-AUDIT-ENVMANAGER-01 | 低样本判据：hotspots min(revisions)>=5（实测 min=5）
- BHV-TC-2: supported | basis=B1 | facts=646caec9-97b9-9cfc-faa7-62138687247b | evidence=EV-AUDIT-ENVMANAGER-01 | coupling shared>=2&degree>0 占比=1.000（阈值 0.5）
- BHV-NC-1: supported | basis=B1 | facts=(none) | evidence=(none) | function-coupling（--target 参数面）暂缓如实登记——deferred_faces 写入切片字段
- human_adjudication: pending（裁定仍由人做，见 B5）

## C3 证据

### EV-AUDIT-ENVMANAGER-01 — audit-measurements.json @ L14
- claim: 本次实测：env-manager Macro-B audit 采集事实数
- grounded: true · collected_at: 2026-09-15T01:58:42+08:00
- reproduce_cmd: macro-audit audit D:/Aworker/env-manager --out D:/Aworker/6F/.scratch/macro-audit/trials/codebuddy-r38/baseline
- 引文原文: "fact_count": 960,

### EV-AUDIT-ENVMANAGER-02 — audit-measurements.json @ L69
- claim: 本次实测：env-manager TC-1 ADR 事后补写判据裁定（NOT_RED）
- grounded: true · collected_at: 2026-09-15T01:58:42+08:00
- reproduce_cmd: macro-audit audit D:/Aworker/env-manager --out D:/Aworker/6F/.scratch/macro-audit/trials/codebuddy-r38/baseline
- 引文原文: "verdict": "NOT_RED",

### EV-AUDIT-ENVMANAGER-03 — audit-measurements.json @ L78
- claim: 本次实测：env-manager TC-2 五件套完整度 mean_ratio
- grounded: true · collected_at: 2026-09-15T01:58:42+08:00
- reproduce_cmd: macro-audit audit D:/Aworker/env-manager --out D:/Aworker/6F/.scratch/macro-audit/trials/codebuddy-r38/baseline
- 引文原文: "mean_ratio_4": "0.7571",

### EV-AUDIT-ENVMANAGER-04 — audit-measurements.json @ L123
- claim: 本次实测：env-manager TC-3 定位覆盖率最低值
- grounded: true · collected_at: 2026-09-15T01:58:42+08:00
- reproduce_cmd: macro-audit audit D:/Aworker/env-manager --out D:/Aworker/6F/.scratch/macro-audit/trials/codebuddy-r38/baseline
- 引文原文: "lowest_ratio_4": "0.8500",

### EV-AUDIT-ENVMANAGER-05 — audit-measurements.json @ L134
- claim: 本次实测：env-manager NC-1 负对照选材五件套命中数（预期 0）
- grounded: true · collected_at: 2026-09-15T01:58:42+08:00
- reproduce_cmd: macro-audit audit D:/Aworker/env-manager --out D:/Aworker/6F/.scratch/macro-audit/trials/codebuddy-r38/baseline
- 引文原文: "five_piece_present": 0,

### EV-AUDIT-ENVMANAGER-06 — docs/adr/0001-secret-architecture-revision.md @ L1
- claim: env-manager ADR 语料锚：docs/adr/0001-secret-architecture-revision.md 实物存在（语料 14 份）
- grounded: true · collected_at: 2026-09-15T01:58:42+08:00
- reproduce_cmd: macro-audit audit D:/Aworker/env-manager --out D:/Aworker/6F/.scratch/macro-audit/trials/codebuddy-r38/baseline
- 引文原文: # 0001: Secret Architecture Revision (v0.8.0 to v1.0.0)

### EV-AUDIT-ENVMANAGER-07 — audit-measurements.json @ L21
- claim: 快照时点披露：env-manager intake snapshot_fetched_at=null（cache_hit=false refreshed=false；不自动 pull，--refresh 显式 opt-in）
- grounded: true · collected_at: 2026-09-15T01:58:42+08:00
- reproduce_cmd: macro-audit audit D:/Aworker/env-manager --out D:/Aworker/6F/.scratch/macro-audit/trials/codebuddy-r38/baseline
- 引文原文: "snapshot_fetched_at": null,

#### 引文→结论支持关系校验
- CL-AUDIT-ENVMANAGER-01 -> EV-AUDIT-ENVMANAGER-01: supports（matched=fact_count missing=）全部支撑锚在引文原文中逐字命中（语境剥离后 presence-level 成立——非语义蕴含）
- CL-AUDIT-ENVMANAGER-02 -> EV-AUDIT-ENVMANAGER-02: supports（matched=verdict missing=）全部支撑锚在引文原文中逐字命中（语境剥离后 presence-level 成立——非语义蕴含）
- CL-AUDIT-ENVMANAGER-03 -> EV-AUDIT-ENVMANAGER-03: supports（matched=mean_ratio_4 missing=）全部支撑锚在引文原文中逐字命中（语境剥离后 presence-level 成立——非语义蕴含）
- CL-AUDIT-ENVMANAGER-04 -> EV-AUDIT-ENVMANAGER-04: supports（matched=lowest_ratio_4 missing=）全部支撑锚在引文原文中逐字命中（语境剥离后 presence-level 成立——非语义蕴含）
- CL-AUDIT-ENVMANAGER-05 -> EV-AUDIT-ENVMANAGER-05: supports（matched=five_piece_present missing=）全部支撑锚在引文原文中逐字命中（语境剥离后 presence-level 成立——非语义蕴含）
- CL-AUDIT-ENVMANAGER-06 -> EV-AUDIT-ENVMANAGER-07: supports（matched=snapshot_fetched_at missing=）全部支撑锚在引文原文中逐字命中（语境剥离后 presence-level 成立——非语义蕴含）

## C4 行动建议

### R-AUDIT-ENVMANAGER-1 [P2] 将本 run facts.duckdb 经 mcp.json MACRO_AUDIT_FACTS_DB 注册给宿主 agent——叙事段由宿主经 MCP facts 只读面生成（D-053 双轨）
- rationale: audit 命令=kernel 面一等公民入口；叙事职责不外携，宿主 agent 经 facts 投影消费
- expected_impact: 事实层→叙事层通道闭环 · effort: S
- verdict_gate_stamp: ADR-0013-C/v1 / supported
- evidence_refs: EV-AUDIT-ENVMANAGER-07
- degraded_note: (none)

### R-AUDIT-ENVMANAGER-2 [P2] 快照为本次 fetch/本地观测时点
- rationale: 快照时点披露已落（snapshot_fetched_at）；缓存命中与刷新区分如实
- expected_impact: staleness 风险如实披露 · effort: S
- verdict_gate_stamp: ADR-0013-C/v1 / supported
- evidence_refs: EV-AUDIT-ENVMANAGER-07
- degraded_note: (none)


## Intake Health

- 契约：ADR-0022 违约两级处置——协议级违约 fail-fast（崩溃桶工件），字段级病态=quarantine 桶隔离（判定/处置硬分界）
- field head_date: total=1 clean=1 normalized=0 quarantined=0（恒等式=PASS）
- field committer_date: total=496 clean=496 normalized=0 quarantined=0（恒等式=PASS）
- affected_commits（quarantined 去重）: 0
- quarantine_log.recorded_at（写入时点列）: 2026-09-15T01:58:42+08:00
- 派生统计排除声明：日期派生指标 over 496 commits（quarantined 排除 0；quarantined 日期 commit 禁入 first_commit/adr_lag 派生）
- 阈值纪律：单字段 quarantined/total > 0.001 → run 级裁定升级 unsupported；escalation=none
- quarantined rows: 无（摄入无病态=阴性自证）

