# GLOSSARY — macro-audit（6F）

> 术语表——整套术语在这里定义，词条只说「是什么」，不说「怎么做」。「决定和术语分别写在哪」只在 [`docs/authority.md`](docs/authority.md) 成文。

## 文档与治理

**决策写在哪**
某一类决定写在哪个文件。
_别名_: Decision Carrier、carrier

**权威声明面**
「决定和术语分别写在哪」只写一次的地方。
_别名_: Authority Surface

**设计指针**
代码里一行注释，指回它依据的决定文件；格式以 [`docs/authority.md`](docs/authority.md) §4 为准。
_别名_: Design Pointer

**历史编号**
只用来查历史、不再承担现行决定的编号（`D-NNN`、`A-NNN`、旧 BACKLOG 票号、旧 ADR 号 `0001`–`0027`）。
_别名_: Historical Fingerprint
_不要用_: 拿历史编号写新决定

**校对用的固定语料**
重新校对用的外部语料，按版本固定住，不跟着产品上游变。
_别名_: Baseline Corpus
_不要用_: 基准语料、把校对用的固定语料当产品上游依赖

**真会被读的登记表**
运行时真的会被读、里面的引用必须能打开的登记表或夹具。
_别名_: Live Contract
_不要用_: 活契约、让这类登记表里攒死引用

**冻住的存档**
按字节固定、只保证能回头查的历史产物。
_别名_: Frozen Artifact
_不要用_: 冻结件、把冻住的存档当现行契约

## 审计与档位

**审计**
拿证据对工程产物做一个说得清、能驳回的判定。
_别名_: Audit、audit

**审计档位**
审计看多细，一共五档。
_别名_: Scale

**跨仓战略档**
多个仓库合起来看往哪走、值不值得。
_别名_: Macro-A

**单仓四象限档**
一个仓库按结构、行为、供应链、战略四个面一起看。
_别名_: Macro-B

**历史演化档**
看一个仓库一路怎么变成今天这样。
_别名_: Macro-C

**改动档（PR 档）**
看一次提交或一个 PR 改了什么。
_别名_: Micro-A、PR 级

**单文件档**
看单个文件的质量。
_别名_: Micro-B

## 证据与裁决

**先拿证据**
要说「完成了」，必须拿得出证据。
_别名_: Evidence Gate
_不要用_: 证据闸

**不够就说看不出**
证据不够就明说「看不出来」，并正式提缺口请求，不许硬凑。
_别名_: Sufficiency Gate、`data doesn't show`
_不要用_: 证据够用闸

**裁决规则**
五档共用的一整套判定规矩：证据门槛、申诉、人工改判、日志。
_别名_: Adjudication Protocol

**回执**
能离线复查的判定凭证，带证据引用和判定结果。
_别名_: Receipt、`RCP-`

**出处坐标**
引文在哪份文件、哪个提交、第几行。
_别名_: Provenance String、引文坐标
_不要用_: 把本机绝对路径写进出处

**事前判据**
跑之前就写好、提交进去、跑完不许改的判据。
_别名_: Kill Criterion
_不要用_: 跑完再改判据

**真判据、正对照、负对照**
真判据是要验的判定；正对照是已知会过的样本，只证明管线活着；负对照是已知不该过的样本。
_别名_: TC / PC / NC、Positive Control
_不要用_: 只跑正对照就说通关

**判定档**
一条判据最后落在哪一档：支持、不支持、证据不够。
_别名_: band
_不要用_: 只说「通过 / 不通过」而不说落在哪档

**结论检查**
每条结论都要过的判定关卡。
_别名_: verdict-gate
_不要用_: 判定关

**缺口请求**
证据不够时，正式提出要补什么。
_别名_: GapRequest

**人工改判**
人对机器的判定做覆盖，并留下记录。
_别名_: override

**事后凑判据**
跑完才改判据，为了让结果好看。
_别名_: HARKing
_不要用_: 改判据凑结果

**失败怎么降级**
采集失败、叙事超时、裁决驳回、渲染出错时走哪条退路，必须写出来，不许悄悄失败。
_别名_: Failure Semantics

**违约两级处置**
整行格式坏就立刻停；单个字段坏就隔离，审计接着跑。
_别名_: two-level disposition、fail-fast

**病态字段隔离**
坏字段单独记下原因，不拖垮整份报告。
_别名_: Quarantine、`quarantine_log`

**原因码**
坏字段为什么坏的标准说法。
_别名_: Reason Code、`reason_code`
_不要用_: 随手写一句自由文本当原因

**采数体检**
报告里专门说明采数哪里有问题。
_别名_: Intake Health、`intake health`
_不要用_: 收仓体检

**新旧数并排**
老数字不删，新数字并排放，并说差多少。
_别名_: Dual Reporting、delta 表
_不要用_: 勘误并列读数、悄悄改掉老数字

**能说清的原因**
说得出原因，才能判「这个数无效」。
_别名_: Assignable Cause

**静观期**
发布前先放一段没人报问题的时间。
_别名_: silent window
_不要用_: 零试点下的「无新问题」当稳定性证据

## 事实与报告

**一张事实表、各处裁决**
事实集中存一份，判定分散在各档做。
_别名_: Hub-of-Facts with Federated Adjudication、hub-of-facts
_不要用_: 每档各存一份事实

**事实表**
存全部审计事实的那张 DuckDB 表；只往后加，不改旧行。
_别名_: fact table、`audit_fact`、`facts.duckdb`
_不要用_: 同一条事实存两处

**一条事实**
一次观测写下的一行；同一件事只存一处。
_别名_: fact、`fact_id`

**只读投影**
从事实表读出来、给报告看、不写回去的视图。
_别名_: read-only projection

**跨档关联键**
同一个提交或 PR 在各档能对上的编号。
_别名_: Cross-Scale Correlation Key、`trace_id`、`baggage_id`

**解释层**
同一批数字归哪一层解释；同一面可以被两层读，归哪层由读它的那层决定。
_别名_: Semantic Domain、`structure/shape`、`S3/budget-attribution`
_不要用_: 读数归属层、把结构观测直接当 S3 裁决

**暂挂两边**
同一个事实暂时挂在两个维度上，等接数据的工单落地再定归哪边；两边都算就是重复计数，不行。
_别名_: pending(event_bound)
_不要用_: 双挂、两边都算

**报告模板**
所有报告共用的固定结构，每档只换自己那部分。
_别名_: Report Template

**战略象限**
四象限里评「值不值得、往哪走」的那面，五档都用。
_别名_: Strategic Quadrant

**战略五问**
定位、ADR 质量、预算、演化方向、所有权边界这五个问题。
_别名_: S1–S5
_不要用_: 把 S1–S5 拆成五条独立词条

**四象限**
单仓审计看的四个面：结构、行为、供应链、战略；行为面看哪些文件改得多又复杂。
_别名_: four quadrants、structure / behavior / supply-chain / strategy

**报告合并规则**
多档结果怎么摆在一起：对时间、去重证据、标冲突、定主裁决。
_别名_: Report Aggregation
_不要用_: 各档各写各的

**可动手的建议**
带判定印、能照着做的建议；没裁决过的标 ⚠ unverified。
_别名_: Actionable Recommendation

**观测集**
一次采集在某个提交上产出的全部事实；只往后加，可以按提交固定。
_别名_: Observation Set、`at:<sha>`

**原始证据层**
上游原文照存的那层，平常查询不走它。
_别名_: Raw Evidence Layer

## 演示与发布

**演示场景**
五档 × 顺利 / 失败 = 十条演示路径。
_别名_: Demonstration Scenario、demo scenario

**顺利路径 / 失败路径**
正常跑通 / 出事时怎么退；两边产物用同一结构，必须能对比。
_别名_: Happy Path / Failure Path
_不要用_: 只演示成功路径

**降级演示**
失败路径的产物，必须带降级标记。
_别名_: Degraded Demonstration、`⚠ unverified`

**预览版**
能用、但还没到正式版；能力边界要标清。
_别名_: Release Preview、`capability N of 5 · preview`

**泛化闸**
要在别人仓库跑通才算过关；试点成功不算。
_别名_: Generalization Gate

**演示用假仓**
临时造出来的仓库，必须标「合成」，不许冒充真实审计。
_别名_: Demo Fixture、`synthetic`

**Agent 插件**
装进 agent 里的插件包；内核命令同一份二进制带四个外壳。
_别名_: Agent Plugin、`6f`、`macro-audit`

**默认模式**
装完就能在 agent 里对仓库跑一遍 Macro-B 四象限。
_别名_: Default Mode

**接仓库**
把要审的仓库接进来；默认本地路径，远程地址要明确同意，浅克隆拒绝。
_别名_: Repo Intake、`repo add`
_不要用_: 收仓

**价值验证跑通**
在真仓库跑通「采集 → 事实 → 叙事 → 裁决 → 报告」一遍。
_别名_: Value Validation Loop

**验收闸**
首报要过的三道关：形式、内容、信任。
_别名_: Acceptance Gate

**只留一个写入口**
只让一个写者进来，抢不到就立刻报错。
_别名_: SWMR Facade
_不要用_: 单写门面

**托管平台接口中间层**
从 GitHub 这类平台取数据的中间层。
_别名_: Hosted API Adapter

**上游写法差异**
上游工具版本不同造成的等义写法差异，在适配层吸收并单独说明。
_别名_: Instrument Dialect

**文件标准路径**
仓根相对、斜杠分隔、统一按 NFC 编码、没有空段的路径。
_别名_: Subject Canonical Form

**文件改名记录**
文件改名后还能追到前身。
_别名_: File Lineage

**预览说明块**
报告里说清这是预览、校对了什么、还有什么限制、哪些还没做。
_别名_: preview disclosure block、`preview_disclosure`

**能力状态表**
五档各自到哪一步的那张表。
_别名_: capability matrix
_不要用_: 只说「预览」不说哪一档

**只给建议，不进裁决**
这种输出看看就好，不能当判定。
_别名_: advisory-only、`advisory`

**校对**
拿已知答案的语料调准判据。
_别名_: calibration

**试点仓**
先拿来试的那几个仓库。
_别名_: pilot set、pilot

**同主**
自己名下的仓库；在同主仓上跑要说明偏差。
_别名_: same-owner

## 架构与边界

**隔离墙**
上游的写法不许越过适配层。
_别名_: anti-corruption layer
_不要用_: 防腐层

**双轨接入**
库走依赖、命令行走中间层。
_别名_: dual-track adapter

**分析项组**
上游工具能报的每一项数据，按组列出来，一组就是一批分析项。
_别名_: facets
_不要用_: 面集

**接数据工单**
把某一路上游数据接进内核、定好它归哪个维度的那个工单。
_别名_: wiring ticket
_不要用_: 接线票

**出处清单**
许可证、变更记录、签名、构建来源这一套。
_别名_: provenance manifest

**缺口登记册**
已知没覆盖到的地方，逐条登记：谁负责、什么时候复核。
_别名_: known-gaps、`gap_id`

**6F**
公开品牌名；六句 F 宣言：Facts / Federation / Forensics / Five scales / Frankness / Fingerprints。
_别名_: 6f

**插件名和市场名两层**
插件叫 `6f`，市场叫 `xxx91n`，内核叫 `macro-audit`。
_别名_: plugin name / marketplace name / kernel name

**内核与 Agent 的分工**
确定的活给内核，编排和看运气的活给 Agent；判定档永远不归 Agent。
_别名_: kernel、agent

**正本→译本**
英文 README 是正本，中文 README 是译本；可以落后，不能假装同步。
_别名_: canonical / derived

**公开三步**
先被动挂牌，再定向邀请，最后公开推广；最后一步要过四道判据和 30 天静观期。
_别名_: Stage-0 / Stage-1 / Stage-2
