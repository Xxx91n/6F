# 轮 38 实施窗执行报告（r38-impl 批2-α）

- 日期：2026-09-27；窗型=实施窗（T1 记录侧前置＋T2 #75批2 首片实修）
- 栈：`r38-batch2-a`（stacked above `r38-closeout`——ledger/CHANGELOG 同文件改动故，GB 提示后叠栈）三 commit：`0bfa2b46` fix / `601384bc` chore / `67c79dac` docs；未 push
- 常驻任务书：`.scratch/macro-audit/handoffs/next-round.md`（T1=CodeBuddy 试用〔宿主操作=用户驱动面〕；T2=#75批2 首片；T3=关窗后事项未动）

## 1. 验收标准逐项（用户原文照录+实测）

| 验收项 | 原文 | 实测命令 | 输出摘要 |
|---|---|---|---|
| 编译 | 编译通过 | `cd engine && npm run build` | `BUNDLE-OK dist/cli.js`（tsc+esbuild 双段） |
| 打包 | 打包通过 | `cd engine && npm pack --dry-run` | `macro-audit-0.1.0.tgz` 85 件 255.4kB |
| 启动测活 | 启动并测活软件进程 | `node engine/dist/cli.js selftest` | `{"ok":true}` 5/5（manifest/shells=4/mode 单值/mcp read-only/receipt 5 字段） |
| test 闭环 | 每个平台都要有 test 闭环 | `cd engine && npm run smoke`（22 册） | 全绿 exit 0：SMOKE 6/6・collectors 14/14・codelore 7/7+41/41+25/25・micro-b 18/18・report-preview 5/5・intake 40/40・gitcli 11/11・sql-literal 17/17・mcp-db 12/12・audit 26/26・demo 38・doctor 9・quarantine 58/58・audit-zero-write 4/4・dialect 19/19・file-card 36/36 |
| dist 棘轮 | （仓内前置） | `node engine/scripts/check-dist.mjs` | `DIST-RATCHET PASS` 263151B / cap 289395B |
| engine 零触 | （本窗改面全在 .scratch/） | `git status --short engine/` | 0 行——engine/src+dist 未触（check-dist 义务对 commit 无涉，基线已复验如上） |

## 2. T1（CodeBuddy 试用）记录侧落地

| 件 | 命令 | 读数 |
|---|---|---|
| session 骨架 | 落盘 `D:\Aworker\6F\.scratch\macro-audit\trials\codebuddy-r38-session.md` | 5680B 无 BOM 尾行 NL；环境快照预填+判据读数格 pending+五要素 findings 票面 |
| 环境快照实测 | `git -C D:\Aworker\env-manager rev-parse HEAD` | `9eb8f24be508750f299e920d816ba9079771a3f1`（与 charter pin `9eb8f24b` 前缀一致→C2 目标仓在场） |
| README 基线漂移披露 | charter pin `sha256:7d9e8e96aedd8ac1`（README@456c845e）vs 当前 HEAD 面 `96a3d0a66f6c9f72` | 差=r38 收口 commit `2d63c7c2` 依 D-150④ 注记义务②加的宿主兼容注记两行——已按披露口径入 session 档（C1 判读仍以 pinned 基线为准） |
| 宿主会话三判据 | —— | **not-run（用户驱动面，待试用会话回填）**：C1/C2/C3+三悬点全标 pending 格，无杜撰读数 |

## 3. T2 批2-α：r37 呈报七件实修（全部闭环）

| 呈报件 | 修法 | 复跑证据 |
|---|---|---|
| 38-F2 枚举收窄 | `support` 改钉枚举域 `['supports','insufficient']`（源=citation.ts `output_states`） | `node .scratch/.../38-check.mjs` → 34/34；工件 distinct 值实测={supports,insufficient} |
| 25-C5a 末格盲区 | 新增 C5c：末格走显式豁免登记制（`LAST_CELL_EXEMPT` 当前唯一=`R3 收口 push 已执行`），登记外命中=FAIL | `25-check.mjs` → 35/35（PASS C5c last-cell ... outside exemption register: []） |
| 37-C2 欠数不可检出 | 新增 C2b：`git log r.head --committer=noreply@github.com` 快照界全集 ⊆ 存档集——欠数可检出且防活仓增长漂移 | `37-check.mjs` → 41/41（C2b-env-manager reachable=12 stored=20 missing=0；C2b-jiahao 6=6；C2b-anysearch-cli 空集→NOTE 诚实缺席不计件） |
| 20-A5 剥离面 | 本地裸 `//` 剥离器退役→`_lib/check-kit.mjs` stripComments（块注+字符串保护）自消费 | `20-fact-schema-check.mjs` → 28/28（A5 rewriteTokensInFacade=[]） |
| 26/28/30 机件重复 | `git log --grep`+`show --name-only` 触及面机件收编 check-kit（commitsByGrep/touchedPaths/pathsTouchedBy/gitOut）＋freeze-SHA 前缀比对同源（lastChangeSha）；统一 argv+`-c core.quotePath=false` | `26-check.mjs`→18 pass；`28-check.mjs`→PASS；`30-check.mjs`→10 pass |
| manifest 笔误 | `三分位`→`三分类`（全档 grep 唯一处） | `75a-check.mjs` M1 PASS（policy 句校验不受影响） |
| 01-spotcheck 尾行 | blob 补尾行 NL＋生成器 `+ '\n'` 同步防再生回潮 | `tail -c 20 01-spotcheck.json` 尾字节 `0a`；01-check 读面不受影响（JSON.parse 宽容） |

## 4. 收口判据复跑（升格后口径）

| 项 | 命令 | 读数 |
|---|---|---|
| 守卫组全量 | `node .scratch/architecture-recovery/reports/guard-all-run.mjs` | **GUARD-ALL-RESULT: PASS**——ran=60 red=1（01-check.kr-01 册内，slugs=D1,D5 与 expected 吻合）problems=0 |
| 普查对账 | `node .scratch/.../75a-check.mjs` | 9/9 PASS findings=348（C1 全归因/C2 零悬空——七件实修零新增零消除普查项） |
| 中途红处置 | `node .scratch/.../70-check.mjs` | E1 断言库存账对账红（25:22→23、37:22→23 为新增断言面）→`update-70-inventory.mjs` 再生→13/13 PASS；库存账=生成物入 chore commit（独立） |
| NUL/BOM | `grep -rlP \x00`＋`head -c3` BOM 嗅探（全改动面 12 件） | NUL=0，BOM=0 |
| 账行↔编年 | A-099（arch ledger）↔M-023（仓根 CHANGELOG）同 docs commit `67c79dac` | 41a-D7b 覆盖集校验含 D-094/D-150⑤/D-152③ 既有面 |

## 5. 未决/移交项（如实声明）

- **T1 宿主试用三判据全 pending**——CodeBuddy 安装链/效果/disclosure 读数属用户驱动面，session 档读数格待回填；env-manager 在场故 C2 可跑窗口开放（目标 SHA 已实测在场）。
- **批2-β 裁定候选**：探测面硬化五项（unstrippedScanHit 注释提名豁免/multi-hit 收 includes·test 且漏 macro-audit 面/SCAN_EXEMPT 不可达项+75a-S1 自指恒真/75a 写工件语义/41a 手写解析器+guard-all-run slug 正则耦合）——登记于 75b-disposition-draft.md §3，未机械推进（改探测面属裁定链）。
- **票面批2（BACKLOG #75 原文=枚举 open/closed 建制）未动**——75b §4 明示留独立建制批。
- **348 条存量轨道**：multi-hit 76→Track C 点级锚改造（建议批3 先试 ~10 件同字面值簇）；existence-assert 115→Track D 升格挑件；legit-literal 104→Track A 保留；unstripped-scan 41→Track B 存量冻结约定生效中。

## 6. 口径披露

- 本窗所有守卫文件改动均走 ctx_execute（Node fs splice+锚校验），回读字节断言过；零 NUL/BOM。
- `git show 0bfa2b46` diff 逐 hunk 自审过（ponytail 同型全扫）——断言名/注释携 R38/#75批2 标引可溯。
- r37 审计再生残留簿记态 13 件（48-golden×11/56-heldout/75a-findings）按其 §6 处置建议收编入 chore commit；63-inventory 再生同入。

