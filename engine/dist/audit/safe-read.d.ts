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
 * 记一条安全读取的拒绝，写成 codelore.file_subject_skip 事实。
 * @param ctx 采集上下文
 * @param rawPath 调用方给的相对路径
 * @param reason 为什么拒
 * @param descriptor 采集器的描述
 */
export declare function makeFileSubjectSkipFact(ctx: CollectContext, rawPath: string, reason: string, descriptor?: CollectorDescriptor): CollectedFact;
/**
 * 看目标路径在不在仓里。
 * 按实际物理路径判：不存在、悬空链接、落在仓外，一律返回 false。
 */
export declare function isPathContainedInRepo(repoRoot: string, targetPath: string): boolean;
/**
 * 在仓里安全地读文件：逃逸的符号链接、悬空链接、指到外面的目录链接、非普通文件，全拦下。
 */
export declare function readRepoFileSafe(repoRoot: string, relOrAbsPath: string): SafeReadResult;
/**
 * 安全地列目录：目标可以是仓里的普通目录，也可以是指向仓里目录的符号链接；
 * 指到仓外或悬空的就拒，返回 dir-junction-outside。
 */
export declare function readRepoDirSafe(repoRoot: string, relOrAbsPath: string): SafeDirResult;
/**
 * 只看文件或目录在不在（不读内容），用来分清「压根没有」和「有，但被安全规则拦了」。
 * 返回 'absent' | 'link' | 'file' | 'dir' | 'other'。
 */
export declare function probeRepoEntry(repoRoot: string, relOrAbsPath: string): 'absent' | 'link' | 'file' | 'dir' | 'other';
/** 安全地列 ADR 目录里的文件（只认数字开头、.md 结尾的）。 */
export declare function listAdrFilesSafe(repoRoot: string, relDir: string): {
    ok: true;
    files: string[];
} | {
    ok: false;
    reason: SafeDirFailReason;
    relPath: string;
};
