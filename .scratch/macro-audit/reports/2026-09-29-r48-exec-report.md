# 轮48 执行窗兑现批报告（R47-impl／T1 批）

日期：2026-09-29　分支：r48-t1-exec（stacked on r47-closeout）　判据面：零修订（执行窗纪律——判据临场不可改）

## 覆盖裁定

D-174①④（window_state_enum 三态闭集补位；②可选跨字段断言未做=归 (d) 呈裁件）；D-175②⑦（(b) 面欠账清零）、D-175⑥⑦（allowed/deferred 清单成文＋项级归位机查）、D-175④⑦（(c) 候选件三问筛呈裁起草）、D-175③⑦（(d) 具体件清单呈裁起草）。配套现行规程：D-144①④（账行增量↔编年随行＝M-044）、D-161④（commit 三栏位 trailer）、D-139/D-140②（语义/生成物分 commit）、D-146⑤（确认行追加不改写原行）、D-170③（欠账三要素）、D-149①②（守卫升格判据=guard-all-run 全量＋红集⊆manifest）、D-089⑤（badge 事件锚诚实纪律）、D-147（探测面不修——33-check.mjs 本体零改动，可选断言层呈裁位未做）、D-167-c①（O6 顺删续挂账）。无新增 D 条目（D 总数 175 不变）。

## 完成定义逐项（原验收：「编译通过、打包通过、启动并测活软件进程；每个平台都要有 test 闭环，避免只引入却没做到。」）

### 1. T1-A window_state_enum 补位（D-174①④）——已兑现

- **落地**：registry stage2-launch-criteria 项新增顶层字段 `window_state_enum:["not_started","running","satisfied_at"]`——sibling-of-field 归位（键序=window_state 之后紧邻旁挂，与 window{} 内 start_event/start_event_enum 惯例同构）；window_state 当前值 `not_started` 不动；confirmations 追加 `window-state-enum-established` 留痕行（8→9）；枚举键=值域声明约束既有字段，非数据字段扩张（D-173③ 五件建制边界不破）。
- **迁移脚本**：`.scratch/architecture-recovery/reports/update-33-window-state-enum.mjs`——幂等闸＋写后 assert-back（BOM/枚举值/sibling 键序/确认行五字段）＋fail-closed exit 1。
- **证据**：
  - `node update-33-window-state-enum.mjs` → `window_state=not_started enum=["not_started","running","satisfied_at"] keyorder=15->16 confs=9 BOM=false / REGISTRY-UPDATED`；重跑 → `REGISTRY-IDEMPOTENT-SKIP`。
- **未做项登记**：D-174② 跨字段断言（window_state↔start_event 流转合法边）=可选叠加层——归 (d) 候选 d-33check-enum-assert 呈裁；做则须 D-147 预声明验证包工序，本批 33-check.mjs 零改动。

### 2. T1-B allowed/deferred 清单成文（D-175⑥⑦）——已兑现

- **载体**：`.scratch/macro-audit/handoffs\waiting-allowed-deferred.md`——数据行 88（allowed 28／deferred 60）：registry 74 项逐项归位（值守项 24=manual_watch 22＋risk_accepted 2 全 allowed；未决 event_bound 38＋已决 event_bound 11 全 deferred——readme-ci-badge 清零后归 allowed）＋非册挂账常项 6 件（R28-Q19/R31-Q6/批3批4/46ab 拆件/断言级 need()/resolve 争议）＋(c) 候选件 2 件＋(d) 具体件 3 件；统一失效条件随行（Stage-1 首例 charter 落地或 Stage-2 判据面变化→全表失效重裁）。
- **机查件**：`verify-waiting-list.mjs`（非 -check.mjs 命名——不入 guard-all-run 枚举，一次性复验件）。
- **证据**：`node verify-waiting-list.mjs` → `PASS L1~L5／rows=88 registry=74 live=62／VERIFY-PASS`（归位枚举合法＋74 项逐 id 命中＋挂账∪值守零漏列＋值守=allowed／未决 event_bound=deferred 语义一致）。
- **任务书随行**：next-round.md T1-B 条已补载体指针。

### 3. T1-C (b) 面欠账清零（D-175②⑦）——已兑现

- **readme-ci-badge 翻转**：badge 实挂证据=README.md 徽标行（actions/workflows/engine-ci.yml/badge.svg?branch=main）＋README「Badges show only what is true today」段（mounted 2026-09-22 注记）＋事件机检 `gh run list --workflow engine-ci.yml --branch main --limit 1`——status pending→decided＋`badge-mounted` 确认行（2→3）；33-check 侧效：ALARM 1→0（「触发已发生未拍」清除）＋H3/H4 持续绿。
- **审计呈报 nit 规程面**：WORKFLOW §4.2.5 增「报告文书口径」行——计数标签须按 commit 实物逐件机核（禁约数标签）／变更清单须含报告与 handoff 自身／漂移描述按实测面写不低估（F1~F3 三型禁再犯）。
- **计划外新欠账同窗清零（如实披露）**：验收核查发现 main 上 engine-ci 自 2026-09-25 起全平台红——根因=engine-ci.yml 末步 78-check 缺 `working-directory` 覆盖，job 默认 `engine` 致 `engine/.scratch/…` MODULE_NOT_FOUND（引入 commit e6724489，该步 CI 挂载起即带缺陷）。修复=补 `working-directory: ${{ github.workspace }}` 一行——badge 显红=诚实徽记生效非徽章缺陷；本地复证：`cd engine && node .scratch/…/78-check.mjs` 复现 MODULE_NOT_FOUND，仓根跑 78-check 绿。生效时点=本分支 merge 后首个 main push。
- **证据**：
  - `node update-33-readme-ci-badge.mjs` → `status=decided confs=3 BOM=false / REGISTRY-UPDATED`；重跑 → `REGISTRY-IDEMPOTENT-SKIP`。
  - `gh run list --workflow engine-ci.yml --branch main --limit 5` → 最新 5 跑全 failure（36324002874/36308209806/36244895983/36162484401/36162458338，09-25~09-27）；`gh run view 36324002874 --log-failed` → `Cannot find module '/Users/runner/work/6F/6F/engine/.scratch/architecture-recovery/reports/78-check.mjs'`。
  - `node 33-check.mjs` → `PASS 31/31；登记 74 项/事件 52 个/ALARM 0/WARN 9`（前值 ALARM 1=readme-ci-badge fired）。

### 4. T1-D (c) 面候选件三问筛呈裁（D-175④⑦）——起草毕待拍板

| 候选件 | ①解锁首周必用 | ②不赖试点反馈 | ③假设被否仍成立 | 起草倾向 |
| --- | --- | --- | --- | --- |
| c-stage1-charter-template（Stage-1 charter 模板——SBTM 三判据＋exit/success 双轴成型件，备而建不启用） | 是——首例 charter 落地当日即需 | 是——字段全由既有裁定构成（D-151/D-162⑤ 法源已定） | 基本是——Stage-1 不启动则成死文档零成本；形态被修订则单件文档重写成本低 | 三问过线→「可建」，用户拍板 |
| c-pilot-intake-pipeline（试点接入采集管线预备——试点仓 facts 采集管道） | 是若试点启动——无管线则 facts 面不形成 | **存疑偏否**——采集面形态依赖试点宿主类型/仓型，盲建返工风险实存 | **存疑**——「试点仓=插件可装宿主」假设若否管线面重构 | ②③存疑→建议缓建/仅草约接口面，用户拍板 |

### 5. T1-E (d) 面具体件清单呈裁（D-175③⑦）——起草毕待拍板

| 具体件 | 内容 | 边界约束 |
| --- | --- | --- |
| d-33check-enum-assert | 33-check 增 `window_state ∈ window_state_enum` 值域断言＋可选跨字段流转断言（running/satisfied_at 态须 start_event 已注册） | D-174② 可选层——做则须 D-147 预声明验证包工序（探测面变更）；断言数 31→33 |
| d-guard-perf-baseline | 守卫组 60 件 wall-time 基线建制 | D-175③ 禁开新状态文件——形态=审计窗报告 footer 耗时行／guard-all-run 输出 per-file ms 列（呈现层非探测面） |
| d-frozen-pack-recheck | frozen_evidence_packs 代表性巡检制度化 | 钉值机检已有 01-F/75a-M5 常驻——制度化形态呈裁（registry manual_watch 项或 T3 普查节律行；禁触钉值） |

### 6. 验收标准映射（本仓可执行面 test 闭环）

- **编译通过**：`cd engine && npx tsc -p tsconfig.json --noEmit` → exit 0 零错（不触 dist）；三件新 .mjs 经 node 加载执行无语法错。
- **打包通过**：`cd engine && npm pack --dry-run` → macro-audit-0.1.0.tgz 85 件 / 255.5 kB 成型（dry-run 零写盘）。
- **启动并测活软件进程**：`node engine/dist/cli.js selftest` → `{"ok":true,checks:[5 全 pass]}`（manifest/shells/mode/mcp read-only/receipt 五检）。
- **每个平台都要有 test 闭环**：本机面=guard-all-run 60/60 绿＋verify-waiting-list 5/5＋33-check 31/31；远端面=engine-ci 六矩阵（ubuntu/windows/macos × node20/22）——cwd 缺陷修复使其复绿路径开（merge 后首个 push 生效，当前 badge 如实显红）。引入件闭环：两迁移脚本 assert-back 自含＋window_state_enum 经 verify/33-check 消费＋清单经 verify 机查消费——无死字段/死文件。

## 复验跑总表

| 命令 | 结果 |
| --- | --- |
| `node update-33-window-state-enum.mjs`（×2） | REGISTRY-UPDATED → REGISTRY-IDEMPOTENT-SKIP（assert-back fail-closed） |
| `node update-33-readme-ci-badge.mjs`（×2） | REGISTRY-UPDATED → REGISTRY-IDEMPOTENT-SKIP |
| `node verify-waiting-list.mjs` | PASS 5/5，rows=88 registry=74 live=62，VERIFY-PASS |
| `node 33-check.mjs` | PASS 31/31；ALARM 0（badge fired 清除）；WARN 9 既有；confirmations 113 |
| `node guard-all-run.mjs` | GUARD-ALL-RESULT: PASS——ran=60 green=60 skipped=0 group-skipped=0 red=0 registered=0 allOk=true partial=0/60 |
| `npx tsc -p tsconfig.json --noEmit`（engine/） | exit 0 |
| `npm pack --dry-run`（engine/） | 85 files 成型 |
| `node dist/cli.js selftest`（engine/） | ok:true 5/5 |

## 变更文件清单（commit 序，全列——含本报告与 handoff 自身）

语义 commit A（CI 修复单意图）：

- `.github/workflows/engine-ci.yml`（78-check 步补 working-directory 覆盖）

语义 commit B（R47-impl 兑现批）：

- `.scratch/architecture-recovery/reports/update-33-window-state-enum.mjs`（新增——D-174①④ 幂等迁移）
- `.scratch/architecture-recovery/reports/update-33-readme-ci-badge.mjs`（新增——D-175②⑦ badge 翻转迁移）
- `.scratch/architecture-recovery/reports/verify-waiting-list.mjs`（新增——D-175⑦ 项级归位机查件）
- `.scratch/architecture-recovery/reports/33-gate-registry.json`（stage2-launch-criteria +window_state_enum＋conf+1；readme-ci-badge status→decided＋conf+1——confirmations 111→113）
- `.scratch/architecture-recovery/WORKFLOW.md`（§4.2.5 增报告文书口径行）
- `.scratch/macro-audit/handoffs/waiting-allowed-deferred.md`（新增——清单载体 88 行）
- `.scratch/macro-audit/handoffs/next-round.md`（T1-B 载体指针一行）
- `.scratch/macro-audit/handoffs/2026-09-29-r48-exec-handoff.md`（新增——本批交接）
- `.scratch/macro-audit/decision-ledger.md`（R47 收口节末追加「执行窗兑现（R47-impl 批=轮48 T1）」小节）
- `CHANGELOG.md`（M-044 随行——账行增量↔编年配对 D-144①④）
- `.scratch/macro-audit/reports/2026-09-29-r48-exec-report.md`（本报告）

bundle-only commit（D-140② 生成物独立 commit——若有守卫全量跑伴生再生漂移则列件于此；以 but diff 实物为准，计数标签按实件数写）

## 阻塞与待办

- **(c)/(d) 呈裁待用户拍板**：T1-D 候选件 2＋T1-E 具体件 3——执行批只起草不拍板（D-175⑦）；任一否=不建。
- **CI 修复生效时点**：engine-ci.yml cwd 修复在本分支——main 维持红至 merge 后首个 push；badge 显红为诚实徽记生效（非本批引入缺陷）。
- O6 顺删续挂账（D-167-c①）：本轮未触 40-check.mjs——随下次触碰兑现，不专开批。
- T2 批2 维持 deferred（事件锚非日历）；T3 审计窗本体=下轮哨兵值守（④读数=window_state 字段机读；清单生效后随读「allowed/deferred 与实际批工位一致性」义务见 next-round.md T3 末节）。

## Lessons

- ctx_execute 嵌套模板字面量写 .mjs 有双层转义坑（JSON→模板）——\n 类转义序列经两层求值会物化为真换行；写含转义序列的脚本件用 ctx_batch_execute bash heredoc <<'EOF' 全字面量更稳。
- registry 驱动生成清单表行可消 id 手抄笔误，但生成时点若先于 status 翻转会产生重复行——生成件应与状态变更同窗复核（本批 badge 行去重即此型）。
- 「挂载完成方翻 status」类项内纪律兑现要点=实挂证据链（README 行＋事件机检读数＋H4 互等断言）三件套齐再翻，且当前红态如实披露进确认行。

## 呈批回执（2026-09-29 用户拍板补记）

| 件 | 裁定 | 落地 |
| --- | --- | --- |
| c-stage1-charter-template | **建** | 已落盘 `.scratch/macro-audit/trials/stage1-charter-template.md`（备而建不启用——模板不产生试点；首个具案仍须用户逐案闸门 D-162⑤） |
| c-pilot-intake-pipeline | **缓建** | 清单行 deferred 维持（本体不建，至多接口草约） |
| d-33check-enum-assert / d-guard-perf-baseline / d-frozen-pack-recheck | **转 atomcode 深度调研复核** | 用户令：调研须回顾账本全 current＋docs/adr＋CONTEXT＋工业界成熟心智模型出推荐与理由；辩证性看待——冲突→对应 D-xxx 标 revised＋新 D 呈裁，禁静默改向；回报后再拍板 |

## (d) 面调研回报（atomcode 深度调研，2026-09-29 回报——待用户终裁）

调研范围：账本全 current 记录＋docs/adr＋CONTEXT 词条＋守卫件本体（33-check/guard-all-run/01-F/75a-M5/registry/events）本地核读 9 文件＋联网 6 searches（web_search×4＋tavily＋anysearch 三引擎）/8 处全文（KEP-5241、release_phases.md、criterion CLI+FAQ、Stryker 配置、pythonspeed 噪声文、GitHub 限流最佳实践）。

| 件 | 推荐 | 形态 | 置信 | 关键依据 |
| --- | --- | --- | --- | --- |
| d-33check-enum-assert | **建**（含可选跨字段断言一并建） | 33-check 增加值域断言＋流转合法边断言，须 D-147 预声明验证包 | 高 | D-174①④ 立法同向＋K8s conformance/KEP-5241 预声明判据惯例；枚举覆盖不对称欠账最后一半 |
| d-guard-perf-baseline | **缓建**（挂观察触发器） | 若解封=guard-all-run 报告 footer 派生耗时行（D-175③ 禁新状态文件） | 高 | criterion FAQ「CI 噪声环境性能回归不应门禁失败」＋pythonspeed 实测噪声 ~1.5%＋Stryker「先读数分布后阈值」——本仓零观测零消费面 |
| d-frozen-pack-recheck | **建** | T3 哨兵普查节律行（挂 next-audit-window 锚），不建 manual_watch 册项 | 中高 | attestation 时效 policy/chain-of-custody 周期盘查惯例；完整性已有 01-F/75a-M5 常驻，缺口仅「代表性」语义面；防双册（intent-drift-watch 在册） |

**冲突清单=零 revised**——两处张力如实呈报：①D-175② 点名列「性能基线」为主体面类目而件级判缓建——属 D-175④⑦「立法不立件、枚举呈裁量位」预留裁量空间，非改向；②manual_watch 形态拒绝=防双册双源（intent-drift-watch 已覆盖同观察面），非拒登记纪律。终裁待用户拍板。
