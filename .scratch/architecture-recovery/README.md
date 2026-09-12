# architecture-recovery — 本地 spec/ticket/handoff 工作流

> 本目录按 WORKFLOW.md §2 流程落地"架构恢复"工作流：
> 巡检 → 排查 → 方案 → 实施 → 验证 → 收口。本 README 是 Phase 3 之后的工件索引（spec/issues/handoffs/prompts/reports）。
> 与 skill 本体冲突以 skill 为准（WORKFLOW.md §0 兼容声明）。

## 目录结构

```
architecture-recovery/
├── README.md (本文件)
├── WORKFLOW.md (从巡检到收口的完整流程)
├── decision-ledger.md (A-001 ~ A-018，18 项摩擦点登记)
├── spec.md (实施决策，每条覆盖 A-xxx)
├── issues/   (18 张票，每张含 Blocked by 字段)
├── handoffs/ (18 份，每份含 A-xxx 覆盖 + 通用调研要求)
├── prompts/  (18 份启动器，每份 ≤60 行，无违禁词)
└── reports/  (空目录 — 启动器收尾写入 reports/NN-report.md)
```

## 覆盖率对账闸（已完成）

每条 A-001 ~ A-018 至少在 spec.md 一个 Implementation Decision 中出现。
- A-001 ~ A-018 总数：18
- 已覆盖：18
- 无去向记录：0（清单非空时禁止立票 — 当前为空，可立票）

## 并行波次表（从 issue Blocked by 推导，不新造顺序）

- **总票数**：18
- **总波次**：4

### Wave 1 — 8 张票（可并行派子窗口）

| # | 标题 | A-xxx 覆盖 | issue | handoff | prompt | 阻塞 |
|---|---|---|---|---|---|---|
| 05 | 25 采集单元矩阵 | A-005 | [issues/05-25-unit-matrix.md](issues/05-25-unit-matrix.md) | [handoffs/05-25-unit-matrix.md](handoffs/05-25-unit-matrix.md) | [prompts/05-25-unit-matrix.md](prompts/05-25-unit-matrix.md) | None |
| 06 | AI-agent 对 ADR 质量冲击评估框架 | A-006 | [issues/06-ai-agent-adr-impact.md](issues/06-ai-agent-adr-impact.md) | [handoffs/06-ai-agent-adr-impact.md](handoffs/06-ai-agent-adr-impact.md) | [prompts/06-ai-agent-adr-impact.md](prompts/06-ai-agent-adr-impact.md) | None |
| 07 | DuckDB fact table 写入策略 | A-007 | [issues/07-duckdb-write-strategy.md](issues/07-duckdb-write-strategy.md) | [handoffs/07-duckdb-write-strategy.md](handoffs/07-duckdb-write-strategy.md) | [prompts/07-duckdb-write-strategy.md](prompts/07-duckdb-write-strategy.md) | None |
| 10 | Cross-scale correlation key | A-010 | [issues/10-cross-scale-correlation-key.md](issues/10-cross-scale-correlation-key.md) | [handoffs/10-cross-scale-correlation-key.md](handoffs/10-cross-scale-correlation-key.md) | [prompts/10-cross-scale-correlation-key.md](prompts/10-cross-scale-correlation-key.md) | None |
| 11 | LangGraph supervisor 适配评估 | A-011 | [issues/11-langgraph-eval.md](issues/11-langgraph-eval.md) | [handoffs/11-langgraph-eval.md](handoffs/11-langgraph-eval.md) | [prompts/11-langgraph-eval.md](prompts/11-langgraph-eval.md) | None |
| 12 | Data mesh 失败模式防线设计 | A-012 | [issues/12-data-mesh-defense.md](issues/12-data-mesh-defense.md) | [handoffs/12-data-mesh-defense.md](handoffs/12-data-mesh-defense.md) | [prompts/12-data-mesh-defense.md](prompts/12-data-mesh-defense.md) | None |
| 13 | 工具对齐评估 | A-013 | [issues/13-tool-alignment.md](issues/13-tool-alignment.md) | [handoffs/13-tool-alignment.md](handoffs/13-tool-alignment.md) | [prompts/13-tool-alignment.md](prompts/13-tool-alignment.md) | None |
| 17 | 10 路径成本 / 价值权衡 | A-017 | [issues/17-path-cost-value.md](issues/17-path-cost-value.md) | [handoffs/17-path-cost-value.md](handoffs/17-path-cost-value.md) | [prompts/17-path-cost-value.md](prompts/17-path-cost-value.md) | None |

### Wave 2 — 7 张票（可并行派子窗口）

| # | 标题 | A-xxx 覆盖 | issue | handoff | prompt | 阻塞 |
|---|---|---|---|---|---|---|
| 01 | S1 定位收敛语义度量方法 | A-001 | [issues/01-s1-semantic-measurement.md](issues/01-s1-semantic-measurement.md) | [handoffs/01-s1-semantic-measurement.md](handoffs/01-s1-semantic-measurement.md) | [prompts/01-s1-semantic-measurement.md](prompts/01-s1-semantic-measurement.md) | #05 |
| 02 | S2 ADR 质量事后补写判定 | A-002 | [issues/02-s2-adr-timestamp-check.md](issues/02-s2-adr-timestamp-check.md) | [handoffs/02-s2-adr-timestamp-check.md](handoffs/02-s2-adr-timestamp-check.md) | [prompts/02-s2-adr-timestamp-check.md](prompts/02-s2-adr-timestamp-check.md) | #05 |
| 03 | S4 ADR 假设提取工具链 | A-003 | [issues/03-s4-adr-assumption-extraction.md](issues/03-s4-adr-assumption-extraction.md) | [handoffs/03-s4-adr-assumption-extraction.md](handoffs/03-s4-adr-assumption-extraction.md) | [prompts/03-s4-adr-assumption-extraction.md](prompts/03-s4-adr-assumption-extraction.md) | #05 |
| 04 | S5 单人仓判据降权 | A-004 | [issues/04-s5-ownership-single-author.md](issues/04-s5-ownership-single-author.md) | [handoffs/04-s5-ownership-single-author.md](handoffs/04-s5-ownership-single-author.md) | [prompts/04-s5-ownership-single-author.md](prompts/04-s5-ownership-single-author.md) | #05 |
| 08 | Schema 版本演进规则 | A-008 | [issues/08-schema-versioning.md](issues/08-schema-versioning.md) | [handoffs/08-schema-versioning.md](handoffs/08-schema-versioning.md) | [prompts/08-schema-versioning.md](prompts/08-schema-versioning.md) | #07 |
| 14 | 报告模板共享骨架 | A-014 | [issues/14-shared-skeleton-design.md](issues/14-shared-skeleton-design.md) | [handoffs/14-shared-skeleton-design.md](handoffs/14-shared-skeleton-design.md) | [prompts/14-shared-skeleton-design.md](prompts/14-shared-skeleton-design.md) | #05 |
| 18 | Failure path 明文 | A-018 | [issues/18-failure-path-detail.md](issues/18-failure-path-detail.md) | [handoffs/18-failure-path-detail.md](handoffs/18-failure-path-detail.md) | [prompts/18-failure-path-detail.md](prompts/18-failure-path-detail.md) | #17 |

### Wave 3 — 2 张票（可并行派子窗口）

| # | 标题 | A-xxx 覆盖 | issue | handoff | prompt | 阻塞 |
|---|---|---|---|---|---|---|
| 09 | Read model 失效策略 | A-009 | [issues/09-read-model-staleness.md](issues/09-read-model-staleness.md) | [handoffs/09-read-model-staleness.md](handoffs/09-read-model-staleness.md) | [prompts/09-read-model-staleness.md](prompts/09-read-model-staleness.md) | #08 |
| 15 | Scale 切片差异边界 | A-015 | [issues/15-scale-slice-boundaries.md](issues/15-scale-slice-boundaries.md) | [handoffs/15-scale-slice-boundaries.md](handoffs/15-scale-slice-boundaries.md) | [prompts/15-scale-slice-boundaries.md](prompts/15-scale-slice-boundaries.md) | #14 |

### Wave 4 — 1 张票（可并行派子窗口）

| # | 标题 | A-xxx 覆盖 | issue | handoff | prompt | 阻塞 |
|---|---|---|---|---|---|---|
| 16 | 渲染样式与模板结构切分 | A-016 | [issues/16-rendering-split.md](issues/16-rendering-split.md) | [handoffs/16-rendering-split.md](handoffs/16-rendering-split.md) | [prompts/16-rendering-split.md](prompts/16-rendering-split.md) | #14, #15 |

## 启动器通用规则（WORKFLOW.md §4.2 引用，禁止复述）

- **版本控制**：遵循 WORKFLOW §4.2.1（`but` CLI，禁 git 写，禁 worktree/git checkout/git branch 字样）
- **文件写入**：遵循 WORKFLOW §4.2.2（Node.js via ctx_execute，字节级回读）
- **调研**：遵循 WORKFLOW §4.2.3（atomcode 深度调研 + docs/adr + CONTEXT.md + 工业对标）；启动器不引用全文，handoff 写一次
- **决策账本**：遵循 WORKFLOW §4.2.4（每个确认结论当场落盘）
- **报告**：遵循 WORKFLOW §4.2.5（统一写入 reports/NN-report.md）

## 收口动作

完成定义见各 handoff；版本控制遵循 WORKFLOW §4.2.1；每张票完成后启动器收尾动作 = 写 reports/NN-report.md（含完成定义清单逐项 / 阻塞 / lessons 候选 / 引用文件列表）。

## 反向 trace（任何 ticket → A-xxx → ledger 原文）

每张票的 issue / handoff / prompt 头部都标注 A-xxx 覆盖；ledger 原文见 [decision-ledger.md](decision-ledger.md) 对应行；spec 决策见 [spec.md](spec.md) 对应 Decision。

## Wave 1 完成状态（首脑复核后登记 — 2026-09-11）

| # | 标题 | A-xxx | 守卫/证据 | 状态 |
|---|---|---|---|---|
| 05 | 25 采集单元矩阵 | A-005 | 05-matrix-check.mjs **PASS（25/25 cells, schema-valid, no placeholders）** + 05-unit-matrix.json + 05-unit-matrix.schema.json | **DONE** |
| 06 | AI-agent ADR 质量冲击评估框架 | A-006 | 3 核心 + 1 补充指标（GQM 结构）；诚实标注 CIA/Infra 子集失真面 | **DEFERRED**（per Decision 4.6） |
| 07 | DuckDB fact table 写入策略 | A-007 | 单写多读 SWMR（明文）+ 排他理由 4 条 + ADR-0005 一致性论证 | **DONE** |
| 10 | Cross-scale correlation key | A-010 | trace_id/baggage_id 字段 CHAR(32) + W3C/OTel 标准对齐 + SQL 示例 | **DONE** |
| 11 | LangGraph supervisor 适配 | A-011 | 自研薄协调层决议 + T1/T2 重评触发器（明文） | **DONE** |
| 12 | Data mesh 失败模式防线 | A-012 | 防线一 Ownership Edge Gate（机制+触发+处置+量化）+ 防线联动规则 | **DONE** |
| 13 | 工具对齐评估 | A-013 | 工具×5 维度契合度矩阵 + 每工具采用/替代/自研决策 | **DONE** |
| 17 | 10 路径成本/价值权衡 | A-017 | 10 路径决策表（6 条可点 / 4 条文档 ≥ 5 要求）+ 估计成本 | **DONE** |

**复核结论**：8/8 票实物证据齐全，无源码层返工需求。

## Wave 2 Frontier（可立即开工，7 张票完全并行）

W1 完成后，原 W2 阻塞全部解除：
- #01 (A-001) blocked by **#05 done**
- #02 (A-002) blocked by **#05 done**
- #03 (A-003) blocked by **#05 done**
- #04 (A-004) blocked by **#05 done**
- #08 (A-008) blocked by **#07 done**
- #14 (A-014) blocked by **#05 done**
- #18 (A-018) blocked by **#17 done**

| # | 完整路径 |
|---|---|
| #01 | D:/Aworker/6F/.scratch/architecture-recovery/prompts/01-s1-semantic-measurement.md |
| #02 | D:/Aworker/6F/.scratch/architecture-recovery/prompts/02-s2-adr-timestamp-check.md |
| #03 | D:/Aworker/6F/.scratch/architecture-recovery/prompts/03-s4-adr-assumption-extraction.md |
| #04 | D:/Aworker/6F/.scratch/architecture-recovery/prompts/04-s5-ownership-single-author.md |
| #08 | D:/Aworker/6F/.scratch/architecture-recovery/prompts/08-schema-versioning.md |
| #14 | D:/Aworker/6F/.scratch/architecture-recovery/prompts/14-shared-skeleton-design.md |
| #18 | D:/Aworker/6F/.scratch/architecture-recovery/prompts/18-failure-path-detail.md |

W3/W4 仍待 W2：
- W3 待 #09 (blocked by #08) + #15 (blocked by #14)
- W4 待 #16 (blocked by #14, #15)

## 违规呈报（首脑复核发现，不替用户追认）

| 违规 | 票号 | 描述 | 处置 |
|---|---|---|---|
| **V1**: WORKFLOW §4 Lessons 未追加 W1 教训（违反 D-8 防蒸发） | W1 全部 | 8 张 report 各自含 lessons 段但未同步落 WORKFLOW.md | 本次同步追加 |
| **V2**: architecture-recovery ledger A-xxx 状态字段未更新（仍 current） | A-005/7/10/11/12/13/17 | ledger 表头有"状态"列但行内容缺状态（done/deferred） | 本次更新 |
| **V3**: W1 工作在 zz [uncommitted]，未分到任何 GitButler branch | W1 全部 | but status 显示 32 文件悬空 | 需用户派发分支（agent 无权擅自分配） |
| **V4**: 报告 sections 标题不统一（完成定义对照 vs 完成定义清单） | W1 全部 | 8 份报告风格各异 | 下次启动器统一规范；本轮不返工 |

**越权提交检查**：git log 18 commits 全部在 .scratch/architecture-recovery/ + .code-tmp/ + .gitattributes 范围内，**未触动其他 agent 的工作**（jiahao / anysearch-cli / env-manager 未被 commit 触及）。

## 票级检查点确认（per 用户开工第一句硬要求）

每张报告 §0 段都包含"开工复述"——窗口先复述 Blocked by + 必读清单再动手的硬要求已落盘，符合规则。

## Wave 2 完成状态（首脑复核后登记 — 2026-09-12）

| # | 标题 | A-xxx | 守卫/证据 | 状态 |
|---|---|---|---|---|
| 01 | S1 定位收敛语义度量方法 | A-001 | 01-check.mjs **PASS（75 assertions / 3 真实仓 / 3 embedding 候选 / 70% 跨仓校准 / 8 fallback triggers）** + 01-align.mjs/spotcheck.mjs/extract.mjs + 01-corpora.json | **DONE** |
| 02 | S2 ADR 质量事后补写判定 | A-002 | 02-adr-header-scan.mjs + 02-adr-fallback.mjs（3 真实仓扫描：env-manager 14/jiahao 58/anysearch-cli 57）+ 11 commits + git blame 回退精度 | **DONE** |
| 03 | S4 ADR 假设提取工具链 | A-003 | LLM 抽取 prompt（03-extraction-prompt.md）+ 6 抽取案例（03-extraction-cases.md）+ 抽检清单 + reusability 文档；claims 25/25 引文逐字命中、0 reject | **DONE** |
| 04 | S5 单人仓判据降权 | A-004 | 04-downweight-check.mjs **PASS（4 buckets / matrix 同步 / B1 saturation OK / 3/3 真实案例 / template schema 合规）** | **DONE** |
| 08 | Schema 版本演进规则 | A-008 | Hybrid registry + monotonic version semantics + BACKWARD_TRANSITIVE subscription + 3 change events（无独立 .mjs 守卫；以报告 + 决策矩阵为准） | **DONE** |
| 14 | 报告模板共享骨架 | A-014 | 14-skeleton-check.mjs **PASS（4 章 / 45 字段 / 20 单元 / 64 切片字段 / 31 xref to A-005 / no placeholders）** + 14-skeleton.schema.json | **DONE** |
| 18 | Failure path 明文 | A-018 | 18-failure-demo.mjs **PASS TOTAL 9/9（A8 happy vs failure 逐章对比 4 章差异 + A9 行动建议章全部未通过 verdict）** + 5 failure paths 4 要素齐全 + 18-demo-output.md 演示产物 | **DONE** |

**复核结论**：7/7 票实物证据齐全；4 张有可机检守卫脚本全部 PASS；3 张以报告 + 决策矩阵 + 案例数据为准；无源码层返工需求。

## Wave 3 Frontier（可立即开工，2 张票完全并行）

W2 完成后，原 W3 阻塞全部解除：
- #09 (A-009) blocked by **#08 done**
- #15 (A-015) blocked by **#14 done**

| # | 完整路径 |
|---|---|
| #09 | D:/Aworker/6F/.scratch/architecture-recovery/prompts/09-read-model-staleness.md |
| #15 | D:/Aworker/6F/.scratch/architecture-recovery/prompts/15-scale-slice-boundaries.md |

W4 仍待 W3：
- W4 待 #16 (blocked by #14, #15)

## 违规呈报（首脑复核 W2 发现）

| 违规 | 票号 | 描述 | 处置 |
|---|---|---|---|
| **W2-V1**: 3 张报告 ledger 状态字段未更新（A-001/2/14 仍 current） | W2 | W2 agents 写报告但漏回写 ledger | ✅ 本次主脑复核同步补全 |
| **W2-V2**（继承 W1-V3）: W2 工作在 zz [uncommitted]，未分到任何 GitButler branch | W2 全部 | `but status` 显示新增文件悬空 | ⚠️ **需用户派发分支** |
| **W2-V3**: #08 / #03 无独立 .mjs 守卫（仅以报告 + JSON 数据为准） | #08 #03 | 不同于 #01/04/14/18 有可执行守卫 | **不视为返工**——报告含完整决策矩阵 + 数据可机检（如 #08 hybrid registry + 3 change events；#03 25/25 引文抽检） |

**越权提交检查**：W2 commits 全部引用 A-NNN 标识（`01: S1...`、`docs(A-008): ...`、`02: add public repo clones` 等），未触动其他 agent 工作（jiahao / anysearch-cli / env-manager 仅作为扫描对象）。✓
## Wave 3 完成状态（#15 登记 — 2026-09-12）

| # | 标题 | A-xxx | 守卫/证据 | 状态 |
|---|---|---|---|---|
| 15 | Scale 切片差异边界 | A-015 | 15-slice-check.mjs **PASS 13/13（退出码 0：5 切片 × 8 列 / 10 极端差异维 / 0 冲突 / 0 跨 scale 复用 / 缺 origin 0）** + 15-slice-boundaries.json + 15-slice-boundaries.schema.json（ajv 2020-12 valid=true）+ 15-atomcode-research.md | **DONE** |

注：#09 (A-009) 属另一会话，其状态不在本票登记范围。

**W4 Frontier 更新**：#16 (A-016) 的两项前置 #14 + #15 均已闭环，阻塞解除，可开工。

**版本控制**：本票产物已提交至独立分支 `15-scale-slice-boundaries`（commits `svx` / `ktv`）。`WORKFLOW.md` 与 `decision-ledger.md` 的改动因跨栈依赖（`w2-02-adr-timestamp-check` / `ticket-05-unit-matrix`）被 `but commit` 原子拒绝，内容已落盘、待主脑统一收口，详见 `reports/15-report.md` §版本控制处置。

**越权提交检查**：本票新增文件全部落在 .scratch/architecture-recovery/reports/ 与 .scratch/architecture-recovery/decision-ledger.md / WORKFLOW.md / README.md 范围内，未触动其他 agent 的工作。
