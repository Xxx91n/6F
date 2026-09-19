# Handoff — 轮 22 全量执行（2026-09-18 · T0~T5 闭环 · 分支 r22-impl-ledger · 未 push）

## Goal

任务书 `D:\Aworker\6F\.scratch\macro-audit\handoffs\next-round.md` 轮 22 常驻任务书 T0~T9 依序执行：BACKLOG #65~#68 四票实装闭环＋T5 文档勘误批＋值守复核。本会话 T0~T5 全部落地，T6~T9 值守面无翻转。终报 `D:\Aworker\6F\.scratch\macro-audit\reports\2026-09-18-r22-exec-report.md`（r22 审计 P1：同日撞名覆盖轮 20 报告——已循 -rNN- 后缀先例改名＋恢复原物）。

## Accomplished（本轮已落地，勿重做）

1. **#65 册外陈旧断言批量分拣**（A-076 / D-073/D-074/D-071③注）：`acceptance-probe-attestation.jsonl` **15 行**（ap-\<guard\>-\<slug\> 双锚 fired_at+last_fired_commit）；38/39/41a/50/t8 五守卫 `sealed()` 发射器＋头部机检标记；`xfail-run.mjs` SEALED 顶显＋排除执行集＋不占 cap=10；`stale-assertions.json` active 8 条照跑；33-check G5/G6/G7 闭包（sealed↔attestation 数等／零交集零复活／字段锚迁移齐备）；`engine/test/audit-zero-write.test.mjs` fixture（mkdtemp 玩具仓 4/4）挂 smoke 第 17 件——`SEALED: 15 / XFAIL: 8 (cap 10)`。
2. **#66 duckdb 自愈按面分层**（A-077 / D-075 承接 D-072 revised）：`duckdbSurface()` 三面（MCP env／isTTY／CI 非 TTY）；CLI 交互面自动自愈保留（stderr 预告 40MB/240s 可中断）；**MCP/CI 永不自动拉包**→四段披露（缺失原因→`doctor --fix`/`npm install --omit=dev`→能力边界→`MACRO_AUDIT_SELFHEAL=1` opt-in 阻塞 JSON-RPC ≤240s）；`healDuckdbBinding()`＋`doctor --fix` 主路；F4 pin r.4→**r.5**＋`NO_OFFICIAL_BINDINGS` 摘除（win32-arm64@r.5 npm 实证）／F7 registry 走 `npm config get registry`／F8 emitSelfHeal 全 stderr＋success 移 createRequire 后／F9 消解存档；win32 npm 经 `cmd.exe /d /s /c`（Node24 .cmd EINVAL＋DEP0190 两避）；offline 13/13＋e2e 3/3＋64-check 15/15＋pack 73 件。
3. **#67 SKIP-STREAK 环境分层**（A-078 / D-077/D-066③⑥注）：`MACRO_AUDIT_CI=1`（engine-ci validate 步注入）→`INFO(claude-validate): cli-absent-expected` 第三披露态（neutral 不计 WARN/不 streak/不升格）；本地面 SKIP+streak 收窄「本地异常缺席」；state.json `mode:"local-observation-only"`；`claude-validate-receipts.jsonl` append-only 每跑一行；promotion-watch→manual_watch（整理环节已落）；34-check G19c 源级断言；三面实测全过。
4. **#68 upstream→dimension 映射表**（A-079 / D-078）：`docs/upstream-dimension-map.md` v0.1 五节（github-rest 6 行＋codelore 6 族＋准入条件列 LFX 式＋rate_limit 永久排除＋双挂待裁＋复审两字段）；descriptor `dimension:null` 保留＋注释指针×2；44-check A14/A15/A16 三钉（上游文件无 S1-S5 字样／null+指针／文档骨架齐）→ 59/59。
5. **T5 勘误批**（A-080）：exec 报告 §八（pack **73** 非 71／npm test 措辞收窄 selfheal 挂 CI 腿／册外 **13** 非 11／F5→D-077 闭环指针／F6 边界）；账本 D-068 FAIL2 机检边界第三枚注记；xfail-run dead store（crashed）摘除；judgement 项票面登记（重复断言表驱动化挂追问／detect-libc→ldd 披露在案）。
6. **账面三处**：A-ledger R13 节 A-076~A-080 五行；BACKLOG #65~#68 ✅ 注记；next-round.md「轮 22 执行留痕」进度块（T0~T5 ✅＋验收真值行）。

## Discoveries / 如实披露

- **`spawnSync('npm.cmd')` Node≥24 EINVAL**（CVE-2024-27980 硬化）——win32 调 npm 须 `cmd.exe /d /s /c npm` 显式包装；`shell:true` 则触发 DEP0190。
- **npm install 默认写 `^` 前缀**——pin 纪律仓须回写精确值并同步 package-lock spec（本轮 r.5 三方同值手修过）。
- **e2e/CI 测试面=非 TTY**：D-075 分层下 spawnSync 管道面须 `MACRO_AUDIT_SELFHEAL=1` opt-in 才触发自愈——测试 env 注入是分层语义的直接表达非绕行。
- **值守 pending 项无翻转**：xfail-second-track-trigger(bound=#65)／promotion-watch(manual)／duckdb 三复审／D-076 四触发器／#52b host-narrative-corpus／25-P4/25-D3 listing（B 轨不授权）。
- **push 未授权**：r22-impl-ledger 留本地——「全部授权」级指令未至，PR/push 停用户闸门（r19/r21 closeout＋r21 六分支栈同样挂闸）。

## Remaining（下轮候选面）

| 项 | 内容 | 依赖/注意 |
|---|---|---|
| 接线票 | COLLECTOR_DESCRIPTORS 注册＋Macro-B 消费归位 | 以 `docs/upstream-dimension-map.md` PR 合入为票间依赖（D-078⑤） |
| 追问留票 | D-075 opt-in doctor 回显／D-077 receipts↔attestation 同 schema／版本窗机检锚=CHANGELOG M 条目／D-078 落点并面＋Bot S5 vs S4＋LFX 权重列＋#47 九类事实复核＋ADR-0020 复读 | 账本已登记 |
| judgement 项 | 34-check G15-G17/41b A8-A10 同族断言表驱动化；detect-libc 评估 | 重构风险>收益暂留票面 |
| #52b | host-narrative-corpus 锚未触发 | 触发即启 |
| 真机 MCP 面分层验收 | `mcp` 子进程内缺绑定→四段披露 isError 实测 | 需挪绑定包跑 MCP stdio 握手——本轮以非 TTY 面等价验证 |

## Instructions / 环境

- 分支：`r22-impl-ledger`（GitButler）；r19/r21 closeout＋r21 六分支栈并行共存未 push。
- 验证入口：`node .scratch/architecture-recovery/reports/NN-check.mjs`（exit 0=过）；`cd engine && npm run build && npm test`；`node dist/cli.js doctor [--fix]`；`node test/duckdb-selfheal-{offline,e2e}.test.mjs`。
- 写入纪律：Node.js `fs`＋回读断言＋禁 BOM；守卫走 exec 直跑（ctx 沙箱 preload 污染子进程教训）；**含反引号/多行文本的补丁写 .cjs 文件再跑**（node -e 遇 bash 双引号会吞模板字面量）。
- 版本控制：`but` 全写操作；不 push 除非用户明示。
- Suggested skills for next round：atomcode-research（新票调研先行）／implement＋tdd（代码票）／handoff（收口）／gitbutler（栈维护）。
