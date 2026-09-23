# R30-Q6 深调研题面：文件卡查询语义——观测时点选择×staleness 披露×miss 分类×补采粒度/资格

## 本仓背景

产品=宏观+微观工程内容审计（git 历史→审计）。已定（勿推翻）：append-only audit_fact SSOT（observed_at=采集 HEAD 时点，同 subject 可有多时点事实集）；文件卡=read-model 投影；MCP 只读永不写；CLI 面 miss 可触发确定性 lazy 补采（与批量同构 per-file 发射管线）；披露四件含 head_sha；卡失败三态已定（new_file/insufficient_history、binary/generated→not_applicable 不出空卡）；subject_ref=SCIP 式规范化 path；rename 血缘=file_renamed 一等事实供投影缝合；上游实体面（codelore hotspots/entity-churn 等）全是**仓级扫描**——无单文件分析面。

## 未裁分叉（本问）

卡查询语义四个联动子面：① **观测时点选择**——卡答「最新已采集观测集」vs 支持 at:<sha> pin vs 强制当前 HEAD 匹配；② **staleness 披露**——采集 HEAD 与当前 HEAD 漂移时卡如何表达（披露双字段 vs 拒答）；③ **miss 分类学**——not_collected 单态 vs 显式分族（never_collected/not_tracked_at_sha/not_applicable/renamed_to+血缘跳转）；④ **补采粒度与资格**——真·单文件补采不存在（上游全仓级扫描）⇒ 补采=仓级管线按当前 HEAD 跑；脏工作区是否阻塞（采集读 git 对象非工作区）。

候选：
- **(a) 最简化**：卡=最新已采集观测集；staleness 靠 head_sha 披露自理；miss 二分；补采=仓级管线无资格检查；
- **(b) 时点可选+miss 四类+补采资格**：默认最新观测+at:sha pin（append-only 下=WHERE 零新机制）+staleness 双字段对比披露（collected_head vs current HEAD，MCP 只读 rev-parse）+miss 四类显式态+补采=仓级管线+脏工作区不阻塞（读 git 对象）；
- **(c) 严格时点匹配**：卡只答当前 HEAD 观测集，stale=拒答强制重采；
- **(d) worktree 感知**：覆盖未提交变更——违观测锚定已列负向。

## 调研任务

取证工业界成熟心智模型：① **时点语义惯例**——CodeScene/SonarQube 分析结果 vs HEAD 漂移的处理（分析是快照，报告如何披露时点/staleness；SonarQube 分支分析/new code 定义的时点模型）；Sourcegraph 的 indexed commit vs HEAD；数据系统的 as-of 查询惯例（bitemporal as-of system time vs valid time，SQL:2011 temporal、XTDB/Datomic as-of 先例）；② **staleness/漂移披露惯例**——缓存/索引产品的 stale 标注（Sourcegraph「index may be stale」、监控系统的 data-as-of 披露）；③ **miss/空态分类学惯例**——HTTP 404 vs 410 vs 301 语义、GraphQL null vs error、SonarQube 「file not analyzed」态、API 设计中「未采集」vs「不适用」vs「已移走」的状态码分离先例；④ **读对象 vs 读工作区**——git plumbing（cat-file/log 读对象库不碰工作区）与 porcelain 的边界惯例；dirty worktree 对历史分析类操作的影响实证；⑤ **sha-pin 成本收益**——as-of 参数在审计/查询 API 的先例（Datomic asOf、XTDB valid-time、GitHub API ref 参数）。输出=推荐+各候选评估+理由+冲突核查+来源清单+信息缺口+置信度。
