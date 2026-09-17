# R14-Q2 调研题面 — `audit` 一等命令的票面形态

> 轮 15 grill Q2。提交 atomcode 深度调研。

## 本地回顾义务（先读后答）

先阅读本仓库（D:\Aworker\6F）以下材料再作答：

1. `.scratch/macro-audit/decision-ledger.md` — 全部 current 记录（含本轮 D-059 锐评九点处置）；
2. `docs/adr/` — 重点 0001（五尺度）、0002（禁 MVP 切片）、0006（共享骨架+切片）、0009（intake 本地优先+URL opt-in）、0017（preview 发布模型）、0002/0013；
3. `CONTEXT.md` — Scale/Trigger Sequence/Failure Semantics/Kernel-Agent 职责边界等词条；
4. `engine/src/cli.ts` — 现有命令面（--version/selftest/mcp/repo add/demo）；
5. `.scratch/architecture-recovery/reports/39-macro-b-one-shot.mjs` 与 `40-*.mjs` — 真实仓 Macro-B 管线的现行脚本装配形态（import dist collectors＋generate）；
6. `engine/src/intake/intake.ts`、`engine/src/collect/collectors.ts`、`engine/src/report/generate.ts`、`engine/src/upstream/codelore.ts` — 将被装配的实物面；
7. `.scratch/architecture-recovery/BACKLOG.md` #48/#50/#51 票面——本命令与在途票的装配层关系。

## 待裁定问题

锐评 #2/#8 的落地设计面：engine CLI 无 `audit` 一等命令，真实仓审计管线只能经 .scratch 脚本手工装配（39/40-one-shot 实证已跑通三仓）。候选：

- (a) `audit <path>` 单尺度先行：Macro-B 本地仓 one-shot 成一等命令（intake→现有采集器＋codelore 面→facts→骨架渲染→--out 报告＋facts.duckdb）；`--scale` 参数预留、未实现尺度诚实拒绝；codelore 行为面随 #51 进采集段；Micro-A 随 #48 续接；
- (b) `audit <target> --scale` 一次铺五尺度门面：Macro-A/Micro-B 未验违层序；
- (c) 脚本原样改名入库：39-one-shot 搬进 engine 即 audit——无装配抽象；
- (d) 暂缓：等 #48 完成再统一设计 CLI 面。

## 调研要求

重点调研工业界成熟落地的心智模型：CLI 工具「一等命令 vs 脚本装配层」的演进惯例（walking skeleton→flesh out 的 CLI 化时机）；子命令面设计惯例（单命令多 flag vs 子命令树——git/gh/docker/kubectl 对照）；「未实现能力的诚实拒绝」在 CLI UX 中的成熟形态（exit code/披露文案惯例）；扫描类工具本地路径+远程 URL 的入参惯例（semgrep/trufflehog/sonar）；审计工具输出面惯例（stdout vs --out dir vs 双通道）。

输出：推荐选项＋理由；各候选已知失败模式；若推 (a) 给出命令面要素清单建议；与本仓 current 决策冲突点排查——若冲突点名 D-xxx/ADR-xxxx，不许静默改向。