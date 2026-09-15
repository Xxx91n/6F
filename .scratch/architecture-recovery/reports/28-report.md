# 28-report — ADR 治理卫生票（A-033 / spec §R4-D3）

## §0 开工复述

- 本票 Blocked by #26（真实缺失分解为准入范围）——#26 已交付（26-truth-table.json/.md，守卫 18/18 PASS），准入清单已就位，可开工。
- 必读清单逐条已读：issues/28、handoffs/28、prompts/28、spec.md §R4-D3、WORKFLOW.md §4.2、decision-ledger.md A-033 行、docs/adr/0015、reports/26-*（truth-table.json 为唯一范围源）。
- 准入范围（未扩大）：real-gap 33 格 = Date ×6（0001/0003~0007）+ `## Context/Decision/Consequences` ×9（0001~0009）；外加 post-freeze 酌情行 0014（Context/Decision 真缺 + `Considered Options:`/`Consequences：` 裸行标签）。
- 互不为完成条件：未以 #27 detector 读数为验收依据；真实缺失不随 detector 改动消失（D-025 判据）。

## 调研

- **研究锚**：`atomcode-r6-28`（本轮已跑，遵串行纪律未重复调用；同 r6-26 为 ctx 索引 label 形态）。
- **关键结论（直接沿用为修订规则）**：
  1. **白名单就地修订是社区主流**（mikiwiik ADR PROCESS.md 等）：治理性补记允许原地落字，但仅限结构标签/字段/注记，决策内容不可改写。
  2. **two-date rule**（WhyChose / MADR 惯例）：decision date 与 commit/入库日期是两个不同字段；外部供给的 Date 必须注明其为 commit 日期而非决策时点断言 → 落实为勘误 marker 中 `Date 值 = 入库/commit 日期（git first-commit 2026-09-12）`。
  3. **禁止项**：新增信息、决策内容改动、事后诸葛式 consequences 增补一律禁止 → 0001~0007 原文无独立 consequences 句，宁挂透明注记不造句。
  4. **errata marker 惯例**：每处补记注明「量测审计驱动的勘误补记」性质（handoff 要求）→ 统一 `> 勘误补记（量测审计驱动 2026-09-15，#28 / A-033）：…；决策内容未改写。`
- **冲突点名**：无（调研结论与 D-025 治理补记豁免措辞一致）。

## 修订执行（逐文件）

句级逐字重分布：原段落按 `。` 断句整句迁移，`决策理由：` 等原句内标签原样保留；节序取既有 0010~0013 房规 Context → Decision → Consequences。执行脚本留档 `reports/28-apply.mjs`（可重放），写后字节级 readback 已逐份记录。

| 文件 | 补记内容 |
|---|---|
| 0001~0007（7 份） | marker + `- Date: 2026-09-12`（0002 除外无 Date）+ `## Context`←决策理由句、`## Decision`←决策句、`## Consequences`←勘误注记（原文无独立 consequences 句，禁止事后增补，故以注记标注而非造句） |
| 0002 | marker + 三节同上（Date 已有 I-inline 形态，不重复落 dash 字段；Status 裸行按规不归一化） |
| 0008 | marker + Context←决策理由句 / Decision←交付形态+双 manifest 两句 / Consequences←「安全纪律」句（约束/影响类表述） |
| 0009 | marker + Context←决策理由句 / Decision←到达方式+输入裁决顺序两句 / Consequences←「五条细则」句（凭据即用即清、禁写回工作区、浅 clone 拒绝、首次授权清单等 scope/impact 表述为主） |
| 0014（post-freeze） | marker + `## Context`←决策理由段、`## Decision`←定版段、裸行 `Considered Options:`→`## Considered Options`、`Consequences：`→`## Consequences`（同段按 `Consequences：` 边界一分为二，文本逐字保留） |

- Date 值核验：6 份均 `git log --follow --format=%aI --reverse` 首提交 = 2026-09-12T11:53:09+08:00 → `- Date: 2026-09-12`（守卫 D 列再核）。
- `Status:` 裸行一律原样（Status 非 real-gap，不归一化为 dash 形态）；`# ` 标题行逐字节不动。
- 布局取舍说明：marker 统一置于标题直下（line 2，全 10 份同位）；`- Date:` 紧随其后（line 3，v1 head-60 解析区内）。句序按节标签重分布属补记本义；节内句间相对序未动。

## 完成定义对照

| 判据 | 结果 | 证据 |
|---|---|---|
| real-gap 33 格逐项清零（补字段/补节，注勘误性质） | ✅ | 9 份三节齐 + 6 份 `- Date:`；marker 逐份注明量测审计驱动 |
| 0014 post-freeze 酌情行 | ✅ | 4 个 `## ` 节 + marker；裸行标签转节、文本逐字 |
| 白名单纪律（不删/不改写/不释义原句） | ✅ | 守卫逐句 whitespace-tolerant 比对 frozen@fc00d458（0014 对 HEAD）全过 |
| 不以 #27 detector 读数为验收依据 | ✅ | 验收仅对照 26-truth-table.json real-gap 清单 |
| 守卫 PASS exit 0 | ✅ | `node 28-check.mjs` → GUARD RESULT: PASS（113 pass / 0 fail） |
| ledger A-033 回写 done + WORKFLOW §4 lessons + commit 引 A-033 | ⛔ 本执行体不可为 | HARD DON'T：禁 git 写命令、禁账本/README/WORKFLOW 改动 → 移交上层收口（见「版本控制处置」） |

## 阻塞

- 无开工阻塞。收尾阻塞 1 项：ledger 回写 / lessons 追加 / commit 属上层闸门（本执行体禁为）。

## 关键发现（报送首脑）

1. **并发外部漂移**：执行期间 `engine/package.json` 被仓内并行 Agent 改动（diff 仅为末尾补换行；`git log` 显示 14:01 有一笔非本票提交触及该文件，本票开工时 status 为空）。未还原他人改动；守卫改为**指纹豁免**——该路径仅当其 diff sha256 = `d77f79ae…2013e` 原样时放行，既证非本票所触、又锁定不得继续漂移。
2. **Consequences 真实缺内容**：0001~0007 原文为「决策句 + 决策理由句」两句结构，无独立 consequences 句；按「禁止事后增补」调研结论挂透明勘误注记，未造句。0008/0009 存在约束/影响类整句（安全纪律 / 五条细则），正常归入 Consequences。
3. **句级粒度选择**：守卫验收要求「原句逐字可检出」，故未做 `；` 级子句切分——`决策理由：`句整句归 Context，句内标签保留逐字形态。

## lessons 候选

- real-gap 治理票的守卫应以「frozen blob 逐句子串比对」为 verbatim 硬证，比人工 diff 复核硬；可复用为后续治理票模板（28-check.mjs 的 fragments()）。
- 多 Agent 并发仓下「改动面白名单」守卫需内置指纹豁免机制，否则外部 cosmetic 漂移（EOF 换行）会误伤守卫判定——本票 `FOREIGN_EXCEPTIONS` 写法可移植。
- 「无独立 consequences 句」用勘误注记补位优于空节或事后造句：结构齐、语义诚实、审计可读。

## 引用文件

- 产物：`docs/adr/0001~0009`、`docs/adr/0014-upstream-integration-dual-track.md`（本票编辑）；`reports/28-apply.mjs`（重放脚本）/`reports/28-check.mjs`（守卫）/`reports/28-report.md`（本文件）
- 范围源/证据：`reports/26-truth-table.json`（real-gap 33 格）、`reports/26-truth-table.md` §5、`docs/adr/0015` §Context、frozen `fc00d458e215cc9a7a26af81626dec8712622821`
- 调研：atomcode-r6-28（ctx 索引锚）

## 版本控制处置

- 本执行体不做任何 git/but 写操作、不 commit（HARD DON'T）。
- 待上层收口动作：ledger A-033 回写 done；WORKFLOW §4 追加 lessons 1 行（候选见上）；commit msg 引用 A-033 + 守卫结果（`node 28-check.mjs` → GUARD RESULT: PASS, 113/0）。
- 工作树现状：本票改动 = 10 份 docs/adr + reports/28-* 三个新文件；另有并发外部 `engine/package.json` 末尾换行漂移（非本票，已在守卫内指纹豁免并向首脑报备）。
