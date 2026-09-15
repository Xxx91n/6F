# Handoff: 40 — 非自有公开仓泛化验证 ≥1

- **A-xxx covered:** A-045
- **Decision:** spec.md §R5-D9
- **对应 issue:** issues/40-external-repo-generalization.md
- **对应 prompt:** prompts/40-external-repo-generalization.md

## 上下文摘要（3-5 句）
D-033 结构性限制入规：三仓同主属确认偏差面，试点定位 = 校准＋冒烟；泛化验证必须引 ≥1 非自有公开仓（URL opt-in 首实用户，D-013）。本票产出 Macro-B GA 前置的泛化证据。

## 完成定义（本票 done 判据）
- 目标公开仓选定＋理由落文；URL opt-in 全路径实跑（隔离缓存 clone / 全深度 / 浅 clone 拒绝路径不触）
- Macro-B 报告产出 + 与三仓 one-shot 对照差异如实写
- 守卫 reports/40-*.mjs PASS；ledger A-045 done；WORKFLOW §4 lessons；commit 引 A-045 + 守卫结果

## 通用调研要求（每票适用，写一次）
- **atomcode 深度调研**（per WORKFLOW §4.2.3）：候选仓选型调研 + baseline 回顾（D-013/D-033）；冲突显式点名不静默改向
- **回顾 docs/adr/**：0009（Repo Intake）；**回顾 CONTEXT.md**：「Generalization Gate / Repo Intake」
- **对标工业界成熟方案**：≥2 个公开仓泛化/benchmark 先例

## 阻塞
- #39

## 关键参考
- docs/adr/0009；spec.md §R2-05（输入面契约）；macro-audit 账本 D-013/D-033
