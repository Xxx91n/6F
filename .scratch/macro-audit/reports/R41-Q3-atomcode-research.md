# R41-Q3 atomcode 调研报告：本轮锐评处置可否宣布「定稿/闭环」——三候选裁定

调研时点：2026-09-28｜引擎：Exa+AnySearch（Tavily 限流降级）

## 1) 执行摘要（Tl;dr）

**推荐 (iii) 分层定稿**——按本仓已有立法重述为：裁定层本轮闭环定稿（候选 i 的口径成立），验收层不闭、以哨兵挂下轮。理由：工业界从 POA&M 到 code review 的收敛共识是「发现项的 adjudication/disposition 与 remediation verification 从来是两个闭环」——前者要求每条指控有名分去向，后者要求实证复绿；本仓四轮处置已把前者做满，后者按 D-162② 判据②本来就是 Stage-2 判据不是本轮收口判据。Confidence：高（五域先例收敛＋本仓 D-162 已预置这个二分）。

## 2) 分点结论

### 2.1 「裁定闭环 ≠ 修复验证闭环」是跨域成熟心智模型，不是本仓发明

| 域 | 裁定层闭环形态 | 验证层闭环形态 | 证据 |
|---|---|---|---|
| FedRAMP/CMS POA&M | Findings 未满足控制 → 必须进 POA&M（每条有去向），可走 Risk-Based Decision 由 AO 显式接受 | POA&M 关闭须 milestone 全完成＋artifact 上传＋内测验证＋CISO 批准；PenTest 产的 POA&M 由 pen-test 团队 retest 后关闭 | CMS POA&M Handbook 官方（全文读） |
| ISO 27001 (10.2) | 不符合项登记＋纠正措施立案 | 只在证据表明已解决、且有效性经 review 后才 close；surveillance audit 强制复查历次关闭 | iseoblue/urmconsulting/episki 三源收敛 |
| 渗透测试 retest | 原报告钉快照、findings 分级；risk acceptance 合法但须 risk owner＋rationale＋review date 显式登记——「静默不动的 finding 不是 accepted risk，是无主开放风险」 | retest letter 只复检原报告 findings、per-finding 给 resolved/partial/not-resolved——retest 不是新 pentest；无 retest letter＝「只有存在漏洞的书面证据、没有任何修复证据，比没测过更糟」 | secureaudit.nl＋avantcert 两源全文；HackerOne retest 文档；PCI DSS 11.4.4 |
| SOC 2 例外 | 例外登记＋管理层回应 | 例外关闭须补救验证＋下年度审计复查 operating effectiveness | scrutiny/ispartners 两源 |
| FDA 483 | 逐条书面回应（corrected / correcting / 不接受须论证） | CAPA 关闭须 effectiveness check、复发证据有限时 record 须解释决定 | fda.gov 草案指南＋pharma.tips/complianceworxs |
| Code review | 每条 thread 须 ADDRESS 或 IGNORE_WITH_REASON（附依据）后 resolve——「每条评论有去向」就是评论闭环的定义 | 谁按 resolve button（作者 vs 评审者）是活争议（LLVM 主张留评审者），但这争议恰证明：resolve 语义=「我方处置完毕呈报」，不=「评审方复验通过」 | tidyverse 官方＋LLVM Discourse RFC＋agent closure-loop spec |

直接推论：候选 (ii)「核心指控实测未消须修复复绿才闭环」把两层混为一谈。POA&M 从不因「milestone 未完成」而拒绝「weakness 已立项建档」这个事实；retest letter 是独立文书，其缺位不否定 intake/disposition 阶段的完成。

### 2.2 显式驳回与「快照不属实」的 closure 语义有正典先例，本仓 D-146 四档制与之同构

- RFC Editor errata 四态：Reported / Verified / Rejected（erratum 冗余或本身错误，被弃置但仍可检索不删条目）/ Held for Document Update——「驳回是留痕封闭态非删除」的官方文法。
- Bugzilla INVALID／OpenSSF CVD「working as intended→close＋解释义务」／ISA 450 事实性错报——本仓 D-146⑤ 已调研登记，本轮外部再证一致。
- 本仓 D-142（快照属实/已修、开放、pending）＋D-146（第四档：可核实且证伪→显式驳回附依据）＝四态摄入分诊，与 IETF/Bugzilla 语义逐位对应。本轮勘误二阶修正正好走 D-146⑤ 惯例登记，无需新立法。

### 2.3 「all-comments-resolved」的工业口径支持候选 (i) 的闭环定义

- tidyverse code review：作者把每条评论 ADDRESS 或 IGNORE_WITH_REASON 后即可 resolve 并可 re-request review——resolve 的语义就是「我这边处理完了」。
- 直接对应：每条锐评指控有去向（兑现/显式驳回/值守登记/执行窗登记）=裁定层闭环成立。

### 2.4 本仓判据体系内部已经预置了这个答案（关键内证）

- D-162②：Stage-2 公开推广判据②=「fresh clone 不红海（以 D-159 env-contract tier 判据为操作性定义）」。这是 Stage-2 门槛，不是本轮收口门槛——本轮收口的判据应该是「处置路由完备」。
- D-163/164：新立两件裁定已把 13 红→四类前置探测泛化（git-object/engine-deps/asset）＋组级粒度精化，且 D-163 §5 已按「revised 型规程字面路径」处置冲突。执行未启＝执行义务在册，非裁定缺口。
- D-148②：Accepted Risk 三要素（不修理由＋补偿控制＋复评触发条件）——「外人 clone 不红海 FAIL」若选择不修路径，可走此通道；但 D-163 已选了修（执行窗），所以它是 deferred-with-execution-window，语义更干净。
- D-144①④：收口工序要求账行增量↔编年随行核对——本轮两件新裁（D-163/164）须编年随行，这是程序性收口条件，与「定稿判据」正交，做完即可收。

## 3) 三候选裁定对比矩阵

| 候选 | 判据 | 工业先例支持 | 辩证评价 |
|---|---|---|---|
| (i) 可定稿＝裁定链闭环口径 | 每条指控有去向即闭环，残余=执行义务 | code review all-resolved；POA&M 建档即 disposition；errata Rejected 即终态 | ✅ 定义正确，但单用会漏掉「验收层哨兵」的诚实披露义务——只宣布闭环不挂哨兵，等于 retest letter 缺位还宣称「已修复」，是 secureaudit 批评的 fooling yourself |
| (ii) 不可定稿＝须修复复绿 | 核心指控实测未消即不闭 | ISO 27001 close 须 effectiveness verified；POA&M close 须内测 | ❌ 层级错置：ISO 的 close 判据约束的是不符合项条目的关闭，不是整个审计响应轮次的定稿；照此口径 POA&M 存续期间「处置工作」永远无法宣告完成——与 POA&M 制度自身矛盾 |
| (iii) 分层定稿（推荐） | 裁定层本轮闭环；验收层不闭＋哨兵挂下轮 | retest letter 独立文书制；POA&M open-vs-closed 分账；D-162② Stage-2 判据本就分层 | ✅ 与本仓既有立法零冲突、与五域先例零冲突；唯一成本=下一轮须带哨兵复验 13 红探测面落地后的 fresh-clone 复跑 |

推荐裁定文本方向：宣布定稿时显式声明两行——「裁定层：四轮处置闭环，每条指控去向在册（两件建制兑现、13 红归 D-163/164 执行窗、评审勘误按 D-146⑤ 二阶登记）；验收层：fresh-clone 不红海判据未达，登记为下轮哨兵（manual_watch 形态，锚 D-162② 判据②），复验动作=D-163 探测面落地后 fresh clone 全量守卫复跑」。

## 4) 冲突清单（辩证，显式列出）

1. 「定稿」语义与 retest 纪律的张力：pentest 惯例里「无 retest letter 别宣称修好」——若本轮宣布「定稿」被读成「外部评审的关切已解决」，会越线。消解：定稿声明限定在裁定层语义，验收层事实如实并行呈报（Dual Reporting 文法，D-142② 已有先例）。
2. resolve-button 归属争议（LLVM 反方）：LLVM 主张 resolve 留给评审者按——即「处置完毕」≠「评审方认可」。若本仓认为「闭环」须含外部评审方追认，则候选 (iii) 的裁定层闭环也早了半步。消解：本仓锐评为单向摄入（评审方无回访义务），D-142③「向评审方提示快照 SHA」是可选动作——闭环语义只能锚接收方处置完备性，这个解释与 tidyverse「作者 resolve」惯例一致。
3. 候选 (i) 的合理内核不能全丢：13 红中「ghost git-object 五件自声明 portable 误」属裁定质量缺陷（tier 自声明错），不只是执行欠账——D-163 已把它裁进泛化探测面，但「portable 误声明」这个面若被裁定层闭环吞掉，下次同型错误无复发触发器。消解：确认 D-163 十要件中是否已含 90-review-intake-mistriage-recurrence 同族的 tier 误声明触发器；若不含，登记一条（随收口落盘，非新裁面）。
4. 勘误二阶修正 vs D-146⑤ 原始形态：D-146⑤ 惯例针对「锐评对仓情的失实」，本轮勘误是对「评审报告勘误的再勘误」（二阶）——IETF errata 无二阶正典形态（Rejected/Verified 一层即终）。消解：沿 errata「条目留痕、链式追加、不改写原条目」的精神，二阶勘误以追加条目＋指回一阶勘误行实现，账本内已有先例（D-146 标 revised 不改写 D-142）。
5. 候选 (i) 字面「残余=执行义务非裁定缺口」有个边界：执行窗登记若无限期，等于变相 accepted-risk 但绕过 D-148② 三要素。消解：定稿声明须给执行窗一个时点锚（如「下轮 T3/下个执行批」），与 POA&M milestone 必须有 completion date 的纪律对齐——这正是候选 (iii) 哨兵形态的意义。

## 5) 完整来源清单

| 来源 | URL | 角度 | 贡献 |
|---|---|---|---|
| CMS POA&M Handbook | security.cms.gov/learn/cms-plan-action-and-milestones-poam-handbook | Official | POA&M 分账制、PenTest retest 关闭条款、RBD 风险接受通道 |
| Secure Audit: Pentest follow-up | secureaudit.nl/en/knowledge-base/pentest-remediation-retest | Official/Comparative | retest≠新 pentest；risk acceptance 显式登记；resolved 语义诚实纪律 |
| Avantcert: VAPT retest letter | avantcert.com/blog/vapt-report | Comparative | retest letter 独立文书形态与「无它=更糟」论断 |
| RFC Editor: Errata in RFCs | rfc-editor.org/series/rfc-errata/ | Official | Rejected=留痕封闭态正典 |
| SecurStack: Risk Acceptance | securstack.io/blog/en/risk-acceptance-in-security-when-and-how-to-document-it | Official-adjacent | 风险接受记录七要件、时效窗、audit trail |
| Tidyverse code review ch.9 | code-review.tidyverse.org/author/handling-comments.html | Community | 作者 resolve 惯例、all-addressed 即可 re-request |
| LLVM Discourse resolve-button RFC | discourse.llvm.org/t/rfc-github-pr-resolve-conversation-button/73178 | Criticism | resolve 归属反方——闭环语义不含评审方追认 |
| ISO 27001 10.2 三源 | urmconsulting.com/blog/iso-27001-clause-10-2-... 等 | Official | close=有效性验证后；surveillance 复查关闭 |
| FDA 483 回应草案指南＋pharma.tips | fda.gov/.../responding-fda-form-483-observations-... | Official | 逐条回应制、CAPA effectiveness check |
| SOC 2 exceptions | scrut.io/hub/soc-2/soc-2-audit-exceptions | Official-adjacent | 例外处置与下年度复查 |
| HackerOne retest 文档 | docs.hackerone.com/en/articles/8541386-manage-pentest-retesting | Official | per-finding retest 状态机 |
| 内证：decision-ledger.md D-142/144/146/148/149/159/160/162/163/164 逐条亲读 | .scratch/macro-audit/decision-ledger.md | 内证 | D-162② 判据②分层预置、D-163/164 执行窗语义、D-148② 三要素 |

## 6) 信息缺口

- Tavily 限流第三引擎交叉仅双轨；ISO 27001 条款部分走检索核验非全文（三源收敛补足）。
- 评审方回访/追认通道是否存在属本仓外部事实，调研以「单向摄入」前提裁定——若评审方实为可回访对象，resolve 归属争议 (§4-2) 应重开。
