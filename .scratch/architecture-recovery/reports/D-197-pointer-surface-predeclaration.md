# D-197①②＋D-200＋D-201② 指针守卫机检面批——D-177 预声明验证包（轮 54 T1-B 执行批）

> 预声明件：先于 84-check 语义变更 commit 落盘（D-177①「时序可证」——本件 commit 与实现 commit 在 git log 中前后相接，预声明在前）。
> 欠账三要素（D-170③）：owner=执行批（R54 T1-B）｜时点=轮 54 执行窗｜复验=实现后 84-check 新断言 PASS＋guard-all-run 全量绿＋反向闸存量入册 WARN 零 FAIL。
> 覆盖裁定：D-197①（立法票扩列 STRICT_HEADERS）／D-197②（内容驱动反向闸）／D-200（D5/D6/D7 三收紧）／D-201②⑥（PROTECTED_SURFACE 补句＋册归零断言语义）／D-199③（同窗 PV-F10D 守恒复跑）。

## 1. 变更面封闭枚举（预声明钉）

| 件 | 变更类别 | 说明 |
|---|---|---|
| `reports/84-check.mjs` | 探测面语义变更 | 本包 §2~§8 全部落此件；PROTECTED_SURFACE 更新随件 |
| `reports/known-pointer-violations.json` | 册工作面（非探测面） | T1-A 收敛摘除（D-199③ 只删不增独立 commit）与反向闸首跑存量入册（D-197②，D-181 勘误依据）分管 |
| 扫描面（SCAN_ROOTS/SCAN_FILES/SKIP/EXEMPT） | **不动**（D-198① 扫面维持裁定） | SURFACE_CLOSED=1 维持；宽层散文不背税（D-189②）不变 |

## 2. 立法票扩列 STRICT_HEADERS（D-197①，D-095 通道）

新增 7 列头（normHeader 精确匹配）：`commit`／`SHA`／`commit hash`／`commit SHA`／`指针`／`SHA-1`／`hash`。
依据：`commit`/`SHA`=E-11 实证欠列两例（R52 执行批报告变更文件清单 `| commit |` 列＋OS temp 交接件 commit 序 `| SHA |` 列）；同义词族按 D-197①「实证或高频形态口径」收编（commit hash/commit SHA/指针/SHA-1/hash）。canonical 列头纪律=WORKFLOW §4.2.10-10。既有 11 列头一字不动。

## 3. 内容驱动反向闸（D-197②）——新增违规 kind 两族

作用域：不入 STRICT_HEADERS 白名单且非小节锚定的表格单元格（反向闸只补位形判定，不替代法定形校验——D-197 负向「两层并存」）。

- `misplaced-pointer`：单元格为**指针负载形**且含 `git rev-parse --verify` 可解析为 commit 的 hex token（7~40 hex）→两级判级=册内 WARN（PV-BASELINE-HIT）／册外 FAIL（PV-MISPLACED-POINTER）。
- `misplaced-unresolvable`：同位形 hex token 不可解析（含幻觉形）→**恒 WARN**（PV-MISPLACED-UNRESOLVABLE，禁判 FAIL——不可解析对象无从锚定，同 D-190④ 人工复核面）。
- **负载判据（机检近似，非语义理解）**：单元格剥离反引号与空白后整体为「纯 hex token」或「hex token＋("subject") 法定/非法形」——即该格载荷就是指针本身。混合散文格不判（E-11 病灶=纯指针格置于裸列头；宽层散文不背税 D-189②）。
- slug 表 SLUG_BY_KIND 扩两键（PV-D3 覆盖断言随动）；反向闸 WARN 面=扩列票天然候选清单源（D-197④）。

## 4. D5 收紧：bareCodes 短码判据升级（D-200）

- 首位裸短码规则收紧：`[a-z]{3}` 首位 token 仅当**后随全角 `（` 或半角 `(`**（GitButler UI「短码（说明）」形态，D-188③ 注释原文）才判 bare-shortcode；后随空格＋散文不再判（消除任意三字词首位误报源）。
- 豁免集：ROMAN 同型新增 WORDS 集（D-200 裁定「英文实词入 ROMAN 同型豁免集」）。词表=常用英文词＋本仓高频三字缩写（git/cli/api/url/uri/sha/hex/mjs/css/dom/npm/e2e/tdd/llm/sdk/sql/dev/env/obj/val/var/len/idx 等）。实现注记：虚词高频例（the/and/for/not 等）同为误报源且实词/虚词界线机检不可辨，按「真英语词非码」口径一并收编并在此如实登记；wmu/kmk/qmw/rkm 非英语词不豁免（存量检出能力不回归——G-F05/F11 负例保留验证）。
- 括号内规则与关键词后随规则（`commit `/`分支 `/`branch `）保留，同受 WORDS 豁免。

## 5. D6 收紧：splitRow 首尾管可选＋fence 排除（D-200）

- splitRow：首管与尾管均可选（GFM 合法形态）——修复「行尾无管时末格被 slice 截断吞载」的漏报型缺陷（FN 静默族，D-200 定性「机检漏报型缺陷不可留登记态」）。
- strictCells 扫描增加 fence 状态机：三反引号／三波浪线围栏行翻转、围栏内全部表格形态伪行不解析（围栏内 `|---|` 误喂消除）；`#` 行排除维持现状。

## 6. D7 收紧：空 subject 拒收＋零反斜杠收尾（D-200）

- hasSubject：`("…")` 引号内非空白必填——`("")`／`(" ")` 空校验位形态拒收（判 missing-subject）。
- '\' 孤例字面量消除：`split('\\')` 两处（:89/:104 路径分隔）改 `String.fromCharCode(92)`——全文件达成声明态「零反斜杠」（W2-#02/W3-#09 教训闭环；写 .mjs 零反斜杠纪律自此全量可自证）。

## 7. 册归零断言语义（D-201②——判据澄清非通道剥夺）

册 entries 收敛至 0=T1-A 合法终态（D-201①：归零=例行收敛事件，不构成 D-160① 任一消亡判据事件）。断言适配三件（守恒公式不变）：

- PV-D2-BASELINE-LOADED：由「entries>0」改「册工件在位且 entries 为数组（归零=合法终态 D-201②）」。
- PV-F10A-ERRATA-REF：去 entries>0 前置（空册空遍历=平凡真，仍可由任一条目缺 errata_ref 打红——Bond 判据「这个断言还能失败吗」=能，反例=缺 errata_ref 条目）。
- PV-F10D-STALE-REPORTED：守恒式 失配＋命中==entries.length 保持；去 entries>0 前置（0＋0==0 恒真=归零态自洽）。

表述红线遵守（D-201）：本节=判据澄清，非「册归零禁触退役通道」——84 面真消亡仍走判据全集＋T3 呈裁。

## 8. PROTECTED_SURFACE 补句（D-201②⑥）

声明串追加：`；known-pointer-violations 为本守卫输入工件（baseline 册），其生命周期独立于面消亡判据（D-201②）`。75a-T2 普查断言面随动复验。

## 9. fixture 期望矩阵（G 组新增——红绿分野）

| 断言 | 构造输入 | 期望 |
|---|---|---|
| PV-G-F13-STRICT-HEADERS-EXPANDED | `| commit |` 与 `| SHA |` 列头＋法定形 cell | kind=legal（扩列在跑自证） |
| PV-G-F14-REVERSE-GATE | 非白名单列头＋纯 hex cell（可解析 commit） | judge=FAIL slug=PV-MISPLACED-POINTER（noKeys） |
| PV-G-F15-REVERSE-GATE-UNRESOLVABLE | 非白名单列头＋不可解析 hex cell | 恒 WARN slug=PV-MISPLACED-UNRESOLVABLE |
| PV-G-F16-D5-WORDS-EXEMPT | 严格列 cell 含 `(run)`／`(the)`／首位 `the `＋空格 | 零 bare-shortcode（豁免与首位收紧在跑） |
| PV-G-F17-D6-OPTIONAL-PIPE | 行尾无管表格末格短 SHA | kind=short-sha 检出（FN 修复自证） |
| PV-G-F18-D6-FENCE-EXCLUDED | 围栏内伪表违规行 | 零 finding |
| PV-G-F19-D7-EMPTY-SUBJECT | 法定形位形但 `("")` 空校验位 | kind=missing-subject |

既有 F01~F12 期望不变（回归面）；PV-D2/PV-F10A/PV-F10D 按 §7 语义改写。

## 10. 红态诱导面声明（D-177②）

红态诱导=实现后 G 组负例 fixture 随守卫实跑自证（每 fixture 即构造输入诱导态；读数=PASS/FAIL 计数，命令=`node .scratch/architecture-recovery/reports/84-check.mjs`，输出随实现 commit 落本轮报告 §证据）。旧守卫对 §9 同构造输入的预期行为差异：F13 旧=不扫→新=legal；F14 旧=不扫→新=FAIL；F15 旧=不扫→新=WARN；F16 旧=误报→新=豁免；F17 旧=漏报→新=检出；F18 旧=误喂→新=排除；F19 旧=误收→新=拒收。

## 11. 边界与勘误预登记

- 扫描面零扩列（D-198①）；反向闸 WARN 候选清单（首跑存量）处置随实测呈报不预设。
- 本包不触碰 T1-A 六文件勘误面（D-181 通道另行逐文件独立 commit）。
- registry 操作归 T1-C/T1-D 通道；册 entries 数随实测，本包不钉具体值。

## 勘误（D-181 append-only——impl 实跑发现，post-hoc 同窗）

| 时点 | 扩面描述 | 发现时点 | 变更 commit |
|---|---|---|---|
| 2026-10-02 R54 | §3 补充（fuzzy 判定）：fuzzy-phrase 匹配前剥离单元格内 ("…") subject 引文 span——git subject 原文含「收口 commit」等词形系历史叙述非模糊指针引用（kmk 法定形补写首例实测假阳驱动）；F06 裸模糊语负例不受影响 | post-hoc（impl 实跑 census） | `47dfcfc198f80ae86cef3a6c2c8bc3739cc56d82` ("feat(D-197): 指针守卫机检面批落地——STRICT_HEADERS 扩列 7 列头＋内容驱动反向闸＋D5/D6/D7 三收紧＋册归零断言语义") |
| 2026-10-02 R54 | §4 补充（首位规则精化）：首位 `[a-z]{3}` 判定=后随 `（`/`(` **或格载荷=纯短码**（剥非字母数字后余空）——E-5 类裸码独占格不回归（r26/r36/r49 census 复检三文件十二格实证）；收紧仅去除「码＋空格＋散文」形态误报（the table 类） | post-hoc（impl 实跑 census） | 同上 |
| 2026-10-02 R54 | §9 补充（census 读数）：反向闸首跑 uniq=5 恒 WARN 面=80-bench-thresholds.md HEAD 列跨仓 40-hex×2＋49-report.md run 列 GitHub run ID×3（纯数字假 payload 形态同位）——零 FAIL 零入册（不可解析恒 WARN 无需册承载，读数入账本 E-13）；yty subject 原文含管符依法截断载校验位（GFM 表格管不能裸载，全 sha 仍为唯一性承载） | post-hoc（impl 实跑 census） | 同上 |
