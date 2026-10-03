# R56-Q2 调研题面 —— 已上架四层收口深化面的子枝序裁定

（提交 atomcode-research 深调研；账本=唯一事实源立场，调研须回顾 decision-ledger 全部 current 记录、docs/adr、CONTEXT.md 词条、工业界成熟落地心智模型为重点。）

## 背景（前提已勘误——以本段为准）

产品=宏观+微观工程内容审计（5 scale），分发=Agent Plugin（ADR-0008），发布=Preview 分级漏斗（ADR-0017「preview 标注诚实是决策本体非装饰」）。

能力矩阵实测（README 现行版＋账本校核，已勘误修正）：
- Macro-B capability 1/5 preview——`macro-audit audit` 一等命令产品化实跑；象限面 strategy active·behavior preview·structure/supply-chain queued
- Macro-C capability 2/5 preview——**但产物路径是 .scratch 内一次性管线脚本**（reports/38-macro-c-preview.mjs，anysearch-cli 单仓校准），不在插件分发物
- Micro-A capability 3/5 preview——同上，reports/48-micro-a-*.mjs 脚本产物（env-manager 4-PR 校准），不在插件分发物
- Micro-B capability 4/5 preview——file-card 一等命令面（#80 缝合，runAuditFile）
- Macro-A Not yet in preview——层序末位（D-062 DoR-b=≥2 真实仓 facts 用户主权侧未解锁）

**语义缝实证**：preview 名义=「工件已演示校准」vs「命令面可达」两读并存——Macro-C/Micro-A 的 preview 工件用户装插件后无法自产（engine/dist 只含 Macro-B audit＋Micro-B file-card）；engine audit.ts:304 not_in_preview 列表仍含 Micro-A/Macro-C=与 README 矩阵漂移（已登记 finding 归执行窗）。

已裁约束（current）：D-034② 层序＋③Scorecard 按层需求队列接入不插队／D-054 structure 象限暂缓理由=S3 族双口径风险（两套复杂度口径同框自相矛盾）／D-062 Macro-A DoR／D-121 铺开序归位＋投影主干／D-175 等待期合法工作面序（K8s Code Freeze 后 burndown 先例）／ADR-0013 三层验收闸／ADR-0015 量测效度先行。

本仓路径：decision-ledger=D:\Aworker\6F\.scratch\macro-audit\decision-ledger.md；ADR=D:\Aworker\6F\docs\adr\；CONTEXT=D:\Aworker\6F\CONTEXT.md；计划表=D:\Aworker\6F\.scratch\macro-audit\spec-phase-tasks.md。

## 候选子枝（(b) 收口深化面下，纯执行项已剔出）

- **B3 preview 产线化归位**：「in preview」法理边界=工件存在 vs 命令面可达；Macro-C/Micro-A preview 名实缝裁定
- **B1 structure 象限解排**：D-054「S3 双口径」消解——S3=预算归因面 vs structure=形态测量面，口径分工成文/合并/续排
- **B2 supply-chain 象限解排**：Scorecard 接入时点与源选择（queued→?）
- **B4 三行前提解封重估**：#9 读模型陈旧 SLA／#10 correlation key（trace_id/baggage_id＋OTel Baggage）／#13 工具对齐评估——语言栈前提已被 TS+DuckDB 事实解封
- **B6 preview→GA 判据面**：各层毕业判据（与 ADR-0018 1.0 退出条件关系）

排序候选：(i) B3→B1→B2→B4→B6（法理线地基先钉）；(ii) B1→B2→B3→B4→B6（报告语义最深结先啃）；(iii) B4 先行（账面 lane 先清）；(iv) 其他。

## 调研要求

1. 先回顾账本 current 记录与 ADR/CONTEXT/计划表（本地路径已给）——特别注意 D-054/D-034③/D-062/D-121/D-175/ADR-0017 的约束射程；
2. **工业界心智模型为重点**：产品「宣称能力 vs 可交付面」名实纪律的成熟先例（docs↔code drift 治理、feature-flag/preview 声明与可及性语义——GitHub preview/beta 条款、Stripe API 版本化、K8s feature gates alpha/beta 的可用性语义）；多口径同报告治理（指标口径冲突消解先例——SLO/SLI 双口径、代码复杂度度量多标准共存做法）；「演示工件 vs 产品能力」分级（demo/POC/preview/GA 的交付语义分级惯例）；
3. 辩证要求：逐排序候选给支持与反对论据；任何与账本 current 冲突显式点名 D-xxx；
4. 输出：推荐排序＋理由＋置信度＋信息缺口清单。
