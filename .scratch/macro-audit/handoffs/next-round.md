# next-round — 轮 33 常驻任务书（轮 32 grill 封口·R32 审计残余六裁 D-134~D-139 全定后）

> 生成：2026-09-25 轮 32 收口。上位账本=`D:\Aworker\6F\.scratch\macro-audit\decision-ledger.md`（D-001~D-139：**129 current**／9 revised＝D-002/008/012/014/022/059①款/072/100②款/100③款／1 closed=D-019；本轮 scoped 注记三处——D-123⑤「仅静态指标」读法澄清/D-125 F10 归口登记/D-128⑤「跨宿主稳定」披露定界，status 全仍 current）；quarantine 总成=`docs/adr/0022-quarantine-engine.md`；Micro-B 总成=`docs/adr/0023-micro-b-file-card-architecture.md`；执行账=`.scratch\architecture-recovery\decision-ledger.md`；本任务书不复述账本全文，只排执行序与覆盖映射。

## 轮 25~32 留痕（已定，勿重复）

- 轮 25 grill 五裁（D-092~D-096）：6F 正名+六-F 宣言／波及面分层／断言失效三分类／枚举 open-closed／census-contract——调研报告存档 `.scratch\macro-audit\reports\R25-Q{1..5}-*.md`。
- 轮 26 实施（A-088）：#74 门面 6F 化＋#76 engine-ci 红修三症四修全落，合入 main d207a0a——**engine-ci-main-green 事件已发生**。
- 轮 27 grill 五裁（D-098~D-102）：致谢三层分工／品牌资产消费面驱动／契约违约两级处置（D-059① 收窄 revised 链）／A-B 双窗边界／xfail-45-h5 摘除追认。
- **轮 28 T1 交付（A-089）**：#77 门面收口包 A 窗五件全落；报告 `2026-09-22-r28-exec-report.md`。
- **轮 28 grill 封口**：quarantine 引擎设计树 18 裁全定（D-103~D-120）＋去向全归 #78。
- **轮 29 实施收口**：#78 quarantine 建制 LOOP-2 PASS——git 腿病态 %cI 处置链全绿。
- **轮 30 grill 封口**：Micro-B 设计树 7 裁全定（D-121~D-127）＋ADR-0023＋BACKLOG #80＋CONTEXT 词条×4；调研 `R30-Q{1..7}-*.md` 全存档。
- **轮 30 实施**：#80 步① 发射改造落地——per-file 一等事实发射+file_renamed 血缘+facet_rows 降 raw 证据位+emission-skeleton golden。
- **轮 31 grill 封口（2026-09-24）**：第三轮锐评辩证处置 6 裁（D-128~D-133）；整理产物=BACKLOG #81（缺陷票）＋#82（仓务批）＋CONTEXT 词条×3＋收口对账节；**R31-Q6 调研 partial——resume 句柄 a324fdd2-738e-4a71-b220-065c362e2d71 留档**（D-133④ waived-research 先例）。
- **轮 32 实施+审计收口（2026-09-24）**：栈 rly→vpq→yyu→mkq→mkr→uym→rny 七提交 land origin/main——#81 方言归一＋#82 仓务批＋#80 步② 投影+查询语义全落地；审计窗 F1-F4 必修闭环（82-check 真空断言修复/trigger 绑定/lazy 补采事务包装/MCP 指引修），LOOP 复核通过；报告 `2026-09-24-r32-exec-report.md`／`2026-09-24-r32-audit-report.md`／`2026-09-24-r32-audit-loop-closeout.md`。
- **轮 32 grill 封口（2026-09-25）**：R32 审计残余六面裁毕（D-134~D-139）——F7g 吞错收窄归 #83①／建议修批单票 #83 步③前落／失败态投影收口（D-123⑤ 读法定界）／血缘缝合归 #80 步③扩枚举／golden 再生不可证→first-non-z-dialect-host 触发器／V1~V4 过程违规追认（AGENTS 负向行+format-piggyback-recurrence 触发器）；调研档案 `R32-Q{1,3,4,5,6}-*.md` 全存档（Q2 用户直选）；整理产物=CONTEXT 轮32 封口行＋Suppressed Facets 词条＋File Lineage 锐化＋BACKLOG #83＋#80 步③扩枚举＋registry 两条目＋AGENTS 负向行＋收口对账节。
- xfail 摘除注记（7 条批）：xfail-45-b5＋41a-d6/d7/f4＋43-d5＋39-h6＋40-g5 摘除+归因入 meta.xpass_removal_*——执行侧已落、人工追认侧待批。

## 历史票面闭环索引（守卫锚点留痕）

- T6 分发收尾·仓内文档面（#41a/R6-03）✅ DONE 2026-09-16
- T11 #39 mw-trigger 接线 ✅ DONE（39-check 38/38）
- T14 #43 golden 重基线／frozen overlay 管线 ✅ DONE（43-check 28/28）
- #40 gsd-core 实仓 opt-in 接入 ✅（40-check 57/57）
- #45 demo 入口三 scenario ✅（45-check 51/51；xfail-45-h5／xfail-45-b5 摘除在案）
- **#81 quarantine 方言归一 ✅**（轮32 实施窗：边界吸收器+collection_environment 披露块+dialect-boundary.test.mjs 回归册）
- **#82 仓务批 ✅**（gen-adr-index 生成式索引+dist 棘轮断言+first-external-contributor 触发器+#80 票面勘误两处）
- **#80 步② 投影+查询 ✅**（三层卡契约+miss 四类+renamed_to+at:sha pin+staleness+lazy 补采）

## 口径基线（读前必知）

- 门面现状：公开面全 `6F`＋「## Acknowledgments」生成式锚段＋徽标族＋engine-ci main badge；zh-CN 全镜像。
- 双名分层（D-093）不变：品牌层 `6F`／kernel 技术标识 `macro-audit*` 保留。
- registry **57 项/40 事件**；readme-ci-badge 实物已挂载 status=pending 待值守翻 status；本轮新增两条 deferred event_bound——`81-first-non-z-dialect-host`（首遇非 Z 方言宿主→golden 再生+差集工件）与 `89-format-piggyback-recurrence`（格式化搭车复发→升级守卫）。
- **失败态投影收口（D-136）**：new_file/insufficient_history 卡面滤除历史派生族（entity-churn/entity-ownership/code-age/hotspots/coupling）＋suppressed_facets closed 枚举带原因码；raw 层 append-only 不动。
- **血缘缝合（D-137）**：卡投影沿 file_renamed 链把旧名 era 事实并入新名卡——归 #80 步③票面，子项=多跳链遍历/环检测/跨观测集解析（沿查询时点观测集及祖先观测集）。
- **吞错收窄（D-134）**：file-card lazy 补采 constraint 类吞错仅限 fact_id UNIQUE 撞键——其余上抛回滚（D-115① fail-fast 语义归位）。
- **Golden 锁面（D-132）**：「骨架」=字段键集＋语义不变量定点值；「内容值」=数据行载荷禁锁。
- **fixture 落点判据（D-131）**：谁消费它——对外契约面→`engine/fixtures/golden`＋manifest；测试断言件→`engine/test/fixtures/<domain>/`自管。
- macro-b-regression git 腿红=已被 #78 收口消化（留档防回潮）；若复红按 D-101②③ 处置。
- 守卫基线全绿：33/44/45/70/71/72/73/77/78/80/82/xfail-run＋39/40/41a/43；70-check census 机生面改守卫后须 regen。
- 写文件用 Node.js（ctx_execute/脚本），写后回读断言、禁 BOM＋**保尾行**；**格式化-only/机械重缩进禁搭车语义提交**（独立 format commit 先行，D-139②）；版本控制用 `but`，不 push 除非用户明示。
- **工具链避雷**：ctx 沙箱 bash 注入 NODE_OPTIONS 污染 stderr——宿主级测试先 `env -u NODE_OPTIONS`。
- 报告命名纪律：`{date}-r{NN}-exec-report.md`=执行侧／`-audit-report.md`=审计侧——裸 `{date}-report.md` 勿用。

## 任务序列

| T | 任务 | 覆盖 D | 交付物 | suggested skills |
|---|---|---|---|---|
| T0 | 开工前置：读本任务书＋账本第三十二轮节（D-134~D-139）＋ADR-0023＋R32 审计报告 §5/§6＋R32-Q* 调研报告按需；跑守卫基线确认全绿 | D-134~D-139 | 基线快照 | — |
| T1 | **#83 R32 审计建议修批**（先行，#80 步③前落）：a) **必修收窄**——file-card lazy 补采 constraint 吞错收窄=仅 fact_id UNIQUE 精确指认（`Constraint Error`+约束名或写循环前预查已存 fact_id 集），余者上抛→事务回滚＋emitted/skipped 披露计数＋毒事实回归断言＋DuckDB 消息形态钉＋实物验证（@duckdb/node-api 错误对象探察+facts.duckdb 违例扫描）；b) **契约符合性**——F5 MCP 缺库→结构化 never_collected 卡非 isError 文本＋F6 集内 not_tracked_at_sha 补 available_head_shas＋**D-136 失败态投影收口**（历史派生族滤出卡面+suppressed_facets closed 枚举带原因码+derived.suppressed_by 保留+raw 不动）；c) **正确性边件**——F7a pin ≥7 前缀歧义验重；d) **卫生组末节**——F7c~f/h/i/j（headShaOf 去重/头注/死引用/unused import/CAP 截断标记/BOM 钉面/update-artifact 收窄） | D-134 / D-135 / D-136 | 吞错收窄+miss 契约补齐+失败态收口+卫生组 | implement / tdd / diagnosing-bugs |
| T2 | **#80 步③ 双仓实跑+边界件+披露**（依赖 T1）：a) 试点=jiahao＋env-manager 形态三角两角（anysearch-cli 校准对照可选）；票面写「试点集」禁「覆盖面」；b) **血缘缝合显式枚举**（D-137）——卡投影沿 file_renamed 链把旧名 era 事实并入新名卡：批内子项=多跳链遍历（显式图遍历非单路径 follow）／环检测／跨观测集解析（沿查询时点观测集及祖先观测集，沿用 at:sha 引用层纪律）——任一子项可独立验收，实测超载→升级独立票凭实测再裁；c) 边界件 0-switch 逐类点名+renamed_to 1-switch 成对件**双端验证**（miss→renamed_to 条件跳转＋新名卡缝合旧名历史）；d) benchmark=p95 分档+target/danger 双阈值+机器可裁决三件套——数值实跑测定票面预登记；e) 披露四件套+not_in_preview 清单；f) 能力矩阵措辞收窄同票 | D-127 / D-122⑤ / D-054② / D-137 / D-136 | 缝合实现+试点报告+边界件册+benchmark 工件+披露件 | implement / tdd / diagnosing-bugs |
| T3 | **#75 批1 失效三分类建制**（沿用）：字面钉普查 pass＋剥注释名检通用化＋presence/liveness/readiness 三层命名＋XFAIL 册明文只收合法漂移类＋断言无牙族纪律 | D-094 / D-102③ / D-079 / D-071 | 普查 pass+册规补丁 | implement / tdd |
| T4 | **#75 批2 枚举 open-closed**（沿用）：枚举面 open/closed 声明＋closed 面成员级双向差集 lint＋常量 SSOT＋preflight 逐条裁＋reserved 仅外部输入面 | D-095 / D-081 / D-098② / D-123⑥ | open-closed 声明集+lint | implement |
| T5 | **#75 批3 census-contract**（沿用）：63 清单头契约块＋70-check 互等裁决断言＋契约变更 PR 门控＋70/vacuity 共用规格 | D-096 / D-037 | 契约块+E2 断言 | implement / domain-modeling |
| T6 | **#79 NOTICE 承接合规核查**（随 #75 排产）：8 个 active 上游逐个核查 NOTICE 存在性→承接面选型；核查未完不宣称闭环 | D-098⑦ / ADR-0021 | 逐上游核查表 | — |
| T7 | **judgement/观察项批**（沿用）：R22 §C 残留＋R24 新增三件 | R22 §C / R23-R24 留票面 | 逐项处置登记 | — |
| T8 | **真机 MCP 面分层验收＋M2 lane 残影裁定**（沿用；#83 F5/F6 修复后 MCP miss 契约面才真正可验） | R21/R22 Remaining / D-122② | 验收报告＋裁定行 | — |
| T9 | **触发器待绑项**：rubric 权重立案（quadrant-rubric-params-draft 不提前开工）＋#52b 待命＋#41b 残余（B 轨不授权）＋**R28-Q19 完整性复核债（D-121⑤ 挂账不丢）**＋**34-guard→#43 golden 基线候选 v2 知悉 D-132 锁面定义（注记传递）** | D-084④ / D-061 / D-042 / D-099③ / D-121⑤ / D-132⑤ | 登记行 | domain-modeling |
| T10 | 值守面复核：registry **57 项/40 事件**——readme-ci-badge／readme-motion-gif／first-external-contributor／**81-first-non-z-dialect-host**／**89-format-piggyback-recurrence**／github-rest-review-coverage-dimension／xfail-second-track(#65)／promotion-watch／duckdb 三复审／D-076 四触发器／暂缓面集 | D-041 / D-076 / D-081 / D-089 / D-099 / D-129 / D-138 / D-139 | registry confirmations/翻转 | — |
| T11 | **post-merge 链尾**：social-card.png 所有者 web-UI 手动上传→BACKLOG #73 闭环登记 | D-091 | 上传回执+闭环注记 | — |
| T12 | D-025 勘误双读数纪律：实测/账本双口径并存呈报 | D-025 | 报告口径 | — |
| T13 | **R31-Q6 调研补完（可选）**：atomcode 复位后 `--resume a324fdd2-738e-4a71-b220-065c362e2d71` 补出成文报告归档——D-133 已拍板不因补档改向 | D-133④ | 报告归档 | atomcode-research |

## Suggested skills（本窗口）

- **implement / tdd**：T1（#83 修批）/T2（#80 步③缝合+实跑）主驱动；
- **diagnosing-bugs**：T1 吞错收窄毒事实回归＋T2 血缘缝合多跳/环边界件验收；
- **domain-modeling**：T4 枚举建制＋CONTEXT 新词同步（Suppressed Facets 已落可参照形制）；
- **atomcode-research**：新决策题调研入口＋T13 resume 补档（题面存档→-p 深调研→辩证呈报→冲突即停标 revised）；
- **gitbutler**：VC 唯一写面——本任务书已 commit 防丢；后续 push/merge 逐次闸门；
- **handoff**：下轮收口同规程再生。

## 窗口边界纪律（D-101 精神沿用）

- **#83 先行**（D-135③）：步③边界件逐类点名 miss 四类实物形态——F5/F6 不修则试点数据带已知契约缺口跑；
- #80 内部三步为同一票 stacked-diff——每步独立绿但合并与验收一票裁决；步③依赖步②已落地＋#83 修批清零 miss 契约缺口；
- 缝合实现与验证同票（D-137）：1-switch 成对件双端验证预设缝合语义——拆票=一个行为两半切两票违垂直切片纪律；实测超载升级路径已登记；
- 退路 C 在案（D-127⑦）：工期强制收窄→infra 先行票以 D-038 fixture golden 为判据+schema 冻结点立法——须先立裁再动。

## 用户闸门（勿越）

- push/merge：逐次授权；栈上未 push 分支按 but status 实态管理；
- social-card.png 上传=所有者 web-UI 手动操作（agent 不可代行）；
- B 轨官方目录提交不授权不触碰（D-042 收窄义在案）；
- benchmark 数值阈值=实跑测定后票面预登记，禁先写死再跑（D-127④）；
- #81 方言披露面禁入 Intake Health 统计/golden 字节比对面/⚠ 印记（D-128④ 硬边界）；
- suppressed_facets=closed 枚举禁逐卡临场裁量（D-136②）；degraded 数值标记=禁（无值可引优于标记值可引——D-136 负向）。
