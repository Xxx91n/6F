# R43-Q2 atomcode 调研报告存档——闸粒度上限/partial-skip 呈现/冗余断言处置

> 题面=`reports/R43-Q2-research-prompt.md`；引擎=Exa+AnySearch 双引擎（Tavily 配额耗尽）＋6 次全文精读；angle=Official/Comparative/Criticism/Currency/Community 五类。
> 以下为 ctx_batch_execute 索引输出原文归档（节序按 BM25 命中序，内容未裁剪）。

---

Executed 1 commands (111 lines, 17.5KB). Indexed 9 sections. Searched 6 queries.

## Commands

- atomcode: `atomcode -p "测试基建中环境前置/跳过(skip)机制的粒度上限与呈现语义。场景：自研守卫体系把 skip 前置声明从整文件细化到组(group)粒度（如 pytest fixture/JUnit assumption/Go subtest 同级），缺前置的组 SKIP 其余照跑。三个子题：(a) 粒度上限——组粒度足够还是需要断言级(assertion-level)前置标记？pytest mark.skipif/JUnit 5 assumptions/Bazel target 拆分/Rust cfg+ignore 等生态里前置声明最细沉到哪一级、为什么更细通常不值得；(b) 汇总报表里'含部分跳过的套件'呈现——JUnit XML/Allure/GitHub Actions/GitLab CI/TAP 协议如何呈现 partial-skip 套件（仍标 passed 加 skipped 计数 vs 引入 partially-skipped 方言态），哪种是主流惯例；(c) 冗余/重言断言（探测谓词在闸后重复断言）的处置惯例——留着当 belt-and-suspenders…`

## Indexed Sections

- atomcode (1.9KB)
- Skip 前置机制的粒度上限、partial-skip 报表语义与冗余断言处置 (0.1KB)
- Skip 前置机制的粒度上限、partial-skip 报表语义与冗余断言处置 > 执行摘要（Tl;dr） (2.1KB)
- Skip 前置机制的粒度上限、partial-skip 报表语义与冗余断言处置 > (a) 粒度上限：生态把前置声明沉到哪一级 (3.0KB)
- Skip 前置机制的粒度上限、partial-skip 报表语义与冗余断言处置 > (b) partial-skip 套件的报表呈现 (2.9KB)
- Skip 前置机制的粒度上限、partial-skip 报表语义与冗余断言处置 > (c) 闸后重复断言（探测谓词重复断言）的处置 (2.0KB)
- Skip 前置机制的粒度上限、partial-skip 报表语义与冗余断言处置 > YAGNI / Speculative Generality 在测试基建的边界 (1.9KB)
- Skip 前置机制的粒度上限、partial-skip 报表语义与冗余断言处置 > 完整来源清单 (2.7KB)
- Skip 前置机制的粒度上限、partial-skip 报表语义与冗余断言处置 > 信息缺口 (0.9KB)

## 粒度上限

### Skip 前置机制的粒度上限、partial-skip 报表语义与冗余断言处置 > (a) 粒度上限：生态把前置声明沉到哪一级
## (a) 粒度上限：生态把前置声明沉到哪一级

| 生态 | 最细一级 | 再细的机制 | 证据 |
|---|---|---|---|
| pytest | 参数化实例（`pytest.param(marks=skipif)`） | 无 | 官方 skipping 文档：粒度阶梯为 function → class → `pytestmark`(module) → param 实例；`pytest.skip()` 命令式调用可精确到执行中某点，但那是**用例级结果的判定**，不是断言级标记 [S1, S2] |
| JUnit 5 | 测试方法内（`Assumptions.assumeTrue()` 运行时中止） | 无 | 官方 javadoc：assumption 失败→test **aborted**（用例粒度）；且“失败优先于中止”——已 fail 的用例不能被 assumption 改成 skip（issue #4084）[S3, S4] |
| Go | subtest（`t.Skipf()` 在 `t.Run` 的闭包内） | 无 | subtest 是 Go 的最细原生单位；`t.Skip` 只作用于当前（子）测试 [S8, 社区共识] |
| Rust | 单个 `#[test]`（`#[cfg_attr(cond, ignore)]`） | `#[cfg]` 可到 module 级编译期剔除 | rust-lang 论坛明示**没有**“整个文件/module 一键 ignore”的原生属性，需逐个标或 cfg 包 module [S5] |
| Bazel | test **target**（整个可执行目标） | `shard_count`/tags 是排程语义，不是 skip | Bazel 的 skip 单位是 target——比“文件”还粗；要组级细粒度只能拆 target 或在测试体内自行判断。这正是“更细粒度由测试框架层承担、构建系统不管”的分工先例 [S9, 官方概念文档] |

**为什么更细（断言级）通常不值得——三个结构性理由：**

1. **skip 的语义单位 = 报表的语义单位 = 结果的判定单位，三者必须重合。** JUnit XML 里 `skipped` 挂在 `<testcase>` 上；TAP 里 `# SKIP` 挂在 test point 上；Allure 的 status 挂在 test result 上。所有报表协议的最小单位都是“用例”。断言级 skip 声明要么折叠进用例级结果（那它就是冗余抽象），要么需要新的报表方言（(b) 已证没人接受）。TAP14 规范的自我约束是极好的先例：它**明确拒绝增加“多实现里没有广泛存在的特性”**——"Add no features that are not already in wide usage" [S6]。
2. **控制流与验证流是两种东西。** JUnit 的设计抉择最能说明问题：assumption 失败是"abort"（用例没跑完），断言失败是"fail"（用例判负），两者优先级明确（fail > abort）。假设允许断言级 skip，一个断言中途 skip 与断言失败就无法区分责任归属——框架必须回答“这句 skip 了，后面同一用例的断言算什么”，这个语义在 JUnit issue #4084 的讨论里被刻意定为“不可能"（"It is impossible to abort a test that has already failed"）[S3, S4]。
3. **你的守卫体系已经做到了生态的“最细一等粒度”：组。** pytest 的 class 级 skipif、JUnit 的 assumption、Go 的 subtest skip——这些都是组/用例粒度。缺前置的组 SKIP、其余照跑，恰好是所有主流框架的共同行为模型。断言级前置是 Speculative Generality：没有任何下游（报表、闸门、统计）能消费它。

### Skip 前置机制的粒度上限、partial-skip 报表语义与冗余断言处置
# Skip 前置机制的粒度上限、partial-skip 报表语义与冗余断言处置

### atomcode
# atomcode

$ atomcode -p "测试基建中环境前置/跳过(skip)机制的粒度上限与呈现语义。场景：自研守卫体系把 skip 前置声明从整文件细化到组(group)粒度（如 pytest fixture/JUnit assumption/Go subtest 同级），缺前置的组 SKIP 其余照跑。三个子题：(a) 粒度上限——组粒度足够还是需要断言级(assertion-level)前置标记？pytest mark.skipif/JUnit 5 assumptions/Bazel target 拆分/Rust cfg+ignore 等生态里前置声明最细沉到哪一级、为什么更细通常不值得；(b) 汇总报表里'含部分跳过的套件'呈现——JUnit XML/Allure/GitHub Actions/GitLab CI/TAP 协议如何呈现 partial-skip 套件（仍标 passed 加 skipped 计数 vs 引入 partially-skipped 方言态），哪种是主流惯例；(c) 冗余/重言断言（探测谓词在闸后重复断言）的处置惯例——留着当 belt-and-suspenders…

我来做这个调研：先按五类角度广撒网，再定点深挖官方文档原文。继续第二轮检索：报表语义（JUnit XML/Allure/TAP）与 Bazel/Rust 粒度上限，补 AnySearch 引擎。第三轮定点深挖：打开 TAP 规范、JUnit XML 格式页、GitLab skipped issue、pytest skipping 文档核验原文。再补两块：partial-skip 实战案例原文（sandstream PR）与 GitHub Actions 测试报告对 skipped 的呈现。配额自查：searches: 10（web_search ×4、anysearch batch ×4、tavily ×1 失败[额度耗尽，已用 anysearch/web_search 补位]、角度覆盖 Official/Comparative/Criticism/Currency/Community 五类）| full reads: 6（pytest skipping 官方文档、TAP14 规范、testmoapp/junitxml 格式参考、GitLab issue #29032、sandstream/kit PR #518、JUnit Assumptions javadoc 搜索原文）| 域名 ≥3（docs.pytest.org, testanything.org, github.com, gitlab.com, allurereport.org, docs.junit.org, stackoverflow.com…）✓

## partially skipped

### Skip 前置机制的粒度上限、partial-skip 报表语义与冗余断言处置 > (b) partial-skip 套件的报表呈现
## (b) partial-skip 套件的报表呈现

| 体系 | partial-skip 套件怎么标 | 是否引入方言态 |
|---|---|---|
| JUnit XML（事实标准，无官方 spec） | suite 无状态字段；`tests=` + `failures=0` + `skipped=N` 计数 + 每个跳过用例挂 `<skipped message>` 子元素 | ❌ 不存在 partial 态；"passed unless has failure/error/skipped children" [S7] |
| GitLab CI | 只解析 `failure`/`error`/`skipped`（较新版本）；**历史上空 testcase 被读成 PASSED**——GitLab issue #29032 正是为了补 skipped 支持；job 状态只由退出码决定，XML 不影响 job 状态 [S10] | ❌ |
| GitHub Actions（junit-report 系 action） | 输出 `passed/skipped/failed` 三个独立计数；跳过默认不出注解，可用 `annotate_notice` 把 passed/skipped 也注解出来 [S11] | ❌ |
| Allure | 五态：passed/failed/broken/skipped/unknown，全部在**用例**上；suite 只是聚合视图。v2.25.0 起明确把 skipped 从“通过率"分母中剔除 [S12] | ❌；社区多次请求"排除 skipped"最终都以“调整统计口径而非新增状态"收场 |
| TAP | 每个测试点独立 `ok N ... # SKIP reason`；整组跳过用 `1..0 # reason` 计划级 skip；**没有“套件”层状态**，套件（subtest）的状态由子测试点聚合 [S6] | ❌（todo/skip 是仅有的两个 directive，TAP14 明确说未来才考虑 codify 新 directive） |

**结论：主流惯例是 (passed 状态不变) + (skipped 计数显式携带)，绝不引入 partially-skipped 方言态。** 证据链很强：

- **生态一致性**：五个体系全部拒绝方言态，全部以“用例级 skipped + 聚合计数”表达 partial。
- **反面教材（真实事故）**：sandstream/kit PR #518（2026-08 合并）记录了一次教科书式的双向翻车——同一份守卫结果，GitHub 渲染成 20 行红 ❌（skip 无图标分支、被当成 fail），GitLab JUnit 写成 24 个空 testcase 被读成 PASSED。修复方式恰是本结论：skip 得到自己的图标（➖）与计数（"6 passed, 1 failed, 1 warnings, **18 skipped**"），JUnit 补上 `<skipped message>` + `skipped="18"`，且**特意不改闸门逻辑**（skip 仍然不 gate）。这个 PR 同时演示了 (b) 的正确呈现和“skip 不应改变通过/失败判定”的原则 [S13]。
- **协议哲学佐证**：TAP14 直接把“不加新特性”写进规范目标 [S6]；JUnit XML 连官方规范都没有，靠的是“各工具最大公约数”，发明新状态等于自绝于下游。

给守卫体系的落地建议：suite 级输出三件事——`passed`（照跑成功的组数）、`skipped`（缺前置组数 + 各组原因）、以及一个**聚合层可推导**的“partial”标记（比如 suite 描述行写 "partial: 2/8 groups skipped"）。展示层可以自由组合，但机读面（JUnit XML/TAP）必须只用标准四态。**不要**发明 `partially-skipped` 状态值——它是典型的为假想消费者建机件。

### Skip 前置机制的粒度上限、partial-skip 报表语义与冗余断言处置 > 执行摘要（Tl;dr）
## 执行摘要（Tl;dr）

**(a) 组粒度（fixture/class/subtest 级）是正确的停点，不需要断言级前置标记。** 主流生态最细只沉到“测试用例/参数化实例”一级——pytest 的 `pytest.param(marks=...)`、JUnit 5 的 `assumeTrue()` 在测试体内部抛 `TestAbortedException`、Rust 的 `#[cfg_attr(cond, ignore)]` 贴在单个 `#[test]` 上。再往下沉（断言级）在所有生态里都不存在一等机制，因为它没有可执行语义：skip 是**控制流**决策（跑不跑），断言是**验证**决策（对不对），两者混在一个粒度只会让报表和框架失去唯一的判定单位。**Confidence：高**——pytest/JUnit/Rust 官方文档均证实机制止步于用例/组级，且没有任何主流框架提供断言级 skip。

**(b) partial-skip 套件的主流呈现是“整 suite 不标注新状态，skip 以用例级 `<skipped>` + `skipped=` 计数携带”**，即 JUnit XML 的事实标准（testmoapp/junitxml 参考格式）与 Allure 的做法（suite 不单独标 partial，跳过以用例状态聚合并从通过率中剔除）。引入 `partially-skipped` 方言态是反惯例的：JUnit XML 没有官方规范、下游解析器（GitLab、GitHub Actions junit-report）只认 `passed/failure/error/skipped` 四态，私有状态要么被忽略、要么被误读。**Confidence：高**。

**(c) 闸后重复断言（探测谓词在门禁之后又 assert 一遍同一个前置条件）应删，但“闸后断言的、闸不覆盖的后果”应留。** 这是 Liferay PR 审查规则（"assert 后一行已保证或更强地保证同一事实→删"）、Test Smell Catalog 的 Redundant Assertion、Bond 官方文档三方一致的标准；保留派（"cheap check 无害”）在 SO 上的辩护只适用于**防御未来调用方误用**的场景，不适用于“谓词刚刚在闸上求值过”的同语句重复——后者是测试噪音，且当探测谓词变了而断言没跟着变时会制造假绿。**Confidence：中高**（批评侧证据充分，但"belt-and-suspenders"派在防御性编程语境下有合理声音，见分点结论 c）。

### Skip 前置机制的粒度上限、partial-skip 报表语义与冗余断言处置 > 信息缺口
## 信息缺口

- Tavily 引擎本次配额耗尽未参与，三引擎交叉验证退化为 Exa + AnySearch 双引擎 + 6 次原文核验；关键结论均有 ≥2 独立信源，但“三引擎同证”未满额。
- Bazel 侧未直接打开官方文档原文（依据搜索摘要 + 生态常识）：test target 作为 skip 单位、tags 属排程语义——如需成文引用建议补读 bazel.build 官方 test encyclopaedia。
- 未找到任何主流报表工具**曾经尝试过**"partially-skipped"状态又回退的公开记录（即只有“从未引入”的正面证据，没有“引入后失败”的历史判例）；若你想要更强的否定证据，可在各自 issue tracker 定向检索该词。
[warning] 正在以管理员权限运行 — 模型可能可以访问系统文件。

继续此会话，运行：atomcode -p "…" --resume 2165ae81-30e6-4463-9b22-35255a372b2e

## assertion-level

### atomcode
# atomcode

$ atomcode -p "测试基建中环境前置/跳过(skip)机制的粒度上限与呈现语义。场景：自研守卫体系把 skip 前置声明从整文件细化到组(group)粒度（如 pytest fixture/JUnit assumption/Go subtest 同级），缺前置的组 SKIP 其余照跑。三个子题：(a) 粒度上限——组粒度足够还是需要断言级(assertion-level)前置标记？pytest mark.skipif/JUnit 5 assumptions/Bazel target 拆分/Rust cfg+ignore 等生态里前置声明最细沉到哪一级、为什么更细通常不值得；(b) 汇总报表里'含部分跳过的套件'呈现——JUnit XML/Allure/GitHub Actions/GitLab CI/TAP 协议如何呈现 partial-skip 套件（仍标 passed 加 skipped 计数 vs 引入 partially-skipped 方言态），哪种是主流惯例；(c) 冗余/重言断言（探测谓词在闸后重复断言）的处置惯例——留着当 belt-and-suspenders…

我来做这个调研：先按五类角度广撒网，再定点深挖官方文档原文。继续第二轮检索：报表语义（JUnit XML/Allure/TAP）与 Bazel/Rust 粒度上限，补 AnySearch 引擎。第三轮定点深挖：打开 TAP 规范、JUnit XML 格式页、GitLab skipped issue、pytest skipping 文档核验原文。再补两块：partial-skip 实战案例原文（sandstream PR）与 GitHub Actions 测试报告对 skipped 的呈现。配额自查：searches: 10（web_search ×4、anysearch batch ×4、tavily ×1 失败[额度耗尽，已用 anysearch/web_search 补位]、角度覆盖 Official/Comparative/Criticism/Currency/Community 五类）| full reads: 6（pytest skipping 官方文档、TAP14 规范、testmoapp/junitxml 格式参考、GitLab issue #29032、sandstream/kit PR #518、JUnit Assumptions javadoc 搜索原文）| 域名 ≥3（docs.pytest.org, testanything.org, github.com, gitlab.com, allurereport.org, docs.junit.org, stackoverflow.com…）✓

## YAGNI

### Skip 前置机制的粒度上限、partial-skip 报表语义与冗余断言处置 > YAGNI / Speculative Generality 在测试基建的边界
## YAGNI / Speculative Generality 在测试基建的边界

这个场景是 YAGNI 边界的标准教材，三条先例规律：

1. **粒度机件的正确边界 = 下游能消费的最小语义单位。** 你的守卫体系里，skip 的消费者是：(i) 框架执行流（组级够）、(ii) 报表协议（用例级够，(b) 已证）、(iii) 人（组级 + 原因串够）。断言级前置在这三个消费者上都没有需求方——这就是 Fowler 定义的 Speculative Generality："speculation, no current use"。**先例**：TAP14 把“不加无广泛使用基础的特性”写进规范目标 [S6]；Bazel 选择把细粒度留给测试框架而自己只到 target 级 [S9]——两个“基建层拒绝下沉粒度”的正面案例。
2. **反过来说，YAGNI 不是“不建任何前瞻机制”。** 组粒度本身就是一次从文件级的下沉——它成立的理由是有**已存在的、多种子生态反复验证过的**需求形态（pytest class/module 级、JUnit assumption、Go subtest、Rust 逐 test ignore，全部是组/用例粒度的先例）。判据不是“现在用不用得上”而是“有没有生态级别的重复需求证据”。
3. **报表侧的教训比机件侧更贵。** 方言态的代价不对称：skip 机件多建一层只是内部复杂度，报表发明新状态则是**对外契约**——每个下游解析器（GitLab 解析器只认四个结果元素 [S10]、GitHub action 只输出三个计数 [S11]）都得显式处理或误处理它。kit PR #518 的 20 行红 ❌ 事故就是“呈现层状态机不完备”的代价样本 [S13]。宁可在聚合层做可推导的展示，不动机读协议。

**最终推荐**：(a) 停在组粒度，断言级前置不建；(b) 机读面走标准 JUnit XML 四态 + skipped 计数，"partial" 作为聚合层派生展示；(c) 闸后同语句重复断言删，按 Bond 判据（“这个断言还能失败吗”）做体系化检查，比一刀切更稳。

## tautolog

No matching sections found.

## skipif

### Skip 前置机制的粒度上限、partial-skip 报表语义与冗余断言处置 > (a) 粒度上限：生态把前置声明沉到哪一级
## (a) 粒度上限：生态把前置声明沉到哪一级

| 生态 | 最细一级 | 再细的机制 | 证据 |
|---|---|---|---|
| pytest | 参数化实例（`pytest.param(marks=skipif)`） | 无 | 官方 skipping 文档：粒度阶梯为 function → class → `pytestmark`(module) → param 实例；`pytest.skip()` 命令式调用可精确到执行中某点，但那是**用例级结果的判定**，不是断言级标记 [S1, S2] |
| JUnit 5 | 测试方法内（`Assumptions.assumeTrue()` 运行时中止） | 无 | 官方 javadoc：assumption 失败→test **aborted**（用例粒度）；且“失败优先于中止”——已 fail 的用例不能被 assumption 改成 skip（issue #4084）[S3, S4] |
| Go | subtest（`t.Skipf()` 在 `t.Run` 的闭包内） | 无 | subtest 是 Go 的最细原生单位；`t.Skip` 只作用于当前（子）测试 [S8, 社区共识] |
| Rust | 单个 `#[test]`（`#[cfg_attr(cond, ignore)]`） | `#[cfg]` 可到 module 级编译期剔除 | rust-lang 论坛明示**没有**“整个文件/module 一键 ignore”的原生属性，需逐个标或 cfg 包 module [S5] |
| Bazel | test **target**（整个可执行目标） | `shard_count`/tags 是排程语义，不是 skip | Bazel 的 skip 单位是 target——比“文件”还粗；要组级细粒度只能拆 target 或在测试体内自行判断。这正是“更细粒度由测试框架层承担、构建系统不管”的分工先例 [S9, 官方概念文档] |

**为什么更细（断言级）通常不值得——三个结构性理由：**

1. **skip 的语义单位 = 报表的语义单位 = 结果的判定单位，三者必须重合。** JUnit XML 里 `skipped` 挂在 `<testcase>` 上；TAP 里 `# SKIP` 挂在 test point 上；Allure 的 status 挂在 test result 上。所有报表协议的最小单位都是“用例”。断言级 skip 声明要么折叠进用例级结果（那它就是冗余抽象），要么需要新的报表方言（(b) 已证没人接受）。TAP14 规范的自我约束是极好的先例：它**明确拒绝增加“多实现里没有广泛存在的特性”**——"Add no features that are not already in wide usage" [S6]。
2. **控制流与验证流是两种东西。** JUnit 的设计抉择最能说明问题：assumption 失败是"abort"（用例没跑完），断言失败是"fail"（用例判负），两者优先级明确（fail > abort）。假设允许断言级 skip，一个断言中途 skip 与断言失败就无法区分责任归属——框架必须回答“这句 skip 了，后面同一用例的断言算什么”，这个语义在 JUnit issue #4084 的讨论里被刻意定为“不可能"（"It is impossible to abort a test that has already failed"）[S3, S4]。
3. **你的守卫体系已经做到了生态的“最细一等粒度”：组。** pytest 的 class 级 skipif、JUnit 的 assumption、Go 的 subtest skip——这些都是组/用例粒度。缺前置的组 SKIP、其余照跑，恰好是所有主流框架的共同行为模型。断言级前置是 Speculative Generality：没有任何下游（报表、闸门、统计）能消费它。

### atomcode
# atomcode

$ atomcode -p "测试基建中环境前置/跳过(skip)机制的粒度上限与呈现语义。场景：自研守卫体系把 skip 前置声明从整文件细化到组(group)粒度（如 pytest fixture/JUnit assumption/Go subtest 同级），缺前置的组 SKIP 其余照跑。三个子题：(a) 粒度上限——组粒度足够还是需要断言级(assertion-level)前置标记？pytest mark.skipif/JUnit 5 assumptions/Bazel target 拆分/Rust cfg+ignore 等生态里前置声明最细沉到哪一级、为什么更细通常不值得；(b) 汇总报表里'含部分跳过的套件'呈现——JUnit XML/Allure/GitHub Actions/GitLab CI/TAP 协议如何呈现 partial-skip 套件（仍标 passed 加 skipped 计数 vs 引入 partially-skipped 方言态），哪种是主流惯例；(c) 冗余/重言断言（探测谓词在闸后重复断言）的处置惯例——留着当 belt-and-suspenders…

我来做这个调研：先按五类角度广撒网，再定点深挖官方文档原文。继续第二轮检索：报表语义（JUnit XML/Allure/TAP）与 Bazel/Rust 粒度上限，补 AnySearch 引擎。第三轮定点深挖：打开 TAP 规范、JUnit XML 格式页、GitLab skipped issue、pytest skipping 文档核验原文。再补两块：partial-skip 实战案例原文（sandstream PR）与 GitHub Actions 测试报告对 skipped 的呈现。配额自查：searches: 10（web_search ×4、anysearch batch ×4、tavily ×1 失败[额度耗尽，已用 anysearch/web_search 补位]、角度覆盖 Official/Comparative/Criticism/Currency/Community 五类）| full reads: 6（pytest skipping 官方文档、TAP14 规范、testmoapp/junitxml 格式参考、GitLab issue #29032、sandstream/kit PR #518、JUnit Assumptions javadoc 搜索原文）| 域名 ≥3（docs.pytest.org, testanything.org, github.com, gitlab.com, allurereport.org, docs.junit.org, stackoverflow.com…）✓


> **Tip:** Results are scoped to this batch only. To search across all indexed sources, use `ctx_search(queries: [...])` or call ctx_batch_execute with `query_scope: "global"`.

Searchable terms for follow-up: cfg_attr, belt-and-suspenders, testanything, allurereport, stackoverflow, junit-report, partial-skip, partially-skipped, assumetrue, impossible, speculative, generality, anysearch, criticism, community, rust-lang, 状态只由退出码决定, directive, 这个断言还能失败吗, atomcode, official, currency, function, features, mutation, fixture, failure, testing, padding, skipif, tavily, 闸后重复断言, assert, status, 写进规范目标, 缺前置的组, 参数化实例, marks, error, cheap
