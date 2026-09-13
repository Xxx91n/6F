# 19: push 与 CI 实跑激活

**A-xxx covered:** A-019, A-020
**Spec ref:** [spec.md](spec.md) §R3-D1

**What to build:**
把本地基线推到用户指定远端并触发 engine-ci.yml 首跑，取得首个 CI 绿/红证据；CI 矩阵平台范围明文为最小可证集并随首跑验证。

**Blocked by:**
None（闸门：push 远端与时机须用户明示授权）

**Status:** ready-for-agent

- [ ] 远端与授权必须来自用户原话（不得自选远端或时机）
- [ ] CI 矩阵（平台 × 触发）写入报告并注明「最小可证集」依据
- [ ] 首跑绿/红证据留档（run 链接 + 日志摘要）；红则报告阻塞、不擅自改 workflow
