# 22 — C 层裁定依据预入库文件（Pre-Adjudication Basis）

> 覆盖 A-025（HARKing 禁令）/ A-027（agent 可消费性）｜spec: `spec.md` §R3-D4｜决策: `docs/adr/0013-three-layer-acceptance-gates.md`
> 地位：**在看首报之前写死入库**。裁定依据先于被裁定的对象存在，是本仓防 HARKing 的核心机制。
> 配套：B 层判据见 `reports/22-criteria-pre-registration.md`。

---

## §1 裁定三档

| 档位 | 名称 | 定义 | 触发 |
|---|---|---|---|
| `supported` | 支持 | 结论被证据支持，且引文→结论支持关系成立 | B 层无 RED、无 INCONCLUSIVE、PC 全 PASS、NC-1 通过 |
| `unsupported` | 不成立 | 证据撑不住结论（引文存在但不支撑，或主前提被证伪） | 存在真判据 RED；或引文→结论支持关系校验失败 |
| `insufficient` | 不可裁定 | 证据不足，按 Sufficiency Gate 发 GapRequest，不给 verified verdict | PC 未中（P0）；或 TC 判为 INCONCLUSIVE；或 NC-1 走复核未决 |

术语对齐：`insufficient` 对应 A-004 的 `insufficient_signal` 与 CONTEXT.md 的 Sufficiency Gate（`data doesn't show` + GapRequest）；`unsupported` 对应 CONTEXT.md 的 Evidence Gate（`⚠ contains uncited claims`）。

---

## §2 裁定依据（五条，看报告前写死）

| 编号 | 依据 | 判定规则 |
|---|---|---|
| B1 | 管线健康前置 | PC-1 与 PC-2 **全部 PASS** 是 `supported` 的必要条件。任一未中 → 裁定强制为 `insufficient` 并标注 P0，不得以「真判据看起来不错」为由升档 |
| B2 | 真判据矩阵 | 任一真判据 RED → 该判据对应维度的结论不得为 `supported`；TC-1 为 INCONCLUSIVE → 事后补写维度只能为 `insufficient`；全 GREEN/AMBER 且无 RED → 可为 `supported` |
| B3 | 引文→结论支持关系校验（D-017 强化项） | 每条结论必须挂可回查引文；引文存在但撑不住结论的，该结论标 `unsupported`，不得因「有引文」而放行 |
| B4 | 负对照通过 | NC-1 三条（N-a/N-b/N-c）全成立方可裁定；命中即转 §5.3 复核路径，复核未决前裁定为 `insufficient` |
| B5 | agent 可消费性（A-027） | 裁决块必须是结构化的、引文锚必须可解析；人裁定与 agent 消费是两个视角，不得合并成单一判据；**裁定仍由人做** |

---

## §3 对抗性清单（看报告前写死，裁定人须逐条回答）

| 编号 | 质疑项 | 回答要求 |
|---|---|---|
| A1 | 这些数字是事实，还是采集器口径的产物？ | 必须区分「口径事实」与「事实本身」，并在首报明示（如 `adr-structure@v1` 只识别英文标记） |
| A2 | 正对照是否真与真判据同族？ | 逐条对照 `detector_binding`，不得只凭命名相似 |
| A3 | 阈值是否在看到结果后被改过？ | 比对首报引用阈值与本文件 commit 哈希；任何改动必须是 v2 追加且 v1 留档 |
| A4 | 负对照选材是否仍「已知干净」？ | 给出该选材在本次运行中的变更证据 |
| A5 | 结论是否都有引文，且引文真能撑住结论？ | 逐条做支持关系校验，不只看引文数量 |
| A6 | 有没有把「没查到」写成「查到了但不采信」，或反之？ | 印记词表分族不得混用（#18 教训：`data doesn't show` + `gap request` = 采集缺口；`verdict rejected` + `unverified` = 裁决驳回） |
| A7 | 6F 自身的特殊性是否使结论不可外推？ | 必须声明外推边界（6F = 单仓 Macro-B 自身，样本 n=13 ADR / 64 commits） |
| A8 | 若结论反转，哪些证据会最先变化？ | 必须给出可证伪路径，否则裁定不成立 |

---

## §4 锚定 B 产物

裁定必须逐条锚定 B 层产物，禁止无锚裁定：

1. 每条裁定条目必须引用至少一个判据 ID（`PC-1` / `PC-2` / `TC-1` / `TC-2` / `TC-3` / `NC-1`）；
2. 涉及数值的裁定必须引用 `audit_fact` 的 `fact_id` 或 `22-threshold-raw.json` 中的具体字段路径；
3. 无锚裁定条目视为未裁定，回退 `insufficient` 并发 GapRequest。

---

## §5 回写要求

1. 裁定**原文**（不摘要）+ 时间戳 + 裁定时的 commit 哈希，回写 `decision-ledger.md`；
2. 同内容落到首报裁决章（ADR-0006 四章之「四象限 / 裁决」章）；
3. 回写动作属于 A-025 的完成定义，缺失即本票未完成；
4. 裁定与预声明依据不一致时，必须在回写中逐条说明偏离理由，禁止静默覆盖。

---

## §6 引用文件

| 文件 | 作用 |
|---|---|
| `docs/adr/0013-three-layer-acceptance-gates.md` | C 层四条款来源 |
| `docs/adr/0006-shared-skeleton-scale-slice.md` | 报告四章结构（裁决章位置） |
| `.scratch/architecture-recovery/spec.md` §R3-D4 / §R3-D5 | 规范与首报验收 |
| `.scratch/architecture-recovery/decision-ledger.md`（A-004 / A-025 / A-027） | 信号不足门 / HARKing / agent 可消费性 |
| `CONTEXT.md`（Evidence Gate / Sufficiency Gate / Adjudication Protocol） | 术语约束 |
| `reports/22-criteria-pre-registration.md` | B 层判据（本文件的锚定对象） |
