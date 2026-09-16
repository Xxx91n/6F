# #46 经典公开仓回归候选短名单（呈报，待用户选定）

> 轮 9 T3 / D-046③＋D-013（URL opt-in 输入面）。数据源 = atomcode 调研 2026-09-16（GitHub API 一手元数据 + adr.github.io/cwiki 交叉核验，置信中高）。
> **状态 = 呈报非定案**：用户选定后才接入 `.github/workflows/macro-b-regression.yml` resolve job 的 DEFAULT JSON（一仓一行）。

## 对比矩阵（实测值）

| 仓库 | 语言 | .git 体积* | License | commits 量级 | 决策文档实践 | 活跃度 | 结论 |
|---|---|---|---|---|---|---|---|
| git/git | C | ~312MB | GPLv2（宽松度中） | 7 万+ | ★★ DecisionMaking.adoc + technical/ 38 篇设计文档 | 日更 | **C 首选** |
| curl/curl | C | ~144MB | curl（MIT 类） | 3 万+ | ★ 丰富 docs 但无决策记录 | 日更 | C 备选 |
| sqlite/sqlite | C | ~550MB | Public Domain | 高 | — | 高 | 排除（fossil 主开发，GitHub 仅镜像） |
| redis/redis | C | ~211MB | RSALv2/SSPLv1（不宽松） | 2 万+ | 无 | 日更 | 排除（license） |
| django/django | Python | ~276MB | BSD-3 | 5 万+ | ★★ DEP 机制（语料在 django/deps 仓） | 日更 | **Python 首选**（可配套 deps 仓） |
| pallets/flask | Python | ~12MB | BSD-3 | ~6 千 | 无 | 活跃 | Python 备选（历史偏浅） |
| cpython | Python | ~854MB | PSF | 4 万+ | PEP 在独立仓 | 日更 | 排除（克隆超时风险） |
| spring-projects/spring-boot | Java | ~214MB | Apache-2.0 | 8 万+ | ★ issues/design 流程，文档全 adoc | 日更 | **Java 首选** |
| apache/kafka | Java | ~308MB | Apache-2.0 | 4 万+ | ★★ KIP（多在 wiki；有 AGENTS.md） | 日更 | Java 备选（要 AGENTS.md 语料选它） |
| guava / elasticsearch | Java | 1.4/1.7GB | Apache / 非宽松 | — | — | — | 排除（克隆超时） |

*\.git 体积 = GitHub API size 字段（打包体积）；全克隆通常再 ×1.5–2，312MB 量级在 20min CI 预算内≈分钟级。

## 最终短名单

| 语言族 | 首选 | 备选 |
|---|---|---|
| C | **git/git** | curl/curl |
| Python | **django/django** | pallets/flask |
| Java | **spring-projects/spring-boot** | apache/kafka |

## 关键发现与风险披露（如实）

1. **头部开源大仓几乎无字面 `docs/adr/` 目录**——它们用决策提案变体（git 的 DecisionMaking.adoc/technical/、Kafka KIP、Django DEP）。Macro-B one-shot 的 ADR 语料面只读 `docs/adr/` → 这些仓 TC-1/TC-2 将如实落 INCONCLUSIVE/insufficient（反复接受非跑通，D-033 口径下仍是有效回归信号：管线跑通+工件齐备=job 绿）。
2. **变体目录映射属范围扩张**——把 KIP/DEP/technical 映射进 ADR 语料面需另立票评估（采集器适配），不在本票隐含范围内。
3. **克隆耗时未实测**——建议首接前跑一次 clone 基准（或先以 dispatch opt-in 试单仓），超 20min 预算的仓即淘汰。
4. license 从严口径下 C 族首选应换 curl（git 为 GPLv2）。

## 接入方式（选定后）

`resolve` job 的 `DEFAULT` JSON 追加 `{\"name\":\"<repo>\",\"url\":\"https://github.com/<owner>/<repo>.git\"}` 行即可——matrix 每仓一 job leg，工件名按 name 区分。

## 来源

- atomcode 调研（8+ searches / GitHub API 一手元数据 / adr.github.io + cwiki + 各仓 tree 探测），索引于 ctx source=atomcode 2026-09-16。

