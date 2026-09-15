# MA-39-JIAHAO-MACRO-B-ONESHOT — Macro-B 首报（jiahao@9e8276075d20）
> RECEIPT RCP-4d1b294f6e2b0a07 chain=4d1b294f6e2b0a0777535656d3bfec30 content=8eeb7296fa5dfa43 facts=1101 adjudications=6 issued_at=2026-09-16T02:48:53+08:00 commit=9e8276075d201bb81c7b84317557dfb42cc4154c tree=5fbfd8127292
>
> 骨架 1.1.0（章顺序锁定，ADR-0006）· 裁定协议 ADR-0013-C/v1 · 生成于 2026-09-16T02:48:53+08:00
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
- subject_ref: jiahao@9e8276075d20
- generated_at: 2026-09-16T02:48:53+08:00
- correlation_key: trace_id=171a1db6bfbbc7333ccde17209d7e721 baggage_id=91155afb3e92e47456b8ef51340b9d84
- overall_verdict: supported
- confidence: 0.6
- headline: jiahao Macro-B one-shot（capability 1 of 5 · preview）：251 commits / ADR 69 份 / facts 1101——TC-1 NOT_RED（n=69）、TC-2 NOT_RED（mean=0.9449）、TC-3 GREEN（0.8500）→ 综合裁定 supported（反复接受非跑通：三档如实落数）。
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
- verdict_gate: ADR-0013-C/v1 / supported / threshold_met=false / decided_at=2026-09-16T02:48:53+08:00 / audit_ref=reports/39-macro-b-one-shot.mjs

### structure（applicability=not_applicable）
- verdict: insufficient · score: n/a · confidence: 0
- dimensions: 
- slice_fields: {}
- conflict_markers: out-of-scope-stage1
- verdict_gate: ADR-0013-C/v1 / insufficient / threshold_met=false / decided_at=2026-09-16T02:48:53+08:00 / audit_ref=reports/39-macro-b-one-shot.mjs

### behavior（applicability=not_applicable）
- verdict: insufficient · score: n/a · confidence: 0
- dimensions: 
- slice_fields: {}
- conflict_markers: out-of-scope-stage1
- verdict_gate: ADR-0013-C/v1 / insufficient / threshold_met=false / decided_at=2026-09-16T02:48:53+08:00 / audit_ref=reports/39-macro-b-one-shot.mjs

### supply_chain（applicability=not_applicable）
- verdict: insufficient · score: n/a · confidence: 0
- dimensions: 
- slice_fields: {}
- conflict_markers: data-not-connected
- verdict_gate: ADR-0013-C/v1 / insufficient / threshold_met=false / decided_at=2026-09-16T02:48:53+08:00 / audit_ref=reports/39-macro-b-one-shot.mjs

#### 结构化裁决块（agent 可消费）
- protocol_version: ADR-0013-C/v1
- overall: supported · decided_at: 2026-09-16T02:48:53+08:00
- PC-1: supported | basis=B1 | facts=88d54bbc-d059-f68c-9f07-11c03dd1fa15,f8c6cb7c-ee05-1196-4bec-e344b882f1ae | evidence=EV-39-JIAHAO-01 | adr-structure 与 positioning 两族均产出非空事实，golden ADR 五件套 5/5 且 supersede 链命中（jiahao run 内管线活性正对照）
- PC-2: supported | basis=B1 | facts=751226a9-f111-2a93-1540-44d48cb4f120 | evidence=EV-39-JIAHAO-01 | gitlog 族检出事后补写 delta_days = 255
- TC-1: supported | basis=B2 | facts=c3281fd8-58a0-ae57-78d1-73b837047ab5,aa64a776-d049-3b94-44e1-d41c8ef08eea,b9a299a5-3dc7-97a5-3eab-4b20f893d752,a70839cc-3618-e3d2-1733-ebb81750cac0,b358a9cf-8ddf-163f-5a4f-fc8facc8eff0,c339ef06-049c-8da4-89e9-7daa913f8ecd,ac53d962-c620-1aad-5d00-add987e61511,ce756aeb-da30-57a8-d339-b9b24bed55b6,86b0f0fc-cba3-c0bb-5fae-d17fce29c963,d1a54c0c-6cfe-0a0d-63a5-a7ec0333d3c6,9fa54a94-de1a-f4dd-65b3-752f1b7cd086,d1ec7765-4fc6-d450-af06-78d9e8cb2eaf,c6c37088-2990-c7f4-f73b-d9e509d77cfc,a6211c33-d8e7-2362-cac0-86001ad4dbfb,7fd4993f-19bd-e19c-5add-ebdd6fa4cc6b,e10fee3f-a543-3eb4-1646-f41f04823c5e,91436b3d-0094-c2c8-72fb-075aef89a28b,b498117b-7f6f-162f-5b90-e151c04ebde4,ffe28f72-e6e8-cf2b-ee95-606063352b30,e2906161-90e7-81cc-d55c-ad9756c3f73f,75688b94-2a92-09d7-fac2-d2edc06c0768,1b752d18-d18a-0b03-301d-29a9ec6e496c,cf1906a2-86ee-8ea5-e6ea-9434fad1a706,3396fed9-66f8-4892-4181-d93220cd0ad4,e52d4404-2bd3-590f-2c4a-dda295d8385e,adb85491-b51c-a9af-b6ff-dad2cda1d97b,f10e6012-c794-c7b7-bbc9-2ee0a2d0b2fa,422014ba-fada-97df-3800-df94356f0a1b,6c737c5c-8741-90e9-d35a-0e8a2eaab329,a8405366-8185-5157-517a-faba7064e2fc,edc28239-d683-e730-45a7-9a2150a34bf9,65c46432-0a42-3286-d28e-ea9469b0ac66,de47da65-5b12-23db-9495-869a6f9ed3f7,174fb329-31e9-2ccd-a1d6-70de85935f5d,5c01f3d4-9391-5dfb-2066-afeef9735756,dfa6a476-b1e4-bb1b-e5c2-4d590647be11,fec1db12-aa67-aeae-dc27-a141d66de883,938c3139-42fc-3735-8c36-914f539c6510,1c8da97a-56e7-1350-26fb-58a61edd6660,d619d516-66f5-9d6e-943c-4deb206eae98,e8f12c89-7a72-476d-02ed-a313cd09550b,3539663d-a6ae-1966-52c7-2a84ea9924f3,0447ca8b-821a-4c0a-b3fc-3c07015f4388,1d24183a-ac67-3008-bc0f-57e9d52de19e,f9d69f77-e6cf-3547-2d41-98e8fc034579,18f880f3-3710-1f64-b22b-8b23d87cbf05,209bf2a7-4122-35c1-24b5-5ab800082be6,ed34f273-4608-319b-2573-634de4d397d1,8b40f595-5d76-6d89-3aa0-8417d86db5ee,bd85b3bc-f7c4-04f2-8046-1dfd732784c3,0cc2bf31-5724-6b0f-41eb-1e40b2ba2a2f,007489d5-fb39-243b-1cb5-5e07c414a53a,8714cc2e-0245-463c-bf33-fe4e7dab7405,896637a9-0760-f5b3-b084-d6383492cf10,940008da-0670-57dc-9104-93f7ce977a0e,0ea4d6ae-b50a-3a89-05b3-4631a9a43b12,6913d3ca-0266-115e-922e-ea1276e912c6,1423a404-3e8a-51bd-ef26-cb6cf929bc96,08c34443-0535-78f2-8631-8211e8ec155d,76249b8d-e0ce-5a19-1143-8fd744cb27d8,5c305b12-3bce-e055-fc6d-00a8cff00795,46b1cb1c-69d1-d261-ab57-0255220054e5,488884db-cddb-8493-4490-164033316379,590d24c8-f838-302a-1de8-107d9c7dd552,53736c05-881a-926c-0b95-688c26e42c04,c1dbec2d-5ab3-dec5-a3a1-cbadf2e9bf94,593a1d8e-5f52-5dfb-e85c-b3db49aa20ff,af18081b-c8e6-b1d8-f85e-c3d20b9d59a6,8920e6d3-8c9f-8ded-edbe-d3e6016d77a3 | evidence=EV-39-JIAHAO-02 | jiahao ADR 事后补写：可判定数 69（门槛 5），>90d 占比 0.0145，判 NOT_RED
- TC-2: supported | basis=B2 | facts=e70970dd-701d-a5d1-fa2e-10d2ccebc4cf,d2d5de53-3ffe-abd3-41d1-2326e2cffbc5,c3ba3bf5-1117-e523-657b-906f4ea29ffd,32ff908b-2350-8342-7456-63e9890bf690,053b7d1b-69fd-6470-9c28-21d6721494fa,1c5ce477-b376-e607-6831-4411276897ea,bece4417-8558-a2f9-b22f-ecab43595688,04082c86-0578-cd4a-5952-14614f053b67,27b66e79-5d9b-aa07-a6d6-2e698298815f,77b9af89-e626-3d24-a373-8a5b698f8ae4,a8e39df6-6092-627f-3649-5179060d70fb,eadc67f0-b9c7-bbbc-7188-732311e2e7f6,cf26ad80-172b-37db-a429-6d3ee0432be5,3e1b6490-4a84-d9b7-cd4c-24c84817e125,bc455fda-20da-76e6-ccf8-c6f9bdf7211b,6b839ee6-6086-870d-cd8e-5d047b06ce83,ab4ef5a4-7ca9-5654-9a85-6c7eaf9ce702,a97c0322-017e-724f-29ac-26dbab7bc311,e79ccde8-10a6-d8b8-7cf0-750d12eb38ae,483ab489-5dd0-cbdb-4b51-82d03afd88e8,bcc49af9-9d20-97dc-595b-bc9cfd1296df,0e811df5-a215-7bc5-045a-e6cd740d784e,15cf2415-5528-6c00-570f-89930fe24d84,a992f565-da43-cfe2-962d-065aa1937a60,96bf87a0-9591-1088-54a8-58f1820a442a,d9f72981-bf11-67e2-7919-4f73495bb08e,db8bf43a-5b19-8fe6-899c-b3cb44e13d5c,2b6c3a6c-da45-4d75-4b61-2a82831fe0c6,d32d93e2-a31a-d366-db0c-7d7fb05ed5b3,99510d2f-bf67-b890-807b-a5b4177e70ea,90ea7958-4ffa-56b2-d479-86c8c91a0580,4205a3fb-a89d-9587-71b5-e8197ac8b431,12dd434e-98d0-fb3c-aad0-2e7046823b16,17460762-7e1b-c9b8-4897-e7b3be329ae1,23ad1dd6-5629-2101-61a2-942bd8ecbf86,ab86a91a-eaf2-ea04-cef0-aba98baee8fa,cf1a354c-14a3-4235-aa39-5c031d1db65b,b7f3d614-0359-546f-43e0-a714981cd82d,1219df52-40bf-9742-4297-bae659990507,6550bffb-2824-1ebc-2ac9-95854274ce63,05aa352c-783a-8c10-f599-ad56fd08d582,8b075297-5d57-049e-4322-75f52ce39383,27def224-cb65-f094-589b-90006facc55e,a2f67b5a-d8f4-4f18-8797-f324121f3cb6,c296547a-f4da-5f02-2e02-20c52393dad9,b8266001-1741-4773-43c8-ea5839603faf,8b73d909-b332-8b2b-db6f-f72b0c35af22,9600c290-d497-14d5-ea55-a5e570018df7,aacaa557-5cc0-4b71-aadf-50211905f1e3,7de75cd9-f2a2-a046-0aec-136d386782a5,08c957c8-333f-f19a-2dc7-b871f49211f7,66a7a183-91c2-2faa-9f6b-ce609b77e8d1,bc9408f5-9085-6687-ad67-ca2365a78740,cbbc3dc4-589b-353e-0dc5-98390537615b,011b3308-d09a-4b0f-23e1-89aa48255dc6,904f32ff-5ffc-9300-50ba-5706d2d44c51,0de0e438-9920-08ab-4d36-d3997f7885bb,1cd29b06-1256-7284-5c6f-6b600141f01b,c0e30854-cc7c-7886-4a1d-da26cfe4fd9e,bcff1aef-7052-ea30-a9b7-e5bf1a4f210a,fd36c785-a5cd-cde3-5846-79be677a2bb9,6a2f1cbe-7813-5896-4b8d-8907930ea4fe,d592aa06-e27b-f399-4493-a4f1496c4d05,ffd2ca7b-0ab7-d8e4-a930-0c86dbd7c349,235056c7-074a-86c7-c4d2-b4892805d81e,85ebe81f-0d84-3d0e-b4a5-fd6281cc18b6,96f7054f-56fb-17cf-c9da-5f90fec12cb5,f1ece95e-db83-da65-37e6-32993c24be1d,091a63c6-1dae-4d62-88bd-d41479de2367 | evidence=EV-39-JIAHAO-03 | jiahao ADR 五件套：mean_ratio 0.9449（门槛 0.6），字段缺失率超线=false，判 NOT_RED
- TC-3: supported | basis=B2 | facts=c261e4c8-6a56-b400-6315-f22b63c339ee,1ee38aa7-f2d3-358c-4f89-c7f996dcca01,a68bfa38-f35b-87a7-7f45-932c7e2c5bbf | evidence=EV-39-JIAHAO-04 | jiahao 定位覆盖：意图面 3 件最低 ratio 0.8500（AGENTS.md），判 GREEN
- NC-1: supported | basis=B4 | facts=e9902c0e-f936-4281-3dee-8464754ed3b1 | evidence=EV-39-JIAHAO-05 | 负对照选材 jiahao/package.json 五件套 0 命中、supersede 0 命中（特异性成立）
- human_adjudication: pending（裁定仍由人做，见 B5）

## C3 证据

### EV-39-JIAHAO-01 — D:\Aworker\6F\.scratch\architecture-recovery\reports\39-macro-b-jiahao-measurements.json @ L14
- claim: 本次实测：jiahao Macro-B one-shot 采集事实数
- grounded: true · collected_at: 2026-09-16T02:48:53+08:00
- reproduce_cmd: node .scratch/architecture-recovery/reports/39-macro-b-one-shot.mjs --repo jiahao --root D:/Aworker/jiahao
- 引文原文: "fact_count": 1101,

### EV-39-JIAHAO-02 — D:\Aworker\6F\.scratch\architecture-recovery\reports\39-macro-b-jiahao-measurements.json @ L19
- claim: 本次实测：jiahao TC-1 ADR 事后补写判据裁定（NOT_RED）
- grounded: true · collected_at: 2026-09-16T02:48:53+08:00
- reproduce_cmd: node .scratch/architecture-recovery/reports/39-macro-b-one-shot.mjs --repo jiahao --root D:/Aworker/jiahao
- 引文原文: "verdict": "NOT_RED",

### EV-39-JIAHAO-03 — D:\Aworker\6F\.scratch\architecture-recovery\reports\39-macro-b-jiahao-measurements.json @ L28
- claim: 本次实测：jiahao TC-2 五件套完整度 mean_ratio
- grounded: true · collected_at: 2026-09-16T02:48:53+08:00
- reproduce_cmd: node .scratch/architecture-recovery/reports/39-macro-b-one-shot.mjs --repo jiahao --root D:/Aworker/jiahao
- 引文原文: "mean_ratio_4": "0.9449",

### EV-39-JIAHAO-04 — D:\Aworker\6F\.scratch\architecture-recovery\reports\39-macro-b-jiahao-measurements.json @ L73
- claim: 本次实测：jiahao TC-3 定位覆盖率最低值
- grounded: true · collected_at: 2026-09-16T02:48:53+08:00
- reproduce_cmd: node .scratch/architecture-recovery/reports/39-macro-b-one-shot.mjs --repo jiahao --root D:/Aworker/jiahao
- 引文原文: "lowest_ratio_4": "0.8500",

### EV-39-JIAHAO-05 — D:\Aworker\6F\.scratch\architecture-recovery\reports\39-macro-b-jiahao-measurements.json @ L84
- claim: 本次实测：jiahao NC-1 负对照选材五件套命中数（预期 0）
- grounded: true · collected_at: 2026-09-16T02:48:53+08:00
- reproduce_cmd: node .scratch/architecture-recovery/reports/39-macro-b-one-shot.mjs --repo jiahao --root D:/Aworker/jiahao
- 引文原文: "five_piece_present": 0,

### EV-39-JIAHAO-06 — docs/adr/0001-prompt-as-mental-model-for-second-party-agents.md @ L1
- claim: jiahao ADR 语料锚：docs/adr/0001-prompt-as-mental-model-for-second-party-agents.md 实物存在（语料 69 份）
- grounded: true · collected_at: 2026-09-16T02:48:53+08:00
- reproduce_cmd: git -C D:/Aworker/jiahao show HEAD:docs/adr/0001-prompt-as-mental-model-for-second-party-agents.md
- 引文原文: # Prompt-as-Mental-Model for Second-Party Agents

### EV-39-JIAHAO-07 — .scratch/macro-audit/decision-ledger.md @ L21
- claim: D-033②：Macro-B 已上架层对三仓各跑一次 one-shot 泛化验证；jiahao 挂持续回归
- grounded: true · collected_at: 2026-09-16T02:48:53+08:00
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

### R-39-JIAHAO-2 [P2] jiahao 持续回归以 .github/workflows/macro-b-regression.yml 承载（schedule 定时回归 + workflow_dispatch），本仓其余两仓维持只读 one-shot
- rationale: D-033② 指派 jiahao 为 Macro-B 回归仓；接入动作 = 多写者触发器 (a) 激活点（D-034④a）
- expected_impact: 已上架层获得定时回归面；触发器 (a) 激活进值守通道 · effort: S
- verdict_gate_stamp: ADR-0013-C/v1 / supported
- evidence_refs: EV-39-JIAHAO-07
- degraded_note: (none)


