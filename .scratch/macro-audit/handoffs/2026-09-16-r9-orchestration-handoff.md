# 轮 8→9 串行编排交接（2026-09-16）

> 身份：修复/开发子 Agent（编排父窗）。本档交接「审计返修 + 剩余窗口串行子代理编排」全部产物。

## 状态

- **#35 审计返修**：round8-35-audit.md 打回文书级返修全落地（commit yvn @ r8-35-codelore-batch1）。W1 残余 4 面→registry codelore-residual-faces（manual_watch）；W2/W3/W4/W7 文书同步；35-check A4/A5 动态断言 22/22。
- **剩余窗口**：T0~T14 全闭环（唯一例外 T15/#41b 用户闸门不排程）。11 个子代理窗口逐票串行执行，每窗：必读→实现→守卫→报告→账本→but 独立分支→父窗亲验再放行。

## 栈全景（未 push，用户闸门）

r9-guard-drift-sync(uxv) → r9-33ext-watch-guard(kvx) → r9-42-upstream-queue(rmw) → r9-44-upstream-lock(xsl) → r9-43-sample-golden-ci(ppm) → r9-41a-distribution-docs(zkm) → r9-45-demo-entry(unv) → r9-40-external-repo(sps) → r9-39-macro-b(oru) → r9-38-macro-c-preview(szk) → r9-37-pilot-audit(kuy) → r9-36-codelore-llm(ytz) → r8-35-codelore-batch1(lro/tyt/yvn) → r7-closeout-docs(xzx/pvy) → e72f47c。另 au/audit-round8-2026-09-16(wqn) 独立审计栈；jiahao 仓 r9-39-macro-b-regression(zqm)。

## 守卫矩阵（全部亲跑 PASS+exit 0）

33=16/16｜34=11/11｜35=22/22｜36=20/20｜37=40/40｜38=36/36｜39=38/38｜40=57/57｜41a=39/39｜42=43/43｜43=28/28｜44=56/56｜45=51/51；npm test 全链 9 测试文件入 smoke；package 54f；selftest 5/5。

## 下窗待办（收口窗口）

1. **mw-trigger-a/b 双 ALARM**：触发已发生未拍——self-probe 实测读数已落（39-mw-self-probe.json），收口裁决。
2. **desk-task15 ALARM**：判据属 Micro-A 未上架层——Micro-A preview 前置复核。
3. **codelore-residual-faces / codelore-llm-mcp-face / upstream-probes**：manual_watch 复审时点绑 micro-a-preview-prep / stage3-close。
4. **R-40-GSDCORE-1（P1）**：dash+加粗 Status 形态 v3-leg 候选（v2 27-prereg 冻结未动）。
5. **zz 两件**：40-clone-cache（71MB 外部克隆本机证据）+ 40-out wal——留 uncommitted 属意，可复跑再生。
6. **#41b**：用户闸门+listing-submission，未授权不动。

## 教训（已入 WORKFLOW §4）

- 守卫锚活仓漂移：live 复测断言遇合法推进（jiahao +1c、smoke +2 文件）会 FAIL——断言「锚可解析/>=基线」+drift_note 留痕，不修语义。
- but commit 跨分支依赖：`but branch new --above <栈顶>` 先落位再 commit -b。
- 子代理编排：每窗独立分支+守卫+报告，父窗不信自述逐窗亲验，串行防爆炸式集成（D-034）。
