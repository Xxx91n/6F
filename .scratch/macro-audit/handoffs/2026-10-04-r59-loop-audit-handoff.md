# R59 LOOP 复验审计窗交接（审计 Agent——R57 返修闭环复验毕）

> 权威报告：`D:/Aworker/6F/.scratch/macro-audit/reports/2026-10-04-r59-loop-audit-report.md`（200 行／16,599B）
> 本件为交接索引；判据、证据、裁定项一律以上述报告为准。

## 本窗做了什么

- 复验 R57 返修两 commit（`vov` 语义 9 件零 dist／`mlq` bundle 派生件）——**D-140② 隔离合规**。
- 逐项核对 R-01~R-04：**R-02/R-03/R-04①/R-04② 四项闭环 ✅**；R-01 部分闭环（见报告 §1）。
- 亲自重跑同套验收：build／pack 89 files／selftest／doctor 四腿／npm test **379 PASS 0 FAIL**／check-dist 310334B／Macro-C 独立实跑五工件＋structure=derived[S3]——**全部复现**。
- 逐件复跑守卫：86(18/18)、84(34)、33(33/33)、75a(findings=400) 全绿；**85-check 不稳定**。
- 结论：**CONDITIONAL FAIL**——返修闭环成立，但验收证据链核心锚不可靠。

## 关键新发现（P1，前两窗均未披露）

**85-check C1 非确定性 ⇒「守卫组 65/65 allOk=true」不可复现。**

- 探针三次单跑：393s PASS／**521s FAIL**／286s PASS（失败率 ≈1/3）。
- 全基线复跑：**`ran=65 green=64 red=1 allOk=false`**，红件＝`85-check.mjs rc=1 slugs=C1`。
- 根因已定位：C1 失败详情 `diff=head_sha oracle={a:98,l:98} run={a:98,l:98}`——ADR 数与 lag 两侧全等，仅 head_sha 不等。85-check C 组在同一进程内两次读取 **anysearch-cli 活语料仓**，期间 HEAD 移动（实测该仓 HEAD 现为 `b3c758e5`，predecl 记录历史值 `9a0fa28a`）。
- **限定**：失败那次 C2/C3/C4 均 PASS ⇒ **移植保真性结论不受影响**；受影响的是「85-check 全绿」作为验收断言的可靠性。
- 耗时实测 286s／393s／521s ⇒ 返修窗抬至 600s 的判断成立，但 521s 已占上限 87%，高负载下仍可能 rc=124。

## 对前轮审计报告的自我更正

前轮 §7 将 `ran=65 green=65 allOk=true` 与 `85-check PASS 26/26` 列为「复验基线」。该二锚系**单次读数**，本窗证其不可复现——**应读作「单次读数，非稳定基线」**。前轮 §1 V-7/V-8 当次结论不变，但外推为「基线稳定成立」的推论**撤回**。

## 待用户裁定（审计窗不代决）

1. **A-1（P1）** 85-check C1 竞态处置：钉快照复用／head_sha 差异降 WARN／耗时上界登记 ≥900s。
2. **A-2（P2）** census 终态数值过期：账本 L1962＋报告 L49 仍写 401(+12) 并保留 82-check 归因，终态应为 400(+11/−1)；须**链式追加**（D-146⑤ 禁改写）。
3. **A-3** 「账本节标题唯一性」守卫立法（前轮建议，仍未落）。
4. **A-4** P1-3 是否再以勘误六补入 predecl（报告 §2 已补登）。
5. **A-5** `.scratch/tmp-aud.txt` 删留——审计窗取证结论：内容为**单套件 `audit.test.mjs` stdout 捕获**（27 PASS，断言族 D/E/J/M/N/R/S），全仓 `grep "tmp-aud"`＝0 命中，**与前轮审计窗的 `npm test` 捕获（23 套件/379 PASS，落 /tmp）形态不符**；但 mtime 17:17:46 落在前轮窗口内，**不作认领亦不指控**。建议删，审计窗不代删。
6. **A-6** `.atomcode/artifacts/` 两件仍 staged，归属待定。
7. **A-7** push／CI 矩阵腿验证（用户闸门）。

## 工具链事实（下窗避雷）

- **context-mode MCP 有 600s 硬上限**：超时会把正在跑的守卫**硬杀**，在 `reports/` 下留 `85-recal-*` 残渣（本窗已中招并自清理；前轮交接已预警）。跑 85-check/guard-all 请用 `run_commands` 的 `Start-Process` 后台化。
- **`but show <id>` 可能失败**（`Could not open worktree file for reading`）——退路：`git show <SHA>`（change-id 非 git ref，须先解析 SHA）。
- `rg` 在 ctx shell 会话不在 PATH——用 `grep`。
- 裸 `git status` 的 `??`（macro-c.ts／85-check.mjs 等）是 **GitButler 虚拟分支基线 ref 噪声**，非真实未跟踪；判据用 `but diff`。
- `spawn_agent` 在本环境鉴权失败（Unauthorized），子代理并行取证不可用。

## Suggested skills

- **gitbutler** — VC 唯一写面；commit 后必 `but show`/`git show` 核实收清单。
- **handoff** — 下轮收口再生（换代钉清单盘点步先行 D-187①）。
- **diagnosing-bugs** — A-1 竞态分诊（TOCTOU 语料快照）。
- **atomcode-research** — 仅当 A-1/A-3 需调研支撑（守卫立法先例等）。

## 下窗焦点（R60 序建议）

- **T1**：A-1（85-check C1 竞态）施工＋复验；A-2 链式追加终态注记。
- **T2**：#85② Micro-A 产线化票／R4-02 detector v2 接线（P0 开放行）。
- **T3 候选**：A-3 节标题唯一性守卫、51-E2 收紧、85/86 mkdtemp 迁 OS temp。
