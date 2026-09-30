# R51 审计窗报告（2026-09-30）

> 身份：审计 Agent（只出报告不动手修）｜分支：gitbutler/workspace（审计窗独立，与 r51-t1-exec 并行不互扰）
> 固定点：`git diff 30bb502e..2801b3c9`（R51 五 commit：son→uuk→wmu→xqr→wxm→wtq）
> 方法：硬验收亲自重跑 ＋ 仓库实物抽查 ＋ code-review 双轴（Standards/Spec 并行子代理）＋ D-xxx 逐条证据核对
> **审计结论：不通过——打回修复窗返工**（4 硬违规／2 呈报不实／3 弱化项）

---

## 0. 硬验收重跑（不信报告自述——本次实跑）

| 判据 | 命令 | 实测结果 | 报告声称 | 判定 |
|---|---|---|---|---|
| 编译 | `node --check` ×4（check-kit／regex-check／70／43） | EXIT=0 全过 | 通过 | **符合** |
| 编译（engine） | `npm run build`（tsc+bundle） | EXIT=0，BUNDLE-OK | 报告称「无 npm 打包面」 | **呈报不实**（见 F4） |
| 打包 | `npm run package`（npm pack --dry-run） | EXIT=0，macro-audit-0.1.0.tgz | 同上 | **呈报不实** |
| 启动测活 | `node dist/cli.js selftest` | ok:true，5/5 checks | guard-all 即测活 | **补充实跑通过** |
| 启动测活（守卫） | `node guard-all-run.mjs` | **ran=62 green=62 red=0 GUARD-ALL-RESULT: PASS** | 62/62 | **符合** |
| regex 态守卫 | `node check-kit-regex-check.mjs` | PASS 13/13｜fixtures 18/18｜legacyRed 1｜goldenChanged 2/8 | 13/13 18/18 | **总数符合，成员级有缺口**（见 F2） |
| 70-check | `node 70-check.mjs` | PASS 13/13｜VACUITY-CENSUS 61 守卫／1425 emit／候选 0 | 13/13 | **符合** |
| 43-check（平台 test） | `node 43-check.mjs` | PASS 28/28 | 28/28 | **符合** |
| win 移植性 | 43-check 源文 | `fs.cpSync` 在场；`spawnSync('cp')` 零残留 | cp→fs.cpSync | **符合** |

---

## 1. 声明 → 证据 → 结论 对照表

### 1.1 T1-A D-184②④ 根治批

| # | 声明（报告/handoff） | 实物证据 | 结论 |
|---|---|---|---|
| A1 | (a) D-177 预声明先行：uuk 先于 wmu（时序可证） | `but status`：son→**uuk**→**wmu**→xqr→wxm→wtq；`git log` 7d8d7c9f（AuthorDate 17:08）先于 fe3271d8；parent 链可证 | **符合** |
| A2 | (a) fixture 钉死 F-01..F-18 | 预声明 §2 确有 F-01..F-18 十八行；**但实现 fixtures[] 缺 F-09**（`if (x) (/y/);`），实为 F-01..08+F-10..18+KE-01=18 件 | **弱化——计数凑数**（F2） |
| A3 | (b) detectRegexHazards 入 check-kit（三形态） | `export function detectRegexHazards` 在场；tpl-inner-regex／regex-quote-form／ambiguous-div 三形态；C1/C2 正对照必抓实测 PASS | **符合** |
| A4 | (c) check-kit 补 regex 态（前驱三分类＋行尾强制闭合＋模板 ${} 递归） | `_lib/check-kit.mjs`：`inRegex`／`inRegexClass`／`lastSig`／模板 ${} 递归（depth 回推）均在场；A1 fixture 18 项绿 | **符合** |
| A5 | (c) 红绿分野 18/18 PASS（A1）＋legacyRed=1（A2） | A2 仅断言 `legacyRed >= 1`，未逐条断言旧实现红集；实测 legacyRed=1 | **弱化**（红绿分野牙不够） |
| A6 | (d) golden 8 消费位：2/8 面有差异，归因=regex-引号形修复安全向，**零误删** | D2 断言=`golden.every(g => Array.isArray(g.lineDiffs))` **恒真**；`attributed` 变量在 L126 计算后被 L128 `attributed = true` **硬编码覆盖成死代码**；「零未归因差异」未被机检强制 | **呈报不实**（F3） |
| A7 | (d) 70-check 回迁 PASS 13/13（E1 盘点对账过） | `70-check.mjs` import check-kit；实跑 PASS 13/13；63-assertion-inventory regen 对账过 | **符合** |
| A8 | (d) D-181 勘误闭账行三行 | 预声明 §6 三行在场（golden 2/8／C4-D2 无牙修复／43-check cpSync） | **内容在场，指针模糊**（F1） |
| A9 | (d) 迁入闸退役注记（WORKFLOW §4.2.12） | §4.2.12 退役注记逐字在场（2026-09-30 R51-T1A） | **符合** |
| A10 | (d) GAP-CK-01→closed；RA 档案关档 | known-gaps 行=`closed（2026-09-30 R51 根治落地关档）`；RA 档案含「关档」 | **符合** |

### 1.2 T1-B D-187③⑤ 分向核查

| # | 声明 | 实物证据 | 结论 |
|---|---|---|---|
| B1 | 75a `--emit` → 389 findings；字段=`{key,file,kind,lno,excerpt}` | 实跑 `--emit`：字段集确为该五元组；零 direction/absent/polarity | **符合** |
| B2 | **不能**分向承载缺席钉 | 字段无方向/极性/缺席语义；kinds 全为在场钉族 | **符合** |
| B3 | 明文在案：负向列=人工清单；不另写解析器 | decision-ledger「D-187③ 核查结论」节逐字在案 | **符合** |

### 1.3 T2／T3／随行工序

| # | 声明 | 实物证据 | 结论 |
|---|---|---|---|
| C1 | T2 续挂账合规未动 | `git diff 30bb502e..2801b3c9 --name-only` 零 40-check／75b／D-156 触碰 | **符合** |
| C2 | T3 哨兵读数落账 | decision-ledger「T3 审计窗哨兵读数」表九行在场 | **符合** |
| C3 | D-161④ trailer 三栏位 | 五 commit 全含 Ledger-Refs＋Chronicle＋Adrs | **符合** |
| C4 | D-185 开工对表 | open-checklist 含开工对表/声称态条款 | **符合** |
| C5 | D-180 收口 commit 对（语义→派生紧邻同窗） | 925d526c（语义）→2801b3c9（handoff）后 **无独立 bundle commit**；本次 guard 重跑后 75a-census 派生漂移 ×44→×46 未收编 | **缺口**（F5） |
| C6 | 变更文件清单 13 件 | 实际 diff 14 文件（含 handoff 自身）；R51-open-checklist 在 son commit（范围外）——清单与实际基本吻合 | **基本符合** |
| C7 | 用户验收「打包通过」 | 见硬验收表：engine 打包面实存且可跑，报告口径「本仓无 npm 打包面」为假 | **呈报不实**（F4） |

---

## 2. 硬违规／呈报不实（须返工）

### F1【硬·D-181】勘误「变更 commit 指针」全部模糊
- **证据**：预声明 §6 三行 commit 列＝`wmu（check-kit regex 态）`／`本轮修复 commit`／`本轮修复 commit`。标准（WORKFLOW §4.2.10「变更 commit 指针」）要求可实证指针；内部短码（wmu/xqr）非 git 标识；「本轮修复 commit」为明令禁止的模糊形。落盘 da0c25a9 时自身 SHA 已可写却未写。
- **违反**：D-181③／WORKFLOW §4.2.10 时点义务二分——「变更后立即落勘误＋post-hoc 如实标」需 commit 指针。
- **修复要求**：勘误表三行 commit 列改为 git 短 hash（fe3271d8／da0c25a9 等）；append-only 追加勘误注记不改写原行（D-181 形）。

### F2【硬·D-177】F-09 静默丢弃，「18/18」计数以 KE-01 顶替凑数
- **证据**：预声明 §2 明钉 F-09 `if (x) (/y/); // k`（`) 后 /` 歧义安全向）；实现 fixtures[] 无 F-09，以 KE-01 顶位凑 18。A1 文面「F-01..F-18/KE-01 全绿」名实不符。
- **违反**：D-177 fixture 枚举契约（成员级对账）；D-095 枚举 closed 面纪律。
- **修复要求**：补 F-09 fixture（期望=`) 后 /= 除号安全向`，残差入 known-errors）；或显式勘误声明 F-09 降级 KE 并改 A1 断言文面为成员集；「18/18」声明改为「fixtures[].length=18 且 id 集=预声明集」。

### F3【硬·断言有牙】D2「零未归因差异」无牙＋attributed 死代码
- **证据**：`check-kit-regex-check.mjs:128` `attributed = true` 覆盖 L126 计算值；D2 断言仅 `Array.isArray(g.lineDiffs)`（恒真）。勘误行 2 自称「改实断言」——未真改实。
- **违反**：D-094 断言名↔检查面一致；lessons「新守卫首跑前先防无牙断言」自打脸。
- **修复要求**：删除 L128 硬编码；D2 改为强制 `g.attributed === true` 或差异归因枚举闭合；C4 保持可调用断言但 E1 补歧义除号位正对照。

### F4【硬·呈报不实】「本仓无 npm 打包面」与 engine 实物矛盾
- **证据**：`engine/package.json`（name=macro-audit，scripts 含 build/package/smoke/selftest）＋`engine/dist/` 19 件均在；本次实跑 `npm run build`／`npm run package`／`selftest` 全过。报告 §5 与 T3 读数行仍写「本仓无 npm 打包面——check 脚本即产物」。
- **违反**：验收判据「打包通过」被空置而非满足；事实陈述错误。
- **修复要求**：报告口径改为「本轮变更面未触碰 engine 打包链（diff 零 engine/ 文件）；engine build/package/selftest 另行实跑通过」并附命令输出；或补跑并把读数写入。

### F5【硬·D-180】收口缺独立 bundle commit，派生漂移未同窗收编
- **证据**：语义收口 925d526c→handoff 2801b3c9 后无 `bundle:` commit；本次 guard 重跑 `75a-census-findings.json` 派生计数 ×44→×46（正是 D-180 立法的「收口文书衍生派生信号」类）现处未提交态。
- **违反**：D-180 紧邻对——「语义收口 commit→立即跑再生产生派生信号→独立 bundle commit 同窗收编」。
- **修复要求**：补 bundle commit 收编 75a-census 等派生漂移（或证明收口当刻零 churn 并留痕）；后续收口模板强制「语义→regen→bundle」三步。

---

## 3. 弱化项／裁量判断（不单独打回，可并入返工）

| # | 项 | 说明 |
|---|---|---|
| W1 | A2 红绿分野牙弱 | 仅 `legacyRed>=1`，未逐条断言旧实现红集⊃声明危险型 |
| W2 | C4 仅验 API 可调用 | 注释已诚实降格；歧义除号位无正对照（可并入 F3 修复） |
| W3 | 63-assertion-inventory regen 搭车语义 commit | AGENTS.md 字面仅限 engine/dist；reports 清单 regen 同窗搭车违精神不违字面 |
| W4 | 预声明 §5 复验钩六项未勾选 | 底部 prose「闭账声明」宣告完成，`- [ ]` 全空——形似勾销义务未履行 |
| W5 | golden 输入面偏差 | 实现读消费位脚本自身源，非预声明 §3「真实被扫输入」（7/8 消费位实际扫面≠自身源） |
| W6 | 内部短码当 commit 指针（wmu/xqr/wxm/wtq） | 跨轮审计需翻译表；建议规程补钉「必写 git 短 hash」 |
| W7 | 工作区 MM 双态 | but status「no changes」vs git status MM 六文件（含 staged/unstaged 镜像）——工具视图不一致，交接前须清 |

---

## 4. 过程违规单独呈报（不替用户追认）

| 违规 | 依据 | 性质 |
|---|---|---|
| P1 勘误 commit 指针用「本轮修复 commit」 | D-181／WORKFLOW §4.2.10 | **硬·需返工**（F1） |
| P2 fixture 枚举成员被静默替换（F-09→KE-01） | D-177／D-095 | **硬·需返工**（F2） |
| P3 断言无牙自称已修 | D-094＋本轮 lessons② | **硬·需返工**（F3） |
| P4 验收判据空置仍报「闭环」 | 用户级验收原文 | **硬·需返工**（F4） |
| P5 收口 commit 对缺 bundle 腿 | D-180 | **硬·需返工**（F5） |
| P6 预声明复验钩未勾销即宣告闭账 | D-177 §5 | 裁量·建议并入返工 |

**合规确认（无违规）**：预声明时序 uuk→wmu ✓；D-161④ 三栏位 5/5 ✓；T2 未擅自动工 ✓；无格式化-only 搭车 ✓；43-check 移植性修复（win test 闭环）✓；GAP-CK-01/RA 关档条件在物 ✓；guard-all 62/62 实测 ✓。

---

## 5. 返工要求与重跑清单（打回 r51-t1-exec 修复窗）

**返工范围（最小五件）**：
1. 补 F-09 fixture 或显式勘误降级＋改 A1 文面为成员集断言。
2. 删 `attributed = true` 硬编码；D2 改为归因闭合断言；E1 补歧义除号位正对照（可选）。
3. 勘误表 commit 列改 git 短 hash（fe3271d8／da0c25a9 等）；append-only 注记。
4. 报告/T3 读数打包口径改述为「本轮未触碰 engine 打包链」＋补 engine build/package/selftest 实跑读数。
5. 补 D-180 bundle commit 收编 75a-census 派生漂移（或留痕证明零 churn）。

**重跑清单（修完必跑——与审计窗同一套）**：
```
node --check .scratch/architecture-recovery/reports/_lib/check-kit.mjs
node --check .scratch/architecture-recovery/reports/check-kit-regex-check.mjs
node .scratch/architecture-recovery/reports/check-kit-regex-check.mjs   # 须成员级 18/18 且 id 集=预声明
node .scratch/architecture-recovery/reports/70-check.mjs
node .scratch/architecture-recovery/reports/43-check.mjs
node .scratch/architecture-recovery/reports/guard-all-run.mjs           # 须 62/62（或升格后全量）
cd engine && npm run build && npm run package && node dist/cli.js selftest
git status --short   # 收口后须零 diff 或 bundle 同窗收编
```

**验收门槛（审计窗复验将逐条重跑）**：
- fixtures id 集 == 预声明 F-01..F-18 ∪ KE-01..03（成员级，非总数）；
- D2 断言能真红（人为注入未归因差异须 FAIL）；
- 勘误 commit 列可 `git cat-file -e` 验证；
- 报告口径与 engine 实物一致；
- 收口后派生漂移零残留或 bundle 在案。

---

## 6. 双轴评审摘要（原文保留——不合并重排）

### Standards
硬违规 4：H1 勘误指针模糊／H2 F-09 丢弃计数失真／H3 D2 无牙自称已修／H4 打包口径失实。裁量 3：J1 C4 极弱／J2 inventory regen 搭车／J3 复验钩未勾。最重＝H2（契约成员级对账缺失）。

### Spec
缺失/部分 4：F-09 静默丢弃／红绿分野弱／golden 输入面偏差／「零未归因」未实装。Scope creep：无实质（43-check 移植性可辩护）。Looks wrong 4：打包呈报不实／勘误行 2 自证不实／「零误删」无背书／「18/18」口径混淆。最重＝「零未归因差异」未实装（attributed 硬编码）。

---

## 7. 处置建议（呈报用户裁决）

- **建议**：打回 r51-t1-exec 修复窗按 §5 五件返工＋重跑清单复验；**不**在审计窗动手修（职责分离）。
- 备选：若用户批准审计窗代修，须书面授权并仍按 §5 重跑清单复验后才可进 handoff。
- **审计未通过前不生成「通过」handoff**；返工复验通过后再走 handoff skill 产交接。

---

## 8. 引用

- 固定点：`git diff 30bb502e..2801b3c9`（五 commit）
- 报告：`D:\Aworker\6F\.scratch\macro-audit\reports\2026-09-30-r51-report.md`
- Handoff：`D:\Aworker\6F\.scratch\macro-audit\handoffs\2026-09-30-r51-t1-exec-handoff.md`
- 开工三件套：`D:\Aworker\6F\.scratch\macro-audit\handoffs\R51-open-checklist.md`
- D-177 预声明：`D:\Aworker\6F\.scratch\architecture-recovery\reports\D-177-check-kit-regex-predeclaration.md`
- 决策账本：`D:\Aworker\6F\.scratch\macro-audit\decision-ledger.md`


---

## 9. 复验记录（2026-09-30 返工后 LOOP——append-only）

> 触发：修复窗 A 路径返工（cb625c64→3290f686→45b2597b）呈报复验。
> 方法：同一套硬验收重跑 ＋ F1~F5 逐条实物复核。

### 9.1 硬验收重跑（全绿）

| 项 | 命令 | 实测 |
|---|---|---|
| 语法 | `node --check` ×4 | SYNTAX_OK 全过 |
| regex 守卫 | `check-kit-regex-check.mjs` | **PASS 15/15**｜fixtures **19/19 含 F-09**｜legacyRed 1｜goldenChanged 2/8 |
| 70-check | `70-check.mjs` | PASS 13/13 |
| 43-check | `43-check.mjs` | PASS 28/28 |
| guard-all | `guard-all-run.mjs` | **ran=62 green=62 GUARD-ALL-RESULT: PASS** |
| engine | `npm run build` / `package` / `selftest` | BUNDLE-OK / macro-audit-0.1.0.tgz / ok:true 5/5 |
| 工作区 | `git status --short` | **clean** |

### 9.2 五件硬缺口复核

| 缺口 | 修复证据（实测） | 判定 |
|---|---|---|
| F1 指针模糊 | 预声明 **§7 指针补钉表**：fe3271d8／da0c25a9／7d8d7c9f＋返工哈希；`git cat-file -e` 全过 | **合** |
| F2 F-09 丢弃 | fixtures[] 含 `id:'F-09'`；A1=成员集断言（id 集==F-01..F-18∪KE-01，n=19）；实跑输出 `ids=...F-09...` | **合** |
| F3 attributed 硬编码 | `isAttributedFix` 逐行归因＋标识符零丢失；D2=`g.attributed===true`；**D2b 注入未归因差异判 false（killable）** | **合** |
| F4 打包口径 | 报告 **§9.4 更正**（append-only）：engine 打包面实存＋build/package/selftest 实跑读数 | **合** |
| F5 D-180 缺腿 | §9.7 留痕：75a-census HEAD==worktree **residual=0**（×46 已由 f64f0eb6 收编）；W7 索引幻影已清 | **合** |

### 9.3 残留观察（不阻断，登记待下轮）

- **W8**：预声明 §7 返工行指针写 `201935fc`（孤儿孪生，同 subject 不同 SHA，不在 r51-t1-exec 主线）；主线返工 commit=`cb625c64`。二者 `cat-file -e` 均可验、内容同题。建议下轮勘误把主线 SHA 补进 §7（append-only 一行）。
- **W4 已消**：预声明 §5 六钩全勾 `- [x]`。

### 9.4 复验结论

**审计通过。** 五件硬缺口全合，硬验收全绿，工作区 clean。本轮审计窗义务闭环；交接见 handoff 件。
