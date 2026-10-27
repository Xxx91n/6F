import { collectGithubPrFacts } from '../upstream/github-rest.js';
import type { CollectContext, CollectedFact } from '../collect/collectors.js';
import type { AuditOptions, AuditResult } from './audit.js';
export declare const MICRO_A_CAPABILITY_LABEL = "capability 3 of 5 \u00B7 preview";
export declare const MICRO_A_REPORT_ID_PREFIX = "MA-48-";
export declare const MICRO_A_SLICE_FIELDS: string[];
export declare const MICRO_A_GOLDEN_PRS: {
    n: number;
    form: string;
}[];
export declare const MICRO_A_GOLDEN_DIFFS: number[];
export interface MicroAPin {
    n: number;
    form: string;
}
export interface MicroAPilot {
    name: string;
    owner: string;
    repo: string;
    pins: readonly MicroAPin[];
}
export declare const MICRO_A_PILOTS: readonly MicroAPilot[];
export declare const MICRO_A_REFUSAL_FACE: {
    name: string;
    owner: string;
    repo: string;
};
export declare const MICRO_A_DRIFT_FACE: {
    name: string;
    owner: string;
    repo: string;
};
export interface MicroAInputError {
    code: 'MICRO-A-INPUT' | 'MICRO-A-SCOPE';
    message: string;
    pilots: readonly string[];
    requested: string;
}
export declare function isMicroAInputError(e: unknown): e is MicroAInputError;
export declare function deterministicRunAt(): string;
export interface MicroAGhTokenProbe {
    (): {
        available: boolean;
        token: string | null;
    };
}
export interface MicroACassetteFetcher {
    (req: {
        url: string;
        method: string;
        accept?: string;
    }): Promise<{
        status: number;
        headers: Record<string, string>;
        body: string;
    }>;
}
export interface MicroAShared {
    env?: Record<string, string>;
    ghTokenProbe?: MicroAGhTokenProbe;
    fetcher?: MicroACassetteFetcher;
}
type GhCollect = Awaited<ReturnType<typeof collectGithubPrFacts>>;
export interface MicroATarget {
    name: string;
    owner: string;
    repo: string;
    root: string | null;
    pins: readonly MicroAPin[];
}
export interface MicroACollect {
    t: MicroATarget;
    ctx: CollectContext;
    res: GhCollect;
    summaries: Record<string, unknown>[];
    mergedCount: number;
    headSha: string | null;
}
export declare function microACollectContext(t: {
    name: string;
    owner: string;
    repo: string;
}, headSha: string | null, runAt: string): CollectContext;
export declare function collectMicroA(t: MicroATarget, shared: MicroAShared, diffsOverride: readonly number[] | undefined, runAt: string): Promise<MicroACollect>;
export interface MicroAGate {
    name: string;
    owner: string;
    repo: string;
    merged_prs: number;
    prs_listed: number;
    eligible: boolean;
    strategy: string;
    degraded: boolean;
    calls: number;
    stopped_reason: string | null;
    facts: CollectedFact[];
    ctx: CollectContext;
    headSha: string | null;
    refusal: boolean;
}
export declare function gateProbeMicroA(g: {
    name: string;
    owner: string;
    repo: string;
    root?: string | null;
    refusal?: boolean;
}, shared: MicroAShared, runAt: string): Promise<MicroAGate>;
export interface MicroADiffArtifact {
    ok: boolean;
    channel: string;
    bytes: number;
    stats: {
        files_changed: number | null;
        additions: number | null;
        deletions: number | null;
    };
    error: string | null;
}
export declare function fetchDiffArtifactMicroA(t: MicroATarget, n: number, baseSha: string, headSha: string, shared: MicroAShared, outDir: string | null, outName: string): Promise<MicroADiffArtifact>;
export declare function classifyForm(v: Record<string, unknown>): string;
export declare function skeletonIntersectionReport(sidecar: Record<string, unknown>, mdText: string): {
    ok: boolean;
    missing: string[];
};
export interface MicroAPrRunOpts {
    golden: boolean;
    outDir: string | null;
    measName: string;
    factsName: string;
}
export interface MicroAPrResult {
    pr: number;
    form_expected: string;
    form_actual: string;
    form_match: boolean;
    merged: boolean;
    overall: string;
    receipt: string;
    diff_channel: string | null;
    artifact: MicroADiffArtifact;
    skeleton: {
        ok: boolean;
        missing: string[];
    };
    outputs: {
        md: string;
        sidecar: string;
        diff: string | null;
    };
    fact_ids: string[];
}
export declare function buildPrReportMicroA(t: MicroATarget, pin: MicroAPin, collected: MicroACollect, gate: {
    merged_prs: number;
    eligible: boolean;
}, shared: MicroAShared, opts: MicroAPrRunOpts): Promise<MicroAPrResult>;
export interface MicroARefusalOpts {
    golden: boolean;
    outDir: string | null;
    measName: string;
}
export interface MicroARefusalResult {
    refusal_for: string;
    overall: string;
    receipt: string;
    outputs: {
        md: string;
        sidecar: string;
    };
}
export declare function buildRefusalReportMicroA(g: {
    name: string;
    owner: string;
    repo: string;
    headSha: string | null;
    root: string | null;
    facts: CollectedFact[];
    ctx: CollectContext;
}, shared: MicroAShared, opts: MicroARefusalOpts): Promise<MicroARefusalResult>;
export declare function runMicroAAudit(opts: AuditOptions): Promise<AuditResult>;
export {};
