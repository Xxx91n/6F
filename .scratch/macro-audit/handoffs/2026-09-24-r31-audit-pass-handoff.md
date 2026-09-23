# r31 audit-pass handoff——#80 Micro-B 步①审计收口 PASS → 步②(T2)接棒

## 状态摘要

- 分支：`r31-micro-b-step1`（wzt impl → nkn docs(reword 补 A-091 引用) → nmq 审计返修）；审计侧文书在 `r31-audit`（xvk=LOOP-1 FAIL 报告 + 本 handoff 同批 LOOP-2 PASS 报告）——均未 push，合并/推送逐次授权
- LOOP-2  verdict=**PASS**：三硬红（dist 裸 tsc 壳→bundle 规程恢复 / 41a-D6 编年漂移→M-009 补 / 80-check F2 空断言→includes 有牙）全修复实证；最终态全量验收本窗重跑全绿（tsc 0err/build 零漂移/package 81f/selftest ok/smoke 20 件 exit0/守卫 14 件全 PASS/golden --check OK）
- 文书：`D:\Aworker\6F\.scratch\macro-audit\reports\2026-09-24-r31-audit-loop2-report.md`（复审全档）＋`2026-09-23-r31-audit-report.md`（打回清单全目）
- 执行侧交接（步②复用件清单最详）：`D:\Aworker\6F\.scratch\macro-audit\handoffs\2026-09-23-r31-exec-handoff.md`——其中「dist 重建=npm run build」规程已纠正，可放心沿用

## 下一窗口=T2（#80 步② 投影+查询语义）

票面照 `D:\Aworker\6F\.scratch\macro-audit\handoffs\next-round.md` T2 行逐项（D-122/D-123/D-126）：
1. 文件卡 DuckDB 读模型投影（kernel 数据层逐字段直投+citation 锚 obs_at/fact_ref）；subject 查询侧同样过 normalizeSubjectPath（归一单点，miss 判定前先归一）
2. 确定性派生三件（priority_band 带规则版本/percentile_rank scope=repo/top_n_flag）+derivation 溯源；禁 A-E/GPA 形态
3. advisory 结构性隔离（schema 无 verdict/gate-consumable 字段+advisory:true+priority=排序非判定）
4. 失败三态 new_file/insufficient_history/not_applicable；miss 四类 never_collected/not_tracked_at_sha/not_applicable/renamed_to
5. at:<sha> pin（常量禁自动派生）+staleness 双字段照答不拒答+双引用层（path/血缘按查询时点、事实按 pinned sha）
6. renamed_to 条件跳转=沿 file.renamed 血缘链投影缝合+逐请求重验证，无血缘→降级 not_tracked
7. 双通道骨架：MCP tool 只读（miss→not_collected+CLI 指引，永不写）+CLI audit file（lazy 补采=同构发射管线复用 collectMacroB fileLineage/codelore 面，SHA 可达性闸，脏区零感知）

## 步②可顺修的留痕判断项（审计报告④-4 全目）

- reconcilePerFileVsAggregate 的 isFileBearing/rowRawPath 与 emit 同规则化（畸形对行假 mismatch 窗口——投影层消费对账前必修更稳）
- file_subject_skip 载荷两形态合一（emit 面四键 vs explain 面两键）
- file-lineage：from_raw 冗余字段处置；lineage_skip evidence 补 HEAD 与 argv 同源；parseRenameLogZ 截断尾边静默→协议面处置
- Micro-B ctx 字面量四重复制可抽 microBCtx(ctx)
- 文书残差：「smoke 19 件/第 19 件」→实 20 件/链第 5（exec-report §② 与 M-009 impact 行待勘误）

## 留用户裁决（步②开工前宜收口）

- S6 golden 锁面超「字段骨架非内容值」字面（方向=更严：锁 subject 规范化形/role/计数）——票面勘误为「骨架+定点值」或收窄生成器
- S1 fixture 体系落点（test/fixtures/micro-b/ 同构范式 vs D-038 fixtures/ 树字面接入）——文书已按同构范式措辞；若裁字面接入须注册 fixtures/golden/manifest.json

## 下一个 grill 方向指示

- 主轨=步②实现窗（T2 票面项即 grill 面已裁定的 impl 收口——残余 impl 参数：miss 字段命名/drift 形态/并发去抖/priority 阈值+分位 scope+指标键字典，按 D-126⑥/D-123⑦ 票面裁权内自决，不升级 grill）
- grill 候选（步②收尾后可开）：T5 枚举 open-closed 建制批——**D-123⑥ 指标集 closed 契约=第三案候选**（explain 9 面/遥测排除首案、D-098 致谢节第二案之后）；或 T10 触发器值守批（rubric 权重立案/R28-Q19 完整性复核债 D-121⑤ 挂账）
- 若用户对 S1/S6 裁决为「收窄/字面接入」，步②窗开工前先落裁决注记再动 schema（schema 冻结点纪律 D-127⑦）

## suggested skills

- `implement`+`tdd`（T2 主驱动，TDD seam 先写断言）；`code-review`（提交前自审）；`gitbutler`（VC 唯一写面——本仓 rebuild-diff 守门，dist 必须 npm run build 产 bundle 后同 commit）
- `diagnosing-bugs`（投影层 miss 状态机/renamed_to 跳转链验收）；`domain-modeling`（miss 四类/at:sha 语义建模若需）；`atomcode-research`（卡 schema/读模型先例调研——串行）
- `handoff`（步②收尾同规程再生）

## 避雷（两窗实证汇总）

- dist 版本化产物=**npm run build**（tsc+esbuild bundle 双段）——裸 npx tsc 覆写 cli.js 成 346 行裸壳，CI rebuild-diff 六腿红（本轮实证）；改 src 后 build 产物同 commit
- 账本行落盘即须编年随行（A-091→M-009 同款漂移上轮已立训又复发）——收口自述「守卫全绿」前必须最终态当窗重跑
- 守卫断言禁含未转义 `|` 正则（交替空分支=恒真空转）；断言要可假——includes 判据优先
- ctx_execute 写码用数组行 join（模板字面量被宿主吃转义）；宿主级测试 env -u NODE_OPTIONS；写文件后字节回读+BOM 检查
- GitButler 工作区下 `git status`/`git diff` 对另一分支已提交件会误显 D/??/MM——VC 态以 `but status` 为准；dist 对账用 `git show <commit>:<path>` 哈希比对