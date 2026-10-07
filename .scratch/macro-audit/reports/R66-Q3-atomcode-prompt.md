# R66-Q3 深度调研题面（grill R66 第一轮第三题：②git-history 探测面入 D-163 分类）

## 裁定问题 verbatim

need() SSOT 的探测面分类法是否收录 `git-history:` 为第五类前置，及其立法形态。

## 背景（本仓实物，全部已核实）

1. **D-163① 已立法四类 need 前置**：`sibling:`（GUARD_SIBLING_ROOT 下外部仓工作树）／`git-object:<sha>`（冻结对象幽灵钉——非分支祖先 clone 不携带）／`engine-deps:<spec>`（engine/node_modules 原生绑定）／`asset:`（gitignored 外部资产）。每类在 _lib/env-contract.mjs 的 FIX 名册有三段式模板（原因→手动修复→无网影响面，D-072 文法）。

2. **`git-history:full` 已首用跑通但不在册**：84-check HISTREACH 组（浅克隆检出→历史可达性子面组级 SKIP）以 need("git-history:full", false, "原因：…") 调用——**经 caller-override 第三参注入三段式，未命中 FIX 名册**（前缀路由 Object.keys(FIX).find 无 git-history: 项）；need() 头注只列四类。

3. **粒度细节**：84-check 是 **portable tier** 守卫，git-history 缺席时**组级降级**（groupProbe SKIP-GROUP）非整件 env-contract——need 的粒度是「子面」非「整件」。

4. **姊妹题已裁**：D-214（R66-Q2）立 consumption_forms 枚举机检＋tier 差异化验收——消费形态声明面已立法；本题裁的是**运行时降级机制的分类学归属**（need 家族）。

5. **仓内制度面**：账本 D-001~D-214（219 current）、24 ADR、CONTEXT.md；D-072 三段式 reason 文法、D-159 tier 双层制、D-163①四类 need、D-164-a①组级闸 groupProbe、D-214 consumption_forms（新裁）。

## 候选裁定

- **(i) 入册第五类（SSOT 化）**：`git-history:` 前缀入 FIX 模板名册（三段式：原因=对象库形状不含历史·浅克隆检出／手动修复=完整克隆或 CI fetch-depth:0／无网影响面）＋D-163①「四类」勘误扩列 scoped 注记（四类→五类）＋need() 头注更新＋caller-override 逃生口保留；粒度声明=组级 need（子面降级非整件 env-contract）。

- **(ii) 并入 git-object: 家族**：浅克隆=对象库截断形状同域不立新类——但 FIX 模板语义不合（git-object: 修复=恢复在仓 bundle；git-history 修复=加深克隆），并入=模板错配。

- **(iii) 维持 caller-override 现状**：单消费方 YAGNI——但 portable 守卫涉历史可达性断言面者皆同构暴露该陷阱（SonarQube .git/shallow 自检先例=工业界真实复发面）；SSOT 化成本≈5 行换「下一守卫不再手搓三段式」。

- **(iv) 归 consumption_forms 域非 need 域**：git-history 缺席=克隆形态非环境前置——但运行时机制已是 need()/groupProbe 驱动；D-214 consumption_forms 管「谁在什么形态消费我」声明面，need() 管「缺席时如何优雅降级」机制面——两层互补非竞争。

## 调研要求

1. **必须回顾本仓实物**（本地读文件工具全量过）：decision-ledger.md 全部 current（重点：D-072 三段式、D-159 tier、D-163①四类＋零写入临时仓读法、D-164-a① groupProbe、D-165② Dual Reporting、D-213/D-214 新裁）、docs/adr 24 件、CONTEXT.md、_lib/env-contract.mjs SSOT 全文。

2. **工业界心智模型（重点）**：探测面分类学/能力枚举的成熟先例——环境前置探测如何分类登记（feature detection taxonomy、capability probing registries、Bazel hermetic tags/actions、systemd unit 条件族、K8s node feature discovery 之类的「能力/前置类型注册表」惯例）；「类型族扩列时 scoped 勘误 vs 直接改写枚举」的版本化惯例；单消费方新类型入册的时机判据（YAGNI vs 防漂移 SSOT 化的边界先例）。

3. **给出推荐与理由**：四候选逐项点评；若推荐修正版给出修正内容；特别审视 `git-history` 与 `git-object` 的语义边界（对象库「形状/完整性」vs 单个对象「存在性」是否同一类）、caller-override 逃生口保留与否、以及本裁对 portable 内嵌组级降级粒度的措辞是否准确。

4. **冲突核查（硬要求）**：与账本任何 current 冲突显式列出 D-xxx＋冲突点，禁静默改向。注意：D-163① 字面写「四类前置」——第五类入册是扩展还是修订，如何按 D-146⑤ scoped 文法登记。

5. 输出含：核心推荐、逐候选点评、工业先例证据（带出处）、账本冲突清单、置信度自评、信息缺口清单。
