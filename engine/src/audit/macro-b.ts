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
import { collectFileLineage, gitRenameLogArgs, parseRenameLogZ, RENAME_DEFAULT_THRESHOLD, RENAME_DETECTOR_VERSION } from '../collect/file-lineage.js';
// %cI 契约=normalizeGitIsoDate 同族判定本体（契约层分类器 classifyGitIsoField 承载，见 quarantine.ts）
// #81/D-128：git 版本方言（+00:00↔Z）由 absorbGitIsoDialect 在边界先行吸收——分类器只见规范流。
import { classifyGitIsoField, recordFieldInstance, emptyFieldStat, protocolCrashError, absorbGitIsoDialect, FIELD_HEAD_DATE, FIELD_COMMITTER_DATE } from '../intake/quarantine.js';
import type { FieldStatus, FieldEvent, FieldStat, DialectAbsorption } from '../intake/quarantine.js';

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

export interface ParsedCommit { sha: string; author: string; date: string | null; paths: string[] }
// date=null=字段级病态 quarantined 置位（D-100② null=毒值——消费方显式跳过禁当 0）。

// 方言吸收事件载体（D-128④ 独立披露面）：逐实例留痕（字段/sha/规则/原文→规范形）——
// 不进 fieldEvents/quarantine_log/Intake Health，仅由消费面汇进 run 元数据披露块。
export interface DialectAbsorptionEvent extends DialectAbsorption {
  field_name: string;
  commit_sha: string;
}

export interface MacroBProbes {
  headSha: string;
  headDate: string | null;  // 锚字段合法值；quarantined→null（headRaw 保原始字节进 traceId 哈希，D-108①）
  headRaw: string;
  headStatus: FieldStatus;
  treeSha: string;
  commitCount: number;
  commits: ParsedCommit[];
  subjects: string[];
  fieldEvents: FieldEvent[];   // normalized+quarantined 处置事件（clean 不记——恒等式 clean=total−事件行）
  fieldStats: FieldStat[];     // 逐字段实例三桶（head_date 基数 1＋committer_date 基数 commitCount）
  dialectAbsorptions: DialectAbsorptionEvent[];  // 边界层方言吸收事件（观测仪器等价拼写差——非主体病态）
}

// git 探针＋log 解析（PROBE-INVARIANT：解析完整性先断言）。
// %cI 两级分流（ADR-0022/D-100③）：记录形状坏（__R__ 行 ≠3 字段——嵌定界符/截断行）=协议级违约
//   fail-fast 落崩溃桶工件；字段值语义非法=字段级病态 → classifyGitIsoField 三态（永不 throw）
//   → quarantined 置 null＋事件留痕，管线继续。normalizeGitIsoDate 判定本体同族（抛型回执留给旧调用方）。
// 边界归一（#81/D-128②）：git 版本方言 +00:00↔Z 由 absorbGitIsoDialect 在分类器上游吸收——
//   分类器只见规范流（normalized 桶收窄=主体自载语义归一专用）；吸收事件落 dialectAbsorptions 独立披露。
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

// 采集环境探针（D-128④ 双轴披露轴二：仪器元数据与测量值强制分离——OTel Resource 先例）。
// 如实降级：git 二进制缺席→'unknown'（与 file-lineage 探测同口径）。
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
  codelore: 'off' | 'auto';   // auto=resolveCodelore 决议→行为三面采集；缺席/不 pin→如实降级（resolution 事实留痕）
  fileLineage?: { mode: 'on' | 'off'; threshold?: string; runner?: RenameLogRunner };   // on=确定性 rename 检测（git log --name-status -z -M）→file.renamed 血缘事实；audit=on demo=off（保合成仓逐字节确定性）
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
  // -- ADR 语料（adr-structure@v2 回退链） --
  const adrDir = join(repoRoot, 'docs', 'adr');
  const adrFiles = existsSync(adrDir) ? readdirSync(adrDir).filter(function (f) { return /^\d{3,}.*\.md$/i.test(f); }).sort() : [];
  const firstCommitOf = function (p: string): string | null {
    let best: string | null = null;
    for (const c of probes.commits) { if (c.date !== null && c.paths.indexOf(p) >= 0 && (best === null || c.date < best)) { best = c.date; } }
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

  // -- file_renamed 血缘事实（#80 步① / D-125：检测参数入载荷可复算；audit=on demo=off） --
  // Micro-B grain：scale=Micro-B（subject=规范化 file path——粒度分类按 subject 非 run，D-124）。
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
    fileLineageFacts: fileLineageFacts,
    realFacts: adrFacts.concat(posFacts, gitFacts, codeloreFacts, fileLineageFacts),
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
// headDate=null（锚病态 quarantined）→ traceId 哈希改用锚字段原始字节（D-108①：锚病态哈希 raw bytes
// 保持确定性）；observedAt 不落伪值——哨兵串 'quarantined(...)' 标记，audit_fact.observed_at
// NOT NULL 无法满足故该 run 跳过 fact 落库（quarantine_log 行仍写，recorded_at=NULL 合法）。
export function macroBContext(runIdLabel: string, ctxLabel: string, headSha: string, headDate: string | null, headRaw?: string): CollectContext {
  const anchor = headDate === null ? 'quarantined:' + sha256Hex(headRaw === undefined ? '' : headRaw) : headDate;
  return {
    runId: runIdLabel + '-' + headSha.slice(0, 7),
    traceId: sha256Hex(ctxLabel + '|' + headSha + '|' + anchor).slice(0, 32),
    repoRef: ctxLabel + '@' + headSha,
    scale: 'Macro-B',
    observedAt: headDate === null ? 'quarantined(anchor_head_date_malformed)' : headDate
  };
}
