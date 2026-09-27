# Handoff for 轮 37 T1 / #75批1 审计闭环

## 状态

审计 **通过**（LOOP-2 核销）。首轮裁定=打回窄返工（册外新红 23-P2：`%h` 8 位撞 7 位字面钉，git auto-abbrev 随对象库 7→8 跳变）；修复窗已核销并复跑同套九项验收全绿，审计复核全部实物吻合。

## 已落盘物

- 审计报告（含 LOOP-2 核销段）：`D:\Aworker\6F\.scratch\macro-audit\reports\2026-09-27-r37-audit-report.md`
- 返工报告：`D:\Aworker\6F\.scratch\macro-audit\reports\2026-09-27-r37-rework-report.md`
- 评审 diff：`D:\Aworker\6F\.scratch\macro-audit\audits\r37\audit-r37-code.diff`
- 账编：A-097/A-098（decision-ledger.md:424/434）、M-020/M-021（CHANGELOG.md:152/166）
- 分支：`r37-audit`（审计产物栈于 r37-t1-75b1，未 push）

## 下一个 grill 方向指示

**建议轮 38 = #75 批2（348 普查处置→分档实修）**。依据与候选面：

1. 普查册 `75a-census-register.json` 348 条已立档但仅为归属分档——处置实修未启。建议按族分批：multi-hit 76（最多，须逐件判近似同义拆并）、existence-assert 115、date-literal 53、magic-floor 51。
2. 本轮呈报项（审计报告 §10/§11 非阻塞七件）：38-F2 support 枚举收窄过松、25-C5a 尾格排除造成扫描盲区、37-C2 欠数不可检出、20-A5 SQL 检测未走剥注释、26/28/30 check-commit 机件重复、`known-red-manifest.json`「三分位」笔误、01-spotcheck.json 缺尾行。
3. `short-sha-pin` 探测族当前零命中——建议批2 造一份含 `%h` 钉的合成件验证族在实战中可拦（正对照已证机制，缺实物标本）。

## 交代与坑

- `git %h` 输出宽度随对象库增长漂移——任何钉 SHA 前缀的断言一律 `%H` 全锚+`startsWith`；探测族已入册防回归。
- guard-all-run 复跑会再生 48-golden/56/75a-findings（generated_at 刷新）——属设计内 drift，审计复跑产生的 M 漂移归修复窗处置。
- 审计窗铁律：只出报告不动手修；裁定打回时附修复要求+重跑清单；修复后必跑同套验收。
- `but` 提审计产物走专用 `r37-audit` 分支，勿混入修复栈。
