// fact/projection.ts — MCP facts 只读投影（D-053④ / A-057）
// 宿主 agent 叙事面的唯一取数主路：固定 SELECT 形（不接裸 SQL——stub 面收窄防注入）；
// 连接=openReader（READ_ONLY 实例，SWMR 读者位，A-007）；投影列=FactEvent 十三列。
import { openReader } from './store.js';
import { assertAppendOnly } from './schema.js';
const MAX_LIMIT = 500;
const PROJECTION_COLUMNS = 'fact_id, trace_id, baggage_id, scale, quadrant, dimension, collector_id, repo_ref, subject_ref, evidence_ref, metric, value_json, CAST(observed_at AS VARCHAR) AS observed_at';
// 过滤值只允许固定列等值匹配——值走参数绑定不进 SQL 文本，列名白名单硬编码。
export function buildProjectionSql(filter) {
    const where = [];
    const params = [];
    if (filter.scale) {
        where.push('scale = ?');
        params.push(filter.scale);
    }
    if (filter.repo_ref) {
        where.push('repo_ref = ?');
        params.push(filter.repo_ref);
    }
    if (filter.subject_ref) {
        where.push('subject_ref = ?');
        params.push(filter.subject_ref);
    }
    const limit = filter.limit === undefined ? 50 : Math.min(Math.max(Math.floor(filter.limit), 1), MAX_LIMIT);
    const sql = 'SELECT ' + PROJECTION_COLUMNS + ' FROM audit_fact' + (where.length ? ' WHERE ' + where.join(' AND ') : '') + ' ORDER BY fact_seq LIMIT ' + limit;
    return { sql: sql, params: params };
}
export async function projectFacts(dbPath, filter) {
    const conn = await openReader(dbPath);
    try {
        const q = buildProjectionSql(filter);
        assertAppendOnly(q.sql);
        const reader = await conn.run(q.sql, q.params);
        const rows = await reader.getRows();
        const names = reader.columnNames();
        return rows.map(function (r) {
            const o = {};
            names.forEach(function (n, i) {
                const v = r[i];
                // JSON 可序列化归一：BigInt→Number、Date→ISO（TIMESTAMPTZ 已 SQL 层 CAST 为 VARCHAR）
                o[n] = typeof v === 'bigint' ? Number(v) : (v instanceof Date ? v.toISOString() : v);
            });
            return o;
        });
    }
    finally {
        conn.closeSync();
    }
}
