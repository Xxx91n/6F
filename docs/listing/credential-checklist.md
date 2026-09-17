# #41b 凭据申请/提交材料包（呈用户执行——agent 只备料不代触）

> D-042：凭据申请中凡需用户侧操作（账号/支付/协议签署/验证码/表单提交/推送）的环节=用户执行。
> 查证结论（41b-marketplace-fields.md §3）：**两生态均无签名机制、无注册费、提交前无需申请任何审核凭据**——"凭据申请"实际收敛为「路径选择＋表单点击＋push 授权」。
> 注：路径 B 官方目录在表单提交后有一次人工审核（质量+安全四项，见 A 表「审核」列）——属提交后流程，非凭据前置。

## A. 路径选择（用户拍板其一或组合）

| 路径 | 动作面 | 用户侧操作 | 审核 |
|---|---|---|---|
| A 自有市场（Claude Code） | 仓内加 `.claude-plugin/marketplace.json` + push | push 授权＋`/plugin marketplace add Xxx91n/6F` | 无 |
| B 官方外部目录 ⛔ 未授权（D-051） | A 完成后填表单 | `clau.de/plugin-directory-submission` 表单提交（人工审核） | 有（质量+安全四项） |
| C Agent Plugins 生态 ✅ 拍板（D-051） | plugin.json 过 validator + push 公开仓 | push 授权 | 无（爬虫自动收录） |

## B. 需用户提供的字段值（表单/owner 用）

- [x] `author.name` / `owner.name` = **Xxx91n**（D-052）
- [x] `author.email` / `owner.email` = **xxx91n@duck.com**（D-052）
- [x] `author.url` / `owner.url` = **https://github.com/Xxx91n**（D-052；repository/homepage=https://github.com/Xxx91n/6F）
- [x] **license 拍板 = Apache-2.0**（D-051/ADR-0021；engine/LICENSE 已换文＋manifest/package.json 同步）
- [x] marketplace `name` = **xxx91n**；plugin `name` = **6f**（D-052；安装引用=6f@xxx91n；.claude-plugin/marketplace.json 已建）

## C. 用户专属动作清单（agent 不代触）

- [ ] 6F 远端 push 授权确认（任务书 T10）
- [ ] jiahao 删除提交 push 授权确认（任务书 T10）
- [ ] 若走路径 B：表单提交点击（listing-submission 事件=该点击本体）
- [ ] 若需组织内分发：`.claude/settings.json` `extraKnownMarketplaces` 配置（用户侧）

## D. agent 已备料（本包之外）

- listing 文案草稿 `docs/listing/description.md`（边界文案=README 冻结口径）
- 图标 `docs/listing/icon.svg`（自绘 SVG，无版权负担）
- 字段查证 `.scratch/macro-audit/reports/41b-marketplace-fields.md`
- plugin.json/manifest.meta.json 已对齐 Agent Plugins 1.0.0（#34 已闭环）

## E. 诚实披露（入 listing 前须知）

- 发布未发生；不存在可安装 listing（README 口径）；
- preview 为 capability 1-3 of 5（Macro-B/Macro-C/Micro-A）；Micro-B/Macro-A 两层 Not yet in preview；
- 生态无签名机制——listing 描述已写权限最小化/`defaultEnabled:false` 建议作差异化（竞品启示）。

