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

## [M-014] - 2026-09-25

- milestone: 轮35 T1 R34 收口实施批落地（A-093）——D-143② SuppressedFacetReason 收窄诚实可达集（'new_file'/'insufficient_history' 二成员；not_applicable 仅 miss/card_type 层可达，行尾钉新失败枝扩集义务）＋D-143④ 83-check B2 标签收窄「本枝新增、pin 枝既有」（断言实义对齐 file-card.ts:241 注释）＋编年随行补 M-013 轮34编年（r34 收口漏编年→41a-D7 红修）
- adr_range: ADR-0001 ~ ADR-0023（docs/adr/ 实物 23 件，含 ADR-0002/ADR-0010 superseded 如实计——区间写时实物读出）
- a_range: A-001 ~ A-093（architecture-recovery 账本实物区间，写时实物读出——本轮新增 A-093）
- ledger_pointer: .scratch/architecture-recovery/decision-ledger.md（A-093 R34 收口实施批）／.scratch/macro-audit/decision-ledger.md（D-143 执行面回执）
- impact: suppressed_facets 原因码=closed 诚实可达集（收窄后 exhaustiveness 判力可对第三原因码新枝拦截）；守卫标签名实相符纠偏再落（R32-V2/R33-P1 同型第三次前纠正）；验收=83-check 19/19＋smoke 22 册＋守卫组 18 件＋build/package/selftest

## [M-015] - 2026-09-26

- milestone: 轮 35 grill 封口——第四轮锐评（快照=当时 HEAD 68db5ad，新鲜度满）辩证处置四裁全拍板（D-144~D-147 全 current）：守卫复绿税双层组合（收口前置核对＋41a-D7 类高频钉→结构不变量改写归 #75批1＋守卫组 CI 层硬跑不降级）＋dist 再生工序内化（src/dist 触碰→build+check-dist 前置核对行）＋评审摄入四档制（D-142→revised 仅①款枚举三档→四档＋90-条目覆盖面扩写＋XFAIL「10/10 危机」勘误=快照不属实显式驳回）＋P4 as-cast 立即返工裁；R35-Q{1..4} 调研档案存档；轮36任务书 T0~T13 落盘
- adr_range: ADR-0001 ~ ADR-0023（docs/adr/ 实物 23 件，含 ADR-0002/ADR-0010 superseded 如实计——区间写时实物读出）
- a_range: A-001 ~ A-093（architecture-recovery 账本实物区间，写时实物读出——本轮零新增）
- ledger_pointer: .scratch/macro-audit/decision-ledger.md 第三十五轮 Grill＋收口对账（D-144~D-147，D-142① revised）／.scratch/architecture-recovery/decision-ledger.md（A-001~A-093）
- impact: 第四轮锐评清零（守卫税制双层/dist 再生前置核对/摄入四档制/P4 返工裁全定）；D-071⑨ 触发器实证追认 bound_to 改挂 #75批1；registry 90-条目覆盖面扩第四档；**编年随行补录**——r35-closeout 收口 commit 漏本轮编年致 41a-D7 红，由轮36 T1 批补录（M-013/M-010/r32-t0 同型先例）


## [M-016] - 2026-09-26

- milestone: 轮36 T1 R35 收口实施批落地（A-094）——D-147 P4 as-cast 返工：engine/src/fact/file-card.ts failure 注记收窄 'ok' | SuppressedFacetReason＋删 :299 as cast（落地修正=let→const 三元单式——TS 4.4 别名收窄对重赋值 let 绑定不生效，TS 5.9.3 最小复现实证）＋编年随行补录 M-015＋WORKFLOW §4 lessons 行补 P6
- adr_range: ADR-0001 ~ ADR-0023（docs/adr/ 实物 23 件，含 ADR-0002/ADR-0010 superseded 如实计——区间写时实物读出）
- a_range: A-001 ~ A-094（architecture-recovery 账本实物区间，写时实物读出——本轮新增 A-094）
- ledger_pointer: .scratch/architecture-recovery/decision-ledger.md（A-094 R35 收口实施批）／.scratch/macro-audit/decision-ledger.md（D-147 执行面回执）
- impact: D-143② exhaustiveness 判力兑现——第三失败枝词表外原因码将由编译错拦截（交叠 as 断言静默放行面清除）；dist 字节差发生（cli.js 257947→257898B，-49B=let+if-chain→const 三元结构性等价非语义差）触发预声明升格判据→§1 全套重跑全绿照走

## [M-017] - 2026-09-26

- milestone: 轮36 T2 收口——BACKLOG #80 步③ 落地（A-095）：血缘缝合=卡投影沿 file.renamed 链多跳图遍历+环检测+跨观测集边池并入旧名 era 事实（F10 孤儿封口）；双仓试点集实跑（jiahao 1109 facts 1-switch 双端＋env-manager 684 facts 2-hop 链三端验证）；benchmark p95 分档+target/danger 双阈值实测预登记（80-bench-thresholds.md）；披露收窄同票（Micro-B→capability 4 of 5・preview；not_in_preview 双源去 Micro-B；listing/marketplace 口径 1-4 同步；41b/44 守卫钉随口径更新）
- adr_range: ADR-0001 ~ ADR-0023（docs/adr/ 实物 23 件，含 ADR-0002/ADR-0010 superseded 如实计——区间写时实物读出）
- a_range: A-001 ~ A-095（architecture-recovery 账本实物区间，写时实物读出——本轮新增 A-095）
- ledger_pointer: .scratch/architecture-recovery/decision-ledger.md（A-095 #80 步③ 收口批）
- impact: Micro-B 文件卡三内部步全落地（发射①→投影+查询②→缝合+试点+披露③）；血缘缝合四子项全兑现（多跳/环检测/跨观测集/成对件双端）；F10 缺陷路径闭合（改名文件旧名历史计入新名卡不误进 insufficient_history）；试点集=jiahao＋env-manager（票面写「试点集」）；#80 票面 DoD 面齐，关票裁定属账本侧

## [M-018] - 2026-09-26

- milestone: 轮36 T2 审计返工批闭环（A-096）——A-095 审计不通过打回（A 类 5 项全修）：NUL 字节清出 file-card.ts／cycle_detected 假阳根治（跨集 dup 边并池去重＋DAG 钻石前向可达判定）／EDGE_CAP 截断如实披露（truncated 伞）／zh-CN 假同步修正（正文补译）／bench 分档按票面事实行数语义；B 类同修（L5 真实断言＋insufficient_history 实物件＋同主偏差措辞＋报告三处自漂移纠偏＋CHANGELOG 空行）
- adr_range: ADR-0001 ~ ADR-0023（不变）
- a_range: A-001 ~ A-096（本轮新增 A-096）
- ledger_pointer: .scratch/architecture-recovery/decision-ledger.md（A-096 R36 T2 审计返工批）
- impact: 血缘缝合正确性缺陷清零（dup 边/钻石不误报环、截断有披露）；源文件字节级卫生恢复 grep 可见；FILE-CARD 36/36；试点集同主偏差如实披露

## [M-019] - 2026-09-27

- milestone: 轮 36 grill 封口——第四轮锐评核销复核（锐评文本面零残余裁面确认）＋锐评后新生面双裁全拍板（D-148~D-149 全 current）：审计窗判断项处置（R1 Accepted-Risk 裁立三要素〔病态角双条件/reprobe 补偿控制/真实零边触帽案例重开〕＋R2 确认式呈报补复评触发〔多 to 竞争边歧义案例即重开〕）＋规程生效时点规约立法（grandfather/落盘 commit 自身豁免——M-015 复绿税第三次实证注记）＋守卫组界定（H51 十八件枚举锚面固化至 AGENTS＋成员进出生命周期一句话＋静默红 12 件处置谱挂 T3 分诊门＋升格触发器入 registry event_bound）；R36-Q{1,2} 调研档案存档；轮37任务书落盘
- adr_range: ADR-0001 ~ ADR-0023（不变）
- a_range: A-001 ~ A-096（不变——本轮零新增）
- ledger_pointer: .scratch/macro-audit/decision-ledger.md 第三十六轮 Grill＋收口对账（D-148~D-149，零新 revised）
- impact: 锐评核销闭环（三税处置全落档）；审计判断项呈报面清零（R1/R2 有名分）；规程生效时点语义封口（M-015 类不再重演）；「守卫组」获 AGENTS 层指称（收口判据可执行化）；静默红 fleet 首次全量画像（12 件）为 T3 普查输入
## [M-020] - 2026-09-27

- milestone: 轮 37 T1 / BACKLOG #75 批1——失效断言三分类建制＋守卫基线升格判据落地（D-149④ 触发器 fired）：静默红 12 件全过 D-094 门（11 件合法漂移改断言〔26/28/30 porcelain→票面 commit 集、20 SQL 词表→语句形态、23 裸 NodeNext→dist 面、37 等值→钉快照+逐件 committer 核验、38 钉死→字段自洽+外部锚、44 序位钉→行级共现、54 调用点锚+剥注释、35 枚举并集、25 列结构钉〕、1 件入 known-red-manifest〔01 语料退化，复审锚+expires〕、0 欺诈/死面）＋75a-check 字面钉普查 348 条全归因注册＋三层命名/无牙族/剥注释纪律落成＋41a-D7 结构不变量化（编年键覆盖集）＋P5-B2 同名断言普查顺带登记
- adr_range: ADR-0001 ~ ADR-0023（不变）
- a_range: A-001 ~ A-097
- ledger_pointer: .scratch/macro-audit/decision-ledger.md（D-148~D-149 应用面）＋ .scratch/architecture-recovery/decision-ledger.md（A-097）
- impact: 「守卫组」判据升格为全量跑+册制红集管理（registry 触发器 fired）；断言纪律三族（剥注释/层位/无牙）成建制；known-red manifest 首收 1 件

## [M-021] - 2026-09-27

- milestone: 轮 37 T1 返工核销——审计打回 F1（guard-all-run 复跑拦下册外新红 23-P2：git auto-abbrev 7→8 跳变撞 7 位字面钉）窄修毕：%h→%H 全锚+startsWith 前缀等值；75a 增 short-sha-pin 探测族（第六族入正对照）；升格机制首效实证（红集⊆册判定如实拦截）
- adr_range: ADR-0001 ~ ADR-0023（不变）
- a_range: A-001 ~ A-098
- ledger_pointer: .scratch/architecture-recovery/decision-ledger.md（A-098 返工行）＋ .scratch/macro-audit/reports/2026-09-27-r37-audit-report.md（裁定源）
- impact: 收口判据复绿（guard-all-run 60 件 PASS 红集={01}⊆册）；同族残余普查净面；审计打回→修复→复核闭环成例


## [M-022] - 2026-09-27

- milestone: 轮 38 grill 封口——CodeBuddy 宿主试用三裁＋执行协议＋完备性核查全定（D-150~D-152）：宿主面=插件全路径主验收＋安装树自对照基线（同 SHA 单变量=驱动路径）／兼容性面官方兼容证伪零预修（`${CLAUDE_PLUGIN_ROOT}`/`.claude-plugin/` 官方兼容别名双源，三悬点列首轮实测清单）／exit-success 双轴封口＋SBTM charter 三件套＋trials/ 档案位新立＋findings 票面五要素／批2 排序=试用先行排程优先（无依赖项可并行准备）
- adr_range: ADR-0001 ~ ADR-0023（不变；0016 Consequences 落宿主扩展注记①）
- a_range: A-001 ~ A-098
- ledger_pointer: .scratch/macro-audit/decision-ledger.md（D-150~D-152＋D-150⑤ scoped 注记＋R38 收口节勘误：runtime-doctor-trigger 已 discharged-decided 于 2026-09-18 T6——CodeBuddy 试用=第二宿主链路非首锚）
- impact: 宿主扩展面首裁（CodeBuddy=ADR-0016 渠道语义内新增宿主非新渠道）；试用 charter 落盘即判据预声明生效（Kill Criterion 兑现）；r37 呈报七件＋批2 348 条全挂批2 待试用 findings 回流重排；本轮零 revised

## [M-023] - 2026-09-27

- milestone: 轮 38 T2 #75批2-α 实施批——r37 审计呈报七件全实修闭环（38-F2 枚举域钉回补／25-C5c 末格禁言盲区→豁免登记制／37-C2b 快照界欠数检出双向回补／20-A5 _lib 剥注释自消费／26·28·30 票面 commit 集机件收编 check-kit／manifest「三分位→三分类」笔误／01-spotcheck 尾行+生成器）＋75b 分档草案落盘（348 条→六轨映射＋批2-β 裁定候选）＋CodeBuddy 试用 session 骨架预填环境快照（宿主操作=用户驱动面 pending）
- adr_range: ADR-0001 ~ ADR-0023（不变）
- a_range: A-001 ~ A-099
- ledger_pointer: .scratch/architecture-recovery/decision-ledger.md（A-099）＋.scratch/macro-audit/decision-ledger.md（D-150~D-152 无增量——本轮实施窗零新裁）
- impact: 守卫判据力回硬三件（枚举域钉/双向欠数检出/盲区豁免登记）；探测面残余漏洞（注释提名豁免/multi-hit includes·test·macro-audit 面/SCAN_EXEMPT 不可达项/75a-S1 自指恒真）归批2-β 裁定链不机械推进；票面批2（枚举 open/closed 建制）未动——75b 草案明示留后续建制批；T1 试用读数随用户会话回填 session 档

## [M-024] - 2026-09-27

- milestone: 轮 39 grill 收口＋执行窗登记批——D-153~D-156 四裁全 current 零 revised（射程(b′)＋批2-β 探测面硬化三面〔剥后消费位/dry-run 批注册预声明转窗/SCAN_EXEMPT 死项+S1 可达性改写〕＋登记处置面〔技术债八件两全形态/IDE manual_watch/F-02 哨兵观察〕＋完备性终裁〔N1/N2 断链补登 GAP-B2B-07/08、批4 对称性、词条声明〕）；registry +3 项/+1 事件（62/43→65/44）＋known-gaps 批2-β 节九行＋engine/README 兼容注记实测化（R38-T3 义务兑现）＋轮39 任务书换代
- adr_range: ADR-0001 ~ ADR-0023（ADR-0024 立法义务立案归批2-β 执行窗随源码同窗）
- a_range: A-001 ~ A-099
- ledger_pointer: .scratch/architecture-recovery/decision-ledger.md（A-099）＋.scratch/macro-audit/decision-ledger.md（D-001~D-156：145 current/10 revised/1 closed）
- impact: 探测面语义立法齐备待实施（dry-run→批注册→转窗 enforcing 序；禁用过期差值）；登记面实物全兑现（双册分工维持、裸 prose 锚机读化）；批3/批4 择批点显式不预裁；宿主面 CLI=verified/IDE=observed-unverified 三态披露在册（禁 CLI 外推 IDE）

## [M-025] - 2026-09-27

- milestone: 轮 40 T1 批2-β 探测面硬化实施批落地——①unstrippedScanHit 豁免判据改剥后消费位（实测 comment-only 逃逸=0、存量 41 件册零迁移）②multi-hit 扩 .includes(/.test( 字面量＋walk 补 .scratch/macro-audit/（dry-run→批注册→当日转窗 enforcing：delta +42 全量批注册 acknowledged-multi-hit＋1 件字面量归因迁移 46→49 摘悬空）③SCAN_EXEMPT 摘 guard-all-run.mjs 死项＋S1 改写 ⊆枚举面可达性自检＋S2 消费位判据正对照 fixture ④ADR-0024 立法落盘（单收①②取舍）＋CONTEXT「消费位判据/豁免集可达性自检」词条同步立＋41 件册 note 挂 ADR-0024 指针
- adr_range: ADR-0001 ~ ADR-0024（docs/adr/ 实物 24 件，含 ADR-0002/ADR-0010 superseded 如实计——区间写时实物读出）
- a_range: A-001 ~ A-099（无新增——批2-β 属 macro-audit 账本 D 面裁定执行批）
- ledger_pointer: .scratch/macro-audit/decision-ledger.md（D-001~D-156：145 current/10 revised/1 closed；本批兑现 D-153②〔①②③〕/D-154①②③/D-156④ 执行面）
- impact: 普查基线 348→389（扩面新检出全量批注册=baseline-ratchet 基线重生成事件非膨胀；75a-check 10/10 绿）；探测器判定面锚消费位立法成文；豁免面死项自此有机检牙；批3/批4 择批点维持不预裁
## [M-026] - 2026-09-28

- milestone: 轮 40 grill 收口——第五轮锐评辩证处置六裁全 current 零 revised（D-157~D-162）：摄入分诊九条定案（勘误：sibling 活体依赖 9→3／幽灵钉挂 26-check／计量漂移登记）＋F-A1 谓词收紧剥后真消费形态（字符串提名不豁免＋S2 fxStringNom 正对照＋41 件字符串维度重测）＋守卫面环境契约分层（portable/env-contract 两档＋tier 自声明＋SKIP-with-reason 三态呈现）＋era-scoped 退役机制（面消亡判据＋manifest retired 类终态留档——裁军诉求显式驳回）＋提交信息三栏位 trailer 化（Ledger-Refs/Chronicle/Adrs 词表入 CONTEXT）＋外部暴露梯度三段（Stage-0 追认／Stage-1 charter 复用／Stage-2 四判据包＋30 日静默窗）。
- adr_range: ADR-0001 ~ ADR-0024（不变；ADR-0024 注记挂 D-158 指针随执行窗同窗，不开 ADR-0025）
- a_range: A-001 ~ A-099
- ledger_pointer: .scratch/macro-audit/decision-ledger.md（D-001~D-162：151 current/10 revised/1 closed；D-157~D-162 新增＋R40 收口节）
- impact: 锐评五面全部判据化收编（C1 环境契约／C2 退役机制／C3 提交形态／S3 暴露梯度＋ghost 并轨 D-094 普查通道）；提交信息新形态自下一 commit 起适用（本 commit 豁免——D-148③）；Stage-0 被动挂牌追认即刻生效、Stage-2 判据包值守义务随执行窗 registry 登记；六裁均禁轮内动源码、执行窗义务全量挂账（R40-impl 批序在收口节登记）。

## [M-027] - 2026-09-28

- milestone: 轮 40 T1 B 件落地——守卫环境契约分层建制兑现（D-159 全六要件）：tier 两档自声明（portable×57/env-contract×3={37,39,46}——未声明=红由 75a-T 组普查断言强制）＋_lib/env-contract.mjs env SSOT（GUARD_SIBLING_ROOT 变量寻址＋siblingPath/envProbe，禁 sibling 清单进仓）＋check-kit SKIP-with-reason 三态原语（exit 0 不进 allOk 不门禁、reason 进 GUARD-ALL footer）＋37/39/46 启动探测化（sibling 缺→skip、在但漂移→方言披露面）＋registry env-gated 类条目+事件（D-149④ 形态：66 项/45 事件）＋01-check 自指绝对路径→repo-relative（kr-01 env 缺陷面 manifest lifecycle_log＋registry confirmations 双侧关账留痕，语料红面维持）＋11 件非 check .mjs D:/ 字面收敛＋CONTEXT 环境契约分层词条＋protected_surface 双字段同窗（D-160③ 显式扩展前置兑现）
- adr_range: ADR-0001 ~ ADR-0024（不变——ADR-0024 判据引用于声明注释，执行注记归 A 件同窗）
- a_range: A-001 ~ A-099（无新增）
- ledger_pointer: .scratch/macro-audit/decision-ledger.md（D-157~D-162；本轮兑现 D-159①②③④⑤⑥ 执行面＋D-160③ 字段面）
- impact: 全量 60 守卫 tier 自声明机检化（75a T1~T3 绿）；SKIP 三态呈现契约落地（GUARD_SIBLING_ROOT=缺席路径实测 37/46 SKIP-with-reason exit 0）；fresh-clone 不可移植病（自指钉/sibling 硬钉）收口；xfail-run tier=portable 注记册入 env-contract 守卫须随批重 tier

## [M-028] - 2026-09-28

- milestone: 轮 40 T1 A 件落地——F-A1 unstripped-scan 豁免谓词收紧（D-158 全要件）：check-kit 新立 blankStrings（字符串/模板字面量遮罩保行号）＋realConsumption（真消费形态判定——import/require 具名引入 stripComments|stripMdComments 或裸调用位 stripComments(／stripMdComments(）；75a 谓词换 realConsumption＋fxStringNom 正对照 fixture（字符串提名必中——回归即红）；41 件注册条目重跑分诊零迁移零悬空（findings=389 前后不变——收紧不改现状面，纯防提名逃逸）；ADR-0024 执行注记随落（消费位判据实现形态钉档）
- adr_range: ADR-0001 ~ ADR-0024（ADR-0024 增执行注记——判据实现形态与回钉 fixture 锚记）
- a_range: A-001 ~ A-099（无新增）
- ledger_pointer: .scratch/macro-audit/decision-ledger.md（D-158 ①②③④ 全兑现执行面）
- impact: 豁免面从词缀匹配收窄为真消费位判定——字符串/属性名/标识符/注释内提名不再豁免（C4/C5/S2 fixture 组钉住双向边界）；成员调用 obj.stripComments( 不豁免（具名 import 已覆盖正路）；41 件在册件零迁移证明谓词收紧零现状扰动

## [M-029] - 2026-09-28

- milestone: 轮 40 T1 C 件落地——era-scoped 退役机制建制（D-160 全要件）：known-red-manifest.json retired 类扩容（终态留档八要素 schema：id/guard/protected_surface/tier/retired_at/era/reason/decision_ref/archive_path——沿 D-037/D-048 枚举版本化先例顶层类扩）＋_retired/ 归档目录建制（文件本体考古面非删除；retired 终态化不设二次出口=明示设计选择）＋75a-M3 机检断言（八要素齐备＋归档实物在＋原守卫出运行集——每机制留可跑校验闭环）＋D-094 划界注记成对落盘（红件三分类 vs 绿件面消亡处置输入正交、VACUOUS 普查双通道）＋registry guard-retirement-class 条目+retired-class-schema-active 事件（D-149④ 形态生命周期成环）＋CONTEXT retired 类词条
- adr_range: ADR-0001 ~ ADR-0024（不变）
- a_range: A-001 ~ A-099（无新增）
- ledger_pointer: .scratch/macro-audit/decision-ledger.md（D-160 ①②③④⑤⑥ 执行面全兑现——③ 双字段在 B commit 同窗落地、本件登记 schema+划界+归档）
- impact: 退役唯一合法路径=面消亡经 T3 窗逐件呈报；断言量/年龄/通过史裁军诉求显式驳回留痕（ACH 277/571 实证）；registry 67 项/46 事件；retired 类当前空册——首件走链立先例
