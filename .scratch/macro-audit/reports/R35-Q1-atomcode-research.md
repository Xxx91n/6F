# R35-Q1 atomcode 调研报告存档

> 调研执行：atomcode -p（题面=R35-Q1-research-prompt.md）｜配额自查：searches 7（anysearch batch×5+tavily×2）｜angles 全 5 类｜full reads 6（changeloop/enterprisecraftsmanship/abseil SWE-book ch12/keepachangelog/changesets GitHub/jyn.dev）＋知识库召回 3 批（R80-Q4、R21-Q1、R22-Q2）｜域名≥8｜置信高。resume handle: 88a4206c-6f6f-4a76-97d2-768e48643ff4

## 1) 执行摘要（TL;DR）

推荐 (c)＝(a)＋(b) 组合，但改写其表述：(a) 的价值不是「消灭复绿 commit 显形」（纯化妆），而是把「编年随行」前置到产生面工序（closeout checklist 显式条目）；(b) 的价值是执行 D-071⑨ 第二轨既有立法——只把 D7 类「每条账行必触发」的增长面钉从字面 indexOf(dMax) 改写为结构不变量（解析 ## [M-xxx] 键集，断言账本 dMax ∈ 编年键覆盖集），低频任务书钉维持字面不动。(d) 的「税=强制函数」论点被实证支持（两次复绿确实抓到 M-013/M-009 真漏录），但业界等价物（changesets status / changeset bot / changelog diff 检查）全部用在场性/结构性检查实现同一强制函数，没有一个钉措辞字面——强制函数本体应保留，其字面实现是该税中可剥离的部分。Confidence：高——工业先例五方交叉，且 (b) 非新立法而是 D-071⑨ 既定修法的执行，与 ADR-0018 Decision-2「机器可解析固定字段行」同向。

## 2) 分点结论

**结论 1：CHANGELOG 执法的业界惯例=「在场性」闸，不钉内容措辞——D7 字面钉超出业界惯例谱系**（Official＋Community，双源：changeloop 2026-09 实务文＋changesets 官方 README）。业界标准形态=CI 检查 diff 里「存在 changeset 文件或 changelog 改动行」，fail 则 block merge；「写得好不好」留给 code review 不在脚本里判。没有主流实践把 changelog 内容与另一份账本最大编号做字面包含断言。D7 功能上等价在场性但实现选了最脆一档。隐含选项：业界有 exemption label（no-changelog-needed）豁免通道，本仓可对应「closeout checklist 显式声明本轮无账行增量」。

**结论 2：字面断言 vs 结构不变量 brittleness 谱系——学界与 Google 双源一致判字面耦合为反模式**（Criticism＋Official，双源：Khorikov Structural Inspection＋Google SWE-book ch12）。Khorikov：钉实现结构/措辞的测试无法区分 bug 与合法重构，false positive 率先崩。SWE-book：brittle test=「对不引入真实 bug 的无关变更也转红」；理想测试 unchanging——纯重构、加新条目、修 bug 都不应改动既有断言。每条新账行必红 D7=恰是 SWE-book 定义下必须修的类。41a-F4 正则钉任务书措辞换代即碎=同病根已付学费。

**结论 3：强制函数执法落点=产生面闸（gate the merge），不是审计面追讨**（Comparative，双源：changeloop「block merge, not deploy」＋R80-Q4 已入库 Fern 指南「gate the merge rather than the release」＋datadef 分档）。Fern：drift is a pipeline problem, not a discipline problem。datadef 分档：客观可修谓词→硬闸，需判断→warn/人验。「编年随行」=纯机械谓词，完全落在可硬闸档。工序拦漏第一道、守卫红漏网后第二道，两层都要不能只留后置层。(d) 只留后置层=承认每轮付漏网成本。

**结论 4：反方论点（税=纪律强制函数）部分成立但推不出「不动」**（Criticism 反向校验，双源：r34/r31 实证＋JSS 2023 snapshot 实证研究 28 文档）。两次复绿抓到真漏录→强制函数有效；但脆断言代价=「很容易在没修问题的情况下让测试变绿」（false-positive→橡皮章化），28% 文档报告高脆弱依赖。红得多≠抓得多——当红常态原因是措辞/编年漂移而非漏录，信号价值被稀释。强制函数正确实现=把红留给真漏录（结构不变量下漏录才红），正是 (b)。2 次/10 轮抓漏战绩可由结构断言同额保留——dMax 不在编年键集内，结构断言一样红。

**结论 5：lint-for-process 边界——机械谓词可 lint，判断不可 lint；本谓词机械，(b) 不越界**（Community＋Official，双源：HN pre-commit 讨论＋jyn.dev 2025）。HN 高赞「Anything mandatory needs to go into CI；hooks 只降 churn」＋jyn 系统论证（hook 可 --no-verify 绕过、跑 working tree 非 index）共同确立：强制保证只能住 CI/守卫层。本仓守卫组=CI 层——故不能采纳「守卫降 dry-run 内嵌工序」的 (a) 单独形态；(c) 中 (a) 只作前置工序、(b) 后守卫仍硬跑，层序不降。D7 谓词（编号在场）机械可判定，不属「用测试逼人写散文」反模式档。

## 3) 对比矩阵（四候选 × 关键维度）

| 项 | 强制函数保留 | 措辞漂移免疫 | 层序合法性 | 立法成本 | 业界同构 |
|---|---|---|---|---|---|
| (a) 工序内化 | 部分（降工序层 dry-run） | ✗（钉不动 F4 型碎裂仍在） | ✗ 保证降级 | 零立法 | hotfix placeholder 流（业界从不撤 CI 闸） |
| (b) 钉面靶向减负 | ✓（漏录仍红） | ✓（仅高频钉） | ✓ | 低（执行 D-071⑨ 既有修法随触碰窗口） | changesets status／diff 在场性检查 |
| (c) 组合 | ✓＋产生面前置 | ✓ | ✓ | 低＋一行 checklist | Fern 管线化＋changeloop merge-闸 双层 |
| (d) 不动 | ✓ | ✗ | ✓ | 零 | 无（业界无「钉账本最大号字面」先例） |

## 4) 与账本 current 决策的冲突点

| 决策 | 关系 | 处置 |
|---|---|---|
| D-071⑨ | 名义冲突：第二轨绑定 manual_watch 触发器（cap 触发或连续 2 复审锚无变化）均未 fire，(b)=提前执行其「增长面→单调包含性」修法 | 不 revised，走触发器追认：锐评快照属实且仍开放→入裁定链；裁定为 Trigger-gated Closure 意义上的显式触发事件（锐评连续两轮实证复绿税），D-144 登记「D-071⑨ 第二轨增长面腿提前触发执行，触发事件=锐评实证」，触发器改挂 triggered-bound bound_to=新票 |
| D-094（字面钉普查 T3/#75批1） | 同向：(b) 钉面改写挂入 #75 批 1 执行，不另立普查 | 无冲突，执行载体并入 |
| D-070（随触碰顺带） | 同向：改写限 D7 类高频钉随触碰窗口顺带，不立大票改 35 文件 | 无冲突 |
| D-139/D-140（搭车禁则） | 约束：守卫断言改写=语义变更须独立 commit；若触发复绿仍走独立复绿 commit（(c) 不试图消灭其显形） | 无冲突，对 (a) 边界修正 |
| ADR-0018 Decision-2 | 强化：仓根 CHANGELOG 法定为机器可解析固定字段行——D7 改写为「解析 M-xxx 键集断言包含 dMax」=把机器可解析承诺落到断言实现 | 无冲突，正向 |
| D-073/D-071③（sealed/断言照跑） | 不涉及：D7 是活契约的脆实现非失效断言，不入 XFAIL 册 | 无冲突 |
| (a)「消灭复绿 commit 显形」子项 | 与复绿独立 commit 惯例轻微冲突：工序内化使漏录收口前被拦则复绿 commit 自然消失（良性）；不得为消灭显形而降守卫为 dry-run | (a) 采纳 checklist 子项，否决降级子项 |

## 5) 完整来源清单

changeloop.dev/blog/changelog-ci-enforcement（在场性检查边界表/豁免 label/block merge not deploy/placeholder 惯例，2026-09-07）；github.com/changesets/changesets（changeset bot/status 入 CI 官方形态）；keepachangelog.com/en/1.1.0（编年纪律本源规范，ADR-0018 上游）；enterprisecraftsmanship.com/posts/structural-inspection（Khorikov 反模式判定框架）；abseil.io/resources/swe-book/html/ch12.html（brittle test 定义/unchanging tests 四类变更模型/测试维护税定性）；jyn.dev/pre-commit-hooks-are-fundamentally-broken（hook 非保证层系统论证，2025-12-26）＋HN item 46398906（强制必入 CI 共识）；homepages.dcc.ufmg.br/~mtov/pub/2023-jss-snapshot.pdf（JSS 2023 snapshot 实证，28% 文档脆依赖）；本仓知识库 R80-Q4/R21-Q1/R22-Q2 历史调研；本仓实物 41a-check.mjs L71/pin census。

## 6) 信息缺口

1. 测试维护税严格量化文献未找到（无「每 KLOC 每年 X 小时修脆测试」测量研究）；以 SWE-book 定性＋JSS 28 文档实证替代，结论不受影响但强度降半档。
2. lint-for-process 专门学术讨论未找到独立一手文献，以 HN/jyn 社区共识＋Google presubmit 实践拼合。
3. D7 改写后 dMax 编年键集解析的具体实现（M 行区间覆盖 vs 全键枚举）属落地设计，留给 #75 批 1 票面。

**裁定建议**：采纳 (c)，(a) 收窄为「closeout checklist 增『账行增量↔编年随行核对＋收口前跑守卫组』显式条目」、否决「守卫降 dry-run」；(b) 限 D7 类增长面钉、走 D-071⑨ 提前触发＋D-094/#75 批 1 载体＋D-139 独立 commit 约束。
