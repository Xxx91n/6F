// ---------- 上游适配器：CodeLore（ADR-0014 / D-020 双轨制主线） ----------
// 反腐层纪律：本文件只做「进程调用 + 原始输出解析」——退出码、字节解析、pin 校验在此；
// 业务规则（判据/阈值/裁决）禁止进入本层；上游 raw 语义不出本层（以结构化 fact 传出）。
// 运行时解析策略 = 二进制发现（binary discovery）：codelore 经 PATH 解析 + --version 校验 pin。

import { spawnSync } from 'node:child_process';
import type { CollectContext, CollectedFact, CollectorDescriptor } from '../collect/collectors.js';
import { makeFact } from '../collect/collectors.js';

export const CODELORE_ADAPTER_ID = 'codelore-adapter@v1';
export const CODELORE_FAMILY = 'upstream-codelore';
export const CODELORE_PINNED_VERSION = '0.28.0';

export const CODELORE_DESCRIPTOR: CollectorDescriptor = {
  id: CODELORE_ADAPTER_ID,
  family: CODELORE_FAMILY,
  dimension: null,
  quadrant: 'strategic'
};

export interface CodeloreResolution {
  strategy: 'binary-discovery';
  binary: string;
  version: string | null;
  pinned: boolean;
  error: string | null;
}

export function resolveCodelore(binary: string): CodeloreResolution {
  const bin = binary || 'codelore';
  const r = spawnSync(bin, ['--version'], { encoding: 'utf8' });
  if (r.error || r.status !== 0) {
    return { strategy: 'binary-discovery', binary: bin, version: null, pinned: false, error: String(r.error || ('exit ' + r.status)) };
  }
  const m = (r.stdout || '').match(/codelore\s+(\d+\.\d+\.\d+)/i);
  const version = m ? m[1] : null;
  return { strategy: 'binary-discovery', binary: bin, version: version, pinned: version === CODELORE_PINNED_VERSION, error: version ? null : 'version-parse-failed' };
}

function pushResolutionFact(out: CollectedFact[], ctx: CollectContext, res: CodeloreResolution): void {
  out.push(makeFact(ctx, CODELORE_DESCRIPTOR, 'codelore', 'codelore', 'upstream.resolution', {
    strategy: res.strategy,
    binary: res.binary,
    version: res.version,
    pinned_version: CODELORE_PINNED_VERSION,
    pinned: res.pinned,
    error: res.error
  }));
}

export interface ExplainDossier {
  sections: Record<string, Record<string, string>>;
}

// `codelore explain <file>` 的确定性输出 = INI 式 [section] + key = value 行。
export function parseExplainDossier(text: string): ExplainDossier {
  const sections: Record<string, Record<string, string>> = {};
  let cur: string | null = null;
  for (const raw of text.split('\n')) {
    const line = raw.trim();
    if (!line) continue;
    const sec = line.match(/^\[(.+)\]$/);
    if (sec) { cur = sec[1]; sections[cur] = sections[cur] || {}; continue; }
    const kv = line.match(/^([A-Za-z0-9_][A-Za-z0-9_.]*)\s*=\s*(.*)$/);
    if (kv && cur) { sections[cur][kv[1]] = kv[2].trim(); }
  }
  return { sections };
}

export interface SummaryMetric { metric: string; value: number }

export function parseSummaryJson(text: string): SummaryMetric[] {
  const arr = JSON.parse(text);
  if (!Array.isArray(arr)) { throw new Error('summary output is not an array'); }
  for (const m of arr) {
    if (typeof m.metric !== 'string' || typeof m.value !== 'number') {
      throw new Error('summary row shape drift: expected {metric:string,value:number}');
    }
  }
  return arr;
}

function runText(binary: string, args: readonly string[], cwd: string): { ok: boolean; stdout: string; stderr: string; status: number | null } {
  const r = spawnSync(binary, args as string[], { cwd: cwd, encoding: 'utf8', maxBuffer: 64 * 1024 * 1024 });
  return { ok: !r.error && r.status === 0, stdout: r.stdout || '', stderr: r.stderr || '', status: r.status };
}

export interface CodeloreProbeInput {
  repoRoot: string;
  explainPaths: readonly string[];
  binary?: string;
}

export function collectCodeloreFacts(input: CodeloreProbeInput, ctx: CollectContext): CollectedFact[] {
  const out: CollectedFact[] = [];
  const bin = input.binary || 'codelore';
  const res = resolveCodelore(bin);
  pushResolutionFact(out, ctx, res);
  if (res.error || !res.pinned) { return out; }

  const sum = runText(bin, ['analyze', '--analysis', 'summary', '--format', 'json', '--repo', input.repoRoot], input.repoRoot);
  if (sum.ok) {
    for (const m of parseSummaryJson(sum.stdout)) {
      out.push(makeFact(ctx, CODELORE_DESCRIPTOR, input.repoRoot, 'codelore analyze summary --format json', 'codelore.summary_metric', {
        metric: m.metric,
        value: m.value
      }));
    }
  } else {
    out.push(makeFact(ctx, CODELORE_DESCRIPTOR, input.repoRoot, 'codelore analyze summary', 'codelore.summary_error', {
      status: sum.status,
      stderr_tail: sum.stderr.slice(-400)
    }));
  }

  for (const p of input.explainPaths) {
    const ex = runText(bin, ['explain', p, '--repo', input.repoRoot], input.repoRoot);
    if (!ex.ok) {
      out.push(makeFact(ctx, CODELORE_DESCRIPTOR, p, 'codelore explain', 'codelore.explain_error', {
        status: ex.status,
        stderr_tail: ex.stderr.slice(-400)
      }));
      continue;
    }
    const d = parseExplainDossier(ex.stdout);
    out.push(makeFact(ctx, CODELORE_DESCRIPTOR, p, 'codelore explain ' + p, 'codelore.file_dossier', {
      path: p,
      sections: Object.keys(d.sections),
      dossier: d.sections
    }));
  }
  return out;
}

// ---------- 首批契约面（#35 / A-040 / D-035①）：逐面 golden 契约 ----------
// 面集 = 演化主干 12 + S3 族 6 + S5 族 12；面名以 `codelore analyze --help` 实物枚举对账（reports/35-facet-reconciliation.json）。
// LLM 面（explain 族 env 门控）不混入，归 #36 独立票；暂缓面集 ~20 面挂 registry manual_watch（D-035④）。
// 本层仍只做「进程调用 + 原始输出解析」：冻结 argv 属契约钉死（可观察输出即契约），任何判据/评级语义不进本层。

export type CodeloreFacetGroup = 'evolution' | 's3' | 's5';

export interface CodeloreFacetSpec {
  analysis: string;
  group: CodeloreFacetGroup;
  extraArgs: readonly string[];
}

// code-age 冻结参考时钟（--age-time-now）使重放可复现；messages 冻结检索表达式（契约 = argv 全体）。
export const CODELORE_BATCH1_FACETS: readonly CodeloreFacetSpec[] = [
  { analysis: 'revisions', group: 'evolution', extraArgs: [] },
  { analysis: 'abs-churn', group: 'evolution', extraArgs: [] },
  { analysis: 'entity-churn', group: 'evolution', extraArgs: [] },
  { analysis: 'author-churn', group: 'evolution', extraArgs: [] },
  { analysis: 'hotspot-velocity', group: 'evolution', extraArgs: [] },
  { analysis: 'code-age', group: 'evolution', extraArgs: ['--age-time-now', '2026-09-15'] },
  { analysis: 'stale-code', group: 'evolution', extraArgs: [] },
  { analysis: 'architecture-trend', group: 'evolution', extraArgs: [] },
  { analysis: 'health-trend', group: 'evolution', extraArgs: [] },
  { analysis: 'lead-time', group: 'evolution', extraArgs: [] },
  { analysis: 'release-cadence', group: 'evolution', extraArgs: [] },
  { analysis: 'messages', group: 'evolution', extraArgs: ['-e', '(?i)(fix|feat|docs)'] },
  { analysis: 'god-classes', group: 's3', extraArgs: [] },
  { analysis: 'architecture-metrics', group: 's3', extraArgs: [] },
  { analysis: 'dependency-cycles', group: 's3', extraArgs: [] },
  { analysis: 'modularity-violations', group: 's3', extraArgs: [] },
  { analysis: 'instability', group: 's3', extraArgs: [] },
  { analysis: 'architecture-roles', group: 's3', extraArgs: [] },
  { analysis: 'ownership', group: 's5', extraArgs: [] },
  { analysis: 'entity-ownership', group: 's5', extraArgs: [] },
  { analysis: 'bus-factor', group: 's5', extraArgs: [] },
  { analysis: 'main-dev', group: 's5', extraArgs: [] },
  { analysis: 'main-dev-by-revs', group: 's5', extraArgs: [] },
  { analysis: 'main-dev-by-deletions', group: 's5', extraArgs: [] },
  { analysis: 'knowledge-islands', group: 's5', extraArgs: [] },
  { analysis: 'communication', group: 's5', extraArgs: [] },
  { analysis: 'coordination-needs', group: 's5', extraArgs: [] },
  { analysis: 'team-composition', group: 's5', extraArgs: [] },
  { analysis: 'marginal-owner-risk', group: 's5', extraArgs: [] },
  { analysis: 'pair-programming', group: 's5', extraArgs: [] }
];

export interface CodeloreAnalysisRun {
  ok: boolean;
  status: number | null;
  stdout: string;
  stderrTail: string;
}

export function runCodeloreAnalysis(binary: string, spec: CodeloreFacetSpec, repoRoot: string): CodeloreAnalysisRun {
  const r = runText(binary, ['analyze', '--analysis', spec.analysis, '--format', 'json', '--repo', repoRoot].concat(spec.extraArgs as string[]), repoRoot);
  return { ok: r.ok, status: r.status, stdout: r.stdout, stderrTail: r.stderr.slice(-400) };
}

export type CodeloreRow = Record<string, unknown>;

// analyze --format json 的确定性输出 = 对象行数组；形状漂移（非数组/非对象行）直接抛错，不出假阳性。
export function parseJsonRows(text: string): CodeloreRow[] {
  const arr = JSON.parse(text);
  if (!Array.isArray(arr)) { throw new Error('analysis output is not an array'); }
  for (const row of arr) {
    if (row === null || typeof row !== 'object' || Array.isArray(row)) {
      throw new Error('analysis row shape drift: expected plain object row');
    }
  }
  return arr as CodeloreRow[];
}

export function facetColumns(rows: readonly CodeloreRow[]): string[] {
  return rows.length > 0 ? Object.keys(rows[0] as Record<string, unknown>) : [];
}

export type CodeloreAnalysisRunner = (binary: string, spec: CodeloreFacetSpec, repoRoot: string) => CodeloreAnalysisRun;
export type CodeloreResolver = (binary: string) => CodeloreResolution;

export interface CodeloreFacetsInput {
  repoRoot: string;
  facets?: readonly CodeloreFacetSpec[];
  binary?: string;
  runner?: CodeloreAnalysisRunner;
  resolver?: CodeloreResolver;
}

// 逐面采集：每面一条 codelore.facet_rows 事实（列清单 + 行数 + 结构化行原样传出）；
// 失败面降级为 codelore.facet_error / codelore.facet_parse_error，不中断其余面。
export function collectCodeloreFacets(input: CodeloreFacetsInput, ctx: CollectContext): CollectedFact[] {
  const out: CollectedFact[] = [];
  const bin = input.binary || 'codelore';
  const resolve = input.resolver || resolveCodelore;
  const runner = input.runner || runCodeloreAnalysis;
  const res = resolve(bin);
  pushResolutionFact(out, ctx, res);
  if (res.error || !res.pinned) { return out; }

  const facets = input.facets || CODELORE_BATCH1_FACETS;
  for (const spec of facets) {
    const evidence = 'codelore analyze --analysis ' + spec.analysis + ' --format json' + (spec.extraArgs.length > 0 ? ' ' + spec.extraArgs.join(' ') : '');
    const run = runner(bin, spec, input.repoRoot);
    if (!run.ok) {
      out.push(makeFact(ctx, CODELORE_DESCRIPTOR, spec.analysis, evidence, 'codelore.facet_error', {
        analysis: spec.analysis,
        group: spec.group,
        status: run.status,
        stderr_tail: run.stderrTail
      }));
      continue;
    }
    let rows: CodeloreRow[];
    try {
      rows = parseJsonRows(run.stdout);
    } catch (e) {
      out.push(makeFact(ctx, CODELORE_DESCRIPTOR, spec.analysis, evidence, 'codelore.facet_parse_error', {
        analysis: spec.analysis,
        group: spec.group,
        message: String((e as Error).message)
      }));
      continue;
    }
    out.push(makeFact(ctx, CODELORE_DESCRIPTOR, spec.analysis, evidence, 'codelore.facet_rows', {
      analysis: spec.analysis,
      group: spec.group,
      format: 'json',
      extra_args: spec.extraArgs,
      columns: facetColumns(rows),
      row_count: rows.length,
      rows: rows
    }));
  }
  return out;
}
