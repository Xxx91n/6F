# R25-Q5 atomcode 调研题面（存档）

> 2026-09-22 轮25 grill Q5。执行面=atomcode -p（ctx_batch_execute 串行）。

## 调研问题（verbatim 发出）

校验系统中「生成器与校验器是否应共享同一解析机芯」的取舍：项目有一道守卫（70-check.mjs）对一个机器生成的清单文件（63-assertion-inventory.json=全部守卫脚本的 emit 断言点盘点）做「live 重演算 == 清单」对账。现状=census 机芯（~75 行：扫守卫源码用正则提取断言点）在生成器 update-70-inventory.mjs 与校验器 70-check.mjs 里逐字双份——审计已实证字段名分叉（style vs sealedCall），即两机芯可对「什么算一个断言」产生语义分歧，而 E1 断言只能抓数据漂移（清单过期）抓不住语义分叉。张力：双份是有意冗余（校验器独立重演算才能抓清单腐化写/生成器 bug），共享机芯则同一 bug 两侧同错=对账成同义反复。请调研：①工业界「校验器独立实现 vs 共享实现」的成熟模式与判据（编译器双实现 oracle/differential testing、N-version programming、test oracle independence、golden file 校验器的实现来源惯例）；②「钉输出契约而非共享代码」的先例（two implementations must agree 形态的 differential/property check 工具链）；③对本题给出建制建议——共享抽取/双份+输出互等断言/单源化/维持现状的取舍判据与牵强风险。辩证看待并指出与下述既有机制的冲突面：XFAIL 册（cap=10 断言照跑）、vacuity 恒真断言普查（引用物缺席检测）、字面钉失效族纪律（钉性质不钉字面/欺诈断言禁入册）、open/closed 枚举面声明制。
