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
