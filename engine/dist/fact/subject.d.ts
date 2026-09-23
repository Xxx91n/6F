export interface SubjectNormResult {
    ok: boolean;
    subject: string | null;
    reason: string | null;
    warnings: string[];
}
export declare function normalizeSubjectPath(raw: string): SubjectNormResult;
export declare function detectCaseOnlyConflicts(subjects: readonly string[]): {
    pairs: [string, string][];
};
