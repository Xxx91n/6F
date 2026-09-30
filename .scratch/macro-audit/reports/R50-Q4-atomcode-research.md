# R50-Q4 调研报告：文件换代时哨兵字标（守卫断言面）防丢建制

> 存档说明：atomcode CLI（ctx_batch_execute label=atomcode-r50q4）2026-09-30 返回。过程如实登记——派遣后回执未回放，子代理按续跑锚定轮询后台进程（PID 15616 存活）后转本会话三引擎直查＋web_fetch 原文核验＋知识库召回综合；atomcode 深调研进程未归（六连形态），按 D-186 降级形态如实登记，后台若后续落库可作补强。题面存档见 reports/R50-Q4-research-prompt.md。

**Sufficiency Gate** — 原文核验：autojinja README｜pants discussion #18235 全文｜cog 官方文档双源（cog.readthedocs.io + nedbatchelder.com/code/cog）｜gitlint 内建规则档｜mdsmith MDS056｜AWS cloudformation-guard CLAUSES.md｜llm-unit-testing test_string_assertions.py｜GitLab push rules 档｜仓内 decision-ledger D-144/D-145/D-146/D-177/D-184/D-185/D-186、75a-check.mjs、44-check.mjs、41a-check.mjs（grep 定位）。

## 1) 执行摘要（Tl;dr）

**推荐采纳候选 (i)（换代工序条文＋保护区钉死），置信高；并带两条精化：盘点步不新写工具——复用已在场的 75a-check 字面钉普查作机检底、负向断言分向人工补列；守卫组保持兜底第二层不降级。** 依据：autojinja 给出功能逐字同构的先例（保搬区缺失即 abort 生成＝「换代后逐钉核对」的机检化终态）；pants 官方讨论确认「test fails if not regenerated」＝守卫兜底层是行业标准位、但与产生端工序并行不互替；thoughtbot「CI 闸不消灭遗忘、只把学费变便宜」＋仓内 D-144①/D-145① 两件同型裁定已确立「工序前置＋守卫硬闸」双层模式。(ii)(iii)(iv) 各有明确否决依据。

## 2) 候选对比矩阵

| 候选 | 先例强度 | 裁决 | 关键理由 |
|---|---|---|---|
| (i) 工序条文＋保护区 | 强（autojinja/pants/D-144①/D-145① 同族） | **采纳＋两精化** | 工序前移＋守卫兜底双层为各方一致形态 |
| (ii) 新写抽取工具 | 有 manifest 先例但解析陷阱大 | **否决** | 75a 普查已在场；解析多样断言形态=本仓 D-184 已实证学费 |
| (iii) 守卫兜底够用 | 无先例支持 | **否决** | 「接住就够」=Normalization-of-Deviance 同签名；守卫是学费回收器非防丢器 |
| (iv) 断言迁账本 | 可行但重 | **否决** | D-177 级 13 件 check 重活；票面对账钉点在 handoff 合法 |

## 3) 分点结论（五项特别裁决）

**① 「换代前盘点→换代后逐钉核对」工序步有先例吗——有，且有机检化终态。** 最强先例是 autojinja（Cog 模式的 Jinja 实现，已读 README 原文）：保搬节（named preserved section）在新一代生成时从旧文件提取并重新插入，且**「所有历史保搬节必须全部重新插入，否则视为 code loss、生成中止（aborted），须人工干预」**——这正是「换代后逐钉核对」的机器强制形态：盘点清单＝历史节名集，核对动作内建于生成器，缺失即 fail。pants #18235（已读全文）同向：版本受控生成件的失新「用户需要 error with an explanation of how to regenerate」，且 StackStorm 实践把生成挂 fmt/lint 语义使漏再生直接红。仓内同型判例两件：D-144①（收口 checklist 增「账行增量↔编年随行核对＋收口前跑守卫组」）、D-145①（dist 触碰→前置 build＋check-dist）。**结论：工序步有先例，且工业终态是机检内建——本仓 75a 普查已承载机检位，缺的只是把「换代时跑它」写进工序条文。**

**② 保护区节（reserved/preserved section）作哨兵集中位——先例充分，利大于弊。** autojinja 的 named section 是字面同构（`<<[ impl ]>>…<<[ end ]>>`，生成时逐节找回重插）；Cog 官方文档（已读双源）确立「标记区外文本全量原样通过（passed through unchanged）」的心智模型——**保护区把「散布钉」收敛为「有界节」，使换代核对从全文件扫描降为节级保搬**。弊端有限：保护区集中后，节外新增钉（新 check 断言节外字面量）会落在保护区管辖之外——故工序条文须写「新钉默认落保护区，节外钉须在普查清单显式登记」。

**③ 自动抽取工具化的先例与陷阱——陷阱本仓已实证付过学费。** 外部先例：llm-unit-testing 的 string-contract 模式（已读源码）把 must_contain/must_contain_patterns/must_not_contain 三形态统一清单化，并有 meta 断言 `test_every_golden_case_declares_at_least_one_marker`——**「无断言的 case 不许存在」＝断言清单 manifest 化＋非空强制的成熟先例**。陷阱面：解析多样断言形态（子串/正则/负向/多行）的误漏风险，本仓 D-184 已实证（stripComments regex 字面量引号粘滞→该剥不剥→下游盘点漂移），外部同型教训＝MD/regex 静态扫描的形态盲区文献（D-184 引 Padolsey/socket.dev 分层档位）。**结论：不新写工具；75a 普查在场，换代工序引用其输出，已知盲区按 D-184/D-181 口径人工补盖。**

**④ 负向断言（禁含形态）在哨兵管理中的先例——充分且是一等公民。** gitlint T5 `title-must-not-contain-word`（已读官方规则档）、mdsmith MDS056 forbidden-text（markdown lint 禁含配置子串）、AWS CFGuard `!=` 禁含子句、llm-unit-testing `must_not_contain`——四源一致：禁含形态在文本契约工具中标准在册。对盘点清单的启示：**负向钉的「合规态」是禁含串持续缺席，与正向钉的「在场」语义相反，清单须分向标注（在场钉/缺席钉两列），42-check 形态（禁「无 ✅ 的 #42 行」）归缺席钉列**。未找到任何「负向断言不进哨兵清单」的反向惯例。

**⑤ 守卫兜底「接住就够」的事故先例——「先写后查」是被判劣的形态。** thoughtbot（知识库 R35-Q2 已读原文）：「if a computer generates a file, then a computer should be in charge」＋**CI 闸不消灭遗忘本身、只把学费变便宜**——即守卫是学费回收器不是防丢器。Shift-left 文献族（parasoft/datadog/wiz）一致主张检测前移但不撤检测层。D-185 调研已在本仓引入 Normalization-of-Deviance（Gulfstream IV：98% 检查「被接住」恰证纪律靠侥幸）——R49 漏钉被接住靠「先跑守卫再 commit」顺序侥幸，与该反模式同签名。pants 讨论中 guard-test 只是「I've heard of others」的兜底选项，主推仍是 fmt/lint 工序内建。**结论：「守卫兜底够用不立规」无先例支持；双层（工序防＋守卫接）是各方一致形态。**

**滚动文件历史锚点保搬（要求1末项）**：autojinja 的节提取→重插机制就是 rolling file 保搬的最贴切实现；无更主流的独立命名工具——「rolling window 历史锚点保搬」多为隐式实践（changelog 工具族 scriv/changesets 以「片段目录→聚合生成」绕开原地保搬问题），如实标注：**无「verify-preserved-markers」这一命名的成熟独立工具/术语，找到的是功能等价物**。

## 4) 冲突扫描（对账本 current 决策）

| 决策 | 冲突？ | 说明 |
|---|---|---|
| D-177 预声明收严 | 否 | (i) 是换代工序条文，非预声明验证包，不涉「先声明后实现」时序面 |
| D-149 守卫组 | 否（同向） | 守卫组硬跑不降级——(i) 明文保留守卫兜底第二层 |
| 44-check 头注「字面钉随任务书换代维护」 | 否（正是其升格） | 头注＝约定活在注释里；(i) 把它升格进 WORKFLOW 换代节，check 断言语义零改动 |
| D-146⑤ append-only | 否（同构） | 保护区「只增不删」与链式追加同精神；候 (iv) 不违反 D-146⑤ 但因成本否决 |
| D-148③ 生效时点 | 否 | 新换代规程自落盘 commit 生效，落盘轮自身豁免；R49 漏钉属立法前状态，无追溯义务 |
| D-185 开工对表 | 否（同族） | 「开工对表任务书声称态」与「换代对钉断言在场」同族 guideline 式核实义务，形态一致 |
| D-186 降级形态 | 适用 | 本次 atomcode 深调研未归（第六连），按 D-186 三引擎综合如实登记 |
| handoff 任务书建制 | 否 | 保护区节即任务书既有「历史票面闭环索引（守卫锚点留痕）」节的规程化，不新建面 |

## 5) 推荐＋理由＋置信度

**推荐 (i)，带两精化，置信度高（~85%）**：

1. **换代工序步入 WORKFLOW**（D-144①/D-185 同族形态，guideline 式核实义务＋守卫硬跑不降级）：「换代重写 next-round.md 前——跑 75a 字面钉普查得正向在场钉清单，负向缺席钉（42-check 禁含形态类）人工补列分向标注；新书落盘后逐钉核对；守卫组兜底跑绿再 commit」。成本≈一条普查命令＋一次分向核对。
2. **保护区节规程化**：任务书模板把「历史票面闭环索引（守卫锚点留痕）」钉为保护区，整节保搬、只增不删——autojinja 节级保搬同构；新钉默认落节内，节外钉须普查清单显式登记（防保护区盲区化）。
3. **否决 (ii) 新立工具**（75a 在场，D-184 学费已付）、**(iii) 独立成立**（守卫留任第二层，非主防线）、**(iv) 迁账本**（D-177 级重活＋票面对账合法钉点在 handoff，换被测面不等于防丢）。

**缺口如实标位**：①75a-check 普查对负向钉/多行逻辑钉的覆盖形态未逐行核实（本次只读其头注与前 3 行）——立项执行轮应先核 75a 输出能否分向，不能则清单负向列暂人工；②「verify-preserved-markers」作为独立命名惯例不存在，只有功能等价物（autojinja abort-on-loss/pants lint error/CI rebuild-diff）——条文命名不必攀附外部术语；③atomcode 深调研未归，外部一手核验由三引擎直查承载，知识库召回的 R35-Q1/Q2 报告为二手登记（其原文页在当轮已核，本会话未重读原文者已注明）。
