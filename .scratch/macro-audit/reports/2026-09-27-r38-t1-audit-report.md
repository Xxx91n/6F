# 轮 38 T1 CodeBuddy 试用关窗审计报告（r38-t1-audit LOOP-1）

- 日期：2026-09-27；窗型=审计窗（职责分离：只出报告不动手修）
- 审计对象：T1 CodeBuddy 宿主试用落盘物——commit `mor`=`bfb4b154`（docs：session+debrief）＋`twx`=`5bf43ccf`（chore：证据工件树 9.4MB），stacked on `r38-batch2-a`
- 方法：不信自述——session/debrief 全文读＋证据工件字节级亲算（键集展平/逐字段 diff/cmp 字节等）＋commit 纪律与 registry 负向核对
- charter=`trials/codebuddy-r38-charter.md`（判据预声明，mor commit 未含 charter→临场未改属实）

## 1. 判据读数核对（session 档↔实物证据）

| 判据 | session 自述 | 审计亲验 | 结论 |
|---|---|---|---|
| C1 安装链 hit | add✔11.3s→install✔4.8s→ready:true→selftest 5/5；唯一干预=`doctor --fix` | pinned README L45 亲验原文：「修复=插件目录 `macro-audit doctor --fix`（自愈唯一显式主路）」「MCP 面=install→doctor --fix 1~2 步」——干预步属文档内路径定性成立；安装树 `dist/cli.js=263151B` 与本仓棘轮读数逐字节同 | ✅ |
| C2 效果 parity hit | 键集 70=70 零非对称；17 语义锚零 diff；facts 960×872583B；measurements 逐字节等 | 亲算展平键集 **70=70**（顶层 26 键，70=嵌套展平口径）、onlyA/onlyB 均空；逐字段比对 same=69/diff=1——唯一差=`evidence[].reproduce_cmd` 输出路径自引（baseline↔codebuddy-run 两 --out 目录差，67462 vs 67497B 同源）；facts.jsonl **cmp 逐字节等**；measurements **cmp 逐字节等**；17 锚（head_sha=9eb8f24b…/fact_count=960/commit_count=496/adr_count=14/verdict=supported/codelore pin v0.28.0）抽样在双侧同值 | ✅（差异=环境路径自引，非语义差） |
| C3 披露 hit | stability:preview＋capability 1 of 5＋not_in_preview 三件套＋agent 话术 preview+SCALE-NOT-IMPLEMENTED 自纠 | report.md/report.json `stability:"preview"` 双侧在值；`verdict=supported` 双侧同；披露块字段在证据工件核到 | ✅ |
| 三悬点 | ①marketplace.json 被读 ②.mcp.json 自动发现拉起 ③${CLAUDE_PLUGIN_ROOT} 展开正确 | ①marketplace add type=github 成功=F-03 披露的安装树 66525673 实物在盘；②会话内 ready:true＋CLI `mcp list` 空列已单列 F-02 分层如实；③server 拉起即证（README 注记判读口径一致） | ✅ |
| 关窗核对五格 | exit 完备性五勾全 | session 档 L75-79 五 [x] 实勾；debrief 落盘 `codebuddy-r38-report.md` 4025B | ✅ |
| findings×4 | 全 info/low 设计内行为，四档初分「不进裁定链」 | 票面五要素齐（复现/环境/严重度/来源/去向/dedup 对照六列全填）；F-01=D-075 设计内补偿实证（README L45 文档化主路）；F-02=宿主展示面盲区（本仓外去向如实）；F-03=环境披露；F-04=结构化错误如实披露（Default Mode 收窄同型）——初分口径与 D-146 一致 | ✅ |
| 形态限定 | 实证面=CLI v2.151.0，IDE 未覆盖不外推 | session L4+L85、debrief 头部同声明三处一致；charter 预设「宿主=IDE」偏差如实勘误披露 | ✅ |

## 2. 纪律核对

| 项 | 核实 | 结论 |
|---|---|---|
| commit 类型分离 | mor=docs（session+report 两文书）；twx=chore（15 件证据工件树 baseline/codebuddy-run/self-run 各五件含 facts.duckdb×3） | ✅ |
| 关窗不注册 registry 事件（D-151②/D-152⑤） | mor/twx name-only 零触 33-gate-registry.json；registry 现态 62项/43事件 系 r37 批1 `bd708d14` 后稳态（git log 实证——任务书「61/42」基线为更早口径未刷新）；33-check 单跑 PASS 31/31 | ✅ |
| worktree 干净 | `but status` zz no changes；`git status` 15×D+1×?? = workspace commit 合成簿记态（D-152④ 已预声明披露口径，与骨架 dirty=13 同型现象） | ✅ |
| 判据临场不可改 | mor name-only 仅 session+report 两件，charter 未被回改 | ✅ |
| 时长盒 90min | 自述 ~20min；TBS 计时=opt 字段（D-152⑥ R-c）未单列——合规 | ✅ |
| findings 勿直修（D-146 硬边界） | 本窗无修复动作；四条全判「不进裁定链」 | ✅ |
| 审计读数以安装树为准（预声明规则） | C1/C2 读数均取自安装树 `~/.codebuddy/plugins/cache/xxx91n/6f/0.1.0/`；安装树 SHA=66525673 远端 main 顶如实披露落后本地栈 | ✅ |

## 3. findings（审计窗发现——非阻塞）

| id | 概要 | 严重度 |
|---|---|---|
| T1-N1 | 「字段级 parity 全等」表述略强于实态——展平 70 键中 69 等、唯一差=`evidence[].reproduce_cmd` 输出路径自引（per-run 环境字段）；session/debrief 正文口径「语义锚零 diff+键集零非对称」本身准确，仅宜注意向第三方转述时用准确口径 | nit |
| T1-N2 | 任务书口径「registry=61 项/42 事件」过时——r37 批1（kr-01+升格触发器）后稳态=62/43；簿记刷新项非缺陷 | nit |
| T1-N3 | F-02 宿主展示面盲区定性「本仓外」处置合规，但未挂 manual_watch 接力——若拟追 CodeBuddy 官方渠道需另行建档；现作宿主适配层观察项可接受 | 观察 |

## 4. 结论

**LOOP-1 PASS。** T1 试用关窗判据（exit 完备性）五格实勾、success 轴 3/3 hit 读数均有实物证据背书；findings×4 初分规范；commit/文书/registry 负向纪律全合规。用户自述各条无失实。

- 上轮审计 N1~N7 去向维持：N1/N2/N5/N6 归 75b §3 批2-β 裁定候选补录（用户已批示下一窗口处理）；N3/N4/N7 簿记瑕疵留痕。
- 本窗新增 T1-N1~N3 同步留痕；均未达阻塞级。
- **试用窗结论可采信**：CLI 形态三判据全 hit＋三悬点全实证；IDE 形态未覆盖不自动外推（如需→manual_watch 五要素接力）。

## 5. 口径披露

- 本窗零文件修改（仅本报告与 handoff 两件文书落盘）；parity 核对全在副本读数面（未开 facts.duckdb 原件——DB 探查纪律：三棵 facts.duckdb 未做字节级比对，声明面限 report.json/facts.jsonl/measurements 三文本面；duckdb 二进制同型证据力弱于文本面，如实披露未验）。
- 本窗无账行增量（D-144① 豁免显式声明——审计文书 commit 不立新 A 行；T1 关窗若有后续裁定需求（批2-β/IDE 面接力）届轮再计）。

