# 21: 确定性采集器

**A-xxx covered:** A-022
**Spec ref:** [spec.md](spec.md) §R3-D3

**What to build:**
实现确定性采集器：S2 ADR 结构扫描 + S1 定位素材 + git log 三族，输出形状绑定 schema v0，只追加写入 fact table。

**Blocked by:**
#20

**Status:** ready-for-agent

- [ ] 采集清单落文（每族：输入 → 抽取逻辑 → 输出字段映射表）
- [ ] 不接 LLM（无网络调用断言，可机检）
- [ ] 正对照与真判据 detector 同族声明（哪些判据绑哪族采集器，写明）
- [ ] 守卫断言：采集器对 fixture 输入的输出形状符合 schema v0
