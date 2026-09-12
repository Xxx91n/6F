# 02: S2 ADR 质量事后补写判定

**A-xxx covered:** A-002
**Spec ref:** [spec.md](spec.md) §Decision 4.2

**What to build:**
目标仓库 ADR YAML 时间戳头一致性核查清单 + 缺失头时的回退方案

**Blocked by:**
#05

**Status:** ready-for-agent

- [x] 必须扫描真实仓库（不可纯理论） — 6 真实仓 169 ADR（4 本地 + 2 公开）
- [x] 回退方案必须验证精度 — n=108，median abs delta=0d，2.1%>90d（剥离浅克隆污染）
- [x] 扫描工具输出可复用（脚本） — 02-adr-header-scan.mjs + 02-adr-fallback.mjs，ESM Node.js，CLI 参数完整
- [x] 1) 至少 3 个真实仓库的 ADR YAML 头一致性扫描报告（6 仓 169 ADR）；2) 缺失头时的回退方案（git first-commit 时间）；3) 回退方案的精度验证（n=108，median=0d，与带头仓库对比）