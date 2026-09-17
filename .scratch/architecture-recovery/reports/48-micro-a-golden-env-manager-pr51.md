# MA-48-ENVMANAGER-PR51-PREVIEW — Micro-A 首报（Xxx91n/env-manager#51）
> RECEIPT RCP-6830e89b72cfc15c chain=6830e89b72cfc15cdc33fbae93756d28 content=00b29b035892c5a7 facts=2 adjudications=6 issued_at=2026-09-17T11:19:44.308Z commit=92764cb14e7178cb2fa39232208c9fd86a899705 tree=unanchored
>
> 骨架 1.1.0（章顺序锁定，ADR-0006）· 裁定协议 ADR-0013-C/v1 · 生成于 2026-09-17T11:19:44.308Z
>
> 披露块（preview 标注诚实 = 决策本体，ADR-0017；机器可读字段见侧车 preview_disclosure）
> - capability: capability 3 of 5 · preview
> - calibration_scope: 同主试点仓 merged PR 最小集（env-manager×3 形态＋jiahao×1 全人基线；票面写死实例）
> - structural_limitations: golden 回放：响应来自 cassette 录制非实时 API——本件为管道 golden 产物非真实审计；同主确认偏差：试点仓与产品同主（Xxx91n）——dogfooding = generative not evaluative（D-033），本报告属校准+冒烟不构成泛化证据；判据范围收窄：preview 判据=证据完整性/托管面资格/选择性，非 PR 质量裁决——diff --llm 行级语义评审归 #50 叙事双轨（D-053）；reviews/comments 面 planned 未接（锁表 github-rest 契约面）——评审语义不在 preview 内；supply_chain 象限 not_applicable：Scorecard 未接（D-034③）；dependabot PR 的供应链信号仅作事实落库
> - not_in_preview: Micro-B / Macro-A

## C1 执行摘要

- report_id: MA-48-ENVMANAGER-PR51-PREVIEW
- schema_version: 1.1.0
- scale: Micro-A
- subject_ref: Xxx91n/env-manager#51
- generated_at: 2026-09-17T11:19:44.308Z
- correlation_key: trace_id=54dbe1b6b62fdbfbff3510d2873ba55c baggage_id=b48f14d63db2bca095fcb730d4d4d666
- overall_verdict: insufficient
- confidence: 0.6
- headline: Xxx91n/env-manager#51 Micro-A preview（capability 3 of 5）：form=human diff_channel=absent +n/a/-n/a f=n/a → insufficient
- degraded_mode: false
- stale_data_marker: fresh（SLA 5s / 实测延迟 0s）
- read_model_version: 1.1.0 · fact_watermark_version: 1
- top_findings: EV-48-ENVMANAGER-PR51-01, EV-48-ENVMANAGER-PR51-02, EV-48-ENVMANAGER-PR51-03
- fact_ids: 2 条（清单见侧车 JSON）

## C2 四象限与裁决

### behavior（applicability=native）
- verdict: insufficient · score: n/a · confidence: 0.6
- dimensions: 
- slice_fields: {"pr_number":51,"pr_title":"fix(release): add workflow_dispatch trigger to release-please for manual re-runs (ticket 30 drill finding)","pr_state":"closed","merged":true,"merged_at":"2026-09-06T03:20:26Z","author_login":"Xxx91n","author_type":"User","bot_declared":false,"bot_basis":"platform-declared:user.type==Bot&&login~[bot]","author_form":"human","head_sha":"b0641b787a3823cba03030847d9d31e30483ece0","base_sha":"a8f2dd2a4c0dfab43ff40baf92a545f6610aede3","merge_commit_sha":"92764cb14e7178cb2fa39232208c9fd86a899705","html_url":"https://github.com/Xxx91n/env-manager/pull/51","diff_channel":null,"diff_files_changed":null,"diff_additions":null,"diff_deletions":null,"diff_bytes":null,"credential_strategy":"env-token","credential_degraded":false,"api_calls":4,"rate_limit_remaining":4990}
- conflict_markers: (none)
- verdict_gate: ADR-0013-C/v1 / insufficient / evidence_flag=false / decided_at=2026-09-17T11:19:44.308Z / audit_ref=reports/48-micro-a-preview.mjs

### structure（applicability=not_applicable）
- verdict: insufficient · score: n/a · confidence: 0
- dimensions: 
- slice_fields: {}
- conflict_markers: out-of-scope-micro-a
- verdict_gate: ADR-0013-C/v1 / insufficient / evidence_flag=false / decided_at=2026-09-17T11:19:44.308Z / audit_ref=reports/48-micro-a-preview.mjs

### supply_chain（applicability=not_applicable）
- verdict: insufficient · score: n/a · confidence: 0
- dimensions: 
- slice_fields: {}
- conflict_markers: data-not-connected
- verdict_gate: ADR-0013-C/v1 / insufficient / evidence_flag=false / decided_at=2026-09-17T11:19:44.308Z / audit_ref=reports/48-micro-a-preview.mjs

### strategy（applicability=not_applicable）
- verdict: insufficient · score: n/a · confidence: 0
- dimensions: 
- slice_fields: {}
- conflict_markers: out-of-scope-micro-a
- verdict_gate: ADR-0013-C/v1 / insufficient / evidence_flag=false / decided_at=2026-09-17T11:19:44.308Z / audit_ref=reports/48-micro-a-preview.mjs

#### 结构化裁决块（agent 可消费）
- protocol_version: ADR-0013-C/v1
- overall: insufficient · decided_at: 2026-09-17T11:19:44.308Z
- PC-1: supported | basis=B1 | facts=64468f18-f84f-d324-8116-91c84160ad2c | evidence=EV-48-ENVMANAGER-PR51-01 | 适配器 run 事实在案：prs_listed=62 calls=4 strategy=env-token（枚举真实发生）
- TC-1: insufficient | basis=B2 | facts=d5e021ec-9779-2aa1-89a0-547231a99a82,5de264d5-9a0f-e15d-d491-789f120ccfbc | evidence=EV-48-ENVMANAGER-PR51-03 | 证据三联缺腿：summary=1 metadata=1 diff=0 merged=true
- TC-2: insufficient | basis=B2 | facts=(none) | evidence=EV-48-ENVMANAGER-PR51-02 | diff 事实缺席
- TC-3: supported | basis=B2 | facts=d5e021ec-9779-2aa1-89a0-547231a99a82 | evidence=EV-48-ENVMANAGER-PR51-03 | 作者形态披露齐备：bot_declared=false basis=platform-declared:user.type==Bot&&login~[bot]
- TC-4: supported | basis=B2 | facts=(none) | evidence=EV-48-ENVMANAGER-PR51-01 | 托管面资格闸：env-manager 托管枚举 merged PR=17（≥1 即 eligible；D-033 硬约束逆用判据）
- NC-1: supported | basis=B4 | facts=d5e021ec-9779-2aa1-89a0-547231a99a82 | evidence=EV-48-ENVMANAGER-PR51-03 | 负对照：入选实例 human 票面写死；实测 form=human merged=true（closed-unmerged 不入集、形态错配即判负）
- human_adjudication: pending（裁定仍由人做，见 B5）

## C3 证据

### EV-48-ENVMANAGER-PR51-01 — 48-micro-a-golden-env-manager-measurements.json @ L9
- claim: 本次实测：env-manager 托管枚举真实发生（prs_listed=62 merged=17）
- grounded: true · collected_at: 2026-09-17T11:19:44.308Z
- reproduce_cmd: node .scratch/architecture-recovery/reports/48-micro-a-preview.mjs --golden
- 引文原文: "prs_listed": 62,

### EV-48-ENVMANAGER-PR51-02 — 48-micro-a-golden-env-manager-pr51.diff @ L0
- claim: env-manager#51 diff 工件
- grounded: false · collected_at: 2026-09-17T11:19:44.308Z
- reproduce_cmd: node .scratch/architecture-recovery/reports/48-micro-a-preview.mjs --golden
- 引文原文: （缺失 —— ⚠ unverified）

### EV-48-ENVMANAGER-PR51-03 — 48-micro-a-golden-env-manager-facts.jsonl @ L68
- claim: 本次实测：env-manager#51 元数据事实落库（merged=true）
- grounded: true · collected_at: 2026-09-17T11:19:44.308Z
- reproduce_cmd: node .scratch/architecture-recovery/reports/48-micro-a-preview.mjs --golden
- 引文原文: {"fact_seq":68,"fact_id":"5de264d5-9a0f-e15d-d491-789f120ccfbc","schema_version":1,"trace_id":"54dbe1b6b62fdbfbff3510d2873ba55c","baggage_id":"b48f14d63db2bca095fcb730d4d4d666","scale":"Micro-A","quadrant":"strategic","dimension":null,"collector_id":"github-rest-adapter@v1","repo_ref":"Xxx91n/env-manager","subject_ref":"Xxx91n/env-manager#51","evidence_ref":"GET /repos/Xxx91n/env-manager/pulls/51","metric":"github_rest.pr_metadata","value_json":"{\"number\":51,\"title\":\"fix(release): add workflow_dispatch trigger to release-please for manual re-runs (ticket 30 drill finding)\",\"state\":\"closed\",\"draft\":false,\"author_login\":\"Xxx91n\",\"author_type\":\"User\",\"bot_declared\":false,\"bot_basis\":\"platform-declared:user.type==Bot&&login~[bot]\",\"merged_at\":\"2026-09-06T03:20:26Z\",\"head_sha\":\"b0641b787a3823cba03030847d9d31e30483ece0\",\"base_sha\":\"a8f2dd2a4c0dfab43ff40baf92a545f6610aede3\",\"html_url\":\"https://github.com/Xxx91n/env-manager/pull/51\",\"merged\":true,\"merge_commit_sha\":\"92764cb14e7178cb2fa39232208c9fd86a899705\",\"additions\":3,\"deletions\":0,\"changed_files\":1,\"commits\":1,\"comments\":0,\"review_comments\":0,\"created_at\":\"2026-09-06T03:08:09Z\",\"closed_at\":\"2026-09-06T03:20:27Z\",\"merged_by_login\":\"Xxx91n\",\"merged_by_type\":\"User\"}","observed_at":"2026-09-17T11:19:44.308Z","ingested_at":"2026-09-17T11:19:44.308Z"}

### EV-48-ENVMANAGER-PR51-04 — .scratch/macro-audit/decision-ledger.md @ L40
- claim: 票面授权锚：D-049 Micro-A preview 单票铺开决策行
- grounded: true · collected_at: 2026-09-17T11:19:44.308Z
- reproduce_cmd: git -C D:\Aworker\6F show HEAD:.scratch/macro-audit/decision-ledger.md
- 引文原文: - 增量去向：D-048→BACKLOG #47＋spec-phase-tasks R8-01＋upstream-lock github-rest planned 行（kind 词表扩 remote-api）＋README §3 行＋versioning 种子行＋ADR-0020；D-049→BACKLOG #48＋R8-02；D-050→BACKLOG #49＋R8-03（#46 行选定补记于 #49 行内）；D-051→BACKLOG #41b 行＋engine/LICENSE 换文＋manifest/package/marketplace license 字段＋ADR-0021＋checklist §B 勾销；D-052→manifest.meta.json（单源）→双 manifest 重生成（GEN-OK）＋.claude-plugin/marketplace.json 新建＋description.md/checklist 同步＋CONTEXT 双词

### EV-48-ENVMANAGER-PR51-05 — .scratch/architecture-recovery/reports/48-micro-a-criteria.md @ L15
- claim: 判据预声明锚：48-micro-a-criteria.md 判据集在案（跑后禁调）
- grounded: true · collected_at: 2026-09-17T11:19:44.308Z
- reproduce_cmd: git -C D:\Aworker\6F show HEAD:.scratch/architecture-recovery/reports/48-micro-a-criteria.md
- 引文原文: | TC-4 | 真判据（托管面资格闸） | 托管枚举 merged PR ≥1 → eligible；=0 → intake 显式拒绝（D-033 硬约束逆用） | supported | merged=0 → unsupported（拒绝成立） |

#### 引文→结论支持关系校验
- CL-48-ENVMANAGER-PR51-01 -> EV-48-ENVMANAGER-PR51-01: supports（matched=prs_listed missing=）全部支撑锚在引文原文中逐字命中
- CL-48-ENVMANAGER-PR51-02 -> EV-48-ENVMANAGER-PR51-02: insufficient（matched= missing=diff --git）引文未落地（grounded=false 或 excerpt 为空）——有引文不等于支撑结论
- CL-48-ENVMANAGER-PR51-03 -> EV-48-ENVMANAGER-PR51-03: supports（matched=github_rest.pr_metadata missing=）全部支撑锚在引文原文中逐字命中
- CL-48-ENVMANAGER-PR51-04 -> EV-48-ENVMANAGER-PR51-04: supports（matched=D-049 missing=）全部支撑锚在引文原文中逐字命中
- CL-48-ENVMANAGER-PR51-05 -> EV-48-ENVMANAGER-PR51-05: supports（matched=TC-4 missing=）全部支撑锚在引文原文中逐字命中

## C4 行动建议

### R-48-ENVMANAGER-PR51-1 [P1] Micro-A preview 遗留面收口：pulls.reviews/comments 自 planned 拉入（锁表 github-rest 契约面）＋diff --llm 行级语义评审归 #50 叙事双轨
- rationale: preview 判据=证据完整性/托管面资格/选择性，非 PR 质量裁决——行级评审叙事面属宿主 agent（D-053/D-058），本 preview 不含
- expected_impact: Micro-A preview → GA 漏斗的叙事面齐备 · effort: M
- verdict_gate_stamp: ADR-0013-C/v1 / insufficient
- evidence_refs: EV-48-ENVMANAGER-PR51-04
- degraded_note: (none)

### R-48-ENVMANAGER-PR51-2 [P2] Micro-A GA 前置：≥1 非自有公开仓真实 PR 走通用化验证（Generalization Gate；复用 URL opt-in 输入面）
- rationale: 同主确认偏差如实披露——试点仓与产品同主（Xxx91n），本报告属校准+冒烟不构成泛化证据
- expected_impact: 泛化证据链起点 · effort: S
- verdict_gate_stamp: ADR-0013-C/v1 / insufficient
- evidence_refs: EV-48-ENVMANAGER-PR51-04
- degraded_note: (none)


