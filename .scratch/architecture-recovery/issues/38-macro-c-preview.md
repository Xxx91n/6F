# 38: Macro-C preview — anysearch-cli 校准＋单仓披露＋演示双件 DoD

**A-xxx covered:** A-043
**Spec ref:** [spec.md](spec.md) §R5-D7

**What to build:**
Macro-C（演化考古）preview 层跑通：anysearch-cli 为校准语料（56 ADR＋supersede 链稀缺素材）；报告强制披露「单仓校准（anysearch-cli）」结构性限制（披露非演示纪律 D-032）；完成定义含该层 happy+failure 演示双件（各层 preview 里程碑 DoD 准入件）。preview 标注诚实是决策本体（ADR-0017）。

**Blocked by:**
#35, #36, #37

**Status:** ready-for-agent

- [ ] Macro-C 触发序列 + 采集面（#35 扩面产出）+ 叙事/裁决/报告全链在 anysearch-cli 实跑
- [ ] 报告含「单仓校准（anysearch-cli）」结构性限制披露块（缺此块 = FAIL）
- [ ] happy + failure 演示双件产出（failure 件含 ⚠ unverified / 降级注释 / verdict-gate 印记）
- [ ] 触发器 (b) 核查：Macro-C 是否与 Macro-B 共用同一 DuckDB——是则登记多写者 self-probe 触发（衔接 #33 guard）
- [ ] 守卫 reports/38-*.mjs PASS
