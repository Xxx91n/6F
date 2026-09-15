# ADR-0017: 发布节奏模型 = Preview 分级发布（单层先行 + 逐层漏斗；build-scope ≠ release-sequence）

- Status: accepted
- Date: 2026-09-15
- Deciders: 用户（grill 轮 6 Q3/Q4/Q6，atomcode 两轮取证后拍板）
- Ledger: D-031 / D-032 / D-034（current）；划界吸收 ADR-0002（superseded）语义残留；承继 ADR-0001（5 scale 范围 standing）、ADR-0016（渠道方向）

## Context

阶段 2 双结题后首个可发布单元成形（Macro-B 首报三层闸门全过）。上架形态候选：等 5 scale 全齐（姿态完整但首发时点无限后移）vs 单层先行（MMP 判据：对早期用户完整闭环即可）。审计型工具首发误读风险高（信任账户不可逆），须同时解决「先发」与「不夸大」。

## Decision

发布节奏模型 = **Preview 分级发布**：
1. 首发 = Macro-B 单层 + 「capability 1 of 5 · preview」标注 + 0.x 版本语义 + changelog 明示当前覆盖范围；
2. README/marketplace 描述首段披露能力边界，5 scale 仅作 roadmap 叙事非可用承诺；
3. 其余 4 scale 各走独立 preview→GA 漏斗不打包等齐；层序 = Macro-C → Micro-A → Micro-B → Macro-A（D-034）；
4. 演示面 = 披露制非资产制：上架期仅交付已上架层 happy+failure 双件（2/10），未上架层只做文字披露 +「Not yet in preview」标注；其余 8 路径补齐 = 各层 preview 票 DoD 准入件；
5. 划界入规：**build-scope**（5 scale 全规划，ADR-0001 standing）≠ **release-sequence**（分层暴露）——preview 上架不构成 ADR-0002 禁令下的 MVP 切片（禁令作用于 spec 层完整性，发布时序为正交维度）。

## Considered Options

(1) 单层 preview 先行 / (2) 等 5 层齐发 GA / (3) 单层上架但不标 preview。(2) 使首发时点取决于最慢层，且「等齐再上」在产品启动层无工业惯例（staged rollout 管的是发布工程非产品启动）；(3) 审计工具不主动框定边界会被独立评测者代框（Semgrep 反例：README 明文承认能力边界反成可信度资产）。选 (1)。

## Consequences

- 「降级披露机制」（⚠ unverified / ⚠ 数据未接）从内部质量机制升级为对外承诺载体；preview 标注诚实是决策本体非装饰。
- 上架动作本身仍属用户闸门（D-026/D-027）——本 ADR 不授权上架。
- 每层 preview 上架票强制含「该层 happy+failure 演示双件」完成定义（D-007 十路径矩阵不缩减，仅调度时序）。
- Agent Plugins 生态 preview 标注字段未成文，上架票前置含查证子任务（D-031⑤）。
