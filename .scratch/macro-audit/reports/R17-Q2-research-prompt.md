# R17-Q2 调研题面 — #56 checker 语义边界修复方向裁定

## 上下文（本仓实况，调研须先回顾）
- 产品=宏观+微观工程内容审计 Agent Plugin（ADR-0001~0021；CONTEXT.md 60 词；decision-ledger.md 64 条：58 current/3 revised/3 承继吸收）；
- **必读**：decision-ledger 全部 current 记录（重点 D-053 叙事双轨、citation presence-check、D-058 Kernel/Agent 边界、D-059⑤ presence→NLI→human-in-loop 叠加分级非替代、D-061 #52 拆票、D-064 F1-F15 处置）；ADR-0013/0015；CONTEXT 词条（Kernel/Agent 职责边界、Sufficiency Gate、Failure Semantics）；
- #56 票面实物（BACKLOG.md 行77）：checker 语义边界缺陷——52a 评测暴露对抗 FP=13（否定/引语包裹字面命中误判 supports：NOT 包裹、CJK「不支持X」子串、引语他人主张）＋对抗 FN=12（改写/同义语义在场字面锚缺席漏判）＋全集 κ=0.455<0.6 地板（非对抗子集 κ=0.970）；三候选方向=①否定语境剥离启发式②语义等价锚表③宣称收窄 presence-only＋文档化；**硬纪律=禁参照 52a 语料标签调参**；citation.ts 现为 token/presence 级确定性机检（engine/src/report/citation.ts）。

## 选项
- (a) ③+① 组合：宣称收窄 presence-only 文档化＋否定语境剥离启发式（确定性、kernel 兼容、治 FP=13 主类），FN=12 披露归 human-in-loop；
- (b) 纯③收窄宣称零行为改动；
- (c) ①+② 启发式全上（否定剥离＋语义锚表）；
- (d) 上 NLI/语义层（概率性依赖进 kernel）。

## 调研问题
1. 引用核验/citation support 检查器的工业分级心智：presence→轻启发式（negation scope detection）→NLI/entailment 的叠加架构落地先例（citation verification、claim grounding、attribution checking 工具链）；否定语境剥离（negation/quotation scope stripping）作为确定性前处理的有效性与已知失效模式（scope 误判、嵌套引语、CJK 否定词覆盖）；
2. 「宣称收窄＋文档化」vs「启发式增强」的组合惯例：审计/静态分析工具面对 adversarial false-positive 的成熟处置（规则白名单 vs 判定宣称收窄）；presence-only 宣称下否定误判是否仍算 defect？
3. 锚表（synonym/paraphrase anchor table）方案的维护经济学：curated equivalence table 的覆盖率天花板与防调参泄漏纪律下的可行性；
4. kernel 确定性边界：否定剥离是纯字符串处理（确定性）vs NLI=概率模型——D-058 边界下何者合规；是否已有工业先例把 negation scope 检测写成确定性算法（NegEx/ConText 算法族——医学 NLP 经典确定性否定检测）；
5. 候选逐条裁定＋已知失败模式；
6. **冲突排查**：逐条点名与本仓 current 决策有无冲突（重点 D-059⑤ 叠加分级、D-058 kernel 边界、D-061 评测纪律、D-053 盖章语义）；冲突→给 revised 方案。**不许改文件，只给调研报告**。

## 报告结构（严格）
1) 执行摘要：推荐＋置信度；2) 分点结论；3) 对比矩阵；4) #56 票面要素清单（推荐方向展开：判定语义文档化措辞/启发式边界/测试纪律/披露义务）；5) 各候选已知失败模式；6) 与本仓 current 决策冲突排查；7) 完整来源清单；8) 信息缺口。