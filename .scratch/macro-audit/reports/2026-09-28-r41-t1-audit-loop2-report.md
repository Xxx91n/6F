# 2026-09-28 轮41 R40-T1 返工批 — LOOP-2 审计报告（审计窗·重跑裁定）

> 审计对象 = r40-t1-exec 栈返工五件：lpx=0099da38(F-2) / qzw=e6db5550(F-1) / ylo=ea844cf0(F-4/5/6/7) / yny=af5a8d0f(生成物) / tku=59dca3b6(返工报告)。
> 对照件 = `reports/2026-09-28-r41-t1-audit-report.md`（LOOP-1 有条件通过+F-1~F-7）＋`reports/2026-09-28-r41-t1-rework-report.md`（返工自述）。
> fixed point = 栈顶 59dca3b6（返工批顶）；方法 = 不信自述：同一套硬验收全量亲跑＋逐 finding 实物核验＋返工 commit 自身纪律复查。

## 结论：LOOP-2 PASS（无条件通过）

必修两项已修净且有实物闭环；轻项四件全处置；返工批自身 commit 纪律干净（全小 diff 零再缩进搭车、生成物独立成件、subject 零 D-锚、footer 三栏位齐）。残项三件登记为观察，不阻塞。

## 1. 硬验收复跑（全绿，与 LOOP-1 同套）

| 验收 | 命令 | 结果 |
|---|---|---|
| engine 构建 | `npm run build` | BUNDLE-OK dist/cli.js |
| dist 漂移 | `node scripts/check-dist.mjs` | DIST-RATCHET PASS 263151B/289395B |
| 启动测活 | `npm run selftest` | {"ok":true} 5/5 |
| 75a 主检 | `node 75a-check.mjs` | PASS 14/14 findings=389；S2 七因子 hit/comment/stringNom/**strCall**=true、import/call/**member**=false |
| 33 注册表 | `node 33-check.mjs` | PASS 31/31（68 项/47 事件/ALARM 1 存量） |
| XFAIL | `node xfail-run.mjs` | PASS entries=0/10 |
| 37/39/46 | 各单跑 | 37 含于全量 GREEN；39 GREEN；46 PASS 30/30 |
| 01 册内红 | `node 01-check.mjs` | FAIL D1/D5（预期，kr-01 册内） |
| 全量升格 | `node guard-all-run.mjs` | ran=60 green=59 skipped=0 red=1 allOk=true → PASS |
| SKIP 三态 | `GUARD_SIBLING_ROOT=D:/nonexistent-path-xyz` ×37/39/46 | 三件均 SKIP-with-reason exit 0（F-6 改后语义不变实证） |
| 变异探测 | node 合成源 14 例回灌 realConsumption | **14/14 PASS**：string-with-callform=false、dquoted-callform=false、member-call=true、tpl-with-call=true、tpl-text-only=false、string-callform-alone=false 等全对 |

## 2. 逐 finding 处置核验（声明→实物→结论）

| Finding | 返工声明 | 审计亲验实物 | 结论 |
|---|---|---|---|
| F-2 必修 | 引号串抹空格遮罩封死豁免通道；callForm 认成员调用位对齐 spec 原文；S2 七因子钉死；措辞三处校准 | check-kit.mjs:81 `out += q + ' '.repeat(...) + q`（内容抹空格保边界/行号）；callForm 正则 `[^\w$]`（原 `[^\w$.]`，`.` 出列→`x.stripComments(` 计调用位）；14 例探测全过含新钉 `fxStrCall`；docstring「裸」字已去；CONTEXT:365/ADR-0024 措辞改实态＋F-2 补记在案 | **修净**——同族残余二次发生通道关闭；新增 member-call 残口入 §4 观察 |
| F-1 必修 | blame-ignore-revs 立案＋报告 §4.5 披露回补 | `.git-blame-ignore-revs` 在仓根：登两 SHA 全号＋注释明示「ignore 粒度=整 commit、语义行归因同被跳过」代价；exec 报告 §4.5  verbatim 在案（3558/46、8329/369 行数据如实，63-inventory 随行灰区一并呈报） | **闭环**——认账登记路径执行如实 |
| F-3 轻 | 后续 commit subject 零 D-锚 | 五件返工 subject 全部零 `(D-` 形态；锚全在 footer `Ledger-Refs:` | **遵守** |
| F-4 轻 | env-contract.mjs 注释还原 UTF-8 | `\uXXXX` 转义清零（grep -c=0），头注可读中文 | **修净** |
| F-5 轻 | siblingExists 摘除＋75a T 组复用共用件＋import 归顶 | env-contract.mjs 无 siblingExists 导出；75a:15 import `guardDeclaredTier/guardDeclaredSurface` 共用件、:183-184 实调；writeFileSync 归顶于 :11 | **修净**——「共用」声明由虚转实 |
| F-6 轻 | SKIP 仅 rc=0 生效（crash 赢过 skip） | guard-all-run.mjs:38 `skipped: !!skipM && r.status === 0`；greenFiles 排 skipped、skipSet/redSet 互斥；SKIP 复跑语义不变 | **修净** |
| F-7 建议 | 39/46 漂移披露按 37-C1 型补齐 | 39-check:62 B 组 commit 锚不可达→WARN 退化不计数＋本地腿仍断言；46-check:60/66/73/88 B1/B2/B3/C4 全 WARN 退化型；`t(name,true)` 字面真零残留（75a toothless 自捕有效实证） | **修净**——披露半腿补齐 |

## 3. 返工批自身纪律复查（D-139/D-140②/D-161④ 适用面）

- diff 面：lpx +22/-8、qzw +25、ylo +56/-26、yny +10/-10、tku +64——全为语义行级小 diff，**零机械重缩进搭车**（对照 LOOP-1 F-1 病灶）。
- 生成物：yny 单件独立再生（D-140② 口径守），diff 为 lno 平移＋excerpt 计数语义漂移。
- trailer：五件 `Ledger-Refs`/`Chronicle` 全在；lpx/tku 带 `Adrs:`（触 ADR-0024 属实）；qzw/yny 无 ADR 省略与同批先例一致。
- 边界：返工未触 engine（build/dist 复跑零回归纯确认）；未动 48-*/56-heldout/codebuddy-r38 他 agent 残件；审计报告留 untracked 交审计窗落账——权限边界遵守。

## 4. 观察登记（不阻塞，随轮值守）

- **findings.json 陈旧 1 计数**：committed 件 `CHANGELOG.md×29`，实测现态 ×30——af5a8d0f 再生跑在 M-033 编年行落盘前（af5a8d0f 时点 CHANGELOG 已 30 次）。excerpt 元数据漂移，findings=389/键集/断言层全不受影响；下次普查再生自然收口，无须专项处置。
- **member-call 残口**：`obj.stripComments` 为名之无关成员方法可误豁免（名基启发式固有面）；`function stripComments(` 声明位同命中 callForm——两处均属 spec「调用位」字面兑现的保守残口，漏报方向，已随返工报告 §六登记。
- **envProbe 整件粒度**：46 A/D 组本仓面随 sibling 缺席全跳——组级探测拆分走 T3 窗立项。
- **63-inventory 生成物随行灰区**：已随 F-1 披露呈报在案，操作纪律=生成物单提（后续批照此）。

## 5. 引用（LOOP-2 亲验件）

- 命令：§1 表全部当窗亲跑；变异探测 14 例（含 LOOP-1 存档 13 例＋string-callform-alone 补例）。
- diff 取证：`git show` 五件全过；`--stat` 复核无重缩进；`git show af5a8d0f:CHANGELOG.md` 实证计数面时点差。
- 文件：check-kit.mjs(:75-84,51-59)、env-contract.mjs（全文）、75a-check.mjs(:11,15,183-184)、guard-all-run.mjs(:35-72)、39-check.mjs(:56-62)、46-check.mjs(:58-88)、`.git-blame-ignore-revs`、exec 报告 §4.5、CONTEXT.md:364-365、ADR-0024:43-45。
