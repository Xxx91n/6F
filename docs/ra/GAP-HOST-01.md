# RA 档案 —— GAP-HOST-01（CodeBuddy IDE 形态面未实测缺口）

> 形态：Accepted-Risk 呈批档案（D-169-b② 五要件标准形；D-168② 呈批义务兑现载体）
> 状态：**已批准=关档**（accepted-risk 五要件齐备封闭处置；裁者=用户 2026-09-28 拍板）
> 起草：2026-09-28 轮 44 T1 执行窗（R43 收口节执行窗登记欠账项，三要素：owner=执行批起草＋用户批准／时点锚=本批／复验=批准决定+registry 确认行落册后独立复核）

## 0. 呈批请求（裁者待决）

- 呈批对象：GAP-HOST-01（docs/known-gaps.md 台账行；registry 哨兵 `codebuddy-ide-gap-watch`）
- 请示裁定：
  - **「关档」**：按 accepted-risk 封闭处置——缺口语义转为 RA 终态留档（stage2 判据③ 读数=「accepted-risk 五要件齐备关闭」态如实披露，honest-known-limitation 口径 D-168⑥）；
  - **「续等实证」**：维持 `observed`＋哨兵值守，至 IDE 形态可得按 charter 三判据重跑回填。
- 两选项皆合法终态（D-168②）；裁者具名=**用户**。

## 1. 判据引用

- Stage-2 公开推广判据包 **判据③**（D-162③；registry `stage2-launch-criteria.verify_method`）：「GAP-HOST-01 关闭（IDE 面实证 verified 或按 accepted-risk 五要件齐备关闭）」。
- 缺口条目：docs/known-gaps.md `GAP-HOST-01`（reason_code=`host_surface_unverified`；CLI=verified／IDE=observed-unverified）。
- 证据链：.scratch/macro-audit/trials/codebuddy-r38-report.md（CodeBuddy CLI 2.151.0，C1/C2/C3 三判据 hit；IDE 形态 not-run 如实留痕）。

## 2. justification（不修/不可自力理由）

- IDE 形态关窗盲区我方不可自力——教科书级外部依赖情形：CodeBuddy IDE 形态不在本仓可得环境内，宿主侧安装/试用驱动=用户主权闸门（任务书「宿主侧操作=用户驱动面，agent 不代行宿主内点击」）。
- 同型先例：decryptiondigest 有效 justification 列举「team cannot resolve without a dependency outside their control」（R43-Q3 调研，reports/R43-Q3-atomcode-research.md）。
- 非缺陷声明：CLI 面三判据全 hit；IDE 面缺口=**未实测非已失败**——禁以 CLI 证据外推 IDE（registry verify_method 明文纪律）。

## 3. 可验证补偿控制

- **CLI 三判据 hit verified**：C1 安装链（marketplace add→install→/mcp connected→selftest 5/5）／C2 字段级 parity（语义锚全等）／C3 preview 披露零失守——证据=trials/codebuddy-r38-report.md。
- **双哨兵值守在册**：registry `codebuddy-ide-gap-watch`（IDE 形态可得→charter 三判据重跑，读数标 IDE-specific）＋`codebuddy-f02-display-watch`（宿主展示盲区观察，宿主版本演进即触发）。
- **Stage-2 闸不旁路**：关档后判据③读数如实记「accepted-risk 五要件齐备关闭」而非「IDE verified」——对外口径三绿＋两项显式阻塞/RA 呈报（D-168⑥）。

## 4. 具名裁者

- **批准人=用户**（宿主试用对象=用户主权逐案闸门，D-162⑤ 同族）。
- 起草人=轮 44 T1 执行批 Agent——提交人≠批准人；批评者无审批权（R43-Q3 两级审批先例）。

## 5. 到期日＋到期复审钩

- **到期日：min（下次 CodeBuddy IDE 形态会话发生，2026-12-27)**（≤90d 自 2026-09-28 起算；事件先到先触发）。
- **复审钩**：到期或 IDE 会话发生（早者为准）→按 trials/codebuddy-r38-charter.md 三判据重跑 IDE-specific 读数，回填本档案 §6＋registry 哨兵确认行；**逾期未复审=档案失效**，须按五要件重立项（D-169-b④「到期缺失/已过禁续期」）。
- 复审执行锚：registry `codebuddy-ide-gap-watch`（manual_watch，review_event=next-audit-window；IDE 可得即提前——不等窗）。

## 6. 批准结果登记（裁后回填）

- 决定：**关档**——accepted-risk 五要件齐备封闭处置（用户采纳 atomcode 深调研推荐：五要件与 NIST SP 800-37 R2／ISO 27001/27005／GRC 五字段风险接受记录逐字段对齐；「续等实证」近 risk-deferral 反模式——调研与 current 账本零冲突，无 revised 触发）。
- 裁定时间／裁者签认：2026-09-28／用户（R44-T1 执行窗呈批会话内拍板）。
- 落册闭环（本批兑现）：本档案本节＋registry `codebuddy-ide-gap-watch` confirmations[] 确认行＋known-gaps GAP-HOST-01 status=`accepted-risk`＋账本 R43 收口节执行窗兑现小节＋编年 M-037。
- 复审钩生效：min（下次 CodeBuddy IDE 形态会话，2026-12-27)——到期或事件发生早者为准，经 `codebuddy-ide-gap-watch` 哨兵续任执行；逾期未复审=档案失效须按五要件重立项（D-169-b④）。
