# AGENTS.md

## 用户协作偏好

- **输出文件路径一律给完整绝对路径**：凡输出用户需要复制/打开的文件路径（如 `.scratch/macro-audit/handoffs/next-round.md` 这类任务书/报告/handoff），一律写全绝对路径（`D:\Aworker\6F\...`），不要只给仓库相对路径。

## 项目环境速查

- 决策账本：`.scratch/macro-audit/decision-ledger.md`（D 系列）与 `.scratch/architecture-recovery/decision-ledger.md`（A 系列）
- 文件写入用 Node.js（`ctx_execute(language:"javascript")` 或 node 脚本），写后回读断言、禁 BOM＋保尾行
- **格式化-only／机械重缩进变更禁搭车语义提交**——须独立 format commit 先行（大范围 reformat 登记 `.git-blame-ignore-revs`）；NO-OP 例外=被触碰文件内的顺手整理可搭车（R32 审计 V1 先例/D-139）
- **生成物再生禁搭车语义提交**——`engine/dist/` 产物（tsc+esbuild 输出）变更须独立 bundle commit；bundle-only SHA 可登记 `.git-blame-ignore-revs`（D-140②，D-139 同型扩展）
- **外部评审摄入先分诊再裁定**：钉评审快照 SHA＋逐条对照当前 HEAD——「快照属实/现状已修」不进裁定链（去向表照登）；仍开放→裁定链（D-075 三要素受理）；无法核实→pending+复审时点（入 registry 须走 manual_watch 五要素）（D-142）
- 版本控制用 `but`（GitButler），不 push 除非用户明示
- 本机验证用守卫脚本 `node .scratch/architecture-recovery/reports/NN-check.mjs`（exit 0 + PASS/FAIL）
