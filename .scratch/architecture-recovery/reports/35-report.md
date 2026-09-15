# 35-report — CodeLore 契约面扩开首批 ≈30 面

> 票：#35 / R5-04｜A-xxx：A-040｜决定：D-035（首批 30 面＋暂缓面集两字段）· D-034（阶段 3 串行骨架首票）
> issue：`.scratch/architecture-recovery/issues/35-codelore-expansion-batch1.md`；handoff：`.scratch/architecture-recovery/handoffs/35-codelore-expansion-batch1.md`
> 阻塞状态：**None**（与 #34 并行首票；#34 已闭环）

## ① 开工复述

必读清单逐条已解析：issue/handoff/prompt 35、spec.md §R5-D4、WORKFLOW §4.2、A-040 行、D-034/D-035 行、ADR-0014/0015、`engine/src/upstream/codelore.ts` + `test/fixtures/codelore/`、reports/31-*、spec-phase-tasks 暂缓面集注记。三件套输出于会话开工处（阻塞状态 + 覆盖 D-xxx + 验收标准原文）。

## ② 调研（atomcode 串行单发）

落盘：`reports/35-atomcode-research.md`（全文另经 ctx 索引，source=atomcode）。要点：

- **分析面划分收敛模式**（code-maat / CodeScene / CodeLore 三先例原文核验）：「技术行为 ‖ 组织社会」二分 + 架构聚合层；机器接口保持扁平枚举 + did-you-mean。本票契约表分组（evolution/s3/s5）只落文档/表字段层，与先例同向。
- **golden 契约测试六步法 + approval testing**：冻结 argv+cwd+env、录制 stdout 逐字（禁规范化）、空/单行/多行 cardinality 覆盖、harness 须能红、磁带过期须重录+漂移报告——本票全部落实（见完成定义对照）。
- **冲突点名**：无 revised 需求。如实登记差异：CodeLore README 自称 61 面 vs 本机 0.28.0 `analyze --help` 实测枚举 57；契约锚以二进制枚举为准（任务书纪律）。

## ③ 开源轮子

沿用既有工业件：CodeLore 0.28.0 二进制（ADR-0014 双轨制主线，exact pin + binary-discovery）；golden cassette 模式沿用 #31 先例并扩展为「manifest 独立计量 + csv 第二通道钉空面列契约」。无新增依赖（`npm install` 树未变）。

## ④ 完成定义 vs 实际

| handoff 完成定义 | 实际 |
|---|---|
| `codelore analyze --help` 实物枚举存档（reports/35-*） | `reports/35-analyze-help.txt`（13,088B，possible values 全表） |
| 首批面集与任务书面名逐一对账，差异如实登记 | `reports/35-facet-reconciliation.json`：30/30 命中、零改名；另登记残余 4 面（entity-effort / architecture-violations / finding-hotspot-overlap / defect-validation）与速写映射（function-*→3 面、metrics→delivery-metrics） |
| 逐面适配器输出 + golden cassette + 契约测试 | `CODELORE_BATCH1_FACETS` 30 面契约表 + `parseJsonRows` + `collectCodeloreFacets`（失败降级 facet_error/facet_parse_error 不中断）；cassette `test/fixtures/codelore/batch1/<facet>.json` ×30 + 空面 `.csv` ×8；`codelore-batch1.test.mjs` 41 用例 |
| 暂缓面集两字段登记核对（衔接 #33 输入③） | `35-check.mjs` D1–D5：registry 项在位、deadline/review_at 齐备、manual_watch、20 速写名全回查 D-035④ 原文、全名可解析到实物枚举 |
| 守卫 `reports/35-check.mjs` PASS | **PASS 21/21，exit 0** |
| engine `npm test` / `npm run package` / selftest 不回归 | 见 ⑥ 证据链 |
| ledger A-040 done + WORKFLOW §4 lessons + commit 引 A-040+守卫 | 本次收口一并落盘 |

## ⑤ 卡死 3 连问

无卡死。过程中两处如实登记项（非阻塞）：

1. **枚举残余 4 面**：`entity-effort`/`architecture-violations`/`finding-hotspot-overlap`/`defect-validation` 在 57 枚举内但既非首批 30 亦非 D-035④ 暂缓面集名——已登记于 reconciliation `unregistered_residual`，是否纳入暂缓面集 manual_watch 留收口窗口裁决（若纳入须先补 D-035④ 账本原文，否则 33-check B3 FAIL）。
2. **README 计数差**：CodeLore README 61 面 vs 0.28.0 枚举 57——契约锚以实物枚举为准，已登记。

## ⑥ 断言式收尾清单（每条附可复跑证据）

| 断言 | 证据 |
|---|---|
| 首批 30 面逐面契约化（适配器输出 + cassette + 测试） | `cd D:\Aworker\6F && node .scratch/architecture-recovery/reports/35-probe.mjs` → `facets contracted=30 errors=0 facts=31`；manifest 每面带 sha256/row_count/columns/spot |
| 守卫 PASS 21/21 | `node .scratch/architecture-recovery/reports/35-check.mjs` → `PASS 21/21` exit 0 |
| 引擎测试全绿（含新测试入链） | `cd D:\Aworker\6F\engine && npm test` → GEN-OK + SMOKE-OK 6/6 + COLLECTORS 14/14 + CODELORE-ADAPTER 7/7 + CODELORE-BATCH1 41/41 |
| 编译通过 | `npm run build`（tsc）→ exit 0 无 error |
| 打包通过 | `npm run package` → `macro-audit-0.1.0.tgz`，total files 31（与基线一致，测试件不打包） |
| 启动并测活进程 | `node dist/cli.js selftest` → `{"ok":true,...}`（spec-constant 自检 5 项全 pass） |
| 每平台 test 闭环 | `engine/package.json` smoke 链含 4 测试文件；`.github/workflows/engine-ci.yml` matrix = ubuntu/windows/macos × node 20/22 同跑 `npm run smoke` |
| 适配层零业务规则 | `35-check.mjs` C2：`spawnSync` 在且 `threshold|verdict|RED|score_band` 零命中 |
| pin 0.28.0 不变 | `35-check.mjs` C1 + 测试 A3；`resolveCodelore` 实测 pinned=0.28.0（35-probe-measurements.json） |
| 暂缓面集两字段齐备 | `35-check.mjs` D1–D5 PASS；`33-check.mjs` 回归 PASS 8/8（ALARM 0 / WARN 6 沿既有值守输出） |
| 红证：畸形/漂移输入被拒 | 测试 C1–C3：非数组 JSON / 非对象行 / 截断 cassette 全抛错；D2–D4：面失败降级、解析失败降级、未 pin 短路 |
| LLM 面未混入 | `CODELORE_BATCH1_FACETS` 30 面无 explain 族；explain 代码为 #31 存量 |

## ⑦ 教训

1. **空结果面列契约要双通道**：`--format json` 空数组无表头，列契约须走 `--format csv` 第二通道录制 `.csv` cassette 并断言 sha256（评审发现的原方案漏测点，已修）。
2. **字符串手术的自反陷阱**：用 `String.replace` 抽出「与被抽块内容相同的辅助函数」时，替换会命中辅助函数自身造成自递归——先替换调用点、后插入辅助函数体。
3. **code-age/messages 冻结 argv 进契约表**：`--age-time-now` / `-e` 是契约一部分（argv 全体即契约），放 `extraArgs` 字段由 manifest/test 共同钉死——这是「冻结不确定性在边界」的落地形态。
