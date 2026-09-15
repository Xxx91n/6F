# 29-report — C 层 disposition 补记（A-034 / spec §R4-D4）

## §0 开工复述
本票 Blocked by #26/#27/#28（三票均已结题：26-check 18/18、27-check 15/15、28-check 113/113）。范围 = 账本 C 裁定节 disposition 补记（reopen 惯例）+ 勘误式双读数发布；不改写已入库 C 裁定原文与时间戳。

## 调研
- 复用原子调研锚 atomcode-r6-26（OOS Phase I / AAA）与 atomcode-r6-27（erratum/双读数结构）——本票为账本处置动作，调研基线已由 #26/#27 报告承载。

## 完成定义对照
| 判据 | 结果 | 证据 |
|---|---|---|
| disposition 段补记于 C 裁定节（原文/时间戳不改写） | ✅ | decision-ledger.md C 裁定节「disposition 补记（2026-09-15，票 #29 / A-034，CAPA reopen）」追加在张力记录行后；守卫 A1-A3 逐字断言原行 |
| 成对动作：原 RED 标 invalid 部分 + 修正读数 = reportable value | ✅ | 补记段落：v1=0.2462 RED 保留不撤、Status/Date 归因标 invalid；v2=0.5846 RED 为 reportable value；真实缺失 33 格 #28 已清零注明 |
| 勘误式双读数发布物 | ✅ | 27-dual-readings.md（八节 erratum 结构，atomcode-r6-27 模板） |
| 守卫 PASS exit 0 | ✅ | `node 29-check.mjs` → 见下 |
| ledger A-034 done + lessons + commit | ✅ | 本提交 |

## 阻塞
无。解锁 #30（前置 #27 入库 ✓）。

## lessons 候选
- reopen 惯例在本账本落地为「### disposition 补记（日期，票号，CAPA reopen）」三级标题追加模式——后续 reopen 票可直接复用守卫断言（原文逐字 + 追加位置）。

## 引用文件
- decision-ledger.md C 裁定节 disposition；reports/29-check.mjs；证据链 26/27/28 三票产物

## 版本控制处置
- 分支 `29-c-disposition-reopen`（叠于 28-adr-hygiene-sweep 之上），commit 引 A-034。
