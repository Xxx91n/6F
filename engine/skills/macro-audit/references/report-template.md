# report-template —— 叙述段输出模板（宿主 agent 照着写的地方）

> 什么时候加载：宿主 agent 交叙述段之前加载——输出格式就按这份来（不许自己写成散文）。
> 盖章流程：先按这份格式写 → 交给内核 `sealNarrative`（checkAllCitations + 判定档红线机器检查）→ 合格了才进报告的 C2 叙述段。

## 输出格式（JSON 段集）

```json
{
  "narrative_sections": [
    {
      "section_id": "S2",
      "author": "host-agent",
      "model_id": "<provider/model@version>",
      "text": "<叙述正文：只摆证据，不评判定档>",
      "claims": [
        { "claim_id": "NC-1", "evidence_id": "EV-...", "required_tokens": ["<支撑锚词>"], "text": "<这个 claim 对应那一句>" }
      ]
    }
  ]
}
```

## 字段怎么填

- `section_id`：象限维（S1-S5）或者章节位置（C2/C4）；同一段可以有好几条。
- `author`：host-agent 必须填 `model_id`（叙述得记下 model id 才能追到是谁写的，D-053⑤）；kernel-template 是内核自己用的，别手写。
- `claims[].evidence_id` 必须指向报告 C3 的证据锚；`required_tokens` 是这条 claim 在引文原文里逐字出现的支撑词。
- 盖章结果三种：`sealed`（全都有据）/`sealed-with-gaps`（有 claim 没命中，明细按 token 对 evidence 列出来）/`rejected`（踩了判定档红线，或者没填 model_id）。

## 红线

叙述段**只带 citation 盖章，不得携带裁决 band**（D-053；C 层由人定 / D-026）：
- 不许写维度判定档赋值（`S1: supported`），不许写裁决字段名（verdict/verdict_gate/overall_verdict/band=），不许写中文判定句式（检测器认哪些字面，看 `engine/src/report/narrative.ts`；换成大白话也照样别带进叙述段）；
- 叙述可以写「证据显示……」「引文见 EV-x」——不能写「所以这一维判 supported」。
- 踩线的段 seal=rejected，违规明细 band_violations 照实进报告。

## 兜底

宿主 agent 那一段叙述没交，内核就用 `renderTemplateNarrative` 套模板出一段（author=kernel-template，model_id=null），报告 degraded=true 加 ⚠ unverified——**模板叙述永远待在兜底位，不冒充正式叙述**。
