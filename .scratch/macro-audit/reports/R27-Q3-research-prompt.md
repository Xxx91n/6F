# R27-Q3 atomcode 调研题面（存档）

> 2026-09-22 轮27 grill Q3。执行面=atomcode -p（ctx_batch_execute 串行）。

## 调研问题（verbatim 发出）

「冻结输出契约撞上真实脏数据」的违约处置层级取舍：一个工程内容审计工具（审计 git 仓历史，要求全链字节级确定性）在 intake 对 `git log --format=%cI` 输出做严格形状断言（ISO-8601，Z 或 ±HH:MM 区），设计目=吸收 git <2.45 吐 +00:00 而 ≥2.45 吐 Z 的版本拼写漂移（边界归一化+不符即拒）。实测撞墙：审计 git/git 仓时其历史存在 %cI 输出为 `" INDIA"` 的病态 commit（上游历史本身的脏数据、无时间戳可挽救），逐 commit 解析循环中一个病态日期=整仓审计中止。设计张力：契约不符即拒 vs 审计产品对真实脏历史的鲁棒性。选项：(a) 硬崩保持+登记已知覆盖缺口（该仓裁定 unsupported 如实落数）；(b) 层级重划——协议级违约（列结构/分隔符形状坏）仍 fail-fast，字段级病态（单字段值语义不合法）进 quarantine 隔离桶：该 fact 行日期置 null+⚠malformed 印记+报告显式计数，审计继续；(c) 归一化扩形（放宽形状断言接受任意区名）；(d) opt-in 分流开关。请调研：①数据摄入管线对「协议违约 vs 记录级病态数据」的成熟处置心智模型（fail-fast vs dead-letter-queue/quarantine 的适用边界与判据、strict parser vs tolerant reader 之争在数据摄取而非安全语境下的形态）；②git 考古/历史分析工具对病态 commit 元数据（畸形日期/作者/编码）的实际处理惯例（code-maat/git-of-theseus/gitoisk 类工具、GitHub 自身对坏 commit 的渲染策略）；③对本题给出建制推荐——层级划线的判据（什么违约归 fail-fast、什么归 quarantine）、quarantine 的可观测性要求（计数/印记/报告位置）、以及「为病态数据松动契约」的滑坡风险边界。辩证看待，指出牵强处与反例（quarantine 桶沦为垃圾收容所/标记疲劳/审计完整性稀释）。
