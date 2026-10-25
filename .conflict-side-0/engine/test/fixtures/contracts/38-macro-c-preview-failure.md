# MA-38-ANYSEARCH-MACRO-C-PREVIEW-degraded — Macro-C 首报（anysearch-cli@b45d07992d9c）
> RECEIPT RCP-d8a4a77d8ee2d0b9 chain=d8a4a77d8ee2d0b9731e06300d48be9f content=df3f37dde68fd7e5 facts=0 adjudications=6 issued_at=2026-09-22T10:31:10+08:00 commit=b45d07992d9c2ee9d01c7b7f176e2fb7c7978dd6 tree=02fc9dea1ec4 ⚠ unverified
>
> 骨架 1.2.0（章顺序锁定，ADR-0006）· 裁定协议 ADR-0013-C/v1 · 生成于 2026-09-22T10:31:10+08:00
>
> 降级产出：FP-38-1 Macro-C failure 演示场景：演化面采集域返回空事实集（facet_rows=0，data doesn't show 形态）→ 主前提不可裁定，发起 GapRequest ⚠ unverified
>
> 披露块（preview 标注诚实 = 决策本体，ADR-0017；机器可读字段见侧车 preview_disclosure）
> - capability: capability 2 of 5 · preview
> - calibration_scope: 单仓校准（anysearch-cli）
> - structural_limitations: 校准语料 = 单仓（anysearch-cli，65 ADR＋supersede 链稀缺素材），不构成泛化证据——dogfooding = generative not evaluative（D-033），GA 前置须 ≥1 非自有公开仓（#40 / D-013）；同主仓确认偏差面：试点仓与产品同主，本报告仅作校准＋冒烟依据；LLM 叙事面 env 门控关：S4 假设失效检测深检维度降级 ⚠ unverified（llm_gated 明示，不伪造不真调）；供应链象限 ⚠ 数据未接：Scorecard/repomix 未接不插队（D-034③）；structure/behavior 象限为衍生观测（无预声明阈值基线）——观测值如实落 slice_fields 不裁决
> - not_in_preview: Micro-A / Micro-B / Macro-A

## C1 执行摘要

- report_id: MA-38-ANYSEARCH-MACRO-C-PREVIEW-degraded
- schema_version: 1.2.0
- scale: Macro-C
- subject_ref: anysearch-cli@b45d07992d9c
- generated_at: 2026-09-22T10:31:10+08:00
- correlation_key: trace_id=ca2009f0696c43be0a8e52619c2b6d6b baggage_id=a6de0fd562d76108022996f097a78312
- overall_verdict: insufficient
- confidence: 0
- headline: anysearch-cli Macro-C preview（capability 2 of 5）：全链实跑——codelore 30/30 面 + ADR 65 份（v2 回退链解析日期 76）+ supersede 引用网 8 边零断链零缺回链 + lag 可判定 76；S4 深检面 llm_gated → 综合裁定 insufficient（preview 诚实部分裁定，非管线失败）；共享事实库已证（Macro-B 228 + Macro-C 1177 同库）→ mw-trigger-b 触发登记。
- degraded_mode: true
- stale_data_marker: unknown（SLA 5s / 实测延迟 0s）
- read_model_version: 1.2.0 · fact_watermark_version: 1
- top_findings: EV-38-01, EV-38-04, EV-38-05, EV-38-07
- fact_ids: 0 条（清单见侧车 JSON）

## C2 四象限与裁决

### strategy（applicability=native）
- verdict: insufficient · score: n/a · confidence: 0
- dimensions: S2, S4
- slice_fields: {"adr_count":76,"supersede_edges":8,"supersede_unresolved":0,"supersede_missing_backrefs":0,"lag_judgeable_n":76,"adr_date_resolvable":76,"llm_gate":"closed"}
- conflict_markers: single-repo-calibration, degraded
- verdict_gate: ADR-0013-C/v1 / insufficient / evidence_flag=false / decided_at=2026-09-22T10:31:10+08:00 / audit_ref=reports/38-macro-c-preview.mjs

### structure（applicability=derived）
- verdict: insufficient · score: n/a · confidence: 0
- dimensions: S3
- slice_fields: {"god_classes_rows":8,"architecture_metrics_rows":18,"dependency_cycles_rows":0,"modularity_violations_rows":82,"instability_rows":325,"architecture_roles_rows":325}
- conflict_markers: preview-derived-observation-only, degraded
- verdict_gate: ADR-0013-C/v1 / insufficient / evidence_flag=false / decided_at=2026-09-22T10:31:10+08:00 / audit_ref=reports/38-macro-c-preview.mjs

### behavior（applicability=derived）
- verdict: insufficient · score: n/a · confidence: 0
- dimensions: S5
- slice_fields: {"revisions_rows":104,"abs_churn_rows":36,"entity_churn_rows":104,"hotspot_velocity_rows":104,"code_age_rows":83,"lead_time_rows":469,"release_cadence_rows":7,"ownership_rows":104,"bus_factor_rows":11}
- conflict_markers: preview-derived-observation-only, degraded
- verdict_gate: ADR-0013-C/v1 / insufficient / evidence_flag=false / decided_at=2026-09-22T10:31:10+08:00 / audit_ref=reports/38-macro-c-preview.mjs

### supply_chain（applicability=not_applicable）
- verdict: insufficient · score: n/a · confidence: 0
- dimensions: 
- slice_fields: {}
- conflict_markers: data-not-connected, degraded
- verdict_gate: ADR-0013-C/v1 / insufficient / evidence_flag=false / decided_at=2026-09-22T10:31:10+08:00 / audit_ref=reports/38-macro-c-preview.mjs

#### 结构化裁决块（agent 可消费）
- protocol_version: ADR-0013-C/v1
- overall: insufficient · decided_at: 2026-09-22T10:31:10+08:00
- PC-MC-1: insufficient | basis=B1+B4 | facts=(none) | evidence=(none) | 降级：FP-38-1 Macro-C failure 演示场景：演化面采集域返回空事实集（facet_rows=0，data doesn't show 形态）→ 主前提不可裁定，发起 GapRequest
- PC-MC-2: insufficient | basis=B1+B4 | facts=(none) | evidence=(none) | 降级：FP-38-1 Macro-C failure 演示场景：演化面采集域返回空事实集（facet_rows=0，data doesn't show 形态）→ 主前提不可裁定，发起 GapRequest
- TC-MC-1: insufficient | basis=B1+B4 | facts=(none) | evidence=(none) | 降级：FP-38-1 Macro-C failure 演示场景：演化面采集域返回空事实集（facet_rows=0，data doesn't show 形态）→ 主前提不可裁定，发起 GapRequest
- TC-MC-2: insufficient | basis=B1+B4 | facts=(none) | evidence=(none) | 降级：FP-38-1 Macro-C failure 演示场景：演化面采集域返回空事实集（facet_rows=0，data doesn't show 形态）→ 主前提不可裁定，发起 GapRequest
- TC-MC-3: insufficient | basis=B1+B4 | facts=(none) | evidence=(none) | 降级：FP-38-1 Macro-C failure 演示场景：演化面采集域返回空事实集（facet_rows=0，data doesn't show 形态）→ 主前提不可裁定，发起 GapRequest
- NC-MC-1: insufficient | basis=B1+B4 | facts=(none) | evidence=(none) | 降级：FP-38-1 Macro-C failure 演示场景：演化面采集域返回空事实集（facet_rows=0，data doesn't show 形态）→ 主前提不可裁定，发起 GapRequest
- human_adjudication: pending（裁定仍由人做，见 B5）
#### 叙事段（宿主 agent 生成/kernel 盖章；叙事面不携带裁决 band——红线 D-053/ADR-0013）
- [kernel-template-fallback] author=kernel-template model_id=(none) stamp=sealed grounded=0/0
  - text: 本段为 kernel 模板叙事（degraded 兜底位 ⚠ unverified）：四象限覆盖 strategy·structure·behavior·supply_chain，逐维裁定见 C2 结构化裁决块（本段不重复断言任何判定）；证据与引文支持关系见 C3；降级原因：FP-38-1 Macro-C failure 演示场景：演化面采集域返回空事实集（facet_rows=0，data doesn't show 形态）→ 主前提不可裁定，发起 GapRequest。正式叙事归宿主 agent 经 MCP facts 只读投影取数后生成——模板叙事不替代之。

## C3 证据

### EV-38-01 — .scratch/architecture-recovery/reports/38-macro-c-measurements.json @ L68
- claim: 本次实测：supersede 引用网 8 边（whole 1 + item 2 + amends 2 + defer 1 + 纪律样本 2）
- grounded: false · collected_at: 2026-09-22T10:31:10+08:00
- reproduce_cmd: (absent: FP-38-1 Macro-C failure 演示场景：演化面采集域返回空事实集（facet_rows=0，data doesn't show 形态）→ 主前提不可裁定，发起 GapRequest)
- 引文原文: （缺失 —— ⚠ unverified）

### EV-38-02 — docs/adr/0058-ci-test-job-independence-and-gate-layer-entrypoint-narrowing.md @ L3
- claim: anysearch-cli 演化考古稀缺素材：whole-ADR supersede 事件 0058→0060 实物存在
- grounded: false · collected_at: 2026-09-22T10:31:10+08:00
- reproduce_cmd: (absent: FP-38-1 Macro-C failure 演示场景：演化面采集域返回空事实集（facet_rows=0，data doesn't show 形态）→ 主前提不可裁定，发起 GapRequest)
- 引文原文: （缺失 —— ⚠ unverified）

### EV-38-03 — docs/adr/0060-architecture-grill-round-59-archive-truthfulness-closure.md @ L11
- claim: 回链实物：ADR-0060 提及 ADR-0058（supersede 回链闭合）
- grounded: false · collected_at: 2026-09-22T10:31:10+08:00
- reproduce_cmd: (absent: FP-38-1 Macro-C failure 演示场景：演化面采集域返回空事实集（facet_rows=0，data doesn't show 形态）→ 主前提不可裁定，发起 GapRequest)
- 引文原文: （缺失 —— ⚠ unverified）

### EV-38-04 — .scratch/architecture-recovery/reports/38-macro-c-measurements.json @ L57
- claim: 本次实测：LLM env 门控关（CODELORE_LLM_* 未配置）→ llm_gated 降级披露
- grounded: false · collected_at: 2026-09-22T10:31:10+08:00
- reproduce_cmd: (absent: FP-38-1 Macro-C failure 演示场景：演化面采集域返回空事实集（facet_rows=0，data doesn't show 形态）→ 主前提不可裁定，发起 GapRequest)
- 引文原文: （缺失 —— ⚠ unverified）

### EV-38-05 — .scratch/architecture-recovery/reports/38-macro-c-measurements.json @ L19
- claim: 本次实测：CodeLore 契约面 30/30 facet_rows（零 facet_error）
- grounded: false · collected_at: 2026-09-22T10:31:10+08:00
- reproduce_cmd: (absent: FP-38-1 Macro-C failure 演示场景：演化面采集域返回空事实集（facet_rows=0，data doesn't show 形态）→ 主前提不可裁定，发起 GapRequest)
- 引文原文: （缺失 —— ⚠ unverified）

### EV-38-06 — .scratch/macro-audit/decision-ledger.md @ L89
- claim: D-034⑤：Macro-C preview 报告强制披露「单仓校准（anysearch-cli）」结构性限制
- grounded: false · collected_at: 2026-09-22T10:31:10+08:00
- reproduce_cmd: (absent: FP-38-1 Macro-C failure 演示场景：演化面采集域返回空事实集（facet_rows=0，data doesn't show 形态）→ 主前提不可裁定，发起 GapRequest)
- 引文原文: （缺失 —— ⚠ unverified）

### EV-38-07 — .scratch/architecture-recovery/reports/38-macro-c-measurements.json @ L93
- claim: 本次实测：共享事实库 38-audit-facts.duckdb 同库双 scale（Macro-B 回放 + Macro-C 追加）
- grounded: false · collected_at: 2026-09-22T10:31:10+08:00
- reproduce_cmd: (absent: FP-38-1 Macro-C failure 演示场景：演化面采集域返回空事实集（facet_rows=0，data doesn't show 形态）→ 主前提不可裁定，发起 GapRequest)
- 引文原文: （缺失 —— ⚠ unverified）

### EV-38-08 — .scratch/architecture-recovery/reports/38-macro-c-measurements.json @ L15
- claim: 本次实测：ADR 决策日 vs 首提交 lag 可判定数
- grounded: false · collected_at: 2026-09-22T10:31:10+08:00
- reproduce_cmd: (absent: FP-38-1 Macro-C failure 演示场景：演化面采集域返回空事实集（facet_rows=0，data doesn't show 形态）→ 主前提不可裁定，发起 GapRequest)
- 引文原文: （缺失 —— ⚠ unverified）

### EV-38-09 — .scratch/architecture-recovery/reports/37-pilot-measurements.json @ L602
- claim: 对账：37-pilot 存档 anysearch-cli supersede 边 = 8（38 复测一致性基准）
- grounded: false · collected_at: 2026-09-22T10:31:10+08:00
- reproduce_cmd: (absent: FP-38-1 Macro-C failure 演示场景：演化面采集域返回空事实集（facet_rows=0，data doesn't show 形态）→ 主前提不可裁定，发起 GapRequest)
- 引文原文: （缺失 —— ⚠ unverified）

#### 引文→结论支持关系校验
- CL-38-01 -> EV-38-01: insufficient（matched= missing=edge_count|8）引文未落地（grounded=false 或 excerpt 为空）——有引文不等于支撑结论
- CL-38-02 -> EV-38-02: insufficient（matched= missing=Superseded by ADR-0060）引文未落地（grounded=false 或 excerpt 为空）——有引文不等于支撑结论
- CL-38-03 -> EV-38-03: insufficient（matched= missing=ADR-0058）引文未落地（grounded=false 或 excerpt 为空）——有引文不等于支撑结论
- CL-38-04 -> EV-38-04: insufficient（matched= missing=configured|false）引文未落地（grounded=false 或 excerpt 为空）——有引文不等于支撑结论
- CL-38-05 -> EV-38-05: insufficient（matched= missing=facet_rows|30）引文未落地（grounded=false 或 excerpt 为空）——有引文不等于支撑结论
- CL-38-06 -> EV-38-06: insufficient（matched= missing=单仓校准（anysearch-cli））引文未落地（grounded=false 或 excerpt 为空）——有引文不等于支撑结论
- CL-38-07 -> EV-38-07: insufficient（matched= missing=macro_b_facts）引文未落地（grounded=false 或 excerpt 为空）——有引文不等于支撑结论
- CL-38-08 -> EV-38-08: insufficient（matched= missing=lag_judgeable_n）引文未落地（grounded=false 或 excerpt 为空）——有引文不等于支撑结论
- CL-38-09 -> EV-38-09: insufficient（matched= missing=edge_count|8）引文未落地（grounded=false 或 excerpt 为空）——有引文不等于支撑结论

## C4 行动建议

### R-38-1 [P1] 配置 CODELORE_LLM_PROVIDER/MODEL（或 ANTHROPIC_API_KEY）激活 S4 假设失效检测面，复跑本 preview
- rationale: TC-MC-3 因 env 门控关判 insufficient——S4 演化方向深检是当前唯一未验证维度；上限走 MACRO_AUDIT_CODELORE_LLM_MAX_CALLS 计量
- expected_impact: TC-MC-3 由 insufficient 转可判定，overall 具升级通道 · effort: S
- verdict_gate_stamp: insufficient ⚠ unverified
- evidence_refs: EV-38-04
- degraded_note: 降级产出：FP-38-1 Macro-C failure 演示场景：演化面采集域返回空事实集（facet_rows=0，data doesn't show 形态）→ 主前提不可裁定，发起 GapRequest ⚠ unverified

### R-38-2 [P1] 引入 ≥1 非自有公开仓经 URL opt-in 跑 Macro-C（衔接 #40 / D-013）
- rationale: 单仓校准（anysearch-cli）属 dogfooding——generative not evaluative（D-033）；泛化证据是 GA 前置
- expected_impact: 披露块结构性限制项①获得实证闭环 · effort: M
- verdict_gate_stamp: insufficient ⚠ unverified
- evidence_refs: EV-38-06
- degraded_note: 降级产出：FP-38-1 Macro-C failure 演示场景：演化面采集域返回空事实集（facet_rows=0，data doesn't show 形态）→ 主前提不可裁定，发起 GapRequest ⚠ unverified

### R-38-3 [P1] 多写者 self-probe 实测封口（mw-trigger-b 已触发登记）
- rationale: 本票已证共用同一 audit_fact DuckDB——多写者域并发策略由触发条款进入实测封口通道（D-034④b）
- expected_impact: 任务 7 多写者域从挂门转实测 · effort: M
- verdict_gate_stamp: insufficient ⚠ unverified
- evidence_refs: EV-38-07
- degraded_note: 降级产出：FP-38-1 Macro-C failure 演示场景：演化面采集域返回空事实集（facet_rows=0，data doesn't show 形态）→ 主前提不可裁定，发起 GapRequest ⚠ unverified

### R-38-4 [P3] 供应链象限维持「⚠ 数据未接」，Scorecard 探针按层需求队列接入（#42）
- rationale: D-034③ 降级披露制已立法——禁止为补齐象限插队上游
- expected_impact: preview 诚实形态保持 · effort: S
- verdict_gate_stamp: insufficient ⚠ unverified
- evidence_refs: EV-38-01
- degraded_note: 降级产出：FP-38-1 Macro-C failure 演示场景：演化面采集域返回空事实集（facet_rows=0，data doesn't show 形态）→ 主前提不可裁定，发起 GapRequest ⚠ unverified


