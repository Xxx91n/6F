# ADR-0023: Micro-B 文件级审计卡——预采集投影×per-file subject×血缘事实

- Status: accepted
- Date: 2026-09-23
- Deciders: 用户（grill 轮 30 Q1~Q7，逐问 atomcode 深调研后拍板「采纳」×7）
- Ledger: D-121~D-127（全 current）；承 D-028（cross-scale correlation key）／D-053/D-058（叙事双轨）／D-084（权重纪律）／D-095（closed 枚举纪律）／ADR-0014（corrosion boundary）／ADR-0022（raw 证据分层同族）

## Context

Micro-B=五尺度铺开序第四格（Macro-C→Micro-A→Micro-B→Macro-A，Macro-A 最后因跨仓接入与战略聚合面最重——D-121）。文件级审计卡须同时裁七个面：触发×采集模型、卡内容契约、事实存储 grain、文件身份、查询语义、票面形态。工业先例（SonarQube components/measures 逐文件行、CodeScene code-health+hotspot 双派生、SCIP relative_path 规范化与 canonicalize→hash、Databricks medallion 分层、XTDB/Datomic bitemporal、GitHub/Azure/Google preview 条款）一致指向：per-file 一等事实＋读模型投影＋确定性派生＋宿主叙事分层。本 ADR 总成轮 30 七裁。

## Decision

**触发×采集（D-122）**
- 文件卡=DuckDB 读模型投影；文件级事实随仓级确定性采集预发；lazy 补采仅走 CLI（同构发射管线），MCP 面永不写（miss→not_collected 显式态+CLI 指引）；
- 双触发面=MCP 文件卡 tool＋CLI audit file 子命令（签名/命令形态票面裁）；宿主 IDE/LSP hooks=独立可选集成面不直连数据面；
- 卡披露四件：HEAD 锚/advisory:true/每指标 SSOT fact_ref 可复现来源/prefetch-vs-backfill 来源标注。

**卡契约三层（D-123）**
- kernel 数据层=已契约实体面逐字段直投+citation 锚（obs_at/fact_ref）；kernel 派生层仅确定性可复算值（priority_band 规则带版本号如 hotspot_priority_v1／percentile_rank scope=repo／top_n_flag），每项带 derivation 溯源；**禁 A-E/GPA 字母判语形态**（业界绑定门禁语义）；宿主叙事层零指标值纪律（只引用 kernel 已算值）+citation 校验验指标键存在性；
- advisory 机械隔离=卡 schema 无 verdict/gate-consumable 字段（结构性隔离）＋advisory:true 显式字段＋priority 语义=排序非判定＋规则版本随卡发布；
- 失败三态：new_file/insufficient_history=显式态仅静态指标；binary/generated→card_type:not_applicable 不出空卡；指标集=closed 契约物（配置仅调阈值/规则参数）。

**事实 grain（D-124）**
- 采集时逐 path 发射 subject_ref=<file path> 一等事实（fact_id 哈希精确到文件，append-only 去重幂等零改动）；
- facet_rows 聚合载荷转 raw 证据位（append-only 保留+role=raw_evidence 标记票面裁），不进卡查询主路径，供重建/争议仲裁/面级历史对照——与 quarantine raw_bytes（D-117）同族；Macro-B behavior 消费面迁移=票面 impl 项不新增事实表；
- lazy 补采=与批量完全相同的 per-file 发射管线（同 grain 同 fact_id 规则）——lazy 是发射时机非 grain/身份决策。

**文件身份（D-125）**
- subject_ref=SCIP 式规范化形：仓根相对/`/` 分隔（含 Windows）/无 `//` `.` `..` 空段/Unicode NFC 适配层显式归一（不依赖 git config）/指向 regular file（symlink 解析或显式跳过披露）；**禁大小写折叠**（case-only 冲突=真实不同文件，Windows 宿主检测+告警）；归一单点在发射边界；
- file_renamed{from,to,head_sha,threshold,detector_version} 血缘一等事实：检测参数入载荷可复算；卡投影沿血缘链缝合跨改名历史；漏判=诚实分裂不编造；跨 git 版本可复算性=票面验证项。

**查询语义（D-126）**
- 默认=最新已采集观测集；at:<sha>=显式 opt-in pin（常量禁自动派生——SQL:2011 AS OF 仅常量纪律）；不实现强制 HEAD 匹配；
- staleness=observed_head_sha+current_head_sha/drift 双字段披露照答不拒答；pin 时披露 pin 是否等于观测集 head_sha；
- miss 四类显式态：never_collected（可行动指引）/not_tracked_at_sha/not_applicable（合法空值非 miss）/renamed_to（血缘存在→跳转+逐请求重验证；无血缘→降级 not_tracked）；
- 补采唯一粒度=当前 HEAD 仓级管线重跑产新观测集 append 非覆盖；资格检查=目标 SHA 对象库可达；脏工作区零影响零感知；at:sha 实现=path/血缘按查询时点解析、事实按 pinned sha 取值（双引用层分离）。

**票面形态（D-127，=#80）**
- 单票闭环（合并与验收一票裁决），内部三步 stacked-diff 各独立绿：①发射改造+fixture golden（facet_rows↔per-file 对照期对账判据——BbA 双实现共存先例）②投影+查询语义③双仓实跑+边界件+披露；
- 试点=形态三角：jiahao（人类密集）+env-manager（历史厚+机器密集），anysearch-cli 留校准对照位可选；票面写「试点集」不写「覆盖面」；
- 边界件 0-switch 逐类点名（miss 四类+insufficient_history 每类≥1 实物）+renamed_to 1-switch 成对件（miss→renamed_to→跳转命中/二次 miss）；benchmark=p95 分档+target/danger 双阈值（沿用 r12-wave-a 语法）+机器可裁决三件套（阈值+脚本+原始数工件），数值实跑预登记；
- 披露四件套：preview 标注（capability N of 5）+advisory 性质+同主确认偏差+not_in_preview 清单；golden 锁卡 schema 字段骨架非内容值；能力矩阵措辞收窄同票；退路 C 在案（infra 先行=D-038 fixture golden 判据+schema 冻结点显式立法）。

## Rejected

- 全 on-demand git log --follow 计算（违确定性 HEAD 快照章程）／宿主 hooks 采集权威（权限面出 kernel）；
- 纯原始指标投影（零派生=派生挪进宿主 LLM 不可复现）／A-E/GPA 字母判语形态（业界绑定门禁语义——裁决力在消费面不在值形态，故结构性隔离）；
- 聚合载荷投影切片当一等事实（fact_id 落面级致 append-only 去重失效+JSON 行定位符脆弱=provenance 断链）／聚合+per-file 双写皆一等（dual-write 反模式）／lazy 升格两阶段身份（撞 append-only 审计语义）；
- 内容身份 blob hash 链（同内容碰撞+rename+edit 断）／上游语义继承（corrosion boundary 失守）／大小写折叠（CVE 事故先例）／血缘进身份本体；
- stale 拒答（零先例）／miss 单态二分（混淆未采集与合法空）／renamed_to 无条件跳转（301 难回滚教训）／worktree 感知（无 git 观测时点）；
- 最小票面边界件后补（latent codepath+invalid 态裸奔）／搭车 #51（判据语义不重合）／单仓试点（丢形态三角角位）／均值或单全局延迟阈值（右偏分布均值撒谎）／小试点称「覆盖面」。

## Consequences

- 文件成一等 subject：D-028 cross-scale correlation key 获文件级载体；per-file SQL/文件级历史追踪/增量补采（SCIP 先例）解锁；
- facet_rows 降 raw 证据层：Macro-B behavior 消费面迁移为 #80 步①内 impl 项；
- 残余 impl 参数全随 #80 票面收口：value_json 形态/role 标记机制/万级行数实测／priority 阈值+分位 scope+指标键字典／rename 阈值定值+case 告警落点+symlink 细则+跨版本可复算验证／miss 字段命名+drift 形态+并发去抖／benchmark 数值预登记；
- R28-Q19 完整性复核债仍挂账（D-121⑤ 登记）；
- 调研档案 R30-Q1~Q7 全存档 .scratch/macro-audit/reports/。
