# 42-report — 上游队列值守（sqlite dump 对照评估落文＋Scorecard/repomix 层需求拉动登记＋供应链象限披露核查）

> 票：#42 / R5-11｜A-xxx：A-047｜决定：spec.md §R5-D11；D-023（单上游探针/strangler fig）·D-034③（探针层需求拉动不插队＋供应链象限降级披露）·D-035③（dump 对照评估项/采纳须另立 ADR）；ADR-0014（双轨制/ACL）
> issue：`.scratch/architecture-recovery/issues/42-upstream-queue.md`；handoff：`handoffs/42-upstream-queue.md`；prompt：`prompts/42-upstream-queue.md`
> 阻塞状态：**None**（DoR 闭合——#35 首批契约面基线已落位并审计返修闭环）
> 核心产物：`reports/42-dump-comparison.md`（三轴对照评估＋呈报结论）、`reports/42-probe.mjs`＋`42-probe-measurements.json`＋六件只读档案、`reports/42-check.mjs`（43 断言）

## ① 开工复述

本票阻塞状态：**无阻塞**——#35（dump 对照基线=30 面契约）已 done 且经轮 8 独立审计 20/20 成立＋文书返修落地；Scorecard/repomix 探针属层需求触发器拉动（当前无层刚需=值守登记非接入）。

必读清单逐条已解析：issues/42（DoD 五条 checklist）、handoffs/42（完成定义五项＋通用调研要求）、prompts/42（专属 delta/验收/收尾硬要求）、spec.md §R5-D11（原文一行三子项）、next-round.md T13 行、A 账 A-047 行、macro-audit 账 D-023（2b 单上游/Scorecard·repomix 推阶段 3）·D-034③（探针不插队＋降级披露制）·D-035③（首批逐面契约/dump 对照评估/采纳另立 ADR/暂缓面集挂复审）、ADR-0014（双轨制/适配层禁放业务规则）、engine/src/upstream/codelore.ts（30 面契约＋LLM 面）、engine/test/fixtures/codelore/batch1/manifest.json（双通道计量）、35-facet-reconciliation.json（57 枚举＋暂缓 22＋残余 4）、35-analyze-help.txt（format 行实物）、engine/upstream-lock.yaml（sqlite-dump=evaluating/scorecard·repomix=planned）、engine/src/report/generate.ts（PreviewDisclosure/UNVERIFIED_MARK）、39-macro-b×3＋38-macro-c-preview×2（披露实物）、33-gate-registry.json（29 项/registry schema）、33/35/44-check.mjs（守卫先例）、CONTEXT.md（SSOT/事件溯源）、WORKFLOW.md §4.2。

## ② 调研（决策原文对账＋atomcode 深调研＋实物枚举）

**D-035③ 逐字对账**：「③ sqlite/parquet 全量 fact-store dump 立为对照评估项——首批仍走逐面契约（契约即文档、golden 可测），dump 若采纳须另立 ADR（适配层语义翻译面变厚）」——本票为该对照评估项的落文义务；D-034③「Scorecard/repomix 探针按层需求队列接入不插队」＋「供应链象限降级为 ⚠ 数据未接」；D-023「不因 2b 接入 CodeLore 而追加 Scorecard/repomix——strangler fig 逐项接入避免大爆炸」。

**atomcode 深调研（2026-09-16 本窗口可用，单轮串行）**：dump/内部存储导出 vs 契约面/API 消费纪律——6+ searches/6 篇原文核验，五先例：K8s etcd 直读 vs API server（仅 API server 有权触 etcd/绕过校验层）、Terraform tfstate vs `show -json`（「state 格式非公开集成接口」；需要全量数据时官方另造 JSON 契约而非扶正内部格式）、GitLab `gitlab_internal` vs REST/GraphQL（DB 直连=内部特权）、GH Archive（消费 API 输出快照非内部 schema）、CodeQL SARIF（标准交换面 vs 内部 database）。归纳五风险点：内部 schema 无版本承诺→golden 盲漂／绕过语义校验层／字段无对外语义标注→自维护翻译层逐版重验／快照无并发语义／官方不支持区。**与账本对账：零冲突零 revised**——调研结论与 D-035③「适配层语义翻译面变厚」同向且实证了完整量级。调研全文归约进 42-dump-comparison.md §4（含来源清单与信息缺口登记）。

**实物枚举（42-probe.mjs 只读，六命令零计算面零 --output）**：sqlite=`full fact-store dump`（ingest 层原始库导出，requires --output）／parquet=仅 hotspots·revisions·summary 3 面／内部 schema=`schema_v8 (facts/schema_v1.sql)` 不在 `codelore schema` 公开面（公开面=57 输出行类型 minimal envelope）／sqlite 内嵌 provenance 表·文件输出带 .provenance.json 侧车／DuckDB 1.10505.0·每仓 5 份 fact store 轮替／format 行与 #35 存档对账 **drift=none**。

**CONTEXT.md 回顾**：本产品自身即 SSOT＋事件溯源事实库（audit_fact append-only）——采纳上游内部 fact-store dump=在自有 SSOT 之上再叠一套异构内部 schema，语义归属层级错位（上游原料 vs 我方成品事实）。

## ③ 开源轮子/落地物

- `reports/42-dump-comparison.md`（新增）：三轴对照评估——轴①字段覆盖度（dump 对 30 面契约字段覆盖 0/30，层级错位：dump=ingest 原料层 vs 契约=分析产出层；parquet 3/57 子集）；轴②语义翻译面厚度（dump 须复刻 16 项上游语义入防腐层——mailmap/canonical-lineage/Fisher 门＋FDR/time-bucket/knowledge-model 等，结构性违反 ADR-0014）；轴③golden 可测性（dump 只能钉内部 schema_v8 非契约面，golden 降级为实现细节快照）；先例表＋**呈报结论=维持逐面契约路径不采纳为事实输入面**，采纳门=另立 ADR＋pin＋golden 回归不焊死，dump 合法域=诊断/调研原料不进 verdict 输入。
- `reports/42-probe.mjs`＋`42-probe-measurements.json`＋`42-{version,top-help,analyze-help,docs.md,schema.txt,profile.txt}`（新增）：只读枚举面实物档案（六命令 exit 全 0）。
- `engine/upstream-lock.yaml`：codelore-sqlite-dump 行 contract/risk_note 注记更新指向评估文档＋三轴裁定摘要；**status=evaluating 维持不翻**（呈报不代拍）；adapter=null 不变。
- `.scratch/architecture-recovery/reports/33-gate-registry.json`：新增 `upstream-probes-scorecard-repomix`（family=upstream-queue）——status=pending＋watch=manual_watch＋触发条件字段（deadline=满足判据含 pin/golden/lock 行锚三前置、trigger=层需求拉动＋不插队注记、review_at=各层 preview 前置）＋manual_watch 五要素（owner/verify_method/confirmations）；33-check 重跑 PASS 8/8 无回归（登记 29→30 项）。
- `reports/42-check.mjs`（新增）：43 断言七组（评估落文/probe 档案/锁表注记/registry 拉动字段/披露实物/文档账本/BOM）。

**engine 源码零改动**（新增=文档/守卫/档案；锁表/registry=数据注记）；upstream/ 层零改动（ADR-0014）；未接入任何新上游、未跑 dump 写副作用命令。

## ④ 完成定义 vs 实际

### 4.1 issue checklist 五条逐项

|| checklist | 落地 | 证据 |
|---|---|---|---|
| ① dump 对照评估落文（字段覆盖度/语义翻译面厚度/golden 可测性三轴 vs 逐面契约路径） | 42-dump-comparison.md §1-3 三轴表＋§0 实物枚举锚 | 42-check A1-A10＋B1-B7 |
| ② dump 采纳与否的呈报（采纳须另立 ADR——适配层语义翻译面变厚，D-035③） | 呈报=维持逐面契约不采纳为事实输入面；锁表注记更新；evaluating 不翻；ADR 权留用户 | 42-check A9/C1-C5 |
| ③ Scorecard/repomix 探针登记保持「层需求拉动」状态（含触发条件字段，衔接 #33 guard） | registry 新条目 pending＋manual_watch＋触发条件字段＋五要素；不插队 | 42-check D1-D6；33-check 8/8 |
| ④ Macro-B preview 报告供应链象限「⚠ 数据未接」披露在位核查 | 39×3 披露块＋supply_chain not_applicable＋data-not-connected 实物断言全中（38×2 同核查） | 42-check E1-E5 |
| ⑤ 守卫 reports/42-*.mjs PASS | 42-check PASS 43/43 exit 0 | ⑥ 证据行 |

### 4.2 handoff 完成定义补充项

|| 完成定义 | 实际 |
|---|---|---|
| npm test 不回归（本票零 engine 改动） | ⑥：全链绿（GEN-OK＋tsc 0 错＋SMOKE 6/6＋COLLECTORS 14/14＋ADAPTER 7/7＋BATCH1 41/41＋LLM 25/25＋REPORT-PREVIEW 5/5＋INTAKE 31/31＋DEMO 38/38）；package 54f；selftest 5/5 |
| 通用调研（atomcode＋ADR/CONTEXT 回顾＋≥2 工业先例） | ②：atomcode 单轮 6+ 搜/6 原文核验五先例；CONTEXT SSOT/ES 对账 |
| ledger/lessons/issue/next-round/BACKLOG/commit 引 A-047＋守卫结果 | 收口段＋42-check F1-F8 |

## ⑤ 卡死 3 连问＋决策对照

无卡死。**裁定 1——evaluating 状态翻不翻**：取不翻。首轮评估结论=维持契约不采纳，D-035③ 规定采纳才须另立 ADR；「evaluating」语义=对照评估轨道仍开放（未来层需求须原始粒度时可再评），翻 retired/planned 均失实——注记更新指向评估文档＋结论即可，不越权拍板。**裁定 2——registry 条目 watch 三态选型**：取 manual_watch（D-041 五要素齐备）。触发=层需求拉动属条件非事件（registry events 表无对应事件可绑；强绑 stage3-rollout 会制造伪 WARN），与 desk-task4/11 同型。**裁定 3——probe 边界**：只跑 stdout 枚举面（--version/--help/docs/schema/profile/analyze --help），不跑 `analyze --format sqlite --output`——dump 实跑会写文件＋触碰 fact-store 缓存=写副作用，且评估对象是「dump 面形态契约」非单份 dump 产物，help/docs/profile 枚举已给出全部契约级事实。

## ⑥ 断言式收尾清单（每条附可复跑证据）

|| 断言 | 证据 |
|---|---|---|
| dump 三轴对照评估落文＋呈报结论＋先例≥2＋实物枚举锚 | `node .scratch/architecture-recovery/reports/42-check.mjs` A1-A10 |
| probe 证据档案齐＋format 行跨票 drift=none | 42-check B1-B7；`node 42-probe.mjs` 可重跑 |
| 锁表 sqlite-dump=evaluating＋注记指评估文档＋pin/ADR 前置保留 | 42-check C1-C6 |
| registry 探针条目=pending＋manual_watch＋触发条件字段＋五要素 | 42-check D1-D6；`node 33-check.mjs` PASS 8/8（登记 30 项） |
| 供应链象限披露在位（39×3＋38×2＋generate.ts 语义源） | 42-check E1-E5 |
| 文档账本收口（issue done/账本 implemented/lessons/T13 ✅/BACKLOG ✅/日报窗口节/报告六段） | 42-check F1-F8 |
| engine 全链绿不回归 | `cd engine && npm test` → GEN-OK＋tsc 0 错＋SMOKE 6/6＋COLLECTORS 14/14＋ADAPTER 7/7＋BATCH1 41/41＋LLM 25/25＋REPORT-PREVIEW 5/5＋INTAKE 31/31＋DEMO 38/38；`npm run package` 54 files；`node dist/cli.js selftest` ok 5/5 |
| 守卫 PASS | `node .scratch/architecture-recovery/reports/42-check.mjs` → **PASS 43/43**，exit 0 |

## ⑦ 教训

1. **「dump vs 契约」先问数据层级再谈字段**：sqlite dump=ingest 原料层导出，契约面=分析产出层——对契约字段覆盖度天然为 0；若跳过热炒「全量」字眼先定层级，三轴里两轴（覆盖度/翻译厚度）答案即定。
2. **内部 schema 不是契约面**：`codelore schema` 公开目录=输出行类型（57），dump 的内部 schema_v8 不在公开面——golden 钉内部 schema=钉上游实现细节快照，审计口径锚定失效（Terraform「state 格式非公开接口」先例同型）。
3. **触发条件为「条件」时选手动 watch 而非强绑事件**：层需求拉动无单一事件可绑，manual_watch＋五要素（判据/责任人/复审时点/验证方法/确认留痕）既保 D-024 两字段纪律又防伪 WARN。
4. **「评估完不翻状态」也是诚实**：evaluating 行的评估义务=落文呈报，状态翻转权属 ADR 拍板——注记指向评估文档＋结论即可，值守票不把「评估完」误读为「可翻状态」。
