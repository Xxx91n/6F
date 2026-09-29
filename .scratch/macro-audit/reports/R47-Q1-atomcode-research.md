# R47-Q1 atomcode 调研存档 —— window_state_enum 枚举键建制裁量

（ctx_batch_execute 串行单发；searches: 6／angles: Official+Comparative+Criticism+Currency 四类达标／full reads: 6＋知识库召回；三引擎 Exa ✓/AnySearch ✓/Tavily ✗ 配额耗尽以知识库第三源替代。调研完成时刻=2026-09-29。）

## 执行摘要

**TL;DR**：推荐 **(i) 数据面补建 `window_state_enum` 对称建制**，并把 (iii) 的 check 脚本断言作为纵深防御叠加（两者不互斥，(iii) 单独采用则不充分）。同容器内 `start_event` 有枚举键而 `window_state` 裸字符串，在工业界心智模型下定位为**建制欠账**而非可接受的省略；这与「最小字段集」原则**不冲突**——枚举键是值域声明（约束既有字段），不是新增数据字段或超额功能。**Confidence：高**——枚举声明惯例与状态机字段建制惯例均有官方规范+3+ 独立工程实践收敛；「不对称=欠账」为惯例外推，标注为中高。

## 分点结论

**结论 1：枚举值域声明在 schema/registry/manifest 中的惯例是「字段级 enum 关键字」，且惯例明确要求业务状态字段必须闭集声明。**
JSON Schema 官方规范：`enum` 是标准约束关键字，用于把值限制到固定集合 [来源1]。GitDoc 实战指南："If a field represents a business state, role, mode, or category, don't leave it open-ended"——状态字段裸字符串的后果=契约漂移（不同写入方发明各自值，`done` / `completed` / `Complete` 被当三个状态）[来源2]。`window_state` 恰是典型 business state 字段，值域 `{not_started, running, satisfied_at}` 是稳定闭集，完全符合 enum 适用判据。（双源：json-schema.org + gitdoc.ai）

**结论 2：同容器内枚举覆盖不对称 → 定位为建制欠账，不是可接受状态。**
未找到「同容器不对称」直接判例（本仓特有抽象），由两个已验证惯例反向定位：
- registry/manifest 生态成熟实现里枚举覆盖成批对称：install-manifest-spec 对每个受控字段（transport.type／side-effect severity／kill_switch.kind／third_party_retention 等）逐一声明枚举，其版本演进史显示**结构缺口被当 bug 走 issue+新版本修复**（issue #4、#5 关闭两个 structural gaps）[来源5]；mcp-registry-lint 逐字段枚举（transport.type／arguments.type）且对 schema enum 之外的值直接报 error [来源6]。
- 反推：`window{}` 内两个语义关联字段机读性一等/二等公民分化=演进遗留不对称，与「逐字段对称声明」惯例相悖。**工程实害**：`window_state` 与 `start_event` 语义耦合（窗口开启事件触发状态流转），只约束其一=状态机只锁边不锁点——写入方可把 window_state 写成 "running" 而事件根本没触发，CI 无法发现跨字段不一致，因为值域本身没进机器面。

**结论 3：状态机/status 字段「值域（enum）」约束归数据面，「流转（transition）」约束归校验/应用面——明确先例分层。**
- 数据面 enum 先例：Dagu `Status` canonical lowercase token [7a]；Dagster `DagsterRunStatus` 显式枚举类 [7b]；AWS SDK wire 值建模为封闭 enum＋未知值走 `Unknown` 变体 [7c]——值域都在数据契约层封闭。
- 校验面承接更复杂的东西：Twenty CRM `state_machine` 规则（transitions: {currentValue: [allowedNext]}）管合法流转边，字段值域仍由 `Field.select({options})` 在数据面声明 [来源8]；Sourcemeta lint 管 schema 文本反模式非实例值域 [来源3]；Helm 分层原则："schema is a contract for what the chart accepts… Environment-specific policies are better enforced at a higher level (OPA Gatekeeper/Kyverno)"——能进 schema 契约的先进 schema，schema 表达不了的（跨环境策略、谓词守卫）才上移 [来源4]。
- 映射本仓：`{not_started, running, satisfied_at}` 是纯值域闭集，完全在 JSON Schema enum 表达能力内，无理由降级到 check 脚本；check 脚本适合 schema 表达不了的跨字段断言（如「satisfied_at 出现时必有对应事件记录」）。

## 对比矩阵

| 项 | 建制位置 | 能拦截的错误 | 拦不住的错误 | 惯例符合度 |
|---|---|---|---|---|
| (i) 数据面 window_state_enum | registry JSON schema | 一切非法值写入（含脚本、迁移、手工编辑）；可静态消费 | 跨字段不一致（state 与 event 不匹配） | ✅ 与 install-manifest/mcp-registry/Dagster 等生态一致 |
| (ii) 不建，留文本面 | 决策记录文本 | 无（写入错值无闸） | 一切非法值 | ❌ 违背状态字段闭集惯例；维持双源漂移 |
| (iii) 仅 check 脚本断言 | 校验层 | 跑了 CI 的写入 | 绕过脚本的写入路径；消费方无法机读值域 | ⚠️ 用于 schema 表达不了的断言；用于纯值域属用错层 |
| **(i)+(iii) 叠加（推荐）** | schema 声明值域＋check 断言跨字段一致性 | 非法值＋跨字段不一致 | （基本全覆盖） | ✅ Helm「schema 契约＋上层策略」分层范式 |

## 推荐与置信度

**推荐：采 (i)，并以 (iii) 作为增值叠加**（对 window_state 与 start_event 的联动做 check 脚本断言——跨字段一致性是 schema enum 表达不了的，恰是校验面本职）。**拒绝 (ii)**：文本面值域在机读注册表里等于没有值域。
**置信度：高**。依据强度：① 值域声明惯例（官方规范＋独立指南双源）；② 状态字段数据面闭集（Dagu/Dagster/AWS/Twenty 四独立实现多源）；③ registry 生态结构缺口修复模式（install-manifest-spec 版本史，单源但一手）。唯一外推=「不对称=欠账」定位措辞（无直接判例），但有结论 2 两条实证支撑；且即使按最保守解读，(i) 无成本增量、无原则冲突，风险不对称性完全倒向补建。

## 完整来源清单

1. JSON Schema — Enumerated values（官方）https://json-schema.org/understanding-json-schema/reference/enum ｜enum 关键字标准语义与闭集声明惯例
2. Mastering JSON Schema Enum: A Practical Guide（GitDoc, 2026-06-27）https://gitdoc.ai/resources/json-schema-enum ｜状态字段不得裸字符串判据；契约漂移实害
3. Sourcemeta JSON Schema CLI — Linting 文档 https://raw.githubusercontent.com/sourcemeta/jsonschema/HEAD/docs/lint.markdown ｜lint 层管 schema 反模式而非实例值域，界定校验面职责
4. Helm values.schema.json: Validate Values the Right Way（2026-04-21）https://alexandre-vazquez.com/helm-values-schema/ ｜schema 契约 vs 上层策略分层先例（Gatekeeper/Kyverno 类比）
5. install-manifest-spec v0.4（GitHub）https://github.com/drknowhow/install-manifest-spec ｜registry/manifest 逐字段枚举对称声明＋结构缺口按 bug 修复的版本史
6. mcp-registry-lint（GitHub, 2026-08-21）https://github.com/baobabcat/mcp-registry-lint ｜schema enum 之外的值即 error 拦截先例；CI 闸形态
7. Dagu status.go／Dagster dagster_run.py／AWS Bedrock enum（GitHub/docs.rs）｜状态机字段值域在数据面封闭的三个独立实现
8. Twenty CRM state_machine 校验规则（ctx 索引）｜流转约束归校验面、值域归数据面的分层实例
9. 本仓知识库：R39-Q3 调研＋D-173 执行记录（batch:atomcode-r39q3／update-33-window-state）｜window{} 机读五件套已落地、window_state=not_started 已进数据面的现状证据

## 信息缺口

- 未找到「同容器枚举覆盖不对称」的命名判例或专文——该定位是惯例外推，若需更强证据可查证 JSON Schema 社区对 "partial enum coverage" 的讨论。
- Tavily 引擎配额耗尽缺席，三引擎交叉退化为 Exa+AnySearch+知识库三源；核心结论均有 ≥2 独立来源支撑，缺口不影响主裁决。
