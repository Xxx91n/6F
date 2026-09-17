# R14-Q1 调研题面 — 锐评九点处置框架（逐点收/拒/缓总表）

> 轮 15 grill Q1。提交 atomcode 深度调研。

## 本地回顾义务（先读后答）

先阅读本仓库（D:\Aworker\6F）以下材料再作答：

1. `.scratch/macro-audit/decision-ledger.md` — 全部 status 含 current 的记录（52 条）；
2. `docs/adr/` — 全部 21 件 ADR，重点 0002（禁 MVP 切片）、0005（HoF-FA）、0013（三层验收）、0014（上游防腐）、0019（SWMR）、0020（托管 API 适配器）；
3. `CONTEXT.md` — 59 词含 Kernel/Agent 职责边界新词；
4. `.code-tmp/锐评.txt` — 被审对象全文（9 解剖点＋总结建议）；
5. 锐评点名的实物文件逐一核验：`engine/src/demo/demo.ts`（%cI 行）、`engine/src/cli.ts`（命令面）、`engine/src/selftest.ts`、`engine/src/fact/schema.ts`（REWRITE_BLACKLIST）、`engine/src/report/citation.ts`、`engine/src/report/narrative.ts`（BAND_PATTERNS）、`engine/src/mcp-server.ts`（db 必填）、`engine/src/intake/intake.ts`（缓存命中不 fetch）、`engine/src/upstream/codelore.ts`+`github-rest.ts`（孤岛核查=全局 import 搜索）、`.github/workflows/golden-ci.yml`（bundle 腿）。

## 待裁定问题

锐评九点（详见 .code-tmp/锐评.txt 原文）：

1. `git log --format=%cI` 时区格式跨 Git 版本漂移（<2.45 `+00:00` vs ≥2.45 `Z`）击穿逐字节确定性链（traceId→fact_id→receipt→report）；
2. CLI 无 `audit` 一等命令（只有 --version/selftest/mcp/repo add/demo），真实仓审计管线在 .scratch 脚本不在 engine；
3. `selftest` 仅静态校验 manifest.meta.json 五个字段，无运行时探测；
4. append-only 守卫=SQL 字符串 `includes` 黑名单，合法只读/INSERT 字面量含 UPDATE/DELETE 即误伤；
5. citation 核验=indexOf token 在场检查，`contradicts` 枚举无任何返回分支（死枚举），BAND_PATTERNS 裸词屏蔽；
6. MCP `facts` 工具必填 `db` 绝对路径入参，宿主 agent 无法预知；
7. intake 缓存命中直接返回不 fetch——远端新 commit 永不可见；`.git` 尾缀差异致 sha 键不同；
8. codelore.ts(567 行)+github-rest.ts(689 行) 无生产消费面（仅测试引用），管线本体在 .scratch 脚本；
9. golden-ci 用 git bundle 物化未提交快照 fc00d458＋等签名重构 overlay；仓内提交多份 2MB+ duckdb 二进制。

处置框架候选（逐点独立裁定）：收（成立案/勘误票）／部分收（子项分流）／缓（挂值守）／拒（写拒收理由）。

## 调研要求

重点调研工业界成熟落地的心智模型，逐点对照：
- git `%cI` 格式变更史（2.45 strict ISO Z）与确定性构建界的处置惯例（SOURCE_DATE_EPOCH/时区归一化/版本 pin）；
- 「walking skeleton 有骨架无大门」的 staged-delivery 先例（何时补一等命令是正确时机）；
- CLI selftest/doctor 的工业形态（git doctor/gh doctor/brew doctor 测什么）；
- SQL 注入面治理中「字符串黑名单」vs「解析级判定」的成熟判据；
- RAG/审计 citation 核验的工业精度分级（presence-check → NLI/entailment → human-in-loop）与本仓设计界对齐度；
- MCP 工具入参设计惯例（路径参数 vs 服务端配置寻址）；
- 只读缓存「永不过期」在审计/取证语境的合法性判据（immutable snapshot vs staleness）；
- golden/fixture 确定性构建界对「二进制进仓」「frozen bundle 复现」的评价惯例（bazel/nix 界对照）。

输出：九点逐点裁定＋理由；各处置的已知失败模式；与本仓 current 决策冲突点排查——若冲突必须点名 D-xxx/ADR-xxxx，不许静默改向。