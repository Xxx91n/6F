// audit/macro-b.ts — 单仓四象限档审计核心管线：将单次执行拆解为引擎内的共享流程，
// 供真实审计命令与演示场景共同复用（收仓→git 探针检查→采集器与行为指标→事实表写入→报告骨架渲染）。
// 流程包括：
//   1. 仓库基本信息与提交日志探测
//   2. 架构决策记录、提交记录、定位与行为面数据采集
//   3. 事前写死规则的判据评估（正对照、负对照、真判据）
// 最终由调用方完成报告渲染组装。
// 原则：对仓库目录保持只读操作；演示场景关闭外部依赖以保证产物完全一致。

import { execFileSync } from 'node:child_process';
import { collectAdrStructureV2, collectAdrStructure, collectGitlog, collectPositioning, sha256Hex, ADR_FIVE_PIECE } from '../collect/collectors.js';
import { readRepoFileSafe, listAdrFilesSafe, probeRepoEntry, makeFileSubjectSkipFact } from './safe-read.js';
import type { CollectContext, CollectedFact } from '../collect/collectors.js';
import { collectCodeloreFacets, CODELORE_BEHAVIOR_FACETS } from '../upstream/codelore.js';
import type { CodeloreFacetSpec } from '../upstream/codelore.js';
import { collectFileLineage, gitRenameLogArgs, parseRenameLogZ, RENAME_DEFAULT_THRESHOLD, RENAME_DETECTOR_VERSION } from '../collect/file-lineage.js';
// 检查 git 时间戳格式，上游先吸收等价格式差异，确保校验时格式标准。
import { classifyGitIsoField, recordFieldInstance, emptyFieldStat, protocolCrashError, absorbGitIsoDialect, FIELD_HEAD_DATE, FIELD_COMMITTER_DATE } from '../intake/quarantine.js';
import type { FieldStatus, FieldEvent, FieldStat, DialectAbsorption } from '../intake/quarantine.js';

const NL = String.fromCharCode(10);

// ---------- 事前约定的判据门槛（跑前固定，跑完不许改动） ----------
// 理由：首报验收包含形式、内容和信任三道关，判据门槛必须在跑之前写死，跑完严禁为了凑结果而调整。
export const TC1_LAG_DAYS = 90;
export const TC1_RATIO_RED = 0.20;
export const TC1_MIN_N = 5;
export const TC2_MEAN_RED = 0.60;
export const TC2_FIELD_MISSING_RED = 0.50;
export const TC3_RED = 0.50;
export const TC3_GREEN = 0.70;
export const TC3_TOPN = 20;

// 定位分析中忽略的高频通用停用词表
export const MACRO_B_STOPWORDS: readonly string[] = ['the', 'and', 'for', 'with', 'that', 'this', 'from', 'into', 'per', 'via', 'not', 'all', 'any', 'are', 'was', 'were', 'has', 'have', 'had', 'its', 'but', 'can', 'may', 'our', 'out', 'over', 'under', 'when', 'which', 'will', 'would', 'should', 'must', 'such', 'than', 'then', 'they', 'them', 'their', 'there', 'here', 'each', 'both', 'same', 'more', 'most', 'some', 'only', 'also', 'been', 'being', 'does', 'did', 'done', '的', '了', '是', '在', '和', '与', '及', '或', '为', '以', '对', '从', '到', '被', '把', '给', '让', '使', '等', '就', '都', '也', '还', '很', '更', '最', '要', '会', '能', '可', '将', '已', '未', '无', '非', '个', '中', '上', '下', '之', '其', '此', '该', '由', '而', '但', '则', '若', '如', '于', '所', '有', '这', '那', '不', '一', '二', '三', '的的', '了的', '是在', '和的', '与的', '为的', '对的', '中的', '上的', '下的', '之中', '一个', '这个', '那个', '我们', '他们', '可以', '因为', '所以', '但是', '如果', '通过', '进行', '以及', '并且', '从而', '因此', '其中', '对应', '相关', '分别', '同时', '之后', '之前', '以内', '以上', '以下'];
// ---------- 正对照与负对照样例数据（验证采集与判定通道是否正常工作） ----------
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

export interface ParsedCommit { sha: string; author: string; date: string | null; paths: string[] }
// date 为 null 表示该字段存在问题被隔离，消费方遇到时明确跳过，不当成有效时间。

// 记录格式吸收事件：说明不同工具版本带来的等义拼写差异，仅作补充披露，不计入字段异常。
export interface DialectAbsorptionEvent extends DialectAbsorption {
  field_name: string;
  commit_sha: string;
}

export interface MacroBProbes {
  headSha: string;
  headDate: string | null;  // HEAD 提交时间；若异常则为 null 并记录原始字节
  headRaw: string;
  headStatus: FieldStatus;
  treeSha: string;
  commitCount: number;
  commits: ParsedCommit[];
  subjects: string[];
  fieldEvents: FieldEvent[];   // 字段修复与隔离处置记录
  fieldStats: FieldStat[];     // 字段统计情况
  dialectAbsorptions: DialectAbsorptionEvent[];  // 工具写法差异的吸收记录
}

// 探测仓库信息与解析日志：
// 严重格式错误直接报错中断；单个字段内容有缺陷则记录原因并隔离，保证审计流程继续推进。
export type GitProbeRunner = (repoRoot: string, args: readonly string[]) => string;
export function probeMacroBRepo(repoRoot: string, headSha: string, opts?: { gitRunner?: GitProbeRunner }): MacroBProbes {
  const run: GitProbeRunner = opts && opts.gitRunner ? opts.gitRunner : git;
  const fieldStats: FieldStat[] = [emptyFieldStat(FIELD_HEAD_DATE), emptyFieldStat(FIELD_COMMITTER_DATE)];
  const fieldEvents: FieldEvent[] = [];
  const dialectAbsorptions: DialectAbsorptionEvent[] = [];
  let headRaw = '';
  let treeSha = '';
  let commitCount = 0;
  let rawLog = '';
  try {
    headRaw = run(repoRoot, ['log', '-1', '--format=%cI']);
    treeSha = run(repoRoot, ['rev-parse', 'HEAD^{tree}']);
    commitCount = Number(run(repoRoot, ['rev-list', '--count', 'HEAD']));
    rawLog = run(repoRoot, ['log', '--pretty=format:__R__%H|%an|%cI', '--name-only']);
  } catch (e) {
    const ee = e as { stderr?: Buffer | string };
    throw protocolCrashError('GIT-PROBE-FAILED', 'git 只读子命令失败：' + String((e as Error).message || e).split(NL)[0], {
      raw: ee && ee.stderr ? String(ee.stderr) : null,
      crash_location: 'audit/macro-b.ts:probeMacroBRepo',
      run_context: { repo_ref: repoRoot, commit_sha: headSha }
    });
  }
  const headAbs = absorbGitIsoDialect(headRaw);
  if (headAbs.absorption) { dialectAbsorptions.push({ field_name: FIELD_HEAD_DATE, commit_sha: headSha, rule_id: headAbs.absorption.rule_id, raw: headAbs.absorption.raw, canonical: headAbs.absorption.canonical }); }
  const headCls = classifyGitIsoField(headAbs.value, { anchor: true });
  recordFieldInstance(fieldStats[0], fieldEvents, headCls, headSha, FIELD_HEAD_DATE);
  const headDate = headCls.value;
  const commits: ParsedCommit[] = [];
  let cur: ParsedCommit | null = null;
  for (const line of rawLog.split(NL)) {
    const t = line.trim();
    if (t.indexOf('__R__') === 0) {
      const parts = t.slice(5).split('|');
      if (parts.length !== 3) {
        throw protocolCrashError('GITCLI-OUTPUT-CONTRACT', 'git log 记录形状违约：期望 3 字段实得 ' + parts.length + '（嵌定界符/记录截断→字段不可定界=协议级违约，D-100①）', {
          raw: t,
          crash_location: 'audit/macro-b.ts:probeMacroBRepo:log-parse',
          run_context: { repo_ref: repoRoot, commit_sha: parts.length > 0 ? parts[0] : null },
          counts: { commits_seen: commits.length }
        });
      }
      const abs = absorbGitIsoDialect(parts[2]);
      if (abs.absorption) { dialectAbsorptions.push({ field_name: FIELD_COMMITTER_DATE, commit_sha: parts[0], rule_id: abs.absorption.rule_id, raw: abs.absorption.raw, canonical: abs.absorption.canonical }); }
      const cls = classifyGitIsoField(abs.value);
      cur = { sha: parts[0], author: parts[1], date: cls.value, paths: [] };
      recordFieldInstance(fieldStats[1], fieldEvents, cls, parts[0], FIELD_COMMITTER_DATE);
      commits.push(cur);
    } else if (cur && t.length > 0) {
      cur.paths.push(t);
    }
  }
  if (commits.length !== commitCount) {
    throw protocolCrashError('PROBE-INVARIANT-FAIL', '[' + repoRoot + ']: parsed ' + commits.length + ' != git rev-list ' + commitCount, {
      crash_location: 'audit/macro-b.ts:probeMacroBRepo:invariant',
      run_context: { repo_ref: repoRoot, commit_sha: headSha },
      counts: { commits_seen: commits.length }
    });
  }
  let subjects: string[];
  try {
    subjects = run(repoRoot, ['log', '--pretty=format:%s']).split(NL);
  } catch (e) {
    const ee = e as { stderr?: Buffer | string };
    throw protocolCrashError('GIT-PROBE-FAILED', 'git %s 探针失败：' + String((e as Error).message || e).split(NL)[0], {
      raw: ee && ee.stderr ? String(ee.stderr) : null,
      crash_location: 'audit/macro-b.ts:probeMacroBRepo:subjects',
      run_context: { repo_ref: repoRoot, commit_sha: headSha },
      counts: { commits_seen: commits.length, records_parsed: commits.length }
    });
  }
  return { headSha: headSha, headDate: headDate, headRaw: headRaw, headStatus: headCls.status, treeSha: treeSha, commitCount: commitCount, commits: commits, subjects: subjects, fieldEvents: fieldEvents, fieldStats: fieldStats, dialectAbsorptions: dialectAbsorptions };
}

// 获取 git 客户端版本，若未安装或执行失败则返回 'unknown'
export function probeGitVersion(): string {
  try { return execFileSync('git', ['--version'], { encoding: 'utf8' }).trim(); } catch { return 'unknown'; }
}

export type RenameLogRunner = (repoRoot: string, args: readonly string[]) => string;

const defaultRenameLogRunner: RenameLogRunner = function (repoRoot, args) { return git(repoRoot, args); };

export interface MacroBCollectSpec {
  intentCandidates: readonly string[];
  nc1Candidates: readonly string[];
  stopwords: readonly string[];
  topN: number;
  codelore: 'off' | 'auto';   // auto 表示自动解析并采集行为三面，若缺少外部工具则如实记录跳过
  extraCodeloreFacets?: readonly CodeloreFacetSpec[];   // 附加分析项列表
  fileLineage?: { mode: 'on' | 'off'; threshold?: string; runner?: RenameLogRunner };   // 是否检测文件改名记录
  fixtureTag: string;         // 对照夹具标识
  pc2Sha: string;             // PC-2 对照提交哈希
}

export interface MacroBCollect {
  adrFiles: string[];
  intentDocs: { path: string; text: string }[];
  nc1Path: string;
  adrFacts: CollectedFact[];
  gitFacts: CollectedFact[];
  posFacts: CollectedFact[];
  codeloreFacts: CollectedFact[];
  fileLineageFacts: CollectedFact[];
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
  const skipFacts: CollectedFact[] = [];
  const skipSeen = new Set<string>();
  const pushSkip = function (f: CollectedFact): void { if (!skipSeen.has(f.fact_id)) { skipSeen.add(f.fact_id); skipFacts.push(f); } };
  // -- ADR 目录扫描与读取 --
  // 采用安全目录遍历，若目录被链接到外部则直接拒绝并记录事实
  const ADR_REL_DIR = 'docs/adr';
  const adrListing = listAdrFilesSafe(repoRoot, ADR_REL_DIR);
  if (!adrListing.ok && adrListing.reason !== 'missing') {
    pushSkip(makeFileSubjectSkipFact(ctx, ADR_REL_DIR, adrListing.reason));
  }
  const rawAdrFiles = adrListing.ok ? adrListing.files : [];
  const firstCommitOf = function (p: string): string | null {
    let best: string | null = null;
    for (const c of probes.commits) { if (c.date !== null && c.paths.indexOf(p) >= 0 && (best === null || c.date < best)) { best = c.date; } }
    return best;
  };
  const adrDocs: { path: string; text: string; first_commit_date: string | null }[] = [];
  const adrFiles: string[] = [];
  for (const f of rawAdrFiles) {
    const rel = 'docs/adr/' + f;
    const readRes = readRepoFileSafe(repoRoot, rel);
    if (!readRes.ok) {
      pushSkip(makeFileSubjectSkipFact(ctx, rel, readRes.reason));
      continue;
    }
    adrFiles.push(f);
    adrDocs.push({ path: rel, text: readRes.text, first_commit_date: firstCommitOf(rel) });
  }
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

  // -- 定位分析（意图来源与实际提交内容比对） --
  const intentDocs: { path: string; text: string }[] = [];
  for (const cand of spec.intentCandidates) {
    // 检查文件存在性，符号链接交由安全读取检查，不存在则跳过
    if (probeRepoEntry(repoRoot, cand) === 'absent') { continue; }
    const readRes = readRepoFileSafe(repoRoot, cand);
    if (!readRes.ok) {
      pushSkip(makeFileSubjectSkipFact(ctx, cand, readRes.reason));
    } else {
      intentDocs.push({ path: cand, text: readRes.text });
    }
  }
  const deliveryDocs = [{ path: 'git log subjects @ ' + probes.headSha.slice(0, 7), text: probes.subjects.join(NL) }];
  const posFacts = intentDocs.length > 0
    ? collectPositioning({ intentDocs: intentDocs, deliveryDocs: deliveryDocs, topN: spec.topN, stopwords: spec.stopwords }, ctx)
    : [];

  // -- codelore 行为面指标采集 --
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

  // -- 文件改名记录事实采集 --
  let fileLineageFacts: CollectedFact[] = [];
  if (spec.fileLineage && spec.fileLineage.mode === 'on') {
    const threshold = spec.fileLineage.threshold || RENAME_DEFAULT_THRESHOLD;
    const runner = spec.fileLineage.runner || defaultRenameLogRunner;
    const gitVersion = probeGitVersion();
    const rawLog = runner(repoRoot, gitRenameLogArgs(threshold));
    fileLineageFacts = collectFileLineage({
      edges: parseRenameLogZ(rawLog),
      headSha: probes.headSha,
      threshold: threshold,
      detectorVersion: RENAME_DETECTOR_VERSION,
      gitVersion: gitVersion
    }, { runId: ctx.runId, traceId: ctx.traceId, repoRef: ctx.repoRef, scale: 'Micro-B', observedAt: ctx.observedAt });
  }

  // -- 正对照验证（验证分析管线处于正常工作状态） --
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

  // -- 负对照验证（选取非 ADR 文件，预期无法解析出 ADR 结构） --
  let nc1Path: string | null = null;
  let nc1Text: string | null = null;
  for (const cand of spec.nc1Candidates) {
    if (probeRepoEntry(repoRoot, cand) === 'absent') { continue; }
    const r = readRepoFileSafe(repoRoot, cand);
    if (!r.ok) {
      pushSkip(makeFileSubjectSkipFact(ctx, cand, r.reason));
    } else {
      nc1Path = cand;
      nc1Text = r.text;
      break;
    }
  }
  if (!nc1Path || nc1Text === null) { throw new Error('NC1-CANDIDATE-MISS[' + repoRoot + ']'); }
  const nc1Facts = collectAdrStructure({ documents: [{ path: nc1Path, text: nc1Text }] }, ctx);
  const nc1Five = nc1Facts.find(function (f) { return f.metric === 'adr.five_piece_completeness'; });
  const nc1Sup = nc1Facts.find(function (f) { return f.metric === 'adr.supersede_link_present'; });
  const nc1 = { path: nc1Path, fact_count: nc1Facts.length, five_piece_present: nc1Five ? JSON.parse(nc1Five.value_json).present : -1, supersede_present: nc1Sup ? JSON.parse(nc1Sup.value_json).present : null, pass: false };
  nc1.pass = nc1.fact_count > 0 && nc1.five_piece_present === 0 && nc1.supersede_present === false;

  return {
    adrFiles: adrFiles, intentDocs: intentDocs, nc1Path: nc1Path,
    adrFacts: adrFacts.concat(skipFacts),
    gitFacts: gitFacts, posFacts: posFacts, codeloreFacts: codeloreFacts,
    fileLineageFacts: fileLineageFacts,
    realFacts: adrFacts.concat(skipFacts, posFacts, gitFacts, codeloreFacts, fileLineageFacts),
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

// 实际判据评估：依据事前约定规则计算各项指标
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

// 构建上下文标识：包含运行标识、追踪标识与仓库标识。
// 若提交时间异常，则使用原始字节哈希确保结果固定，不填入伪造时间。
export function macroBContext(runIdLabel: string, ctxLabel: string, headSha: string, headDate: string | null, headRaw?: string, scale: string = 'Macro-B'): CollectContext {
  const anchor = headDate === null ? 'quarantined:' + sha256Hex(headRaw === undefined ? '' : headRaw) : headDate;
  return {
    runId: runIdLabel + '-' + headSha.slice(0, 7),
    traceId: sha256Hex(ctxLabel + '|' + headSha + '|' + anchor).slice(0, 32),
    repoRef: ctxLabel + '@' + headSha,
    scale: scale,
    observedAt: headDate === null ? 'quarantined(anchor_head_date_malformed)' : headDate
  };
}
