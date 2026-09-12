# Provenance（per ADR-0008 / R2-04）

| 项 | 状态 | 说明 |
|---|---|---|
| license | ✅ | LICENSE（UNLICENSED / proprietary） |
| CHANGELOG | ✅ | CHANGELOG.md |
| 签名收据（Sigstore / cosign keyless） | ⛔ 显式降级 | 未实现；待 CI release job 接入 cosign（GitHub Actions OIDC） |
| 构建来源（SLSA） | ⛔ 显式降级 | 未实现；SLSA provenance 生成待 CI release 阶段 |
| receipt 协议字段 | ✅ 声明 | manifest.meta.json.receipt.fields（evidence_refs / verdict / offline_verifiable / issued_by / issued_at）；运行时出具待实现 |

> 降级声明：签名与 SLSA 属本轮未实现项，显式标注为降级（非沉默缺失）。
