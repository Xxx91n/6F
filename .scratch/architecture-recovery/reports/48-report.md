# 48-report — Micro-A preview 单票铺开（#48 / A-056 / spec R8-02 / D-049）

日期：2026-09-16 · 守卫：`node .scratch/architecture-recovery/reports/48-check.mjs`（exit 0 + PASS N/N）

## 完成定义清单

- [x] 管道 `48-micro-a-preview.mjs`（596 行）：PR intake 经 github-rest-adapter@v1 → facts（JSONL＋48-audit-facts.duckdb，scale=Micro-A）→ 预声明判据（48-micro-a-criteria.md）→ buildReport 共享骨架＋MICRO_A_SLICE_FIELDS 切片 → md+json 双件
- [x] 六步验收序列全落（见下）
- [x] registry micro-a-preview-prep occurred 翻转＋desk-task15 decided＋绑定项复审留痕
- [x] 文档回写：ledger A-056＋BACKLOG #48 ✅＋WORKFLOW §4 lessons＋日报窗口节＋README 能力矩阵翻转＋票档三件套

## ① golden 管道 PASS

`node .scratch/architecture-recovery/reports/48-micro-a-preview.mjs --golden` → exit 0，14 断言全 PASS（`48-micro-a-golden-assertions.json`）：cassette 回放（authenticated.cassette.json＋扩一帧 diff#64 供工件再现）产 pr64（supported，全三联）＋pr51（insufficient，diff 腿缺席如实）＋zero-pr 合成带拒绝件（unsupported）＋「token 入 wire 不入 fact」断言。零网络。

## ② env-manager 三形态（各 1）

| PR | 形态 | merged | diff 通道 | overall | receipt |
|---|---|---|---|---|---|
| #64 | machine-generated/release-please（github-actions[bot]/Bot 双检） | true | local-git | supported | RCP-9fe227efa42945d8 |
| #55 | platform-declared-bot/dependabot | true | api（head sha 本地缺席如实回退） | supported | RCP-e58cb53efc579955 |
| #51 | human（Xxx91n/User） | true | local-git | supported | RCP-b3f991707e3393c7 |

## ③ jiahao 全人基线

| PR | 形态 | merged | diff 通道 | overall | receipt |
|---|---|---|---|---|---|
| #6 | human | true | local-git | supported | RCP-967747d62c8f8b50 |

## ④ failure 件（诚实拒绝）

`goose-duck-agent`：托管枚举 merged PR=0 → intake 显式拒绝 → `48-micro-a-goose-duck-agent-refusal.{md,json}` overall=unsupported（RCP-b17d889c7191de37），含「无托管 PR 面＋原因＋前置条件」。

**前提漂移如实登记**：票面写死主体 anysearch-cli 撰写时无托管面（#37 实测 github_pr_total=0）——本票复核其托管枚举 merged=6≥1（eligible=true），前提已漂移；failure 演示主体改取真负例 goose-duck-agent（merged=0）。漂移注记进拒绝件披露块＋本报＋账本三处同源。

## ⑤ 披露

- `preview_disclosure` 四字段：`capability 3 of 5 · preview`＋calibration_scope（同主试点仓 4-PR 写死实例）＋structural_limitations（同主确认偏差置首——dogfooding=generative not evaluative；判据收窄非 PR 质量裁决；reviews/comments planned 未接；供应链象限 not_applicable）＋not_in_preview=[Micro-B, Macro-A]
- 平台声明的 Bot 身份措辞：bot_declared 双检真值（user.type==Bot&&login~[bot]）＋bot_basis=platform-declared 落切片字段，不自创机器归因
- 走主路/回退标注：credential_strategy（gh-token）＋diff_channel（local-git×3 / api×1）入切片字段
- README 能力矩阵：Micro-A PR diff → capability 3 of 5 · preview（44-check E8 漂移对齐：README 允 3 of 5，generate.ts/examples 仍禁 3/4/5）

## ⑥ desk-task15 核验＋micro-a-preview-prep 闭环

- `events.micro-a-preview-prep.occurred=true`（2026-09-16，证据=#48 落点）
- `desk-task15` pending→decided：confirmation `trigger-fired-criterion-met`（判据原文=「≥1 条 Micro-A 真实 PR 报告产出且字段清单满足骨架交集」——4 条报告双件＋REPORT_SKELETON∩MICRO_A_SLICE_FIELDS 机械断言全过）
- 绑定项复审留痕：codelore-llm-mcp-face/codelore-deferred-faces/upstream-probes-scorecard-repomix 维持 pending（#48 复审非刚需不拉）＋codelore-residual-faces reaffirmed
- `40-check` F4 漂移对齐（desk-task15 pending→decided 断言更新）

## 事实底座

- 事实 101 条入 `48-audit-facts.duckdb`（scale=Micro-A；env-manager 75＋jiahao 13＋anysearch-cli 10＋goose-duck-agent 3）——同一 audit_fact 表同一 appendFact 写路径
- 每仓 facts JSONL＋measurements＋每 PR diff 工件（行级引文锚 locator=L<n>）

## 阻塞/限制如实

- preview 判据=证据完整性/托管面资格/选择性——**非 PR 质量裁决**；diff --llm 行级语义评审归 #50 叙事双轨（宿主 agent 面，D-053/D-058）
- reviews/comments 面 planned 未接（锁表 github-rest 契约面）
- 同主试点不构成泛化证据；Micro-A GA 前置须 ≥1 非自有仓真实 PR
- 本票不声称 Micro-A preview 可泛化

## 复跑证据

- `node .scratch/architecture-recovery/reports/48-micro-a-preview.mjs --golden` → all_pass=true（14 断言）
- `node .scratch/architecture-recovery/reports/48-micro-a-preview.mjs` → 4 supported＋1 refusal unsupported＋duckdb appended=101
- `node .scratch/architecture-recovery/reports/48-check.mjs` → PASS（见 F 组输出）
- `cd engine && npm test` → 全链绿（SMOKE/COLLECTORS/ADAPTER/BATCH1/LLM/PREVIEW/INTAKE/DEMO/GITHUB-REST）
- `cd engine && npm run package`＋`node dist/cli.js selftest` → 绿
