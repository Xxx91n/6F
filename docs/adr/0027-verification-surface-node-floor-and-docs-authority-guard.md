# 验证面 = Node 22.18 下限 + 文档权威守卫 + 回归夹具修复

- Date: 2026-10-26
- Status: accepted

## Context

三条守卫（`20-fact-schema-check`、`21-collectors-check`、`43-check`）直接 `import .ts`，需要**免 flag** 的类型剥离；`engines.node` 却声明 `>=20`，engine-ci 矩阵也带 20 三腿。结果：node 20 三腿持续红，node 22 三腿绿（#36）。Node 20 已于 2026-04-30 EOL。下限取 22.18 而非 22.6：类型剥离 22.6.0 仅以 `--experimental-strip-types` 引入，22.18.0 才默认开启（23.6.0 同步解禁），22.6–22.17 仍抛 `ERR_UNKNOWN_FILE_EXTENSION`。

验证面还有三处结构性缺口：`33-gate-registry.json` 是活契约（45/48/50/51/72-check 消费），但有 9 条守卫引用指向不存在的脚本，且没有一致性守卫（#31）；`23-first-report-check.mjs` 的 36 条首报断言被删，产物仍在 golden-ci 门禁上（#37）；`macro-b-regression` 的 jiahao/django/spring-boot 三仓因 `39-macro-b-one-shot.mjs` 不供 `intake_health` 而连续失败，且没有 issue 承接。

## Decision

- `engines.node` 改为 `>=22.18`；engine-ci 矩阵改 `[22, 24]`；README×2、engine/README、SKILL.md 的 Prerequisites 同步。不保留 Node 20 的 SKIP 分支。
- 新建 `docs-authority-check` 守卫与 `docs-ci` 单腿 workflow：指针存在、`docs/adr/NNNN` 可解析、D-code ⊆ 归档索引、D-code 集合只减不增。
- `33-gate-registry.json` 保持活契约；每条可执行引用必须能解析，`reports/*` 与已删脚本逐条标 `historical`；新增一致性守卫。
- 重建 `23-first-report-check.mjs`：读仓内冻结件，不重渲染；P1 的死账本引用改读归档账本；golden-ci 继续负责重渲染的逐字节 diff。
- 修 `39-macro-b-one-shot.mjs`，按 `audit.ts` 同源供 `intake_health`；不放宽 workflow 断言。
- 报告溯源串改指仓内 contract fixtures 与归档索引；同步再生受影响的 golden。
- 版本走 0.3.0（Node 支持面是用户可见契约，不用 patch 藏掉）。

## Considered Options

- **保留 Node 20 + 三条守卫加版本闸 SKIP**：继续宣称支持已 EOL 的版本，CI 长期带三个 SKIP，且"跳过不算红"会再次变成盲区。
- **确认 registry 冻结、停止活守卫断言**：五个活守卫已经在消费它，冻结等于把活契约判死。
- **放宽 `intake_health` 断言接受 null**：会把"证据缺席"洗成通过，违反 Sufficiency Gate。
- **全量改写 1169 处 D-code 引用**：宽重构，收益低；归档索引 + 历史指纹政策足够。

## Consequences

- CI 从 6 腿（20/22 × 3 OS）变为 6 腿（22/24 × 3 OS）；Node 20 不再被宣称支持。
- 文档改动进入 CI 门禁；新增一个单腿 workflow，不占用 engine-ci 六腿。
- 三个新/重建守卫：docs-authority、registry 一致性、23-first-report。
- 版本 0.3.0；不打 tag、不 push，发布动作仍走用户闸门。
- **勘误（2026-10-26 / #29）**：本 ADR Decision 的「报告溯源串改指仓内 contract fixtures 与归档索引」一条与 D-083⑤（`71-check` E1：`engine/{src,skills}` 禁指本仓 `docs/` 树，理由=`docs/` 不随包分发）互斥——成文时未与该守卫对账，落地即红。裁定：该守卫禁的是**依赖与运行时读取**，不是**引文坐标**；溯源串是给读者解析出处的字符串，引擎不 deref 它。故 `71-check` E1 的豁免收窄放行 `docs/archive/decisions/` 一处，其余 `docs/` 仍禁（运行时读写与 `import` 归档目录仍红——读侧依据本 ADR，写侧依据 [`ADR-0025`](0025-authority-carriers-and-historical-fingerprints.md) Decision 的「声明非权威、只读」，本守卫把该声明落到引擎 I/O 面；E1-P 八样本判别臂机检）；账本行（`D-034`／`D-049`）因此仍作一手出处，不降级为契约件里的二次引用。
- **口径补记（#29）**：上述溯源串是**出处坐标**，不是裁决输入——裁决输入是 `criterion_ids` 与判据冻结件；归档账本因此不获得现行裁决权，[`ADR-0025`](0025-authority-carriers-and-historical-fingerprints.md) 的「`docs/archive/decisions/` 不参与现行裁决」不变。本票再生的只有 `48-micro-a-golden-*` 八件（`--golden` cassette 回放，确定性可重算）；其余带 `.scratch` 的报告件——`38-macro-c-preview-{report,failure}.{md,json}`、`38-macro-c-measurements.json`、`38-macro-c-facts.jsonl`，以及 `48-micro-a-*`（非 golden）的真实跑存档——都是**历史采集现场**，仓内无对应生成器或需真网络重放，按 ADR-0025 保留原始现场（含 `.scratch` 与绝对路径），**不属「同步再生受影响的 golden」范围**。
