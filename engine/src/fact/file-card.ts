// fact/file-card.ts — Micro-B 单文件档审计卡
// 理由：文件卡是只读阅读视图，只给建议不进裁决，且在 MCP 接口下绝不写入数据。
// 纯逻辑模块：输入为已有事实数据与当前提交号；不直接访问文件系统，不启动子进程。
// 卡片分层设计：
//   kernel 层：基础观测数据按分析项归类直出，每行携带出处坐标与关联信息；
//   derived 层：根据基础数据计算得出的衍生指标（如热点优先级规则、仓内百分位排行等），可稳定复算；
//   narrative 层：文字说明部分，只允许引用已计算出的键名，并附带键名存在性检查结果。
// 独立定位：本卡片不包含正式裁决结论，明确标记 advisory: true，优先级仅用于排序参考。
// 未找到数据的四种状态：从未采集（附带操作提示）/ 当前提交未追踪 / 不适用（如二进制文件或生成文件）/ 已改名跳转。
// 文件改名记录处理：通过改名事实构建改名关系图，自动反向追溯历史旧名，将旧名字段并入当前文件卡中。
// 历史不足与特殊状态：新文件或修改次数过少时只保留基础静态指标，不输出衍生排行。

import { normalizeSubjectPath } from './subject.js';
import type { FactEvent } from './store.js';

export const FILE_CARD_SCHEMA_VERSION = 'file-card@v1';
export const FILE_CARD_RULE_VERSION = 'hotspot_priority_v1';
export const FILE_CARD_TOP_N = 20;
export const FILE_CARD_INSUFFICIENT_MIN_REVS = 3;   // 修改少于 3 次视为历史不足（包含新文件 1 次）

// 失败与历史不足时的字段过滤：
//   依赖历史演化数据的分析项在历史不足或新文件时不放入卡片；
//   静态指标项则正常保留。
export const FILE_CARD_HISTORY_DERIVED_FACETS: readonly string[] = [
  'entity-churn', 'entity-ownership', 'code-age', 'hotspots', 'coupling'
];
export const FILE_CARD_STATIC_FACETS: readonly string[] = [
  'revisions', 'abs-churn', 'author-churn', 'hotspot-velocity', 'stale-code', 'architecture-trend',
  'health-trend', 'lead-time', 'release-cadence', 'messages', 'god-classes', 'architecture-metrics',
  'dependency-cycles', 'modularity-violations', 'instability', 'architecture-roles', 'ownership',
  'bus-factor', 'main-dev', 'main-dev-by-revs', 'main-dev-by-deletions', 'knowledge-islands',
  'communication', 'coordination-needs', 'team-composition', 'marginal-owner-risk', 'pair-programming',
  'function-hotspots'
];

// 指标未展示原因码：包含新文件和历史记录不足两种情况。
export type SuppressedFacetReason = 'new_file' | 'insufficient_history';
export interface SuppressedFacet { facet: string; reason: SuppressedFacetReason }

export type MissState = 'never_collected' | 'not_tracked_at_sha' | 'not_applicable' | 'renamed_to';
export type CardType = 'file-audit-card' | 'not_applicable' | 'miss';
export type FailureState = 'ok' | 'new_file' | 'insufficient_history' | 'not_applicable';
export type DriftState = 'fresh' | 'behind' | 'unknown';

export interface FileCardMiss {
  state: MissState;
  detail: string;
  renamed_to?: string;
  lineage_edge?: { from: string; to: string; commit_sha: string; similarity: number };
  revalidated?: boolean;            // 已改名：检查目标文件在观测数据中是否存在（跳转前确认有效性）
  available_head_shas?: string[];   // 当前提交未追踪：列出已有数据的提交号清单供参考
  cli_guidance?: string;            // 从未采集：提供命令行采集的操作建议
}

// 文件改名记录说明：明确记录哪些旧名称被合并、消费了哪些改名记录、是否检测到循环改名或链条超长截断。
export interface FileCardLineageEdge { from: string; to: string; commit_sha: string; similarity: number }
export interface FileCardLineage {
  stitched_from: string[];              // 追溯出的历史旧路径列表（保持固定排序）
  edges: FileCardLineageEdge[];         // 消费的文件改名记录边（按提交号排序）
  cycle_detected: boolean;              // 循环检测标记：发现闭环时停止该分支追溯并标记
  truncated: boolean;                   // 追溯链路超出上限时标记为截断
}

export const FILE_CARD_LINEAGE_MAX_ANCESTORS = 64;   // 祖先名称追溯上限，防止异常改名环消耗过多资源

export interface FileCard {
  schema_version: string;
  card_type: CardType;
  advisory: true;
  subject: string;
  repo_ref: string | null;
  observation: {
    head_sha: string | null;
    pinned_sha: string | null;
    pin_matches_observed_head: boolean | null;
  };
  staleness: { observed_head_sha: string | null; current_head_sha: string | null; drift: DriftState };
  source: 'prefetch' | 'backfill' | 'unknown';
  failure_state: FailureState;
  miss: FileCardMiss | null;
  lineage: FileCardLineage | null;      // 改名追溯记录：null 表示无改名关系，有改名时为详情对象
  kernel: {
    facet_rows: Record<string, { row: Record<string, unknown>; fact_ref: string; observed_at: string; evidence_ref: string; subject_ref: string }[]>;
    set_truncated: boolean;              // 观测数据行数超过上限发生截断时标记为 true
    suppressed_facets: SuppressedFacet[]; // 因新文件或历史不足而被排除的分析项列表
  };
  derived: {
    rule_version: string;
    revisions: number | null;
    hotspot_score: number | null;
    percentile_rank: { scope: 'repo'; metric: string; value: number | null };
    top_n_flag: { n: number; scope: 'repo'; metric: string; value: boolean | null };
    priority_band: { value: 'high' | 'medium' | 'low' | null; inputs: { hotspot_score: number | null; percentile_rank: number | null } };
    suppressed_by: FailureState | null;   // 衍生指标因历史不足等原因被隐藏时的具体原因
  };
  narrative: {
    hints: string[];
    key_check: { referenced: string[]; missing: string[]; ok: boolean };
  };
}

export interface FileCardBuildInput {
  subject: string;                          // 传入的原始路径（在内部做标准化处理）
  setRepoRef: string | null;                // 目标观测集仓库标识（格式为 name@sha）；null 表示未找到数据集
  setFacts: readonly FactEvent[];           // 选中观测集的所有文件级事实数据（没有时为空数组）
  availableHeadShas: readonly string[];     // 该仓库已采集过事实数据的全部提交号列表
  pinnedSha: string | null;                 // 指定查询的固定提交号
  currentHeadSha: string | null;            // 外部传入的当前仓库最新提交号（null 表示未知）
  source: 'prefetch' | 'backfill' | 'unknown';
  cliGuidance: string | null;               // 未采集时的命令行操作建议
  setTruncated?: boolean;                   // 事实数据是否超限截断
  pinnedAmbiguous?: readonly string[];      // 指定提交号前缀存在歧义时匹配到的多个完整提交号
  lineageFacts?: readonly FactEvent[];      // 跨批次拉取到的文件改名事实记录
  lineageEdgeCapHit?: boolean;              // 改名边数量是否触及上限截断
}

export function headShaOfRepoRef(repoRef: string): string | null {
  const i = repoRef.lastIndexOf('@');
  return i >= 0 && i < repoRef.length - 1 ? repoRef.slice(i + 1) : null;
}

function asNum(v: unknown): number | null {
  return typeof v === 'number' && Number.isFinite(v) ? v : null;
}

// 收集所有可引用的字段键名：包括基础指标键、衍生指标键和观测状态键，仅允许引用已存在的键。
export function fileCardCitationKeys(card: FileCard): string[] {
  const keys: string[] = ['observation.head_sha', 'staleness.drift', 'source', 'failure_state', 'kernel.set_truncated', 'kernel.suppressed_facets'];
  if (card.lineage !== null) { keys.push('lineage.stitched_from', 'lineage.edges', 'lineage.cycle_detected', 'lineage.truncated'); }
  for (const k of Object.keys(card.kernel.facet_rows).sort()) { keys.push('kernel.facet_rows.' + k); }
  if (card.derived.revisions !== null) { keys.push('derived.revisions'); }
  if (card.derived.hotspot_score !== null) { keys.push('derived.hotspot_score'); }
  if (card.derived.percentile_rank.value !== null) { keys.push('derived.percentile_rank'); }
  if (card.derived.top_n_flag.value !== null) { keys.push('derived.top_n_flag'); }
  if (card.derived.priority_band.value !== null) { keys.push('derived.priority_band'); }
  return keys;
}

// 检查引用的键名是否全部有效，返回是否通过及缺失的键名列表。
export function validateFileCardCitations(card: FileCard, referenced: readonly string[]): { ok: boolean; missing: string[] } {
  const have = new Set(fileCardCitationKeys(card));
  const missing = referenced.filter(function (k) { return !have.has(k); });
  return { ok: missing.length === 0, missing: missing };
}

function missCard(subject: string, miss: FileCardMiss, input: FileCardBuildInput, headSha: string | null): FileCard {
  return {
    schema_version: FILE_CARD_SCHEMA_VERSION,
    card_type: miss.state === 'not_applicable' ? 'not_applicable' : 'miss',
    advisory: true,
    subject: subject,
    repo_ref: input.setRepoRef,
    observation: {
      head_sha: headSha,
      pinned_sha: input.pinnedSha,
      pin_matches_observed_head: input.pinnedSha !== null && headSha !== null ? input.pinnedSha === headSha : null
    },
    staleness: {
      observed_head_sha: headSha,
      current_head_sha: input.currentHeadSha,
      drift: input.currentHeadSha === null || headSha === null ? 'unknown' : (input.currentHeadSha === headSha ? 'fresh' : 'behind')
    },
    source: input.source,
    failure_state: miss.state === 'not_applicable' ? 'not_applicable' : 'ok',
    miss: miss,
    lineage: null,
    kernel: { facet_rows: {}, set_truncated: input.setTruncated === true, suppressed_facets: [] },
    derived: {
      rule_version: FILE_CARD_RULE_VERSION,
      revisions: null,
      hotspot_score: null,
      percentile_rank: { scope: 'repo', metric: 'hotspots.hotspot_score', value: null },
      top_n_flag: { n: FILE_CARD_TOP_N, scope: 'repo', metric: 'hotspots.hotspot_score', value: null },
      priority_band: { value: null, inputs: { hotspot_score: null, percentile_rank: null } },
      suppressed_by: miss.state === 'not_applicable' ? 'not_applicable' : null
    },
    narrative: { hints: [], key_check: { referenced: [], missing: [], ok: true } }
  };
}

// ---------- 文件改名关联与历史追溯 ----------
// 从事实数据中提取 file.renamed 改名事件，解析改名来源与目标，按唯一键去重。
function collectRenameEdges(facts: readonly FactEvent[]): FileCardLineageEdge[] {
  const seen = new Set<string>();
  const edges: FileCardLineageEdge[] = [];
  for (const f of facts) {
    if (f.metric !== 'file.renamed') { continue; }
    try {
      const v = JSON.parse(f.value_json) as { from?: unknown; to?: unknown; commit_sha?: unknown; similarity?: unknown };
      if (typeof v.from !== 'string' || typeof v.to !== 'string' || typeof v.commit_sha !== 'string') { continue; }
      const key = v.from + '\u0000' + v.to + '\u0000' + v.commit_sha;
      if (seen.has(key)) { continue; }
      seen.add(key);
      edges.push({ from: v.from, to: v.to, commit_sha: v.commit_sha, similarity: typeof v.similarity === 'number' ? v.similarity : 0 });
    } catch { /* skip malformed lineage fact */ }
  }
  return edges;
}

// 反向遍历改名关系图，寻找历史旧路径；处理多跳改名、循环改名检测和链路超长截断。
function resolveLineageAncestors(subject: string, edges: readonly FileCardLineageEdge[]): {
  subjects: string[]; edgesUsed: FileCardLineageEdge[]; cycleDetected: boolean; truncated: boolean;
} {
  // byTo 表示新路径到旧路径的反向映射；byFrom 表示从旧路径到新路径的正向映射。
  const byTo = new Map<string, FileCardLineageEdge[]>();
  const byFrom = new Map<string, FileCardLineageEdge[]>();
  for (const e of edges) {
    const t = byTo.get(e.to) || [];
    if (t.length === 0) { byTo.set(e.to, t); }
    t.push(e);
    const f = byFrom.get(e.from) || [];
    if (f.length === 0) { byFrom.set(e.from, f); }
    f.push(e);
  }
  for (const arr of byTo.values()) {
    arr.sort(function (a, b) {
      return a.commit_sha === b.commit_sha ? (a.from < b.from ? -1 : a.from > b.from ? 1 : 0) : (a.commit_sha < b.commit_sha ? -1 : 1);
    });
  }
  // 沿改名方向判断是否形成闭环改名回路。
  function reachesForward(start: string, target: string): boolean {
    const seen = new Set<string>([start]);
    const fq: string[] = [start];
    while (fq.length > 0) {
      const n = fq.shift() as string;
      for (const e of byFrom.get(n) || []) {
        if (e.to === target) { return true; }
        if (!seen.has(e.to)) { seen.add(e.to); fq.push(e.to); }
      }
    }
    return false;
  }
  const visited = new Set<string>([subject]);
  const ancestors: string[] = [];
  const edgesUsed: FileCardLineageEdge[] = [];
  let cycleDetected = false;
  let truncated = false;
  const queue: string[] = [subject];
  while (queue.length > 0 && !truncated) {
    const cur = queue.shift() as string;
    for (const e of byTo.get(cur) || []) {
      edgesUsed.push(e);
      if (visited.has(e.from)) { if (reachesForward(cur, e.from)) { cycleDetected = true; } continue; }
      if (ancestors.length >= FILE_CARD_LINEAGE_MAX_ANCESTORS) { truncated = true; break; }
      visited.add(e.from);
      ancestors.push(e.from);
      queue.push(e.from);
    }
  }
  return { subjects: ancestors, edgesUsed: edgesUsed, cycleDetected: cycleDetected, truncated: truncated };
}

function sortLineageEdges(edges: readonly FileCardLineageEdge[]): FileCardLineageEdge[] {
  return edges.slice().sort(function (a, b) {
    return a.commit_sha === b.commit_sha
      ? (a.from === b.from ? (a.to < b.to ? -1 : a.to > b.to ? 1 : 0) : (a.from < b.from ? -1 : 1))
      : (a.commit_sha < b.commit_sha ? -1 : 1);
  });
}

export function buildFileCard(input: FileCardBuildInput): FileCard {
  const norm = normalizeSubjectPath(input.subject);
  if (!norm.ok) {
    return missCard(String(input.subject), {
      state: 'not_tracked_at_sha',
      detail: 'subject 路径不合法，已被拒绝：reason=' + norm.reason
    }, input, input.setRepoRef !== null ? headShaOfRepoRef(input.setRepoRef) : null);
  }
  const subject = norm.subject as string;
  const headSha = input.setRepoRef !== null ? headShaOfRepoRef(input.setRepoRef) : null;

  // 数据缺失状态判定顺序：先看有无对应提交的数据，再看文件是否存在或发生过改名。
  if (input.setRepoRef === null) {
    // 指定提交前缀存在多个匹配项时，不随意猜测，明确提示前缀不唯一。
    if (input.pinnedAmbiguous !== undefined && input.pinnedAmbiguous.length > 1) {
      return missCard(subject, {
        state: 'not_tracked_at_sha',
        detail: '提交前缀歧义：at:' + String(input.pinnedSha) + ' 匹配到 ' + input.pinnedAmbiguous.length + ' 个提交记录（' + input.pinnedAmbiguous.map(function (s) { return s.slice(0, 12); }).join(', ') + '…）——无法唯一定位，请提供更长的前缀或完整哈希',
        available_head_shas: input.availableHeadShas.slice(),
        cli_guidance: input.cliGuidance === null ? undefined : input.cliGuidance
      }, input, null);
    }
    if (input.availableHeadShas.length === 0) {
      return missCard(subject, {
        state: 'never_collected',
        detail: '该仓库尚未采集过单文件档事实数据',
        cli_guidance: input.cliGuidance === null ? undefined : input.cliGuidance
      }, input, null);
    }
    return missCard(subject, {
      state: 'not_tracked_at_sha',
      detail: '未找到指定提交的数据：at:' + String(input.pinnedSha) + ' 未曾采集',
      available_head_shas: input.availableHeadShas.slice(),
      cli_guidance: input.cliGuidance === null ? undefined : input.cliGuidance
    }, input, null);
  }

  // 整理改名记录，寻找历史旧路径并一并拉取旧名下的历史数据。
  const edgePool = collectRenameEdges(input.lineageFacts !== undefined && input.lineageFacts.length > 0
    ? input.setFacts.concat(input.lineageFacts)
    : input.setFacts);
  const resolved = resolveLineageAncestors(subject, edgePool);
  const stitchedNames = new Set<string>([subject].concat(resolved.subjects));

  const mine = input.setFacts.filter(function (f) { return f.metric === 'codelore.file_facet_row' && stitchedNames.has(f.subject_ref); });
  if (mine.length === 0) {
    // 二进制文件、生成文件或特殊跳过文件：明确说明不适用，不输出空卡片。
    const skip = input.setFacts.filter(function (f) {
      if (f.metric !== 'codelore.file_subject_skip') { return false; }
      try { const v = JSON.parse(f.value_json) as { raw_path?: unknown }; return v.raw_path === subject || v.raw_path === input.subject; }
      catch { return false; }
    })[0];
    if (skip) {
      let reason = 'unclassified';
      try { reason = String((JSON.parse(skip.value_json) as { reason?: unknown }).reason); } catch { /* keep */ }
      return missCard(subject, {
        state: 'not_applicable',
        detail: '该文件不参与单文件分析（' + reason + '），属于正常跳过而非数据缺失'
      }, input, headSha);
    }
    // 检测到改名情况，提示已重命名，并确认新路径是否有对应事实数据。
    const ev = edgePool.filter(function (e) { return e.from === subject; })[0];
    if (ev) {
      const targetHasFacts = input.setFacts.some(function (f) { return f.metric === 'codelore.file_facet_row' && f.subject_ref === ev.to; });
      return missCard(subject, {
        state: 'renamed_to',
        detail: '检测到文件已改名：' + subject + ' → ' + ev.to + '（提交=' + ev.commit_sha.slice(0, 7) + ' 相似度=' + ev.similarity + '）',
        renamed_to: ev.to,
        lineage_edge: { from: ev.from, to: ev.to, commit_sha: ev.commit_sha, similarity: ev.similarity },
        revalidated: targetHasFacts
      }, input, headSha);
    }
    return missCard(subject, {
      state: 'not_tracked_at_sha',
      detail: '在提交 ' + String(headSha).slice(0, 7) + ' 下未找到该文件的指标数据，且无改名记录',
      available_head_shas: input.availableHeadShas.slice(),
      cli_guidance: input.cliGuidance === null ? undefined : input.cliGuidance
    }, input, headSha);
  }

  // ---------- 基础层：整理各分析项的行数据与出处信息 ----------
  const facetRows: FileCard['kernel']['facet_rows'] = {};
  for (const f of mine) {
    let v: { analysis?: unknown; row?: unknown };
    try { v = JSON.parse(f.value_json) as { analysis?: unknown; row?: unknown }; } catch { continue; }
    const analysis = typeof v.analysis === 'string' ? v.analysis : 'unknown';
    const row = (v.row !== null && typeof v.row === 'object' ? v.row : {}) as Record<string, unknown>;
    const arr = facetRows[analysis] || (facetRows[analysis] = []);
    // 保留每一行的原始归属路径，改名合并进来的旧数据仍保留旧路径标记。
    arr.push({ row: row, fact_ref: f.fact_id, observed_at: f.observed_at, evidence_ref: f.evidence_ref, subject_ref: f.subject_ref });
  }
  const analyses = Object.keys(facetRows).sort();
  const ordered: FileCard['kernel']['facet_rows'] = {};
  for (const a of analyses) { ordered[a] = facetRows[a]; }

  // ---------- 衍生层：计算热点得分与相对排行（带规则版本） ----------
  let revisions: number | null = null;
  let hotspotScore: number | null = null;
  for (const r of ordered['revisions'] || []) { const n = asNum(r.row['n_revs']); if (n !== null && (revisions === null || n > revisions)) { revisions = n; } }
  for (const r of ordered['hotspots'] || []) {
    const n = asNum(r.row['revisions']); if (n !== null && (revisions === null || n > revisions)) { revisions = n; }
    const s = asNum(r.row['hotspot_score']); if (s !== null && (hotspotScore === null || s > hotspotScore)) { hotspotScore = s; }
  }
  // 在同仓库所有文件中计算百分位排行（中位数法平滑并列情况）。
  // 已被新名称取代的旧路径不重复计入分布，防止重复统计。
  const supersededNames = new Set<string>();
  {
    const namesWithRows = new Set<string>();
    for (const f of input.setFacts) { if (f.metric === 'codelore.file_facet_row') { namesWithRows.add(f.subject_ref); } }
    for (const e of edgePool) { if (e.from !== e.to && namesWithRows.has(e.to)) { supersededNames.add(e.from); } }
  }
  const peerScores: number[] = [];
  for (const f of input.setFacts) {
    if (f.metric !== 'codelore.file_facet_row' || supersededNames.has(f.subject_ref)) { continue; }
    try {
      const v = JSON.parse(f.value_json) as { analysis?: unknown; row?: { hotspot_score?: unknown } };
      if (v.analysis === 'hotspots' && v.row) { const s = asNum(v.row.hotspot_score); if (s !== null) { peerScores.push(s); } }
    } catch { /* skip malformed */ }
  }
  let pct: number | null = null;
  if (hotspotScore !== null && peerScores.length > 0) {
    let less = 0, eq = 0;
    for (const s of peerScores) { if (s < hotspotScore) { less += 1; } else if (s === hotspotScore) { eq += 1; } }
    pct = (less + eq / 2) / peerScores.length;
  }
  const topN = hotspotScore === null ? null : peerScores.filter(function (s) { return s > hotspotScore; }).length < FILE_CARD_TOP_N;
  const band: 'high' | 'medium' | 'low' | null = pct === null ? null : (pct >= 0.9 ? 'high' : (pct >= 0.6 ? 'medium' : 'low'));

  // 历史不足判定：修改次数过少时只保留静态基础指标，不输出需要演化历史的分析项。
  const failure: 'ok' | SuppressedFacetReason = revisions === 1 ? 'new_file'
    : (revisions !== null && revisions < FILE_CARD_INSUFFICIENT_MIN_REVS) ? 'insufficient_history' : 'ok';
  const suppressed = failure !== 'ok';

  // 过滤需隐藏的指标：将历史演化类指标移入 suppressed_facets，避免样本过少产生失真读数。
  const keptFacets: FileCard['kernel']['facet_rows'] = {};
  const suppressedFacets: SuppressedFacet[] = [];
  for (const a of analyses) {
    if (suppressed && FILE_CARD_STATIC_FACETS.indexOf(a) < 0) {
      suppressedFacets.push({ facet: a, reason: failure });
    } else {
      keptFacets[a] = ordered[a];
    }
  }

  const card: FileCard = {
    schema_version: FILE_CARD_SCHEMA_VERSION,
    card_type: 'file-audit-card',
    advisory: true,
    subject: subject,
    repo_ref: input.setRepoRef,
    observation: {
      head_sha: headSha,
      pinned_sha: input.pinnedSha,
      pin_matches_observed_head: input.pinnedSha !== null && headSha !== null ? input.pinnedSha === headSha : null
    },
    staleness: {
      observed_head_sha: headSha,
      current_head_sha: input.currentHeadSha,
      drift: input.currentHeadSha === null || headSha === null ? 'unknown' : (input.currentHeadSha === headSha ? 'fresh' : 'behind')
    },
    source: input.source,
    failure_state: failure,
    miss: null,
    // 改名追溯详情：如果解析到了改名记录或环，如实记录改名链路与是否截断。
    lineage: resolved.edgesUsed.length > 0 || resolved.cycleDetected
      ? { stitched_from: resolved.subjects, edges: sortLineageEdges(resolved.edgesUsed), cycle_detected: resolved.cycleDetected, truncated: resolved.truncated || input.lineageEdgeCapHit === true }
      : null,
    kernel: { facet_rows: keptFacets, set_truncated: input.setTruncated === true, suppressed_facets: suppressedFacets },
    derived: {
      rule_version: FILE_CARD_RULE_VERSION,
      revisions: revisions,
      hotspot_score: hotspotScore,
      percentile_rank: { scope: 'repo', metric: 'hotspots.hotspot_score', value: suppressed ? null : pct },
      top_n_flag: { n: FILE_CARD_TOP_N, scope: 'repo', metric: 'hotspots.hotspot_score', value: suppressed ? null : topN },
      priority_band: { value: suppressed ? null : band, inputs: { hotspot_score: hotspotScore, percentile_rank: suppressed ? null : pct } },
      suppressed_by: suppressed ? failure : null
    },
    narrative: { hints: [], key_check: { referenced: [], missing: [], ok: true } }
  };
  // 说明层：列出所有可供外部引用的计算指标字段，并完成校验。
  card.narrative.hints = fileCardCitationKeys(card);
  card.narrative.key_check = { referenced: card.narrative.hints.slice(), missing: [], ok: true };
  return card;
}
