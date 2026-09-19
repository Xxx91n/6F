import type { CollectorDescriptor, CollectedFact } from '../collect/collectors.js';
export declare const UPSTREAM_DIMENSION_MAP_VERSION = "v1.0";
export declare const UPSTREAM_DIMENSION_MAP_REVIEW: {
    readonly last_reviewed: "2026-09-19";
    readonly next_review: "2026-10-19";
};
export type UpstreamDimension = 'S3' | 'S4' | 'S5';
export type UpstreamLane = 'Micro-A' | 'Macro-B-QuadrantEntry' | 'deferred' | 'excluded' | 'pending-event_bound';
export interface UpstreamMapRow {
    readonly adapter: 'codelore' | 'github-rest';
    readonly surface: string;
    readonly surface_kind: 'analysis' | 'group' | 'fact_type' | 'slice';
    readonly dimension: UpstreamDimension | null;
    readonly lane: UpstreamLane | 'S-dimension';
    readonly admission: string;
    readonly note: string;
}
export declare const CODELORE_EVOLUTION_FACETS: readonly ["revisions", "abs-churn", "entity-churn", "author-churn", "hotspot-velocity", "code-age", "stale-code", "architecture-trend", "health-trend", "lead-time", "release-cadence", "messages"];
export declare const CODELORE_S3_FACETS: readonly ["god-classes", "architecture-metrics", "dependency-cycles", "modularity-violations", "instability", "architecture-roles"];
export declare const CODELORE_S5_FACETS: readonly ["ownership", "entity-ownership", "bus-factor", "main-dev", "main-dev-by-revs", "main-dev-by-deletions", "knowledge-islands", "communication", "coordination-needs", "team-composition", "marginal-owner-risk", "pair-programming"];
export declare const CODELORE_EXPLAIN_SURFACES: readonly ["explain-repo", "explain-brief", "explain-adr", "explain-query", "explain-resolve", "explain-execute", "explain-dryrun", "llm-narrative", "capability-check"];
export declare const CODELORE_BEHAVIOR_FACES: readonly ["hotspots", "coupling", "function-hotspots"];
export declare const CODELORE_DIMENSION_MAP: readonly UpstreamMapRow[];
export declare const GITHUB_REST_EXCLUDED_FACT_TYPES: readonly ["resolution", "rate_limit", "rate_limited", "api_error", "schema_drift", "run", "preflight"];
export declare const GITHUB_REST_DIMENSION_MAP: readonly UpstreamMapRow[];
export declare const UPSTREAM_DIMENSION_MAP: readonly UpstreamMapRow[];
export interface UpstreamResolution {
    readonly dimension: UpstreamDimension | null;
    readonly lane: UpstreamLane | 'S-dimension';
    readonly admission: string;
    readonly admitted: boolean;
    readonly reason: string;
}
export declare function resolveCodeloreAnalysis(analysis: string): UpstreamResolution;
export declare function isCodeloreDeferredAnalysis(analysis: string): boolean;
export declare function resolveGithubRestSlice(slice: string, ctx?: {
    is_bot_via_platform_identity?: boolean;
}): UpstreamResolution;
export declare function isGithubRestExcludedFactType(factType: string): boolean;
export interface UpstreamCollectorRegistration {
    readonly descriptor: CollectorDescriptor;
    readonly registered: boolean;
    readonly opt_in: 'binary+pin' | 'token+network';
    readonly skipped_semantics: string;
}
export declare const UPSTREAM_COLLECTOR_REGISTRY: readonly UpstreamCollectorRegistration[];
export interface UpstreamProjectionEntry {
    readonly fact_id: string;
    readonly family: string;
    readonly metric: string;
    readonly subject_ref: string;
    readonly dimension: UpstreamDimension | null;
    readonly lane: string;
    readonly admitted: boolean;
    readonly reason: string;
}
export interface UpstreamProjection {
    readonly map_version: string;
    readonly map_review: typeof UPSTREAM_DIMENSION_MAP_REVIEW;
    readonly mapped: UpstreamProjectionEntry[];
    readonly unmapped: UpstreamProjectionEntry[];
}
export declare function projectUpstreamDimensions(facts: readonly CollectedFact[]): UpstreamProjection;
