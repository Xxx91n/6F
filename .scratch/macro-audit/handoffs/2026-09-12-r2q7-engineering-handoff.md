# Handoff: macro-audit — D-014 已批准并执行（边界迁移 + 工程仓 walking skeleton）

> 用户已覆盖 $handoff 默认 OS 临时目录 → 写入仓内 .scratch/macro-audit/handoffs/。
> 唯一数据源：.scratch/macro-audit/decision-ledger.md（D-014 = current）。

## 当前状态（5 句）
1. 用户 2026-09-12 批准 D-014（激活 B4.1），A+B 组合正式启动。
2. spec 仓（D:/Aworker/6F）已完成边界迁移：ADR-0010 supersede ADR-0002；spec.md 已含 R2-01~05。
3. 工程仓已另起：D:/Aworker/6F-impl（Agent Plugin 五层盒子 + kernel CLI），walking skeleton 已过 build/package/smoke（6/6）。
4. 版本控制：spec 仓分支 re/r2-q7-engineering-boundary（uwz 等）；工程仓分支 feat/walking-skeleton（pmv）。
5. 未 push；spec 仓 ledger + round-2 文件仍未提交（混入上一 session 工作）。

## 下一轮任务
- 接 MCP 官方 SDK（@modelcontextprotocol/sdk），把 mcp 命令从 stub 换成真实只读查询面。
- 通读 Agent Plugins 1.0.0 规范全文，定稿 plugin.json / mcp.json 字段级 schema（含官方 schema 校验）。
- 跑通 CI matrix（macOS/Linux）兑现每平台 test 闭环；smoke→sanity→regression 分层。
- 任务书 T6（信息缺口扫描）/ T7（呈报：BACKLOG B1/B2/B3 立票、旧仓删除）。
- 工程仓堆砌真正的审计内核（证据管线 / 联邦裁决 / 报告生成）。

## 权威参考
- D:/Aworker/6F/.scratch/macro-audit/decision-ledger.md（D-001~D-014）
- D:/Aworker/6F/docs/adr/0001~0010
- D:/Aworker/6F/.scratch/architecture-recovery/spec.md（## R2）
- D:/Aworker/6F/.scratch/macro-audit/reports/{2026-09-12-report.md, 2026-09-12-report-engineering.md, R2-Q7-atomcode-research.md}

## Suggested skills
1. $implement / $tdd / $code-review — 工程仓功能推进
2. $atomcode-research — MCP SDK / Agent Plugins 规范 / DuckDB 绑定补调研（串行）
3. $but — 全部 VCS 写操作
4. $handoff / $neat-freak — 收口交接与一致性盘点
