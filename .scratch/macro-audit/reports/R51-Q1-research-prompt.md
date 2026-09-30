# R51-Q1 调研题面 —— commit 指针实名化纪律（orphan twin 禁当指针＋内部短码处置并案）

（提交 atomcode-research 深调研；账本=唯一事实源立场，调研须回顾 decision-ledger 全部 current 记录、docs/adr、CONTEXT.md 词条、工业界成熟落地心智模型为重点。）

## 背景

本仓=五尺度工程内容审计产品的 spec-level 规划+治理仓。VC 唯一写面=GitButler（but CLI，禁 git write）。GitButler amend/历史编辑产生**孤儿孪生 commit**：R51 审计实证对 `201935fc` 与 `cb625c64`——同 gitbutler-headers-version 2 头内 `change-id nktntvkkwqtrnqxwmtokzulttpowxnpp`、同 subject、同 parent（2801b3c9）、committer 时间戳差 83 秒；前者为 amend 前残骸（cat-file -e 可验但不在主线），后者为主线真 commit。

事件链：D-181 勘误通道立法要求勘误条目三字段含「变更 commit 指针」→R51 首审 F1 抓出指针写「本轮修复 commit」模糊语与内部短码（wmu/xqr——GitButler `but status` 的 3 字母 change-id 缩写，非 git 可解析标识）→返工改写 git 短 hash→复验又抓出所补 hash 恰是孤儿孪生而非主线 commit（W8——写入时点栈尚未定形，栈在审计通过后又被 amend）。账本 T3 读数表仍残留内部短码当指代（W6 同型）。

约束面：文书引用面=账本/勘误节/审计报告/handoff 内的 commit 引用；D-148③ 生效时点不溯既往；机检件建制走 D-149 守卫入列规程；git-object 访问零写入（D-074）；成文载体=WORKFLOW §4.2.10 条文扩写或新词条。

## 候选

(i) **单层实名化**：指针=git SHA（钉最短板数，kernel 12+ hex 惯例）＋「写入时点主线可达」判据（cat-file -e＋merge-base --is-ancestor 锚整合线）；内部短码全面禁当指针、降为叙述性别名；不配机检，审计窗人工复核。
(ii) **双身份指针**：SHA（commit 实例身份）＋GitButler change-id（patch 身份，跨 amend 稳定）双字段并列——amend 后凭 change-id 可找回主线继任者（git log --grep change-id 或 cat-file 全扫）。
(iii) **推迟落盘**：执行窗文书指针位先写占位符，收口批（栈定形、审计过后）统一回填主线 SHA——指针稳定性只在收口时点成立。
(iv) **机检守卫**：新 check 扫文书面 commit 引用（格式合法＋cat-file -e 存在＋主线可达性＋孪生检测——同 change-id 多 SHA 告警），入守卫组。
(v) **复合**：(i)＋(ii)＋(iv) 三层——SHA 实名＋change-id 辅证＋机检收口兜底。

## 调研要求

1. 工业界成熟心智模型（重点）：Gerrit Change-Id 的 patch-identity vs commit-identity 双轨模型官方语义（amend 保 Id 改 SHA 的标准处置）；Linux kernel 文档内 commit 引用惯例（"commit <sha> (\"subject\")" 格式与 12-hex 最小长度的成文依据）；git cherry-pick -x 溯源字段惯例；rebase/amend 密集工作流下文档引用 commit 漂移的处置先例（Gerrit/Phabricator/stacked-diff 生态）；GitButler change-id header 官方文档立场（是否承诺为持久 patch 标识、merge/push 后可否反查、but status 3 字母短码的设计语义）；patch-id 检测同型 commit 的工具先例；reflog/孤儿 commit 的文档引用规避惯例；monotonic vs unstable identifier 在审计文书中的治理先例。
2. 判候选：五候选各评强弱——特别裁决：①SHA+主线可达双判据是否业界有成文先例（非仅 git 命令可用性）；②change-id 作辅助指针的缺陷面（非 GitButler 环境下能否反查、merge 后存活与否）；③「推迟到收口回填」vs「写入时即钉」时点权衡的文书纪律先例；④文书面 SHA 机检（存在性+可达性+孪生检测）的成本效益先例；⑤GitButler 3 字母短码的官方定位（持久标识还是会话内 UI 便利）。
3. 冲突扫描：结论是否与本仓 current 决策冲突（重点 D-181 勘误三字段、D-146⑤ 链式追加、D-177 预声明验证包、D-148③ 生效时点、D-074 git-object 零写入、D-149/D-160 守卫建制与退役、D-185 开工对表、D-165/D-170 分层定稿、D-161④ trailer 三栏位）。
4. 推荐+理由+置信度；缺口如实标位。
