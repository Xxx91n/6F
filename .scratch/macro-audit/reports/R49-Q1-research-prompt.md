# R49-Q1 调研题面 —— 派生信号处置节奏立法（收口文书 commit 衍生摘录失钉的次序缺口处置）

（提交 atomcode-research 深调研；账本=唯一事实源立场，调研须回顾 decision-ledger 全部 current 记录、docs/adr、CONTEXT.md 词条、工业界成熟落地心智模型为重点。）

## 背景

本仓=五尺度工程内容审计产品的 spec-level 规划+治理仓。治理守卫面=61 件 check 脚本＋guard-all-run.mjs 总跑器。D-179 已立法确定性生成（SOURCE_DATE_EPOCH 式 env 注入＋内容派生身份键），伴生挥发 churn 已归零——守卫跑后工作区零 diff 成立，除非有真实语义变化。

现发现结构性次序缺口（轮49 审计 F1）：75a-census-findings.json 是派生信号件——摘录 decision-ledger.md→CHANGELOG.md 编行计数等派生计数。收口工序=「语义收口 commit（账本/编年/CONTEXT/handoff 落写）→守卫全量跑→生成物 bundle commit」。凡收口 commit 扩账本（常态），census 派生计数在其落盘后才漂移——「守卫跑后零 diff」只在再基线~收口 commit 间的瞬时窗为真，任意 HEAD 检查点失效。本轮实证：usu 收口文书 commit 账本增量节新增 CHANGELOG 引用→census ×42→×43 漂移；审计窗按 D-179④/D-140② 人工判真实信号→独立 bundle commit 收编（未自动丢弃）。

漂移两族已立法分流（D-179②）：纯挥发族（run_at/UUID/receipt-hash——volatile-fields.json 枚举豁免 11 键）vs 派生信号族（编行计数类——derived_signal_banned 18 键显式禁豁免，豁免=真信号被吞通道）；禁区=01 系 frozen 证据包钉值（D-171）。分 commit 纪律（D-139/D-140②）：语义变更与生成物再生禁同 commit，生成物走独立 bundle commit。声明口径面：报告「零 diff」陈述在 HEAD 检查点失真——审计建议改述「除真实语义信号件外零 churn」。

## 候选

(i) 收口二元 commit 对立法：收口工序末尾钉死「语义收口 commit→立即再生产生派生信号→独立 bundle commit 收编」紧邻对——drift 不跨轮，HEAD 恒净出发；报告口径改述「除已收编真实语义信号件外零 churn」。利=归属歧义消灭（上轮收口派生不混进下轮语义变更 bundle）＋事实工序升格为规则（审计窗已实证同形态处置）；弊=收口工序多一步 regen+bundle（成本=已在做的事钉成纪律）。
(ii) 次轮 bundle 收编维持：drift 挂工作区至次轮守卫跑后随批 bundle。利=零新规；弊=跨轮混同风险（上轮收口派生信号与下轮真实语义变更同 bundle，归属歧义）＋「零 diff」陈述在任意检查点永久失真——审计陈述可信度慢性失血。
(iii) 明示豁免位：census 摘录计数族入豁免清单。利=drift 直接不可见；弊=正面撞 D-179② derived_signal_banned=18 键（已含 fact_count/item_count 族，census 摘录计数恰是该族）——放行=派生信号豁免合法化=真信号可吞通道，须走 revised 链翻 D-179② 案代价远超收益。
(iv) 只改口径不收节奏：「零 diff」改述「除真实语义信号件外零 churn」收工。利=陈述失真修复零工序；弊=归属歧义风险存续（drift 仍跨轮漂流）。

## 调研要求

1. 工业界成熟心智模型（重点）：派生/生成工件依赖可变真源时的鲜度治理惯例——生成物 check-in 仓的「生成物与源同步」CI 闸惯例（如 Kubernetes verify-codegen/verify-generated、Go generate diff 检查、protobuf golden 再生校验、bazel/Nix 内容寻址同输入同输出验证）；「生成物滞后一拍」在版本控制纪律中的处置先例（同步 commit 对 vs 定时/批量收编 vs 豁免）；文档派生指标/索引的漂移治理（coverage badge、metrics 快照、census 类摘录）；commit 紧邻对/原子批惯例（semantic commit + generated bundle 紧邻绑定先例——Go mod tidy 随 commit、codegen 重跑随 PR、changelog towncrier/scrivener fragment 汇集时点）；「零 diff/树干净」宣言口径学——构建/守卫报告声明时效的表述惯例。
2. 判候选：四候选各评强弱——特别裁决：①「收口 commit 对」节奏立法是否有同型先例（真源变更→派生物紧邻收编）；②次轮收编的跨轮归属歧义是否业界视为真风险（drift 归属混同的事故/审计先例）；③派生信号豁免是否任何生态有先例支持（预期=无——须证伪而非假设）；④「除 X 外零 churn」口径改述措辞惯例。
3. 冲突扫描：结论是否与本仓 current 决策冲突（重点 D-140② 生成物独立 bundle 纪律、D-179② 派生信号禁豁免、D-179④ 自动 discard 显式驳回、D-139 语义/生成物分 commit、D-144①④ 账行↔编年随行、D-146⑤ 勘误链式追加不改写、D-148③ 生效时点不溯既往、D-177 预声明验证包工序）。
4. 推荐+理由+置信度；缺口如实标位。
