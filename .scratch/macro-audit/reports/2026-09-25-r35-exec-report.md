# R35 执行报告 —— T0 守卫基线＋T1 R34 收口实施批（分支 r35-t1-vocab-narrow）

> 执行窗 2026-09-25。任务书=`D:\Aworker\6F\.scratch\macro-audit\handoffs\next-round.md`（轮35 T0/T1）；票面裁定=`.scratch/macro-audit/decision-ledger.md` D-143②④；执行账=A-093。提交栈：kmk（chore r35-t0）→ qmw（fix r35-t1）→ rkm（chore bundle，D-140② 独立 bundle commit 首用）。
> 验收标准（用户原文）：「编译通过、打包通过、启动并测活软件进程；每个平台都要有 test 闭环，避免只引入却没做到。」

## 一、完成定义逐项对照（每条附可复跑命令＋输出摘要）

| # | 声明 | 命令（仓根执行，测试类均 env -u NODE_OPTIONS） | 实测输出摘要 | 结论 |
|---|---|---|---|---|
| 1 | T0 基线：18 守卫实跑——初跑 41a-check FAIL 1/38（D7 ledger_pointer：r34 收口 commit 漏 M-013 编年行，D-143 未入编年） | `node .scratch/architecture-recovery/reports/41a-check.mjs` | 修复前 `FAIL D7 ledger_pointer 双账本实物路径在` / `FAIL 1/38` | 🔴→已修 |
| 2 | 基线修复：CHANGELOG.md 补 M-013（轮34 grill 编年，D-140~D-143/ADR-0001~0023/A-001~A-092）——r32-t0/M-010 同型先例，独立 chore commit kmk | 同上 | `PASS 38/38` | ✅ |
| 3 | T1a：file-card.ts SuppressedFacetReason 收窄 {new_file, insufficient_history}＋行尾钉「D-126③ 词表可达子集——not_applicable 仅 miss/card_type 层可达；新失败枝须扩此集」＋上行注释「不含 ok」失实声明更正为「词表源=…族」 | Node.js 写后回读断言（无 BOM/保尾行/新旧文各一） | 回读全中 bytes=20414 | ✅ |
| 4 | T1b：83-check.mjs B2 标签「两枝补齐」→「本枝新增、pin 枝既有」（对齐 file-card.ts:241 注释实义） | 同上 | 回读全中 bytes=6302 | ✅ |
| 5 | 编年随行：执行账本 A-093 行（R29-REWORK 注记前正确位）＋CHANGELOG M-014 | 回读断言 `| A-093 |`/`M-014`/`A-001 ~ A-093` | 全中 | ✅ |
| 6 | 编译通过 | `cd engine && env -u NODE_OPTIONS npm run build` | exit 0；tsc 零错＋`BUNDLE-OK dist/cli.js` | ✅ |
| 7 | 打包通过 | `npm run package`（=npm pack --dry-run） | `macro-audit-0.1.0.tgz`，`total files: 85` | ✅ |
| 8 | 启动测活 | `node dist/cli.js selftest` | `{"ok":true}` 五 checks 全 pass（manifest/4 shells/6 modes/mcp read-only/receipt≥4） | ✅ |
| 9 | MCP stdio 实物握手（复用 R33 工件） | `node .scratch/macro-audit/audits/r33/mcp-f5.cjs` | `INIT ok`→tools=[facts,quarantine,file_card]→file_card(缺库)=`card_type:miss/never_collected/isError=false`+cli_guidance 实路径 | ✅ |
| 10 | test 闭环——smoke 22 册 | `cd engine && env -u NODE_OPTIONS npm run smoke` | exit 0（&& 链全过；FILE-CARD 册单独复跑 `FILE-CARD 26/26`） | ✅ |
| 11 | 83-check 收口守卫 | `node .scratch/architecture-recovery/reports/83-check.mjs` | `PASS 19/19`（含 B2 新标签实跑、G1 实跑绿） | ✅ |
| 12 | 守卫组 18 件全绿 | 逐件 `node NN-check.mjs` | 33:31/31 39:28/28 40:57/57 41a:38/38 43:28/28 44:59/59 45:51/51 70:13/13 71:16/16 72:16/16 73:14/14 77:16/16 78:42/42 80:28/28 81:18/18 82:15/15 83:19/19 xfail-run PASS entries=0/10 | ✅ |
| 13 | dist 棘轮 | `cd engine && node scripts/check-dist.mjs` | `DIST-RATCHET PASS: dist/cli.js 257947B / cap 289395B`（与 R33 审计读数逐字一致——cli.js 零字节差） | ✅ |
| 14 | gen 幂等零漂移 | `npm run gen` ×2 后 `git status --porcelain` 对生成面 | plugin.json/.claude-plugin/adr-index 零变更 | ✅ |
| 15 | dist 再生独立 bundle commit（D-140② 首用） | `but commit … tv:q` | commit rkm 仅含 `engine/dist/fact/file-card.d.ts`（收窄后词表）；file-card.js/cli.js 无 diff（tsc 类型擦除＋注释随类型声明不 emit，esbuild 剥注） | ✅ |
| 16 | 语义 commit 零夹带 | `but diff` 逐面核 | commit qmw 仅含 file-card.ts/83-check.mjs/执行账本 A-093/CHANGELOG M-014 四面；零格式化搭车 | ✅ |

## 二、变更面清单

| 文件 | 变更 | 归属 commit |
|---|---|---|
| `CHANGELOG.md` | +M-013（轮34编年补录） | kmk |
| `engine/src/fact/file-card.ts` | :39-40 词表收窄+行尾钉+上行注释更正 | qmw |
| `.scratch/architecture-recovery/reports/83-check.mjs` | :43 B2 标签收窄 | qmw |
| `.scratch/architecture-recovery/decision-ledger.md` | +A-093 行 | qmw |
| `CHANGELOG.md` | +M-014（T1 编年） | qmw |
| `engine/dist/fact/file-card.d.ts` | 收窄后词表再 emitted | rkm |

## 三、备注与观察项

- **类型层收窄零运行时影响**：SuppressedFacetReason 仅出现于 SuppressedFacet.reason 类型位＋`:299` `failure as SuppressedFacetReason` 断言点（该处 failure 已被 `suppressed` 门控收窄语义覆盖）；`as` 收窄向交叠合法，tsc 零错。测试面断言的是运行时 reason 值（new_file/insufficient_history），不受影响。
- **dist 侧仅 .d.ts 变**：收窄成员为纯类型信息——file-card.js 因 tsc 将注释随类型声明一并擦除而零 diff；cli.js 零字节差（棘轮读数逐字复现 257947B）。D-140② 独立 bundle commit 本批首用即为最小演示。
- **BACKLOG.md #83 行/CONTEXT 词表叙述不动**：「复用 D-126③ not_applicable 族」经 D-143③ 注记坐实为文法来源引用非成员全集，A-093 行内已交叉登记。
- **可复跑取证**：本窗无新增工件脚本（MCP 握手复用 `audits/r33/mcp-f5.cjs`）；git porcelain 对 dist/.d.ts 呈 MM 系 GitButler 合成索引常态，`but status` 为准=干净。

## 四、Lessons 候选

- 收口轮 docs commit 漏 M 编年行→41a-D7 必红（本轮第三次实证：r31→r32-t0、r34→r35-t0）——收口 checklist 建议把「M 行随行」列为显式项（已两次靠下轮 T0 兜底）。
- 词表收窄类编辑天然不产生 js dist diff——bundle commit 的「最小演示」判定先行 `git status --porcelain -- engine/dist` 再看是否需要提交（本批 .d.ts 单件）。

## 五、引用工件

- 票面：handoffs/next-round.md T0/T1；decision-ledger.md D-143（件②④）/D-140②/D-095①/D-094③；ADR-0023（三层卡契约/miss 四类）
- 审计参照：architecture-recovery/reports/2026-09-25-r33-audit-report.md（O3=本批件②来源；§6 验收链同套复跑）
- 提交：kmk/qmw/rkm @ r35-t1-vocab-narrow（base e68cb89 上叠 r34-closeout mko）
