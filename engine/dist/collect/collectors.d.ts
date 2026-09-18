export interface CollectContext {
    runId: string;
    traceId: string;
    repoRef: string;
    scale: string;
    observedAt: string;
}
export interface CollectedFact {
    fact_id: string;
    trace_id: string;
    baggage_id: string;
    scale: string;
    quadrant: string;
    dimension: string | null;
    collector_id: string;
    repo_ref: string;
    subject_ref: string;
    evidence_ref: string;
    metric: string;
    value_json: string;
    observed_at: string;
}
export interface CollectorDescriptor {
    id: string;
    family: string;
    dimension: string | null;
    quadrant: string;
}
export declare function sha256Hex(input: string): string;
export declare function uuidFromHex(hex: string): string;
export declare function deriveBaggageId(ctx: CollectContext, dimension: string | null): string;
export declare function deriveFactId(collectorId: string, subjectRef: string, metric: string, valueJson: string, observedAt: string): string;
export declare function toValueJson(value: unknown): string;
export declare function makeFact(ctx: CollectContext, desc: CollectorDescriptor, subjectRef: string, evidenceRef: string, metric: string, value: unknown): CollectedFact;
export declare function daysBetweenUtc(a: string, b: string): number;
export declare const ADR_STRUCTURE_ID = "adr-structure@v1";
export declare const ADR_STRUCTURE_FAMILY = "adr-structure";
export declare const ADR_HEADER_FIELDS: readonly string[];
export declare const ADR_SECTIONS: readonly string[];
export declare const ADR_FIVE_PIECE: readonly string[];
export interface AdrDocument {
    path: string;
    text: string;
}
export interface AdrStructureInput {
    documents: readonly AdrDocument[];
}
export declare const ADR_STRUCTURE_DESCRIPTOR: CollectorDescriptor;
export declare function collectAdrStructure(input: AdrStructureInput, ctx: CollectContext): CollectedFact[];
export declare function adrDates(input: AdrStructureInput): Record<string, string>;
export declare const ADR_STRUCTURE_V2_ID = "adr-structure@v2";
export interface AdrDocumentV2 extends AdrDocument {
    first_commit_date: string | null;
}
export interface AdrStructureV2Input {
    documents: readonly AdrDocumentV2[];
}
export declare const ADR_STRUCTURE_V2_DESCRIPTOR: CollectorDescriptor;
export type AdrLeg = 'dash' | 'inline' | 'inline-iso' | 'git';
export declare function collectAdrStructureV2(input: AdrStructureV2Input, ctx: CollectContext): CollectedFact[];
export declare const POSITIONING_ID = "positioning@v1";
export declare const POSITIONING_FAMILY = "positioning";
export interface TextDoc {
    path: string;
    text: string;
}
export interface PositioningInput {
    intentDocs: readonly TextDoc[];
    deliveryDocs: readonly TextDoc[];
    topN: number;
    stopwords: readonly string[];
}
export declare const POSITIONING_DESCRIPTOR: CollectorDescriptor;
export declare function tokenize(text: string): string[];
export declare function countTokens(tokens: readonly string[]): Record<string, number>;
export declare function extractKeywords(text: string, topN: number, stopwords: readonly string[]): string[];
export declare function collectPositioning(input: PositioningInput, ctx: CollectContext): CollectedFact[];
export declare const GITLOG_ID = "gitlog@v1";
export declare const GITLOG_FAMILY = "gitlog";
export interface CommitRecord {
    sha: string;
    author: string;
    date: string;
    paths: readonly string[];
}
export interface GitlogInput {
    commits: readonly CommitRecord[];
    paths: readonly string[];
    adrDates: Readonly<Record<string, string>>;
}
export declare const GITLOG_DESCRIPTOR: CollectorDescriptor;
export declare function collectGitlog(input: GitlogInput, ctx: CollectContext): CollectedFact[];
export declare const COLLECTOR_DESCRIPTORS: readonly CollectorDescriptor[];
export declare const COLLECTOR_FAMILIES: readonly string[];
export interface DetectorBindingEntry {
    criterion: string;
    type: string;
    families: readonly string[];
    same_family_control: string | null;
    threshold: string | null;
}
export declare const DETECTOR_BINDING: readonly DetectorBindingEntry[];
export declare function bindingByCriterion(criterion: string): DetectorBindingEntry | null;
