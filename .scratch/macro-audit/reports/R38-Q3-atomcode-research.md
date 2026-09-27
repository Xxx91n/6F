# R38-Q3 调研报告：完备性核查——裁定面是否穷尽/定稿是否早产

（atomcode 调研存档；resume handle `925ced9d-1c62-4421-b074-91e3d63ab3af`；题面=R38-Q3-research-prompt.md 同目录）

## 1) 执行摘要（Tl;dr）

D-150/D-151 维持定稿不早产。11 件候选残面逐件判定：**准残面仅 1 件（③ env-manager fallback 预声明义务）**；执行参数 7 件（①②⑥⑦⑧⑨＋dude）；伪面 3 件（④⑤⑩⑪ 中 ⑤ 为反向违规——禁止注册关窗事件）；题面外新补 3 件 charter 落盘参数（R-a 时长盒数值/R-b 文档基线 SHA/R-c 执行会话主体）。置信高（pilot go/no-go 清单 WIC/OpsLevel/Kissflow 全文级＋SBTM charter 完备性惯例＋账本逐字核查）。

## 2) 分点结论（逐件判定）

### ① D-059③ 触发后果（文档升级内容）＝执行参数（机械执行）——内容已被预先裁定
D-059③ 原文：「selftest→doctor 升级挂触发器『首个外部用户安装链路出现』」。兑现链已封闭：`runtime-doctor-trigger` triggered-bound→decided（2026-09-18，#62 doctor 探测票消费收官，r21 审计亲验 registry 实物）。触发后果动作已在触发器登记时预声明（Trigger-gated Closure 词条：激活动作是登记语义的一部分）。D-150④ 承接的注记义务①②内容亦已逐字写明。文档升级=预声明动作的机械执行；若执行中发现升级内容超出已预声明范围，走常规 finding 路径（D-146 摄入），非现在裁面。

### ② IDE 版 vs CLI 版安装路径差异＝执行参数（charter 环境快照字段）
官方文档未分列 IDE/CLI 安装约定差异（信息缺口登记），无法提前证实/证伪——归入三悬点实测。charter 环境快照加宿主形态字段（CodeBuddy IDE vs CLI、版本、安装路径实测值）即可，非裁面。

### ③ env-manager 可得性钉定与 fallback＝唯一准残面——须 charter 预声明，禁临场裁
D-150② 裁了「目标仓=env-manager 效果判据」但未钉本机路径、未裁 fallback。关键约束：D-150② 明文「禁新开外部仓（泛化=Macro-B GA 前置 D-033⑤）」——若试用时 env-manager 本机不可得而临场换备用仓，直接撞负向条款。pilot go/no-go 惯例（WIC 官方清单、opslevel readiness review）一致要求：环境/依赖可得性在 checklist 里是 MUST 项，不可得时读 as N/A 并记录，不许临场替换范围。推荐预声明（写入 charter）：「试用前实测 env-manager 本机路径可得性并钉 SHA；不可得→判据二段读数=not-run（如实记录不可得原因），exit 过程完备性不受影响（success 独立取值），不换仓不临场扩射程」——恰是 D-151② exit/success 分轴的设计用途。裁面属性=否，预声明义务=是：不写进 charter 就是把裁定推迟到试用中途（临场裁），违预声明纪律。

### ④ duckdb 绑定获取流＝伪面（已被 D-075 完全覆盖）
D-075 已钉自愈分层（MCP 面永不自动拉包＋doctor --fix 唯一主路＋opt-in env 出口），`duckdb-selfheal-offline.test` 13/13 实测在盘。且本机 doctor 实跑 duckdb leg=ok（原生绑定在位）——试用机=本机，获取流不会被触发。runbook 写入四段披露指向即可。

### ⑤ 试用关窗注册为 registry 事件＝伪面且反向违规——禁止注册
D-151② 负向逐字：「关窗=判据驱动禁写触发器形态（Trigger-gated 等事件来、判据封口等活动做完——同族不同轴）」。把「试用关窗」注册为 registry 事件条目=把判据封口活动写成事件等待形态，正面撞该负向。注记②「实证待真机收口」的升级走既有惯例：试用关窗后按 D-146⑤ 勘误式登记（注记更新=勘误行，去向表照登）。合法接力口（D-151② 已预裁）：「关窗后基础设施类遗留项再按 Trigger-gated 挂 registry 触发器接力」——若三悬点关窗时仍有未实测残项，挂 manual_watch 五要素触发器。结论：关窗本身≠事件；关窗后残项→触发器，才是正确接法。

### ⑥ 批2 与试用「先行」语义＝执行参数（排程语义），并行可辩但须挂 scoped 注记防歧义
D-150⑤「试用先行」的字面与「排程优先」读法兼容——不挡无关工作并行，但批2 处置须等试用 findings 回流做优先级重排（反馈门控只作用于批2 排序不作用于批2 存在）。建议 D-150⑤ 行挂 scoped 注记「先行=排程优先，批2 无依赖项可并行准备但处置顺序服从 findings 回流」——同向细化非 revised，消除歧义防后续被读成硬串行。

### ⑦ worktree 中间态入 charter 环境快照＝执行参数（一行快照字段＋一条豁免）
事实核查：80 件 MM/D 中间态下「审计读 git objects 不受污染」假设**部分不成立**——intake/audit 读的是 worktree 文件面而非 git objects（D-059⑦ intake 不 fetch、直接读盘），worktree 文件≠HEAD SHA 钉的面。但结构上已被 D-151① 消解：(iv) 安装树自对照的基线=CodeBuddy 安装树（marketplace git clone=clean clone 天然免 worktree 污染），本仓自审走安装链也读安装树。推荐：charter 环境快照字段加 `git status 计数＋worktree dirty 标记`（如实登记），并预声明「审计读数以安装树为准，开发 worktree 中间态不入判据只作环境披露」——不声明则试用中途质疑读数源时又是一场临场裁。

### ⑧ agent 驱动的执行路径（CLI vs MCP）＝执行参数（runbook 推荐序列），最小路径已裁
D-150② 已裁「纯 MCP 挂载剔除」——最小路径=skills 壳引导＋MCP 读面取数（D-053 叙事双轨同构：agent 叙事面经 MCP 读 facts，kernel 确定性面走 CLI）。agent 会话内具体点哪些命令=宿主面内自由执行（SBTM 惯例同构：「charter is directive without being prescriptive」，测试步骤不进 charter）。runbook 写推荐命令序列即可。

### ⑨ findings 分诊执行者与时点＝执行参数（D-151② 已隐含裁定，charter 措辞显式化）
时点已被 D-151② 关窗判据锁死：「findings 全过 D-146 分诊」是 exit 组成部分→分诊必须在关窗前完成，不存在「回流后再分诊」选项。执行者分工：票面五要素含「预填 D-146 四档去向建议」——预填=建议权（试用会话），裁定权=用户。唯一建议显式化：charter 把「全过分诊」读作「全过摄入分诊（四档初分）」非「全案终裁」——量大时不阻塞关窗，裁定链部分走后续轮次。

### ⑩ 会话面 preview 披露＝伪面（是判据三的实测对象，不是新立法对象）
D-150 验收判据三段第三段已裁「preview 诚实披露不失守（ADR-0017）」——检验面自然包含 CodeBuddy 会话内 agent 话术呈现（宿主面内 agent 若自称 GA/无 preview 标注=判据三失守→立 finding 走 D-146）。会话面行为=被测对象非立法对象；补「宿主面披露行」=给判据三加一张实施细则=charter 判据段把「会话内呈现」列入观测点即可，非新裁。

### ⑪ 试用是否需要 BACKLOG 票载体＝伪面
BACKLOG 惯例=「整轮收口遗留事项」（票面实读：B1 流程规范/B4 上下游对接等均为遗留待办分类）。试用本体是 D-150/D-151 已裁定的执行活动，载体=trials/ 三件套（D-151② 已裁）——非遗留事项不入 BACKLOG。试用产出的裁定需求（findings 进裁定链者、修复票如 plugin.json `mcpServers` 票）沿既有惯例立票编号。

### 题面未列残面（如实补充，均为 charter 落盘参数级）
- **R-a 时长盒数值未定**：D-151② 三件套含「时长盒」字段但值未钉（SBTM 惯例 60–120 分钟/会话）——charter 落盘时定。
- **R-b 「文档」基线未钉**：判据一段「安装链零文档外干预步」——「文档」所指（README？marketplace 页？）及其快照 SHA 未钉（D-142 精神：钉快照）。charter 钉文档基线 SHA。
- **R-c 执行会话主体未钉**：试用由哪个会话/agent 执行（CodeBuddy 侧 agent＋本侧记录者）——charter 落盘时写明。

## 3) 对比矩阵

| 项 | 判定 | 处置落点 | 账本关系 |
|---|---|---|---|
| ① 触发后果 | 执行参数 | 机械执行，超出预声明范围才走 finding | D-059③ 已封闭兑现，无接触 |
| ② IDE/CLI 差异 | 执行参数 | charter 环境快照加宿主形态字段 | D-150②/D-151② 覆盖 |
| ③ env-manager fallback | **准残面** | **charter 预声明**「不可得→not-run 不换仓」 | 防 D-150② 负向被临场撞 |
| ④ duckdb 获取流 | 伪面 | runbook 四段披露 | D-075 全裁＋本机 leg=ok |
| ⑤ 关窗注册事件 | 伪面（反向违规） | **禁止**；残项关窗后挂 manual_watch | **撞 D-151② 禁写触发器形态** |
| ⑥ 先行语义 | 执行参数 | D-150⑤ scoped 注记「排程优先非反馈门控」 | 同向细化非 revised |
| ⑦ worktree 中间态 | 执行参数 | 快照字段＋「读数以安装树为准」预声明 | D-151① 结构性消解 |
| ⑧ CLI/MCP 路径 | 执行参数 | runbook 推荐序列 | D-150②/ADR-0008/D-053 已裁 |
| ⑨ 分诊时点/执行者 | 执行参数 | charter 显式化「摄入分诊≠终裁」 | D-151② exit 判据已锁时点 |
| ⑩ 会话面披露 | 伪面 | 判据三实测读数，失守才立 finding | ADR-0017/D-150 判据三覆盖 |
| ⑪ BACKLOG 票 | 伪面 | 试用非遗留事项，载体=trials/ | D-151② 已裁三件套 |

## 4) 与账本 current 决策冲突总表

| 冲突面 | 结论 |
|---|---|
| ⑤ 注册试用关窗事件 vs D-151②「禁写触发器形态」 | **若采纳注册即违 current 负向**——本报告推荐不注册；若用户坚持注册须走 revised 显式呈报，禁静默改向 |
| ⑥ 并行读法 vs D-150⑤「试用先行」 | 非冲突——「先行」的排程读法与字面兼容；建议 scoped 注记消除歧义，不构成 revised |
| ③ not-run 规则 vs D-150② 三判据 | 非冲突——exit/success 分轴（D-151②）正是为「判据不可跑」设计的；success 独立取值 |
| ⑩ 不补披露条款 vs D-150④ 负向「禁对外呈报虚报」 | 非冲突——D-150④ 管呈报面，会话内行为由判据三实测覆盖，分层不重叠 |
| 其余 ①②④⑦⑧⑨⑪ | 逐件核查零接触 |

## 5) 完备性核查方法论注记

pilot readiness/go-no-go 清单（WIC 官方、OpsLevel readiness review、Kissflow pilot checklist）的成熟类目：范围与判据预声明／环境与依赖可得性（MUST 项，不可得记 N/A 禁临场替换）／角色分工／时长盒／风险与回退／产出与去向。对照本试用：三判据=范围与判据（D-150② 已裁）；env-manager 可得性=依赖面（③ 准残面）；charter 三件套=产出与去向（D-151②）；角色分工=R-c 参数；时长盒=R-a 参数；回退=D-075 路径已钉。**清单级完备性核查法本身**=「类目过筛＋逐件判定裁面属性（裁面/参数/伪面）」，本报告即按此执行。

## 6) 完整来源清单（要点）

WIC go/no-go checklist（官方）、OpsLevel readiness review、Kissflow pilot checklist（全文级）；MoT SBTM 词条「charter is directive without being prescriptive」；承 R38-Q2 报告 §4 九源；本仓账本/ADR/CONTEXT 逐项核查（最高层级）。

## 7) 信息缺口

1. pilot exit-criteria 软件域文献仍缺（承 R38-Q2 缺口 3）——面B 外推置信维持「同构迁移」标注不变。
2. CodeBuddy IDE vs CLI 安装约定差异官方文档未分列——归入三悬点实测，本轮不预设结果。
3. WIC/OCM 两清单仅摘要级——类目过筛权威度降半档，Kissflow/OpsLevel 全文双源兜底不影响判定。

**收口建议一句话**：D-150/D-151 维持定稿不早产；采纳本报告时在收口 commit 落三件轻量动作——charter 预声明③⑥（fallback 规则＋先行=排程优先注记）＋charter 参数补齐 R-a/R-b/R-c；⑤ 明确不注册事件（若用户想注册须显式 revised 呈报）。
