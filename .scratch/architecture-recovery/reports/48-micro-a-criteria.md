# 48-micro-a-criteria — Micro-A preview 预声明判据（#48 / A-056 / spec R8-02 / D-049）

> 判据先于实跑入库（与本票管道同 commit，跑后禁调——ADR-0013 B 层 kill-criterion 纪律）。
> 三档如实落数：supported / unsupported / insufficient；真判据未命中 = 合法实验数据不是失败。
> desk-task15 满足判据（30-desk-calibration.json items[task=15].probe.satisfaction 原文）：「≥1 条 Micro-A 真实 PR 报告产出且字段清单满足骨架交集」。

## 判据集

| ID | 性质 | 可操作定义 | 命中→band | 未中语义 |
|---|---|---|---|---|
| PC-1 | 正对照（管线活性） | 适配器 run 事实存在且 prs_listed>0（PR 枚举真实发生） | supported | 管线故障 → insufficient |
| TC-1 | 真判据（证据三联） | 被裁 PR 的 pr_summary + pr_metadata + pr_diff 三事实齐备且 merged=true | supported | 缺腿 → insufficient |
| TC-2 | 真判据（diff 通道声明） | pr_diff.channel ∈ {local-git, api} 且 bytes>0；local-git 腿另须 files_changed/additions/deletions 数值齐备（api 腿契约=NULL_STATS 如实缺席、detail 注记须在——上游适配器契约面） | supported | 缺 → insufficient |
| TC-3 | 真判据（作者形态披露） | pr_summary 携 bot_declared 布尔值 + bot_basis=platform-declared 双检措辞 | supported | 缺 → insufficient |
| TC-4 | 真判据（托管面资格闸） | 托管枚举 merged PR ≥1 → eligible；=0 → intake 显式拒绝（D-033 硬约束逆用） | supported | merged=0 → unsupported（拒绝成立） |
| NC-1 | 负对照（merged 选择性） | 入选集恰为票面写死 merged 实例；closed-unmerged PR 不入集 | supported | 混入 → unsupported |

## Micro-A 切片字段契约（骨架交集机械导出面）

字段清单唯一事实源 = `48-micro-a-preview.mjs` 导出常量 `MICRO_A_SLICE_FIELDS`；
NN-check 由该常量 ∩ `REPORT_SKELETON.required_fields`（engine dist 导出）机械导出断言集——禁手抄漂移（D-049⑤）。
golden 断言只锁字段骨架在场、不锁内容值。
