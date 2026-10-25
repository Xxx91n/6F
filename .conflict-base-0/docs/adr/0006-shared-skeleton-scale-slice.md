# 报告模板 = 共享骨架 + scale 切片
> 勘误补记（量测审计驱动 2026-09-15，#28 / A-033）：结构标签与 Date 字段补记；决策内容未改写。Date 值 = 入库/commit 日期（git first-commit 2026-09-12）。
- Date: 2026-09-12

## Context

决策理由：与 ADR-0005 read model 心智一致——事实层平等 + 表达层统一骨架、scale 差异在切片层；与 CodeLore dossier（引文校验盖章）和 RepoPilotAI（4 维评分 + Overall + 可行动建议）的报告形态同构；行动建议章节必须含 verdict-gate 印记（裁决可追溯性），证据章节必须含 grounded ✓/⚠ 引文校验盖章；模板不锁定具体措辞、只锁定章节顺序与必备字段。

## Decision

5 scale 审计报告模板 = 共享骨架（章节顺序：执行摘要 -> 4 象限/裁决 -> 证据 -> 行动建议）+ scale-specific 切片；骨架在集成层共享（fact table 投影），scale-specific 切片在各 scale 独立投影，禁止跨 scale 引用。

## Consequences

> 勘误注记：原文无独立 consequences 句；影响/范围性内容散见 Context 与 Decision 句内，未改写、未增补。

Status: accepted
