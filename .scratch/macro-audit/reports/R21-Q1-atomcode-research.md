# R21-Q1 调研报告：陈旧守卫生命周期治理

> 来源：atomcode 深调研（2026-09-18，session 25768516-9dd7-4913-928e-12f9f48f9184）。题面=R21-Q1-research-prompt.md。置信：高（工业先例四方交叉一致：pytest/TAP/Chromium/rustc）。

## ① 结论（TL;DR）

**推荐 (a) 清单制为主体，(b) 的 expires/superseded-by 并入清单 schema（但否决「过期转 archived 不跑」——照跑），(c) 降格为 (a) 的执行载体（33-check 单点消费清单做元校验），(d)(e) 否决；同时立第二轨「断言输入面快照化」治本，随触碰窗口逐守卫推进。** 一句话：用 pytest strict-xfail 的心智模型把 9 条陈旧 FAIL 从「常态红」转为「受控 XFAIL＋XPASS=红＋复审锚＋数量上限」，清单不触碰冻结快照本体（不破 D-061/D-063 冻结语义），而病根（断言锚定滚动输入面）用 D-068 committed-baseline 同构手法另行根治。

## ② 逐候选裁定

| 候选 | 裁定 | 理由 |
|---|---|---|
| (a) known-failures 清单制＋三态输出 | **采纳（主体）** | 工业最成熟心智模型：pytest xfail、TAP TODO、Chromium TestExpectations、rustc known-bug 全部是「声明式期望态标注＋照跑」，无一例外。三态（XFAIL/XPASS）解决「FAIL 常态化」核心病：红不再被无视，且修复自动显形 |
| (b) 守卫级过期元数据，过期转 archived 不跑 | **字段并入 (a)；「不跑」否决** | expires/superseded-by 字段有价值（对齐 D-041 复审时点），但「过期不跑」违反全行业惯例：Chromium 明文「不该 skip failing test，应加 failure expectation 让它照跑收集数据」（TestExpectations 文件头注释原文）；TAP TODO 照跑；rustc known-bug 照跑当哨兵（「sentinel that will fail if the bug is incidentally fixed」原文）。不跑=失去 XPASS 自清信号 |
| (c) 维持现状＋归因机检强化 | **降格为 (a) 的执行载体** | 「33-check 单点消费期望集」方向正确，但期望集不该是 t8 归因清单的升格版，而该是结构化 stale-assertions.json；「不改 NN-check 输出态」保留了 FAIL 常态化病灶本身。9 条 FAIL/5 守卫已过 D-063 L2「复现≥3 次」立票阈值，维持现状不成立 |
| (d) 复写冻结快照重基线 | **否决** | 直接破 D-061 golden 版本化纪律、D-063 L1「冻结只读留档」、D-070⑥「基线=git 史现状即决议」、R14 lesson「历史 NN-check 断言按快照冻结不重写」。且无必要——(a) 已解决红噪，重基线是拿审计证据链换整洁 |
| (e) 缓挂 | **否决** | 单次现象才缓挂（D-063 L2 阈值惯例）；现在是 9 条跨 5 守卫的复发性常态，且已有 t8-watch-review 人工归因清单——机制化条件全部齐备，缓挂=人工值守税持续累积 |

## ③ 工业先例证据（带 URL）

| 来源 | URL | 贡献 |
|---|---|---|
| pytest Skipping/XFail 官方档 | https://pytest.org/en/latest/how-to/skipping.html | strict/xfail_strict 语义、XPASS=红原文 |
| pytest skipping.py 源码 | https://github.com/pytest-dev/pytest/blob/8b3550c6/src/_pytest/skipping.py | XPASS(strict) 实现级核验 |
| Chromium TestExpectations 源文件 | https://chromium.googlesource.com/chromium/src/+/main/third_party/blink/web_tests/TestExpectations | 禁 skip failing test、照跑原则原文 |
| WPT out-of-band metadata | https://web-platform-tests.org/writing-tests/out-of-band-metadata.html | META.yml 字段现状（无 expiry） |
| TAP 规范 | https://testanything.org/tap-specification.html | TODO bonus→转正机制原文 |
| Jest snapshot 官方档 | https://jestjs.io/docs/snapshot-testing | CI 不自动写快照、--ci 语义 |
| insta changelog | https://insta.rs/changelog | CI=true 强制 --check 行为 |
| rustc-dev-guide UI tests | https://rustc-dev-guide.rust-lang.org/tests/ui.html | known-bug 哨兵语义 |
| oneuptime quarantine 治理 | https://oneuptime.com/blog/post/2026-07-28-quarantine-flaky-tests/view | 到期记录 schema、population cap、双 lane |
| Firefox test-manifest-toml lint | https://firefox-source-docs.mozilla.org/code-quality/lint/linters/test-manifest-toml.html | skip-if 机器可读化 lint |
| Medium snapshot tests 批评 | https://medium.com/did-you-know-the-journal-blog/whats-wrong-with-snapshot-tests-37fbe20dfe8e | 快照腐化病根=易变值入快照 |

## ④ 落地形态设计

**清单文件 `.scratch/architecture-recovery/reports/stale-assertions.json`：**

```json
{ "version": 1, "cap": 10, "entries": [ {
  "id": "xfail-41a-52a-split-anchors", "guard": "41a-check", "assertion": "52a-split-anchors",
  "attribution": "预存漂移：#52 拆为 #52a/#52b 后断言锚名过时", "failure_class": "preexisting-drift",
  "evidence": "t8-watch-review.md §3＋A-ledger A-061", "review_round": "R21",
  "review_anchor": "stage3-close", "expires_fallback": "2026-12-31",
  "superseded_by": null, "added": "2026-09-18" } ] }
```

**断言 id 命名规则**：`xfail-<guard>-<assertion-slug>`；slug 取断言语义（52a-split-anchors／next-round-t-seq／a-range-window）。前置条件：NN-check 输出须先有断言级稳定 id（现在只有整守卫 exit code）。

**三态输出协议改动面**（逐守卫小改，D-066「同族增量不立大票」）：每断言输出 id＋status: PASS|FAIL|XFAIL|XPASS；exit 语义=存在未登记 FAIL 或任何 XPASS→非零；仅已登记 XFAIL→零，但输出顶部打印 `XFAIL: n (cap 10)`（D-068⑤ 机检边界显式化同构，防绿灯=虚假安心）；strict 语义=XPASS 一律红逼摘条目，无 --lenient 逃生门。

**33-check 元校验（单点消费，直接 enforce）**：①清单引用 (guard,assertion) 对必须在守卫输出中存在，悬空=FAIL（Chromium stale-expectation 检测同构）；②evidence 指针存在性校验；③复审锚逾期未动→报警（D-041 逾期→risk_accepted 候选同构）；④条目数>cap→FAIL，超限=立票批量处置非继续加条目。

**第二轨·输入面快照化（治本，随触碰窗口推进）**：三类病根三种修法——①票拆分面（41a×4）：锚点引用加内容 hash＋时点（D-068 committed-baseline 同构）；②滚动面（43：next-round.md 每轮重写）：断言改锁结构不变量（「当前轮任务书存在且含 T 序列」）而非「T 序号=某值」；③增长面（45：a_range）：断言改单调包含性（新⊇旧）而非等值。不立大票一次性改 30 守卫，按 Fowler opportunistic refactoring／D-070 顺带清先例随触碰窗口做。

## ⑤ 失败模式与治理

| 失败模式 | 治理 |
|---|---|
| 清单变永久豁免坟场 | strict XPASS=红自清＋复审锚逾期报警＋cap≤10 三防（pytest strict／oneuptime cap／D-041 逾期机制三源同构） |
| 真回归被误标 XFAIL（broken ≠ flaky） | 归因必挂 evidence 指针且 33-check 校验其存在；破坏性漂移禁入清单——Trunk 原则「真回归不得隔离」 |
| 断言改名后清单条目悬空 | 33-check 悬空=FAIL（shape 面确定性断言，D-068⑥ 同构） |
| 三态被下游误读为绿灯 | exit 协议显式化＋顶部 XFAIL 计数常显 |
| 清单与 D-068⑦「无独立豁免文件」张力 | 划界：baseline 更新=豁免动作本身（一次性）；XFAIL 条目=期望态声明＋强制复审锚＋XPASS 自清（持续性受控）——语义不同不冲突；条目连续 2 复审锚无变化→33-check 提示「转结构性修复（第二轨）」 |

## ⑥ 与本仓决策冲突核查表（逐条）

| 决策 | 冲突面 | 裁定 |
|---|---|---|
| D-037⑤ advisory→enforce 两段式 | 清单元校验要不要两段式 | 不冲突——两段式适用前提=外部校验器＋无事故实证（D-066）；本断言纯结构校验确定性 100%，按 D-068⑥ 先例直接 enforce |
| D-041 watch 三态 | XFAIL 是不是第四态 | 不是——XFAIL 是守卫输出态，registry 三态不动；清单条目=manual_watch 机检化变体，五要素完整映射 schema |
| D-055 先例注记 | 「FAIL 不扩大」纪律被机制替代 | 需一行显式勘误注记（人工逐轮比对→清单制机检），本体冻结语义不改写——D-055 成对落盘惯例照办 |
| D-063 有实证即裁决／L1 冻结分支 | 9 FAIL 是否够立票；(d) 是否可行 | 立票正当（≥3 次复现阈值已过）；(d) 直接违反 L1「冻结只读留档禁改写」，否决 |
| D-066 守卫分层 | 三态改动属哪层 | shape 面（结构校验）→enforce；不引入外部校验器，无需 advisory 窗口 |
| D-068 baseline 机制 | 清单是否变相豁免文件 | 同构非冲突：committed-baseline 论证直接迁移第二轨输入面快照化；豁免语义区别见⑤末行 |
| D-061 golden 版本化 | 清单是否碰 golden | 不碰——清单只改输出态分级，golden/NN-check 文件零改写 |
| R14 WORKFLOW lesson | 历史 NN-check 冻结不重写，值守以 registry+33-check 为准 | 完全同向：清单制正是把值守面从 t8 人工清单升级为 33-check 机检 |
| D-070⑥ 基线=git 史 | (d) 重基线 | 支持否决 (d) |

**题面核心张力正面回答**：清单制**不**隐性破冻结语义——冻结的是断言本体与 golden 证据链，清单是输出态分级层，断言照跑、快照照冻。但题面对病根判断正确：**守卫输入面（BACKLOG/next-round/ledger 行）随轮滚动才是陈旧 FAIL 主源，治本确应是「断言输入面快照化/结构不变量化」**（第二轨），清单制是止血层而非治本层——两层都要，顺序=先清单止血（本轮可落）、再随窗治本（不立大票）。

## ⑦ 信息缺口

1. Chromium TestExpectations 是否存在硬 expiration 字段：倾向结论「事件/工具制非日历制」，中置信（docs 镜像 404 未读全文）；
2. wpt-metadata expected-failures META.yml 具体字段与 stale lint 机制未读原文；
3. mochitest stale annotation 清理流程仅 snippet 级未核原文；
4. 本仓 30 个 NN-check 输出协议现状（是否已有断言级 id、exit code 约定细节）未实跑盘点——落地前需先跑一轮只读盘点。

## ⑧ 建议追问

1. 复审锚用事件制还是日历制？建议：事件制为主（review_anchor: stage3-close，对齐 registry review_event 推进机制，A-061 已有先例）＋expires_fallback 日期兜底双字段——纯事件制在锚点长期不到时无限挂起；
2. 第二轨（输入面快照化）本轮立票还是挂触发器？建议：挂 manual_watch 触发器「XFAIL 条目数触 cap 或单条目连续 2 复审锚无变化」→立票，避免一次性大改 30 守卫；
3. 33-check 元校验悬空条目=FAIL 还是 WARN？建议 FAIL（shape 面确定性断言，D-068⑥ 同构），若担心首轮迁移期噪音可按 D-066 两段式给 1 窗口 advisory。

