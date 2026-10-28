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
- **勘误（2026-10-26 / #29）**：本 ADR Decision 的「报告溯源串改指仓内 contract fixtures 与归档索引」一条与 D-083⑤（`71-check` E1：`engine/{src,skills}` 禁指本仓 `docs/` 树，理由=`docs/` 不随包分发）互斥——成文时未与该守卫对账，落地即红。裁定：豁免放行的是**引文坐标**（报告里供人回查的路径字面量）；证据抽取本身确实会 `readFileSync` 该文件——那是任何 evidence 锚固有的读取，非本豁免新增的依赖类别（改指前读的是已退役的 `.scratch/…`，同样不在包内且文件已不存在），读不到时 `addEvidence` 捕获并落 `grounded=false`，不静默通过。故 `71-check` E1 的豁免收窄放行 `docs/archive/decisions/` 一处，其余 `docs/` 仍禁（运行时读写与 `import` 归档目录仍红——写侧依据 [`ADR-0025`](0025-authority-carriers-and-historical-fingerprints.md) Decision 的「声明非权威、只读」，本守卫把该声明落到引擎 I/O 面；E1-P 判别臂（正负样本对照）机检）。**边界**：E1 是行级守卫，看不到经变量间接传入的读取（如 `addEvidence(EV(4), LEDGER_PATH, …)`），该面由 `grounded` 如实降级兜底，不宣称被 E1 覆盖；账本行（`D-034`／`D-049`）因此仍作一手出处，不降级为契约件里的二次引用。
- **口径补记（tracker #29）**：上述溯源串是**出处坐标**，不是**判据输入**——裁决输入是 `criterion_ids` 与判据冻结件。但「归档完全不参与现行裁决」要按层分写才与现状同名：**band 层成立**（实测六条判据的 `anchored_evidence_ids` 只引 EV(1)/(2)/(3)，无一条引 EV(4)/(5)，归档取不到引文不移动任何 band）；**claim 支撑层不成立**（上一条已承认 `readFileSync` 该文件，而 `engine/src/report/citation.ts` 把 `!grounded` 直接映射成 `support:'insufficient'`）。降级范围按成因分写，不笼统说「两条」：**分发态**（`docs/` 与 `engine/test/` 双双不在包内）EV(4) 与 EV(5) 同时失败 → `CL-…-04`／`CL-…-05` 两条评级同降；**仅缺归档账本**时只 EV(4) 降，EV(5) 读另一件判据 fixture 可仍 grounded；拒绝件的 `CL-…-REF-03` 在归档**在场**时即已 `insufficient`（被引约束句是否定语境），那是引文选行的事实问题，不计入「降级」。[`ADR-0025`](0025-authority-carriers-and-historical-fingerprints.md) 的措辞据本条补分层，不再笼统说「不变」。本票再生的只有 `48-micro-a-golden-*` 八件（`--golden` cassette 回放，确定性可重算）；其余带 `.scratch` 的报告件——`38-macro-c-preview-{report,failure}.{md,json}`、`38-macro-c-measurements.json`、`38-macro-c-facts.jsonl`，以及 `48-micro-a-*`（非 golden）的真实跑存档——都是**历史采集现场**，仓内无对应生成器或需真网络重放，按 ADR-0025 保留原始现场（含 `.scratch` 与绝对路径），**不属「同步再生受影响的 golden」范围**。
- **可复现范围（tracker #29 实测）**：新锚点只在**本仓源码检出**内可解析——`engine/package.json` 的 `files` 不含 `docs/` 与 `engine/test/`（`npm pack --dry-run` 实测 0 件命中），安装态插件里 `sourceRepoRoot()` 返 null，EV(4)/EV(5) 按上一条如实落 `grounded:false`。即「出处可复现」当前达成范围＝源码检出，不是分发态；扩到分发态需随包分发归档账本（实测约 +989KB）或把锚点迁至随包目录，属打包与产品面决策，另票裁。另记：`git log -1 --format=%h -- <判据件>` 在**浅克隆**下会把该文件归到边界 commit，`PREREG_COMMIT` 与 receipt 摘要随克隆深度而变——该脆弱性在改指前的 `.scratch` 路径上同样存在（`git log` 对已删除路径仍返回末次触碰 commit，两侧同为 `e356581e`），非本票引入。**已修法＋已守卫（tracker #100）**：取值前先验克隆深度，浅克隆、安装态无源码仓根、深度判不了（git 缺席或老于 2.15 不认 `--is-shallow-repository`——`isShallowRepo` 走 `gitOk`，判不了是**抛出**而非返回 false，本函数在模块加载期被调用，抛出等于拖垮整条 Micro-A 面，故接住转降级）三态都不返回边界 commit，而落 `degraded:` 显式标记；形态要求与「全量历史属受支持运行形态、浅克隆不属」的裁定单源在 [`docs/spec.md`](../spec.md) 的 R9-1，本条不复述正文。证明面：负对照＝`engine/test/micro-a.test.mjs` S 组（现场合成两枚 commit 的仓再 `--depth 1 --no-local` 真传输克隆——前提臂先钉住「裸命令在该形态下确实取到边界 commit」，否则负对照只是恒真的空跑；local-path 克隆会静默忽略 `--depth`），跨发出面静态机检＝`85-check` A17，产线拒收模糊态＝`engine/test/report-preview.test.mjs` P3/P4。
- **未清面 → 已归位（tracker #29 审查登记；tracker #100 落地）**：`gate_ref.prereg_commit` 的 Macro-C 面值原为 `38-script-const`——从 `38-macro-c-preview-report.json` 逐字移植的**存档字面量**（同形先例 `demo.ts` 的 `45-demo-criteria`），仓内无定义处、不可解析为 commit。现两枚发出值各取 `sentinel:38-script-const`／`sentinel:45-demo-criteria`（形态口径见上一条指的 R9-1，本条不重述）。**存档件仍不改写**：`38-*` 冻结件逐字保留裸 `38-script-const`——它正是该字面量的出处，按 [`ADR-0025`](0025-authority-carriers-and-historical-fingerprints.md) 的历史指纹政策字节零动，改值反伤 historical 语义；`51-macro-b-*`／`23-first-report` 的存档件同理不动，只把 `51-macro-b-behavior.mjs` 的**生成子**改为合规形态（下次真跑即产 `degraded:` 标记，不是裸 `unanchored`）。
- **tracker #47 复盘增补（2026-10-26）**：文档权威守卫在四项成员断言之上增加两条——拒绝 `§D-NNN` / `§A-NNN` 形式（2+ 位）的退役码死锚（1 位的 `§D-1` / `§D-2` 是 ADR-0018 节号，不在此列），以及门面文书不得自称权威（专题「唯一权威」按 `docs/authority.md` §2 白名单判定）。执行面见 `engine/test/contracts/docs-authority-check.mjs`，CI 单腿见 `.github/workflows/docs-ci.yml`。
