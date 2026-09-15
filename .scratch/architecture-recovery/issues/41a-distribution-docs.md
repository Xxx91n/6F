# 41a: 分发收尾·仓内文档面 — 样例落位 / README 边界与 preview 标注 / 仓根编年首条

**A-xxx covered:** A-051
**Spec ref:** [spec.md](spec.md) §R5-D10（原 #41 按 D-040 拆两片：仓内文档面归本票，上架面归 #41b）

**What to build:**
三子项：① examples/first-report/ 复制四件（23-first-report.{md,json} + 23-first-report-failure.{md,json}，复制非移动）＋披露 README（6F 自审真实产物声明＋生成 commit＋日期＋重生成命令）；② README 能力边界＋「capability N of 5 · preview」标注＋0.x 语义＋「Try on a real repository」节（opt-in 公共小仓链接＋「外部内容随上游变化」标注）；③ 仓根 CHANGELOG.md 编年首条落盘（## [M-xxx] - ISO日期 键＋机器可解析固定字段行，ADR/A 区间写时实物读出——ADR-0018/D-039② 格式）。DoD 护栏：能力边界文案以冻结决策为唯一事实源，扩面变更走文案 update 子项。

**Blocked by:**
无（DoR 闭合——原 #41 唯一前置 #34 已 done；就绪即做 filler 不占关键路径，D-040）

**Status:** done（2026-09-16）

- [x] ① examples/first-report/ 四件复制落位（与 .scratch 原件逐字节 sha256 一致，原件留溯源链）＋披露 README 四要素齐（真实产物声明/commit fc00d458/日期 2026-09-13T14:31:09+08:00/重生成命令 23-first-report.mjs）＋冻结时点+failure=degradeReport 性质+preview_disclosure 时点差如实注
- [x] ② README 能力边界矩阵（capability 1 of 5 · preview=Macro-B／capability 2 of 5 · preview=Macro-C／Micro-A·Micro-B·Macro-A=Not yet in preview）＋preview 标注＋0.x 语义＋「Try on a real repository」节（gsd-core opt-in 链接＋「外部内容随上游变化」标注）；引用只指向 examples/first-report/ 公共路径（不链 .scratch）；未上架层仅文字披露；不虚构 audit 子命令
- [x] ③ 仓根 CHANGELOG.md 落盘（## [M-001] - 2026-09-15 键、禁版本号头、五字段行只引用不复制、区间实物读出）＋engine/CHANGELOG.md 反向指针闭环（W4 悬空清零）
- [x] 守卫 reports/41a-check.mjs PASS；报告显式声明「上架动作未执行（用户闸门）」
