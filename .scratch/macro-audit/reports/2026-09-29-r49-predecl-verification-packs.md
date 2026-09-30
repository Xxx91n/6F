# 轮49 T1 预声明验证包（D-177 工序承载——先于变更 commit 落盘）

> 生效法源：D-177①（声明锚=先落物化面——账行/报告节/独立预声明文件均合法；本件取独立文件形态）；D-177②（红态诱导面实跑必选——未跑=缺件处置）。
> 适用实例：本批为 D-177 生效后首个适用实例（D-179⑤ 点名）。覆盖两包——T1-B（46-check parse 档闸，探测面修语义）与 T1-F（D-179 种子化＋豁免清单＋两跑零 diff，源码面修语义）。
> 时点锚：本文件 commit 先于一切被声明变更的 commit；实跑读数入轮49 exec 报告对应节。

## 包A——T1-B：46-check A18 workflow parse 档病态闸（D-176②）

**变更面**：`.scratch/architecture-recovery/reports/46-check.mjs` 增 A18 断言（组 A 尾部）。

**预声明断言**：扫 `.github/workflows/*.yml` 全件，检出「键行未引号 plain 标量内含 `: `（冒号+空白）」病态模式——即 L144 macro-b 死件同型（YAML 解析级失败点）。检出=列文件名+行号+行摘即 FAIL。

**构造输入（红态诱导，实跑必选）**：
- 病态样例行 `- name: verify report artifacts (three-check: present + JSON parse)` → 预期检出（sick 集非空）；
- 负对照样例：引号包裹值（`name: "a: b"`）、块标量（`run: |`）、注释行、非键行（shell 行/裸文本）、行尾注释剥离后净值 → 预期零误报；
- 实跑读数：node 内联驱动同一检测谓词对上述样例逐条读数，入报告附命令行与输出。

**绿判据**：修复后三 workflow 文件全过 → `node .scratch/architecture-recovery/reports/46-check.mjs` → exit 0 且 PASS N/N（A18 计入分母）。

**边界声明**：不动 A1~A17 与 B~E 组语义；零三方依赖手写结构闸（默认形态——D-176 scoping 登记：yaml 包升格须独立 commit 走 D-139）。

## 包B——T1-F：D-179 守卫伴生再生减负包

**变更面**：
- `.scratch/architecture-recovery/reports/_lib/check-kit.mjs` 增共享原语 `deterministicRunAt()`（SOURCE_DATE_EPOCH 式 env 注入；env 缺席=固定默认 epoch 不取墙钟）；
- `48-micro-a-preview.mjs` / `56-checker-heldout-eval.mjs` 的墙钟熵源（`new Date().toISOString()`）改调共享原语；
- 新件 `volatile-fields.json`（断言面键级豁免枚举）＋ `d179-check.mjs`（断言件本体，TIER=portable/PROTECTED_SURFACE 自声明随行）。

**预声明断言组**：
- A1 清单建制：volatile-fields.json 在＋version/decision_ref 字段＋keys 为非空字符串数组＋frozen_exclusion 声明在＋enumerated_artifacts 枚举在；
- A2 键级可达性棘轮：keys 逐键在 enumerated_artifacts 键空间（含嵌套/JSONL 行）出现≥1——死项即红（75a-S1/D-154③ 同构）；
- A3 派生信号族禁入：keys ∩ derived_signal_banned = ∅＋banned 键在工件键空间确实存在（反空虚校验——禁令非空转）；
- A4 frozen 禁区：enumerated_artifacts ∩ known-red-manifest frozen-01-series 五件 = ∅（D-171/D-172②）；
- B1 同输入两跑零 diff：56-checker-heldout-eval.mjs 两跑产出字节等值；
- B2 同输入两跑零 diff：48-micro-a-preview.mjs --golden 双 tmpdir 两跑全件字节等值（Bazel null-build 同构）。

**构造输入（红态诱导，实跑必选）**：对 56 eval 以不同 SOURCE_DATE_EPOCH 值两跑→产出 diff 非零（证明比对通道可火、断言非恒真）；同 env 两跑→diff=0（绿）。

**绿判据**：`node .scratch/architecture-recovery/reports/d179-check.mjs` → exit 0 且 PASS N/N；`guard-all-run.mjs` 全量相容（新件自动入列枚举）。

**语义边界（D-179⑧）**：golden 断言语义／frozen 钉值／批2-β 触发器全不动；prereg_commit/head_sha/commit_anchor 等 git 派生信号字段不在豁免面（真实语义变化合法漂移）。

**再基线预期**：种子化后首次再生产出一次性确定性基线位移（挥发值落定固定 epoch）→ 归独立 bundle commit（D-140②）；其后同输入零 churn（12~14→0 或仅真实语义变化件——D-179⑦ 复验口径）。

**负向随行**：禁自动 discard 任何形态（D-179④ 显式驳回——绕开 D-140② 记账面=证据完整性反模式）；禁种子化做成隐藏开关（确定性=默认行为非 flag）；禁借本裁改 golden 断言语义。

## 勘误（轮49 审计 LOOP 补录于 2026-09-30——D-146⑤ 链式注记，不改原行）

审计呈报 F2：本包（D-177 首个适用实例）声明面与落地存在三处名实缝隙，原行保留照此注记：

- 包B 变更面声明 `_lib/check-kit.mjs` 增 `deterministicRunAt()`，实落 `_lib/env-contract.mjs`（env SSOT 名义上更贴；声明件与实际载体不符）。
- 声明断言组=A1~A4＋B1/B2，实落多出未声明的 A5 熵源钉（zxu commit body 有载、声明件无）。
- prereg_commit 语义变更（运行时 HEAD→criteria 判据锚 3e588e02）超出 D-179① 名义变更面；本包将其列为「派生信号合法漂移」（不计豁免），但改动字段本身=声明外扩面——执行报告 §6「追加发现」节已透明披露，此处补正式勘误链。

教训→轮50 grill 候选②：冻结声明件内发现扩面时的合规通道（声明件勘误追加 vs 变更 commit body 显式扩面声明）——本注记=先例形态①。

### D-181 通道正式化补录——轻档（轮50 文书批，2026-09-30——append-only，上列原行零改写）

按 D-181③「被验证命题变更测试」分级。发现时点均=**post-hoc**（执行中发现／审计 LOOP 呈报识别——D-181② 显式例外条款适用，诚实晚声明）。

**轻档条目（①——索引批注形态，D-181③ 纯实现层名实缝）**：

| # | 扩面描述 | 强度分级 | 命题变更测试理由 | 变更 commit 指针 |
|---|---|---|---|---|
| ① | 载体漂移：声明 `_lib/check-kit.mjs` 增 `deterministicRunAt()`，实落 `_lib/env-contract.mjs` | **轻档**（索引批注） | 纯实现层名实缝——载体位置不改被验证命题 | `0a68d41a`（D-179 建制语义 commit） |

**「首例即定形」注记**（D-181⑤）：本批缝隙=扩面勘误通道首个自然适用例，分级判据与字段形态按本通道立法定形；原合规判定不翻案（D-148③）。后续扩面照此形：重档→独立勘误 commit；轻档→commit-body＋本节索引批注。

**声明原文零改写自证**：本补录前文件 sha256=`966c7e7f6cad88ee1607e1248b5c4b0fd6809d768d908aa9f7e8de8f5a20ff1d`（append 前字节快照）；补录仅追加节，上列「勘误（轮49 审计 LOOP 补录…）」节与包A/包B 声明正文逐字保留。

> **重档条目②③另置独立勘误 commit**（D-181③/D-181⑤：重档=独立勘误 commit 强制）——见后续 append-only「重档勘误条目」节。

### 重档勘误条目（D-181③/D-181⑤——独立勘误 commit，2026-09-30 post-hoc）

按命题变更测试，下列条目改被验证命题（断言集/锚语义）→ **重档=独立勘误 commit 强制**。发现时点=post-hoc（审计 LOOP 呈报识别）。本 commit 即为该独立勘误 commit。

| # | 扩面描述 | 强度分级 | 命题变更测试理由 | 变更 commit 指针 |
|---|---|---|---|---|
| ② | A5 熵源钉增项（声明 A1~A4+B1/B2，实落多 A5） | **重档** | 改被验证命题=断言集扩展（冻结声明钉住的断言集） | 0a68d41a + c6cb5a33（A5 换调 stripComments） |
| ③ | prereg_commit 锚语义变更（运行时 HEAD→criteria 判据锚 3e588e02） | **重档** | 改被验证命题=锚语义 | 0a68d41a |

**post-hoc 标位**：两条款均在执行中/审计时发现，适用 D-181② 显式例外（变更后立即落勘误＋post-hoc 如实标）。

**分级理由**：②断言集扩展=冻结声明命题面变更；③锚语义变更=被验证命题的锚定义变更。二者均非纯实现层名实缝。
