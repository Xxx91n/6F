// d179-check.mjs — D-179 守卫伴生再生确定性守卫（种子化＋volatile-fields 键级豁免枚举＋同输入两跑零 diff 自检）
// A组 豁免清单建制与三硬边界：
//   A1 volatile-fields.json schema（version/decision_ref/keys 非空串数组/derived_signal_banned/enumerated_artifacts/frozen_exclusion 齐备）
//   A2 键级可达性棘轮：keys 逐键须达 enumerated_artifacts 键空间（嵌套对象+JSONL 行）——死项即红（75a-S1/D-154③ 同构）
//   A3 派生信号族显式禁入：keys ∩ derived_signal_banned=∅＋banned 逐键实达工件键空间（反空虚——禁令非空转）
//   A4 frozen 禁区：enumerated_artifacts ∩ known-red-manifest frozen_evidence_packs 键集=∅（D-171/D-172②）
//   A5 熵源钉：受种子化约束的生成器源码不再含墙钟调用（new Date(/Date.now(——回潮即红）
// B组 同输入两跑零 diff（D-179③——Bazel null-build 同构）：
//   B1 56-heldout-eval 原位两跑字节等值；B2 48-micro-a-preview --golden 双 tmpdir 两跑全件 sha256 对账等值
// 语义边界（D-179⑧）：golden 断言语义/frozen 钉值/批2-β 触发器不动；git 派生信号（prereg_commit/head_sha）不入豁免面
// 用法：node d179-check.mjs → PASS/FAIL；exit 0=全绿
import { readdirSync, readFileSync, existsSync, mkdtempSync, rmSync } from 'node:fs';
import { spawnSync } from 'node:child_process';
import { createHash } from 'node:crypto';
import { fileURLToPath } from 'node:url';
import { dirname, join } from 'node:path';
import { tmpdir } from 'node:os';

const TIER = 'portable';
const PROTECTED_SURFACE = 'D-179 守卫伴生再生确定性（生成器种子化＋volatile-fields 键级豁免枚举＋同输入两跑零 diff 自检）';

const HERE = dirname(fileURLToPath(import.meta.url));
const NL = String.fromCharCode(10);
let pass = 0, fail = 0;
const t = (name, ok, extra) => { console.log((ok ? 'PASS ' : 'FAIL ') + name + (extra ? ' | ' + extra : '')); ok ? pass++ : fail++; };
const readText = (p) => readFileSync(p, 'utf8');
const shaFile = (p) => createHash('sha256').update(readFileSync(p)).digest('hex');

// ---------- A. volatile-fields 豁免清单建制 ----------
const VF_PATH = join(HERE, 'volatile-fields.json');
const vfRaw = existsSync(VF_PATH) ? readText(VF_PATH) : null;
const vf = vfRaw ? JSON.parse(vfRaw) : null;
const vfOk = !!vf && vf.version === 1 && typeof vf.decision_ref === 'string'
  && Array.isArray(vf.keys) && vf.keys.length > 0 && vf.keys.every(k => typeof k === 'string')
  && Array.isArray(vf.derived_signal_banned) && vf.derived_signal_banned.length > 0
  && Array.isArray(vf.enumerated_artifacts) && vf.enumerated_artifacts.length > 0
  && typeof vf.frozen_exclusion === 'string' && vf.frozen_exclusion.length > 0;
t('A1 volatile-fields.json 建制 schema（version/decision_ref/keys/derived_signal_banned/enumerated_artifacts/frozen_exclusion 齐备）', vfOk);

// 工件键空间采集（JSON 对象深键遍历＋JSONL 逐行）
function keySpace(v, acc) {
  if (v && typeof v === 'object') {
    if (Array.isArray(v)) { v.forEach(x => keySpace(x, acc)); }
    else { for (const k of Object.keys(v)) { acc.add(k); keySpace(v[k], acc); } }
  }
  return acc;
}
function artifactKeys(p) {
  const acc = new Set();
  const raw = readText(p);
  if (p.slice(-6) === '.jsonl') { raw.split(NL).filter(x => x.trim()).forEach(l => { try { keySpace(JSON.parse(l), acc); } catch (_) { /* 非 JSON 行跳过 */ } }); }
  else { keySpace(JSON.parse(raw), acc); }
  return acc;
}
const ks = new Set();
const artifactMissing = [];
for (const a of (vf && vf.enumerated_artifacts) || []) {
  const ap = join(HERE, a);
  if (!existsSync(ap)) { artifactMissing.push(a); continue; }
  for (const k of artifactKeys(ap)) ks.add(k);
}
const deadKeys = vf ? vf.keys.filter(k => !ks.has(k)) : [];
t('A2 键级可达性棘轮：keys 逐键达 enumerated_artifacts 键空间（死项即红，键空间=' + ks.size + '）', deadKeys.length === 0 && artifactMissing.length === 0,
  (deadKeys.length ? 'dead=' + deadKeys.join(',') : '') + (artifactMissing.length ? ' missing=' + artifactMissing.join(',') : ''));

const bannedSet = new Set(vf ? vf.derived_signal_banned : []);
const leak = vf ? vf.keys.filter(k => bannedSet.has(k)) : [];
const deadBanned = vf ? vf.derived_signal_banned.filter(k => !ks.has(k)) : [];
t('A3 派生信号族显式禁入：keys∩banned=∅ 且 banned 逐键实达工件键空间（反空虚校验）', leak.length === 0 && deadBanned.length === 0,
  (leak.length ? 'leak=' + leak.join(',') : '') + (deadBanned.length ? ' deadban=' + deadBanned.join(',') : ''));

const km = JSON.parse(readText(join(HERE, 'known-red-manifest.json')));
const frozen = new Set((km.frozen_evidence_packs || []).flatMap(pk => Object.keys(pk.artifacts || {})));
const frozenHit = vf ? vf.enumerated_artifacts.filter(a => frozen.has(a)) : [];
t('A4 frozen 禁区：enumerated_artifacts ∩ frozen_evidence_packs=∅（D-171/D-172②，packs=' + frozen.size + '）', frozen.size > 0 && frozenHit.length === 0, frozenHit.join(','));

// A5 熵源钉：生成器源码禁回潮墙钟调用（剥注释面判）
const CLOCK = /new\s+Date\s*\(|Date\.now\s*\(/;
const genFiles = ['48-micro-a-preview.mjs', '56-checker-heldout-eval.mjs'];
const clockHits = [];
for (const g of genFiles) {
  readText(join(HERE, g)).split(NL).forEach((l, i) => {
    const code = l.replace(/\/\/.*$/, '');
    if (code.match(CLOCK)) clockHits.push(g + ':' + (i + 1));
  });
}
t('A5 熵源钉：种子化生成器源码无 new Date(/Date.now( 墙钟调用（回潮即红）', clockHits.length === 0, clockHits.join(','));

// ---------- B. 同输入两跑零 diff ----------
const runNode = (script, args) => spawnSync('node', [script].concat(args || []), { encoding: 'utf8' });

// B1：56-heldout-eval 原位两跑（确定性件同输入=净零写——字节等值）
const EVAL_JSON = join(HERE, '56-heldout-eval.json');
const e1 = runNode(join(HERE, '56-checker-heldout-eval.mjs'));
const h1 = existsSync(EVAL_JSON) ? shaFile(EVAL_JSON) : 'missing';
const e2 = runNode(join(HERE, '56-checker-heldout-eval.mjs'));
const h2 = existsSync(EVAL_JSON) ? shaFile(EVAL_JSON) : 'missing';
t('B1 56-heldout-eval 同输入两跑零 diff（原位回写等值）', e1.status === 0 && e2.status === 0 && h1 === h2 && h1 !== 'missing',
  'rc=' + e1.status + '/' + e2.status + ' sha=' + h1.slice(0, 12) + '/' + h2.slice(0, 12));

// B2：48-micro-a-preview --golden 双 tmpdir 两跑全件对账
const snapDir = (d) => { const m = {}; for (const f of readdirSync(d).sort()) { m[f] = createHash('sha256').update(readFileSync(join(d, f))).digest('hex'); } return m; };
const d1 = mkdtempSync(join(tmpdir(), 'd179-golden-a-'));
const d2 = mkdtempSync(join(tmpdir(), 'd179-golden-b-'));
let b2ok = false, b2extra = '';
try {
  const PV = join(HERE, '48-micro-a-preview.mjs');
  const g1 = runNode(PV, ['--golden', '--out', d1]);
  const g2 = runNode(PV, ['--golden', '--out', d2]);
  const m1 = snapDir(d1), m2 = snapDir(d2);
  const names = Object.keys(m1);
  const diffFiles = names.filter(f => m1[f] !== m2[f]).concat(Object.keys(m2).filter(f => !Object.prototype.hasOwnProperty.call(m1, f)));
  b2ok = g1.status === 0 && g2.status === 0 && names.length > 0 && diffFiles.length === 0;
  b2extra = 'rc=' + g1.status + '/' + g2.status + ' files=' + names.length + (diffFiles.length ? ' diff=' + diffFiles.join(',') : '');
  if (g1.status !== 0) b2extra += ' stderr1=' + (g1.stderr || '').split(NL).slice(0, 3).join(' ');
} finally {
  rmSync(d1, { recursive: true, force: true }); rmSync(d2, { recursive: true, force: true });
}
t('B2 48-micro-a-preview --golden 同输入双 tmpdir 两跑零 diff（全件 sha256 对账）', b2ok, b2extra);

console.log('---');
console.log((fail === 0 ? 'PASS' : 'FAIL') + ' ' + pass + '/' + (pass + fail));
process.exit(fail === 0 ? 0 : 1);
