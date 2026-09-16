# 决策摘要索引（Implemented Decisions Digest）


> 本目录由本轮 architecture-recovery 流程收口时从 `.scratch/architecture-recovery/decision-ledger.md` 抽出 17 条 implemented 决策 + 1 条 deferred。
> 完整原始账本保留在 `.scratch/architecture-recovery/decision-ledger.md`（随 .scratch 一并归档）。
>
> 后续追加：**ADR-0018** 版本与编年制度化（0.x＋锁表＋报告契约／双层 CHANGELOG）｜2026-09-15｜D-037/D-039（锁表实体归 #44）。

## 18 implemented 决策摘要

| ID | 标题（一行）| 关键交付物 | 守卫 |
|---|---|---|---|
| A-001 | S1 定位收敛语义度量方法 | 01-check.mjs + 3 仓实测 + 70% 校准 | PASS 75 assertions |
| A-002 | S2 ADR 质量事后补写判定 | 02-adr-header-scan/fallback + 3 仓扫描 | 扫描 exit 0 |
| A-003 | S4 ADR 假设提取工具链 | LLM 抽取 prompt + 6 案例 + 抽检清单 | 25/25 引文逐字命中 |
| A-004 | S5 单人仓判据降权 | 04-downweight-check.mjs + 4 分桶 + 3 案例 | PASS（4 buckets / matrix sync / 3/3 cases）|
| A-005 | 25 采集单元矩阵 | 05-unit-matrix.json + schema + machine check | PASS 25/25 cells |
| A-007 | DuckDB fact table 写入策略 | 单写多读 SWMR 决议 + ADR-0005 一致性论证 | 决策矩阵 + 4 排他理由 |
| A-008 | Schema 版本演进规则 | Hybrid registry + monotonic version + BACKWARD_TRANSITIVE | 决策矩阵 |
| A-009 | Read model 失效策略 | 09-stale-check.mjs + SLA 5s + 4 状态机 | PASS 15 checks |
| A-010 | Cross-scale correlation key | trace_id/baggage_id CHAR(32) + W3C/OTel | 字段 5 要素 |
| A-011 | LangGraph supervisor 适配 | 自研薄协调层 + T1/T2 重评触发器 | 决策 + 触发器 |
| A-012 | Data mesh 失败模式防线 | Ownership Edge Gate 防线一 + 监控指标 | 防线设计 |
| A-013 | 工具对齐评估 | 工具×5 维度契合度矩阵 + 决策 | 矩阵 + 决策 |
| A-014 | 报告模板共享骨架 | 14-skeleton-check.mjs + 4 章/45 字段/20 单元 | PASS（4 章/45 字段/20 单元/64 切片/31 xref）|
| A-015 | Scale 切片差异边界 | 15-slice-check.mjs + 5 切片×8 列 + 10 极端 | PASS 13/13 |
| A-016 | 渲染样式与模板结构切分 | 16-render-split-check.mjs + spec 109 ⊊ demo 137 | PASS 16/16 |
| A-017 | 10 路径成本/价值权衡 | 10 路径决策表 6 可点/4 文档 + 估计成本 | 决策矩阵 |
| A-018 | Failure path 明文 | 18-failure-demo.mjs + 5 failure paths 4 要素 | PASS 9/9 |

## 1 deferred 决策

- **A-006**：AI-agent 对 ADR 质量冲击评估框架 — 评估框架已交付（W1 #06），但实际评估推迟，触发条件 = AI 代码生成主流化。**重启方法**：在 D-007 演示脚本加 `is-ai-code-mainstream?` 探测；或设 calendar reminder。

## ADR 覆盖映射

| 决策簇 | ADR | A-xxx |
|---|---|---|
| 5 scale scope + No MVP + Boundary | ADR-0001/2/3 | 范围定义层 |
| 战略 quadrant 5 维 | ADR-0004 | A-001/2/3/4/5/6 |
| 集成架构 = Hub-of-Facts | ADR-0005 | A-007/8/9/10/11/12/13 |
| 报告模板 = 共享骨架 | ADR-0006 | A-014/15/16 |
| 演示场景 = 10 路径 | ADR-0007 | A-017/18 |
| 五层盒子（Agent Plugin 形态） | ADR-0008 | A-039（#34 plugin.json 合规） |
| 本地优先＋URL opt-in intake | ADR-0009 | A-045（#40 泛化验证路径） |
| spec 仓/工程仓分离 | ADR-0010 | —（组织边界，账本行未直引） |
| 单仓 subdir + but 分支 | ADR-0011 | —（VCS 纪律载体） |
| 价值验证循环先行 | ADR-0012 | A-037（R5 票据包立案语境） |
| 三层验收闸 | ADR-0013 | —（验收协议骨架） |
| 上游双轨适配＋vendor 逃生舱 | ADR-0014 | A-036/A-040（#31/#35 CodeLore） |
| 序列化校准（量测效度先行） | ADR-0015 | A-035/A-036（阶段 2a/2b） |
| 分发通道 = Agent Plugins only | ADR-0016 | A-046（原 #41）/ A-051（#41a 仓内文档面） |
| Preview 发布模型（诚实披露） | ADR-0017 | A-043（#38 强制披露）/ A-051（#41a README 边界） |
| 版本与编年制度化 | ADR-0018 | A-051（#41a 仓根编年首条）；锁表归 #44 |
| 多写者域终裁（SWMR 门面＋判据意图读法） | ADR-0019 | D-043（轮 8 收口窗口）；承 D-034④ 触发器域 |
| 托管平台 API 适配器 = REST 主路＋gh 可选回退 | ADR-0020 | D-048（轮 11 Q1）；#47 立案 |
| 出站 license = Apache-2.0＋copyleft 禁 vendor | ADR-0021 | D-051（轮 11 Q4）；#41b 落盘 |
