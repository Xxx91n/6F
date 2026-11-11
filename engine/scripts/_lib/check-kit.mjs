// check-kit.mjs —— 检查脚本共用的一套工具（#75 批1 / D-094③ 「名↔检剥注释」这个通用活就落在这儿；照着 20-check A5 的先例收拢的）
// 约定：不引任何三方依赖；这个目录只放共用的纯函数，不参加 *-check.mjs 那套按名字的枚举（70-check / 75a 普查枚举面已经明着放行了）。

import { spawnSync } from 'node:child_process';

// 剥 JS/TS 源码里的注释：行注 // 和块注 /* */（顺手保一下字符串、正则、模板串里的 // 别被误剥）
// R51-T1A（D-184②④）：把正则字面量那种也补上了——看前面一个 token 是什么来猜，碰上行尾就强制闭合；拿不准的一律按除号算（往安全那边偏，Padolsey 有实录）
// 前一个 token 分三类看：标识符、数字、字符串尾巴、)/]/} 后头跟的 slash 是除号；剩下的当正则
export function stripComments(src) {
  const out = [];
  let i = 0, inStr = null, inLine = false, inBlock = false, inRegex = false, inRegexClass = false, lastSig = '';
  while (i < src.length) {
    const c = src[i], n = src[i + 1];
    if (inLine) { if (c === '\n') { inLine = false; out.push(c); } i++; continue; }
    if (inBlock) { if (c === '*' && n === '/') { inBlock = false; i += 2; } else i++; continue; }
    if (inRegex) {
      if (c === '\n' || c === '\r') { inRegex = false; inRegexClass = false; out.push(c); lastSig = ''; i++; continue; }
      if (c === '\\') { out.push(c); if (i + 1 < src.length) { out.push(src[i + 1]); i += 2; continue; } i++; continue; }
      if (c === '[') { inRegexClass = true; out.push(c); i++; continue; }
      if (c === ']') { inRegexClass = false; out.push(c); i++; continue; }
      if (c === '/' && !inRegexClass) {
        inRegex = false;
        out.push(c); i++;
        while (i < src.length && /[a-z]/i.test(src[i])) { out.push(src[i]); i++; }
        lastSig = '/';
        continue;
      }
      out.push(c); i++;
      continue;
    }
    if (inStr) {
      if (inStr === '`' && c === '$' && n === '{') {
        out.push(c); out.push(n); i += 2;
        let depth = 1, j = i;
        while (j < src.length && depth > 0) {
          const ch = src[j];
          if (ch === '\\') { j += 2; continue; }
          if (ch === "'" || ch === '"' || ch === '`') {
            const q = ch; j++;
            while (j < src.length && src[j] !== q) { if (src[j] === '\\') j++; j++; }
            j++; continue;
          }
          if (ch === '/' && src[j+1] === '/') { while (j < src.length && src[j] !== '\n') j++; continue; }
          if (ch === '/' && src[j+1] === '*') { j += 2; while (j < src.length && !(src[j] === '*' && src[j+1] === '/')) j++; j += 2; continue; }
          if (ch === '{') depth++;
          else if (ch === '}') depth--;
          j++;
        }
        const closeIdx = depth === 0 ? j - 1 : j;
        const inner = src.slice(i, closeIdx);
        out.push(stripComments(inner));
        out.push('}');
        i = closeIdx + 1;
        continue;
      }
      out.push(c);
      if (c === '\\') { out.push(src[i + 1]); i += 2; continue; }
      if (c === inStr) inStr = null;
      i++;
      continue;
    }
    if (c === '/' && n === '/') { inLine = true; i += 2; continue; }
    if (c === '/' && n === '*') { inBlock = true; i += 2; continue; }
    if (c === "'" || c === '"' || c === '`') { inStr = c; out.push(c); lastSig = c; i++; continue; }
    if (c === '/') {
      const isPValue = lastSig === ')' || lastSig === ']' || lastSig === '}' ||
        (lastSig && /[\w$]/.test(lastSig)) ||
        lastSig === "'" || lastSig === '"' || lastSig === '`' ||
        lastSig === '/';
      if (isPValue) {
        out.push(c); i++;
        lastSig = '/';
        continue;
      }
      inRegex = true; inRegexClass = false;
      out.push(c); i++;
      continue;
    }
    out.push(c);
    if (!/\s/.test(c)) lastSig = c;
    i++;
  }
  return out.join('');
}

// 能不能迁进来的探测（D-184②——三种形态撞上一个就拦）：正则引号形／拿不准的除号位／模板串里裹的正则
export function detectRegexHazards(src) {
  const hits = [];
  const lines = src.split('\n');
  for (let li = 0; li < lines.length; li++) {
    const line = lines[li];
    // 模板串里裹的正则
    if (/\$\{[^}]*\/.+\/[^}]*\}/.test(line)) {
      hits.push({ kind: 'tpl-inner-regex', lno: li + 1, line: line.trim().slice(0, 80) });
    }
    // 正则引号形
    const reQuote = /(?:^|[=(,\[{!&|?:;]\s*)\/(?:[^/\\\n]|\\.)*['][^/\\\n]*\/[gimsuy]*/;
    const reQuote2 = /(?:^|[=(,\[{!&|?:;]\s*)\/(?:[^/\\\n]|\\.)*["][^/\\\n]*\/[gimsuy]*/;
    if ((reQuote.test(line) || reQuote2.test(line)) && !/^\s*['"]/.test(line)) {
      hits.push({ kind: 'regex-quote-form', lno: li + 1, line: line.trim().slice(0, 80) });
    }
    // 拿不准的除号位
    if (/[\w$\)\]\}]\s*\/[^\s/*=]/.test(line) && line.indexOf('//') < 0 && line.indexOf('/*') < 0) {
      const m = line.match(/([\w$\)\]\}])\s*\/([^\s/*=])/);
      if (m) hits.push({ kind: 'ambiguous-div', lno: li + 1, line: line.trim().slice(0, 80), prev: m[1] });
    }
  }
  return hits;
}

// D-213① 危险正则形态的机器检查（零反斜杠那条纪律的边界，成文时就配着这道断言）：
// 以「[^]」打头＝JS 里否定空字符类的语义陷阱（[^] 匹配任意字符，后面那个 ] 是字面成员，不是闭合——P0-2 那条死正则就是这么出的）。
// 管的地方＝往字符串、模板串里写的语境；正则字符类里头不适用零反斜杠纪律（[^\]] / [^\x5D] 那是物理上少不了的）。
// 扫的面只限真容易理解错的高危形态，不搞一整套完整转义矩阵（免得越立越多变成过度立法）——「[^]」是唯一没有歧义、机器查得出的死形态
// （ESLint 的 no-empty-character-class＋Biome 的 negated-empty-class＋eslint-plugin-regexp，三家先例都一个路子）；
// 「否定字符类里光秃秃一个 ]」在合法的 [^a]/[^abc] 这种单成员否定类下跟真用错分不出来（得完整解析正则才行），超出这个探测器的能力范围。
// 进来的是剥完注释的源码（stripComments 的产物）；回一个 hits 数组（kind/lno/line）。合法的 [^\]] 因为 \] 转了义，撞不上（负对照钉住了）。
export function detectDangerousRegexForms(strippedSrc) {
  const hits = [];
  const lines = strippedSrc.split('\n');
  for (let li = 0; li < lines.length; li++) {
    const line = lines[li];
    // [^] 打头（否定空字符类——JS 里 [^] 匹配任意字符，后头那个 ] 是字面成员不是闭合；P0-2 死正则那个形态）
    if (/\[\^\]/.test(line)) {
      hits.push({ kind: 'negated-empty-class', lno: li + 1, line: line.trim().slice(0, 80) });
    }
  }
  return hits;
}
export function stripMdComments(src) {
  return src.replace(/<!--[\s\S]*?-->/g, '');
}

// ---- git 票面的那套机件（R38/#75 批2，r37 审计 P-5 收进来的：26/28/30-check 里「git log --grep 加 show --name-only 摸触及面」这套机件三份复制，去重） ----
// 用 spawnSync 走 argv，没有 shell 拼接那点事；统一加 -c core.quotePath=false（非 ASCII 路径不会被引号逃掉——28 原来的 execSync 串就带着这个参数，26/30 原来的 argv 少了它是潜在漏洞，顺手补齐）。
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
// ---- 守卫自声明加 skip 三态那套原语（R40-T1：D-159②③ tier 必须自己声明＋SKIP 怎么呈现的契约＋D-160③ protected_surface 两个字段） ----
// tier 自己声明的样子（每件守卫在文件头写上；不写＝红——75a-T 组一道普查就断言这个）：
//   const TIER = 'portable' | 'env-contract';
// const PROTECTED_SURFACE = '<这个守卫守的是什么>';
export const GUARD_TIERS = ['portable', 'env-contract'];

// skip 原语：环境缺东西就按 SKIP 加原因的三态退出（exit 0；GUARD-RESULT: SKIP 那一行给 guard-all-run 分门别类——
// skip 不算绿、不许折成 pass、不进闸的门禁计数〔kit #518/startaitools 有实证〕；skip 别跟 xfail 混标——
// 环境没有算 skip、本该有却没有算 xfail/known-red，混着标就把「环境修好后它自己转红」这个哨兵的价值丢了）
export function guardSkip(guardName, reasons) {
  const rs = (Array.isArray(reasons) ? reasons : [reasons]).join('; ');
  console.log('SKIP ' + guardName + ' | ' + rs);
  console.log('GUARD-RESULT: SKIP ' + guardName + ' reason=' + rs);
  process.exit(0);
}

// 解析自声明（75a-T 组和 runner 共用——写法钉死好普查）
export function guardDeclaredTier(src) { const m = src.match(/^const TIER = '(portable|env-contract)';$/m); return m ? m[1] : null; }
export function guardDeclaredSurface(src) { const m = src.match(/^const PROTECTED_SURFACE = '([^'\n]+)';$/m); return m ? m[1] : null; }
// D-214① consumption_forms 消费形态的枚举自声明解析（跟 tier 同一个提交、同一道 T 组机检「没声明＝红」）。
// 写法：const CONSUMPTION_FORMS = ['dev-full', ...]; ——只有一种消费方式的守卫登记一行 ['dev-full'] 就完了（不额外收税），
// 好几种消费方式的（groupProbe 组级 need 那种守卫）得把真实用到的都写上。返回数组，没声明就返回 null。
export function guardDeclaredConsumptionForms(src) { const m = src.match(/^const CONSUMPTION_FORMS = \[([^\]]*)\];$/m); if (!m) return null; const inner = m[1].trim(); if (inner === '') return []; return inner.split(',').map((s) => s.trim().replace(/^['"]|['"]$/g, '')).filter(Boolean); }

// blankStrings：把字符串、模板字面量里的内容抹成一片空白的遮罩——引号里抹成空格（引号的边界留着），模板体抹空格但 ${...} 里的代码递归保留，总长和行号一点不动
// 专给判「是不是真在用」使：字符串内容、属性名、标识符里提到名字都不算消费位；剥注释那事还是 stripComments 干
export function blankStrings(src) {
  let out = '', i = 0;
  while (i < src.length) {
    const c = src[i];
    if (c === "'" || c === '"') {
      const q = c;
      let j = i + 1;
      while (j < src.length && src[j] !== q) {
        if (src[j] === '\\') j++;
        j++;
      }
      out += q + ' '.repeat(Math.max(0, j - i - 1)) + (j < src.length ? q : '');
      i = j + 1;
      continue;
    }
    if (c === '`') {
      let j = i + 1;
      let body = '';
      while (j < src.length) {
        if (src[j] === '\\') { body += src[j] + src[j + 1]; j += 2; continue; }
        if (src[j] === '`') break;
        if (src[j] === '$' && src[j + 1] === '{') {
          const close = findMatchingBrace(src, j + 2);
          body += '${' + blankStrings(src.slice(j + 2, close)) + '}';
          j = close + 1;
          continue;
        }
        body += ' ';
        j++;
      }
      out += '`' + body + (j < src.length ? '`' : '');
      i = j + 1;
      continue;
    }
    out += c;
    i++;
  }
  return out;
}

function findMatchingBrace(src, open) {
  let depth = 0;
  for (let i = open; i < src.length; i++) {
    if (src[i] === '{') depth++;
    else if (src[i] === '}') { depth--; if (depth === 0) return i; }
    else if (src[i] === '\\') i++;
  }
  return src.length - 1;
}

// realConsumption：判真用上了没有——只认 import/require 具名引进来的，或者 stripComments(/stripMdComments( 这种调用位
// （成员调用 x.stripComments( 也算——D-158① 原文写的就是「调用位」，没写「裸」；声明位 {stripComments:…} 没左括号不算）
// 字符串、属性名、标识符里提名字不豁免（先剥字符串再判）；调用位认左括号不认词缀（探测定锚定在消费位：先剥注释再判，注释里提名字不豁免）
// 豁免的判定落在剥完注释的消费位上，注释里提名字不算
export function realConsumption(strippedNoComments) {
  const noStr = blankStrings(strippedNoComments);
  const importBind = /\bimport\b[^'"\n]*\b(?:stripComments|stripMdComments)\b[^'"\n]*\bfrom\b\s*['"]/;
  const requireBind = /\{[^}\n]*\b(?:stripComments|stripMdComments)\b[^}\n]*\}\s*=\s*require\s*\(/;
  const callForm = /(?:^|[^\w$])(?:stripComments|stripMdComments)\s*\(/;
  return importBind.test(noStr) || requireBind.test(noStr) || callForm.test(noStr);
}
