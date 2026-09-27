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
// ---- 守卫自声明 + skip 三态原语（R40-T1：D-159②③ tier 自声明强制＋SKIP 呈现契约＋D-160③ protected_surface 双字段） ----
// tier 自声明形态（每件守卫文件头声明；未声明=红——75a-T 组普查断言）：
//   const TIER = 'portable' | 'env-contract';
//   const PROTECTED_SURFACE = '<守护面描述>';
export const GUARD_TIERS = ['portable', 'env-contract'];

// skip 原语：环境缺席→SKIP-with-reason 三态退出（exit 0；GUARD-RESULT: SKIP 行供 guard-all-run 分类——
// skip 不进 allOk 禁折 pass、禁门禁计数〔kit #518/startaitools 实证〕；skip≠xfail 不可混标——
// 环境没有=skip、该工作但物不在=xfail/known-red，混标丢环境修复后自动转红的哨兵价值）
export function guardSkip(guardName, reasons) {
  const rs = (Array.isArray(reasons) ? reasons : [reasons]).join('; ');
  console.log('SKIP ' + guardName + ' | ' + rs);
  console.log('GUARD-RESULT: SKIP ' + guardName + ' reason=' + rs);
  process.exit(0);
}

// 自声明解析（75a-T 组与 runner 共用——声明形态钉死利于普查）
export function guardDeclaredTier(src) { const m = src.match(/^const TIER = '(portable|env-contract)';$/m); return m ? m[1] : null; }
export function guardDeclaredSurface(src) { const m = src.match(/^const PROTECTED_SURFACE = '([^'\n]+)';$/m); return m ? m[1] : null; }
