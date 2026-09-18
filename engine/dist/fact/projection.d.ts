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
