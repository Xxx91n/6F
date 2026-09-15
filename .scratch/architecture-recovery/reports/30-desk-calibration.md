# 30-desk-calibration — 阶段 2a 冻结校准清单（A-035 / spec §R4-D5）

> 单变量纪律：本清单只在冻结首报数据（6F@fc00d458，228 条事实）+ spec 内部契约上做 desk 推导——不改冻结数据、不接新上游。每项标置信域；单写者证据禁外推多写者域（D-024）；待探针占位全部带「满足判据 + 复审时点」两字段。机读版 = `30-desk-calibration.json`。
> 冻结锚点：TC-1 INCONCLUSIVE（judgeable 2<5）/ TC-2 v1=0.2462 RED → v2=0.5846 RED（修正读数）/ TC-3 0.6000 AMBER / git.author_matrix top_share=1.0 / schema v0 16 字段（trace_id/baggage_id CHAR(32) CHECK 约束）/ 降级路径 JSONL+assertAppendOnly 已实跑。

| 任务 | 内容 | desk 草案 / 锚行 | 置信域 | 待探针占位 |
|---|---|---|---|---|
| 2 | S2 ADR 质量「事后补写 >20% 判红」+ 头部时间戳一致性核查 | desk 草案：判据改造为 decision_date 取数走 v2 回退链（dash→内联→inline-iso→git，27-prereg R1）；「YAML 头一致性核查」扩为「头部字段全形态存在性核查」（dash/裸行/加粗皆计）。冻结集实测锚：judgeable=2/13 < min_n=5 → INCONCLUSIVE（TC-1 原判定复核成立）；delta_days 全部 ≤0（git 首提交与文档日期同日），6F 无补写现象但样本量不足判红。 | 单写者单仓域（6F 冻结集 n=13，judgeable 2）；禁外推多作者仓 | 满足判据：≥1 外部目标仓 ADR 集跑 TC-1 达到 judgeable ≥ min_n(5)；复审时点：阶段 3 铺开（首个非 6F 目标仓接入时） |
| 4 | S5 所有权边界单人仓判据降权规则 | desk 草案：单作者仓（top_share=1.0）S5 判据降权为 not_applicable 档（不产 RED）；归一化曲线取 ownership-entropy/team-size 单调函数，n=1 端点锚定。冻结集实测锚：git.author_matrix 全文件 top_share=1.0（228 条事实中 gitlog 族 author_matrix 全单作者）。 | 单写者域；团队规模曲线形状缺外部分布数据 | 满足判据：≥2 个公开数据点（team-size vs ownership-entropy 或 bus-factor 分布）；复审时点：阶段 3（工业界小团队分布数据可得时） |
| 5 | 5 维 × 5 scale = 25 采集单元判据矩阵 | 已锚行（非草案）：S1 行实测锚 = TC-3 最低覆盖率 0.6000 AMBER（23-measurements.json）；S2 行实测锚 = TC-2 v2 修正读数 0.5846 RED + 字段缺失分布（27-dual-readings.json）。S3/S4/S5 行占位待探针。 | 已锚（实测） | 满足判据：S3/S4/S5 行各自接入对应上游后出首份实测读数；复审时点：2b（CodeLore，S3/S4 相关）/ 阶段 3（Scorecard、repomix 相关） |
| 7 | DuckDB fact table 单写多读 vs 多写多读并发与版本控制 | 单写者域草案：SWMR 即可——写者 = kernel CLI 单进程串行 append（只追加纪律由 assertAppendOnly 在降级路径已实跑 228 条 INSERT 校验）；读者 = 报告生成/审计查询只读。版本控制 = fact 行自带 schema_version 字段（SCHEMA_VERSION_V0）+ observed_at；演进规则见任务 8。多写者域登记 self-probe（R5-D024 纠偏已定）。 | 单写者域（228 条冻结实测 + 降级 JSONL 路径实证）；多写者域禁外推 | 满足判据：多写者并发写入实测（多采集器并行写同一 fact 表）无丢行/乱序/冲突；复审时点：阶段 3 铺开多采集器后（self-probe） |
| 8 | Schema 版本演进规则（AsyncAPI 式不可变契约） | desk 草案：AUDIT_FACT_FIELDS 一经发布不可改；演进 = 新增 SCHEMA_VERSION_V(n) 常量 + 新 fact 行带新 schema_version；历史行不回迁。消费方按 schema_version 分发解析。实测锚：schema.ts 已建 AUDIT_FACT_DDL + assertAppendOnly 双闸（20-check 36/36）。 | 内部契约级（本仓 schema.ts 实现与断言已闭环） | —（无占位） |
| 9 | Read model 失效策略：陈旧读容忍度 SLA | desk 草案：现行管线为单进程批式（采集→fact→叙事→裁决同 run）→ 陈旧窗口 = run 边界。规则：读模型行必携 observed_at + head_sha；陈旧判据 = 消费时 repo head != fact.head_sha → 触发重跑闸（不作部分更新）。SLA 值随调度形态定，骨架期取「报告生成时 head 一致」即新鲜。 | 单仓单进程批式域；增量/增量刷新路径未涉 | 满足判据：增量采集或定时调度形态出现时以实测 staleness 分布定 SLA 数值；复审时点：阶段 3（调度/增量形态引入时） |
| 10 | cross-scale correlation key + OTel Baggage 集成 | desk 草案：trace_id = sha256(repoRef|head_sha|observed_at)[:32]（CHAR(32) CHECK 正则已入库，A-010 继承）；baggage_id = run 级派生同构。OTel Baggage 集成 = 可选桥——引入 OTel SDK 时 baggage_id 作为 traceparent 容器透传；语言栈已定 TypeScript/Node（engine/）。 | 内部契约级（schema 字段+约束已实跑 228 条） | 满足判据：跨 scale 双采集器同 run 产出共享 trace_id 的事实行；复审时点：阶段 3 多采集器/多 scale 接入时 |
| 11 | LangGraph supervisor 与 hub 协调层契合度（adopt vs 自研） | desk 草案：hub 协调层现为确定性 TS 管线（23-first-report.mjs 式 orchestrator）；LangGraph = Python 生态 → adopt 判负，维持自研调度（deterministic collectors + gates）。复审条件：语言栈扩 Python 面或 LangGraph 出 TS 一等支持。 | desk 推断（生态契合度判断）；未实测 LangGraph | 满足判据：若 Python 组件引入，复评 LangGraph adopt；复审时点：阶段 3 / 语言栈变更时 |
| 12 | Data mesh 三失败模式逆推防线 | desk 草案（已部分实证）：①无人拥有 in-between → COLLECTOR_DESCRIPTORS 注册表 + DETECTOR_BINDING 逐判据绑定族/同族对照；②静默断裂 → PC-1/PC-2 正对照 + NC-1 负对照 + PROBE-INVARIANT 解析数断言；③重复劳动 → Hub-of-Facts 单一事实表 + family 命名空间隔离。 | 内部契约级（三防线均有在库代码/判据锚） | —（无占位） |
| 13 | 工具对齐：metrics layer / OTel baggage / AsyncAPI / LangGraph × 语言栈 | desk 草案：语言栈已定 = TypeScript/Node ≥20（engine/）。metrics layer → 不采用独立 metrics 层，事实表 metric 字段即度量面；OTel baggage → 见任务 10 可选桥；AsyncAPI → 工具链未选定，事件契约现由 schema.ts 常量承担；LangGraph → 见任务 11 判负。 | desk 草案（选型判定）；AsyncAPI 工具链未定 | 满足判据：AsyncAPI 工具链敲定并产出首份 v1 契约文；复审时点：阶段 3 |
| 14 | 共享骨架「最大公约数」字段清单 | desk 草案（首报结构实测锚）：交集字段 = report_id / head_sha / tree_sha / observed_at / scale / quadrants[](quadrant,applicability,verdict,verdict_gate) / adjudication_entries[](criterion_id,band,basis_refs,anchored_fact_ids,anchored_evidence_ids) / evidence[](evidence_id,source,locator,claim,reproduce_cmd) / machine_contract.verdict_enum。证据 = 23-first-report.json 与 C1/C2/C3 区块（generate.ts FIELD_REQUIREMENTS）。 | 单 scale 首报实测域（Macro-B happy+failure 双路径已覆盖） | 满足判据：第二 scale（Micro-A/B 任一）首报验证交集字段无缺漏；复审时点：阶段 3 多 scale 铺开时 |
| 15 | Scale 切片差异边界：Macro-A 跨仓叙事 vs Micro-A 行级 | desk 草案：边界锚 = subject_ref 粒度（repo 级 vs file/hunk 级）+ 叙事单元（生态趋势段 vs diff 行级证据）+ verdict_gate 作用域（仓聚合 vs 单 PR）。Macro-A 允许跨仓 subject_ref 列表；Micro-A 证据粒度到行锚（locator=L<n>）。 | desk 草案（接口设计）；真实行级试点未做 | 满足判据：≥1 条 Micro-A 真实 PR 报告产出且字段清单满足骨架交集；复审时点：阶段 3 真实仓库试点 |
| 16 | 渲染样式与模板结构切分 | desk 草案（已实证同构先例）：generate.ts 纯逻辑产 ReportInput → md/json 双产物同源（24-calibration CI-04 已登记）；切分线 = spec 锁结构与字段（ReportInput 契约），demo/渲染层自定样式。守卫锚 = 23-first-report-check.mjs 区块序断言。 | 内部契约级（单一生成器双产物已实跑） | —（无占位） |

## 汇总

- 草案 12 项 + 已锚行 1 项（任务 5）；无占位 3 项（8/12/16 纯内部契约）；待探针占位 10 项全部两字段齐备。
- 单写者域置信：任务 2/4/7 明确标注禁外推多写者（D-024 纪律落地）。
- 冻结数据零改动：23-measurements.json / 23-facts.jsonl / 23-first-report.* 均未触碰（守卫断言）。
