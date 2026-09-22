// 73-check.mjs — #73 步3 双语 README canonical→derived 同步守卫（D-088 / D-087 / D-089）
// 断言面：A canonicalMarker＋owner 字段 → B 结构互等四集（heading 锚点/code block/链接目标/badge）=FAIL
//   → C sync 版本戳掉队=XFAIL·warn（非 FAIL——Opendray 教训：小修不逼假同步）＋owner 守卫配置
//   → D 诚实面（shields badge 白名单（CI 徽记=原生 actions badge 归 33-H4 互等钉）/无 .gif 引用/preview 印记双文件保留）
// 用法：node 73-check.mjs → 逐条 PASS/FAIL/XFAIL；exit 0=全 PASS 或仅 XFAIL，exit 1=有 FAIL
import fs from 'node:fs';
import crypto from 'node:crypto';
import { fileURLToPath } from 'node:url';
import { dirname, join } from 'node:path';

const HERE = dirname(fileURLToPath(import.meta.url));
const ROOT = join(HERE, '..', '..', '..');

// D-088④ owner 字段入守卫配置（zh-CN 跟进人；blume 无 owner 译文 17 天全灭教训）
const GUARD_CONFIG = {
  canonical: 'README.md',
  derived: 'README.zh-CN.md',
  owner: 'Xxx91n',
  syncStampRe: /<!--\s*sync:\s*([0-9a-f]{12})\s*-->/,
  hashLen: 12,
};

let pass = 0, fail = 0, xfail = 0;
const t = (name, ok, extra = '') => { console.log((ok ? 'PASS ' : 'FAIL ') + name + (extra ? ' | ' + extra : '')); ok ? pass++ : fail++; };
const x = (name, extra = '') => { console.log('XFAIL ' + name + (extra ? ' | ' + extra : '')); xfail++; };
const txt = (p) => fs.readFileSync(p, 'utf8');

const enPath = join(ROOT, GUARD_CONFIG.canonical);
const zhPath = join(ROOT, GUARD_CONFIG.derived);

// ---------- 解析器 ----------
function splitFences(src) {
  const lines = src.split('\n');
  const code = []; const prose = [];
  let inFence = false, cur = [];
  for (const l of lines) {
    if (/^\s*```/.test(l)) {
      if (inFence) { code.push(cur.join('\n')); cur = []; inFence = false; }
      else inFence = true;
      continue;
    }
    if (inFence) cur.push(l); else prose.push(l);
  }
  if (inFence) code.push(cur.join('\n'));
  return { code, prose: prose.join('\n') };
}
// ASCII-slug approximation: CJK chars collapse to '-'; only ASCII headings ever reach it (B1/B2 check EN/zh parity).
function ghSlug(s) {
  return s.trim().toLowerCase()
    .replace(/<[^>]+>/g, '')
    .replace(/\{#?[a-z0-9-]+\}\s*$/i, '')
    .replace(/[^\w\- ]/g, '')
    .replace(/\s+/g, '-');
}
function headings(prose) {
  return prose.split('\n').filter(l => /^#{1,6}\s/.test(l)).map(l => l.replace(/^#{1,6}\s+/, '').trim());
}
const collect = (set, re, s) => { for (const m of s.matchAll(re)) set.add(m[1]); };
function linkTargets(prose) {
  const set = new Set();
  collect(set, /\]\(([^)\s]+)\)/g, prose);
  collect(set, /<a\s+[^>]*href="([^"]+)"/g, prose);
  collect(set, /<img\s+[^>]*src="([^"]+)"/g, prose);
  return set;
}
function badgeSet(prose) {
  const set = new Set();
  collect(set, /<img\s+[^>]*src="(https:\/\/img\.shields\.io[^"]+)"/g, prose);
  collect(set, /!\[[^\]]*\]\((https:\/\/img\.shields\.io[^)\s]+)\)/g, prose);
  return set;
}
const eq = (a, b) => a.size === b.size && [...a].every(v => b.has(v));
const diff = (a, b) => [...a].filter(v => !b.has(v));

// ---------- A. 存在性 + canonicalMarker + owner ----------
const enExists = fs.existsSync(enPath), zhExists = fs.existsSync(zhPath);
t('A1 双文件在（canonical=README.md / derived=README.zh-CN.md）', enExists && zhExists);
const en = enExists ? txt(enPath) : '', zh = zhExists ? txt(zhPath) : '';
const zhLines = zh.split('\n');
const l1 = zhLines.find(l => l.trim().length > 0) || '';
t('A2 canonicalMarker 首行在（derived 首行声明 canonical 权威源——读者锚）',
  /<!--\s*canonical:\s*README\.md/.test(l1), l1.slice(0, 60));
t('A3 canonicalMarker 含 owner 字段且与守卫配置一致（D-088④——无 owner 译文全灭教训）',
  l1.includes('owner: ' + GUARD_CONFIG.owner) && GUARD_CONFIG.owner.length > 0,
  'owner=' + GUARD_CONFIG.owner);
const zhVisible = zh.replace(/<!--[\s\S]*?-->/g, '').split('\n').filter(l => l.trim().length > 0);
t('A4 derived 含可见译文警示（⚠ 横幅=英文为权威·不一致以英文版为准——剥注释后可见行命中，防注释糊弄——D-088① 读者锚）',
  /权威版本|以英文版为准/.test(zhVisible.slice(0, 8).join('\n')), zhVisible.slice(0, 2).join(' ').slice(0, 50));

// ---------- B. 结构互等四集（漂移=FAIL） ----------
const EN = splitFences(en), ZH = splitFences(zh);
const enSlugs = headings(EN.prose).map(ghSlug);
const zhAnchors = headings(ZH.prose).map(h => { const m = h.match(/\{#([a-z0-9-]+)\}\s*$/); return m ? m[1] : null; });
t('B1 heading 数互等（骨架互等——EN ' + enSlugs.length + ' / zh ' + zhAnchors.length + '）',
  enSlugs.length === zhAnchors.length && zhAnchors.every(a => a !== null),
  'missing-anchor=' + zhAnchors.filter(a => a === null).length);
t('B2 heading 锚点集逐位互等（zh {#english-id} 钉回 EN slug——锚点不译标题可译，MDN 教训）',
  enSlugs.length === zhAnchors.length && enSlugs.every((s, i) => s === zhAnchors[i]),
  enSlugs.map((s, i) => s === zhAnchors[i] ? '' : i + ':' + s + '!=' + zhAnchors[i]).filter(Boolean).join(','));
const enCode = EN.code.map(c => c.trim()).sort(), zhCode = ZH.code.map(c => c.trim()).sort();
t('B3 fenced code block 集互等（install 命令/mermaid/样例截片跨语言不变——EN ' + enCode.length + ' / zh ' + zhCode.length + '）',
  enCode.length === zhCode.length && enCode.every((c, i) => c === zhCode[i]));
const enLinks = new Set([...linkTargets(EN.prose)].filter(u => !u.includes('shields.io')));
const zhLinks = new Set([...linkTargets(ZH.prose)].filter(u => !u.includes('shields.io')));
t('B4 链接目标集互等（md/html/img 全形态——shield 徽章归 B5）',
  eq(enLinks, zhLinks), 'en-only:[' + diff(enLinks, zhLinks).join(',') + '] zh-only:[' + diff(zhLinks, enLinks).join(',') + ']');
const enBadges = badgeSet(EN.prose), zhBadges = badgeSet(ZH.prose);
t('B5 badge 集互等（shields URL 集合——honest badge 双文件同面）',
  eq(enBadges, zhBadges), 'en=' + enBadges.size + ' zh=' + zhBadges.size);

// ---------- C. sync 版本戳（掉队=XFAIL·warn 非 FAIL——Opendray advisory-only 先例） ----------
const stampM = zh.match(GUARD_CONFIG.syncStampRe);
t('C1 derived 含 sync 版本戳行（<!-- sync: <en-hash-12> --> 形制在）', !!stampM, stampM ? stampM[0] : 'missing');
const enHash = crypto.createHash('sha256').update(en, 'utf8').digest('hex').slice(0, GUARD_CONFIG.hashLen);
if (stampM && stampM[1] === enHash) {
  t('C2 sync 戳与 EN 内容指纹一致（fresh）', true, 'sync=' + stampM[1]);
} else {
  x('C2 sync 版本戳掉队（英文变而戳未 bump——warn 非 FAIL：小修不逼假同步，区分结构漂移与小修掉队）',
    'stamp=' + (stampM ? stampM[1] : 'none') + ' en=' + enHash);
}

// ---------- D. 诚实面（D-089：badge 只挂当下为真项/动图未拍不引用/preview 印记保留） ----------
const allBadgeUrls = [...enBadges, ...zhBadges];
t('D1 badge 白名单——shields 徽记只含 license/version/node/marketplace/status-preview 当下为真项（CI 徽记=GitHub 原生 actions badge 非 shields 族，occurred↔在场互等归 33-check H4；status-preview=preview 宣言区紧随徽记 D-092③，preview 态本身为真）',
  allBadgeUrls.every(u => /badge\/(license|version|node|marketplace|status-preview)-/.test(u)) && !allBadgeUrls.some(u => /workflows|actions|build|ci-/i.test(u)),
  'badges=' + allBadgeUrls.length);
t('D2 双文件无 .gif 引用（motion GIF=listing-material-freeze 触发项，未拍前不得引用不存在的动图——D-089②⑤）',
  !/\.gif/i.test(en) && !/\.gif/i.test(zh), '');
t('D3 preview 诚实印记双文件保留（Not yet in preview + ⚠ 标记——门面化不加宣称）',
  en.includes('Not yet in preview') && zh.includes('Not yet in preview') && en.includes('\u26a0') && zh.includes('\u26a0'), '');

console.log('');
console.log((fail === 0 ? 'PASS' : 'FAIL') + ' ' + pass + '/' + (pass + fail) + (xfail ? '（XFAIL ' + xfail + ' 条 warn 非 FAIL）' : ''));
process.exit(fail === 0 ? 0 : 1);
