# 2026-09-24 轮 32 返修 LOOP 复核（审计窗亲跑）

**对象**：commit `uym`（c21d406，r32-exec 栈顶）——审计窗四项必修 + 呈报裁 + 过程违规更正。
**方法**：不信自述，逐项实物抽查 + §7 同款验收亲跑 + F3/F4/F5/F6 专项 e2e。

## 结论：**LOOP 通过（返修闭环成立）**

四项必修全部实证落地，§7 验收面复跑全绿，呈报裁与过程违规更正如实登记。无新增必修；一个建议修项（F7g）经毒事实验获得实证升级理由，另留档。

## 必修逐项核对（声明→证据→结论）

| 项 | 声明 | 审计窗亲跑证据 | 结论 |
|---|---|---|---|
| F1 | 字符类 bug 修正+真值对账 | `82-check.mjs` A3 现为 `/\[ADR-\d{4}\]/g` + `rows === adrFileCount`（docs/adr 实物 `NNNN-*.md` 计数）——断言锚实物非自足阈值，比审计建议更强；82-check 15/15 实跑 PASS | ✅ 落地 |
| F2 | 零绑定→event_bound items 条目 | `33-gate-registry.json` 新增 `82-first-external-contributor`：`trigger_event`+`watch:event_bound`+owner+verify_method+confirmations（含诚实机制标注「仓外事件、人工登记翻转」）；33-check 31/31 | ✅ 落地 |
| F3 | 补采写环包 runInTransaction | `audit/file-card.ts` appendFact 批已包 `runInTransaction`；审计窗毒事实验：getter 抛 IO 类错→runAuditFile 抛出+DB 实测 `0 行`——回滚无残集实证 | ✅ 落地（实证） |
| F4 | cli_guidance 可跑 | `mcp-server.ts` repo 槽位改 `repo_path` 代入（带引号）/`<repo-path>` 占位；MCP e2e miss 应答 guidance 逐字执行 exit=0、PATH-NOT-FOUND 消除 | ✅ 落地（e2e 实证） |

## §7 验收复跑（审计窗亲跑，全绿）

- build `BUNDLE-OK`；package tgz 85 件；selftest `ok:true`（5 检）
- smoke 22 册全绿（FILE-CARD 17/17、DIALECT-BOUNDARY 19/19、QUARANTINE 58/58、AUDIT-ZERO-WRITE 4/4 等）
- 守卫 16 册 + xfail 全绿：33:31/31、39:28/28、40:57/57、41a:38/38、43:28/28、44:59/59、45:51/51、70:13/13、71:16/16、72:16/16、73:14/14、77:16/16、78:42/42、80:28/28、81:18/18、82:15/15、xfail:0
- dist 棘轮 254,308B / 289,395B（与执行窗申报逐字一致）
- gen 幂等：plugin.json / .claude-plugin/plugin.json / docs/adr/README.md 三产物双跑 sha256 全等
- **rebuild-diff**：审计窗本地 `npm run build` 后 `but status` 栈面零漂移 → 提交 dist 可由源逐字节复现（git status 裸报的 MM/D 系 GitButler 虚拟索引伪影，已排除）

## 呈报裁登记核对

- F8 维持（kernel 直投=静态指标读法）、F9 归因 HEAD 移动、F10 D-125③ 挂账步③、F11 不可证登记——均已入 exec 报告 §7，表述与原审计口径一致，无偷换。
- F9 归因可信度：观测集以 head_sha 为键，mkq→mkr 间 HEAD 前进确实改键，203→197 方向相容——登记为「已解释」。

## 过程违规更正核对

- `engine/package.json` 与 `33-gate-registry.json` 尾行已补（回读断言 endsWith('\n') 双 true）
- 44-check G6 标签已改名实相符（「编年行…非 T1 行」+断言体未变）
- exec 报告 §4 漂移分类已更正（78-check C1=接线序钉断言更新）；§7 返修段在册
- 审计三份产物（审计报告/交接/audits/r32 取证工件含 3×duckdb≈6.3MB、full-diff.patch、cli.ts.bak）随 uym 入栈留证——体积件入库属用户明示留证选择，登记不异议

## 残留（建议修批次未修——合规延后，须进下轮票面跟踪）

- **F5** MCP 缺库仍 `MCP-FILECARD-ERROR` isError 文本（非 never_collected 卡）——实测复现
- **F6** subject 缺席 not_tracked_at_sha 仍无 `available_head_shas`（pin 枝有）——实测复现
- **F7a/c/d/e/f/h/i/j** 未动（前缀歧义、headShaOf 重复、头注过时、microBCtx 注释、unused import、CAP 截断无标记、80-check BOM 钉面滞后、upload-artifact job 级）
- **F7g 实证升级建议**：毒事实验证明非 IO 类中途写错被 `classifyWriteError` 判为 constraint 静默跳过→事务照 COMMIT 残集（毒事实验中好行已落库）。F3 事务只覆盖 IO 类失败；**非 IO 洞仍在，残集场景未绝**——建议升必修或票面明示裁定容忍边界。

## 审计工件

- `D:\Aworker\6F\.scratch\macro-audit\audits\r32\loop-verify.cjs`（F3 回滚/F6/F5 专项）
- `D:\Aworker\6F\.scratch\macro-audit\audits\r32\loop-mcp-f4.cjs`（F4 指引实跑）

两脚本当前在 zz 未提交面；是否并入栈留证由你定。
