# R25-Q4 atomcode 调研报告（存档）

> 2026-09-22 轮25 grill Q4。置信度：高（Rust Reference/Protobuf/OTel Weaver/Fern 四官方源已读全文；删除派反方信源在案）。来源：Rust Reference non_exhaustive／Protobuf dos-donts（reserved+UNSPECIFIED）／Fern schema-drift 2026-08／OTel Weaver 官博 2025-07／Matthew Palma OpenAPI SoT／TS narrowing never／chobbledotcom 删除派／Jest snapshot 边界——全文经 ctx 索引 source=atomcode 可回捞。

## ① 枚举完整性成熟模式

- 编译期穷尽性（TS never／Rust match）＋**Rust `#[non_exhaustive]`=防御性超枚举的语言级合法形态**（显式属性机器可见，下游强制 wildcard——不是留死条目）；`non_exhaustive_omitted_patterns` lint 解决新增成员不可见回洞（deny 会违 semver 官方警告）；
- Fern/Palma 双源：drift=**管线问题非纪律问题**——单一权威定义+全部派生+CI 门禁；drift 四分类（implementation/reference/client）恰对三病灶；oasdiff 把枚举收窄列 breaking=成员集增删是机检对象；
- **OTel Weaver 最贴近先例**：enum 成员一经定义不得改/双向 CI 强制/live-check 活性对账；**open vs closed enum 分集**——开放集豁免严格校验、封闭集成员级对账。

## ② 防御性超枚举合法形态（有真实分歧）

Protobuf reserved（占编号/名字防误复用，非活值）／FOO_UNSPECIFIED 默认防炸／non_exhaustive 前向声明／open-set 声明豁免对账。**批评面**：chobbledotcom 删除派「never keep it for future use」——分歧点在域：**内部常量集→YAGNI 删除派占优；外部输入面（遥测上报值/API 入参）→预留合法但须显式标注**——与 pending(event_bound) YAGNI 裁决同频。

## ③ 对账形态选型

codegen（单一源→全派生，可持续性最高但建制成本大）／快照测试（中——须禁 -u 洗白与 strict 精神一致）／lint 对账（双向集合差进现有守卫脚本，成本最低——适配首选）。

## ④ 三病灶建制建议

1. explain 9 面族级→**成员级双向差集 FAIL**；但先给每族标 open/closed——closed 才成员级互等（「声明了 closed 才立法」是 pending(event_bound) 的镜像）；
2. 遥测 7v6v六类→**常量集=单一权威源**，doc 枚举行+数字均派生；派生行改快照级断言（钉管线存在运行而非钉文案字面）——叙述段可手写但守卫校验计数一致；
3. preflight→**逐条裁决非给机制**：reserved 合法性仅在外部输入面成立；若纯内部防万一→YAGNI 删除；若建制则 `reserved: <理由><失效条件>`＋主集豁免＋生产者出现→FAIL（升格须显式）＋cap≤2——场景≤1 条不值得建制，一条注释+守卫豁免行足矣。

## 冲突面

成员级对账失败**禁入 XFAIL 册**（文档债≠断言照跑预期红——入册=漂移合法化，F3 册外无逐条锚教训）；派生行与字面钉纪律张力（钉的对象从手写文本变派生管线）；vacuity 普查不得为 reserved 成员写「它存在」恒真断言安抚守卫；XPASS 人工逼摘维持。
