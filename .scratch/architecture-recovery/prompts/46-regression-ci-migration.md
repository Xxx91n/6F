# Prompt: 46 — 回归 CI 迁回 6F 自有 CI

- A-xxx: A-054
- Decision: BACKLOG #46＋D-046
- Blocked by: 无（#39 已 done）
- 身份: 遵循 WORKFLOW.md §2 的开发 Agent，本票唯一目标 = 完成本票闭环
- 必读清单（动手前逐条确认可解析）:
  - issues/46-regression-ci-migration.md
  - handoffs/46-regression-ci-migration.md
  - WORKFLOW.md §4.2
  - decision-ledger.md（A-044/A-045 行——#39/#40 先例）
  - ../macro-audit/decision-ledger.md（D-046/D-013/D-033/D-034 行）
  - reports/39-macro-b-one-shot.mjs；reports/40-check.mjs（intake 隔离断言先例）
  - .github/workflows/engine-ci.yml、golden-ci.yml（同仓 CI 惯例：npm ci、node 版本、注释风格）

## 专属 delta（检查点）
- ① workflow 落位前先 grep 兄弟 workflow 惯例（npm ci 非 npm install）；matrix.repo.* 进 run 一律 env 间接引用；verify 步断言与标签等强（test -s + receipt_id RCP 格式）
- ② jiahao 撤除只动一文件——`but diff` 取 file-id 显式提交，勿裸 but commit 全量（他方 agent 在途）
- ③ 候选呈报不定案——DEFAULT JSON 只放 jiahao，T3 名单接入是用户选定后动作

## 专属验收
- reports/46-check.mjs PASS（exit 0 + PASS N/N）＋三子项逐项落位
- 其余完成判据遵循 handoff 内的完成定义

## 开工第一句
先复述：本票阻塞状态 + 必读清单逐条路径，确认后再动手。

## 收尾

**❗ 收尾硬要求——以下动作缺任一项 = 本票未闭环（W2/W3 V2 重演防线）**：① 报告落盘（.scratch/macro-audit/reports/<日期>-report.md 窗口节）；② ledger 本票行状态回写 done/deferred；③ WORKFLOW §4 追加 lessons 行；④ commit message 引用守卫结果。

报告按窗口追加纪律落盘；ledger 回写与 lessons 追加按 handoff 完成定义执行；版本控制遵循 WORKFLOW §4.2。
