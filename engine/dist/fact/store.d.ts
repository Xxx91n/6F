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
export declare function healDuckdbBinding(): {
    ok: boolean;
    detail: string;
};
export declare function openWriter(dbPath: string): Promise<DuckDBConnection>;
export declare function openReader(dbPath: string): Promise<DuckDBConnection>;
export declare function appendFact(connection: DuckDBConnection, event: FactEvent): Promise<void>;
export declare function queryFacts(connection: DuckDBConnection, sql: string): Promise<import("@duckdb/node-api").DuckDBMaterializedResult>;
export declare function factFieldNames(): readonly string[];
