export declare const AUDIT_SCALES_IMPLEMENTED: readonly string[];
export interface AuditScaleError {
    code: 'SCALE-NOT-IMPLEMENTED';
    message: string;
    implemented: readonly string[];
    requested: string;
    layer_order: string;
}
export declare function isAuditScaleError(e: unknown): e is AuditScaleError;
export declare function normalizeAuditScale(raw: string | undefined): string;
export declare function auditRepoName(input: string, resolvedRoot: string): string;
export interface AuditOptions {
    input: string;
    scale?: string;
    outDir?: string;
    json?: boolean;
    refresh?: boolean;
    cwd?: string;
}
export interface AuditResult {
    report_id: string;
    receipt_id: string;
    scale: string;
    stability: 'preview' | 'ga' | null;
    capabilities: string[];
    overall_verdict: string;
    degraded_mode: boolean;
    head_sha: string;
    tree_sha: string;
    commit_count: number;
    adr_count: number;
    fact_count: number;
    repo_name: string;
    resolved_root: string;
    intake_kind: string;
    snapshot_fetched_at: string | null;
    cache_hit: boolean;
    refreshed: boolean;
    codelore: {
        resolved: boolean;
        pinned: boolean;
        version: string | null;
    };
    out_dir: string | null;
    artifacts: {
        report_md: string;
        report_json: string;
        facts_jsonl: string;
        measurements: string;
        duckdb: string;
    } | null;
    report_markdown: string;
    sidecar_json: string;
    measurements: Record<string, unknown>;
}
export declare function runAudit(opts: AuditOptions): Promise<AuditResult>;
