# 31-report — 阶段 2b CodeLore 单上游探针（A-036 / spec §R4-D6）

## §0 开工复述
本票 Blocked by R4-04 结题（✓ 30-check.mjs PASS 9/9，commit nvm）。必读已读：issue/handoff/spec §R4-D6/ADR-0014/D-020/D-024/31-prompt。范围 = 运行时解析判定 + Agent Plugins schema P1 预核对 + 适配器 + 锁版本 + golden 契约测试 + 首报同仓重跑 diff + 漂移报告 + 上游清单状态更新。

## 调研
- **通道**：`ctx_batch_execute` → `atomcode -p` 串行 timeout 600000；resume 锚 = `3e319815-2b1c-43b2-9f29-0c7c514f3631`（索引 atomcode-r6-31）。
- **工业先例**：① 适配器 = 六边形 + ACL 双模式（AWS Prescriptive Guidance / Thoughtworks）——CLI 属 driven 侧，退出码/解析留适配器；② 版本锁 = 应用侧 exact pin + lockfile（Renovate）vs FSE 2025 实证反证（npm 库场景）——两源分歧如实并列，CLI 探针采 pin+校验；③ golden 契约 = golden-master 录制回放事实标准，明列「只证字节未漂」局限 + 须先证能红（本票 G5 漂移拒绝用例即红证）；④ 漂移报告 = GX/Evidently 期望套件 + 基线对照模式（Avanade 上游模型变更案例）。
- **冲突点名**：pin vs range 真实分歧（FSE 2025 vs Renovate）——按场景分界落字：本探针是应用侧外部 CLI，采 exact pin；分歧本身已记入漂移报告。

## 完成定义对照
| 判据 | 结果 | 证据 |
|---|---|---|
| 运行时解析策略判定（前置派生） | ✅ | binary-discovery 判定 + 理由落漂移报告 §1（容器捆绑拒绝理由 + MCP stdio 留作未来通道） |
| 读 Agent Plugins 1.0.0 schema 原文（P1 预核对） | ✅ | 原文抓取 agent-plugins.org/schemas/1.0.0/plugin.schema.json；发现本仓 engine/plugin.json 不符合（缺 `$schema`、extensions 形态错、additionalProperties 违规）→ 漂移报告 §4 登记为独立修复项 |
| 适配器（业务规则禁入） | ✅ | engine/src/upstream/codelore.ts：resolve+spawn+parse 三件套；守卫 A3 断言无 threshold/verdict 词 |
| 锁版本 | ✅ | CODELORE_PINNED_VERSION='0.28.0'；实测 resolve pinned=true |
| golden 契约测试 | ✅ | engine/test/codelore-adapter.test.mjs 7/7（fixture×4 录制真实输出；G5 漂移拒绝=红证；G7 错误路径） |
| 重跑 6F 首报同仓同 spec diff + provenance | ✅ | 31-probe-measurements.json：冻结 v1 0.2462 RED / 当前树 v2 1.0 not-RED（n=16）；provenance=commit pin+spec sha256+facts sha256 |
| 数据源漂移报告 | ✅ | 31-upstream-drift.md（漂移面登记 + 任务1/3 锚 + P1 发现） |
| README 上游清单 CodeLore 行更新 | ✅ | 规划中 → 已接入（探针切片） |
| 编译/打包/测活/test 闭环 | ✅ | `npm test` = gen+build+smoke(6/6)+collectors(13/13)+codelore(7/7)；`npm run package` → tgz 31 文件；`cli selftest` ok=true |
| 守卫 PASS exit 0 | ✅ | `node 31-check.mjs` → PASS 14/14 |

## 关键发现
1. **CodeLore 能力面远超预期**：56 个 analysis 子命令 + schema/explain/check/gate/mcp/calibrate 全套；本探针只契约化 explain+summary+version 三面（单上游纪律不贪全）。
2. **LLM 门控实测复现**：`explain --llm` 无 CODELORE_LLM_* 时确定性输出照常 + 显式 error——R5-Q3 判定成立，S4 LLM 面 = 可选 advisory。
3. **P1 预核对抓到真缺口**：plugin.json 自造格式 vs 1.0.0 schema 严格面冲突（additionalProperties:false）——双 manifest 的「标准 plugin.json」侧需另立修复票。
4. **v1/v2 并存实证检测器版本是读数一部分**：治理后同树 v1=0.8 RED vs v2=1.0 not-RED。

## 阻塞
无。R4 全链结题（#26→#31 六票闭环）。

## lessons 候选
- ctx_execute 写含正则/转义的文件两次翻车（String.replace $ 展开 + 模板字面量 \\ 双层解码）——regex-heavy 文件走 ctx_batch_execute heredoc（`<<'EOF'` 逐字保真）是最稳通道。
- 上游探针守卫可断言「适配层零业务规则词」作 ACL 机检代理（threshold/verdict 词扫描）。

## 引用文件
- 产物：engine/src/upstream/codelore.ts、engine/test/codelore-adapter.test.mjs、engine/test/fixtures/codelore/×4、reports/31-codelore-probe.mjs、31-probe-measurements.json、31-upstream-facts.jsonl、31-upstream-drift.md、31-check.mjs、31-report.md

## 版本控制处置
- 分支 `31-codelore-probe`（叠于 30-frozen-calibration-desk），commit 引 A-036。未 push。
