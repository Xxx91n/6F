# 轮 21 执行报告 — 修复/开发子 Agent

日期：2026-09-18 ｜ 工作面：`D:\Aworker\6F`（engine/ + .scratch/architecture-recovery/）
分支栈（GitButler，未 push——push 属用户授权闸门）：

1. `r21-58-manifest-contract` ← `ovl`（#58 manifest 契约守卫链扩）
2. `r21-63-stale-guard` ← `rxn`（#63 陈旧守卫换代机制）
3. `r21-64-duckdb-selfheal` ← `owy`（#64 duckdb 自愈补拉）
4. `r21-61-cue-tables` ← `zvq`＋`xxm`（#61 cue 表分层判定 commit＋r18 顺带清 cleanup commit）
5. `r21-60-skeleton-gate` ← `qpu`（#60 骨架契约升版机检）
6. `r21-62-runtime-doctor` ← `kvw`（#62 运行时 doctor 探测票）

账本登记：A-070（#58）/ A-071（#63）/ A-072（#64）/ A-073（#61）/ A-074（#60）/ A-075（#62）；BACKLOG 六票全部「已闭环」注记。

---

## 一、完成定义逐项（验收口径：NN-check exit 0）

| 项 | 状态 | 可复跑证据 |
|---|---|---|
| T1 #58 manifest 契约链 | ✅ | `node .scratch/architecture-recovery/reports/41b-check.mjs` → PASS 33/33；`55-check` → 18/18；`44-check` → 56/56；`claude plugin validate --strict` 实跑干净；`claude --plugin-dir engine mcp list` → ✔ Connected；`engine/mcp.json` 退役（遮蔽机制根除），`.mcp.json` 入 npm pack `files[]`（pack 71 件） |
| T2 #63 陈旧守卫换代 | ✅ | `node .scratch/architecture-recovery/reports/xfail-run.mjs` → `XFAIL-RUN PASS（仅已登记 XFAIL 10 条，entries=10/10）`；33-check G 组 20/20；三负路实证：塞 XPASS/悬空/超 cap 条目各 exit 1 |
| T3 #64 duckdb 自愈 | ✅ | `node engine/test/duckdb-selfheal-offline.test.mjs` → 7/7；`64-check` → 14/14；E2E（挪绑定→真 npm 补拉→openWriter 读写）3/3；devDeps 保住（package-lock 分流禁 `--omit=dev`） |
| T4 #61 cue 表分层 | ✅ | `node engine/test/citation.test.mjs` → `CITATION-TEST-OK 38`（K1–K9）；`56-check` → 24/24（G2 hash `0628234f798bc569` 基线一致）；held-out 复跑 run_at 外零漂移；52a parity 22/22 |
| T5 #60 骨架升版机检 | ✅ | `node .scratch/architecture-recovery/reports/14-skeleton-check.mjs` → PASS＋`skeleton-contract-gate` 三方一致＋`semantic-flip not machine-checkable` 边界行；三 FAIL 负测 T1/T2/T3 各 EXIT1 |
| T6 #62 doctor 探测 | ✅ | `node engine/dist/cli.js doctor` → `{"doctor":"1.0.0","legs":[duckdb:ok,git:ok,upstream:ok],"overall":"ok"}` exit 0；`node engine/test/doctor.test.mjs` → 9/9 入 smoke |
| T7 #52b 待命 | ✅ 值守确认 | registry `narrative-eval-surface` status=pending（anchor `host-narrative-corpus` 未 occurred——触发即启口径保持） |
| T8 #41b 残余面 | ✅ 留痕 | `25-P4`/`25-D3` 各追加 `reviewed-stay-pending` 确认（marketplace.json 零图形资产实证，B 轨不授权） |
| T9 registry 44 项复核 | ✅ | `runtime-doctor-trigger` triggered-bound→decided＋discharged-decided（#62 消费收官，25-P1 先例同型）；其余触发器状态核验不变（xfail-second-track/claude-validate-promotion-watch/cue-table-extraction/duckdb 三复审均按各自事件值守）；stale-assertions 10 条与 t8-watch-review §3 归因核对一致 |
| T10 D-025 双读数 | ✅ | 本报告 §三 |

## 二、最终守卫面（全绿，exit 0）

```
33:20/20  41b:33/33  44:56/56  46:30/30  52a:22/22  53:25/25
54:20/20  55:18/18  56:24/24  64:14/14  14-skeleton:PASS
xfail-run: PASS（10/10 XFAIL 照跑零 skip）
npm test: exit 0（gen+build+smoke 全链，含 citation 38/doctor 9/selfheal-offline 7）
npm pack: 71 件（含 .mcp.json）
selftest: 5/5
```

## 三、D-025 勘误双读数（实测/账本双口径并存）

| 读数 | 实测口径 | 账本口径 | 处置 |
|---|---|---|---|
| 陈旧 FAIL 总数 | **21 条 / 8 守卫**（41a×4、43×1、45×2、50×2、t8×1、38×1、39×9、40×1） | 首批 9 条 / 5 守卫（D-071③ 票面） | 实测超票面：45-H5 系 r21 任务书重写后新破→作第 10 条注册恰满 cap=10；38/39/40 族 11 条（§3 已归因集）如实登记为 >cap 批量处置证据，清单制不膨胀 |
| D-072 平台包前提 | `@duckdb/node-bindings-win32-arm64` 在 optionalDeps 实存 | D-072③「win32-arm64 无官方包」 | 前提与实际有出入——按决策保留回落特例并在票面注记勘误（不失真前提下落实现） |
| cue 表 hash | `0628234f798bc569`（cleanup 前后一致） | —— | 顺带清等价性自证：判定语义零触碰 |

## 四、关键裁定/技术要点

1. **EN_NON_ASSERT_CUES 死表接线**（#61 核心修复非新增）：r18 起已声明未接入 `negationHits`——'pre-ctx'/'post-ctx' 死分支复活为 `non-asserted:*` flag 产出面。
2. **值必填 vs 必现轴差**（#60）：doc `fields[].required`=值必填轴、code `required_fields`=必现轴——`reproduce_absent_reason`/`degraded_note` 必现可 null；baseline 取必现轴，doc↔code 用子集规则（初版等值规则抓出的是轴差非缺陷）。
3. **ESM 失败缓存**（#64）：`import('@duckdb/node-api')` 失败后同 specifier retry 回投同一拒绝——retry 路径改 `createRequire` 实证绕开。
4. **`--omit=dev` 剪 devDeps 事故**：开发仓有 `package-lock.json` → 分流裸 `npm install`；插件 clone 无 lock → `--omit=dev` 保最小面。
5. **Windows `spawnSync npm.cmd EINVAL`**：.cmd 需 `shell:true`；git 为 .exe 直 spawn 无 shell（DEP0190 规避）。
6. **MCP stdio 输出纪律**：stdout=JSON-RPC NDJSON 行帧——自愈结构化事件 `DUCKDB-SELFHEAL` 走 stderr（env 避让）。

## 五、阻塞/遗留

- 无阻塞。`xfail-second-track-trigger`（输入面快照化治本第二轨）按 D-071⑤ 值守 pending——触发器面不膨胀。
- `claude-validate-promotion-watch` 维持 pending（advisory SKIP streak 值守，promotion 事件未至）。
- 25-P4/25-D3 listing 图形资产：B 轨创作不授权，stay pending（核对留痕已入 registry）。

## 六、lessons

- `but status` rename 探测会把「删除 + 新文件」配对成 rename——纯删除提交前须把同名族 scratch 挪出仓外。
- ctx 沙箱 node preload 损坏面：守卫一律走 exec 直跑（fs-preload 注入会污染子进程 node）。
- 长文件 `write` 回显截断是显示层错觉——以 `node --check`＋回读断言为准，不可凭回显判损坏。

## 七、引用清单

- 决策：`.scratch/macro-audit/decision-ledger.md` D-066/D-068/D-069/D-070/D-071/D-072/D-059③/D-065/D-058/D-037②⑤⑥/D-041/D-025
- 执行：`.scratch/architecture-recovery/decision-ledger.md` A-070~A-075
- 票面：`.scratch/architecture-recovery/BACKLOG.md` #58/#60/#61/#62/#63/#64（均已闭环注记）
- registry：`.scratch/architecture-recovery/reports/33-gate-registry.json`（44 项；runtime-doctor-trigger 已 decided）
- 调研：`.scratch/macro-audit/reports/R21-Q1-atomcode-research.md`、`R21-Q2-atomcode-research.md`

## 八、勘误批（轮22 T5，引 R21 审计 F1/F2/F3/F5/F6 发现项——原文读数保留，勘误成对落盘）

- **F1 pack 读数**：§二 T1 行＋§四 `npm pack: 71 件` 为陈旧读数——审计实测 **73 件**（#62 doctor.* 入 dist 后未复测；A-070「71 件持平」注记可溯源根因）。
- **F2 npm test 措辞**：§四「含 selfheal-offline 7」措辞失准——自愈两测试（duckdb-selfheal-offline/e2e）挂 engine-ci 独立腿，**不在** smoke 链；npm test 实链=gen+build+smoke 16 套件。
- **F3 册外读数**：§三「38/39/40 族 11 条」审计复测时已漂移为 **13**（38×2/39×10/40×1）；+2=38:H4（anysearch-cli 环境漂移）＋39:H6（next-round 换代锚点新破，与已入册 45-H5 同型）。册外 13 件处置→轮22 #65 sealed 分拣闭环（acceptance-probe-attestation.jsonl 15 行在档）。
- **F5 SKIP-STREAK CI 失明**：state.json 未跟踪致 CI 每轮复位——已闭环：D-077 采纳（MACRO_AUDIT_CI=1 环境分层＋INFO 第三披露态＋receipts.jsonl append-only＋promotion→manual_watch），validate-plugin.mjs 已分层落地。
- **F6 #60 FAIL2 机检边界**：`versionChanged` 只拦 desync——baseline 同步升版＋零字段 diff 的「升版忘改字段」三 FAIL 全逃逸（单快照 diff 先天不可见历史）——系设计边界非实现缺陷，账本已注边界（D-068 勘误注记）。

勘误时点=2026-09-18（轮22 T5 批量）；勘误依据=2026-09-18-r21-audit-report.md §五/§六。
