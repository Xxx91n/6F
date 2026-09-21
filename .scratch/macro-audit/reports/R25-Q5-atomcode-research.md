# R25-Q5 atomcode 调研报告（存档）

> 2026-09-22 轮25 grill Q5。置信度：高（differential/N-version/反模式族多源）；行业无「生成器-校验器同码守卫」专条——判据由相近模式外推（已如实标缺口）。来源：Wikipedia Differential testing／Knight-Leveson 1986 论文／CUHK 容错教材 ch.9／arc42 N-version／Coulman tautological tests／Tsiokos circular validation／Vary docs reference oracle／codepipes 反模式／context-engine golden-tests——全文经 ctx 索引 source=atomcode 可回捞。

## 核心结论

1. **判据=错误域是否重叠**：differential testing 前提是两侧独立（Vary reference oracle「deliberately simple」）；arc42 适用判据=「wrong output 不可接受+N-fold 成本可担」——E1 被保护物=断言盘点完整性，失效恰是静默语义漂移、无 failover 可言、成本仅 75 行×2——全落「该独立」侧；
2. **独立性是程度量非布尔量（Knight-Leveson 锋利推论）**：27 个独立版本仍超频共模失败——主因=**共同规格的歧义与遗漏**。两份逐字机芯共享同一隐式规格=同错风险未消；style vs sealedCall 分叉正是「规格只活在代码里」症状。**真补救=规格显式化（钉契约不钉实现）**——与字面钉纪律同构；
3. **共享机芯=同义反复**（tautological test／circular validation 文献实证）；
4. **「维持现状」不成立**：现状缺的不是第三种代码而是互等裁决断言——diversity erosion：冗余无分歧显式化机制会悄悄塌成共享。

## 建制建议（C 方案）

① 不共享机芯（differential oracle 独立性=E1 命根）；② **63 清单头加 census-contract 块**——显式声明「断言点」判定要素（字段 schema 统一 style/sealedCall＋五枚解析豁免规则各给正反例钉，钉性质不钉正则体）；③ 70-check 增互等裁决断言——重算结果与契约比对（生成器按旧契约 emit→E2 红）；④ 契约变更走 PR 审查（golden 惯例）；⑤ 契约块声明为 **#70 与 vacuity 普查共用规格**（防第三份机芯蔓延；vacuity likely=人工裁分支留契约外）；⑥ 契约块枚举须 open/closed 声明，未声明变更=红。

## 冲突面

XFAIL 册无冲突但契约不钉 XFAIL 状态（两守卫面不耦合）；vacuity 共用解析规格不持私有解析；字面钉纪律正向应用（钉正反例对非正则体）；open/closed 落点=契约块枚举声明。
