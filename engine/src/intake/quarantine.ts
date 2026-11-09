// intake/quarantine.ts — 字段异常隔离层（协议级错误立即中断 / 字段级异常隔离记录；D-103~D-120 / #78）
// 协议级错误直接报错中断，字段级异常放入隔离区记录，判定和处理两件事严格分开。
// 判定与处理严格分开（D-103③）：本模块只负责给出诊断结果 —— 把字段实例转为三种状态之一 ＋ reason_code ＋ raw 原始诊断结构，
// 本身绝不抛出异常；置 null、标记警告标、计数统计、数量核对、最终判定等全部交给后续使用方和报告层处理。
// 两级错误分流处理（D-100③）：协议级错误（如行格式破坏、分隔符丢失、整条记录边界混乱）仍然在 intake.ts 处直接中断报错；
// 本文件只负责处理「整条记录成功切分，但单个字段取值非法」的字段级异常。
import { createHash } from 'node:crypto';

// ---------- §1 reason_code 受控词表（D-104④ / D-110 / D-119） ----------
// 命名对齐 git fsck msg-id 风格；首期包含有来源出处的四类规则，词表自带审计谱系：
//   anchor_head_date_malformed  —— D-105（锚点仅有 1 个，异常率达到 100% 自动触发超限判定）
//   normalized_tz_offset        —— D-112（+00:00 转换为 Z 的合法改写记录，不打警告标）；#81 起 dormant 保留 ——
//                                 在实际执行流程的边界层先行统一转换（见 §4b），本错误码仅用于多层防御（D-128③ 裁定）
//   unclassified_field_anomaly  —— D-104②（已支持检查的字段出现未知异常时的保底分类）
//   oversize                    —— D-117（raw_bytes 长度超界截断）
// 开放式规则：新错误码通过缺口登记和评估后逐条引入；增加错误码不影响已有格式，修改或删除属于破坏性改动（遵循版本规范）。
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

// ---------- §2 已接线字段名册（D-104①：本轮只给 %cI 接线） ----------
export const FIELD_COMMITTER_DATE = 'committer_date';
export const FIELD_HEAD_DATE = 'head_date';

// ---------- §3 raw_bytes 长度上限与截断（D-117） ----------
// 上限标准：根据已有样本（6F/env-manager/anysearch-cli/jiahao/gsd-core 约 8000 个提交）%cI 字段长度
// 通常在 20 或 25 字节（Z 结尾或 ±HH:MM 格式）；64KiB 提供了约 2600 倍的安全裕量，作为稳妥的截断上限。
export const RAW_BYTES_CAP = 65536;

// 展示层 raw_echo 截断长度（D-117② 防止对不上：截断逻辑单处共享 ——
// 报告、度量和演示三处使用方统一读取本常量，禁止各自硬编码重复写死）。
export const RAW_ECHO_CAP = 80;

// 严格隔离检查的开关通道常量（D-110④：命令行参数 > 环境变量 > 文件的优先级顺序，
// 环境变量和参数只传递开关联，基线内容始终读取仓内版本化常量 ACCEPTED_REASON_CODES，防止环境变量传入不同基线造成检验走样）。
export const STRICT_QUARANTINE_ENV = 'MACRO_AUDIT_STRICT_QUARANTINE';

// 展示层截断公用函数（D-117②）：raw_echo 为 JSON 序列化后不超过 80 字符的字符串 ——
// 函数与常量统一导出，各调用方无需重复实现（audit.ts、demo.ts、measurements 三处共用）。
export function rawEcho(raw: string): string {
  return JSON.stringify(raw.length > RAW_ECHO_CAP ? raw.slice(0, RAW_ECHO_CAP) + '…' : raw);
}
// 开关优先级计算：如果命令行给出了明确参数，以参数为准（包括明确传入 --no-strict-quarantine 关掉）；
// 未给参数时，环境变量等于 '1' 开启；都没有时默认为关闭。
export function strictQuarantineEnabled(flag: boolean | undefined, envValue: string | undefined): boolean {
  if (flag !== undefined) { return flag; }
  return envValue === '1';
}

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

// ---------- §4 三种状态分类器（D-103①：针对每个字段实例逐一判定，绝不抛出异常） ----------
export type FieldStatus = 'clean' | 'normalized' | 'quarantined';

export interface FieldClassification {
  status: FieldStatus;
  value: string | null;
  reason_code: string | null;
  raw: string;
}

// %cI 严格时间格式（秒级精度）：与 intake.ts 的要求完全一致 —— 本模块自持正则表达式保持规则单处自洽。
const GIT_ISO_STRICT_RE = /^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}(Z|[+-]\d{2}:\d{2})$/;

// anchor=true 表示该字段实例是 HEAD 观测锚点（headDate）：异常代码为 anchor_head_date_malformed（D-105）。
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

// ---------- §4b 工具版本拼写差异统一转换（D-128 / #81） ----------
// 概念区分：工具拼写差异（由于上游工具版本不同产生的等价拼写差异 —— 例如 RFC 3339 等价格式，
// 实际代表的时间值并没有变）并不等于数据本身有问题（比如审计对象本身真实数据损坏）。前者由适配边界层统一吸收转换，
// 真正的数据损坏才记录到异常字段统计中 —— 在数据入口处先完成统一规整，分类器只接收规范流。
// 转换规则名册 GIT_ISO_DIALECT_RULES：当前仅有时区偏移这一种（git 2.45 之前 %cI 输出 +00:00，
// 2.45 及以后输出 Z）；后续新增规则按评估流程引入，禁止通过写死某个 git 版本来逃避格式统一。
export interface GitIsoDialectRule {
  rule_id: string;
  match: RegExp;
  canonical: string;
}
export const GIT_ISO_DIALECT_RULES: readonly GitIsoDialectRule[] = [
  { rule_id: 'tz_offset/+00:00→Z', match: /\+00:00$/, canonical: 'Z' }
];

export interface DialectAbsorption {
  rule_id: string;
  raw: string;
  canonical: string;
}

// 边界转换器为确定性纯函数：逐条匹配规则，命中则返回标准格式及转换记录对象；未命中则原样返回。
// 工具版本差异的转换不属于字段损坏异常（不计入 FieldEvent、quarantine_log 或入口健康度统计），走单独的说明通道披露（D-128④）。
export function absorbGitIsoDialect(raw: string): { value: string; absorption: DialectAbsorption | null } {
  const s = raw === undefined || raw === null ? '' : String(raw);
  for (const rule of GIT_ISO_DIALECT_RULES) {
    if (rule.match.test(s)) {
      const v = s.replace(rule.match, rule.canonical);
      if (v !== s) { return { value: v, absorption: { rule_id: rule.rule_id, raw: s, canonical: v } }; }
    }
  }
  return { value: s, absorption: null };
}

// ---------- §5 字段处理事件（判定结果输出并写入 quarantine_log 记录表） ----------
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

// 逐个字段实例记录统计：将判定结果累加到三项计数中，并记录非 clean 的事件（normalized 只留记录不报警）。
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

// ---------- §6 严格隔离检查关卡（D-110） ----------
// 仓库版本化常量基线：空基线表示零容忍；调整基线需要通过 PR 审查并明确同意接受新的异常类别；
// 规则要求只紧不松（基线里声明了但实际运行没出现，判为失败）；UNCLASSIFIED 永远不允许加入基线（默认拒绝）。
// 命令行参数与环境变量只传递开关，基线内容始终读取本常量（D-110④）。
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

// 严格检查关卡：返回违反基线的 reason_code 集合（默认拒绝原则 —— 不在基线内的都算违规）。
// 去重后返回（同一个异常码出现多次只报一次，违规列表是错误码清单，详细的实例记录保存在 fieldEvents 中）。
export function strictQuarantineViolations(events: readonly FieldEvent[]): string[] {
  const baseline = new Set(ACCEPTED_REASON_CODES);
  const out: string[] = [];
  for (const e of events) {
    if (e.disposition !== 'quarantined') { continue; }
    if (!baseline.has(e.reason_code) && out.indexOf(e.reason_code) < 0) { out.push(e.reason_code); }
  }
  return out;
}

// 检查只紧不松规则（D-110③）：基线只紧不松 —— 如果基线里声明的某项错误码在本次隔离事件中完全没有出现，直接判为失败
// （参考常见代码质量工具的做法：已经不再发生的异常如果还留着，等于悄悄放宽了检查范围，削弱检测能力）。
// 检查粒度以当前运行产生的事件集为准（基线是仓库级声明，每次运行都核对其是否对应实际情况）。
export function ratchetIssues(events: readonly FieldEvent[]): string[] {
  const observed = new Set(events.filter(function (e) { return e.disposition === 'quarantined'; }).map(function (e) { return e.reason_code; }));
  const out: string[] = [];
  for (const c of ACCEPTED_REASON_CODES) {
    if (!observed.has(c)) { out.push('baseline 滞留码=' + c + '（本运行 quarantined 观测码集缺席——只紧不松规则：未出现即判失败）'); }
  }
  return out;
}

// ---------- §7 数量核对（D-100③ / D-116①：针对每个字段逐一检查） ----------
// 总数必须等于 clean + normalized + quarantined 之和；且 quarantine_log 表中的记录行数（normalized + quarantined）
// 必须严格等于内存统计中的非 clean 数量 —— 这是引擎内部层面的数量核对（外层由 78-check 验证）。
export interface IdentityIssue { field_name: string; detail: string }

export function intakeIdentityIssues(
  stats: readonly FieldStat[],
  dbCounts: Readonly<Record<string, { normalized: number; quarantined: number }>>
): IdentityIssue[] {
  const issues: IdentityIssue[] = [];
  for (const s of stats) {
    if (s.clean + s.normalized + s.quarantined !== s.total) {
      issues.push({ field_name: s.field_name, detail: '三项计数合计不等于总数：' + s.clean + '+' + s.normalized + '+' + s.quarantined + '!=' + s.total });
    }
    const db = dbCounts[s.field_name] || { normalized: 0, quarantined: 0 };
    if (db.normalized !== s.normalized) {
      issues.push({ field_name: s.field_name, detail: 'normalized 数据库中数量 ' + db.normalized + '≠内存中数量 ' + s.normalized });
    }
    if (db.quarantined !== s.quarantined) {
      issues.push({ field_name: s.field_name, detail: 'quarantined 数据库中数量 ' + db.quarantined + '≠内存中数量 ' + s.quarantined });
    }
  }
  return issues;
}

// ---------- §8 异常级别升级（D-100③ 阈值 / D-105 锚点 / D-111 reason_class） ----------
// 单个字段隔离数量占总数比例的红线阈值：默认保守设定为 0.1%（后续可按实际运行数据调整；
// 锚点字段一共只有 1 个，只要异常比例即为 100%，必然触发超限）。
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

// ---------- §9 崩溃记录信息（D-109：协议级崩溃固定输出结构） ----------
export const CRASH_ARTIFACT_SCHEMA = 'quarantine-crash-artifact/v1';

export interface CrashContext {
  repo_ref: string | null;
  run_id: string | null;       // traceId 关联键
  commit_sha: string | null;
  head_date: string | null;    // D-109② 上下文信息三件套：traceId + headDate + collector
  collector: string | null;
}

export interface CrashCounts {
  commits_seen: number;        // 已解析记录数（D-109②）
  records_parsed: number;
  clean: number;               // 发生崩溃时的三项计数累计（D-109②）
  normalized: number;
  quarantined: number;
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

// 纯构造器 —— 规则层不做实际 IO 操作（写入磁盘交给 cli.ts 或执行脚本）。
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
      commit_sha: rc.commit_sha === undefined ? null : rc.commit_sha,
      head_date: rc.head_date === undefined ? null : rc.head_date,
      collector: rc.collector === undefined ? null : rc.collector
    },
    counts: {
      commits_seen: cn.commits_seen === undefined ? 0 : cn.commits_seen,
      records_parsed: cn.records_parsed === undefined ? 0 : cn.records_parsed,
      clean: cn.clean === undefined ? 0 : cn.clean,
      normalized: cn.normalized === undefined ? 0 : cn.normalized,
      quarantined: cn.quarantined === undefined ? 0 : cn.quarantined,
      facts_written: cn.facts_written === undefined ? 0 : cn.facts_written,
      quarantined_written: cn.quarantined_written === undefined ? 0 : cn.quarantined_written
    },
    at: args.at || new Date().toISOString()
  };
}

// 协议级崩溃错误类型：带有 code 和 crash 载荷的 Error；上层捕获后据此生成崩溃记录文件。
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
  // 如果错误码写错了属于代码缺陷，必须直接抛出异常报错（对应 REASON-CODE-UNLISTED 的前置校验）：
  // 如果词表外的 code 被放行，isProtocolCrash 将无法识别，从而悄悄变成普通错误导致无法生成崩溃工件。
  if (PROTOCOL_CRASH_CODES.indexOf(code) < 0) {
    throw new Error('protocolCrashError: code not in PROTOCOL_CRASH_CODES（崩溃代码不在受控列表中属于代码错误，禁止不声不响放行）：' + code);
  }
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

// ProtocolCrash → 崩溃记录生成（供调用方统一处理；若 raw 缺失则取空串指纹，保证关键信息始终具备）。
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

// 崩溃时刻的各项数量快照（D-109② counts=三项计数累计+已解析记录数）：从 FieldStat 集合提取生成。
// 发生崩溃时统一调用本函数，禁止手动拼装部分字段（防止字段残缺造成格式不合规）。
export function countsFromStats(
  stats: readonly FieldStat[],
  recordsParsed: number,
  factsWritten?: number,
  quarantinedWritten?: number
): CrashCounts {
  let clean = 0, normalized = 0, quarantined = 0;
  for (const s of stats) { clean += s.clean; normalized += s.normalized; quarantined += s.quarantined; }
  return {
    commits_seen: recordsParsed,
    records_parsed: recordsParsed,
    clean: clean,
    normalized: normalized,
    quarantined: quarantined,
    facts_written: factsWritten === undefined ? 0 : factsWritten,
    quarantined_written: quarantinedWritten === undefined ? 0 : quarantinedWritten
  };
}
