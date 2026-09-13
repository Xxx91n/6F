# R3 执行轮实现摘要（A-019 ~ A-030 结算，2026-09-13）

> 来源：architecture-recovery/decision-ledger.md「R3 执行轮摩擦点登记」段（票 #19 ~ #25，W1~W4 已闭环）。决策全文见 docs/adr/0012、docs/adr/0013；本文件是 implemented 决策的摘要沉淀。

## Implemented（10 条）

| A-xxx | 决策摘要 | 实物锚 |
|---|---|---|
| A-019 | push 达 origin（授权 origin/main 立即执行；实推 3 分支，main 落地留待用户）| run 34736927344 / 34737204262；commit 4624acd |
| A-020 | CI 矩阵最小可证集：3 OS × Node 20/22 = 6 cells，随首跑 6/6 绿 | engine-ci.yml；run 34736927344 |
| A-021 | fact table schema v0：audit_fact 16 列 + schema_registry 5 列；绑定唯一 @duckdb/node-api@1.5.5-r.4；只追加 + correlation key（trace_id/baggage_id CHAR(32)）| engine/src/fact/；守卫 28/28 |
| A-022 | 确定性采集器三族 adr-structure@v1 / positioning@v1 / gitlog@v1；DETECTOR_BINDING 判据→族映射；零网络零 LLM | engine/src/collect/collectors.ts；守卫 43/43 |
| A-023 | 3 真判据阈值 6F 跑前实测写死：TC-1 >90 天且 >0.20 / TC-2 <0.60 / TC-3 <0.50 红 | reports/22-threshold-raw.json；守卫 19/19 |
| A-024 | 负对照 NC-1 选材 engine/src/fact/schema.ts（+备份 .gitattributes），预期 0 命中 + 4 步复核路径 | 预声明文档 §5 |
| A-025 | 预声明文档 + C 层裁定依据看报告前 commit 入库（HARKing 禁令闭环）| reports/22-criteria-pre-registration.md + 22-c-adjudication-basis.md |
| A-026 | 首报全链产物：md 主报告（4 章锁定）+ agent 侧车 JSON + 失败路径（⚠ unverified）+ Receipt 双锚（tree/commit）+ gate_ref 拓扑证明 | reports/23-first-report.md；守卫 36/36 |
| A-027 | C 层判据覆盖 agent 可消费性：结构化裁决块 6 条目（basis_refs + anchored_fact/evidence_ids）+ 可解析引文锚；人裁定槽位保留 | 23-first-report.json；C 裁定 supported 已回写账本（2026-09-13） |
| A-029 | 引用策略：ICH E10 §1.5/§1.3.4 + ISO 13528:2022 权威锚，逐条可回查 | 预声明文档 §6 |

## Deferred（2 条，票未开工）

- **A-028**（缺口回流实测锚清扫）→ 票 #24 下一波候选；
- **A-030**（铺开与分发收尾）→ 票 #25，前置清单待用户逐项拍板。

## 关键实验结果

- 首报 MA-23-6F-FIRST-REPORT：**TC-2 RED**（五件套 mean_ratio 0.2462 < 0.60，Status/Date 缺失率 84.62%）→ 规则推导综合裁定 unsupported；**TC-1 INCONCLUSIVE**（11/13 ADR 无 Date 头，A-002 预警实证）；TC-3 AMBER；C 层人裁定：**supported**（2026-09-13，per B5 人裁定为最终档位，与规则推导的张力已如实记录账本）。
- RAT 实验闭环成立：预声明 → 确定性采集 → 事实表 → 裁决 → 带引文报告 → 人裁定，全链可机检（守卫 36/36），闸门拓扑经 merge-base 证明先于产物。