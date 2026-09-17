# R15-Q3 调研题面 — #52 叙事质量评测面的被测对象拆分

## 上下文（本仓实况，调研须先回顾）
- 产品=宏观+微观工程内容审计 Agent Plugin（五尺度；ADR-0001~0021；CONTEXT.md 59 词；decision-ledger.md 60 条：54 current/5 revised/1 closed）；
- **必读**：decision-ledger 全部 current 记录（重点 D-037 golden 护航、D-052 交付物面、D-053 叙事双轨、D-054 能力矩阵收窄、D-057②「先物后尺」评测面 manual_watch、D-058 Kernel/Agent 职责边界、D-059 锐评九点、D-060 audit 命令票面）；ADR-0005/0006/0013/0017；CONTEXT 词条（Sufficiency Gate/Kernel\|Agent 职责边界/Report Template）；
- #52 票面实物（D:\Aworker\6F\.scratch\architecture-recovery\BACKLOG.md 行 72）：「叙事质量评测面：grounded stamp 准确率＋κ 校准基线评测票（被测对象=host-agent 叙事段；RAGAS/DeepEval 先物后尺——判据独立于产出方）」；registry 项 narrative-eval-surface 已 triggered-bound（#50 闭环、叙事实物存在：engine/src/report/narrative.ts＋references 三件＋mcp facts 只读投影＋narrative.test.mjs 25 断言）；
- 被测对象拆分问题：checker（engine/src/report/citation.ts checkCitationSupport——presence/token 级，presence→NLI→human-in-loop 是既定叠加分级非替代，D-059⑤ 拒主诉仅砍 contradicts 死枚举）可对合成语料现评；宿主 agent 叙事段质量（grounded 率/κ 校准）需真实语料——产品未装、audit 未实跑、agent 叙事段尚不存在。

## 选项
- (a) 拆票：#52a checker-eval（合成语料＋人工标注小样本基线，现在执行）＋#52b 宿主叙事质量 eval 挂新触发器（锚=audit 实跑/首个 pilot 真实叙事语料）；
- (b) 单票按票面执行：合成语料双评，agent 合成叙事当质量代理；
- (c) 整票缓回 manual_watch 等实跑语料。

## 调研问题
1. LLM-as-judge / groundedness 评测的工业成熟心智：RAGAS/DeepEval/TruLens/Deepchecks 对「评测对象=评测器本身（meta-eval）」与「评测对象=生成质量」如何分立？checker eval 的成熟形态（synthetic claim-evidence 对、precision/recall、band-leak 检出）？
2. κ 校准基线的成熟做法：inter-annotator agreement（Cohen's κ）样本量/标注程序/判据阈值惯例；小样本基线何时算「有判据力」？
3. 合成语料评测的外推风险文献：synthetic eval → real-distribution gap 的已知失效模式与缓解（held-out real set、domain shift 检测）；「判据独立于产出方」纪律下合成语料评 agent 质量是否=自评变体？
4. 评测面工程形态：eval harness 放 engine test 面 vs 独立评测仓/目录；golden claim set 的版本化与防污染（训练/评测泄漏）；评测报告产物形态（CSV/JSON/regression gate？）；
5. 候选 (a)/(b)/(c) 逐条裁定＋已知失败模式；
6. **冲突排查**：逐条点名与本仓 current 决策有无冲突；若冲突——给出需 revised 的 D-xxx 与替代方案。**不许改文件，只给调研报告**。

## 报告结构（严格）
1) 执行摘要：推荐选项＋置信度；2) 分点结论；3) 对比矩阵；4) #52a/#52b 票面要素清单（若采 (a)）；5) 各候选已知失败模式；6) 与本仓 current 决策冲突排查；7) 完整来源清单；8) 信息缺口。