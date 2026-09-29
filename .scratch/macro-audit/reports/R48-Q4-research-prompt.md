# R48-Q4 调研题面 —— 守卫伴生再生负担最小化裁量（确定性种子化 vs 机检面豁免 vs 漂移分诊）

（提交 atomcode-research 深调研；账本=唯一事实源立场，调研须回顾 decision-ledger 全部 current 记录、docs/adr、CONTEXT.md 词条、工业界成熟落地心智模型为重点。）

## 背景

本仓为五尺度工程内容审计产品的 spec-level 规划+治理仓。治理守卫面=60 件 check 脚本（.scratch/architecture-recovery/reports/*-check.mjs）＋guard-all-run.mjs 总跑器。多份 check 在跑时会再生成 golden 工件（48-micro-a-golden-*×11、56-heldout-eval.json、75a-census-findings.json 等 12~14 件）——工件内 run_at 时戳/receipt 哈希/UUID/派生计数族字段每次必漂，导致：①审计/收口窗每跑守卫须 but discard 还原被审态（12 件弃置实证）；②或产 bundle-only commit（D-140② 纪律下合法但常驻成本）。再生面本身是「守卫跑通」证据属功能不可删。

漂移字段两族：(a) 纯挥发族=run_at/UUID/receipt-hash（无信息量噪声）；(b) 派生信号族=编行计数类（随真实内容变化——豁免它=真漂被吞）。禁区：01 系 frozen 证据包钉值不动（D-171 量测基准锚立法面）。

## 候选

(i) 确定性种子化（治本）：生成器改确定性产出——run_at 固定 epoch/env 注入、UUID 改内容派生哈希（content-addressed）→ 文件只在真实语义变化时漂，伴生 churn 消灭于源头；派生信号族天然不受影响。利=负担归零机检面零让步；弊=改生成器=engine/check 源码面变更（走执行批＋D-177 新规工序）。
(ii) 字段移出机检面（豁免清单）：断言面只验结构＋语义键，run_at/UUID/hash 归 volatile-fields 枚举制豁免清单；文件仍漂但断言不再为其费机位。利=定向精准；弊=治标——git 漂移照样发生，豁免清单须防误纳真信号。
(iii) 漂移自动分诊：守卫跑后跑「仅 volatile 字段漂移」判别器——真则自动 discard 免 bundle 义务，含真实语义漂移才走 bundle commit。利=纪律语义不变；弊=判别器=新机制（误判吞真信号）。
(iv) 不动：12~14 件/轮已被 D-140② bundle 纪律＋discard 工序覆盖。利=零变更；弊=负担常驻随 guard 集合膨胀变重。
(v) (i)+(ii) 复合：生成器确定性化治本＋断言面 volatile 字段枚举豁免清单同步建制（两正交动作）。利=两侧都治；弊=工作量最大。

## 调研要求

1. 工业界成熟心智模型（重点）：测试/断言产出中的非确定性治理惯例——快照测试（Jest snapshot serializer 对 volatile 字段的 deterministic replacement）、golden file/approval test 的 scrubber 惯例（Approvals/Verify 生态对 timestamp/guid 的 scrub 机制）、reproducible build 运动的确定性产出心智模型（SOURCE_DATE_EPOCH 等环境注入先例）、content-addressed output（bazel/nix 的工件哈希）在测试断言中的应用；「生成物即证据 vs 生成物是副产物」的分档判据——何时该钉值何时该豁免；CI/守卫面噪声治理惯例（flaky artifact drift 的处置先例）。
2. 判候选：五候选各评强弱——特别裁决：①确定性种子化（i）是否对治本方向存在成熟先例（Jest/Verify/SOURCE_DATE_EPOCH/content-addressed）；②volatile 字段豁免清单在断言纪律中的风险面（豁免膨胀吞信号的先例与防滥用机制）；③漂移自动分诊器（iii）在证据完整性强纪律仓中是否被业界接受（自动丢弃产物的先例）；④(i) 与 (ii) 是否正交可复合而非互斥。
3. 冲突扫描：结论是否与本仓 current 决策冲突（重点 D-140② bundle commit 纪律、D-171 frozen 证据包禁区、D-177 预声明验证包新工序〔刚立法——源码面变更须先落声明物化面＋实跑必选〕、D-135 票面纪律、D-046④ 回归语义）。
4. 推荐+理由+置信度；缺口如实标位。
