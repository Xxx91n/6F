export interface DoctorLeg {
    leg: 'duckdb' | 'bindings' | 'git' | 'upstream';
    status: 'ok' | 'degraded' | 'fail';
    detail: string;
}
export interface DoctorReport {
    doctor: string;
    legs: DoctorLeg[];
    overall: 'ok' | 'degraded' | 'fail';
}
export declare function runDoctor(opts?: {
    fix?: boolean;
}): Promise<DoctorReport>;
