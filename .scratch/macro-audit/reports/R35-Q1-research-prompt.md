# R35-Q1 调研题面（atomcode）

仓库 D:\Aworker\6F 是 spec-level 工程内容审计产品（五尺度审计，Hub-of-Facts + DuckDB + Micro-B 文件卡；Agent Plugin 分发，ADR-0016）。仓内维护一套自建守卫体系：.scratch/architecture-recovery/reports/ 下 61 个 *-check.mjs 脚本、约 1060+ 条 t() 断言，canonical 守卫组 18 件每轮实跑。

## 问题

第四轮外部锐评（快照=当前 HEAD 68db5ad）呈报「守卫基线复绿官僚循环」为新型内耗税：

- 机理实证：41a-check.mjs D7 断言 = 仓根 CHANGELOG.md 必须字面包含账本最大 D 号（cl.indexOf(dMax)）——每新增一条决策账行，CHANGELOG 编年行必须随行，漏录则守卫转红，下轮 T0 先修后开发；独立「chore: 守卫基线复绿」commit 已两次实证（r32-t0/r35-t0），另有多起内嵌在 fix commit 中的同类修复；
- 字面钉族规模：35 个守卫文件含 ~330+ 处 indexOf 字面钉子串断言；41a-F4 曾用正则钉任务书某行具体措辞（任务书换代即碎裂，已于 r32 放宽一次）；78-check 单文件 63 处字面钉；
- 既有立法：D-071⑨ 已立「断言输入面快照化」治本方向（三类病根三种修法：票拆分面→锚点 hash＋时点 / 滚动面→锁结构不变量 / 增长面→单调包含性非等值）但绑定 manual_watch 触发器——从未触发，税制每轮复收却无排期；D-071④ 条目数>cap 即 FAIL 逼立票（压力阀设计）；D-073 已立法 cap 满的三向分拣＋sealed 封存机制；D-094 字面钉普查任务在册（T3/#75批1）；
- 反方论证：该税是 ADR-0018 编年纪律的强制函数——两次复绿都抓到真实漏录（r34 收口漏 M-013、r31 漏 M-009），税制=纪律执行成本；
- 锐评框架：每轮开局先伺候守卫=官僚自举循环、1246 条断言=文字法网。

候选处置：
(a) 工序内化——字面钉全保留，把守卫 dry-run 内嵌进收口工序（closeout checklist 显式列「编年随行＋收口前跑守卫组」），消灭「复绿 commit」显形形态，不动断言；
(b) 钉面靶向减负——只改写「每条账行必触发」的高频钉（D7 类：dMax 字面钉→结构不变量如 M 行区间覆盖并集含 dMax，D-071⑨「增长面→单调包含性」修法），低频任务书钉维持字面；
(c) (a)+(b) 组合——工序拦漏（税制不再以独立 commit 显形）＋高频钉结构化（钉不再为措辞漂移碎裂）；
(d) 不动——税制=强制函数本体，2 次复绿/10 轮成本与抓到真漏录对等。

## 调研要求

1. 回顾 D:\Aworker\6F\.scratch\macro-audit\decision-ledger.md 全部 current 记录（重点 D-071 全条款含⑨第二轨、D-073 cap 满分拣/sealed、D-074 环境敏感腿、D-094 字面钉普查、D-102 摘除追认、D-139 搭车禁则、D-070 随触碰顺带先例、D-068 committed-baseline、D-037 schema 冻结、D-041 复审逾期），docs/adr/ 全部（重点 0018 版本编年、0013 三层验收、0008 插件五层、0002 无 MVP），CONTEXT.md 全部词条（重点 Trigger-gated Closure、消费面驱动资产、Known-gaps 台账、Watch Tri-state）；
2. 工业界成熟落地的心智模型（重点）：元数据/文档漂移守卫的成熟形态——changesets/release-please/keep-a-changelog 类「CHANGELOG 必更新」CI 检查的业界惯例与失败模式、pre-commit hook vs CI check vs post-hoc audit 三层的职责分工先例、字面断言 vs 结构不变量断言的 brittleness 谱系（over-specified tests/Gojko SBE 回访、snapshot vs assertion 之争）、「forcing function 类检查应前置在产生面还是后置在审计面」的成熟心智、lint-for-process 反模式讨论（用测试强制流程纪律的边界）、Google/Meta 级 monorepo housekeeping check 实践、测试维护税（test maintenance tax）量化文献；
3. 给出推荐与理由，显式指出与账本任一 current 决策的冲突点（若有——冲突则该 D-xxx 需标 revised 并呈报新决策，禁止静默改向）。
