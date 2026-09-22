export interface FactField {
    name: string;
    type: string;
    nullable: boolean;
    role: string;
    constraints: readonly string[];
    inherits: string;
}
export declare const SCHEMA_VERSION_V0 = 1;
export declare const AUDIT_FACT_FIELDS: readonly FactField[];
export declare const SCHEMA_REGISTRY_FIELDS: readonly FactField[];
export declare const REWRITE_BLACKLIST: readonly string[];
export declare const STATEMENT_ALLOWLIST: readonly string[];
export type StatementVerdict = {
    allow: boolean;
    reason: string;
};
export declare function normalizeSql(sql: string): string;
export declare function stripSqlLiterals(sql: string): string;
export declare function classifyStatement(sql: string): StatementVerdict;
export declare class AppendOnlyViolation extends Error {
    constructor(sql: string, reason: string);
}
export declare function assertAppendOnly(sql: string): void;
export declare function buildCreateTableSql(table: string, fields: readonly FactField[], tableConstraints?: readonly string[]): string;
export declare const AUDIT_FACT_DDL: string;
export declare const SCHEMA_REGISTRY_DDL: string;
export declare const QUARANTINE_LOG_FIELDS: readonly FactField[];
export declare const QUARANTINE_LOG_DDL: string;
