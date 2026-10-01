# R53-Q2 调研题面 —— 严格层列头枚举欠列（E-11）处置形态（扩列 vs 内容驱动反向闸 vs 复合）

（提交 atomcode-research 深调研；账本=唯一事实源立场，调研须回顾 decision-ledger 全部 current 记录、docs/adr、CONTEXT.md 词条、工业界成熟落地心智模型为重点。）

## 背景

本仓=五尺度工程内容审计产品的 spec-level 规划+治理仓。指针纪律立法已落地（D-188~D-193）：文书面「定位一个 commit」字段=法定指针形（SHA≥12hex＋("subject") 人读校验位，写入时点 cat-file -e 存在∧锚线可达）；指针字段划界=严格层位形**封闭枚举**（D-189⑧：勘误节指针列/登记表证据锚列/去向表指针位/审计固定点与返工链位/T3 表 commit 指代列/补钉表值位/账行表格唯一指代括注；机检=列头白名单＋锚定正则＋括注位模式；枚举封闭扩列走立法票 D-095）。守卫件 84-check.mjs 已落地（STRICT_HEADERS 白名单 11 项：变更 commit 指针/变更 commit/原模糊指针/归属 commit/分支\/commit/Test commit/Impl commit/闭环 commit/commit 指针/git 短 hash（可 cat-file -e）/git 短 hash；另有通道 B 小节锚定正则 SECTION_ANCHOR_RE、通道 C 列表行标签 listLabelStrict）。

实证缺口（E-11）：本批两件文书在**非白名单列头**下放置 commit 指针而守卫未判违规——r52-report.md §6 变更文件清单表用 `| commit |` 列装 8-hex 无 subject 指针；OS temp 交接件用 `| SHA |` 列装 40-hex 无 subject 指针。按 D-189⑧ 职能定义二者应属严格层，但按封闭枚举字面不在名单内——**枚举欠列非合规**。

## 候选

(i) **扩列制**：立法票 D-095 把裸 `commit`/`SHA` 及同义词族（commit hash/commit SHA/指针/SHA-1/hash）收编入 STRICT_HEADERS 白名单——补当前欠列；风险=打地鼠结构性缺陷（新造列头 rev/提交/变更号 再开盲区）。
(ii) **内容驱动反向闸（闭世界判头）**：白名单保持 canonical 封闭；新增机检方向——任意表格单元格含可解析 commit 对象 token（hex≥7 且 cat-file -t=commit）而列头不在白名单→判「严格层位置未入枚举」违规（新增 FAIL/存量 WARN 入册）；不可解析 token（文件 hash/per-session 短码）→判「疑似指针置于非 canonical 列头」WARN；配套文书纪律=指针列必须用白名单 canonical 列头——盲区自报现形。
(iii) **复合**：(i) 扩列收编高频同义词＋(ii) 反向闸兜长尾。
(iv) **维持**：盲区挂账不动。

## 调研要求

1. 工业界成熟心智模型（重点）：**白名单/开放枚举 vs 闭世界校验**的成熟先例——Kubernetes fieldValidation=Strict（未知字段拒收）vs Ignore/Warn；protobuf/JSON Schema unknown-field 处置（additionalProperties:false vs true）；HTML/XML 解析器容错 vs 严格模式；SQL strict column validation；HTTP header 校验；checkpatch 列头/tag 白名单启发式的盲区面；schema registry/contract testing 中「未声明字段出现」的处置惯例；**内容驱动探测**（按载荷形态而非按字段名判严格位）的工业先例——如 secret scanner 按 entropy/token 形态而非按字段名、SAST 按 sink 数据流而非按变量名；lint 生态「未知即告警」vs「未知即豁免」的默认态对比（eslint --no-eslintrc、typescript strict、openapi spec strict mode）。
2. 判候选：四候选各评强弱——特别裁决 ①扩列打地鼠是否工业界公认反模式；②内容驱动反向闸的误报面（commit-SHA vs 文件 hash 混淆、不可解析短码归位）；③canonical 列头强制（命名纪律）是否有先例（如 ISO 标准表格列头词表、checkpatch tag 白名单执法）。
3. 冲突扫描：结论是否与本仓 current 决策冲突（重点 D-189⑧ 封闭枚举立法、D-095 立法票通道、D-192 守卫基线册、D-181 勘误通道、D-177 预声明验证包、D-148③ 生效时点）。
4. 推荐+理由+置信度；缺口如实标位。
