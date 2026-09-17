# R13-Q1 调研题面 — 叙事生成面与战略 rubric 本体落点（护城河的物化形态）

> 轮 13 grill Q1。提交 atomcode 深度调研。

## 本地回顾义务（先读后答）

先阅读本仓库（D:\Aworker\6F）以下材料再作答：

1. `.scratch/macro-audit/decision-ledger.md` — 全部 status 含 current 的记录（46 条）；
2. `docs/adr/` — 全部 21 件 ADR，重点 0004（战略象限五维 S1-S5）、0006（共享骨架+scale 切片）、0008（Agent Plugin 五层盒子）、0013（三层验收闸门）、0014（上游防腐边界）、0017（preview 发布模型）；
3. `CONTEXT.md` — 领域词面；
4. `engine/src/report/generate.ts` — 裁决协议 ADR-0013-C/v1、引文检查器 checkCitationSupport/checkAllCitations、receipt 实物；
5. `engine/skills/macro-audit/SKILL.md` — 现仅 16 行只读壳；
6. `.code-tmp/research.md` 与 `.code-tmp/memory.md` — 立项期五轮调研档案（原始预设）。

## 待裁定问题

原预设（research.md §7.2）：叙事层=LLM 仅基于 fact sheet 生成宏观诊断＋引文校验盖章（grounded ✓/⚠ uncited claims）；「战略叙事 rubric」被列为唯一真护城河（定位收敛/范围蔓延/门面预算/ADR 质量——全行业无产品做战略叙事）。

现状实物：kernel（macro-audit CLI，TypeScript）已具备确定性报告骨架渲染、裁决块 adjudicate()、receipt、citation 检查器（claim 级 required_tokens 对 evidence 做 supports/insufficient/contradicts 判定）。缺席三面：①叙事生成面（谁生成、在哪生成、生成物如何进报告并盖章）；②rubric 本体（S1-S5 的判断规则/问题清单/报告模板的可操作化资产）；③MCP 查询面为 stub（`macro-audit mcp` 只回 manifest JSON）。SKILL.md 壳纪律=只读、禁判定（ADR-0008），裁决一律环境外 CLI 执行。

候选：

- (a) 壳内 rubric＋宿主 agent 叙事＋kernel 盖章：skills/macro-audit/references/ 落 quadrant-rubric.md／strategy-questions.md／report-template.md 三件；宿主 agent 经 MCP 读 facts 写叙事段；kernel 对叙事跑 citation check 盖章（grounded/⚠ uncited）入报告——原预设的完整对应物；
- (b) kernel 内建模板叙事：generate.ts 按规则把 facts 渲染为固定句式叙事，无 LLM 参与；
- (c) 双轨：(a) 为主＋kernel 模板叙事作 degraded 兜底（无 agent 面/离线时）；
- (d) 暂缓叙事层：先补 structure/behavior 象限采集面（Macro-B 现仅 strategy 象限 native，codelore 30 契约面接的是 S3/S5+演化主干而非 structure/behavior）。

## 调研要求

重点调研工业界成熟落地的心智模型：AI 评审/审计产品中「叙事层 vs 确定性事实层」的职责切分；引用校验/幻觉盖章的工程实践与已知失败模式；SKILL.md/插件方法论壳的内容组织与容量惯例；evidence/verdict gate 的产品化形态；「agent 生成叙事＋确定性校验器盖章」有无成功先例。

输出：推荐选项＋理由；各候选的已知失败模式；与本仓 current 决策的冲突点排查——若与本仓决策冲突必须点名 D-xxx/ADR-xxxx，不许静默改向。