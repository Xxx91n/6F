# next-round — 轮 18 常驻任务书（轮 17 审计发现处置后）

> 生成于 2026-09-17 轮 17 整理环节（handoff skill）。任何子 Agent 读本文件即可接续：先读口径基线→按 T 序执行→每项声明覆盖的 D-xxx 不得超出账本原文范围。
> 唯一事实源 = .scratch/macro-audit/decision-ledger.md（D 系列 65 条：59 current／3 revised／3 承继链吸收）；执行账 = .scratch/architecture-recovery/decision-ledger.md（A 系列）；验收守卫 = .scratch/architecture-recovery/reports/NN-check.mjs（exit 0 才算过）。

## 口径基线（读前必知）

- **F1-F15 处置表已裁定**（D-064）：偏离方向决定处置面——实现错修码（6 项入 #57）／票面字面过紧勘误票面（5 项注记级，D-060 四处注记见账本收口节）／方法学披露项注记承接／ADR-0009④ 已闭环；**防勘误膨胀**（本批为同日滞后集中清算非常态）
- **#56 方向已定**（D-065）：判定语义文档化命名（supports=presence-level 非语义蕴含）＋三表确定性否定剥离（pre/post/pseudo-negation cues＋CJK 独立词表＋预声明窗口）＋引语模式表自设计＋fail-safe 从严（宁 insufficient 勿误 supports）＋held-out 分区＋首跑复测＋FN 披露归 human 级＋二态不加第三态；**硬纪律=禁参照 52a 语料标签调参**
- **kernel 确定性边界**（D-058）：否定剥离=纯字符串处理合规；NLI/概率模型永不进 kernel（D-059⑤ 叠加分级非替代——NLI 属第二层属 human-in-loop 域不在 kernel）
- 轮 16 实物：audit 一等命令在架（#53 ✅）、%cI 已修（#54 ✅）、P1 批票已落（#55 ✅）、52a 评测已跑（κ 三报＋FP=13/FN=12 分型＋#56 修复票立案）；r16-impl 栈未 push
- 审计件=冻结只读留档分支（D-063①）；已共享证据分支禁改写历史
- 分发面定型（D-051/D-052）：插件名 6f、市场名 xxx91n、Apache-2.0、A+C 双轨；push=发布面动作实质发生仍停用户闸门
- 文书纪律：只记影响正确性的事实与状态断言

## 任务序列

| T | 任务 | 覆盖 D-xxx | 交付面 | Suggested skills |
|---|---|---|---|---|
| T0 | 开工前置：读本任务书＋账本第十七轮节＋R17-Q1/R17-Q2 调研报告；跑 33/42/44/46/52a/53/54/55-check 确认基线 | D-064 / D-065 | 基线快照 | — |
| T1 | **#57 F 项修复单票**（P0）：六子项按 BACKLOG 票面（F1 层序串+53-check B 面断言／F8 noBom 补扫×4／F9 双横线前缀拒绝／F10 空值守卫→insufficient+demo.ts:246 同型／F11 改名+53-check C 面／F15 复用 resolveFactsDb）；重跑清单见票面 | D-064① | 修复＋断言＋NN-check | implement / tdd |
| T2 | **#56 checker 修复票**（P1）：按 D-065 票面全要素实施（文档化命名＋三表剥离＋引语模式表＋fail-safe＋held-out 分区＋首跑复测＋FN 披露）；禁参照 52a 语料标签调参；评测/修复分票纪律 | D-065 / D-064⑤ / D-059⑤ | citation.ts 增强＋held-out 分区＋复测报告＋NN-check | implement / tdd / domain-modeling |
| T3 | **#52b 待命**：锚=host-narrative-corpus（audit 实跑或 pilot N≥50 段）——audit 已可实跑，宿主叙事语料出现即触发；跨族 judge＋wild slice＋收割 model id | D-061 / D-064④ | 触发即启 | — |
| T4 | **#41b 残余面**：listing 资产核对留痕；B 轨不授权 | D-051 / D-052 / D-042 | 资产核对留痕 | — |
| T5 | push 授权（**用户专属**）：r16-impl＋round15-closeout 栈推 origin——推了=marketplace.json 公开生效 | D-051 / D-052 | 用户点头＋push | gitbutler |
| T6 | 用户侧动作（**用户专属**）：/plugin marketplace add Xxx91n/6F 验证路径 A（触发 first-external-install→runtime-doctor-trigger） | D-051 / D-052 / D-059③ | 用户操作 | — |
| T7 | 值守面复核：registry 38 项清点——mw-trigger-c（DoR 已写实）／narrative-eval-surface（host-narrative-corpus 锚）／runtime-doctor-trigger／bundle-retirement-trigger／duckdb-binary-watch／golden-verifier-dirty-on-rerun／demo-cleanup-observe（新，顺带清）／hooks-presentation-face／repomix-reopen-trigger／upstream-probes／暂缓面集 | D-043 / D-045 / D-055 / D-056 / D-059③⑨ / D-061~D-064 | registry confirmations/状态翻转 | — |
| T8 | D-025 勘误双读数纪律：实测/账本双口径并存呈报 | D-025 | 报告口径 | — |

## Suggested skills（本窗口）

- `gitbutler`：一切版本控制写操作（不 push 除非用户明示；审计件分支=冻结只读）；
- `implement` / `tdd`：T1/T2 票面执行；
- `domain-modeling`：F11 新名词表对齐、判定语义文档化措辞；
- `atomcode-research`：外部心智模型调研（串行单发 concurrency=1）；
- 验收=NN-check 系列脚本 exit 0；写文件一律 node.js＋读回断言＋BOM 检查；输出文件路径一律完整绝对路径（AGENTS.md 纪律）。
