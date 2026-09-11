# 15 — atomcode 深度调研 prompt（A-015 Scale 切片差异边界）

## 背景（基线决策 D-001 ~ D-007）
- D-001 5 scale 全覆盖（Macro-A 跨仓战略 / Macro-B 仓库级 4 象限 / Macro-C 演化考古 / Micro-A PR diff / Micro-B 文件级），拒绝 MVP 切片。
- D-005 集成架构 Hub-of-Facts with Federated Adjudication：共享 DuckDB fact table + 联邦裁决；report 走独立 read model 投影。
- D-006 报告模板 = 共享骨架（执行摘要 → 四象限与裁决 → 证据 → 行动建议）+ scale-specific 切片；骨架在集成层共享，切片在各 scale 独立投影，禁止跨 scale 引用。
- A-014 已闭环：4 章顺序锁定、45 骨架字段、20 格（5 scale x 4 象限）64 个交集字段、applicability 枚举（native / projected / not_applicable）承载 20 格不等价。

## 本次调研问题（spec.md §Decision 6.2）
1. 每 scale 切片的差异字段如何设计？固定为 5 类：触发器（何时启动）、输入（数据源与信号集）、输出粒度（叙事 vs 行级）、引文密度（每条结论所需证据条数与定位精度）、verdict-gate 印记位置（裁决印记落在哪一章/哪一字段）。
2. Macro-A（跨仓叙事）与 Micro-A（PR 行级评审）是 5 档中的两个极端，其表达边界具体在哪？极端差异应由哪些可机检字段刻画（如输出粒度跨度、引文定位精度、裁决进入方式、降级形态）？
3. 切片字段与共享骨架字段的命名空间冲突如何防止？工业界对「共享契约字段 vs 扩展字段」的命名空间隔离有哪些成熟做法（前缀 / 命名空间 / additionalProperties 策略 / 扩展点白名单）？

## 要求
- 对标工业界成熟心智模型 / 工具 / 论文 >= 2 个，必须给一手来源链接。候选：IEEE 829-2008 Master/Level Test Report 层级、SARIF 2.1.0（OASIS）结果分级与 location 精度模型、OpenSSF Scorecard JSON v2、OpenTelemetry Baggage / 语义约定属性命名空间、Google Design Doc、Trail of Bits / OpenZeppelin 审计报告结构、GitHub PR review 与 CodeQL SARIF 分级、NIST SSDF、arc42。
- 明确区分「有直接先例」与「仅为类比」，对没有直接先例的项必须显式说明。
- 输出一份中文调研报告：背景回顾、对标表（对象 / 固定什么 / 自由什么 / 对本票印证）、三条问题的推荐方案（含字段名建议）、一手来源列表。
- 不要输出代码，只要结论与依据。
