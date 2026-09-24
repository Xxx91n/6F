// fact/projection.ts — MCP facts 只读投影（D-053④ / A-057）
// 宿主 agent 叙事面的唯一取数主路：固定 SELECT 形（不接裸 SQL——stub 面收窄防注入）；
// 连接=openReader（READ_ONLY 实例，SWMR 读者位，A-007）；投影列=FactEvent 十三列。
import { openReader, closeDuckdb } from './store.js';
import { assertAppendOnly } from './schema.js';
import { buildFileCard, headShaOfRepoRef } from './file-card.js';
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
        return rows.map(normalizeFactRow(names));
    }
    finally {
        closeDuckdb(conn);
    }
}
function normalizeFactRow(names) {
    return function (r) {
        const o = {};
        names.forEach(function (n, i) {
            const v = r[i];
            // JSON 可序列化归一：BigInt→Number、Date→ISO（TIMESTAMPTZ 已 SQL 层 CAST 为 VARCHAR）
            o[n] = typeof v === 'bigint' ? Number(v) : (v instanceof Date ? v.toISOString() : v);
        });
        return o;
    };
}
const FILE_CARD_SET_CAP = 200000; // 观测集内 Micro-B 事实硬帽（percentile 需全集——超帽如实截断仍确定性）
function likeEscape(s) {
    return s.split('!').join('!!').split('%').join('!%').split('_').join('!_');
}
export async function projectFileCard(dbPath, q) {
    const conn = await openReader(dbPath);
    try {
        const setSql = 'SELECT repo_ref, MAX(CAST(observed_at AS VARCHAR)) AS last_obs FROM audit_fact ' +
            "WHERE scale = 'Micro-B' AND repo_ref LIKE ? ESCAPE '!' GROUP BY repo_ref ORDER BY last_obs DESC, repo_ref ASC LIMIT 1000";
        assertAppendOnly(setSql);
        const setReader = await conn.run(setSql, [(likeEscape(q.repo) + '@%')]);
        const setRows = await setReader.getRows();
        const sets = setRows.map(function (r) {
            const rr = String(r[0]);
            return { repo_ref: rr, head_sha: headShaOfRepoRef(rr) };
        });
        const shas = sets.map(function (s) { return s.head_sha; }).filter(function (s) { return s !== null; });
        let picked = null;
        if (q.at !== undefined && q.at !== null && q.at.length > 0) {
            picked = sets.filter(function (s) {
                return s.head_sha === q.at || (s.head_sha !== null && q.at.length >= 7 && s.head_sha.indexOf(q.at) === 0);
            })[0] || null;
        }
        else {
            picked = sets[0] || null;
        }
        const facts = [];
        if (picked !== null) {
            const fSql = 'SELECT ' + PROJECTION_COLUMNS + ' FROM audit_fact WHERE scale = ? AND repo_ref = ? ORDER BY fact_seq LIMIT ' + FILE_CARD_SET_CAP;
            assertAppendOnly(fSql);
            const fReader = await conn.run(fSql, ['Micro-B', picked.repo_ref]);
            const fRows = await fReader.getRows();
            const names = fReader.columnNames();
            const norm = normalizeFactRow(names);
            for (const r of fRows) {
                facts.push(norm(r));
            }
        }
        return buildFileCard({
            subject: q.subject,
            setRepoRef: picked === null ? null : picked.repo_ref,
            setFacts: facts,
            availableHeadShas: shas,
            pinnedSha: q.at !== undefined && q.at !== null && q.at.length > 0 ? q.at : null,
            currentHeadSha: q.current_head_sha === undefined ? null : q.current_head_sha,
            source: q.source || 'unknown',
            cliGuidance: q.cli_guidance === undefined ? null : q.cli_guidance
        });
    }
    finally {
        closeDuckdb(conn);
    }
}
const QUAR_PROJECTION_COLUMNS = 'run_id, commit_sha, field_name, disposition, reason_code, raw_bytes_hex, is_trunc, original_length, sha256_full, collector, CAST(recorded_at AS VARCHAR) AS recorded_at';
export function buildQuarantineSql(filter) {
    const where = [];
    const params = [];
    if (filter.run_id) {
        where.push('run_id = ?');
        params.push(filter.run_id);
    }
    if (filter.field_name) {
        where.push('field_name = ?');
        params.push(filter.field_name);
    }
    const limit = filter.limit === undefined ? 50 : Math.min(Math.max(Math.floor(filter.limit), 1), MAX_LIMIT);
    const sql = 'SELECT ' + QUAR_PROJECTION_COLUMNS + ' FROM quarantine_log' + (where.length ? ' WHERE ' + where.join(' AND ') : '') + ' ORDER BY q_seq LIMIT ' + limit;
    return { sql: sql, params: params };
}
export async function projectQuarantine(dbPath, filter) {
    const conn = await openReader(dbPath);
    try {
        const q = buildQuarantineSql(filter);
        assertAppendOnly(q.sql);
        const reader = await conn.run(q.sql, q.params);
        const rows = await reader.getRows();
        const names = reader.columnNames();
        return rows.map(function (r) {
            const o = {};
            names.forEach(function (n, i) {
                const v = r[i];
                o[n] = typeof v === 'bigint' ? Number(v) : (v instanceof Date ? v.toISOString() : v);
            });
            return o;
        });
    }
    finally {
        closeDuckdb(conn);
    }
}
