export interface SafeReadOk {
    ok: true;
    text: string;
    relPath: string;
    realPath: string;
    isSymlink: boolean;
}
export interface SafeReadFail {
    ok: false;
    reason: 'missing' | 'symlink-outside' | 'symlink-non-regular' | 'outside-repo' | 'non-regular' | 'read-error';
    relPath: string;
    error?: string;
}
export type SafeReadResult = SafeReadOk | SafeReadFail;
export interface CollectContext {
    runId: string;
    traceId: string;
    repoRef: string;
    scale: string;
    observedAt: string;
}
export interface CollectedFact {
    fact_id: string;
    trace_id: string;
    baggage_id: string;
    scale: string;
    quadrant: string;
    dimension: string | null;
    collector_id: string;
    repo_ref: string;
    subject_ref: string;
    evidence_ref: string;
    metric: string;
    value_json: string;
    observed_at: string;
}
export interface CollectorDescriptor {
    id: string;
    family: string;
    dimension: string | null;
    quadrant: string;
}
export declare const AUDIT_DESCRIPTOR: CollectorDescriptor;
export declare function makeFileSubjectSkipFact(ctx: CollectContext, rawPath: string, reason: string, descriptor?: CollectorDescriptor): CollectedFact;
/**
 * 校验指定相对路径或绝对路径是否合法落于 repoRoot 内
 */
export declare function isPathContainedInRepo(repoRoot: string, targetPath: string): boolean;
/**
 * 安全读取仓内文件内容，拦截逃逸符号链接及非普通文件
 */
export declare function readRepoFileSafe(repoRoot: string, relOrAbsPath: string): SafeReadResult;
