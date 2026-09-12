# 输入面 = 本地路径默认 + 远程 URL 配置可达

被审计仓库到达产品的方式 = 本地路径为默认 + 远程 URL 配置可达：clone 到本地隔离缓存后按本地处理，URL 在输入面之后不复存在，全部走同一本地管线。输入裁决顺序：显式本地路径 → owner/repo 形态本地优先消歧（./ 前缀强制本地）→ 显式 URL（https/git@）才 clone。五条细则：①凭据复用本地 git 凭据链（SSH agent / credential helper / PAT 即用即清），不新建凭据存储；②不可信输入纪律——隔离缓存目录、禁远程配置执行、不写回用户工作区、评审后可清理；③远程一律全深度 clone（fetch-depth 0）+ 校验 .git 完整性，浅 clone 显式拒绝（本产品只承诺面向 git 记录健全的项目）；④clone 入口收敛于 CLI（repo add）与配置文件，不暴露为 kernel MCP 工具——MCP 保持严格只读查询面（与 GitHub Copilot code review MCP 强制 readOnlyHint 同构）；⑤「远程 clone + 网络 + 本地 git 凭据使用」为首次授权事件清单中的一项。决策理由：atomcode 调研 2026-09-12 实证工业界事实标准 = 本地 checkout 后扫描（SonarQube 强制 full clone，shallow 使 blame/新代码检测失效；Semgrep CI = checkout→scan；TruffleHog = clone 到临时目录对抗恶意 git config）；远程桥接成熟范式收敛于 clone-to-local（repomix --remote / gitingest / TruffleHog）；托管拉取等同 SaaS 输入形态（CodeRabbit/Greptile 的 GitHub App + 中心化凭据），被 ADR-0003 排除；证据层 CodeLore live-clone 已内建远程能力，零新增组件。

Status: accepted
