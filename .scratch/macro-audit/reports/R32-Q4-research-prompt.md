# R32-Q4 调研题面（atomcode）

仓库 D:\Aworker\6F 是 spec-level 工程内容审计产品（五尺度审计，Hub-of-Facts append-only 事实表 + DuckDB 存储 + Micro-B 文件级审计卡三层契约）。

## 问题

Micro-B 文件级审计的 rename 血缘立法（D-125）：② rename 血缘一等事实——采集时确定性 rename 检测产出 file_renamed{from,to,head_sha,threshold,detector_version}，且立法原文含「卡投影沿血缘链缝合跨改名历史」；③ 缝合职责=投影层——事实层身份恒为规范化 path，跨 rename 连续性由读模型沿血缘链达成。

现状：R32 已落地实现只做 miss 方向——查询旧名文件时返回 renamed_to miss 态（lineage_edge＋逐请求重验证的条件跳转）；而「缝合」方向——查询新名文件时把旧名 era 的事实并入卡面——无实现、且 #80 步②票面枚举与步③票面均未显式认领。R32 审计定为 F10 孤儿需求（立法在案、无步骤认领、实现缺席）。

牵连：刚落账的 D-136 裁定 new_file/insufficient_history 失败态做投影层历史族抑制——若缝合缺席，改名后新名卡的旧名事实不被计入，历史表观过浅→可能误进 insufficient_history（失败态判定的正确性依赖缝合）。

候选处置：
(a) 归口 #80 步③票面显式扩枚举——步③已含 renamed_to 1-switch 成对边界件，缝合实现与其验证同票（测试随行为）；票面加「缝合=投影层沿 file_renamed 链把旧名事实并入新名卡（多跳链/环检测/观测集内解析）」；
(b) 独立票 #84——投影缝合专项（链式多跳/环/跨观测集解析单列），排序在步③边界件前；守护票据单性质与 bisect 粒度；
(c) preview 范围外登记——renamed_to 跳转保留、缝合 defer 为 not_in_preview 披露项。

## 调研要求

1. 回顾 D:\Aworker\6F\.scratch\macro-audit\decision-ledger.md 全部 current 记录（重点 D-125 血缘立法、D-126 miss 四类、D-123 三层卡契约、D-136 失败态投影抑制、D-133 票据粒度先例、D-135 #83 修批、D-115 错误分流、D-122 披露四件）、docs/adr/ 全部 ADR（重点 0023-micro-b 与 0022-quarantine）、CONTEXT.md 全部词条（重点 File Lineage/Observation Set/Read Model/Kernel-Agent 边界）；
2. 工业界成熟落地的心智模型（重点）：代码质量/审计工具对 rename 历史的处置惯例——SonarQube/CodeScene/git log --follow 的跨改名连续性语义与已知坑（rename 检测阈值、链式改名、A 改 B 改 C 多跳、rename+modify 混合）、read-model 投影层缝合的工程实现模式（identity resolution 放查询时 vs 摄入时）、票据/工作项粒度惯例（垂直切片 vs 水平切片、实现+验证同票 vs 分票的成熟判据、bisect 粒度守护）；
3. 给出推荐与理由，显式指出与账本任一 current 决策的冲突点（若有——冲突则该 D-xxx 需标 revised 并呈报新决策，禁止静默改向）。
