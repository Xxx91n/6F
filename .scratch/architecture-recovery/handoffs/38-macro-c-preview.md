# Handoff: 38 — Macro-C preview（第二能力层）

- **A-xxx covered:** A-043
- **Decision:** spec.md §R5-D7
- **对应 issue:** issues/38-macro-c-preview.md
- **对应 prompt:** prompts/38-macro-c-preview.md

## 上下文摘要（3-5 句）
阶段 3 层序第二位（D-034②）：Macro-C 复用 Macro-B 行为象限管道＋anysearch-cli 试点面＋CodeLore 同源。报告强制披露「单仓校准（anysearch-cli）」结构性限制；完成定义含 happy+failure 演示双件（D-032 DoD 准入件——preview 层必须自成完整价值单元）。

## 完成定义（本票 done 判据）
- Macro-C 全链（采集→fact→叙事→裁决→报告）在 anysearch-cli 实跑，产出 preview 报告
- 报告含单仓校准结构性限制披露块（缺 = FAIL）＋ capability/层级标注诚实（ADR-0017）
- happy+failure 演示双件（failure 含 ⚠ unverified/降级注释/verdict-gate 印记）
- 触发器 (b) 核查落文：Macro-C 是否与 Macro-B 共用同一 DuckDB（是则登记多写者 self-probe 触发，衔接 #33）
- 守卫 reports/38-*.mjs PASS；ledger A-043 done；WORKFLOW §4 lessons；commit 引 A-043 + 守卫结果

## 通用调研要求（每票适用，写一次）
- **atomcode 深度调研**（per WORKFLOW §4.2.3）：回顾 baseline（D-031/D-032/D-033/D-034）、spec.md §R5、engine 现状；冲突显式点名不静默改向
- **回顾 docs/adr/**：0006/0007（骨架+10 路径）、0013（三层闸门）、0017（preview 模型）
- **回顾 CONTEXT.md**：「Macro-C / Release Preview / Degraded Demonstration」
- **对标工业界成熟方案**：≥2 个演化考古/预览层披露先例

## 阻塞
- #35, #36, #37

## 关键参考
- reports/23-first-report.*（Macro-B 首报形态参照）；reports/30-desk-calibration.json
- anysearch-cli 仓（校准语料：56 ADR＋supersede 链）
