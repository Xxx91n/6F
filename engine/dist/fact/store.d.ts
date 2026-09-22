import type { DuckDBConnection } from '@duckdb/node-api';
export interface FactEvent {
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
export declare function platformPackageSuffix(): string | null;
export declare function engineRoot(): string;
export declare function healDuckdbBinding(): {
    ok: boolean;
    detail: string;
};
export declare function closeDuckdb(connection: DuckDBConnection): void;
export declare function openWriter(dbPath: string): Promise<DuckDBConnection>;
export declare function openReader(dbPath: string): Promise<DuckDBConnection>;
export declare function appendFact(connection: DuckDBConnection, event: FactEvent): Promise<void>;
export declare function queryFacts(connection: DuckDBConnection, sql: string): Promise<import("@duckdb/node-api").DuckDBMaterializedResult>;
export declare function factFieldNames(): readonly string[];
export declare const QUARANTINE_SEQ_NAME = "quarantine_log_seq";
export interface QuarantineEventInput {
    run_id: string;
    commit_sha: string;
    field_name: string;
    disposition: 'quarantined' | 'normalized';
    reason_code: string;
    raw: string;
    collector: string;
    recorded_at: string | null;
}
export declare function appendQuarantineEvent(connection: DuckDBConnection, ev: QuarantineEventInput): Promise<void>;
export declare function runInTransaction<T>(connection: DuckDBConnection, fn: () => Promise<T>): Promise<T>;
export declare function queryQuarantineCounts(connection: DuckDBConnection, runId: string): Promise<Record<string, {
    normalized: number;
    quarantined: number;
}>>;
export declare function queryQuarantineRows(connection: DuckDBConnection, runId: string): Promise<Record<string, unknown>[]>;
