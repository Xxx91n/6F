# 35-atomcode-research — 代码考古工具分析面划分 + Golden 契约测试调研

> 通道：`ctx_batch_execute` → `atomcode -p`（串行单发，timeout 600000）；本文件为蒸馏落盘，全文已自动索引至 ctx（source=atomcode，检索词「分析面划分」可召回）。
> Sufficiency Gate（atomcode 自报）：searches 6（web_search 1 + Tavily 1 + AnySearch 2 + ctx_search 2 批）｜angles 4 类（Official/Comparative/Criticism/Community）｜full reads 7 篇原文 + 知识库 2 篇｜独立信源域名 6。

## 调研问题（verbatim）

调研代码考古/演化分析工具的分析面（analysis facet）划分工业先例（如 code-maat、CodeScene、CodeLore 等）：它们如何分组/分层组织分析维度；以及对外部 CLI 上游做 golden 契约测试（录制回放 cassette）的成熟做法与已知局限。给推荐方案，列 >=2 个先例对比。

## 执行摘要

- 分析面分组的工业收敛模式 = **「技术行为 ‖ 组织社会」二分 + 架构聚合层**；机器接口保持扁平枚举＋did-you-mean（CodeLore CLI 契约即最佳实践），分组只是文档/展示层概念。
- Golden 契约测试对「git 历史→CSV/JSON 的确定性纯函数式 CLI」是**最佳适用场景**；已知局限明确：回放证回归不证正确性、磁带过期假绿、不确定性须在边界冻结。
- 与本票关系：D-035「层需求×面族分批契约」与收敛模式同向；#31 已建 fixture 回放先例符合六步法。

## 对比矩阵（三先例，均有原文核验）

| | code-maat (Clojure, 2013) | CodeScene (商业平台) | CodeLore (Rust, 0.28.0) |
|---|---|---|---|
| 分析面数量 | 19（扁平枚举于 --help） | 文档化 ~15 核心概念 | 60+（README 称 61；本仓实测 `analyze --help` 枚举 57——文档计数与二进制枚举存在计数差，差异如实登记） |
| 分组方式 | 无显式分组（README 叙事分节；机器接口扁平） | 两层分类 Technical ‖ Organizational & Social | 谱系归组：code-maat 19 面全保留 + 结构×历史融合组 + 交付/流程类 + 函数级 |
| 层级 | 单层（文件），`-g` 分层文件聚合到架构层 | file / architectural / function 三层 | 同三层 + import 图融合面 |
| 输出契约 | CSV stdout | dashboard / REST API | CSV/JSON/Markdown/ndjson/SARIF/SPA/MCP；banner+footer 走 stderr |

## Golden 契约测试——成熟做法（dev.to 六步法 + Codurance/ApprovalTests + Bache 三源交叉）

1. 契约 = 可观察输出：冻结 argv+cwd+env，录制 stdout+stderr+exit code+输出文件；大输出用 sha256+字节数替代。
2. 输入固化 fixtures；至少 happy + 空输入 + 丑边界三用例。
3. 录制后禁止规范化（pretty-print/排序键会掩盖有效差异）。
4. 基线变更走人类审批（approval testing），不可变 golden 会「绿色但过期」。
5. 覆盖空输出/单行/多行的条数语义（cardinality 是各实现共同翻车点）。
6. 证明 harness 能红：故意改可观察量 → 套件必须只在该用例失败。

## 已知局限（多源一致）

- 回放证回归不证正确性；上游版本变化须强制重录一轮 + 漂移报告给人审（本仓 31-upstream-drift.md 惯例同构）。
- 不确定性（时钟/UUID/迭代序）在边界冻结，禁录制后过滤。
- 命名趋势：Golden Master → Approval Testing（Bache）；本票沿用既有 golden 契约测试措辞（与 #31 一致，不追潮流改名）。

## 推荐方案（本票采纳映射）

- 面组织：接口保持扁平枚举（codelore analyze -a <name>），族划分（演化主干/S3 族/S5 族）只落在契约表与文档层——与推荐「分组不进机器接口」一致。
- 每面三件套：golden cassette（真实 stdout 录制）+ manifest 独立记录（columns/row_count/sha256 由非解析器路径算出）+ 契约测试回放断言。
- 红证：畸形输入用例（shape drift 拒绝）沿用 #31 G5/G6 先例。
- 漂移通道：facet 行数/列变化 → 重录 cassette + 报告登记（衔接既有 upstream-drift 惯例）。

## 冲突点名

无——调研结论与 D-035（分批契约）、ADR-0014（适配层禁业务规则）方向一致，无 revised 需求。如实登记一项非冲突差异：CodeLore README 自称 61 面 vs 本机 0.28.0 `analyze --help` 实测枚举 57——契约锚以二进制枚举为准（任务书纪律），README 计数差不影响本票。

## 信息缺口（不影响本票）

- code-maat `-g` 分层文件规范未读源码级原文；Tornhill 论文级出处未直读。
- （历史遗留缺口，同前次调研）S5 单人仓降权曲线无工业分桶基线——属 #37/任务4 面，非本票范围。

## 来源清单（6 独立域名）

1. code-maat GitHub README（Official）— 19 面清单、-g 分层、CSV 契约、CodeScene 谱系声明
2. CodeScene Terminology 官方文档（Official）— Technical‖Organizational 两层分类、三层级、Knowledge Islands 定义
3. CodeLore GitHub README（Official，2026-08 活跃）— 61 面清单、融合分组、code-maat drop-in 兼容
4. repowise OSS alternatives 对比文（Comparative，2026-05-20）— 三工具定位矩阵
5. Codurance Golden Master 方法论（Community，2012）— 固定种子 + approval 流程
6. Bache approval testing + Keploy record-replay 批评文 — 基线审批与磁带腐烂论证
