// audit/audit.ts — `macro-audit audit` 一等命令装配层（#53 / D-060）
// 签名：macro-audit audit <path|owner/repo|url> [--scale <S>] [--out <dir>] [--json] [--refresh]
// 链 = repoAdd 输入裁决（ADR-0009 三段式复用：本地路径/owner-repo 本地优先/URL opt-in 隔离 clone）
//   → 共享管线 audit/macro-b.ts（probe→collectors＋codelore 面→facts→骨架渲染前置件，与 demo 同消费）
//   → facts（audit-facts.jsonl＋facts.duckdb，同一 appendFact 追加路径）
//   → 报告（buildReport + preview_disclosure「capability 1 of 5 · preview」＋报告头 stability/capabilities）
// 纪律：被测仓只读；不自动 pull（--refresh 显式 opt-in 才 fetch）；--scale 未实装层诚实拒绝 exit 2；
//   叙事职责不外携（kernel 面止于 facts+骨架，叙事=宿主 agent 经 MCP 读 facts，D-053）。

import { mkdirSync, writeFileSync, existsSync, unlinkSync, readFileSync, mkdtempSync, rmSync } from 'node:fs';
import { basename, join, resolve } from 'node:path';
import { tmpdir } from 'node:os';
import { repoAdd } from '../intake/intake.js';
import type { RepoAddResult } from '../intake/intake.js';
import { probeMacroBRepo, collectMacroB, evaluateMacroB, macroBContext, tcBand, MACRO_B_STOPWORDS, TC1_LAG_DAYS, TC1_RATIO_RED, TC1_MIN_N, TC2_MEAN_RED, TC2_FIELD_MISSING_RED, TC3_RED, TC3_GREEN, TC3_TOPN } from './macro-b.js';
import { buildReport, renderMarkdown, renderSidecar, deriveOverallBand, ADJUDICATION_PROTOCOL_VERSION, REPORT_SKELETON_VERSION, UNVERIFIED_MARK, firstFactIds } from '../report/generate.js';
import type { PreviewDisclosure, ReportInput, EvidenceItem, ClaimAnchor, QuadrantEntry, Recommendation, AdjudicationEntry, IntakeHealth } from '../report/generate.js';
import { openWriter, appendFact, appendQuarantineEvent, runInTransaction, queryQuarantineCounts, closeDuckdb } from '../fact/store.js';
import { strictQuarantineViolations, intakeIdentityIssues, protocolCrashError, isProtocolCrash, intakeEscalation, QUARANTINE_FIELD_RATIO_RED } from '../intake/quarantine.js';
import { projectUpstreamDimensions } from './upstream-dimension-map.js';

const NL = String.fromCharCode(10);

// 已实现规模面（D-060③：--scale 缺省 Macro-B；其余层未实装 → 诚实拒绝 exit 2）
export const AUDIT_SCALES_IMPLEMENTED: readonly string[] = ['Macro-B'];
const SCALE_LAYER_ORDER = 'Macro-C→Micro-A→Micro-B→Macro-A（ADR-0017③ 层序，Macro-B 已上架 preview）';
const SCALE_CANON: Record<string, string> = { 'microa': 'Micro-A', 'microb': 'Micro-B', 'macroa': 'Macro-A', 'macrob': 'Macro-B', 'macroc': 'Macro-C' };

export interface AuditScaleError { code: 'SCALE-NOT-IMPLEMENTED'; message: string; implemented: readonly string[]; requested: string; layer_order: string }
export function isAuditScaleError(e: unknown): e is AuditScaleError {
  return !!e && typeof e === 'object' && (e as { code?: string }).code === 'SCALE-NOT-IMPLEMENTED';
}
export function normalizeAuditScale(raw: string | undefined): string {
  if (raw === undefined) { return 'Macro-B'; }
  const canon = SCALE_CANON[raw.toLowerCase().split('-').join('')];
  const req = canon || raw;
  if (AUDIT_SCALES_IMPLEMENTED.indexOf(req) < 0) {
    throw <AuditScaleError>{
      code: 'SCALE-NOT-IMPLEMENTED',
      message: '--scale ' + req + ' 未实装——audit 现仅上架 Macro-B（' + SCALE_LAYER_ORDER + '；本命令不假装能跑未实装层）',
      implemented: AUDIT_SCALES_IMPLEMENTED,
      requested: req,
      layer_order: SCALE_LAYER_ORDER
    };
  }
  return req;
}

// owner/repo、url、本地路径 → 报告用仓名（provenance 署名面）
export function auditRepoName(input: string, resolvedRoot: string): string {
  const t = input.trim();
  if (/^(https?|ssh|git|file):\/\//.test(t) || t.indexOf('git@') === 0) {
    const seg = t.replace(/\/+$/, '').split('/').pop() || 'repo';
    return seg.replace(/\.git$/i, '') || 'repo';
  }
  if (/^[A-Za-z0-9_.-]+\/[A-Za-z0-9_.-]+$/.test(t)) { return t.split('/').pop() || t; }
  return basename(resolve(resolvedRoot)) || 'repo';
}

export interface AuditOptions {
  input: string;
  scale?: string;
  outDir?: string;       // 缺省=不落盘，报告 md 走 stdout
  json?: boolean;        // 报告面走 sidecar JSON
  refresh?: boolean;     // 透传 repoAdd refresh opt-in（#55/D-059⑦）
  strictQuarantine?: boolean;  // D-110 strict 门禁：quarantined 行 reason_code 越仓级基线→硬崩（flag 只传开关，基线=版本化常量）
  cwd?: string;
}

export interface AuditResult {
  report_id: string;
  receipt_id: string;
  scale: string;
  stability: 'preview' | 'ga' | null;
  capabilities: string[];
  overall_verdict: string;
  verdict: { band: string; reason_class: string };
  intake_quarantine: { quarantined: number; normalized: number; affected_commits: number; escalation: string; facts_persisted: boolean };
  degraded_mode: boolean;
  head_sha: string;
  tree_sha: string;
  commit_count: number;
  adr_count: number;
  fact_count: number;
  repo_name: string;
  resolved_root: string;
  intake_kind: string;
  snapshot_fetched_at: string | null;
  cache_hit: boolean;
  refreshed: boolean;
  codelore: { resolved: boolean; pinned: boolean; version: string | null };
  out_dir: string | null;
  artifacts: { report_md: string; report_json: string; facts_jsonl: string; measurements: string; duckdb: string } | null;
  report_markdown: string;
  sidecar_json: string;
  measurements: Record<string, unknown>;
}

const AUDIT_INTENT_CANDIDATES: readonly string[] = ['CONTEXT.md', 'README.md', 'AGENTS.md'];
// NC-1 负对照候选集=39 同款宽面（跨生态非 ADR 文件，五件套预期 0 命中）
const AUDIT_NC1_CANDIDATES: readonly string[] = ['package.json', 'README.md', 'README.adoc', 'README.rst', 'README', 'Cargo.toml', 'pom.xml', 'build.gradle', 'LICENSE', 'LICENSE.txt', 'pyproject.toml', 'go.mod', 'Makefile'];

function pickExcerpt(absOrRelPath: string, tokens: readonly string[] | null, base: string | null): { line: number; text: string } {
  const text = readFileSync(base ? join(base, absOrRelPath) : absOrRelPath, 'utf8');
  const lines = text.split(NL);
  if (tokens === null) { return { line: 1, text: lines[0].trim() }; }
  for (let i = 0; i < lines.length; i++) {
    let all = true;
    for (const tk of tokens) { if (lines[i].indexOf(tk) < 0) { all = false; } }
    if (all) { return { line: i + 1, text: lines[i].trim() }; }
  }
  throw new Error('EXCERPT-MISS: ' + absOrRelPath + ' tokens=' + String(tokens));
}

export async function runAudit(opts: AuditOptions): Promise<AuditResult> {
  const scale = normalizeAuditScale(opts.scale);
  const cwd = opts.cwd || process.cwd();

  // ---------- §1 intake（ADR-0009 三段式复用；不自动 pull，refresh 显式 opt-in） ----------
  const intake: RepoAddResult = repoAdd(opts.input, { cwd: cwd, refresh: opts.refresh === true });
  const repoRoot = intake.resolved_root;
  const NAME = auditRepoName(opts.input, repoRoot);

  // ---------- §2 共享管线链（audit/macro-b.ts；与 demo 同消费） ----------
  const probes = probeMacroBRepo(repoRoot, intake.head_sha);
  const ctx = macroBContext('audit-' + NAME, NAME, probes.headSha, probes.headDate, probes.headRaw);
  // 锚字段病态→观测时点不可用：decided_at/generated_at 用显式哨兵标记（不落伪时间戳）
  const HEAD_AT = probes.headDate === null ? 'quarantined(anchor_head_date_malformed)' : probes.headDate;
  const anchorQuarantined = probes.headDate === null;
  const excludedCommits = probes.commits.filter(function (c) { return c.date === null; }).length;

  // strict quarantine 门禁（D-110）：写入副作用前先求值——quarantined 行 reason_code 越基线→硬崩
  if (opts.strictQuarantine === true) {
    const violations = strictQuarantineViolations(probes.fieldEvents);
    if (violations.length > 0) {
      const firstEv = probes.fieldEvents.filter(function (e) { return e.disposition === 'quarantined'; })[0];
      throw protocolCrashError('STRICT-QUARANTINE-VIOLATION', 'reason_code 越仓级基线（strict 模式 fail-closed）：' + violations.join(','), {
        raw: firstEv ? firstEv.raw : null,
        crash_location: 'audit.ts:strict-quarantine-gate',
        run_context: { repo_ref: ctx.repoRef, run_id: ctx.traceId, commit_sha: firstEv ? firstEv.commit_sha : null },
        counts: { commits_seen: probes.commitCount, facts_written: 0, quarantined_written: 0 }
      });
    }
  }
  const col = collectMacroB(repoRoot, {
    intentCandidates: AUDIT_INTENT_CANDIDATES, nc1Candidates: AUDIT_NC1_CANDIDATES,
    stopwords: MACRO_B_STOPWORDS, topN: TC3_TOPN,
    codelore: 'auto',   // audit=实跑面：binary 缺席/不 pin → resolution 事实留痕＋behavior 象限如实 not_applicable
    fixtureTag: 'AUDIT', pc2Sha: 'pc2fixture000000000000000000000000000053audit'
  }, ctx, probes);
  const ev = evaluateMacroB(col);

  // ---------- §3 行为面判据（codelore 实跑成功时；51 同款 PC/TC/NC 形） ----------
  const facetFacts = col.codeloreFacts.filter(function (f) { return f.metric === 'codelore.facet_rows'; });
  const facetErrs = col.codeloreFacts.filter(function (f) { return /facet_(parse_)?error/.test(f.metric); });
  const byFace: Record<string, { rows: Record<string, unknown>[]; fact_id: string }> = {};
  for (const f of facetFacts) { const v = JSON.parse(f.value_json); byFace[v.analysis] = { rows: v.rows, fact_id: f.fact_id }; }
  const hRows = byFace.hotspots ? byFace.hotspots.rows : [];
  const cRows = byFace.coupling ? byFace.coupling.rows : [];
  const fhRows = byFace['function-hotspots'] ? byFace['function-hotspots'].rows : [];
  const bhvRan = col.codeloreResolution !== null && col.codeloreResolution.pinned === true;
  const BHV_MIN_REVS = 5;
  const bhvPc1 = bhvRan && facetFacts.length === 3 && facetFacts.every(function (f) { return JSON.parse(f.value_json).row_count > 0; }) && facetErrs.length === 0;
  const bhvTc1 = bhvRan && hRows.length > 0 && hRows.every(function (r) { return typeof r.revisions === 'number' && (r.revisions as number) >= BHV_MIN_REVS; });
  const bhvTc2 = bhvRan && cRows.length > 0 && (cRows.filter(function (r) { return (r.shared as number) >= 2 && (r.degree as number) > 0; }).length / cRows.length) >= 0.5;
  const BHV_DEFERRED = ['function-coupling(--target)'];
  const bhvNc1 = BHV_DEFERRED.length > 0;
  const behaviorBand = bhvRan ? ((bhvPc1 && bhvTc1 && bhvTc2 && bhvNc1) ? 'supported' : 'insufficient') : 'insufficient';

  // ---------- §4 实测数落盘（省略 --out 时落运行目录：证据锚可读；跑完即弃不污染 cwd） ----------
  const persistOut = !!opts.outDir;
  const outDir = opts.outDir ? resolve(cwd, opts.outDir) : mkdtempSync(join(tmpdir(), 'macro-audit-run-'));
  mkdirSync(outDir, { recursive: true });
  const MEAS_NAME = 'audit-measurements.json';
  const FACTS_NAME = 'audit-facts.jsonl';
  const measurements = {
    repo: NAME, root: repoRoot, observed_at: HEAD_AT, head_sha: probes.headSha, tree_sha: probes.treeSha, commit_count: probes.commitCount,
    adr_count: ev.tc2.total, intent_docs: col.intentDocs.map(function (d) { return d.path; }), fact_count: col.realFacts.length,
    intake: { kind: intake.kind, url: intake.url, cloned: intake.cloned, cache_hit: intake.cache_hit, refreshed: intake.refreshed, snapshot_fetched_at: intake.snapshot_fetched_at, full_depth_verified: intake.full_depth_verified, remote_config_execution: intake.remote_config_execution, credentials: intake.credentials },
    intake_quarantine: {
      wired_fields: ['committer_date', 'head_date'],
      field_stats: probes.fieldStats,
      events: probes.fieldEvents.map(function (e) { return { commit_sha: e.commit_sha, field_name: e.field_name, disposition: e.disposition, reason_code: e.reason_code, raw_echo: JSON.stringify(e.raw.length > 80 ? e.raw.slice(0, 80) + '…' : e.raw) }; }),
      excluded_commits: excludedCommits,
      threshold_ratio: QUARANTINE_FIELD_RATIO_RED,
      strict_mode: opts.strictQuarantine === true
    },
    tc1: { judgeable_n: ev.tc1.judgeable_n, backfill_n: ev.tc1.backfill_n, ratio_4: ev.tc1.ratio.toFixed(4), verdict: ev.tc1.verdict, threshold: { lag_days: TC1_LAG_DAYS, ratio_red: TC1_RATIO_RED, min_n: TC1_MIN_N } },
    tc2: { total: ev.tc2.total, mean_ratio_4: ev.tc2.mean_ratio.toFixed(4), missing_counts: ev.tc2.missing_counts, missing_ratio_4: Object.fromEntries(Object.keys(ev.tc2.missing_ratio).map(function (k) { return [k, Number(ev.tc2.missing_ratio[k].toFixed(4))]; })), cond_a: ev.tc2.cond_a, cond_b: ev.tc2.cond_b, verdict: ev.tc2.verdict, threshold: { mean_red: TC2_MEAN_RED, field_missing_red: TC2_FIELD_MISSING_RED } },
    tc3: { per_source: ev.tc3.per_source.map(function (c) { return { path: c.subject, hit: c.value.hit, keywords: c.value.keywords, ratio_4: c.value.ratio.toFixed(4) }; }), lowest_path: ev.tc3.lowest_path, lowest_ratio_4: ev.tc3.lowest_ratio.toFixed(4), verdict: ev.tc3.verdict, threshold: { red: TC3_RED, green: TC3_GREEN, top_n: TC3_TOPN } },
    nc1: col.nc1, pc1: col.pc1, pc2: col.pc2,
    upstream_dimension_projection: projectUpstreamDimensions(col.realFacts),
    behavior: bhvRan ? { faces: facetFacts.map(function (f) { return JSON.parse(f.value_json).analysis; }), row_counts: { hotspots: hRows.length, coupling: cRows.length, function_hotspots: fhRows.length }, facet_errors: facetErrs.length, criteria: { pc1: bhvPc1, tc1: bhvTc1, tc2: bhvTc2, nc1: bhvNc1 }, verdict: behaviorBand, codelore_version: col.codeloreResolution ? col.codeloreResolution.version : null } : { ran: false, reason: col.codeloreResolution ? 'codelore binary 未解析/不 pin（pinned=false）——行为面缺席如实登记' : 'codelore=off', deferred_faces: BHV_DEFERRED }
  };
  if (outDir) { writeFileSync(join(outDir, MEAS_NAME), JSON.stringify(measurements, null, 2) + NL, 'utf8'); }

  // ---------- §5 证据 + 结论→引文锚（源=工件相对名，锚可机检） ----------
  const evidence: EvidenceItem[] = [];
  const R = NAME.toUpperCase().split('-').join('').split('/').join('');
  const RUN_CMD = 'macro-audit audit ' + opts.input + (opts.outDir ? ' --out ' + opts.outDir : '');
  function addEvidence(id: string, source: string, tokens: readonly string[] | null, claim: string, base: string | null) {
    const ex = pickExcerpt(source, tokens, base);
    evidence.push({ evidence_id: id, source: source, locator: 'L' + ex.line, claim: claim, grounded: true, collected_at: HEAD_AT, reproduce_cmd: RUN_CMD, reproduce_absent_reason: null, required_tokens: [], excerpt: ex.text });
  }
  const measBase = outDir;   // 运行目录（outDir 或 scratch）——工件相对名锚均可读
  addEvidence('EV-AUDIT-' + R + '-01', MEAS_NAME, ['"fact_count"'], '本次实测：' + NAME + ' Macro-B audit 采集事实数', measBase);
  addEvidence('EV-AUDIT-' + R + '-02', MEAS_NAME, ['"verdict"'], '本次实测：' + NAME + ' TC-1 ADR 事后补写判据裁定（' + ev.tc1.verdict + '）', measBase);
  addEvidence('EV-AUDIT-' + R + '-03', MEAS_NAME, ['"mean_ratio_4"'], '本次实测：' + NAME + ' TC-2 五件套完整度 mean_ratio', measBase);
  addEvidence('EV-AUDIT-' + R + '-04', MEAS_NAME, ['"lowest_ratio_4"'], '本次实测：' + NAME + ' TC-3 定位覆盖率最低值', measBase);
  addEvidence('EV-AUDIT-' + R + '-05', MEAS_NAME, ['"five_piece_present"'], '本次实测：' + NAME + ' NC-1 负对照选材五件套命中数（预期 0）', measBase);
  if (col.adrFiles.length > 0) {
    addEvidence('EV-AUDIT-' + R + '-06', 'docs/adr/' + col.adrFiles[0], null, NAME + ' ADR 语料锚：docs/adr/' + col.adrFiles[0] + ' 实物存在（语料 ' + col.adrFiles.length + ' 份）', repoRoot);
  }
  addEvidence('EV-AUDIT-' + R + '-07', MEAS_NAME, ['"snapshot_fetched_at"'], '快照时点披露：' + NAME + ' intake snapshot_fetched_at=' + String(intake.snapshot_fetched_at) + '（cache_hit=' + intake.cache_hit + ' refreshed=' + intake.refreshed + '；不自动 pull，--refresh 显式 opt-in）', measBase);

  const claims: ClaimAnchor[] = [
    { claim_id: 'CL-AUDIT-' + R + '-01', evidence_id: 'EV-AUDIT-' + R + '-01', required_tokens: ['fact_count'] },
    { claim_id: 'CL-AUDIT-' + R + '-02', evidence_id: 'EV-AUDIT-' + R + '-02', required_tokens: ['verdict'] },
    { claim_id: 'CL-AUDIT-' + R + '-03', evidence_id: 'EV-AUDIT-' + R + '-03', required_tokens: ['mean_ratio_4'] },
    { claim_id: 'CL-AUDIT-' + R + '-04', evidence_id: 'EV-AUDIT-' + R + '-04', required_tokens: ['lowest_ratio_4'] },
    { claim_id: 'CL-AUDIT-' + R + '-05', evidence_id: 'EV-AUDIT-' + R + '-05', required_tokens: ['five_piece_present'] },
    { claim_id: 'CL-AUDIT-' + R + '-06', evidence_id: 'EV-AUDIT-' + R + '-07', required_tokens: ['snapshot_fetched_at'] }
  ];

  // ---------- §6 裁决条目（39 同族 6 判据＋51 同族行为 4 判据） ----------
  const GATE_REF = {
    prereg_commit: '7395495',
    criteria_path: 'reports/22-criteria-pre-registration.md',
    basis_path: 'reports/22-c-adjudication-basis.md',
    criterion_ids: bhvRan ? ['PC-1', 'PC-2', 'TC-1', 'TC-2', 'TC-3', 'NC-1', 'BHV-PC-1', 'BHV-TC-1', 'BHV-TC-2', 'BHV-NC-1'] : ['PC-1', 'PC-2', 'TC-1', 'TC-2', 'TC-3', 'NC-1']
  };
  const adjudicationEntries: AdjudicationEntry[] = [
    { criterion_id: 'PC-1', band: col.pc1.pass ? 'supported' : 'insufficient', basis_refs: ['B1'], anchored_fact_ids: firstFactIds(col.pc1AdrFacts).concat(firstFactIds(col.pc1PosFacts)), anchored_evidence_ids: ['EV-AUDIT-' + R + '-01'], decided_at: HEAD_AT, rationale: col.pc1.pass ? 'adr-structure 与 positioning 两族均产出非空事实，golden ADR 五件套 5/5 且 supersede 链命中（' + NAME + ' run 内管线活性正对照）' : '正对照未中，管线故障 P0' },
    { criterion_id: 'PC-2', band: col.pc2.pass ? 'supported' : 'insufficient', basis_refs: ['B1'], anchored_fact_ids: firstFactIds(col.pc2Lag), anchored_evidence_ids: ['EV-AUDIT-' + R + '-01'], decided_at: HEAD_AT, rationale: col.pc2.pass ? 'gitlog 族检出事后补写 delta_days = ' + String(col.pc2.delta_days) : '正对照未中，管线故障 P0' },
    { criterion_id: 'TC-1', band: tcBand(ev.tc1.verdict), basis_refs: ['B2'], anchored_fact_ids: ev.lagFactIds, anchored_evidence_ids: ['EV-AUDIT-' + R + '-02'], decided_at: HEAD_AT, rationale: NAME + ' ADR 事后补写：可判定数 ' + ev.tc1.judgeable_n + '（门槛 ' + TC1_MIN_N + '），>90d 占比 ' + measurements.tc1.ratio_4 + '，判 ' + ev.tc1.verdict + '（派生统计 over ' + String(probes.commitCount - excludedCommits) + ' commits；quarantined 日期 commit 排除 ' + excludedCommits + '）' },
    { criterion_id: 'TC-2', band: tcBand(ev.tc2.verdict), basis_refs: ['B2'], anchored_fact_ids: ev.fiveFactIds, anchored_evidence_ids: ['EV-AUDIT-' + R + '-03'], decided_at: HEAD_AT, rationale: NAME + ' ADR 五件套：mean_ratio ' + measurements.tc2.mean_ratio_4 + '（门槛 ' + TC2_MEAN_RED + '），字段缺失率超线=' + ev.tc2.cond_b + '，判 ' + ev.tc2.verdict },
    { criterion_id: 'TC-3', band: tcBand(ev.tc3.verdict), basis_refs: ['B2'], anchored_fact_ids: ev.covFacts.map(function (c) { return c.fact_id; }), anchored_evidence_ids: ['EV-AUDIT-' + R + '-04'], decided_at: HEAD_AT, rationale: NAME + ' 定位覆盖：意图面 ' + col.intentDocs.length + ' 件最低 ratio ' + measurements.tc3.lowest_ratio_4 + '（' + String(ev.tc3.lowest_path) + '），判 ' + ev.tc3.verdict },
    { criterion_id: 'NC-1', band: col.nc1.pass ? 'supported' : 'insufficient', basis_refs: ['B4'], anchored_fact_ids: firstFactIds(col.nc1Facts), anchored_evidence_ids: ['EV-AUDIT-' + R + '-05'], decided_at: HEAD_AT, rationale: col.nc1.pass ? '负对照选材 ' + NAME + '/' + col.nc1.path + ' 五件套 0 命中、supersede 0 命中（特异性成立）' : '负对照命中，转复核路径' }
  ];
  if (bhvRan) {
    adjudicationEntries.push(
      { criterion_id: 'BHV-PC-1', band: bhvPc1 ? 'supported' : 'insufficient', basis_refs: ['B1'], anchored_fact_ids: facetFacts.map(function (f) { return f.fact_id; }), anchored_evidence_ids: ['EV-AUDIT-' + R + '-01'], decided_at: HEAD_AT, rationale: '行为三面 facet_rows 齐备性（hotspots/coupling/function-hotspots 各 row_count>0，errFacts=' + facetErrs.length + '）' },
      { criterion_id: 'BHV-TC-1', band: bhvTc1 ? 'supported' : 'insufficient', basis_refs: ['B1'], anchored_fact_ids: byFace.hotspots ? [byFace.hotspots.fact_id] : [], anchored_evidence_ids: ['EV-AUDIT-' + R + '-01'], decided_at: HEAD_AT, rationale: '低样本判据：hotspots min(revisions)>=' + BHV_MIN_REVS + '（实测 min=' + (hRows.length ? Math.min.apply(null, hRows.map(function (r) { return r.revisions as number; })) : 'n/a') + '）' },
      { criterion_id: 'BHV-TC-2', band: bhvTc2 ? 'supported' : 'insufficient', basis_refs: ['B1'], anchored_fact_ids: byFace.coupling ? [byFace.coupling.fact_id] : [], anchored_evidence_ids: ['EV-AUDIT-' + R + '-01'], decided_at: HEAD_AT, rationale: 'coupling shared>=2&degree>0 占比=' + (cRows.length ? (cRows.filter(function (r) { return (r.shared as number) >= 2 && (r.degree as number) > 0; }).length / cRows.length).toFixed(3) : 'n/a') + '（阈值 0.5）' },
      { criterion_id: 'BHV-NC-1', band: bhvNc1 ? 'supported' : 'insufficient', basis_refs: ['B1'], anchored_fact_ids: [], anchored_evidence_ids: [], decided_at: HEAD_AT, rationale: 'function-coupling（--target 参数面）暂缓如实登记——deferred_faces 写入切片字段' }
    );
  }
  const strategyBand = deriveOverallBand(adjudicationEntries);

  // ---------- §7 四象限（strategy 原生；behavior=codelore 实跑决定 native/not_applicable；余两象限如实披露） ----------
  const GATE = { protocol_version: ADJUDICATION_PROTOCOL_VERSION, audit_ref: 'engine/src/audit/audit.ts' };
  const hotTop = hRows.slice(0, 3).map(function (r) { return String(r.path) + '(revs=' + String(r.revisions) + ',score=' + Number(r.hotspot_score).toFixed(2) + ')'; });
  const quadrants: QuadrantEntry[] = [
    { quadrant: 'strategy', applicability: 'native', verdict: strategyBand, score: null, confidence: 0.6, dimensions: ['S1', 'S2'], slice_fields: { s1_keyword_coverage_ratio: Number(measurements.tc3.lowest_ratio_4), s2_five_piece_mean_ratio: Number(measurements.tc2.mean_ratio_4), adr_count: ev.tc2.total, lag_judgeable_n: ev.tc1.judgeable_n, intent_docs: col.intentDocs.length }, verdict_gate: { protocol_version: GATE.protocol_version, decision: strategyBand, evidence_flag: ev.tc2.verdict === 'RED', decided_at: HEAD_AT, override_reason: null, audit_ref: GATE.audit_ref }, conflict_markers: [] },
    { quadrant: 'behavior', applicability: bhvRan ? 'native' : 'not_applicable', verdict: behaviorBand, score: null, confidence: bhvRan ? 0.6 : 0, dimensions: [], slice_fields: bhvRan ? { faces: ['hotspots', 'coupling', 'function-hotspots'], face_row_counts: { hotspots: hRows.length, coupling: cRows.length, function_hotspots: fhRows.length }, hotspot_top: hotTop, coupling_pairs: cRows.length, min_revs: BHV_MIN_REVS, sample_met: bhvTc1, deferred_faces: BHV_DEFERRED, quadrant_assignment: 'slice-decision（facts 共享 quadrant=strategic/codelore 族 provenance 不改写；象限归属=报告切片决策 D-054③）' } : {}, verdict_gate: { protocol_version: GATE.protocol_version, decision: behaviorBand, evidence_flag: bhvPc1, decided_at: HEAD_AT, override_reason: bhvRan ? null : 'codelore binary 未解析/不 pin——行为面采集缺席（resolution 事实留痕，D-054③ 降级非静默）', audit_ref: GATE.audit_ref }, conflict_markers: bhvRan ? [] : ['data-not-connected'] },
    { quadrant: 'structure', applicability: 'not_applicable', verdict: 'insufficient', score: null, confidence: 0, dimensions: [], slice_fields: {}, verdict_gate: { protocol_version: GATE.protocol_version, decision: 'insufficient', evidence_flag: false, decided_at: HEAD_AT, override_reason: 'queued：与 S3 族双口径风险暂缓（D-054）——structure 无采集器', audit_ref: GATE.audit_ref }, conflict_markers: ['out-of-scope-stage1'] },
    { quadrant: 'supply_chain', applicability: 'not_applicable', verdict: 'insufficient', score: null, confidence: 0, dimensions: [], slice_fields: {}, verdict_gate: { protocol_version: GATE.protocol_version, decision: 'insufficient', evidence_flag: false, decided_at: HEAD_AT, override_reason: '⚠ 数据未接——Scorecard/repomix 按层需求队列接入不插队（D-034③）', audit_ref: GATE.audit_ref }, conflict_markers: ['data-not-connected'] }
  ];

  const recommendations: Recommendation[] = [
    { rec_id: 'R-AUDIT-' + R + '-1', priority: 'P2', action: '将本 run facts.duckdb 经 mcp.json MACRO_AUDIT_FACTS_DB 注册给宿主 agent——叙事段由宿主经 MCP facts 只读面生成（D-053 双轨）', rationale: 'audit 命令=kernel 面一等公民入口；叙事职责不外携，宿主 agent 经 facts 投影消费', expected_impact: '事实层→叙事层通道闭环', effort: 'S', verdict_gate_stamp: ADJUDICATION_PROTOCOL_VERSION + ' / ' + strategyBand, evidence_refs: ['EV-AUDIT-' + R + '-07'], degraded_note: null },
    { rec_id: 'R-AUDIT-' + R + '-2', priority: 'P2', action: intake.cache_hit && !intake.refreshed ? 'intake 缓存命中未刷新：远端新提交不可见——如需最新快照用 --refresh 显式 opt-in（不自动 pull 保隔离）' : '快照为本次 fetch/本地观测时点', rationale: '快照时点披露已落（snapshot_fetched_at）；缓存命中与刷新区分如实', expected_impact: 'staleness 风险如实披露', effort: 'S', verdict_gate_stamp: ADJUDICATION_PROTOCOL_VERSION + ' / ' + strategyBand, evidence_refs: ['EV-AUDIT-' + R + '-07'], degraded_note: null }
  ];

  const HEADLINE = NAME + ' Macro-B audit（capability 1 of 5 · preview）：' + probes.commitCount + ' commits / ADR ' + ev.tc2.total + ' 份 / facts ' + col.realFacts.length + '——TC-1 ' + ev.tc1.verdict + '（n=' + ev.tc1.judgeable_n + '）、TC-2 ' + ev.tc2.verdict + '（mean=' + measurements.tc2.mean_ratio_4 + '）、TC-3 ' + ev.tc3.verdict + '（' + measurements.tc3.lowest_ratio_4 + '）' + (bhvRan ? '＋behavior ' + behaviorBand : '（behavior 象限 codelore 缺席如实 not_applicable）') + (intakeEscalation(probes.fieldStats) !== 'none' ? '＋quarantine 病态升级=' + intakeEscalation(probes.fieldStats) : '') + '→ 综合裁定 ' + strategyBand + '（三档如实落数' + (anchorQuarantined ? '；锚病态→facts.duckdb 仅 quarantine_log 行、fact 行不落库' : '') + '）。';

  const limitations: string[] = [
    'one-shot 快照审计：本报告裁定=对 snapshot_fetched_at=' + String(intake.snapshot_fetched_at) + ' 时点快照的实测——' + (intake.cache_hit && !intake.refreshed ? 'intake 缓存命中未刷新，远端新提交不可见（--refresh 显式 opt-in 可刷新；不自动 pull 保隔离纪律）' : '快照时点如实披露'),
    '采集面=strategy（S1+S2）' + (bhvRan ? '＋behavior（codelore 行为三面）' : '；behavior 象限 codelore 未解析如实 not_applicable'),
    'structure/supply_chain 象限 not_applicable（supply-chain: ' + UNVERIFIED_MARK + '——Scorecard 未接入，D-034③）',
    '反复接受非跑通（D-033）：TC 三档裁定 supported/unsupported/insufficient 如实落数，one-shot 校准+冒烟不构成泛化证据'
  ];
  if (anchorQuarantined) {
    limitations.push('锚字段病态：HEAD %cI quarantined（anchor_head_date_malformed）→ audit_fact 行不落库（observed_at NOT NULL 不落伪值）；quarantine_log 留痕 recorded_at=NULL，整仓 unsupported');
  }
  const disclosure: PreviewDisclosure = {
    capability_label: 'capability 1 of 5 · preview',
    calibration_scope: NAME + ' Macro-B audit（audit 一等命令面；scale=Macro-B 已上架）',
    structural_limitations: limitations,
    not_in_preview: ['Micro-A', 'Micro-B', 'Macro-C', 'Macro-A']
  };

  const quarantinedRows = probes.fieldEvents.filter(function (e) { return e.disposition === 'quarantined'; });
  const intakeHealth: IntakeHealth = {
    fields: probes.fieldStats.map(function (s) { return { field_name: s.field_name, total: s.total, clean: s.clean, normalized: s.normalized, quarantined: s.quarantined }; }),
    affected_commits: new Set(quarantinedRows.map(function (e) { return e.commit_sha; })).size,
    excluded_commits: excludedCommits,
    quarantined_rows: quarantinedRows.map(function (e) { return { commit_sha: e.commit_sha, field_name: e.field_name, reason_code: e.reason_code, raw_echo: JSON.stringify(e.raw.length > 80 ? e.raw.slice(0, 80) + '…' : e.raw) }; }),
    threshold_ratio: QUARANTINE_FIELD_RATIO_RED,
    escalation: intakeEscalation(probes.fieldStats)
  };
  const reportInput: ReportInput = {
    report_id: 'MA-AUDIT-' + R + '-MACRO-B',
    stability: 'preview',
    capabilities: ['macro-b'],
    scale: scale,
    subject_ref: NAME + '@' + probes.headSha.slice(0, 12),
    generated_at: HEAD_AT,
    trace_id: ctx.traceId,
    baggage_id: ctx.traceId,
    headline: HEADLINE,
    confidence: 0.6,
    stale: { marker: 'fresh', sla_seconds: 86400, lag_seconds: 0, read_model_version: REPORT_SKELETON_VERSION, fact_watermark_version: '1' },
    fact_ids: col.realFacts.map(function (f) { return f.fact_id; }),
    top_findings: ['EV-AUDIT-' + R + '-01', 'EV-AUDIT-' + R + '-03', 'EV-AUDIT-' + R + '-04'],
    evidence: evidence,
    claims: claims,
    quadrants: quadrants,
    recommendations: recommendations,
    adjudication_entries: adjudicationEntries,
    decided_at: HEAD_AT,
    commit_anchor: probes.headSha,
    tree_anchor: probes.treeSha,
    gate_ref: GATE_REF,
    degraded: false,
    degraded_reason: null,
    preview_disclosure: disclosure,
    intake_health: intakeHealth,
    human: { status: 'pending', adjudicator: 'user', text: null, decided_at: null }
  };
  // ---------- §8 事实库先行写入（D-115 逐 commit 事务＋自然键幂等）＋恒等式报告前断言（D-116①） ----------
  // 锚病态（headDate quarantined）→ audit_fact.observed_at NOT NULL 无合法值→fact 行不落库（不落伪值）；
  // quarantine_log 行仍写（recorded_at=NULL 合法，NULL 仅锚病态路径）。
  const dbPath = join(outDir, 'facts.duckdb');
  if (existsSync(dbPath)) { unlinkSync(dbPath); }
  if (existsSync(dbPath + '.wal')) { unlinkSync(dbPath + '.wal'); }
  const writer = await openWriter(dbPath);
  const seen = new Set<string>();
  let factsWritten = 0;
  let eventsWritten = 0;
  try {
    await runInTransaction(writer, async function () {
      if (!anchorQuarantined) {
        for (const f of col.realFacts) { if (!seen.has(f.fact_id)) { seen.add(f.fact_id); await appendFact(writer, f); factsWritten += 1; } }
      }
      for (const fe of probes.fieldEvents) {
        await appendQuarantineEvent(writer, { run_id: ctx.traceId, commit_sha: fe.commit_sha, field_name: fe.field_name, disposition: fe.disposition, reason_code: fe.reason_code, raw: fe.raw, collector: 'macro-audit audit', recorded_at: probes.headDate });
        eventsWritten += 1;
      }
    });
  } catch (e) {
    try { closeDuckdb(writer); } catch (_) { /* 次生关闭错不盖主错 */ }
    if (isProtocolCrash(e)) { throw e; }
    throw protocolCrashError('QUARANTINE-CONSTRAINT', 'fact/quarantine 事务写失败（ROLLBACK 无半截写）：' + String((e as Error).message || e), { crash_location: 'audit.ts:fact-write-tx', run_context: { repo_ref: ctx.repoRef, run_id: ctx.traceId }, counts: { commits_seen: probes.commitCount, facts_written: factsWritten, quarantined_written: eventsWritten } });
  }
  const dbCounts = await queryQuarantineCounts(writer, ctx.traceId);
  const identityIssues = intakeIdentityIssues(probes.fieldStats, dbCounts);
  await writer.run('FORCE CHECKPOINT');
  closeDuckdb(writer);
  if (identityIssues.length > 0) {
    throw protocolCrashError('INTAKE-IDENTITY-MISMATCH', '恒等式断言失败：' + JSON.stringify(identityIssues), { crash_location: 'audit.ts:intake-identity', run_context: { repo_ref: ctx.repoRef, run_id: ctx.traceId }, counts: { commits_seen: probes.commitCount, facts_written: factsWritten, quarantined_written: eventsWritten } });
  }

  const report = buildReport(reportInput);
  const reportMd = renderMarkdown(report) + NL;
  const sidecarJson = renderSidecar(report) + NL;
  let artifacts: AuditResult['artifacts'] = null;
  writeFileSync(join(outDir, 'report.md'), reportMd, 'utf8');
  writeFileSync(join(outDir, 'report.json'), sidecarJson, 'utf8');
  writeFileSync(join(outDir, FACTS_NAME), col.realFacts.map(function (f) { return JSON.stringify(f); }).join(NL) + NL, 'utf8');
  artifacts = persistOut ? { report_md: join(outDir, 'report.md'), report_json: join(outDir, 'report.json'), facts_jsonl: join(outDir, FACTS_NAME), measurements: join(outDir, MEAS_NAME), duckdb: dbPath } : null;
  const resultOutDir = persistOut ? outDir : null;
  if (!persistOut) { rmSync(outDir, { recursive: true, force: true }); }

  return {
    report_id: report.report_id,
    receipt_id: report.receipt.receipt_id,
    scale: report.scale,
    stability: report.stability,
    capabilities: report.capabilities,
    overall_verdict: report.overall_verdict,
    verdict: report.verdict,
    intake_quarantine: { quarantined: intakeHealth.fields.reduce(function (s, f) { return s + f.quarantined; }, 0), normalized: intakeHealth.fields.reduce(function (s, f) { return s + f.normalized; }, 0), affected_commits: intakeHealth.affected_commits, escalation: intakeHealth.escalation, facts_persisted: !anchorQuarantined },
    degraded_mode: report.degraded_mode,
    head_sha: probes.headSha,
    tree_sha: probes.treeSha,
    commit_count: probes.commitCount,
    adr_count: ev.tc2.total,
    fact_count: col.realFacts.length,
    repo_name: NAME,
    resolved_root: repoRoot,
    intake_kind: intake.kind,
    snapshot_fetched_at: intake.snapshot_fetched_at,
    cache_hit: intake.cache_hit,
    refreshed: intake.refreshed,
    codelore: { resolved: col.codeloreResolution !== null, pinned: col.codeloreResolution ? col.codeloreResolution.pinned : false, version: col.codeloreResolution ? col.codeloreResolution.version : null },
    out_dir: resultOutDir,
    artifacts: artifacts,
    report_markdown: reportMd,
    sidecar_json: sidecarJson,
    measurements: measurements
  };
}
