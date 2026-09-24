# R31-Q4 调研报告：测试 fixture 落点——域级 test/fixtures 自管 vs 集中 fixtures/golden 注册树

> atomcode 深调研存档（R31 轮，题面=R31-Q4-research-prompt.md）。检索：web_search+知识库召回（Tavily 额度耗尽、AnySearch 不可用）；11 源含 CRS R45153/Go testdata/Rust insta/pytest/chroma PR #6771/kysely PR #1456/monorepo 实测等。

## 1) 执行摘要

**裁决推荐=(a) 同构范式追认，置信高。** 依据：其一，D-038 字面射程只点名「25-D4 演示入口形态」——资产形态条款捆绑「随 tgz 分发」「demo 命令入口」「CASRAI 披露块」三消费面谓词，micro-b 断言件零命中；其二，test/fixtures/ 已有 codelore/github-rest/narrative 三 sibling 全自管零 tgz，micro-b 是第 4 个同构先例，追认成本为零。外部生态（Go testdata/Rust insta/pytest conftest/golden-file 全家族）一致支持「断言件就近跟测试走、分发面只含对外契约件」；把单测件混入分发面有 chroma 18 包 Turbopack crash 真实事故先例。(b)(c) 均无收益且各有实害。

## 2) 分点结论

**结论1：D-038 立法域按字面即不覆盖 micro-b 件——plain-meaning 检验本身就能裁决，无需动用立法意图。** D-038 原文：「资产形态=fixtures/definitions+golden+generator 随 tgz 分发；入口=demo [--scenario] 命令；披露块=CASRAI 式合成不冒充真实」。micro-b：不随 tgz（在 test/ 下）、无 demo 消费方、非对外展示面。三条件零命中。〔仓内立法文本〕

**结论2：裁决学上 textualism 问「文本点名了谁」而非「规则能不能硬套」。** CRS R45153 框架：textualism 问普通读者从文本读出什么，purposivism 问立法者解决什么问题——两路径同向收敛：文本上 micro-b 不被点名，目的上 D-038 为对外演示契约面立法。两路径同向=裁决无张力。〔官方+学术〕

**结论3：工业一致惯例=断言件/golden 件就近跟测试走，默认被分发排除或不主动纳入。** Go 官方 testdata=工具链忽略、专为 ancillary test data（goldie/golden 库 default=testdata）；Rust insta 官方=snapshot stored right next to the test file；pytest=per-directory conftest 作用域。golden-file 生态无一例把快照放进随包分发树。〔官方×4〕

**结论4：分发面 vs 测试面混装有真实事故先例。** chroma PR #6771（2026-03）：files:["src"] 未排除测试件→18 个 npm 包发出 *.test.ts+jest/dotenv devDeps 引用→消费方 Turbopack crash；kysely PR #1456：.npmignore denylist 连续失误→改 allowlist；npm 官方默认忽略清单不含 test/fixtures。(b) 案迁入 fixtures/golden/=反向重演事故链。〔官方+事故〕

**结论5：自描述目录（每域自带 manifest）是规模化演进方向，全局注册表是合并冲突面。** node-monorepo-perf 实测：中心化清单每变更 ripples N 包、253 冲突标记量级；package-first 哲学=包自持代码+测试+清单。D-130② 刚立法「枚举指针须生成式」同构反照：注册进全局 manifest=新增手维护枚举指针。〔对比实践+仓内立法同构〕

**结论6：仓内现状与三 sibling 完全同构，(a) 是追认不是创新。** codelore 47 件+manifest/github-rest 5 cassette/narrative seal-golden 全自管全测试内部零 tgz；micro-b manifest 自带 kind/schema_version/generator+inputs/golden 指针，消费方=micro-b-emit.test 单文件。〔仓内一手〕

## 3) 对比矩阵

| 项 | 分发契约面(tgz) | 消费方 | 注册面 | 与 D-038 关系 | 外部先例 | 实害 |
|---|---|---|---|---|---|---|
| (a) 域级自管 | 不进 | 单一测试件 | 域内 manifest | 立法域外·sibling 同构 | Go testdata/insta/pytest 一致 | 无；追认零成本 |
| (b) 字面接入 | 进（用户可见） | 测试件+错配分发面 | 全局 manifest（双树两处） | 字面硬套扩缩立法域 | 无 golden 生态这么做 | 断言件入契约面（chroma 模式）；manifest 混装两种锁语义（逐字节锁 vs 骨架锁） |
| (c) 双注册 | 半进（引用面） | 同上+歧义 | 双真源 | 两可·最劣 | 违反 monorepo 单真源纪律 | 双真源漂移+手维护枚举指针（违 D-130②） |

## 4) 判据总结

**通行判据=「谁消费它」，且可从仓内立法文本直接读出**：D-038 资产形态条款每条都绑消费面谓词（随 tgz/demo 入口/对外披露）。凡不命中谓词的 fixture 即落立法域外，按 sibling 惯例自管——与 textualism/purposivism 双路径收敛及 D-130② 生成式索引治理方向同构。无需修法：D-038 零修订。

## 5) 落地建议

采 (a)：micro-b 件留驻 engine/test/fixtures/micro-b/ 自管，账本以「D-038 立法域=对外演示契约面（tgz/demo/披露三谓词）＋test/fixtures 四域 sibling 同构」追认，D-038 零修订；同时登记正向规则备查——「golden 类工件落点问『谁消费它』：对外契约面→fixtures/golden，测试断言面→test/fixtures/<domain>/」。

## 6) 冲突核查

**零冲突，无 D-xxx 需 revised。** D-038 三谓词零命中不触字面射程；D-061 golden 版本化纪律=micro-b manifest 自带 schema_version/generator 已自持；D-127⑥=micro-b note 逐字声明「字段骨架非内容值」忠实实现；D-130=(c) 会新增手维护枚举指针反向——弃 (c) 仓内立法依据；ADR-0023 票面未规定落点；D-127 退路 C 引「D-038 fixture golden 为判据」属判据性引用非落点立法。

## 7) 信息缺口

- 「谁消费它」判据无成文条款直接背书（npm files 语义+Go testdata 谓词+D-038 三谓词结构归纳的通行模式非单点引用）；
- Tavily 配额耗尽/AnySearch 不可用，第三引擎由 ctx_search 知识库召回补位；
- pytest 官方对「测试数据文件」落点惯例成文性弱（fixture 一词指函数级机制），以 conftest per-directory 作用域为最贴近佐证。

## 8) 来源清单（节选）

1. 仓内 ledger D-038/D-061/D-127/D-130 立法文本 [一手]；2. 仓内双 manifest+test/fixtures 树 [一手]；3. CRS R45153 statutory interpretation [官方/学术]；4. Go cmd/go testdata + golang/go#24732 [官方]；5. Rust insta snapshot-types [官方]；6. pytest fixtures/goodpractices [官方]；7. chroma PR #6771（18 包 Turbopack crash）[事故]；8. kysely PR #1456（denylist→allowlist）[实践]；9. files vs .npmignore 对比文 [实践]；10. node-monorepo-perf 冲突实测 [实践]；11. znck.dev package-first [社区]。