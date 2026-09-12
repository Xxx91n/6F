# spec 仓角色正式化 + 工程实现迁移至工程仓（supersede ADR-0002）

**Status: superseded by ADR-0011（2026-09-12）｜Supersedes: ADR-0002**

## Context
- A+B 组合（完成 R2 spec 契约 + 进入工程实现）经用户 2026-09-12 批准；触发源 = 子 Agent 验收标准（编译/打包/启动测活/每平台 test 闭环）预设可构建软件交付物，与 ADR-0002「本仓 = spec-level 规划、实现属仓外」边界冲突。
- atomcode 深度调研（检索标签 R2-Q7-engineering-boundary）：8 个工业对标模型中 7 个为直接先例，收敛为「文档是 gate、实现是证伪」；ADR 修订唯一合规路径 = supersede 链（Fowler + AWS 双源）；分仓判据 = nx.dev + Spec Kit #1743。
- ADR-0002 不可 in-place 修改 → 以本条 supersede。

## Decision
1. **ADR-0002 superseded**：其「spec-level 完整规划、拒绝 MVP 切片」核心保留（本仓仍是 spec 仓）；其「执行阶段实现优先级排序属仓外」正式化为「工程实现迁移至独立工程仓」。
2. **本仓角色正式化** = spec / 决策 / 契约仓：承载 ledger、ADR、CONTEXT 术语、spec 契约（含 R2-01~05）；不承载产品实现源码。
3. **另起工程仓**承接实现：polyrepo 判据（几乎不共享代码 / spec 与实现变更节奏不同 / CI 与访问控制需隔离）。
4. **spec↔工程仓契约衔接** = 版本化契约产物（plugin.json / mcp.json schema、mode 枚举、receipt 协议字段以版本化契约发布，工程仓按版本消费），不靠子模块耦合。
5. **工程仓验收 = walking skeleton**：编译通过、打包通过、启动并测活软件进程；每平台 test 闭环（CI matrix：Windows/macOS/Linux × 运行时；smoke→sanity→regression 分层 + liveness probe）。
6. **时序**：R2-01~05 先封口（已写入 spec.md），再启工程 skeleton。

## Consequences
- 正面：角色清晰；ADR supersede 链自洽（本仓 S2 ADR 质量判据本身检查 supersede 链）；工程 CI 与 spec 仓解耦。
- 负面：多一个仓的维护成本 + spec drift 风险（Spec Kit #1743 与 deployhq 均指出 multi-repo 是已知弱点）→ 用版本化契约产物缓解。
- 不改：ADR-0003（商业层排除）不变；验收止于「可构建/可打包/可测活/可签名」，上架/分发归仓外。

## References
- 调研报告：.scratch/macro-audit/reports/R2-Q7-atomcode-research.md
- ledger D-014（current）；D-002 / D-008（revised，由本条承载迁移）
- 被 supersede：ADR-0002
