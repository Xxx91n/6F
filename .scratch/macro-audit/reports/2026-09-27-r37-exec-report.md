# 轮 37 T1 / #75批1 执行报告 —— 失效断言三分类建制 + 守卫基线升格判据落地

- 日期：2026-09-27
- 票面：`D:\Aworker\6F\.scratch\macro-audit\handoffs\next-round.md` T1（吸收 D-144②③＋D-149③④）
- 覆盖决策：D-094②③④ / D-102③ / D-079⑥ / D-071⑨ / D-144②③ / D-149③④；账本行 A-097；编年 M-020
- 验收标准（原文）：「编译通过、打包通过、启动并测活软件进程；每个平台都要有 test 闭环，避免只引入却没做到。」

## 1. 三分类裁定矩阵（T1-a 主交付——12 件静默红全过 D-094 门）

| guard | 红断言 | 三分类 | 处置 | 证据锚 |
|---|---|---|---|---|
| 01-check.mjs | D1 anysearch intent≥5（实测1）；D5 45 分全溯源 | (b) 合法漂移——语料再生退化 | **入 known-red-manifest**（kr-01-corpus-regen，复审锚=语料重采样票/stage3-close，expires 2026-12-31） | commit c6fe0f8 复跑产物刷新记录在案 |
| 20-fact-schema-check.mjs | A5 SQL 写令牌 | (b) 断言面撞 JS API——改断言 | `Map.delete`/`instanceOf.delete` 误判收窄→SQL 语句形态正则（`DELETE\s+FROM` 等 8 条） | `engine/src/fact/store.ts` Map 删除调用点 |
| 23-first-report-check.mjs | 全件 crash | (b) 机制漂移——改断言 | `import generate.ts` → `engine/dist/report/generate.js`（NodeNext `.js` specifier 在 Node 类型剥离下不映射；dist 陈旧由 check-dist 另守） | dist 导出实含 REPORT_SKELETON/skeletonOf/UNVERIFIED_MARK/CONTENT_DIGEST_CANONICALIZATION |
| 25-check.mjs | C3b 每行「待用户拍板」；C5a `push 已执行` | (b) 处置落地后的票面钉——改断言 | C3b=末格（拍板状态）非空结构钉；C5a 扫票面自身声明面（剥末格——处置留痕位不属本票声明） | checklist 行末格已填 decided/closed 实物 |
| 26-check.mjs | D1/D2 porcelain 零改动 | (b) 工具时代漂移——改断言 | GitButler 合成索引幻影 MM→钉票面 commit 集（A-031 触碰面零触 docs/adr/engine）＋冻结 SHA（23-measurements 最后变更=e39468c） | `git show --name-only` A-031 集实物 |
| 28-check.mjs | scope porcelain 零杂项 | 同上 | A-033 commit 集 ⊆ docs/adr(0001~0009,0014)+reports/28-*+簿记三件；engine/spec/issues/handoffs/prompts 零触 | 3586f2e 触碰面枚举 |
| 30-check.mjs | C1 porcelain | 同上 | A-035 commit 集零触敏感面＋冻结四件最后变更钉（e39468c×3 / 55dc34e） | ee18d2e + `git log -1 --format=%H` 实测 |
| 35-check.mjs | D4 三暂缓面名缺 | (b) 枚举源历史挪移——改断言 | 回查源 D-035④∪D-045（architecture-violations/defect-validation/finding-hotspot-overlap 系 D-045 Micro 枚举收编） | D-045 行含三名实物 |
| 37-check.mjs | C2 对账等值/C3 活盘等值 | (b) 外部语料增长——改断言 | C2→存档 SHA 逐件核验（可解析+committer=noreply@github.com）；C3→钉快照 head 树内计数（ls-tree -r） | 复测 65/69/14 ADR 钉快照；gh-committer 逐件核验 |
| 38-check.mjs | D4/F2/F5 65 份/全 supports/parity | (b) 工件再生漂移——改断言 | D4 钉 meas.adr_count 自有字段（非字面 65）；F2=件件有裁决落档+overall=insufficient 如实；F5=crosscheck 字段自洽+37 档回锚+差如实披露 | pm37.adr.count=65 ↔ meas.adr_count=76 差在档 |
| 44-check.mjs | G6 #77/#78 字面钉 | (b) 任务书换代（断言自承滚动维护）——改断言 | 序位正则→行级共现（`#77` 同行+收口/交付族标记）；#78 去向在册不动 | next-round.md 轮28 留痕行实物 |
| 54-check.mjs | B2/B3 调用点锚 | (b) 吸收层加挂调用点挪移——改断言 | 锚改钉吸收后分类调用（`classifyGitIsoField(headAbs.value,…)` / `absorbGitIsoDialect(parts[2])`+`classifyGitIsoField(abs.value)`）＋剥注释扫描 | #78/ADR-0022 吸收层实物 |
| 41a-check.mjs | （绿但 D7 高频增长面钉） | D-144② 预防性结构不变量改写 | D7 保双路径钉；新增 D7b=解析 `## [M-xxx]` 键集→各段 D-xxx 覆盖集（区间展开）断言 `dMax∈覆盖集` | 覆盖集实算：M-001~M-020 段内 D-id 含 D-149 |

**裁定汇总：真坏 0 / 合法漂移 11（改断言）＋1 入册 / 欺诈·死面 0。** 44-G6 属新红入画（轮37 任务书换代失锚）。

## 2. 字面钉普查（T1-b）

`75a-check.mjs` 落成：七族检出器（日期字面量 53 / 魔数地板 51 / 裸 occurred=== 10 / 无牙断言 2 / 未剥注释扫描 41 / 存在性断言 115 / 同名多命中 76）＝**348 条 findings 全量归因**至 `75a-census-register.json`（键=文件|族|sha8(行)）。

- **剥注释通用化**：`_lib/check-kit.mjs` stripComments（行注+块注+字符串保护）/stripMdComments；54-check 已接为消费点，其余 41 件 unstripped-scan 登记 `convention-registered`（存量保留，新增断言须过剥注释面——73-A4/20-A5/54-B 先例链）。
- **三层命名**：115 件存在性断言全标 `layer=presence`；liveness/readiness 语义注记入注册表 meta。
- **无牙族**：2 件恒真谓词（44-check B4 / 73-check C2）登记 `observability-emit`（值打印位借断言形态；改 console.log 会破 63 emit 盘点账——登记即注记）。
- **正对照自检**（D-079⑥ 同型）：合成源码五族必抓 + 负对照不误报。

## 3. known-red manifest + 升格判据（T1-d）

- `known-red-manifest.json` v1：policy 明文「只收 legit-drift / 欺诈死面禁入册」＋单条目 `kr-01-corpus-regen`（四要素齐备）。
- `guard-all-run.mjs`：动态枚举 `*-check.mjs`+`xfail-run.mjs`（60 件）→ 红集⊆册（册外新红 FAIL）＋册件复绿 strict 告警＋悬空条目 FAIL＋slug 漂移 WARN。子进程剥 NODE_OPTIONS。
- registry `guard-baseline-upgrade-trigger` **fired**（status→decided，confirmations 补 fired 记）；`events['t3-guard-manifest-shipped'].occurred=true`；新增 manual_watch 项 `known-red-kr-01-corpus-regen`（deadline 2026-12-31）。
- AGENTS.md 守卫组指称行追加升格生效条款（基线 18 件→全量跑判据，枚举为历史快照存证）。
- stale-assertions.json meta 补 `policy_d094`（XFAIL 册禁欺诈入册条款）。

## 4. P5/B2 同名断言普查（T1-e）

`83-check.mjs` B2 探针 `available_head_shas: input.availableHeadShas.slice()` 在 `engine/src/fact/file-card.ts` 3 命中——普查自动检出并注册 `acknowledged-multi-hit`（注记明记 R35 审计件 + D-143④ 禁加分支凑数，整改方向=点级锚，归 #75批2+ 排产）。同类族 76 件全注册。

## 5. 验收链（复跑口径）

| 项 | 命令 | 结果 |
|---|---|---|
| 编译 | `cd D:\Aworker\6F\engine && npm run build` | tsc 0 + BUNDLE-OK dist/cli.js |
| dist 零漂 | `node scripts/check-dist.mjs` | DIST-RATCHET PASS 263151B/289395B |
| 打包 | `npm run package` | macro-audit-0.1.0.tgz 85 件 255.2kB |
| selftest | `npm run selftest` | 5/5 ok:true |
| 进程测活/MCP | `node dist/cli.js mcp` + JSON-RPC initialize/tools/list | init ok + tools=[facts,quarantine,file_card] |
| smoke 链 | `npm run smoke`（22 册实跑） | 尾册 dialect-boundary 全 PASS（含真机 PROBE-INVARIANT） |
| 守卫升格判据 | `node .scratch/architecture-recovery/reports/guard-all-run.mjs` | ran=60 red=1(registered) problems=0 **GUARD-ALL-RESULT: PASS** |
| 75a 普查 | `node 75a-check.mjs` | 9/9 PASS（findings=348 全归因） |
| NUL/BOM | 字节嗅探全改动面 | 0 NUL / 0 BOM / tailNL 全在（20-check/BACKLOG 尾行补齐） |

平台闭环：本机 Windows/Node24 全链绿；`.github/workflows/engine-ci.yml` 矩阵（ubuntu/windows/macos × node 20/22）承接异平台 test 面——本轮改动全为 reports/ 守卫+文档面，引擎产物零字节差（check-dist 实跑证）。

## 6. 遗留与边界

- kr-01-corpus-regen 册件：语料退化承认态留档，复审锚/期限在册+registry manual_watch。
- 75a 普查为行级启发式——键=sha8(行) 稳于行号漂移但弱于内容编辑（编辑即须重归因——纪律本意）。
- 批2/批3（枚举 open/closed 差集 lint、census-contract 机芯互等裁决）未动——归后续批次。
- 子任务红线遵守：未碰 B 轨、未删 dist、阈值经分类门而非先写死、摄入四档未动、密封/验收探针语义未动、无 push。
