# 10: Cross-scale correlation key

**A-xxx covered:** A-010
**Spec ref:** [spec.md](spec.md) §Decision 5.4

**What to build:**
fact table schema 前置字段 trace_id / baggage_id + OpenTelemetry Baggage 集成方案

**Blocked by:**
None (can start immediately)

**Status:** done

- [x] 字段必须在 fact table schema 里（不能"另起表"）
- [x] OTel 集成要选语言栈契合度最高的 SDK
- [x] 1) trace_id / baggage_id 字段定义（类型 / 长度 / 来源）；2) OpenTelemetry SDK 集成清单（哪些 scale 用哪个 SDK）；3) 跨 scale 查询示例 SQL