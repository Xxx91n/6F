# 轮 28 T1（#77 门面收口包·A 窗）独立审计报告 — 2026-09-22

> 审计面：独立审计 Agent（本窗只出报告不动手修）。审计对象=分支 `r28-t1-facade-ack` 单提交 `3f84d5f`（base aafb463=r27 收口 pkz），工作区干净（zz 无未提交变更）。被审报告=.scratch/macro-audit/reports/2026-09-22-report.md（轮28 T1 执行报告 12 条声明）。

## 终裁：PASS-WITH-FINDINGS

硬验收亲跑全绿、12 条声明全部找到实物证据；但双轴评审+亲验出 2 项返工级发现（F-01/F-02）＋1 项过程纪律漂移（P-01）＋2 项观察项（O-01/O-02）。发现均非「声明造假」而是实现/流程瑕疵；不建议阻断合并，建议修复窗口小返工（修复要求+重跑清单见 §6）。

## 1. 硬验收亲跑（不信自述）

| 验收项 | 命令 | 亲跑结果 | 结论 |
|---|---|---|---|
| 编译 | `cd engine && npm run build` | exit 0，tsc 0 错＋BUNDLE-OK dist/cli.js | ✅ |
| 打包 | `npm run package` | exit 0，macro-audit-0.1.0.tgz 75 件 190.2kB | ✅ |
| 测活 | `node dist/cli.js selftest` | exit 0，{"ok":true} 5 checks 全 true | ✅ |
| 测试闭环 | `npm run smoke`（宿主 shell） | exit 0，18 链全绿：SMOKE-OK 6/6→…→AUDIT-ZERO-WRITE-TEST-OK 4/4（272 PASS / 0 FAIL） | ✅ |
| 生成器对账 | `node engine/scripts/gen-acknowledgments.mjs --check` | exit 0，CLEAN README.md / CLEAN README.zh-CN.md / CHECK-OK | ✅ |

⚠ 审计工具链伪影注记：ctx_batch_execute 沙箱 bash 注入 `NODE_OPTIONS=--require cm-fs-preload-*.js`，审计测试内 spawnSync 的孙子 node 继承后 stderr 混入 17 字节噪音 → audit.test.mjs S3/S4/S5（JSON.parse(r1.stderr) 纯串断言）假 FAIL。`env -u NODE_OPTIONS` 后沙箱内复跑 PASS 26/26；宿主 shell 全链绿。**非仓库缺陷**；后续审计窗在沙箱跑 smoke 须 env -u NODE_OPTIONS 或用宿主 shell。

## 2. 守卫电池亲跑（13 项全对上）

33=31/31（exit 0；登记 53 项/36 事件；**ALARM 1**=readme-ci-badge 触发已发生未翻 status——值守机制正常工作，T10 票面+1 工作日 SLA 在案）｜44=59/59｜45=51/51｜70=13/13（VACUITY-CENSUS 53 守卫/1262 emit——63-assertion-inventory.json 已含 77-check 16 断言条目）｜71=16/16｜72=16/16｜73=14/14｜77=16/16｜xfail-run=PASS entries=0/10｜39=28/28｜40=57/57｜41a=38/38｜43=28/28。

## 3. 声明 → 证据 → 结论 对照表

| # | 报告声明 | 亲验证据 | 结论 |
|---|---|---|---|
| 1 | 生成器 183 行/per-id 模板×8/--check 只比不写/先比后写 | 实物 183 行✓；TEMPLATES 8 键✓；--check 不写盘✓；默认 DRIFT->WROTE/NEW->WROTE 先比后写✓ | ✅（F-01 弱化见 §5） |
| 2 | EN 锚段在 Honesty notes 前、8 行+脚注指 lock | ##Acknowledgments@167 < ##Honesty notes@183；8 成员行=名+角色+上游主页链接；脚注指 upstream-lock.yaml | ✅ |
| 3 | closed 对账=三向互等+三路 fail | 77-check A1/A2/A3 在案（A2 独立 regex 抽模板键防共模漂移——质量好）；亲验 template-extra/lock-parse-empty 两路 exit 1+归因行；template-missing 路 exit 1 但走 TypeError 裸栈 | ⚠ 弱化（F-01） |
| 4 | zh 派生镜像+sync 戳刷新 | ## 致谢 {#acknowledgments}@184 < 诚实注记@200；链接集与 EN 互等；sync 戳 a9fd3ebfac0d = sha256(EN)[:12] 实测一致 | ✅ |
| 5 | CI badge 双文件挂载=native actions badge | 双文件 <a href=.../actions/workflows/engine-ci.yml><img badge.svg?branch=main>；73-check D1 shields 白名单断言体未变（badges=10 仍全 license/version/node/marketplace/status-preview 族） | ✅ |
| 6 | 诚实注记措辞合法演化 | 双文件「engine-ci main 徽记已挂载（2026-09-22 首个 main 绿 run 后）；动图仍待 freeze」实物在 | ✅ |
| 7 | homepageUrl 补齐 | `gh repo view Xxx91n/6F --json homepageUrl` → "https://github.com/Xxx91n/6F" | ✅ |
| 8 | xfail-45-b5 摘除+meta 归因；另批摘六条 | stale-assertions.json entries=[]；meta.xpass_removal_2026_09_22_b5＋meta.xpass_removal_2026_09_22_anchors 两归因注记在案（逐条目归因写明） | ✅（待追认标记得当） |
| 9 | 33-H4 双向互等化+73-D1 措辞演化 | diff 实证：H4 改 ciBadgeInReadme === !!evB.occurred 双向互等；73-D1 白名单措辞演化但断言体未变 | ✅ |
| 10 | 编译/打包/测活/test 闭环 | 见 §1 全绿 | ✅ |
| 11 | 全守卫电池复绿 | 见 §2 十三项全对上（含 39/40/41a/43 恢复性绿） | ✅ |
| 12 | 台账三处 | A-089 执行账尾行在（implemented 2026-09-22）；CHANGELOG [M-005] 编年行（a_range A-001~A-089 实物区间）；BACKLOG #77 ✅ 闭环行 | ✅ |

## 4. D-xxx 逐条核对

| D 条目 | 要求 | 实现证据 | 结论 |
|---|---|---|---|
| D-098① | 致谢节置尾+枚举=lock active 集+行=名/角色/主页链 | 节位/8 行/脚注亲验；lock 11 行中 active 恰为这 8 id | ✅ |
| D-098② | 生成式锚段+per-id 人工模板+禁 kind 推导+regen→diff empty | 生成器模板逐条人定（github-rest=GitHub REST API 非项目对象正确）；77-check A 组三向互等 | ✅ |
| D-098③ | planned/evaluating/retired 不进面+脚注指路 | scorecard(planned)/repomix-gitingest(retired)/codelore-sqlite-dump(evaluating) 均未进节；脚注列明三态去向 | ✅ |
| D-098④ | 不扩 §3 上游表 | §3 表仍 5 行原样（diff 未触） | ✅ |
| D-098⑤ | 链接指上游主页禁 .scratch | 8 行全 https 上游主页/官方文档；无 .scratch | ✅ |
| D-098⑥ | zh 派生镜像 | 同位同链接集+{#acknowledgments} 钉回 EN slug | ✅ |
| D-098⑦ | NOTICE 承接核查衍生立项 | BACKLOG #79 已立案（归 T6 随 #75 排产——非本轮交付面） | ✅ 登记面 |
| D-099③ | 两新 event_bound 触发器 | registry items official-catalog-icon-required/docs-site-deployed 在册 pending（r27 pkz 已登，本轮声明=覆盖映射非新落） | ✅ |
| D-101① | A 窗文档面恒等+一主题一窗 | 提交零触 engine/src|test（14 件全为 docs/守卫/生成器/README）；registry status 翻转子项弱化→归 T10（已披露+ALARM 在案） | ✅ 边界守住；⚠ 翻转子项延后 |
| D-089⑤ | badge 须待 main 实绿 | registry engine-ci-main-green occurred=true date=2026-09-22 evidence=run 35681529820；gh run view 亲验 main/completed/success | ✅ |
| D-037③ | lock=机读权威 | §3 绑定注记+致谢节脚注双指 lock 未破坏 | ✅ |
| D-088 | zh canonical→derived 纪律 | canonicalMarker L1+owner 字段+sync 戳联动+锚点钉回 | ✅ |
| D-102① | xfail 摘除两键分离 | 7 条摘除+2 归因注记均标「人工裁决明文候选，D-102① 待追认」——执行侧落、追认侧未自封 | ✅ |

## 5. 发现清单

| ID | 面 | 发现 | 证据 | 严重度 |
|---|---|---|---|---|
| F-01 | Spec/实现 | **template-missing 漂移类下生成器诊断不可达**：active id 无模板时 renderBlock 先解引用 tp.name → TypeError 裸栈（exit 1 仍红=失败方向安全），但内建 template-missing(active 无模板) 归因行永远打不出——报告声明「三路 fail」有一路只剩 exit code | 临时副本实测：lock 加 fake active id→--check 输出 TypeError: Cannot read properties of undefined (reading 'name') @gen-acknowledgments.mjs:106 | 低-中（对账仍红不破；诊断质量+可维护性问题） |
| F-02 | 留痕/provenance | **报告文件名撞车覆盖**：.scratch/macro-audit/reports/2026-09-22-report.md 前版=轮26 实施报告（git show aafb463 实证头行「轮26 实施报告 —— 6F 正名落地+#76 engine-ci 首跑红修闭环」），本轮整体覆盖；该文件被 2026-09-22-r26-audit-report.md 引用为审计对象——R26 审计指针现指向异物。历史轮次均用轮次后缀命名（2026-09-19-r23-audit-report.md 等） | git show aafb463:path；引用方 grep=r26-audit-report/BACKLOG/next-round | 中（可经 git 历史恢复；撞名制造陈旧引用陷阱，违留痕纪律精神） |
| P-01 | 过程纪律 | **commit message 缺 A-NNN**：WORKFLOW 2026-09-11 行明文「commit 必须以 A-NNN 起头或引用，便于后续 trace」；3f84d5f `feat(#77)` 未引 A-089。注：r26/r27 诸 commit 同样未带（纪律漂移已成惯性，非本窗独犯） | git log + WORKFLOW.md:286 | 低（明文规则与实际惯性不一致——建议修订规则或恢复执行，呈用户裁决） |
| O-01 | 观察项 | 73-check C2 用 raw 文件 hash、生成器用 norm(LF) hash——.gitattributes `* text=auto eol=lf` 强制 LF 下两口径恒等，非 CRLF 检出环境不可达 | .gitattributes 实物+两路 hash 实测同值 a9fd3ebfac0d | 信息级（不处置） |
| O-02 | 观察项 | 44-check G6 又钉滚动面字面（/T1.*#77.*✅/＋#78 在册）——与本窗摘除的六条字面钉同族，自我申报归 T3/#75批1 普查 | diff aafb463..3f84d5f 44-check hunk | 信息级（已自报） |

## 6. 处置建议（职责分离——审计窗不动手）

**建议打回修复窗口小返工（或呈报用户批准后修；无论谁修，修完必须重跑 §1 同套验收）**：

1. F-01 修法（任选）：①problems/drift 检查前移至 renderBlock 之前（missing 非空→先打印 PROBLEMS 退出）；②renderBlock 内 tp 缺失时收集进 problems 而非解引用。验收=重演本审计三案（template-missing/extra/lock-parse-empty 均输出归因行+exit 1）。
2. F-02 修法：本轮报告改名 2026-09-22-r28-report.md＋从 aafb463 恢复轮26 报告原文（回 2026-09-22-report.md 或另名 r26-exec-report.md）＋同步 BACKLOG/next-round 指针。验收=两文件并存、r26-audit-report 引用面复原。
3. P-01：未 push 分支可 `but reword` 补「(A-089)」；或用户裁定明文规则作废——二选一，不替裁。
4. O-01/O-02 不处置，入 T3 普查视野即可。

**重跑清单（返工后同套）**：npm run build / package / selftest / smoke（宿主 shell 或 env -u NODE_OPTIONS）＋ node engine/scripts/gen-acknowledgments.mjs --check ＋ 33/44/45/70/71/72/73/77-check ＋ xfail-run ＋ 39/40/41a/43——本审计全部实测命令如上，基线值全 PASS/exit 0。

## 7. 过程违规呈报（不替追认）

- 无隐瞒发现：xfail 七条摘除、33-H4/73-D1/44-G6/45-B5 断言演化、39/40/41a/43 修复手段（任务书锚点留痕+M-005 编年行）均在报告 §3/§5 如实披露，证据与自述一致。
- 待追认项保持待追认（D-102① 两键分离：执行侧已落/人工侧未自封）——合规。
- 违规候选=P-01（commit 缺 A-NNN，惯性漂移）＋F-02（撞名覆盖，留痕破口）——已列 §5，呈用户裁决。
- docs/agents/issue-tracker.md 缺席（code-review skill 前置）：本仓以 .scratch spec/ledger/BACKLOG 充当 spec 源，等价物在位——记为环境注记非违规。

---
审计人：独立审计 Agent 窗｜方法：硬验收亲跑+实物抽查+双轴评审（Standards/Spec 并行子代理）+D-xxx 逐条核对｜评审输入=.code-tmp/audit-r28/{diff.patch,spec.md}
