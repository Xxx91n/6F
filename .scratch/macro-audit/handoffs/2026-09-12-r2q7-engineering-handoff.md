# Handoff: macro-audit — 审计返工已完成（当前状态）

> 用户已覆盖 $handoff 默认 OS 临时目录 -> 写入仓内 .scratch/macro-audit/handoffs/。
> 唯一数据源：.scratch/macro-audit/decision-ledger.md（D-001~D-015）。

## 当前状态（5 句）
1. 单仓 6F（D:/Aworker/6F）；工程实现在子目录 engine/；spec/决策/契约在 CONTEXT.md / docs/ / .scratch/（per ADR-0011）。
2. 审计返工包（R1 文档层 + R2 工程/配置层）已执行完毕，重跑清单全绿（除每平台 CI 需 push 实跑）。
3. 分支：re/r2-q7-engineering-boundary（spec/决策/报告）、feat/walking-skeleton（engine）、audit/r2q7-acceptance（审计窗口）。
4. 决策 D-001~D-015；ADR-0001~0011（0002 superseded by 0010；0010 superseded by 0011）。
5. 未 push；zz 剩 round-2 遗留 3 文件（next-round.md / spec-phase-tasks.md / CONTEXT.md）。

## 下一轮任务
- push 并实跑 CI matrix（仓根 .github/workflows/engine-ci.yml，paths: engine/**）兑现每平台 test 闭环。
- 接 MCP 官方 SDK（@modelcontextprotocol/sdk），mcp 命令从 stub 换为真实只读查询面。
- R2-05 输入面（repo add / clone / 消歧 / 缓存布局）实现；CLI 四外壳（插件内嵌 / GitHub Action / 自用 CLI / 报告生成器）。
- 任务书 T6（信息缺口扫描）/ T7（呈报）。

## 权威参考（canonical）
- 报告：.scratch/macro-audit/reports/2026-09-12-report.md（canonical）
- 审计报告：.scratch/macro-audit/reports/2026-09-12-audit-report.md
- 决策：.scratch/macro-audit/decision-ledger.md；ADR：docs/adr/0001~0011
- spec：.scratch/architecture-recovery/spec.md（## R2）
- 工程：engine/（含 LICENSE / CHANGELOG.md / PROVENANCE.md）

## 过程纪律提醒
- A1 违规（未经授权提交）已由用户裁定；后续 VCS 写操作以用户指令为准。
- 自证式校验必须“先比后写”；报告落盘后不得立即由自身提交携带（自指失效）。

## Suggested skills
1. $implement / $tdd / $code-review — engine 功能推进
2. $atomcode-research — MCP SDK / Agent Plugins 规范补调研（串行）
3. $but — 全部 VCS 写操作
4. $handoff / $neat-freak — 收口交接与一致性盘点
