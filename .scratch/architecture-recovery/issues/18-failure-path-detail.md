# 18: Failure path 明文

**A-xxx covered:** A-018
**Spec ref:** [spec.md](spec.md) §Decision 7.2

**What to build:**
5 条 failure path 每条明文：触发条件 / 降级模式 / verdict-gate 拒绝印记 / 报告产物形态

**Blocked by:**
#17

**Status:** ready-for-agent

- [ ] 每条 failure path 4 要素必齐
- [ ] 必须显式与 happy path 对比（不可只列 failure 自身）
- [ ] 1) 5 条 failure path 明文表（每条 4 要素齐全）；2) 至少 1 条 failure path 跑通演示（与 happy path 对比）