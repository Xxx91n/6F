# 轮 38 批2-α 实施批审计报告（r38-audit LOOP-1）

- 日期：2026-09-27；窗型=审计窗（职责分离：只出报告，不动手修——发现项打回修复窗或呈报裁定）
- 审计对象：`r38-batch2-a` 栈；fixed point=`2d63c7c2`（r38-closeout 顶）；diff=`git diff 2d63c7c2..9164a010`
- 栈构成（审计时点 5 commit，old→new）：`0bfa2b46` fix 七件实修 / `601384bc` chore 工件收容 / `67c79dac` docs 账行A-099+编年M-023+75b+session骨架 / `c1a31386` docs 执行报告+移交 / `9164a010` chore 工件终态收容
- 方法：亲跑硬验收（不信报告自述）＋逐条实物抽查（rg/字节级/git 实物）＋$code-review 双轴子代理并行取证（Standards+Spec）＋D-xxx 声明逐条核对
- 被审文书：`reports/2026-09-27-r38-exec-report.md`＋`handoffs/2026-09-27-r38-exec-handoff.md`（其引用的任务书=handoffs/next-round.md）

## 1. 硬验收亲跑对照（审计窗独立复跑，`env -u NODE_OPTIONS`）

| 验收项 | 报告读数 | 审计亲跑结果 | 结论 |
|---|---|---|---|
| 编译 | `BUNDLE-OK dist/cli.js` | `cd engine && npm run build` → BUNDLE-OK dist/cli.js（tsc+esbuild 双段） | ✅一致 |
| 打包 | `macro-audit-0.1.0.tgz` 85 件 255.4kB | `npm pack --dry-run` → 85 files / 255.4 kB / unpacked 1.0MB | ✅一致 |
| 启动测活 | `{"ok":true}` 5/5 | `node engine/dist/cli.js selftest` → ok:true，5/5（manifest可读/shells=4/mode单值/mcp read-only/receipt=5字段） | ✅一致 |
| test 闭环 | smoke 22 册全绿 exit 0 | `npm run smoke` → **SMOKE_EXIT=0**；`scripts.smoke`=22 件 `&&` 链（任一 FAIL 断链即非0）；尾部 audit-zero-write 4/4・dialect 19/19・file-card 36/36 全绿 | ✅一致 |
| dist 棘轮 | 263151B / cap 289395B | `node scripts/check-dist.mjs` → DIST-RATCHET PASS 同数（margin 26244B） | ✅一致 |
| engine 零触 | `git status --short engine/`=0 行 | 亲跑=0 行；且栈 diff `2d63c7c2..9164a010 -- engine/`=0 文件（批2-α 五 commit 全未触 engine/） | ✅一致 |

## 2. 声明→证据→结论（逐条对照）

| # | 报告声明 | 审计亲验证据 | 结论 |
|---|---|---|---|
| C-01 | 栈 `r38-batch2-a` above `r38-closeout`，三 commit 0bfa2b46/601384bc/67c79dac 未 push | `but status`：栈在 closeout(mnx=2d63c7c2) 上五 commit——报告时点三件为实；报告成形后追加 `c1a31386`(报告+handoff文书)与`9164a010`(工件收容)属合法续栈；三 SHA 均可 rev-parse | ✅属实（时点口径） |
| C-02 | session 骨架落盘 5680B 无 BOM 尾行 NL | `wc -c`=5680；首3字节=`23 20 43`（`# C`）无 BOM；尾字节=`0a` | ✅ |
| C-03 | env-manager HEAD `9eb8f24b…9771a3f1` 与 charter pin 前缀一致 | `git -C D:/Aworker/env-manager rev-parse HEAD` 亲跑=同值 | ✅ |
| C-04 | README 基线漂移披露：pinned `7d9e8e96aedd8ac1`@456c845e vs HEAD 面 `96a3d0a66f6c9f72` | 亲跑两 sha256 前16位完全吻合；456c845e=GitButler Workspace Commit（文档基线快照） | ✅ |
| C-05 | C1/C2/C3+三悬点全 pending 无杜撰 | session 档判据读数格全 `_pending_`、悬点格全 `_pending_`、findings 票面 F-01 空行 | ✅ |
| C-06 | 38-F2：support 钉枚举域 {supports,insufficient}，词表源=citation.ts output_states | 38-check.mjs:77 枚举域 indexOf 断言在；citation.ts:27 `output_states:[supports,insufficient]`；实测 34/34 | ✅ |
| C-07 | 25-C5c：末格显式豁免登记制，登记外命中=FAIL | 25-check.mjs:81 `LAST_CELL_EXEMPT=[R3 收口 push 已执行]`，C5c 断言 `lastCellHits.length===0`；实测 PASS 35/35（豁免外命中=[]） | ✅ |
| C-08 | 37-C2b：快照界 reachable ⊆ stored 欠数检出 | 37-check.mjs:62 `git log r.head --committer=noreply@github.com`；亲跑读数：env-manager 12⊆20 missing=0・jiahao 6=6・anysearch-cli 空集 NOTE 诚实缺席——与报告三读数逐字一致；41/41 | ✅ |
| C-09 | 20-A5：裸剥离器退役→_lib stripComments 自消费 | 20-fact-schema-check.mjs:7 import stripComments from ./_lib/check-kit.mjs，:38 消费 storeSrc；GUARD-PASS 28/28 | ✅ |
| C-10 | 26/28/30 机件收编 check-kit（commitsByGrep/touchedPaths/pathsTouchedBy/gitOut/lastChangeSha）＋统一 argv+`-c core.quotePath=false` | 三件均 import check-kit；kit.mjs:30-46 gitOut 统一 spawnSync argv+quotePath=false；实测 26→18 pass、28→113 pass(GUARD PASS)、30→10 pass | ✅ |
| C-11 | manifest `三分位`→`三分类`（全档唯一处） | known-red-manifest.json policy 现为「三分类」；`三分位` 现存命中全在历史文书引述面（r37报告/handoff/diff快照/CHANGELOG叙述/75b引述），manifest 本件零命中 | ✅ |
| C-12 | 01-spotcheck 尾行 NL＋生成器同步防再生 | blob 尾8字节 `7d 0a 20 20 5d 0a 7d 0a` 末=0a；0bfa2b46 diff 生成器 `JSON.stringify(...) + NL` 同步 | ✅ |
| C-13 | guard-all-run ran=60 red=1（kr-01⊆册）PASS | 亲跑：`ran=60 red=1 registered=1 problems=0` GUARD-ALL-RESULT: PASS；kr-01 四要素(evidence/review_anchor/expires_fallback/added)齐备，expected_slugs=D1,D5 与红集吻合 | ✅ |
| C-14 | 75a 9/9 findings=348 稳态（七件实修零新增零消除） | 亲跑 GUARD RESULT: PASS (9 pass) findings=348；75b 六轨映射 53+51+41+10+2+115+76=348 对账一致 | ✅ |
| C-15 | 70-check E1 库存账再生后 13/13 | 亲跑 E1 PASS＋13/13；VACUITY-CENSUS 59守卫/1397emit/候选0 | ✅ |
| C-16 | NUL=0 BOM=0（改动面12件） | 审计窗重扫改动面（trials/+报告+handoff+_lib/+75b）：NUL=0、BOM=0 | ✅ |
| C-17 | A-099↔M-023 同 commit `67c79dac`（D-144①随行） | 67c79dac name-only 含 arch-ledger+CHANGELOG+macro-ledger+75b+session+BACKLOG+WORKFLOW；A-099=arch-ledger:435、M-023=CHANGELOG:183 | ✅ |
| C-18 | 批2-β 五项裁定候选登记未机械推进 | 75b §3 五条 bullet 在盘（unstrippedScanHit/multi-hit includes·test漏面/SCAN_EXEMPT不可达+S1自指/stripMdComments零调用维持/75a写工件+41a解析器+slug正则耦合）；未入 fix commit | ✅ |
| C-19 | 唯一待办=用户侧宿主试用会话 | session 骨架读数格 pending＋exit 完备性票面在；charter 判据预声明已入库；宿主操作=用户驱动面（任务书闸门条） | ✅属实 |
| C-20 | 市场文件面：`.claude-plugin/marketplace.json` 在、`.codebuddy-plugin`/`.workbuddy-plugin`/`.mcp.json` 不在 | 亲验 ls：marketplace.json 在（plugin `6f` source `./engine`，marketplace `xxx91n`）；三件均不存在 | ✅ |

## 3. 双轴评审（$code-review，子代理并行取证）

### Standards 轴
- **硬违规：无。** commit 类型纪律合规：fix=语义实修；chore×2=生成物独立收容（D-139/D-140②）；docs×2=账行/编年/文书（D-144①同 commit）。engine/src+dist 栈内零触复核一致。
- 边界观察（非违规）：`01-spotcheck.json`（生成物）随 fix commit 同行——但系 1B 尾行补写与生成器同步修复的原子对（`generated_at` 未动、非产物再生），修复原子性可辩护，登记为边界案例。
- judgement calls：37-check.mjs 残留 4 处 inline `spawnSync`（含新 C2b hunk 未消费 kit `gitOut`）；kit `gitOut` 不检 exit status（git show 失败→空集，false-green 向，调用方 `length>0` 守卫只覆盖 commitsByGrep 路径）；28-check `FOREIGN_EXCEPTIONS/diffHash` 死机件保留（D-044 记录在案）；`stripMdComments` 零调用（75b §3 已登记维持）。

### Spec 轴
- **七件呈报全闭环**，无缺失/跑偏/scope creep；生成物独立 chore 收容系 r37 §6 明示路径；348 普查分档草案六轨映射对账吻合。
- nit 四条（见 §5 N1/N2/N3/N5）。

## 4. D-xxx／规程逐项核对

| 条款 | 义务 | 审计核实 | 结论 |
|---|---|---|---|
| D-094 三分类 | manifest 只收合法漂移、四要素齐备 | kr-01 四要素齐、failure_class=legit-drift | ✅ |
| D-139/D-140② | 生成物独立 commit | 601384bc/9164a010 两独立 chore | ✅ |
| D-144① | 账行↔编年随行同 commit | A-099+M-023 同 67c79dac | ✅ |
| D-145① | engine 触碰→build+check-dist 前置 | engine 未触义务不触发；基线仍复验全绿 | ✅（不适用面已声明） |
| D-149③④ | 升格后守卫判据=全量跑+红集⊆册+复绿告警 | ran=60 动态枚举、red=1=kr-01 册内 | ✅ |
| D-150④注记② | README 宿主兼容注记 | README 注记段在盘（codebuddy 兼容链+真机收口待试用实证表述） | ✅ |
| D-151② | 骨架先行+exit/success 双轴+SBTM 三件套 | charter+session 落盘、判据格 pending、关窗不注册事件负向沿行 | ✅ |
| D-152④ | worktree dirty 披露口径 | 骨架记 dirty=13（写入时点再生簿记态，标「披露不入判据」）；9164a010 收编后当前 dirty=0 | ✅ |
| D-066 | 禁同位双 .mcp.json | 仓根 .mcp.json 不存在 | ✅ |
| D-075 | MCP 面永不自动拉包 | README/charter 引用面一致 | ✅ |
| D-146 | findings 五要素票面+四档初分 | session 票面五要素+dedup-first 注记在位 | ✅（待回填） |

## 5. findings（审计窗发现——全部非阻塞，建议去向见 §7）

| id | 概要 | 严重度 | 证据 |
|---|---|---|---|
| N1 | 25-check.mjs:79-80 注释「末格不再剥离出扫描面」与实现不符——C5a 仍 slice 剥离末格，覆盖由新 C5c+LAST_CELL_EXEMPT 补回；行为正确，注释措辞不精确 | nit | 25-check.mjs:75-91 |
| N2 | `_lib/check-kit.mjs` 头注仍自述「仅放共享纯函数」，本批新增 spawnSync 系 git helpers 后头注过时 | nit | check-kit.mjs:1-6 vs :30-46 |
| N3 | A-099 files 列漏登 docs 面四件（CHANGELOG.md/WORKFLOW.md/BACKLOG.md/macro-audit/decision-ledger.md）——A-097 先例连文书面文件全列 | nit | arch-ledger:435 vs 67c79dac name-only |
| N4 | `0bfa2b46` fix commit message 未携 A-099 锚（A-098 先例 fix commit 带 `/A-098` 缀；docs commit `67c79dac` subject 有 A-099）——WORKFLOW §4 「commit 携 A-NNN」教训边缘擦碰 | nit | git show -s %B 三件 |
| N5 | 机件收编残余面：37-check.mjs 4+ 处 inline spawnSync（新 C2b hunk 亦未消费 kit gitOut）；28-check 非收编调用面留自有 execSync git()——spec 范围外但与统一 argv 姿态不一致 | judgement call | 37-check.mjs:53/62；28-check.mjs:37 |
| N6 | kit `gitOut` 忽略 exit status——`git show` 失败静默返回空串（false-green 方向）；pathsTouchedBy 调用面无兜底 | 技术债候选 | check-kit.mjs:30-33 |
| N7 | session 骨架「开发仓 HEAD=`954783e0`（r38-closeout 分支顶）」表述不精确——954783e0 实为 GitButler Workspace Commit（首 parent=2d63c7c2=closeout 真顶）；环境披露字段非判据读数，无实质影响 | nit | git cat-file/log 954783e0 |

## 6. 过程违规呈报

**无违规发现。** 正面合规复核：①fix/chore/docs 三类分离干净、生成物两次独立收容；②账行↔编年同 commit；③engine 零触；④判据读数 pending 不杜撰、环境快照披露口径符合 D-152④；⑤charter 先入库后开试用窗（Kill Criterion 兑现次序正确）；⑥全部守卫文件改动面 NUL/BOM 零。

## 7. 结论与去向建议

**LOOP-1 PASS（审计通过，无阻塞项）。** 报告自述关键声明 20/20 亲验属实，无双轴阻塞 finding，规程纪律全合规。

- N1/N2/N5/N6（守卫面瑕疵）→建议补录 `75b-disposition-draft.md` §3 批2-β 裁定候选或登记技术债，随裁定链处置——审计窗不修。
- N3/N4/N7（簿记/注释瑕疵）→留痕即可，不返工；若用户要求补齐可作下批顺手项。
- **唯一待办维持**：用户侧 T1 CodeBuddy 宿主试用会话（/plugin marketplace add→install→/mcp→Macro-B 审 env-manager→字段级 parity），逐格回填 session 档→findings D-146 四档初分→debrief 落盘。

## 8. 口径披露

- 本审计窗全程只读+复跑：零文件修改（除本报告与 handoff 两件文书落盘）；验收命令全带 `env -u NODE_OPTIONS` 规避 ctx 沙箱注入污染（任务书工具链避雷条）。
- Standards 子代理环境无 shell——经 R38/#75批2 标记+hunk 级重构取证并附 method caveat 明示；其硬结论均由本窗亲跑数据独立佐证。
- 本窗无账行增量——按 D-144① 豁免条款显式声明（审计文书 commit 不立新 A 行；findings 若立项走批2-β 裁定链届时再计）。

