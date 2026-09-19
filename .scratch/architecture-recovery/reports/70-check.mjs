// #70 守卫——vacuous 恒真断言族制度面（D-079 / R23-Q1 调研落地）
// ① 二值口径：VACUOUS⇔断言引用物缺席∧执行历史零 FAIL 记录（非 FAIL 同义词，独立候选族）
// ② 引用物缺席普查 pass（#65 sibling-dependency grep 机制复用）：
//    - 逐断言抽取「fs 消费位引用物」（existsSync/readFileSync/read/txt/noBom/readdirSync/statSync/openReader
//      的参数——join() 经文件级常量表解析，字面量相对 here，绝对路径直查）＋registry 引用物（item/event id）
//    - 豁免面：sealed() 调用点（已 disposition 移出执行集）＋ !existsSync 否定存在断言（缺席=断言语义本体）
//    - git 命令数组内 pathspec（'--' 后路径）不作 fs 引用物——历史过滤不依赖工作树存在（46-B2/B3 正例）
//    - 断言 12 行回溯窗内无 fs 消费位引用物 → 不参评（无引用物=非 vacuity 面）
// ③ 分级：certain=单引用物机械解析缺席；likely=多引用物/部分可解析需人工裁决（45-H5 先例）
// ④ 执行历史零 FAIL 判据（机检代理）：不在 stale-assertions（已登记 FAIL）∧不在 attestation（fired-sealed）
//    ∧候选守卫实跑该 slug 当前 emit PASS（真 FAIL 不属恒真——归未登记 FAIL 通道由 xfail-run 拦截）
// ⑤ vacuity-manifest.json 独立候选册（Chromium 分文件先例；vs stale-assertions 扩枚举=语义二分不干净）：
//    字段=id/guard/assertion-slug/referent-path/detection_evidence/confidence/zero_fail_history/
//    disposition/decision/evidence/review_anchor/expires_fallback/added——stale schema 最小扩展＋cap＋复审锚＋逾期报警
// ⑥ baseline 惯例只拦新增：册内存量逐条顶显 VACUOUS-CAND；册外新增候选 → FAIL（须先裁 disposition 入册）
// ⑦ anti-vacuity 自检（D-018 正对照——守卫守卫者也要被守）：注入已知缺席引用物合成断言验证探测器必抓；
//    负对照=现存引用物合成断言不得误报；sealed/否定存在形态不得误报
// ⑧ 断言级 id 盘点偿 D-071 欠账：live 解析 emit 调用点 vs 63-assertion-inventory.json 逐守卫对账（漂移→FAIL 附 regen 命令）
// ⑨ 39-F2 留痕闭包：disposition=vacuous-deleted 在册＋守卫源无 t('F2 发射＋vacuous-deleted 注释在（不走 sealed/XFAIL）
// 用法：node 70-check.mjs → 逐条 PASS/FAIL + VACUOUS-CAND 顶显；exit 0=结构完整，exit 1=有 FAIL
import fs from 'node:fs';
import { spawnSync } from 'node:child_process';
import { fileURLToPath } from 'node:url';
import { dirname, join } from 'node:path';

const HERE = dirname(fileURLToPath(import.meta.url));
const ROOT = join(HERE, '..', '..', '..');
const MA = join(ROOT, '.scratch', 'macro-audit');
const AR = join(ROOT, '.scratch', 'architecture-recovery');
const ENG = join(ROOT, 'engine');

let pass = 0, fail = 0;
const t = (name, ok, extra = '') => { console.log((ok ? 'PASS ' : 'FAIL ') + name + (extra ? ' | ' + extra : '')); ok ? pass++ : fail++; };

// ---------- §1 抽取器（引用物缺席普查机芯——sibling-dependency grep 复用） ----------

function splitArgs(s) {
  const parts = []; let d = 0, cur = '', q = null;
  for (const ch of s) {
    if (q) { cur += ch; if (ch === q && cur[cur.length - 2] !== '\\') q = null; continue; }
    if (ch === "'" || ch === '"' || ch === '`') { q = ch; cur += ch; continue; }
    if ('([{'.includes(ch)) d++;
    if (')]}'.includes(ch)) d--;
    if (ch === ',' && d === 0) { parts.push(cur.trim()); cur = ''; } else cur += ch;
  }
  if (cur.trim()) parts.push(cur.trim());
  return parts;
}

function resolveJoinArgs(argStr, T) {
  const parts = splitArgs(argStr);
  if (!parts.length) return null;
  const b0 = parts[0];
  let base;
  if (/^REPOS\.[\w]+$/.test(b0)) base = (T.REPOS && T.REPOS[b0.split('.')[1]]) || null;
  else if (/^'/.test(b0)) return null; // literal-first join 基座不定——不参评
  else base = T[b0];
  if (typeof base !== 'string' || !base) return null;
  const lits = [];
  for (const p of parts.slice(1)) { const mm = p.match(/^'([^']*)'$/); if (!mm) return null; lits.push(mm[1]); }
  return join(base, ...lits);
}

// buildConsts：检测位走掩码源（字符串内伪 const/join 不注入），取值走原文同位（掩码保长保位）
function buildConsts(src, masked) {
  const T = { here: HERE, ROOT: ROOT, ENG: ENG, MA: MA, AR: AR };
  const rm = masked.match(/const\s+REPOS\s*=\s*\{([^}]*)\}/);
  if (rm) {
    const origObj = src.slice(rm.index).match(/\{([^}]*)\}/);
    const o = {};
    if (origObj) for (const mm of origObj[1].matchAll(/'([^']+)'\s*:\s*'([^']+)'/g)) o[mm[1]] = mm[2];
    T.REPOS = o;
  }
  for (const m of masked.matchAll(/const\s+([A-Z_a-z][\w]*)\s*=\s*'/g)) {
    const orig = src.slice(m.index).match(/^const\s+[A-Z_a-z][\w]*\s*=\s*'([^']*)'/);
    if (orig) T[m[1]] = orig[1];
  }
  for (const m of masked.matchAll(/const\s+([A-Z_a-z][\w]*)\s*=\s*join\s*\(/g)) {
    const openIdx = m.index + m[0].lastIndexOf('(');
    const inner = innerExpr(src, openIdx);
    if (inner !== null) { const r = resolveJoinArgs(inner, T); if (r) T[m[1]] = r; }
  }
  return T;
}

function resolvePathExpr(expr, T) {
  expr = expr.trim();
  let m = expr.match(/^join\((.*)\)$/s);
  if (m) return resolveJoinArgs(m[1], T);
  m = expr.match(/^'([^']+)'$/);
  if (m) { const s = m[1]; return /^[A-Za-z]:[\\/]/.test(s) ? s : join(HERE, s); }
  m = expr.match(/^([A-Za-z_][\w.]*)$/);
  if (m) {
    if (/^REPOS\.[\w]+$/.test(m[1])) return (T.REPOS && T.REPOS[m[1].split('.')[1]]) || null;
    const v = T[m[1]];
    return typeof v === 'string' ? v : null;
  }
  return null;
}

// 平衡括号抽取（引号态跟踪——字面量内 ')' 不计深度）
function innerExpr(text, openIdx) {
  let d = 0, start = -1, q = null;
  for (let i = openIdx; i < text.length; i++) {
    const ch = text[i];
    if (q) { if (ch === q && text[i - 1] !== '\\') q = null; continue; }
    if (ch === "'" || ch === '"' || ch === '`') { q = ch; continue; }
    if (ch === '(') { d++; if (start < 0) start = i + 1; }
    else if (ch === ')') { d--; if (d === 0) return text.slice(start, i); }
  }
  return null;
}

// 行注释剥离（// 出字符串态即截断——注释内 t()/sealed()/join()/const 均非发射点/引用物，防误计）
function stripComments(src) {
  return src.split('\n').map(line => {
    let q = null;
    for (let i = 0; i < line.length - 1; i++) {
      const ch = line[i];
      if (q) { if (ch === q && line[i - 1] !== '\\') q = null; continue; }
      if (ch === "'" || ch === '"' || ch === '`') { q = ch; continue; }
      if (ch === '/' && line[i + 1] === '/') return line.slice(0, i);
    }
    return line;
  }).join('\n');
}

// 字符串掩码（字面量内容→空格，引号保留，长度不变——掩码位与原串位一一对应；检测走掩码、提取走原文）
function maskStrings(src) {
  const out = [];
  for (const line of src.split('\n')) {
    let q = null, buf = '';
    for (let i = 0; i < line.length; i++) {
      const ch = line[i];
      if (q) {
        if (ch === q && line[i - 1] !== '\\') { buf += ch; q = null; }
        else buf += ' ';
      } else {
        buf += ch;
        if (ch === "'" || ch === '"' || ch === '`') q = ch;
      }
    }
    out.push(buf);
  }
  return out.join('\n');
}

// 原文文本中的字符串字面量序列（支持 ' " ` 三种引号＋转义跳格）
function extractLiterals(text) {
  const lits = [];
  let i = 0;
  while (i < text.length) {
    const ch = text[i];
    if (ch === "'" || ch === '"' || ch === '`') {
      const q = ch; let j = i + 1, buf = '';
      while (j < text.length && text[j] !== q) { if (text[j] === '\\') { buf += text[j]; j++; if (j < text.length) buf += text[j]; j++; } else { buf += text[j]; j++; } }
      lits.push(buf);
      i = j + 1;
    } else i++;
  }
  return lits;
}

const FS_FN = ['existsSync', 'readFileSync', 'readdirSync', 'statSync', 'lstatSync', 'read', 'txt', 'noBom', 'openReader'];
const FS_CALL_RE = new RegExp('\\b(' + FS_FN.join('|') + ')\\s*\\(', 'g');
const NAME_P = /^(name|label|id|n|msg|slug|title|desc|l|key)$/i;

// name 参数位=def 形参名匹配（ok(cond,label)→pos1；t(name,ok,extra)→pos0；check(id,cond)→pos0；ok(n,d)→pos0）
function detectNamePos(lines) {
  const namePos = { t: 0, sealed: 0, w: 0, w58: 0, check: 0, ok: 0 };
  for (const l of lines) {
    const d = l.match(/const\s+(ok|check|t|w|w58)\s*=\s*\(([^)]*)\)/);
    if (d) { const ps = d[2].split(',').map(s => s.trim().split(/[\s=]/)[0]); const idx = ps.findIndex(p => NAME_P.test(p)); if (idx >= 0) namePos[d[1]] = idx; }
    const d2 = l.match(/function\s+(ok|check|t|w|w58)\s*\(([^)]*)\)/);
    if (d2) { const ps = d2[2].split(',').map(s => s.trim()); const idx = ps.findIndex(p => NAME_P.test(p)); if (idx >= 0) namePos[d2[1]] = idx; }
  }
  return namePos;
}

// 发射点检测走掩码行（字符串内 fn( 不计），name 取原文调用窗内第 pos 个字面量
function extractAssertions(origLines, maskedLines, namePos) {
  const assertions = [];
  origLines.forEach((l, i) => {
    const ml = maskedLines[i] || '';
    for (const mm of ml.matchAll(/\b(t|ok|check|w|w58|sealed)\s*\(/g)) {
      const fn = mm[1];
      const pos = namePos[fn] || 0;
      const callWin = origLines.slice(i, i + 4).join(' ');
      const fromCall = callWin.slice(mm.index);
      const lits = extractLiterals(fromCall);
      const name = lits.length > pos ? lits[pos] : (lits.length ? lits[lits.length - 1] : '');
      if (!name) continue;
      assertions.push({ line: i, slug: name.split(/\s+/)[0], style: fn, sealedCall: fn === 'sealed' });
    }
  });
  return assertions;
}

// 引用物缺席普查（返回 candidates 数组；srcOverride 供 anti-vacuity 自检喂合成源）
// 双轨制：stripComments 去行注释→maskStrings 掩字面量内容；检测（fn(/fs 调用/const 位）走掩码，提取（字面量/join 参数）走原文
function censusGuardSource(srcRaw, reg) {
  const src = stripComments(srcRaw);
  const masked = maskStrings(src);
  const lines = src.split('\n');
  const maskedLines = masked.split('\n');
  const T = buildConsts(src, masked);
  const namePos = detectNamePos(maskedLines);
  const assertions = extractAssertions(lines, maskedLines, namePos);
  const cands = [];
  for (const a of assertions) {
    if (a.sealedCall) continue; // sealed() 调用点已 disposition——不参评
    const lo = Math.max(0, a.line - 12);
    const region = lines.slice(lo, a.line + 1).join('\n');
    const maskedRegion = maskedLines.slice(lo, a.line + 1).join('\n');
    const posRefs = [];
    for (const m of maskedRegion.matchAll(FS_CALL_RE)) {
      const inner = innerExpr(region, m.index + m[0].length - 1);
      if (inner === null) continue;
      const arg = splitArgs(inner)[0] || '';
      const r = resolvePathExpr(arg, T);
      // !existsSync / !fs.existsSync=否定存在断言豁免（缺席=断言语义本体；'!' 可在成员链前）
      if (r && !/!\s*[\w.$]*$/.test(maskedRegion.slice(0, m.index))) posRefs.push({ path: r, fn: m[1] });
    }
    // registry 引用物：仅 reg. 变量形态（reg.items.find(...id==='x'...)/reg.events['x']——防 .id 泛匹配误伤数据结构 id）
    const regRefs = [];
    for (const m of maskedRegion.matchAll(/reg\.events\s*(?:\[|\.)/g)) {
      const orig = region.slice(m.index).match(/^reg\.events\s*(?:\['([\w-]+)'\]|\.([\w-]+))/);
      if (orig) regRefs.push('event:' + (orig[1] || orig[2])); // 仅字面 id——reg.events[var] 动态索引不参评
    }
    for (const m of maskedRegion.matchAll(/reg\.items\./g)) {
      const origWin = region.slice(m.index, m.index + 160);
      const idm = origWin.match(/\.id\s*===\s*'([\w-]+)'/);
      if (idm) regRefs.push('item:' + idm[1]);
    }
    const missPos = posRefs.filter(r => !fs.existsSync(r.path));
    const regMiss = regRefs.filter(r => {
      const i = r.indexOf(':'); const k = r.slice(0, i), id = r.slice(i + 1);
      return k === 'item' ? !reg.items.some(x => x.id === id) : !reg.events[id];
    });
    if ((posRefs.length && missPos.length === posRefs.length) || regMiss.length) {
      const uniqMiss = [...new Set(missPos.map(r => r.path))].concat(regMiss);
      // certain=单引用物机械解析缺席（同一路径多消费位仍 certain）；likely=多引用物/registry 引用缺失需人工裁决
      const certain = uniqMiss.length === 1 && regMiss.length === 0;
      cands.push({ slug: a.slug, line: a.line + 1, missing: uniqMiss, confidence: certain ? 'certain' : 'likely' });
    }
  }
  return { assertions: assertions, candidates: cands };
}

// ---------- §2 输入装载 ----------
const reg = JSON.parse(fs.readFileSync(join(HERE, '33-gate-registry.json'), 'utf8'));
const stale = JSON.parse(fs.readFileSync(join(HERE, 'stale-assertions.json'), 'utf8'));
const staleKeys = new Set(stale.entries.map(e => e.guard + ':' + e['assertion-slug']));
const attPath = join(HERE, 'acceptance-probe-attestation.jsonl');
const attKeys = new Set(fs.existsSync(attPath)
  ? fs.readFileSync(attPath, 'utf8').split('\n').filter(Boolean).map(l => JSON.parse(l)).map(r => r.guard + ':' + r['assertion-slug'])
  : []);

const manifestPath = join(HERE, 'vacuity-manifest.json');
let manifest = null;
try { manifest = JSON.parse(fs.readFileSync(manifestPath, 'utf8')); } catch (e) { manifest = null; }
const mEntries = manifest && Array.isArray(manifest.entries) ? manifest.entries : [];
const mByKey = {};
for (const e of mEntries) mByKey[e.guard + ':' + e['assertion-slug']] = e;

// ---------- A. manifest 在册与 vac-39-f2 闭包 ----------
t('A1 vacuity-manifest.json 在且 version/cap=10/entries<=cap',
  !!manifest && manifest.version === 1 && manifest.cap === 10 && mEntries.length <= manifest.cap,
  manifest ? 'entries=' + mEntries.length + '/' + manifest.cap : 'missing/parse-fail');
const f2Entry = mByKey['39:F2'];
t('A2 vac-39-f2 在册 disposition=vacuous-deleted（恒真不走 sealed/XFAIL）',
  !!f2Entry && f2Entry.disposition === 'vacuous-deleted' && f2Entry.decision === 'D-079',
  f2Entry ? '' : 'entry-missing');
const src39 = fs.readFileSync(join(HERE, '39-check.mjs'), 'utf8');
t("A3 39-F2 已从守卫源删除（无 t('F2 发射位）＋vacuous-deleted 留痕注释在",
  !/\bt\(\s*'F2\s/.test(src39) && src39.indexOf('vacuous-deleted') >= 0 && src39.indexOf('vac-39-f2') >= 0, '');

// ---------- B. census pass：全守卫引用物缺席普查 ----------
// 70-check 入断言盘点但自豁免候选扫描——SELF_* 合成源为字符串内伪 join()，自扫会误抓（守卫守卫者的另一条腿）
const guardFiles = fs.readdirSync(HERE).filter(f => /-check\.mjs$/.test(f)).sort();
const inventory = {};
const allCands = [];
for (const f of guardFiles) {
  const g = f.replace(/-check\.mjs$/, '');
  const src = fs.readFileSync(join(HERE, f), 'utf8');
  const res = censusGuardSource(src, reg);
  inventory[g] = { assertion_ids: res.assertions.length, call_styles: [...new Set(res.assertions.map(a => a.style + '()'))].sort() };
  if (g === '70') continue;
  for (const c of res.candidates) {
    const key = g + ':' + c.slug;
    // 二值口径第二腿：执行历史零 FAIL——已登记 FAIL（stale）或 fired-sealed（attestation）即出局
    const hasHistory = staleKeys.has(key) || attKeys.has(key);
    allCands.push({ guard: g, slug: c.slug, line: c.line, missing: c.missing, confidence: c.confidence, hasHistory: hasHistory });
  }
}
const liveCands = allCands.filter(c => !c.hasHistory);
const histCands = allCands.filter(c => c.hasHistory);

// 册外新增候选 = baseline 拦截面（D-079②：存量一次性记录入册，之后只拦新增）
const newCands = liveCands.filter(c => {
  const e = mByKey[c.guard + ':' + c.slug];
  return !e || e.suppress_census === true;
});
const stockCands = liveCands.filter(c => {
  const e = mByKey[c.guard + ':' + c.slug];
  return e && e.suppress_census !== true && e.disposition !== 'vacuous-deleted';
});
// vacuous-deleted 复活=FAIL（删除后断言重新出现 → 处置失效）
const resurrected = liveCands.filter(c => { const e = mByKey[c.guard + ':' + c.slug]; return e && e.disposition === 'vacuous-deleted'; });

for (const c of stockCands) console.log('VACUOUS-CAND ' + c.guard + ':' + c.slug + ' (referent-missing: ' + c.missing[0] + ') | ' + c.confidence + ' | baseline stock——manifest 在册');
for (const c of histCands) console.log('NOTE ' + c.guard + ':' + c.slug + ' 引用物缺席但有 FAIL/fired 历史（stale/sealed 在册）——非恒真族，归既有通道');

// 当前 emit PASS 腿：候选守卫实跑验当前为 PASS（非 FAIL）才算 vacuous
const emittedStatus = {};
for (const g of [...new Set(liveCands.map(c => c.guard))]) {
  const gp = join(HERE, g + '-check.mjs');
  if (!fs.existsSync(gp)) continue;
  const r = spawnSync(process.execPath, [gp], { encoding: 'utf8', timeout: 180000 });
  const out = (r.stdout || '') + '\n' + (r.stderr || '');
  emittedStatus[g] = {};
  for (const line of out.split('\n')) {
    const m = line.match(/^(PASS|FAIL)\s+(\S+)/);
    if (m) emittedStatus[g][m[2]] = m[1];
  }
}
const stillFail = liveCands.filter(c => emittedStatus[c.guard] && emittedStatus[c.guard][c.slug] === 'FAIL');

// ---------- C. 断言计数与候选清单 ----------
const totalAssertions = Object.values(inventory).reduce((s, x) => s + x.assertion_ids, 0);
t('C1 断言级 emit 调用点盘点覆盖全守卫（' + guardFiles.length + ' 守卫 ' + totalAssertions + ' 调用点——D-071 盘点口径=emit 调用点）',
  totalAssertions > 1100 && guardFiles.length >= 40, 'guards=' + guardFiles.length + ' sites=' + totalAssertions);
t('C2 册外新增恒真候选为零（baseline 只拦新增：检出须先裁 disposition 入册或修复）',
  newCands.length === 0, newCands.map(c => c.guard + ':' + c.slug + '@' + c.missing[0]).join(' '));
t('C3 vacuous-deleted 无复活（删除断言未重新出现）',
  resurrected.length === 0, resurrected.map(c => c.guard + ':' + c.slug).join(','));
t('C4 候选守卫实跑当前 emit 无 FAIL（恒真=PASS 恒成立；emit=FAIL 者归未登记 FAIL 通道非本族）',
  stillFail.length === 0, stillFail.map(c => c.guard + ':' + c.slug).join(','));

// ---------- D. anti-vacuity 自检（D-018 正对照：探测器对注入缺席引用物必抓） ----------
// SELF_* 合成源内 t(/sealed( 字面量一律拼接规避——静态盘点只计本守卫真实发射点，字符串内容不入 emit 计数
const SELF_A = [
  "const SELFWF = join(here, '__vacuity-selfcheck__', 'definitely-missing-referent.yml');",
  "const selfwf = fs.existsSync(SELFWF) ? fs.readFileSync(SELFWF, 'utf8') : '';",
  "t" + "('SC1 注入断言——缺席引用物必被抓', selfwf.indexOf('x') >= 0, '');"
].join('\n');
const scA = censusGuardSource(SELF_A, reg).candidates;
t('D1 正对照：合成断言引用物确定缺席 → 探测器必产候选（' + scA.length + ' 命中）',
  scA.length === 1 && scA[0].slug === 'SC1' && scA[0].confidence === 'certain' && /definitely-missing-referent/.test(scA[0].missing[0]),
  JSON.stringify(scA));
const SELF_B = [
  "const SELFOK = join(here, '33-gate-registry.json');",
  "const selfok = fs.existsSync(SELFOK) ? fs.readFileSync(SELFOK, 'utf8') : '';",
  "t" + "('SC2 注入断言——引用物在位不得误报', selfok.indexOf('items') >= 0, '');"
].join('\n');
const scB = censusGuardSource(SELF_B, reg).candidates;
t('D2 负对照：引用物在位的合成断言 → 探测器零候选（不误报 PASS）', scB.length === 0, JSON.stringify(scB));
const SELF_C = [
  "const SELFM = join(here, '__vacuity-selfcheck__', 'also-missing.yml');",
  "t" + "('SC3 否定存在断言——断言缺席本体不属恒真', !fs.existsSync(SELFM), '');"
].join('\n');
const scC = censusGuardSource(SELF_C, reg).candidates;
t('D3 负对照：!existsSync 否定存在断言（缺席=断言语义本体）→ 豁免零候选', scC.length === 0, JSON.stringify(scC));
// SELF_D 字面量拼接规避 sealed() 静态 census 命中——合成源若裸写 sealed(' 会被 33-check G5 误计为真实发射点
const SELF_D = ["sea" + "led('SC4', 'ap-x', 'sealed 调用点豁免——已 disposition 不参评');"].join('\n');
const scDres = censusGuardSource(SELF_D, reg);
t('D4 负对照：sealed() 调用点豁免（不参评）→ 零候选', scDres.candidates.length === 0 && scDres.assertions.length === 1, '');

// ---------- E. 断言级 id 盘点 vs 63-assertion-inventory.json（偿 D-071 欠账） ----------
const invPath = join(HERE, '63-assertion-inventory.json');
let invFile = null;
try { invFile = JSON.parse(fs.readFileSync(invPath, 'utf8')); } catch (e) { invFile = null; }
const invDrift = [];
if (invFile && invFile.guards) {
  for (const g of Object.keys(inventory)) {
    const rec = invFile.guards[g + '-check'];
    if (!rec) { invDrift.push(g + ':inventory-missing'); continue; }
    if (rec.assertion_ids !== inventory[g].assertion_ids) invDrift.push(g + ':ids ' + rec.assertion_ids + '->' + inventory[g].assertion_ids);
    const wantStyles = (rec.call_styles || []).slice().sort();
    if (JSON.stringify(wantStyles) !== JSON.stringify(inventory[g].call_styles)) invDrift.push(g + ':styles ' + JSON.stringify(wantStyles) + '->' + JSON.stringify(inventory[g].call_styles));
  }
  for (const k of Object.keys(invFile.guards)) {
    const g = k.replace(/-check$/, '');
    if (!inventory[g]) invDrift.push(k + ':guard-file-missing');
  }
}
t('E1 断言级 id 盘点对账：live 解析 == 63-assertion-inventory.json（漂移→FAIL；regen=node reports/update-70-inventory.mjs）',
  !!invFile && invDrift.length === 0, invDrift.slice(0, 6).join(' '));

// ---------- F. manifest 存量披露（册内 candidate-* 条目逐条顶显——baseline 惯例） ----------
const stockListed = mEntries.filter(e => e.disposition === 'candidate-certain' || e.disposition === 'candidate-likely');
t('F1 册内存量与 census 一致（candidate-* 条目 ⇔ 检出集——簿记对账非裁定）',
  stockListed.every(e => stockCands.some(c => c.guard + ':' + c.slug === e.guard + ':' + e['assertion-slug'])) &&
  stockCands.every(c => stockListed.some(e => e.guard === c.guard && e['assertion-slug'] === c.slug)),
  'manifest=' + stockListed.length + ' census=' + stockCands.length);

console.log('');
console.log('VACUITY-CENSUS: ' + guardFiles.length + ' 守卫 / ' + totalAssertions + ' emit 调用点 / 候选 ' + liveCands.length + '（册内 ' + stockCands.length + '＋册外新增 ' + newCands.length + '＋deleted-复活 ' + resurrected.length + '）');
console.log((fail === 0 ? 'PASS' : 'FAIL') + ' ' + pass + '/' + (pass + fail));
process.exit(fail === 0 ? 0 : 1);
