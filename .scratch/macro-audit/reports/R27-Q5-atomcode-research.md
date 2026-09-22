# R27-Q5 atomcode 深调研报告 —— 过期 xfail 册条目摘除裁（xfail-45-h5）（2026-09-22）

> 置信度：高（XPASS-as-signal 纪律 pytest 官方+Ganssle+QASkills 三源一致；失配≠修复判据 Ganssle raises= 论证+Ben Schmidt 反向 TDD 双源）。searches 6+｜原文全读 7｜缺口：Tavily 配额耗尽、test intent decay 术语无专文（flaky/mutation/suite-decay 三邻域覆盖）、Antikythera 抓取失败。题面存档=R27-Q5-research-prompt.md。

## 1) 执行摘要

**推荐 (c) 改写意图（新断言顶替旧壳）+ 摘除松散分支，且本次 XPASS 不得作为摘除触发**——理由与直觉相反：本次 XPASS 的**归因本身就是裁决证据**。复绿归因=「无关 demo 字样偶然命中」非「意图被满足」，则 XPASS 标准处置纪律（XPASS=守护对象闭环→摘除）**不适用**——适用 GitLab 隔离类型学 `:stale`（断言因 feature 变更失配）而非「已修复可摘除」。

## 2) 分点结论

### ① 册条目生命周期三态裁法

- **strict XPASS=硬红是行业公约**：pytest 官方文档 strict 模式下 XPASS 使套件失败（用途即「意外转绿须人工裁决」）；QASkills 2026、Ganssle 均荐全局 xfail_strict=true——与本仓「XPASS 一律红无 lenient 逃生门」同构（三源）。
- **摘除合法触发=「意图被满足」**：Ganssle 精确判据「remove xfail marker 后套件仍全绿=bug 已修」——**摘除=删 marker+留断言**（条目遗产=作为回归测试继续活，ratchet 修复后永不回挂），不是删断言本身。
- **GitLab 类型学**：隔离含 :flaky/:bug/:stale/:broken 七类，**:stale（feature 变更导致断言过时）正是本题形态**；隔离硬性临时（3 个月自动删除倒计时+每周进度更新）——「守过期意图=册内僵尸」代价被量化为硬性 SLA，无永久保留选项。
- **保留代价实证**：Google 测试库 16% flakiness、84% pass→fail 转移是噪音——僵尸/失配条目直接代价=信号稀释（airline pilot 效应，人对整册脱敏）。

### ② 「断言名↔检查内容失配」工业界心智

- **Ganssle is_perfect_square 反例=本题镜像**：strict xfail 测试因测试体自身 bug（未绑定变量 w）碰巧失败，修真 bug 后 XPASS 但与守护意图无关；raises= 参数钉失败方式是钝器。**结论：strict 只保证「失败时红」不保证「绿的语义正确」——XPASS 归因审查是必须的人工环节（与本仓现状一致）。**
- **松散 || 分支=断言无牙（assertion without teeth）**：能被无关 demo.test 字样满足的 || 分支=「能被错误原因满足的断言」——平时给册子假安心、XPASS 时给假信号。检测惯例=mutation testing 思路（Stryker/pitest/cosmic-ray）：故意破坏目标行、期待红、仍绿=断言无牙。
- **断言腐化预防=反向 TDD 纪律**（Ben Schmidt）：先在旧断言上跑红、读失败原因、确认「红是因守护路径被触达且结果改变」再改写——本题归因验证协议：**改写前先删 || demo 分支跑一次，确认裸 #45 断言确实红（而非靠 demo 分支偶然绿）**。

### ③ 推荐判据

| 判据 | 摘除 (a) | 收紧 (b) | 改写 (c) |
|---|---|---|---|
| 意图状态 | #45 闭环守护对象消失→僵尸 | 意图已过期→收紧后永远红→新僵尸 | 显式声明新意图 |
| 本次 XPASS 归因 | 「意外修复」→合法摘除触发（但本案不属此类） | 不适用 | 「偶然命中失配分支」→XPASS 不算数 |
| GitLab 类型学 | :bug 修复后 dequarantine | 不存在此选项 | :stale→rewrite-or-delete |
| 历史追溯 | #45 闭环事实在工单系统，册子不是归档系统 | — | 新条目可挂 supersedes xfail-45-h5 |

**推荐=(c) 改写为默认，且改写内容必须二选一走反向 TDD 协议**：
1. 若「#45 闭环证据仍可追溯」是新真意图→先验证裸断言（无 || demo）当前确实红→绿→顶替旧条目标注 superseded；
2. 若判断「落点记录存在于任务书」不再值得守护（常见真实——文件轮换、字面值断言必碎）→**退回 (a) 摘除条目+断言**，此时改写只是给不值得守的东西造新壳。
- **(b) 任何情形不成立**：意图过期后收紧=守永远红的死断言=「松散僵尸」升级「红僵尸」，违反 strict XPASS 体系红线（未登记 FAIL）。

### ④ 辩证与反例

- **摘除派担忧的反向裁**：「闭环证据仍可追溯」若其实是审计/合规需求，摘除会让回归静默漂移——但**需要放进预期失败册的追溯性断言本身就是分类错误**：追溯要求应是常驻断言而非 xfail。「摘除丢历史」多半牵强：册子不是归档系统，git 历史和工单才是。
- **膨胀 vs 腐化真实代价**：Google 数据=腐化册子代价是信号稀释；GitLab 3 个月自动删除倒计时=膨胀的唯一可持续解是**机械化过期自清**非靠人自觉。本仓已有 cap+复审锚+XPASS-strict 三防同构。
- **本次 XPASS 最深教训**：暴露的是**断言体质量**非条目问题——任何新条目若体内留 || demo 类便利分支，同偶然命中还会再发生；改写必须顺带 mutation 检验：新断言在「意图未满足」的世界里必须红。

## 3) 来源清单

| 标题 | URL | 角度 | 贡献 |
|---|---|---|---|
| pytest skipping/xfail 官方文档 | docs.pytest.org/en/stable/how-to/skipping.html | Official | strict XPASS=硬红公约 |
| Ganssle pytest-xfail 博客 | blog.ganssle.io/articles/2021/11/pytest-xfail.html | Community | 摘除=删 marker 留断言判据、is_perfect_square 失配镜像（全文已读） |
| GitLab quarantine handbook | GitLab handbook | Official | 七类隔离类型学、:stale 即本题形态、3 个月自动删除 SLA（全文已读） |
| QASkills xfail 指南 2026 | QASkills | Community | xfail_strict=true 推荐三源之一 |
| Google Testing Blog | testing.googleblog.com | Official | 16% flakiness、84% pass→fail 噪音=信号稀释实证 |
| Ben Schmidt 断言腐化案例 | iambenschmidt.com | Community | 断言无牙、反向 TDD 协议（全文已读） |
| Stryker/pitest/cosmic-ray | mutation testing 生态 | Community | 「故意破坏期待红仍绿=断言无牙」检测惯例 |

## 4) 信息缺口

- 「test intent decay」无专文——现象分散于 flaky test 管理/mutation testing/test suite decay 三话题下，替代材料已覆盖；
- Antikythera 原文抓取失败（lenient xfail 掩盖 field-parsing bug 案例未核验）；
- Tavily 配额耗尽，第三引擎交叉由 AnySearch+ctx 知识库历史报告补足（R21-Q1 三防设计与外部发现同构=事实双源）。
