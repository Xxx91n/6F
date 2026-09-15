# Handoff: 28 — ADR 治理卫生票

- **A-xxx covered:** A-033
- **Decision:** spec.md §R4-D3
- **对应 issue:** issues/28-adr-hygiene-sweep.md
- **对应 prompt:** prompts/28-adr-hygiene-sweep.md

## 上下文摘要（3-5 句）
6F 自身 ADR 的「真实缺失」（非 detector 漏认部分）需清零。准入范围唯一来源 = #26 人工读数的真实缺失分解；补记必须注明「量测审计驱动的勘误补记」性质。与 #27 互为引用、互不为完成条件：本票验收不看 detector 读数，#27 验收不看本票补齐结果——两条线独立可判（D-025 预注册措辞）。

## 完成定义（本票 done 判据）
- #26 真实缺失清单逐项清零（docs/adr/ 内补字段/补节，注明勘误性质）；ledger A-033 回写 done；WORKFLOW §4 追加 1 行 lessons；commit msg 引用 A-033；守卫 reports/28-*.mjs PASS（exit 0，对照 #26 清单逐项核对）

## 通用调研要求（每票适用，写一次）
- **atomcode 深度调研**（per WORKFLOW §4.2.3）：回顾 baseline（macro-audit 账本 current 决策，重点 D-023 ~ D-025）、spec.md §R4、仓库现状；输出调研报告含推荐方案；与任何 current 决策冲突时显式点名，不得静默改向
- **回顾 docs/adr/**：本票相关 ADR（见下方关键参考），理解约束与心智
- **回顾 CONTEXT.md**：50 术语中与本票相关项（Domain 语言不得绕开）
- **对标工业界成熟方案**：调研报告中列举 ≥2 个成熟心智模型/工具/论文作类比

## 阻塞
- #26（真实缺失分解 = 准入范围）

## 关键参考
- reports/26-*（真值表 + 真实缺失分解）；docs/adr/0001~0016（补齐对象含冻结后新增两份）；docs/adr/0015 §Consequences
- 注意：本票可能触及 docs/adr/ 文件写入——属治理补记豁免（D-025 授权），但每处改动注明勘误性质
