# R59 LOOP 返修执行报告（第二轮返修——执行窗）

- 窗口：2026-10-04；驱动＝R59 LOOP 审计 CONDITIONAL FAIL（reports/2026-10-04-r59-loop-audit-report.md §3 LOOP-1/LOOP-2，§6 A-1/A-2 派工）。
- 预声明：reports/2026-10-04-r59-loop-fix-predecl.md（D-177 先行，commit `llo`/`dbdc546356d6` 先于本批代码 commit 落盘）。

## §1 处置对照（A-1/A-2）

| 项 | 审计要求 | 本窗处置 | 证据 |
|---|---|---|---|
| A-1 (P1) | 钉快照复用消 TOCTOU 或降 WARN；耗时上界登记 ≥900s | **钉快照路径**：85-check C 组进组即对活仓 rev-parse 钉 SRC_HEAD→`git clone` OS temp→checkout 冻结面 AS_PIN；engine 实跑 input+oracle gitO/adrDir/deferRegistry 全改指 AS_PIN（活仓同进程二次读消除）；**新增 C0 断言**（clone HEAD==SRC_HEAD 不变式，命中方向=红，26→27 断言）；TIMEOUT_MS 600000→900000（guard-all-run.mjs，实测 521s/87% 占用回应） | 85-check 三连 PASS 27/27（轮 1/2/3 ≈259/337/252s）；guard-all ran=65 green=65 allOk=true |
| A-2 (P2) | census 终态注记链式追加（禁改写 L1962） | 账本 L1966 新增链式注记行（原行零改动）；r57-report L49 行尾追加〔终态注记〕 | 账本 1981→1983→1984 行；75a 实跑 findings=400↔register 400 对账 PASS |

## §2 伴生处置（本窗新增，如实登记）

1. **84-check 新红清零**：审计报告 L55-56 表格内 commit 指针 8 位短 SHA（`0d245068`/`29bc05e2`）被 84-check 判 PV-SHORT-SHA FAIL——该报告未提交前不入扫描面故审计窗未检出；收编 commit 后进入面即红。处置：canonicalize 为 12 位＋verbatim subject（D-188 法定形），复跑 newFail=2→0。
2. **63-assertion-inventory 再生**：85-check 断言 26→27（C0）致 70-check E1 盘点漂移（ids 27→28）——`update-70-inventory.mjs` 再生（64 守卫 1508 emit 位），70-check 13/13 回绿。两派生件（inventory+findings lno 随行）走 D-140② 独立 bundle commit。
3. **mkdtemp 残渣面根消（LOOP-3）**：85-check tmpB/tmpC、86-check tmpB 三处落点 reports/→os.tmpdir()，硬杀残渣类消灭；审计自披露之 `85-recal-hA78Fj` 同类不再可能。

## §3 验收复跑（同审计 §6 基线口径）

| # | 命令 | 读数 |
|---|---|---|
| 1 | npm run build | exit 0；BUNDLE-OK |
| 2 | node scripts/check-dist.mjs | DIST-RATCHET PASS 310334B/385000B（margin 74666B） |
| 3 | npm pack --dry-run | total files: 89 |
| 4 | dist/cli.js selftest | ok=true |
| 5 | dist/cli.js doctor | overall=ok 四腿绿 |
| 6 | npm test | **PASS=379 FAIL=0**（19 套件，exit 0） |
| 7 | 85-check ×3 连续 | **PASS 27/27 ×3**（确定性绿；前窗探针 1/3 红消除） |
| 8 | 86-check | PASS 18/18 |
| 9 | 33 / 41a / 84 / 70 / 75a | 33/33 · 39/39 · 34 断言 newFail=0 · 13/13 · 16/16 findings=400 |
| 10 | guard-all-run | **ran=65 green=65 red=0 allOk=true（GUARD-ALL-RESULT: PASS）** |
| 11 | audit . --scale Macro-C 独立实跑 | exit 0；五工件齐；structure 面同前轮 |

## §4 稳定性声明

- 85-check 三连绿系**冻结面**读数：语料钉于各次运行开始时点 SRC_HEAD（本轮实测间活仓 HEAD 已由 b3c758e5 移至 6dfe53c0，竞态源仍存在但被消除——两侧同读一份快照故差异不可再发生）。
- 「65/65 allOk=true」现建立在 85-check 确定性之上，可作为终态锚（对照审计 §5 自更正）。

## §5 呈用户裁定项（执行窗不代决——R59 审计 §6 A-3~A-7）

| # | 事项 | 审计建议 | 本窗状态 |
|---|---|---|---|
| A-3 | 账本节标题唯一性守卫落 41a/84 | 落守卫 | 未动——待裁 |
| A-4 | P1-3 预算上调是否再入 predecl 勘误六 | 待裁 | 未动——本窗已以独立 predecl 覆盖本轮；上一轮 300→600 是否补勘误仍待裁 |
| A-5 | .scratch/tmp-aud.txt 删留 | 审计建议删 | 未动——仍 ?? 在盘 |
| A-6 | .atomcode 两件 staged | 提交或 rm --cached | 未动——仍 A 态两件 |
| A-7 | push + CI 矩阵 | 用户授权后 but push | 未动——未 push/merge/amend |
