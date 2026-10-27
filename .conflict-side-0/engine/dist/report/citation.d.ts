export declare const UNVERIFIED_MARK = "\u26A0 unverified";
export type SupportRelation = 'supports' | 'insufficient';
export declare const PRESENCE_LIMITS: {
    semantics: string;
    output_states: readonly ["supports", "insufficient"];
    fn_disclosure: string;
    adversarial_fp_guard: string;
};
/** 预声明窗口（字符）：命中点向前找 pre-negation cue 的最大距离。 */
export declare const NEG_WINDOW_PRE = 60;
/** 预声明窗口（字符）：命中点向后找 post-negation cue 的最大距离（后置否定短，例「X 不成立」）。 */
export declare const NEG_WINDOW_POST = 40;
/** 归属引导语掩蔽尾长（字符）：引导词到其归属段末（句读或长度先到者）。 */
export declare const ATTRIBUTION_TAIL = 80;
/** 引语前置言语/归属 cue 回溯窗（字符）。 */
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
