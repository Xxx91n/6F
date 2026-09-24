# 2026-09-24 轮 32 执行报告（r32-exec 栈）

## 1. 范围与决策

执行序（next-round.md 任务书）：T0 守卫基线 → T1 #81 quarantine 方言归一 → T3 #82 仓务批 → T2 #80 步② 主线。
覆盖决策：D-128/D-100②/D-103/D-106/D-118（#81）；D-129/D-130/D-131/D-132/D-133（#82）；D-122/D-123/D-126（#80 步②）。

## 2. 变更与文件

**T0（commit rly）**：CHANGELOG ledger_pointer 区间更新至 D-133；44-check 前补 M-010 空行；两处判定为合法文档漂移非回归。

**T1 #81（commit vpq）**：
- engine/src/intake/quarantine.ts：GIT_ISO_DIALECT_RULES + absorbGitIsoDialect（唯一规则 tz_offset +00:00→Z）
- engine/src/audit/macro-b.ts：边界吸收接两处 git %cI 输出 + gitRunner 注入缝 + probeGitVersion 抽出
- engine/src/audit/audit.ts：audit-measurements.json 新增 collection_environment 披露块（git 版本/规则/吸收事件聚合）
- engine/test/dialect-boundary.test.mjs：19 断言（双方言同 stats、不入 quarantine 事件、真实仓探针 all-clean）
- 披露禁面达成：Intake Health/golden 比对面/⚠ 标记均不触

**T3 #82（commit yyu）**：
- engine/scripts/gen-adr-index.mjs + docs/adr/README.md 生成式索引（23 行，双格式解析：新 `# ADR-` 式 + 旧裸 H1/\*\*Status:\*\* 式）；npm gen 链接管；README/README.zh-CN 仓图行改指索引（zh-CN sync 戳随指纹再生）
- engine/scripts/check-dist.mjs 棘轮（cap=实测 231,516B×1.25=289,395B，抬限走 reviewed PR）；engine-ci.yml rebuild-diff 链挂棘轮+--ignore-space-at-eol+if:failure() upload-artifact
- 33-gate-registry.json 新增 first-external-contributor 事件 occurred=false（仓内自创机制如实标注）
- BACKLOG #80 票面勘误两处：golden 锁面枚举对齐 manifest 自声明（D-132④）+ D-038 位点类比非字面接入（D-131③）
- 82-check.mjs 新守卫 15 断言

**T2 #80 步②（commit mkq）**：
- engine/src/fact/file-card.ts：纯逻辑卡构建器——kernel facet_rows 逐字段直投带 citation 锚；derived=hotspot_priority_v1（percentile_rank scope=repo 中位秩/top_n_flag n=20/priority_band pct≥0.9 high ≥0.6 medium）；narrative 键名引用+validateFileCardCitations 验键存在
- advisory 结构性隔离（schema 无 verdict/gate 字段+advisory:true）；失败三态（new_file/insufficient_history→derived suppressed_by 留痕；binary→card_type:not_applicable）
- miss 四类显式态：never_collected(cli_guidance)/not_tracked_at_sha(available_head_shas)/not_applicable/renamed_to(lineage_edge+revalidated 逐请求重验证)
- engine/src/fact/projection.ts：projectFileCard——观测集=repo_ref@sha 分组 MAX(observed_at) 最新默认，at pin 精确/≥7 前缀常量纪律，LIKE ESCAPE 防注入
- engine/src/audit/file-card.ts：runAuditFile lazy 补采=同构发射管线（collectCodeloreFacets+collectFileLineage 复用）仓级重跑 append 非覆盖；SHA 可达资格检（AUDIT-FILE-SHA-UNREACHABLE）；脏工作区零感知；collectors 注入缝；SWMR 写先关后读
- engine/src/mcp-server.ts：file_card 只读工具（永不写，miss→cli_guidance 指 CLI）；repo_path 可选探 staleness
- engine/src/cli.ts：audit file <repo> <file> --db <duckdb> [--at sha] 子命令（拦截先于通用参数循环）
- engine/test/file-card.test.mjs：17 断言入 smoke 链；narrative.test.mjs M1 工具面钉更新；80-check.mjs G 段 8 断言

## 3. 证据（命令+输出摘要）

| 验证 | 命令 | 结果 |
|---|---|---|
| 编译 | `env -u NODE_OPTIONS npm run build`（engine/） | BUILD OK / BUNDLE-OK dist/cli.js |
| 打包 | `npm run package` | macro-audit-0.1.0.tgz |
| 测活 | `node dist/cli.js selftest` | {\"ok\":true} 5 检查全过 |
| smoke | `npm run smoke` | 22 册全绿（含 DIALECT-BOUNDARY 19/19、FILE-CARD 17/17） |
| 守卫 | 17 守卫脚本全跑 | 全绿（33:31 39:28 40:57 41a:38 43:28 44:59 45:51 70:13 71:16 72:16 73:14 77:16 78:42 80:28 81:18 82:15 xfail:0 登记） |
| 棘轮 | `node scripts/check-dist.mjs` | DIST-RATCHET PASS 253,903B/289,395B |
| gen 幂等 | `npm run gen` 双跑 | docs/adr/README.md 字节一致 |
| #81 e2e | `node dist/cli.js audit . --out <tmp>` | collection_environment 披露块在、Intake Health 全 clean 无方言泄漏 |
| #80 e2e | `audit file D:/Aworker/6F engine/src/cli.ts --db <tmp>` | exit0 backfilled=true emitted=203 card_type=file-audit-card drift=fresh advisory=true kernel=[coupling,function-hotspots,hotspots] |
| MCP e2e | stdio tools/call file_card | hit=full 卡 / miss=not_tracked_at_sha+guidance / pin 缺席=not_tracked_at_sha+available_head_shas |

## 4. 守卫结论

基线 15/15→修复后全绿；新增 81-check(18)、82-check(15)、80-check G 段(+8→28)；70 清单再生 57 守卫/1366 emit 位。漂移判定三处均为合法文档漂移（CHANGELOG 指针/M-010 空行/78-check C1 接线序钉），修复后复跑全绿。

## 5. 限制与递延

- #80 步③（双仓实跑+边界件 0-switch+披露四件套+benchmark 预登记）未启动——依赖步②已就位，下轮主线。
- codelore percentile/top_n 基于 hotspots 面行对象字段（revisions/hotspot_score）；codelore 缺席仓的卡=kernel 空+derived null+miss 态照答。
- audit file 补采触发=集缺席或 subject 缺席即仓级重跑（幂等：同 HEAD 重跑 emitted=0）；粒度纪律照票面。
- 未 push/merge——栈 r32-exec 叠于 r31-closeout 之上（BACKLOG.md 同源冲突依 GitButler 提示栈序化，提交仍分道）。

## 6. 下一步

- #80 步③：试点三角（jiahao+env-manager）双仓实跑、miss 四类 0-switch 边界件逐类点名、renamed_to 1-switch 成对件、benchmark p95 分档+双阈值预登记、披露四件套。
- 闸门纪律维持：push/merge 逐次授权。
