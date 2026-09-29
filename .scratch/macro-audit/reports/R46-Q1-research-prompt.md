# R46-Q1 调研题面 —— Stage-2 判据④ A(a) 30 日静默窗语义钉定

（提交 atomcode-research 深调研；账本=唯一事实源立场，调研须回顾 decision-ledger 全部 current 记录、docs/adr、CONTEXT.md 词条、工业界成熟落地心智模型为重点。）

## 背景

本仓为五尺度工程内容审计产品（Macro-A/B/C + Micro-A/B）的 spec-level 规划+治理仓。Stage-2 公开推广判据包（D-162③④⑥）预声明四判据全达标方启：
①capability 5/5（Macro-A preview 上架=ADR-0017 漏斗终点，DoR-b 绑「跨仓关联键在 ≥2 真实仓生产线 facts 验证」）；
②fresh clone 不红海；③GAP-HOST-01 关闭；④试点 findings 全部过摄入分诊四态封闭处置无未分诊残留。
参数 A(a)：「判据④封闭处置后 30 日无新增 finding 回流方算达标」（KEP-5241 两周无 flake 窗先例放宽至月度窗）。

## 缝的实证

1. registry stage2-launch-criteria 项六次确认行全读「计时中」，但窗起点事件/start_at 从未登记成机读字段——「计时中」是无起点锚声明，读数不可审计。
2. 「finding 回流」口径未定义：裁条主语域=「试点 findings」（Stage-1 宿主试用回传），但 Stage-1 未启动（零 charter 零试点）→若回流=试点回流，试点域为空集窗无从起算，「计时中」=空转读数。
3. 活矛盾：轮46 内部审计产出 F1~F6 findings（F1=传播性锚错 9→8 勘误——证据完整性类真实缺陷，已按勘误链处置），同窗封闭处置后 registry 读数仍「计时中」——字面「无新增 finding 回流」读=窗应重置 vs 实读=续跑，读数链与裁条字面松弛未裁。
4. 历史读数链：R43「30 日窗计时确认」（锐评批次封闭处置后隐式起算）→R44~R46 均「计时中」。

## 候选

(i) 试点域限定（窄口径）：回流=Stage-1 试点宿主经摄入分诊回传 findings；零试点→④读数更正「未启动」；窗起点=首例试点 intake 批次封闭处置（含零 findings 空批次 vacuous closure 即起算）；内部 findings 不入窗。
(ii) 全 findings 域：任何经封闭处置通道 finding 到达即重置窗（F1~F6→09-29 起算）；最严防刷绿但疑自挫回路（活跃审计下窗永不达标＋激励反向）。
(iii) 来源分级窗：findings 分「产品能力面」（审计产出正确性/证据完整性/守卫真值——F1 类传播性锚错入此）重置窗，「治理账面 hygiene」（措辞/nit/format）登记不重置；起点回推定义。
共件（口径无关）：窗状态机显式化（未启动→计时中→达标）＋registry 机读字段（window_state/start_event/start_at/reset log）使读数可审计化。

## 调研要求

1. 工业界成熟心智模型（重点）：launch/readiness gate 的静默窗/soak period/stability window 惯例（KEP-5241 feature gate、SRE launch readiness、安全修复 SLA 观察窗、零回归窗、freeze/soak 语义）；finding/incident 回流口径惯例（外部发现 vs 内部审计发现是否同权；soak window 对内部发现 reset 的工业先例）；vacuous/pass-by-absence 的防刷绿惯例（窗口起点锚定要件——soak 起点未登记是否=窗未启）；发布判据「criteria written before kickoff」语义先行的制度化先例。
2. 判候选：(i)/(ii)/(iii) 各按工业先例评强弱——特别裁决：内部审计 findings 是否应计入发布静默窗的「finding 回流」；试点未启动时「计时中」读数是否合法；窗起点机读锚定的最小要件。
3. 冲突扫描：结论是否与本仓 current 决策冲突（重点 D-162③④⑥/D-168/D-142/D-146 摄入分诊四态与勘误链、D-155 registry manual_watch 五要件、D-170 分层定稿）。
4. 推荐+理由+置信度；缺口如实标位（无一手公开材料即声明推断级）。
