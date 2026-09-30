# D-192 预声明验证包 —— commit 指针守卫件 84-check 四态 fixture 与 baseline 册 schema

> 落盘时点：R52 T1-A 执行批，**先于** 84-check.mjs 与 known-pointer-violations.json 落盘（D-177① 时序可证——声明物化于先于变更 commit 的独立承载面）。
> 立法依据：D-188④⑤（机检三项义务＋法定形）／D-189③⑧（严格层位形封闭枚举＋机检口径）／D-190③④⑥（锚线声明制＋可达性人工复核边界）／D-191③（存量两级判级）／D-192①~⑤（baseline 册制＋扫描面封闭枚举＋孪生分桶＋册项勘误关联＋入列路径）。
> 生效时点：条文面自 D-188 收口 commit 起生效（D-148③）；本守卫件自其落盘 commit 起生效，落盘 commit 自身豁免。

## 1. 扫描面封闭枚举（D-192②——立法钉清单，扩面走立法票 D-095 语义）

| 面 | 路径 | 面态 |
|---|---|---|
| S1 | `.scratch/macro-audit/**`（决策账本／handoffs／reports／audits／trials／spec-phase-tasks） | 全检 |
| S2 | `.scratch/architecture-recovery/**`（账本／WORKFLOW／BACKLOG／handoffs／reports／issues／prompts） | 全检 |
| S3 | `docs/adr/**` | 全检 |
| S4 | `CONTEXT.md` | 全检 |
| S5 | `AGENTS.md` | 全检 |
| EXEMPT-SUB | `*atomcode-research*.md`／`*research-prompt*.md` 存档件 | **WARN-only 豁免子面**（存档件自体含 SHA 讨论不可规避；命中降 WARN 不判 FAIL） |
| EXEMPT-DIR | `node_modules/`／`.git/`／`dist/`／`reports/_retired/`／`reports/40-clone-cache/`（third-party clone 面） | 不扫 |

**扩面禁令（D-192② 负向）**：扫描面开放增长＝违规。守卫自身以 `SURFACE_CLOSED=1` 硬编码枚举；增删任一面须先走立法票。

## 2. 严格层位形封闭枚举（D-189⑧——机检口径：列头白名单＋锚定正则＋括注位模式）

严格层=职能上「唯一/首要定位一个 commit」的位置。机检近似职能（非语义理解），三条通道：

**通道 A｜表格列头白名单**（命中列单元格全文入严格层）：

`变更 commit 指针`、`变更 commit`、`原模糊指针`、`归属 commit`、`分支/commit`、`Test commit`、`Impl commit`、`闭环 commit`、`git 短 hash（可 cat-file -e）`、`git 短 hash`、`commit 指针`

**通道 B｜锚定正则**（表格所在小节标题命中 → 该表全部单元格入严格层）：

`T3 .*(哨兵|读数)` —— 对应 D-189⑧ 枚举之「T3 表 commit 指代列」（列头语义不可靠时以小节锚定代偿）。

**通道 C｜括注位模式**（列表行行首标签命中 → 该行入严格层）：

`^\s*[-*]\s*(变更|修复|落地|收口|定点|固定点)?\s*commit\s*(指针)?\s*[:：]` —— 对应 D-189⑧ 枚举之「账行与表格内唯一指代手段括注」。

**宽层（非机检面，D-189⑧ 负向：禁借本裁对宽层散文背核验税）**：叙述段／调研结论段／决策账行正文的 SHA 任意位数提及自由；裸短码仅当同记录内存在严格层合法指针承载同一指代时自由。宽层残留由审计窗人工抽查（D-188⑥ 机检前过渡面职责）。

## 3. Fixture 集——四态红绿分野（预声明期望，变更后须逐条实测）

### F-01 合法形 PASS（通道 A｜严格层列）

输入行：`| 变更 commit | `cb625c64521398306f914eb7986a4a505f95291a` ("fix(D-184/审计返工): F-09 成员集＋attributed 机检可红＋指针 git hash 实名＋打包口径更正") |`
期望：**PASS**——SHA ≥12hex ✓／带 `("subject")` 人读校验位 ✓／`cat-file -t` = commit ✓。

### F-02 新违规 FAIL（通道 A｜严格层列 + 册外）

输入行：`| 变更 commit | `9f1234567890abcdef1234567890abcdef12345678` ("docs: 虚构 subject 但对象不存在") |`
期望：**FAIL** slug=`PV-NONEXISTENT-SHA`——40hex 形但 `cat-file -t` 空（E-3 幻觉 hex 族），且**不在册**。

### F-03 baseline 命中 WARN（通道 A｜册内 + 短 SHA 族）

输入行：`| 变更 commit | `da0c25a9` |`
期望：**WARN**（非 FAIL）slug=`PV-BASELINE-HIT`——位数 <12 且缺 subject 校验位，属册内存量条目（`da0c25a9` 关联 §7 补钉表）。断言：rc 仍为 0（册内不判红）。

### F-04 孪生告警 WARN（通道 A｜同 change-id 分桶）

输入：同一 fixture 文档内并列两个同 change-id 的不同 commit（`201935fc` 与 `cb625c64521398306f914eb7986a4a505f95291a`，同 change-id `nktntvkkwqtrnqxwmtokzulttpowxnpp`）。
期望：**WARN** slug=`PV-TWIN-BUCKET`——桶成员数 >1，风险披露非违规（D-190④ 既定 WARN 位）。断言：仅 WARN 不判红。

### F-05 裸短码 FAIL（通道 A｜D-188③ 短码禁令）

输入行：`| 变更 commit | wmu（check-kit regex 态） |`
期望：**FAIL** slug=`PV-BARE-SHORTCODE`——GitButler 3 字母 UI 便利码单独承担定位，且不在册。

### F-06 模糊语 FAIL（通道 A｜D-188④）

输入行：`| 变更 commit | 本轮修复 commit |`
期望：**FAIL** slug=`PV-FUZZY-PHRASE`——无可实证指针形态，且不在册。

### F-07 孤儿孪生 WARN（可达性人工复核边界——D-190④）

输入：严格层 SHA 存在但 `merge-base --is-ancestor <sha> <锚线>` 非零。
期望：**WARN** slug=`PV-UNREACHABLE`——**禁判 FAIL**（GitButler 虚拟栈 merge-base 语义不稳，主锚线可达性留人工复核非机检）。

### F-08 豁免子面降级（EXEMPT-SUB）

输入：`*atomcode-research*.md` 内严格层形态命中。
期望：降 **WARN** slug=`PV-EXEMPT-SUBFACE`，**禁判 FAIL**（D-192② 豁免子面）。

### F-09 册项失配自报移除（ratchet 只减不增）

输入：册内条目其 `pattern` 在实物面已无命中。
期望：**WARN** slug=`PV-STALE-ENTRY`＋自报「可移除」提示；**禁判 FAIL**（D-192① 失配=自报移除提示，禁把清理当违规）。

### F-10 册护栏自断言（D-192④ 防大赦名单化）

断言 A：册内每条 `errata_ref` 非空且其引用锚文本在所引文件实物可解析（禁无勘误引用条目）。
断言 B：册内 `pattern` 不得含行号形态（`L<数字>`／`:行号`／`第 N 行`）——禁行号定位。
断言 C：扫描面枚举封闭性——`SURFACE_CLOSED=1` 且五个根路径逐件 `existsSync` 断言。

## 4. baseline 册 schema 预声明（D-192①——三字段，禁行号定位）

载体：`.scratch/architecture-recovery/reports/known-pointer-violations.json`

```json
{
  "version": 1,
  "policy": "ratchet-only: 册只减不增；新增条目须审计窗裁例有 D-181 勘误依据；行仅由守卫首跑或审计窗裁例写入",
  "anchor_decl": { "note": "默认锚线=文书落盘分支栈 tip（WORKFLOW 4.2.10-7）；跨线须具名声明", "lines": ["HEAD", "main"] },
  "entries": [
    {
      "id": "PV-01",
      "file": ".scratch/architecture-recovery/reports/D-177-check-kit-regex-predeclaration.md",
      "pattern": "bare-shortcode:wmu（check-kit regex 态）",
      "errata_ref": ".scratch/architecture-recovery/reports/D-177-check-kit-regex-predeclaration.md §7 勘误指针补钉（E-1 同链）"
    }
  ]
}
```

字段口径：

- `id`：册内稳定序号（仅供人工指认，不参与匹配）。
- `file`：仓根相对路径（posix 分隔符）。
- `pattern`：**内容模式指纹**＝`<kind>:<原文 token>`（kind ∈ `bare-shortcode`｜`fuzzy-phrase`｜`short-sha`｜`missing-subject`｜`nonexistent-sha`）——PHPStan 式 message 指纹抗漂移（per D-192① 调研实证），**禁行号定位**。
- `errata_ref`：D-181 勘误行锚（文件＋小节/条目标识；禁裸行号，须可被 F-10 断言 A 实物解析）。

## 5. 判级矩阵（首跑判级——D-191③ 存量 WARN／新增 FAIL）

| 命中形态 | 册内 | 册外 |
|---|---|---|
| 严格层裸短码／模糊语／位形不足／幻觉 SHA | WARN（`PV-BASELINE-HIT`） | **FAIL** |
| 锚线不可达（孤儿孪生） | WARN（`PV-UNREACHABLE`） | WARN（同左——可达性非机检面，不因册外升红） |
| 同 change-id 桶 >1 | WARN（`PV-TWIN-BUCKET`） | WARN（同左） |
| 豁免子面命中 | WARN（`PV-EXEMPT-SUBFACE`） | WARN（同左） |
| 册项失配 | WARN（`PV-STALE-ENTRY`＋可移除提示） | N/A |

**口齿纪律**：rc≠0 仅由「册外 FAIL 类」触发；任一 WARN 态不得影响 rc。

## 6. 复验钩（变更后勾销）

- [ ] F-01..F-09 九态 fixture 红绿分野实跑读数在场（命令＋输出摘要）
- [ ] F-10 三条册护栏自断言实跑在场
- [ ] 首跑存量判级：册内 WARN 清单落盘（存量普查判级输出，D-191③）
- [ ] 零新增 FAIL（若非零，须先裁定：修真坏 or 走审计窗裁例入册）
- [ ] guard-all-run 动态枚举实测绿（新 check 自动入列，D-149④ 升格判据）
- [ ] D-149 入列账行登记

## 7. 勘误（D-181 append-only——不改写上文原文）


> **发现时点**：post-hoc（2026-09-30 R52 审计窗打回，报告 `reports/2026-09-30-r52-audit-report.md` §4 逐条实测）。以下九条为「实现已偏离本件声明」的逐项对照（D-181 append-only，不改写 §1~§6 原文）。**处置原则：P1/P2/P3/P7 回改实现贴合声明（守严不扩面）；P4/P5/P6/P8/P9 补勘误登记并附实现事实。**

| # | 本件声明 | 实现事实 | 处置 |
|---|---|---|---|
| P1 | §2 通道 A 列头白名单 **11 项** | 实现 `STRICT_HEADERS` 曾为 12 项（多 `git hash`） | **已回改**＝11 项，删 `git hash`；`CHANGELOG` M-052 与 `next-round.md` 中「11 项」表述自此属实 |
| P2 | §1 EXEMPT-DIR＝`node_modules/.git/dist/reports/_retired/reports/40-clone-cache`（`reports/` 路径锚定） | 实现曾为 `SKIP_DIRS` 6 项裸名（多 `repomix-output`，全仓不存在）＋裸名任意深度豁免（宽于声明） | **已回改**＝`SKIP_DIR_BARE`（`node_modules`/`.git`/`dist` 三项裸名）＋ `SKIP_DIR_ANCHORED`（`reports/_retired`、`reports/40-clone-cache` 两项路径锚定），删 `repomix-output` |
| P3 | §4 schema 例 `anchor_decl.lines = ["HEAD","main"]` | 册实物为 `["main","HEAD"]`（序反转，语义无害） | **已回改**＝`["HEAD","main"]` |
| P4 | §4 册 schema 顶层＝`version`/`policy`/`anchor_decl`/`entries` | 实现增 `first_run` 顶层字段（首跑溯源：轮次/守卫/预声明件/建册方法/勘误链） | **保留为 additive 偏离**——溯源价值高于 schema 洁净；顶层字段集以本勘误行为准（`version`/`policy`/`anchor_decl`/`first_run`/`entries`） |
| P5 | §3 fixture F-01..F-10 | 实现为 F-01..F-**12**（增 `PV-G-F10-BOOK-KEY-ROUNDTRIP`、`PV-G-F11-KIND-REACHABLE`、`PV-G-F12-LINENO-DETECT`） | **保留为 additive 偏离**——F-11/F-12 为审计返工新增反例（kind→slug 对表／行号形态），登记后 fixture 面＝**F-01..F-12 十二态**；原「四态＋六衍生态」提法作废（4+6=10≠12），正确表述＝**四态＋八衍生态** |
| P6 | §3 F-02 输入 `9f1234567890abcdef1234567890abcdef12345678` | 该串实测 **42 hex**（非 40），落不进 `/^[0-9a-f]{7,40}$/`；实现静默换用 `cb625c64521398306f914eb7986a4a505f95291b`（40 hex，`cat-file -t` 空） | **输入替换并登记**——原串因长度错写失效；替换后仍满足 F-02 命题（册外 40-hex 形 ＋ 对象不存在＝E-3 幻觉 hex 族）。**教训**：hex 长度不可凭直觉，全 hex 一律 `git rev-parse` 实证 |
| P7 | §1 EXEMPT-SUB＝`*atomcode-research*.md`／`*research-prompt*.md`（文件名锚定） | 实现 `EXEMPT_SUB_RE=/(atomcode-research|research-prompt)/` 未锚扩展名与文件名——路径任意段命中即豁免（目录名同形亦豁免） | **已回改**＝`isExemptSub()`：`basename.endsWith('.md')` ∧ 词命中 |
| P8 | §3 F-10 断言 B 禁行号**三形态**（`L<数字>`／`:行号`／`第 N 行`） | 实现正则缺 `file.md:123` 形（冒号行号）——**防大赦护栏实有漏检**；首版补入 `:[ ]?[0-9]+` 后误伤 schema 分隔符（`short-sha:201935fc` 中 `:2019` 命中） | **已回改为四形态**＝`[.](md|json|mjs):[ ]?[0-9]+`｜`L[0-9]+`｜`行号`｜`第[ ]?[0-9]+[ ]?行`；正则提至模块级 `LINENO_RE` 供 fixture F-12 反例共用 |
| P9 | §3 F-07 期望「WARN slug=PV-UNREACHABLE——禁判 FAIL」 | fixture 原仅断 `anchorReach()` 返 null，**未路由 `judge()`** 证明不产 FAIL（实际因该指针 kind 恒非 FAIL 类而侥幸成立） | **已补**＝F-07 经 `judge()` 路由演练并断 `FAIL 0 ／WARN 1`；注：该 fixture 指针为 40-hex 无 subject，kind=`missing-subject`，册键须按该 kind 构造（原先按 `short-sha` 构造导致误红） |
- **勘误链续**：本节后续追加见 `known-pointer-violations.json` 的 `errata_ref` 列（PV-01..PV-17 ↔ 账本 E-4..E-9）。

---

**声明面**：本件为 D-192⑤ 入列路径的预声明腿（D-177①）。扫描面枚举、fixture 四态期望、册 schema 三项均为**预声明内容**，任何实现与本件不一致处按 D-181 通道追加勘误，不回改原文。

