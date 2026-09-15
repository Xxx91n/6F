# 31: 阶段 2b CodeLore 单上游探针

**A-xxx covered:** A-036
**Spec ref:** [spec.md](spec.md) §R4-D6

**What to build:**
前置：运行时解析策略判定（容器捆绑 vs 二进制发现）+ 读 Agent Plugins 1.0.0 plugin schema 原文（P1 预核对 baseline）。主体：CodeLore 薄垂直切片（适配器 → fact → 重跑 6F 首报同仓 + 同 spec 版本 diff）；锁版本 + golden 契约测试；provenance 锚定（commit pin + spec 版本 + data fingerprint）。产物 = 数据源漂移报告 + 任务 1/3 实测锚 + README 上游清单 CodeLore 行状态更新（不虚报）。

**Blocked by:**
#30（序列化纪律）

**Status:** ready-for-agent

- [ ] 运行时解析策略判定落文（容器捆绑 vs 二进制发现，D-020 派生待决项闭合）
- [ ] plugin schema 原文 P1 预核对 baseline 落文
- [ ] 适配器 + 锁版本 + golden 契约测试（适配层禁业务规则 per ADR-0014）
- [ ] 重跑同仓同 spec 版本 diff + provenance 三锚；漂移报告 + 任务 1/3 实测锚 + README 状态列更新
