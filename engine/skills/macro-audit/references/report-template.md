# report-template — 叙事段输出模板（宿主 agent 产出面）

> 加载条件：宿主 agent 提交叙事段前加载——输出格式以此为准（不用自由 prose）。
> 盖章链：本文件格式 → kernel `sealNarrative`（checkAllCitations＋band 红线机检）→ 入报告 C2 叙事段。

## 输出契约（JSON 段集）

```json
{
  "narrative_sections": [
    {
      "section_id": "S2",
      "author": "host-agent",
      "model_id": "<provider/model@version>",
      "text": "<叙事正文：只组织证据，不评 band>",
      "claims": [
        { "claim_id": "NC-1", "evidence_id": "EV-...", "required_tokens": ["<支撑锚词>"], "text": "<该 claim 对应句子>" }
      ]
    }
  ]
}
```

## 字段规则

- `section_id`：象限维（S1-S5）或章位（C2/C4）；同段可多条。
- `author`：host-agent 必填 `model_id`（叙事记 model id 可溯，D-053⑤）；kernel-template 由 kernel 自用勿手写。
- `claims[].evidence_id` 必须指向报告 C3 证据锚；`required_tokens` 为 claim 在引文原文中的逐字支撑词。
- 盖章结果三态：`sealed`（全 grounded）/`sealed-with-gaps`（有未命中 claim，明细 token↔evidence 输出）/`rejected`（band 违规或缺 model_id）。

## 红线

叙事段**只带 citation 盖章，不得携带裁决 band**（D-053/ADR-0013/D-026）：
- 禁：维度 band 赋值（`S1: supported`）、裁决字段名（verdict/verdict_gate/overall_verdict/band=）、中文裁定句式（裁定为/判红/判绿）；
- 叙事可以写「证据显示…」「引文见 EV-x」——不可写「所以本维判 supported」。
- 违规段 seal=rejected，违规明细 band_violations 如实入报告。

## degraded 兜底

宿主 agent 叙事缺席时 kernel 以 `renderTemplateNarrative` 出模板叙事（author=kernel-template，model_id=null），报告 degraded=true＋⚠ unverified——**模板叙事永居降级位，不冒充正式叙事**。
