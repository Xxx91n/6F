# MA-39-JIAHAO-MACRO-B-ONESHOT — Macro-B 首报（jiahao@8a8422e95226）
> RECEIPT RCP-a435e3bf5b9d6b46 chain=a435e3bf5b9d6b46de2408501e535ce7 content=85bb9d4070b8e4a1 facts=1101 adjudications=6 issued_at=2026-09-16T14:39:52+08:00 commit=8a8422e952269b474220e68ae30ee11e6fc11e15 tree=04fe15bf4867
>
> 骨架 1.1.0（章顺序锁定，ADR-0006）· 裁定协议 ADR-0013-C/v1 · 生成于 2026-09-16T14:39:52+08:00
>
> 披露块（preview 标注诚实 = 决策本体，ADR-0017；机器可读字段见侧车 preview_disclosure）
> - capability: capability 1 of 5 · preview
> - calibration_scope: 同主三试点仓 one-shot（env-manager / anysearch-cli / jiahao）
> - structural_limitations: 同主仓确认偏差：三试点仓与产品同主——dogfooding = generative not evaluative（D-033），本报告属校准+冒烟，不构成泛化证据；泛化证据缺口：Macro-B GA 前置须 ≥1 非自有公开仓经 URL opt-in（#40 / D-013）；structure/behavior/supply_chain 象限 not_applicable：Macro-B 已上架采集面仅 strategy（S1+S2）；供应链象限 ⚠ 数据未接（D-034③）；one-shot 度量 = 反复接受非跑通：TC 三档裁定（supported/unsupported/insufficient）如实落数，不为跑通而跑通
> - not_in_preview: Micro-A / Micro-B / Macro-A

## C1 执行摘要

- report_id: MA-39-JIAHAO-MACRO-B-ONESHOT
- schema_version: 1.1.0
- scale: Macro-B
- subject_ref: jiahao@8a8422e95226
- generated_at: 2026-09-16T14:39:52+08:00
- correlation_key: trace_id=1348337dd5f597ba4317df93552d56a0 baggage_id=a035796bd3e3b5a381eea6fd6f5580ef
- overall_verdict: supported
- confidence: 0.6
- headline: jiahao Macro-B one-shot（capability 1 of 5 · preview）：265 commits / ADR 69 份 / facts 1101——TC-1 NOT_RED（n=69）、TC-2 NOT_RED（mean=0.9449）、TC-3 GREEN（0.8500）→ 综合裁定 supported（反复接受非跑通：三档如实落数）。
- degraded_mode: false
- stale_data_marker: fresh（SLA 5s / 实测延迟 0s）
- read_model_version: 1.1.0 · fact_watermark_version: 1
- top_findings: EV-39-JIAHAO-01, EV-39-JIAHAO-03, EV-39-JIAHAO-04
- fact_ids: 1101 条（清单见侧车 JSON）

## C2 四象限与裁决

### strategy（applicability=native）
- verdict: supported · score: n/a · confidence: 0.6
- dimensions: S1, S2
- slice_fields: {"s1_keyword_coverage_ratio":0.85,"s2_five_piece_mean_ratio":0.9449,"adr_count":69,"lag_judgeable_n":69,"intent_docs":3}
- conflict_markers: (none)
- verdict_gate: ADR-0013-C/v1 / supported / threshold_met=false / decided_at=2026-09-16T14:39:52+08:00 / audit_ref=reports/39-macro-b-one-shot.mjs

### structure（applicability=not_applicable）
- verdict: insufficient · score: n/a · confidence: 0
- dimensions: 
- slice_fields: {}
- conflict_markers: out-of-scope-stage1
- verdict_gate: ADR-0013-C/v1 / insufficient / threshold_met=false / decided_at=2026-09-16T14:39:52+08:00 / audit_ref=reports/39-macro-b-one-shot.mjs

### behavior（applicability=not_applicable）
- verdict: insufficient · score: n/a · confidence: 0
- dimensions: 
- slice_fields: {}
- conflict_markers: out-of-scope-stage1
- verdict_gate: ADR-0013-C/v1 / insufficient / threshold_met=false / decided_at=2026-09-16T14:39:52+08:00 / audit_ref=reports/39-macro-b-one-shot.mjs

### supply_chain（applicability=not_applicable）
- verdict: insufficient · score: n/a · confidence: 0
- dimensions: 
- slice_fields: {}
- conflict_markers: data-not-connected
- verdict_gate: ADR-0013-C/v1 / insufficient / threshold_met=false / decided_at=2026-09-16T14:39:52+08:00 / audit_ref=reports/39-macro-b-one-shot.mjs

#### 结构化裁决块（agent 可消费）
- protocol_version: ADR-0013-C/v1
- overall: supported · decided_at: 2026-09-16T14:39:52+08:00
- PC-1: supported | basis=B1 | facts=0689733a-f846-4a18-bbd3-122b7604e273,15f6ce93-ddec-3911-000f-cf14c804dff4 | evidence=EV-39-JIAHAO-01 | adr-structure 与 positioning 两族均产出非空事实，golden ADR 五件套 5/5 且 supersede 链命中（jiahao run 内管线活性正对照）
- PC-2: supported | basis=B1 | facts=08275012-e294-474c-8640-3576a5dff50e | evidence=EV-39-JIAHAO-01 | gitlog 族检出事后补写 delta_days = 255
- TC-1: supported | basis=B2 | facts=5dda5a48-eaa8-35cd-d681-0149e7246693,5c4f486b-7d72-4ab1-cc92-09ad136109f9,c9b112e3-d4ca-4257-3be4-814fa388811e,58fba2de-fec0-9b2a-2f9f-8956ce81b0cf,e6eb6b89-2355-c925-00f0-442e07e4db94,80829f5e-00e9-f1d5-1110-431e05e992f0,68ad6085-8e81-681a-17f9-d94a16ce7857,3e9e8064-c0ab-04d6-d2d6-948976ce77b4,de0c1b88-27ba-1cce-cb63-132142acac41,03431f09-e302-16a5-9a60-4e2687af6911,bae1037d-8d5a-87ea-d918-d5dd58e6b9ff,e0812058-2077-b631-6859-e20fdb6db012,d83de6b5-ad28-a5d8-7f03-5d8241c2a4da,ed9fb500-8f2b-4ee8-ae2c-ccf4d000350d,46b3ad09-4560-0c6c-d85c-45d8641cd03d,670fb564-445e-9473-72fb-aaef1f8dbbc2,3c8d70f3-13cc-3e21-20f9-c9343b5bc220,2a4abf66-9ba3-50c6-ea26-cc55afd7db86,bf4e75c2-73e2-8c08-d207-15a63fff4be8,47e22aeb-c0ab-dc4c-f184-8fb1aa0e97a6,b2722bcb-b700-0b40-963c-a297b326426a,6a3bb001-c1b0-2da6-a566-c622d17daabb,5b7c9264-2466-b95d-80ab-f1bc20a259e0,569930d6-c72d-1cbf-c26f-c7a465cfe40d,e6bd6f7a-0829-985f-4d0a-22a9e9b8a85b,a1c96c28-b91e-54ba-af2d-30500e362a76,37c0cc37-2960-3799-4302-475f014f2b1c,a41cdb9e-0843-60af-0e07-47f1366b3be5,5664b8da-8ce5-6f09-8bc3-032e777386d1,19e14a3f-59fe-ca2c-ef70-7562575ab8f0,150b063b-7e42-ae77-5103-7b6bb6e21457,3fae2267-0196-b460-80d8-8b0fc09f5e14,8a14a94d-8f48-e1c0-3e3e-c99d95ae2009,07211d3f-5a50-c3e4-e17a-7032553408d6,6f5f5dbd-fb64-2f39-5ddf-13fa1054d467,17bd66fd-7042-d19b-bd3e-124b35a817fa,380316bd-a2fc-21f1-31de-39dd598868d4,0f234403-cb8f-81f4-b8a7-4cd147556c1f,9c379aef-a33e-9d1c-ef05-3366bb6683e8,8fae309b-35ab-9528-b61a-a0458b8a6f98,aef4a13e-517c-7ad7-5979-19382f007c0b,dde786d4-a9a9-903a-350f-ac9acc15f8a1,40b05610-b984-d6ba-d45a-d845a9a94c24,ae5bd492-955e-4adb-8c83-441eb629bfc3,00cd3ff1-1e1e-a85b-6fc2-a3b2ae4e3f09,f7e0ee92-ceab-48e1-b83b-2dd2daf62556,8155da36-cb58-3286-3a01-857071b8b198,478782c6-ed43-d918-bb27-ddb76d209465,29d054ba-a4e6-12c1-2673-fe4ddb31780a,811c3811-c5ab-01b5-1941-459c06474377,491bf946-4c54-5970-a545-767fd2ee346e,4dc6cd1f-0c3f-5a4f-5415-868cc93d0bef,d6e546e4-677d-b4e8-b04b-399516f4b20f,c07e16c6-b509-e76f-cbae-f01ec222e31b,f63c5e65-2f60-8b69-82dd-7599700e73b3,6e8cc9ff-c308-2119-9d22-0af05980f38c,0d5c3c9e-e200-2143-71bc-f18edb0efb08,11ec8346-1c27-ed09-6bb6-954e1e8ddcde,39e337cd-6660-cd54-3514-cdb1dcca0d54,c5183fc6-d83b-16ad-b7e5-b45a0acff90e,32fd58f1-7a48-8339-d531-217db0c56382,b2089b4b-6351-4b61-677e-bba94c076d80,795c8941-e992-5485-f743-cecbed617e23,d2eaae53-7e58-a3e3-d503-ebe3ff5403ea,602b7a03-fc2b-4bd6-9720-68f9ce47d6ce,2f4cdea2-3c03-7ae0-e103-30bee79a483b,73f14543-2100-8a94-10a8-2fed220a4d7e,962a94b2-27f0-5835-fdfd-830924206e0c,30103181-6f32-4c70-2527-36e6ea166758 | evidence=EV-39-JIAHAO-02 | jiahao ADR 事后补写：可判定数 69（门槛 5），>90d 占比 0.0145，判 NOT_RED
- TC-2: supported | basis=B2 | facts=69960186-6490-3894-3e06-ff4587d926d8,e2944054-1406-b113-cb97-23d6f3b131d1,1964e460-e21c-f5e9-4184-26f8be7a061e,775a465e-101f-d108-4d4a-eefc35fb5ea2,78b600cc-19e8-871d-7049-131997ec6582,7f1797a4-c22f-fd2d-8196-1d0714804d39,8c40f703-8c76-a918-21f1-f97d3d978afc,daea38c4-837f-5a5a-dad6-2f625beebece,72e51d3d-8d10-654d-1fac-dc717e6e0b8c,0fae910d-df8a-accb-4cf9-b5c9509bcafd,59caf658-cfbd-a0c2-2d0e-fae6c35be121,ca2ab2c8-ae6d-99f2-a885-a51f32e7ca1d,eaed85f2-80a1-b533-34ca-f66725065fc7,69689106-db87-ae2d-efe1-b53678c886cb,0e99ac13-81ad-d8c7-bd3e-bc8aadc84134,c690e8e2-49f7-5f43-4745-9191391882b6,5f881006-1a9d-e8d9-e971-e2349d8e4282,8b351f4e-23b2-77a7-e096-62d60283e197,834f7940-db8b-3374-d597-78f03cf68457,928895fc-254c-2d1b-8f8f-a47f31a33d15,f7c9c2e0-4789-7b7b-209e-667f64ffaac2,0edfb0af-9481-b85d-a916-16bf03d839f6,d35bb37f-d163-37e6-5777-feea1a4264c2,5d5f3949-1f68-c1d7-92e0-3e5ce4006da9,072d4645-956a-6aad-9be8-bbd9c8738690,e8ac2d5d-58c5-5d80-b7f8-6dc0022610c1,4a8ef49a-ebd2-4b27-eaf1-7de6ffb9d735,8833a83a-17a3-6907-6b89-c8e6b2900d14,00bdac11-a55a-5ed9-a753-0c1521569745,78afe93b-2b90-1f56-71e2-1cff64075def,859a26d1-83b9-53ad-7775-d1f2be26ec41,cb9f7da1-99d1-1a21-cf4e-ab9d9b95c326,e082531c-a12f-dfba-7208-9d655bd8a4db,c4cd4384-b7d3-442c-80e0-9c2ee81a6c97,f5627e13-5d7e-0514-0446-e836d4dfe4f0,e0b19750-0982-28be-930e-10f9323a2a8a,030e08c6-99cf-9b42-0e03-c6649bcf9737,94c17cab-1fc9-92b6-c6f8-df5a22a1172b,06804123-ef3e-5e60-216a-b2ee8fa1731a,e9fd0a82-ecc0-7f91-7bd0-8b1af36da95c,1b22b59d-e172-8f3f-4c51-740d39705e42,8618f81a-f1f8-5263-d745-70f0e07e267e,3cc4d525-b4cd-e03b-b5c0-7bcca457881b,a325627e-452f-ca14-fb4f-4053f166fee1,bdfe893a-1a12-b0cf-c49f-3b0d088a35c6,ecac4665-6da8-2c5a-9375-94e547dd087c,b67b9f74-4c59-818f-edb1-a5756f84851d,bafc4e7b-27be-e35b-9f94-5d1c7fcb46d3,67ed49b9-5144-9240-116f-24b57ac7e863,c0f090cf-2c3f-78f2-18e8-08860b33c36b,a437d976-3b47-0d9e-7468-3341a317538c,5944a319-e0a4-245c-43b7-a1d9e16d6415,45901630-c722-099d-0d16-b54c0337efc2,3aae54d2-f3a9-84fe-1012-e5021ab66b1a,b3b1178f-d180-7200-1dd6-bc58a54eacac,be62fcdf-0a4b-c932-7d6a-558c71829314,4439a1bb-323c-725a-14d8-9e3caeadac00,6b860455-8bb2-9a26-399d-d3452cf5a71c,5cd3789b-1b53-02fb-68c8-94961c55429e,c6176f25-db1c-b4b6-5280-e4ac3ad9638f,ae877875-1973-d398-4804-be20e103df0c,4a6995b2-a696-73a0-cfa9-ecff9571e680,06a4a7ce-3ac7-e773-11dd-9abf28e61b41,c1939324-cdb5-e512-cc59-e98263f0ade7,57f8cefb-fe27-69db-bfb8-28e8b91656bd,516d6cb5-19df-fafa-d633-f0f67c667eb8,10a28297-008a-1a7f-9930-bf3a3beec57a,17785e9d-11ab-6e3e-5111-17c0c16d6416,aaaa6243-7e0b-ae7c-bc08-753c52935835 | evidence=EV-39-JIAHAO-03 | jiahao ADR 五件套：mean_ratio 0.9449（门槛 0.6），字段缺失率超线=false，判 NOT_RED
- TC-3: supported | basis=B2 | facts=7fac740e-8734-1ab7-dc82-1a56c99ef843,5000d412-e943-05eb-ac2c-9eefcd77b8ee,6668b742-22a5-934f-ad65-a66f83f5411d | evidence=EV-39-JIAHAO-04 | jiahao 定位覆盖：意图面 3 件最低 ratio 0.8500（AGENTS.md），判 GREEN
- NC-1: supported | basis=B4 | facts=0c79ff9b-fa16-07fd-8966-8eab93f13cbd | evidence=EV-39-JIAHAO-05 | 负对照选材 jiahao/package.json 五件套 0 命中、supersede 0 命中（特异性成立）
- human_adjudication: pending（裁定仍由人做，见 B5）

## C3 证据

### EV-39-JIAHAO-01 — D:\Aworker\6F\.scratch\architecture-recovery\reports\46-out\39-macro-b-jiahao-measurements.json @ L14
- claim: 本次实测：jiahao Macro-B one-shot 采集事实数
- grounded: true · collected_at: 2026-09-16T14:39:52+08:00
- reproduce_cmd: node .scratch/architecture-recovery/reports/39-macro-b-one-shot.mjs --repo jiahao --root D:\Aworker\jiahao
- 引文原文: "fact_count": 1101,

### EV-39-JIAHAO-02 — D:\Aworker\6F\.scratch\architecture-recovery\reports\46-out\39-macro-b-jiahao-measurements.json @ L19
- claim: 本次实测：jiahao TC-1 ADR 事后补写判据裁定（NOT_RED）
- grounded: true · collected_at: 2026-09-16T14:39:52+08:00
- reproduce_cmd: node .scratch/architecture-recovery/reports/39-macro-b-one-shot.mjs --repo jiahao --root D:\Aworker\jiahao
- 引文原文: "verdict": "NOT_RED",

### EV-39-JIAHAO-03 — D:\Aworker\6F\.scratch\architecture-recovery\reports\46-out\39-macro-b-jiahao-measurements.json @ L28
- claim: 本次实测：jiahao TC-2 五件套完整度 mean_ratio
- grounded: true · collected_at: 2026-09-16T14:39:52+08:00
- reproduce_cmd: node .scratch/architecture-recovery/reports/39-macro-b-one-shot.mjs --repo jiahao --root D:\Aworker\jiahao
- 引文原文: "mean_ratio_4": "0.9449",

### EV-39-JIAHAO-04 — D:\Aworker\6F\.scratch\architecture-recovery\reports\46-out\39-macro-b-jiahao-measurements.json @ L73
- claim: 本次实测：jiahao TC-3 定位覆盖率最低值
- grounded: true · collected_at: 2026-09-16T14:39:52+08:00
- reproduce_cmd: node .scratch/architecture-recovery/reports/39-macro-b-one-shot.mjs --repo jiahao --root D:\Aworker\jiahao
- 引文原文: "lowest_ratio_4": "0.8500",

### EV-39-JIAHAO-05 — D:\Aworker\6F\.scratch\architecture-recovery\reports\46-out\39-macro-b-jiahao-measurements.json @ L84
- claim: 本次实测：jiahao NC-1 负对照选材五件套命中数（预期 0）
- grounded: true · collected_at: 2026-09-16T14:39:52+08:00
- reproduce_cmd: node .scratch/architecture-recovery/reports/39-macro-b-one-shot.mjs --repo jiahao --root D:\Aworker\jiahao
- 引文原文: "five_piece_present": 0,

### EV-39-JIAHAO-06 — docs/adr/0001-prompt-as-mental-model-for-second-party-agents.md @ L1
- claim: jiahao ADR 语料锚：docs/adr/0001-prompt-as-mental-model-for-second-party-agents.md 实物存在（语料 69 份）
- grounded: true · collected_at: 2026-09-16T14:39:52+08:00
- reproduce_cmd: git -C D:\Aworker\jiahao show HEAD:docs/adr/0001-prompt-as-mental-model-for-second-party-agents.md
- 引文原文: # Prompt-as-Mental-Model for Second-Party Agents

### EV-39-JIAHAO-07 — .scratch/macro-audit/decision-ledger.md @ L32
- claim: D-033②：Macro-B 已上架层对三仓各跑一次 one-shot 泛化验证；jiahao 挂持续回归
- grounded: true · collected_at: 2026-09-16T14:39:52+08:00
- reproduce_cmd: git -C D:\Aworker\6F show HEAD:.scratch/macro-audit/decision-ledger.md
- 引文原文: | D-033 | Q5（轮7）：#25-B4.2 与 jiahao / anysearch-cli / env-manager 三试点仓对接的产品方向与优先级？ | OK（2026-09-15，原话「OK」＝采纳推荐全项；基于 atomcode 取证：6 searches/7 全文核验，角色框架高置信、多仓排序法中置信=a16z design-partner 框架迁移；缺口：各仓 PR 人/机比与 supersede 链完整度未实测） | 对接方向=试点仓角色绑定能力层而非仓：① 角色分配=anysearch-cli→Macro-C 校准语料（56 ADR＋supersede 链稀缺素材）／env-manager→Micro-A 唯一合格试点＋泛化验证（唯一托管 PR 面，含 dependabot/release-please 非人类 PR 边缘形态）／jiahao→Micro-B·Macro-B 回归＋下限测试（纯本地仓测「git 健全无托管」下限）／三仓并跑→Macro-A 泛化冒烟（需≥2仓天然最后）；② 时序=Macro-B 已上架层立即对三仓各跑一次 one-shot 泛化验证，jiahao 挂 Macro-B 持续回归（阶段3 CI 票），其余层试点随各 preview 漏斗；③ 前置票=试点面可用性审计脚本（PR 人/机比、supersede 链完整度实测）；④ 拆票=可用性审计→Macro-B 三仓 one-shot→各层试点→回归接入，不立大票 | 结构性限制入规：三仓同主属确认偏差面（dogfooding=generative not evaluative，OCLint 官方口径只给信心不证泛化），试点定位=校准＋冒烟；泛化验证必须引≥1 非自有公开仓（D-013 URL opt-in 首实用户），登记为 Macro-B GA 前置条件；持续回归仅限已上架层；试点成功度量=反复接受非跑通；PR 层试点不得指派无托管 PR 面的仓（capacity 硬约束）；冲突核查 26 条 current 无 revised；执行时点=grill 定稿后整理环节；整理环节更新 #25-checklist B4.2 行=decided-now | current |

#### 引文→结论支持关系校验
- CL-39-JIAHAO-01 -> EV-39-JIAHAO-01: supports（matched=fact_count missing=）全部支撑锚在引文原文中逐字命中
- CL-39-JIAHAO-02 -> EV-39-JIAHAO-02: supports（matched=verdict missing=）全部支撑锚在引文原文中逐字命中
- CL-39-JIAHAO-03 -> EV-39-JIAHAO-03: supports（matched=mean_ratio_4 missing=）全部支撑锚在引文原文中逐字命中
- CL-39-JIAHAO-04 -> EV-39-JIAHAO-04: supports（matched=lowest_ratio_4 missing=）全部支撑锚在引文原文中逐字命中
- CL-39-JIAHAO-05 -> EV-39-JIAHAO-05: supports（matched=five_piece_present missing=）全部支撑锚在引文原文中逐字命中
- CL-39-JIAHAO-06 -> EV-39-JIAHAO-07: supports（matched=Macro-B 已上架层立即对三仓各跑一次 one-shot missing=）全部支撑锚在引文原文中逐字命中

## C4 行动建议

### R-39-JIAHAO-1 [P1] 引入 ≥1 非自有公开仓经 URL opt-in 跑 Macro-B（衔接 #40 / D-013）
- rationale: 三试点仓同主属 dogfooding——generative not evaluative（D-033）；one-shot 裁定只作校准+冒烟，不构成泛化证据，GA 前置须外部仓
- expected_impact: 泛化证据链闭环，Macro-B GA 准入条件达成 · effort: M
- verdict_gate_stamp: ADR-0013-C/v1 / supported
- evidence_refs: EV-39-JIAHAO-07
- degraded_note: (none)

### R-39-JIAHAO-2 [P2] jiahao 持续回归由 6F 仓 .github/workflows/macro-b-regression.yml 承载（schedule 定时回归 + workflow_dispatch URL opt-in），jiahao 仅作审计对象不承载我方资产；本仓其余两仓维持只读 one-shot
- rationale: D-033② 指派 jiahao 为 Macro-B 回归仓；D-046 回归 CI 迁回 6F 自有 CI；接入动作 = 多写者触发器 (a) 激活点（D-034④a）
- expected_impact: 已上架层获得定时回归面；触发器 (a) 激活进值守通道 · effort: S
- verdict_gate_stamp: ADR-0013-C/v1 / supported
- evidence_refs: EV-39-JIAHAO-07
- degraded_note: (none)


