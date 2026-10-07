# R66-Q6 调研题面——P3-3 emit 计量口径修复形态

## 背景（仓内实证，非转述）

- 守卫盘点抽取器 `D:/Aworker/6F/.scratch/architecture-recovery/reports/update-70-inventory.mjs:74`：emit 位抽取谓词=逐行 `matchAll(/\b(t|ok|check|w|w58|sealed|x)\s*\(/g)`；
- **缺陷实证**：每件守卫的 emit 助手定义行 `function t(name, ok, detail) {...}` 本身含 `t(` 字样→定义行被计为一个 emit 位；同族 `function ok(`/`function check(` 等七签名族定义行同病；实测波及 **35 个守卫**（各 +1 幻影 emit 位，slug=伪 slug `name`）；
- **名实缝定性**：该文件头注口径明写「口径=emit **调用点**（t()/ok()/check()/w()/w58()/sealed()/x() 七签名族）」——实现把「调用点」算成「任何 `t(` 出现」=实现与声明口径错位（与本仓 P1-2 skip 窄化同族：声明-实现可对不齐缺陷类）；62-65 行已独立解析定义行做 namePos 参数位映射（定义行在代码内已被识别——只是第 74 行的 emit 扫描未排除它们）；
- **下游消费面**：63-assertion-inventory.json（emit sites 总量＋逐守卫 assertion_ids/call_styles）＋75a-census-register.json findings=403 基线＋下游钉值守卫（census 断言）——修抽取器→emit 计数 -35→派生读数与钉值全漂；
- **立法语境**：D-128「观测仪器方言 vs 主体自载病态」范畴立法先例（仪器误差→修仪器＋披露面留痕非计入主体统计）；D-177 预声明工序；D-181 勘误通道；D-183 微修+同型普查工序；D-169/D-171 AR 五要件（缓挂须补偿控制）；P1-2 先例=声明-实现错位必修；
- **波及面边界**：修法=排除「定义行」两类形态（`function <sig>(...)` 与 `const <sig> = (...) =>`／`const <sig> = function(`）——七签名族定义行各自只出现一次（定义唯一），call site 照常计；stripComments+maskStrings 双轨已在（注释/字符串内伪调用不计）。

## 待裁问题

P3-3（inventory 计数把 emit 函数定义行计入 emit 位）修复形态：

- **(a) 修抽取器＋仪器误差通道**：谓词排除两类定义行→再生 63-inventory→受影响钉值/基线按 D-177 预声明一次重钉→账本按 D-128 先例定性（幻影 emit=仪器误差非主体病态——修仪器＋披露留痕「emit 计数口径修复」）；修复=实现回归已声明口径非改口径；
- **(b) 口径句改写合法化**：头注改「emit 位=调用点+定义行」不修实现——伪 slug `name` 入册＋定义行不产生断言＋七族定义行重复计语义经不起追问=仪器缺陷奉为口径，污染下游一切 emit 派生量；
- **(c) 缓挂 known-issue**：35 件已实测＋修法明确＋读数持续被消费——AR 五要件中「可验证补偿控制」缺位（失真读数仍进 census/下游），D-171「wontfix 恒久类」亦不成立（事实判据依赖存续失真）；
- **(d) 顺手全口径重审计**：借修把词边界/注释/字符串伪命中/七族定义重复计全复核——扩面超 P3-3 裁量边界（须走独立裁定票）。

我的初步推荐=(a)。**两个须调研裁决的疑点**：①「emit 位」的工业标准口径是什么——静态分析生态（call-site counting／SonarQube／coverage instrumentation〔Istanbul 的 counter 插入语义=执行点非定义点〕/mutation testing 的 mutant 锚点定义）如何界定「调用点 vs 定义点」，是否有「定义点也算 emit」的先例使 (b) 非全无理；②重钉路径——63-inventory 是生成物（update-70-inventory.mjs 再生），其再生引起的下游钉值漂移应走什么通道：D-177 预声明一次重钉（我推）／golden 逐件重批／还是「生成物再生禁搭车」（D-140② 同族）约束下的独立 regenerate commit＋下游钉值 commit 拆分——工业界（golden-file testing／ApprovalTests／Jest snapshot 大规模重基线纪律）如何处置「仪器修复引起的批量基线重生成」。

## 调研要求（纪律面不变）

1. **必须回顾本地三大件**（本地文件读取工具按需/全量核读）：`D:/Aworker/6F/.scratch/macro-audit/decision-ledger.md` 全部 status=current（重点核 D-128 仪器方言先例／D-177／D-181／D-183／D-169/D-171／D-140② 生成物纪律／D-146⑤ 勘误文法／一切涉 census/inventory/emit/golden/基线条目——冲突核查逐条对照不许泛称）；`D:/Aworker/6F/docs/adr/` 全条目；`D:/Aworker/6F/CONTEXT.md` 全词条；另须直读 `update-70-inventory.mjs` 全文＋`63-assertion-inventory.json` 结构＋75a 两 JSON 消费面；
2. **工业界成熟落地心智模型（重点）**：调用点/定义点计量口径先例族（Istanbul/nyc instrumenter counter 语义、mutation testing Stryker/pitest mutant 锚点、SonarQube 函数调用度量、compiler callsite 计数惯例、代码索引 Sourcegraph/LSIF occurrences 定义与引用分离惯例）；golden/snapshot 批量重基线纪律（Jest -u 大宗重生成惯例、ApprovalTests 重批纪律、golden-file-testing 「instrument fix → mass regenerate」先例、Chrome/skia goldens 重基线工作流）；「仪器修复 vs 数据修正」定性先例（D-128 外部佐证——测量仪器修正后历史数据留痕 vs 重写的工业惯例）；
3. **辩证性看待**：逐候选点评论证 (a)~(d)；特别评估 (a) 的暗面——-35 读数变化是否可能掩盖真实 emit 流失（重钉时如何证明漂移全部来自定义行排除而非真实信号）；及「定义行本身也是 emit 语义载体」的反面论点（t() 定义行确实「执行」了一次函数体编译——是否真有文献把定义点计入 instrument sites）；
4. **冲突核查（硬要求）**：若与账本任何 current 冲突（重点核 D-140② 生成物再生纪律对「重钉 commit 结构」的约束、D-183 微修边界 35 件波及是否超界转立法面、D-128 先例对本案的类推合法性），列冲突表逐条处置建议；
5. **结论交付**：核心推荐（含裁定文本骨架可直接改写账本条目）＋置信度＋信息缺口清单。
