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

**W4 Frontier 更新**：#16 (A-016) 的两项前置 #14 + #15 均已闭环，阻塞解除，可开工。

## Wave 4 Frontier（主脑复核后登记 — 2026-09-12）

W3 完成后，原 W4 阻塞全部解除：

- #16 (A-016) blocked by **#14 done** + **#15 done**

| # | 完整路径 |
|---|---|
| #16 | D:/Aworker/6F/.scratch/architecture-recovery/prompts/16-rendering-split.md |

## 违规呈报（首脑复核 W3 发现 — 增量追加）

| 违规 | 票号 | 描述 | 处置 |
|---|---|---|---|
| **W3-V1**（继承 W2-V2 部分）: #09 工作仍在 `zz [uncommitted]`（handoffs/issues/prompts/report/check.mjs/.json），#15 已分到独立 branch `sc [15-scale-slice-boundaries]` | #09 | W3 是首次出现"分支分配"对照的两票，#15 已规范但 #09 仍悬空 | ⚠️ **需用户派发分支** |
| **W3-V2**（继承 W2-V2）: WORKFLOW.md §4 Lessons 未由 W3 agents 追加 | W3 全部 | W2 L4 教训"W3 启动器收尾必须包含 ledger + lessons 两步"未落实 | ✅ **本次主脑复核同步追加 4 条 lessons** |

**正面观察**：
- #15 已分到独立 GitButler branch `sc [15-scale-slice-boundaries]` — W1/W2/W3 三波中**首次出现明确分支分配**，commit-surface 处置成熟度提升
- W3 agents 主动做 "commit-surface disposition" 注释（#15 commit `0652070` 明文声明跨栈依赖未提交 + 内容已落盘）—— 该模式 W1→W3 连续 ≥3 张票稳定采用
- 守卫脚本结果与 commit message 严格对齐（#09 → commit 含"守卫 09-stale-check PASS"；#15 → commit 含"15-slice-check.mjs PASS 13/13"），**双锁机制 W3 沿用未破**

**越权提交检查**：W3 commits 全部带 A-NNN 标识；`jiahao / anysearch-cli / env-manager` 仅作为扫描对象被读取，**未被 commit 改动** ✓

## 票级检查点确认

#09 report §0 + #15 report §开工复述 段都含"开工复述 per 启动器硬要求"——窗口先复述 Blocked by + 必读清单再动手的硬要求已落盘。


**版本控制**：本票产物已提交至独立分支 `15-scale-slice-boundaries`（commits `svx` / `ktv`）。`WORKFLOW.md` 与 `decision-ledger.md` 的改动因跨栈依赖（`w2-02-adr-timestamp-check` / `ticket-05-unit-matrix`）被 `but commit` 原子拒绝，内容已落盘、待主脑统一收口，详见 `reports/15-report.md` §版本控制处置。

**越权提交检查**：本票新增文件全部落在 .scratch/architecture-recovery/reports/ 与 .scratch/architecture-recovery/decision-ledger.md / WORKFLOW.md / README.md 范围内，未触动其他 agent 的工作。


## Wave 4 完成状态（首脑复核后登记 — 2026-09-12）

| # | 标题 | A-xxx | 守卫/证据 | 状态 |
|---|---|---|---|---|
| 16 | 渲染样式与模板结构切分 | A-016 | **16-render-split-check.mjs PASS 16/16（GUARD RESULT: PASS，0 fail；spec 唯一 109 名 ⊊ demo 137 名、spec∩style=0、越界硬禁扫描 3 个 spec 侧契约文件 0 命中、骨架 50 / 切片 60 上游计数对齐）** + 16-render-split.json（JSON Schema 2020-12 ajv valid=true）+ 16-render-split.schema.json + commit `A-016: 渲染样式与模板结构切分 — 16-render-split-check.mjs PASS 16/16 (exit 0: spec 109 ⊊ demo 137, spec∩style=0, 越界硬禁扫描 0 命中, 骨架50/切片60 对齐)` + **branch 分配: `re [16-rendering-split]`** | **DONE** |

**复核结论**：1/1 票实物证据齐全；守卫 16/16 PASS；branch 落位 `re [16-rendering-split]`；commit-surface 处置成熟。

## 🏁 全 18 票闭环总结（2026-09-12）

| Wave | 票数 | 完成态 | branch 落位 |
|---|---|---|---|
| W1 | 8 | 7 done + 1 deferred (A-006) | 全部 uncommitted |
| W2 | 7 | 7 done | 全部 uncommitted |
| W3 | 2 | 2 done | #15 → `sc [15-scale-slice-boundaries]` |
| W4 | 1 | 1 done | #16 → `re [16-rendering-split]` |
| **合计** | **18** | **17 done + 1 deferred = 100%** | 2/18 已分支 |

**全局结论**：
- 决策层 7 条（ADR-0001~0007）落地 ✓
- 规格层 18 条 Implementation Decision 全部覆盖 A-001~A-018 ✓
- 集成层 Hub-of-Facts with Federated Adjudication 形状已封口 ✓
- 报告层 共享骨架 + scale 切片 已封口 ✓
- 演示层 10 路径（5 scale × happy+failure）已封口 ✓

**未解**：
- #09 仍在 zz [uncommitted]（未分到 branch）
- W1/W2 全部工作在 zz [uncommitted]（历史遗留 — agent 无权擅自分配 branch，需用户统一收口）
- A-006 deferred — 等 AI 代码生成主流化触发

## 违规呈报（首脑复核 W4 发现 — 增量追加）

| 违规 | 票号 | 描述 | 处置 |
|---|---|---|---|
| 无新增 | #16 | #16 是 W1-W4 中首次 8 个 section 全齐 + ledger 自动 done + 守卫 PASS + branch 落位全做的票 | — |
| **W4-V1**（继承 W3-V1）: 9 张报告 W1/W2 仍在 zz | W1/W2 | 历史遗留，4 波中仅 #15/16 已分到 branch | ⚠️ **需用户统一收口**（agent 无权擅自分配） |

**正面观察**：
- #16 是 W1-W4 **单一票同时满足所有规范**（开工复述 / 调研 / Sufficiency Gate / 完成定义对照 / 阻塞 / lessons / 引用文件 / 版本控制处置，8 段齐全 + ledger done + branch 落位 + commit-surface 处置 + commit 引用守卫结果）—— 标志着流程收敛；
- W4 是**唯一无 WORKFLOW §4 Lessons 缺失**的一波（V2 自 W2 起反复出现，W4 由 #16 agents 主动同步）；V2 在 W4 真正归零。

**越权提交检查**：W4 commits 全部带 A-NNN 标识；`jiahao / anysearch-cli / env-manager` 未被 commit 改动 ✓

## 后 Wave 4 阶段建议

- **执行阶段入口**：所有 spec-level 票已闭环。下一步进入 **Phase 4 实施**（per WORKFLOW.md §2）—— 但本仓库为 spec-level 规划，不含源码实施。如需进入实施，应另起工程仓并引用本仓的 spec.md / ADRs / 启动器。
- **branch 收口**：建议用户在 GitButler workspace 提交时给 W1/W2 同样分配 `sc [...]` / `re [...]` 形态的 branch，匹配 W3/W4 规范。
- **A-006 重启触发**：deferred 状态的 A-006 等待 AI 代码生成主流化；建议设 calendar reminder 或在 D-007 演示脚本中加 `is-ai-code-mainstream?` 探测。

## 并行波次表（R3 执行轮 — 任务书 T1~T6，2026-09-12 续接；从 issue Blocked by 推导，不新造顺序）

- **总票数**：7（#19 ~ #25）｜ **总波次**：6 ｜ 摩擦点 A-019 ~ A-030（12 条，见 decision-ledger.md R3 执行轮段）
- **闸门**：#19 的 push 需用户明示授权（远端 + 时机）；#22 的预声明文档需用户审阅后才能 commit；#23 开跑前三查（#19 CI 证据 / #22 预声明入库 / 裁定依据预入库）。

### R3-Wave 1 — 2 张票（可并行派子窗口）

| # | 标题 | A-xxx 覆盖 | issue | handoff | prompt | 阻塞 |
|---|---|---|---|---|---|---|
| 19 | push 与 CI 实跑激活 | A-019, A-020 | [issues/19-push-ci-activation.md](issues/19-push-ci-activation.md) | [handoffs/19-push-ci-activation.md](handoffs/19-push-ci-activation.md) | [prompts/19-push-ci-activation.md](prompts/19-push-ci-activation.md) | None |
| 20 | fact table schema v0 | A-021 | [issues/20-fact-schema-v0.md](issues/20-fact-schema-v0.md) | [handoffs/20-fact-schema-v0.md](handoffs/20-fact-schema-v0.md) | [prompts/20-fact-schema-v0.md](prompts/20-fact-schema-v0.md) | None |

### R3-Wave 2 — 1 张票（可并行派子窗口）

| # | 标题 | A-xxx 覆盖 | issue | handoff | prompt | 阻塞 |
|---|---|---|---|---|---|---|
| 21 | 确定性采集器 | A-022 | [issues/21-deterministic-collectors.md](issues/21-deterministic-collectors.md) | [handoffs/21-deterministic-collectors.md](handoffs/21-deterministic-collectors.md) | [prompts/21-deterministic-collectors.md](prompts/21-deterministic-collectors.md) | #20 |

### R3-Wave 3 — 1 张票（可并行派子窗口）

| # | 标题 | A-xxx 覆盖 | issue | handoff | prompt | 阻塞 |
|---|---|---|---|---|---|---|
| 22 | B 层判据预声明文档 | A-023, A-024, A-025, A-029 | [issues/22-b-criteria-prereg.md](issues/22-b-criteria-prereg.md) | [handoffs/22-b-criteria-prereg.md](handoffs/22-b-criteria-prereg.md) | [prompts/22-b-criteria-prereg.md](prompts/22-b-criteria-prereg.md) | #20, #21 |

### R3-Wave 4 — 1 张票（可并行派子窗口）

| # | 标题 | A-xxx 覆盖 | issue | handoff | prompt | 阻塞 |
|---|---|---|---|---|---|---|
| 23 | 首报全链与三层闸门验收 | A-026, A-027 | [issues/23-first-report-e2e.md](issues/23-first-report-e2e.md) | [handoffs/23-first-report-e2e.md](handoffs/23-first-report-e2e.md) | [prompts/23-first-report-e2e.md](prompts/23-first-report-e2e.md) | #19, #22 |

### R3-Wave 5 — 1 张票（可并行派子窗口）

| # | 标题 | A-xxx 覆盖 | issue | handoff | prompt | 阻塞 |
|---|---|---|---|---|---|---|
| 24 | 缺口回流实测锚清扫 | A-028 | [issues/24-gap-sweep-anchors.md](issues/24-gap-sweep-anchors.md) | [handoffs/24-gap-sweep-anchors.md](handoffs/24-gap-sweep-anchors.md) | [prompts/24-gap-sweep-anchors.md](prompts/24-gap-sweep-anchors.md) | #23 |

### R3-Wave 6 — 1 张票（可并行派子窗口）

| # | 标题 | A-xxx 覆盖 | issue | handoff | prompt | 阻塞 |
|---|---|---|---|---|---|---|
| 25 | 铺开与分发收尾 | A-030 | [issues/25-rollout-distribution.md](issues/25-rollout-distribution.md) | [handoffs/25-rollout-distribution.md](handoffs/25-rollout-distribution.md) | [prompts/25-rollout-distribution.md](prompts/25-rollout-distribution.md) | #24 |
## R3 执行状态表（首脑复核后登记，2026-09-13）

| 票 | 状态 | 闭环 commit（=origin tip） | CI 证据 | 守卫证据 | ledger 回写 | 复核结论 |
|---|---|---|---|---|---|---|
| #19 push 与 CI 实跑激活 | **done** | `4624acd`（origin/19-push-ci-activation，gh api 核实） | run 34690925491（main 前序）+ 34736927344（首跑）+ 34737204262（闭环复跑）三 run `gh run list` 均成功；矩阵 3 OS × Node 20/22 = 6 cells | n/a（无守卫票） | A-019 done / A-020 done | 通过 |
| #20 fact table schema v0 | **done** | `e6c916e`（origin/20-fact-schema-v0，gh api 核实；闭环 commit `98324d2` body 引守卫） | run 34736927344 / 34737204262（engine/** 触发，成功） | `20-fact-schema-check.mjs` 首脑本机实跑 **28/28 PASS，exit 0**（绑定唯一/只追加/无重开/FK 先于冻结） | A-021 done | 通过 |
| #21 确定性采集器 | **done** | `myt`（branch 21-deterministic-collectors，叠于 20 之上；**未 push**——push 属外部副作用待授权） | 无 CI run（未 push，paths 触发不了）| `21-collectors-check.mjs` 首脑实跑 **43/43 PASS exit 0**（N 无网络/LLM、S 39 事实形状、C fixture 行为、D 判据绑定、A 只追加）+ #20 回归 28/28 exit 0 | A-022 done | 通过 |
| #22 B 层判据预声明文档 | **done** | `msl`+`wqv`+`qyk`（branch 22-b-criteria-prereg，叠于 21 之上；**未 push** 待授权） | 无 CI run（未 push） | `22-criteria-check.mjs` 首脑实跑 **19/19 PASS exit 0**（G3 阈值↔文档、G4 实测数↔原始 JSON、G5b 映射零漂移、G6 配比 2/3/1、G11 复算 INCONCLUSIVE/RED/AMBER、G14 裁定依据入库）+ 回归 43/43、28/28 | A-023/A-024/A-025/A-029 四行 done | 通过 |
| #23 首报全链与三层闸门验收 | **done**（C 层裁定 supported 已回写 2026-09-13） | `krm`/`wrl`/`mzm`/`xvr`（branch 23-first-report-e2e，叠于 22 之上；**未 push** 待授权） | 无 CI run（未 push） | `23-first-report-check.mjs` 首脑实跑 **36/36 PASS exit 0**（P 三查 / A 形式 11 引文逐字回查+11/11 supports / B 正对照 2/2 先行+阈值与预注册逐项一致+TC-1 INCONCLUSIVE·TC-2 RED·TC-3 AMBER / C 三档+人裁定槽 pending / R 双锚+merge-base 拓扑证明）+ 回归 19/19、43/43、28/28 | A-026/A-027 done（C 裁定 supported 已回写账本） | 通过 |
| #24 缺口回流实测锚清扫 | **done** | `6ab4b32`（branch 24-gap-sweep-anchors，基于 ced451b 平行栈；**未 push** 待授权） | 无 CI run（未 push；纯文档票，无 engine/** 触达） | `24-check.mjs` 首脑本机实跑 **34/34 PASS exit 0**（C1 产物在位 / C2 四家先例在文 / C3 判据先例在文 / C4 九段结构 / C5 引用 43 / C7 16 active+R2Q7-6 性质变化 / C8 CI 行⊆KNOWN 17 编号+新造 0 / C9 边界三查+首报判定逐字不改动 / C10 §12.5 源 / C11 ledger 状态 / C12 lessons=1） | A-028 done → implemented（2026-09-14） | 通过 |
| #25 铺开与分发收尾 | **done** | `3fa5348`（branch 25-rollout-distribution，叠于 24-gap-sweep-anchors 之上；**未 push** 待授权） | 无 CI run（未 push；纯文档票，无 engine/** 触达） | `25-check.mjs` 首脑本机实跑 **34/34 PASS exit 0**（C1 四产物在位 / C2 调研结构+对标 21 行 / C3 24 动作行全标待拍板 / C4 B4.1 仅 1 处无专节 / C5 违禁实施声明 0+零实施声明 / C6 每行能-不能+需什么 / C7 BACKLOG 10 id 全覆盖 / C8 ledger done+implemented+deferred 清除 / C9 lessons / C10 报告四段+commit 引 A-030） | A-030 done → implemented（2026-09-14） | 通过 |

- **Frontier（重算 2026-09-13 W4 复核后）**：#19~#23 均闭环 → 下一波可开工 = **W5：#24 缺口回流实测锚清扫**（Blocked by #23 ✓ 已解除）。启动器：`prompts/24-gap-sweep-anchors.md`。**悬置项（不阻塞 #24）**：C 层人裁定原文 + 时间戳待用户产出（综合裁定规则推导 = unsupported，TC-2 RED 主导），按 22-c-adjudication-basis.md 三档回写账本后 D-017 C 闸才闭合。
- **Frontier（重算 2026-09-14 W5 复核后）**：#19~#24 均闭环 → 下一波可开工 = **W6：#25 铺开与分发收尾**（Blocked by #24 ✓ 已解除）。启动器：`prompts/25-rollout-distribution.md`。**悬置项（不阻塞 #25 开工，但其内容须逐项拍板）**：push / 落 main 授权（现两未推栈：grill-r4、24-gap-sweep-anchors）；#25 前置清单逐项拍板（BACKLOG B1/B2/B3 立票、plugin 上架条件、演示资产范围）；TC-2 RED 处置方向（修 ADR Date 头 vs 判据 v2）；多仓复核实跑属阶段 2 执行票（A-028 复核计划 v1 已备）。**复核观察（弱化项，非缺陷）**：#24 调研未留 atomcode resume 锚点（R3-Q*/R4-Q1 先例均有）——下票恢复留档习惯。
- **Frontier（重算 2026-09-14 W6 复核后）**：R3 执行轮 **7/7 票全部闭环**（#19~#25），**无待派执行票**。下一动作全部为用户闸门：① push / 落 main 授权（三未推栈：grill-r4、24-gap-sweep-anchors、25-rollout-distribution）；② #25 前置清单逐项拍板（BACKLOG B1.1~B4.2 立票、P1~P6 上架条件、D1~D5 演示资产——入口 reports/25-rollout-checklist.md §8）；③ TC-2 RED 处置方向（修 ADR Date 头 vs 判据 v2）；④ 阶段 2 立票（运行时解析策略 + 多仓复核实跑，承接 D-020/D-021 与 A-028 复核计划 v1）。**复核观察**：W5 弱化项（resume 锚点）已由 #25 闭合（research §0 执行通道留痕 + UUID）；行数口径：清单 25 行 = 24 动作行（全标待拍板）+ 1 行 B4.1（取代不立项）。
- **待用户追认（不替用户追认）**：① 授权原文 ref=main，实推为 3 分支、main 落地未做（#19 §9 残留）；② 闸门授权原话（「origin/main 立即执行」「20落地，可以继续」）为子窗口交互，仓内无实物可独立验证；③ 栈重排冲突事故已自愈（0 冲突标记、内容完整性已验），lessons L-19-f/g 沉淀。
## 并行波次表（R4 执行轮 — 轮 6 任务书 T1~T6，2026-09-15 续接；从 issue Blocked by 推导，不新造顺序）

- **总票数**：6（#26 ~ #31）｜ **总波次**：5（全局编号 W7 ~ W11）｜ 摩擦点 A-031 ~ A-036（6 条，见 decision-ledger.md R4 执行轮登记节）
- **序列化纪律**（per 任务书/ADR-0015）：唯一合法并行对 = #27 ∥ #28，且两票验收互不引用为完成条件；其余严格串行。
- **闸门**：#27 重测预注册必须先于重跑 commit；#29 不得改写 C 裁定原文与时间戳；#31 的 atomcode 调研串行 + 续跑锚定。

### W7 — 1 张票（串行门）

| # | 标题 | A-xxx 覆盖 | issue | handoff | prompt | 阻塞 |
|---|---|---|---|---|---|---|
| 26 | 阶段 1.5 量测审计（人工真值表） | A-031 | [issues/26-adr-measurement-audit.md](issues/26-adr-measurement-audit.md) | [handoffs/26-adr-measurement-audit.md](handoffs/26-adr-measurement-audit.md) | [prompts/26-adr-measurement-audit.md](prompts/26-adr-measurement-audit.md) | None |

### W8 — 2 张票（唯一并行对，验收互不为条件）

| # | 标题 | A-xxx 覆盖 | issue | handoff | prompt | 阻塞 |
|---|---|---|---|---|---|---|
| 27 | 判据 v2 追加（回退链接线） | A-032 | [issues/27-criteria-v2-fallback-chain.md](issues/27-criteria-v2-fallback-chain.md) | [handoffs/27-criteria-v2-fallback-chain.md](handoffs/27-criteria-v2-fallback-chain.md) | [prompts/27-criteria-v2-fallback-chain.md](prompts/27-criteria-v2-fallback-chain.md) | #26 |
| 28 | ADR 治理卫生票 | A-033 | [issues/28-adr-hygiene-sweep.md](issues/28-adr-hygiene-sweep.md) | [handoffs/28-adr-hygiene-sweep.md](handoffs/28-adr-hygiene-sweep.md) | [prompts/28-adr-hygiene-sweep.md](prompts/28-adr-hygiene-sweep.md) | #26 |

### W9 — 1 张票（串行）

| # | 标题 | A-xxx 覆盖 | issue | handoff | prompt | 阻塞 |
|---|---|---|---|---|---|---|
| 29 | C 层 disposition 补记 + 双读数 | A-034 | [issues/29-c-disposition-reopen.md](issues/29-c-disposition-reopen.md) | [handoffs/29-c-disposition-reopen.md](handoffs/29-c-disposition-reopen.md) | [prompts/29-c-disposition-reopen.md](prompts/29-c-disposition-reopen.md) | #26, #27, #28 |

### W10 — 1 张票（串行）

| # | 标题 | A-xxx 覆盖 | issue | handoff | prompt | 阻塞 |
|---|---|---|---|---|---|---|
| 30 | 阶段 2a 冻结校准（10 项 desk） | A-035 | [issues/30-frozen-calibration-desk.md](issues/30-frozen-calibration-desk.md) | [handoffs/30-frozen-calibration-desk.md](handoffs/30-frozen-calibration-desk.md) | [prompts/30-frozen-calibration-desk.md](prompts/30-frozen-calibration-desk.md) | #27, #28 |

### W11 — 1 张票（串行）

| # | 标题 | A-xxx 覆盖 | issue | handoff | prompt | 阻塞 |
|---|---|---|---|---|---|---|
| 31 | 阶段 2b CodeLore 单上游探针 | A-036 | [issues/31-codelore-probe.md](issues/31-codelore-probe.md) | [handoffs/31-codelore-probe.md](handoffs/31-codelore-probe.md) | [prompts/31-codelore-probe.md](prompts/31-codelore-probe.md) | #30 |

## R4 Frontier（重算 2026-09-15 立票后）

- **W7 完成（2026-09-15）**：#26 阶段 1.5 量测审计 → 26-check.mjs PASS 18/18（真值 mean 0.4923；v1 实跑复现 0.2462 逐格 65/65）；真值表+delta 模板+AC 登记落 reports/26-*。
- **W8 进行中（2026-09-15）**：#27 判据 v2 → 27-check.mjs PASS 15/15（v2=0.5846 RED，65/65 ALL-AGREE，v1 留档复现）；#28 ADR 治理卫生并行执行中。
- 值守项（非票）：T7 #25 拍板状态列核对——触发事件已发生而未拍的行 1 个工作日内升级；到期未触发按硬到期日重组改绑一次（绑定表 = reports/R5-Q5-atomcode-research.md §3）。
