# R36 执行报告 —— 轮36 T0 基线复核＋T1 R35 收口实施批（P4 as-cast 返工，A-094）

> 执行窗 2026-09-26。票面=`D:\Aworker\6F\.scratch\macro-audit\handoffs\next-round.md` T0/T1；裁定=D-147（c′ 立即返工＋判据预声明轻量验证四件）。分支=`r36-t1-ascast-rework`（栈于 r35-closeout qwp 之上——栈序天然满足「落地须 r35-closeout 先行或同批」约束）。

## 一、完成定义逐项

| T | 项 | 结果 |
|---|---|---|
| T0 | 读本任务书＋账本 R35 节（D-144~D-147）＋R35 审计交接＋ADR-0023 | ✅ 全读 |
| T0 | 守卫基线 18 件确认 | ⚠→✅ 初跑 41a-check rc=1（D7 ledger_pointer——r35-closeout 漏 M-015 编年）；补录后 18/18 全绿 |
| T1a | file-card.ts 注记收窄＋删 cast | ✅（落地修正见 §二） |
| T1b | 验证包四件 | ✅ 全跑；dist 字节差实发生→按预声明升格 §1 全套（§四） |
| T1c | 协议核对义务 | ✅ 结论见 §三 |
| T1d | 顺带补 P6 | ✅ commit 带 A-094＋WORKFLOW §4 lessons 行 |
| T1e | 独立语义 commit | ✅ onl/yty/lmp 三提交（fill→semantic→bundle） |

## 二、落地修正（须留痕）

D-147 裁定文字「let failure: 'ok' | SuppressedFacetReason…TS 4.4 别名收窄自动兑现」**机制假设实证不成立**：TS 5.9.3 下别名收窄（`const suppressed = failure !== 'ok'`）对「函数内多处赋值的 let 绑定」不产生窄化——`reason: failure` 于 :299 报 TS2322。最小复现三中两（let+alias 环外亦败；const+alias 与 let+直判两形态干净）。

**落地取 const 三元单式**（裁定机制句的真实生效路径）：

```ts
const failure: 'ok' | SuppressedFacetReason = revisions === 1 ? 'new_file'
  : (revisions !== null && revisions < FILE_CARD_INSUFFICIENT_MIN_REVS) ? 'insufficient_history' : 'ok';
const suppressed = failure !== 'ok';   // 别名收窄真实生效
// :299 reason: failure —— cast 删除，suppressed 枝内 failure: SuppressedFacetReason
```

裁定内核（注记收窄＋删 cast＋exhaustiveness 拦截第三枝词外原因码）全兑现；`let`→`const` 为强制修正非改向。后果：emitted JS 结构性等价但字节差发生（§四），升格判据被触发——预声明判据的设计场景，无灰色地带。

## 三、T1c 协议核对结论

「返工须重跑 §1 全套」逐字出处=R35 审计报告 §5 P4 行（「…打回修复窗做此行＋重跑 §1 全套」）＋ r35-audit-handoff P4 行——**逐条呈报措辞，非常驻协议条文**；调研轮次亦未定位独立协议文档（缺口如实留）。D-147 用户拍板 (c′) 本身即授权「判据预声明减让」机制；且本轮字节差实发生，升格 (a) §1 全套已实际执行——减让路径未被使用。核对结论：容纳问题本轮不实质化，裁定文句与执行路径一致。

## 四、硬验收亲跑（§1 全套——升格后）

| 验收 | 命令 | 实测 |
|---|---|---|
| 编译 | `cd engine && env -u NODE_OPTIONS npx tsc -p tsconfig.json --noEmit` | exit 0 零错 |
| 编译+打包产物 | `cd engine && env -u NODE_OPTIONS npm run build` | exit 0，`BUNDLE-OK dist/cli.js` |
| dist 字节对比 | 54 件 sha256+size 快照比对（before/after build） | **DIST-DRIFT**：cli.js 257947→257898B（-49B）＋fact/file-card.js——emitted diff 亲审=仅 let/if-chain→const/ternary 结构性差，`reason: failure` 行字节相同（cast 本为擦除物）；.d.ts `git diff HEAD`=0B |
| 打包 | `cd engine && env -u NODE_OPTIONS npm run package` | macro-audit-0.1.0.tgz，total files: 85 |
| 测活 | `cd engine && env -u NODE_OPTIONS node dist/cli.js selftest` | `{"ok":true}` 五 checks 全 pass |
| MCP stdio | `env -u NODE_OPTIONS node .scratch/macro-audit/audits/r33/mcp-f5.cjs` | INIT ok→tools=[facts,quarantine,file_card]→缺库卡 card_type:miss/never_collected/isError=false/cli_guidance 实路径 |
| test 闭环 | `cd engine && env -u NODE_OPTIONS npm run smoke` | 22 册链式全过（末册 FILE-CARD 26/26；DIALECT-BOUNDARY 19/19） |
| dist 棘轮 | `cd engine && env -u NODE_OPTIONS node scripts/check-dist.mjs` | DIST-RATCHET PASS：257898B / cap 289395B |
| gen 幂等 | `cd engine && npm run gen` ×2 | GEN-OK＋adr-index 23 ADRs；porcelain 仅本批预期改动（MM file-card.d.ts=GitButler 合成索引噪声，git diff HEAD 空已坐实） |
| 83-check | `env -u NODE_OPTIONS node .scratch/architecture-recovery/reports/83-check.mjs` | PASS 19/19（FILE-CARD 26/26） |
| 守卫组 | 18 件逐跑 | 33/39/40/41a/43/44/45/70/71/72/73/77/78/80/81/82/83/xfail-run 全 rc=0（41a=38/38 于 M-015/M-016 落盘后复绿；xfail entries=0/10） |

## 五、提交面（独立分支 r36-t1-ascast-rework，栈于 r35-closeout 之上）

| commit | 类型 | 面 |
|---|---|---|
| onl | docs(chronicle) | CHANGELOG.md 单件——补录 M-015（r35-closeout 漏编年 41a-D7 红修，M-013/M-010/r32-t0 同型先例） |
| yty | fix(A-094) | file-card.ts（语义修）＋执行账本 A-094 行＋CHANGELOG M-016＋WORKFLOW §4 lessons 行——四件同批 |
| lmp | chore(bundle) | engine/dist/cli.js＋dist/fact/file-card.js 仅两件（D-140② 独立 bundle commit——字节差发生义务触发） |

**落地顺序约束**：M-015 ledger_pointer 引用 D-144~D-147 账行在 r35-closeout 分支——本支栈于其上（栈序 qwp→onl→yty→lmp），落地须 r35-closeout 先行或同批（M-013 P2 同型先例）。未 push（逐次授权闸门）。

## 六、阻塞与缺口

- 零阻塞。
- 缺口留档：①「返工须重跑 §1 全套」无独立常驻协议条文（§三）；②D-147 裁定 `let` 字面不可编译——已按裁定内核落地并留痕（§二），裁定字面如需追认精修属账本修订面。

## 七、Lessons 候选（已同步 WORKFLOW §4）

- TS 特性机制假设先最小复现再落地（别名收窄适用面=const/单赋点，重赋值 let 不适用）；
- commit message 收尾自检增「A-NNN 引用在场」一项。

## 八、引用文件清单

- 票面：`D:\Aworker\6F\.scratch\macro-audit\handoffs\next-round.md`（T0/T1）
- 裁定：`D:\Aworker\6F\.scratch\macro-audit\decision-ledger.md`（D-147 行952、R35 收口节）
- 审计：`D:\Aworker\6F\.scratch\macro-audit\reports\2026-09-25-r35-audit-report.md`（§1/P4/P6）＋`D:\Aworker\6F\.scratch\macro-audit\handoffs\2026-09-25-r35-audit-handoff.md`
- 调研：`D:\Aworker\6F\.scratch\macro-audit\reports\R35-Q4-atomcode-research.md`
- 改动：engine/src/fact/file-card.ts、engine/dist/cli.js、engine/dist/fact/file-card.js、CHANGELOG.md、.scratch/architecture-recovery/decision-ledger.md、.scratch/architecture-recovery/WORKFLOW.md
