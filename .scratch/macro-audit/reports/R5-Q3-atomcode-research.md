# R5-Q3 atomcode 深度调研报告 — 2a 冻结校准范围与争议缺口裁定

> 调研问题：16 项 spec 信息缺口按数据依赖分类（desk 可校准 vs 必须等上游探针）是否站得住；重点裁定任务 7（事实表并发写入策略）的争议归类。
> 冲突协议：调研结论与账本 current 决策零冲突、零 revised（详见 §4）。

## §0 执行通道留痕

- carrier：ctx_batch_execute（shell=bash），label=atomcode，concurrency=1，timeout=600000，串行单跑，一次成功（15.6KB / 12 sections 自动索引）。
- resume 锚点：**未捕获**——返回预览截断处未含锚点行，三次 ctx_search 定向找回未果。如实登记（W5 教训要求留锚）。缓解：全文已索引，可用检索词找回（`桌面校准`、`三问决策树`、`self-probe`、`stale prerequisite`、`WarpStream`、`假设管理 部分满足 拆分`）。
- 配额自查：检索 8+ 次 / 三引擎（Exa+Tavily+AnySearch）/ 8 篇原文精读 / 8+ 域名 / 五角度（Official/Comparative/Criticism/Currency/Community）全覆盖；PMI 源 403，经 pmessentials 交叉验证。

## §1 执行摘要

1. **三问决策树**（分类判据显式化）：
   - Q1 未知变量是外部工具输出的形态/语义/规模（无法从 spec 文本或自有数据推导）？→ **上游探针轮**（empirical calibration via upstream probe）
   - Q2 未知变量是自家系统在负载/争用下的行为？→ **自证探针**（self-probe）——属铺开阶段实测，不是上游探针
   - Q3 未知变量可由 spec 内部契约 + 冻结首报数据推导？→ **Desk calibration**
2. 三「必等上游」类逐一核验**全部判定正确**，且各有官方文档实证：
   - CodeLore：explain_file 输出受 `CODELORE_LLM_` 环境门控（fact_sheet 总有、narrative 可缺且调用仍成功）——可用面取决于部署环境，desk 无法冻结；
   - OpenSSF Scorecard：`--format=probe` structured results（44 probe、finding 含 probe/outcome/values、experimental→stable 生命周期）——字段形状只有实跑才能固化；
   - repomix：`--token-count-tree` 每仓真实层级分布，跨仓差异巨大。
3. desk 可校准清单（阈值核查/降权规则/schema 版本演进/SLA/correlation key/协调层选型/失败模式防线/工具契合度/报告模板三件套）**全部命中 Q3，判定成立**——与 spec 仓 =「决策/契约仓、版本化契约产物消费」定位一致。
4. **争议任务 7 裁定 = (a)+(c) 混合·按域拆分**：
   - (b) 维持前置 = **错误**——类别错放（并发策略缺 Q2 行为证据，任何上游 schema 复审给的都是 Q1 契约证据），维持等于登记一个**永不满足**的阻断条件（RAID 治理的已知死锁项）；
   - (a) 全 desk = 半对——228 条单写者实测使「等上游 schema 复审」成为失效前置，应关闭；但单写者证据**不可外推**到多写者域（DoD 验证域原则），直接出「完整」并发策略会犯 Iceberg 式错误；
   - (c) 全推迟 = 半对——浪费了单写者域内已验证部分的杠杆；
   - **拆分处置**：单写者维度 → 2a desk 草案（标注置信域）；多写者维度 → 登记为**自证探针**项、铺开阶段实测后封口；原前置「CodeLore DuckDB schema 复审」标 stale 并在账本记录纠偏理由。
5. **证据充分性门槛**（DoD T&E / IDA 可移植标准）：①验证域原则——model-based estimate 只在实测数据验证过的域内可接受；②预设验收阈值——精度标准须在比对之前设立；③数据不足时补测或显式降级为「模型估计，待实测确认」，禁止静默外推。
6. **失效前置处理惯例**（PMI 假设管理 + RAID）：前置登记必须带「满足判据 + 复审时点」，否则退化成无人复审的死锁项；证据到达 ≠ 前置自动解除，须走显式复审（已满足/部分满足/仍然阻断）写回账本；部分满足时按域拆分而非整项卡死或整项放行。

## §2 工业先例锚点

- **Iceberg single-writer 之争**（任务 7 的多写者域警示）：官方承诺乐观并发可行（assumptions-and-actions 重试模型）；WarpStream 生产实测 ingestion×compaction 冲突率随频率飙升；HN #44767888 证词 500 并发写者翻车；反方证词「一主写者+少量维护任务」典型形态工作良好——**争用行为是「自家 catalog/提交粒度/重试策略 × 真实写者拓扑」的函数，不是任何上游工具 schema 能给的静态知识**。

## §3 来源清单（12，本轮真实打开）

Iceberg Reliability（官方）/ WarpStream 博客 2025-09 / HN #44767888 / iomete 反模式 2026-01 / OpenSSF probe 博客 2024-04 / ossf/scorecard README / emrecdr/codelore README / repomix Basic Usage / DoD T&E·IDA M&S 验证 / PMI Assumptions-Based Planning（403，经 pmessentials 交叉）/ PM Essentials 假设与风险 / PM Majik 建册不复审失败模式。

## §4 与账本冲突核对

**零冲突、零 revised。** 逐条：
- D-023（阶段 2 = 2a 冻结校准 → 2b CodeLore 单上游探针）：本裁定是对其 2a 范围判据的**细化与第三类补全**（self-probe 类目在 D-023 二分法中未显式命名，但不构成推翻——任务 7 的多写者域证据既非冻结首报可得、亦非 CodeLore 探针可得，推迟到铺开与 D-023「Scorecard/repomix 推到阶段 3」同向）→ 呈报新记录 D-024 承载。
- D-020（上游双轨制）：适配层/探针纪律无涉，一致。
- D-016/ADR-0012（四阶段串行）：2a/2b 拆分与自证探针推迟均不改阶段序，一致。
- A-007（已 implemented 的 SWMR 决议）：单写者域 desk 草案只是在其已验证域内重申，不重开决议；多写者域本来就是 A-007 明示的「Phase 4 待实测校准」遗留——本裁定把该遗留正式登记为 self-probe 项，属补位。
- spec-phase-tasks.md 任务 7 前置登记错误（「CodeLore DuckDB schema 复审」）：登记文件纠偏，非 D 记录改向。

## §5 派生待决

- D-024 草案（2a 分类裁定 + 任务 7 按域拆分 + 原前置标 stale）——待用户拍板。
- 2a 开工时的登记纪律补强：所有保留「待 probe」占位的缺口，登记时须带「满足判据 + 复审时点」两字段（源自失效前置惯例）——届时写入 2a 立票票面，不单立 D。
- 16 项缺口中 S3 供应链评分形态类 probe 项（若有）：分类=上游探针、探针时点=阶段 3（per D-023 2b 只接 CodeLore 的约束），2a 只出占位标注。
