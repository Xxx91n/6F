# Prompt: 19 — push 与 CI 实跑激活

- A-xxx: A-019, A-020
- Decision: spec.md §R3-D1
- Blocked by: None（闸门：push 远端与时机须用户明示授权）
- 身份: 遵循 WORKFLOW.md §2 的开发 Agent，本票唯一目标 = 完成本票闭环
- 必读清单（动手前逐条确认可解析）:
  - issues/19-push-ci-activation.md
  - handoffs/19-push-ci-activation.md
  - spec.md §R3-D1
  - WORKFLOW.md §4.2
  - decision-ledger.md（A-019, A-020 行）
  - docs/adr/0012-*.md

## 专属 delta（检查点）
- 开工前把用户授权远端与时机的原话逐字抄进报告头；缺授权原话 = 立即停票并报告，不做任何推送
- 首跑后先记 run 链接再看绿红；红 = 只收集日志摘要报阻塞，不改 workflow 文件
- 矩阵明文只允许「最小可证集」一档；任何加平台冲动写进 lessons 候选而非实施

## 专属验收
- 报告中可指认：授权原话 / run 链接 / 矩阵表三要素齐备
- 其余完成判据遵循 handoff 内的完成定义

## 开工第一句
先复述：本票阻塞状态 + 必读清单逐条路径，确认后再动手。

## 收尾

**❗ 收尾硬要求——以下动作缺任一项 = 本票未闭环（W2/W3 V2 重演防线）**：① 报告落盘 `reports/19-report.md`；② ledger 本票行状态回写 done/deferred；③ WORKFLOW §4 追加 lessons 行；④ commit message 引用守卫结果。

报告写入 reports/19-report.md（完成定义逐项 / 阻塞 / lessons 候选 / 引用文件）；ledger 回写与 lessons 追加按 handoff 完成定义执行；版本控制遵循 WORKFLOW §4.2。