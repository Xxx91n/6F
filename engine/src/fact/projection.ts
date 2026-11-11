// fact/projection.ts —— 给 MCP 用的只读事实视图
// 用的人按需来取，不直接摸写入那头。
// 外面读事实就走这儿：查询是写死的 SELECT，不拼裸 SQL，防注入；
// 库用只读连接打开，投影出来的字段对应事实表那 13 个常规列。
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

// 只准在固定那几列上做等值过滤，值走占位符绑定，不塞进 SQL 文本里。
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
      // 返回的东西得能直接转 JSON：BigInt 转数字，Date 转 ISO 字符串
      o[n] = typeof v === 'bigint' ? Number(v) : (v instanceof Date ? v.toISOString() : v);
    });
    return o as unknown as FactEvent;
  };
}

// ---------- file_card 的只读视图 ----------
// 观测集怎么算：repo_ref=<name>@<head_sha> 这么一组；默认取采得最新的那一组；
// 也可以指定 at:<sha> 精确对上，或者拿唯一前缀来查。
// 这一路只管读：查不到就把「还没采」的状态和命令行怎么补的话一块儿给你，这流程里绝不写东西。
export interface FileCardQuery {
  repo: string; // 仓库名（repo_ref 里 @ 前面那截）
  subject: string; // 文件路径（卡里自己归整）
  at?: string; // 要查哪个提交
  current_head_sha?: string | null; // 当前最新提交号（null 就是不知道）
  source?: 'prefetch' | 'backfill' | 'unknown';
  cli_guidance?: string | null; // 还没采的时候怎么办
  lineage_edge_cap?: number; // 改名边池的上限（主要给特定测试用）
}

const FILE_CARD_SET_CAP = 200000; // 一组观测集里事实条数的上限（超了就截）
const FILE_CARD_LINEAGE_EDGE_CAP = 10000; // 改名关联边池的上限

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
    let picked: { repo_ref: string; head_sha: string | null; last_obs: string } | null = null;
    let pinAmbiguous: string[] | undefined = undefined;
    if (q.at !== undefined && q.at !== null && q.at.length > 0) {
      // 提交号怎么对：40 位全写就是精确对；7 位及以上的前缀撞上好几个就记下歧义，不许瞎猜。
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
      // 数数数据集里的事实超没超上限，超了打截断标记
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
    // 跨观测集拉改名关系：当前这组，连同更早那几组里的改名记录一块儿看。
    const lineageFacts: FactEvent[] = [];
    let lineageEdgeCapHit = false;
    if (picked !== null) {
      const ancestorRefs = sets.filter(function (s) {
        return s.repo_ref !== picked.repo_ref && s.last_obs <= picked.last_obs;
      }).map(function (s) { return s.repo_ref; });
      if (ancestorRefs.length > 0) {
        const edgeCap = Math.max(1, Math.floor(q.lineage_edge_cap === undefined ? FILE_CARD_LINEAGE_EDGE_CAP : q.lineage_edge_cap));
        const ph = ancestorRefs.map(function () { return '?'; }).join(',');
        const lSql = 'SELECT ' + PROJECTION_COLUMNS + ' FROM audit_fact WHERE scale = ? AND metric = ? AND repo_ref IN (' + ph + ') ORDER BY fact_seq LIMIT ' + edgeCap;
        assertAppendOnly(lSql);
        const lReader = await conn.run(lSql, ['Micro-B', 'file.renamed'].concat(ancestorRefs) as never);
        const lRows = await lReader.getRows();
        const lNorm = normalizeFactRow(lReader.columnNames());
        for (const r of lRows) { lineageFacts.push(lNorm(r)); }
        // 记一笔：拉的时候有没有顶到上限被截
        if (lRows.length >= edgeCap) { lineageEdgeCapHit = true; }
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
  } finally {
    closeDuckdb(conn);
  }
}

// ---------- quarantine_log 的只读视图 ----------
// 查隔离记录的安全接口：列名写死，参数绑好，条数有上限。
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
