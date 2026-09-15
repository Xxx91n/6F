# R5-Q4 atomcode 深度调研报告 — TC-2 RED 处置路径裁定（FDA OOS 框架）

> 调研问题：预注册真判据 TC-2（S2b 五件套完整度）判 RED 后，(a) 只修 ADR 头 / (b) 只追加判据 v2 / (c) 顺序双轨 三案裁定 + 三个子问题（量测审计时机 / 两线是否互为条件 / 有无第四形态）。
> 冲突协议：调研结论与账本全部 current 决策零冲突、零 revised（详见 §5）；呈报新记录 D-025 待拍板。

## §0 执行通道留痕

- 第一轮（01:2x）：5h 配额窗口耗尽中断，仅 KB 召回段完成；**未杀进程、未换问题重开**，按 resume anchoring 等待重置。
- 第二轮（~02:17 后）：`atomcode --resume dd6c7fec-efce-4c24-8867-eec2ad179053 -p "原问题逐字续跑"` 一次成功（16.5KB / 9 sections / 自动索引）。**resume 锚点：dd6c7fec-efce-4c24-8867-eec2ad179053**（两次运行同锚）。
- 配额自查：searches 13（ctx_search×1 + Exa×6 + Tavily×3 + AnySearch×2，五角度全覆盖）/ full reads 6（CASRAI OOS、EDQM RCA、shapypro ISO 13528、TheAuditor、Aker Build、Codacy Verity）+ 3 摘要级（FDA 生物分析、Lakens、ISO 17043）；gaps：Lakens 全文 403（摘要引文替代）、CLSI 文件号未取原文、YAML 采纳率沿用本仓 A-002 存量票证。

## §1 执行摘要

**推荐 = (c) 顺序双轨为主体 + 第四形态 (d)「勘误式双读数留档」作为发布与留档规范。**
权威框架 = **FDA 药品 OOS（Out-of-Specification）两阶段调查规程**（1993 Barr Labs 判例奠基、2006 FDA 指南成文）：OOS 结果必须先做 Phase 1 实验室调查（找可归属量测原因）才能重测；**找不到可归属原因则默认结果有效**、进 Phase 2 全规模调查；disposition 由质量单元（非检测者）基于完整调查记录做。置信高——OOS 与本案逐环节同构 + 三个独立 dogfooding 先例交叉一致。

## §2 分点结论

**C1. OOS 两阶段映射**：RED = OOS 触发 → 14 份 ADR 人工对照 = Phase 1（找 detector 漏认内联格式的 assignable cause 覆盖面）→ v2 重跑 = 合规重测（其 SOP = 另一张票 A-002 交付的回退链，**出处先于 RED**）→ ADR 治理 = Phase 2 CAPA → disposition 最后做。

**C2. 改判据 vs 改被测对象的伦理判据是对称的**：「规则是否先于结果存在且有独立出处」。回退链先于 RED 交付 ⇒ v2 接线 = **修 bug**；若 RED 之后才发明回退链替换指标 = HARKing。对偶地：(a) 在未确认量测效度前把 14 份 ADR 补齐到 detector 认的格式 = **teaching to the test**（被测对象迁就坏量测器），与「改 detector 迁就被测对象」在同一标准下等价地不合规。补强：adr-tools 社区主流模板（joelparkerhenderson 核）只有 Status/Context/Decision/Consequences 四构件**无 Date**——TC-2 把 Date 列为必需构件本身与工业主流有出入，回退链（git 首提交日期）正是弥合 ⇒ 进一步支持「v2 = 修 bug」定性。（Lakens 2024：偏离预注册本身不是可疑实践，关键在透明披露 + 规则发明时点。）

**C3. 「信任并行动」裁定跳过了 Phase 1 → 按 CAPA 惯例 reopen 补调查，而非据此立即行动**。不是推翻人裁定（RED 可能仍部分成立：TC-1 已实证 11/13 无 Date 头，真实缺失几乎必然存在），是**补做量测分解后再 disposition**。「事后写判据」本身在 CAPA 惯例里就是审计发现项。

**C4. 量测审计（14 份人工真值表）时机 = 更早，v2 实现之前（「阶段 1.5」），不在阶段 2 冻结校准环节内**。四独立理由：① OOS initial assessment 明文 "before any retesting"；② 真值表 = v2 的验收 golden set + 原 RED invalidate 的 assignable-cause 证据（没有它，v2 无法区分「误差消除」与「反向偏差」——Aker Build 教训：把读数打到零的修复恰恰说明修坏了）；③ 成本 14 份文档，不值得阻塞；④ AIAG MSA 惯例：测量系统分析先于用测量数据做任何过程决策。阶段 2 里放的应是「v2 对冻结数据重跑 + 与真值表对账」（校准验证），不是首次真值标注。

**C5. 两线必须显式声明不互为条件（预注册语句而非口头约定）**：v2 验收 = 与人工真值表一致率；治理票验收 = 真实缺失清零；两票互为引用、互不为完成条件。OOS 表述：重测次数与判定规则须事先写死，禁 "testing into compliance"。

**C6. 第四形态 = 勘误式双读数留档（dual reporting），三案皆未覆盖「原 RED 判定的最终地位」**。先例：FDA 生物分析 partial/cross validation（方法修订后原数据不废除、双法读数关系须显式说明）+ Aker Build「dated measurement 不改写、修复后追加新读数两段并列」+ TheAuditor「204 findings → ~185 FP + 6 真实，FP 逐类回流为规则改进、重扫清零而源码一行未改（The bugs were in our rules）」+ Codacy Verity「错误固化回 dated rule，检测程序修正与被审计对象修正各自独立沉淀」。规则：**原 RED 不撤回不覆盖；v2 修正读数以勘误/并列形态发布 + 逐份 delta 表把量测误差量化为可审计产物；RED→绿唯一合法通道 = 成对动作「原读数记为 invalid（附逐份可归属原因）+ 修正读数成为 reportable value」**。

## §3 处置路径对比矩阵（判定）

| 路径 | 判定 | 核心缺陷/优点 |
|---|---|---|
| (a) 只修 ADR 头 | ❌ | teaching to the test；84.62% 未经分解、治理方向可能被坏 detector 扭曲；修后「绿」不可信 |
| (b) 只追加 v2 | ❌ | 无 ground truth 的重测 = retest without documented rationale；修正幅度无法验收 |
| (c) 顺序双轨 | ✅ 主体 | 先 Phase 1 分流、两线独立；gaming 风险低 |
| (d) 勘误式双读数 | ✅ 叠加为留档规范 | 补齐 (c) 缺的「原 RED 地位」维度；二者合成完整处置 |

## §4 对三个裁定问题的最终回答

1. **量测审计 = 阶段 1.5（v2 之前）**，非阶段 2 内——否则变成「detector 先定调、人工后背书」的确认偏误链。
2. **要显式声明不互为条件**，写成预注册语句；并预注册 delta 表：被确认为漏认的部分记 invalid（逐份原因），真实缺失部分**不得因任何 detector 改动而消失**。
3. **存在第四形态 (d)**（见 C6）：(c) 的调查内容 + (d) 的发布规范 = 完整处置。

## §5 与账本冲突核对

**零冲突、零 revised**：
- D-017（current）：C 裁定由人做——本裁定不改裁定权威与三档语义，只是对该次裁定的 disposition 补前置（reopen 补调查，正是 D-017「裁定依据在看报告前写死入库」防 HARKing 精神的时间轴补全）。
- D-018（current）：「阈值跑前写死跑后禁调」——v2 是 detector 构件解析修正（回退链出处先于 RED），非阈值调向；A-023 已内建「改数须 v2 追加、v1 留档」机制，同构适用。
- D-023/D-024（current）：阶段 2 = 2a/2b 结构不变；阶段 1.5 量测审计是其**前置插入项**，方向一致（D-024 的「先量测审计再分流」正是其两字段登记纪律的实例化）。
- A-026（implemented）：首报不撤回不覆盖、原读数留档——(d) 形态与 Receipt/content_digest 锚定纪律天然同构。
- 首报 C 裁定「supported」登记节：处置动作重排为 reopen，不改写已落盘的裁定原文与时间戳（不可变纪律）。

## §6 派生待决（待用户拍板）

D-025 草案：TC-2 RED 处置 = (c)+(d) 合成；阶段 1.5 = 14 份 ADR 人工真值表（量测审计）；两线预注册互不条件语句；delta 表预注册；C 层 disposition reopen 补 Phase 1。落拍板后写入账本并同步 architecture-recovery 账本的 C 裁定节注记。
