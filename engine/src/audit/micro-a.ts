// audit/micro-a.ts —— 改动档（PR 档）审计核心流程
// 针对单个拉取请求（PR）的代码差异与相关信息进行审计：
//   1. 检查 PR 元数据与差异详情
//   2. 区分改动形态（人类提交、自动化发布机器人等）
//   3. 检查报告各必要字段完整性
//   4. 事实入库与证据生成
// 原则：对远程仓库只读；凭据用完即清，不写入事实库；时间戳保持确定性。

import { readFileSync, writeFileSync, existsSync, mkdirSync, mkdtempSync, rmSync, unlinkSync } from 'node:fs';
import { execFileSync } from 'node:child_process';
import { join, resolve, dirname } from 'node:path';
import { tmpdir } from 'node:os';
import { fileURLToPath } from 'node:url';
import { parseGithubRepoRef, collectGithubPrFacts, resolvePrDiff, createGithubRestClient, resolveGithubCredential } from '../upstream/github-rest.js';
import { readRepoFileSafe } from './safe-read.js';
import { deriveBaggageId, sha256Hex } from '../collect/collectors.js';
import type { CollectContext, CollectedFact } from '../collect/collectors.js';
import { buildReport, renderMarkdown, renderSidecar, deriveOverallBand, ADJUDICATION_PROTOCOL_VERSION, REPORT_SKELETON_VERSION, REPORT_SKELETON, preregDegraded } from '../report/generate.js';
import type { ReportInput, EvidenceItem, ClaimAnchor, QuadrantEntry, Recommendation, AdjudicationEntry, PreviewDisclosure } from '../report/generate.js';
import { isShallowRepo } from '../intake/intake.js';
import { openWriter, closeDuckdb } from '../fact/store.js';
import { writeRunFactsAndEvents } from './fact-write.js';
import type { AuditOptions, AuditResult } from './audit.js';

const NL = String.fromCharCode(10);

// ---------- 判据常量（跑前写死，跑完不许改动） ----------
export const MICRO_A_CAPABILITY_LABEL = 'capability 3 of 5 · preview';
export const MICRO_A_REPORT_ID_PREFIX = 'MA-48-';
export const MICRO_A_SLICE_FIELDS = [
  'pr_number', 'pr_title', 'pr_state', 'merged', 'merged_at',
  'author_login', 'author_type', 'bot_declared', 'bot_basis', 'author_form',
  'head_sha', 'base_sha', 'merge_commit_sha', 'html_url',
  'diff_channel', 'diff_files_changed', 'diff_additions', 'diff_deletions', 'diff_bytes',
  'credential_strategy', 'credential_degraded', 'api_calls', 'rate_limit_remaining'
];
const RELEASE_TITLE = new RegExp('^chore[(][^)]*[)]: release [0-9]+[.][0-9]+[.][0-9]+');   // 匹配 release-please 提交标题
const CRITERIA_PATH = 'engine/test/fixtures/contracts/48-micro-a-criteria.md';
// 理由：证据坐标必须指向仓库内现行可解析的文件。
const LEDGER_PATH = 'docs/archive/decisions/macro-audit-ledger.md';
const LEDGER_REPRO = 'git -C <repo> show HEAD:' + LEDGER_PATH;
const CRITERION_IDS = ['PC-1', 'TC-1', 'TC-2', 'TC-3', 'TC-4', 'NC-1'];
export const MICRO_A_GOLDEN_PRS = [{ n: 64, form: 'machine-generated/release-please' }, { n: 51, form: 'human' }];
export const MICRO_A_GOLDEN_DIFFS = [64];

// 固定试点用例定义
export interface MicroAPin { n: number; form: string }
export interface MicroAPilot { name: string; owner: string; repo: string; pins: readonly MicroAPin[] }
export const MICRO_A_PILOTS: readonly MicroAPilot[] = [
  { name: 'env-manager', owner: 'Xxx91n', repo: 'env-manager', pins: [
    { n: 64, form: 'machine-generated/release-please' },
    { n: 55, form: 'platform-declared-bot/dependabot' },
    { n: 51, form: 'human' }
  ] },
  { name: 'jiahao', owner: 'Xxx91n', repo: 'jiahao', pins: [{ n: 6, form: 'human' }] }
];
export const MICRO_A_REFUSAL_FACE = { name: 'goose-duck-agent', owner: 'Xxx91n', repo: 'goose-duck-agent' };   // 负对照主体（合并 PR 数为 0）
export const MICRO_A_DRIFT_FACE = { name: 'anysearch-cli', owner: 'Xxx91n', repo: 'anysearch-cli' };

// ---------- 结构化拒绝错误 ----------
export interface MicroAInputError { code: 'MICRO-A-INPUT' | 'MICRO-A-SCOPE'; message: string; pilots: readonly string[]; requested: string }
export function isMicroAInputError(e: unknown): e is MicroAInputError {
  return !!e && typeof e === 'object' && ((e as { code?: string }).code === 'MICRO-A-INPUT' || (e as { code?: string }).code === 'MICRO-A-SCOPE');
}

// ---------- 运行时间戳（支持环境变量固定，默认 epoch 0） ----------
export function deterministicRunAt(): string {
  const e = process.env.SOURCE_DATE_EPOCH;
  if (e === undefined || e === '') { return new Date(0).toISOString(); }
  const n = Number(e);
  if (!Number.isFinite(n)) { throw new Error('SOURCE_DATE_EPOCH 非法值：' + JSON.stringify(e) + '（须为秒级 unix epoch 数值）'); }
  return new Date(Math.trunc(n) * 1000).toISOString();
}

// ---------- 测试与回放注入接口 ----------
export interface MicroAGhTokenProbe { (): { available: boolean; token: string | null } }
export interface MicroACassetteFetcher { (req: { url: string; method: string; accept?: string }): Promise<{ status: number; headers: Record<string, string>; body: string }> }
export interface MicroAShared { env?: Record<string, string>; ghTokenProbe?: MicroAGhTokenProbe; fetcher?: MicroACassetteFetcher }

type GhCollect = Awaited<ReturnType<typeof collectGithubPrFacts>>;
export interface MicroATarget { name: string; owner: string; repo: string; root: string | null; pins: readonly MicroAPin[] }
export interface MicroACollect { t: MicroATarget; ctx: CollectContext; res: GhCollect; summaries: Record<string, unknown>[]; mergedCount: number; headSha: string | null }

function tryGit(root: string, args: readonly string[]): string | null {
  try { return execFileSync('git', ['-C', root].concat(args), { encoding: 'utf8', stdio: ['ignore', 'pipe', 'pipe'] }).trim(); } catch (e) { return null; }
}

// 解析判据文件的变更提交：若浅克隆无法追溯完整历史，则明确返回降级标记，不假装拿到完整提交
export function resolvePreregCommit(root: string | null, criteriaPath: string): string {
  if (root === null) { return preregDegraded('no-source-repo'); }
  let shallow: boolean;
  try { shallow = isShallowRepo(root); } catch (e) { return preregDegraded('depth-unknown'); }
  if (shallow) { return preregDegraded('shallow-clone'); }
  return tryGit(root, ['log', '-1', '--format=%h', '--', criteriaPath]) || preregDegraded('no-criteria-history');
}
function sourceRepoRoot(): string | null {
  try {
    let dir = dirname(fileURLToPath(import.meta.url));
    for (let i = 0; i < 6; i++) {
      if (existsSync(join(dir, '.git'))) { return dir; }
      const up = dirname(dir);
      if (up === dir) { break; }
      dir = up;
    }
  } catch (e) { return null; }
  return null;
}
const PREREG_COMMIT = resolvePreregCommit(sourceRepoRoot(), CRITERIA_PATH);

// ---------- 采集流程 ----------
export function microACollectContext(t: { name: string; owner: string; repo: string }, headSha: string | null, runAt: string): CollectContext {
  return {
    runId: 'r48-' + t.name + '-' + (headSha || 'na').slice(0, 7),
    traceId: sha256Hex(t.repo + '|' + (headSha || 'na') + '|' + runAt).slice(0, 32),
    repoRef: t.owner + '/' + t.repo,
    scale: 'Micro-A',
    observedAt: runAt
  };
}

export async function collectMicroA(t: MicroATarget, shared: MicroAShared, diffsOverride: readonly number[] | undefined, runAt: string): Promise<MicroACollect> {
  const headSha = t.root ? tryGit(t.root, ['rev-parse', 'HEAD']) : null;
  const ctx = microACollectContext(t, headSha, runAt);
  const pins = t.pins;
  const opts: Record<string, unknown> = { state: 'all', details: pins.map(function (p) { return p.n; }), diffs: diffsOverride !== undefined ? diffsOverride : pins.map(function (p) { return p.n; }), repoRoot: t.root };
  if (shared.env) { opts.env = shared.env; }
  if (shared.ghTokenProbe) { opts.ghTokenProbe = shared.ghTokenProbe; }
  if (shared.fetcher) { opts.fetcher = shared.fetcher; }
  const res = await collectGithubPrFacts(t.owner, t.repo, opts as Parameters<typeof collectGithubPrFacts>[2], ctx);
  const summaries = res.facts.filter(function (f) { return f.metric === 'github_rest.pr_summary'; }).map(function (f) { return JSON.parse(f.value_json) as Record<string, unknown>; });
  const mergedCount = summaries.filter(function (s) { return s.merged_at !== null; }).length;
  return { t: t, ctx: ctx, res: res, summaries: summaries, mergedCount: mergedCount, headSha: headSha };
}

// 检查是否具备合格的托管 PR：已合并 PR 数需大于等于 1；为 0 则明确拒绝
export interface MicroAGate { name: string; owner: string; repo: string; merged_prs: number; prs_listed: number; eligible: boolean; strategy: string; degraded: boolean; calls: number; stopped_reason: string | null; facts: CollectedFact[]; ctx: CollectContext; headSha: string | null; refusal: boolean }
export async function gateProbeMicroA(g: { name: string; owner: string; repo: string; root?: string | null; refusal?: boolean }, shared: MicroAShared, runAt: string): Promise<MicroAGate> {
  const t: MicroATarget = { name: g.name, owner: g.owner, repo: g.repo, root: g.root || null, pins: [] };
  const r = await collectMicroA(t, shared, [], runAt);
  return { name: g.name, owner: g.owner, repo: g.repo, merged_prs: r.mergedCount, prs_listed: r.res.prs_listed, eligible: r.mergedCount >= 1, strategy: r.res.strategy, degraded: r.res.degraded, calls: r.res.calls, stopped_reason: r.res.stopped_reason, facts: r.res.facts, ctx: r.ctx, headSha: r.headSha, refusal: g.refusal === true };
}

// ---------- 提取 diff 差异内容 ----------
export interface MicroADiffArtifact { ok: boolean; channel: string; bytes: number; stats: { files_changed: number | null; additions: number | null; deletions: number | null }; error: string | null }
export async function fetchDiffArtifactMicroA(t: MicroATarget, n: number, baseSha: string, headSha: string, shared: MicroAShared, outDir: string | null, outName: string): Promise<MicroADiffArtifact> {
  const cred = resolveGithubCredential(shared.env || (process.env as Record<string, string>), shared.ghTokenProbe);
  const client = createGithubRestClient(cred, shared.fetcher ? ({ fetcher: shared.fetcher } as Parameters<typeof createGithubRestClient>[1]) : {});
  let d: { ok: boolean; text: string; channel: string; stats: { files_changed: number | null; additions: number | null; deletions: number | null }; detail?: string; error_kind?: string };
  try {
    d = (await resolvePrDiff(client, t.owner, t.repo, n, baseSha || '', headSha || '', t.root)) as typeof d;
  } catch (e) {
    return { ok: false, channel: 'api', bytes: 0, stats: { files_changed: null, additions: null, deletions: null }, error: String((e as Error).message || e).slice(0, 160) };
  }
  if (d.ok && d.text.length > 0 && outDir !== null) { writeFileSync(join(outDir, outName), d.text, 'utf8'); }
  return { ok: d.ok, channel: d.channel, bytes: d.text.length, stats: d.stats, error: d.ok ? null : String(d.detail || d.error_kind || 'unknown') };
}

// ---------- 提交形态分类 ----------
export function classifyForm(v: Record<string, unknown>): string {
  if (v.bot_declared === true && /dependabot/i.test(String(v.author_login))) { return 'platform-declared-bot/dependabot'; }
  if (v.bot_declared === true && RELEASE_TITLE.test(String(v.title))) { return 'machine-generated/release-please'; }
  if (v.bot_declared === true) { return 'platform-declared-bot/other'; }
  return 'human';
}

// ---------- 报告必要字段检查 ----------
export function skeletonIntersectionReport(sidecar: Record<string, unknown>, mdText: string): { ok: boolean; missing: string[] } {
  const missing: string[] = [];
  const rename: Record<string, string> = { stale_data_marker: 'stale.marker', staleness_sla_seconds: 'stale.sla_seconds', read_model_lag_seconds: 'stale.lag_seconds', read_model_version: 'stale.read_model_version', fact_watermark_version: 'stale.fact_watermark_version', evidence_items: 'evidence' };
  function has(obj: unknown, path: string): boolean {
    let cur = obj as Record<string, unknown>;
    for (const p of path.split('.')) {
      if (cur === null || typeof cur !== 'object' || !(p in cur)) { return false; }
      cur = cur[p] as Record<string, unknown>;
    }
    return true;
  }
  const skeleton = REPORT_SKELETON as unknown as readonly { id: string; required_fields: readonly string[] }[];
  for (const ch of skeleton) {
    for (const f of ch.required_fields) {
      const leaf = rename[f] || f;
      if (ch.id === 'C1') {
        if (!has(sidecar, leaf) && (typeof mdText !== 'string' || mdText.indexOf(f) < 0)) { missing.push('C1.' + f); }
      } else if (ch.id === 'C2') {
        if (f === 'quadrants') { if (!has(sidecar, 'quadrants')) { missing.push('C2.quadrants'); } }
        else { const qs = (sidecar.quadrants || []) as Record<string, unknown>[]; let bad = qs.length === 0; for (const q of qs) { if (!has(q, f)) { bad = true; } } if (bad) { missing.push('C2.' + f); } }
      } else if (ch.id === 'C3') {
        if (f === 'evidence_items') { if (!has(sidecar, 'evidence')) { missing.push('C3.evidence_items'); } }
        else { const es = (sidecar.evidence || []) as Record<string, unknown>[]; let bad = es.length === 0; for (const e of es) { if (!has(e, f)) { bad = true; } } if (bad) { missing.push('C3.' + f); } }
      } else if (ch.id === 'C4') {
        if (f === 'recommendations') { if (!has(sidecar, 'recommendations')) { missing.push('C4.recommendations'); } }
        else { const rs = (sidecar.recommendations || []) as Record<string, unknown>[]; let bad = rs.length === 0; for (const r of rs) { if (!has(r, f)) { bad = true; } } if (bad) { missing.push('C4.' + f); } }
      }
    }
  }
  const qsAll = (sidecar.quadrants || []) as Record<string, unknown>[];
  const bq = qsAll.filter(function (q) { return q.quadrant === 'behavior'; })[0];
  const slice = (bq && bq.slice_fields) as Record<string, unknown> | undefined;
  for (const f of MICRO_A_SLICE_FIELDS) { if (!slice || !(f in slice)) { missing.push('slice.' + f); } }
  return { ok: missing.length === 0, missing: missing };
}

// ---------- 辅助函数 ----------
function val(f: CollectedFact): Record<string, unknown> { return JSON.parse(f.value_json) as Record<string, unknown>; }
function byMetric(facts: readonly CollectedFact[], m: string): CollectedFact[] { return facts.filter(function (f) { return f.metric === m; }); }
function prFact(facts: readonly CollectedFact[], metric: string, n: number): CollectedFact | null {
  const hit = facts.filter(function (f) { return f.metric === metric && f.subject_ref.slice(-('#' + n).length) === '#' + n; });
  return hit.length > 0 ? hit[0] : null;
}
function pickExcerpt(absOrRelPath: string, tokens: readonly string[] | null, base: string | null): { line: number; text: string } {
  let text: string;
  if (base) {
    const r = readRepoFileSafe(base, absOrRelPath);
    if (!r.ok) { throw new Error('EXCERPT-REJECTED[' + absOrRelPath + ']: ' + r.reason); }
    text = r.text;
  } else {
    text = readFileSync(absOrRelPath, 'utf8');
  }
  const lines = text.split(NL);
  if (tokens === null) { return { line: 1, text: lines[0].trim() }; }
  for (let i = 0; i < lines.length; i++) {
    let all = true;
    for (const tk of tokens) { if (lines[i].indexOf(tk) < 0) { all = false; } }
    if (all) { return { line: i + 1, text: lines[i].trim() }; }
  }
  throw new Error('EXCERPT-MISS: ' + absOrRelPath + ' tokens=' + String(tokens));
}

// ---------- 单 PR 报告构建 ----------
export interface MicroAPrRunOpts { golden: boolean; outDir: string | null; measName: string; factsName: string }
export interface MicroAPrResult { pr: number; form_expected: string; form_actual: string; form_match: boolean; merged: boolean; overall: string; receipt: string; diff_channel: string | null; artifact: MicroADiffArtifact; skeleton: { ok: boolean; missing: string[] }; outputs: { md: string; sidecar: string; diff: string | null }; fact_ids: string[] }
export async function buildPrReportMicroA(t: MicroATarget, pin: MicroAPin, collected: MicroACollect, gate: { merged_prs: number; eligible: boolean }, shared: MicroAShared, opts: MicroAPrRunOpts): Promise<MicroAPrResult> {
  const RUN_AT = collected.ctx.observedAt;
  const NAME = t.name;
  const R = NAME.toUpperCase().split('-').join('');
  const PRE = opts.golden ? 'micro-a-golden-' : 'micro-a-';
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
  // 提取 diff 差异产物
  const artName = PRE + NAME + '-pr' + pin.n + '.diff';
  const art = await fetchDiffArtifactMicroA(t, pin.n, sum ? String(sum.base_sha) : '', sum ? String(sum.head_sha) : '', shared, opts.outDir, artName);
  // 判据规则评估
  const tripleOk = sumF !== null && metaF !== null && diffF !== null && merged === true;
  const numStatsOk = diff !== null && typeof diff.files_changed === 'number' && typeof diff.additions === 'number' && typeof diff.deletions === 'number';
  const channelOk = diff !== null && (diff.channel === 'local-git' || diff.channel === 'api') && typeof diff.bytes === 'number' && (diff.bytes as number) > 0;
  // 接口获取 diff 时若无具体行数统计，需有相应说明
  const tc2ok = channelOk && (diff !== null && diff.channel === 'api' ? (typeof diff.detail === 'string' && (diff.detail as string).length > 0) : numStatsOk);
  const botFieldsOk = sum !== null && typeof sum.bot_declared === 'boolean' && typeof sum.bot_basis === 'string' && String(sum.bot_basis).indexOf('platform-declared') === 0;
  const EV = function (k: number): string { return 'EV-48-' + R + '-PR' + pin.n + '-0' + k; };
  const entries: AdjudicationEntry[] = [
    { criterion_id: 'PC-1', band: run !== null && (run.prs_listed as number) > 0 ? 'supported' : 'insufficient', basis_refs: ['B1'], anchored_fact_ids: runF ? [runF.fact_id] : [], anchored_evidence_ids: [EV(1)], decided_at: RUN_AT, rationale: run !== null && (run.prs_listed as number) > 0 ? '适配器 run 事实在案：prs_listed=' + String(run.prs_listed) + ' calls=' + String(run.calls) + ' strategy=' + String(run.strategy) + '（枚举真实发生）' : '枚举未发生——管线故障' },
    { criterion_id: 'TC-1', band: tripleOk ? 'supported' : 'insufficient', basis_refs: ['B2'], anchored_fact_ids: [sumF, metaF, diffF].filter(Boolean).map(function (f) { return (f as CollectedFact).fact_id; }), anchored_evidence_ids: [EV(3)], decided_at: RUN_AT, rationale: tripleOk ? 'PR 证据三联齐备（summary＋metadata＋diff）且 merged=true' : '证据三联缺腿：summary=' + (sumF ? '1' : '0') + ' metadata=' + (metaF ? '1' : '0') + ' diff=' + (diffF ? '1' : '0') + ' merged=' + String(merged) },
    { criterion_id: 'TC-2', band: tc2ok ? 'supported' : 'insufficient', basis_refs: ['B2'], anchored_fact_ids: diffF ? [diffF.fact_id] : [], anchored_evidence_ids: [EV(2)], decided_at: RUN_AT, rationale: diff !== null ? 'diff channel=' + String(diff.channel) + ' files=' + String(diff.files_changed) + ' +' + String(diff.additions) + '/-' + String(diff.deletions) + ' bytes=' + String(diff.bytes) + (diff.channel === 'api' ? '（api 腿 stats 契约缺席 detail=' + String(diff.detail).slice(0, 40) + '）' : '') : 'diff 事实缺席' },
    { criterion_id: 'TC-3', band: botFieldsOk ? 'supported' : 'insufficient', basis_refs: ['B2'], anchored_fact_ids: sumF ? [sumF.fact_id] : [], anchored_evidence_ids: [EV(3)], decided_at: RUN_AT, rationale: botFieldsOk ? '作者形态披露齐备：bot_declared=' + String(sum === null ? '' : sum.bot_declared) + ' basis=' + String(sum === null ? '' : sum.bot_basis) : '作者形态字段缺席' },
    { criterion_id: 'TC-4', band: gate.merged_prs >= 1 ? 'supported' : 'unsupported', basis_refs: ['B2'], anchored_fact_ids: [], anchored_evidence_ids: [EV(1)], decided_at: RUN_AT, rationale: '托管面资格闸：' + NAME + ' 托管枚举 merged PR=' + String(gate.merged_prs) + '（>=1 即 eligible；D-033 硬约束逆用判据）' },
    { criterion_id: 'NC-1', band: merged && formMatch ? 'supported' : 'unsupported', basis_refs: ['B4'], anchored_fact_ids: sumF ? [sumF.fact_id] : [], anchored_evidence_ids: [EV(3)], decided_at: RUN_AT, rationale: '负对照：入选实例 ' + pin.form + ' 票面写死；实测 form=' + formActual + ' merged=' + String(merged) + '（closed-unmerged 不入集、形态错配即判负）' }
  ];
  const overall = deriveOverallBand(entries);
  // 改动档各专属字段内容
  const sliceFields: Record<string, unknown> = {
    pr_number: pin.n,
    pr_title: sum ? String(sum.title) : '',
    pr_state: sum ? String(sum.state) : '',
    merged: merged,
    merged_at: (meta && meta.merged_at) || (sum && sum.merged_at) || null,
    author_login: sum ? String(sum.author_login) : '',
    author_type: sum ? String(sum.author_type) : '',
    bot_declared: sum ? sum.bot_declared : null,
    bot_basis: sum ? sum.bot_basis : null,
    author_form: formActual,
    head_sha: sum ? String(sum.head_sha) : '',
    base_sha: sum ? String(sum.base_sha) : '',
    merge_commit_sha: meta ? meta.merge_commit_sha : null,
    html_url: sum ? String(sum.html_url) : '',
    diff_channel: diff ? diff.channel : null,
    diff_files_changed: diff ? diff.files_changed : null,
    diff_additions: diff ? diff.additions : null,
    diff_deletions: diff ? diff.deletions : null,
    diff_bytes: diff ? diff.bytes : null,
    credential_strategy: run ? String(run.strategy) : collected.res.strategy,
    credential_degraded: run ? run.degraded : collected.res.degraded,
    api_calls: run ? run.calls : null,
    rate_limit_remaining: run ? run.final_remaining : null
  };
  // 构建引文证据
  const evidence: EvidenceItem[] = [];
  function addEvidence(id: string, src: string, tokens: readonly string[], claim: string, repro: string, base: string | null): void {
    let ex: { line: number; text: string } | null = null;
    try { ex = pickExcerpt(src, tokens, base); } catch (e) {
      evidence.push({ evidence_id: id, source: src, locator: 'L0', claim: claim, grounded: false, collected_at: RUN_AT, reproduce_cmd: repro, reproduce_absent_reason: '引文摘取失败：' + String((e as Error).message ? (e as Error).message : e).slice(0, 140), required_tokens: [], excerpt: '' });
      return;
    }
    evidence.push({ evidence_id: id, source: src, locator: 'L' + String(ex.line), claim: claim, grounded: true, collected_at: RUN_AT, reproduce_cmd: repro, reproduce_absent_reason: null, required_tokens: [], excerpt: ex.text });
  }
  const RUN_CMD = 'macro-audit audit ' + t.owner + '/' + t.repo + ' --scale Micro-A' + (opts.outDir ? ' --out <dir>' : '');
  addEvidence(EV(1), opts.measName, ['prs_listed'], '本次实测：' + NAME + ' 托管枚举真实发生（prs_listed=' + String(collected.res.prs_listed) + ' merged=' + String(gate.merged_prs) + '）', RUN_CMD, opts.outDir);
  if (art.ok) {
    addEvidence(EV(2), artName, ['diff --git'], '本次实测：' + NAME + '#' + String(pin.n) + ' diff 工件行级锚（channel=' + art.channel + ' bytes=' + String(art.bytes) + '）', RUN_CMD, opts.outDir);
  } else {
    evidence.push({ evidence_id: EV(2), source: artName, locator: 'L0', claim: '' + NAME + '#' + String(pin.n) + ' diff 工件', grounded: false, collected_at: RUN_AT, reproduce_cmd: RUN_CMD, reproduce_absent_reason: 'diff 工件缺席（' + String(art.error || 'channel 未产') + '）', required_tokens: [], excerpt: '' });
  }
  addEvidence(EV(3), opts.factsName, ['github_rest.pr_metadata', '#' + String(pin.n)], '本次实测：' + NAME + '#' + String(pin.n) + ' 元数据事实落库（merged=' + String(merged) + '）', RUN_CMD, opts.outDir);
  const srcRoot = sourceRepoRoot();
  addEvidence(EV(4), LEDGER_PATH, ['D-049', '票面形态'], '票面授权锚：D-049 Micro-A preview 单票铺开决策行', LEDGER_REPRO, srcRoot);
  addEvidence(EV(5), CRITERIA_PATH, ['TC-4'], '判据预声明锚：48-micro-a-criteria.md 判据集在案（跑后禁调）', 'git -C <repo> show HEAD:' + CRITERIA_PATH, srcRoot);
  const claims: ClaimAnchor[] = [
    { claim_id: 'CL-48-' + R + '-PR' + String(pin.n) + '-01', evidence_id: EV(1), required_tokens: ['prs_listed'] },
    { claim_id: 'CL-48-' + R + '-PR' + String(pin.n) + '-02', evidence_id: EV(2), required_tokens: ['diff --git'] },
    { claim_id: 'CL-48-' + R + '-PR' + String(pin.n) + '-03', evidence_id: EV(3), required_tokens: ['github_rest.pr_metadata'] },
    { claim_id: 'CL-48-' + R + '-PR' + String(pin.n) + '-04', evidence_id: EV(4), required_tokens: ['D-049'] },
    { claim_id: 'CL-48-' + R + '-PR' + String(pin.n) + '-05', evidence_id: EV(5), required_tokens: ['TC-4'] }
  ];
  // 四象限状态（改动档仅分析行为面，其余象限如实披露为不适用）
  const GATE = { protocol_version: ADJUDICATION_PROTOCOL_VERSION, audit_ref: 'engine/src/audit/micro-a.ts' };
  const isDep = formActual === 'platform-declared-bot/dependabot';
  const quadrants: QuadrantEntry[] = [
    { quadrant: 'behavior', applicability: 'native', verdict: overall, score: null, confidence: 0.6, dimensions: [], slice_fields: sliceFields, verdict_gate: { protocol_version: GATE.protocol_version, decision: overall, evidence_flag: tripleOk, decided_at: RUN_AT, override_reason: null, audit_ref: GATE.audit_ref }, conflict_markers: isDep ? ['supply-chain-signal-unadjudicated'] : [] },
    { quadrant: 'structure', applicability: 'not_applicable', verdict: 'insufficient', score: null, confidence: 0, dimensions: [], slice_fields: {}, verdict_gate: { protocol_version: GATE.protocol_version, decision: 'insufficient', evidence_flag: false, decided_at: RUN_AT, override_reason: 'Micro-A 切片无结构采集面（PR 粒度；结构象限归 Macro-B 仓级采集）', audit_ref: GATE.audit_ref }, conflict_markers: ['out-of-scope-micro-a'] },
    { quadrant: 'supply_chain', applicability: 'not_applicable', verdict: 'insufficient', score: null, confidence: 0, dimensions: [], slice_fields: {}, verdict_gate: { protocol_version: GATE.protocol_version, decision: 'insufficient', evidence_flag: false, decided_at: RUN_AT, override_reason: '⚠ 数据未接——Scorecard 未接（按层需求队列不插队，D-034③）' + (isDep ? '；dependabot PR 的供应链信号仅作事实落库不裁决' : ''), audit_ref: GATE.audit_ref }, conflict_markers: isDep ? ['data-not-connected', 'supply-chain-signal-unadjudicated'] : ['data-not-connected'] },
    { quadrant: 'strategy', applicability: 'not_applicable', verdict: 'insufficient', score: null, confidence: 0, dimensions: [], slice_fields: {}, verdict_gate: { protocol_version: GATE.protocol_version, decision: 'insufficient', evidence_flag: false, decided_at: RUN_AT, override_reason: 'Micro-A 切片不裁仓级战略叙事（战略象限在仓级/跨仓层投影）', audit_ref: GATE.audit_ref }, conflict_markers: ['out-of-scope-micro-a'] }
  ];
  const recommendations: Recommendation[] = [
    { rec_id: 'R-48-' + R + '-PR' + String(pin.n) + '-1', priority: 'P1', action: 'Micro-A preview 遗留面收口：pulls.reviews/comments 自 planned 拉入（锁表 github-rest 契约面）＋diff --llm 行级语义评审归 #50 叙事双轨', rationale: 'preview 判据=证据完整性/托管面资格/选择性，非 PR 质量裁决——行级评审叙事面属宿主 agent（D-053/D-058），本 preview 不含', expected_impact: 'Micro-A preview → GA 漏斗的叙事面齐备', effort: 'M', verdict_gate_stamp: ADJUDICATION_PROTOCOL_VERSION + ' / ' + overall, evidence_refs: [EV(4)], degraded_note: null },
    { rec_id: 'R-48-' + R + '-PR' + String(pin.n) + '-2', priority: 'P2', action: 'Micro-A GA 前置：>=1 非自有公开仓真实 PR 走通用化验证（Generalization Gate；复用 URL opt-in 输入面）', rationale: '同主确认偏差如实披露——试点仓与产品同主（Xxx91n），本报告属校准+冒烟不构成泛化证据', expected_impact: '泛化证据链起点', effort: 'S', verdict_gate_stamp: ADJUDICATION_PROTOCOL_VERSION + ' / ' + overall, evidence_refs: [EV(4)], degraded_note: null }
  ];
  const mergeSha = meta && meta.merge_commit_sha ? String(meta.merge_commit_sha) : (collected.headSha || 'unanchored');
  const treeSha = new RegExp('^[0-9a-f]{40}$').test(mergeSha) && t.root ? (tryGit(t.root, ['rev-parse', mergeSha + '^{tree}']) || 'unresolved-tree') : 'unanchored';
  const disclosure: PreviewDisclosure = {
    capability_label: MICRO_A_CAPABILITY_LABEL,
    calibration_scope: '同主试点仓 merged PR 最小集（env-manager×3 形态＋jiahao×1 全人基线；票面写死实例）',
    structural_limitations: (opts.golden ? ['golden 回放：响应来自 cassette 录制非实时 API——本件为管道 golden 产物非真实审计'] : []).concat([
      '同主确认偏差：试点仓与产品同主（Xxx91n）——dogfooding = generative not evaluative（D-033），本报告属校准+冒烟不构成泛化证据',
      '判据范围收窄：preview 判据=证据完整性/托管面资格/选择性，非 PR 质量裁决——diff --llm 行级语义评审归 #50 叙事双轨（D-053）',
      'reviews/comments 面 planned 未接（锁表 github-rest 契约面）——评审语义不在 preview 内',
      'supply_chain 象限 not_applicable：Scorecard 未接（D-034③）；dependabot PR 的供应链信号仅作事实落库',
      '适配器硬化面已落 engine 一等面（#85② 闭环，D-204③④）：宿主 API diff 工件双通道＋cassette 回放见 engine/src/audit/micro-a.ts（重校准背书=85-check E 组）'
    ]),
    not_in_preview: ['Macro-A']
  };
  const reportInput: ReportInput = {
    report_id: MICRO_A_REPORT_ID_PREFIX + R + '-PR' + String(pin.n) + '-PREVIEW',
    stability: 'preview',
    capabilities: ['micro-a'],
    scale: 'Micro-A',
    subject_ref: t.owner + '/' + t.repo + '#' + String(pin.n),
    generated_at: RUN_AT,
    trace_id: collected.ctx.traceId,
    baggage_id: deriveBaggageId(collected.ctx, null),
    headline: t.owner + '/' + t.repo + '#' + String(pin.n) + ' Micro-A preview（capability 3 of 5）：form=' + formActual + ' diff_channel=' + (diff ? String(diff.channel) : 'absent') + ' +' + String(diff ? diff.additions : 'n/a') + '/-' + String(diff ? diff.deletions : 'n/a') + ' f=' + String(diff ? diff.files_changed : 'n/a') + ' → ' + overall + '',
    confidence: 0.6,
    stale: { marker: 'fresh', sla_seconds: 5, lag_seconds: 0, read_model_version: REPORT_SKELETON_VERSION, fact_watermark_version: '1' },
    fact_ids: [sumF, metaF, diffF].filter(Boolean).map(function (f) { return (f as CollectedFact).fact_id; }),
    top_findings: [EV(1), EV(2), EV(3)],
    evidence: evidence,
    claims: claims,
    quadrants: quadrants,
    recommendations: recommendations,
    adjudication_entries: entries,
    decided_at: RUN_AT,
    commit_anchor: mergeSha,
    tree_anchor: treeSha,
    gate_ref: { prereg_commit: PREREG_COMMIT, criteria_path: CRITERIA_PATH, basis_path: 'engine/test/fixtures/contracts/48-micro-a-preview-issue.md', criterion_ids: CRITERION_IDS },
    degraded: collected.res.degraded === true,
    degraded_reason: collected.res.degraded === true ? '无凭据降级（unauthenticated 60/h 限额）——事实面如实降级' : null,
    preview_disclosure: disclosure,
    human: { status: 'pending', adjudicator: 'user', text: null, decided_at: null }
  };
  const report = buildReport(reportInput);
  const mdName = PRE + NAME + '-pr' + String(pin.n) + '.md';
  const jsonName = PRE + NAME + '-pr' + String(pin.n) + '.json';
  const mdText = renderMarkdown(report) + NL;
  const scText = renderSidecar(report) + NL;
  const sidecarObj = JSON.parse(scText) as Record<string, unknown>;
  if (opts.outDir !== null) {
    writeFileSync(join(opts.outDir, mdName), mdText, 'utf8');
    writeFileSync(join(opts.outDir, jsonName), scText, 'utf8');
  }
  return {
    pr: pin.n, form_expected: pin.form, form_actual: formActual, form_match: formMatch,
    merged: merged, overall: overall, receipt: report.receipt.receipt_id,
    diff_channel: diff ? String(diff.channel) : null, artifact: art,
    skeleton: skeletonIntersectionReport(sidecarObj, mdText),
    outputs: { md: mdName, sidecar: jsonName, diff: art.ok ? artName : null },
    fact_ids: report.fact_ids
  };
}


// ---------- 拒绝报告构建（无合格 PR 时的处理） ----------
export interface MicroARefusalOpts { golden: boolean; outDir: string | null; measName: string }
export interface MicroARefusalResult { refusal_for: string; overall: string; receipt: string; outputs: { md: string; sidecar: string } }
export async function buildRefusalReportMicroA(g: { name: string; owner: string; repo: string; headSha: string | null; root: string | null; facts: CollectedFact[]; ctx: CollectContext }, shared: MicroAShared, opts: MicroARefusalOpts): Promise<MicroARefusalResult> {
  const RUN_AT = g.ctx.observedAt;
  const R = g.name.toUpperCase().split('-').join('');
  const evidence: EvidenceItem[] = [];
  function addEvidence(id: string, src: string, tokens: readonly string[], claim: string, repro: string, base: string | null): void {
    let ex: { line: number; text: string } | null = null;
    try { ex = pickExcerpt(src, tokens, base); } catch (e) {
      evidence.push({ evidence_id: id, source: src, locator: 'L0', claim: claim, grounded: false, collected_at: RUN_AT, reproduce_cmd: repro, reproduce_absent_reason: '引文摘取失败：' + String((e as Error).message || e).slice(0, 140), required_tokens: [], excerpt: '' });
      return;
    }
    evidence.push({ evidence_id: id, source: src, locator: 'L' + String(ex.line), claim: claim, grounded: true, collected_at: RUN_AT, reproduce_cmd: repro, reproduce_absent_reason: null, required_tokens: [], excerpt: ex.text });
  }
  const RUN_CMD = 'macro-audit audit ' + g.owner + '/' + g.repo + ' --scale Micro-A';
  addEvidence('EV-48-' + R + '-REF-01', opts.measName, [g.name], '本次实测：' + g.name + ' 托管枚举 merged PR=0——无托管 PR 面', RUN_CMD, opts.outDir);
  const srcRoot = sourceRepoRoot();
  addEvidence('EV-48-' + R + '-REF-03', LEDGER_PATH, ['| D-033 |', '不得指派无托管 PR 面'], '硬约束锚：D-033/D-049「PR 层试点不得指派无托管 PR 面的仓」', LEDGER_REPRO, srcRoot);
  const runF = byMetric(g.facts, 'github_rest.run').slice(-1)[0] || null;
  const run = runF ? val(runF) : null;
  const entries: AdjudicationEntry[] = [
    { criterion_id: 'PC-1', band: run !== null ? 'supported' : 'insufficient', basis_refs: ['B1'], anchored_fact_ids: runF ? [runF.fact_id] : [], anchored_evidence_ids: ['EV-48-' + R + '-REF-01'], decided_at: RUN_AT, rationale: run !== null ? '适配器 run 事实在案：calls=' + String(run.calls) + ' strategy=' + String(run.strategy) + '（枚举真实发生——拒绝非管线故障）' : '枚举未发生' },
    { criterion_id: 'TC-4', band: 'unsupported', basis_refs: ['B2'], anchored_fact_ids: byMetric(g.facts, 'github_rest.pr_summary').map(function (f) { return f.fact_id; }), anchored_evidence_ids: ['EV-48-' + R + '-REF-01'], decided_at: RUN_AT, rationale: '托管面资格闸未过：' + g.name + ' 托管枚举 merged PR=0 → intake 显式拒绝（D-033 硬约束逆用）。原因=无托管 PR 面（无可裁 PR 对象）；前置条件=仓接入托管 PR 流程且产出 >=1 merged PR 后再复审' }
  ];
  const GATE = { protocol_version: ADJUDICATION_PROTOCOL_VERSION, audit_ref: 'engine/src/audit/micro-a.ts' };
  const quadrants: QuadrantEntry[] = ['behavior', 'structure', 'supply_chain', 'strategy'].map(function (q) {
    return { quadrant: q, applicability: 'not_applicable', verdict: 'insufficient', score: null, confidence: 0, dimensions: [], slice_fields: {}, verdict_gate: { protocol_version: GATE.protocol_version, decision: 'insufficient', evidence_flag: false, decided_at: RUN_AT, override_reason: 'intake 拒绝——无 PR 对象，象限无可裁面', audit_ref: GATE.audit_ref }, conflict_markers: ['intake-refused'] };
  });
  const commitAnchor = g.headSha || 'unanchored-no-local-clone';
  const treeSha = new RegExp('^[0-9a-f]{40}$').test(commitAnchor) && g.root ? (tryGit(g.root, ['rev-parse', commitAnchor + '^{tree}']) || 'unresolved-tree') : 'unanchored';
  const reportInput: ReportInput = {
    report_id: MICRO_A_REPORT_ID_PREFIX + R + '-REFUSAL',
    stability: 'preview',
    capabilities: ['micro-a'],
    scale: 'Micro-A',
    subject_ref: g.owner + '/' + g.repo,
    generated_at: RUN_AT,
    trace_id: g.ctx.traceId,
    baggage_id: deriveBaggageId(g.ctx, null),
    headline: g.name + ' Micro-A preview 拒绝件：托管枚举 merged PR=0——无托管 PR 面，intake 显式拒绝（unsupported；非管线故障，枚举真实发生）',
    confidence: 0.9,
    stale: { marker: 'fresh', sla_seconds: 5, lag_seconds: 0, read_model_version: REPORT_SKELETON_VERSION, fact_watermark_version: '1' },
    fact_ids: g.facts.map(function (f) { return f.fact_id; }),
    top_findings: ['EV-48-' + R + '-REF-01', 'EV-48-' + R + '-REF-03'],
    evidence: evidence,
    claims: [
      { claim_id: 'CL-48-' + R + '-REF-01', evidence_id: 'EV-48-' + R + '-REF-01', required_tokens: [g.name] },
      { claim_id: 'CL-48-' + R + '-REF-03', evidence_id: 'EV-48-' + R + '-REF-03', required_tokens: ['无托管 PR 面'] }
    ],
    quadrants: quadrants,
    recommendations: [
      { rec_id: 'R-48-' + R + '-REF-1', priority: 'P1', action: '前置条件：' + g.name + ' 接入托管 PR 流程并产出 >=1 merged PR 后，Micro-A 指派复审再开（D-033 capacity 硬约束）', rationale: '无托管 PR 面仓不得指派 PR 层试点——拒绝是判据成立形态非失败', expected_impact: 'Micro-A 试点指派纪律守住', effort: 'XS', verdict_gate_stamp: ADJUDICATION_PROTOCOL_VERSION + ' / unsupported', evidence_refs: ['EV-48-' + R + '-REF-03'], degraded_note: null }
    ],
    adjudication_entries: entries,
    decided_at: RUN_AT,
    commit_anchor: commitAnchor,
    tree_anchor: treeSha,
    gate_ref: { prereg_commit: PREREG_COMMIT, criteria_path: CRITERIA_PATH, basis_path: 'engine/test/fixtures/contracts/48-micro-a-preview-issue.md', criterion_ids: ['PC-1', 'TC-4'] },
    degraded: false,
    degraded_reason: null,
    preview_disclosure: {
      capability_label: MICRO_A_CAPABILITY_LABEL,
      calibration_scope: '托管面资格闸拒绝件（failure 演示面）',
      structural_limitations: (opts.golden ? ['golden 回放：响应来自 cassette 录制非实时 API——本件为管道 golden 产物非真实审计'] : []).concat([
        '拒绝语义：intake 阶段显式拒绝（D-033 硬约束逆用）——报告落 unsupported: 无托管 PR 面＋原因＋前置条件',
        '适配器硬化面已落 engine 一等面（#85② 闭环，D-204③④）——拒绝路径与真跑路径同一管线'
      ]),
      not_in_preview: ['Macro-A']
    },
    human: { status: 'pending', adjudicator: 'user', text: null, decided_at: null }
  };
  const report = buildReport(reportInput);
  const mdName = 'micro-a-' + g.name + '-refusal.md';
  const jsonName = 'micro-a-' + g.name + '-refusal.json';
  if (opts.outDir !== null) {
    writeFileSync(join(opts.outDir, mdName), renderMarkdown(report) + NL, 'utf8');
    writeFileSync(join(opts.outDir, jsonName), renderSidecar(report) + NL, 'utf8');
  }
  return { refusal_for: g.name, overall: report.overall_verdict, receipt: report.receipt.receipt_id, outputs: { md: mdName, sidecar: jsonName } };
}

// ---------- 组装改动档审计命令 ----------
export async function runMicroAAudit(opts: AuditOptions): Promise<AuditResult> {
  const ref = parseGithubRepoRef(opts.input);
  const pilotList = MICRO_A_PILOTS.map(function (p) { return p.owner + '/' + p.repo; });
  if (!ref.ok) {
    throw <MicroAInputError>{ code: 'MICRO-A-INPUT', message: 'Micro-A 输入须为 github 托管仓 ref（owner/repo 或 github URL）——' + ref.reason + '；试点名册=' + pilotList.join(','), pilots: pilotList, requested: opts.input };
  }
  const pilot = MICRO_A_PILOTS.find(function (p) { return p.owner === ref.owner && p.repo === ref.repo; });
  if (!pilot) {
    throw <MicroAInputError>{ code: 'MICRO-A-SCOPE', message: 'Micro-A scope=票面写死试点实例集（D-049③）——非试点仓归 GA Generalization Gate（R-48-*-2 泛化闸，本 preview 不含）；试点名册=' + pilotList.join(','), pilots: pilotList, requested: opts.input };
  }
  const runAt = deterministicRunAt();
  const persistOut = !!opts.outDir;
  const cwd = opts.cwd || process.cwd();
  const outDir = opts.outDir ? resolve(cwd, opts.outDir) : mkdtempSync(join(tmpdir(), 'macro-audit-microa-'));
  mkdirSync(outDir, { recursive: true });
  const MEAS_NAME = 'audit-measurements.json';
  const FACTS_NAME = 'audit-facts.jsonl';
  const shared: MicroAShared = {};   // 实际运行：内部探测环境变量或 token，若缺失则正常降级处理
  const t: MicroATarget = { name: pilot.name, owner: pilot.owner, repo: pilot.repo, root: null, pins: pilot.pins };
  // 执行采集
  const collected = await collectMicroA(t, shared, undefined, runAt);
  const gate = { merged_prs: collected.mergedCount, eligible: collected.mergedCount >= 1 };
  const meas: Record<string, unknown> = {
    repo: pilot.name, owner: pilot.owner, observed_at: runAt, head_sha: collected.headSha,
    strategy: collected.res.strategy, degraded: collected.res.degraded,
    calls: collected.res.calls, prs_listed: collected.res.prs_listed,
    merged_prs: gate.merged_prs, eligible: gate.eligible, stopped_reason: collected.res.stopped_reason,
    fact_count: collected.res.facts.length, per_pr: [] as Record<string, unknown>[],
    pipeline: { source: '48-micro-a-preview.mjs 移植（#85②/D-204③④）', recalibration: '85-check E 组差分对账（golden cassette：引擎面 vs 48 生成器双通道）', fact_emission: 'fact-write.ts 共享核（PR 粒度零 commit grain，节拍批）' }
  };
  const perPr = meas.per_pr as Record<string, unknown>[];
  const prResults: MicroAPrResult[] = [];
  if (gate.eligible) {
    for (const pin of pilot.pins) {
      const r = await buildPrReportMicroA(t, pin, collected, gate, shared, { golden: false, outDir: outDir, measName: MEAS_NAME, factsName: FACTS_NAME });
      prResults.push(r);
      perPr.push({ n: r.pr, form_expected: r.form_expected, form_actual: r.form_actual, form_match: r.form_match, merged: r.merged, overall: r.overall, receipt: r.receipt, diff_channel: r.diff_channel, diff_artifact: r.outputs.diff, diff_bytes: r.artifact.bytes, skeleton_ok: r.skeleton.ok, skeleton_missing: r.skeleton.missing });
    }
  }
  // 未通过资格检查时生成拒绝报告
  let refusalResult: MicroARefusalResult | null = null;
  if (!gate.eligible) {
    refusalResult = await buildRefusalReportMicroA({ name: pilot.name, owner: pilot.owner, repo: pilot.repo, headSha: collected.headSha, root: null, facts: collected.res.facts, ctx: collected.ctx }, shared, { golden: false, outDir: outDir, measName: MEAS_NAME });
  }
  // 事实落盘保存
  const dbPath = join(outDir, 'facts.duckdb');
  if (existsSync(dbPath)) { unlinkSync(dbPath); }
  if (existsSync(dbPath + '.wal')) { unlinkSync(dbPath + '.wal'); }
  const writer = await openWriter(dbPath);
  const writeResult = await writeRunFactsAndEvents(writer, {
    ctx: { repoRef: collected.ctx.repoRef, traceId: collected.ctx.traceId },
    commits: [],
    commitCount: 0,
    fieldEvents: [],
    fieldStats: [],
    facts: collected.res.facts,
    headDate: null,
    anchorQuarantined: false,
    collector: 'macro-audit audit(micro-a)',
    crashSource: 'micro-a.ts'
  });
  await writer.run('FORCE CHECKPOINT');
  closeDuckdb(writer);
  // 写入 JSONL 格式事实与测量指标
  writeFileSync(join(outDir, FACTS_NAME), collected.res.facts.map(function (f) { return JSON.stringify(f); }).join(NL) + NL, 'utf8');
  writeFileSync(join(outDir, MEAS_NAME), JSON.stringify(meas, null, 2) + NL, 'utf8');
  // 读取主报告输出
  const primaryMdName = prResults.length > 0 ? prResults[0].outputs.md : (refusalResult as MicroARefusalResult).outputs.md;
  const primaryJsonName = prResults.length > 0 ? prResults[0].outputs.sidecar : (refusalResult as MicroARefusalResult).outputs.sidecar;
  const primaryMd = readFileSync(join(outDir, primaryMdName), 'utf8');
  const primarySc = readFileSync(join(outDir, primaryJsonName), 'utf8');
  const primarySidecar = JSON.parse(primarySc) as Record<string, unknown>;
  const artifacts: AuditResult['artifacts'] = persistOut ? { report_md: join(outDir, primaryMdName), report_json: join(outDir, primaryJsonName), facts_jsonl: join(outDir, FACTS_NAME), measurements: join(outDir, MEAS_NAME), duckdb: dbPath } : null;
  const resultOutDir = persistOut ? outDir : null;
  if (!persistOut) { rmSync(outDir, { recursive: true, force: true }); }
  void writeResult;
  return {
    report_id: String(primarySidecar.report_id),
    receipt_id: String((primarySidecar.receipt as Record<string, unknown>).receipt_id),
    scale: 'Micro-A',
    stability: 'preview',
    capabilities: ['micro-a'],
    overall_verdict: String(primarySidecar.overall_verdict),
    verdict: primarySidecar.verdict as AuditResult['verdict'],
    intake_quarantine: { quarantined: 0, normalized: 0, affected_commits: 0, escalation: 'none', facts_persisted: true },
    degraded_mode: primarySidecar.degraded === true,
    head_sha: String(primarySidecar.commit_anchor || 'unanchored'),
    tree_sha: String(primarySidecar.tree_anchor || 'unanchored'),
    commit_count: 0,
    adr_count: 0,
    fact_count: collected.res.facts.length,
    repo_name: pilot.name,
    resolved_root: pilot.owner + '/' + pilot.repo + ' (remote)',
    intake_kind: 'github-ref',
    snapshot_fetched_at: null,
    cache_hit: false,
    refreshed: false,
    codelore: { resolved: false, pinned: false, version: null },
    out_dir: resultOutDir,
    artifacts: artifacts,
    report_markdown: primaryMd,
    sidecar_json: primarySc,
    measurements: meas
  };
}
