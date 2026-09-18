export interface Check {
    name: string;
    pass: boolean;
    detail: string;
}
export interface SelftestResult {
    ok: boolean;
    checks: Check[];
}
export declare function runSelftest(): SelftestResult;
