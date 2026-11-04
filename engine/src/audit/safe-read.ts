// audit/safe-read.ts — 仓内安全读取单点（#113 / P0 安全审计防符号链接穿透）
// 威胁模型：被审计仓为不可信输入。
// 规则：
//   1. 目标文件必须在 repoRoot 内部（lstat + realpath 判界）；
//   2. 符号链接必须解析为 repoRoot 内部的普通文件（regular file）；
//   3. 拒绝外部路径、悬空符号链接、设备文件以及外部目录 junction；
//   4. 校验与读取必须指向同一 inode：判界后经**同一个文件描述符**读取（fstat 复核 + fd 读），
//      避免「校验这个名字、读那个名字」的 TOCTOU 窗口（CWE-367）；
//   5. 命中跳过时产出结构化拒绝原因，供调用方发射 file_subject_skip 事实并在报告中披露。
//
// 语义与上游 codelore 面既有的 defaultSubjectPathProbe（upstream/codelore.ts）对齐——
// 本模块是「审计对象仓文档读取」的那一份实现，不另造第二套边界规则。

import {
  lstatSync, realpathSync, readFileSync, readdirSync, closeSync, fstatSync, openSync,
  constants as fsConstants
} from 'node:fs';
import { join, relative, resolve, isAbsolute } from 'node:path';
import { createHash } from 'node:crypto';

// O_NOFOLLOW 在 Windows 上不存在——取 0 表示该平台不提供「末段不跟随链接」的打开语义；
// 该平台仍由 realpath 判界＋fstat 复核（同 fd）兜住穿透。
const O_NOFOLLOW = typeof (fsConstants as { O_NOFOLLOW?: number }).O_NOFOLLOW === 'number'
  ? (fsConstants as unknown as { O_NOFOLLOW: number }).O_NOFOLLOW
  : 0;

export interface SafeReadOk {
  ok: true;
  text: string;
  relPath: string;      // 仓根相对规范化路径
  realPath: string;     // 物理真实路径
  isSymlink: boolean;
}

export type SafeReadFailReason =
  | 'missing'            // lstat 失败：路径不存在
  | 'symlink-dangling'   // 符号链接指向不存在的目标
  | 'symlink-outside'    // 符号链接解析后落在 repoRoot 之外
  | 'symlink-non-regular'// 符号链接指向仓内的非普通文件（目录/设备/FIFO 等）
  | 'outside-repo'       // 普通文件的 realpath 落在 repoRoot 之外（父级目录被替换）
  | 'non-regular'        // 目标本身是非普通文件
  | 'read-error';        // 打开/读取失败

export interface SafeReadFail {
  ok: false;
  reason: SafeReadFailReason;
  relPath: string;
  error?: string;
}

export type SafeReadResult = SafeReadOk | SafeReadFail;

export interface SafeDirOk {
  ok: true;
  relPath: string;
  realPath: string;
  isSymlink: boolean;
  entries: string[];
}

export type SafeDirFailReason =
  | 'missing'               // 目录不存在
  | 'dir-junction-outside'  // 目录符号链接/junction 解析后落在 repoRoot 之外
  | 'non-directory'         // 路径存在但不是目录
  | 'read-error';           // 列目录失败

export interface SafeDirFail {
  ok: false;
  reason: SafeDirFailReason;
  relPath: string;
  error?: string;
}

export type SafeDirResult = SafeDirOk | SafeDirFail;

export interface CollectContext {
  runId: string;
  traceId: string;
  repoRef: string;
  scale: string;
  observedAt: string;
}

export interface CollectedFact {
  fact_id: string;
  trace_id: string;
  baggage_id: string;
  scale: string;
  quadrant: string;
  dimension: string | null;
  collector_id: string;
  repo_ref: string;
  subject_ref: string;
  evidence_ref: string;
  metric: string;
  value_json: string;
  observed_at: string;
}

export interface CollectorDescriptor {
  id: string;
  family: string;
  dimension: string | null;
  quadrant: string;
}

export const AUDIT_DESCRIPTOR: CollectorDescriptor = {
  id: 'audit-safe-read',
  family: 'audit',
  dimension: 'S2',
  quadrant: 'strategic'
};

function sha256Hex(s: string): string {
  return createHash('sha256').update(s).digest('hex');
}

function uuidFromHex(h: string): string {
  return [h.slice(0, 8), h.slice(8, 12), h.slice(12, 16), h.slice(16, 20), h.slice(20, 32)].join('-');
}

export function makeFileSubjectSkipFact(
  ctx: CollectContext,
  rawPath: string,
  reason: string,
  descriptor: CollectorDescriptor = AUDIT_DESCRIPTOR
): CollectedFact {
  // Design: file_subject_skip 的 subject 与 fact_id 一律 '/' 分隔（含 Windows join 产物） — ADR-0023
  const subject = slash(rawPath);
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

function slash(p: string): string {
  return p.split(String.fromCharCode(92)).join('/');
}

/** repoRoot 相对形态：是否仍在仓内（'' 与 '.' 视为仓根本身＝在仓内）。 */
function isInsideRoot(relRootToTarget: string): boolean {
  if (relRootToTarget === '' || relRootToTarget === '.') { return true; }
  return relRootToTarget.indexOf('..') !== 0 && !/^[A-Za-z]:/.test(relRootToTarget);
}

/**
 * lstat 错误分类（#113 返修 / PR #127 审查）：只有 ENOENT / ENOTDIR 才等于「不存在」。
 * ELOOP（自环链接）、EACCES、EPERM 等是「探测不了」而不是「没有」——若一律当不存在，
 * 被审计仓只要造一个探测不了的名字，语料就会静默缩水且不留披露事实。
 */
function isAbsentErrno(code: string | undefined): boolean {
  return code === 'ENOENT' || code === 'ENOTDIR';
}

function realRootOf(repoRoot: string): string {
  try {
    return realpathSync(repoRoot);
  } catch {
    return repoRoot;
  }
}

/**
 * 校验指定相对路径或绝对路径是否合法落于 repoRoot 内。
 * 依据 realpath 判界：不存在、悬空链接、仓外目标一律 false。
 */
export function isPathContainedInRepo(repoRoot: string, targetPath: string): boolean {
  try {
    const realRoot = realpathSync(repoRoot);
    const realTarget = realpathSync(targetPath);
    return isInsideRoot(slash(relative(realRoot, realTarget)));
  } catch {
    return false;
  }
}

/**
 * 经单一文件描述符读取：realpath 判界之后，用 fd 打开、fstat 复核普通文件、再经同一 fd 读出。
 * 判界与读取因此绑定在同一 inode 上——期间路径被并发替换也不会把仓外内容读进来（CWE-367）。
 */
function readVerified(realPath: string): { ok: true; text: string } | { ok: false; reason: SafeReadFailReason; error?: string } {
  let fd: number;
  try {
    fd = openSync(realPath, fsConstants.O_RDONLY | O_NOFOLLOW);
  } catch (e: unknown) {
    const code = (e as { code?: string }).code;
    // ELOOP=末段是链接（判界后被替换）；ENOENT=目标消失——都按「不可信输入」拒绝，不重试。
    if (code === 'ELOOP') { return { ok: false, reason: 'symlink-outside', error: String(e) }; }
    return { ok: false, reason: 'read-error', error: String(e) };
  }
  try {
    const st = fstatSync(fd);
    if (!st.isFile()) { return { ok: false, reason: 'non-regular' }; }
    return { ok: true, text: readFileSync(fd, 'utf8') };
  } catch (e: unknown) {
    return { ok: false, reason: 'read-error', error: String(e) };
  } finally {
    try { closeSync(fd); } catch { /* 关描述符失败不掩盖读取结论 */ }
  }
}

/**
 * 安全读取仓内文件内容，拦截逃逸符号链接、悬空链接、目录 junction 及非普通文件。
 */
export function readRepoFileSafe(repoRoot: string, relOrAbsPath: string): SafeReadResult {
  const abs = isAbsolute(relOrAbsPath) ? resolve(relOrAbsPath) : resolve(repoRoot, relOrAbsPath);
  const normRel = slash(relative(repoRoot, abs));
  const realRoot = realRootOf(repoRoot);

  let st;
  try {
    st = lstatSync(abs);
  } catch (e: unknown) {
    const code = (e as { code?: string }).code;
    if (isAbsentErrno(code)) { return { ok: false, reason: 'missing', relPath: normRel }; }
    return { ok: false, reason: 'read-error', relPath: normRel, error: String(e) };
  }

  if (st.isSymbolicLink()) {
    let real: string;
    try {
      real = realpathSync(abs);
    } catch (e: unknown) {
      // ENOENT/ENOTDIR＝悬空链接；其余（ELOOP 自环等）＝解析失败——两者都不放开读取。
      const code = (e as { code?: string }).code;
      return { ok: false, reason: code === 'ENOENT' || code === 'ENOTDIR' ? 'symlink-dangling' : 'symlink-outside', relPath: normRel };
    }
    if (!isInsideRoot(slash(relative(realRoot, real)))) {
      return { ok: false, reason: 'symlink-outside', relPath: normRel };
    }
    let realSt;
    try {
      realSt = lstatSync(real);
    } catch {
      return { ok: false, reason: 'symlink-outside', relPath: normRel };
    }
    if (!realSt.isFile()) {
      return { ok: false, reason: 'symlink-non-regular', relPath: normRel };
    }
    const r = readVerified(real);
    if (!r.ok) { return { ok: false, reason: r.reason, relPath: normRel, error: r.error }; }
    return { ok: true, text: r.text, relPath: normRel, realPath: real, isSymlink: true };
  }

  if (!st.isFile()) {
    return { ok: false, reason: 'non-regular', relPath: normRel };
  }

  let real: string;
  try {
    real = realpathSync(abs);
  } catch {
    return { ok: false, reason: 'outside-repo', relPath: normRel };
  }
  if (!isInsideRoot(slash(relative(realRoot, real)))) {
    return { ok: false, reason: 'outside-repo', relPath: normRel };
  }

  const r = readVerified(real);
  if (!r.ok) { return { ok: false, reason: r.reason, relPath: normRel, error: r.error }; }
  return { ok: true, text: r.text, relPath: normRel, realPath: real, isSymlink: false };
}

/**
 * 安全列目录：目录本身可以是仓内的普通目录或指向仓内目录的符号链接；
 * 指向仓外（或悬空）的目录链接/junction 一律拒绝并给出 dir-junction-outside。
 */
export function readRepoDirSafe(repoRoot: string, relOrAbsPath: string): SafeDirResult {
  const abs = isAbsolute(relOrAbsPath) ? resolve(relOrAbsPath) : resolve(repoRoot, relOrAbsPath);
  const normRel = slash(relative(repoRoot, abs));
  const realRoot = realRootOf(repoRoot);

  let st;
  try {
    st = lstatSync(abs);
  } catch (e: unknown) {
    const code = (e as { code?: string }).code;
    if (isAbsentErrno(code)) { return { ok: false, reason: 'missing', relPath: normRel }; }
    // 探测不了≠不存在：ELOOP/EACCES 一律报拒绝，调用方据此发披露事实（不静默缩水语料）。
    return { ok: false, reason: 'read-error', relPath: normRel, error: String(e) };
  }

  let real: string;
  try {
    real = realpathSync(abs);
  } catch (e: unknown) {
    const code = (e as { code?: string }).code;
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
  } catch {
    return { ok: false, reason: 'dir-junction-outside', relPath: normRel };
  }
  if (!realSt.isDirectory()) {
    return { ok: false, reason: 'non-directory', relPath: normRel };
  }
  try {
    const entries = readdirSync(real).slice().sort();
    return { ok: true, relPath: normRel, realPath: real, isSymlink: st.isSymbolicLink(), entries: entries };
  } catch (e: unknown) {
    return { ok: false, reason: 'read-error', relPath: normRel, error: String(e) };
  }
}

/**
 * 条目存在性探针（不读取内容）：用于把「不存在＝静默跳过」与「存在但被安全读取拒绝＝必须披露」分开。
 * 返回 'absent' | 'link' | 'file' | 'dir' | 'other'。
 */
export function probeRepoEntry(repoRoot: string, relOrAbsPath: string): 'absent' | 'link' | 'file' | 'dir' | 'other' {
  const abs = isAbsolute(relOrAbsPath) ? resolve(relOrAbsPath) : resolve(repoRoot, relOrAbsPath);
  let st;
  try {
    st = lstatSync(abs);
  } catch (e: unknown) {
    const code = (e as { code?: string }).code;
    if (isAbsentErrno(code)) { return 'absent'; }
    // 探测不了就交给安全读取去判定并披露（不可当作「没有」静默跳过）。
    return 'other';
  }
  if (st.isSymbolicLink()) { return 'link'; }
  if (st.isFile()) { return 'file'; }
  if (st.isDirectory()) { return 'dir'; }
  return 'other';
}

/** ADR 语料文件名口径（编号前缀的 .md）；目录安全枚举与文件名过滤同点，供 macro-b/macro-c/39 共用。 */
export function listAdrFilesSafe(repoRoot: string, relDir: string): { ok: true; files: string[] } | { ok: false; reason: SafeDirFailReason; relPath: string } {
  const dir = readRepoDirSafe(repoRoot, relDir);
  if (!dir.ok) { return { ok: false, reason: dir.reason, relPath: dir.relPath }; }
  return { ok: true, files: dir.entries.filter(function (f) { return /^\d{3,}.*\.md$/i.test(f); }).sort() };
}
