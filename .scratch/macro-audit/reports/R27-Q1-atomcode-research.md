# R27-Q1 atomcode 深调研报告 —— 开源 README「上游致谢面」建制（2026-09-22）

> 置信度：高（心智模型/漂移风险多源支撑）／中（closed 对账断言收益为本项目特定判断）。题面存档=R27-Q1-research-prompt.md。

## 1) 执行摘要

工业界成熟分工：**NOTICE/THIRD-PARTY-NOTICES 承担法律义务性 attribution，README Acknowledgments 承担人情与叙事性 credit**——两者语义不同，不应混写。对本题推荐：新增轻量 Acknowledgments 节、**仅列 active 8 项**、作为 lock 表人读投影并加双向差集守卫，但守卫应做成「**机器生成段落 + 比对**」而非「手写枚举 + 断言」；retired/planned/evaluating 不进致谢面（retired 已有 provenance 反查路径，谢未接入甚至已否决的上游是语义错误）。

## 2) 分点结论

### ① 心智模型：法律义务 attribution ≠ 人情致谢 credit

- **Apache-2.0 §4(d) 原文核验**（apache.org 全文读）：NOTICE 义务是**承接式**——若上游带 NOTICE 文件，分发衍生作品须在 NOTICE/源码/文档/展示界面之一附「可读副本」。**义务对象是上游的 attribution notices，不是你对上游的感谢**。8 个 active 上游多为 Apache/MIT 工具或远程 API——分发行为触发义务，README 致谢节**不能替代** NOTICE/许可证文本的合规承载。
- **义务侧惯例**（mend.io attribution report + stackexchange 交叉）：attribution statement 工业形态=**机读清单驱动的自动生成报告**（SCA 从 lockfile/manifest 生成，含 license 全文+版权行）——无固定标准规定位置，人工维护必然漂移。
- **人情侧惯例**（standard-readme spec + unified + opensearch observability-stack 交叉）：standard-readme 把 Thanks/Credits/Acknowledgements 定为**可选节**，要求=「State anyone or anything that significantly helped」——"anything" 含工具/依赖（unified 谢资助者与影响力来源；opensearch 写 "built on top of excellent open-source projects"）；npm 官方政策明文认可 README credits/acknowledgments/attributions 为正当内容。
- **"powered by" 叙事分层**：成熟项目做法=**一句叙事性感谢 + 指向合规文件**，不在致谢节复述版本/pin/契约——**版本锁定细节属工程证据面（upstream-lock.yaml），写进致谢面=制造第二个会漂移的事实副本**。
- **结论**：三层分工——NOTICE/LICENSE 承接法律义务（上游若有 NOTICE 须承接）、upstream-lock.yaml=机读权威（已是）、README 致谢节=人读门面性 credit（只写名字+链接+一句角色，不写版本、不写契约）。

### ② 枚举面 vs lockfile 的同步漂移：真实且被系统研究过

- **lockfile drift 先例**（sbomify 已读）：manifest↔lockfile 漂移修复惯例=**CI 严格命令（npm ci/--frozen-lockfile）失败即拦截**——派生物与权威源不一致=硬失败；SBOM 行业直接从 lockfile 生成清单，不从手写文档抄。
- **README 腐坏定量证据**（datadef readme-rot + arXiv 2603.00489 摘要）：README=「最多人读、最少人维护」，更新发生在 <1% PR；**腐坏顺序 badge/链接类最先死**（"dead badge is worse than no badge"）；结构性解法=**易挥发事实机器产、人只写慢变散文**——致谢枚举恰是易挥发事实（上游集随 D-037 手动窗口变动），适合生成式。
- **对账断言先例**：仓内已有同型建制——manifest.meta.json 单一元数据源生成双 manifest「先比后写」、44-check 新鲜度断言、CI rebuild-diff 守卫；**双向差集守卫与既有纪律同构，不是过度发明**。
- **风险侧证伪**：断言的过度建制形态=手写 Markdown 枚举+断言正则匹配标题——改格式就红 CI，守卫对象从「集合一致」腐坏成「字符串一致」。正确形态：**致谢节整体为生成物（或带 generated 锚段），守卫=重新生成后 diff 为空**——与 manifest.meta.json 先比后写完全同型。

### ③ 推荐（辩证，含反例）

**枚举边界：仅 active 8 项。**
- planned（openssf-scorecard）：谢未接入物=把 roadmap 叙事混入 credit，与「README 明示 planned 未接入」诚实纪律直接冲突——§3 表已有 planned 行，无需重复。
- evaluating（codelore-sqlite-dump）：首轮评估结论=不采纳——谢它=谢一个裁定不用的 dump 格式，语义荒谬。
- retired（repomix-gitingest）：D-037 定 retired 不删是为 **provenance 反查**（机读审计需求）；**人情致谢无「追溯补谢已退出上游」的义务或惯例**——留在 lock 表即可。
- 唯一可辩护扩展：致谢节脚注一句「完整上游账目（含 planned/evaluating/retired）见 upstream-lock.yaml」——链接而非复制，零漂移成本。

**承载面：README 尾部新增独立轻节（生成式段落），不扩表现有 §3 表。**
- 扩表反例：§3 表=技术证据面（角色/形态/锁定策略/状态），致谢面=叙事面——混写让表列语义分裂（retired「不出本表」纪律也会和致谢全集冲突）。
- 生成式理由：上游集随手动窗口变动，手写枚举=每个窗口多一处须记得改的文档；datadef 结论=易挥发事实必须机器产。
- 形态建议：`## Acknowledgments / 致谢`（英文节名+中文正文，与双层门面惯例一致），8 行 `名字 — 一句角色 — 链接`，外加指向 lock 表与 NOTICE 的脚注。

**closed 对账断言：有价值，但断言对象应是「生成物与 lock 同步」而非「手写文本与 lock 同步」。**
- 价值：致谢面=从 lock 派生的第 N 个人读副本，与 §3 表、lock 头部注释同属「人读形态绑定机读权威」模式（D-037③ 明文）；守卫把口头纪律变可执行。
- 过度建制风险（点名）：① 11 行小表配断言边际收益低——真正承重是**将来上游数量增长后手写必漏**，断言价值是预防性的；② **谢错对象语义风险真实**：codelore=外部 CLI 工具、github-rest=API 而非项目——写成对 GitHub Inc. 的感谢就谢错对象，**每行感谢宾语需人工确认一次**（生成模板逐行定义，不从 kind 自动推导）；③ **链接腐坏**：8 链接里 SchemaStore 指向 digest 快照而非上游主页——致谢链接应指上游仓库主页（慢变），勿指仓内 .scratch 快照路径（随布局变动而死）。

## 3) 对比矩阵

| 方案 | 漂移风险 | 语义正确性 | 维护成本 | 备注 |
|---|---|---|---|---|
| 仅 active + 新节（生成式+守卫） | 低（机器派生） | 高（只谢真实在用的） | 一次建模后续零手工 | **推荐**；脚注链 lock 全集 |
| 含 planned+evaluating | 中 | 低（谢未接入/已否决项） | 中 | 与 preview 诚实纪律冲突 |
| 含 retired 全集 | 低 | 低（追溯补谢无惯例） | 低 | retired 需求=provenance 反查，lock 表已覆盖 |
| 扩展 §3 技术表 | 中 | 中（表列语义分裂） | 中 | retired 不出表纪律与致谢全集冲突 |
| 纯手写枚举 + 字符串断言 | 高（格式脆断） | 高 | 每窗口手工 | 反模式：守卫对象错位 |

## 4) 来源清单

| 标题 | URL | 角度 | 贡献 |
|---|---|---|---|
| Apache License 2.0 | apache.org/licenses/LICENSE-2.0 | Official | §4(a)-(d) NOTICE 义务原文核验 |
| Standard Readme spec | github.com/RichardLitt/standard-readme | Official/Community | Thanks 节定位：可选、可谢 "anything" |
| unified README | github.com/unifiedjs/unified | Community 实例 | Acknowledgments 节真实形态 |
| opensearch observability-stack | github.com/opensearch-project/observability-stack | Community 实例 | "built on top of" 致谢叙事先例 |
| What Is Lock File Drift (sbomify) | sbomify.com/2024/07/30/what-is-lock-file-drift/ | Official/批评 | 派生清单漂移 + CI 硬失败惯例 |
| README rot (datadef) | datadef.io/guides/en/readme-rot | 批评 | 腐坏顺序、badge 死法、生成式解法 |
| Open Source Attribution Reports (mend.io) | mend.io/blog/open-source-attribution-reports/ | Official | attribution report=机读生成惯例 |
| Acknowledging employer (stackexchange) | opensource.stackexchange.com/questions/1140/ | Community | NOTICE 4(d) 义务与 credits 边界 |
| npm Open Source Terms | npmjs.com/policies/open-source-terms | Official | README credits 合规性 |
| 本地 upstream-lock.yaml + README.zh-CN.md | 本仓 | 事实核验 | 11 行 lock、§3 表 5 行、诚实注记纪律 |

## 5) 信息缺口

- 未找到「致谢节⇔lockfile 双向对账」直接公开先例——本项目自创建制，类比依据=manifest↔lockfile 与 SSOT 工具通用模式；降险路径=先以生成式段落落地、守卫第二步。
- NOTICE 承接义务需逐个核查 8 个上游是否各自带 NOTICE 文件（尤其 @duckdb/node-api 与 esbuild 发行物），本次未逐一开其仓库许可证文件。
