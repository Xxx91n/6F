# #80 步③ benchmark 阈值预登记＋双仓试点回执

> 批次：轮36 T2（A-095）。制度：数值先实跑测定、再预登记锁票面——本文件即票面；实跑原始件=`D:\Aworker\6F\.scratch\macro-audit\audits\r36\bench-file-card.json`。

## 一、试点集（票面写「试点集」非覆盖面）

| 仓 | HEAD | 观测集事实数 | 形态角 | 证据 |
|---|---|---|---|---|
| jiahao | ba83908aa47666c3b93c3d2e8713afae5d264e62 | 1105 | 1-switch 成对件（hooks/jiahao-paths.js→src/shared/paths.js，R092） | `D:\Aworker\6F\.scratch\macro-audit\audits\r36\jiahao-facts.duckdb` |
| env-manager | 9eb8f24be508750f299e920d816ba9079771a3f1 | 680 | 2-hop 链（AuditCrypto.cs→src/AuditCrypto.cs→src/Audit/Crypto/AuditCrypto.cs，R100×2）＋成对件 | `D:\Aworker\6F\.scratch\macro-audit\audits\r36\env-manager-facts.duckdb` |

**同主偏差如实**：两试点仓均为本机同 maintainer 仓库（same-owner pilot set）——不构成跨维护者泛化证据，票面写「试点集」。

实跑回执（`node dist/cli.js audit file <repo> <path> --db <duckdb>`）：

- jiahao `src/shared/paths.js`：`card_type=file-audit-card`，`lineage.stitched_from=["hooks/jiahao-paths.js"]`（edge commit=175aff7 similarity=92），`cycle_detected=false`；旧名 `hooks/jiahao-paths.js` 查询→`miss.state=renamed_to`+`revalidated=true`（成对件双端兑现）。
- env-manager `src/Audit/Crypto/AuditCrypto.cs`：`stitched_from=["src/AuditCrypto.cs","AuditCrypto.cs"]`（BFS 近端先行两跳全解析），edges 双条披露；`AuditCrypto.cs` 查询→`renamed_to=src/AuditCrypto.cs`+`revalidated=false`（一跳诚实披露不直达末端——逐请求推进纪律实证）；`src/AuditCrypto.cs` 查询→`renamed_to=src/Audit/Crypto/AuditCrypto.cs`+`revalidated=true`（链末端触卡）。
- 旧名 era 行并入实测：两仓 upstream 均只按当前名发射 facet 行——`stitched_from` 解析祖先名在行级零并入情形照实披露（账本语义=解析名集，行并入量以 `subject_ref` 逐行可证）。

## 二、benchmark 预登记阈值（p95，ms）

| 档 | 事实行数界 | target | danger | 实测基线（p95） |
|---|---|---|---|---|
| small | <5k | 200 | 800 | jiahao=112.63（1105 行）/ env-manager=89.61（680 行） |
| medium | 5k~50k | 800 | 3000 | 合成 stress=41.35（20561 行＝20k facet+500 边+60 跳链+1） |
| large | >50k | 4000 | 12000 | （无实档——合成件按票面行数界归 medium） |

判读：verdict=target 当 p95≤target；acceptable 当 target<p95≤danger；danger=p95>danger → exit 1（机器可裁决）。测量面=projectFileCard 端到端（开库→选集→取行→缝合→建卡）实档＋buildFileCard 纯算 stress。**档界按观测集 Micro-B 事实行数**（A5 修复：DB 案实测 `COUNT(*)` 于选中 repo_ref、合成案按构造行数 tierOf 自动归属——早前误按卡内行数/硬写档名已纠）。冷启离群（max）不入判据——判据=p95 非 max；逐跑数值读 `audits/r36/bench-file-card.json`（host-load 噪声在容忍带内，读数以工件为准）。

复跑命令：`cd engine && env -u NODE_OPTIONS node scripts/bench-file-card.mjs --runs 30 --out ../.scratch/macro-audit/audits/r36/bench-file-card.json`

## 三、边界件盘点（0-switch 逐类点名＋1-switch 双端）

| 件 | 断言位 |
|---|---|
| never_collected | J1（MCP 缺库）＋G1 投影层 |
| not_tracked_at_sha | E3（pin 歧义）＋L6（pin 缺席）＋runAuditFile pin 路径 |
| not_applicable | L6（skip 事实判枝）＋D2 系列 |
| insufficient_history（failure_state 族） | C2（revisions<3→insufficient_history＋suppressed_by 留痕）＋L6 对照组实物断言 |
| renamed_to | D4/D5（同集边）＋L5（祖先集边跨集解析）＋L6 |
| 新名端缝合 | L1（1-switch 并入＋F10 回归）／L2（多跳两跳）／L3（环检测）／L4（注入缝跨集）／L5（真 DuckDB 端到端） |

FILE-CARD 32/32（L 组 6 断言新增后全绿），smoke 22 册全过。

## 四、披露件状态

- 能力矩阵措辞收窄：README.md Micro-B 行 Not yet in preview → capability 4 of 5 · preview（试点集=jiahao＋env-manager；advisory-only 结构性隔离在案）。
- preview_disclosure 四件套：audit.ts/demo.ts `not_in_preview` 去掉 Micro-B（file-card 面已交付）；报告头 capability_label 序列不变（Macro-B 报告面）。
- 卡 schema：file-card@v1 追加 `lineage` 账本块（additive——miss 卡 lineage=null；行级 subject_ref 溯源键 additive 于 facet_rows 条目）。
