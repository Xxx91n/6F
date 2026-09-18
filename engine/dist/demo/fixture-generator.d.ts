export declare const FIXTURE_GENERATOR_VERSION = "1.0.0";
export declare const FIXTURE_GENERATOR_ID: string;
export declare const FIXTURE_AUTHOR_NAME = "Fixture Bot";
export declare const FIXTURE_AUTHOR_EMAIL = "fixture@macro-audit.invalid";
export interface FixtureFile {
    path: string;
    content: string;
}
export interface FixtureStepCommit {
    type: 'commit';
    branch?: string;
    date: string;
    message: string;
    files: readonly FixtureFile[];
}
export interface FixtureStepBranch {
    type: 'branch';
    name: string;
    from?: string;
}
export interface FixtureStepMerge {
    type: 'merge';
    branch: string;
    into: string;
    date: string;
    message: string;
}
export interface FixtureStepTag {
    type: 'tag';
    name: string;
    at?: string;
}
export type FixtureStep = FixtureStepCommit | FixtureStepBranch | FixtureStepMerge | FixtureStepTag;
export interface FixtureDefinition {
    scenario: string;
    kind: 'fixture-definition';
    schema_version: string;
    synthetic: true;
    description: string;
    generator: string;
    repo: {
        name: string;
        default_branch: string;
        steps: readonly FixtureStep[];
    };
    failure: null | {
        trigger: string;
        reason: string;
    };
    expect: {
        overall_verdict: string;
        degraded_mode: boolean;
        degraded_reason_marker?: string;
    };
}
export interface GeneratedRepo {
    dir: string;
    name: string;
    head_sha: string;
    tree_sha: string;
    commit_count: number;
    branches: string[];
    tags: string[];
    merge_commits: number;
}
export declare function generateFixtureRepo(def: FixtureDefinition, targetDir: string): GeneratedRepo;
