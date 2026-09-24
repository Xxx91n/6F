import { isAuditIoError } from '../fact/store.js';
import type { FileCard } from '../fact/file-card.js';
import type { CollectContext, CollectedFact } from '../collect/collectors.js';
export declare class AuditFileError extends Error {
    readonly code: string;
    constructor(code: string, message: string);
}
export declare function isAuditFileError(e: unknown): e is AuditFileError;
export interface AuditFileCollectors {
    codelore?: (ctx: CollectContext, repoRoot: string) => CollectedFact[];
    lineage?: (ctx: CollectContext, repoRoot: string) => CollectedFact[];
}
export interface AuditFileOptions {
    input: string;
    path: string;
    db: string;
    at?: string;
    cwd?: string;
    collectors?: AuditFileCollectors;
}
export interface AuditFileResult {
    card: FileCard;
    backfilled: boolean;
    emitted: number;
    repo_ref: string;
    repo_name: string;
    head_sha: string;
}
export declare function runAuditFile(opts: AuditFileOptions): Promise<AuditFileResult>;
export { isAuditIoError };
