# R23-Q6 atomcode 深调研——LFX 权重列处置：补读后裁 vs 判不需要 vs 界外声明

**调研日期**：2026-09-19｜**题面**：reports/R23-Q6-research-prompt.md｜**置信度**：高（Sufficiency Gate：searches 8 web×3/tavily×2/anysearch×3／五角度全覆 Official+Comparative+Criticism+Community+Currency／full reads 6：LFX health-score、LFX FAQ、SonarQube QG intro、CHAOSS metrics-models、UK Gov MCDA、CNCF 博客+LFX v1/v2 对比段全文；三引擎均命中同 URL 交叉印证）

---

## 1) 执行摘要

**推荐 (b)+(e) 合并采纳**——现裁不加权重列，销项注记落 map §④＋§⑤，权重语义移交 quadrant-rubric 判据面立案。

决定性证据（认知反转）：**LFX 原文已定点读透**——权重语义只存在于 **Health Score 聚合面**（v1 等权 4×25 → v2 加权 40/35/25，changelog.lfx.dev 2026-08-25 官方条目），**分类/映射页（Development 等）零权重列**——「同信号按类别出入」靠准入规则管不靠权重管。补读结果反而**支持**不加列，留票悬念已消解。SonarQube（condition=metric+operator+error value 挂门配置面）、CHAOSS（阈值交 consumer）、UK Gov MCDA（scoring 与 weighting 显式两阶段、weighting 归 stakeholder 人裁）三源同构支持「路由不管权重」分层。

## 2) 分点结论

- **结论 1（LFX 原文读透）**：health-score 页权重=聚合面产物（v1 等权 4×25 → v2 40/35/25）；分类页（Development 等）无任何权重列，同信号出入全靠准入规则；逐信号是分档计分而非权重列；
- **结论 2（SonarQube）**：quality gate condition=metric+operator+error value 挂门配置面——权重/阈值语义在门面不在 metric 路由面；
- **结论 3（CHAOSS）**：viability model 页阈值交 consumer——模型定义 metric 不定义权重/阈值，消费面自决；
- **结论 4（MCDA 方法论级）**：UK 政府官方 MCDA 指南（analysisfunction.civilservice.gov.uk/policy-store/an-introductory-guide-to-mcda/）——「decide scoring technique」属「Structure the problem」块、「weight your criteria」属「Elicit preferences of the decision stakeholders」块，且权重块发生在利益相关方偏好 elicitation **之后**。三层分离：**路由→scoring→weighting**＝本仓「映射表（路由）→spec 判据（scoring）→C 层 band 人裁（weighting/judgment）」完全同构；
- **结论 5（LFX v2 变更史反证）**：changelog.lfx.dev 2026-08-25 条目——v2 把 Popularity 从 Health Score 剔除、重新分配权重、点名废弃等权。若权重语义曾渗路由/分类面，这次再分配=破坏路由契约稳定性的变更；事实上 v2 只动评分页、分类面准入规则原封不动——**权重可高频迭代的前提恰是它不住在路由契约里**（「权重列不进映射表」最强工程论证）。

## 3) 对比矩阵

| 候选 | 裁定 | 判据 | 先例 |
|---|---|---|---|
| (a) 补读后裁 | **已被超越** | 补读已完成（本调研执行），产出=「权重只在聚合面」悬念消失，(a) 前提不复存在 | LFX health-score v1/v2 |
| **(b) 现裁不加列＋销项注记** | ✅ **采纳** | 权重属判据面；权重进契约=判据语义渗路由面（D-053 band 红线同构）；LFX/SonarQube/CHAOSS 三方均置权重于聚合/门/模型层路由面零权重 | LFX 分类页＋SonarQube QG＋CHAOSS viability |
| (c) OoB＋绑复审 | 部分吸收 | OoB 声明有价值但单用弱于 (b)——注记已隐含边界声明；绑复审可并入销项注记的复审钩子 | — |
| (d) 加列留默认 | ❌ 拒 | cargo-cult；LFX v2 反证权重高频迭代腐蚀路由契约稳定性；D-078④ 禁退化查表亦反对 | changelog.lfx.dev v2 |
| **(e) 权重语义移交 rubric 层立案** | ✅ **并入 (b) 落地动作** | MCDA：weighting 独立阶段归 stakeholder 偏好=C 层人裁；rubric 层=判据面唯一合法落点 | UK Gov MCDA |

## 4) 落地形态：销项措辞草案

**① §⑤ 追问留票行删「LFX 权重列补读」替换销项注记**：

```markdown
- **追问留票**（D-078 登记）：落点 vs quadrant-rubric 并面／Bot 占比 S5 vs S4 备选下轮再裁／~~LFX 权重列补读~~（已销：本表无权重列——权重/强度语义属判据面（quadrant-rubric + C 层人裁，ADR-0013/D-026），不属接线路由契约；LFX 原文印证：权重仅存在于 Health Score 聚合面（v2=40/35/25），分类页零权重列，同信号出入靠准入规则非权重（D-084）／#47 九类事实原文复核（接线票立票前）／ADR-0020 全文复读。
```

**② §④ 准入条件通用纪律追加一条**：

```markdown
- **权重不进映射表（D-084）**：本表是接线路由契约（fact→哪维+准入），不管「进维算多重」——权重/强弱语义归 quadrant-rubric 判据面与 band 人裁（ADR-0013/D-026 红线同 D-053 判据渗路由面先例）。LFX 先例：权重仅存 Health Score 聚合面，分类/映射页零权重列。
```

## 5) 冲突核查（10 条全零冲突）

| 对象 | 结果 |
|---|---|
| D-078④ 准入列形制 | 零冲突且被强化：准入列保持布尔门语义，「权重不进映射表」注记=防准入列被膨胀成权重的护栏 |
| D-053 判据渗路由面红线 | 同构先例直接引用：权重列进契约=band 语义进契约同型违规 |
| D-026/ADR-0013 band 归 C 层 | 零冲突且是 (e) 理论依据：weighting=价值判断=人裁面（MCDA 同构） |
| D-004 rubric 判据归 spec 封口 | 零冲突：(e) 移交 rubric 层沿已封口落点走不开新面 |
| D-082③ 通用判据先例 | 零冲突：三方「权重不进路由/采集面」=通用判据又一工业实例可入支撑列表 |
| D-083 落点分层 | 零冲突且被验证：路由→scoring→weighting 三层与落点分层同构 |
| D-037 单源 | 零冲突：权重语义单一归属判据面，注记仅边界声明非第二判据源 |
| ADR-0004 五维不动 | 零冲突：不加列不动五维定义不动行形制 |
| ADR-0014 适配层禁业务语义 | 零冲突：权重恰是业务语义绝不能进 descriptor/采集面——注记强化边界 |
| D-024 两字段复审纪律 | 零冲突：销项后 next_review 或接线票先到者复审钩子保留 |

**结论：零 revised；新增 D-08x（权重不进路由契约）＋rubric 层立案一条。**

## 6) 信息缺口

1. 本仓账本原文未逐字回读（D-053/D-026/D-004 措辞系知识库召回＋map 引用印证）——落地时先开账本核对再写注记；
2. quadrant-rubric 现行版是否已有权重相关条款未读——若已有应并入既有条款非新开；
3. LFX GitHub Discussion #1939（v1→v2 权重变更社区论证）未读——rubric 立案需更深权重设计先例可补读；
4. CHAOSS 是否存在显式「不指定权重」字面声明未验——拿到的是 viability 页「阈值交 consumer」语义等价表述。

## 7) 建议追问（grill 现场四问）

1. **rubric 层立案触发器挂哪**：挂「quadrant-rubric 初版参数起草」（建议——权重语义不该等实施）vs 挂接线票立票；
2. **准入列强度措辞禁令执行面**：接线票加机检（准入列禁「weight/强度/系数」字样）vs PR 评审人肉把关（建议先人肉，机检属 YAGNI）；
3. **措辞风格对齐**：「权重不进路由契约」与 D-053「判据语义渗路由面」措辞族对齐（建议对齐）；
4. **LFX v2 Popularity 剔除启示**：LFX 把流行度从健康分剔除独立成 Impact Score——本仓 S1 是否终将面对「人气≠健康」拆分压力？非本轮义务，rubric 立案时值得带一句。
