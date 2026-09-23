# R30-Q5 深调研题面：文件身份语义——subject_ref 规范化形 + rename 下的 subject 连续性

## 本仓背景

产品=宏观+微观工程内容审计（git 记录健全的项目）。已定（勿推翻）：DuckDB append-only audit_fact SSOT；文件质量卡=read-model 投影；**文件级事实=采集时逐 path 发射 subject_ref=<file path> 一等事实**（facet_rows 聚合载荷降 raw 证据层）；确定性 charter=字节级可重放/幂等/observed_at=HEAD 时点；corrosion boundary=上游工具 raw 语义不出适配层（ADR-0014），本层须定型语义；跨尺度关联键（Correlation Key）以 subject 身份为载体。

## 未裁分叉（本问）

文件身份语义两个子面：① **subject_ref 规范化形**——path 拼写 canonical form（仓根相对/正斜杠/Unicode NFC/大小写/无 ./ 前缀）如何定型，防同文件两拼写=两 subject=事实分裂脑（Windows 大小写不敏感宿主上尤其真实）；② **rename 下的 subject 连续性**——git 无原生 rename 概念，检测是启发式（git diff -M 相似度阈值：同输入同输出确定性成立但本质启发）；subject=path 下 rename=旧 subject 死+新 subject 生，文件卡核心内容（hotspot/churn 历史）全留在旧 path 行上。

候选：
- **(a) 纯 path 身份+规范化形**：subject=规范化 path；rename=新 subject 自然分裂，历史断在改名处——零启发依赖但「改名即失忆」损失真实演化信息；
- **(b) path 身份+rename 血缘一等事实**：subject=规范化 path；采集时确定性 rename 检测（git diff -M 固定阈值参数入载荷可复算）产出 file_renamed 血缘事实；卡投影沿血缘链缝合跨改名历史；检测漏判=历史诚实分裂非编造；
- **(c) 内容身份**：subject=blob hash 链——rename+edit 即断、同内容构建产物共 hash=错误模型；
- **(d) 上游语义继承**：subject_ref 镜像上游工具输出 path 原样——身份语义随上游版本漂移。

## 调研任务

取证工业界成熟心智模型：① **文件身份/路径规范化惯例**——git 自身 path 处理（core.ignorecase/precomposeUnicode 参数语义）、SonarQube/CodeScene/Sonarcloud 的 component key/path 规范化做法、CodeQL/LGTM 的 file identity、SCIP Document 标识约定；② **rename 追踪惯例**——CodeScene/CodeClimate/git log --follow 的 rename 检测语义（相似度阈值默认值、确定性程度、已知误报模式）、GitHub API renamed 事件、SonarQube 对 rename 文件的指标连续性处理；③ **血缘/lineage 一等事实先例**——数据血统（OpenLineage/Marquez entity linking）、SCIP occurrence/document 关系、审计系统的 rename-event-as-fact 惯例；④ **身份连续性 vs 分裂的代价评估**——audit/analytics 产品里「文件改名失忆」是真痛点还是可接受简化（有无论证 rename 频率与失忆成本的数据）；⑤ **规范化形踩坑**——大小写折叠（Windows/macOS case-insensitive FS vs Linux）、UTF-8 规范化（NFC/NFD）、符号链接、路径分隔符的真实事故先例。输出=推荐+各候选评估+理由+冲突核查+来源清单+信息缺口+置信度。
