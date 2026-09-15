# Changelog

All notable changes to this project are documented here.
Format: Keep a Changelog (keepachangelog.com). Versioning: SemVer.

> 仓级里程碑/决策编年见仓根 `CHANGELOG.md`（里程碑编年指针制，本账为产品版本账唯一权威；仓根实体已于 #41a 落盘——D-039② 指针闭环）。

## [Unreleased]
### Added
- `upstream-lock.yaml` 机读权威上游锁定表（D-037③ / ADR-0018 §D-1 / docs/versioning.md §3；#44/A-049）：种子行 codelore=active exact-version 0.28.0＋`--version` pin 契约／duckdb-node-api=active（package-lock 精确锁定）／git-cli=active（随宿主环境·输出解析为契约）／openssf-scorecard·repomix-gitingest=planned／codelore-sqlite-dump=evaluating（risk_note）；禁 range/浮动 tag/latest，retired 行不删，更新走手动窗口＋golden 回归

## [0.1.0] - 2026-09-12
### Added
- Walking skeleton: Agent Plugin 五层盒子（plugin.json / mcp.json / skills / extensions / kernel CLI）
- 双 manifest 单一元数据源生成（manifest.meta.json -> plugin.json + .claude-plugin/plugin.json），含防漂移校验（先比后写）
- kernel CLI（--version / selftest / mcp stub / --help）
- smoke 测活测试 + CI matrix（ubuntu/windows/macos × node 20/22），workflow 位于仓根（paths: engine/**）
- provenance：LICENSE / CHANGELOG / PROVENANCE.md
