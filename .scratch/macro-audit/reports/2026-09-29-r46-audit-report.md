# 轮46 审计批报告（R45-impl 执行窗审计窗，r46-t1-exec）

日期：2026-09-29　审计对象：分支 r46-t1-exec（925ae3cd..59794cd2，5 commit：baf4cb80→16122028→ee0621b8→aebd49c6→59794cd2，stacked on r45-closeout）　审计窗纪律：只出报告不动手修；声明不信自述全部亲跑。

## 裁定

**PASS**——硬验收十面亲跑逐格复现一致；双轴评审 Standards 硬违规 0／Spec 缺口 0、范围蠕变 0；D-xxx 覆盖裁定逐条对账缺失 0。呈报项 6 件（F1~F6，全部 minor/nit，零阻塞；F1 涉机读面错值建议勘误处置，裁量归用户）。

## 1. 硬验收亲跑复现（不信报告自述）

| 验收项 | 亲跑命令 | 报告值 | 审计实测 | 结论 |
|---|---|---|---|---|
| 编译 | `cd engine && npm run build` | BUNDLE-OK EXIT=0 | BUNDLE-OK dist/cli.js EXIT=0 | 一致 |
| 打包 | `npm run package`（dry-run） | 85 files / 1.0 MB | total files=85 unpacked 1.0 MB（255.5 kB tgz） | 一致 |
| 启动测活 | `node dist/cli.js selftest` | 5/5 | 5/5 ok:true EXIT=0 | 一致 |
| dist 闸 | `node scripts/check-dist.mjs` | PASS 263151B/cap 289395B | DIST-RATCHET PASS 263151B/cap 289395B 同字节 | 一致 |
| engine drift | `git status --porcelain -- engine/` | 零脏件 | 空输出（含重建后）=零 drift | 一致 |
| test 闭环 | `npm run smoke`（23 文件） | 349 PASS／0 FAIL | PASS 行实测=349、FAIL 实故=0（6 个 grep 命中均为断言名含 fail 字样）EXIT=0 | 一致 |
| 守卫组（升格判据） | `node .scratch/architecture-recovery/reports/guard-all-run.mjs` | ran=60 green=60 red=0 | ran=60 green=60 skipped=0 red=0 registered=0 partial=0/60 allOk=true GUARD-ALL-RESULT: PASS | 一致 |
| kr-01 专项 | `node 01-check.mjs` | PASS 82/82 | PASS: 82 assertions、frozen-pack=5、repos=3 models=3 EXIT=0 | 一致 |
| registry | `node 33-check.mjs` | PASS 31/31、74 项/ALARM 1/WARN 9 | PASS 31/31、登记 74 项/事件 52、ALARM 1/WARN 9、COVERAGE event_bound 50/74 | 一致 |
| manifest schema | `node 75a-check.mjs` | PASS 14/14（M1 空册） | GUARD RESULT: PASS 14/0、M1 entries=0 | 一致 |

## 2. 实物抽查（声明→仓库实物）

| # | 报告声明 | 审计实物证据 | 结论 |
|---|---|---|---|
| 1 | kr-01 字节级恢复三件 sha256（corpora=5a2e0491…407340B／align=8bc5fb58…76352B／spotcheck=26a1821c…25082B） | 亲算 sha256sum+wc -c：五件逐一相等（report=a579b7c5…／fallback=92db7cb6…同值） | 属实 |
| 2 | commit 树 blob==3a049d45 冻结目标（含 GitButler 无尾换行 amend 校正） | `git ls-tree HEAD` vs `git ls-tree 3a049d45` 五件 blob id 全等（align=5c3177cf／corpora=fc559f9d／spotcheck=8d6f1813／report=52fe41f0／fallback=87f257d2） | 属实 |
| 3 | 01-report.md/01-fallback.json 未被波及未动 | 两件 blob 与 3a049d45 相同且不在 diff 变更列 | 属实 |
| 4 | manifest kr-01→closed[] 结案非静默（closed_at/closure/lifecycle_log+归因+review_anchor 修正） | closed[0] 全要素在册：closed_at=2026-09-29、closure=resolved（冻结重钉＋frozen 立法）、lifecycle_log+collateral-damage-attribution(D-172③)+closed-resolved(D-172①⑤)、review_anchor_correction(D-172⑤) | 属实 |
| 5 | frozen_evidence_packs[frozen-01-series] 五件钉值＋exempt_from/refresh_path/scope | manifest 实物齐备；五件 sha256/bytes 与工作树实测逐件相等；scope 明示恰 01 系五件 | 属实 |
| 6 | 01-check F 组断言机器可查 | F 组代码在位（豁免节在位+覆盖恰五件+逐件 sha256 钉值）；实跑输出 frozen-pack=5 | 属实（断言真实非空转） |
| 7 | 册内红清零 | manifest entries[]=[]（0 件）；guard-all red=0；75a M1 entries=0 | 属实 |
| 8 | r1 RA 重立项草案五要件呈批待裁 | docs/ra/r1-lineage-edgecap-accepted-risk.md §0~§6：判据引用（D-171①a 腐化基座类）+justification+补偿控制（reprobe 路径存续可核验）+具名裁者=用户（起草=轮46 T1 批，提交人≠批准人）+到期 min(事件先到,2026-12-28)=恰 90d+复审钩重验补偿控制存续；registry r1 确认行=refiled-draft-pending-approval、原 expires_at 事件制维持 | 属实 |
| 9 | r2 wontfix 恒久类追认注记 | registry r2 确认行=wontfix-permanent-reaffirmed-annotated（双条件核验文写在册） | 属实 |
| 10 | 上游漂移观察项 manual_watch 五要素 | registry 新增 anysearch-cli-intent-drift-watch：family=upstream-drift、review_event=next-audit-window、退化读数+「无认领票」双标注、owner/verify_method/trigger 齐备 | 属实（唯 verify_method 内锚数错值→F1） |
| 11 | T3 八哨兵确认行落册 | registry 八项 confirmations 最新行均 at=2026-09-29（batch2beta-techdebt-review/open-triggers/ide-gap-watch/f02-display-watch/guard-retirement-class/stage2-launch-criteria/protected-surface-death-watch/fresh-clone-rerun-watch） | 属实 |
| 12 | GAP-B2B 八件全 triaged | docs/known-gaps.md GAP-B2B-01~08 行实测 status 全 triaged=8 | 属实 |
| 13 | F-02 盲区续存（codebuddy mcp list 实测） | 亲跑 `codebuddy mcp list`→「No MCP servers configured」 | 属实（复核成立） |
| 14 | protected-surface 普查 60/60 | 亲跑扫描 reports/ 下 60 件 check 文件 PROTECTED_SURFACE 声明全非空（guard-all-run 运行器不计） | 属实 |
| 15 | 退役通道零使用 | manifest retired[]=[]；_retired/README.md 在位 | 属实 |
| 16 | corpus-resnapshot-landed superseded 不翻 occurred | registry 事件 occurred=false＋superseded_by 注记在册 | 属实 |
| 17 | 词条同步（CONTEXT L347~349 RA 二分+L359~361 Frozen 词条+AGENTS 行） | CONTEXT.md 两词条实测在位且内容正确；AGENTS.md RA 行（D-171 收窄注记）+守卫组指称行在——**但无 Frozen 行**（b3306052 对 AGENTS.md 仅单行 RA 修订） | 部分属实→F3 |
| 18 | 无新增 D 条目（172 不变） | 账本 `| D-NN |` 行实测 max=172 distinct=172 | 属实 |
| 19 | 账本 R45 节兑现小节+编年 M-039 | decision-ledger.md:1301 兑现小节在册逐条覆盖 T1-A~F/T3/验收层/守卫硬跑；CHANGELOG [M-039] 节在册要素齐 | 属实 |
| 20 | commit 序 uom→nvm→mzz→qwn→收口 | git log 实测 baf4cb80(fix)→16122028(feat)→ee0621b8(docs)→aebd49c6(chore bundle)→59794cd2(docs 收口)；基 r45-closeout=925ae3cd | 属实 |
| 21 | 未 push/未 merge | origin 仅 main；r46-t1-exec 未合入任何线；gb-local/r46-t1-exec==59794cd2 为 GitButler 托管本地镜像引用非用户义 push（附注） | 属实（含附注） |
| 22 | 零源码改动 | diff 全域=.scratch+docs+CHANGELOG，engine/src|dist 零触碰 | 属实 |
| 23 | T1-F 可选哨兵不建制合规 | next-round T1-F 原文「可选…不建制不违规」；diff 无哨兵建制 | 属实 |
| 24 | O6 顺删续挂账 | 40-check.mjs 未触；账本/报告均如实挂账非静默 | 属实 |

## 3. 双轴评审（$code-review：Standards ‖ Spec，并行子代理取证）

### Standards（文档标准+smell 基线）
- **硬违规 0**：commit 切分 fix→feat→docs→chore→docs 合 D-139/D-140②（生成物 bundle 独立）；账行增量+编行随行同 commit（59794cd2，D-144①④）；engine 未触 D-145① 前置条件未激活；无 format-only 搭车。
- **judgement call**：①manifest closed[] lifecycle 记 75/75（baf4cb80 时点真值）与同 commit 落位后 82/82 存口径差→F2；②新顶层类 closed[]/frozen_evidence_packs 无 75a schema 校验（M1 仅 entries、M3 仅 retired；retired 建制先例=M-029/D-160②⑤ 同步校验闭环）→F4；③01-check F1 标签两断言复用（:81/:84）+OK 汇总行未含 F 组+PROTECTED_SURFACE 未载 manifest 依赖（01-report.md 先例即缺）→F5；④aebd49c6 chore footer 仅 Chronicle 缺 Ledger-Refs/Adrs（925ae3cd 同型先例；b6387d9f 曾全三栏）→F6。
- smell 基线：无可行动项（frozen5 钉值清单与 manifest 双侧各自钉属有意独立校验非 Duplicated Code）。

### Spec（next-round.md T1/T3＋D-171/D-172 裁条）
- **(a) 缺失/部分 0**：T1-A~E 全落地，T1-F 可选不建制合规，T2 deferred 点火三问全否续持，T3 八确认行齐。
- **(b) 范围蠕变 0**：生成物仅属独立 bundle commit；无 02/38/56 豁免越界（scope 恰 01 系）；无 engine/T2/push 动作。
- **(c) 实现错处**：①intent 锚数传播性失真——registry verify_method 钉「anysearch-cli intent=9」为 frozen 锚，实测冻结件=8（01-report.md:63 自记意图单元=8；账本自书三仓 9/9/8）；「9→1」叙事随 R45 规范层（next-round T1-E/D-172④）传入报告/commit/manifest/ledger/CHANGELOG/registry 六面→F1；②同 F2；③报告 §6「AGENTS.md RA/守卫组/Frozen 行」虚列 Frozen 行→F3；④closed[] 无 schema 校验（同 Standards②）。
- 子代理不可验面（exec/git）已由本窗亲跑补足：sha256/blob 对账、01-check 82/82、guard-all 60/60、33-check 31/31、footer 三栏位、push 状态。

## 4. D-xxx 覆盖逐条对账

| D 条 | 义务 | 实现证据 | 结论 |
|---|---|---|---|
| D-172① | 冻结重钉恰三件字节级恢复 | sha256+ls-tree 全等；report/fallback 未动 | 落实 |
| D-172② | frozen 证据包机器可查豁免立法 | manifest 豁免节+F 组钉值断言；scope 恰 01 系 | 落实 |
| D-172③ | 流程缺陷归因登记 | lifecycle_log collateral-damage-attribution 行 | 落实 |
| D-172④ | 上游漂移观察移交非代管 | drift-watch 项 manual_watch 五要素+双标注 | 落实（verify_method 锚数错值→F1） |
| D-172⑤ | review_anchor 无属主修正 | review_anchor_correction 字段级注记+事件 superseded_by 不翻 occurred | 落实 |
| D-171③a | r1 腐化基座类重立项呈批 | RA 档案五要件齐备呈批待裁；registry 确认行；原字段维持值守 | 落实 |
| D-171③b | r2 追认注记字段标注 | wontfix-permanent-reaffirmed-annotated 行 | 落实 |
| D-171④ | 词条同步核验 | CONTEXT 双词条在册；AGENTS Frozen 行虚列→F3 | 落实（含虚列呈报） |
| D-169-b② | revised 留痕 | 账本 :1267 收窄注记在册原行不改写 | 落实 |
| D-094 | 禁欺诈入册条款载体 | 75a M2 PASS 实测 | 落实 |
| D-139 | format-only 禁搭车 | diff 无重缩进 hunks | 落实 |
| D-140② | 生成物独立 bundle commit | aebd49c6 独立 chore（+230/-230 对称漂移实证） | 落实 |
| D-144①④ | 账行增量↔编行随行 | ledger+13 与 M-039 同收口 commit | 落实 |
| D-145① | engine 触碰前置 build+check-dist | engine 未触（条件未激活）；批内仍实跑全绿 | 落实 |
| D-149①② | 升格后守卫组判据 | guard-all-run 全量动态枚举 60/60+空册红集+无册件复绿残留 | 落实 |
| D-155②③ | 哨兵值守读数落册 | T3 八确认行含 f02 实测 | 落实 |
| D-160①~③⑤ | 退役通道建制+protected_surface | retired[]=[]+README+75a T2 全量声明校验 | 落实 |
| D-161④ | 提交信息三栏位 | 4/5 commit 全三栏；chore bundle 仅 Chronicle→F6 | 落实（一 nit） |
| D-162③⑥ | Stage-2 四判据读数 | stage2-launch-criteria 确认行四读数齐 | 落实 |
| D-163⑦ | fresh-clone 复跑随读 | standby-read 行（泛化未落地义务未激活） | 落实 |
| D-165② | 分层口径（裁定层≠验收层） | 兑现小节「册内红已消解自此可引用」+r1 呈批开放显式分层 | 落实 |
| D-167-c① | O6 顺删挂账 | 未触 40-check 如实挂账 | 落实 |
| D-169-a② | 批2-β 事件触发非临窗再裁 | open-triggers 三问全否 deferred | 落实 |
| D-170②③④ | 锚定纪律 | 触发器均注册在册；观察项 next-audit-window 锚 | 落实 |

## 5. 呈报项（审计发现——零阻塞，处置裁量归用户/下窗）

- **F1（数字失真·传播性）**：「anysearch-cli intent 9→1」锚数错值——冻结件实测=8（01-report.md:63 自记意图单元=8、账本自书 9/9/8、0e5b2514/3a049d45/HEAD 三时点 intent.len=8 一致）。错值自规范层（next-round.md T1-E「intent 面 9→1」、D-172④ 裁条原文）传入：报告 §1/§5、commit baf4cb80 文、manifest closed evidence、账本兑现小节、CHANGELOG M-039、registry drift-watch title/reason/**verify_method**（钉「intent=9」为 frozen 锚——机读校验指令内含错锚，下窗照此复核将算 8≠9 误报）。守卫面无影响（F2 钉 sha256 非计数）。建议：按勘误惯例（D-146⑤）链式注记修正 verify_method 锚数为 8，不改写原行；因源头在 R45 裁定层原文，更正形态呈用户裁。
- **F2（证据时点差）**：manifest closed[] lifecycle_log 记「01-check PASS 75/75」为 baf4cb80 时点真值；同 commit 落位后实为 82/82（registry/账本/报告均引 82/82）。可勘误注记，亦可释为时点实录——轻。
- **F3（报告虚列）**：报告 §6/账本「AGENTS.md RA/守卫组/Frozen 行」——AGENTS.md 无 Frozen 行（b3306052 仅单行 RA 修订；守卫组行既有）。规范层未要求 AGENTS Frozen 行（CONTEXT 词条已足），属措辞超言非缺口。
- **F4（建制观察·前瞻）**：manifest 新顶层类 closed[]/frozen_evidence_packs 无 schema 校验闭环——75a M1 仅校 entries、M3 仅校 retired（retired 建制时同步 M3 先例未沿用到新类）；F 组仅覆盖钉值面（id/keys/sha256），exempt_from/refresh_path/scope 三字段无校验。建议立票入批2-β 或次批扩 75a M 组。非现行规程违例——建制先例方向性呈报。
- **F5（nit）**：01-check.mjs F1 标签两断言复用（:81 在位断言/:84 覆盖断言同名，红时归因歧义）；OK 汇总行漏 F 组；PROTECTED_SURFACE 未载 known-red-manifest.json 依赖（01-report.md 亦未载——既有先例）。
- **F6（nit·footer）**：aebd49c6 chore commit footer 仅 Chronicle: M-039，缺 Ledger-Refs/Adrs——925ae3cd 同型先例在前，b6387d9f 则全三栏（Adrs 空列亦写）。三栏位纪律（D-161④）对 bundle-only commit 一致性建议统一（写全空列或明文豁免）。

## 6. 过程违规审查（专项呈报）

零违规。核对面：判据/charter/裁定临场零修订（diff 无规范面文件变更）✓；生成物 bundle 独立 commit ✓；format-only 零搭车 ✓；账行增量↔编行随行同 commit ✓；未 push（origin 无此支）未 merge ✓；职责分离——执行窗未越权自批（r1 呈批待用户裁、批准前原字段维持）✓；挂账项未动（T2/O6/批3批4/F-02 均如实续挂非静默）✓；06/38/56 系豁免零越界 ✓；审计窗自身副作用——本窗重跑守卫致 12 件 reports 生成物 churn-only 漂移（run_at/RCP-id），已 `but discard zz` 弃置，工作树净零还原被审态（r44 审计同型先例）。

## 7. 给下一窗口

- 用户门：r1 RA 呈批待裁（docs/ra/r1-lineage-edgecap-accepted-risk.md §0）；F1 勘误形态（锚数 9→8）呈裁量。
- F4 建制建议入批2-β 候选（75a M 组扩 closed[]/frozen_evidence_packs schema）。
- grill 方向候选（下一轮）：①F1 勘误裁定链入口（修正 verify_method 锚数——源头裁定层原文更正形态）；②manifest 新类 schema 校验建制裁定；③T3 哨兵例读＋drift-watch 首次随读。
