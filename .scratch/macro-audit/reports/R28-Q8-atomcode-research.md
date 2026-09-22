# R28-Q8 atomcode 调研存档（ctx_batch_execute 输出整理）

> 2026-09-22 轮28 grill Q8：「--strict-quarantine 基线语义与挂载面」——仓级 code 基线 vs 全局基线 vs 仅兜底码即崩 vs 快照 diff。
> 题面存档：R28-Q8-research-prompt.md。执行：atomcode -p 串行单发（120 行/15.9KB/13 索引节）。
> Sufficiency Gate：多轮三引擎（Tavily 全程超限、Exa 中途限流→AnySearch＋知识库补位）；原文全读 detekt/gitleaks/mypy-baseline/Betterer/hawk PR#142/git-fsck 档/SchemaSmith 等。

## 1) 执行摘要

**推荐 (a)——仓级声明式基线，附三处锐化，置信度高**：strict 下 reason_code∉该仓基线→硬崩；UNCLASSIFIED_FIELD_ANOMALY 永不进基线且出现即崩（fail-closed）；基线=回归 harness 内版本化常量（in-repo、PR 评审），挂载=cli flag＋39 脚本 env 双通道（env 只传开关，策略内容恒为版本化文件）。三处锐化：①枚举外 code 与基线 miss 是两种不同崩溃（前者=分类器 bug，后者=覆盖缺口）；②加 ratchet 棘轮——基线只减不增；③quarantine_log 已天然保留逐实例证据，为未来升级「实例级基线」留门，以缓解 git 官方对 code 级豁免的明确警告。

## 2) 分点结论

**① 基线粒度：业界主流是「实例级指纹」，(a) 的 code 级是弱化但有正当性的变体。** fsck skipList=实例级逐 SHA 枚举；fsck.<msg-id>=code 级；detekt baseline.xml=实例级 <RuleID:Finding签名>；gitleaks=commit:file:rule:line 指纹；mypy-baseline=file:line:code 防合并冲突设计；Betterer=计数级 ratchet；SonarQube=行级 new-code；Trivy .trivyignore=ID 级可带 expired_at。**git 官方警告原文**：「it is better to enumerate existing objects with problems with fsck.skipList, instead of listing the kind of breakages...as doing the latter will allow new instances of the same breakages go unnoticed」——code 级豁免让同类新病态静默通过。含义：D-100③「新 reason code 硬崩」比业界标准门禁（任何新实例硬崩）弱一档；(a) 是弱化语义下的正确粒度，但须认知上明确这是 msg-id 级类比非 skipList 级；quarantine_log 逐实例行使升级实例级基线（逐 commit+field+reason_code 枚举）零 schema 改动、升级成本可控（回归面=固定仓全历史扫描，实例清单有限稳定）。

**② 「新违例硬崩、已知容忍」成熟形态=committed baseline 文件＋create/check 分离；ratchet 是收紧补丁。** detekt detektBaseline（create）与 detekt（check 只报新 findings 新 finding 即 fail）双任务分离；gitleaks --baseline-path 输出只含新 issues；mypy-baseline sync/filter 分离基线 diff 可评审；hawk（astral-sh）归纳六种模式选 A 指纹基线文件（浅克隆可跑/无 merge-base 依赖/一个 committed JSON），--deny-unused-baseline=ratchet 棘爪（已还清的债不删=红）；Betterer 纯计数 ratchet。**同构度排序**：「新 reason code 硬崩」最同构 detekt/gitleaks 型 committed-baseline 门禁（差异=业界按实例指纹本题按 code）；ratchet 正交互补——ratchet 管「基线自身不许膨胀」、门禁管「基线外不许出现」。

**③ 兜底/未分类桶 fail-closed 是安全域共识，(c) 静默放行是反向违例。** authzed「安全关切压过可用性时应 fail closed」；gitleaks allowlist 无「未知规则出现就放过」逃生舱；detekt 基线只吞签名精确匹配的存量；**git fsck 对未知 msg-id 直接 die**（receive/fetch 变体仅降 warn）——分类器自己遇到不认识的 code 也 fail-closed。(c) 把「已知边界内的缺口」与「未知」倒置，且与 D-104②「兜底码=覆盖缺口信号」冲突（让该信号在 strict 下失去唯一硬崩触发权之外的防护）。

**④ 挂载惯例：flag>env>文件三级 precedence 是 CLI 统治形态；策略内容永远在版本化文件里，env/flag 只做开关与指针。** gitleaks precedence 链：--config flag→GITLEAKS_CONFIG env（路径）→GITLEAKS_CONFIG_TOML env（内容）→仓内 .gitleaks.toml→内置默认——双通道存在但策略本体=committed 文件；SchemaSmith 同型 flag 恒胜；CI 实践 exit code 三分（0 过/1 违例/2 harness 错误）+violations unknown 时 exit 1 非 0=又是 fail-closed。**映射**：cli.ts 挂 --strict-quarantine flag（开关）；39 脚本走 env（MACRO_AUDIT_STRICT_QUARANTINE=1）；基线内容=harness 内版本化常量，双通道读同一常量同语义；env 只携「是否 strict」布尔绝不携基线内容——否则 CI 配置漂移即基线漂移重演 (d) 跨运行状态依赖。

**⑤ 辩证处：(a) 的维护成本与评审摩擦实证存在但被工具化消化**（hawk PR#142、detekt discussions#4710、issue#1265——baseline 再生成命令化+diff 可评审设计）。

## 3) 对比矩阵

| 选项 | 业界同构先例 | 关键缺陷 | 裁决 |
|---|---|---|---|
| (a) 仓级 code 基线 | git fsck msg-id 级 severity（上下文各自声明）＋detekt/gitleaks committed-baseline 门禁 | code 级豁免放过同类新实例（git 官方警告）→需 ratchet＋实例留痕缓解 | 采纳＋锐化 |
| (b) 全局基线 | 无（git 明确拒绝跨上下文回退；detekt 共享 baseline 仍带模块签名） | 粒度错配 | 拒 |
| (c) 仅兜底码即崩 | 无——unknown 桶业界一律 fail-closed（fsck 未知 msg-id 即 die） | 已命名新族静默放行，与 D-104② 缺口信号定义冲突 | 拒 |
| (d) 上次运行快照 diff | 零先例（全部 committed 基线） | 违无状态回归面 | 拒 |

## 4) 冲突核查

| 决策 | 结果 |
|---|---|
| D-100③（strict=新 code 硬崩） | 一致；(a) 是其可执行化。但业内心智提示该语义比「新实例硬崩」弱一档属有意收窄——票面明写 msg-id 级非 skipList 级类比防误当业界等强语义 |
| D-104②④⑤ | 一致且互补。锐化①=strict 判定前置枚举校验：分类器吐枚举外 code=分类器 bug 独立硬崩（错误信息区别于基线 miss）；基线永远只含枚举内非兜底成员 |
| D-106/D-108 | 一致；逐实例行使未来升级实例级基线零 schema 改动 |
| D-060④ | 一致；双通道同语义由「同一版本化常量、两个读入口」保证 |
| D-109 | 不冲突；基线 miss 崩溃属 strict 门禁失败（exit 非 0＋结构化 stderr）非协议崩溃不进 crash 工件 |

**零 revised。**

## 5) 来源清单

git-fsck 官方档（skipList 实例级＋msg-id severity＋官方警告原文＋未知 msg-id die）；detekt 官方档（baseline.xml＋detektBaseline/detekt 分离）；gitleaks README（--baseline-path＋precedence 链）；mypy-baseline README（sync/filter 分离＋防合并冲突）；hawk PR#142（六模式归纳＋--deny-unused-baseline）；Betterer 官方（计数 ratchet）；SonarQube Clean as You Code（行级 new-code）；Trivy filtering（.trivyignore＋expired_at）；SchemaSmith（settings→env→flag）；authzed/keysight（fail-closed）；CI exit-code 实践文。

## 6) 信息缺口

Android lint baseline 官方页未读原文（hawk 对照表＋detekt 同型间接确认）；实例级基线在本域的升级时机（同 code 新实例聚集度阈值）无直接先例属设计判断置信中；Tavily 全程超限＋Exa 中途限流，三引擎交叉实际由 Exa＋AnySearch＋先前知识库承担。
