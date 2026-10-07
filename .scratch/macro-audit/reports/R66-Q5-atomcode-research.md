# R66-Q5 深度调研报告——dist 形态重评（#90 警戒线触发强制票）

> atomcode 真回传存档（batch:atomcode，10 节索引）。Sufficiency Gate：searches 7（Exa 2〔1 次额度耗尽如实登记〕/Tavily 2/AnySearch 3）｜angles 四类｜full reads 6 一手原文（esbuild API 官方页／actions/javascript-action check-dist.yml 逐行＋仓 README／Betterer 官方 Updating Results 页／devops-daily Claude Code 泄漏事件全文／npm-diff.app Source&Trust）＋本地账本全文级扫描＋ADR-0008/0011/0016 全文＋build-bundle.mjs 一手直读证 minify 缺席=立法空白。

## 1) 执行摘要

**推荐=(i) 体积治理先行**：esbuild `minifyWhitespace+minifySyntax`（保标识符）→实测读数→棘轮帽按「新实测×1.25」**向下**重推导；分发形态零变更。置信度高 ~0.85。两疑点裁决：①警戒线触发语义**允许**「重评结论=维持原判+治理空白修复」——触发器立法文本义务客体=「开一次重评票」非「换形态」（D-073① 触发认定≠直接处置先例）；②minify 信任面代价经工业先例证伪——官方模板信任模型本来就是 rebuild-diff 确定性重建比对非人读 diff；agent CLI 行业常态即压缩分发（Claude Code npm 包=minified bundle）；本仓 D-140③ 已立法「dist 信任源=CI 守卫非人读 diff」——分层 minify 边际信任成本≈0。

## 2) 分点结论

**结论一（疑点①）：强制重评≠强制换形态——仓内立法链自洽**。触发器文本（D-211②）义务客体=「开一次重评票」，合法结论集天然含「维持」；仓内双判例——D-073①「触发认定≠直接处置」／D-076①「维持非免检」（R31-Q2 第三轮 dist 批评与 R62-Q1 reef#2 两次重评均裁维持，先例路径完整）；外部同构：Betterer 官方「only update when results improve」=棘轮语义本体守门非逼改；size-limit「forbids silent growth, not growth」同义。**但维持的合法前提=新实证驱动的治理动作**（本案=minify 立法空白修复＋帽下修）——非空转维持（那才是 (ii) 被否理由）。

**结论二（疑点②工程面）**：esbuild 官方一手——minify=三独立旗标 `minifyWhitespace/minifySyntax/minifyIdentifiers` 分层启用；仅 identifiers 档改写标识符，whitespace/syntax 档保函数名/变量名/错误消息（stack trace 仍 `functionName (src/...)` 可定位，只失行号列号——本仓结构化错误面不依赖行号〔执行窗须实测证伪〕）；check-dist 守卫机制=`rimraf dist`→rebuild→`git diff --exit-code` 字节比对——esbuild 同输入同版本输出确定性→**minify 旗标加入后 rebuild-diff 语义完全不变**，只是比对目标换成压缩产物（官方模板信任模型=「dist 含 expected transpiled code」——expected=可复现非可读）。

**结论三（疑点②信任/品牌面）**：「审计产品分发体不可读」信任代价无工业先例支持且反向占优——Claude Code CLI（同类 agent 产品）npm 分发体即 minified bundle，其泄漏事故教训方向=「别把 map 带出去」非「别 minify」；npm 信任机制演进（provenance/Sigstore）全部指向构建可复现性+透明账本为信任载体；安全研究界对 minified bundle 审计能力成熟（deobfuscation 工具族）；本仓源码同仓可读，审计者验证 dist==源码产物的最强工具恰是 rebuild-diff——minify 后该验证反而更严密。

## 3) 对比矩阵（四选+组合）

(i) 治理先行=唯一「新实证驱动」选项；(ii) 纯抬限=空转维持（无新动作=重评义务未兑现）；(iii) 拆仓撞 ADR-0011＋毁 clone 即跑；(iv) publish 撞 ADR-0016＋零需求信号；(v) minify+抬限=棘轮语义自伤。

## 4) 冲突核查表（逐条硬对照）

| 条目 | 结论 | 处置 |
|---|---|---|
| D-129③「抬限走 reviewed PR」 | 无冲突但有意料歧义——字面只写抬限方向未明示下修合法性；size-limit 官方惯例 limit 双向可调 | **scoped 注记**：「reviewed-PR 纪律双向适用——实测下降经 reviewed PR 向下重推导=镜像应用非棘轮破例」防未来读成「帽只升不降」 |
| D-211② 警戒线语义 | 无冲突——治理动作恰是「计划性到顶」正确响应 | 无 |
| D-067② 单文件 bundle | 无冲突——minified 仍自包含单文件，.mcp.json/DUCKDB 降级面不变 | 无 |
| D-140①③ generated 标记+信任声明 | 无冲突且互强——信任源=rebuild-diff 语义不变 | 裁定文引用 D-140③ 作信任面依据 |
| D-059⑨ 退役锚 | 无冲突——形态未变锚不动 | 无 |
| D-177 预声明工序 | **义务触发**——build 配置变更=bundle 产物全变属语义变更 | 裁定文内嵌 D-177 预声明（先行 commit＋实跑读数：前后字节/selftest+doctor 绿/rebuild-diff 绿/行号无关性验证） |
| ADR-0011/0016/0008 | 零触碰 | 无 |
| D-139② 机械变更禁搭车 | 同族适用——build 配置=语义 commit、bundle 重生=独立 bundle commit | 纪律照旧 |

## 5) 核心推荐（裁定文本骨架）

> ①警戒线触发语义裁定：义务客体=开带证据重评票非强制换形态；本轮结论=形态维持（D-067/D-076/D-140 全数 current）＋治理空白修复——新实证驱动非空转维持；
> ②minify 分层立法：build-bundle.mjs 加 minifyWhitespace:true, minifySyntax:true，**不加 minifyIdentifiers**（stack trace 函数名保住；标识符改写留后续选项按票面 impl 参数另裁）；
> ③帽向下重推导：minify 落地实测 N→cap=N×1.25（D-129③ 同公式反向应用），reviewed PR 走 D-177 预声明验证包；
> ④D-129③ scoped 注记：reviewed-PR 纪律双向适用（Betterer/size-limit 官方语义一手反证「单向只升」误读）；
> ⑤负向：**禁配 sourcemap 入 dist**（Claude Code 泄漏事故教训——map 使体积翻倍且构成源码外泄面；调试走仓内 TS 源）；禁 (ii)/(v)；(iii)(iv) 维持 D-076 触发器吸收语义。

## 6) 置信度自评

高 ~0.85。扣分三处：①minify 后实测读数未跑（预期余量 35~45% 为估算）；②selftest/doctor 行号无关性未本地实测——若发现行号依赖补丁成本极低（keepNames 或输出补函数名）但属未验证假设；③「无先例因分发体可读性拒绝 minify」为证伪式结论（未找到≠不存在）如实标注。

## 7) 信息缺口

Exa 一次额度耗尽如实登记；minified dist 安全性一手审计先例偏社区面（无安全厂商官方法规级文档）；Betterer 帽下修的逐字 API 条款以官方页面语义为准非逐字引文。
