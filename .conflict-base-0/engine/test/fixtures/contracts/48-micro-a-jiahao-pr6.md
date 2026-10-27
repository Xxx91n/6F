# MA-48-JIAHAO-PR6-PREVIEW — Micro-A 首报（Xxx91n/jiahao#6）
> RECEIPT RCP-967747d62c8f8b50 chain=967747d62c8f8b50e7e6bcb5fd2af800 content=905196d8ac14b4ca facts=3 adjudications=6 issued_at=2026-09-16T22:42:33.409Z commit=28c253e6f215cd4e095ff55a7f63be9969f32c8d tree=150879384c3f
>
> 骨架 1.1.0（章顺序锁定，ADR-0006）· 裁定协议 ADR-0013-C/v1 · 生成于 2026-09-16T22:42:33.409Z
>
> 披露块（preview 标注诚实 = 决策本体，ADR-0017；机器可读字段见侧车 preview_disclosure）
> - capability: capability 3 of 5 · preview
> - calibration_scope: 同主试点仓 merged PR 最小集（env-manager×3 形态＋jiahao×1 全人基线；票面写死实例）
> - structural_limitations: 同主确认偏差：试点仓与产品同主（Xxx91n）——dogfooding = generative not evaluative（D-033），本报告属校准+冒烟不构成泛化证据；判据范围收窄：preview 判据=证据完整性/托管面资格/选择性，非 PR 质量裁决——diff --llm 行级语义评审归 #50 叙事双轨（D-053）；reviews/comments 面 planned 未接（锁表 github-rest 契约面）——评审语义不在 preview 内；supply_chain 象限 not_applicable：Scorecard 未接（D-034③）；dependabot PR 的供应链信号仅作事实落库
> - not_in_preview: Micro-B / Macro-A

## C1 执行摘要

- report_id: MA-48-JIAHAO-PR6-PREVIEW
- schema_version: 1.1.0
- scale: Micro-A
- subject_ref: Xxx91n/jiahao#6
- generated_at: 2026-09-16T22:42:33.409Z
- correlation_key: trace_id=ab3b212d5ce28890f273eb7730f8eff0 baggage_id=717337fe2fece3aa0928549d9493d466
- overall_verdict: supported
- confidence: 0.6
- headline: Xxx91n/jiahao#6 Micro-A preview（capability 3 of 5）：form=human diff_channel=local-git +789/-19 f=14 → supported
- degraded_mode: false
- stale_data_marker: fresh（SLA 5s / 实测延迟 0s）
- read_model_version: 1.1.0 · fact_watermark_version: 1
- top_findings: EV-48-JIAHAO-PR6-01, EV-48-JIAHAO-PR6-02, EV-48-JIAHAO-PR6-03
- fact_ids: 3 条（清单见侧车 JSON）

## C2 四象限与裁决

### behavior（applicability=native）
- verdict: supported · score: n/a · confidence: 0.6
- dimensions: 
- slice_fields: {"pr_number":6,"pr_title":"docs(adr-0064): T-6 pre-registration round","pr_state":"closed","merged":true,"merged_at":"2026-09-14T05:10:15Z","author_login":"Xxx91n","author_type":"User","bot_declared":false,"bot_basis":"platform-declared:user.type==Bot&&login~[bot]","author_form":"human","head_sha":"b7ccbebec303ea3fa5d665afa5dc03c7589401e7","base_sha":"a995bec7db56e5be5486e8775c4af6d5cb6efc9d","merge_commit_sha":"28c253e6f215cd4e095ff55a7f63be9969f32c8d","html_url":"https://github.com/Xxx91n/jiahao/pull/6","diff_channel":"local-git","diff_files_changed":14,"diff_additions":789,"diff_deletions":19,"diff_bytes":50628,"credential_strategy":"gh-token","credential_degraded":false,"api_calls":2,"rate_limit_remaining":4980}
- conflict_markers: (none)
- verdict_gate: ADR-0013-C/v1 / supported / threshold_met=true / decided_at=2026-09-16T22:42:33.409Z / audit_ref=reports/48-micro-a-preview.mjs

### structure（applicability=not_applicable）
- verdict: insufficient · score: n/a · confidence: 0
- dimensions: 
- slice_fields: {}
- conflict_markers: out-of-scope-micro-a
- verdict_gate: ADR-0013-C/v1 / insufficient / threshold_met=false / decided_at=2026-09-16T22:42:33.409Z / audit_ref=reports/48-micro-a-preview.mjs

### supply_chain（applicability=not_applicable）
- verdict: insufficient · score: n/a · confidence: 0
- dimensions: 
- slice_fields: {}
- conflict_markers: data-not-connected
- verdict_gate: ADR-0013-C/v1 / insufficient / threshold_met=false / decided_at=2026-09-16T22:42:33.409Z / audit_ref=reports/48-micro-a-preview.mjs

### strategy（applicability=not_applicable）
- verdict: insufficient · score: n/a · confidence: 0
- dimensions: 
- slice_fields: {}
- conflict_markers: out-of-scope-micro-a
- verdict_gate: ADR-0013-C/v1 / insufficient / threshold_met=false / decided_at=2026-09-16T22:42:33.409Z / audit_ref=reports/48-micro-a-preview.mjs

#### 结构化裁决块（agent 可消费）
- protocol_version: ADR-0013-C/v1
- overall: supported · decided_at: 2026-09-16T22:42:33.409Z
- PC-1: supported | basis=B1 | facts=d3d78bec-72b7-1f67-f700-c11fa704ee3f | evidence=EV-48-JIAHAO-PR6-01 | 适配器 run 事实在案：prs_listed=7 calls=2 strategy=gh-token（枚举真实发生）
- TC-1: supported | basis=B2 | facts=387a7a00-2188-6964-984d-6db4a4259d3c,8fc17915-e1a6-ec75-8e84-142f2a50fca2,9bd9eaab-e7da-fe95-8afb-82e0cbf38de1 | evidence=EV-48-JIAHAO-PR6-03 | PR 证据三联齐备（summary＋metadata＋diff）且 merged=true
- TC-2: supported | basis=B2 | facts=9bd9eaab-e7da-fe95-8afb-82e0cbf38de1 | evidence=EV-48-JIAHAO-PR6-02 | diff channel=local-git files=14 +789/-19 bytes=50628
- TC-3: supported | basis=B2 | facts=387a7a00-2188-6964-984d-6db4a4259d3c | evidence=EV-48-JIAHAO-PR6-03 | 作者形态披露齐备：bot_declared=false basis=platform-declared:user.type==Bot&&login~[bot]
- TC-4: supported | basis=B2 | facts=(none) | evidence=EV-48-JIAHAO-PR6-01 | 托管面资格闸：jiahao 托管枚举 merged PR=7（≥1 即 eligible；D-033 硬约束逆用判据）
- NC-1: supported | basis=B4 | facts=387a7a00-2188-6964-984d-6db4a4259d3c | evidence=EV-48-JIAHAO-PR6-03 | 负对照：入选实例 human 票面写死；实测 form=human merged=true（closed-unmerged 不入集、形态错配即判负）
- human_adjudication: pending（裁定仍由人做，见 B5）

## C3 证据

### EV-48-JIAHAO-PR6-01 — 48-micro-a-jiahao-measurements.json @ L9
- claim: 本次实测：jiahao 托管枚举真实发生（prs_listed=7 merged=7）
- grounded: true · collected_at: 2026-09-16T22:42:33.409Z
- reproduce_cmd: node .scratch/architecture-recovery/reports/48-micro-a-preview.mjs --repo jiahao
- 引文原文: "prs_listed": 7,

### EV-48-JIAHAO-PR6-02 — 48-micro-a-jiahao-pr6.diff @ L1
- claim: 本次实测：jiahao#6 diff 工件行级锚（channel=local-git bytes=50628）
- grounded: true · collected_at: 2026-09-16T22:42:33.409Z
- reproduce_cmd: node .scratch/architecture-recovery/reports/48-micro-a-preview.mjs --repo jiahao
- 引文原文: diff --git a/.githooks/post-checkout b/.githooks/post-checkout

### EV-48-JIAHAO-PR6-03 — 48-micro-a-jiahao-facts.jsonl @ L11
- claim: 本次实测：jiahao#6 元数据事实落库（merged=true）
- grounded: true · collected_at: 2026-09-16T22:42:33.409Z
- reproduce_cmd: node .scratch/architecture-recovery/reports/48-micro-a-preview.mjs --repo jiahao
- 引文原文: {"fact_seq":11,"fact_id":"8fc17915-e1a6-ec75-8e84-142f2a50fca2","schema_version":1,"trace_id":"ab3b212d5ce28890f273eb7730f8eff0","baggage_id":"717337fe2fece3aa0928549d9493d466","scale":"Micro-A","quadrant":"strategic","dimension":null,"collector_id":"github-rest-adapter@v1","repo_ref":"Xxx91n/jiahao","subject_ref":"Xxx91n/jiahao#6","evidence_ref":"GET /repos/Xxx91n/jiahao/pulls/6","metric":"github_rest.pr_metadata","value_json":"{\"number\":6,\"title\":\"docs(adr-0064): T-6 pre-registration round\",\"state\":\"closed\",\"draft\":false,\"author_login\":\"Xxx91n\",\"author_type\":\"User\",\"bot_declared\":false,\"bot_basis\":\"platform-declared:user.type==Bot&&login~[bot]\",\"merged_at\":\"2026-09-14T05:10:15Z\",\"head_sha\":\"b7ccbebec303ea3fa5d665afa5dc03c7589401e7\",\"base_sha\":\"a995bec7db56e5be5486e8775c4af6d5cb6efc9d\",\"html_url\":\"https://github.com/Xxx91n/jiahao/pull/6\",\"merged\":true,\"merge_commit_sha\":\"28c253e6f215cd4e095ff55a7f63be9969f32c8d\",\"additions\":789,\"deletions\":19,\"changed_files\":14,\"commits\":1,\"comments\":0,\"review_comments\":0,\"created_at\":\"2026-09-14T05:06:24Z\",\"closed_at\":\"2026-09-14T05:10:15Z\",\"merged_by_login\":\"Xxx91n\",\"merged_by_type\":\"User\"}","observed_at":"2026-09-16T22:42:33.409Z","ingested_at":"2026-09-16T22:42:33.409Z"}

### EV-48-JIAHAO-PR6-04 — .scratch/macro-audit/decision-ledger.md @ L30
- claim: 票面授权锚：D-049 Micro-A preview 单票铺开决策行
- grounded: true · collected_at: 2026-09-16T22:42:33.409Z
- reproduce_cmd: git -C D:\Aworker\6F show HEAD:.scratch/macro-audit/decision-ledger.md
- 引文原文: - 增量去向：D-048→BACKLOG #47＋spec-phase-tasks R8-01＋upstream-lock github-rest planned 行（kind 词表扩 remote-api）＋README §3 行＋versioning 种子行＋ADR-0020；D-049→BACKLOG #48＋R8-02；D-050→BACKLOG #49＋R8-03（#46 行选定补记于 #49 行内）；D-051→BACKLOG #41b 行＋engine/LICENSE 换文＋manifest/package/marketplace license 字段＋ADR-0021＋checklist §B 勾销；D-052→manifest.meta.json（单源）→双 manifest 重生成（GEN-OK）＋.claude-plugin/marketplace.json 新建＋description.md/checklist 同步＋CONTEXT 双词

### EV-48-JIAHAO-PR6-05 — .scratch/architecture-recovery/reports/48-micro-a-criteria.md @ L15
- claim: 判据预声明锚：48-micro-a-criteria.md 判据集在案（跑后禁调）
- grounded: true · collected_at: 2026-09-16T22:42:33.409Z
- reproduce_cmd: git -C D:\Aworker\6F show HEAD:.scratch/architecture-recovery/reports/48-micro-a-criteria.md
- 引文原文: | TC-4 | 真判据（托管面资格闸） | 托管枚举 merged PR ≥1 → eligible；=0 → intake 显式拒绝（D-033 硬约束逆用） | supported | merged=0 → unsupported（拒绝成立） |

#### 引文→结论支持关系校验
- CL-48-JIAHAO-PR6-01 -> EV-48-JIAHAO-PR6-01: supports（matched=prs_listed missing=）全部支撑锚在引文原文中逐字命中
- CL-48-JIAHAO-PR6-02 -> EV-48-JIAHAO-PR6-02: supports（matched=diff --git missing=）全部支撑锚在引文原文中逐字命中
- CL-48-JIAHAO-PR6-03 -> EV-48-JIAHAO-PR6-03: supports（matched=github_rest.pr_metadata missing=）全部支撑锚在引文原文中逐字命中
- CL-48-JIAHAO-PR6-04 -> EV-48-JIAHAO-PR6-04: supports（matched=D-049 missing=）全部支撑锚在引文原文中逐字命中
- CL-48-JIAHAO-PR6-05 -> EV-48-JIAHAO-PR6-05: supports（matched=TC-4 missing=）全部支撑锚在引文原文中逐字命中

## C4 行动建议

### R-48-JIAHAO-PR6-1 [P1] Micro-A preview 遗留面收口：pulls.reviews/comments 自 planned 拉入（锁表 github-rest 契约面）＋diff --llm 行级语义评审归 #50 叙事双轨
- rationale: preview 判据=证据完整性/托管面资格/选择性，非 PR 质量裁决——行级评审叙事面属宿主 agent（D-053/D-058），本 preview 不含
- expected_impact: Micro-A preview → GA 漏斗的叙事面齐备 · effort: M
- verdict_gate_stamp: ADR-0013-C/v1 / supported
- evidence_refs: EV-48-JIAHAO-PR6-04
- degraded_note: (none)

### R-48-JIAHAO-PR6-2 [P2] Micro-A GA 前置：≥1 非自有公开仓真实 PR 走通用化验证（Generalization Gate；复用 URL opt-in 输入面）
- rationale: 同主确认偏差如实披露——试点仓与产品同主（Xxx91n），本报告属校准+冒烟不构成泛化证据
- expected_impact: 泛化证据链起点 · effort: S
- verdict_gate_stamp: ADR-0013-C/v1 / supported
- evidence_refs: EV-48-JIAHAO-PR6-04
- degraded_note: (none)


