// fact/projection.ts — MCP facts 只读投影（D-053④ / A-057）
// 宿主 agent 叙事面的唯一取数主路：固定 SELECT 形（不接裸 SQL——stub 面收窄防注入）；
// 连接=openReader（READ_ONLY 实例，SWMR 读者位，A-007）；投影列=FactEvent 十三列。
import { openReader, closeDuckdb } from './store.js';
import { assertAppendOnly } from './schema.js';
import type { FactEvent } from './store.js';
import { buildFileCard, headShaOfRepoRef } from './file-card.js';
import type { FileCard } from './file-card.js';

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
    return rows.map(normalizeFactRow(names));
  } finally {
    closeDuckdb(conn);
  }
}

function normalizeFactRow(names: string[]): (r: unknown[]) => FactEvent {
  return function (r: unknown[]) {
    const o: Record<string, unknown> = {};
    names.forEach(function (n, i) {
      const v = r[i];
      // JSON 可序列化归一：BigInt→Number、Date→ISO（TIMESTAMPTZ 已 SQL 层 CAST 为 VARCHAR）
      o[n] = typeof v === 'bigint' ? Number(v) : (v instanceof Date ? v.toISOString() : v);
    });
    return o as unknown as FactEvent;
  };
}

// ---------- file_card 只读投影（#80 步② / D-126 / ADR-0023） ----------
// 观测集语义：repo_ref=<name>@<head_sha> 天然成集；默认=最新已采集观测集（MAX(observed_at) 平手按 repo_ref 字典序钉死）；
// at:<sha>=显式 opt-in pin——精确匹配或 ≥7 字符唯一前缀（常量纪律：不做模糊解析）。
// 本面只读：miss→never_collected 显式态＋CLI 指引（lazy 补采唯一入口=CLI audit file，MCP 永不写）。
export interface FileCardQuery {
  repo: string;                    // repo 名（repo_ref 的 '@' 前缀部）
  subject: string;                 // 文件路径（卡内归一）
  at?: string;                     // at:<sha> pin
  current_head_sha?: string | null;   // 调用面注入的当前 HEAD 探针结果（null=未知→staleness.drift=unknown）
  source?: 'prefetch' | 'backfill' | 'unknown';
  cli_guidance?: string | null;    // miss.never_collected 可行动指引（触发面拼好注入）
}

const FILE_CARD_SET_CAP = 200000;   // 观测集内 Micro-B 事实硬帽（percentile 需全集——超帽如实截断仍确定性）
const FILE_CARD_LINEAGE_EDGE_CAP = 10000;   // 血缘边池硬帽（D-137② 跨观测集解析——病态仓库防失控，截断如实）

function likeEscape(s: string): string {
  return s.split('!').join('!!').split('%').join('!%').split('_').join('!_');
}

export async function projectFileCard(dbPath: string, q: FileCardQuery): Promise<FileCard> {
  const conn = await openReader(dbPath);
  try {
    const setSql = 'SELECT repo_ref, MAX(CAST(observed_at AS VARCHAR)) AS last_obs FROM audit_fact ' +
      "WHERE scale = 'Micro-B' AND repo_ref LIKE ? ESCAPE '!' GROUP BY repo_ref ORDER BY last_obs DESC, repo_ref ASC LIMIT 1000";
    assertAppendOnly(setSql);
    const setReader = await conn.run(setSql, [(likeEscape(q.repo) + '@%')] as never);
    const setRows = await setReader.getRows();
    const sets = setRows.map(function (r) {
      const rr = String(r[0]);
      return { repo_ref: rr, head_sha: headShaOfRepoRef(rr), last_obs: String(r[1]) };
    });
    const shas = sets.map(function (s) { return s.head_sha; }).filter(function (s): s is string { return s !== null; });
    let picked: { repo_ref: string; head_sha: string | null } | null = null;
    let pinAmbiguous: string[] | undefined = undefined;
    if (q.at !== undefined && q.at !== null && q.at.length > 0) {
      // F7a（#83）：pin 前缀唯一性验重——精确 40 位命中直取；≥7 前缀命中 >1=歧义不猜（not_tracked_at_sha 披露全部命中）
      const exact = sets.filter(function (s) { return s.head_sha === q.at; });
      if (exact.length > 0) {
        picked = exact[0];
      } else if ((q.at as string).length >= 7) {
        const hits = sets.filter(function (s) { return s.head_sha !== null && (s.head_sha as string).indexOf(q.at as string) === 0; });
        if (hits.length === 1) { picked = hits[0]; }
        else if (hits.length > 1) { pinAmbiguous = hits.map(function (s) { return s.head_sha as string; }); }
      }
    } else {
      picked = sets[0] || null;
    }
    const facts: FactEvent[] = [];
    let setTruncated = false;
    if (picked !== null) {
      // F7h（#83）：截断卡面标记——集内事实行数超 CAP 时如实披露（percentile 语义=截断集上计算，不静默）
      const cSql = 'SELECT COUNT(*) FROM audit_fact WHERE scale = ? AND repo_ref = ?';
      assertAppendOnly(cSql);
      const cReader = await conn.run(cSql, ['Micro-B', picked.repo_ref] as never);
      const cRows = await cReader.getRows();
      setTruncated = Number(cRows[0][0]) > FILE_CARD_SET_CAP;
      const fSql = 'SELECT ' + PROJECTION_COLUMNS + ' FROM audit_fact WHERE scale = ? AND repo_ref = ? ORDER BY fact_seq LIMIT ' + FILE_CARD_SET_CAP;
      assertAppendOnly(fSql);
      const fReader = await conn.run(fSql, ['Micro-B', picked.repo_ref] as never);
      const fRows = await fReader.getRows();
      const names = fReader.columnNames();
      const norm = normalizeFactRow(names);
      for (const r of fRows) { facts.push(norm(r)); }
    }
    // D-137② 跨观测集血缘解析（#80 步③）：file.renamed 边池=选中集∪祖先观测集。
    //   「祖先」语义=同 repo 观测集中 MAX(observed_at) ≤ 选中集者——事实仓仅持采集时点序（git 祖先关系
    //   不入库，pin 精确性由 D-126⑤ at:sha 引用层纪律承担）；词表侧用 observed_at 字符串词典序（ISO 规范化后可比较）。
    const lineageFacts: FactEvent[] = [];
    if (picked !== null) {
      const pickedSet = sets.filter(function (s) { return s.repo_ref === picked.repo_ref; })[0];
      const ancestorRefs = pickedSet === undefined ? [] : sets.filter(function (s) {
        return s.repo_ref !== picked.repo_ref && s.last_obs <= pickedSet.last_obs;
      }).map(function (s) { return s.repo_ref; });
      if (ancestorRefs.length > 0) {
        const ph = ancestorRefs.map(function () { return '?'; }).join(',');
        const lSql = 'SELECT ' + PROJECTION_COLUMNS + ' FROM audit_fact WHERE scale = ? AND metric = ? AND repo_ref IN (' + ph + ') ORDER BY fact_seq LIMIT ' + FILE_CARD_LINEAGE_EDGE_CAP;
        assertAppendOnly(lSql);
        const lReader = await conn.run(lSql, ['Micro-B', 'file.renamed'].concat(ancestorRefs) as never);
        const lRows = await lReader.getRows();
        const lNorm = normalizeFactRow(lReader.columnNames());
        for (const r of lRows) { lineageFacts.push(lNorm(r)); }
      }
    }
    return buildFileCard({
      subject: q.subject,
      setRepoRef: picked === null ? null : picked.repo_ref,
      setFacts: facts,
      lineageFacts: lineageFacts,
      availableHeadShas: shas,
      pinnedSha: q.at !== undefined && q.at !== null && q.at.length > 0 ? q.at : null,
      pinnedAmbiguous: pinAmbiguous,
      currentHeadSha: q.current_head_sha === undefined ? null : q.current_head_sha,
      source: q.source || 'unknown',
      cliGuidance: q.cli_guidance === undefined ? null : q.cli_guidance,
      setTruncated: setTruncated
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
