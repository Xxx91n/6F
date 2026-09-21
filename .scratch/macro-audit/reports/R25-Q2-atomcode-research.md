# R25-Q2 atomcode 调研报告（存档）

> 2026-09-22 轮25 grill Q2。置信度：高（每关键结论 ≥2 独立信源，双引擎交叉）。来源：VS Code manifest 官方／HN 34320517／javascript-package-publishing npm rename 指南／connector.zone MCP 命名指南／zttp 改名事故复盘／Ephor→Pier CHANGELOG／Claude Plugins PR#6·PR#11／twilio PR#9／proc-macro-crate／Reddit market 治理——全文经 ctx 索引 source=atomcode 可回捞。

## 结论一：双名分层是成熟模式（高置信）

对外可变显示名（displayName/brand）与内部稳定技术标识符（package name/config key/dir/server name）分层=纪律而非债；「内部名故意不同于营销名」被反复验证为最优解——仅当标识符冒充错误身份时才需改。

## 结论二：改名四问判据（高置信）

| 判据 | 改 | 留 |
|---|---|---|
| 身份正确性 | 旧名冒充错误身份（商标/官方冒充/误导） | 中性技术词不构成身份主张 |
| 已出货契约 | 无消费者依赖窗口仍开 | 包名/服务名/路径被下游引用 |
| 语义稳定性 | 名不副实 | 仍准确描述内部角色 |
| 可桥接性 | 有 bridge/deprecate/双前缀通道 | 无迁移通道（冻结文案/已发 release） |

- npm 无 rename：改名=新名发布+旧名 bridge+deprecate+永久保有——包名层改名是高成本例外；
- MCP config key 不进握手、客户端侧标识（影响日志/前缀/已存 prompt）——「选好就别动」；
- zttp 事故最锋利边界：已发布 changelog/release 描述「那版本发了什么」非「当前词汇表」——历史记录不可机械改名，落点=Unreleased 区新旧并陈；Ephor→Pier 诚实 reset 前提=零 release/forks/dependents；
- Cargo 依赖改名/`proc-macro-crate`=标识符可变性在语言层建模——分层是内建机制非债。

## 结论三：displayName 与包名不一致是常态（高置信）

VS Code 生态制度化分离（name=json-fmt-pro/displayName=JSON Formatter Pro；displayName 担发现性职能）；风险三枚各带解法：冒充混淆（market 页自证 6F↔kernel 名关系）/改名悬挂（标识符永久保有）/验证工具链（Claude 先例=标识符改而仓库名不改）。冻结文案处置=zttp 纪律：历史记录不可变、改写记入新文档位/变更注记——displayName=冻结文案中「按设计就该跟品牌走」的可变半区，改它+注记非静默重写。

## 结论四：冲突面（辩证）

1. 宣言处处见 6F vs kernel 保留 macro-audit——边界须**写下来**（HN dottedmag：层内一致+书面边界，不靠感觉）；
2. plugin.json name=6f + skills=./skills/macro-audit 表面不一致=标准形态非债；
3. D-031 冻结 vs displayName 可变半区不真冲突——修订走注记不走静默改写；
4. social-card 已产未传=零成本改名区直接以 6F 产出；
5. {#macro-audit} 锚点外引风险→双锚兼容（zttp 双前缀模式；EN 锚为 canonical 源 zh-CN 跟随）。

## 对比矩阵：实物面处置

| 资产 | 处置 |
|---|---|
| README EN/zh-CN（含锚点） | 改 6F＋留兼容锚 `<a id="macro-audit">` |
| hero.svg / social-card.png | 改/重产 6F |
| description.md displayName | 改 6F＋文档内变更注记（原值→新值+日期） |
| architecture.svg kernel 标签 / engine README（加一行 kernel 代号注记） / plugin.json skills 路径 / .mcp.json 服务名 | 保留 macro-audit——纪律非债 |

## 信息缺口

GitHub 官方对 repo 名 vs README 显示名的正式政策未找到；Claude Code marketplace 官方对 name↔displayName 不一致的治理文未见（以社区 PR 交叉补）；六 F 宣言与双名分层并置时读者是否混淆无受众实证。
