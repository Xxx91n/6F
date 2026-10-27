# MA-48-GOOSEDUCKAGENT-REFUSAL — Micro-A 首报（Xxx91n/goose-duck-agent）
> RECEIPT RCP-47855f19017680f3 chain=47855f19017680f3e1d59a20ec64b18f content=abcc5d4877749285 facts=3 adjudications=2 issued_at=1970-01-01T00:00:00.000Z commit=unanchored-no-local-clone tree=unanchored
>
> 骨架 1.2.0（章顺序锁定，ADR-0006）· 裁定协议 ADR-0013-C/v1 · 生成于 1970-01-01T00:00:00.000Z
>
> 披露块（preview 标注诚实 = 决策本体，ADR-0017；机器可读字段见侧车 preview_disclosure）
> - capability: capability 3 of 5 · preview
> - calibration_scope: 托管面资格闸拒绝件（failure 演示面）
> - structural_limitations: golden 回放：响应来自 cassette 录制非实时 API——本件为管道 golden 产物非真实审计；拒绝语义：intake 阶段显式拒绝（D-033 硬约束逆用）——报告落 unsupported: 无托管 PR 面＋原因＋前置条件；票面前提漂移如实登记：anysearch-cli 票面撰写时无托管面（#37 实测 github_pr_total=0），本票复核托管枚举 merged=null——前提已漂移，failure 演示主体改取真负例 goose-duck-agent（merged=0）；适配器硬化面已落 engine 一等面（#85② 闭环，D-204③④）：宿主 API diff 工件双通道＋cassette 回放见 engine/src/audit/micro-a.ts
> - not_in_preview: Macro-A

## C1 执行摘要

- report_id: MA-48-GOOSEDUCKAGENT-REFUSAL
- schema_version: 1.2.0
- scale: Micro-A
- subject_ref: Xxx91n/goose-duck-agent
- generated_at: 1970-01-01T00:00:00.000Z
- correlation_key: trace_id=4c10f5412bafacc93d38ceb90994f2cd baggage_id=c342b8667e33736f5332cb6600b26929
- overall_verdict: unsupported
- confidence: 0.9
- headline: goose-duck-agent Micro-A preview 拒绝件：托管枚举 merged PR=0——无托管 PR 面，intake 显式拒绝（unsupported；非管线故障，枚举真实发生）
- degraded_mode: false
- stale_data_marker: fresh（SLA 5s / 实测延迟 0s）
- read_model_version: 1.2.0 · fact_watermark_version: 1
- top_findings: EV-48-GOOSEDUCKAGENT-REF-01, EV-48-GOOSEDUCKAGENT-REF-02
- fact_ids: 3 条（清单见侧车 JSON）

## C2 四象限与裁决

### behavior（applicability=not_applicable）
- verdict: insufficient · score: n/a · confidence: 0
- dimensions: 
- slice_fields: {}
- conflict_markers: intake-refused
- verdict_gate: ADR-0013-C/v1 / insufficient / evidence_flag=false / decided_at=1970-01-01T00:00:00.000Z / audit_ref=reports/48-micro-a-preview.mjs

### structure（applicability=not_applicable）
- verdict: insufficient · score: n/a · confidence: 0
- dimensions: 
- slice_fields: {}
- conflict_markers: intake-refused
- verdict_gate: ADR-0013-C/v1 / insufficient / evidence_flag=false / decided_at=1970-01-01T00:00:00.000Z / audit_ref=reports/48-micro-a-preview.mjs

### supply_chain（applicability=not_applicable）
- verdict: insufficient · score: n/a · confidence: 0
- dimensions: 
- slice_fields: {}
- conflict_markers: intake-refused
- verdict_gate: ADR-0013-C/v1 / insufficient / evidence_flag=false / decided_at=1970-01-01T00:00:00.000Z / audit_ref=reports/48-micro-a-preview.mjs

### strategy（applicability=not_applicable）
- verdict: insufficient · score: n/a · confidence: 0
- dimensions: 
- slice_fields: {}
- conflict_markers: intake-refused
- verdict_gate: ADR-0013-C/v1 / insufficient / evidence_flag=false / decided_at=1970-01-01T00:00:00.000Z / audit_ref=reports/48-micro-a-preview.mjs

#### 结构化裁决块（agent 可消费）
- protocol_version: ADR-0013-C/v1
- overall: unsupported · decided_at: 1970-01-01T00:00:00.000Z
- PC-1: supported | basis=B1 | facts=dcefc237-7de8-4243-1941-365bddbbf7a4 | evidence=EV-48-GOOSEDUCKAGENT-REF-01 | 适配器 run 事实在案：calls=1 strategy=unauthenticated（枚举真实发生——拒绝非管线故障）
- TC-4: unsupported | basis=B2 | facts=(none) | evidence=EV-48-GOOSEDUCKAGENT-REF-01 | 托管面资格闸未过：goose-duck-agent 托管枚举 merged PR=0 → intake 显式拒绝（D-033 硬约束逆用）。原因=无托管 PR 面（无可裁 PR 对象）；前置条件=仓接入托管 PR 流程且产出 ≥1 merged PR 后再复审
- human_adjudication: pending（裁定仍由人做，见 B5）

## C3 证据

### EV-48-GOOSEDUCKAGENT-REF-01 — 48-micro-a-golden-gate-probes.json @ L7
- claim: 本次实测：goose-duck-agent 托管枚举 merged PR=0——无托管 PR 面
- grounded: true · collected_at: 1970-01-01T00:00:00.000Z
- reproduce_cmd: node engine/test/contracts/48-micro-a-preview.mjs --golden
- 引文原文: "name": "goose-duck-agent",

### EV-48-GOOSEDUCKAGENT-REF-02 — 48-micro-a-golden-gate-probes.json @ L14
- claim: 前提漂移锚：anysearch-cli 票面撰写时无托管面（#37 实测 pr=0），本票复核托管枚举 merged=null
- grounded: true · collected_at: 1970-01-01T00:00:00.000Z
- reproduce_cmd: node engine/test/contracts/48-micro-a-preview.mjs --golden
- 引文原文: "name": "anysearch-cli",

### EV-48-GOOSEDUCKAGENT-REF-03 — docs/archive/decisions/macro-audit-ledger.md @ L88
- claim: 硬约束锚：D-033/D-049「PR 层试点不得指派无托管 PR 面的仓」
- grounded: true · collected_at: 1970-01-01T00:00:00.000Z
- reproduce_cmd: git -C <repo> show HEAD:docs/archive/decisions/macro-audit-ledger.md
- 引文原文: | D-033 | Q5（轮7）：#25-B4.2 与 jiahao / anysearch-cli / env-manager 三试点仓对接的产品方向与优先级？ | OK（2026-09-15，原话「OK」＝采纳推荐全项；基于 atomcode 取证：6 searches/7 全文核验，角色框架高置信、多仓排序法中置信=a16z design-partner 框架迁移；缺口：各仓 PR 人/机比与 supersede 链完整度未实测） | 对接方向=试点仓角色绑定能力层而非仓：① 角色分配=anysearch-cli→Macro-C 校准语料（56 ADR＋supersede 链稀缺素材）／env-manager→Micro-A 唯一合格试点＋泛化验证（唯一托管 PR 面，含 dependabot/release-please 非人类 PR 边缘形态）／jiahao→Micro-B·Macro-B 回归＋下限测试（纯本地仓测「git 健全无托管」下限）／三仓并跑→Macro-A 泛化冒烟（需≥2仓天然最后）；② 时序=Macro-B 已上架层立即对三仓各跑一次 one-shot 泛化验证，jiahao 挂 Macro-B 持续回归（阶段3 CI 票），其余层试点随各 preview 漏斗；③ 前置票=试点面可用性审计脚本（PR 人/机比、supersede 链完整度实测）；④ 拆票=可用性审计→Macro-B 三仓 one-shot→各层试点→回归接入，不立大票 | 结构性限制入规：三仓同主属确认偏差面（dogfooding=generative not evaluative，OCLint 官方口径只给信心不证泛化），试点定位=校准＋冒烟；泛化验证必须引≥1 非自有公开仓（D-013 URL opt-in 首实用户），登记为 Macro-B GA 前置条件；持续回归仅限已上架层；试点成功度量=反复接受非跑通；PR 层试点不得指派无托管 PR 面的仓（capacity 硬约束）；冲突核查 26 条 current 无 revised；执行时点=grill 定稿后整理环节；整理环节更新 #25-checklist B4.2 行=decided-now | current |

#### 引文→结论支持关系校验
- CL-48-GOOSEDUCKAGENT-REF-01 -> EV-48-GOOSEDUCKAGENT-REF-01: supports（matched=goose-duck-agent missing=）全部支撑锚在引文原文中逐字命中（语境剥离后 presence-level 成立——非语义蕴含）
- CL-48-GOOSEDUCKAGENT-REF-02 -> EV-48-GOOSEDUCKAGENT-REF-02: supports（matched=anysearch-cli missing=）全部支撑锚在引文原文中逐字命中（语境剥离后 presence-level 成立——非语义蕴含）
- CL-48-GOOSEDUCKAGENT-REF-03 -> EV-48-GOOSEDUCKAGENT-REF-03: insufficient（matched= missing=无托管 PR 面）支撑锚未命中或语境剥离（否定/引语/归属窗）：无托管 PR 面

## C4 行动建议

### R-48-GOOSEDUCKAGENT-REF-1 [P1] 前置条件：goose-duck-agent 接入托管 PR 流程并产出 ≥1 merged PR 后，Micro-A 指派复审再开（D-033 capacity 硬约束）
- rationale: 无托管 PR 面仓不得指派 PR 层试点——拒绝是判据成立形态非失败
- expected_impact: Micro-A 试点指派纪律守住 · effort: XS
- verdict_gate_stamp: ADR-0013-C/v1 / unsupported
- evidence_refs: EV-48-GOOSEDUCKAGENT-REF-03
- degraded_note: (none)


## Intake Health

- 契约：ADR-0022 违约两级处置——协议级违约 fail-fast（崩溃桶工件），字段级病态=quarantine 桶隔离（判定/处置硬分界）
- 摄入无病态声明：quarantined=0 · normalized=0（接线字段未供给 intake_health——同形骨架负声明，证据缺席≠证据为零）

