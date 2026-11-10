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
/**
 * 记录安全读取拒绝事件，输出 codelore.file_subject_skip 事实。
 * @param ctx 采集上下文
 * @param rawPath 调用方传入的相对路径
 * @param reason 拒绝原因
 * @param descriptor 采集器描述符
 */
export declare function makeFileSubjectSkipFact(ctx: CollectContext, rawPath: string, reason: string, descriptor?: CollectorDescriptor): CollectedFact;
/**
 * 检查目标路径是否属于仓库内部。
 * 依据真实物理路径判断：不存在、悬空链接、仓外目标均返回 false。
 */
export declare function isPathContainedInRepo(repoRoot: string, targetPath: string): boolean;
/**
 * 安全读取仓库内文件，拦截逃逸符号链接、悬空链接、外部目录链接及非普通文件。
 */
export declare function readRepoFileSafe(repoRoot: string, relOrAbsPath: string): SafeReadResult;
/**
 * 安全列出目录内容：目标可以为仓库内普通目录或指向仓内目录的符号链接；
 * 若指向仓外或悬空则拒绝并返回 dir-junction-outside。
 */
export declare function readRepoDirSafe(repoRoot: string, relOrAbsPath: string): SafeDirResult;
/**
 * 探测文件或目录是否存在（不读取内容），用于将“文件不存在”与“存在但因安全规则被拦截”区分开来。
 * 返回 'absent' | 'link' | 'file' | 'dir' | 'other'。
 */
export declare function probeRepoEntry(repoRoot: string, relOrAbsPath: string): 'absent' | 'link' | 'file' | 'dir' | 'other';
/** 安全列出 ADR 目录下的文件（匹配以数字开头的 .md 文件）。 */
export declare function listAdrFilesSafe(repoRoot: string, relDir: string): {
    ok: true;
    files: string[];
} | {
    ok: false;
    reason: SafeDirFailReason;
    relPath: string;
};
