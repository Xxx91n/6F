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
- a_range: A-001 ~ A-089（无新增——architecture-recovery 账本实物区间，写时实物读出）
- ledger_pointer: .scratch/macro-audit/decision-ledger.md 第二十八轮 Grill＋收口对账（D-103~D-120）／.scratch/architecture-recovery/decision-ledger.md（A-001~A-089）
- impact: 违约两级处置＋字段级 quarantine 建制全决策定案（协议级 fail-fast／字段级三桶隔离）；残余 impl 级参数（列序/reason 枚举/字段名/构造件格式/事务节拍）随 T2 实施票收口；B 窗开工前提=guards 全绿基线
