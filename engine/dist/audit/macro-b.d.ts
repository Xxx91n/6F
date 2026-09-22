import type { CollectContext, CollectedFact } from '../collect/collectors.js';
import type { FieldStatus, FieldEvent, FieldStat } from '../intake/quarantine.js';
export declare const TC1_LAG_DAYS = 90;
export declare const TC1_RATIO_RED = 0.2;
export declare const TC1_MIN_N = 5;
export declare const TC2_MEAN_RED = 0.6;
export declare const TC2_FIELD_MISSING_RED = 0.5;
export declare const TC3_RED = 0.5;
export declare const TC3_GREEN = 0.7;
export declare const TC3_TOPN = 20;
export declare const MACRO_B_STOPWORDS: readonly string[];
export declare const GOLDEN_ADR: string;
export declare const POS_DECL = "macro audit positioning convergence determinism traceability provenance fact table skeleton slice quadrant scale verdict gate receipt citation anchor";
export interface ParsedCommit {
    sha: string;
    author: string;
    date: string | null;
    paths: string[];
}
export interface MacroBProbes {
    headSha: string;
    headDate: string | null;
    headRaw: string;
    headStatus: FieldStatus;
    treeSha: string;
    commitCount: number;
    commits: ParsedCommit[];
    subjects: string[];
    fieldEvents: FieldEvent[];
    fieldStats: FieldStat[];
}
export declare function probeMacroBRepo(repoRoot: string, headSha: string): MacroBProbes;
export interface MacroBCollectSpec {
    intentCandidates: readonly string[];
    nc1Candidates: readonly string[];
    stopwords: readonly string[];
    topN: number;
    codelore: 'off' | 'auto';
    fixtureTag: string;
    pc2Sha: string;
}
export interface MacroBCollect {
    adrFiles: string[];
    intentDocs: {
        path: string;
        text: string;
    }[];
    nc1Path: string;
    adrFacts: CollectedFact[];
    gitFacts: CollectedFact[];
    posFacts: CollectedFact[];
    codeloreFacts: CollectedFact[];
    realFacts: CollectedFact[];
    pc1: {
        pass: boolean;
    };
    pc2: {
        pass: boolean;
        delta_days: number | null;
    };
    nc1: {
        path: string;
        fact_count: number;
        five_piece_present: number;
        supersede_present: boolean | null;
        pass: boolean;
    };
    pc1AdrFacts: CollectedFact[];
    pc1PosFacts: CollectedFact[];
    pc2Lag: CollectedFact[];
    nc1Facts: CollectedFact[];
    codeloreResolution: {
        version: string | null;
        pinned: boolean;
        error: string | null;
    } | null;
}
export declare function collectMacroB(repoRoot: string, spec: MacroBCollectSpec, ctx: CollectContext, probes: MacroBProbes): MacroBCollect;
export interface Tc1Result {
    judgeable_n: number;
    backfill_n: number;
    ratio: number;
    verdict: 'INCONCLUSIVE' | 'RED' | 'NOT_RED';
}
export interface Tc2Result {
    total: number;
    mean_ratio: number;
    missing_counts: Record<string, number>;
    missing_ratio: Record<string, number>;
    cond_a: boolean;
    cond_b: boolean;
    verdict: 'RED' | 'NOT_RED';
}
export interface Tc3Source {
    subject: string;
    value: {
        ratio: number;
        hit: number;
        keywords: number;
    };
    fact_id: string;
}
export interface Tc3Result {
    per_source: Tc3Source[];
    lowest_path: string | null;
    lowest_ratio: number;
    verdict: 'INCONCLUSIVE' | 'RED' | 'AMBER' | 'GREEN';
}
export interface MacroBEval {
    tc1: Tc1Result;
    tc2: Tc2Result;
    tc3: Tc3Result;
    covFacts: Tc3Source[];
    lagFactIds: string[];
    fiveFactIds: string[];
}
export declare function evaluateMacroB(collect: MacroBCollect): MacroBEval;
export declare function tcBand(v: string): 'supported' | 'unsupported' | 'insufficient';
export declare function macroBContext(runIdLabel: string, ctxLabel: string, headSha: string, headDate: string | null, headRaw?: string): CollectContext;
