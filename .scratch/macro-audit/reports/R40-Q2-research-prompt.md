# R40-Q2 调研题面（atomcode）

承接 R40-Q1（已落账 D-157：摄入分诊定案＋射程 (b) 锐评四面+F-A1＋C2 窄残余入门）。本问=F-A1 处置裁——批2-β 探测面硬化的最后一个实质裁面。

## 病灶实证（75a-check.mjs:48-55）

```javascript
function unstrippedScanHit(file, srcText) {
  const stripped = stripComments(srcText);
  if (/stripComments|stripMdComments/.test(stripped)) return false;  // ← 病灶：剥后源码任意位置裸子串即豁免
  const readsSource = /readFileSync\([^)]*(ts|md|mjs)[^)]*\)/.test(stripped) || /(?:txt|read)\s*\([^)]*\.(ts|md|mjs)/.test(stripped);
  const probes = /\.indexOf\(|\.includes\(|\.test\(/.test(stripped);
  return readsSource && probes;
}
```

- 剥注释工具不剥字符串→`const _="stripComments"` 纯字符串提名同样触发豁免（R40 审计实证）。
- CONTEXT.md:363 词条写「注释或字符串里的字面提名不计」——**词条承诺比实现严，措辞越界实证**（必修项，与主选项解耦）。
- ADR-0024 立法名=「判定锚消费位」；D-154① 裁「剥后源码 strip 消费位为准（import/调用皆计消费位）」——实现实为「剥后提名位」与立法语义有半步差。
- 逃逸形态=对抗可构造：一行字符串常量即可让 unstripped-scan 检出永久失效（D-154① 收口的全局豁免反模式的字符串变体同族）。
- 成本面：R40 审计证存量 41 件 register 项为真实调用豁免、两语义下皆命中→(a) 案预期零存量迁移；(a) 案新检出若有走 D-094 三分类批注册（棘轮对称）。
- S2 fixture 已有真调用对照（fxRealImport/fxRealCall）证真消费形态可枚举。

## 候选

(a) **收紧谓词**——豁免=剥后源码存在真消费形态（import/require 形态 或 stripComments(/stripMdComments( 调用形态）；字符串/属性名/标识符内提名不豁免。
(b) **接受现状语义**——「剥后任意提名即豁免」立为有意宽豁免（写出函数名=已知义务认知，防误报），只修 CONTEXT 对齐实态＋ADR-0024 注记。
(c) **中间档**——现状保留但字符串提名豁免标为「宽豁免位」加注册钉（可构造豁免进册管理）。

必修附件：CONTEXT:363 修正＋(a) 案新检出按 D-094 批注册门。

我倾向 (a)（ADR 名实对齐＋对抗可构造洞封堵＋成本趋零）。

## 调研要求

1. 回顾 D:\Aworker\6F\.scratch\macro-audit\decision-ledger.md 全部 current 记录（157 条，重点核 D-094/D-102/D-154①/D-157、ADR-0024 语义边界有无与本问冲突的已裁面）；
2. 回顾 docs/adr/0024 与 CONTEXT.md 消费位/豁免集词条查漏；
3. 工业界成熟心智模型（重点）：静态分析抑制/豁免判据强度先例（CodeQL lgtm 抑制注释、ESLint disable 语义、Semgrep nosemgrep、errorprone/NullAway SuppressWarnings——豁免粒度「字符串提名 vs 调用位 vs 符号引用」各工具怎么定；对抗性 dodge 与宽豁免反模式；SuppressionFilter/attributes-of-exemption 形态）；
4. 显式列冲突点；置信度自评。

## 期望输出

(a/b/c) 推荐＋理由＋附件义务明细＋冲突点清单＋置信度。
