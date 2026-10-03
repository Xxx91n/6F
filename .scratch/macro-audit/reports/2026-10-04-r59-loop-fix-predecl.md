# R59 LOOP 返修预声明包（D-177：探测面语义修——守卫断言新增，跑前声明）

- 窗口：2026-10-04；驱动＝R59 LOOP 审计 CONDITIONAL FAIL（reports/2026-10-04-r59-loop-audit-report.md §3 LOOP-1/LOOP-3、§6 A-1/A-2）。
- 分支：r57-t1-exec 续作；本包覆盖三件——85-check C 组语料钉快照改造＋mkdtemp 残渣面收口＋执行器预算上调。

## §1 变更面（封闭清单）

1. **85-check.mjs C 组——语料钉快照（消 TOCTOU）**：进入 C 组即对 anysearch-cli 活仓 `rev-parse HEAD` 钉取 SRC_HEAD；`git clone` 至 OS temp 后 `checkout SRC_HEAD` 生成冻结面 AS_PIN；engine 实跑 input、oracle gitO／adrDir／deferRegistry 全部改指 AS_PIN。断言集 C-INV/C1~C6 语义零修改；**新增 C0 断言（§2）**。tmpC 落点 reports/ → os.tmpdir()。
2. **85-check.mjs B 组**：tmpB 落点 reports/ → os.tmpdir()（LOOP-3 残渣类根消，断言零改动）。
3. **86-check.mjs B 组**：tmpB 同迁 os.tmpdir()（同类残渣面，原 T3 候选同窗兑现，断言零改动）。
4. **guard-all-run.mjs**：TIMEOUT_MS 600000→900000（A-1 附带项——R59 实测 85-check 单跑 286/393/521s，600s 上限占用达 87%，CI 高载有 rc=124 风险；执行器运维常数非断言语义，D-149④ 同型登记）。

## §2 新增断言（跑前声明命中方向）

| 断言 | 语义 | 预期方向 |
|---|---|---|
| C0 语料钉快照一致：clone HEAD＝＝钉取 SRC_HEAD（TOCTOU 消除不变式） | clone＋checkout SRC_HEAD 后 AS_PIN 侧 rev-parse 必等于 SRC_HEAD；不等＝钉快照失败，其后对账无意义 | 命中方向＝红（钉失败必检出）；常态＝绿 |

- 断言计数：26→27（PASS 27/27 为全绿新基线）。
- 负向声明：本改造不削弱既有断言——C1 head_sha 对账在冻结面上仍由 engine 解 HEAD 与 oracle rev-parse 两侧独立产生；语料活性由 SRC_HEAD 钉取时点承担（每次运行钉取当下 HEAD，非硬编码存档——「活语料非存档等值」原旨保留，仅消除同进程两次读之间的时间窗）。
- clone 源为本地路径全量克隆（非 shallow——engine intake 拒浅克隆面不受影响）；对 sibling 仓保持零写入（D-074），clone 只读源仓对象。

## §3 探测面/census 影响声明

- 新增/改动行经 75a 探测核预判：无 `.indexOf(/includes(/test(` ≥20 字符新字面量；无 ASSERT_CALL＋数字比较（magic-floor）；无新 existsSync 断言（existence-assert）；无日期字面量／短 SHA 钉新产出。**预期 census 增量＝0**——若 75a 实跑产出新检出，须先归因登记再提交（D-094①）。
- 文书面唯一避险项：bundle 体积常数字面量不在任何新增文本复现（账本现 1 命中，再写即复活已摘除的 82-check 钉）。

## §4 验收命令集（同 R59 审计 §6 复跑基线）

- `node .scratch/architecture-recovery/reports/85-check.mjs` ×3 连续——期望三连 PASS 27/27（flake 修复证据＝确定性连绿）。
- `node .scratch/architecture-recovery/reports/guard-all-run.mjs`——期望 ran=65 green=65 allOk=true。
- 钉件：75a（findings=400 预期）／33／41a／84／86 全绿。
- 验收电池八项：build／pack／selftest／doctor／npm test／check-dist／Macro-C 独立实跑——同审计 §6 口径。
