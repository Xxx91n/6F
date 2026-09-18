// DuckDB fact store — 绑定：@duckdb/node-api（唯一选型，锁版本 1.5.5-r.4）
// 连接拓扑：唯一写者（READ_WRITE）+ 任意读者（READ_ONLY），承接 A-007 单写多读 SWMR。
// 本模块是 engine 对外唯一写入口：只暴露 appendFact / queryFacts，不暴露裸 SQL 写接口。
// 本机不安装原生绑定、不构建；构建与测试一律走 CI（prompt 专属 delta 第 3 条）。
// #59/D-067：原生绑定改懒加载——插件 git-clone 安装不带 node_modules，静态 import 会使
//   整个 CLI 在模块解析期崩溃（MCP server 握手都起不来）。duckdb 仅在 openWriter/openReader
//   实际调用时解析；缺失时抛结构化 DUCKDB-UNAVAILABLE，由调用面转译成 isError/exit 2。
import type { DuckDBConnection, DuckDBValue } from '@duckdb/node-api';
import { AUDIT_FACT_DDL, SCHEMA_REGISTRY_DDL, AUDIT_FACT_FIELDS, assertAppendOnly, SCHEMA_VERSION_V0, type FactField } from './schema.js';

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

const WRITE_COLUMNS: readonly string[] = AUDIT_FACT_FIELDS
  .filter(function (f) { return f.name !== 'fact_seq' && f.name !== 'ingested_at'; })
  .map(function (f) { return f.name; });

// fact_seq 由 store 赋值（序列）——audit_fact_seq 在 openWriter 建序；schema_registry FK 种子行同处幂等引导。
const FACT_SEQ_NAME = 'audit_fact_seq';

const INSERT_SQL: string =
  'INSERT INTO audit_fact (fact_seq, ' + WRITE_COLUMNS.join(', ') + ', ingested_at) VALUES (nextval(' +
  String.fromCharCode(39) + FACT_SEQ_NAME + String.fromCharCode(39) + '), ' +
  WRITE_COLUMNS.map(function () { return '?'; }).join(', ') + ', current_timestamp)';

type DuckDBModule = typeof import('@duckdb/node-api');
let duckdbModulePromise: Promise<DuckDBModule> | null = null;

function loadDuckdb(): Promise<DuckDBModule> {
  if (!duckdbModulePromise) {
    duckdbModulePromise = import('@duckdb/node-api').catch(function (e) {
      duckdbModulePromise = null;
      throw new Error('DUCKDB-UNAVAILABLE: @duckdb/node-api 无法解析——git-clone 型插件安装不带 node_modules；在插件目录执行 `npm install` 后 facts/audit 读写面恢复（' + String(e && (e as Error).message || e) + '）');
    });
  }
  return duckdbModulePromise;
}

export async function openWriter(dbPath: string): Promise<DuckDBConnection> {
  const { DuckDBInstance, DuckDBConnection } = await loadDuckdb();
  const instance = await DuckDBInstance.create(dbPath, { access_mode: 'READ_WRITE' });
  const connection = await DuckDBConnection.create(instance);
  await connection.run(SCHEMA_REGISTRY_DDL);
  await connection.run(AUDIT_FACT_DDL);
  await connection.run('CREATE SEQUENCE IF NOT EXISTS ' + FACT_SEQ_NAME + ' START 1');
  await connection.run("INSERT INTO schema_registry (version, change_event, compatibility, description) SELECT 1, 'Registered', 'FULL', 'schema v0 append-only fact table' WHERE NOT EXISTS (SELECT 1 FROM schema_registry WHERE version = 1)");
  return connection;
}

export async function openReader(dbPath: string): Promise<DuckDBConnection> {
  const { DuckDBInstance, DuckDBConnection } = await loadDuckdb();
  const instance = await DuckDBInstance.create(dbPath, { access_mode: 'READ_ONLY' });
  return await DuckDBConnection.create(instance);
}

export async function appendFact(connection: DuckDBConnection, event: FactEvent): Promise<void> {
  assertAppendOnly(INSERT_SQL);
  const row = WRITE_COLUMNS.map(function (c) {
    if (c === 'schema_version') { return SCHEMA_VERSION_V0; }
    const v = (event as unknown as Record<string, unknown>)[c];
    return v === undefined ? null : v;
  }) as unknown as DuckDBValue[];
  await connection.run(INSERT_SQL, row);
}

export async function queryFacts(connection: DuckDBConnection, sql: string) {
  assertAppendOnly(sql);
  return await connection.run(sql);
}

export function factFieldNames(): readonly string[] {
  return AUDIT_FACT_FIELDS.map(function (f: FactField) { return f.name; });
}
