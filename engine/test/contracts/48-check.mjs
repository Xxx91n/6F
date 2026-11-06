// 48-check.mjs — #48 Micro-A preview 守卫（R8-02 / A-056 / D-049）
// 断言面：A 管道+判据文件+模块导出契约 → B golden 实跑＋十二件逐字节对账（cassette 回放，离线；漂移即红 #88）→ C 真跑工件齐备
//   → D 报告语义（4 PR supported＋拒绝件 unsupported＋切片字段∩骨架机械断言＋披露四字段）→ E 事件闭环+文档回写 → F token 泄漏+BOM
// 纪律：只读断言＋golden 子进程（cassette 离线回放零网络）；真跑工件为已落盘实证不重复实跑；exit 0 + PASS N/N 为绿。
import { readFileSync, existsSync, readdirSync } from 'node:fs';
import { spawnSync } from 'node:child_process';
import { fileURLToPath, pathToFileURL } from 'node:url';
import { dirname, join } from 'node:path';
import { mkdtempSync, copyFileSync, writeFileSync, rmSync } from 'node:fs';
import { tmpdir } from 'node:os';
// guard-meta（D-159②/D-160③ 自声明——未声明=红）
const TIER = 'portable';
const PROTECTED_SURFACE = '#48 Micro-A preview 守卫（R8-02 / A-056 / D-049）';


const HERE = dirname(fileURLToPath(import.meta.url));
const REPO = join(HERE, '..', '..', '..');
const FX = join(REPO, 'engine', 'test', 'fixtures', 'contracts');
const PIPE = join(HERE, '48-micro-a-preview.mjs');
const CRIT = join(REPO,'engine','test','fixtures','contracts','48-micro-a-criteria.md');
// golden 在册十二件唯一清单（B4 在场腿／B5 对账腿／B6~B8 对照臂／B9 集合闸同源——禁各处再抄一份，#88）
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
t('A8 走主路/回退标注面（credential_strategy + diff_channel 入切片）', MOD.MICRO_A_SLICE_FIELDS.indexOf('credential_strategy') >= 0 && MOD.MICRO_A_SLICE_FIELDS.indexOf('diff_channel') >= 0);

// ---------- B. golden 实跑（cassette 离线回放） ----------
const GOLDEN_OUT = mkdtempSync(join(tmpdir(), '48-golden-'));
const gr = spawnSync('node', [PIPE, '--golden', '--out', GOLDEN_OUT], { cwd: REPO, encoding: 'utf8', timeout: 120000 });
const gout = (gr.stdout || '') + (gr.stderr || '');

t('B1 --golden 实跑 exit 0', gr.status === 0, gout.slice(-300));
const gass = existsSync(join(REPO,'engine','test','fixtures','contracts','48-micro-a-golden-assertions.json')) ? JSON.parse(txt(join(REPO,'engine','test','fixtures','contracts','48-micro-a-golden-assertions.json'))) : null;
t('B2 golden 断言文件 all_pass=true', gass !== null && gass.all_pass === true);
t('B3 golden 断言 ≥10 条且全过', gass !== null && gass.checks.length >= 10 && gass.checks.every(function (c) { return c.pass; }), gass ? String(gass.checks.length) : 'absent');
t('B4 golden 工件齐备（在册十二件全在场——含 pr64.diff 与 assertions）', GOLDEN_NAMES.every(function (f) { return existsSync(join(FX, f)); }), GOLDEN_NAMES.filter(function (f) { return !existsSync(join(FX, f)); }).join(','));

// ---------- B5~B9 golden 逐字节对账（#88；形制取 golden-ci.yml 的「重渲染＋逐字节 diff」纪律 D-030③） ----------
// B1 已把十二件现跑进 GOLDEN_OUT，此前只判 exit 0 即弃——入库件手改或引擎渲染变更都不判红（实证：#114 转义
// 修复静默漂了三件 .md，而 48-check 照旧 PASS 40/40）。对账以「现跑目录 vs 入库目录」为臂，CI 不回写：
// 红了就由人重跑 --golden 随 PR 提交，golden 更新只走审查。
// prereg_commit 存的是 `%h` 短写：宽度属形态不属身份（spec §R8 / D-094(b)），git 自动缩写随对象库规模跳位，
// 钉字面宽会让整批 golden 无因判红。故逐字节对账先把它归一成占位，身份改由 B10 用全值认祖——
// 挖掉的面必须有人判红，不许留成手改无人知的洞（#88 AC①）。
const PREREG_FIELD = /("prereg_commit":\s*")[0-9a-f]{4,40}(")/g;
function canonBytes(p) { return readFileSync(p, 'utf8').replace(PREREG_FIELD, '$1PREREG$2'); }
function goldenDrift(baseDir, otherDir, names) {
  const bad = [];
  for (const n of names) {
    const a = join(baseDir, n); const b = join(otherDir, n);
    let why = null;
    if (!existsSync(a)) { why = '基准缺席'; }
    else if (!existsSync(b)) { why = '对侧缺席'; }
    else if (canonBytes(a) !== canonBytes(b)) { why = '字节不等'; }
    if (why) { bad.push({ name: n, why: why }); }
  }
  return bad;
}
function driftText(bad) { return bad.map(function (d) { return d.name + '（' + d.why + '）'; }).join(' '); }
const REGEN_CMD = 'node engine/test/contracts/48-micro-a-preview.mjs --golden --out engine/test/fixtures/contracts';
const driftB5 = goldenDrift(FX, GOLDEN_OUT, GOLDEN_NAMES);
t('B5 golden 逐字节对账十二件（现跑 vs 入库，漂移即红）', driftB5.length === 0, driftB5.length ? driftText(driftB5) + ' → 重跑 ' + REGEN_CMD + ' 随 PR 提交' : '');

// 对照臂（#88 AC②）：判别臂自己必须被判别——绿侧与红侧都不得是空集恒真（tracker #29 口径）。
const TMP_PRISTINE = mkdtempSync(join(tmpdir(), '48-pristine-'));
function tamperedCopy(name, mutate) {
  const dir = mkdtempSync(join(tmpdir(), '48-tamper-'));
  for (const n of GOLDEN_NAMES) { copyFileSync(join(GOLDEN_OUT, n), join(dir, n)); }
  const p = join(dir, name);
  writeFileSync(p, mutate(readFileSync(p, 'utf8')), 'utf8');
  return dir;
}
for (const n of GOLDEN_NAMES) { copyFileSync(join(GOLDEN_OUT, n), join(TMP_PRISTINE, n)); }
const driftPristine = goldenDrift(GOLDEN_OUT, TMP_PRISTINE, GOLDEN_NAMES);
t('B6 负对照：同批产物双目录对账 → 零漂移且比较集满十二（绿侧非空）', driftPristine.length === 0 && GOLDEN_NAMES.length === 12, driftText(driftPristine));
const TAM_REFUSAL_MD = '48-micro-a-golden-goose-duck-agent-refusal.md';
const tamRefusalDir = tamperedCopy(TAM_REFUSAL_MD, function (s) { return s.split('无托管 PR 面').join('托管 PR 面齐备'); });
const driftRefusal = goldenDrift(GOLDEN_OUT, tamRefusalDir, GOLDEN_NAMES);
t('B7 正对照：拒绝件 .md 语义措辞篡改 → 恰该件判红（不误伤其余十一件）', driftRefusal.length === 1 && driftRefusal[0].name === TAM_REFUSAL_MD, driftText(driftRefusal));
const TAM_PR64_JSON = '48-micro-a-golden-env-manager-pr64.json';
const tamPr64Dir = tamperedCopy(TAM_PR64_JSON, function (s) { return s.replace('"overall_verdict": "supported"', '"overall_verdict": "insufficient"'); });
const driftPr64 = goldenDrift(GOLDEN_OUT, tamPr64Dir, GOLDEN_NAMES);
t('B8 正对照：pr64.json overall_verdict 篡改 → 恰该件判红（裁决面篡改必红）', driftPr64.length === 1 && driftPr64[0].name === TAM_PR64_JSON, driftText(driftPr64));
// 集合闸：清单/入库/现跑三集合必须同款同名——清单手改缩编、生成器少写或多写都在此当场红（空集恒真的最后一道）
const setRepo = readdirSync(FX).filter(function (f) { return f.indexOf(GOLDEN_PREFIX) === 0; }).sort().join('|');
const setRegen = readdirSync(GOLDEN_OUT).filter(function (f) { return f.indexOf(GOLDEN_PREFIX) === 0; }).sort().join('|');
const setListed = GOLDEN_NAMES.slice().sort().join('|');
t('B9 集合闸：清单＝入库＝现跑且各恰十二件', setListed === setRepo && setListed === setRegen && GOLDEN_NAMES.length === 12, 'listed=' + setListed.split('|').length + ' repo=' + setRepo.split('|').length + ' regen=' + setRegen.split('|').length + (setRepo !== setListed ? ' repo∉清单:' + setRepo : '') + (setRegen !== setListed ? ' regen∉清单:' + setRegen : ''));
// 短 SHA 全值口径（#88 AC③）：prereg_commit 是 `%h` 短写，宽度属形态不属身份——逐字节臂把它归一掉之后，
// 它的身份改由本臂钉：入库短写必须是本检出判据锚**全值**的前缀。全值走 log --format=%H 取，不走
// rev-parse --verify——`%h` 短写不是可解析 rev，喂进去只会报出假因。
function preregAnchored(short, full) {
  return typeof short === 'string' && /^[0-9a-f]{4,40}$/.test(short) && /^[0-9a-f]{40}$/.test(full) && full.indexOf(short) === 0;
}
const prPr = spawnSync('git', ['-C', REPO, 'log', '-1', '--format=%H', '--', 'engine/test/fixtures/contracts/48-micro-a-criteria.md'], { encoding: 'utf8', timeout: 60000 });
const preregFull = (prPr.stdout || '').trim();
const preregCarriers = [];
for (const n of GOLDEN_NAMES) {
  if (!existsSync(join(FX, n))) { continue; }
  const m = readFileSync(join(FX, n), 'utf8').match(/"prereg_commit":\s*"([0-9a-f]{4,40})"/);
  if (m) { preregCarriers.push({ name: n, short: m[1] }); }
}
const preregBad = preregCarriers.filter(function (c) { return !preregAnchored(c.short, preregFull); });
t('B10 prereg_commit 全值认祖（入库短写＝判据锚全值前缀）', preregCarriers.length > 0 && preregBad.length === 0, 'full=' + (preregFull.slice(0, 12) || 'ABSENT') + ' carriers=' + preregCarriers.length + ' bad=' + preregBad.map(function (c) { return c.name; }).join(','));
// 被豁免的面必须有人判红：拿在册真短写末位翻成另一 hex（同宽异值），全值认祖必须拒——否则宽度豁免就是手改洞
const preregPerturbed = preregCarriers.length > 0 ? preregCarriers[0].short.slice(0, -1) + (preregCarriers[0].short.slice(-1) === '0' ? '1' : '0') : '';
t('B11 正对照：全值认祖拒同宽异值且认真短写（B10 判别臂活性，豁免不留洞）', preregCarriers.length > 0 && preregAnchored(preregPerturbed, preregFull) === false && preregCarriers.every(function (c) { return preregAnchored(c.short, preregFull); }), 'perturbed=' + preregPerturbed);
// 豁免只对宽度生效：把短写截掉一位（8→7，同祖异宽）逐字节臂不得判红——否则对象库一扩容就整批假红
const TAM_PREREG = '48-micro-a-golden-env-manager-pr64.json';
const tamWidthDir = tamperedCopy(TAM_PREREG, function (s) { return s.replace(/("prereg_commit":\s*")[0-9a-f]{4,40}(")/, function (_all, p1, p2) { return p1 + preregFull.slice(0, 7) + p2; }); });
t('B12 负对照：prereg_commit 仅显示宽度跳变（8→7）→ 逐字节臂不判红', goldenDrift(GOLDEN_OUT, tamWidthDir, GOLDEN_NAMES).length === 0);
try { rmSync(TMP_PRISTINE, { recursive: true, force: true }); rmSync(tamRefusalDir, { recursive: true, force: true }); rmSync(tamPr64Dir, { recursive: true, force: true }); rmSync(tamWidthDir, { recursive: true, force: true }); } catch (e) { }

// ---------- C. 真跑工件齐备 ----------
const REAL = ['env-manager-pr64', 'env-manager-pr55', 'env-manager-pr51', 'jiahao-pr6'];
t('C1 4 PR 报告双件（md+json）+diff 工件', REAL.every(function (s) { return existsSync(join(FX, '48-micro-a-' + s + '.md')) && existsSync(join(FX, '48-micro-a-' + s + '.json')) && existsSync(join(FX, '48-micro-a-' + s + '.diff')); }));
t('C2 拒绝件双件', existsSync(join(REPO,'engine','test','fixtures','contracts','48-micro-a-goose-duck-agent-refusal.md')) && existsSync(join(REPO,'engine','test','fixtures','contracts','48-micro-a-goose-duck-agent-refusal.json')));
t('C3 事实 JSONL×4（env-manager/jiahao/anysearch-cli/goose-duck-agent）', ['env-manager', 'jiahao', 'anysearch-cli', 'goose-duck-agent'].every(function (n) { return existsSync(join(FX, '48-micro-a-' + n + '-facts.jsonl')); }));
t('C4 measurements×2 + gate-probes + 汇总 + 共享库', ['48-micro-a-env-manager-measurements.json', '48-micro-a-jiahao-measurements.json', '48-micro-a-gate-probes.json', '48-micro-a-measurements.json', '48-audit-facts.duckdb'].every(function (f) { return existsSync(join(FX, f)); }));

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
  t('D-' + s + ' supported+merged+形态锁+通道锁+切片字段全', x.overall_verdict === 'supported' && sf.merged === true && sf.author_form === PINS[s] && sf.diff_channel === CHAN[s] && sliceMiss.length === 0, 'form=' + sf.author_form + ' ch=' + sf.diff_channel + ' miss=' + sliceMiss.join(','));
}
t('D-e1 env64 release-please 平台声明 Bot（github-actions[bot]/Bot 双检真值）', sc['env-manager-pr64'].quadrants[0].slice_fields.bot_declared === true && sc['env-manager-pr64'].quadrants[0].slice_fields.author_login === 'github-actions[bot]');
t('D-e2 env55 api 兜底如实标注（stats NULL 契约＋detail 注记）', (function () { const e = sc['env-manager-pr55'].adjudication.entries.filter(function (x) { return x.criterion_id === 'TC-2'; })[0]; return e.band === 'supported' && e.rationale.indexOf('api') >= 0; })());
t('D-e3 四件判据条目=6 条/件（PC-1/TC-1~4/NC-1）', REAL.every(function (s) { return sc[s].adjudication.entries.length === 6; }));
t('D-e4 四件 preview_disclosure=capability 3 of 5 · preview＋同主确认偏差置首＋not_in_preview 收窄', REAL.every(function (s) { const d = sc[s].preview_disclosure; return d && d.capability_label === 'capability 3 of 5 · preview' && d.structural_limitations[0].indexOf('同主确认偏差') >= 0 && JSON.stringify(d.not_in_preview) === JSON.stringify(['Micro-B', 'Macro-A']); }));
t('D-e5 四件 subject_ref=PR 级（owner/repo#N）', REAL.every(function (s) { return /^Xxx91n\/[a-z-]+#\d+$/.test(sc[s].subject_ref); }));
t('D-e6 四件 receipt RCP- 格式＋human pending', REAL.every(function (s) { return /^RCP-[0-9a-f]{16}$/.test(sc[s].receipt.receipt_id) && sc[s].adjudication.human.status === 'pending'; }));
t('D-r1 拒绝件 overall=unsupported', sc['goose-duck-agent-refusal'].overall_verdict === 'unsupported');
t('D-r2 拒绝件含「无托管 PR 面」+前置条件+前提漂移注记', md['goose-duck-agent-refusal'].indexOf('无托管 PR 面') >= 0 && md['goose-duck-agent-refusal'].indexOf('前置条件') >= 0 && md['goose-duck-agent-refusal'].indexOf('漂移') >= 0);
t('D-r3 拒绝件 TC-4 判据落 unsupported＋象限 intake-refused 标记', sc['goose-duck-agent-refusal'].adjudication.entries.some(function (e) { return e.criterion_id === 'TC-4' && e.band === 'unsupported'; }) && sc['goose-duck-agent-refusal'].quadrants.every(function (q) { return q.conflict_markers.indexOf('intake-refused') >= 0; }));

const gates = JSON.parse(txt(join(REPO,'engine','test','fixtures','contracts','48-micro-a-gate-probes.json')));
t('D-g1 资格闸读数：anysearch-cli merged≥1→eligible（前提漂移）＋goose-duck-agent merged=0→拒绝', (function () { const a = gates.probes.filter(function (p) { return p.name === 'anysearch-cli'; })[0]; const g = gates.probes.filter(function (p) { return p.name === 'goose-duck-agent'; })[0]; return a.eligible === true && a.merged_prs >= 1 && g.eligible === false && g.merged_prs === 0; })());
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
t('E7 README 能力矩阵 Micro-A 产线化=capability 3 of 5 · preview（#85②/D-204③④——收窄旧标注转禁）', rd.indexOf('capability 3 of 5 · preview') >= 0 && /Micro-A PR diff \| \*\*capability 3 of 5/.test(rd) && rd.indexOf('capability 3 of 5 · calibrated demo') < 0 && rd.indexOf('not in plugin distribution') < 0);
t('E10 48-report.md 在且六段齐备', existsSync(join(REPO,'engine','test','fixtures','contracts','48-report.md')) && ['①', '②', '③', '④', '⑤', '⑥'].every(function (x) { return txt(join(REPO,'engine','test','fixtures','contracts','48-report.md')).indexOf(x) >= 0; }));

// ---------- F. token 泄漏 + BOM ----------
const f48 = readdirSync(join(REPO, 'engine', 'test', 'fixtures', 'contracts')).filter(function (f) { return f.indexOf('48-') === 0; });
const allTxt = f48.filter(function (f) { return /\.(json|jsonl|md|mjs)$/.test(f); }).map(function (f) { return txt(join(FX, f)); }).join('\n');
t('F1 全部 48-* 工件零 token 泄漏（gho_/ghp_/github_pat_/Bearer 实值）', !/(gho_[A-Za-z0-9]|ghp_[A-Za-z0-9]|github_pat_[A-Za-z0-9])/.test(allTxt));
t('F2 全部 48-* 工件无 BOM', f48.every(function (f) { return noBom(join(FX, f)); }), f48.filter(function (f) { return !noBom(join(FX, f)); }).join(','));
t('F3 守卫脚本自身无 BOM', noBom(join(HERE, '48-check.mjs')));

console.log('---');
console.log(fail === 0 ? 'PASS ' + pass + '/' + (pass + fail) : 'FAIL ' + fail + '/' + (pass + fail));
process.exit(fail === 0 ? 0 : 1);
