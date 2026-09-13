# 22 — B 层判据预声明文档：报告

- A-xxx covered: A-023, A-024, A-025, A-029
- Spec ref: `spec.md` §R3-D4｜Decision: `docs/adr/0013-three-layer-acceptance-gates.md`
- 守卫：`reports/22-criteria-check.mjs` **19/19 PASS**（退出码 0）
- 版本控制状态：**未 commit**（闸门：须用户审阅后方可 commit，A-025 / spec §R3-D4）

---

## §1 开工复述（per 启动器「开工第一句」）

**阻塞状态**：票 22 blocked by #20（fact table schema v0）与 #21（确定性采集器）。开工前核实 `decision-ledger.md`：A-021 = `done — 票 #20 闭环`，A-022 = `done — 票 #21 闭环`；`but branch list` 显示 `20-fact-schema-v0` 与 `21-deterministic-collectors` 均已落位。**阻塞解除**。

**必读清单逐条路径（均已读取）**：

1. `.scratch/architecture-recovery/issues/22-b-criteria-prereg.md`
2. `.scratch/architecture-recovery/handoffs/22-b-criteria-prereg.md`
3. `.scratch/architecture-recovery/spec.md` §R3-D4（第 314-315 行）
4. `.scratch/architecture-recovery/WORKFLOW.md` §4.2（第 229-260 行）
5. `.scratch/architecture-recovery/decision-ledger.md`（A-023 / A-024 / A-025 / A-029，第 235-237、241 行）
6. `docs/adr/0013-three-layer-acceptance-gates.md`

补充读取：票 21 交付（`reports/21-collector-map.md` §4、`reports/21-collectors.json`、`engine/src/collect/collectors.ts`）、`CONTEXT.md` 术语表、`reports/21-collectors-check.mjs`（守卫模板）、`reports/21-collectors-fixture.json`（口径参照）。

---

## §2 调研（per WORKFLOW §4.2.3）

### §2.1 carrier 状态（明示缺口）

`atomcode -p` 调用失败：`[error] CodingPlan 未领取或已失效（HTTP 403）`。**atomcode carrier 本窗口不可用**。按票 #17 先例，改用一手权威文档直读补足，并在本节明示缺口。

### §2.2 baseline 回顾

- D-016~D-018（grill 轮 3 封口）：建设主干 = 端到端价值验证闭环，四阶段串行；首报验收 = A→B→C 三层闸门；B 层 = 2 正对照 + 3 真判据 + 1 负对照。
- ADR-0013：B 层判据构造需防「已知异常自证预言」与「全空信号歧义」，五线汇聚（ICH E10 assay sensitivity / ISO 13528 / OWASP Benchmark / mutation testing / NIST KAT）。
- 6F 现状：`docs/adr/*.md` 13 份；三族确定性采集器已落地（`adr-structure@v1` / `positioning@v1` / `gitlog@v1`，不接 LLM，源码机检零网络零模型 API）。
- 与 current 决策的冲突点名：**无冲突**。本票未改 D-018 的 2+3+1 配比（冲突 C-21-1 仍以跨族驱动解法承载，已由守卫 G6 机检 `positive=2 / true=3 / negative=1`）。

### §2.3 一手文档核验（替代 atomcode 的对标依据）

| 标准 | 条款位 | 核验方式 |
|---|---|---|
| ICH E10 *Choice of Control Group* | §1.5 Assay Sensitivity（PDF 第 13 页 / 印刷页 7）；§1.5.1；§1.5.2；§1.3.4 Active (Positive) Concurrent Control（PDF 第 11 页） | 下载官方 PDF（`database.ich.org`）后逐页抽取文本定位，定义原文已逐字引用进预声明文档 §6 |
| ISO 13528:2022 | §9 Calculation of performance statistics；§9.4 z scores | ISO 官网条目 + iTeh 官方样章 PDF 目录核验 |
| NIST CAVP / KAT | — | `csrc.nist.gov/Projects/Cryptographic-Algorithm-Validation-Program` |
| OWASP Benchmark | — | `owasp.org/www-project-benchmark/` |
| OSF Preregistration | — | `cos.io/initiatives/prereg` |

**未采用**：任何单一综述文献断言「混合 = 标准」（A-029 明令禁止）。五领域独立汇聚形态只作佐证，不作权威锚。

---

## §3 阈值实测（核心交付）

测定环境（写死）：HEAD `b4f97963`，`is-shallow-repository=false`（**排除 W2 #02 浅克隆污染**），64 commits，`observed_at = 2026-09-13T13:46:11+08:00`（取 HEAD committer date，非 `Date.now`，可复现）。口径 = 票 21 三族采集器纯函数，与首报同口径。

| 判据 | 阈值（跑前写死） | 6F 实测 | 预声明预期 |
|---|---|---|---|
| TC-1 事后补写占比 | `delta_days > 90` 记滞后；`lag_ratio > 0.20` 红；可判定数 ≥ 5，否则 INCONCLUSIVE | ADR 13 份，有 Date 头 2（15.38%），可判定 2，delta 均为 −1，滞后 0 | **INCONCLUSIVE** |
| TC-2 五件套完整度 | `mean_ratio < 0.60` 或 任一单件缺失率 `> 0.50` → 红 | `mean_ratio = 0.2462`；缺失率 Status 84.62% / Date 84.62% / Context 69.23% / Decision 69.23% / Consequences 69.23% | **RED** |
| TC-3 定位覆盖率 | `< 0.50` 红；`0.50~0.70` 琥珀；`≥ 0.70` 绿；多意图源取最低 | README 0.6500（13/20）；CONTEXT.md 0.6000（12/20） | **AMBER** |
| NC-1 负对照 | `fact_count > 0` 且 五件套 0 且 supersede 0 | `engine/src/fact/schema.ts`：fact_count 11，present 0，supersede false | PASS |

原始数：`reports/22-threshold-raw.json`；测定脚本：`reports/22-threshold-probe.mjs`（只读，不改工作区）。

**关键判定说明**：TC-1 在 6F 上结构不可执行（11/13 ADR 无 `Date` 头），预声明为 INCONCLUSIVE 而非「0/2 = 0% = 绿」。这正是 A-002 早已预警的「ADR 无时间戳头则 S2 阈值不可执行」在 6F 上的实证；INCONCLUSIVE 只作数据缺口输入 C 层，不得用于支持主前提。

---

## §4 完成定义对照（per handoff + issue）

| # | 完成判据 | 状态 | 证据 |
|---|---|---|---|
| 1 | 3 条真判据阈值由 6F 实测测定（含测定方法与原始数据），跑后禁调 | ✅ | `22-threshold-raw.json` + 预声明文档 §3（方法与数字同段）；守卫 G3/G4 程序化比对 |
| 2 | 正对照与真判据 detector 同族（对照票 21 映射表核对） | ✅ | 守卫 G5a/G5b（TS `DETECTOR_BINDING` ↔ JSON `detector_binding` 逐条比对 type / family / control，drift=[]）、G6（配比 2/3/1） |
| 3 | 负对照选材 + 预期 0 命中声明 + 命中复核路径齐备 | ✅ | 预声明文档 §5（选材 `engine/src/fact/schema.ts` + 备份选材、N-a/b/c 三条件、复核 4 步）；守卫 G7 |
| 4 | 引用可回查（ICH E10 + ISO 13528 逐条列出处） | ✅ | 预声明文档 §6（条款位 + URL + §1.5 原文逐字引用）；守卫 G8 |
| 5 | 闸门：文档须用户审阅后 commit；commit 时机先于首报（HARKing 禁令） | ⏳ **待用户审阅** | 本轮未 commit；§7 版本控制处置 |
| 6 | C 层裁定依据预入库文件落位 | ✅ | `22-c-adjudication-basis.md`（三档 + 五条裁定依据 + 对抗性清单 A1~A8 + 锚定 + 回写）；守卫 G12/G13/G14 |

---

## §5 阻塞

- **唯一阻塞：用户审阅闸门**。文档已成稿、守卫已 PASS，但按 A-025 / spec §R3-D4 / 启动器 delta 第 3 条，审阅通过前禁止 commit。
- 解锁后待办：① `but` 新建独立分支 `22-b-criteria-prereg` 并 commit（msg 引用 A-023/A-024/A-025/A-029）② ledger 四行回写 `done` ③ WORKFLOW §4 追加 lessons。
- 无其他前置阻塞（#20 / #21 均已 done）。

---

## §6 lessons 候选（提交 WORKFLOW §4，审阅通过后落盘）

1. **注入字段缺失导致静默跳过**：探针首版把 `commits[].paths` 留空，`collectGitlog` 因 `touching.length === 0` 对全部路径 `continue`，TC-1 可判定数直接为 0 —— 采集器对不完整注入是「静默跳过」而非报错。修正后加 `PROBE-INVARIANT-FAIL` 不变量断言（解析 commit 数 == `git log` 数）。凡「注入式采集器 + 外部解析喂数」的组合，必须先断言解析完整性再做统计。
2. **跨文件语义比对先写归一化再比对**：守卫首跑两连 FAIL 均为守卫自身 bug —— TS 侧 `families[]`（首项主族、其后交叉族）与 JSON 侧 `primary_family + cross_family` 表达同一语义但字段不同，且 JSON 的 PC-2 同时存在 `families` 与 `cross_family`。印证 #16 教训②（守卫首跑 FAIL 先验守卫自身）；新增子条：比对前先写「族全集 = 主族 ∪ 交叉族，去重」的归一化函数。
3. **可执行性门槛必须与阈值同时预声明**：TC-1 若只写「`lag_ratio > 20%` 判红」，在 6F 上会算出「0/2 = 0%」并被读成通过（假绿）。本票加「可判定数 ≥ 5，否则 INCONCLUSIVE」门槛，把数据缺口显式化。凡「占比型判据」必须同时预声明分母的最小样本量，否则占比天然偏向乐观。
4. **carrier 缺口的一手替代路径**：atomcode 不可用时，下载标准官方 PDF 并用 `pypdf` 逐页抽取定位条款位（ICH E10 §1.5 / §1.3.4、ISO 13528 §9.4 均如此核实），可满足「引用须可回查」；但必须在报告中显式记录 carrier 缺口（#17 先例）。

---

## §7 版本控制处置（per WORKFLOW §4.2.1）

- 本轮**未执行**任何 commit / push / branch 操作（闸门约束）。
- 审阅通过后的执行序列：① `but branch new 22-b-criteria-prereg`；② `but commit -b 22-b-criteria-prereg -m "22(A-023/A-024/A-025/A-029): B 层判据预声明 + C 层裁定依据 — 守卫 22-criteria-check.mjs 19/19 PASS"`；③ 其余文件同分支提交；④ ledger 回写 + WORKFLOW §4 追加 lessons（同一分支）。
- 全程走 `but` CLI，不触他人分支（当前 applied：`21-deterministic-collectors` / `20-fact-schema-v0` / `19-push-ci-activation` / `grill-r3-wrapup`）。

---

## §8 引用文件

| 文件 | 作用 |
|---|---|---|
| `reports/22-criteria-pre-registration.md` | **主交付**：B 层预声明文档 |
| `reports/22-c-adjudication-basis.md` | **主交付**：C 层裁定依据预入库 |
| `reports/22-threshold-probe.mjs` | 只读测定脚本 |
| `reports/22-threshold-raw.json` | 测定原始数 |
| `reports/22-criteria-check.mjs` | 守卫（19/19 PASS） |
| `issues/22-b-criteria-prereg.md` / `handoffs/22-b-criteria-prereg.md` / `prompts/22-b-criteria-prereg.md` | 票面 |
| `spec.md` §R3-D4 / `docs/adr/0013-three-layer-acceptance-gates.md` | 规范与决策 |
| `decision-ledger.md`（A-002 / A-021~A-025 / A-029） | 账本 |
| `reports/21-collector-map.md` §4 / `reports/21-collectors.json` / `engine/src/collect/collectors.ts` | 族映射上源 |
| `reports/21-collectors-check.mjs` / `reports/21-collectors-fixture.json` | 守卫模板与口径参照 |
| `CONTEXT.md` | 术语约束（Evidence Gate / Sufficiency Gate / S1 / S2） |
| ICH E10 / ISO 13528:2022 / NIST CAVP / OWASP Benchmark / OSF Preregistration | 引用锚（§2.3） |
