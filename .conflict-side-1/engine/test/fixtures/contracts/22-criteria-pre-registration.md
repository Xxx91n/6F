# 22 — B 层判据预声明文档（RAT Pre-Registration）

> 覆盖 A-023 / A-024 / A-025 / A-029｜spec: `spec.md` §R3-D4｜决策: `docs/adr/0013-three-layer-acceptance-gates.md`｜issue: `issues/22-b-criteria-prereg.md`
> 状态：**跑前预注册**。本文件成稿后须经用户审阅方可 commit；commit 之后才允许跑票 23 首报。

---

## §0 文件地位与闸门顺序

| 项 | 值 |
|---|---|
| 本文件 | `.scratch/architecture-recovery/reports/22-criteria-pre-registration.md` |
| C 层裁定依据（预入库） | `.scratch/architecture-recovery/reports/22-c-adjudication-basis.md` |
| 阈值测定脚本（只读） | `.scratch/architecture-recovery/reports/22-threshold-probe.mjs` |
| 测定原始数 | `.scratch/architecture-recovery/reports/22-threshold-raw.json` |
| 判据族映射上源 | `reports/21-collectors.json` 的 `detector_binding` + `engine/src/collect/collectors.ts` 的 `DETECTOR_BINDING` |
| 闸门顺序 | ① 本文件成稿 → ② 用户审阅 → ③ commit 入库 → ④ 才允许跑票 23 首报 |
| 倒置后果 | 任何一步倒置 = FAIL（A-025；spec §R3-D4「文档须用户审阅后 commit」；ADR-0013 执行序锁定） |
| 核心纪律 | 阈值跑前写死、跑后禁调（A-023；ISO 13528:2022 §9 能力评定纪律） |

---

## §1 三级 kill criterion 措辞

措辞逐字对齐 ADR-0013 Decision 段，本文件只做编号化，不改语义。

| 级别 | 名称 | 组成 | 触发含义 | 处置 |
|---|---|---|---|---|
| 级 1 | 前置管线健康闸 | PC-1、PC-2 | 采集管线本身失效 | 整轮实验无效，P0；**不计入价值判定** |
| 级 2 | 主前提证伪闸 | TC-1、TC-2、TC-3 | 主前提被证伪 | 记入首报结论；未命中不等于「通过」，只等于「未被证伪」 |
| 级 3 | 反向红条 | NC-1 | 判据特异性失效 | 走 §5 复核路径，**不自动定罪** |

补充语义（ADR-0013「未命中=合法数据」条款）：「未命中 = 合法实验数据」仅适用于真判据；正对照未中一律判实验无效。

---

## §2 判据总表与 detector 族映射

映射逐行取自票 21 `reports/21-collectors.json#detector_binding`，**本票未改 2+3+1 配比**（冲突 C-21-1 的解法仍为跨族驱动，未触发改向）。

| 判据 | 类型 | 主族 | 交叉族 | 同族正对照 | 阈值 | 票 21 条目一致性 |
|---|---|---|---|---|---|---|
| PC-1 管线健康闸 A | 正对照 | `adr-structure` | `positioning` | — | 非空即通过 | `families: [adr-structure, positioning]`，`covers: [TC-2, TC-3]` ✅ |
| PC-2 管线健康闸 B | 正对照 | `gitlog` | `adr-structure` | — | `delta_days > 0` | `families: [gitlog]`，`cross: [adr-structure]`，`covers: [TC-1]` ✅ |
| TC-1 S2a 事后补写占比 | 真判据 | `gitlog` | `adr-structure` | PC-2 | 见 §3.1 | `primary_family: gitlog`，`same_family_control: PC-2` ✅ |
| TC-2 S2b 五件套完整度 | 真判据 | `adr-structure` | — | PC-1 | 见 §3.2 | `primary_family: adr-structure`，`same_family_control: PC-1` ✅ |
| TC-3 S1 定位覆盖率 | 真判据 | `positioning` | — | PC-1 | 见 §3.3 | `primary_family: positioning`，`same_family_control: PC-1` ✅ |
| NC-1 特异性守卫 | 负对照 | `adr-structure` | — | 无 | 0 命中 | `primary_family: adr-structure` ✅ |

**核对结论**：6/6 行与票 21 逐行一致，无跨族错位。若票 23 发现任一行的族指认与实测不符，属停票级偏差（启动器 delta 第 2 条）。

---

## §3 真判据逐条（信号 / 可操作定义 / 阈值 / 方向 / 未中语义 / 测定方法与原始数）

> 测定环境（三条共用，写死）：HEAD `b4f97963`（完整历史，`is-shallow-repository=false`，64 commits）；`observed_at = 2026-09-13T13:46:11+08:00`（取自 HEAD committer date，不用 `Date.now`，保证同 commit 可复现）；ADR 全集 `docs/adr/*.md` = 13 份。
> 测定口径 = 票 21 三族采集器纯函数（`collectAdrStructure` / `collectPositioning` / `collectGitlog`），与首报同口径。

### §3.1 TC-1 — S2a ADR 事后补写占比

| 项 | 内容 |
|---|---|
| 信号 | `git.adr_lag_days`（`gitlog@v1`，跨族 `adr-structure@v1` 提供 `adr_date`） |
| 可操作定义 | 对每份 ADR：`delta_days = Date 头日期 − 该文件 git 首现提交日期`（天）。`delta_days > 90` 记为「事后补写」 |
| 统计量 | `lag_ratio = 事后补写数 / 可判定数`；可判定数 = 同时具备 Date 头与 git 首现提交的 ADR 数 |
| 判红方向 | `lag_ratio > 0.20`（严格大于） |
| 可执行门槛 | 可判定数 ≥ 5，否则判 **INCONCLUSIVE** |
| 阈值来源 | 90 天与 20% 直接沿用 A-002 已锁定的先例锚（非 6F 拟合）；门槛 5 由「`lag_ratio` 最小可观测增量 = 1/n，须 1/n ≤ 0.20 才能表达 20% 粒度」推出 → n ≥ 5 |
| 未中语义 | INCONCLUSIVE **不等于绿**：该判据在 6F 上无 assay sensitivity，结果不得用于支持或证伪主前提，只作为「数据缺口」输入 C 层（对应 A-002 早已预警的「ADR 无时间戳头则 S2 阈值不可执行」） |

**测定原始数（2026-09-13T13:46:11+08:00）**：

| 量 | 值 |
|---|---|
| ADR 总数 | 13 |
| 有 `Date` 头 | 2（15.38%） |
| 可判定数 | 2 |
| `docs/adr/0012-value-validation-loop-first.md` | `adr_date=2026-09-12`，`first_commit=2026-09-13T01:32:42+08:00`，`delta_days=-1` |
| `docs/adr/0013-three-layer-acceptance-gates.md` | `adr_date=2026-09-12`，`first_commit=2026-09-13T01:32:42+08:00`，`delta_days=-1` |
| 事后补写数 | 0 |
| `lag_ratio` | 0（无意义：可判定数 < 门槛） |
| **判定** | **INCONCLUSIVE**（可判定数 2 < 5） |

### §3.2 TC-2 — S2b ADR 五件套完整度

| 项 | 内容 |
|---|---|
| 信号 | `adr.five_piece_completeness`（`adr-structure@v1`） |
| 五件套 | `Status` / `Date` / `Context` / `Decision` / `Consequences`（= `ADR_FIVE_PIECE`，采集器常量） |
| 统计量 | `mean_ratio` = 各 ADR `ratio` 的算术平均；`field_missing_ratio[k]` = 缺第 k 件的 ADR 数 / ADR 总数 |
| 判红方向 | 两条独立，任一命中即 RED：(a) `mean_ratio < 0.60`；(b) 存在 k 使 `field_missing_ratio[k] > 0.50` |
| 阈值来源 | 由五件套语义推出，非 6F 分布拟合：(a) 低于 3/5 意味着平均每份 ADR 缺 2 件以上 → 结构性缺失而非个别遗漏；(b) 过半 ADR 缺同一件 → 系统性缺失而非个案 |
| 未中语义 | RED = 主前提「6F 的 ADR 具备可机器核验的决策记录结构」被证伪 |

**测定原始数（同一环境）**：

| 量 | 值 |
|---|---|
| ADR 总数 | 13 |
| `mean_ratio` | **0.2462** |
| 缺失计数 | Status 11 / Date 11 / Context 9 / Decision 9 / Consequences 9 |
| 缺失率 | Status 84.62% / Date 84.62% / Context 69.23% / Decision 69.23% / Consequences 69.23% |
| **判定** | **RED**（(a) 0.2462 < 0.60 命中；(b) Status/Date 84.62% > 0.50 命中） |

**口径事实声明（不得事后重新解释）**：`adr-structure@v1` 只识别英文结构标记（`- Status:` / `- Date:` / `## Context` / `## Decision` / `## Consequences`）。6F 的 ADR-0001~0007 等以「H1 标题 + 自由正文」形式书写，故被判缺章节。这是**判定的真实结果**，不是采集器误报；若未来要改用中文标记口径，属**改向**，须新开账本条目并以 v2 追加本文件（§7），不得在首报后静默重判。

### §3.3 TC-3 — S1 定位关键词覆盖率

| 项 | 内容 |
|---|---|
| 信号 | `positioning.keyword_coverage`（`positioning@v1`） |
| 采集配置（非阈值，冻结） | `topN = 20`；分词 = ASCII 词（长度 ≥ 2，小写化）+ CJK 2-gram；停用词表 188 词，全文落盘于 `22-threshold-raw.json#tc3_s1_coverage.stopwords` |
| 意图源（冻结） | `.scratch/architecture-recovery/README.md`、`CONTEXT.md` |
| 交付源（冻结） | `git log` subject 全集（64 条）@ HEAD `b4f97963` |
| 判定口径 | 每个意图源独立算 `ratio`；取**最低**一条为 TC-3 结果（保守口径，跑前写死） |
| 三档 | `ratio < 0.50` = RED；`0.50 ≤ ratio < 0.70` = AMBER；`ratio ≥ 0.70` = GREEN |
| 阈值来源 | A-001 明令「阈值不能锁定 70% 为 hard rule」（W2 #01 已证阈值不可跨模型迁移），故 0.70 降为**观察线**；RED 线取 0.50 ——「半数定位关键词未出现在交付文本中」是「定位未收敛」的最小可辩护表述 |
| 未中语义 | AMBER = 不触发 kill，但记入 C 层观察，首报证据章必须列出 `missed` 关键词清单 |

**测定原始数（同一环境）**：

| 意图源 | hit / keywords | ratio |
|---|---|---|
| `.scratch/architecture-recovery/README.md` | 13 / 20 | 0.6500 |
| `CONTEXT.md` | 12 / 20 | 0.6000 |
| **判定（取最低）** | — | **AMBER**（0.6000） |

---

## §4 正对照（级 1 管线健康闸）

| 判据 | 断言（fixture 级，票 21 已同形验证） | 未中后果 |
|---|---|---|
| PC-1 | fixture 植入一份五件套齐全 + supersede 链完备的 ADR 与一份完整定位声明；`adr-structure` 与 `positioning` 两族**均**须产出非空事实 | 管线故障 P0，整轮实验无效 |
| PC-2 | fixture 植入一份已知事后补写 ADR（`adr_date` 晚于首现提交）；`gitlog` 族须检出 `delta_days > 0` | 管线故障 P0，整轮实验无效 |

正对照不计入价值判定：PC 全 PASS 只证明「assay 有检测能力」，不证明主前提成立（ICH E10 §1.5 同构）。

---

## §5 负对照 NC-1（级 3 反向红条）

### §5.1 选材

**选定：`engine/src/fact/schema.ts`**

选材理由（对应 A-024「已知干净片段」口径）：

1. 属**最近一轮审计返工后的文件**——票 20（fact table schema v0）刚闭环，本文件是其确定性契约产物，已被人工审过；
2. 纯逻辑代码、无散文结构，确定不含 ADR 五件套标记与 supersede 链；
3. 不在 TC-2 的扫描作用域（`docs/adr/*.md`）内，**无自指**；
4. 非采集器自身源码（排除 `engine/src/collect/collectors.ts` 的自指风险）。

**备份选材**：`.gitattributes`（同为实测 0 命中，仅在 §5.3 第 3 步启用）。

### §5.2 预期 0 命中声明（三条同时成立才算 NC-1 通过）

| 编号 | 条件 | 设计意图 |
|---|---|---|
| N-a | 采集器对该文件产出 `fact_count > 0` | 证明 detector 真跑了，排除「空跑导致的假 0」 |
| N-b | `adr.five_piece_completeness.present = 0` | 五件套 0 命中 |
| N-c | `adr.supersede_link_present.present = false` | supersede 链 0 命中 |

**实测（2026-09-13）**：`fact_count = 11` ✅，`five_piece_present = 0` ✅，`supersede_present = false` ✅ → NC-1 通过。
（同批扫描对照：`.gitattributes` / `.github/workflows/engine-ci.yml` / `engine/src/fact/schema.ts` / `engine/src/collect/collectors.ts` / `CONTEXT.md` 五者 `five_piece` 均为 0，见 `22-threshold-raw.json#nc1_candidates`。）

### §5.3 命中时的复核路径（不自动定罪）

1. **先疑选材**：复核该选材在本次运行中是否被改写为含 ADR 结构标记（`git diff` 该文件的本次变更）。
2. **选材仍干净 → 判族误报**：`adr-structure` 族存在系统性误报，TC-2 / TC-3 结果作废，管线缺陷定级 P1，整轮 B 层判定无效，须修族后重跑。
3. **选材已被污染 → 换选材**：启用备份选材 `.gitattributes` 重跑 NC-1，并在首报记录选材更换与原因。
4. **强制留痕**：复核结论必须写入首报证据章 + 回写 `decision-ledger.md`，禁止静默处理（A-024「命中走复核不自动定罪」）。

---

## §6 引用策略

权威锚 = ICH E10 + ISO 13528（A-029 裁定）。逐条给出处；不可回查者不列。

| 用途 | 标准 | 条款位 | 可回查出处 |
|---|---|---|---|
| 正对照的合法性 | ICH E10 *Choice of Control Group and Related Issues in Clinical Trials* | **§1.3.4 Active (Positive) Concurrent Control**（PDF 第 11 页 / 印刷页 5） | `https://database.ich.org/sites/default/files/E10_Guideline.pdf` |
| 检测能力（assay sensitivity） | 同上 | **§1.5 Assay Sensitivity**（PDF 第 13 页 / 印刷页 7）；§1.5.1 非劣/等效试验、§1.5.2 优效试验 | 同上 |
| 阈值与能力评定 | ISO 13528:2022 *Statistical methods for use in proficiency testing by interlaboratory comparison* | **§9 Calculation of performance statistics**；**§9.4 z scores** | `https://www.iso.org/standard/78879.html`；样章 `https://cdn.standards.iteh.ai/samples/78879/63a7d287acda4f4fad482b038a6b75d3/ISO-13528-2022.pdf` |

**§1.5 原文引用（逐字，用于解释为何 PC 须先于 TC）**：

> Assay sensitivity is a property of a clinical trial defined as the ability to distinguish an effective treatment from a less effective or ineffective treatment.

**佐证锚（工业类比，非权威锚，内部可回查于 ADR-0013 Context 的五线汇聚）**：

| 类比 | 出处 | 支撑的判据设计 |
|---|---|---|
| NIST CAVP / Known-Answer Tests | `https://csrc.nist.gov/Projects/Cryptographic-Algorithm-Validation-Program` | 负对照 0 命中的「已知答案」心智（NC-1） |
| OWASP Benchmark | `https://owasp.org/www-project-benchmark/` | 误报/漏报需有量化基线，而非「看起来对」（NC-1 的 N-a 条件） |
| OSF Preregistration | `https://www.cos.io/initiatives/prereg` | 预注册心智：假设与判据先于数据固定（本文件整体） |

**明令禁止**：引用任何单一综述文献断言「混合 = 标准」（A-029）。五领域独立汇聚形态只在 ADR-0013 Context 中作佐证引用，不作权威锚。

---

## §7 跑后禁调与偏离处理

1. 票 23 首报跑完后，TC-1 / TC-2 / TC-3 的**阈值、统计量定义、意图源、交付源、选材**一律不得修改。
2. 任何「跑后改数」= FAIL（启动器专属 delta 第 1 条）。
3. 确需修改时的唯一合法路径（四步全做）：① 新开账本条目；② 本文件以 **v2 追加**（不覆盖 v1，v1 永久留档）；③ 明文声明 v1 结果作废及理由；④ 重跑整轮 B 层。
4. 首报若跑出与本文件 §8 预期不同的数值，以首报实测为准，**但阈值不变**；差异必须在首报中逐条对账说明。

---

## §8 预声明预期结果（跑前写死，防事后调节）

| 判据 | 预声明预期 | 依据 |
|---|---|---|
| PC-1 | 须 PASS（否则 P0） | fixture 断言 |
| PC-2 | 须 PASS（否则 P0） | fixture 断言 |
| TC-1 | **INCONCLUSIVE** | 可判定数 2 < 门槛 5 |
| TC-2 | **RED** | `mean_ratio` 0.2462 < 0.60；Status / Date 缺失率 84.62% > 0.50 |
| TC-3 | **AMBER** | 最低 `ratio` 0.6000（CONTEXT.md） |
| NC-1 | PASS（0 命中） | 实测 `fact_count=11` / `present=0` |

**综合预期（跑前声明）**：在管线健康（PC 全 PASS）的前提下，B 层预期输出为「主前提在 ADR 治理维度（TC-2）被证伪 + 事后补写维度（TC-1）不可判定 + 定位收敛维度（TC-3）观察」。此预期在 commit 时刻即已固定；**不得因结果不利而回调阈值或改口径**。

---

## §9 引用文件

| 文件 | 作用 |
|---|---|
| `.scratch/architecture-recovery/spec.md` §R3-D4 | 规范来源 |
| `.scratch/architecture-recovery/issues/22-b-criteria-prereg.md` | 完成判据 |
| `.scratch/architecture-recovery/handoffs/22-b-criteria-prereg.md` | 完成定义 |
| `docs/adr/0013-three-layer-acceptance-gates.md` | 三层闸门与 2+3+1 配比 |
| `docs/adr/0012-value-validation-loop-first.md` | 阶段 1 于 6F 出首报 |
| `.scratch/architecture-recovery/decision-ledger.md`（A-002 / A-023 / A-024 / A-025 / A-029） | 摩擦点与纪律 |
| `reports/21-collector-map.md` §4 + `reports/21-collectors.json` | detector 族映射上源 |
| `engine/src/collect/collectors.ts` | 三族采集器实现（同口径） |
| `reports/22-threshold-probe.mjs` / `reports/22-threshold-raw.json` | 测定脚本与原始数 |
| `reports/22-c-adjudication-basis.md` | C 层裁定依据预入库 |
