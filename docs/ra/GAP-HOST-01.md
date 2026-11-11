# 风险档案：GAP-HOST-01（CodeBuddy IDE 界面没实测）

> 形式：已接受风险档案（D-169-b② 要求写齐的五个栏目；D-168② 里要交用户批的那份文件）
> 状态：**已批准=结案**（五个栏目写齐，用户 2026-09-28 批准）
> 起草：2026-09-28 轮 44 T1 执行批（R43 收尾时记下的欠账：起草=执行批＋用户批准／时点=本批／复核=批准决定和 registry 确认行记入登记册后独立检查）

## 0. 请用户定的事

- 对象：GAP-HOST-01（docs/known-gaps.md 的登记行；registry 标记 `codebuddy-ide-gap-watch`）
- 两个选项：
  - **「结案」**：按已接受风险关掉——缺口变成风险档案的最终状态（stage2 判据③ 的读数写「五个栏目写齐后关闭」，照实说明，按 D-168⑥ 的诚实说明规则）；
  - **「继续等实测」**：保持 `observed`＋标记定期检查，等 IDE 界面能跑时按 charter 三条判据重跑并回填。
- 两个都是合法结束状态（D-168②）；批准人那一栏要写名字，写的是**用户**。

## 1. 依据

- Stage-2 公开推广判据包 **判据③**（D-162③；registry `stage2-launch-criteria.verify_method`）：GAP-HOST-01 得关闭——要么 IDE 界面实测 verified，要么按已接受风险关掉（本档案走的是后一条：五个栏目写齐）。registry 那一行原话是「D-148 三要素齐备 accepted-risk」，本档案按后来 D-169-b② 的口径把栏目数写成五个。
- 缺口条目：docs/known-gaps.md `GAP-HOST-01`（reason_code=`host_surface_unverified`；CLI=verified／IDE=observed-unverified）。
- 证据：（证据档已随治理工件退役，git 历史可查原路径 .scratch/macro-audit/trials/codebuddy-r38-report.md）（CodeBuddy CLI 2.151.0，C1/C2/C3 三条判据命中；IDE 界面没跑，照实记下）。

## 2. 为什么不修

- IDE 界面我们碰不到——CodeBuddy IDE 不在本仓能拿到的环境里，安装和试用要用户自己动手（任务书写明：宿主侧操作由用户做，agent 不代替用户点）。
- 同类先例：decryptiondigest 的有效理由里有一条「团队离开外部依赖就解决不了」（R43-Q3 调研，reports/R43-Q3-atomcode-research.md，证据档已随治理工件退役，git 历史可查原路径 .scratch/macro-audit/reports/R43-Q3-atomcode-research.md）。
- 不是缺陷：CLI 界面三条判据全中；IDE 界面缺口=**没实测，不是已经失败**——不许拿 CLI 证据往外推 IDE（registry verify_method 写明了这条）。

## 3. 能检查的替代办法

- **CLI 三条判据 verified**：C1 安装链（marketplace add→install→/mcp connected→selftest 5/5）／C2 字段级 parity（语义锚全等）／C3 preview 说明零失守——证据=trials/codebuddy-r38-report.md（证据档已随治理工件退役，git 历史可查原路径 .scratch/macro-audit/trials/codebuddy-r38-report.md）。
- **两个 registry 标记在册**：`codebuddy-ide-gap-watch`（IDE 界面能跑→按 charter 三条判据重跑，读数标 IDE-specific）＋`codebuddy-f02-display-watch`（宿主展示盲区观察，宿主版本一变就触发）。
- **Stage-2 关卡不绕**：结案后判据③读数照实写「已接受风险、五个栏目写齐后关闭」，不写「IDE verified」——对外说法是三项绿＋两项明确阻塞/风险档案（D-168⑥）。

## 4. 谁批的

- **批准人=用户**（宿主试用对象由用户逐案定，D-162⑤ 同族）。
- 起草人=轮 44 T1 执行批 Agent——提交人≠批准人；评审人没有审批权（R43-Q3 两级审批先例）。

## 5. 到期日和复查钩

- **到期日：min（下次 CodeBuddy IDE 界面会话发生，2026-12-27)**（从 2026-09-28 起算 ≤90 天；事件先到就先触发）。
- **复查钩**：到期或 IDE 会话发生（谁先到算谁）→按 trials/codebuddy-r38-charter.md（证据档已随治理工件退役，git 历史可查原路径 .scratch/macro-audit/trials/codebuddy-r38-charter.md）三条判据重跑 IDE-specific 读数，回填本档案 §6＋registry 标记确认行；**逾期没复查=档案失效**，要按五个栏目重新立项（D-169-b④「到期缺失/已过禁续期」）。
- 复查执行锚：registry `codebuddy-ide-gap-watch`（manual_watch，review_event=next-audit-window；IDE 能跑就提前，不等窗口）。

## 6. 批准结果

- 决定：**结案**——已接受风险的五个栏目写齐，关掉（用户采纳 atomcode 深调研建议：这套栏目和 NIST SP 800-37 R2／ISO 27001/27005／GRC 五字段风险接受记录逐项对齐；「继续等实测」接近 risk-deferral 反模式——调研和 current 记录零冲突，没有 revised 触发）。
- 时间／批准人签认：2026-09-28／用户（R44-T1 执行批交用户批的那次会话里定下）。
- 记入登记册（本批落实）：本档案本节＋registry `codebuddy-ide-gap-watch` confirmations[] 确认行＋known-gaps GAP-HOST-01 status=`accepted-risk`＋记录 R43 收尾执行批落实小节＋编年 M-037。
- 复查钩生效：min（下次 CodeBuddy IDE 界面会话，2026-12-27)——到期或事件发生谁先到算谁，经 `codebuddy-ide-gap-watch` 标记继续执行；逾期没复查=档案失效，要按五个栏目重新立项（D-169-b④）。
