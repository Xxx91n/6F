# 轮 37 T1 返工报告 —— F1 单点窄修（23-P2 短 SHA 字面钉）

- 日期：2026-09-27
- 裁定源：`D:\Aworker\6F\.scratch\macro-audit\reports\2026-09-27-r37-audit-report.md`（打回窄返工，唯一阻塞项 F1）
- 账本行：A-098；编年：M-021
- 裁定要点回顾：交付实质扎实、12 件三分类逐件实物吻合、过程零违规；唯一阻塞=`guard-all-run.mjs` 复跑 `red=2 problems=1`（册外新红 23-first-report-check P2）。判「报告时点属实、现状漂移」——D-094(b) 合法漂移+短 SHA 字面钉脆性；升格机制正确拦下新红。

## 1. F1 根因

`23-gates.json` 的 `t22_prereg_commit` 钉为 7 位短 SHA `7395495`；`23-check.mjs` P2 断言用 `git log --format=%h` 与钉做**等值比对**。git auto-abbrev 按对象库规模求最短唯一前缀——本轮新对象进入使前缀 7→8 跳变，`%h` 出 `73954956` ≠ 钉 `7395495`。钉的本义是「该 commit 存在且为预声明者」，与显示宽度无关——等值写法把它耦上了缩写宽度。

## 2. 修复（改断言，D-094(b)）

`D:\Aworker\6F\.scratch\architecture-recovery\reports\23-first-report-check.mjs`：

- `--format=%h` → `--format=%H`（40-hex 全锚）；
- `preregCommit === gates.preflight.t22_prereg_commit` → `preregCommit.startsWith(gates.preflight.t22_prereg_commit)`（前缀等值：钉=commit 存在性非显示宽度）；
- 断言上方加 R37 返工注记行（D-094(b) 溯源）。

## 3. 同族残余普查（审计要求顺手排）

全 reports/ `*-check.mjs` 扫 `%h` / `--short` / `--abbrev` / `slice(0,[4-8])` / `substr*` 断言面：

- `%h`/`--short`/`--abbrev` 断言位：**零残余**（唯一命中即本次修复位）。
- `slice(0,7|8)` 命中均为 detail 打印面（37/39-check 的 `r.head.slice(0,8)` 等——输出文本非断言谓词）或数组截取（16/53/70/71/73 等），不构成钉。
- 41a `slice(0,4)` 取 `'ADR-####'` 前缀、75a `sha8()` 为本地键哈希——均非 git 短 SHA 钉。

## 4. 防回归（批2+ 立项先行半件）

`75a-check.mjs` 增 `short-sha-pin` 检出族：`--format=%h` / `'--short'` / `--abbrev` 在剥注释源码中出现即登记项；C4 正对照扩为六族注入必抓。当前活体命中=0（修复后净面）。

## 5. 九项验收复跑（审计 §7 清单）

| 项 | 结果 |
|---|---|
| `npm run build` | tsc 0 + BUNDLE-OK dist/cli.js |
| `node scripts/check-dist.mjs` | DIST-RATCHET PASS 263151B/289395B（dist 零漂） |
| `npm run package` | macro-audit-0.1.0.tgz 85 件 |
| `npm run selftest` | 5/5 ok:true |
| MCP stdio | initialize ok + tools=[facts,quarantine,file_card] |
| `npm run smoke` | 349 PASS / 0 FAIL |
| `75a-check.mjs` | 9/9 PASS（findings=348 全归因，C4 六族正对照过） |
| NUL/BOM/tailNL | 23-check/75a 嗅探净（nul=0 bom=0 tailNL=1） |
| `guard-all-run.mjs` | **GUARD-ALL-RESULT: PASS**——ran=60 red=1 registered=1 problems=0（红集={01}⊆册） |

## 6. 结论

F1 核销：收口闸门复绿。升格判据在审计复跑中完成首次实战拦截（机制有效性的天然实证）。修复分层提交：语义（23/75a）＋生成物再生（守卫实跑工件）＋文档账本（A-098/M-021/本报告/handoff 追记）——均落 `r37-t1-75b1`，未 push。
