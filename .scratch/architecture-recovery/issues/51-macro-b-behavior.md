# 51: Macro-B behavior 象限接入 — codelore 行为面 golden 契约＋能力矩阵收窄

**A-xxx covered:** A-058
**Spec ref:** spec-phase-tasks.md R9-02；D-054

**What to build:** CODELORE_BEHAVIOR_FACETS（hotspots/coupling/function-hotspots）＋51 管道（实物跑→判据→Macro-B 报告 behavior 切片）＋能力矩阵收窄（strategy:active·behavior:preview·structure/supply-chain:queued）＋quadrant 归位规则＋低样本披露＋D-035 勘误。

**Blocked by:** 无
**Status:** done（2026-09-16）

- [x] ① 实物跑 `codelore analyze`（hotspots/coupling/function-hotspots on env-manager 0.28.0）确认 schema→51-behavior-schema.json 留痕（D-054⑥）
- [x] ② 面集接入：CODELORE_BEHAVIOR_FACETS group=behavior；function-coupling（--target 面）暂缓登记
- [x] ③ 预声明判据 51-behavior-criteria.md：PC-1 三面齐备／TC-1 min(revisions)≥5／TC-2 coupling 有效占比≥0.5／NC-1 deferred 如实标注
- [x] ④ behavior 切片：Macro-B 报告 behavior=native（verdict=supported 实测）；其余三象限 not_applicable+queued 理由
- [x] ⑤ 能力矩阵收窄：README/SKILL.md（strategy:active·behavior:preview·structure/supply-chain:queued）
- [x] ⑥ D-035 勘误注记落账（faces 消费侧扩展 Macro-B behavior，契约本体不变）；registry deferred 面集确认留痕

**实证：** 51-check.mjs PASS＋npm test 全链绿＋51-behavior-measurements.json
