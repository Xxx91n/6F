# Prompt: 44 — 版本与上游锁定制度化

- A-xxx: A-049
- Decision: spec.md §R6-01＋D-037＋D-039③＋ADR-0018
- Blocked by: 无（DoR 闭合；P0 首发 tag 硬前置）
- 身份: 遵循 WORKFLOW.md §2 的开发 Agent，本票唯一目标 = 完成本票闭环
- 必读清单（动手前逐条确认可解析）:
  - issues/44-upstream-lock.md
  - handoffs/44-upstream-lock.md
  - spec-phase-tasks.md R6-01 行；../macro-audit/handoffs/next-round.md T4 行
  - WORKFLOW.md §4.2
  - decision-ledger.md（A-049 行）
  - ../macro-audit/decision-ledger.md（D-037/D-039 行）
  - docs/adr/0014-*.md、0017-*.md、0018-*.md；docs/versioning.md
  - engine/src/upstream/codelore.ts（CODELORE_PINNED_VERSION/binary-discovery）；engine/package.json
  - README.md（§能力边界＋§3 上游清单表）；engine/src/report/generate.ts（PreviewDisclosure 契约）；examples/first-report/README.md
  - CHANGELOG.md（仓根编年）＋engine/CHANGELOG.md（反向指针）；reports/33-gate-registry.json；reports/41a-check.mjs/43-check.mjs/45-check.mjs（守卫先例）

## 专属 delta（检查点）
- ① 锁表九字段契约逐字 per D-037③（id/kind/version/pin_type/contract/status/adapter/last_reviewed/next_review）；种子行状态逐字（codelore active exact-version 0.28.0＋--version 契约/scorecard+repomix planned/sqlite-dump evaluating＋风险注记）；禁 range/浮动 tag/latest；retired 行不删
- ② README §3 状态列=锁表人读形态——「以 engine/upstream-lock.yaml 为唯一机读权威」注记＋状态映射声明；engine/CHANGELOG Unreleased 条目引 lock
- ③ 守卫族 advisory→enforce 两段式——写明 enforce 段（结构断言全组）与 advisory 段（锁表新鲜度逾期/binary 缺席环境位）；版本断言=实跑 `codelore --version` 三方同值（binary↔锁表↔CODELORE_PINNED_VERSION）
- 禁跑 35-probe.mjs；文件写入 Node.js＋回读断言；禁 BOM；engine 源码零改动（锁表/文档面新增例外）

## 专属验收
- reports/44-check.mjs PASS（exit 0 + PASS N/N）＋四节逐项落位
- npm test 全链绿不回归＋package＋selftest（本票近零 engine 源码改动以不回归为准）
- 其余完成判据遵循 handoff 内的完成定义

## 开工第一句
先复述：本票阻塞状态 + 必读清单逐条路径，确认后再动手。

## 收尾

**❗ 收尾硬要求——以下动作缺任一项 = 本票未闭环（W2/W3 V2 重演防线）**：① 报告落盘 `reports/44-report.md`；② ledger 本票行状态回写 done/deferred；③ WORKFLOW §4 追加 lessons 行；④ commit message 引用守卫结果。

报告写入 reports/44-report.md（完成定义逐项 / 阻塞 / lessons 候选 / 引用文件）；ledger 回写与 lessons 追加按 handoff 完成定义执行；版本控制遵循 WORKFLOW §4.2（新分支 r9-44-upstream-lock，depends-on 先 but move --above r9-43-sample-golden-ci，绝不 push）。
