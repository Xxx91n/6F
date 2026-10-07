# R66-Q2 深度调研题面（grill R66 第一轮第二题：①验收形态选取）

## 裁定问题 verbatim

探测面验收判据是否必须包含「消费该守卫的真实环境形态」的实测读数？——守卫（guard/check）在开发环境（dev 全克隆）绿≠在其真实被消费的环境形态下绿，本仓刚实证该缺口。

## 背景（本仓实物，全部已核实）

1. **浅克隆 born-red 事故（R64 审计窗实证）**：84-check（commit 指针纪律守卫，自声明 portable tier）在 dev 全克隆环境全绿入库；但 GitHub Actions checkout 默认 --depth 1 浅克隆下对象库不含历史，需 cat-file 的历史可达性断言面连环爆红（newFail=72 级联）——born-red 活到审计窗才被发现。修法：B/F 面运行时物化＋浅克隆检出→历史可达性子面组级 SKIP（HISTREACH）＋engine-ci fetch-depth:0＋paths 扩列。
2. **tier 双层制（已立法 D-159）**：每守卫自声明 `portable`（任何环境 100% 跑通的承诺）或 `env-contract`（对外部环境有前置声明，缺失时走 SKIP-with-reason 三态优雅降级）；75a-check T1/T2 机检「未声明=红」，T3 对账 env-contract 声明集↔registry 登记（声明≠登记即红）。
3. **need() 声明机制（D-163①已立法四类前置）**：sibling:／git-object:／engine-deps:／asset:；84-check 首用第五类 `git-history:full`（浅克隆检出→组级 SKIP）——其入册分类属本轮下一题（②），本题不裁。
4. **现消费形态谱（实测）**：dev 本机全克隆（含 sibling 仓）／engine-ci 全克隆（fetch-depth:0，portable 段起步 78/84 两守卫在射程）／fresh clone 全克隆（portable 承诺面）／fresh clone 浅克隆（SKIP 路径——CI 改 fetch-depth:0 后**该形态在 CI 无消费方**，只剩外部用户 clone --depth 1 场景）／沙箱环境（env-contract SKIP 三态实证路径）。
5. **病根诊断**：born-red 的根因不是「测错了」而是**消费形态从未被枚举**——浅克隆这个消费者根本没被想到；P1-2 同型教训=声明面与实测面可对不齐（skip 窄化披露）。
6. **仓内制度面**：决策账本 D-001~D-213（218 current）、docs/adr 24 件、CONTEXT.md；registry 33-gate-registry.json（80 项/56 事件，manual_watch/event_bound/risk_accepted 三态）；D-177 比例化预声明、D-183 微修同型普查先例、D-213 刚裁「修复性断言内嵌活性正对照」（同轮姊妹题）。

## 候选裁定

- **(a) 消费形态枚举机检＋tier 差异化验收（强版）**：registry 为每守卫增 consumption_forms 机检枚举面（75a-T3 式声明↔登记对账防「靠人记」漂移）；验收证据按 tier 分化——portable=全克隆＋浅克隆双形态实测读数（其语义承诺=处处可跑，双形态=最小完备覆盖），env-contract=need 声明集逐项探测读数＋SKIP-with-reason 契约结构验证（承诺=优雅降级非处处绿）；新增消费形态=勘误扩列义务（消费方环境变更触发被消费守卫重验——engine-ci fetch-depth 变更即同族先例）。
- **(b) 登记不立判据（弱版）**：消费形态入 registry 备注面，验收不强制实测——枚举可见但形态漂移/未实测无闸。
- **(c) 仅 portable tier 立法**：env-contract 面认定 need/SKIP 契约已足——但其消费形态枚举仍无册（env-contract 守卫同样被浅克隆/CI/沙箱消费）。
- **(d) 维持现状**：审计兜底——浅克隆 born-red 已实证该路径漏检。

## 调研要求

1. **必须回顾本仓实物**（本地读文件工具全量过）：D:\Aworker\6F\.scratch\macro-audit\decision-ledger.md 全部 current 记录（重点：D-159 env-contract 双层制、D-163 探测面分类法四类 need、D-165 定稿判据、D-177 预声明、D-211①「fresh clone 全绿并入哨兵读数」既裁、D-213 刚立内嵌正对照）、D:\Aworker\6F\docs\adr\ 全部 ADR、D:\Aworker\6F\CONTEXT.md 全部词条、.scratch\architecture-recovery\reports\_lib\env-contract.mjs SSOT 实物。
2. **重点调研工业界成熟落地的心智模型**：测试验收中「消费环境形态枚举」的既有成文形态（如 Bazel test en­vironments/toolchains、pytest tox 环境矩阵、GitHub Actions matrix、Terraform provider 验收矩阵、canary/shadow deploy 验收惯例等——「在哪个环境下验收过」如何被显式登记与对账）；「声明 vs 实测对齐」的机检惯例（drift detection/contract testing 先例）；「环境形态新增=既有验证失效」的触发器重验先例。
3. **给出推荐与理由**：四候选逐项点评，指出各自的被支配点/盲区；若推荐修正版（如 (a) 的粒度/强度调整），给出修正内容与理由——特别审视：consumption_forms 枚举面由谁维护、portable 双形态实测在 CI 无浅克隆消费方时如何取证（合成浅克隆 fixture？还是允许声明豁免？）、env-contract 面是否被 (a) 过度卷入。
4. **冲突核查（硬要求）**：若推荐与本仓账本中任何 current 决策冲突，显式列出冲突的 D-xxx 编号与冲突点——禁止静默改向，须呈报给用户拍板。特别注意 D-159 tier 双层语义（portable/env-contract 承诺的原始定义）与 D-211① 已立的「fresh clone 全绿」验收判据是否被本裁扩展。
5. 输出含：核心推荐、逐候选点评、工业先例证据（带出处）、账本冲突清单、置信度自评、信息缺口清单。
