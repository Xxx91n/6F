# 40: 非自有公开仓泛化验证 ≥1（URL opt-in 首实用户）

**A-xxx covered:** A-045
**Spec ref:** [spec.md](spec.md) §R5-D9

**What to build:**
≥1 非自有公开仓经 URL opt-in 路径（Repo Intake：clone 至隔离缓存、全深度、禁远程配置执行、凭据复用本地 git 凭据链、浅 clone 显式拒绝）跑通 Macro-B；产出泛化证据回写。Macro-B GA 前置条件——同主仓试点属 dogfooding（generative not evaluative），不构成泛化证据。

**Blocked by:**
#39（三仓 one-shot 先跑通，泛化口径才有对照基线）

**Status:** ready-for-agent

- [ ] 目标公开仓选定 + 选定理由落文（规模/ADR 健全度/语言栈适配）
- [ ] URL opt-in 全路径实跑（clone 隔离缓存 + 全深度校验 + Macro-B 报告产出）
- [ ] 泛化证据回写（与三仓 one-shot 结果对照；差异如实写）
- [ ] 守卫 reports/40-*.mjs PASS
