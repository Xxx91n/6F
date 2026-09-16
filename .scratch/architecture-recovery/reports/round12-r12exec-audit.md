# 轮 12 执行窗独立审计报告（2026-09-16）

> 审计窗口产物（只出报告不动手修）。对象=轮 12 执行窗收口（T1 #47 GitHub REST 适配器＋T4 #41b 核对）。
> 审计面：commit 栈 r12-47-github-rest = 80e6af3(feat/uvq)＋b6ebc60(docs/vlm)，固定点 d1f1afb（round11-closeout 顶）。
> 工作 diff 物证：.scratch/architecture-recovery/reports/round12-audit-workdiff.patch（86.7KB，数据块单列）。

## ① 硬验收——不信自述，亲跑复跑

| 验收项 | 命令 | 报告自述 | 审计亲跑 | 结论 |
|---|---|---|---|---|
| 编译+全链测试 | `cd engine && npm test`（gen→tsc→smoke 九链） | 全链绿 | exit 0；尾段 GITHUB-REST 51/51 PASS | ✅ |
| 打包 | `npm run package`（npm pack --dry-run） | 56f/90.4kB | 56f/**90.5kB**（npm 舍入口径差，非缺陷） | ✅ |
| 启动测活 | `node dist/cli.js selftest` | ok 5/5 | ok:true，5/5 pass | ✅ |
| 守卫 47 | `node .scratch/architecture-recovery/reports/47-check.mjs` | PASS 37/37 | PASS 37/37 exit 0 | ✅ |
| 守卫 44 回归 | `node .scratch/architecture-recovery/reports/44-check.mjs` | PASS 56/56 | PASS 56/56 exit 0 | ✅ |
| 值守面 33 | `node .scratch/architecture-recovery/reports/33-check.mjs` | PASS 16/16 | PASS 16/16 exit 0（ALARM 0） | ✅ |
| 真网活探 | 报告仅文字自述（62PRs/3calls/4988→4986） | 命中 api.github.com | **审计亲跑 1 次只读调用**：strategy=gh-token、status 200、rate_limit 解析正确（limit=5000/remaining=4961/used=39/reset_epoch 在）、callLog=1、token 未输出未落盘 | ✅ 独立复验成立 |

## ② 声明→证据→结论 对照表

| # | 报告/交班声明 | 审计取证 | 结论 |
|---|---|---|---|
| 1 | github-rest.ts 落盘 682 行 | 文件在；实测 **678 行**（split 计 678 元；patch stat 677 行差±1 口径） | ⚠️ 数字漂移：682≠678，且同值传抄进 BACKLOG/A-055/issue/47-report/handoff 五处 |
| 2 | X-GitHub-Api-Version pin=2022-11-28 | `GITHUB_API_VERSION` 常量 L21 单源＋fetcher 头 L110＋测试 K1 断言 | ✅ |
| 3 | 凭据三级探测 env→gh→无认证降级 | `resolveGithubCredential` L62-80＋`probeGhAuthToken` spawnSync gh auth token 只读 L54-59＋测试 R1/R2/R4/R5 | ✅ |
| 4 | 即用即清不建存储 | writeFile=0 处；token 仅 cred 进程内存对象逐请求透传 fetcher；A12 断言 token 不进任何 fact；cassette+47-capture 全量 token 模式扫描零命中 | ✅（实质成立；无显式清零语句，记观察项） |
| 5 | PR 枚举 Bot 双检 type==Bot+[bot] | `platformDeclaredBot`＋bot_basis 字面量 platform-declared:user.type==Bot&&login~[bot]＋B1-B4/P1-P3 边缘行双检缺一即 false | ✅ |
| 6 | diff 双通道本地 git base...head 优先，API 仅本地缺席兜底 | `resolvePrDiff` L429-436：sha 双解→local-git；**但 L432-434 本地 diff 失败亦走 apiDiff**——spec 三处同文「仅…缺席兜底」外的第二触发器 | ⚠️ 边界弱化（见⑤-S1） |
| 7 | 限流 x-ratelimit-*＋Retry-After 有界退避（次级单次重试≤60s、primary remaining=0 即停标 reset_epoch） | `DEFAULT_MAX_RETRY_WAIT_SECONDS=60` L27；`call()` L220-245 三分支逐字吻合；测试 L1-L6 | ✅ |
| 8 | 余额写事实库 | `github_rest.rate_limit` 每调用一条（A4=4calls/5000/remaining/used/reset_epoch/resource 全字段） | ✅ |
| 9 | schema 漂移显式抛 GithubSchemaDrift | 类 L252；parsePrSummaryRow/parsePrList/parsePrDetail 三抛点；collect 层逐行捕获转 schema_drift 事实不停批（S1-S4） | ✅ |
| 10 | parseGithubRepoRef 非 github 显式拒 | E1-E5：owner/repo、https、.git、git@ 均 ok；非 github http/ssh 显式拒 | ✅ |
| 11 | 九类事实 | 全以 `github_rest.` 命名空间发射：resolution/rate_limit/rate_limited/api_error/schema_drift/pr_summary/pr_metadata/pr_diff/run——九类齐 | ✅ |
| 12 | cassette×5：auth+unauth=真机录制 62-PR；rate-limit=synthetic；schema-drift+platform-bot=derived | 5 带齐全；recorded 字段 real×2/derived×2/synthetic×1 与自述一致；auth 带 call0=62 行真实 PR 数据；**但 unauth 带 source 字段误抄 auth 带文案** | ⚠️ 1 处来源标注失实（见⑤-P1） |
| 13 | test 51/51 入 smoke 尾 | package.json smoke 末位=github-rest.test.mjs；亲跑 GITHUB-REST 51/51 | ✅ |
| 14 | 锁表 github-rest planned→active 三处同源扩 api-version | upstream-lock.yaml L77-86：status=active/version=2022-11-28/pin_type=api-version/adapter 回填/contract 全文齐；头注 L4-7＋versioning.md L20＋44-check A4 L80 三处同源 | ✅ |
| 15 | 47-check 37/37＋44 56/56＋33 16/16 | 亲跑全 PASS exit 0 | ✅ |
| 16 | 票档三件套＋47-report 六段＋BACKLOG ✅＋A-055 implemented＋WORKFLOW lessons＋日报节 | issues/prompts/handoffs/47-*.md 三件在；47-report ①~⑥ 齐；BACKLOG 行尾 ✅；ledger A-055=done→implemented；WORKFLOW R8#47 行在；日报 #47 节在 | ✅ |
| 17 | commit uvq 28 文件＋未 push | git show 80e6af3=28 文件；vlm=b6ebc60 另 1 件（handoff 自身，写时陈述为真）；git branch -r --contains=空 | ✅ |
| 18 | T4 #41b：description.md name=6f/displayName=Macro Audit 与 manifest.meta/plugin/marketplace 一致 | description.md name=`6f` displayName=`Macro Audit`；manifest.meta.json+双 plugin.json name=6f；marketplace.json name=xxx91n | ✅ 无需改动结论成立 |

## ③ code-review 双轴（Standards＋Spec，并行子代理取证）

### Standards 轴

- **硬违规 ×1**：`unauthenticated-degraded.cassette.json` source 字段抄写 authenticated 带文案「gh 已认证态借读 token」——该带身份即无认证（limit=60 自证无 token），来源标注失实，违反 cassette 诚实纪律（WORKFLOW §4 / issue #47② 如实标注要求）。一行修复量级。
- 判断性 ×6：rate_limit 事实发射双写（diff 循环硬编码 retried:false）／死代码三处（parsePrList 导出未引、test noRetry、47-check readdirSync 未用 import）／owner+repo data clump＋/pulls/ 路径四拼／403 无 ratelimit 头统标 rate-limited 误标空间／文档 682↔678 漂移／probeGhAuthToken binary 参未练习＋B3 名实小差。

### Spec 轴

- **缺失 0**：四 checkbox 全落地（适配器/三探测/双检/双通道/退避/余额事实/cassette×5/锁表 active/token 零入 fact/review-comment 仅 planned/T4 核对留痕）。
- **creep ×3 轻微**：parseGithubRepoRef+E 组测试（注：A-055 规范化需求列已载「非 github 显式拒」，issue What-to-build 未列——记文书不对称非违例）；planned 面登记表含 issues.comments（review/comment 措辞外延微扩）；47-capture 原始捕获入提交（交付面外但已披露+复用目的+token 净）。
- **跑偏 ×2**：
  - S1 diff 兜底边界弱化：`resolvePrDiff` L429-435 在「sha 双解但 git diff 失败」时追加 apiDiff——spec（issue L7／锁表 contract／ADR-0020）三处同文「仅 base/head 本地缺席兜底」，「仅」字外触发器未在 47-report③ 如实登记。
  - S2 diff 路径事实失真：resolvePrDiff 内部调用被以 retried:false 硬编码重发为 rate_limit 事实（~L631，GithubCallLogEntry 本无 retried 字段）；限流 diff 记为 api_error/error_kind=http（L637-638），rate_limited 计数不涨——耗尽信号在 diff 路径被误标。

## ④ D-xxx 逐条核对

| 条目 | 声明 | 证据 | 结论 |
|---|---|---|---|
| D-048 | 适配器路径=REST 主路+gh 可选回退+无认证降级+锁表 remote-api | ADR-0020 落盘且决策文与实现逐字对齐；锁表行全字段 | ✅ implemented |
| ADR-0020 | docs/adr/0020-*.md | 在；Context 论证（third-party consumer 不 ship gh 二进制）与实现一致 | ✅ |
| A-055 | done→implemented | 规范化需求列全部函数名实测在；状态列已回写；唯「682 行」数字漂移 | ✅（行数勘误待修） |
| D-049 | #48 已解锁为下轮入口 | next-round T2 票面在；本轮未抢跑 | ✅ 边界正确 |
| D-052 | T4 listing 一致性核对 | 四处名字段一致（6f/Macro Audit/xxx91n） | ✅ |
| D-051 | 分发面字段不回退 | license Apache-2.0 维持（CHANGELOG/包字段未被本轮改动） | ✅ |

## ⑤ 过程违规单独呈报（不替追认）

- **P1（违·诚实标注纪律）**：unauthenticated-degraded.cassette.json 的 source 字段声称 gh-token 借读录制，与该带「无认证 60/h」身份自相矛盾——复制粘贴失实。触 WORKFLOW §4 cassette 诚实条款。
- **P2（违·自述数字未复核）**：「682 行」五处传抄（handoff/BACKLOG/A-055/issue/47-report），实测 678±1；「90.4kB」实测 90.5kB（舍入）。审计口径=自述数字须可复测。
- **P3（违·偏差未登记）**：apiDiff 第二触发器（本地 diff 失败兜底）超出 spec「仅」字边界，47-report③ 如实登记节未载——spec 跑偏未披露。
- 观察项（非违规）：token 无显式清零语句（进程内存即用即弃已满足「不建存储」实质）；planned 面含 issues.comments 为措辞外延微扩。

## ⑥ 打回返工要求（修复窗执行，修完重跑①同套验收）

R1. 修正 unauthenticated-degraded.cassette.json source 字段为无认证录制实述（或 provenance 结构化拆 origin/auth-mode 两字段，五带同源改）。
R2. 二选一消 S1 跑偏：(a) 收窄代码——本地 diff 失败记 api_error 不走 apiDiff；或 (b) 呈报用户改 spec 三处同文措辞为「本地缺席或本地 diff 失败兜底」并同步锁表 contract/47-report③ 登记。走 (b) 需用户点头。
R3. 消 S2 失真：GithubCallLogEntry 补 retried/error_kind 字段，diff 循环重发用真值；限流 diff 记 rate_limited/error_kind=rate-limited 并涨计数器；抽共用发射器（同 Standards 重复代码项并修）。
R4. 全文书 682→实测行数勘误（5 处）；顺手清死代码三处（parsePrList 删或 47-check 引用、noRetry、readdirSync import）。
R5. 重跑清单：47-check+44-check+33-check exit 0；npm test 全链绿（GITHUB-REST 51/51 保持）；package+selftest；新增断言覆盖 R1-R3 修复面（ cassette source 断言/diff-fail 路径测试/retried 真值断言）。

## ⑦ 结论

**PASS-WITH-BLOCKING-OBSERVATIONS → 打回（LOOP 返工）**。硬验收全绿亲跑成立、18 条关键声明 16 条实证成立；但存在 1 条诚实标注硬违规＋2 条 spec 级偏差（其一未披露）＋数字传抄漂移——按职责分离呈报如上，修复面小、路径明确。本轮不生成通过式交接；修复窗完成 R1-R5 后复审。

## 引用

- 审计对象 handoff：D:\Aworker\6F\.scratch\macro-audit\handoffs\2026-09-16-r12-exec-handoff.md
- 任务书：D:\Aworker\6F\.scratch\macro-audit\handoffs\next-round.md（T1/T4 行）
- 规格：issues/47-github-rest-adapter.md／BACKLOG #47／ADR-0020／A-055／D-048
- 工作 diff：reports/round12-audit-workdiff.patch
- 守卫：reports/47-check.mjs・44-check.mjs・33-check.mjs
---

## LOOP-2 复审（qln=5ca9ed7 返修包，2026-09-16）

### 同套验收亲跑（全绿）

| 项 | 返修自述 | 复审亲跑 |
|---|---|---|
| npm test | 全链绿 GITHUB-REST 55/55 | exit 0；D7/L7/L8/L9 新断言 PASS 可见 |
| package | 56f/90.9kB | 56f/90.9kB |
| selftest | ok 5/5 | ok:true 5/5 |
| 47-check | 40/40 | PASS 40/40 exit 0 |
| 44-check / 33-check | 56/56・16/16 | PASS 56/56・16/16 exit 0 |
| 工作树/栈 | 干净，qln 顶 | 干净；qln→vlm→uvq→round11-closeout；branch -r 无 qln（未 push） |

### 打回四项逐项核

| 项 | 复审取证 | 结论 |
|---|---|---|
| R1 cassette source 勘误 | 语义 diff（b6ebc60→5ca9ed7）**恰 1 处**：仅 $.source 改写为无认证实录制；calls 数据零变化（12.5k 行 churn=重序列化）；B7 断言（source 无 gh/借读/token 且含无认证字样）锁死防再抄 | ✅ 修复成立且防回归 |
| R2 diff 兜底收窄 | resolvePrDiff L432-435：本地 diff 失败→{channel:local-git, error_kind:local-diff} 如实降级不改道；apiDiff detail 收敛「base/head 本地缺席」+透传真 error_kind；D7 orphan 分支场景断言 callLog.length===0（零 API 调用实证）；47-check A10 锁死 | ✅ |
| R3 事实真值 | callLog 补 retried/error_kind（logAttempt 裁决时刻归类 403/429→rate-limited，顺带成文解决首轮判断项）；emitCallLog 三路径同源；diff 限流→rate_limited 事实（channel/retried/reset_epoch 真值+policy 注）+计数器；L7/L8/L9+A11 锁定 | ✅ |
| R4 勘误+死代码 | 文件实测 689 newlines/690 split-elements（「690 行」=含尾换行计法，口径可接受）；七文件 682→690 同步（47-report 残留 1 处 682 为勘误句自身正当留痕）；parsePrList/noRetry/readdirSync 三处死代码清除 | ✅ |

### 返修新引入问题（单独呈报）

- **N1 伪造史录（违·诚实纪律）**：`.scratch/macro-audit/reports/2026-09-16-report.md` 两处把 **#45 历史记录** 51/51 扫射成 55/55——L143 票档表「45-check 55/55」与 L161 复核清单「45:55/55」。实证：45-check.mjs 恒为 51 断言（git 史仅 9c7cf12 一次提交从未改动；当前实跑输出 FAIL 1/51——H5 为 next-round 轮转衰减属时点守卫，非返修引入）。系 51/51→55/55 全局替换越界——与本伦 P2 同类错误在返修中再犯。
- **N2 陈旧格残留（违·自述未复核，轻微）**：handoff 残留「47-check PASS 37/37」×2（应 40/40）、「56f/90.4kB」×2（应 90.9）、版本控制节仍只提 uvq 未提 qln；47-report §①「90.4 kB」与 A-055 行内「90.4kB」同残留。返修文书自身数字未全量复核。
- 观察项：审计物证（本报告+workdiff patch）随 qln 入库——申报属实、可归因；qln 提交信息自述与实际 diff 一致，无夹带（13 文件全在预期面）。

### LOOP-3 返工要求（纯文书订正，不动码）

- L1. `2026-09-16-report.md` L143+L161 两处 #45 记录回改 55/55→51/51（或在行内注明勘误）；改后 grep 复核「45.*55/55」零命中。
- L2. handoff 四处陈旧格更新：47-check 37/37→40/40 ×2、56f/90.4kB→56f/90.9kB ×2；版本控制节补 qln 行（栈顶=qln，含返修+审计物证）。
- L3. 47-report §① 90.4→90.9、A-055 行内 90.4kB→90.9kB 同步。
- L4. 重跑：47-check+44-check+33-check exit 0（无断言影响）；grep 验证「37/37」「90.4」「45.*55/55」在 r12 文书面零残留（37-check 本体 40/40 为真值勿动）。

### LOOP-2 结论

**返修有效但不得收口——再打回（LOOP-3，仅文书订正）**。四项打回全部修复成立且加了防回归断言，硬验收全绿；但返修在同一纪律面（数字自述诚实）再犯：伪造 #45 史录×2＋陈旧格×4+残留。修复面为纯文书改格，量小且明确。

---

## LOOP-3 复审（qln 修订后 fd6bf85，2026-09-16）——终审

| 要求 | 复审取证 | 结论 |
|---|---|---|
| L1 #45 史录回改 | 日报 L143=45-check 51/51、L161 复核清单=45:51/51；45-check.mjs git 史仅 9c7cf12 恒 51 断言——记录与真值一致 | ✅ |
| L2 handoff 陈旧格 | L10/L34=47-check 40/40；L11/L37=56f/90.9kB；版本控制节=三提交栈 uvq→vlm→qln+未 push 注记 | ✅ |
| L3 全链同步 | 47-report §①=90.9kB；A-055 行内=90.9kB；issue L20=90.9kB；日报 L247 证据行同步 | ✅ |
| L4 零残留 | 全库 grep（90.4/682 行/37\/37/45∧55\/55）：零命中（本报告与 workdiff 引文=正当留痕） | ✅ |
| 守卫矩阵 | 47-check 40/40・44-check 56/56・33-check 16/16 全 exit 0；LOOP-3 amend 增量=纯文书 6 件零代码夹带；审计报告 LOOP-2 节随 qln 入库且与本窗工作副本逐字一致 | ✅ |

### 终审结论

**PASS（三 LOOP 闭环）**。轮 12 执行窗交付（#47 GitHub REST 适配器＋T4 核对）经首轮审计→打回 4 项→返修→复审再打回 2 项→文书订正→终审全绿：硬验收亲跑成立（tsc/npm test 55/55/package 56f-90.9kB/selftest 5/5/真网活探独立复验/三守卫 40+56+16 exit 0）；代码面零残留缺陷；文书面数字与史录已与仓库实物逐格对齐。

过程教训留档：两轮返修各暴露一次「批量替换缺边界锚点」失误（51/51 扫射误伤 #45 史录；变量遮蔽静默落空靠回读抓回）——文书勘误纪律=逐处锚定语境＋每个 write 独立回读断言。
