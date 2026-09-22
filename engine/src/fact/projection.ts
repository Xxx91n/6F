// fact/projection.ts — MCP facts 只读投影（D-053④ / A-057）
// 宿主 agent 叙事面的唯一取数主路：固定 SELECT 形（不接裸 SQL——stub 面收窄防注入）；
// 连接=openReader（READ_ONLY 实例，SWMR 读者位，A-007）；投影列=FactEvent 十三列。
import { openReader, closeDuckdb } from './store.js';
import { assertAppendOnly } from './schema.js';
import type { FactEvent } from './store.js';

export interface FactProjectionFilter {
  scale?: string;
  repo_ref?: string;
  subject_ref?: string;
  limit?: number;
}

const MAX_LIMIT = 500;
const PROJECTION_COLUMNS = 'fact_id, trace_id, baggage_id, scale, quadrant, dimension, collector_id, repo_ref, subject_ref, evidence_ref, metric, value_json, CAST(observed_at AS VARCHAR) AS observed_at';

// 过滤值只允许固定列等值匹配——值走参数绑定不进 SQL 文本，列名白名单硬编码。
export function buildProjectionSql(filter: FactProjectionFilter): { sql: string; params: string[] } {
  const where: string[] = [];
  const params: string[] = [];
  if (filter.scale) { where.push('scale = ?'); params.push(filter.scale); }
  if (filter.repo_ref) { where.push('repo_ref = ?'); params.push(filter.repo_ref); }
  if (filter.subject_ref) { where.push('subject_ref = ?'); params.push(filter.subject_ref); }
  const limit = filter.limit === undefined ? 50 : Math.min(Math.max(Math.floor(filter.limit), 1), MAX_LIMIT);
  const sql = 'SELECT ' + PROJECTION_COLUMNS + ' FROM audit_fact' + (where.length ? ' WHERE ' + where.join(' AND ') : '') + ' ORDER BY fact_seq LIMIT ' + limit;
  return { sql: sql, params: params };
}

export async function projectFacts(dbPath: string, filter: FactProjectionFilter): Promise<FactEvent[]> {
  const conn = await openReader(dbPath);
  try {
    const q = buildProjectionSql(filter);
    assertAppendOnly(q.sql);
    const reader = await conn.run(q.sql, q.params as never);
    const rows = await reader.getRows();
    const names = reader.columnNames();
    return rows.map(function (r) {
      const o: Record<string, unknown> = {};
      names.forEach(function (n, i) {
        const v = r[i];
        // JSON 可序列化归一：BigInt→Number、Date→ISO（TIMESTAMPTZ 已 SQL 层 CAST 为 VARCHAR）
        o[n] = typeof v === 'bigint' ? Number(v) : (v instanceof Date ? v.toISOString() : v);
      });
      return o as unknown as FactEvent;
    });
  } finally {
    closeDuckdb(conn);
  }
}

// ---------- quarantine_log 只读投影（#78 / D-113② / D-118） ----------
// 与 projectFacts 同形面收窄：固定列集、值走参数绑定、LIMIT 硬帽、READ_ONLY 连接。
// raw_bytes_hex 回显有界（≤131072 chars hex，D-117 截断+指纹三件套随行）。
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

const QUAR_PROJECTION_COLUMNS = 'run_id, commit_sha, field_name, disposition, reason_code, raw_bytes_hex, is_trunc, original_length, sha256_full, collector, CAST(recorded_at AS VARCHAR) AS recorded_at';

export function buildQuarantineSql(filter: QuarantineProjectionFilter): { sql: string; params: string[] } {
  const where: string[] = [];
  const params: string[] = [];
  if (filter.run_id) { where.push('run_id = ?'); params.push(filter.run_id); }
  if (filter.field_name) { where.push('field_name = ?'); params.push(filter.field_name); }
  const limit = filter.limit === undefined ? 50 : Math.min(Math.max(Math.floor(filter.limit), 1), MAX_LIMIT);
  const sql = 'SELECT ' + QUAR_PROJECTION_COLUMNS + ' FROM quarantine_log' + (where.length ? ' WHERE ' + where.join(' AND ') : '') + ' ORDER BY q_seq LIMIT ' + limit;
  return { sql: sql, params: params };
}

export async function projectQuarantine(dbPath: string, filter: QuarantineProjectionFilter): Promise<QuarantineRow[]> {
  const conn = await openReader(dbPath);
  try {
    const q = buildQuarantineSql(filter);
    assertAppendOnly(q.sql);
    const reader = await conn.run(q.sql, q.params as never);
    const rows = await reader.getRows();
    const names = reader.columnNames();
    return rows.map(function (r) {
      const o: Record<string, unknown> = {};
      names.forEach(function (n, i) {
        const v = r[i];
        o[n] = typeof v === 'bigint' ? Number(v) : (v instanceof Date ? v.toISOString() : v);
      });
      return o as unknown as QuarantineRow;
    });
  } finally {
    closeDuckdb(conn);
  }
}
