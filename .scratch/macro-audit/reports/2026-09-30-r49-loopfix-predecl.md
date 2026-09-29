# 轮49 审计 LOOP 修复预声明包（D-177 工序——先于一切被声明变更 commit 落盘）

日期：2026-09-30　分支：r49-loopfix（stacked on r49-audit）　动因：轮49 审计呈报 F3/F4/F5（守卫面修缮类 finding）——职责分离下审计窗呈报、用户批准 LOOP 修复权下放审计侧（本轮会话用户指令「小问题直接LOOP修复」）

## 包C（探测面变更——46-check.mjs A18）

- **变更面**：A18 块内（46-check.mjs）两处——① NONPLAIN_START 指示符集补 charCode 35（#）——YAML 注释起始符于值位置即整行注释（值实为 null 非病态标量），修前误报 SICK；② 块标量区段追踪：键行值以 | (124) 或 > (62) 起始即登记 blockIndent，体内更深缩进行/空行不涉键行判定，回缩出区——修前 run: | 体内 FOO: a: b 形行误报 SICK。
- **断言语义层级不变**：仍是「未引号 plain 标量含 ': '」parse 档病态闸，A18 名称/位置/绿判据不动；不升格 yaml 包（零依赖手写闸维持）。
- **构造输入（红态诱导——实跑读数填 LOOP 报告）**：
  - C1 `- name: # comment: x` → 修前 SICK／修后不命中（# 指示符早退）
  - C2 `run: |` 体内 `FOO: a: b`（更深缩进）→ 修前 SICK／修后 clean；回缩出区后病态行仍拦
  - C3 `- name: a: b`（真病态）→ 修前修后均 SICK（拦截力不衰）
  - C4 回归面：`- name: "a: b"`／`- uses: x`／`run: |` 起始行／`key:` 空值行 → 均不命中
  - C5 实物面：修复前 macro-b-regression.yml（git show 0401d487^）仍恰 L144 一命中（谓词历史检出力维持）
- **绿判据**：46-check PASS 31/31（files=3 零命中维持）＋75a-check 16/16 注册零悬空＋guard-all-run 61/61 全绿

## 包D（探测面变更——d179-check.mjs A5＋随行源码整理）

- **变更面**：① d179-check.mjs A5 熵源钉改调 _lib/check-kit.mjs stripComments（成文共用剥面——行注/块注/字符串内 // 全规），替换手搓 l.replace(/\/\/.*$/)（漏块注、字符串内 // 截断可致 false-green）；② snapDir 复用 shaFile（复刻消除）；③ _lib/env-contract.mjs deterministicRunAt 形参 (env) 移除→process.env 内联（无调用方传参——Speculative Generality 摘出）。
- **预检证物**：stripComments 对 48-micro-a-preview.mjs/56-checker-heldout-eval.mjs/d179-check.mjs/46-check.mjs 四件实测行数零漂移（delta=0——无引号态吞行，Lesson 级联已证安全）。
- **构造输入（红态诱导）**：
  - D1 `// new Date()` 行注 → 剥后不命中
  - D2 `/* new Date() */` 块注 → 剥后不命中（手搓版漏此形态）
  - D3 `const s = "x://y"; new Date()` → 修前手搓版漏检（// 截断）／修后命中——危险方向收紧实证
  - D4 deterministicRunAt() 无参调用三件读数不变：env 缺席→epoch 0 ISO；合法注入→注入值；非法→throw（签名化简不改行为）
- **绿判据**：d179-check PASS 7/7＋46-check 31/31＋75a-check 16/16＋guard-all-run 61/61

## 包E（文书/册项面——非探测面，随列声明）

- CHANGELOG.md M-045 impact 行与 ## [M-046] 之间补空行（格式 nit，件内顺手整理）
- 预声明包（2026-09-29-r49-predecl-verification-packs.md）尾增「勘误」节：包B 声明载体 check-kit.mjs≠落地 env-contract.mjs＋A5 未声明增项＋prereg_commit 扩面——D-146⑤ 链式注记，不改原行
- registry ci-workflow-liveness-watch verify_method 补「60 天自动停用」字面（D-176③ 原款字面回填）＋update-33-ci-liveness-watch.mjs ITEM 同步（幂等断言一致面）
- 语义边界：判据面零修订；golden/frozen/册项语义不动；零新三方依赖；engine 零触碰
