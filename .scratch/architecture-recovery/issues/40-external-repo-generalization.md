# 40: 非自有公开仓泛化验证 ≥1（URL opt-in 首实用户）

**A-xxx covered:** A-045
**Spec ref:** [spec.md](spec.md) §R5-D9

**What to build:**
≥1 非自有公开仓经 URL opt-in 路径（Repo Intake：clone 至隔离缓存、全深度、禁远程配置执行、凭据复用本地 git 凭据链、浅 clone 显式拒绝）跑通 Macro-B；产出泛化证据回写。Macro-B GA 前置条件——同主仓试点属 dogfooding（generative not evaluative），不构成泛化证据。

**Blocked by:**
#39（三仓 one-shot 先跑通，泛化口径才有对照基线）

**Status:** done（2026-09-16 实跑完成——open-gsd/gsd-core 经 URL opt-in 接入，Macro-B unsupported 如实落数，RCP-d4f119c5a2cac629）

- [x] 目标公开仓选定 + 选定理由落文（规模/ADR 健全度/语言栈适配）→ `reports/40-target-selection.json`（gsd-core：非自有/真实 JS 项目/92 ADR/5887 commits/dash+加粗形态多样性；madr 淘汰留痕）
- [x] URL opt-in 全路径实跑（clone 隔离缓存 + 全深度校验 + Macro-B 报告产出）→ engine `repo add`（intake.ts + cli.ts + intake.test.mjs 31 断言）→ `reports/40-intake-receipt.json` + `40-clone-cache/repos/f0b1eba9471ef4de` → `reports/40-out/40-macro-b-gsd-core.*`
- [x] 泛化证据回写（与三仓 one-shot 结果对照；差异如实写）→ `reports/40-external-comparison.json` + `reports/40-report.md` §4.2（unsupported；TC-2 RED 归因=Status dash+加粗形态漏认 vs anysearch-cli 真缺失，如实区分）
- [x] 守卫 reports/40-*.mjs PASS → `reports/40-check.mjs`（见 40-report §6 断言清单）
