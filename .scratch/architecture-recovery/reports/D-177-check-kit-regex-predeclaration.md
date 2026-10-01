# D-177 预声明验证包 —— check-kit stripComments regex 态等价性 fixture 集

> 形态：预声明物化面（D-177 §4.2.8——本件落盘 commit **先于** check-kit 语义变更 commit）
> 时点：2026-09-30 轮 51 执行批（T1-A a）
> 裁定锚：D-184②④（根治批）／D-184①（AR 存续期）／D-177（预声明工序）
> 参考实现：js-tokens 前驱 token 启发式（单文件零依赖 MIT——R50-Q1 非转述直取原则）＋V8/TS 行尾强制闭合

## 1. 判定规则（预声明——变更后须逐条实测红绿分野）

### 1.1 regex-vs-除号三分类（P_VALUE / P_NONE 前驱）

| 前驱 token | 本规则判定 | 期望 |
|---|---|---|
| identifier（含关键字如 return） | P_VALUE → **除号** | `a / b`、`x /= 2` 剥注释时不入 regex 态 |
| 数字字面量 | P_VALUE → **除号** | `3 / 4` |
| 字符串字面量尾 | P_VALUE → **除号** | `'a' / 2` |
| `)` | P_VALUE → **除号** | `(a+b) / c` |
| `]` | P_VALUE → **除号** | `arr[0] / 2` |
| `}` | P_VALUE → **除号**（歧义安全向） | `{x:1} / 2` 与 `{}`/function 尾后的 `/` 均按除号 |
| 其余（算符、`(`、`,`、`=`、`;`、行首、`!`、`&` 等） | P_NONE → **regex** | `=/x/`、`(/x/g)`、`, /y/` |
| 行首（无前驱） | P_NONE → **regex**（安全向按规则走） | 罕见；歧义仍偏除号见 §1.3 |

### 1.2 regex 字面量扫描

- **不跨行**：遇 U+000A 强制闭合（js-tokens / V8 ScanRegExpPattern 先例）。
- 字符类 `[...]` 内 \`/\` 不闭合；\ `\\` 转义跳一格。
- flags（`gimsuy` 等）扫至非 flag 字符。
- 模板串 `${...}` 内递归可含 regex（`${/x/}`）——不因模板体空格化丢失内层 regex 态。

### 1.3 歧义安全向

- **全偏除号**：误留（注释/内容留下）可被下游断言捕获；误删（代码当 regex 吞掉）=静默漏扫（Padolsey 实录）。
- `}` 后 `/` 一律除号（js-tokens known-errors 三组同类残差——本仓取安全向不取 js-tokens 原实现的 object 判定）。
- 行尾未闭合 regex（如 `const re = /foo`）=该行按已见内容保留至行尾，不吞下一行。

## 2. Fixture 集（逐条钉期望——红绿分野必选）

> 每条：输入 src → 期望 stripComments(src) 与「仅剥注释、不吞代码」一致。
> 实现后以 reports/check-kit-regex-check.mjs 逐条断言；RED=未实现前旧 stripComments 命中失败面，GREEN=新实现全过。

| id | 输入（示意） | 期望要点 | 危险类型 |
|---|---|---|---|
| F-01 regex-quote | `const re = /['"]+/g; // keep` | regex 内引号不入字符串态；行尾 `// keep` 被剥 | regex-引号形 |
| F-02 div-after-ident | `const x = a / b; // c` | `/` 为除号；`// c` 剥除 | 除号误判向 |
| F-03 div-eq-slash | `x /= 2; // note` | `/=` 为除号赋值；注释剥除 | `/=` 角例 |
| F-04 assign-regex | `const re = /=/; // t` | `=/=/` 中 `= /` 前驱 `=`→regex；`// t` 剥 | `/=` vs regex |
| F-05 tpl-inner-regex | `const s = \`\${/x/g}\`; // z` | 模板内 ${/x/g} 识别为 regex；`// z` 剥 | 模板串内 regex |
| F-06 brace-ambiguity-obj | `const o = {a:1} / 2; // m` | `}` 后 `/`=除号；注释剥 | js-tokens }` 歧义 |
| F-07 brace-ambiguity-block | `function f(){} /x/; // b` | `}` 后 `/`=除号（安全向）；`/x/` 可能被当除号表达式残留——期望**不吞**后续代码 | js-tokens }` 歧义 |
| F-08 brace-ambiguity-empty | `const e = {}; // n` | 无 regex；注释剥 | js-tokens }` 歧义 |
| F-09 regex-in-parens | `if (x) (/y/); // k` | `)` 后 `/`？前驱为 `)`→除号（安全向）——已知残差入 known-errors | 歧义安全向 |
| F-10 line-end-force | `const re = /foo // not-comment` | 行尾强制闭合；`// not-comment` 处于 regex 内则保留（不误剥） | 行尾闭合 |
| F-11 string-slash | `const p = 'a//b'; // ok` | 字符串内 `//` 不剥；行注剥 | 字符串保护 |
| F-12 block-in-regex | `const re = /\/\*/; // x` | regex 内 `/*` 不入块注；行注剥 | regex 内伪注释 |
| F-13 classic-bug | `/* comment */ program //comment` | 块注剥尽 + 行注剥尽；program 保留 | Padolsey 经典翻车 |
| F-14 re-flags | `const re = /ab/gimsuy; // f` | flags 不误吞；注释剥 | flags |
| F-15 div-after-num | `const r = 1 / 2 / 3; // d` | 全除号；注释剥 | 数字后除号 |
| F-16 regex-after-comma | `f(1, /z/); // c` | `,` 后 `/`=regex；注释剥 | P_NONE |
| F-17 class-close-regex | `class C{} /re/; // t` | `}` 后 `/`=除号（安全向）——已知残差 | }` 歧义 |
| F-18 nested-tpl-regex | `const s = \`a\${ {k:/q/} }b\`; // n` | 模板 ${} 内对象含 regex；注释剥 | 模板嵌套 |

### 2.1 known-errors 册（js-tokens 三组 `}` 歧义同类——本仓安全向期望）

| id | 输入 | js-tokens 原实现 | **本仓期望（安全向）** | 归档 |
|---|---|---|---|---|
| KE-01 | `function f(){}
/x/;` | `}` 后可能判 regex（object 误判） | **除号**——`/x/` 不吞、不剥其内字符 | 允许表达式残留为除号形状 |
| KE-02 | `if (a) {}
/x/;` | 同上 | **除号** | 同上 |
| KE-03 | `{}/x/` | 歧义 | **除号** | 同上 |

> 安全向含义：宁可把 regex 当除号（内容残留可被下游捕获），不把除号当 regex（静默吞码）。

## 3. 8 消费位 golden 对照基线（变更前先钉）

| # | 消费位 | 被扫面（stripComments 输入来源） | 基线命令 |
|---|---|---|---|
| 1 | 20-fact-schema-check.mjs | storeSrc（其自身源） | 见 reports/check-kit-regex-check.mjs golden 段 |
| 2 | 21-collectors-check.mjs | src（collectors 源） | 同上 |
| 3 | 54-check.mjs | mb / demo 源 | 同上 |
| 4 | 55-check.mjs | 多文件 allSrc 拼接 | 同上 |
| 5 | 70-check.mjs | guard *-check.mjs 源 | 同上 |
| 6 | 75a-check.mjs | reports/ *-check.mjs 源 | 同上 |
| 7 | d179-check.mjs | 生成器源 | 同上 |
| 8 | update-70-inventory.mjs | 70-check.mjs 源 | 同上 |

基线钉法：对上述 8 件的 **真实被扫输入**（能跑则跑提取面；不能跑则对仓库内同族源文）记录 stripComments 输出 sha256 + 剥注释前后非空白长度差；变更后重跑——**零未归因差异**方可回迁。

## 4. 迁入闸探测件判据（预声明）

探测命中即阻断迁入的三形态：
1. **regex-引号形**：疑似 regex 字面量内含未转义 `'` 或 `"`
2. **歧义除号位**：`}`/identifier/`)`/`]` 后紧跟 `/` 且该 `/` 可能开 regex（启发式不判死——命中仅「警告并要求 golden 对照」）
3. **模板串内 regex**：`${ ... / ... }...\`` 形

机检面：reports/check-kit-regex-check.mjs 内 `detectRegexHazards(src)`；迁入前对被扫面调用，hits>0 则 FAIL。

## 5. 复验钩（变更后勾销）

- [x] fixture F-01..F-18 全绿（成员集断言 A1；含 F-09 补齐）
- [x] KE-01..03 按安全向期望在 known-errors 注记
- [x] 8 消费位 golden 零未归因差异（D2 机检归因闭合+零误删标识符）
- [x] 70-check 回迁共用例程 PASS（13/13）
- [x] D-181 勘误闭账行（§6＋§7 指针补钉）
- [x] WORKFLOW §4.2.12 迁入闸退役注记

## 6. 勘误（D-181 append-only——闭账行）

| 时点 | 扩面描述 | 发现时点 | 变更 commit |
|---|---|---|---|
| 2026-09-30 R51 | golden 对照实测 2/8 面有差异（70-check L60 / 75a L76）——旧 inStr 粘滞致「该剥不剥」，新态剥除伪注释；归因=regex-引号形修复安全向，零误删 | post-hoc（执行中发现） | `fe3271d891767890c4404ec759c01489521c75f5` ("feat(D-184): check-kit stripComments 补 regex 字面量态＋迁入闸探测件") |
| 2026-09-30 R51 | check-kit-regex-check C4/D2 初版无牙断言被 75a 抓出→改实断言（Array.isArray / golden.every） | post-hoc | `da0c25a986266778cf72d2c72f3b30c9057c3e36` ("feat(D-184): 70-check 回迁共用例程＋43-check 移植性修复＋勘误闭账") |
| 2026-09-30 R51 | 43-check 移植性：`cp -r`→`fs.cpSync`（win 平台 spawnSync cp ENOENT——用户验收「每个平台 test 闭环」） | post-hoc | `da0c25a986266778cf72d2c72f3b30c9057c3e36` ("feat(D-184): 70-check 回迁共用例程＋43-check 移植性修复＋勘误闭账") |

**闭账声明**：D-184②④ 根治落地——fixture 红绿分野 18/18＋golden 零误删＋70-check 回迁 PASS 13/13＋guard-all-run 62/62。

## 7. 勘误指针补钉（D-181 追认——append-only，不改写 §6 原文）

> 发现时点：post-hoc（审计窗 F1 抓出）；本节为指针实名化补丁。

| §6 行 | 原模糊指针 | **git 短 hash（可 cat-file -e）** | 对应变更 |
|---|---|---|---|
| golden 2/8 面差异 | 原首位裸短码（GitButler per-session UI 码——原词形与映射依据见账本 E-4） | `fe3271d891767890c4404ec759c01489521c75f5` ("feat(D-184): check-kit stripComments 补 regex 字面量态＋迁入闸探测件") | check-kit stripComments regex 态＋探测件 |
| C4/D2 无牙断言修复 | 原模糊语（原词形见账本 E-4） | `da0c25a986266778cf72d2c72f3b30c9057c3e36` ("feat(D-184): 70-check 回迁共用例程＋43-check 移植性修复＋勘误闭账") | check-kit-regex-check C4/D2 改实断言 |
| 43-check cp→cpSync | 原模糊语（原词形见账本 E-4） | `da0c25a986266778cf72d2c72f3b30c9057c3e36` ("feat(D-184): 70-check 回迁共用例程＋43-check 移植性修复＋勘误闭账") | 同 commit 内 43-check 移植性 |
| （本轮返工）F-09/归因机检/指针实名 | — | 孤儿孪生标本不可达——真身法定形见下行（原 8-hex 见账本 E-1/E-4） | R51 审计返工批 |
| §7 上表末行勘误（R51 收口批——D-181 追加不改写） | 原 8-hex 孤儿标本（非指针——锚线不可达即非法指针，D-188⑥；原词形见账本 E-1 与本行末格反证）——实证=amend 孤儿孪生（对象在库、主线不可达——同 change-id `nktntvkkwqtrnqxwmtokzulttpowxnpp`／同 parent commit 法定形见账本 E-4 实名行／committer 差 83s） | `cb625c64521398306f914eb7986a4a505f95291a` ("fix(D-184/审计返工): F-09 成员集＋attributed 机检可红＋指针 git hash 实名＋打包口径更正") | R51 审计返工批真身——法定指针形首单实战；实证=`cat-file -e` ✓ ∧ `merge-base --is-ancestor` main✓/HEAD✓（孪生反证：`201935fc` 同命令返非零） |

**指针可验证命令**：`git cat-file -e fe3271d891767890c4404ec759c01489521c75f5` / `git cat-file -e da0c25a986266778cf72d2c72f3b30c9057c3e36` / `git cat-file -e 7d8d7c9ffea187f3c22db7f8953e2cb6661c0635`。


**补钉验证命令**（2026-09-30 R51 收口批追加——D-190 锚线判据形态）：`git cat-file -e cb625c64521398306f914eb7986a4a505f95291a`（存在）＋`git merge-base --is-ancestor cb625c64521398306f914eb7986a4a505f95291a main`（锚线可达）；孤儿孪生反证=`git merge-base --is-ancestor 201935fc main` 返非零。
