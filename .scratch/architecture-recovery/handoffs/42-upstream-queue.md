# Handoff: 42 — 上游队列值守

- **A-xxx covered:** A-047
- **Decision:** spec.md §R5-D11
- **对应 issue:** issues/42-upstream-queue.md
- **对应 prompt:** prompts/42-upstream-queue.md

## 上下文摘要（3-5 句）
D-034③：Scorecard/repomix 探针按层需求队列接入不插队（禁止为补齐 preview 供应链象限而插队——降级披露制已立法）；D-035③：CodeLore sqlite/parquet dump 立为对照评估项（采纳须另立 ADR）。本票 = 队列值守 + dump 评估落文。

## 完成定义（本票 done 判据）
- dump 对照评估落文：字段覆盖度 / 语义翻译面厚度 / golden 可测性三轴 vs 逐面契约路径
- 采纳与否呈报（采纳 → 另立 ADR 呈报用户，不自行改向）
- Scorecard/repomix 探针保持「层需求拉动」登记（触发条件字段齐，衔接 #33 guard）
- Macro-B preview 供应链象限「⚠ 数据未接」披露在位核查
- 守卫 reports/42-*.mjs PASS；ledger A-047 done；WORKFLOW §4 lessons；commit 引 A-047 + 守卫结果

## 通用调研要求（每票适用，写一次）
- **atomcode 深度调研**（per WORKFLOW §4.2.3）：dump 格式与逐面契约对照调研 + baseline 回顾（D-020/D-023/D-034/D-035）；冲突显式点名不静默改向
- **回顾 docs/adr/**：0014（双轨制）；**回顾 CONTEXT.md**：「SSOT / Event Sourcing」
- **对标工业界成熟方案**：≥2 个 dump vs API/契约面先例

## 阻塞
- #35（dump 对照评估需首批契约面作基线）；Scorecard/repomix 探针 = 层需求触发器拉动

## 关键参考
- reports/31-upstream-facts.jsonl；engine/src/upstream/codelore.ts；macro-audit 账本 D-035③
