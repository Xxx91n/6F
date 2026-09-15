# Handoff: 37 — 试点面可用性审计

- **A-xxx covered:** A-042
- **Decision:** spec.md §R5-D6
- **对应 issue:** issues/37-pilot-surface-audit.md
- **对应 prompt:** prompts/37-pilot-surface-audit.md

## 上下文摘要（3-5 句）
D-033① 角色分配（anysearch-cli→Macro-C 校准／env-manager→Micro-A＋泛化验证／jiahao→Micro-B·Macro-B 回归＋下限）目前是 desk 判定——PR 人/机比、supersede 链完整度、托管面有无均未实测。本票产出 层×仓 capacity 矩阵，是 #38/#39 试点指派的实测依据。只读扫描三仓，不写被测仓。

## 完成定义（本票 done 判据）
- 实测脚本 reports/37-*.mjs 落文并实跑（只读；非人类 PR 边缘形态显式识别）
- 三指标逐仓落数 + 层×仓 capacity 矩阵（每格证据锚：文件/commit/度量值）
- 与 D-033 角色指派对照（一致/出入如实写；出入 → 冲突协议呈报不静默改向）
- 守卫 PASS；ledger A-042 回写 done；WORKFLOW §4 lessons；commit 引 A-042 + 守卫结果

## 通用调研要求（每票适用，写一次）
- **atomcode 深度调研**（per WORKFLOW §4.2.3）：回顾 baseline（D-033/D-034）、三仓现状；冲突显式点名不静默改向
- **回顾 docs/adr/**：0009（Repo Intake）；**回顾 CONTEXT.md**：「Pilot-surface Audit / Generalization Gate」
- **对标工业界成熟方案**：≥2 个 pilot 仓合格性/人机 PR 比率判定先例

## 阻塞
- #34, #35（次序批次二）

## 关键参考
- 三仓路径：D:/Aworker/env-manager、D:/Aworker/anysearch-cli、D:/Aworker/jiahao
- reports/02-*（W2 三仓扫描先例）；macro-audit 账本 D-033 全文
