# handoff — T6 市场安装闭环（2026-09-18）

> 读前基线：任务书 = `.scratch/macro-audit/handoffs/next-round.md`；决策账本 = `.scratch/macro-audit/decision-ledger.md`（D 系列）；执行账 = `.scratch/architecture-recovery/decision-ledger.md`（A 系列，本轮回 A-068）；r18 审计报告 = `.scratch/macro-audit/reports/2026-09-17-r18-audit-report.md`（§9 复审章 = 终裁通过）。

## 本轮状态一句话

T5（push）与 T6（市场安装）双闸门已按用户授权执行完毕：`origin/main` = `5493ff9`，插件 `6f@xxx91n` 经 GitHub 市场实装成功并启用（scope=user），组件面 Skills(1) `macro-audit` + MCP servers(1) `macro-audit-kernel`，kernel CLI 已全局上 PATH（selftest `ok:true` 5/5）。

## T6 实测发现与修复（真实缺陷，非演练）

| 缺陷 | 现象 | 修复 | 实证 |
|---|---|---|---|
| M1 skills 裸名非路径形 | `claude plugin install` 首装 FAIL：`skills: Invalid input`＋`Path not found: macro-audit` | gen-manifests 生成 `skills:["./skills/macro-audit"]` | `validate --strict` 清零 |
| M2 mcp 未知字段＋路径形不生效 | `mcp:"mcp.json"` validator 警告 ignored；改 `mcpServers:"./mcp.json"` 后 install 成功但 details 仍 MCP(0) | 改发 `engine/.mcp.json` 插件根标准自动发现位（`type` 映射 `meta.mcp.transport`、剔 `readOnly` 非标准键，`mcp.json` 本体留 AP 生态不动） | 本地环回＋远端重装均 MCP(1) `macro-audit-kernel` |

- 生成器单源原则保留：`manifest.meta.json` 为唯一事实源，`gen-manifests.mjs` 现产四件（`plugin.json` / `.claude-plugin/plugin.json` / `mcp.json` / `.mcp.json`）；34-check G9／41b-check A4 断言换约，G11 幂等 WATCH 增 `.mcp.json`。
- 验证链：GEN-OK → `claude plugin validate --strict ./engine` 与 `.` 双 PASS → 34-check 11/11 → 41b-check 30/30 → npm test 15 件全绿 → land push → marketplace update → install 实证。

## 推送留痕（origin/main → github.com/Xxx91n/6F）

```
5493ff9 fix(t6): MCP server 装配修复——.mcp.json 标准自动发现位（gen 第三产物）
b773e0f fix(t6): manifest 契约修复——skills 路径形＋mcpServers 正名＋marketplace description
8f1a9f7 audit(r18): 复审终裁通过——§9 复审章＋pass-handoff＋重跑证据工件
+ r18 栈 8 commit（07f5226..244e482）
```

工作分支全部清毕（but land 自动移除＋gb-local 陈旧跟踪引用已删）；唯余 `main` 与 `gitbutler/*` 内部引用。`.code-tmp/r18-audit/` 审计 scratch 未并入（可弃）。

## 残余观察（非阻断）

- **kernel CLI 依赖为设计面非缺陷**：marketplace clone 不含 `dist/`（gitignore），MCP server `command="macro-audit"` 依赖全局 CLI——C 类用户安装指引在 README/SKILL 均无（见 R19-Q2）。
- runtime-doctor-trigger：first-external-install 已发生（本机 2026-09-18），该 registry 观察面激活——下次会话首启 Claude Code 时 MCP 起服与授权提示为待观察点。
- `MACRO_AUDIT_FACTS_DB` 空值 = 按 db 寻址链（--db → env → usage 错误）设计行为。

## 下一个 grill 方向

| 优先级 | 方向 | 说明 |
|---|---|---|
| R19-Q1 | **manifest 契约守卫缺口**（新，T6 戳穿） | 无任何 NN-check 调用 `claude plugin validate --strict`——契约由生成器自洽断言守护但未经真校验器；候选 = 新 NN-check 外壳调 validate 或 JSON shape 钉 |
| R19-Q2 | **kernel CLI 安装指引缺位** | 插件装得上但 MCP/取数面需 `macro-audit` 上 PATH；C 类用户路径（npm i -g 从哪来？tgz 未发布 npm）需 README/SKILL 说明书或打包内嵌方案 |
| 承继 | R18-Q1 骨架版本守卫钉／R18-Q2 cue 表分层立规／#52b host-narrative-corpus 待数据／T7 registry 值守／T8 D-025 双读数 | 见上轮 pass-handoff |

## Suggested skills

- `gitbutler`：版本控制写操作（main 现直线，新工作开新 but 分支）；
- `implement` / `tdd`：R19-Q1/Q2 执行面；
- `code-review`：下轮审计双轴；
- `atomcode-research`：外部调研（串行单发）。

## 过程呈报

- T6 授权范围内执行了两个修复 commit（manifest 契约）——属「让安装路径可用」的必要前置，非静默越权；修复面、验证链、推送记录如上。
- 本机环境变更留痕：`npm i -g .` 于 `engine/`（global prefix=D:\nodejs）——如需回退 `npm rm -g macro-audit`。
- `.code-tmp/r18-audit/` 六件 scratch 留未提交区，按审计窗惯例不并入。
