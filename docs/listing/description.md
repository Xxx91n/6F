# macro-audit —— listing 文案草稿（#41b / D-031 冻结口径）

> 边界文案唯一事实源 = 仓根 README 能力矩阵（capability 1-2 of 5 preview；Micro-A/Micro-B/Macro-A = Not yet in preview）。本草稿不发明能力声明。

## name

`6f`（kebab-case，≤64 字符，两生态命名规则均合规；对外产品名=D-052 拍板，内核 CLI/bin 名仍为 macro-audit——插件名与内核名解耦）

## displayName

`Macro Audit`（/plugin UI 显示名）

## description（短，≤1 行）

工程内容宏观+微观审计：把仓库历史与决策语料变成带证据锚、回执与三档裁定的审计报告（preview：仓库级与演化考古两层）。

## description（长，listing 正文）

6f 是工程内容审计插件（内核 CLI 名 macro-audit）+ Agent Plugin（Agent Plugins 1.0.0 五层盒子分发形态：plugin.json＋skills＋mcp.json＋扩展目录＋内核 CLI）；规划五层审计能力：Macro-A/B、Micro-A/B、Macro-C。

当前 preview 能力边界：

- **Macro-B 仓库级四象限**（capability 1 of 5 · preview）：gitlog/ADR 结构/定位三族采集 → 事实表 → 预声明判据裁决 → 带回执的报告；
- **Macro-C 演化考古**（capability 2 of 5 · preview）：单仓校准披露口径；
- Micro-A / Micro-B / Macro-A = **Not yet in preview**（roadmap 叙事非可用承诺）。

设计原则：

- 反复接受非跑通——supported/unsupported/insufficient 三档裁定如实落数，不为跑通而跑通；
- 每条声明带证据锚与复跑命令；降级产出带 `⚠ unverified` 印记；未接证据域带「⚠ 数据未接」；合成 fixture 带 `synthetic` 印记不冒充真实审计；
- 被测仓只读（git 只读子命令+文件读），外部仓一律 URL opt-in＋intake 隔离（hooksPath=noop / ext.allow=never / 全深度浅拒）；
- `defaultEnabled:false` 建议（审计类插件 opt-in 语义）；MCP 面 readOnly。

## version

`0.1.0`（0.x 单调递增语义；preview 表达路径 = 0.x 版本号＋CHANGELOG＋description 文明示——两生态均无 preview 专用字段，查证见 41b-marketplace-fields.md §2.4）

## keywords / category / tags

- keywords: `audit`, `provenance`, `evidence`, `receipt`, `decision-ledger`, `adr`, `supply-chain`, `code-governance`
- category 建议：`security` 或 `developer-tools`（竞品密度见查证文档 §4）

## license

`UNLICENSED`（现状；上架前需拍板 SPDX 值——⚠ 阻塞项，见 credential-checklist）

## homepage / repository / author

- repository: `https://github.com/Xxx91n/6F`
- homepage: 同 repository（无独立站点）
- author.name=Xxx91n / email=xxx91n@duck.com / url=https://github.com/Xxx91n（D-052 已定）；repository/homepage=https://github.com/Xxx91n/6F

## 截图/图标

- 两生态均无图形资产硬要求（查证 §2.5）；图标已备 `docs/listing/icon.svg`（SVG，自绘无版权负担）；
- 截图留待功能冻结后拍真实 UI（registry 25-P4/25-D3 挂门纪律：功能冻结后截图须拍真实 UI——本轮不伪造）。

