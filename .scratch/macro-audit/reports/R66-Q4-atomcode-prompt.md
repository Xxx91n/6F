# R66-Q4 深度调研题面（grill R66 第一轮第四题：EOF-only hunk 形态的 VC 兜底授权）

## 裁定问题 verbatim

本仓 VC 纪律=「版本控制写操作一律走 GitButler（but），禁裸 git 写命令」。但 GitButler 对「EOF-only hunk」（diff 仅含文件末尾单个换行增删）无法生成/应用，三件 hygiene 回归修复因此无法落盘。要裁：是否对该枚举形态授权 git 兜底，及其边界形态。

## 背景（本仓实物，全部已核实）

1. **工具阻塞实证（R65 窗）**：but diff 对 8.7KB 文件报 "No diff available - file is either empty, binary, or too large"；git add 暂存后 but commit 仍报 "3 changes could not be applied"。对照实验：同目录新增文件一次提交成功——but 本体正常，唯 EOF-only hunk 形态不可用。三件回归件：75a-census-register.json、decision-ledger.md、2026-10-05-r63-report.md（本批引入的尾行丢失，修法=appendFileSync 单字节 0x0A 已实证 prefixPreserved 字节级）。

2. **搭车路径的覆盖缺口**：decision-ledger.md 本轮已被实质触碰（D-213~D-215 行插入——diff 非 EOF-only，but 可正常提交，EOL 修复可按 D-139 no-op 例外「被触碰文件内顺手整理」搭车）；75a-census-register.json 有再基线时点但不可期；**r63-report.md 系冻结历史件——永不再有 substantive 变更，搭车路径对其结构性失效**。

3. **仓内制度面**：账本 D-001~D-215（220 current）、24 ADR、CONTEXT.md；版本控制纪律=「用 but 不 push 除非明示」（AGENTS.md+用户规则）；D-139 no-op 搭车例外、D-146⑤ scoped 勘误文法、D-169/D-171 五要件 RA/触发器形态、registry 80 项/56 事件 manual_watch 收回钩先例。

## 候选裁定

- **(a) scoped git 兜底授权**：枚举形态=「diff 仅含 EOF 单个换行增删」（机验：git diff --numstat 单字节增量且无其他行变更）；该形态走 git add+git commit，message 标「GitButler EOF-only 工具限制兜底〔R65 实证〕」；registry 留 gitbutler-eof-hunk-watch manual_watch（GitButler 升级/上游修复→复审收回）；账本 EOL 仍搭本轮账本 diff 不走兜底；其余 VC 写面 but-only 不变。
- **(b) 零授权纯搭车**：账本 EOL 搭本轮收口 commit；另两件挂 known-issue 等下次 substantive 触碰——r63-report.md 冻结件=EOL 永续回归（搭车路径对冻结件结构性失效）。
- **(c) 宽授权**：「任何 but 无法应用的 diff」皆可 git 兜底——面过宽无枚举边界。
- **(d) 不修挂起**：三件登记等 GitButler 上游修复——存续期不定且冻结件卫生债永续。

## 调研要求

1. **必须回顾本仓实物**（本地读文件工具全量过）：decision-ledger.md 全部 current（重点：D-139 no-op 例外/D-140② 语义隔离/D-146⑤ scoped 勘误/D-149 守卫组/D-165② Dual Reporting/D-169 D-171 RA 五要件/AGENTS.md VC 纪律行）、docs/adr 24 件、CONTEXT.md。

2. **工业界心智模型（重点）**：专用工具链「主通道失效时 scoped 例外通道」的成文先例——单点工具 vs 兜底路径的策略形态（如 LFS 失败时 fallback、pre-commit framework 的手动绕过纪律、Bazel remote-cache 降级、提交钩子的 --no-verify 治理）；「例外授权须带枚举边界+复审钩」的治理先例；以及 GitButler 对 EOF-only hunk 的已知 issue/上游行为。

3. **给出推荐与理由**：四候选逐项点评；若推荐修正版给出修正内容；特别审视：①scoped 授权的形态枚举边界是否机检可断（numstat 判据是否充分/需否加文件类型白名单/行数上限）；②manual_watch 收回钩的复审时点设计；③账本 EOL 搭车是否因「D-139 no-op 例外适用域」须额外声明。

4. **冲突核查（硬要求）**：与账本任何 current 冲突显式列出 D-xxx＋冲突点，禁静默改向。重点核：but-only 纪律的原始立法条文（找原始 D 记录逐字核对例外口径）、D-139 搭车例外的适用边界。

5. 输出含：核心推荐、逐候选点评、工业先例证据（带出处）、账本冲突清单、置信度自评、信息缺口清单。
