# next-round — 轮 31 常驻任务书（轮 30 grill 封口·Micro-B 设计树 D-121~D-127 全定后）

> 生成：2026-09-23 轮 30 收口。上位账本=`D:AworkerF.scratchmacro-auditdecision-ledger.md`（D-001~D-127：118 current／8 revised=D-002/008/012/014/022/059①款/072/100③款／1 closed=D-019；D-101 行粘接格式伤本轮已修）；quarantine 总成=`docs/adr/0022-quarantine-engine.md`；**Micro-B 总成=`docs/adr/0023-micro-b-file-card-architecture.md`**；执行账=`.scratcharchitecture-recoverydecision-ledger.md`（A-001~A-089）；本任务书不复述账本全文，只排执行序与覆盖映射。

## 轮 25~30 留痕（已定，勿重复）

- 轮 25 grill 五裁（D-092~D-096）：6F 正名+六-F 宣言／波及面分层／断言失效三分类／枚举 open-closed／census-contract——调研报告存档 `.scratchmacro-auditeportsR25-Q{1..5}-*.md`。
- 轮 26 实施（A-088）：#74 门面 6F 化＋#76 engine-ci 红修三症四修全落，合入 main d207a0a，CI 分支 35677822036 六腿绿＋main 35681529820 绿——**engine-ci-main-green 事件已发生**。
- 轮 27 grill 五裁（D-098~D-102，四轮 atomcode 深调研）：致谢三层分工／品牌资产消费面驱动／契约违约两级处置（D-059① 收窄 revised 链）／A-B 双窗边界／xfail-45-h5 摘除追认。调研报告存档 `R27-Q{1,2,3,4,5}-*.md`。
- **轮 28 T1 交付（A-089）**：#77 门面收口包 A 窗五件全落——`engine/scripts/gen-acknowledgments.mjs` 生成器（per-id 人工模板×8 active／先比后写／--check）→README 双语「## Acknowledgments／致谢」生成式锚段（Honesty notes／诚实注记前）＋77-check 16/16＋engine-ci main badge 双文件挂载（native actions badge，非 shields 族）＋诚实注记措辞合法演化＋gh homepageUrl 补齐＋33-check H4 双向互等化／73-check D1 措辞演化；T0 连带=xfail-45-b5 stale 条目摘除＋meta 归因注记（D-102① 待追认）；台账=A-089＋CHANGELOG M-005＋BACKLOG #77 ✅；报告 `.scratchmacro-auditeports6-09-22-r28-exec-report.md`。
- **轮 28 grill 封口（2026-09-23）**：quarantine 引擎设计树 18 裁全定（D-103~D-120）＋收口对账节已落账本＋去向全归 #78（D-118 或拆独立小票待归票裁）。
- **轮 29 实施收口**：#78 quarantine 建制 LOOP-2 PASS（账本第三十轮节首行在案）——git 腿病态 %cI 处置链全绿后回主线。
- **轮 30 grill 封口（2026-09-23）**：Micro-B 文件级审计卡设计树 7 裁全定（D-121~D-127）——铺开序归位／预采集投影+CLI-only lazy 双通道／三层卡契约（kernel 数据+确定性派生+宿主叙事，禁 A-E）／per-file 一等事实（facet_rows 降 raw 证据层）／SCIP 规范化形+rename 血缘事实／at:sha+staleness 双字段+miss 四类／单票闭环票面；调研档案 `R30-Q{1..7}-*.md` 全存档；整理产物=**ADR-0023**＋**BACKLOG #80**＋CONTEXT 词条×4（Subject Canonical Form／File Lineage／Observation Set／Raw Evidence Layer）＋收口对账节。
- **xfail 摘除注记（7 条批，entries 6→0/10）**：①xfail-45-b5——B5 断言轮27 已按 D-094(b) 合法演化重写（结构化 import 断言＋codelore-off 显式钉），册内条目残留未摘→XPASS；②xfail-41a-d6/d7/f4＋43-d5＋39-h6＋40-g5 六条——任务书字面钉／CHANGELOG 区间钉漂移族（入册归因全在条目 attribution），本窗恢复字面锚实物（历史票面闭环索引＋M-005 编年行）后断言真实复绿→条目 stale。摘除＋归因入 meta.xpass_removal_2026_09_22_b5 与 meta.xpass_removal_2026_09_22_anchors——同 H5 形（D-102①），执行侧已落、人工追认侧待批。

## 历史票面闭环索引（守卫锚点留痕——任务书轮换不丢字面锚；字面钉族归 T3 普查处置）

- T6 分发收尾·仓内文档面（#41a/R6-03，filler 优先级）✅ DONE 2026-09-16
- T11 #39 mw-trigger 接线 ✅ DONE（39-check 38/38 在案）
- T14 #43 golden 重基线／frozen overlay 管线 ✅ DONE（43-check 28/28 在案）
- #40 gsd-core 实仓 opt-in 接入已闭环（40-check 57/57 在案）
- #45 demo 入口三 scenario 已闭环（45-check 51/51 在案；xfail-45-h5／xfail-45-b5 两摘除在案）

## 口径基线（读前必知）

- 门面现状：公开面全 `6F`＋「## Acknowledgments」生成式锚段（8 active 行=名字+角色句+上游主页链接，脚注指 lock 全集）＋徽标=license/version/node/marketplace/status-preview＋**engine-ci main badge 已挂载**；zh-CN 全镜像（sync 戳随生成器联动）。
- 双名分层（D-093）不变：品牌层 `6F`／kernel 技术标识 `macro-audit*` 保留。
- registry 53 项/36 事件；engine-ci-main-green→occurred:true；**readme-ci-badge 实物已挂载、status=pending 待 T10 值守翻 status**；readme-motion-gif 仍待 listing-material-freeze；两新触发器 pending。
- **Micro-B 设计锚**：ADR-0023 总成；#80=单票闭环票（内部三步 stacked-diff 各独立绿——合并与验收一票裁决）；双触发面=MCP tool 只读＋CLI audit file（lazy 补采唯一写通道）；subject=规范化 path 一级身份；file_renamed=血缘一等事实；卡=三层契约 advisory 结构性隔离；miss 四类显式态；观测集 append-only。
- macro-b-regression 调度跑 git 腿 GITCLI-OUTPUT-CONTRACT 硬崩=broken 类非门禁红——**已被 #78 收口消化（轮 29 LOOP-2 PASS），本条留档防回潮**；若复红按 D-101②③ 处置。
- 守卫基线全绿：33/44/45/70/71/72/73/77/xfail-run＋39/40/41a/43（任务书锚点留痕恢复后复绿；41a-D6/D7 经 CHANGELOG M-005 编年行修绿）。70-check census=63-assertion-inventory.json 机生面，改守卫源码后须 update-70-inventory.mjs regen。
- 写文件用 Node.js（ctx_execute/脚本），写后回读断言、禁 BOM；版本控制用 `but`，不 push 除非用户明示。
- **工具链避雷（r28 审计实录）**：ctx 沙箱 bash 会给孙子进程注入 `NODE_OPTIONS=--require cm-fs-preload-*.js` 污染 stderr——audit.test S3–S5 假 FAIL 实证；跑宿主级测试先 `env -u NODE_OPTIONS`（或在 ctx 外 shell 跑）。
- 报告命名纪律（F-02 返修入规）：`{date}-r{NN}-exec-report.md`=执行侧／`{date}-r{NN}-audit-report.md`=审计侧——裸 `{date}-report.md` 同日撞名风险高，勿用。

## 任务序列

| T | 任务 | 覆盖 D | 交付物 | suggested skills |
|---|---|---|---|---|
| T0 | 开工前置：读本任务书＋账本第三十轮节（D-121~D-127）＋ADR-0023＋R30-Q* 调研报告按需；跑守卫基线（33/44/70/71/72/73/77/xfail-run 等）确认全绿 | D-121~D-127 | 基线快照 | — |
| T1 | **#80 步① 发射改造+fixture golden**：a) subject 规范化形实现（SCIP 五规则+NFC 适配层显式归一+禁大小写折叠+case-only 冲突检测告警+symlink 细则）——归一单点在发射边界；b) per-file 一等事实发射管线（subject_ref=<规范化 path>，value_json 形态票面裁=per-path-face 行对象优先〔SonarQube per-component JSON_VALUE 先例〕）；c) file_renamed 血缘事实发射（{from,to,head_sha,threshold,detector_version} 参数入载荷可复算；跨 git 版本可复算性实测=票面验证项）；d) facet_rows 降 raw 证据位（append-only 保留+role 标记机制票面裁+不退化删除）；e) Macro-B behavior 消费面迁移（读源改 per-file 聚合 or 续读 raw 层——票面裁）＋对照期对账判据=「聚合载荷↔per-file 重算可对账」（BbA 双实现先例）；f) fixture golden=发射产出骨架锁（字段骨架非内容值）＋D-038 fixture 体系接入 | D-124 / D-125 / D-038 | 发射管线+规范化器+血缘事实+消费面迁移+对账判据+golden | implement / tdd / diagnosing-bugs |
| T2 | **#80 步② 投影+查询语义**（依赖 T1）：a) 文件卡 read-model 投影（kernel 数据层逐字段直投+citation 锚 obs_at/fact_ref）；b) kernel 派生层确定性值（priority_band 带规则版本号如 hotspot_priority_v1／percentile_rank scope=repo／top_n_flag，derivation 溯源字段；**禁 A-E/GPA 形态**）；c) advisory 结构性隔离（schema 无 verdict/gate-consumable 字段+advisory:true+priority=排序非判定+规则版本随卡）；d) 失败三态（new_file/insufficient_history 显式态仅静态指标／binary/generated→card_type:not_applicable 不出空卡）；e) miss 四类显式态（never_collected/not_tracked_at_sha/not_applicable/renamed_to——血缘存在→跳转+逐请求重验证，无血缘→降级 not_tracked）；f) at:<sha> pin（常量禁自动派生）＋staleness 双字段（observed_head_sha+current_head_sha/drift）照答不拒答＋双引用层纪律（path/血缘按查询时点解析、事实按 pinned sha 取）；g) 宿主叙事层接口=citation 校验验指标键存在性+零指标值纪律（叙事只引用 kernel 已算值）；h) MCP 文件卡 tool（只读 miss→not_collected+CLI 指引）＋CLI audit file 子命令骨架（lazy 补采=同构发射管线调用；资格=目标 SHA 对象库可达；脏工作区零感知）——签名/命令形态票面裁 | D-122 / D-123 / D-126 | 投影+派生层+miss 状态机+双通道骨架 | implement / tdd |
| T3 | **#80 步③ 双仓实跑+边界件+披露**（依赖 T2）：a) 试点=jiahao（人类密集）＋env-manager（历史厚+机器密集）形态三角两角；anysearch-cli 校准对照位可选；票面写「试点集」禁写「覆盖面」；b) 边界件 0-switch 逐类点名（miss 四类+insufficient_history 每类≥1 实物件）＋renamed_to 1-switch 成对件（miss→renamed_to→跳转命中/二次 miss 链）；c) benchmark=p95 分仓规模分档+target/danger 双阈值（沿用 r12-wave-a 语法）＋机器可裁决三件套（阈值+脚本+原始数工件）——数值实跑测定票面预登记；d) 披露四件套：preview 标注（capability N of 5）＋advisory 性质＋同主确认偏差＋not_in_preview 清单；e) 能力矩阵措辞收窄同票（D-054② 纪律）；f) 验收=三步全绿+双仓卡实物+边界件册+benchmark 工件+披露件齐 | D-127 / D-122⑤ / D-054② | 试点报告+边界件册+benchmark 工件+披露件 | implement / tdd / diagnosing-bugs |
| T4 | **#75 批1 失效三分类建制**（沿用）：字面钉普查 pass（日期字面量/魔数地板/裸 occurred===→归因注记；45-h5 松散「|| demo」分支=已登记的松钉 findings 样本处置）＋剥注释名检通用化＋presence/liveness/readiness 三层命名＋XFAIL 册明文只收合法漂移类＋断言无牙族纪律（|| 便利分支=无牙，mutation 检验标准） | D-094 / D-102③ / D-079 / D-071 | 普查 pass+册规补丁 | implement / tdd |
| T5 | **#75 批2 枚举 open-closed**（沿用）：枚举面 open/closed 声明＋closed 面成员级双向差集 lint（explain 9 面/遥测排除首案；D-098 致谢节成 closed 面第二案先例；**D-123 指标集 closed 契约=第三案候选**）＋常量 SSOT＋preflight 逐条裁＋reserved 机制仅外部输入面 | D-095 / D-081 / D-098② / D-123⑥ | open-closed 声明集+lint | implement |
| T6 | **#75 批3 census-contract**（沿用）：63 清单头契约块（字段 schema 归一+五豁免正反例对）＋70-check 互等裁决断言＋契约变更 PR 门控＋70/vacuity 共用规格 | D-096 / D-037 | 契约块+E2 断言 | implement / domain-modeling |
| T7 | **#79 NOTICE 承接合规核查**（随 #75 排产）：8 个 active 上游逐个核查 NOTICE 文件存在性（Apache-2.0 §4(d) 承接义务）→承接面选型（仓根 NOTICE/THIRD-PARTY-NOTICES）；核查未完不宣称闭环 | D-098⑦ / ADR-0021 | 逐上游核查表+承接文件（如需） | — |
| T8 | **judgement/观察项批**（沿用）：R22 §C 残留＋R24 新增三件（EN 中文钉串双语契约注记／73-check D 组票面外扩登记／en-slug 裸锚读者面成本） | R22 §C / R23-R24 留票面 | 逐项处置登记 | — |
| T9 | **真机 MCP 面分层验收＋M2 lane 残影裁定**（沿用；#80 步② MCP tool 落地后可并入真机验收面） | R21/R22 Remaining / D-122② | 验收报告＋裁定行 | — |
| T10 | **触发器待绑项**：rubric 权重立案（quadrant-rubric-params-draft 不提前开工）＋#52b 待命＋#41b 残余（B 轨不授权；B 轨提交若定义 icon 字段=official-catalog-icon-required 事件发生→D-099⑥ 派生）＋**R28-Q19 完整性复核债（D-121⑤ 挂账不丢）** | D-084④ / D-061 / D-042 / D-099③ / D-121⑤ | 登记行 | domain-modeling |
| T11 | 值守面复核：registry 53 项——readme-ci-badge（挂载后翻 status）／readme-motion-gif（仍待 freeze）／两新触发器（official-catalog-icon-required/docs-site-deployed）／github-rest-review-coverage-dimension／xfail-second-track(#65)／promotion-watch／duckdb 三复审／D-076 四触发器／暂缓面集 | D-041 / D-076 / D-081 / D-089 / D-099 | registry confirmations/翻转 | — |
| T12 | **post-merge 链尾**：social-card.png 所有者 web-UI 手动上传（D-091 授权内最后一步）→BACKLOG #73 闭环登记 | D-091 | 上传回执+闭环注记 | — |
| T13 | D-025 勘误双读数纪律：实测/账本双口径并存呈报 | D-025 | 报告口径 | — |

## Suggested skills（本窗口）

- **implement / tdd**：T1~T3（#80 三步）主驱动——发射改造/投影语义/试点验收各独立绿；
- **diagnosing-bugs**：T1 血缘检测跨版本可复算性实测＋T3 边界件 miss 状态机验收；
- **domain-modeling**：T5 枚举 open-closed 建制（D-123 指标集 closed 第三案候选）＋T10 权重立案（若触发）＋CONTEXT 新词同步；
- **atomcode-research**：新决策题调研入口（沿用规程：题面存档→-p 深调研→辩证呈报→冲突即停标 revised）；
- **gitbutler**：VC 唯一写面——本任务书已 commit 防丢；后续 push/merge 逐次闸门；
- **handoff**：下轮收口同规程再生。

## 窗口边界纪律（D-101 精神沿用）

- #80 内部三步为同一票 stacked-diff——每步独立绿但合并与验收一票裁决；步间顺序=T1→T2→T3 硬依赖（投影依赖发射、试点依赖投影）；
- #80 与 #75 建制批并行不混窗（行为变更 vs 守卫纪律建制=两主题）；
- 退路 C 在案：若工期强制收窄→infra 先行票以 D-038 fixture golden 为判据+两票间 schema 冻结点显式立法——须先立裁再动（D-127⑦）。

## 用户闸门（勿越）

- push/merge：逐次授权；栈上未 push 分支按 but status 实态管理；
- social-card.png 上传=所有者 web-UI 手动操作（agent 不可代行）；
- B 轨官方目录提交不授权不触碰（D-042 收窄义在案）；
- benchmark 数值阈值=实跑测定后票面预登记，禁先写死再跑（D-127④）。
