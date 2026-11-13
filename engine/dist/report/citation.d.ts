export declare const UNVERIFIED_MARK = "\u26A0 unverified";
export type SupportRelation = 'supports' | 'insufficient';
export declare const PRESENCE_LIMITS: {
    semantics: string;
    output_states: readonly ["supports", "insufficient"];
    fn_disclosure: string;
    adversarial_fp_guard: string;
};
/** 事先定好的窗口（按字符）：从撞上那点往前找否定词，最远找多远。 */
export declare const NEG_WINDOW_PRE = 60;
/** 事先定好的窗口（按字符）：从撞上那点往后找否定词，最远找多远（后置否定一般短，比如「X 不成立」）。 */
export declare const NEG_WINDOW_POST = 40;
/** 归属引导语的遮罩尾长（按字符）：从引导词一直到它那段话结尾（碰到标点或长度先用完的那个）。 */
export declare const ATTRIBUTION_TAIL = 80;
/** 引号前面找说话/归属词的往回看窗口（按字符）。 */
export declare const SPEECH_LOOKBACK = 24;
export interface EvidenceItem {
    evidence_id: string;
    source: string;
    locator: string;
    claim: string;
    grounded: boolean;
    collected_at: string;
    reproduce_cmd: string;
    reproduce_absent_reason: string | null;
    required_tokens: readonly string[];
    excerpt: string;
}
export interface ClaimAnchor {
    claim_id: string;
    evidence_id: string;
    required_tokens: readonly string[];
}
export interface CitationCheck {
    claim_id: string;
    evidence_id: string;
    support: SupportRelation;
    matched_tokens: string[];
    missing_tokens: string[];
    context_flags: string[];
    reason: string;
}
export declare function checkCitationSupport(claim: ClaimAnchor, evidence: EvidenceItem): CitationCheck;
export declare function checkAllCitations(claims: readonly ClaimAnchor[], evidence: readonly EvidenceItem[]): CitationCheck[];
