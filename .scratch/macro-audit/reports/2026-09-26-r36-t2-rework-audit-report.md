# R36 T2 返工复审报告——A-096（首轮审计不通过打回后的闭环验证）

- 复审窗：2026-09-26 ｜ 审计者：审计 Agent（独立窗，职责分离——只出报告不动手修）
- 首轮裁定：`D:\Aworker\6F\.scratch\macro-audit\reports\2026-09-26-r36-t2-audit-report.md` —— A 类 5 项必修＋B 类 7 项呈报
- 返工面：分支 r36-t1-ascast-rework 新栈三段（语义→bundle→docs 分层纪律保持）：
  - `1fc00ae` fix(A-096) 语义面 12 文件（源码/测试/bench/披露纠偏/账本编年随行）
  - `cc4bc57` chore(bundle) engine/dist 再生 5 件（D-140② 独立 bundle）
  - `29e461b` docs(A-096) 审计工件登记＋exec-report 纠偏＋handoff 返工节
- 审计姿态：不信返工自述——每项修复亲验实物＋全部验收命令本机重跑

## 裁定

**通过（PASS）**。A 类 5 项全部修复且经实物+行为双重实证，B 类 7 项已修或如实呈报，§1 硬验收 12/12 亲跑全绿，回归断言 L7~L10 新增在册（FILE-CARD 36/36），无新引入缺陷。残留判断项 2 条如实留档（见 §5），过程纪律核查合规。

## §1 A 类修复逐项核销（声明→证据→结论）

| 项 | 返工自述 | 审计亲验证据 | 结论 |
|---|---|---|---|
| A1 NUL 字节清零 | file-card.ts:198 两处裸 0x00→`'\u0000'` 转义；src/dist/cli.js 三处嗅探零命中 | `grep -cP '\x00'`：src/fact/file-card.ts=0、dist/fact/file-card.js=0、dist/cli.js=0；engine/src、engine/dist 全树 NUL 嗅探零命中；源码行现为可读转义形 `v.from+'\u0000'+v.to+'\u0000'+v.commit_sha` | ✅闭环 |
| A2a 跨集 dup 边假阳 | 并池单次去重 | `file-card.ts:310-312` edgePool=`collectRenameEdges(setFacts.concat(lineageFacts))`——单一 seen 集跨两侧；L7 断言同键边共存→不置旗、披露单份 | ✅ |
| A2b DAG 钻石假阳 | `reachesForward` 前向可达判定真环 | `file-card.ts:232-243` byFrom 前向邻接 BFS；:254 visited 命中→互达（e.from 兼为 cur 祖先+后裔）才置旗。逻辑亲核：钻石汇合不互达不置旗；L8 三边全披露不置旗 / L9 真环对照置旗 | ✅ |
| A3 zh-CN 真同步 | :38/:50 补译＋戳重绑 | 正文实测：状态句「四层 preview；Macro-A 为 Not yet」、矩阵行 `capability 4 of 5 · preview（试点集=同主双仓…）`；sync 戳 074344caef4a 绑新 EN 指纹；73-check rc=0 | ✅（顺带含 B3 同主措辞——zh 行已写「同主双仓」） |
| A4 EDGE_CAP 截断披露 | lineageEdgeCapHit→truncated 伞＋lineage_edge_cap 测试缝 | `projection.ts:134,143` 拉取量≥cap→置旗；`file-card.ts:442` truncated=resolved.truncated‖lineageEdgeCapHit；L10 降帽断言 truncated=true | ✅（残留角见 §5-R1） |
| A5 bench 分档按票面语义 | DB 案 COUNT(*) 实测＋合成案按构造行数 | `bench-file-card.mjs:93` COUNT(*) WHERE scale='Micro-B' AND repo_ref=选中集→set_facts；:126 合成案 tierOf(20561)=medium 不再硬写；工件实测 set_facts=1105/680/20561、tier=small/small/medium、verdict 全 target | ✅ |

## §2 B 类核销

| 项 | 处置 | 亲验 |
|---|---|---|
| B1 L5 恒真断言 | gone.ts 跨集 miss 实证 | 断言 `miss.miss.revalidated===true`＋`lineage_edge.commit_sha` 真实断言（非恒真式） | ✅ |
| B2 报告三处漂移 | 纠偏 | exec-report 现写工件读数 112.63/89.61/41.35（与 bench-file-card.json 逐值一致）、fileCardCitationKeys 实名、80-check=28/28 | ✅ |
| B3 同主偏差披露 | README.md:44 补 same-owner | "same-owner pilot set=jiahao＋env-manager … both pilot repos share one maintainer"；zh-CN 行亦带「同主双仓」——D-127⑤ 四件套凑齐 4/4 | ✅ |
| B4 insufficient_history 实物件 | 80-bench-thresholds.md §三盘点册补行 | 票面第 39 行「insufficient_history（failure_state 族）| C2＋L6 对照组实物断言」在册 | ✅ |
| B5 CHANGELOG 空行搭车 | 清除 | kno diff engine/CHANGELOG.md -1 行；Unreleased→Changed 间无残留空行 | ✅ |
| B6 边界判断项（peer 单跳去重/多 to 首匹配） | 呈报保留 | 返工汇总明示「带病边界已注明」——不追认不隐藏，转 backlog 口径 | ✅呈报成立 |
| B7 bench 参数校验/subjects 回退 | 修复 | A-096 账行载「未知基名显式拒/--subject 覆盖/--runs≥1 校验」；44-E4 已===2；pickedSet 冗余消 | ✅ |

## §3 硬验收重跑（首轮 §7-1 同套 12 项，全部亲跑）

| 项 | 实测 |
|---|---|
| tsc --noEmit | RC=0 |
| npm run build | RC=0 BUNDLE-OK；build 前后 dist 三件套 sha256 逐字节一致 |
| npm run package | RC=0，85 文件，255.2kB |
| selftest | RC=0，5 checks 全过 |
| check-dist | DIST-RATCHET PASS 263151B/289395B |
| MCP 探测 | INIT ok；tools=[facts,quarantine,file_card]；F5→never_collected |
| smoke | RC=0，FILE-CARD **36/36**（L7~L10 在册），22 册全绿 |
| 守卫组 | 18 脚本＋xfail 全 rc=0（33:31,39:28,40:57,41a:38,41b:33,43:28,44:59,45:51,70:13,71:16,72:16,73:14,77:16,78:42,80:28,81:18,82:15,83:19） |
| gen 幂等 | GEN-OK；全仓 hash sweep 零 drift |
| golden 再生 | RC=0，fixtures 零 drift |
| dist 重建 | build 前后 sha256 全同 |
| bench | RC=0，tier 语义修正后 small/small/medium 全 verdict=target（合成 20561 行→medium 如实） |
| 追加 §7-2 | `git diff --check HEAD`=净（RC=0）；NUL 嗅探 src+dist 零命中；L7~L10 断言在测绿 |

## §4 实跑回归抽验

- jiahao `src/shared/paths.js`（DB 副本）：stitched_from=[hooks/jiahao-paths.js]、edge 175aff7 sim=92、cycle_detected=false、truncated=false——与修复前实物一致，修复零回归。
- env-manager `src/Audit/Crypto/AuditCrypto.cs`（DB 副本）：2-hop stitched_from=[src/AuditCrypto.cs,AuditCrypto.cs]、双边 3160c32/709f6bd、cycle_detected=false——修复后行为不变。
- 证据 DB 原件 sha256 全程未动（副本探查纪律延续）。

## §5 残留判断项（如实呈报，不阻塞）

- **R1**：`lineageEdgeCapHit` 只经非空 `lineage` 块的 truncated 伞披露——若 subject 无边、但祖先边池触帽丢行（可能含该 subject 的边），卡面仍 `lineage:null`，帽事件在该卡不可见。触发条件病态（祖先集 ≥cap 边且按 fact_seq 截到），非硬错——已对照审查，留判断项。
- **R2（原 B6 延续）**：peer 分布被取代名去重仅一跳（e.to∈namesWithRows）；renamed_to 多 to-竞争边取事实序首匹配。票面带病边界，返工批已如实注明不修。

## §6 过程核查

- commit 分层保持：kno 语义 12 件（零 dist）／pnl 纯 dist 5 件／wvo 纯 docs——D-140② 纪律复守。
- 账行↔编年同 commit：A-096 账行＋M-018 编年随行（D-144）。
- exec-report/handoff 主动纠偏＋返工闭环节——修正报告文本而非遮掩，符合「呈报非追认」纪律。
- 无 push；but status 栈干净（git status MM/D 重影=GitButler 合成索引已知噪声，上轮已查明）。
- 审计零污染：DB 探查走副本（sha256 校验）、bench --out 写 Temp、gen/golden 零 drift。

## §7 结论

首轮 5 项 A 类全部以实物+行为证据闭环；B 类 7 项中 6 项已修、1 项（B6）如实呈报转判断项；§1 验收面 12/12 亲跑复绿；无新增缺陷。**R36 T2（A-095＋A-096 返工批）审计通过。**

审计产出物：本报告＋首轮报告＋评审 diff（audits/r36/audit-r36-t2.diff）。下一轮交接已另存 handoff 档（含 T3 grill 方向指示）。
