# S4 工具链 · 04 — 可复用程度说明（reusability）

> 票 #03 / A-003 完成定义第 4 项。结论先行：**方法层可复用（L0-L1），参数层需本地化（L2）**——prompt 模板、JSON schema、抽检 checklist、对照表方法论可直接迁移到任何有 docs/adr/ 的仓库；机检规则、证据源映射、抽样参数必须按目标仓重写。

## 复用层级定义
- **L0 直接复制**：零改动可用
- **L1 改参数**：改枚举/阈值/路径后可用
- **L2 重写组件**：结构可借鉴，内容须按目标仓重建

## 组件×层级矩阵
| 组件 | 文件 | 层级 | 迁移时需改什么 |
|---|---|---|---|
| System Prompt + 抽取规则 | 03-extraction-prompt.md | **L0** | 无（规则与仓库无关） |
| 输出 JSON Schema v1 | 03-extraction-prompt.md | **L0** | 无（id pattern 前缀可留） |
| Few-shot 示例 | 03-extraction-prompt.md | **L0（保持合成）** | 可换为目标仓 ADR 提炼的示例，但会引入"考题泄漏"，需重跑干净案例验证 |
| 人工抽检 checklist | 03-spotcheck-checklist.md | **L0-L1** | F1-F6 失败模式通用；抽样阈值（≤30 全量 / >30 分层 10%）是初版参数，可按 A-005 校准机制调 |
| 对照表方法论 | 03-extraction-prompt.md §对照表 | **L0** | InfoQ 行不变；目标仓可追加自己的对标行 |
| scope_guard 机检规则 | 本票实例（grep Arcalea/PMI=0） | **L2** | 每仓的负向声明不同，规则须按该仓 ADR 重写（这是确定性优先原则的落点：能 grep 的不进 LLM） |
| evidence contract 证据源映射 | signal_type 六域 → 具体数据源 | **L2** | 六域枚举（metric/incident/cost/dep/ownership/process）通用，域到工具的映射（如 metrics→Prometheus）按仓配置 |
| 失效检测周期 | Macro-C 触发器（手动/版本发布节点） | **L1** | 沿用目标仓自己的 Trigger Sequence，不新造节奏 |
| valid_until 校准窗口 | 90 天（同源 A-005 expires 2026-12-10） | **L1** | 跟随目标仓校准机制，若无则默认 90 天 |

## 与其他票/决策的集成点
- **A-005 矩阵 S4 行**（per spec §Decision 4.5"单维决策必须能填入矩阵"）：判据=assumptions 的 falsifiable/importance 分级；数据源=quote_span（ADR 原文）+ signal_type 五域；阈值初版=falsifiable ≥2 采纳 / =1 升级 / =0 拒绝 + 抽样率 ≤30 全量或 ≥10%；校准=90 天窗口。已在 03-extraction-prompt.md §对齐节落成表格。
- **A-002（ADR 时间戳头）**：阶段 0 预处理读 ADR 元数据（status/date）依赖 A-002 的时间戳核查清单——ADR 无 YAML 头时本工具链降级为 INSUFFICIENT-EVIDENCE 起步。
- **A-006（AI 冲击评估 M3）**：M3 上下文漂移（St+KV）可直接消费本工具链的 assumptions.jsonl 作为基线，不另建（per ledger A-006 落盘"与 A-003 应复用而非另建"）。
- **D-006 / ADR-0006 报告模板**：drift 报告（本工具链阶段 3 输出）进入证据章节，带 grounded ✓/⚠ 盖章与 verdict-gate 印记；假设失效判定不自动改 ADR status（对照表第 9 行）。
- **A-018（failure path）**：AS-0007-02/0007-04 的验收载体是 A-018 产物；A-018 闭环后应回跑本工具链核对 verdict-gate 印记机检面。
- **Macro-C scale**：S4 主战场（per CONTEXT.md），抽取一次性 + ADR 新增时增量；失效检测按 Macro-C 触发器跑。

## 已知限制（诚实清单）
1. **spec-level 仓库的证据面偏窄**：本仓无实现代码，signal_type 实际只用到 process/dep/metric 三域，incident/cost/ownership 域未实测——迁移到真实代码仓证据面更宽，但本票案例对这些域无验证力。
2. **单抽取模型**：双模型分歧升级机制（per arXiv:2602.07609）设计已写入模板但本次只跑了单模型——该机制标记为**待启用**，首次跨仓使用时建议开启。
3. **复核位代行**：本仓无人类常驻复核位，独立 agent 窗口代行抽检（独立性=不同上下文实例，非不同物种）；用户终审权保留。人类复核位建立后按 checklist §复核位切换。
4. **反事实假设不可直接验证**：被否选项前提（如 AS-0005-03）只能标 INSUFFICIENT-EVIDENCE，失效检测只能观察间接信号——这是方法论边界不是缺陷，但使用者不得把 INSUFFICIENT-EVIDENCE 误读为 CONFIRMED。
5. **LLM 判定能力边界**（2602.07609：语义误解 44.57%、隐式/部署导向决策准确率不足）：本工具链的抽检回路是硬防线不可跳过——这正是 A-003"不能只信 LLM"约束的依据。

## 复用结论
- 换一个有 ADR 目录的仓库：复制 3 个文件 → 改 2 处（scope_guard 机检规则、证据源映射）→ 全量或分层抽检 → 出 drift 报告。预计迁移成本 <1 agent-day（不含证据源接线）。
- 反向复用（本票 → InfoQ 理念）：本工具链补齐了 InfoQ 版缺失的 prompt/schema/抽样率/实现四件事，见 03-extraction-prompt.md §对照表第 10 行。

---
*版本：v1（2026-09-11，票 #03）。*
