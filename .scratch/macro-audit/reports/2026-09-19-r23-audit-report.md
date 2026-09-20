# 轮 23 独立审计报告（exec 收口 T0→T9 复核）

- 日期：2026-09-19 ｜ 审计窗口：独立 lane（不属 r23-impl 窗口）｜ 被审对象：`.scratch/macro-audit/reports/2026-09-19-report.md`＋其引用 handoff/账本
- 固定点：`a3d5f27`（轮22审计 loop-2 PASS 基线）→ 被审 diff=`82cbb60 closeout + c3767c3 impl + 62ed336 handoff`（GitButler lane r23-impl，未 push——与自述一致）
- 审计口径：不信报告自述——硬验收全部本窗重跑；关键声明仓库实物抽查（rg/文件存在性/常量行对账）；双轴评审（Standards+Spec 并行子代理取证，子代理无 exec 受限——diff 面以工作树 HEAD 实物取证，主代理已逐条复验）
- 裁定：**PASS-with-findings**——硬验收全绿、T0~T9 交付物全部在位且声明可证；发现 1 项成文标准硬违规＋3 处报告/账本口径失真＋2 项 spec partial＋判断性 smell 若干→打回轻返工（R1~R3），返工后须重跑同一套验收

## 一、硬验收重跑（全部本窗实测，exit 0/输出实物）

| 面 | 命令 | 实测 | 报告声明 | 结论 |
|---|---|---|---|---|
| 编译 | `npm run build`（engine/） | `BUNDLE-OK dist/cli.js` exit 0 | BUNDLE-OK | ✅ |
| 打包 | `npm run package`=npm pack --dry-run | 75 件 / 188.4kB / unpacked 810.2kB | （隐含可用） | ✅ |
| 启动测活 | `node dist/cli.js mcp` stdio 真进程六面 | init→proto 2024-11-05+serverInfo macro-audit@0.1.0；tools/list→[facts]；无 db→-32602 MCP-FACTS-DB-UNRESOLVED；坏路径→isError=true MCP-FACTS-ERROR；ping→{}；实 db(40-out/40-audit-facts.duckdb)→isError=false FactEvent 行流×3 | MCP 六面实测全过 | ✅ |
| smoke 全链 | `npm run smoke` | 全链绿至末件 AUDIT-ZERO-WRITE-TEST-OK 4/4（&&链到尾=前件全过） | smoke 全链绿（A-083 证据列） | ✅ |
| 基线电池 | reports/ 下 14 守卫 | 33:29/29｜34:23/23｜38:34/34｜41b:33/33｜44:59/59｜46:30/30｜52a:22/22｜53:25/25｜54:20/20｜55:18/18｜56:24/24｜64:15/15｜14-skeleton PASS｜xfail-run exit 0——14/14 exit 0 | 14/14 守卫 exit 0 全绿 | ✅ |
| #70 | `node reports/70-check.mjs` | PASS 13/13＋VACUITY-CENSUS: 51 守卫/1273 emit 调用点/候选 0 | 同 | ✅ |
| #71 | `node reports/71-check.mjs`＋`node test/upstream-map.test.mjs` | 16/16＋UPSTREAM-MAP-TEST-OK 21/21 | 同 | ✅ |
| #72 | `node reports/72-check.mjs`＋`node test/github-rest.test.mjs` | 16/16＋GITHUB-REST 56/56（L1 live 凭据腿：本机真 token 在位实测过） | 同 | ✅ |
| registry | `node reports/update-72-registry.mjs` 幂等复查＋JSON 实读 | items=49 events=33；33-check「登记 49 项/事件 33 个」PASS | 49 项/33 事件 | ✅ |
| xfail | `node reports/xfail-run.mjs` | exit 0；XFAIL 8 条(entries=8/10 全已登记含 39:H6)＋SEALED 15 | XFAIL 8/10＋SEALED 15 | ✅ |
| 39 | `node reports/39-check.mjs` | exit 1＝FAIL 27/28，唯一 FAIL=H6（xfail-run 册内已登记条目） | 27/28（仅已登记 XFAIL H6） | ✅ |

## 二、声明 → 证据 → 结论 对照（实物抽查）

| 声明（报告出处） | 实物证据（本窗抽查） | 结论 |
|---|---|---|
| T1 vacuity-manifest cap=10/entries=1/vac-39-f2 disposition=vacuous-deleted | `vacuity-manifest.json` version=1 cap=10 entries=1；id=vac-39-f2 十三字段齐（guard=39/slug=F2/referent=jiahao yml/confidence=certain/zero_fail_history/decision=D-079/review_anchor/expires_fallback） | ✅ |
| 39-F2 引用物已撤（D-046）→恒真 | `D:/Aworker/jiahao/.github/workflows/macro-b-regression.yml` exists=**false** | ✅ |
| 39-check F2 删除＋留痕不走 sealed/XFAIL | 39-check.mjs 仅存两行 vacuous-deleted 留痕注释（D-079 指向 manifest）；无 F2 t() 断言 | ✅ |
| census 机芯双轨/基座/豁免/去重 | 70-check.mjs 实物含 stripComments(3)/maskStrings(3)/REPOS(4)/existsSync(11)/sealed()(6)/reg.items(2)/reg.events(3)/join((34) | ✅ |
| T2 常量块 37 行 | dist 模块实跑：CODELORE_DIMENSION_MAP=**43** 行（12+6+12+9+3+1），GITHUB=12，TOTAL=55 | ❌ **报告与账本 A-083 同误（37≠43）**——报告自己的分项拆解加总即 43，口径失真（见 R1） |
| T2 v1.0＋复审两字段＋resolver＋注册＋投影 | upstream-dimension-map.ts L24-25 v1.0/两字段；resolveCodeloreAnalysis/resolveGithubRestSlice/projectUpstreamDimensions 在；UPSTREAM_COLLECTOR_REGISTRY 两行 registered=true（binary+pin／token+network）；audit.ts measurements.upstream_dimension_projection 落 | ✅ |
| T2 逐行对账守卫＋禁引 docs/ 断言 | 71-check B 组族级对账＋B7 反向幽灵行检查（仅 surface_kind='analysis'）；E1 扫 engine/src+skills 可解析 docs/ 引用（注释豁免）——但 **explain 族(kind='group')成员级双向不可机检**（见 Spec-P1） | ⚠️ partial |
| T2 dimension:null descriptor 双保留 | codelore.ts:17／github-rest.ts:35 均 dimension:null＋注释指针 | ✅ |
| T3 opt-in 注册＋skipped 语义 | registry github-rest 行 opt_in='token+network'＋skipped_semantics 字段；test L1 腿：无凭据→console.log('SKIPPED L1…不算 PASS')显式行不计 check | ✅ |
| T3 映射全行（S4/S4 仅人类/S5 措辞锁/pending-event_bound/Micro-A/遥测排除） | 常量块 L69-76 全行在；**但遥测排除列 7 类（含 'preflight'——engine/src 全仓无生产者的幽灵行）vs doc L23 枚举 6 名 vs BACKLOG #72「六类」三方口径不齐**（见 Spec-P2） | ⚠️ partial＋口径失真 |
| T4 +事件 quadrant-rubric-params-draft occurred=false＋item rubric-weight-drafting | registry 实测：event occurred=false 注记含 D-084④＋LFX 启示；item pending/event_bound conf=0 verify_method=立案清点 | ✅（仅登记，仓内无 rubric 参数实现代码） |
| T5 六项裁 | sealed()×5 不处置=R22§C 先例登记／emit 盲区=70-check census 1273 点收编／attBad→problems 结构化 FAIL（xfail-run L20-31 实物）／TTY=64-check A4 'already-attempted-once-per-process' 断言在案／G15-G17=r22 追问留票面延续＋r23 handoff 列明／detect-libc=64-check A7 ldd --version 断言在 | ✅ |
| T6 MCP 六面＋M2 收编 | 六面本窗重测全过（见表一）；engine/package.json diff=smoke 链 +upstream-map.test.mjs 已入 c3767c3 commit 非 pending | ✅（但「but status 无 pending」字面不成立——见 P-c） |
| T7 #52b 待命＋#41b | registry：narrative-eval-surface pending/event_bound conf=3（#52b）、host-narrative-corpus occurred=false；41b-check 33/33 | ✅ |
| T8 值守名单零翻转 | 全项实读一致：review-coverage-dimension pending/event_bound conf=0 新件／xfail-second-track triggered-bound conf=2／promotion-watch manual conf=2／mw-trigger-c pending ev=false／mw-a/b decided ev=true／rubric-weight-drafting 新件 conf=0 等 | ✅ |
| T9 双读数 | 报告表头=实测列∥账本列实物；但「37 行」「遥测七类」两读数本身失真——双读数机制在、读数错（见 R1） | ⚠️ |
| BACKLOG #70/#71/#72 ✅ | BACKLOG L91-93 三行 ✅ 闭环注记 A-082/A-083/A-084 | ✅ |
| 未 push／B 轨未触 | git 无 push 记录（gb-local+origin 远端在、本轮 lane 仅本地）；diff stat 无 B 轨/官方目录文件 | ✅ |

## 三、Standards 轴（成文标准＋Fowler smell 基线）

**硬违规 ×1**

- **[H1] `update-70-inventory.mjs:108-110` 写盘无 assert-back**——`fs.writeFileSync(63-assertion-inventory.json)` 后仅 console.log 计数：无回读断言、无 BOM 检、无 fail-closed。违 AGENTS.md「写后回读断言、禁 BOM」＋WORKFLOW §4.2.2 同款纪律；**同批 sibling update-72-registry.mjs 做到了 BOM/字段/事件引用三检+fail-closed——证明该纪律适用此脚本族**。缓解面=70-check E1 live↔inventory 对账次跑会兜住腐化写（故非失效缺陷，是纪律违反）。

**判断性 smell ×7**（基线启发式，仓标准可否决）

- S1 [Duplicated Code＋已漂移] update-70-inventory.mjs:12-86 ⇔ 70-check.mjs §1：~75 行 census 机芯逐字双份且字段名已分叉（style vs sealedCall）；文件自承「守卫无 import 纪律」，但 **update 脚本是重生成器非守卫——纪律不必然绑它**，可共享抽取或注明绑定理由
- S2 [anchor-drift] 71-check.mjs:31 A1 字面钉 `last_reviewed: '2026-09-19'`＋`next_review: '2026-10-19'`——与已登记 xfail-41a-d6/d7「字面钉随滚动面漂移」同失效族；复审日一到自 FAIL（建议改两字段互等/同滚断言非字面值）
- S3 [anchor-drift·弱] 70-check.mjs:331 C1 `totalAssertions > 1100 && guardFiles.length >= 40` 魔数地板——当前 51/1273 余量足，守卫退役或断言瘦身即腐化
- S4 [Speculative Generality/死 import] upstream-dimension-map.ts:20 `CODELORE_BATCH1_FACETS`/`CODELORE_BEHAVIOR_FACETS` 引入未用
- S5 [Mysterious Name/lane 标签混同] resolver 未命中→codelore 报 lane='deferred'、github-rest 报 lane='excluded'；且 projectUpstreamDimensions 对 `github_rest.pr_metadata` 承载切片的事实落 lane='excluded'——「永久排除」桶装了「切片载体」，投影消费面语义易误读
- S6 [Repeated Switches 苗头] resolveGithubRestSlice:107 merge-lead-time 名开关硬编码＋admitted 公式 :93/:111 重复
- S7 [预登记 stale] 72-check.mjs C2 `evH.occurred === false` 字面钉——事件一翻即红（注释自认激活后 H2 执哨；属有意 tripwire 但仍是册外未来 stale 断言）

## 四、Spec 轴（任务书 T0-T9＋D-079~D-084 原文对 diff）

- **[Spec-P1·partial] explain 族成员级对账缺口**：任务书要求「常量↔表逐行对账守卫」。实物：doc §③ explain 行枚举列只写 `（LLM 门控面，env_family=CODELORE_LLM_*）` 不列 9 面名；71-check B4 仅族级断言、B7 反查只滤 kind='analysis'（explain 行 kind='group' 逃逸）；test/71-check 均无 CODELORE_EXPLAIN_SURFACES 成员数钉——9 面成员增删双向不可机检，与其他四族成员级对账不对等
- **[Spec-P2·partial] 遥测排除三源口径不齐＋幽灵行**：BACKLOG #72「遥测**六类**」vs A-084/报告「**七类**」；常量 7 名含 'preflight'（engine/src 无生产者的防御性超枚举）；doc L23 枚举 6 名+同族兜底；72-check B6 非成员级对账
- **[Spec-P3·creep 轻微] E1 扫描面超票面**：D-083⑤ 票面=`engine/skills/`，71-check E1 实扫 engine/src+engine/skills 全树——无害强化（src 注释指针豁免生效），超票面断言范围记一笔
- **[Spec-P4·wrong] 「CODELORE_DIMENSION_MAP 37 行」**：报告 L34＋账本 A-083 同误，实物=43 行（自报分项加总即 43）——D-025 双读数口径面自身失真

**已核对无缺陷**（同主代理抽查面）：vacuity-manifest 形制/字段/disposition✓；70-check 13 断言含四对照自检+E1 盘点✓；39-F2 删+留痕✓；33-check H1/H2/I1-I4✓；注册/opt-in/skipped 语义/L1 腿✓；映射全行✓；T4 仅登记✓；T5 六项裁✓；T7 待命态✓；rubric 零口径行无 docs/ 指针✓；未提前开工 rubric 参数✓；无 push/B 轨痕迹✓。

## 五、过程违规呈报（不替修、不追认）

- **P-a 「37 行」口径失真**：报告 L34＋A-083 账本同写 37，实物 43——账本与报告双读数面同错，须勘误（原文保留＋勘误节，按 A-080 勘误先例）
- **P-b 「遥测七类」口径失真**：报告/账本写七类、doc 枚举六名、BACKLOG 原文六类——三源不齐；preflight 行无生产者属防御性超枚举，须裁：doc 补第七名 or 常量删 preflight or 注明超枚举理由
- **P-c 「but status 无 pending 即证」措辞失真**：实测 but status 有 ~160 件 .code-tmp 未提交 scratch 在位；实质成立的是「engine/package.json 无 pending」——措辞须收窄（不影响 M2 收编结论）
- **P-d 子代理受限**：双轴子代理无 exec/git 工具，diff 面改以工作树 HEAD 实物取证——主代理已逐条复验关键发现，取证方式差异已披露

## 六、打回返工清单（返工后须重跑「一」全表同套验收）

- **R1 勘误批（报告+账本口径三处）**：报告/A-083「37 行」→43 行；遥测「七类」口径统一（doc 补 preflight 名 或 常量删 preflight 或 注明防御性超枚举——随修窗口裁）；「but status 无 pending」→「engine/package.json 无 pending」。按 A-080 勘误先例：原文保留＋勘误节引本报告编号
- **R2 update-70-inventory.mjs 补 assert-back**（H1 硬违规）：写后回读 JSON.parse 成功＋BOM 检＋guards 计数>0＋fail-closed（对齐 update-72-registry.mjs 同款三检）
- **R3 建议修（非阻断，可呈报用户批准后修）**：explain 族成员级对账补盲（doc 补 9 面枚举 or B7 覆盖 kind='group'）／71-A1 日期字面值→两字段互等断言／upstream-dimension-map.ts 死 import 清理＋lane 标签澄清（unmapped≠excluded）

## 七、结论

- **验收面**：全绿（编译/打包/测活/14 基线/专项/测试链全过）
- **声明面**：T0-T9 全有实物，证据可复跑；三处口径失真属报告/账本勘误面非实现缺失
- **裁定**：**PASS-with-findings**——打回 R1（勘误）＋R2（硬违规）必修，R3 建议修呈报用户批准；返工后重跑本报告「一」全表
