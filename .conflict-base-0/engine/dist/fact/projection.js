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
const FILE_CARD_LINEAGE_EDGE_CAP = 10000; // 血缘边池硬帽（D-137② 跨观测集解析——病态仓库防失控，截断如实）
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
            return { repo_ref: rr, head_sha: headShaOfRepoRef(rr), last_obs: String(r[1]) };
        });
        const shas = sets.map(function (s) { return s.head_sha; }).filter(function (s) { return s !== null; });
        let picked = null;
        let pinAmbiguous = undefined;
        if (q.at !== undefined && q.at !== null && q.at.length > 0) {
            // F7a（#83）：pin 前缀唯一性验重——精确 40 位命中直取；≥7 前缀命中 >1=歧义不猜（not_tracked_at_sha 披露全部命中）
            const exact = sets.filter(function (s) { return s.head_sha === q.at; });
            if (exact.length > 0) {
                picked = exact[0];
            }
            else if (q.at.length >= 7) {
                const hits = sets.filter(function (s) { return s.head_sha !== null && s.head_sha.indexOf(q.at) === 0; });
                if (hits.length === 1) {
                    picked = hits[0];
                }
                else if (hits.length > 1) {
                    pinAmbiguous = hits.map(function (s) { return s.head_sha; });
                }
            }
        }
        else {
            picked = sets[0] || null;
        }
        const facts = [];
        let setTruncated = false;
        if (picked !== null) {
            // F7h（#83）：截断卡面标记——集内事实行数超 CAP 时如实披露（percentile 语义=截断集上计算，不静默）
            const cSql = 'SELECT COUNT(*) FROM audit_fact WHERE scale = ? AND repo_ref = ?';
            assertAppendOnly(cSql);
            const cReader = await conn.run(cSql, ['Micro-B', picked.repo_ref]);
            const cRows = await cReader.getRows();
            setTruncated = Number(cRows[0][0]) > FILE_CARD_SET_CAP;
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
        // D-137② 跨观测集血缘解析（#80 步③）：file.renamed 边池=选中集∪祖先观测集。
        //   「祖先」语义=同 repo 观测集中 MAX(observed_at) ≤ 选中集者——事实仓仅持采集时点序（git 祖先关系
        //   不入库，pin 精确性由 D-126⑤ at:sha 引用层纪律承担）；词表侧用 observed_at 字符串词典序（ISO 规范化后可比较）。
        const lineageFacts = [];
        let lineageEdgeCapHit = false;
        if (picked !== null) {
            const ancestorRefs = sets.filter(function (s) {
                return s.repo_ref !== picked.repo_ref && s.last_obs <= picked.last_obs; // picked 恒为 sets 元素——last_obs 随行不重查
            }).map(function (s) { return s.repo_ref; });
            if (ancestorRefs.length > 0) {
                const edgeCap = Math.max(1, Math.floor(q.lineage_edge_cap === undefined ? FILE_CARD_LINEAGE_EDGE_CAP : q.lineage_edge_cap));
                const ph = ancestorRefs.map(function () { return '?'; }).join(',');
                const lSql = 'SELECT ' + PROJECTION_COLUMNS + ' FROM audit_fact WHERE scale = ? AND metric = ? AND repo_ref IN (' + ph + ') ORDER BY fact_seq LIMIT ' + edgeCap;
                assertAppendOnly(lSql);
                const lReader = await conn.run(lSql, ['Micro-B', 'file.renamed'].concat(ancestorRefs));
                const lRows = await lReader.getRows();
                const lNorm = normalizeFactRow(lReader.columnNames());
                for (const r of lRows) {
                    lineageFacts.push(lNorm(r));
                }
                // A4 截断如实：拉取量触帽=祖先边池可能不全——经卡面 truncated 伞披露（A4）
                if (lRows.length >= edgeCap) {
                    lineageEdgeCapHit = true;
                }
            }
        }
        return buildFileCard({
            subject: q.subject,
            setRepoRef: picked === null ? null : picked.repo_ref,
            setFacts: facts,
            lineageFacts: lineageFacts,
            lineageEdgeCapHit: lineageEdgeCapHit,
            availableHeadShas: shas,
            pinnedSha: q.at !== undefined && q.at !== null && q.at.length > 0 ? q.at : null,
            pinnedAmbiguous: pinAmbiguous,
            currentHeadSha: q.current_head_sha === undefined ? null : q.current_head_sha,
            source: q.source || 'unknown',
            cliGuidance: q.cli_guidance === undefined ? null : q.cli_guidance,
            setTruncated: setTruncated
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
