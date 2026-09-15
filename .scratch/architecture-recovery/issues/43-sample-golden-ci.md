# 43: 样例 golden CI — 重渲染 fixture 并 diff、更新走 PR 审查

**A-xxx covered:** A-048
**Spec ref:** [spec.md](spec.md) §R5-D12

**What to build:**
CI 对 examples/first-report/ 样例资产重渲染并 diff，不一致即 fail；样例更新走 PR 审查、禁自动重生成直通 main（Jest/Vitest snapshot 纪律：入版本库＋code review）。样例防失真机制（D-030③）。

**Blocked by:**
#41（examples/first-report/ 样例资产落位后才有可校验对象）
> 修正注记（D-038⑤）：Blocked-by 行写 #41 是旧口径——D-038⑤ 已改依赖为 #45←#43（消费同一 definitions/golden 契约），且 #41a 已交付 examples/first-report/ 四件+披露 README。两个前置（#41a、#45）于 2026-09-16 均已闭合。

**Status:** done

- [x] CI workflow 新增 golden 重渲染 job（重渲染命令与 #41 披露 README 所录重生成命令一致）
- [x] diff 不一致即 fail（退出码非零 + 差异摘要入 job 日志）
- [x] 样例更新路径明文：只走 PR 审查，禁 CI 自动重生成回写 main
- [x] 守卫 reports/43-*.mjs PASS
