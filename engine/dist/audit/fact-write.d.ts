import { appendFact } from '../fact/store.js';
import type { CollectedFact } from '../collect/collectors.js';
import type { FieldEvent, FieldStat } from '../intake/quarantine.js';
export interface RunFactWriteInput {
    ctx: {
        repoRef: string;
        traceId: string;
    };
    commits: readonly {
        sha: string;
    }[];
    commitCount: number;
    fieldEvents: readonly FieldEvent[];
    fieldStats: readonly FieldStat[];
    facts: readonly CollectedFact[];
    headDate: string | null;
    anchorQuarantined: boolean;
    collector: string;
    crashSource: string;
}
export interface RunFactWriteResult {
    factsWritten: number;
    eventsWritten: number;
}
type RunWriter = Parameters<typeof appendFact>[0];
export declare function writeRunFactsAndEvents(writer: RunWriter, input: RunFactWriteInput): Promise<RunFactWriteResult>;
export {};
