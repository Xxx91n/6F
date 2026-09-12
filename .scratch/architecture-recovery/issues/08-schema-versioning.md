# 08: Schema 版本演进规则

**A-xxx covered:** A-008
**Spec ref:** [spec.md](spec.md) §Decision 5.2

**What to build:**
AsyncAPI 事件契约风格的 schema 演进规则（schema 不可改 / 版本号演进 / 消费者按版本订阅）+ Schema 注册中心

**Blocked by:**
#07

**Status:** ready-for-agent

- [ ] 注册中心位置必须确定（库？文件？HTTP 服务？）
- [ ] 版本号必须明确语义
- [ ] 1) Schema 注册中心位置与 API；2) 版本号语义（主/次/补丁含义）；3) 消费者订阅机制（订阅哪个版本、跨版本兼容策略）；4) Schema 变更触发的事件契约