# Micro-A preview 前置：试点集双仓 PR 面实测复核（T7 / D-047 / D-034②）

> 时点 2026-09-16；方法 = `gh pr list -R <repo> --state all --json author` 托管面实读（非本地推断）。
> 口径：PR author `app/*` = 机器账号；用户登录名 = 人。复审锚 = micro-a-preview-prep occurred 前的前置记录。

## 实测读数

| 仓 | PR 总数 | 人 | 机器 | 机器面形态 | 判定 |
|---|---|---|---|---|---|
| Xxx91n/env-manager | 62 | 16（Xxx91n） | 46 = dependabot 37 + github-actions(release-please) 9 | dependabot 依赖 bump＋release-please 发版 PR——**最难判区分度的机器 PR 边缘形态** | 试点成立：机器 PR 富集 |
| Xxx91n/jiahao | 7（#1–#7 全 MERGED） | 7（Xxx91n） | 0 | 无 | 试点成立：全人 PR 干净基线 |

- 命令：`gh pr list -R Xxx91n/env-manager --state all --limit 200 --json author` → group_by author = {Xxx91n:16, app/dependabot:37, app/github-actions:9}；`gh api repos/Xxx91n/env-manager/branches` bot 名分支在飞 1。
- `gh pr list -R Xxx91n/jiahao --state all` → 7 条全 Xxx91n 全 MERGED。

## 结论

1. 双试点集 = {env-manager, jiahao} 复核通过（D-047①）：env-manager 机器 PR 占比 46/62≈74%（dependabot+release-please 双形态），jiahao 全人 7/7——区分度验证面一难一净，与 #37 实测口径一致且数据更新（#37 时 env-manager 仅见 10 PR 窗）。
2. **第三槽维持空挂**：经典公开仓 Micro-A 泛化点待托管 API 适配器落地后激活（D-047② / D-034② 新外部面前置）；T3 短名单只进 Macro-B 回归面，**不**自动进 Micro-A 试点（Micro-A 需托管 PR 面，回归目标仓是否有 PR 流程是独立判据）。
3. 同主属确认偏差面沿用 D-033 登记口径如实披露：双仓与产品同主。

## 登记

- 本文档 = preview 前置审计记录（T7 交付面）。registry `micro-a-preview-prep` 事件仍 occurred=false——本记录不翻转事件，只作窗口证据留痕。

