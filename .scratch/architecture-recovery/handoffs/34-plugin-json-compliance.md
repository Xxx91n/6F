# Handoff: 34 — plugin.json 对齐 Agent Plugins 1.0.0

- **A-xxx covered:** A-039
- **Decision:** spec.md §R5-D3
- **对应 issue:** issues/34-plugin-json-compliance.md
- **对应 prompt:** prompts/34-plugin-json-compliance.md

## 上下文摘要（3-5 句）
#31 P1 预核对发现 engine/plugin.json 不合 Agent Plugins 1.0.0：缺 $schema const、schemaVersion/skills/mcp 越界属性、extensions 数组 vs 反向域名对象图。plugin.json 由 scripts/gen-manifests.mjs 从 manifest.meta.json 生成——修复必须落在元数据源层。本票是上架硬前置链第一环；独立小票不并入分发收尾（D-036 明示修正）。

## 完成定义（本票 done 判据）
- 不合规项逐条对消；gen 重跑产物仍 1.0.0 合规（双 manifest 单一元数据源链路不回归）
- 常驻守卫 reports/34-check.mjs（零依赖结构断言：$schema 值 / extensions 为对象 / 越界属性白名单）PASS
- ajv 一次性校验留证（schema 出处 + 版本 + 命令 + 结果写入报告；一次性依赖不进常驻守卫）
- npm test / npm run package / cli selftest 不回归
- ledger A-039 回写 done；WORKFLOW §4 lessons；commit 引 A-039 + 守卫结果

## 通用调研要求（每票适用，写一次）
- **atomcode 深度调研**（per WORKFLOW §4.2.3）：回顾 baseline（macro-audit 账本 current 决策，重点 D-012/D-026/D-027/D-036）、spec.md §R5、engine 现状；输出调研报告含推荐方案；与任何 current 决策冲突时显式点名，不得静默改向
- **回顾 docs/adr/**：0008（五层盒子/双 manifest）、0016（纯 Agent Plugins 生态）、0017（preview 模型）
- **回顾 CONTEXT.md**：「Agent Plugin / Receipt / Release Preview」词条
- **对标工业界成熟方案**：调研报告列举 ≥2 个插件 manifest schema 校验先例作类比

## 阻塞
- 无（与 #35 并行首票）

## 关键参考
- reports/31-upstream-drift.md + reports/31-report.md（P1 预核对不合规项清单）
- engine/scripts/gen-manifests.mjs、engine/manifest.meta.json、engine/plugin.json、engine/.claude-plugin/plugin.json
- Agent Plugins 1.0.0 plugin schema 原文（R4-05 已读 baseline；再读以官方原文为准）
