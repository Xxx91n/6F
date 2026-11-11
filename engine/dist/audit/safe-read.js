// audit/safe-read.ts —— 在仓库里读文件的唯一一道门（防符号链接把路径偷到仓外）
// 规矩五条：
// 1. 文件必须真的在仓根里头（lstat 和 realpath 两道都要过）
// 2. 符号链接得解析成仓里的普通文件
// 3. 仓外路径、悬空链接、设备文件、指到仓外的目录链接，一律拒
// 4. 检查和读取得落在同一个文件句柄上，免得中间被人把路径换掉
// 5. 按规矩跳过时把原因说清楚，调用方记成跳过事实，报告里也照实写
//
// 全仓只认这一套规矩：这是审计对象仓里读文件的唯一实现，不另搞第二套。
import { lstatSync, realpathSync, readFileSync, readdirSync, closeSync, fstatSync, openSync, constants as fsConstants } from 'node:fs';
import { relative, resolve, isAbsolute } from 'node:path';
import { createHash } from 'node:crypto';
// Windows 上压根没有 O_NOFOLLOW，先设成 0；那边靠 realpath 加同一句柄的 fstat 复核挡越界。
const O_NOFOLLOW = typeof fsConstants.O_NOFOLLOW === 'number'
    ? fsConstants.O_NOFOLLOW
    : 0;
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
/**
 * 记一条安全读取的拒绝，写成 codelore.file_subject_skip 事实。
 * @param ctx 采集上下文
 * @param rawPath 调用方给的相对路径
 * @param reason 为什么拒
 * @param descriptor 采集器的描述
 */
export function makeFileSubjectSkipFact(ctx, rawPath, reason, descriptor = AUDIT_DESCRIPTOR) {
    // 路径一律用 '/' 分隔：Windows 的反斜杠转成正斜杠，POSIX 上原样不动。
    const subject = process.platform === 'win32' ? slash(rawPath) : rawPath;
    const value = {
        analysis: 'safe-read',
        group: 'security',
        raw_path: subject,
        reason: reason
    };
    const valueJson = JSON.stringify(value);
    const metric = 'codelore.file_subject_skip';
    const factId = uuidFromHex(sha256Hex([descriptor.id, subject, metric, valueJson, ctx.observedAt].join('|')));
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
        subject_ref: subject,
        evidence_ref: 'safe-read-probe',
        metric: metric,
        value_json: valueJson,
        observed_at: ctx.observedAt
    };
}
function slash(p) {
    return p.split(String.fromCharCode(92)).join('/');
}
/** 相对路径是不是真落在仓里（空字符串或 . 指仓根本身，也算在仓里）。 */
function isInsideRoot(relRootToTarget) {
    if (relRootToTarget === '' || relRootToTarget === '.') {
        return true;
    }
    return relRootToTarget.indexOf('..') !== 0 && !/^[A-Za-z]:/.test(relRootToTarget);
}
/**
 * 分清「文件不存在」和「够不着」：只有 ENOENT 或 ENOTDIR 才算不存在。
 * 权限不够、链接绕圈这些算「查不清」，得照实报警或记下来，不能当文件不存在跳过去。
 */
function isAbsentErrno(code) {
    return code === 'ENOENT' || code === 'ENOTDIR';
}
function realRootOf(repoRoot) {
    try {
        return realpathSync(repoRoot);
    }
    catch {
        return repoRoot;
    }
}
/**
 * 看目标路径在不在仓里。
 * 按实际物理路径判：不存在、悬空链接、落在仓外，一律返回 false。
 */
export function isPathContainedInRepo(repoRoot, targetPath) {
    try {
        const realRoot = realpathSync(repoRoot);
        const realTarget = realpathSync(targetPath);
        return isInsideRoot(slash(relative(realRoot, realTarget)));
    }
    catch {
        return false;
    }
}
/**
 * 校验加读取：realpath 先确认在仓里，再用同一个文件描述符打开、复核是普通文件，然后读出来，
 * 免得校验和读取中间被人把路径换掉。
 */
function readVerified(realPath) {
    let fd;
    try {
        fd = openSync(realPath, fsConstants.O_RDONLY | O_NOFOLLOW);
    }
    catch (e) {
        const code = e.code;
        // 碰到符号链接或者文件突然没了，直接当不可信输入拒掉
        if (code === 'ELOOP') {
            return { ok: false, reason: 'symlink-outside', error: String(e) };
        }
        return { ok: false, reason: 'read-error', error: String(e) };
    }
    try {
        const st = fstatSync(fd);
        if (!st.isFile()) {
            return { ok: false, reason: 'non-regular' };
        }
        return { ok: true, text: readFileSync(fd, 'utf8') };
    }
    catch (e) {
        return { ok: false, reason: 'read-error', error: String(e) };
    }
    finally {
        try {
            closeSync(fd);
        }
        catch { /* 关闭文件描述符失败不覆盖主要结论 */ }
    }
}
/**
 * 在仓里安全地读文件：逃逸的符号链接、悬空链接、指到外面的目录链接、非普通文件，全拦下。
 */
export function readRepoFileSafe(repoRoot, relOrAbsPath) {
    const abs = isAbsolute(relOrAbsPath) ? resolve(relOrAbsPath) : resolve(repoRoot, relOrAbsPath);
    const normRel = slash(relative(repoRoot, abs));
    const realRoot = realRootOf(repoRoot);
    let st;
    try {
        st = lstatSync(abs);
    }
    catch (e) {
        const code = e.code;
        if (isAbsentErrno(code)) {
            return { ok: false, reason: 'missing', relPath: normRel };
        }
        return { ok: false, reason: 'read-error', relPath: normRel, error: String(e) };
    }
    if (st.isSymbolicLink()) {
        let real;
        try {
            real = realpathSync(abs);
        }
        catch (e) {
            // 文件不在、链接绕圈这类情况，一律按拒处理
            const code = e.code;
            return { ok: false, reason: code === 'ENOENT' || code === 'ENOTDIR' ? 'symlink-dangling' : 'symlink-outside', relPath: normRel };
        }
        if (!isInsideRoot(slash(relative(realRoot, real)))) {
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
        const r = readVerified(real);
        if (!r.ok) {
            return { ok: false, reason: r.reason, relPath: normRel, error: r.error };
        }
        return { ok: true, text: r.text, relPath: normRel, realPath: real, isSymlink: true };
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
    if (!isInsideRoot(slash(relative(realRoot, real)))) {
        return { ok: false, reason: 'outside-repo', relPath: normRel };
    }
    const r = readVerified(real);
    if (!r.ok) {
        return { ok: false, reason: r.reason, relPath: normRel, error: r.error };
    }
    return { ok: true, text: r.text, relPath: normRel, realPath: real, isSymlink: false };
}
/**
 * 安全地列目录：目标可以是仓里的普通目录，也可以是指向仓里目录的符号链接；
 * 指到仓外或悬空的就拒，返回 dir-junction-outside。
 */
export function readRepoDirSafe(repoRoot, relOrAbsPath) {
    const abs = isAbsolute(relOrAbsPath) ? resolve(relOrAbsPath) : resolve(repoRoot, relOrAbsPath);
    const normRel = slash(relative(repoRoot, abs));
    const realRoot = realRootOf(repoRoot);
    let st;
    try {
        st = lstatSync(abs);
    }
    catch (e) {
        const code = e.code;
        if (isAbsentErrno(code)) {
            return { ok: false, reason: 'missing', relPath: normRel };
        }
        // 查不清就直接报错拒掉，让调用方记事实，不许悄悄跳过
        return { ok: false, reason: 'read-error', relPath: normRel, error: String(e) };
    }
    let real;
    try {
        real = realpathSync(abs);
    }
    catch (e) {
        const code = e.code;
        if (st.isSymbolicLink()) {
            return { ok: false, reason: 'dir-junction-outside', relPath: normRel, error: String(e) };
        }
        return { ok: false, reason: code === 'ENOENT' ? 'missing' : 'read-error', relPath: normRel, error: String(e) };
    }
    if (!isInsideRoot(slash(relative(realRoot, real)))) {
        return { ok: false, reason: 'dir-junction-outside', relPath: normRel };
    }
    let realSt;
    try {
        realSt = lstatSync(real);
    }
    catch {
        return { ok: false, reason: 'dir-junction-outside', relPath: normRel };
    }
    if (!realSt.isDirectory()) {
        return { ok: false, reason: 'non-directory', relPath: normRel };
    }
    try {
        const entries = readdirSync(real).slice().sort();
        return { ok: true, relPath: normRel, realPath: real, isSymlink: st.isSymbolicLink(), entries: entries };
    }
    catch (e) {
        return { ok: false, reason: 'read-error', relPath: normRel, error: String(e) };
    }
}
/**
 * 只看文件或目录在不在（不读内容），用来分清「压根没有」和「有，但被安全规则拦了」。
 * 返回 'absent' | 'link' | 'file' | 'dir' | 'other'。
 */
export function probeRepoEntry(repoRoot, relOrAbsPath) {
    const abs = isAbsolute(relOrAbsPath) ? resolve(relOrAbsPath) : resolve(repoRoot, relOrAbsPath);
    let st;
    try {
        st = lstatSync(abs);
    }
    catch (e) {
        const code = e.code;
        if (isAbsentErrno(code)) {
            return 'absent';
        }
        // 探测失败就交给安全读取去判并照实披露，不能悄悄当成没有
        return 'other';
    }
    if (st.isSymbolicLink()) {
        return 'link';
    }
    if (st.isFile()) {
        return 'file';
    }
    if (st.isDirectory()) {
        return 'dir';
    }
    return 'other';
}
/** 安全地列 ADR 目录里的文件（只认数字开头、.md 结尾的）。 */
export function listAdrFilesSafe(repoRoot, relDir) {
    const dir = readRepoDirSafe(repoRoot, relDir);
    if (!dir.ok) {
        return { ok: false, reason: dir.reason, relPath: dir.relPath };
    }
    return { ok: true, files: dir.entries.filter(function (f) { return /^\d{3,}.*\.md$/i.test(f); }).sort() };
}
