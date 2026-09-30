# R50-Q1 调研题面 —— 共用注释剥离器 regex 字面量盲区处置（check-kit stripComments 不识 JS regex 字面量态）

（提交 atomcode-research 深调研；账本=唯一事实源立场，调研须回顾 decision-ledger 全部 current 记录、docs/adr、CONTEXT.md 词条、工业界成熟落地心智模型为重点。）

## 背景

本仓=五尺度工程内容审计产品的 spec-level 规划+治理仓。治理守卫面=61 件 check 脚本＋共用工具库 .scratch/architecture-recovery/reports/_lib/check-kit.mjs。其中 stripComments 为行注/块注/字符串三态机（inStr/inLine/inBlock），**无 JS regex 字面量态**——/"…"/ 或 /'.'/g 内引号被当字符串起始致 inStr 跨行粘滞，期间行注/块注被当字符串内容保留（该剥不剥）→下游盘点漂移。

轮50 实证链：D-183 同型反模式普查 59 件 NN-check 扫出手搓注释剥离 3 命中——21-collectors-check 与 55-check 迁 check-kit PASS（预声明附录B 三条件判别：被扫面无 regex-引号形/无歧义除号位/断言面不受影响→不受污染）；70-check 迁入后 E1 断言盘点漂移（其被扫面含 regex 字面量内引号）→回退维持本地双轨例程＋D-181 勘误通道记档为已知限制。当前消费位 8 件（20/21/54/55/70/75a/d179-check＋update-70-inventory），盲区存续=共享例程存在已知不正确输入类，靠逐件三条件判别规避。

约束面：零三方依赖约定封死引入真 lexer（acorn/esbuild 类）；check 源码=探测面——任何修改须走 D-177 预声明验证包（声明物化先于变更）；D-183 立过「同型普查命中即修或勘误」先例；根治难点=JS 词法著名歧义（'/' 是 regex 起始还是除号无前驱 token 上下文不可判，真 tokenizer 用启发式消歧）。

## 候选

(i) 立项根治：下轮执行批修 check-kit——补 regex 字面量态（前驱 token 启发式判 '/' 歧义）或行级回退策略（检测到歧义形逐行降级保守处理），D-177 预声明先行＋等价性 fixture 集钉边界（regex-引号/除号后 '/'、'/=/' 角例、模板串内 ${/x/}），修复后 70-check 回迁共用。利=盲区清零＋共用化完整；弊=启发式词法是硬骨头，改错=全消费位共损须等价性大包围网。
(ii) 缓挂 Accepted Risk：记档为已知限制＋过渡期闸门「新消费位迁入前三条件判别强制」（附录B 判例成文化入 WORKFLOW）。利=零风险；弊=盲区永续＋每新增消费位付判别税＋AR 五要件登记成本≥修的边际成本。
(iii) 记档不修＋消费位冻结：check-kit 剥面契约收窄为「限无 regex 字面量输入面」，新消费位禁入，70-check 本地双轨=合法长期态。利=最省；弊=共用化方向倒退＋契约收窄声明实为改名免责。
(iv) 回退去共用化：8 件消费位全回本地例程。利=各自适配各自输入面；弊=逆 D-094③ 共用化立法＋重复实现复活（A18/d179 两次同型 bug 史证明分散手搓更易错）。

## 调研要求

1. 工业界成熟心智模型（重点）：JS/TS 注释剥离/minify 工具处理 regex-vs-除号歧义的成熟做法（acorn/babel/terser/esbuild/uglify 的前驱 token 启发式消歧、TypeScript scanner 的 slash 判定）；syntax highlighter 族（Prism/Shiki/highlight.js）的 regex 字面量识别策略与已知误识面；注释剥离正确性边界的工业惯例——「误留注释」vs「误删代码」不对称风险的处置原则（fail-safe 方向约定）；共享词法工具已知输入类限制的治理先例（narrow contract vs full tokenizer 选型先例）；行级回退/降级策略在 parser 工程中的先例（graceful degradation on ambiguous constructs）；等价性 fixture 集惯例（lexer 变更的 golden corpus/property-based 对照先例）；adoption gate 模式（共享工具已知限制下新消费位准入判别的成文化先例）。
2. 判候选：四候选各评强弱——特别裁决：①前驱 token 启发式在无全量 parse 下做 regex-vs-除号消歧的可靠性边界（生产级 minifier 实证——启发式覆盖率/已知误识率）；②注释剥离场景的安全方向判定（误把除号当 regex=该剥不剥安全向 vs 误把 regex 当除号=内容被剥危险向——业界是否有「全偏安全向」设计惯例）；③行级回退策略是否有先例；④已知限制＋迁入闸（adoption gate）对共享工具是否业界认可为合法长期态，还是公认复利型技术债；⑤契约收窄声明（「限无 regex 面」）在工具治理中的先例评价。
3. 冲突扫描：结论是否与本仓 current 决策冲突（重点 D-094③ 共用化立法、D-177 预声明验证包、D-179 确定性生成、D-181 勘误通道、D-183 普查即修、D-139/D-140② 分 commit 纪律、D-148③ 生效时点不溯既往、D-169/D-171 Accepted Risk 五要件、D-158① 调用位语义、D-165/D-170 分层定稿）。
4. 推荐+理由+置信度；缺口如实标位。
