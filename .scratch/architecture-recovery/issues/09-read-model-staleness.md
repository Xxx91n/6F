# 09: Read model 失效策略

**A-xxx covered:** A-009
**Spec ref:** [spec.md](spec.md) §Decision 5.3

**What to build:**
陈旧读容忍度 SLA（默认 5 秒）+ 触发条件（投影延迟 > SLA 时报警）+ 与 D-006 报告模板的"陈旧数据标记"字段对齐

**Blocked by:**
#08

**Status:** done (W3 #09 闭环 2026-09-12 — reports/09-report.md; 守卫 09-stale-check.mjs PASS 15 checks)

- [x] SLA 必须是数字（不能"尽快"）
- [x] 字段定义必须与 D-006 报告模板字段名一致
- [x] 1) SLA 默认值 + 调优指南；2) 报警触发逻辑；3) 报告模板"陈旧数据标记"字段定义（与 D-006 对齐）