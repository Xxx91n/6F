# 07: DuckDB fact table 写入策略

**A-xxx covered:** A-007
**Spec ref:** [spec.md](spec.md) §Decision 5.1

**What to build:**
DuckDB SSOT 的写入策略（单写多读）+ 并发控制（事务隔离）+ 版本控制（每个事件带 version 字段）

**Blocked by:**
None (can start immediately)

**Status:** ready-for-agent

- [ ] 必须选一个写策略（不能"两种都可以"）
- [ ] 并发延迟评估必须量化
- [ ] 1) 单写进程架构图；2) 事务隔离级别选择理由；3) version 字段 schema（递增策略）；4) 多读并发对单写的延迟影响评估