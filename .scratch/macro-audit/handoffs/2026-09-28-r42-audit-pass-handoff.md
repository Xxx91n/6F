# 2026-09-28 轮42 R42-T1 审计窗 — audit-pass handoff

> 审计对象=`r42-t1-exec` 栈（4587a09c 语义 24 件＋fc981290 生成物 13 件 @ r41-closeout 之上，未 push）。
> 详报=`D:\Aworker\6F\.scratch\macro-audit\reports\2026-09-28-r42-audit-report.md`（声明→证据→结论全对照）。
> 被审计报告=`reports\2026-09-28-r42-exec-report.md`；任务书=`handoffs\next-round.md`（T1 已标 DONE）。

## 裁定：PASS

- 硬验收 11 项独立复跑逐格一致：本机 guard-all-run 60/59/1 allOk=true；fresh clone（`D:/tmp-fc-audit/6F-clone`，--no-local＋npm ci 9pkg＋空 sibling 根）60/58/1+skip1+gskip3 allOk=false PASS——判据② 翻绿**审计侧独立证实**（非转述）。
- 主仓 object store 零写：clone `.git` count-objects 跑前跑后逐格同（in-pack=5133/loose=0）、无 refs/frozen 残留——D-074 实证。
- build/DIST-RATCHET(263151B)/pack 85 件/selftest 5·5/smoke 22 件全绿（clone 内，含 duckdb 实写）。
- Standards 轴硬违规 0；Spec 轴 spec 项全落地。

## 呈报用户裁决项（审计不追认）

- P1 执行报告「语义批 25 件」实为 24 件（摘要计数误差，文件本身无缺漏）——下窗顺手勘误级。
- P2 `siblingPath()` 名册外名字由静默回退改 throw——未申报的行为硬化（方向正确但报告/ledger 未载），下窗裁定补注与否。

## 观察残留 6 件（零必修，下窗 T3 分诊候选）

O1 env-contract 潜伏脆性三件（alternates 覆写/单槽 cleanup/.git 直拼 linked-worktree 不成立——现行调用全不命中）／O2 53-check OUTA 四块重复／O3 46-B/C 闸连坐 C1~C3 仓内断言（立法粒度代价）／O4 footer green 计件含组跳（有标位缓解）／O5 47 普查纯 prose／O6 40-B1 闸后重言。

## 下一个 grill 方向指示（供收口窗择题）

- **首选**：组级探测真实收益核算——本批把整件连坐降为组跳，但 46-B/C  collateral 暴露了「闸粒度=分组粒度」的结构性上限；可 grill「是否引入断言级前置标记或更细分组」并顺裁 O3。
- **备选 A**：env-contract 潜伏脆性（O1）是否值得预防性立法，还是维持「触发条件驱动」不修——可与 Speculative Generality 红线对裁。
- **备选 B**：T2（#75 批2-β 建制）临窗再裁条件盘点（execution 窗已空，next-round 挂账常项可推进）。
- **值守续**：codebuddy 两哨兵候宿主侧；Stage-2 余 ①③④；death-watch 每审计窗人工普查。

## Suggested skills（下一窗口）

- **grill-me / grilling**：上述 grill 方向辩证（首推闸粒度上限题）。
- **implement / tdd**：若裁 O1~O3 修批——同构走 need()/groupProbe API，禁裸 existsSync。
- **diagnosing-bugs**：linked-worktree 形态实测后再动 O1。
- **gitbutler**：VC 唯一写面；r42-audit 审计 docs commit 在本栈之上。
- **handoff**：收口同规程再生。

## 复验工件留位

`D:/tmp-fc-audit/6F-clone`（fresh clone 实证仓）＋`empty-siblings`＋`r42-{full,semantic}.diff`——下窗可复跑或弃置。
