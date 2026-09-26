# R35-Q4 调研题面（atomcode）

仓库 D:\Aworker\6F 是 spec-level 工程内容审计产品（TypeScript engine + DuckDB facts）。刚完成 R34 口径卫生批：SuppressedFacetReason 词表收窄为诚实可达集 'new_file' | 'insufficient_history'（D-143②），收窄核心理由=closed 枚举 exhaustiveness 判力可拦截未来新失败枝产生未声明原因码。

## 问题

R35 审计窗呈报项 P4（留待用户裁）：engine/src/fact/file-card.ts:299 存在 suppressedFacets.push({ facet: a, reason: failure as SuppressedFacetReason })——上行 let failure: FailureState 为宽型，suppressed 分支内靠 as 断言强转词表型。后果：未来第三失败枝产生词表外原因码时 as 静默放行，D-143② exhaustiveness 判力被绕过（编译期契约名义化）。修法一行：let failure: 'ok' | SuppressedFacetReason——TS 4.4+ 支持 const suppressed = failure !== 'ok' 别名收窄，if (suppressed) 内 failure 自动窄为词表型，cast 可删；新枝非词表成员→编译错拦截兑现。

关键成本事实：as 断言与类型注记均为编译期擦除物——修法后 emitted JS/d.ts 大概率字节不变（dist/cli.js 257947B 可实测证），行为回归空间≈0。审计协议字面要求「返工须重跑 §1 全套（16 条声明验收）」。

候选处置：
(a) 立即独立返工窗——一行修＋§1 全套重跑（审计协议字面），最稳妥但为一行类型修付全套成本；
(b) 随 T2 实施窗顺带——独立 commit 挂 T2 窗口，§1 重跑并入 T2 本需验收（D-070 随触碰顺带先例）；exhaustiveness 保护延期到 T2 落地，但当前词表正确 cast 产出码也对——风险是未来隐患非现行 bug；
(c) 立即返工＋轻量验证——一行修＋以「dist 字节不变＋83-check＋smoke」作行为不变性证据替代 §1 全套；若字节对比出现意外差异再升格 (a)——判据预声明非偷懒，验证强度让步须用户拍板；
(d) 不返工登记——cast 标 known-gap，D-143② 购买理由被搁置。

## 调研要求

1. 回顾 D:\Aworker\6F\.scratch\macro-audit\decision-ledger.md 全部 current 记录（重点 D-143② 收窄与 exhaustiveness 购买理由、D-095① 删除派/④reserved 外部输入面、D-126③ 词表族、D-136 失败态收口、D-070 随触碰顺带、D-139 搭车禁则与轻规约文法、D-135 票面纪律、D-104④ 加码非破坏、验收协议/审计重跑惯例相关条款），docs/adr/（0013 三层验收、0022 Quarantine、0023 Micro-B），CONTEXT.md（Suppressed Facets、Reason-Code 词表、消费面驱动资产、Trigger-gated Closure）；
2. 工业界成熟落地的心智模型（重点）：TypeScript as 断言转换的工程处置惯例与风险文献（as-cast 作为类型契约漏洞的批评、TS 官方与社区对 assertion vs narrowing 的处方）、exhaustive check/never 赋值模式在 union 收窄后的编译期拦截先例、tsd/eslint no-unnecessary-type-assertion 类工具链对 cast 的机检实践、「type-level-only 变更的验证强度」业界分档（字节等价 emitted output 作行为不变性证据的先例——编译器升级评估、refactor vs behavior-change 验收分档）、Rust #[non_exhaustive]/sealed trait 对照、类型收窄后验证协议在 semver 语境的成熟处置；
3. 给出推荐与理由，显式指出与账本任一 current 决策的冲突点（若有——冲突则该 D-xxx 需标 revised 并呈报新决策，禁止静默改向）。
