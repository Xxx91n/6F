# next-round — 轮 20 常驻任务书（轮 19 grill 收口＋T6 市场安装闭环后）

> 更新于 2026-09-18 轮 19 grill 收口（D-066~D-070 五决策落账）＋T6 市场安装闭环（A-068）。任何子 Agent 读本文件即可接续：先读口径基线→按 T 序执行→每项声明覆盖的 D-xxx 不得超出账本原文范围。
> 唯一事实源 = .scratch/macro-audit/decision-ledger.md（D 系列 70 条：64 current／3 revised／3 承继链吸收）；执行账 = .scratch/architecture-recovery/decision-ledger.md（A 系列——A-065~A-068 轮 18 登记）；验收守卫 = .scratch/architecture-recovery/reports/NN-check.mjs（exit 0 才算过）。

## 轮 19 留痕（已定，勿重复）

- **T6 市场安装 ✅**（A-068）：`claude plugin marketplace add Xxx91n/6F`→`install 6f@xxx91n` 远端实证 Skills(1)+MCP(1)；首装戳穿两处 manifest 契约缺陷已修（skills 路径形＋`.mcp.json` 自动发现位）；origin/main=5493ff9 全栈落地，工作分支干净。
- **轮 19 grill 五决策**（D-066~D-070，全 current 零 revised）：manifest 契约守卫混合两段式／kernel 自包含分发修复（P0）／骨架升版机检 baseline／CJK non-assert 补表＋词表治理／r18 残余顺带清分流。
- **registry 状态更新**：`first-external-install→occurred`＋`runtime-doctor-trigger→triggered-bound→#62`＋新事件两件（`claude-validate-promotion`／`cue-table-second-consumer`）＋新值守项两件——registry 40 项/25 事件。
- **待验证缺口登记**（随票验收）：CI 无凭据 validate／Claude 双文件遮蔽优先级／Windows MCP 面 `${CLAUDE_PLUGIN_ROOT}` 展开／esbuild bundle 与 duckdb native 兼容性。

## 口径基线（读前必知）

- **守卫分层纪律**（D-066）：shape 钉 enforce（确定性自断言）＋真校验器 advisory/event_bound（外部工具禁钉 enforce——版本漂移不可重放）＋SKIP 计入 WARN＋2 干净版本窗口转 enforce；schema pin 快照进仓禁运行时拉取。
- **自包含分发**（D-067）：`${CLAUDE_PLUGIN_ROOT}` 放 args 不放 command（Windows 最小暴露面）；dist 随源进仓（git-clone 无构建步）；esbuild bundle vs tsc-dist 由 duckdb native 本地 smoke 定形；npm publish 维持 deferred 不夹带。
- **骨架升版机检**（D-068/A-064 C9）：breaking=removed≠∅／rename=删+增对不配对／整章消失／ordinal 变；fail-safe=无法证明安全按 breaking 报；**semantic-flip 机检不可行归审计人层**（PASS 固定打印边界行）；豁免=baseline 更新本身无独立文件。
- **cue 表纪律**（D-069）：词表=判据——增删改判定面；CJK 词表独立设计禁 port 英文；≥2 字词形禁单字；「假设」必配伪表（科学语域名词性豁免）；种子表一次先验声明禁标签调参；抽 JSON 挂第二消费者触发器；改表机检=hash WARN 非 FAIL（内部判定面降一档）。
- **顺带清纪律**（D-070）：同文件触碰窗口即清但**独立 `[cleanup]` commit**——判定 commit 零夹带（回滚耦合=receipt 链污染红线）；只做等价变换零触碰判定语义；膨胀熔断=非等价/超分钟级→停手转独立 P2。
- **kernel 边界**（D-058）：NLI/概率模型永不进 kernel；叙事归宿主 agent MCP 主路。
- **评测纪律**（D-061/D-065）：禁参照 52a 语料标签调参——延伸覆盖 cue 表变更（加严登记非修订）；golden 基线依赖 git 史（52a-eval-results 原地覆写=既定决议）。
- **分发面定型**（D-051/D-052）：插件名 6f、市场名 xxx91n、Apache-2.0、A+C 双轨；push=用户闸门。
- 文书纪律：只记影响正确性的事实与状态断言；审计件分支=冻结只读。

## 任务序列

| T | 任务 | 覆盖 D-xxx | 交付面 | Suggested skills |
|---|---|---|---|---|
| T0 | 开工前置：读本任务书＋账本第十九轮节＋R19-Q1~Q5 调研报告；跑 33/42/44/46/52a/53/54/55-check 确认基线 | D-066~D-070 | 基线快照 | — |
| T1 | **#59 kernel 自包含分发修复（P0）**：`.mcp.json` node+`${CLAUDE_PLUGIN_ROOT}`／dist 入库（esbuild smoke 定形）／CI rebuild-diff／README·SKILL 同票／裸名禁守卫／esbuild 入锁；验收=真机 `/plugin install` 后 `/mcp` connected | D-067 / D-038 / D-037⑥ | .mcp.json＋dist/bundle＋CI 守卫＋文档＋锁表 | implement / tdd |
| T2 | **#58 manifest 契约守卫链扩（P1）**：34/41b-check 三断言（skills `^\./`／字段白名单／单一 `.mcp.json` 位）＋validate advisory 双触发＋SKIP 硬化＋schema 快照＋claude-cli/schemastore 入锁 | D-066 / D-037⑤ / D-041 | 守卫断言＋advisory 面＋schema 快照＋锁表 | implement / tdd |
| T3 | **#61 cue 表分层＋顺带清（P1）**：判定 commit（CJK_NON_ASSERT_CUES＋PSEUDO 伪表＋词表治理声明＋56-check hash WARN）＋`[cleanup]` 独立 commit（r18 残余①-⑤等价变换）＋held-out 复跑＋52a parity | D-069 / D-070① / D-065 | citation.ts 两 commit＋56-check 扩＋复测报告 | implement / tdd / domain-modeling |
| T4 | **#60 骨架升版机检（P1）**：14-skeleton-baseline.json＋14-check 三 FAIL 双向拦＋三方一致断言＋语义翻转边界行 | D-068 / A-064 C9 | baseline 文件＋守卫断言 | implement / tdd |
| T5 | **#62 doctor 探测票（P2）**：duckdb 可开库／git 可用／上游连通三腿 probe＋结构化输出（selftest 本职不扩容） | D-059③ | doctor 子命令/旗标＋探测报告 | implement / tdd |
| T6 | **#52b 待命**：锚=host-narrative-corpus（audit 实跑或 pilot N≥50 段）——audit 已可实跑，语料出现即触发；跨族 judge＋wild slice＋收割 model id | D-061 / D-064④ | 触发即启 | — |
| T7 | **#41b 残余面**：listing 资产核对留痕；B 轨不授权 | D-051 / D-052 / D-042 | 资产核对留痕 | — |
| T8 | 值守面复核：registry 40 项清点——claude-validate-promotion-watch（新）／cue-table-extraction-trigger（新）／runtime-doctor-trigger（triggered-bound→#62）／mw-trigger-c／narrative-eval-surface（host-narrative-corpus 锚）／bundle-retirement-trigger／duckdb-binary-watch／golden-verifier-dirty-on-rerun／demo-cleanup-observe（decided）／hooks-presentation-face／repomix-reopen-trigger／upstream-probes／暂缓面集 | D-041 / D-043 / D-045 / D-055 / D-056 / D-059③⑨ / D-061~D-070 | registry confirmations/状态翻转 | — |
| T9 | D-025 勘误双读数纪律：实测/账本双口径并存呈报 | D-025 | 报告口径 | — |

## Suggested skills（本窗口）

- `gitbutler`：一切版本控制写操作（不 push 除非用户明示；审计件分支=冻结只读）；
- `implement`＋`tdd`：T1~T5 代码票执行——预声明判据先行（判据文件先入库跑后禁调，#48 先例）；
- `domain-modeling`：T3 cue 表语义边界（CJK 词形/伪表/邻接豁免）与 T4 baseline 结构建模；
- `neat-freak`：顺带清与文档落盘的整洁纪律；
- `atomcode-research`：票内新方案面（如 esbuild bundle 兼容性、doctor probe 形态）按 D-2 深调研再动手；
- `handoff`：本任务书本身即产物——次轮收尾时同规程再生。

## 用户闸门残留

- push 授权：本轮整理 commit 与后续票栈均停闸门（T5/T6 先例——用户明示「全部授权」才执行 land/push）；
- B 轨官方目录：未授权不触碰（D-042）；
- Windows 真机 `/mcp` 验收：#59 首条验收项，执行时如变量展开失效→按 bug 链标注如实披露不绕路。

