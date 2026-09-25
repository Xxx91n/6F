# CHANGELOG — 仓级里程碑·决策编年

> 本账 = 仓级里程碑/决策编年（指针制，ADR-0018 §Decision-2 / D-039②）：条目只引用 ADR / 执行账 / 账本节，不复述内容、不作索引式复制。
> 产品版本变更（capability 范围声明 / BREAKING·CHANGE / upstream-lock diff / report_schema 版本）以 [engine/CHANGELOG.md](engine/CHANGELOG.md) 为唯一权威（Keep-a-Changelog）。
> 条目键 = `## [M-xxx] - ISO日期`，**禁版本号头**；条目 = 机器可解析固定字段行（milestone / adr_range / a_range / ledger_pointer / impact），里程碑 ID 与日期单调递增。

## [M-001] - 2026-09-15

- milestone: spec/decision 阶段封口——grill 轮 1~7 决策全量拍板（macro-audit 账本 D-001~D-041），spec 层 18 票闭环（17 done + 1 deferred），阶段 3 执行轮票据包立案（R5/R6）
- adr_range: ADR-0001 ~ ADR-0018（docs/adr/ 实物 18 件，含 ADR-0002/ADR-0010 superseded 状态如实计——区间写时实物读出）
- a_range: A-001 ~ A-053（.scratch/architecture-recovery/decision-ledger.md 实物唯一编号区间，写时实物读出——含 R6 票据包立案行）
- ledger_pointer: .scratch/macro-audit/decision-ledger.md（D-001~D-041）＋ .scratch/architecture-recovery/decision-ledger.md（A-001~A-053，R5 段 A-037~A-048 / R6 段 A-049~A-053）
- impact: 决策与 spec 阶段产物全量落盘可机检，工程执行阶段进行中；本编年实体随 #41a（A-051）落盘，产品能力边界见 README「能力边界（preview 标注）」节

## [M-002] - 2026-09-16

- milestone: 轮 8 W14 收口裁决包落盘——macro-audit 账本 D-042~D-047 六项 frontier 全拍（上架授权收窄／多写者域终裁／挂门重绑勘误／残余面分流／回归 CI 归属反转／Micro-A 试点集）；阶段 3 票据包新增 #46
- adr_range: ADR-0019 ~ ADR-0019（多写者域终裁；docs/adr/ 实物 19 件，含 ADR-0002/ADR-0010 superseded 状态如实计——区间写时实物读出）
- a_range: 无新增（沿 M-001 区间 A-001 ~ A-053）
- ledger_pointer: .scratch/macro-audit/decision-ledger.md（D-001~D-047）＋ .scratch/architecture-recovery/decision-ledger.md（A-001~A-053）
- impact: W14 frontier 清零；jiahao 仓回归脚撤除待 #46 执行（push 各需用户授权）；上架提交动作仍停用户闸门

## [M-003] - 2026-09-16

- milestone: grill 轮 11（W15 窗口包）收口——Micro-A 前置链全立（#47 托管 API 适配器→#48 Micro-A preview 单票）＋#49 经典仓三选接入＋分发面定型（路径 A+C／Apache-2.0／插件名 6f／市场 xxx91n／author 值）；P-1 归因=用户确认自推销项（会话层，不入仓面）
- adr_range: ADR-0001 ~ ADR-0021（docs/adr/ 实物 21 件，含 ADR-0002/ADR-0010 superseded 如实计）
- a_range: A-001 ~ A-054（architecture-recovery 账本实物区间，写时实物读出）
- ledger_pointer: .scratch/macro-audit/decision-ledger.md 第十一轮 Grill＋收口对账（D-048~D-052）／.scratch/architecture-recovery/decision-ledger.md
- impact: 分发面法律/命名/市场三件就位（Apache-2.0＋6f@xxx91n＋marketplace.json）；Micro-A 硬前置票就位；矩阵扩展选定待执行窗接入；残余用户闸门=push 授权＋marketplace add＋B 轨未授权

## [M-004] - 2026-09-17

- milestone: grill 轮 13（原预设对照清算包）收口——六题全拍（atomcode 深调研×4 零 revised）：叙事双轨＋rubric 三件立案 #50（D-053）＋Macro-B behavior 象限接入立案 #51（D-054）＋hooks 层④收窄为可选呈现面/声明位（D-055，ADR-0008 勘误）＋repomix-gitingest 退役（D-056，锁表首个 retired 行）＋原预设余项×4 核销（D-057：issue 销项/评测面 manual_watch/BOM#6 封口/补查归 agent）＋Kernel/Agent 职责边界词条收编（D-058）
- adr_range: ADR-0001 ~ ADR-0021（docs/adr/ 实物 21 件；ADR-0008/0015 各获勘误补记——决策本体不改写）
- a_range: A-001 ~ A-055（写时实物区间——A-055 于 80e6af3 先于 M-004 落账；审计 B1 修正，原「无新增」为漂移）
- ledger_pointer: .scratch/macro-audit/decision-ledger.md 第十三轮 Grill（D-053~D-058）／.scratch/architecture-recovery/decision-ledger.md
- impact: 原预设 BOM 全核销（repomix 退役/anysearch-cli kernel 封口/issue 外联销项）；registry +2 触发器（hooks-presentation-face event_bound／narrative-eval-surface manual_watch）；残余用户闸门=push 授权＋marketplace add

## [M-005] - 2026-09-22

- milestone: 轮 25~27 grill/实施收口＋轮28 #77 门面收口包交付——6F 正名＋六-F 宣言（D-092/093）＋engine-ci 首跑绿六腿（D-097）＋轮27 五裁落账（D-098 致谢三层分工／D-099 消费面驱动资产／D-100 违约两级处置〔D-059① revised 链〕／D-101 A-B 双窗边界／D-102 xfail-45-h5 摘除追认）；#77 实物=README 双语「## Acknowledgments」生成式锚段＋77-check 16/16＋engine-ci main badge 挂载＋homepageUrl 补齐（A-089）
- adr_range: ADR-0001 ~ ADR-0021（docs/adr/ 实物 21 件，含 ADR-0002/ADR-0010 superseded 如实计——区间写时实物读出）
- a_range: A-001 ~ A-089（architecture-recovery 账本实物区间，写时实物读出）
- ledger_pointer: .scratch/macro-audit/decision-ledger.md 第二十七轮 Grill＋收口对账（D-098~D-102，D-059① revised）／.scratch/architecture-recovery/decision-ledger.md（A-001~A-089）
- impact: 门面致谢面建制闭环（生成式锚段＋closed 对账守卫 regen→diff empty）；xfail-45-b5 stale 条目摘除同 D-102① 形；readme-ci-badge 实物已挂载，registry status 翻转归 T10 值守面

## [M-006] - 2026-09-23

- milestone: 轮 28 grill 收口——quarantine 引擎设计树 18 裁全拍板（D-103~D-120）＋ADR-0022 总成入册＋CONTEXT.md 六词条（违约两级处置/Quarantine 字段处置/Reason Code 受控词表/Intake Health 节/Known-gaps 台账/Strict Quarantine 门禁＋处置感知 Parity）＋R28 调研档案 19 题全保全；#78 引擎 quarantine 建制 B 窗立案
- adr_range: ADR-0001 ~ ADR-0022（docs/adr/ 实物 22 件，含 ADR-0002/ADR-0010 superseded 如实计——区间写时实物读出）
- a_range: A-001 ~ A-090（architecture-recovery 账本实物区间，写时实物读出——A-090「#78 quarantine 建制」与 M-006 同 commit 落账；原「无新增」勘误，2026-09-23 r29 审计 F1）
- ledger_pointer: .scratch/macro-audit/decision-ledger.md 第二十八轮 Grill＋收口对账（D-103~D-120）／.scratch/architecture-recovery/decision-ledger.md（A-001~A-090）
- impact: 违约两级处置＋字段级 quarantine 建制全决策定案（协议级 fail-fast／字段级三桶隔离）；残余 impl 级参数（列序/reason 枚举/字段名/构造件格式/事务节拍）随 T2 实施票收口；B 窗开工前提=guards 全绿基线

## [M-007] - 2026-09-23

- milestone: 轮 29 T2 B 窗——#78 quarantine 引擎建制落地（ADR-0022）：intake/quarantine.ts 三态分类器＋quarantine_log 幂等持久化＋逐 commit 事务＋--strict-quarantine 反向开关＋Intake Health 恒在节＋双层恒等式对账＋known-gaps 台账首版＋78-check 独立对账守卫＋macro-b-regression CI 三查升级；r29 审计返工批（编年勘误/39 侧 crash 工件/env 双腿/事务粒度/守卫挂载）同窗收口
- adr_range: ADR-0001 ~ ADR-0022
- a_range: A-001 ~ A-090
- ledger_pointer: .scratch/architecture-recovery/decision-ledger.md（A-090）／.scratch/macro-audit/decision-ledger.md（D-103~D-120 实施面回执）
- impact: 字段级病态不再全仓崩（quarantine 桶收编＋指纹可重放）；协议级违约 fail-fast 不动；39/40 对照物 SoD 保持零分类逻辑（D-118④）；验收实证=QUARANTINE 56/56＋78CHECK 30/30＋npm test 19 册＋守卫组复绿

## [M-008] - 2026-09-23

- milestone: 轮 30 grill 收口——Micro-B 文件级审计卡设计树 7 裁全拍板（D-121~D-127）＋ADR-0023 总成入册＋CONTEXT.md 新词条×4（Subject Canonical Form／File Lineage／Observation Set／Raw Evidence Layer）＋Micro-B 触发器释义锐化＋R30 调研档案 Q1~Q7 全保全；#80 Micro-B preview 单票立案（内部三步 stacked-diff 各独立绿）
- adr_range: ADR-0001 ~ ADR-0023（docs/adr/ 实物 23 件，含 ADR-0002/ADR-0010 superseded 如实计——区间写时实物读出）
- a_range: A-001 ~ A-090（architecture-recovery 账本实物区间，写时实物读出——本轮零新增）
- ledger_pointer: .scratch/macro-audit/decision-ledger.md 第三十轮 Grill＋收口对账（D-121~D-127）／.scratch/architecture-recovery/decision-ledger.md（A-001~A-090）
- impact: Micro-B preview 全决策定案（per-file 一等事实发射／SCIP 规范化形＋file_renamed 血缘／三层卡契约 advisory 结构性隔离／at:sha＋miss 四类显式态）；残余 impl 级参数随 #80 票面收口；退路 C 登记在案
## [M-009] - 2026-09-24

- milestone: 轮 31 #80 步①实装——Micro-B per-file 一等事实发射管线落码（subject 规范化器 SCIP 五规则+NFC+禁折叠+case 冲突检测／file.renamed 血缘事实 rename-detector@v1·阈值 50%／facet_rows 降 raw_evidence／behavior 消费面迁 per-file 重聚合+对账判据入 bhvPc1）＋micro-b-emit 测试入 smoke 链第 5 位（链共 20 件）＋micro-b fixture/golden 骨架锁体系＋80-check 守卫 20/20；审计返修：dist 产物恢复 bundle 规程（npm run build 非裸 tsc）＋本 M 行补编年（41a D6 同源失败复发教训：账本行落盘即须编年随行）
- adr_range: ADR-0001 ~ ADR-0023（docs/adr/ 实物 23 件——区间写时实物读出）
- a_range: A-001 ~ A-091（architecture-recovery 账本实物区间，写时实物读出——本轮新增 A-091）
- ledger_pointer: .scratch/architecture-recovery/decision-ledger.md（A-091 步① impl 裁决①~⑧）／.scratch/macro-audit/decision-ledger.md（D-121~D-127 设计面）
- impact: Micro-B 事实面=per-file 一等实体+血缘链可查询（步②投影数据面就位）；验收实证=micro-b-emit 17/17＋80-check 20/20＋npm run smoke 20 件全绿＋守卫组 13 件复绿；步②/T2=投影+查询语义+双通道骨架待开工

## [M-010] - 2026-09-24

- milestone: 轮 31 grill 封口——第三轮锐评辩证处置 6 裁全拍板（D-128~D-133）：quarantine 仪器方言受理（范畴切分＋边界归一＋双轴披露；D-100② scoped revised）／dist 批评维持＋棘轮增量／文书法典主体拒收＋生成式索引＋first-external-contributor 触发器／S1 fixture 落点谓词判据／S6 golden 分层锁面「骨架」精修（D-127⑥/D-049⑤ 注记）／增量票面化（#81 quarantine 缺陷票先行＋#82 仓务增量批并行）；waived-research 先例登记（R31-Q6 限流截断标 partial、resume 句柄留档）；CONTEXT 词条×3＋三处锐化；R31 调研档案 Q1~Q5 存档
- adr_range: ADR-0001 ~ ADR-0023（docs/adr/ 实物 23 件，含 ADR-0002/ADR-0010 superseded 如实计——区间写时实物读出）
- a_range: A-001 ~ A-091（architecture-recovery 账本实物区间，写时实物读出——本轮零新增）
- ledger_pointer: .scratch/macro-audit/decision-ledger.md 第三十一轮 Grill＋收口对账（D-128~D-133，D-100② scoped revised）／.scratch/architecture-recovery/decision-ledger.md（A-001~A-091）
- impact: 锐评三轮处置全定案（方言归一真缺陷受理归 #81／仓务增量四件归 #82／主线 #80 步②不动）；排序=#81 先行→#82 并行→#80 步②；编年随行纪律补齐本轮账行（r31 收口 commit 漏编年→41a-D7 红修）

## [M-011] - 2026-09-25

- milestone: 轮 32 实施+审计收口——#81 quarantine 方言归一（+00:00↔Z 边界吸收器+collection_environment 披露块+dialect-boundary 回归册）＋#82 仓务批（gen-adr-index+dist 棘轮+first-external-contributor 触发器+#80 票面勘误）＋#80 步② 投影+查询语义（三层卡契约+miss 四类+renamed_to+at:sha pin+staleness+lazy 补采）七提交栈 land origin/main；R32 审计 F1-F4 必修闭环+LOOP 复核通过；审计残余六裁 D-134~D-139 全定（吞错收窄归 #83①／建议修批单票 #83／失败态投影收口 D-136／血缘缝合归 #80 步③ D-137／golden 再生 first-non-z-dialect-host 触发器 D-138／V1~V4 过程违规追认 D-139）
- adr_range: ADR-0001 ~ ADR-0023（docs/adr/ 实物 23 件，含 ADR-0002/ADR-0010 superseded 如实计——区间写时实物读出）
- a_range: A-001 ~ A-091（architecture-recovery 账本实物区间，写时实物读出——本轮零新增）
- ledger_pointer: .scratch/macro-audit/decision-ledger.md 第三十二轮 Grill＋收口对账（D-134~D-139）／.scratch/architecture-recovery/decision-ledger.md（A-001~A-091）
- impact: Micro-B 查询面可用（卡投影+双触发+MCP file_card）；#83 R32 审计建议修批立案（必修收窄→契约符合性→正确性边件→卫生组，#80 步③前落）；registry +2 deferred event_bound（81-first-non-z-dialect-host／89-format-piggyback-recurrence）；AGENTS 负向行=格式化禁搭车+写断言「禁 BOM＋保尾行」

## [M-012] - 2026-09-25

- milestone: 轮33 T1 #83 R32 审计建议修批落地（A-092）——D-134 吞错收窄（fact_id UNIQUE 精确指认＋写前预查消撞键＋emitted/skipped 分列披露＋毒事实回滚零行回归＋真 DuckDB 消息形态钉）＋F5 MCP 缺库 never_collected 结构化卡＋F6 集内 not_tracked_at_sha 补 available_head_shas＋D-136 失败态投影收口（closed 双集〔静态保留集/历史派生族〕＋suppressed_facets 带原因码＋raw 层不动）＋F7a pin ≥7 前缀歧义验重＋卫生组七件（headShaOf 去重/mcp 头注/microBCtx 死引用/unused import/CAP 截断卡面标记/80-check BOM 钉面/upload-artifact 步级收窄）＋编年随行补 M-011 R32 行——#80 步③边界件实跑前契约缺口清零
- adr_range: ADR-0001 ~ ADR-0023（docs/adr/ 实物 23 件，含 ADR-0002/ADR-0010 superseded 如实计——区间写时实物读出）
- a_range: A-001 ~ A-092（architecture-recovery 账本实物区间，写时实物读出——本轮新增 A-092）
- ledger_pointer: .scratch/architecture-recovery/decision-ledger.md（A-092 #83 修批实施）／.scratch/macro-audit/decision-ledger.md（D-134~D-136 执行面回执）
- impact: lazy 补采写路径=D-115① fail-fast 语义归位（非 fact_id 撞键 constraint 全上抛回滚）；失败态卡面历史派生族不再冒名（suppressed_facets 披露非静默）；MCP miss 首义形态全枝到达（缺库=结构化卡）；验收实证=FILE-CARD 26/26＋83-check 19/19＋smoke 22 册全绿＋守卫组 18 件全绿（含 41a 复绿 38/38）＋package/selftest/MCP stdio 测活

## [M-013] - 2026-09-25

- milestone: 轮 34 grill 封口——第三轮锐评（快照 44cc2a4/R31，评估时主线 811d930）残余四面裁毕（D-140~D-143 全 current）：dist 锁面内制品评审降噪（engine/.gitattributes dist/** generated 标记面级 54 件＋dist 再生独立 bundle commit 规约＋信任源声明=CI rebuild-diff 守卫，D-067/D-059⑨ 互引注记）＋贡献者最小阅读地图（CONTRIBUTING.md Reading map 纯指针段，D-130 注记）＋评审快照摄入分诊规程（AGENTS.md 摄入规程行＋CONTEXT「评审快照分诊」词条＋registry 90-review-intake-mistriage-recurrence deferred 触发器）＋R33 口径卫生三件（F9 emitted 203→197 勘误封账＋SuppressedFacetReason 收窄+B2 标签收窄归轮35 T1）；R34-Q{1..4} 调研档案存档；轮35任务书 T0~T13 落盘
- adr_range: ADR-0001 ~ ADR-0023（docs/adr/ 实物 23 件，含 ADR-0002/ADR-0010 superseded 如实计——区间写时实物读出）
- a_range: A-001 ~ A-092（architecture-recovery 账本实物区间，写时实物读出——本轮零新增）
- ledger_pointer: .scratch/macro-audit/decision-ledger.md 第三十四轮 Grill＋收口对账（D-140~D-143）／.scratch/architecture-recovery/decision-ledger.md（A-001~A-092）
- impact: 第三轮锐评残余清零（dist 评审降噪/贡献者导览/摄入分诊三档/口径卫生批全定）；registry +1 deferred event_bound（90-review-intake-mistriage-recurrence）；编年随行补齐本轮账行（r34 收口 commit 漏编年→41a-D7 红，M-010/r32-t0 同型补录先例）
