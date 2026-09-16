# R13-Q6 调研题面 — Kernel/Agent 职责边界要不要总则化

> 轮 13 grill Q6。提交 atomcode 深度调研。

## 本地回顾义务（先读后答）

先阅读本仓库（D:\Aworker\6F）以下材料再作答：

1. `.scratch/macro-audit/decision-ledger.md` — 全部 status 含 current 的记录（本轮已新增 D-053~D-057）；
2. `docs/adr/` — 全部 21 件 ADR，重点 0005（HoF-FA 裁决协议）、0008（Agent Plugin 五层盒子）、0013（三层验收闸门）；
3. `CONTEXT.md` — 全部词面（~58 词），核对是否已有等价词条；
4. 本轮三案：D-055（hooks=纯呈现面非裁决点）、D-056（repo 文件面归宿主 agent 原生访问非打包上游）、D-057④（gap→补查回路归 orchestrator 非 kernel）；
5. `engine/src/report/generate.ts` — kernel 侧判定/盖章实物面；
6. `engine/skills/macro-audit/SKILL.md` — agent 侧方法壳实物面。

## 待裁定问题

本轮三案背后是同一隐含原则：**确定性归 kernel（判定/事实/盖章/门禁），编排与概率性归宿主 agent（叙事/补查/呈现/触发编排）**。该原则仓内无总则级落点——ADR-0005 管裁决协议、ADR-0008 管五层形态、CONTEXT 无此词条；三条 D 记录是判例但不成文。

候选：

- (a) CONTEXT 收编新词「Kernel/Agent 职责边界」：kernel=确定性判定/事实/盖章；agent=编排/叙事/补查/呈现；跨界争议按 D-055/056/057 判例裁——词面落点最轻；
- (b) 不立：三条判例链自然生效；
- (c) 立 ADR-0022 新 ADR 写边界总则——与 ADR-0005/0008 语义重叠。

## 调研要求

重点调研工业界成熟落地的心智模型：agentic 系统「deterministic core + probabilistic orchestrator」职责划分的成熟表述（如 Anthropic Building Effective Agents 的 workflow/agent 划分、LangGraph deterministic guardrails、DSPy/K2 LLM-Judge 三职责分离）；架构治理中「判例链→成文总则」的时机判据（何时该把重复出现的决策模式升为明文原则/ADR）；CONTEXT/glossary 词条 vs ADR 的收编门槛惯例（什么进词表什么进 ADR）。

输出：推荐选项＋理由；各候选已知失败模式；若推荐 (a) 给出词条措辞建议；与本仓 current 决策冲突点排查——若冲突点名 D-xxx/ADR-xxxx，不许静默改向。