# Report: 34 — plugin.json 对齐 Agent Plugins 1.0.0 + AJV 校验入 guard

**A-xxx:** A-039 ｜ **Spec ref:** spec.md §R5-D3 ｜ **Status:** done（2026-09-15）

## 完成定义逐项

- [x] plugin.json 不合规项逐条对消：`$schema` const 补入；`schemaVersion`/`skills`/`mcp` 越界属性移除（schema `additionalProperties:false` 下三者皆非法顶层键）；`extensions` 数组 → 反向域名对象图 `{"com.macroaudit.hooks":{"path":"extensions/com.macroaudit.hooks"}}`；`license` 补入（meta 单源新增字段）
- [x] 修复落元数据源：`manifest.meta.json` +license；`scripts/gen-manifests.mjs` 产物模板改写 + 一致性断言组重写（$schema const / 白名单 / 对象图 / skills 声明在 claude 侧）；gen 重跑幂等（`node scripts/gen-manifests.mjs` → 7 PASS + GEN-OK，二次跑全 CLEAN 无 DRIFT）
- [x] 常驻守卫 `reports/34-check.mjs` 零依赖结构断言 **PASS 11/11 exit 0**（含 G11 gen 幂等断言）
- [x] ajv 一次性校验留证：`npx -y ajv-cli@5.0.0 validate --spec=draft2020 -s reports/34-plugin.schema.json -d engine/plugin.json` → **plugin.json valid**（schema 实物副本存 `reports/34-plugin.schema.json`，出处 https://agent-plugins.org/schemas/1.0.0/plugin.schema.json，draft 2020-12）
- [x] `npm test` 不回归（smoke 6/6 + collectors 14/14 + codelore-adapter 7/7）；`node dist/cli.js selftest` ok=true；`npm run package` 31 文件 tgz

## 关键决策记录

- `skills`/`mcp` 不移入 extensions 也不保留顶层——Agent Plugins 1.0.0 下二者是**目录/文件约定产物**（skills/ 目录、mcp.json 文件），manifest 不声明；`.claude-plugin/plugin.json`（Claude Code 侧）保留其自有 skills/mcp 字段不变。
- 一次性 ajv 校验未进常驻守卫（#15 教训：一次性依赖不进常驻守卫）——常驻守卫用零依赖结构断言覆盖同一断言面。

## 阻塞

无。

## 调研依据（复用声明）

不合规清单复用 reports/31-upstream-drift.md §4（P1 预核对）+ Agent Plugins 1.0.0 plugin schema 官方原文（实物副本 reports/34-plugin.schema.json，draft 2020-12，ajv 校验留证）；双 manifest 先例 = D-012/ADR-0008；本票为合规执行票，未另跑 atomcode；无新冲突。

## lessons 候选

- gen 首跑报 DRIFT 是迁移语义（旧产物≠新产物时记 DRIFT 并改写）——二次跑才应全 CLEAN；守卫断言用「重跑幂等」而非「首跑 GEN-OK」。

## 引用文件

- engine/plugin.json、engine/manifest.meta.json、engine/scripts/gen-manifests.mjs、engine/.claude-plugin/plugin.json
- reports/34-check.mjs、reports/34-plugin.schema.json
- 源：reports/31-upstream-drift.md §4（P1 预核对发现）、reports/31-report.md
