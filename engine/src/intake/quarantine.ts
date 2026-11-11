// intake/quarantine.ts —— 字段有毛病的处理层（整行协议级错误直接停，单个字段出问题就隔开记；D-103~D-120 / #78）
// 整行协议坏了就当场报错停手，单个字段出问题就放进隔离区记上；「判断」和「怎么处理」两件事分得清清楚楚。
// 判断归判断（D-103③）：这个模块只给诊断结果——把一个字段实例判成三种状态之一，附上 reason_code 和 raw 原始诊断结构，
// 自己绝不抛异常；置空、打警告标、计数、核对数量、最后判什么，全交给后面的使用方和报告层管。
// 两类错误分头处理（D-100③）：协议级的（行格式坏掉、分隔符丢了、整条记录的边界乱了）还是在 intake.ts 那儿直接停；
// 这个文件只管「整条记录切开了，但某个字段的值不合规矩」这种。
import { createHash } from 'node:crypto';

// ---------- §1 reason_code 的受控词表（D-104④ / D-110 / D-119） ----------
// 命名照 git fsck msg-id 那个路子来；头一期是四类有出处的规则，词表自己就带着审计的来龙去脉：
// anchor_head_date_malformed  —— D-105（锚点就 1 个，坏一个就是 100%，自动触发超限）
// normalized_tz_offset        —— D-112（+00:00 转成 Z 的合法改写，不打警告标）；#81 起 dormant 保留 ——
// 真跑的时候边界层（见 §4b）先统一转好了，这个码只当多一层保险用（D-128③ 定的）
// unclassified_field_anomaly  —— D-104②（管着的字段冒出没见过的毛病时的兜底分类）
// oversize                    —— D-117（raw_bytes 太长被截）
// 放开的口子：新错误码先过缺口登记和评估，一条条加；加码不影响已有格式，改码删码算破坏性改动（按版本规范来）。
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

// ---------- §2 接上线的字段名单（D-104①：这一轮只接了 %cI） ----------
export const FIELD_COMMITTER_DATE = 'committer_date';
export const FIELD_HEAD_DATE = 'head_date';

// ---------- §3 raw_bytes 的长度上限和截断（D-117） ----------
// 上限怎么定的：拿现成的样本（6F/env-manager/anysearch-cli/jiahao/gsd-core 差不多 8000 个提交）来看，%cI 字段长度
// 一般就 20 或 25 字节（Z 结尾或者 ±HH:MM 这种）；64KiB 留了差不多 2600 倍的余量，当截断线够稳。
export const RAW_BYTES_CAP = 65536;

// 展示层 raw_echo 截多长（D-117② 怕两处对不上：截断逻辑只此一处 ——
// 报告、度量、演示三个地方都读这个常量，不许自己在各处理写一遍）。
export const RAW_ECHO_CAP = 80;

// 严格隔离那个开关走哪个通道（D-110④：命令行参数压过环境变量压过文件，就这么排，
// 环境变量和参数只传开关，基线内容永远读仓里版本化的 ACCEPTED_REASON_CODES，省得环境变量带进别的基线把检验搞歪）。
export const STRICT_QUARANTINE_ENV = 'MACRO_AUDIT_STRICT_QUARANTINE';

// 展示层截断的公用函数（D-117②）：raw_echo 是 JSON 序列化之后不超过 80 个字符的字符串 ——
// 函数和常量一块儿导出，各个调用方别各写一遍（audit.ts、demo.ts、measurements 三处共用）。
export function rawEcho(raw: string): string {
  return JSON.stringify(raw.length > RAW_ECHO_CAP ? raw.slice(0, RAW_ECHO_CAP) + '…' : raw);
}
// 开关怎么定：命令行给了明话就听命令行的（包括明着传 --no-strict-quarantine 关掉）；
// 没给参数时，环境变量等于 '1' 就算开；什么都没有就默认关。
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

// ---------- §4 三态分类器（D-103①：一个字段一个字段地判，绝不抛异常） ----------
export type FieldStatus = 'clean' | 'normalized' | 'quarantined';

export interface FieldClassification {
  status: FieldStatus;
  value: string | null;
  reason_code: string | null;
  raw: string;
}

// %cI 的严格时间形（精确到秒）：跟 intake.ts 的要求一模一样 —— 这个模块自己拎着正则，规则只在这一处立着。
const GIT_ISO_STRICT_RE = /^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}(Z|[+-]\d{2}:\d{2})$/;

// anchor=true 是说这个字段实例就是 HEAD 那个观测锚点（headDate）：坏了的码是 anchor_head_date_malformed（D-105）。
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

// ---------- §4b 工具版本拼法不一样，统一转掉（D-128 / #81） ----------
// 先把两件事分清：工具拼法差异（上游工具版本不同拼出来的等价写法，比如 RFC 3339 的等价格式，
// 代表的时间值压根没变）不是数据本身坏了（比如被审的仓里真数据烂了）。前一种在适配层统一吸收掉，
// 真坏的才记进字段异常统计——数据进门先规整一遍，分类器只收规整过的。
// 转换规则名单 GIT_ISO_DIALECT_RULES：眼下就时区偏移一种（git 2.45 前 %cI 吐 +00:00，
// 2.45 及往后吐 Z）；以后加规则走评估流程，不许把某个 git 版本钉死来躲格式统一。
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

// 边界转换器是纯函数、结果可复现：一条条规则去匹配，碰上就返回标准形和一条转换记录；没碰上原样返回。
// 工具版本的差异不算字段坏了（不进 FieldEvent、不进 quarantine_log、不算采数体检），单独走一条说明通道披露（D-128④）。
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

// ---------- §5 字段处置事件（判完写进 quarantine_log 表） ----------
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

// 一个字段实例一条记录：把判定结果累进三项计数里，不是 clean 的也记下来（normalized 只记不报警）。
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

// ---------- §6 严格隔离这道关（D-110） ----------
// 基线是仓里版本化的常量：空的基线就是零容忍；要调基线必须走 PR 审查，并白纸黑字同意接受新的异常类别；
// 规矩只紧不松（基线里写着的码，这次跑下来压根没出现，一样判失败）；UNCLASSIFIED 永远不许进基线（默认拒）。
// 命令行参数和环境变量只传开关，基线内容永远读这个常量（D-110④）。
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

// 严格关这道门：返回撞了基线的 reason_code（默认拒——不在基线里的全算违规）。
// 去重后返回（同一个码报好几回也只算一次；违规列表就是码的清单，细的实例都留在 fieldEvents 里）。
export function strictQuarantineViolations(events: readonly FieldEvent[]): string[] {
  const baseline = new Set(ACCEPTED_REASON_CODES);
  const out: string[] = [];
  for (const e of events) {
    if (e.disposition !== 'quarantined') { continue; }
    if (!baseline.has(e.reason_code) && out.indexOf(e.reason_code) < 0) { out.push(e.reason_code); }
  }
  return out;
}

// 只紧不松怎么查（D-110③）：基线声明了的码这趟隔离里压根没露面，就直接判失败
// （学常见代码质量工具那套：已经不犯的毛病还挂在那儿，等于悄悄把检查范围放水了）。
// 拿这次跑下来实际冒出来的事件集来对（基线是仓级的声明，每趟都得核一遍对不对得上实情）。
export function ratchetIssues(events: readonly FieldEvent[]): string[] {
  const observed = new Set(events.filter(function (e) { return e.disposition === 'quarantined'; }).map(function (e) { return e.reason_code; }));
  const out: string[] = [];
  for (const c of ACCEPTED_REASON_CODES) {
    if (!observed.has(c)) { out.push('baseline 滞留码=' + c + '（本运行 quarantined 观测码集缺席——只紧不松规则：未出现即判失败）'); }
  }
  return out;
}

// ---------- §7 数量核对（D-100③ / D-116①：一个字段一个字段核） ----------
// 总数必须等于 clean 加 normalized 加 quarantined；而且 quarantine_log 里记的行数（normalized 加 quarantined）
// 得死死等于内存里数出来的非 clean 条数 —— 这是引擎里头的核对（外头另有 78-check 验）。
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

// ---------- §8 异常升级到哪一步（D-100③ 门槛 / D-105 锚点 / D-111 reason_class） ----------
// 单个字段被隔离的条数占总数的红线：默认按保守的 0.1% 定（以后看实际数据再调；
// 锚点字段总共就 1 个，坏一个就是 100%，准保触发超限）。
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

// ---------- §9 崩溃记录长什么样（D-109：协议级崩了固定出这一套结构） ----------
export const CRASH_ARTIFACT_SCHEMA = 'quarantine-crash-artifact/v1';

export interface CrashContext {
  repo_ref: string | null;
  run_id: string | null; // 跟 traceId 挂上钩
  commit_sha: string | null;
  head_date: string | null; // D-109② 三件套：traceId 加 headDate 加 collector
  collector: string | null;
}

export interface CrashCounts {
  commits_seen: number; // 读进来了几条记录（D-109②）
  records_parsed: number;
  clean: number; // 崩的时候三项计数各是多少（D-109②）
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

// 纯构造器 —— 规则层不真去读写磁盘（落地交给 cli.ts 或脚本）。
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

// 协议级崩溃的错误类型：Error 上带 code 和 crash 两份东西；上层抓住它就能生成崩溃记录文件。
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
  // 错误码写错就是代码有毛病，必须当场抛出来报错（对应 REASON-CODE-UNLISTED 那道前置校验）：
  // 词表外的码要是放过了，isProtocolCrash 认不出来，就悄悄变成普通错误，崩溃工件也生不成了。
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

// ProtocolCrash → 生成崩溃记录（调用方统一从这儿走；raw 缺了就取空串指纹，关键信息一份都不能少）。
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

// 崩的那一刻各项数是多少（D-109② 计数=三项累加加已解析的条数）：从 FieldStat 集合里扒出来。
// 崩的时候一律调这个函数，不许自己手拼半拉子字段（拼残了格式就不合规）。
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
