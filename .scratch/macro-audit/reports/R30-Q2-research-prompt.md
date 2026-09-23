# R30-Q2 深调研题面：文件级审计卡片的触发面×采集模型联动形态——「单文件查看触发」在 CLI+MCP 架构里的工业落地

## 本仓背景

产品=宏观+微观工程内容审计（git 记录健全的项目），五尺度之四 Micro-B=文件级审计（File-Level Audit）。架构=确定性 CLI kernel（Node/TS）＋DuckDB fact SSOT（append-only，fact 行 subject_ref 任意粒度）＋MCP 只读查询面＋skills 方法论壳＋报告模板层＋Agent Plugin 分发（Claude plugin 形态，宿主=AI agent IDE）。

已立法（勿推翻，供冲突核查）：
- Micro-B 词条（CONTEXT.md）：单文件粒度；触发器=「单文件查看或 LSP 调用」；数据源=CodeLore file facts＋局部叙事；输出=文件质量卡 advisory **不进裁决路径**；Avoid=lint 报告/code review（人类流程非工具审计）；
- 字节级确定性+幂等 charter：observed_at=观测时点（来源=HEAD commit 时间），禁摄入墙钟冒充观测时点（D-105/D-108 已裁）；同仓态重跑=no-op（自然键幂等）；
- Hub-of-Facts：事实归仓级采集 SSOT，报告/卡片=read-model 投影，派生态不回写 SSOT；
- 实体级 codelore 面（entity-churn/function-hotspots 等）已在契约批次接线；audit_fact.subject_ref VARCHAR(512) 支持任意粒度；
- 宿主 hooks=layer④ 可选呈现面已收窄（D-058）；quarantine 引擎已建制（两级处置/恒等式/strict 门禁）。

## 未裁分叉（本问）

「单文件查看或 LSP 调用」触发在真实五层盒（CLI kernel/MCP/skills/可选 hooks/资产，**无 LSP 层**）落成什么形态×文件卡数据是按需算还是预采集投影：
- **(a) 预采集＋投影式**：仓级采集照旧（实体级面进 facts），文件卡=对 subject_ref=<file> 的确定性 read-model 投影；触发面=MCP tool＋CLI 子命令双通道；「LSP 调用」收窄释义=宿主侧文件查看上下文触发的 MCP 调用；
- **(b) 按需采集式**：macro-audit file <path> 单文件即时管线（git log --follow+实体面现场算）——忠实「查看即算」但延迟/成本真实、observed_at 语义需新裁、产出落不落库成第二问；
- **(c) 混合**：卡骨架=预采集投影＋缺失面按需补采回库；
- **(d) host-hook 驱动**：宿主 PostRead 类 hook 触发卡片刷新——采集时序绑进宿主事件。

## 调研任务

取证工业界成熟心智模型评估：① 文件级/实体级代码洞察（file health card、hotspot 文件卡、per-entity metrics）的成熟产品形态——CodeScene/CodeClimate/SonarQube/Sourcegraph 类工具中 per-file 指标是预计算索引查询还是按需计算，交互延迟与新鲜度的权衡惯例；② 「查看触发」交互面的落地形态——IDE/LSP 扩展 vs agent/MCP tool 调用在 AI 编码工具时代的先例（agent 查看文件时按工具调用取文件洞察的落地案例）；③ 派生指标「预计算+投影」vs「按需计算」的数据工程惯例——OLAP 预聚合/物化视图 vs on-demand 计算的选择判据（延迟、基数、新鲜度）；④ advisory（非裁决）洞察卡的证据引用/可信度披露惯例——不进 gating 的指标如何避免被误读为判决。输出=推荐+理由+各候选评估+冲突核查+来源清单+信息缺口+置信度。
