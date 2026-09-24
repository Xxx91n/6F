# 2026-09-24 轮 32 执行交接（r32-exec）

## 状态

- 栈：`r32-exec`（叠于 r31-closeout 之上——BACKLOG.md 同源冲突经 but move 栈序化，提交仍分道）。commits: rly(T0) → vpq(#81) → yyu(#82) → mkq(#80 步②)。未 push 未 merge。
- 验收面全绿：build OK / package tgz / selftest ok:true / smoke 22 册绿 / 17 守卫绿 / 棘轮 253,903B<289,395B。

## 已闭环

- **#81** quarantine 方言归一：边界吸收器 absorbGitIsoDialect（+00:00→Z 唯一规则）+collection_environment 独立披露块；Intake Health/golden/⚠ 零触。dialect-boundary.test.mjs 19 断言。
- **#82** 仓务批：gen-adr-index.mjs→docs/adr/README.md 生成式索引 23 行（README/zh-CN 已改指）；check-dist.mjs 棘轮挂 rebuild-diff 链（EOL 容忍+失败工件上传）；33-gate-registry first-external-contributor occurred=false；BACKLOG #80 两处票面勘误。82-check.mjs 15 断言。
- **#80 步②** 投影+查询语义：file-card.ts 三层卡（kernel 直投/derived hotspot_priority_v1 确定性派生/narrative 键校验）+miss 四类+失败三态+at pin+staleness 双字段+renamed_to 条件跳转；双触发面=MCP file_card 只读工具+CLI audit file lazy 补采（同构发射管线、SHA 可达资格检、脏工作区零感知）。file-card.test.mjs 17 断言；80-check G 段 8 断言。

## 下轮主线：#80 步③（依赖步②已就位）

- 试点三角：jiahao（人类密集）+env-manager（历史厚+机器密集）双仓实跑；anysearch-cli 校准对照位可选。票面写「试点集」不写「覆盖面」。
- 边界件 0-switch 逐类点名：miss 四类+insufficient_history 每类≥1 实物；renamed_to 1-switch 成对件（miss→renamed_to→跳转命中/二次 miss）。
- benchmark=p95 分档+target/danger 双阈值（r12-wave-a 语法）+机器可裁决三件套（阈值+脚本+原始数工件）；数值实跑预登记禁先写死。
- 披露四件套：preview 标注（capability N of 5）+advisory 性质+同主确认偏差+not_in_preview 清单；能力矩阵措辞收窄同票。

## 复跑命令

```bash
cd engine && env -u NODE_OPTIONS npm run build && npm run smoke
node dist/cli.js selftest
node dist/cli.js audit file <repo> <file> --db <facts.duckdb> [--at <sha>]
node .scratch/architecture-recovery/reports/80-check.mjs   # 28 断言含步② G 段
node engine/scripts/check-dist.mjs                        # 棘轮
```

## 关键落点

- 卡构建器 engine/src/fact/file-card.ts；投影 projectFileCard 在 fact/projection.ts；编排 runAuditFile 在 audit/file-card.ts；MCP 工具面 mcp-server.ts file_card。
- miss 态序与派生规则版本 hotspot_priority_v1 均钉在 file-card.ts 注释+导出常量。
- 注意：MCP stdio 响应乱序（handler 并发）——按 id 匹配应答勿按下标。
