# R51-Q4 调研报告 —— 存量非法指针处置（勘误时点与豁免边界）

> 存档说明：atomcode 配额仍在耗尽窗（~20:50 复位）——**配额耗尽=D-186 唯一不续跑例外**，按规程转白名单工具（web_search×4）编排层合成，**degraded_performance 合法降级形态**（本轮构成比 4/4=100%）。题面存档见 reports/R51-Q4-research-prompt.md。

**Sufficiency Gate**：searches: 4（web_search×4：ISO corrigendum/amendment 分层、IAS 8/PCAOB 更正时点、SEC restatement 惯例、审计底稿更正纪律）| angles: Official（IAS 8/PCAOB AS 2905/ISO-IEC Directives/IEEE SA OpMan/ISA 230 域）＋Criticism（restatement 累积机制）＋Comparative（corrigendum vs amendment vs errata 三层）｜full reads: 5（NSAI corrigendum/amendment 释义、IEEE SA OpMan §8、ANSI blog 三层区分、IAS 8 综述、PCAOB AS 2905）｜gaps: 见 §6。

## 1) 执行摘要（Tl;dr）

**推荐：采纳 (i) 本轮收口批顺手做——两残留各落一条 D-181 勘误行；(iv) 的普查职责吸收给守卫首跑（存量违规标 WARN、新增标 FAIL）而非人工普查；驳回 (ii) 排产与 (iii) 豁免。** 置信度：**中高**——「发现即更正」有 IAS 8 明文＋PCAOB「as soon as practicable」＋SEC 反累积实务三源交叉；corrigendum/amendment 分层有 ISO/IEEE/ANSI 官方释义；唯一折扣=豁免摧毁权威一条为治理逻辑论证非命名先例。

## 2) 分点结论

**C1. 「发现即更正」是审计/会计准则的成文义务——(i) 的时点优先有直接先例。** IAS 8 明文「Errors must be corrected **as soon as they are discovered**」【U4】；PCAOB AS 2905 对报告日后发现事实的义务=「**as soon as practicable** undertake to determine…」【U5】；SEC 实务文献「One way to reduce the risk of restatement is to correct all known errors **in the period in which the errors are discovered**」——延迟更正使个別小错累积成 Big R 重述【U6】。→ 本仓两处残留已实证在案，延迟到排产批=明知错误存续窗口拉长，与会计更正义务时点先例相反。

**C2. corrigendum/amendment/errata 三层分层证明：错误更正走独立附文不改正文，且「琐事可批量化」不等于「本案可等」。** ISO/IEC Directives §2.10＋IEEE OpMan §8＋ANSI 释义同构【U1】【U2】【U3】：corrigendum=更正已签发文件的疏忽性错误（不动范围）——本仓 D-181 勘误通道即 corrigendum 同构物；erratum=出版过程引入错误的最轻层。**但注意 BSI 释义的反面含义**【U3】：「Trivial errors will usually be left uncorrected until the need for a more substantial amendment arises」——批量化只适用于**琐事**；本案两残留不是琐事：W8 是立法动机的病灶实证（孤儿孪生当主线），W6 是新规正管的短码形态——属「must correct」级非「may defer」级。

**C3. 豁免 (iii) 的自拆台性：让步处置在 QMS 里是正式行为非默认。** ISO 9001 nonconformity disposition 的 use-as-is/concession 路线要求正式让步论证与记录（书面放行依据）——**豁免本身是带文书的正式行为，不是沉默默认**【U7 域先例】。生效首日对病灶实证开豁免=新规权威即刻折价；且 D-189② 已把 T3 列立法为严格层职能位，回头豁免同型残留=立法自我矛盾。→ **(iii) 驳回**；若真要对 wmu 豁免，须走 AR 五要件论证（判据引用＋不修理由＋补偿控制＋具名裁者＋到期日）——而勘误成本远低于 AR 论证成本，无成立理由。

**C4. (iv) 全仓普查不必要——普查职责天然属于守卫首跑。** 人工普查一遍再勘误=守卫件落地前的重复劳动；且守卫件落地后持续普查才是正解形态。优化处置=**守卫首跑承接普查**：机检对存量违规标 WARN（grandfathered，D-148③）、对新增违规标 FAIL——普查成本归零且首跑即建立存量基线。此设计须与 D-148③ 衔接：守卫扫描面=全存量位形枚举，但判级按「落盘时点 vs 立法生效时点」分 WARN/FAIL 两档。

**C5. wmu 不可解析的处置先例：失效引用的作废标注。** 簿记/审计惯例=划线更正＋签名日期，原迹保留不删【ISA 230 底稿更正纪律域】；失效引用（dead reference）处置=附加作废注记说明失效原因与替代定位，而非抹除原记录——与 D-146⑤ 追加不改写同构。若 `wmu` 已不可解析：勘误行如实记「该短码系 per-session UI 码已漂移不可解析，原读数作废；替代定位=<SHA 或 '无'>」。

## 3) 冲突扫描（对本仓 current 决策）

| 决策 | 冲突？ | 裁定 |
|---|---|---|
| D-181 勘误三字段 | 否——**被消费** | 两勘误行按三字段写（扩展描述／发现时点／变更 commit 指针——指针自身用新法定形 SHA≥12hex+subject） |
| D-146⑤ 追加不改写 | 否 | 勘误行=追加行非改写 |
| D-148③ 不溯既往 | 否——**被双重印证** | 不回写改原条目（不溯既往）但勘误追加≠追溯改写（勘误是新条目）；守卫首跑存量标 WARN 非 FAIL=判级面承接不溯既往 |
| D-185 开工对表 | 否 | 勘误前须实证核对 wmu→SHA 映射（存在性核实非内容比对——对表规程同型消费） |
| D-186 降级形态 | 否 | 本报告即降级形态合规样本 |
| D-187 哨兵盘点 | 否 | 勘误行新落位置若在守卫断言面内需对表核对（执行时查验） |
| D-165/D-170 分层定稿 | 否 | 勘误属裁定层记录非验收层结论 |
| D-177 预声明 | 否 | 文书面勘误非守卫面变更，不触发预声明 |

## 4) 推荐＋理由＋置信度

**推荐 (i) 顺手做，(iv) 职责吸收给守卫首跑，驳回 (ii)(iii)。** 操作化：
1. §7 勘误节追加行：扩展描述=「所录 `201935fc` 经实证为 amend 孤儿孪生（同 change-id `nktntvkkwqtrnqxwmtokzulttpowxnpp`/同 parent `2801b3c9`/committer 差 83s），主线真 commit 为下述」＋发现时点=R51 审计复验窗＋变更 commit 指针=`cb625c6491895e479a59ad5770d2748a8de70b32` ("subject")——新法定形首单实战；
2. 账本 T3 表旁追加勘误行：先 `git log` 对表实证 wmu 真实 SHA；可解析→映射注记，不可解析→作废注记（C5 形态）；
3. 守卫首跑承接全存量普查：存量违规 WARN／新增 FAIL 两级判级（与 D-148③ 衔接）。
**理由**：IAS 8/PCAOB「as soon as discovered/practicable」三源成文义务＋corrigendum 通道同构＋豁免自拆台论证＋普查职责守卫承接论。置信度：**中高**。

## 5) 完整来源清单

| # | 标题 | URL | 角度 | 贡献 |
|---|---|---|---|---|
| U1 | ISO/IEC Directives consolidated §2.10 Corrections and amendments | iso.org/sites/directives/current/consolidated/ | Official | corrigendum vs amendment 官方分层定义 |
| U2 | IEEE SA Standards Board OpMan §8 | standards.ieee.org/about/policies/opman/sect8/ | Official | erratum/corrigendum/amendment 三层定义＋独立 ballot 程序 |
| U3 | BSI/ANSI 标准变更三层释义 | knowledge.bsigroup.com/articles/5-ways-standards-are-kept-accurate-and-relevant＋blog.ansi.org | Official/释义 | 「trivial errors 可攒批」的边界——反向证明本案非琐事级 |
| U4 | IAS 8 综述（IFRS） | accounting-simplified.com/ifrs/ias-8/＋ifrs.org IAS 8 guide | Official | 「Errors must be corrected as soon as they are discovered」明文；追溯重述 vs 未来适用分级 |
| U5 | PCAOB AS 2905 报告日后发现事实 | pcaobus.org/…/AS2905 | Official | 「as soon as practicable」核实义务＋依赖者考量（仍在依赖→必须行动） |
| U6 | SEC restatement 实务文献（Carlton Fields/Audit Analytics） | carltonfields.com technicalline restatements | Community/实务 | 「correct all known errors in the period discovered」防累积成 Big R |
| U7 | ISO 9001 nonconformity disposition 域 | （域先例，use-as-is/concession 须书面放行依据） | Official 域 | 豁免=正式行为非沉默默认——(iii) 驳回依据 |
| U8 | ISA 230 审计底稿更正纪律域 | （底稿更正=划线更正＋签名＋日期，原迹保留） | Official 域 | 失效引用作废标注的簿记先例——C5 处置形态 |

## 6) 信息缺口（如实标位）

1. **atomcode 配额耗尽窗未复位**——本报告=编排层合成（D-186 降级形态），无深调研循环产出。
2. **ISO 9001 让步处置的具体条文**（8.7 不合格输出控制 clause 原文）未抓一手——域惯例引用非条文级；如需条文级支撑可补抓 ISO 9001:2015 §8.7 原文。
3. **ISA 230 底稿更正的条文号原文**未抓——域惯例引用（划线更正＋签名＋日期为教科书级常识）。
4. **「豁免摧毁新规权威」为治理逻辑论证**非命名先例——置信折扣已标。
5. **账本原文对表**：编排层已核 D-181/D-146⑤/D-148③/D-185/D-177 原文，其余以题面转述为据。
