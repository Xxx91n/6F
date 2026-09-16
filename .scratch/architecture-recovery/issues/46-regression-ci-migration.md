# 46: 回归 CI 迁回 6F 自有 CI — 6F macro-b workflow / jiahao 单文件撤除 / 经典仓候选呈报

**A-xxx covered:** A-054
**Spec ref:** BACKLOG.md #46（承接 #39 jiahao 侧回归腿迁移；macro-audit 账本 D-046）

**What to build:**
三子项：① 6F `.github/workflows/macro-b-regression.yml`——resolve job 定目标集（schedule=默认集／workflow_dispatch repo_url opt-in 单仓）→ fromJSON matrix → engine install/gen/build → clone 被测公开仓（URL opt-in 零 token＋intake 隔离三件：hooksPath=noop / protocol.ext.allow=never / 全深度浅拒断言）→ 39-macro-b-one-shot.mjs --repo/--root/--out → 工件断言 → upload-artifact；② jiahao `.github/workflows/macro-b-regression.yml` 单文件撤除（其余零触碰，前后 diff 断言恰 1 文件 D）；③ 经典公开仓候选短名单呈报（语言族×git 健全度×规模，呈用户选定后接入 resolve job DEFAULT JSON）。

**Blocked by:**
无（#39 已 done；公仓 clone 零 token 无凭据前置）

**Status:** done（2026-09-16；轮 10 独立审计返修后收口）

- [x] ① workflow 六要素齐：触发面 cron 17 3 * * 1+dispatch／opt-in 输入+https-only 闸门／intake 隔离三件／链完整／工件断言+upload-artifact if:always()／contents:read 无 token 无跨仓 checkout；诚实语义注释（已上架层限定/job 绿=管线非裁定绿/mw-trigger-a 语义不变）
- [x] ② jiahao 删除提交 2755bf35 恰 1 文件 D（轮 10 勘误：已在 origin/main——jiahao 独立在开发项目，push 面不属本仓管理域）
- [x] ③ 候选短名单 46-classic-repo-candidates.md（首选 git/git・django/django・spring-boot；备选 curl/flask/kafka）——呈报非定案，接入待用户选定
- [x] 守卫 reports/46-check.mjs PASS 30/30 exit 0（轮 10 返修强化：A15 npm ci 惯例／A16 env 间接引用／A17 test -s+RCP 强断言／D1 PASS N/N 同值判／D4 头注 6F 指向）
- [x] 轮 10 返修项全落地：npm ci／matrix→env 间接引用+clone 腿 https 闸门 defense-in-depth／verify test -s+receipt_id RCP-[0-9a-f]{16}／node 24 对齐 golden-ci／one-shot 头注残留改 6F／收口回写族（A-054+BACKLOG✅+lessons+本三件套）
