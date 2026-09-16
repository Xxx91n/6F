# round9 审计报告 — 2026-09-16 窗口（r9 栈 14 commits + #35 返修）

> 审计窗只出报告不动手修。fixed point = `384d6f9`（上轮审计 commit）；范围 = `384d6f9..HEAD`（14 commits：yvn 返修 + ytz/kuy/szk/oru/sps/unv/zkm/ppm/xsl/rmw/kvx/uxv/xqx）。被审 = `.scratch/macro-audit/reports/2026-09-16-report.md`（11 窗口节+编排收口）。

## 1. 硬验收（亲跑，不信自述）

| 命令 | 声明 | 亲跑结果 | 结论 |
|---|---|---|---|
| engine npm test | GEN-OK+tsc+SMOKE6+COLLECTORS14+ADAPTER7+BATCH1 41+LLM 25+REPORT-PREVIEW 5+INTAKE 31+DEMO 38 | 逐项复现（INTAKE/DEMO 直跑 31/38） | ✅ 成立 |
| npm run package | 54 files | 54 files tgz 生成 | ✅ |
| selftest | ok 5/5 | ok 5/5 | ✅ |
| 33-check | 16/16（8→16 扩展） | PASS 16/16 exit0 ALARM3/WARN12/COVERAGE 23/30 | ✅ |
| 34/35/36/37/38/39/40/41a/42/43/44/45-check | 11/22/20/40/36/38/57/39/43/28/56/51 | 全部逐项 PASS 同数 | ✅ |
| 32-t0-verify2 | 12/12 | PASS 12/12 | ✅ |
| **32-t0-verify** | （报告收口节未提） | **TOTAL 98/99 HAS-FAIL**——FAIL 33-ext 收尾报告路径 | ❌ **当前红** |
| gen 二次 | 幂等 | CLEAN+GEN-OK | ✅ |
| codelore --version | 0.28.0 三方同值 | 0.28.0 | ✅ |
| git ls-remote | 未 push | 远端仅 main | ✅ |

## 2. 实物抽查（关键声明→证据）

- #36 LLM：codelore.ts 五 env 变量+resolveLlmGate+collectCodeloreLlm+llm_gate/gated/narrative/cost+call-cap-reached+MAX_CALLS 全在；禁词表仍净；test E1 钉 s3cr3t 不进 fact。✅
- #37：37-pilot-measurements.json 三仓读数在（jiahao count=252 head=9e827607）。⚠见 W1。
- #38：preview_disclosure 契约面在 generate.ts；38-audit-facts.duckdb 在；store.ts=fact/store.ts（audit_fact_seq+schema_registry 种子）；FORCE CHECKPOINT/去重循环在 .scratch 管线脚本非 store（报告表述略偏，功能位正确）。✅
- #39：39-out 三仓产物+共享 duckdb；jiahao 仓 macro-b-regression.yml 实物在（D:/Aworker/jiahao/.github/workflows/）。✅
- #40：intake.ts 三腿+hooksPath=noop+ext.allow=never+sha256 键+浅拒全在；40-out 产物齐。✅
- #45：fixture-generator pin env 逐字节 SHA+definitions×3 名逐字+golden×3+demo CLI+CASRAI 四印记复用同契约。✅
- #41a：examples/first-report 五件+仓根 CHANGELOG M-001 五字段+README 边界矩阵。✅（W4 清零闭环）
- #43：golden-ci.yml 两腿+contents:read+bundle 物化。✅（实现路径含 .git 写入见 H2）
- #44：upstream-lock.yaml 六行九字段+纪律注记。⚠adapter 悬空路径见 W4。
- #42：42-dump-comparison.md 三轴落文+registry upstream-probes 项+evaluating 维持。✅
- #33-ext：registry 五要素 5/5+D4 fail-closed+COVERAGE 输出；manual_watch 7 项齐备。✅
- **上轮返修 W1~W7 全闭合**：残余 4 面挂 codelore-residual-faces manual_watch（review_event 数组双锚）+A4/A5 改动态断言（EXPECTED_RESIDUAL 字面量已除）；README 波次表刷新；issue35=done；CHANGELOG 指针注记+根档落盘；decisions README 孤儿行归位；evidence 共派生 codeloreAnalysisArgs；manifest/probe 录制注记。✅
- 账本：A-041~A-053 行全在（A-046/A-052 保 current=#41b 闸门正确）；lessons 09-16 行 ×11；issues 全 done；events 三触发 occurred+证据锚；desk-task2/7 triggered-bound、desk-task15 pending（判据属 Micro-A 层=设计语义）。✅

## 3. 发现（打回修复窗候选）

### 硬违规（守卫自述纪律 ≠ 实际行为）
- **H1 40-check.mjs:86 D13**——文件头自述「只读，对 reports/ 仅文件读」，实际 `openWriter(40-audit-facts.duckdb)` 做 COUNT 读回：openWriter=READ_WRITE+DDL+registry 种子+写锁，运行即产 .wal。zz 里 624B wal 残留的正主——每次跑 40-check 都写一次。38/39-check 同用途用 openReader 是对的。
- **H2 43-check.mjs:67-69 C 段**——`git bundle unbundle`+`worktree add` 向本仓 .git 写 objects+`refs/frozen/first-report`（ref 现仍存在于本仓，本审计亲跑后即见；worktree 已 remove 但 ref+objects 残留）。与文件头「仓内状态零写」矛盾；每次跑都留痕。

### 守卫空洞/断裂
- **H3 32-t0-verify 当前红**——98/99 HAS-FAIL：n=33 的 `startsWith('33-')` 抓到 33-ext prompt（声明 33ext-report.md）→「收尾报告路径」FAIL。编排收口称全绿但 T0 门未随 33-ext 三件套复跑——票档前缀与守卫 slug 映射相撞。
- **H4 38-check.mjs D3**——门控开分支 `llm_narrative.length>=0` 恒真=fail-open 空洞（门控关分支断言是实的）。

### 证据一致性 / 锚设计
- **W1 jiahao 存档不自洽**：37-pilot 存 head=9e827607+count=252 vs 39 存 head=9e827607+count=251——同一 SHA 两读数不可能同时成立。drift_note 已披露（251→252=workflow commit），但把 count 改成活 HEAD 值而 head 冻结→存档对不可同刻共存；且 37-check C1 `cc===r.commit_count` 严格等值——jiahao 每加一 commit 必红（当前 live=252 暂过）。锚应钉 SHA 复测或改 >=基线。

### 文书失同步簇（上轮 W2/W3 同类复发）
- **W2** 报告 L133「串行派发 **7** 个子代理窗口」实列 11 窗（含表 13 行）——自矛盾。
- **W3** AR README：L394 #41a 行仍链 issues/41-*+A-046（实物 41a 三件套+A-051）；L431-436 Frontier 仍「W13 可开工 #36/#37」而全闭环。
- **W3** issues/41 Status 仍 ready-for-agent 无拆分注记（41a done/41b 闸门）。
- **W3** BACKLOG #35~#40 六行无 ✅ 闭环标记（#41a/#42~45 均有）。
- **W3** next-round L4「A-001~A-048」陈旧（实物 A-053）+L11 进度枚举缺 T4/T5/T6/T7/T12/T13/T14；README.md:90「54 词」陈旧（实物 56）。
- **W4** upstream-lock.yaml duckdb 行 `adapter:"engine/src/store/"` 悬空——实物在 engine/src/fact/store.ts（唯一机读权威内含死指针）。
- **W5** zz 残留：136MB 40-clone-cache（嵌套 git 仓）+wal——无 .gitignore 策略，树长期脏。

### 判定项（不阻断，登记）
- fixture-generator gitEnv 仅 pin author/committer/date，无 GIT_CONFIG_NOSYSTEM/hooksPath=noop——比 intake 自身纪律弱，逐字节确定性只在良性宿主成立。
- Duplicated Code：runCodeloreAnalysis≈runCodeloreLlm 函数体全同；resolve→push→pinned 序言 ×3（2→3 恶化）；seenFactIds 去重循环三脚本各抄一份；demo.ts 判据段与 39 脚本同构复抄（自承注释）。
- golden-ci `npm install` 非 `npm ci`；#37「全人 #1-#7」实得 {1,2,3,4,5,7} 无 #6（计数对、区间表述松）。
- spec 外扩均披露可辩护：锁表六行 vs D-037③ 四行（三处登记）；等签名 overlay 重构（三处标注）；41a 顺手修。
- 已复核排除：33-check 数组形 review_event（residual-faces 双锚）实跑 PASS=已处理；decisions README「17+1」=阶段收口快照，41a 报告已声明如实保留。

## 4. D-xxx 覆盖核对

D-035②（#36 LLM 独立票+env 门控）✅；D-033（#37 冲突协议呈报不静默改向；#39 三仓裁定如实）✅；D-034②⑤（#38 层序+披露块）、④a/b（mw-trigger-a/b 触发登记→值守 ALARM 通道）✅；D-032（双件+degradeReport）✅；D-013（#40 URL opt-in+intake 三腿；#45 demo 走本地腿）✅；D-037②③⑤（披露块/锁表种子/两段式守卫）✅；D-038（demo 四要件+披露同源）✅；D-039（仓根编年 M-001 五字段+双账互指）✅；D-030/031（examples+边界矩阵）✅；D-023（#42 dump 评估呈报不代拍）✅；D-041①③（33-ext 五要素 5/5+risk_accepted 不自动翻转）✅。
**缺失/弱化**：无方向性跑偏；A-046/A-052 保 current 正确（#41b 未动=用户闸门遵）。

## 5. 过程违规呈报（不追认）

- **P-V1**：编排收口「逐窗亲验守卫」成立，但 T0 覆盖门（32-t0-verify）在 33-ext 三件套落盘后未复跑→当前红态与「全闭环」声明同存。
- **P-V2**：H1/H2 两守卫自身违「只读/零写」自述——守卫纪律审计对象反成污染源（本审计亲跑即留 refs/frozen+wal）。

## 6. 处置建议

实质成立但非净过——建议打回修复窗小修（文书级+守卫级，不动功能代码）：
1. 32-t0-verify slug 映射修（精确匹配或 NN-ext 解析）+复跑至 ALL-PASS
2. 40-check D13 改 openReader；43-check unbundle 后清 ref/objects（或改自述措辞+善后函数）
3. 38-check D3 门控开分支补实断言或明示跳过
4. upstream-lock adapter 改 engine/src/fact/store.ts
5. 失同步簇全刷（README L394/L431、issues/41 拆分注记、BACKLOG 六行 ✅、next-round 区间+枚举、README.md 54→56）
6. 37 存档锚修复（head↔count 同刻一致或钉 SHA 语义）+C1 改 >=/SHA 锚
7. zz 卫生（40-clone-cache/wal 入 .gitignore 或清理）
8. 可选：gitEnv 隔离补齐、dedup 重构、npm ci

**重跑清单**（修后同一套）：npm test 全链+package+selftest+15 守卫全 PASS 且 exit0+gen 幂等+ajv+32-t0-verify ALL-PASS+`git for-each-ref refs/frozen` 无残留+but status zz 干净。

---

**复核追加（2026-09-16 晚）**：§6 返工清单 9+6 项全部落地；父窗重跑同一套验收全绿（15/15 守卫 PASS+exit0，32-t0-verify 107/107 ALL-PASS，npm test 8 套件绿，refs/frozen 空、wal 无再生）。38/39-check 曾受并行会话脏化被测仓而红，自清后回绿——非修复引入。审计发现项全闭合，放行。
