# 48: Micro-A preview 单票铺开 — 适配器消费侧管道＋双仓实跑＋报告双件＋披露三件套＋desk-task15/micro-a-preview-prep 事件闭环

**A-xxx covered:** A-056
**Spec ref:** spec-phase-tasks.md R8-02 行；../../macro-audit/handoffs/next-round.md T1；D-049 / D-047 / D-033 / D-044

**What to build:**
`.scratch/architecture-recovery/reports/48-micro-a-preview.mjs`——Micro-A preview 管道：PR intake 经 github-rest-adapter@v1（枚举+元数据+diff 双通道）→ facts（JSONL＋48-audit-facts.duckdb，scale=Micro-A）→ 预声明判据裁决（48-micro-a-criteria.md：PC-1 管线活性/TC-1 证据三联/TC-2 diff 通道声明/TC-3 作者形态披露/TC-4 托管面资格闸/NC-1 merged 选择性）→ buildReport 共享骨架四章＋MICRO_A_SLICE_FIELDS 导出契约。golden=cassette 回放断言面（只锁字段骨架不锁内容值）。

**Blocked by:** #47（github-rest-adapter@v1 已 active）

**Status:** done（2026-09-16）

- [x] ① golden 管道 PASS 14/14：authenticated.cassette 扩一帧回放（pr64 全三联 supported＋pr51 缺 diff→insufficient 腿如实）＋zero-pr 合成带拒绝件 unsupported＋token 入 wire 不入 fact
- [x] ② env-manager 三形态：#64 release-please 机器生成（github-actions[bot]/local-git）·#55 dependabot[bot]（api 兜底，head sha 本地缺席如实回退标注）·#51 人类（local-git）→ 全 supported
- [x] ③ jiahao 全人基线：#6 人类/local-git → supported
- [x] ④ failure 件：goose-duck-agent 托管枚举 merged=0 → intake 显式拒绝 unsupported 双件（原因+前置条件）；**前提漂移如实登记**——anysearch-cli 票写时无托管面（#37 pr=0）→ 复核 merged=6≥1 漂移入披露
- [x] ⑤ 披露：preview_disclosure 四字段（capability 3 of 5 · preview／同主确认偏差置首／判据收窄＋planned 面＋供应链未接／not_in_preview=Micro-B·Macro-A）；diff_channel+credential_strategy 走主路/回退标注；README 能力矩阵翻转
- [x] ⑥ desk-task15→decided（trigger-fired-criterion-met）＋micro-a-preview-prep occurred 翻转＋绑定三项复审留痕＋codelore-residual-faces reaffirmed

**实证：** golden 14/14＋真跑 4 PR supported＋拒绝件 unsupported＋duckdb 101 facts（4 仓）＋48-check PASS＋npm test 全链绿＋package＋selftest 5/5

