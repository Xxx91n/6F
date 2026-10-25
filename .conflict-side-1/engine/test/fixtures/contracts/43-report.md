# 43-report — 样例 golden CI（R5-12 / A-048 / D-030③）

## ① 完成定义逐项

| 判据 | 结果 |
|---|---|
| CI workflow 新增 golden 重渲染 job（重渲染命令与 #41a 披露 README 所录一致） | ✅ `.github/workflows/golden-ci.yml`：`golden` job 两腿——engine golden 走 `node scripts/gen-demo-golden.mjs`；examples/first-report 在物化的 fc00d458 冻结工作树内**逐字**跑 `node .scratch/architecture-recovery/reports/23-first-report.mjs`（README §生成溯源所录命令，守卫 A3 断言逐字一致） |
| diff 不一致即 fail（退出码非零 + 差异摘要入 job 日志） | ✅ 两腿均 fail-closed：engine 腿 `git status --porcelain`+`git diff` 非空 `exit 1`；examples 腿 `cmp -s` 四件任一不一致 `::error`+`diff -u` 摘要+`exit 1` |
| 样例更新只走 PR 审查，禁 CI 自动重生成回写 main | ✅ `permissions: contents: read`、全文零 `git commit`/`git push`/writeback action（守卫 A5 负断言）；纪律明文双处落位：workflow 头注释 + `examples/first-report/README.md`「CI golden 校验与更新纪律」专节（含正确更新路径） |
| 守卫 reports/43-check.mjs PASS | ✅ PASS 28/28 exit 0 |
| 本机模拟 diff 正误两态 | ✅ 正态：冻结工作树实跑四件+侧工件（23-facts.jsonl/23-measurements.json/23-gates.json/23-fixtures.json）全逐字节一致（receipt `RCP-9d20125ad0976c86` ↔ README 披露值）；误态：篡改 examples 一件 → `cmp` 检出 exit 1，篡改 engine golden 一件 → porcelain 检出，还原后 hash-object=HEAD 逐字节一致 |

## ② 阻塞与前置核实

- 票面 Blocked-by 写 #41 为**旧口径**：D-038⑤ 已改依赖为 #45←#43（消费同一 definitions/golden 契约）；#41a（examples 四件+披露 README）与 #45（definitions/golden/gen-demo-golden/demo 入口）于 2026-09-16 均已闭环——两个前置均闭合，issue 内已加注修正。

## ③ 关键实现事实（调研产物）

- **冻结时点物化**：fc00d458 是 GitButler workspace 快照 commit，**不在任何 pushed ref 上**（`git branch -a --contains` 空）——CI 克隆里不存在该对象，无法 checkout。处置：父锚薄 bundle `git bundle create 23-frozen-fc00d458.bundle refs/frozen/first-report --not 200b344`（904B；前置 200b344 在 main 历史）随仓传输，CI 端 `git bundle unbundle`+`git worktree add` 物化；本地另建 `refs/frozen/first-report` 防 GC。
- **生成时点工作树 ≠ commit 树**：fc00d458 树内**没有** 23-first-report.mjs 与 engine/src/report/（生成时均为未入库脏件，随下一提交 e39468c 入库）。overlay 两件取 `git show e39468c:<path>`（该提交即首报交付提交，版本=生成时点版）。
- **等签名 README 重构**：生成时点 `.scratch` README 脏版不可恢复（全历史+dangling blob 扫描无签名匹配）。产物不消费 README 原文、只消费 `positioning.keyword_coverage` 的 top-20 关键词计数签名——经已入库 `23-facts.jsonl` 逐 keyword `intent_count` 反推（md192/prompts64/mjs20/branch17/pass17/复核16/守卫16 等 20 项），构造 `23-frozen-readme-overlay.md`（committed 版+token 汤），实测重跑四件**逐字节一致**。重构性质在 workflow 注释/README/本报告三处如实标注，不冒充原文件。
- **单平台裁定**：golden job 挂 ubuntu-latest+Node 24 不挂 3 平台矩阵——确定性是逐字节契约（#45 env pin 同 SHA、eol=lf、输入全钉 git 对象），矩阵重复同一确定性计算无新信号；理由写入 workflow 注释，平台相关漂移留登记义务。
- **调研口径**：atomcode 通道本窗口未启用，以实物对账+工业先例替代（Jest/Vitest snapshot「入版本库+code review、禁 CI 自动写回」、Chromatic 审查制基线、Go project-layout 落位惯例）——登记为非阻塞偏差。

## ④ 本机红证与可复跑证据

- 绿态：`git bundle unbundle`→`git worktree add /tmp/6fci/.frozen-first-report fc00d458`→overlay 三件→`node .scratch/architecture-recovery/reports/23-first-report.mjs`→四件 `cmp` 全 IDENTICAL；engine `node scripts/gen-demo-golden.mjs` 后 13 件 `git hash-object`=HEAD blob 全 SAME。
- 红态：examples 一件尾加 `TAMPER`→diff 逻辑 `::error`+EXIT=1 检出→`git show HEAD:` 还原 IDENTICAL；engine golden 一件同法→porcelain 非空检出→还原 hash 一致。
- 不回归：`npm test` 全链绿（SMOKE 6/6+COLLECTORS 14/14+ADAPTER 7/7+BATCH1 41/41+LLM 25/25+REPORT-PREVIEW 5/5+INTAKE 31/31+DEMO 38/38）；`npm run package` tgz 过；`node dist/cli.js selftest` ok 5/5。engine 源码零改动。

## ⑤ Lessons 候选（已落 WORKFLOW §4）

- 「逐字节 diff 契约」先拆输入面：git 历史对象（bundle 薄包）/工作树文件（overlay）/生成器版本（e39468c git show）三面分钉，缺一面即不可复现。
- 等签名重构是诚实恢复路径：从已入库派生事实（facts intent_count）反推输入签名，产出物只消费派生量即可逐字节等价——但必须在注释/README/报告三处标注「非原字节、签名等价」。
- GitButler 工作区视图下 `git status --porcelain` 对虚拟分支文件呈假阳性（index 不含之）——本机 golden 证据改 `hash-object` vs `rev-parse HEAD:` 取得；CI 真实克隆无此问题。

## ⑥ 引用文件

- 新增：`.github/workflows/golden-ci.yml`；`.scratch/architecture-recovery/reports/23-frozen-fc00d458.bundle`；`.scratch/architecture-recovery/reports/23-frozen-readme-overlay.md`；`.scratch/architecture-recovery/reports/43-check.mjs`；本报告。
- 修改：`examples/first-report/README.md`（+CI 校验与更新纪律节）；`issues/43-sample-golden-ci.md`（done+勾+D-038⑤ 注）；`decision-ledger.md` A-048；`WORKFLOW.md` §4+1；`next-round.md` T14+进度块；`BACKLOG.md` #43；`.scratch/macro-audit/reports/2026-09-16-report.md`（+窗口节）。
- 读取未改：`reports/23-first-report.mjs`（重生成命令实物）；`engine/scripts/gen-demo-golden.mjs`；`engine/fixtures/golden/`；`engine-ci.yml`（未动，golden 独立 workflow）。
