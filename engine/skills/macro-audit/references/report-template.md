# report-template — 叙述段输出模板（宿主 agent 生成的地方）

> 什么时候加载：宿主 agent 提交叙述段前加载——输出格式按这个来（不要自由散文）。
> 盖章流程：本文件格式 → kernel `sealNarrative`（checkAllCitations＋判定档红线机器检查）→ 进报告 C2 叙述段。

## 输出格式（JSON 段集）

```json
{
  "narrative_sections": [
    {
      "section_id": "S2",
      "author": "host-agent",
      "model_id": "<provider/model@version>",
      "text": "<叙述正文：只组织证据，不评判定档>",
      "claims": [
        { "claim_id": "NC-1", "evidence_id": "EV-...", "required_tokens": ["<支撑锚词>"], "text": "<该 claim 对应句子>" }
      ]
    }
  ]
}
```

## 字段规则

- `section_id`：象限维（S1-S5）或章位（C2/C4）；同一段可以有多条。
- `author`：host-agent 必填 `model_id`（叙述记 model id 才能追溯，D-053⑤）；kernel-template 由 kernel 自己用，不要手写。
- `claims[].evidence_id` 必须指向报告 C3 证据锚；`required_tokens` 是 claim 在引文原文里的逐字支撑词。
- 盖章结果三种：`sealed`（全部有据）/`sealed-with-gaps`（有没命中的 claim，明细 token↔evidence 输出）/`rejected`（判定档违规或没有 model_id）。

## 红线

叙述段**只带 citation 盖章，不得携带裁决 band**（D-053；C 层由人定 / D-026）：
- 禁：维度判定档赋值（`S1: supported`）、裁决字段名（verdict/verdict_gate/overall_verdict/band=）、中文判定句式（裁定为/裁定：/判红/判绿/判黄/本段裁定/叙事裁定；这些是检测器认的字面，换成大白话也别带进叙述段）；
- 叙述可以写「证据显示…」「引文见 EV-x」——不能写「所以本维判 supported」。
- 违规段 seal=rejected，违规明细 band_violations 照实进报告。

## 降级保底

宿主 agent 叙述缺席时，kernel 用 `renderTemplateNarrative` 出模板叙述（author=kernel-template，model_id=null），报告 degraded=true＋⚠ unverified——**模板叙述永远在降级位，不冒充正式叙述**。
