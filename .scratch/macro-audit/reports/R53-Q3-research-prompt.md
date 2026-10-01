# R53-Q3 调研题面 —— 守卫扫描面扩列形态（全仓递归 vs 定向扩面＋根级规则枚举 vs 维持）

（提交 atomcode-research 深调研；账本=唯一事实源立场，调研须回顾 decision-ledger 全部 current 记录、docs/adr、CONTEXT.md 词条、工业界成熟落地心智模型为重点。）

## 背景

本仓=五尺度工程内容审计产品的 spec-level 规划+治理仓。指针守卫件 84-check.mjs 已落地，扫描面=封闭枚举五面：`SCAN_ROOTS=['.scratch/macro-audit','.scratch/architecture-recovery','docs/adr']`＋`SCAN_FILES=['CONTEXT.md','AGENTS.md']`，仅扫 `.md`，`SURFACE_CLOSED=1` 硬断言；豁免机制=SKIP_DIR_BARE(node_modules/.git/dist)＋SKIP_DIR_ANCHORED(reports/_retired、reports/40-clone-cache)＋EXEMPT_SUB(research 类 .md basename 降 WARN-only)。扩面走立法票 D-095（枚举封闭语义）。

实测扩列候选面指针负载：docs/ 非-adr 37 件 .md 中 3 件含 hex（decisions 摘要 4 token/known-gaps 2/ra 文档 2）；根级文书 CHANGELOG.md 21 hex（宽层散文）、README.md 4、CONTRIBUTING.md 0；engine/** 22 件 .md 中 7 件含 hex 但全落在 `.code-tmp`（临时审计输出）与 `fixtures/golden`（合成夹具）必豁免类，真实 engine 文书零负载；兄弟仓目录不存在（单仓面）。

## 候选

(i) **全仓递归**：仓库根起全扫＋豁免加码——扫面最大化但临时/夹具面须新增豁免，治理面扩到「任何角落未来落盘的东西」。
(ii) **定向扩面**：SCAN_ROOTS 加 `docs`（整目录）＋SCAN_FILES 加 CHANGELOG/README/CONTRIBUTING＋`engine` 根入 SCAN_ROOTS 并 SKIP_DIR_ANCHORED 加 engine/.code-tmp、engine/fixtures——按实测负载或未来防护落位。
(iii) **维持 5 面**。
附列决策点：根级文书用逐件列名（最严封闭）还是「根级 *.md」规则枚举（枚举粒度从文件升到规则，新增根 md 自动入面）。

## 调研要求

1. 工业界成熟心智模型（重点）：lint/扫描器**扫面界定惯例**——ESLint lint 目标界定（ignore 文件/.eslintignore→ignores 字段演进、默认面 vs 显式包含）、tsconfig include/exclude/files 三字段语义、coveralls/coverage 工具的 include-exclude 哲学、gitleaks/trufflehog 全历史 vs 路径 allowlist、CODEOWNERS/`.gitattributes` 面界定、CI paths-filter 惯例；**逐件枚举 vs 规则枚举**的张力先例（tsconfig files vs include）；「默认包含+显式排除」vs「默认排除+显式包含」两族模型的失败模式对比；**夹具/测试数据豁免**的成文惯例（fixtures/snapshots/golden files 不参与 lint——eslintignore/codecov ignore 惯例）。
2. 判候选：三候选各评强弱——特别裁决 ①全仓递归在文档治理面的过度捕获风险；②定向扩面「按实测负载落位」vs「未来防护落位」的取舍先例；③根级规则枚举（*.md）vs 文件级枚举的封闭性语义差异——规则枚举是否仍满足封闭性（可枚举性=规则可推导出确定集合）。
3. 冲突扫描：结论是否与本仓 current 决策冲突（重点 D-189⑧ 封闭枚举语义、D-095 立法票通道、D-192 守卫基线册、D-197 反向闸机制——反向闸扩面后触发面是否变广、D-148③ 生效时点、D-160③ 守护面表述、D-74 git-object 零写入）。
4. 推荐+理由+置信度；缺口如实标位。
