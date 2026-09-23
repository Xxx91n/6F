# R30-Q3 深调研题面：文件级审计卡片的内容契约——指标集/判语边界/叙事归属/advisory 机制化

## 本仓背景

产品=宏观+微观工程内容审计（git 记录健全的项目），Micro-B=文件级审计，输出=文件质量卡（advisory 不进裁决路径）。已定（勿推翻）：采集模型=预采集+read-model 投影（仓级确定性采集锚 HEAD 入 DuckDB SSOT，文件卡=对 subject_ref=<file> 的投影）；触发面=MCP tool+CLI 子命令双通道；确定性 charter=字节级可重放、幂等、observed_at=HEAD 时点；kernel=确定性层，叙事=宿主 agent 经 skills 方法论层生成+kernel citation 盖章（grounded/uncited 双轨制已立法——叙事段仅 citation 盖章面、禁携带裁决 band）；权重/强弱语义不进接线路由面（归判据面与人裁）。

可用 per-file 数据面（已契约接线）：codelore hotspots（逐 path 行：revisions/cognitive/cognitive_health/hotspot_score/mi/mi_rank/ai_pct）、entity-churn、entity-ownership、coupling 文件对、code-age——当前以 facet_rows 聚合载荷形态入库（subject_ref=面名）。

## 未裁分叉（本问）

文件质量卡内容契约：① 卡上指标集选型（哪些已契约实体面上卡）与形态（原始值 vs 派生展示值）；② 「判语」边界——kernel 能否产确定性派生展示值（rank/percentile/top-N 标签）而不算偷渡裁决；③ 「局部叙事」归属——卡叙事=宿主 agent 生成+kernel 盖章 vs kernel 确定性文案；④ advisory 的机制化——卡如何结构性防止被读作裁决（显式字段/优先级元数据/分级）。

候选：
- **(a) 纯指标投影＋宿主叙事**：卡=实体面逐字段直投+citation 锚；解释判语全归宿主 skills 层+kernel checkAllCitations 盖章；kernel 零判语；
- **(b) 指标+kernel 派生判语**：允许 kernel 产确定性派生展示值（rank/percentile/top-N）——可读性自含但「派生展示值≠裁决」边界须票面写死；
- **(c) 指标+宿主叙事+kernel 优先级元数据**：(a) 骨架+卡带 priority/severity 级元数据（kernel 按确定性规则产如分位→档，仍 advisory 但引导读序——CodeScene「priority 元数据防误读非隐藏数据」惯例）；
- **(d) 可配置指标集**：用户/宿主选面进卡。

## 调研任务

取证工业界成熟心智模型：① 文件级/实体级代码质量卡片的成熟内容形态——CodeScene file view/CodeClimate/SonarQube file page/Codecov/Sourcery 类产品的 per-file 卡片放什么指标、什么粒度、有没有派生判语（grade/letter score 惯例——SonarQube maintainability rating A-E、CodeClimate GPA 的语义定位是裁决还是 advisory）；② 「advisory 指标被误读为裁决」的治理惯例——health score/hotspot score 类派生值在产品里如何标注性质（priority/rank/percentile 元数据 vs 判语 vs 隐藏）；③ AI agent 时代的「机器产事实+agent 产叙事」分工先例——deterministic 数据面+LLM 叙事面的证据引用/盖章/防幻觉惯例；④ 质量卡的失败形态惯例（无数据文件/新文件/二进制文件如何呈现）。输出=推荐+各候选评估+理由+冲突核查+来源清单+信息缺口+置信度。
