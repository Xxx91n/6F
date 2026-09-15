# MA-39-ENVMANAGER-MACRO-B-ONESHOT — Macro-B 首报（env-manager@9eb8f24be508）
> RECEIPT RCP-b1106d4112171be9 chain=b1106d4112171be9f2ef2fda319d76fc content=55a15ba0a8590250 facts=276 adjudications=6 issued_at=2026-09-15T01:58:42+08:00 commit=9eb8f24be508750f299e920d816ba9079771a3f1 tree=9e0d831f23c1
>
> 骨架 1.1.0（章顺序锁定，ADR-0006）· 裁定协议 ADR-0013-C/v1 · 生成于 2026-09-15T01:58:42+08:00
>
> 披露块（preview 标注诚实 = 决策本体，ADR-0017；机器可读字段见侧车 preview_disclosure）
> - capability: capability 1 of 5 · preview
> - calibration_scope: 同主三试点仓 one-shot（env-manager / anysearch-cli / jiahao）
> - structural_limitations: 同主仓确认偏差：三试点仓与产品同主——dogfooding = generative not evaluative（D-033），本报告属校准+冒烟，不构成泛化证据；泛化证据缺口：Macro-B GA 前置须 ≥1 非自有公开仓经 URL opt-in（#40 / D-013）；structure/behavior/supply_chain 象限 not_applicable：Macro-B 已上架采集面仅 strategy（S1+S2）；供应链象限 ⚠ 数据未接（D-034③）；one-shot 度量 = 反复接受非跑通：TC 三档裁定（supported/unsupported/insufficient）如实落数，不为跑通而跑通
> - not_in_preview: Micro-A / Micro-B / Macro-A

## C1 执行摘要

- report_id: MA-39-ENVMANAGER-MACRO-B-ONESHOT
- schema_version: 1.1.0
- scale: Macro-B
- subject_ref: env-manager@9eb8f24be508
- generated_at: 2026-09-15T01:58:42+08:00
- correlation_key: trace_id=80f38f01a5e92893d48ee8ba27ecc939 baggage_id=2b075a2c5829e4133cfa185eaea9b9e1
- overall_verdict: supported
- confidence: 0.6
- headline: env-manager Macro-B one-shot（capability 1 of 5 · preview）：496 commits / ADR 14 份 / facts 276——TC-1 NOT_RED（n=14）、TC-2 NOT_RED（mean=0.7571）、TC-3 GREEN（0.8500）→ 综合裁定 supported（反复接受非跑通：三档如实落数）。
- degraded_mode: false
- stale_data_marker: fresh（SLA 5s / 实测延迟 0s）
- read_model_version: 1.1.0 · fact_watermark_version: 1
- top_findings: EV-39-ENVMANAGER-01, EV-39-ENVMANAGER-03, EV-39-ENVMANAGER-04
- fact_ids: 276 条（清单见侧车 JSON）

## C2 四象限与裁决

### strategy（applicability=native）
- verdict: supported · score: n/a · confidence: 0.6
- dimensions: S1, S2
- slice_fields: {"s1_keyword_coverage_ratio":0.85,"s2_five_piece_mean_ratio":0.7571,"adr_count":14,"lag_judgeable_n":14,"intent_docs":3}
- conflict_markers: (none)
- verdict_gate: ADR-0013-C/v1 / supported / threshold_met=false / decided_at=2026-09-15T01:58:42+08:00 / audit_ref=reports/39-macro-b-one-shot.mjs

### structure（applicability=not_applicable）
- verdict: insufficient · score: n/a · confidence: 0
- dimensions: 
- slice_fields: {}
- conflict_markers: out-of-scope-stage1
- verdict_gate: ADR-0013-C/v1 / insufficient / threshold_met=false / decided_at=2026-09-15T01:58:42+08:00 / audit_ref=reports/39-macro-b-one-shot.mjs

### behavior（applicability=not_applicable）
- verdict: insufficient · score: n/a · confidence: 0
- dimensions: 
- slice_fields: {}
- conflict_markers: out-of-scope-stage1
- verdict_gate: ADR-0013-C/v1 / insufficient / threshold_met=false / decided_at=2026-09-15T01:58:42+08:00 / audit_ref=reports/39-macro-b-one-shot.mjs

### supply_chain（applicability=not_applicable）
- verdict: insufficient · score: n/a · confidence: 0
- dimensions: 
- slice_fields: {}
- conflict_markers: data-not-connected
- verdict_gate: ADR-0013-C/v1 / insufficient / threshold_met=false / decided_at=2026-09-15T01:58:42+08:00 / audit_ref=reports/39-macro-b-one-shot.mjs

#### 结构化裁决块（agent 可消费）
- protocol_version: ADR-0013-C/v1
- overall: supported · decided_at: 2026-09-15T01:58:42+08:00
- PC-1: supported | basis=B1 | facts=58af74bd-8636-95a9-65f0-77de171bdddf,06310fb8-28a1-430d-4f34-62df17ad41f4 | evidence=EV-39-ENVMANAGER-01 | adr-structure 与 positioning 两族均产出非空事实，golden ADR 五件套 5/5 且 supersede 链命中（env-manager run 内管线活性正对照）
- PC-2: supported | basis=B1 | facts=2fa3686e-7178-9b6c-e289-5771d866da85 | evidence=EV-39-ENVMANAGER-01 | gitlog 族检出事后补写 delta_days = 255
- TC-1: supported | basis=B2 | facts=7a4f37be-8753-60b1-f7e6-b39749b58824,414c3137-6073-652a-c533-23b81c31ae9c,3fd1fb9c-287c-7dba-5330-2ebdcc00bf31,65a7f5b2-c239-0569-2d83-7c6217db1d93,c550a14a-309e-b87a-bc03-c13b5cca3b71,025af7a6-5ef8-9a26-2bfe-8a8b1aebb331,9013a2e0-21ed-a145-d10e-1867cbe8eb8f,8c1d0846-1410-ec62-5288-a59b7276d7b4,851c1567-7817-8b3d-0c3f-9de8934c4f64,841050f2-7e64-b92b-b384-851f07fb90e0,4ced4ce9-bcf0-a917-3e44-9b91379acd9b,bd515e27-2f8f-a442-cc98-0dc156d399c7,03156ba4-ce35-e7df-ed71-f1782a14f3e2,614c7366-29ee-de23-c005-50c952e129e2 | evidence=EV-39-ENVMANAGER-02 | env-manager ADR 事后补写：可判定数 14（门槛 5），>90d 占比 0.0000，判 NOT_RED
- TC-2: supported | basis=B2 | facts=3bfad907-16bb-777c-6ba0-f7a995accf2b,cdf70c6a-5efa-42d2-52df-340a5a73f90b,b9a38962-0b8a-b397-100d-cea1dde5a74b,296942da-f5df-b8a4-0542-79e9613fbf01,63789d47-34a5-9eab-e3bb-6383d5872d25,c75e43ff-7ef2-75f4-2542-23051f7a4984,b432e43f-a123-e1c6-b03b-a0da400b7cbf,b92d7c93-9e3b-bcc7-0c4c-eb526d551854,48e12705-6725-9d77-ce1e-d7546de0860e,fbc2d909-15eb-56dd-a064-c484e2488d72,145ced00-3e57-5a46-d6e3-7190a281fad4,58356a45-7c3f-8fb4-c6fe-0ec03b0d4f08,6cb9aa9a-d2da-d06d-404a-81a57e09813e,b2706573-3d15-439b-c13b-232f94abc6d2 | evidence=EV-39-ENVMANAGER-03 | env-manager ADR 五件套：mean_ratio 0.7571（门槛 0.6），字段缺失率超线=false，判 NOT_RED
- TC-3: supported | basis=B2 | facts=51deebe1-5616-31c8-1d83-bdb8da804b2e,e7d44726-5696-b8fd-db47-6806ff61cdda,c773e106-21bf-74b9-189a-b290a1de2ffb | evidence=EV-39-ENVMANAGER-04 | env-manager 定位覆盖：意图面 3 件最低 ratio 0.8500（README.md），判 GREEN
- NC-1: supported | basis=B4 | facts=ab9d8259-a125-a34a-3211-2cc79697e001 | evidence=EV-39-ENVMANAGER-05 | 负对照选材 env-manager/package.json 五件套 0 命中、supersede 0 命中（特异性成立）
- human_adjudication: pending（裁定仍由人做，见 B5）

## C3 证据

### EV-39-ENVMANAGER-01 — D:\Aworker\6F\.scratch\architecture-recovery\reports\39-macro-b-env-manager-measurements.json @ L14
- claim: 本次实测：env-manager Macro-B one-shot 采集事实数
- grounded: true · collected_at: 2026-09-15T01:58:42+08:00
- reproduce_cmd: node .scratch/architecture-recovery/reports/39-macro-b-one-shot.mjs --repo env-manager --root D:/Aworker/env-manager
- 引文原文: "fact_count": 276,

### EV-39-ENVMANAGER-02 — D:\Aworker\6F\.scratch\architecture-recovery\reports\39-macro-b-env-manager-measurements.json @ L19
- claim: 本次实测：env-manager TC-1 ADR 事后补写判据裁定（NOT_RED）
- grounded: true · collected_at: 2026-09-15T01:58:42+08:00
- reproduce_cmd: node .scratch/architecture-recovery/reports/39-macro-b-one-shot.mjs --repo env-manager --root D:/Aworker/env-manager
- 引文原文: "verdict": "NOT_RED",

### EV-39-ENVMANAGER-03 — D:\Aworker\6F\.scratch\architecture-recovery\reports\39-macro-b-env-manager-measurements.json @ L28
- claim: 本次实测：env-manager TC-2 五件套完整度 mean_ratio
- grounded: true · collected_at: 2026-09-15T01:58:42+08:00
- reproduce_cmd: node .scratch/architecture-recovery/reports/39-macro-b-one-shot.mjs --repo env-manager --root D:/Aworker/env-manager
- 引文原文: "mean_ratio_4": "0.7571",

### EV-39-ENVMANAGER-04 — D:\Aworker\6F\.scratch\architecture-recovery\reports\39-macro-b-env-manager-measurements.json @ L73
- claim: 本次实测：env-manager TC-3 定位覆盖率最低值
- grounded: true · collected_at: 2026-09-15T01:58:42+08:00
- reproduce_cmd: node .scratch/architecture-recovery/reports/39-macro-b-one-shot.mjs --repo env-manager --root D:/Aworker/env-manager
- 引文原文: "lowest_ratio_4": "0.8500",

### EV-39-ENVMANAGER-05 — D:\Aworker\6F\.scratch\architecture-recovery\reports\39-macro-b-env-manager-measurements.json @ L84
- claim: 本次实测：env-manager NC-1 负对照选材五件套命中数（预期 0）
- grounded: true · collected_at: 2026-09-15T01:58:42+08:00
- reproduce_cmd: node .scratch/architecture-recovery/reports/39-macro-b-one-shot.mjs --repo env-manager --root D:/Aworker/env-manager
- 引文原文: "five_piece_present": 0,

### EV-39-ENVMANAGER-06 — docs/adr/0001-secret-architecture-revision.md @ L1
- claim: env-manager ADR 语料锚：docs/adr/0001-secret-architecture-revision.md 实物存在（语料 14 份）
- grounded: true · collected_at: 2026-09-15T01:58:42+08:00
- reproduce_cmd: git -C D:/Aworker/env-manager show HEAD:docs/adr/0001-secret-architecture-revision.md
- 引文原文: # 0001: Secret Architecture Revision (v0.8.0 to v1.0.0)

### EV-39-ENVMANAGER-07 — .scratch/macro-audit/decision-ledger.md @ L21
- claim: D-033②：Macro-B 已上架层对三仓各跑一次 one-shot 泛化验证；jiahao 挂持续回归
- grounded: true · collected_at: 2026-09-15T01:58:42+08:00
- reproduce_cmd: git -C D:\Aworker\6F show HEAD:.scratch/macro-audit/decision-ledger.md
- 引文原文: | D-033 | Q5（轮7）：#25-B4.2 与 jiahao / anysearch-cli / env-manager 三试点仓对接的产品方向与优先级？ | OK（2026-09-15，原话「OK」＝采纳推荐全项；基于 atomcode 取证：6 searches/7 全文核验，角色框架高置信、多仓排序法中置信=a16z design-partner 框架迁移；缺口：各仓 PR 人/机比与 supersede 链完整度未实测） | 对接方向=试点仓角色绑定能力层而非仓：① 角色分配=anysearch-cli→Macro-C 校准语料（56 ADR＋supersede 链稀缺素材）／env-manager→Micro-A 唯一合格试点＋泛化验证（唯一托管 PR 面，含 dependabot/release-please 非人类 PR 边缘形态）／jiahao→Micro-B·Macro-B 回归＋下限测试（纯本地仓测「git 健全无托管」下限）／三仓并跑→Macro-A 泛化冒烟（需≥2仓天然最后）；② 时序=Macro-B 已上架层立即对三仓各跑一次 one-shot 泛化验证，jiahao 挂 Macro-B 持续回归（阶段3 CI 票），其余层试点随各 preview 漏斗；③ 前置票=试点面可用性审计脚本（PR 人/机比、supersede 链完整度实测）；④ 拆票=可用性审计→Macro-B 三仓 one-shot→各层试点→回归接入，不立大票 | 结构性限制入规：三仓同主属确认偏差面（dogfooding=generative not evaluative，OCLint 官方口径只给信心不证泛化），试点定位=校准＋冒烟；泛化验证必须引≥1 非自有公开仓（D-013 URL opt-in 首实用户），登记为 Macro-B GA 前置条件；持续回归仅限已上架层；试点成功度量=反复接受非跑通；PR 层试点不得指派无托管 PR 面的仓（capacity 硬约束）；冲突核查 26 条 current 无 revised；执行时点=grill 定稿后整理环节；整理环节更新 #25-checklist B4.2 行=decided-now | current |

#### 引文→结论支持关系校验
- CL-39-ENVMANAGER-01 -> EV-39-ENVMANAGER-01: supports（matched=fact_count missing=）全部支撑锚在引文原文中逐字命中
- CL-39-ENVMANAGER-02 -> EV-39-ENVMANAGER-02: supports（matched=verdict missing=）全部支撑锚在引文原文中逐字命中
- CL-39-ENVMANAGER-03 -> EV-39-ENVMANAGER-03: supports（matched=mean_ratio_4 missing=）全部支撑锚在引文原文中逐字命中
- CL-39-ENVMANAGER-04 -> EV-39-ENVMANAGER-04: supports（matched=lowest_ratio_4 missing=）全部支撑锚在引文原文中逐字命中
- CL-39-ENVMANAGER-05 -> EV-39-ENVMANAGER-05: supports（matched=five_piece_present missing=）全部支撑锚在引文原文中逐字命中
- CL-39-ENVMANAGER-06 -> EV-39-ENVMANAGER-07: supports（matched=Macro-B 已上架层立即对三仓各跑一次 one-shot missing=）全部支撑锚在引文原文中逐字命中

## C4 行动建议

### R-39-ENVMANAGER-1 [P1] 引入 ≥1 非自有公开仓经 URL opt-in 跑 Macro-B（衔接 #40 / D-013）
- rationale: 三试点仓同主属 dogfooding——generative not evaluative（D-033）；one-shot 裁定只作校准+冒烟，不构成泛化证据，GA 前置须外部仓
- expected_impact: 泛化证据链闭环，Macro-B GA 准入条件达成 · effort: M
- verdict_gate_stamp: ADR-0013-C/v1 / supported
- evidence_refs: EV-39-ENVMANAGER-07
- degraded_note: (none)

### R-39-ENVMANAGER-2 [P2] jiahao 持续回归以 .github/workflows/macro-b-regression.yml 承载（schedule 定时回归 + workflow_dispatch），本仓其余两仓维持只读 one-shot
- rationale: D-033② 指派 jiahao 为 Macro-B 回归仓；接入动作 = 多写者触发器 (a) 激活点（D-034④a）
- expected_impact: 已上架层获得定时回归面；触发器 (a) 激活进值守通道 · effort: S
- verdict_gate_stamp: ADR-0013-C/v1 / supported
- evidence_refs: EV-39-ENVMANAGER-07
- degraded_note: (none)


