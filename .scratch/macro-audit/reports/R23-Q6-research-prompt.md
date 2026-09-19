# R23-Q6 atomcode 调研题面——LFX 权重列处置：补读后裁 vs 判不需要 vs 界外声明

## 问题

本仓 upstream→dimension 映射表（docs/upstream-dimension-map.md v0.1→v1.0 定稿流程；D-078~D-083 已裁骨架/接线/review 行 event_bound/Bot 行终裁/落点独立）追问留票末项「LFX 权重列补读」待裁。

实物现状：映射表五列=「fact_type｜语义｜dimension｜准入条件｜备注」，**无权重列**。

留票出处：R22-Q6 调研（reports/R22-Q6-atomcode-research.md）发现 LFX Insights 全平台唯一先例——同一信号按类别出入（bot actions 在 Development 计入、其余类 excluded）→已吸收为本表「准入条件」列（D-078④）。但 LFX 对指标还有权重/强度处置维度（同信号在不同 category 计量强弱），当时原文未读透故挂「LFX 权重列补读」。

架构事实：
- 映射表=接线路由契约（fact→哪维＋什么准入），不管「进了维算多重」；
- 权重/强弱=判据面职责：quadrant-rubric 初版参数/回退（D-004 spec 判据面）＋band 归 C 层人裁定（ADR-0013/D-026）；
- 权重列若进接线契约=判据语义渗进路由面，与 D-053 band 红线同型问题；
- R23-Q2 调研已登记 Shape Up「declare out of bounds」为合法处置。

问题：LFX 权重列怎么处置才算 v1.0 定稿？

## 候选

(a) 补读 LFX 权重语义后再裁（原留票字面路径）；
(b) 现在裁定不加列：权重=判据面职责归 rubric/spec，不进接线契约——销项注记「LFX 路由语义已由准入条件列完整吸收；权重语义属判据面越本表边界」；
(c) 界外声明＋绑复审（Shape Up OoB 形）；
(d) 加列全留默认值（cargo-cult 占列）；
(e) 他径（如权重语义移交 rubric 层立案）。

## 必回顾（硬要求）

1. 决策账本全部 current：D:\Aworker\6F\.scratch\macro-audit\decision-ledger.md（重点 **D-078** 准入条件列出处+LFX 先例原文段／**D-053** band 红线+判据归 spec 面／**D-026** band 归 C 层／**D-082③** 快照/趋势通用判据升格先例／**D-083** 落点分层终裁／**D-004/ADR-0004** S1-S5 判据 spec 封口／**D-037** 单源防漂移）；
2. ADR：D:\Aworker\6F\docs\adr\0001-0021（0004 五维判据／0013 band 归 C 层）；
3. CONTEXT.md：D:\Aworker\6F\CONTEXT.md（Strategic Quadrant／Kernel-Agent 边界）；
4. 实物：docs\upstream-dimension-map.md 全文＋reports\R22-Q6-atomcode-research.md LFX 段原文；
5. **工业界成熟心智模型（重点）**：LFX Insights 指标权重/计量语义原文（这次必须读透——LFX metrics 分类页的 weight/scoring 处置到底是什么：是按 category 的计量规则、还是 dashboard 展示权重、还是 aggregation 权重）；加权指标体系的成熟模型（multi-criteria decision analysis 权重与路由分层先例、scoring rubric 的 weight column 惯例、SonarQube quality gate 条件 vs metric 权重分离、CHAOSS 不定义权重只定义 metric 的先例——CHAOSS metrics 是否明言不指定权重/阈值交给 consumer）；routing vs weighting 分层心智模型；声明 OoB 的适用边界；
6. 给出推荐与理由＋失败模式＋落地形态（销项措辞草案；若 (e) 则 rubric 侧移交措辞）；
7. 显式核查冲突面（D-078④ 准入列形制是否因「权重列缺席」不完整；D-053/D-026 band 边界）。

## 交付

结构化 Markdown：①结论；②逐候选裁定；③工业先例证据（带 URL——**LFX 权重语义必须定点读到原文**，读不到就如实报缺口）；④落地形态设计；⑤失败模式；⑥冲突核查逐条 D-xxx；⑦信息缺口；⑧建议追问。
