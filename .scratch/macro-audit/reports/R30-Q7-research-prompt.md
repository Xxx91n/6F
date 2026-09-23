# R30-Q7 深调研题面：Micro-B preview 票面形态——试点仓/边界件集/验收序列/披露件套

## 本仓背景

产品=宏观+微观工程内容审计（git 历史→审计）。Micro-B=文件级审计 preview。已定决策（勿推翻）：预采集+read-model 投影+MCP 只读+CLI lazy 补采（仓级管线按当前 HEAD）＋披露四件（head_sha/advisory:true/SSOT 源/prefetch-vs-backfill）＋卡契约三层（kernel 数据层+确定性派生层 priority_band/percentile_rank/top_n_flag+宿主叙事层，禁 A-E 判语）＋per-file 一等事实（facet_rows→raw 证据层）＋subject_ref SCIP 式规范化+rename 血缘一等事实＋查询语义（at:sha pin/staleness 双字段照答不拒答/miss 四类显式态含 renamed_to 条件跳转）＋补采产出新观测集 append。

票面先例（已立法形态）：尺度 preview=单票闭环——管道+试点实跑+报告工件+披露三件套（preview 标注+能力 N of M+同主确认偏差）+failure 演示件+golden 契约（锁字段骨架非内容值）+能力矩阵措辞同票收窄。试点仓池：jiahao（小仓全人 D-033 下限基线）／env-manager（历史厚）／anysearch-cli（校准仓）。

## 未裁分叉（本问）

票面形态：① 单票 vs 拆票——发射改造（per-file+规范化+血缘，基础设施面）与卡面（投影+查询语义+试点，消费面）拆两票有 infra-without-consumer 风险，合一票票面厚；② 试点仓选型判据——文件级审计要的是演化史厚度×rename 存在性×边界件可得性，非 Micro-A 的 PR 面逻辑；③ 边界件集枚举——miss 四类（never_collected/not_tracked/not_applicable/renamed_to）+insufficient_history+rename 缝合件，每类须可复现实物；④ 验收序列与 golden 粒度；⑤ benchmark 判据落法（仓规模分档 A-批量 vs C-lazy 首查延迟实测）。

候选：
- **(a) 最小票面**：单票=发射改造+投影+双通道+一试点仓+schema golden，边界件后补；
- **(b) 完整票面**：单票闭环九项（发射改造三合一/投影+查询语义/双通道/试点双仓 jiahao+env-manager/边界件显式枚举集/披露三件套/golden 字段骨架/benchmark 判据/能力矩阵同票收窄）；
- **(c) 拆两票**：基础设施票→卡面票；
- **(d) 搭车**：发射改造并进 codelore Macro-B 归位票。

## 调研任务

取证工业界成熟心智模型：① **feature preview/试点票面形态惯例**——新产品能力的 preview/flag 发布票面应含什么（验收判据/边界覆盖/披露/回滚）；feature flag 下「infra+consumer 同票 vs 分票」的工程惯例（stacked diff/branch-by-abstraction 先例：基础设施先行票如何保持可验收）；② **试点对象选型判据**——工具验证用「代表性样本」的选型惯例（覆盖度 vs 最小充分集；测试金字塔/fixture 选型文献）；③ **边界件/负例覆盖惯例**——状态机的每个枚举值都要有验收件的惯例（state coverage）、miss/failure 态分类全测的实证价值；④ **benchmark 判据写法**——延迟/性能验收判据如何写成可判定形式（分档阈值 vs 比例 vs 趋势）；⑤ **预览期披露惯例**——preview/beta 能力的标注措辞惯例（「not for production use」级 vs capability 计数）。输出=推荐+各候选评估+理由+冲突核查+来源清单+信息缺口+置信度。
