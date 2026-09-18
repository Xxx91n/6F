# R19-Q1 调研报告 — manifest 契约守卫：真校验器进守卫链？

> atomcode 深调研（2026-09-18 实跑；Exa+Tavily+AnySearch 三引擎＋原文核验）。题面=R19-Q1-research-prompt.md。

## 1) 执行摘要

**推荐 (c) 混合两段式**：T6 事故的三个失败点（skills 裸名、`mcp`≠`mcpServers`、路径形 mcpServers 装上但 MCP(0)）恰好是「shape 钉能钉死前两点、但第三点必须真消费者实证」的完美分界。置信度：**高**（官方文档已确认官方 JSON Schema 存在且 `claude plugin validate --strict` 明文推荐 CI 使用；T6 本机实证 claude CLI 可无凭据跑）。

## 2) 分点结论

**R1. 工业心智：validator-CLI 进 CI 是主流先例，且官方普遍明文推荐**（Official，双源）
- Claude Code 官方文档原话："Pass `--strict` to treat warnings as errors. **Use it in CI** to catch a misspelled field name… before publishing"（code.claude.com/docs/en/plugins-reference，已读全文）。T6 两个 error 正是此口径覆盖的案例。
- Chrome 生态：Overwolf 官方文档 "To better follow the modern practices of CI and CD, we strongly recommend you to automate the validation process using… ajv-cli"（dev.overwolf.com，已读）；MV3 跨浏览器指南 "Lint each artefact with the engine's own tool… the cheapest checks run first, so a drifted manifest never reaches a browser download"（mv3-extension.com，已读）。
- VS Code `vsce`、Claude 生态还出现了第三方独立 Rust 校验器 `claude-plugin-validate`（crates.io，已读），验证面比官方更宽（frontmatter/hooks 结构），佐证「官方 validator 之外仍有契约面未被覆盖」。

**R2. 官方 JSON Schema 已存在——(c) 的 schema pin 分支成立**（Official，双源交叉）
- SchemaStore 收录 `https://json.schemastore.org/claude-code-plugin-manifest.json`（已读原文，draft-07，生成于 2026-04-23），且官方文档 `$schema` 字段明文指向它。`mcpServers`、`skills`（路径 pattern `^\./`）、hooks 事件枚举全部机读化。
- 更外层：Agent Plugins 1.0.0 规范自带版本化 schema（`agent-plugins.org/schemas/1.0.0/plugin.schema.json`，github.com/agentplugins/agent-plugins-spec 已读），且 §5.2 规定「未知字段 MUST report-and-ignore、MUST continue loading」——**validator 给一个 boolean，规范要三种结果**（dev.to conformance 文，已读）。
- ⚠️ 关键取舍：Claude Code 官方 schema **不设 `additionalProperties: false` 级别的 fatal 语义**（未知字段只是 warning，--strict 下才升 error）。Schema pin（ajv）会把 T6 事故①②直接抓出来，但 schema 滞后于 validator 实现的风险真实存在（schema 生成日期 2026-04，experimental.* 字段文档明说 "may change between releases"）。

**R3. `.mcp.json` vs `mcpServers` 字段：官方口径=路径形 pin 是合法且推荐的显式形态**（Official+社区，双源）
- 官方 schema 中 `mcpServers` 支持 string 路径（可指向 .mcp.json）。但 cursor/plugins#252（已读原文）实证了双文件陷阱：同一仓库同时存在 `mcp.json` 与 `.mcp.json` 时，**marketplace clone 启动了与 listing 描述不同的 server**，作者 workaround 与 Figma 同款："single `.mcp.json` + explicit pin；no root sibling"。这解释了 T6 的 MCP(0)：生成器产四件（含根 mcp.json 与 .mcp.json），路径形 pin 指向的对象在 marketplace clone 语境下可能被兄弟文件遮蔽——**生成器单源断言「四件自洽」≠ 消费者运行时语义正确**，这正是守卫缺口本质。
- 官方推荐口径（从 T6 实证+cursor#252 workaround+官方文档三重支持）：**单一 `.mcp.json` 自动发现位为默认，manifest 内不写路径形 pin，或 pin 时确保无兄弟同义文件**。

**R4. 漂移治理：本仓已有成熟先例，(c) 与 D-037 完全同构**（Comparative）
- `agent-plugins-conformance-kit` 的 "adopting without a red build on day one"：**gate on change + baseline 文件**（dev.to，已读）——与本仓 D-037⑤ advisory→enforce 两段式、44-check 的 ADVISORY 段 WARN→挂窗口转 enforce 同构。
- 安全侧先例："Pin tool descriptions the way you pin dependencies"（ziosec/iternal.ai，Tavily 搜索级）——外部工具断言 pin 版本进 lock 表是 2026 年 agentic 安全共识。本仓 engine/upstream-lock.yaml（D-037⑥）就是现成容器：claude CLI 可入锁表（active，exact-version + `claude --version` 契约，与 codelore 行同款）。

**R5. (a) 直调真校验器不可单独成立**（Criticism）
- 外部 CLI 版本漂移不可控：`--strict` 的 warning→error 升级语义随 Claude Code 版本演进（如 experimental.* 未来将强制 `experimental.*` 前缀，官方文档已预告），CI runner 的 claude 版本与本机不一致时结果不可重放——违反本仓 reproducible-build 心智。且 CI 无 claude CLI 时需 SKIP 语义，弱化门禁风险见第 5 节。

**R6. 自洽断言何时足够**（Comparative）
- 生成器单源→四产物：snapshot/golden（自洽断言）对「生成器没有漏写字段」足够，对「字段语义在消费者端生效」不够。cursor#252 与 dev.to 文共同结论：**真消费者（validator/真实 loader）是契约的消费者侧实证，self-assertion 无法替代**。T6 是教科书案例：34-check G9/G11 全绿，真 marketplace 装出 2 errors。

## 3) 对比矩阵

| 方案 | 权威性 | 确定性/可重放 | 漂移风险 | 覆盖 T6 三点 | 实施成本 | 裁定 |
|---|---|---|---|---|---|---|
| (a) 直调 claude validate enforce | 最高（官方消费者） | 低（外部版本） | 高 | 全部 | 低 | 否——权威但不可重放 |
| (b) 仅 shape 钉 | 中（自断言） | 高 | 无 | ①②可钉，③不能 | 最低 | 并入 (c) 的 enforce 段 |
| (c) 混合两段式 | 高 | 高（shape）/中（校验器 advisory） | 可治理（lock+SKIP 留痕） | 全部 | 中 | **✅ 推荐** |
| (d) 缓挂观察项 | — | — | 持续暴露 | 无 | 零 | 否——刚出过 T6 实证事故 |

## 4) 守卫改造要素清单（推荐方向展开）

1. **shape 钉（enforce，改现有 34-check/41b-check 增断言，不动生成器）**：
   - plugin.json（两份）`skills` 值必须匹配 `^\./`（裸名即 fail）——T6 事故①钉死；SchemaStore schema 同 pattern 双源支持。
   - 顶层字段白名单 = SchemaStore schema properties ∪ `$schema`；出现 `mcp`（无 S）即 fail（官方 validate 的 "suggests the likely intended name" 提示说明这是高发错型）——事故②钉死。
   - mcpServers 路径形 pin 时断言「无兄弟 mcp.json 同位遮蔽」（cursor#252 教训）；或直接钉「MCP 单一 .mcp.json 自动发现位、manifest 不写 pin」为本仓口径——与 ADR-0008 五层盒子中 `.mcp.json` 标准位一致。
2. **真校验器（advisory/event_bound）**：`claude plugin validate <plugin-dir> --strict` 在两处触发：(i) manifest.meta.json 或 gen-manifests.mjs 变更时（CI event_bound）；(ii) pack/marketplace 发布前置（手动窗口）。输出进报告留痕，WARN 不红——per D-037⑤ 第一段。
3. **SKIP 语义硬化**：环境无 claude CLI → 报告记 `SKIP(claude-validate): cli-absent` 且**计入 WARN 计数**，连续 N 次 SKIP 在 check 输出顶部升格为显式提示（防 advisory 空转/SKIP 弱化，对齐 conformance-kit 的 KNOWN-baseline 心智）。
4. **schema pin（若走本地校验分支）**：pin `https://json.schemastore.org/claude-code-plugin-manifest.json` 快照进仓（ajv 或 zod 校验），upstream-lock 加一行 schemastore=planned/active；禁运行时拉取（不可重放）。注意：schema pin 只做 enforce 段补充（unknown-field 用 warning 语义，勿照搬 fatal），schema 滞后风险靠真校验器 advisory 段兜底。
5. **claude CLI 版本锚定**：engine/upstream-lock.yaml 增 `claude-cli` 行（active，exact-version，`claude --version` 三方同值断言），复用 44-check 既有版本断言机制——D-037⑥ 容器零新概念。
6. **转 enforce 判据**：advisory 位跑满 2 个版本窗口且无 SKIP 污染 → 转 enforce（对齐 D-037 两段式节奏）。

## 5) 各候选已知失败模式

| 候选 | 已知失败模式 |
|---|---|
| (a) | 版本漂移致 CI 红/绿不可重放；CI 无 CLI 直接空转；`--strict` 语义随版本收紧（experimental.* 预告变更）误伤 |
| (b) | 自断言盲区再现：下一次事故大概率发生在「我们没想到要钉的语义」上（T6 ③路径形 MCP(0) 任何 shape 断言都抓不住）；T6 已证此模式失败 |
| (c) | SKIP 语义弱化门禁（CI 无 claude → advisory 永不真正跑 → 空转）；schema 滞后于 validator 实现（4 月 schema vs 持续演进 CLI）；两段式转 enforce 被遗忘（需观察项/窗口触发器） |
| (d) | 下次 marketplace 实装再翻车一次；ledger 已有 T6 实证却挂观察，与 D-063 观察项「有实证即裁决」纪律相悖 |

## 6) 与本仓 current 决策冲突排查

| 检查对象 | 结论 |
|---|---|
| D-037⑤ advisory→enforce 两段式 | **无冲突，直接复用先例**——(c) 就是该模式在 manifest 域的实例化 |
| D-041 watch 三态 | 无冲突：真校验器位=event_bound（触发面明确），shape 钉=enforce，与既有 23 event_bound 分布一致 |
| D-058 Kernel/Agent 边界 | 无冲突：守卫是内核 CLI/守卫链职责，不进 Agent 运行时 |
| D-059⑨ 触发器纪律 | 无冲突：触发面（manifest.meta.json/生成器变更 + pack 前置）均为显式可机检事件，非模糊触发 |
| D-063 观察项先例 | 无冲突：T6 已是实证事故，够不上「挂观察」门槛，(d) 反而违纪律 |
| ADR-0008 五层盒子 | 无冲突且**被强化**：`.mcp.json` 标准自动发现位从「生成器惯例」升为「守卫断言」；四件生成物形状获得消费者侧锚 |
| D-052 双层命名 | 无冲突：shape 钉作用于两份 plugin.json 时按各自角色断言（仓库根 vs .claude-plugin/） |
| D-037⑥ upstream-lock | 无冲突：claude-cli 行入锁表是既有容器的新行，非新机制 |

**冲突总数：0。无需 revised 方案。**

## 7) 来源清单

| 标题 | URL | 角度 | 日期 | 贡献 |
|---|---|---|---|---|
| Plugins reference（Claude Code 官方） | https://code.claude.com/docs/en/plugins-reference | Official | 持续更新（含 v2.1.233+ 标注） | --strict CI 口径、unknown-field warning 语义、$schema 指向 SchemaStore、experimental 演进预告 |
| SchemaStore claude-code-plugin-manifest.json | https://json.schemastore.org/claude-code-plugin-manifest.json | Official | 2026-04-23 生成 | 机读契约权威；skills `^./` pattern；mcpServers 路径形定义 |
| Create and distribute a plugin marketplace | https://code.claude.com/docs/en/plugin-marketplaces | Official | 持续更新 | marketplace.json 契约面、sha pin、相对路径规则 |
| Validate the manifest… non-conformant（conformance-kit 作者） | https://dev.to/booyaka101/validate-the-manifest-reject-on-failure-and-your-plugin-client-is-non-conformant-19d7 | Criticism/Comparative | 2026-09-01 | validator boolean vs 规范三态；真消费者必要性；baseline-gated adoption 模式 |
| cursor/plugins#252（双文件遮蔽实证） | https://github.com/cursor/plugins/issues/252 | Community/实证 | 2026-08-24 | mcp.json/.mcp.json 遮蔽语义；pin+单文件 workaround（Figma 同款） |
| agent-plugins-spec 仓库 | https://github.com/agentplugins/agent-plugins-spec | Official | 1.0.0 published / 1.1.0 draft | 版本化 schema 存在；§5.2 report-and-ignore 语义 |
| claude-plugin-validate（crates.io） | https://crates.io/crates/claude-plugin-validate | Community | 近期 | 第三方校验器存在=官方 validate 之外仍有契约缺口 |
| Validate your manifest.json（Overwolf） | https://dev.overwolf.com/ow-native/reference/manifest/validate-your-manifest-json | Official | — | ajv-cli 自动化 schema 校验 CI 惯例 |
| MV3 cross-browser 指南 | https://mv3-extension.com/ | Comparative | 近期 | "Lint each artefact with the engine's own tool"、cheapest checks first 分层 |
| chrome-extension-manifest-json-schema | https://github.com/cezaraugusto/chrome-extension-manifest-json-schema | Community | — | schema-first 生态先例（Chrome MV2/MV3 版本化 schema） |
| MCP spec 2025-11-25 basic | https://modelcontextprotocol.io/specification/2025-11-25/basic | Official | 2025-11-25 | MCP 全程 JSON Schema 验证心智 |
| 知识库存档（前轮已读） | plugins-reference 全文 + Agent Plugins Google 博客 + 仓内 ledger batch | — | 2026-09-16 | R2/R3 结论的历史交叉源 |

## 8) 信息缺口

1. `claude plugin validate` 在 CI 的**无凭据**运行未获官方明文确认（T6 本机实证可用，但 GitHub Actions runner 上是否需要 login 未验证——若需要，SKIP 语义权重需上调，建议首轮 advisory 段顺带验证并登记）。
2. marketplace clone 语境下 `.mcp.json` 与 `mcp.json` 同存时 **Claude Code 侧**（非 Cursor 侧）的遮蔽优先级无官方文档——T6 ③的根因假设（兄弟文件遮蔽 vs 路径形不生效）未从官方渠道证实，需本机复现实验。
3. SchemaStore schema 的再生成频率/责任方（anthropic 主动同步 vs SchemaStore 社区抓取）未查证——影响 schema pin 的滞后窗口评估。
4. 未深挖 smithy/smithery 对 MCP server manifest 的官方 validator CLI 现状（R19-Q1 问题 1 该子项仅搜索级，无原文级证据）。