# R43-Q1 atomcode 调研报告存档——锐评终局裁定粒度

> 题面=`reports/R43-Q1-research-prompt.md`；引擎=Exa×3+AnySearch×4（Tavily 配额超限）＋8 次全文精读；angle=Official/Comparative/Criticism/Community。
> 以下为 ctx_batch_execute 索引输出原文归档（节序按 BM25 命中序，内容未裁剪）。

---

Executed 1 commands (58 lines, 10.1KB). Indexed 6 sections. Searched 6 queries.

## Commands

- atomcode: `atomcode -p "软件项目收到外部审计/评审报告（多条指控：部分已实证修复、部分属'裁定不采纳'的设计分歧、部分锚定到长期门槛判据仍开放）。当其中一条核心指控的验证判据刚刚转绿时，终局结案裁定应该用哪种粒度：(i) 整批收口把整份评审标为已解决 (ii) 逐项双层收口——每条指控独立记裁定层(是否采纳/驳回)与验收层(修复是否实证)两态，含'裁定闭环-不采纳'终态与'保持验收开放锚长期判据' (iii) 推迟到长期门槛判据全齐再一次收口。请调研工业界成熟做法：审计 finding/缺陷的关闭粒度与权责（POA&M 项级 milestone 关闭、ISO 27001 不符合项纠正与跟踪审核、SOC2 exception 跨年管理、渗透测试 retest letter 逐项复测、FDA 483/Warning Letter 逐条回应、code review 逐条 resolve/驳回语义、安全公告/errata 生命周期），以及'整体结案 vs 逐项结案'的治理先例、部分驳回(partially accepted/partially disagreed)处置的成熟度实践、发现问题方…`

## Indexed Sections

- atomcode (2.3KB)
- atomcode > 1) 执行摘要（Tl;dr） (0.5KB)
- atomcode > 2) 分点结论 (3.2KB)
- atomcode > 3) 对比矩阵（三选项） (0.9KB)
- atomcode > 4) 完整来源清单 (2.3KB)
- atomcode > 5) 信息缺口 (0.9KB)

## POA&M item closure

### atomcode
# atomcode

$ atomcode -p "软件项目收到外部审计/评审报告（多条指控：部分已实证修复、部分属'裁定不采纳'的设计分歧、部分锚定到长期门槛判据仍开放）。当其中一条核心指控的验证判据刚刚转绿时，终局结案裁定应该用哪种粒度：(i) 整批收口把整份评审标为已解决 (ii) 逐项双层收口——每条指控独立记裁定层(是否采纳/驳回)与验收层(修复是否实证)两态，含'裁定闭环-不采纳'终态与'保持验收开放锚长期判据' (iii) 推迟到长期门槛判据全齐再一次收口。请调研工业界成熟做法：审计 finding/缺陷的关闭粒度与权责（POA&M 项级 milestone 关闭、ISO 27001 不符合项纠正与跟踪审核、SOC2 exception 跨年管理、渗透测试 retest letter 逐项复测、FDA 483/Warning Letter 逐条回应、code review 逐条 resolve/驳回语义、安全公告/errata 生命周期），以及'整体结案 vs 逐项结案'的治理先例、部分驳回(partially accepted/partially disagreed)处置的成熟度实践、发现问题方…

知识库已命中既有「Two-Layer Closure」语料（D-165），现在按配额联网三引擎交叉验证工业界先例。先发第一轮多角度搜索：继续第二轮：pentest retest、ISO 27001 不符合项、code review resolve 语义（Tavily 已超配额，改用 Exa+AnySearch 双引擎）。第一轮搜索完成（POA&M 逐项化、pentest retest 三态、ISO 10.2、SOC2 exception 均有候选源）。补搜「部分采纳/部分驳回」与 code review resolve 语义两个角度，同时定点打开原文验证：搜索配额已达成（6 查询、4 角度、三引擎）。现在定点深挖打开原文验证（满足 ≥6 次 full reads）：继续定点深挖，凑足 6 次全文核验（FDA 逐条回应、retest 模板、LLVM resolve RFC、ISO 双源）：配额自查：searches: 6（Exa×3、AnySearch×4、Tavily 因配额超限不可用，改由 AnySearch/Exa 双引擎交叉）| angles: Official + Comparative + Criticism + Community 四类 | full reads: 8（GSA POA&M、hackersmanifest retest、DataGuard ISO 10.2、URM ISO 10.2、DanClarke、LLVM RFC、greenlight FDA 483、auditflo SOC2/exception）| gaps: SOC2 跨年判例仅一家深读（有二手多源摘要佐证）、FDA March 2026 draft guidance 被 WAF 挡（用 greenlight+thefdablog 摘要替代）。

### atomcode > 2) 分点结论
## 2) 分点结论

1. **审计 finding 的关闭粒度天然是逐项的，整批关闭在工业界没有合法形态**。GSA POA&M 指南明文："All findings from audits become individual POA&Ms"、"All findings noted in the final report, including those that may have already been corrected, must be individually identified"——即使已修复也逐条登记，且条目不得从 POA&M 移除，只改状态（已完结项可过滤视图但记录保留以保可审计）。〔GSA CIO-IT-Security-09-44，官方〕
2. **每项关闭的判据是双层分离的**：ISO 27001 §10.2 要求对每个不符合项：纠正 → 根因 → 纠正措施 → **验证有效性**（follow-up audit / monitor），且"Simply closing a task isn't enough——You need evidence"〔DataGuard + URM 两源〕；SOC 2 例外管理同样要求 "Verify before close——Make verification evidence a hard gate"，并且 close 与 accept 是不同终态："Acceptance without an end date is not management. It is abandonment"〔auditflo〕。
3. **「部分驳回/部分异议」是成熟且被制度化的处置**：内部审计管理回应有四种独立范畴——同意并行动 / 同意发现但不同意建议（须给替代措施）/ 不同意证据（须陈述理由）/ 整体异议〔USP 内审指南〕；州审计后续报告逐条记录 "Agency agreed / partially agreed / disagrees"〔Michigan 审计报告〕；FDA 483 回应规范明文允许 dispute："If you dispute the 483 observation and support this with factual objective evidence, it is appropriate to point this out… should not simply ignore the claim"〔greenlight.guru〕。即：驳回是合法终态，但必须是**显式记录的独立裁定**，不允许被整批收口淹没。
4. **复测/验收是独立文书、逐项三态**：pentest retest letter 逐 finding 出 Remediated / Partially Remediated / Not Remediated 三态表 + 证据，不 retest 的项（accepted risk）单独列原因；"Not Remediated" 还要求如实记录"客户端声称已部署但实测未生效"的情形〔hackersmanifest 模板〕。修复验证方与被修复方权责分离同源：code review 中「谁点 resolve」的争议（LLVM RFC、Dan Clarke）结论一致——**作者不能替评审方 resolve**，评审方对验收层有最终判权；作者侧可用单独机制（Mark-as-Done/checklist）记裁定层处置。LLVM RFC 中 Phabricator 经验还实证了反面教训：作者点 done 但"regularly"并未实际修复——正是裁定层≠验收层的经验证据。
5. **验收层未达不阻碍报告结案、但要锚定长期判据继续跟踪**：POA&M 项允许跨月/跨年存续并要求 milestone 带完成日期，逾期即标 "delayed" 而非撤销；SOC 2 例外带 expiry + review date 跨年管理。即选项 (iii)「推迟到长期判据全齐」被否：**报告层面的结案不需要等验收全绿，但开放验收项必须带时点锚进入值守**——无限期等待正是 "accepted risk without end date" 的反面教材。
6. **知识库既有定稿（D-165 Two-Layer Closure）与本次六域外部调研完全一致**，可作为结案文法的直接依据：裁定层/验收层各一行分行声明，禁单句「已完成」。

### atomcode > 3) 对比矩阵（三选项）
## 3) 对比矩阵（三选项）

| 项 | 裁定层（采纳/驳回） | 验收层（修复实证） | 与工业界先例的偏差 |
|---|---|---|---|
| (i) 整批收口 | 被"整体已解决"稀释，部分驳回项无独立名分 | 未验条目被一次性抹平，绿一条全绿 | 违反 POA&M 逐项登记、FDA 逐条回应、GH 逐条 resolve 的全部先例；audit 会被 reopen |
| **(ii) 逐项双层收口** ✅ | 每条独立记采纳/显式驳回/值守/执行窗 | 每条独立记复绿与否；未绿的锚长期判据+时点，值守跟踪 | 与六域先例一致；绿的那条验收层闭环成立，其余条目裁定层先行闭环不豁免验收层 |
| (iii) 推迟到判据全齐 | 裁定被无限期悬置，驳回项也拿不到名分 | 长期判据=验收层判据，却反向绑架报告结案 | 等价于"无期限 acceptance"，违反 POA&M completion-date 纪律与 SOC2 expiry 原则 |

## finding disposition

### atomcode > 2) 分点结论
## 2) 分点结论

1. **审计 finding 的关闭粒度天然是逐项的，整批关闭在工业界没有合法形态**。GSA POA&M 指南明文："All findings from audits become individual POA&Ms"、"All findings noted in the final report, including those that may have already been corrected, must be individually identified"——即使已修复也逐条登记，且条目不得从 POA&M 移除，只改状态（已完结项可过滤视图但记录保留以保可审计）。〔GSA CIO-IT-Security-09-44，官方〕
2. **每项关闭的判据是双层分离的**：ISO 27001 §10.2 要求对每个不符合项：纠正 → 根因 → 纠正措施 → **验证有效性**（follow-up audit / monitor），且"Simply closing a task isn't enough——You need evidence"〔DataGuard + URM 两源〕；SOC 2 例外管理同样要求 "Verify before close——Make verification evidence a hard gate"，并且 close 与 accept 是不同终态："Acceptance without an end date is not management. It is abandonment"〔auditflo〕。
3. **「部分驳回/部分异议」是成熟且被制度化的处置**：内部审计管理回应有四种独立范畴——同意并行动 / 同意发现但不同意建议（须给替代措施）/ 不同意证据（须陈述理由）/ 整体异议〔USP 内审指南〕；州审计后续报告逐条记录 "Agency agreed / partially agreed / disagrees"〔Michigan 审计报告〕；FDA 483 回应规范明文允许 dispute："If you dispute the 483 observation and support this with factual objective evidence, it is appropriate to point this out… should not simply ignore the claim"〔greenlight.guru〕。即：驳回是合法终态，但必须是**显式记录的独立裁定**，不允许被整批收口淹没。
4. **复测/验收是独立文书、逐项三态**：pentest retest letter 逐 finding 出 Remediated / Partially Remediated / Not Remediated 三态表 + 证据，不 retest 的项（accepted risk）单独列原因；"Not Remediated" 还要求如实记录"客户端声称已部署但实测未生效"的情形〔hackersmanifest 模板〕。修复验证方与被修复方权责分离同源：code review 中「谁点 resolve」的争议（LLVM RFC、Dan Clarke）结论一致——**作者不能替评审方 resolve**，评审方对验收层有最终判权；作者侧可用单独机制（Mark-as-Done/checklist）记裁定层处置。LLVM RFC 中 Phabricator 经验还实证了反面教训：作者点 done 但"regularly"并未实际修复——正是裁定层≠验收层的经验证据。
5. **验收层未达不阻碍报告结案、但要锚定长期判据继续跟踪**：POA&M 项允许跨月/跨年存续并要求 milestone 带完成日期，逾期即标 "delayed" 而非撤销；SOC 2 例外带 expiry + review date 跨年管理。即选项 (iii)「推迟到长期判据全齐」被否：**报告层面的结案不需要等验收全绿，但开放验收项必须带时点锚进入值守**——无限期等待正是 "accepted risk without end date" 的反面教材。
6. **知识库既有定稿（D-165 Two-Layer Closure）与本次六域外部调研完全一致**，可作为结案文法的直接依据：裁定层/验收层各一行分行声明，禁单句「已完成」。

### atomcode > 4) 完整来源清单
## 4) 完整来源清单

| 来源 | URL | 角度 | 日期 | 贡献 |
|---|---|---|---|---|
| GSA POA&M 指南 CIO-IT-Security-09-44 | gsa.gov/…/Plan-of-Action-and-Milestones…pdf | Official | 2022-09 | 逐项登记强令、milestone+completion date、delayed 状态、条目不可移除 |
| NIST 800-53 CA-5 / PM-4 | csf.tools/reference/nist-sp-800-53/r5/ca/ca-5/ | Official | 2021-03 | POA&M 为 finding 级跟踪机制的规范出处 |
| Hackers Manifest Retest Report Template | hackersmanifest.com/reporting-templates/retest-report/ | Community | N/A | 逐 finding 三态（含 Partially Remediated）+ 独立 retest 文书 |
| DataGuard ISO 27001 §10.2 | dataguard.com/iso-27001/clause-10-2… | Official（厂商解读） | N/A | 逐项纠正→根因→验证有效性；close≠有证据 |
| URM Consulting §10.2 | urmconsulting.com/blog/iso-27001-clause-10-2… | Official（认证咨询） | 2026-06-17 | minor/major 分级、验证效果、常见错误 |
| auditflo Exception Management | auditflo.co/resources/exception-management-and-audit-findings-remediation | Comparative/方法论 | 2026-09-11 | SOC2 例外/finding/CAPA 分层、verify-before-close hard gate、acceptance 须带 end date |
| USP 内审回应指南 | usp.ac.fj/…/170821_IA_recommendations_guidance.pdf | Official | 2021 | 四类管理回应范畴（含同意发现不同意建议） |
| Michigan 审计后续报告 | audgen.michigan.gov/…/rs391057121F-92874.pdf | Official | 2025-07 | agreed/partially agreed/disagrees 逐条记录先例 |
| Greenlight Guru FDA 483 指南 | greenlight.guru/blog/fda-483-warning-letters | Official（行业权威） | 2026-01-13 | 逐 observation 回应、dispute 合法且须给事实证据、Completed/Planned 分列 |
| Dan Clarke: Who should resolve PR comments | danclarke.com/resolving-pr-comments/ | Community | 2022-05-27 | resolve 权在评审方；作者不能代 resolve |
| LLVM Discourse RFC: Resolve Conversation | discourse.llvm.org/t/rfc-github-pr-resolve-conversation-button/73178 | Community | 2023-09-01 | 双层机制先例（作者 Mark-done vs 评审 Resolve）；"regularly 未实际修复"实证 |
| 知识库 D-165 Two-Layer Closure（本会话 ctx_search） | CONTEXT.md / D-ledger | 本项目既有裁定 | 2026-09-28 | 与外部六域先例收敛的既有结论，可直接引用 |

### atomcode
# atomcode

$ atomcode -p "软件项目收到外部审计/评审报告（多条指控：部分已实证修复、部分属'裁定不采纳'的设计分歧、部分锚定到长期门槛判据仍开放）。当其中一条核心指控的验证判据刚刚转绿时，终局结案裁定应该用哪种粒度：(i) 整批收口把整份评审标为已解决 (ii) 逐项双层收口——每条指控独立记裁定层(是否采纳/驳回)与验收层(修复是否实证)两态，含'裁定闭环-不采纳'终态与'保持验收开放锚长期判据' (iii) 推迟到长期门槛判据全齐再一次收口。请调研工业界成熟做法：审计 finding/缺陷的关闭粒度与权责（POA&M 项级 milestone 关闭、ISO 27001 不符合项纠正与跟踪审核、SOC2 exception 跨年管理、渗透测试 retest letter 逐项复测、FDA 483/Warning Letter 逐条回应、code review 逐条 resolve/驳回语义、安全公告/errata 生命周期），以及'整体结案 vs 逐项结案'的治理先例、部分驳回(partially accepted/partially disagreed)处置的成熟度实践、发现问题方…

知识库已命中既有「Two-Layer Closure」语料（D-165），现在按配额联网三引擎交叉验证工业界先例。先发第一轮多角度搜索：继续第二轮：pentest retest、ISO 27001 不符合项、code review resolve 语义（Tavily 已超配额，改用 Exa+AnySearch 双引擎）。第一轮搜索完成（POA&M 逐项化、pentest retest 三态、ISO 10.2、SOC2 exception 均有候选源）。补搜「部分采纳/部分驳回」与 code review resolve 语义两个角度，同时定点打开原文验证：搜索配额已达成（6 查询、4 角度、三引擎）。现在定点深挖打开原文验证（满足 ≥6 次 full reads）：继续定点深挖，凑足 6 次全文核验（FDA 逐条回应、retest 模板、LLVM resolve RFC、ISO 双源）：配额自查：searches: 6（Exa×3、AnySearch×4、Tavily 因配额超限不可用，改由 AnySearch/Exa 双引擎交叉）| angles: Official + Comparative + Criticism + Community 四类 | full reads: 8（GSA POA&M、hackersmanifest retest、DataGuard ISO 10.2、URM ISO 10.2、DanClarke、LLVM RFC、greenlight FDA 483、auditflo SOC2/exception）| gaps: SOC2 跨年判例仅一家深读（有二手多源摘要佐证）、FDA March 2026 draft guidance 被 WAF 挡（用 greenlight+thefdablog 摘要替代）。

## partially accepted

### atomcode
# atomcode

$ atomcode -p "软件项目收到外部审计/评审报告（多条指控：部分已实证修复、部分属'裁定不采纳'的设计分歧、部分锚定到长期门槛判据仍开放）。当其中一条核心指控的验证判据刚刚转绿时，终局结案裁定应该用哪种粒度：(i) 整批收口把整份评审标为已解决 (ii) 逐项双层收口——每条指控独立记裁定层(是否采纳/驳回)与验收层(修复是否实证)两态，含'裁定闭环-不采纳'终态与'保持验收开放锚长期判据' (iii) 推迟到长期门槛判据全齐再一次收口。请调研工业界成熟做法：审计 finding/缺陷的关闭粒度与权责（POA&M 项级 milestone 关闭、ISO 27001 不符合项纠正与跟踪审核、SOC2 exception 跨年管理、渗透测试 retest letter 逐项复测、FDA 483/Warning Letter 逐条回应、code review 逐条 resolve/驳回语义、安全公告/errata 生命周期），以及'整体结案 vs 逐项结案'的治理先例、部分驳回(partially accepted/partially disagreed)处置的成熟度实践、发现问题方…

知识库已命中既有「Two-Layer Closure」语料（D-165），现在按配额联网三引擎交叉验证工业界先例。先发第一轮多角度搜索：继续第二轮：pentest retest、ISO 27001 不符合项、code review resolve 语义（Tavily 已超配额，改用 Exa+AnySearch 双引擎）。第一轮搜索完成（POA&M 逐项化、pentest retest 三态、ISO 10.2、SOC2 exception 均有候选源）。补搜「部分采纳/部分驳回」与 code review resolve 语义两个角度，同时定点打开原文验证：搜索配额已达成（6 查询、4 角度、三引擎）。现在定点深挖打开原文验证（满足 ≥6 次 full reads）：继续定点深挖，凑足 6 次全文核验（FDA 逐条回应、retest 模板、LLVM resolve RFC、ISO 双源）：配额自查：searches: 6（Exa×3、AnySearch×4、Tavily 因配额超限不可用，改由 AnySearch/Exa 双引擎交叉）| angles: Official + Comparative + Criticism + Community 四类 | full reads: 8（GSA POA&M、hackersmanifest retest、DataGuard ISO 10.2、URM ISO 10.2、DanClarke、LLVM RFC、greenlight FDA 483、auditflo SOC2/exception）| gaps: SOC2 跨年判例仅一家深读（有二手多源摘要佐证）、FDA March 2026 draft guidance 被 WAF 挡（用 greenlight+thefdablog 摘要替代）。

### atomcode > 2) 分点结论
## 2) 分点结论

1. **审计 finding 的关闭粒度天然是逐项的，整批关闭在工业界没有合法形态**。GSA POA&M 指南明文："All findings from audits become individual POA&Ms"、"All findings noted in the final report, including those that may have already been corrected, must be individually identified"——即使已修复也逐条登记，且条目不得从 POA&M 移除，只改状态（已完结项可过滤视图但记录保留以保可审计）。〔GSA CIO-IT-Security-09-44，官方〕
2. **每项关闭的判据是双层分离的**：ISO 27001 §10.2 要求对每个不符合项：纠正 → 根因 → 纠正措施 → **验证有效性**（follow-up audit / monitor），且"Simply closing a task isn't enough——You need evidence"〔DataGuard + URM 两源〕；SOC 2 例外管理同样要求 "Verify before close——Make verification evidence a hard gate"，并且 close 与 accept 是不同终态："Acceptance without an end date is not management. It is abandonment"〔auditflo〕。
3. **「部分驳回/部分异议」是成熟且被制度化的处置**：内部审计管理回应有四种独立范畴——同意并行动 / 同意发现但不同意建议（须给替代措施）/ 不同意证据（须陈述理由）/ 整体异议〔USP 内审指南〕；州审计后续报告逐条记录 "Agency agreed / partially agreed / disagrees"〔Michigan 审计报告〕；FDA 483 回应规范明文允许 dispute："If you dispute the 483 observation and support this with factual objective evidence, it is appropriate to point this out… should not simply ignore the claim"〔greenlight.guru〕。即：驳回是合法终态，但必须是**显式记录的独立裁定**，不允许被整批收口淹没。
4. **复测/验收是独立文书、逐项三态**：pentest retest letter 逐 finding 出 Remediated / Partially Remediated / Not Remediated 三态表 + 证据，不 retest 的项（accepted risk）单独列原因；"Not Remediated" 还要求如实记录"客户端声称已部署但实测未生效"的情形〔hackersmanifest 模板〕。修复验证方与被修复方权责分离同源：code review 中「谁点 resolve」的争议（LLVM RFC、Dan Clarke）结论一致——**作者不能替评审方 resolve**，评审方对验收层有最终判权；作者侧可用单独机制（Mark-as-Done/checklist）记裁定层处置。LLVM RFC 中 Phabricator 经验还实证了反面教训：作者点 done 但"regularly"并未实际修复——正是裁定层≠验收层的经验证据。
5. **验收层未达不阻碍报告结案、但要锚定长期判据继续跟踪**：POA&M 项允许跨月/跨年存续并要求 milestone 带完成日期，逾期即标 "delayed" 而非撤销；SOC 2 例外带 expiry + review date 跨年管理。即选项 (iii)「推迟到长期判据全齐」被否：**报告层面的结案不需要等验收全绿，但开放验收项必须带时点锚进入值守**——无限期等待正是 "accepted risk without end date" 的反面教材。
6. **知识库既有定稿（D-165 Two-Layer Closure）与本次六域外部调研完全一致**，可作为结案文法的直接依据：裁定层/验收层各一行分行声明，禁单句「已完成」。

### atomcode > 4) 完整来源清单
## 4) 完整来源清单

| 来源 | URL | 角度 | 日期 | 贡献 |
|---|---|---|---|---|
| GSA POA&M 指南 CIO-IT-Security-09-44 | gsa.gov/…/Plan-of-Action-and-Milestones…pdf | Official | 2022-09 | 逐项登记强令、milestone+completion date、delayed 状态、条目不可移除 |
| NIST 800-53 CA-5 / PM-4 | csf.tools/reference/nist-sp-800-53/r5/ca/ca-5/ | Official | 2021-03 | POA&M 为 finding 级跟踪机制的规范出处 |
| Hackers Manifest Retest Report Template | hackersmanifest.com/reporting-templates/retest-report/ | Community | N/A | 逐 finding 三态（含 Partially Remediated）+ 独立 retest 文书 |
| DataGuard ISO 27001 §10.2 | dataguard.com/iso-27001/clause-10-2… | Official（厂商解读） | N/A | 逐项纠正→根因→验证有效性；close≠有证据 |
| URM Consulting §10.2 | urmconsulting.com/blog/iso-27001-clause-10-2… | Official（认证咨询） | 2026-06-17 | minor/major 分级、验证效果、常见错误 |
| auditflo Exception Management | auditflo.co/resources/exception-management-and-audit-findings-remediation | Comparative/方法论 | 2026-09-11 | SOC2 例外/finding/CAPA 分层、verify-before-close hard gate、acceptance 须带 end date |
| USP 内审回应指南 | usp.ac.fj/…/170821_IA_recommendations_guidance.pdf | Official | 2021 | 四类管理回应范畴（含同意发现不同意建议） |
| Michigan 审计后续报告 | audgen.michigan.gov/…/rs391057121F-92874.pdf | Official | 2025-07 | agreed/partially agreed/disagrees 逐条记录先例 |
| Greenlight Guru FDA 483 指南 | greenlight.guru/blog/fda-483-warning-letters | Official（行业权威） | 2026-01-13 | 逐 observation 回应、dispute 合法且须给事实证据、Completed/Planned 分列 |
| Dan Clarke: Who should resolve PR comments | danclarke.com/resolving-pr-comments/ | Community | 2022-05-27 | resolve 权在评审方；作者不能代 resolve |
| LLVM Discourse RFC: Resolve Conversation | discourse.llvm.org/t/rfc-github-pr-resolve-conversation-button/73178 | Community | 2023-09-01 | 双层机制先例（作者 Mark-done vs 评审 Resolve）；"regularly 未实际修复"实证 |
| 知识库 D-165 Two-Layer Closure（本会话 ctx_search） | CONTEXT.md / D-ledger | 本项目既有裁定 | 2026-09-28 | 与外部六域先例收敛的既有结论，可直接引用 |

## retest

### atomcode
# atomcode

$ atomcode -p "软件项目收到外部审计/评审报告（多条指控：部分已实证修复、部分属'裁定不采纳'的设计分歧、部分锚定到长期门槛判据仍开放）。当其中一条核心指控的验证判据刚刚转绿时，终局结案裁定应该用哪种粒度：(i) 整批收口把整份评审标为已解决 (ii) 逐项双层收口——每条指控独立记裁定层(是否采纳/驳回)与验收层(修复是否实证)两态，含'裁定闭环-不采纳'终态与'保持验收开放锚长期判据' (iii) 推迟到长期门槛判据全齐再一次收口。请调研工业界成熟做法：审计 finding/缺陷的关闭粒度与权责（POA&M 项级 milestone 关闭、ISO 27001 不符合项纠正与跟踪审核、SOC2 exception 跨年管理、渗透测试 retest letter 逐项复测、FDA 483/Warning Letter 逐条回应、code review 逐条 resolve/驳回语义、安全公告/errata 生命周期），以及'整体结案 vs 逐项结案'的治理先例、部分驳回(partially accepted/partially disagreed)处置的成熟度实践、发现问题方…

知识库已命中既有「Two-Layer Closure」语料（D-165），现在按配额联网三引擎交叉验证工业界先例。先发第一轮多角度搜索：继续第二轮：pentest retest、ISO 27001 不符合项、code review resolve 语义（Tavily 已超配额，改用 Exa+AnySearch 双引擎）。第一轮搜索完成（POA&M 逐项化、pentest retest 三态、ISO 10.2、SOC2 exception 均有候选源）。补搜「部分采纳/部分驳回」与 code review resolve 语义两个角度，同时定点打开原文验证：搜索配额已达成（6 查询、4 角度、三引擎）。现在定点深挖打开原文验证（满足 ≥6 次 full reads）：继续定点深挖，凑足 6 次全文核验（FDA 逐条回应、retest 模板、LLVM resolve RFC、ISO 双源）：配额自查：searches: 6（Exa×3、AnySearch×4、Tavily 因配额超限不可用，改由 AnySearch/Exa 双引擎交叉）| angles: Official + Comparative + Criticism + Community 四类 | full reads: 8（GSA POA&M、hackersmanifest retest、DataGuard ISO 10.2、URM ISO 10.2、DanClarke、LLVM RFC、greenlight FDA 483、auditflo SOC2/exception）| gaps: SOC2 跨年判例仅一家深读（有二手多源摘要佐证）、FDA March 2026 draft guidance 被 WAF 挡（用 greenlight+thefdablog 摘要替代）。

### atomcode > 1) 执行摘要（Tl;dr）
## 1) 执行摘要（Tl;dr）

**推荐 (ii)：逐项双层收口**——每条指控独立记「裁定层」（采纳/驳回/值守/执行窗）与「验收层」（修复是否实证复绿）两态。这是 POA&M、ISO 27001、SOC 2、pentest retest、FDA 483、code review 六个领域先例的一致收敛（Confidence：高——至少两域一手/官方级信源 + 知识库既有 D-165 先例交叉支持）。刚才某条核心指控判据转绿，只意味着**该条的验收层闭环达成**，绝不能据此把整份评审标为已解决。

### atomcode > 4) 完整来源清单
## 4) 完整来源清单

| 来源 | URL | 角度 | 日期 | 贡献 |
|---|---|---|---|---|
| GSA POA&M 指南 CIO-IT-Security-09-44 | gsa.gov/…/Plan-of-Action-and-Milestones…pdf | Official | 2022-09 | 逐项登记强令、milestone+completion date、delayed 状态、条目不可移除 |
| NIST 800-53 CA-5 / PM-4 | csf.tools/reference/nist-sp-800-53/r5/ca/ca-5/ | Official | 2021-03 | POA&M 为 finding 级跟踪机制的规范出处 |
| Hackers Manifest Retest Report Template | hackersmanifest.com/reporting-templates/retest-report/ | Community | N/A | 逐 finding 三态（含 Partially Remediated）+ 独立 retest 文书 |
| DataGuard ISO 27001 §10.2 | dataguard.com/iso-27001/clause-10-2… | Official（厂商解读） | N/A | 逐项纠正→根因→验证有效性；close≠有证据 |
| URM Consulting §10.2 | urmconsulting.com/blog/iso-27001-clause-10-2… | Official（认证咨询） | 2026-06-17 | minor/major 分级、验证效果、常见错误 |
| auditflo Exception Management | auditflo.co/resources/exception-management-and-audit-findings-remediation | Comparative/方法论 | 2026-09-11 | SOC2 例外/finding/CAPA 分层、verify-before-close hard gate、acceptance 须带 end date |
| USP 内审回应指南 | usp.ac.fj/…/170821_IA_recommendations_guidance.pdf | Official | 2021 | 四类管理回应范畴（含同意发现不同意建议） |
| Michigan 审计后续报告 | audgen.michigan.gov/…/rs391057121F-92874.pdf | Official | 2025-07 | agreed/partially agreed/disagrees 逐条记录先例 |
| Greenlight Guru FDA 483 指南 | greenlight.guru/blog/fda-483-warning-letters | Official（行业权威） | 2026-01-13 | 逐 observation 回应、dispute 合法且须给事实证据、Completed/Planned 分列 |
| Dan Clarke: Who should resolve PR comments | danclarke.com/resolving-pr-comments/ | Community | 2022-05-27 | resolve 权在评审方；作者不能代 resolve |
| LLVM Discourse RFC: Resolve Conversation | discourse.llvm.org/t/rfc-github-pr-resolve-conversation-button/73178 | Community | 2023-09-01 | 双层机制先例（作者 Mark-done vs 评审 Resolve）；"regularly 未实际修复"实证 |
| 知识库 D-165 Two-Layer Closure（本会话 ctx_search） | CONTEXT.md / D-ledger | 本项目既有裁定 | 2026-09-28 | 与外部六域先例收敛的既有结论，可直接引用 |

## 逐项结案

### atomcode
# atomcode

$ atomcode -p "软件项目收到外部审计/评审报告（多条指控：部分已实证修复、部分属'裁定不采纳'的设计分歧、部分锚定到长期门槛判据仍开放）。当其中一条核心指控的验证判据刚刚转绿时，终局结案裁定应该用哪种粒度：(i) 整批收口把整份评审标为已解决 (ii) 逐项双层收口——每条指控独立记裁定层(是否采纳/驳回)与验收层(修复是否实证)两态，含'裁定闭环-不采纳'终态与'保持验收开放锚长期判据' (iii) 推迟到长期门槛判据全齐再一次收口。请调研工业界成熟做法：审计 finding/缺陷的关闭粒度与权责（POA&M 项级 milestone 关闭、ISO 27001 不符合项纠正与跟踪审核、SOC2 exception 跨年管理、渗透测试 retest letter 逐项复测、FDA 483/Warning Letter 逐条回应、code review 逐条 resolve/驳回语义、安全公告/errata 生命周期），以及'整体结案 vs 逐项结案'的治理先例、部分驳回(partially accepted/partially disagreed)处置的成熟度实践、发现问题方…

知识库已命中既有「Two-Layer Closure」语料（D-165），现在按配额联网三引擎交叉验证工业界先例。先发第一轮多角度搜索：继续第二轮：pentest retest、ISO 27001 不符合项、code review resolve 语义（Tavily 已超配额，改用 Exa+AnySearch 双引擎）。第一轮搜索完成（POA&M 逐项化、pentest retest 三态、ISO 10.2、SOC2 exception 均有候选源）。补搜「部分采纳/部分驳回」与 code review resolve 语义两个角度，同时定点打开原文验证：搜索配额已达成（6 查询、4 角度、三引擎）。现在定点深挖打开原文验证（满足 ≥6 次 full reads）：继续定点深挖，凑足 6 次全文核验（FDA 逐条回应、retest 模板、LLVM resolve RFC、ISO 双源）：配额自查：searches: 6（Exa×3、AnySearch×4、Tavily 因配额超限不可用，改由 AnySearch/Exa 双引擎交叉）| angles: Official + Comparative + Criticism + Community 四类 | full reads: 8（GSA POA&M、hackersmanifest retest、DataGuard ISO 10.2、URM ISO 10.2、DanClarke、LLVM RFC、greenlight FDA 483、auditflo SOC2/exception）| gaps: SOC2 跨年判例仅一家深读（有二手多源摘要佐证）、FDA March 2026 draft guidance 被 WAF 挡（用 greenlight+thefdablog 摘要替代）。

## 验收

No matching sections found.


> **Tip:** Results are scoped to this batch only. To search across all indexed sources, use `ctx_search(queries: [...])` or call ctx_batch_execute with `query_scope: "global"`.

Searchable terms for follow-up: cio-it-security-09-44, hackersmanifest, comparative, management, observation, remediated, anysearch, community, danclarke, disagrees, regularly, atomcode, 裁定闭环-不采纳, accepted, official, guidance, michigan, warning, dispute, delayed, letter, tavily, report, agreed, clarke, expiry, draft, 验证有效性, audit, close, 跨年管理, 逐条回应, 部分驳回, hard, gate, date, guru, 执行窗, 验收层, soc
