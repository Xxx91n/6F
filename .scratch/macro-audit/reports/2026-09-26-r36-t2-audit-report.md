# R36 T2 审计报告——A-095 / BACKLOG #80 步③（血缘缝合＋双仓试点＋benchmark＋披露收窄）

- 审计窗：2026-09-26 ｜ 审计者：审计 Agent（独立窗，职责分离——本窗只出报告不动手修）
- 被审对象：分支 r36-t1-ascast-rework 上 T2 三个 commit（
  - `f743bd9` feat(A-095) 语义面 27 文件（源码/测试/bench 脚本/披露面/守卫钉/账本编年）
  - `05dbe8e` chore(bundle) engine/dist 再生 6 件（D-140② 独立 bundle）
  - `d88a486` docs(A-095) 执行报告＋交接 2 件）
- 固定点：`cb41400`（T1 收口 commit）；评审 diff=`cb41400...d88a486` 1057 行，存档 `D:\Aworker\6F\.scratch\macro-audit\audits\r36\audit-r36-t2.diff`
- 被审自述：`reports\2026-09-26-r36-t2-exec-report.md`、`handoffs\2026-09-26-r36-t2-handoff.md`（自述≠证据，以下全部亲验）

## 裁定

**不通过——建议打回原实施窗口返工（A 类缺陷 5 项）＋ B 类呈报 7 项。**

硬验收亲跑全绿、报告主干声明与仓库实物一致（血缘四子项、双仓实跑、dist 分层、披露收窄均实物兑现），但实物抽查与双轴评审抓到 1 项正确性缺陷（cycle_detected 假阳）、2 项诚实性偏差（EDGE_CAP 静默截断／zh-CN 假同步）、1 项源文件字节级违规（NUL）、1 项 benchmark 分档机制与票面语义不符。按本仓「声明↔实物」与披露诚实标准，不能无条件通过。审计未通过后不生成下轮 handoff。

## §1 硬验收亲跑（不信自述，全部本机重跑）

| # | 验收项 | 命令 | 实测 | 报告自述 | 判定 |
|---|---|---|---|---|---|
| 1 | TS 编译 | `env -u NODE_OPTIONS npx tsc -p tsconfig.json --noEmit`（engine/） | RC=0 | tsc noEmit=0 | ✅一致 |
| 2 | 构建 | `npm run build` | RC=0，BUNDLE-OK dist/cli.js | build=BUNDLE-OK | ✅ |
| 3 | 打包 | `npm run package` | RC=0，macro-audit-0.1.0.tgz 85 文件 254.6kB | pack=85/253.6kB | ✅（体积 254.6 vs 报告 253.6，四舍口径差，行内） |
| 4 | 启动测活 | `node dist/cli.js selftest` | RC=0，5 checks 全过（manifest/shells=4/mode/MCP read-only/receipt≥4） | 5/5 | ✅ |
| 5 | dist 棘轮 | `node scripts/check-dist.mjs` | DIST-RATCHET PASS 262422B/289395B | 同 | ✅ |
| 6 | MCP 探测 | `node .scratch/macro-audit/audits/r33/mcp-f5.cjs` | init ok；tools=[facts,quarantine,file_card]；F5→never_collected 结构化卡 | 同 | ✅ |
| 7 | smoke | `npm run smoke`（engine/） | RC=0，&& 链全程通过；FILE-CARD 32/32、DIALECT-BOUNDARY 19/19 | 22 册绿、32/32 | ✅ |
| 8 | 守卫组 | 19 脚本逐一 `node .scratch/architecture-recovery/reports/NN-check.mjs` | 全 rc=0：33:31/31,39:28/28,40:57/57,41a:38/38,41b:33/33,43:28/28,44:59/59,45:51/51,70:13/13,71:16/16,72:16/16,73:14/14,77:16/16,78:42/42,80:28/28,81:18/18,82:15/15,83:19/19；xfail-run PASS entries=0/10 | 「全 rc=0」 | ✅（报告写「80/83 19/19」——80 实测 28/28，见 B2） |
| 9 | gen 幂等 | `npm run gen`＋全仓 hash sweep（engine+docs+.claude-plugin，剔 dist/node_modules） | GEN-OK；前后 sha256 逐字节零 diff | 「GEN-OK 幂等」 | ✅ |
| 10 | golden 再生 | `node scripts/gen-demo-golden.mjs` | 三场景再生成功；fixtures 前后 hash 零 drift | 「golden 三场景再生幂等」 | ✅ |
| 11 | dist 重建零漂移 | build 前后 sha256 对照 dist/cli.js、fact/file-card.js、fact/projection.js、audit/audit.js、demo/demo.js、file-card.d.ts | 6 件全同 hash——提交 bundle 与重建逐字节一致 | ssw=纯再生 | ✅ 独立 bundle 真实性亲证 |
| 12 | bench 可跑 | `node scripts/bench-file-card.mjs --runs 5 --db jiahao-facts.duckdb --out <tmp>` | RC=0；jiahao p95=291.95 verdict=acceptable；合成 20k p95=42.48 verdict=target | 「机器可裁决」 | ✅（三档裁决链实证：target/acceptable/danger 都会出；5-run 小样本噪声在容忍带内） |

验收面 12/12 复跑通过。

## §2 声明 → 证据 → 结论 对照表

| 报告关键声明 | 仓库实物证据（亲验） | 结论 |
|---|---|---|
| file.renamed 边池反向 BFS 多跳显式图遍历 | `file-card.ts:210-242` resolveLineageAncestors：byTo 邻接表（to→[edges]）、queue BFS、adjacency 内 (commit_sha,from) 词典序确定序 | ✅属实 |
| 环检测 visited 双作用 | :224 visited 种子含 subject；:234 `visited.has(e.from)→cycleDetected=true,continue` | ⚠️机制在但假阳——见 A2 |
| 跨观测集解析=祖先集 file.renamed 行注入 | `projection.ts:126-140`：sets 已被 `repo_ref LIKE '<repo>@%' ESCAPE '!'`(:84) 限定同 repo；祖先集 `repo_ref≠picked && last_obs≤picked`；lSql 取 metric='file.renamed'、LIMIT EDGE_CAP、assertAppendOnly 过闸 | ✅属实（无跨 repo 泄漏——LIKE 前缀钉死 repo 名） |
| 祖先帽 64 截断如实 | FILE_CARD_LINEAGE_MAX_ANCESTORS=64，:235 超帽→truncated=true→卡面 lineage.truncated 披露 | ✅ |
| 披露块 stitched_from/edges/cycle_detected/truncated | FileCardLineage 类型＋:421-423 组装（edgesUsed>0‖cycleDetected→非 null） | ✅ |
| facet_rows 行级 subject_ref additive 溯源 | :343 行对象带 subject_ref；实跑卡 `facet_rows.hotspots[0].subject_ref='src/shared/paths.js'` | ✅ |
| miss 卡 lineage:null 常驻 | missCard 路径不出 lineage 键；实测三条 miss 卡均 `"lin":null`；L6 物理断言在 | ✅ |
| renamed_to 边池=选中集∪祖先集、一跳语义不变、逐请求重验证 | :315-324 ev=edgePool 首匹配→renamed_to＋revalidated=目标在集内有行；env-manager 实物：根名 revalidated=**false**、中间名=**true**——一跳诚实未越权自动走链 | ✅ |
| peer 分布被取代旧名去重 | :360-365 supersededNames=「e.to 在集内有行的 from 名」出 peerScores | ✅（单跳去重——多跳中段的残留行场景见 B6 判断项） |
| JSON.parse 病态行防御式 skip | :195-203 try/catch＋字段型检 | ✅ |
| checkHintKeys 扩展 lineage.* 锚 | 实际函数名=fileCardCitationKeys（:437 narrative.hints 注入；lineage≠null 时推四键）——全仓 grep 无 checkHintKeys | ⚠️实物在、报告名误（B2③） |
| L1~L6 测试 32/32 | test diff +124 行；L1 1-switch/F10 回归、L2 多跳、L3 环、L4 跨集、L5 真 DuckDB 端到端、L6 四态点名＋lineage=null＋对照组；smoke 实测 FILE-CARD 32/32 | ✅（L5 反向腿断言恒真——B1） |
| 双仓实跑：jiahao 1109 facts / env-manager 684 facts | DB 实物查询：jiahao@ba83908=1109 行、env-manager@9eb8f24=684 行；DUCK magic 头实证真库 | ✅ |
| 缝合实跑回执（jiahao stitched_from=hooks/jiahao-paths.js） | 亲跑 `audit file D:/Aworker/jiahao src/shared/paths.js --db <副本>`：stitched_from=["hooks/jiahao-paths.js"]、edge commit=175aff7 sim=92、cycle_detected=false | ✅（DB 副本探查，原件 sha256 前后不变——审计零污染） |
| env-manager 2-hop：AuditCrypto.cs→src/AuditCrypto.cs→src/Audit/Crypto/AuditCrypto.cs | 实跑 stitched_from=["src/AuditCrypto.cs","AuditCrypto.cs"]、edges=3160c32(sim100)+709f6bd(sim100) | ✅ |
| benchmark 阈值预登记＋机器可裁决 | 票面 .scratch/macro-audit/reports/80-bench-thresholds.md（先于工件入库）；THRESHOLDS 常量同值；verdict 机器判 danger→exit 1 | ✅（分档机制偏差见 A5） |
| bench 实测 jiahao p95=72 / env 46~54 / 合成 35~85 | artifact bench-file-card.json 实测：jiahao p95=**65.34**、env p95=**46.01**、synth p95=**34.9**，verdict 全 target | ⚠️工件 verdict 对，但报告行内数值=登记基线非工件读数（B2①） |
| 披露收窄：Micro-B→capability 4 of 5 · preview | README.md:44 行在；marketplace.json 4 of 5；listing description/checklist 1-4 口径；audit.ts/demo.ts not_in_preview 去 Micro-B | ✅（zh-CN 镜像见 A3；同主偏差要素见 B3） |
| 41b/44 守卫钉随口径更新（非弱化） | 41b C1-C3/C5→1-4 of 5＋C6 加严（增查 1-3 残留）；44 E4→1~4＋Not-yet≥1、E8 README 禁 5 不变 | ✅ 钉收紧非放水 |
| M-017 编年随行＋A-095 账行同 commit | CHANGELOG.md M-017 节在（a_range→A-095）；architecture-recovery 账本 A-095 行在 | ✅ D-144 账行↔编年同 commit 合规 |
| dist 独立 bundle commit（D-140②） | ssw 仅 6 件 dist 生成物；lxt 语义 commit 零 dist | ✅ |
| 无 push 纪律 | remote=gb-local（GitButler 内部）；f743bd9 仅在 gb-local 引用 | ✅ |
| 工作树净 | but status 栈干净；`git diff HEAD` 显示 5 件 delete/?? 重影=GitButler 合成索引已知噪声（T1 handoff 预警同款），物理文件全在 | ✅（噪声呈报非违规；本次审计新增 audit-r36-t2.diff 已如实登记） |

## §3 双轴评审（$code-review，双子代理并行）

### Standards —— 判定：VIOLATIONS

硬违规：
1. `engine/src/fact/file-card.ts:198` 两处**字面 NUL（0x00）字节**入字符串字面量（dedup 分隔符 `v.from+'\0'+v.to+'\0'+v.commit_sha` 写成裸 0x00）。后果实测：rg/git-grep 将该文件判为 binary——定义 collectRenameEdges(:190) 的文件对自身搜索面不可见，与本仓 grep 驱动守卫生态冲突。字节级源文件卫生违规。
2. `engine/CHANGELOG.md` Unreleased 段 `## [Unreleased]` 与 `### Changed` 之间**纯空行搭车**（@@ -7,6 +7,7 残留自「误生双 Added 已修」返工痕）——格式化-only 变更搭语义 commit，D-139 nit 级违规。

判断项（smell 基线）：
- 边池合并去重缺口→**假 cycle_detected**（并入 A2 定性）；
- L5 断言恒真（coverage theatre）；
- bench subjects 表静默回退 'src/shared/paths.js'（--db 任意库时 bench 对象错位）、--runs/--db 值无校验；
- 44-check E4 `>=1` 可收 `===1`；
- projection.ts:128 pickedSet 再查冗余（picked 恒为 sets 元素）。

合规确认：bundle 分层（D-140②）；zh-CN/golden 共生属 77-A3/demo-O2 原子约束先例；41b/44 钉收紧；commit 携 A-095 账行。

### Spec —— 判定：GAPS

(a) 缺失/部分：
1. **披露四件套实交 3/4**——D-127⑤「同主确认偏差」要素在 Micro-B 披露面无载体：README.md:44 仅写 "pilot set=jiahao＋env-manager…advisory-only"，无 same-owner/同主措辞（对照 Micro-A 行「同主试点仓」先例）。jiahao/env-manager 均本机同主仓库，偏差未明示。
2. **0-switch 实物件盘点漏 insufficient_history**——D-127③「miss 四类+insufficient_history 每类≥1 实物件」：80-bench-thresholds.md §三盘点表只列四 miss 态＋缝合端；insufficient_history 仅旧 C2 单测断言兜底、实物件不在册。
3. **README.zh-CN.md 假同步**——diff 仅 bump `<!-- sync: 038eec5e96cc -->`，正文 line 38/50 仍「Micro-B / Macro-A 为 Not yet in preview」，与 canonical 直接矛盾；文件自称「不假装新鲜（sync 戳绑英文指纹）」被违反。73-check C2 只验「戳=hash」不验语义——守卫盲区被实际踩中。「zh-CN 再生」属报告自述名实不符。

(c) 实现可疑：
4. L5 反向腿断言无牙（恒真断言＋查错对象——old.ts 在选中集有行本非 miss）；
5. bench 分档不按票面语义（票面档界=事实行数 <5k/5k~50k/>50k；DB 案按 card_rows≈2 恒 small——本轮巧合落对档；合成 20k 行按票面属 medium 却硬写 tier='large'）；
6. 环检测把 DAG 钻石误判为环（visited 复用环检：A→B→C＋A→C 直达边即置旗，非真环）。

(b) 搭车：facet_rows subject_ref、peer 去重超票面字面但属缝合语义必要 additive，可辩护；无恶性搭车。

## §4 D-xxx 逐条核对

| 决策 | 子项 | 证据 | 结论 |
|---|---|---|---|
| D-137① | 多跳链遍历（显式图遍历非单路径 follow） | resolveLineageAncestors BFS；L2 断言 stitched_from[0]='b.ts' 近端先行；env-manager 实物两跳 | ✅ |
| D-137② | 环检测 disclose-not-hide | L3 环旗＋edges 含被环停边；**但** visited 去重/环检二合一→dup 边与 DAG 钻石假阳（A2） | ⚠️部分 |
| D-137② | 跨观测集解析（同 repo、last_obs≤选中集） | projection.ts:84/129-131 限定同 repo；L4/L5 真库兑现 | ✅（EDGE_CAP 截断未披露→A4） |
| D-137③ | additive 披露块＋行级 subject_ref | 类型＋组装＋实跑卡 subject_ref 在场 | ✅ |
| D-137 | 成对件双端 | jiahao 新旧两端＋env 三端实跑（本审计亲跑副本） | ✅ |
| D-127③ | 0-switch 四类＋insufficient_history 实物件 | miss 四态点名物理断言在；insufficient_history 无实物件登记 | ⚠️部分（B4） |
| D-127⑤ | 披露四件套 | preview 标注✅／advisory✅（卡面 advisory:true+"never reach gates"）／not_in_preview✅／**同主偏差❌** | ⚠️3/4（B3） |
| D-127 | benchmark 预登记 | 票面先于工件；verdict 机器裁决实证 | ✅（分档语义偏差 A5） |
| D-140② | dist 独立 bundle commit | ssw 纯 dist 6 件＋重建零 drift | ✅ |
| D-145① | src/dist 触碰→build+check-dist 前置 | 报告与本审计均 build+DIST-RATCHET PASS | ✅ |
| D-144 | 守卫/CI 硬闸不降级 | 19 脚本全 rc=0；41b/44 钉是收紧非降级 | ✅ |
| D-123~126 | miss 词表/pin 语义/append-only | assertAppendOnly 三 SQL 过闸；F7a/F7h 既有面未动；miss 四态 shape 未变 | ✅ |
| D-136 | suppressed_facets fail-closed | suppressed 路径逻辑未动，L6 对照组在 | ✅ |
| D-142/D-146 | 外部评审摄入纪律 | 本批无摄入面 | N/A |

## §5 缺陷清单

### A 类——返工必修（打回项）

- **A1 NUL 字节入源码**：`engine/src/fact/file-card.ts:198` 两处裸 0x00（commit f743bd9 引入，同传入 dist/fact/file-card.js）。修法：改用 `'\0'`/`'\u0000'` 转义（语义等价分隔），并顺手查 dist 再生。
- **A2 cycle_detected 假阳两条路径**：(a) 同一边 (from,to,commit_sha) 同时存在于选中集与祖先集时，collectRenameEdges 逐侧去重、合并池不去重→第二份撞 visited→假环旗＋edges[] 重复披露（正是「同边跨集重检=常态」场景）；(b) DAG 钻石（同 to 多 from、祖先链路再汇合）误报环。根因=visited 兼任「去重」与「环检」而不区分「当前祖先路径重逢」。修法：合并池先按键去重；环检只对「subject 可达链上真正回到已出队祖先」置旗（或至少把「重复边命中」与「真环」分开披露）。修后须补 L-系回归（dup 边跨集＋钻石 DAG 各一断言）。
- **A3 README.zh-CN 假同步**：正文 line 38/50 仍 Micro-B=Not yet in preview，sync 戳已绑新 EN 指纹。修法二选一：翻译该两行（矩阵行＋状态句）使语义同步；或按 73-check 既定语义把戳留旧指纹照实示「掉队」。
- **A4 FILE_CARD_LINEAGE_EDGE_CAP 静默截断**：projection.ts:134 `LIMIT 10000` 命中无任何披露字段（对照 SET_CAP→set_truncated、MAX_ANCESTORS→truncated）。修法：命中帽→上游传 lineage_edge_cap_hit→卡面披露（truncated 复用或新键，additive）。
- **A5 bench 分档不按票面语义**：DB 案 tierOf(r.card_rows)——card_rows=卡内行数≈2，恒 small（本轮巧合落对）；合成案 20000 行按票面事实行数属 medium 却硬写 'large'。修法：DB 案按库内 Micro-B 事实行数定档（或票面改措辞并注明）；合成案 tier 按真实行数计算或票面注明「档名=压力构型非行数」。

### B 类——呈报（记录，由用户裁定是否同修）

- B1 L5 反向腿断言恒真（miss.card_type!==undefined）；注释自认「改查无行名」但实现查了有行的 old.ts——miss 侧跨集 renamed_to 无测试实证。
- B2 报告自述漂移三处：①§benchmark jiahao p95「72」=登记基线，工件实测 65.34；②「checkHintKeys」实为 fileCardCitationKeys；③守卫表「80/83 19/19」——80-check 实测 28/28。
- B3 D-127⑤ 同主确认偏差披露缺位（3/4 交付）。
- B4 D-127③ insufficient_history 实物件不在盘点册。
- B5 engine/CHANGELOG.md Unreleased 空行搭车（format residue）。
- B6 边界判断项：peer 去重只验一跳（e.to∈namesWithRows），多跳中段旧名残留行仍入分布；renamed_to 多 to-竞争边取首匹配（事实序）——两者病态面，判断项非硬错。
- B7 bench subjects 表静默回退/参数无校验；44-check E4 >=1 可收 ===1；pickedSet 再查冗余。

## §6 过程核查

合规：commit 三分层（语义/bundle/docs）✅；无 push（remote=gb-local）✅；账行↔编年同 commit（D-144）✅；生成物/golden 幂等零 drift ✅；dist 重建逐字节一致 ✅；守卫钉收紧非放水 ✅；审计零污染（DB 探查走 sha256 校验副本；bench --out 写 Temp；唯一新增物=本 diff 存档+本报告，已登记）。

呈报（不追认）：
- P1 NUL 字节随 f743bd9 入库（本可用 `git show`/二进制嗅探前置发现）。
- P2 报告三处自述漂移（B2）——「不信自述」原则下被亲验逐条纠出。
- P3 zh-CN「再生」表述掩盖了「正文未译」事实（B/A3）。
- P4 `git status` MM/D 噪声=GitButler 合成索引已知态——已查明非真删，不构成违规但记账。

## §7 返工与重跑清单（修复窗口执行）

修复后须重跑同一套验收（本报告 §1 全部 12 项），另加：
1. `git diff --check`＋文件二进制嗅探（如 `grep -P '\x00' engine/src/fact/file-card.ts` 应零命中）。
2. 新增 L-系断言：跨集 dup 边不误报环／DAG 钻石不误报环／EDGE_CAP 命中披露键（可合成 10001 边或降帽测）。
3. zh-CN 处置后跑 73-check 确认戳/文关系符合所选方案。
4. bench 分档修正后重跑 `node scripts/bench-file-card.mjs`（默认 runs=30）全档 verdict 复核并回写 artifact。

本审计窗不动手修、不生成下轮 handoff（移交条件未达成）。以上 A/B/P 项呈报待裁定——若用户批准降级处理（如仅修 A1+A3 余转 backlog），裁定落账后仍须对改动面重跑 §7 相关项。
