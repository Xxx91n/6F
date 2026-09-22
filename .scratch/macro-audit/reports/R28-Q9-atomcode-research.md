# R28-Q9 atomcode 调研存档（ctx_batch_execute 输出整理）

> 2026-09-22 轮28 grill Q9：「verdict 机读载体与 exit code 契约」——三面投影两轴正交 vs 专用退出码 vs 落库 vs 仅人读。
> 题面存档：R28-Q9-research-prompt.md。执行：atomcode -p 串行单发（94 行/14.8KB/10 索引节）。
> Sufficiency Gate：ESLint/trivy/gitleaks/conftest/SARIF/OTel/Eventuous 官方档+issue 史多源交叉，每关键结论≥2 独立信源，置信高。

## 1) 执行摘要

**推荐 (a′)「两轴正交」保留，但 exit 0 语义收窄为「管线完成」且消费面强制 default-deny**：verdict 作纯推导量以机读块落报告+receipt+--json 三面同源投影（不落库），exit code 恒 0=跑完、非零仅协议崩溃/IO/strict 基线崩。**核心修正**：业界真实反例（trivy --exit-code 过载、gitleaks「leaks or error 同码」史、trivy k8s 扫描失败 exit 0）证明「exit code 坍一维」的诱惑是真实坑，但解法从不是把裁定塞回 exit code，而是**消费面把「exit 0+verdict≠pass」显式当红**——CI 腿必须解析 verdict 字段并 default-deny（缺字段=红）。

## 2) 分点结论

**① exit code 惯例事实上=「裁定进数据字段、执行成败进 exit code」，多值分流被反复尝试又反复被否。** ESLint 0/1/2（1=裁定+阈值、2=故障）是最接近多值分流的成功先例但 1/2 区分本身是 #9384 争议十年的痛改；gitleaks「1=leaks or error」混码被 #478 实锤抱怨（tests passing because of an error），社区解法退到 --exit-code 可配置+报告字段非更细枚举；trivy 默认漏洞也 exit 0（裁定进 JSON）、#7915 自认 --exit-code 过载拆不动（向后兼容）、k8s #3487 扫描失败 exit 0 修复方向=修执行轴非给裁定加码。**映射：exit code 可信语义只有两档=跑完了/跑崩了**；verdict 是审计投影非 CLI 执行目标，塞进 exit code=trivy #7915 复刻起点。

**② 审计/报告工具裁定承载面=结构化数据，exit code 只做粗筛。** conftest：executionSuccessful:true 与 exitCode:1+exitCodeDescription 同发——SARIF 规范本身就要求执行成功与否与裁定结果分两个字段（executionSuccessful vs results[].level/kind）=两轴正交最权威规范级先例。

**③ 第三态成熟表达=带 kind 的结构化结果+消费端提升严重级，不是分配神秘退出码。** SARIF kind:"open"=工具信息不足、"review"=需人审，viewer 端提为 warning（effectiveLevel 源码）——严重级是消费端策略非 schema 语义；OTel Span Status Unset/Ok/Error：HTTP 2xx 必须 Unset（默认从严：未声明错误≠好），issue #3685「库不应设 Ok」；健康检查 UNKNOWN=200（K8s readiness unknown 不当绿）——传输层成功≠裁定为好；reason_class 受控词表与 SARIF kind 小枚举+conftest exceptions 计数进机读行同构。

**④ verdict 不落库=CQRS/ES 教科书边界。** Eventuous：read model=从事件投影的查询态与事件存储分离；quarantine_log=事件流、verdict=阈值规则聚合投影——投影到报告非写回事件存储；派生量落回 SSOT=投影 bug 污染唯一真相源（stale projection double-spending 同构风险）。verdict 逐运行 grain 写进报告机读块=投影自然落点，不需要也不应有 runs/verdict 表。

**⑤ 辩证处：(a) 的「exit 0 含 unsupported」漏报风险真实——业界解药=default-deny 消费面，本仓有现成补救位。** 漏报实锤：gitleaks #478、trivy k8s #3487。业界三解法：消费端强制 schema 解析（ESLint --max-warnings=阈值规则抬为执行失败）／可配置裁定抬升（trivy/gitleaks --exit-code opt-in）／default-deny 消费契约（K8s readiness/OTel Unset）。本仓独有优势=D-105「非成功终点须告警」+D-110 strict 基线棘轮已在——**CI 回归腿升级为 default-deny 三查：exit==0∧JSON 可解析∧verdict 字段存在且枚举合法，任一不满足=红**；strict 模式下 verdict≠supported∧reason_class∉基线→走 D-110 既有门禁失败路径。漏报面被两条既有建制夹死无需新 exit code。

## 3) 对比矩阵

| 项 | exit code 语义 | 裁定承载面 | 第三态表达 | 风险 | 判定 |
|---|---|---|---|---|---|
| (a) 三面投影+两轴正交 | 0=跑完；非零=执行故障 | 报告机读块+receipt+--json | SARIF open/OTel Unset 同构 | 漏报风险→default-deny CI 腿解 | 采纳（修正 (a′)） |
| (b) unsupported→专用码 | 0/1/3 多档 | exit code 混裁定 | 靠码值区分 | trivy #7915 过载/gitleaks #478 混码/eslint 1/2 争议十年 | 否决：正交轴坍一维且演进必过载 |
| (c) verdict 落库 | 同 (a) | SSOT 落库 | 表列 | 派生态回写 SSOT=投影 bug 污染真相源 | 否决：违 D-106 |
| (d) 仅人读报告 | 同 (a) | 人读节 | 无机读槽 | 违 D-105③ | 否决 |

## 4) 推荐最终形态 (a′)

1. exit code：0=管线完成（三态都算跑完）；非零仅三类=协议崩溃（D-109 附工件）/IO 失败/strict 门禁崩（D-110 结构化 stderr）；
2. verdict 载体：报告机读块+receipt 判定字段+--json 三面同源投影——verdict（supported/unsupported/insufficient）+reason_class（受控词表：evidence_insufficient/anchor_malformed/threshold_exceeded/…）不落库；
3. CI 回归腿 default-deny 三查：exit==0∧JSON 可解析∧verdict 字段存在且枚举合法——任一不满足=红；strict 模式叠加 verdict≠supported∧reason_class∉基线→D-110 门禁路径；
4. 语义注记：unsupported/insufficient 消费面默认按红/黄处理永不默认绿（OTel Unset「未声明≠健康」）。

## 5) 冲突核查

D-105（机读 verdict+reason class+两轴）=(a′) 直接实现；D-106（投影纪律）=(c) 被其直接否决；D-109/D-110=exit 非零枚举完全同构无冲突；CONTEXT Receipt 词条=verdict 进 receipt 判定字段即「携带判定结果可离线复核」落地。**零 revised**。

## 6) 来源清单

ESLint CLI Reference（0/1/2 三档）+issue #9384；Trivy 官方档+#7915+#3487；gitleaks README+#478；conftest 官方 Options+SARIF 样例；SARIF 2.1.0 schema（kind 六枚举+toolException）；sarif-tutorials+sarif-vscode-extension effectiveLevel 源码；OTel semconv HTTP spans+issue #3685；Eventuous read models 官方博客。

## 7) 信息缺口

inspec compliance report 未单独开原文（Tavily 超额）但其裁定面与 SARIF 同构不影响方向；(b)「专用码如 3」未找到任何主流工具把第三态审计裁定（非故障）映射为专用 exit code 的正面先例——缺席证据非存在反证，小众先例不改变方向。
