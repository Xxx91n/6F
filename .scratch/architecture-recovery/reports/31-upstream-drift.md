# 31-upstream-drift — CodeLore 上游探针漂移报告（R4-05 / A-036）

> 配套机读产物：`31-probe-measurements.json`（provenance = commit pin + spec sha256 + facts sha256）、`31-upstream-facts.jsonl`（8 条原始上游事实）。

## 1. 运行时解析策略判定（前置派生）

**判定 = 二进制发现（binary discovery）**，容器捆绑本阶段拒绝。理由：
- CodeLore 是单一自包含 Rust 二进制（`codelore.exe`，cargo 安装），无守护进程、无网络面——进程边界即天然防腐层（D-020 判据①）；
- 容器捆绑在探针期零隔离增益却增加分发重量；`codelore mcp`（stdio MCP server）已存在，留作未来宿主通道而非本探针的解析方式；
- 解析实现：`resolveCodelore()` → PATH 解析 + `codelore --version` 解析 + exact pin `0.28.0` 断言（application 侧 pin 共识 per Renovate 先例；FSE 2025 pin 反证限定 npm 库场景，不适用于外部 CLI 探针）。

## 2. 实测锚定（任务 1/3 回流）

| 任务 | 缺口 | 实测锚 |
|---|---|---|
| 任务 1（S1 定位收敛语义度量） | CodeLore explain_file 形态未知 | `codelore explain <file>` 产确定性 fact sheet：`[code-health]` score/band/percentile/cognitive、`[hotspots]` rank/score、`[ownership]` main_author/total_revs、`[functions]` 逐函数 cyclomatic/cognitive/loc——S1 语义度量面存在且可机读（adapter 已解析为 facts） |
| 任务 3（S4 ADR 假设提取 LLM 面） | LLM 承载面未知 | `explain --llm` 存在但受 `CODELORE_LLM_*` 环境门控：无 endpoint 时确定性输出照常 + 尾部显式 error（实测复现 R5-Q3 判定成立）；LLM 叙事面 = 可选 advisory，不接即降级不失败 |

## 3. 漂移面登记（契约测试覆盖 vs 未覆盖）

| 面 | 契约状态 | 备注 |
|---|---|---|
| `explain <file>` dossier 结构（[节]+key=value，含数字前缀键 `1.function`） | ✅ golden fixture ×2（engine/test/fixtures/codelore/） | 非源文件（.md）返回空输出 + 非零退出——adapter 走 explain_error 分支 |
| `analyze --analysis summary --format json` → `[{metric,value}]` | ✅ golden fixture ×1 | 行形状漂移即抛错（G5 断言） |
| `--version` 输出格式 `codelore X.Y.Z` | ✅ fixture + pin | pin=0.28.0；其余 55 个 analysis 子命令未契约化（阶段 3 按需扩） |
| `explain --llm` 叙事面 | ⚠ 未契约 | LLM endpoint 未配置；接时需另立契约（非确定性输出，golden 测试不适用，须换断言面） |
| `codelore mcp` stdio 工具面 | ⚠ 未契约 | 未来分发通道候选；本探针走 CLI |

## 4. P1 预核对：Agent Plugins 1.0.0 plugin schema（顺手做）

原文已读：`https://agent-plugins.org/schemas/1.0.0/plugin.schema.json`（draft 2020-12，`additionalProperties:false`）。**基线发现：本仓 `engine/plugin.json` 不符合 1.0.0 schema**——缺 required `$schema` const 字段；`schemaVersion`/`skills`/`mcp` 非规范属性（additionalProperties:false 违规）；`extensions` 规范要求 reverse-domain 命名空间对象表而当前为字符串数组。处置：登记为缺口修复项（新建票或并入分发收尾票），本探票不擅自修 manifest（契约面变化属独立决策）。

## 5. 首报同仓同 spec 重跑 diff

| 口径 | TC-2 | 说明 |
|---|---|---|
| 冻结集 v1（fc00d458，n=13） | 0.2462 RED | dated measurement，原读数保留 |
| 冻结集 v2（同集单次重跑，n=13） | 0.5846 RED | reportable value（#27） |
| 当前树 v1（n=16，治理后） | 0.8000 RED | v1 仍不识裸 Status 行（4 份 missing） |
| 当前树 v2（n=16，治理后） | **1.0000 not-RED** | #28 治理效果实测量化：五件套全齐 |

治理后同一棵树上 v1 仍 RED 而 v2 通过——v1/v2 并存再次证明「检测器版本是读数的一部分」。

## 6. 边界与诚实性注记

- 适配层零业务规则：emit 的 facts 全是 raw 值（metric/value/dossier 原样），无阈值无判定。
- golden 契约测试局限按调研明列：只证字节形状未漂，不证语义正确；fixture 过期风险 → 复审时点 = 上游版本升级时。
- `analyze` 其余 55 个子命令、`check`/`gate`/`calibrate` 面未契约化——单上游探针纪律，不贪全。
