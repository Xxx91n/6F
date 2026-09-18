import { AUDIT_FACT_DDL, SCHEMA_REGISTRY_DDL, AUDIT_FACT_FIELDS, assertAppendOnly, SCHEMA_VERSION_V0 } from './schema.js';
const WRITE_COLUMNS = AUDIT_FACT_FIELDS
    .filter(function (f) { return f.name !== 'fact_seq' && f.name !== 'ingested_at'; })
    .map(function (f) { return f.name; });
// fact_seq 由 store 赋值（序列）——audit_fact_seq 在 openWriter 建序；schema_registry FK 种子行同处幂等引导。
const FACT_SEQ_NAME = 'audit_fact_seq';
const INSERT_SQL = 'INSERT INTO audit_fact (fact_seq, ' + WRITE_COLUMNS.join(', ') + ', ingested_at) VALUES (nextval(' +
    String.fromCharCode(39) + FACT_SEQ_NAME + String.fromCharCode(39) + '), ' +
    WRITE_COLUMNS.map(function () { return '?'; }).join(', ') + ', current_timestamp)';
let duckdbModulePromise = null;
function loadDuckdb() {
    if (!duckdbModulePromise) {
        duckdbModulePromise = import('@duckdb/node-api').catch(function (e) {
            duckdbModulePromise = null;
            throw new Error('DUCKDB-UNAVAILABLE: @duckdb/node-api 无法解析——git-clone 型插件安装不带 node_modules；在插件目录执行 `npm install` 后 facts/audit 读写面恢复（' + String(e && e.message || e) + '）');
        });
    }
    return duckdbModulePromise;
}
export async function openWriter(dbPath) {
    const { DuckDBInstance, DuckDBConnection } = await loadDuckdb();
    const instance = await DuckDBInstance.create(dbPath, { access_mode: 'READ_WRITE' });
    const connection = await DuckDBConnection.create(instance);
    await connection.run(SCHEMA_REGISTRY_DDL);
    await connection.run(AUDIT_FACT_DDL);
    await connection.run('CREATE SEQUENCE IF NOT EXISTS ' + FACT_SEQ_NAME + ' START 1');
    await connection.run("INSERT INTO schema_registry (version, change_event, compatibility, description) SELECT 1, 'Registered', 'FULL', 'schema v0 append-only fact table' WHERE NOT EXISTS (SELECT 1 FROM schema_registry WHERE version = 1)");
    return connection;
}
export async function openReader(dbPath) {
    const { DuckDBInstance, DuckDBConnection } = await loadDuckdb();
    const instance = await DuckDBInstance.create(dbPath, { access_mode: 'READ_ONLY' });
    return await DuckDBConnection.create(instance);
}
export async function appendFact(connection, event) {
    assertAppendOnly(INSERT_SQL);
    const row = WRITE_COLUMNS.map(function (c) {
        if (c === 'schema_version') {
            return SCHEMA_VERSION_V0;
        }
        const v = event[c];
        return v === undefined ? null : v;
    });
    await connection.run(INSERT_SQL, row);
}
export async function queryFacts(connection, sql) {
    assertAppendOnly(sql);
    return await connection.run(sql);
}
export function factFieldNames() {
    return AUDIT_FACT_FIELDS.map(function (f) { return f.name; });
}
