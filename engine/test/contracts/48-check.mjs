// 48-check.mjs — #48 Micro-A preview 检查脚本（R8-02 / A-056 / D-049）
// 查什么：A 管道+判据文件+模块导出契约 → B golden 实跑＋十二件逐字节对账（cassette 回放，离线；漂移即红 tracker #88）→ C 真跑工件齐备
//   → D 报告语义（4 PR supported＋拒绝件 unsupported＋所含字段∩骨架机械断言＋披露四字段）→ E 事件闭环+文档回写
//   → G 校对样本台账五字段＋正反对照（spec §R8-2，tracker #241）→ F token 泄漏+BOM
// 纪律：只读断言＋golden 子进程（cassette 离线回放零网络）；真跑工件为已落盘实证不重复实跑；exit 0 + PASS N/N 为绿。
import { readFileSync, existsSync, readdirSync } from 'node:fs';
import { spawnSync } from 'node:child_process';
import { fileURLToPath, pathToFileURL } from 'node:url';
import { dirname, join } from 'node:path';
import { mkdtempSync, copyFileSync, writeFileSync, rmSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { siblingPath } from './_lib/env-contract.mjs';
// guard-meta（D-159②/D-160③ 自声明——未声明=红）
const TIER = 'portable';
const PROTECTED_SURFACE = '#48 Micro-A preview 守卫（R8-02 / A-056 / D-049）';


const HERE = dirname(fileURLToPath(import.meta.url));
const REPO = join(HERE, '..', '..', '..');
const FX = join(REPO, 'engine', 'test', 'fixtures', 'contracts');
const PIPE = join(HERE, '48-micro-a-preview.mjs');
const CRIT = join(REPO,'engine','test','fixtures','contracts','48-micro-a-criteria.md');
// golden 在册十二件唯一清单（B4 查在场／B5 查对账／B6·B7·B11 查篡改／B8 三集合相等／B9·B10 查全值／B12·B13 查宽度，都引这一份——禁各处再抄一份，tracker #88）
const GOLDEN_PREFIX = '48-micro-a-golden-';
const GOLDEN_NAMES = [
  '48-micro-a-golden-env-manager-pr64.md',
  '48-micro-a-golden-env-manager-pr64.json',
  '48-micro-a-golden-env-manager-pr64.diff',
  '48-micro-a-golden-env-manager-pr51.md',
  '48-micro-a-golden-env-manager-pr51.json',
  '48-micro-a-golden-goose-duck-agent-refusal.md',
  '48-micro-a-golden-goose-duck-agent-refusal.json',
  '48-micro-a-golden-env-manager-facts.jsonl',
  '48-micro-a-golden-goose-duck-agent-facts.jsonl',
  '48-micro-a-golden-gate-probes.json',
  '48-micro-a-golden-env-manager-measurements.json',
  '48-micro-a-golden-assertions.json'
];

let pass = 0, fail = 0;
function t(name, ok, detail) { if (ok) { pass++; console.log('PASS ' + name); } else { fail++; console.log('FAIL ' + name + (detail ? ' :: ' + detail : '')); } }
function txt(p) { return readFileSync(p, 'utf8'); }
function noBom(p) { const b = readFileSync(p); return !(b[0] === 0xEF && b[1] === 0xBB && b[2] === 0xBF); }
// 坏掉的 JSON 不许把整条检查抛穿：未捕获的异常会让「有名字的判失败」退化成没名字的 status=1（跟 tracker #72 那次一个毛病）。
// 能 parse 但形状不对（{}、[]、数字、无 checks）同样不许在下游取属性时抛，故 B2/B3 另用 Array.isArray 接住。
/** 安全地读 JSON：文件不在或者内容坏了就返回 null，不抛穿检查（跟 tracker #72 那次一个毛病）。 */
function safeJson(p) { try { return existsSync(p) ? JSON.parse(txt(p)) : null; } catch (e) { return null; } }

// ---------- A. 管道 + 判据 + 导出契约 ----------
t('A1 48-micro-a-preview.mjs 在', existsSync(PIPE));
t('A2 48-micro-a-criteria.md 在（判据先入库）', existsSync(CRIT));
const pipe = existsSync(PIPE) ? txt(PIPE) : '';
const crit = existsSync(CRIT) ? txt(CRIT) : '';
t('A3 判据集六条全在（PC-1/TC-1/TC-2/TC-3/TC-4/NC-1）', ['PC-1', 'TC-1', 'TC-2', 'TC-3', 'TC-4', 'NC-1'].every(function (c) { return crit.indexOf(c) >= 0; }));
t('A4 判据拒语义+通道条件（api NULL_STATS 契约注记）', crit.indexOf('NULL_STATS') >= 0 && crit.indexOf('merged=0') >= 0);
const MOD = await import(pathToFileURL(PIPE).href);
t('A5 导出 MICRO_A_SLICE_FIELDS ≥20 字段', Array.isArray(MOD.MICRO_A_SLICE_FIELDS) && MOD.MICRO_A_SLICE_FIELDS.length >= 20, String((MOD.MICRO_A_SLICE_FIELDS || []).length));
t('A6 导出 skeletonIntersectionReport 函数', typeof MOD.skeletonIntersectionReport === 'function');
t('A7 管道含三形态+真负例+漂移注记', pipe.indexOf('release-please') >= 0 && pipe.indexOf('dependabot') >= 0 && pipe.indexOf('goose-duck-agent') >= 0 && pipe.indexOf('anysearch-cli') >= 0);
t('A8 走主路还是走回退，都有标注字段（credential_strategy + diff_channel 入字段）', MOD.MICRO_A_SLICE_FIELDS.indexOf('credential_strategy') >= 0 && MOD.MICRO_A_SLICE_FIELDS.indexOf('diff_channel') >= 0);

const MA = await import(pathToFileURL(join(REPO, 'engine', 'dist', 'audit', 'micro-a.js')).href);
/** 只比较名册字段；生成器把 pins 叫作 prs。 */
function samePilots(pilots, roster) {
  const actual = pilots.map(function (p) { return { name: p.name, owner: p.owner, repo: p.repo, pins: p.prs }; });
  const expected = roster.map(function (p) { return { name: p.name, owner: p.owner, repo: p.repo, pins: p.pins }; });
  return JSON.stringify(actual) === JSON.stringify(expected);
}
t('A9 生成器的仓和 PR 清单与引擎名册一致', Array.isArray(MOD.PILOTS) && samePilots(MOD.PILOTS, MA.MICRO_A_PILOTS));

// 只改本进程里的名册，再重新加载生成器；跑完恢复，不碰源码或存档。
const savedPilots = MA.MICRO_A_PILOTS.slice();
let changedRosterOK = false, changedGoldenOK = false, missingPrOK = false, missingRepoOK = false, pathsOK = false, strictPathOK = false, rosterError = '';
try {
  const pins = MA.MICRO_A_GOLDEN_PRS.map(function (p, i) { return { n: p.n, form: '测试形态-' + i }; }).reverse();
  const changed = [
    { name: 'env-manager', owner: 'test-owner', repo: 'test-repo', pins: pins },
    { name: 'new-roster-repo', owner: 'test-owner', repo: 'new-roster-repo', pins: [{ n: 7, form: 'human' }] }
  ];
  MA.MICRO_A_PILOTS.splice(0, MA.MICRO_A_PILOTS.length, ...changed);
  const altered = await import(pathToFileURL(PIPE).href + '?roster-test');
  changedRosterOK = samePilots(altered.PILOTS, changed) && !samePilots(MOD.PILOTS, changed);
  const newTarget = altered.realPilot(altered.PILOTS[1]);
  const inheritedName = altered.realPilot({ name: 'constructor', owner: 'test-owner', repo: 'constructor', prs: [] });
  pathsOK = newTarget.root === null && newTarget.repo === changed[1].repo && newTarget.prs === changed[1].pins && inheritedName.root === null;
  try { siblingPath(changed[1].name); } catch (e) { strictPathOK = String(e.message).includes('unknown sibling repo'); }
  const target = altered.goldenPilot();
  const expectedPrs = MA.MICRO_A_GOLDEN_PRS.map(function (p) { return pins.find(function (pin) { return pin.n === p.n; }); });
  changedGoldenOK = target.name === changed[0].name && target.owner === changed[0].owner && target.repo === changed[0].repo && target.root === null && JSON.stringify(target.prs) === JSON.stringify(expectedPrs);
  const removed = pins.shift();
  try { altered.goldenPilot(); } catch (e) { missingPrOK = !!removed && String(e.message).includes('env-manager#' + removed.n); }
  altered.PILOTS.splice(0, 1);
  try { altered.goldenPilot(); } catch (e) { missingRepoOK = String(e.message).includes('样本仓 env-manager'); }
} catch (e) {
  rosterError = String(e && e.message ? e.message : e);
} finally {
  MA.MICRO_A_PILOTS.splice(0, MA.MICRO_A_PILOTS.length, ...savedPilots);
}
t('A10 名册增删或修改后，生成器跟着变', changedRosterOK, rosterError);
t('A11 golden 回放也从名册取仓和 PR 形态', changedGoldenOK, rosterError);
t('A12 golden 所需 PR 不在名册时明确报错', missingPrOK, rosterError);
t('A13 golden 所需仓不在名册时明确报错', missingRepoOK, rosterError);
t('A14 新仓没有本地路径时走托管接口', pathsOK, rosterError);
t('A15 其他调用方仍须先登记本地路径', strictPathOK, rosterError);

// 仓主或仓名变了，不能继续把旧的本地仓当成新仓。
const originRepo = mkdtempSync(join(tmpdir(), '48-pilot-origin-'));
let originOK = false, localOriginOK = false, remoteOriginOK = false, originError = '';
try {
  const git = function (args) {
    const r = spawnSync('git', args, { encoding: 'utf8' });
    if (r.status !== 0) { throw new Error(r.stderr || String(r.error || r.status)); }
  };
  git(['init', '--quiet', '--bare', '--initial-branch=fixture', originRepo]);
  git(['-C', originRepo, 'remote', 'add', 'origin', 'https://github.com/Xxx91n/env-manager.git']);
  const pilot = { name: 'env-manager', owner: 'xxx91n', repo: 'ENV-MANAGER', prs: [] };
  const matched = MOD.realPilot(pilot, originRepo);
  const changedOwner = MOD.realPilot({ ...pilot, owner: 'other-owner' }, originRepo);
  const changedRepo = MOD.realPilot({ ...pilot, repo: 'other-repo' }, originRepo);
  git(['-C', originRepo, 'remote', 'set-url', 'origin', 'Xxx91n/env-manager']);
  const localOrigin = MOD.realPilot(pilot, originRepo);
  git(['-C', originRepo, 'remote', 'set-url', 'origin', 'git@github.com:Xxx91n/env-manager.git']);
  const sshOrigin = MOD.realPilot(pilot, originRepo);
  git(['-C', originRepo, 'remote', 'set-url', 'origin', 'https://github.com.example/Xxx91n/env-manager']);
  const otherHostOrigin = MOD.realPilot(pilot, originRepo);
  git(['-C', originRepo, 'remote', 'remove', 'origin']);
  const noOrigin = MOD.realPilot(pilot, originRepo);
  originOK = matched.root === originRepo && changedOwner.root === null && changedRepo.root === null && noOrigin.root === null;
  localOriginOK = localOrigin.root === null;
  remoteOriginOK = sshOrigin.root === originRepo && otherHostOrigin.root === null;
} catch (e) {
  originError = String(e && e.message ? e.message : e);
} finally {
  rmSync(originRepo, { recursive: true, force: true });
}
t('A16 本地仓须与名册一致，否则走托管接口', originOK, originError);
t('A17 相对路径不能当 GitHub origin', localOriginOK, originError);
t('A18 GitHub SSH 地址可用，其他主机走托管接口', remoteOriginOK, originError);

// ---------- B. golden 实跑（cassette 离线回放） ----------
const GOLDEN_OUT = mkdtempSync(join(tmpdir(), '48-golden-'));
// 种子明确设为 0（＝deterministicRunAt 的默认 epoch）：对账不该被外部 SOURCE_DATE_EPOCH 改写——
// 否则同一份存档在别人设了该变量的环境里无故判失败。生成器保留明确种子能力，本检查只是不继承它。
const gr = spawnSync('node', [PIPE, '--golden', '--out', GOLDEN_OUT], { cwd: REPO, encoding: 'utf8', timeout: 120000, env: Object.assign({}, process.env, { SOURCE_DATE_EPOCH: '0' }) });
const gout = (gr.stdout || '') + (gr.stderr || '');

t('B1 --golden 实跑 exit 0', gr.status === 0, gout.slice(-300));
const gass = safeJson(join(FX, '48-micro-a-golden-assertions.json'));
t('B2 golden 断言文件 all_pass=true', gass !== null && gass.all_pass === true);
t('B3 golden 断言 ≥10 条且全过', gass !== null && Array.isArray(gass.checks) && gass.checks.length >= 10 && gass.checks.every(function (c) { return c.pass; }), gass === null ? 'absent' : (!Array.isArray(gass.checks) ? 'checks 非数组' : String(gass.checks.length)));
t('B4 golden 工件齐备（在册十二件全在场——含 pr64.diff 与 assertions）', GOLDEN_NAMES.every(function (f) { return existsSync(join(FX, f)); }), GOLDEN_NAMES.filter(function (f) { return !existsSync(join(FX, f)); }).join(','));

// ---------- B5~B12 golden 逐字节对账（tracker #88；形制取 golden-ci.yml 的「重渲染＋逐字节 diff」纪律 D-030③） ----------
// B1 已把十二件现跑进 GOLDEN_OUT，此前只判 exit 0 即弃——入库件手改或引擎渲染变更都不判失败（实证：tracker #114
// 的引文转义修复悄悄漂了三件 .md，而 48-check 照旧 PASS 40/40）。对账就是拿入库目录比现跑目录，CI 不回写：
// 红了由人重跑 --golden 随 PR 提交，golden 更新只走审查。
// 对账是全字节的：prereg_commit 的锚宽也一并比，因为锚值会被算进 receipt_id／chain_hash／mark，
// 放过锚值等于放过那三列。跨环境可复算由生成器在 --golden 下取全值 SHA 定长截取保证，本文件只核一遍宽度没抖（B12）。
// Design: 存档宽度须与现跑一致，身份（不是宽度）另有 B9 全值校验 — spec §R9-1
const GEN = await import(pathToFileURL(join(REPO, 'engine', 'dist', 'report', 'generate.js')).href);
/**
 * 逐字节对账：把 baseDir 里在册的那些件，跟 otherDir 里同名的件按字节比，返回对不上的清单（缺席的也算）。
 * @param {string} baseDir 拿来当对照基准的那一份
 * @param {string} otherDir 跟它比的那一份
 * @param {string[]} names 在册件名（唯一清单 GOLDEN_NAMES）
 * @returns {{name: string, why: string}[]} 空数组＝十二件全等
 */
function goldenDrift(baseDir, otherDir, names) {
  const bad = [];
  for (const n of names) {
    const a = join(baseDir, n); const b = join(otherDir, n);
    let why = null;
    if (!existsSync(a)) { why = '基准缺席'; }
    else if (!existsSync(b)) { why = '对侧缺席'; }
    else if (!readFileSync(a).equals(readFileSync(b))) { why = '字节不等'; }
    if (why) { bad.push({ name: n, why: why }); }
  }
  return bad;
}
/** 把漂移清单压成一行可读明细（件名＋原因），供 FAIL 行打印。 */
function driftText(bad) { return bad.map(function (d) { return d.name + '（' + d.why + '）'; }).join(' '); }
const REGEN_CMD = 'node engine/test/contracts/48-micro-a-preview.mjs --golden --out engine/test/fixtures/contracts';
const driftB5 = goldenDrift(FX, GOLDEN_OUT, GOLDEN_NAMES);
t('B5 golden 逐字节对账十二件（现跑 vs 入库，漂移即红）', driftB5.length === 0, driftB5.length ? driftText(driftB5) + ' → 重跑 ' + REGEN_CMD + ' 随 PR 提交' : '');

// 对照（tracker #88 AC②）：这道判定自己必须被判定——红侧与绿侧都不得是空集、永远通过（tracker #29 规则）。
// 绿侧由 B5∧B8 承担（十二件真比对零漂移，＋三集合相等固定住「比对集非空」），此处只补必红的正对照。
const TAMPER_DIRS = [];
/**
 * 复制现跑十二件到临时目录，再篡改其中一件，供这道正对照证明检查真能判出来。
 * 源件不在的时候不抛错，返回一份残缺的副本，交给下游去判失败（跟 tracker #72 那次一个毛病）。
 * @param {string} name 要篡改的在册件名
 * @param {(text: string) => string} mutate 就地改写该件正文
 * @returns {string} 临时目录（已登记进 TAMPER_DIRS 待清理）
 */
function tamperedCopy(name, mutate) {
  const dir = mkdtempSync(join(tmpdir(), '48-tamper-'));
  TAMPER_DIRS.push(dir);
  for (const n of GOLDEN_NAMES) {
    const src = join(GOLDEN_OUT, n);
    if (existsSync(src)) { copyFileSync(src, join(dir, n)); }
  }
  const p = join(dir, name);
  // B1 没产出那一件的时候，这里不许抛 ENOENT 把整条检查拖垮——照常返回残缺的副本，让下游的正对照判失败，并留下看得懂的原因（跟 tracker #72 那次一个毛病）
  if (!existsSync(p)) { return dir; }
  writeFileSync(p, mutate(readFileSync(p, 'utf8')), 'utf8');
  return dir;
}
// 篡改类的统一写法：复制现跑目录 → 改一件 → 交回同一条对账。这四条都用它，免得每加一条就再抄一遍三步
/** 篡改类的统一写法：复制 → 改一件 → 交回 goldenDrift，返回漂移清单。 */
function driftOfTamper(name, mutate) { return goldenDrift(GOLDEN_OUT, tamperedCopy(name, mutate), GOLDEN_NAMES); }
const TAM_REFUSAL_MD = '48-micro-a-golden-goose-duck-agent-refusal.md';
const driftRefusal = driftOfTamper(TAM_REFUSAL_MD, function (s) { return s.split('无托管 PR 面').join('托管 PR 面齐备'); });
t('B6 正对照：拒绝件 .md 语义措辞篡改 → 恰该件判失败（不误伤其余十一件）', driftRefusal.length === 1 && driftRefusal[0].name === TAM_REFUSAL_MD, driftText(driftRefusal));
const TAM_PR64_JSON = '48-micro-a-golden-env-manager-pr64.json';
const driftPr64 = driftOfTamper(TAM_PR64_JSON, function (s) { return s.replace('"overall_verdict": "supported"', '"overall_verdict": "insufficient"'); });
t('B7 正对照：pr64.json overall_verdict 篡改 → 恰该件判失败（裁决面篡改必失败）', driftPr64.length === 1 && driftPr64[0].name === TAM_PR64_JSON, driftText(driftPr64));
// 三集合相等：清单/入库/现跑三集合必须同款同名——清单手改缩编、生成器少写或多写都在此当场红（空集永远通过的最后一道）
const setRepo = readdirSync(FX).filter(function (f) { return f.indexOf(GOLDEN_PREFIX) === 0; }).sort().join('|');
const setRegen = readdirSync(GOLDEN_OUT).filter(function (f) { return f.indexOf(GOLDEN_PREFIX) === 0; }).sort().join('|');
const setListed = GOLDEN_NAMES.slice().sort().join('|');
t('B8 三份清单必须相等：清单＝入库＝现跑且各恰十二件', setListed === setRepo && setListed === setRegen && GOLDEN_NAMES.length === 12, 'listed=' + setListed.split('|').length + ' repo=' + setRepo.split('|').length + ' regen=' + setRegen.split('|').length + (setRepo !== setListed ? ' repo∉清单:' + setRepo : '') + (setRegen !== setListed ? ' regen∉清单:' + setRegen : ''));
// ---------- prereg_commit 双侧全值校验（tracker #88 AC③） ----------
// 形制判别复用产品里只写一处的 classifyPreregAnchor（三形态规则归 spec §R9-1，检查脚本不另立第二套；
// 形制本身能不能解析由 85-check A17 与 micro-a.test S 组管，本次不重扫）。本次只补产品面管不着的那一档：
// 存档侧与现跑两侧的短写都必须指向**那枚判据锚**——全值走 log --format=%H 取，再前缀全值校验；
// 不走 rev-parse --verify：`%h` 短写不是可解析 rev，喂进去只会报出假因。
const prPr = spawnSync('git', ['-C', REPO, 'log', '-1', '--format=%H', '--', 'engine/test/fixtures/contracts/48-micro-a-criteria.md'], { encoding: 'utf8', timeout: 60000 });
const preregFull = (prPr.stdout || '').trim();
/**
 * 扫一个目录里的 prereg_commit 载体：形制交产品 classifyPreregAnchor 判，
 * 身份要求是本检出判据锚全值（log --format=%H）的前缀。
 * @param {string} dir 待扫目录（入库或现跑）
 * @returns {{carriers: {name: string, v: string}[], bad: string[]}} 载体清单＋违规明细
 */
function preregOffenders(dir) {
  const carriers = [], bad = [];
  for (const n of GOLDEN_NAMES) {
    if (!existsSync(join(dir, n))) { continue; }
    const m = readFileSync(join(dir, n), 'utf8').match(/"prereg_commit":\s*"([^"]*)"/);
    if (!m) { continue; }
    carriers.push({ name: n, v: m[1] });
    const form = GEN.classifyPreregAnchor(m[1]);
    if (form !== 'commit') { bad.push(n + '（形制 ' + form + '）'); }
    else if (!/^[0-9a-f]{40}$/.test(preregFull) || preregFull.indexOf(m[1]) !== 0) { bad.push(n + '（短写 ' + m[1] + ' 非判据锚全值前缀）'); }
  }
  return { carriers: carriers, bad: bad };
}
// 双侧全值校验：逐字节面只能证两侧一致，证不了「一致地指错了锚」——生成器的锚若退回 rev-parse HEAD
// （D-179① 原缺陷）且有人跟着再生存档，字节全等而锚已飘到别的 commit，故两侧都按全值校验。
const scanRepo = preregOffenders(FX);
const scanRegen = preregOffenders(GOLDEN_OUT);
t('B9 prereg_commit 双侧全值校验（入库与现跑都须指到判据锚）', scanRepo.carriers.length > 0 && scanRegen.carriers.length > 0 && scanRepo.bad.length === 0 && scanRegen.bad.length === 0, 'full=' + (preregFull.slice(0, 12) || 'ABSENT') + ' carriers=' + scanRepo.carriers.length + '/' + scanRegen.carriers.length + ' 入库违规=' + scanRepo.bad.join(',') + ' 现跑违规=' + scanRegen.bad.join(','));
// 全值校验这项自己也要证明它真在检：在册真短写末位翻成另一枚 hex（形制仍合法、宽度不变的异值）写回副本走同一条扫描，必须点名该件——
// 否则「形制合法、也解析得到、但不是那枚锚」这一类无人判失败（tracker #100 立法要杀的正是要窄这一档）。
const preregPerturbed = scanRepo.carriers.length > 0 ? scanRepo.carriers[0].v.slice(0, -1) + (scanRepo.carriers[0].v.slice(-1) === '0' ? '1' : '0') : '';
const tamAnchorDir = tamperedCopy(TAM_PR64_JSON, function (s) { return s.replace(/("prereg_commit":\s*")[0-9a-f]{4,40}(")/, '$1' + preregPerturbed + '$2'); });
const scanTamper = preregOffenders(tamAnchorDir);
// 差分断言而非绝对计数：只许「篡改多出一件」，不许别的件的判定被这次篡改带偏。绝对计数在现跑侧本身已违规时
// 因为出错而红，那种红说明不了这道判定真在检，只会把 B9 的问题再重复一遍。
const tamperAdded = scanTamper.bad.filter(function (x) { return scanRegen.bad.indexOf(x) < 0; });
t('B10 正对照：锚短写改同宽异值 → 恰该件多判失败一件（不留洞）', preregPerturbed.length >= 4 && tamperAdded.length === 1 && tamperAdded[0].indexOf(TAM_PR64_JSON) === 0, 'perturbed=' + preregPerturbed + ' 新增=' + tamperAdded.join(','));
// 等长篡改对照：B6／B7 改的都动了长度，只能证「长度变了会红」；comparator 若失效成只比长度，这两条照样绿。
// 故补一条同长度篡改：从现跑件就地取 diff_bytes 再翻最后一位（不写死数值——真跑读数改了也不会把这条对照变成假红），
// 并先固定住「两侧文件长度确实相等」：长度一变这条对照就失去意义，前提那条当场红（同 tracker #29 对永远通过白跑一趟的处理）。
const archivedBytes = (existsSync(join(GOLDEN_OUT, TAM_PR64_JSON)) ? readFileSync(join(GOLDEN_OUT, TAM_PR64_JSON), 'utf8').match(/"diff_bytes": (\d+)/) : null) || [];
const flippedBytes = String(archivedBytes[1] || '').replace(/\d$/, function (d) { return String((Number(d) + 1) % 10); });
const tamSameDir = tamperedCopy(TAM_PR64_JSON, function (s) { return s.replace('"diff_bytes": ' + archivedBytes[1], '"diff_bytes": ' + flippedBytes); });
const driftSame = goldenDrift(GOLDEN_OUT, tamSameDir, GOLDEN_NAMES);
const sameLenPremise = flippedBytes !== '' && flippedBytes !== archivedBytes[1] && flippedBytes.length === String(archivedBytes[1]).length && existsSync(join(tamSameDir, TAM_PR64_JSON)) && readFileSync(join(GOLDEN_OUT, TAM_PR64_JSON)).length === readFileSync(join(tamSameDir, TAM_PR64_JSON)).length;
t('B11 正对照：等长篡改（diff_bytes ' + (archivedBytes[1] || '?') + '→' + (flippedBytes || '?') + '）必判失败（禁失效成只比长度）', sameLenPremise && driftSame.length === 1 && driftSame[0].name === TAM_PR64_JSON, '前提=' + sameLenPremise + ' ' + driftText(driftSame));
// 宽度这一关：生成器在 --golden 下已把锚定成「判据锚全值 SHA 的前 8 位」（48-micro-a-preview.mjs 的
// GOLDEN_ABBREV），与检出对象集无关，故两侧宽度必须相等；下限另用本文件的独立字面量（不拿生成器的常量
// 当尺子，否则把截取宽度改窄、尺子跟着变＝自我指认）：入库十二件实宽 8，且 spec §R9-1 明令不取 7——
// 只查相等会放行「改窄再整批再生」。宽度级联进 receipt_id／chain_hash／mark，此处点名原因，
// 免得 B5 只报字节不等时有人误判成内容回归。
const ARCHIVED_ABBREV_MIN = 8;
/**
 * 锚宽判定：入库与现跑的 %h 宽度必须相等，且入库宽不得窄于 ARCHIVED_ABBREV_MIN。
 * 宽度属形态不属身份，但它被算进 receipt_id／chain_hash／mark，所以必须两侧一致。
 * @param {{name: string, v: string}[]} repoC 入库侧载体
 * @param {{name: string, v: string}[]} regenC 现跑侧载体
 * @returns {{bad: {name: string, repoW: number, regenW: number}[], under: {name: string, w: number}[]}}
 */
function widthOffenders(repoC, regenC) {
  const byName = {};
  for (const c of regenC) { byName[c.name] = c.v; }
  const bad = [];
  const under = [];
  for (const c of repoC) {
    if (!/^[0-9a-f]+$/.test(c.v)) { continue; }
    const r = byName[c.name];
    if (typeof r === 'string' && r.length !== c.v.length) { bad.push({ name: c.name, repoW: c.v.length, regenW: r.length }); }
    if (c.v.length < ARCHIVED_ABBREV_MIN) { under.push({ name: c.name, w: c.v.length }); }
  }
  return { bad: bad, under: under };
}
const wReal = widthOffenders(scanRepo.carriers, scanRegen.carriers);
t('B12 锚宽必须相等：入库＝现跑宽度，且不窄于 ' + ARCHIVED_ABBREV_MIN, wReal.bad.length === 0 && wReal.under.length === 0, wReal.bad.map(function (c) { return c.name + '（入库 ' + c.repoW + ' vs 现跑 ' + c.regenW + '）'; }).join(' ') + ' ' + wReal.under.map(function (c) { return c.name + '（' + c.w + ' 位窄于下限）'; }).join(' '));
// B12 自带对照（AC②：新加的判别，正反两面都要经得起看）：构造载体走同一条判定——宽度差必点名、等宽放行、窄于下限必点名。
// 少了这条，把 widthOffenders 的 !== 改成 === 也不会有任何东西红。
const wDiff = widthOffenders([{ name: 'x', v: 'e356581e' }], [{ name: 'x', v: 'e356581' }]);
const wSame = widthOffenders([{ name: 'x', v: 'e356581e' }], [{ name: 'x', v: 'e356581e' }]);
const wNarrow = widthOffenders([{ name: 'x', v: 'e356581' }], [{ name: 'x', v: 'e356581' }]);
t('B13 B12 的正反面对照（宽度差必点名／等宽放行／窄于下限必点名）', wDiff.bad.length === 1 && wSame.bad.length === 0 && wSame.under.length === 0 && wNarrow.under.length === 1, '差=' + wDiff.bad.length + ' 同=' + wSame.bad.length + '/' + wSame.under.length + ' 窄=' + wNarrow.under.length);
// 清理逐目录各自 try：一个失败不吞掉其余
TAMPER_DIRS.concat([GOLDEN_OUT]).forEach(function (d) { try { rmSync(d, { recursive: true, force: true }); } catch (e) { } });

// ---------- C. 真跑工件齐备 ----------
const REAL = ['env-manager-pr64', 'env-manager-pr55', 'env-manager-pr51', 'jiahao-pr6'];
t('C1 4 PR 报告双件（md+json）+diff 工件', REAL.every(function (s) { return existsSync(join(FX, '48-micro-a-' + s + '.md')) && existsSync(join(FX, '48-micro-a-' + s + '.json')) && existsSync(join(FX, '48-micro-a-' + s + '.diff')); }));
t('C2 拒绝件双件', existsSync(join(REPO,'engine','test','fixtures','contracts','48-micro-a-goose-duck-agent-refusal.md')) && existsSync(join(REPO,'engine','test','fixtures','contracts','48-micro-a-goose-duck-agent-refusal.json')));
t('C3 事实 JSONL×4（env-manager/jiahao/anysearch-cli/goose-duck-agent）', ['env-manager', 'jiahao', 'anysearch-cli', 'goose-duck-agent'].every(function (n) { return existsSync(join(FX, '48-micro-a-' + n + '-facts.jsonl')); }));
t('C4 golden measurements＋gate-probes＋汇总＋共享库（四个 golden 件留在 B 组的十二件清单里查，这里只查真跑那几件）', ['48-micro-a-env-manager-measurements.json', '48-micro-a-jiahao-measurements.json', '48-micro-a-gate-probes.json', '48-micro-a-measurements.json', '48-audit-facts.duckdb'].every(function (f) { return existsSync(join(FX, f)); }));

// ---------- D. 报告语义 ----------
const sc = {}; const md = {};
for (const s of REAL.concat(['goose-duck-agent-refusal'])) {
  sc[s] = JSON.parse(txt(join(FX, '48-micro-a-' + s + '.json')));
  md[s] = txt(join(FX, '48-micro-a-' + s + '.md'));
}
const PINS = { 'env-manager-pr64': 'machine-generated/release-please', 'env-manager-pr55': 'platform-declared-bot/dependabot', 'env-manager-pr51': 'human', 'jiahao-pr6': 'human' };
const CHAN = { 'env-manager-pr64': 'local-git', 'env-manager-pr55': 'api', 'env-manager-pr51': 'local-git', 'jiahao-pr6': 'local-git' };
for (const s of REAL) {
  const x = sc[s];
  const bq = x.quadrants.filter(function (q) { return q.quadrant === 'behavior'; })[0];
  const sf = bq ? bq.slice_fields : {};
  const sliceMiss = MOD.MICRO_A_SLICE_FIELDS.filter(function (f) { return !(f in sf); });
  t('D-' + s + ' supported+merged+形态锁+通道锁+所含字段全', x.overall_verdict === 'supported' && sf.merged === true && sf.author_form === PINS[s] && sf.diff_channel === CHAN[s] && sliceMiss.length === 0, 'form=' + sf.author_form + ' ch=' + sf.diff_channel + ' miss=' + sliceMiss.join(','));
}
t('D-e1 env64 release-please 平台声明 Bot（github-actions[bot]/Bot 双检真值）', sc['env-manager-pr64'].quadrants[0].slice_fields.bot_declared === true && sc['env-manager-pr64'].quadrants[0].slice_fields.author_login === 'github-actions[bot]');
t('D-e2 env55 走 api 退路如实标注（stats NULL 契约＋detail 注记）', (function () { const e = sc['env-manager-pr55'].adjudication.entries.filter(function (x) { return x.criterion_id === 'TC-2'; })[0]; return e.band === 'supported' && e.rationale.indexOf('api') >= 0; })());
t('D-e3 四件判据条目=6 条/件（PC-1/TC-1~4/NC-1）', REAL.every(function (s) { return sc[s].adjudication.entries.length === 6; }));
t('D-e4 四件 preview_disclosure=capability 3 of 5 · preview＋同主确认偏差置首＋not_in_preview 缩小范围', REAL.every(function (s) { const d = sc[s].preview_disclosure; return d && d.capability_label === 'capability 3 of 5 · preview' && d.structural_limitations[0].indexOf('同主确认偏差') >= 0 && JSON.stringify(d.not_in_preview) === JSON.stringify(['Micro-B', 'Macro-A']); }));
t('D-e5 四件 subject_ref=PR 级（owner/repo#N）', REAL.every(function (s) { return /^Xxx91n\/[a-z-]+#\d+$/.test(sc[s].subject_ref); }));
t('D-e6 四件 receipt RCP- 格式＋human pending', REAL.every(function (s) { return /^RCP-[0-9a-f]{16}$/.test(sc[s].receipt.receipt_id) && sc[s].adjudication.human.status === 'pending'; }));
t('D-r1 拒绝件 overall=unsupported', sc['goose-duck-agent-refusal'].overall_verdict === 'unsupported');
t('D-r2 拒绝件含「无托管 PR 面」+前置条件+前提漂移注记', md['goose-duck-agent-refusal'].indexOf('无托管 PR 面') >= 0 && md['goose-duck-agent-refusal'].indexOf('前置条件') >= 0 && md['goose-duck-agent-refusal'].indexOf('漂移') >= 0);
t('D-r3 拒绝件 TC-4 判据落 unsupported＋象限 intake-refused 标记', sc['goose-duck-agent-refusal'].adjudication.entries.some(function (e) { return e.criterion_id === 'TC-4' && e.band === 'unsupported'; }) && sc['goose-duck-agent-refusal'].quadrants.every(function (q) { return q.conflict_markers.indexOf('intake-refused') >= 0; }));

const gates = JSON.parse(txt(join(REPO,'engine','test','fixtures','contracts','48-micro-a-gate-probes.json')));
t('D-g1 资格这一关的读数：anysearch-cli merged≥1→eligible（前提漂移）＋goose-duck-agent merged=0→拒绝', (function () { const a = gates.probes.filter(function (p) { return p.name === 'anysearch-cli'; })[0]; const g = gates.probes.filter(function (p) { return p.name === 'goose-duck-agent'; })[0]; return a.eligible === true && a.merged_prs >= 1 && g.eligible === false && g.merged_prs === 0; })());
const meas = JSON.parse(txt(join(REPO,'engine','test','fixtures','contracts','48-micro-a-measurements.json')));
t('D-m1 共享库 Micro-A 四仓事实齐入', meas.shared_duckdb && meas.shared_duckdb.db_by_scale['Micro-A'] >= 90 && ['Xxx91n/env-manager', 'Xxx91n/jiahao', 'Xxx91n/anysearch-cli', 'Xxx91n/goose-duck-agent'].every(function (k) { return meas.shared_duckdb.db_by_repo[k] > 0; }), JSON.stringify(meas.shared_duckdb ? meas.shared_duckdb.db_by_repo : {}));
t('D-m2 事实 scale=Micro-A 全量（JSONL 行抽查）', (function () { const line = txt(join(REPO,'engine','test','fixtures','contracts','48-micro-a-jiahao-facts.jsonl')).split('\n')[0]; return JSON.parse(line).scale === 'Micro-A'; })());

// ---------- E. 事件闭环 + 文档回写 ----------
const reg = JSON.parse(txt(join(REPO,'engine','test','fixtures','contracts','33-gate-registry.json')));
t('E1 micro-a-preview-prep occurred=true 带证据', reg.events['micro-a-preview-prep'].occurred === true && /#48/.test(reg.events['micro-a-preview-prep'].evidence));
const t15 = reg.items.find(function (i) { return i.id === 'desk-task15'; });
t('E2 desk-task15 decided + criterion-met 确认留痕（#48 署名）', t15.status === 'decided' && (t15.confirmations || []).some(function (c) { return c.decision === 'trigger-fired-criterion-met' && /#48/.test(c.by); }));
t('E3 绑定三项复审留痕（llm-mcp-face/deferred-faces/scorecard-repomix）', ['codelore-llm-mcp-face', 'codelore-deferred-faces', 'upstream-probes-scorecard-repomix'].every(function (id) { const it = reg.items.find(function (x) { return x.id === id; }); return (it.confirmations || []).some(function (c) { return /#48/.test(c.by); }); }));
const rd = txt(join(REPO, 'README.md'));
t('E7 README 能力矩阵 Micro-A 产线化=capability 3 of 5 · preview（#85②/D-204③④——缩小范围旧标注转禁）', rd.indexOf('capability 3 of 5 · preview') >= 0 && /Micro-A PR diff \| \*\*capability 3 of 5/.test(rd) && rd.indexOf('capability 3 of 5 · calibrated demo') < 0 && rd.indexOf('not in plugin distribution') < 0);
t('E10 48-report.md 在且六段齐备', existsSync(join(REPO,'engine','test','fixtures','contracts','48-report.md')) && ['①', '②', '③', '④', '⑤', '⑥'].every(function (x) { return txt(join(REPO,'engine','test','fixtures','contracts','48-report.md')).indexOf(x) >= 0; }));

// ---------- F. token 泄漏 + BOM ----------
const f48 = readdirSync(join(REPO, 'engine', 'test', 'fixtures', 'contracts')).filter(function (f) { return f.indexOf('48-') === 0; });
const allTxt = f48.filter(function (f) { return /\.(json|jsonl|md|mjs)$/.test(f); }).map(function (f) { return txt(join(FX, f)); }).join('\n');
t('F1 全部 48-* 工件零 token 泄漏（gho_/ghp_/github_pat_/Bearer 实值）', !/(gho_[A-Za-z0-9]|ghp_[A-Za-z0-9]|github_pat_[A-Za-z0-9])/.test(allTxt));
t('F2 全部 48-* 工件无 BOM', f48.every(function (f) { return noBom(join(FX, f)); }), f48.filter(function (f) { return !noBom(join(FX, f)); }).join(','));
t('F3 检查脚本自身无 BOM', noBom(join(HERE, '48-check.mjs')));

// ---------- G. 校对样本台账：五样都得记全（spec §R8-2「校对样本要记的字段」，tracker #241） ----------
// 票面原话：一条样本要记稳定 ID、来源仓、合并时间、加入版本、退役原因，少了退役原因以后没人说得清。
// 前四样机器能核；退役原因现在四条样本都还在用，所以只核「这一格在册、而且没跟名册打架」，
// 真有样本退出时由生成器的 sampleLedger 当场报错（48-micro-a-preview.mjs 里那两条 throw）。
// 加入版本是倒查 git 历史来的真值：四条样本都在 3e588e0（2026-09-17，#48 那次）一起写死进名册，
// 那条提交在 0.1.0 发行之后、0.2.0 之前，所以是 0.1.0。写死这一份，是为了有人把它改成「当前版本」时当场红。
const SAMPLE_ADDED_PINNED = { 'env-manager#64': '0.1.0', 'env-manager#55': '0.1.0', 'env-manager#51': '0.1.0', 'jiahao#6': '0.1.0' };
const LEDGER_FIELDS = ['id', 'repo', 'pr', 'added_in', 'retired_in', 'retired_reason'];
function ledgerProblems(rows) {
  const bad = [];
  if (!Array.isArray(rows)) { return ['台账不是数组']; }
  for (const r of rows) {
    if (r === null || typeof r !== 'object') { bad.push('有一行不是对象'); continue; }
    const miss = LEDGER_FIELDS.filter(function (f) { return !(f in r); });
    if (miss.length) { bad.push(String(r.id || '?') + ' 缺字段=' + miss.join('/')); }
  }
  return bad;
}
// 名册里的每一条样本都要有一行，行里的稳定 ID 是「仓名#PR 号」，来源仓和 PR 号得跟名册对得上。
const ROSTER_SAMPLES = MA.MICRO_A_PILOTS.reduce(function (acc, p) {
  for (const pin of p.pins) { acc.push({ id: p.name + '#' + pin.n, repo: p.name, pr: pin.n }); }
  return acc;
}, []);
// 台账读 golden measurements 那份：它是 48 生成器用 cassette 离线回放现跑出来、再和入库件逐字节对过的
// （B 组十二件之一），所以这里读到的就是「生成器现在会写出来的东西」。真跑汇总
// 48-micro-a-measurements.json 是 2026-09-16 那次真跑留下的记录，离线重算不出来，不去动它。
const goldenMeas = JSON.parse(txt(join(FX, '48-micro-a-golden-env-manager-measurements.json')));
const LEDGER_G = goldenMeas.sample_ledger;
const LEDGER_BAD = ledgerProblems(LEDGER_G);
// 建索引时跳过坏行：台账里混进 null／非对象时，ledgerProblems 已经记下这条问题，这里再伸手读 r.id
// 就会抛 TypeError 把整条检查打断——G1 的明细和后面几条断言都轮不到跑，红得没名没姓（跟 tracker #72 那次一个毛病）。
const LEDGER_BY_ID = {};
if (Array.isArray(LEDGER_G)) { for (const r of LEDGER_G) { if (r !== null && typeof r === 'object') { LEDGER_BY_ID[r.id] = r; } } }
const LEDGER_MISSING = ROSTER_SAMPLES.filter(function (s) { return !LEDGER_BY_ID[s.id]; }).map(function (s) { return s.id; });
const LEDGER_UNMATCHED = ROSTER_SAMPLES.filter(function (s) {
  const r = LEDGER_BY_ID[s.id];
  return !r || r.repo !== s.repo || r.pr !== s.pr;
}).map(function (s) { return s.id; });
const LEDGER_ADDED_WRONG = ROSTER_SAMPLES.filter(function (s) {
  const r = LEDGER_BY_ID[s.id];
  return !r || r.added_in !== SAMPLE_ADDED_PINNED[s.id];
}).map(function (s) { return s.id + '=' + (LEDGER_BY_ID[s.id] ? LEDGER_BY_ID[s.id].added_in : '缺席'); });
const LEDGER_RETIRED_BAD = ROSTER_SAMPLES.filter(function (s) {
  const r = LEDGER_BY_ID[s.id];
  return !r || r.retired_in !== null || r.retired_reason !== null;
}).map(function (s) { return s.id; });
t('G1 台账每行五样齐（稳定 ID＋来源仓＋PR 号＋加入版本＋退役原因那一格）', LEDGER_BAD.length === 0 && Array.isArray(LEDGER_G), LEDGER_BAD.join(' '));
t('G2 名册里的每条样本在台账里都有行，来源仓＋PR 号对得上', LEDGER_MISSING.length === 0 && LEDGER_UNMATCHED.length === 0 && ROSTER_SAMPLES.length === 4, '缺=' + LEDGER_MISSING.join(',') + ' 对不上=' + LEDGER_UNMATCHED.join(','));
t('G3 加入版本是历史真值（四条都是 0.1.0，不是一律填当前版本）', LEDGER_ADDED_WRONG.length === 0, LEDGER_ADDED_WRONG.join(' '));
t('G4 还在用的样本，退役那两格必须是空的（退役原因只给真退出的样本填）', LEDGER_RETIRED_BAD.length === 0, LEDGER_RETIRED_BAD.join(' '));
// 台账得能被打红，不然上面四条永远是绿的：拿同一份判定喂三份坏台账，缺字段、填错加入版本、没退却写了退役原因都要点名。
const LEDGER_TAMP = [
  ledgerProblems([{ id: 'env-manager#64', repo: 'env-manager', pr: 64, added_in: '0.1.0' }]),
  ledgerProblems([{ id: 'x', repo: 'x', pr: 1, added_in: '0.1.0', retired_in: null, retired_reason: null }, null]),
  ledgerProblems('不是数组')
];
// 台账里混进 null 行时，建索引那一步不许抛 TypeError 把整条检查打断（CodeRabbit 第 3 条，成立）：
// 坏行由 ledgerProblems 记进 G1 的明细，脚本照常跑完并给出有名有姓的红。
const NULL_ROW_INDEX = {};
if ([{ id: 'ok#1' }, null].length === 2) { for (const r of [{ id: 'ok#1' }, null]) { if (r !== null && typeof r === 'object') { NULL_ROW_INDEX[r.id] = r; } } }
const NULL_ROW_PROBLEMS = ledgerProblems([{ id: 'ok#1', repo: 'ok', pr: 1, added_in: '0.1.0', retired_in: null, retired_reason: null }, null]);
// 加入版本被改成「当前版本」那种走法：四条全填 0.3.0，按 G3 的判法必须一条都过不了。
const TAMPERED_ADDED = ROSTER_SAMPLES.map(function (s) { return { id: s.id, repo: s.repo, pr: s.pr, added_in: '0.3.0', retired_in: null, retired_reason: null }; });
const TAMPERED_ADDED_WRONG = TAMPERED_ADDED.filter(function (r) { return r.added_in !== SAMPLE_ADDED_PINNED[r.id]; });
t('G5 正反对照：缺字段／行不是对象／台账不是数组都要点名，加入版本被改成当前版本必须判红',
  LEDGER_TAMP[0].length === 1 && LEDGER_TAMP[0][0].indexOf('retired_in') >= 0 && LEDGER_TAMP[1].length === 1 && LEDGER_TAMP[2].length === 1
  && NULL_ROW_PROBLEMS.length === 1 && NULL_ROW_INDEX['ok#1'] !== undefined && Object.keys(NULL_ROW_INDEX).length === 1
  && TAMPERED_ADDED_WRONG.length === TAMPERED_ADDED.length,
  '缺字段=' + JSON.stringify(LEDGER_TAMP[0]) + ' 非对象=' + JSON.stringify(LEDGER_TAMP[1]) + ' 非数组=' + JSON.stringify(LEDGER_TAMP[2]) + ' 改版本判红=' + TAMPERED_ADDED_WRONG.length + '/' + TAMPERED_ADDED.length);

console.log('---');
console.log(fail === 0 ? 'PASS ' + pass + '/' + (pass + fail) : 'FAIL ' + fail + '/' + (pass + fail));
process.exit(fail === 0 ? 0 : 1);
