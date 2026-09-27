# 2026-09-27 轮40 T1 批2-β 探测面硬化实施批 — 执行报告

> 任务书 = D:/Aworker/6F/.scratch/macro-audit/handoffs/next-round.md §T1；裁定面 = D-153②〔①②③〕/D-154①②③/D-156④；过程纪律 = D-094③（归因注记）/D-144①（编年随行）/D-145①（engine 触碰前置——本批未触 engine/src|dist，显式声明豁免）。
> 提交 = commit acd79890 @ branch r40-b2beta-hardening（栈叠 r39-closeout 之上；他 agent 工作面 48-*/56-*/trials 未动未收）。

## 1. 完成定义对照（T1 四子项逐项）

| 子项 | 裁定内容 | 落地 | 状态 |
|---|---|---|---|
| ① | unstrippedScanHit 豁免判据改测 stripComments 剥后消费位（注释提名不豁免；import/真实调用计消费位；探测谓词同走剥后面） | 75a-check.mjs unstrippedScanHit 重写 | ✅ |
| ② | multi-hit 扩 .includes(/.test( 字面量＋walk 补 .scratch/macro-audit/；dry-run 只报不判→delta 全量批注册→当日转窗 enforcing（baseline-ratchet） | 探针正则扩形态＋walk 补面；75a-b2beta-dryrun-findings.json 独立工件位；delta 42+1 全量入册 | ✅ |
| ③ | SCAN_EXEMPT 摘 guard-all-run.mjs 死项（D-094③ 归因=枚举面文案漂移合法演化类）＋S1 改写 ⊆walked 枚举面可达性自检 | SCAN_EXEMPT={75a-check.mjs}；S1 改 assert 枚举面集合非自身文本；register meta.exempt 载归因 | ✅ |
| ④ | docs/adr/0024 起草收①②取舍（③不入）；41 件册 note 挂 ADR-0024 指针同行；CONTEXT「消费位判据/豁免集可达性自检」词条随 ADR 落地同步立 | ADR-0024 落盘＋索引再生（24 ADR）；41 条 unstripped-scan note 附指针；CONTEXT 双词条落 ## Language | ✅ |

## 2. 可复跑证据（命令 + 输出摘要）

- `env -u NODE_OPTIONS node 75a-check.mjs --emit > 75a-b2beta-dryrun-findings.json` → dry-run 只报不判产物落独立工件位（389 条），findings 主件不动（--emit 提前 exit 不写盘）。
- dry-run delta 分诊：node 脚本比对键集 → 新检出 42 件（全 multi-hit-probe——.includes/.test 字面量收集扩面真实捕获）＋悬空 1 件（'39-macro-b-one-shot.mjs' 探针字面量归因迁移 46-check→49-check：46 经 .indexOf 旧收集、49 经 .includes 新收集，Map 后写覆盖）；unstripped-scan 族 delta=0（comment-only 逃逸=0、存量 41 件零迁移实证）。
- 批注册（D-094 三分类门）：42 件 disposition=acknowledged-multi-hit/decision=D-094②/D-154②/round=40；悬空键摘除；register 348→389。
- 转窗 enforcing 当日实跑：`env -u NODE_OPTIONS node 75a-check.mjs` → GUARD RESULT: PASS（10 pass, 0 fail）findings=389↔register 389；S1 PASS（可达性自检）、S2 PASS（消费位判据正对照：hit=true comment=true import=false call=false）。
- dry-run↔转窗键集核对（禁用过期差值兑现面）：`node -e 键集比对` → dryrun=389 enforced=389 keyDiff=0。
- 衍生对账：70-check E1 盘点钉 75a 断言数 9→10 → `node update-70-inventory.mjs` 再生 → `node 70-check.mjs` PASS 13/13。
- 收口守卫组（升格后判据，D-149④ fired）：`env -u NODE_OPTIONS node guard-all-run.mjs` → GUARD-ALL-RESULT: PASS（ran=60 red=1 registered=1 problems=0；红集={01-check.mjs}⊆known-red-manifest kr-01）。
- engine 面（验收标准闭环证据，非本批触碰义务外增补）：`npm run build` → tsc+BUNDLE-OK dist/cli.js；`node scripts/check-dist.mjs` → DIST-RATCHET PASS 263151B/cap 289395B、git 面零 drift；`node dist/cli.js --version` → {"name":"6f","version":"0.1.0"} rc=0；`node dist/cli.js selftest` → ok:true 5/5。
- 文件完整性：写入件全经 ctx_execute(node fs)＋回读断言——ADR-0024 4430B/无 BOM/尾 NL；CONTEXT.md/CHANGELOG.md/register.json 同验。

## 3. 裁定预读数 vs 实态偏差（诚实披露）

- D-154③/R39-Q2 预读「改写后 S1 自命中修后探测器→入册 348→349」在机理上不成立：SCAN_EXEMPT 成员在普查主循环被 continue 短路（findInSource/unstrippedScanHit/probeLiterals 三产线全不可达），且 75a-check.mjs 真实 import stripComments——两语义下皆豁免，不可能产生活体检出键；register 禁非活体键（C2 零悬空）故无从入册。实态兑现方式=S2 消费位判据正对照 fixture（合成源注入：消费位命中/注释提名必中/真实消费位豁免——回滚①修法即红，killable）。register 净迁移 348→389 由 ②扩面真实 delta 驱动，非 +1。
- 批2-β ②「实测零新检出」预读仅对 walk 补面成立（.scratch/macro-audit 零 .mjs 纯封洞）；.includes/.test 收集形态扩面实产 42 件新检出——批注册协议本就为「delta 全量一次过三分类门」而设，预读数偏差不违裁定（转窗判据=分诊完成当日 enforcing，已当日兑现）。

## 4. 阻塞

- 无。guard-all-run 中间两轮红均为本批自产序内红（75a 批注册前 C1/C2 红=预期中间态；70-check E1 盘点钉漂移=断言数变更随行再生；31-check F1 docs/adr 脏树钉=commit 前置序问题，commit 后复绿）——皆序内自消，无 residual。

## 5. Lessons 候选

- 31-check F1「docs/adr 零改动」类脏树钉与 ADR 落地天然冲突——序内解释=commit 前红态即其设计语义（探针平行产物纪律），报告须如实记账非缺陷。
- 断言数变更须与 70-check 盘点再生 update-70-inventory.mjs 随行（E1 自助文案已给 regen 路径——好先例：失败信息自带修复指令）。
- GitButler：`--anchor` 已弃用→`--above`；同文件被栈下分支触碰时 commit 报依赖冲突，`but branch new --above` 栈叠后重试即通。
- 裁定点估计（348→349）与机理实态（389）偏差应如实披露——预测数不可尽信，协议本身（delta 全量批注册）才是承载面。

## 6. 引用文件

- 改：.scratch/architecture-recovery/reports/75a-check.mjs（unstrippedScanHit/探针正则/walk/SCAN_EXEMPT/S1/S2）
- 再生：.scratch/architecture-recovery/reports/75a-census-register.json（348→389）、75a-census-findings.json（389）、63-assertion-inventory.json（75a 9→10）、docs/adr/README.md（+ADR-0024 行）
- 新：.scratch/architecture-recovery/reports/75a-b2beta-dryrun-findings.json（dry-run 独立工件位）、docs/adr/0024-detector-judgment-at-consumption-position.md
- 文：CONTEXT.md（## Language +消费位判据/豁免集可达性自检）、CHANGELOG.md（M-025 编年随行）
