# R49-Q3 调研题面 —— 冻结包代表性衰减呈裁（上游漂移坐实后的校准证据治理）

（提交 atomcode-research 深调研；账本=唯一事实源立场，调研须回顾 decision-ledger 全部 current 记录、docs/adr、CONTEXT.md 词条、工业界成熟落地心智模型为重点。）

## 背景

本仓=五尺度工程内容审计产品的 spec-level 规划+治理仓。治理面有 01 系 frozen 证据包五件（01-corpora/01-align/01-spotcheck/01-report/01-fallback.json）——冻结校准证据，D-172① 立法钉死「工件语义=历史证据非当前行为断言，再生即失义」，D-171 列禁区禁随意再生。

冻结包内含对上游仓 anysearch-cli 的校准锚：intent 面计数=8（01-corpora.json intent.len，三时点实证：0e5b2514 初刻/3a049d45 冻结源/重钉后恒为 8）。上游仓属第三方主权（本仓不立案不代排产）。registry 册项 anysearch-cli-intent-drift-watch（manual_watch）值守上游漂移，verify_method 明钉：漂移坐实→呈裁冻结包代表性衰减声明＋S1 重校准须有意图裁定。

本轮哨兵盘查实读：同一提取谓词（01-extract.mjs extractIntent）复测上游 intent=1（readme:h1），与先前 c6fe0f8 退化读数同签名；归因=上游 commit bbb3ba73（README 登录页 IA 重构——定位 bullets 段消除），自主改版、无认领票。两窗同签名读数＋归因物化到具体上游 commit → 册项触发条件满足，升级呈裁。

关键区分：冻结包作为**回归钉值件**（01-check.mjs D1 三仓 intent≥5 地板、D5 锚分互认——自含输入+钉住期望输出的回归断言）完全不受上游漂移影响；衰减的只是「对当前上游的代表性」这个解释面。S1=战略象限第一维「定位收敛」（Macro-A/Macro-C 校准用语料面）。

## 候选

(i) 双动作分层：(a) 衰减声明落账＋registry 确认行——「01 系冻结包对当前上游的代表性已衰减」显式入册（冻结件字节不动，声明=元数据注记）；(b) S1 重校准裁定为缓行挂消费拉动——下次真实消费上游代表性校准的测量需求出现时另立裁定执行新校准包（v2 新建非 frozen 突变）；哨兵续看。利=触发器如实兑现＋不做无消费者校准功＋冻结语义零触碰；弊=上游代表性缺口存续到下次消费。
(ii) 声明＋立即重校准：衰减声明＋另起新校准包 v2 对当前上游重测（frozen 件零动）。利=代表性即时恢复；弊=无当前消费者＋01-extract.mjs 驱动有 frozen 禁区触碰前科（eval-driver 事故教训）＋新锚点=又一轮裁定负担。
(iii) 缓声明再观察：「IA 重构可能被回滚」续看一窗再裁。利=最稳；弊=册项触发条件已满足（两窗同签名＋归因坐实）——缓声明=触发器立法形同虚设＋无穷后退。
(iv) 仅声明永不重校准：冻结包钉死「点校历史证据」语义＋S1 重校准显式裁「永久不需要」。利=零后续成本；弊=未来真实消费场景出现时无路（须 revised 翻案）。

## 调研要求

1. 工业界成熟心智模型（重点）：校准/基准证据包随上游演进衰减的治理惯例——golden dataset/benchmark 版本化治理（ML 领域 dataset versioning、datasheet for datasets、benchmark contamination/deprecation 声明惯例）；pinned corpus/参照语料库的代表性声明惯例（linguistics corpus 标注「as-of snapshot」）；黄金数据 deprecation/sunset 机制（何时声明过时不代表当前分布）；科学测量中的参照物漂移处置（标准样品 recalibration 触发条件——主动重校准 vs 消费拉动）；观测项/哨兵机制触发后的处置律（sit-rep→declaration→action 时点惯例）；「冻结历史证据」与「现役校准基准」双轨语义在测试夹具治理中的先例。
2. 判候选：四候选各评强弱——特别裁决：①「代表性衰减声明」形态的业界同构（deprecation notice/sun clause/staleness annotation）；②「重校准缓行挂消费拉动」是否是惯例处置（vs 立即重校准/永不重校准）；③上游不可逆演进时维持冻结包不动＋声明是否满足证据完整性惯例；④哨兵升级→裁定的时点纪律（坐实后是否应立即裁）。
3. 冲突扫描：结论是否与本仓 current 决策冲突（重点 D-171/D-172 系 frozen 证据包立法〔再生即失义/禁区/非机械 regen〕、D-173 防双册纪律、D-155 manual_watch 五要件、D-148③ 生效时点、D-146⑤ 勘误追加、D-180 收口 commit 对、D-181 扩面勘误通道〔刚立法〕、D-053/D-057① drive-by 外联禁区）。
4. 推荐+理由+置信度；缺口如实标位。
