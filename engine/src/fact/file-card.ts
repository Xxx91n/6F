// fact/file-card.ts — Micro-B 文件级审计卡投影（#80 步② / D-123/D-126 / ADR-0023）
// 纯逻辑：输入=已取事实行＋注入观测（current_head_sha 由调用面探针供给）；不读 fs、不起子进程。
// 三层卡契约（D-123）：
//   kernel 层=已契约实体面逐字段直投（facet_rows 按 analysis 归组，逐行带 citation 锚 fact_ref/observed_at/evidence_ref）；
//   derived 层=仅确定性可复算值（priority_band 规则带版本号 hotspot_priority_v1／percentile_rank scope=repo／top_n_flag），
//     每项带 derivation 溯源字段；禁 A-E/GPA 字母判语形态（业界绑定门禁语义——裁决力在消费面不在值形态，故结构性隔离）；
//   narrative 层=零指标值纪律（只引用 kernel 已算值键名）＋citation 校验验键存在性（key_check）。
// advisory 结构性隔离：卡 schema 无 verdict/gate-consumable 字段＋advisory:true 显式字段＋priority=排序语义非判定。
// miss 四类显式态（D-126）：never_collected（可行动指引）/not_tracked_at_sha/not_applicable（合法空值非 miss）/renamed_to
//   （血缘存在→跳转指引＋逐请求重验证 revalidated 字段；无血缘→降级 not_tracked_at_sha）。
// 血缘缝合（#80 步③ / D-137）：file.renamed 边池=选中集∪祖先集事实行（投影层注入 lineageFacts）→
//   反向多跳显式图遍历＋环检测＋规模帽→旧名 era 事实并入新名卡（行级 subject_ref 溯源＋lineage 披露块；
//   漏判=历史诚实分裂不编造——SonarSource「rename 后 history kept」先例同型）。
// 失败三态：new_file/insufficient_history=显式态仅静态指标（derived 抑制 suppressed_by 留痕）；
//   binary/generated→card_type:not_applicable 不出空卡。
// at:<sha>=显式 opt-in pin（常量禁自动派生——SQL:2011 AS OF 仅常量纪律）；staleness=双字段披露照答不拒答。

import { normalizeSubjectPath } from './subject.js';
import type { FactEvent } from './store.js';

export const FILE_CARD_SCHEMA_VERSION = 'file-card@v1';
export const FILE_CARD_RULE_VERSION = 'hotspot_priority_v1';
export const FILE_CARD_TOP_N = 20;
export const FILE_CARD_INSUFFICIENT_MIN_REVS = 3;   // <3 修订=历史不足（含 new_file=1）

// D-136 失败态投影收口（#83）：kernel facet 词表二分 closed 枚举（D-095 纪律）——
//   历史派生族（D-123⑤ 括号点名五族）在 new_file/insufficient_history 下不进卡面；
//   保留面=静态指标集 closed。两集成员级双向差集对账=发射词表（CODELORE_*_FACETS 33 名）由
//   file-card.test 断言：并集=全集且交集=∅——新增 analysis 未分类即红（禁临场裁量）。
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

// suppressed_facets 原因码=closed 枚举（D-136②）——词表源=D-126③ FailureState 族。
export type SuppressedFacetReason = 'new_file' | 'insufficient_history'; // D-126③ 词表可达子集——not_applicable 仅 miss/card_type 层可达；新失败枝须扩此集
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
  revalidated?: boolean;            // renamed_to：逐请求重验证=目标 subject 在观测集内有事实（跳转条件，301-教训：不无条件跳）
  available_head_shas?: string[];   // not_tracked_at_sha：已采集观测集 sha 清单（诚实披露可选集）
  cli_guidance?: string;            // never_collected：可行动指引（MCP 面永不写→指 CLI 补采）
}

// 血缘缝合披露块（#80 步③ / D-137）：缝合账本非行为修饰——披露哪些旧名被并入、消费了哪些边、
//   环/截断异常如实留痕（诚实分裂可见不编造）。
export interface FileCardLineageEdge { from: string; to: string; commit_sha: string; similarity: number }
export interface FileCardLineage {
  stitched_from: string[];              // 反向遍历解析出的旧名 subject（确定性序——链序游走，平等枝词典序）
  edges: FileCardLineageEdge[];         // 缝合消费的血缘边（确定性序——commit_sha 无时间序故词典序）
  cycle_detected: boolean;              // 环检测命中：from 端回到已访节点即停该边并置旗（A→B→A 病态图不绕死）
  truncated: boolean;                   // 祖先链超 FILE_CARD_LINEAGE_MAX_ANCESTORS 截断如实披露
}

export const FILE_CARD_LINEAGE_MAX_ANCESTORS = 64;   // 祖先名链硬帽（病态图保护，正常改名链远小于此）

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
  lineage: FileCardLineage | null;      // 缝合账本：null=未参与缝合；对象=缝合账本（stitched_from 可空——解析到旧名但未并入行亦如实披露）
  kernel: {
    facet_rows: Record<string, { row: Record<string, unknown>; fact_ref: string; observed_at: string; evidence_ref: string; subject_ref: string }[]>;
    set_truncated: boolean;              // F7h：观测集 fact 行数超 FILE_CARD_SET_CAP 截断时=true（卡面如实标记不静默）
    suppressed_facets: SuppressedFacet[]; // D-136②：失败态滤除的历史派生族 facet 清单（closed 枚举成员级对账，每项带原因码）
  };
  derived: {
    rule_version: string;
    revisions: number | null;
    hotspot_score: number | null;
    percentile_rank: { scope: 'repo'; metric: string; value: number | null };
    top_n_flag: { n: number; scope: 'repo'; metric: string; value: boolean | null };
    priority_band: { value: 'high' | 'medium' | 'low' | null; inputs: { hotspot_score: number | null; percentile_rank: number | null } };
    suppressed_by: FailureState | null;   // 显式态仅静态指标：非 ok 时 derived 值抑制并留痕（D-123）
  };
  narrative: {
    hints: string[];
    key_check: { referenced: string[]; missing: string[]; ok: boolean };
  };
}

export interface FileCardBuildInput {
  subject: string;                          // 调用方原文路径（本器内归一——归一单点纪律的读侧镜像）
  setRepoRef: string | null;                // 选中观测集 repo_ref（name@sha）；null=无观测集
  setFacts: readonly FactEvent[];           // 选中观测集全部 Micro-B 事实（无集时传空）
  availableHeadShas: readonly string[];     // 该 repo 全部已采集观测集 head_sha（miss 诚实披露面）
  pinnedSha: string | null;                 // at:<sha> pin 常量
  currentHeadSha: string | null;            // 探针注入的当前 HEAD（null=宿主未知→drift:unknown 照答）
  source: 'prefetch' | 'backfill' | 'unknown';
  cliGuidance: string | null;               // miss 可行动指引（CLI 补采命令形态，由触发面拼好注入）
  setTruncated?: boolean;                   // 观测集 fact 拉取超 FILE_CARD_SET_CAP 截断标记（投影层判定注入）
  pinnedAmbiguous?: readonly string[];      // F7a：at:<sha> 前缀命中多个观测集 head_sha（歧义不猜——not_tracked_at_sha 如实答）
  lineageFacts?: readonly FactEvent[];      // D-137② 跨观测集血缘边池增量：祖先观测集的 file.renamed 事实行（投影层解析注入；缺席=仅选中集边）
  lineageEdgeCapHit?: boolean;              // 祖先集血缘拉取超 FILE_CARD_LINEAGE_EDGE_CAP——截断如实披露（并入 truncated 伞）
}

export function headShaOfRepoRef(repoRef: string): string | null {
  const i = repoRef.lastIndexOf('@');
  return i >= 0 && i < repoRef.length - 1 ? repoRef.slice(i + 1) : null;
}

function asNum(v: unknown): number | null {
  return typeof v === 'number' && Number.isFinite(v) ? v : null;
}

// narrative 键集=kernel facet 键＋derived 键＋观测锚键——宿主叙事只可引用已算值键名（D-123 零指标值纪律）。
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

// citation 校验=验键存在性：宿主叙事段引用的键须全在卡键集内（缺失键清单如实回执）。
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

// ---------- 血缘缝合（#80 步③ / D-137） ----------
// file.renamed 事实行→边池：载荷 {from,to,commit_sha,similarity} 逐字段型检；病态行跳过不误吞（解析失败行
//   本就不构成边）。去重键=(from,to,commit_sha)——同边跨观测集重复检出是常态（历史事实 append-only 重放）。
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

// 反向多跳遍历（D-137② 显式图遍历非单路径 follow——Vajna 补丁实证根因=路径状态单变量 last-write-wins）：
//   邻接 to→[edges]（from 端=旧名）；BFS 逐层回溯，环检测=from 回到已访节点即停该边如实置旗；
//   确定性序=邻接内按 (commit_sha,from) 词典序（sha 无时间序）；规模帽截断如实披露。
function resolveLineageAncestors(subject: string, edges: readonly FileCardLineageEdge[]): {
  subjects: string[]; edgesUsed: FileCardLineageEdge[]; cycleDetected: boolean; truncated: boolean;
} {
  // byTo=反向邻接（to→[from]：朝旧名回溯）；byFrom=前向邻接（from→[to]：old→new），供 dup 命中时的真环判定
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
  // 前向可达判定：cur 沿 old→new 方向可达 e.from ⟺ e.from 兼为 cur 的祖先（边 Y→X）与后裔（X→*Y）=真环；
  //   DAG 钻石/重复边命中（两路径汇于同一祖先名）不满足互达——照实不置环旗（D-137② 披露≠误报）。
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
      detail: 'subject 归一拒绝 reason=' + norm.reason + '（SCIP 五规则读侧镜像）'
    }, input, input.setRepoRef !== null ? headShaOfRepoRef(input.setRepoRef) : null);
  }
  const subject = norm.subject as string;
  const headSha = input.setRepoRef !== null ? headShaOfRepoRef(input.setRepoRef) : null;

  // miss 态序（D-126 四类）：无观测集→never_collected（可行动指引）；集内无 subject→血缘/跳检→renamed_to|not_tracked。
  if (input.setRepoRef === null) {
    // F7a：pin 前缀歧义先判（观测集在但前缀不唯一——不猜最新，照答 not_tracked 并披露全部命中 sha）
    if (input.pinnedAmbiguous !== undefined && input.pinnedAmbiguous.length > 1) {
      return missCard(subject, {
        state: 'not_tracked_at_sha',
        detail: 'pin 前缀歧义：at:' + String(input.pinnedSha) + ' 命中 ' + input.pinnedAmbiguous.length + ' 个观测集（' + input.pinnedAmbiguous.map(function (s) { return s.slice(0, 12); }).join(', ') + '…）——唯一性不成立，用更长前缀或全 sha 重试',
        available_head_shas: input.availableHeadShas.slice(),
        cli_guidance: input.cliGuidance === null ? undefined : input.cliGuidance
      }, input, null);
    }
    if (input.availableHeadShas.length === 0) {
      return missCard(subject, {
        state: 'never_collected',
        detail: '该 repo 无任何 Micro-B 观测集——文件级事实从未采集',
        cli_guidance: input.cliGuidance === null ? undefined : input.cliGuidance
      }, input, null);
    }
    return missCard(subject, {
      state: 'not_tracked_at_sha',
      detail: 'pin 观测集缺席：at:' + String(input.pinnedSha) + ' 未采集（不实现强制 HEAD 匹配，照答不拒答）',
      available_head_shas: input.availableHeadShas.slice(),
      cli_guidance: input.cliGuidance === null ? undefined : input.cliGuidance
    }, input, null);
  }

  // 血缘边池=选中集∪祖先集 file.renamed 行（D-137② 跨观测集解析——祖先集边经 lineageFacts 注入）
  const edgePool = collectRenameEdges(input.lineageFacts !== undefined && input.lineageFacts.length > 0
    ? input.setFacts.concat(input.lineageFacts)
    : input.setFacts);
  // 反向多跳遍历解析旧名祖先集——缝合集=subject∪祖先名（并入旧名 era 事实，D-137①）
  const resolved = resolveLineageAncestors(subject, edgePool);
  const stitchedNames = new Set<string>([subject].concat(resolved.subjects));

  const mine = input.setFacts.filter(function (f) { return f.metric === 'codelore.file_facet_row' && stitchedNames.has(f.subject_ref); });
  if (mine.length === 0) {
    // binary/generated/非 regular path→发射侧 file_subject_skip 留痕→card_type:not_applicable（合法空值非 miss 态空卡）
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
        detail: 'subject 发射侧判定不适用（' + reason + '）——合法空值非采集缺漏，不出空卡'
      }, input, headSha);
    }
    // 血缘存在→renamed_to＋逐请求重验证（目标在集内有事实=跳转条件成立）；无血缘→not_tracked_at_sha
    //   （边池含祖先集增量——单跳跳转语义不变：解析到即报一跳，链深处由消费面逐请求推进）
    const ev = edgePool.filter(function (e) { return e.from === subject; })[0];
    if (ev) {
      const targetHasFacts = input.setFacts.some(function (f) { return f.metric === 'codelore.file_facet_row' && f.subject_ref === ev.to; });
      return missCard(subject, {
        state: 'renamed_to',
        detail: '血缘检出 ' + subject + ' → ' + ev.to + '（commit=' + ev.commit_sha.slice(0, 7) + ' similarity=' + ev.similarity + '）——条件跳转：重验证通过方可请求目标卡',
        renamed_to: ev.to,
        lineage_edge: { from: ev.from, to: ev.to, commit_sha: ev.commit_sha, similarity: ev.similarity },
        revalidated: targetHasFacts
      }, input, headSha);
    }
    return missCard(subject, {
      state: 'not_tracked_at_sha',
      detail: '观测集 head=' + String(headSha).slice(0, 7) + ' 内无该 subject 的 per-file 事实且无血缘边——该 sha 树下不追踪',
      available_head_shas: input.availableHeadShas.slice(),   // F6：「可提示 at: 其他 sha 试探」机制两枝补齐（pin 枝既有）
      cli_guidance: input.cliGuidance === null ? undefined : input.cliGuidance
    }, input, headSha);
  }

  // ---------- kernel 层：facet_rows 逐字段直投＋逐行 citation 锚 ----------
  const facetRows: FileCard['kernel']['facet_rows'] = {};
  for (const f of mine) {
    let v: { analysis?: unknown; row?: unknown };
    try { v = JSON.parse(f.value_json) as { analysis?: unknown; row?: unknown }; } catch { continue; }
    const analysis = typeof v.analysis === 'string' ? v.analysis : 'unknown';
    const row = (v.row !== null && typeof v.row === 'object' ? v.row : {}) as Record<string, unknown>;
    const arr = facetRows[analysis] || (facetRows[analysis] = []);
    // subject_ref 行级溯源（D-137③：缝合行不洗白身份——并入的旧名 era 行保留其原 subject 键）
    arr.push({ row: row, fact_ref: f.fact_id, observed_at: f.observed_at, evidence_ref: f.evidence_ref, subject_ref: f.subject_ref });
  }
  const analyses = Object.keys(facetRows).sort();
  const ordered: FileCard['kernel']['facet_rows'] = {};
  for (const a of analyses) { ordered[a] = facetRows[a]; }

  // ---------- derived 层：hotspot_priority_v1（确定性可复算＋规则版本随行） ----------
  let revisions: number | null = null;
  let hotspotScore: number | null = null;
  for (const r of ordered['revisions'] || []) { const n = asNum(r.row['n_revs']); if (n !== null && (revisions === null || n > revisions)) { revisions = n; } }
  for (const r of ordered['hotspots'] || []) {
    const n = asNum(r.row['revisions']); if (n !== null && (revisions === null || n > revisions)) { revisions = n; }
    const s = asNum(r.row['hotspot_score']); if (s !== null && (hotspotScore === null || s > hotspotScore)) { hotspotScore = s; }
  }
  // percentile scope=repo：同观测集全部 subject 的 hotspot_score 分布（中位秩法 less+eq/2 确定性消并列）
  //   缝合一致性（D-137③）：被取代旧名（其 to 端在集内有行的 from 名）不入同 repo 分布——同一文件
  //   新旧名两行只计新名一次，防缝合语义的 repo 级重复计数。
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

  // 失败三态（D-123）：binary/generated 走 miss not_applicable；new_file/insufficient_history=显式态仅静态指标
  const failure: 'ok' | SuppressedFacetReason = revisions === 1 ? 'new_file'
    : (revisions !== null && revisions < FILE_CARD_INSUFFICIENT_MIN_REVS) ? 'insufficient_history' : 'ok';
  const suppressed = failure !== 'ok';

  // D-136 失败态投影收口（#83）：kernel 卡面只留静态指标集（closed）——历史派生族及未声明 facet
  //   一律移 suppressed_facets 带原因码（fail-closed：未入静态集=失败态不上卡面，防退化值冒充有效读数）；
  //   raw 事实层 append-only 不动（收口只作用投影层）；derived.suppressed_by 现行保留。
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
    // 缝合账本：解析到边（含纯环边）即披露——旧名解析成功但零行并入亦如实（stitched_from 非空＋facet_rows 无该行 subject_ref 可互证）
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
  // 叙事层：hints=只引用卡内已算值键名（零指标值纪律）；key_check=键存在性校验自洽回执
  card.narrative.hints = fileCardCitationKeys(card);
  card.narrative.key_check = { referenced: card.narrative.hints.slice(), missing: [], ok: true };
  return card;
}
