# 演示场景 = 10 路径（5 scale × 关键+失败）
> 勘误补记（量测审计驱动 2026-09-15，#28 / A-033）：结构标签与 Date 字段补记；决策内容未改写。Date 值 = 入库/commit 日期（git first-commit 2026-09-12）。
- Date: 2026-09-12

## Context

决策理由：用户在 grill 中批准 10 路径法；happy path 验证 scale 正常工作、failure path 验证 scale 降级与裁决可追溯性，二者必须共享同一报告模板（ADR-0006）以允许用户对比；5 scale 全覆盖禁止"演示只演 Macro-B、Micro-A 之后再接"；演示层属 D-003 使用方法层。

## Decision

5 scale 演示场景 = 每 scale 一条关键路径（happy path）+ 一条失败路径（failure path），共 10 条路径；每条路径四要素：触发条件 / 步骤序列 / 成功/失败语义 / 报告产物；失败路径与失败语义要求直接对接（显式降级而非沉默失败）；10 路径共用 Hub-of-Facts 但每 scale 自运行时执行。

## Consequences

> 勘误注记：原文无独立 consequences 句；影响/范围性内容散见 Context 与 Decision 句内，未改写、未增补。

Status: accepted
