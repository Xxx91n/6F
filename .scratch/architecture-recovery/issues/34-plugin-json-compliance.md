# 34: plugin.json 对齐 Agent Plugins 1.0.0 + AJV 校验入 guard

**A-xxx covered:** A-039
**Spec ref:** [spec.md](spec.md) §R5-D3

**What to build:**
engine/plugin.json 对齐 Agent Plugins 1.0.0 官方 schema：补 $schema const、收敛 schemaVersion/skills/mcp 范围、extensions 由数组改反向域名对象图（#31 P1 预核对基线 = reports/31-upstream-drift.md 与 31-report.md 发现项逐条对消）。修复落在单一元数据源（manifest.meta.json / scripts/gen-manifests.mjs）而非仅改产物——gen 重跑后产物仍合规。官方 schema 校验留证（ajv 一次性校验，schema 来源与版本写明）；常驻守卫用零依赖结构断言（一次性校验依赖不进常驻守卫）。上架硬前置链第一环；本票只做合规、不做上架。

**Blocked by:**
None（与 #35 并行首票）

**Status:** done — 守卫 PASS 11/11 + ajv valid（2026-09-15）

- [x] plugin.json 不合规项逐条对消（$schema const / schemaVersion / skills / mcp / extensions 对象图）
- [x] 元数据源修复：gen 重跑产物仍 1.0.0 合规；.claude-plugin/plugin.json 与 mcp.json 不回归
- [x] reports/34-*.mjs 常驻守卫（零依赖结构断言）PASS ＋ ajv 一次性校验留证（命令与 schema 出处写入报告）
- [x] npm test / npm run package / cli selftest 不回归
