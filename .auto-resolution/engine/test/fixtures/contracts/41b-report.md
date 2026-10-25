# 41b-report — listing 资产核对留痕（D-051/D-052/D-042 / A-060）

日期：2026-09-17 ｜ 票：#41b ｜ 范围：核对留痕（非新造资产、非提交动作）

## ① 完成定义对照

| 验收项 | 结果 |
|---|---|
| 三 manifest 字段值对账 D-052 | ✅ plugin.json×2＋marketplace.json 逐键一致（name=6f/xxx91n、author 三件、homepage/repository、strict） |
| license 全链对账 D-051 | ✅ engine/LICENSE 全文＋双 plugin.json＋marketplace.json＋package.json 五处 Apache-2.0 |
| capability 口径对账 README | ✅ 抓获三处陈旧→同票修复 |
| 凭据清单闸门复核 | ✅ §B 全勾、§C 用户专属动作未勾（正确） |
| 41b-check.mjs | ✅ PASS 见 ⑥ |
| 提交/push | ⏸ 用户闸门不触碰 |

## ② 核对抓获的漂移（本票修复）

| 文件 | 陈旧内容 | 修复后 |
|---|---|---|
| docs/listing/description.md | `UNLICENSED` 阻塞语（D-051 已拍板）＋capability 1-2 of 5 | Apache-2.0 落定注记＋capability 1-3 of 5＋Micro-A preview 行 |
| .claude-plugin/marketplace.json | description 写 capability 2 of 5 | capability 3 of 5 |
| docs/listing/credential-checklist.md | §E 写 capability 1-2 of 5 | 1-3 of 5（Macro-B/C/Micro-A） |

漂移归因：#48 Micro-A preview 上架（README 升 3 of 5）与 D-051 license 换文后，listing 文案面未随动——本票核对正是为此类漂移设。

## ③ 对账明细

- `engine/plugin.json`：name=6f、version=0.1.0、author{name,email,url}=D-052 值、homepage/repository=Xxx91n/6F、license=Apache-2.0、extensions 声明保留（D-055 勘误后=声明位）
- `engine/.claude-plugin/plugin.json`：name=6f＋skills[macro-audit]＋mcp.json 引用
- `.claude-plugin/marketplace.json`：name=xxx91n、owner 三件、plugins[0]{name=6f,source=./engine,strict=true,license=Apache-2.0}
- `engine/package.json`：license=Apache-2.0
- `engine/LICENSE`：Apache-2.0 全文（头/END OF TERMS AND CONDITIONS/APPENDIX 三段校验）
- 插件名 6f 合法（2 字符小写字母数字、首尾字母数字）

## ④ 口径声明

- 本票=核对留痕：不新造 listing 资产、不执行任何提交/推送/表单动作；
- 路径 B 官方目录仍 **未授权**（D-051）；listing-submission=提交点击本体=用户专属；
- description.md 截图段维持「功能冻结后拍真实 UI，不伪造」挂门纪律；
- 「capability N of 5」唯一事实源=README 能力矩阵，listing 文案/清单/manifest 皆为下游投影。

## ⑤ 已知限制

- marketplace 收录生效需 push＋爬虫周期，本票不验证远端收录；
- Agent Plugins validator 实跑未做（schema 核对为静态对账）；
- 预存漂移清单（38/39/40/43/45 旧守卫）照旧归 T8。

## ⑥ 可复跑证据

- `node .scratch/architecture-recovery/reports/41b-check.mjs` → PASS（28 断言面）
- 漂移修复 diff：`but diff` 可见 description.md/marketplace.json/credential-checklist.md 三文件口径同步
- 工件：D:\Aworker\6F\.scratch\architecture-recovery\reports\41b-check.mjs
