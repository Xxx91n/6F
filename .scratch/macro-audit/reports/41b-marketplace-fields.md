# #41b marketplace 字段查证（轮 9 T4 / D-042 授权面 / D-031 / D-037）

> 数据源 = atomcode 调研 2026-09-16（8+ searches、官方文档全文 + schema 原文双源验证，置信高）。
> 范围纪律：本查证只供备料；**提交动作=用户闸门**（D-042 listing-submission 收窄义）。

## 1. 关键结论

- **两生态均无专用 preview/beta 标注字段**（双源验证）：Claude Code 靠 `experimental` 段 / `metadata` 自由对象 / 0.x 版本号惯例 / `defaultEnabled:false` 表达；Agent Plugins 1.0.0 是 `additionalProperties:false` 封闭 10 字段 schema，preview 只能经 `version:"0.x"` 或 `extensions` 命名空间表达。
- **两生态均无签名机制**：Claude Code = GitHub 自助上架 + 官方目录人工审核表单；Agent Plugins = 推公开 git 即发布、目录爬虫次日自动收录，零注册零审核。
- **无图形资产硬性要求**：图标/截图非必需（与 CWS/JetBrains 传统市场反差大）；README 质量是人工审核硬项。

## 2. 字段矩阵

### 2.1 Claude Code `.claude-plugin/plugin.json`（插件清单）

| 字段 | 必需 | 约束 | 说明 |
|---|---|---|---|
| `name` | ✅（有 manifest 时唯一必需） | kebab-case ≤64 字符，禁双向格式字符 | 公开安装标识 |
| `version` | 可选强推 | SemVer | 缺省回退 git SHA；marketplace entry 与 plugin.json 同设时 **plugin.json 优先** |
| `displayName` | 可选 | 任意大小写+空格 | /plugin UI 显示名（CC ≥2.1.143） |
| `description` | 可选 | string | listing 描述（审核项） |
| `author` | 可选 | {name 必填, email?, url?} | |
| `homepage`/`repository`/`license`/`keywords` | 可选 | string/SPDX/string[] | 支持链接与发现标签 |
| `defaultEnabled` | 可选 | bool 默认 true | 设 false = 安装后默认停用（≥2.1.154） |
| `experimental` | 可选 | object | **最接近 preview 的官方字段** |
| `metadata` | 可选 | 自由 object | Claude Code 不读取，可放 preview 标注等目录数据 |

### 2.2 Claude Code `.claude-plugin/marketplace.json`（市场清单）

| 字段 | 必需 | 说明 |
|---|---|---|
| `name` | ✅ | 官方保留名 17 个禁用（claude-plugins-official 等），仿冒名亦封 |
| `owner` | ✅ | {name✅, email?, url?} |
| `plugins[]` | ✅ | 条目数组 |
| `plugins[].name`+`source` | ✅ | source：相对路径/github{repo,ref?,sha?}/url/git-subdir/npm/archive{url,sha256?}/command |
| `plugins[].strict` | 可选 | 默认 true，plugin.json 为组件权威 |
| `plugins[].category`/`tags`/`relevance` | 可选 | 分类、搜索标签、组织推荐信号 |
| `plugins[].headers`/`headersHelper` | 可选 | archive 源下载凭据——唯一凭据相关运行时字段 |

限额（support.claude.com）：ZIP≤50MB、每市场手动 100 / GitHub 同步 500 插件、name≤64 字符。

### 2.3 Agent Plugins 1.0.0 `plugin.json`（封闭 schema）

| 字段 | 必需 | 说明 |
|---|---|---|
| `$schema` | ✅ | const 指向 agent-plugins.org/schemas/1.0.0/plugin.schema.json |
| `name` | ✅ | 1–64 字符小写/数字/连字符/句点，禁 `--` `..`，首尾字母数字 |
| `version`/`description`/`author`/`homepage`/`repository`/`license`/`keywords` | 可选 | 元数据，仅 JSON 类型强制 |
| `extensions` | 可选 | **唯一扩展出口**：reverse-domain 键的 client 专有数据；顶层加字段=schema violation |

### 2.4 preview 标注可行路径（对应 D-031 preview 口径）

1. `version: "0.x"` + CHANGELOG 明示覆盖范围（两生态通用）；
2. Claude Code：`experimental` 段 / `metadata.preview` 自由对象 / `defaultEnabled:false`；
3. description 内文明示 capability 边界（与本仓 README 能力矩阵同一语义源）；
4. Agent Plugins：`extensions` 命名空间可挂 `com.macroaudit.*` 自有标注。

### 2.5 listing 资产清单（必需/建议）

| 资产 | Claude Code 官方目录 | Agent Plugins |
|---|---|---|
| 描述 description | ✅ 必需（人工审核项） | schema 可选、收录建议填 |
| README | ✅ 审核硬项（须解释安装与用法） | 建议 |
| CHANGELOG.md | 官方建议（配 SemVer） | 未规范 |
| 图标/截图 | ❌ 无图形资产要求 | ❌ 无 |
| 支持链接 | homepage/repository/author.email | 同名可选 |

## 3. 凭据/发布者申请流程（查证结果）

- **路径 A 自有市场**：仓库放 `.claude-plugin/marketplace.json` → `/plugin marketplace add owner/repo`。无账号申请、无签名、无审核。
- **路径 B 官方目录**：`clau.de/plugin-directory-submission` 表单 → 人工审核（manifest 合规/文件存在/无越界访问/README 质量）→ 入 external_plugins/。official 市场由 Anthropic 自策展，表单不进 official。
- **路径 C Agent Plugins**：validator 过 schema → 推公开 git = 发布完成；目录爬虫自动收录。零注册零审核零签名。
- **签名不存在**：市场插件静默自动更新、无完整性验证（STRML cc-plugin-audit + anthropics/claude-code#29729 双源）。

## 4. 竞品扫描（审计/治理向）

| 插件 | 定位 | 上架形态 |
|---|---|---|
| code-review（Anthropic 官方） | 多 agent 并行审计 PR 变更 | official 策展 |
| agent-governance（issue #415） | 策略执行/威胁检测/信任评分/append-only 审计日志/MCP | 提交表单路径 |
| cc-plugin-audit（STRML） | 供应链安全：静默更新检测+威胁模式 | 自有 git 市场（治理元插件） |
| claude-code-plugins-plus | 市场安全框架：强制社区 code review 准入 | 自建市场 |
| claudedirectory.org security 分类 | 93 个 security 向插件 | 第三方目录 |

**差异化位** = 策略层＋审计留痕＋MCP 化；生态公认痛点 = 无签名＋静默自动更新——listing 应把 `strict:true`、`defaultEnabled:false`、权限最小化写进 description（已入草稿）。

## 5. 信息缺口（如实登记）

- Claude Code 官方未发布 marketplace.json 的 JSON Schema 正式规范（社区批评点）；
- 官方目录审核周期无 SLA 公布；
- Agent Plugins 目录收录具体时延为社区观察值（次日级），非官方承诺。

## 来源

atomcode 调研索引 source=atomcode 2026-09-16；关键源：code.claude.com plugins-reference + plugin-marketplaces、agent-plugins.org specification+manifest+schema 原文、support.claude.com 限额文档、claude-plugins-official#415、STRML/cc-plugin-audit、systemprompt.io 发布指南。

