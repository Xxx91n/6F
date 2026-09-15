# 27-prereg — 判据 v2 重测预注册（先于一切重跑入库）

> 纪律（ADR-0015 / D-025 / 票 22 §7 同款）：本文档先 commit 入库，之后才能跑 v2 重测。重测次数 = **恰好 1 次**；判定规则下文写死；跑后禁调（testing into compliance 禁令）。
> 调研锚：atomcode-r6-27（dual reporting/erratum 结构先例：ISO 9001 §7.1.5.2 + COPE/AIP erratum + CALDB 版本入元数据）。

## §1 v2 检测规则（冻结）

detector 新 ID = `adr-structure@v2`（v1 `adr-structure@v1` 代码、ADR_FIVE_PIECE 常量、TC-2 阈值 0.60/0.50、23-first-report.mjs 一律不动）。v2 在五件套判定前追加回退链（A-002 交付物的接线）：

### R1 头部字段（Status / Date / Deciders / Ledger）
- **腿 A（= v1）**：`- X:` dash-bullet，位置限定 `# ` 标题后、首个 `## ` 前。
- **腿 B（内联 Nygard）**：裸行 `X:` / `X：` 或加粗 `**X:**` / `**X：`，全文档范围，首个命中获胜。
- **腿 C（仅 Date）**：head-60 行内最早排序的 ISO `YYYY-MM-DD`（= 02-adr-fallback.mjs extractInlineDate 语义）。
- **腿 D（仅 Date）**：输入注入的 first_commit_date（git log --follow --format=%aI --reverse 首条）。
- 腿序 A→B→C→D；每个字段记录命中腿于 value_json.leg ∈ {dash, inline, inline-iso, git}。

### R2 节字段（Context / Decision / Consequences / Options）
- **腿 A（= v1）**：`## X` 节标题（Considered Options → Options 归一化保留）。
- **腿 B（v2 新增）**：行首裸标签行 `X:` / `X：`（允许可选 `- `/`* ` 前缀；Considered Options 同归一）。

### R3 五件套计数
present = 任一腿命中；missing = 全腿未中；ratio 公式与 v1 相同。`adr.decision_date` 输出 {date, leg} 双字段。

## §2 golden set 与判定规则（写死）

- golden set = reports/26-truth-table.json（冻结集 13 份 × 五件套 = 65 格）。
- **期望读数（v2_expected，跑前写死）**：
  - Status：13/13 present（dash 2 + 裸行/加粗内联 11）
  - Date：13/13 present（dash 2 + inline-iso 5 + git 6）
  - Context / Decision / Consequences：仅 0010~0013 present = 4/13；0001~0009 保持 absent（真实缺失必须保留）
  - 五件套/份：0010~0013 = 5/5；0001~0009 = 2/5（Status+Date）
  - 聚合：mean_ratio = 0.5846；missing_ratio：Status 0、Date 0、C/D/Cq 各 0.6923；TC-2 verdict = **RED**（cond_a 0.5846<0.60 + cond_b 三节 0.6923>0.50）
  - decision_date：全部 13 份 = 2026-09-12（dash 腿优先于 git 腿——0012/0013 git 首提交为 09-13，腿序致 dash 胜）
- **判定**：v2 逐格读数与 v2_expected 一致率必须 = 65/65；real-gap 格 v2 必须仍读 absent（Date 除外——git 腿供给属设计内 present-via-git，期望 present）。任一不符即如实记录 FAIL，禁止调规则复跑。
- **双读数发布**：v1 行（0.2462 RED，dated measurement 保留不撤）+ v2 行 + 真值行并列；勘误文档按 atomcode-r6-27 八节模板（触发/影响评估/修正描述/重跑方法/新旧并列/版本命名/传播链接/记录保存）。

## §3 影响评估（ISO §7.1.5.2 式）

- last-known-good = 无（v1 自接线起即缺回退链——接线缺口自始存在）
- suspect interval = 首报批次（fc00d458，observed 2026-09-13T14:31:09+08:00）
- 受影响结论 = TC-2 字段归因（Status/Date 缺失率被高估）；RED 判定方向经真值复核仍成立（0.4923<0.60）

## §4 签名

- 预注册人：轮 6 执行 agent（本票 #27 / A-032）；commit 先于重跑。
