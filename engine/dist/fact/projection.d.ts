import type { FactEvent } from './store.js';
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
