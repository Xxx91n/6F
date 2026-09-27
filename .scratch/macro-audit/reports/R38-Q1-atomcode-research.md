# R38-Q1 调研报告：CodeBuddy 试用射程裁

（atomcode 调研存档；resume handle `0819f3a7-93a1-4b23-8240-f2ddd0c60e56`；题面=R38-Q1-research-prompt.md 同目录）

## 0) Sufficiency Gate

searches: 6（web_search×3／tavily×2／anysearch×1）｜ angles: Official（CodeBuddy 官方文档 EN+CN 双语）、Comparative（跨宿主可移植性）、Currency（Anthropic 2026-09 插件动态）、Criticism（安装失败排错面）｜ full reads: 5（codebuddy.ai plugin-marketplaces EN、plugins-reference EN、codebuddy.cn plugin-marketplaces CN、codebuddy.ai mcp、anthropic plugins 公告摘要级）｜ gaps: ①CodeBuddy 对插件级 `.mcp.json` 自动发现（相对 plugin.json `mcpServers` 字段）无明文——留试用实证；②CodeBuddy CLI 在 Windows 的占位符展开无一手复现报告；③pilot 验收判据无完全同构公开先例（沿 R11-Q2 先例由 dogfooding/beta 分层惯例外推）。

## 1) 执行摘要（Tl;dr）

**推荐 (c) 宽射程，但兼容性预期失效面的裁定方向与题面预设相反**（Confidence：高，双源官方文档）。核心新证据：CodeBuddy 官方文档（EN+CN 双语一致）明文「**Keeping the original names is fully compatible — CodeBuddy recognizes them automatically**」——`${CLAUDE_PLUGIN_ROOT}` 与 `.claude-plugin/` 目录均为官方兼容保留项，**题面所列「占位符字面残留→MCP 拉起必败」的预期失效面大概率不成立**。因此：不预修、不留悬案，改为「试用首轮实证占位符兼容性」；试用本身构成 ADR-0016 渠道语义内的宿主新增（合规，非新渠道）；试用先行拿真实宿主反馈喂批2 优先级。

## 2) 分点结论

### 2.1 关键证伪：预期失效面大概率不存在（两源官方交叉）

| 题面预设 | 官方文档实证 | 判定 |
|---|---|---|
| `${CLAUDE_PLUGIN_ROOT}` 未设定→字面残留→MCP 拉起必败 | plugins-reference §IX：「Environment variable: `${CODEBUDDY_PLUGIN_ROOT}` (priority) or `${CLAUDE_PLUGIN_ROOT}` (compatible)」；「CodeBuddy provides three Claude Code-compatible path variables…substituted inline in skill, command, and agent content, hook configurations, and MCP or LSP server configurations」——CLAUDE_ 名有 CODEBUDDY_ 别名，在 MCP server 配置中原位替换 | 预设不实（高置信）：engine/.mcp.json 的 `${CLAUDE_PLUGIN_ROOT}/dist/cli.js` 应被 CodeBuddy 正常替换 |
| manifest 目录 `.claude-plugin/` 兼容性未实证 | 兼容表：「Metadata directory: `.codebuddy-plugin/` (priority), `.workbuddy-plugin/`, or `.claude-plugin/` (compatible)」＋Migration Guide「Keeping the original names is fully compatible」 | `.claude-plugin/` 被识别（高置信）；残余悬点＝仓根 marketplace.json（市场文件）是否也走 `.claude-plugin/` 兼容读——市场文档正文只写 `.codebuddy-plugin/marketplace.json`，兼容表是通用陈述，此为试用首验点 |
| CodeBuddy 插件体系与 Claude Code 同构 | 官方：「designed to be compatible with the Claude Code plugin specification」；install/enable/update 语义「matches Claude Code\u0027s boundary」三处明文 | 同构成立 |

**含义**：原题「预修成宿主无关形态 or 如实留作试用实证目标」的二选一，调研裁定为第三态——**「预设证伪、实证收口」**：不动任何文件，试用首轮专验三件事（占位符替换、marketplace 目录识别、`.mcp.json` 插件级自动发现 vs plugin.json `mcpServers` 字段）。若实证真失败，修法走 plugin.json `mcpServers` 字段（CodeBuddy 原生支持，marketplace 文档示例即此形态）而非双 `.mcp.json` 同位副本——后者直接撞 D-066「禁兄弟 mcp.json 同位遮蔽」红线。

### 2.2 边界核查①：是否构成「分发渠道扩张」→ 不是，合规

ADR-0016 拒绝的是**通用市场注册**：npm/VS Code/OpenVSX/JetBrains 的 publisher 身份、不可逆锚点、审核铅垂期（ADR-0016 §Context/§Consequences 明文）。CodeBuddy 试用形态对照：分发机制＝`/plugin marketplace add owner/repo` git 自助克隆——**与 D-051 A 轨（Claude Code marketplace add）完全同构**，同一 GitHub 仓零改动、零新增不可逆锚点（无 publisher 注册、无 listing 提交、无身份创建）；CodeBuddy 官方自我定位＝Claude Code 插件规范兼容实现，非独立市场生态；license 出站面不变（Apache-2.0，ADR-0021；git-clone 分发无新 vendoring 面）。

**裁定**：属「同一渠道语义（Agent Plugins 生态自助上架形态）的新宿主消费者」，**不触发 ADR-0016 的「追加通用市场须先调研」条款**。但按账本纪律，须落一条勘误注记（非 revised）：ADR-0016 措辞「纯 Agent Plugins 生态」应注记「宿主面扩展（Claude Code 兼容宿主如 CodeBuddy）属渠道语义内，不构成渠道新增」——防后续被字面读作改向。

### 2.3 边界核查②：若预修占位符/宿主清单的冲突面 → 本案不预修，冲突面归零

- 若建议双 `.mcp.json` 或同位 `mcp.json` 副本：直接违 D-066①「MCP 钉『单一 `.mcp.json` 自动发现位』为本仓口径＋断言无兄弟 mcp.json 同位遮蔽」——**否决该修法**；
- 若建议 plugin.json 加 `mcpServers` 字段替代 `.mcp.json`：不违 D-066（manifest 字段非同位遮蔽），但牵动 34/41b-check shape 钉（D-066① 白名单）与 gen-manifests 生成器——留作实证失败后的修复候选，不作预防性预修（违 D-045 YAGNI 判例：未实证的兼容面不提前铺量）；
- 宿主扩展层职责（ADR-0008 层④）：CodeBuddy 试用**不触发**任何 hooks/呈现面实建——D-055 hooks 禁建条款原样适用，CodeBuddy 的 hooks 事件面再丰富也与本仓无关（hooks=信任税，无真实呈现需求信号禁实建）。

### 2.4 试用三裁推荐

| 裁面 | 推荐 | 理由 |
|---|---|---|
| **宿主面** | **插件全路径**为主验收线，CLI 裸跑作对照基线；纯 MCP 挂载不作独立裁面 | 插件全路径＝产品发货形态（ADR-0008 五层盒+D-067 自包含分发）的真实验收；CLI 裸跑（`node dist/cli.js` 直跑 selftest/doctor/audit）已有 5/5 PASS 实测，作失效归因的对照组（插件装上跑不动→问题在宿主适配层 vs CLI 本体）；纯 MCP 挂载绕过了 skills 壳，测的不是产品形态 |
| **目标仓** | 首验=本仓自审（安装链+dogfooding）；效果试用=env-manager（既有 Macro-B 试点对象）；不新开外部仓 | 本仓自审零新增输入面（D-013）；env-manager 是 D-033/D-047 备案试点、r36 已实测，结果可与 Claude Code 侧行读数对比（跨宿主 parity 是 pilot 的高价值读数）；新外部仓=泛化验证，是 Macro-B GA 前置（D-033⑤/#40 先例），不提前烧 |
| **验收判据** | 三段判据（见 2.5） | — |

### 2.5 验收判据：什么算「试出效果」（pilot 判据三层，外推自 dogfooding→beta 分层惯例）

1. **安装链判据（onboarding 摩擦量化）**：`/plugin marketplace add Xxx91n/6F` → `/plugin install 6f@xxx91n` → `/mcp` 看 macro-audit-kernel connected → `macro-audit selftest` 5/5。记录：实际步数、每步失败点、与 D-067④ README 两行安装文档的偏差数。**通过线＝零文档外干预步**（任何需要改仓/改配置才能跑通的步骤都是 finding，走 D-146 摄入分诊）。
2. **效果判据（time-to-first-value）**：env-manager 一次 Macro-B 审计经 CodeBuddy 宿主跑出完整报告（四象限+provenance+preview 披露块），并与 Claude Code 侧既有读数对照——字段级 parity 即「试出效果」的最低线；叙事段（若宿主 agent 走 MCP 读 facts 写叙事）记录质量供 #52b 语料。
3. **诚实披露判据（preview 纪律，ADR-0017）**：试用读数对外呈报时 capability 4/5·preview 标注、Macro-A not-yet、degraded 面如实——试用本身不许变成「CodeBuddy 已认证」的虚报素材。

### 2.6 批2/试用排序：试用先行

dogfooding/beta 分层惯例一致支持「真实环境反馈先于内部清零」（GitLab Duo 全量 dogfood、分层验收「核心工作流内部验证后即引入外部意见」）。批2=348 条字面钉普查属**非阻塞**内部整改（known-red manifest 已罩），r37 七件同样非阻塞；试用暴露的**宿主适配层真实缺陷**（若占位符/目录识别实证失败）优先级天然高于字面钉——真实用户安装链路缺陷（D-067 立票时的 P0 定性同型）压过内部卫生。试用反馈按 **D-146 四档分诊**摄入：快照属实/现状已修不进裁定链；仍开放的立 D-xxx 或挂批2 优先级重排。

### 2.7 账本冲突全查（零 revised，两处注记义务）

| 条款 | 冲突？ | 处置 |
|---|---|---|
| ADR-0016 纯插件渠道 | 无硬冲突（见 2.2） | **注记义务①**：宿主面扩展属渠道语义内 |
| D-066 单一 `.mcp.json` 口径 | 无冲突（不预修、禁同位遮蔽修法） | 试用若实证 plugin.json `mcpServers` 修法，另立票走 D-066 shape 钉联动 |
| D-067① `.mcp.json` 写死 `${CLAUDE_PLUGIN_ROOT}` | 无冲突——官方兼容别名使其成为宿主无关形态的既成事实 | **注记义务②**：D-067① 增一行「CodeBuddy 官方兼容 `${CLAUDE_PLUGIN_ROOT}`（R38-Q1 实证待真机收口）」 |
| D-059③ selftest→doctor 触发器「首个外部用户安装链路出现」 | **正面兑现**：CodeBuddy 试用即该触发器的实锚 | 触发器登记兑现 |
| D-075 自愈分层 | 无冲突：CodeBuddy=MCP 无人值守面，永不自动拉包，duckdb 绑定缺失走四段披露＋`doctor --fix` 唯一主路 | 试用预案写明此路径 |
| D-055 hooks 禁建 | 无冲突 | CodeBuddy hooks 事件面不触实建 |
| D-146/D-148/D-149/D-144 | 无冲突 | 反馈走摄入分诊；收口照守卫组判据（60 件全量＋红集⊆known-red） |

## 3) 完整来源清单

| # | 来源 | URL | 角度 | 贡献 |
|---|---|---|---|---|
| 1 | CodeBuddy Plugin Reference §IX Compatibility | https://www.codebuddy.ai/docs/cli/plugins-reference | Official | 核心证据：`.claude-plugin/`/`${CLAUDE_PLUGIN_ROOT}` 官方兼容自动识别；组件目录结构；版本缓存语义 |
| 2 | CodeBuddy Plugin Marketplaces (EN) | https://www.codebuddy.ai/docs/cli/plugin-marketplaces | Official | marketplace.json 机制、install/enable 语义同构声明、`.codebuddy-plugin/marketplace.json` 读取路径 |
| 3 | CodeBuddy 插件市场 (CN) | https://www.codebuddy.cn/docs/cli/plugin-marketplaces | Official | 与 #2 双语交叉验证一致（关键结论双源达成） |
| 4 | CodeBuddy MCP Usage | https://www.codebuddy.ai/docs/cli/mcp | Official | stdio 支持确认、project scope 首连审批、非交互 `--settings` 预配（与题面取证一致） |
| 5 | Anthropic Claude Code plugins 公告 | https://www.anthropic.com/news/claude-code-plugins | Currency | 插件生态公开 beta 形态基线 |
| 6 | Cursor MCP docs | https://cursor.com/docs/mcp | Comparative | 跨宿主 MCP `.mcp.json` 惯例对照 |
| 7 | Keiko dogfood dossier issue | https://github.com/oscharko-dev/Keiko/issues/2438 | Community | technical-preview promote/do-not-promote 判据实务样本 |
| 8 | dogfooding 分层惯例聚合（Harvestr 等） | （搜索聚合） | Comparative | dogfooding→beta→GA 分层、发布门=NPS/关键 issue 清零/文档齐备 |
| 9 | 本仓账本/ADR（D-066/067/075/055/146/148/149、ADR-0008/0016/0017/0020） | D:\Aworker\6F\… | 本地 SSOT | 全部内部判据（最高层级） |

## 4) 建议裁决文本（供用户拍板）

**(c) 宽射程，内容如下**：
1. 核销呈报照 (a) 办；
2. 试用三裁：宿主面=插件全路径为主＋CLI 裸跑对照；目标仓=本仓自审（安装链）＋env-manager（效果）；验收判据=2.5 三段；
3. 兼容性失效面裁定=**题面预设证伪、试用实证收口**——不预修任何文件，首轮专验占位符替换/marketplace 目录识别/`.mcp.json` 自动发现三点；实证失败再走 plugin.json `mcpServers` 修复票（禁同位双 `.mcp.json`）；
4. CodeBuddy 试用=ADR-0016 渠道语义内宿主新增（合规），落注记①②，零 revised；
5. 批2 与 r37 七件全部挂批2 不逐裁；试用反馈按 D-146 分诊回流喂批2 优先级。

**残余开放点**：①仓根 `.claude-plugin/marketplace.json` 是否被 CodeBuddy 市场读取（兼容表通用陈述 vs 市场文档单列 `.codebuddy-plugin/`）——试用第一步即验证；②插件级 `.mcp.json` 自动发现（Claude Code 惯例）在 CodeBuddy 侧未明文——同批验证；③Windows CodeBuddy CLI 真机占位符展开——你手上即真机，一次 `/plugin install` 全收口。
