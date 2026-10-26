# 权威载体与历史指纹（唯一成文处）

本文件回答一个问题：**一条决策或一个术语该落在哪**。这是仓内关于该问题的唯一成文处——
[`AGENTS.md`](../AGENTS.md)、[`README.md`](../README.md)、[`README.zh-CN.md`](../README.zh-CN.md)、
[`CONTRIBUTING.md`](../CONTRIBUTING.md)、[`engine/README.md`](../engine/README.md)、
[`docs/agents/domain.md`](agents/domain.md) 等门面文书只留指回本文件的指针，不各自重述口径。
决策本身记于 [`ADR-0025`](adr/0025-authority-carriers-and-historical-fingerprints.md)。

## 1. 三载体

| 载体 | 承载什么 | 现行编号 | 何时进这一层 |
|---|---|---|---|
| [`docs/spec.md`](spec.md) | 产品决策：范围、能力、用户可见契约 | `R<n>` 节 / `R<n>-<m>` 条目（编号只在 spec 内有效） | 改的是"产品做什么、对用户承诺什么" |
| [`docs/adr/`](adr/) | 架构决策：Context / 替代方案 / 后果 | `ADR-NNNN` | 有替代方案被否决，或需要留下"为什么不" |
| [`GLOSSARY.md`](../GLOSSARY.md) | 术语：领域唯一语言 | 词条名（可附 `_Avoid_` 禁用语） | 引入一个新词，或收编一个已被代码使用的词 |

纪律：

- **一条决策只有一个落点。** 其他位置只允许指针，不允许复制正文。
- **术语定义不写实现细节。** 定义说"是什么"；"怎么做"归代码与其注释，"为什么"归 ADR/spec。
- **载体之间不互相裁决。** 产品语义争议回 `docs/spec.md`，架构取舍争议回 `docs/adr/`，用词争议回 `GLOSSARY.md`。

## 2. 专门口径（从属，不与三载体竞争）

下列文件在各自专题内是唯一口径，但都不回答"决策与术语分别在哪"，因而不构成第二套权威面：

| 位置 | 专题口径 |
|---|---|
| [`docs/versioning.md`](versioning.md) | 0.x 版本语义、上游锁定与复审节奏的成文口径 |
| [`engine/upstream-lock.yaml`](../engine/upstream-lock.yaml) | 产品上游版本钉的机读权威（README 上游表状态列与之同源） |
| [`engine/baseline-lock.yaml`](../engine/baseline-lock.yaml) | 基准语料（Baseline Corpus）钉的登记处 |
| [`docs/known-gaps.md`](known-gaps.md) | 缺口（gap）语义的权威登记册 |
| [`docs/upstream-dimension-map.md`](upstream-dimension-map.md) | upstream→dimension 映射表本体（逐行 `last_reviewed` / `next_review` 的登记位；节奏与字段口径归 `docs/versioning.md`） |
| [`docs/ra/`](ra/) | Accepted-Risk 呈批档案（已批准风险的现场，具名裁者=用户） |
| [`engine/test/fixtures/contracts/`](../engine/test/fixtures/contracts/) | 现行判据与契约冻结件的所在目录 |
| [`engine/CHANGELOG.md`](../engine/CHANGELOG.md) | 产品版本账 |
| [`docs/archive/decisions/`](archive/decisions/) | 历史指纹的解析入口——**非权威、只读** |

## 3. 历史指纹政策

仓内大量存在、但**不再新增**的三类编号：`D-NNN`（产品决策账）、`A-NNN`（架构恢复账本）与旧 BACKLOG 票号 `#32`–`#94`。

- 它们只用于历史溯源，可由 [`docs/archive/decisions/`](archive/decisions/)（账本原文 + 索引）逐号解析；解析入口≠裁决依据。
- **新决策不再使用 `D-NNN` / `A-NNN`**：产品决策落 `docs/spec.md` 的 `R<n>-<m>` 条目，架构决策落 `ADR-NNNN`。既有账本号只作历史引用，不追加新号。
  [`ADR-0025`](adr/0025-authority-carriers-and-historical-fingerprints.md) 原文写的是"改用 ADR 号或 spec A-code"——spec 的现行编号形态是 `R<n>-<m>`，`A-NNN` 账本已封账不再增号，故本文件按实际形态落定；该措辞待 ADR-0025 勘误补记。
- 代码注释、workflow 注释与历史文档里的历史指纹**保留原样**，不做现代化清洗；逐字节冻结的账本与冻结件（Frozen Artifact）允许保留原始现场（含本机绝对路径），前提是归档处已声明其为历史产物。
- `CONTEXT.md` 已退役（`6626d08d` 删除），术语归 [`GLOSSARY.md`](../GLOSSARY.md)；历史文书（含 ADR 正文与账本行）里对 `CONTEXT.md` 的提法按历史指纹读，不作为现行落点。
- **撞号警示**：GitHub issue/PR 与旧 BACKLOG 票号共用同一串号——旧 BACKLOG 覆盖 `#32`–`#94`，GitHub 号只增不减，两段区间重叠。新写的一律按 [`docs/spec.md`](spec.md) R8 的口径把 GitHub 引用写成 `tracker #N`；历史文本里的裸 `#NN`（代码注释、`NN-check` 脚本名、账本行）按 [`ticket-index.md` §撞号警示](archive/decisions/ticket-index.md#撞号警示) 消歧，不改写。

## 4. `Design:` 指针格式

约束点上的代码/配置注释使用单行指针，格式以本节为准：

```
Design: <一句话约束> — ADR-NNNN
```

- 只写"为什么这里必须这样"并给出 ADR 指针；**不复制 ADR 正文**，不写多行块注释。
- 指针目标必须是 `docs/adr/` 下可解析的现行 ADR（不含 0002/0010/0015 这三份保持删除的编号）。
- 产品级约束指向 `docs/spec.md` 的节时写成 `Design: <一句话约束> — spec §R<n>`；术语约束指向 `GLOSSARY.md` 词条。
- 一份 ADR 可被多处指针引用；指针本身不构成决策记录，删除指针不删除决策。
- 本格式在 `engine/src` 里尚无实例（逐点落地是后续票）；本节只立法格式，不代表仓内已有指针。

## 5. 变更纪律

- 要改"权威口径"本身：改本文件，并检查门面文书的指针仍指向这里；不要在门面文书里追加解释。
- 本文件与三载体不一致时，以三载体的正文为准，本文件随之修正——本文件只登记落点，不承载决策内容。
- 本口径的机检面（指针存在性、`docs/adr/NNNN` 可解析、仓内 `D-NNN` 引用 ⊆ 归档索引、`D-NNN` 集合只减不增）设计记于 [`ADR-0027`](adr/0027-verification-surface-node-floor-and-docs-authority-guard.md)；守卫与 docs-ci 单腿尚未落地，在档待执行，不得当作已通过机检。
