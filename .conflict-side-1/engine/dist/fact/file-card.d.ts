import type { FactEvent } from './store.js';
export declare const FILE_CARD_SCHEMA_VERSION = "file-card@v1";
export declare const FILE_CARD_RULE_VERSION = "hotspot_priority_v1";
export declare const FILE_CARD_TOP_N = 20;
export declare const FILE_CARD_INSUFFICIENT_MIN_REVS = 3;
export declare const FILE_CARD_HISTORY_DERIVED_FACETS: readonly string[];
export declare const FILE_CARD_STATIC_FACETS: readonly string[];
export type SuppressedFacetReason = 'new_file' | 'insufficient_history';
export interface SuppressedFacet {
    facet: string;
    reason: SuppressedFacetReason;
}
export type MissState = 'never_collected' | 'not_tracked_at_sha' | 'not_applicable' | 'renamed_to';
export type CardType = 'file-audit-card' | 'not_applicable' | 'miss';
export type FailureState = 'ok' | 'new_file' | 'insufficient_history' | 'not_applicable';
export type DriftState = 'fresh' | 'behind' | 'unknown';
export interface FileCardMiss {
    state: MissState;
    detail: string;
    renamed_to?: string;
    lineage_edge?: {
        from: string;
        to: string;
        commit_sha: string;
        similarity: number;
    };
    revalidated?: boolean;
    available_head_shas?: string[];
    cli_guidance?: string;
}
export interface FileCardLineageEdge {
    from: string;
    to: string;
    commit_sha: string;
    similarity: number;
}
export interface FileCardLineage {
    stitched_from: string[];
    edges: FileCardLineageEdge[];
    cycle_detected: boolean;
    truncated: boolean;
}
export declare const FILE_CARD_LINEAGE_MAX_ANCESTORS = 64;
export interface FileCard {
    schema_version: string;
    card_type: CardType;
    advisory: true;
    subject: string;
    repo_ref: string | null;
    observation: {
        head_sha: string | null;
        pinned_sha: string | null;
        pin_matches_observed_head: boolean | null;
    };
    staleness: {
        observed_head_sha: string | null;
        current_head_sha: string | null;
        drift: DriftState;
    };
    source: 'prefetch' | 'backfill' | 'unknown';
    failure_state: FailureState;
    miss: FileCardMiss | null;
    lineage: FileCardLineage | null;
    kernel: {
        facet_rows: Record<string, {
            row: Record<string, unknown>;
            fact_ref: string;
            observed_at: string;
            evidence_ref: string;
            subject_ref: string;
        }[]>;
        set_truncated: boolean;
        suppressed_facets: SuppressedFacet[];
    };
    derived: {
        rule_version: string;
        revisions: number | null;
        hotspot_score: number | null;
        percentile_rank: {
            scope: 'repo';
            metric: string;
            value: number | null;
        };
        top_n_flag: {
            n: number;
            scope: 'repo';
            metric: string;
            value: boolean | null;
        };
        priority_band: {
            value: 'high' | 'medium' | 'low' | null;
            inputs: {
                hotspot_score: number | null;
                percentile_rank: number | null;
            };
        };
        suppressed_by: FailureState | null;
    };
    narrative: {
        hints: string[];
        key_check: {
            referenced: string[];
            missing: string[];
            ok: boolean;
        };
    };
}
export interface FileCardBuildInput {
    subject: string;
    setRepoRef: string | null;
    setFacts: readonly FactEvent[];
    availableHeadShas: readonly string[];
    pinnedSha: string | null;
    currentHeadSha: string | null;
    source: 'prefetch' | 'backfill' | 'unknown';
    cliGuidance: string | null;
    setTruncated?: boolean;
    pinnedAmbiguous?: readonly string[];
    lineageFacts?: readonly FactEvent[];
    lineageEdgeCapHit?: boolean;
}
export declare function headShaOfRepoRef(repoRef: string): string | null;
export declare function fileCardCitationKeys(card: FileCard): string[];
export declare function validateFileCardCitations(card: FileCard, referenced: readonly string[]): {
    ok: boolean;
    missing: string[];
};
export declare function buildFileCard(input: FileCardBuildInput): FileCard;
