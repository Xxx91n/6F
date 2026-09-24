# 2026-09-24 轮 32 审计报告（r32-exec 栈 · 审计窗）

## 0. 结论

**有条件通过**——硬验收面 100% 亲跑复现全绿，报告关键声明逐条实物抽查成立，无虚构证据；但双轴评审发现 **1 个守卫真空断言 + 3 个 spec 缺口/偏差 + 小疵包 + 过程违规 4 项**。审计窗不动手修：返工清单见 §5（建议打回执行窗），过程违规 §6 呈报不替我追认。

栈：`r32-exec` = 9cf30c6(T0)→4e2dc3c(#81)→ad0f3b3(#82)→652ebc9(#80步②)→97a0948(docs)，基线 55d6ae1（r31-closeout）。未 push/merge 属实。审计取证工作区 = `D:\Aworker\6F\.scratch\macro-audit\audits\r32\`。

## 1. 硬验收重跑（审计窗亲跑，不信自述）

| 项 | 命令 | 报告自述 | 审计复跑 |
|---|---|---|---|
| 编译 | `cd engine && env -u NODE_OPTIONS npm run build` | BUILD OK / BUNDLE-OK | ✅ BUNDLE-OK dist/cli.js |
| 打包 | `npm run package` | macro-audit-0.1.0.tgz | ✅ 246.4kB / 85 件（npm pack --dry-run 产物名一致） |
| 测活 | `node dist/cli.js selftest` | ok:true 5 检 | ✅ ok:true 5/5（selftest detail 已含 file 模态） |
| smoke | `npm run smoke` | 22 册全绿 | ✅ 22 册全绿；QUARANTINE 58/58、DIALECT-BOUNDARY 19/19、FILE-CARD 17/17、AUDIT-ZERO-WRITE 4/4 |
| 守卫 | 16 个 NN-check + xfail-run | 计数表 | ✅ 逐个数一致：33:31 39:28 40:57 41a:38 43:28 44:59 45:51 70:13 71:16 72:16 73:14 77:16 78:42 80:28 81:18 82:15，xfail 0 条 |
| 棘轮 | `node engine/scripts/check-dist.mjs` | 253,903B / 289,395B | ✅ 字节一致 PASS |
| gen 幂等 | `npm run gen` ×2 | 字节一致 | ✅ 6 个产物文件 sha256 双跑前后全等 |
| #81 e2e | `audit . --out <tmp>` | collection_environment 在、Intake clean | ✅ measurements 块在（git_version / rules=[tz_offset/+00:00→Z] / absorbed_total=0 / events=[]）；Intake Health 两字段恒等式 PASS、normalized=0；report.md 唯一 ⚠ = supply-chain 旧印记（非方言泄漏） |
| #80 e2e prefetch | `audit file … --db 已有库` | hit 卡 | ✅ source:prefetch、三层卡齐、advisory:true、key_check.ok |
| #80 e2e backfill | `audit file … --db 新库` | backfilled=true emitted=203 | △ backfilled=true emitted=**197**（机制成立；计数差 ±6 未解释→F9） |
| MCP e2e | stdio tools/call file_card | hit/miss/pin 三态 | ✅ hit=full card；miss=not_tracked_at_sha+cli_guidance；pin 缺席=not_tracked_at_sha+available_head_shas |
| dist 复现性（审计加项） | sha256 工作树 vs commit blob | — | ✅ dist/cli.js、dist/mcp-server.js 与 97a0948 提交 blob 字节级一致——rebuild-diff 不变量独立自证 |
| 脏区零感知（审计加项） | cli.ts 工作树加复杂度函数→fresh-DB 补采 | 零感知 | ✅ facet 行逐值不变（cognitive=253、score 不变）、emitted=197 同数——codelore 腿读对象库非工作树字节 |

## 2. 声明→证据→结论（关键声明逐条）

| # | 报告声明 | 审计证据 | 结论 |
|---|---|---|---|
| C1 | GIT_ISO_DIALECT_RULES + absorbGitIsoDialect，唯一规则 tz_offset +00:00→Z | quarantine.ts §4b：枚举面恰一条 `{rule_id:'tz_offset/+00:00→Z', match:/\+00:00$/, canonical:'Z'}`；吸收器纯函数不 throw、未命中原样放行 | ✅ |
| C2 | macro-b.ts 两处 %cI 边界吸收 + gitRunner 缝 + probeGitVersion 抽出 | 两处调用点实测（headRaw→anchor 分类、parts[2]→分类）+ dialectAbsorptions 收集；probeGitVersion 独立导出 | ✅ |
| C3 | audit-measurements.json 新增 collection_environment 披露块 | audit.ts 装配 git_version + instrument_dialect{rules, absorbed_total, by_rule, by_field, events≤20 raw_echo}；e2e 实测块在 | ✅ |
| C4 | 披露禁面：Intake Health / golden 比对面 / ⚠ 均不触 | Intake Health 节无方言项；engine/fixtures + test/fixtures 全目录零命中 collection_environment/dialect；吸收事件不进 FieldEvent/quarantine_log | ✅ |
| C5 | dialect-boundary.test.mjs 19 断言 | 实跑 DIALECT-BOUNDARY 19/19 PASS（A0-A6/B1-B2/C1-C7/D1-D3） | ✅ |
| C6 | gen-adr-index 生成式索引 23 行、双格式解析 | 脚本在：H1 两形 + Status 两形解析；docs/adr/README.md 32 行含 do-not-edit 注记 + ADR-0001~0023 全册；npm run gen 链接管 | ✅ |
| C7 | check-dist 棘轮 cap=231,516×1.25=289,395 | 常量 289395 注释载明初值与「抬限走 reviewed PR」纪律；非 verdict/gate 面 | ✅ |
| C8 | engine-ci rebuild-diff 链挂棘轮 + ignore-space + upload-artifact | yml 实证三件全在（棘轮居 rebuild-diff step 首行；--ignore-space-at-eol；if:failure() upload-artifact） | ✅（作用域偏宽记 F7-j） |
| C9 | 33-gate-registry first-external-contributor occurred=false 如实标注 | events 项在、note 载「本仓自创机制如实标注」 | ⚠️ 事件在但 items 零绑定（F2） |
| C10 | BACKLOG #80 票面勘误两处 | 行 101 实测两处勘误注记（manifest 枚举对齐 / D-038 位点类比） | ✅ |
| C11 | file-card.ts 三层卡契约 | 源码+e2e 卡实证：facet_rows 逐行带 fact_ref/observed_at/evidence_ref；percentile 中位秩 scope=repo、top_n n=20、band ≥0.9 high/≥0.6 medium | ✅ |
| C12 | advisory 结构性隔离 | schema 无 verdict/gate 字段名；advisory:true 恒定；priority=排序语义注释在 | ✅ |
| C13 | 失败三态 + miss 四类显式态 | new_file/insufficient_history→suppressed_by 留痕；binary→not_applicable；MissState 四枚举；renamed_to{lineage_edge, revalidated 逐请求重验证} | ✅（F6 弱化项） |
| C14 | projectFileCard 观测集 MAX(observed_at) 最新默认 + at pin + LIKE ESCAPE | 源码实证：GROUP BY repo_ref ORDER BY last_obs DESC, repo_ref ASC；pin 精确或 ≥7 前缀；likeEscape '!'-族 | ✅（F7-a 前缀唯一性未验歧） |
| C15 | runAuditFile lazy 补采同构管线 + SHA 可达 + 脏区零感知 + SWMR | 源码+fresh-DB 实测；AUDIT-FILE-SHA-UNREACHABLE 在；collectors 注入缝在；写先关后读在；脏区实验值不动 | ⚠️ 主干成立；**补采写环无 runInTransaction**（D-122③ 引 D-115 事务未落→F3） |
| C16 | MCP file_card 只读永不写 miss→cli_guidance | mcp-server.ts 无 openWriter/appendFact/runAuditFile；miss 实测带 guidance | ⚠️ guidance 用仓名实测 PATH-NOT-FOUND（F4）；缺库→isError 非 never_collected 卡（F5） |
| C17 | cli.ts audit file 拦截先于通用参数循环 | 源码实证 args[0]==='file' 前置块 + 三闸（--db 必填/--at/未知旗标拒+CFA 注记） | ✅ |
| C18 | 80-check G 段 +8→28 | G1-G8 八断言实测在且全 PASS | ✅ |
| C19 | CHANGELOG ledger_pointer→D-133 + M-010 | M-010 在（D-128~133 / A-001~091），指针更新属实 | ✅ |
| C20 | 提交分道 T0/#81/#82/步②/docs | git log 五提交序与归属一致 | ✅ |

## 3. 双轴评审（code-review 技能——Standards/Spec 并行子代理取证；首轮撞模型 rate-limit，重试一轮完成）

### Standards 轴
- 硬发现：① 82-check.mjs:25 真空断言（F1）；② 两处丢尾行（F7-b）。
- 判断性提示：headShaOf 重复实现（audit/file-card.ts 自写 vs file-card.ts 已导出 headShaOfRepoRef）；missCard/buildFileCard 的 observation+staleness 块重复；projectQuarantine 未复用 normalizeFactRow（半重构）；mcp-server.ts:4 头注「唯一暴露 tool=facts」过时（现 3 工具）；audit/file-card.ts:58 注释引不存在的 microBCtx（实为 macroBContext）；file-card.test.mjs existsSync 未用 import；appendFact 吞全部 constraint 类错误非仅 fact_id 幂等撞键。
- 清白区：quarantine.ts / macro-b.ts / audit.ts / cli.ts 与既有约定一致；dist 入库属在案决策（D-067/D-076）不评；33-gate-registry churn 已证实纯机械重排（见 V1）。

### Spec 轴
- (a) 缺/弱：D-125② 投影层血缘缝合无步骤认领（F10）；补采写无事务（F3）；MCP 缺库→isError 非 never_collected（F5）；集内 not_tracked 缺 available_head_shas（F6）；pin 前缀未验歧（F7-a）；golden 一次性再生本宿主无差集工件（F11）。
- (b) 跑偏/超界：registry 全量重缩进 + 丢尾行（V1/V4）；upload-artifact if:failure() 偏宽（F7-j）。
- (c) 实装但错：82-check A3 字符类 bug（F1）；cli_guidance 仓名不可跑（F4）；44-G6 标签仍称 T1 行（V2）。
- 禁项集核验：切片当一等事实 / 双写 / lazy 升格 / 删 facet_rows / 大小写折叠 / 血缘进身份 / stale 拒答 / miss 单态 / renamed_to 无验证 / worktree 感知 / A-E 判语——全绿无犯。

## 4. D-xxx 逐条覆盖核对

| D | 宣称覆盖 | 审计结论 |
|---|---|---|
| D-128 | #81 方言归一 | ✅ ①范畴立法（注释+枚举面）②边界归一在分类器上游 ③normalized 收窄+dormant 保留 ④双轴披露独立面（载体=run 元数据，票面 impl 参数裁量内；注：report.md 人读面无环境节，披露仅机读件）⑥impl 参数落位。⑤golden 再生本宿主无差集→F11 |
| D-100② | scoped revised | ✅ +00:00→Z 移出字段病态计数（实测双方言 fieldStats normalized=0），normalized_tz_offset 留词表休眠 |
| D-103 | 分类器挂点不动 | ✅ 判定/处置分界未动，吸收在分类器上游 |
| D-106 | quarantine_log 载体 | ✅ 未动；方言事件不入表（设计如此） |
| D-118 | dormant/open-ended | ✅ B1/B2 断言钉 dormant 保留 defense-in-depth |
| D-122 | #80 步② | ⚠️ ①预采集投影②双通道③lazy 双态全中；但③括注「D-115 事务」未落→F3；④披露四件齐；⑤benchmark 系步③明列 |
| D-123 | 三层卡契约 | ✅ ①②③④⑥全中；⑤失败三态在（kernel 行残留读法分歧→F8 呈报） |
| D-126 | 查询语义 | ⚠️ 主干全中；③集内 not_tracked 枝缺 available_head_shas→F6 |
| D-129 | dist 维持+棘轮 | ✅ ③棘轮+两减痛件落地 |
| D-130 | 索引+触发器 | ⚠️ ②gen-adr-index 成立；③事件在但无 watch item 绑定→F2 |
| D-131③ | #80 票面勘误 | ✅ |
| D-132④ | golden 锁面枚举勘误 | ✅ |
| D-133 | 分票排序 | ✅ 票序 vpq→yyu→mkq；waived-research 先例在账 |

## 5. 发现清单

### 必修（建议打回执行窗返工）
- **F1** `82-check.mjs:25` `/[ADR-d{4}]/g` 是字符类非 `\[ADR-\d{4}\]`——`rows>=23` 真空（实测 buggy 式=517 hits / 正确式=23）；A3 另两臂（ADR-0022/0023 在册）仍有效，属臂级失效非全空。本仓 vacuity 纪律（70-check 普查+轮18 先例）下这是真缺陷。修：改正则，建议断言行数恰为枚举数。
- **F2** first-external-contributor 仅入 events，items 零绑定 trigger_event——触发器触发无物。spec=#82③/D-130③ 按 registry 惯例须 event_bound watch item 指向该事件。修：补 items 行（watch:event_bound + trigger_event + owner/verify_method 等五要素照形）。
- **F3** runAuditFile 补采写环未包 runInTransaction（D-122③ 明示 D-115 事务）——中途失败留残观测集：repo_ref=head 匹配即止，已写 subject 的残集静默上桌（未写 subject 的下次 miss 自愈）。修：appendFact 批包事务（与批量路径 audit.ts 同形）。
- **F4** MCP miss 的 cli_guidance 用仓名拼 `audit file 6F …`——repoAdd 三段式不认裸名，实测 `PATH-NOT-FOUND`。修：repo_path 给时用它，缺则如实降级指引文案。

### 建议修（小疵包，可同批）
- **F5** MCP db 缺席→MCP-FILECARD-ERROR isError 文本，非 never_collected 卡+guidance（D-126③ 首义 miss 形态未达 MCP 面）。
- **F6** 集内 not_tracked_at_sha 不带 available_head_shas（pin 枝有）——「可提示 at: 其他 sha 试探」机制两枝不齐。
- **F7** 小疵集：a) at pin ≥7 前缀「唯一」未验歧（filter[0] 取最新）；b) package.json + 33-gate-registry.json 丢尾行；c) headShaOf 重复实现；d) mcp-server.ts:4 头注过时；e) 注释引不存在 microBCtx；f) file-card.test.mjs 未用 existsSync import；g) appendFact constraint 吞类宜收窄 fact_id UNIQUE；h) FILE_CARD_SET_CAP 截断无卡面标记；i) 80-check F1 BOM 钉集冻结在步①文件清单（本轮实测零 BOM，钉面滞后非失效）；j) upload-artifact if:failure() 为 job 级——任一前步失败都传 dist。

### 呈报待裁（审计不裁）
- **F8** 失败态（new_file/insufficient_history）derived 抑制但 kernel facet_rows 仍载 hotspots 等历史派生行——D-123⑤「显式态仅静态指标」读法分歧（kernel 直投全量 vs 仅静态度），建议票面裁。
- **F9** 报告自述 backfill emitted=203，审计复跑=197（同 HEAD 5f6a23b、同 fresh-DB 路径）——机制验证全中，计数差 ±6 未解释（疑 file_subject_skip 等环境敏感行）。请执行窗复核或报告侧勘误。
- **F10** D-125②「卡投影沿血缘链缝合跨改名历史」无步骤认领（步②票面枚举未列、步③预告未提）——孤儿需求风险，建议下轮票面显式归口。
- **F11** #81「golden 一次性再生」仓内无工件可证（本宿主方言本即 Z 不产生差集）——跨宿主稳定声明属不可仓内证伪项，如实登记。

## 6. 过程违规呈报（不替执行窗追认）

- **V1** 33-gate-registry.json 全文件重缩进（1sp→4sp，1459 行全变）搭车 +1 事件——语义差集经审计深比对证清白（events +1 无删改、items 54=54 零修改、meta 同），但 diff 可审性差且丢尾行，与「diff 小、可审」约定有张力。
- **V2** 44-check G6 断言放宽（去 T1 行锚）后断言名仍写「T1 行含 #77」——名实不符；放宽本身在 commit rly 已声明属任务书换代容忍，定性合法但标签应同步。
- **V3** 报告 §4 把 78-check C1 断言更新归为「合法文档漂移」——实系 #81 接线变更的断言跟进（代码注释已正确注明），报告定性口径小误。
- **V4** package.json 丢尾行（同 V1 一族的卫生回退）。
- 过程事实登记：评审子代理首跑撞模型 rate-limit，重试一轮完成；审计窗对仓库的写=重跑产物（dist 重建与已提交件字节等同）+ .scratch 取证工件 + cli.ts 脏区实验（已字节级还原，sha256 回证）。

## 7. 修复后重跑清单（同一套验收）

1. `cd engine && env -u NODE_OPTIONS npm run build && npm run smoke`（22 册全绿，含 dialect-boundary 19/19、file-card 17/17）
2. `node dist/cli.js selftest` → ok:true；`npm run package` → tgz
3. 全守卫：`for n in 33 39 40 41a 43 44 45 70 71 72 73 77 78 80 81 82; do node .scratch/architecture-recovery/reports/$n-check.mjs; done` + `xfail-run.mjs`——82-check 修后 A3 须真测行数
4. `node engine/scripts/check-dist.mjs` 棘轮 PASS；`npm run gen`×2 幂等
5. F3 修后专项：人为中断补采（发射中 kill）→再查卡→观测集不留残（建议新断言入 80-check G 段或 file-card.test）
6. F4 修后专项：MCP miss 应答 cli_guidance 串逐字可跑（真实 repo_path 验 PATH-NOT-FOUND 不再现）
7. F2 修后专项：33-check 仍绿 + registry items 含 first-external-contributor 绑定行
8. F5/F6 修后专项：MCP 缺库→never_collected 卡；集内 not_tracked 带 available_head_shas

## 8. 取证工件（均在 `D:\Aworker\6F\.scratch\macro-audit\audits\r32\`）

- `full-diff.patch`（340KB，55d6ae1..97a0948）＋ `commits.txt`
- `e2e-audit\{report.md,report.json,audit-measurements.json,facts.duckdb,audit-facts.jsonl}`（#81 e2e 全量产物）
- `dirty-facts.duckdb`（脏区实验）＋ `cli.ts.bak`（已还原）
- `mcp-e2e.cjs`（stdio 三态取证脚本）、`dbcmp.cjs`（库内事实对比脚本）
