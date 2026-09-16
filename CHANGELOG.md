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
