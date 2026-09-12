# Handoff: macro-audit — 单仓 6F + engine 子目录（当前状态）

> 用户已覆盖 $handoff 默认 OS 临时目录 → 写入仓内 .scratch/macro-audit/handoffs/。
> 唯一数据源：.scratch/macro-audit/decision-ledger.md（D-001~D-015）。

## 当前状态（5 句）
1. 架构更正后：**D:/Aworker/6F 是唯一 git 仓（默认项目文件夹）**；工程实现在子目录 6F/engine/；spec/决策/契约在 CONTEXT.md / docs/ / .scratch/。
2. 分支：re/r2-q7-engineering-boundary（spec/决策/报告）与 feat/walking-skeleton（engine）—— 均在 6F 单仓，不用 worktree。
3. 决策：D-014 revised（另起工程仓被更正）；D-015 current（单仓+子目录+but 分支）；ADR-0011 supersede ADR-0010。
4. 工程 walking skeleton 已过 build/package/smoke（6/6）；迁入 6F/engine/ 后重跑仍过。
5. 6F-impl 独立仓已删除；未 push；ledger + round-2 文件仍未提交。

## 下一轮任务
- 接 MCP 官方 SDK（@modelcontextprotocol/sdk），把 engine 的 mcp 命令从 stub 换成真实只读查询面。
- 通读 Agent Plugins 1.0.0 规范全文，定稿 plugin.json / mcp.json 字段级 schema。
- 跑通 CI matrix（macOS/Linux）兑现每平台 test 闭环（CI path filter 限 engine/**）。
- 任务书 T6（信息缺口扫描）/ T7（呈报：BACKLOG B1/B2/B3 立票、旧仓删除）。

## 权威参考（canonical 路径）
- 决策：D:/Aworker/6F/.scratch/macro-audit/decision-ledger.md
- ADR：D:/Aworker/6F/docs/adr/0001~0011（0002 superseded by 0010；0010 superseded by 0011）
- spec：D:/Aworker/6F/.scratch/architecture-recovery/spec.md（## R2）
- 报告：D:/Aworker/6F/.scratch/macro-audit/reports/2026-09-12-report.md
- 工程：D:/Aworker/6F/engine/

## Suggested skills
1. $implement / $tdd / $code-review — engine 功能推进
2. $atomcode-research — MCP SDK / Agent Plugins 规范补调研（串行）
3. $but — 全部 VCS 写操作
4. $handoff / $neat-freak — 收口交接与一致性盘点
