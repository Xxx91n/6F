// check-kit.mjs — 守卫共用工具包（#75批1 / D-094③「名↔检剥注释」通用化落点；73-check A4 / 20-check A5 先例收敛）
// 约定：零三方依赖；本目录仅放共享纯函数，不参与 *-check.mjs 命名枚举（70-check/75a 普查枚举面豁免）。

import { spawnSync } from 'node:child_process';

// 剥 JS/TS 源码注释：行注 // 与块注 /* */（含字符串内 // 保护的保守形态——字符串字面量中的 // 不剥）
export function stripComments(src) {
  const out = [];
  let i = 0, inStr = null, inLine = false, inBlock = false;
  while (i < src.length) {
    const c = src[i], n = src[i + 1];
    if (inLine) { if (c === '\n') { inLine = false; out.push(c); } i++; continue; }
    if (inBlock) { if (c === '*' && n === '/') { inBlock = false; i += 2; } else i++; continue; }
    if (inStr) { out.push(c); if (c === '\\') { out.push(src[i + 1]); i += 2; continue; } if (c === inStr) inStr = null; i++; continue; }
    if (c === '/' && n === '/') { inLine = true; i += 2; continue; }
    if (c === '/' && n === '*') { inBlock = true; i += 2; continue; }
    if (c === "'" || c === '"' || c === '`') inStr = c;
    out.push(c); i++;
  }
  return out.join('');
}

// 剥 Markdown/HTML 注释：<!-- -->（73-check A4 先例）
export function stripMdComments(src) {
  return src.replace(/<!--[\s\S]*?-->/g, '');
}

// ---- git 票面机件（R38/#75批2，r37 审计 P-5 收编：26/28/30-check「git log --grep + show --name-only 触及面」机件三份复制去重） ----
// spawnSync argv 形态无 shell 拼接面；统一 -c core.quotePath=false（非 ASCII 路径不引号逃逸——28 原 execSync 串已带此参，26/30 原 argv 缺此为潜在漏洞顺带补齐）。
export function gitOut(root, args) {
  const r = spawnSync('git', ['-c', 'core.quotePath=false'].concat(args), { cwd: root, encoding: 'utf8' });
  return r.stdout || '';
}
export function commitsByGrep(root, pattern) {
  return gitOut(root, ['log', '--all', '--format=%H', '--grep', pattern]).split('\n').map(function (s) { return s.trim(); }).filter(Boolean);
}
export function pathsTouchedBy(root, sha) {
  return gitOut(root, ['show', '--name-only', '--format=', sha]).split('\n').map(function (p) { return p.trim(); }).filter(Boolean);
}
export function touchedPaths(root, shas) {
  const s = new Set();
  for (const sha of shas) { pathsTouchedBy(root, sha).forEach(function (p) { s.add(p); }); }
  return s;
}
export function lastChangeSha(root, relPath) {
  return gitOut(root, ['log', '-1', '--format=%H', '--', relPath]).trim();
}
