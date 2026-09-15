# Handoff: 35 — CodeLore 契约面扩开首批 ≈30 面

- **A-xxx covered:** A-040
- **Decision:** spec.md §R5-D4
- **对应 issue:** issues/35-codelore-expansion-batch1.md
- **对应 prompt:** prompts/35-codelore-expansion-batch1.md

## 上下文摘要（3-5 句）
阶段 3 扩面第一票（D-034①）：CodeLore 契约面从探针期 3 面（explain/summary/version）扩到首批 ~30 面——演化主干 12＋S3 族 6＋S5 族 12，由 Macro-C preview 与 S3/S4/S5 矩阵行拉动。逐面 golden 契约测试钉死（ADR-0014）；面名以 `codelore analyze --help` 实物枚举为准。暂缓面集 ~20 面登记两字段、由 #33 guard 扫复审时点。

## 完成定义（本票 done 判据）
- `codelore analyze --help` 实物枚举存档 + 首批面集对账表（任务书面名 vs 实物面名，差异登记）
- 逐面：适配器输出 + golden cassette + 契约测试（pin 0.28.0 不变；适配层零业务规则断言沿用 #31 G5 先例）
- 暂缓面集两字段登记核对（「满足判据＋复审时点」缺项 = FAIL）
- 守卫 reports/35-check.mjs PASS + engine `npm test` / `npm run package` / selftest 不回归
- ledger A-040 回写 done；WORKFLOW §4 lessons；commit 引 A-040 + 守卫结果

## 通用调研要求（每票适用，写一次）
- **atomcode 深度调研**（per WORKFLOW §4.2.3）：回顾 baseline（D-020/D-023/D-024/D-034/D-035）、spec.md §R5、engine/src/upstream/codelore.ts 现状；输出调研报告含推荐方案；冲突显式点名不静默改向
- **回顾 docs/adr/**：0014（适配器双轨 + golden 契约）、0015（序列化校准）
- **回顾 CONTEXT.md**：「Hotspot / S3 / S4 / S5 / Macro-C」词条
- **对标工业界成熟方案**：调研报告列举 ≥2 个代码考古/演化分析工具面划分先例作类比

## 阻塞
- 无（与 #34 并行首票）

## 关键参考
- engine/src/upstream/codelore.ts、engine/test/fixtures/codelore/（#31 探针先例）
- reports/31-codelore-probe.mjs / 31-upstream-facts.jsonl / 31-report.md
- spec-phase-tasks.md 暂缓面集注记（D-035④）；macro-audit 账本 D-035 全文
