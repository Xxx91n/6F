# Prompt: 47 — 托管平台 API 适配器（GitHub REST）

- A-xxx: A-055
- Decision: spec-phase-tasks.md R8-01＋D-048＋ADR-0020
- Blocked by: 无（DoR 闭合；#48 Micro-A preview 硬前置本票）
- 身份: 遵循 WORKFLOW.md §2 的开发 Agent，本票唯一目标 = 完成本票闭环
- 必读清单（动手前逐条确认可解析）:
  - issues/47-github-rest-adapter.md
  - handoffs/47-github-rest-adapter.md
  - spec-phase-tasks.md R8-01 行；../macro-audit/handoffs/next-round.md T1 行
  - WORKFLOW.md §4.2
  - decision-ledger.md（A-055 行）；../macro-audit/decision-ledger.md（D-048 行）
  - docs/adr/0020-*.md、0021-*.md、0014-*.md、0017-*.md
  - engine/src/upstream/codelore.ts（反腐层先例）；engine/src/collect/collectors.ts（makeFact/CollectContext）
  - engine/upstream-lock.yaml（github-rest planned 行）；README.md §3；engine/CHANGELOG.md
  - engine/test/codelore-adapter.test.mjs（fixture 回放模式）；reports/44-check.mjs（守卫先例）

## 专属 delta（检查点）
- ① REST 直连主路＋X-GitHub-Api-Version=2022-11-28 pin；凭据三级探测 GITHUB_TOKEN env→gh auth token 借读→无认证降级；即用即清不建存储；raw 响应不出适配层
- ② 最小契约=PR 枚举（user.type==Bot + login [bot] 双检，缺一不判）＋PR 元数据＋diff 双通道（本地 git base...head 优先，API 仅 base/head 本地缺席兜底）；review/comment=planned 不入最小集
- ③ 限流=读 x-ratelimit-*/Retry-After；次级限流有界单次重试、primary 耗尽（remaining=0）即停标注 reset_epoch；余额写事实库运行日志
- ④ golden cassette×5（认证/无认证降级/限流耗尽/schema 漂移/平台 Bot）；测试作用于 dist/ 入 smoke 链；票毕锁表 github-rest→active
- 禁跑 35-probe.mjs；文件写入 Node.js＋回读断言；禁 BOM；cassette 录制 token 即用即清永不入带

## 专属验收
- reports/47-check.mjs PASS（exit 0 + PASS N/N）
- npm test 全链绿（含 github-rest.test.mjs 51 断言）＋npm run package＋dist/cli.js selftest
- 其余完成判据遵循 handoff 内的完成定义

## 开工第一句
先复述：本票阻塞状态 + 必读清单逐条路径，确认后再动手。

## 收尾

**❗ 收尾硬要求——以下动作缺任一项 = 本票未闭环（W2/W3 V2 重演防线）**：① 报告落盘 reports/47-report.md；② ledger 本票行状态回写 done/deferred；③ WORKFLOW §4 追加 lessons 行；④ commit message 引用守卫结果。

报告写入 reports/47-report.md（完成定义逐项 / 阻塞 / lessons 候选 / 引用文件）；ledger 回写与 lessons 追加按 handoff 完成定义执行；版本控制遵循 WORKFLOW §4.2（独立分支，绝不 push）。
