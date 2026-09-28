# R43-Q4 atomcode 调研报告存档——建制批开启判据＋RA 档案五要件升级

> 题面=`reports/R43-Q4-research-prompt.md`；引擎=Exa+AnySearch（Tavily 耗尽）＋6 全文精读（thehardparts FM-11/mountaingoat/arXiv 2608.16112/michael-ploed/insightassurance/gatech policylibrary）＋知识库召回 R80-Q2/ADR-0035；angle 五类全覆盖。
> 以下为 ctx_batch_execute 索引输出原文归档。

---

Executed 1 commands (102 lines, 13.4KB). Indexed 10 sections. Searched 5 queries.

## Commands

- atomcode: `atomcode -p "两个治理问题调研：(a) 内部建制/技术债批次的开启判据——一批'机制建制'工作（枚举台账建制/常量归一/reserved 机制）无紧迫消费者、关联缺口台账已全部分诊值守，且外部刚批评'内部建制投入倒挂用户价值'；原定'执行窗空后再裁'现已空。应(i)窗口空即排进 (ii)续挂账等下个审计窗 (iii)钉事件触发器(GAP恶化/新同型需求)而非日历？调研平台工程/技术债排程先例——什么信号令内部机制批值得开工。(b) risk-acceptance 档案标准从三要素(理由+补偿控制+复评触发)升级到工业五要件(判据引用+justification+补偿控制+具名裁者+到期日+到期复审)：应全局升级(旧标revised+新标)、局部个案、还是升级+回填历史档？调研 exception expiry/recertification cadence/例外永久化审计失败先例与标准升级的 grandfather-vs-retrofit 惯例。给推荐与理由。"`

## Indexed Sections

- atomcode (2.0KB)
- atomcode > 1) 执行摘要（Tl;dr） (1.6KB)
- atomcode > 2) 分点结论 (0.0KB)
- atomcode > 2) 分点结论 > (a) 内部建制批次的开工判据 (2.4KB)
- atomcode > 2) 分点结论 > (b) risk-acceptance 档案五要件升级的落地方式 (1.9KB)
- atomcode > 3) 对比矩阵 (0.0KB)
- atomcode > 3) 对比矩阵 > (a) 开工判据三选项 (0.8KB)
- atomcode > 3) 对比矩阵 > (b) 五要件升级路径 (1.1KB)
- atomcode > 4) 完整来源清单 (2.6KB)
- atomcode > 5) 信息缺口 (1.1KB)

## tech debt scheduling

### atomcode > 4) 完整来源清单
## 4) 完整来源清单

| # | 标题 | URL | 角度 | 日期 | 贡献 |
|---|---|---|---|---|---|
| 1 | Strategic Technical Debt: A Real Options Approach (arXiv 2608.16112) | arxiv.org/html/2608.16112v1 | Official | 2026-08-16 | 偿还时机理论：最优偿还集中事件边界；toxic/strategic 债务分界；“利息>折现才提前还”阈值 |
| 2 | Platform Before Product (FM-11) | thehardparts.dev/failure-modes/platform-before-product | Criticism | — | 无需求建制的完整失败模式谱系；“<2 确认用例即停建”；Early/Mid/Late 预警信号 |
| 3 | Platform Timing Is a Strategic Decision (Michael Plöd) | michael-ploed.com/blog/platform-timing-is-a-strategic-decision | Official/Criticism | 2026-05 | 四时机信号（"Nobody is pulling for it"最常被无视）；先协作后抽象、thinnest viable |
| 4 | Three Strategies for Fitting Refactoring into Sprints (Mountain Goat) | mountaingoatsoftware.com/agile/three-strategies-for-fitting-refactoring-into-your-sprints | Comparative | 2021-03（更新 2024-07） | 三种排期法利弊；欠债即钉偿还事件优于固定日历/随机扫尾 |
| 5 | Policy Exceptions (Georgia Tech) | s1.policylibrary.gatech.edu/information-technology/policy-exceptions | Official | 2010-07（复审 2025-11） | 具名三方签核、≤1 年、无补偿控制不批——五要件的机构化实例 |
| 6 | NYS ITS P13-001 Security Exception Policy | its.ny.gov/system/files/documents/2023/01/nys-p13-001...pdf | Official | 2023-01 | **关键条款：引用标准修订→GRC 须复审全部 in-force 例外**；延期同级审批；30 天预警 |
| 7 | FedRAMP Controls: Baselines and Proposed Changes (Insight Assurance) | insightassurance.com/insights/blog/fedramp-controls-baselines-and-proposed-changes/ | Official/Currency | 2026-07-06 | Rev5→Rev6/20x 过渡形态：向前生效+过渡窗，不追溯重评 |
| 8 | Code Upgrades and Grandfathering (J.S. Held) | jsheld.com/insights/articles/code-upgrades-and-grandfathering-lessons-learned... | Comparative | 2026-05-14 | grandfather 惯例：触发事件（翻新）强制按新规范重评 |
| 9 | 知识库 R80 Q2 批次（cybersecurity101 / decryptiondigest / grcopilot 已读原文） | （前会话索引） | Official/Criticism | 2026-05~07 | 五要件三源一致；90 天上限；40% 过期例外统计；open-ended = silent policy change |
| 10 | 知识库 ADR-0035（Deferred Registry Cadence Ladder） | （本仓） | Official | 2026-09 | 本仓已有 fail-closed review_at + 分级复审先例；batch 派日期是最坏情况——对 (a)(b) 均为内部先例 |

### atomcode > 3) 对比矩阵 > (b) 五要件升级路径
### (b) 五要件升级路径

| 路径 | 先例支持 | 对 40% 过期失败模式的免疫 | 判定 |
|---|---|---|---|
| 全局升级（新标 forward + 旧标 revised 声明废弃） | FedRAMP 过渡、NYS 标准修订复审条款 | 新档全免疫；旧档需处理 | ⚠️ 不完整 |
| 局部个案升级 | 无先例支持 | **不免疫**：双轨标准 = 审计歧义 | ❌ |
| 全局升级 + grandfather 带到期日回填 | 建筑规范（触发事件强制重评）、NYS（引用标准修订→复审 in-force）、FedRAMP（过渡窗） | 高风险旧档在复审点强制补齐；低风险档 legacy 标注自然消化 | ✅ 推荐 |

**推荐落地细节**：新档一律五要件；存量档立即批量标注（无需重做内容——只补“到期日是否在册、裁者是否具名”两个检查字段）；到期日已过或缺失的活跃档**不允许续期，除非按五要件重新立项**（Georgia Tech/NYS 惯例：过期=失效=重新申请）；低风险档挂到各自下一次复审事件自然升级。回填工作量被摊到既有复审节奏上，无需专门批次。

### atomcode > 5) 信息缺口
## 5) 信息缺口

- **(a)** 未见针对“纯机制性卫生债（枚举/常量归一）”这类**零利息**债务的专门排期研究——real-options 模型覆盖“有利息债务”与“toxic 债务”，零利息 hygiene 债是最弱情形，结论（挂账+触发器）由排除法得出而非直接实证。
- **(b)** “grandfather 带到期日”在安全例外档案（区别于系统认证/建筑规范）里的直接机构先例未找到完全同构者——Georgia Tech/NYS 提供的是“到期强制重审”的一半，另一半（旧档格式迁移）借自建筑/合规认证的类比。
- Tavily 引擎因额度耗尽未能参与交叉验证；(a) 的两条核心结论各有 ≥2 独立信源但来自 Exa+AnySearch+直接抓取，第三引擎缺位。
- “40% 过期例外”统计出自 decryptiondigest 一家转述，未找到原始出处（可能是某 GRC 厂商调查），引用时应标明为二手数据。
[warning] 正在以管理员权限运行 — 模型可能可以访问系统文件。

继续此会话，运行：atomcode -p "…" --resume 7492d349-15b9-4cbe-8e98-1b1588cabb54

## exception expiry

### atomcode
# atomcode

$ atomcode -p "两个治理问题调研：(a) 内部建制/技术债批次的开启判据——一批'机制建制'工作（枚举台账建制/常量归一/reserved 机制）无紧迫消费者、关联缺口台账已全部分诊值守，且外部刚批评'内部建制投入倒挂用户价值'；原定'执行窗空后再裁'现已空。应(i)窗口空即排进 (ii)续挂账等下个审计窗 (iii)钉事件触发器(GAP恶化/新同型需求)而非日历？调研平台工程/技术债排程先例——什么信号令内部机制批值得开工。(b) risk-acceptance 档案标准从三要素(理由+补偿控制+复评触发)升级到工业五要件(判据引用+justification+补偿控制+具名裁者+到期日+到期复审)：应全局升级(旧标revised+新标)、局部个案、还是升级+回填历史档？调研 exception expiry/recertification cadence/例外永久化审计失败先例与标准升级的 grandfather-vs-retrofit 惯例。给推荐与理由。"

先召回知识库历史调研，再启动三引擎联网调研。知识库已命中 (b) 的三源五要件材料（R80 Q2 批次）和 ADR-0035 分级复审先例；对 (a) 的"开工信号"和 (b) 的 grandfather-vs-retrofit 惯例还需联网补强。现在三引擎并行检索。Tavily 配额耗尽，改用 Exa + AnySearch 双引擎继续。现在定点深读高价值原文并补查 (b) 标准升级惯例。继续定点深挖：抓取真实期权论文、平台时机文章、FedRAMP 基线升级惯例及例外复审原文。# 治理双问题调研报告

**Sufficiency Gate**：searches: 8（web_search ×2、anysearch ×3 组、tavily ×2 额度耗尽失败——改用 anysearch 补位）| angles: Official / Comparative / Criticism / Currency / Community（5 类全覆盖）| full reads: 6（thehardparts.dev、mountaingoatsoftware、arxiv 2608.16112、michael-ploed.com、insightassurance、gatech policylibrary）+ 知识库召回 2 批历史已读原文（R80 Q2 五要件三源、ADR-0035）| gaps: 见文末。

### atomcode > 4) 完整来源清单
## 4) 完整来源清单

| # | 标题 | URL | 角度 | 日期 | 贡献 |
|---|---|---|---|---|---|
| 1 | Strategic Technical Debt: A Real Options Approach (arXiv 2608.16112) | arxiv.org/html/2608.16112v1 | Official | 2026-08-16 | 偿还时机理论：最优偿还集中事件边界；toxic/strategic 债务分界；“利息>折现才提前还”阈值 |
| 2 | Platform Before Product (FM-11) | thehardparts.dev/failure-modes/platform-before-product | Criticism | — | 无需求建制的完整失败模式谱系；“<2 确认用例即停建”；Early/Mid/Late 预警信号 |
| 3 | Platform Timing Is a Strategic Decision (Michael Plöd) | michael-ploed.com/blog/platform-timing-is-a-strategic-decision | Official/Criticism | 2026-05 | 四时机信号（"Nobody is pulling for it"最常被无视）；先协作后抽象、thinnest viable |
| 4 | Three Strategies for Fitting Refactoring into Sprints (Mountain Goat) | mountaingoatsoftware.com/agile/three-strategies-for-fitting-refactoring-into-your-sprints | Comparative | 2021-03（更新 2024-07） | 三种排期法利弊；欠债即钉偿还事件优于固定日历/随机扫尾 |
| 5 | Policy Exceptions (Georgia Tech) | s1.policylibrary.gatech.edu/information-technology/policy-exceptions | Official | 2010-07（复审 2025-11） | 具名三方签核、≤1 年、无补偿控制不批——五要件的机构化实例 |
| 6 | NYS ITS P13-001 Security Exception Policy | its.ny.gov/system/files/documents/2023/01/nys-p13-001...pdf | Official | 2023-01 | **关键条款：引用标准修订→GRC 须复审全部 in-force 例外**；延期同级审批；30 天预警 |
| 7 | FedRAMP Controls: Baselines and Proposed Changes (Insight Assurance) | insightassurance.com/insights/blog/fedramp-controls-baselines-and-proposed-changes/ | Official/Currency | 2026-07-06 | Rev5→Rev6/20x 过渡形态：向前生效+过渡窗，不追溯重评 |
| 8 | Code Upgrades and Grandfathering (J.S. Held) | jsheld.com/insights/articles/code-upgrades-and-grandfathering-lessons-learned... | Comparative | 2026-05-14 | grandfather 惯例：触发事件（翻新）强制按新规范重评 |
| 9 | 知识库 R80 Q2 批次（cybersecurity101 / decryptiondigest / grcopilot 已读原文） | （前会话索引） | Official/Criticism | 2026-05~07 | 五要件三源一致；90 天上限；40% 过期例外统计；open-ended = silent policy change |
| 10 | 知识库 ADR-0035（Deferred Registry Cadence Ladder） | （本仓） | Official | 2026-09 | 本仓已有 fail-closed review_at + 分级复审先例；batch 派日期是最坏情况——对 (a)(b) 均为内部先例 |

### atomcode > 2) 分点结论 > (b) risk-acceptance 档案五要件升级的落地方式
### (b) risk-acceptance 档案五要件升级的落地方式

**结论 B1：五要件是收敛标准，全局升级有充分依据 — Confidence 高**
- 本会话知识库（R80 Q2 批次）已全文核验三独立源给出同一五要件；90 天为通行上限、续期需新证据而非复制批准、open-ended exception = 未申报的政策变更。
- 本轮新增佐证：Georgia Tech 官方政策（具名三方签核 OIT-IS+IA+Unit Lead、最长 1 年、到期终止或重审）；NYS ITS P13-001（CISO 或授权人批、固定期限、延期需同级别审批、30 天到期预警、失联即失效）。

**结论 B2：标准变更时应复审受影响的 in-force 档——但“复审”≠“重做” — Confidence 中高**
- NYS 例外政策原文明确：**当被引用的 Policy/Standard 被修订时，GRC 须复审所有 in-force 例外评估影响**——这直接支持“旧标准修订 → 活跃档要过一遍”，但复审动作是评估影响、按需升级，不是整批推倒重填。
- FedRAMP Rev5 → 2026 Consolidated Rules/20x 过渡：CSP“按今日 Rev5 运作、同时准备下一版”，标签变而实质审查不变——即**向前生效 + 过渡窗**，无追溯重评要求。
- 建筑规范 grandfathering 惯例（J.S. Held）：老建筑豁免新规，但**在下一个触发事件（翻新/重建）时强制按新规范评估**，并有固定复审周期。

**结论 B3：拒绝“局部个案”——双轨档案是审计失败的结构性成因 — Confidence 高**
- decryptiondigest 统计：做例外审计的组织中 40% 发现已过期未经复审的例外。其成因恰是档案要素不齐（无到期日/无具名裁者）导致“记档即遗忘”。
- 若只对个案升级，新旧两套要素标准并存，审计时无法区分“三要素档”是历史遗留还是当前默许——这正是 R80 Q2 已指认的静默永续失败模式。

## grandfather retrofit

### atomcode
# atomcode

$ atomcode -p "两个治理问题调研：(a) 内部建制/技术债批次的开启判据——一批'机制建制'工作（枚举台账建制/常量归一/reserved 机制）无紧迫消费者、关联缺口台账已全部分诊值守，且外部刚批评'内部建制投入倒挂用户价值'；原定'执行窗空后再裁'现已空。应(i)窗口空即排进 (ii)续挂账等下个审计窗 (iii)钉事件触发器(GAP恶化/新同型需求)而非日历？调研平台工程/技术债排程先例——什么信号令内部机制批值得开工。(b) risk-acceptance 档案标准从三要素(理由+补偿控制+复评触发)升级到工业五要件(判据引用+justification+补偿控制+具名裁者+到期日+到期复审)：应全局升级(旧标revised+新标)、局部个案、还是升级+回填历史档？调研 exception expiry/recertification cadence/例外永久化审计失败先例与标准升级的 grandfather-vs-retrofit 惯例。给推荐与理由。"

先召回知识库历史调研，再启动三引擎联网调研。知识库已命中 (b) 的三源五要件材料（R80 Q2 批次）和 ADR-0035 分级复审先例；对 (a) 的"开工信号"和 (b) 的 grandfather-vs-retrofit 惯例还需联网补强。现在三引擎并行检索。Tavily 配额耗尽，改用 Exa + AnySearch 双引擎继续。现在定点深读高价值原文并补查 (b) 标准升级惯例。继续定点深挖：抓取真实期权论文、平台时机文章、FedRAMP 基线升级惯例及例外复审原文。# 治理双问题调研报告

**Sufficiency Gate**：searches: 8（web_search ×2、anysearch ×3 组、tavily ×2 额度耗尽失败——改用 anysearch 补位）| angles: Official / Comparative / Criticism / Currency / Community（5 类全覆盖）| full reads: 6（thehardparts.dev、mountaingoatsoftware、arxiv 2608.16112、michael-ploed.com、insightassurance、gatech policylibrary）+ 知识库召回 2 批历史已读原文（R80 Q2 五要件三源、ADR-0035）| gaps: 见文末。

### atomcode > 1) 执行摘要（Tl;dr）
## 1) 执行摘要（Tl;dr）

**(a)** **推荐 (iii) 为主、(ii) 为持有态，明确拒绝 (i)。**「执行窗空了」只是容量条件满足，不是开工信号——外部批评指出的正是“容量空了就拿内部建制填”，而窗口空即排入恰好把这个倒挂制度化。先例一致表明：低消费方、低“利息”的机制性工作是典型的**事件触发型债务**（real-options：最优偿还集中在承诺边界/事件处，而非日历处；platform-before-product 失败模式：“少于两个已确认用例就停建”）。正确做法：挂账 + 钉死可核验的事件触发器（GAP 恶化、新同型需求、第二个消费者出现），可选加一条“小额定额 + 触发器已点火”的容量兜底。

**(b)** **推荐“全局升级 + 带到期日的 grandfather 回填”，拒绝纯个案与一次性全量回填。**五要件（判据引用 + justification + 补偿控制 + 具名裁者 + 到期日）是三源一致的收敛标准（本会话知识库 R80 Q2 已核验 cybersecurity101 / decryptiondigest / grcopilot 原文，本轮又获 Georgia Tech、NYS ITS 佐证）。行业标准升级惯例是“向前全局生效 + 旧档标注 legacy 并挂到下一次复审事件强制升级”，而非冻结部分个案（双轨档案正是 40% 过期例外审计失败的结构性成因），也不是立即重做全部历史档（FedRAMP Rev5→Rev6 过渡即此形态）。**Confidence：两题均高**——(a) 有 4 个独立信源交叉；(b) 五要件有 5+ 独立信源，grandfather 惯例有 3 个领域（合规认证/建筑规范/FedRAMP）同构证据。

### atomcode > 4) 完整来源清单
## 4) 完整来源清单

| # | 标题 | URL | 角度 | 日期 | 贡献 |
|---|---|---|---|---|---|
| 1 | Strategic Technical Debt: A Real Options Approach (arXiv 2608.16112) | arxiv.org/html/2608.16112v1 | Official | 2026-08-16 | 偿还时机理论：最优偿还集中事件边界；toxic/strategic 债务分界；“利息>折现才提前还”阈值 |
| 2 | Platform Before Product (FM-11) | thehardparts.dev/failure-modes/platform-before-product | Criticism | — | 无需求建制的完整失败模式谱系；“<2 确认用例即停建”；Early/Mid/Late 预警信号 |
| 3 | Platform Timing Is a Strategic Decision (Michael Plöd) | michael-ploed.com/blog/platform-timing-is-a-strategic-decision | Official/Criticism | 2026-05 | 四时机信号（"Nobody is pulling for it"最常被无视）；先协作后抽象、thinnest viable |
| 4 | Three Strategies for Fitting Refactoring into Sprints (Mountain Goat) | mountaingoatsoftware.com/agile/three-strategies-for-fitting-refactoring-into-your-sprints | Comparative | 2021-03（更新 2024-07） | 三种排期法利弊；欠债即钉偿还事件优于固定日历/随机扫尾 |
| 5 | Policy Exceptions (Georgia Tech) | s1.policylibrary.gatech.edu/information-technology/policy-exceptions | Official | 2010-07（复审 2025-11） | 具名三方签核、≤1 年、无补偿控制不批——五要件的机构化实例 |
| 6 | NYS ITS P13-001 Security Exception Policy | its.ny.gov/system/files/documents/2023/01/nys-p13-001...pdf | Official | 2023-01 | **关键条款：引用标准修订→GRC 须复审全部 in-force 例外**；延期同级审批；30 天预警 |
| 7 | FedRAMP Controls: Baselines and Proposed Changes (Insight Assurance) | insightassurance.com/insights/blog/fedramp-controls-baselines-and-proposed-changes/ | Official/Currency | 2026-07-06 | Rev5→Rev6/20x 过渡形态：向前生效+过渡窗，不追溯重评 |
| 8 | Code Upgrades and Grandfathering (J.S. Held) | jsheld.com/insights/articles/code-upgrades-and-grandfathering-lessons-learned... | Comparative | 2026-05-14 | grandfather 惯例：触发事件（翻新）强制按新规范重评 |
| 9 | 知识库 R80 Q2 批次（cybersecurity101 / decryptiondigest / grcopilot 已读原文） | （前会话索引） | Official/Criticism | 2026-05~07 | 五要件三源一致；90 天上限；40% 过期例外统计；open-ended = silent policy change |
| 10 | 知识库 ADR-0035（Deferred Registry Cadence Ladder） | （本仓） | Official | 2026-09 | 本仓已有 fail-closed review_at + 分级复审先例；batch 派日期是最坏情况——对 (a)(b) 均为内部先例 |

## 具名裁者

### atomcode > 1) 执行摘要（Tl;dr）
## 1) 执行摘要（Tl;dr）

**(a)** **推荐 (iii) 为主、(ii) 为持有态，明确拒绝 (i)。**「执行窗空了」只是容量条件满足，不是开工信号——外部批评指出的正是“容量空了就拿内部建制填”，而窗口空即排入恰好把这个倒挂制度化。先例一致表明：低消费方、低“利息”的机制性工作是典型的**事件触发型债务**（real-options：最优偿还集中在承诺边界/事件处，而非日历处；platform-before-product 失败模式：“少于两个已确认用例就停建”）。正确做法：挂账 + 钉死可核验的事件触发器（GAP 恶化、新同型需求、第二个消费者出现），可选加一条“小额定额 + 触发器已点火”的容量兜底。

**(b)** **推荐“全局升级 + 带到期日的 grandfather 回填”，拒绝纯个案与一次性全量回填。**五要件（判据引用 + justification + 补偿控制 + 具名裁者 + 到期日）是三源一致的收敛标准（本会话知识库 R80 Q2 已核验 cybersecurity101 / decryptiondigest / grcopilot 原文，本轮又获 Georgia Tech、NYS ITS 佐证）。行业标准升级惯例是“向前全局生效 + 旧档标注 legacy 并挂到下一次复审事件强制升级”，而非冻结部分个案（双轨档案正是 40% 过期例外审计失败的结构性成因），也不是立即重做全部历史档（FedRAMP Rev5→Rev6 过渡即此形态）。**Confidence：两题均高**——(a) 有 4 个独立信源交叉；(b) 五要件有 5+ 独立信源，grandfather 惯例有 3 个领域（合规认证/建筑规范/FedRAMP）同构证据。

### atomcode
# atomcode

$ atomcode -p "两个治理问题调研：(a) 内部建制/技术债批次的开启判据——一批'机制建制'工作（枚举台账建制/常量归一/reserved 机制）无紧迫消费者、关联缺口台账已全部分诊值守，且外部刚批评'内部建制投入倒挂用户价值'；原定'执行窗空后再裁'现已空。应(i)窗口空即排进 (ii)续挂账等下个审计窗 (iii)钉事件触发器(GAP恶化/新同型需求)而非日历？调研平台工程/技术债排程先例——什么信号令内部机制批值得开工。(b) risk-acceptance 档案标准从三要素(理由+补偿控制+复评触发)升级到工业五要件(判据引用+justification+补偿控制+具名裁者+到期日+到期复审)：应全局升级(旧标revised+新标)、局部个案、还是升级+回填历史档？调研 exception expiry/recertification cadence/例外永久化审计失败先例与标准升级的 grandfather-vs-retrofit 惯例。给推荐与理由。"

先召回知识库历史调研，再启动三引擎联网调研。知识库已命中 (b) 的三源五要件材料（R80 Q2 批次）和 ADR-0035 分级复审先例；对 (a) 的"开工信号"和 (b) 的 grandfather-vs-retrofit 惯例还需联网补强。现在三引擎并行检索。Tavily 配额耗尽，改用 Exa + AnySearch 双引擎继续。现在定点深读高价值原文并补查 (b) 标准升级惯例。继续定点深挖：抓取真实期权论文、平台时机文章、FedRAMP 基线升级惯例及例外复审原文。# 治理双问题调研报告

**Sufficiency Gate**：searches: 8（web_search ×2、anysearch ×3 组、tavily ×2 额度耗尽失败——改用 anysearch 补位）| angles: Official / Comparative / Criticism / Currency / Community（5 类全覆盖）| full reads: 6（thehardparts.dev、mountaingoatsoftware、arxiv 2608.16112、michael-ploed.com、insightassurance、gatech policylibrary）+ 知识库召回 2 批历史已读原文（R80 Q2 五要件三源、ADR-0035）| gaps: 见文末。

### atomcode > 2) 分点结论 > (b) risk-acceptance 档案五要件升级的落地方式
### (b) risk-acceptance 档案五要件升级的落地方式

**结论 B1：五要件是收敛标准，全局升级有充分依据 — Confidence 高**
- 本会话知识库（R80 Q2 批次）已全文核验三独立源给出同一五要件；90 天为通行上限、续期需新证据而非复制批准、open-ended exception = 未申报的政策变更。
- 本轮新增佐证：Georgia Tech 官方政策（具名三方签核 OIT-IS+IA+Unit Lead、最长 1 年、到期终止或重审）；NYS ITS P13-001（CISO 或授权人批、固定期限、延期需同级别审批、30 天到期预警、失联即失效）。

**结论 B2：标准变更时应复审受影响的 in-force 档——但“复审”≠“重做” — Confidence 中高**
- NYS 例外政策原文明确：**当被引用的 Policy/Standard 被修订时，GRC 须复审所有 in-force 例外评估影响**——这直接支持“旧标准修订 → 活跃档要过一遍”，但复审动作是评估影响、按需升级，不是整批推倒重填。
- FedRAMP Rev5 → 2026 Consolidated Rules/20x 过渡：CSP“按今日 Rev5 运作、同时准备下一版”，标签变而实质审查不变——即**向前生效 + 过渡窗**，无追溯重评要求。
- 建筑规范 grandfathering 惯例（J.S. Held）：老建筑豁免新规，但**在下一个触发事件（翻新/重建）时强制按新规范评估**，并有固定复审周期。

**结论 B3：拒绝“局部个案”——双轨档案是审计失败的结构性成因 — Confidence 高**
- decryptiondigest 统计：做例外审计的组织中 40% 发现已过期未经复审的例外。其成因恰是档案要素不齐（无到期日/无具名裁者）导致“记档即遗忘”。
- 若只对个案升级，新旧两套要素标准并存，审计时无法区分“三要素档”是历史遗留还是当前默许——这正是 R80 Q2 已指认的静默永续失败模式。

## 事件触发

### atomcode > 1) 执行摘要（Tl;dr）
## 1) 执行摘要（Tl;dr）

**(a)** **推荐 (iii) 为主、(ii) 为持有态，明确拒绝 (i)。**「执行窗空了」只是容量条件满足，不是开工信号——外部批评指出的正是“容量空了就拿内部建制填”，而窗口空即排入恰好把这个倒挂制度化。先例一致表明：低消费方、低“利息”的机制性工作是典型的**事件触发型债务**（real-options：最优偿还集中在承诺边界/事件处，而非日历处；platform-before-product 失败模式：“少于两个已确认用例就停建”）。正确做法：挂账 + 钉死可核验的事件触发器（GAP 恶化、新同型需求、第二个消费者出现），可选加一条“小额定额 + 触发器已点火”的容量兜底。

**(b)** **推荐“全局升级 + 带到期日的 grandfather 回填”，拒绝纯个案与一次性全量回填。**五要件（判据引用 + justification + 补偿控制 + 具名裁者 + 到期日）是三源一致的收敛标准（本会话知识库 R80 Q2 已核验 cybersecurity101 / decryptiondigest / grcopilot 原文，本轮又获 Georgia Tech、NYS ITS 佐证）。行业标准升级惯例是“向前全局生效 + 旧档标注 legacy 并挂到下一次复审事件强制升级”，而非冻结部分个案（双轨档案正是 40% 过期例外审计失败的结构性成因），也不是立即重做全部历史档（FedRAMP Rev5→Rev6 过渡即此形态）。**Confidence：两题均高**——(a) 有 4 个独立信源交叉；(b) 五要件有 5+ 独立信源，grandfather 惯例有 3 个领域（合规认证/建筑规范/FedRAMP）同构证据。

### atomcode > 3) 对比矩阵 > (a) 开工判据三选项
### (a) 开工判据三选项

| 选项 | 先例支持 | 与外部批评的关系 | 主要风险 | 判定 |
|---|---|---|---|---|
| (i) 窗口空即排 | Mountain Goat：固定容量法“总有时期不适合”；real-options：利息≈0 不该提前行权 | **恰好把倒挂制度化**（容量空=自动填内部活） | 建成无人用、维护负债（FM-11 Late 期症状） | ❌ |
| (ii) 续挂账等下个审计窗 | technical backlog 法可行但“难坚持、可数月停滞” | 不加剧倒挂 | 无触发器则永久沉底 | ⚠️ 半对 |
| (iii) 钉事件触发器 | real-options：事件边界行权最优；FM-11："two confirmed use cases"；ADR-0035 已有同构先例 | 正面回应批评（需求pull 才动工） | 需定义可核验阈值+检查点 | ✅ 推荐（ii 为持有态） |

### atomcode
# atomcode

$ atomcode -p "两个治理问题调研：(a) 内部建制/技术债批次的开启判据——一批'机制建制'工作（枚举台账建制/常量归一/reserved 机制）无紧迫消费者、关联缺口台账已全部分诊值守，且外部刚批评'内部建制投入倒挂用户价值'；原定'执行窗空后再裁'现已空。应(i)窗口空即排进 (ii)续挂账等下个审计窗 (iii)钉事件触发器(GAP恶化/新同型需求)而非日历？调研平台工程/技术债排程先例——什么信号令内部机制批值得开工。(b) risk-acceptance 档案标准从三要素(理由+补偿控制+复评触发)升级到工业五要件(判据引用+justification+补偿控制+具名裁者+到期日+到期复审)：应全局升级(旧标revised+新标)、局部个案、还是升级+回填历史档？调研 exception expiry/recertification cadence/例外永久化审计失败先例与标准升级的 grandfather-vs-retrofit 惯例。给推荐与理由。"

先召回知识库历史调研，再启动三引擎联网调研。知识库已命中 (b) 的三源五要件材料（R80 Q2 批次）和 ADR-0035 分级复审先例；对 (a) 的"开工信号"和 (b) 的 grandfather-vs-retrofit 惯例还需联网补强。现在三引擎并行检索。Tavily 配额耗尽，改用 Exa + AnySearch 双引擎继续。现在定点深读高价值原文并补查 (b) 标准升级惯例。继续定点深挖：抓取真实期权论文、平台时机文章、FedRAMP 基线升级惯例及例外复审原文。# 治理双问题调研报告

**Sufficiency Gate**：searches: 8（web_search ×2、anysearch ×3 组、tavily ×2 额度耗尽失败——改用 anysearch 补位）| angles: Official / Comparative / Criticism / Currency / Community（5 类全覆盖）| full reads: 6（thehardparts.dev、mountaingoatsoftware、arxiv 2608.16112、michael-ploed.com、insightassurance、gatech policylibrary）+ 知识库召回 2 批历史已读原文（R80 Q2 五要件三源、ADR-0035）| gaps: 见文末。


> **Tip:** Results are scoped to this batch only. To search across all indexed sources, use `ctx_search(queries: [...])` or call ctx_batch_execute with `query_scope: "global"`.

Searchable terms for follow-up: review_at, risk-acceptance, justification, mountaingoatsoftware, michael-ploed, insightassurance, policylibrary, platform-before-product, 少于两个已确认用例就停建, cybersecurity101, grandfathering, thehardparts, real-options, decryptiondigest, comparative, fail-closed, open-ended, 续挂账等下个审计窗, anysearch, criticism, grcopilot, atomcode, reserved, official, currency, platform, cadence, hygiene, product, michael, 2026-05, pulling, backlog, p13-001, 钉事件触发器, 分级复审先例, tavily, gatech, 本会话知识库, legacy
