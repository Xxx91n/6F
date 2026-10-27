# MA-48-ENVMANAGER-PR64-PREVIEW — Micro-A 首报（Xxx91n/env-manager#64）
> RECEIPT RCP-6de209b26f79e013 chain=6de209b26f79e0130595dfb8ef1a87ec content=1be64ee5bcba4cec facts=3 adjudications=6 issued_at=1970-01-01T00:00:00.000Z commit=f5423020e02a0369730c360b8238a234730be85c tree=unanchored
>
> 骨架 1.2.0（章顺序锁定，ADR-0006）· 裁定协议 ADR-0013-C/v1 · 生成于 1970-01-01T00:00:00.000Z
>
> 披露块（preview 标注诚实 = 决策本体，ADR-0017；机器可读字段见侧车 preview_disclosure）
> - capability: capability 3 of 5 · preview
> - calibration_scope: 同主试点仓 merged PR 最小集（env-manager×3 形态＋jiahao×1 全人基线；票面写死实例）
> - structural_limitations: golden 回放：响应来自 cassette 录制非实时 API——本件为管道 golden 产物非真实审计；同主确认偏差：试点仓与产品同主（Xxx91n）——dogfooding = generative not evaluative（D-033），本报告属校准+冒烟不构成泛化证据；判据范围收窄：preview 判据=证据完整性/托管面资格/选择性，非 PR 质量裁决——diff --llm 行级语义评审归 #50 叙事双轨（D-053）；reviews/comments 面 planned 未接（锁表 github-rest 契约面）——评审语义不在 preview 内；supply_chain 象限 not_applicable：Scorecard 未接（D-034③）；dependabot PR 的供应链信号仅作事实落库；适配器硬化面已落 engine 一等面（#85② 闭环，D-204③④）：宿主 API diff 工件双通道＋cassette 回放见 engine/src/audit/micro-a.ts（重校准背书=85-check E 组）
> - not_in_preview: Macro-A

## C1 执行摘要

- report_id: MA-48-ENVMANAGER-PR64-PREVIEW
- schema_version: 1.2.0
- scale: Micro-A
- subject_ref: Xxx91n/env-manager#64
- generated_at: 1970-01-01T00:00:00.000Z
- correlation_key: trace_id=e7d54d368784ea3f02b9bdd9424b8ec5 baggage_id=b48f14d63db2bca095fcb730d4d4d666
- overall_verdict: supported
- confidence: 0.6
- headline: Xxx91n/env-manager#64 Micro-A preview（capability 3 of 5）：form=machine-generated/release-please diff_channel=api +null/-null f=null → supported
- degraded_mode: false
- stale_data_marker: fresh（SLA 5s / 实测延迟 0s）
- read_model_version: 1.2.0 · fact_watermark_version: 1
- top_findings: EV-48-ENVMANAGER-PR64-01, EV-48-ENVMANAGER-PR64-02, EV-48-ENVMANAGER-PR64-03
- fact_ids: 3 条（清单见侧车 JSON）

## C2 四象限与裁决

### behavior（applicability=native）
- verdict: supported · score: n/a · confidence: 0.6
- dimensions: 
- slice_fields: {"pr_number":64,"pr_title":"chore(main): release 0.12.1","pr_state":"closed","merged":true,"merged_at":"2026-09-14T17:14:23Z","author_login":"github-actions[bot]","author_type":"Bot","bot_declared":true,"bot_basis":"platform-declared:user.type==Bot&&login~[bot]","author_form":"machine-generated/release-please","head_sha":"4d601a66f390146ea105c0dc12313fc716ae5afc","base_sha":"17038beff45d132395475a050dbf454af15a7f1a","merge_commit_sha":"f5423020e02a0369730c360b8238a234730be85c","html_url":"https://github.com/Xxx91n/env-manager/pull/64","diff_channel":"api","diff_files_changed":null,"diff_additions":null,"diff_deletions":null,"diff_bytes":1549,"credential_strategy":"env-token","credential_degraded":false,"api_calls":4,"rate_limit_remaining":4990}
- conflict_markers: (none)
- verdict_gate: ADR-0013-C/v1 / supported / evidence_flag=true / decided_at=1970-01-01T00:00:00.000Z / audit_ref=reports/48-micro-a-preview.mjs

### structure（applicability=not_applicable）
- verdict: insufficient · score: n/a · confidence: 0
- dimensions: 
- slice_fields: {}
- conflict_markers: out-of-scope-micro-a
- verdict_gate: ADR-0013-C/v1 / insufficient / evidence_flag=false / decided_at=1970-01-01T00:00:00.000Z / audit_ref=reports/48-micro-a-preview.mjs

### supply_chain（applicability=not_applicable）
- verdict: insufficient · score: n/a · confidence: 0
- dimensions: 
- slice_fields: {}
- conflict_markers: data-not-connected
- verdict_gate: ADR-0013-C/v1 / insufficient / evidence_flag=false / decided_at=1970-01-01T00:00:00.000Z / audit_ref=reports/48-micro-a-preview.mjs

### strategy（applicability=not_applicable）
- verdict: insufficient · score: n/a · confidence: 0
- dimensions: 
- slice_fields: {}
- conflict_markers: out-of-scope-micro-a
- verdict_gate: ADR-0013-C/v1 / insufficient / evidence_flag=false / decided_at=1970-01-01T00:00:00.000Z / audit_ref=reports/48-micro-a-preview.mjs

#### 结构化裁决块（agent 可消费）
- protocol_version: ADR-0013-C/v1
- overall: supported · decided_at: 1970-01-01T00:00:00.000Z
- PC-1: supported | basis=B1 | facts=cba7a84d-0276-1f6f-f4b6-bd27155c4721 | evidence=EV-48-ENVMANAGER-PR64-01 | 适配器 run 事实在案：prs_listed=62 calls=4 strategy=env-token（枚举真实发生）
- TC-1: supported | basis=B2 | facts=1bff93d3-f0bb-ca11-69d7-e84b941a887a,556a2e89-e493-bb4b-150b-d088e3e90566,874d691e-99d9-6c76-563f-2efef1b43427 | evidence=EV-48-ENVMANAGER-PR64-03 | PR 证据三联齐备（summary＋metadata＋diff）且 merged=true
- TC-2: supported | basis=B2 | facts=874d691e-99d9-6c76-563f-2efef1b43427 | evidence=EV-48-ENVMANAGER-PR64-02 | diff channel=api files=null +null/-null bytes=1549（api 腿 stats 契约缺席 detail=api diff channel (base/head 本地缺席)）
- TC-3: supported | basis=B2 | facts=1bff93d3-f0bb-ca11-69d7-e84b941a887a | evidence=EV-48-ENVMANAGER-PR64-03 | 作者形态披露齐备：bot_declared=true basis=platform-declared:user.type==Bot&&login~[bot]
- TC-4: supported | basis=B2 | facts=(none) | evidence=EV-48-ENVMANAGER-PR64-01 | 托管面资格闸：env-manager 托管枚举 merged PR=17（≥1 即 eligible；D-033 硬约束逆用判据）
- NC-1: supported | basis=B4 | facts=1bff93d3-f0bb-ca11-69d7-e84b941a887a | evidence=EV-48-ENVMANAGER-PR64-03 | 负对照：入选实例 machine-generated/release-please 票面写死；实测 form=machine-generated/release-please merged=true（closed-unmerged 不入集、形态错配即判负）
- human_adjudication: pending（裁定仍由人做，见 B5）

## C3 证据

### EV-48-ENVMANAGER-PR64-01 — 48-micro-a-golden-env-manager-measurements.json @ L9
- claim: 本次实测：env-manager 托管枚举真实发生（prs_listed=62 merged=17）
- grounded: true · collected_at: 1970-01-01T00:00:00.000Z
- reproduce_cmd: node engine/test/contracts/48-micro-a-preview.mjs --golden
- 引文原文: "prs_listed": 62,

### EV-48-ENVMANAGER-PR64-02 — 48-micro-a-golden-env-manager-pr64.diff @ L1
- claim: 本次实测：env-manager#64 diff 工件行级锚（channel=api bytes=1549）
- grounded: true · collected_at: 1970-01-01T00:00:00.000Z
- reproduce_cmd: node engine/test/contracts/48-micro-a-preview.mjs --golden
- 引文原文: diff --git a/.release-please-manifest.json b/.release-please-manifest.json

### EV-48-ENVMANAGER-PR64-03 — 48-micro-a-golden-env-manager-facts.jsonl @ L66
- claim: 本次实测：env-manager#64 元数据事实落库（merged=true）
- grounded: true · collected_at: 1970-01-01T00:00:00.000Z
- reproduce_cmd: node engine/test/contracts/48-micro-a-preview.mjs --golden
- 引文原文: {"fact_seq":66,"fact_id":"556a2e89-e493-bb4b-150b-d088e3e90566","schema_version":1,"trace_id":"e7d54d368784ea3f02b9bdd9424b8ec5","baggage_id":"b48f14d63db2bca095fcb730d4d4d666","scale":"Micro-A","quadrant":"strategic","dimension":null,"collector_id":"github-rest-adapter@v1","repo_ref":"Xxx91n/env-manager","subject_ref":"Xxx91n/env-manager#64","evidence_ref":"GET /repos/Xxx91n/env-manager/pulls/64","metric":"github_rest.pr_metadata","value_json":"{\"number\":64,\"title\":\"chore(main): release 0.12.1\",\"state\":\"closed\",\"draft\":false,\"author_login\":\"github-actions[bot]\",\"author_type\":\"Bot\",\"bot_declared\":true,\"bot_basis\":\"platform-declared:user.type==Bot&&login~[bot]\",\"merged_at\":\"2026-09-14T17:14:23Z\",\"head_sha\":\"4d601a66f390146ea105c0dc12313fc716ae5afc\",\"base_sha\":\"17038beff45d132395475a050dbf454af15a7f1a\",\"html_url\":\"https://github.com/Xxx91n/env-manager/pull/64\",\"merged\":true,\"merge_commit_sha\":\"f5423020e02a0369730c360b8238a234730be85c\",\"additions\":11,\"deletions\":1,\"changed_files\":2,\"commits\":1,\"comments\":1,\"review_comments\":0,\"created_at\":\"2026-09-14T04:58:33Z\",\"closed_at\":\"2026-09-14T17:14:23Z\",\"merged_by_login\":\"Xxx91n\",\"merged_by_type\":\"User\"}","observed_at":"1970-01-01T00:00:00.000Z","ingested_at":"1970-01-01T00:00:00.000Z"}

### EV-48-ENVMANAGER-PR64-04 — docs/archive/decisions/macro-audit-ledger.md @ L54
- claim: 票面授权锚：D-049 Micro-A preview 单票铺开决策行
- grounded: true · collected_at: 1970-01-01T00:00:00.000Z
- reproduce_cmd: git -C <repo> show HEAD:docs/archive/decisions/macro-audit-ledger.md
- 引文原文: | D-049 | Q2（轮11）：Micro-A preview 铺开票（拟 #48）票面形态如何定义？（W15③；前置 #47 已凭 D-048 立案；desk-task15 判据=「≥1 条 Micro-A 真实 PR 报告产出且字段清单满足骨架交集」重绑 micro-a-preview-prep；atomcode 深调研 R11-Q2：11 查询×5 角度／6 原文核验，置信高） | 采纳（2026-09-16，原话「采纳」＝采纳修正后推荐全项） | ① #48 单票铺开=适配器消费侧管道（PR intake→facts→共享骨架 Micro-A 切片渲染）＋双仓试点实跑＋报告双件＋披露三件套，一票闭环对齐 ADR-0017 层自成完整价值单元与 #38/#39 双先例；② 票内验收序列写死：a. golden 契约驱动管道段 PASS → b. env-manager 三形态实跑 → c. jiahao 全人基线 → d. failure 件 → e. 披露三件套 → f. desk-task15 判据核验＋micro-a-preview-prep 事件闭环；③ PR 选取最小充分集=恰 4 条具体实例：env-manager×3（dependabot×1＋release-please×1＋人类×1）＋jiahao×1（全人 merged 对照），硬判据=已 merged＋diff 规模适中（非单行非巨型重写，票面写死实例不给通用公式）；④ failure 演示件=anysearch-cli 无托管面诚实拒绝（D-033 硬约束逆用：intake 阶段显式拒绝→报告落 unsupported: 无托管 PR 面＋原因＋前置条件，复刻 A-044 先例）；token 缺席降级=degraded 通道 golden cassette 占位不混测；⑤ desk-task15 验证=字段断言脚本化进 NN-check.mjs：字段清单从 ADR-0006 骨架∩Micro-A 切片机械导出（禁手抄漂移），happy 正向 ⊇ 断言＋failure 反向拒绝语义断言；golden 只锁字段骨架不锁内容值（内容级 golden 归 GA 收口）；⑥ 披露三件套=preview 标注（capability N of M 措辞对齐 D-031 先例）＋同主确认偏差（happy 件报告头部醒目位置非脚注）＋「平台声明的 Bot 身份」措辞 | 票面引用 D-047 口径不得回引 D-033 原文（原判已被 #37 实测证伪）；happy 件=真实审计产物（D-030 provenance 披露制），fixture 仅用于管道 golden 段——票面写明两通道口径防「真实报告被误标 fixture」；骨架字段与真实 PR 数据不适配时不得在 #48 内静默改骨架（走 D-025 勘误双读数，骨架改动另立决策）；机器 PR 审计结果不得被读作人类代码质量结论（反向失真红线）；票面叙事写「试点集」不得写「覆盖面」（2 仓 4 PR 是形态覆盖非统计样本）；实跑凭据走主路或 gh 回退须如实披露；#47 未落地前 #48 不并行抢工（票面显式声明前置）；冲突核查 41 current 零冲突零 revised；执行时点=整理环节立案（BACKLOG #48＋spec-phase-tasks 注记），实现落执行窗 | current（⑤款「骨架」定义以 D-132 澄清为准=字段键集＋语义不变量定点值——同源措辞注记防再争议） |

### EV-48-ENVMANAGER-PR64-05 — engine/test/fixtures/contracts/48-micro-a-criteria.md @ L15
- claim: 判据预声明锚：48-micro-a-criteria.md 判据集在案（跑后禁调）
- grounded: true · collected_at: 1970-01-01T00:00:00.000Z
- reproduce_cmd: git -C <repo> show HEAD:engine/test/fixtures/contracts/48-micro-a-criteria.md
- 引文原文: | TC-4 | 真判据（托管面资格闸） | 托管枚举 merged PR ≥1 → eligible；=0 → intake 显式拒绝（D-033 硬约束逆用） | supported | merged=0 → unsupported（拒绝成立） |

#### 引文→结论支持关系校验
- CL-48-ENVMANAGER-PR64-01 -> EV-48-ENVMANAGER-PR64-01: supports（matched=prs_listed missing=）全部支撑锚在引文原文中逐字命中（语境剥离后 presence-level 成立——非语义蕴含）
- CL-48-ENVMANAGER-PR64-02 -> EV-48-ENVMANAGER-PR64-02: supports（matched=diff --git missing=）全部支撑锚在引文原文中逐字命中（语境剥离后 presence-level 成立——非语义蕴含）
- CL-48-ENVMANAGER-PR64-03 -> EV-48-ENVMANAGER-PR64-03: supports（matched=github_rest.pr_metadata missing=）全部支撑锚在引文原文中逐字命中（语境剥离后 presence-level 成立——非语义蕴含）
- CL-48-ENVMANAGER-PR64-04 -> EV-48-ENVMANAGER-PR64-04: supports（matched=D-049 missing=）全部支撑锚在引文原文中逐字命中（语境剥离后 presence-level 成立——非语义蕴含）
- CL-48-ENVMANAGER-PR64-05 -> EV-48-ENVMANAGER-PR64-05: supports（matched=TC-4 missing=）全部支撑锚在引文原文中逐字命中（语境剥离后 presence-level 成立——非语义蕴含）

## C4 行动建议

### R-48-ENVMANAGER-PR64-1 [P1] Micro-A preview 遗留面收口：pulls.reviews/comments 自 planned 拉入（锁表 github-rest 契约面）＋diff --llm 行级语义评审归 #50 叙事双轨
- rationale: preview 判据=证据完整性/托管面资格/选择性，非 PR 质量裁决——行级评审叙事面属宿主 agent（D-053/D-058），本 preview 不含
- expected_impact: Micro-A preview → GA 漏斗的叙事面齐备 · effort: M
- verdict_gate_stamp: ADR-0013-C/v1 / supported
- evidence_refs: EV-48-ENVMANAGER-PR64-04
- degraded_note: (none)

### R-48-ENVMANAGER-PR64-2 [P2] Micro-A GA 前置：≥1 非自有公开仓真实 PR 走通用化验证（Generalization Gate；复用 URL opt-in 输入面）
- rationale: 同主确认偏差如实披露——试点仓与产品同主（Xxx91n），本报告属校准+冒烟不构成泛化证据
- expected_impact: 泛化证据链起点 · effort: S
- verdict_gate_stamp: ADR-0013-C/v1 / supported
- evidence_refs: EV-48-ENVMANAGER-PR64-04
- degraded_note: (none)


## Intake Health

- 契约：ADR-0022 违约两级处置——协议级违约 fail-fast（崩溃桶工件），字段级病态=quarantine 桶隔离（判定/处置硬分界）
- 摄入无病态声明：quarantined=0 · normalized=0（接线字段未供给 intake_health——同形骨架负声明，证据缺席≠证据为零）

