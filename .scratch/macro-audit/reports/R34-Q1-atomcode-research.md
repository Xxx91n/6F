# R34-Q1 atomcode 调研存档 —— dist/cli.js 锁面内生成物评审成本处置

调研时间：2026-09-25（本轮 atomcode 批次）｜题面：R34-Q1-research-prompt.md｜resume 句柄：0ffee9a5-b165-4e30-a982-5a9c0be57e06
引擎面：web_search×3 + anysearch×2（Tavily 配额耗尽）；full reads 8；domains ≥6；置信：高。

## 1) 执行摘要（Tl;dr）

**推荐 (c)＝(a)+(b) 组合**：engine/.gitattributes 增 `dist/cli.js linguist-generated -diff`（或 gitlab-generated 兼容双写），同时把「bundle 独立 commit／禁搭车语义变更」写成 D-139 同型的 AGENTS.md 负向行规约，并以一行书面声明「信任源=CI rebuild-diff 守卫（D-067③），非人读 diff」。置信度：高——(a) 有 GitHub/GitLab 官方机制与官方先例仓（actions/javascript-action 自带 dist 且官方文档明示 dist-in-repo 是 Actions 生态正解）双源支撑；(b) 与本仓已有 D-139 机械变更独立 commit 纪律同构，二者叠加零冲突；单独 (a) 只解决评审面不解决语义混搭，单独 (b) 不解决 5000+ 行机械 diff 污染。(d) 维持现状是唯一应拒选项。

## 2) 分点结论

**① linguist-generated/-diff 是 checked-in 生成物的标准正解，非规避评审**（高）
- GitHub 官方支持 .gitattributes 中 linguist-generated 使 PR 中生成文件默认折叠隐藏；-diff 使其不进 diff 统计（linguist issue #3515/PR #3588 官方确认此用途、brianschiller 博客实测、SO 78706795 高票问答）。GitLab 有同构 gitlab-generated，官方文档明确「generated files rarely require code reviews」，连 package-lock.json、pb.go 都默认折叠。Gitaly 仓自身在 .gitattributes 为 *.pb.go 标 generated，注释原文=「To make code reviews easier」。
- GitHub CodeQL Action 已把 linguist-generated=true 文件排除出分析面（codeql-action#3318）——标记已从评审 UI 语义外溢为生态通用「机器产物」信号。

**② dist-in-repo 与 rebuild-diff 守卫是 GitHub 官方钦定组合，(a) 的书面信任声明有正牌先例**（高）
- actions/javascript-action 官方模板=dist/ 随源进仓 + npm run all 构建 + check-dist.yml CI 守卫（rebuild 后 git diff --exit-code dist/）三件套——与本仓 D-067①②③ 落地形态逐项同构。官方文档明示「不跑 bundle 步 action 就不能工作」，git-clone 分发无构建步 ⇒ 可运行体必须随源（damirscorner 核验此二选一：要么 node_modules 进仓、要么 bundle 进仓）。
- 即：工业正解不是「bundle 不进仓」，而是「bundle 进仓 + 标 generated + CI 守卫」三合一。

**③ 生成物 diff 的成本账支持折叠**（高）
- 评审面：-diff/generated 标记使 5809 行机械变更不占 PR 首屏与 diff 统计（GitHub/GitLab 官方机制）；isaacs#1484 中维护者确认折叠生效，但折叠≠不可见——点开仍可逐行读，「独立 bundle commit 规约」补足「万一要人读时至少独占一票」的通道。
- blame 面：.git-blame-ignore-revs 是正交惯例（GitHub 2022 起原生支持），但只治 blame 不治 diff。可选项：bundle-only commit SHA 登记进 .git-blame-ignore-revs，与 D-139「大范围 reformat 登记 ignore-revs」同型。dist/cli.js 通常不在人读 blame 主路径，此项作登记纪律顺带条款非必需。
- bisect 面：bundle 全量进 commit 反而有利于 bisect（每 commit 自含可运行体）——check-in 派对 release-artifact 派核心优势，Reddit/protobuf 社区之争中 check-in 派首要论据即「100% repeatable」。折叠 diff 不损失此优势。

**④ check-in vs 不进仓之争在 Agent Plugin 分发语境下已闭合**（高）
- protobuf/Go 社区长期两派（reddit r/golang 8mbi47：check-in 派主论据=可重现性+消费者零工具链；不进仓派主论据=diff 噪声）。Bazel/Buck 远端制品派在「分发体=git clone」前提下不可用。
- 本仓 ADR-0016 立法=纯 Agent Plugins 生态、git-clone 无构建步分发 ⇒ 进仓是立法必然非可选项。锐评攻击点只应落噪声面，而噪声面恰有官方标准解 (a)。

**⑤ (b) 独立 bundle commit 规约与 D-139 精确同型**（高）
- D-139 已立法「格式化-only/机械重缩进禁搭车语义提交，须独立 format commit 先行，大范围 reformat 登记 ignore-revs」。bundle 再生 5809 行属同一失败模式（机械变更与语义变更混在一张 diff）。扩展为「dist/cli.js 再生禁搭车语义变更，须独立 bundle commit」是零新机制的纯规约落点（AGENTS.md 负向行文法，D-133⑤/D-135 同款，不立票不设守卫——rebuild-diff 守卫已存在，无需新增机检）。

## 4) 推荐：(c)

理由收敛三点：
1. (a) 有工业正解地位：GitHub/GitLab 官方机制+Gitaly/官方模板自身先例，且不改变 bundle 进仓立法本体（ADR-0016/D-067 分毫不动），只改呈现面。
2. (b) 与 D-139 零距离同构：bundle 再生＝机械变更，扩展负向行是账本已有文法的自然应用，非新立法层级。
3. 书面声明化解「免审计」误读：(a) 的唯一风险是标记被读作「此文件不审计」——显式声明「信任源=CI rebuild-diff 守卫（D-067③，R31 实证拦截一次）而非人读 diff」把可审性从人眼转移到机器守卫，正是 trust-the-generator+CI-verify 惯例标准表述（actions 生态 check-dist 隐含契约即此）。

落点建议（拍板后执行）：engine/.gitattributes 加 `dist/cli.js linguist-generated -diff`（如需 GitLab 兼容加 gitlab-generated）；AGENTS.md 负向行区加「dist/cli.js 再生禁搭车语义变更，独立 bundle commit」（可选：bundle-only SHA 登记 .git-blame-ignore-revs，与 D-139 同条款）；书面声明落 D-067 注记或 CONTEXT 词条一行。

**与账本 current 决策冲突点：无**——ADR-0016（纯 Agent Plugins 分发）、D-067（dist 入仓+rebuild-diff 守卫）、D-139（机械变更独立 commit）、D-133/D-135（负向行文法）、CONTEXT Trigger-gated Closure 均同向；唯一注意项=**D-059⑨ 已有「bundle 脚手架挂退役触发器=Macro-B GA 时 clean-commit baseline 替换」的现行登记**，本推荐不触碰该退役路径，落盘时建议加一行 scoped 注记互引。

## 5) 来源清单

- brianschiller.com/blog/2025/10/14/read-only-and-generated-files/（Community/教程：linguist-generated 使 PR 默认隐藏）
- github.com/github/linguist/issues/3515（Official：linguist-generated 注册 generated 文件系官方机制）
- docs.github.com viewing-and-understanding-files（Official：.git-blame-ignore-revs 官方语义，2022 起原生支持）
- docs.gitlab.com/user/project/merge_requests/changes/（Official：gitlab-generated；「generated files rarely require code reviews」）
- gitlab.com/gitlab-org/gitaly .gitattributes（Official 先例：*.pb.go gitlab-generated，注释=为 code review 减负）
- github.com/actions/javascript-action（Official：dist-in-repo+check-dist CI 守卫=本案 (a) 最贴切先例）
- damirscorner.com ImplementingPrivateJavaScriptGitHubAction（Community：官方二选一=node_modules 进仓 or bundle 进仓）
- github.com/isaacs/github/issues/1484（Criticism：折叠生效但混排体验边界，摘要级）
- pydata-sphinx-theme attribution.html（Official 惯例：formatting 独立 commit+登记 ignore-revs）
- codeql-action#3318（linguist-generated 排除出分析面）
- reddit r/golang 8mbi47（check-in vs 不进仓两派之争）

## 6) 信息缺口

- SO 78706795 与 linguist overrides.md 原文未读到（403/429），结论以搜索摘要+官方文档镜像交叉覆盖，核心结论不受影响。
- Tavily 配额耗尽三引擎退化为双引擎；AnySearch 对「protobuf check-in 之争」深度弱于社区一手帖——已由 Reddit 摘要+社区共识佐证。
- 「bundle diff 对 bisect 成本的定量对照研究」无直接文献，「check-in 有利于 bisect」结论为定性外推，标注中等置信。
