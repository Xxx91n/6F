# R51-Q3 调研题面 —— 「主线可达」锚线定义（commit 指针合法性判据的锚定线语义）

（提交 atomcode-research 深调研；账本=唯一事实源立场，调研须回顾 decision-ledger 全部 current 记录、docs/adr、CONTEXT.md 词条、工业界成熟落地心智模型为重点。）

## 背景

本仓=五尺度工程内容审计产品的 spec-level 规划+治理仓。承接 D-188（commit 指针实名化：法定形=git SHA ≥12hex＋("subject") 校验位；合法性=写入时点 cat-file -e 存在 ∧ **整合线祖先集内可达**）＋D-189（适用面分层：严格层=职能上唯一定位 commit 的位置；宽层=叙述段裸短码禁独承定位）。

悬而未裁=**「整合线」的锚定语义**：SHA∈祖先集的祖先集以哪条线为锚？实证约束面：
- 本仓 VC 唯一写面=GitButler（but），多分支栈并行（如 r51-t1-exec 执行分支、gitbutler/workspace 审计工作区），工作区 HEAD 是合成的「GitButler Workspace Commit」merge 节点；
- 审计报告落在审计侧工作区，却引用执行分支上的 commit 固定点（R51 实证：审计报告钉 `git diff 30bb502e..2801b3c9` 范围）——「文书 commit 的祖先」判据误杀跨线引用；
- GitButler 下分支是虚拟概念（applied branches），push/merge 逐次用户授权后才进 origin/main；
- W8 孤儿孪生实证：`201935fc` 在对象库可验（cat-file -e 过）但不是任何分支祖先——amend 残骸只经 reflog/内部 ref 存活，gc 后悬空。

约束面：判据须写入方可自检（写文书时一条命令可验）＋审计窗可复验（读文书的人不依赖 but 会话态即可验）；机检面分工已定（D-188④：格式+存在性+孪生告警机检，可达性留审计窗人工复核——本题为人工复核面的判据定义）；D-074 git-object 访问零写入。

## 候选

(i) **锚=文书落盘分支栈**：合法性=SHA ∈ ancestors（文书所在栈 tip）。利=默认零标注；弊=跨线引用（审计报告引执行分支）一律非法，需额外豁免机制。
(ii) **锚线声明制**：每个指针须可推定一条具名锚线——默认线=文书落盘分支栈；跨线引用须显式标注线名（审计报告固定点范围行 `A..B` 即事实锚线声明先例）；合法性=SHA ∈ ancestors（锚线 tip)；写入方自检=`git merge-base --is-ancestor <sha> <锚线>`；审计窗同命令复核。利=默认覆盖八成场景＋跨线有明示通道＋单文档可验不依赖 but 会话态；弊=多一个「锚线」概念需定义文书内声明形态。
(iii) **锚=origin/main 唯一**：指针须已入主线才合法。利=最严最简；弊=执行窗内文书指针在 push 前全部非法（栈未 push 是常态）——把正常流程判死。
(iv) **锚=文书 commit 自身**：指针合法=SHA 是含该文书的 commit 的祖先。利=自含语义最强（文书+指针同 commit 时序自证）；弊=同 (i) 误杀跨线＋文书与指针同 commit 原子落盘时该 commit 自身 SHA 不可预知（自指问题）。
(v) **可达即可**：SHA 可从任一 ref（含 but 内部 ref/reflog）到达即合法。利=最宽；弊=W8 孤儿孪生照样合法——判据失去意义（孤儿恰是 reflog 可达）。

## 调研要求

1. 工业界成熟心智模型（重点）：多分支/stacked-diff 工作流下「commit 引用须可达于某线」的锚定先例——Gerrit 里文档/commit message 引用其它 change 的惯例（refs/changes/ 命名空间 vs 合入线）；GitHub 生态 issue/PR 中引用 SHA 的行为语义（跨 fork/跨分支 SHA 引用悬空与否的平台呈现）；git describe/merge-base/name-rev 等「可达性归属」工具的官方语义（name-rev --name-only 的 ref 锚参数、branch --contains / tag --contains 的包含判据）；多线并行仓（linux-next、integration branches、GitHub merge queue）中文书引用跨线 commit 的纪律；审计/取证文书（chain-of-custody、SBOM attestation）中「引用对象的归属语境」声明惯例；DVCS 里「对象存在但不在任何分支」悬空对象的语义与处置惯例。
2. 判候选：五候选各评强弱——特别裁决：①「锚线声明制」与 git 生态既有惯例的同构度（固定点范围行 A..B 作为锚线声明是否有先例）；②跨线引用的合法形态在 Gerrit/stacked-diff 生态中如何处理（有无「声明所属线」先例）；③「文书 commit 祖先」判据 (iv) 在跨线场景的失败面是否如题面所述致命；④可达即合法 (v) 是否等价于放弃孪生判别（reflog 可达性的语义）。
3. 冲突扫描：结论是否与本仓 current 决策冲突（重点 D-188/D-189 指针纪律、D-181 勘误三字段、D-142 评审快照钉 SHA 惯例、D-074 git-object 零写入、D-161④ footer 机读位、D-149/D-160 守卫建制、D-165/D-170 分层定稿、D-148③ 不溯既往）。
4. 推荐+理由+置信度；缺口如实标位。
