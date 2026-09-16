# 41: 分发收尾 — 样例落位 / 披露页 / preview 标注 / listing 资产 / 凭据申请

**A-xxx covered:** A-046
**Spec ref:** [spec.md](spec.md) §R5-D10

**What to build:**
五子项：① examples/first-report/ 复制四件（23-first-report.{md,json} + 23-first-report-failure.{md,json}，复制非移动）＋披露 README（6F 自审真实产物声明＋生成 commit＋日期＋重生成命令）；② README/marketplace 首段能力边界＋「capability 1 of 5 · preview」标注＋0.x 语义＋changelog 明示当前覆盖范围；③ listing 资产（未上架层「Not yet in preview」披露块＋roadmap 链接）；④ Agent Plugins preview 字段查证＋竞品占位扫描（前置子任务，atomcode 调研）；⑤ 凭据申请（D-026③ 阶段 3 开工门已触发）。上架动作本身停用户闸门（D-026/D-027）。

**Blocked by:**
#34（plugin.json 合规 = 上架硬前置链第一环）

**Status:** split（2026-09-16）——#41a 仓内文档面 done（A-051）／#41b 上架面 blocked-by 用户闸门不排程（A-052 保 current）

- [ ] ①~⑤ 五子项逐项落位（③④ 为前置子任务先行：preview 字段查证＋竞品扫描 → listing 资产）
- [ ] README/marketplace 引用只指向 examples/first-report/ 公共路径（不链 .scratch）
- [ ] 未上架层仅文字披露＋「Not yet in preview」标注（禁造资产化演示）
- [ ] 守卫 reports/41-*.mjs PASS；报告显式声明「上架动作未执行（用户闸门）」
