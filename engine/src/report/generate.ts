// report/generate.ts - 首报生成器纯逻辑（A-026 / A-027 / spec.md §R3-D5）
// 单模块约束：只依赖 node: 内建（node:crypto）；守卫脚本可用 Node 类型剥离直接 import（承 #21 教训）。
// 契约继承：ADR-0006 四章锁定（骨架 1.1.0，上源 reports/14-skeleton-fields.json#skeleton）；
//           ADR-0013 C 层四条款 B1-B5；A-027 agent 可消费性；A-018 降级不改骨架；A-010 correlation key 前置。
// 纯逻辑约束：输入一律注入；不读 fs、不起子进程、不发网络请求、不接 LLM（D-016）。

import { createHash } from 'node:crypto';
import { sealNarrativeSections, renderTemplateNarrative, NARRATIVE_SEAL_PROTOCOL } from './narrative.js';
import type { NarrativeSection, SealedNarrative } from './narrative.js';
import { UNVERIFIED_MARK, checkCitationSupport, checkAllCitations } from './citation.js';
import type { EvidenceItem, ClaimAnchor, CitationCheck, SupportRelation } from './citation.js';

// 引文核验面已抽入叶子模块 citation.ts（C1：破 generate↔narrative 运行期循环 import）；
// 此处 re-export 保持既有 import 路径 'generate.js' 不破。
export { UNVERIFIED_MARK, checkCitationSupport, checkAllCitations };
export type { EvidenceItem, ClaimAnchor, CitationCheck, SupportRelation };

export const REPORT_SKELETON_VERSION = '1.1.0';
export const REPORT_SKELETON_SOURCE = 'reports/14-skeleton-fields.json#skeleton';
export const ADJUDICATION_PROTOCOL_VERSION = 'ADR-0013-C/v1';

export interface SkeletonChapter {
  id: string;
  ordinal: number;
  name: string;
  required_fields: readonly string[];
}

export const REPORT_SKELETON: readonly SkeletonChapter[] = [
  { id: 'C1', ordinal: 1, name: '执行摘要', required_fields: ['report_id', 'schema_version', 'scale', 'subject_ref', 'generated_at', 'correlation_key', 'overall_verdict', 'confidence', 'headline', 'top_findings', 'degraded_mode', 'stale_data_marker', 'staleness_sla_seconds', 'read_model_lag_seconds', 'read_model_version', 'fact_watermark_version'] },
  { id: 'C2', ordinal: 2, name: '四象限与裁决', required_fields: ['quadrants', 'quadrant', 'applicability', 'verdict', 'score', 'confidence', 'dimensions', 'slice_fields', 'verdict_gate.protocol_version', 'verdict_gate.decision', 'verdict_gate.evidence_threshold_met', 'verdict_gate.decided_at', 'verdict_gate.override_reason', 'verdict_gate.audit_ref', 'conflict_markers'] },
  { id: 'C3', ordinal: 3, name: '证据', required_fields: ['evidence_items', 'evidence_id', 'source', 'locator', 'claim', 'grounded', 'collected_at', 'reproduce_cmd', 'reproduce_absent_reason'] },
  { id: 'C4', ordinal: 4, name: '行动建议', required_fields: ['recommendations', 'rec_id', 'priority', 'action', 'rationale', 'expected_impact', 'effort', 'verdict_gate_stamp', 'evidence_refs', 'degraded_note'] }
];

export const CHAPTER_COUNT = REPORT_SKELETON.length;

export function chapterHeading(ch: SkeletonChapter): string {
  return '## ' + ch.id + ' ' + ch.name;
}

export function skeletonOf(markdown: string): string[] {
  const out: string[] = [];
  const lines = markdown.split(String.fromCharCode(10));
  for (const line of lines) {
    if (line.indexOf('## ') !== 0) { continue; }
    const rest = line.slice(3).trim();
    const sp = rest.indexOf(' ');
    if (sp <= 0) { continue; }
    const id = rest.slice(0, sp);
    if (id.length !== 2 || id.charAt(0) !== 'C') { continue; }
    if (id.charAt(1) < '1' || id.charAt(1) > '9') { continue; }
    out.push(id + ' ' + rest.slice(sp + 1));
  }
  return out;
}
export type VerdictBand = 'supported' | 'unsupported' | 'insufficient';
export type Applicability = 'native' | 'derived' | 'not_applicable';

export interface AdjudicationEntry {
  criterion_id: string;
  band: VerdictBand;
  basis_refs: readonly string[];
  anchored_fact_ids: readonly string[];
  anchored_evidence_ids: readonly string[];
  decided_at: string;
  rationale: string;
}

export interface HumanAdjudication {
  status: 'pending' | 'provided';
  adjudicator: string;
  text: string | null;
  decided_at: string | null;
}

export interface AdjudicationBlock {
  protocol_version: string;
  decided_at: string;
  overall: VerdictBand;
  entries: AdjudicationEntry[];
  human: HumanAdjudication;
  citation_checks: CitationCheck[];
}

export function deriveOverallBand(entries: readonly AdjudicationEntry[]): VerdictBand {
  let red = false;
  let inconclusive = false;
  for (const e of entries) {
    if (e.criterion_id.indexOf('PC-') === 0 && e.band !== 'supported') { return 'insufficient'; }
    if (e.criterion_id.indexOf('NC-') === 0 && e.band !== 'supported') { return 'insufficient'; }
    if (e.criterion_id.indexOf('TC-') === 0 && e.band === 'unsupported') { red = true; }
    if (e.criterion_id.indexOf('TC-') === 0 && e.band === 'insufficient') { inconclusive = true; }
  }
  if (red) { return 'unsupported'; }
  if (inconclusive) { return 'insufficient'; }
  return 'supported';
}

export function adjudicate(args: { entries: readonly AdjudicationEntry[]; claims: readonly ClaimAnchor[]; evidence: readonly EvidenceItem[]; decided_at: string; human?: HumanAdjudication }): AdjudicationBlock {
  const checks = checkAllCitations(args.claims, args.evidence);
  const human: HumanAdjudication = args.human ? args.human : { status: 'pending', adjudicator: 'user', text: null, decided_at: null };
  return {
    protocol_version: ADJUDICATION_PROTOCOL_VERSION,
    decided_at: args.decided_at,
    overall: deriveOverallBand(args.entries),
    entries: args.entries.slice(),
    human: human,
    citation_checks: checks
  };
}

export interface GateRef {
  prereg_commit: string;
  criteria_path: string;
  basis_path: string;
  criterion_ids: readonly string[];
}

export interface ContentDigest {
  algo: string;
  value: string;
  canonicalization: string;
}

export const CONTENT_DIGEST_CANONICALIZATION = 'json_utf8_entries_then_citation_checks';

// 双锚依据：调研报告 §2.1 / arXiv:2607.02820 —— commit sha 本身可塑（签名翻转仍可通过校验），
// tree sha 才是内容寻址的不可变主体，故 receipt 同时锚 commit + tree。
export interface Receipt {
  receipt_id: string;
  chain_hash: string;
  issued_at: string;
  commit_anchor: string;
  tree_anchor: string;
  content_digest: ContentDigest;
  gate_ref: GateRef;
  fact_count: number;
  adjudication_count: number;
  degraded: boolean;
  mark: string;
}

export function buildReceipt(args: { fact_ids: readonly string[]; adjudication: AdjudicationBlock; issued_at: string; commit_anchor: string; tree_anchor: string; gate_ref: GateRef; degraded: boolean }): Receipt {
  const sorted = args.fact_ids.slice().sort();
  const adjParts: string[] = [];
  for (const e of args.adjudication.entries) { adjParts.push(e.criterion_id + '=' + e.band); }
  const NL = String.fromCharCode(10);
  const digestInput = JSON.stringify(args.adjudication.entries) + NL + JSON.stringify(args.adjudication.citation_checks);
  const contentDigest = createHash('sha256').update(digestInput, 'utf8').digest('hex');
  const payload = [
    'facts:' + sorted.join(','),
    'adj:' + adjParts.join(','),
    'checks:' + args.adjudication.citation_checks.map(function (c) { return c.claim_id + '=' + c.support; }).join(','),
    'content_digest:' + contentDigest,
    'issued_at:' + args.issued_at,
    'commit:' + args.commit_anchor,
    'tree:' + args.tree_anchor,
    'gate_ref:' + args.gate_ref.prereg_commit + '|' + args.gate_ref.criteria_path + '|' + args.gate_ref.basis_path + '|' + args.gate_ref.criterion_ids.join(','),
    'degraded:' + (args.degraded ? '1' : '0')
  ].join(NL);
  const chain = createHash('sha256').update(payload, 'utf8').digest('hex');
  const receiptId = 'RCP-' + chain.slice(0, 16);
  let mark = 'RECEIPT ' + receiptId + ' chain=' + chain.slice(0, 32) + ' content=' + contentDigest.slice(0, 16) + ' facts=' + args.fact_ids.length + ' adjudications=' + args.adjudication.entries.length + ' issued_at=' + args.issued_at + ' commit=' + args.commit_anchor + ' tree=' + args.tree_anchor.slice(0, 12);
  if (args.degraded) { mark = mark + ' ' + UNVERIFIED_MARK; }
  return {
    receipt_id: receiptId,
    chain_hash: chain,
    issued_at: args.issued_at,
    commit_anchor: args.commit_anchor,
    tree_anchor: args.tree_anchor,
    content_digest: { algo: 'sha256', value: contentDigest, canonicalization: CONTENT_DIGEST_CANONICALIZATION },
    gate_ref: { prereg_commit: args.gate_ref.prereg_commit, criteria_path: args.gate_ref.criteria_path, basis_path: args.gate_ref.basis_path, criterion_ids: args.gate_ref.criterion_ids.slice() },
    fact_count: args.fact_ids.length,
    adjudication_count: args.adjudication.entries.length,
    degraded: args.degraded,
    mark: mark
  };
}

export interface VerdictGate {
  protocol_version: string;
  decision: string;
  evidence_threshold_met: boolean;
  decided_at: string;
  override_reason: string | null;
  audit_ref: string;
}

export interface QuadrantEntry {
  quadrant: string;
  applicability: Applicability;
  verdict: VerdictBand;
  score: number | null;
  confidence: number;
  dimensions: readonly string[];
  slice_fields: Readonly<Record<string, unknown>>;
  verdict_gate: VerdictGate;
  conflict_markers: readonly string[];
}

export interface Recommendation {
  rec_id: string;
  priority: string;
  action: string;
  rationale: string;
  expected_impact: string;
  effort: string;
  verdict_gate_stamp: string;
  evidence_refs: readonly string[];
  degraded_note: string | null;
}

export interface ReportStale {
  marker: 'fresh' | 'warn' | 'stale' | 'unknown';
  sla_seconds: number;
  lag_seconds: number;
  read_model_version: string;
  fact_watermark_version: string;
}

// preview 披露块（ADR-0017：preview 标注诚实是决策本体；D-037② 报告头字段统一契约面——
// 与 #45 演示披露块同一契约源，禁止两处手抄漂移）。可选字段：非 preview 报告为 null，骨架 1.1.0 不变。
export interface PreviewDisclosure {
  capability_label: string;
  calibration_scope: string;
  structural_limitations: readonly string[];
  not_in_preview: readonly string[];
}

export interface ReportInput {
  report_id: string;
  schema_version?: string;
  scale: string;
  subject_ref: string;
  generated_at: string;
  trace_id: string;
  baggage_id: string;
  headline: string;
  confidence: number;
  stale: ReportStale;
  fact_ids: readonly string[];
  top_findings: readonly string[];
  evidence: readonly EvidenceItem[];
  claims: readonly ClaimAnchor[];
  quadrants: readonly QuadrantEntry[];
  recommendations: readonly Recommendation[];
  adjudication_entries: readonly AdjudicationEntry[];
  decided_at: string;
  commit_anchor: string;
  tree_anchor: string;
  gate_ref: GateRef;
  degraded: boolean;
  degraded_reason: string | null;
  preview_disclosure?: PreviewDisclosure;
  human?: HumanAdjudication;
  narrative_sections?: readonly NarrativeSection[];
}

export interface Report {
  report_id: string;
  schema_version: string;
  scale: string;
  subject_ref: string;
  generated_at: string;
  correlation_key: { trace_id: string; baggage_id: string };
  overall_verdict: VerdictBand;
  confidence: number;
  headline: string;
  top_findings: string[];
  degraded_mode: boolean;
  degraded_reason: string | null;
  stale: ReportStale;
  fact_ids: string[];
  evidence: EvidenceItem[];
  claims: ClaimAnchor[];
  quadrants: QuadrantEntry[];
  recommendations: Recommendation[];
  adjudication: AdjudicationBlock;
  receipt: Receipt;
  preview_disclosure: PreviewDisclosure | null;
  narrative_sections: SealedNarrative[];
}

export function buildReport(input: ReportInput): Report {
  // 叙事双轨（D-053）：宿主 agent 段逐段盖章；degraded 报告无叙事→kernel 模板兜底注入（永居降级位，D-053① 通用兜底）
  const narrativeInput = (input.narrative_sections || []).slice();
  if (input.degraded && narrativeInput.length === 0) {
    // degraded:true 直建路径同样拿模板兜底（A2 修复：兜底不再仅 degradeReport 可达）
    narrativeInput.push(renderTemplateNarrative({ quadrants: input.quadrants.slice(), degraded_reason: input.degraded_reason }));
  }
  const adjudication = adjudicate({
    entries: input.adjudication_entries,
    claims: input.claims,
    evidence: input.evidence,
    decided_at: input.decided_at,
    human: input.human
  });
  const receipt = buildReceipt({
    fact_ids: input.fact_ids,
    adjudication: adjudication,
    issued_at: input.decided_at,
    commit_anchor: input.commit_anchor,
    tree_anchor: input.tree_anchor,
    gate_ref: input.gate_ref,
    degraded: input.degraded
  });
  return {
    report_id: input.report_id,
    schema_version: input.schema_version ? input.schema_version : REPORT_SKELETON_VERSION,
    scale: input.scale,
    subject_ref: input.subject_ref,
    generated_at: input.generated_at,
    correlation_key: { trace_id: input.trace_id, baggage_id: input.baggage_id },
    overall_verdict: adjudication.overall,
    confidence: input.confidence,
    headline: input.headline,
    top_findings: input.top_findings.slice(),
    degraded_mode: input.degraded,
    degraded_reason: input.degraded_reason,
    stale: input.stale,
    fact_ids: input.fact_ids.slice(),
    evidence: input.evidence.slice(),
    claims: input.claims.slice(),
    quadrants: input.quadrants.slice(),
    recommendations: input.recommendations.slice(),
    adjudication: adjudication,
    receipt: receipt,
    preview_disclosure: input.preview_disclosure ? input.preview_disclosure : null,
    narrative_sections: sealNarrativeSections(narrativeInput, input.evidence, input.decided_at)
  };
}

export function renderMarkdown(r: Report): string {
  const out: string[] = [];
  out.push('# ' + r.report_id + ' — ' + r.scale + ' 首报（' + r.subject_ref + '）');
  out.push('> ' + r.receipt.mark);
  out.push('>');
  out.push('> 骨架 ' + r.schema_version + '（章顺序锁定，ADR-0006）· 裁定协议 ' + r.adjudication.protocol_version + ' · 生成于 ' + r.generated_at);
  if (r.degraded_mode) {
    out.push('>');
    out.push('> 降级产出：' + (r.degraded_reason ? r.degraded_reason : '未声明') + ' ' + UNVERIFIED_MARK);
  }
  if (r.preview_disclosure) {
    out.push('>');
    out.push('> 披露块（preview 标注诚实 = 决策本体，ADR-0017；机器可读字段见侧车 preview_disclosure）');
    out.push('> - capability: ' + r.preview_disclosure.capability_label);
    out.push('> - calibration_scope: ' + r.preview_disclosure.calibration_scope);
    out.push('> - structural_limitations: ' + r.preview_disclosure.structural_limitations.join('；'));
    out.push('> - not_in_preview: ' + r.preview_disclosure.not_in_preview.join(' / '));
  }
  out.push('');
  for (const ch of REPORT_SKELETON) {
    out.push(chapterHeading(ch));
    out.push('');
    if (ch.id === 'C1') {
      out.push('- report_id: ' + r.report_id);
      out.push('- schema_version: ' + r.schema_version);
      out.push('- scale: ' + r.scale);
      out.push('- subject_ref: ' + r.subject_ref);
      out.push('- generated_at: ' + r.generated_at);
      out.push('- correlation_key: trace_id=' + r.correlation_key.trace_id + ' baggage_id=' + r.correlation_key.baggage_id);
      out.push('- overall_verdict: ' + r.overall_verdict);
      out.push('- confidence: ' + r.confidence);
      out.push('- headline: ' + r.headline);
      out.push('- degraded_mode: ' + r.degraded_mode);
      out.push('- stale_data_marker: ' + r.stale.marker + '（SLA ' + r.stale.sla_seconds + 's / 实测延迟 ' + r.stale.lag_seconds + 's）');
      out.push('- read_model_version: ' + r.stale.read_model_version + ' · fact_watermark_version: ' + r.stale.fact_watermark_version);
      out.push('- top_findings: ' + r.top_findings.join(', '));
      out.push('- fact_ids: ' + r.fact_ids.length + ' 条（清单见侧车 JSON）');
    } else if (ch.id === 'C2') {
      for (const q of r.quadrants) {
        out.push('### ' + q.quadrant + '（applicability=' + q.applicability + '）');
        out.push('- verdict: ' + q.verdict + ' · score: ' + (q.score === null ? 'n/a' : String(q.score)) + ' · confidence: ' + q.confidence);
        out.push('- dimensions: ' + q.dimensions.join(', '));
        out.push('- slice_fields: ' + JSON.stringify(q.slice_fields));
        out.push('- conflict_markers: ' + (q.conflict_markers.length === 0 ? '(none)' : q.conflict_markers.join(', ')));
        out.push('- verdict_gate: ' + q.verdict_gate.protocol_version + ' / ' + q.verdict_gate.decision + ' / threshold_met=' + q.verdict_gate.evidence_threshold_met + ' / decided_at=' + q.verdict_gate.decided_at + ' / audit_ref=' + q.verdict_gate.audit_ref);
        out.push('');
      }
      out.push('#### 结构化裁决块（agent 可消费）');
      out.push('- protocol_version: ' + r.adjudication.protocol_version);
      out.push('- overall: ' + r.adjudication.overall + ' · decided_at: ' + r.adjudication.decided_at);
      for (const e of r.adjudication.entries) {
        out.push('- ' + e.criterion_id + ': ' + e.band + ' | basis=' + e.basis_refs.join('+') + ' | facts=' + (e.anchored_fact_ids.length === 0 ? '(none)' : e.anchored_fact_ids.join(',')) + ' | evidence=' + (e.anchored_evidence_ids.length === 0 ? '(none)' : e.anchored_evidence_ids.join(',')) + ' | ' + e.rationale);
      }
      out.push('- human_adjudication: ' + r.adjudication.human.status + '（裁定仍由人做，见 B5）');
      if (r.narrative_sections.length > 0) {
        out.push('#### 叙事段（宿主 agent 生成/kernel 盖章；叙事面不携带裁决 band——红线 D-053/ADR-0013）');
        for (const ns of r.narrative_sections) {
          const grounded = ns.seal.checks.filter(function (c) { return c.support === 'supports'; }).length;
          out.push('- [' + ns.section_id + '] author=' + ns.author + ' model_id=' + (ns.model_id ? ns.model_id : '(none)') + ' stamp=' + ns.seal.stamp + ' grounded=' + grounded + '/' + ns.seal.checks.length);
          out.push('  - text: ' + ns.text);
          for (const ck of ns.seal.checks) {
            out.push('  - ' + ck.claim_id + ' -> ' + ck.evidence_id + ': ' + ck.support + '（matched=' + ck.matched_tokens.join('|') + ' missing=' + ck.missing_tokens.join('|') + '）' + ck.reason);
          }
          if (ns.seal.band_violations.length > 0) { out.push('  - band_violations: ' + ns.seal.band_violations.join('；')); }
        }
      }
    } else if (ch.id === 'C3') {
      for (const e of r.evidence) {
        out.push('### ' + e.evidence_id + ' — ' + e.source + ' @ ' + e.locator);
        out.push('- claim: ' + e.claim);
        out.push('- grounded: ' + e.grounded + ' · collected_at: ' + e.collected_at);
        out.push('- reproduce_cmd: ' + (e.reproduce_cmd.length > 0 ? e.reproduce_cmd : '(absent: ' + (e.reproduce_absent_reason ? e.reproduce_absent_reason : '未声明') + ')'));
        out.push('- 引文原文: ' + (e.excerpt.length > 0 ? e.excerpt : '（缺失 —— ' + UNVERIFIED_MARK + '）'));
        out.push('');
      }
      out.push('#### 引文→结论支持关系校验');
      for (const c of r.adjudication.citation_checks) {
        out.push('- ' + c.claim_id + ' -> ' + c.evidence_id + ': ' + c.support + '（matched=' + c.matched_tokens.join('|') + ' missing=' + c.missing_tokens.join('|') + '）' + c.reason);
      }
    } else if (ch.id === 'C4') {
      for (const rec of r.recommendations) {
        out.push('### ' + rec.rec_id + ' [' + rec.priority + '] ' + rec.action);
        out.push('- rationale: ' + rec.rationale);
        out.push('- expected_impact: ' + rec.expected_impact + ' · effort: ' + rec.effort);
        out.push('- verdict_gate_stamp: ' + rec.verdict_gate_stamp);
        out.push('- evidence_refs: ' + rec.evidence_refs.join(', '));
        out.push('- degraded_note: ' + (rec.degraded_note ? rec.degraded_note : '(none)'));
        out.push('');
      }
    }
    out.push('');
  }
  return out.join(String.fromCharCode(10));
}

export interface Sidecar {
  schema_version: string;
  report_id: string;
  scale: string;
  subject_ref: string;
  generated_at: string;
  correlation_key: { trace_id: string; baggage_id: string };
  receipt: Receipt;
  overall_verdict: VerdictBand;
  confidence: number;
  degraded_mode: boolean;
  degraded_reason: string | null;
  stale: ReportStale;
  skeleton: { id: string; ordinal: number; name: string; required_fields: readonly string[] }[];
  fact_ids: string[];
  adjudication: AdjudicationBlock;
  citation_checks: CitationCheck[];
  evidence: EvidenceItem[];
  quadrants: QuadrantEntry[];
  recommendations: Recommendation[];
  preview_disclosure: PreviewDisclosure | null;
  narrative_sections: SealedNarrative[];
  machine_contract: { citation_anchor_format: string; verdict_enum: string[]; human_adjudication_status: string; narrative_seal_protocol: string };
}

export function toSidecar(r: Report): Sidecar {
  return {
    schema_version: r.schema_version,
    report_id: r.report_id,
    scale: r.scale,
    subject_ref: r.subject_ref,
    generated_at: r.generated_at,
    correlation_key: r.correlation_key,
    receipt: r.receipt,
    overall_verdict: r.overall_verdict,
    confidence: r.confidence,
    degraded_mode: r.degraded_mode,
    degraded_reason: r.degraded_reason,
    stale: r.stale,
    skeleton: REPORT_SKELETON.map(function (ch) {
      return { id: ch.id, ordinal: ch.ordinal, name: ch.name, required_fields: ch.required_fields };
    }),
    fact_ids: r.fact_ids,
    adjudication: r.adjudication,
    citation_checks: r.adjudication.citation_checks,
    evidence: r.evidence,
    quadrants: r.quadrants,
    recommendations: r.recommendations,
    preview_disclosure: r.preview_disclosure,
    narrative_sections: r.narrative_sections,
    machine_contract: {
      citation_anchor_format: 'evidence_id + source + locator（三者齐备即为可解析引文锚）',
      verdict_enum: ['supported', 'unsupported', 'insufficient'],
      human_adjudication_status: r.adjudication.human.status,
      narrative_seal_protocol: NARRATIVE_SEAL_PROTOCOL
    }
  };
}

export function renderSidecar(r: Report): string {
  return JSON.stringify(toSidecar(r), null, 2);
}

export function degradeReport(r: Report, reason: string): Report {
  const evidence: EvidenceItem[] = r.evidence.map(function (e): EvidenceItem {
    return {
      evidence_id: e.evidence_id,
      source: e.source,
      locator: e.locator,
      claim: e.claim,
      grounded: false,
      collected_at: e.collected_at,
      reproduce_cmd: '',
      reproduce_absent_reason: reason,
      required_tokens: e.required_tokens,
      excerpt: ''
    };
  });
  const entries: AdjudicationEntry[] = r.adjudication.entries.map(function (e): AdjudicationEntry {
    return {
      criterion_id: e.criterion_id,
      band: 'insufficient',
      basis_refs: ['B1', 'B4'],
      anchored_fact_ids: [],
      anchored_evidence_ids: [],
      decided_at: e.decided_at,
      rationale: '降级：' + reason
    };
  });
  const adjudication = adjudicate({
    entries: entries,
    claims: r.claims,
    evidence: evidence,
    decided_at: r.adjudication.decided_at,
    human: r.adjudication.human
  });
  const receipt = buildReceipt({
    fact_ids: [],
    adjudication: adjudication,
    issued_at: r.receipt.issued_at,
    commit_anchor: r.receipt.commit_anchor,
    tree_anchor: r.receipt.tree_anchor,
    gate_ref: r.receipt.gate_ref,
    degraded: true
  });
  const out: Report = {
    report_id: r.report_id + '-degraded',
    schema_version: r.schema_version,
    scale: r.scale,
    subject_ref: r.subject_ref,
    generated_at: r.generated_at,
    correlation_key: r.correlation_key,
    overall_verdict: 'insufficient',
    confidence: 0,
    headline: r.headline,
    top_findings: r.top_findings.slice(),
    degraded_mode: true,
    degraded_reason: reason,
    stale: { marker: 'unknown', sla_seconds: r.stale.sla_seconds, lag_seconds: r.stale.lag_seconds, read_model_version: r.stale.read_model_version, fact_watermark_version: r.stale.fact_watermark_version },
    fact_ids: [],
    evidence: evidence,
    claims: r.claims.slice(),
    quadrants: r.quadrants.map(function (q): QuadrantEntry {
      return {
        quadrant: q.quadrant,
        applicability: q.applicability,
        verdict: 'insufficient',
        score: null,
        confidence: 0,
        dimensions: q.dimensions,
        slice_fields: q.slice_fields,
        verdict_gate: {
          protocol_version: q.verdict_gate.protocol_version,
          decision: 'insufficient',
          evidence_threshold_met: false,
          decided_at: q.verdict_gate.decided_at,
          override_reason: reason,
          audit_ref: q.verdict_gate.audit_ref
        },
        conflict_markers: q.conflict_markers.concat(['degraded'])
      };
    }),
    recommendations: r.recommendations.map(function (rec): Recommendation {
      return {
        rec_id: rec.rec_id,
        priority: rec.priority,
        action: rec.action,
        rationale: rec.rationale,
        expected_impact: rec.expected_impact,
        effort: rec.effort,
        verdict_gate_stamp: 'insufficient ' + UNVERIFIED_MARK,
        evidence_refs: rec.evidence_refs,
        degraded_note: '降级产出：' + reason + ' ' + UNVERIFIED_MARK
      };
    }),
    adjudication: adjudication,
    receipt: receipt,
    preview_disclosure: r.preview_disclosure,
    narrative_sections: []
  };
  // degraded 兜底=kernel 模板叙事（D-053①：永居降级位，不冒充正式叙事）。
  // A1 修复：模板引用降级后对象 out（degraded_reason 已就位），不再读降级前对象输出「未声明」。
  // C5 裁定：已盖章宿主叙事不静默丢弃——按降级后证据重盖章（引文多落 insufficient→sealed-with-gaps 如实留痕），
  //          模板叙事追加在降级位；宿主段丢失=审计痕迹丢失，与双轨纪律相抵。
  const hostKept: NarrativeSection[] = r.narrative_sections.map(function (s): NarrativeSection {
    return { section_id: s.section_id, author: s.author, model_id: s.model_id, text: s.text, claims: s.claims.slice() };
  });
  out.narrative_sections = sealNarrativeSections(hostKept.concat([renderTemplateNarrative(out)]), out.evidence, out.adjudication.decided_at);
  return out;
}

