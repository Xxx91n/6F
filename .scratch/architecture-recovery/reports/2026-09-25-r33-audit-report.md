# R33 审计报告 — #83 R32 审计建议修批复核（分支 r33-83-audit-fix / commit 4b6171f）

> 审计窗 2026-09-25。对象=轮 33 T1 实施窗报告 `D:\Aworker\6F\.scratch\macro-audit\reports\2026-09-25-r33-exec-report.md`＋交接 `D:\Aworker\6F\.scratch\macro-audit\handoffs\2026-09-25-r33-impl-handoff.md`，票面=BACKLOG #83＋任务书 T1＋账本 D-134/D-135/D-136。职责分离：本窗零代码零文档修复，仅出报告＋取证工件（`D:\Aworker\6F\.scratch\macro-audit\audits\r33\`：review-diff.patch / mcp-f5.cjs / duckdb-errprobe.cjs / violation-scan.cjs）。

## 判定

**有条件通过**——硬验收面审计窗亲跑 100% 复现全绿，报告 18 条完成定义逐条实物抽查全成立，双轴评审无功能性缺陷、无 spec 缺口、无 scope creep；但发现 **1 项过程违规（名实不符，R32-V2 同型）＋3 项文档级必修小疵**，按职责分离打回修复窗（§5 清单，全为标签/注释/格式更正，零语义变更），修后按 §6 重跑同套验收。

## 1. 硬验收亲跑复核（不信自述）

| 验收项 | 命令（engine/，env -u NODE_OPTIONS） | 实测结果 | 结论 |
|---|---|---|---|
| 编译 | `npm run build` | exit 0，tsc 零错＋BUNDLE-OK dist/cli.js | ✅ |
| 打包 | `npm run package`（=npm pack --dry-run） | filename macro-audit-0.1.0.tgz，total files: **85**（与报告一致；dry-run 不落文件符合既有口径） | ✅ |
| 启动测活 | `node dist/cli.js selftest` | {"ok":true} 五 checks 全 pass | ✅ |
| MCP stdio 实物握手 | `node .scratch/macro-audit/audits/r33/mcp-f5.cjs`（spawn dist/cli.js mcp＋NDJSON） | initialize ok→tools/list=[facts,quarantine,file_card]→file_card(缺库)=**card_type:miss / never_collected / isError=false / cli_guidance 用 repo_path 实路径** | ✅ |
| dist 棘轮 | `node scripts/check-dist.mjs` | DIST-RATCHET PASS **257947B / cap 289395B**（字节数与报告逐字一致） | ✅ |
| gen 幂等 | `npm run gen` ×2 | 两次后 `git status --porcelain`=0 行（零漂移） | ✅ |

## 2. test 闭环亲跑

- `npm run smoke` exit 0——**22 册全绿**（逐册汇总行实物核对：SMOKE 6/6│COLLECTORS 14/14│ADAPTER 7/7│BATCH1 41/41│MICRO-B 18/18│LLM 25/25│PREVIEW 5/5│INTAKE 40/40│GITCLI 11/11│SQL-LIT 17/17│MCP-DB 12/12│AUDIT 26/26│DEMO 38/38│GH-REST 56/56│UPSTREAM 21/21│NARRATIVE 34│CITATION 38│DOCTOR 9│QUARANTINE 58/58│ZERO-WRITE 4/4│DIALECT 19/19│**FILE-CARD 26/26**），零 FAIL/AssertionError 行。
- 守卫组 18 件全绿（亲跑）：33:31/31 39:28/28 40:57/57 **41a:38/38 复绿** 43:28/28 44:59/59 45:51/51 70:13/13（58守卫/1385emit 与 A-092 一致）71:16/16 72:16/16 73:14/14 77:16/16 78:42/42 80:28/28 81:18/18 82:15/15 **83:19/19** xfail-run PASS entries=0/10。

## 3. 声明→证据→结论 对照表（报告 §一 18 行＋关键实现）

| # | 报告声明 | 审计窗独立取证 | 结论 |
|---|---|---|---|
| 1 | D-134① 双臂全落 | store.ts:350 `isFactIdUniqueViolation`（Constraint Error＋unique constraint＋"fact_id: 三件套）＋:358 `existingFactIds`（WHERE IN 分批500）；file-card.ts:119 事务内预查/:130 收窄 catch/:116 `runInTransaction` 包裹→非指名错上抛 | ✅ 成立 |
| 1' | D-134④ DuckDB 实物钉 | **审计窗独立复探**（errprobe.cjs，@duckdb/node-api 1.5.5-r.5）：ownKeys=[stack,message]；dup-unique='Constraint Error: Duplicate key "fact_id: f1" violates unique constraint.'／NOT NULL/CHECK/PK 形态与报告 §四 逐字一致；判据三路行为验证：dup fact_id→true、NOT NULL→false、dup PK→false | ✅ 成立 |
| 1'' | D-134④ 违例扫描 | violation-scan.cjs READ_ONLY 复扫：e2e-audit/facts.duckdb total=608／dirty-facts.duckdb total=197，fact_id_dup/fact_seq_dup/notnull_viol/seq_gaps 全 0 | ✅ 成立 |
| 2 | emitted/skipped 分列 | AuditFileResult.skipped:50；写循环已存命中+批内重号+收窄 catch 三源计数（:122/:131）；cli.ts:173 出参 | ✅ 成立 |
| 3 | H2 毒事实回滚零行 | test:389 注入 trace_id CHECK 违例→threw=true＋库内 COUNT=0（真 git 仓+真 DuckDB） | ✅ 成立 |
| 5 | F5 缺库结构化卡 | mcp-server.ts:159-174 existsSync→buildFileCard never_collected；isError 仅留库在查询失败；**stdio 实测 isError=false** | ✅ 成立 |
| 6 | F6 集内枝补 available_head_shas | file-card.ts:241（另 :186/:200 pin 枝）；test D2:197 断言 [SHA_A,SHA_B] | ✅ 成立 |
| 7 | D-136 收口 | FILE_CARD_STATIC_FACETS=28（逐名数）＋HISTORY_DERIVED=5；:298 fail-closed→suppressed_facets 带 reason=failure（FailureState\{ok} closed 词表）；raw 层零 diff | ✅ 成立 |
| 8 | F7a 歧义验重 | projection.ts:93-101 精确直取/≥7 前缀=1 命中直取/>1→pinAmbiguous 全披露；file-card.ts:182-189 not_tracked_at_sha＋slice(12) 回显 | ✅ 成立 |
| 9 | F7c~j 卫生七件 | c=headShaOfRepoRef 单实现（本地 headShaOf 已删）／d=mcp 头注三工具／e=microBCtx 死引用改述（afSrc 已无该词）／f=test existsSync import 清零／h=set_truncated+COUNT 判定（projection.ts:113）／i=80-check F1 钉面扩至步②全量／j=ci.yml:49 steps.rebuilddiff.outcome=='failure' | ✅ 成立 |
| 11-17 | build/package/selftest/test/守卫/棘轮/幂等 | 见 §1/§2 亲跑 | ✅ 全成立 |
| 18 | 账面随行 | BACKLOG.md:104 #83 ✅闭环行／A-092 账本行／CHANGELOG M-011:86+M-012:93 | ✅ 成立 |

## 4. 双轴评审（$code-review 平行子代理＋审计窗复核）

### Standards（仓库规范+Fowler 味基线）

- **硬违例**：①83-check.mjs G1 标签＋A-092 账本行＋impl-handoff 三处称断言组含「D6」——test 文件无 D6（F6 实证=D2），exec-report 自身写「D2 断言扩展」=四件自相矛盾（名实不符，R32-V2 同型过程违规）；②file-card.ts:118 注释「skipped=已存命中＋批内重号」漏第三源（收窄 catch 命中）；③CHANGELOG `## [M-012]` 与 M-011 impact 行间缺空行（文件自体式）。
- **判定项**：audit/file-card.ts 同一模块两条 import（琐碎重复）；cli_guidance 三态式×4（小重复）；83-check B2 标签「两枝补齐」超断言力（仅 indexOf≥0——行为面由 D2 实跑覆盖非真空）。
- **清白实证**：src↔dist 全对等（tree-shake 剔除纯测试导出属正常）；无格式化搭车；新守卫与 80-check 模板同型；classifyWriteError 主链保留（audit.ts:416 io→AuditIoError/余→QUARANTINE-CONSTRAINT——两链两义漂移随收窄归一，D-134⑤ 架构事实登记成立）；新 SQL 全过 assertAppendOnly；零新依赖。

### Spec（BACKLOG #83＋D-134~136＋F5~F7j）

- **逐项核对全中**：D-136 closed 双集＋C6 双向差集实测发射词表 33 名∅交集；F7a >1 命中不猜；收窄 catch 仅 fact_id UNIQUE；skipped 出参；F7i/F7j 全落。
- **欠交/偏弱**：D-134④「违例扫描留证」仅报告散文无可复跑工件归档（本审计窗已补 audits/r33/ 两脚本）；existingFactIds 全表预查 vs 票面「该观测集已存」字面差——**纠偏性正确**（fact_id UNIQUE 全局约束下全表扫描才是正解，注释已辩明）记为说明非缺陷。
- **疑似错（复核后排除）**：D-136 fail-closed 严于「滤除历史派生族」字面——与 D-136② closed 枚举条款一致属裁定内；SuppressedFacetReason 'not_applicable' 不可达成员——not_applicable 卡前置 return 不产生 suppressed 行，词表携带属声明完整（观察项：无 reconcile 断言）。

## 5. 打回修复窗必修清单（建议；全为标签/文档更正，零语义变更）

| M | 事项 | 判据 |
|---|---|---|
| M1 | 83-check.mjs G1 标签「D6」→如实（F6 实证=D2 断言组） | 守卫标签名实不符=过程违规（R32-V2 同型前例，必修更正非注记） |
| M2 | A-092 账本行「D6」字样按账本纪律更正/勘误 | 同上传染源；账本行处理遵账本规矩（勘误行或文本更正由修复窗裁） |
| M3 | file-card.ts:118 注释补齐 skipped 第三源（收窄 catch 命中） | 注释计数不全 vs 同函数 :131 实物 |
| M4 | CHANGELOG.md M-011 impact 行与 `## [M-012]` 之间补空行 | 文件自体式违例（全篇 `## [M-` 块均空行分隔） |

**观察项**（不阻塞闭环，登记随票）：O1 83-check B2 标签超断言力；O2 D-134④ 留证形式建议归档可复跑工件（审计窗已落 errprobe+scan 两脚本可收编）；O3 SuppressedFacetReason 'not_applicable' 不可达成员无 reconcile 断言；O4 F9（emitted 203→197 ±6）无票面处置行——skipped 机制落地后差值可解释（本窗复扫 dirty-facts=197 吻合），建议收口节补勘误一句；O5 BACKLOG.md 无尾行（pre-existing）；O6 impl-handoff 内「D6」字样随 M1/M2 同步更正；O7 exec-report §一 D-134 子项编号与账本错位（形态钉∈③、实物验证=④、⑤=架构事实登记——语义覆盖在但编号引用不精确，报告已 commit，登记不追改）。

## 6. 修后重跑清单（同套验收）

`env -u NODE_OPTIONS npm run build`（engine/）→`npm run package`→`node dist/cli.js selftest`→`npm run smoke`→守卫 18 件（33/39/40/41a/43/44/45/70/71/72/73/77/78/80/81/82/83/xfail-run）→`node scripts/check-dist.mjs`→`npm run gen`×2 后 porcelain=0。M1~M4 为标签/文档更正，预期全绿；若修中带语义变更按全面升级。

## 7. 过程违规呈报（不替追认）

- **P1**：断言组「D6」幻影名实不符——三处工件（83-check G1 标签/A-092 账本行/impl-handoff）引用不存在断言名，exec-report 写「D2」自相矛盾。同型=R32-V2（44-check G6 标签名实不符）已裁过程违规；本次属提交物内引用失准，定性「过程违规、语义清白」（F6 行为面由 D2+B2+MCP 实测三层覆盖，守卫 19/19 实绿）。
- **P2**：skipped 注释计数漏源（file-card.ts:118）——注释层欠准，代码层正确（:131 实物在）。
- **P3**：CHANGELOG 空行自体式违例。
- 清白面复核：本 commit 无格式化搭车（diff 全语义/生成件）；新文件无 BOM 有尾行；dist 随行；报告列 claim 无虚构证据；BACKLOG/账本/CHANGELOG 编年随行纪律履行。

## 8. 引用工件

- 复核 diff：`.scratch\macro-audit\audits\r33\review-diff.patch`（e07650a..4b6171f，1656 行）
- MCP stdio 测活：`audits\r33\mcp-f5.cjs` ／DuckDB 实物钉：`duckdb-errprobe.cjs` ／违例扫描：`violation-scan.cjs`
- spec 源：BACKLOG.md #83 行／decision-ledger.md D-134:906/D-135:907/D-136:908／handoffs\next-round.md T1／architecture-recovery\reports\2026-09-24-r32-audit-report.md §5
