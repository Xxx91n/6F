// fact/subject.ts — Subject Canonical Form 归一器（#80 / D-124 / D-125 / ADR-0023）
// 纯逻辑模块：不读 fs、不起子进程——symlink/regular-file 判定由调用面注入 probe。
// 规范化形=SCIP relative_path 五规则＋NFC 显式归一（71fa8d2 实证不依赖 git config）：
//   仓根相对 / '/' 分隔（含 Windows 反斜杠输入归一）/ 无 '//' '.' '..' 空段 /
//   Unicode NFC 适配层显式做 / 禁大小写折叠（case-only 冲突=真实不同文件——CVE 事故先例）。
// 归一单点=发射边界：上游行对象 path/entity 字段与 file_renamed 血缘端点统一过本器。

export interface SubjectNormResult {
  ok: boolean;
  subject: string | null;     // 规范化形（ok=true 时非空）
  reason: string | null;      // 拒绝原因（ok=false）：empty / absolute / nul-byte / dotdot-segment / empty-after-normalize
  warnings: string[];         // 非致命归一动作留痕（trimmed / backslash-normalized / dot-segment-dropped / empty-segment-dropped / nfc-normalized）
}

const ABSOLUTE_RE = /^([A-Za-z]:[\\/]|\\|\/\/|\/)/;

export function normalizeSubjectPath(raw: string): SubjectNormResult {
  const warnings: string[] = [];
  if (typeof raw !== 'string') { return { ok: false, subject: null, reason: 'non-string', warnings: warnings }; }
  if (raw.trim() !== raw) { warnings.push('trimmed'); }   // trim=身份合并动作如实留痕（' a.ts '与'a.ts'同 subject——静默合并先例教训）
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
  // 禁大小写折叠：字面形原样保留——case-only 碰撞由 detectCaseOnlyConflicts 检出告警（D-125①）。
  return { ok: true, subject: out, reason: null, warnings: warnings };
}

// case-only 冲突检测：规范化形按 toLowerCase 分桶，同桶多字面=真实不同文件在大小写不敏感
// 文件系统上的分裂脑镜像（git「保留字面提示冲突」心智）。输出确定性排序对。
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
