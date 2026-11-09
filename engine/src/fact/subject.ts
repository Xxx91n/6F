// fact/subject.ts — 文件标准路径格式转换器
// 理由：subject_ref 统一走标准相对路径格式，不折叠大小写。
// 纯逻辑模块：不读文件系统、不启动子进程——符号链接与普通文件判定由外部传入。
// 标准路径格式：基于五条相对路径规则加上明确的 Unicode NFC 规范化：
//   基于仓库根目录的相对路径 / 统一用 '/' 分隔（Windows 反斜杠会自动转为正斜杠）/ 不含 '//' '.' '..' 空段 /
//   明确做 Unicode NFC 转换 / 不折叠大小写（仅大小写不同的路径视为不同文件）。
// 统一入口：上游数据中的 path/entity 字段与文件改名记录中的端点路径都由此函数处理。

export interface SubjectNormResult {
  ok: boolean;
  subject: string | null;     // 标准化路径（ok=true 时非空）
  reason: string | null;      // 拒绝原因（ok=false）：empty / absolute / nul-byte / dotdot-segment / empty-after-normalize
  warnings: string[];         // 格式清理过程的非致命记录（trimmed / backslash-normalized / dot-segment-dropped / empty-segment-dropped / nfc-normalized）
}

const ABSOLUTE_RE = /^([A-Za-z]:[\\/]|\\|\/\/|\/)/;

export function normalizeSubjectPath(raw: string): SubjectNormResult {
  const warnings: string[] = [];
  if (typeof raw !== 'string') { return { ok: false, subject: null, reason: 'non-string', warnings: warnings }; }
  if (raw.trim() !== raw) { warnings.push('trimmed'); }   // 去掉首尾空格并记录，避免悄悄合并路径
  let s = raw.trim();
  if (s.length === 0) { return { ok: false, subject: null, reason: 'empty', warnings: warnings }; }
  if (s.indexOf(String.fromCharCode(0)) >= 0) { return { ok: false, subject: null, reason: 'nul-byte', warnings: warnings }; }
  if (ABSOLUTE_RE.test(s)) { return { ok: false, subject: null, reason: 'absolute', warnings: warnings }; }
  if (s.indexOf(String.fromCharCode(92)) >= 0) {
    warnings.push('backslash-normalized');
    s = s.split(String.fromCharCode(92)).join('/');
  }
  const segs = s.split('/');
  const kept: string[] = [];
  for (const seg of segs) {
    if (seg === '..') { return { ok: false, subject: null, reason: 'dotdot-segment', warnings: warnings }; }
    if (seg === '') { if (segs.length > 1) { warnings.push('empty-segment-dropped'); } continue; }
    if (seg === '.') { warnings.push('dot-segment-dropped'); continue; }
    kept.push(seg);
  }
  if (kept.length === 0) { return { ok: false, subject: null, reason: 'empty-after-normalize', warnings: warnings }; }
  let out = kept.join('/');
  const nfc = out.normalize('NFC');
  if (nfc !== out) { warnings.push('nfc-normalized'); out = nfc; }
  // 不折叠大小写：字面路径原样保留，仅大小写冲突的情况由 detectCaseOnlyConflicts 单独检查。
  return { ok: true, subject: out, reason: null, warnings: warnings };
}

// 仅大小写冲突检查：将路径转为小写后分组，若同一组存在多个不同的原写法，
// 说明在不区分大小写的文件系统上会冲突。输出固定排序的路径对。
export function detectCaseOnlyConflicts(subjects: readonly string[]): { pairs: [string, string][] } {
  const buckets = new Map<string, string[]>();
  for (const s of subjects) {
    const k = s.toLowerCase();
    const arr = buckets.get(k) || [];
    if (arr.indexOf(s) < 0) { arr.push(s); buckets.set(k, arr); }
  }
  const pairs: [string, string][] = [];
  for (const arr of buckets.values()) {
    if (arr.length > 1) {
      const sorted = arr.slice().sort();
      for (let i = 0; i < sorted.length; i++) {
        for (let j = i + 1; j < sorted.length; j++) { pairs.push([sorted[i], sorted[j]]); }
      }
    }
  }
  pairs.sort(function (a, b) { return (a[0] + '|' + a[1]) < (b[0] + '|' + b[1]) ? -1 : 1; });
  return { pairs: pairs };
}
