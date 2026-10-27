# 5 scale scope（宏观+微观=5 audit scales）
> 勘误补记（量测审计驱动 2026-09-15，#28 / A-033）：结构标签与 Date 字段补记；决策内容未改写。Date 值 = 入库/commit 日期（git first-commit 2026-09-12）。
- Date: 2026-09-12

## Context

决策理由：用户明确要求"都要包含、全都要"；四象限模型（结构/行为/供应链/战略）只在 Macro-B 内有效，跨 scale 必须独立定义审计粒度；5 scale 之间为粒度分层关系而非业务域关系，与 data mesh 自治域心智模型不同（见 ADR-0005）。

## Decision

本仓库的工程内容审计产品必须同时覆盖 5 档审计粒度 scale：Macro-A 跨仓战略、Macro-B 仓库级 4 象限、Macro-C 演化考古、Micro-A PR diff、Micro-B file level；5 scale 共享同一证据层（CodeLore + OpenSSF Scorecard）与裁决层（verdict-gate），差异在触发器与报告切片。

## Consequences

> 勘误注记：原文无独立 consequences 句；影响/范围性内容散见 Context 与 Decision 句内，未改写、未增补。

Status: accepted
