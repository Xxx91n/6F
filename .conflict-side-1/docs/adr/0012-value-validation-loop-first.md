# ADR-0012: 主干方向 = 端到端价值验证闭环先行（Value Validation Loop First）

- Status: accepted
- Date: 2026-09-12
- Deciders: 用户（grill 轮 3 Q1，经 atomcode R3-Q1 深调研呈报后拍板）
- Ledger: D-016（current）

## Context

walking skeleton 已验收（build/smoke 6/6、审计返工全绿），但产品核心前提零验证：rubric 判据、DuckDB fact table、证据采集器均为零行实现，没有任何一条带引文的裁决在真实仓库上产生过。16 项信息缺口大半缺实测校准锚点。候选方向：A 工程纵深（横向铺层）/ B spec 深化（desk 校准）/ C 端到端价值验证闭环 / D 分发生态就绪。

## Decision

主干 = C，四阶段串行：阶段 0 = push + CI 实跑 + DuckDB fact table schema v0（事件只追加 + cross-scale correlation key）+ 确定性采集器（git log / ADR 结构扫描，不接 LLM）；阶段 1 = Macro-B 单仓 happy path 于 6F 自身，S2 ADR 质量 + S1 定位收敛起手，跑通 采集→fact→叙事→裁决→报告，产出第一份带引文 + Receipt 的真报告，同路径覆盖一条失败路径（降级 + ⚠ unverified）；阶段 2 = 实测锚回流清扫 16 项缺口；阶段 3 = 铺开其余采集器/scale + 分发收尾。

## Consequences

- 性质为实现级 tracer bullet，非产品级 MVP 切片——5 scale 规格完整度不变（与 ADR-0001 及 ADR-0002→0010→0011 supersede 链一致）；
- 阶段 0~3 串行；禁止 C 与完整 A 并行（稀释最薄）、禁止 B 与 C 并行（desk 校准 vs 实测锚双源冲突）；唯一可并行 = 阶段 0 内 CI 实跑；
- 信息缺口消化顺序反转：先实测锚、后 desk 深化；
- 真报告走「报告生成器」CLI 外壳（ADR-0008 五层盒子既有壳），不引入新分发形态。