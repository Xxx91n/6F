// check-kit.mjs — 守卫共用工具包（#75批1 / D-094③「名↔检剥注释」通用化落点；73-check A4 / 20-check A5 先例收敛）
// 约定：零三方依赖；本目录仅放共享纯函数，不参与 *-check.mjs 命名枚举（70-check/75a 普查枚举面豁免）。

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
