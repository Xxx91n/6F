# R22-Q2 atomcode 调研题面——环境敏感腿断言处置

## 问题

本仓守卫体系存在一类「环境敏感腿」断言——断言对象不是工具行为而是外部环境状态：

- 38:H4 `被测仓零写入（anysearch-cli git status 干净）`：spawnSync git status --porcelain 活探 sibling 仓 D:/Aworker/anysearch-cli，实测被并行 agent（grill-round-70）弄脏 FAIL；
- 39:I1/I2/I3：env-manager/anysearch-cli 工作树零写入＋jiahao 变更面仅 macro-b-regression.yml（I3 另受 D-046 撤 workflow 决策漂移）；
- 40-check 同有 BASES sibling 引用；
- 病灶：断言测的是环境状态非工具行为——无法区分「审计工具写了被测仓」（真回归）与「并行 agent 弄脏邻仓」（环境噪声），因果归因先天断裂；验收时使命（#38/#39 one-shot 证明审计不写被测仓）已 fired；
- 前置决策 D-073（本轮 Q1 已定）：册外 13 件三向分拣，环境敏感腿显式移交本题——本题决定其终态。

双轴分野：env-sensitive ∩ 验收探针（使命=验收时点证明）vs env-sensitive ∩ 活契约（「审计永不写被测仓」是工具不变量，但断言面写错对象——该测受控 fixture 不测活环境）。

## 候选

(a) 双轴处置：env∩验收探针→D-073 sealed 通道（attestation 记验收时 fired 真相）；env∩活契约→不变量抽取到受控 fixture 测试（engine test 临时 clone 跑审计断言零写入——测工具不测环境），守卫面原断言随 sealed 退役并记 migration 指针；
(b) env-sensitive 标记＋前置探针 ENV-SKIP 态（第四输出态，sibling 脏→ENV-SKIP 非 FAIL）；
(c) 前探＋快照化（对验收时点快照的增量检查）；
(d) 入册 XFAIL（占 cap 位）；
(e) 维持现状缓挂。

## 必回顾（硬要求）

1. 决策账本全部 current 记录：D:\Aworker\6F\.scratch\macro-audit\decision-ledger.md（D-001~D-073，重点 **D-073 sealed 第三态/attestation 双锚**／D-071 清单制／D-068 baseline／D-044 不可变历史／D-046 撤除先例／D-063 有实证即裁决）；
2. ADR：D:\Aworker\6F\docs\adr\0001-0021（重点 0013 三层验收闸门／0009 intake 本地优先）；
3. CONTEXT.md：D:\Aworker\6F\CONTEXT.md（Acceptance Gate／Self-probe／Trigger-gated Closure）；
4. 实物：D:\Aworker\6F\.scratch\architecture-recovery\reports\38-check.mjs（H4 行 103）＋39-check.mjs（I1-I3 行 146-149）＋40-check.mjs＋D:\Aworker\6F\engine\test\（查是否已有零写入 fixture 测试覆盖）＋R22-Q1-atomcode-research.md §④⑤（sealed 落地形态与失败模式）；
5. **工业界成熟心智模型（重点）**：测试环境隔离原则（hermetic tests——Google Testing Blog「Hermetic Servers」/bazel sandboxing 模型）、fixture vs live-dependency 分野（test doubles/fakes over live environment）、pytest skipif/precondition 模式与「skip 是测试债」批评、contract test 中 provider state 治理（Pact provider states）、CI 环境前置检查模式（probe-gate-then-assert）、「don't test the framework/environment」测试纪律、acceptance-time attestation vs continuous-verification 分野、Google「test the behavior not the environment」、flaky test 环境归因的 causal-attribution 文献、dirty-worktree 类断言的工业化处置先例（pre-commit/CI clean-tree checks 如 vercel/turborepo 的 workspace cleanliness gate 是前置门禁非持续断言）；
6. 给出推荐与理由＋失败模式＋落地形态（fixture 测试的归属面：engine/test 还是守卫层？migration 指针格式？ENV-SKIP 若采纳的输出态语义？双轴分拣的机检判据？）；
7. 显式核查与本仓 current 决策的冲突面（特别：sealed 通道对 env 腿的适用边界——attestation 记的是「验收时 fired」而 env 腿的 invariant 语义是「永远不写」，封存是否会把活的不变量义务一并埋掉？fixture 迁移后谁保证新测试存在——33-check 断言面？D-071③「断言照跑」对迁出断言的约束？）。

## 交付

返回结构化 Markdown：①结论（推荐+一句话）；②逐候选裁定；③工业先例证据（带 URL）；④落地形态设计；⑤失败模式与治理；⑥与本仓决策冲突核查表（逐条 D-xxx）；⑦信息缺口；⑧建议追问。
