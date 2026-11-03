// audit/safe-read.ts — 仓内安全读取单点（#113 / P0 安全审计防符号链接穿透）
// 威胁模型：被审计仓为不可信输入。
// 规则：
//   1. 目标文件必须在 repoRoot 内部（lstat + realpath 判界）；
//   2. 符号链接必须解析为 repoRoot 内部的普通文件（regular file）；
//   3. 拒绝外部路径、悬空符号链接、设备文件以及外部目录 junction；
//   4. 命中跳过时产出结构化拒绝原因，供调用方发射 file_subject_skip 事实并在报告中披露。
import { lstatSync, realpathSync, readFileSync } from 'node:fs';
import { relative, resolve, isAbsolute } from 'node:path';
import { createHash } from 'node:crypto';
export const AUDIT_DESCRIPTOR = {
    id: 'audit-safe-read',
    family: 'audit',
    dimension: 'S2',
    quadrant: 'strategic'
};
function sha256Hex(s) {
    return createHash('sha256').update(s).digest('hex');
}
function uuidFromHex(h) {
    return [h.slice(0, 8), h.slice(8, 12), h.slice(12, 16), h.slice(16, 20), h.slice(20, 32)].join('-');
}
export function makeFileSubjectSkipFact(ctx, rawPath, reason, descriptor = AUDIT_DESCRIPTOR) {
    const value = {
        analysis: 'safe-read',
        group: 'security',
        raw_path: rawPath,
        reason: reason
    };
    const valueJson = JSON.stringify(value);
    const metric = 'codelore.file_subject_skip';
    const factId = uuidFromHex(sha256Hex([descriptor.id, rawPath, metric, valueJson, ctx.observedAt].join('|')));
    const baggageParts = [ctx.repoRef, ctx.scale, 'strategic', descriptor.dimension === null ? 'na' : descriptor.dimension, ctx.runId];
    const baggageId = sha256Hex(baggageParts.join('|')).slice(0, 32);
    return {
        fact_id: factId,
        trace_id: ctx.traceId,
        baggage_id: baggageId,
        scale: ctx.scale,
        quadrant: descriptor.quadrant,
        dimension: descriptor.dimension,
        collector_id: descriptor.id,
        repo_ref: ctx.repoRef,
        subject_ref: rawPath,
        evidence_ref: 'safe-read-probe',
        metric: metric,
        value_json: valueJson,
        observed_at: ctx.observedAt
    };
}
/**
 * 校验指定相对路径或绝对路径是否合法落于 repoRoot 内
 */
export function isPathContainedInRepo(repoRoot, targetPath) {
    try {
        const realRoot = realpathSync(repoRoot);
        const realTarget = realpathSync(targetPath);
        const rel = relative(realRoot, realTarget).split(String.fromCharCode(92)).join('/');
        if (rel === '' || (rel.indexOf('..') !== 0 && !/^[A-Za-z]:/.test(rel))) {
            return true;
        }
        return false;
    }
    catch {
        return false;
    }
}
/**
 * 安全读取仓内文件内容，拦截逃逸符号链接及非普通文件
 */
export function readRepoFileSafe(repoRoot, relOrAbsPath) {
    const abs = isAbsolute(relOrAbsPath) ? resolve(relOrAbsPath) : resolve(repoRoot, relOrAbsPath);
    const normRel = relative(repoRoot, abs).split(String.fromCharCode(92)).join('/');
    let st;
    try {
        st = lstatSync(abs);
    }
    catch {
        return { ok: false, reason: 'missing', relPath: normRel };
    }
    let realRoot;
    try {
        realRoot = realpathSync(repoRoot);
    }
    catch {
        realRoot = repoRoot;
    }
    if (st.isSymbolicLink()) {
        let real;
        try {
            real = realpathSync(abs);
        }
        catch {
            return { ok: false, reason: 'symlink-outside', relPath: normRel };
        }
        const rel = relative(realRoot, real).split(String.fromCharCode(92)).join('/');
        if (rel.indexOf('..') === 0 || rel.length === 0 || /^[A-Za-z]:/.test(rel)) {
            return { ok: false, reason: 'symlink-outside', relPath: normRel };
        }
        let realSt;
        try {
            realSt = lstatSync(real);
        }
        catch {
            return { ok: false, reason: 'symlink-outside', relPath: normRel };
        }
        if (!realSt.isFile()) {
            return { ok: false, reason: 'symlink-non-regular', relPath: normRel };
        }
        try {
            const text = readFileSync(real, 'utf8');
            return { ok: true, text: text, relPath: normRel, realPath: real, isSymlink: true };
        }
        catch (e) {
            return { ok: false, reason: 'read-error', relPath: normRel, error: String(e) };
        }
    }
    if (!st.isFile()) {
        return { ok: false, reason: 'non-regular', relPath: normRel };
    }
    let real;
    try {
        real = realpathSync(abs);
    }
    catch {
        return { ok: false, reason: 'outside-repo', relPath: normRel };
    }
    const rel = relative(realRoot, real).split(String.fromCharCode(92)).join('/');
    if (rel.indexOf('..') === 0 || rel.length === 0 || /^[A-Za-z]:/.test(rel)) {
        return { ok: false, reason: 'outside-repo', relPath: normRel };
    }
    try {
        const text = readFileSync(abs, 'utf8');
        return { ok: true, text: text, relPath: normRel, realPath: real, isSymlink: false };
    }
    catch (e) {
        return { ok: false, reason: 'read-error', relPath: normRel, error: String(e) };
    }
}
