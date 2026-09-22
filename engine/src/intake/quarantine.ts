// intake/quarantine.ts — 字段级病态 quarantine 契约层（ADR-0022 / D-103~D-120 / #78）
// 判定/处置硬分界（D-103③）：本模块只产出诊断——字段实例→三态＋reason_code＋raw 诊断结构，
// 永不 throw；null 置位/⚠印记/计数/恒等式/裁定全归消费面与报告层。
// 两级违约分流（D-100③）：协议级（行形状/分隔符/记录定界坏）仍由 intake.ts 契约 fail-fast；
// 本文件只管「记录定界成功但单字段值语义非法」的字段级病态。
import { createHash } from 'node:crypto';

// ---------- §1 reason_code 受控词表（D-104④ / D-110 / D-119） ----------
// 命名对齐 git fsck msg-id 风；v1 种子=仅有立法出处的四族，词表自带审计谱系：
//   anchor_head_date_malformed  —— D-105（锚点基数 1 病态率=100% 既有阈值自动触发）
//   normalized_tz_offset        —— D-112（+00:00→Z 合法改写留痕，不打 ⚠）
//   unclassified_field_anomaly  —— D-104②（已接线字段无法归类病态的兜底桶）
//   oversize                    —— D-117（raw_bytes 超界截断）
// open-ended：新码经 known-gaps→立法逐条进场；加码非破坏、删改破坏（schema 版本纪律）。
export const QUARANTINE_REASON_CODES: readonly string[] = [
  'anchor_head_date_malformed',
  'normalized_tz_offset',
  'unclassified_field_anomaly',
  'oversize'
];

export const QUARANTINE_DISPOSITIONS: readonly string[] = ['quarantined', 'normalized'];

export const REASON_ANCHOR_HEAD_DATE_MALFORMED = 'anchor_head_date_malformed';
export const REASON_NORMALIZED_TZ_OFFSET = 'normalized_tz_offset';
export const REASON_UNCLASSIFIED = 'unclassified_field_anomaly';
export const REASON_OVERSIZE = 'oversize';

// ---------- §2 接线字段名册（D-104①：本轮只给 %cI 接线） ----------
export const FIELD_COMMITTER_DATE = 'committer_date';
export const FIELD_HEAD_DATE = 'head_date';

// ---------- §3 raw_bytes 有界截断（D-117） ----------
// 上界校准：现有语料（6F/env-manager/anysearch-cli/jiahao/gsd-core ~8k commits）%cI 字段值
// 长度 ∈ {20,25} 字节（Z 形 / ±HH:MM 形）；64KiB=~2600× headroom，放宽-收口工序保守上界。
export const RAW_BYTES_CAP = 65536;

export interface RawFingerprint {
  raw_bytes_hex: string;
  is_trunc: boolean;
  original_length: number;
  sha256_full: string;
}

export function rawBytesFingerprint(raw: string): RawFingerprint {
  const buf = Buffer.from(raw, 'utf8');
  const truncated = buf.length > RAW_BYTES_CAP;
  const head = truncated ? buf.subarray(0, RAW_BYTES_CAP) : buf;
  return {
    raw_bytes_hex: head.toString('hex'),
    is_trunc: truncated,
    original_length: buf.length,
    sha256_full: createHash('sha256').update(buf).digest('hex')
  };
}

// ---------- §4 三态分类器（D-103①：契约层逐字段实例判定，永不 throw） ----------
export type FieldStatus = 'clean' | 'normalized' | 'quarantined';

export interface FieldClassification {
  status: FieldStatus;
  value: string | null;
  reason_code: string | null;
  raw: string;
}

// %cI 严格形状（秒精度）：与 intake.ts 既有契约同构——本模块自持正则使契约层自洽。
const GIT_ISO_STRICT_RE = /^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}(Z|[+-]\d{2}:\d{2})$/;

// anchor=true → 该字段实例是 HEAD 观测锚（headDate）：病态码=anchor_head_date_malformed（D-105）。
export function classifyGitIsoField(raw: string, opts?: { anchor?: boolean }): FieldClassification {
  const r = raw === undefined || raw === null ? '' : String(raw);
  if (Buffer.byteLength(r, 'utf8') > RAW_BYTES_CAP) {
    return { status: 'quarantined', value: null, reason_code: REASON_OVERSIZE, raw: r };
  }
  const trimmed = r.trim();
  const s = trimmed.replace(/\+00:00$/, 'Z');
  if (GIT_ISO_STRICT_RE.test(s)) {
    if (s !== trimmed) {
      return { status: 'normalized', value: s, reason_code: REASON_NORMALIZED_TZ_OFFSET, raw: r };
    }
    return { status: 'clean', value: s, reason_code: null, raw: r };
  }
  return {
    status: 'quarantined',
    value: null,
    reason_code: opts && opts.anchor ? REASON_ANCHOR_HEAD_DATE_MALFORMED : REASON_UNCLASSIFIED,
    raw: r
  };
}

// ---------- §5 字段处置事件（判定输出 → quarantine_log 台账行载体） ----------
export interface FieldEvent {
  commit_sha: string;
  field_name: string;
  disposition: 'quarantined' | 'normalized';
  reason_code: string;
  raw: string;
}

export interface FieldStat {
  field_name: string;
  total: number;
  clean: number;
  normalized: number;
  quarantined: number;
}

export function emptyFieldStat(fieldName: string): FieldStat {
  return { field_name: fieldName, total: 0, clean: 0, normalized: 0, quarantined: 0 };
}

// 逐字段实例记账：分类结果→三桶计数＋非 clean 事件（normalized 留痕不告警）。
export function recordFieldInstance(
  stat: FieldStat,
  events: FieldEvent[],
  cls: FieldClassification,
  commitSha: string,
  fieldName: string
): void {
  stat.total += 1;
  if (cls.status === 'clean') { stat.clean += 1; return; }
  if (cls.status === 'normalized') { stat.normalized += 1; } else { stat.quarantined += 1; }
  events.push({
    commit_sha: commitSha,
    field_name: fieldName,
    disposition: cls.status === 'normalized' ? 'normalized' : 'quarantined',
    reason_code: cls.reason_code as string,
    raw: cls.raw
  });
}

// ---------- §6 strict quarantine 门禁（D-110） ----------
// 仓级版本化常量基线：空基线=零容忍；改基线=PR 评审=「接受新病态族」显式裁定；
// 棘轮=只减不增（已消失码滞留=红）；UNCLASSIFIED 永不可进（default-deny）。
// flag/env 只传开关，基线内容恒读本常量（D-110④）。
export const ACCEPTED_REASON_CODES: readonly string[] = [];

export interface BaselineViolation { kind: string; detail: string }

export function baselineIssues(): string[] {
  const issues: string[] = [];
  const vocab = new Set(QUARANTINE_REASON_CODES);
  for (const c of ACCEPTED_REASON_CODES) {
    if (c === REASON_UNCLASSIFIED) { issues.push('baseline 禁载 unclassified_field_anomaly（D-110② 永不可进基线）'); }
    if (!vocab.has(c)) { issues.push('baseline 码越出词表：' + c); }
  }
  if (new Set(ACCEPTED_REASON_CODES).size !== ACCEPTED_REASON_CODES.length) { issues.push('baseline 重复条目'); }
  return issues;
}

// strict 闸门：返回违反基线的 reason_code 集（默认拒绝语义——不在基线即违规）。
export function strictQuarantineViolations(events: readonly FieldEvent[]): string[] {
  const baseline = new Set(ACCEPTED_REASON_CODES);
  const out: string[] = [];
  for (const e of events) {
    if (e.disposition !== 'quarantined') { continue; }
    if (!baseline.has(e.reason_code)) { out.push(e.reason_code); }
  }
  return out;
}

// ---------- §7 恒等式对账（D-100③ / D-116①：逐字段实例 grain） ----------
// total=clean+normalized+quarantined；且 quarantine_log 行数（normalized+quarantined）
// 必须等于 in-memory 非 clean 计数——两层对账的引擎内半层（独立半层=78-check）。
export interface IdentityIssue { field_name: string; detail: string }

export function intakeIdentityIssues(
  stats: readonly FieldStat[],
  dbCounts: Readonly<Record<string, { normalized: number; quarantined: number }>>
): IdentityIssue[] {
  const issues: IdentityIssue[] = [];
  for (const s of stats) {
    if (s.clean + s.normalized + s.quarantined !== s.total) {
      issues.push({ field_name: s.field_name, detail: '三桶合计≠total：' + s.clean + '+' + s.normalized + '+' + s.quarantined + '!=' + s.total });
    }
    const db = dbCounts[s.field_name] || { normalized: 0, quarantined: 0 };
    if (db.normalized !== s.normalized) {
      issues.push({ field_name: s.field_name, detail: 'normalized 库内 ' + db.normalized + '≠内存 ' + s.normalized });
    }
    if (db.quarantined !== s.quarantined) {
      issues.push({ field_name: s.field_name, detail: 'quarantined 库内 ' + db.quarantined + '≠内存 ' + s.quarantined });
    }
  }
  return issues;
}

// ---------- §8 裁定升级（D-100③ 阈值 / D-105 锚 / D-111 reason_class） ----------
// 单字段 quarantine 实例比例阈值：初值取保守默认 0.1%（实施期保守注记——后续可按观测校准；
// 锚字段基数 1 病态即 100% 自动超限=D-105 既有机制）。
export const QUARANTINE_FIELD_RATIO_RED = 0.001;

export type IntakeEscalation = 'none' | 'anchor' | 'threshold';

export function intakeEscalation(stats: readonly FieldStat[]): IntakeEscalation {
  let threshold = false;
  for (const s of stats) {
    if (s.quarantined === 0) { continue; }
    if (s.field_name === FIELD_HEAD_DATE) { return 'anchor'; }
    if (s.quarantined / s.total > QUARANTINE_FIELD_RATIO_RED) { threshold = true; }
  }
  return threshold ? 'threshold' : 'none';
}

export const VERDICT_REASON_CLASSES: readonly string[] = [
  'none',
  'evidence_insufficient',
  'anchor_malformed',
  'threshold_exceeded',
  'criteria_unsupported'
];

export function deriveReasonClass(band: string, escalation: IntakeEscalation): string {
  if (escalation === 'anchor') { return 'anchor_malformed'; }
  if (escalation === 'threshold') { return 'threshold_exceeded'; }
  if (band === 'insufficient') { return 'evidence_insufficient'; }
  if (band === 'unsupported') { return 'criteria_unsupported'; }
  return 'none';
}

// ---------- §9 崩溃桶工件（D-109：协议级崩溃固定 schema） ----------
export const CRASH_ARTIFACT_SCHEMA = 'quarantine-crash-artifact/v1';

export interface CrashContext {
  repo_ref: string | null;
  run_id: string | null;
  commit_sha: string | null;
}

export interface CrashCounts {
  commits_seen: number;
  facts_written: number;
  quarantined_written: number;
}

export interface CrashArtifact {
  schema: string;
  error_code: string;
  raw_bytes_hex: string;
  is_trunc: boolean;
  original_length: number;
  sha256_full: string;
  crash_location: string;
  run_context: CrashContext;
  counts: CrashCounts;
  at: string;
}

// 纯构造器——契约层不做 IO（写盘归 cli.ts / one-shot 脚本）。
export function buildCrashArtifact(args: {
  error_code: string;
  raw?: string | null;
  crash_location: string;
  run_context?: Partial<CrashContext>;
  counts?: Partial<CrashCounts>;
  at?: string;
}): CrashArtifact {
  const fp = rawBytesFingerprint(args.raw === undefined || args.raw === null ? '' : args.raw);
  const rc = args.run_context || {};
  const cn = args.counts || {};
  return {
    schema: CRASH_ARTIFACT_SCHEMA,
    error_code: args.error_code,
    raw_bytes_hex: fp.raw_bytes_hex,
    is_trunc: fp.is_trunc,
    original_length: fp.original_length,
    sha256_full: fp.sha256_full,
    crash_location: args.crash_location,
    run_context: {
      repo_ref: rc.repo_ref === undefined ? null : rc.repo_ref,
      run_id: rc.run_id === undefined ? null : rc.run_id,
      commit_sha: rc.commit_sha === undefined ? null : rc.commit_sha
    },
    counts: {
      commits_seen: cn.commits_seen === undefined ? 0 : cn.commits_seen,
      facts_written: cn.facts_written === undefined ? 0 : cn.facts_written,
      quarantined_written: cn.quarantined_written === undefined ? 0 : cn.quarantined_written
    },
    at: args.at || new Date().toISOString()
  };
}

// 协议级崩溃类错误：带 code+crash 载荷的 Error；消费面 catch 后据此落崩溃桶工件。
export const PROTOCOL_CRASH_CODES: readonly string[] = [
  'GITCLI-OUTPUT-CONTRACT',
  'GIT-PROBE-FAILED',
  'PROBE-INVARIANT-FAIL',
  'STRICT-QUARANTINE-VIOLATION',
  'QUARANTINE-CONSTRAINT',
  'REASON-CODE-UNLISTED',
  'INTAKE-IDENTITY-MISMATCH'
];

export interface ProtocolCrash extends Error {
  code: string;
  crash: {
    raw: string | null;
    crash_location: string;
    run_context: Partial<CrashContext>;
    counts: Partial<CrashCounts>;
  };
}

export function protocolCrashError(
  code: string,
  detail: string,
  crash: Partial<ProtocolCrash['crash']>
): ProtocolCrash {
  const e = new Error(code + ': ' + detail) as ProtocolCrash;
  e.code = code;
  e.crash = {
    raw: crash.raw === undefined ? null : crash.raw,
    crash_location: crash.crash_location === undefined ? 'unknown' : crash.crash_location,
    run_context: crash.run_context || {},
    counts: crash.counts || {}
  };
  return e;
}

export function isProtocolCrash(e: unknown): e is ProtocolCrash {
  return !!e && typeof e === 'object' && typeof (e as { code?: unknown }).code === 'string' &&
    PROTOCOL_CRASH_CODES.indexOf((e as { code: string }).code) >= 0 &&
    typeof (e as { crash?: unknown }).crash === 'object' && (e as { crash?: unknown }).crash !== null;
}

// ProtocolCrash → 崩溃桶工件（消费面一行收口；raw 缺失→空串指纹，指纹三件套恒在）。
export function crashArtifactFromError(e: ProtocolCrash, at?: string): CrashArtifact {
  return buildCrashArtifact({
    error_code: e.code,
    raw: e.crash.raw,
    crash_location: e.crash.crash_location,
    run_context: e.crash.run_context,
    counts: e.crash.counts,
    at: at
  });
}
