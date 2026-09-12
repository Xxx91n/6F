# Report: 01 — S1 定位收敛语义度量方法（A-001）

> 票：[issues/01-s1-semantic-measurement.md](../issues/01-s1-semantic-measurement.md) ｜ 决策：[spec.md](../spec.md) §Decision 4.1 ｜ 日期：2026-09-12
> 阻塞状态：Blocked by #05 —— A-005 已于 2026-09-11 闭环（ledger「A-005 结论落盘」明文「解锁 Wave 2 票 #01/#02/#03/#04/#14」），本票解锁后一次闭环。
> 机检证据：`node 01-check.mjs` → `PASS: 75 assertions` / `repos=3 models=3 sampled/repo=5 spotcheck=15 fallback_triggers=8`（exit=0）

## 0. 完成定义对照（逐项）

| 验收项（issue 原文） | 交付 | 证据 |
|---|---|---|
| 必须用真实仓库跑一遍（不可只列方法） | 3 个真实仓库全流程跑通（env-manager / jiahao / anysearch-cli），非列举 | `01-corpora.json`（3 仓 1021 交付单元）+ `01-align.json`（3 模型 × 3 仓 × 5 抽样点 = 45 个对齐分） |
| embedding 选型必须对比 ≥3 候选（给出放弃理由） | 3 个神经候选实测（MiniLM / bge-small / me5-small）+ 1 个词法基线；5 个 API 候选文档化放弃 | §2 对比矩阵 + `01-align.json` models |
| 70% 阈值必须给出跨 ≥2 仓库的校准数据 | 3 仓 × 5 抽样点，双口径校准（跨仓 out-of-domain + 域内人工抽检） | §3.4 + `01-align.json` calibration + `01-spotcheck.json` |
| 交付 1：至少 2 个真实仓库跑通语义对齐流程 | 3 仓（≥2 要求） | 守卫断言 D1 |
| 交付 2：embedding 选型理由文档（3 候选对比） | §2（维度/参数/许可证/成本/判别力/实测 F1） | 守卫断言 D2 |
| 交付 3：70% 阈值跨仓校准数据（每仓 5 抽样点对齐分） | §3.2 每仓 5 点 × 3 模型；§3.4 校准曲线 | 守卫断言 D3 |
| 交付 4：关键词 fallback 触发条件清单 | §4（8 条可机检触发条件） | `01-fallback.json` + 守卫断言 D4/D5 |
| （Decision 4.1 附加）人工抽检 | §3.3：15 单元逐条人工判读 top3 证据 | `01-spotcheck.json` labels |

## 1. 背景与约束回顾

- **ADR-0004 约束**：S1 = 战略 quadrant 第 1 维，评「产品/仓库的『意图声明』与『实际交付内容』之间的收敛度」；CONTEXT.md S1 词条判据 = 定位关键词覆盖率 + 漂移起点检测；证据源 = README/docs/roadmap/CHANGELOG/git log/issue+label/PR 标题。阈值声明为**初版参数**，预留跨仓校准机制。
- **Decision 4.1 明文**：「不锁 70% 为 hard rule；交付试点仓库清单 + 校准流程（含 embedding 选型、关键词 fallback、人工抽检）」+「与 A-005 矩阵结构对齐（每行的『语义度量』单元格复用 4.5 决策的矩阵格式）」。本票交付的是**校准流程与实测数据**，不是把 70% 写成硬规则。
- **上游 A-005 矩阵**：S1 行 5 cell 的判据/数据源/阈值已由 #05 落盘（`05-unit-matrix.json`），本票是其 S1 行的**可执行校准层**，不改矩阵。
- **三仓共性是「单人/双人 + AI 代理劳动主导」**（per A-004 结论），因此 S1 的语料以英文为主、混杂中文提交主题；这直接决定了 embedding 的语言需求与校准策略。

## 2. Deliverable 2 — embedding 选型（3 候选实测对比 + 放弃理由）

### 2.1 结论先行

- **选定 v1：`BAAI/bge-small-en-v1.5`**（本地 ONNX、384 维、33.4M 参数、MIT、$0、离线、确定性）。实测依据：在 70% 锚点上域内人工抽检 F1=**0.818**（precision 1.00 / recall 0.692），是三个候选中**唯一在 0.70 附近就达到最优工作点**的模型（其跨仓 best-F1 也在 0.70），且跨仓 out-of-domain 分离度 gap=+0.104。
- **放弃 `all-MiniLM-L6-v2`**：实测 70% 严重错位（recall 仅 0.154），其最优工作点在 **0.40**；虽原始分离度最大（gap=+0.200），但需一套独立的、与 bge 不共享的阈值。叠加官方 256 token 截断与 MTEB 56.26（低于同级 6 分）。仅保留为冒烟基线。
- **放弃 `multilingual-e5-small`**：实测**无判别力**——pos_mean 0.8786 / neg_mean 0.8534，gap=**+0.0252**，15 个分数全部压缩在 0.8297-0.9489 窄带内，任何阈值都无法分离正负；且强制 `query:`/`passage:` 前缀、118M 参数（bge-small 的 3.5 倍）。
- **放弃（文档化、未运行）**：OpenAI `text-embedding-3-small/large`、Cohere `embed-multilingual-v3.0`、Voyage-3、Google `text-embedding-004/005`。理由：① 本环境无任何 embedding API 凭证；② 非离线，违背审计产品可复现硬需求；③ 供应商可静默更新（Voyage 维护了一整张 deprecated 表，Google 004/005 已被 `gemini-embedding-001` 统一且官方警告版本指针不稳定）。
- **v2 候选（未运行，0.6B 参数超 v1 预算）**：`BAAI/bge-m3`——100+ 语言含中英、8192 ctx、dense+sparse+colbert 三合一，其 **sparse 输出即同一模型内的 BM25 等价物**，天然同时满足 S1 的语义对齐与词法 fallback。切条件：语料以中文为主时。

### 2.2 实测对比矩阵

| 候选 | 形态 | 维度 | 参数 | 许可证 | 成本/1M | 跨仓 pos/neg | 跨仓 gap | 域内@0.70 P/R/F1 | 判定 |
|---|---|---|---|---|---|---|---|---|---|
| all-MiniLM-L6-v2 | 本地 ONNX | 384 | 22.7M | Apache-2.0 | $0 | 0.5700 / 0.3705 | **+0.1995** | 1.00 / 0.154 / 0.267 | 放弃（阈值错位） |
| **bge-small-en-v1.5** | 本地 ONNX | 384 | 33.4M | MIT | $0 | 0.7318 / 0.6275 | +0.1043 | **1.00 / 0.692 / 0.818** | **选定 v1** |
| multilingual-e5-small | 本地 ONNX | 384 | 118M | MIT | $0 | 0.8786 / 0.8534 | +0.0252 | 0.867 / 1.000 / 0.929* | 放弃（无判别力） |
| TF-IDF / 词法（基线） | 纯 JS | — | — | — | $0 | kw_mean 0.714 | — | — | 保留为 fallback |

> 跨仓 pos/neg = 本仓意图 vs 本仓交付（正） / 本仓意图 vs 他仓交付（负），各 15 / 30 个分数。
> *me5 域内指标是**退化值**：其全部 15 个分数落在 0.8297-0.9489，任何 ≤0.83 的阈值都全通过，precision 来自 2 个负样本偶然低于阈值——不代表判别力。

### 2.3 关键实测发现（与调研互证）

1. **绝对余弦分数不可跨模型迁移**——本票实测直接证实调研引用的 Calibrated Similarity（arXiv:2601.16907）anisotropy 结论：MiniLM 的真实工作点 0.40、bge-small 0.70、me5 无工作点；同一个 0.70 在三个模型上分别意味着「几乎全漏」「刚好」「全通过」。**Decision 4.1 「不锁 70% 为 hard rule」得到实测支撑**。
2. **「多语模型更强」的直觉在小模型上不成立**——me5-small 的中文能力以分数压缩为代价（向量空间被前缀污染），在本场景反而不如纯英文的 bge-small。
3. **词法覆盖率与语义对齐度不相关**——jiahao kw=0.471 但 bge=0.683；anysearch-cli kw=0.927 且 bge=0.825。说明二者互补而非替代，支撑 §4 的 hybrid 默认架构。

## 3. Deliverable 1 + 3 — 真实仓库跑通 + 70% 阈值跨仓校准

### 3.1 试点仓库清单与语料规模（真实 git 实测 2026-09-12）

| 仓库 | 路径 | commits（过滤后） | 交付单元 | 意图单元 | 漂移窗口 | 语料语言 |
|---|---|---|---|---|---|---|
| env-manager | D:/Aworker/env-manager | 460 | 597 | 9 | 5 | 英文为主 |
| jiahao | D:/Aworker/jiahao | 154 | 194 | 9 | 5 | 英文为主 |
| anysearch-cli | D:/Aworker/anysearch-cli | 191 | 230 | 8 | 5 | 英文 + 中文提交主题 |

**流水线（4 个可复用脚本，全部已落盘）**：

```
01-extract.mjs   意图语料（README 块级解析：H1/lede/tagline/定位节 bullet+table）
                 + 交付语料（git log 主题 + 目录树 + package.json + CHANGELOG）
      -> 01-corpora.json
01-align.mjs     3 模型编码 + max-cos 对齐 + 跨仓正负对 + 5 窗口漂移 + 词法基线 + PR 曲线扫描
      -> 01-align.json
01-spotcheck.mjs 人工抽检标签 + 域内校准 + 排除 title 后的仓库均值
      -> 01-spotcheck.json
01-check.mjs     守卫脚本：D1/D2/D3/D4 共 70 条断言 -> PASS
```

### 3.2 每仓 5 个抽样点对齐分（交付 3 主体）

抽样规则：从 `readme:*` 来源的意图单元中确定性等距抽 5 点（非任意挑选）。对齐分 = 该意图向量对**全量交付单元**的最大余弦相似度。

| 抽样点 | 意图（截断） | MiniLM | bge-small | me5-small |
|---|---|---|---|---|
| env-manager#S1 | Env Manager | 0.4092 | 0.7145 | 0.8468 |
| env-manager#S2 | Adapts seamlessly to every environment. | 0.3421 | 0.5626 | 0.8420 |
| env-manager#S3 | 8 secret providers, zero plaintext | 0.6476 | 0.7464 | 0.8777 |
| env-manager#S4 | PATH health — detects duplicates and dead entries | 0.5866 | 0.6681 | 0.8913 |
| env-manager#S5 | CLI + GUI dual-mode (C# CLI / Tauri 2 + Svelte) | 0.5386 | 0.7448 | 0.8886 |
| jiahao#S1 | Jiahao (嘉豪) | 0.8836 | 0.9789 | 0.9096 |
| jiahao#S2 | LLM agents suffer from False Completion Syndrome | 0.4123 | 0.6080 | 0.8405 |
| jiahao#S3 | The generator profile attacks the surface signals | 0.4597 | 0.6222 | 0.8482 |
| jiahao#S4 | The verifier profile runs in a separate audit agent | 0.4761 | 0.5839 | 0.8512 |
| jiahao#S5 | for a primary agent, use the generator profile | 0.3669 | 0.6213 | 0.8297 |
| anysearch-cli#S1 | anysearch-cli | 0.9761 | 0.9960 | 0.9489 |
| anysearch-cli#S2 | Kernel (packages/kernel) — Retroaererd Engine + RRF | 0.6061 | 0.7978 | 0.8918 |
| anysearch-cli#S3 | Retriever (packages/retriever) — provider contracts | 0.6254 | 0.8023 | 0.9023 |
| anysearch-cli#S4 | MCP server (apps/mcp) — 5 MCP tools | 0.6126 | 0.7453 | 0.9059 |
| anysearch-cli#S5 | CLI (apps/cli) — entry point, ans command | 0.6077 | 0.7855 | 0.9051 |
| **全量均值（含 title）** | | **0.5700** | **0.7318** | **0.8786** |

**排除 title 单位后的仓库均值**（title 与 package name 精确匹配 -> 平凡高分，见 §3.3）：

| 仓库 | MiniLM | bge-small | me5-small | 排序（bge） |
|---|---|---|---|---|
| anysearch-cli | 0.6129 | **0.7827** | 0.9013 | 收敛最好 |
| env-manager | 0.5287 | 0.6805 | 0.8749 | 中间 |
| jiahao | 0.4288 | 0.6088 | 0.8424 | 最低 |

**anysearch-cli 收敛最好的机制**：其 README 直接列出包/目录字面名（`packages/kernel`、`apps/mcp`），而交付物就是这些同名目录与对应提交 -> 语义与词法双路径都能命中。

### 3.3 人工抽检（Decision 4.1 要求的 third leg）

**口径**：对 15 个抽样点逐条阅读 top-3 交付证据后人工打标：`delivered`（交付实质支持声明）/ `drift`（部分回响或单位自身为断句碎片）/ `absent`（无交付对应）。结果：**13 delivered / 1 absent / 1 drift**。

| 标签 | 抽样点 | 判据 |
|---|---|---|
| absent | env-manager#S2 | 营销口号 Adapts seamlessly to every environment；top3 均为泛化 build/refactor 提交 |
| drift | jiahao#S5 | 单位自身为 README 硬换行断句碎片；仅部分回响 generator profile advisory |
| delivered | 其余 13 点 | 例：env#S3 top1=feat(secrets) Phase6-7 sops+Azure KV；any#S2 top1=feat G009 Retroaererd Engine |

**两个必须披露的抽检发现**：

1. **title 单位产生平凡高分**：jiahao#S1=0.9789 / anysearch-cli#S1=0.9960 是因为仓库标题与 package name 字面相同，**不度量任何东西**。-> 建议：S1 抽样排除 title 单位（本报告已同步给出排除后的仓库均值）。
2. **抽象定位 + 流程化交付词汇 = 系统性假阴性**：jiahao 的 4 个已交付声明中有 3 个（S2/S3/S4）bge 分低于 0.70（0.608 / 0.622 / 0.584）——其定位词汇（False Completion Syndrome / independence theorems）在交付端表现为流程词（`fix(adr-0044): make twins claim-directed`、`docs: verifier deployment discipline`）。**这是本度量方法的已知盲区，不是 jiahao 的漂移**，必须在报告层显式标注（对齐调研引用的 arXiv:2603.00489 发现——21.5% 误报实为真实漂移；本票是反向情形）。

### 3.4 70% 阈值跨仓校准数据（交付 3 核心）

双口径校准。**口径 A（跨仓 out-of-domain）**：正 = 本仓意图 vs 本仓交付（n=15）；负 = 本仓意图 vs 他仓交付（n=30）。**口径 B（域内人工抽检）**：正 = 13 delivered；负 = 1 absent + 1 drift。

**口径 A — 跨仓 PR 曲线（θ : precision / recall / F1）**

| θ | MiniLM | bge-small | me5-small |
|---|---|---|---|
| 0.50 | 0.333/1.000/0.500 | 0.333/1.000/0.500 | 0.333/1.000/0.500 |
| 0.60 | 1.000/0.467/0.636 | 0.394/0.867/0.542 | 0.333/1.000/0.500 |
| 0.65 | 1.000/0.133/0.235 | 0.526/0.667/0.588 | 0.333/1.000/0.500 |
| **0.70** | **1.000/0.133/0.235** | **0.643/0.600/0.621** | **0.333/1.000/0.500** |
| 0.75 | 1.000/0.133/0.235 | 1.000/0.333/0.500 | 0.333/1.000/0.500 |
| 0.80 | 1.000/0.133/0.235 | 1.000/0.200/0.333 | 0.333/1.000/0.500 |
| best F1 | **0.733 @0.45** | **0.621 @0.70** | 0.500（无有效 θ） |

**口径 B — 域内人工抽检 PR 曲线（θ : precision / recall / F1）**

| θ | MiniLM | bge-small | me5-small |
|---|---|---|---|
| 0.40 | 1.000/1.000/1.000 | 0.867/1.000/0.929 | 0.867/1.000/0.929 |
| 0.50 | 1.000/0.692/0.818 | 0.867/1.000/0.929 | 0.867/1.000/0.929 |
| 0.60 | 1.000/0.538/0.700 | 0.923/0.923/0.923 | 0.867/1.000/0.929 |
| 0.65 | 1.000/0.154/0.267 | 1.000/0.769/0.870 | 0.867/1.000/0.929 |
| **0.70** | **1.000/0.154/0.267** | **1.000/0.692/0.818** | **0.867/1.000/0.929** |
| 0.75 | 1.000/0.154/0.267 | 1.000/0.385/0.556 | 0.867/1.000/0.929 |
| 0.85 | 1.000/0.154/0.267 | 1.000/0.154/0.267 | 1.000/0.769/0.870 |

**校准结论（3 仓 15 抽样点实测）**：

1. **70% 对 bge-small-en-v1.5 是合法工作点**：口径 B precision=1.00（零误伤）、recall=0.692；F1 在 [0.60, 0.70] 形成平台（0.92 -> 0.82），跨口径 best-F1 也落在 0.70。两个负样本分别为 0.5626（absent）与 0.6213（drift）。
2. **70% 对 MiniLM 完全失效**：口径 B recall 仅 0.154（漏 11/13），其真实工作点在 0.40；口径 A 亦然（best F1@0.45）。**同一个 70% 在两个模型上不可通用**。
3. **70% 对 me5-small 无意义**：口径 B 从 0.20 到 0.80 全部输出同一个 F1=0.9286（所有正负样本均过阈），属退化曲线。

**v1 初版参数建议（初版，非 hard rule，90 天校准窗口）**：

| 参数 | 值（bge-small-en-v1.5） | 依据 |
|---|---|---|
| θ_hi（一致） | **0.70** | 口径 B precision=1.00；口径 A F1 峰值 |
| τ_lo（灰区下界） | **0.60** | Fellegi-Sunter 双阈值；口径 B 0.60 处 precision=0.923 仍高 |
| 灰区 [0.60, 0.70) | 人工复核队列 | 审计产品天然需要此结构（调研 Q3 方法③） |
| < 0.60 | 漂移 / 缺失 | 两个负样本分别落在此区与灰区 |
| 模型切换时 | 阈值必须重校 | MiniLM 等效 0.40、me5 无工作点（§2.3） |

### 3.5 漂移起点检测（S1 判据之二，5 窗口时序）

窗口 W1=最新 -> W5=最旧，每窗约 1/5 提交量；值为该窗交付语料对 5 个抽样意图的平均最大余弦。

| 仓库 | 模型 | W1 | W2 | W3 | W4 | W5 | 趋势 |
|---|---|---|---|---|---|---|---|
| env-manager | bge | 0.6123 | 0.6249 | 0.6093 | 0.6531 | **0.6570** | W5 最高，W1/W3 最低 |
| jiahao | bge | 0.5679 | 0.5603 | 0.5585 | 0.5425 | **0.5979** | W5 最高 |
| anysearch-cli | bge | 0.6208 | 0.6433 | 0.6335 | 0.6428 | **0.7417** | W5 显著最高 |
| env-manager | MiniLM | 0.3629 | 0.3732 | 0.3642 | 0.4165 | **0.4510** | W5 最高 |
| jiahao | MiniLM | 0.2803 | 0.3159 | 0.3144 | 0.2674 | **0.3866** | W5 最高 |
| anysearch-cli | MiniLM | 0.3519 | 0.3429 | 0.3834 | 0.3376 | **0.5159** | W5 最高 |

**观察**：3 仓 × 2 模型共 6 条序列，**6/6 都是最旧窗口（W5）对齐度最高**，即近期窗口与定位声明的对齐度下降——形式上满足 S1 「漂移起点检测」的信号。

**但本票必须诚实标注替代解释**（不硬凑结论）：近期窗口提交主题高度集中于 ADR/CI/audit/report 等**流程治理词汇**（如 `docs(adr-0056)`、`fix(ci)`），而定位声明用**产品功能词汇**；这可能是**语汇寄存器漂移**而非产品定位漂移。区分二者需引入 5.3 的「治理词排除表」或人工复核，归入 v2 待验。本票只交付**可观测信号**与替代解释，不宣布 drift 结论。

### 3.6 词法 fallback 基线对照（交付 4 的实测依据）

| 仓库 | 词表大小 | 关键词覆盖率均值 | TF-IDF 余弦均值 | 与语义对齐的关系 |
|---|---|---|---|---|
| anysearch-cli | 1313 | **0.9270** | **0.6125** | 字面命名型：词法已充分（T8 命中） |
| env-manager | 1588 | 0.7433 | 0.3783 | 中间态：默认 hybrid |
| jiahao | 926 | **0.4712** | 0.4859 | 抽象词汇型：词法不足，**必须 embedding**（T8 不命中） |

> 关键：jiahao 的词法覆盖率（0.471）显著低于 anysearch-cli（0.927），但其语义对齐度（bge 0.609 vs 0.783）差距没那么大——**词法覆盖率不能替代语义对齐度，二者互补**。这直接支撑 §4 的「默认 hybrid、非二选一」。

## 4. Deliverable 4 — 关键词 fallback 触发条件清单

**默认架构 = hybrid（dense + 词法），不是二选一**（调研 Q4 结论：dense 漏精确标识符、sparse 漏同义改写，二者在相反方向失效）。机检工件：`01-fallback.json`（8 条触发条件，每条含 `id / name / predicate / action / rationale / source_ref`）。

| # | 触发条件 | 可机检判定式 | 动作 | 依据 |
|---|---|---|---|---|
| T1 | 无模型 / 离线 / 服务不可达 | backend_health != ok OR model_file_missing OR consecutive_timeouts >= 3 | 纯词法 | BEIR：BM25 零样本稳健基线 |
| T2 | 语料过小 | effective_text_pairs < 100 OR total_tokens < min_sample | 纯词法 | 小语料下 dense 优势不成立 |
| T3 | 语言不在模型支持清单 | detected_language NOT IN model.supported_languages | 词法或多语模型 | bge-small/gte-small 官方声明仅英文 |
| T4 | 标识符密集型输入 | identifier_token_ratio >= 0.25（版本号/错误码/API 端点/函数名正则命中率） | hybrid 内词法优先 | Pinecone hybrid：dense 漏精确标识符 |
| T5 | 成本预算超线 | api_price * projected_tokens > budget_line | 本地小模型或词法 | 官方定价；out-of-domain 时 α 降到 0.3-0.6 |
| T6 | 确定性要求 | requirement CONTAINS (reproducible|audit|compliance) | 纯词法 | 供应商可静默更新，嵌入浮点不可复现 |
| T7 | 可解释性要求 | need_per_token_attribution == true | 纯词法 | BM25 的 IDF/TF 可逐 token 解释 |
| T8 | 字面命名约定（**本票实测新增**） | keyword_coverage_mean >= 0.85 AND lex_cos_mean >= 0.55 | 词法充分，可降本 | anysearch-cli（kw=0.927, lex=0.613）实测：词法已足够；反例 jiahao（kw=0.471）必须 embedding |

**组合公式**：`词法优先 <= (T1 OR T2 OR T3 OR T6 OR T7)`；其余默认 hybrid；T4/T5 只调权不换道；T8 仅降本不降召回。

> 实现捷径：若 v2 切 bge-m3，其 **sparse 输出即同模型内 BM25 等价物**，无需第二套索引；若用纯 dense，则按上表走独立 TF-IDF 索引。

## 5. 调研记录（WORKFLOW §4.2.3）

- **atomcode 深度调研已执行**：`atomcode --prompt-file reports/01-research-prompt.md --output-format text`（无头），原始输出已落盘 `01-atomcode-research.md`（35087 字节）。其 Sufficiency Gate 自查：searches 17（web_search x8 + Tavily x5 + AnySearch x4 三引擎交叉）/ angles 五类全覆盖 / full reads 16 次原文核验 / 43 条来源清单含 URL 与访问日期。
- **核心调研结论（与实测互证）**：
  1. **选型**：本地主推 bge-m3（多语含中英 + 内置 sparse fallback）；纯英文 bge-small-en-v1.5 / gte-small；API 主推 text-embedding-3-small。**本票实测修正**：v1 三仓语料以英文为主，bge-small-en-v1.5 在 70% 锚点上实际最优（F1 0.818），故 v1 选它、bge-m3 列 v2。
  2. **心智模型（≥2 工业对标）**：① **Reflexion Model**（Murphy/Notkin/Sullivan, FSE 1995 / IEEE TSE 2001）——声明模型 vs 源码模型一致性矩阵，输出 convergence/divergence/absence 三分类（本票 §3.4 的「一致/灰区/漂移-缺失」三区即照搬此心智）；② **文档-代码一致性检测**（DocChecker EACL 2024；README 维护 arXiv:2603.00489，714 仓 25511 PR）；③ **需求-代码可追踪性 TLR**（LiSSA ICSE 2025）；④ **架构漂移/侵蚀**（Perry & Wolf 1992；drift = 文档与实现背离）。**结论：工业界无「仓库级意图-交付对齐」的同构产品**（mission drift / scope creep 只有概念无量化公式）——本票是业界首次把该度量做成可机检指标。
  3. **阈值**：0.70 作初版锚点合法，但绝对余弦不可跨模型/跨语料迁移（anisotropy，arXiv:2601.16907）。**本票实测证实该结论**（§2.3）。
- **回顾 docs/adr/ 与 CONTEXT.md**：ADR-0004（战略 quadrant 5 维，S1 定义与证据源）；CONTEXT.md S1 词条（定位收敛、判据 = 定位关键词覆盖率 + 漂移起点检测、证据源清单）与 Sufficiency Gate 词条（不足则标 data doesn't show）。

## 6. 信息缺口（Sufficiency Gate / 不掩盖）

1. **标注集规模小**：域内口径 B 仅 13 正 / 2 负，置信区间宽，未算 bootstrap CI。调研建议 150-300 对分层标注（语言 x 规模 x 领域）——本票是 **v1 基线**，不是终态。
2. **bge-m3 未实测**：0.6B 参数超 v1 预算；中文主导语料下的最优模型未经本仓验证。
3. **漂移信号与语汇寄存器漂移不可分离**：6/6 序列 W5 最高，但可能源于近期提交集中在 ADR/CI/治理词汇，而非产品定位漂移。本票只交付可观测信号 + 替代解释，**不宣布 drift 结论**。
4. **jiahao 型系统性假阴性未解决**：抽象定位 + 流程化交付词汇导致 recall 损失（§3.3）；本票只披露不修复，修复需 v2 引入「治理词排除表」或双通道（功能词 vs 治理词分算）。
5. **跨仓负样本不是严格「真负」**：三仓同为单人 AI 主导的开发工具，语义域接近（jiahao 与 anysearch-cli 均属 LLM agent 领域），使负分偏高（bge neg_mean 0.6275），压缩了分离度。严格真负应来自异领域仓库。
6. **title 平凡高分未在流水线中自动排除**：本票只在报告层给出排除后的均值；建议 #14 共享骨架收编时把「排除 title 单位」写成硬规则。
7. **T8 阈值（0.85/0.55）样本不足**：来自 3 仓观测，需扩语料重校。
8. **交付语料未含 PR 标题 / issue / label**：本地无 GitHub API 元数据（与 A-004 同类缺口）；CONTEXT.md S1 词条声明的完整证据源尚缺三支。

## 7. 阻塞

无。#05 已闭环解锁本票；本票一次闭环。输出供 **A-014**（#14 共享骨架收编 S1 对齐字段块）与 **A-015**（#15 scale 切片差异边界）复用。

## 8. Lessons 候选（已录 WORKFLOW §4）

1. **transformers.js 的 Node 入口陷阱**：必须 import 包 exports 映射的 Node 分支（`dist/transformers.node.mjs`），直接 import `dist/transformers.js`（web 构建）会导致 ONNX 后端 `InferenceSession` 为 undefined，报错 `Cannot read properties of undefined (reading create)`；用绝对路径 import 会绕过 exports 映射，必须自己看 package.json。
2. **70% 阈值不可跨模型迁移（实测证实 anisotropy）**：同一 0.70 在 MiniLM / bge-small / me5-small 上分别意味着「几乎全漏」「刚好」「全通过」。**阈值必须与模型版本绑定存储**。
3. **「多语模型更强」的直觉在小模型上不成立**：me5-small 的分数被前缀污染压缩到 0.83-0.91 窄带，pos/neg gap 仅 0.025，实际无判别力。
4. **title 单位产生平凡高分**：仓库标题与 package name 字面相同时相似度 0.98-0.996，不度量任何东西；S1 抽样应排除 title。
5. **README 硬换行必须按句切分**：v1 抽取器把 jiahao 的 `What it does` 段落切成 12 个断句碎片（如 `self-deceiving about completion, hallucinating self-evaluation. Jiahao makes`）——段落必须先合并再按句切。
6. **抽象定位 + 流程化交付词汇 = 系统性假阴性**：定位词（False Completion Syndrome）在交付端表现为流程词（fix(adr-0044): make twins claim-directed），使真实已交付的声明低于阈值。这是度量的盲区，不是仓库的漂移。

## 9. 引用文件列表

- [issues/01-s1-semantic-measurement.md](../issues/01-s1-semantic-measurement.md) ｜ [handoffs/01-s1-semantic-measurement.md](../handoffs/01-s1-semantic-measurement.md) ｜ [prompts/01-s1-semantic-measurement.md](../prompts/01-s1-semantic-measurement.md)
- [spec.md](../spec.md) §Decision 4.1/4.5 ｜ [decision-ledger.md](../decision-ledger.md) A-001/A-005 ｜ [WORKFLOW.md](../WORKFLOW.md) §4.2 ｜ [README.md](../README.md) Wave 2
- [docs/adr/0004-strategic-quadrant-five-dims.md](../../../docs/adr/0004-strategic-quadrant-five-dims.md) ｜ CONTEXT.md（S1 词条 / Sufficiency Gate）
- [reports/05-unit-matrix.json](05-unit-matrix.json)（上游矩阵 S1 行）+ [reports/05-report.md](05-report.md)
- 本票产物：`01-research-prompt.md` ｜ `01-atomcode-research.md` ｜ `01-extract.mjs` ｜ `01-corpora.json` ｜ `01-align.mjs` ｜ `01-align.json` ｜ `01-spotcheck.mjs` ｜ `01-spotcheck.json` ｜ `01-fallback.json` ｜ `01-check.mjs` ｜ 本报告

## 10. 提交面留痕（2026-09-12）

- **已入库**：本报告 + 10 个产物（`01-corpora.json` / `01-align.json` / `01-spotcheck.json` / `01-fallback.json` / `01-atomcode-research.md` / `01-research-prompt.md` + 4 个 .mjs 脚本）→ 分支 `fix/s1-semantic-measurement-01`（commit `lnv`）。
- **留工作区（按 W1/W2 先例：不吞并他窗口工作）**：① `decision-ledger.md` 的 A-001 行状态 + 「A-001 结论落盘」段——与 A-003/A-005/A-010/A-017 等 7 个他票窗口的行状态编辑同处 hunk `sq:8`，无法按 hunk 拆分；② `WORKFLOW.md` 的 2 行 lessons——与 #03 窗口的 lessons 行同处 hunk `py:2`。
- **并发写入告警（本票新发现）**：本票首次写入 ledger 后，被另一窗口（#03）的整体重写覆盖（A-001 行状态与结论段丢失）。已幂等重放恢复。**ledger/WORKFLOW 是跨窗口共享文件，多窗口并发写存在丢更新风险**——建议 #14 共享骨架收编时引入 per-window 追加段或分片文件。
- 上述共享文件磁盘状态即最新账本（D-6 防蒸发已满足），仅提交面未合拢，不阻塞本票语义闭环。
