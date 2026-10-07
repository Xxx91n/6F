# R66-Q7 深度调研报告——生成器 EOL 修复形态

> atomcode 真回传存档（batch:atomcode，12 节索引）。searches 8｜angles 四类｜full reads 7｜诚实留痕：Tavily 429×4 额度耗尽→Exa+AnySearch 双引擎，信源数量补强；本地 bash 拦截→ctx 沙箱直读替代。

## 1) 执行摘要

**推荐=(a′) 分票紧邻对**——修生成器（语义 commit）＋哨兵字节级闭环＋一次 gen 再生**四件**（题面三件修正——`.mcp.json` 为 targets 第四件同缺尾行，一手字节实证）逐件走 D-216 兜底。置信 ~0.85。

## 2) 本地一手证据增量

- **四件非三件**：gen-manifests.mjs targets 数组第四件 `.mcp.json` 同缺尾行——题面枚举修正；
- gen-micro-b-emission-golden／validate-plugin 两处 writeFileSync 产物尾行态未逐字节核→普查收尾留执行窗。

## 3) 三疑点裁决

**疑点①哨兵比对口径=字节级工业正解，trim() 零先例**：actions check-dist.yml 原文=`git diff --ignore-space-at-eol dist/ | wc -l`——git diff 口径字节级（--ignore-space-at-eol 只宽容行尾空白量，「无 newline vs 有 newline」产独立 `\ No newline` 标记照红——EOF 差异不受该旗标影响）；codegen-guard 生态（protobuf/GraphQL/Prisma 手搓 drift 守卫）全收敛 `npm run generate && git diff --exit-code`；schema-stale 模板第三源。**修法取最简形态 `readFileSync(full,"utf8") !== expected`**（expected 修后自带 `\n`）——比 trim 更短且哨兵对自身 EOL 盲区天然闭环（D-196「能看自身」判据兑现）；**禁保留 trim 作宽容选项=盲区复辟**。

**疑点②commit 结构=紧邻对已立法收敛惯例**（D-218④ 同型）：生成器修法 commit（语义面，走 but）→`npm run gen` 一次再生四件→**逐件** git add+commit 走 D-216 兜底（每 commit 恰一文件，numstat 1/1＋hunk 仅 \ No newline 判据满足，message 标注串照用）。D-139 no-op 例外**不适用**（前提=文件本轮已被 substantive 触碰，修法触碰的是 .mjs 不是产物 JSON）。

**疑点③尾行卫生属立法域正式对象**：POSIX 3.206 行定义（行以换行终止——一手锚点页截断，两处独立二级引用一致）＋prettier/editorconfig insert_final_newline 行业默认＋git \ No newline 标记语义三源闭合。

## 4) 候选辩证

| 候选 | 裁定 |
|---|---|
| (a′) 修＋同补（分票紧邻对） | **采纳**——紧邻对=D-218④ 先例 |
| (b) 只修文件 | 驳回——下次 gen 重剥=永续回归环，违 D-165④ 变相 accepted-risk |
| (c) 缓挂 | 驳回——trim 盲区使挂起态恶化不可见，D-183 F3-AR 自我指涉同型 |
| (d) 三件并一 commit | 改形采纳——违 D-216① 恰一文件；分次 gen 技术不可行（单脚本一次产四件），正解=一次 gen 逐件提交 |

**(a) 暗面专项（CRLF 假红）**：结构性排除，三重防线一手实证——.gitattributes `eol=lf`＋core.autocrlf=false＋生成器 LF 直写，字节级比对平台假红无成立路径。

## 5) 冲突核查（逐条）

1. **D-216 对生成物 EOF-only 适用性**：判据①②为纯形态机检不绑文件语义来源——生成物同形态同源适用**非扩权**；但裁定中须显式注记一句（D-139⑥ 文法防「判据域静默扩张」漂移）：「D-216 判据为形态判据，生成物 EOF-only 同源适用；生成物再生独立 commit 义务由 D-140②/D-218④ 既有纪律承接非 D-216 新授」。本案是兜底授权**实战首用**非新立。
2. **D-139/D-140② 时序矛盾**：紧邻对消解——修法 commit 窄义=脚本 diff 无产物搭车；产物必走 D-216 兜底。
3. **D-177 预声明**：修前红态存证含两腿——旧产物+trim 哨兵=GEN-OK 假绿读数（盲区自证）；修后哨兵在人造 EOL 噪声下报 DRIFT（红态实证）＋再生后转绿。实跑读数入报告。
4. **D-196**：修后哨兵能看自身=盲区闭环即 D-196 正向兑现；manual_watch 登记不因修法撤销。

**zero revised**。

## 6) 裁定文本骨架

> ①修法面：stable() 追加 `\n`＋哨兵改字节等价（去双侧 .trim()）——语义 commit 走 but；同票捆绑同型普查结果行；
> ②再生面：npm run gen 一次再生四件→逐件 git add+commit 走 D-216 兜底；
> ③D-177 预声明包：修前假绿读数＋修后红/绿双向实跑＋紧邻对声明，先于变更 commit 落盘；
> ④注记：D-216 形态判据生成物同源适用非扩权；D-140② 矛盾由紧邻对消解；D-139 不适用本案；
> ⑤假红防线登记：gitattributes eol=lf＋core.autocrlf=false＋LF 直写三重实证。

## 7) 置信度与信息缺口

~0.85。缺口：npm pack 尾行态度未一手（影响≈0）／Bazel 面类比级／两 writeFileSync 面尾行态留执行窗／POSIX 3.206 二级引用／Tavily 额度耗尽双引擎降级已补强。
