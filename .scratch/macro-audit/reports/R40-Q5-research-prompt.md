# R40-Q5 调研题面（atomcode -p 直贴）

## 调研问题

提交信息「版面形态」——人读面与机读面在 subject/body/trailer 三栏位间的分配——在成熟版本控制规范中对应什么心智模型？

背景：私有仓 commit 全走 GitButler；现行提交信息形态=「发票式 subject」——单行 ~150 字压缩全量变更清单＋D-ID 引用全钉标题行、body 空。实例：

feat(轮40批2-β探测面硬化): unstrippedScanHit 豁免判据改剥后消费位＋multi-hit 扩 .includes/.test 字面量与 macro-audit walk（dry-run→批注册 348→389→当日转窗 enforcing）＋SCAN_EXEMPT 摘 guard-all-run 死项/S1 可达性改写＋S2 消费位正对照＋ADR-0024＋CONTEXT 双词条＋编年 M-025 随行（D-153②/D-154①②③/D-156④）

外部锐评指控「提交信息发票化」=双受众挤同一行。已裁入门条件：**内容长度不可削**（D-018 纪律——D-ID 引用/编年 M-号/分项清单全是审计面内容，缺一项即破防丢规则）；开放面=只裁版面分配。

候选（我倾向 (i)）：
(i) Trailer 化：subject 收为单意图人读行（≤~72 字，「什么+为什么」）；机读面迁结构化 footer（Ledger-Refs: D-xxx…／Chronicle: M-xxx／Scope: 分项）；分项清单落 body bullets——双受众分离，内容一字不削；另机读面从「subject 文本正则啃」升维为「footer 结构化解析」（将来 guard 做 commit↔ledger 引用闭合机检可直接 parse）
(ii) 维持现状：压缩 subject 即审计面，不改
(iii) 轻改：subject 收敛＋分项迁 body 自由文，不引 Key: value trailer 语法

## 必回顾
- D:\Aworker\6F\.scratch\macro-audit\decision-ledger.md 全部 current 记录（重点：D-018 编年/版本纪律函数、D-041/D-044 Trigger 机读锚、D-139/D-140 生成物独立 commit、D-144①④ 账行↔编年核对、D-157 C3 入门条件「内容不动只裁形态」、D-156③ 完备性核查先例、防丢规则合集）
- D:\Aworker\6F\docs\adr 全部 24 件
- D:\Aworker\6F\CONTEXT.md 全部词条
- 工业界心智模型（重点）：Conventional Commits §8-10 footer 语义与双受众设计；git trailer 工具链（git interpret-trailers、Signed-off-by/Acked-by/Reviewed-by 审计链——kernel/Git trailer 生态）；GitButler/大型仓提交信息规范（squash-friendly message、Stacked-PR footer）；「commit message as audit surface」vs「audit metadata in footer」的先例；50/72 规则的地位实证（亚里士多德规则还是实证结论）；subject 承载 D-ID/机读锚的反例与先例（Gerrit Change-Id、Bugs/Refs footer）

要求：每候选给工业界支持度与仓内账本冲突点；给出推荐与理由；explicit 列出与 current D-xxx 的任何冲突（修订协议要求呈报）。
