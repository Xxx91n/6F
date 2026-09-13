// collect/collectors.ts — 三族确定性采集器（A-022 / spec.md §R3-D3）
// 单模块约束：不含任何相对 import，使守卫脚本可用 Node 自带类型剥离直接 import（Node 22.18+）。
// 纯逻辑约束：输入一律注入；不读 fs、不起子进程、不发网络请求、不接 LLM。
// 决议继承：D-016/D-017（确定性、不接 LLM）· D-018（正对照与真判据同族）· A-010（correlation key 前置）· A-021（schema v0）

import { createHash } from 'node:crypto';

// ---------- §1 公共契约 ----------

export interface CollectContext {
  runId: string;
  traceId: string;
  repoRef: string;
  scale: string;
  observedAt: string;
}

export interface CollectedFact {
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

export interface CollectorDescriptor {
  id: string;
  family: string;
  dimension: string | null;
  quadrant: string;
}

export function sha256Hex(input: string): string {
  return createHash('sha256').update(input, 'utf8').digest('hex');
}

export function uuidFromHex(hex: string): string {
  const h = (hex + '00000000000000000000000000000000').slice(0, 32);
  return h.slice(0, 8) + '-' + h.slice(8, 12) + '-' + h.slice(12, 16) + '-' + h.slice(16, 20) + '-' + h.slice(20, 32);
}

export function deriveBaggageId(ctx: CollectContext, dimension: string | null): string {
  const parts = [ctx.repoRef, ctx.scale, 'strategic', dimension === null ? 'na' : dimension, ctx.runId];
  return sha256Hex(parts.join('|')).slice(0, 32);
}

export function deriveFactId(collectorId: string, subjectRef: string, metric: string, valueJson: string, observedAt: string): string {
  return uuidFromHex(sha256Hex([collectorId, subjectRef, metric, valueJson, observedAt].join('|')));
}

export function toValueJson(value: unknown): string {
  return JSON.stringify(value);
}

export function makeFact(
  ctx: CollectContext,
  desc: CollectorDescriptor,
  subjectRef: string,
  evidenceRef: string,
  metric: string,
  value: unknown
): CollectedFact {
  const valueJson = toValueJson(value);
  return {
    fact_id: deriveFactId(desc.id, subjectRef, metric, valueJson, ctx.observedAt),
    trace_id: ctx.traceId,
    baggage_id: deriveBaggageId(ctx, desc.dimension),
    scale: ctx.scale,
    quadrant: desc.quadrant,
    dimension: desc.dimension,
    collector_id: desc.id,
    repo_ref: ctx.repoRef,
    subject_ref: subjectRef,
    evidence_ref: evidenceRef,
    metric: metric,
    value_json: valueJson,
    observed_at: ctx.observedAt
  };
}

export function daysBetweenUtc(a: string, b: string): number {
  const ta = Date.parse(a.slice(0, 10) + 'T00:00:00Z');
  const tb = Date.parse(b.slice(0, 10) + 'T00:00:00Z');
  if (!isFinite(ta) || !isFinite(tb)) { return NaN; }
  return Math.round((ta - tb) / 86400000);
}

// ---------- §2 族一：adr-structure（S2 ADR 结构扫描） ----------

export const ADR_STRUCTURE_ID = 'adr-structure@v1';
export const ADR_STRUCTURE_FAMILY = 'adr-structure';
export const ADR_HEADER_FIELDS: readonly string[] = ['Status', 'Date', 'Deciders', 'Ledger'];
export const ADR_SECTIONS: readonly string[] = ['Context', 'Decision', 'Consequences', 'Options'];
export const ADR_FIVE_PIECE: readonly string[] = ['Status', 'Date', 'Context', 'Decision', 'Consequences'];

export interface AdrDocument {
  path: string;
  text: string;
}

export interface AdrStructureInput {
  documents: readonly AdrDocument[];
}

export const ADR_STRUCTURE_DESCRIPTOR: CollectorDescriptor = {
  id: ADR_STRUCTURE_ID,
  family: ADR_STRUCTURE_FAMILY,
  dimension: 'S2',
  quadrant: 'strategic'
};

interface HeaderHit {
  value: string;
  line: number;
}

interface SectionHit {
  name: string;
  line: number;
}

function linesOf(text: string): string[] {
  return text.split(/\r?\n/);
}

function parseHeaderFields(lines: readonly string[]): Record<string, HeaderHit> {
  const out: Record<string, HeaderHit> = {};
  let started = false;
  for (let i = 0; i < lines.length; i++) {
    const raw = lines[i];
    if (/^#\s+/.test(raw)) { started = true; continue; }
    if (!started) { continue; }
    if (/^##\s+/.test(raw)) { break; }
    const m = raw.match(/^-\s*([A-Za-z][A-Za-z ]*?)\s*:\s*(.*)$/);
    if (m) {
      const key = m[1].trim();
      if (!(key in out)) { out[key] = { value: m[2].trim(), line: i + 1 }; }
    }
  }
  return out;
}

function parseSections(lines: readonly string[]): Record<string, SectionHit> {
  const out: Record<string, SectionHit> = {};
  for (let i = 0; i < lines.length; i++) {
    const m = lines[i].match(/^##\s+(.+?)\s*$/);
    if (!m) { continue; }
    let name = m[1].trim();
    if (/^considered\s+options$/i.test(name)) { name = 'Options'; }
    if (!(name in out)) { out[name] = { name: name, line: i + 1 }; }
  }
  return out;
}

function findSupersede(lines: readonly string[]): { present: boolean; matches: number; line: number } {
  let matches = 0;
  let line = 0;
  for (let i = 0; i < lines.length; i++) {
    if (lines[i].toLowerCase().indexOf('supersede') >= 0) {
      matches++;
      if (line === 0) { line = i + 1; }
    }
  }
  return { present: matches > 0, matches: matches, line: line };
}

function evidenceFor(path: string, present: boolean, line: number): string {
  return present && line > 0 ? path + '#L' + line : path;
}

export function collectAdrStructure(input: AdrStructureInput, ctx: CollectContext): CollectedFact[] {
  const out: CollectedFact[] = [];
  for (const doc of input.documents) {
    const lines = linesOf(doc.text);
    const headers = parseHeaderFields(lines);
    const sections = parseSections(lines);
    for (const field of ADR_HEADER_FIELDS) {
      const hit = headers[field];
      const present = !!hit;
      const line = present ? hit.line : 0;
      out.push(makeFact(ctx, ADR_STRUCTURE_DESCRIPTOR, doc.path, evidenceFor(doc.path, present, line), 'adr.header_field_present', {
        field: field,
        present: present,
        line: line
      }));
    }
    for (const section of ADR_SECTIONS) {
      const hit = sections[section];
      const present = !!hit;
      const line = present ? hit.line : 0;
      out.push(makeFact(ctx, ADR_STRUCTURE_DESCRIPTOR, doc.path, evidenceFor(doc.path, present, line), 'adr.section_present', {
        section: section,
        present: present,
        line: line
      }));
    }
    const missing: string[] = [];
    let presentCount = 0;
    for (const item of ADR_FIVE_PIECE) {
      const has = item === 'Status' || item === 'Date' ? !!headers[item] : !!sections[item];
      if (has) { presentCount++; } else { missing.push(item); }
    }
    out.push(makeFact(ctx, ADR_STRUCTURE_DESCRIPTOR, doc.path, doc.path, 'adr.five_piece_completeness', {
      present: presentCount,
      of: ADR_FIVE_PIECE.length,
      ratio: presentCount / ADR_FIVE_PIECE.length,
      missing: missing
    }));
    const sup = findSupersede(lines);
    out.push(makeFact(ctx, ADR_STRUCTURE_DESCRIPTOR, doc.path, evidenceFor(doc.path, sup.present, sup.line), 'adr.supersede_link_present', {
      present: sup.present,
      matches: sup.matches,
      line: sup.line
    }));
    const dateHit = headers['Date'];
    out.push(makeFact(ctx, ADR_STRUCTURE_DESCRIPTOR, doc.path, evidenceFor(doc.path, !!dateHit, dateHit ? dateHit.line : 0), 'adr.decision_date', {
      date: dateHit ? dateHit.value : null
    }));
  }
  return out;
}

export function adrDates(input: AdrStructureInput): Record<string, string> {
  const out: Record<string, string> = {};
  for (const doc of input.documents) {
    const headers = parseHeaderFields(linesOf(doc.text));
    if (headers['Date']) { out[doc.path] = headers['Date'].value; }
  }
  return out;
}

// ---------- §3 族二：positioning（S1 定位素材） ----------

export const POSITIONING_ID = 'positioning@v1';
export const POSITIONING_FAMILY = 'positioning';

export interface TextDoc {
  path: string;
  text: string;
}

export interface PositioningInput {
  intentDocs: readonly TextDoc[];
  deliveryDocs: readonly TextDoc[];
  topN: number;
  stopwords: readonly string[];
}

export const POSITIONING_DESCRIPTOR: CollectorDescriptor = {
  id: POSITIONING_ID,
  family: POSITIONING_FAMILY,
  dimension: 'S1',
  quadrant: 'strategic'
};

export function tokenize(text: string): string[] {
  const lower = text.toLowerCase();
  const out: string[] = [];
  const ascii = lower.match(/[a-z][a-z0-9_+-]*/g) || [];
  for (const w of ascii) {
    if (w.length >= 2) { out.push(w); }
  }
  const cjk = lower.match(/[\u4e00-\u9fff]+/g) || [];
  for (const run of cjk) {
    for (let i = 0; i + 1 < run.length; i++) { out.push(run.slice(i, i + 2)); }
  }
  return out;
}

export function countTokens(tokens: readonly string[]): Record<string, number> {
  const out: Record<string, number> = {};
  for (const t of tokens) {
    out[t] = (out[t] || 0) + 1;
  }
  return out;
}

export function extractKeywords(text: string, topN: number, stopwords: readonly string[]): string[] {
  const counts = countTokens(tokenize(text));
  const stop = new Set<string>();
  for (const s of stopwords) { stop.add(s.toLowerCase()); }
  const keys = Object.keys(counts).filter(function (k) { return !stop.has(k); });
  keys.sort(function (a, b) {
    const d = counts[b] - counts[a];
    if (d !== 0) { return d; }
    if (a < b) { return -1; }
    if (a > b) { return 1; }
    return 0;
  });
  return keys.slice(0, topN);
}

export function collectPositioning(input: PositioningInput, ctx: CollectContext): CollectedFact[] {
  const out: CollectedFact[] = [];
  const deliveryText = input.deliveryDocs.map(function (d) { return d.text; }).join('\n');
  const deliveryCounts = countTokens(tokenize(deliveryText));
  for (const doc of input.intentDocs) {
    const intentCounts = countTokens(tokenize(doc.text));
    const keywords = extractKeywords(doc.text, input.topN, input.stopwords);
    const missed: string[] = [];
    let hit = 0;
    for (const k of keywords) {
      const deliveryCount = deliveryCounts[k] || 0;
      out.push(makeFact(ctx, POSITIONING_DESCRIPTOR, doc.path, doc.path, 'positioning.keyword_hit', {
        keyword: k,
        hit: deliveryCount > 0,
        intent_count: intentCounts[k] || 0,
        delivery_count: deliveryCount
      }));
      if (deliveryCount > 0) { hit++; } else { missed.push(k); }
    }
    const total = keywords.length;
    out.push(makeFact(ctx, POSITIONING_DESCRIPTOR, doc.path, doc.path, 'positioning.keyword_coverage', {
      keywords: total,
      hit: hit,
      ratio: total === 0 ? 0 : hit / total,
      missed: missed
    }));
    const firstMissed = missed.length > 0 ? missed[0] : null;
    out.push(makeFact(ctx, POSITIONING_DESCRIPTOR, doc.path, doc.path, 'positioning.drift_anchor', {
      first_missed_keyword: firstMissed,
      anchor: firstMissed
    }));
  }
  return out;
}

// ---------- §4 族三：gitlog（跨族交叉） ----------

export const GITLOG_ID = 'gitlog@v1';
export const GITLOG_FAMILY = 'gitlog';

export interface CommitRecord {
  sha: string;
  author: string;
  date: string;
  paths: readonly string[];
}

export interface GitlogInput {
  commits: readonly CommitRecord[];
  paths: readonly string[];
  adrDates: Readonly<Record<string, string>>;
}

export const GITLOG_DESCRIPTOR: CollectorDescriptor = {
  id: GITLOG_ID,
  family: GITLOG_FAMILY,
  dimension: null,
  quadrant: 'strategic'
};

export function collectGitlog(input: GitlogInput, ctx: CollectContext): CollectedFact[] {
  const out: CollectedFact[] = [];
  for (const path of input.paths) {
    const touching = input.commits.filter(function (c) { return c.paths.indexOf(path) >= 0; });
    if (touching.length === 0) { continue; }
    const sorted = touching.slice().sort(function (a, b) {
      if (a.date < b.date) { return -1; }
      if (a.date > b.date) { return 1; }
      if (a.sha < b.sha) { return -1; }
      if (a.sha > b.sha) { return 1; }
      return 0;
    });
    const first = sorted[0];
    out.push(makeFact(ctx, GITLOG_DESCRIPTOR, path, first.sha, 'git.first_commit', {
      path: path,
      sha: first.sha,
      date: first.date
    }));
    out.push(makeFact(ctx, GITLOG_DESCRIPTOR, path, first.sha, 'git.commit_count', {
      path: path,
      count: touching.length
    }));
    const authorCounts: Record<string, number> = {};
    for (const c of touching) { authorCounts[c.author] = (authorCounts[c.author] || 0) + 1; }
    const authors = Object.keys(authorCounts).sort();
    let topAuthor = authors[0];
    for (const a of authors) {
      if (authorCounts[a] > authorCounts[topAuthor]) { topAuthor = a; }
    }
    out.push(makeFact(ctx, GITLOG_DESCRIPTOR, path, first.sha, 'git.author_matrix', {
      path: path,
      authors: authors,
      top_author: topAuthor,
      top_share: authorCounts[topAuthor] / touching.length
    }));
    const adrDate = input.adrDates[path];
    if (adrDate) {
      out.push(makeFact(ctx, GITLOG_DESCRIPTOR, path, first.sha, 'git.adr_lag_days', {
        path: path,
        adr_date: adrDate,
        first_commit_date: first.date,
        delta_days: daysBetweenUtc(adrDate, first.date)
      }));
    }
  }
  return out;
}

// ---------- §5 注册表 + detector 同族声明（供票 22 直接引用） ----------

export const COLLECTOR_DESCRIPTORS: readonly CollectorDescriptor[] = [
  ADR_STRUCTURE_DESCRIPTOR,
  POSITIONING_DESCRIPTOR,
  GITLOG_DESCRIPTOR
];

export const COLLECTOR_FAMILIES: readonly string[] = COLLECTOR_DESCRIPTORS.map(function (d) { return d.family; });

export interface DetectorBindingEntry {
  criterion: string;
  type: string;
  families: readonly string[];
  same_family_control: string | null;
  threshold: string | null;
}

export const DETECTOR_BINDING: readonly DetectorBindingEntry[] = [
  { criterion: 'PC-1', type: 'positive_control', families: ['adr-structure', 'positioning'], same_family_control: null, threshold: null },
  { criterion: 'PC-2', type: 'positive_control', families: ['gitlog', 'adr-structure'], same_family_control: null, threshold: null },
  { criterion: 'TC-1', type: 'true_criterion', families: ['gitlog', 'adr-structure'], same_family_control: 'PC-2', threshold: null },
  { criterion: 'TC-2', type: 'true_criterion', families: ['adr-structure'], same_family_control: 'PC-1', threshold: null },
  { criterion: 'TC-3', type: 'true_criterion', families: ['positioning'], same_family_control: 'PC-1', threshold: null },
  { criterion: 'NC-1', type: 'negative_control', families: ['adr-structure'], same_family_control: null, threshold: null }
];

export function bindingByCriterion(criterion: string): DetectorBindingEntry | null {
  for (const e of DETECTOR_BINDING) {
    if (e.criterion === criterion) { return e; }
  }
  return null;
}
