# R39-Q2 调研题面（atomcode）

承接 R39-Q1（题面与报告同目录归档；射程已裁=(b')：批2-beta 五项混合颗粒度裁定——行为语义类逐件裁、登记类打包裁）。本问=五项中行为语义三件的逐项裁面细节。

## 仓景速览（勿重复验证）

D:AworkerF = spec-level 工程审计产品（Agent Plugin 分发，preview 态）。守卫体系=.scratch/architecture-recovery/reports/ 下 60 件 *-check.mjs＋guard-all-run.mjs 动态枚举执行器＋known-red-manifest.json 册＋75a-check.mjs 字面钉普查器（348 条全归因注册 75a-census-register.json，D-094 三分类门：legit-literal/convention-registered/event-pin/acknowledged-multi-hit/observability-emit/layer-tagged）。

## 批2-beta ①②③ 实物现状（已取证）

**① unstrippedScanHit 探测盲区**（75a-check.mjs L44-45）：豁免判据= `if (/stripComments|stripMdComments/.test(srcText)) return false` ——测剥前原文，注释里提及函数名即豁免（suppression-comment 类失效模式同型）。册存 41 件 unstripped-scan（convention-registered：名-检剥注释通用化约定，存量断言保留原文扫描位）。实测（新取证）：59 件 check 文件中 comment-only 提及数=0——改语义后零 live 重分类；真实消费位（剥后仍引用）6 件；存量 41 件两语义下皆仍命中，册零迁移代价。

**② multi-hit-probe 扩面**：现仅收 `.indexOf('literal')` 钉（710 站点→册 76 件多命中，比率约 10.7%）。候选扩面= `.includes('lit')` 355 站＋ `.test(/lit/)` 约 211 站（46 文件涉面）→预期新检出数十级册件须 D-094 分诊注册；walk 漏 .scratch/macro-audit/——实测该目录 .mjs=0 件（纯覆盖洞封堵，今产零新检出）。

**③ SCAN_EXEMPT+S1**：`SCAN_EXEMPT={'75a-check.mjs','guard-all-run.mjs'}`——后者不匹配 *-check.mjs 枚举面=死项（D-094③ 归因=枚举面文案漂移合法演化类）；S1=`selfSrc.indexOf('SCAN_EXEMPT')>=0 && indexOf('guard-all-run.mjs')>=0`——断言文本自带被搜词=自指恒真（Autonoma 恒真断言五形态/D-102 无牙族同型）。

## 问题（三面合一裁定）

**面A〔①修法＋ADR 范围〕**：(i) 最小修法——豁免判据改测 stripComments(srcText)（剥后引用皆计消费位）＋ADR-0024 单件同收①②；(ii) 严格修法——剥后源码＋调用位须在扫描点之前（位置序约束）；(iii) ADR 分拆两件。

**面B〔②扩面形态〕**：(i) 一步全开切 enforcing；(ii) 分级启用（includes→test 两波）；(iii) dry-run→批注册→enforcing——扩面探测器先只报不判跑一遍，delta 全量一次过 D-094 三分类分诊注册成册再转 enforcing（CodeQL baseline-ratchet 同构）。

**面C〔③摘除形〕**：(i) 纯摘除——死项出集＋S1 整删（带 D-094③ 归因注记）；(ii) 摘除死项＋S1 改写为真断言——assert「SCAN_EXEMPT ⊆ walked 枚举面」（豁免可达性自检：死项复入即红）；(iii) S1 改写挂册外锚（register meta 字段断言）。

## 调研要求

1. 回顾 D:AworkerF.scratchmacro-auditdecision-ledger.md 全部 current 记录（重点：D-094 三分类门与归因注记制、D-095①④ 超枚举默认删/reserved 唯一合法域、D-102 XFAIL 册规与无牙族、D-110 棘轮基线只减不增、D-113 known-gaps 五要素、D-133 票面开销判据、D-135 单票批内排序、D-144 普查建制、D-146 摄入分诊、D-147 预声明验证包、D-153 本轮射程裁〔刚落账〕、75a/75b 建制条款、以及一切涉及探测面/断言治理/豁免集的条款）；
2. 回顾 docs/adr/（0005/0013/0022 quarantine 语义硬化先例——ADR-0024 拟沿其形态）与 CONTEXT.md（Kill Criterion、Watch Tri-state、Accepted Risk、守卫基线枚举、Assignable Cause）；
3. 工业界成熟落地心智模型（重点）：①linter/scanner 扩面或规则收紧时的 baseline-onboarding 惯例（CodeQL/betterer/detekt baseline、ESLint 规则升级批量 suppression 惯例——一次性冻结 vs 分级启用 vs 直接 enforcing 的取舍）；②suppression/exemption 判据从「提及」改「消费位」的先例（security scanner suppression audit、CodeQL suppression query、eslint-disable 仅对规则名生效 vs 注释提及）；③恒真/自指断言处置——删除 vs 改写为不变式断言（invariant assertion）的先例与判据（mutation testing 视角：改写后断言必须能红）；④检测器豁免集的可达性自检（dead-entry elimination＋自监控断言）先例；⑤ADR 单件收一族同域变更 vs 一变更一 ADR 的颗粒度先例（Nygard/Fowler 原典及社区实践）；
4. 给出推荐与理由，显式指出与账本任一 current 决策的冲突点（冲突则该 D-xxx 标 revised 呈报新决策，禁静默改向）。特别核查：①扩面 dry-run→批注册形态与 D-110 棘轮「基线只减不增」语义是否兼容（批量新增册件是否反向违例）；②S1 改写为可达性断言后该断言自身是否又成字面钉（须过哪道普查面）；③ADR-0024 单收①②是否与 D-058「单决策含取舍与备选」门槛兼容（②扩面是否有独立取舍可同文档承载）。
