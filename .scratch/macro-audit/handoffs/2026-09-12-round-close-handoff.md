# Handoff: macro-audit — R2-Q7 轮次收口（含下一个 grill 方向）

> 写入 .scratch/macro-audit/handoffs/（用户覆盖 $handoff 默认 OS 临时目录）。
> 唯一数据源：.scratch/macro-audit/decision-ledger.md（D-001~D-015）。

## 一、本轮已闭环（7 项）
1. R2-Q7 atomcode 调研（spec<->工程边界）-> reports/R2-Q7-atomcode-research.md
2. D-014 批准 -> ADR-0010（supersede ADR-0002）
3. 架构更正 -> D-015 + ADR-0011（单仓 + engine/ 子目录 + but 分支）；6F-impl 删除
4. 审计返工（R1+R2）-> 全部执行，重跑清单全绿（含防漂移真检出 GEN-FAIL）
5. T6 信息缺口扫描（16 项 open/部分，不阻塞收口）
6. T7 呈报（BACKLOG B1~B3 / 旧仓删除 待你决定）
7. 合并到 main + push（origin/main = 66e4433）+ 删除已合并分支

## 二、当前状态（5 句）
1. 单仓 6F（D:/Aworker/6F）为唯一 git 仓；工程实现在子目录 engine/；spec/决策/契约在 CONTEXT.md / docs/ / .scratch/（per ADR-0011）。
2. 决策 D-001~D-015（D-002/D-008/D-014 revised；D-015 current）；ADR-0001~0011。
3. engine/ walking skeleton 过 build/package/smoke（6/6）；双 manifest 防漂移已修为“先比后写”。
4. main 已推送至 origin；workspace 干净；分支已 land 并删除。
5. 未解决：每平台 CI 未实跑（需 push 后看 run）；MCP 仍为 stub；R2-05 输入面 / CLI 四外壳未实现。

## 三、下一个 grill 方向指示
- **主线**：工程实现推进（engine/）；先决 = 把 spec 契约落实为代码（R2-05 输入面 repo add/clone/消歧/缓存；CLI 四外壳；MCP 真只读面）。
- **待你拍板**（T7）：BACKLOG B1.1~B1.3 立票与否；B2/B3；旧仓 architecture-recovery-spec 手动删除。
- **缺口补调研（串行 atomcode）**：Agent Plugins 规范全文（38KB）；DuckDB Node 绑定（Deprecated vs Neo）；MCP 2026-07-28 修订。
- **每平台 test 闭环**：push 后看 CI run（仓根 .github/workflows/engine-ci.yml，paths: engine/**）。

## 四、权威参考（canonical）
- 报告：.scratch/macro-audit/reports/2026-09-12-report.md（canonical，含 T6/T7）
- 审计报告：.scratch/macro-audit/reports/2026-09-12-audit-report.md
- 决策：.scratch/macro-audit/decision-ledger.md；ADR：docs/adr/0001~0011
- spec：.scratch/architecture-recovery/spec.md（## R2）；WORKFLOW：.scratch/architecture-recovery/WORKFLOW.md
- 工程：engine/（含 LICENSE / CHANGELOG.md / PROVENANCE.md）

## 五、Suggested skills
1. $implement / $tdd / $code-review — engine 功能推进（R2-05 输入面、MCP 真面）
2. $atomcode-research — 缺口补调研（串行）
3. $but — 全部 VCS 写操作
4. $handoff / $neat-freak — 收口交接与一致性盘点
