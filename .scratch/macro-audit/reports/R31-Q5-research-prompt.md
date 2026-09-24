# R31-Q5 调研题面：golden 锁面——「字段骨架非内容值」的边界定义（骨架+语义定点值 vs 纯键集）

## 决策问题

本仓账本 D-127⑥ 立法「golden=卡 schema 字段骨架非内容值」（立法对象=Micro-B 文件卡输出 golden，意图=golden 不随数据漂移乱红）。#80 步①落地的 emission-skeleton.golden.json 实锁：metric 发射计数（codelore.file_facet_row: 11 等）＋subjects 规范化形列表（NFC/不折叠大小写输出值）＋value_json 键集＋role 标记＋skip（raw_path+reason 对抗路径串）＋冲突对＋对账计数（file_bearing/skipped/per_file+match）＋血缘 edges/payload 键集/threshold/detector_version 常量＋fact_scale 布尔。**不锁**：facet 行载荷数据值/指标数值。manifest 自声明「字段骨架非内容值——[枚举]；内容值漂移不锁」。

复核提出 S6 悬置裁决：票面未细分锁面，D-127⑥「字段骨架非内容值」与实现的「骨架+语义定点值」谁为准？

## 选项

- **(a) 分层锁面立法＋措辞澄清**：「骨架」精修=字段键集＋语义不变量定点值（确定性输入的确定性输出：规范化形/发射计数/skip reason/冲突对/对账计数/常量阈值版本号）；「内容值」=数据行载荷——emission golden 现状追认＋票面勘误明载锁面枚举；D-127⑥ 加 scoped 澄清注记（不改向：定点值=固定输入的确定输出非漂移数据）；
- **(b) 反向收窄**：golden 砍到纯键集/role/布尔——拆除语义断言力（少发事实/规范形错形类回归无捕获=形同虚设）；违 sibling 锁值惯例（narrative seal-golden 锁全文值、codelore 47 件期望值件）；
- **(c) 勘误不立法**：票面写「骨架+定点值」不定义边界——定点值范围不受控争议重演。

## 必查上下文（仓内）

1. `.scratch/macro-audit/decision-ledger.md` 全部 current——重点 D-127⑥（卡 schema golden 立法原文与意图）、D-061（golden 版本化纪律=基线引用稳定）、D-038（fixture 体系）、D-128（刚立法：等价拼写方言归边界层吸收——golden 面不吃方言噪声）、D-131（golden 落点谓词判据）；核查三选项冲突；
2. `engine/test/fixtures/micro-b/emission-skeleton.golden.json` 实文＋`manifest.json` 自声明＋sibling（narrative/seal-golden.json、codelore/batch1/*.json）锁值惯例；
3. `docs/adr/`（0001~0023）＋`CONTEXT.md`——Golden Contract Tests 词条等。

## 必查工业心智模型（重点）

1. **golden/snapshot 测试的锁面光谱**：全字节锁（Go golden -update 惯例）vs 结构锁（Jest snapshot serializer/propertyMatchers、insta redactions/filters、ApprovalTests scrubbers）vs 语义断言（pytest parametrize 期望值）——成熟生态如何划分「锁形态」与「锁值」？什么值该进 golden 的通行判据（确定性/语义本体性/稳定性三谓词？）；
2. **「行为输出锁 vs 数据载荷锁」区分先例**：编译器测试（LLVM FileCheck 的 CHECK 行=锁结构+定点 token 不锁全部字节）、snapshot 生态的 normalize/scrub 惯例（路径/时间戳/UUID 归一后锁其余）——「锁语义输出、放行数据值」是否有成熟心智模型？
3. **golden 过度锁定的代价实证**：brittle test/approval fatigue 文献——锁面过宽导致的 churn 成本 vs 锁面过窄的回归漏检；成熟项目如何设锁面宽度（如 insta 的 redaction 只遮不稳值）；
4. **分层 golden 惯例**：发射层 golden（锁行为）vs 输出层 golden（锁 schema 骨架）是否有「不同层不同锁面」的通行分层——还是单一锁面原则。

## 输出要求

- 分点结论（标信源类型）；候选矩阵（a/b/c）；完整来源清单；信息缺口；一句话落地建议；冲突若存在显式点名 D-xxx 并给 revised 替代文案方向，禁止静默改向。