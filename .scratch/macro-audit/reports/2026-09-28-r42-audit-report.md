# 2026-09-28 轮42 R42-T1 执行批 — 审计报告（审计窗）

> 审计对象 = `r42-t1-exec` 栈两 commit：`4587a09c` 语义批（实测 24 件）＋`fc981290` 生成物批（13 件），栈于 `r41-closeout`/`466aac1e`（未 push，common base `ad654c9d`）。
> 裁本 = `handoffs/next-round.md` T1 节（A/B/C 三件套）＋`decision-ledger.md` R41 收口节（D-163/D-164/D-165）＋被审报告 `reports/2026-09-28-r42-exec-report.md`。
> 方法纪律：不信报告自述——全部关键数字独立复跑（本机 `D:/Aworker/6F` ＋新建 fresh clone `D:/tmp-fc-audit/6F-clone`，`git clone --no-local` pack 传输面）；逐声明实物抽查（diff/rg/字节断言）；双轴评审走 $code-review 规程两并行只读子代理。
> 职责分离：本窗零实现面改动；findings 只呈报不代修。

## 结论：PASS（审计通过）

- 硬验收 11 项全复跑绿（含 fresh-clone 判据② 独立重演——数字与报告逐格一致）。
- Standards 轴：硬违规 0；Spec 轴：spec 要求项全落地、无缺失。
- 观察残留 6 件（全 judgement-call 级，无必修）登记 §6 供下窗 T3 分诊；过程呈报 2 件见 §5，不替裁定。

## 1. 硬验收复跑对照（claim → 审计实测）

| 验收项 | 报告声明 | 审计实测 | 结论 |
|---|---|---|---|
| 本机 guard-all-run | ran=60 green=59 red=1(册内) allOk=true | ran=60 green=59 red=1(01-check D1/D5) skipped=0 group-skipped=0 registered=1 problems=0 **allOk=true**，GUARD-ALL-RESULT: PASS | ✅ 逐格一致 |
| clone guard-all-run | ran=60 green=58 skipped=1 group-skipped=3 red=1(registered) problems=0 | ran=60 green=58 skipped=1(37 sibling×3) group-skipped=3(39-B/40-B/46-B/C) red=1(registered) problems=0 allOk=false PASS | ✅ 逐格一致 |
| SKIP 三段 reason | 全带「原因→手动命令→无网影响面」 | 37 整件 SKIP 三段齐备；组级行 `group-skip <file>:<group> :: env-missing:*` 齐 | ✅ |
| 幽灵对象缺席 | `git cat-file -e fc00d458` clone 内缺席 | clone 内 `cat-file -e fc00d458` → fatal（rc=1）；node_modules/40-clone-cache/sibling 全缺位 | ✅ 负面对照真实 |
| git-object 物化 | 五件经仓内 bundle 临时仓零写读通 | clone 内 23/26/27/28/43 全 GREEN（对象缺席下读通=物化真实生效） | ✅ |
| 主仓 object store 零写 | D-074 实证 | clone `.git` 跑前/跑后 `count-objects -v` 逐格同（in-pack=5133, loose=0）；无 refs/frozen/* 残留、无 .git/worktrees 残留 | ✅ 审计独立实证 |
| 编译 | BUNDLE-OK dist/cli.js 263151B | `npm run build` → tsc＋esbuild BUNDLE-OK | ✅ |
| dist 同步 | DIST-RATCHET 263151B/289395B | `node scripts/check-dist.mjs` → PASS 同字节数（margin 25.6KiB） | ✅ |
| 打包 | 85 件 | `npm pack --dry-run` → total files: 85 | ✅ |
| 启动测活 | selftest ok 5/5 | `node dist/cli.js selftest` → ok:true checks 5/5 | ✅ |
| test 闭环 | smoke 22 件全绿 | `npm run smoke` 22 件全绿（SMOKE 6/6·COLLECTORS 14/14·ADAPTER 7/7·BATCH1 41/41·MICRO-B 18/18·LLM 25/25·PREVIEW 5/5·INTAKE 40/40·GITCLI 11/11·SQL-LITERAL 17/17·MCP-DB 12/12·AUDIT 26/26·demo·github-rest·upstream-map·narrative·CITATION 38·DOCTOR 9·QUARANTINE 58/58·ZERO-WRITE 4/4·DIALECT 19/19·FILE-CARD 36/36）——duckdb 实写面真过 | ✅ |
| npm ci | 9 packages | clone 内 `npm ci --ignore-scripts` → added 9 packages | ✅ |

## 2. 声明→证据→结论 对照表（逐条）

| # | 报告声明 | 审计证据 | 结论 |
|---|---|---|---|
| 1 | env-contract.mjs 四类 need 前缀＋三段修复指引 | `_lib/env-contract.mjs:38-46` FIX 表四键 `sibling:/git-object:/engine-deps:/asset:`；模板全三段文法 | ✅ |
| 2 | groupProbe 组级闸吐 `GUARD-RESULT: SKIP-GROUP` 机读行 | env-contract.mjs:67-74：吐 `SKIP <g>/<grp>` 行＋机读行，返回 false；clone 实跑输出两形态齐 | ✅ |
| 3 | gitObjectNeedOk 临时仓零写物化 | env-contract.mjs:86-111：mkdtemp init→unbundle（borrowEnv 借主仓 objects）→ 返回 objectsDir 反借 `process.env.GIT_ALTERNATE_OBJECT_DIRECTORIES`；exit 钩子 cleanup | ✅ |
| 4 | engineDepsOk 真 require 探测 | env-contract.mjs:115-119 createRequire(package.json)(spec)；clone 内实测 `@duckdb/node-api`=true／`nonexistent-pkg`=false——非恒真摆设 | ✅ |
| 5 | git-object 五件挂点（23-R锚/26-C/27-C2/28-a~c/43-B5·C） | 五件 diff 逐件核实：23 GO23 门 R1/R3（R2/R4 零需不连坐）／26 C 组／27 C2／28 a-c／43 B5+C | ✅ |
| 6 | 43-check 摘除主仓 unbundle/update-ref 善后件 | diff：C 段 `git bundle unbundle` 删、`update-ref -d refs/frozen/first-report` 删、头注纪律改写为临时仓口径 | ✅ |
| 7 | 43-B1 单裁不机械归类 | 43-check.mjs:57 B1=`git bundle verify` 仓内 bundle 文件完整性——无 ghost 对象依赖，未挂闸（B2 前置 commit 200b344 为分支祖先，clone 内实绿） | ✅ 裁定原意忠实 |
| 8 | engine-deps 七件挂点 | 38-E1／39-D／40-D13／50-F1／53-B3·C·E·F·G(DEP53 共享)／78-E·F(DEP78)／80-G8／83-G——diff 逐组核实 | ✅ |
| 9 | 40-B 挂 asset:40-clone-cache＋播种指引 | 40-check diff：自定义 fix 载 `repo add … --cache` 播种命令；clone 实跑 `group-skip 40-check.mjs:B :: env-missing:asset:40-clone-cache` | ✅ |
| 10 | 46-B/C 组级化·A/D/E 脱连坐 | 46-check diff：envProbe 整件→groupProbe('B/C')；clone 实跑 group-skip[B/C] 且 46 GREEN（A/D/E 照跑） | ✅ |
| 11 | 39 B 挂 sibling×3／D 挂 deps／E~J 脱连坐 | 39-check diff＋clone group-skip[B] 且 GREEN | ✅ |
| 12 | guard-all-run SKIP-GROUP 解析＋footer 组粒度＋allOk 收紧 | guard-all-run.mjs:19 SKIP_GROUP_RE；:39-40 skipGroups 收集；footer `group-skipped=`＋`allOk=fail===0&&skipped===0&&groupSkipTotal===0`；逐组 `group-skip` 披露行——clone 输出实证 | ✅ |
| 13 | tier 十件 env-contract ↔ registry 对账 | `grep -l "TIER = 'env-contract'"` 实测集={37,38,39,40,46,50,53,78,80,83} 与 registry guards 数组逐字一致；75a-T3 断言存在且 GREEN；git-object 五件维持 portable | ✅ |
| 14 | registry 五哨兵确认行 | diff：batch2beta status-unchanged／env-gated expanded(逐件挂点清单)／stage2 criterion-02-pass-read／fresh-clone criterion-met／death-watch zero-event——五行齐 | ✅ |
| 15 | 75a-register 键迁移 7876081e→a1fbd7fb 同义延续 | diff：旧键删新键增，excerpt 随 `if (GO23)` 行首同步，disposition/decision/round=37 保留＋note 记迁移缘由 | ✅ 非新 finding |
| 16 | 47-check 齐次 portable 普查 | 47-check.mjs 零 siblingPath/envProbe/groupProbe/engineDepsOk/外部 existsSync 依赖（grep 干净）；C 组 cassette 离线实跑 | ✅ 结论成立（形态见 §5-O5） |
| 17 | 账目三件＋报告/handoff/next-round 换代 | ledger 兑现节 5 行／CHANGELOG M-035／CONTEXT 词条扩（四类 need＋组级语义）／next-round T1 标 DONE＋口径基线更新 | ✅ |
| 18 | 语义/生成物分流 | 4587a09c=语义 24 件（代码＋账目）；fc981290=纯生成物 13 件（48-golden×11/56-heldout/75a-findings，diff 复查无语义掺入） | ✅ |
| 19 | engine/src|dist 零触碰 | `git diff 466aac1e..fc981290 -- engine/` 空 | ✅ |
| 20 | known-red 册零新增 | manifest 不在 diff；红集仍=01-check 单件 | ✅ |
| 21 | 提交三栏位 trailer | 两 commit `Ledger-Refs:`/`Chronicle: M-035`/`Adrs:` 齐备 | ✅ |
| 22 | 写盘纪律（禁 BOM/保尾行） | node 字节断言：报告/handoff/env-contract BOM=false tailNL=true | ✅ |

## 3. D-xxx 逐条核对

| D 条目 | 要求 | 实现证据 | 结论 |
|---|---|---|---|
| D-163① | need 类型扩 git-object/engine-deps/asset＋三段指引 | §2-1 | ✅ 兑现 |
| D-163② | git-object 五件临时仓零写读法（禁主仓 fetch/写 object store） | §2-5/6/7＋§1 零写实证 | ✅ 兑现 |
| D-163③ | engine-deps 七件真 require 探测 | §2-4/8 | ✅ 兑现 |
| D-163④ | 40-clone-cache asset 探测 | §2-9 | ✅ 兑现 |
| D-163⑥ | tier 真实性逐件重声明＋registry 对账 | §2-13 | ✅ 兑现 |
| D-164-a① | groupProbe API 下沉 env-contract | §2-2 | ✅ 兑现 |
| D-164-a② | 46 B/C 挂 sibling·A/D/E 零需不连坐 | §2-10（覆盖残余见 §5-O3） | ✅ 兑现 |
| D-164-a③ | 39 E 脱连坐＋GUARD-RESULT 组级渲染＋footer 组粒度＋分类器扩列 | §2-11/12 | ✅ 兑现 |
| D-164-a⑤ | 47-check 组内异质普查 | §2-16 | ✅ 兑现（证据形态注记 §5-O5） |
| D-165② | fresh-clone 复验：未册化红=0＋SKIP 全带 reason | §1 clone 行——审计独立重演一致 | ✅ 判据②翻绿属实 |
| D-074 | 主仓 object store 零写 | §1 零写实证行 | ✅ 守住 |
| D-159③ | skip 不进 allOk、reason 进 footer | allOk 公式＋footer 实测 | ✅ 守住（组级同纪律） |
| D-160①②/D-164-b | 退役判据＝面消亡唯一路径；发射腿不预建 | death-watch zero-event-read 确认行；59 件 -check.mjs 实测在位（审计重数=59） | ✅ 守住 |
| D-139/D-140② | 语义/生成物 commit 不混 | §2-18 | ✅ 守住 |
| D-144①④ | 账行增量↔编年随行 | ledger 兑现节＋M-035＋两 commit trailer | ✅ 守住 |
| D-145① | engine/src|dist 触碰→build+check-dist 前置 | 未触碰（§2-19），前置未触发；clone 内仍复跑零 drift | ✅ 守住 |
| D-161④ | 三栏位 trailer | §2-21 | ✅ 守住 |
| D-165 分层定稿 | 裁定层闭环≠验收层闭环；Stage-2 不粉饰 | registry criterion-02-pass-read 同时载「余判据①③④ 原状——Stage-2 维持关闭」；报告 §分层声明双行呈报 | ✅ 文法合规 |

## 4. 双轴评审（$code-review 规程，两并行只读子代理）

### Standards（对 AGENTS.md/CONTEXT.md/ledger/registry 明文纪律＋Fowler 基线）

- **硬违规 0**；22 个 groupProbe 调用点全走 need()（零裸 existsSync 环境闸）；三段 reason 全模板齐；tier 集↔registry 逐字对账；store.js 懒加载使 78-check 顶部 await import 闸前安全（#59/D-067 设计位）。
- judgement-call 4 件：53-check `const OUTA` 同形四块重复（可上提一次）；env-contract `GIT_ALTERNATE_OBJECT_DIRECTORIES` 覆写非追加＋`_gobjCleanup` 单槽＋`join(repoRoot,'.git','objects')` 对 linked-worktree 不成立（现五调用方=独立进程单 bundle 平 clone，全不命中——潜伏性非现行缺陷）；46-check 'B/C' 整闸连坐 C1~C3 仓内断言（立法粒度本身，见 §5-O3）；40-check B1 闸后重言断言＋footer `green=` 把含组跳的件计绿（有 `group-skip[…]` 标位缓解，可误读）。

### Spec（对 next-round T1 A/B/C＋ledger D-163/164-a/165② 原文）

- (a) 缺/弱 2：47-check 普查结论=纯 prose 落 ledger（无机读工件/registry 行——登记型任务可接受但弱于 75a-register 先例）；fresh-clone 复跑自 diff 不可回放（**已被审计独立重演补强——非缺失**）。
- (b) 分外 3：`siblingPath()` 对名册外名字由静默回退改为 throw（未申报硬化，见 §5-P2）；T3 值守读数随批（任务书 T3 义务，可辩护）；48-golden 再生搅动（正确分流进生成物 commit）。
- (c) 疑似跑偏 5：46-B/C  collateral skip（同 O3）；GIT_ALTERNATE 覆写（同 Standards）；footer green 粒度（同上）；78-check 顶部 import 排序脆性（已被懒加载事实解除）；75a 键迁移语义保持（核实=同义延续正确）。

## 5. 过程呈报（不替裁定）

- **P1 报告自述计数差一**：交付摘要称「语义批 25 件」，实测 `git diff --name-only 466aac1e..4587a09c` = **24 件**（无漏文件——24 件逐件对上交付清单；纯摘要计数误差）。建议下窗顺手勘误，不值得返工批。
- **P2 未申报行为硬化**：`siblingPath()` 名册外名字由「静默回退到原名」改为 `throw`（env-contract.mjs:32）。方向上是对的（错名早炸好于探测错路径），且属本批立法文件的同窗顺手面，但报告/ledger 均未载——行为变更未申报先例登记，供下窗裁定是否补注。

## 6. 观察残留登记（judgement-call 级，零必修——下窗 T3 分诊候选）

- O1 env-contract 三处潜伏脆性：alternates env 覆写非追加（同进程二次物化不同 bundle 会丢前者可见性）／`_gobjCleanup` 单槽丢早先 tmpdir 清理／`.git/objects` 直拼对 linked worktree 不成立。现行五调用全不命中；建议触发条件=任一真实调用形态出现时再修（防 Speculative Generality）。
- O2 53-check `const OUTA` 四块重复——可上提至 TGT 旁一次（Duplicated Code）。
- O3 46-check B/C 整闸连坐：C1~C3 仓内 `46-out` 断言在 sibling 缺席时被一并跳过（D-164-a② 立法粒度自身的覆盖代价——若后悔，拆 B 与 C4 两闸即解，非本批缺陷）。
- O4 guard-all-run footer `green=` 计数把含组跳的件标 GREEN（行尾有 `group-skip[…]` 标位＋`group-skipped=N` 计数缓解；如需更严可改 GREEN-WITH-SKIP 方言标位——呈现层议题非正确性）。
- O5 47-check 普查结论仅 prose 落账（无机读普查工件/registry 行）——如要把普查升为可复跑断言，补登记面即可。
- O6 40-check B1 在 asset 闸后重言探测谓词（tautological，无害）。

## 7. 审计窗边界声明

- 本窗全程零实现面改动；worktree 他 agent/历史残件未动（`git status` 幻影 D 为 GitButler 合成索引已知假象，26-check 注记在案）。
- 复验用工件：`D:/tmp-fc-audit/6F-clone`（独立 fresh clone，含本批两 commit 内容）＋`D:/tmp-fc-audit/empty-siblings`（空 sibling 根）＋`D:/tmp-fc-audit/r42-{full,semantic}.diff`。
- Stage-2 维持关闭属实（判据②翻绿≠四判据全达）；本报告不替 Stage-2 宣称。

— 审计子 Agent（R42-T1 审计窗）
