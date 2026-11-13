# 决定和术语写在哪

决定和术语分别记在哪，只看这一份。[`AGENTS.md`](../AGENTS.md)、[`README.md`](../README.md)、[`README.zh-CN.md`](../README.zh-CN.md)、
[`CONTRIBUTING.md`](../CONTRIBUTING.md)、[`engine/README.md`](../engine/README.md)、
[`docs/agents/domain.md`](agents/domain.md) 这些门面文书只放链接，不重复写。
架构决定都写在 [`docs/adr/`](adr/) 里；有哪几份、各是什么状态，看那份按文件列表生成的索引 [`docs/adr/README.md`](adr/README.md)，这里不再抄一份。机器读的名字哪些能改、哪些不能改，看 [`ADR-0029`](adr/0029-relax-machine-read-name-rule.md)。

## 1. 三类文件

| 文件 | 管什么 | 编号 | 什么时候写这里 |
|---|---|---|---|
| [`docs/spec.md`](spec.md) | 产品决定：范围、能力、对用户的承诺 | `R<n>` 节 / `R<n>-<m>` 条（编号只在 spec 里有效） | 改的是「产品做什么、对用户承诺什么」 |
| [`docs/adr/`](adr/) | 架构决定：背景 / 备选 / 后果 | `ADR-NNNN` | 有备选被否掉，或者要留下「为什么不」 |
| [`GLOSSARY.md`](../GLOSSARY.md) | 术语：每个领域词是什么意思 | 词条名（可附 `_Avoid_` 不要用的词） | 出现一个新词，或把一个代码里已经在用的词收进来 |

规则：

- **一个决定只写一处。** 别处只放链接，不抄正文。
- **术语只说「是什么」。** 「怎么做」看代码和注释，「为什么」看 ADR 或 spec。
- **三类文件各管各的。** 产品争议看 `docs/spec.md`，架构取舍看 `docs/adr/`，用词争议看 `GLOSSARY.md`。

## 2. 专门规则（各自管一块，不和上面三类抢）

下面这些文件在各自题目里说了算，但它们都不回答「决定和术语分别写在哪」，所以不算第二套权威：

| 位置 | 管什么 |
|---|---|
| [`docs/versioning.md`](versioning.md) | 0.x 版本规则、上游锁定和复审节奏 |
| [`engine/upstream-lock.yaml`](../engine/upstream-lock.yaml) | 产品上游版本的机器读权威（README 上游表的状态列和它一致） |
| [`engine/baseline-lock.yaml`](../engine/baseline-lock.yaml) | 基准语料固定版本的登记处 |
| [`docs/known-gaps.md`](known-gaps.md) | 缺口是什么意思的登记册 |
| [`docs/upstream-dimension-map.md`](upstream-dimension-map.md) | 上游到维度的映射表（每行记 `last_reviewed` / `next_review`；节奏和字段规则看 `docs/versioning.md`） |
| [`docs/ra/`](ra/) | 已接受风险的档案（谁批的写名字，批的人是用户） |
| [`engine/test/fixtures/contracts/`](../engine/test/fixtures/contracts/) | 同一目录里有两类文件：测试实际会读的**活契约**（Live Contract，比如 `33-gate-registry.json`），和按字节冻结、只保证能回头查的**冻结件**（Frozen Artifact，比如 `23-frozen-fc00d458.bundle`、`38-macro-c-facts.jsonl`）；两类不能互当现行基准。前一类（真会被读的登记表）的键名哪些能改、改了谁跟着动，看 [`ADR-0029`](adr/0029-relax-machine-read-name-rule.md) |
| [`engine/CHANGELOG.md`](../engine/CHANGELOG.md) | 产品版本记录 |
| [`docs/archive/decisions/`](archive/decisions/) | 历史编号的查询入口——**非权威、只读** |

### 2.1 自动生成的文件和重生命令

这里只记哪个文件由谁重新生成、对不上时谁报错。命令怎么写看 `engine/package.json` 的 scripts，这里不抄参数。手写生成的文件会和生成器对不上；报错那一列照实写，没有检查就写没有。

| 生成的文件 | 谁重新生成 | 对不上时谁报错 |
|---|---|---|
| `engine/dist/**` | `npm run build`（tsc 逐文件输出保留注释，所以**只改 `engine/src` 的注释也会动 dist**；`dist/cli.js` 另经 esbuild 压缩） | engine-ci 的 rebuild-diff 步（`DIST-DRIFT`）。`check-dist.mjs` 只管 `dist/cli.js` 的**体积只紧不松的限制**，不查内容有没有变 |
| `docs/adr/README.md` | `npm run gen`（`gen-adr-index.mjs`，没有只读模式，跑就写） | docs-ci 的 `adr-index drift guard (docs/adr/README.md regenerated == committed)` 步（tracker #97）：`npm --prefix engine run gen` 后先查 `git ls-files --error-unmatch` 确认是 tracked、再 `git diff --exit-code` 逐字节核对——手改索引或新增 ADR 忘了 regen 就报错；复用同一条 gen 链，不建第二套 |
| `engine/plugin.json`、`.claude-plugin/plugin.json`、`.mcp.json` | `npm run gen`（`gen-manifests.mjs` 先比后写） | 生成器自己：发现对不上就 `GEN-FAIL`，`npm run gen` 当场报错 |
| README 双语对的致谢段 | `node scripts/gen-acknowledgments.mjs`（写双文件；zh 头如果有 `<!-- sync: … -->` 戳就刷新，没有就不加） | `gen-acknowledgments.mjs --check`（对不上就报错） |
| `engine/test/fixtures/contracts/48-micro-a-golden-*`（在册**十二件**） | `node engine/test/contracts/48-micro-a-preview.mjs --golden --out engine/test/fixtures/contracts`（cassette 离线回放，结果固定，能重算；实写十二件。**必须全量检出**：浅克隆时锚会落 `degraded:shallow-clone`，写进存档会被 B9 报错；**重生成必须用 `SOURCE_DATE_EPOCH=0`**——检查脚本的子进程已经固定写 0，外部设了别的值只影响人手重生成） | `48-check.mjs` 的 B 组：凡是匹配 `48-micro-a-golden-*` 的在册件，一律和 `--golden` 现跑产物**逐字节核对**——清单、入库、现跑三个集合不等，或任一字节不同，就报错并点名该件；另带篡改、判据锚全值、锚宽三类对照，防止检查脚本变成永远为真。件内 `prereg_commit` 在 golden 模式下只收判据锚的**固定前 8 位**（先固定 `core.abbrev` 下限，挡住小检出 emit 7 位，再把因歧义加宽的 hex 截首 8 位——`%h` 的宽度随检出对象集变，不能直接入库），实际运行仍用 `%h` 原值。`85-check` E1~E10 是**跨实现逐值核对**（引擎侧 vs 生成器存档），范围只有 pr64／pr51 两件 JSON 侧车：六判据 band、那部分数值字段、fact_ids、overall_verdict、structural_limitations 两件都比，capability_label 与 not_in_preview 只比 pr64；E10 另查一句名册口径：`calibration_scope` 必须点名 `MICRO_A_PILOTS` 里的每一个仓（引擎侧和 48 存档两侧共四份侧车都查，任一份点不全就点名缺哪个仓；名册加仓不改披露当场红——spec §R8-2「漏步拦截」）；它和上面的逐字节核对不能互相替代（十二件全量报错的是本行的 `48-check` B 组）。CI 不回写，golden 更新随 PR 审查（同 `golden-ci.yml` 的快照规则 D-030③） |

文档只读检查：`cd engine && npm run check:docs`。

## 3. 历史编号怎么用

仓里现在有四类旧编号：`D-NNN`（产品决定记录）、`A-NNN`（架构恢复记录）、旧 BACKLOG 票号 `#32`–`#94`、旧 ADR 号 `ADR-0001`–`ADR-0027`。它们只用来查历史，不再新增。

- `D-NNN`、`A-NNN` 和旧 BACKLOG 票号能从 [`docs/archive/decisions/`](archive/decisions/)（记录原文 + 索引）逐号查到；旧 ADR 号按下一段说的 git 查法查。能查到，不等于能拿来判。
- **新决定不再用 `D-NNN` / `A-NNN`**：产品决定写进 `docs/spec.md` 的 `R<n>-<m>` 条，架构决定写 `ADR-NNNN`。旧编号只作历史引用，不加新号。
  `ADR-0025` 原文写的是「改用 ADR 号或 spec A-code」——spec 现在用 `R<n>-<m>`，`A-NNN` 已经不再新增，所以这里按实际写法定。
- 现行文本（代码注释、workflow 注释、门面文书）里不再保留旧 ADR 号，看到旧 ADR 号只能当历史看，不能当成现在还在用的地方；`D-NNN` / `A-NNN` / 旧票号的存量注释照旧保留，不改写（见下面「号码会撞」一条）。旧 ADR 号允许出现的地方 = 下面这个块列出的历史件路径和说明处，具体哪几处以块里的清单为准；`docs/archive/` 按 §2 的历史查询面原样保留，检查脚本整目录不扫。按字节冻结的记录和冻住的存档可以保留原始现场（包括本机绝对路径），前提是归档处写明这是历史产物。
- 两个固定名字不算旧号引用，原样保留：`ADR-NNNN-C/vN` 是裁决协议和报告叙事盖章用的协议版本串，schema 字段里的 `inherits:` 值是「这一列从哪份旧决定继承」的历史标签。这两个形状只在 `engine/src`、`engine/scripts`、`engine/test` 里放行；写到别的文档里照旧按普通旧号判。
- `CONTEXT.md` 已经退役（`6626d08d` 删除），术语看 [`GLOSSARY.md`](../GLOSSARY.md)；历史文书（包括 ADR 正文和记录行）里提到 `CONTEXT.md` 的地方按历史编号读，不当现行位置。
- **号码会撞**：GitHub issue/PR 和旧 BACKLOG 票号共用同一串号——旧 BACKLOG 覆盖 `#32`–`#94`，GitHub 号只增不减，两段重叠。新写的按 [`docs/spec.md`](spec.md) R8 的规则把 GitHub 引用写成 `tracker #N`；历史文本里的裸 `#NN`（代码注释、`NN-check` 脚本名、记录行）按 [`ticket-index.md` §撞号警示](archive/decisions/ticket-index.md#撞号警示) 分清，不要改写。
- **「新写」按节判（版本记录）**：[`engine/CHANGELOG.md`](../engine/CHANGELOG.md) 的 `[Unreleased]` 节永远算现行文本，节里的 GitHub 引用随时按上一条归一成 `tracker #N`；release cut 时整节转进版本节、随节冻结成历史文本，已发布节一律不改写。其余文件不设机检边界：改到哪行哪行按上一条归一，不回头清偿。`旧票 #N` 是旧 BACKLOG 号、不是 GitHub 引用，加 `tracker` 前缀反而造错——机检把它和反引号里的字面量一起显式豁免。机检落在 [`docs-authority-check.mjs`](../engine/test/contracts/docs-authority-check.mjs)（只钉 `[Unreleased]` 节）。
- **旧 ADR 号是第四类历史编号**：`ADR-0001`–`ADR-0027` 只减不增；24 份正文已经删掉，正文只在 git 历史里，不再当现行位置；现行纪元的起点固定是 `ADR-0028`，块里 `entry` 写的就是它，不一致就红。查法是先 `git log --diff-filter=D --name-only -- docs/adr` 找到删除提交，再 `git show <删除提交>^:docs/adr/<文件名>` 取回原文；完整的来龙去脉见 [`ADR-0028`](adr/0028-current-architecture-and-docs-authority.md)。
- `ADR-0028` 替代 `ADR-0025` 里「从 `6626d08d^` 恢复 21 份现行 ADR」那条决定；三类文件的分工和归档政策继续沿用，不另起一套。完整内容写在 [`ADR-0028`](adr/0028-current-architecture-and-docs-authority.md)。
- 检查脚本只从下面这个块读历史号、起点号、历史件路径和说明处，另抄一份清单就判红。起点号取自块里的 `entry`，票面要求它是 `0028`；脚本另外只留一个「期望值 0028」用来核对，读的和期望的不一致就红——它不是第二个权威，是防止这边悄悄漂走。哨兵号（合成夹具和报告解析器里写出来的占位号，一种占空位、一种当越界探针，只出现在 engine 的代码和测试里）和 `engine/fixtures/definitions/` 下的手写合成夹具是测试样本，不是历史编号，放行规则只在脚本注释里；固定机器名的放行规则见本节「两个固定名字不算旧号引用」那一条。

```yaml
historical_adr:
  entry: "0028"
  numbers: ["0001", "0002", "0003", "0004", "0005", "0006", "0007", "0008", "0009", "0010", "0011", "0012", "0013", "0014", "0015", "0016", "0017", "0018", "0019", "0020", "0021", "0022", "0023", "0024", "0025", "0026", "0027"]
  paths:
    - examples/first-report/
    - engine/CHANGELOG.md
    - engine/test/contracts/23-first-report.mjs
  explained_in:
    - docs/authority.md
    - docs/adr/0028-current-architecture-and-docs-authority.md
```

## 4. `Design:` 指针怎么写

代码和配置里要写约束时，用一行指针，格式以本节为准：

```
Design: <一句话约束> — ADR-NNNN
```

- 只写「为什么这里必须这样」，并给出 ADR 号；**不抄 ADR 正文**，不写多行块注释。
- 指针指向的必须是 `docs/adr/` 下能打开的现行 ADR（哪几份是现行，看 [`docs/adr/README.md`](adr/README.md) 的状态列）。旧号一律不再当指针目标。
- 产品级约束指向 `docs/spec.md` 的节时写成 `Design: <一句话约束> — spec §R<n>`；术语约束指向 `GLOSSARY.md` 词条。
- 一份 ADR 可以被多处指针引用；指针本身不是决定记录，删指针不删决定。
- 现在仓里没有指向旧 ADR 号的 `Design:` 指针；产品级指针还可以指 spec 的节（例如 `spec §R9-1`）。新增的按本节写，目标只能是现行 ADR 或 spec 节。约束正文可以在 `ADR-0028` 的对应小节找；例如事实表单写者约束写在 `ADR-0028` §3，执行面在 `engine/src/fact/store.ts`。机器读的名字哪些能改，写在 [`ADR-0029`](adr/0029-relax-machine-read-name-rule.md)。
- 旧的 `Design:` 指针已随代码注释票清零；若再看到指旧号的指针，按死引用处理，不能当成第二套现行规则。

## 5. 改这份文件时

- 要改这份文件本身：改完检查门面文书的链接还指向这里；别在门面文书里加解释。
- 这份文件和三类正文对不上时，以正文为准，这份文件跟着改——这里只记位置，不放决定内容。
- 机器检查怎么设计写在 [`ADR-0028`](adr/0028-current-architecture-and-docs-authority.md)（tracker #47 复盘的内容也收在该 ADR）；执行面在 [`engine/test/contracts/docs-authority-check.mjs`](../engine/test/contracts/docs-authority-check.mjs)，CI 单腿在 [`.github/workflows/docs-ci.yml`](../.github/workflows/docs-ci.yml)；检查脚本跑通才算通过，不看「跑过」。
