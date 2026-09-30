# R51-Q3 调研报告 —— 「主线可达」锚线定义（commit 指针合法性判据的锚定线语义）

> 存档说明：atomcode 派遣返回配额耗尽（`[rate-limited] 5h window exhausted — resets around 20:50`）——**配额耗尽=D-186 唯一不续跑例外**，按规程转白名单工具（web_search×4＋ctx_search 召回）编排层合成，**degraded_performance 合法降级形态**（组成字段必填；本轮构成=atomcode 配额耗尽→编排层合成；本轮构成比 3/3=100%）。题面存档见 reports/R51-Q3-research-prompt.md。

**Sufficiency Gate**：searches: 4（web_search×4）| angles: Official（git-branch/merge-base/rev-parse 官方手册、Gerrit 官方 concept 文档）＋Community（SO/LWN 悬空对象与跨 fork 引用实录）｜full reads: 5（git-branch、git-merge-base、git-rev-parse、Gerrit concept-refs-for-namespace、Gerrit intro-user）＋LWN Ryabitsev cross-fork object sharing 实质摘录｜gaps: 见 §6。

## 1) 执行摘要（Tl;dr）

**推荐：采纳 (ii) 锚线声明制——「指针合法=SHA ∈ ancestors（具名锚线 tip)，默认锚线=文书落盘分支栈；跨线引用须显式标注锚线」。置信度：中高**（git/Gerrit/GitHub 三域官方一手材料支持「分支成员资格才是有意义判据」；「锚线声明」作为文书写法的同构先例是本仓审计报告固定点行自体＋GitHub 平台警告语义的归纳，非已有命名成文惯例——置信折扣在此）。

## 2) 分点结论

**C1. 「SHA 存在」与「SHA 属于哪条线」在工业界是公认的分离判据——GitHub 官方警告即锚线语义的制度化先例。** GitHub 对非分支可达 commit 页渲染显式警告「This commit does not belong to any branch on this repository, and may belong to a fork outside of the repository」【T1/T2】；SO 实录显示该态大量出现于 force-push/rebase 后（共享 fork 对象池使旧 SHA 仍可访问但悬空）【T2】；LWN（Ryabitsev）证实同型 commit 可经 fork 网络任意挂载呈现「看似在仓」【T3】。→ 指针合法性必须回答「属于哪条线」，不只是「对象存在」——W8 孤儿孪生正是本地同型事件。GitHub 的处置=警告披露非拒绝访问，与本仓「合法性判据=锚线成员资格」方向一致：成员资格缺失是需要被标记的事实，不是需要被隐藏的异常。

**C2. git 官方工具体系完整支持「锚线」语义，且 `merge-base --is-ancestor` 就是为该判据造的。** `git merge-base --is-ancestor A B` 官方手册明文「Check if the first is an ancestor of the second, and exit with status 0 if true」【T4】——一条命令、退出码语义、写入方自检与审计窗复验同构。`git branch --contains <commit>` 官方文档说明其用途正是「rebased or amended 时需要特别注意的分支集合」【T5】——官方自己把「commit 的线归属」识别为 amend 场景的核心问题。rev-parse 官方定义 reachable set=commit 自身＋其祖先链【T6】——「SHA ∈ ancestors（锚线 tip)」是 git 原生语义不是新造概念。

**C3. Gerrit 模型证实：多线/多版本场景下引用纪律=「指针必须落在具名命名空间」。** refs/for/<branch> 推送评审、refs/changes/X/Y/Z staging ref 承载 patch set【T7】【T8】——Gerrit 里 commit 的「线」不是隐含的，而是通过 ref 命名空间显式声明（目标分支写在 push ref 里）；只有最新 patch set 提交进目标分支，历史 patch set 永不上主线【T8】。→ 与本仓 (ii) 同构：引用的合法性不来自对象存在，而来自它被声明挂在哪条线上；Gerrit 用 ref 命名空间承载声明，本仓用文书内锚线声明承载——机制不同，语义同型。

**C4. 候选裁决。**

| 候选 | 裁定 | 依据 |
|---|---|---|
| (i) 锚=文书落盘分支栈 | ⚠️ 作为**默认规则**正确、作为唯一判据漏跨线 | 默认线=落盘栈覆盖勘误/账行/登记表绝大多数场景；但审计报告引执行批 commit（R51 固定点行实证）会被一律判死，必须给跨线开明示通道——恰是 (ii) |
| (ii) 锚线声明制 | ✅ **采纳** | 默认零标注覆盖主场景＋跨线显式标注（固定点范围行 `A..B` 已是事实先例，顺势成文）；读文书的人不依赖 but 会话态可复验（给定锚线+SHA 即 `merge-base --is-ancestor`）；GitHub 警告语义/Gerrit refs 命名空间同构 |
| (iii) 锚=origin/main 唯一 | ❌ 否决 | push/merge 逐次授权是常态（AGENTS/WORKFLOW），执行窗内指针全部非法——把正常流程判死；且与 D-188⑥ 生效时点冲突（立法生效不应消灭在途文书合法性） |
| (iv) 锚=文书 commit 自身 | ❌ 否决 | 同 (i) 误杀跨线；且文书+指针同 commit 原子落盘时该 commit SHA 不可预知（自指不可能）；强行满足=指针只能写更早 commit，审计报告引同 commit 的 固定点 B 端被禁 |
| (v) 可达即可 | ❌ 否决 | reflog/but 内部 ref 可达=孤儿孪生合法化——W8 病灶重演；GitHub fork 网络实证「存在≠属于」【T2】【T3】 |

## 3) 冲突扫描（对本仓 current 决策）

| 决策 | 冲突？ | 裁定 |
|---|---|---|
| **D-188 指针实名化** | 否——**补全判据语义** | D-188① 的「整合线祖先集」由本裁定义为具名锚线（默认=文书落盘分支栈，跨线显式标注） |
| **D-189 分层划界** | 否 | 锚线判据只作用于严格层指针位；叙述段提及不背锚线义务 |
| **D-142 钉快照惯例** | 否——同向 | 评审钉快照 SHA＋锚线声明制是同一「引用必带语境」语义 |
| **D-181 勘误三字段** | 否 | 「变更 commit 指针」列默认锚线=预声明文件落盘分支栈，零额外标注 |
| **D-074 git-object 零写入** | 否 | merge-base/branch --contains 全只读 |
| **D-149/D-160 守卫建制** | 否 | 锚线核验留人工复核面（D-188④ 既定分工不动）；机检守卫只管格式/存在/孪生 |
| **D-165/D-170 分层定稿** | 否 | 无触 |
| **D-148③ 不溯既往** | 否——须显式衔接 | 存量文书指针不强制补锚线标注；新规生效后新指针位适用 |

## 4) 推荐＋理由＋置信度

**推荐：(ii) 锚线声明制。** 操作化定义：
1. **默认锚线**=含该指针的文书落盘的分支栈 tip（写入时点）；文书与所引 commit 同栈时零标注。
2. **跨线引用须显式标注**——形态=锚线声明行（如审计报告「固定点：`git diff A..B`」行，A..B 的右端即锚线 tip；或指针旁括注 `(on <branch>)`）；审计报告既有固定点行顺势升级为法定锚线声明位。
3. **合法性判据**=`cat-file -e <sha>` ∧ `git merge-base --is-ancestor <sha> <锚线tip>`（写入方自检与审计窗复核同命令）；锚线不可推定=判据不满足，按非法指针处置。
4. **孪生注记**：锚线成员资格满足但同 change-id 存在多 SHA 时，指针仍合法（SHA 精确指认实例），孪生告警走机检面 WARN 非 FAIL——SHA+锚线已消歧，change-id 歧义不另行禁止。

**理由**：三层收敛——①GitHub 平台警告证明「分支成员资格」是工业界公认的 commit 归属判据语言；②git 官方工具体系（merge-base/branch --contains/rev-parse reachable set）为该判据提供原生一手机制；③Gerrit refs 命名空间证明「指针+具名线」绑定是多线生态的标准处置。置信度：**中高**——机制层证据充分，「锚线声明」作为文书惯例的命名先例是归纳性证据（本仓固定点行为自体先例＋平台警告语义归纳），无直接同名言词成文先例。

## 5) 完整来源清单

| # | 标题 | URL | 角度 | 贡献 |
|---|---|---|---|---|
| T1 | GitHub dangling commit 警告（connectbot 实例转引） | github.com/nylen/connectbot/commit/1cd775d（经 SO/LWN 引用） | Official/平台行为 | 「does not belong to any branch…may belong to a fork」警告=成员资格判据的平台级先例 |
| T2 | SO: remove a dangling commit / fetch an orphaned commit | stackoverflow.com/questions/4367977 与 /75521924 | Community | force-push 后悬空 SHA 仍可访问；跨 fork 归属不可简单确定（「figure out which fork… isn't determinable trivially」） |
| T3 | LWN: Ryabitsev Cross-fork object sharing | lwn.net/Articles/884105/ | Criticism/Official | fork 对象共享使任意 SHA 可经任一 fork 呈现——「看似在仓≠属于该仓」机理证据；rebase 使已分享链接失效但对象仍在 |
| T4 | git-merge-base 官方手册 | git-scm.com/docs/git-merge-base | Official（已读原文） | `--is-ancestor` 退出码语义=锚线判据原生工具 |
| T5 | git-branch 官方手册 | git-scm.com/docs/git-branch | Official（已读原文） | `--contains` 用途自述=「rebased or amended 时需注意的分支」——官方承认线归属是 amend 场景核心问题 |
| T6 | git-rev-parse 官方手册 | git-scm.com/docs/git-rev-parse | Official（已读原文） | reachable set=commit 自身＋祖先链——「SHA∈ancestors（锚线）」为原生语义 |
| T7 | Gerrit concept-refs-for-namespace（官方） | gerrit.googlesource.com/gerrit/+/HEAD/Documentation/concept-refs-for-namespace.txt | Official（已读原文） | refs/for/<branch>＋refs/changes/X/Y/Z——commit 线归属经 ref 命名空间显式声明 |
| T8 | Gerrit intro-user / concept-changes（官方） | gerrit-review.googlesource.com/Documentation/intro-user.html | Official（已读原文） | patch set=commit 版本、仅最新进目标分支、Change-Id 关联迭代——多线/多版本引用纪律模型 |

## 6) 信息缺口（如实标位）

1. **atomcode 配额耗尽**（5h 窗 resets ~20:50）——本报告无 atomcode 深调研循环产出，为编排层合成（D-186 降级形态）。
2. **「锚线声明」作为文书惯例无同名成文先例**——由 GitHub 警告语义＋Gerrit ref 命名空间＋本仓固定点行归纳得出，属归纳性证据非引用既有名词。
3. **GitButler 虚拟栈下 `branch --contains`/`merge-base` 对 applied 虚拟分支的具体行为**未做本仓实测——锚线 tip 的可解析名（but 分支名 vs workspace merge commit）需执行批落地时实证钉死。
4. **账本原文对表**：编排层已补核 D-188/D-189/D-142/D-181/D-148③ 原文，其余 current 条目以题面转述为据。
