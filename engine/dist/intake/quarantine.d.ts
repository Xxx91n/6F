export declare const QUARANTINE_REASON_CODES: readonly string[];
export declare const QUARANTINE_DISPOSITIONS: readonly string[];
export declare const REASON_ANCHOR_HEAD_DATE_MALFORMED = "anchor_head_date_malformed";
export declare const REASON_NORMALIZED_TZ_OFFSET = "normalized_tz_offset";
export declare const REASON_UNCLASSIFIED = "unclassified_field_anomaly";
export declare const REASON_OVERSIZE = "oversize";
export declare const FIELD_COMMITTER_DATE = "committer_date";
export declare const FIELD_HEAD_DATE = "head_date";
export declare const RAW_BYTES_CAP = 65536;
export declare const RAW_ECHO_CAP = 80;
export declare const STRICT_QUARANTINE_ENV = "MACRO_AUDIT_STRICT_QUARANTINE";
export declare function rawEcho(raw: string): string;
export declare function strictQuarantineEnabled(flag: boolean | undefined, envValue: string | undefined): boolean;
export interface RawFingerprint {
    raw_bytes_hex: string;
    is_trunc: boolean;
    original_length: number;
    sha256_full: string;
}
export declare function rawBytesFingerprint(raw: string): RawFingerprint;
export type FieldStatus = 'clean' | 'normalized' | 'quarantined';
export interface FieldClassification {
    status: FieldStatus;
    value: string | null;
    reason_code: string | null;
    raw: string;
}
export declare function classifyGitIsoField(raw: string, opts?: {
    anchor?: boolean;
}): FieldClassification;
export interface GitIsoDialectRule {
    rule_id: string;
    match: RegExp;
    canonical: string;
}
export declare const GIT_ISO_DIALECT_RULES: readonly GitIsoDialectRule[];
export interface DialectAbsorption {
    rule_id: string;
    raw: string;
    canonical: string;
}
export declare function absorbGitIsoDialect(raw: string): {
    value: string;
    absorption: DialectAbsorption | null;
};
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
export declare function emptyFieldStat(fieldName: string): FieldStat;
export declare function recordFieldInstance(stat: FieldStat, events: FieldEvent[], cls: FieldClassification, commitSha: string, fieldName: string): void;
export declare const ACCEPTED_REASON_CODES: readonly string[];
export interface BaselineViolation {
    kind: string;
    detail: string;
}
export declare function baselineIssues(): string[];
export declare function strictQuarantineViolations(events: readonly FieldEvent[]): string[];
export declare function ratchetIssues(events: readonly FieldEvent[]): string[];
export interface IdentityIssue {
    field_name: string;
    detail: string;
}
export declare function intakeIdentityIssues(stats: readonly FieldStat[], dbCounts: Readonly<Record<string, {
    normalized: number;
    quarantined: number;
}>>): IdentityIssue[];
export declare const QUARANTINE_FIELD_RATIO_RED = 0.001;
export type IntakeEscalation = 'none' | 'anchor' | 'threshold';
export declare function intakeEscalation(stats: readonly FieldStat[]): IntakeEscalation;
export declare const VERDICT_REASON_CLASSES: readonly string[];
export declare function deriveReasonClass(band: string, escalation: IntakeEscalation): string;
export declare const CRASH_ARTIFACT_SCHEMA = "quarantine-crash-artifact/v1";
export interface CrashContext {
    repo_ref: string | null;
    run_id: string | null;
    commit_sha: string | null;
    head_date: string | null;
    collector: string | null;
}
export interface CrashCounts {
    commits_seen: number;
    records_parsed: number;
    clean: number;
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
export declare function buildCrashArtifact(args: {
    error_code: string;
    raw?: string | null;
    crash_location: string;
    run_context?: Partial<CrashContext>;
    counts?: Partial<CrashCounts>;
    at?: string;
}): CrashArtifact;
export declare const PROTOCOL_CRASH_CODES: readonly string[];
export interface ProtocolCrash extends Error {
    code: string;
    crash: {
        raw: string | null;
        crash_location: string;
        run_context: Partial<CrashContext>;
        counts: Partial<CrashCounts>;
    };
}
export declare function protocolCrashError(code: string, detail: string, crash: Partial<ProtocolCrash['crash']>): ProtocolCrash;
export declare function isProtocolCrash(e: unknown): e is ProtocolCrash;
export declare function crashArtifactFromError(e: ProtocolCrash, at?: string): CrashArtifact;
export declare function countsFromStats(stats: readonly FieldStat[], recordsParsed: number, factsWritten?: number, quarantinedWritten?: number): CrashCounts;
