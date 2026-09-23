# 轮31 执行报告——#80 Micro-B 步①（per-file 一等事实发射 + fixture golden）

- 日期：2026-09-23　会话：修复/开发子 Agent（r31-micro-b-step1 分支）
- 票面：BACKLOG #80 步①（stacked-diff 第一棒，内部独立绿）——D-121~D-127 / ADR-0023，步①落点=D-124/D-125/D-038
- 提交：`wzt` on `r31-micro-b-step1`（`but commit -b r31-micro-b-step1`，单提交含全部步①件+账本行+编年修复）

## ① 完成定义逐项

| 票面项 | 状态 | 可复跑证据（命令 → 输出摘要） |
|---|---|---|
| subject 规范化形（SCIP 五规则+NFC+禁折叠+case冲突告警+symlink 细则，归一单点在发射边界） | ✅ | `node engine/test/micro-b-emit.test.mjs` → `MICRO-B-EMIT-TEST-OK 17/17`（A1~A4：backslash/`//`/`.`/`..`/绝对/NUL/NFD→NFC/字面保留/冲突成对） |
| per-file 一等事实（subject_ref=规范化 path，value_json=per-path-face 行对象，append-only+去重幂等） | ✅ | 同上 B1/B4/B6 + 实测 batch1 夹具 → `file_facet_row=1078 条/363 subject，全 scale=Micro-B` |
| file_renamed 血缘一等事实（{from,to,head_sha,threshold,detector_version} 参数入载荷可复算） | ✅ | 测试 C1/C2（合成 -z 字节→1 edge+载荷八键+scan 事实）+ C3 e2e 真 git rename（tmpdir 实仓 rev-parse+git mv→edges[0]={from:src/alpha.ts,to:src/beta.ts,similarity:100}） |
| 跨 git 版本可复算验证件 | ✅ | `gitRenameLogArgs('50%')` 真子进程断言写死在测试内（e2e 非回放）——三平台 CI 腿各跑同一断言即跨版本实测载体；载荷 git_version 随行举证不入骨架锁 |
| facet_rows 降 raw 证据位（append-only 保留+role 标记，不进卡查询主路径） | ✅ | `grep "role: 'raw_evidence'" engine/src/upstream/codelore.ts` 命中；测试 D1：聚合事实 role=raw_evidence+per_file_emitted 计数+rows 保留 |
| Macro-B behavior 消费面迁移（facet_rows→per-file 聚合）+ 对照期对账判据 | ✅ | audit.ts `reaggregateFileFacetRows`/`reconcilePerFileVsAggregate` 调用在；判据=per-file 重算多重集 == file-bearing 聚合行−skipped（测试 D2：match=true、hotspots 9−2=7、lead-time 非文件面天然真）；bhvPc1 含 recon.match |
| fixture golden=发射产出骨架锁（字段骨架非内容值）+D-038 fixture 体系接入 | ✅ | `node engine/scripts/gen-micro-b-emission-golden.mjs --check` → `GOLDEN-CHECK-OK`；骨架=metric 集/value_json 键集/subject 规范化形/role/skip reason/冲突对/血缘键集+recon |
| 步①独立绿（编译+全测试链+守卫） | ✅ | 见 §② |
| 账本落盘（impl 参数裁决留痕） | ✅ | `.scratch/architecture-recovery/decision-ledger.md` A-091 行（①~⑦ impl 裁决） |

## ② 验收标准逐项（用户原文：「编译通过、打包通过、启动并测活软件进程；每个平台都要有 test 闭环，避免只引入却没做到。」）

| 项 | 状态 | 证据 |
|---|---|---|
| 编译通过 | ✅ | `cd engine && npx tsc -p tsconfig.json` → 0 error（src/fact/subject.ts、src/collect/file-lineage.ts、upstream/codelore.ts、audit/{audit,macro-b,upstream-dimension-map}.ts 全过） |
| 打包通过 | ✅ | `npm run package`（npm pack --dry-run）→ `macro-audit-0.1.0.tgz` 81 files / 173.8kB |
| 启动并测活软件进程 | ✅ | `node dist/cli.js selftest` → `{"ok":true,checks:[manifest/shells/default-mode/mcp read-only/receipt 全 pass]}`；smoke SMOKE-OK 6/6 含 --version/selftest/gen-manifests 三实测 |
| 每个平台 test 闭环 | ✅ | `npm run smoke`（CI 三平台同一命令链）全绿 19 件：smoke 6/6、collectors 14/14、codelore-adapter 7/7、codelore-batch1 41/41、**micro-b-emit 17/17（新件入链）**、codelore-llm 25/25、report-preview 5/5、intake 40/40、gitcli-contract 11/11、sql-literal 17/17、mcp-db 12/12、audit 26/26、demo、github-rest、upstream-map 21/21、narrative、citation 38、doctor 9、quarantine 58/58、audit-zero-write 4/4 |
| 守卫基线复绿 | ✅ | `node .scratch/architecture-recovery/reports/{33,39,40,41a,43,44,45,70,71,72,73,77}-check.mjs + xfail-run.mjs` → 全 PASS（33=31/31、39=28/28、40=57/57、41a=38/38、43=28/28、44=59/59、45=51/51、70=13/13〔census regen=55守卫/1322点〕、71=16/16、72=16/16、73=14/14、77=16/16、xfail 0条）；新增 `80-check.mjs` → PASS 20/20 |

## ③ 实现面实物清单

- `engine/src/fact/subject.ts`（新，纯逻辑）：normalizeSubjectPath〔ABSOLUTE_RE 拒绝对/NUL/dotdot；empty/dot 段清洗；NFC；字面保留〕＋detectCaseOnlyConflicts〔lower 分桶多字面成对〕
- `engine/src/collect/file-lineage.ts`（新，纯逻辑）：FILE_LINEAGE_DESCRIPTOR、RENAME_DETECTOR_VERSION=rename-detector@v1、RENAME_DEFAULT_THRESHOLD=50%、gitRenameLogArgs、parseRenameLogZ（`__R__\0\nR<score>\0from\0to\0` 字节布局实测钉死）、collectFileLineage（file.renamed/file.lineage_skip/file.lineage_scan 三 metric）
- `engine/src/upstream/codelore.ts`：emitPerFileFacts（path/entity→单文件，entity_a+entity_b→双端 peer 互指，非文件粒度行不发射）、subjectProbe 注入缝+defaultSubjectPathProbe（lstat→realpath 仓内 regular file；缺席=历史实体照发）、facet_rows+role=raw_evidence+per_file_emitted、file_subject_skip/subject_case_conflict 披露、explain/dossier subject 同器归一、reaggregateFileFacetRows+reconcilePerFileVsAggregate
- `engine/src/audit/macro-b.ts`：fileLineage spec 旗标（audit=on/demo=off 保合成仓逐字节确定性）+RenameLogRunner 注入缝+Micro-B ctx 发射
- `engine/src/audit/audit.ts`：behavior 判据读源=per-file 重聚合（BbA 双实现先例）+对账入 bhvPc1+measurements.micro_b{per_file_facts,subject_skips,case_conflicts,reconciliation}+file_lineage{renamed,lineage_skips,scan_fact}
- `engine/src/audit/upstream-dimension-map.ts`：scale=Micro-B 事实不入 S 维归位投影（防工件膨胀+lane 诚实）
- `engine/test/micro-b-emit.test.mjs`（新，smoke 第 19 件）＋`test/fixtures/micro-b/`{emission-input.json,rename-log.ztxt,manifest.json,emission-skeleton.golden.json}＋`engine/scripts/gen-micro-b-emission-golden.mjs`（生成+--check 双模）
- `engine/test/codelore-batch1.test.mjs`：D1 契约升级（31+fileFacts、scale 断言、role、对账）+D2 空行面零发射断言
- `engine/package.json`：smoke 链接入 micro-b-emit.test.mjs
- `.scratch/architecture-recovery/reports/80-check.mjs`（新守卫 20/20）＋`63-assertion-inventory.json` regen（55 守卫/1322 调用点）＋`decision-ledger.md` A-091
- `CHANGELOG.md` M-008（轮30 Micro-B 设计树封口编年行——修 41a 陈旧断言的根因，38/38 复绿）

## ④ impl 裁决（票面裁权内，A-091 同录）

1. value_json 形态=per-path-face 行对象（SonarQube per-component JSON_VALUE 先例），role=first_class 显式标记。
2. role 标记机制=聚合载荷内 role=raw_evidence 字段——metric 名不动保 append-only 连续（改名=新事实族断链）。
3. 对账判据=per-file 重算多重集 == file-bearing 聚合行 − skipped（非文件粒度行天然不入比对面，防 lead-time 类误判）。
4. scale=per-file/血缘事实记 Micro-B（粒度按 subject 非 run）；聚合 fact 保 Macro-B。
5. 成对行=双端各发一条 peer 互指（文件中心视图）；subject_ref=规范化 to 端（血缘不进身份）。
6. rename 阈值 50%（-M 先例）＋detector_version=rename-detector@v1 规格钉；git_version 随行举证不入骨架锁。
7. symlink=仓内 realpath→regular file 才解析（via:symlink 披露）；工作树缺席路径=历史实体照发不探活；跨仓/悬空/非文件=skip 披露。
8. 血缘接线=collectMacroB spec 旗标（audit=on 实跑面/demo=off 保确定性），lazy 补采复用同管线=票面 D-122② 同构位。

## ⑤ 阻塞

- 无硬阻塞。过程阻项×2 均已解：ctx 模板字面量内反引号/反斜杠转义吃字符→改数组拼接写码风格；80-check 正则字面量含未转义括号→改 includes 断言。

## ⑥ lessons 候选

1. ctx_execute 写码一律用「数组行 push+join」或 String.raw——模板字面量内 `\`/`\uXXXX`/反引号会被宿主层再吃一道转义（本会话踩×3）。
2. `git log --format=__R__%H --name-status -z` 字节布局实测=`__R__<sha>\0\n<status>\0<path>\0`（提交行 NUL 终止后跟 LF 分隔；R<score> 双路径、A/M/D/T 单路径）——解析器钉死前先抓真字节比读文档可靠。
3. 对账判据第一版「per-file==聚合全量」在非文件粒度面（lead-time 等）恒假——比对面须是 file-bearing 子集−skipped，判据语义先于代码。
4. 历史守卫（35/38/51-check）读冻结工件不重跑采集器——发射契约变更不扰动留痕窗；引擎测试（codelore-batch1）才需契约升级。

## ⑦ 引用清单

- 票面：`.scratch/architecture-recovery/BACKLOG.md` #80；`docs/adr/0023-micro-b-file-card-architecture.md`（D-121~D-127）
- 账本：`.scratch/architecture-recovery/decision-ledger.md` A-091；`.scratch/macro-audit/decision-ledger.md` D-121~D-127
- 调研：`.scratch/macro-audit/reports/R30-Q{4,5}-atomcode-research.md`（SCIP 规范化形/git rename 先例实证）
- 实物：`engine/src/fact/subject.ts`、`engine/src/collect/file-lineage.ts`、`engine/src/upstream/codelore.ts`、`engine/src/audit/{audit,macro-b,upstream-dimension-map}.ts`、`engine/test/{micro-b-emit.test.mjs,fixtures/micro-b/}`、`engine/scripts/gen-micro-b-emission-golden.mjs`、`.scratch/architecture-recovery/reports/80-check.mjs`
- 提交：`r31-micro-b-step1` @ wzt

## ⑧ 下一步（步②预览——下会话接棒点）

- T2：文件卡投影（DuckDB 读模型 file_card 表/视图）＋确定性派生（priority_band/percentile_rank/top_n_flag 带规则版本+派生 provenance）＋advisory 结构性隔离（schema 无 verdict/gate-consumable 字段）＋失败三态（new_file/insufficient_history/not_applicable）＋miss 四类（never_collected/not_tracked_at_sha/not_applicable/renamed_to）＋at:sha pin+staleness 双字段＋renamed_to 条件跳转（沿 file.renamed 血缘链投影缝合）＋MCP tool（只读 miss→not_collected+CLI 指引）+CLI audit file（lazy 补采=同构发射管线复用 collectMacroB fileLineage/codelore 面）双通道骨架。
- 复用位：subject 归一器（查询侧 subject 同样过 normalizeSubjectPath）、file.renamed 血缘链（renamed_to 跳转源）、reaggregateFileFacetRows（卡字段重算源）、audit file 命令挂 cli.ts。
