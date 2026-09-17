# next-round — 轮 17 常驻任务书（轮 16 实施闭环后）

> 生成于 2026-09-17 轮 16 收口（handoff 惯例）。任何子 Agent 读本文件即可接续：先读口径基线→按 T 序执行→每项声明覆盖的 D-xxx 不得超出账本原文范围。
> 唯一事实源 = .scratch/macro-audit/decision-ledger.md（D 系列 63 条＋轮16 执行记录节）；执行账 = .scratch/architecture-recovery/decision-ledger.md（A 系列）；验收守卫 = .scratch/architecture-recovery/reports/NN-check.mjs（exit 0 才算过）。
> 轮16 工作分支 = `r16-impl-t1-t3-t2`（栈于 `round15-closeout`），提交 wkp(#54)→usr(#55)→pwo(#53)→zvt(#52a)＋收口批；未 push（用户闸门）。

## 口径基线（读前必知）

- **轮 16 已闭环票面**：#54（%cI 归一化+形状断言+golden-ci 勘误，54-check 19/19）／#53（audit 一等命令八要素，audit.test 24/24+53-check 22/22）／#55（P1 四子项，55-check 17/17）／#52a（checker 标定语料 110 条，52a-check 21/21）／#41b 复核（41b-check 30/30）／T8 registry evidence 锚补齐（33-check WARN 9→8）。
- **audit 命令已是一等公民**：`macro-audit audit <path|owner/repo|url> [--scale] [--out] [--json] [--refresh]`；Macro-B 唯一实装层；SCALE-NOT-IMPLEMENTED exit 2 诚实拒绝；39/40 one-shot 转回归对照物（53-check E 面做字段 parity 漂移报警）。
- **审计不携叙事职责**（D-053/D-058）：kernel 面=facts+骨架+侧车机读面；叙事=宿主 agent 经 MCP 读数+sealNarrative 盖章，audit 回执不产叙事段。
- **checker 语义边界已量化为 #56**（新立修复票）：presence 判定无 NLI 层——对抗 FP=13（否定/引语包裹）／FN=12（改写同义）／全集 κ=0.455<0.6 地板（非对抗子集 0.970 证设计域内有效）；修复禁参照 52a 语料标签调参（防泄漏纪律）。
- **mcp.json=gen-manifests 生成物**：env/args 配置面一律落 manifest.meta.json 单一元数据源，直改 mcp.json 会被 gen 回写冲掉。
- **时点披露单源取证**：snapshot_fetched_at=FETCH_HEAD mtime（clone/refresh/缓存命中三腿同值）；--refresh=显式 opt-in（fetch --prune＋复位，绝不自动 pull）。
- **DuckDB 事实表名=audit_fact**（store.ts 唯一权威，无 audit_fact_events 别名）。
- **审计件=冻结只读留档分支不合 main**（D-063①）；已共享分支禁改写历史。
- 分发面定型（D-051/D-052）：插件名 `6f`、市场名 `xxx91n`、Apache-2.0、A+C 双轨；push=发布面动作仍停用户闸门。

## 任务序列

| T | 任务 | 覆盖 D-xxx | 交付面 | Suggested skills |
|---|---|---|---|---|
| T0 | 开工前置：读本任务书＋账本轮16节＋轮16报告（.scratch/macro-audit/reports/2026-09-17-impl-report.md）；跑 33/42/44/46/52a/53/54/55-check 确认基线 | 全量 | 基线快照 | — |
| T1 | **#56 checker 语义边界修复票**（设计先立）：方案选型=否定语境剥离启发式／语义等价锚表／宣称收窄 presence-only 文档化——先出 ADR/账本裁定再动代码；**修复禁参照 52a 语料标签调参**；修后 52a-check 应见 κ/FP/FN 改善但不得以本集为调参目标 | D-061→52a findings | 设计裁定＋实现＋NN-check | domain-modeling / implement |
| T2 | **#52b 宿主叙事质量 eval**（触发器票）：锚=audit 实跑真实宿主叙事段或 pilot N≥50 段；wild slice 语料＋跨族 judge＋RAGAS align＋judge-human κ 预声明＋收割 model id；与 52a 集分离存管 | D-061/D-057② | 触发即启 | atomcode-research / implement |
| T3 | **#48 残余 Micro-A 面**／**#49 经典仓回归腿**：git/git+django+spring-boot 三族 leg 入 macro-b-regression resolve JSON；dispatch 首跑实测克隆耗时 | D-049/D-050 | workflow JSON＋首跑实测 | implement |
| T4 | push 授权（**用户专属**）：推了=marketplace.json 公开生效 | D-051/D-052 | 用户点头＋push | gitbutler |
| T5 | 用户侧动作（**用户专属**）：`/plugin marketplace add Xxx91n/6F` 验证安装链（触发 first-external-install→激活 runtime-doctor-trigger） | D-051/D-052/D-059③ | 用户操作 | — |
| T6 | 值守面例行：registry confirmations 随新闭环补 evidence 锚；golden-verifier-dirty-on-rerun 计数（当前 0/3）；manual_watch 复审时点扫描 | D-063② | registry confirmations | — |
| T7 | D-025 双读数纪律：实测/账本双口径并存呈报 | D-025 | 报告口径 | — |

## Suggested skills（本窗口）

- `gitbutler`：版本控制写操作（不 push 除非用户明示；分支栈 r16-impl-t1-t3-t2 on round15-closeout）；
- `atomcode-research`：外部心智模型调研（串行单发 concurrency=1）；
- `implement`/`tdd`：票面执行；`domain-modeling`：词条/方案裁定；
- 验收=NN-check 系列脚本 exit 0；写文件一律 node.js＋读回断言＋BOM 检查；输出路径一律完整绝对路径（AGENTS.md 纪律）。
