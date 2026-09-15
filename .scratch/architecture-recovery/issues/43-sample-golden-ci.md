# 43: 样例 golden CI — 重渲染 fixture 并 diff、更新走 PR 审查

**A-xxx covered:** A-048
**Spec ref:** [spec.md](spec.md) §R5-D12

**What to build:**
CI 对 examples/first-report/ 样例资产重渲染并 diff，不一致即 fail；样例更新走 PR 审查、禁自动重生成直通 main（Jest/Vitest snapshot 纪律：入版本库＋code review）。样例防失真机制（D-030③）。

**Blocked by:**
#41（examples/first-report/ 样例资产落位后才有可校验对象）

**Status:** ready-for-agent

- [ ] CI workflow 新增 golden 重渲染 job（重渲染命令与 #41 披露 README 所录重生成命令一致）
- [ ] diff 不一致即 fail（退出码非零 + 差异摘要入 job 日志）
- [ ] 样例更新路径明文：只走 PR 审查，禁 CI 自动重生成回写 main
- [ ] 守卫 reports/43-*.mjs PASS
