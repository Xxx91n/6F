import type { NarrativeSection, SealedNarrative } from './narrative.js';
import { UNVERIFIED_MARK, checkCitationSupport, checkAllCitations } from './citation.js';
import type { EvidenceItem, ClaimAnchor, CitationCheck, SupportRelation } from './citation.js';
export { UNVERIFIED_MARK, checkCitationSupport, checkAllCitations };
export type { EvidenceItem, ClaimAnchor, CitationCheck, SupportRelation };
export declare const REPORT_SKELETON_VERSION = "1.2.0";
export declare const REPORT_SKELETON_SOURCE = "reports/14-skeleton-fields.json#skeleton";
export declare const ADJUDICATION_PROTOCOL_VERSION = "ADR-0013-C/v1";
export interface SkeletonChapter {
    id: string;
    ordinal: number;
    name: string;
    required_fields: readonly string[];
}
export declare const REPORT_SKELETON: readonly SkeletonChapter[];
export declare const CHAPTER_COUNT: number;
export declare function chapterHeading(ch: SkeletonChapter): string;
export declare function skeletonOf(markdown: string): string[];
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
export declare function deriveOverallBand(entries: readonly AdjudicationEntry[]): VerdictBand;
export declare function adjudicate(args: {
    entries: readonly AdjudicationEntry[];
    claims: readonly ClaimAnchor[];
    evidence: readonly EvidenceItem[];
    decided_at: string;
    human?: HumanAdjudication;
}): AdjudicationBlock;
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
export declare const CONTENT_DIGEST_CANONICALIZATION = "json_utf8_entries_then_citation_checks";
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
export declare function buildReceipt(args: {
    fact_ids: readonly string[];
    adjudication: AdjudicationBlock;
    issued_at: string;
    commit_anchor: string;
    tree_anchor: string;
    gate_ref: GateRef;
    degraded: boolean;
}): Receipt;
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
export interface PreviewDisclosure {
    capability_label: string;
    calibration_scope: string;
    structural_limitations: readonly string[];
    not_in_preview: readonly string[];
}
export interface ReportInput {
    report_id: string;
    schema_version?: string;
    stability?: 'preview' | 'ga';
    capabilities?: readonly string[];
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
    stability: 'preview' | 'ga' | null;
    capabilities: string[];
    scale: string;
    subject_ref: string;
    generated_at: string;
    correlation_key: {
        trace_id: string;
        baggage_id: string;
    };
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
export declare function buildReport(input: ReportInput): Report;
export declare function renderMarkdown(r: Report): string;
export interface Sidecar {
    schema_version: string;
    report_id: string;
    stability: 'preview' | 'ga' | null;
    capabilities: string[];
    scale: string;
    subject_ref: string;
    generated_at: string;
    correlation_key: {
        trace_id: string;
        baggage_id: string;
    };
    receipt: Receipt;
    overall_verdict: VerdictBand;
    confidence: number;
    degraded_mode: boolean;
    degraded_reason: string | null;
    stale: ReportStale;
    skeleton: {
        id: string;
        ordinal: number;
        name: string;
        required_fields: readonly string[];
    }[];
    fact_ids: string[];
    adjudication: AdjudicationBlock;
    citation_checks: CitationCheck[];
    evidence: EvidenceItem[];
    quadrants: QuadrantEntry[];
    recommendations: Recommendation[];
    preview_disclosure: PreviewDisclosure | null;
    narrative_sections: SealedNarrative[];
    machine_contract: {
        citation_anchor_format: string;
        verdict_enum: string[];
        human_adjudication_status: string;
        narrative_seal_protocol: string;
    };
}
export declare function toSidecar(r: Report): Sidecar;
export declare function renderSidecar(r: Report): string;
export declare function degradeReport(r: Report, reason: string): Report;
