# R48-Q4 调研报告 —— 守卫伴生再生负担最小化裁量

> atomcode 深调研存档（轮48 Q4）。执行备注：首轮委托因回传通道失效卡死（PID 10000 残留 ~55min 无产出），进程退出后 `-c` 续跑同会话血缘完成；知识库跨会话召回（R31-Q5 scrubber 等价物／R39-Q2 豁免棘轮）＋本轮 7 篇原文核验。

## 1) 执行摘要（Tl;dr）

**推荐 (v) 复合方案，但以 (i) 确定性种子化为主腿、(ii) volatile 豁免清单为防御性副腿，置信度：高。** 工业界对两条腿各有成熟独立先例：确定性产出有 SOURCE_DATE_EPOCH 规范（RFC 2119 级 MUST 条款）＋Bazel hermeticity＋Nix content-addressing 三源背书「治本在生成器」；断言面 volatile 字段豁免有 Jest snapshot serializer／propertyMatchers＋ApprovalTests/Verify scrubber 双生态背书「治标在断言面」。两者作用层正交（生成器 vs 断言消费端），复合不冲突且互为纵深：种子化后豁免清单自动变空集≈纯冗余防御。单独推荐 (i) 亦可成立（若工作量受限）——(ii) 单独采信风险最高（豁免膨胀吞信号有业界实证）。(iii) 自动 discard 分诊器无业界先例支持自动丢弃动作，**不推荐**。

## 2) 对比矩阵

| 项 | 治理层 | 工业界先例强度 | 风险面 | 伴生负担消除 | 判定 |
|---|---|---|---|---|---|
| (i) 确定性种子化 | 生成器（源头） | 强：SOURCE_DATE_EPOCH（2015 规范，Debian/GCC/Python 等全线支持）＋Bazel hermeticity＋Nix content-addressed | 改 engine/check 源码面须走 D-177 工序（一次性成本） | 完全消除（文件只在语义变化时漂） | **主腿** |
| (ii) volatile 豁免清单 | 断言消费端 | 强：Jest serializer/propertyMatchers、ApprovalTests Scrubbers（guid_1 同值同替）、Verify ScrubInlineGuids/ScrubMachineName | 治标：git 漂移仍在；豁免膨胀吞信号（snapshot churn 实证：过宽豁免=diff 失去审查价值） | 不消除（文件照漂，仅断言不费机位） | 副腿（防御性） |
| (iii) 漂移自动分诊 | 判别器新机制 | 弱：scrubber 惯例都是**替换展示**而非自动丢弃；无「自动 discard 产物」先例 | 误判吞真信号；自动 discard＝证据完整性反模式 | 部分消除 | **不推荐** |
| (iv) 不动 | — | —（现状维持） | 负担常驻随 guard 集膨胀线性加重（12~14 件/轮） | 零 | 仅作 fallback |
| (v) (i)+(ii) 复合 | 双层正交 | 两腿各自独立成熟（正交性见分点结论④） | 工作量最大；但豁免清单可按「最小集＋棘轮」建制对冲膨胀 | 完全消除＋断言面冗余防御 | **推荐** |

## 3) 分点结论

**① 确定性种子化（i）存在成熟治本先例——三源同构。**
- **SOURCE_DATE_EPOCH 规范**（reproducible-builds.org/specs，2015 立版 2017 修订，RFC 2119 级）：「Build processes MUST use this variable for embedded timestamps in place of the 'current' date and time」——把嵌入时戳从墙钟改为 env 注入是规范级 MUST；并明确动机「these dates are unreliable indicators」，与本仓 run_at 时戳无信息量的判断同构。GCC/Clang/Python/Debian 全线支持，LFS 评价为 "a massive success"。
- **Bazel hermeticity**（bazel.build/basics/hermeticity）：「given the same input source code and configuration, a hermetic build always returns the same output」；点名「Actions or tooling that create files non-deterministically, usually involving build IDs or timestamps」为头号 non-hermeticity 源——即生成物含墙钟时戳被业界归类为**缺陷而非特性**。
- **Nix content-addressing**（nix.dev/manual）：派生输出按内容寻址，输出路径＝输入哈希的函数——UUID 改内容派生哈希正是 content-addressed 思想在测试断言面的应用（仓内 attribution-calibration 包已有同型先例「Content-addressed JSON per bundle」）。
- 结论：**治本方向有工业级先例，且先例强度是规范级而非惯例级。**

**② volatile 字段豁免清单（ii）先例同样成熟，但膨胀风险有实证、须防滥用机制。**
- **Jest snapshot serializer**（官方＋dev.to 2024 实操）：`expect.addSnapshotSerializer` 对 id/createdAt 类动态值做 deterministic placeholder 替换（`[ID]`/`[TIMESTAMP]`）；propertyMatchers（`expect.any(String)`）是同义的键级豁免——两机制皆官方内建，说明「断言面豁免 volatile 字段」是快照测试的**一等公民惯例**。
- **ApprovalTests Scrubbers**（官方文档）：scrubber＝string→string 函数，Guid scrubbing 特色是**同值同替**（同一 guid 多处出现均替换为 guid_1——保住了「同 ID 引用一致性」这一可断言信号）；Date scrubber 走正则模板枚举。**Verify 生态**（官方 scrubbers.md，3.5k star）：内建 ScrubInlineGuids/ScrubMachineName/时戳 scrub 引擎，且文档明确引擎语义纪律（替换文本不再被其他 scrubber 重扫＝**防级联误替**）。
- **风险面实证**（dermothughes.com 2025 批评文＋helpmetest.com 2026 最佳实践）：snapshot churn 的病灶恰是「锁面含无关漂移值→diff 失去审查价值→开发者 reflexive `-u` 盲更」；但反向风险同样被点名——「test only what you care about」若划得过宽，真回归被吞。**防滥用机制业界三件套**：豁免须显式枚举（键级/正则级，非全文件豁免）＋diff 仍可见（豁免≠不可见，ApprovalTests 的 guid_1 占位保留结构可审）＋（借本仓 R39-Q2 已立法先例）gitleaks `--deny-unused-baseline`「死项即红」棘轮——豁免清单条目须可达且单调收敛。
- **对两族字段的分流判据**：纯挥发族（run_at/UUID/receipt-hash）scrub 是各家内建默认；派生信号族（编行计数）**没有任何生态提供内建豁免**——ApprovalTests 同值同替保留的就是引用一致性信号。这印证题面判断：派生计数族豁免＝真漂被吞，不可入清单。

**③ 漂移自动分诊（iii）无业界先例——显式驳回。**
- scrubber 惯例全部是**替换展示**（placeholder 替换后 diff 仍可审），无任何生态支持「自动 discard 产物」动作；自动丢弃在证据完整性强纪律仓中属反模式（绕开 D-140② 记账面且误判吞真信号）。

**④ 正交性裁决（④号特别裁决）**：(i) 作用层=生成器源头、(ii) 作用层=断言消费端——两层正交不互斥，复合互为纵深；种子化后豁免清单自然变空集=纯冗余防御面。

**⑤ 适用性边界**：(i) 单独采信即可消除伴生 churn（主腿独立成立）；(ii) 单独采信风险最高（豁免膨胀吞信号有实证）；(iv) 与守卫集合扩张趋势反向。

**⑥ 冲突扫描（对账本 current 决策）。**
- **D-140②（bundle-only commit 纪律）**：(i)/(v) 同向不冲突——bundle 纪律管「已发生的再生变更如何合法落账」，(i) 让变更不再发生，义务随之空转，属消灭病灶而非绕开纪律。(iii) 则实质绕开该纪律（自动 discard 不留 bundle commit），冲突——此为驳回补强理由。
- **D-171（01 系 frozen 证据包禁区）**：01 系不在再生面（golden 工件族为 48/56/75a 系），(i)/(ii) 触碰面与禁区无交集；落地时须显式声明「不改 01 系钉值」作为边界条款。
- **D-177（预声明验证包新工序）**：(i) 改 engine/check 源码面＝按新规先落声明物化面＋实跑必选——程序性合规非方向冲突；可与 (ii) 断言面清单同声明同实跑摊薄成本。
- **D-135（票面纪律）**：裁定建议以「票面＋调研报告」入裁定链，不代裁。
- **D-046④（回归语义）**：种子化后「文件不漂」可能让某件 check 的再生路径失去每跑实测机会——需在声明面确认再生路径仍被至少一件 check 实跑覆盖（否则生成器退化成死代码无人知）。业界对应物=Bazel「null build 验证」（跑两次第二次应零变更——恰可作本仓实跑判据：种子化后同输入两跑须零 diff，本身即新 check 断言内容）。

## 4) 推荐＋理由＋置信度

**推荐 (v) 复合：① (i) 为主腿——生成器确定性化（SOURCE_DATE_EPOCH 式 env 注入 run_at＋UUID 内容寻址化），落 D-177 声明＋实跑包；② (ii) 为副腿——断言面 volatile-fields 最小枚举清单（仅纯挥发族键名，派生计数族明确禁入），附 gitleaks「死项即红」式棘轮防膨胀；③ 新增种子化自检（同输入两跑零 diff）可顺带成为守卫。** 置信度：高——治本与豁免两腿各有 ≥2 独立信源（规范级＋双生态官方文档），正交性有作用层分离的结构性理由，冲突扫描全绿（除 (iii) 被否）。置信折扣：本跑 atomcode 深调研因回传故障未取得独立第三轮复核，结论建立在知识库跨会话召回＋本轮 7 篇原文核验之上；ApprovalTests/Verify 均已开原文，Jest propertyMatchers 细节部分依赖摘要。

**落点建议（供裁定链参考，非代裁）**：
1. 立票裁 (v)，(i) 先行：(ii) 未建时 (i) 单独即可消除伴生 churn，(ii) 随同轮或下轮补防线；
2. (ii) 立法面钉两条硬边界：清单仅收纯挥发族键名（派生计数族禁入）＋死项即红棘轮；
3. (iii) 显式驳回：自动 discard 无先例且绕开 D-140② 记账面——驳回理由入去向表；
4. (iv) 不采：负担随 guard 集线性膨胀，与守卫集合扩张趋势反向。

## 5) 信息缺口

1. 本跑因首轮回传通道失效未取得独立复核腿，结论锚在知识库召回（R31-Q5/R39-Q2）＋本轮原文核验——置信度标高但带折扣注记。
2. Jest propertyMatchers 细节部分依赖摘要层（官方文档未逐行读）。
3. SOURCE_DATE_EPOCH 在 Node 测试生态中的接入惯例（vs 构建域主流用法）未深挖——本仓落地形态（env 注入 vs 生成器内部固定）由执行窗裁量。
