# ADR-0024: 探测面判定锚消费位——#75批2-β 探测器硬化

- Status: accepted
- Date: 2026-09-27
- Deciders: 用户（grill 轮 39 Q1/Q2，逐问 atomcode 深调研后拍板「采纳」）
- Ledger: D-153②〔①②〕／D-154①②（全 current）；承 D-094（失效三分类）／D-110（棘轮语义）／D-144（字面钉治理）／ADR-0022（探测器硬化先例）

## Context

75a-check.mjs 普查机件两处判定面缺陷（R37 审计呈报→75b §3 立案→R39 裁定）：
- `unstrippedScanHit` 豁免判据在**原文**上测 `/stripComments|stripMdComments/` 字面——注释里提名一句即获豁免。提名位≠消费位：一行 `// TODO 改用 stripComments` 注释即可让「源文扫描未过剥注释面」检出失效，属全局豁免反模式（overreacted no-restricted-disable 同族）。
- `multi-hit-probe` 探针字面量仅收集 `.indexOf(` 调用形态——`.includes(`/`.test(` 同语义调用逃逸；普查 corpus walk 面漏 `.scratch/macro-audit/`。
- 两裁同根取舍：**探测器判定面锚消费位/消费形态，还是锚字面提名位**。ADR one-decision 单位=取舍论证非变更条目数（Watson 反模式判据），①②同根派生合收一册；③SCAN_EXEMPT 死项摘除＋S1 改写属处置类动作非架构取舍，不入本册（ozimmer 零价值判据反面——硬塞稀释取舍可读性），账本打包裁＋归因注记承载（D-154④）。

## Decision

**豁免判据改剥后消费位（D-154①，面A=(i) 最小修法）**
- `unstrippedScanHit` 先 `stripComments(srcText)` 再测豁免谓词——剥后源码中 `import`/真实调用计消费位仍豁免；注释提名不再豁免（消费位判据为唯一合法豁免径）；探测谓词（readsSource/probes）同走剥后面，注释内假消费位不计。
- 实测 comment-only 逃逸=0、存量 41 件 convention-registered 两语义下皆仍命中→册零迁移（零重分类代价）；判据变更属探测语义难逆转变更（ASR 命中 Nygard/Microsoft ADR 门槛判据），故立本册。

**multi-hit 扩面＋批注册转窗（D-154②，面B=(iii) dry-run→批注册→enforcing 带预声明转窗）**
- 探针字面量收集扩 `.includes(`/`.test(` 调用形态；corpus walk 补 `.scratch/macro-audit/`（实测零 .mjs——纯封洞随批）。
- 扩面新检出流程：dry-run 只报不判（产物写独立工件位非 findings 主件）→delta 全量一次过 D-094 三分类批注册→**预声明转窗=分诊完成当日转 enforcing，dry-run 与转窗间漂移以转窗日实跑重算 delta，禁用过期差值**（baseline-ratchet 形态——新违例硬门＋存量容忍棘轮；批注册=基线重生成事件非基线膨胀，D-110 棘轮语义兼容）。

## Rejected

- 豁免判据维持提名位——注释提及即豁免=全局豁免反模式收口失败，与 D-094③ 名↔检剥注释纪律同族病灶；
- dry-run 无转窗条件长期化——Notion 棘轮博客「warning 模式被无视」病：只报不判的检出无强制处置面即腐化；
- 用过期 dry-run 差值直接转窗——eslint-seatbelt 教训：漂移须以转窗当日实跑重算，禁用过期差值；
- delta 逐件分裁——批注册是基线重生成事件（Android Lint baseline/gitleaks baseline 先例同构），逐件裁把形态学变更混入逐件裁面；
- ③SCAN_EXEMPT/S1 处置塞入本册——处置类动作非架构取舍（D-154④），由账本打包裁＋75a-census-register 归因注记承载。

## Consequences

- 转窗日实跑：findings 348→389（扩面新检出 42 件全量批注册 `acknowledged-multi-hit`/Track C＋1 件字面量归因迁移 46-check→49-check〔Map 后写覆盖〕摘除悬空键）；存量断言语义零改写。
- 75a-check 增 S1 可达性自检（`SCAN_EXEMPT ⊆ walked 枚举面` killable 不变式——死项即红，75a-C2 零悬空镜像）＋S2 消费位判据正对照 fixture（回滚面A修法即红）；豁免集死项自检从此有机检牙。
- CONTEXT.md 同步立「消费位判据／豁免集可达性自检」词条（D-156④ 词条声明义务）；存量 41 件 convention-registered 册 note 挂本册指针。
- 批3（multi-hit 点级锚改造）/批4（existence-assert 升格）择批点显式不预裁（D-153④/D-156③）——随批2-β 落地后临窗再裁。
- 调研档案 R39-Q1/Q2 存档 .scratch/macro-audit/reports/。
