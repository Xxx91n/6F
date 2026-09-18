import type { PreviewDisclosure } from '../report/generate.js';
import type { FixtureDefinition } from './fixture-generator.js';
export declare const DEMO_SCENARIOS: readonly string[];
export declare function demoDisclosure(): PreviewDisclosure;
export declare function listScenarios(): {
    scenarios: {
        name: string;
        description: string;
        expect: FixtureDefinition['expect'];
    }[];
};
export declare function loadDefinition(scenario: string): FixtureDefinition;
export interface DemoOptions {
    scenario?: string;
    outDir?: string;
    keepTemp?: boolean;
    tempRoot?: string;
}
export interface DemoResult {
    scenario: string;
    synthetic: true;
    verdict: string;
    degraded_mode: boolean;
    degraded_reason: string | null;
    receipt_id: string;
    head_sha: string;
    commit_count: number;
    adr_count: number;
    fact_count: number;
    intake_kind: string;
    temp_dir: string | null;
    temp_discarded: boolean;
    out_dir: string | null;
    artifacts: {
        report_md: string;
        report_json: string;
        measurements: string;
        facts: string;
    } | null;
    report_markdown: string;
    sidecar_json: string;
    measurements: Record<string, unknown>;
}
export declare function runDemo(opts: DemoOptions): DemoResult;
