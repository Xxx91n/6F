# R41-Q2 调研题面（atomcode）

## 背景

守卫套件 env-contract 机制已立（portable/env-contract tier 自声明＋envProbe 启动探测＋SKIP-with-reason 三态 exit 0 不进 allOk＋footer skip 计数）。两个精化裁面同源并考：

子题 a【探测粒度】：现 envProbe 整件粒度——任一 need 缺席整件 SKIP。实证连坐：46-check jiahao sibling 缺席时 A/D/E 组（本仓自足：6F workflow 契约/引擎健康/文书）随 B/C 组（需 jiahao）全跳；39-check 同理 E 段 registry 本仓面随 sibling+engine-deps 前置全跳。候选：(i) 组级探测 groupProbe 下沉、三态渲到组（成本=渲染/计数契约再扩）；(ii) 整件维持；(iii) 按 tier 拆件（46a portable/46b env-contract——拆守护面语义单元）。

子题 b【retired 候选发射】：D-160 已裁退役机制——守卫仅当 protected_surface 消亡（对象移除/上层吸收/更强契约取代）时经 T3 逐件呈报退役，manifest retired 类终态留档非删除；每件守卫已声明 protected_surface 字段。VACUOUS 恒真普查（70-check）已有「断言引用物缺席」探测器。现 retired 册为空（无面消亡实例），退役候选发射腿仍是散文态。候选：(i) 建制发射腿（protected_surface 存在性探测复用 VACUOUS 普查机件→缺席 emit retired 候选）；(ii) 散文态维持（T3 人工读数逐件呈报）；(iii) 哨兵锚定（registry manual_watch 注册审计窗随读普查义务，零新机制，首件退役临窗再裁建制）。

## 调研要求

1. 工业界成熟心智模型：测试/守卫套件中环境前置探测的粒度设计——fixture-scoped vs test-scoped vs suite-scoped skip（pytest fixture scope／JUnit @TestMethodOrder+Assumptions／Go subtests t.Skip／Bazel tag 粒度）；partial skip/partial pass 语义惯例；「测试拆分 vs 组内探测」取舍先例。
2. 退役/过期检查的发射机制：dead-code/stale-test 检测器的主动扫描 vs 人工审计窗（Sensenmann/rotten-green 检测器覆盖率例行跑）vs 值守哨兵；「机制先行 vs 首例先行」在空产出期的取舍先例（空转检测器的维护成本实证）。
3. 回顾本仓 decision-ledger current 记录（D-001~D-163）、docs/adr 全部、CONTEXT.md 词条——尤其 D-159/160 tier 语义与 retired 终态、D-079 VACUOUS 纪律、D-149 升格判据、D-094 划界、D-102 可杀性、R23 恒真探测纪律；冲突显式列出。

给出推荐与理由；辩证看待，列冲突清单。
