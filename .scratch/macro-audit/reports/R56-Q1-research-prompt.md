# R56-Q1 调研题面 —— 轮 56 grill 设计树根节点裁定（产品建设下一主枝）

（提交 atomcode-research 深调研；账本=唯一事实源立场，调研须回顾 decision-ledger 全部 current 记录、docs/adr、CONTEXT.md 词条、工业界成熟落地心智模型为重点。）

## 背景

产品=宏观+微观工程内容审计（5 scale：Macro-A 跨仓战略/Macro-B 单仓四象限/Macro-C 演化考古/Micro-A PR diff/Micro-B 文件卡），面向 git 记录健全项目，分发=Agent Plugin（五层盒，ADR-0008），验收=三层闸门（ADR-0013），发布=Preview 分级漏斗（ADR-0017）。

现状实测（以本仓实物为准）：
- Macro-B 已上架 preview（`macro-audit audit` 一等命令实跑真仓；strategy S1+S2＋behavior 象限接入，structure/supply-chain 象限排队+诚实降级披露）
- Micro-B file-card 已缝入 preview（#80；audit.ts:304 实测 `not_in_preview=['Micro-A','Macro-C','Macro-A']`）
- 层序已裁（D-034②/D-121 current）：Macro-C→Micro-A→Micro-B→Macro-A
- 试点角色绑定（D-033 current）：anysearch-cli→Macro-C 校准语料（56 ADR+supersede 链）／env-manager→Micro-A 唯一合格试点（唯一托管 PR 面）／jiahao→Micro-B·Macro-B 回归下限／三仓并跑→Macro-A 冒烟（≥2 仓天然最后）
- 票证：#38 Macro-C preview（前置 R5-04 CodeLore 扩面→R5-05/06）／#47 托管 API 适配器＋#48 Micro-A preview（票面七锐化已立案，D-049）／Macro-A 启动判据注册 mw-trigger-c（D-062）
- spec 计划表开放行：R4-02（P0，adr-structure detector v2 接线）／#9 读模型陈旧 SLA／#10 cross-scale correlation key／#13 工具对齐评估（后两者前提=「语言栈选定」，但 engine 已实为 TS+DuckDB——前提或已事实解封）
- Stage-2 判据①=capability 5/5（Macro-A preview 上架为终点）；Stage-1=逐案 charter 试用

本仓路径：decision-ledger=D:\Aworker\6F\.scratch\macro-audit\decision-ledger.md（209 唯一决策 ID/157 current）；ADR=D:\Aworker\6F\docs\adr\（24 件）；CONTEXT=D:\Aworker\6F\CONTEXT.md；计划表=D:\Aworker\6F\.scratch\macro-audit\spec-phase-tasks.md。

## 候选（本轮 grill 设计树根）

- (a) **Macro-C 能力层设计树**——层序第一位未建层；#38 票已立案但设计树本体未烤（演化考古 rubric 维面／对比语义／校准方法论／报告切片／preview 验收判据全开放）
- (b) **Micro-A 能力层设计树**——#48 票面已立案、env-manager 试点绑好；diff 审计判据/rubric/verdict-gate 接线未烤
- (c) **能力矩阵收口面**——structure/supply-chain 排队清算＋R4-02 P0 开放行＋语言栈前提事实解封后 #10/#13 重估
- (d) **Stage-1/Stage-2 推进面**——试点 charter 逐案形态／上架漏斗／静默窗启动
- (e) 其他（本仓 dogfooding／V-04 立法面等）

## 调研要求

1. 先回顾上述账本 current 记录与 ADR/CONTEXT 词条（本地路径已给），再查工业界先例；
2. **工业界心智模型为重点**：能力层铺开次序的成熟判据（walking skeleton→flesh-out 节奏、value-stream/风险递减排序、技术雷达 adopt-trial 门槛）；「演化考古/时间维度分析」工具生态成熟度与落地先决条件（CodeScene、git-of-theseus、hercules、CodeLore 历史面）对照「PR diff 级审计」工具生态（CodeRabbit/bugbot 类已明排形态除外的可借鉴面）；
3. 辩证要求：对每个候选给支持与反对论据；任何与账本 current 决策的冲突须显式点名 D-xxx；
4. 输出：推荐＋理由＋置信度＋信息缺口清单。
