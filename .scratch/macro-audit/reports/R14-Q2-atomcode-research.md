# R14-Q2 atomcode 深度调研报告 — `audit` 一等命令票面形态

> 调研题面：D:\Aworker\6F\.scratch\macro-audit\reports\R14-Q2-research-prompt.md
> 时点 2026-09-17；通道 ctx_batch_execute（label=atomcode-r14q2，FTS 已索引）；atomcode 会话锚 841bdf5c…（同线）。
> Sufficiency Gate：searches 9｜angles 4 类｜full reads 4（gcovr/reproducible-builds/MCP tools 规范/zipsec）＋3 篇入知识库。
> 冲突协议结果：**零 revised——(a) 推荐成立，命令面要素清单＋两处同票纪律补强**。

## §1 执行摘要

**推荐 (a)**：`audit <path>` 单尺度一等命令，Macro-B 本地 one-shot 管线装配，`--scale` 预留＋未实现尺度诚实拒绝（exit 2＋结构化错误，与仓内 `MCP-FACTS-ARGS`/`INTAKE-ERROR` 模式同款）。置信高——三线同向：walking-skeleton→flesh-out 惯例、semgrep/trufflehog 命令面先例、D-059② 已立 flesh-out 立案。(b) 违 D-054「roadmap≠shipped」；(c) 无装配抽象复现孤岛模式（D-059⑧ 明拒）；(d) 错过 flesh-out 时点且与 #48 零依赖。

## §2 分点结论

**结论 1（双源）**：flesh-out 时点已到——Cockburn walking skeleton 原典（Crystal Clear 2004/GOOS 2009）：骨架须走真实生产路径非 throwaway；39/40-one-shot 三仓实证已走通真实管线，装配面停在 .scratch=骨架阶段临时装配件典型形态。**walking skeleton≠MVP**（distilledpatterns 逐字区分）：flesh-out=已规划能力按层序逐个点亮，与 ADR-0017 分级发布同构，不触 ADR-0002 禁令（禁令作用在 spec 层完整性）。

**结论 2（三源）**：子命令面=单命令先行、树随需而生——clig.dev「复杂度到位才立子命令」「Don't have a catch-all subcommand」；Thoughtworks CLI 指南 `[noun] [verb]` 结构；gh/docker/kubectl 皆先有顶层动词；semgrep `scan`/`ci` 分立因**运行场景不同**非尺度预铺。audit 作第五个顶层动词入列；`--scale` 参数化而非 `audit macro-b` 子命令化，第二尺度真落地时再评估升格。

**结论 3（双源＋仓内先例）**：诚实拒绝成熟形态=结构化错误＋非零退出＋usage 引导——bettercli/clig.dev 惯例；本仓已有更优先例：cli.ts 全线 exit 2＋stderr `{error:CODE,message}` JSON。audit 拒绝样例：`{"error":"SCALE-NOT-IMPLEMENTED","message":"scale 'Micro-A' is queued (release order…); implemented:['Macro-B']"}` exit 2——拒绝文案层序引 ADR-0017③，措辞与 D-054 能力矩阵同源。

**结论 4（三源）**：入参=位置参数本地路径为主、输入裁决复用 ADR-0009 三段序——semgrep TARGETS 位置参数缺省 cwd；trufflehog filesystem <path>／远程 git 走独立子命令且 clone 到临时目录防恶意 git config（CVE-2025-41390，与本仓 intake 隔离纪律同款心智）。audit 的 path 形态接受与 repo add 完全相同的输入面（本地路径→owner/repo 消歧→URL opt-in clone），零新增输入面。

## §3 对比矩阵

| 项 | 惯例符合度 | 诚实披露 | 与本仓决策 | 判定 |
|---|---|---|---|---|
| (a) | 高（semgrep scan 同款） | 未实现尺度显式拒绝 | 零冲突；D-059② 具体化 | **推荐** |
| (b) | 低（预铺空枝=clig.dev 反模式） | roadmap 冒充 shipped | 与 ADR-0017 正面冲突 | 拒 |
| (c) | 低（脚本永久化=temp architecture permanent） | hardcode 不披露 | 复现 D-059⑧ 孤岛模式 | 拒 |
| (d) | 中（无惯例支持 indefinitely 缓） | 能力宣称差距持续 | 与 #48 零依赖；#50 MCP 反而需要可跑管线 | 拒 |

## §4 命令面要素清单（采 (a) 时）

1. 签名：`macro-audit audit <path|owner/repo|url> [--scale <S>] [--out <dir>] [--json]`；path 输入裁决逐字复用 repoAdd（ADR-0009 三段序）；
2. --scale：默认 Macro-B（clig.dev「Make the default the right thing」）；未实现值→exit 2＋SCALE-NOT-IMPLEMENTED 结构化错误＋implemented 列表＋层序指针（ADR-0017③）；不做静默降级；
3. --out：双通道——省略时报告走 stdout；给出时写 report.md＋facts.duckdb，stdout 打 receipt 摘要 JSON（字段集与 demo receipt 同源，禁另造字段名）；
4. 装配实现：one-shot 装配提炼为 engine 内单一管线函数（intake→collectors＋codelore 面→facts→骨架渲染），cli.ts 的 audit 与 demo 共同消费；39/40 脚本**不删除**转三仓回归对照物（golden parity：audit 对同仓产物字段⊆脚本产物，漂移即报警）——D-037 golden 护航惯例复用；
5. 报告头：capability 标注沿用 `stability:"preview"＋capabilities:["macro-b"]`（D-037② 既有契约面）；
6. --help：audit 出现在顶层 usage 行；
7. **票面捆绑（防名实分离复发）**：audit 命令票须与「README 能力边界行同步提及 audit」成对落盘——重演 D-054「收窄与立票同票绑定」纪律。

## §5 各候选已知失败模式（补充）

- (a)：--scale 预留若被读作「五尺度门面预告」需 README 措辞同步收窄；
- (b)：空门面永久占宣称面；
- (c)：脚本与 kernel 双入口漂移；
- (d)：#50 MCP facts 缺可跑管线对象。

## §6 与本仓 current 决策冲突排查（逐点名）

D-059② ✅（本调研即其具体化）／ADR-0002 ✅（flesh-out≠MVP 切片，D-059 已预答）／ADR-0009 ✅（复用输入裁决）／ADR-0006/0001 ✅（切片在表达层非 spec 层）／ADR-0017 ✅（同构）／D-054 ✅（拒绝文案与矩阵措辞同源）／D-059⑧ ✅（装配提炼=「后接」完成动作非新增孤岛；github-rest 不因 audit 提前铺量）／D-058 ✅（audit=确定性管线归 kernel，叙事仍走宿主 agent MCP 主路，票面显式写此句防越界）。**唯一留意点**：39/40 脚本转「回归对照物」涉 .scratch 生命周期定位——票面写死「对照物仅仓内 CI 消费、不随 tgz 分发」（D-038 口径不触）。

## §7 完整来源清单

distilledpatterns.org（skeleton≠prototype 原文）／clig.dev（子命令时机＋默认值＋catch-all 反模式）／bettercli.org（exit code 语义）／Thoughtworks CLI 指南（noun-verb）／semgrep CLI reference／trufflehog README（CVE-2025-41390 防恶意 config）／sonar projectBaseDir／仓内：cli.ts/39-one-shot/ADR-0009/0017/D-053/054/058/059。

## §8 信息缺口

- 「audit 命令上架后 README 能力边界行的精确措辞」留给票内文书环节；
- --json 输出与现有 demo --json 的字段对齐细节票内定。

**一句话裁定**：(a)——`macro-audit audit <path|owner/repo|url> [--scale] [--out] [--json]`，Macro-B 先行＋诚实拒绝＋装配提炼＋39/40 转回归对照物＋README 同步同票。
