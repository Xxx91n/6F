# ADR-0014: 上游组件引入方式 = 适配器双轨制 + vendor 逃生舱（Upstream Integration Dual-Track）

- Status: accepted
- Date: 2026-09-14
- Deciders: 用户（grill 轮 4 Q1，经 atomcode R4-Q1 深调研呈报后拍板；账本 D-020）

阶段 2/3 上游组合件接入的引入方式定版为**双轨制 + 逃生舱**：①主线 = 适配器 + 外部 CLI/库，逐上游锁定版本并配 golden 输出契约测试——进程/容器边界即天然防腐层（工业先例：super-linter 容器捆绑、hashicorp/go-plugin subprocess+RPC、Terraform plugin protocol 版本化契约）；②库形态上游走包管理器 + lockfile hash pinning，不为统一强推全部 CLI 化（kusari 三档 pinning 判据 branch/tag/hash）；③vendor 源码进仓仅两种情况启用：具体上游需离线/气隙分发、或上游废弃且无替代——启用时必须带 UPSTREAM 清单 + patches/ 目录纪律，否则 SBOM 与 SCA 扫描全线失明。

决策理由：atomcode R4-Q1 深调研（16 次三引擎检索 / 10 篇原文核验 / 13 来源，Confidence 高）实证——本产品上游（代码考古、供应链评分、仓库打包摘要）全部为活跃迭代、依赖树庞大的工具，vendor 有一手失效数据（vendored C 库中位年龄 3 年以上、manifest 键控 SCA 对 third_party/ 失明、NTIA SBOM 无法出具），明确判据不符；护城河（裁决协议 / 事实表 schema / 回执）要求上游可替换（Microsoft ACL 模式判据：翻译层禁放业务规则）；与 Hub-of-Facts（ADR-0005）零冲突且相互强化——事实表 schema 是唯一允许上游语义落地的边界。

Considered Options: A 全量运行时依赖引用（CLI 形态上游适配边界不清，上游类型渗入业务代码）；B 全量 vendor 源码进仓（与上游活跃迭代判据不符，调研明确否决）；C 双轨制 + 逃生舱（采纳）。Consequences：适配层成为正式契约面，golden 契约测试为长期维护义务；根 README 组合件五段式（D-021）为对外披露载体；实施落点 = 阶段 2/3（票 #24/#25，backlog）。
