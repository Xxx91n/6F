# Handoff: 43 — 样例 golden CI

- **A-xxx covered:** A-048
- **Decision:** spec.md §R5-D12
- **对应 issue:** issues/43-sample-golden-ci.md
- **对应 prompt:** prompts/43-sample-golden-ci.md

## 上下文摘要（3-5 句）
D-030③ 登记候选票：样例防失真——CI 重渲染 examples/first-report/ fixture 并 diff，不一致即 fail；更新走 PR 审查，禁自动重生成直通 main（snapshot 纪律）。与 #33 同批立项；执行在 #41 样例落位后。

## 完成定义（本票 done 判据）
- CI golden job 落位（重渲染命令与 #41 披露 README 所录重生成命令一致）
- diff 不一致 fail（非零退出 + 差异摘要入日志）；更新路径只走 PR 审查
- 守卫 reports/43-*.mjs PASS；ledger A-048 done；WORKFLOW §4 lessons；commit 引 A-048 + 守卫结果

## 通用调研要求（每票适用，写一次）
- **atomcode 深度调研**（per WORKFLOW §4.2.3）：golden/snapshot CI 先例 + baseline（D-030/D-031）；冲突显式点名不静默改向
- **回顾 docs/adr/**：0017；**回顾 CONTEXT.md**：「Release Preview / Evidence Gate」
- **对标工业界成熟方案**：≥2 个 snapshot/golden CI 先例（Jest/Vitest/Chromatic 等）

## 阻塞
- #41（样例资产落位）

## 关键参考
- .github/workflows/engine-ci.yml；reports/23-first-report.*（样例源）；macro-audit 账本 D-030③
