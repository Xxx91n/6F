# R40-T1 执行窗报告（D-158/D-159/D-160/D-161②④/D-162③⑤⑥）

日期：2026-09-28 ｜ 分支：`r40-t1-exec`（栈于 r40-closeout）｜ 提交：skt(B)→tml(A)→yms(C)→rus(E)→kny(生成物)

## 一、范围声明

本窗兑现 T1 实施批全量：D-158（F-A1 谓词收紧）、D-159（env-contract 六要件）、D-160（retired 建制）、D-161②④（三栏位 commit 形态，本批五个 commit 全部适用）、D-162③⑤⑥（暴露梯度登记）。T2 未触（临窗再裁）；T3 簿记面顺带（manual_watch 条目登记属 E 件本体）。

## 二、执行明细

### B 批（commit skt）—— D-159 env-contract 分层

- `_lib/env-contract.mjs` 新立：`GUARD_SIBLING_ROOT`（默认 `D:/Aworker`）＋ `siblingPath()`（`goose-duck-agent→eys` 映射内置，禁 sibling 清单进仓）＋ `envProbe()`（缺依赖→guardSkip）。
- `_lib/check-kit.mjs`：`GUARD_TIERS` 词表＋`guardSkip`/`guardDeclaredTier`/`guardDeclaredSurface` 原语。
- 60 件守卫自声明：57 `portable`＋3 `env-contract`（37/39/46）；`xfail-run.mjs` 声明形态修正。
- `guard-all-run.mjs`：`GUARD-RESULT: SKIP` 解析＋skipped 独立计数＋不进 allOk＋册件转 SKIP 只 WARN 不告警复活。
- `37/39/46-check.mjs`：envProbe 启动探测；sibling 在但漂移→方言披露（WARN 语义）不 FAIL。
- `01-check.mjs`：自指绝对路径→repo-relative（kr-01 env 缺陷面关账，语料红面维持）。
- 11 件非 check `.mjs` `D:/` 字面收敛（工具面不设门禁）；registry env-gated-guard-class 条目＋env-contract-tier-active 事件；CONTEXT env-contract 词条；CHANGELOG M-027。

### A 批（commit tml）—— D-158 F-A1 谓词收紧

- `check-kit` 增 `blankStrings()`（字符串/模板字面量遮罩保行号、`${}` 内递归）＋ `realConsumption()`（剥注释+剥串后仅认：import/require 具名引入 stripComments|stripMdComments、裸调用位 `stripComments(`/`stripMdComments(`；成员调用 `obj.stripComments(` 不豁免——具名 import 已覆盖正路）。
- `75a-check.mjs`：`unstrippedScanHit` 换 realConsumption；`fxStringNom` fixture（字符串提名必中，回滚即红）；S2 断言五因子扩。
- 41 件在册条目重跑分诊：零迁移零悬空，findings=389 前后不变——收紧不改现状面，纯防提名逃逸（ALIBI 两通道同堵兑现）。
- `75a-census-register.json` recheck_log 留痕；ADR-0024 执行注记；CHANGELOG M-028。

### C 批（commit yms）—— D-160 retired 建制

- `known-red-manifest.json` retired 类扩容（终态留档八要素：id/guard/protected_surface/tier/retired_at/era/reason/decision_ref/archive_path）＋ retired_policy 文本；`_retired/README.md` 建制落成（首件流程=面消亡提案经 T3 窗逐件呈报）。
- `75a` M3 断言（八要素齐备＋归档实物在＋原守卫出运行集；空类 vacuous 通过，schema 即机制本体）。
- D-094 划界注记成对落盘（红件三分类 vs 绿件面消亡正交，VACUOUS 普查双通道）；registry `guard-retirement-class`＋`retired-class-schema-active` 事件；CONTEXT retired 词条；CHANGELOG M-029。

### E 批（commit rus）—— D-162③⑤⑥ 暴露梯度登记

- registry `stage2-launch-criteria` manual_watch 判据包：四判据预声明（①capability 5/5＋D-031⑤ 重查义务 ②fresh clone 不红海=D-159 tier 操作性定义 ③GAP-HOST-01 关闭 ④无未分诊残留——D-162⑥ 措辞修正）＋30 日静默窗；`exposure-ladder-registered` 事件。
- Stage-0 被动挂牌追认（D-051 既有事实语义命名）＋Stage-1 逐案用户闸门不立机检（D-162⑤）记于 confirmations.reason；CONTEXT 暴露梯度词条；CHANGELOG M-030。

### 生成物（commit kny）

- `75a-census-findings.json` 再生（44-check ledger↔CHANGELOG 计数 ×24→×27 随四编年行）——D-140② 独立落账。

## 三、验证证据（命令＋输出摘要）

| 验证 | 命令 | 结果 |
| --- | --- | --- |
| 语法全扫 | `for f in *.mjs _lib/*.mjs; node --check` | all clean |
| 75a 主检 | `node 75a-check.mjs` | GUARD RESULT: PASS (14/14) findings=389 |
| 33 注册表 | `node 33-check.mjs` | PASS 31/31；68 项/47 事件；ALARM 1（存量 readme-ci-badge） |
| xfail | `node xfail-run.mjs` | XFAIL-RUN PASS entries=0/10 |
| env-contract 三件 | `node 37/39/46-check.mjs` | PASS 41/41、28/28、30/30 |
| skip 路径实证 | `GUARD_SIBLING_ROOT=D:/nonexistent-path-xyz node 37-check.mjs` | `GUARD-RESULT: SKIP 37-check reason=env-missing:sibling:...` exit 0 |
| known-red | `node 01-check.mjs` | FAIL 2（D1/D5——册内 kr-01 数据质量面，诚实保留） |
| 全量升格跑 | `node guard-all-run.mjs` | ran=60 green=59 skipped=0 red=1 registered=1 problems=0 allOk=true → GUARD-ALL-RESULT: PASS |
| 编译 | `engine> npm run build` | BUNDLE-OK dist/cli.js |
| 打包 drift | `engine> node scripts/check-dist.mjs` | DIST-RATCHET PASS 263151B/cap 289395B（margin 25.6KiB） |
| 进程测活 | `engine> npm run selftest` | `{"ok":true,checks 5/5 pass}` |
| F-A1 单测 | realConsumption 12 例（import/require/裸调/成员调/字符串/属性/注释/模板插值） | 11/12 通过；`s.stripComments(x)` 按 D-158 裸调用位定义不豁免=期望行为 |

## 四、遗留与风险

1. `01-check` D1/D5 红在册（kr-01 语料面数据质量，env 缺陷面本批已关账）。
2. `readme-ci-badge` ALARM 为存量（触发已发生未拍），非本批引入。
3. 工作树残留非本批改动（`48-micro-a-golden-*`、`56-heldout-eval.json`、`codebuddy-r38` 删除/未跟踪）——按并行 session 纪律未动。
4. Stage-2 判据包值守条目已入册待审计窗读数；Stage-1 首例 charter 未发生（机制在位、无被守护对象属正常态）。

## 五、本批事故与处置

- `a-stage-apply.cjs` 模板字面量内 `${}` 触发插值解析错误→改 `[^'"\n]*?from` 正则形态避开。
- `realConsumption` importForm 初版过宽（任意 import 豁免→389→348、C2 悬空 4 件）→收窄为 stripComments|stripMdComments 具名引入，389 还原、C2 复绿。
- GitButler libgit2 卡死根因=误创 `nul` 文件（bash `2>nul` 写真文件）→删后恢复，全仓 `find -name nul` 清零。
- 70-check E1 曾红（75a M3 增件致 63-inventory 漂移 13→14）→`update-70-inventory.mjs` 再生并入 C commit（yms amend），复绿 13/13。

## 六、交接要点

- T2 临窗裁定未触；T3 哨兵（manual_watch 三件复审＋GAP-B2B 八件读数）为下一审计窗本体。
- `GUARD_SIBLING_ROOT` 为 sibling 寻址唯一 SSOT；新增 env-contract 守卫须同窗更新 registry env-gated 项（75a-T3 强制）。
- 首件退役走 T3 窗逐件呈报（`guard-retirement-class` 登记项为通道非判据本体）。
- push/merge 未授权未执行；`r40-t1-exec` 栈于 r40-closeout，五个 commit 待审。
