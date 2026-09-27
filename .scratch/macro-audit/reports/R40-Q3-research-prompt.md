# R40-Q3 调研题面（atomcode）

承接 R40-Q1/Q2（已落账 D-157 摄入分诊+射程＋C2 窄残余入门；D-158 F-A1=(a) 收紧谓词＋附件五包）。本问=C1 守卫面运行环境契约裁——第四轮锐评 C1「温室巨舰」裁面。

## 实证底座（已一手直读源码修正锐评画像）

- **活体 sibling 路径依赖=仅 3 件**（非锐评称 9 件）：
  - 37-check.mjs:9 ROOTS={env-manager,anysearch-cli,jiahao}=D:/Aworker/* → :33/:35 existsSync(join(root,f)) 验证 sibling 工作树 ADR/workflow 文件实物；
  - 39-check.mjs:16 REPOS 同构 → :48 git(REPOS[n],['cat-file','-t',sha]) 进 sibling 仓验 commit 对象可达；
  - 46-check.mjs:17 JIAHAO='D:/Aworker/jiahao' → 读 jiahao 工作树 .github/workflows 文件内容。
- **内容级提及≠依赖**：38/40/42/48/49/51 六件 check 仅断言文本里含 sibling 仓名（对 committed 工件内容断言）——零文件系统依赖，锐评「9 红」实为字符串计数高估。
- **自指路径**：01-check.mjs:4 R='D:/Aworker/6F/.scratch/...'——本仓自指绝对路径，任何异地 clone 必红（且本来就是 kr-01 已知红件）。
- **幽灵 commit**：26-check.mjs:12 git show fc00d458:——bundle objects 不随 clone（D-157 已裁并轨 #75批1 普查通道，非本裁面主体）。
- **非 check 脚本**：11 件 .mjs（probes/previews/one-shots）含 D:/ 字面——不进守卫运行集，执行窗清扫簿记。
- **机制存量**：check-kit.mjs 无 env-var/skip 原语——skip-with-reason 须新建；D-149 已立法 18 基线 vs 60 全量两档跑法（tier 雏形）＋manifest 机制（xfail/known-red/era-scoped 分类）。
- **分发边界**：.claude-plugin/marketplace.json→source:./engine，.scratch 不入插件但入公开仓（Apache-2.0/Xxx91n/6F 公开 GitHub）——外人 clone 跑 guard-all-run 会见红。

## 候选

**(i) 分层契约**——守卫集分 portable tier（自包含任机绿）＋env-contract tier（37/39/46：前置条件文档化＋启动探测＋不可达时 SKIP-with-reason 非 FAIL，skip 件以 env-gated 类入 manifest=声明 D-149 manifest 机制延伸）；sibling 根收敛单一 env 变量 SSOT；01 自指改 repo-relative 无条件修。我倾向此。
**(ii) 全面拔除**——D:/ 字面全扫＋sibling 依赖改 mock 夹具降级（无 sibling 时退化对快照 fixture 断言）。
**(iii) 文档声明维持**——机器绑定立为有意设计（.scratch 私有工作台），只文档化不改代码。
**(iv) 最小修**——只修 01 自指＋sibling 根 env 化，不做 tier/skip 语义（缺 sibling 仍 FAIL 但理由可读）。

## 调研要求

1. 回顾 D:\Aworker\6F\.scratch\macro-audit\decision-ledger.md 全部 current 记录（158 条，重点 D-149 manifest/tier 机制、D-015 单仓、D-157 分诊定案、D-146 摄入分诊——查有无已裁「环境假设/可移植性」被我漏查）；
2. 回顾 docs/adr/（24 件）与 CONTEXT.md 词条查漏；
3. 工业界成熟心智模型（重点）：
   - env-gated test 治理：pytest skip-with-reason/marker 集中定义、JUnit assumptions、Go testing.Skip、Bazel/Buildkite required-vs-optional check 分层；
   - 环境契约声明形态：devcontainer/codespace 前置声明、CI matrix env、tier 测试（unit/integration/e2e live-only）执行面分离；
   - 「sibling-repo 依赖型检查」先例：monorepo 边界、polyrepo integration test 环境编排（docker-compose siblings vs env-var 寻址）；
   - 绝对路径/机器绑定在公开仓的处置先例（repo-relative resolve、env-var 注入、fixture 化取舍判据）；
   - skip 语义进 CI 门禁的形态（skip≠fail 的呈现与计数、env-gated manifest 先例）；
4. 显式列冲突点；置信度自评。

## 期望输出

(i/ii/iii/iv) 推荐＋理由＋tier 划分边界判定＋skip 语义落法建议＋冲突点清单＋置信度。
