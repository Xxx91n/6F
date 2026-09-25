# R32-Q5 调研报告：「本环境不可证伪的验证义务」处置——#81 golden 跨宿主稳定声明

atomcode 调研回毕（resume 句柄 3dc7cd60-f305-4e3d-b4a8-424d15fe0443）。Sufficiency Gate：searches 8（Exa×5+AnySearch×2+Tavily×1 配额耗尽已换引擎）| angles 五类全覆盖 | full reads 7（PCAOB AS1105、MinimumCD、Jest 官方、LLVM FileCheck、insta docs.rs、helpmetest、zoekt PR#1034 全文）。置信度：高。

## 1) 执行摘要（Tl;dr）

**推荐 (a)——如实登记「不可仓内证伪」＋33-gate-registry 挂 event_bound 条件触发器**（照 `82-first-external-contributor` 先例带 owner/verification/confirmation 字段），**不降声明、不建 CI 腿**。Confidence：**高**。理由：工业界对「环境依赖型断言在本环境不可观测」的成熟处置恰好就是本案已建制的三件套——①机制层用确定性合成证据覆盖（dialect-boundary.test.mjs 的 gitRunner 注入缝 = Cypress「anchor to another piece of truth」/MinimumCD「test doubles + out-of-band check」的 double 侧）；②真实环境证伪义务转事件触发封口（Trigger-gated Closure / Watch Tri-state 的 event_bound 正是 feature-flag 式条件验证的登记形态）；③登记时如实披露而非静默（pytest skipif 的 reason 字段、Jest `--ci` 禁自动写快照的同源纪律）。工业反例（zoekt #1029：单环境 CI 假绿、用户在 Debian/Ubuntu 踩坑）证明的是「不能**只**靠单环境绿就宣称兼容」——而本案恰恰没有只靠单环境绿：合成双语料证据 + 触发器留证已在。

## 2) 四候选对比矩阵

| 候选 | 工业判据 | 账本一致性 | 成本 | 结论 |
|---|---|---|---|---|
| (a) 登记+条件触发器 | pytest skipif reason/Cypress 锚定真源/MinimumCD out-of-band 腿先例全齐 | Trigger-gated Closure/Watch Tri-state/D-130③ 触发器立法同构 | 一条 registry JSON | ✅ 推荐 |
| (b) CI 矩阵腿 | zoekt #1034 判据=真用户痛点驱动才划算 | D-130 实证外部贡献者=零、ADR-0009 本地优先 | 64 组合级成本为无人消费工件 | ❌ |
| (c) 降声明措辞 | PCAOB：证据不足→披露保留非撤回意见 | 措辞裁剪代替证据义务=欠账滚存 | 零成本但失诚实面 | ❌ |
| (d) 不登记 | 违 D-122 披露纪律 | 违诚实披露 | — | ❌ |

## 3) 分点结论（标注来源）

**结论 1｜环境依赖断言的工业处置 = 「确定性替身证据 + 条件触发/条件执行 + 如实登记 reason」，而非无条件补环境矩阵。** Confidence 高。
- pytest 官方：skipif 必须携带 reason 且在 `-rs` 摘要中显式呈现——「跳过」是登记过的显式状态不是静默缺口（docs.pytest.org，Official）。
- Bun/大型仓 CI 纪律文档（本轮检索命中）：跨平台类失败「gate the test to the platform it actually tests, with a comment」＋「Merge-group greenness requires real queue runs——本地近似**不能证明** Windows/macOS 稳定性」——即：单环境绿不外推，缺的环境验证须显式登记为已知限制并等真环境跑（Community/Criticism，GitHub 内嵌文档）。
- Cypress 官方条件测试长文：条件执行的正当性来自「锚定到另一块不变的真源」——本案 gitRunner 注入缝正是不变真源（同一 commit object、双语料、断言逐字节一致）（docs.cypress.io，Official）。

**结论 2｜golden/snapshot 跨环境稳定性的工业做法 = 归一化到确定性，而非锁环境方言值。** Confidence 高。
- Jest 官方：CI 中禁自动写快照（`--ci` 只比对不落盘），快照工件随代码评审走——前提是「deterministic across environments」，且官方指认的破坏源恰包括 **timezone/locale**（jestjs/jest 官方 docs，与本案 git %cI 方言同族）。
- 社区实践汇总（helpmetest.com，2026-05）：跨 OS 快照差异的标准修法是 **setup 阶段钉死 TZ=UTC／序列化器归一路径**——即把环境方言在边界归一，让快照面只见规范流。这正是 D-128 边界吸收器的同构做法（absorbGitIsoDialect 在摄入边界 +00:00→Z，分类器只见规范流）。
- insta 官方：分层锁面（full/redaction/键集）为内建能力——支持 D-132 分层锁面立法。
- swift-snapshot-testing 跨 CI 机漂移 issue：同环境搭建仍漂移→字节级跨环境稳定不可单环境自证（Criticism）。

**结论 3｜环境矩阵的成本判据：兼容性回归已有真实痛点时矩阵才划算。** Confidence 中高。
- zoekt PR#1034（2026-03，Community/一手 PR 全文）：issue #1029 实证用户在 Debian 12/13、Ubuntu 22.04 崩溃后，才立 8 runner × 4 git 版本 × 2 ctags = 64 组合矩阵，且作者自认「merge now, fix forward」的高成本姿态；该 PR 至今 Open 未合并——**矩阵腿是真实外部用户痛点驱动的高成本响应，不是声明合规工具**。本案外部用户基数=0（D-130 实证「外部贡献者=零」），先建腿产出无人消费的差集工件违 CONTEXT「Avoid: 为不存在消费面预置资产」。

**结论 4｜审计语境「不可证伪声明」的披露标准 = 充分性与适当性分立，不可得证据须显式登记而非默示。** Confidence 中。
- PCAOB AS 1105.05（一手全文已核）：充分性=数量、适当性=质量（相关性+可靠性）；「获取更多同类证据不能补偿低质量证据」——对应本案：堆更多本仓再生跑（数量）不能补偿「缺非 Z 宿主」这一证据质量缺口。
- AS 1105.08 可靠性层级：审计师直接获取的证据 > 间接获取——对应：真实非 Z 宿主的一手差集工件 > 合成语料推断。合成证据是**相关**证据（覆盖归一机制的确定性），但对该宿主面**不充分**——所以正确动作是把不充分面显式登记（known-gaps/触发器），恰为 (a)；审计上「无法取得充分证据」的处置是披露保留意见而非撤回整个意见（对应：不降 (c) 全局声明，也不 (d) 沉默）。
- MinimumCD 指南（一手全文已核）：「in-band 确定性测试守门；out-of-band 检查确认替身仍匹配现实；失败触发 review 而非打断构建」——本案合成语料=in-band double，真实非 Z 宿主差集=out-of-band check，触发器=out-of-band 的登记形态。**三元结构完整，缺的只是 out-of-band 腿的显式登记。**

**结论 5｜仓内建制已为 (a) 备齐全部先例，(a) 是零新机制落点。** Confidence 高（本地证据）。
- `82-first-external-contributor` registry 条目：`watch: event_bound` + `owner: macro-audit 队列值守` + `verify_method` + `confirmations[]`（registered 决策留痕）——触发器条目的完整字段先例，(a) 只需同构一条。
- desk-task2/desk-task15：event_bound 触发器「fired→criterion met/unmet→decided」全生命周期已有两次实转先例。
- CONTEXT Trigger-gated Closure 词条：「不显式前置、不无限拖延，而是登记一组显式触发事件，任一触发即实测封口」——(a) 是该词条的字面执行。
- CONTEXT Watch Tri-state：event_bound/manual_watch/risk_accepted 三态——非 Z 宿主触发事件可判定（宿主 git 版本元数据已在 D-128④ 采集环境披露面里），event_bound 成立。

## 4) 与账本 current 决策的冲突点（显式指认）

**无改向级冲突；一处建议挂 scoped 澄清注记（呈报，不静默）：**
- **D-128⑤**原文「golden 一次性再生：修复后全环境 stats 归 clean=1，**再生一次即跨宿主稳定**」。后半句在本仓内不可证伪（本宿主本即 Z、再生零差集）。建议：在 R32 新决策（或 D-128 status 格注记）里把⑤的措辞精修为「再生一次＋边界归一机制（合成证据覆盖）即**声明**跨宿主稳定；真实宿主差集证伪工件挂 `first-non-z-dialect-host` 事件触发器」——方向未变（⑤的再生义务与机制结论都保留），属纯披露定界，同 D-132 对 D-127⑥ 的 scoped 澄清先例办理，**无需标 revised**。若用户认为「再生一次即跨宿主稳定」在⑤语境下本就是带条件的机制断言而非已证声明，则连注记也可免——此裁量呈报用户。
- 其余核对：D-130（first-external-contributor 触发器立法）= 同构正支持；D-103/D-117 quarantine 三桶＋Instrument Dialect（D-128②③④）与 (a) 无涉；D-132 golden 锁面「禁锁环境方言值」与触发器无冲突（差集工件是披露面不是锁面）；D-025 双读数纪律不涉（本案单票面单读数）；D-059 git-cli 输出契约已被 D-100②/D-128 revised 链收窄承接，无新冲突。

## 5) 推荐落地要点（(a) 的具体形态）

1. **registry 新条目** `81-first-non-z-dialect-host`：`trigger_event: first-non-z-dialect-host`（触发判据可判定化=D-128④ 已立法的采集环境披露面中出现 git<2.45 方言宿主，即吸收事件计数>0 的真实宿主）；`watch: event_bound`；`owner: macro-audit 队列值守`；`verify_method: 首遇非 Z 方言宿主→golden 一次性再生＋差集工件留证（零差集=声明闭合，非零差集=归一缺陷立案）`；`status: deferred` + registered confirmation（引 D-128⑤ + 本报告）。
2. **known-gaps/报告登记**：R32 收口如实登记「跨宿主稳定在本仓不可证伪（无差集工件可留）；机制层由 dialect-boundary.test.mjs 合成双语料覆盖（fieldStats 逐字节一致 + 吸收事件 4/0 分列）」。
3. **可选加强（不阻塞）**：若未来 first-external-install（#62 先例已证该事件会真实发生）后出现非 Z 宿主报告，触发器自然点燃——无需预建 (b) 的 CI 腿。

## 6) 完整来源清单

| # | 标题 | URL | 角度 | 贡献 |
|---|---|---|---|---|
| 1 | PCAOB AS 1105: Audit Evidence（一手全文） | https://pcaobus.org/oversight/standards/auditing-standards/details/AS1105 | Official | 充分/适当分立；证据质量不可数量补偿 |
| 2 | Applied Testing Strategies — MinimumCD | https://beyond.minimumcd.org/docs/testing/applied-testing-strategies/ | Official/方法论 | in-band 确定性 / out-of-band 验真分层 |
| 3 | Jest 官方 Snapshot Testing 文档 | https://github.com/jestjs/jest/blob/main/docs/SnapshotTesting.md | Official | --ci 只比对不落盘；快照确定性前提 |
| 4 | Snapshot Testing in CI/CD Pipelines | https://helpmetest.com/blog/snapshot-testing-ci-cd-pipelines/ | Comparative/实践 | TZ/locale 归一 = 边界归一同构 |
| 5 | insta (docs.rs) 官方文档 | https://docs.rs/insta/latest/insta/index.html | Official | 分层锁面先例 |
| 6 | zoekt PR#1034 跨平台 git 版本测试矩阵 | https://github.com/sourcegraph/zoekt/pull/1034 | Community/Criticism | #1029 假绿实证＋矩阵成本（64 组合） |
| 7 | LLVM FileCheck 官方手册 | https://llvm.org/docs/CommandGuide/FileCheck.html | Official | 模式匹配锁面（方言容忍断言）惯例 |
| 8 | pytest skipping 官方文档 | https://docs.pytest.org/en/stable/how-to/skipping.html | Official | skipif(reason) 显式登记纪律 |
| 9 | Cypress Conditional Testing | https://docs.cypress.io/app/guides/conditional-testing | Official | 「锚定不变真源」= 注入缝同构 |
| 10 | Bun 大仓 CI 测试纪律文档 | （检索摘要内嵌，GitHub 托管） | Community | 「单环境绿不外推＋known limitations 显式登记」 |
| 11 | swift-snapshot-testing 跨 CI 机漂移 issue | （经引文核读要点） | Criticism | 同环境搭建仍漂移→字节级跨环境稳定不可单环境自证 |
| 12 | 33-gate-registry.json `82-first-external-contributor` 等 event_bound 条目 | 本地一手 | 触发器条目字段先例 |
| 13 | engine/test/dialect-boundary.test.mjs | 本地一手 | 合成证据覆盖面核实（A/B/C/D 四组断言） |

## 7) 信息缺口

1. **Tavily 引擎缺席**：本月配额耗尽，三引擎交叉降级为 Exa+AnySearch 双引擎；关键结论 1/2/3 已各获 ≥2 独立信源。
2. **PCAOB 二手转述未获第二份一手准则**：AS 1105 是本轮唯一直读的审计准则原文；「无法取得充分证据→披露保留意见」的类比引自 AS 1105 框架推论而非某一条 point-of-care 条文直读——该类比只作论证支撑不作硬判据。
3. **insta/Jest 官方均未直接讨论「git 工具版本方言」这一具体方言族**——同构性（timezone/locale/格式化器版本）是类比推断，非同题先例；本案特有设计点（方言吸收器+触发器组合）确认无工业同构先例。
