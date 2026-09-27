# R40-Q6 调研题面（atomcode -p 直贴）

## 调研问题

开源/插件产品在「已公开挂牌但能力未满」阶段的外部用户暴露梯度——被动挂牌→定向邀请试用→公开推广的三段姿态与转窗判据预声明——在成熟产品发布/社区运营心智模型中对应什么？

背景：Agent Plugin（Apache-2.0，marketplace 已公开上架——被动暴露已发生）声明 capability 4 of 5 preview（5 scale 中 4 层已 preview、Macro-A 顶层未上）；版本 0.1.0；ADR-0017 分级漏斗在案（各层独立 preview→GA、preview 标注诚实=决策本体、Semgrep 反例钉着）；首个外部宿主 pilot（charter 判据预声明＋读数以安装树为准）已全程跑过产出真发现（GAP-HOST-01 宿主 IDE 盲区在册 triaged）；刚裁定守卫面环境契约修复（外人 clone 当前会遇红件——修复在执行窗）。

关键语义纠正：「是否暴露」已非裁面（公开事实），裁面=姿态梯度（被动挂牌→定向邀请→公开推广）与转窗判据预声明。

候选（我倾向 (i)）：
(i) 梯度定型＋转窗判据预声明：Stage-0 被动挂牌=现状追认（marketplace 公开零外联）；Stage-1 定向邀请试用=charter 协议复用（判据预声明＋not-run 记 N/A＋读数以安装树为准）逐案跑 pilot，findings 走摄入分诊四态；Stage-2 公开推广=预声明转窗判据包达标后启——判据①capability 5/5 漏斗完成（Macro-A 层上架）②环境契约修复落地（fresh clone 不红海）③宿主盲区 disposition（IDE 面实证或 accepted-risk 关闭）④试点 findings 消化率（全部过摄入分诊无 pending）
(ii) 立即主动推广（不预声明直接外联）
(iii) 收敛冻结（下架/收窄公开面）

## 必回顾
- D:\Aworker\6F\.scratch\macro-audit\decision-ledger.md 全部 current 记录（重点：D-051 上架 A+C 双轨＋公开仓事实、D-150~152 宿主试用三判据＋charter 协议、D-142/D-146 摄入分诊四态、D-148 accepted-risk 三要素、D-159 env-contract〔刚裁〕、ADR-0017 对应账本记录、D-157 锐评射程、GAP-HOST-01 宿主盲区台账）
- D:\Aworker\6F\docs\adr 全部 24 件（重点 0016 渠道边界/0017 preview-release 模型/0012 价值闭环优先）
- D:\Aworker\6F\CONTEXT.md 全部词条（preview-release/试用三判据/宿主试用/安装树自对照/摄入健康）
- 工业界心智模型（重点）：staged rollout/feature-flag 曝光梯度（百分比放量）与本案姿态梯度异同；open-core/开源项目早期用户运营（design partner program、private beta→public beta 转窗判据先例——GitLab/Vercel/Linear 类早期社区先例）；插件生态 preview 标注惯例（Claude Code/VS Code marketplace 的 preview/early-access 标注实践）；「被动挂牌不等于推广」的先例与反例（public repo silent period）；pilot→GA 转窗判据预声明的成熟模板（readiness gates、launch checklist——Google SRE launch coordination、Kubernetes feature gate alpha/beta/GA 判据化先例为最强候选参照）

要求：每候选给工业界支持度与仓内账本冲突点；给出推荐与理由；explicit 列出与 current D-xxx 的任何冲突（修订协议要求呈报）。
