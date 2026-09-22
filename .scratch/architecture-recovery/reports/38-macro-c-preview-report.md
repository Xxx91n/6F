# MA-38-ANYSEARCH-MACRO-C-PREVIEW — Macro-C 首报（anysearch-cli@b45d07992d9c）
> RECEIPT RCP-f6db53f61c151d96 chain=f6db53f61c151d9623fec1d0d05bbdd8 content=e3a1bb9c191bbce3 facts=1177 adjudications=6 issued_at=2026-09-22T10:31:10+08:00 commit=b45d07992d9c2ee9d01c7b7f176e2fb7c7978dd6 tree=02fc9dea1ec4
>
> 骨架 1.2.0（章顺序锁定，ADR-0006）· 裁定协议 ADR-0013-C/v1 · 生成于 2026-09-22T10:31:10+08:00
>
> 披露块（preview 标注诚实 = 决策本体，ADR-0017；机器可读字段见侧车 preview_disclosure）
> - capability: capability 2 of 5 · preview
> - calibration_scope: 单仓校准（anysearch-cli）
> - structural_limitations: 校准语料 = 单仓（anysearch-cli，65 ADR＋supersede 链稀缺素材），不构成泛化证据——dogfooding = generative not evaluative（D-033），GA 前置须 ≥1 非自有公开仓（#40 / D-013）；同主仓确认偏差面：试点仓与产品同主，本报告仅作校准＋冒烟依据；LLM 叙事面 env 门控关：S4 假设失效检测深检维度降级 ⚠ unverified（llm_gated 明示，不伪造不真调）；供应链象限 ⚠ 数据未接：Scorecard/repomix 未接不插队（D-034③）；structure/behavior 象限为衍生观测（无预声明阈值基线）——观测值如实落 slice_fields 不裁决
> - not_in_preview: Micro-A / Micro-B / Macro-A

## C1 执行摘要

- report_id: MA-38-ANYSEARCH-MACRO-C-PREVIEW
- schema_version: 1.2.0
- scale: Macro-C
- subject_ref: anysearch-cli@b45d07992d9c
- generated_at: 2026-09-22T10:31:10+08:00
- correlation_key: trace_id=ca2009f0696c43be0a8e52619c2b6d6b baggage_id=a6de0fd562d76108022996f097a78312
- overall_verdict: insufficient
- confidence: 0.55
- headline: anysearch-cli Macro-C preview（capability 2 of 5）：全链实跑——codelore 30/30 面 + ADR 65 份（v2 回退链解析日期 76）+ supersede 引用网 8 边零断链零缺回链 + lag 可判定 76；S4 深检面 llm_gated → 综合裁定 insufficient（preview 诚实部分裁定，非管线失败）；共享事实库已证（Macro-B 228 + Macro-C 1177 同库）→ mw-trigger-b 触发登记。
- degraded_mode: false
- stale_data_marker: fresh（SLA 5s / 实测延迟 0s）
- read_model_version: 1.2.0 · fact_watermark_version: 1
- top_findings: EV-38-01, EV-38-04, EV-38-05, EV-38-07
- fact_ids: 1177 条（清单见侧车 JSON）

## C2 四象限与裁决

### strategy（applicability=native）
- verdict: insufficient · score: n/a · confidence: 0.55
- dimensions: S2, S4
- slice_fields: {"adr_count":76,"supersede_edges":8,"supersede_unresolved":0,"supersede_missing_backrefs":0,"lag_judgeable_n":76,"adr_date_resolvable":76,"llm_gate":"closed"}
- conflict_markers: single-repo-calibration
- verdict_gate: ADR-0013-C/v1 / insufficient / evidence_flag=false / decided_at=2026-09-22T10:31:10+08:00 / audit_ref=reports/38-macro-c-preview.mjs

### structure（applicability=derived）
- verdict: insufficient · score: n/a · confidence: 0.3
- dimensions: S3
- slice_fields: {"god_classes_rows":8,"architecture_metrics_rows":18,"dependency_cycles_rows":0,"modularity_violations_rows":82,"instability_rows":325,"architecture_roles_rows":325}
- conflict_markers: preview-derived-observation-only
- verdict_gate: ADR-0013-C/v1 / insufficient / evidence_flag=false / decided_at=2026-09-22T10:31:10+08:00 / audit_ref=reports/38-macro-c-preview.mjs

### behavior（applicability=derived）
- verdict: insufficient · score: n/a · confidence: 0.3
- dimensions: S5
- slice_fields: {"revisions_rows":104,"abs_churn_rows":36,"entity_churn_rows":104,"hotspot_velocity_rows":104,"code_age_rows":83,"lead_time_rows":469,"release_cadence_rows":7,"ownership_rows":104,"bus_factor_rows":11}
- conflict_markers: preview-derived-observation-only
- verdict_gate: ADR-0013-C/v1 / insufficient / evidence_flag=false / decided_at=2026-09-22T10:31:10+08:00 / audit_ref=reports/38-macro-c-preview.mjs

### supply_chain（applicability=not_applicable）
- verdict: insufficient · score: n/a · confidence: 0
- dimensions: 
- slice_fields: {}
- conflict_markers: data-not-connected
- verdict_gate: ADR-0013-C/v1 / insufficient / evidence_flag=false / decided_at=2026-09-22T10:31:10+08:00 / audit_ref=reports/38-macro-c-preview.mjs

#### 结构化裁决块（agent 可消费）
- protocol_version: ADR-0013-C/v1
- overall: insufficient · decided_at: 2026-09-22T10:31:10+08:00
- PC-MC-1: supported | basis=管线活性正对照 | facts=bfc22444-3781-991b-84e4-bf737669c150,d3b3f59d-6c5a-35ac-3a5c-c4cbc1f1a8ae,7f2f22c7-3f89-7f2c-7edf-e1334d0e9dec,aee930af-4698-76d1-380c-8665df6cef65 | evidence=EV-38-05 | codelore pin 0.28.0 + 30/30 facet_rows + ADR 语料 76 份解析
- PC-MC-2: supported | basis=管线活性正对照 | facts=1e367b32-64d7-a9c4-7dad-653ecc188e43 | evidence=EV-38-08 | gitlog 族产出 ADR 首提交/lag 事实（first_commit ≥ 74）
- TC-MC-1: supported | basis=演化链完整性 | facts=5fbfe9da-ed04-dfee-1af0-6f54afb295a6 | evidence=EV-38-01,EV-38-02,EV-38-03,EV-38-09 | supersede 引用网 8 边：断链 0 / 缺回链 0（与 37-pilot 存档复测一致=true）
- TC-MC-2: supported | basis=时间维信号可判定性 | facts=1e367b32-64d7-a9c4-7dad-653ecc188e43,2fed6dac-e212-1ddc-2194-96578a90235f,22f11bdb-902b-3731-89c5-1eb291a92357,49ab22c4-1643-8849-dd8a-525a002c152f,309ae04d-279e-5cd2-5a6a-9dd75ecf1ecd | evidence=EV-38-08 | ADR 决策日 vs 首提交 lag 可判定数 76 / 门槛 30（v2 回退链日期解析 76/76）
- TC-MC-3: insufficient | basis=S4 假设失效检测深检 | facts=b345a9c7-0096-a7d4-2d4b-5cf0140119d7 | evidence=EV-38-04 | S4 假设失效检测面 llm_gated（CODELORE_LLM_* env 门控关）→ 深检维度 ⚠ unverified 降级，不伪造不真调
- NC-MC-1: supported | basis=负对照特异性 | facts=7e06dc3d-7e74-cccf-766c-b1453e2fd67b | evidence=EV-38-05 | 负对照选材 apps/cli/package.json 五件套 0 命中（特异性成立）
- human_adjudication: pending（裁定仍由人做，见 B5）

## C3 证据

### EV-38-01 — .scratch/architecture-recovery/reports/38-macro-c-measurements.json @ L68
- claim: 本次实测：supersede 引用网 8 边（whole 1 + item 2 + amends 2 + defer 1 + 纪律样本 2）
- grounded: true · collected_at: 2026-09-22T10:31:10+08:00
- reproduce_cmd: node .scratch/architecture-recovery/reports/38-macro-c-preview.mjs
- 引文原文: "edge_count": 8,

### EV-38-02 — docs/adr/0058-ci-test-job-independence-and-gate-layer-entrypoint-narrowing.md @ L3
- claim: anysearch-cli 演化考古稀缺素材：whole-ADR supersede 事件 0058→0060 实物存在
- grounded: true · collected_at: 2026-09-22T10:31:10+08:00
- reproduce_cmd: git -C D:/Aworker/anysearch-cli show HEAD:docs/adr/0058-ci-test-job-independence-and-gate-layer-entrypoint-narrowing.md
- 引文原文: Status: Superseded by ADR-0060 (2026-09-13)

### EV-38-03 — docs/adr/0060-architecture-grill-round-59-archive-truthfulness-closure.md @ L11
- claim: 回链实物：ADR-0060 提及 ADR-0058（supersede 回链闭合）
- grounded: true · collected_at: 2026-09-22T10:31:10+08:00
- reproduce_cmd: git -C D:/Aworker/anysearch-cli show HEAD:docs/adr/0060-architecture-grill-round-59-archive-truthfulness-closure.md
- 引文原文: 1. **刀一**：ADR-0058 is an Accepted ADR whose nine decisions reference files, flags, and precedents (`gates.json`, `gate:all`, `JIAHAO_TEST_TIER`, named external cases, defer-0003/0004/0026) that do not exist in this repo; its own r58 Text Errata confirms this, yet Status stayed "Accepted". Decision chains that cite it (ADR-0059 D2) inherit the rot.

### EV-38-04 — .scratch/architecture-recovery/reports/38-macro-c-measurements.json @ L57
- claim: 本次实测：LLM env 门控关（CODELORE_LLM_* 未配置）→ llm_gated 降级披露
- grounded: true · collected_at: 2026-09-22T10:31:10+08:00
- reproduce_cmd: node .scratch/architecture-recovery/reports/38-macro-c-preview.mjs
- 引文原文: "configured": false,

### EV-38-05 — .scratch/architecture-recovery/reports/38-macro-c-measurements.json @ L19
- claim: 本次实测：CodeLore 契约面 30/30 facet_rows（零 facet_error）
- grounded: true · collected_at: 2026-09-22T10:31:10+08:00
- reproduce_cmd: node .scratch/architecture-recovery/reports/38-macro-c-preview.mjs
- 引文原文: "facet_rows": 30,

### EV-38-06 — .scratch/macro-audit/decision-ledger.md @ L89
- claim: D-034⑤：Macro-C preview 报告强制披露「单仓校准（anysearch-cli）」结构性限制
- grounded: true · collected_at: 2026-09-22T10:31:10+08:00
- reproduce_cmd: git -C D:\Aworker\6F show HEAD:.scratch/macro-audit/decision-ledger.md
- 引文原文: | D-034 | Q6（轮7）：阶段 3 铺开次序——第二能力层选型、上游接入次序、任务 7 多写者域封口时机？ | OK（2026-09-15，原话「OK」＝采纳推荐全项；基于 atomcode 取证：6 searches/6 reads，三子问题均 ≥2 独立惯例支撑，置信高；多仓排序/基础设施封口时机为框架迁移中置信） | 阶段 3 串行骨架=扩面→Macro-C→Micro-A→Micro-B→Macro-A：① 首个铺开票=CodeLore 契约面扩开（考古层所需面＋S3/S4/S5 矩阵行拉动，单上游原则不破）；② 层序=Macro-C 第二（复用 Macro-B 行为象限管道＋anysearch-cli 试点面＋CodeLore 同源）→Micro-A 第三（env-manager 试点激活点，需托管平台 API 适配器新外部面）→Micro-B 第四（jiahao 下限＋回归）→Macro-A 最后（≥2 仓并跑）；③ 供应链象限在 Macro-B preview 报告降级为「⚠ 数据未接」，Scorecard/repomix 探针按层需求队列接入不插队；④ 任务 7 多写者域改写为触发器条款：三触发器任一即实测封口——(a) Macro-B 进 CI 定时回归、(b) Macro-C preview 共用同一 DuckDB、(c) Macro-A 启动；⑤ Macro-C preview 报告强制披露「单仓校准（anysearch-cli）」结构性限制 | 禁止 Scorecard 插队只为补齐 preview 供应链象限（降级披露制已立法）；触发器条款不得被读作铺开期前置门禁（infrastructure-last 纪律）亦不得无限拖（value lead time 变差=人为瓶颈信号）；D-024 兼容吸收：三触发器即其两字段纪律的「满足判据」登记；D-033 批一并行修正为错峰（env-manager 随 Micro-A 漏斗顺延）；冲突核查 26 条 current 无 revised；执行时点=grill 定稿后整理环节 | current |

### EV-38-07 — .scratch/architecture-recovery/reports/38-macro-c-measurements.json @ L93
- claim: 本次实测：共享事实库 38-audit-facts.duckdb 同库双 scale（Macro-B 回放 + Macro-C 追加）
- grounded: true · collected_at: 2026-09-22T10:31:10+08:00
- reproduce_cmd: node .scratch/architecture-recovery/reports/38-macro-c-preview.mjs
- 引文原文: "macro_b_facts": 228,

### EV-38-08 — .scratch/architecture-recovery/reports/38-macro-c-measurements.json @ L15
- claim: 本次实测：ADR 决策日 vs 首提交 lag 可判定数
- grounded: true · collected_at: 2026-09-22T10:31:10+08:00
- reproduce_cmd: node .scratch/architecture-recovery/reports/38-macro-c-preview.mjs
- 引文原文: "lag_judgeable_n": 76,

### EV-38-09 — .scratch/architecture-recovery/reports/37-pilot-measurements.json @ L602
- claim: 对账：37-pilot 存档 anysearch-cli supersede 边 = 8（38 复测一致性基准）
- grounded: true · collected_at: 2026-09-22T10:31:10+08:00
- reproduce_cmd: node .scratch/architecture-recovery/reports/37-check.mjs
- 引文原文: "edge_count": 8,

#### 引文→结论支持关系校验
- CL-38-01 -> EV-38-01: supports（matched=edge_count|8 missing=）全部支撑锚在引文原文中逐字命中（语境剥离后 presence-level 成立——非语义蕴含）
- CL-38-02 -> EV-38-02: supports（matched=Superseded by ADR-0060 missing=）全部支撑锚在引文原文中逐字命中（语境剥离后 presence-level 成立——非语义蕴含）
- CL-38-03 -> EV-38-03: supports（matched=ADR-0058 missing=）全部支撑锚在引文原文中逐字命中（语境剥离后 presence-level 成立——非语义蕴含）
- CL-38-04 -> EV-38-04: insufficient（matched=false missing=configured）支撑锚未命中或语境剥离（否定/引语/归属窗）：configured
- CL-38-05 -> EV-38-05: supports（matched=facet_rows|30 missing=）全部支撑锚在引文原文中逐字命中（语境剥离后 presence-level 成立——非语义蕴含）
- CL-38-06 -> EV-38-06: supports（matched=单仓校准（anysearch-cli） missing=）全部支撑锚在引文原文中逐字命中（语境剥离后 presence-level 成立——非语义蕴含）
- CL-38-07 -> EV-38-07: supports（matched=macro_b_facts missing=）全部支撑锚在引文原文中逐字命中（语境剥离后 presence-level 成立——非语义蕴含）
- CL-38-08 -> EV-38-08: supports（matched=lag_judgeable_n missing=）全部支撑锚在引文原文中逐字命中（语境剥离后 presence-level 成立——非语义蕴含）
- CL-38-09 -> EV-38-09: supports（matched=edge_count|8 missing=）全部支撑锚在引文原文中逐字命中（语境剥离后 presence-level 成立——非语义蕴含）

## C4 行动建议

### R-38-1 [P1] 配置 CODELORE_LLM_PROVIDER/MODEL（或 ANTHROPIC_API_KEY）激活 S4 假设失效检测面，复跑本 preview
- rationale: TC-MC-3 因 env 门控关判 insufficient——S4 演化方向深检是当前唯一未验证维度；上限走 MACRO_AUDIT_CODELORE_LLM_MAX_CALLS 计量
- expected_impact: TC-MC-3 由 insufficient 转可判定，overall 具升级通道 · effort: S
- verdict_gate_stamp: ADR-0013-C/v1 / insufficient
- evidence_refs: EV-38-04
- degraded_note: (none)

### R-38-2 [P1] 引入 ≥1 非自有公开仓经 URL opt-in 跑 Macro-C（衔接 #40 / D-013）
- rationale: 单仓校准（anysearch-cli）属 dogfooding——generative not evaluative（D-033）；泛化证据是 GA 前置
- expected_impact: 披露块结构性限制项①获得实证闭环 · effort: M
- verdict_gate_stamp: ADR-0013-C/v1 / insufficient
- evidence_refs: EV-38-06
- degraded_note: (none)

### R-38-3 [P1] 多写者 self-probe 实测封口（mw-trigger-b 已触发登记）
- rationale: 本票已证共用同一 audit_fact DuckDB——多写者域并发策略由触发条款进入实测封口通道（D-034④b）
- expected_impact: 任务 7 多写者域从挂门转实测 · effort: M
- verdict_gate_stamp: ADR-0013-C/v1 / insufficient
- evidence_refs: EV-38-07
- degraded_note: (none)

### R-38-4 [P3] 供应链象限维持「⚠ 数据未接」，Scorecard 探针按层需求队列接入（#42）
- rationale: D-034③ 降级披露制已立法——禁止为补齐象限插队上游
- expected_impact: preview 诚实形态保持 · effort: S
- verdict_gate_stamp: ADR-0013-C/v1 / insufficient
- evidence_refs: EV-38-01
- degraded_note: (none)


