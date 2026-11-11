// fact/file-card.ts —— 单文件档的那张卡
// 这张卡是给人看的只读视图：只出建议、不下判定，走 MCP 那头也绝不往库里写东西。
// 纯逻辑：进来的是现成的事实和当前提交号；不直接碰文件系统，不起子进程。
// 卡片分三层：
// kernel 层：基础观测按分析项归好直接摆出来，每行带着出处和关联信息；
// derived 层：拿基础数据算出来的衍生指标（热点优先级规则、仓内百分位排行这些），每次都能算出同一个数；
// narrative 层：说人话的部分，只许引用已经算出来的键名，还附一份「这个键在不在」的检查结果。
// 这卡的定位：不下正式判定，明写 advisory: true，优先级只是排个先后供参考。
// 找不到数据有四种说法：从来没采过（顺带告诉你怎么办）/ 这个提交没采过 / 用不上（二进制文件或生成文件这类）/ 改过名，给你指到新名字去。
// 改名怎么处理：拿改名事实搭一张改名关系图，自动往回追旧名字，把旧名下的字段并进当前这张卡。
// 历史不够和有特殊情况：新文件或者改的次数太少，就只留基础静态指标，衍生排行不出。

import { normalizeSubjectPath } from './subject.js';
import type { FactEvent } from './store.js';

export const FILE_CARD_SCHEMA_VERSION = 'file-card@v1';
export const FILE_CARD_RULE_VERSION = 'hotspot_priority_v1';
export const FILE_CARD_TOP_N = 20;
export const FILE_CARD_INSUFFICIENT_MIN_REVS = 3; // 改不到 3 次就算历史不够（新文件算 1 次）

// 出问题或者历史不够时，字段这么筛：
// 得靠历史演化才能算的分析项，历史不够或是新文件，不进卡；
// 静态指标照常留着。
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

// 指标没摆出来的原因码：新文件和历史记录不够这两种。
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
  revalidated?: boolean; // 改过名：查一下目标文件在观测数据里有没有（指过去之前先验一下）
  available_head_shas?: string[]; // 这个提交没采过：把已有数据的提交号都列出来，让你自己挑
  cli_guidance?: string; // 从来没采过：告诉你在命令行上该怎么跑
}

// 改名这块说清三件事：并进来哪些旧名、吃了哪几条改名记录、有没有绕成环或者链太长被截断。
export interface FileCardLineageEdge { from: string; to: string; commit_sha: string; similarity: number }
export interface FileCardLineage {
  stitched_from: string[]; // 追出来的历史旧路径（排序固定）
  edges: FileCardLineageEdge[]; // 吃了哪几条改名记录（按提交号排）
  cycle_detected: boolean; // 绕环检测：发现绕成圈就在这条线上停下追，打个标记
  truncated: boolean; // 追得太长、超过上限被截了，打个标记
}

export const FILE_CARD_LINEAGE_MAX_ANCESTORS = 64; // 往上追旧名最多追这么多层，免得异常改名环拖垮资源

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
  lineage: FileCardLineage | null; // 改名追溯的明细：null 就是没改过名，改过就是一份详情
  kernel: {
    facet_rows: Record<string, { row: Record<string, unknown>; fact_ref: string; observed_at: string; evidence_ref: string; subject_ref: string }[]>;
    set_truncated: boolean; // 观测数据行数超上限被截了，就是 true
    suppressed_facets: SuppressedFacet[]; // 因为新文件或历史不够而被挡在外的分析项
  };
  derived: {
    rule_version: string;
    revisions: number | null;
    hotspot_score: number | null;
    percentile_rank: { scope: 'repo'; metric: string; value: number | null };
    top_n_flag: { n: number; scope: 'repo'; metric: string; value: boolean | null };
    priority_band: { value: 'high' | 'medium' | 'low' | null; inputs: { hotspot_score: number | null; percentile_rank: number | null } };
    suppressed_by: FailureState | null; // 衍生指标被藏起来的具体原因（多半是历史不够）
  };
  narrative: {
    hints: string[];
    key_check: { referenced: string[]; missing: string[]; ok: boolean };
  };
}

export interface FileCardBuildInput {
  subject: string; // 传进来的原始路径（内部自己归整）
  setRepoRef: string | null; // 目标观测集的仓库标识（name@sha 这个形状）；null 就是没找着数据集
  setFacts: readonly FactEvent[]; // 选中的那个观测集里所有文件级事实（一条没有就是空数组）
  availableHeadShas: readonly string[]; // 这个仓库采过数据的全部提交号
  pinnedSha: string | null; // 指定要查的那个固定提交号
  currentHeadSha: string | null; // 外面传进来的当前最新提交号（null 就是不知道）
  source: 'prefetch' | 'backfill' | 'unknown';
  cliGuidance: string | null; // 没采过时给的操作建议
  setTruncated?: boolean; // 事实是不是超限被截了
  pinnedAmbiguous?: readonly string[]; // 提交号前缀撞上好几个时，匹配到的那些完整提交号
  lineageFacts?: readonly FactEvent[]; // 跨批次拉回来的改名事实
  lineageEdgeCapHit?: boolean; // 改名边是不是顶到上限被截了
}

export function headShaOfRepoRef(repoRef: string): string | null {
  const i = repoRef.lastIndexOf('@');
  return i >= 0 && i < repoRef.length - 1 ? repoRef.slice(i + 1) : null;
}

function asNum(v: unknown): number | null {
  return typeof v === 'number' && Number.isFinite(v) ? v : null;
}

// 把能引用的键名收拢起来：基础指标键、衍生指标键、观测状态键，只准引用已经有的。
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

// 查引用的键名是不是个个都在，返回过没过、缺了谁。
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

// ---------- 改名关系和往回追溯 ----------
// 从事实里把 file.renamed 挑出来，认出改名的从哪儿到哪儿，按唯一键去重。
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

// 顺着改名图往回走，找历史上的旧路径；多跳改名、绕成环、链太长截断都得管。
function resolveLineageAncestors(subject: string, edges: readonly FileCardLineageEdge[]): {
  subjects: string[]; edgesUsed: FileCardLineageEdge[]; cycleDetected: boolean; truncated: boolean;
} {
  // byTo 是新路径对旧路径的反查表；byFrom 是旧路径对新路径的顺查表。
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
  // 照着改名的方向走，看会不会绕回自己。
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

  // 判「没数据」的先后：先看这个提交有没有数据，再看文件在不在、改没改过名。
  if (input.setRepoRef === null) {
    // 提交前缀撞上好几个，不许瞎猜，明说这个前缀不唯一。
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

  // 把改名记录理一遍，找出历史旧名，顺手把旧名下的历史数据也拉回来。
  const edgePool = collectRenameEdges(input.lineageFacts !== undefined && input.lineageFacts.length > 0
    ? input.setFacts.concat(input.lineageFacts)
    : input.setFacts);
  const resolved = resolveLineageAncestors(subject, edgePool);
  const stitchedNames = new Set<string>([subject].concat(resolved.subjects));

  const mine = input.setFacts.filter(function (f) { return f.metric === 'codelore.file_facet_row' && stitchedNames.has(f.subject_ref); });
  if (mine.length === 0) {
    // 二进制文件、生成文件、按规定跳过的文件：明说用不上，别出张空卡糊弄人。
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
    // 认出是改过名的，就告诉你改到哪儿了，顺便看看新路径有没有事实数据。
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

  // ---------- 基础层：把每个分析项的行和出处理出来 ----------
  const facetRows: FileCard['kernel']['facet_rows'] = {};
  for (const f of mine) {
    let v: { analysis?: unknown; row?: unknown };
    try { v = JSON.parse(f.value_json) as { analysis?: unknown; row?: unknown }; } catch { continue; }
    const analysis = typeof v.analysis === 'string' ? v.analysis : 'unknown';
    const row = (v.row !== null && typeof v.row === 'object' ? v.row : {}) as Record<string, unknown>;
    const arr = facetRows[analysis] || (facetRows[analysis] = []);
    // 每一行原本属于哪个路径得留着；改名并进来的老数据还挂老路径的标记。
    arr.push({ row: row, fact_ref: f.fact_id, observed_at: f.observed_at, evidence_ref: f.evidence_ref, subject_ref: f.subject_ref });
  }
  const analyses = Object.keys(facetRows).sort();
  const ordered: FileCard['kernel']['facet_rows'] = {};
  for (const a of analyses) { ordered[a] = facetRows[a]; }

  // ---------- 衍生层：算热点得分和相对排名（记着规则版本） ----------
  let revisions: number | null = null;
  let hotspotScore: number | null = null;
  for (const r of ordered['revisions'] || []) { const n = asNum(r.row['n_revs']); if (n !== null && (revisions === null || n > revisions)) { revisions = n; } }
  for (const r of ordered['hotspots'] || []) {
    const n = asNum(r.row['revisions']); if (n !== null && (revisions === null || n > revisions)) { revisions = n; }
    const s = asNum(r.row['hotspot_score']); if (s !== null && (hotspotScore === null || s > hotspotScore)) { hotspotScore = s; }
  }
  // 在同一个仓的所有文件里算百分位（用中位数法把并列的摆平）。
  // 被新名字顶替掉的旧路径不再重复计数，免得同一份数据算两遍。
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

  // 历史够不够：改的次数太少就只留基础静态指标，要演化的分析项不出。
  const failure: 'ok' | SuppressedFacetReason = revisions === 1 ? 'new_file'
    : (revisions !== null && revisions < FILE_CARD_INSUFFICIENT_MIN_REVS) ? 'insufficient_history' : 'ok';
  const suppressed = failure !== 'ok';

  // 该藏起来的指标：把要靠历史演化的分析项挪进 suppressed_facets，样本太少会读出假数。
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
    // 改名追溯的细节：追到了记录或者绕了环，就照实写下链路和有没有被截。
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
  // 说明层：把外面能引用的指标字段全列出来，顺手核一遍。
  card.narrative.hints = fileCardCitationKeys(card);
  card.narrative.key_check = { referenced: card.narrative.hints.slice(), missing: [], ok: true };
  return card;
}
