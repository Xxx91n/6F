# Handoff — 轮 8 审计（#35 / A-040）→ 下一轮

## Status

**审计终判：实质成立 + 打回小修建议（文书级 6 项，不动代码）**。硬验收 20/20 声明亲跑全成立；D-034/D-035/A-040 覆盖核对成立；过程违规仅 P-V1（commit `f91e03e` 无账本引用，微）。处置二选一待用户拍板：① 打回修复窗口按返工清单小修后复审（只重跑守卫套件）；② 用户明示豁免放行。

## Repo State

- `but status`：分支 `r8-35-codelore-batch1`（commits `lro`+`tyt`）叠 `r7-closeout-docs`（`xzx`+`pvy`），基座 `e72f47c`。zz 应为空——审计窗亲跑 probe 的副作用产物已 `but discard zz` 全数还原，若再见残留即非本会话产物。
- `git ls-remote origin`：仅 `main`，票分支均未外推（用户闸门）。
- engine：`npm test` 全绿（GEN-OK / SMOKE 6/6 / COLLECTORS 14/14 / ADAPTER 7/7 / BATCH1 41/41）；`npm run package` → 31 files；`node dist/cli.js selftest` → ok:true。
- 环境注记：本机 `rg` 不可用（exit 127 / 空输出），检索一律 node fs 兜底；`35-probe.mjs` 是**录制器**——重跑重写全部 cassette/manifest/facts，跑前须知会脏树。

## 审计报告

- `D:\Aworker\6F\.scratch\architecture-recovery\reports\round8-35-audit.md` —— 声明→证据→结论对照表 20 行、D-xxx 逐条核对、W1-W7 缺失/弱化/跑偏清单、返工清单 6 项、重跑清单。

## Remaining / 交修复窗或收口窗

按优先级（详见审计报告 §5 返工清单）：
1. **残余 4 面裁决挂跟踪**（最重）：registry 增 manual_watch 项或 next-round 增 T 行；并修 `35-check.mjs` A4 不写死 `EXPECTED_RESIDUAL` 名单。
2. AR README 波次表同步（#41 拆分 / #43←#45 / Frontier 段）；`issues/35` Status 翻 done；`next-round.md` T3 标 DONE + 头部改「下一可开工=#36/#37/#41a」。
3. `engine/CHANGELOG.md:6` 悬空指针加注「待 #41a 落盘」或保证 #41a 先于 #44 enforce 段。
4. `docs/decisions/README.md` ADR-0018 孤儿行归表 + 映射表补 0008~0018（可并入 #41a 文书票）。
5. 可选：33-check 事件引用改 fail-closed；codelore.ts evidence 串自 argv 派生。

## 下一个 grill 方向指示

- **首选**：残余 4 面（entity-effort / architecture-violations / finding-hotspot-overlap / defect-validation）裁决——纳入暂缓面集 or 显式排除；若纳入须先补 D-035④ 账本原文（否则 33-check B3 FAIL），若排除须落新 D-xxx 关闭跟踪项。
- **执行轮接续**：#35 已闭环 → W13 解锁 = #36（LLM 面 explain 族 env 门控 + 成本验收，A-041）/ #37（三试点仓 capacity 矩阵，A-042）/ #41a（分发收尾·仓内文档面，filler）；#44（版本锁定制度化 P0）DoR 已闭合可同批拉。
- **修复窗若返工**：跑 §5 重跑清单同套，复审只看守卫退出码。

## Warnings

- 8 空结果面 cassette 随多作者试点仓（#37）接入将产真实行，届时 cassette 需重录 + 漂移登记（沿用 31-upstream-drift 惯例）。
- `collectCodeloreFacets` 暂无生产调用方属设计内（#38 Macro-C 接线），勿当死代码删。
- `.scratch/macro-audit/reports/{日期}-report.md` 按日期累计追加窗口节，切勿整文件覆盖。

## Suggested skills（下一窗口按需调用）

- `$implement` / `$code-review` —— 返工窗口执行与收口复核
- `$grill-with-docs` / `$to-spec` —— 残余 4 面裁决与 #36/#37 下探
- `$atomcode-research` —— 票内调研（串行单发，-p 只放问题，timeout 600000）
- `$but` —— 版本控制（新会话独立分支；push/land 用户闸门）
- `$handoff` —— 下轮收口归档
