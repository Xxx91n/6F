# R19-Q4 调研题面 — cue 表语义分层收尾：CJK non-assert 同构缺口＋词表治理立规

## 上下文（本仓实况，调研须先回顾）
- 产品=宏观+微观工程内容审计 Agent Plugin（ADR-0001~0021；CONTEXT.md 60 词；decision-ledger.md 68 条：62 current/3 revised/3 承继吸收）；
- **必读**：decision-ledger 全部 current 记录（重点 D-053 叙事双轨、D-058 Kernel/Agent 边界、D-059⑤ presence→NLI→human-in-loop 分级、D-061 评测纪律、D-064 F 项处置、D-065 checker 修复三表否定剥离——含 CJK 独立词表/禁 port 英文表/禁参照 52a 语料标签调参、D-066/D-068 契约守卫族先例）；CONTEXT 词条（Kernel/Agent 职责边界、Evidence Gate、Failure Semantics、Watch Tri-state）；
- citation.ts cue 表现状（engine/src/report/citation.ts，r18 后）：EN 侧四表齐备——EN_PRE_NEG/EN_POST_NEG（否定）＋**EN_NON_ASSERT_CUES（假想/示例语境，r18 O2 新增，flag kind='non-asserted'）**＋EN_PSEUDO_NEG（伪否定豁免）；CJK 侧——CJK_PRE_NEG/CJK_POST_NEG/CJK_PSEUDO_NEG 三表，**无 CJK_NON_ASSERT_CUES**；另有 EN_SPEECH/CJK_SPEECH/CJK_SPEECH_PSEUDO（引语归属）；flag kinds=negated/non-asserted/verdict-label/context-stripped/absent；CJK 匹配=子串无词边界（EN=词边界正则）；
- 动机链：52a 评测对抗 FP=13 主类=语境包裹误判（否定/引语/假想示例）→D-065 三表剥离+r18 O2 拆 EN non-assert 表；CJK 语料在作用域内（CJK 否定表已建）；假想语境 CJK 标记=例如/比如/假设/试想/倘若/举例来说/打个比方/理论上/虚构等；
- 治理现状：cue 表=代码内常量+注释，增补无流程要求；D-065 已立「禁参照 52a 语料标签调参」只管评测侧；D-068 刚立契约 diff 守卫（baseline+三 FAIL）为同族先例。

## 选项
- ①CJK non-assert 表：(a) 补同构表（种子词=EN 语义对应物＋CJK 子串特性设计）/(b) 不补（CJK 假想语境实证=0，YAGNI）/(c) 缓挂；
- ②词表治理：(a) 立规——表头「词表即判据」声明＋改表义务（同 commit 记动机＋held-out 复跑＋禁参照评测标签）＋可选 56-check baseline-diff WARN；/(b) 不立规；/(c) 重立规——词表抽 JSON 版本化独立文件带独立版本号。

## 调研问题
1. 否定/语境剥离词表的语种覆盖心智：NegEx/ConText 算法族的多语种移植惯例——英文 cue 表翻中文的已知陷阱（子串误吞、词形边界缺失、语义场错位）；中文 NLP 里 hypothetical/speculative/example-context cue 表有无成熟词表可借鉴（ speculation detection/hedge detection 中文研究）；「对称为预防补齐 vs YAGNI 等实证」在 gazetteer 工程的取舍先例；
2. CJK 子串匹配的词形边界治理：无词边界语言 cue 表的设计模式（长词优先匹配/词形后缀表/负向前查）——「假设」误吞「假设性/假说」、「例如」误吞专有名词内含串的处置先例；
3. 「词表=判据」的治理形态工业先例：规则引擎/lint/静态分析工具里 rule vocabulary（关键词表/启发式词典）的变更纪律——词表入代码常量 vs 独立版本化词表文件（ hunspell/spelling dictionary、alexa slot values、detector gazetteer 的版本化先例）；改词表=改判定面的登记义务（changelog/baseline-diff/复跑触发）惯例；
4. 预防性对称 vs 实证驱动在判定面的取舍：安全/审计规则库对「未实证语种覆盖」的立场（规则覆盖率完整性 vs 误报风险控制）；
5. 候选逐条裁定＋已知失败模式；
6. **冲突排查**：逐条点名与本仓 current 决策有无冲突（重点 D-065 CJK 词表纪律/禁参照标签调参、D-059⑤ 分级、D-058 kernel 边界、D-068 契约守卫先例、D-061 评测纪律）；冲突→给 revised 方案。**不许改文件，只给调研报告**。

## 报告结构（严格）
1) 执行摘要：推荐＋置信度；2) 分点结论；3) 对比矩阵；4) 落地要素清单（CJK 种子词表设计建议＋治理立规要素＋机检面形态）；5) 各候选已知失败模式；6) 与本仓 current 决策冲突排查；7) 完整来源清单；8) 信息缺口。