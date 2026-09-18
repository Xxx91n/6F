# handoff — 轮 22 审计收口（R22 AUDIT → 修复窗返工）

> 生成：2026-09-18 审计窗（独立会话）。接续者读本文件＋审计报告即可接续。

## 现状

- **轮 22 执行（r22-impl-ledger，2 commit 未 push）已被审计**：硬验收 11 项中 10 项亲跑属实；实现与 D-073~D-078／BACKLOG #65~#68／A-076~A-080 逐条吻合；范围零蔓延；T6~T9 值守面无未授权动作。
- **审计判定：PASS-with-findings**——打回修复窗返工 **R1＋R2＋R3**；过程面 P1~P4 呈报用户裁。
- 审计报告：`D:\Aworker\6F\.scratch\macro-audit\reports\2026-09-18-r22-audit-report.md`（声明→证据→结论全表＋修复要求＋重跑清单，此处不重复内容只引用）。

## 修复窗待办（打回项，修完须重跑同一套验收）

| # | 项 | 修复要求 | 重跑清单 |
|---|---|---|---|
| R1 | `doctor --fix` 复载死路（doctor.ts:48-55 复载走 `import()` 同 specifier→Node ESM 失败缓存；实测绑定缺席面 heal success 但 leg=fail exit 1） | 复载改经 createRequire 验载通道（healDuckdbBinding 已内置验载）或回填 duckdbModulePromise；同进程 leg=ok | build＋offline（+新增 --fix 断言）＋e2e 3/3＋绑定缺席面 `doctor --fix` leg=ok exit 0＋64-check＋smoke＋doctor 三腿 |
| R2 | `xfail-run.mjs` `problems` use-before-declare（overlap 机检在 `const problems=[]` 前——触发日 ReferenceError 丢诊断） | 声明上移过检查点 | xfail-run exit 0＋守卫电池 12 件＋临时 overlap 注入验证 FAIL 行输出（验证后还原） |
| R3 | 报告 §二/§三＋A-076 需求栏枚举失真（锚 39/40、sealed slug 38/40/t8、active-8 t8:H3→实物 45:B5、枚举数 16≠15 行） | 按 attestation/stale-assertions 实物成对勘误（沿用 T5 惯例：原文保留＋勘误成对，不静默改写） | 33-check G5-G7＋引用一致性人工复核 |

## 用户裁定面（审计不追认）

- P1：`2026-09-18-report.md` 撞名覆盖轮 20 报告（git 可恢复；后续一律 `-rNN-` 后缀）。
- P2：39-F2 恒真断言漏网→下轮 sealed 判据扩「失效∨恒真不可证伪」候选。
- P3：`engine/package.json` 尾换行未提交 diff；48-*/56-* 金样脏树（=registry `golden-verifier-dirty-on-rerun` 在册现象）。
- P4：良性漂移——pack 785.5kB、commit_count 204、receipts 累积行数。

## 下一 grill 方向指示

1. **立 #69 返工票（P1 优先级）**：R1 修复＋--fix 面测试补齐（现测试矩阵恰缺「首探失败→heal→同进程复载」面）＋R2 序调＋R3 勘误批三件套合票或分票由 grill 裁。
2. ** grill 追问面**：doctor --fix 缺陷为何逃逸（测试矩阵盲区=同进程复载无人看守——补断言形制按 offline/e2e 双面惯例）；「增 doctor.bindings 检查项」字面未交——确认是 A-077 规范化顺延还是漏项；TTY 面 once-per-process 文档注记是否并入 R1 票。
3. **制度面候选**：sealed 判据扩「恒真不可证伪」族（39-F2 实证先例）——是否入 D-073 勘误注记或另立 D-079 由 grill 裁。
4. 值守面照旧：push 闸门未动（r19/r21 closeout＋r21 栈＋r22-impl-ledger＋本审计分支 r22-audit 全停闸门）；#52b 待命锚未触发。

## Suggested skills

- `$implement`＋`$tdd`：R1/R2 修复票——预声明判据先行（同进程 leg=ok＋overlap FAIL 行如实输出），负路测试=绑定缺席面 --fix 实测。
- `$code-review`：修复完成后对返工 diff 复评双轴（重点：复载通道与自家 A-072 约束一致性）。
- `$handoff`：次轮收尾同规程再生。
- `gitbutler`：一切版本控制写操作——修复窗继续在 `r22-impl-ledger`（或新票分支）上提交；审计产物已在 `r22-audit` 分支独立 commit，互不干扰；不 push 除非用户明示。

## 关键路径

- 审计报告：`D:\Aworker\6F\.scratch\macro-audit\reports\2026-09-18-r22-audit-report.md`
- 审计证据包：`D:\Aworker\6F\engine\.code-tmp\audit-r22-verify\`（audit 输出＋r22-src.diff，未跟踪）
- 任务书：`D:\Aworker\6F\.scratch\macro-audit\handoffs\next-round.md`（轮 22 常驻，T0~T5 已闭环行在）；被审执行报告 `…\reports\2026-09-18-report.md`
- 账本：`D:\Aworker\6F\.scratch\macro-audit\decision-ledger.md`（D-073~D-078）；`D:\Aworker\6F\.scratch\architecture-recovery\decision-ledger.md`（R13 A-076~A-080）