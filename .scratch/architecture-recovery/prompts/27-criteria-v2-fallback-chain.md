# Prompt: 27 — 判据 v2 追加（adr-structure 回退链接线）

- A-xxx: A-032
- Decision: spec.md §R4-D2
- Blocked by: #26
- 身份: 遵循 WORKFLOW.md §2 的开发 Agent，本票唯一目标 = 完成本票闭环
- 必读清单（动手前逐条确认可解析）:
  - issues/27-criteria-v2-fallback-chain.md
  - handoffs/27-criteria-v2-fallback-chain.md
  - spec.md §R4-D2
  - WORKFLOW.md §4.2
  - decision-ledger.md（A-032 行）
  - docs/adr/0013-*.md
  - docs/adr/0015-*.md
  - engine/src/collect/collectors.ts
  - reports/02-adr-fallback.mjs
  - reports/26-*.md（真值表 golden set）

## 专属 delta（检查点）
- v1 代码与 v1 阈值 0.60 留档禁改；v2 与 v1 并存可复跑
- 重测次数与判定规则预注册文档必须先于重跑 commit 入库
- 冻结数据重跑 = 并列读数 + 逐份 delta；原 RED 不撤回不覆盖
- 验收唯一口径 = v2 读数 vs #26 真值表一致率
- 构建/测试走 CI，本机仅守卫脚本（轻量 node 断言）

## 专属验收
- v2 detector 接线 + 预注册入库先于重跑 + 并列读数与 delta 表落盘 + 守卫 PASS
- 其余完成判据遵循 handoff 内的完成定义

## 开工第一句
先复述：本票阻塞状态 + 必读清单逐条路径，确认后再动手。

## 收尾

**❗ 收尾硬要求——以下动作缺任一项 = 本票未闭环（W2/W3 V2 重演防线）**：① 报告落盘 `reports/27-report.md`；② ledger 本票行状态回写 done/deferred；③ WORKFLOW §4 追加 lessons 行；④ commit message 引用守卫结果。

报告写入 reports/27-report.md（完成定义逐项 / 阻塞 / lessons 候选 / 引用文件）；ledger 回写与 lessons 追加按 handoff 完成定义执行；版本控制遵循 WORKFLOW §4.2。
