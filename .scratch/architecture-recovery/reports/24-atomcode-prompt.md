# 24 — atomcode 深度调研提示词（A-028 / spec §R3-D6）

> 本文件是票 24 的调研提示词留档（沿用 01/03/15/23-research-prompt.md 惯例）。调研报告落 `reports/24-atomcode-research.md`。
> 两轮串行（共享配额，per WORKFLOW §4.2.3 + atomcode-research skill 串行护栏）。

## 轮 1 — 定向调研：审计/审查类产品「第一份真报告」先例

### 调研问题（单句）

代码审计/工程分析类产品「第一份真报告」的工业先例：CodeScene（行为代码分析）、GitClear、Structure101、SonarQube 早期各自首次对真实仓库产出的分析报告长什么样？它们用什么口径向首批用户证明报告不是空话（验收/可信度机制）？首报之后产品判据如何被实测数据回流校准？

### 必须回答的子问题

1. CodeScene：Adam Tornhill 的 behavioral code analysis（Your Code as a Crime Scene 书系 → 产品化）首个真实仓报告的公开形态、hotspot 判据的来源与校准方式；其「首份报告」如何被当作产品前提前验证/证伪工具。
2. GitClear：commit 质量/开发者生产力度量产品的首个公开报告形态；其判据阈值（如 churn、line impact）是否公开过校准来源。
3. Structure101 / SonarQube 早期：结构/质量审计产品首报形态；SonarSource dogfooding 或早期标杆仓验证的公开记录。
4. 横切：这些产品的「首报→判据校准」回流机制是否有公开先例（阈值重校准、判据增删、误报率上报回路）；首报验收口径与本票三层闸门（A 形式 / B kill criterion / C 信任裁决）的可比项与差异。

## 轮 2 — B 层迁移有效性多仓复核计划

### 调研问题（单句）

「正对照 + 预声明 kill criterion」这套验收闸门从单仓迁移到多仓时有效性如何验证？mutation testing 文献中已知答案对照（positive control / KAT）与真实缺陷检出率的相关性证据强度如何？proficiency testing（ISO 13528）与 assay sensitivity（ICH E10）在多站点/多样本场景如何复核判据有效性？OWASP Benchmark 之类跨工具基准如何处理判据迁移？给出可执行的多仓复核计划设计要点。

### 必须回答的子问题

1. mutation testing：正对照检出率与真实缺陷检出能力的相关性是实证支持还是理论保证（R3-Q3 §7 缺口 4 原话）； mutation score 作为测试套件质量代理的效度研究（如 Just et al. mutants-vs-real-faults 系列）对本产品 B 层「正对照证管线、真判据承载证伪」设计的迁移有效性边界。
2. ISO 13528 / ICH E10：多实验室 proficiency testing 与 assay sensitivity 在「判据跨样本迁移」上的协议要件（样本量、分层、预设统计判据、复核路径）；这些要件如何翻译成「多仓复核计划」。
3. OWASP Benchmark / NIST KAT 类基准：已知答案测试在跨实现/跨仓场景的有效性与失效模式（过拟合基准、基准本身缺陷）。
4. 输出形态：给出一个 P1 级「B 层迁移有效性多仓复核计划」骨架——仓样本选择规则、复核判据、命中/未中语义、何时触发判据 v2 追加。

## 约束（两轮共用，不得违反）

- 调研结论只作「校准输入」段落：不阻塞首报、不改写首报任何判定（A-028 显式约束；spec §R3-D6）。
- 校准输入映射清单只允许指向既有 16 项信息缺口编号（macro-audit 2026-09-12-report.md §12：D-012×5 + D-013×4 + R2-Q7×8，其中 1 项性质变化）；新造缺口 = FAIL。
- 引用须可回查：给标准号 + 条款位 + URL；禁止虚构单一综述来源（A-029 纪律）。
- 与 current 决策（D-016/D-017/D-018、ADR-0012/0013）冲突之处必须显式点名，不得静默改向。
- 采集器确定性、不接 LLM（D-016）——复核计划不得依赖 LLM 判定。

## 输出要求

- 中文，markdown；每节结论 + 依据（可回查出处）。
- 至少 2 个成熟心智模型/工具/论文作类比，逐条说明「支撑本票哪个设计决策」。
- 结尾给「校准输入映射建议」小节：每条建议 → 指向既有缺口编号 + 校准内容（不得新造缺口）。
