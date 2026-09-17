# next-round — 轮 16 常驻任务书（轮 15 锐评辩证处置后）

> 生成于 2026-09-17 轮 15 整理环节（handoff skill）。任何子 Agent 读本文件即可接续：先读口径基线→按 T 序执行→每项声明覆盖的 D-xxx 不得超出账本原文范围。
> 唯一事实源 = .scratch/macro-audit/decision-ledger.md（D 系列 63 条：57 current／3 revised／3 由承继链吸收）；执行账 = .scratch/architecture-recovery/decision-ledger.md（A 系列）；验收守卫 = .scratch/architecture-recovery/reports/NN-check.mjs（exit 0 才算过）。

## 口径基线（读前必知）

- **锐评九点已辩证处置**（D-059）：收 4（%cI P0／SQL 字面量误伤／MCP db 寻址泄漏／intake 快照时点未披露）＋部分收 2（audit 立案但拒「产品失能」定性／孤岛记台账不立票）＋缓 2（doctor 触发器／bundle 退役+duckdb 值守）＋拒 1（citation presence-check 主诉——叠加分级是设计界非缺陷，仅 contradicts 死枚举勘误）；**锐评总定性「航天文书包装玩具车」部分失实**——本仓恰是 walking-skeleton 方法论的执行样本
- **audit 一等命令票面定型**（D-060）：`macro-audit audit <path|owner/repo|url> [--scale] [--out] [--json]`，Macro-B 默认＋SCALE-NOT-IMPLEMENTED 诚实拒绝（exit 2＋结构化 JSON＋层序引 ADR-0017③）；装配提炼共享函数 audit/demo 共消费；39/40 脚本转回归对照物（不随 tgz 分发）；README 同步同票绑定
- **评测面拆分**（D-061）：#52a checker 仪器标定即时可执行（合成语料＋κ 基线＋防调参泄漏＋评测/修复分票）；#52b 宿主叙事质量挂 host-narrative-corpus 触发器（跨族 judge＋wild slice＋收割 model id）；合成语料评 agent 质量=自评变体禁行
- **Macro-A DoR 已登记**（D-062）：判据集在 registry mw-trigger-c.verify_method＋CONTEXT Trigger Sequence 词条；层序末位不动（Macro-C→Micro-A→Micro-B→Macro-A）
- **审计件=冻结只读留档分支不合 main**（D-063①）：r14-audit-findings（SHA c06aa58）已先于裁定经 PR #5 合 main——口径约束未来分支，已合入内容不撤；**已共享证据分支禁改写历史**
- Kernel/Agent 边界总则（D-058）、叙事双轨（D-053）、hooks=声明位（D-055）、repomix retired（D-056）、补查归 agent（D-057④）——轮 13 基线全部继续有效
- 分发面定型（D-051/D-052）：插件名 `6f`、市场名 `xxx91n`、Apache-2.0、A+C 双轨；push=发布面动作实质发生，仍停用户闸门
- 文书纪律：只记影响正确性的事实与状态断言；流程性自我归因不进仓面

## 任务序列

| T | 任务 | 覆盖 D-xxx | 交付面 | Suggested skills |
|---|---|---|---|---|
| T0 | 开工前置：读本任务书＋账本第十五轮节＋R14-Q1/R14-Q2/R15-Q3/R15-Q5 调研报告；跑 33/42/44/46-check 确认基线 | D-059~D-063 | 基线快照 | — |
| T1 | **#54 P0 %cI 确定性修复**（P0）：%cI→%ct（或归一化 +00:00→Z）＋gitcli 锁表行 enforce 输出格式断言＋golden-ci「单平台即可」声明勘误；票面见 BACKLOG #54 行 | D-059① | 修复＋断言＋勘误＋NN-check | implement / tdd |
| T2 | **#53 audit 一等命令**（P0）：D-060 八要素全项（签名/拒绝契约/双通道/装配提炼/对照物/报告头/usage/README 同票）；票面见 BACKLOG #53 行 | D-060 | cli audit＋管线函数＋parity 断言＋README 行＋NN-check | implement / tdd |
| T3 | **#55 P1 批票**（P1）：SQL 剥字面量＋误伤测试／MCP db 进 mcp.json／intake 时点披露＋刷新 opt-in＋.git 归一／contradicts 死枚举清除；可分 PR；mcp.json 寻址与 #53 对齐 | D-059④⑤⑥⑦ | 四子项修复＋测试＋NN-check | implement / tdd |
| T4 | **#52a checker-eval 仪器标定**（P1）：合成 claim-evidence ~80-120 分层语料＋precision/recall＋FP/FN 分型＋band-leak 检出＋κ 基线（双标→human-human κ→checker-人 κ，预声明 κ≥0.6＋raw agreement＋bootstrap CI）＋eval JSON＋check 断言＋披露 | D-061 | golden claim set＋eval harness＋NN-check | implement / tdd |
| T5 | **#41b 残余面**：listing 资产核对留痕；B 轨不授权 | D-051 / D-052 / D-042 | 资产核对留痕 | — |
| T6 | push 授权（**用户专属**）：推了=marketplace.json 公开生效 | D-051 / D-052 | 用户点头＋push | gitbutler |
| T7 | 用户侧动作（**用户专属**）：`/plugin marketplace add Xxx91n/6F` 验证路径 A 安装链（触发 first-external-install 即激活 runtime-doctor-trigger） | D-051 / D-052 / D-059③ | 用户操作 | — |
| T8 | 值守面复核：registry 37 项全量清点——mw-trigger-c（DoR 已写实）／narrative-eval-surface（改锚 host-narrative-corpus）／runtime-doctor-trigger／bundle-retirement-trigger（Macro-B GA）／duckdb-binary-watch／golden-verifier-dirty-on-rerun（≥3 次→立票）／hooks-presentation-face／repomix-reopen-trigger／upstream-probes-scorecard-repomix／暂缓面集；未来审计件走冻结留档分支口径 | D-043 / D-045 / D-055 / D-056 / D-059③⑨ / D-061 / D-062 / D-063 | registry confirmations/状态翻转 | — |
| T9 | D-025 勘误双读数纪律：实测/账本双口径并存呈报 | D-025 | 报告口径 | — |

## Suggested skills（本窗口）

- `gitbutler`：一切版本控制写操作（commit/push 分支纪律，不 push 除非用户明示；审计件分支=冻结只读）；
- `atomcode-research`：外部心智模型调研（串行单发 concurrency=1，ctx_batch_execute 投递）；
- `implement` / `tdd`：T1~T4 票面执行；
- `domain-modeling`：词条面措辞裁定（如新增词条）；
- 验收=NN-check 系列脚本 exit 0；写文件一律 node.js＋读回断言＋BOM 检查；输出文件路径一律完整绝对路径（AGENTS.md 纪律）。
