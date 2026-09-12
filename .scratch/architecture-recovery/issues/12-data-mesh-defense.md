# 12: Data mesh 失败模式防线设计

**A-xxx covered:** A-012
**Spec ref:** [spec.md](spec.md) §Decision 5.6

**What to build:**
三大失败（无人拥有 in-between / 静默断裂 / 重复劳动）各一条防线 + 监控指标

**Blocked by:**
None (can start immediately)

**Status:** ready-for-agent

- [x] 每条防线必须有触发条件（不能"持续监控"）
- [x] 监控指标必须可量化
- [x] 1) 三大失败每条一条防线（机制 + 触发条件 + 处置流程）；2) 监控指标清单；3) 防线失效的降级路径