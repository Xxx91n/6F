# 轮36 T2 执行报告——#80 步③ 血缘缝合＋双仓试点＋benchmark＋披露收窄（A-095）

> 批次：r36 T2 on `r36-t1-ascast-rework`（栈底 r35-closeout）。提交：`lxt` 语义（27 件）+ `ssw` dist bundle（6 件）。工作树净。

## 一、实施面

### T2a 血缘缝合（D-137 四子项全兑现）
- `D:\Aworker\6F\engine\src\fact\file-card.ts`：`collectRenameEdges` 边池（JSON.parse 防御式 malformed skip）＋`resolveLineageAncestors` 反向 BFS（to→from 邻接表；visited 环检测双作用=去重+环旗；`FILE_CARD_LINEAGE_MAX_ANCESTORS=64` 帽→truncated 如实披露；BFS 次序注入 stitched_from）＋`FileCardLineage`/`FileCardLineageEdge` 披露块（stitched_from/edges/cycle_detected/truncated）＋facet_rows 行级 `subject_ref` 溯源键（additive）＋`checkHintKeys` 扩展 lineage.* 锚＋peer 分布被取代旧名去重（同一文件新旧名只计新名）＋renamed_to 边池=选中集∪祖先集。
- `D:\Aworker\6F\engine\src\fact\projection.ts`：跨观测集血缘解析——`sets` 保留 last_obs（MAX observed_at）；祖先集=同 repo 且 last_obs≤选中集；`FILE_CARD_LINEAGE_EDGE_CAP=10000` 边池硬帽；`lineageFacts` 注入 buildFileCard（仅 file.renamed 行——血缘与 facet 事实分轨）。
- miss 卡 `lineage: null` 常驻（schema 形状统一）；renamed_to 一跳语义与逐请求重验证不动。

### T2b 双仓实跑（试点集票面）
- jiahao@ba83908：1109 事实；`src/shared/paths.js`→stitched_from=[hooks/jiahao-paths.js]（edge 175aff7 sim=92）；旧名查询→renamed_to+revalidated=true（成对件双端）。
- env-manager@9eb8f24：684 事实；`src/Audit/Crypto/AuditCrypto.cs`→stitched_from 双名（2-hop：AuditCrypto.cs→src/AuditCrypto.cs→src/Audit/Crypto/AuditCrypto.cs）；根名→renamed_to+revalidated=false（一跳诚实，逐请求推进实证）；中间名→renamed_to+revalidated=true。
- 实物档：`D:\Aworker\6F\.scratch\macro-audit\audits\r36\{jiahao,env-manager}-facts.duckdb`。

### T2c 边界件（FILE-CARD 32/32）
- L1 1-switch 成对件新名端（并入+F10 回归=不误进 new_file）；L2 多跳 A→B→C；L3 环检测 A⇄B；L4 跨集注入缝；L5 真 DuckDB 投影端到端（祖先集边）；L6 0-switch 四态逐类点名+对照组（无血缘仍 new_file）。

### T2d benchmark（机器可裁决三件套）
- `D:\Aworker\6F\engine\scripts\bench-file-card.mjs`：projectFileCard 端到端×实档＋buildFileCard 病态图 stress（20k 行/500 边/60 跳链）；p95 分档 target/danger 双阈值；danger 档 exit 1。
- 预登记票面：`D:\Aworker\6F\.scratch\macro-audit\reports\80-bench-thresholds.md`；实测件 `audits/r36/bench-file-card.json`：jiahao p95=72→target 200/danger 800；env-manager 46~54；合成 large 34.9→target 4000/danger 12000。verdict 全 target。

### T2e/f 披露四件套＋能力矩阵收窄
- README 矩阵 Micro-B→capability 4 of 5・preview（试点集措辞）；Status 句同步；docs/listing/description.md+credential-checklist.md 1-4 口径；`.claude-plugin/marketplace.json` 4 of 5；audit.ts/demo.ts `not_in_preview` 去 Micro-B；README.zh-CN.md 再生；demo golden 再生（not_in_preview 形变）；41b-check/44-check 钉随口径更新（D-127 同票收窄）。

## 二、验证回执

| 面 | 命令 | 结果 |
|---|---|---|
| 编译 | `env -u NODE_OPTIONS npx tsc -p tsconfig.json --noEmit` | rc=0 |
| 打包 | `npm run build`+`npm run package` | BUNDLE-OK / macro-audit-0.1.0.tgz 85 文件 |
| 测活 | `dist/cli.js selftest` | 5/5 ok |
| MCP | `node .scratch/macro-audit/audits/r33/mcp-f5.cjs` | INIT ok / TOOLS[facts,quarantine,file_card] / never_collected 结构化 |
| smoke | `npm run smoke` | 22 册全绿（FILE-CARD 32/32 尾位） |
| 守卫 | 33 39 40 41a 43 44 45 70 71 72 73 77 78 80 81 82 83 41b xfail | 全 rc=0（41a 38/38・44 59/59・77 16/16・80/83 19/19） |
| gen | `npm run gen`（manifests+adr-index）＋gen-demo-golden | GEN-OK 幂等＋golden 三场景再生 |
| dist 钉 | `scripts/check-dist.mjs` | DIST-RATCHET PASS 262422B/289395B |

44/77/41b 曾因 Micro-B 上架口径旧钉红——按 D-127 同票收窄纪律更新钉面后全绿（非降级：钉随契约改写）。

## 三、遗留/边界
- T2b 判定：本票面写「试点集」非覆盖面——two-repo 不构成生产泛化；upstream 只按当前名发行→实跑中 stitched_from 解析名集行级零并入照实披露。
- T3+ 未动：#75 批1建制/枚举/census-contract/NOTICE 核查/观察项/MCP 验收/触发器/post-merge/勘误双读数/R31-Q6 续——下轮任务书序列照走。
- 用户闸门维持：不 push/merge；social-card.png 所有者手动。
