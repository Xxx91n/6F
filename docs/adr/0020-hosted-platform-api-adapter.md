# ADR-0020: 托管平台 API 适配器 = GitHub REST＋env token 主路，gh 已认证态为可选回退

- Status: accepted
- Date: 2026-09-16
- Deciders: 用户（grill 轮 11 Q1，atomcode 调研后拍板「采纳」）
- Ledger: D-048（current）；承 ADR-0014（上游双轨）／ADR-0016（纯 Agent Plugins 分发）／D-034②（Micro-A 前置新外部面）／D-047（试点第三槽）

## Context

Micro-A（PR 级 diff 审计）需要托管平台数据面：PR 枚举（含人/机判读）、元数据、diff/patch——全部 read-only。直觉候选是封装 gh CLI（本机已认证、零新凭据面、git-cli=active 锁表先例）。调研给出决定性反证：ADR-0016 分发语境下本产品是 third-party consumer，社区惯例明言「don't ship a gh-binary dependency to every user」；git-cli 先例不可迁移——git 是产品运转硬依赖（审计 git 仓必有 git），gh 是额外二进制负担。

## Decision

适配器（#47）路径钉死：

- **主路 = GitHub REST API + env token**（`GITHUB_TOKEN` 探测），`X-GitHub-Api-Version` 头 pin；
- **可选回退 = 既有 gh 已认证态只读借用**（best-effort 加速器，非契约承诺、非 git-cli 先例延伸）；
- **降级 = 无认证 REST 显式 degraded**（公仓 60/hr 限流如实披露）；
- 凭据三级探测即用即清，不建凭据存储、不引 OAuth；
- 最小契约 = PR 枚举（平台声明 Bot 判读：user.type==Bot＋[bot] 后缀双检）＋元数据＋diff 双通道（本地 git base...head 优先，API diff 仅在 base/head 缺席时兜底）；review/comment 面 = planned 不入最小集；
- 限流 = 读 x-ratelimit-* 头＋Retry-After＋余额写事实库，耗尽即确定性降级/停止；
- raw 上游响应不出适配器边界（ADR-0014）；锁表 kind 词表扩 remote-api（已登记 github-rest planned 行）。

## Considered Options

- gh CLI 封装为主路——拒：分发给每个用户强绑 gh 二进制＋auth 态存在前提，违 ADR-0016 轻分发语境；
- 无认证 REST 为主路——拒：公仓 60/hr 撑不起枚举量（62 PR≈130 请求）；
- 裸调 gh/REST 无适配层（原题 c 项）——拒：raw 语义直穿输入面，违 ADR-0014 边界与锁表登记制。

## Consequences

- API 面补充而非替代 D-013 本地优先输入面；私仓场景「token 必需」披露进票；
- golden cassette 契约测试覆盖：认证态／无认证降级／限流耗尽／schema 漂移／平台 Bot 作者；
- 措辞纪律：Bot 判读写「平台声明的 Bot 身份」，不承诺语义级人/机判定。
