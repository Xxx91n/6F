# 38: Macro-C preview — anysearch-cli 校准＋单仓披露＋演示双件 DoD

**A-xxx covered:** A-043
**Spec ref:** [spec.md](spec.md) §R5-D7

**What to build:**
Macro-C（演化考古）preview 层跑通：anysearch-cli 为校准语料（56 ADR＋supersede 链稀缺素材）；报告强制披露「单仓校准（anysearch-cli）」结构性限制（披露非演示纪律 D-032）；完成定义含该层 happy+failure 演示双件（各层 preview 里程碑 DoD 准入件）。preview 标注诚实是决策本体（ADR-0017）。

**Blocked by:**
#35, #36, #37

**Status:** done（2026-09-16，38-check.mjs PASS 36/36 exit 0；报告 `.scratch/architecture-recovery/reports/38-report.md`）

- [x] Macro-C 触发序列 + 采集面（#35 扩面产出）+ 叙事/裁决/报告全链在 anysearch-cli 实跑 — `38-macro-c-preview.mjs`：1012 facts（codelore 30/30 + ADR 65 + gitlog 65 + llm_gated×3 + supersede 复测 8 边↔37 一致）→ 报告 `38-macro-c-preview-report.{md,json}`，receipt RCP-5f869c282a475240，overall=insufficient（诚实部分裁定）
- [x] 报告含「单仓校准（anysearch-cli）」结构性限制披露块（缺此块 = FAIL） — generate.ts 新增 `preview_disclosure` 契约面（D-037② 报告头字段统一契约面首实现），happy+failure 双载；38-check B1-B4
- [x] happy + failure 演示双件产出（failure 件含 ⚠ unverified / 降级注释 / verdict-gate 印记） — `38-macro-c-preview-failure.{md,json}`（degradeReport：⚠ unverified 回执 + 降级注释 + verdict_gate_stamp insufficient ⚠ unverified）
- [x] 触发器 (b) 核查：Macro-C 是否与 Macro-B 共用同一 DuckDB——是则登记多写者 self-probe 触发（衔接 #33 guard） — **共用成立**：38-audit-facts.duckdb 同库 Macro-B 228+Macro-C 1012；registry event occurred + mw-trigger-b confirmations trigger-fired（ALARM 值守登记）
- [x] 守卫 reports/38-*.mjs PASS — `38-check.mjs` PASS 36/36 exit 0
