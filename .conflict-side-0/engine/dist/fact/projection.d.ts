import type { FactEvent } from './store.js';
import type { FileCard } from './file-card.js';
export interface FactProjectionFilter {
    scale?: string;
    repo_ref?: string;
    subject_ref?: string;
    limit?: number;
}
export declare function buildProjectionSql(filter: FactProjectionFilter): {
    sql: string;
    params: string[];
};
export declare function projectFacts(dbPath: string, filter: FactProjectionFilter): Promise<FactEvent[]>;
export interface FileCardQuery {
    repo: string;
    subject: string;
    at?: string;
    current_head_sha?: string | null;
    source?: 'prefetch' | 'backfill' | 'unknown';
    cli_guidance?: string | null;
    lineage_edge_cap?: number;
}
export declare function projectFileCard(dbPath: string, q: FileCardQuery): Promise<FileCard>;
export interface QuarantineProjectionFilter {
    run_id?: string;
    field_name?: string;
    limit?: number;
}
export interface QuarantineRow {
    run_id: string;
    commit_sha: string;
    field_name: string;
    disposition: string;
    reason_code: string;
    raw_bytes_hex: string;
    is_trunc: boolean;
    original_length: number;
    sha256_full: string;
    collector: string;
    recorded_at: string | null;
}
export declare function buildQuarantineSql(filter: QuarantineProjectionFilter): {
    sql: string;
    params: string[];
};
export declare function projectQuarantine(dbPath: string, filter: QuarantineProjectionFilter): Promise<QuarantineRow[]>;
