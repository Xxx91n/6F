import type { CitationCheck, EvidenceItem } from './citation.js';
import type { Report } from './generate.js';
export declare const NARRATIVE_SEAL_PROTOCOL = "ADR-0013-C/v1+narrative-seal/v1";
export interface NarrativeClaim {
    claim_id: string;
    evidence_id: string;
    required_tokens: readonly string[];
    text: string;
}
export type NarrativeAuthor = 'host-agent' | 'kernel-template';
export interface NarrativeSection {
    section_id: string;
    author: NarrativeAuthor;
    model_id: string | null;
    text: string;
    claims: readonly NarrativeClaim[];
}
export type SealStamp = 'sealed' | 'sealed-with-gaps' | 'rejected';
export interface NarrativeSeal {
    protocol: string;
    sealed_at: string;
    stamp: SealStamp;
    checks: CitationCheck[];
    band_violations: string[];
    model_id_recorded: boolean;
}
export interface SealedNarrative {
    section_id: string;
    author: NarrativeAuthor;
    model_id: string | null;
    text: string;
    claims: NarrativeClaim[];
    seal: NarrativeSeal;
}
export declare function scanBandViolations(text: string): string[];
export declare function sealNarrative(section: NarrativeSection, evidence: readonly EvidenceItem[], sealedAt: string): SealedNarrative;
export declare function sealNarrativeSections(sections: readonly NarrativeSection[], evidence: readonly EvidenceItem[], sealedAt: string): SealedNarrative[];
export declare function renderTemplateNarrative(r: Pick<Report, 'quadrants' | 'degraded_reason'>): NarrativeSection;
