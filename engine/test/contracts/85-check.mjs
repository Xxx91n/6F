// 85-check.mjs —— #84 Macro-C 产线化一等面守卫（D-204②④；产线化前置=同族基准差分重校准硬准入）
// 断言面：A 静态契约（dist/src/README/CONTEXT 词条在场机核——R56 执行窗登记「CONTEXT 词条批在场机核」同窗兑现）
//   → B CLI 命令面测活（6F 本仓自审；engine-deps 组级闸）
//   → C anysearch-cli 差分重校准（基准自持组级闸：engine 面 vs 38 编排层独立重算——移植不重校准=数字形似义异防线，
//     预声明包 2026-10-03-r57-t1-predecl.md §2：等值集封闭＋fact_id 全等（chainFact）＋活语料非存档等值）
//     语料来源＝仓内 frozen bundle（ADR-0026/#33）→ 无 sibling 依赖，CI 可达；钉值唯一权威=engine/baseline-lock.yaml
//   → D 自检组（正负对照：构造偏差必须检出——§2.4 命中方向跑前声明）
// 纪律：只读断言＋临时目录写运行产物（跑完即弃）；bundle 物化走 `git clone <bundle>` 至 OS temp（主仓对象库零写，D-074）；
//   exit 0 + PASS N/N 绿。
import { readFileSync, existsSync, readdirSync, mkdtempSync, rmSync, writeFileSync } from 'node:fs';
import { spawnSync, execFileSync } from 'node:child_process';
import { createHash } from 'node:crypto';
import { fileURLToPath, pathToFileURL } from 'node:url';
import { dirname, join } from 'node:path';
import { tmpdir } from 'node:os';
import { need, groupProbe, engineDepsOk, cloneBundleWorktree } from './_lib/env-contract.mjs';

// guard-meta（D-159②/D-160③ 自声明——未声明=红）
const TIER = 'env-contract';
// D-214① consumption_forms（多形态消费方——B/C/E 组级 need engine-deps:）：dev-full=完整克隆＋engine/node_modules 在位全断言面；ci-shallow=CI 浅克隆（duckdb 原生绑定缺席→对应组 SKIP，仓内段照跑）。
const CONSUMPTION_FORMS = ['dev-full', 'ci-shallow'];
const PROTECTED_SURFACE = '#84 Macro-C＋#85② Micro-A 产线化一等面守卫（D-204②③④）——静态契约+CLI 测活+anysearch-cli 差分重校准+Micro-A cassette 差分重校准';

const HERE = dirname(fileURLToPath(import.meta.url));
const REPO = join(HERE, '..', '..', '..');
const ENG = join(REPO, 'engine');
let pass = 0, fail = 0;
function t(name, ok, detail) { if (ok) { pass++; console.log('PASS ' + name); } else { fail++; console.log('FAIL ' + name + (detail ? ' :: ' + String(detail).slice(0, 300) : '')); } }
function noBom(p) { const b = readFileSync(p); return !(b[0] === 0xEF && b[1] === 0xBB && b[2] === 0xBF); }
// baseline-lock.yaml 行读取（形制＝两空格 `- id:` ＋四空格 `key: value`，与 upstream-lock 同源解析形制，无依赖 yaml 子集）
// 基准语料钉的唯一权威＝engine/baseline-lock.yaml（ADR-0026）；upstream-lock.yaml 只承载产品上游，不再有基准行。
const BASELINE_LOCK = join(ENG, 'baseline-lock.yaml');
function baselineRow(id) {
  if (!existsSync(BASELINE_LOCK)) { return null; }
  const rows = {}; let cur = null;
  for (const line of readFileSync(BASELINE_LOCK, 'utf8').split(/\r?\n/)) {
    const mi = line.match(/^ {2}- id: (\S+)/);
    if (mi) { cur = { id: mi[1] }; rows[mi[1]] = cur; continue; }
    if (!cur) { continue; }
    const mk = line.match(/^ {4}([a-z0-9_]+):\s*(.*)$/);
    if (mk) { cur[mk[1]] = mk[2].trim().replace(/^"(.*)"$/, '$1'); }
  }
  return rows[id] || null;
}
const BASE_ROW = baselineRow('anysearch-cli-adr-corpus');
const BASE_FIELDS = ['id', 'kind', 'version', 'pin_type', 'status', 'contract', 'adapter', 'materialization', 'bundle', 'bundle_bytes', 'bundle_sha256', 'last_reviewed', 'next_review'];
const BUNDLE_REL = (BASE_ROW && BASE_ROW.bundle) || 'engine/test/fixtures/frozen/anysearch-cli-770d2549.bundle';
const BUNDLE = join(REPO, BUNDLE_REL);
// 15MB 制品只读一遍（A11 的字节数与 sha256 同源一次读，不重复 readFileSync 三次）
const BUNDLE_BUF = existsSync(BUNDLE) ? readFileSync(BUNDLE) : null;
const BUNDLE_SHA = BUNDLE_BUF ? createHash('sha256').update(BUNDLE_BUF).digest('hex') : null;
// 本机绝对路径探针（D-012 活跃路径禁盘符锚：基准面须可移植）
const ABS_PATH_RE = /(^|[\s"'(])([A-Za-z]:[\\/]|\/(Users|home)\/)/m;

// ---------- A. 静态契约 ----------
const srcC = readFileSync(join(ENG, 'src', 'audit', 'macro-c.ts'), 'utf8');
const srcA = readFileSync(join(ENG, 'src', 'audit', 'audit.ts'), 'utf8');
t('A1 dist/audit/macro-c.js 在（build 产物入库）', existsSync(join(ENG, 'dist', 'audit', 'macro-c.js')));
t('A2 capability_label 常量=capability 2 of 5 · preview（38 存档同款——44-check E6 文档↔产物同源）', srcC.indexOf("export const MACRO_C_CAPABILITY_LABEL = 'capability 2 of 5 · preview'") >= 0);
t('A3 audit.ts implemented=[Macro-B, Macro-C, Micro-A]', srcA.indexOf("['Macro-B', 'Macro-C', 'Micro-A']") >= 0);
const NIP_ROGUE_RE = /not_in_preview:[ ]*\[[^\]]*'(Micro-A|Macro-C)'/;   // 否定字符类内 ] 必须转义（JS [^]]=任意字符+字面]，P0-2 死代码教训）；正对照内嵌=判别臂活性自证（臂死亡即红，防「改了但没验」第三次复发）
t('A4 audit.ts not_in_preview 裁后=[Macro-A]（Macro-C 摘出＋Micro-A 产线化 #85②——判别臂序无关：任一位形不得回列 Micro-A/Macro-C；R64 P2-1＋LOOP P0-2 修正＋活性正对照）', srcA.indexOf("not_in_preview: ['Macro-A']") >= 0 && !NIP_ROGUE_RE.test(srcA) && NIP_ROGUE_RE.test("x = { not_in_preview: ['Macro-C'] };"));
t('A5 fact-write.ts 同位共享核在（audit.ts 与 macro-c.ts 同消费）', existsSync(join(ENG, 'src', 'audit', 'fact-write.ts')) && srcA.indexOf('writeRunFactsAndEvents') >= 0 && srcC.indexOf('writeRunFactsAndEvents') >= 0);
t('A6 engine/README scale 行已上架三层（Macro-B · Macro-C · Micro-A）', readFileSync(join(ENG, 'README.md'), 'utf8').indexOf('`Macro-B` · `Macro-C` · `Micro-A`') >= 0);
t('A8 bundle 棘轮帽已显式重推导（371342——D-217 minify 治理后实测×1.25 向下重推导，D-129③ scoped 双向注记留痕）', readFileSync(join(ENG, 'scripts', 'check-dist.mjs'), 'utf8').indexOf('371342') >= 0);
t('A9 本守卫自身无 BOM', noBom(join(HERE, '85-check.mjs')));
// A10–A13 基准语料自持面（ADR-0026／#33；#32 锁表分离同窗兑现）
t('A10 engine/baseline-lock.yaml 在位＋无 BOM＋lock_version=1＋anysearch-cli-adr-corpus 行十三字段齐备（status=active／pin_type=commit-sha／version=40 位 sha）',
  existsSync(BASELINE_LOCK) && noBom(BASELINE_LOCK)
  && readFileSync(BASELINE_LOCK, 'utf8').indexOf('lock_version: 1') >= 0
  && !!BASE_ROW && BASE_FIELDS.every(function (f) { return BASE_ROW[f] !== undefined && BASE_ROW[f] !== ''; })
  && BASE_ROW.status === 'active' && BASE_ROW.pin_type === 'commit-sha' && /^[0-9a-f]{40}$/.test(BASE_ROW.version || '')
  && BASE_ROW.materialization === 'frozen-bundle',
  BASE_ROW ? 'missing=' + BASE_FIELDS.filter(function (f) { return !BASE_ROW[f]; }).join(',') + ' status=' + BASE_ROW.status + ' pin=' + BASE_ROW.pin_type : 'baseline-lock.yaml 缺席');
t('A11 仓内 frozen bundle 制品完整性：在位＋字节数==bundle_bytes＋sha256==bundle_sha256（制品级钉，防静默替换）',
  !!BUNDLE_BUF && !!BASE_ROW && String(BUNDLE_BUF.length) === String(BASE_ROW.bundle_bytes) && BUNDLE_SHA === BASE_ROW.bundle_sha256,
  BUNDLE_BUF ? 'bytes=' + BUNDLE_BUF.length + '/' + (BASE_ROW && BASE_ROW.bundle_bytes) + ' sha256=' + String(BUNDLE_SHA).slice(0, 12) + '/' + String(BASE_ROW && BASE_ROW.bundle_sha256).slice(0, 12) : 'bundle 缺席: ' + BUNDLE_REL);
t('A12 基准活跃路径无本机绝对路径（baseline-lock.yaml＋本守卫自身；#34 可移植性前提，报告输出面归 #34）',
  existsSync(BASELINE_LOCK) && !ABS_PATH_RE.test(readFileSync(BASELINE_LOCK, 'utf8')) && !ABS_PATH_RE.test(readFileSync(join(HERE, '85-check.mjs'), 'utf8')));
// A13 双向：上游锁表侧零残留（否定）＋基准锁表侧确有一枚 repo-corpus 行（正对照——行改名或表被掏空即红）
const UPSTREAM_TXT = readFileSync(join(ENG, 'upstream-lock.yaml'), 'utf8');
t('A13 upstream-lock.yaml 已摘除基准语料行（零 anysearch 且零 kind: repo-corpus；正对照=该 kind 只在 baseline-lock）',
  UPSTREAM_TXT.indexOf('anysearch') < 0 && UPSTREAM_TXT.indexOf('kind: repo-corpus') < 0 && !!BASE_ROW && BASE_ROW.kind === 'repo-corpus');

// ---------- B. CLI 命令面测活（6F 本仓自审；duckdb 组级闸） ----------
const DEPS_B = [need('engine-deps:@duckdb/node-api', engineDepsOk(ENG, '@duckdb/node-api'))];
if (groupProbe('85-check', 'B', DEPS_B)) {
  const tmpB = mkdtempSync(join(tmpdir(), '85-run-'));
  const r = spawnSync('node', [join(ENG, 'dist', 'cli.js'), 'audit', '..', '--scale', 'Macro-C', '--out', join(tmpB, 'out')], { encoding: 'utf8', cwd: ENG, timeout: 420000 });
  t('B1 CLI audit --scale Macro-C exit 0（6F 自审实测）', r.status === 0, 'status=' + r.status + ' err=' + (r.stderr || '').slice(0, 200));
  let rec = null;
  try { rec = JSON.parse(r.stdout); } catch (e) { }
  t('B2 回执 scale=Macro-C + capabilities=[macro-c] + report_id -MACRO-C 收尾', !!rec && rec.scale === 'Macro-C' && JSON.stringify(rec.capabilities) === JSON.stringify(['macro-c']) && /-MACRO-C$/.test(rec.report_id || ''), rec && rec.report_id);
  t('B3 五工件齐备（Macro-B 同族 artifacts 契约）', ['report.md', 'report.json', 'audit-facts.jsonl', 'audit-measurements.json', 'facts.duckdb'].every(function (f) { return existsSync(join(tmpB, 'out', f)); }));
  const md = existsSync(join(tmpB, 'out', 'report.md')) ? readFileSync(join(tmpB, 'out', 'report.md'), 'utf8') : '';
  t('B4 报告 capability 2 of 5 · preview + 演化考古措辞在', md.indexOf('capability 2 of 5 · preview') >= 0 && md.indexOf('Macro-C') >= 0);
  const side = existsSync(join(tmpB, 'out', 'report.json')) ? JSON.parse(readFileSync(join(tmpB, 'out', 'report.json'), 'utf8')) : null;
  t('B5 侧车 not_in_preview=[Macro-A]（D-204 裁后状态机——Micro-A 产线化 #85②）', !!side && JSON.stringify(side.preview_disclosure.not_in_preview) === JSON.stringify(['Macro-A']), JSON.stringify(side && side.preview_disclosure && side.preview_disclosure.not_in_preview));
  t('B6 侧车六判据齐＋band 三档枚举域', !!side && ['PC-MC-1', 'PC-MC-2', 'TC-MC-1', 'TC-MC-2', 'TC-MC-3', 'NC-MC-1'].every(function (c) { return side.adjudication.entries.some(function (e) { return e.criterion_id === c && ['supported', 'unsupported', 'insufficient'].indexOf(e.band) >= 0; }); }));
  const meas = existsSync(join(tmpB, 'out', 'audit-measurements.json')) ? JSON.parse(readFileSync(join(tmpB, 'out', 'audit-measurements.json'), 'utf8')) : null;
  t('B7 measurements 移植溯源＋fact_count>0＋supersede_chain 在', !!meas && meas.fact_count > 0 && !!meas.supersede_chain && String(meas.pipeline && meas.pipeline.recalibration || '').indexOf('85-check') >= 0, meas && meas.fact_count);
  try { rmSync(tmpB, { recursive: true, force: true }); } catch (e) { }
}

// ---------- C. anysearch-cli 差分重校准（基准自持组级闸；产线化硬准入=同族基准对账后方可入 preview） ----------
// 语料来源＝仓内 frozen bundle（ADR-0026/#33）：钉值唯一权威=engine/baseline-lock.yaml anysearch-cli-adr-corpus 行
// version（pin_type=commit-sha），语料随 bundle 入库，**不再依赖同级仓**——无 sibling 的机器（含 CI）同样实跑 C1/C2/C3。
// 换钉＝手动窗口重打 bundle→改 baseline-lock（version/bundle_bytes/bundle_sha256 三值同窗）→重跑 C0~C6。
const AS_PIN_SHA = BASE_ROW ? BASE_ROW.version : null;
const PIN12 = (AS_PIN_SHA || '').slice(0, 12);
// 组级闸语义＝「冻结对象经在仓 bundle 可达」——need 族取 git-object:（幽灵钉：非任何分支祖先，clone 不携带；
//   本仓即用仓内 frozen bundle 物化），不是 asset:（该族=gitignored 外部资产，与本制品在仓的事实相反）。
const BUNDLE_HEADS = (function () { try { return execFileSync('git', ['bundle', 'list-heads', BUNDLE], { encoding: 'utf8' }).trim().split(/\r?\n/).filter(Boolean); } catch (e) { return []; } })();
const BUNDLE_OK = !!BUNDLE_BUF && BUNDLE_HEADS.length === 1 && BUNDLE_HEADS[0].indexOf(AS_PIN_SHA || '\u0000') === 0;
const DEPS_C = [
  need('git-object:' + (AS_PIN_SHA || 'anysearch-cli-adr-corpus'), BUNDLE_OK, '原因：仓内基准语料 bundle ' + BUNDLE_REL + ' 不在位、或它的 list-heads 不唯一指向 baseline-lock 钉值 ' + (PIN12 || '(baseline-lock 无钉值)') + '（Macro-C 差分重校准无基准）；手动修复：`git -C engine bundle verify ../' + BUNDLE_REL + '` 自证完整、`git bundle list-heads ../' + BUNDLE_REL + '` 核对唯一位＝钉值，缺失则从基线恢复该制品（换钉须同窗更新 version／bundle_bytes／bundle_sha256 三值）；无网影响面：bundle 在仓自足零联网，离线可修'),
  need('engine-deps:@duckdb/node-api', engineDepsOk(ENG, '@duckdb/node-api'))
];
if (groupProbe('85-check', 'C', DEPS_C)) {
  const MC = await import(pathToFileURL(join(ENG, 'dist', 'audit', 'macro-c.js')).href);
  const COL = await import(pathToFileURL(join(ENG, 'dist', 'collect', 'collectors.js')).href);
  const tmpC = mkdtempSync(join(tmpdir(), '85-recal-'));
  // 语料钉快照（R59 LOOP-1 TOCTOU 消除——predecl 2026-10-04-r59-loop-fix-predecl.md §1.1）：
  // 钉值来自 baseline-lock.yaml（pin_type=commit-sha）→ 仓内 frozen bundle `git clone` 至 OS temp 生成冻结面 AS_PIN；
  // engine 实跑与 oracle 重算同读此一份。clone 源是 bundle 文件而非任何活仓——工作树/HEAD 漂移与基准彻底解耦（#30/#33）。
  // 只读边界（D-074）：clone 只写 OS temp，主仓对象库零写；bundle 不 unbundle 进主仓。
  const SRC_HEAD = AS_PIN_SHA;
  const AS_PIN = join(tmpC, 'corpus');
  // 只读物化（env-contract cloneBundleWorktree）：`git clone <bundle>` 只写 OS 临时目录，
  // 主仓对象库零写、零 fetch、零 unbundle 进主仓（D-074）。
  if (!cloneBundleWorktree(BUNDLE, AS_PIN)) {
    t('C0 语料钉快照一致：bundle 物化 HEAD＝＝baseline-lock 钉值（TOCTOU 消除不变式）', false, 'git clone <bundle> 失败（bundle 损坏或 git 不可用）: ' + BUNDLE_REL);
    throw new Error('85-check/C 中止：bundle 物化失败——A11 已过而 clone 失败，属环境面故障（git 不可用/临时目录不可写）');
  }
  function gitO(args) { return execFileSync('git', ['-C', AS_PIN].concat(args), { encoding: 'utf8', maxBuffer: 256 * 1024 * 1024 }); }
  const HEAD_SHA = gitO(['rev-parse', 'HEAD']).trim();
  t('C0 语料钉快照一致：bundle 物化 HEAD＝＝baseline-lock 钉值（TOCTOU 消除不变式）', HEAD_SHA === SRC_HEAD, 'pin=' + HEAD_SHA.slice(0, 12) + ' src=' + String(SRC_HEAD).slice(0, 12));
  // C0b bundle 自证完整＋list-heads 唯一位即钉值（防「换了包但钉值没换」的静默漂移；C0 看物化结果，本条看制品声明）
  const bundleVerify = (function () { try { const r = spawnSync('git', ['-C', AS_PIN, 'bundle', 'verify', BUNDLE], { encoding: 'utf8' }); return r.status === 0; } catch (e) { return false; } })();
  t('C0b 仓内 bundle 自证完整（git bundle verify）＋list-heads 唯一项＝钉值', bundleVerify && BUNDLE_HEADS.length === 1 && BUNDLE_HEADS[0].indexOf(SRC_HEAD) === 0, 'verify=' + bundleVerify + ' heads=' + JSON.stringify(BUNDLE_HEADS));
  // (a) engine 一等面实跑（冻结面语料）
  const run = await MC.runMacroCAudit({ input: AS_PIN, outDir: join(tmpC, 'out') });
  const meas = run.measurements;
  const side = JSON.parse(run.sidecar_json);
  // (b) 编排层独立重算（38 §1/§2/§4 原逻辑逐行镜像——collectors 层与 38 同源 import dist，独立性边界=编排层；gitO 已在钉快照段定义并锁定 AS_PIN）
  const HEAD_DATE = gitO(['log', '-1', '--format=%cI']).trim();
  const COMMIT_COUNT = Number(gitO(['rev-list', '--count', 'HEAD']).trim());
  const rawLog = gitO(['log', '--pretty=format:__R__%H|%an|%cI', '--name-only']);
  const commits = [];
  let cur = null;
  for (const line of rawLog.split('\n')) {
    const tk = line.trim();
    if (tk.indexOf('__R__') === 0) { const parts = tk.slice(5).split('|'); cur = { sha: parts[0], author: parts[1], date: parts[2], paths: [] }; commits.push(cur); }
    else if (cur && tk.length > 0) { cur.paths.push(tk); }
  }
  t('C-INV 38 §1 PROBE-INVARIANT：解析数==rev-list 数', commits.length === COMMIT_COUNT, commits.length + ' vs ' + COMMIT_COUNT);
  const adrDirO = join(AS_PIN, 'docs', 'adr');
  const adrFilesO = readdirSync(adrDirO).filter(function (f) { return /^\d{3,}.*\.md$/i.test(f); }).sort();
  const firstCommitOfO = function (rel) { let best = null; for (const c of commits) { if (c.paths.indexOf(rel) >= 0 && (best === null || c.date < best)) { best = c.date; } } return best; };
  const adrDocsO = adrFilesO.map(function (f) { const rel = 'docs/adr/' + f; return { path: rel, text: readFileSync(join(adrDirO, f), 'utf8'), first_commit_date: firstCommitOfO(rel) }; });
  const oCtx = { runId: 'recal-oracle', traceId: COL.sha256Hex('recal|' + HEAD_SHA + '|' + HEAD_DATE).slice(0, 32), repoRef: 'anysearch-cli@' + HEAD_SHA, scale: 'Macro-C', observedAt: meas.observed_at };
  const adrFactsO = COL.collectAdrStructureV2({ documents: adrDocsO }, oCtx);
  const adrDateMapO = {};
  for (const f of adrFactsO) { if (f.metric === 'adr.decision_date') { const v = JSON.parse(f.value_json); if (v.date) { adrDateMapO[f.subject_ref] = String(v.date).slice(0, 10); } } }
  const gitFactsO = COL.collectGitlog({ commits: commits, paths: adrDocsO.map(function (d) { return d.path; }), adrDates: adrDateMapO }, oCtx);
  // supersede 链（38 §4 逐行镜像——非 macro-c.ts 导出复用，独立性=编排层）
  const adrsO = [];
  for (const d of adrDocsO) {
    const num = d.path.split('/').pop().match(/^(\d+)/)[1];
    const text = d.text;
    const statusLine = (text.match(/^\s*[-*]?\s*status\s*[:：][^\n]*/im) || [''])[0].trim();
    const wholeTo = (statusLine.match(/superseded\s+by\s+ADR-?(\d{3,})/i) || [])[1] || null;
    const inlineRefs = [];
    text.split('\n').forEach(function (line, i) {
      const sm = line.match(/superseded\s+by\s+ADR-?(\d{3,})/i) || line.match(/supersedes?\s+ADR-?(\d{3,})/i);
      if (sm && !/^\s*[-*]?\s*status\s*[:：]/i.test(line)) { const negated = /(does not|do not|not a|no longer|never)\s+supersede/i.test(line); inlineRefs.push({ line: i + 1, to: sm[1], negated: negated }); }
    });
    const amends = [], refs = [], defers = [];
    text.split('\n').forEach(function (line, i) {
      if (!/^\s*(Amends|References)\s*[:：]/i.test(line)) { return; }
      for (const mm of line.matchAll(/ADR-?(\d{3,})/gi)) { (/^Amends/i.test(line.trim()) ? amends : refs).push({ line: i + 1, to: mm[1] }); }
      for (const mm of line.matchAll(/defer-(\d{3,})/gi)) { defers.push({ line: i + 1, to: 'defer-' + mm[1] }); }
    });
    adrsO.push({ file: d.path, num: num, whole_to: wholeTo, inline: inlineRefs, amends: amends, refs: refs, defers: defers, mentions: Array.from(new Set(Array.from(text.matchAll(/ADR-?(\d{3,})/gi)).map(function (x) { return x[1]; }))) });
  }
  const numSetO = new Set(adrsO.map(function (a) { return a.num; }));
  const deferRegistryO = existsSync(join(AS_PIN, 'docs', 'deferred-registry.json'));
  const edgesO = [];
  for (const a of adrsO) {
    if (a.whole_to) { edgesO.push({ from: a.num, to: a.whole_to, kind: 'whole-adr-status', evidence: a.file + ' status-line' }); }
    for (const r2 of a.inline) { edgesO.push({ from: a.num, to: r2.to, kind: r2.negated ? 'explicit-non-supersede' : 'item-level-inline', evidence: a.file + ':' + r2.line }); }
    for (const r2 of a.amends) { edgesO.push({ from: a.num, to: r2.to, kind: 'amends', evidence: a.file + ':' + r2.line }); }
    for (const r2 of a.refs) { edgesO.push({ from: a.num, to: r2.to, kind: 'references', evidence: a.file + ':' + r2.line }); }
    for (const r2 of a.defers) { edgesO.push({ from: a.num, to: r2.to, kind: 'defer-ref', evidence: a.file + ':' + r2.line }); }
  }
  const SK = new Set(['whole-adr-status', 'item-level-inline']);
  for (const e of edgesO) {
    if (e.from === e.to) { e.kind = 'self-quote-artifact'; }
    if (e.kind === 'defer-ref') { e.resolved = deferRegistryO; } else { e.resolved = numSetO.has(e.to); }
    if (e.kind !== 'defer-ref' && e.resolved) { const target = adrsO.find(function (a) { return a.num === e.to; }); e.back_reference = target ? target.mentions.indexOf(e.from) >= 0 : false; } else { e.back_reference = null; }
  }
  const chainO = { edge_count: edgesO.length, whole_adr_supersessions: edgesO.filter(function (e) { return e.kind === 'whole-adr-status'; }).length, item_level_supersessions: edgesO.filter(function (e) { return e.kind === 'item-level-inline'; }).length, amends_edges: edgesO.filter(function (e) { return e.kind === 'amends'; }).length, references_edges: edgesO.filter(function (e) { return e.kind === 'references'; }).length, defer_ref_edges: edgesO.filter(function (e) { return e.kind === 'defer-ref'; }).length, explicit_non_supersedes: edgesO.filter(function (e) { return e.kind === 'explicit-non-supersede'; }).length, self_quote_artifacts: edgesO.filter(function (e) { return e.kind === 'self-quote-artifact'; }).length, unresolved_refs: edgesO.filter(function (e) { return !e.resolved && e.kind !== 'self-quote-artifact'; }).map(function (e) { return e.from + '->' + e.to; }), missing_backrefs: edgesO.filter(function (e) { return SK.has(e.kind) && e.resolved && e.back_reference === false; }).map(function (e) { return e.from + '->' + e.to; }) };
  // 对账比较器（值级全等——自检组 D 复用）
  function compareMetrics(a, b) {
    const v = [];
    for (const k of Object.keys(a)) { if (JSON.stringify(a[k]) !== JSON.stringify(b[k])) { v.push(k); } }
    return v;
  }
  const oracleMetrics = {
    head_sha: HEAD_SHA, commit_count: COMMIT_COUNT,
    adr_count: adrsO.length,
    adr_date_resolvable: adrFactsO.filter(function (f) { return f.metric === 'adr.decision_date' && JSON.parse(f.value_json).date !== null; }).length,
    lag_judgeable_n: gitFactsO.filter(function (f) { return f.metric === 'git.adr_lag_days'; }).length,
    adr_leg_distribution: (function () { const ld = {}; for (const f of adrFactsO) { if (f.metric === 'adr.header_field_present' || f.metric === 'adr.decision_date') { const v = JSON.parse(f.value_json); const leg = v.leg || 'miss'; ld[leg] = (ld[leg] || 0) + 1; } } return ld; })(),
    chain: chainO
  };
  const runMetrics = {
    head_sha: meas.head_sha, commit_count: meas.commit_count,
    adr_count: meas.adr_count,
    adr_date_resolvable: meas.adr_date_resolvable,
    lag_judgeable_n: meas.lag_judgeable_n,
    adr_leg_distribution: meas.adr_leg_distribution,
    chain: meas.supersede_chain
  };
  const chainDiff = compareMetrics({ c: JSON.stringify(oracleMetrics.chain) }, { c: JSON.stringify(runMetrics.chain) });
  const baseDiff = compareMetrics(
    { head_sha: oracleMetrics.head_sha, commit_count: oracleMetrics.commit_count, adr_count: oracleMetrics.adr_count, adr_date_resolvable: oracleMetrics.adr_date_resolvable, lag_judgeable_n: oracleMetrics.lag_judgeable_n, adr_leg_distribution: JSON.stringify(oracleMetrics.adr_leg_distribution) },
    { head_sha: runMetrics.head_sha, commit_count: runMetrics.commit_count, adr_count: runMetrics.adr_count, adr_date_resolvable: runMetrics.adr_date_resolvable, lag_judgeable_n: runMetrics.lag_judgeable_n, adr_leg_distribution: JSON.stringify(runMetrics.adr_leg_distribution) });
  t('C1 编排层对账：head/commit_count/adr_count/date_resolvable/lag/leg_dist 全等', baseDiff.length === 0, 'diff=' + baseDiff.join(',') + ' oracle=' + JSON.stringify({ a: oracleMetrics.adr_count, l: oracleMetrics.lag_judgeable_n }) + ' run=' + JSON.stringify({ a: runMetrics.adr_count, l: runMetrics.lag_judgeable_n }));
  t('C2 supersede 链十计数全等（38 §4 镜像 vs engine 面）', chainDiff.length === 0, JSON.stringify({ o: { e: oracleMetrics.chain.edge_count, u: oracleMetrics.chain.unresolved_refs.length }, r: { e: runMetrics.chain.edge_count, u: runMetrics.chain.unresolved_refs.length } }));
  // chainFact fact_id 全等（勘误三：deriveFactId 熵源=collector|subject|metric|value|observedAt——纯文本扫描零日期暴露）
  const chainFactO = COL.makeFact(oCtx, COL.ADR_STRUCTURE_V2_DESCRIPTOR, 'docs/adr/*', 'docs/adr/* status+inline scan', 'adr.supersede_chain_summary', oracleMetrics.chain);
  const runChainFact = (function () { const lines = readFileSync(join(tmpC, 'out', 'audit-facts.jsonl'), 'utf8').split('\n').filter(Boolean); for (const l of lines) { const f = JSON.parse(l); if (f.metric === 'adr.supersede_chain_summary') { return f; } } return null; })();
  t('C3 chainFact fact_id 全等（移植值级保真——同语料同 HEAD）', !!runChainFact && runChainFact.fact_id === chainFactO.fact_id, (runChainFact ? runChainFact.fact_id : 'absent') + ' vs ' + chainFactO.fact_id);
  // 判据 band 对账（oracle 判据谓词独立实现——阈值常量同源 MACRO_C_LAG_MIN_N）
  const bands = {};
  for (const e of side.adjudication.entries) { bands[e.criterion_id] = e.band; }
  const oPc1 = meas.codelore.pinned && meas.codelore.facet_rows === meas.codelore.facet_rows_expected && meas.codelore.facet_errors.length === 0 && meas.adr_count > 0;
  const oPc2 = (function () { const fc = gitFactsO.filter(function (f) { return f.metric === 'git.first_commit'; }).length; return fc >= adrsO.length - 2; })();
  const oTc1 = chainO.edge_count >= 1 && chainO.unresolved_refs.length === 0 && chainO.missing_backrefs.length === 0;
  const oTc2 = oracleMetrics.lag_judgeable_n >= MC.MACRO_C_LAG_MIN_N;
  const oTc3 = meas.llm_gate.configured === true && meas.llm_narrative_count >= 1;
  t('C4 band 对账 PC-MC-1/PC-MC-2/TC-MC-1/TC-MC-2/TC-MC-3', bands['PC-MC-1'] === (oPc1 ? 'supported' : 'insufficient') && bands['PC-MC-2'] === (oPc2 ? 'supported' : 'insufficient') && bands['TC-MC-1'] === (oTc1 ? 'supported' : 'insufficient') && bands['TC-MC-2'] === (oTc2 ? 'supported' : 'insufficient') && bands['TC-MC-3'] === (oTc3 ? 'supported' : 'insufficient'), JSON.stringify({ o: { pc1: oPc1, pc2: oPc2, tc1: oTc1, tc2: oTc2, tc3: oTc3 }, r: bands }));
  t('C5 NC-MC-1 候选化选材五件套 0 命中（apps/cli/package.json 列首——38 同位）', bands['NC-MC-1'] === 'supported', bands['NC-MC-1']);
  t('C6 运行产物清盘（临时目录即弃）', (function () { try { rmSync(tmpC, { recursive: true, force: true }); return true; } catch (e) { return false; } })());
}

// ---------- D. 自检组（预声明 §2.4 命中方向：构造偏差必须红） ----------
(function () {
  function compareMetrics(a, b) { const v = []; for (const k of Object.keys(a)) { if (JSON.stringify(a[k]) !== JSON.stringify(b[k])) { v.push(k); } } return v; }
  const base = { adr_count: 97, lag_judgeable_n: 97, chain: { edge_count: 9, unresolved: [] } };
  t('D1 负对照：同对象双算 → 0 违规（绿）', compareMetrics(base, JSON.parse(JSON.stringify(base))).length === 0);
  t('D2 正对照：adr_count 篡改 → 检出（红）', compareMetrics(base, Object.assign({}, base, { adr_count: 96 })).indexOf('adr_count') >= 0);
  t('D3 正对照：chain 篡改 → 检出（红）', compareMetrics(base, Object.assign({}, base, { chain: { edge_count: 8, unresolved: [] } })).indexOf('chain') >= 0);
})();


// ---------- E. Micro-A 差分重校准（#85②；引擎面 cassette 回放 vs 48 生成器 golden 存档——产线化前置=同族基准差分重校准；predecl 2026-10-05-r63-t1-predecl.md §1.3 等值集） ----------
const DEPS_E = [need('engine-deps:@duckdb/node-api', engineDepsOk(ENG, '@duckdb/node-api'))];
if (groupProbe('85-check', 'E', DEPS_E)) {
  const MAM = await import(pathToFileURL(join(ENG, 'dist', 'audit', 'micro-a.js')).href);
  const MOD48 = await import(pathToFileURL(join(HERE, '48-micro-a-preview.mjs')).href);
  const NL_E = String.fromCharCode(10);
  const tmpE = mkdtempSync(join(tmpdir(), '85-recal-microa-'));
  // 引擎面 cassette 回放（48 goldenMain 同构注入——离线零网络）
  const casE = JSON.parse(readFileSync(join(REPO, 'engine', 'test', 'fixtures', 'github-rest', 'authenticated.cassette.json'), 'utf8'));
  const casAugE = { name: casE.name + '+85e', recorded: 'derived', calls: casE.calls.concat([casE.calls[3]]) };
  const capE = [];
  function cassetteFetcherE(cas, cap) { let i = 0; return async function (req) { cap.push(req); if (i >= cas.calls.length) { throw new Error('cassette exhausted at ' + req.url); } const c = cas.calls[i++]; if (req.method !== c.request.method) { throw new Error('method mismatch'); } if (!req.url.endsWith(c.request.path)) { throw new Error('path mismatch'); } const acc = c.request.accept || 'application/vnd.github+json'; if (req.accept !== acc) { throw new Error('accept mismatch'); } return { status: c.response.status, headers: c.response.headers || {}, body: typeof c.response.body === 'string' ? c.response.body : JSON.stringify(c.response.body) }; }; }
  const sharedE = { env: { GITHUB_TOKEN: 'GOLDEN-PLACEHOLDER' }, ghTokenProbe: function () { return { available: false, token: null }; }, fetcher: cassetteFetcherE(casAugE, capE) };
  const runAtE = MAM.deterministicRunAt();
  const t1E = { name: 'env-manager', owner: 'Xxx91n', repo: 'env-manager', root: null, pins: MAM.MICRO_A_GOLDEN_PRS };
  const collectedE = await MAM.collectMicroA(t1E, sharedE, MAM.MICRO_A_GOLDEN_DIFFS, runAtE);
  const measNameE = 'audit-measurements.json';
  const factsNameE = 'audit-facts.jsonl';
  writeFileSync(join(tmpE, measNameE), JSON.stringify({ repos: ['env-manager'], prs_listed: collectedE.res.prs_listed }, null, 2) + NL_E, 'utf8');
  writeFileSync(join(tmpE, factsNameE), collectedE.res.facts.map(function (f) { return JSON.stringify(f); }).join(NL_E) + NL_E, 'utf8');
  const gateE = { merged_prs: collectedE.mergedCount, eligible: true };
  const e64 = await MAM.buildPrReportMicroA(t1E, { n: 64, form: 'machine-generated/release-please' }, collectedE, gateE, sharedE, { golden: true, outDir: tmpE, measName: measNameE, factsName: factsNameE });
  const e51 = await MAM.buildPrReportMicroA(t1E, { n: 51, form: 'human' }, collectedE, gateE, sharedE, { golden: true, outDir: tmpE, measName: measNameE, factsName: factsNameE });
  // oracle=48 生成器 golden 存档（48-check B1 同窗再生实物）
  const g64 = JSON.parse(readFileSync(join(REPO,'engine','test','fixtures','contracts','48-micro-a-golden-env-manager-pr64.json'), 'utf8'));
  const g51 = JSON.parse(readFileSync(join(REPO,'engine','test','fixtures','contracts','48-micro-a-golden-env-manager-pr51.json'), 'utf8'));
  const e64sc = JSON.parse(readFileSync(join(tmpE, e64.outputs.sidecar), 'utf8'));
  const e51sc = JSON.parse(readFileSync(join(tmpE, e51.outputs.sidecar), 'utf8'));
  function bandMap(sc) { const m = {}; for (const e of sc.adjudication.entries) { m[e.criterion_id] = e.band; } return m; }
  function diffKeys(a, b) { const v = []; for (const k of Object.keys(a)) { if (JSON.stringify(a[k]) !== JSON.stringify(b[k])) { v.push(k); } } return v; }
  t('E0 切片字段契约双源互等（engine micro-a.ts vs 48 生成器导出——禁手抄漂移）', JSON.stringify(MAM.MICRO_A_SLICE_FIELDS) === JSON.stringify(MOD48.MICRO_A_SLICE_FIELDS));
  const b64E = bandMap(e64sc); const b64G = bandMap(g64);
  t('E1 pr64 六判据 band 全等（引擎面 vs 48 golden 存档）', JSON.stringify(b64E) === JSON.stringify(b64G), JSON.stringify({ e: b64E, g: b64G }));
  t('E2 pr51 六判据 band 全等', JSON.stringify(bandMap(e51sc)) === JSON.stringify(bandMap(g51)), JSON.stringify({ e: bandMap(e51sc), g: bandMap(g51) }));
  function sliceOf(sc) { const q = sc.quadrants.filter(function (x) { return x.quadrant === 'behavior'; })[0]; const pick = {}; for (const k of ['author_form', 'merged', 'diff_channel', 'diff_files_changed', 'diff_additions', 'diff_deletions', 'diff_bytes', 'credential_strategy', 'credential_degraded', 'api_calls', 'rate_limit_remaining']) { pick[k] = q.slice_fields[k]; } return pick; }
  t('E3 pr64 切片数值字段全等', diffKeys(sliceOf(e64sc), sliceOf(g64)).length === 0, JSON.stringify(diffKeys(sliceOf(e64sc), sliceOf(g64))));
  t('E4 pr51 切片数值字段全等', diffKeys(sliceOf(e51sc), sliceOf(g51)).length === 0, JSON.stringify(diffKeys(sliceOf(e51sc), sliceOf(g51))));
  t('E5 fact_id 全等（pr64 三联＋pr51 双件——ctx 构造同字节）', JSON.stringify(e64sc.fact_ids) === JSON.stringify(g64.fact_ids) && JSON.stringify(e51sc.fact_ids) === JSON.stringify(g51.fact_ids), JSON.stringify({ e64: e64sc.fact_ids, g64: g64.fact_ids }));
  t('E6 披露块翻转双侧全等（capability 3 of 5 · preview＋not_in_preview=[Macro-A]）', e64sc.preview_disclosure.capability_label === g64.preview_disclosure.capability_label && JSON.stringify(e64sc.preview_disclosure.not_in_preview) === JSON.stringify(g64.preview_disclosure.not_in_preview) && e64sc.preview_disclosure.capability_label === 'capability 3 of 5 · preview', JSON.stringify(e64sc.preview_disclosure.not_in_preview));
  t('E7 token 进 wire 不入 fact（双通道同纪律）', capE.every(function (q) { return q.token === 'GOLDEN-PLACEHOLDER'; }) && JSON.stringify(collectedE.res.facts).indexOf('GOLDEN-PLACEHOLDER') < 0);
  // 正对照（mutation-kill——比较器构造偏差必须检出）
  const tampered = Object.assign({}, b64G, { 'TC-1': 'insufficient' });
  t('E8 正对照：band 篡改必须检出（红）', diffKeys(b64G, tampered).indexOf('TC-1') >= 0);
  t('E9 overall_verdict＋structural_limitations 双侧全等（pr64＋pr51——predecl §1.3 等值集补位，R64 审计返修 P2-2）', e64sc.overall_verdict === g64.overall_verdict && e51sc.overall_verdict === g51.overall_verdict && JSON.stringify(e64sc.preview_disclosure.structural_limitations) === JSON.stringify(g64.preview_disclosure.structural_limitations) && JSON.stringify(e51sc.preview_disclosure.structural_limitations) === JSON.stringify(g51.preview_disclosure.structural_limitations), JSON.stringify({ e: e64sc.overall_verdict, g: g64.overall_verdict }));
  try { rmSync(tmpE, { recursive: true, force: true }); } catch (e) { }
}
console.log('---');
console.log(fail === 0 ? 'PASS ' + pass + '/' + (pass + fail) : 'FAIL ' + fail + '/' + (pass + fail));
process.exit(fail === 0 ? 0 : 1);
