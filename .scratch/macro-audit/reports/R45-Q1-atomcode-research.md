# R45-Q1 atomcode 调研存档（轮45 grill Q1，2026-09-29）

> 题面存档：R45-Q1-research-prompt.md；调研经 ctx_batch_execute 单发（concurrency:1，Tavily 限额触发自动转 Exa+AnySearch 双引擎）。以下为 atomcode stdout 原文节录（索引节重排，未改写结论）。

## 1) 执行摘要（Tl;dr）

成熟工业界的共识心智模型是：**风险接受/例外默认必须 time-bound（日历到期 + 到期复审钩），事件触发只能作为「提前重开」的补充锚点，不能作为唯一的到期机制**（ISC2、NIST RA-4、主流工具的 Expires In 字段均如此，Confidence：高）。wontfix 类终局决策与缓期类例外**应有分类差异**——前者接受的是「事实/设计决策」，基座不随时间腐化，事件制到期在严格限权下可被追认；后者的基座（补偿控制、威胁假设）必然漂移，日历兜底是防例外永久化与控制静默腐化的**必要构件**（Confidence：高）。据此推荐：**裁定 (iii) 分类立法为主体，并以 (i) 的「词条澄清 + grandfathered 追认」处理两件旧档**，不推荐 (ii) 的一刀切双锚。

## 2) 分点结论

**① 纯事件触发型复评不是合规的独立到期机制。**
- ISC2 GRC 指引（2025-05）：「every exception must be time-bound… Never permit indefinite exceptions；若需求是长期性的，选一个最大时长（通常 6 或 12 个月）并设 end date」。事件触发被其归入 **monitoring**（第五要素），而非 time（第四要素）——即事件是复审触发器，不是到期语义的载体。
- NIST SP 800-53 RA-4 的操作化解读明确要求**双通道**：「Scheduled refresh（定义的周期窗口）+ Event-driven updates（触发器清单）」，并警告「Annual-only refresh with no event triggers」和「只有事件没有周期」都会 fail——两个方向都缺一不可。
- 主流工具事实标准：Sysdig Risk Acceptance 的强制字段就是 `Expires In`（纯日历 TTL，到期 enforcement 自动恢复）；风险接受模板实践（90/180/365 天分级上限）同样是「日历到期 + 事件复审触发（CVSS 升级、补偿控制移除、在野利用出现）」的分层写法。**结论：事件触发是合法且必要的「提前到期」通道，但日历兜底是唯一被普遍承认的保底到期机制。**

**② 日历兜底是防例外永久化/静默腐化的必要构件，理由是「基座漂移不可观测」。**
- grais 对 temporary-workaround / normalization-of-deviance 研究的综述：例外扩散的机制正是「团队只命名了捷径，没命名结束条件」——「a date, event, or checkpoint」才算 expiry condition，但纯事件制的致命弱点在于**事件可能永不来、且无法证明它没来**（负面事实不可审计），例外因此事实性永久化。
- 依赖具体代码路径存续的补偿控制属于**静默腐化型**：NIST RA-4 把「significant control changes」列为强制更新触发器，但触发器依赖事件被上报——代码重构删除一条路径不会产生任何事件。这正是审计实务（ISO 27001 RTP 审计模板：「without expiry → Fix: every acceptance needs an expiry」）强制日历复审的原因：日历兜底是**唯一不依赖任何人自觉上报的腐化探测点**。风险接受模板文献同样把「compensating controls are still in place and functioning」列为续期时必须重新验证的第一项——没有日历，就没有验证时刻。
- CISA 2026 风险分级修补指令（CCI 评述）虽把「延缓修补」正当化，但其合规性完全建立在「what was deferred, against which criteria, signed off by whom and **reviewed when**」的可审计记录上——reviewed when 的默认实现就是日历复审点。

**③ wontfix 终局决策与缓期例外应有分类的到期语义差异。**
- 分类学上两者本体不同：缓期类例外接受的是一个**会漂移的残余风险状态**（补偿控制、威胁画像、业务假设都是时间的函数）；wontfix 类接受的是一个**设计事实**（「该告警为 false positive / 该路径不可达 / 该行为是产品契约」），其成立条件不随时间衰减——腐蚀它的只能是**事件**（架构变更、误报前提失效）而非时间流逝。
- 工具惯例佐证分类处理：GitHub code scanning 的 dismiss（含 `won't fix` 理由）是**无 TTL 的终局裁定**，与 Dependabot auto-dismiss false positive 一致——false positive/ wontfix 类不需要日历续期，但 dismiss 记录是可追溯的且可被人工重开；Sysdig 把 `Risk Not Relevant` / `Risk Mitigated`（前者更接近 wontfix，后者必须 Expires In）区分为不同 reason 类别。
- 因此合理立法：**基座不随时间腐化（wontfix/不可利用的事实性判据）→ 事件制到期合法，但须附加年度低频盘查兜底**（ISO 27001 clause 9.3 管理评审本就要求对 ISMS 输出做周期评审，这给了终局决策一个便宜的审计钩，不构成复审负担）；**基座会腐化（补偿控制、临时缓解）→ min(事件, ≤90d/风险分级) 双锚强制**。

**④ 旧档（grandfathered）处置。**
- 审计心智模型对存量记录的态度是「追认 + 补强」，不追溯废除：记录存在即比记录缺失强（CCI：「scanner backlog without documentation is a liability on its own」）；到期过期无续期记录 = 「functionally equivalent to no risk acceptance at all」。正确动作是按新五要件**呈报重批**（grandfathered ≠ 免检，而是降级为「待补强」），补偿控制依赖代码路径的那件属于腐化型，必须补日历兜底；wontfix 重申的那件按分类立法可直接追认为事件制合法形态。

## 3) 对比矩阵（三候选裁定）

| 项 | 到期语义 | 符合工业共识 | 主要风险 |
|---|---|---|---|
| (i) 事件制到期追认（词条澄清） | 事件触发 = 唯一到期锚 | ✗ 与 ISC2/NIST/工具标准的 time-bound 默认冲突 | 「事件未发生」不可审计，例外事实性永久化；依赖代码路径的补偿控制静默腐化无探测点；审计出具 finding 的概率高 |
| (ii) 全量统一双锚 min(事件, ≤90d) | 一刀切日历兜底 | 部分符合（对缓期类正确） | 对 wontfix/恒久类制造无意义复审噪声，诱导「橡皮图章式续期」（renewal without re-verification 在审计框架下无效），稀释登记册信噪比与批准人注意力 |
| (iii) 分类立法：事件制合法仅当触发事件为在册可核验哨兵 且 基座不腐化；其余日历兜底 | 按风险本体分类的到期语义 | ✓ 与 NIST 双通道 + 工具分类 reason 的实践同构 | 立法复杂度最高：需维护「哨兵事件白名单」（触发器必须是可 ticket 化的在册事件，RA-4 要求触发器绑定既有工作流）；分类边界争议（何为「基座不腐化」）需裁量细则，否则成为规避 90 天上限的漏洞 |

## 4) 推荐裁定与理由

**推荐 (iii) 为主体，吸收 (i) 作为执行路径：**

1. **立法层采纳 (iii)**：写入登记册词条——(a) 缓期类例外（含一切依赖补偿控制存续的接受）：强制 min(事件先到, ≤90d 分级日历兜底) 双锚，到期未复审即自动失效升级；(b) wontfix/事实判据类：事件制到期合法，但触发事件必须是**在册可核验哨兵**（绑定 ticket/CI/告警等既有工作流，满足 RA-4「trigger 落在已有流程」的可审计标准），并保留年度管理评审盘查作为低频兜底。
2. **旧档处置**：补偿控制依赖代码路径存续的那件——按 (iii) 判定为腐化型，**补 90 天日历兜底并呈报重批**（升五要件），同时为该代码路径建立哨兵（路径删除/重构即触发重开）；wontfix 重申的那件——按 (iii) 追认为事件制合法形态，仅需在词条中补充哨兵事件的可核验性说明，**无需日历重批**。
3. **不采纳 (ii)**：全量双锚把复审成本浪费在基座不漂移的记录上，会产生机械续期，反而摧毁登记册的审计可信度。

关键裁决依据归纳：事件锚解决「早知道」（威胁/利用面变化要当天反应），日历锚解决「必知道」（腐化与遗忘不依赖自觉上报）——工业界对两者的定位从来不是二选一，而是**事件为准、日历保底**；唯二的例外空间是 wontfix 终局类（时间不是其风险的变量）与审计要求的周期盘查兜底。

## 5) 完整来源清单

| 标题 | URL | 角度 | 日期 | 贡献 |
|---|---|---|---|---|
| ISC2: GRC and Exception Handling | https://www.isc2.org/Insights/2025/05/GRC-and-Exception-Handling | Official | 2025-05-27 | 「every exception must be time-bound / never indefinite / 6-12 个月上限 / 事件归入 monitoring」核心论据 |
| Risk Acceptance for Vulnerabilities (Sysdig 文档) | https://docs.sysdig.com/en/sysdig-secure/vulnerabilities/accepted-risk/ | Official | 未标注 | 工业工具事实标准：Expires In 强制字段 + reason 分类（Risk Mitigated vs Risk Not Relevant）|
| NIST SP 800-53 RA-4 操作化解读 (Daydream) | https://learn.daydream.ai/requirements/nist-sp-800-53-n80053-724 | Official | 2026-02 核验 | 「scheduled refresh + event-driven triggers 双通道」、触发器必须 ticket 化绑定既有工作流 |
| Deferred, Not Ignored (CCI / Hexnode) | https://www.corporatecomplianceinsights.com/deferred-not-ignored-explaining-unpatched-vulnerabilities-your-auditor/ | Currency | 2026-09-07 | CISA 风险分级修补：延缓正当化但必须有 owner/criteria/signed off/reviewed when |
| 风险接受七字段模板（搜索引擎索引全文） | 经 Exa 检索获取 | Official/实践 | 2026 | 90/180/365 分级上限、到期 = 「事件先到或日历日先到 whichever is sooner」句式、续期必须重新验证补偿控制 |
| grais: State the expiry condition before a temporary exception spreads | https://grais.ai/research/state-the-expiry-condition-before-a-temporary-exception-spreads | Criticism/Community | 未标注 | normalization-of-deviance 机制：例外扩散 = 只命名捷径不命名结束条件；date/event/checkpoint 三形态 |
| ISO/IEC JTC1 SC27 WG1 N3298 SoA 审计实践注记 | https://committee.iso.org/files/live/sites/jtc1sc27/files/resources/ISO-IECJTC1-SC27-WG1_N3298_Auditing%20Practices%20Note%20-%20SoA.pdf | Official | 未标注 | ISO 侧例外/排除的记录与 justification 审计口径 |
| ISO 27001 Risk Treatment Plan 模板 (CanadianCyber) | https://canadiancyber.ca/iso-27001-risk-treatment-plan-template-audit-ready/ | Official | 2026-03-17 | 「without expiry → Fix: every acceptance needs an expiry」；exception 字段 = reason+补偿控制+expiry/review date+具名 approver |
| GitHub docs: Resolving code scanning alerts | https://docs.github.com/en/code-security/how-tos/manage-security-alerts/manage-code-scanning-alerts/resolve-alerts | Community/Official | 未标注 | dismiss（won't fix/false positive）= 无 TTL 终局裁定 + 可重开的分类惯例 |
| CISA/KEV 修补率与风险分级背景（CCI 文内引用） | 同 CCI 条目 | Currency | 2026 | 26% critical KEV 修复率 → 缓期常态化使「reviewed when」成为审计焦点 |

## 6) 信息缺口（如实标注）

- 无权威标准明文规定「wontfix 豁免日历兜底」——该点由 GitHub dismiss/Dependabot/Sysdig reason 分类惯例与 ISO 审计模板推证，属**中置信推断**。
- 调研配额自查：searches=7（web_search×3 / anysearch×4，Tavily 限额转双引擎）；角度=Official+Criticism+Comparative+Currency+Community 五面；全文精读=6。

## 辩证比对注记（呈报侧）

- 调研推荐 (iii)+(i) 混合——与本裁 (iii) 候选同向，但带两处超出题面候选的精化：①wontfix 事件制豁免须附低频盘查兜底钩（非纯事件无界）；②r1 被明判腐化型须补日历兜底＋（可选）代码路径哨兵。
- 冲突面：采纳 (iii) = D-169-b②「到期日≤90d」普适条款收窄（wontfix 恒久类获事件制豁免）——按规程须标 revised 留原文＋新 D 承继。
