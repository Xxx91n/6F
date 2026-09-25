# R33 执行报告 — #83 R32 审计建议修批（D-134/D-135/D-136 + F5/F6/F7a~j）

> 轮 33 T1 实施窗（分支 `r33-83-audit-fix`）。覆盖决策：D-134（lazy 补采 constraint 吞错收窄）、D-135（修批单票/批内排序）、D-136（失败态投影收口）；关联：D-115①/D-122/D-123/D-126/D-095/D-059①。
> 验收标准原文：「编译通过、打包通过、启动并测活软件进程；每个平台都要有 test 闭环，避免只引入却没做到。」

## 一、完成定义清单（逐项）

| # | 票面项 | 状态 | 实证 |
|---|--------|------|------|
| 1 | D-134① 必修收窄：仅 fact_id UNIQUE 精确指认可跳，余者上抛回滚 | ✅ | 双臂全落：`existingFactIds` 写前预查（判定层消撞键）＋`isFactIdUniqueViolation` 收窄 catch（防御残留臂）；非指名错上抛→`runInTransaction` 回滚 |
| 2 | D-134② emitted/skipped 分列披露 | ✅ | `AuditFileResult.skipped`＋cli 输出 `skipped` 字段；skipped=已存命中＋批内重号＋收窄 catch 命中 |
| 3 | D-134③ 毒事实回归断言（非 IO 非指名错→回滚零行） | ✅ | `file-card.test.mjs` H2：注入 CHECK(trace_id) 违例→上抛＋库内 COUNT=0 |
| 4 | D-134④ DuckDB 消息形态钉 | ✅ | H3：真 DuckDB dup insert 实物断言 `Constraint Error`＋`"fact_id:`＋`unique constraint` 三件套＋NOT NULL/PK 负路 |
| 5 | D-134⑤ 落票前实物验证 | ✅ | §四 实物验证节（错误对象探察＋facts.duckdb 违例扫描留证） |
| 6 | F5 MCP 缺库→结构化 never_collected 卡 | ✅ | `existsSync(db)` 分支→`buildFileCard` miss 卡（isError=false＋cli_guidance）；J1 断言＋MCP stdio 实测 |
| 7 | F6 集内 not_tracked_at_sha 补 available_head_shas | ✅ | 集内枝补 `available_head_shas`（pin 枝既有——两枝补齐）；D2 断言扩展 |
| 8 | D-136 失败态投影收口 | ✅ | `FILE_CARD_HISTORY_DERIVED_FACETS`(5)＋`FILE_CARD_STATIC_FACETS`(28) closed 双集；`kernel.suppressed_facets` 带原因码；未声明 facet fail-closed；raw 层不动；`derived.suppressed_by` 保留；C4~C7 断言 |
| 9 | F7a pin ≥7 前缀歧义验重 | ✅ | 精确 40 位直取；≥7 前缀 >1 命中→`pinnedAmbiguous`→not_tracked_at_sha＋全部命中披露（不猜最新）；E3 断言 |
| 10 | F7c~j 卫生组七件 | ✅ | c headShaOf 去重（复用 headShaOfRepoRef）/d mcp 头注三工具/e microBCtx 死引用改述/f existsSync unused import 清除/h `kernel.set_truncated` 卡面标记＋COUNT 判定/i 80-check F1 BOM 钉面更新/j upload-artifact 步级收窄（`steps.rebuilddiff.outcome`） |
| 11 | 编译通过 | ✅ | `npm run build` → BUNDLE-OK（tsc 零错） |
| 12 | 打包通过 | ✅ | `npm run package` → macro-audit-0.1.0.tgz（85 files） |
| 13 | 启动并测活软件进程 | ✅ | `selftest` ok:true；MCP stdio 实物握手（initialize/tools-list/file_card→never_collected 卡） |
| 14 | 每个平台 test 闭环 | ✅ | smoke 22 册全绿；file-card.test 26/26（含新增 10 断言）；83-check 19/19 |
| 15 | 守卫基线全绿 | ✅ | 18 件守卫全绿（含 41a 复绿 38/38、83-check 新增） |
| 16 | check-dist 棘轮 | ✅ | DIST-RATCHET PASS 257947B/cap 289395B |
| 17 | gen 幂等 ×2 | ✅ | `npm run gen`×2 → 跟踪产物零漂移 |
| 18 | 账面随行 | ✅ | BACKLOG #83 ✅闭环＋A-092 账本行＋CHANGELOG M-011(R32 补)/M-012(R33) |

## 二、关键实现（裁定留痕）

1. **吞错收窄双臂**（D-134① 两臂全落而非二选一）：
   - 主臂=写循环前 `existingFactIds(writer, batchIds)` 预查——撞键消除在判定层，跳过分级可计数（skipped）；
   - 副臂=`isFactIdUniqueViolation` 收窄 catch——`Constraint Error`＋`unique constraint`＋`"fact_id:` 三件套精确指认，同事务单写者（A-007）下为防御残留；
   - 非指名错（PK/NOT NULL/CHECK/FK/IO）照常上抛→回滚=D-115① fail-fast 归位。
2. **DuckDB 错误对象实物**（2026-09-25 @duckdb/node-api 1.5.5-r.5 探察）：plain `Error`，ownKeys=`[stack,message]`，无 code/errno/errorType；消息形态=UNIQUE `"fact_id: X" violates unique constraint.`／PK `violates primary key constraint.`／NOT NULL `NOT NULL constraint failed: t.n`／CHECK `CHECK constraint failed on table t with expression ...`——指认按消息三件套，措辞漂移由 H3 实物钉防。
3. **D-136 fail-closed**：失败态卡面只放行 `FILE_CARD_STATIC_FACETS`(28) 声明面；历史派生五族＋一切未声明 facet 均入 `suppressed_facets` 带原因码（reason∈FailureState\{ok} closed）——防退化值与未知族冒名。双集成员级双向差集=C6 对账发射词表 33 名（新增 analysis 未分类即红）。
4. **F7a 歧义不猜**：前缀命中>1→`pinnedAmbiguous`→not_tracked_at_sha＋detail 披露全部命中 sha（slice 12 前缀回显）——不取 `[0]`。
5. **F7j 联动**：82-check B4 契约判据随步级化同步更新（钉收窄后形态，防同型回归）；70-check inventory regen（83-check 入册）。

## 三、可复跑证据（命令＋输出摘要）

```
cd engine && env -u NODE_OPTIONS npm run build
  → tsc 零错 + BUNDLE-OK dist/cli.js
cd engine && env -u NODE_OPTIONS npm run smoke
  → 22 册全绿：SMOKE-OK 6/6 | COLLECTORS 14/14 | CODELORE-ADAPTER 7/7 | BATCH1 41/41 |
    MICRO-B-EMIT 18/18 | LLM 25/25 | PREVIEW 5/5 | INTAKE/GITCLI/SQL-LITERAL/MCP-DB/AUDIT/
    DEMO/GITHUB-REST/UPSTREAM-MAP/NARRATIVE/CITATION 38/DOCTOR 9/QUARANTINE(H1~H2)/
    AUDIT-ZERO-WRITE 4/4 | DIALECT-BOUNDARY 19/19 | FILE-CARD 26/26
node dist/cli.js selftest → {"ok":true,...} liveness
cd engine && npm run package → macro-audit-0.1.0.tgz（85 files）
MCP stdio 实物握手（spawnSync dist/cli.js mcp + NDJSON）：
  id=1 initialize OK / id=2 tools=facts,quarantine,file_card /
  id=3 file_card(缺库)→card_type:miss never_collected（isError=false）
node scripts/check-dist.mjs → DIST-RATCHET PASS: 257947B / cap 289395B
npm run gen ×2 → git status --porcelain（docs/adr+manifest 面）零输出=幂等
守卫组（env -u NODE_OPTIONS node .scratch/architecture-recovery/reports/NN-check.mjs）：
  33:31/31 39:28/28 40:57/57 41a:38/38 43:28/28 44:59/59 45:51/51 70:13/13
  71:16/16 72:16/16 73:14/14 77:16/16 78:42/42 80:28/28 81:18/18 82:15/15
  83:19/19 xfail-run:PASS(entries=0/10)
```

## 四、实物验证留证（D-134⑤）

```
node -e (engine/, @duckdb/node-api 实物)：
  dup-unique→'Constraint Error: Duplicate key "fact_id: f1" violates unique constraint.'（ownKeys=[stack,message]）
  dup-pk→'... violates primary key constraint.' / notnull→'NOT NULL constraint failed: t.n' / check→'CHECK constraint failed ...'
违例扫描（READ_ONLY）：
  r32/e2e-audit/facts.duckdb：total=608 fact_id_dup=0 fact_seq_dup=0 notnull_viol=0 seq_gaps=0
  r32/dirty-facts.duckdb：total=197 fact_id_dup=0 fact_seq_dup=0 notnull_viol=0 seq_gaps=0
```

## 五、阻塞与基线勘误

- 基线起点 41a-check FAIL 1/38（D7 ledger_pointer）——R32 收口未补编年（D-139 追认的过程违规实物例证）；本窗补 M-011 编年行后复绿 38/38，与本修批同 commit 归账（编年随行纪律）。
- 中途联动修两处守卫：82-check B4（F7j 收窄后契约判据同步）＋70-check inventory（83-check 入册 regen）——非规避性豁免，判据如实钉收窄后形态。
- 无未决阻塞；#80 步③前置契约缺口（F5/F6）已清零。

## 六、经验候选（lessons）

1. **吞错收窄＝判定层预查＋精确指认双臂**——预查为主消除撞键场景（跳过可计数），收窄 catch 只作防御残留；比「消息匹配单臂」稳（措辞漂移时预查仍正确）。
2. **守卫契约判据与实现联动**——改 CI 条件须同步改对应 check 断言（82-B4 先例），否则守卫把修正当回归。
3. **closed 枚举防泄漏优于「点名抑制」**——失败态以白名单静态集放行（fail-closed），未声明 facet 一律披露入 suppressed_facets；新增 analysis 由成员级双向差集对账强制分类。
4. **编年随行复发性**——41a-D7 同型第三次复发（M-006→r29／M-010→r31／M-011→r32），收口 commit 的编年义务可立项机制化（候选：收口守卫断言「账本 maxId 必现于 CHANGELOG」已存在，缺口在收口流程非判据）。

## 七、引用文件

- `engine/src/fact/store.ts`（isFactIdUniqueViolation/existingFactIds）
- `engine/src/audit/file-card.ts`（预查写循环/skipped/headShaOfRepoRef 去重/死引用注记）
- `engine/src/fact/file-card.ts`（closed 双集/suppressed_facets/set_truncated/pinnedAmbiguous/F6）
- `engine/src/fact/projection.ts`（歧义验重/COUNT 截断）
- `engine/src/mcp-server.ts`（existsSync 缺库枝/头注）
- `engine/src/cli.ts`（skipped 出参）
- `engine/test/file-card.test.mjs`（C4~C7/D2 扩展/E3/H2/H3/J1/K1）
- `engine/dist/**`（bundle 重建随行）
- `.scratch/architecture-recovery/reports/83-check.mjs`（新守卫 19 断言）
- `.scratch/architecture-recovery/reports/80-check.mjs`（F1 BOM 钉面）/ `82-check.mjs`（B4 契约更新）/ `63-assertion-inventory.json`（regen）
- `.github/workflows/engine-ci.yml`（F7j 步级化）
- `CHANGELOG.md`（M-011/M-012）/ BACKLOG #83 闭环 / A-092 账本行
