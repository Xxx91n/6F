# R66-Q7 调研题面——生成器 EOL 修复形态（gen-manifests 三件无尾行＋哨兵 .trim() 盲区）

## 背景（仓内实证，非转述）

- `D:/Aworker/6F/engine/scripts/gen-manifests.mjs` 生成三件清单产物（稳定 JSON 序列化经 `stable()` 直写 `writeFileSync`，**无尾行 `\n`**）：engine/plugin.json（538B）／engine/manifest.meta.json（971B）／engine/.claude-plugin/plugin.json（402B）——三件 LF-end=false 实测；
- **哨兵盲区实证**：该脚本自带 drift 自检（逐件 `readFileSync` 比对）但比对是 `expected.trim() !== actual.trim()`——**EOL 差异结构性隐形**，就算尾行被剥哨兵也报 CLEAN；`npm run gen` 是 `npm test` 前置链（package.json scripts.test 首步），每次测试即重写三件=回归面永续敞开；
- **立法语境**：仓内文本文件尾行卫生有立法面（EOF-only 修复已实证过、D-216 刚立法 scoped git 兜底授权——机检双判据「numstat 恰一文件增删各≤1＋hunk 仅末行+\ No newline 标记」＋message 固定标注串＋gitbutler-eof-hunk-watch manual_watch 收回钩）；D-140② 生成物再生禁搭车语义 commit；D-196 哨兵/谓词须能看自身（check-kit 消费位先例）；D-177 预声明工序；D-183 微修+同型普查；
- **波及面推演**：修 stable() 输出追加 `\n` → npm run gen 再生三件→三件 diff 恰为 EOF-only 形态（单字节 0x0A 追加）→GitButler 无法应用该 hunk（R65 实证）→须按 D-216 兜底逐件提交（每兜底 commit 恰一文件——numstat 判据满足）；
- **其他 gen 面**：`npm run gen` 还含 `gen-adr-index.mjs`（docs/adr/README.md 生成式索引——该产物尾行态未核，题面外但同族可在同型普查覆盖）。

## 待裁问题

生成器 EOL 修复形态——含两层缺陷（产物无尾行＋哨兵对自身缺陷失明）：

- **(a) 修生成器＋哨兵同补**：stable() 产物追加 `\n`＋drift 比对改字节级（去 .trim()）→npm run gen 再生→三件走 D-216 兜底逐件（生成器修法=正常语义 commit 走 but）；同型普查=全仓 grep `writeFileSync` 生成器面补查同类无尾行产出（限生成器机芯面 grep 级）；
- **(b) 只修文件不修生成器**：下次 gen 立刻重剥=永续回归环；
- **(c) 缓挂 known-issue**：hygiene 债＋哨兵盲区双重存续——且哨兵盲区意味着「挂起也看不见恶化」；
- **(d) 三件并一个兜底 commit**：违 D-216「恰一文件」判据；或修生成器后逐件分次 gen（脚本一次产三件不可行）。

我的初步推荐=(a)。**须调研裁决的疑点**：①哨兵自检「字节级 vs trim()」的工业口径——生成物 drift 守卫（actions check-dist.yml 用 `git diff --exit-code` 字节级；Bazel/Nix 类确定性构建的 drift 检测惯例）是否全部字节级、trim() 级比对有无合理先例；②生成物 EOF 修复的 commit 结构——「生成器修法 commit（语义）＋再生产物逐件兜底 commit（hygiene）」的分离形态与 D-139/D-140② 纪律的组合合法性，以及工业界（代码生成器 prettier/bazel genrule 产物卫生修复）的先例；③「生成器产物的尾行卫生」是否属于该立法域的正式对象——POSIX text-file 定义（行以换行终止）对 JSON 产物的适用性、prettier/eslint --fix 对生成物尾行的行业默认。

## 调研要求（纪律面不变）

1. **必须回顾本地三大件**：`D:/Aworker/6F/.scratch/macro-audit/decision-ledger.md` 全部 status=current（重点核 D-216 兜底判据在本案的适用边界／D-139/D-140② 生成物纪律／D-177/D-183/D-196／一切涉 generator/生成物/drift/EOF/尾行条目）；`D:/Aworker/6F/docs/adr/` 全条目；`D:/Aworker/6F/CONTEXT.md` 全词条；另须直读 `engine/scripts/gen-manifests.mjs` 全文＋`gen-adr-index.mjs` 尾行处理＋三件产物现状字节；
2. **工业界成熟落地心智模型（重点）**：生成物 drift 守卫字节级惯例（actions check-dist.yml 原文／Bazel sandbox hermetic 输出比对／go generate 产物 diff 检查惯例〔golang 官方 generated-code hygiene〕）；POSIX text-file/尾行卫生立法先例（git 「\ No newline」标记语义／prettier trailing newline 默认／editorconfig insert_final_newline 惯例／npm pack 对 JSON 尾行态度）；「哨兵对自身盲区」教训先例（监控自身健康-checker-quorum／who watches the watchers 工程实践）；
3. **辩证性看待**：逐候选点评论证；特别评估 (a) 的暗面——字节级比对是否可能引入新的假红（平台 CRLF/LF 差异面：Windows 检出时 git autocrlf 会不会让字节级比对误报？此点务必调研——本仓 Windows host 开发是常态）；及「哨兵修复与产物修复同窗」是否该分票；
4. **冲突核查（硬要求）**：重点核 D-216 兜底判据对「生成物 EOF-only」的适用性（兜底立法语境是 hygiene 回归，本案是同形态但生成物语义——是否该同源适用还是要注记扩域）＋D-139 例外条款适用性（生成器修法 commit 能否捎带产物变更——D-140② 禁搭车 vs 修法 commit 必然引起产物 diff 的时序矛盾如何解决：先修生成器产物 diff 立即出现的窗口期归谁管）；
5. **结论交付**：核心推荐（含裁定文本骨架）＋置信度＋信息缺口清单。
