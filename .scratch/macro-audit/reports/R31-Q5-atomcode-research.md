# R31-Q5 调研报告：golden 锁面——「字段骨架非内容值」边界定义

> atomcode 深调研存档（R31 轮，题面=R31-Q5-research-prompt.md）。9 源含 Jest propertyMatchers/insta redactions/LLVM FileCheck/google-golden 官方×4＋批评文献×2＋仓内一手核验。置信高。

## 1) 执行摘要

**裁决建议：(a) 分层锁面立法＋措辞澄清。** 成熟生态通行心智模型恰是「锁形态＋语义定点值、放行数据载荷」——Jest propertyMatchers/insta redactions/LLVM FileCheck 三家全部「结构＋定点 token」混合锁面；纯键集锁（选项 b）在任何主流工具中无对应物。实现现状与 D-127⑥ 立法意图（「golden 不随数据漂移乱红」）不冲突——冲突只在措辞：票面把「语义定点值」笼统称为「骨架」。勘误问题非改向问题。

## 2) 分点结论

**① 锁面光谱中本仓现状落在「结构锁＋语义定点」正中。** Jest propertyMatchers=键结构锁死+类型形态锁死+具体值放行（Any 占位）；insta redactions=选择器级定点遮蔽+dynamic_redaction 回调遮蔽前断言值格式（官方支持「定点形态断言+其余放行」）；LLVM FileCheck=CHECK 行锁结构+定点 token 不锁全字节（编译器测试几十年规模验证）。本仓 golden 逐项对应：metric 计数=insta 静态定点值；value_keys=propertyMatchers 键结构；skips.raw_path=FileCheck 定点 token。无一项发明。〔官方×3 full read〕

**② 「确定性输入的确定性输出才进 golden」三谓词判据与工业一致。** insta 设计动机原文：「make snapshots stable when otherwise random or otherwise changing values are involved」——不稳值遮蔽、稳值锁死；google/golden README：golden 适用前提=数据可比对且 diff 可人读（-update_golden 显式旗标纪律）。

**③ 过度锁定病灶=锁无关漂移值非锁语义定点值。** dermothughes 批评文：snapshot 烂在锁 churn 值（时间戳/UUID/随机序）；Kent C. Dodds/Searls：snapshot 须显式表达什么重要——支持定点语义断言入 golden；HN 社区信号：窄而准锁面+持续人审。

**④ 「不同层不同锁面」有先例非单一锁面原则。** insta 同生态：单元级锁全值、集成级 redaction 遮蔽——锁面宽度随层变化是内建能力。本仓已有三档：narrative seal-golden 锁全文值（零自由度密封）、codelore 47 件锁全值（确定性函数输出）、micro-b emission 锁骨架+定点（载荷漂移放行）。**D-049⑤ 既有立法「golden 只锁字段骨架不锁内容值（内容级 golden 归 GA 收口）」——「内容级 golden」本就是预留的另一层锁面，分层锁面在仓内立法史上已是默认世界观。**

**⑤ 冲突核查：措辞冲突非方向冲突。** D-127⑥「骨架」未定义边界→票面勘误+实现追认+scoped 注记；D-061 相容（定点值均在 generator 确定性再生成射程内）；D-128 同向（golden 锁的全是归一后输出，git_version 只在 value_keys 键集、值放行——R31-Q1 实证逐字节锁方言值必 FAIL，本 golden 恰好没锁方言值本身=设计自洽）；D-131 判据可复用（plain-meaning 字面射程裁决路径）；**D-049⑤ 同源措辞模糊——若采 (a) 须同步加注记否则下轮复核在 D-049 处重演同一争议**。

## 3) 候选矩阵

| 选项 | 工业先例 | 回归捕获力 | 漂移代价 | 仓内立法相容 | 备注 |
|---|---|---|---|---|---|
| (a) 分层锁面+措辞澄清 | Jest/insta/FileCheck 三家正对应 | 强（少发/错形/越权 skip 均捕获） | 低（锁面全为确定值） | 完全相容，D-127⑥+D-049⑤ 同步注记 | 实现零改动纯文书 |
| (b) 反向收窄纯键集 | 无对应物 | 弱→形同虚设 | 低但无意义 | 违 sibling 惯例 | 弃 |
| (c) 勘误不立法 | — | 同(a) | 同(a) | 边界不受控争议重演 | 弃 |

## 4) 来源清单

1. Jest Snapshot Testing（propertyMatchers+人审纪律）[Official]；2. insta Redactions（选择器遮蔽+回调断言格式+稳值才锁）[Official]；3. LLVM FileCheck（CHECK=锁结构+定点 token）[Official]；4. google/golden README（diff 可人读+-update 旗标）[Official/archived]；5. dermothughes Why Snapshot Testing Sucks（churn 病灶=锁漂移值）[Criticism]；6. Kent C. Dodds Effective Snapshot Testing（显式表达什么重要）[Criticism]；7. FileCheck.rst Android 镜像[交叉]；8. HN 讨论（窄而准锁面）[Community]；9. 仓内 golden/manifest/D-127/D-128/D-131/D-049 一手核验。

## 5) 信息缺口

- FileCheck 44KB 只读头部，CHECK-NEXT 细节靠镜像交叉；ApprovalTests scrubbers 未深读（Jest/insta 已双源覆盖等价物）；Tavily 耗尽以 anysearch 交叉补足。

## 6) 一句话落地建议

采 (a)：D-127⑥ 加 scoped 注记精修「骨架」=字段键集+语义不变量定点值（规范化形/计数/reason/冲突对/对账数/常量），内容值=数据行载荷仍禁锁；D-049⑤ 同步加注记防同源争议重演；实现现状零改动。