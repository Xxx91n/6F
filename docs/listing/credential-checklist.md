# #41b 凭据申请和提交材料包（由用户执行——agent 只准备材料，不代为操作）

> 决定和术语写在哪，见 [`docs/authority.md`](../authority.md)；本文件只是材料清单。
> D-042：凭据申请里凡是需要用户侧动手的环节（账号、支付、签协议、验证码、填表、推送）都由用户来执行。
> 查证结论（41b-marketplace-fields.md §3）：**两个生态都没有签名机制、没有注册费，提交前也不用申请任何审核凭据**——所谓「凭据申请」实际就是「选路径＋点表单＋授权 push」。
> 注：路径 B 的官方目录在表单提交后有一次人工审核（质量和安全四项，见 A 表「审核」列）——这是提交之后的流程，不是提交前要先拿的凭据。

## A. 路径选择（由用户定一个或几个组合）

| 路径 | 要做的事 | 用户侧操作 | 审核 |
|---|---|---|---|
| A 自有市场（Claude Code） | 仓内加 `.claude-plugin/marketplace.json` + push | push 授权＋`/plugin marketplace add Xxx91n/6F` | 无 |
| B 官方外部目录 ⛔ 未授权（D-051） | A 完成后填表单 | `clau.de/plugin-directory-submission` 表单提交（人工审核） | 有（质量+安全四项） |
| C Agent Plugins 生态 ✅ 已定（D-051） | plugin.json 过 validator + push 公开仓 | push 授权 | 无（爬虫自动收录） |

## B. 需要用户提供的字段值（表单/owner 用）

- [x] `author.name` / `owner.name` = **Xxx91n**（D-052）
- [x] `author.email` / `owner.email` = **xxx91n@duck.com**（D-052）
- [x] `author.url` / `owner.url` = **https://github.com/Xxx91n**（D-052；repository/homepage=https://github.com/Xxx91n/6F）
- [x] **license 定下 = Apache-2.0**（D-051；出站 license=Apache-2.0；engine/LICENSE 已经换成这份全文＋manifest/package.json 同步）
- [x] marketplace `name` = **xxx91n**；plugin `name` = **6f**（D-052；安装引用=6f@xxx91n；.claude-plugin/marketplace.json 已建）

## C. 需要用户自己动手的清单（agent 不代办）

- [ ] 6F 远端 push 授权确认（任务书 T10）
- [ ] jiahao 删除提交 push 授权确认（任务书 T10）
- [ ] 若走路径 B：表单提交点击（listing-submission 事件=这次点击本身）
- [ ] 若需组织内分发：`.claude/settings.json` `extraKnownMarketplaces` 配置（用户侧）

## D. agent 已经准备好的其他材料

- 上架文案草稿 `docs/listing/description.md`（能力边界以 README 的说法为准）
- 图标 `docs/listing/icon.svg`（自己画的 SVG，没有版权负担）
- 字段查证记录已经随治理文档一起退役（git 历史里能查到 `.scratch/macro-audit/reports/41b-marketplace-fields.md`）
- plugin.json/manifest.meta.json 已经对齐 Agent Plugins 1.0.0（#34 已完成）

## E. 诚实披露（上架前必须知道）

- 发布还没发生；不存在能安装的 listing（以 README 的说法为准）；
- preview 为 Macro-B/Macro-C/Micro-A/Micro-B（capability 1/2/3/4 of 5——Micro-A 产线化 #85②，D-204③④）；Macro-A 这一层 Not yet in preview；
- 两个生态都没有签名机制——上架描述已经写明权限最小化和 `defaultEnabled:false` 的建议，作为差异化（竞品给的启示）。
