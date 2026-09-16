# 轮 9 执行交接（next-round T0–T9 已执行）

> 生成于 2026-09-16 轮 9 执行窗口收尾（handoff skill）。供下一轮整理环节/接续 agent 使用。
> 证据主档 = `.scratch/macro-audit/reports/2026-09-16-report.md` 末节「轮 9 next-round 任务书执行」。

## 本轮落地状态

| 面 | 状态 | 锚 |
|---|---|---|
| T1 #46 6F workflow | done | `.github/workflows/macro-b-regression.yml`（commit uwk @ `r9-round9-exec`） |
| T2 #46 jiahao 撤除 | done | commit `2755bf35`（恰 1 文件 D）；**轮 10 勘误：该提交已在 origin/main**——jiahao 为独立在开发项目，其 push 面不属本仓管理域，登记事实不追认归因 |
| T3 经典仓候选 | done 呈报 | `.scratch/macro-audit/reports/46-classic-repo-candidates.md`（首选 git/django/spring-boot） |
| T4 #41b 备料 | done 备料 | `docs/listing/`×3 + `reports/41b-marketplace-fields.md` |
| T7 PR 面复核 | done | `reports/micro-a-preview-pr-surface-audit.md` |
| T5/T6/T8/T9 | 未触值守 | 事件均 occurred=false；33-check PASS 16/16 维持 |
| T10 | 用户专属 | 未执行 |

## 验证面

- `node .scratch/architecture-recovery/reports/46-check.mjs` → 轮 9 时 PASS 26/26；**轮 10 返修强化后 PASS 30/30 exit 0**（A 契约 17＋B 撤除 3＋C 工件 4＋D 引擎 4＋E 文书 2；新增 A15 npm ci／A16 env 间接引用／A17 test -s+RCP 强断言／D4 头注 6F 指向）。
- engine：`npm test` 全绿（DEMO 38/38・INTAKE 31/31 等）；`npm run package`→tgz 54 件；`selftest`→ok 5/5。
- 33-check → PASS 16/16 exit 0（值守面未破坏）。
- 39-check 已降级为时点守卫（头部 ERRATA 注记；现行守卫=46-check）。

## 等用户/下轮动作

1. **用户选定 T3 候选** → resolve job `DEFAULT` JSON 加 `{name,url}` 行（一仓一行，矩阵自动多 leg）。
2. **push 授权**：6F `r9-round9-exec`（T10）。~~jiahao `r9-46-jiahao-ci-removal`~~——勘误：2755bf35 已在 origin/main（git branch -r --contains 可复验），jiahao 推送面归该项目自身开发流程。
3. **listing 提交点击**（若走路径 B 官方目录：clau.de/plugin-directory-submission）＋license 拍板＋author/owner 值（`docs/listing/credential-checklist.md` §B）。
4. 事件驱动：micro-a-preview-prep occurred→T5 复审；S5 ownership 族窗口→T6 立案；macro-a-start→T8。
5. 可选另立票：①大仓 ADR 变体目录映射（KIP/DEP/technical→ADR 语料面）；②候选仓 clone 基准（20min 预算实测）。

## 风险/坑

- jiahao 仓有他方 agent 在途（grill-t9-v3-* 分支）——操作只用显式 file-id，勿裸 `but commit` 全量。
- but 分支并入 main 后分支名不再解析 git ref；守卫断言锚 sha/`git log --all`（39-check F5/I3 教训已入 lessons）。
- 头部 OSS 仓无字面 docs/adr → Macro-B 对外部仓 TC-1/TC-2 将 INCONCLUSIVE 如实落数（非缺陷，D-033 口径）。

## Suggested skills

- 整理环节：`$handoff`（本件同款）、`atomcode-research`（若下轮需补调研）、`$implement`（T3 接入/新票）。
- 版本控制：`$but`（push 前仍需用户授权）。

## 引用

- 任务书 `D:\Aworker\6F\.scratch\macro-audit\handoffs\next-round.md`
- 账本 `D:\Aworker\6F\.scratch\macro-audit\decision-ledger.md`（D-042~D-047 current）
- 报告 `D:\Aworker\6F\.scratch\macro-audit\reports\2026-09-16-report.md`
- 守卫 `D:\Aworker\6F\.scratch\architecture-recovery\reports\46-check.mjs`

