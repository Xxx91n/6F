# R53-Q3 调研报告 —— 守卫扫描面扩列形态（全仓递归 vs 定向扩面 vs 维持）

> 题面：`R53-Q3-research-prompt.md`｜派遣：atomcode `-p` 真回传（Indexed 9 sections，web_fetch 实读源在案）｜**非降级**——本轮构成比修正：Q1 atomcode 回传（内部载体降级）＋Q2 编排层合成（配额耗尽）＋Q3 atomcode 真产出=**1/3 降级**口径待裁定（Q1 内部降级是否计 degraded）

## 1) 执行摘要（Tl;dr）

**推荐 (iii) 维持 5 面＋D-197④ 反向闸作扩面候选流；若被迫立法扩面，选 (ii) 定向扩面且根级文书一律逐件列名（禁根级 `*.md` 规则枚举），engine 根暂缓。** Confidence：**高**——维持态与本仓 D-192⑥「扩列未触发」、D-189②「宽层不背税」、D-095 封闭声明制零冲突；定向扩面按实测负载落位有 codecov/gitleaks 显式豁免惯例支撑；全仓递归被三重证据否决（E-10⑤ 宽层 hex token ≈1076 的过度捕获实测、ESLint ignores 语义混乱史、gitleaks 全仓模式依赖的显式豁免基建本仓不具备）。

## 2) 分点结论

### 结论 1：工业界两族模型的分野清晰——扫描器几乎全是「默认包含＋显式排除」，但默认面的成员集是小型封闭常量，且豁免全部显式声明（Confidence：高）

| 工具 | 扫描面模型 | 默认面 | 豁免形态 | 对本题的映射 |
|---|---|---|---|---|
| ESLint（flat config，v10 已删 .eslintignore） | 默认包含＋显式排除 | `**/*.{js,cjs,mjs}`＋默认忽略仅 `**/node_modules/`、`.git/` 两个常量 | `globalIgnores()` 显式 glob | 默认面=小封闭集；豁免增长须显式 |
| tsconfig | 三层：files（逐件 allowlist，缺失即报错）／include（规则枚举）／exclude（仅过滤 include 结果） | 无 include/files 时=目录递归全含 | exclude 非绝对——被 import 的文件仍进程序；files 显式绕过 exclude | 逐件 vs 规则枚举张力的一手先例 |
| Prettier | gitignore 语法的 .prettierignore | 仅 VCS 目录＋node_modules | 显式 ignore 文件，「推荐项目必配」 | 夹具豁免=显式声明物 |
| Codecov | 默认采集＋`ignore:` 排除 | 全仓 | regex/glob 显式；官方示例豁免对象=测试/夹具/coverage 生成物 | 夹具/生成物豁免成文惯例 |
| gitleaks | 默认全历史全仓 | 全部 | 四机制全显式：config allowlist paths／.gitleaksignore／inline gitleaks:allow／baseline | 全仓模式可行前提=豁免基建完备＋可审查 |
| GitHub Actions paths | 规则枚举（glob）＋paths-ignore，二者禁混用 | 无过滤即全触发 | 失败模式：diff 超 300 文件时路径过滤静默放弃 | 规则枚举在 CI 面常态，但大面上有静默失效形态 |
| CODEOWNERS/.gitattributes | gitignore 同构规则枚举，last-match-wins | — | — | 规则枚举合法性先例 |

### 结论 2：候选 (i) 全仓递归——否决（Confidence：高）

- **过度捕获实测**：R52 审计 E-10⑤ 已量化——扫描面内极大 hex run 唯一 token 1076 个，剔除已知类后仓内叙事文书层仍 ≥20 件带指针负载；全仓递归把这个量级再乘上 docs/ 37 件、CHANGELOG 21 hex、engine 22 件。D-189 调研已引 Pylint 宽规则 95% 误报／Codacy「狼来了」机制为宽口径否决实证——本仓守卫的判力命根是「FAIL 有牙齿」（D-192①④），全仓递归直接稀释它。
- **豁免加码不可持续**：(i) 要求新增 engine/.code-tmp、engine/fixtures/golden、dist、node_modules、.code-tmp 等豁免——实测 engine 22 件 .md 中 7 件含 hex 全部落在豁免类，即 engine 根入面后真实捕获为零、豁免行净增；「豁免列表随仓库演化无限增长」正是 ESLint 社区真实痛点（ignores 全局/局部二义逼出 globalIgnores() helper、#17400 语义混乱实证）。

### 结论 3：根级规则枚举（`*.md`）vs 逐件列名——规则枚举在可判定性意义上仍「封闭」，但在治理意义上弱化一级（Confidence：中高——判例式论证，无直接同名先例）

- **可枚举性判据**：若规则确定性可推导（根级 `*.md`→guard 运行时 glob 重算派生集并断言），任意 HEAD 下扫面集合唯一确定——满足 D-095①「声明了 closed 才立法」的可判定内核。就此而言规则枚举不破封闭性。
- **但对账面弱化**：D-095① 执法形态=「closed→成员级双向差集 FAIL」，前提是成员清单作为常量在场。规则枚举后「新增根 md 自动入面」意味着成员集演化不再经过立法票——正是 D-095② 常量单一权威源要防的「叙述段漂移」，也是 tsconfig 官方取舍原句：`files` 逐件用于「only have a small number of files」，`include` 规则仅当枚举成本成为问题时使用。根级 .md 实测仅约 9 件（CHANGELOG/README×2/CONTRIBUTING/SECURITY/CODE_OF_CONDUCT/CONTEXT/AGENTS），逐件列名成本近零——**规则枚举的唯一正当性（枚举成本）在本场景不存在**。CI paths-filter 用 glob 是因变更面不可枚举，与守卫扫面（静态已知面）场景不同构。
- **裁定**：根级文书若入面，逐件列名（最严封闭、新文件入面=天然立法票触发器）；根级 `*.md` 规则枚举=「把开放增长写成规则」，实质违反 D-095 立法票通道，驳回。

### 结论 4：候选 (ii) 定向扩面——有条件可行，但按面拆判（Confidence：高）

- **「按实测负载 vs 未来防护」先例**：codecov 官方博客明确「初期可含测试文件，成熟后应 ignore」——按成熟度/实测噪声落位是成文惯例；gitleaks allowlist 收窄纪律（前轮 R71-Q2 存档「baseline is not a pardon」）同理。**反向先例（为未来防护预铺扫面）工业界主流不采纳**——reserved 成员机制（D-095④）仅限外部输入面且 cap≤2，本仓已立法「场景≤1 条不建制、内部防万一则 YAGNI 删除」。
- **逐面判**：
  - `docs` 整目录：实测 37 件仅 3 件含 hex 且为 decisions/known-gaps 摘要类（可能属严格层职能）——唯一有实测负载＋严格层职能可能的扩面，但 3 件量级未达「欠列实证」门槛（对照 E-11：真实逃逸案例才开 D-197 票）。
  - 根级 CHANGELOG（21 hex 宽层散文）/README（4）：负载全部是宽层叙述提及——D-189②「宽层 SHA 任意位数提及自由不负定位义务」＋RFC3986「提及≠定位义务」先例下，把宽层散文拉进指针守卫=宽层背税直接违反 D-189② 负向约束。若入面只能以 WARN-only 宽层形态（同 EXEMPT_SUB 先例），守卫增益≈0。
  - `engine` 根：实测真实文书零负载，全部命中 .code-tmp/fixtures 豁免类——现在入面买不到任何防护，且须新增两条 SKIP_DIR_ANCHORED；应等反向闸累积出真实严格层负载再走票。

### 结论 5：候选 (iii) 维持 5 面——与全部 current 决策零冲突，且有正面判据（Confidence：高）

- D-197⑤ 驳回「维持」是针对严格层列头枚举——那里有 E-11 实证逃逸（指针装在非 canonical 列头下逃过机检）。本题是扫描面：五面已覆盖指针义务所在的所有严格层文书（账本×2、docs/adr、CONTEXT、AGENTS——D-188~D-192 的立法对象面），docs/CHANGELOG 中的 hex 是宽层提及、本就无义务，**不存在逃逸，只有「无义务处的负载」**。逃逸论证不成立，维持就不是 D-197 意义上的「打地鼠放任态」。
- D-197④ 已把「反向闸 WARN 面」立法为扩列票天然候选清单源——这正是工业界「按实测噪声落位」的机制化形态：扩面的证据收集器已经在运转，维持 5 面＝让证据先于立法，而非放弃扩面。

## 3) 冲突扫描（逐条）

| 决策 | (i) 全仓递归 | (ii) 定向扩面 | (iii) 维持 |
|---|---|---|---|
| D-189⑧ 封闭枚举语义 | 冲突（开放增长面） | 兼容（扩列走票） | 兼容 |
| D-095 立法票通道 | 冲突（豁免面失控） | 兼容；根级 `*.md` 规则枚举形态**冲突** | 兼容 |
| D-192 守卫基线册 | 冲突——全仓面首跑建册将灌入数百 WARN，册语义从「存量豁免」变「普查垃圾场」 | 兼容（新入面存量走 D-191③ 首跑普查判级先例） | 兼容 |
| D-197 反向闸 | 冲突——触发面炸宽，候选流被噪声淹没 | 兼容且互益（定向扩面=反向闸候选的兑现） | 兼容（反向闸继续收集证据） |
| D-189② 宽层不背税 | 冲突（CHANGELOG 21 hex 宽层负载将被迫判级） | 条件兼容——根级文书入面必须配 WARN-only/宽层形态 | 兼容 |
| D-148③ 生效时点 | — | 兼容：扩面落盘 commit 起生效，存量入册豁免 | — |
| D-160③ 守护面表述 | 冲突——扫面膨胀后「守护面消亡」退役判据失去清晰对象 | 兼容 | 兼容（退役判据最锐） |
| D-74 git-object 零写入 | 三候选均无影响 | 同左 | 同左 |

## 4) 推荐＋理由＋置信度

**推荐：维持 5 面（iii）即刻态＋D-197④ 反向闸为扩面候选流；触发条件成熟时按 (ii) 定向扩面立法，根级文书逐件列名、宽层 WARN-only，engine 根凭反向闸证据再议。** 置信度：**高**（维持态判据）/中高（根级规则枚举封闭性判定为本仓特有裁定）。

理由压缩为三条：
1. **扫描面扩列的立法门槛应是「实证逃逸或实证义务缺口」，不是「实测到负载」。** E-11→D-197 的先例链恰恰是：真实逃逸案例→立法票→扩列。本次实测的三处负载（docs 3 件、CHANGELOG 21、README 4）经 D-189② 判读全是宽层提及、无定位义务——有负载≠有欠列。维持 5 面不是保守，而是 D-197 复合形态的 faithfully 执行。
2. **全仓递归的工业同构（gitleaks）能成立，靠的是四层显式豁免基建＋"baseline is not a pardon" 纪律；本仓不具备且不该建**——本仓内容物本身就是充满 SHA 的审计散文（token 1076 实测量级），全仓递归把「守卫抓义务违例」变成「守卫数 SHA」，Pylint 宽规则 95% FP 的否决先例直接适用。
3. **规则枚举只在枚举成本成为问题时才正当**（tsconfig 官方取舍原文），根级 9 件 .md 不满足；逐件列名让「新增根 md」天然成为立法票触发器，与 D-095 通道语义严格同向。

## 5) 完整来源清单

| 标题 | URL | 角度 | 实读 | 贡献 |
|---|---|---|---|---|
| ESLint Ignore Files（flat config） | eslint.org/docs/latest/use/configure/ignore | Official | web_fetch 实读 | 默认面=小封闭常量集＋globalIgnores 显式豁免契约 |
| ESLint Configuration Files | eslint.org/docs/latest/use/configure/configuration-files | Official | 实读 | — |
| eslint#17400 ignored files still parsed | github.com/eslint/eslint/issues/17400 | Community/Criticism | 摘要 | 豁免语义混乱的社区实证 |
| ESLint v10 migration | eslint.org/docs/latest/use/migrate-to-10.0.0 | Official/Currency | 摘要 | .eslintignore 删除=豁免机制收敛到单一显式形态 |
| TSConfig Reference: files/include/exclude | typescriptlang.org/tsconfig/ | Official | web_fetch 实读 | files 逐件 vs include 规则官方取舍原句；exclude 非绝对 |
| tsconfig.json handbook（镜像） | typescript-site 镜像 | Official | Tavily 摘要 | files 显式入集不受 exclude 管辖交叉验证 |
| kettanaito TS 误解文 | kettanaito.com | Community | 摘要 | include/exclude 误解高频=规则枚举可读性税 |
| Gitleaks README | github.com/gitleaks/gitleaks | Official | web_fetch 实读 | 全仓默认面＋四显式豁免机制 |
| Codecov Ignoring Paths | docs.codecov.com/docs/ignoring-paths | Official | web_fetch 实读 | 默认采集＋显式 ignore；夹具/测试/生成物豁免示例 |
| Should I include test files in coverage | about.codecov.io | Official/Currency | 摘要 | 「按成熟度落位」成文先例 |
| Prettier Ignoring Content | prettier.io docs | Official | 实读 | 夹具豁免=显式声明物 |
| GitHub Actions paths/paths-ignore | docs.github.com | Official | 摘要 | 规则枚举常态＋大面静默失效形态 |
| 本仓账本 D-189/D-095/D-192/D-197/E-10⑤ 行 | decision-ledger.md | Local | 原文行已核 | 冲突扫描判据 |
| 知识库召回 R71-Q2（baseline is not a pardon）、R22-Q4、R51-Q3 | 本地 ctx KB | Local | 召回 | 前序先例 |

## 6) 信息缺口

1. **文档类 lint 扫描面治理**：无一手权威条款（本轮只验证了代码类工具链）；markdownlint/Vale 部分依赖前轮存档未重抓原文。
2. **Currency 角度薄弱**：仅 ESLint v10 迁移一项 2025-2026 动态；扫描器扫面惯例近年无范式级变化信号（本身即弱证据：两族模型稳定）。
3. **根级 `*.md` 规则枚举封闭性**：可枚举性判定为本仓自治推演，无工业同名先例——呈裁时建议按「判例式裁定」标注而非「惯例回声」。
4. **CHANGELOG hex 增长率**：单时点 21 token，无法判趋势；若立法票开出，票面应附增长率实测项。

**呈裁建议一句话**：本轮不扩面；把「定向扩面＋根级逐件列名＋宽层 WARN-only」三要件预登记为 D-197④ 反向闸的兑现路径，等候选清单累积出第一个严格层义务案例再开票。
