# MA-23-6F-FIRST-REPORT — Macro-B 首报（6F@fc00d458e215cc9a7a26af81626dec8712622821）
> RECEIPT RCP-9d20125ad0976c86 chain=9d20125ad0976c869df132e8f25e99c7 content=bede7a40f8286581 facts=228 adjudications=6 issued_at=2026-09-13T14:31:09+08:00 commit=fc00d458e215cc9a7a26af81626dec8712622821 tree=6f405cfc2ce5
>
> 骨架 1.1.0（章顺序锁定，ADR-0006）· 裁定协议 ADR-0013-C/v1 · 生成于 2026-09-13T14:31:09+08:00

## C1 执行摘要

- report_id: MA-23-6F-FIRST-REPORT
- schema_version: 1.1.0
- scale: Macro-B
- subject_ref: 6F@fc00d458e215cc9a7a26af81626dec8712622821
- generated_at: 2026-09-13T14:31:09+08:00
- correlation_key: trace_id=6cb1035d33437cf94e987c26b0e77b5b baggage_id=8b8feb7ab1958bbb7a9b090d6248c599
- overall_verdict: unsupported
- confidence: 0.75
- headline: 6F 首报：主前提「ADR 具备可机器核验的决策记录结构」在 TC-2 被证伪（mean_ratio 0.2462 < 0.60，Status/Date 缺失率 84.62%）；TC-1 因可判定数 2 < 门槛 5 判 INCONCLUSIVE；TC-3 判 AMBER；综合裁定 unsupported。
- degraded_mode: false
- stale_data_marker: fresh（SLA 5s / 实测延迟 0s）
- read_model_version: 1.1.0 · fact_watermark_version: 1
- top_findings: EV-006, EV-007, EV-008
- fact_ids: 228 条（清单见侧车 JSON）

## C2 四象限与裁决

### strategy（applicability=native）
- verdict: unsupported · score: n/a · confidence: 0.75
- dimensions: S1, S2
- slice_fields: {"s1_keyword_coverage_ratio":0.6,"s2_five_piece_mean_ratio":0.2462}
- conflict_markers: (none)
- verdict_gate: ADR-0013-C/v1 / unsupported / threshold_met=true / decided_at=2026-09-13T14:31:09+08:00 / audit_ref=.scratch/architecture-recovery/reports/22-c-adjudication-basis.md

### structure（applicability=not_applicable）
- verdict: insufficient · score: n/a · confidence: 0
- dimensions: 
- slice_fields: {}
- conflict_markers: out-of-scope-R3-01
- verdict_gate: ADR-0013-C/v1 / insufficient / threshold_met=false / decided_at=2026-09-13T14:31:09+08:00 / audit_ref=.scratch/architecture-recovery/reports/22-c-adjudication-basis.md

### behavior（applicability=not_applicable）
- verdict: insufficient · score: n/a · confidence: 0
- dimensions: 
- slice_fields: {}
- conflict_markers: out-of-scope-R3-01
- verdict_gate: ADR-0013-C/v1 / insufficient / threshold_met=false / decided_at=2026-09-13T14:31:09+08:00 / audit_ref=.scratch/architecture-recovery/reports/22-c-adjudication-basis.md

### supply_chain（applicability=not_applicable）
- verdict: insufficient · score: n/a · confidence: 0
- dimensions: 
- slice_fields: {}
- conflict_markers: out-of-scope-R3-01
- verdict_gate: ADR-0013-C/v1 / insufficient / threshold_met=false / decided_at=2026-09-13T14:31:09+08:00 / audit_ref=.scratch/architecture-recovery/reports/22-c-adjudication-basis.md

#### 结构化裁决块（agent 可消费）
- protocol_version: ADR-0013-C/v1
- overall: unsupported · decided_at: 2026-09-13T14:31:09+08:00
- PC-1: supported | basis=B1 | facts=7422653a-2067-f5f9-9637-0c51faeb80fe,a2839c74-41d2-acfa-098a-e457092cc33e | evidence=EV-010 | adr-structure 与 positioning 两族均产出非空事实，golden ADR 五件套 5/5 且 supersede 链命中
- PC-2: supported | basis=B1 | facts=5f2a307d-663b-1076-3798-19af7819f369 | evidence=EV-011 | gitlog 族检出事后补写 delta_days = 255
- TC-1: insufficient | basis=B2 | facts=8a3fa62d-aafb-c4f8-0f5b-71d4e87fe40a,0198eb60-6731-e7ee-c150-707e7cc809f6 | evidence=EV-002,EV-007 | 可判定数 2 < 门槛 5，判 INCONCLUSIVE（不等于绿，仅记数据缺口）
- TC-2: unsupported | basis=B2 | facts=fea167e0-8c1f-c1f8-b520-92bf5b492327,73ea67e1-2165-8ce3-3770-8729e3f9bbff,98dcc4f0-e40a-f14c-46c1-2d954cf143e1,f4d74111-abb6-eb25-7d50-aeacf0e8d635,b8adf319-7ed9-898c-ec8f-307409ebb1c8,d352355c-7d72-b5de-a418-1c025fe2f753,ae21cc49-df42-833e-ba86-9a48acd2e8eb,264f9648-4800-9607-6b60-9267d01dc579,88fa1ae5-5ccf-5ed5-0764-299d1482a858,fdf3fe09-ccd6-9e5b-55a7-3125812c3e6b,2009ebe1-092d-b689-08d6-002551433116,06abc2f9-efc8-3652-67aa-7ede3e1d0ef3,ed35866b-0534-5e8c-543d-6156ba68044b | evidence=EV-001,EV-006 | mean_ratio 0.2462 与 Status/Date 缺失率，判 RED
- TC-3: supported | basis=B2 | facts=dabe05b7-c213-217f-d9f5-5fa1766414ec,a315c0a0-a568-b76f-535a-7905c672e12f | evidence=EV-003,EV-008 | 最低覆盖率 0.6000（CONTEXT.md），判 AMBER
- NC-1: supported | basis=B4 | facts=1ddb991f-eac0-6d54-38f9-b2cd71127c6e | evidence=EV-009 | 负对照选材 engine/src/fact/schema.ts 五件套 0 命中、supersede 0 命中、fact_count = 11
- human_adjudication: pending（裁定仍由人做，见 B5）

## C3 证据

### EV-001 — .scratch/architecture-recovery/reports/22-criteria-pre-registration.md @ L100
- claim: 预声明（跑前写死）：TC-2 mean_ratio = 0.2462，判 RED
- grounded: true · collected_at: 2026-09-13T14:31:09+08:00
- reproduce_cmd: git show 7395495:.scratch/architecture-recovery/reports/22-criteria-pre-registration.md
- 引文原文: | `mean_ratio` | **0.2462** |

### EV-002 — .scratch/architecture-recovery/reports/22-criteria-pre-registration.md @ L67
- claim: 预声明：TC-1 可判定数 2 < 门槛 5，判 INCONCLUSIVE
- grounded: true · collected_at: 2026-09-13T14:31:09+08:00
- reproduce_cmd: git show 7395495:.scratch/architecture-recovery/reports/22-criteria-pre-registration.md
- 引文原文: | 可执行门槛 | 可判定数 ≥ 5，否则判 **INCONCLUSIVE** |

### EV-003 — .scratch/architecture-recovery/reports/22-criteria-pre-registration.md @ L126
- claim: 预声明：TC-3 最低 ratio = 0.6000，判 AMBER
- grounded: true · collected_at: 2026-09-13T14:31:09+08:00
- reproduce_cmd: git show 7395495:.scratch/architecture-recovery/reports/22-criteria-pre-registration.md
- 引文原文: | **判定（取最低）** | — | **AMBER**（0.6000） |

### EV-004 — docs/adr/0012-value-validation-loop-first.md @ L14
- claim: ADR-0012：阶段 1 = 6F 自身 Macro-B happy path 出首报
- grounded: true · collected_at: 2026-09-13T14:31:09+08:00
- reproduce_cmd: git show HEAD:docs/adr/0012-value-validation-loop-first.md
- 引文原文: 主干 = C，四阶段串行：阶段 0 = push + CI 实跑 + DuckDB fact table schema v0（事件只追加 + cross-scale correlation key）+ 确定性采集器（git log / ADR 结构扫描，不接 LLM）；阶段 1 = Macro-B 单仓 happy path 于 6F 自身，S2 ADR 质量 + S1 定位收敛起手，跑通 采集→fact→叙事→裁决→报告，产出第一份带引文 + Receipt 的真报告，同路径覆盖一条失败路径（降级 + ⚠ unverified）；阶段 2 = 实测锚回流清扫 16 项缺口；阶段 3 = 铺开其余采集器/scale + 分发收尾。

### EV-005 — docs/adr/0013-three-layer-acceptance-gates.md @ L14
- claim: ADR-0013：首报验收 = A→B→C 三层串行闸门
- grounded: true · collected_at: 2026-09-13T14:31:09+08:00
- reproduce_cmd: git show HEAD:docs/adr/0013-three-layer-acceptance-gates.md
- 引文原文: 验收 = A→B→C 三层串行闸门：A 形式达标（共享骨架 + 可回查引文 + Receipt 存在，smoke 层）；B 内容非平凡 = RAT 预声明 kill criterion，构造为 2 正对照（与真判据共享 detector 路径、不计入价值判定、未中=管线故障 P0）+ 3 真判据（预注册可操作定义+显式阈值+命中方向+未中语义，阈值跑前写死跑后禁调；真判据全空且正对照 2/2 命中 =「前提未被支持」合法实验数据）+ 1 负对照（特异性守卫，命中走复核路径不自动定罪）；C 信任裁决四条款（裁定三档且依据看报告前入库防 HARKing / 对抗性清单或链路外读者 / 锚定 B 产物 / 裁定原文+时间戳回写账本）。kill criterion 三级措辞：前置管线健康闸 / 主前提证伪闸 / 反向红条。

### EV-006 — .scratch/architecture-recovery/reports/23-measurements.json @ L19
- claim: 本次实测：TC-2 mean_ratio（4 位小数）
- grounded: true · collected_at: 2026-09-13T14:31:09+08:00
- reproduce_cmd: node .scratch/architecture-recovery/reports/23-first-report.mjs
- 引文原文: "mean_ratio_4": "0.2462",

### EV-007 — .scratch/architecture-recovery/reports/23-measurements.json @ L7
- claim: 本次实测：TC-1 可判定数
- grounded: true · collected_at: 2026-09-13T14:31:09+08:00
- reproduce_cmd: node .scratch/architecture-recovery/reports/23-first-report.mjs
- 引文原文: "judgeable_n": 2,

### EV-008 — .scratch/architecture-recovery/reports/23-measurements.json @ L77
- claim: 本次实测：TC-3 最低覆盖率（4 位小数）
- grounded: true · collected_at: 2026-09-13T14:31:09+08:00
- reproduce_cmd: node .scratch/architecture-recovery/reports/23-first-report.mjs
- 引文原文: "lowest_ratio_4": "0.6000",

### EV-009 — .scratch/architecture-recovery/reports/23-measurements.json @ L88
- claim: 本次实测：NC-1 负对照选材五件套命中数（预期 0）
- grounded: true · collected_at: 2026-09-13T14:31:09+08:00
- reproduce_cmd: node .scratch/architecture-recovery/reports/23-first-report.mjs
- 引文原文: "five_piece_present": 0,

### EV-010 — .scratch/architecture-recovery/reports/23-measurements.json @ L99
- claim: 本次实测：PC-1 正对照 golden ADR 的 supersede 链命中
- grounded: true · collected_at: 2026-09-13T14:31:09+08:00
- reproduce_cmd: node .scratch/architecture-recovery/reports/23-first-report.mjs
- 引文原文: "golden_supersede_hit_s": "true"

### EV-011 — .scratch/architecture-recovery/reports/23-measurements.json @ L106
- claim: 本次实测：PC-2 正对照事后补写 ADR 的 delta_days
- grounded: true · collected_at: 2026-09-13T14:31:09+08:00
- reproduce_cmd: node .scratch/architecture-recovery/reports/23-first-report.mjs
- 引文原文: "delta_days_s": "255"

#### 引文→结论支持关系校验
- CL-001 -> EV-006: supports（matched=mean_ratio_4|0.2462 missing=）全部支撑锚在引文原文中逐字命中
- CL-002 -> EV-007: supports（matched=judgeable_n|2 missing=）全部支撑锚在引文原文中逐字命中
- CL-003 -> EV-008: supports（matched=lowest_ratio_4|0.6000 missing=）全部支撑锚在引文原文中逐字命中
- CL-004 -> EV-001: supports（matched=0.2462 missing=）全部支撑锚在引文原文中逐字命中
- CL-005 -> EV-002: supports（matched=INCONCLUSIVE|可判定数 missing=）全部支撑锚在引文原文中逐字命中
- CL-006 -> EV-003: supports（matched=AMBER|0.6000 missing=）全部支撑锚在引文原文中逐字命中
- CL-007 -> EV-004: supports（matched=阶段 1 = Macro-B missing=）全部支撑锚在引文原文中逐字命中
- CL-008 -> EV-005: supports（matched=A→B→C missing=）全部支撑锚在引文原文中逐字命中
- CL-009 -> EV-009: supports（matched=five_piece_present|0 missing=）全部支撑锚在引文原文中逐字命中
- CL-010 -> EV-010: supports（matched=golden_supersede_hit_s|true missing=）全部支撑锚在引文原文中逐字命中
- CL-011 -> EV-011: supports（matched=delta_days_s|255 missing=）全部支撑锚在引文原文中逐字命中

## C4 行动建议

### R-23-1 [P0] 为 docs/adr 全集 13 份补 Status/Date YAML 头，使 S2 事后补写判据可执行
- rationale: TC-1 可判定数 2 < 门槛 5，根因是 11/13 ADR 无 Date 头（缺失率 84.62%）
- expected_impact: TC-1 由 INCONCLUSIVE 转为可判定，S2 阈值获得 assay sensitivity · effort: S
- verdict_gate_stamp: ADR-0013-C/v1 / insufficient
- evidence_refs: EV-002, EV-006, EV-007
- degraded_note: (none)

### R-23-2 [P1] 把 ADR 中文结构标记口径登记为 v2 追加（新开账本条目 + v1 留档），不在首报后静默重判
- rationale: adr-structure@v1 只识别英文标记，6F 的 ADR-0001~0007 以 H1 + 自由正文书写；这是口径事实不是误报，改口径属改向
- expected_impact: 消除 TC-2 RED 的口径歧义，保留 v1 结果可比性 · effort: M
- verdict_gate_stamp: ADR-0013-C/v1 / unsupported
- evidence_refs: EV-001, EV-006
- degraded_note: (none)

### R-23-3 [P2] 把 23-first-report.json 侧车作为 Agent Plugin 的裁决块契约候选，落 R3-D7 分发前置清单
- rationale: A-027 要求裁决块结构化、引文锚可解析；侧车已含 verdict 枚举 + evidence_id/source/locator 三元组
- expected_impact: 下游 agent 可直接消费裁决而不必解析 md · effort: S
- verdict_gate_stamp: ADR-0013-C/v1 / supported
- evidence_refs: EV-005
- degraded_note: (none)


