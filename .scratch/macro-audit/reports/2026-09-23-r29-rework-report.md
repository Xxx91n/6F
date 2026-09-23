# 2026-09-23 轮29 T2 返工报告 —— #78 quarantine 建制（r29 审计打回 R1~R8 修复批）

> 修复窗位：原 B 窗续跑（分支 r29-78-quarantine，base commit 59f72e9）。
> 打回依据：`.scratch/macro-audit/reports/2026-09-23-r29-audit-report.md` §四 F1~F11＋§六 R1~R8。
> 方法：逐条对裁决原文二次核对（弱化款按子款落地非按大意）；F4 待裁项取裁定①并账本留痕。

## 一、阻断级修复（R1~R4）声明 → 证据

| 项 | 修复声明 | 可复跑证据 |
| --- | --- | --- |
| R1 编年 | M-006 a_range 勘误至 A-090（含勘误注记）＋补 M-007 编年行（#78 实施闭环+A-090 事由） | `node .scratch/architecture-recovery/reports/41a-check.mjs` → PASS 38/38 exit 0（原 FAIL D6） |
| R2 39 等位 catch | 39-macro-b-one-shot.mjs 顶层 try/catch 包体：协议崩→Q.crashArtifactFromError/buildCrashArtifact 落 `39-crash-<code>.json`（OUTDIR）＋stderr 结构化 JSON；exit 2（协议）/4（其余） | `node .scratch/architecture-recovery/reports/78-check.mjs` F2/F2b PASS：病态仓 exit 2＋工件 schema=v1+error_code=GITCLI-OUTPUT-CONTRACT |
| R3 env 双腿 | cli：`--strict-quarantine`/`--no-strict-quarantine` flag 显式给者胜、未给→`MACRO_AUDIT_STRICT_QUARANTINE=1` 兜底（strictQuarantineEnabled 单点）；39：env 读取＋stderr `strict_quarantine` 回声（对照物无 quarantine 桶——strict 语义在其侧恒真，env 进证据面） | QUARANTINE G21/G22：env=1 无 flag→exit 3；env=1＋--no-strict-quarantine→exit 0（precedence 双向实证）；78-check F2c：39 stderr 回声 true |
| R4 F4 裁定 | 取审计三选一之①：workflow 对「exit 2＋39-crash 工件在」判绿（预期分歧格证据先行）；其余非零/崩无工件=真红。三查 verify 步 rc==0 条件化＋新增 expected-divergence 工件 schema 校验步 | `.github/workflows/macro-b-regression.yml` 实物：oneshot id 捕获 rc→红/绿分支；裁定留痕 architecture-recovery/decision-ledger.md A-090 R29-REWORK 注记 |

## 二、弱化项修复（R5~R8）声明 → 证据

| 项 | 修复声明 | 证据 |
| --- | --- | --- |
| R5 D-115① 事务粒度 | 运行末单事务→逐 commit 事务循环：facts 按 subject_ref∈commit_sha 集分组与该 commit quarantine 事件同事务；非 commit 粒度 facts 走 500/批节拍批（FACT_WRITE_BATCH）；孤儿事件随末批；逐 commit 增量断言=库内 (run_id,sha) COUNT=本批事件数（D-116① 第一层就位，报告前全量断言不动=第二层） | audit.ts §8 重写实物；78-check C11 pin；QUARANTINE 58/58 全绿（含 G10/G14 幂等/锚病态回归） |
| R5b D-115③ 分流 | store.ts `classifyWriteError`（IO Error/disk/lock/readonly/ENOSPC/EBUSY/EPERM 正则）→ AuditIoError（code=AUDIT-IO-FAILURE）→ cli exit 4 独立类；约束类仍 QUARANTINE-CONSTRAINT 协议崩 exit 2 | 78-check C8 pin 三面（store 类/audit 接线/cli EXIT_IO_FAILURE） |
| R6 D-116② 守卫两件 | 78-check.mjs 头 `load-bearing:` 承载性标注；挂 engine-ci.yml（build 后独立步） | 78-check.mjs:2 实物＋engine-ci.yml 新步实物 |
| R7 D-109② schema 欠项 | CrashContext+{head_date,collector}；CrashCounts+{records_parsed,clean,normalized,quarantined}；countsFromStats() 单点快照（各崩溃点禁手拼 partial） | 78-check C12 pin；G17 工件 schema 断言仍绿 |
| R8 D-117②/108④ | `RAW_ECHO_CAP=80`＋`rawEcho()` 谓词单点导出（audit.ts×2/demo.ts×1 消费零裸字面量）；IntakeHealth.recorded_at 字段＋报告节「NULL=锚病态时点不可得（非开放式缺省）」显式行＋MCP 工具描述同款文案 | 78-check C10/C13 pin；golden 重基线后 DEMO O2 逐字节绿 |
| F10 D-110③ 棘轮 | `ratchetIssues()`：基线码在当前运行 quarantined 观测码集缺席→滞留红（strict 闸并入 violations） | 78-check C9 pin；源码注释引 D-110③ hawk/Betterer 同构 |

## 三、O 系顺带修复（判断级酌处项中可低风险落地者）

- O1 macro-b.ts `%s` 探针收进 GIT-PROBE-FAILED 协议桶（原裸抛绕过崩溃通道）。
- O4 protocolCrashError 词表校验（词表外 code→响亮 Error 禁静默降级）＋strictQuarantineViolations 去重＋strict 崩 firstEv 取首个违例事件（原取首个 quarantined）。
- O5 锚病态时 audit-facts.jsonl 镜像库面写零行（消除「文件全量/库零行」split-brain；measurements facts_persisted=false 明示）。
- O9 cli 崩溃工件注释误引 D-107②→D-109①；退出码魔数→EXIT_PROTOCOL_CRASH/EXIT_STRICT_GATE/EXIT_IO_FAILURE 命名常量。
- 留档不办：O2（IntakeHealth 双写——抽 buildIntakeHealth 属风格取舍）、O6（对照物产出面形状变化已由 53-check 豁免集吸收）、O7（parity 枚举格「不同值」严格化——当前 fixture 触不到，留待立法）、O8（63 清单 28→42 计数已 regen 对账）。

## 四、同套重跑验收（复跑清单全过）

| 项 | 命令 | 结果 |
| --- | --- | --- |
| 编译 | `npx tsc --noEmit`（engine/） | exit 0 零输出 |
| 构建 | `npm run build` | BUNDLE-OK dist/cli.js |
| 打包 | `npm pack --dry-run` | macro-audit-0.1.0.tgz 77 件 |
| 测活 | `node dist/cli.js --version`/`selftest`/`doctor`/`mcp` | --version JSON ok；selftest ok:true 5/5；doctor 四腿 ok；mcp init+tools=[facts,quarantine] |
| 测试 | `npm test` | 19 册全绿（QUARANTINE 58/58——G21/G22 env 双腿新增） |
| 对账守卫 | `node .scratch/architecture-recovery/reports/78-check.mjs` | 78CHECK 42/42（F2b 39 工件实物+F2c env 回声新断言） |
| 守卫组 | 33/39/41a/43/44/45/53/54/70/71/72/73/77/78＋t8/t9＋xfail-run | 全绿——**41a 38/38 复绿**（首报时点快照失实已勘误） |

## 五、过程违规整改回执

1. 虚报绿灯：本批已按「成对勘误」在 exec 报告 §七 落勘误节＋BACKLOG #78 状态格勘误注记（原文保留）。
2. 验收口径静默替换：F4 经审计三选一呈报后取①，账本留痕（A-090 R29-REWORK 注记），不再静默。
3. 弱化未呈报：D-115① 措辞失实已在勘误节如实更正，实现面按裁决原粒度补齐（非仅更正措辞）。

## 六、交付物清单

- 源码：engine/src/{intake/quarantine,fact/store,audit/{macro-b,audit},report/generate,cli,mcp-server,demo/demo}.ts
- 脚本：.scratch/architecture-recovery/reports/{39-macro-b-one-shot.mjs（等位 catch+env）,78-check.mjs（load-bearing+12 新断言）}
- CI：.github/workflows/{macro-b-regression.yml（expected-divergence 判绿）,engine-ci.yml（78-check 挂载）}
- 账册：CHANGELOG M-006 勘误+M-007；architecture-recovery/decision-ledger.md A-090 注记；BACKLOG #78 勘误；WORKFLOW §4 教训行；exec 报告 §七 勘误节
- golden：engine/fixtures/golden/* 重基线（recorded_at 行新增）＋dist/* 重建
