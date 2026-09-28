# 2026-09-28 轮42 R41-impl 执行批 — 执行报告（执行窗）

> 执行对象 = R41 收口节「执行窗登记」四批（D-163①②③④⑥／D-164-a①~⑤／D-165② 复验／T3 值守读数）。
> 任务书 = `D:\Aworker\6F\.scratch\macro-audit\handoffs\next-round.md`；裁本 = `decision-ledger.md` R41 收口节＋本批兑现节。
> 本批声明每条附「命令 + 输出摘要」可复跑证据；工作面 = `.scratch/architecture-recovery/reports/`＋账目三件（ledger/CHANGELOG/CONTEXT）＋registry/75a-register。
> 验收标准原文：「编译通过、打包通过、启动并测活软件进程；每个平台都要有 test 闭环，避免只引入却没做到。」

## 分层定稿声明（Dual Reporting，D-165 文法）

- **裁定层**：R41 六裁（D-159 revised／D-160／D-163／D-164／D-165）闭环不动——本批为其执行窗落地。
- **验收层**：判据②「fresh clone 不红海」本轮实测**翻绿**（未册化红=0＋SKIP 全带三段可读 reason）；Stage-2 维持关闭——①capability 5/5 未达、③GAP-HOST-01 未闭、④30 日静默窗计时中（registry stage2-launch-criteria 确认行=criterion-02-pass-read）。

## 1. 兑现物清单

### 1.1 env-contract.mjs 泛化（D-163①③④⑥）

`D:\Aworker\6F\.scratch\architecture-recovery\reports\_lib\env-contract.mjs`（7488→扩充后字节，UTF-8/LF/单尾行）：

- **need(name, ok, fix)**：四类前缀 `sibling:/git-object:/engine-deps:/asset:`＋三段式修复指引模板（原因→手动命令→无网影响面）。
- **groupProbe(guard, group, needs)**：组级前置闸——吐 `SKIP <guard>/<group>` 行＋`GUARD-RESULT: SKIP-GROUP <guard> group=<g> reason=<r>` 机读行，缺一组跳一组。
- **gitObjectOk / materializeGitObjects / gitObjectNeedOk**：mkdtemp 临时仓 init→`git bundle unbundle`（GIT_ALTERNATE_OBJECT_DIRECTORIES 借主仓 objects 补 prereq）→反借 objectsDir 给主仓 env——主仓 object store 零写（D-074）。
- **engineDepsOk**：createRequire(eng/package.json)(spec) 真加载探测（dist 随仓≠依赖已装）。
- envProbe 整件闸保留（37-check 全件 sibling 依赖仍整件 SKIP）。

### 1.2 守卫改接明细

| 件 | 变更 | 组/级 |
|---|---|---|
| 26-check | C 组（frozen-object 13 钉）挂 `git-object:fc00d458…` | 组级（A/B/D 不受影响） |
| 27-check | C2 组（golden 对照物锚）挂 git-object | 组级 |
| 28-check | a~c 组（0001–0009 冻结文档）挂 git-object | 组级（GO28 门） |
| 23-first-report-check | R1/R3 历史锚组挂 git-object | 组级（R2/R4 现行面无依赖） |
| 43-check | 摘除主仓 unbundle/update-ref 善后件——读法统一走 env-contract 物化面；头注修订 | 整件自净化 |
| 38-check | tier→env-contract；E1 组挂 engine-deps:@duckdb/node-api | 组级 |
| 39-check | B 组挂 sibling×3（原 envProbe 整件→groupProbe）；D 组挂 engine-deps | 组级——E~J 本仓面脱连坐 |
| 40-check | B 组挂 asset:40-clone-cache（播种指引=repo add --cache）；D13 挂 engine-deps | 组级 |
| 46-check | B/C 组挂 sibling:jiahao | 组级——A/D/E 零需照跑 |
| 50-check | tier→env-contract；F1 挂 engine-deps | 组级 |
| 53-check | tier→env-contract；B3/C/E/F/G 五组共用 DEP53 | 组级 |
| 78-check | tier→env-contract；E（quarantine.test 实跑）/F（病态重放）两组挂 DEP78；rmSync 清场收进 F 组 wrapper | 组级 |
| 80-check | tier→env-contract；G8 挂 engine-deps | 组级 |
| 83-check | tier→env-contract；G 挂 engine-deps | 组级 |

### 1.3 guard-all-run 分类器扩列（D-164-a③）

`guard-all-run.mjs`：新增 `SKIP_GROUP_RE` 解析 `GUARD-RESULT: SKIP-GROUP` 行→逐件 `skipGroups` 收集→表格 `group-skip[g1,g2]` 标位＋footer `group-skipped=N`＋逐组 `group-skip <file>:<group> :: <missing>` 披露行；allOk 公式收紧 `fail===0 && skipped===0 && groupSkipTotal===0`（组级 skip 不折绿不进 allOk——D-159③ 组级保留）。

### 1.4 tier 重声明 + 对账（D-163⑥ / D-164-a⑤）

- 十件 env-contract = {37,38,39,40,46,50,53,78,80,83}-check；75a-T3 断言 decl=reg 对账绿。
- registry `env-gated-guard-class`：guards 三件→十件＋confirmations 增 expanded 行（含逐件挂点清单）。
- 47-check 组内异质普查（D-164-a⑤）：七组全齐次 portable（A 源面/B cassette×5 离线/C smoke+实跑 github-rest.test〔dist/upstream 纯函数零网络实测〕/D dist 模块契约/E 锁表/F 文档/G BOM）——零环境前置不拆件，登记在案。

### 1.5 75a-census-register 键迁移

`23-first-report-check.mjs|magic-floor|7876081e` → `a1fbd7fb`：R1 行首增 `if (GO23)` 门致 trim 内容变→同义延续重归因（note 补记 R42 迁移缘由，非新 finding）。

## 2. 验收链实证（命令 + 输出摘要）

### 2.1 本机（D:/Aworker/6F，全环境在位）

```
node .scratch/architecture-recovery/reports/guard-all-run.mjs
→ ran=60 green=59 skipped=0 group-skipped=0 red=1 registered=1 problems=0 allOk=true
  唯一红=01-check.mjs（kr-01-corpus-regen 册内诚实保留，D1/D5 历史语料面）
node 75a-check.mjs → GUARD RESULT: PASS (14 pass, 0 fail) | findings=389
```

### 2.2 fresh clone（D:/tmp-fc/6F-clone——D-165② 复验面）

```
git clone --no-local file:///D:/Aworker/6F   # pack 传输面——fc00d458 幽灵对象不随克隆
git apply r42.patch                         # 本批 diff 落 clone 工作树
cd engine && npm ci --ignore-scripts        # 9 packages；duckdb 实加载验证 SELECT 1 OK
```

环境负面对照核实：`git cat-file -e fc00d458…` 缺席✓、engine/node_modules 缺席✓（bootstrap 前）、40-clone-cache 缺席✓、sibling 根置空 ✓（GUARD_SIBLING_ROOT=D:/tmp-fc/empty-siblings）。

**SKIP 路径实测（bootstrap 前/中）**：

```
SKIP 50-check/F1 | env-missing:engine-deps:@duckdb/node-api | 原因：…不可加载；手动修复：cd engine && npm ci；无网影响面：…
GUARD-RESULT: SKIP-GROUP 40-check group=B reason=env-missing:asset:40-clone-cache | 原因：…手动修复：repo add --cache…；无网影响面：…
```

**全量跑（npm ci 后）**：

```
GUARD_SIBLING_ROOT=D:/tmp-fc/empty-siblings node guard-all-run.mjs
→ ran=60 green=58 skipped=1 group-skipped=3 red=1 registered=1 problems=0 allOk=false
  SKIP  37-check  reason=env-missing:sibling:{env-manager,anysearch-cli,jiahao} ×3 三段指引
  group-skip 39-check:B  :: sibling:env-manager        （D/E~J 组照跑绿——连坐解除实证）
  group-skip 40-check:B  :: asset:40-clone-cache       （G 文档面/CE 组照跑绿）
  group-skip 46-check:B/C:: sibling:jiahao             （A/D/E 组 30/30 绿——D-164-a② 兑现实证）
  git-object 五件全绿——23-frozen-fc00d458.bundle 临时仓物化真实生效（clone 无该对象）
  GUARD-ALL-RESULT: PASS
```

**判据②两要素**：未册化红=0 ✓（唯一红 01-check 册内）；SKIP 全带可读 reason ✓（1 整件+3 组级，三段文法齐备）。

### 2.3 验收链（同 clone 内）

| 验收项 | 命令 | 结果 |
|---|---|---|
| 编译 | `npm run build` | tsc＋esbuild → BUNDLE-OK dist/cli.js 263151B |
| dist 同步 | `node scripts/check-dist.mjs` | DIST-RATCHET PASS 263151B/cap 289395B（margin 25.6KiB） |
| 打包 | `npm pack --dry-run` | 85 件 tgz 出包可 |
| 启动测活 | `node dist/cli.js selftest` | ok:true checks 5/5 pass（manifest/shells/mode/mcp-readonly/receipt） |
| test 闭环 | `npm run smoke` | 22 测试件全绿（smoke 6/6·collectors 14/14·adapter 7/7·batch1 41/41·micro-b 18/18·llm 25/25·preview 5/5·intake 40/40·gitcli 11/11·sql-literal 17/17·mcp-db 12/12·audit 26/26·demo/github-rest/upstream-map/narrative/citation 38·doctor 9·quarantine 58/58·audit-zero-write 4/4·dialect-boundary 19/19·file-card 36/36——duckdb 实写面全过） |

## 3. T3 值守读数

- **protected-surface-death-watch**：59 件 -check.mjs 全在位且 PROTECTED_SURFACE 非空（75a-T2 机查同证）→ zero-event-read 确认行入册；消亡事件零，退役发射腿不预建（D-164-b 口径）。
- **batch2beta-techdebt-review**：GAP-B2B-01~08 逐件复审——全 triaged/仓内值守、mini-五要素齐备；复审窗（批2-β 落地后下一审计窗）未至，无迁移。
- **codebuddy-ide-gap-watch / codebuddy-f02-display-watch**：宿主侧触发源（IDE 形态可得/宿主版本演进）未至——维持 pending，本仓零可观测手段如实守望。
- **stage2-launch-criteria**：判据②翻绿记册（criterion-02-pass-read）；①③④ 原状——Stage-2 关闭维持，值守非绿宣称。
- **fresh-clone-rerun-watch**：criterion-met 确认行入册——D-165② 复验义务本轮履毕。

## 4. 纪律符合性自审

| 负向条款 | 核对 |
|---|---|
| 禁主仓 fetch/写 object store（D-163） | ✓ 43-check 摘除主仓 unbundle；物化走临时仓+alternates 只读借用——clone 实测 fc00d458 缺席下五件全绿且主仓 .git/objects 零写（git status 零 object 痕迹） |
| 禁 13 红批量册化 | ✓ 零新增 known-red manifest 条目 |
| 禁 ghost 一锅端 | ✓ 五件逐件挂点（23-R 锚/26-C/27-C2/28-a~c/43 整件语义各异） |
| 禁 skip 进 allOk | ✓ footer allOk 公式含 groupSkipTotal===0 |
| 禁 skip/xfail 混标 | ✓ xfail-run.mjs 独立维护；skip 语义仅走 env-contract |
| 禁探测无据断言 portable | ✓ tier 十件逐件有真实前置挂点；47-check 齐次普查撑面 |
| 禁轮内动源 | ✓ engine/src|dist 零触碰（build+check-dist 仅 clone 内复验无 drift 预置） |
| 禁预建退役发射腿 | ✓ 消亡普查人工读数——零机件 |
| .md/.json 写盘纪律 | ✓ 全经 node fs＋回读字节计数＋无 BOM 保尾行 |
| 语义/生成物 commit 不混 | ✓ 再生件（48-golden×6/56-heldout/75a-findings）拟独立 commit |

## 5. 残项与移交

- **不闭环声明**：T2（#75 批2 建制）临窗再裁不动；46a/46b 拆件仅触发条件登记；codebuddy 两哨兵候宿主侧。
- **新债面**：无（未新增 finding、未动 known-red 册）。
- **移交下轮**：fresh-clone-rerun-watch 判据② 达成后值守降频（下一审计窗复核组级 skip 计数漂移）；Stage-2 余三判据值守。

— 修复/开发子 Agent（R42-T1 执行批）
