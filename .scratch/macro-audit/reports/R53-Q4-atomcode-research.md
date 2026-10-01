# R53-Q4 调研报告 —— 指针守卫 baseline 册 17 条存量违规收敛策略

> 题面：`R53-Q4-research-prompt.md`｜派遣实录：atomcode `-p` 首派→其内部发现前序挂死进程阻塞串行通道→轮询约 1h 未产出；进程自退后 `-c` 续跑→`[rate-limited] 5h window exhausted, resets ~21:50` → 按 D-186 配额耗尽唯一不续跑例外，**编排层合成**。
> **组成字段（D-186）**：`degraded_performance`——atomcode 两派未产出（挂死阻塞+配额耗尽）；正文=编排层 web_search 直查合成（phpstan.org 官方文档、git-scm 官方 reflog/gc 文档、PHPStan issue #3458/#7875/#9032 实录）。轮 53 构成比 **3/4 降级**。

## 1) 执行摘要（Tl;dr）

**推荐 (iii) 分类排序批量窗（Confidence：高）**——专项批量窗为壳、失效风险为序。三路硬先例收敛：①PHPStan 官方文档判词「**The life goal of a baseline file is to not exist**」——baseline 的存在义务就是归零，(iv) 永久豁免直接死刑；②同文档与 issue 实录的再生纪律=「只在 analyse 绿时再生成、行只删不增」＋15k 册级团队**周度 CI 自动再生清失配条目**——专项周期性收敛窗是工业建制非发明；③git 官方 reflog 文档 `gc.reflogExpireUnreachable` **默认 30 天**——amend 孤儿残骸与 per-session 短码可解析窗口有硬衰减钟，「随到随做」拖到 30 天后类项永远不可解析。（注：D-183 FN 静默高危同向——册内条目是唯一复发检测面，放任堆积=哨兵钝同化。）

## 2) 分点结论

### ① PHPStan baseline 官方语义=「以不存在为目标」的定期收敛建制【来源：phpstan.org/user-guide/baseline 原文 + issue #3458/#7875/#9032】

- 官方文档逐字：「It works best when you want to get rid of a few dozen to a few hundred reported errors」「It can be seen as a necessary evil」「**The life goal of a baseline file is to not exist**」——baseline 合法化存量是过渡工具，收敛是它的内蕴终态；(iv)「不收敛」=官方明判的反模式（necessary evil 永久化）。
- 规模判据：「a few dozen to a few hundred」适用带内——**17 条属轻量册，专项窗完全可行**（非 15k 级须分波的大册）。
- 收敛运维先例（issue #9032 实录）：15k 册团队「automatically regenerate the baseline every week on CI to get rid of unmatched ignored errors」——**周期性专项清理窗**建制化先例；官方建议纪律=「regenerate only on green build；diff 只删不增」（#3458 置顶回复）。映射：本仓册项失配自报（PV-F10D 守恒断言）=unmatched 自清理同构，收敛窗=「只删不增」窗口。
- 反面教训同向：「It’s tempting to simply re-generate the baseline to absorb new errors——disadvantages: growing baseline with unresolvable errors」——baseline 重生成吸新违规=册变垃圾场，本仓 D-192② errata_ref 关联勘误行号正是防此的护栏设计（官方羡慕件）。

### ② 失效窗口衰减是硬证据非直觉【来源：git-scm.com/docs/git-reflog 官方 + git-gc 文档原文】

- 官方文档逐字：`gc.reflogExpire` 默认 **90 天**，`gc.reflogExpireUnreachable` 默认 **30 天**——「entries generally created as a result of git commit --amend or git rebase…users will want to expire them sooner」。
- 映射：bare-shortcode（kmk/qmw/rkm）解析依赖 reflog/同会话文档锚——amend 残骸 30 天即 expire-unreachable 候选；nonexistent-sha `bbb3ba73` 已不可解析（无衰减窗，纯作废注记）；short-sha×10 指向 reachable 对象（90 天可达位窗，实际主线引用长存）——**时效性排序成立：bare-shortcode＞fuzzy-phrase/nonexistent-sha＞short-sha**。
- 宽层后果：拖到 reflog expire 后，「不可解析」从「可修」变「只能作废登记」——收敛窗口错过=证据等级降级。

### ③ boy-scout 随到随做的失效面【来源：PHPStan 文档语义推论+本仓面分析】

- (ii) 随到随做成立的前提=文件高频被触碰。本仓册项分布：predecl（冻结声明件，D-181 禁随意触碰）／账本（append-only）／三份历史报告（事实档不再编辑）——**6 文件全部属「非触碰面」**，随到随做=永远不收敛的形态学保证。
- PHPStan 文档对 baseline 的定位即反驳 boy-scout：它给的是 generate/regenerate 的**主动动作**语义，没有「顺路修」通道——收敛须是主动事件非副产物。

### ④ 冲突扫描（对照账本 current）

| 决策 | 关系 | 说明 |
|---|---|---|
| D-191 存量勘误通道 | 同向 | 收敛动作=勘误 commit 实写，通道复用 |
| D-192 baseline 机制 | 同向 | 「非大赦」与「life goal=not exist」逐字同构；errata_ref 护栏=官方推荐缺的件 |
| D-181 勘误三字段 | 同向 | 勘误 commit 每文件一钉=独立 commit 约束满足 |
| D-146⑤ append-only | 兼容 | 更正经 commit 链留痕非原地覆盖——历史原文仍在 git 历史可查 |
| D-148③ 生效时点 | 兼容 | 存量已入册豁免不溯及 |
| D-169 finding 处置 | 同向 | 册项收敛≠丢弃——每条处置走勘误有物证 |
| D-175 等待期序 | 同向 | 册收敛=(b) 欠账清零面，优先级最高 |

**零冲突**。(iii) 在现行框架内有完整承接面。

## 3) 对比矩阵

| 项 | (i) 专项批量窗 | (ii) 随到随做 | (iii) 分类排序批量窗 | (iv) 不收敛 |
|---|---|---|---|---|
| 收敛完成度 | ✓ 全清 | ✗ 非触碰面永拖 | ✓ 全清 | ✗ |
| 失效窗风险 | 中（无序时短码类可能先衰减） | 高 | 低（不可解析类优先） | 全灭 |
| 勘误纪律 | ✓ 独立 commit | ✓ 但夹带风险 | ✓ 独立 commit＋类内排序 | — |
| 工业先例 | PHPStan 周期再生窗 | boy-scout（本仓面不适用） | 官方判词+再生窗+衰减钟三重 | 「necessary evil 永久化」反模式 |
| 牙齿守恒 | ✓ | ✓ | ✓（PV-F10D 守恒断言复跑） | ✗ 册钝化 |

## 4) 推荐＋理由＋置信度

**推荐 (iii) 分类排序批量窗（Confidence：高 ~0.85）**。

1. **专项窗成立**（吸收(i)内核）：PHPStan 周度再生实录+「few dozen」规模判据——17 条单窗可毕，不用分波。
2. **类内排序**（(iii) 独有增量）：第一序=bare-shortcode×5（30 天 expire-unreachable 衰减钟，wmu 已解 kmk/qmw/rkm 须趁 reflog 可探；`git log --all`/`but` 历史 cross-check）；第二序=nonexistent-sha+fuzzy-phrase（作废注记+法定形补写，无窗但同批顺手）；第三序=short-sha×10（对象可达稳定，最后做不损失）。
3. **同窗闭环**：每文件一勘误 commit（D-181）；全部更正后 84-check 复跑→PV-F10D 守恒断言（失配+命中==册条目数）＋册项自报摘除逐条核销；manifest 更新独立 commit（基线册再生=「只删不增」纪律）。
4. **副产物**：若 bare-shortcode 经全通道仍不可解析→按 D-191① 判「失效 per-session UI 码」作废注记+替代定位符——此处置本身即「作废注记」形态的首次实战。

**最强反驳自查**：「17 条不值得开专项窗」——不成立，PHPStan 官方把 baseline 收敛列为建制动作非顺手动作；且本仓册项全在非触碰面，无专项窗=事实上的不收敛。

## 5) 信息缺口

- atomcode 两派均未产出（挂死+配额耗尽 ~21:50 复位），本报告=编排层直查合成，多源交叉强度受限；RuboCop todo-file 批评面检索失败（搜索引擎返回无关内容），该先例未引。
- 「专项窗 vs 随到随做」对**文档审计面**（非代码 baseline）的直接先例未获一手文献——结论由 PHPStan 官方语义+本仓非触碰面结构推导，标位如实。
- reflog 30 天窗针对 unreachable amend 残骸；bare-shortcode 是否仅可经 reflog 解析，取决于 GitButler 内部存储——若 change-id 映射在 `.git/gitbutler` 持久元数据里则衰减钟不适用——实现期须先实证解析路径再定序。
