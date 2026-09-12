# R2-Q7 — atomcode 深度调研 prompt（spec 与工程实现边界 / A+B 组合落地）

> 检索标签建议：R2-Q7-engineering-boundary（便于 ctx_search source 过滤复现）。
> 纪律：本仓唯一数据源 = .scratch/macro-audit/decision-ledger.md；结论与任何 current 决策冲突时必须显式列出，禁止静默改向。

## 一、背景（本仓现状）

本仓 D:/Aworker/6F（远端 6F/main）是「宏观+微观工程内容审计产品」的 **spec-level 完整规划仓**。决策层已封口 D-001 ~ D-013 全部 current（详见 .scratch/macro-audit/decision-ledger.md），ADR-0001 ~ ADR-0009 全部 accepted（docs/adr/），术语表 42 词（CONTEXT.md）。与本次调研相关的边界如下：

- **ADR-0002 / D-002（No MVP slice）**：本仓产出 = spec-level 完整规划（5 scale 全部 spec 级同时落地）；「执行阶段的实现优先级排序属于本仓库外的工作」。
- **D-008**：本仓继续扮演 spec-level 规划仓角色，不修订 ADR-0002；「B 方向（工程实现）若日后启动，须显式修订 ADR-0002 或另起工程仓」（BACKLOG B4.1 已预告此岔口）。
- **ADR-0003 / D-003**：规划边界 = 产品本体（规格/架构/集成）+ 使用方法（演示）；商业层（协议/商业模式/定价）排除。
- **ADR-0008 / D-012**：分发形态 = Agent Plugins 1.0.0 五层盒子（plugin.json + skills/ + mcp.json 只读证据查询面 + 反向域名扩展目录（hooks 仅触发/呈现）+ 随分发内核确定性 CLI 四外壳；双 manifest 由单一元数据源生成）。
- **ADR-0009 / D-013**：输入面 = 本地路径默认 + 远程 URL 配置可达（全深度 clone 到隔离缓存，MCP 保持只读）。
- **R2 spec 任务（未完成）**：R2-01 四类 persona / R2-02 场景并集+mode 枚举 / R2-03 默认模式开箱路径契约 / R2-04 Agent Plugin 契约群 / R2-05 输入面契约。

## 二、本次触发问题（用户呈报 + 用户倾向）

子 Agent 启动时被下达的验收标准为：「**编译通过、打包通过、启动并测活软件进程；每个平台都要有 test 闭环，避免只引入却没做到**」。该标准预设了一个**可构建、可启动的软件交付物**；但本仓当前**无产品源码、无构建清单**，且 ADR-0002 / D-008 明确「R2 全部完成前不启动工程实现」。

用户倾向 = **A+B 组合**：既完成 spec 契约（R2-01 ~ R2-05），又进入工程实现（先修订 ADR-0002 或另起工程仓），按上述验收标准验收。

## 三、调研问题（4 条）

1. **spec 与工程实现边界的工业成熟心智模型**：成熟项目如何界定「规划/spec 完成」到「工程实现」的边界？是同仓延续还是另起工程仓？请给出可对标的心智模型/流程（≥ 3 个，附一手来源），并说明各自「固定什么 / 自由什么」。候选：IETF RFC 与 reference implementation、Amazon PR/FAQ + Working Backwards、Google Design Doc、GitHub Spec Kit / spec-driven development、walking skeleton 与 tracer bullets（Cockburn）、Monorepo vs Polyrepo、ADR immutability + supersede 链、stage-gate / phase gate。
2. **ADR-0002 的处置**：若要启动工程实现，工业界对「阶段性边界决策随阶段推进」的成熟做法是什么——修订/supersede 原 ADR，还是另起工程仓（polyrepo 拆分）？两者取舍与判据？对「spec 仓」与「实现仓」同仓/分仓有哪些成熟先例（含 Agent Plugin / MCP 生态）？
3. **Agent Plugin 产品工程实现的成熟轮子（不自研优先）**：Agent Plugins 1.0.0 五层盒子落地（plugin.json / mcp.json 的 schema 与校验、双 manifest 单一元数据源生成脚本）、MCP server 脚手架（stdio / streamable-http）、内核 CLI 四外壳打包（npm bin / GitHub Action / 独立二进制）、跨平台 test 闭环（CI matrix：Windows/macOS/Linux × 运行时版本）、DuckDB 事实表在 JS/Python 的绑定与嵌入、receipt/签名与 provenance（Sigstore/cosign/SLSA）。哪些有工业级成熟轮子可直接采用？给出推荐与理由。
4. **验收标准的工业等价实践**：「编译通过、打包通过、启动并测活软件进程；每个平台都要有 test 闭环」在工业界的成熟等价物（build -> package -> smoke test -> per-platform test matrix -> process liveness probe / e2e 健康检查）；给出可落地的 CI 骨架建议。

## 四、要求

- **必须回顾**：① decision-ledger.md 中全部 current 记录（D-001 ~ D-013）；② docs/adr/0001 ~ 0009 现有条目；③ CONTEXT.md 现有 42 术语；④ **工业界成熟落地的心智模型（重点）**。
- 对标工业界成熟心智模型 / 工具 / 论文 **≥ 3 个**，必须给一手来源链接。
- **明确区分「有直接先例」与「仅为类比」**；对无直接先例项必须显式说明。
- 输出一份**中文**调研报告：背景回顾、对标表（对象 / 固定什么 / 自由什么 / 对本问题的印证 / 先例性质）、四条问题的推荐方案（含推荐 + 理由 + 取舍）、一手来源列表。
- **不要输出代码**，只要结论与依据。
- 若你的结论与本仓任何 current 决策（D-xxx）冲突，**必须显式列出冲突项**并说明冲突点，供人工裁定——不要静默改向。
