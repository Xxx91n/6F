// audit/safe-read.ts — 仓库内安全读取文件单点入口（防止符号链接逃逸到仓库外部）
// 规则：
//   1. 目标文件必须在仓库根目录内部（使用 lstat 和 realpath 进行双重检查）；
//   2. 符号链接必须解析为仓库内部的普通文件；
//   3. 拒绝外部路径、悬空符号链接、设备文件以及外部目录软链接；
//   4. 检查与读取必须指向同一个文件句柄（同一文件描述符），防止检查与读取之间路径被篡改；
//   5. 命中跳过规则时输出明确原因，供调用方记录跳过事实并在报告中如实说明。
//
// 保持统一规则：作为审计目标仓库文档的安全读取实现，不另行设置第二套规则。

import {
  lstatSync, realpathSync, readFileSync, readdirSync, closeSync, fstatSync, openSync,
  constants as fsConstants
} from 'node:fs';
import { join, relative, resolve, isAbsolute } from 'node:path';
import { createHash } from 'node:crypto';

// O_NOFOLLOW 在 Windows 上不存在，设为 0；该平台依然由 realpath 和同文件描述符的 fstat 复核来防范越界。
const O_NOFOLLOW = typeof (fsConstants as { O_NOFOLLOW?: number }).O_NOFOLLOW === 'number'
  ? (fsConstants as unknown as { O_NOFOLLOW: number }).O_NOFOLLOW
  : 0;

export interface SafeReadOk {
  ok: true;
  text: string;
  relPath: string;      // 相对仓库根目录的标准路径
  realPath: string;     // 物理真实路径
  isSymlink: boolean;
}

export type SafeReadFailReason =
  | 'missing'            // 路径不存在
  | 'symlink-dangling'   // 符号链接指向不存在的目标
  | 'symlink-outside'    // 符号链接解析后落在仓库根目录之外
  | 'symlink-non-regular'// 符号链接指向仓库内部的非普通文件（如目录、设备等）
  | 'outside-repo'       // 路径真实位置落在仓库根目录之外
  | 'non-regular'        // 目标本身不是普通文件
  | 'read-error';        // 打开或读取文件失败

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
  | 'dir-junction-outside'  // 目录链接解析后落在仓库根目录之外
  | 'non-directory'         // 目标存在但不是目录
  | 'read-error';           // 列出目录失败

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

/**
 * 记录安全读取拒绝事件，输出 codelore.file_subject_skip 事实。
 * @param ctx 采集上下文
 * @param rawPath 调用方传入的相对路径
 * @param reason 拒绝原因
 * @param descriptor 采集器描述符
 */
export function makeFileSubjectSkipFact(
  ctx: CollectContext,
  rawPath: string,
  reason: string,
  descriptor: CollectorDescriptor = AUDIT_DESCRIPTOR
): CollectedFact {
  // 理由：路径统一使用 '/' 分隔符，Windows 下的反斜杠转为正斜杠，POSIX 下保留原样。
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

function slash(p: string): string {
  return p.split(String.fromCharCode(92)).join('/');
}

/** 检查相对路径是否确实在仓库内（空或点表示仓库根目录自身，均视为在仓内）。 */
function isInsideRoot(relRootToTarget: string): boolean {
  if (relRootToTarget === '' || relRootToTarget === '.') { return true; }
  return relRootToTarget.indexOf('..') !== 0 && !/^[A-Za-z]:/.test(relRootToTarget);
}

/**
 * 区分路径不存在还是无法访问：仅 ENOENT 或 ENOTDIR 视为文件不存在。
 * 权限不足或循环链接等问题属于无法检测，需要如实报警或记录，不能当作文件不存在直接跳过。
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
 * 检查目标路径是否属于仓库内部。
 * 依据真实物理路径判断：不存在、悬空链接、仓外目标均返回 false。
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
 * 校验并读取文件：realpath 确认在仓内后，用同一个文件描述符打开、复核是普通文件后读出，
 * 防止在校验和读取之间路径被并发篡改。
 */
function readVerified(realPath: string): { ok: true; text: string } | { ok: false; reason: SafeReadFailReason; error?: string } {
  let fd: number;
  try {
    fd = openSync(realPath, fsConstants.O_RDONLY | O_NOFOLLOW);
  } catch (e: unknown) {
    const code = (e as { code?: string }).code;
    // 遇到符号链接或文件突然消失直接按不可信输入拒绝
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
    try { closeSync(fd); } catch { /* 关闭文件描述符失败不覆盖主要结论 */ }
  }
}

/**
 * 安全读取仓库内文件，拦截逃逸符号链接、悬空链接、外部目录链接及非普通文件。
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
      // 目标不存在或循环链接等情况统一按拒绝处理
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
 * 安全列出目录内容：目标可以为仓库内普通目录或指向仓内目录的符号链接；
 * 若指向仓外或悬空则拒绝并返回 dir-junction-outside。
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
    // 无法检测直接报错拒绝，并在调用方记录事实，不悄悄跳过
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
 * 探测文件或目录是否存在（不读取内容），用于将“文件不存在”与“存在但因安全规则被拦截”区分开来。
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
    // 探测失败交给安全读取去判断并如实披露，不能悄悄当成不存在
    return 'other';
  }
  if (st.isSymbolicLink()) { return 'link'; }
  if (st.isFile()) { return 'file'; }
  if (st.isDirectory()) { return 'dir'; }
  return 'other';
}

/** 安全列出 ADR 目录下的文件（匹配以数字开头的 .md 文件）。 */
export function listAdrFilesSafe(repoRoot: string, relDir: string): { ok: true; files: string[] } | { ok: false; reason: SafeDirFailReason; relPath: string } {
  const dir = readRepoDirSafe(repoRoot, relDir);
  if (!dir.ok) { return { ok: false, reason: dir.reason, relPath: dir.relPath }; }
  return { ok: true, files: dir.entries.filter(function (f) { return /^\d{3,}.*\.md$/i.test(f); }).sort() };
}
