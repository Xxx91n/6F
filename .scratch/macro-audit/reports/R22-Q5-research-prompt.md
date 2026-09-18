# R22-Q5 atomcode 调研题面——SKIP-STREAK CI 失明（升格/转段计数器在未持久化状态文件上跑）

## 问题

本仓 #58/D-066 落地的 manifest 契约守卫含两级 streak 机制，R21 审计实测 CI 失明：

- ①SKIP-STREAK-ALERT：34-check 顶部 ⚠ 升格顶显——claude plugin validate advisory 面连续 cli-absent SKIP→「advisory 面能见度归零」告警；
- ②promotion streak：registry claude-validate-promotion-watch（event_bound）——advisory 满 2 个版本窗口全绿且无 SKIP 污染→转 enforce 断言位；
- 状态载体=.code-tmp/claude-validate-state.json（{"streak":0,"last":"pass"}）**未跟踪**——本地跨轮持久，CI 每轮重置 streak=1→≥2 永不触发；
- **病灶分层**：持久化是表层——深层语义错配：CI 环境 cli-absent 是预期事实（无 claude CLI 理所当然）非异常，而 SKIP-STREAK 前提=「连续 SKIP=能见度异常」——CI 上 SKIP 恒真，计数器即便持久化也只是永真告警非异常信号；promotion streak 的「2 版本窗口」取证面本来就靠本地窗口留痕。

问题：streak 机制该持久化、语义收窄、还是重构？

## 候选

(a) 状态持久化：state.json 迁仓内受控位（stale-assertions.json 先例）＋CI artifact/cache 恢复——修持久化不修语义错配，且仓内状态文件被 CI 写脏引入提交噪声；
(b) 语义收窄＋环境分层：SKIP-STREAK 显式声明仅 cli-expected 环境面有效（本地/开发窗）；CI=cli-absent-expected 面→SKIP 转 INFO 常态登记不进 streak（「预期缺席」与「异常缺席」分离）；promotion 取证面=本地版本窗口留痕；
(c) 证据工件化：streak 计数器废弃，改为每版本窗口 advisory 输出工件入仓（receipt 化——版本窗各留一份 validate 输出文件，promotion=读连续 2 窗工件无 SKIP）——最对齐 receipt 文化但 CI 产工件回写仓=提交噪声＋新工件约定成本；
(d) 组合：语义收窄（CI 预期 SKIP 非异常）＋本地 streak 留 .code-tmp 降格声明「本地连续观测」＋promotion 挂人工复核事件（值守人读本地窗证据后人工确认翻转，D-041 manual_watch 五要素）；
(e) 缓挂：返回工票自定。

## 必回顾（硬要求）

1. 决策账本全部 current 记录：D:\Aworker\6F\.scratch\macro-audit\decision-ledger.md（D-001~D-076，重点 **D-066 两段式 advisory→enforce 机制本体**／D-041 watch 三态五要素／D-063 有实证即裁决／D-070 文档面处置／D-073 受控状态文件先例）；
2. ADR：D:\Aworker\6F\docs\adr\0001-0021（重点 0013 三层验收闸门／0018 版本编年）；
3. CONTEXT.md：D:\Aworker\6F\CONTEXT.md（Watch Tri-state／Trigger-gated Closure／Self-probe）；
4. 实物：D:\Aworker\6F\.code-tmp\claude-validate-state.json＋D:\Aworker\6F\.scratch\architecture-recovery\reports\34-check.mjs（头部 advisory probe/SKIP-STREAK-ALERT 行）＋41b-check.mjs＋33-gate-registry.json（claude-validate-promotion-watch 条目五要素）＋R21 审计报告 §六返工第 1 项；
5. **工业界成熟心智模型（重点）**：CI 环境分层断言惯例（expected-absent vs anomaly-absent 的语义区分——pytest skipif 的 condition 参数语义/GitHub Actions continue-on-error 的环境期望模型）、streak/counter 状态在 CI 的持久化模式（GitHub Actions cache 恢复 vs build badge/artifact 存证 vs commit-back 机器人）、「two consecutive green windows」类晋升机制的工业先例（canary analysis/Kayenta 分窗晋升、SLO burn-rate 多窗告警、Google SRE multiwindow multi-burn-rate alerting——窗口取证本来就该跨运行介质）、expected-failure/skip 的环境分层标注（Chromium TestExpectations 的 [ Mac ] [ Win ] 平台条件 expectation——按环境分流的正型先例）、state-file-in-repo 模式的边界（什么状态该入仓什么不该——prometheus/tsdb 不回写仓 vs lockfiles 入仓）、人工晋升门（manual promotion gate）vs 自动翻牌机制在发布工程里的取舍；
6. 给出推荐与理由＋失败模式＋落地形态（SKIP/INFO 分层的输出态语义？promotion 判定的证据载体？state.json 终态？）；
7. 显式核查与本仓 current 决策的冲突面（特别：D-066⑥ promotion 机制若改人工确认翻转，是否与「2 版本窗口」原文冲突需 revised？SKIP-STREAK 语义收窄是否动 D-066③ 升格顶显条款？）。

## 交付

返回结构化 Markdown：①结论（推荐+一句话）；②逐候选裁定；③工业先例证据（带 URL）；④落地形态设计；⑤失败模式与治理；⑥与本仓决策冲突核查表（逐条 D-xxx）；⑦信息缺口；⑧建议追问。
