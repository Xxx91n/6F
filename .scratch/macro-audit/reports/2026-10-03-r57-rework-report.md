# R57 LOOP 返修报告（R58 审计打回——R-01~R-04 全修）

- 窗口：2026-10-03；身份=R57 收口窗（修复/开发子 Agent）承接审计打回返修；分支=`r57-t1-exec`（未 push／未 merge／未 amend）。
- 触发：`reports/2026-10-03-r58-audit-report.md` §0 CONDITIONAL PASS——八项硬验收＋四票功能闭环全部成立，5 项记账/文书面缺陷（P1-1/P1-2/P1-3/P2-1/P2-2）打回返工。返修范围=其 §6 R-01~R-04；归属按审计建议（打回 R57 收口窗=本窗）执行。

## §1 R-01~R-04 逐项处置（每项附可复跑证据）

| 项 | 处置 | 证据（命令 → 读数） |
|---|---|---|
| R-01（P1-1） | 账本 census 行＋报告 L48：400 条（+11）→**401 条（+12/−1）**；补齐遗漏归因——48-check 两族（48-E7 收窄措辞新字面的同名多命中弱隔离钉）＋82-check 一族（棘轮抬限登记字面在账本双命中的多命中钉）；附勘正注记引审计报告 §4 | node 回读账本：「401 条」×2（census 行＋返修登记行）、「400 条」×2（均为勘正注记内旧值引用）、「## 第五十七轮…」标题数=1；census 实物=75a-check 实跑 findings（见 §2，401 经返修连锁后终态 400） |
| R-02（P1-2） | 删除账本 R57 节重复副本 B 块（原 L1982~EOF，42 行），保留 A 块（43 行、含 guard-all-run 预算登记行）超集；仅动本轮节，历史轮次零触碰 | 手术脚本前置校验：blockA lines=43／blockB lines=42／**bOnly=0**（逐行比对无 B 独有内容）；术后：节标题计数 2→1、预算登记行 ×1、账本 EOF=分层定稿节自然收尾（tail 断言过） |
| R-03（P1-3） | 报告 §2 过程事实节补登守卫执行器预算 TIMEOUT_MS 300→600s（含 rc=124 压线态＋D-149④ 执行器运维常数论证＋D-177 不适用论证）；存留 A 块内预算登记行在位交叉确认 | 报告 §2 实文「守卫执行器预算上调（R58 审计 P1-3 补登——原漏登本节）…」在案；账本「guard-all-run 执行器预算常数上调」×1 |
| R-04①（P2-1） | predecl §5.1 链式追加**勘误五**（不改写勘误四原文）：307,980B=抬限裁定当时实测、310,334B=收口终值（T1-D S3 接线 ytl 增补 +2,354B 后，margin 74,666B）——各为其时点真值非矛盾；发现时点 **post-hoc** 如实标（D-181② 同窗补记形态）＋D-188 法定 commit 指针=10252bc093e732bd4fd26b6db82a617ddc5c6481（feat(D-204): #84 Macro-C 产线化…） | 勘误五行实文在案（predecl 尾部）；84-check 指针纪律机检复跑 PASS 34/34（subject 引文不透明载荷面过闸） |
| R-04②（P2-2） | registry env-gated-guard-class 标题**十件→十二件**（sibling 三件＋engine-deps 九件——85/86 入列 engine-deps 类，85 兼 sibling） | `node 33-check.mjs` → PASS 33/33；75a-T3 声明集↔registry guards 集 12 件对账 PASS |

## §2 连锁 census 增量（R-02 副产物——D-094① 检出=须归因）

- R-02 删 B 块使 bundle 体积常数字面在账本的命中 2→1，多命中态消失→**悬空摘除 `82-check|multi-hit-probe|99831f54`**，register 401→**400**。
- 证据：`node 75a-check.mjs` → `PASS C1（400 findings ↔ register 400 条）`＋`PASS C2 注册表零悬空条目`＋末行 `findings=400`；`75a-census-findings.json` 同步再生 401→400（派生件→独立 bundle commit 再基线，D-140②/D-180 紧邻对）。
- 终态三方对齐：register=400 ↔ live findings=400 ↔ findings 派生件=400。

## §3 审计 §6 同套验收重跑（与审计窗 §1 命令逐字一致——全部亲自实跑）

| # | 命令 | 实测读数 |
|---|---|---|
| V-1 | `npm run build` | exit 0；`BUNDLE-OK dist/cli.js` |
| V-6 | `node scripts/check-dist.mjs` | `DIST-RATCHET PASS: 310334B / cap 385000B`（margin 74666B）——build 前后同值=确定性构建零 drift |
| V-2 | `npm pack --dry-run` | `macro-audit-0.1.0.tgz`；89 files |
| V-3 | `node dist/cli.js selftest` | `{"ok":true}` 5 checks 全 pass |
| V-4 | `node dist/cli.js doctor` | `overall:"ok"`；duckdb/bindings/git/upstream 四腿全 ok |
| V-5 | `npm test` | **exit 0；PASS 379／FAIL 0**（23 套件 smoke 链） |
| V-8 | `node engine/dist/cli.js audit . --scale Macro-C --out <tmp>` | exit 0；`report_id=MA-AUDIT-6F-MACRO-C`；五工件齐；四象限=strategy native[S2,S4]／**structure derived[S3]**／behavior derived[S5]／**supply_chain not_applicable** |
| — | `node 85-check.mjs` | `PASS 26/26` |
| — | `node 86-check.mjs` | `PASS 18/18` |
| — | `node 75a-check.mjs` | `PASS 16 pass, 0 fail；findings=400` |
| — | `node guard-all-run.mjs` | **`ran=65 green=65 skipped=0 group-skipped=0 red=0 registered=0 problems=0 allOk=true`；GUARD-ALL-RESULT: PASS** |

追加目标复跑（记账触碰面）：33-check 33/33；41a-check 39/39（G1 改动文件无 BOM 在链）；84-check 34/34（勘误五指针负载过闸）；75a C1/C2/C3＋T3 全 PASS。

## §4 过程事实与呈报项

- **.atomcode 两件（审计 G-3 续）**：维持 staged 原态，本窗 commit 手术摘除不收编（不代处置）——提交 vs `git rm --cached` 退回真未跟踪，归属仍呈用户裁定。
- **`.scratch/tmp-aud.txt`（新增呈报）**：2,496B，2026-10-03 17:17，内容=git LF/CRLF 警告捕获（CONTEXT.md/package.json/src/a.ts 数条）——**审计窗残留物，与其 §5 G-5「临时件已清理」声明不符**；本窗不收编不删除，呈用户处置。
- Git 面噪音澄清：`git status --porcelain` 的大面积 MM/D/?? 为 GitButler 虚拟分支的 git 索引态（HEAD=集成 commit），权威脏集以 `but status`/`but diff` 为准=本返修 12 件（11 修改/新增＋1 派生）——非未收残渣。
- `but commit` CHANGES 选择器失效事实延续（R57 账本过程登记在案）——本窗延续 commit-all＋`but uncommit <commit>:<file>` 手术＋`but show` 逐 commit 核对实收清单路径。
- 计量口径注：返修手术脚本打印长度为 UTF-16 码元（405,267 chars），git/Buffer 字节=743,750——CJK 三字节编码差，非文件异常。
- 63-assertion-inventory 零触碰（守卫源码零变更→断言面板无再生义务）；guard-all-run 执行器预算 600s 本窗未再动。

## §5 待用户裁定（审计窗「待你裁定」延续——本窗不代决）

1. **P1-3 是否再入 predecl 勘误载体**：R-03 强制项（报告 §2 补登）本窗已完成；若须闭合 predecl 侧披露链，建议下批以**勘误六**链式补记（预算常数上调＋D-149④ 论证，一行文本零判据变更）。本窗未动 predecl 该面（勘误五仅载 R-04① 棘轮口径）。
2. **「账本节标题唯一性」守卫立法**：审计窗呈报 41a-check 或 84-check 增设「同名 `## ` 节标题计数 >1 即红」断言（P1-2 守卫盲区）。本窗未自行扩守卫面；若立法，建议机检位落 41a-check（账本面对账 owner）＋沿守卫基线成员进出生命周期登记。
3. （已按审计建议执行、不再另裁）R-01~R-04 归属=R57 收口窗（本窗）——审计 §6 原建议，与任务书轮序一致。

## §6 引用文件清单

- 返修面：`.scratch/macro-audit/decision-ledger.md`（R57 节去重＋census 勘正＋LOOP 返修登记行）；`reports/2026-10-03-r57-report.md`（census 行勘正＋§2 预算补登）；`reports/2026-10-03-r57-t1-predecl.md`（勘误五）；`handoffs/next-round.md`（轮 57 行 +12 勘正＋返修闭环注记）；`.scratch/architecture-recovery/reports/33-gate-registry.json`（env-gated 标题计数）；`…/75a-census-register.json`（−1 悬空摘除）
- 收编面：`reports/2026-10-03-r58-audit-report.md`＋`handoffs/2026-10-03-r58-audit-handoff.md`（审计窗两件产出——审计窗零 VC 写，由本返修窗收编入册使账本引用可解析）
- 派生面：`75a-census-findings.json`（401→400 再基线——bundle commit）
- 本报告＋交接件（handoff 另行生成）
