# 轮46 审计 LOOP-1 修复批报告（2026-09-29）

> 触发：r46 审计报告 F1~F6 呈报项＋r1 RA 呈批——用户 2026-09-29 授权「小问题直接 LOOP 修复」＋口头批准 r1。修复窗=self，修复后重跑审计同款十面硬验收。

## 1. 处置对照表

| 项 | 原呈报 | 处置 | 证据 |
|---|---|---|---|
| F1 intent 锚 9→8 | drift-watch verify_method 钉 intent=9，冻结件实值=8 | registry 三项字段更正（title/source/verify_method）＋errata-anchor-corrected 确认行；历史面留痕（D-146⑤ 链式勘误） | 33-gate-registry.json drift-watch 项；账本 LOOP 节勘误 |
| F2 75/75 时点差 | lifecycle 记落位前读数 | 账本澄清注记（时点实录非错账） | 账本 LOOP 节勘误条 |
| F3 AGENTS Frozen 行虚列 | 报告措辞 over-claim | 账本勘误（实落 CONTEXT.md L359~361；AGENTS.md 仅 RA/守卫组） | 同上 |
| F4 新顶层类无 schema 钉 | closed[]/frozen_evidence_packs 无校验 | 75a-check 增 M4/M5（九要素+guard 在／立法要素+64hex+bytes 非零）；70-inventory 重钉 | 75a-check.mjs:153-158；63-assertion-inventory.json |
| F5 F1 标签复用 | 覆盖断言与在位断言同号 | F1b 消歧＋PROTECTED_SURFACE 扩 frozen 豁免面＋OK 汇总补 F | 01-check.mjs:9/84/91 |
| F6 chore 缺双拖车 | qwn 仅 Chronicle | but reword 补 Ledger-Refs:D-140,D-144,D-145＋Adrs:（三拖车建制对齐） | commit qwn 新 sha |
| r1 呈批 | §6 待裁 | 用户批准→§6 回填＋registry refile-approved＋expires_at 转 min(触发,2026-12-28) 双锚＋verify_method 复审钩 | docs/ra/r1-*.md；registry r1 项 |

## 2. 修复后验收重跑（同一套十面）

| 面 | 结果 |
|---|---|
| build | BUNDLE-OK |
| package | 85 files / ≈1.0MB |
| selftest | 5/5 |
| check-dist | DIST-RATCHET PASS 263151B/289395B |
| smoke | 349 PASS / 0 FAIL |
| guard-all-run | 60 ran / 60 green / red=0 / allOk=true |
| 01-check | 82/82（frozen-pack=5） |
| 33-check | 31/31（74 项） |
| 75a-check | 16/16（M4/M5 新增在列） |
| 70-check | 13/13（inventory 重钉后复绿） |

## 3. 中途事故如实记录

首轮 guard-all-run 报 70-check E1 册外新红（75a 断言 14→16 与 inventory 钉值漂移）——非掩盖，按机制自带修法 node update-70-inventory.mjs 重钉后复绿；棘轮按设计工作（断言增列须显式重钉=防静默扩面）。

## 4. 留待下窗（非本批面）

- T2 批2-β 续挂（点火三问仍全否）；O6 40-check 冗断言随下次触碰兑现；F-02 宿主盲区续观察；Stage-2 ①④ 值守不变。
- drift-watch 项 T3 随读口径已更正为 intent=8 锚——下轮审计窗复核「该退化无认领票」标注仍在场。
