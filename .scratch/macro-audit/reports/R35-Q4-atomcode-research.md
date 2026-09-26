# R35-Q4 atomcode 调研报告存档

> 调研执行：atomcode -p（题面=R35-Q4-research-prompt.md）｜full reads 6（typescriptlang.org TS4.4 原文/TS Handbook Narrowing/typescript-eslint 两规则原文/doc.rust-lang.org non_exhaustive/microsoft TypeScript#50698）＋SO/dev.to/medium/keep#19 交叉｜置信高。resume handle: 325e2d8a-0338-451d-9d52-d9e43d262f42

## 1) 执行摘要（TL;DR）

推荐 (c) 立即返工＋轻量验证：一行修（let failure: 'ok' | SuppressedFacetReason 删 as 断言）＋以「dist 产物字节不变＋83-check＋smoke」作行为不变性证据替代 §1 全套重跑，判据预声明、字节对比意外差异则升格 (a)。Confidence：高——(a) 与 (c) 唯一分歧=「type-level-only 变更的验证强度」，业界有成熟分档先例（refactor vs behavior-change 分档、golden/字节等价门），且本仓 D-067③ CI rebuild-diff 与 D-143 负向「禁断言升格」已预留文法。缺省亦可退 (b)，但 (c) 成本仅多一次实测且堵住未来绕过面。

## 2) 分点结论

**① TS 官方把收窄视为 as 断言的替代处方（正面对照）**：TS 4.4 release notes 明文「users often have to repeat themselves or use type assertions…In TypeScript 4.4, that is no longer the case」——aliased condition narrowing 的设计动机即消除对 type assertion 依赖；const 别名条件＋CFA 是官方推荐收窄通道，对 discriminated union、transitive 常量链均生效（const suppressed = failure !== 'ok' 完全落入支持面）。

**② as 断言「静默放行」=官方 issue 与社区双重确认的已知风险**：microsoft/TypeScript#50698 维护者原话「The entire point of type assertions is to work around the type checks of the compiler」——as 只检查 types 是否 sufficiently overlap，宽型→词表型收窄方向一律放行；SO #43581（「using 'as' caused a production bug」）与 dev.to 治理文同一处方：annotation 优于 assertion，机检用 consistent-type-assertions:{assertionStyle:"never"} 或 no-unsafe-type-assertion。三源交叉。

**③ 修复后的 cast 将落入机检规则直接靶面**：typescript-eslint no-unnecessary-type-assertion（不动类型即报）与 no-unsafe-type-assertion（「forbids using type assertions to narrow a type, as this bypasses TypeScript's type-checking…better to rely on type guards」——官方措辞几乎逐字复述题面病理）都把 failure as SuppressedFacetReason 类收窄 cast 列为典型应清除项。删 cast=向可机检方向收敛，未来 lint 接线零阻力。

**④ exhaustiveness/never 编译期拦截=TS 官方正典模式，收窄后判力自动兑现**：TS Handbook Narrowing 章「you can use narrowing and rely on never turning up to do exhaustive checking」——closed 词表一旦成为 failure 静态类型，新增失败枝若不在词表内赋值路径直接编译错（与 switch never 模式同构）；typescript-eslint switch-exhaustiveness-check 印证「union 变更后漏分支是常态故障模式、须靠类型判力而非 default 兜底」业界共识。

**⑤ Rust 对照支持「封闭集＋编译期拦截」方向**：Rust Reference #[non_exhaustive]——只有外部输入面豁免穷尽性（防未来加变体 breaking 下游），同 crate 内部穷尽匹配照旧——与 D-095④「reserved 唯一合法域=外部输入面」完全同构。SuppressedFacetReason 是内部投影层词表（无外部生产者），封闭＋穷尽判力=Rust 生态正解镜像。

**⑥ type-level-only 变更验证强度：业界有成熟「字节等价门」分档先例**：kustomize 重构实践文直接把「byte-identical render=cheap, powerful refactor proof……shasum on the rendered output is your test suite」立为验收闸；GitHub 重构 issue（keep#19）以「bytes must be identical to today's output＋golden-file test」作 refactor 验收，且显式把「重构验收」与「功能测试」分开呈报。本仓已有同型机制：D-067③ CI rebuild-diff＋D-140 .gitattributes generated＋R35-Q2 刚采纳的 D-144① check-dist 零 drift 前置——(c) 的字节不变证据不是新发明，是既有守卫链一次手工执行。

**⑦ emitted 产物可实测证的字节不变性判断（本地证据）**：as 断言与类型注记均为纯编译期擦除物，tsc emit 的 dist/fact/file-card.js 不含类型信息，d.ts 中 SuppressedFacetReason 已是声明面注记——修法后 dist 字节不变概率极高，且 D-067③ 守卫本就能机械判定，出现差异即触发预声明升格条款，无灰色地带。

## 3) 对比矩阵

| 项 | exhaustiveness 兑现时点 | 验证成本 | 账本冲突面 |
|---|---|---|---|
| (a) 立即独立返工＋§1 全套 | 立即 | 一行修付 16 条验收全套 | 无冲突，但验证强度与变更性质错配（type-level-only 付 behavior-change 价） |
| (b) 并入 T2 窗顺带 | 延至 T2 落地 | 近零 | 与 D-070「another day often doesn't come」张力——本条已知精确位置，不属遗留观察项 |
| (c) 立即返工＋轻量验证（推荐） | 立即 | 一行修＋字节对比＋83-check＋smoke（复用 D-067③/D-144① 既有机制） | 无正面冲突；验证强度让步按题面预声明判据，须用户拍板确认 |
| (d) 登记不返工 | 不兑现 | 零 | 使 D-143② 购买理由（exhaustiveness 拦截）持续空转，known-gap 与账本动机公开矛盾 |

## 4) 与账本 current 决策的冲突点核查

- **D-143②**：(c) 是该决策「收窄后 exhaustiveness 判力可拦截」购买理由的兑现非冲突；若选 (d) 则 D-143② 核心理由被悬置，须在去向表注记而非 revised。
- **D-095①/④、D-126③、D-136②**：全支持封闭词表＋删 cast（D-136② closed 枚举成员级双向差集实指化纪律与 as 名义化相悖）。零冲突。
- **D-139②/R32 搭车禁则**：(c) 为独立一行类型修 commit 非搭车；dist 若字节不变则零 bundle diff，连 D-140 bundle commit 义务都不触发。零冲突。
- **审计协议「返工须重跑 §1 全套」**：唯一张力点。调研未发现业界先例支持「type-level-only 变更须付全套行为验收」——先例方向相反（字节等价门＋分档验收）。该让步本质=对既有协议惯例的验证强度减让非任何 D-xxx 改向，无需 revised，但按题面须用户拍板生效；若不批退 (a) 亦无冲突。
- **D-135「禁卫生组升格」**：(c) 不立票不设守卫符合票面纪律；将来若机检 cast 面走 D-139③ deferred 触发器文法即可。

## 5) 完整来源清单

typescriptlang.org TS 4.4 Release Notes Aliased Conditions（别名收窄=官方对 as 的替代处方，全文已读）；TS Handbook Narrowing never/exhaustiveness（穷尽检查正典）；github.com/microsoft/TypeScript issue#50698（as=绕过类型检查官方定性）；typescript-eslint.io/rules/no-unnecessary-type-assertion 与 /no-unsafe-type-assertion（narrowing 断言 bypasses type-checking 原文，全文已读）；typescript-eslint switch-exhaustiveness-check（union 变更漏分支=常见故障模式）；SO#77395532（生产 bug 实例＋assertionStyle:never 处方）；dev.to/taiyama1212 禁断言插件生态；doc.rust-lang.org non_exhaustive（外部面豁免/内部面穷尽域界，全文已读）；medium.com/@huchka kustomize 字节等价=refactor 验收闸；github.com/MaxAnderson95/keep issue#19（golden 字节门＋重构/功能验收分档呈报）。

## 6) 信息缺口

1. Rust sealed trait RFC#2372 未单独深读——结论由 non_exhaustive 官方页独立支撑；
2. 「§1 全套重跑」协议条款原文出处（审计窗文档）本轮未定位逐字文本——按题面转述采信，用户拍板 (c) 时建议同时核对协议原文是否允许「判据预声明减让」；
3. atomcode CLI 深调研批未返回（stdio 恢复在后台），以三引擎直查＋6 次原文核验补足。

**呈报建议**：票面按 (c) 写——一行修（file-card.ts:287 注记改 'ok' | SuppressedFacetReason，删 :299 的 as SuppressedFacetReason）＋独立 commit；验证四件（dist 字节对比、83-check、smoke、tsc --noEmit）预声明为行为不变性证据，字节差异即升格 (a)。
