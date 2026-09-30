# R51-T1 执行批 Handoff（2026-09-30）

> 下一轮/子 Agent 读本件＋next-round.md＋decision-ledger 即接续。
> 分支：r51-t1-exec（已叠在 r50-closeout 上）｜编年：M-050｜守卫：62/62 PASS

## 1. 本轮兑现（勿重复）

- **D-184②④ 根治六件齐**：D-177 预声明（uuk）→ check-kit regex 态＋探测件（wmu）→ 70-check 回迁（xqr）→ 勘误闭账→迁入闸退役→GAP-CK-01/RA 关档（wxm）。
- **D-187③⑤**：75a `--emit` **不能**分向承载缺席钉（字段仅 key/file/kind/lno/excerpt）；负向列=人工明文登记；不另写解析器。
- **43-check 移植性**：`cp`→`fs.cpSync`（win test 闭环）。
- **T3 哨兵读数**已入 decision-ledger「T3 审计窗哨兵读数」表。

## 2. 可复跑证据

```
node .scratch/architecture-recovery/reports/check-kit-regex-check.mjs   # 13/13
node .scratch/architecture-recovery/reports/70-check.mjs                # 13/13
node .scratch/architecture-recovery/reports/43-check.mjs                # 28/28
node .scratch/architecture-recovery/reports/guard-all-run.mjs           # 62/62 PASS
```

## 3. 挂账常项（勿重复烤）

- T2 批2：deferred（事件锚未点火）／O6 40-check 顺删／R28-Q19／R31-Q6／批3+批4 不预裁／S1 重校准／GAP-B2B 八件／ci-workflow-liveness-watch（下一锚 2026-10-05 03:17 UTC）。

## 4. 下轮工作面序（D-175）

(b) 欠账清零 → (d) 深度维护 → (c) 预备件三问筛 → (a) 值守底线。
本轮 D-184 根治已归 (d) 完成；check-kit-regex-blindspot-watch 可摘或降级。

## 5. 通用调研要求（只在此处写一次）

- 新决策题：atomcode 深调研（`ctx_batch_execute` 串行 600s）；题面存档 reports/（D-178）；降级=degraded_performance 登记（D-186）；配额耗尽不续跑。
- 工业级成熟轮子优先（js-tokens 先例）；禁自研 lexer 当参考实现。
- 工件写入 Node.js `fs.writeFileSync`＋回读断言；路径给绝对路径。

## 6. 版本控制（WORKFLOW §4.2.1）

- `but` 唯一写面；独立 session 分支；禁 git write；push/merge 逐次用户授权。
- 提交三栏位：subject／body bullets／footer `Ledger-Refs:`+`Chronicle:`+`Adrs:`（D-161④）。
- 收口 commit 对：语义→派生紧邻同窗（D-180）；报告口径=「除已收编真实语义信号件外零 churn」。

## 7. 验收标准（用户级——下轮继续适用）

> 编译通过、打包通过、启动并测活软件进程；每个平台都要有 test 闭环，避免只引入却没做到。

## 8. 关键路径

| 路径 | 用途 |
|---|---|
| `D:\Aworker\6F\.scratch\macro-audit\handoffs\next-round.md` | 常驻任务书 |
| `D:\Aworker\6F\.scratch\macro-audit\decision-ledger.md` | D 账＋T3 读数 |
| `D:\Aworker\6F\.scratch\architecture-recovery\reports\check-kit-regex-check.mjs` | regex 态守卫 |
| `D:\Aworker\6F\.scratch\architecture-recovery\reports\D-177-check-kit-regex-predeclaration.md` | 预声明＋勘误 |
| `D:\Aworker\6F\.scratch\macro-audit\reports\2026-09-30-r51-report.md` | 本轮报告 |
