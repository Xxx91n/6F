import type { MacroBProbes } from './macro-b.js';
import type { AuditOptions, AuditResult } from './audit.js';
import type { CollectContext, CollectedFact } from '../collect/collectors.js';
export declare const MACRO_C_LAG_MIN_N = 30;
export declare const MACRO_C_CAPABILITY_LABEL = "capability 2 of 5 \u00B7 preview";
export declare const MACRO_C_REPORT_ID_PREFIX = "MA-AUDIT-";
export declare const MACRO_C_NC_CANDIDATES: readonly string[];
export declare const MACRO_C_LLM_EXPLAIN_CANDIDATES: readonly string[];
export declare const MACRO_C_SUPERSEDE_KINDS: readonly string[];
export interface SupersedeEdge {
    from: string;
    to: string;
    kind: string;
    evidence: string;
    resolved: boolean | null;
    back_reference: boolean | null;
}
export interface SupersedeAdr {
    file: string;
    num: string;
    whole_to: string | null;
    inline: {
        line: number;
        to: string;
        negated: boolean;
    }[];
    amends: {
        line: number;
        to: string;
    }[];
    refs: {
        line: number;
        to: string;
    }[];
    defers: {
        line: number;
        to: string;
    }[];
    mentions: string[];
}
export declare function scanSupersedeAdrs(adrDocs: readonly {
    path: string;
    text: string;
}[]): SupersedeAdr[];
export declare function buildSupersedeChain(adrs: readonly SupersedeAdr[], deferRegistryPresent: boolean): Record<string, unknown>;
export interface MacroCCollectSpec {
    ncCandidates?: readonly string[];
    llmExplainCandidates?: readonly string[];
    llmDiffRange?: string;
}
export interface MacroCCollect {
    adrDocs: {
        path: string;
        text: string;
        first_commit_date: string | null;
    }[];
    adrFacts: CollectedFact[];
    gitFacts: CollectedFact[];
    codeloreFacts: CollectedFact[];
    llmFacts: CollectedFact[];
    llmGate: {
        configured: boolean;
        reason: string;
        [k: string]: unknown;
    };
    chain: Record<string, unknown>;
    chainFact: CollectedFact;
    realFacts: CollectedFact[];
    dedupDropped: number;
    codeloreResolution: {
        version: string | null;
        pinned: boolean;
        error: string | null;
    } | null;
}
export declare function collectMacroC(repoRoot: string, probes: MacroBProbes, ctx: CollectContext, spec?: MacroCCollectSpec): MacroCCollect;
export interface MacroCEval {
    pcMc1: boolean;
    pcMc2: boolean;
    tcMc1: boolean;
    tcMc2: boolean;
    tcMc3: boolean;
    ncMc1: boolean;
    facetRowsFacts: CollectedFact[];
    facetErrFacts: CollectedFact[];
    lagFacts: CollectedFact[];
    dateFacts: CollectedFact[];
    legDist: Record<string, number>;
    llmGatedCount: number;
    llmNarrativeCount: number;
    nc1Path: string | null;
}
export declare function evaluateMacroC(col: MacroCCollect, repoRoot: string, ctx: CollectContext, ncCandidates?: readonly string[]): MacroCEval;
export declare function runMacroCAudit(opts: AuditOptions): Promise<AuditResult>;
