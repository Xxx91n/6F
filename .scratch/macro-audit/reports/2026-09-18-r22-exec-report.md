# 轮 22 执行报告（macro-audit / architecture-recovery）

- **日期**：2026-09-18
- **任务书**：`D:\Aworker\6F\.scratch\macro-audit\handoffs\next-round.md`（轮 22 常驻任务书 T0~T9）
- **执行账**：A-076~A-080（`.scratch/architecture-recovery/decision-ledger.md` R13 节）
- **决策覆盖**：D-073 / D-074 / D-071③注 / D-075（承接 D-072 revised）/ D-067⑧ / D-077 / D-066③⑥注 / D-078 / D-068注 / D-037⑥ / D-041 / D-035 / D-020 / ADR-0004 / ADR-0014
- **分支**：`r22-impl-ledger`（GitButler 管理，未 push——用户闸门）

## 一、完成定义对照（验收标准逐条）

> 验收标准原文：「编译通过、打包通过、启动并测活软件进程；每个平台都要有 test 闭环，避免只引入却没做到。」附加口径：守卫脚本 exit 0 才算过。

| 验收项 | 命令 | 结果 | 证据摘要 |
|---|---|---|---|
| 编译通过 | `cd engine && npm run build` | ✅ exit 0 | `tsc -p tsconfig.json && node scripts/build-bundle.mjs` → `BUNDLE-OK dist/cli.js` |
| 打包通过 | `npm pack --dry-run` | ✅ 73 件 | `total files: 73`（785.2 kB，integrity sha512） |
| 启动并测活 | `node dist/cli.js selftest` | ✅ ok:true | 5/5 checks（manifest/shells/default mode/mcp read-only/receipt fields） |
| 启动并测活 | `node dist/cli.js doctor` | ✅ overall=ok | 三腿 duckdb:ok/git:ok(2.55.0)/upstream:ok(registry 200) exit 0 |
| 启动并测活 | `node dist/cli.js audit D:/Aworker/6F --out .code-tmp/t1/audit-live` | ✅ exit 0 | report MA-AUDIT-6F-MACRO-B：385 facts/21 ADR/202 commits/verdict=supported（r.5 绑定实写正常） |
| test 闭环 | `npm run smoke` | ✅ 17 套件全绿 | 尾部：DOCTOR-TEST-OK 9＋AUDIT-ZERO-WRITE-TEST-OK 4/4＋CITATION 38＋NARRATIVE 34 |
| 平台分层闭环 | `node test/duckdb-selfheal-offline.test.mjs` | ✅ 13/13 | A 面（非 TTY 禁拉）7 断言＋B 面（opt-in 失败回落）5 断言＋复原 1 |
| 平台分层闭环 | `node test/duckdb-selfheal-e2e.test.mjs` | ✅ 3/3 | opt-in 真补拉 r.5→HEALED→包目录复在 |
| 守卫电池 | `node .scratch/architecture-recovery/reports/{33,34,38,41b,44,46,52a,53,54,55,56,64}-check.mjs`＋`14-skeleton-check.mjs`＋`xfail-run.mjs` | ✅ 全 exit 0 | 33:23/23｜34:23/23｜38:34/34｜41b:33/33｜44:59/59｜46:30/30｜52a:22/22｜53:25/25｜54:20/20｜55:18/18｜56:24/24｜64:15/15｜xfail-run SEALED:15+XFAIL:8/10 |
| validate 三面 | `node scripts/validate-plugin.mjs`（本地/剥离 PATH/MACRO_AUDIT_CI=1+剥离） | ✅ 三态实测 | 本地→PASS；本地 absent→SKIP+streak WARN；CI+absent→INFO 零 state 消费 |

## 二、T 序交付明细

### T0 基线（done）
- 守卫基线复跑全绿；册外 13 件现状登记（38×2/39×10/40×1）；R22-Q1~Q6 调研与账本第二十二轮节精读。

### T1 #65 册外陈旧断言批量分拣（done，A-076 / D-073/D-074/D-071③注）
- **分拣产物**：`acceptance-probe-attestation.jsonl` **15 行**（id=ap-\<guard\>-\<slug\>；fired_at/last_fired_commit 双锚——38:04adb24/39:ecdc015/40:65e188e/41a:4db10c3/50:9460cf2/t8:2803710；evidence/disposition/decision/migrated_to 齐备）。
- **sealed 第三态**：38/39/41a/50/t8 五守卫 `sealed()` 发射器＋头部 `// acceptance-probe: sealed` 机检标记；xfail-run 排除执行集＋`SEALED: n` 顶显；**sealed 不占 XFAIL cap**。
- **活性承接**：`stale-assertions.json` active 8 条（41a:D6/D7/F4、43:D5、45:H5、39:H6、40:G5、t8:H3）入册照跑；env 活契约腿→`engine/test/audit-zero-write.test.mjs`（mkdtemp 玩具仓 fixture：audit 实跑→facts 产出→工作树零写入→HEAD 稳定 4/4，挂 smoke 链第 17 件）。
- **闭包断言**：33-check G5（sealed 调用↔attestation 行数等/标识等）／G6（active 集∩sealed 集=∅＋无 residual t() 复活洞）／G7（attestation 字段/锚/迁移目标/头标记齐备）→ 23/23。
- **复跑证据**：`node .scratch/architecture-recovery/reports/xfail-run.mjs` → `SEALED: 15`＋`XFAIL: 8 (cap 10)`＋exit 0。

### T2 #66 duckdb 自愈按面分层（done，A-077 / D-075 承接 D-072 revised）
- **面探测**：`duckdbSurface()`——MCP≡`MACRO_AUDIT_MCP_STDIO==='1'`／cli-interactive≡`stdout.isTTY`／ci-unattended≡其余。
- **分层行为**：CLI 交互面保留自动自愈（stderr 预告「补拉约 40MB 最长 240s Ctrl-C 可中断」；spawnSync 保留——异步假 exit 0 比阻塞更糟）；**MCP/CI 永不自动拉包**（缺省 trigger=null 零 spawn）→ 四段披露 `DUCKDB-UNAVAILABLE`（缺失原因→`macro-audit doctor --fix`/`npm install --omit=dev`→能力边界→`MACRO_AUDIT_SELFHEAL=1` opt-in 会阻塞 JSON-RPC 最长 240s）。
- **doctor --fix 主路**：`healDuckdbBinding()` 导出复用 selfHealDuckdb() 全逻辑＋createRequire 验载；`doctor --fix` 命中 DUCKDB-UNAVAILABLE 时显式补拉＋重开库，自愈事件 trigger=doctor-fix。
- **四缺陷返工**：F4 win32-arm64 死分支摘除（@1.5.5-r.5 npm 实证存在；pin r.4→r.5 三方同值联动：store.ts/package.json/package-lock/upstream-lock）／F7 probeUpstream 改 `npm config get registry` 回落 npmjs.org／F8 emitSelfHeal 全 stderr 化＋success 移 createRequire 实载后／F9 大半消解（异步形态存档备选不实施）。
- **附带硬化**：win32 npm 经 `cmd.exe /d /s /c` 包装（Node≥24 禁 .cmd 直调 EINVAL；shell:true 触发 DEP0190——两全）。
- **复跑证据**：offline 13/13（非 TTY 零 DUCKDB-SELFHEAL 事件；opt-in+死 registry→trigger=opt-in fallback）＋e2e 3/3（opt-in 真补拉→HEALED）＋`doctor --fix` 实测三腿 ok＋64-check 15/15（A3/A5/A8/C4 升版联动）。

### T3 #67 SKIP-STREAK 环境分层（done，A-078 / D-077/D-066③⑥注）
- **分层**：`MACRO_AUDIT_CI=1`（engine-ci.yml validate 步注入）=cli-absent-expected 面→`INFO(claude-validate): cli-absent-expected`（neutral：计入 ADV 回显、不计 WARN、不进 streak、不升格）；缺省=cli-expected 面 SKIP+streak+ALERT 语义收窄「本地异常缺席」。
- **降格与载体**：state.json `mode:"local-observation-only"`（不入仓，CI 不消费）；`.code-tmp/claude-validate-receipts.jsonl` append-only 每跑一行 {at,cli_version,verdict,output_digest}。
- **晋升门**：registry `claude-validate-promotion-watch`→manual_watch 五要素（轮 22 整理环节已落）；D-066③⑥ scoped 勘误注记在账本收口节。
- **复跑证据**：三面实测（本地+claude→PASS＋receipt pass／本地+PATH 剥离→SKIP streak=1／CI+剥离→INFO 零 state 消费）＋34-check G19c 源级断言 → 23/23。

### T4 #68 upstream→dimension 映射表设计票（done，A-079 / D-078）
- `docs/upstream-dimension-map.md` v0.1 五节：github-rest 6 行（pr.list→S4／merge lead time→S4 仅人类 PR／Bot 占比→S5「平台声明的 Bot 身份」措辞锁／review 覆盖→S5↔S4 双挂待采后裁定／diff→Micro-A／rate_limit 族永久排除）；codelore 6 族（演化主干 12→S4／s3 族 6→S3 成对 opposing／s5 族 12→S5／explain 族→S4 env 门控／behavior 族 QuadrantEntry 归位／暂缓面集不映射）；准入条件通用纪律（LFX 式同信号按维出入）。
- descriptor `dimension: null` 保留＋注释指针×2；codelore 注释 S3/S5→s3/s5 归一。
- 守卫：44-check A14（上游文件无 S1-S5 字样）/A15（descriptor null＋指针）/A16（文档骨架字段齐）→ 59/59。
- **复跑证据**：`node .scratch/architecture-recovery/reports/44-check.mjs` → PASS 59/59。

### T5 R21 审计返工文档面勘误批（done，A-080）
- `2026-09-18-r21-exec-report.md` §八勘误批：F1 pack 71→**73**／F2 npm test 措辞收窄（selfheal 挂 CI 腿非 smoke 链）／F3 册外 11→**13**／F5 已闭环 D-077／F6 指针。
- 账本 D-068 FAIL2 机检边界注记（versionChanged 只拦 desync——baseline 同步升版+零字段 diff 三 FAIL 逃逸系设计边界）。
- xfail-run dead store 摘除（perGuard.crashed 写不读）；judgement 项票面登记（重复断言表驱动化挂追问；detect-libc→ldd 披露在案不动）。

### T6~T9 值守面（status quo，无翻转）
- #52b 待命（锚=host-narrative-corpus 未触发）；#41b 残余 B 轨不授权；registry 47+ 项复核无翻转；D-025 双口径纪律延续（实测/账本双呈报）。

## 三、活动实现 / sealed 历史证据 / pending 三态区分

- **活动实现（本轮新增）**：duckdbSurface 分层门控＋四段披露＋healDuckdbBinding＋doctor --fix＋MACRO_AUDIT_SELFHEAL opt-in＋validate-plugin 三面分层＋receipts.jsonl＋upstream-dimension-map.md＋audit-zero-write fixture＋33-check G5~G7＋44-check A14~A16＋64-check A3/A5/A8/C4＋34-check G19c。
- **sealed 历史证据（使命完成显式退役）**：attestation 15 行（38:H4/H5、39:I1/I2/I3＋6 条、40:H2、41a:C10、50:E2/E3、t8:H1）——fired 历史真相在档，不再占用执行面。
- **pending/manual-watch（未动）**：xfail-second-track-trigger(bound=#65)／claude-validate-promotion-watch(manual)／duckdb 三复审触发器／D-076 四触发器／#52b host-narrative-corpus／25-P4/25-D3 listing 资产／push 闸门（r19/r21 closeout＋r21 六分支栈＋本轮分支）。

## 四、阻塞 / 追问留票

- **阻塞**：无硬阻塞。既有未跟踪 scratch（`.code-tmp/` 族）保持未跟踪纪律。
- **追问留票（账本登记面）**：D-075 opt-in doctor 回显检查项／F9 异步形态存档备选；D-077 receipts↔attestation 分文件同 schema／版本窗机检锚=CHANGELOG M 条目；D-078 落点 vs quadrant-rubric 并面／Bot 占比 S5 vs S4 备选／LFX 权重列／#47 九类事实复核／ADR-0020 复读；T5 judgement=34-check G15-G17/41b A8-A10 同族断言表驱动化（重构风险>收益暂留）／detect-libc 披露在案。

## 五、lessons

- `spawnSync('npm.cmd')` 在 Node≥24 直接 EINVAL（CVE-2024-27980 硬化）——win32 调 npm 走 `cmd.exe /d /s /c npm` 显式包装，免 shell:true 的 DEP0190 又免 EINVAL。
- `npm install <pkg>` 默认写 `^` 前缀——本仓 pin 纪律（无 ^/~）须回写精确值并同步 package-lock spec 行。
- Node `-e` 内嵌模板字面量遇 bash 双引号包裹会被命令替换吞掉——含反引号/多行内容的补丁一律写 .cjs 文件再跑。
- 测试仿真 cli-absent 时 PATH 剥离须保 node 目录（`env PATH="$(dirname $(which node))"`），否则 node 自身缺席。
- sealed vs archived 的运营化教训：移出执行集必须配 attestation 固化＋闭包断言（G5/G6/G7），否则第三态退化为第二个 archived。

## 六、引用文件清单

- 决策/执行账：`.scratch/macro-audit/decision-ledger.md`（D-073~D-078＋勘误三枚）、`.scratch/architecture-recovery/decision-ledger.md`（R13 A-076~A-080）、`.scratch/architecture-recovery/BACKLOG.md`（#65~#68 ✅）
- 实现：`engine/src/fact/store.ts`、`engine/src/doctor.ts`、`engine/src/cli.ts`、`engine/src/upstream/codelore.ts`、`engine/src/upstream/github-rest.ts`、`engine/scripts/validate-plugin.mjs`、`engine/package.json`、`engine/package-lock.json`、`engine/upstream-lock.yaml`、`engine/README.md`、`.github/workflows/engine-ci.yml`
- 测试/守卫：`engine/test/audit-zero-write.test.mjs`、`engine/test/duckdb-selfheal-offline.test.mjs`、`engine/test/duckdb-selfheal-e2e.test.mjs`、`reports/33-check.mjs`、`34-check.mjs`、`44-check.mjs`、`64-check.mjs`、`xfail-run.mjs`、`stale-assertions.json`、`acceptance-probe-attestation.jsonl`、`38/39/41a/50/t8-check.mjs`
- 文档：`docs/upstream-dimension-map.md`、`2026-09-18-r21-exec-report.md`（§八勘误批）
- 调研依据：`R22-Q1~Q6-atomcode-research.md`、`2026-09-18-r21-audit-report.md`

## 七、勘误批（r22 审计 R3——原文读数保留＋成对勘误，引 acceptance-probe-attestation.jsonl / stale-assertions.json 实物）

- §二锚清单勘误：原「38:04adb24/39:ecdc015/40:65e188e/41a:4db10c3/50:9460cf2/t8:2803710」→ 实物「38:04adb24/39:**b1d71c6**/41a:4db10c3/50:9460cf2/t8:2803710」——39 锚为 b1d71c6 非 ecdc015；40 无 sealed attestation 行（40:G5 系 active xfail 非 sealed），「40:65e188e」整行删。
- §三 sealed 枚举勘误：原「38:H4/H5、39:I1/I2/I3＋6 条、40:H2、41a:C10、50:E2/E3、t8:H1」（枚举 16≠自称 15）→ 实物 15 行「38:E3/H4（2）、39:E3/E4/F1/F3/F4/F5/I1/I2/I3（9）、41a:C10、50:E2/E3（2）、t8:A3」——38:H5→E3、40:H2 不存在、t8:H1→A3。
- §三 active-8 勘误：原「41a:D6/D7/F4、43:D5、45:H5、39:H6、40:G5、t8:H3」→ 实物「41a:D6/D7/F4、43:D5、45:B5、45:H5、39:H6、40:G5」——t8:H3 不存在，45:B5 漏列。
- A-076 规范化需求栏同三枚失真——勘误注记已落 `.scratch/architecture-recovery/decision-ledger.md` R13 节尾。
- 附注（P1 收编）：本报告原名 `2026-09-18-report.md` 撞名覆盖轮 20 执行报告——已循 `-rNN-` 后缀先例改本文件名，轮 20 原物自 git 历史 41bf360 恢复。
