# 37: 试点面可用性审计 — 三仓 PR 人/机比 + supersede 链完整度实测

**A-xxx covered:** A-042
**Spec ref:** [spec.md](spec.md) §R5-D6

**What to build:**
三试点仓（D:/Aworker/env-manager、D:/Aworker/anysearch-cli、D:/Aworker/jiahao）实测脚本：PR 人/机比（含 dependabot/release-please 等非人类 PR 边缘形态识别）、ADR supersede 链完整度、托管面有无；产出 层×仓 capacity 矩阵（Pilot-surface Audit 三问：capacity / ground-truth 可得性 / 泛化增量）。试点前置票——结果决定 #38/#39 试点指派的实测依据。

**Blocked by:**
#34, #35

**Status:** ready-for-agent

- [ ] 三仓实测脚本 reports/37-*.mjs（只读扫描，不写被测仓；被测仓仅作扫描对象）
- [ ] 三指标逐仓落数：PR 人/机比、ADR supersede 链完整度、托管面判定（本地无托管面 = 如实标注下限）
- [ ] 层×仓 capacity 矩阵落文（每格给证据锚：文件/commit/度量值）
- [ ] 守卫 PASS + 报告含与 D-033 角色指派建议的对照（一致/出入如实写）
