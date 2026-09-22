# 2026-09-23 轮29 T2 执行报告 —— BACKLOG #78 quarantine 引擎建制（ADR-0022 / D-103~D-120）

> 窗位：轮29 独立 B 窗（与 #77 A 窗并行不混）；常驻任务书 `.scratch/macro-audit/handoffs/next-round.md`；版本控制 GitButler。

## 一、完成定义清单逐项

| 项 | 实证 |
| --- | --- |
| 编译通过 | `npx tsc --noEmit` 净；`npm run build` → `BUNDLE-OK dist/cli.js` |
| 打包通过 | `npm pack --dry-run` → `macro-audit-0.1.0.tgz` 77 件 893.1kB |
| 进程测活 | `node dist/cli.js --version`/`selftest`（ok:true）/`doctor`（四腿全 ok）/`mcp` JSON-RPC init+tools/list=[facts,quarantine] |
| test 闭环 | `npm test` 19 册全绿（含新 `quarantine.test.mjs` 56/56 挂 smoke 链第 18 件）；`78-check.mjs` 30/30；守卫组 33/39/41a/43/44/45/53/54/70/71/72/73/77/t8/t9 全绿 |
| git 腿验收件 | 病态 fixture e2e：`hash-object --literally` 注入 committer tz=+GGGG → %cI 字面量 → audit exit 0 + quarantine_log 行落库（不崩全仓） |
| 恒等式断言绿 | `intakeIdentityIssues` 双层（内存三桶↔库内行数）；78-check F6 自持 SQL+git 重放独立半层复核 |
| golden 契约 | demo 三场景 golden 重生成逐字节对齐（Intake Health 恒在节进报告体） |
| CI 三查实证 | `macro-b-regression.yml` 验证步升级=工件在+JSON 可解+verdict/reason_class 枚举+intake_health 恒在+crash 工件 `if:always()` 上传腿 |

## 二、实施面（判定↔处置硬分界，D-100①）

- **契约层** `engine/src/intake/quarantine.ts`：`classifyGitIsoField` 三态（clean/normalized/quarantined）永不 throw；词表 v1 四码（anchor_head_date_malformed/normalized_tz_offset/unclassified_field_anomaly/oversize）；`rawBytesFingerprint` 三件套（hex 回显+is_trunc+sha256 全量）；`ACCEPTED_REASON_CODES` 仓级版本化基线（当前空=零容忍棘轮）；strictQuarantineViolations/intakeIdentityIssues/buildCrashArtifact/protocolCrashError 协议桶七码。
- **持久化** `engine/src/fact/{schema,store}.ts`：`quarantine_log` DDL+schema_registry v2；自然键 UNIQUE(run_id,commit_sha,field_name,reason_code,disposition)+`ON CONFLICT DO NOTHING` 幂等；`runInTransaction` 逐 commit 事务边界；append 前置词表校验（REASON-CODE-UNLISTED 协议崩）。
- **接线** `macro-b.ts`（锚位+逐 commit %cI 双分类，fieldStats/fieldEvents）/`audit.ts`（strict 闸+事务写+恒等式断言+锚病态 unsupported 路径）/`collectors.ts`（null-date 毒值显式跳过）/`generate.ts`（Intake Health 恒在节+verdict{band,reason_class}三面投影+receipt.verdict）/`cli.ts`（--strict-quarantine+顶层 crash 工件+三值退出码 0/2/3）/`projection.ts`+`mcp-server.ts`（quarantine 只读投影+tool）。
- **台账** `docs/known-gaps.md` 首版（GAP-078-01~04，D-113①字段集+单向权威注记）+ `33-gate-registry.json` 触发器条目 `78-quarantine-signal-review`+事件 `quarantine-new-signal`（gap↔trigger 单向互链）。
- **独立对账** `78-check.mjs` 30 断言：静态 pin+quarantine.test 实跑+病态仓双通道 e2e。

## 三、关键裁定（过程纠偏）

1. **D-118④ SoD 纠偏**：初版误把分类器接进 39/40 对照物——裁决原文「对照物零代码改动不引入 quarantine 分类逻辑」，已回退。parity 矩阵改判格语义：{cli=quarantined × 39=解析失败(GITCLI-OUTPUT-CONTRACT)}=预期分歧格登 GAP-078-01；{clean×值同}=干净仓值等格（F4/F5）。
2. **禁词表兼容命名**：列名 `is_trunc` 非 `is_truncated`——append-only 黑名单子串扫，`TRUNCATE` 误伤含该子串的标识符（INSERT/SELECT 双双被拒实证）。语义不变，注记入 schema.ts+known-gaps。
3. **DuckDB 方言**：`INSERT OR IGNORE` 过不掉只追加白名单前缀检——`ON CONFLICT DO NOTHING` 天然过守卫且 DuckDB 实证支持。
4. **verdict 断言口径**：干净仓 fixture 真判据产出 criteria_unsupported——G3/G4 断言改「reason_class 属判据族非摄入族」非钉死 supported。
5. **病态对象注法**：`commit-tree` 规范化日期不可用——`hash-object --literally` 手写 commit 体注入 tz=+GGGG/abc/空形态；git 2.55 %cI 输出字面量 `%cI`（协议面）vs `+9999` 形状合法（字段面）分界实证。

## 四、阻塞

无。T0 预存红（41a CHANGELOG M 条目缺口）已补 M-006 修复，与本窗无涉但闭环在案。

## 五、lessons 候选（WORKFLOW §4 待追）

- 模板层 `$'` 与 `\n` 双重转义塌陷=源文件字面量雷区——含正则/换行的 .ts/.mjs 生成走 String.fromCharCode 规避面，写后 `node --check`+字节回读双验。
- 守卫子串黑名单对面=标识符命名约束——新列名先过 `includes(BLACKLIST)` 预审（is_truncated→is_trunc 实证）。
- 「被观察对照物」改不得——SoD 类裁决改前先查账本禁条（D-118④ 直接判词「双实现+parity=否决」）。

## 六、引用文件列表

engine/src/intake/quarantine.ts（新）/ engine/src/intake/intake.ts / engine/src/fact/{schema,store,projection}.ts / engine/src/audit/{macro-b,audit}.ts / engine/src/collect/collectors.ts / engine/src/report/generate.ts / engine/src/cli.ts / engine/src/mcp-server.ts / engine/src/demo/demo.ts / engine/test/{quarantine.test.mjs（新）,narrative.test.mjs} / engine/package.json / engine/dist/*（重建）/ engine/fixtures/golden/*（重基线）/ docs/known-gaps.md（新）/ .scratch/architecture-recovery/reports/{78-check.mjs（新）,54-check.mjs,53-check.mjs,33-gate-registry.json,63-assertion-inventory.json} / .github/workflows/macro-b-regression.yml
