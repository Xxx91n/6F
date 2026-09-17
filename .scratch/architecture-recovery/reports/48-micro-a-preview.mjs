// 48-micro-a-preview.mjs — Micro-A preview：托管 API 适配器消费侧管道（#48 / A-056 / spec R8-02 / D-049）
// 链 = PR intake（github-rest-adapter@v1：PR 枚举＋元数据＋diff 双通道）→ fact（JSONL＋48-audit-facts.duckdb，scale=Micro-A）
//   → 裁决（48-micro-a-criteria.md 预声明判据 PC-1 / TC-1~4 / NC-1，跑后禁调）
//   → 报告（buildReport 骨架 1.2.0 共享四章＋Micro-A 切片字段＋preview_disclosure「capability 3 of 5 · preview」）
// 模式：default=真跑（凭据三级探测 env-token→gh-token→unauthenticated 如实降级）；
//   --golden=cassette 离线回放（engine/test/fixtures/github-rest/authenticated.cassette.json；只锁字段骨架不锁内容值）；
//   --repo <name> 单仓过滤（env-manager|jiahao|anysearch-cli|goose-duck-agent）。
// PR 集 = 恰 4 条已 merged（票面写死实例不给通用公式，D-049③）：
//   env-manager #64 release-please 机器生成（github-actions[bot]/Bot · chore(main): release 标题签名——#37 教训收窄到产物形态）
//   env-manager #55 dependabot[bot]/Bot（平台声明 Bot 双检命中）  env-manager #51 人类（Xxx91n/User）  jiahao #6 人类（全人基线 merged）
// failure 件 = D-033 硬约束逆用：托管枚举 merged PR=0 → intake 显式拒绝 → 报告落 unsupported「无托管 PR 面＋原因＋前置条件」；
//   票面前提漂移如实登记——anysearch-cli 票面撰写时无托管面（#37 实测 github_pr_total=0），本票复核其托管枚举 merged≥1，
//   故 failure 演示主体改取真负例 goose-duck-agent（托管仓 merged PR=0，拒绝路径如实演示）。
// 纪律：被测仓只读（git 只读子命令＋REST GET）；凭据即用即清永不入工件；唯一写动作 = --out 目录 48-* 工件。

import { readFileSync, writeFileSync, existsSync, mkdirSync, unlinkSync } from 'node:fs';
import { execFileSync } from 'node:child_process';
import { fileURLToPath, pathToFileURL } from 'node:url';
import { dirname, join, resolve } from 'node:path';

const HERE = dirname(fileURLToPath(import.meta.url));
const REPO = join(HERE, '..', '..', '..');
const DIST = join(REPO, 'engine', 'dist');
const NL = String.fromCharCode(10);
const RUN_AT = new Date().toISOString();

const C = await import(pathToFileURL(join(DIST, 'collect', 'collectors.js')).href);
const G = await import(pathToFileURL(join(DIST, 'report', 'generate.js')).href);
const S = await import(pathToFileURL(join(DIST, 'fact', 'schema.js')).href);
const STORE = await import(pathToFileURL(join(DIST, 'fact', 'store.js')).href);
const GH = await import(pathToFileURL(join(DIST, 'upstream', 'github-rest.js')).href);
const I = await import(pathToFileURL(join(DIST, 'intake', 'intake.js')).href);// #54/D-059①：%cI 输出经归一化（+00:00→Z）＋严格形状断言，与引擎同口径

// ---------- §0 Micro-A 切片字段契约（唯一事实源） ----------
// NN-check 由本常量 ∩ dist REPORT_SKELETON.required_fields 机械导出断言集——禁手抄漂移（D-049⑤）。
export const MICRO_A_SLICE_FIELDS = [
  'pr_number', 'pr_title', 'pr_state', 'merged', 'merged_at',
  'author_login', 'author_type', 'bot_declared', 'bot_basis', 'author_form',
  'head_sha', 'base_sha', 'merge_commit_sha', 'html_url',
  'diff_channel', 'diff_files_changed', 'diff_additions', 'diff_deletions', 'diff_bytes',
  'credential_strategy', 'credential_degraded', 'api_calls', 'rate_limit_remaining'
];

// ---------- §1 票面写死实例（恰 4 条 merged；D-049③）----------
const PILOTS = [
  {
    name: 'env-manager', owner: 'Xxx91n', repo: 'env-manager', root: 'D:/Aworker/env-manager',
    prs: [
      { n: 64, form: 'machine-generated/release-please' },
      { n: 55, form: 'platform-declared-bot/dependabot' },
      { n: 51, form: 'human' }
    ]
  },
  {
    name: 'jiahao', owner: 'Xxx91n', repo: 'jiahao', root: 'D:/Aworker/jiahao',
    prs: [{ n: 6, form: 'human' }]
  }
];
// 托管面资格闸探针：anysearch-cli=票面前提漂移核查（#37 实测 github_pr_total=0 → 本票复核枚举 merged 数）；
// goose-duck-agent=真负例拒绝主体（托管仓 merged PR=0 → intake 显式拒绝）。
const GATE_PROBES = [
  { name: 'anysearch-cli', owner: 'Xxx91n', repo: 'anysearch-cli' },
  { name: 'goose-duck-agent', owner: 'Xxx91n', repo: 'goose-duck-agent', root: 'D:/Aworker/eys', refusal: true }
];
// golden 回放面：authenticated cassette 录制 = list(62)+detail#64+detail#51+diff#64——golden 选定子集与之逐字对齐。
const GOLDEN_PRS = [{ n: 64, form: 'machine-generated/release-please' }, { n: 51, form: 'human' }];
const GOLDEN_DIFFS = [64];
const CRITERIA_PATH = '.scratch/architecture-recovery/reports/48-micro-a-criteria.md';
const CRITERION_IDS = ['PC-1', 'TC-1', 'TC-2', 'TC-3', 'TC-4', 'NC-1'];
const RELEASE_TITLE = /^chore\([^)]*\): release \d+\.\d+\.\d+/;   // release-please 产物签名（#37 教训：收窄到产物形态非主题词）

function parseArgs(argv) {
  const out = { golden: false, repo: null, out: HERE };
  for (let i = 0; i < argv.length; i++) {
    const a = argv[i];
    if (a === '--golden') { out.golden = true; }
    else if (a === '--repo') { out.repo = argv[++i]; }
    else if (a === '--out') { out.out = argv[++i]; }
  }
  return out;
}
const ARGS = parseArgs(process.argv.slice(2));
const OUTDIR = resolve(ARGS.out);
if (!existsSync(OUTDIR)) { mkdirSync(OUTDIR, { recursive: true }); }

// ---------- §2 小工具 ----------
function git(root, args) { return execFileSync('git', ['-C', root].concat(args), { encoding: 'utf8', maxBuffer: 256 * 1024 * 1024 }); }
function tryGit(root, args) { try { return git(root, args).trim(); } catch (e) { return null; } }
function pickExcerpt(absOrRelPath, tokens, base) {
  const text = readFileSync(base ? join(base, absOrRelPath) : absOrRelPath, 'utf8');
  const lines = text.split(NL);
  const list = Array.isArray(tokens) ? tokens : [tokens];
  if (tokens === null || tokens === undefined) { return { line: 1, text: lines[0].trim() }; }
  for (let i = 0; i < lines.length; i++) {
    let all = true;
    for (const tk of list) { if (lines[i].indexOf(tk) < 0) { all = false; } }
    if (all) { return { line: i + 1, text: lines[i].trim() }; }
  }
  throw new Error('EXCERPT-MISS: ' + absOrRelPath + ' tokens=' + String(tokens));
}
function val(f) { return JSON.parse(f.value_json); }
function byMetric(facts, m) { return facts.filter(function (f) { return f.metric === m; }); }
function prFact(facts, metric, n) {
  const hit = facts.filter(function (f) { return f.metric === metric && f.subject_ref.slice(-('#' + n).length) === '#' + n; });
  return hit.length > 0 ? hit[0] : null;
}
// 作者形态三类：release-please 机器生成（标题产物签名）/ 平台声明 Bot（双检）/ 人类。措辞=平台声明的 Bot 身份，不自创机器归因。
function classifyForm(v) {
  if (v.bot_declared === true && /dependabot/i.test(v.author_login)) { return 'platform-declared-bot/dependabot'; }
  if (v.bot_declared === true && RELEASE_TITLE.test(v.title)) { return 'machine-generated/release-please'; }
  if (v.bot_declared === true) { return 'platform-declared-bot/other'; }
  return 'human';
}
function cassetteFetcher(cas, cap) {
  let i = 0;
  return async function (req) {
    cap.push(req);
    if (i >= cas.calls.length) { throw new Error('cassette exhausted at ' + req.url); }
    const c = cas.calls[i++];
    if (req.method !== c.request.method) { throw new Error('method mismatch'); }
    if (!req.url.endsWith(c.request.path)) { throw new Error('path mismatch: ' + req.url + ' vs ' + c.request.path); }
    const acc = c.request.accept || 'application/vnd.github+json';
    if (req.accept !== acc) { throw new Error('accept mismatch'); }
    return { status: c.response.status, headers: c.response.headers || {}, body: typeof c.response.body === 'string' ? c.response.body : JSON.stringify(c.response.body) };
  };
}
// ---------- §3 骨架交集机械导出（desk-task15 判据断言面；禁手抄漂移） ----------
export function skeletonIntersectionReport(sidecar, mdText) {
  const missing = [];
  const rename = { stale_data_marker: 'stale.marker', staleness_sla_seconds: 'stale.sla_seconds', read_model_lag_seconds: 'stale.lag_seconds', read_model_version: 'stale.read_model_version', fact_watermark_version: 'stale.fact_watermark_version', evidence_items: 'evidence' };
  function has(obj, path) {
    let cur = obj;
    for (const p of path.split('.')) {
      if (cur === null || typeof cur !== 'object' || !(p in cur)) { return false; }
      cur = cur[p];
    }
    return true;
  }
  for (const ch of G.REPORT_SKELETON) {
    for (const f of ch.required_fields) {
      const leaf = rename[f] || f;
      if (ch.id === 'C1') {
        if (!has(sidecar, leaf) && (typeof mdText !== 'string' || mdText.indexOf(f) < 0)) { missing.push('C1.' + f); }
      } else if (ch.id === 'C2') {
        if (f === 'quadrants') { if (!has(sidecar, 'quadrants')) { missing.push('C2.quadrants'); } }
        else { const qs = sidecar.quadrants || []; let bad = qs.length === 0; for (const q of qs) { if (!has(q, f)) { bad = true; } } if (bad) { missing.push('C2.' + f); } }
      } else if (ch.id === 'C3') {
        if (f === 'evidence_items') { if (!has(sidecar, 'evidence')) { missing.push('C3.evidence_items'); } }
        else { const es = sidecar.evidence || []; let bad = es.length === 0; for (const e of es) { if (!has(e, f)) { bad = true; } } if (bad) { missing.push('C3.' + f); } }
      } else if (ch.id === 'C4') {
        if (f === 'recommendations') { if (!has(sidecar, 'recommendations')) { missing.push('C4.recommendations'); } }
        else { const rs = sidecar.recommendations || []; let bad = rs.length === 0; for (const r of rs) { if (!has(r, f)) { bad = true; } } if (bad) { missing.push('C4.' + f); } }
      }
    }
  }
  const bq = (sidecar.quadrants || []).filter(function (q) { return q.quadrant === 'behavior'; })[0];
  for (const f of MICRO_A_SLICE_FIELDS) { if (!bq || !(f in bq.slice_fields)) { missing.push('slice.' + f); } }
  return { ok: missing.length === 0, missing: missing };
}

// ---------- §4 采集（枚举＋元数据＋diff 双通道；事实=适配器唯一来源） ----------
async function collectTarget(t, shared, diffsOverride) {
  const headSha = t.root ? tryGit(t.root, ['rev-parse', 'HEAD']) : null;
  const headDateRaw = t.root ? tryGit(t.root, ['log', '-1', '--format=%cI']) : null;
  const headDate = headDateRaw ? I.normalizeGitIsoDate(headDateRaw) : null;
  const ctx = {
    runId: 'r48-' + t.name + '-' + (headSha || 'na').slice(0, 7),
    traceId: C.sha256Hex(t.repo + '|' + (headSha || 'na') + '|' + RUN_AT).slice(0, 32),
    repoRef: t.owner + '/' + t.repo,
    scale: 'Micro-A',
    observedAt: RUN_AT
  };
  const pins = t.prs || [];
  const opts = { state: 'all', details: pins.map(function (p) { return p.n; }), diffs: diffsOverride !== undefined ? diffsOverride : pins.map(function (p) { return p.n; }), repoRoot: t.root || null };
  if (shared.env) { opts.env = shared.env; }
  if (shared.ghTokenProbe) { opts.ghTokenProbe = shared.ghTokenProbe; }
  if (shared.fetcher) { opts.fetcher = shared.fetcher; }
  const res = await GH.collectGithubPrFacts(t.owner, t.repo, opts, ctx);
  const summaries = byMetric(res.facts, 'github_rest.pr_summary').map(val);
  const mergedCount = summaries.filter(function (s) { return s.merged_at !== null; }).length;
  return { t: t, ctx: ctx, res: res, summaries: summaries, mergedCount: mergedCount, headSha: headSha, headDate: headDate };
}

// 托管面资格闸（D-033 硬约束逆用）：merged PR ≥1 → eligible；=0 → intake 显式拒绝。
async function gateProbe(g, shared) {
  const t = { name: g.name, owner: g.owner, repo: g.repo, root: g.root || null, prs: [] };
  const r = await collectTarget(t, shared, []);
  return {
    name: g.name, owner: g.owner, repo: g.repo,
    merged_prs: r.mergedCount, prs_listed: r.res.prs_listed,
    eligible: r.mergedCount >= 1,
    strategy: r.res.strategy, degraded: r.res.degraded, calls: r.res.calls, stopped_reason: r.res.stopped_reason,
    facts: r.res.facts, ctx: r.ctx, headSha: r.headSha, refusal: g.refusal === true
  };
}

// ---------- §5 diff 工件（与适配器同路径再现：local-git 优先 / api 兜底；写 .diff 供行级引文锚） ----------
async function fetchDiffArtifact(t, n, baseSha, headSha, shared, outName) {
  const cred = shared.cred || GH.resolveGithubCredential(shared.env || process.env, shared.ghTokenProbe);
  const client = GH.createGithubRestClient(cred, shared.fetcher ? { fetcher: shared.fetcher } : {});
  let d;
  try {
    d = await GH.resolvePrDiff(client, t.owner, t.repo, n, baseSha || '', headSha || '', t.root || null);
  } catch (e) {
    return { ok: false, channel: 'api', bytes: 0, stats: { files_changed: null, additions: null, deletions: null }, error: String(e && e.message ? e.message : e).slice(0, 160) };
  }
  if (d.ok && d.text.length > 0) { writeFileSync(join(OUTDIR, outName), d.text, 'utf8'); }
  return { ok: d.ok, channel: d.channel, bytes: d.text.length, stats: d.stats, error: d.ok ? null : (d.detail || d.error_kind || 'unknown') };
}
// ---------- §6 单 PR 报告构建（共享骨架四章＋Micro-A 切片＋披露三件套） ----------
async function buildPrReport(t, pin, collected, gate, shared, opts) {
  const NAME = t.name;
  const R = NAME.toUpperCase().split('-').join('');
  const PRE = opts.golden ? '48-micro-a-golden-' : '48-micro-a-';
  const facts = collected.res.facts;
  const sumF = prFact(facts, 'github_rest.pr_summary', pin.n);
  const metaF = prFact(facts, 'github_rest.pr_metadata', pin.n);
  const diffF = prFact(facts, 'github_rest.pr_diff', pin.n);
  const runF = byMetric(facts, 'github_rest.run').slice(-1)[0] || null;
  const sum = sumF ? val(sumF) : null;
  const meta = metaF ? val(metaF) : null;
  const diff = diffF ? val(diffF) : null;
  const run = runF ? val(runF) : null;
  const merged = (meta !== null && meta.merged === true) || (sum !== null && sum.merged_at !== null && sum.state === 'closed');
  const formActual = meta !== null ? classifyForm(meta) : (sum !== null ? classifyForm(sum) : 'unknown');
  const formMatch = formActual === pin.form;

  // diff 工件：与采集同路径再现（local-git 优先 / api 兜底——走主路/回退如实标注）
  const artName = PRE + NAME + '-pr' + pin.n + '.diff';
  const art = await fetchDiffArtifact(t, pin.n, sum ? sum.base_sha : '', sum ? sum.head_sha : '', shared, artName);

  // 判据评估（48-micro-a-criteria.md 预声明；跑后禁调）
  const tripleOk = sumF !== null && metaF !== null && diffF !== null && merged === true;
  const numStatsOk = diff !== null && typeof diff.files_changed === 'number' && typeof diff.additions === 'number' && typeof diff.deletions === 'number';
  const channelOk = diff !== null && (diff.channel === 'local-git' || diff.channel === 'api') && typeof diff.bytes === 'number' && diff.bytes > 0;
  // api 腿契约=NULL_STATS 如实缺席（适配器 apiDiff 不算 numstat）——api 腿改判 detail 注记在场；local-git 腿须数值齐备
  const tc2ok = channelOk && (diff.channel === 'api' ? (typeof diff.detail === 'string' && diff.detail.length > 0) : numStatsOk);
  const botFieldsOk = sum !== null && typeof sum.bot_declared === 'boolean' && typeof sum.bot_basis === 'string' && sum.bot_basis.indexOf('platform-declared') === 0;
  const EV = function (k) { return 'EV-48-' + R + '-PR' + pin.n + '-0' + k; };
  const entries = [
    { criterion_id: 'PC-1', band: run !== null && run.prs_listed > 0 ? 'supported' : 'insufficient', basis_refs: ['B1'], anchored_fact_ids: runF ? [runF.fact_id] : [], anchored_evidence_ids: [EV(1)], decided_at: RUN_AT, rationale: run !== null && run.prs_listed > 0 ? '适配器 run 事实在案：prs_listed=' + run.prs_listed + ' calls=' + run.calls + ' strategy=' + run.strategy + '（枚举真实发生）' : '枚举未发生——管线故障' },
    { criterion_id: 'TC-1', band: tripleOk ? 'supported' : 'insufficient', basis_refs: ['B2'], anchored_fact_ids: [sumF, metaF, diffF].filter(Boolean).map(function (f) { return f.fact_id; }), anchored_evidence_ids: [EV(3)], decided_at: RUN_AT, rationale: tripleOk ? 'PR 证据三联齐备（summary＋metadata＋diff）且 merged=true' : '证据三联缺腿：summary=' + (sumF ? '1' : '0') + ' metadata=' + (metaF ? '1' : '0') + ' diff=' + (diffF ? '1' : '0') + ' merged=' + merged },
    { criterion_id: 'TC-2', band: tc2ok ? 'supported' : 'insufficient', basis_refs: ['B2'], anchored_fact_ids: diffF ? [diffF.fact_id] : [], anchored_evidence_ids: [EV(2)], decided_at: RUN_AT, rationale: diff !== null ? 'diff channel=' + diff.channel + ' files=' + String(diff.files_changed) + ' +' + String(diff.additions) + '/-' + String(diff.deletions) + ' bytes=' + String(diff.bytes) + (diff.channel === 'api' ? '（api 腿 stats 契约缺席 detail=' + String(diff.detail).slice(0, 40) + '）' : '') : 'diff 事实缺席' },
    { criterion_id: 'TC-3', band: botFieldsOk ? 'supported' : 'insufficient', basis_refs: ['B2'], anchored_fact_ids: sumF ? [sumF.fact_id] : [], anchored_evidence_ids: [EV(3)], decided_at: RUN_AT, rationale: botFieldsOk ? '作者形态披露齐备：bot_declared=' + String(sum.bot_declared) + ' basis=' + sum.bot_basis : '作者形态字段缺席' },
    { criterion_id: 'TC-4', band: gate.merged_prs >= 1 ? 'supported' : 'unsupported', basis_refs: ['B2'], anchored_fact_ids: [], anchored_evidence_ids: [EV(1)], decided_at: RUN_AT, rationale: '托管面资格闸：' + NAME + ' 托管枚举 merged PR=' + gate.merged_prs + '（≥1 即 eligible；D-033 硬约束逆用判据）' },
    { criterion_id: 'NC-1', band: merged && formMatch ? 'supported' : 'unsupported', basis_refs: ['B4'], anchored_fact_ids: sumF ? [sumF.fact_id] : [], anchored_evidence_ids: [EV(3)], decided_at: RUN_AT, rationale: '负对照：入选实例 ' + pin.form + ' 票面写死；实测 form=' + formActual + ' merged=' + merged + '（closed-unmerged 不入集、形态错配即判负）' }
  ];
  const overall = G.deriveOverallBand(entries);

  // Micro-A 切片字段（契约 = MICRO_A_SLICE_FIELDS）
  const sliceFields = {
    pr_number: pin.n,
    pr_title: sum ? sum.title : '',
    pr_state: sum ? sum.state : '',
    merged: merged,
    merged_at: (meta && meta.merged_at) || (sum && sum.merged_at) || null,
    author_login: sum ? sum.author_login : '',
    author_type: sum ? sum.author_type : '',
    bot_declared: sum ? sum.bot_declared : null,
    bot_basis: sum ? sum.bot_basis : null,
    author_form: formActual,
    head_sha: sum ? sum.head_sha : '',
    base_sha: sum ? sum.base_sha : '',
    merge_commit_sha: meta ? meta.merge_commit_sha : null,
    html_url: sum ? sum.html_url : '',
    diff_channel: diff ? diff.channel : null,
    diff_files_changed: diff ? diff.files_changed : null,
    diff_additions: diff ? diff.additions : null,
    diff_deletions: diff ? diff.deletions : null,
    diff_bytes: diff ? diff.bytes : null,
    credential_strategy: run ? run.strategy : collected.res.strategy,
    credential_degraded: run ? run.degraded : collected.res.degraded,
    api_calls: run ? run.calls : null,
    rate_limit_remaining: run ? run.final_remaining : null
  };

  // 证据（C3：行级引文锚——diff 工件行 / 实测文件行 / 账本行；摘取失败如实 grounded=false）
  const evidence = [];
  function addEvidence(id, src, tokens, claim, repro, base) {
    let ex = null;
    try { ex = pickExcerpt(src, tokens, base || null); } catch (e) {
      evidence.push({ evidence_id: id, source: src, locator: 'L0', claim: claim, grounded: false, collected_at: RUN_AT, reproduce_cmd: repro, reproduce_absent_reason: '引文摘取失败：' + String(e && e.message ? e.message : e).slice(0, 140), required_tokens: [], excerpt: '' });
      return;
    }
    evidence.push({ evidence_id: id, source: src, locator: 'L' + ex.line, claim: claim, grounded: true, collected_at: RUN_AT, reproduce_cmd: repro, reproduce_absent_reason: null, required_tokens: [], excerpt: ex.text });
  }
  const RUN_CMD = 'node .scratch/architecture-recovery/reports/48-micro-a-preview.mjs' + (opts.golden ? ' --golden' : ' --repo ' + NAME);
  addEvidence(EV(1), opts.measName, 'prs_listed', '本次实测：' + NAME + ' 托管枚举真实发生（prs_listed=' + collected.res.prs_listed + ' merged=' + gate.merged_prs + '）', RUN_CMD, OUTDIR);
  if (art.ok) {
    addEvidence(EV(2), artName, 'diff --git', '本次实测：' + NAME + '#' + pin.n + ' diff 工件行级锚（channel=' + art.channel + ' bytes=' + art.bytes + '）', RUN_CMD, OUTDIR);
  } else {
    evidence.push({ evidence_id: EV(2), source: artName, locator: 'L0', claim: '' + NAME + '#' + pin.n + ' diff 工件', grounded: false, collected_at: RUN_AT, reproduce_cmd: RUN_CMD, reproduce_absent_reason: 'diff 工件缺席（' + (art.error || 'channel 未产') + '）', required_tokens: [], excerpt: '' });
  }
  addEvidence(EV(3), opts.factsName, ['github_rest.pr_metadata', '#' + pin.n + ''], '本次实测：' + NAME + '#' + pin.n + ' 元数据事实落库（merged=' + merged + '）', RUN_CMD, OUTDIR);
  addEvidence(EV(4), '.scratch/macro-audit/decision-ledger.md', 'D-049', '票面授权锚：D-049 Micro-A preview 单票铺开决策行', 'git -C ' + REPO + ' show HEAD:.scratch/macro-audit/decision-ledger.md', REPO);
  addEvidence(EV(5), CRITERIA_PATH, 'TC-4', '判据预声明锚：48-micro-a-criteria.md 判据集在案（跑后禁调）', 'git -C ' + REPO + ' show HEAD:' + CRITERIA_PATH, REPO);

  const claims = [
    { claim_id: 'CL-48-' + R + '-PR' + pin.n + '-01', evidence_id: EV(1), required_tokens: ['prs_listed'] },
    { claim_id: 'CL-48-' + R + '-PR' + pin.n + '-02', evidence_id: EV(2), required_tokens: ['diff --git'] },
    { claim_id: 'CL-48-' + R + '-PR' + pin.n + '-03', evidence_id: EV(3), required_tokens: ['github_rest.pr_metadata'] },
    { claim_id: 'CL-48-' + R + '-PR' + pin.n + '-04', evidence_id: EV(4), required_tokens: ['D-049'] },
    { claim_id: 'CL-48-' + R + '-PR' + pin.n + '-05', evidence_id: EV(5), required_tokens: ['TC-4'] }
  ];

  // 四象限（Micro-A：behavior=native 单面；其余 not_applicable 如实披露）
  const GATE = { protocol_version: G.ADJUDICATION_PROTOCOL_VERSION, audit_ref: 'reports/48-micro-a-preview.mjs' };
  const isDep = formActual === 'platform-declared-bot/dependabot';
  const quadrants = [
    { quadrant: 'behavior', applicability: 'native', verdict: overall, score: null, confidence: 0.6, dimensions: [], slice_fields: sliceFields, verdict_gate: { protocol_version: GATE.protocol_version, decision: overall, evidence_flag: tripleOk, decided_at: RUN_AT, override_reason: null, audit_ref: GATE.audit_ref }, conflict_markers: isDep ? ['supply-chain-signal-unadjudicated'] : [] },
    { quadrant: 'structure', applicability: 'not_applicable', verdict: 'insufficient', score: null, confidence: 0, dimensions: [], slice_fields: {}, verdict_gate: { protocol_version: GATE.protocol_version, decision: 'insufficient', evidence_flag: false, decided_at: RUN_AT, override_reason: 'Micro-A 切片无结构采集面（PR 粒度；结构象限归 Macro-B 仓级采集）', audit_ref: GATE.audit_ref }, conflict_markers: ['out-of-scope-micro-a'] },
    { quadrant: 'supply_chain', applicability: 'not_applicable', verdict: 'insufficient', score: null, confidence: 0, dimensions: [], slice_fields: {}, verdict_gate: { protocol_version: GATE.protocol_version, decision: 'insufficient', evidence_flag: false, decided_at: RUN_AT, override_reason: '⚠ 数据未接——Scorecard 未接（按层需求队列不插队，D-034③）' + (isDep ? '；dependabot PR 的供应链信号仅作事实落库不裁决' : ''), audit_ref: GATE.audit_ref }, conflict_markers: isDep ? ['data-not-connected', 'supply-chain-signal-unadjudicated'] : ['data-not-connected'] },
    { quadrant: 'strategy', applicability: 'not_applicable', verdict: 'insufficient', score: null, confidence: 0, dimensions: [], slice_fields: {}, verdict_gate: { protocol_version: GATE.protocol_version, decision: 'insufficient', evidence_flag: false, decided_at: RUN_AT, override_reason: 'Micro-A 切片不裁仓级战略叙事（战略象限在仓级/跨仓层投影）', audit_ref: GATE.audit_ref }, conflict_markers: ['out-of-scope-micro-a'] }
  ];

  const recommendations = [
    { rec_id: 'R-48-' + R + '-PR' + pin.n + '-1', priority: 'P1', action: 'Micro-A preview 遗留面收口：pulls.reviews/comments 自 planned 拉入（锁表 github-rest 契约面）＋diff --llm 行级语义评审归 #50 叙事双轨', rationale: 'preview 判据=证据完整性/托管面资格/选择性，非 PR 质量裁决——行级评审叙事面属宿主 agent（D-053/D-058），本 preview 不含', expected_impact: 'Micro-A preview → GA 漏斗的叙事面齐备', effort: 'M', verdict_gate_stamp: G.ADJUDICATION_PROTOCOL_VERSION + ' / ' + overall, evidence_refs: [EV(4)], degraded_note: null },
    { rec_id: 'R-48-' + R + '-PR' + pin.n + '-2', priority: 'P2', action: 'Micro-A GA 前置：≥1 非自有公开仓真实 PR 走通用化验证（Generalization Gate；复用 URL opt-in 输入面）', rationale: '同主确认偏差如实披露——试点仓与产品同主（Xxx91n），本报告属校准+冒烟不构成泛化证据', expected_impact: '泛化证据链起点', effort: 'S', verdict_gate_stamp: G.ADJUDICATION_PROTOCOL_VERSION + ' / ' + overall, evidence_refs: [EV(4)], degraded_note: null }
  ];

  const mergeSha = meta && meta.merge_commit_sha ? meta.merge_commit_sha : (collected.headSha || 'unanchored');
  const treeSha = /^[0-9a-f]{40}$/.test(mergeSha) && t.root ? (tryGit(t.root, ['rev-parse', mergeSha + '^{tree}']) || 'unresolved-tree') : 'unanchored';
  const reportInput = {
    report_id: 'MA-48-' + R + '-PR' + pin.n + '-PREVIEW',
    scale: 'Micro-A',
    subject_ref: t.owner + '/' + t.repo + '#' + pin.n,
    generated_at: RUN_AT,
    trace_id: collected.ctx.traceId,
    baggage_id: C.deriveBaggageId(collected.ctx, null),
    headline: t.owner + '/' + t.repo + '#' + pin.n + ' Micro-A preview（capability 3 of 5）：form=' + formActual + ' diff_channel=' + (diff ? diff.channel : 'absent') + ' +' + String(diff ? diff.additions : 'n/a') + '/-' + String(diff ? diff.deletions : 'n/a') + ' f=' + String(diff ? diff.files_changed : 'n/a') + ' → ' + overall,
    confidence: 0.6,
    stale: { marker: 'fresh', sla_seconds: 5, lag_seconds: 0, read_model_version: G.REPORT_SKELETON_VERSION, fact_watermark_version: '1' },
    fact_ids: [sumF, metaF, diffF].filter(Boolean).map(function (f) { return f.fact_id; }),
    top_findings: [EV(1), EV(2), EV(3)],
    evidence: evidence,
    claims: claims,
    quadrants: quadrants,
    recommendations: recommendations,
    adjudication_entries: entries,
    decided_at: RUN_AT,
    commit_anchor: mergeSha,
    tree_anchor: treeSha,
    gate_ref: { prereg_commit: (tryGit(REPO, ['rev-parse', '--short', 'HEAD']) || 'unknown'), criteria_path: CRITERIA_PATH, basis_path: '.scratch/architecture-recovery/issues/48-micro-a-preview.md', criterion_ids: CRITERION_IDS },
    degraded: collected.res.degraded === true,
    degraded_reason: collected.res.degraded === true ? '无凭据降级（unauthenticated 60/h 限额）——事实面如实降级' : null,
    preview_disclosure: {
      capability_label: 'capability 3 of 5 · preview',
      calibration_scope: '同主试点仓 merged PR 最小集（env-manager×3 形态＋jiahao×1 全人基线；票面写死实例）',
      structural_limitations: (opts.golden ? ['golden 回放：响应来自 cassette 录制非实时 API——本件为管道 golden 产物非真实审计'] : []).concat([
        '同主确认偏差：试点仓与产品同主（Xxx91n）——dogfooding = generative not evaluative（D-033），本报告属校准+冒烟不构成泛化证据',
        '判据范围收窄：preview 判据=证据完整性/托管面资格/选择性，非 PR 质量裁决——diff --llm 行级语义评审归 #50 叙事双轨（D-053）',
        'reviews/comments 面 planned 未接（锁表 github-rest 契约面）——评审语义不在 preview 内',
        'supply_chain 象限 not_applicable：Scorecard 未接（D-034③）；dependabot PR 的供应链信号仅作事实落库'
      ]),
      not_in_preview: ['Micro-B', 'Macro-A']
    },
    human: { status: 'pending', adjudicator: 'user', text: null, decided_at: null }
  };
  const report = G.buildReport(reportInput);
  const mdName = PRE + NAME + '-pr' + pin.n + '.md';
  const jsonName = PRE + NAME + '-pr' + pin.n + '.json';
  const mdText = G.renderMarkdown(report) + NL;
  const scText = G.renderSidecar(report) + NL;
  const sidecarObj = JSON.parse(scText);
  writeFileSync(join(OUTDIR, mdName), mdText, 'utf8');
  writeFileSync(join(OUTDIR, jsonName), scText, 'utf8');
  return {
    pr: pin.n, form_expected: pin.form, form_actual: formActual, form_match: formMatch,
    merged: merged, overall: overall, receipt: report.receipt.receipt_id,
    diff_channel: diff ? diff.channel : null, artifact: art,
    skeleton: skeletonIntersectionReport(sidecarObj, mdText),
    outputs: { md: mdName, sidecar: jsonName, diff: art.ok ? artName : null },
    fact_ids: report.fact_ids
  };
}
// ---------- §7 failure 件：无托管面显式拒绝（D-033 硬约束逆用；报告落 unsupported＋原因＋前置条件） ----------
async function buildRefusalReport(gp, allGates, shared, opts) {
  const PRE = opts.golden ? '48-micro-a-golden-' : '48-micro-a-';
  const R = gp.name.toUpperCase().split('-').join('');
  const drift = allGates.filter(function (g) { return g.name === 'anysearch-cli'; })[0];
  const evidence = [];
  function addEvidence(id, src, tokens, claim, repro, base) {
    let ex = null;
    try { ex = pickExcerpt(src, tokens, base || null); } catch (e) {
      evidence.push({ evidence_id: id, source: src, locator: 'L0', claim: claim, grounded: false, collected_at: RUN_AT, reproduce_cmd: repro, reproduce_absent_reason: '引文摘取失败：' + String(e && e.message ? e.message : e).slice(0, 140), required_tokens: [], excerpt: '' });
      return;
    }
    evidence.push({ evidence_id: id, source: src, locator: 'L' + ex.line, claim: claim, grounded: true, collected_at: RUN_AT, reproduce_cmd: repro, reproduce_absent_reason: null, required_tokens: [], excerpt: ex.text });
  }
  const RUN_CMD = 'node .scratch/architecture-recovery/reports/48-micro-a-preview.mjs' + (opts.golden ? ' --golden' : '');
  addEvidence('EV-48-' + R + '-REF-01', opts.measName, 'goose-duck-agent', '本次实测：' + gp.name + ' 托管枚举 merged PR=0——无托管 PR 面', RUN_CMD, OUTDIR);
  addEvidence('EV-48-' + R + '-REF-02', opts.measName, 'anysearch-cli', '前提漂移锚：anysearch-cli 票面撰写时无托管面（#37 实测 pr=0），本票复核托管枚举 merged=' + (drift ? drift.merged_prs : 'n/a'), RUN_CMD, OUTDIR);
  addEvidence('EV-48-' + R + '-REF-03', '.scratch/macro-audit/decision-ledger.md', '无托管 PR 面', '硬约束锚：D-033/D-049「PR 层试点不得指派无托管 PR 面的仓」', 'git -C ' + REPO + ' show HEAD:.scratch/macro-audit/decision-ledger.md', REPO);
  const runF = byMetric(gp.facts, 'github_rest.run').slice(-1)[0] || null;
  const run = runF ? val(runF) : null;
  const entries = [
    { criterion_id: 'PC-1', band: run !== null ? 'supported' : 'insufficient', basis_refs: ['B1'], anchored_fact_ids: runF ? [runF.fact_id] : [], anchored_evidence_ids: ['EV-48-' + R + '-REF-01'], decided_at: RUN_AT, rationale: run !== null ? '适配器 run 事实在案：calls=' + run.calls + ' strategy=' + run.strategy + '（枚举真实发生——拒绝非管线故障）' : '枚举未发生' },
    { criterion_id: 'TC-4', band: 'unsupported', basis_refs: ['B2'], anchored_fact_ids: byMetric(gp.facts, 'github_rest.pr_summary').map(function (f) { return f.fact_id; }), anchored_evidence_ids: ['EV-48-' + R + '-REF-01'], decided_at: RUN_AT, rationale: '托管面资格闸未过：' + gp.name + ' 托管枚举 merged PR=0 → intake 显式拒绝（D-033 硬约束逆用）。原因=无托管 PR 面（无可裁 PR 对象）；前置条件=仓接入托管 PR 流程且产出 ≥1 merged PR 后再复审' }
  ];
  const GATE = { protocol_version: G.ADJUDICATION_PROTOCOL_VERSION, audit_ref: 'reports/48-micro-a-preview.mjs' };
  const quadrants = ['behavior', 'structure', 'supply_chain', 'strategy'].map(function (q) {
    return { quadrant: q, applicability: 'not_applicable', verdict: 'insufficient', score: null, confidence: 0, dimensions: [], slice_fields: {}, verdict_gate: { protocol_version: GATE.protocol_version, decision: 'insufficient', evidence_flag: false, decided_at: RUN_AT, override_reason: 'intake 拒绝——无 PR 对象，象限无可裁面', audit_ref: GATE.audit_ref }, conflict_markers: ['intake-refused'] };
  });
  const commitAnchor = gp.headSha || 'unanchored-no-local-clone';
  const treeSha = /^[0-9a-f]{40}$/.test(commitAnchor) && gp.root ? (tryGit(gp.root, ['rev-parse', commitAnchor + '^{tree}']) || 'unresolved-tree') : 'unanchored';
  const reportInput = {
    report_id: 'MA-48-' + R + '-REFUSAL',
    scale: 'Micro-A',
    subject_ref: gp.owner + '/' + gp.repo,
    generated_at: RUN_AT,
    trace_id: gp.ctx.traceId,
    baggage_id: C.deriveBaggageId(gp.ctx, null),
    headline: gp.name + ' Micro-A preview 拒绝件：托管枚举 merged PR=0——无托管 PR 面，intake 显式拒绝（unsupported；非管线故障，枚举真实发生）',
    confidence: 0.9,
    stale: { marker: 'fresh', sla_seconds: 5, lag_seconds: 0, read_model_version: G.REPORT_SKELETON_VERSION, fact_watermark_version: '1' },
    fact_ids: gp.facts.map(function (f) { return f.fact_id; }),
    top_findings: ['EV-48-' + R + '-REF-01', 'EV-48-' + R + '-REF-02'],
    evidence: evidence,
    claims: [
      { claim_id: 'CL-48-' + R + '-REF-01', evidence_id: 'EV-48-' + R + '-REF-01', required_tokens: ['goose-duck-agent'] },
      { claim_id: 'CL-48-' + R + '-REF-02', evidence_id: 'EV-48-' + R + '-REF-02', required_tokens: ['anysearch-cli'] },
      { claim_id: 'CL-48-' + R + '-REF-03', evidence_id: 'EV-48-' + R + '-REF-03', required_tokens: ['无托管 PR 面'] }
    ],
    quadrants: quadrants,
    recommendations: [
      { rec_id: 'R-48-' + R + '-REF-1', priority: 'P1', action: '前置条件：' + gp.name + ' 接入托管 PR 流程并产出 ≥1 merged PR 后，Micro-A 指派复审再开（D-033 capacity 硬约束）', rationale: '无托管 PR 面仓不得指派 PR 层试点——拒绝是判据成立形态非失败', expected_impact: 'Micro-A 试点指派纪律守住', effort: 'XS', verdict_gate_stamp: G.ADJUDICATION_PROTOCOL_VERSION + ' / unsupported', evidence_refs: ['EV-48-' + R + '-REF-03'], degraded_note: null }
    ],
    adjudication_entries: entries,
    decided_at: RUN_AT,
    commit_anchor: commitAnchor,
    tree_anchor: treeSha,
    gate_ref: { prereg_commit: (tryGit(REPO, ['rev-parse', '--short', 'HEAD']) || 'unknown'), criteria_path: CRITERIA_PATH, basis_path: '.scratch/architecture-recovery/issues/48-micro-a-preview.md', criterion_ids: CRITERION_IDS },
    degraded: false,
    degraded_reason: null,
    preview_disclosure: {
      capability_label: 'capability 3 of 5 · preview',
      calibration_scope: '托管面资格闸拒绝件（failure 演示面）',
      structural_limitations: (opts.golden ? ['golden 回放：响应来自 cassette 录制非实时 API——本件为管道 golden 产物非真实审计'] : []).concat([
        '拒绝语义：intake 阶段显式拒绝（D-033 硬约束逆用）——报告落 unsupported: 无托管 PR 面＋原因＋前置条件',
        '票面前提漂移如实登记：anysearch-cli 票面撰写时无托管面（#37 实测 github_pr_total=0），本票复核托管枚举 merged=' + (drift ? String(drift.merged_prs) : 'n/a') + '——前提已漂移，failure 演示主体改取真负例 goose-duck-agent（merged=0）'
      ]),
      not_in_preview: ['Micro-B', 'Macro-A']
    },
    human: { status: 'pending', adjudicator: 'user', text: null, decided_at: null }
  };
  const report = G.buildReport(reportInput);
  const mdName = PRE + gp.name + '-refusal.md';
  const jsonName = PRE + gp.name + '-refusal.json';
  writeFileSync(join(OUTDIR, mdName), G.renderMarkdown(report) + NL, 'utf8');
  writeFileSync(join(OUTDIR, jsonName), G.renderSidecar(report) + NL, 'utf8');
  return { refusal_for: gp.name, overall: report.adjudication.overall, receipt: report.receipt.receipt_id, outputs: { md: mdName, sidecar: jsonName } };
}
// ---------- §8 事实落盘 + 单仓编排 ----------
function writeFactsJsonl(facts, outName) {
  const rows = facts.map(function (f, i) {
    return { fact_seq: i + 1, fact_id: f.fact_id, schema_version: S.SCHEMA_VERSION_V0, trace_id: f.trace_id, baggage_id: f.baggage_id, scale: f.scale, quadrant: f.quadrant, dimension: f.dimension, collector_id: f.collector_id, repo_ref: f.repo_ref, subject_ref: f.subject_ref, evidence_ref: f.evidence_ref, metric: f.metric, value_json: f.value_json, observed_at: f.observed_at, ingested_at: RUN_AT };
  });
  writeFileSync(join(OUTDIR, outName), rows.map(function (r) { return JSON.stringify(r); }).join(NL) + NL, 'utf8');
  return rows;
}

async function runRepo(t, shared, opts) {
  const collected = await collectTarget(t, shared, opts.golden ? GOLDEN_DIFFS : undefined);
  writeFactsJsonl(collected.res.facts, opts.factsName);
  const gate = { merged_prs: collected.mergedCount, eligible: collected.mergedCount >= 1 };
  const meas = {
    repo: t.name, owner: t.owner, observed_at: RUN_AT, head_sha: collected.headSha,
    strategy: collected.res.strategy, degraded: collected.res.degraded,
    calls: collected.res.calls, prs_listed: collected.res.prs_listed,
    merged_prs: gate.merged_prs, eligible: gate.eligible, stopped_reason: collected.res.stopped_reason,
    fact_count: collected.res.facts.length, per_pr: []
  };
  writeFileSync(join(OUTDIR, opts.measName), JSON.stringify(meas, null, 2) + NL, 'utf8');
  const reports = [];
  for (const pin of t.prs) {
    const r = await buildPrReport(t, pin, collected, gate, shared, { golden: opts.golden === true, measName: opts.measName, factsName: opts.factsName });
    reports.push(r);
    meas.per_pr.push({ n: r.pr, form_expected: r.form_expected, form_actual: r.form_actual, form_match: r.form_match, merged: r.merged, overall: r.overall, receipt: r.receipt, diff_channel: r.diff_channel, diff_artifact: r.outputs.diff, diff_bytes: r.artifact.bytes, skeleton_ok: r.skeleton.ok, skeleton_missing: r.skeleton.missing });
  }
  writeFileSync(join(OUTDIR, opts.measName), JSON.stringify(meas, null, 2) + NL, 'utf8');
  return { collected: collected, gate: gate, meas: meas, reports: reports };
}

// ---------- §9 golden 模式：cassette 离线回放全链（只锁字段骨架不锁内容值） ----------
async function goldenMain() {
  const casPath = join(REPO, 'engine', 'test', 'fixtures', 'github-rest', 'authenticated.cassette.json');
  const cas = JSON.parse(readFileSync(casPath, 'utf8'));
  const casAug = { name: cas.name + '+48-augmented', recorded: 'derived', calls: cas.calls.concat([cas.calls[3]]) };
  const cap = [];
  const noGh = function () { return { available: false, token: null }; };
  const shared = { env: { GITHUB_TOKEN: 'GOLDEN-PLACEHOLDER' }, ghTokenProbe: noGh, fetcher: cassetteFetcher(casAug, cap) };
  const t = { name: 'env-manager', owner: 'Xxx91n', repo: 'env-manager', root: null, prs: GOLDEN_PRS };
  const rr = await runRepo(t, shared, { golden: true, factsName: '48-micro-a-golden-env-manager-facts.jsonl', measName: '48-micro-a-golden-env-manager-measurements.json' });

  // golden 拒绝腿：合成 0-PR cassette（如实标注 synthetic）
  const zeroCas = {
    name: 'zero-pr-synthetic', recorded: 'synthetic', calls: [
      { request: { method: 'GET', path: '/repos/Xxx91n/goose-duck-agent/pulls?state=all&per_page=100&page=1' }, response: { status: 200, headers: { 'x-ratelimit-limit': '60', 'x-ratelimit-remaining': '59', 'x-ratelimit-used': '1', 'x-ratelimit-reset': '0', 'x-ratelimit-resource': 'core' }, body: [] } }
    ]
  };
  const capZ = [];
  const sharedZ = { env: {}, ghTokenProbe: noGh, fetcher: cassetteFetcher(zeroCas, capZ) };
  const gp = await gateProbe({ name: 'goose-duck-agent', owner: 'Xxx91n', repo: 'goose-duck-agent' }, sharedZ);
  writeFactsJsonl(gp.facts, '48-micro-a-golden-goose-duck-agent-facts.jsonl');
  const goldenGateName = '48-micro-a-golden-gate-probes.json';
  writeFileSync(join(OUTDIR, goldenGateName), JSON.stringify({
    probe: '48-micro-a-preview.mjs --golden gate', generated_at: RUN_AT, criterion: 'TC-4', probes: [
      { name: 'goose-duck-agent', merged_prs: gp.merged_prs, prs_listed: gp.prs_listed, eligible: gp.eligible, cassette: 'zero-pr-synthetic' },
      { name: 'anysearch-cli', merged_prs: null, eligible: null, note: 'golden 不探真仓——前提漂移核查归真跑通道' }
    ]
  }, null, 2) + NL, 'utf8');
  const refusal = await buildRefusalReport(gp, [{ name: 'anysearch-cli', merged_prs: null }], sharedZ, { golden: true, measName: goldenGateName });

  // golden 断言：骨架交集机械导出＋拒绝语义＋token 永不入 fact
  const checks = [];
  function a(name, ok, detail) { checks.push({ name: name, pass: !!ok, detail: detail || '' }); }
  for (const r of rr.reports) {
    const sc = JSON.parse(readFileSync(join(OUTDIR, r.outputs.sidecar), 'utf8'));
    const md = readFileSync(join(OUTDIR, r.outputs.md), 'utf8');
    a('golden pr' + r.pr + ' 四章骨架在', ['## C1', '## C2', '## C3', '## C4'].every(function (h) { return md.indexOf(h) >= 0; }));
    a('golden pr' + r.pr + ' schema=REPORT_SKELETON_VERSION + scale=Micro-A', sc.schema_version === G.REPORT_SKELETON_VERSION && sc.scale === 'Micro-A');
    a('golden pr' + r.pr + ' receipt RCP- 格式', /^RCP-[0-9a-f]{16}$/.test(sc.receipt.receipt_id), sc.receipt.receipt_id);
    a('golden pr' + r.pr + ' 骨架交集∩切片字段机械断言', r.skeleton.ok, r.skeleton.missing.join(','));
    a('golden pr' + r.pr + ' 披露块四字段在', sc.preview_disclosure !== null && typeof sc.preview_disclosure.capability_label === 'string' && Array.isArray(sc.preview_disclosure.structural_limitations) && Array.isArray(sc.preview_disclosure.not_in_preview));
    a('golden pr' + r.pr + ' citation_checks 面在', Array.isArray(sc.citation_checks) && sc.citation_checks.length > 0);
  }
  const refSc = JSON.parse(readFileSync(join(OUTDIR, refusal.outputs.sidecar), 'utf8'));
  const refMd = readFileSync(join(OUTDIR, refusal.outputs.md), 'utf8');
  a('golden 拒绝件 overall=unsupported', refSc.overall_verdict === 'unsupported', refSc.overall_verdict);
  a('golden 拒绝件含「无托管 PR 面」＋前置条件语义', refMd.indexOf('无托管 PR 面') >= 0 && refMd.indexOf('前置条件') >= 0);
  a('golden token 进 wire 但不入任何 fact', cap.every(function (q) { return q.token === 'GOLDEN-PLACEHOLDER'; }) && JSON.stringify(rr.collected.res.facts).indexOf('GOLDEN-PLACEHOLDER') < 0);
  const allPass = checks.every(function (c) { return c.pass; });
  writeFileSync(join(OUTDIR, '48-micro-a-golden-assertions.json'), JSON.stringify({ probe: '48-micro-a-preview.mjs --golden', generated_at: RUN_AT, cassette: cas.name + '（real 录制）＋拒绝腿 zero-pr-synthetic', all_pass: allPass, checks: checks }, null, 2) + NL, 'utf8');
  for (const c of checks) { console.log((c.pass ? 'PASS ' : 'FAIL ') + c.name + (c.detail ? ' :: ' + c.detail : '')); }
  console.log('[48-golden] all_pass=' + allPass + ' reports=' + rr.reports.length + ' refusal_overall=' + refusal.overall);
  if (!allPass) { process.exit(1); }
  return { reports: rr.reports, refusal: refusal };
}

// ---------- §10 真跑主流程：资格闸探针 → 拒绝件 → 双试点实跑 → 共享事实库 → 汇总 ----------
async function realMain() {
  const shared = {};
  const allFacts = [];
  const gateResults = [];
  const out = { probe: '48-micro-a-preview.mjs', generated_at: RUN_AT, ticket: 48, a_xxx: 'A-056', scale: 'Micro-A', gate_probes: [], refusals: [], pilots: [], shared_duckdb: null };

  for (const g of GATE_PROBES) {
    if (ARGS.repo && g.name !== ARGS.repo) { continue; }
    const gp = await gateProbe(g, shared);
    writeFactsJsonl(gp.facts, '48-micro-a-' + g.name + '-facts.jsonl');
    allFacts.push.apply(allFacts, gp.facts);
    gateResults.push(gp);
    out.gate_probes.push({ name: gp.name, merged_prs: gp.merged_prs, prs_listed: gp.prs_listed, eligible: gp.eligible, strategy: gp.strategy, degraded: gp.degraded, calls: gp.calls, stopped_reason: gp.stopped_reason });
  }
  const gateMeasName = '48-micro-a-gate-probes.json';
  writeFileSync(join(OUTDIR, gateMeasName), JSON.stringify({ probe: '48-micro-a-preview.mjs gate', generated_at: RUN_AT, criterion: 'TC-4', probes: out.gate_probes }, null, 2) + NL, 'utf8');

  for (const gp of gateResults) {
    if (gp.eligible === false) {
      const rf = await buildRefusalReport(gp, out.gate_probes, shared, { golden: false, measName: gateMeasName });
      out.refusals.push(rf);
    }
  }

  for (const t of PILOTS) {
    if (ARGS.repo && t.name !== ARGS.repo) { continue; }
    const rr = await runRepo(t, shared, { golden: false, factsName: '48-micro-a-' + t.name + '-facts.jsonl', measName: '48-micro-a-' + t.name + '-measurements.json' });
    allFacts.push.apply(allFacts, rr.collected.res.facts);
    out.pilots.push({ repo: t.name, head_sha: rr.collected.headSha, merged_prs: rr.gate.merged_prs, calls: rr.collected.res.calls, strategy: rr.collected.res.strategy, per_pr: rr.meas.per_pr, outputs: rr.reports.map(function (r) { return r.outputs; }) });
  }

  const DB = join(OUTDIR, '48-audit-facts.duckdb');
  if (existsSync(DB)) { unlinkSync(DB); }
  const writer = await STORE.openWriter(DB);
  const seen = new Set();
  let appended = 0;
  let dedup = 0;
  for (const f of allFacts) {
    if (seen.has(f.fact_id)) { dedup++; continue; }
    seen.add(f.fact_id);
    await STORE.appendFact(writer, f);
    appended++;
  }
  const scaleRows = await (await STORE.queryFacts(writer, 'SELECT scale, COUNT(*) AS n FROM audit_fact GROUP BY scale ORDER BY scale')).getRows();
  const repoRows = await (await STORE.queryFacts(writer, 'SELECT repo_ref, COUNT(*) AS n FROM audit_fact GROUP BY repo_ref ORDER BY repo_ref')).getRows();
  const dbCounts = { by_scale: {}, by_repo: {} };
  for (const r of scaleRows) { dbCounts.by_scale[String(r[0])] = Number(r[1]); }
  for (const r of repoRows) { dbCounts.by_repo[String(r[0])] = Number(r[1]); }
  await writer.run('FORCE CHECKPOINT');
  writer.closeSync();
  out.shared_duckdb = { file: '48-audit-facts.duckdb', appended: appended, dedup_dropped: dedup, db_by_scale: dbCounts.by_scale, db_by_repo: dbCounts.by_repo, note: 'Micro-A 事实（试点＋资格闸探针）同一 audit_fact 表同一 appendFact 写路径（单写者串行追加）' };

  writeFileSync(join(OUTDIR, '48-micro-a-measurements.json'), JSON.stringify(out, null, 2) + NL, 'utf8');
  for (const p of out.pilots) {
    for (const pr of p.per_pr) {
      console.log('[48] ' + p.repo + '#' + pr.n + ' form=' + pr.form_actual + ' (exp ' + pr.form_expected + ') merged=' + pr.merged + ' overall=' + pr.overall + ' channel=' + pr.diff_channel + ' skeleton=' + (pr.skeleton_ok ? 'OK' : 'MISS:' + pr.skeleton_missing.join(',')) + ' receipt=' + pr.receipt);
    }
  }
  for (const rf of out.refusals) { console.log('[48] refusal ' + rf.refusal_for + ' overall=' + rf.overall + ' receipt=' + rf.receipt); }
  for (const g of out.gate_probes) { console.log('[48] gate ' + g.name + ' merged=' + g.merged_prs + ' eligible=' + g.eligible + ' calls=' + g.calls); }
  console.log('[48] duckdb appended=' + appended + ' dedup=' + dedup + ' ' + JSON.stringify(dbCounts.by_repo));
  return out;
}

// ---------- §11 主入口（import 形态不跑——NN-check 机械导出面共用本模块常量/函数） ----------
const IS_MAIN = (function () {
  try { return resolve(process.argv[1] || '') === fileURLToPath(import.meta.url); } catch (e) { return false; }
})();
if (IS_MAIN) {
  if (ARGS.golden) { await goldenMain(); } else { await realMain(); }
  process.exit(0);
}
