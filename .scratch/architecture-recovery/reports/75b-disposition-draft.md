# #75 批2 分档处置草案（R38 / A-099 配套）

> 来源面：`75a-census-register.json`（348 条全归因注册）＋`75a-census-findings.json`（实跑普查）；处置门=D-094 三分类；排序服从 T1 findings 回流重排（D-150⑤/D-152③）。本件=草案（draft）——逐件裁定走后续批次，不因落盘即生效。

## 1. 存量分布（348 条，kind × disposition）

| kind | 件数 | disposition | 处置轨道 |
|---|---|---|---|
| date-literal | 53 | legit-literal | Track A 保留注册位——票面时点钉多为真绊线；候选改造=派生锚（编年/账本动态取数）按收益挑件，不机械换 |
| magic-floor | 51 | legit-literal | Track A 同上 |
| unstripped-scan | 41 | convention-registered | Track B 存量冻结——名↔检剥注释通用化约定：存量断言保留原文扫描位，新增断言须过 _lib 剥注释面（register note 原文生效，不回溯改写） |
| bare-occurred | 10 | event-pin | Track E registry 语义钉——随 registry 演进复核，occurred 位面不迁 |
| toothless | 2 | observability-emit | Track F 观测辐射位——有意非断言，维持 |
| existence-assert | 115 | layer-tagged(presence) | Track D 选择性升格——presence→liveness/readiness 按收益挑件（P-2 关联：命名三层目前落 register meta，断言名/文本未动=票面收窄如实态） |
| multi-hit-probe | 76 | acknowledged-multi-hit | Track C 点级锚改造——逐件判近似同义拆并（同字面值簇优先批化；字面钉→行钉/结构匹配/外部锚回引，D-071⑨ 既定修法族） |

## 2. R37 呈报七件处置表（本批实修，全闭环）

| 呈报件 | 处置 | 落地 | 状态 |
|---|---|---|---|
| P-1 38-F2 support 枚举收窄 | 枚举域钉回补：`support∈{supports,insufficient}`（词表源=engine/src/report/citation.ts `output_states` 二态闭集，工件实测 distinct 值吻合） | 38-check.mjs F2 | closed |
| P-3a 25-C5a 末格禁言盲区 | 豁免登记制：新增 C5c——末格不再剥离出扫描面，违禁词命中须落在 `LAST_CELL_EXEMPT` 登记的历史锚片段（当前唯一：`R3 收口 push 已执行`），登记外命中=FAIL | 25-check.mjs C5c | closed |
| P-3b 37-C2 欠数不可检出 | 双向回补：新增 C2b——存档证据集对快照 head 可达 gh-committer 全集欠数检出（`git log r.head --committer=noreply@github.com`；钉快照防活仓增长；head 不可达→WARN 退化；空集→NOTE 诚实缺席，同 C2 型） | 37-check.mjs C2b | closed |
| P-4a 20-A5 SQL 检测剥离面 | 本地裸「//」剥离器退役→`_lib/check-kit.mjs` stripComments 自消费（块注内 SQL 词误报面收口＋字符串字面量保护） | 20-fact-schema-check.mjs | closed |
| P-5 26/28/30 机件重复 | `git log --grep`+`show --name-only` 触及面机件收编 check-kit（commitsByGrep/touchedPaths/pathsTouchedBy/gitOut）＋freeze-SHA 前缀比对同源（lastChangeSha）；统一 spawnSync argv+`-c core.quotePath=false`（28 原 execSync 已带此参，26/30 顺带补齐非 ASCII 路径引号逃逸面） | _lib/check-kit.mjs +26/28/30-check.mjs | closed |
| P-6a manifest 笔误 | 「三分位」→「三分类」（全档唯一处在 policy 句） | known-red-manifest.json | closed |
| P-7 01-spotcheck 尾行 | 已提交 blob 补尾行 NL＋生成器 `+ '\n'` 同步（防再生回潮）；tailNL 纪律覆盖 JSON 工件=本处置即票面明言 | 01-spotcheck.{mjs,json} | closed |

## 3. 批2-β 裁定候选（本批不机械推进——改探测面属裁定链事项）

- `unstrippedScanHit`「注释提名即豁免」漏洞：探测器应扫剥后源码的 strip 消费位而非原文 mention——属探测器语义变更，须裁定（P-4 残余面）。
- `multi-hit-probe` 仅收 `.indexOf(` 字面量（`.includes(`/`.test(` 字面量逃逸）＋普查 walk 面漏 `.scratch/macro-audit/`——扩面后新检出须注册，同样属裁定链。
- `SCAN_EXEMPT` 含 `guard-all-run.mjs` 不可达项（枚举面为 `*-check.mjs`）＋75a-S1 自指断言恒真边例（assert 文本自提及即过）——摘除/改写同批裁。
- `stripMdComments` 零调用面维持：新增 md 面断言方消费，不为凑调用而改存量。
- 75a 每跑写 findings 工件（守卫写工作树设计内）／41a 手写 indexOf 解析器／guard-all-run FAIL-slug 正则耦合——技术债候选登记。

## 4. 后续批次排产建议

- 批2-β：探测面硬化裁断（上列五项，须过裁定链非机械修）。
- 批3：multi-hit 76 件点级锚改造——按同字面值簇分批，先试批 ~10 件评估返工面（逐件判近似同义拆并，register note 随件更新）。
- 批4：existence-assert 115 件 presence→liveness/readiness 升格挑件（P-2 语义：收益面优先——编排/启动链断言）。
- 票面批2（BACKLOG #75 原文=枚举 open/closed 建制+closed 面双向差集 lint+常量集 SSOT+reserved 机制）未动——独立建制批，不占本草案轨道。

## 5. 对账纪律

- 处置后普查复跑：findings 净增减=0（七件实修未新增/消除普查项；348↔348 稳态保持）。
- 注册表对偶闸门（C1 检出全归因/C2 零悬空）复跑绿——本批无需动账即证改动作面净。

