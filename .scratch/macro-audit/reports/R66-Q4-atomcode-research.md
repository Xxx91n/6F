# R66-Q4 深度调研报告——EOF-only hunk 形态的 VC 兜底授权

> atomcode 真回传存档（session batch:atomcode，8 节索引）。

## 1) 执行摘要（Tl;dr）

**推荐修正版 (a′)：scoped git 兜底授权，采纳 (a) 骨架 + 三处修正**——①形态枚举判据改用「diff 文本形态机检」而非单纯 numstat（numstat 行计数口径对 EOF-newline 场景有歧义）；②授权以例外条款形式落（本仓 workflow 4.2.1 已有「linked worktrees unsupported → 允许 git commit 单条」同构先例——非开先河而是沿用既有文法）；③manual_watch 收回钩绑定「but 版本升级即重放 R65 复现探针」的行为级复验，而非仅盯 changelog。Confidence：高——工具失效面有仓内实证＋上游 issue 链佐证；例外通道文法有仓内先例＋三域工业先例收敛；唯一中置信项是收回钩时点设计（惯例外推）。

## 2) 工业先例证据（带出处）

- **GitButler 上游 #5758**：「\ No newline」hunk 崩 diff 打印——仓内 R65 实证的独立佐证；libgit2/go-git 同类病史三角交叉。
- **pre-commit 社区纪律**：跳单个钩子（SKIP=）是成文例外通道；点名要防「routine escape hatch」——宽授权（c）的反面教材；
- **Git LFS skipdownloaderrors**：带副作用声明的例外通道先例；
- **Bazel remote-cache 降级**：单点工具失效时 scoped 降级通道先例；
- **仓内 4.2.1 先例**：「linked worktrees unsupported → 允许 git commit 单条」——例外条款文法已存在。

## 3) 逐候选点评

**(a) scoped git 兜底授权——采纳，修正为 (a′)**：方向正确；三处修正——

- **修正①（形态判据）**：`git diff --numstat 单字节增量`判据不充分且有歧义——numstat 计行非字节，纯 EOF 加换行显示为该文件 1 1（末行被重写为带换行版）。改为**双判据机检**：numstat 恰一个文件、增删各 ≤1 行，且 git diff 原文 hunk 内除末行 -行/+行 外仅含 `\ No newline at end of file` 标记行、无任何其他上下文变更——二条件 AND 才放行；
- **修正②（白名单不必要但须拆分禁令）**：binary 文件 git 不产文本 diff 天然被排除；但须禁「内容变更与 EOF 变更混同一兜底 commit」——同文件既有实质行变更又有 EOF 问题须拆开，仅 EOF 部分走兜底；文件大小上限不需要（阻塞点在 but diff 层非 git，判据与大小正交）；
- **修正③（收回钩双通道）**：仅盯 changelog 不够——改**事件触发＋行为探针**：registry 项 gitbutler-eof-hunk-watch 挂 manual_watch，触发事件=①but 版本升级（升级后必须重放 R65 复现探针：scratch 内造 EOF-only hunk→but diff+but commit，转绿即收回）②下游审计窗例行复审（R39-Q3 五要素：owner=仓内值守/review_by=下一审计窗/trigger_id=manual_watch）；
- 账本 EOL 搭车维持原案：本轮账本 diff 非 EOF-only，走 D-139 搭车不占兜底额度——**但须显式声明边界**（见 §4 D-139 行）。

**(b) 零授权纯搭车——否**：r63-report.md 冻结历史件 substantive 变更永不发生→搭车路径对其结构性失效，EOL 债永续；违 D-165④「执行义务无限期=变相 accepted-risk」精神。

**(c) 宽授权——否**：无枚举边界=pre-commit 社区点名的「routine escape hatch」；「but 无法应用」原因空间未普查（binary/symlink/超大各自不同——#5758 显示 symlink 替换也曾崩 but diff），宽授权=未审计失败模式批量放行。

**(d) 不修挂起——否**：上游无逐字匹配 issue→等修复无外拉力；manual_watch 本义=「登记+主动复审」非消极等待；(d) 比 (b) 更弱。

## 4) 账本冲突核查（硬要求）

| 冲突项 | 冲突点 | 处置 |
|---|---|---|
| 4.2 but-only（唯一权威条款） | 授权直接触碰禁令字面 | **显式例外条款落册非静默改向**——沿 4.2.1 既有例外文法新增「EOF-only hunk→允许 git add+commit 兜底，message 强制标注」条目；git push 禁令不变 |
| D-139 no-op 搭车例外 | 适用域须显式声明：D-139=「被触碰文件内顺手内容整理」，前提是「该文件本轮已被 substantive 触碰且 diff 可由 but 正常提交」——**不是工具失效例外**；r63-report.md 冻结件不满足前提→EOL 修复不可援引 D-139，只能走新授权兜底通道；账本自身 EOL 因本轮已触碰可援引 D-139。两件走不同通道裁定文须分行写明，防未来把 D-139 读出「工具失效也能搭车」扩张解释 | 裁定文显式划界 |
| D-140② 语义隔离 | 兜底 commit 不得与语义 commit 混装——EOF-only 形态天然单文件单 hunk，判据即隔离；message 标注机械可查（含固定串「GitButler EOF-only 工具限制兜底〔R65 实证〕」） | 无实质冲突 |
| D-146⑤ scoped 勘误文法 | 授权文本须 scoped 枚举（形态+命令面+文件域） | 一致 |
| D-169/D-171 五要件 RA | 兜底授权按五要件登记：scope（枚举形态+三文件）、owner、review_by（下一审计窗）、trigger（but 升级探针）、最晚复审日 | 一致，落 registry |
| D-165② Dual Reporting | 收回钩复审未转绿期间值守口径如实（「兜底通道开放中，上游未修复」），禁粉饰 | 一致 |

## 5) 核心推荐（裁定文本骨架）

> **授权**：当且仅当待提交变更满足机检双判据（恰一个文本文件 + numstat 增删各≤1 + diff hunk 仅末行与 \ No newline 标记），允许 git add <file> && git commit，message 必含标注「GitButler EOF-only 工具限制兜底〔R65 实证〕」；同文件含实质变更时须先拆分、仅 EOF 部分走兜底；git push 禁令不变。
> **适用件**：75a-census-register.json、decision-ledger.md（如后续再发 EOF 回归）、2026-10-05-r63-report.md；账本本轮 EOL 走 D-139 搭车不经兜底。
> **收回钩**：registry 登 gitbutler-eof-hunk-watch（manual_watch 五要件形态）；but 版本升级→重放 R65 探针，转绿即收回授权并注销登记；下一审计窗例行复审。
> **落册方式**：4.2 but-only 条款新增例外行（沿 4.2.1 先例文法），非静默改向。

## 6) 置信度自评

高 ~0.85。加分：工具失效面仓内对照实验实证＋上游 #5758 错误栈独立佐证＋libgit2/go-git 同类病史三角交叉；例外通道文法有仓内 4.2.1 先例＋pre-commit/LFS/Bazel 三域收敛。扣分：GitButler 当前版本（gitoxide 迁移后）对该形态的现行行为无一手 issue 确认（仓内 R65 实证是唯一证据）；收回钩时点设计属惯例外推无直接先例。

## 7) 信息缺口

GitButler 现行版本 EOF-only hunk 行为的上游确认缺失（#5758 为相邻形态佐证非逐字匹配）——收回钩探针设计以「行为级复验」替代「版本号判定」正是对冲此缺口。
