# 23 — atomcode 深度调研提示词（A-026 / A-027 / spec §R3-D5）

> 本文件是票 23 的调研提示词留档（沿用 01/03/15-research-prompt.md 惯例）。调研报告落 `reports/23-atomcode-research.md`。

## 调研问题（单句）

在「审计/审查类产品的第一份真报告」场景下，如何让一份 Markdown 主报告同时满足四件事：
（1）每条结论挂可回查引文，且引文必须**支撑**结论（不只是存在）；
（2）报告带不可伪造的 Receipt（裁决回执）印记，证明该结论确实经过了预声明闸门而非事后生成；
（3）裁决块结构化、引文锚可解析，使下游 agent 能「信任并行动」；
（4）失败/降级路径产物与 happy path 同骨架，只降内容完整度并打 `⚠ unverified` 印记。

## 必须回答的子问题

1. **引文→结论支持关系校验**：现有的「有引文即通过」为什么不够？请给出可机检的支持关系判定模型（claim / evidence / support_relation 三元组如何落地为断言），并对比至少两个工业先例（如 SARIF 的 `results[].locations` + `rules` 绑定、学术界的 claim-evidence 标注、法律意见书的引证链）。
2. **Receipt 印记**：审计/合同/供应链领域「回执不可伪造」的成熟机制（时间戳权威 TSA RFC 3161、SCITT / transparency log、in-toto attestation、Sigstore、W3C Verifiable Credentials）中，哪一个最贴近「单仓自用、零外部服务」的约束？给出取舍与降级方案（如内容寻址哈希链 + commit 锚定）。
3. **agent 可消费性**：机器可消费裁决块的既有格式（SARIF v2.1.0、OSC&A、in-toto statement、CycloneDX attestation、JUnit XML）哪个适合作为「结构化裁决 + 可解析引文锚」的载体？字段级对比，并指出哪些字段在本场景是必需的、哪些是噪音。
4. **失败路径同骨架**：ASTM/IEEE 829 与 Fox & Brewer harvest/yield 之后，「降级只降完整度不改形态」有哪些工业实现（如 HTTP 206 Partial Content、GraphQL partial response with errors、OpenTelemetry partial success、gRPC Trailers）？给出可机检的「同骨架」判据。

## 约束（不得违反）

- 6F 自身单仓 Macro-B，样本 n=13 ADR / 64 commits；调研不得给出依赖多仓语料才成立的结论。
- 采集器确定性、不接 LLM（D-016）；不得推荐以 LLM 判定支持关系的方案。
- 引用须可回查：给标准号 + 条款位 + URL；禁止虚构单一综述来源（A-029）。
- 与 current 决策（D-016/D-017/D-018、ADR-0012/0013）冲突之处必须显式点名，不得静默改向。

## 输出要求

- 中文，markdown；每节结论 + 依据（可回查出处）。
- 至少 2 个成熟心智模型/工具/论文作类比，逐条说明「支撑本票哪个设计决策」。
- 结尾给「对票 23 实现的推荐方案」小节，是可直接落地的字段级建议。