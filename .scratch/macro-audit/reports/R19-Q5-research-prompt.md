# R19-Q5 调研题面 — r18 审计残余观察项（8 项判断级清理）处置

## 上下文（本仓实况，调研须先回顾）
- 产品=宏观+微观工程内容审计 Agent Plugin（ADR-0001~0021；CONTEXT.md 60 词；decision-ledger.md 69 条：63 current/3 revised/3 承继吸收）；
- **必读**：decision-ledger 全部 current 记录（重点 D-041 watch 三态/manual_watch 五要素、D-058 Kernel/Agent 边界、D-063 观察项先例（F13 demo-cleanup-observe「下次接触该文件的票顺带清」）、D-064 F1-F15 处置表——观察项不单独立票、D-065/D-069 cue 表票即将触碰 citation.ts）；CONTEXT 词条（Watch Tri-state、Trigger-gated Closure、Kernel/Agent 职责边界）；
- r18 审计残余观察项 8 项（2026-09-17 pass-handoff §残余观察项）：①`(x.length>0?[x[0].fact_id]:[])` 守卫式 ×6+ 重复（citation.ts 同型样板）；②citation.ts:358 死条件；③closers Map 值未读；④enCuesIn/substrCuesIn 签名不对称＋checkAllCitations 每 claim 重剥离（可 memo）；⑤citation.test.mjs assert 风格偏离屋 t() 惯例；⑥52a-eval-results.json 原地覆写（基线靠 git 史）；⑦A-ledger R10 头括注陈旧；⑧WORKFLOW §4 未 append 本轮教训；
- 关键事实：D-069 cue 表票（CJK_NON_ASSERT_CUES 补表＋表头声明＋56-check WARN）本就触碰 citation.ts；6/7/8 为文档/流程面；审计判「判断级，建议下一维护票顺带清或登记观察位」。

## 选项
- (a) 分流顺带：citation.ts 五项（1-5）并入 D-069 cue 表票作「顺带清」子项（同文件触碰顺带原则）；6/7/8 三项入整理环节文档面顺手落盘；
- (b) 独立清理小票：八项立一张 P2 清理票；
- (c) 全量观察项登记：registry 每项一条 manual_watch；
- (d) 缓挂。

## 调研问题
1. 审计发现残余项的处置工业心智：code review/audit 后 non-blocking findings（code smells/死码/风格/文档注记）的分流惯例——顺下个相关票清（opportunistic refactoring/boy scout rule）vs 独立 cleanup 票 vs 技术债登记表；「顺带清」的边界纪律（混入功能票的风险：diff 污染/审查面扩大/回滚耦合）与适用条件（同文件/同模块/低风险机械改动）；
2. boy-scout-rule 的落地形态：成熟工程组织对「顺路清理」的票面纪律——是否要求单独 commit/单独 PR 标注/cleanup 子项清单；「camp rule」类惯例的失败模式（清理引入回归、与功能变更纠缠难 bisect）；
3. 死码与重复样板的处置经济学：dead code removal/重复样板收敛该立刻清还是等触碰窗口——静态分析债（SonarQube/SonarCloud maintainability 分级）对这类项的标准分流；
4. 文档/流程卫生项（基线覆写/陈旧注记/lesson 未记）的处置惯例：audit follow-up items 的归属（流程面并入下次行政/收口环节 vs 立票）；
5. 候选逐条裁定＋已知失败模式；
6. **冲突排查**：逐条点名与本仓 current 决策有无冲突（重点 D-063 观察项先例、D-064 F13 顺带清裁定、D-041 watch 三态、D-058）；冲突→给 revised 方案。**不许改文件，只给调研报告**。

## 报告结构（严格）
1) 执行摘要：推荐＋置信度；2) 分点结论；3) 对比矩阵；4) 处置要素清单（推荐方向展开：哪些顺带/哪些登记/顺带清的边界纪律/票面写法）；5) 各候选已知失败模式；6) 与本仓 current 决策冲突排查；7) 完整来源清单；8) 信息缺口。