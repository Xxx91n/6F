# Backlog — 整轮收口遗留事项（2026-09-12）

> 呈报用户决定是否立票（per 用户 /goal 第 6 项）。

## B1 — 流程规范（建议立即立票）

| 编号 | 标题 | 触发条件 | 估时 | 建议 |
|---|---|---|---|---|
| B1.1 | W1/W2 全部 14 份报告补 commit-surface 处置 + 分到独立 branch | W3/W4 已示范 `sc [15-...]` / `re [16-...]` 形态，W1/W2 历史遗留 | 1 票 = 14 子任务 | **建议立票** — 闭合 V3-V4 违规 |
| B1.2 | 启动器收尾硬要求加 强提示（黑体警告）防 W2/W3 V2 重演 | W2 L4 + W3 L2 都明示"必须做但 agents 没做" | 1 票 = 18 启动器更新 | **建议立票** |
| B1.3 | A-006 重启触发器接入 D-007 演示脚本 | A-006 deferred 等 AI 代码生成主流化 | 1 票 = 集成测试 | **建议立票** |

## B2 — 仓库结构（建议合并到下轮开工）

| 编号 | 标题 | 估时 | 建议 |
|---|---|---|---|
| B2.1 | 把 `.scratch/` 加入 .gitignore 或明确其跟踪策略（当前无 .gitignore，.scratch/ 全部进 git） | 1 票 | 视用户偏好 |
| B2.2 | 删 e-branch-1（空分支 `(merged upstream) (no commits)`）| 1 票 | cleanup |

## B3 — 文档与可发现性（可选）

| 编号 | 标题 | 估时 | 建议 |
|---|---|---|---|
| B3.1 | 在仓根写 README.md（说明本仓是 spec-level 规划仓、不含代码） | 1 票 | 强建议（当前无仓根 README） |
| B3.2 | 把 docs/adr/ 链接到 docs/decisions/ 索引 | 1 票 | 易做 |
| B3.3 | 仓根加 CHANGELOG.md 记录本轮 7 ADR + 18 A-xxx | 1 票 | 易做 |

## B4 — 上下游对接（待用户决定）

| 编号 | 标题 | 估时 | 建议 |
|---|---|---|---|
| B4.1 | 进入 Phase 4 实施（per WORKFLOW.md §2）—— 但需另起工程仓 | 1 个工程仓 | 视产品方向 |
| B4.2 | 与 jiahao / anysearch-cli / env-manager 对接（这三个仓被 W2 扫描但未实际集成） | 多票 | 视产品方向 |

## B5 — 不可立票的事项（仅供参考）

- W1-W4 commits 已在 zz + 各独立 branch（23 个 branch）；如需合并到 main，需用户指示栈序 + push 策略
- 仓根无 .gitignore —— `.scratch/` 等都被 git 追踪
- A-006 评估未做实际扫描（仅 framework）
- 仓无远端；push 需用户明确给 `push 到 <remote> <branch>` 指令
