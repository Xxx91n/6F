import type { CollectContext, CollectedFact, CollectorDescriptor } from '../collect/collectors.js';
export declare const CODELORE_ADAPTER_ID = "codelore-adapter@v1";
export declare const CODELORE_FAMILY = "upstream-codelore";
export declare const CODELORE_PINNED_VERSION = "0.28.0";
export declare const CODELORE_DESCRIPTOR: CollectorDescriptor;
export interface CodeloreResolution {
    strategy: 'binary-discovery';
    binary: string;
    version: string | null;
    pinned: boolean;
    error: string | null;
}
export declare function resolveCodelore(binary: string): CodeloreResolution;
export interface ExplainDossier {
    sections: Record<string, Record<string, string>>;
}
export declare function parseExplainDossier(text: string): ExplainDossier;
export interface SummaryMetric {
    metric: string;
    value: number;
}
export declare function parseSummaryJson(text: string): SummaryMetric[];
export interface CodeloreProbeInput {
    repoRoot: string;
    explainPaths: readonly string[];
    binary?: string;
}
export declare function collectCodeloreFacts(input: CodeloreProbeInput, ctx: CollectContext): CollectedFact[];
export type CodeloreFacetGroup = 'evolution' | 's3' | 's5' | 'behavior';
export interface CodeloreFacetSpec {
    analysis: string;
    group: CodeloreFacetGroup;
    extraArgs: readonly string[];
}
export declare const CODELORE_BATCH1_FACETS: readonly CodeloreFacetSpec[];
export declare const CODELORE_BEHAVIOR_FACETS: readonly CodeloreFacetSpec[];
export interface CodeloreAnalysisRun {
    ok: boolean;
    status: number | null;
    stdout: string;
    stderrTail: string;
}
export declare function codeloreAnalysisArgs(spec: CodeloreFacetSpec, repoRoot: string): string[];
export declare function runCodeloreAnalysis(binary: string, spec: CodeloreFacetSpec, repoRoot: string): CodeloreAnalysisRun;
export type CodeloreRow = Record<string, unknown>;
export declare function parseJsonRows(text: string): CodeloreRow[];
export declare function facetColumns(rows: readonly CodeloreRow[]): string[];
export type CodeloreAnalysisRunner = (binary: string, spec: CodeloreFacetSpec, repoRoot: string) => CodeloreAnalysisRun;
export type CodeloreResolver = (binary: string) => CodeloreResolution;
export interface CodeloreFacetsInput {
    repoRoot: string;
    facets?: readonly CodeloreFacetSpec[];
    binary?: string;
    runner?: CodeloreAnalysisRunner;
    resolver?: CodeloreResolver;
}
export declare function collectCodeloreFacets(input: CodeloreFacetsInput, ctx: CollectContext): CollectedFact[];
export declare const CODELORE_LLM_ENV_VARS: readonly string[];
export declare const CODELORE_LLM_CALL_CAP_ENV = "MACRO_AUDIT_CODELORE_LLM_MAX_CALLS";
export declare const CODELORE_LLM_DEFAULT_CALL_CAP = 20;
export interface CodeloreLlmGate {
    env_family: string;
    provider: 'anthropic' | 'openai-compat' | null;
    configured: boolean;
    missing_env: string[];
    reason: 'ok' | 'missing-env' | 'unknown-provider';
}
export declare function resolveLlmGate(env: Readonly<Record<string, string | undefined>>): CodeloreLlmGate;
export type CodeloreLlmFace = 'explain-file' | 'diff';
export interface CodeloreLlmFacetSpec {
    face: CodeloreLlmFace;
}
export declare const CODELORE_LLM_FACETS: readonly CodeloreLlmFacetSpec[];
export interface CodeloreLlmInput {
    repoRoot: string;
    explainPaths?: readonly string[];
    diffRange?: string | null;
    llmRefresh?: boolean;
    facets?: readonly CodeloreLlmFacetSpec[];
    binary?: string;
    runner?: CodeloreLlmRunner;
    resolver?: CodeloreResolver;
    env?: Readonly<Record<string, string | undefined>>;
    maxLlmCalls?: number;
}
export declare function codeloreLlmArgs(spec: CodeloreLlmFacetSpec, subject: string, repoRoot: string, llmRefresh: boolean): string[];
export type CodeloreLlmRunner = (binary: string, args: readonly string[], cwd: string) => CodeloreAnalysisRun;
export declare function runCodeloreLlm(binary: string, args: readonly string[], cwd: string): CodeloreAnalysisRun;
export interface CodeloreLlmNarrative {
    base: string;
    narrative: string | null;
    stamp: string | null;
    model: string | null;
    grounded: boolean | null;
    uncited_claims: string[];
}
export declare function parseLlmNarrative(text: string): CodeloreLlmNarrative;
export declare function collectCodeloreLlm(input: CodeloreLlmInput, ctx: CollectContext): CollectedFact[];
