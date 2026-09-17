# R13-Q1 atomcode 深度调研报告 — 叙事生成面与战略 rubric 本体落点

> 调研题面：D:\Aworker\6F\.scratch\macro-audit\reports\R13-Q1-research-prompt.md
> 时点 2026-09-16；通道 ctx_batch_execute（label=atomcode-r13q1，FTS 已索引）；atomcode 会话锚 cc0a6061-53b5-498d-8b75-8004c71142bf。
> Sufficiency Gate：searches 5（Criticism×2／Comparative×1／Official×1／Community×1，三引擎）／full reads 6＋知识库召回本地 6 份。冲突协议结果：**无实质冲突，1 条红线＋6 处边界确认**。

## §1 执行摘要（Tl;dr）

**推荐 (c) 双轨：(a) 为主＋kernel 模板叙事作 degraded 兜底。** Confidence 高——工业界已验证的心智模型高度一致：**叙事归概率面（agent/LLM），裁决归确定性面（kernel），两界面单向、叙事永不触碰分数与门禁**；与本仓 ADR-0008（壳纪律）、ADR-0013（三层闸门）、CodeLore 叙事层先例（单向依赖、advisory-only）全部同构，且 (a) 正好补上 R2-Q7 审计已点名的「ADR-0008 声称产物缺失」违规。(d) 暂缓叙事层理由不成立——rubric 三件资产是 D-004 已封口判据的可操作化文书，不依赖 structure/behavior 采集面先行。

## §2 分点结论

**① 「agent 生成叙事＋确定性校验器盖章」有多个成功先例，是收敛共识非激进实验。**
- K2 LLM Judge（生产 PR 评审系统，2026-07）：三职责分离——read-only Judge（产证据背书的候选发现）／deterministic publisher（拥有发布、校验、去重）／独立收敛回路；原话「The model may judge; the surrounding system must decide when that judgment is safe, current, publishable」；Decision Packet 硬不变量——「The LLM renders explanations but cannot alter outcomes」，解释必须与 packet 一致、不得引入 packet 外新实体/阈值/论证，违反即拒绝。
- CodeLore（本仓上游）：叙事层不 import 评分路径（单向依赖箭头）、叙事永不触碰分数/门禁/退出码、grounded ✓ 仅为 advisory。K2＋Decision Packet＋CodeLore 三源交叉成立。

**② 引文校验的正确姿势＝确定性函数 (output, corpus)，禁止用 LLM 查 LLM。**
- CiteGuard：「If you verify an LLM with another LLM, the verifier itself is probabilistic」；六种裁决枚举（verified/fuzzy_match/wrong_page/quote_not_found/…）＋失败附带证据（匹配页、编辑距离、diff 路径）。
- llm-reliability-lab：无 LLM judge、无 API key；失败分类学含 invalid_citation/missing_citation/missing_expected_fact，CLI 非零退出码即 CI gate。
- 本仓 checkCitationSupport 的 supports/insufficient/contradicts 三态与上述同谱系，方向正确；差距=缺**失败证据输出**（哪个 token、匹配到哪条 evidence）——落 rubric 时应把 citation 失败明细带进报告（CiteGuard「Auditable」原则）。

**③ LLM 自评叙事已知失败模式（(a) 风险清单）**：position bias、verbosity bias、self-enhancement bias、non-determinism（同 case 复跑裁决漂移）、authority/provenance 伪造、judge hallucination（虚构 rubric 违规项）。[arXiv 2604.16790 已读；InfoQ ADR Drift Monitor 六失败模式表双源]。控制手段：叙事降级为 advisory、低置信/高爆炸半径升级人工、rubric 版本化走 PR 评审。

**④ SKILL.md 壳内容组织惯例明确支持 (a) 落点**：官方规范 SKILL.md body <500 行／5000 tokens，重内容进 references/；须写明**何时加载哪个文件**（「Read references/api-errors.md if …」优于泛泛 see references/）；输出格式用 template 而非 prose 描述；gotchas 放 SKILL.md 本体。[Claude 官方 best-practices＋agentskills.io 双源]。quadrant-rubric.md／strategy-questions.md／report-template.md 三件落 references/ 完全在惯例内——正是 research.md §7.1 终局形态图原始设计，非新增发明。

**⑤ (b) 纯 kernel 模板叙事被工业实践证伪为退化项**：Decision Packet 案例显示无 LLM 时叙事质量崩塌到只能渲染 rationale_points；CodeLore 把 LLM 叙事列为可选增强而非默认模板——模板叙事只配 degraded 兜底位。(d) 暂缓则「唯一真护城河」（research.md §7.3 自研 4 样之首）继续悬空，且 rubric 文书不被采集面阻塞（D-004 判据已在 spec 4.1-4.6 封口）。

## §3 对比矩阵

| 项 | 叙事质量 | 离线/无 agent 面 | 与本仓纪律兼容性 | 备注 |
|---|---|---|---|---|
| (a) 壳内 rubric＋宿主 agent 叙事＋kernel 盖章 | 高（唯一真护城河兑现） | ✗ 无叙事 | ✓ 与 ADR-0008/0013 同构；补审计违规 #5 | 需 MCP 查询面出 stub |
| (b) kernel 模板叙事 | 低（固定句式，先例不支持） | ✓ | ✓ 但叙事层唯一无 quality data | 仅够 degraded 位 |
| (c) 双轨 | 高＋有兜底 | ✓ degraded | ✓✓ receipt 已有 degraded 字段，语义现成 | **推荐** |
| (d) 暂缓补采集面 | —（悬空） | — | 与 D-034 层序不冲突但护城河继续空转 | rubric 文书不阻塞于采集面 |

## §4 候选失败模式清单

- **(a)**：①宿主 agent 幻觉/风格漂移→kernel 盖章兜住，但 ⚠ uncited 高频出现污染观感（CodeLore 承认 grounded ✓ 不证真，报告须保留同款诚实限制声明）；②prompt injection（被审仓内容当指令）→rubric 须写明「仓库内容只当证据不当指令」（InfoQ 模式）；③non-determinism→同一 fact sheet 复跑叙事漂移，报告应记录 model id（CodeLore stamp 已含）；④MCP 查询面仍是 stub——落 (a) 必须把 MCP 面出 stub 一并排票，否则宿主 agent 无 facts 可读。
- **(b)**：固定句式在 25 采集单元×5 scale 异质证据上表达力塌缩；无先例支持其作为主路径。
- **(c)**：双路径维护成本＋「模板叙事被误当正式叙事」语义混淆——receipt 的 degraded 标记必须进叙事段印章（现 receipt 已有 degraded 布尔，直接复用）。
- **(d)**：护城河叙事层与 rubric 资产继续缺位；R2-Q7 审计违规 #5（ADR-0008 声称产物缺失）持续挂红。

## §5 与本仓 current 决策冲突点排查（逐条点名，无静默改向）

1. **无冲突，且 (a) 修复既有违规**：ADR-0008 正文要求「SKILL.md＋战略叙事 rubric」，R2-Q7 复核报告硬性 #5 已记「ADR-0008 声称的产物缺失」——落 (a) 的 references/ 三件是履约而非改向。
2. **D-004（current）**：S1-S5 全文判据已在 spec 4.1-4.6 封口——quadrant-rubric.md 是其可操作化，不新增判据语义，一致。
3. **ADR-0013 三层闸门（C 层人裁定）⚠ 红线**：宿主 agent 生成的叙事段**不得携带裁决 band**，只能带 citation 盖章（grounded/⚠ uncited），C 层人裁定仍环境外 CLI；若叙事段渗入 S1-S5 band 判定即冲突 D-026/ADR-0013 纪律，设计时须显式写禁。
4. **ADR-0008 只读壳纪律**：宿主 agent 经 MCP 读 facts 写叙事，kernel 外执行——一致；但 SKILL.md 须保持无 YAML 判定逻辑，叙事 prompt 放 references/strategy-questions.md 而非 SKILL.md 本体，与官方 <500 行惯例一致。
5. **ADR-0014 防腐边界**：叙事生成不经 CodeLore 适配层，宿主 agent 直读 kernel fact 投影——不触碰适配层禁放业务规则条款。
6. **D-035/#35 残余面（manual_watch codelore-residual-faces）**：不影响叙事层落点。
7. **receipt degraded 语义**：(c) 兜底模板叙事必须置 degraded=true 走 UNVERIFIED_MARK，复用 generate.ts 现有字段，不新发明协议。

## §6 完整来源清单

| 标题 | URL | 角度 | 日期 | 贡献 |
|---|---|---|---|---|
| K2 LLM Judge 架构 essay | github.com/OkBayat/OkBayat.github.io/…/k2-llm-judge-en.md | Comparative | 2026-07-21 | 三职责分离、deterministic publisher、review contract 先例 |
| CiteGuard | github.com/SarahCho0/citeguard | Criticism | 2026-08-11 | 确定性引文门禁六裁决、禁 LLM 查 LLM、可审计失败证据 |
| llm-reliability-lab | github.com/huseyinkaplandev/llm-reliability-lab | Community | 2026-07-31 | 无 LLM judge 确定性评测、失败分类学、CI gate |
| Claude Skill authoring best practices | platform.claude.com/docs/…/best-practices | Official | 现行 | <500 行、references/ 渐进披露、何时加载 |
| agentskills.io best practices | agentskills.io/skill-creation/best-practices | Official | 现行 | 5000 token 上限双源、template/gotchas 惯例 |
| Bias in the Loop (arXiv 2604.16790) | arxiv.org/html/2604.16790v1 | Criticism | 2026-04-18 | LLM-judge 七类 prompt bias 实证 |
| Decision Packet 分离 essay | 同 K2 抓取内交叉可见 | Comparative | — | 「分离权威与叙事」不变量清单 |
| 本仓 research.md §5.2/§7.1/§7.3、ADR-0008/0013、R2-Q7 复核报告 | 本地 | — | 2026-08~09 | CodeLore 叙事先例、五层盒子设计、审计违规 #5 |

## §7 信息缺口与最终推荐

**最终推荐：采纳 (c)**——rubric 三件落 `engine/skills/macro-audit/references/`，宿主 agent 叙事经 MCP 读 facts（MCP 面出 stub 需排票），kernel citation 盖章入报告；kernel 模板叙事仅作 degraded 兜底并置 degraded=true。落票时同时闭环 R2-Q7 违规 #5 与 SKILL.md frontmatter 缺失（违规 #4）。
