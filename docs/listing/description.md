# macro-audit —— 上架文案草稿（#41b / D-031 冻结版本）

> 能力边界以仓根 README 的能力状态表为准（capability 1/2/3/4 of 5 preview——Micro-A 产线化 #85②；Macro-A = Not yet in preview）。本草稿不自己发明能力声明。
> 决定和术语写在哪，见 [`docs/authority.md`](../authority.md)；这份文件只是上架文案草稿，不是决定本身。

## name

`6f`（kebab-case，≤64 字符，两个生态的命名规则都合规；对外产品名由 D-052 定下，内核命令行和包名仍是 macro-audit——插件名和内核名分开）

## displayName

`6F`（/plugin UI 显示名）　·　**变更注记**：原值 `Macro Audit` → `6F`（2026-09-22，D-092/D-093 对外改名的影响——displayName 属于各生态允许改的那一半，改动靠写变更注记记录，不悄悄改写原文；已经定下来的其他字段不动）

## description（短，≤1 行）

工程内容做宏观加微观审计：把仓库历史和决策语料变成带出处坐标和回执、判定落在三个档里的审计报告（预览版：单仓四象限档、历史演化档、改动档和单文件档这四档）。

## description（长，listing 正文）

6f 是工程内容审计插件（内核命令行工具叫 macro-audit），也是 Agent 插件（按 Agent Plugins 1.0.0 的五层结构分发：plugin.json、skills、mcp.json、扩展目录、内核命令行）；计划里一共五档审计能力：Macro-A/B、Micro-A/B、Macro-C。

当前预览版的边界：

- **Macro-B 单仓四象限档**（capability 1 of 5 · preview）：从 git 日志、ADR 结构、定位三类采集 → 事实表 → 用跑之前写好的事前判据做裁决 → 带回执的报告；
- **Macro-C 历史演化档**（capability 2 of 5 · preview）：只说明单仓校对的范围和限制；
- **Micro-A PR diff（改动档）**（capability 3 of 5 · preview）：通过托管平台接口中间层去取数据（GitHub REST），在自家名下的试点仓上用 4 个 PR 校对；中间层加固（fetchDiffArtifact/cassetteFetcher）已经放进 engine，成为正式功能——#85② 已完成（D-204③④）；
- **Micro-B 单文件档**（capability 4 of 5 · preview）：`audit file` 文件卡；在自家名下的试点仓上做接入和校对，只给建议，不参与裁决；
- Macro-A **跨仓战略档** = **Not yet in preview**（路线图里的说法，不是已经能用的承诺）。

设计原则：

- 敢认跑不通——支持、不支持、证据不够这三档判定都照实写数字，不为了好看硬说跑通；
- 每条声明都带出处坐标和复跑命令；降级产物带 `⚠ unverified` 标记；没接上的证据范围写「⚠ 数据未接」；合成 fixture 带 `synthetic` 标记，不冒充真实审计；
- 被测仓库只读（只用 git 的只读子命令，只读文件）；外部仓库一律要明确同意才用 URL，并做接仓库时的隔离（hooksPath=noop / ext.allow=never / 全深度校验、拒绝浅克隆）；
- `defaultEnabled:false` 的建议（审计这类插件默认不该自动开）；MCP 这边只读。

## version

`0.3.0`（0.x 版本只升不降；预览版怎么表示＝0.x 版本号＋CHANGELOG＋描述里写明——两个生态都没有专门的 preview 字段，查证记录见 41b-marketplace-fields.md §2.4）

## keywords / category / tags

- keywords: `audit`, `provenance`, `evidence`, `receipt`, `decision-ledger`, `adr`, `supply-chain`, `code-governance`
- category 建议：`security` 或 `developer-tools`（同类插件有多少，见查证文档 §4）

## license

`Apache-2.0`（D-051 定下：engine/LICENSE 已经换成这份全文，manifest/package.json/marketplace.json 也跟着同步）

## homepage / repository / author

- repository: `https://github.com/Xxx91n/6F`
- homepage: 同 repository（无独立站点）
- author.name=Xxx91n / email=xxx91n@duck.com / url=https://github.com/Xxx91n（D-052 已定）；repository/homepage=https://github.com/Xxx91n/6F

## 截图/图标

- 两个生态都不强制要求图形素材（查证 §2.5）；图标已经准备好，在 `docs/listing/icon.svg`（SVG，自己画的，没有版权负担）；
- 截图等功能冻结之后再拍真实界面（registry 25-P4/25-D3 定的是到期提醒：功能冻结后截图必须拍真实界面——这一轮不伪造）。
