# R31-Q2 深调研题面：编译产物随源进仓（dist-in-repo）决策的第三轮立场批评处置

## 本仓背景

产品=宏观+微观工程内容审计 CLI（engine/dist/cli.js 为 esbuild 单文件 bundle）。已定（勿推翻）：分发渠道=Agent Plugin only（git-clone 型插件市场安装，无构建步）——R19 决策「dist 入库」（可运行体随源进仓，GitHub javascript-action 官方先例）＋CI rebuild-diff 守卫（npm ci && npm run build && git diff --exit-code dist/）；npm publish 渠道 deferred；决策复审采用「事件绑定触发器」机制——批评不直接重裁决策，而是登记可机检触发事件（D-038 npm publish 激活 / pack 体积过阈=153.6KB×2 锚 / 官方惯例反转→重裁）。

## 本轮实证与批评

外部锐评（第三轮）再批：「为免去用户 npm run build 的 3 秒钟，每次提交背上 5000 行打包产物 diff 的沉重技术十字架」——dist/cli.js 现 229,002B/5,116 行（阈值锚 307.2KB 未越，73% 消耗）。同期一次内部审计曾因漏跑 bundle 判 FAIL 打回（rebuild-diff 守卫按设计工作）。

候选处置：
- **(a) 维持不重裁＋登记**：批评→触发器吸收映射；体积实测数入收口注记；触发器原样值守——立场批评零新增实证不满足已立的受理边界（立场+新实证+工业先例三要素齐备才受理 revised）；
- **(b) 受理重裁**：行数增长+CI 打回痛=新实证，提前激活拆仓/publish 渠道评估；
- **(c) 维持+增量动作**：体积值守收紧或立「制品体积治理」票。

## 调研任务

取证工业界成熟心智模型并给推荐+理由+各候选评估+冲突核查+来源清单+置信度+信息缺口：
① **dist-in-repo/committed-artifacts 惯例现状**——GitHub javascript-action 官方指引与社区实践的最新状态（是否仍推荐 commit dist；大型 action 仓如何处理产物体积；ncc/esbuild 产物入仓的演化趋势）；其他分发机制（release artifacts、package registry、provenance/SLSA）对「免构建安装」与「仓体积」权衡的工业解法；
② **决策复审触发器/立场批评治理先例**——ADR「decision stands until context changes」治理模型、Nygard status 模型、批判性评审受理边界的成熟做法；「成本复述 vs 新实证」的区分判据有无先例；
③ **产物体积的量化治理先例**——bundle size 值守（size-limit/bundlewatch/bundlesize 类工具）的阈值设定惯例、体积回归 CI 实践、产物膨胀到多大算「过阈」的实证锚点；插件/agent 分发场景下仓内产物体积的真实痛点阈值；
④ **rebuild-diff/产物一致性守卫的成熟度**——CI「重新构建并比对产物」是业界标准实践还是过度工程；其失败成本（误报/漏报/开发者体验）的已知权衡。