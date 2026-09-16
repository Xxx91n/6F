# R13-Q3 调研题面 — hooks 层存废：五层盒子第④层的名实裁定

> 轮 13 grill Q3。提交 atomcode 深度调研。

## 本地回顾义务（先读后答）

先阅读本仓库（D:\Aworker\6F）以下材料再作答：

1. `.scratch/macro-audit/decision-ledger.md` — 全部 status 含 current 的记录（现 48 条，本轮新增 D-053/D-054）；
2. `docs/adr/` — 全部 21 件 ADR，重点 0008（Agent Plugin 五层盒子）、0016（分发=纯 Agent Plugins 生态）、0013（三层验收闸门）；
3. `CONTEXT.md` — 词面（Trigger Sequence／Watch Tri-state／Trigger-gated Closure／Agent Plugin 本产品用法）；
4. `engine/extensions/com.macroaudit.hooks/README.md` — hooks 层现存唯一实物（立场文档）；
5. `engine/mcp.json`＋`engine/plugin.json`＋`engine/skills/macro-audit/SKILL.md` — 插件组件实物面；
6. `.github/workflows/macro-b-regression.yml` — 现行触发面（CI schedule+dispatch）；
7. `.code-tmp/research.md` 与 `.code-tmp/memory.md` — 立项期调研档案（重点 §4 实现形态轮：hooks 190 项限制、SoundGate 论文、官方语义划分「guarantees go in hooks」）。

## 待裁定问题

原预设（research.md §7.1）：五层盒子第④层=hooks——复用 jiahao 的 11 宿主 hooks 分发面作审计触发面（SessionStart 注入/Stop 拦截）。

现状：jiahao 已完全解耦为只读审计对象（D-046），hooks 分发面复用前提消失；engine/extensions/com.macroaudit.hooks/ 内只有 README 立场文档（「hooks 仅作触发/呈现面：PostToolUse/Stop 呈现 receipt、注入证据就绪上下文；永不作裁决执行点——裁决一律环境外 CLI/CI」），无任何 hook 配置实物；审计触发实靠 CI schedule（macro-b-regression.yml）＋agent 工作流内 skill 引导。

候选：

- (a) 四层化：ADR-0008 revised（五层→四层），extensions/ 删目录；
- (b) 最小实建呈现面：hooks 层只交付 README 已声明用途——1~2 个宿主 hook 配置（如 Claude Code Stop/PostToolUse→呈现最新 receipt/证据就绪态），触发语义仍归 CI＋skill；
- (c) 实建触发面：多宿主 SessionStart 注入等（重维护＋SoundGate 天花板）；
- (d) 纯勘误：ADR-0008 加一行注记把层④释义收窄为「可选呈现面」，目录留 README 不建实物。

## 调研要求

重点调研工业界成熟落地的心智模型：Agent Plugins 1.0.0 扩展目录（com.* 反向域名）内 hooks 的交付惯例与最小可行形态；「hooks=呈现/提醒面 vs 触发面 vs 门禁面」的职责边界先例；SessionStart/Stop/PostToolUse 各事件在产品化插件中的真实用途分布；hooks 配置随插件分发的宿主兼容现状（哪些宿主支持、写法差异）；「无 hooks 的审计/评审插件」先例是否存在且被接受。

输出：推荐选项＋理由；各候选的已知失败模式；与本仓 current 决策的冲突点排查——若冲突必须点名 D-xxx/ADR-xxxx，不许静默改向。