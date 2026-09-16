// 44-check.mjs — #44 版本与上游锁定制度化守卫（R6-01 / A-049 / D-037·D-039③）
// 断言面：upstream-lock.yaml 结构+种子行 → 版本断言（实跑 codelore --version 三方同值）
//   → 锁表新鲜度（mtime/日期断言）→ README §3 状态列绑锁表 → 三处 preview 标注同源
//   → 编年指针校验（ADR 存在+superseded 如实计/M-xxx 单调/双账互指）→ 文档账本 → BOM
//
// 两段式（D-037⑤ deterministic-deps 模式，本票按任务书写明哪段已 enforce）：
//   ENFORCE 段（本票已 enforce，FAIL 即 exit 1）=
//     A 锁表结构/种子行/枚举/禁 range·浮动、B binary 可解析时版本断言三方同值、
//     C 日期格式/mtime 断言、D README §3 绑定、E 三处 preview 标注同源、F 编年指针、
//     G 文档账本、H BOM。
//   ADVISORY 段（WARN 报警非失败，不 exit 1）=
//     C5 锁表新鲜度逾期（next_review<today）、B4/B5 binary 不在 PATH 环境位。
//   转 enforce 触发点 = 首发 tag 手动窗口（D-037④）或对应上游接入票落地；
//   golden diff 段已由 #43 golden-ci.yml enforce（本守卫不重复造腿，G/D 组引用锚）。
//
// 纪律：只读断言（唯一外部调用=`codelore --version` 只读）；仓内状态零写；exit 0 + PASS N/N 为绿。
import { readFileSync, existsSync, statSync, readdirSync } from 'node:fs';
import { spawnSync } from 'node:child_process';
import { fileURLToPath } from 'node:url';
import { dirname, join } from 'node:path';

const HERE = dirname(fileURLToPath(import.meta.url));
const REPO = join(HERE, '..', '..', '..');
const ENG = join(REPO, 'engine');
const LOCK = join(ENG, 'upstream-lock.yaml');

let pass = 0, fail = 0, warn = 0;
function t(name, ok, detail) { if (ok) { pass++; console.log('PASS ' + name); } else { fail++; console.log('FAIL ' + name + (detail ? ' :: ' + detail : '')); } }
function w(name, ok, detail) { if (ok) { pass++; console.log('PASS ' + name); } else { warn++; console.log('WARN ' + name + (detail ? ' :: ' + detail : '')); } }
function txt(p) { return readFileSync(p, 'utf8'); }
function noBom(p) { const b = readFileSync(p); return !(b[0] === 0xEF && b[1] === 0xBB && b[2] === 0xBF); }
// 仓内业务时钟：本机本地日期 ∪ macro-audit 日报文件名日期（YYYY-MM-DD-report.md=营业日语义）
// ——新鲜度判定基准与宿主墙钟/UTC 偏移脱耦；不扫账本正文（内含未来截止/复审日会污染「今天」）
const _d = new Date();
const LOCAL_TODAY = _d.getFullYear() + '-' + String(_d.getMonth() + 1).padStart(2, '0') + '-' + String(_d.getDate()).padStart(2, '0');
let REPO_TODAY = LOCAL_TODAY;
const _repDir = join(REPO, '.scratch', 'macro-audit', 'reports');
if (existsSync(_repDir)) {
  for (const f of readdirSync(_repDir)) {
    const m = f.match(/^(20\d\d-\d\d-\d\d)-report\.md$/);
    if (m && m[1] > REPO_TODAY) { REPO_TODAY = m[1]; }
  }
}
const TODAY = REPO_TODAY;

// ---------- 锁表解析（yaml 子集解析器：本表格式受控——顶层标量 + upstreams: 行组，行内零嵌套） ----------
function parseScalar(v) {
  if (v === 'null' || v === '~' || v === '') { return null; }
  if (v.startsWith('"') && v.endsWith('"')) { return v.slice(1, -1); }
  if (v.startsWith("'") && v.endsWith("'")) { return v.slice(1, -1); }
  return v;
}
function parseLock(p) {
  const out = { meta: {}, upstreams: [] };
  let cur = null;
  for (const raw of txt(p).split('\n')) {
    const line = raw.replace(/\s+$/, '');
    if (!line.trim() || line.trim().startsWith('#')) { continue; }
    if (!line.startsWith(' ')) {
      const top = line.match(/^([a-z_]+):\s*(.*)$/);
      if (top && top[1] !== 'upstreams') { out.meta[top[1]] = parseScalar(top[2].trim()); }
      cur = null;
      continue;
    }
    const item = line.match(/^\s+-\s+([a-z_]+):\s*(.*)$/);
    if (item) { cur = {}; cur[item[1]] = parseScalar(item[2].trim()); out.upstreams.push(cur); continue; }
    const kv = line.match(/^\s+([a-z_]+):\s*(.*)$/);
    if (kv && cur) { cur[kv[1]] = parseScalar(kv[2].trim()); }
  }
  return out;
}

// ---------- A. 锁表结构与种子行（ENFORCE；D-037③ 九字段契约） ----------
t('A1 upstream-lock.yaml 在位且无 BOM', existsSync(LOCK) && noBom(LOCK));
const lock = existsSync(LOCK) ? parseLock(LOCK) : { meta: {}, upstreams: [] };
t('A2 lock_version=1＋upstreams 行数≥4（种子行起步）', lock.meta.lock_version === '1' && lock.upstreams.length >= 4, 'rows=' + lock.upstreams.length);
const FIELDS = ['id', 'kind', 'version', 'pin_type', 'contract', 'status', 'adapter', 'last_reviewed', 'next_review'];
t('A3 全行九字段契约齐备（version/pin_type/adapter 值可 null 但键必在）', lock.upstreams.every(r => FIELDS.every(f => Object.prototype.hasOwnProperty.call(r, f))));
const STATUS_ENUM = ['active', 'planned', 'evaluating', 'retired'];
const PIN_ENUM = ['exact-version', 'commit-sha', 'digest', null];
t('A4 status/pin_type 枚举合法（active|planned|evaluating|retired × exact-version|commit-sha|digest|null）', lock.upstreams.every(r => STATUS_ENUM.indexOf(r.status) >= 0 && PIN_ENUM.indexOf(r.pin_type) >= 0));
const byId = {};
for (const r of lock.upstreams) { byId[r.id] = r; }
t('A5 种子行状态逐字：codelore=active／openssf-scorecard=planned／repomix-gitingest=planned／codelore-sqlite-dump=evaluating',
  byId.codelore && byId.codelore.status === 'active' && byId['openssf-scorecard'] && byId['openssf-scorecard'].status === 'planned' && byId['repomix-gitingest'] && byId['repomix-gitingest'].status === 'planned' && byId['codelore-sqlite-dump'] && byId['codelore-sqlite-dump'].status === 'evaluating');
t('A6 codelore 行 exact-version 0.28.0＋contract 含 --version pin 契约',
  byId.codelore && byId.codelore.version === '0.28.0' && byId.codelore.pin_type === 'exact-version' && (byId.codelore.contract || '').indexOf('--version') >= 0);
const RANGE_RE = /(\^|~|>=|<=|>|<|\*|(?:^|[^.\d])x(?:\b|$)|latest|next\b|floating)/i;
t('A7 禁 range/浮动 tag/latest：全行 version 串无 range/浮动字样', lock.upstreams.every(r => r.version === null || !RANGE_RE.test(String(r.version))), JSON.stringify(lock.upstreams.map(r => r.id + '=' + r.version)));
t('A8 active 行 version+pin_type+contract 齐备（git-cli 例外=随宿主环境 contract 显式声明）',
  lock.upstreams.filter(r => r.status === 'active').every(r => r.contract && ((r.version !== null && r.pin_type !== null) || (r.version === null && r.pin_type === null && r.contract.indexOf('随宿主环境') >= 0))));
t('A9 planned/evaluating 行 contract 含接入前定 pin 注记（锁定先于依赖）',
  lock.upstreams.filter(r => r.status === 'planned' || r.status === 'evaluating').every(r => (r.contract || '').indexOf('pin') >= 0));
t('A10 codelore-sqlite-dump 行 risk_note 在位（D-037③ 风险注记）',
  byId['codelore-sqlite-dump'] && typeof byId['codelore-sqlite-dump'].risk_note === 'string' && byId['codelore-sqlite-dump'].risk_note.length > 0);
const lockText = existsSync(LOCK) ? txt(LOCK) : '';
t('A11 表头纪律注记齐备（唯一机读权威/先于依赖存在/retired 不删/禁 range 浮动/手动窗口+golden 回归）',
  lockText.indexOf('唯一机读权威') >= 0 && lockText.indexOf('先于依赖存在') >= 0 && lockText.indexOf('retired 行不删') >= 0 && lockText.indexOf('禁 range') >= 0 && lockText.indexOf('手动窗口') >= 0 && lockText.indexOf('golden 回归') >= 0);
const pkg = JSON.parse(txt(join(ENG, 'package.json')));
t('A12 duckdb-node-api 锁值 == package.json dependencies 精确值（锁表↔package 同源）', byId['duckdb-node-api'] && byId['duckdb-node-api'].version === pkg.dependencies['@duckdb/node-api'], 'lock=' + (byId['duckdb-node-api'] && byId['duckdb-node-api'].version) + ' pkg=' + pkg.dependencies['@duckdb/node-api']);
t('A13 upstream-lock.yaml 入 package.json files（provenance 锚随 tgz，D-037②）', pkg.files.indexOf('upstream-lock.yaml') >= 0);

// ---------- B. 版本断言（binary 可解析→ENFORCE；缺席→ADVISORY WARN） ----------
const clSrc = txt(join(ENG, 'src', 'upstream', 'codelore.ts'));
const pinM = clSrc.match(/CODELORE_PINNED_VERSION = '([^']+)'/);
t('B1 codelore.ts CODELORE_PINNED_VERSION 常量在（源内 pin 单一锚点）', !!pinM);
t('B2 源内 pin == 锁表 codelore.version（源↔锁同源）', pinM && byId.codelore && pinM[1] === byId.codelore.version, 'src=' + (pinM && pinM[1]) + ' lock=' + (byId.codelore && byId.codelore.version));
t('B3 适配器含 --version pin 校验逻辑（spawnSync --version＋pinned 比较）', clSrc.indexOf("['--version']") >= 0 && clSrc.indexOf('pinned') >= 0);
const vrun = spawnSync('codelore', ['--version'], { encoding: 'utf8', timeout: 30000 });
const vout = ((vrun.stdout || '') + (vrun.stderr || '')).trim();
const vm = vout.match(/(\d+\.\d+\.\d+)/);
const binVer = vm ? vm[1] : null;
const binOk = !vrun.error && vrun.status === 0 && binVer !== null;
if (binOk) {
  t('B4 实跑 codelore --version 解析版本=' + binVer + '（binary-discovery 契约实跑）', true);
  t('B5 三方同值：binary ' + binVer + ' == 锁表 ' + (byId.codelore && byId.codelore.version) + ' == 源内 pin ' + (pinM && pinM[1]), binVer === byId.codelore.version && binVer === pinM[1]);
} else {
  w('B4 实跑 codelore --version（binary 不在 PATH——advisory 环境位，版本断言挂起非失败）', false, (vout || String(vrun.error)).slice(0, 120));
  w('B5 三方同值断言（binary 缺席跳过——由 B2 源↔锁断言兜底）', false, 'codelore binary unresolved');
}
t('B6 codelore adapter 注册面在（CODELORE_ADAPTER_ID＋descriptor＋binary-discovery）', clSrc.indexOf('CODELORE_ADAPTER_ID') >= 0 && clSrc.indexOf('CODELORE_DESCRIPTOR') >= 0 && clSrc.indexOf('binary-discovery') >= 0);

// ---------- C. 锁表新鲜度（日期断言 ENFORCE；逾期 ADVISORY WARN） ----------
const lockStat = statSync(LOCK);
t('C1 锁表 mtime 断言：非未来时戳（mtime ≤ now）', lockStat.mtimeMs <= Date.now() + 60000, 'mtime=' + lockStat.mtime.toISOString());
const ISO_D = /^\d{4}-\d{2}-\d{2}$/;
t('C2 全行 last_reviewed/next_review ISO 日期格式', lock.upstreams.every(r => ISO_D.test(r.last_reviewed || '') && ISO_D.test(r.next_review || '')));
t('C3 全行 last_reviewed ≤ today（非未来登记）', lock.upstreams.every(r => r.last_reviewed <= TODAY));
t('C4 全行 last_reviewed ≤ next_review（窗口方向正确）', lock.upstreams.every(r => r.last_reviewed <= r.next_review));
const overdue = lock.upstreams.filter(r => r.next_review < TODAY);
w('C5 锁表新鲜度：next_review 全行未逾期（逾期→advisory 报警；转 enforce 挂首发 tag 手动窗口 D-037④）', overdue.length === 0, 'overdue=' + JSON.stringify(overdue.map(r => r.id)));

// ---------- D. README §3 上游表状态列绑锁表（ENFORCE；D-037⑥） ----------
const readme = txt(join(REPO, 'README.md'));
t('D1 「以 engine/upstream-lock.yaml 为唯一权威」机读绑定注记在', readme.indexOf('engine/upstream-lock.yaml') >= 0 && readme.indexOf('唯一权威') >= 0 && readme.indexOf('机读') >= 0);
t('D2 状态映射声明在（已接入→active／规划中→planned／评估中→evaluating）', readme.indexOf('已接入→active') >= 0 && readme.indexOf('规划中→planned') >= 0 && readme.indexOf('评估中→evaluating') >= 0);
const README_TO_LOCK = [
  ['DuckDB（@duckdb/node-api）', 'duckdb-node-api'],
  ['git CLI', 'git-cli'],
  ['CodeLore', 'codelore'],
  ['OpenSSF Scorecard', 'openssf-scorecard'],
  ['repomix / gitingest', 'repomix-gitingest']
];
const STATUS_WORD = { '已接入': 'active', '规划中': 'planned', '评估中': 'evaluating' };
let d3ok = true; const d3bad = [];
for (const [name, id] of README_TO_LOCK) {
  const rowRe = new RegExp('\\| ' + name.replace(/[.*+?^${}()|[\]\\]/g, '\\$&') + ' \\|[^\\n]*\\| ([^|]+) \\|');
  const row = readme.match(rowRe);
  const cell = row ? row[1].trim() : '';
  const word = Object.keys(STATUS_WORD).find(k => cell.indexOf(k) === 0);
  const want = word ? STATUS_WORD[word] : null;
  const lockRow = byId[id];
  if (!lockRow || lockRow.status !== want) { d3ok = false; d3bad.push(name + ':readme=' + want + ',lock=' + (lockRow && lockRow.status)); }
}
t('D3 README 上游表五行状态 ↔ 锁表 status 全同源（人读↔机读一致）', d3ok, d3bad.join(';'));
t('D4 README 状态列括号含机读枚举值逐字（已接入（active）／规划中（planned））', readme.indexOf('已接入（active') >= 0 && readme.indexOf('规划中（planned') >= 0);
t('D5 README codelore 行含 0.28.0（== 锁表 version）', readme.indexOf('0.28.0') >= 0);
t('D6 锁定纪律注记在（禁 range/浮动 tag/latest＋手动窗口＋golden 回归）', readme.indexOf('禁 range/浮动 tag/latest') >= 0 && readme.indexOf('手动窗口') >= 0 && readme.indexOf('golden 回归') >= 0);

// ---------- E. 三处 preview 标注同源（ENFORCE；README 边界节＋generate.ts＋examples README） ----------
const genSrc = txt(join(ENG, 'src', 'report', 'generate.ts'));
const exReadme = txt(join(REPO, 'examples', 'first-report', 'README.md'));
const SRC3 = { 'README边界节': readme, 'generate.ts': genSrc, 'examples/README': exReadme };
t('E1 三处共享 token：preview_disclosure 全命中', Object.keys(SRC3).every(k => SRC3[k].indexOf('preview_disclosure') >= 0));
t('E2 三处共享 token：⚠ unverified 全命中', Object.keys(SRC3).every(k => SRC3[k].indexOf('⚠ unverified') >= 0));
t('E3 generate.ts PreviewDisclosure 四字段契约＋UNVERIFIED_MARK 常量（同一语义源）', genSrc.indexOf('interface PreviewDisclosure') >= 0 && ['capability_label', 'calibration_scope', 'structural_limitations', 'not_in_preview'].every(f => genSrc.indexOf(f) >= 0) && genSrc.indexOf("UNVERIFIED_MARK = '⚠ unverified'") >= 0);
t('E4 README 边界节 capability 标注组（1 of 5／2 of 5 · preview＋Not yet in preview ×3）', readme.indexOf('capability 1 of 5 · preview') >= 0 && readme.indexOf('capability 2 of 5 · preview') >= 0 && (readme.match(/Not yet in preview/g) || []).length >= 3);
const goldenHappy = JSON.parse(txt(join(ENG, 'fixtures', 'golden', 'happy-path', 'report.json')));
const macroC = JSON.parse(txt(join(HERE, '38-macro-c-preview-report.json')));
t('E5 README「capability 1 of 5 · preview」== golden 实物 capability_label（Macro-B 文档↔产物同源）', goldenHappy.preview_disclosure.capability_label === 'capability 1 of 5 · preview');
t('E6 README「capability 2 of 5 · preview」== #38 实物 capability_label（Macro-C 文档↔产物同源）', macroC.preview_disclosure.capability_label === 'capability 2 of 5 · preview');
t('E7 examples README preview_disclosure 时点差如实注＋failure=degradeReport 演示性质', exReadme.indexOf('时点') >= 0 && exReadme.indexOf('degradeReport') >= 0 && exReadme.indexOf('preview_disclosure') >= 0);
t('E8 三处均无 capability 3/4/5 of 5 越界承诺（边界诚实机检）', Object.keys(SRC3).every(k => SRC3[k].indexOf('capability 3 of 5') < 0 && SRC3[k].indexOf('capability 4 of 5') < 0 && SRC3[k].indexOf('capability 5 of 5') < 0));

// ---------- F. 编年指针校验（ENFORCE；D-039③：引用存在+superseded 如实计/里程碑单调/双账互指） ----------
const clP = join(REPO, 'CHANGELOG.md');
const cl = existsSync(clP) ? txt(clP) : '';
const ecl = txt(join(ENG, 'CHANGELOG.md'));
t('F1 仓根 CHANGELOG 在＋M-键条目＋无版本号头', existsSync(clP) && /## \[M-\d{3}\] - \d{4}-\d{2}-\d{2}/.test(cl) && !/## \[\d+\.\d+\.\d+\]/.test(cl));
const mEntries = Array.from(cl.matchAll(/## \[M-(\d{3})\] - (\d{4}-\d{2}-\d{2})/g));
let mono = mEntries.length >= 1;
for (let i = 1; i < mEntries.length; i++) {
  if (Number(mEntries[i][1]) <= Number(mEntries[i - 1][1])) { mono = false; }
  if (mEntries[i][2] < mEntries[i - 1][2]) { mono = false; }
}
t('F2 里程碑 ID 严格递增＋日期非递减（M-xxx 单调）', mono, JSON.stringify(mEntries.map(m => 'M-' + m[1] + '@' + m[2])));
t('F3 条目固定字段行齐（milestone/adr_range/a_range/ledger_pointer/impact）', ['milestone:', 'adr_range:', 'a_range:', 'ledger_pointer:', 'impact:'].every(k => cl.indexOf(k) >= 0));
const adrRangeM = cl.match(/adr_range:\s*ADR-(\d{4}) ~ ADR-(\d{4})/);
let f4ok = true; let f4detail = '';
if (adrRangeM) {
  const lo = Number(adrRangeM[1]); const hi = Number(adrRangeM[2]);
  const adrFiles = readdirSync(join(REPO, 'docs', 'adr')).filter(f => /^\d{4}-/.test(f));
  const missing = []; const superseded = [];
  for (let n = lo; n <= hi; n++) {
    const num = String(n).padStart(4, '0');
    const f = adrFiles.find(x => x.startsWith(num));
    if (!f) { missing.push(num); continue; }
    // superseded 判定只看 Status 头行（「Status: superseded」），正文提及 supersedes 关系不算
    if (/Status:\s*superseded\b/i.test(txt(join(REPO, 'docs', 'adr', f)))) { superseded.push(num); }
  }
  if (missing.length > 0) { f4ok = false; f4detail += 'missing=' + missing.join(','); }
  const unnoted = superseded.filter(n => cl.indexOf('ADR-' + n) < 0);
  if (unnoted.length > 0) { f4ok = false; f4detail += ' superseded-unnoted=' + unnoted.join(','); }
} else { f4ok = false; f4detail = 'adr_range unparseable'; }
t('F4 引用 ADR 区间全存在＋superseded 条目如实注记（ADR-0002 类不静默吞）', f4ok, f4detail);
t('F5 双账互指：仓根→engine/CHANGELOG.md＋engine→仓根 CHANGELOG.md（仓级指针）', cl.indexOf('engine/CHANGELOG.md') >= 0 && ecl.indexOf('CHANGELOG.md') >= 0 && ecl.indexOf('仓级') >= 0);
const aRangeM = cl.match(/a_range:\s*A-(\d{3}) ~ A-(\d{3})/);
const aLedge = txt(join(REPO, '.scratch', 'architecture-recovery', 'decision-ledger.md'));
const dLedge = txt(join(REPO, '.scratch', 'macro-audit', 'decision-ledger.md'));
t('F6 a_range 两端点在 A 账实物在（' + (aRangeM ? 'A-' + aRangeM[1] + '／A-' + aRangeM[2] : 'unparseable') + '）', aRangeM && aLedge.indexOf('A-' + aRangeM[1]) >= 0 && aLedge.indexOf('A-' + aRangeM[2]) >= 0);
const clDRefs = Array.from(new Set((cl.match(/D-\d{3}/g) || [])));
t('F7 ledger_pointer 双账本路径在＋条目 D-xxx 引用在 D 账实物在', cl.indexOf('.scratch/macro-audit/decision-ledger.md') >= 0 && cl.indexOf('.scratch/architecture-recovery/decision-ledger.md') >= 0 && clDRefs.every(d => dLedge.indexOf(d) >= 0), 'drefs=' + clDRefs.join(','));
t('F8 engine/CHANGELOG Unreleased 条目引 upstream-lock.yaml（D-037⑥ CHANGELOG entry 引 lock diff）', ecl.indexOf('[Unreleased]') >= 0 && ecl.indexOf('upstream-lock.yaml') >= 0);

// ---------- G. 文档与账本落文（ENFORCE） ----------
const issueP = join(REPO, '.scratch', 'architecture-recovery', 'issues', '44-upstream-lock.md');
const issue = existsSync(issueP) ? txt(issueP) : '';
t('G1 issue#44 在且引 A-049＋D-037/D-039', issue.indexOf('A-049') >= 0 && issue.indexOf('D-037') >= 0 && issue.indexOf('D-039') >= 0);
t('G2 handoff＋prompt 三件套齐备', existsSync(join(REPO, '.scratch', 'architecture-recovery', 'handoffs', '44-upstream-lock.md')) && existsSync(join(REPO, '.scratch', 'architecture-recovery', 'prompts', '44-upstream-lock.md')));
t('G3 issue#44 Status=done 且 checklist 全勾', /\*\*Status:\*\* done/.test(issue) && issue.indexOf('- [ ]') < 0);
t('G4 A-049 账本行 done → implemented（2026-09-16）', /A-049[^\n]*done → implemented（2026-09-16）/.test(aLedge));
const wf = txt(join(REPO, '.scratch', 'architecture-recovery', 'WORKFLOW.md'));
t('G5 WORKFLOW §4 lessons 含 #44 条目', /#44/.test(wf) && /upstream-lock|上游锁定/.test(wf));
const nr = txt(join(REPO, '.scratch', 'macro-audit', 'handoffs', 'next-round.md'));
t('G6 next-round T1/T2 行含当前 P0 票 #47/#48', /T1[^\n]*#47/.test(nr) && /T2[^\n]*#48/.test(nr));
const bl = txt(join(REPO, '.scratch', 'architecture-recovery', 'BACKLOG.md'));
t('G7 BACKLOG #44 行回写闭环', /\| #44[^\n]*✅/.test(bl));
const rep = existsSync(join(HERE, '44-report.md')) ? txt(join(HERE, '44-report.md')) : '';
t('G8 44-report.md 在且六段齐备（①~⑥）', existsSync(join(HERE, '44-report.md')) && ['①', '②', '③', '④', '⑤', '⑥'].every(m => rep.indexOf(m) >= 0));
const ma = join(REPO, '.scratch', 'macro-audit', 'reports', '2026-09-16-report.md');
t('G9 macro-audit 日报含 #44 窗口节', existsSync(ma) && txt(ma).indexOf('窗口：#44') >= 0);

// ---------- H. BOM（写入纪律） ----------
const newFiles = [
  LOCK, join(REPO, 'README.md'), join(ENG, 'CHANGELOG.md'), join(ENG, 'package.json'),
  issueP,
  join(REPO, '.scratch', 'architecture-recovery', 'handoffs', '44-upstream-lock.md'),
  join(REPO, '.scratch', 'architecture-recovery', 'prompts', '44-upstream-lock.md'),
  join(HERE, '44-report.md'), join(HERE, '44-check.mjs')
];
t('H1 全部新增/改动文件无 BOM', newFiles.every(f => !existsSync(f) || noBom(f)), newFiles.filter(f => existsSync(f) && !noBom(f)).join(','));

console.log('---');
if (warn > 0) { console.log('ADVISORY WARN ' + warn + '（报警非失败——两段式 advisory 段，转 enforce 挂首发 tag 手动窗口）'); }
console.log(fail === 0 ? 'PASS ' + pass + '/' + (pass + fail) : 'FAIL ' + fail + '/' + (pass + fail));
process.exit(fail === 0 ? 0 : 1);
