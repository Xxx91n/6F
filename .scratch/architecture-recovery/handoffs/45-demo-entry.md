# Handoff: 45 — 演示入口（fixture 生成器＋demo --scenario＋CASRAI 披露块）

- **A-xxx covered:** A-050
- **Decision:** spec-phase-tasks.md R6-02 行；macro-audit 账本 D-038（唯一契约源）
- **对应 issue:** issues/45-demo-entry.md
- **对应 prompt:** prompts/45-demo-entry.md

## 上下文摘要（3-5 句）
D-038 拍板：演示入口 = 内置合成 fixture 生成器为主干＋外部样例仓仅文档 opt-in。资产形态 = `fixtures/definitions/*.json`（happy-path／degraded-supply／degraded-incomplete 首发三个）＋`fixtures/golden/`＋生成器随 tgz 分发；生成器输出确定性 git 仓（merge／多分支／tag，FerrLabs 模式），临时目录生成跑完即弃。入口 = `demo [--scenario]` 默认 happy-path。披露块 = 机器可读 CASRAI 式，与 D-037② 报告头字段同一契约面（复用 `preview_disclosure`，禁两处手抄）。demo 内部走同一 Repo Intake 本地路径（D-013）。

## 完成定义（本票 done 判据）
- 生成器 + 三场景 definitions + golden 落盘；`demo --scenario` 三场景实跑 exit 0、临时目录跑完即弃
- 披露块四印记逐字在机读侧车（synthetic fixture／not an audit／capability 1 of 5 · preview／supply-chain: ⚠ unverified）；字段集与 #38 preview_disclosure 同一契约
- 合成数据不冒充真实审计；失败路径两变体可确定性触发
- 守卫 reports/45-check.mjs PASS；npm test 全链绿（新测试入 smoke）；ledger A-050 done；WORKFLOW §4 lessons；commit 引 A-050 + 守卫结果

## 通用调研要求（每票适用，写一次）
- **atomcode 深度调研**（per WORKFLOW §4.2.3）：D-038 已含 atomcode 深调研结论（FerrLabs 确定性 git fixture／golden-file 双指南／CASRAI 披露），本票按其冻结口径落地；冲突显式点名不静默改向
- **回顾 docs/adr/**：0009（Repo Intake）、0013（裁定协议）、0014（上游反腐层零业务规则）、0017（preview 标注诚实）
- **对标工业界成熟方案**：确定性 fixture（pin author/date/tree）＋golden-file diff 惯例

## 阻塞
- None（#43 golden CI 反向消费本票 definitions，不构成本票前置）

## 关键参考
- macro-audit 账本 D-038（契约原文）、D-013（intake 本地腿）、D-034③④（供应链未接演示化）、D-037②（报告头字段统一契约面）
- `engine/src/report/generate.ts` PreviewDisclosure／degradeReport；`reports/38-macro-c-preview-failure.{md,json}` 实物形态
- `engine/src/intake/intake.ts`（repoAdd/classifyRepoInput）；`reports/39-macro-b-one-shot.mjs`（Macro-B 管线先例）
