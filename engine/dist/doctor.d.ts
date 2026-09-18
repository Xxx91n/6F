export interface DoctorLeg {
    leg: 'duckdb' | 'git' | 'upstream';
    status: 'ok' | 'degraded' | 'fail';
    detail: string;
}
export interface DoctorReport {
    doctor: string;
    legs: DoctorLeg[];
    overall: 'ok' | 'degraded' | 'fail';
}
export declare function runDoctor(): Promise<DoctorReport>;
