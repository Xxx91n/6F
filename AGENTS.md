# AGENTS.md

## 用户协作偏好

- **输出文件路径一律给完整绝对路径**：凡输出用户需要复制/打开的文件路径（如 `.scratch/macro-audit/handoffs/next-round.md` 这类任务书/报告/handoff），一律写全绝对路径（`D:\Aworker\6F\...`），不要只给仓库相对路径。

## 项目环境速查

- 决策账本：`.scratch/macro-audit/decision-ledger.md`（D 系列）与 `.scratch/architecture-recovery/decision-ledger.md`（A 系列）
- 文件写入用 Node.js（`ctx_execute(language:"javascript")` 或 node 脚本），写后回读断言、禁 BOM
- 版本控制用 `but`（GitButler），不 push 除非用户明示
- 本机验证用守卫脚本 `node .scratch/architecture-recovery/reports/NN-check.mjs`（exit 0 + PASS/FAIL）
