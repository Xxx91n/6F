// audit/macro-b.ts — Macro-B 单一管线函数（#53 / D-060④）：one-shot 装配语义提炼为引擎内共享链，
// audit 与 demo 共同消费（intake→git 探针→collectors＋codelore 面→facts→骨架渲染前置件）。
// 链 = probeMacroBRepo（git 探针＋%cI 归一化＋PROBE-INVARIANT）
//   → collectMacroB（adr-structure@v2＋gitlog＋positioning＋可选 codelore 行为面）
//   → evaluateMacroB（PC-1/PC-2 正对照＋NC-1 负对照＋TC-1/2/3 预声明阈值实测，跑后禁调）
// 渲染段由调用方 finalize（demo 保 byte-parity 组装自身契约面；audit 走 audit.ts 装配）。
// 纪律：本模块对 repoRoot 只读（git 只读子命令＋文件读）；codelore='auto' 仅 audit 传入，
//   demo 恒定 'off' 保合成仓逐字节确定性（codelore 实跑=环境相关，不进 golden 链）。

import { readFileSync, readdirSync, existsSync } from 'node:fs';
import { join } from 'node:path';
import { execFileSync } from 'node:child_process';
import { collectAdrStructureV2, collectAdrStructure, collectGitlog, collectPositioning, sha256Hex, ADR_FIVE_PIECE } from '../collect/collectors.js';
import type { CollectContext, CollectedFact } from '../collect/collectors.js';
import { collectCodeloreFacets, CODELORE_BEHAVIOR_FACETS } from '../upstream/codelore.js';
import { normalizeGitIsoDate } from '../intake/intake.js';

const NL = String.fromCharCode(10);

// ---------- 预声明阈值（与 reports/22-criteria-pre-registration.md 逐字同源，跑后禁调） ----------
export const TC1_LAG_DAYS = 90;
export const TC1_RATIO_RED = 0.20;
export const TC1_MIN_N = 5;
export const TC2_MEAN_RED = 0.60;
export const TC2_FIELD_MISSING_RED = 0.50;
export const TC3_RED = 0.50;
export const TC3_GREEN = 0.70;
export const TC3_TOPN = 20;

// stopwords 与 22-threshold-raw.json#tc3_s1_coverage.stopwords 同源快照（引擎自含，不读 .scratch）
export const MACRO_B_STOPWORDS: readonly string[] = ['the', 'and', 'for', 'with', 'that', 'this', 'from', 'into', 'per', 'via', 'not', 'all', 'any', 'are', 'was', 'were', 'has', 'have', 'had', 'its', 'but', 'can', 'may', 'our', 'out', 'over', 'under', 'when', 'which', 'will', 'would', 'should', 'must', 'such', 'than', 'then', 'they', 'them', 'their', 'there', 'here', 'each', 'both', 'same', 'more', 'most', 'some', 'only', 'also', 'been', 'being', 'does', 'did', 'done', '的', '了', '是', '在', '和', '与', '及', '或', '为', '以', '对', '从', '到', '被', '把', '给', '让', '使', '等', '就', '都', '也', '还', '很', '更', '最', '要', '会', '能', '可', '将', '已', '未', '无', '非', '个', '中', '上', '下', '之', '其', '此', '该', '由', '而', '但', '则', '若', '如', '于', '所', '有', '这', '那', '不', '一', '二', '三', '的的', '了的', '是在', '和的', '与的', '为的', '对的', '中的', '上的', '下的', '之中', '一个', '这个', '那个', '我们', '他们', '可以', '因为', '所以', '但是', '如果', '通过', '进行', '以及', '并且', '从而', '因此', '其中', '对应', '相关', '分别', '同时', '之后', '之前', '以内', '以上', '以下'];
// ---------- 正/负对照夹具（管线健康闸与被测仓无关；demo/audit 同源） ----------
export const GOLDEN_ADR = [
  '# ADR-9999: PC-1 golden fixture',
  '',
  '- Status: accepted',
  '- Date: 2026-09-13',
  '- Deciders: fixture',
  '- Ledger: D-000',
  '',
  '## Context',
  '',
  'fixture context.',
  '',
  '## Decision',
  '',
  'fixture decision.',
  '',
  '## Consequences',
  '',
  'fixture consequences; this supersedes ADR-0000.'
].join(NL);
export const POS_DECL = 'macro audit positioning convergence determinism traceability provenance fact table skeleton slice quadrant scale verdict gate receipt citation anchor';

function git(root: string, args: readonly string[]): string {
  return execFileSync('git', ['-C', root].concat(args as string[]), { encoding: 'utf8', maxBuffer: 256 * 1024 * 1024 }).trim();
}

export interface ParsedCommit { sha: string; author: string; date: string; paths: string[] }

export interface MacroBProbes {
  headSha: string;
  headDate: string;   // %cI 归一化后（+00:00→Z，#54/D-059①）
  treeSha: string;
  commitCount: number;
  commits: ParsedCommit[];
  subjects: string[];
}

// git 探针＋log 解析（PROBE-INVARIANT：解析完整性先断言）；%cI 输出全走 normalizeGitIsoDate。
export function probeMacroBRepo(repoRoot: string, headSha: string): MacroBProbes {
  const headDate = normalizeGitIsoDate(git(repoRoot, ['log', '-1', '--format=%cI']));
  const treeSha = git(repoRoot, ['rev-parse', 'HEAD^{tree}']);
  const commitCount = Number(git(repoRoot, ['rev-list', '--count', 'HEAD']));
  const rawLog = git(repoRoot, ['log', '--pretty=format:__R__%H|%an|%cI', '--name-only']);
  const commits: ParsedCommit[] = [];
  let cur: ParsedCommit | null = null;
  for (const line of rawLog.split(NL)) {
    const t = line.trim();
    if (t.indexOf('__R__') === 0) {
      const parts = t.slice(5).split('|');
      cur = { sha: parts[0], author: parts[1], date: normalizeGitIsoDate(parts[2]), paths: [] };
      commits.push(cur);
    } else if (cur && t.length > 0) {
      cur.paths.push(t);
    }
  }
  if (commits.length !== commitCount) { throw new Error('PROBE-INVARIANT-FAIL[' + repoRoot + ']: parsed ' + commits.length + ' != git rev-list ' + commitCount); }
  const subjects = git(repoRoot, ['log', '--pretty=format:%s']).split(NL);
  return { headSha: headSha, headDate: headDate, treeSha: treeSha, commitCount: commitCount, commits: commits, subjects: subjects };
}

export interface MacroBCollectSpec {
  intentCandidates: readonly string[];
  nc1Candidates: readonly string[];
  stopwords: readonly string[];
  topN: number;
  codelore: 'off' | 'auto';   // auto=resolveCodelore 决议→行为三面采集；缺席/不 pin→如实降级（resolution 事实留痕）
  fixtureTag: string;         // PC/NC 夹具路径前缀（demo='45'/audit='AUDIT'）——进 subject_ref→fact_id 哈希，调用方各保自身前缀防两链漂移
  pc2Sha: string;             // PC-2 夹具 commit sha（入 gitlog 输入→lag 事实哈希，同源纪律同上）
}

export interface MacroBCollect {
  adrFiles: string[];
  intentDocs: { path: string; text: string }[];
  nc1Path: string;
  adrFacts: CollectedFact[];
  gitFacts: CollectedFact[];
  posFacts: CollectedFact[];
  codeloreFacts: CollectedFact[];
  realFacts: CollectedFact[];
  pc1: { pass: boolean };
  pc2: { pass: boolean; delta_days: number | null };
  nc1: { path: string; fact_count: number; five_piece_present: number; supersede_present: boolean | null; pass: boolean };
  pc1AdrFacts: CollectedFact[];
  pc1PosFacts: CollectedFact[];
  pc2Lag: CollectedFact[];
  nc1Facts: CollectedFact[];
  codeloreResolution: { version: string | null; pinned: boolean; error: string | null } | null;
}

export function collectMacroB(repoRoot: string, spec: MacroBCollectSpec, ctx: CollectContext, probes: MacroBProbes): MacroBCollect {
  // -- ADR 语料（adr-structure@v2 回退链） --
  const adrDir = join(repoRoot, 'docs', 'adr');
  const adrFiles = existsSync(adrDir) ? readdirSync(adrDir).filter(function (f) { return /^\d{3,}.*\.md$/i.test(f); }).sort() : [];
  const firstCommitOf = function (p: string): string | null {
    let best: string | null = null;
    for (const c of probes.commits) { if (c.paths.indexOf(p) >= 0 && (best === null || c.date < best)) { best = c.date; } }
    return best;
  };
  const adrDocs = adrFiles.map(function (f) {
    const rel = 'docs/adr/' + f;
    return { path: rel, text: readFileSync(join(adrDir, f), 'utf8'), first_commit_date: firstCommitOf(rel) };
  });
  const adrPaths = adrDocs.map(function (d) { return d.path; });
  const adrFacts = collectAdrStructureV2({ documents: adrDocs }, ctx);
  const adrDateMap: Record<string, string> = {};
  for (const f of adrFacts) {
    if (f.metric === 'adr.decision_date') {
      const v = JSON.parse(f.value_json);
      if (v.date) { adrDateMap[f.subject_ref] = v.date.slice(0, 10); }
    }
  }
  const gitFacts = collectGitlog({ commits: probes.commits, paths: adrPaths, adrDates: adrDateMap }, ctx);

  // -- positioning（意图面=候选集存在者；交付面=git subjects） --
  const intentDocs: { path: string; text: string }[] = [];
  for (const cand of spec.intentCandidates) {
    const p = join(repoRoot, cand);
    if (existsSync(p)) { intentDocs.push({ path: cand, text: readFileSync(p, 'utf8') }); }
  }
  const deliveryDocs = [{ path: 'git log subjects @ ' + probes.headSha.slice(0, 7), text: probes.subjects.join(NL) }];
  const posFacts = intentDocs.length > 0
    ? collectPositioning({ intentDocs: intentDocs, deliveryDocs: deliveryDocs, topN: spec.topN, stopwords: spec.stopwords }, ctx)
    : [];

  // -- codelore 行为面（audit=auto；demo=off 保确定性） --
  let codeloreFacts: CollectedFact[] = [];
  let codeloreResolution: MacroBCollect['codeloreResolution'] = null;
  if (spec.codelore === 'auto') {
    codeloreFacts = collectCodeloreFacets({ repoRoot: repoRoot, facets: CODELORE_BEHAVIOR_FACETS }, ctx);
    const resFact = codeloreFacts.find(function (f) { return f.metric === 'upstream.resolution'; });
    if (resFact) {
      const v = JSON.parse(resFact.value_json);
      codeloreResolution = { version: v.version !== undefined ? v.version : null, pinned: v.pinned === true, error: v.error !== undefined ? v.error : null };
    }
  }

  // -- 正对照 PC-1 / PC-2（夹具与被测仓无关） --
  const pc1AdrFacts = collectAdrStructure({ documents: [{ path: 'fixtures/' + spec.fixtureTag + '-pc1-golden-adr.md', text: GOLDEN_ADR }] }, ctx);
  const pc1PosFacts = collectPositioning({ intentDocs: [{ path: 'fixtures/' + spec.fixtureTag + '-pc1-positioning.md', text: POS_DECL }], deliveryDocs: [{ path: 'fixtures/' + spec.fixtureTag + '-pc1-delivery.md', text: POS_DECL }], topN: spec.topN, stopwords: spec.stopwords }, ctx);
  const pc1Five = pc1AdrFacts.find(function (f) { return f.metric === 'adr.five_piece_completeness'; });
  const pc1Sup = pc1AdrFacts.find(function (f) { return f.metric === 'adr.supersede_link_present'; });
  const pc1 = { pass: pc1AdrFacts.length > 0 && pc1PosFacts.length > 0 && !!pc1Five && JSON.parse(pc1Five.value_json).present === 5 && !!pc1Sup && JSON.parse(pc1Sup.value_json).present === true };
  const PC2_PATH = 'fixtures/' + spec.fixtureTag + '-pc2-lag-adr.md';
  const pc2Commits = [{ sha: spec.pc2Sha, author: 'fixture', date: '2026-01-01T00:00:00+00:00', paths: [PC2_PATH] }];
  const pc2AdrDates: Record<string, string> = {}; pc2AdrDates[PC2_PATH] = '2026-09-13';
  const pc2Facts = collectGitlog({ commits: pc2Commits, paths: [PC2_PATH], adrDates: pc2AdrDates }, ctx);
  const pc2Lag = pc2Facts.filter(function (f) { return f.metric === 'git.adr_lag_days'; });
  const pc2 = { pass: pc2Lag.length > 0 && JSON.parse(pc2Lag[0].value_json).delta_days > 0, delta_days: pc2Lag.length > 0 ? JSON.parse(pc2Lag[0].value_json).delta_days : null };

  // -- 负对照 NC-1（被测仓内非 ADR 文件，五件套预期 0 命中） --
  let nc1Path: string | null = null;
  for (const cand of spec.nc1Candidates) { if (existsSync(join(repoRoot, cand))) { nc1Path = cand; break; } }
  if (!nc1Path) { throw new Error('NC1-CANDIDATE-MISS[' + repoRoot + ']'); }
  const nc1Facts = collectAdrStructure({ documents: [{ path: nc1Path, text: readFileSync(join(repoRoot, nc1Path), 'utf8') }] }, ctx);
  const nc1Five = nc1Facts.find(function (f) { return f.metric === 'adr.five_piece_completeness'; });
  const nc1Sup = nc1Facts.find(function (f) { return f.metric === 'adr.supersede_link_present'; });
  const nc1 = { path: nc1Path, fact_count: nc1Facts.length, five_piece_present: nc1Five ? JSON.parse(nc1Five.value_json).present : -1, supersede_present: nc1Sup ? JSON.parse(nc1Sup.value_json).present : null, pass: false };
  nc1.pass = nc1.fact_count > 0 && nc1.five_piece_present === 0 && nc1.supersede_present === false;

  return {
    adrFiles: adrFiles, intentDocs: intentDocs, nc1Path: nc1Path,
    adrFacts: adrFacts, gitFacts: gitFacts, posFacts: posFacts, codeloreFacts: codeloreFacts,
    realFacts: adrFacts.concat(posFacts, gitFacts, codeloreFacts),
    pc1: pc1, pc2: pc2, nc1: nc1,
    pc1AdrFacts: pc1AdrFacts, pc1PosFacts: pc1PosFacts, pc2Lag: pc2Lag, nc1Facts: nc1Facts,
    codeloreResolution: codeloreResolution
  };
}

export interface Tc1Result { judgeable_n: number; backfill_n: number; ratio: number; verdict: 'INCONCLUSIVE' | 'RED' | 'NOT_RED' }
export interface Tc2Result { total: number; mean_ratio: number; missing_counts: Record<string, number>; missing_ratio: Record<string, number>; cond_a: boolean; cond_b: boolean; verdict: 'RED' | 'NOT_RED' }
export interface Tc3Source { subject: string; value: { ratio: number; hit: number; keywords: number }; fact_id: string }
export interface Tc3Result { per_source: Tc3Source[]; lowest_path: string | null; lowest_ratio: number; verdict: 'INCONCLUSIVE' | 'RED' | 'AMBER' | 'GREEN' }

export interface MacroBEval {
  tc1: Tc1Result;
  tc2: Tc2Result;
  tc3: Tc3Result;
  covFacts: Tc3Source[];
  lagFactIds: string[];
  fiveFactIds: string[];
}

// 真判据 TC-1/TC-2/TC-3（预声明阈值实测）
export function evaluateMacroB(collect: MacroBCollect): MacroBEval {
  const lagValues = collect.gitFacts.filter(function (f) { return f.metric === 'git.adr_lag_days'; }).map(function (f) { return JSON.parse(f.value_json); });
  const tc1Judgeable = lagValues.length;
  const tc1Backfill = lagValues.filter(function (v: { delta_days: number }) { return v.delta_days > TC1_LAG_DAYS; }).length;
  const tc1Ratio = tc1Judgeable === 0 ? 0 : tc1Backfill / tc1Judgeable;
  const tc1Verdict = tc1Judgeable < TC1_MIN_N ? 'INCONCLUSIVE' : (tc1Ratio > TC1_RATIO_RED ? 'RED' : 'NOT_RED');
  const fiveValues = collect.adrFacts.filter(function (f) { return f.metric === 'adr.five_piece_completeness'; }).map(function (f) { return JSON.parse(f.value_json); });
  const tc2Total = fiveValues.length;
  const tc2Mean = tc2Total === 0 ? 0 : fiveValues.reduce(function (s: number, v: { ratio: number }) { return s + v.ratio; }, 0) / tc2Total;
  const tc2Missing: Record<string, number> = {};
  for (const k of ADR_FIVE_PIECE) { tc2Missing[k] = 0; }
  for (const v of fiveValues) { for (const k of v.missing as string[]) { tc2Missing[k] = tc2Missing[k] + 1; } }
  const tc2MissingRatio: Record<string, number> = {};
  for (const k of Object.keys(tc2Missing)) { tc2MissingRatio[k] = tc2Total === 0 ? 0 : tc2Missing[k] / tc2Total; }
  const tc2CondA = tc2Mean < TC2_MEAN_RED;
  let tc2CondB = false;
  for (const k of Object.keys(tc2MissingRatio)) { if (tc2MissingRatio[k] > TC2_FIELD_MISSING_RED) { tc2CondB = true; } }
  const tc2Verdict = (tc2CondA || tc2CondB) ? 'RED' : 'NOT_RED';
  const covFacts = collect.posFacts.filter(function (f) { return f.metric === 'positioning.keyword_coverage'; }).map(function (f) { return { subject: f.subject_ref, value: JSON.parse(f.value_json), fact_id: f.fact_id }; });
  let tc3Lowest: Tc3Source | null = null;
  for (const c of covFacts) { if (tc3Lowest === null || c.value.ratio < tc3Lowest.value.ratio) { tc3Lowest = c; } }
  const tc3Ratio = tc3Lowest ? tc3Lowest.value.ratio : 0;
  const tc3Verdict = collect.intentDocs.length === 0 ? 'INCONCLUSIVE' : (tc3Ratio < TC3_RED ? 'RED' : (tc3Ratio < TC3_GREEN ? 'AMBER' : 'GREEN'));
  return {
    tc1: { judgeable_n: tc1Judgeable, backfill_n: tc1Backfill, ratio: tc1Ratio, verdict: tc1Verdict },
    tc2: { total: tc2Total, mean_ratio: tc2Mean, missing_counts: tc2Missing, missing_ratio: tc2MissingRatio, cond_a: tc2CondA, cond_b: tc2CondB, verdict: tc2Verdict },
    tc3: { per_source: covFacts, lowest_path: tc3Lowest ? tc3Lowest.subject : null, lowest_ratio: tc3Ratio, verdict: tc3Verdict },
    covFacts: covFacts,
    lagFactIds: collect.gitFacts.filter(function (f) { return f.metric === 'git.adr_lag_days'; }).map(function (f) { return f.fact_id; }),
    fiveFactIds: collect.adrFacts.filter(function (f) { return f.metric === 'adr.five_piece_completeness'; }).map(function (f) { return f.fact_id; })
  };
}

export function tcBand(v: string): 'supported' | 'unsupported' | 'insufficient' {
  if (v === 'INCONCLUSIVE') { return 'insufficient'; }
  if (v === 'RED') { return 'unsupported'; }
  return 'supported';
}

// ctx 契约面：runIdLabel 进 runId（run 身份）；ctxLabel 进 traceId/repoRef（仓身份——demo=def.repo.name，
// audit=仓名）。两 label 分离原因：demo 原实现 runId 用 scenario、traceId/repoRef 用 repo.name，混并即漂哈希。
export function macroBContext(runIdLabel: string, ctxLabel: string, headSha: string, headDate: string): CollectContext {
  return {
    runId: runIdLabel + '-' + headSha.slice(0, 7),
    traceId: sha256Hex(ctxLabel + '|' + headSha + '|' + headDate).slice(0, 32),
    repoRef: ctxLabel + '@' + headSha,
    scale: 'Macro-B',
    observedAt: headDate
  };
}
