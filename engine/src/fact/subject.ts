// fact/subject.ts —— 把文件路径整成标准形
// subject_ref 全走标准相对路径，大小写不折叠。
// 纯逻辑：不碰文件系统、不起子进程——是不是符号链接、是不是普通文件，外面传进来。
// 标准形就是五条相对路径的规矩，外加明确的 Unicode NFC 规范化：
// 以仓根为基准的相对路径 / 一律 '/' 分隔（Windows 的反斜杠自动转正斜杠）/ 不留 '//' '.' '..' 空段 /
// 老老实实做 NFC 转换 / 大小写不折叠（只差大小写的两条路径就是两个文件）。
// 统一入口：上游数据里的 path/entity 字段，还有改名记录两头的路径，都过这个函数。

export interface SubjectNormResult {
  ok: boolean;
  subject: string | null; // 归整后的路径（ok=true 时肯定不是空）
  reason: string | null; // 为什么拒（ok=false）：empty / absolute / nul-byte / dotdot-segment / empty-after-normalize
  warnings: string[]; // 清理格式时那些不致命的小动作（trimmed / backslash-normalized / dot-segment-dropped / empty-segment-dropped / nfc-normalized）
}

const ABSOLUTE_RE = /^([A-Za-z]:[\\/]|\\|\/\/|\/)/;

export function normalizeSubjectPath(raw: string): SubjectNormResult {
  const warnings: string[] = [];
  if (typeof raw !== 'string') { return { ok: false, subject: null, reason: 'non-string', warnings: warnings }; }
  if (raw.trim() !== raw) { warnings.push('trimmed'); } // 两头有空格就削掉并记一笔，别悄悄把两条路径并成一条
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
  // 大小写不折叠：字面路径原样留着；只有大小写撞车的，交给 detectCaseOnlyConflicts 单独查。
  return { ok: true, subject: out, reason: null, warnings: warnings };
}

// 只查大小写撞车：路径转小写分组，同一组里冒出好几个不同写法，
// 说明在大小写不敏感的文件系统上会打架。结果按固定顺序排好输出。
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
