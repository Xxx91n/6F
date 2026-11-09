# Provenance（Agent Plugin 分发形态 / R2-04）

| 项 | 状态 | 说明 |
|---|---|---|
| license | ✅ | LICENSE（UNLICENSED / proprietary） |
| CHANGELOG | ✅ | CHANGELOG.md |
| 签名凭证（Sigstore / cosign keyless） | ⛔ 明确降级 | 还没做；等 CI release job 接入 cosign（GitHub Actions OIDC） |
| 构建来源（SLSA） | ⛔ 明确降级 | 还没做；SLSA provenance 生成等 CI release 阶段 |
| receipt 协议字段 | ✅ 声明 | manifest.meta.json.receipt.fields（evidence_refs / verdict / offline_verifiable / issued_by / issued_at）；运行时生成还没做 |

> 降级说明：签名和 SLSA 是这一轮没做的项，明确标成降级（不是悄悄缺了不说）。
