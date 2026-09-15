# round6-report — 轮 6（R4 测量效度先行轮）收口报告

## §1 轮目标与产出对照

任务书 = `.scratch/macro-audit/handoffs/next-round.md`；主干纪律 = ADR-0012 四阶段串行 + D-025 量测效度先行 + D-023 阶段2二分（2a desk / 2b 上游探针）。

| 波次 | 票 | 交付 | 守卫 |
|---|---|---|---|
| T0 | 立票 | spec §R4 + ledger A-031~A-036 + issues/handoffs/prompts ×6 + README W7-W11 | commit txv |
| W7 | #26 R4-01 量测审计 | 14 份 ADR 真值表 + 65 格 delta + AC-26-1~5 归属；golden set 落盘 | 26-check.mjs PASS 18/18（commit kpz） |
| W8 | #27 R4-02 判据 v2 | adr-structure@v2（腿序 dash→inline→inline-iso→git + 节裸标签）；预注册 pov 先入库；冻结集单次重跑 65/65 ALL-AGREE；v2=0.5846 RED 与 v1=0.2462 RED 勘误式并列 | 27-check.mjs PASS 15/15（pov+uvr+orr） |
| W8∥ | #28 R4-03 ADR 治理卫生 | real-gap 33 格清零（Date×6 + 三节标签×9 verbatim 重分布）+ 0014 post-freeze 四节；勘误式批注统一 | 28-check.mjs PASS 113/113（vkn；subagent 执行，verbatim 句逐字断言） |
| W9 | #29 C 层 disposition | CAPA reopen 补记：原裁定逐字保留 + 成对动作（v1 归因部分 invalid / v2=reportable value） | 29-check.mjs PASS 13/13（nqq） |
| W10 | #30 R4-04 阶段2a | 13 项冻结校准（11 desk 草案 + 任务5 锚行 + 任务7 单写者域草案）；置信域逐项；占位两字段×10 | 30-check.mjs PASS 9/9（nvm） |
| W11 | #31 R4-05 阶段2b | CodeLore 探针：binary-discovery + pin 0.28.0 + golden 契约 7/7；漂移报告 + 任务1/3 实测锚 + P1 预核对发现 plugin.json 不合 1.0.0 | 31-check.mjs PASS 14/14（oyp） |

## §2 验收标准逐字回执

> 「编译通过、打包通过、启动并测活软件进程；每个平台都要有 test 闭环，避免只引入却没做到。」

- **编译**：`npm run build`（tsc -p tsconfig.json）0 错（#27/#31 两轮实跑）
- **打包**：`npm run package` → `macro-audit-0.1.0.tgz`（31 文件，#31 轮实测）
- **启动并测活**：`node dist/cli.js selftest` → `{"ok":true,...}` 5/5 检查（manifest/4壳/默认模式唯一/MCP只读/Receipt≥4字段）
- **test 闭环**：`npm test` = gen + build + smoke(6/6) + collectors(13/13) + codelore-adapter(7/7) = 26 断言；CI 矩阵 3 OS × Node 20/22 跑同一 `npm run smoke` 链（engine-ci.yml 未改）。**明示：本轮 engine 改动未经 CI 远端实跑**——workflow 仅 paths engine/** 触发且栈未 push（push 属用户闸门），本机亲跑等同链路替代；纯文档票（#26/#29/#30）以守卫脚本闭环验收

## §3 关键数值（R4 测量效度链）

- TC-2 三读数并存：v1=0.2462 RED（dated，保留不撤）→ 真值=0.4923 → v2=0.5846 RED（reportable value）；治理后当前树 v2=1.0 not-RED（n=16）
- 65 格 golden set 对照：v2 逐格一致率 65/65 ALL-AGREE
- 归属分解：冻结 65 格 = consistent 16 + detector-miss 16（form 11 + inline 5）+ real-gap 33；post-freeze = 5 格（0014，不入冻结对照）。**勘误（2026-09-15 返修）：本行曾把 post-freeze 误写为 16——16 实为 consistent 格数，post-freeze 实为 5**
- CodeLore 探针：resolve pinned=0.28.0、上游 facts 8 条、explain/summary 契约面×3、LLM 面 CODELORE_LLM_* 门控实测复现

## §4 新登记缺口（诚实清单）

- **plugin.json 不合 Agent Plugins 1.0.0**（P1 预核对发现）：缺 `$schema` const、`schemaVersion`/`skills`/`mcp` 非规范属性、`extensions` 形态错（数组 vs reverse-domain 对象表）。处置 = 独立修复票（并入分发收尾），本票未擅改 manifest。
- CodeLore 其余 55 个 analysis + check/gate/calibrate/mcp 面未契约化——阶段 3 按需扩。
- 任务 7 多写者域仍挂 self-probe（复审时点 = 阶段 3 多采集器后）。

## §5 版本控制状态

- 栈 A（R4 票链）：`8be9db5` ← r6-ticket-scaffold(txv) ← 26-adr-measurement-audit(kpz) ← 27-criteria-v2-fallback-chain(pov,uvr,orr) ← 28-adr-hygiene-sweep(vkn) ← 29-c-disposition-reopen(nqq) ← 30-frozen-calibration-desk(nvm) ← 31-codelore-probe(oyp)
- 栈 B（收口链）：`8be9db5` ← grill-r5-cleanup(sxm) ← round6-closeout(qvk) ← 返修栈顶（本段所在 commit）——25-rollout-checklist.md 的拍板状态列内容源于 sxm，故收口提交依赖栈 B
- 未 push；无 PR 创建（发布属用户闸门）。

## §6 T7 值守核对

- #25 拍板状态列：25 行全有状态值（B4.1 规范化为「关闭（D-015 supersede 吸收，非事项）」）。**勘误（2026-09-15 返修）：「14 行挂门未触发」失实**——绑「2b 结题 / 阶段2双结题」的 5 行（B1.2 启动器措辞 / B4.2 三仓对接 / D2 演示口径 / P6 最小上架形态 / D1 样例报告资产）触发事件本轮已发生，已按 D-026 升级：状态列改「触发已发生 → 待用户拍板（1 工作日 SLA）」并向用户呈报（见 §7）
- 账本 A-031~A-036 全 done；A-001~A-036 无悬空 current。

## §7 待用户拍板清单（T7 值守升级，D-026 SLA：触发后 1 工作日内）

| 行 | 事项 | 触发 | 待拍问题 |
|---|---|---|---|
| B1.2 | 启动器收尾黑体强提示措辞 | 2b 结题 | 强提示措辞与位置确认（本轮未改启动器行为） |
| B4.2 | 与 jiahao / anysearch-cli / env-manager 对接 | 2b 结题 | 产品方向与对接优先级 |
| D2 | 上架期演示口径（10 路径已交 2/10） | 2b 结题 | 仅 2/10 上架 or 排期补齐 |
| P6 | 最小可发布形态（单 scale 即上架？） | 阶段 2 双结题 | set-based 候选收窄拍板 |
| D1 | 样例报告列发布资产 | 阶段 2 双结题 | 确认 23-first-report 双件列为发布样例 |
