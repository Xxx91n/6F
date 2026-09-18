# R19-Q5 调研报告 — r18 残余观察项（8 项判断级清理）处置

> atomcode 深调研（2026-09-18 实跑；Fowler Opportunistic Refactoring/SonarQube 10.3/dev.to Boy Scout/BonCode/fluncle audit-backlog 9 源，置信高）。题面=R19-Q5-research-prompt.md。

## 1) 执行摘要

**推荐＝候选 (a) 分流顺带，但按项切桶**：①-⑤ 五项 citation.ts 同文件项并入 D-069 cue 表票作「顺带清」子项（**必须以独立 commit／票面子项清单形态**，不混入 cue 表判定 commit）；⑥⑦⑧ 三项文档/流程面不立票，归下一轮收口对账（整理环节）顺手落盘，不登记 manual_watch。备选：若 ④（memo 性能项）在顺带票里膨胀，按「5 分钟纪律」切出去单独立 P2 小票。**置信度：高**——Fowler 官方心智＋票面纪律双源＋本仓 D-063/D-064 F13 先例三重一致，八项全部落在「顺带清」适用条件内（同文件/低风险/机械改动/测试网完备）。

## 2) 分点结论

**结论 1：non-blocking findings 的工业分流惯例是三分桶，本仓八项全属「顺带清」桶**
- opportunistic refactoring/campsite rule：Fowler「whoever sees code that isn't as clear as it should be, they should take the opportunity to fix it right there and then」＋「another day often doesn't come」。
- 反面（不选独立票）：dev.to「If a cleanup takes longer [than 5 min], it's not a Boy Scout improvement—it's a task. Write it down, create a ticket」——八项均分钟级机械改动，达不到独立票门槛。
- fluncle audit-backlog 先例：审计只 filed not fixed，operator 按严重度 promote——与 D-063 观察项不单独立票同构。

**结论 2：「顺带清」的边界纪律有明确工业口径**
- **行为零改动**：「the improvement must not change behavior」；1-4 项为判定面等价变换、⑤测试面机械收敛——须逐项跑 citation.test.mjs＋golden 逐字节断言护航（本仓测试网满足 Fowler「regression suite 完备」前提）。
- **独立 commit**：「put the cleanup in a separate commit」——blame/rollback/bisect 干净；对审计型产品尤其重要（回滚耦合=receipt 链污染）。
- **防兔子洞**：Fowler「genuine danger of going down a rabbit hole」——④ memo 项若超分钟级即停手转独立票。
- **限直接相关面**：「scope improvements to what is directly relevant」——⑥⑦⑧ 不扩散进代码票。

**结论 3：dead code/重复样板处置经济学支持「触碰窗口即清」**
- SonarQube 10.3 issues 官方：MAJOR=「quality flaw that can highly impact developer productivity」样例恰是 duplicated blocks；映射八项：①重复守卫式=MAJOR、②死条件=MAJOR、③未读值=MINOR、④签名不对称=MAJOR、⑤测试风格=MINOR/Info、⑥⑦⑧=Info 流程注记——MAJOR 及以下不阻断合并，「随触碰窗口清」合标准分流。

**结论 4：文档/流程卫生项（⑥⑦⑧）处置惯例=流程面顺手落盘非立票**
- fluncle：low/med 流程注记由 operator 在既有活动顺手 resolve——「resolved row 在解决它的 PR 里删除，分析留给 git 史」；文档陈旧注记=canonical doc 就地勘误。
- 本仓 D-064 F13 已立「观察项不单独立票」先例；⑧ WORKFLOW lessons 是收口对账环节本职面。

## 3) 对比矩阵

| 项 | 处置面 | 改动风险 | 工业先例强度 | 备注 |
|---|---|---|---|---|
| (a) 分流顺带 | 功能票子项＋整理环节 | 低（机械、测试网完备） | 高（Fowler＋dev.to＋BonCode） | **推荐**；须独立 commit 纪律 |
| (b) 独立 P2 清理票 | 单独票 | 低 | 中 | 违 D-064 先例；票务税大于收益 |
| (c) 全量 manual_watch | registry | 零 | 低 | 违 D-041 五要素；watch 是过渡态非归档位 |
| (d) 缓挂 | 无 | 零 | 低 | Fowler「another day often doesn't come」直接否决 |

## 4) 处置要素清单（票面写法）

**D-069 cue 表票增补「顺带清」子项清单（①-⑤）**：
- 票面写法：增补子项节「顺带清（r18 残余观察项 ①-⑤，处置依据 D-063/D-064 观察项先例＋atomcode R19-Q5 调研）」，逐项一行＋文件：行号。
- **commit 纪律**：cue 表判定改动与顺带清改动**至少两个 commit**（判定 commit 零夹带／顺带清 commit 标注 `[cleanup] r18 残余 ①-⑤`）；GitButler 下=两个独立 hunks/分支条目。
- **验证链**：citation.test.mjs 全绿＋golden 三场景逐字节＋56-check；顺带清 commit 单独跑一次 npm test。
- **膨胀熔断**：④ memo 若发现非等价/超分钟级，停手，转独立 P2 票（写明熔断条件在票面）。
- **⑥⑦⑧ 落点**：下一轮收口对账环节执行；⑦/⑧ 属 A-ledger/WORKFLOW 文档面就地勘误；⑥ 二选一：a) 注记「基线=git 史，现状即决议」b) 改时戳文件名——**建议 a)**（D-061 golden 评测集版本化纪律下，改文件名反而破基线引用稳定性）。

## 5) 各候选已知失败模式

- **(a)**：①清理与功能纠缠致 bisect 困难（纪律=分离 commit）；②兔子洞膨胀（纪律=熔断条款）；③diff 污染扩大审查面（纪律=独立 commit＋子项清单）；④deadline 下被系统性跳过（本仓收口对账环节兜底）；⑤回滚耦合：判定与 cleanup 混 receipt 链无法单独回滚（golden 逐字节断言部分缓解）。
- **(b)**：票务税/小题大做；P2 排程面永远靠后；违 D-064「观察项不单独立票」先例。
- **(c)**：D-041 五要素空转（manual_watch 配不上判断级小项）；watch 表通胀稀释真信号；逾期转 risk_accepted 报警噪音。
- **(d)**：技术债复利＋Fowler「another day often doesn't come」；下轮审计重复报告同项（fluncle dedupe 要防的恰是此）。

## 6) 与本仓 current 决策冲突排查

| 决策 | 排查结果 |
|---|---|
| D-063（观察项先例） | **零冲突，直接依据**——F13「下次接触该文件的票顺带清」；①-⑤ 恰逢 D-069 票触碰 citation.ts=模式复用非破例 |
| D-064（F1-F15 处置表） | 零冲突：F13「观察项不单独立票」直接否决 (b)；本推荐沿先例延伸到 r18 八项 |
| D-041（watch 三态） | **(c) 与其冲突**：manual_watch 五要素对判断级清理项是税制错配——watch 是过渡态非归档位。选 (a) 零冲突 |
| D-058（Kernel/Agent 边界） | 零冲突：①-⑤ 在 kernel 判定面归工程票；⑥-⑧ 在流程/文档面归整理环节——处置面恰沿 D-058 边界切开 |
| D-069（cue 表票承载票） | 零冲突且是承载票；**顺带清子项不得动 cue 表判定语义**（剥离窗口/词表参数零触碰）只做等价变换——须在票面显式写这条防纠缠 |
| D-061（评测纪律） | 零冲突：⑤ test 风格收敛不触碰 52a golden 集；⑥ 选「注记现状即决议」防破基线引用 |

**无需任何 revised 决策。**

## 7) 完整来源清单

1. Martin Fowler, Opportunistic Refactoring (2011) — https://martinfowler.com/bliki/OpportunisticRefactoring.html — Official — 顺带清心智原典＋兔子洞警告
2. SonarQube Server 10.3 Issues — https://docs.sonarsource.com/sonarqube-server/10.3/user-guide/issues — Official — severity 分级（MAJOR=duplicated blocks 样例）
3. dev.to The Boy Scout Rule — https://dev.to/maximeshr/the-boy-scout-rule-... — Community — 5 分钟纪律＋独立 commit＋「cleanup 不得混行为改动」
4. BonCode codebase is not a camp site (2025-03) — https://boncode.nl/... — Criticism — 顺带清失败模式（过度扩散/deadline 跳过）
5. fluncle docs/audit-backlog.md — https://github.com/mauricekleine/fluncle/... — Community 一手先例 — 机器审计 findings 台账分流＋就地修 canon 注记
6. SonarQube Server 9.9 Issues — https://docs.sonarsource.com/sonarqube-server/9.9/... — Official — 旧五级分级口径
7. lawsofsoftwareengineering.com Boy Scout Rule — Community — 增量小改进复利（摘要级）
8. triology.de SonarQube blog — Community — duplication 计技术债口径（摘要级）
9. codedebtcost.com SonarQube Metrics — Community — duplication <3% 阈值惯例（摘要级）

## 8) 信息缺口

1. 「顺带清混入功能票」的量化失败案例（bisect 成本数据）无系统性文献，结论按票面纪律惯例推断。
2. lawsofsoftwareengineering.com 原文 fetch 超时（仅摘要）；BonCode 为批评单源，失败模式清单或不全。