# MA-40-GSDCORE-MACRO-B-ONESHOT — Macro-B 首报（gsd-core@0d6bf19bf137）
> RECEIPT RCP-d4f119c5a2cac629 chain=d4f119c5a2cac629adc4620d68857037 content=f12b60b504106367 facts=1424 adjudications=6 issued_at=2026-09-15T15:53:42-04:00 commit=0d6bf19bf137af3b5ed248c01645c8356bac40b8 tree=9a285b05f65a
>
> 骨架 1.1.0（章顺序锁定，ADR-0006）· 裁定协议 ADR-0013-C/v1 · 生成于 2026-09-15T15:53:42-04:00
>
> 披露块（preview 标注诚实 = 决策本体，ADR-0017；机器可读字段见侧车 preview_disclosure）
> - capability: capability 1 of 5 · preview
> - calibration_scope: 外部公开仓 URL opt-in 泛化验证（open-gsd/gsd-core，非自有公开仓——D-013 首实用户）
> - structural_limitations: 单仓泛化证据：本报告为首个非自有仓 one-shot（n=1）——满足 D-033「≥1 外部仓」下限，不构成外部仓形态全覆盖；structure/behavior/supply_chain 象限 not_applicable：Macro-B 已上架采集面仅 strategy（S1+S2）；供应链象限 ⚠ 数据未接（D-034③）；TC-2 读数含 detector 漏认成分：gsd-core ADR 头部为「- **Field:**」（dash+加粗混排）形态，v2 回退链未覆盖——Status 缺失读数主要为漏认而非真实缺失（可归属原因候选，待 v3 腿预注册）；one-shot 度量 = 反复接受非跑通：TC 三档裁定（supported/unsupported/insufficient）如实落数，不为跑通而跑通
> - not_in_preview: Micro-A / Micro-B / Macro-A

## C1 执行摘要

- report_id: MA-40-GSDCORE-MACRO-B-ONESHOT
- schema_version: 1.1.0
- scale: Macro-B
- subject_ref: gsd-core@0d6bf19bf137
- generated_at: 2026-09-15T15:53:42-04:00
- correlation_key: trace_id=7b18cb1dd3470d53009e40636f48a130 baggage_id=36674a5d336b61e22a50e284c44ffccd
- overall_verdict: unsupported
- confidence: 0.6
- headline: gsd-core Macro-B one-shot（capability 1 of 5 · preview）：5887 commits / ADR 92 份 / facts 1424——TC-1 NOT_RED（n=92）、TC-2 RED（mean=0.7478）、TC-3 GREEN（0.8000）→ 综合裁定 unsupported（反复接受非跑通：三档如实落数）。
- degraded_mode: false
- stale_data_marker: fresh（SLA 5s / 实测延迟 0s）
- read_model_version: 1.1.0 · fact_watermark_version: 1
- top_findings: EV-40-GSDCORE-01, EV-40-GSDCORE-03, EV-40-GSDCORE-04
- fact_ids: 1424 条（清单见侧车 JSON）

## C2 四象限与裁决

### strategy（applicability=native）
- verdict: unsupported · score: n/a · confidence: 0.6
- dimensions: S1, S2
- slice_fields: {"s1_keyword_coverage_ratio":0.8,"s2_five_piece_mean_ratio":0.7478,"adr_count":92,"lag_judgeable_n":92,"intent_docs":2}
- conflict_markers: (none)
- verdict_gate: ADR-0013-C/v1 / unsupported / threshold_met=true / decided_at=2026-09-15T15:53:42-04:00 / audit_ref=reports/40-macro-b-one-shot.mjs

### structure（applicability=not_applicable）
- verdict: insufficient · score: n/a · confidence: 0
- dimensions: 
- slice_fields: {}
- conflict_markers: out-of-scope-stage1
- verdict_gate: ADR-0013-C/v1 / insufficient / threshold_met=false / decided_at=2026-09-15T15:53:42-04:00 / audit_ref=reports/40-macro-b-one-shot.mjs

### behavior（applicability=not_applicable）
- verdict: insufficient · score: n/a · confidence: 0
- dimensions: 
- slice_fields: {}
- conflict_markers: out-of-scope-stage1
- verdict_gate: ADR-0013-C/v1 / insufficient / threshold_met=false / decided_at=2026-09-15T15:53:42-04:00 / audit_ref=reports/40-macro-b-one-shot.mjs

### supply_chain（applicability=not_applicable）
- verdict: insufficient · score: n/a · confidence: 0
- dimensions: 
- slice_fields: {}
- conflict_markers: data-not-connected
- verdict_gate: ADR-0013-C/v1 / insufficient / threshold_met=false / decided_at=2026-09-15T15:53:42-04:00 / audit_ref=reports/40-macro-b-one-shot.mjs

#### 结构化裁决块（agent 可消费）
- protocol_version: ADR-0013-C/v1
- overall: unsupported · decided_at: 2026-09-15T15:53:42-04:00
- PC-1: supported | basis=B1 | facts=30498d24-2125-7dc9-fd39-29b1bbbc480d,91b96f9c-533a-e846-4aaf-3cb18e93acf1 | evidence=EV-40-GSDCORE-01 | adr-structure 与 positioning 两族均产出非空事实，golden ADR 五件套 5/5 且 supersede 链命中（gsd-core run 内管线活性正对照）
- PC-2: supported | basis=B1 | facts=e92dc314-e197-97aa-16d3-f8fcddacd8e2 | evidence=EV-40-GSDCORE-01 | gitlog 族检出事后补写 delta_days = 255
- TC-1: supported | basis=B2 | facts=20ad221e-90ac-e80b-4633-2738e712200f,da5292f3-652d-85db-413f-78e8fff9131c,472491dd-dde2-0ac2-0b28-b1fc7b93bfc3,8693cf20-ec26-4362-1059-8bc92bb9b51f,662a01b9-959a-1d03-7ab1-dfd6d6b4b2b9,e202a450-5b1c-fe01-516d-e6d1042a82ac,e39ee044-ecd8-94a8-1f47-33747690b42b,07b8bca7-eaa4-48e5-5390-460e62d60d8f,19393bb5-8e8f-fc52-8a82-c90bc93b4edf,936ed9f1-5f98-ceb6-1901-46e959ce9bd6,5c9a54b8-fa83-07ed-ba01-227456e8c793,1ddc7b2f-5334-ac57-7630-f03c20b92880,f3994091-ea76-2a75-b2f8-3b5b2cdcf19b,95d19a4b-d2b0-5119-5230-1ee7752c563d,1f85142b-f4c1-cc28-7e89-472eba19283f,eb34d0ca-0995-ed2c-dff3-065eefc4ba35,eb8b407c-b558-2014-7598-7f30a54d4672,dafe0a36-9ed3-ea0f-2729-6703517b739f,bf0a0b6d-d693-8c51-cb46-e0bf7a818adc,9fb81ea0-5e67-a5d9-7854-9d7b0d334979,eca15f84-9d66-cb7e-5c52-405cf3d95a52,b1e598ff-5a75-0c8c-186b-bca1cd7beb7a,9190ad85-3abe-01b5-3fa8-b216e51265b6,b18c3b8b-119d-17fd-8b39-046727ae8060,96fde456-490d-c812-1816-0777e0e6979e,7919586b-e55b-af31-c804-fd4137e2fa8e,884358a2-d8aa-9159-b386-1316fe0e07b2,0009a9cf-3f28-43ef-587b-e7fd71126f5a,d881be4b-b565-01ac-9b70-9cb18e6ff6be,28464b17-c278-ab0f-6cb4-35a3b23d4f07,bc326ef0-fecc-2439-c651-7509f547f9c0,f952ccf3-2789-45f0-4c2f-94d99aab399b,745b7514-19e7-6ffc-8189-64c5e5715576,c0c3a007-131d-ebcc-177f-47ac5240f54d,cfd4ee58-8c4b-cda2-36ff-d54c762a653e,4ab1a081-c533-de0f-3a6c-a8ea3d3482cc,780b63e0-b7a4-fc19-944d-8d029706c1da,2c315cc3-3772-0e8a-bfc6-c4dbd207829a,8518240b-b7f3-1987-abcf-8e0b0cc67e43,3597849a-e29a-ab3e-8ae1-a4562e358859,6aec9e1d-4654-f0ff-ef57-f19c55e78a31,38c5ce62-6968-fce5-3f34-326cb6b5bd19,b057574a-fff0-3e2d-8eaf-20c373914992,8933e2b6-3e5b-3c81-d538-b62bf792f92c,24c2c04e-2fbe-08be-a085-1f25c45818b6,ff2d537b-b237-d702-dda8-3dc2f2028d5c,f5f57f55-b894-8377-77fc-8e7ea474ae84,dfd9f4b3-4f6d-3c75-9fef-22ef1cbd24e3,3055e993-e326-36ea-8574-fafb52512755,0cc3764f-d7eb-d4fe-5740-e74c0e887d43,6fc6900e-2cc0-7020-cfed-eeed87d1e2b8,5188c991-c706-e015-d176-b4ea49fe20ba,241ace79-84e2-82b5-351c-a686187cbdd1,33c8b32b-78fe-8bd6-e0e4-50622e16b170,4a39eec0-0ead-0ac9-98e2-b64d10beae7a,c48bf356-7f75-d503-e45e-ee9cd5730540,856e2490-49e6-c89e-e6db-5d227beeda89,1eb9758b-431c-7211-b331-2dc97e2ba1ea,bfb20d94-37f0-8e95-d88b-f5a1f58016c3,53777582-c27c-d3e2-69fa-c356fbc6e9e4,f04899d7-aefe-c7c2-6770-1c107fd6ef9d,ff059b2d-762e-739f-cdf1-81abc82814f1,d3d33f8f-a15e-f50e-1e92-06410072da96,5be5234f-8b4f-0f13-0d2e-93dc6c52d646,13b45d7f-a535-ef03-3234-3c793a78fc01,e0cdb8ca-e719-5581-5887-b082e6c02144,fdb35029-8d22-252f-b1df-1645f06b59e5,27186141-7f3e-6019-a43e-ba67401b54b4,a3047ee6-5b54-55a7-beed-f4e4a9a57343,bd6e5c03-8db5-f783-d2c2-fca36eecb39c,5cc49d39-9d5c-fc3f-b114-95a404729714,e9f0a35c-e235-2ed7-17b6-06b3d4e2f0fc,14e42706-8648-b745-9d7f-b5fc161af079,ad5b3834-20f1-1e00-0349-dbeeb90598a0,60e2f6cc-19d6-855b-b1a8-791fed26e8cf,68ca81bc-8cbb-e914-7746-9fc6e0d429d1,932d37d4-ffef-15c3-4754-c7899333ff66,3e0b73f1-bfbb-f3a4-4348-e7cfde1e9843,39f88f7d-c2ba-6456-edcf-72030dde7bc9,8c0057f5-4058-1f4d-0408-7c8df2196418,7189753b-23f8-2e11-9aa2-9ae7f3ed9260,d04f66a2-311e-c9e7-dae4-6a63d9b218e0,ffce34cf-f2d5-2c2a-7a55-955bf740a2bb,9ee4738a-32c3-f1f9-0040-c9e201bb2fee,8302682e-d6ea-6f91-5031-fcefd8bce212,60e1bcbe-2525-e15d-aefc-512eb597707a,7832de70-701b-5297-eb9c-87225887f324,e32194e7-7242-36a1-2591-a788666e0082,8cea0eb4-a1d4-a55b-57a7-d28a78656131,2ff2b465-5395-af80-0529-c366d8e17df9,373e49d2-32b0-6296-30ae-7d30de8dabae,b4bac202-ef67-574b-066e-c3619d94ea17 | evidence=EV-40-GSDCORE-02 | gsd-core ADR 事后补写：可判定数 92（门槛 5），>90d 占比 0.0000，判 NOT_RED
- TC-2: unsupported | basis=B2 | facts=245362d0-8417-9f63-1855-e039b0518ab9,76546a90-f7a3-250a-1090-b6d2799dfcc7,878477d1-f89d-8bf1-16f8-9492bc7b54a4,e91bfe9c-c4e3-aaed-b0c3-43963585689d,32258cf7-75b9-121a-336d-0c5014039b79,017540ba-22dc-6b46-79ee-6197d5a69537,ab130cf0-62d5-711a-87e5-af26d3585f8d,3190775e-9fe5-c858-17f7-95fe761b3ccd,339ae59b-32b0-bf56-97cd-647fbb872047,aa3f5bd6-94b3-471e-79eb-5fc59271d874,391a0cde-229c-807c-21ff-05be639f7bb1,8f5a79f8-5262-e292-db57-06df04630b8b,d50492c3-41e3-7c54-e825-139cc8ecfee4,952ecece-28fa-54e5-87f1-7698d66023c2,0d3ff220-cb6a-6501-8910-5d61f9cc57f5,fd89e8c4-5315-cb21-4b09-00e0b39e9d6d,b515fc95-38e3-d811-b7b3-218f00f2e5db,063a2acd-731e-d1b3-a2fe-2aad90611a9f,7350595f-b73d-e89e-b9b4-9c8984b1829c,b8212933-0e26-a78c-dd84-cf6436a49667,7d274c65-6365-e2e5-4767-0056d3335d6e,fc48f718-bcfd-ff3d-8a68-e0991aa9adeb,061223ea-f080-bc32-1604-a5a1900a592c,cda05005-15fc-fda9-c346-5f90b94dc635,0a491268-1423-cae4-a2e9-96a87c213b99,a587efc4-d0b4-9add-2c60-f4370cf33881,b5a3ade6-3ff1-bf2b-fcb2-e1b873da041c,368ad0d8-3dfd-cec4-8ef7-8f55431fc625,6c15e36a-392b-a9f1-163d-6f9dfe7a0e54,ad60924f-76fc-aebb-2dba-212cdb495e97,1f23e699-42c4-9150-dea8-20b90912e701,e524f007-deda-318d-54bd-1c0fbdcb6e48,bebb3535-3277-376a-4c86-af1cd6248704,7ac8fd7e-9ba0-3814-ac57-c8a8e9d50b0a,936b8041-1393-c2d0-cb08-3230cf3ccc02,70087e18-d767-73a8-6933-2936fe0d661a,226aca6c-80aa-936d-09d6-fbdaf5dc9a0b,20fc20dd-fa12-e97b-89a3-7a2ef778d07c,3f3139f4-4587-ea54-3db2-f9bfcc63a02e,da63355f-6ea4-232c-4043-a7225575fe31,695ec2bc-3019-fe6e-1c46-46e789e556d0,ed38a635-947b-b069-fafa-01a173d26a0c,875b0d9c-66a1-4633-4250-0bf7a3f25e74,74071d89-e434-f4ef-4169-aaf489b2f8e4,8c778a94-ba7e-25e5-5740-bf8d36d2e5fb,1dd2a02f-62c2-90ef-9e41-821b399eb8d3,54dfb611-fd98-b261-c2ab-4e0fc018e8f9,3f2445b8-1080-22bf-9285-2a8ce7e3c6f0,3c08d008-6ef2-7d89-f5d5-fe116b25290d,d3a98ee8-b494-4412-6d13-28f3b51d288d,c2e9d282-7f5d-7262-c2fc-0956947bf921,429c976f-1fc4-fe18-9e82-6f4f6aee0c08,52a8ee4e-ca7f-1dd4-ae61-3a90b8bb7bd6,6fbf623d-11dc-ec0d-60d6-29c0108943de,e11518a0-9706-7ea7-e4f7-d91c86e0589a,34378f11-0110-6aea-a6c4-ec38f7248254,f8af676b-f61c-6de1-94b4-f86c64e4fc4d,09e5666a-6681-be95-a24c-215759f0d7e7,d648d13a-d4c7-8e72-b25f-3c6e4b43d2e5,3ccd35e8-fd43-8d40-3921-45c216dc615f,a9080f2e-5736-72b9-ae04-80d0007de2ac,c277570d-b844-d02c-b259-af5689c27924,1e2a0f10-2716-e360-807e-7a9537f9e7f1,63bdaafe-bf87-7a3c-4770-659c624cb092,cab33fa0-de7f-4435-04cc-c6c5f91e8dbe,8a4dee73-01dd-2998-f0cf-b313cfee3cda,63065ac8-1d2e-f611-21f3-7dedd9c9c49f,13a2e411-6ba0-cfe5-aecb-b58abbd2c224,64985f35-0e15-4158-d520-87d702318862,0480616b-6e3a-00d1-68e2-ed736f84677b,e8e7638f-34bd-530f-3e41-e876ff2820f3,e86613aa-b5ec-af63-7ae8-e37fa41712a2,74fa0bec-d38b-bd01-ebc0-53e6cd024e9e,4332ef33-2682-adac-468d-1d3223119e81,1499bc6d-de6c-8c2e-b3d7-9aceed1f1871,fe960d98-92af-b94b-1617-4bab9eb1d03f,64ac53c2-12c8-8449-4554-599da3445937,6d965e58-18a2-c17e-8614-a046a0663cb0,b8fd635b-f3c5-483f-e074-127aa967ee95,5d3ea780-0397-06c9-4ce8-5c6e8a226c37,18d05cc9-53c8-bd9d-219b-d289dbee9682,6ab780fc-5b42-73f4-43a9-e7a40ddb4282,09b0f4b4-2cf5-4acd-2cbd-5d4ba37faa48,c5a76d4d-283a-ac18-959b-fa2de51b86fc,eb9c7d1e-250a-a5dd-c240-55bbc2735c10,acca54cc-bc58-dc1a-4f5a-8fcf5149f3d0,0967ea86-f987-117c-0ad7-5cc7eee573ec,2729aab9-93b1-0010-85ca-e3b2ed828751,8f0bd92d-3a26-0792-3e5e-4f94c5be2b19,cca2fc20-1bc4-0622-4b41-33afe22662f9,ca36ecb4-4975-42ae-ef7f-692e9355c6f2,67290cc9-4ee3-bf97-b709-45b4512be77c | evidence=EV-40-GSDCORE-03 | gsd-core ADR 五件套：mean_ratio 0.7478（门槛 0.6），字段缺失率超线=true，判 RED
- TC-3: supported | basis=B2 | facts=34b1fa36-6c2d-47c5-623d-7c53fbff7ca9,b30c2cb6-8dd7-abdf-6938-7caa08df5507 | evidence=EV-40-GSDCORE-04 | gsd-core 定位覆盖：意图面 2 件最低 ratio 0.8000（README.md），判 GREEN
- NC-1: supported | basis=B4 | facts=6fdc0b10-4b79-8505-dad7-71e01669deaf | evidence=EV-40-GSDCORE-05 | 负对照选材 gsd-core/package.json 五件套 0 命中、supersede 0 命中（特异性成立）
- human_adjudication: pending（裁定仍由人做，见 B5）

## C3 证据

### EV-40-GSDCORE-01 — D:\Aworker\6F\.scratch\architecture-recovery\reports\.scratch\architecture-recovery\reports\40-out\40-macro-b-gsd-core-measurements.json @ L13
- claim: 本次实测：gsd-core Macro-B one-shot 采集事实数
- grounded: true · collected_at: 2026-09-15T15:53:42-04:00
- reproduce_cmd: node .scratch/architecture-recovery/reports/40-macro-b-one-shot.mjs --repo gsd-core --root D:\Aworker\6F\.scratch\architecture-recovery\reports\40-clone-cache\repos\f0b1eba9471ef4de
- 引文原文: "fact_count": 1424,

### EV-40-GSDCORE-02 — D:\Aworker\6F\.scratch\architecture-recovery\reports\.scratch\architecture-recovery\reports\40-out\40-macro-b-gsd-core-measurements.json @ L18
- claim: 本次实测：gsd-core TC-1 ADR 事后补写判据裁定（NOT_RED）
- grounded: true · collected_at: 2026-09-15T15:53:42-04:00
- reproduce_cmd: node .scratch/architecture-recovery/reports/40-macro-b-one-shot.mjs --repo gsd-core --root D:\Aworker\6F\.scratch\architecture-recovery\reports\40-clone-cache\repos\f0b1eba9471ef4de
- 引文原文: "verdict": "NOT_RED",

### EV-40-GSDCORE-03 — D:\Aworker\6F\.scratch\architecture-recovery\reports\.scratch\architecture-recovery\reports\40-out\40-macro-b-gsd-core-measurements.json @ L27
- claim: 本次实测：gsd-core TC-2 五件套完整度 mean_ratio
- grounded: true · collected_at: 2026-09-15T15:53:42-04:00
- reproduce_cmd: node .scratch/architecture-recovery/reports/40-macro-b-one-shot.mjs --repo gsd-core --root D:\Aworker\6F\.scratch\architecture-recovery\reports\40-clone-cache\repos\f0b1eba9471ef4de
- 引文原文: "mean_ratio_4": "0.7478",

### EV-40-GSDCORE-04 — D:\Aworker\6F\.scratch\architecture-recovery\reports\.scratch\architecture-recovery\reports\40-out\40-macro-b-gsd-core-measurements.json @ L66
- claim: 本次实测：gsd-core TC-3 定位覆盖率最低值
- grounded: true · collected_at: 2026-09-15T15:53:42-04:00
- reproduce_cmd: node .scratch/architecture-recovery/reports/40-macro-b-one-shot.mjs --repo gsd-core --root D:\Aworker\6F\.scratch\architecture-recovery\reports\40-clone-cache\repos\f0b1eba9471ef4de
- 引文原文: "lowest_ratio_4": "0.8000",

### EV-40-GSDCORE-05 — D:\Aworker\6F\.scratch\architecture-recovery\reports\.scratch\architecture-recovery\reports\40-out\40-macro-b-gsd-core-measurements.json @ L77
- claim: 本次实测：gsd-core NC-1 负对照选材五件套命中数（预期 0）
- grounded: true · collected_at: 2026-09-15T15:53:42-04:00
- reproduce_cmd: node .scratch/architecture-recovery/reports/40-macro-b-one-shot.mjs --repo gsd-core --root D:\Aworker\6F\.scratch\architecture-recovery\reports\40-clone-cache\repos\f0b1eba9471ef4de
- 引文原文: "five_piece_present": 0,

### EV-40-GSDCORE-06 — docs/adr/0001-dispatch-policy-module.md @ L1
- claim: gsd-core ADR 语料锚：docs/adr/0001-dispatch-policy-module.md 实物存在（语料 92 份）
- grounded: true · collected_at: 2026-09-15T15:53:42-04:00
- reproduce_cmd: git -C D:\Aworker\6F\.scratch\architecture-recovery\reports\40-clone-cache\repos\f0b1eba9471ef4de show HEAD:docs/adr/0001-dispatch-policy-module.md
- 引文原文: # Dispatch policy module as single seam for query execution outcomes

### EV-40-GSDCORE-07 — .scratch/macro-audit/decision-ledger.md @ L21
- claim: D-033：泛化验证必须引 ≥1 非自有公开仓（D-013 URL opt-in 首实用户）= Macro-B GA 前置条件
- grounded: true · collected_at: 2026-09-15T15:53:42-04:00
- reproduce_cmd: git -C D:\Aworker\6F show HEAD:.scratch/macro-audit/decision-ledger.md
- 引文原文: | D-033 | Q5（轮7）：#25-B4.2 与 jiahao / anysearch-cli / env-manager 三试点仓对接的产品方向与优先级？ | OK（2026-09-15，原话「OK」＝采纳推荐全项；基于 atomcode 取证：6 searches/7 全文核验，角色框架高置信、多仓排序法中置信=a16z design-partner 框架迁移；缺口：各仓 PR 人/机比与 supersede 链完整度未实测） | 对接方向=试点仓角色绑定能力层而非仓：① 角色分配=anysearch-cli→Macro-C 校准语料（56 ADR＋supersede 链稀缺素材）／env-manager→Micro-A 唯一合格试点＋泛化验证（唯一托管 PR 面，含 dependabot/release-please 非人类 PR 边缘形态）／jiahao→Micro-B·Macro-B 回归＋下限测试（纯本地仓测「git 健全无托管」下限）／三仓并跑→Macro-A 泛化冒烟（需≥2仓天然最后）；② 时序=Macro-B 已上架层立即对三仓各跑一次 one-shot 泛化验证，jiahao 挂 Macro-B 持续回归（阶段3 CI 票），其余层试点随各 preview 漏斗；③ 前置票=试点面可用性审计脚本（PR 人/机比、supersede 链完整度实测）；④ 拆票=可用性审计→Macro-B 三仓 one-shot→各层试点→回归接入，不立大票 | 结构性限制入规：三仓同主属确认偏差面（dogfooding=generative not evaluative，OCLint 官方口径只给信心不证泛化），试点定位=校准＋冒烟；泛化验证必须引≥1 非自有公开仓（D-013 URL opt-in 首实用户），登记为 Macro-B GA 前置条件；持续回归仅限已上架层；试点成功度量=反复接受非跑通；PR 层试点不得指派无托管 PR 面的仓（capacity 硬约束）；冲突核查 26 条 current 无 revised；执行时点=grill 定稿后整理环节；整理环节更新 #25-checklist B4.2 行=decided-now | current |

#### 引文→结论支持关系校验
- CL-40-GSDCORE-01 -> EV-40-GSDCORE-01: supports（matched=fact_count missing=）全部支撑锚在引文原文中逐字命中
- CL-40-GSDCORE-02 -> EV-40-GSDCORE-02: supports（matched=verdict missing=）全部支撑锚在引文原文中逐字命中
- CL-40-GSDCORE-03 -> EV-40-GSDCORE-03: supports（matched=mean_ratio_4 missing=）全部支撑锚在引文原文中逐字命中
- CL-40-GSDCORE-04 -> EV-40-GSDCORE-04: supports（matched=lowest_ratio_4 missing=）全部支撑锚在引文原文中逐字命中
- CL-40-GSDCORE-05 -> EV-40-GSDCORE-05: supports（matched=five_piece_present missing=）全部支撑锚在引文原文中逐字命中
- CL-40-GSDCORE-06 -> EV-40-GSDCORE-07: supports（matched=非自有公开仓 missing=）全部支撑锚在引文原文中逐字命中

## C4 行动建议

### R-40-GSDCORE-1 [P1] adr-structure v2 回退链补「- **Field:**」（dash+加粗）头部腿——本仓 Status 缺失读数主要为 detector 漏认（可归属原因候选），v3 腿须先预注册判据再改 detector（27-prereg 纪律，v2 禁改）
- rationale: gsd-core 92 份 ADR 头部统一为 dash+加粗形态，v2 四腿（dash/inline/inline-iso/git）未覆盖 → Status 缺失率主成分为漏认；外部仓泛化暴露的首个覆盖缺口
- expected_impact: TC-2 字段缺失读数区分「真缺失 vs 漏认」，跨仓可比性恢复 · effort: M
- verdict_gate_stamp: ADR-0013-C/v1 / unsupported
- evidence_refs: EV-40-GSDCORE-03
- degraded_note: (none)

### R-40-GSDCORE-2 [P2] first-external-repo 事件 occurred 落账：desk-task2 判据达成（TC-1 judgeable≥min_n 5）→ triggered-bound；desk-task15 判据属 Micro-A（未上架层）→ 值守通道呈报
- rationale: URL opt-in 首实用户落地（D-013），registry 绑定项按登记处置不静默
- expected_impact: Macro-B GA 前置条件达成；挂门值守状态机推进 · effort: S
- verdict_gate_stamp: ADR-0013-C/v1 / unsupported
- evidence_refs: EV-40-GSDCORE-07
- degraded_note: (none)


