# Changelog

All notable changes to this project are documented here.
Format: Keep a Changelog (keepachangelog.com). Versioning: SemVer.

> 仓级里程碑/决策编年见仓根 `CHANGELOG.md`（里程碑编年指针制，本账为产品版本账唯一权威；仓根实体已于 #41a 落盘——D-039② 指针闭环）。

## [Unreleased]

### Changed
- upstream-lock repomix-gitingest planned→retired（D-056：宿主 agent 恒在抽空打包用途；retired 行留档＋重开触发器 registry repomix-reopen-trigger）
- 插件对外名 macro-audit → `6f`（D-052；双 manifest 由 manifest.meta.json 单源再生成）；license UNLICENSED → Apache-2.0（D-051/ADR-0021，LICENSE 换文）

### Added
- #50 叙事双轨落地（D-053/D-057④/A-057）：`src/report/narrative.ts`（sealNarrative 三态盖章 sealed/sealed-with-gaps/rejected＋BAND_PATTERNS band 红线机检＋model_id 必录＋renderTemplateNarrative degraded 兜底）＋`src/fact/projection.ts`＋cli `mcp facts` 只读投影（固定 SELECT 形/READ_ONLY 实例/参数绑定/limit≤500——宿主 agent 叙事面取数主路）＋generate.ts 叙事段接入（narrative_sections→C2 渲染＋侧车＋degradeReport 模板注入）＋skills/macro-audit/references/ 三件＋SKILL.md 加载条件节；test/narrative.test.mjs 25 断言入 smoke；R2-Q7 违规 #4（frontmatter）/#5（rubric 产物缺）闭环
- manifest author/homepage/repository 字段（D-052；gen-manifests 透传扩展）；upstream-lock github-rest planned 行（kind=remote-api，D-048/#47）
- #47 托管平台 API 适配器（D-048/ADR-0020，A-055）：`src/upstream/github-rest.ts`——GitHub REST 直连主路＋`X-GitHub-Api-Version` pin（2022-11-28）＋凭据三级探测（`GITHUB_TOKEN` env → gh 已认证态只读借读 → 无认证 60/hr 显式降级，即用即清不建存储）＋PR 枚举/元数据/diff 双通道（本地 git `base...head` 优先，REST diff 兜底）＋`x-ratelimit-*`+`Retry-After` 有界退避触顶即停＋余额写事实库；golden cassette×5 离线回放（authenticated/无认证降级=env-manager 实录制；限流耗尽=按官方语义合成；schema 漂移/平台 Bot=实录制派生）；锁表 `github-rest` planned→active（upstream-lock.yaml）
### Added
- `upstream-lock.yaml` 机读权威上游锁定表（D-037③ / ADR-0018 §D-1 / docs/versioning.md §3；#44/A-049）：种子行 codelore=active exact-version 0.28.0＋`--version` pin 契约／duckdb-node-api=active（package-lock 精确锁定）／git-cli=active（随宿主环境·输出解析为契约）／openssf-scorecard·repomix-gitingest=planned／codelore-sqlite-dump=evaluating（risk_note）；禁 range/浮动 tag/latest，retired 行不删，更新走手动窗口＋golden 回归

## [0.1.0] - 2026-09-12
### Added
- Walking skeleton: Agent Plugin 五层盒子（plugin.json / mcp.json / skills / extensions / kernel CLI）
- 双 manifest 单一元数据源生成（manifest.meta.json -> plugin.json + .claude-plugin/plugin.json），含防漂移校验（先比后写）
- kernel CLI（--version / selftest / mcp stub / --help）
- smoke 测活测试 + CI matrix（ubuntu/windows/macos × node 20/22），workflow 位于仓根（paths: engine/**）
- provenance：LICENSE / CHANGELOG / PROVENANCE.md
