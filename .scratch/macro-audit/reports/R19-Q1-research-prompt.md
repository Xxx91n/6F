# R19-Q1 调研题面 — manifest 契约守卫缺口：真校验器进守卫链？

## 上下文（本仓实况，调研须先回顾）
- 产品=宏观+微观工程内容审计 Agent Plugin（ADR-0001~0021；CONTEXT.md 60 词；decision-ledger.md 65 条：59 current/3 revised/3 承继吸收）；
- **必读**：decision-ledger 全部 current 记录（重点 D-037⑤ advisory→enforce 两段式门禁先例、D-038 分发面、D-041 watch 三态、D-052 插件名/市场名双层命名、D-058 Kernel/Agent 边界、D-059⑨ 触发器纪律、D-063 观察项先例）；ADR-0008（五层盒子：plugin.json+skills+mcp.json+扩展目录+内核 CLI）、ADR-0016（纯 Agent Plugins 分发）、ADR-0017（preview 分级）、ADR-0021；CONTEXT 词条（Watch Tri-state、Trigger-gated Closure、Demo Fixture、Kernel/Agent 职责边界）；
- 事故实证（T6，2026-09-18）：插件 `6f@xxx91n` 经 GitHub marketplace 实装——`claude plugin validate --strict` 打出 2 errors（①skills 裸名 `"macro-audit"` 非路径形须 `./skills/macro-audit`；②`mcp` 字段名不识别应为 `mcpServers`）；修复后 mcpServers 路径形安装成功但 MCP(0)（路径形不生效），最终靠插件根 `.mcp.json` 标准自动发现位才 MCP(1)；
- 守卫现状：生成器 `gen-manifests.mjs` 从 manifest.meta.json 单源产四件（plugin.json/.claude-plugin/plugin.json/mcp.json/.mcp.json）；34-check G9/G11、41b-check A4 断言生成物形状（自洽断言全绿）；**无任何守卫调用真校验器**——「我们对自己理解的契约做断言」恰是本次被戳穿的失败模式；
- 环境：Windows 11 主机、Git Bash、Node.js 工程、CI=GitHub Actions（46-check 迁回）；claude CLI 本机已装（T6 实测可用）；插件分发=GitHub marketplace 路径 A+C（npm tgz 未发布）。

## 选项
- (a) 新 NN-check 直调 `claude plugin validate --strict` 入 enforce 位——权威但外部工具版本漂移不可控；
- (b) 只补 JSON shape 钉（skills 路径形/.mcp.json 自动发现位/字段白名单写进现有守卫断言）——确定性但仍是自断言；
- (c) 混合两段式：shape 钉 enforce（已实证三点钉死）＋真校验器 advisory/event_bound（manifest.meta.json 或生成器变更时、pack 前置时跑；环境无 claude 显式 SKIP 留痕）；若官方发布 JSON Schema 则本地 pin schema 校验；
- (d) 缓挂观察项不立守卫。

## 调研问题
1. 插件/扩展 manifest 契约守卫的工业心智：平台分发的插件生态（VS Code extensions、Chrome extensions、MCP servers、Claude/agent plugins、GitHub Actions marketplace）如何校验 manifest——官方 validator CLI 进 CI 的先例与形态（vsce lsforge/yaml schema、chrome manifest validator、smithery/mcp validator、claude plugin validate）；schema-first（JSON Schema 钉死）vs validator-CLI 的取舍惯例；
2. Claude Code / Agent Plugins 生态的契约权威源实况：plugin.json 是否有官方发布的 JSON Schema 或机读契约文档？`claude plugin validate` 的版本锚定/无头运行可行性（CI 环境能否无凭据跑）？`.mcp.json` 自动发现位 vs manifest mcpServers 字段的官方推荐口径？marketplace.json 契约面？
3. 外部校验器进守卫链的漂移治理：依赖上游工具的守卫如何处理版本漂移（pin 版本/skip 语义/advisory-then-enforce/contract test 分层）；deterministic-deps 与 reproducible-build 心智下「不可重放的外部工具断言」的处置先例；
4. 「生成器单源→多产物」一致性守卫的工业模式：codegen 产物的 contract test（snapshot/golden vs schema validation vs round-trip）；自洽断言何时足够、何时必须真消费者（真校验器=契约的消费者侧实证）；
5. 候选逐条裁定＋已知失败模式（SKIP 语义弱化门禁、advisory 位空转、schema 滞后于 validator 实现、CI 无 claude CLI）；
6. **冲突排查**：逐条点名与本仓 current 决策有无冲突（重点 D-037⑤ 两段式先例、D-041 watch 三态、D-058 kernel 边界、D-059⑨/D-063 触发器与观察项纪律、ADR-0008 五层盒子定义）；冲突→给 revised 方案。**不许改文件，只给调研报告**。

## 报告结构（严格）
1) 执行摘要：推荐＋置信度；2) 分点结论；3) 对比矩阵；4) 守卫改造要素清单（推荐方向展开：新 check 或改现有/validate 调用形态与 SKIP 语义/shape 钉清单/schema pin 若存在/触发面与门禁位）；5) 各候选已知失败模式；6) 与本仓 current 决策冲突排查；7) 完整来源清单；8) 信息缺口。