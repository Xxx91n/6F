# R38-Q2 调研题面（atomcode）

仓库 D:\Aworker\6F=工程内容审计产品 6F（Agent Plugin 五层盒，内核 macro-audit CLI 确定性——audit 产物字节级宿主无关）。R38-Q1 已裁（D-150）：CodeBuddy 试用三裁落定——宿主面=插件全路径主验收线（`/plugin marketplace add Xxx91n/6F`→`/plugin install 6f@xxx91n`→`/mcp` connected→selftest 5/5）＋CLI 裸跑对照基线；目标仓=本仓自审安装链＋env-manager 效果判据；验收判据三段=安装链零文档外干预步／env-manager Macro-B 报告字段级 parity／preview 诚实披露不失守；兼容性面=预设证伪实证收口（官方兼容 `${CLAUDE_PLUGIN_ROOT}`/`.claude-plugin/` 双源实证，三悬点列首轮实测清单）；排序=试用先行，反馈走 D-146 四档回流。

本轮下探=试用执行协议三裁面。新事实修正：①kernel 确定性→CLI 裸跑产物与宿主无关恒同构，「跨宿主 parity」的真问题不是引擎字节一致而是宿主驱动路径（agent 在 skills 壳＋MCP 读面引导下产出合骨架契约报告的能力）；②marketplace 安装面=git clone origin/main（r37 态）——安装树 vs 开发仓 HEAD 存在版本差轴；r36 有 env-manager 历史读数在盘（audits/r36/env-manager-facts.duckdb）；③CodeBuddy 插件安装落点=其插件缓存目录，所装 dist/cli.js 可被本机 node 直接驱动（不需 Claude Code）。

## 问题（三面合裁）

面A parity 基线协议。候选：(i) 同 SHA 双跑——Claude 侧/本机先补跑当前 HEAD 作基线，CodeBuddy 侧同码跑（成本=一次补跑；开发仓 HEAD vs 安装树 SHA 差未消）；(ii) 版本差声明——CodeBuddy-当前 vs r36-旧读数对照＋引擎版本差如实声明（Dual Reporting 惯例），parity 降为骨架结构＋关键字段族级；(iii) 单跑软对照——CodeBuddy 侧单跑，r36 读数仅参照不裁决；(iv) 安装树自对照（新增）——基线=所装插件 `dist/cli.js` 本机直跑（同比特、异驱动：CLI 直跑 vs CodeBuddy agent 驱动），版本混因构造性归零、不需 Claude Code 环境，r36 旧读数降为参照轶事。

面B 试用封口判据——提议：三判据全跑完且 findings 全过 D-146 分诊即关窗；关窗≠缺陷清零（未过项自动转 finding 票面进裁定链或挂批2）。评估判据预声明 vs 事后判定的纪律面（Kill Criterion 预声明先例）、试用关窗与 Trigger-gated Closure 的同构性、以及「试用失败≠产品失败」的语义护栏形态。

面C 产物归位——候选：(α) 新目录 `.scratch/macro-audit/trials/`（与 audits/〔审计窗产物〕、reports/〔调研+收口报告〕分家）；(β) 复用 audits/；(γ) 复用 reports/。评估工件分类惯例（runbook/实测记录/试用报告分型）与目录语义纯度纪律。

## 调研要求

1. 回顾 D:\Aworker\6F\.scratch\macro-audit\decision-ledger.md 全部 current 记录（重点：D-150 试用三裁〔本条刚立——面A(iv) 是「CLI 裸跑对照基线」的收窄细化须核是否同向〕、D-146 摄入四档、D-148 处置三态/grandfather、D-149 升格条款、D-139 提交纪律、D-070 随触碰顺带、D-033⑤/D-047 env-manager 试点备案、D-013 本仓自审、D-053 叙事双轨、D-075 分层自愈、以及账本中 Kill Criterion/Positive Control/封口判据/产物归位相关全部条款）；
2. 回顾 docs/adr/（0006 共享骨架、0007 演示路径、0013 三层验收、0015 序列化校准量测效度先行、0017 preview 分级）与 CONTEXT.md（Demonstration Scenario、Pilot-surface Audit、Kill Criterion、Positive Control、Self-probe、Dual Reporting、Assignable Cause、Trigger-gated Closure）；
3. 工业界成熟落地的心智模型（重点）：差分测试/特性化测试基线选择（differential testing、golden-master、characterization testing 中控制版本混因 version confound 的实验设计惯例——single-variable/single-confound 原则在软件验收的映射）；探索式测试 SBTM charter（session-based test management——runbook/实测清单的成熟形态与记录票面）；pilot/field-trial 的 exit criteria vs success criteria 分家惯例（关窗判据与成功判据不同轴）；parity 报告形态（字段级 diff vs 结构级 diff vs 叙事级 diff 分层惯例）；bug bash/findings 回流票面形态（Mozilla bugday/Google bugbash/triage 惯例——发现物进分诊轨的票面最小要素）；
4. 给出推荐与理由，显式指出与账本任一 current 决策的冲突点（冲突则该 D-xxx 需标 revised 呈报新决策，禁静默改向）。特别核查：面A(iv) 相对 D-150 ② 「CLI 裸跑对照基线」是同向细化还是改向；试用产物归 trials/ 是否触既有目录纪律条款。
