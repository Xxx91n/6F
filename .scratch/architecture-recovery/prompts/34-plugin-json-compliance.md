# Prompt: 34 — plugin.json 对齐 Agent Plugins 1.0.0

- A-xxx: A-039
- Decision: spec.md §R5-D3
- Blocked by: None（与 #35 并行首票）
- 身份: 遵循 WORKFLOW.md §2 的开发 Agent，本票唯一目标 = 完成本票闭环
- 必读清单（动手前逐条确认可解析）:
  - issues/34-plugin-json-compliance.md
  - handoffs/34-plugin-json-compliance.md
  - spec.md §R5-D3
  - WORKFLOW.md §4.2
  - decision-ledger.md（A-039 行）
  - reports/31-upstream-drift.md、reports/31-report.md（P1 预核对不合规清单）
  - engine/plugin.json、engine/manifest.meta.json、engine/scripts/gen-manifests.mjs、engine/.claude-plugin/plugin.json
  - docs/adr/0008-*.md、0016-*.md、0017-*.md

## 专属 delta（检查点）
- 修复落元数据源（manifest.meta.json / gen-manifests.mjs）——gen 重跑后产物仍合规，禁只改 plugin.json 产物
- Agent Plugins 1.0.0 schema 原文重读为准（R4-05 baseline 可对照但官方原文优先）
- 常驻守卫零依赖（结构断言）；ajv 一次性校验留证（schema 出处+版本+命令+结果入报告）
- 本票只做合规，不做上架（用户闸门）

## 专属验收
- reports/34-check.mjs PASS + npm test / npm run package / cli selftest 不回归
- 其余完成判据遵循 handoff 内的完成定义

## 开工第一句
先复述：本票阻塞状态 + 必读清单逐条路径，确认后再动手。

## 收尾

**❗ 收尾硬要求——以下动作缺任一项 = 本票未闭环（W2/W3 V2 重演防线）**：① 报告落盘 `reports/34-report.md`；② ledger 本票行状态回写 done/deferred；③ WORKFLOW §4 追加 lessons 行；④ commit message 引用守卫结果。

报告写入 reports/34-report.md（完成定义逐项 / 阻塞 / lessons 候选 / 引用文件）；ledger 回写与 lessons 追加按 handoff 完成定义执行；版本控制遵循 WORKFLOW §4.2。
