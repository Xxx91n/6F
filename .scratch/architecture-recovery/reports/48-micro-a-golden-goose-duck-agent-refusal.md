# MA-48-GOOSEDUCKAGENT-REFUSAL — Micro-A 首报（Xxx91n/goose-duck-agent）
> RECEIPT RCP-9998cc7aa518615d chain=9998cc7aa518615da70cb77e83a5bf7b content=31e8775412becbfb facts=3 adjudications=2 issued_at=2026-09-17T15:41:28.607Z commit=unanchored-no-local-clone tree=unanchored
>
> 骨架 1.2.0（章顺序锁定，ADR-0006）· 裁定协议 ADR-0013-C/v1 · 生成于 2026-09-17T15:41:28.607Z
>
> 披露块（preview 标注诚实 = 决策本体，ADR-0017；机器可读字段见侧车 preview_disclosure）
> - capability: capability 3 of 5 · preview
> - calibration_scope: 托管面资格闸拒绝件（failure 演示面）
> - structural_limitations: golden 回放：响应来自 cassette 录制非实时 API——本件为管道 golden 产物非真实审计；拒绝语义：intake 阶段显式拒绝（D-033 硬约束逆用）——报告落 unsupported: 无托管 PR 面＋原因＋前置条件；票面前提漂移如实登记：anysearch-cli 票面撰写时无托管面（#37 实测 github_pr_total=0），本票复核托管枚举 merged=null——前提已漂移，failure 演示主体改取真负例 goose-duck-agent（merged=0）
> - not_in_preview: Micro-B / Macro-A

## C1 执行摘要

- report_id: MA-48-GOOSEDUCKAGENT-REFUSAL
- schema_version: 1.2.0
- scale: Micro-A
- subject_ref: Xxx91n/goose-duck-agent
- generated_at: 2026-09-17T15:41:28.607Z
- correlation_key: trace_id=e900dced2ad98b107bbf9fe9d25acbc5 baggage_id=c342b8667e33736f5332cb6600b26929
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
- verdict_gate: ADR-0013-C/v1 / insufficient / evidence_flag=false / decided_at=2026-09-17T15:41:28.607Z / audit_ref=reports/48-micro-a-preview.mjs

### structure（applicability=not_applicable）
- verdict: insufficient · score: n/a · confidence: 0
- dimensions: 
- slice_fields: {}
- conflict_markers: intake-refused
- verdict_gate: ADR-0013-C/v1 / insufficient / evidence_flag=false / decided_at=2026-09-17T15:41:28.607Z / audit_ref=reports/48-micro-a-preview.mjs

### supply_chain（applicability=not_applicable）
- verdict: insufficient · score: n/a · confidence: 0
- dimensions: 
- slice_fields: {}
- conflict_markers: intake-refused
- verdict_gate: ADR-0013-C/v1 / insufficient / evidence_flag=false / decided_at=2026-09-17T15:41:28.607Z / audit_ref=reports/48-micro-a-preview.mjs

### strategy（applicability=not_applicable）
- verdict: insufficient · score: n/a · confidence: 0
- dimensions: 
- slice_fields: {}
- conflict_markers: intake-refused
- verdict_gate: ADR-0013-C/v1 / insufficient / evidence_flag=false / decided_at=2026-09-17T15:41:28.607Z / audit_ref=reports/48-micro-a-preview.mjs

#### 结构化裁决块（agent 可消费）
- protocol_version: ADR-0013-C/v1
- overall: unsupported · decided_at: 2026-09-17T15:41:28.607Z
- PC-1: supported | basis=B1 | facts=d42a6ec9-2576-162b-37f3-a3d36a9414bf | evidence=EV-48-GOOSEDUCKAGENT-REF-01 | 适配器 run 事实在案：calls=1 strategy=unauthenticated（枚举真实发生——拒绝非管线故障）
- TC-4: unsupported | basis=B2 | facts=(none) | evidence=EV-48-GOOSEDUCKAGENT-REF-01 | 托管面资格闸未过：goose-duck-agent 托管枚举 merged PR=0 → intake 显式拒绝（D-033 硬约束逆用）。原因=无托管 PR 面（无可裁 PR 对象）；前置条件=仓接入托管 PR 流程且产出 ≥1 merged PR 后再复审
- human_adjudication: pending（裁定仍由人做，见 B5）

## C3 证据

### EV-48-GOOSEDUCKAGENT-REF-01 — 48-micro-a-golden-gate-probes.json @ L7
- claim: 本次实测：goose-duck-agent 托管枚举 merged PR=0——无托管 PR 面
- grounded: true · collected_at: 2026-09-17T15:41:28.607Z
- reproduce_cmd: node .scratch/architecture-recovery/reports/48-micro-a-preview.mjs --golden
- 引文原文: "name": "goose-duck-agent",

### EV-48-GOOSEDUCKAGENT-REF-02 — 48-micro-a-golden-gate-probes.json @ L14
- claim: 前提漂移锚：anysearch-cli 票面撰写时无托管面（#37 实测 pr=0），本票复核托管枚举 merged=null
- grounded: true · collected_at: 2026-09-17T15:41:28.607Z
- reproduce_cmd: node .scratch/architecture-recovery/reports/48-micro-a-preview.mjs --golden
- 引文原文: "name": "anysearch-cli",

### EV-48-GOOSEDUCKAGENT-REF-03 — .scratch/macro-audit/decision-ledger.md @ L54
- claim: 硬约束锚：D-033/D-049「PR 层试点不得指派无托管 PR 面的仓」
- grounded: true · collected_at: 2026-09-17T15:41:28.607Z
- reproduce_cmd: git -C D:\Aworker\6F show HEAD:.scratch/macro-audit/decision-ledger.md
- 引文原文: | D-049 | Q2（轮11）：Micro-A preview 铺开票（拟 #48）票面形态如何定义？（W15③；前置 #47 已凭 D-048 立案；desk-task15 判据=「≥1 条 Micro-A 真实 PR 报告产出且字段清单满足骨架交集」重绑 micro-a-preview-prep；atomcode 深调研 R11-Q2：11 查询×5 角度／6 原文核验，置信高） | 采纳（2026-09-16，原话「采纳」＝采纳修正后推荐全项） | ① #48 单票铺开=适配器消费侧管道（PR intake→facts→共享骨架 Micro-A 切片渲染）＋双仓试点实跑＋报告双件＋披露三件套，一票闭环对齐 ADR-0017 层自成完整价值单元与 #38/#39 双先例；② 票内验收序列写死：a. golden 契约驱动管道段 PASS → b. env-manager 三形态实跑 → c. jiahao 全人基线 → d. failure 件 → e. 披露三件套 → f. desk-task15 判据核验＋micro-a-preview-prep 事件闭环；③ PR 选取最小充分集=恰 4 条具体实例：env-manager×3（dependabot×1＋release-please×1＋人类×1）＋jiahao×1（全人 merged 对照），硬判据=已 merged＋diff 规模适中（非单行非巨型重写，票面写死实例不给通用公式）；④ failure 演示件=anysearch-cli 无托管面诚实拒绝（D-033 硬约束逆用：intake 阶段显式拒绝→报告落 unsupported: 无托管 PR 面＋原因＋前置条件，复刻 A-044 先例）；token 缺席降级=degraded 通道 golden cassette 占位不混测；⑤ desk-task15 验证=字段断言脚本化进 NN-check.mjs：字段清单从 ADR-0006 骨架∩Micro-A 切片机械导出（禁手抄漂移），happy 正向 ⊇ 断言＋failure 反向拒绝语义断言；golden 只锁字段骨架不锁内容值（内容级 golden 归 GA 收口）；⑥ 披露三件套=preview 标注（capability N of M 措辞对齐 D-031 先例）＋同主确认偏差（happy 件报告头部醒目位置非脚注）＋「平台声明的 Bot 身份」措辞 | 票面引用 D-047 口径不得回引 D-033 原文（原判已被 #37 实测证伪）；happy 件=真实审计产物（D-030 provenance 披露制），fixture 仅用于管道 golden 段——票面写明两通道口径防「真实报告被误标 fixture」；骨架字段与真实 PR 数据不适配时不得在 #48 内静默改骨架（走 D-025 勘误双读数，骨架改动另立决策）；机器 PR 审计结果不得被读作人类代码质量结论（反向失真红线）；票面叙事写「试点集」不得写「覆盖面」（2 仓 4 PR 是形态覆盖非统计样本）；实跑凭据走主路或 gh 回退须如实披露；#47 未落地前 #48 不并行抢工（票面显式声明前置）；冲突核查 41 current 零冲突零 revised；执行时点=整理环节立案（BACKLOG #48＋spec-phase-tasks 注记），实现落执行窗 | current |

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


