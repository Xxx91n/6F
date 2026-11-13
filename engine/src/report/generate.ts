// report/generate.ts —— 报告生成器，纯逻辑
// 单模块：只吃 node 内建（node:crypto），不另拉依赖。
// 结构照着老样子：报告模板是固定的骨架加各档自己的字段；章节顺序定死，降级了结构也不变。
// 纯逻辑：输入全靠参数传，不读文件、不起子进程、不连网、不调大模型。

import { createHash } from 'node:crypto';
import { intakeEscalation, deriveReasonClass, VERDICT_REASON_CLASSES } from '../intake/quarantine.js';
import { sealNarrativeSections, renderTemplateNarrative, NARRATIVE_SEAL_PROTOCOL } from './narrative.js';
import type { NarrativeSection, SealedNarrative } from './narrative.js';
import { UNVERIFIED_MARK, checkCitationSupport, checkAllCitations } from './citation.js';
import type { EvidenceItem, ClaimAnchor, CitationCheck, SupportRelation } from './citation.js';

// 引文核对真正的实现在 citation.ts，这里只再导出一遍，原来引用这儿的地方不用改。
export { UNVERIFIED_MARK, checkCitationSupport, checkAllCitations };
export type { EvidenceItem, ClaimAnchor, CitationCheck, SupportRelation };

// 五档共用同一个报告骨架，每档只放自己那摊字段，章节顺序不能动
export const REPORT_SKELETON_VERSION = '1.2.0';
export const REPORT_SKELETON_SOURCE = 'reports/14-skeleton-fields.json#skeleton';
// 验收分形式、内容、信任三道，判定规则的版本号钉死
export const ADJUDICATION_PROTOCOL_VERSION = 'ADR-0013-C/v1';

export interface SkeletonChapter {
  id: string;
  ordinal: number;
  name: string;
  required_fields: readonly string[];
}

export const REPORT_SKELETON: readonly SkeletonChapter[] = [
  { id: 'C1', ordinal: 1, name: '执行摘要', required_fields: ['report_id', 'schema_version', 'scale', 'subject_ref', 'generated_at', 'correlation_key', 'overall_verdict', 'confidence', 'headline', 'top_findings', 'degraded_mode', 'stale_data_marker', 'staleness_sla_seconds', 'read_model_lag_seconds', 'read_model_version', 'fact_watermark_version'] },
  { id: 'C2', ordinal: 2, name: '四象限与裁决', required_fields: ['quadrants', 'quadrant', 'applicability', 'verdict', 'score', 'confidence', 'dimensions', 'slice_fields', 'verdict_gate.protocol_version', 'verdict_gate.decision', 'verdict_gate.evidence_flag', 'verdict_gate.decided_at', 'verdict_gate.override_reason', 'verdict_gate.audit_ref', 'conflict_markers'] },
  { id: 'C3', ordinal: 3, name: '证据', required_fields: ['evidence_items', 'evidence_id', 'source', 'locator', 'claim', 'grounded', 'collected_at', 'reproduce_cmd', 'reproduce_absent_reason'] },
  { id: 'C4', ordinal: 4, name: '行动建议', required_fields: ['recommendations', 'rec_id', 'priority', 'action', 'rationale', 'expected_impact', 'effort', 'verdict_gate_stamp', 'evidence_refs', 'degraded_note'] }
];

export const CHAPTER_COUNT = REPORT_SKELETON.length;


/**
 * 输出编码（#114）：被审计仓的引文要进 report.md，先做 HTML 实体转义，
 * 免得 Markdown 渲染那一路被不可信输入钻空子，闹出存储型 XSS。
 */
export function escapeMarkdownExcerpt(text: string): string {
  return text
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;');
}

/**
 * 折成一行（#113 返修 / #114 同一面）：转义之后再把换行折成 `⏎`。
 * 不折的话，引文里的 `> ` / `# ` / `|` 落在行首，还能跳出列表和引用块、伪造标题或表格行——
 * HTML 实体只挡标签，挡不住 Markdown 的块级语法。折成一行是这一层唯一说得准的形态。
 */
export function escapeMarkdownExcerptInline(text: string): string {
  return escapeMarkdownExcerpt(text)
    .split(String.fromCharCode(13)).join('')
    .split(String.fromCharCode(10)).join('\u23ce');
}

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

/** #61 r18① 顺手收的一个小工具：anchored_fact_ids 只取头一件（空集就给空数组）——audit 和 demo 六处都这么用 */
export function firstFactIds(list: readonly { fact_id: string }[]): string[] {
  return list.length > 0 ? [list[0].fact_id] : [];
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

// prereg_commit 只认能解析出来的提交哈希，或者带着 sentinel/degraded 前缀的明话，含糊的值一律不要
const PREREG_COMMIT_FORM = /^[0-9a-f]{4,40}$/; // 4 是 git 能吐的最短缩写宽度；为什么不是 7 看 spec §R9-1
const PREREG_NAME_FORM = /^[0-9A-Za-z][0-9A-Za-z._-]*$/;
export type PreregAnchorForm = 'commit' | 'sentinel' | 'degraded' | 'ambiguous';

// 'sentinel'＝这东西打一开始就不是提交哈希（历史记录里的哨兵）；'degraded'＝本该有哈希，可就是拿不到或者拿不准。
export function classifyPreregAnchor(v: string): PreregAnchorForm {
  if (v.indexOf('sentinel:') === 0) { return PREREG_NAME_FORM.test(v.slice(9)) ? 'sentinel' : 'ambiguous'; }
  if (v.indexOf('degraded:') === 0) { return PREREG_NAME_FORM.test(v.slice(9)) ? 'degraded' : 'ambiguous'; }
  return PREREG_COMMIT_FORM.test(v) ? 'commit' : 'ambiguous';
}

function preregMarked(prefix: string, name: string): string {
  if (!PREREG_NAME_FORM.test(name)) { throw new Error('PREREG-ANCHOR-NAME-INVALID: ' + prefix + ' 后的标记名不合形制（须为 [0-9A-Za-z][0-9A-Za-z._-]*）：' + JSON.stringify(name)); }
  return prefix + name;
}
export function preregSentinel(name: string): string { return preregMarked('sentinel:', name); }
export function preregDegraded(reason: string): string { return preregMarked('degraded:', reason); }

// 说不清的锚点在进回执哈希链之前就当场拒掉，免得把错值签成凭证
export function assertDiscriminablePreregAnchor(v: string): void {
  if (classifyPreregAnchor(v) === 'ambiguous') {
    throw new Error('PREREG-ANCHOR-AMBIGUOUS: gate_ref.prereg_commit=' + JSON.stringify(v) + ' 既不是 4–40 位小写十六进制 commit，也不带 sentinel:/degraded: 标记前缀（取值规则见 spec §R9-1）');
  }
}

export interface ContentDigest {
  algo: string;
  value: string;
  canonicalization: string;
}

export const CONTENT_DIGEST_CANONICALIZATION = 'json_utf8_entries_then_citation_checks';

// 为啥拴两道：提交哈希本身可能因为签名变样，目录树哈希才是内容不变的那个主体，所以回执把 commit 和 tree 都拴上。
export interface Receipt {
  receipt_id: string;
  verdict?: { band: string; reason_class: string }; // 判定投影（给回执看）；推出来的东西不算进哈希链
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
  // 先查再算哈希：含糊的锚点一旦进了链，回执哈希就把错值钉死了。
  assertDiscriminablePreregAnchor(args.gate_ref.prereg_commit);
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
  evidence_flag: boolean;
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

// 预览版把能力范围说清楚，还没做的只当规划；可选字段在非预览版写 null，结构照旧。
export interface PreviewDisclosure {
  capability_label: string;
  calibration_scope: string;
  structural_limitations: readonly string[];
  not_in_preview: readonly string[];
}

// ---------- 采数体检：这一节不管有没有毛病，都按同一个样子渲染 ----------
export interface IntakeFieldStatRow { field_name: string; total: number; clean: number; normalized: number; quarantined: number }
export interface IntakeHealthRow { commit_sha: string; field_name: string; reason_code: string; raw_echo: string }
export interface IntakeHealth {
  fields: IntakeFieldStatRow[];
  affected_commits: number; // 去了重之后有几个提交被隔离（只给人看，不参加核对）
  excluded_commits: number; // 日期统计里明确刨掉了几条被隔离的提交
  quarantined_rows: IntakeHealthRow[];
  threshold_ratio: number;
  escalation: 'none' | 'anchor' | 'threshold';
  recorded_at: string | null; // 隔离记录写入时间；NULL 就是时点不可得（那会儿拿不到时间），不是没设置
}

export interface VerdictProjection { band: VerdictBand; reason_class: string }

export interface ReportInput {
  report_id: string;
  schema_version?: string;
  stability?: 'preview' | 'ga'; // 报告稳不稳：照实标预览版还是正式版
  capabilities?: readonly string[]; // 眼下给到哪些能力（预览期只列真做了的）
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
  intake_health?: IntakeHealth; // 没有就给一张同结构的空表
  human?: HumanAdjudication;
  narrative_sections?: readonly NarrativeSection[];
}

export interface Report {
  report_id: string;
  // 报告结构自己带版本号，头部固定写状态和能力字段
  schema_version: string;
  stability: 'preview' | 'ga' | null;
  capabilities: string[];
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
  verdict: VerdictProjection;
  intake_health: IntakeHealth | null;
  preview_disclosure: PreviewDisclosure | null;
  narrative_sections: SealedNarrative[];
}

export function buildReport(input: ReportInput): Report {
  // 叙事怎么出：宿主 agent 写的段落一段段盖章；降级报告没有正式叙事，就拿内核模板补一段兜底
  const narrativeInput = (input.narrative_sections || []).slice();
  if (input.degraded && narrativeInput.length === 0) {
    // 标成降级就直接拿模板叙事补上
    narrativeInput.push(renderTemplateNarrative({ quadrants: input.quadrants.slice(), degraded_reason: input.degraded_reason }));
  }
  const adjudication = adjudicate({
    entries: input.adjudication_entries,
    claims: input.claims,
    evidence: input.evidence,
    decided_at: input.decided_at,
    human: input.human
  });
  // 隔离升级：要紧的字段坏了，或者单个字段的异常率超线，整份报告就升成不支持；原因写进 reason_class 和采数体检那一节。
  const intakeHealth = input.intake_health !== undefined ? input.intake_health : null;
  const escalation = intakeHealth ? intakeEscalation(intakeHealth.fields) : 'none';
  if (escalation !== 'none' && adjudication.overall !== 'unsupported') { adjudication.overall = 'unsupported'; }
  const verdict: VerdictProjection = { band: adjudication.overall, reason_class: deriveReasonClass(adjudication.overall, escalation) };
  const receipt = buildReceipt({
    fact_ids: input.fact_ids,
    adjudication: adjudication,
    issued_at: input.decided_at,
    commit_anchor: input.commit_anchor,
    tree_anchor: input.tree_anchor,
    gate_ref: input.gate_ref,
    degraded: input.degraded
  });
  receipt.verdict = { band: verdict.band, reason_class: verdict.reason_class };
  return {
    report_id: input.report_id,
    schema_version: input.schema_version ? input.schema_version : REPORT_SKELETON_VERSION,
    stability: input.stability !== undefined ? input.stability : null,
    capabilities: input.capabilities ? input.capabilities.slice() : [],
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
    verdict: verdict,
    intake_health: intakeHealth,
    preview_disclosure: input.preview_disclosure ? input.preview_disclosure : null,
    narrative_sections: sealNarrativeSections(narrativeInput, input.evidence, input.decided_at)
  };
}

export function renderMarkdown(r: Report): string {
  const out: string[] = [];
  out.push('# ' + r.report_id + ' — ' + r.scale + ' 首报（' + r.subject_ref + '）');
  out.push('> ' + r.receipt.mark);
  out.push('>');
  out.push('> 报告模板 ' + r.schema_version + '（章节顺序固定）· 裁决规则 ' + r.adjudication.protocol_version + ' · 生成于 ' + r.generated_at);
  if (r.stability !== null || r.capabilities.length > 0) {
    out.push('> - stability: ' + (r.stability !== null ? r.stability : 'unspecified') + (r.capabilities.length > 0 ? ' · capabilities: ' + r.capabilities.join(', ') : ''));
  }
  if (r.degraded_mode) {
    out.push('>');
    out.push('> 降级产出：' + (r.degraded_reason ? r.degraded_reason : '未声明') + ' ' + UNVERIFIED_MARK);
  }
  if (r.preview_disclosure) {
    out.push('>');
    out.push('> 预览说明块（预览期该说的都写明了，机器读的字段见随附的 JSON 里的 preview_disclosure）');
    out.push('> - capability: ' + r.preview_disclosure.capability_label);
    out.push('> - calibration_scope: ' + r.preview_disclosure.calibration_scope);
    out.push('> - structural_limitations: ' + escapeMarkdownExcerptInline(r.preview_disclosure.structural_limitations.join('；')));
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
      out.push('- fact_ids: ' + r.fact_ids.length + ' 条（完整清单在随附的机器读 JSON 里）');
    } else if (ch.id === 'C2') {
      for (const q of r.quadrants) {
        out.push('### ' + q.quadrant + '（applicability=' + q.applicability + '）');
        out.push('- verdict: ' + q.verdict + ' · score: ' + (q.score === null ? 'n/a' : String(q.score)) + ' · confidence: ' + q.confidence);
        out.push('- dimensions: ' + q.dimensions.join(', '));
        out.push('- slice_fields: ' + JSON.stringify(q.slice_fields));
        out.push('- conflict_markers: ' + (q.conflict_markers.length === 0 ? '(none)' : q.conflict_markers.join(', ')));
        out.push('- verdict_gate: ' + q.verdict_gate.protocol_version + ' / ' + q.verdict_gate.decision + ' / evidence_flag=' + q.verdict_gate.evidence_flag + ' / decided_at=' + q.verdict_gate.decided_at + ' / audit_ref=' + q.verdict_gate.audit_ref);
        out.push('');
      }
      out.push('#### 裁决明细（机器能直接读）');
      out.push('- protocol_version: ' + r.adjudication.protocol_version);
      out.push('- overall: ' + r.adjudication.overall + ' · decided_at: ' + r.adjudication.decided_at);
      for (const e of r.adjudication.entries) {
        out.push('- ' + e.criterion_id + ': ' + e.band + ' | basis=' + e.basis_refs.join('+') + ' | facts=' + (e.anchored_fact_ids.length === 0 ? '(none)' : e.anchored_fact_ids.join(',')) + ' | evidence=' + (e.anchored_evidence_ids.length === 0 ? '(none)' : e.anchored_evidence_ids.join(',')) + ' | ' + e.rationale);
      }
      out.push('- human_adjudication: ' + r.adjudication.human.status + '（最后拍板还是人来做，见 B5）');
      if (r.narrative_sections.length > 0) {
        out.push('#### 叙事段（宿主 agent 写、内核盖章，叙事里不许带判定档）');
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
        out.push('### ' + e.evidence_id + ' — ' + escapeMarkdownExcerptInline(e.source) + ' @ ' + e.locator);
        out.push('- claim: ' + escapeMarkdownExcerptInline(e.claim));
        out.push('- grounded: ' + e.grounded + ' · collected_at: ' + e.collected_at);
        out.push('- reproduce_cmd: ' + (e.reproduce_cmd.length > 0 ? e.reproduce_cmd : '(absent: ' + (e.reproduce_absent_reason ? e.reproduce_absent_reason : '未声明') + ')'));
        out.push('- 引文原文: ' + (e.excerpt.length > 0 ? escapeMarkdownExcerptInline(e.excerpt) : '（缺失 —— ' + UNVERIFIED_MARK + '）'));
        out.push('');
      }
      out.push('#### 引文能不能撑住结论（逐条核对）');
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
  // ---------- 采数体检：有毛病没毛病都保持一个结构 ----------
  out.push('## Intake Health');
  out.push('');
  out.push('- 规矩：格式坏到整行都读不出来就当场停；只是某个字段的内容不对，就单独记一笔放一边，审计照跑');
  if (r.intake_health === null) {
    out.push('- 采数体检：没给体检数据的就按「没查出问题」处理（quarantined=0 · normalized=0）；没查出问题不等于没有问题，只是这次没有体检数据');
  } else {
    const ih = r.intake_health;
    for (const f of ih.fields) {
      const eq = f.clean + f.normalized + f.quarantined === f.total ? '三样加起来对得上=PASS' : '三样加起来对不上=MISMATCH';
      out.push('- field ' + f.field_name + ': total=' + f.total + ' clean=' + f.clean + ' normalized=' + f.normalized + ' quarantined=' + f.quarantined + '（' + eq + '）');
    }
    out.push('- affected_commits（按提交去重后的条数）: ' + ih.affected_commits);
    // NULL 是什么意思写明，省得被当成没设置
    out.push('- quarantine_log.recorded_at（什么时候记的）: ' + (ih.recorded_at === null ? 'NULL（字段坏了，那一刻的时间没拿到）' : ih.recorded_at));
    const totalCommits = ih.fields.filter(function (f) { return f.field_name === 'committer_date'; })[0];
    out.push('- 统计时剔掉了哪些：日期统计按 ' + String((totalCommits ? totalCommits.total : 0) - ih.excluded_commits) + ' 次提交算（剔掉了被隔离的 ' + ih.excluded_commits + ' 次提交；这类提交不参与指标计算）');
    out.push('- 什么时候会升级判定：单个字段出问题的比例超过 ' + ih.threshold_ratio + '，整份报告就改成不支持；escalation=' + ih.escalation);
    if (ih.quarantined_rows.length === 0) {
      out.push('- quarantined rows: 无（这次采数没查出问题）');
    } else {
      out.push('- 单列出来的提交表（只列被隔离的：sha | field | reason_code | raw_echo 太长就截断）：');
      out.push('');
      out.push('  | sha | field | reason_code | raw_echo |');
      out.push('  | --- | --- | --- | --- |');
      for (const row of ih.quarantined_rows) {
        out.push('  | ' + row.commit_sha + ' | ' + row.field_name + ' | ' + row.reason_code + ' | ' + row.raw_echo + ' |');
      }
      out.push('');
    }
  }
  out.push('');
  return out.join(String.fromCharCode(10));
}

export interface Sidecar {
  schema_version: string;
  report_id: string;
  verdict: VerdictProjection; // 判定结果的机读块（band 加 reason_class）
  intake_health: IntakeHealth | null;
  stability: 'preview' | 'ga' | null; // 报告稳不稳
  capabilities: string[]; // 上了架的能力清单
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
  machine_contract: { citation_anchor_format: string; verdict_enum: string[]; verdict_reason_class_enum: string[]; human_adjudication_status: string; narrative_seal_protocol: string };
}

export function toSidecar(r: Report): Sidecar {
  return {
    schema_version: r.schema_version,
    report_id: r.report_id,
    verdict: r.verdict,
    intake_health: r.intake_health,
    stability: r.stability,
    capabilities: r.capabilities.slice(),
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
      verdict_reason_class_enum: VERDICT_REASON_CLASSES.slice(),
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
    stability: r.stability,
    capabilities: r.capabilities.slice(),
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
          evidence_flag: false,
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
    verdict: { band: 'insufficient', reason_class: 'evidence_insufficient' },
    intake_health: r.intake_health,
    preview_disclosure: r.preview_disclosure,
    narrative_sections: []
  };
  // 降级兜底：拿内核模板叙事补一段。
  // 已经盖过章的宿主叙事不悄悄扔，按降级后的证据重新盖一遍留痕，模板叙事追加在后头。
  const hostKept: NarrativeSection[] = r.narrative_sections.map(function (s): NarrativeSection {
    return { section_id: s.section_id, author: s.author, model_id: s.model_id, text: s.text, claims: s.claims.slice() };
  });
  out.narrative_sections = sealNarrativeSections(hostKept.concat([renderTemplateNarrative(out)]), out.evidence, out.adjudication.decided_at);
  return out;
}

