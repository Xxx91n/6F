# R27-Q1 atomcode 调研题面（存档）

> 2026-09-22 轮27 grill Q1。执行面=atomcode -p（ctx_batch_execute 串行）。

## 调研问题（verbatim 发出）

开源项目 README/仓库门面的「上游致谢面」建制取舍：一个开源工程内容审计产品（Apache-2.0、preview 阶段、README 门面刚完成品牌正名）要在 README 尾部新增致谢/归属面。现状事实：机读权威上游锁定表 upstream-lock.yaml 有 11 行（active 8 个：codelore 外部 CLI、duckdb-node-api 与 duckdb-node-bindings 运行时依赖、git-cli 外部 CLI、github-rest 远程 API、esbuild 构建工具、schemastore-claude-plugin-manifest schema 快照、claude-cli 校验工具；planned 1 个 openssf-scorecard；evaluating 1 个 codelore-sqlite-dump；retired 1 个 repomix-gitingest），README 「上游清单表」只列 5 个证据面上游（缺 3 个 active 工具链上游）。拟议：新增「Acknowledgments/致谢」节按 active 集逐条列名+链接+角色，枚举面声明 closed 并加守卫断言「致谢成员集 ⇔ lock active 集双向差集为空」。请调研：①工业界开源项目致谢/归属面的成熟心智模型与形态惯例（license attribution 义务 vs 人情致谢的边界、NOTICE/THIRD-PARTY-NOTICES/credits 节的定位分工、"powered by" 叙事与依赖清单的分层）；②文档枚举面与 manifest/lockfile 单一事实源的同步漂移问题与建制先例（SSOT 派生、双向对账断言、生成式文档段）；③对本题给出推荐——致谢枚举边界（仅 active / 含 planned+evaluating / 含 retired 全集）、承载面（新节 vs 扩表现有技术表 vs 生成式段落）、closed 对账断言的价值与过度建制风险。辩证看待，指出牵强处与反例（致谢节沦为维护债/徽章链接腐坏/谢错对象语义风险）。
