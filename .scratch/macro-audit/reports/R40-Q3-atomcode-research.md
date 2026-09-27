# R40-Q3 atomcode 调研报告存档（守卫面运行环境契约；atomcode -p 同题；Sufficiency：11 searches/5 angles/7 full reads+2 fetch 失败如实标注；Tavily 配额耗尽降 Exa+AnySearch 双引擎）

# 守卫面运行环境契约调研报告（R41 候选裁定支撑） > 3) 候选对比矩阵
## 3) 候选对比矩阵

| 项 | 工业先例强度 | 与仓内既有裁决自洽性 | 残余风险 | 备注 |
|---|---|---|---|---|
| **(i) 分层契约**（portable tier＋env-contract tier＋env SSOT＋01 repo-relative） | **高**：pytest/JUnit/Go/Bazel 四生态同构；kit #518 同缺陷同修法；receipt/快照为第二通道 | **高**：=D-157② 留白裁面的正解；SKIP-with-reason=D-150③「不可得读 N/A」既有教义的推广；manifest 入册=D-149④ 延伸 | 新 tier 须进 manifest 自声明＋未声明=红（stevenengelhardt 治理），否则 tier 退化成事后标签 | **推荐**。两档执行面：portable tier 自包含任机绿；env-contract tier 探测→skip-with-reason，skip 计数不门禁 |
| (ii) 全面拔除＋mock fixture | 低：mock sibling 实物无先例；env-var 寻址才是标准 | **低**：mock 使 37/39/46 结构性恒真，撞 R23 恒真探测纪律；对 38/40/42 等 6 件内容级提及是过度手术（它们零依赖，本就不会红） | 断言失效、维护两套 fixture | 否。最多对内容级 6 件做顺手解耦，不构成独立候选 |
| (iii) 文档声明机器绑定=有意设计 | 低：DeepSource 把绝对路径定为 lint 缺陷类；kit 把环境缺失渲染红定为 bug | **低**：known-red 永久化撞 R21「quarantine is temporary」；公开仓外人 clone 必红的体验与 Apache-2.0 公开承诺矛盾 | 账本黑洞化 | 否。仅可作为过渡期 README 披露层，不能作为终态 |
| (iv) 最小修（01 自指＋sibling env 化，无 skip 语义） | 中：修了缺陷但留一半 | 中：01/SSOT 合规，但**缺 sibling 时仍 FAIL=kit #518 的 before 状态**（env 缺失渲染红） | 外人 clone 见 6+ 件假红，报告失去可信度 | 不够。作为 (i) 的第一执行切片可行，作为终态不行 |

## 分层

### 守卫面运行环境契约调研报告（R41 候选裁定支撑） > 2) 分点结论 > E. 绝对路径机器绑定：公开仓里是缺陷类，处置按「消费面」分层
### E. 绝对路径机器绑定：公开仓里是缺陷类，处置按「消费面」分层

- **DeepSource JAVA-W0406**（Official-ish lint 规则目录，一手）：「hard-coded absolute path」是**独立 lint 规则类**——"not portable and may fail"。即：业界把机器绑定路径当作**可静态检测的缺陷**，不是「有意设计」。（ii) 的全面拔除在方向上正确，但**消费面未分层导致过扫**。
- **Stack Overflow 10 年稳定共识**（Community，一手）：「Absolute paths force all users of your piece of software to use the same directory layout, and that's unacceptable. No decent software does that」。
- **git-crypt #217**（Community，一手）：「Resolving this path once on init makes the repository unportable」——修法=**在使用点注入 env/动态 resolve，不在初始化时固化**。对应 01-check 自指 D:/Aworker/6F：改为从守卫自身 `import.meta.url`/repo-relative resolve，任何 clone 皆绿，且是 5 分钟级最小修。
- **分层判据**（本仓实证反推）：D:/ 字面的 11 件非 check `.mjs` 是**开发工具面**（.scratch 不入插件分发），消费面=本机开发者；check 面消费面=**任何 clone 公开仓的外人**。可移植性义务强度随消费面走：公开消费面（01 自指、37/39/46 sibling 探测）必须修；开发工具面降级为「同一 env SSOT 顺手收敛＋文档披露」，不设门禁——这直接否掉 (ii) 的「全面拔除」一刀切。

## tier

### 守卫面运行环境契约调研报告（R41 候选裁定支撑） > 6) 信息缺口与开放问题
## 6) 信息缺口与开放问题

- **Tavily 引擎缺席**：配额耗尽，第三引擎交叉未达成，JUnit/Go 语义靠 Exa＋AnySearch＋官方原文三源仍稳，但「sibling-repo 边界检查」这一窄题的独立先例池偏薄（多为服务型 polyrepo，非「验文档实物」型）——kit receipt＋Pact snapshot 已够裁定，但若要更多同型先例需补搜。
- **tier 命名学无行业标准**：portable/env-contract 的二分是本仓裁定的命名自由，工业界只有 pytest marker/Bazel tag/Buildkite required 等机制名，无统一分类学——命名本身置信=中，机制形态置信=高。
- **skip 在 GitHub required check 语境的呈现细节**（neutral vs skipped 的合并门行为）未深挖 Buildkite 文档原文——若守卫报告将来接入 required check 门禁需补查；现仓 skip 不门禁，不构成阻塞。
- 开放问题：11 件非 check 开发工具的 env SSOT 收敛是同票做还是延后票——属执行窗裁量，本报告不给裁定。

### 守卫面运行环境契约调研报告（R41 候选裁定支撑） > 3) 候选对比矩阵
## 3) 候选对比矩阵

| 项 | 工业先例强度 | 与仓内既有裁决自洽性 | 残余风险 | 备注 |
|---|---|---|---|---|
| **(i) 分层契约**（portable tier＋env-contract tier＋env SSOT＋01 repo-relative） | **高**：pytest/JUnit/Go/Bazel 四生态同构；kit #518 同缺陷同修法；receipt/快照为第二通道 | **高**：=D-157② 留白裁面的正解；SKIP-with-reason=D-150③「不可得读 N/A」既有教义的推广；manifest 入册=D-149④ 延伸 | 新 tier 须进 manifest 自声明＋未声明=红（stevenengelhardt 治理），否则 tier 退化成事后标签 | **推荐**。两档执行面：portable tier 自包含任机绿；env-contract tier 探测→skip-with-reason，skip 计数不门禁 |
| (ii) 全面拔除＋mock fixture | 低：mock sibling 实物无先例；env-var 寻址才是标准 | **低**：mock 使 37/39/46 结构性恒真，撞 R23 恒真探测纪律；对 38/40/42 等 6 件内容级提及是过度手术（它们零依赖，本就不会红） | 断言失效、维护两套 fixture | 否。最多对内容级 6 件做顺手解耦，不构成独立候选 |
| (iii) 文档声明机器绑定=有意设计 | 低：DeepSource 把绝对路径定为 lint 缺陷类；kit 把环境缺失渲染红定为 bug | **低**：known-red 永久化撞 R21「quarantine is temporary」；公开仓外人 clone 必红的体验与 Apache-2.0 公开承诺矛盾 | 账本黑洞化 | 否。仅可作为过渡期 README 披露层，不能作为终态 |
| (iv) 最小修（01 自指＋sibling env 化，无 skip 语义） | 中：修了缺陷但留一半 | 中：01/SSOT 合规，但**缺 sibling 时仍 FAIL=kit #518 的 before 状态**（env 缺失渲染红） | 外人 clone 见 6+ 件假红，报告失去可信度 | 不够。作为 (i) 的第一执行切片可行，作为终态不行 |

### 守卫面运行环境契约调研报告（R41 候选裁定支撑） > 2) 分点结论 > C. 环境契约的声明形态：契约=一等工件，声明即治理
### C. 环境契约的声明形态：契约=一等工件，声明即治理

- **devcontainer spec**（Official，一手核验）：环境被定义为「一组 metadata 管理为单一 unit、可声明式重建」；env 变量分 Container/Remote 两类、`userEnvProbe` 显式探测。心智模型=**把「跑这些检查需要什么」物化为可声明、可重建的工件**，而非散落在各检查里的隐式假设。
- **仓内已有同构先例**（本地实证）：本仓 CI 自身已是「opt-in tier-2 job 在触发器缺席时 skipped」的活体（知识库 R36 verify-run 记录：macos cargo test tier-2 / e2e playwright 均 skipped）；D-150③/R38-Q3 pilot 协议已立法「**依赖可得性=MUST 项，不可得读 N/A 如实记录、禁临场替换**」。→ (i) 的 env-contract tier + SKIP-with-reason 是**把仓内已有的两处纪律从 CI job 面与 pilot 面推广到守卫面**，不是新发明。

## skip

### 守卫面运行环境契约调研报告（R41 候选裁定支撑） > 2) 分点结论 > B. skip 呈现与计数：三态渲染＋计数不门禁，是 2026 年的活跃治理面
### B. skip 呈现与计数：三态渲染＋计数不门禁，是 2026 年的活跃治理面

- **sandstream/kit #518**（Community/一手全文核验，2026-08 合并）：与本仓形态**近乎逐字同构**的真实案例——本地优先检查器把「env 缺失／非 git 仓／cloud-only 排除项」渲染成 ❌ 红行，"Twenty-plus red rows above a footer saying one failed"；GitLab 侧 JUnit 把空 testcase 读成 PASSED（24 件没跑的报告绿）。修复=**skip 独立图标➖＋计数进 footer＋JUnit `skipped=` 属性＋reason 保留进报告＋排序 fail→warn→pass→skip**，且 **skip 不进门禁**（`allOk = failed===0`）。标题即教义："a skipped check is neither a failure nor a pass"。
- **startaitools gate receipt**（Community/一手全文核验，2026-08）：「**An undesigned skip that greens the aggregate is worse than no gate, because it manufactures confidence**」——SKIP 折进 pass 列=报告的是工具安装不是代码。其 **receipt 模式**（`.rig-proof.json` 指纹化验证回执：指纹钉住被验物、失败必须记录、回执与被验物耦合）= **环境重跑太贵时「out-of-band 验证＋契约快照」的现成先例**——这正是 37/39/46 的 sibling 实物验证若不随守卫就地跑时可选的替代形态。
- **skip 滥用风险实证**（Criticism，一手全文）：glebbahmutov——skip 会单调增长并与应用脱同步，解法是 **required-tag 反转**（默认必跑，排除清单本身成为被跟踪的显式工件）；Buildkite 论坛——`[skip ci]` 使 required check 返回 neutral、**GitHub 把它当 pass 放行合并**，是 documented 的 skip 绕门禁案例。→ 本仓对应纪律：env-gated skip **不进 `allOk` 门禁但必须进报告计数**；known-red/xfail 条目沿用知识库 R21 教义「quarantine is temporary——无主流工具提供永久隔离出口」，须带 expires/复审锚。

### 守卫面运行环境契约调研报告（R41 候选裁定支撑） > 2) 分点结论 > A. env-gated skip 的官方语义：三生态一致，「探测失败 → skip 非 FAIL」是正典用法
### A. env-gated skip 的官方语义：三生态一致，「探测失败 → skip 非 FAIL」是正典用法

- **pytest**（Official，一手）：skip 的正典场景白纸黑字包括「tests that depend on an external resource which is not available at the moment (for example a database)」——与 37/39/46 的 sibling 缺失形态完全同构。官方明确建议大套件**集中一处定义 marker**（"have one file where you define the markers which you then consistently apply"）＋ `--strict-markers` 防 typo 漂移。skip 与 xfail 的分界教义（知识库 R21 会话 ganssle 结论，本会话文档再证）：**「这行为该不该工作」**——不该跑（环境没有）用 skip，该跑但有 bug 用 strict xfail。→ 守卫的 sibling 缺失是「该环境没长这个表面」= skip；已钉的幽灵 commit 是「该工作但物不在」= xfail/known-red（D-094 族）。两者**不可混标**，混标会丢失「环境修复后自动转红」的哨兵价值。
- **JUnit Assumptions**（Official，一手全文核验）：「used whenever it does not make sense to continue execution of a given test — for example, if the test depends on something that does not exist in the current runtime environment」；assumption 失败抛 `TestAbortedException`，测试记 **aborted 不是 failure**。这是「运行时探测 → 不算失败」的最老牌官方先例。
- **Go**（Official＋Community 一手）：`testing.T.Skip` 运行时跳过；社区标准模式即 env-var 探测 helper `t.Skip("skipping: set INTEGRATION")`（Stack Overflow 12 年高票、konradreiche 2022、gloutnikov 2023 三源一致）。**go-github #560 是「从构建期门禁降级为运行期 env-gated skip」的真实迁移判例**——build tag（编译期硬门）被替换为「env 不在 → skip」，恰是 (iv)「无 skip 语义缺 sibling 仍 FAIL」的反面教材。
- **Bazel**（Official）：Test Encyclopedia 正式规定测试的 runtime environment 契约与 tag/size 语义；rules_apple 用 `skipci` tag 声明 CI 外测试。更关键的是 **stevenengelhardt 的治理反转**：CI 管线里加一步——**发现任何测试没挂合法 tier tag 就让管线红**。即：tier 归属本身必须被强制声明，未声明=缺陷。→ 对应本仓「check-kit 无 env/skip 原语须新建」：新建原语时应同步建「**每件守卫必须自声明 tier，未声明=红**」（与 CONTEXT.md「Golden 锁面」词条「锁面枚举进各域 manifest 自声明」的既有纪律同构）。

### 守卫面运行环境契约调研报告（R41 候选裁定支撑） > 5) 完整来源清单（本轮真实读取）
## 5) 完整来源清单（本轮真实读取）

| # | 来源 | URL | 角度 | 读取深度 | 贡献 |
|---|---|---|---|---|---|
| 1 | pytest skip/xfail 官方档 | docs.pytest.org/en/stable/how-to/skipping.html | Official | 全文本（检索高亮＋R21 会话历史一手） | skip 正典场景=外部资源缺席；集中定义 marker；strict-markers 治理 |
| 2 | JUnit Assumptions 官方档 | docs.junit.org/6.1.3/writing-tests/assumptions.html | Official | **web_fetch 全文** | 「runtime environment 缺依赖→aborted 非 failure」官方语义 |
| 3 | sandstream/kit PR#518 | github.com/sandstream/kit/pull/518 | Community/Currency（2026-08） | **web_fetch 全文** | 同构缺陷案例＋三态渲染＋skip 计数不门禁＋JUnit skipped= 呈现 |
| 4 | startaitools gate receipt | startaitools.com/posts/the-skip-that-counted-as-a-pass/ | Community/Currency（2026-08-21） | **web_fetch 全文** | skip 折 pass=制造假信心；receipt/契约快照模式 |
| 5 | Gleb Bahmutov required-tags | glebbahmutov.com/blog/required-tags-instead-of-skipped-tests/ | Community/Criticism（2023-05） | **web_fetch 全文** | skip 滥用增长与脱同步；required-tag 反转 |
| 6 | Go testing 官方档 | pkg.go.dev/testing | Official | **web_fetch 全文** | T.Skip 运行时跳过语义 |
| 7 | DeepSource JAVA-W0406 | deepsource.com/directory/java/issues/JAVA-W0406 | Official（lint 目录） | web_fetch（导航页）＋检索摘要 | 绝对路径=可移植性缺陷 lint 类 |
| 8 | go-github #560 | github.com/google/go-github/issues/560 | Community/Currency | 检索摘要（多源互证） | build tag→env-gated skip 的真实迁移判例 |
| 9 | Buildkite 论坛 [skip ci] 绕门禁 | forum.buildkite.community/t/skip-ci-commit-blocking-pull-requests-with-required-status-checks/482 | Criticism | 检索摘要 | skip 状态被 GitHub 视作 pass 的滥用实证 |
| 10 | Bazel Test Encyclopedia | bazel.build/reference/test-encyclopedia | Official | 检索摘要 | runtime environment 契约正式化 |
| 11 | stevenengelhardt Bazel CI | stevenengelhardt.com/2021/09/14/practical-bazel-a-starting-ci-pipeline/ | Community | 检索摘要 | 未挂 tier tag 即红——tier 自声明强制化 |
| 12 | SO 绝对路径问题 | stackoverflow.com/questions/33701275 | Community | 检索摘要＋高票引文 | 「No decent software does that」十年共识 |
| 13 | git-crypt #217 | github.com/AGWA/git-crypt/issues/217 | Community | 检索摘要 | 初始化固化路径=不可移植；使用点注入修法 |
| 14 | devcontainer spec | github.com/devcontainers/spec/blob/main/docs/specs/devcontainer-reference.md | Official | 检索全文段 | 环境=可声明可重建 metadata 单元 |
| 15 | learn.github.com polyrepo | learn.github.com/well-architected/.../implementing-polyrepo-engineering | Official | **fetch 失败**，snippet 级 | meta-repo 集成层模式（仅方向性引用） |

## env

### 守卫面运行环境契约调研报告（R41 候选裁定支撑） > 2) 分点结论 > D. sibling/polyrepo 依赖型检查：env 寻址是主流，mock 化会使断言恒真
### D. sibling/polyrepo 依赖型检查：env 寻址是主流，mock 化会使断言恒真

- **对比光谱**（Comparative，多源）：polyrepo 集成测试三形态——docker-compose 编排同起（适合服务依赖，不适合「验证另一个仓的文档/工作流实物」）、**env-var 寻址＋缺席 skip**（Go 生态标准，与本仓 sibling 形态同构）、contract snapshot（Pact pending/WIP、kit receipt、startaitools 回执——离线可验、损失新鲜度）。37/39/46 验的是 sibling 工作树的**实物存在性与内容一致性**，env-var 寻址＋缺席 skip 是最小正确形态；若要免环境，receipt/契约快照是第二档，**mock fixture 是最差档**。
- **mock 化的致命伤（仓内自洽性）**：R23-Q1（知识库）已立「恒真探测」纪律——`VACUOUS ⇔ (引用物缺席) ∧ (零 FAIL 历史)`；37/39/46 的引用物就是 sibling 实物，**mock 之后就再也没有 FAIL 可能，断言退化为结构性恒真**，恰是 D-076③/D-079 防的安慰剂。且 sibling 根收敛为单一 env SSOT 后，mock 分支毫无增益——同一份 env 声明既服务真验也服务跳过。
- learn.github.com 的 polyrepo meta-repo 集成层模式（snippet 级，fetch 失败如实标注）：跨仓协调收口到一个显式集成层——与「sibling 根收敛单一 SSOT」同向。

### 守卫面运行环境契约调研报告（R41 候选裁定支撑） > 2) 分点结论 > A. env-gated skip 的官方语义：三生态一致，「探测失败 → skip 非 FAIL」是正典用法
### A. env-gated skip 的官方语义：三生态一致，「探测失败 → skip 非 FAIL」是正典用法

- **pytest**（Official，一手）：skip 的正典场景白纸黑字包括「tests that depend on an external resource which is not available at the moment (for example a database)」——与 37/39/46 的 sibling 缺失形态完全同构。官方明确建议大套件**集中一处定义 marker**（"have one file where you define the markers which you then consistently apply"）＋ `--strict-markers` 防 typo 漂移。skip 与 xfail 的分界教义（知识库 R21 会话 ganssle 结论，本会话文档再证）：**「这行为该不该工作」**——不该跑（环境没有）用 skip，该跑但有 bug 用 strict xfail。→ 守卫的 sibling 缺失是「该环境没长这个表面」= skip；已钉的幽灵 commit 是「该工作但物不在」= xfail/known-red（D-094 族）。两者**不可混标**，混标会丢失「环境修复后自动转红」的哨兵价值。
- **JUnit Assumptions**（Official，一手全文核验）：「used whenever it does not make sense to continue execution of a given test — for example, if the test depends on something that does not exist in the current runtime environment」；assumption 失败抛 `TestAbortedException`，测试记 **aborted 不是 failure**。这是「运行时探测 → 不算失败」的最老牌官方先例。
- **Go**（Official＋Community 一手）：`testing.T.Skip` 运行时跳过；社区标准模式即 env-var 探测 helper `t.Skip("skipping: set INTEGRATION")`（Stack Overflow 12 年高票、konradreiche 2022、gloutnikov 2023 三源一致）。**go-github #560 是「从构建期门禁降级为运行期 env-gated skip」的真实迁移判例**——build tag（编译期硬门）被替换为「env 不在 → skip」，恰是 (iv)「无 skip 语义缺 sibling 仍 FAIL」的反面教材。
- **Bazel**（Official）：Test Encyclopedia 正式规定测试的 runtime environment 契约与 tag/size 语义；rules_apple 用 `skipci` tag 声明 CI 外测试。更关键的是 **stevenengelhardt 的治理反转**：CI 管线里加一步——**发现任何测试没挂合法 tier tag 就让管线红**。即：tier 归属本身必须被强制声明，未声明=缺陷。→ 对应本仓「check-kit 无 env/skip 原语须新建」：新建原语时应同步建「**每件守卫必须自声明 tier，未声明=红**」（与 CONTEXT.md「Golden 锁面」词条「锁面枚举进各域 manifest 自声明」的既有纪律同构）。

### 守卫面运行环境契约调研报告（R41 候选裁定支撑） > 3) 候选对比矩阵
## 3) 候选对比矩阵

| 项 | 工业先例强度 | 与仓内既有裁决自洽性 | 残余风险 | 备注 |
|---|---|---|---|---|
| **(i) 分层契约**（portable tier＋env-contract tier＋env SSOT＋01 repo-relative） | **高**：pytest/JUnit/Go/Bazel 四生态同构；kit #518 同缺陷同修法；receipt/快照为第二通道 | **高**：=D-157② 留白裁面的正解；SKIP-with-reason=D-150③「不可得读 N/A」既有教义的推广；manifest 入册=D-149④ 延伸 | 新 tier 须进 manifest 自声明＋未声明=红（stevenengelhardt 治理），否则 tier 退化成事后标签 | **推荐**。两档执行面：portable tier 自包含任机绿；env-contract tier 探测→skip-with-reason，skip 计数不门禁 |
| (ii) 全面拔除＋mock fixture | 低：mock sibling 实物无先例；env-var 寻址才是标准 | **低**：mock 使 37/39/46 结构性恒真，撞 R23 恒真探测纪律；对 38/40/42 等 6 件内容级提及是过度手术（它们零依赖，本就不会红） | 断言失效、维护两套 fixture | 否。最多对内容级 6 件做顺手解耦，不构成独立候选 |
| (iii) 文档声明机器绑定=有意设计 | 低：DeepSource 把绝对路径定为 lint 缺陷类；kit 把环境缺失渲染红定为 bug | **低**：known-red 永久化撞 R21「quarantine is temporary」；公开仓外人 clone 必红的体验与 Apache-2.0 公开承诺矛盾 | 账本黑洞化 | 否。仅可作为过渡期 README 披露层，不能作为终态 |
| (iv) 最小修（01 自指＋sibling env 化，无 skip 语义） | 中：修了缺陷但留一半 | 中：01/SSOT 合规，但**缺 sibling 时仍 FAIL=kit #518 的 before 状态**（env 缺失渲染红） | 外人 clone 见 6+ 件假红，报告失去可信度 | 不够。作为 (i) 的第一执行切片可行，作为终态不行 |

## 冲突点

### 守卫面运行环境契约调研报告（R41 候选裁定支撑） > 4) 与 current D-xxx 的冲突点（显式清单）
## 4) 与 current D-xxx 的冲突点（显式清单）

1. **D-157②（轮41 摄入分诊定案）**——**非冲突，是预留裁面的补位**，但裁定文本必须显式回指：D-157 已拆定「37/39/46=纯环境假设裁面（无 current D 覆盖）、26=字面钉失效族并轨 #75批1」。新 D 不得把 26 再拉回环境假设裁面（双裁=撞 D-157 拆分），也不得把 38/40/42/48/49/51（内容级提及零依赖）误并入 env-contract tier——**sibling 画像 9 件→3 件的实证修正须按 D-146⑤ 勘误惯例登记**。
2. **D-149（守卫基线 18/60 两档＋manifest 机制）**——env-contract tier 引入**第三维**（环境可得性），不改 18/60 两档的执行面划分，但 manifest 需新增类字段（env-gated 类＋skip 语义）。这是 D-149 的**延伸非改向**（用户已自觉标注，正确）；登记形态沿 D-149④ 先例：registry 条目＋事件，不静默扩写。
3. **M-020 / known-red-manifest（01 语料退化在册，复审锚＋expires）**——(i) 的「01 自指改 repo-relative」会把 01 从 known-red 摘出。**这是转正不是静默摘除**：必须走 manifest 生命周期显式关账（复审锚命中→修复→摘除留痕），否则撞 R21「隔离是临时的、出口必须显式」教义。裁定文本里要写明这个闭环次序（先修后摘，同票落地不留悬空期——D-158③ 同款纪律）。
4. **D-015（单仓＋but 分支、禁 worktree/禁另起仓）**——env SSOT 必须是**环境变量/配置项**，不得落成「sibling 工作树清单文件进仓即固化路径」（git-crypt #217 教训：初始化时固化=不可移植）；也不得借机把 sibling 仓内容 vendor 进 6F 当 fixture（撞 (ii) 的恒真问题且混淆单仓边界）。
5. **D-150②（禁新开外部仓）＋D-150③（env-manager 可得性预声明）**——SSOT 若选 env-manager 作寻址通道，须按 D-150③ 先做本机可得性钉 SHA＋「不可得→not-run 如实记录」的两段读数预声明；**不可临场把 env-manager 硬编码进守卫**（否则是把一处环境假设换成另一处）。
6. **D-128 / CONTEXT.md「Instrument Dialect」＋「Golden 锁面」**——sibling 工作树漂移（新 commit、工具版本差）属**环境方言**：env-contract tier 里必须区分「sibling 缺失→skip」与「sibling 在但漂移→era-scoped/方言吸收披露」，方言值（HEAD sha 实测值）进披露面不进断言红面——否则撞 D-128「环境差必红禁入锁面」。37-check 钉快照＋逐件 committer 核验（M-020）的钉面是快照等值性，非 HEAD 追踪，需在 tier 文档里写死这个边界。
7. **skip 呈现面与现有 CI 报告的契约**——kit #518 的教训是「机器面正确、人面误导」：本仓守卫报告若只输出 FAIL/PASS 二值（现状），引入 skip 后**计数与渲染必须同票改**（三态＋skipped 计数进 footer＋reason 保留），否则重演 kit 的表/账矛盾。此项是实施窗义务，不是新裁面。

### 守卫面运行环境契约调研报告（R41 候选裁定支撑） > 1) 执行摘要（Tl;dr）
## 1) 执行摘要（Tl;dr）

**候选 (i) 分层契约获得工业界心智模型的强支持，置信度：高。** 三大测试生态（pytest/JUnit/Go）对「环境前置缺失 → skip-with-reason 而非 FAIL」有完全一致的官方语义；2026 年新先例（sandstream/kit #518、startaitools gate receipt）恰好复刻了本仓「环境依赖检查被渲染成红」的缺陷形态与修复路径；绝对路径机器绑定在公开仓被视为可移植性缺陷类（lint 规则级），repo-relative/env 注入是标准修法。**关键提醒：D-157② 已显式留白「37/39/46=纯环境假设裁面（无 current D 覆盖）」——本候选不是与已有裁决冲突，而是补位 D-157 预留的裁定面。** 落地时须防四处边界混淆（见 §4 冲突点）。

> 引擎备注：Tavily 本轮配额耗尽（API 429），三引擎降级为 Exa＋AnySearch 双引擎＋多独立信源交叉；pytest skipping 文档未单独 web_fetch，但其关键段原文（集中定义 marker／strict-markers）已全文呈现于检索结果且与知识库 R21 会话此前一手抓取一致，按双源计。

## 置信度

### 守卫面运行环境契约调研报告（R41 候选裁定支撑） > 1) 执行摘要（Tl;dr）
## 1) 执行摘要（Tl;dr）

**候选 (i) 分层契约获得工业界心智模型的强支持，置信度：高。** 三大测试生态（pytest/JUnit/Go）对「环境前置缺失 → skip-with-reason 而非 FAIL」有完全一致的官方语义；2026 年新先例（sandstream/kit #518、startaitools gate receipt）恰好复刻了本仓「环境依赖检查被渲染成红」的缺陷形态与修复路径；绝对路径机器绑定在公开仓被视为可移植性缺陷类（lint 规则级），repo-relative/env 注入是标准修法。**关键提醒：D-157② 已显式留白「37/39/46=纯环境假设裁面（无 current D 覆盖）」——本候选不是与已有裁决冲突，而是补位 D-157 预留的裁定面。** 落地时须防四处边界混淆（见 §4 冲突点）。

> 引擎备注：Tavily 本轮配额耗尽（API 429），三引擎降级为 Exa＋AnySearch 双引擎＋多独立信源交叉；pytest skipping 文档未单独 web_fetch，但其关键段原文（集中定义 marker／strict-markers）已全文呈现于检索结果且与知识库 R21 会话此前一手抓取一致，按双源计。

### 守卫面运行环境契约调研报告（R41 候选裁定支撑） > 6) 信息缺口与开放问题
**Sufficiency Gate**：searches: 11 | angles: Official＋Comparative＋Criticism＋Currency＋Community（5/5） | full reads: 7（＋2 条 fetch 失败如实标注） | gaps: Tavily 三引擎降级（配额）、同型 sibling 先例池薄、tier 命名学无标准。

**置信度自评**：(i) 方向裁定=**高**（四生态官方语义＋2026 同构案例＋仓内 D-157/D-150③ 既有教义三重收敛，无反向信源）；(ii)(iii)(iv) 的否决=**高/高/中高**（(iv) 作过渡切片可行，作为终态被 kit #518 before-state 直接证伪）；与 D-xxx 的七处边界清单=**高**（全部本地一手读账本核得，其中第 3 条 known-red 摘除次序是最易翻车的实施细节）。
[warning] 正在以管理员权限运行 — 模型可能可以访问系统文件。

继续此会话，运行：atomcode -p "…" --resume fbcdcca2-800f-4a6f-a1e7-2763660c43ec

> **Tip:** Results are scoped to this batch only. To search across all indexed sources, use `ctx_search(queries: [...])` or call ctx_batch_execute with `query_scope: "global"`.

Searchable terms for follow-up: web_fetch, strict-markers, encyclopedia, glebbahmutov, required-tag, devcontainer, skip-with-reason, stevenengelhardt, startaitools, repo-relative, env-contract, env-manager, assumptions, environment, quarantine, comparative, java-w0406, go-github, temporary, meta-repo, directory, atomcode, apache-2, 37-check, worktree, overflow, required, metadata, snapshot, software, currency, aworker, scratch, runtime, aborted, 的真实迁移判例, 2026-08, neutral, expires, snippet
