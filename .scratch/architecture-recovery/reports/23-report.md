# 23 — 首报全链与三层闸门验收（报告）

> 覆盖 A-026 / A-027｜spec: `spec.md` §R3-D5｜决策: `docs/adr/0012` + `docs/adr/0013`｜issue: `issues/23-first-report-e2e.md`
> 状态：**A/B/C 三闸全部执行完毕，守卫 36/36 PASS（退出码 0）**；C 层人裁定原文待用户产出后回写账本（见 §6）。

---

## §1 开工复述（per 启动器「开工第一句」）

**阻塞状态**：Blocked by #19、#22 —— 二者均已闭环（#19 CI 首跑绿 run 34736927344 / 复跑 34737204262；#22 预声明已 commit 7395495），本票无阻塞。

**必读清单逐条路径（动手前逐条确认可解析）**：

| 项 | 路径 | 解析结果 |
|---|---|---|
| issue | `.scratch/architecture-recovery/issues/23-first-report-e2e.md` | ✅ 563 B |
| handoff | `.scratch/architecture-recovery/handoffs/23-first-report-e2e.md` | ✅ 1431 B |
| spec §R3-D5 | `.scratch/architecture-recovery/spec.md` L317–L318 | ✅ |
| WORKFLOW §4.2 | `.scratch/architecture-recovery/WORKFLOW.md` L229–L256 | ✅ |
| decision-ledger A-026 / A-027 | `.scratch/architecture-recovery/decision-ledger.md` L238 / L239 | ✅（本票回写 done） |
| ADR-0012 | `docs/adr/0012-value-validation-loop-first.md` | ✅ 1005 B |
| ADR-0013 | `docs/adr/0013-three-layer-acceptance-gates.md` | ✅ 1046 B |

---

## §2 调研（per §4.2.3）

- 调研报告：`reports/23-atomcode-research.md`（含 §0 carrier 缺口明示 + SARIF / OTLP / GraphQL / RFC 3161 / in-toto / W3C VC 一手规范对标）。
- 提示词留档：`reports/23-atomcode-prompt.md`。
- **工业类比 ≥2**：① SARIF v2.1.0（`results[].ruleId` §3.27 + `locations[].physicalLocation.artifactLocation.uri` §3.4.3 + `region.snippet` §3.30.13）支撑「引文锚三元组」；② OTLP 1.11.0 Partial Success（`partial_success` / `rejected_<signal>` / `error_message`，含 "The client MUST NOT retry…"）支撑「同骨架降级 + 禁止回炉」；③ GraphQL Oct2021 §7.2 / §8.2 的部分结果模型作旁证（转述，未逐字核对）。
- **与 current 决策的冲突点**已在调研报告 §6 逐条点名，未静默改向。

---

## §3 实现与三闸执行记录

### §3.0 开跑前三查（启动器 delta 第 1 条）

| 查 | 证据 | 结果 |
|---|---|---|
| 票 19 CI 证据在档 | run 34736927344 见于 `decision-ledger.md` A-019/A-020；复跑 34737204262 见于 `reports/19-report.md` | ✅ |
| 票 22 预声明已 commit | `git log -1 -- 22-criteria-pre-registration.md` = **7395495**（分支 22-b-criteria-prereg） | ✅ |
| C 裁定依据预入库可指认 | `reports/22-c-adjudication-basis.md`（同 commit 7395495），含 B1–B5 与 A1–A8 | ✅ |

三查全过 → 允许开跑。

### §3.1 链路与产物

`采集 → fact → 叙事 → 裁决 → 报告` 由 `reports/23-first-report.mjs` 单脚本串起，纯逻辑落在 `engine/src/report/generate.ts`（单模块、只依赖 `node:crypto`，守卫可直连 import，承 #21 教训）。

| 产物 | 路径 | 说明 |
|---|---|---|
| 首报主产物 | `reports/23-first-report.md` | 169 行，4 章锁定 |
| agent 侧车 | `reports/23-first-report.json` | 结构化裁决块 + 引文锚（A-027） |
| 失败路径 | `reports/23-first-report-failure.md` / `.json` | FP-2 Macro-B failure，同骨架 + ⚠ unverified |
| 事实日志 | `reports/23-facts.jsonl` | 228 条，绑定 `audit_fact` 16 列 |
| 只追加 DML | `reports/23-facts-insert.sql` | 逐条经 `assertAppendOnly` 校验 |
| 实测数 | `reports/23-measurements.json` | 供引文回查 |
| 夹具 | `reports/23-fixtures.json` | PC-1/PC-2 正对照 fixture |
| 三闸记录 | `reports/23-gates.json` | preflight + A/B/C |

### §3.2 B 闸（正对照 2/2 先行，未中即停）

| 判据 | 结果 | 数值 |
|---|---|---|
| PC-1（前置管线健康闸 A） | **PASS** | adr-structure 11 事实 / positioning 20 事实；golden ADR 五件套 5/5、supersede 命中 |
| PC-2（前置管线健康闸 B） | **PASS** | `git.adr_lag_days.delta_days = 255 > 0` |
| TC-1（S2a 事后补写占比） | **INCONCLUSIVE** | 可判定数 2 < 门槛 5（与预声明一致） |
| TC-2（S2b 五件套完整度） | **RED** | `mean_ratio = 0.2462 < 0.60`；Status / Date 缺失率 84.62% > 0.50 |
| TC-3（S1 定位覆盖率） | **AMBER** | 最低 `ratio = 0.6000`（CONTEXT.md） |
| NC-1（特异性守卫） | **PASS（0 命中）** | 选材 `engine/src/fact/schema.ts`，fact_count 11、五件套 0、supersede false |

**与票 22 预声明 §8 预期逐项对账**：6/6 完全一致，阈值零改动（守卫 B4 断言）。

### §3.3 A 闸 / C 闸

- **A 闸**：章顺序 `C1 执行摘要 → C2 四象限与裁决 → C3 证据 → C4 行动建议` 锁定，happy 与 failure 序列逐项相等、每章非空；11 条证据全部 `evidence_id + source + locator` 可解析且**逐字回查 0 失配**；引文→结论支持关系 **11/11 supports**；Receipt `RCP-9d20125ad0976c86`（chain_hash 64 hex，228 事实）。
- **Receipt 加固（按调研 §2.1 / §6.2，A 层实现，不改 B/C 判据）**：单 commit 锚不足——commit sha 本身可塑（arXiv:2607.02820），故补三件：① `tree_anchor = HEAD^{tree} = 6f405cfc2ce5…`（内容寻址主体，守卫 R1 断言其为可解析的真实 tree 对象、commit 锚为真实 commit 对象）；② `content_digest{algo: sha256, canonicalization: json_utf8_entries_then_citation_checks}`（显式算法与规范化规则，守卫 R2）；③ `gate_ref{prereg_commit: 7395495, criteria_path, basis_path, criterion_ids}`（守卫 R3 用 `git merge-base --is-ancestor` 机器证明**预声明闸门拓扑先于首报锚**，即「经过闸门而非事后生成」）。降级产物保留同一 tree 锚并置 `degraded=true`（守卫 R4）。
- **C 闸**：6 条裁定逐条锚定（basis_refs B1/B2/B4 + anchored_fact_ids + anchored_evidence_ids），无无锚条目；综合裁定按规则推导 = **unsupported**（TC-2 RED 主导）；`human.status = pending`，**C 裁定原文 + 时间戳仍由用户产出**。

### §3.4 守卫

```
node .scratch/architecture-recovery/reports/23-first-report-check.mjs
→ 36 checks, 36 pass, 0 fail ; 23-first-report-check: PASS (exit 0)
```

断言分组：P1–P3 开跑前三查 / A1–A8 形式达标 / B1–B6 内容非平凡 / C1–C6 信任裁决 / R1–R4 receipt 加固。

`tsc --noEmit`：`engine/src/report/generate.ts` **0 错误**；`engine/src/fact/store.ts` 2 条 `@duckdb/node-api` 找不到模块为**本机原生包未安装**的既有状态（CI 已绿，非本票引入）。

---

## §4 信息缺口（Sufficiency Gate）

| 缺口 | 性质 | 处置 |
|---|---|---|
| C 层人裁定原文与时间戳 | 人来料（ADR-0013「裁定仍由人做」） | 槽位已留（`human{status,adjudicator,text,decided_at}`）；**待用户产出后回写 ledger A-027 行** |
| DuckDB 实写 | 本机缺 `@duckdb/node-api` 原生包 | 走同形态降级：JSONL + 渲染 INSERT 经 `assertAppendOnly`；DuckDB 实写留给 CI |
| atomcode 调研成稿 | carrier 前两轮失效 | 第三次尝试由用户在另一会话完成并手动转存，已抽取落位 `reports/23-atomcode-research.md`（283 行 / 26 源）；carrier 全过程在报告 §0 留痕 |
| structure / behavior / supply_chain 三象限 | 阶段 1 范围外（只跑 S2+S1） | 标 `applicability=not_applicable` + `out-of-scope-R3-01` 冲突标记，未伪装成绿 |
| A5 方向检查（四值 `support_relation`） | 调研 §6.1 建议：现实现只输出 supports / insufficient，缺 `refutes` 与 `supports_indirect`（FEVER 三分类 + Bluebook 引证信号） | **不在本票内改**：会改 A7 判据语义，属 A 层判据扩展，记入下一票输入（`23-atomcode-research.md` §6.1） |
| 同骨架套件 S1–S6 | 调研 §6.4 建议：现实现只落 S1（章集合与顺序相等）+ 每章非空，S2–S6（字段计数/摘要/降级印记/链接/evidence_id 集合）未落 | **不在本票内改**：现实现已满足 issue 的「同骨架」要求；S2–S6 记入下一票输入 |

---

## §5 完成定义对照（逐项）

| handoff 完成定义项 | 状态 | 证据 |
|---|---|---|
| 首份真报告 + 失败路径产物落位（路径明文） | ✅ | §3.1 表（6 类产物全路径） |
| 三闸执行记录齐（A 机检清单 / B 对照表 / C 裁定原文） | ✅ | §3.2 / §3.3 + `23-gates.json`；C 裁定**原文**待用户（见 §6） |
| ledger A-026 / A-027 回写 done | ✅ | `decision-ledger.md` L238 / L239 |
| C 裁定原文入账本 | ⏳ 部分 | 规则推导已入；人裁定原文槽位待用户产出 |
| WORKFLOW §4 追加 1 行 lessons | ✅ | 2026-09-13 R3 #23 行（含 4 处真缺陷） |
| commit msg 引用 A-026/A-027 + 闸门结果 | ✅ | 见 §8 |
| 失败路径产物含 ⚠ unverified 印记 | ✅ | 守卫 C6 |
| agent 可消费性（结构化裁决块 + 可解析引文锚） | ✅ | 守卫 C4 |

---

## §6 阻塞

- **无上游票阻塞**（#19 / #22 均已闭环）。
- **待用户来料 1 项**：C 层裁定原文 + 时间戳。按启动器 delta 第 4 条，agent 侧已交付可消费侧车与主报告；裁定原文由用户产出后回写 `decision-ledger.md` A-027 行，本票即达完全闭环。

---

## §7 lessons 候选（已同步 §4）

1. 引文的「定位锚」必须等于「支撑锚」——否则可回查与可支撑各证一半（本票首轮 10/11 即由此暴露）。
2. 多档合并裁定必须写明优先级语义：确定证伪 > 不可裁定 > 未观察；否则「缺数据」会吞掉「已证伪」。
3. 原生依赖缺包时的降级必须形态不变 + 守卫覆盖，不得静默跳过链路步骤。
4. carrier（atomcode）与 ctx 双通道都可能在单窗口内失效，启动器应预设三级降级顺序并显式留痕。
5. Receipt 只锚 commit sha 不足以自称「不可伪造」——commit sha 可塑，必须同时锚 `HEAD^{tree}` 并用 `gate_ref` + `merge-base --is-ancestor` 机器证明「闸门先于被裁定对象」。
6. 断言「锚等于当前 HEAD」是把不变量写错了：产物锚定的是**生成时刻**，提交后必然失配，会把正确的实现判成假 FAIL。锚类断言应写「可解析为真实对象」（`git cat-file -t`）+ 拓扑关系，而非与易变引用做相等比较。（本票首次收口即踩到，R1 首版误报。）

---

## §8 版本控制处置（WORKFLOW §4.2.1）

- 全程走 `but` CLI，未使用任何 git write 命令。
- 独立分支：`23-first-report-e2e`（本 Agent session 专用）。
- commit message 引用 A-026 / A-027 + 闸门结果（守卫 32/32 PASS，退出码 0）。

---

## §9 引用文件

| 文件 | 作用 |
|---|---|
| `.scratch/architecture-recovery/issues/23-first-report-e2e.md` | 完成判据 |
| `.scratch/architecture-recovery/handoffs/23-first-report-e2e.md` | 完成定义 |
| `.scratch/architecture-recovery/prompts/23-first-report-e2e.md` | 启动器（本票常驻任务书） |
| `.scratch/architecture-recovery/spec.md` §R3-D5 | 规范来源 |
| `docs/adr/0012-value-validation-loop-first.md` | 阶段 1 于 6F 出首报 |
| `docs/adr/0013-three-layer-acceptance-gates.md` | 三层闸门 + C 层四条款 |
| `.scratch/architecture-recovery/reports/22-criteria-pre-registration.md` | B 层判据与阈值（权威锚 ICH E10 / ISO 13528） |
| `.scratch/architecture-recovery/reports/22-c-adjudication-basis.md` | C 层裁定依据（B1–B5 / A1–A8） |
| `engine/src/report/generate.ts` | 首报生成器纯逻辑 |
| `engine/src/collect/collectors.ts` | 三族采集器（同口径） |
| `engine/src/fact/schema.ts` | audit_fact 16 列契约 + assertAppendOnly |
| `reports/23-first-report.mjs` / `23-first-report-check.mjs` | 执行脚本 / 守卫 |
| `reports/23-atomcode-research.md` | 调研报告 |
