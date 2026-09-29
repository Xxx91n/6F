# R48-Q1 调研题面 —— CI workflow 静默死亡处置包＋防再发哨兵归位裁量（macro-b-regression.yml 实证）

（提交 atomcode-research 深调研；账本=唯一事实源立场，调研须回顾 decision-ledger 全部 current 记录、docs/adr、CONTEXT.md 词条、工业界成熟落地心智模型为重点。）

## 背景

本仓为五尺度工程内容审计产品（Macro-A/B/C + Micro-A/B）的 spec-level 规划+治理仓。CI 面三条 workflow：engine-ci（PR/push 门禁）、golden-ci（golden 回归）、macro-b-regression.yml（schedule 每周一 03:17 UTC＋workflow_dispatch——D-046④「Macro-B 定时回归」承载件，默认四仓 matrix：jiahao/git/django/spring-boot）。

## 缝的实证

macro-b-regression.yml 自 commit c5feac1a（2026-09-23，#78 quarantine 批）起静默死亡 ≈6 天：L144 step 名 `- name: verify report artifacts (three-check: present + ...)`——未加引号的 YAML 标量内含 `three-check: `（冒号+空格），yaml.safe_load 报 "mapping values are not allowed here" @144:51。GitHub 侧签名全对上：workflow name 退化为文件路径（API 返回 name=.github/workflows/macro-b-regression.yml 而非声明名 macro-b-regression=解析失败标志）、每次 push 产 0s "workflow file issue" failure 记录、无 job 生成。schedule 触发器在文件无效态下不注册——定时回归实际零覆盖期 ≈6 天且延续中。

守卫盲区实证：本仓 46/39/49-check 对该 yml 全是 text 级 indexOf 断言（文件存在＋目标字符串在场即绿），从不断言 YAML 可解析——语法级病态在机检面无闸，缺陷带绿通过全部守卫。finding 分级按 D-173 口径=能力面（被信为活的回归机制实为死基建）。

## 候选

(i) 修＋哨兵归 registry manual_watch：一行修（name 引号包裹或去冒号）＋新册项 ci-workflow-liveness-watch（T3 窗 gh workflow list 检 name≠path 退化态＋gh run list 检 0s 败迹；manual_watch 五要件齐备）。利=修复零依赖＋哨兵走已建制先例；弊=依赖 gh 认证环境。
(ii) 修＋guard 断言建制：一行修＋46-check 增「.github/workflows/*.yml YAML 可解析」断言。利=机检面真闸；弊=Node 无内建 YAML 解析器——引依赖动 engine package 面／手写结构检查覆盖弱；且本地 YAML 合法≠Actions schema 合法（本案恰为纯 YAML 层错误，本地解析可拦）。
(iii) 修＋双轨：一行修＋最小本地结构闸（不引依赖：断言已知病态模式如未引号 name 标量含 ': '，或用既有依赖中的 yaml 解析器若在场）＋registry manual_watch 哨兵兜底 GitHub 侧失效形态（本地断言拦不住 Actions 解析面漂移）。
(iv) 只修不哨：一行修＋复原实证（push 后 run 名恢复声明名）；哨兵不建，依赖 T3 例行人工随读。利=最薄；弊=同型静默死亡无防再发建制，与仓内「finding→哨兵」惯例不对称。

## 调研要求

1. 工业界成熟心智模型（重点）：CI workflow/配置文件验证的成熟落地惯例（actionlint 生态位、pre-commit/CI 内 schema 校验、GitHub 官方对无效 workflow 的处理语义）；「静默死亡基础设施」检测心智模型——定时任务/告警管线/回归机制的 liveness 监控（dead man's switch、heartbeat、watchdog、observability of the observers）；配置文件的 text-level 断言 vs parse-level/schema-level 断言分档惯例；修复+哨兵捆绑 vs 分离的组织惯例。
2. 判候选：四候选各评强弱——特别裁决：①哨兵归 registry 人工节律（manual_watch）vs 归机检面（guard 断言）的分档判据（「验证成本×失效频率×检测时延容忍」心智模型）；②Node 生态下 CI yml 本地校验的现实选项排序（actionlint 二进制/npx、yaml 包解析、手写结构闸）各自代价与覆盖边界；③「被信为活的机制实死」类发现处置后是否惯例性强制配防再发哨兵。
3. 冲突扫描：结论是否与本仓 current 决策冲突（重点 D-046④ Macro-B CI 定时回归语义、D-175 等待期工作面序〔(b) 已触发欠账清零第一优先〕、D-173 finding 来源分级、D-147 探测面修语义预声明验证包工序、D-155 manual_watch 五要件、D-171 事件制/到期二分、D-139/D-140② 语义/生成物分 commit、D-135 票面纪律）。
4. 推荐+理由+置信度；缺口如实标位（无一手公开材料即声明推断级）。
