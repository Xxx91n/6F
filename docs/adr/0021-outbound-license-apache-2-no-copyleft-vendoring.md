# ADR-0021: 出站 license = Apache-2.0；copyleft 上游禁 vendor 入分发物

- Status: accepted
- Date: 2026-09-16
- Deciders: 用户（grill 轮 11 Q4，上游 license 审计后拍板「Apache-2.0」）
- Ledger: D-051（current）；承 ADR-0016（分发通道）／ADR-0014（上游双轨＋vendor 逃生舱）

## Context

仓已公开但 license 字段为 UNLICENSED（保留所有权利），与上架目的自相矛盾。上游 license 审计：唯一 copyleft 上游 codelore（GPL-3.0-only）与 git（GPL-2.0）均为「用户自装＋独立进程 exec」形态——FSF 口径属 mere aggregation / at arm's length，不传染出站；duckdb=MIT、gh=MIT、planned scorecard=Apache-2.0、repomix=MIT。MIT 与 Apache-2.0 在上游兼容性上打平，差别在别处。

## Decision

- 出站 license = **Apache-2.0**（engine/LICENSE 全文已换，manifest.meta.json/plugin.json/package.json/marketplace.json license 字段同步）；
- 选择理由：专利授权＋专利报复条款降低企业采用摩擦（审计产品目标用户即企业）；商标条款保护 listing 名；与 planned Apache-2.0 上游（scorecard 若 lib 化接入）同族；
- **copyleft 上游（codelore/git 等）永不得 vendor 进分发物**——tgz 内嵌其二进制即触发 GPL 传染整个分发物；binary-discovery（PATH 探测＋用户自装）形态本身是防线。

## Considered Options

- MIT——可行但少专利条款与商标保护；企业向场景 Apache-2.0 义务不更重；
- 双许可/其他 SPDX——无收益需求，徒增复杂度。

## Consequences

- golden cassette 装的是 GPL 工具输出（GPL 输出不携带 GPL），适配器为原创代码——合规链闭合；
- vendor 逃生舱（ADR-0014）条款对 copyleft 上游自动失效——ADR-0014 逃生舱仅适用于非 copyleft 上游；
- B 轨官方目录提交仍未授权，license 已定不解除该闸门。
