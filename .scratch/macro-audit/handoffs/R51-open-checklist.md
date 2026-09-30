# R51 开工三件套（子 Agent 自检）

## 1. 必读清单要点（不复读全文）
- 常驻任务书=`.scratch/macro-audit/handoffs/next-round.md`（轮 51）；身份=修复/开发子 Agent；须完整遵循含 WORKFLOW §4.2。
- 口径基线：D 账 187 条（171 current／15 revised／1 closed）；编年 max M-049；守卫判据=`node .scratch/architecture-recovery/reports/guard-all-run.mjs`（现 61 件）＋红集⊆known-red-manifest＋册件复绿 strict 告警。
- 工序硬闸：D-185 开工对表声称态核实；D-184 check-kit 迁入闸（探测件落盘前迁入冻结）；D-177 预声明先行（声明物化于变更 commit 之前）；D-181 扩面勘误 append-only；D-180 收口 commit 对（语义→派生紧邻同窗）；D-161④ 提交三栏位 trailer。
- VC：`but`（GitButler）唯一写面；独立 session 分支；禁 git write；push/merge 逐次用户授权。
- 用户闸门：workflow_dispatch 实跑不擅自触发；atomcode 在途进程不杀；RA 起草权在 Agent／批准权在用户；（c）面候选只起草不拍板。
- 挂账常项勿重复烤；等待期面序=(b)欠账清零→(d)深度维护→(c)预备件→(a)值守。
- 文件写入走 Node.js `fs.writeFileSync`＋回读断言（无 BOM、保尾行）；报告路径给绝对路径。

## 2. 本任务覆盖的 D-xxx ID

### T1 执行窗批（主工——本轮覆盖）
- **D-184②④**：check-kit regex 盲区——迁入闸探测件＋check-kit 补 regex 态＋回迁闭账（T1-A a/b/c/d）。
- **D-187③⑤**：75a `--emit` 分向承载核查（T1-B）；换代钉清单盘点规程。
- 随行工序锚：**D-177**（预声明包／fixture 红绿分野）、**D-181**（勘误闭账行）、**D-170③**（欠账三要素）、**D-185**（开工对表核实）。
- O6 续挂账（不专开）：**D-167-c①**（40-check 顺删）。

### T2 续挂账（不预裁不动工）
- **75b §4／D-156③／D-169-a②**：批2 开启判据=registry batch2beta-open-triggers 三事件锚；禁借 D-175(c) 预备件名义动工。

### T3 审计窗哨兵值守（读数义务）
- **D-155②③／D-164-b／D-169-a②／D-170③④／D-172④／D-173④／D-175①／D-176③／D-182④／D-184⑤／D-186②**。

### 提交/收口随行
- **D-180**（收口 commit 对）／**D-161④**（trailer 三栏位）／**D-144①④/D-145①**（守卫组前置）。

## 3. 验收标准原文

### 用户级（本轮全程适用）
> 编译通过、打包通过、启动并测活软件进程；每个平台都要有 test 闭环，避免只引入却没做到。

### 任务书 T1 复验原文
- T1-A：「fixture 集红绿分野在场＋golden 对照零未归因差异＋70-check 回迁 PASS＋勘误闭账行＋闸退役注记」。
- T1-B：「核查账行在场＋分向判定明文在案」。

### 收口前置
- guard-all-run 全量（现 61 件）＋红集⊆known-red-manifest；账行增量↔编年随行核对；engine/src|dist 触碰→`npm run build`＋`node scripts/check-dist.mjs` 零 drift。
