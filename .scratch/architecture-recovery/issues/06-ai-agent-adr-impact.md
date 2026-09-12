# 06: AI-agent 对 ADR 质量冲击评估框架

**A-xxx covered:** A-006
**Spec ref:** [spec.md](spec.md) §Decision 4.6

**What to build:**
评估框架（指标定义 + 取样方法），实际评估推迟

**Blocked by:**
None (can start immediately)

**Status:** ready-for-agent

- [ ] 必须明文"推迟"——不要做实际评估
- [ ] 指标必须可机检（不能只是定性）
- [ ] 1) 评估指标清单（至少 3 个：决策一致性 / 可逆性 / 上下文漂移）；2) 取样方法（哪个仓库、什么 commit 范围、什么 prompt）；3) 推迟触发条件