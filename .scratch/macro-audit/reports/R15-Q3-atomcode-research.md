# R15-Q3 atomcode 深度调研报告 — #52 叙事质量评测面被测对象拆分

> 题面：D:\Aworker\6F\.scratch\macro-audit\reports\R15-Q3-research-prompt.md
> 时点 2026-09-17；通道 ctx_batch_execute（label=atomcode-r15q3）；17 来源（RAGAS/Arize/OneUptime/AWS sample-GEDD/Judge's Verdict/Bujang\u0026Baharum/CiteEval/Langfuse/Deepchecks/tianpan.co/Preference Leakage arXiv 等）。
> 冲突协议结果：**零 revised；唯一动作=D-057② 勘误注记一行＋registry 触发器定义细化**。

## §1 执行摘要

**推荐 (a) 拆票，置信高。** 工业共识分立两评测对象：「评测器本身」（meta-eval/judge alignment，需人标基线，可先建）与「生成质量」（需被测产物存在）。#52 两半句恰分属两侧：checker（citation.ts 确定性仪器）现在即可合成语料评测；宿主叙事质量被测对象尚未存在，强行用合成叙事代理=自评变体（同族生成器/判据偏好泄漏已实证可翻转排名）。(b) 违票面自设「判据独立于产出方」；(c) 放弃可即时执行的 checker eval 腿＋registry 已触发锚空转。

## §2 分点结论

**Q1 meta-eval vs 生成质量分立**：RAGAS/DeepEval/TruLens 全部把「指标实现」与「指标可信」分开——RAGAS 官方 Align-an-LLM-as-a-Judge 工作流（人标→baseline→分歧分析→改 prompt→复跑）；Arize 三问框架（human-human agreement 天花板/LLM-human agreement/LLM-reference 分类指标）。确定性 checker 成熟形态=**合成 claim-evidence 对＋precision/recall＋分型错误分析**（AWS sample-GEDD calibrate.py 同形态；CiteEval/CiteBench ACL2025 NLI citation 评测批判＋人标基准；FP/FN 分型 fine-grained insensitivity>66%）。presence→NLI→human-in-loop 叠加分级与 Deepchecks 官方 faithfulness 操作化方向一致——D-059⑤ 只砍 contradicts 不拆分级获文献背书。

**Q2 κ 校准基线**：①判据先行（人标独立再讨论）；②**human-human κ 作天花板，judge-human κ 须达同级**（Judge's Verdict human-to-human κ=0.801 基线）；③阈值惯例 κ≥0.6 substantial/≥0.8 almost perfect；④必报 raw agreement（κ paradox，失衡时 Gwet's AC2 或双报）；⑤parse 失败计入分母。样本量功效分析：2 类标签 Δ0.2→n=194、Δ0.5→n=29；Monte Carlo：**n=60@20%保守度/n=100-200@5-10%**；底线≥50 条手标。**小样本基线判据力条件**：阈值预声明＋bootstrap CI＋held-out 不重复调参＋human-human κ 同报——n=50-100 二元标签够「基线」资格。

**Q3 合成语料外推风险**：preference leakage（judge 与生成器同族→系统性偏袒，arXiv 2502.01534）；tianpan.co 三层架构（同族偏差/尾部削平/wild eval）。**合成语料评 agent 质量=自评变体**（判据独立纪律下不成立）；合成评 checker 成立（仪器标定非产物质量）。

**Q4 评测面工程形态**：golden claim set 版本化＋PR 评审更新（复用 #43/D-037）；eval 结果 JSON＋check 断言入既有 check 族；**评测票与修复票分离**（eval 暴露缺陷另立票防自评）；held-out 子集只评一次；checker 阈值改动不得参照本集标签（防调参泄漏）。

## §3 对比矩阵

| 项 | 被测对象现在存在？ | 判据独立性 | 可执行时点 | 关键风险 | 裁定 |
|---|---|---|---|---|---|
| (a) 拆票 | 52a=checker 在；52b 挂触发器 | 52a 仪器+人标 gold 独立成立 | 52a 即时；52b 锚触发即启 | 合成 precision 不外推真实分布（须披露） | **推荐** |
| (b) 单票合成双评 | agent 叙事不在 | 叙事腿=自评变体 | 形式即时实为评空气 | preference leakage；模板叙事冒充被测物（违 D-053 degraded 位） | 拒 |
| (c) 整票缓 | — | — | 等实跑 | 已触发锚空转；违先物后尺（checker 物已在） | 拒 |

## §4 票面要素清单

**#52a checker-eval（即时）**：①语料=合成 claim-evidence 对 ~80-120 条按判定空间分层（presence 成立/不成立、支持/矛盾/中立、band-leak 注入、边界样本），标签由构造定义＋双人复核小样本；②指标=precision/recall 分类别＋FP/FN 分型（CiteEval 法）＋band-leak 检出率（BAND_PATTERNS 独立复测）；③κ 基线=50-100 条子集双标→human-human κ→checker-人 κ，预声明阈值 κ≥0.6 起、报 raw agreement＋bootstrap CI；④纪律=golden claim set 版本化＋PR 评审、阈值改动不参照本集、held-out 只评一次；⑤产物=eval JSON＋check 断言＋合成限制披露；⑥不改 checker 行为、暴露缺陷另立修复票。

**#52b 宿主叙事质量 eval（挂新触发器）**：①锚=audit 首次实跑产出真实宿主叙事段（或 pilot 真实语料 N≥50 段）——替换现已触发锚；②语料=真实叙事段 wild slice（不清洗失败形态，degraded/uncited 保留）＋held-out 与 52a 集分离；③judge=跨族于宿主生成模型（preference leakage 缓解）＋先对齐（RAGAS align 工作流）；④指标=grounded stamp 准确率＋judge-human κ（预声明）＋与 52a 合成基线分布偏移对照；⑤收割 D-053⑤ model id 字段（防死字段）。

## §5 失败模式

(a) 52a 合成 precision 不外推须披露；(b) preference leakage＋模板叙事冒充被测物；(c) 锚空转＋checker 价值冻结。

## §6 冲突排查

D-057②=**唯一动刀处但属勘误非改向**：registry 锚拆分（52a 不占锚＋52b 改锚实跑语料）；D-053 ✅（且 (b) 反与其「模板叙事永居 degraded」冲突）；D-058 ✅ 且被强化（拆票恰沿 Kernel/Agent 边界切开）；D-059⑤ ✅（52a 按叠加分级逐级测不得借机扩砍）；D-037/#43 ✅ 直接复用；ADR-0013 ✅（band-leak 检出=独立复核非新增判据）；ADR-0015 ✅（52a=量测有效性先行落地）；ADR-0017 ✅（合成限制披露即其惯例）；CONTEXT 先物后尺 ✅。

**结论：零 revised；D-057② 勘误注记一行＋registry 触发器定义细化。**

## §7 信息缺口

52a 合成语料的精确构造程序（checker 判定空间的完备分层表）票内定；52b judge 模型选型（跨族）届时定。

**一句话裁定**：(a)——52a checker 仪器标定即时（合成 80-120＋双标 κ 基线＋FP/FN 分型＋防调参泄漏），52b 宿主叙事质量挂实跑语料触发器（跨族 judge＋wild 语料＋收割 model id）。
