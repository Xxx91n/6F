import type { CollectContext, CollectedFact, CollectorDescriptor } from './collectors.js';
export declare const FILE_LINEAGE_ID = "file-lineage@v1";
export declare const FILE_LINEAGE_FAMILY = "file-lineage";
export declare const FILE_LINEAGE_DESCRIPTOR: CollectorDescriptor;
export declare const RENAME_DETECTOR_VERSION = "rename-detector@v1";
export declare const RENAME_DEFAULT_THRESHOLD = "50%";
export interface RenameEdge {
    commit_sha: string;
    similarity: number;
    from: string;
    to: string;
}
export declare function gitRenameLogArgs(threshold: string): string[];
export declare function parseRenameLogZ(raw: string): RenameEdge[];
export interface FileLineageInput {
    edges: readonly RenameEdge[];
    headSha: string;
    threshold: string;
    detectorVersion: string;
    gitVersion: string;
}
export declare function collectFileLineage(input: FileLineageInput, ctx: CollectContext): CollectedFact[];
