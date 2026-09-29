# 轮47 执行窗兑现批报告（R46-impl／T1 批）

日期：2026-09-29　分支：r47-t1-exec（stacked on r46-closeout）　判据面：零修订（执行窗纪律——判据临场不可改）

## 覆盖裁定

D-173①~⑤（①窗状态机 window_state=not_started／②来源分级口径 F1 归 capability 入 reset_log／③机读五件建制／④现状处置=六次「计时中」确认行链式更正＋F1 披露；⑤D-162④ A(a) 收窄留痕已随 R46 收口节履行，确认行 criterion_version=D-173①~⑤ 保持引用链）；配套现行规程 D-146⑤（勘误链二阶修正）、D-144①④（账行增量↔编年随行）、D-161④（trailer 三栏位）、D-139/D-140②（语义/生成物 commit 不混）、D-167-c①（O6 顺删续挂账）、D-170③（欠账三要素）。无新增 D 条目（D 总数 173 不变）。

## 完成定义逐项（原验收：「编译通过、打包通过、启动并测活软件进程；每个平台都要有 test 闭环，避免只引入却没做到。」）

本批零源码改动（.scratch/registry＋账本/编年/报告文档面），不触 engine/src|dist（D-145① 前置 npm run build＋check-dist 条件未触发），映射闭环如下。

### 1. T1-A registry stage2-launch-criteria 字段化落地（D-173①③④）——已兑现

- **window_state→not_started**：registry 项新增顶层字段 `window_state: "not_started"`——零试点（Stage-1 charter 空集）⇒窗未启动，「计时中」读数退役（D-173①：vacuous silence≠stability）。
- **五件机读字段建制**（`window{}` 容器，字段形态最小化不超额）：
  - `start_event: null`＋`start_event_enum: ["pilot_started","findings_all_closed","freeze_declared"]`（起点事件枚举机读）；
  - `start_at: null`（窗起点时戳——事件注册时回填）；
  - `prereq_check: "pilot_running"`（启动校验=试点在运行）；
  - `reset_log: []`（finding_id/source_class/reset_at/new_window_start 四键 schema＋note 披露位）；
  - `decision_date: {require_open_findings:0, require_fix_deployed:true, min_observation_days:30}`（复合测试说明字段——open 清零∧修复部署∧窗内观察满最短时长；「issue closure alone satisfies neither test」D-173③）。
- **六次「计时中」确认行链式更正注记**：confirmations 追加 `decision="window-state-corrected"`（at/by/criterion_version/reason/evidence 五字段齐——33-check D6 机检过）——reason 逐条枚举承载静默窗读数的六条确认行（confs#0 registered 登记行／#2 criterion-02-pass-read／#3 layered-disposition-registered／#4 criterion-03-ra-closed／#5 status-unchanged／#6 criteria-readings），载明无起点锚的计时宣称=不可审计读数语义悬空、判据④读数口径=window_state 机读；原确认行逐字保留（D-146⑤ 读数链留痕不改写）。
- **F1 归能力面入 reset_log 披露**：`{finding_id:"R46-F1", source_class:"capability", reset_at:null, new_window_start:null, note:"窗未启动不重置（D-173②④）——能力面归类先例在案：证据完整性错值=capability 非 hygiene"}`。
- **证据（复跑）**：
  - `node update-33-window-state.mjs` → `window_state=not_started confs=8 reset_log=1 BOM=false / REGISTRY-UPDATED`；幂等重跑 → `REGISTRY-IDEMPOTENT-SKIP`（assert-back fail-closed：写后回读全字段断言）。
  - registry 前后 sha256：`d7188d17879d647f…` →（变更后哈希见 commit diff）；文件 LF 无 BOM 尾换行保持。

### 2. 33-check 相容核验（复验方式之二）——PASS 未破校验面

- 命令：`node .scratch/architecture-recovery/reports/33-check.mjs`
- 输出摘要：`PASS 31/31`——A1~I4 全组绿；D2 manual_watch 五要素 22 项齐备；D6 confirmations 留痕四字段 110→111 条全齐；登记 74 项／事件 52 个不变；ALARM 1（readme-ci-badge 触发 fired——既有挂账常项非本批引入）／WARN 9（既有）。
- 裁定：新字段未破校验面——「破则同窗校验面同步扩随批」条件未触发，33-check.mjs 本体零改动（探测面修语义须预声明验证包——D-147 纪律，本批不越）。

### 3. 守卫组全量跑（升格后判据 A-097/轮37）——PASS

- 命令：`node .scratch/architecture-recovery/reports/guard-all-run.mjs`
- 输出摘要：`GUARD-ALL-RESULT: PASS——ran=60 green=60 skipped=0 group-skipped=0 red=0 registered=0 problems=0 allOk=true partial=0/60`；红集=∅⊆known-red-manifest.json（册内红维持 0，kr-01 摘除后未回潮）。

### 4. 验收标准映射（本仓可执行面 test 闭环）

- **编译通过**：本批无编译面（registry JSON 解析合法=等价物——JSON.parse 读回断言通过；update 脚本 .mjs 经 node 加载执行无语法错）。
- **打包通过**：不触 engine/src|dist——D-145① 打包/dist-drift 前置条件未触发（零 drift 面未动）。
- **启动并测活软件进程**：迁移脚本实跑两态（UPDATED→IDEMPOTENT-SKIP）＋33-check 31/31＋guard-all-run 60/60 实跑——可执行面全测活。
- **每个平台都要有 test 闭环**：引入件闭环——update 脚本 assert-back fail-closed（自身即测试）；window 字段/确认行经 33-check D2/D6 机检消费；判据④读数=T3 审计窗消费 `window_state` 字段（机读锚入册）。未引入无机读消费的死字段。

## 变更文件清单（commit 序）

语义 commit（分支 r47-t1-exec）：

- `.scratch/architecture-recovery/reports/update-33-window-state.mjs`（新增——D-173 幂等迁移，assert-back fail-closed）
- `.scratch/architecture-recovery/reports/33-gate-registry.json`（stage2-launch-criteria：window_state＋window{}＋reset_log F1＋confirmations +1 行）
- `.scratch/macro-audit/decision-ledger.md`（轮46 收口节末追加「执行窗兑现（R46-impl 批 = 轮47 T1）」小节）
- `CHANGELOG.md`（M-042 随行——账行增量↔编年配对 D-144①④）
- `.scratch/macro-audit/reports/2026-09-29-r47-exec-report.md`（本报告）

bundle-only commit（D-140② 生成物独立 commit）：

- `48-micro-a-golden-*`×10＋`56-heldout-eval.json`（守卫全量跑伴生再生——run_at 时戳/派生计数漂移，无语义变更）

## 阻塞与待办

- O6 顺删续挂账（D-167-c①）：本轮未触 40-check.mjs——下次触碰时 NO-OP 搭车删 40-B1 闸后重言断言，不专开批。
- T2 批2 维持 deferred（事件锚非日历——registry batch2beta-open-triggers 三事件，审计窗点火检查）；T3 审计窗本体=下轮哨兵值守（④读数自此取 window_state 字段机读）。
- readme-ci-badge ALARM（触发 fired 未挂载）=既有挂账常项——挂载随下一门面维护窗，非本批面。

## Lessons

- registry 机读字段建制走 update-*.mjs 幂等迁移脚本（assert-back fail-closed）是既有先例的复用面——update-72 同款纪律三件（幂等/回读断言/不过不写盘）照搬可零事故。
- 写盘缩进须以目标文件现状为准（本 registry 实为 2 空格——update-72 脚本字面 1 空格非现行磁盘形态，盲照抄会产生全文件 format 漂移）。
- 「计时中」类读数更正=追加确认行载明语义悬空而非删改原行（D-146⑤ 读数链留痕——审计轨迹可回放到错误读数现场）。
