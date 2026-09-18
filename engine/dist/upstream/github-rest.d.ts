import type { CollectContext, CollectedFact, CollectorDescriptor } from '../collect/collectors.js';
export declare const GITHUB_REST_ADAPTER_ID = "github-rest-adapter@v1";
export declare const GITHUB_REST_FAMILY = "upstream-github-rest";
export declare const GITHUB_API_VERSION = "2022-11-28";
export declare const GITHUB_API_BASE = "https://api.github.com";
export declare const GITHUB_USER_AGENT = "macro-audit-6f";
export declare const UNAUTHENTICATED_HOURLY_LIMIT = 60;
export declare const DEFAULT_MAX_PAGES = 10;
export declare const DEFAULT_PER_PAGE = 100;
export declare const DEFAULT_MAX_RETRY_WAIT_SECONDS = 60;
export declare const GITHUB_REST_PLANNED_SURFACES: readonly string[];
export declare const GITHUB_REST_DESCRIPTOR: CollectorDescriptor;
export type GithubCredentialStrategy = 'env-token' | 'gh-token' | 'unauthenticated';
export interface GithubCredentialResolution {
    strategy: GithubCredentialStrategy;
    token: string | null;
    degraded: boolean;
    disclosures: string[];
}
export interface GhTokenProbeResult {
    available: boolean;
    token: string | null;
}
export type GhTokenProbe = () => GhTokenProbeResult;
export declare function probeGhAuthToken(binary?: string): GhTokenProbeResult;
export declare function resolveGithubCredential(env: Readonly<Record<string, string | undefined>>, ghProbe?: GhTokenProbe): GithubCredentialResolution;
export interface GithubHttpRequest {
    method: string;
    url: string;
    accept: string;
    token: string | null;
}
export interface GithubHttpResponse {
    status: number;
    headers: Record<string, string>;
    body: string;
}
export type GithubHttpFetcher = (req: GithubHttpRequest) => Promise<GithubHttpResponse>;
export type Sleeper = (ms: number) => Promise<void>;
export declare const defaultSleeper: Sleeper;
export declare function realHttpFetcher(timeoutMs?: number): GithubHttpFetcher;
export interface RateLimitSnapshot {
    limit: number | null;
    remaining: number | null;
    used: number | null;
    reset_epoch: number | null;
    resource: string | null;
    retry_after_seconds: number | null;
}
export declare function parseRateLimitHeaders(headers: Record<string, string>): RateLimitSnapshot | null;
export type GithubApiErrorKind = 'none' | 'http' | 'rate-limited' | 'network' | 'parse';
export interface GithubApiResult {
    ok: boolean;
    status: number;
    data: unknown;
    error_kind: GithubApiErrorKind;
    rate_limit: RateLimitSnapshot | null;
    retried: boolean;
    detail: string | null;
}
export interface GithubCallLogEntry {
    path: string;
    status: number;
    rate_limit: RateLimitSnapshot | null;
    retried: boolean;
    error_kind: GithubApiErrorKind;
}
export interface GithubRestClient {
    call(path: string, accept?: string): Promise<GithubApiResult>;
    callLog: GithubCallLogEntry[];
}
export interface GithubRestClientOptions {
    fetcher?: GithubHttpFetcher;
    sleeper?: Sleeper;
    apiBase?: string;
    maxRetryWaitSeconds?: number;
}
export declare function createGithubRestClient(cred: GithubCredentialResolution, opts?: GithubRestClientOptions): GithubRestClient;
export declare class GithubSchemaDrift extends Error {
    missing: string[];
    constructor(where: string, missing: string[]);
}
export declare function platformDeclaredBot(login: unknown, userType: unknown): boolean;
export interface PrSummary {
    number: number;
    title: string;
    state: string;
    draft: boolean | null;
    author_login: string;
    author_type: string;
    bot_declared: boolean;
    bot_basis: 'platform-declared:user.type==Bot&&login~[bot]';
    merged_at: string | null;
    head_sha: string;
    base_sha: string;
    html_url: string;
}
export declare function parsePrSummaryRow(row: unknown): PrSummary;
export interface PrDetail extends PrSummary {
    merged: boolean;
    merge_commit_sha: string | null;
    additions: number | null;
    deletions: number | null;
    changed_files: number | null;
    commits: number | null;
    comments: number | null;
    review_comments: number | null;
    created_at: string | null;
    closed_at: string | null;
    merged_by_login: string | null;
    merged_by_type: string | null;
}
export declare function parsePrDetail(row: unknown): PrDetail;
export interface PrDiffStats {
    files_changed: number | null;
    additions: number | null;
    deletions: number | null;
}
export interface PrDiffOutcome {
    channel: 'local-git' | 'api';
    ok: boolean;
    text: string;
    stats: PrDiffStats;
    detail: string | null;
    error_kind: GithubApiErrorKind | 'local-diff' | null;
}
export declare function gitShaResolvable(repoRoot: string, sha: string): boolean;
export declare function parseNumstat(text: string): PrDiffStats;
export declare function localThreeDotDiff(repoRoot: string, baseSha: string, headSha: string): {
    ok: boolean;
    text: string;
    stats: PrDiffStats;
    detail: string | null;
};
export declare function resolvePrDiff(client: GithubRestClient, owner: string, repo: string, prNumber: number, baseSha: string, headSha: string, repoRoot?: string | null): Promise<PrDiffOutcome>;
export type GithubRepoRef = {
    ok: true;
    owner: string;
    repo: string;
} | {
    ok: false;
    reason: string;
};
export declare function parseGithubRepoRef(input: string): GithubRepoRef;
export interface CollectGithubPrOptions {
    state?: 'open' | 'closed' | 'all';
    maxPages?: number;
    perPage?: number;
    details?: readonly number[];
    diffs?: readonly number[];
    repoRoot?: string | null;
    env?: Readonly<Record<string, string | undefined>>;
    ghTokenProbe?: GhTokenProbe;
    fetcher?: GithubHttpFetcher;
    sleeper?: Sleeper;
    apiBase?: string;
    maxRetryWaitSeconds?: number;
}
export interface GithubPrCollectResult {
    facts: CollectedFact[];
    strategy: GithubCredentialStrategy;
    degraded: boolean;
    prs_listed: number;
    calls: number;
    stopped_reason: string | null;
}
export declare function collectGithubPrFacts(owner: string, repo: string, opts: CollectGithubPrOptions, ctx: CollectContext): Promise<GithubPrCollectResult>;
