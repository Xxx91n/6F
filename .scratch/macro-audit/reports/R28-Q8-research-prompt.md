# R28-Q8 atomcode 调研题面

> 2026-09-22 轮28 grill Q8。数据源纪律：调研须回顾 decision-ledger 全部 current 记录、docs/adr 全部 ADR、CONTEXT.md 全部词条、工业界成熟心智模型（重点）。结果辩证看待；与 current 决策冲突→标 revised 呈报不静默改向。

## 系统背景

工程内容审计产品：DuckDB 单文件 SSOT、字节级确定性可重放、报告=read model、MCP 只读查询面。quarantine 建制：契约层三态分类器（D-103）、仅 %cI 接线+兜底码 UNCLASSIFIED_FIELD_ANOMALY+reason code 对齐 fsck msg-id（D-104）、锚病态→unsupported（D-105）、独立 quarantine_log 表（D-106/D-108）、逐字段恒等式（D-107）、协议崩溃=工件文件（D-109）。

## 已就位决策（本题约束）

- D-100③：--strict-quarantine 反向开关=CI/回归对「新出现的 reason code」硬崩——基线未定义；
- D-104②④⑤：兜底码 UNCLASSIFIED_FIELD_ANOMALY 独立计数、立法时迁移存量；reason code 受控词表（枚举/CHECK）——分类器只能吐枚举内成员，「枚举外新 code」按定义不可能；新 reason code=契约覆盖缺口信号登记 known-gaps 台账；
- 双消费通道：cli.ts（可挂 flag）＋39-macro-b-one-shot.mjs（不走 cli.ts，D-060④ 有意平行对照）——strict 须双路同语义覆盖；
- 回归面=macro-b-regression CI 工作流跑公网 git 仓全历史；git/git 有已知病态 commit（「 INDIA」）；
- 若 strict=「任何 quarantine 即崩」则 git/git 腿永红，与 D-100 把字段级病态定为非致命矛盾——此读法已排除。

## 裁决问题

strict 的基线语义与挂载：

- (a) 仓级声明式基线：每回归仓一份 accepted_reason_codes 清单（回归 harness 版本化常量+PR 评审）；strict 下 reason_code∉该仓基线→硬崩；UNCLASSIFIED_FIELD_ANOMALY 永不在基线内；空基线=零容忍；挂载=cli flag＋39 脚本 env/常量双通道；
- (b) 全局基线（不分仓一份清单）——粒度错配：A 仓已知病态在 B 仓出现绝非「已知」；
- (c) 仅兜底码即崩（strict=UNCLASSIFIED_FIELD_ANOMALY 出现即硬崩）——最简但已命名新族（锚病态在业务仓首现）静默放行；
- (d) 上次运行快照 diff 基线——CI 干净 checkout 无上次库=恒崩＋跨运行状态依赖违无状态回归面。

## 调研任务

1. 工业界「已知问题基线/豁免清单」心智模型：git fsck skipList（逐实例枚举）、Compilations -Werror+抑制清单、baseline 化的静态分析（如 Android lint baseline、detekt baseline、Betterer/Jest snapshot 渐进收紧）、SARIF suppressions、CVE 扫描 accepted-risk 清单——基线按什么粒度声明（全局/仓级/规则级/实例级）、存哪（代码库文件/配置/注释）；
2. 「新违例硬崩、已知违例容忍」回归门禁的成熟形态：ratchet 机制（只许减少不许新增）、baseline diff 门禁、allowlist expiry（豁免带 deadline）——哪种语义与「新 reason code 硬崩」最同构；
3. 兜底/未分类信号的处置惯例：unknown/unclassified 桶在门禁中通常从严还是从宽（fail-closed vs fail-open）；
4. CLI flag vs env var vs 配置文件的回归开关挂载惯例（CI 场景双通道需求）；
5. 辩证处：每选项找真实反例；(a) 仓级基线的维护成本与「接受新病态=改基线」评审摩擦是否实证存在；(c) 的最简形态被哪些先例采用。

输出：推荐选项（可修正变形）＋理由＋对本仓既有决策的冲突核查。
