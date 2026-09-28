# R43-Q1 调研题面 — 锐评终局裁定粒度

## 背景（裁决语境）
仓库 macro-audit（自研工程内容审计产品基建仓）经历四轮外部锐评；第四轮（R41 摄入，快照属实）三大硬伤指控：
- §2.1 温室巨舰：守卫硬编码 D:/Aworker 绝对路径→外人 clone 跑守卫爆出 9 件册外红
- §2.2 守卫递归官僚主义：60 守卫/1246 断言/守卫的守卫（75a 普查/70 盘点/known-red 册）——伺候守卫精力倒挂用户价值
- §2.3 发票提交：commit message 塞满决策代号如行政免责账本
- §3.3（破局建议）：别在 .scratch 里内卷，把插件发到公共 Registry 给真实用户压测

## 既有机制（账本 current 语义）
- D-165 分层定稿：裁定层闭环（每条指控有 disposition）≠验收层闭环（实证验证通过）——双读数强制分行呈报
- D-162 暴露梯度：Stage-0 被动列出/Stage-1 邀测带章程/Stage-2 公开推广须四判据+30 日静默窗
- D-142/D-146 摄入分诊四态＋快照钉 SHA；D-148 Accepted Risk 三要素；D-160 retired 建制；D-161 commit trailer 三键
- R41 裁定：§2.1→D-163 env-contract 泛化执行窗；§2.2→裁军显式驳回维持；§3.3→Stage-2 判据值守

## 当前实测态（R42-T1 执行批落盘后）
- fresh clone 独立复验翻绿：60 ran/58 green/0 册外红/组级 SKIP 带修复指引（审计侧独立证实非转述）——Stage-2 判据② pass
- Stage-2 余判据：① capability 5/5 未达、③ GAP-HOST-01 未闭、④ 30 日静默窗计时中——Stage-2 维持关闭
- §2.2/§2.3 属「裁定不采纳」型处置（机件仍扩张但受案例驱动纪律约束）

## 裁决问题（三候选）
锐评终局裁定粒度：
(i) 整批收口——锐评整体标验收层闭环（判据②绿=核心指控消）
(ii) 逐条双层收口——§2.1 双层闭环；§2.2/§2.3 裁定层闭环-不采纳型终态；§3.3 保验收层开放锚 Stage-2 哨兵
(iii) 推迟终局——Stage-2 三判据全齐再一次性收口

## 调研要求
- 回顾本仓 decision-ledger 全部 current 记录、docs/adr 24 件、CONTEXT.md 词条（审计方自行核读）
- 重点：工业界成熟心智模型——审计 finding/缺陷 关闭粒度（POA&M milestone 项级闭环、ISO 27001 不符合项项级纠正、SOC2 exception 管理、penetration test retest letter、FDA 483 逐条回应、code review 逐条 resolve 语义、安全公告 errata 生命周期）；「整体结案 vs 逐项结案」的治理先例；发现问题方与被审方的 closure 权责边界
- 辩证看待；若与 current 决策冲突：标记呈报禁静默改向
- 给出推荐与理由
