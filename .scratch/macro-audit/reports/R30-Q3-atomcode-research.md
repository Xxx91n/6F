# R30-Q3 atomcode 深调研报告：文件质量卡内容契约选型（A/B/C/D）

> 运行：2026-09-23（atomcode -p）；题面见 R30-Q3-research-prompt.md。
> 引擎实况：Tavily 额度耗尽→AnySearch 主力+web_search 补位；searches 9+、full reads 6（SonarQube metrics-definition／CodeScene code-health+hotspots／CodeClimate 10-point／Qlty metrics／Parasoft false-positives／technicaldebtcost）；置信度=高（主干 4+ 源交叉）/中（失败形态板块）。

## 1) 执行摘要（Tl;dr）

**推荐 C：指标+宿主叙事+kernel 确定性优先级元数据**，且 C 内部再分层——纯投影指标（A 的全部内容）是基底，kernel 只额外产出一小类**确定性可复算派生值**（rank/percentile/top-N/priority 档），每项携带 derivation 溯源字段；**明确否决 B 的 A-E 判语形态**。理由：工业界四个同类产品全部同时呈现「原始指标+派生聚合值」，无一采用纯指标投影（A）——CodeScene file view=hotspot score×code health 双派生值+指标；SonarQube file page=sqale_rating A-E+原始 issue 数；Code Climate/Qlty=per-file GPA+分钟级分解。派生值不是「叙事」是确定性函数，归 kernel 完全符合双轨制。派生值业界语义定位全部是 advisory 排序/读序引导，唯一接近裁决语义的（SonarQube rating）恰是通过**可被 Quality Gate 消费**才获得裁决力——文件卡「不进裁决路径」约束下，派生值不作 gate 条件+带 advisory 标注即不滑向 B。B 的风险=A-E 字母判语在业界心智中默认携带「裁决/门禁」语义（sqale_rating 直接是 gate 指标、Code Climate GPA 直接映射 PR 失败），采用它=把裁决语义引入 advisory 面。

## 2) 对比矩阵：工业界 per-file 质量卡内容形态

| 产品 | 原始指标（投影） | 派生值（确定性计算） | 派生值语义 | 叙事归属 | 失败形态 |
|---|---|---|---|---|---|
| CodeScene file view | LoC、复杂度、churn、authors | code health 1-10（25+ 因子加权）、hotspot score、Green/Yellow/Red 分类 | 明确 advisory：「low health ≠ 需要立即行动，要放上下文看」；优先级靠 ML 排序 | 健康因子逐条列出（Virtual Code Review），规则可配置可 disable | — |
| SonarQube file page | issue 数、coverage、复杂度、duplications、sqale_index 分钟数 | sqale_rating A-E（debt ratio 分档映射） | **裁决语义**：可直接作 Quality Gate 条件（官方档「All maintainability metrics can be used in a quality gate condition」） | 无 LLM 叙事；解释=规则文档链接 | 无 SCM 数据时 new code 退化按分析日期判定；二进制被 scanner 排除不在指标面出现 |
| Code Climate（现 Qlty） | 10 类 smell 逐条+每条 remediation 分钟数 | per-file GPA A-F（累计修复成本→字母）；repo 级 debt ratio | 半裁决：GPA 变化直接驱动 PR 评论/门禁 | 无叙事；文件视图展示 minute-cost breakdown 供自查 | — |
| Qlty | LoC、cognitive/cyclomatic complexity、duplication %、smell 分钟数 | Maintainability 字母档（file 级对数函数基于 total debt）、coverage A-F、T-shirt size | advisory 为主，gate 可选 | 无叙事 | — |

**横向结论（每条 ≥2 信源）**：
1. **没有一家只放原始指标（=候选 A）**——四家全部有确定性派生聚合值，纯指标投影迫使用户心算「这文件到底糟不糟」违背 easy-to-understand 第一设计目标；
2. **派生值≠判语≠叙事**：业界三分——①原始指标②确定性派生（rank/score/字母档=数据到数据纯函数）③解释建议（叙事）；叙事在本仓归宿主 agent 不冲突；
3. **派生值的裁决力来自消费方不来自值本身**：同一个 A-E 字母在 Code Climate 是 PR 门禁输入（裁决）、在 Qlty 被描述为「easy to understand at a glance」（advisory）——决定语义的是是否进入 gate 条件而非数值形态；
4. **advisory 误读治理惯例=CodeScene 最可借鉴**：优先级明确声明为排序非判定／disable 规则须展示非阻塞警告（「no directives fly under the radar」=抑制/降级本身要可见）／所有因子逐条可查；Sonar 生态对应=false positive 抑制通道+分级披露；
5. **防幻觉分工先例**：宿主叙事+kernel citation 盖章与业界 grounding 实践一致（锚定可检索证据+audit 可追溯）；CodeScene disable 指令「必须精确匹配 smell 名称拼错即忽略」先例→**citation 校验应同时校验指标键存在性**；
6. **失败形态=三态呈现非空值**：无数据（new file/无 SCM）明确降级说明依据；不可分析（二进制/生成代码）整卡不出现而非渲染空指标；宿主对空指标编造叙事由 citation 校验天然拦截。

## 3) 各候选评估

- **A 纯指标投影**：最纯但违背业界共识（四家无一如此）；且 churn/percentile 本身已是派生值——A 做不到「零派生」，只是把派生位置从 kernel 挪到宿主=**派生挪到宿主反而破坏确定性**（宿主 LLM 算 percentile 不可复现）。只适合做 C 的基底→否决（保留为 C 基底）；
- **B 指标+kernel 派生判语（A-E）**：方向对（派生归 kernel）但选错表达形态——A-E/GPA 字母在业界心智绑定裁决/门禁语义；字母档损失信息（Qlty 自认 GPA 是 intentionally simplified for dashboard UX）而宿主 agent 恰恰能消化连续值→否决形态吸收内核；
- **C 指标+宿主叙事+kernel 优先级元数据**：与业界心智完全对齐（CodeScene「Prioritized Technical Debt」卡=确定性优先级元数据+advisory 原型）；priority 档（P0-P3 或 hot/warm/cold）业界无裁决心智绑定天然 advisory→**推荐**；
- **D 可配置指标集**：非互斥候选=正交配置面；业界配置的都是**阈值与规则**而非指标有无（CodeScene code health rules JSON/Code Climate .codeclimate.yml 阈值/Qlty engine 配置）→并入 C 不单独成案。

## 4) 推荐方案（C 的落地契约）

```yaml
file_quality_card:
  advisory: true            # 显式性质标注字段，业界先例：Sonar hotspot review、CodeScene priority
  kernel_layer:             # 确定性层，全部可复算
    metrics: [loc, revisions, cognitive_health, hotspot_score, mi_rank, ai_pct,
              entity_churn, entity_ownership, coupling_pairs, code_age]
    derived:                # C 的核心增量，每项带 derivation 溯源
      - name: priority_band         # P0-P3 档，由确定性规则（如 hotspot_score×health 阈值）产出
        derivation: "rule:hotspot_priority_v1"
      - name: percentile_rank       # 相对仓内同粒度文件的分位
        derivation: "fn:percentile(scope=repo)"
      - name: top_n_flag            # 是否属仓内 top-N hotspot
        derivation: "fn:topN(k=20)"
    provenance: { obs_at: "<HEAD commit time>", fact_ref: "duckdb:..." }
  narrative_layer:          # 宿主 agent 生成，非 kernel 职责
    - 解释、判语、建议、读序之外的上下文
    - 每句必须携带 citation 回指 kernel_layer 的 fact_ref/metric key
    - citation 校验：指标键必须存在于 kernel 指标字典（CodeScene disable 指令先例：拼错即拒绝）
  failure_states:
    - new_file / insufficient_history: 显式状态，仅静态指标
    - binary / generated: card_type=not_applicable，不出空卡
```

关键纪律三条：(1) kernel 派生值不作为任何 gate/裁决条件（C 与 B 的唯一分界线，靠消费侧约束保证）；(2) advisory 标注+派生规则版本号随卡发布（CodeScene 透明度惯例）；(3) 宿主叙事零指标值——叙事只能引用 kernel 已算好的数不得自行计算（保确定性）。

## 5) 来源清单

| # | 来源 | 角度 | 贡献 |
|---|---|---|---|
| 1 | SonarQube 官方 metrics 定义（docs.sonarsource.com metrics-definition） | Official | sqale_rating A-E 定义、debt ratio 公式、派生值可作 Quality Gate 条件的直接证据 |
| 2 | CodeScene hotspots/code-health 官方档（codescene.io/docs） | Official | file view 卡内容=双派生值+指标；advisory 定位原文；priority 排序惯例 |
| 3 | CodeScene Virtual Code Review / rules 配置 | Official | 因子逐条可查+disable 指令精确匹配先例 |
| 4 | Code Climate 10-point technical debt assessment 博文 | Official | 10 checks 清单、per-file remediation→字母映射、「easy to understand」设计目标 |
| 5 | Qlty 官方 metrics 文档（docs.qlty.sh） | Official | file 级对数函数评级、project/dir/file 三态粒度 |
| 6 | TechnicalDebtCost: Code Climate Maintainability | Comparative | GPA→分钟数映射表、per-file 视图优缺点（隐藏跨文件问题）、与 Sonar/CAST 对比 |
| 7 | Parasoft: False Positives in Static Analysis | Criticism | advisory 误读治理：噪音/分级披露/结果分诊惯例 |
| 8 | 知识库历史调研复用 | — | 10+ 条历史条目交叉 |

## 6) 信息缺口

- Sourcery per-file 卡官方文档 404 未能一手验证（用二手描述替代）；
- 「失败形态」（无数据/新文件/二进制）无专门官方章节——仅间接证据（SonarQube 社区帖：无 SCM 数据退化为按分析日期判定 new code；binary 被 scanner 排除），该板块置信度降为中；
- Exa 中途限流、Tavily 额度耗尽，AnySearch 承担大部分验证；关键结论 ≥2 独立信源。
