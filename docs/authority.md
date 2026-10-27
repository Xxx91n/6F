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
| [`engine/test/fixtures/contracts/`](../engine/test/fixtures/contracts/) | 同一目录两类身份并存：被守卫运行期消费的**活契约**（Live Contract，如 `33-gate-registry.json`）与字节冻结、只保证可回查的**冻结件**（Frozen Artifact，如 `23-frozen-fc00d458.bundle`、`38-macro-c-facts.jsonl`）；两者不得互当现行基准 |
| [`engine/CHANGELOG.md`](../engine/CHANGELOG.md) | 产品版本账 |
| [`docs/archive/decisions/`](archive/decisions/) | 历史指纹的解析入口——**非权威、只读** |

### 2.1 生成面的再生命令

这里登记「哪个文件由谁再生、失同步由谁判红」——命令的完整形态看 `engine/package.json` 的 scripts，别在此抄参数。手写生成面＝与生成器失同步；判红列写实的，没有守卫就写没有。

| 生成面 | 再生者 | 失同步由谁判红 |
|---|---|---|
| `engine/dist/**` | `npm run build`（tsc 逐文件输出保留注释，所以**只改 `engine/src` 的注释也会动 dist**；`dist/cli.js` 另经 esbuild 压缩） | engine-ci 的 rebuild-diff 步（`DIST-DRIFT`）。注意 `check-dist.mjs` 只管 `dist/cli.js` 的**体积棘轮**，不查内容 drift |
| `docs/adr/README.md` | `npm run gen`（`gen-adr-index.mjs`，无只读模式，跑即写） | **暂无守卫**——手写会在下次 gen 被静默覆盖，CI 不因它红；tracker #53 待落（tracker #47 的 docs-authority 已落，但不含索引 drift 校验，不建第二套） |
| `engine/plugin.json`、`.claude-plugin/plugin.json`、`.mcp.json` | `npm run gen`（`gen-manifests.mjs` 先比后写） | 生成器自身：检出 drift 即 `GEN-FAIL`，`npm run gen` 当场红 |
| README 双语对的致谢锚段与 `<!-- sync: … -->` 戳 | `node scripts/gen-acknowledgments.mjs`（写双文件并按 EN 内容重算 sync 戳） | `77-check` A3（**手改戳位即红**）＋ `73-check` C 组 |
| `engine/test/fixtures/contracts/48-micro-a-golden-*`（在册**十二件**） | `node engine/test/contracts/48-micro-a-preview.mjs --golden --out engine/test/fixtures/contracts`（cassette 离线回放，确定性可重算；实写十二件） | **部分**：`85-check` E1~E9 只逐值比 pr64／pr51 **两件 JSON 侧车**的 band／切片数值／fact_ids／披露块／overall_verdict；`48-check` B4 只判**十件在场**不比内容，`48-micro-a-golden-assertions.json` 自身由 `--golden` 现算——其余 `.md`、拒绝件、facts、gate-probes、measurements 的正文**暂无逐值守卫**（缺口如实登记，勿当成全量对账）；CI 不回写，golden 更新随 PR 审查 |

文档面的只读自检（零写入）：`cd engine && npm run check:docs` = acknowledgments `--check` + `73-check` + `77-check` + `docs-authority-check`。

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
- 首个实例：`engine/src/audit/micro-a.ts` 的 `LEDGER_PATH` 处（指向 ADR-0027 的溯源锚）；其余约束点逐点落地仍属后续票。

## 5. 变更纪律

- 要改"权威口径"本身：改本文件，并检查门面文书的指针仍指向这里；不要在门面文书里追加解释。
- 本文件与三载体不一致时，以三载体的正文为准，本文件随之修正——本文件只登记落点，不承载决策内容。
- 本口径的机检面（设计记于 [`ADR-0027`](adr/0027-verification-surface-node-floor-and-docs-authority-guard.md)：指针存在性、`docs/adr/NNNN` 可解析、仓内 `D-NNN` 引用 ⊆ 归档索引、`D-NNN` 集合只减不增；tracker #47 复盘增补 `§D-NNN` 死锚拒绝与门面不得自称权威）由 [`engine/test/contracts/docs-authority-check.mjs`](../engine/test/contracts/docs-authority-check.mjs) 执行，CI 单腿见 [`.github/workflows/docs-ci.yml`](../.github/workflows/docs-ci.yml)；守卫运行通过才算机检通过，不以"跑过"代替"绿灯"。
