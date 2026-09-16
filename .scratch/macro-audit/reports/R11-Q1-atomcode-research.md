# R11-Q1 atomcode 深度调研报告 — 托管平台 API 适配器立案（Micro-A preview 硬前置）

> 调研题面：D:\Aworker\6F\.scratch\macro-audit\reports\R11-Q1-research-prompt.md
> 时点 2026-09-16；通道 ctx_batch_execute（label=atomcode-r11q1，FTS 已索引）；atomcode 会话锚 bf2e1b8f-6905-4a87-99e6-9685b21ce4eb。
> Sufficiency Gate：searches 7（web_search 2 / tavily 2 / anysearch 3）| angles 5/5（Official/Comparative/Criticism/Currency/Community）| full reads 6（docs.github.com 限流页·PAT 管理页·PRs REST 页·github.blog 2025-05-08 changelog·wiki.r-that.com gh-as-backend·cli.github.com gh_pr_list）。关键结论均 ≥2 独立信源或 ≥2 引擎交叉。
> 冲突协议结果：**无实质冲突，3 个显式调和点**（§④）。

## §1 执行摘要（Tl;dr）

**推荐 (a)：此刻立案适配器票（拟 #47），票内钉死「混合路径：REST + env token 为主，gh CLI 探测降级为可选加速器」，review/comment 面不入最小集。** Confidence：**高**（立案时机与混合路径判定有多源官方文档 + 本仓锁表先例 + 本地 gh 实测三方支撑）；review/comment 面取舍为**中高**（基于最小契约惯例与 YAGNI，属设计判断）。

## §2 分点结论

### ① 应否此刻立案 —— 应立案。Confidence：高

判据链（每环 ≥2 支撑）：

- **硬前置已由 current 决策锁定**：D-034② 串行骨架把 Micro-A 定为第三位，且明文「需托管平台 API 适配器新外部面」；D-047 把试点集第三槽挂在本适配器上。适配器不开工，Micro-A 无法开工——这是开工门前置，不是可拖延项。
- **信息充分性已达标**：需求面三块（PR 枚举含 author 人/机判读、diff/patch、元数据）已有实测数据支撑——试点仓 env-manager 实测 46/62≈74% 机器 PR；人/机判读在 API 侧有明确落点（user.type=="Bot"）；gh pr list --json 字段清单已能逐字对上需求面，契约面设计输入已齐。
- **锁表纪律要求先登记再接入**：upstream-lock.yaml 明文「未在本表登记的上游禁止接入」——GitHub REST 作为新上游必须先有 planned 行+契约+pin 策略（ADR-0018/D-037）。
- **不立案的 (c) 案确证违约**：gh 裸调探针=raw JSON 直穿 verdict 输入面，结构性违反 ADR-0014；(d) 案冻结 D-034 主干代价更高。

### ② 需求面边界与实现路径

**对比矩阵（四路径 × 关键维度）：**

| 项 | gh CLI 封装 | REST + env token | 无认证采集 | 混合（推荐） |
|---|---|---|---|---|
| 限流额度 | 继承 gh 内 auth（5,000/h） | 5,000/h（token）/ 60/h（无） | 60/h，且 2025-05 起收紧 | token 主路 5,000/h |
| 凭据管理 | gh auth / GH_TOKEN，零自建代码 | 自管 env token，复用 D-013「即用即清」纪律 | 无凭据 | env token 优先，gh 已认证态为回退 |
| 分发依赖代价 | **高**：用户机须装 gh + 已认证（Agent Plugin 分发面真问题；社区实践明言「don't ship a gh-binary dependency to every user」third-party consumer 反模式） | **低**：Node 内置 fetch 即可，无外部二进制 | 低 | 低（gh 仅可选加速器，缺席即降级） |
| 契约可钉性 | CLI 输出随 gh 版本漂移，但 --json 字段列表稳定 | JSON schema 稳定，X-GitHub-Api-Version 可 pin | 同 REST | 双通道需 golden 双检 |
| 锁表先例契合 | git-cli=active 已立「CLI 封装+不 pin 版本、冻结 argv+契约测试」先例 | 需 exact pin（api-version header） | — | 两种先例并用 |
| raw 语义风险 | gh 子命令输出≠契约面，须经适配器翻译 | 同左，但面是自己定义的 | 同左 | 可控 |

**推荐实现路径细节：**

1. **主路 = REST 直连 + env token**（GITHUB_TOKEN / fine-grained PAT，read-only 权限集：Pull requests: read + Metadata: read）。理由：Agent Plugins 纯分发语境（ADR-0016）下不能要求用户装 gh——「用户机须装 gh」是 third-party consumer 场景的明确反模式，而我们正是 third-party consumer（分发对象=插件用户）。REST JSON + X-GitHub-Api-Version header 给出最稳的可 pin 契约面。
2. **人/机判读落点**：user.type 字段（"User" vs "Bot"）+ login 后缀 [bot] 双检（GitHub Actions 官方文档即以 user.login=='dependabot[bot]' 作判据；Synacktiv 研究同锚）。**诚实披露点**：判不出自建 GitHub App 之外的 CI 脚本身份——契约措辞写死「author 为平台声明的 Bot/人身份」非语义判定。
3. **review/comment 面不入最小集**：preview 验证目标（人/机 PR 区分度）不依赖之；面可得但最小契约坚持「preview 层自成完整价值单元」（ADR-0017）；登记为 planned 后续面待需求拉动（同 D-035 逐面 golden 纪律）。
4. **git 双通道注意**：PR diff 有零 API 成本路径——本地已 clone 仓直接 git diff base...head。票内把「API diff vs 本地 git diff」分作两个 face 登记，本地面优先（D-013 一致，不耗限流）；API 面只兜 base/head 不在本地 clone 内的情形（force-push 后原始 diff）。

### ③ 限流 / 凭据 / 降级披露三面惯例化处置

- **限流**：读 x-ratelimit-remaining/reset 头 + 次级限流 403/429 遵守 Retry-After、不硬重试、退避。契约：每响应读限流头并把余额写进事实库运行日志；触顶即停+报告标注；不做跨进程全局限流器（5,000/h 对 PR 枚举+diff 量级充裕——env-manager 62 PR 全量≈130 请求）。
- **凭据**：复用 D-013「凭据即用即清、不新建凭据存储」——探测顺序：GITHUB_TOKEN env → 本地 gh auth 态（存在则借其 token，只读不改）→ 无认证模式（60/h + 降级披露）。不新建 token 存储、不引入 OAuth 流。凭据面动作属 D-026/D-027 用户闸门域。
- **降级披露**：三态诚实缺席：token→全速；无 token→「unauthenticated: 60 req/h，大仓枚举可能截断」预披露+超限 degraded 头标；完全不可达→「数据未接」降级披露（ADR-0017 同款）。所有降级路径可确定性触发、可进 golden 测试。

### ④ 与本仓 current 决策的冲突点（显式列出）

**无实质冲突，但有 3 个需要显式调和的点：**

1. **与 ADR-0014（上游双轨制）**：GitHub REST 不是 CLI 也不是库，锁表 kind 枚举（external-cli/node-lib/go-lib-or-cli/data-export）没有对应行——需扩一个 kind（如 remote-api）。枚举扩容非改向，票内必须明示，避免被读成偷改锁表契约（D-037③ 逐字字段清单）。
2. **与 D-013（本地优先输入面）**：适配器读的是托管平台 PR 元数据，不是仓库内容——输入面仍是本地 clone 优先，API 面只作 diff/元数据补充。票内必须写明「API 面不替代本地输入面，base/head 可从本地 git 解得时不调 API」。
3. **与 gh-as-backend 先例的张力**：git-cli=active 先例前提是「git 二进制随宿主必有/gh 仅用于本机审计工具链」，而本适配器面对的是分发到用户机的产品路径，前提不同。票内若选混合路径须显式写「gh 探测为可选优化非依赖」，避免被读成 git-cli 先例的自然延伸（它不是）。

### ⑤ 风险与诚实披露点

| 风险 | 等级 | 披露/处置 |
|---|---|---|
| 无认证 60/h 且 2025-05 起 GitHub 收紧无认证限流（官方 changelog） | 高 | 预披露 + token 探测链 + degraded 标注；不能假设无认证模式长期可用 |
| 机器 PR 判读只覆盖平台声明 Bot | 中 | 报告措辞用「author 为平台 Bot 身份」，不写「人/机已完全区分」 |
| GitHub API schema 漂移（preview header/字段增删） | 中 | X-GitHub-Api-Version exact pin + golden cassette；锁表 next_review 照制度走 |
| 用户 token 滥用面（插件误用用户 token） | 中 | 只读权限集写进文档；凭据即用即清；用户闸门 |
| 混合双通道契约面翻倍（REST JSON + gh JSON 两套 golden） | 低 | gh 通道降级为 best-effort 不承诺契约；或只留 REST，gh 只用于本仓开发期探针 |
| 私仓场景（jiahao 等）fine-grained PAT 权限边界 | 中 | 私仓枚举必须 token；票内列私仓为「token 必需」场景并披露 |

## §3 来源清单

| # | 标题 | URL | 角度 | 贡献 |
|---|---|---|---|---|
| 1 | Rate limits for the REST API（官方） | docs.github.com/en/rest/using-the-rest-api/rate-limits-for-the-rest-api | Official | 60/h 无认证、5,000/h 认证、secondary limit 403/429+Retry-After（已全文读） |
| 2 | Updated rate limits for unauthenticated requests（官方 changelog） | github.blog/changelog/2025-05-08-updated-rate-limits-for-unauthenticated-requests/ | Currency | 无认证采集不可作长期假设（已全文读） |
| 3 | gh CLI as backend（社区实践 wiki） | wiki.r-that.com/patterns/gh-cli-as-backend/ | Comparative/Criticism | gh 封装收益与 gotchas：third-party consumer 反模式、execFile 注入纪律、secondary limit 仍会咬（已全文读） |
| 4 | gh pr list 手册（官方） | cli.github.com/manual/gh_pr_list | Official | JSON 字段清单↔需求面逐字对齐、--app 机器 PR 过滤（已全文读） |
| 5 | REST API endpoints for pull requests（官方） | docs.github.com/en/rest/pulls/pulls | Official | list PRs 支持 fine-grained token Pull requests: read；无认证仅限公共资源；diff 媒体类型（已全文读） |
| 6 | Managing your personal access tokens（官方） | docs.github.com/en/authentication/.../managing-your-personal-access-tokens | Official | fine-grained PAT 推荐、命令行优先 gh/GCM 凭据惯例（已全文读） |
| 7 | Automating Dependabot with Actions（官方） | docs.github.com/en/code-security/tutorials/secure-your-dependencies/automate-dependabot-with-actions | Official | 人/机判读官方锚点 user.login=='dependabot[bot]' |
| 8 | GitHub Actions exploitation: Dependabot（安全研究） | synacktiv.com/en/publications/github-actions-exploitation-dependabot | Criticism | 独立二源佐证 dependabot[bot] 判读锚 + Bot 身份可被利用安全面 |
| 9 | Working with the GitHub API rate limit（社区） | github.com/orgs/community/discussions/189255 | Community | 退避/读头/Octokit 插件惯例共识 |
| 10 | fine-grained token permissions（官方） | docs.github.com/rest/authentication/permissions-required-for-fine-grained-personal-access-tokens | Official | read-only 权限集落点（摘要级未逐条核验——见缺口） |
| 11 | 本仓实物：decision-ledger current（D-013/024/026/027/033/034/035/037/043/047） | D:\Aworker\6F\.scratch\macro-audit\decision-ledger.md | 本地 | 决策地基（已沙箱解析） |
| 12 | 本仓实物：upstream-lock.yaml + engine/src/upstream/codelore.ts | D:\Aworker\6F\engine\ | 本地 | 锁表字段契约+适配器形态先例（已读） |

## §4 信息缺口

1. fine-grained PAT 对 PR 元数据子字段（如 commits 关联）逐条覆盖未逐 endpoint 核验——票内钉契约前逐条对 docs 清单。
2. GraphQL 省额通道未深入——本量级（<100 PR/仓）用不上，暂不必要。
3. 非 GitHub 托管平台（GitLab 等）抽象层预留未调研——按 D-024 两字段纪律挂「将来另判」，不纳入最小集。
4. ctx_search 召回两次服务端异常未复用历史索引；本地实物已直接读源覆盖，不影响结论有效性。
