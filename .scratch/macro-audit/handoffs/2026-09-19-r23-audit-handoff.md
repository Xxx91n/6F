# handoff — 轮 23 审计收口（R23 AUDIT → 修复窗返工/下一 grill）

> 生成：2026-09-19 审计窗（独立会话）。接续者读本文件＋审计报告即可接续。

## 现状

- **轮 23 执行（r23-impl lane，commit c3767c3 impl＋62ed336 handoff，未 push）已被审计**：硬验收全部亲跑属实——build BUNDLE-OK／pack 75 件·188.4kB／MCP stdio 六面实测全过／基线电池 14/14 exit 0／70:13·71:16·72:16·33:29·41b:33／39:27+已登记 XFAIL H6／xfail-run 8/10+SEALED15／upstream-map 21/21／github-rest 56/56（L1 真 token）／smoke 全链。
- 实现与 D-079~D-084／BACKLOG #70~#72／A-082~A-087 逐条吻合；范围零蔓延；push/B 轨闸门零触碰。
- **审计判定：PASS-with-findings**——打回修复窗 **R1（勘误批）＋R2（写盘 assert-back 硬违规）必修**；R3 建议修呈报用户裁。
- 审计报告：`D:\Aworker\6F\.scratch\macro-audit\reports\2026-09-19-r23-audit-report.md`（声明→证据→结论全表＋双轴评审＋重跑清单，此处不重复只引用）。

## 修复窗待办（打回项，修完须重跑同一套验收）

| # | 项 | 修复要求 | 重跑清单 |
|---|---|---|---|
| R1 | 三处口径失真勘误：①报告/A-083「CODELORE_DIMENSION_MAP 37 行」→实物 **43**；②遥测排除「七类」vs doc 六名 vs BACKLOG #72「六类」三源不齐＋preflight 幽灵行（engine/src 无生产者）；③「but status 无 pending」→应写「engine/package.json 无 pending」（~160 件 .code-tmp scratch 实存） | 按 A-080 勘误先例：原文保留＋勘误节成对落盘引审计报告编号；遥测口径三选一随修窗口裁（doc 补第七名／常量删 preflight／注明防御性超枚举） | 33-check＋71-check＋72-check exit 0＋引用一致性人工复核 |
| R2 | `update-70-inventory.mjs:108-110` 写盘无 assert-back（违 AGENTS.md 写后回读+禁 BOM；同批 update-72-registry.mjs 同款三检在位证明纪律适用） | 写后回读 JSON.parse＋BOM 检＋guards>0＋fail-closed（对齐 update-72 同款） | `node reports/update-70-inventory.mjs` 重生成→70-check E1 仍 13/13＋注入腐化写验证 FAIL（验证后还原） |
| R3 | 建议修（呈报用户批准）：explain 族成员级对账盲区（doc 无 9 面枚举＋B7 滤 kind='analysis' 漏 group 行＋无成员数钉）／71-A1 日期字面钉（同 xfail-41a-d6/d7 失效族）／map.ts:20 死 import＋lane 'excluded' 标签混同（pr_metadata 切片载体落永久排除桶） | 随批裁：doc 补 9 面枚举 or B7 覆盖 group／A1 改两字段互等断言／删死 import＋unmapped≠excluded 标签澄清 | 71-check＋72-check＋upstream-map.test 全绿＋build |

## 用户裁定面（审计不追认）

- P-a：「37 行」失真——报告 L34 与账本 A-083 同误，双读数面自错。
- P-b：遥测「七类」——常量 7 名/doc 6 名/BACKLOG 六类三源不齐；preflight 属防御性超枚举。
- P-c：「but status 无 pending」字面不成立（.code-tmp ~160 件未提交 scratch），实质=engine/package.json 已收编。
- P-d：双轴子代理无 exec 受限——diff 面以工作树实物取证，主代理已逐条复验。

## 下一 grill 方向指示

1. **R1+R2 合票返工（小件）**：勘误批＋assert-back 两件同质（报告/账本口径＋写盘纪律），可合一票；R3 建议项是否并入由 grill 裁。
2. **grill 追问面**：①explain 族成员级对账盲区——doc 不枚举 9 面是有意（env 门控面不钉成员）还是漏账，须裁「逐行对账」票面边界；②遥测排除超枚举政策——防御性超枚举（preflight）是否需「无生产者禁列」原则行；③字面钉失效族复发（71-A1/72-C2/70-C1 三处新钉 vs 已登记 xfail-41a-d6/d7 同族）——是否立「禁字面钉滚动面」通用断言纪律。
3. **census 机芯双份拷贝**（update-70-inventory⇔70-check §1 ~75 行已漂移 style/sealedCall）——守卫无 import 纪律是否外延到重生成器，须裁共享抽取 or 注明豁免。
4. 值守面照旧：push 闸门未动（round19/21/22-closeout＋r21 栈＋r22-impl-ledger＋r23-impl＋本审计 r23-audit 全停闸门）；#52b 待命锚未触发；review-coverage pending(event_bound) 待 pulls.reviews 激活。

## Suggested skills

- `$implement`＋`$tdd`：R2 assert-back 修复——预声明判据（写后回读三检+fail-closed）先行，负路=注入腐化写必 FAIL。
- `$code-review`：返工 diff 复评双轴（重点：勘误成对落盘完整性＋E1 对账不破）。
- `$grilling`：方向 2 三追问面（对账边界/超枚举政策/字面钉纪律）逐题裁定后落账。
- `$handoff`：次轮收尾同规程再生。
- `gitbutler`：一切版本控制写操作——修复窗在 r23-impl（或新票分支）续提；审计产物在 r23-audit 独立 commit；不 push 除非用户明示。

## 关键路径

- 审计报告：`D:\Aworker\6F\.scratch\macro-audit\reports\2026-09-19-r23-audit-report.md`
- 被审执行报告：`D:\Aworker\6F\.scratch\macro-audit\reports\2026-09-19-report.md`；任务书 `…\handoffs\next-round.md`
- 账本：`D:\Aworker\6F\.scratch\macro-audit\decision-ledger.md`（D-079~D-084）；`D:\Aworker\6F\.scratch\architecture-recovery\decision-ledger.md`（A-082~A-087）
- 语义源：`D:\Aworker\6F\docs\upstream-dimension-map.md` v1.0；常量块 `D:\Aworker\6F\engine\src\audit\upstream-dimension-map.ts`
