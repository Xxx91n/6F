# 轮21 审计收口 → 轮22 修复窗口交接（handoff）

- 生成方：审计 Agent（只读窗口，实现零改动）
- 上游输入：`D:\Aworker\6F\.scratch\macro-audit\reports\2026-09-18-r21-exec-report.md`
- 审计产物：`D:\Aworker\6F\.scratch\macro-audit\reports\2026-09-18-r21-audit-report.md`（声明→证据→结论全表＋双轴评审＋过程违规呈报）
- 评审锚点：`eb1a293`→workspace `146645f`（diff 固化 `D:\Aworker\6F\.code-tmp\r21-audit\r21.diff`，47 文件 +4036/−389）

## Session Goal

轮21 六票（#58/#63/#64/#61/#60/#62）审计收口：硬验收独立重跑全绿、声明逐条对物证、双轴评审完成。**结论=PASS-with-findings**——六票核心契约成立、执行报告实质可信；发现项全部转入轮22 修复窗口。

## 硬验收读数（审计亲测真值——以此为基准）

- 守卫电池：33:20/20、34:22/22、41b:33/33、44:56/56、46:30/30、52a:22/22、53:25/25、54:20/20、55:18/18、56:24/24（cue hash `0628234f798bc569`）、64:14/14、14-skeleton PASS、xfail-run PASS（XFAIL:10 cap10、断言照跑 161/171）
- 测活：npm test exit 0（16 套件）、doctor 三腿 ok、selftest 5/5、`claude plugin validate --strict` 干净、mcp list ✔ Connected、selfheal offline 7/7＋e2e 3/3（真补拉）
- **pack 真值=73 件**（dist 42 已入库含 doctor.*）——报告 71 为 A-070 时点陈旧读数
- **册外陈旧实测=13 件**（38×2/39×10/40×1）——报告口径 11；+2=38:H4（anysearch-cli 被 grill-round-70 弄脏·环境腿）＋39:H6（next-round 换代锚点新破·与已入册 45-H5 同型）

## 轮22 返工要求（按优先级；修完必须重跑下方清单）

1. **SKIP-STREAK CI 失明**：`.code-tmp/claude-validate-state.json` 未跟踪→CI 每轮复位 streak=1，≥2 升格永不触发。修=状态持久化（CI artifact/锁表豁免位）或票面如实收窄「仅本地有效」。
2. **win32-arm64 前提已证伪**：registry 实测 `@duckdb/node-bindings-win32-arm64@1.5.5-r.5` 存在（dispatcher optionalDeps 8 变体）。决策票：摘 `NO_OFFICIAL_BINDINGS` 接入自愈 or 保守回落写明判据——勿继续静默硬禁。
3. **报告精度回改**：pack 71→73；「npm test 含 selfheal-offline」→改注「自愈测试挂 engine-ci.yml 双腿非 smoke 链」；册外 11→13 读数更新＋39:H6 归因处置（评估入册或批量桶）。
4. **probeUpstream 口径错位**：硬编码 registry.npmjs.org vs 自愈走 `npm_config_registry`——改 `npm config get registry` 探测、npmjs.org 回落。
5. **emitSelfHeal 两面修整**：非 MCP stdout 污染（`audit --json` 混入 SELFHEAL 行）→stderr 化；`result:"success"` 移至 createRequire retry 之后（装成功≠载成功）。
6. **README/D8**：`## CLI 命令面`补 `macro-audit doctor` 行；doctor.test D8 恒真断言换真断言（如断言 selftest.ts 无 doctor 引用）。
7. **#60 FAIL2 边界注记**：synced-empty-bump 三 FAIL 逃逸为单快照 diff 先天边界——账本注「机检边界」行（D-068 同构语义翻转先例）。
8. **册外 11 件承接**：独立批量处置立票 or 并入 `xfail-second-track-trigger` 票面（补逐条锚点/兜底日期）——当前仅注记登记。
9. **judgement 项随顺带票**：spawnSync 阻塞 MCP 事件循环（异步化或时延面注记）、`perGuard.crashed` dead store、34/41b 同族断言抽共享、ldd→detect-libc 或注记零依赖选型。

## 修复后重跑清单（与审计同一套）

```
cd D:/Aworker/6F
node .scratch/architecture-recovery/reports/{33,34,41b,44,46,52a,53,54,55,56,64}-check.mjs   # 全 exit 0
node .scratch/architecture-recovery/reports/14-skeleton-check.mjs && node .scratch/architecture-recovery/reports/xfail-run.mjs
cd engine && npm test && npm pack --dry-run   # pack 件数须与报告一致
node dist/cli.js doctor && node dist/cli.js selftest
node test/duckdb-selfheal-offline.test.mjs && node test/duckdb-selfheal-e2e.test.mjs
cd .. && claude plugin validate engine --strict && claude --plugin-dir engine mcp list
```

## 过程合规确认（审计已核）

- 分支栈 6 特性+1 closeout（ma/st/du/cu/sk/ru/r2）全未 push——用户闸门合规；[cleanup] 独立 commit、判定/cleanup 分离 ✓
- 报告勘误披露纪律好（D-072 前提勘误、D-025 双读数、45-H5 前提勘误均在案）——审计复测仅发现读数漂移非隐瞒

## 下一个 grill 方向指示

- **主方向=册外陈旧批量处置收口**：39:H6 同型新破暴露「cap 满即无处可去」机制缺口——xfail-second-track-trigger（manual_watch, stage3-close）是否要提前触发、批量桶是否需要逐条锚点，值得 grill；
- **次方向=环境敏感腿**：38:H4/39:I1-I3 类「sibling 仓工作树零写入」断言对并行 agent 环境零免疫——断言环境面归属值得 grill（值守面是否该退到 fixture 或标记环境敏感）；
- **三方向=自愈边界**：win32-arm64 摘除决策、probeUpstream registry 口径、stdout 污染面——D-072 后续追问。

## Working Instructions

- 版本控制用 `but`；本轮修复走新 r22 分支栈，与其他分支并行互不影响；不 push 除非用户明示；
- 守卫脚本必须 exec 直跑（ctx node preload 污染子进程教训）；写文件用 Node.js fs＋回读断言＋禁 BOM；用户面路径写全绝对路径；
- 修复完一轮必须重跑 §重跑清单 全套并把真值写进执行报告（勿复用陈旧读数——本轮 pack=71 教训）。