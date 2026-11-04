export interface SafeReadOk {
    ok: true;
    text: string;
    relPath: string;
    realPath: string;
    isSymlink: boolean;
}
export type SafeReadFailReason = 'missing' | 'symlink-dangling' | 'symlink-outside' | 'symlink-non-regular' | 'outside-repo' | 'non-regular' | 'read-error';
export interface SafeReadFail {
    ok: false;
    reason: SafeReadFailReason;
    relPath: string;
    error?: string;
}
export type SafeReadResult = SafeReadOk | SafeReadFail;
export interface SafeDirOk {
    ok: true;
    relPath: string;
    realPath: string;
    isSymlink: boolean;
    entries: string[];
}
export type SafeDirFailReason = 'missing' | 'dir-junction-outside' | 'non-directory' | 'read-error';
export interface SafeDirFail {
    ok: false;
    reason: SafeDirFailReason;
    relPath: string;
    error?: string;
}
export type SafeDirResult = SafeDirOk | SafeDirFail;
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
 * 校验指定相对路径或绝对路径是否合法落于 repoRoot 内。
 * 依据 realpath 判界：不存在、悬空链接、仓外目标一律 false。
 */
export declare function isPathContainedInRepo(repoRoot: string, targetPath: string): boolean;
/**
 * 安全读取仓内文件内容，拦截逃逸符号链接、悬空链接、目录 junction 及非普通文件。
 */
export declare function readRepoFileSafe(repoRoot: string, relOrAbsPath: string): SafeReadResult;
/**
 * 安全列目录：目录本身可以是仓内的普通目录或指向仓内目录的符号链接；
 * 指向仓外（或悬空）的目录链接/junction 一律拒绝并给出 dir-junction-outside。
 */
export declare function readRepoDirSafe(repoRoot: string, relOrAbsPath: string): SafeDirResult;
/**
 * 条目存在性探针（不读取内容）：用于把「不存在＝静默跳过」与「存在但被安全读取拒绝＝必须披露」分开。
 * 返回 'absent' | 'link' | 'file' | 'dir' | 'other'。
 */
export declare function probeRepoEntry(repoRoot: string, relOrAbsPath: string): 'absent' | 'link' | 'file' | 'dir' | 'other';
/** ADR 语料文件名口径（编号前缀的 .md）；目录安全枚举与文件名过滤同点，供 macro-b/macro-c/39 共用。 */
export declare function listAdrFilesSafe(repoRoot: string, relDir: string): {
    ok: true;
    files: string[];
} | {
    ok: false;
    reason: SafeDirFailReason;
    relPath: string;
};
