# MA-39-ANYSEARCHCLI-MACRO-B-ONESHOT — Macro-B 首报（anysearch-cli@8314a3c92b4c）
> RECEIPT RCP-b87bc53eb457a9fc chain=b87bc53eb457a9fcd192c777d4d2ba46 content=2b381a7fb8a86ef2 facts=1041 adjudications=6 issued_at=2026-09-16T03:03:27+08:00 commit=8314a3c92b4c6f15332e08f3d225cf96675241e3 tree=9a94be447b55
>
> 骨架 1.1.0（章顺序锁定，ADR-0006）· 裁定协议 ADR-0013-C/v1 · 生成于 2026-09-16T03:03:27+08:00
>
> 披露块（preview 标注诚实 = 决策本体，ADR-0017；机器可读字段见侧车 preview_disclosure）
> - capability: capability 1 of 5 · preview
> - calibration_scope: 同主三试点仓 one-shot（env-manager / anysearch-cli / jiahao）
> - structural_limitations: 同主仓确认偏差：三试点仓与产品同主——dogfooding = generative not evaluative（D-033），本报告属校准+冒烟，不构成泛化证据；泛化证据缺口：Macro-B GA 前置须 ≥1 非自有公开仓经 URL opt-in（#40 / D-013）；structure/behavior/supply_chain 象限 not_applicable：Macro-B 已上架采集面仅 strategy（S1+S2）；供应链象限 ⚠ 数据未接（D-034③）；one-shot 度量 = 反复接受非跑通：TC 三档裁定（supported/unsupported/insufficient）如实落数，不为跑通而跑通
> - not_in_preview: Micro-A / Micro-B / Macro-A

## C1 执行摘要

- report_id: MA-39-ANYSEARCHCLI-MACRO-B-ONESHOT
- schema_version: 1.1.0
- scale: Macro-B
- subject_ref: anysearch-cli@8314a3c92b4c
- generated_at: 2026-09-16T03:03:27+08:00
- correlation_key: trace_id=54c76f7e01aeefe00547b7f727f9c453 baggage_id=e2e2c203be2ab2da766443eb670edfbc
- overall_verdict: unsupported
- confidence: 0.6
- headline: anysearch-cli Macro-B one-shot（capability 1 of 5 · preview）：314 commits / ADR 65 份 / facts 1041——TC-1 NOT_RED（n=65）、TC-2 RED（mean=0.6462）、TC-3 GREEN（0.8500）→ 综合裁定 unsupported（反复接受非跑通：三档如实落数）。
- degraded_mode: false
- stale_data_marker: fresh（SLA 5s / 实测延迟 0s）
- read_model_version: 1.1.0 · fact_watermark_version: 1
- top_findings: EV-39-ANYSEARCHCLI-01, EV-39-ANYSEARCHCLI-03, EV-39-ANYSEARCHCLI-04
- fact_ids: 1041 条（清单见侧车 JSON）

## C2 四象限与裁决

### strategy（applicability=native）
- verdict: unsupported · score: n/a · confidence: 0.6
- dimensions: S1, S2
- slice_fields: {"s1_keyword_coverage_ratio":0.85,"s2_five_piece_mean_ratio":0.6462,"adr_count":65,"lag_judgeable_n":65,"intent_docs":3}
- conflict_markers: (none)
- verdict_gate: ADR-0013-C/v1 / unsupported / threshold_met=true / decided_at=2026-09-16T03:03:27+08:00 / audit_ref=reports/39-macro-b-one-shot.mjs

### structure（applicability=not_applicable）
- verdict: insufficient · score: n/a · confidence: 0
- dimensions: 
- slice_fields: {}
- conflict_markers: out-of-scope-stage1
- verdict_gate: ADR-0013-C/v1 / insufficient / threshold_met=false / decided_at=2026-09-16T03:03:27+08:00 / audit_ref=reports/39-macro-b-one-shot.mjs

### behavior（applicability=not_applicable）
- verdict: insufficient · score: n/a · confidence: 0
- dimensions: 
- slice_fields: {}
- conflict_markers: out-of-scope-stage1
- verdict_gate: ADR-0013-C/v1 / insufficient / threshold_met=false / decided_at=2026-09-16T03:03:27+08:00 / audit_ref=reports/39-macro-b-one-shot.mjs

### supply_chain（applicability=not_applicable）
- verdict: insufficient · score: n/a · confidence: 0
- dimensions: 
- slice_fields: {}
- conflict_markers: data-not-connected
- verdict_gate: ADR-0013-C/v1 / insufficient / threshold_met=false / decided_at=2026-09-16T03:03:27+08:00 / audit_ref=reports/39-macro-b-one-shot.mjs

#### 结构化裁决块（agent 可消费）
- protocol_version: ADR-0013-C/v1
- overall: unsupported · decided_at: 2026-09-16T03:03:27+08:00
- PC-1: supported | basis=B1 | facts=7c7389eb-ede1-cf76-c94b-9bc7ee1b955e,f52f9709-c66d-8edc-1063-101a58cd0a7a | evidence=EV-39-ANYSEARCHCLI-01 | adr-structure 与 positioning 两族均产出非空事实，golden ADR 五件套 5/5 且 supersede 链命中（anysearch-cli run 内管线活性正对照）
- PC-2: supported | basis=B1 | facts=8b51364f-e85e-312d-8631-0ed6390fbe77 | evidence=EV-39-ANYSEARCHCLI-01 | gitlog 族检出事后补写 delta_days = 255
- TC-1: supported | basis=B2 | facts=e8c0be39-6fc0-21d9-6a4d-b2f059c1a4c1,be74b549-a6a9-714a-6a38-77e20f33bcb8,b16e36d6-ead1-45df-133a-2d349ddf6c3e,43cf3934-4d57-3f37-c05d-7f70a2a540fa,0e6fbe87-a718-616c-e6a5-17d55b1d71f8,ac2824b0-c85d-8fab-824d-c2633c029734,0d4a0ed5-8248-0dfd-f982-1758bf4ac0fb,08fea7dc-33de-aac9-44c8-60abbedab5d3,d03fdc59-7455-eff3-d2d6-5689711ca46f,5c718868-b4c5-a14b-d4b0-45ba07f389dd,ef4c01c2-9aef-cc69-1e03-8d265d6dad3f,55cee4e4-f1f7-ccea-be7a-a00ffca3e50f,9adf8e64-4662-43e3-a700-5ad2ca81f2ea,7ef728aa-3f7f-695b-80c6-43e92934d961,97482fc4-1fee-e875-346f-4c23aa306469,fd6e649a-c6f0-7743-019c-a0a8f6f636e2,97ae7e60-05f8-a983-03ef-2e30d83d664b,7f175dd9-0e0b-f6cb-eea9-d10d49d62c6c,6ce0a482-0c6c-ee75-dbb0-c6738fa1d1cc,87041c0f-bfc7-b488-11ac-3a8a130078a0,4e253a90-4be3-131f-b63e-558174dadc71,c9e117a4-26b7-0862-62b8-e0ce24385ebd,cbf8fa82-ace3-5fbc-2b8d-ef667037bfea,c5c94f71-13c2-9785-20eb-f316607a7321,bd8d041a-b950-95bd-d728-da8a7f7be44f,07aba5b8-4c9b-72b0-8bee-44e525f51766,88c5a710-0fd2-9337-3025-264e5242ef07,d8a0d187-7d56-8850-2d42-344047a93611,68374b32-83ca-64c6-f84e-8e967cbf112d,c23fde38-3ae0-df63-c023-cc402799ba09,f5fe089a-cfea-44df-d65d-7215408241d3,29c8c7a4-e3b7-4e2f-3adb-fffac7ea6480,b579c1f6-5074-8427-e536-9a5eefbccd10,6f9264ad-e5da-b05d-3bba-1e7f0da5ad03,994f0469-0ba3-7d05-5499-34f1d503c224,cb97ed13-0005-7ab7-6e15-291fd7da10b9,3112efc7-9e30-933f-279f-8341ddb13bf1,b62fe6ed-01c9-5fc5-0690-722bd82ecca0,c1b6756e-4274-9be6-db7e-645de1e0f806,fef55af6-1c93-fa9e-633f-3859bf9854d8,752ee8da-1183-60be-cdad-aa96a5dd13b2,777a2a64-85ec-c0df-a019-2544d46e6c9e,10cb84ca-abbf-35a7-6d22-5548afc066b6,4c77b64e-1454-0e00-a6b5-8582dddcdd54,ffeaf52c-9f55-c349-71af-7672105c7d13,5e7a20c7-fd0a-ff21-1da0-f1388ec4c9d3,fa61970e-c578-0fa6-10bc-572bbe3a5ae1,5c7b489a-e96b-bd18-800c-7cdfaad665ee,60951ec7-c455-7b0f-89be-2af5c6550ebc,f9494e28-98a8-a01b-3310-ceff500e954f,5c197f31-879d-5fa5-251d-cacfad258ebf,8bd8e6b4-8e12-057b-0cff-ef627538dcea,2180ea4f-edf4-cafb-5cdc-25e723b8be41,e3a24d67-aaf9-0e3c-4399-40488e6ad065,917209d8-b211-4d0a-7c9e-8ccb9a0b6ec7,99043e14-e66d-a529-d369-97f8ca664de4,dd07f5a7-ea21-1d46-3963-66ecb3091207,793f7b6f-819a-b8c9-f3aa-e34fd21b4635,f64fa9dd-0db3-1031-9d2b-ebbf53f3b910,0f31d061-dce4-89af-3389-f2fd5a3b695f,193427f4-a513-a7fa-48f9-a7f895a3b7f8,b27e49d1-843e-ba98-9734-51882fc81a73,1e2260f3-f6e6-cb20-4d71-f9d565c3704f,a2312ec7-df85-e790-4657-bc778fe4ef05,dd8d34cf-53b7-952c-ba50-53a837340fc3 | evidence=EV-39-ANYSEARCHCLI-02 | anysearch-cli ADR 事后补写：可判定数 65（门槛 5），>90d 占比 0.0000，判 NOT_RED
- TC-2: unsupported | basis=B2 | facts=449c18d0-d801-62bd-3e9c-9e5cf24b6372,d2f8f59b-c66b-9be8-fa77-d614bcd10d27,9dad7102-4b45-eaac-1636-d899bc513d4b,f1387646-c85b-9b9b-1b92-172d4486c16c,2f7d5b39-7e83-8cd3-2163-24db0e3fb9b0,5965e31f-826e-44fd-b070-1aa373dc6724,7fe15534-f982-784b-d0f4-f7c9897222b9,feffd66d-f774-7044-31af-3899506f2c7d,7b0b5bee-3008-c714-7d99-7e394aea80a6,220410ff-d208-53af-45a3-ea9c6a1370f4,c15d4b57-b379-3d93-d675-f4cbf665f41e,cac80bc6-61b2-a512-f939-4aecfb1b4e01,524bac58-ea94-40f1-fbf6-cc279517a55c,23792ddc-e05c-21c8-ba71-704c2f70df01,ed9ef937-0967-2a75-21e7-35afb1489b95,b5ae446b-fbd8-7b39-5731-f16d2b016f56,34d89ccb-69b4-7aca-83ca-ed88436288a6,572bfd78-5398-eafe-253b-11ae17f1d6d0,2a6ba62a-7e50-68d6-6090-7ed05b26ae7a,841ff4cc-add9-8ce8-66bd-63a668a078e4,d58205e3-3be7-ac0f-cbd0-7e5ad90f32af,5ee5efc2-b81a-3bd5-6aa9-d0b2b270616c,01bc90f5-24ea-5458-4863-6870dca537b4,d2c0f8cc-0eb0-2f19-02ff-1f3dbd182ada,09c0f639-ecf9-43cb-c414-9be6b1419a25,00288193-ed76-e234-5539-67d69a4cd1d1,278f79c8-d903-c149-d303-ded5e82ad168,bf7f7e1a-733c-a37a-2b37-b68f9f71fa16,09aec9ef-9345-479e-195c-5438fae6d10d,58fb4295-0796-4a6b-0ef1-9c8c83b76b32,dc7af888-955b-7c1b-eaff-3b5a31d0556c,143a8e1c-047a-c3ae-ce13-ceaac7609343,6345ca72-f451-8e2a-b985-7cbf27a4985a,56b4fcd1-555b-c166-1e94-2589cc74220f,ccbebfe4-e279-aed6-716f-62c8e92da658,a3bf78a4-26ce-9a07-8818-29396fcdf1ad,cf00aa81-33ef-6fa7-3594-f7424b51419f,edcf4cab-d838-3199-7f9f-2448900c26d0,9779bc55-006e-12c5-d35c-c7e63a2423a4,3f816616-e20b-eceb-7e3f-d30a62832dab,65daf7a5-f261-e24b-63c7-0e27927942bd,36f5ce48-fa1d-7c88-e78f-29e56ceb00a0,b54819fe-8bd5-8667-cda3-e73280c873cd,d0256035-fac2-d143-bfb6-e54c4f59ffc8,f57b4556-16e2-5ea6-1f72-fdd19032691a,2f495288-9cb9-4dd4-5a44-13efcfeed51c,513f4f59-8dce-494e-fb8d-1a87265a470f,8aab90cd-b281-af5f-024f-bc42702f98bb,222a939f-7b08-6e76-0f7a-3dec3c000a4d,63ccbb52-a053-2a78-936b-bd222c2c5ba1,344f6ca4-1751-cd27-f2e2-ffae19ff770f,8cf68e79-b3f7-d94c-9250-e4de1f07b9dc,5b483b6b-2cdd-c6a3-1251-002088e8df1b,579f955a-d2ea-fe73-5605-99d221805820,c131540b-906b-4e3b-8f1c-ca00b8346c3d,a9dafb6b-4941-3fa1-3952-73e71ec408ca,524c5ae7-15b3-5178-8f51-d85dcf9d5deb,f124707f-354f-0a32-b4c7-9987ab17b926,011a2fc7-02be-4131-2a58-36c1ac5fa9ac,b2921725-f0fc-4ad5-0725-80f4c4589977,7f26beea-c11a-c617-dfe9-65a7dedf4db7,5c035f7e-6bf9-b6eb-572c-37c57a13fcbf,15afae0b-d637-2b59-a2ec-c9a7901d621c,fc6288ea-e7db-3022-b564-341e25513bd9,cbfa9b51-4261-5d91-a133-50909e488c05 | evidence=EV-39-ANYSEARCHCLI-03 | anysearch-cli ADR 五件套：mean_ratio 0.6462（门槛 0.6），字段缺失率超线=true，判 RED
- TC-3: supported | basis=B2 | facts=1c56f8f1-5dfe-7383-11d1-3b1d398ffb60,6b7f1658-6550-ec08-f5bd-7ed64a868c0f,ad6d674d-3637-efca-3028-bc98fbb6da64 | evidence=EV-39-ANYSEARCHCLI-04 | anysearch-cli 定位覆盖：意图面 3 件最低 ratio 0.8500（AGENTS.md），判 GREEN
- NC-1: supported | basis=B4 | facts=a8b7389a-74f6-f749-f741-f06133c5325d | evidence=EV-39-ANYSEARCHCLI-05 | 负对照选材 anysearch-cli/package.json 五件套 0 命中、supersede 0 命中（特异性成立）
- human_adjudication: pending（裁定仍由人做，见 B5）

## C3 证据

### EV-39-ANYSEARCHCLI-01 — D:\Aworker\6F\.scratch\architecture-recovery\reports\39-macro-b-anysearch-cli-measurements.json @ L14
- claim: 本次实测：anysearch-cli Macro-B one-shot 采集事实数
- grounded: true · collected_at: 2026-09-16T03:03:27+08:00
- reproduce_cmd: node .scratch/architecture-recovery/reports/39-macro-b-one-shot.mjs --repo anysearch-cli --root D:/Aworker/anysearch-cli
- 引文原文: "fact_count": 1041,

### EV-39-ANYSEARCHCLI-02 — D:\Aworker\6F\.scratch\architecture-recovery\reports\39-macro-b-anysearch-cli-measurements.json @ L19
- claim: 本次实测：anysearch-cli TC-1 ADR 事后补写判据裁定（NOT_RED）
- grounded: true · collected_at: 2026-09-16T03:03:27+08:00
- reproduce_cmd: node .scratch/architecture-recovery/reports/39-macro-b-one-shot.mjs --repo anysearch-cli --root D:/Aworker/anysearch-cli
- 引文原文: "verdict": "NOT_RED",

### EV-39-ANYSEARCHCLI-03 — D:\Aworker\6F\.scratch\architecture-recovery\reports\39-macro-b-anysearch-cli-measurements.json @ L28
- claim: 本次实测：anysearch-cli TC-2 五件套完整度 mean_ratio
- grounded: true · collected_at: 2026-09-16T03:03:27+08:00
- reproduce_cmd: node .scratch/architecture-recovery/reports/39-macro-b-one-shot.mjs --repo anysearch-cli --root D:/Aworker/anysearch-cli
- 引文原文: "mean_ratio_4": "0.6462",

### EV-39-ANYSEARCHCLI-04 — D:\Aworker\6F\.scratch\architecture-recovery\reports\39-macro-b-anysearch-cli-measurements.json @ L73
- claim: 本次实测：anysearch-cli TC-3 定位覆盖率最低值
- grounded: true · collected_at: 2026-09-16T03:03:27+08:00
- reproduce_cmd: node .scratch/architecture-recovery/reports/39-macro-b-one-shot.mjs --repo anysearch-cli --root D:/Aworker/anysearch-cli
- 引文原文: "lowest_ratio_4": "0.8500",

### EV-39-ANYSEARCHCLI-05 — D:\Aworker\6F\.scratch\architecture-recovery\reports\39-macro-b-anysearch-cli-measurements.json @ L84
- claim: 本次实测：anysearch-cli NC-1 负对照选材五件套命中数（预期 0）
- grounded: true · collected_at: 2026-09-16T03:03:27+08:00
- reproduce_cmd: node .scratch/architecture-recovery/reports/39-macro-b-one-shot.mjs --repo anysearch-cli --root D:/Aworker/anysearch-cli
- 引文原文: "five_piece_present": 0,

### EV-39-ANYSEARCHCLI-06 — docs/adr/0001-typescript-pi-skeleton.md @ L1
- claim: anysearch-cli ADR 语料锚：docs/adr/0001-typescript-pi-skeleton.md 实物存在（语料 65 份）
- grounded: true · collected_at: 2026-09-16T03:03:27+08:00
- reproduce_cmd: git -C D:/Aworker/anysearch-cli show HEAD:docs/adr/0001-typescript-pi-skeleton.md
- 引文原文: # ADR-0001: TypeScript 内核 + @earendil-works/pi-* 骨架

### EV-39-ANYSEARCHCLI-07 — .scratch/macro-audit/decision-ledger.md @ L21
- claim: D-033②：Macro-B 已上架层对三仓各跑一次 one-shot 泛化验证；jiahao 挂持续回归
- grounded: true · collected_at: 2026-09-16T03:03:27+08:00
- reproduce_cmd: git -C D:\Aworker\6F show HEAD:.scratch/macro-audit/decision-ledger.md
- 引文原文: | D-033 | Q5（轮7）：#25-B4.2 与 jiahao / anysearch-cli / env-manager 三试点仓对接的产品方向与优先级？ | OK（2026-09-15，原话「OK」＝采纳推荐全项；基于 atomcode 取证：6 searches/7 全文核验，角色框架高置信、多仓排序法中置信=a16z design-partner 框架迁移；缺口：各仓 PR 人/机比与 supersede 链完整度未实测） | 对接方向=试点仓角色绑定能力层而非仓：① 角色分配=anysearch-cli→Macro-C 校准语料（56 ADR＋supersede 链稀缺素材）／env-manager→Micro-A 唯一合格试点＋泛化验证（唯一托管 PR 面，含 dependabot/release-please 非人类 PR 边缘形态）／jiahao→Micro-B·Macro-B 回归＋下限测试（纯本地仓测「git 健全无托管」下限）／三仓并跑→Macro-A 泛化冒烟（需≥2仓天然最后）；② 时序=Macro-B 已上架层立即对三仓各跑一次 one-shot 泛化验证，jiahao 挂 Macro-B 持续回归（阶段3 CI 票），其余层试点随各 preview 漏斗；③ 前置票=试点面可用性审计脚本（PR 人/机比、supersede 链完整度实测）；④ 拆票=可用性审计→Macro-B 三仓 one-shot→各层试点→回归接入，不立大票 | 结构性限制入规：三仓同主属确认偏差面（dogfooding=generative not evaluative，OCLint 官方口径只给信心不证泛化），试点定位=校准＋冒烟；泛化验证必须引≥1 非自有公开仓（D-013 URL opt-in 首实用户），登记为 Macro-B GA 前置条件；持续回归仅限已上架层；试点成功度量=反复接受非跑通；PR 层试点不得指派无托管 PR 面的仓（capacity 硬约束）；冲突核查 26 条 current 无 revised；执行时点=grill 定稿后整理环节；整理环节更新 #25-checklist B4.2 行=decided-now | current |

#### 引文→结论支持关系校验
- CL-39-ANYSEARCHCLI-01 -> EV-39-ANYSEARCHCLI-01: supports（matched=fact_count missing=）全部支撑锚在引文原文中逐字命中
- CL-39-ANYSEARCHCLI-02 -> EV-39-ANYSEARCHCLI-02: supports（matched=verdict missing=）全部支撑锚在引文原文中逐字命中
- CL-39-ANYSEARCHCLI-03 -> EV-39-ANYSEARCHCLI-03: supports（matched=mean_ratio_4 missing=）全部支撑锚在引文原文中逐字命中
- CL-39-ANYSEARCHCLI-04 -> EV-39-ANYSEARCHCLI-04: supports（matched=lowest_ratio_4 missing=）全部支撑锚在引文原文中逐字命中
- CL-39-ANYSEARCHCLI-05 -> EV-39-ANYSEARCHCLI-05: supports（matched=five_piece_present missing=）全部支撑锚在引文原文中逐字命中
- CL-39-ANYSEARCHCLI-06 -> EV-39-ANYSEARCHCLI-07: supports（matched=Macro-B 已上架层立即对三仓各跑一次 one-shot missing=）全部支撑锚在引文原文中逐字命中

## C4 行动建议

### R-39-ANYSEARCHCLI-1 [P1] 引入 ≥1 非自有公开仓经 URL opt-in 跑 Macro-B（衔接 #40 / D-013）
- rationale: 三试点仓同主属 dogfooding——generative not evaluative（D-033）；one-shot 裁定只作校准+冒烟，不构成泛化证据，GA 前置须外部仓
- expected_impact: 泛化证据链闭环，Macro-B GA 准入条件达成 · effort: M
- verdict_gate_stamp: ADR-0013-C/v1 / unsupported
- evidence_refs: EV-39-ANYSEARCHCLI-07
- degraded_note: (none)

### R-39-ANYSEARCHCLI-2 [P2] jiahao 持续回归以 .github/workflows/macro-b-regression.yml 承载（schedule 定时回归 + workflow_dispatch），本仓其余两仓维持只读 one-shot
- rationale: D-033② 指派 jiahao 为 Macro-B 回归仓；接入动作 = 多写者触发器 (a) 激活点（D-034④a）
- expected_impact: 已上架层获得定时回归面；触发器 (a) 激活进值守通道 · effort: S
- verdict_gate_stamp: ADR-0013-C/v1 / unsupported
- evidence_refs: EV-39-ANYSEARCHCLI-07
- degraded_note: (none)


