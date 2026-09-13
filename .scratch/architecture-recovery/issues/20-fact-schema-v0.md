# 20: fact table schema v0

**A-xxx covered:** A-021
**Spec ref:** [spec.md](spec.md) §R3-D2

**What to build:**
在 engine/ 落地 DuckDB fact table schema v0：字段级清单（含 correlation key 前置字段、version 递增、事件只追加）+ DuckDB-in-node 绑定选型实现。

**Blocked by:**
None (can start immediately)

**Status:** ready-for-agent

- [ ] DuckDB 绑定选型唯一（不得「两种都可以」）+ 选型理由量化（安装体积/API 面/维护度）
- [ ] 字段清单落文（表名/字段/类型/约束逐项）
- [ ] 只追加不可改写断言（update/delete 路径不存在或守卫拒绝）
- [ ] 沿用 A-007/A-008/A-010 决议不重开；构建与测试一律走 CI（本机禁构建）
