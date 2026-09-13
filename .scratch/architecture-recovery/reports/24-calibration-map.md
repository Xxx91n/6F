# 24 — 校准输入映射清单（A-028 / spec §R3-D6）

> **硬规则**：本清单只允许指向既有 16 项信息缺口编号；新造缺口 = FAIL（prompts/24-gap-sweep-anchors.md 专属 delta）。
> 缺口编号来源：`.scratch/macro-audit/reports/2026-09-12-report.md` §12.5「仍 open/部分：D-012 5 + D-013 4（1 项部分）+ R2-Q7 新增 8（1 项性质变化）= 16 项」。
> **边界**：所有校准输入只作「校准输入」——不阻塞首报、不改写首报任何判定（TC-1 INCONCLUSIVE / TC-2 RED / TC-3 AMBER / PC 2/2 / NC-1 零命中 / C 层人裁定 supported 维持原状）；B 层判据 v1 仍锁定，任何调整只能走 v2 追加。

## 1. 既有缺口登记表（16 项 active + 1 项性质变化吸收）

| 缺口编号 | 缺口内容（来源表原文摘要） | 原状态 | 承继/吸收关系 |
|---|---|---|---|
| D-012-1 | Agent Plugins 1.1.0 working draft 未细读 | open | R2Q7-2 承继同缺口 |
| D-012-2 | 国内 agent 生态（Qwen/Kimi）对 Agent Plugins/Agent Skills 支持度未知 | open | R2Q7-8 承继同缺口 |
| D-012-3 | MCP 2026-07-28 大修订细节仅单源 | 部分 | R2Q7-7 承继同缺口 |
| D-012-4 | Skill-Inject 论文（arXiv 2602.20156）仅摘要级 | open | — |
| D-012-5 | Claude Code 完整兼容 Agent Plugins 1.0.0 时间表未官宣（跟踪 issue #88906） | open | — |
| D-013-1 | git bundle 专门文档未读 | open | — |
| D-013-2 | 超大仓 / monorepo 规模策略未展开 | open | — |
| D-013-3 | Agent Plugins 规范整页未抓取（8KB/38KB） | 部分 | R2Q7-1 承继同缺口 |
| D-013-4 | 尽调社区一手正文被拦未读 | open | — |
| R2Q7-1 | Agent Plugins 规范全文未通读（8KB/38KB） | open | = D-013-3（同一缺口两轮登记） |
| R2Q7-2 | Agent Plugins 1.1.0 working draft 未细读 | open | = D-012-1（同上） |
| R2Q7-3 | DuckDB Node API Deprecated/Neo 双线选型未定 | open | — |
| R2Q7-4 | Node SEA / Bun + 原生模块（DuckDB）组合无先例 | open | — |
| R2Q7-5 | 双 manifest 单一元数据源生成无直接先例（自研） | open | — |
| R2Q7-7 | MCP 2026-07-28 修订细节 | open | = D-012-3（同上） |
| R2Q7-8 | 国内 agent 生态支持度 | open | = D-012-2（同上） |
| R2Q7-6 | spec↔工程仓契约衔接机制 | **性质变化 → 已吸收** | 已被 ADR-0010→0011 单仓 engine/ 子目录决策吸收，不计入 16 项 active（2026-09-12-report.md §12.5「1 项性质变化」） |

登记口径：5 + 4 + 8 − 1（R2Q7-6 性质变化）= **16 项 active**。承继关系仅为溯源标注，每行独立编号均为既有编号。

## 2. 校准输入清单（逐条 → 缺口编号）

| 校准输入 | 指向缺口 | 校准内容 | 来源锚 | 性质 |
|---|---|---|---|---|
| CI-01 | D-013-2 | **超大仓/monorepo 规模策略**的分析侧参数化路径：审计类产品大仓先例（CodeScene ~300 仓 × 500k–1M LoC 基线；GitClear 10 亿行语料声明）+ 抽样语义（族内按变更频率 TOP-N + 随机补样、新仓首跑全量校准后转 diff-only——Stryker baseline / Google TSE 2021 模式）。clone/输入侧（浅 clone、partial clone、bundle）仍 open，本轮未覆盖。 | 24-atomcode-research.md 轮1 §2 / 轮2 §4.1 | 调研输入（部分校准：分析侧） |
| CI-02 | R2Q7-3 | **DuckDB Node API 双线选型**：首报实测锚——本机 `@duckdb/node-api` 原生包缺包，JSONL 同形态降级实测成立（23-report.md §4 + 23-first-report.json degraded 路径）。缺口由「选型未定」升级为「可用性风险实测确认」：Neo 线 / CI-only 策略权重应上调。 | 首报实测锚（23-report §4） | 实测锚（加重既有担忧） |
| CI-03 | R2Q7-4 | **Node SEA / Bun + 原生模块组合**：同一实测锚确认原生模块在开发机环境的可用性风险真实存在；分发/打包路径设计须内置原生模块缺失回退预案（本票 JSONL 降级即先例形态）。 | 首报实测锚（23-report §4） | 实测锚（加重既有担忧） |
| CI-04 | R2Q7-5 | **双 manifest 单一元数据源生成**：首报实测锚——`23-first-report.md` + `.json` 侧车由单一生成器（`engine/src/report/generate.ts` 纯逻辑 + 23-first-report.mjs 外壳）同源产出，「单一元数据源 → 双产物」在产品内已有实测同构先例；为双 manifest 生成脚本提供自研可行性证据（规模不同，结论限方向性）。 | 首报实测锚（23-first-report 产物对） | 实测锚（弱化缺口：自研可行证据） |

## 3. 无校准输入缺口（本轮维持原状态，如实标注）

以下 12 项本轮调研未覆盖，维持原 open/部分 状态：

| 缺口编号 | 内容 | 原状态 | 未覆盖原因 |
|---|---|---|---|
| D-012-1 / R2Q7-2 | Agent Plugins 1.1.0 working draft 未细读 | open | 分发面规范跟踪，非本票调研范围 |
| D-012-2 / R2Q7-8 | 国内 agent 生态支持度 | open | 同上 |
| D-012-3 / R2Q7-7 | MCP 2026-07-28 修订细节 | 部分 | 同上 |
| D-012-4 | Skill-Inject 论文仅摘要级 | open | 论文全文阅读任务，非本票调研范围 |
| D-012-5 | Claude Code 兼容时间表未官宣 | open | 外部时间表，只能跟踪不能调研补齐 |
| D-013-1 | git bundle 专门文档未读 | open | 输入面阅读任务，非本票调研范围 |
| D-013-3 / R2Q7-1 | Agent Plugins 规范整页未抓取 | 部分 | 规范全文抓取任务，非本票调研范围 |
| D-013-4 | 尽调社区一手正文被拦未读 | open | 同上 |

（承继对合并列示：D-012-1≡R2Q7-2、D-012-2≡R2Q7-8、D-012-3≡R2Q7-7、D-013-3≡R2Q7-1，共 8 行 4 对；独立项 D-012-4 / D-012-5 / D-013-1 / D-013-4 共 4 项。）

## 4. 边界声明

- 本清单未新造任何缺口编号；所有 CI 行仅指向 §1 登记表内既有编号（守卫 24-check.mjs 机检）。
- 调研新增开放问题（轮1 §5 ×4 / 轮2 §6 ×4）属调研报告自身的信息缺口段，**不进入本清单、不升格为缺口条目**。
- B 层多仓复核计划 v1 骨架（轮2 §4.1–4.4）是本票自身的执行产物（阶段 2 输入），不映射缺口编号。
- 校准输入不改写首报任何判定；多仓复核属阶段 2 计划，本票只产出计划骨架不执行多仓实跑。
