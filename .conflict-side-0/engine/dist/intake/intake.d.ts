export type RepoInputKind = 'local' | 'owner-repo' | 'url';
export interface InputClassification {
    kind: RepoInputKind;
    forcedLocal: boolean;
    original: string;
}
export declare function classifyRepoInput(input: string): InputClassification;
export interface IntakeError extends Error {
    code: string;
}
export declare function intakeError(code: string, message: string): IntakeError;
export declare function isGitRepo(dir: string, timeoutMs?: number): boolean;
export declare function normalizeGitIsoDate(raw: string): string;
export declare function isShallowRepo(dir: string, timeoutMs?: number): boolean;
export declare function headSha(dir: string, timeoutMs?: number): string;
export declare function sha256Short(text: string): string;
export declare function normalizeRepoUrlKey(url: string): string;
export interface RepoAddOptions {
    cwd?: string;
    cacheRoot?: string;
    cloneTimeoutMs?: number;
    refresh?: boolean;
}
export interface RepoAddResult {
    kind: RepoInputKind;
    input: string;
    resolved_root: string;
    url: string | null;
    cache_dir: string | null;
    cloned: boolean;
    head_sha: string;
    shallow: boolean;
    full_depth_verified: boolean;
    remote_config_execution: 'disabled';
    credentials: 'local-git-credential-chain';
    snapshot_fetched_at: string | null;
    cache_hit: boolean;
    refreshed: boolean;
}
export interface CloneResult {
    dir: string;
    cloned: boolean;
    head_sha: string;
    shallow: false;
    snapshot_fetched_at: string | null;
    refreshed: boolean;
}
export declare function cloneToIsolatedCache(url: string, cacheRoot: string, timeoutMs?: number, refresh?: boolean): CloneResult;
export declare function repoAdd(input: string, opts?: RepoAddOptions): RepoAddResult;
